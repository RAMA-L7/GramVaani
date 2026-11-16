"""Extraction provider interface."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ExtractionProvider(ABC):
    name: str = "rules"

    @abstractmethod
    def extract(self, transcript: str) -> tuple[list[Any], list[str]]:
        raise NotImplementedError
