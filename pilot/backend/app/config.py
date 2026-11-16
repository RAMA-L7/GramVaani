"""Pilot backend configuration.

Loads pilot-only field config (PILOT_UNVERIFIED / NOT_OFFICIAL) and runtime
settings from environment variables. Does not read or modify sandbox config.
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parents[1]
PILOT_DIR = Path(__file__).resolve().parents[2]

DEFAULT_CONFIG_PATH = PILOT_DIR / "config" / "pilot-fields.json"
DEFAULT_DB_PATH = BACKEND_DIR / "pilot.db"
DEFAULT_AUDIO_TMP = BACKEND_DIR / ".audio_tmp"
DEFAULT_EVAL_RESULTS_DIR = PILOT_DIR / "evaluation" / "results"

SYNTHETIC_WORKER_CODE = "SYN-PILOT-W001"
SYNTHETIC_CENTRE_CODE = "SYN-PILOT-C001"
DEFAULT_SCHEMA_VERSION = "pilot-0.1"
SAMPLE_REPORT_LABEL = (
    "EXPERIMENTAL SAMPLE REPORT - PILOT_UNVERIFIED, NOT_OFFICIAL, NOT SUBMITTED"
)


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_settings() -> dict[str, Any]:
    config_path = Path(os.getenv("PILOT_CONFIG_PATH", str(DEFAULT_CONFIG_PATH)))
    if not config_path.is_absolute():
        config_path = (BACKEND_DIR / config_path).resolve()
    db_path = Path(os.getenv("PILOT_DB_PATH", str(DEFAULT_DB_PATH)))
    if not db_path.is_absolute():
        db_path = (BACKEND_DIR / db_path).resolve()
    audio_tmp = Path(os.getenv("PILOT_AUDIO_TMP", str(DEFAULT_AUDIO_TMP)))
    if not audio_tmp.is_absolute():
        audio_tmp = (BACKEND_DIR / audio_tmp).resolve()
    eval_dir = Path(os.getenv("PILOT_EVALUATION_RESULTS_DIR", str(DEFAULT_EVAL_RESULTS_DIR)))
    if not eval_dir.is_absolute():
        eval_dir = (BACKEND_DIR / eval_dir).resolve()
    cors_raw = os.getenv(
        "PILOT_CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3010,http://127.0.0.1:3000,http://127.0.0.1:3010",
    )
    origins = [o.strip() for o in cors_raw.split(",") if o.strip()]
    return {
        "config_path": config_path,
        "db_path": db_path,
        "audio_tmp": audio_tmp,
        "evaluation_results_dir": eval_dir,
        "cors_origins": origins,
        "retain_audio_default": _env_bool("PILOT_RETAIN_AUDIO_DEFAULT", False),
    }


@lru_cache(maxsize=4)
def load_field_config_cached(path_str: str) -> dict[str, Any]:
    path = Path(path_str)
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def load_field_config() -> dict[str, Any]:
    settings = get_settings()
    return load_field_config_cached(str(settings["config_path"]))


def field_definitions() -> list[dict[str, Any]]:
    return load_field_config().get("fields", [])


def fields_by_id() -> dict[str, dict[str, Any]]:
    return {f["id"]: f for f in field_definitions()}


def required_field_ids() -> list[str]:
    return [f["id"] for f in field_definitions() if f.get("requirement") == "required"]


AUTO_FIELD_IDS = {"report_date", "centre_code"}


def field_hints(field: dict[str, Any], lang: str = "te") -> list[str]:
    extraction = field.get("extraction") or {}
    key = f"hints_{lang}"
    hints = extraction.get(key)
    if isinstance(hints, list):
        return [str(h) for h in hints]
    # sandbox-style fallback
    if lang == "te" and isinstance(field.get("hints_te"), list):
        return [str(h) for h in field["hints_te"]]
    if lang == "en" and isinstance(field.get("hints_en"), list):
        return [str(h) for h in field["hints_en"]]
    return []


def field_option_values(field: dict[str, Any]) -> list[str]:
    options = field.get("options") or []
    values: list[str] = []
    for opt in options:
        if isinstance(opt, dict):
            values.append(str(opt.get("value")))
        else:
            values.append(str(opt))
    return values


def field_min_max(field: dict[str, Any]) -> tuple[int | None, int | None]:
    if isinstance(field.get("validation"), dict):
        v = field["validation"]
        return v.get("min"), v.get("max")
    return field.get("min"), field.get("max")


def clarification_for(field_id: str) -> dict[str, str]:
    f = fields_by_id().get(field_id, {})
    clarification = f.get("clarification") or {}
    q_te = clarification.get("question_te") or f.get("clarification_te") or f.get("label_te", field_id)
    q_en = clarification.get("question_en") or f.get("clarification_en") or f.get("label_en", field_id)
    return {
        "field_id": field_id,
        "question_te": q_te,
        "question_en": q_en,
        "type": f.get("type", "string"),
    }


def ensure_audio_tmp() -> Path:
    path = get_settings()["audio_tmp"]
    path.mkdir(parents=True, exist_ok=True)
    # Best-effort keep marker for gitignore context
    gitkeep = path / ".gitkeep"
    if not gitkeep.exists():
        try:
            gitkeep.write_text("", encoding="utf-8")
        except OSError:
            pass
    return path
