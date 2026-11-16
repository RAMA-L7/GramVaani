from __future__ import annotations

from app.pipeline.assemble import assemble_sample_report
from app.pipeline.clarify import build_questions, rank_gaps
from app.pipeline.extract import extract, gaps_from, values_from, verify_grounding
from app.validation import validate_fields, validate_report


TELUGU_MIXED = (
    "ఈరోజు 24 మంది పిల్లలు వచ్చారు. 3 absent. "
    "భోజనం పెట్టారు, 24 మందికి meal ఇచ్చారు. "
    "ప్రీ స్కూల్ లో rhymes మరియు ఆటలు. గమనిక: synthetic note."
)


def test_extraction_grounded_with_source_spans(test_env):
    extractions, ambiguities = extract(TELUGU_MIXED)
    by_id = {e.field_id: e for e in extractions}
    assert by_id["children_present"].value == 24
    assert by_id["children_absent"].value == 3
    assert by_id["meal_served"].value is True
    assert by_id["meal_count"].value == 24
    assert "pre_school" in (by_id.get("activity_type").value if by_id.get("activity_type") else [])
    for e in extractions:
        start, end = e.source_span
        assert verify_grounding(TELUGU_MIXED, e.raw_text, [start, end])
        assert TELUGU_MIXED[start:end] == e.raw_text
        assert e.needs_confirmation is True
    # no required gaps in this synthetic example except maybe date/centre handled separately
    assert "children_present" not in gaps_from(extractions)
    assert "activity_type" not in gaps_from(extractions)


def test_unverifiable_values_not_emitted(test_env):
    # Contrived case: verify_grounding rejects mismatched span
    assert verify_grounding("hello 24 world", "25", [6, 8]) is False


def test_numeric_telugu_words_extraction(test_env):
    text = "ఈరోజు ఇరవై నాలుగు మంది పిల్లలు వచ్చారు, ముగ్గురు రాలేదు."
    extractions, ambiguities = extract(text)
    vals = values_from(extractions)
    assert vals.get("children_present") == 24
    assert vals.get("children_absent") == 3
    assert ambiguities == []


def test_clarification_ranking_and_filtering(test_env):
    gaps = ["children_present", "activity_type", "remarks"]
    ranked = rank_gaps(gaps)
    # required before optional
    assert ranked.index("activity_type") < ranked.index("remarks")
    qs = build_questions(gaps, {"activity_type": ["pre_school"]})
    ids = [q.field_id for q in qs]
    assert "activity_type" not in ids
    assert "children_present" in ids


def test_validation_contradictions_and_confirmation_requirement(test_env):
    bad = validate_fields({"meal_served": False, "meal_count": 5})
    assert bad.valid is False
    assert any("contradiction" in e for e in bad.errors)
    bounds = validate_fields({"children_present": -1})
    assert bounds.valid is False
    # assemble without explicit confirmation -> report validation should fail on confirmation
    report = assemble_sample_report([], explicit_confirmation=False)
    vr = validate_report(report.model_dump(mode="json"))
    assert vr.valid is False
    assert any("explicit_confirmation" in e for e in vr.errors)


def test_assemble_corrections_and_labels(test_env):
    extractions, _ = extract("ఈరోజు 20 మంది పిల్లలు వచ్చారు. భోజనం పెట్టారు 20 మందికి.")
    report = assemble_sample_report(
        extractions,
        corrections={"children_present": 22, "meal_count": 22},
        explicit_confirmation=True,
    )
    assert report.fields["children_present"] == 22
    assert report.fields["meal_count"] == 22
    assert report.pilot_unverified is True
    assert report.not_official is True
    assert report.not_submitted is True
    assert report.experimental is True
    assert "PILOT_UNVERIFIED" in report.status_label
    assert "NOT SUBMITTED" in report.status_label
    assert report.confirmation.explicit_confirmation is True
    vr = validate_report(report.model_dump(mode="json"))
    # may still have missing required fields depending on extraction, but confirmation flag satisfied
    assert not any("explicit_confirmation" in e for e in vr.errors)
