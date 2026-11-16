"""Echo provider: returns the worker-supplied text verbatim (simulated)."""
from __future__ import annotations

from typing import Any

from .base import ASRProvider


class TextASRProvider(ASRProvider):
    name = "text-echo"

    def transcribe(self, scenario_id: str | None, text: str | None) -> dict[str, Any]:
        return {
            "transcript": text or "",
            "provider": self.name,
            "simulated": True,
            "duration_ms": 0,
        }
