from app.routers import gateway as gateway_router

REPORT = {
    "schema_version": "sandbox-0.1",
    "worker": {"worker_code": "SYN-W001", "centre_code": "SYN-C001"},
    "report_date": "2026-11-16",
    "fields": {
        "activity_type": ["pre_school"],
        "children_present": 24,
        "meal_served": True,
    },
    "transcript_ref": "s01-test",
    "confirmation": {
        "confirmed_by": "SYN-W001",
        "confirmed_at": "2026-11-16T10:00:00Z",
    },
    "status": "draft",
}


def submit(client, key, scenario_id=None):
    return client.post(
        "/api/gateway/submit",
        json={"report": REPORT, "idempotency_key": key, "scenario_id": scenario_id},
    )


def test_accept_and_duplicate(client):
    first = submit(client, "key-accept")
    assert first.status_code == 200
    data = first.json()
    assert data["status"] == "accepted"
    assert data["receipt_id"].startswith("RCPT-")
    assert data["dashboard_entry"]["status"] == "accepted"

    duplicate = submit(client, "key-accept")
    assert duplicate.status_code == 200
    assert duplicate.json()["status"] == "duplicate"

    entries = client.get("/api/gateway/reports").json()
    assert len(entries) == 1
    assert entries[0]["receipt_id"] == data["receipt_id"]


def test_reject_mode_returns_422(client, monkeypatch):
    monkeypatch.setattr(
        gateway_router, "gateway_mode_for",
        lambda scenario_id: {"mode": "reject", "fail_first_attempt": False},
    )
    response = submit(client, "key-reject", "scenario-reject")
    assert response.status_code == 422
    assert response.json()["status"] == "rejected"
    assert response.json()["errors"]
    assert client.get("/api/gateway/reports").json() == []


def test_duplicate_mode_creates_no_row(client, monkeypatch):
    monkeypatch.setattr(
        gateway_router, "gateway_mode_for",
        lambda scenario_id: {"mode": "duplicate", "fail_first_attempt": False},
    )
    response = submit(client, "key-dup-mode", "scenario-duplicate")
    assert response.status_code == 200
    assert response.json()["status"] == "duplicate"
    assert client.get("/api/gateway/reports").json() == []


def test_network_failure_then_accept(client, monkeypatch):
    monkeypatch.setattr(
        gateway_router, "gateway_mode_for",
        lambda scenario_id: {"mode": "network_failure", "fail_first_attempt": True},
    )
    first = submit(client, "key-network", "scenario-network")
    assert first.status_code == 503
    second = submit(client, "key-network", "scenario-network")
    assert second.status_code == 200
    assert second.json()["status"] == "accepted"
    assert len(client.get("/api/gateway/reports").json()) == 1
