"""Validation for pilot sample reports and extracted field maps."""
from __future__ import annotations

from typing import Any

from jsonschema import Draft7Validator

from .config import field_definitions, field_min_max, field_option_values, fields_by_id, load_field_config
from .models import ValidationResult

_TYPE_MAP = {
    "integer": {"type": "integer"},
    "boolean": {"type": "boolean"},
    "string": {"type": "string"},
    "date": {"type": "string"},
    "enum_list": {"type": "array", "items": {"type": "string"}},
}


def build_fields_schema() -> dict[str, Any]:
    properties: dict[str, Any] = {}
    for field in field_definitions():
        ftype = field.get("type", "string")
        prop: dict[str, Any] = dict(_TYPE_MAP.get(ftype, {"type": "string"}))
        if ftype == "integer":
            mn, mx = field_min_max(field)
            if mn is not None:
                prop["minimum"] = mn
            if mx is not None:
                prop["maximum"] = mx
        if ftype == "enum_list":
            opts = field_option_values(field)
            if opts:
                prop["items"] = {"enum": opts}
        properties[field["id"]] = prop
    return {"type": "object", "properties": properties, "additionalProperties": True}


def _as_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        s = value.strip()
        if s.lstrip("-").isdigit():
            try:
                return int(s)
            except ValueError:
                return None
    return None


def _dedupe(errors: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for e in errors:
        if e not in seen:
            seen.add(e)
            out.append(e)
    return out


def contradiction_errors(fields: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    defs = fields_by_id()

    for field_id, value in fields.items():
        spec = defs.get(field_id)
        if not spec or spec.get("type") != "integer":
            continue
        number = _as_int(value)
        if number is None:
            errors.append(f"{field_id}: expected an integer")
            continue
        if number < 0:
            errors.append(f"{field_id}: must be non-negative")
        mn, mx = field_min_max(spec)
        if mn is not None and number < mn:
            errors.append(f"{field_id}: below minimum {mn}")
        if mx is not None and number > mx:
            errors.append(f"{field_id}: above maximum {mx}")

    present = _as_int(fields.get("children_present"))
    absent = _as_int(fields.get("children_absent"))
    enrolled = _as_int(fields.get("children_enrolled"))
    if enrolled is not None and present is not None and absent is not None:
        if present + absent > enrolled:
            errors.append("children_absent + children_present must not exceed children_enrolled")

    meal_served = fields.get("meal_served")
    meal_count = _as_int(fields.get("meal_count"))
    if meal_served is False and meal_count is not None and meal_count > 0:
        errors.append("meal_served=false with meal_count>0 is a contradiction")

    return errors


def validate_fields(fields: dict[str, Any]) -> ValidationResult:
    errors: list[str] = []
    validator = Draft7Validator(build_fields_schema())
    for err in sorted(validator.iter_errors(fields), key=lambda e: list(e.path)):
        location = ".".join(str(p) for p in err.path) or "fields"
        errors.append(f"{location}: {err.message}")
    errors.extend(contradiction_errors(fields))
    unique = _dedupe(errors)
    return ValidationResult(valid=len(unique) == 0, errors=unique)


def validate_report(report: dict[str, Any]) -> ValidationResult:
    errors: list[str] = []
    fields = report.get("fields") or {}
    config = load_field_config()
    confirmation = report.get("confirmation") or {}
    if confirmation.get("explicit_confirmation") is not True:
        errors.append("confirmation: explicit_confirmation is required before generating a sample report")

    for field in config.get("fields", []):
        if field.get("requirement") != "required":
            continue
        fid = field["id"]
        if fid == "report_date":
            value = report.get("report_date")
        elif fid == "centre_code":
            value = (report.get("worker") or {}).get("centre_code")
        else:
            value = fields.get(fid)
        if value is None or value == "" or value == []:
            errors.append(f"{fid}: required field is missing")

    errors.extend(validate_fields(fields).errors)
    unique = _dedupe(errors)
    return ValidationResult(valid=len(unique) == 0, errors=unique)


def ambiguity_fields(extracted_values: dict[str, Any]) -> list[str]:
    ambiguous: set[str] = set()
    if extracted_values.get("meal_served") is False and (_as_int(extracted_values.get("meal_count")) or 0) > 0:
        ambiguous.update({"meal_served", "meal_count"})
    present = _as_int(extracted_values.get("children_present"))
    absent = _as_int(extracted_values.get("children_absent"))
    enrolled = _as_int(extracted_values.get("children_enrolled"))
    if enrolled is not None and present is not None and absent is not None:
        if present + absent > enrolled:
            ambiguous.update({"children_present", "children_absent", "children_enrolled"})
    return sorted(ambiguous)
