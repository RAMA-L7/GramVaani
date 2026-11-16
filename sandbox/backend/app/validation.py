"""Validation rules for assembled reports and extracted values.

Combines explicit contract rules with a generated JSON Schema (via jsonschema)
for field-level type/range checks.  All values are synthetic; nothing here
contacts an external system.
"""
from __future__ import annotations

from typing import Any

from jsonschema import Draft7Validator

from .config import field_definitions, fields_by_id, load_field_config
from .models import ValidationResult

_TYPE_MAP = {
    "integer": {"type": "integer"},
    "boolean": {"type": "boolean"},
    "string": {"type": "string"},
    "date": {"type": "string"},
    "enum_list": {"type": "array", "items": {"type": "string"}},
}


def build_fields_schema() -> dict[str, Any]:
    """Derive a JSON Schema for the report `fields` map from field config."""
    properties: dict[str, Any] = {}
    for field in field_definitions():
        ftype = field.get("type", "string")
        prop: dict[str, Any] = dict(_TYPE_MAP.get(ftype, {"type": "string"}))
        if ftype == "integer":
            if "min" in field:
                prop["minimum"] = field["min"]
            if "max" in field:
                prop["maximum"] = field["max"]
        if ftype == "enum_list" and field.get("options"):
            prop["items"] = {"enum": field["options"]}
        properties[field["id"]] = prop
    return {"type": "object", "properties": properties, "additionalProperties": True}


def _as_int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.strip().lstrip("-").isdigit():
        return int(value.strip())
    return None


def _dedupe(errors: list[str]) -> list[str]:
    seen: set[str] = set()
    return [e for e in errors if not (e in seen or seen.add(e))]


def contradiction_errors(fields: dict[str, Any]) -> list[str]:
    """Return contract-level semantic/contradiction errors for a fields map."""
    errors: list[str] = []
    defs = fields_by_id()

    # Integer bounds and non-negativity (belt-and-braces alongside JSON Schema).
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
        minimum = spec.get("min")
        maximum = spec.get("max")
        if minimum is not None and number < minimum:
            errors.append(f"{field_id}: below minimum {minimum}")
        if maximum is not None and number > maximum:
            errors.append(f"{field_id}: above maximum {maximum}")

    present = _as_int(fields.get("children_present"))
    absent = _as_int(fields.get("children_absent"))
    enrolled = _as_int(fields.get("children_enrolled"))
    if enrolled is not None and present is not None and absent is not None:
        if present + absent > enrolled:
            errors.append(
                "children_absent + children_present must not exceed children_enrolled"
            )

    meal_served = fields.get("meal_served")
    meal_count = _as_int(fields.get("meal_count"))
    if meal_served is False and meal_count is not None and meal_count > 0:
        errors.append("meal_served=false with meal_count>0 is a contradiction")

    return errors


def validate_fields(fields: dict[str, Any]) -> ValidationResult:
    """Validate only the `fields` map (types, ranges, contradictions)."""
    errors: list[str] = []
    validator = Draft7Validator(build_fields_schema())
    for err in sorted(validator.iter_errors(fields), key=lambda e: list(e.path)):
        location = ".".join(str(p) for p in err.path) or "fields"
        errors.append(f"{location}: {err.message}")
    errors.extend(contradiction_errors(fields))
    unique = _dedupe(errors)
    return ValidationResult(valid=len(unique) == 0, errors=unique)


def validate_report(report: dict[str, Any]) -> ValidationResult:
    """Validate a full SandboxReport, including required fields and top-level data."""
    errors: list[str] = []
    fields = report.get("fields") or {}
    config = load_field_config()

    # Required fields: report_date and centre_code live at the top level; the
    # rest live in `fields`.
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
    """Detect contradictions among *extracted* values (pre-confirmation).

    Returns the field ids involved in an ambiguity so the UI can ask the worker.
    """
    ambiguous: set[str] = set()
    fields = extracted_values

    if fields.get("meal_served") is False and (_as_int(fields.get("meal_count")) or 0) > 0:
        ambiguous.update({"meal_served", "meal_count"})

    present = _as_int(fields.get("children_present"))
    absent = _as_int(fields.get("children_absent"))
    enrolled = _as_int(fields.get("children_enrolled"))
    if enrolled is not None and present is not None and absent is not None:
        if present + absent > enrolled:
            ambiguous.update({"children_present", "children_absent", "children_enrolled"})

    return sorted(ambiguous)
