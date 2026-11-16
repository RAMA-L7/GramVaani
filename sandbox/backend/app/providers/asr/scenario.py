"""Scripted-transcript ASR provider: reads ../scenarios/<id>.json."""
from __future__ import annotations

from typing import Any

from ...config import load_scenario
from .base import ASRProvider


class ScenarioASRProvider(ASRProvider):
    name = "scenario-scripted"

    def transcribe(self, scenario_id: str | None, text: str | None) -> dict[str, Any]:
        scenario = load_scenario(scenario_id or "")
        transcript = (scenario or {}).get("transcript", "")
        return {
            "transcript": transcript,
            "provider": self.name,
            "simulated": True,
            "duration_ms": 0,
        }
