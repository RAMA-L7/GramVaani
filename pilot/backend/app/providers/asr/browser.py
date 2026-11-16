"""Client-provided/browser recognition mode.

Recognition is performed in the browser (e.g. Web Speech API where supported).
The server accepts the resulting transcript for recording/evaluation hooks and
downstream pilot workflow. This is a real end-to-end path when the browser
supports it; the server does not claim to have recognized audio itself.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

from .base import ASRError, ASRProvider, ASRResult


class BrowserASRProvider(ASRProvider):
    id = "browser"
    label = "Browser/client-provided recognition (Web Speech API or equivalent)"
    mode = "client"

    def capability(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "available": True,
            "mode": self.mode,
            "requires": ["Browser support for client-side speech recognition (e.g. Web Speech API)", "User grants microphone permission in browser"],
            "notes": [
                "Recognition runs on the client device/browser when supported; server ingests transcript via /api/transcribe/submit-text.",
                "Browser support, accuracy, accent/noise robustness, and Telugu coverage vary by browser/device and are not guaranteed.",
                "Server does not fake recognition from uploaded audio in this mode.",
            ],
            "configured": True,
        }

    async def transcribe_audio(self, audio_path: Path, language: str | None = None, content_type: str | None = None, filename: str | None = None) -> ASRResult:
        raise ASRError(
            "Browser/client_provided mode performs recognition in the browser. Submit the recognized transcript to /api/transcribe/submit-text.",
            status_code=400,
            details={"provider": self.id, "client_mode": True},
        )
