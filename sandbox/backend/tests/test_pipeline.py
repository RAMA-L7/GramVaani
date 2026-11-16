from app.pipeline.assemble import assemble_report
from app.pipeline.clarify import build_questions, rank_gaps
from app.pipeline.extract import extract, gaps_from, verify_grounding, values_from
from app.pipeline.normalise import (
    normalise_number_words,
    normalise_transcript,
    number_chunks,
)
from app.validation import validate_fields

T1 = (
    "ఈరోజు ఇరవై నాలుగు మంది పిల్లలు వచ్చారు. "
    "ముగ్గురు పిల్లలు జ్వరంతో రాలేదు. "
    "భోజనం పెట్టారు. ఇరవై నాలుగు మందికి భోజనం పెట్టారు. "
    "ప్రీస్కూల్ పాటలు కథలు. చిత్రం జోడించారు."
)


def test_telugu_numeral_mapping_and_spans():
    tokens = normalise_transcript(T1)
    chunks = number_chunks(tokens)
    values = [c.value for c in chunks]
    assert 24 in values
    assert 3 in values
    chunk = next(c for c in chunks if c.value == 24)
    assert T1[chunk.start:chunk.end] == "ఇరవై నాలుగు"


def test_normalise_number_words_keeps_english_and_preserves_order():
    assert normalise_number_words("ఇరవై నాలుగు మంది చిల్డ్రన్") == "24 మంది చిల్డ్రన్"


def test_extraction_is_grounded_and_covers_fields():
    extractions, ambiguities = extract(T1)
    by_field = {e.field_id: e for e in extractions}
    assert by_field["children_present"].value == 24
    assert by_field["children_absent"].value == 3
    assert by_field["meal_count"].value == 24
    assert by_field["meal_served"].value is True
    assert by_field["photo_attached"].value is True
    assert ambiguities == []
    for item in extractions:
        start, end = item.source_span
        assert verify_grounding(T1, item.raw_text, [start, end])
        assert item.needs_confirmation is True
    assert gaps_from(extractions) == []


def test_grounding_rejects_false_spans():
    assert verify_grounding(T1, "ఇరవై నాలుగు", [0, 3]) is False
    assert verify_grounding(T1, T1[0:10], [0, 10]) is True


def test_ambiguity_on_meal_contradiction():
    transcript = "ఇరవై మంది వచ్చారు. భోజనం పెట్టలేదు. ఐదు మందికి భోజనం పెట్టారు."
    extractions, ambiguities = extract(transcript)
    values = values_from(extractions)
    assert values["meal_served"] is False
    assert values["meal_count"] == 5
    assert "meal_served" in ambiguities and "meal_count" in ambiguities


def test_gaps_and_rank_and_questions():
    extractions, _ = extract("ఈరోజు ఇరవై మంది వచ్చారు.")
    gaps = gaps_from(extractions)
    assert "children_present" not in gaps
    assert "activity_type" in gaps
    assert rank_gaps(["children_present", "report_date", "activity_type"])[0] in (
        "report_date",
        "activity_type",
        "children_present",
    )
    questions = build_questions(gaps, {})
    assert questions and all(q.question_te and q.question_en for q in questions)
    remaining = build_questions(gaps, {gaps[0]: "yes"})
    assert len(remaining) == len(questions) - 1


def test_assemble_validation_and_corrections():
    extractions, _ = extract(T1)
    report = assemble_report(
        extractions,
        answers={"preschool_activity": "పాటలు, కథలు"},
        corrections={"meal_count": 22},
        scenario_id="s01",
    )
    assert report.worker.worker_code == "SYN-W001"
    assert report.worker.centre_code == "SYN-C001"
    assert report.fields["meal_count"] == 22
    assert report.fields["preschool_activity"] == "పాటలు, కథలు"
    assert report.status == "draft"
    assert validate_fields(report.fields).valid is True


def test_validation_catches_contradictions_and_bounds():
    result = validate_fields({"children_present": 10, "children_absent": 5,
                              "children_enrolled": 12})
    assert result.valid is False
    assert any("children_enrolled" in e for e in result.errors)
    result2 = validate_fields({"meal_served": False, "meal_count": 4})
    assert result2.valid is False
    result3 = validate_fields({"children_present": -1})
    assert result3.valid is False
