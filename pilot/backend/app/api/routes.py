from __future__ import annotations

import json
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from ..config import ensure_audio_tmp, get_settings, load_field_config
from ..db import get_draft, list_drafts, save_draft, save_feedback, save_transcript_record
from ..models import (
    ClarifyRequest,
    ClarifyResponse,
    ConfirmRequest,
    ConfirmResponse,
    DraftSaveRequest,
    ExtractRequest,
    ExtractResponse,
    Extraction,
    FeedbackRequest,
    SampleReport,
    SubmitTextRequest,
    TranscribeResponse,
)
from ..pipeline.assemble import assemble_sample_report
from ..pipeline.clarify import build_questions
from ..pipeline.extract import gaps_from
from ..providers.asr.base import ASRError
from ..providers.asr.registry import capabilities_response as _capabilities_response, get_provider
from ..providers.extraction.rules import RuleExtractionProvider
from ..validation import validate_report

router = APIRouter(prefix="/api")
_extractor = RuleExtractionProvider()

SYNTHETIC_TEST_SCENARIOS = [
    {
        "id": "syn-normal-telugu",
        "title": "Normal daily report (synthetic Telugu)",
        "category": "normal",
        "synthetic": True,
        "transcript": "ఈరోజు కేంద్రం SYN-PILOT-C001 లో 24 మంది పిల్లలు హాజరయ్యారు. భోజనం పెట్టాము, 24 భోజనాలు వడ్డించాము. ప్రీస్కూల్ కార్యకలాపం: పాటలు మరియు కథలు.",
        "notes": "Synthetic utterance for flow testing. No real speech, no personal data.",
    },
    {
        "id": "syn-mixed-te-en",
        "title": "Mixed Telugu-English (synthetic)",
        "category": "mixed-language",
        "synthetic": True,
        "transcript": "Today centre SYN-PILOT-C001 లో 18 children present. Meal served అవును, meal count 18. Activity pre_school and nutrition.",
        "notes": "Synthetic mixed-language sample.",
    },
    {
        "id": "syn-missing-ambiguous",
        "title": "Missing/ambiguous info (synthetic)",
        "category": "missing-ambiguous",
        "synthetic": True,
        "transcript": "కేంద్రంలో పిల్లలు వచ్చారు, భోజనం పెట్టాము. కార్యకలాపం జరిగింది.",
        "notes": "Designed to trigger clarification/gaps. Synthetic only.",
    },
]


def _http_error(exc: ASRError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"error": exc.message, **exc.details})


def _safe_suffix(filename: str | None) -> str:
    if not filename:
        return ".bin"
    suf = Path(filename).suffix
    if not suf or len(suf) > 10:
        return ".bin"
    cleaned = "".join(c for c in suf.lower() if c.isalnum() or c == ".")
    return cleaned or ".bin"


def capabilities_response() -> dict[str, Any]:
    base = _capabilities_response()
    providers = []
    for p in base.get("providers", []):
        providers.append({
            **p,
            "name": p.get("label") or p.get("id"),
            "requires_credentials": bool(p.get("requires")) and p.get("id") in {"cloud_http", "faster_whisper"} and not p.get("configured", False),
            "modes": [p.get("mode")] if p.get("mode") else [],
            "reason": "; ".join(p.get("notes") or []),
            "languages": ["te-IN", "en-IN", "te"],
        })
    return {
        **base,
        "providers": providers,
        "default_provider": "browser",
        "browser_web_speech_supported": None,
    }


@router.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "pilot": True, "sandbox": False}


@router.get("/config/fields")
def config_fields() -> dict[str, Any]:
    return load_field_config()


@router.get("/asr/capabilities")
def asr_capabilities() -> dict[str, Any]:
    return capabilities_response()


@router.post("/asr/providers")
def asr_providers() -> dict[str, Any]:
    return capabilities_response()


async def _handle_audio_transcribe(audio: UploadFile, provider: str, language: str | None, consent_retain: bool, retain_audio: bool) -> Any:
    settings = get_settings()
    default_retain = bool(settings.get("retain_audio_default", False))
    requested_retain = bool(retain_audio or consent_retain or default_retain)
    tmp_dir = ensure_audio_tmp()
    filename = audio.filename or "upload.audio"
    tmp_path = tmp_dir / f"upload_{uuid.uuid4().hex}{_safe_suffix(filename)}"
    warnings: list[str] = []
    if requested_retain:
        warnings.append(
            "Audio retention requested, but pilot backend does not store real recordings without safeguards; temporary file will be deleted after processing."
        )
    try:
        with tmp_path.open("wb") as out:
            shutil.copyfileobj(audio.file, out)
    finally:
        try:
            await audio.close()
        except Exception:
            pass

    try:
        try:
            provider_impl = get_provider(provider)
        except ASRError as exc:
            raise _http_error(exc)

        try:
            result = await provider_impl.transcribe_audio(
                tmp_path,
                language=language,
                content_type=audio.content_type,
                filename=filename,
            )
        except ASRError as exc:
            raise _http_error(exc)
        except Exception as exc:
            raise HTTPException(status_code=500, detail={"error": f"ASR provider failed: {exc}", "provider": provider})

        all_warnings = list(result.warnings or []) + warnings
        payload = TranscribeResponse(
            transcript=result.transcript,
            original_transcript=result.original_transcript,
            provider=result.provider,
            language=result.language or language,
            duration_ms=result.duration_ms,
            segments=result.segments,
            confidence=result.confidence,
            warnings=all_warnings,
            simulated=bool(result.simulated),
            meta={
                **(result.meta or {}),
                "filename": filename,
                "content_type": audio.content_type,
                "retain_audio_requested": requested_retain,
                "retained_audio": False,
            },
        )
        save_transcript_record(payload.model_dump(mode="json"))
        return payload
    finally:
        try:
            if tmp_path.exists():
                tmp_path.unlink()
        except OSError:
            pass


@router.post("/asr/transcribe")
async def asr_transcribe(
    audio: UploadFile = File(...),
    provider: str = Form("manual"),
    language: str | None = Form("te-IN"),
    consent_retain: bool = Form(False),
    retain_audio: bool = Form(False),
) -> Any:
    return await _handle_audio_transcribe(audio, provider, language, consent_retain, retain_audio)


def _submit_text_payload(request: SubmitTextRequest) -> TranscribeResponse:
    transcript = request.transcript or ""
    original = request.original_transcript if request.original_transcript is not None else transcript
    resp = TranscribeResponse(
        transcript=transcript,
        original_transcript=original,
        provider=request.provider or "browser",
        language=request.language,
        duration_ms=None,
        segments=request.segments,
        confidence=request.confidence,
        warnings=list(request.warnings or []) + [
            "Transcript ingested from client-provided/browser recognition; server preserved original transcript."
        ],
        simulated=False,
        meta={**(request.meta or {}), "source": "submit-text"},
    )
    save_transcript_record(resp.model_dump(mode="json"))
    return resp


@router.post("/transcribe/submit-text")
def submit_text(request: SubmitTextRequest) -> TranscribeResponse:
    return _submit_text_payload(request)


@router.post("/voice/transcribe")
async def voice_transcribe(request: Request) -> Any:
    """Compatibility endpoint: multipart audio upload or JSON transcript submission."""
    ct = (request.headers.get("content-type") or "").lower()
    if "multipart/form-data" in ct:
        form = await request.form()
        upload = form.get("audio") or form.get("file")
        if not isinstance(upload, UploadFile):
            raise HTTPException(status_code=400, detail="Multipart request must include 'audio' or 'file' upload.")
        provider = str(form.get("provider") or "manual")
        language = form.get("language")
        consent_retain = str(form.get("consent_retain", "false")).lower() in {"1", "true", "yes", "on"}
        retain_audio = str(form.get("retain_audio", "false")).lower() in {"1", "true", "yes", "on"}
        # If only text provided in multipart and no meaningful audio flow desired, fall through after read handled by _handle_audio_transcribe
        return await _handle_audio_transcribe(upload, provider, str(language) if language else "te-IN", consent_retain, retain_audio)

    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        body = {}
    # Browser/client transcript path
    text = body.get("transcript") if body.get("transcript") is not None else body.get("text")
    provider = body.get("provider") or "browser"
    if text is not None or provider in {"browser", "browser_web_speech", "client_provided", "client"}:
        req = SubmitTextRequest(
            transcript=str(text or ""),
            provider=str(provider),
            language=body.get("language") or "te-IN",
            original_transcript=body.get("original_transcript"),
            confidence=body.get("confidence"),
            segments=body.get("segments"),
            warnings=body.get("warnings") or [],
            meta=body.get("meta") or {},
        )
        return _submit_text_payload(req)
    raise HTTPException(status_code=400, detail="Provide multipart audio upload or JSON with transcript/text for browser recognition.")


@router.post("/extract")
def extract(request: ExtractRequest) -> ExtractResponse:
    transcript = request.transcript or ""
    original = request.original_transcript if request.original_transcript is not None else transcript
    extractions, ambiguities = _extractor.extract(transcript)
    return ExtractResponse(
        extractions=extractions,
        gaps=gaps_from(extractions),
        ambiguities=ambiguities,
        original_transcript=original,
        transcript=transcript,
    )


@router.post("/voice/extract")
def voice_extract(request: ExtractRequest) -> ExtractResponse:
    return extract(request)


@router.post("/clarify")
def clarify(request: ClarifyRequest) -> ClarifyResponse:
    questions = build_questions(request.gaps, request.answers)
    return ClarifyResponse(questions=questions)


@router.post("/voice/clarify")
def voice_clarify(request: ClarifyRequest) -> ClarifyResponse:
    return clarify(request)


def _coerce_extractions(items: list[Any]) -> list[Extraction]:
    out: list[Extraction] = []
    for item in items or []:
        if isinstance(item, Extraction):
            out.append(item)
        elif isinstance(item, dict):
            try:
                out.append(Extraction(**item))
            except Exception:
                continue
    return out


@router.post("/confirm")
def confirm(request: ConfirmRequest) -> Any:
    if not request.explicit_confirmation:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "explicit_confirmation is required",
                "message": "Set explicit_confirmation=true only after worker review/corrections to generate a sample report.",
            },
        )
    original = request.original_transcript if request.original_transcript is not None else request.transcript
    report = assemble_sample_report(
        extractions=request.extractions,
        answers=request.answers,
        corrections=request.corrections,
        transcript_ref=request.meta.get("transcript_ref") if isinstance(request.meta, dict) else None,
        report_date=request.report_date,
        explicit_confirmation=True,
        worker=request.worker,
    )
    validation = validate_report(report.model_dump(mode="json"))
    draft_data = {
        "transcript": request.transcript,
        "original_transcript": original,
        "extractions": [e.model_dump(mode="json") for e in request.extractions],
        "answers": request.answers,
        "corrections": request.corrections,
        "report": report.model_dump(mode="json"),
        "validation": validation.model_dump(mode="json"),
        "meta": request.meta,
    }
    saved = save_draft(request.draft_id, draft_data, status="confirmed_sample")
    resp = ConfirmResponse(report=report, validation=validation, draft_id=saved["draft_id"], saved=True)
    return resp


@router.post("/voice/confirm")
async def voice_confirm(request: Request) -> Any:
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        body = {}
    # Flexible mapping for frontend payloads
    transcript = body.get("transcript") or ""
    original = body.get("original_transcript") or transcript
    extractions = _coerce_extractions(body.get("extractions") or [])
    answers = body.get("answers") or {}
    corrections = body.get("corrections") or {}
    explicit = bool(body.get("explicit_confirmation"))
    if "explicit_confirmation" not in body and body.get("sample_report") is True:
        # frontend sends explicit_confirmation separately in UI; honor flag
        explicit = True
    req = ConfirmRequest(
        transcript=str(transcript),
        original_transcript=str(original) if original is not None else None,
        extractions=extractions,
        answers=answers if isinstance(answers, dict) else {},
        corrections=corrections if isinstance(corrections, dict) else {},
        explicit_confirmation=explicit,
        draft_id=body.get("draft_id"),
        report_date=body.get("report_date"),
        worker=body.get("worker"),
        meta=body.get("meta") if isinstance(body.get("meta"), dict) else {"scenario_id": body.get("scenario_id"), "idempotency_key": body.get("idempotency_key")},
    )
    result = confirm(req)
    # result is ConfirmResponse model
    data = result.model_dump(mode="json") if hasattr(result, "model_dump") else result
    if isinstance(data.get("report"), dict):
        data["report"]["sample"] = True
        data["report"]["label"] = data["report"].get("status_label") or "EXPERIMENTAL SAMPLE REPORT - NOT OFFICIAL, NOT SUBMITTED"
    return data


@router.get("/drafts")
def drafts_list() -> list[dict[str, Any]]:
    items = list_drafts()
    # add frontend-friendly aliases
    for it in items:
        it["id"] = it.get("draft_id")
        it["updated_at"] = it.get("updated_at")
        it["status"] = it.get("status")
    return items


@router.post("/drafts")
def drafts_save(request: DraftSaveRequest) -> dict[str, Any]:
    data = request.model_dump(mode="json")
    status = "draft"
    if request.report and getattr(request.report, "confirmation", None):
        try:
            if request.report.confirmation.explicit_confirmation:
                status = "confirmed_sample"
        except Exception:
            status = "draft"
    saved = save_draft(request.draft_id, data, status=status)
    saved["id"] = saved.get("draft_id")
    return saved


@router.get("/drafts/{draft_id}")
def drafts_get(draft_id: str) -> Any:
    draft = get_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="draft not found")
    draft["id"] = draft.get("draft_id")
    return draft


@router.get("/drafts/{draft_id}/export.json")
def drafts_export(draft_id: str) -> Any:
    draft = get_draft(draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="draft not found")
    export = {
        "export_kind": "gramvaani_pilot_draft_export",
        "pilot_unverified": True,
        "not_official": True,
        "not_submitted": True,
        "draft": draft,
    }
    headers = {"Content-Disposition": f'attachment; filename="{draft_id}.json"'}
    return JSONResponse(content=export, headers=headers)


@router.post("/export")
async def export_report(request: Request) -> Any:
    try:
        body = await request.json()
    except Exception:
        body = {}
    report = body.get("report") if isinstance(body, dict) else body
    export = {
        "export_kind": "gramvaani_pilot_sample_report_export",
        "pilot_unverified": True,
        "not_official": True,
        "not_submitted": True,
        "experimental": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "report": report,
    }
    return JSONResponse(content=export)


@router.get("/scenarios")
def scenarios() -> list[dict[str, Any]]:
    return SYNTHETIC_TEST_SCENARIOS


@router.post("/feedback")
async def feedback(request: Request) -> dict[str, Any]:
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        body = {"message": str(body)}
    # normalize for DB
    payload = {
        "category": body.get("category") or "general",
        "message": body.get("message") or body.get("comments") or body.get("suggestions") or json.dumps(body, ensure_ascii=False),
        "draft_id": body.get("draft_id"),
        "report_kind": body.get("report_kind") or "sample_report",
        "meta": {k: v for k, v in body.items() if k not in {"category", "message", "draft_id", "report_kind"}},
        "pilot_unverified": True,
        "not_official": True,
    }
    return save_feedback(payload)


@router.get("/evaluation/summary")
def evaluation_summary() -> dict[str, Any]:
    settings = get_settings()
    eval_dir = Path(settings["evaluation_results_dir"])
    # prefer curated summary.json if present
    curated = eval_dir / "summary.json" if eval_dir.exists() else None
    base: dict[str, Any] = {
        "available": False,
        "path": str(eval_dir),
        "files": [],
        "results": {},
        "notes": [
            "Reads local evaluation result files if present; no external services contacted.",
        ],
        "simulated": True,
        "synthetic": True,
        "real_speech": False,
        "message": "No real speech evaluation run. Synthetic fixtures only; no fabricated accuracy results.",
    }
    if not eval_dir.exists():
        base["notes"].append("Evaluation results directory not found.")
        return base
    files = sorted([p for p in eval_dir.glob("*.json") if p.is_file()])
    base["files"] = [p.name for p in files]
    base["available"] = len(files) > 0
    for p in files:
        try:
            base["results"][p.name] = json.loads(p.read_text(encoding="utf-8"))
        except Exception as exc:
            base["results"][p.name] = {"error": f"failed to read/parse: {exc}"}
    if curated and curated.exists():
        try:
            cur = json.loads(curated.read_text(encoding="utf-8"))
            if isinstance(cur, dict):
                merged = {**base, **cur}
                merged["available"] = True
                merged["path"] = str(eval_dir)
                merged["files"] = base["files"]
                merged["results"] = base["results"]
                if "simulated" not in cur:
                    merged["simulated"] = not bool(cur.get("real_speech_evaluation"))
                if "synthetic" not in cur:
                    merged["synthetic"] = not bool(cur.get("real_speech_evaluation"))
                if "real_speech" not in cur:
                    merged["real_speech"] = bool(cur.get("real_speech_evaluation", False))
                return merged
        except Exception:
            pass
    if not files:
        base["notes"].append("No JSON evaluation result files found.")
    return base
