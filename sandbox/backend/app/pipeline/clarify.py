"""Rank gaps and build clarification questions from the field config."""
from __future__ import annotations

from typing import Any

from ..config import clarification_for, field_definitions, fields_by_id
from ..models import Question

REQUIREMENT_RANK = {"required": 0, "optional": 1}


def rank_gaps(gaps: list[str]) -> list[str]:
    """Required fields first, then config declaration order."""
    order = {f["id"]: i for i, f in enumerate(field_definitions())}
    specs = fields_by_id()

    def key(fid: str) -> tuple[int, int]:
        return (
            REQUIREMENT_RANK.get(specs.get(fid, {}).get("requirement", "optional"), 1),
            order.get(fid, 10_000),
        )

    return sorted(set(gaps), key=key)


def build_questions(gaps: list[str], answers: dict[str, Any]) -> list[Question]:
    """Create one question per unanswered gap, in ranked order.

    A gap is considered answered when ``answers`` contains a non-empty value
    for it, so a frontend can post partial answers and only receive the rest.
    """
    answered = {
        fid for fid, value in answers.items() if value is not None and value != "" and value != []
    }
    remaining = [fid for fid in rank_gaps(gaps) if fid not in answered]
    questions: list[Question] = []
    for fid in remaining:
        spec = clarification_for(fid)
        questions.append(
            Question(
                field_id=fid,
                question_te=spec["question_te"],
                question_en=spec["question_en"],
                type=spec["type"],
            )
        )
    return questions
