from app.pipeline.extract import extract, verify_grounding

T1 = (
    "ఈరోజు ఇరవై నాలుగు మంది పిల్లలు వచ్చారు. "
    "ముగ్గురు పిల్లలు జ్వరంతో రాలేదు. "
    "భోజనం పెట్టారు. ఇరవై నాలుగు మందికి భోజనం పెట్టారు. "
    "ప్రీస్కూల్ పాటలు కథలు. చిత్రం జోడించారు."
)


def test_health_and_cors(client):
    response = client.get("/api/health", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "sandbox": True}
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"


def test_scenarios_endpoints(client):
    listing = client.get("/api/scenarios")
    assert listing.status_code == 200
    assert isinstance(listing.json(), list)
    assert client.get("/api/scenarios/does-not-exist").status_code == 404


def test_transcribe_simulated(client):
    response = client.post("/api/voice/transcribe", json={"text": T1})
    data = response.json()
    assert response.status_code == 200
    assert data["transcript"] == T1
    assert data["simulated"] is True
    assert client.post(
        "/api/voice/transcribe", json={"scenario_id": "missing-scenario"}
    ).status_code == 404


def test_extract_endpoint(client):
    response = client.post("/api/voice/extract", json={"transcript": T1})
    assert response.status_code == 200
    data = response.json()
    by_field = {e["field_id"]: e for e in data["extractions"]}
    assert by_field["children_present"]["value"] == 24
    assert data["gaps"] == []
    assert data["ambiguities"] == []
    for extraction in data["extractions"]:
        start, end = extraction["source_span"]
        assert verify_grounding(T1, extraction["raw_text"], [start, end])


def test_clarify_endpoint(client):
    response = client.post(
        "/api/voice/clarify",
        json={"gaps": ["children_present", "activity_type"], "answers": {}},
    )
    data = response.json()
    assert response.status_code == 200
    assert [q["field_id"] for q in data["questions"]] == [
        "activity_type",
        "children_present",
    ]
    assert all(q["question_te"] for q in data["questions"])
    filtered = client.post(
        "/api/voice/clarify",
        json={"gaps": ["children_present", "activity_type"],
              "answers": {"children_present": 24}},
    ).json()
    assert [q["field_id"] for q in filtered["questions"]] == ["activity_type"]


def test_confirm_persists_report(client):
    extractions, _ = extract(T1)
    payload = {
        "extractions": [e.model_dump() for e in extractions],
        "answers": {},
        "corrections": {"meal_count": 22},
        "scenario_id": "s01-test",
        "idempotency_key": "report-key-1",
    }
    response = client.post("/api/voice/confirm", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["validation"]["valid"] is True
    assert data["report"]["fields"]["meal_count"] == 22
    stored = client.get("/api/reports/report-key-1")
    assert stored.status_code == 200
    assert stored.json()["report"]["worker"]["worker_code"] == "SYN-W001"
    assert client.get("/api/reports/nope").status_code == 404
