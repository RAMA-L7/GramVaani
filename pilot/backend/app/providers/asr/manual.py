"""Manual / no-ASR provider.

Used as a fallback when no automated recognition is available or desired.
This provider never fabricates transcripts from audio.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import ASRError, ASRProvider, ASRResult


class ManualASRProvider(ASRProvider):
    id = "manual"
    label = "Manual transcript (no ASR)"
    mode = "manual"

    def capability(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "available": True,
            "mode": self.mode,
            "requires": [],
            "notes": [
                "No automatic speech recognition is performed.",
                "User/worker must provide or correct the transcript manually.",
            ],
            "configured": True,
        }

    async def transcribe_audio(self, audio_path: Path, language: str | None = None, content_type: str | None = None, filename: str | None = None) -> ASRResult:
        raise ASRError(
            "Manual provider does not perform ASR. Submit a transcript via /api/transcribe/submit-text or choose an available ASR provider.",
            status_code=400,
            details={"provider": self.id, "available": True},
        )
