"""Assemble a SandboxReport from extractions, answers and worker corrections.

Precedence: extractions < clarification answers < worker corrections.  The
report is only assembled after the explicit confirm step has been reached.
"""
from __future__ import annotations

from datetime import date
from typing import Any

from ..config import (
    DEFAULT_SCHEMA_VERSION,
    SYNTHETIC_CENTRE_CODE,
    SYNTHETIC_WORKER_CODE,
    fields_by_id,
    load_field_config,
)
from ..models import Confirmation, Extraction, SandboxReport, Worker, utc_now


def _coerce(field_id: str, value: Any) -> Any:
    """Coerce answer/correction strings into the configured field type."""
    spec = fields_by_id().get(field_id, {})
    ftype = spec.get("type")
    if isinstance(value, str):
        if ftype == "integer":
            text = value.strip()
            if text.lstrip("-").isdigit():
                return int(text)
        elif ftype == "boolean":
            lowered = value.strip().lower()
            if lowered in {"true", "yes", "1", "అవును"}:
                return True
            if lowered in {"false", "no", "0", "కాదు"}:
                return False
        elif ftype == "enum_list":
            return [part.strip() for part in value.split(",") if part.strip()]
    return value


def assemble_report(
    extractions: list[Extraction],
    answers: dict[str, Any] | None = None,
    corrections: dict[str, Any] | None = None,
    scenario_id: str | None = None,
    report_date: str | None = None,
) -> SandboxReport:
    answers = answers or {}
    corrections = corrections or {}
    config = load_field_config()

    fields: dict[str, Any] = {}
    for extraction in extractions:
        fields[extraction.field_id] = _coerce(extraction.field_id, extraction.value)
    for field_id, value in answers.items():
        fields[field_id] = _coerce(field_id, value)
    for field_id, value in corrections.items():
        fields[field_id] = _coerce(field_id, value)

    # Centre code and report date live at the top level in the contract.
    centre_code = fields.pop("centre_code", SYNTHETIC_CENTRE_CODE) or SYNTHETIC_CENTRE_CODE
    date_value = fields.pop("report_date", None) or report_date or date.today().isoformat()

    return SandboxReport(
        schema_version=config.get("schema_version", DEFAULT_SCHEMA_VERSION),
        worker=Worker(
            worker_code=SYNTHETIC_WORKER_CODE,
            centre_code=str(centre_code),
        ),
        report_date=str(date_value),
        fields=fields,
        transcript_ref=scenario_id,
        confirmation=Confirmation(
            confirmed_by=SYNTHETIC_WORKER_CODE,
            confirmed_at=utc_now(),
        ),
        # Matches the data-model example in API_CONTRACT.md (which pairs a
        # confirmation object with status "draft").
        status="draft",
    )
