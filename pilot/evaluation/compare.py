"""Comparison harness for ASR approaches on the same evaluation corpus.

Approaches (configured, not all runnable without dependencies/credentials):
  A. browser_web_speech  - client/browser transcript capture (manual/ingested)
  B. local_faster_whisper - local faster-whisper if installed/model available
  C. cloud_provider      - cloud ASR via config/credentials (stub/template)

Runner behavior:
- Reads corpus manifest/clips, invokes configured approach adapters, records per-clip
  results (id, approach, hypothesis, reference, latency, status/error, version/settings).
- Never fabricates recognition accuracy. If an approach cannot run, it records status
  'unavailable'/'error' with reason; no hypothesis is invented.
- Designed to run on the same consented evaluation corpus when available.

Examples:
  python compare.py --corpus corpus --approaches browser_web_speech --out results/run.json
  python compare.py --corpus corpus --approaches local_faster_whisper --config config.local.json
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parent


@dataclass
class Clip:
    id: str
    audio: Path | None
    reference: str | None
    numbers_expected: list[str] | None
    fields_expected: dict[str, Any] | None
    consent: dict[str, Any] | None
    meta: dict[str, Any]


def load_corpus(corpus_dir: Path) -> tuple[list[Clip], dict]:
    manifest_path = corpus_dir / "manifest.json"
    manifest = {}
    clips: list[Clip] = []
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        entries = manifest.get("clips", [])
        for e in entries:
            audio = corpus_dir / e["audio"] if e.get("audio") else None
            ref = None
            if e.get("reference"):
                ref = (corpus_dir / e["reference"]).read_text(encoding="utf-8").strip()
            elif e.get("reference_text") is not None:
                ref = str(e["reference_text"])
            nums = e.get("numbers_expected")
            fields = e.get("fields_expected")
            if e.get("numbers_file"):
                nums = json.loads((corpus_dir / e["numbers_file"]).read_text(encoding="utf-8"))
            if e.get("fields_file"):
                fields = json.loads((corpus_dir / e["fields_file"]).read_text(encoding="utf-8"))
            clips.append(Clip(id=e["id"], audio=audio, reference=ref, numbers_expected=nums,
                              fields_expected=fields, consent=e.get("consent"), meta=e))
        return clips, manifest
    # Fallback: discover by convention <id>/audio.*, reference.txt etc.
    for d in sorted([p for p in corpus_dir.iterdir() if p.is_dir()]):
        audio = next((p for p in d.glob("audio.*") if p.suffix.lower() in {".wav",".mp3",".m4a",".webm",".ogg"}), None)
        refp = d / "reference.txt"
        nump = d / "numbers.expected.json"
        fieldp = d / "fields.expected.json"
        consentp = d / "consent.json"
        clips.append(Clip(
            id=d.name,
            audio=audio,
            reference=refp.read_text(encoding="utf-8").strip() if refp.exists() else None,
            numbers_expected=json.loads(nump.read_text(encoding="utf-8")) if nump.exists() else None,
            fields_expected=json.loads(fieldp.read_text(encoding="utf-8")) if fieldp.exists() else None,
            consent=json.loads(consentp.read_text(encoding="utf-8")) if consentp.exists() else None,
            meta={"dir": str(d)},
        ))
    return clips, manifest


def approach_browser_web_speech(clip: Clip, cfg: dict) -> dict:
    # Browser Web Speech API runs client-side; harness ingests captured transcripts.
    # Expect transcript in meta/captured_transcripts/<id>.txt or clip.meta['hypothesis'].
    hyp = clip.meta.get("hypothesis")
    timing_ms = clip.meta.get("recognition_latency_ms") or clip.meta.get("latency_ms")
    cap_dir = Path(cfg.get("captured_transcripts_dir", ROOT / "corpus" / "captured_transcripts"))
    cap = cap_dir / f"{clip.id}.txt"
    timing_cap = cap_dir / f"{clip.id}.timing.json"
    if timing_ms is None and timing_cap.exists():
        try:
            tdata = json.loads(timing_cap.read_text(encoding="utf-8"))
            timing_ms = tdata.get("recognition_latency_ms") or tdata.get("latency_ms")
        except Exception:
            timing_ms = None
    if hyp is None and cap.exists():
        hyp = cap.read_text(encoding="utf-8").strip()
    if hyp is None:
        return {"status": "unavailable", "error": "No client-captured transcript provided (browser Web Speech API produces transcripts in-browser; supply via manifest hypothesis or captured_transcripts/<id>.txt).", "hypothesis": None}
    res = {"status": "ok", "hypothesis": hyp, "engine": "browser-web-speech-capture"}
    # For imported transcripts, do not treat file-read time as recognition latency.
    # Use captured browser recognition timestamps only when explicitly provided.
    if timing_ms is not None:
        try:
            res["latency_ms"] = float(timing_ms)
            res["latency_source"] = "captured_browser_recognition"
        except Exception:
            res["latency_ms"] = None
            res["latency_unavailable"] = True
            res["latency_note"] = "Imported transcript: recognition latency unavailable (no valid captured timing)."
    else:
        res["latency_ms"] = None
        res["latency_unavailable"] = True
        res["latency_note"] = "Imported transcript: recognition latency unavailable unless captured during actual browser recognition."
    return res


def _prepare_local_faster_whisper(cfg: dict) -> dict:
    """Load model once so warm transcription latency can be measured separately from startup."""
    if importlib.util.find_spec("faster_whisper") is None:
        return {"status": "unavailable", "error": "faster-whisper not installed. Install and provide model per README.", "model": None}
    try:
        from faster_whisper import WhisperModel  # type: ignore
        model_name = cfg.get("faster_whisper_model", "small")
        device = cfg.get("device", "cpu")
        compute_type = cfg.get("compute_type", "int8")
        t0 = time.perf_counter()
        model = WhisperModel(model_name, device=device, compute_type=compute_type)
        startup_ms = (time.perf_counter() - t0) * 1000
        return {
            "status": "ok",
            "model": model,
            "model_name": model_name,
            "model_startup_ms": startup_ms,
            "settings": {"device": device, "compute_type": compute_type, "language": cfg.get("language", "te")},
        }
    except Exception as e:
        return {"status": "error", "error": f"{type(e).__name__}: {e}", "model": None}


def approach_local_faster_whisper(clip: Clip, cfg: dict, ctx: dict | None = None) -> dict:
    if clip.audio is None or not clip.audio.exists():
        return {"status": "unavailable", "error": "Audio file missing for clip.", "hypothesis": None}
    ctx = ctx or _prepare_local_faster_whisper(cfg)
    if ctx.get("status") != "ok" or ctx.get("model") is None:
        return {"status": ctx.get("status", "error"), "error": ctx.get("error", "faster-whisper unavailable"), "hypothesis": None}
    try:
        model = ctx["model"]
        model_name = ctx.get("model_name", cfg.get("faster_whisper_model", "small"))
        t0 = time.perf_counter()
        segments, info = model.transcribe(str(clip.audio), language=cfg.get("language", "te"))
        text = "".join(s.text for s in segments).strip()
        latency = (time.perf_counter() - t0) * 1000
        settings = dict(ctx.get("settings") or {})
        if info and getattr(info, "language", None):
            settings["detected_language"] = info.language
        return {
            "status": "ok",
            "hypothesis": text,
            "engine": f"faster-whisper:{model_name}",
            "latency_ms": latency,
            "model_startup_ms": ctx.get("model_startup_ms"),
            "latency_kind": "warm_transcription_only",
            "settings": settings,
        }
    except Exception as e:
        return {"status": "error", "error": f"{type(e).__name__}: {e}", "hypothesis": None, "model_startup_ms": ctx.get("model_startup_ms")}


def approach_cloud_provider(clip: Clip, cfg: dict) -> dict:
    provider = cfg.get("provider")
    if not provider:
        return {"status": "unavailable", "error": "No cloud provider configured. Set cloud.provider and credentials (e.g. Google/Azure/Sarvam) in config.", "hypothesis": None}
    # Intentionally a template/stub: real integration requires credentials and SDKs.
    # Users may plug in an adapter module path: cloud.adapter = "module:function"
    adapter = cfg.get("adapter")
    if adapter and ":" in adapter:
        mod_name, fn_name = adapter.split(":", 1)
        try:
            spec = importlib.util.find_spec(mod_name)
            if spec is None:
                raise ImportError(f"Adapter module '{mod_name}' not found")
            mod = importlib.import_module(mod_name)
            fn = getattr(mod, fn_name)
            return fn(clip, cfg)
        except Exception as e:
            return {"status": "error", "error": f"Cloud adapter failed: {type(e).__name__}: {e}", "hypothesis": None, "engine": provider}
    return {"status": "unavailable", "error": f"Cloud provider '{provider}' selected but no callable adapter configured and no credentials/integration bundled. Provide cloud.adapter and credentials; see README.", "hypothesis": None, "engine": provider}


APPROACHES: dict[str, Callable[[Clip, dict], dict]] = {
    "browser_web_speech": approach_browser_web_speech,
    "local_faster_whisper": approach_local_faster_whisper,
    "cloud_provider": approach_cloud_provider,
}


def main() -> int:
    ap = argparse.ArgumentParser(description="Compare ASR approaches on a GramVaani corpus.")
    ap.add_argument("--corpus", default=str(ROOT / "corpus"), help="Corpus directory")
    ap.add_argument("--approaches", default="browser_web_speech,local_faster_whisper,cloud_provider",
                    help="Comma-separated approaches to run")
    ap.add_argument("--config", help="JSON config file with per-approach settings/credentials refs")
    ap.add_argument("--out", default=str(ROOT / "results" / "run.json"), help="Output results JSON")
    ap.add_argument("--real-speech", action="store_true", help="Mark run as real consented speech evaluation (set only when true)")
    args = ap.parse_args()

    cfg = {}
    if args.config:
        cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    corpus_dir = Path(args.corpus)
    clips, manifest = load_corpus(corpus_dir)
    names = [n.strip() for n in args.approaches.split(",") if n.strip()]

    records = []
    run_meta = {
        "kind": "asr_comparison_run",
        "real_speech_evaluation": bool(args.real_speech and clips),
        "corpus_dir": str(corpus_dir),
        "corpus_id": manifest.get("corpus_id"),
        "consent_metadata_ref": manifest.get("consent_metadata_ref"),
        "approaches_requested": names,
        "clip_count": len(clips),
        "notes": [] if clips else ["No clips found in corpus. No real speech evaluation performed."],
    }
    for name in names:
        fn = APPROACHES.get(name)
        acfg = (cfg.get("approaches") or {}).get(name, cfg.get(name, {}))
        ctx = None
        if name == "local_faster_whisper" and clips:
            ctx = _prepare_local_faster_whisper(acfg)
            if ctx.get("model_startup_ms") is not None:
                run_meta.setdefault("approach_setup", {})[name] = {
                    "model_startup_ms": ctx.get("model_startup_ms"),
                    "settings": ctx.get("settings"),
                    "note": "Model loaded once and reused for warm transcription latency measurements.",
                }
            elif ctx.get("status") != "ok" and ctx.get("error"):
                run_meta.setdefault("approach_setup", {})[name] = {"status": ctx.get("status"), "error": ctx.get("error")}
        for clip in clips:
            t0 = time.perf_counter()
            if fn is None:
                res = {"status": "error", "error": f"Unknown approach '{name}'", "hypothesis": None}
            else:
                if name == "local_faster_whisper":
                    res = fn(clip, acfg, ctx)
                else:
                    res = fn(clip, acfg)
            latency = res.pop("latency_ms", None)
            # Do not fabricate latency for imported browser transcripts (or other explicitly unavailable cases).
            if latency is None and res.get("status") == "ok" and not res.get("latency_unavailable"):
                latency = (time.perf_counter() - t0) * 1000
            rec = {
                "id": clip.id,
                "approach": name,
                "hypothesis": res.get("hypothesis"),
                "reference": clip.reference,
                "latency_ms": latency,
                "status": res.get("status", "unknown"),
                "error": res.get("error"),
                "version": res.get("engine") or acfg.get("version"),
                "settings": res.get("settings") or {k: v for k, v in acfg.items() if k.lower() not in {"api_key", "token", "secret", "password", "credentials"}},
            }
            for k in ("model_startup_ms", "latency_kind", "latency_note", "latency_unavailable", "latency_source"):
                if k in res:
                    rec[k] = res[k]
            if clip.numbers_expected is not None:
                rec["expected_numbers"] = clip.numbers_expected
            if clip.fields_expected is not None:
                rec["expected_fields"] = clip.fields_expected
            records.append(rec)

    out = {**run_meta, "records": records}
    outp = Path(args.out)
    outp.parent.mkdir(parents=True, exist_ok=True)
    outp.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {outp} ({len(records)} records, {len(clips)} clips, {len(names)} approaches)")
    if not clips:
        print("NOTE: No real speech evaluation run (empty/missing corpus).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
