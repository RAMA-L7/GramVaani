"""Higher-level evaluation metrics for GramVaani pilot evaluation.

Covers number recognition accuracy, field extraction accuracy, correction
frequency, manual correction effort, recognition latency, and failure rate.

All functions operate on provided data; they never fabricate measurements.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Iterable

from normalize import normalize_number_token, normalize_text
from wer_cer import wer, cer


def number_recognition_accuracy(expected: Iterable[str], observed: Iterable[str]) -> dict:
    exp = [normalize_number_token(x) for x in expected]
    obs = [normalize_number_token(x) for x in observed]
    # Align by position for v1; fixtures can provide ordered number lists.
    total = len(exp)
    correct = 0
    details = []
    for i, e in enumerate(exp):
        o = obs[i] if i < len(obs) else ""
        ok = (e == o) and e != ""
        if ok:
            correct += 1
        details.append({"index": i, "expected": e, "observed": o, "correct": ok})
    acc = (correct / total) if total else None
    return {"accuracy": acc, "correct": correct, "total": total, "details": details}


def field_extraction_accuracy(expected: dict[str, Any], observed: dict[str, Any]) -> dict:
    keys = sorted(set(expected.keys()) | set(observed.keys()))
    total = len(keys)
    correct = 0
    details = []
    for k in keys:
        e = expected.get(k)
        o = observed.get(k)
        # Normalize strings/numbers for fair comparison in synthetic checks.
        if isinstance(e, (int, float)) or isinstance(o, (int, float)):
            ok = normalize_number_token(str(e)) == normalize_number_token(str(o)) and str(e) != ""
        else:
            ok = normalize_text("" if e is None else str(e)) == normalize_text("" if o is None else str(o))
        if ok:
            correct += 1
        details.append({"field": k, "expected": e, "observed": o, "correct": ok})
    acc = (correct / total) if total else None
    return {"accuracy": acc, "correct": correct, "total": total, "details": details}


def manual_correction_effort(reference_text: str, corrected_text: str) -> dict:
    """Effort proxy as edit distance in characters and words between hypothesis-as-edited states.

    For pilot use: compare ASR/output text vs final corrected text.
    """
    w = wer(reference_text, corrected_text)
    c = cer(reference_text, corrected_text)
    return {
        "word_edits": w["distance"],
        "char_edits": c["distance"],
        "ref_words": w["ref_words"],
        "ref_chars": c["ref_chars"],
    }


def correction_frequency(records: list[dict[str, Any]]) -> dict:
    """records items may contain 'corrected': bool or before/after fields."""
    total = len(records)
    corrected = 0
    for r in records:
        if r.get("corrected") is True:
            corrected += 1
        elif "before" in r and "after" in r and r["before"] != r["after"]:
            corrected += 1
    rate = (corrected / total) if total else None
    return {"correction_rate": rate, "corrected": corrected, "total": total}


def latency_stats(latencies_ms: list[float | int | None]) -> dict:
    vals = [float(x) for x in latencies_ms if x is not None]
    if not vals:
        return {"count": 0, "mean_ms": None, "p50_ms": None, "p95_ms": None, "min_ms": None, "max_ms": None}
    vals_sorted = sorted(vals)
    def pct(p):
        k = (len(vals_sorted) - 1) * p
        f = int(k)
        c = min(f + 1, len(vals_sorted) - 1)
        if f == c:
            return vals_sorted[f]
        return vals_sorted[f] * (c - k) + vals_sorted[c] * (k - f)
    return {
        "count": len(vals),
        "mean_ms": sum(vals) / len(vals),
        "p50_ms": pct(0.5),
        "p95_ms": pct(0.95),
        "min_ms": vals_sorted[0],
        "max_ms": vals_sorted[-1],
    }


def failure_rate(statuses: list[str]) -> dict:
    total = len(statuses)
    failed = sum(1 for s in statuses if str(s).lower() in {"error", "failed", "timeout", "unavailable"})
    ok = total - failed
    rate = (failed / total) if total else None
    return {"failure_rate": rate, "failed": failed, "ok": ok, "total": total}


def compute_text_metrics(reference: str, hypothesis: str) -> dict:
    return {"wer": wer(reference, hypothesis), "cer": cer(reference, hypothesis)}
