"""Assemble an experimental pilot sample report.

The result is always labeled PILOT_UNVERIFIED, NOT_OFFICIAL, NOT SUBMITTED.
No external/government submission is performed.
"""
from __future__ import annotations

from datetime import date
from typing import Any

from ..config import DEFAULT_SCHEMA_VERSION, SAMPLE_REPORT_LABEL, SYNTHETIC_CENTRE_CODE, SYNTHETIC_WORKER_CODE, fields_by_id, load_field_config
from ..models import Confirmation, Extraction, SampleReport, Worker, utc_now


def _coerce(field_id: str, value: Any) -> Any:
    spec = fields_by_id().get(field_id, {})
    ftype = spec.get("type")
    if isinstance(value, str):
        if ftype == "integer":
            text = value.strip()
            if text.lstrip("-").isdigit():
                try:
                    return int(text)
                except ValueError:
                    return value
        elif ftype == "boolean":
            lowered = value.strip().lower()
            if lowered in {"true", "yes", "1", "అవును"}:
                return True
            if lowered in {"false", "no", "0", "కాదు", "లేదు"}:
                return False
        elif ftype == "enum_list":
            return [part.strip() for part in value.split(",") if part.strip()]
    return value


def assemble_sample_report(
    extractions: list[Extraction],
    answers: dict[str, Any] | None = None,
    corrections: dict[str, Any] | None = None,
    transcript_ref: str | None = None,
    report_date: str | None = None,
    explicit_confirmation: bool = False,
    worker: Worker | None = None,
) -> SampleReport:
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

    centre_code = fields.pop("centre_code", SYNTHETIC_CENTRE_CODE) or SYNTHETIC_CENTRE_CODE
    date_value = fields.pop("report_date", None) or report_date or date.today().isoformat()
    w = worker or Worker(worker_code=SYNTHETIC_WORKER_CODE, centre_code=str(centre_code))
    if not w.centre_code:
        w.centre_code = str(centre_code)

    return SampleReport(
        schema_version=config.get("schema_version", DEFAULT_SCHEMA_VERSION),
        report_kind="sample_report",
        status_label=SAMPLE_REPORT_LABEL,
        experimental=True,
        not_official=True,
        not_submitted=True,
        pilot_unverified=True,
        worker=w,
        report_date=str(date_value),
        fields=fields,
        transcript_ref=transcript_ref,
        confirmation=Confirmation(confirmed_by=w.worker_code, confirmed_at=utc_now(), explicit_confirmation=bool(explicit_confirmation)),
        status="confirmed_sample" if explicit_confirmation else "draft",
    )
