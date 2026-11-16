"""Deterministic, grounded extraction from transcript text.

Every extraction must be backed by an exact/verbatim source_span in the
transcript. Ungrounded values are dropped.
"""
from __future__ import annotations

import re
from typing import Any

from ..config import AUTO_FIELD_IDS, field_definitions, field_hints, field_option_values, required_field_ids
from ..models import Extraction
from ..validation import ambiguity_fields
from .normalise import NumberChunk, Token, normalise_transcript, normalise_whitespace, number_chunks

NUMERIC_HINTS: dict[str, list[str]] = {
    "children_present": ["వచ్చారు", "హాజరు", "హాజరైన", "present", "came", "attended", "పిల్లలు"],
    "children_absent": ["రాలేదు", "గైర్హాజరు", "లేరు", "absent", "missing"],
    "children_enrolled": ["నమోదైన", "మొత్తం", "enrolled", "total"],
    "meal_count": ["భోజనం", "మందికి", "పెట్టారు", "meals", "served"],
}

BOOLEAN_MARKERS: dict[str, dict[str, list[str]]] = {
    "meal_served": {
        "subjects": ["భోజనం", "meal", "తిండి", "food"],
        "positive": ["పెట్టారు", "పెట్టాం", "ఇచ్చారు", "served", "yes", "అవును", "done"],
        "negative": ["పెట్టలేదు", "ఇవ్వలేదు", "లేదు", "no", "not", "కాదు"],
    },
    "photo_attached": {
        "subjects": ["ఫోటో", "photo", "image", "చిత్రం"],
        "positive": ["తీసారు", "జత", "attached", "yes", "ఉంది"],
        "negative": ["లేదు", "no", "not"],
    },
}

ACTIVITY_SYNONYMS: dict[str, list[str]] = {
    "pre_school": ["ప్రీ స్కూల్", "పాఠం", "preschool", "pre school", "pre_school", "class"],
    "nutrition": ["పోషణ", "భోజనం", "nutrition", "meal"],
    "weighing": ["బరువు", "కొలత", "weighing", "weight"],
    "home_visit": ["ఇంటి సందర్శన", "home visit", "visit"],
    "health_check": ["ఆరోగ్య", "పరీక్ష", "health check", "health"],
}

CAPTURE_MARKERS: dict[str, list[str]] = {
    "preschool_activity": ["ప్రీ స్కూల్", "పాఠం", "preschool"],
    "remarks": ["గమనిక", "remarks", "ఇతర", "note"],
}

CAPTURE_STOPWORDS = {
    "భోజనం", "ఫోటో", "గమనిక", "రాలేదు", "వచ్చారు", "మంది", "పిల్లలు",
    "meal", "photo", "remarks", "children", "present", "absent",
}
CAPTURE_PARTICLES = {"లో", "గా", "కి", "కు", "today", "ఈరోజు"}

MAX_HINT_GAP = 6


def verify_grounding(transcript: str, raw_text: str, span: list[int]) -> bool:
    start, end = span
    if start < 0 or end > len(transcript or "") or start >= end:
        return False
    return normalise_whitespace((transcript or "")[start:end]) == normalise_whitespace(raw_text or "")


def _hint_indices(tokens: list[Token], hints: list[str]) -> list[int]:
    found: list[int] = []
    lowered_hints = [h.lower() for h in hints if h]
    for idx, token in enumerate(tokens):
        for hint in lowered_hints:
            if hint and hint in token.text:
                found.append(idx)
                break
    return found


def _nearest_chunk(chunks: list[NumberChunk], hint_idx: int) -> NumberChunk | None:
    before: list[tuple[int, NumberChunk]] = []
    after: list[tuple[int, NumberChunk]] = []
    for chunk in chunks:
        if chunk.last_index <= hint_idx:
            distance = hint_idx - chunk.last_index
            if distance <= MAX_HINT_GAP:
                before.append((distance, chunk))
        elif chunk.first_index >= hint_idx:
            distance = chunk.first_index - hint_idx
            if distance <= MAX_HINT_GAP:
                after.append((distance, chunk))
    if before:
        return min(before, key=lambda p: p[0])[1]
    if after:
        return min(after, key=lambda p: p[0])[1]
    return None


def _numeric_candidates(chunks: list[NumberChunk], tokens: list[Token], hints: list[str]) -> list[NumberChunk]:
    """Collect best number candidates near hint occurrences.

    For each hint match, prefer the nearest preceding chunk in window (common
    spoken order like "24 mandi pillalu vacharu"), falling back to following
    chunk. Then choose the best candidate across all hint matches.
    """
    best: dict[tuple[int, int, int], tuple[int, int, NumberChunk]] = {}
    for hint in hints:
        for idx in _hint_indices(tokens, [hint]):
            before = None
            after = None
            for chunk in chunks:
                if chunk.last_index <= idx:
                    dist = idx - chunk.last_index
                    if dist <= MAX_HINT_GAP and (before is None or dist < before[0]):
                        before = (dist, chunk)
                elif chunk.first_index >= idx:
                    dist = chunk.first_index - idx
                    if dist <= MAX_HINT_GAP and (after is None or dist < after[0]):
                        after = (dist, chunk)
            chosen = None
            if before is not None:
                chosen = (before[0], 0, before[1])
            elif after is not None:
                chosen = (after[0], 1, after[1])
            if chosen is None:
                continue
            key = (chosen[2].start, chosen[2].end, chosen[2].value)
            if key not in best or (chosen[0], chosen[1]) < (best[key][0], best[key][1]):
                best[key] = chosen
    if not best:
        return []
    ranked = sorted(best.values(), key=lambda x: (x[0], x[1], x[2].start))
    selected: list[NumberChunk] = []
    seen_values: set[int] = set()
    for _, _, chunk in ranked:
        if chunk.value in seen_values:
            continue
        seen_values.add(chunk.value)
        selected.append(chunk)
    if not selected:
        return []
    if len(selected) == 1:
        return selected
    # if clearly best, return one; otherwise return top candidates to signal ambiguity upstream
    if ranked[0][0] < ranked[1][0]:
        return [selected[0]]
    return selected[:2]



def _make_extraction(field_id: str, value: Any, transcript: str, start: int, end: int, confidence: float) -> Extraction | None:
    raw_text = transcript[start:end]
    span = [start, end]
    if not verify_grounding(transcript, raw_text, span):
        return None
    return Extraction(field_id=field_id, value=value, raw_text=raw_text, source_span=span, confidence=confidence, needs_confirmation=True)


def _boolean_extraction(field_id: str, spec: dict[str, list[str]], tokens: list[Token], transcript: str) -> Extraction | None:
    subject_indices = _hint_indices(tokens, spec["subjects"])
    if not subject_indices:
        return None
    for subject_idx in subject_indices:
        window = range(subject_idx + 1, min(len(tokens), subject_idx + 5))
        for idx in window:
            word = tokens[idx].text
            if any(n in word for n in spec.get("negative", [])):
                return _make_extraction(field_id, False, transcript, tokens[subject_idx].start, tokens[idx].end, 0.8)
            if any(p in word for p in spec.get("positive", [])):
                return _make_extraction(field_id, True, transcript, tokens[subject_idx].start, tokens[idx].end, 0.8)
        if field_id == "photo_attached":
            return _make_extraction(field_id, True, transcript, tokens[subject_idx].start, tokens[subject_idx].end, 0.6)
    return None


def _activity_extraction(tokens: list[Token], transcript: str) -> Extraction | None:
    matched: list[str] = []
    first_span: tuple[int, int] | None = None
    # Only emit values that exist in configured options if available.
    defs = {f["id"]: f for f in field_definitions()}
    allowed = None
    if "activity_type" in defs:
        allowed = set(field_option_values(defs["activity_type"]))
    for option, synonyms in ACTIVITY_SYNONYMS.items():
        if allowed is not None and option not in allowed:
            continue
        for idx, token in enumerate(tokens):
            text_window = token.text
            if idx + 1 < len(tokens):
                text_window = text_window + " " + tokens[idx + 1].text
            if any(syn.lower() in token.text or syn.lower() in text_window for syn in synonyms):
                if option not in matched:
                    matched.append(option)
                if first_span is None:
                    first_span = (token.start, token.end)
                break
    if not matched or first_span is None:
        return None
    return _make_extraction("activity_type", matched, transcript, first_span[0], first_span[1], 0.8)


def _capture_extraction(field_id: str, markers: list[str], tokens: list[Token], transcript: str) -> Extraction | None:
    for idx, token in enumerate(tokens):
        if not any(m.lower() in token.text for m in markers):
            continue
        captured: list[Token] = []
        for pos in range(idx + 1, min(len(tokens), idx + 10)):
            cand = tokens[pos]
            if cand.text in CAPTURE_STOPWORDS:
                break
            captured.append(cand)
            if cand.raw.endswith(('.', '।', '!', '?')):
                break
        while captured and captured[0].text in CAPTURE_PARTICLES:
            captured.pop(0)
        if not captured:
            continue
        start, end = captured[0].start, captured[-1].end
        value = normalise_whitespace(" ".join(t.text for t in captured))
        return _make_extraction(field_id, value, transcript, start, end, 0.7)
    return None


def _date_extraction(transcript: str) -> Extraction | None:
    for pattern in [r"\b\d{4}-\d{2}-\d{2}\b", r"\b\d{2}/\d{2}/\d{4}\b", r"\b\d{2}-\d{2}-\d{4}\b"]:
        m = re.search(pattern, transcript or "")
        if m:
            return _make_extraction("report_date", m.group(0), transcript, m.start(), m.end(), 0.9)
    return None


def extract(transcript: str) -> tuple[list[Extraction], list[str]]:
    transcript = transcript or ""
    tokens = normalise_transcript(transcript)
    chunks = number_chunks(tokens)
    candidates: dict[str, list[Extraction]] = {}
    ambiguities: set[str] = set()

    for field_id, hints in NUMERIC_HINTS.items():
        # merge configured hints if present
        defs = {f["id"]: f for f in field_definitions()}
        merged = list(hints)
        if field_id in defs:
            merged.extend(field_hints(defs[field_id], "te"))
            merged.extend(field_hints(defs[field_id], "en"))
        for chunk in _numeric_candidates(chunks, tokens, merged):
            ex = _make_extraction(field_id, chunk.value, transcript, chunk.start, chunk.end, 0.9)
            if ex is not None:
                candidates.setdefault(field_id, []).append(ex)

    for field_id, spec in BOOLEAN_MARKERS.items():
        ex = _boolean_extraction(field_id, spec, tokens, transcript)
        if ex is not None:
            candidates.setdefault(field_id, []).append(ex)

    activity = _activity_extraction(tokens, transcript)
    if activity is not None:
        candidates.setdefault("activity_type", []).append(activity)
    for field_id, markers in CAPTURE_MARKERS.items():
        ex = _capture_extraction(field_id, markers, tokens, transcript)
        if ex is not None:
            candidates.setdefault(field_id, []).append(ex)
    date_ex = _date_extraction(transcript)
    if date_ex is not None:
        candidates.setdefault("report_date", []).append(date_ex)

    extractions: list[Extraction] = []
    chosen_values: dict[str, Any] = {}
    for field_id, options in candidates.items():
        extractions.append(options[0])
        chosen_values[field_id] = options[0].value
        distinct = {str(o.value) for o in options}
        if len(distinct) > 1:
            ambiguities.add(field_id)

    ambiguities.update(ambiguity_fields(chosen_values))
    return extractions, sorted(ambiguities)


def gaps_from(extractions: list[Extraction]) -> list[str]:
    extracted_ids = {e.field_id for e in extractions}
    return [fid for fid in required_field_ids() if fid not in extracted_ids and fid not in AUTO_FIELD_IDS]


def values_from(extractions: list[Extraction]) -> dict[str, Any]:
    return {e.field_id: e.value for e in extractions}
