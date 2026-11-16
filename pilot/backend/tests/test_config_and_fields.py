from __future__ import annotations

from app.config import clarification_for, field_definitions, fields_by_id, load_field_config, required_field_ids


def test_pilot_field_config_loads(test_env):
    cfg = load_field_config()
    assert cfg.get("config_status") == "PILOT_UNVERIFIED"
    assert cfg.get("data_status") == "ILLUSTRATIVE_NOT_OFFICIAL"
    assert "NOT_OFFICIAL" in (cfg.get("disclaimer") or "")
    fields = field_definitions()
    assert isinstance(fields, list) and fields
    by_id = fields_by_id()
    assert "report_date" in by_id
    assert "children_present" in by_id
    # required fields include core ones
    req = set(required_field_ids())
    assert "report_date" in req
    assert "activity_type" in req
    assert "children_present" in req


def test_clarification_helpers(test_env):
    q = clarification_for("children_present")
    assert q["field_id"] == "children_present"
    assert q["question_en"]
    assert q["question_te"]
    assert q["type"] == "integer"
