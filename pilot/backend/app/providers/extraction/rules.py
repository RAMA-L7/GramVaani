"""Rule-based grounded extraction provider for pilot."""
from __future__ import annotations

from typing import Any

from ...pipeline.extract import extract
from .base import ExtractionProvider


class RuleExtractionProvider(ExtractionProvider):
    name = "rules-v1-pilot"

    def extract(self, transcript: str) -> tuple[list[Any], list[str]]:
        return extract(transcript)
