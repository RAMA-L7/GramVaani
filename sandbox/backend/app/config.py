"""Configuration and scenario loading.

Loads the illustrative field definitions from ../config/sandbox-fields.json and
scripted scenarios from ../scenarios/<id>.json.  Both are read-only inputs owned
by other agents; this module never writes to them.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

# backend/app/config.py -> parents[1] = backend/, parents[2] = sandbox/
BACKEND_DIR = Path(__file__).resolve().parents[1]
SANDBOX_DIR = Path(__file__).resolve().parents[2]
FIELDS_PATH = SANDBOX_DIR / "config" / "sandbox-fields.json"
SCENARIOS_DIR = SANDBOX_DIR / "scenarios"

SYNTHETIC_WORKER_CODE = "SYN-W001"
SYNTHETIC_CENTRE_CODE = "SYN-C001"
DEFAULT_SCHEMA_VERSION = "sandbox-0.1"


@lru_cache(maxsize=1)
def load_field_config() -> dict[str, Any]:
    """Return the raw sandbox-fields.json document."""
    with FIELDS_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def field_definitions() -> list[dict[str, Any]]:
    return load_field_config().get("fields", [])


def fields_by_id() -> dict[str, dict[str, Any]]:
    return {f["id"]: f for f in field_definitions()}


def required_field_ids() -> list[str]:
    return [f["id"] for f in field_definitions() if f.get("requirement") == "required"]


# These are always supplied synthetically by the assembler, never asked from a
# worker during voice clarification.
AUTO_FIELD_IDS = {"report_date", "centre_code"}


def clarification_for(field_id: str) -> dict[str, str]:
    f = fields_by_id().get(field_id, {})
    return {
        "field_id": field_id,
        "question_te": f.get("clarification_te", f.get("label_te", field_id)),
        "question_en": f.get("clarification_en", f.get("label_en", field_id)),
        "type": f.get("type", "string"),
    }


def scenarios_available() -> bool:
    return SCENARIOS_DIR.is_dir()


def list_scenarios() -> list[dict[str, Any]]:
    """Return [{id, title, category}] for every scenario file, sorted by id."""
    if not scenarios_available():
        return []
    results: list[dict[str, Any]] = []
    for path in sorted(SCENARIOS_DIR.glob("*.json")):
        if path.name == "manifest.json":
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        results.append(
            {
                "id": data.get("id", path.stem),
                "title": data.get("title", path.stem),
                "category": data.get("category", "normal"),
            }
        )
    # Deduplicate by id (a manifest may duplicate ids).
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in results:
        if item["id"] not in seen:
            seen.add(item["id"])
            unique.append(item)
    return unique


def load_scenario(scenario_id: str) -> dict[str, Any] | None:
    """Load a single scenario JSON, or None when it is absent."""
    if not scenarios_available():
        return None
    # Prevent path traversal: only a plain id maps to a file name.
    if not scenario_id or "/" in scenario_id or "\\" in scenario_id or ".." in scenario_id:
        return None
    path = SCENARIOS_DIR / f"{scenario_id}.json"
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def gateway_mode_for(scenario_id: str | None) -> dict[str, Any]:
    """Return the gateway config block for a scenario, with safe defaults."""
    if not scenario_id:
        return {"mode": "accept", "fail_first_attempt": False}
    scenario = load_scenario(scenario_id) or {}
    gateway = scenario.get("gateway") or {}
    return {
        "mode": gateway.get("mode", "accept"),
        "fail_first_attempt": bool(gateway.get("fail_first_attempt", False)),
    }
