"""Deterministic, grounded extraction from a (simulated) transcript.

Every emitted Extraction has a ``source_span`` that is a verbatim substring of
the transcript (whitespace-normalised comparison).  Candidates that fail this
check are dropped.  No model, network call or live ASR is involved.
"""
from __future__ import annotations

import re

from ..config import AUTO_FIELD_IDS, required_field_ids
from ..models import Extraction
from ..validation import ambiguity_fields
from .normalise import (
    NumberChunk,
    Token,
    normalise_transcript,
    normalise_whitespace,
    number_chunks,
)

# Ordered most-specific first: the first hint that produces a value wins.
NUMERIC_HINTS: dict[str, list[str]] = {
    "children_present": ["వచ్చారు", "హాజరయ్యారు", "హాజరు", "present", "పిల్లలు"],
    "children_absent": ["రాలేదు", "రాలేవు", "గైర్హాజరు", "absent", "లేరు"],
    "children_enrolled": ["నమోదయ్యారు", "నమోద", "enrolled", "మొత్తం"],
    "meal_count": ["మందికి", "ఎంత", "భోజనం", "meal"],
    "report_date": ["తేదీ", "date"],
}

BOOLEAN_MARKERS: dict[str, dict[str, list[str]]] = {
    "meal_served": {
        "subjects": ["భోజనం", "meal"],
        "positive": ["పెట్టారు", "ఇచ్చారు", "వడ్డించారు", "served", "yes"],
        "negative": ["పెట్టలేదు", "లేదు", "not", "no", "లేవు"],
    },
    "photo_attached": {
        "subjects": ["చిత్రం", "photo", "image"],
        "positive": ["జోడించ", "attached", "yes", " ఉంది"],
        "negative": ["లేదు", "no", "లేవు"],
    },
}

ACTIVITY_SYNONYMS: dict[str, list[str]] = {
    "pre_school": ["ప్రీస్కూల్", "ప్రీ స్కూల్", "preschool", "pre school", "pre_school"],
    "nutrition": ["పోషణ", "nutrition", "భోజనం"],
    "weighing": ["బరువు", "weigh", "తూగి"],
    "home_visit": ["ఇంటి సందర్శన", "home visit", "ఇంళ్లు", "ఇళ్లు"],
    "health_check": ["ఆరోగ్య తనిఖీ", "health check", "ఆరోగ్య"],
}

CAPTURE_MARKERS: dict[str, list[str]] = {
    "preschool_activity": ["ప్రీస్కూల్", "preschool"],
    "remarks": ["వ్యాఖ్య", "remarks", "గమనిక", "జ్వరం"],
}

CAPTURE_STOPWORDS = {
    "భోజనం", "చిత్రం", "వ్యాఖ్య", "రాలేదు", "వచ్చారు", "మంది",
    "preschool", "meal", "photo", "remarks",
}
CAPTURE_PARTICLES = {"లో", "లోని", "లోన", "లో,"}

MAX_HINT_GAP = 6


def verify_grounding(transcript: str, raw_text: str, span: list[int]) -> bool:
    """A source span is valid only if slicing the transcript reproduces raw_text."""
    start, end = span
    if start < 0 or end > len(transcript) or start >= end:
        return False
    return normalise_whitespace(transcript[start:end]) == normalise_whitespace(raw_text)


def _hint_indices(tokens: list[Token], hints: list[str]) -> list[int]:
    found: list[int] = []
    for idx, token in enumerate(tokens):
        if any(hint in token.text for hint in hints):
            found.append(idx)
    return found


def _nearest_chunk(chunks: list[NumberChunk], hint_idx: int) -> NumberChunk | None:
    """Pick the closest number chunk, strictly preferring one *before* the hint.

    Telugu word order places the count before the verb ("ఇరవై నాలుగు మంది
    పిల్లలు వచ్చారు"), so a nearer count in the *following* sentence must not
    outrank the correct count that precedes the hint.  Only when no preceding
    chunk exists in the window do we look ahead.
    """
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
        return min(before, key=lambda pair: pair[0])[1]
    if after:
        return min(after, key=lambda pair: pair[0])[1]
    return None


def _numeric_candidates(
    chunks: list[NumberChunk], tokens: list[Token], hints: list[str]
) -> list[NumberChunk]:
    """Collect distinct number candidates for the most-specific matching hint."""
    for hint in hints:
        indices = _hint_indices(tokens, [hint])
        if not indices:
            continue
        candidates: list[NumberChunk] = []
        seen_values: set[int] = set()
        for idx in indices:
            chunk = _nearest_chunk(chunks, idx)
            if chunk is not None and chunk.value not in seen_values:
                seen_values.add(chunk.value)
                candidates.append(chunk)
        if candidates:
            return candidates
    return []


def _make_extraction(
    field_id: str,
    value: object,
    transcript: str,
    start: int,
    end: int,
    confidence: float,
) -> Extraction | None:
    raw_text = transcript[start:end]
    span = [start, end]
    if not verify_grounding(transcript, raw_text, span):
        return None
    return Extraction(
        field_id=field_id,
        value=value,
        raw_text=raw_text,
        source_span=span,
        confidence=confidence,
        needs_confirmation=True,
    )


def _boolean_extraction(
    field_id: str, spec: dict[str, list[str]], tokens: list[Token], transcript: str
) -> Extraction | None:
    subject_indices = _hint_indices(tokens, spec["subjects"])
    if not subject_indices:
        return None
    for subject_idx in subject_indices:
        window = list(range(subject_idx + 1, min(len(tokens), subject_idx + 4)))
        for idx in window:
            word = tokens[idx].text
            if any(neg in word for neg in spec["negative"]):
                return _make_extraction(
                    field_id, False, transcript, tokens[subject_idx].start,
                    tokens[idx].end, 0.8,
                )
            if any(pos in word for pos in spec["positive"]):
                return _make_extraction(
                    field_id, True, transcript, tokens[subject_idx].start,
                    tokens[idx].end, 0.8,
                )
        # Subject with no assertion: treat a bare mention as True only for photo.
        if field_id == "photo_attached":
            return _make_extraction(
                field_id, True, transcript, tokens[subject_idx].start,
                tokens[subject_idx].end, 0.6,
            )
    return None


def _activity_extraction(
    tokens: list[Token], transcript: str
) -> Extraction | None:
    matched: list[str] = []
    first_span: tuple[int, int] | None = None
    for option, synonyms in ACTIVITY_SYNONYMS.items():
        for idx, token in enumerate(tokens):
            if any(syn in token.text for syn in synonyms):
                if option not in matched:
                    matched.append(option)
                if first_span is None:
                    first_span = (token.start, token.end)
                break
    if not matched or first_span is None:
        return None
    return _make_extraction(
        "activity_type", matched, transcript, first_span[0], first_span[1], 0.8
    )


def _capture_extraction(
    field_id: str, markers: list[str], tokens: list[Token], transcript: str
) -> Extraction | None:
    for idx, token in enumerate(tokens):
        if not any(marker in token.text for marker in markers):
            continue
        captured: list[Token] = []
        for pos in range(idx + 1, min(len(tokens), idx + 9)):
            candidate = tokens[pos]
            if candidate.text in CAPTURE_STOPWORDS:
                break
            captured.append(candidate)
            if candidate.raw.endswith((".", "।", "。")):
                break
        if not captured:
            continue
        # Drop leading particles so the span starts at the actual content.
        while captured and captured[0].text in CAPTURE_PARTICLES:
            captured.pop(0)
        if not captured:
            continue
        start, end = captured[0].start, captured[-1].end
        value = normalise_whitespace(" ".join(t.text for t in captured))
        return _make_extraction(field_id, value, transcript, start, end, 0.7)
    return None


def _date_extraction(transcript: str) -> Extraction | None:
    match = re.search(r"\d{4}-\d{2}-\d{2}", transcript)
    if not match:
        return None
    return _make_extraction(
        "report_date", match.group(0), transcript, match.start(), match.end(), 0.9
    )


def extract(transcript: str) -> tuple[list[Extraction], list[str]]:
    """Return (extractions, ambiguity_field_ids) for a transcript.

    At most one Extraction is emitted per field (the highest-confidence
    candidate).  Disagreement between candidates, or a semantic contradiction,
    places the involved field ids in the ambiguity list.
    """
    tokens = normalise_transcript(transcript)
    chunks = number_chunks(tokens)

    candidates: dict[str, list[Extraction]] = {}
    ambiguities: set[str] = set()

    # Numeric fields.
    for field_id, hints in NUMERIC_HINTS.items():
        for chunk in _numeric_candidates(chunks, tokens, hints):
            extraction = _make_extraction(
                field_id, chunk.value, transcript, chunk.start, chunk.end, 0.9
            )
            if extraction is not None:
                candidates.setdefault(field_id, []).append(extraction)

    # Boolean fields.
    for field_id, spec in BOOLEAN_MARKERS.items():
        extraction = _boolean_extraction(field_id, spec, tokens, transcript)
        if extraction is not None:
            candidates.setdefault(field_id, []).append(extraction)

    # Enum and free-text fields.
    activity = _activity_extraction(tokens, transcript)
    if activity is not None:
        candidates.setdefault("activity_type", []).append(activity)
    for field_id, markers in CAPTURE_MARKERS.items():
        extraction = _capture_extraction(field_id, markers, tokens, transcript)
        if extraction is not None:
            candidates.setdefault(field_id, []).append(extraction)
    date_extraction = _date_extraction(transcript)
    if date_extraction is not None:
        candidates.setdefault("report_date", []).append(date_extraction)

    # Select one extraction per field; conflicting values mark ambiguity.
    extractions: list[Extraction] = []
    chosen_values: dict[str, object] = {}
    for field_id, options in candidates.items():
        extractions.append(options[0])
        chosen_values[field_id] = options[0].value
        distinct = {str(o.value) for o in options}
        if len(distinct) > 1:
            ambiguities.add(field_id)

    ambiguities.update(ambiguity_fields(chosen_values))
    return extractions, sorted(ambiguities)


def gaps_from(extractions: list[Extraction]) -> list[str]:
    """Required fields still missing, excluding synthetic top-level fields."""
    extracted_ids = {e.field_id for e in extractions}
    return [
        fid
        for fid in required_field_ids()
        if fid not in extracted_ids and fid not in AUTO_FIELD_IDS
    ]


def values_from(extractions: list[Extraction]) -> dict[str, object]:
    return {e.field_id: e.value for e in extractions}
