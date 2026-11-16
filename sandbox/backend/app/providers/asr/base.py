"""Abstract ASR provider interface (simulated implementations only)."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ASRProvider(ABC):
    name: str = "simulated"

    @abstractmethod
    def transcribe(self, scenario_id: str | None, text: str | None) -> dict[str, Any]:
        """Return {transcript, provider, simulated, duration_ms}."""
        raise NotImplementedError
