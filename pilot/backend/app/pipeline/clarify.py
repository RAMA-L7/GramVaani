"""Clarification question generation for pilot fields."""
from __future__ import annotations

from typing import Any

from ..config import clarification_for, field_definitions, fields_by_id
from ..models import Question

REQUIREMENT_RANK = {"required": 0, "optional": 1}


def rank_gaps(gaps: list[str]) -> list[str]:
    order = {f["id"]: i for i, f in enumerate(field_definitions())}
    specs = fields_by_id()

    def key(fid: str) -> tuple[int, int]:
        return (
            REQUIREMENT_RANK.get(specs.get(fid, {}).get("requirement", "optional"), 1),
            order.get(fid, 10_000),
        )

    return sorted(set(gaps), key=key)


def build_questions(gaps: list[str], answers: dict[str, Any]) -> list[Question]:
    answered = {
        fid for fid, value in (answers or {}).items()
        if value is not None and value != "" and value != []
    }
    remaining = [fid for fid in rank_gaps(gaps) if fid not in answered]
    questions: list[Question] = []
    for fid in remaining:
        spec = clarification_for(fid)
        questions.append(
            Question(field_id=fid, question_te=spec["question_te"], question_en=spec["question_en"], type=spec["type"])
        )
    return questions
