"""Score evaluation fixtures or corpus results.

Supports:
- Synthetic fixture scoring (text/transcript-based): computes WER/CER, number and
  field extraction accuracy against expected values. No audio required.
- Aggregation of per-clip runner results for real/simulated pipeline runs.

This script does NOT fabricate real recognition accuracy. It only computes metrics
from inputs you provide.
"""
from __future__ import annotations

import argparse
import json
import statistics
from pathlib import Path
from typing import Any

from metrics import (
    correction_frequency,
    failure_rate,
    field_extraction_accuracy,
    latency_stats,
    manual_correction_effort,
    number_recognition_accuracy,
)
from wer_cer import cer, wer

ROOT = Path(__file__).resolve().parent
FIXTURES = ROOT / "fixtures"
RESULTS = ROOT / "results"


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def score_synthetic_fixtures(fixtures_dir: Path) -> dict:
    cases = []
    for p in sorted(fixtures_dir.glob("*.json")):
        data = load_json(p)
        ref = data.get("reference_text", "")
        hyp = data.get("hypothesis_text", "")
        # For synthetic automated pipeline checks, hypothesis may be absent; score
        # only components that are present.
        case = {
            "id": data.get("id", p.stem),
            "file": str(p.relative_to(ROOT)) if ROOT in p.parents or p.parent==ROOT else p.name,
            "category": data.get("category"),
            "description": data.get("description"),
            "kind": "synthetic_fixture",
        }
        if "reference_text" in data and "hypothesis_text" in data:
            case["wer"] = wer(ref, hyp)
            case["cer"] = cer(ref, hyp)
        if "expected_numbers" in data:
            case["number_recognition"] = number_recognition_accuracy(
                data.get("expected_numbers", []), data.get("observed_numbers", [])
            )
        if "expected_fields" in data:
            case["field_extraction"] = field_extraction_accuracy(
                data.get("expected_fields", {}), data.get("observed_fields", {})
            )
        if "corrected_text" in data and "hypothesis_text" in data:
            case["manual_correction_effort"] = manual_correction_effort(hyp, data.get("corrected_text", ""))
        if "correction_events" in data:
            case["correction_frequency"] = correction_frequency(data.get("correction_events", []))
        cases.append(case)

    summary = {
        "kind": "synthetic_fixture_score",
        "real_speech_evaluation": False,
        "claims": "No real recognition accuracy claims. Metrics computed only on synthetic, transcript-based fixtures provided in-repo.",
        "fixture_count": len(cases),
        "cases": cases,
    }
    # Aggregate WER/CER where available
    wers = [c["wer"]["wer"] for c in cases if "wer" in c]
    cers = [c["cer"]["cer"] for c in cases if "cer" in c]
    summary["aggregate"] = {
        "wer_mean": statistics.mean(wers) if wers else None,
        "cer_mean": statistics.mean(cers) if cers else None,
        "scored_text_cases": len(wers),
    }
    return summary


def score_runner_results(results_path: Path) -> dict:
    data = load_json(results_path)
    records = data.get("records", data if isinstance(data, list) else [])
    by_approach: dict[str, list[dict]] = {}
    for r in records:
        by_approach.setdefault(r.get("approach", "unknown"), []).append(r)

    approaches = {}
    for name, recs in sorted(by_approach.items()):
        wers, cers = [], []
        lats, statuses = [], []
        num_accs, field_accs = [], []
        corrections = []
        for r in recs:
            statuses.append(r.get("status", "unknown"))
            if r.get("latency_ms") is not None:
                lats.append(r.get("latency_ms"))
            if r.get("reference") is not None and r.get("hypothesis") is not None:
                w = wer(r["reference"], r["hypothesis"])
                c = cer(r["reference"], r["hypothesis"])
                wers.append(w["wer"]); cers.append(c["cer"])
                r.setdefault("metrics", {})["wer"] = w
                r.setdefault("metrics", {})["cer"] = c
            if "expected_numbers" in r:
                na = number_recognition_accuracy(r.get("expected_numbers", []), r.get("observed_numbers", []))
                if na["accuracy"] is not None:
                    num_accs.append(na["accuracy"])
                r.setdefault("metrics", {})["number_recognition"] = na
            if "expected_fields" in r:
                fa = field_extraction_accuracy(r.get("expected_fields", {}), r.get("observed_fields", {}))
                if fa["accuracy"] is not None:
                    field_accs.append(fa["accuracy"])
                r.setdefault("metrics", {})["field_extraction"] = fa
            if "corrected_text" in r and "hypothesis" in r:
                eff = manual_correction_effort(r.get("hypothesis", ""), r.get("corrected_text", ""))
                r.setdefault("metrics", {})["manual_correction_effort"] = eff
            if "corrected" in r or ("before" in r and "after" in r):
                corrections.append(r)
        approaches[name] = {
            "count": len(recs),
            "wer_mean": statistics.mean(wers) if wers else None,
            "cer_mean": statistics.mean(cers) if cers else None,
            "number_recognition_accuracy_mean": statistics.mean(num_accs) if num_accs else None,
            "field_extraction_accuracy_mean": statistics.mean(field_accs) if field_accs else None,
            "latency": latency_stats(lats),
            "failure": failure_rate(statuses),
            "correction_frequency": correction_frequency(corrections) if corrections else {"correction_rate": None, "corrected": 0, "total": 0},
            "records": recs,
        }
    return {
        "kind": "runner_results_score",
        "source": str(results_path),
        "real_speech_evaluation": bool(data.get("real_speech_evaluation", False)),
        "corpus_id": data.get("corpus_id"),
        "consent_metadata_ref": data.get("consent_metadata_ref"),
        "approaches": approaches,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Score GramVaani evaluation fixtures/results.")
    ap.add_argument("--fixtures", action="store_true", help="Score synthetic fixtures under evaluation/fixtures")
    ap.add_argument("--fixtures-dir", default=str(FIXTURES))
    ap.add_argument("--runner-results", help="Path to runner results JSON to aggregate/score")
    ap.add_argument("--out", help="Write JSON output to path")
    args = ap.parse_args()

    if not args.fixtures and not args.runner_results:
        ap.error("Provide --fixtures and/or --runner-results")

    output: dict[str, Any] = {"generated": True}
    if args.fixtures:
        output["synthetic"] = score_synthetic_fixtures(Path(args.fixtures_dir))
    if args.runner_results:
        output["runner"] = score_runner_results(Path(args.runner_results))

    text = json.dumps(output, ensure_ascii=False, indent=2)
    if args.out:
        outp = Path(args.out)
        outp.parent.mkdir(parents=True, exist_ok=True)
        outp.write_text(text, encoding="utf-8")
        print(f"Wrote {outp}")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
