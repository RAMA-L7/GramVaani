"""ASR provider registry and capability reporting."""
from __future__ import annotations

from typing import Any

from .base import ASRError, ASRProvider
from .browser import BrowserASRProvider
from .cloud_http import CloudHTTPASRProvider
from .faster_whisper import FasterWhisperASRProvider
from .manual import ManualASRProvider


def all_providers() -> list[ASRProvider]:
    # Order reflects practical pilot approaches: browser/client, local, cloud, manual fallback.
    return [
        BrowserASRProvider(),
        FasterWhisperASRProvider(),
        CloudHTTPASRProvider(),
        ManualASRProvider(),
    ]


ALIASES = {
    "client_provided": "browser",
    "client": "browser",
    "web_speech": "browser",
    "whisper": "faster_whisper",
    "cloud": "cloud_http",
    "google": "cloud_http",
    "azure": "cloud_http",
    "sarvam": "cloud_http",
    "none": "manual",
}


def normalize_provider_id(provider_id: str | None) -> str:
    pid = (provider_id or "").strip().lower()
    return ALIASES.get(pid, pid)


def get_provider(provider_id: str | None) -> ASRProvider:
    pid = normalize_provider_id(provider_id)
    for p in all_providers():
        if p.id == pid:
            return p
    known = [p.id for p in all_providers()] + sorted(ALIASES.keys())
    raise ASRError(f"Unknown ASR provider '{provider_id}'.", status_code=400, details={"known": known})


def capabilities_response() -> dict[str, Any]:
    providers = [p.capability() for p in all_providers()]
    return {
        "providers": providers,
        "disclaimer": (
            "Pilot ASR capabilities are experimental. No provider is selected based on advertised accuracy; "
            "Telugu accent/noise robustness is not guaranteed. Browser recognition depends on client support; "
            "local/cloud providers require dependencies, models, credentials, and/or network access as noted."
        ),
    }
