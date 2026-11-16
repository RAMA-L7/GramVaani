"""Deterministic rule-based extraction provider backed by the pipeline."""
from __future__ import annotations

from typing import Any

from ...pipeline.extract import extract
from .base import ExtractionProvider


class RuleExtractionProvider(ExtractionProvider):
    name = "rules-v1"

    def extract(self, transcript: str) -> tuple[list[Any], list[str]]:
        return extract(transcript)
