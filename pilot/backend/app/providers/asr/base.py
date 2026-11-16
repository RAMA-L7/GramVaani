"""ASR provider interfaces and result types for the pilot backend.

Providers must not fake successful recognition. If credentials, dependencies,
models, or runtime support are unavailable, they must report unavailability or
raise/return a clear error/warning state as appropriate.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class ASRResult:
    transcript: str
    original_transcript: str
    provider: str
    language: str | None = None
    duration_ms: int | None = None
    segments: list[dict[str, Any]] | None = None
    confidence: float | None = None
    warnings: list[str] = field(default_factory=list)
    simulated: bool = False
    meta: dict[str, Any] = field(default_factory=dict)


class ASRError(RuntimeError):
    """Provider-specific ASR failure with user-facing detail."""

    def __init__(self, message: str, status_code: int = 400, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class ASRProvider(ABC):
    id: str = "base"
    label: str = "Base"
    mode: str = "server"

    @abstractmethod
    def capability(self) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def transcribe_audio(
        self,
        audio_path: Path,
        language: str | None = None,
        content_type: str | None = None,
        filename: str | None = None,
    ) -> ASRResult:
        raise NotImplementedError
