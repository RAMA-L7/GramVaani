from __future__ import annotations

import io
import json

from app.providers.asr.base import ASRProvider, ASRResult


def test_health_and_config(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "pilot": True, "sandbox": False}
    cfg = client.get("/api/config/fields")
    assert cfg.status_code == 200
    body = cfg.json()
    assert body.get("config_status") == "PILOT_UNVERIFIED"
    assert "NOT_OFFICIAL" in (body.get("disclaimer") or "")


def test_asr_capabilities_and_failure_handling(client):
    r = client.get("/api/asr/capabilities")
    assert r.status_code == 200
    data = r.json()
    ids = {p["id"] for p in data["providers"]}
    assert {"browser", "faster_whisper", "cloud_http", "manual"}.issubset(ids)
    assert "not guaranteed" in data["disclaimer"].lower() or "accent/noise" in data["disclaimer"].lower()
    r2 = client.post("/api/asr/providers")
    assert r2.status_code == 200 and {p["id"] for p in r2.json()["providers"]} == ids

    # manual provider must not perform/fake recognition
    files = {"audio": ("test.wav", b"RIFF....WAVEfmt ", "audio/wav")}
    r3 = client.post("/api/asr/transcribe", data={"provider": "manual"}, files=files)
    assert r3.status_code == 400
    assert "manual" in str(r3.json()).lower()

    # browser/client mode must direct to submit-text
    files = {"audio": ("test.wav", b"RIFF....WAVEfmt ", "audio/wav")}
    r4 = client.post("/api/asr/transcribe", data={"provider": "client_provided"}, files=files)
    assert r4.status_code == 400
    assert "submit-text" in str(r4.json()) or "browser" in str(r4.json()).lower()

    # cloud_http unconfigured -> clear config required error
    files = {"audio": ("test.wav", b"RIFF....WAVEfmt ", "audio/wav")}
    r5 = client.post("/api/asr/transcribe", data={"provider": "cloud_http"}, files=files)
    assert r5.status_code == 503
    detail = r5.json().get("detail", {})
    assert "CLOUD_ASR_PROVIDER" in str(detail) or "configured" in str(detail).lower()

    # unknown provider
    files = {"audio": ("test.wav", b"RIFF....WAVEfmt ", "audio/wav")}
    r6 = client.post("/api/asr/transcribe", data={"provider": "unknown_xyz"}, files=files)
    assert r6.status_code == 400


def _run_confirm_flow(client):
    st = client.post("/api/transcribe/submit-text", json={
        "transcript": "ఈరోజు 24 మంది పిల్లలు వచ్చారు. భోజనం పెట్టారు 24 మందికి. ప్రీ స్కూల్.",
        "provider": "browser",
        "language": "te-IN",
    })
    assert st.status_code == 200
    tbody = st.json()
    assert tbody["provider"] == "browser"
    assert tbody["original_transcript"] == tbody["transcript"]
    assert tbody["simulated"] is False

    ex = client.post("/api/extract", json={"transcript": tbody["transcript"], "original_transcript": tbody["original_transcript"]})
    assert ex.status_code == 200
    ed = ex.json()
    assert ed["original_transcript"] == tbody["original_transcript"]
    by_id = {e["field_id"]: e for e in ed["extractions"]}
    assert by_id["children_present"]["value"] == 24
    assert by_id["meal_served"]["value"] is True
    for e in ed["extractions"]:
        s, eidx = e["source_span"]
        assert tbody["transcript"][s:eidx] == e["raw_text"]

    cl = client.post("/api/clarify", json={"gaps": ed["gaps"], "answers": {}})
    assert cl.status_code == 200
    assert isinstance(cl.json()["questions"], list)

    # explicit confirmation required (missing/false/string-valued must be rejected)
    base_confirm = {
        "transcript": tbody["transcript"],
        "original_transcript": tbody["original_transcript"],
        "extractions": ed["extractions"],
        "answers": {"report_date": "2026-11-16"},
        "corrections": {"meal_count": 22},
    }
    no_conf = client.post("/api/confirm", json={**base_confirm, "explicit_confirmation": False})
    assert no_conf.status_code == 400
    missing_conf = client.post("/api/confirm", json={**base_confirm})
    assert missing_conf.status_code == 400
    str_false = client.post("/api/confirm", json={**base_confirm, "explicit_confirmation": "false"})
    assert str_false.status_code == 400
    # voice/confirm must not coerce and must not accept alternate sample_report path
    v_missing = client.post("/api/voice/confirm", json={**base_confirm})
    assert v_missing.status_code == 400
    v_false = client.post("/api/voice/confirm", json={**base_confirm, "explicit_confirmation": False})
    assert v_false.status_code == 400
    v_str_false = client.post("/api/voice/confirm", json={**base_confirm, "explicit_confirmation": "false"})
    assert v_str_false.status_code == 400
    v_str_true = client.post("/api/voice/confirm", json={**base_confirm, "explicit_confirmation": "true"})
    assert v_str_true.status_code == 400  # must be strict boolean true (no coercion)
    v_sample = client.post("/api/voice/confirm", json={**base_confirm, "sample_report": True})
    assert v_sample.status_code == 400

    conf = client.post("/api/confirm", json={
        "transcript": tbody["transcript"],
        "original_transcript": tbody["original_transcript"],
        "extractions": ed["extractions"],
        "answers": {"report_date": "2026-11-16"},
        "corrections": {"meal_count": 22},
        "explicit_confirmation": True,
    })
    assert conf.status_code == 200
    cd = conf.json()
    report = cd["report"]
    assert report["fields"]["meal_count"] == 22
    assert report["not_official"] is True
    assert report["not_submitted"] is True
    assert report["pilot_unverified"] is True
    assert "PILOT_UNVERIFIED" in report["status_label"]
    assert cd["draft_id"]
    assert cd["saved"] is True
    return cd


def test_submit_text_extract_clarify_confirm_flow(client):
    cd = _run_confirm_flow(client)
    assert cd["report"]["confirmation"]["explicit_confirmation"] is True


def test_confirm_invalid_report_saved_as_draft_not_confirmed(client):
    # Minimal payload missing required extracted/answered fields -> validation fails; must not be confirmed.
    r = client.post("/api/confirm", json={
        "transcript": "పిల్లలు వచ్చారు",
        "original_transcript": "పిల్లలు వచ్చారు",
        "extractions": [],
        "answers": {},
        "corrections": {},
        "explicit_confirmation": True,
        "report_date": "2026-11-17",
    })
    assert r.status_code == 200
    body = r.json()
    assert body["validation"]["valid"] is False
    assert body["report"]["status"] == "draft"
    assert body["report"]["confirmation"]["explicit_confirmation"] is False
    assert body["draft_id"]
    assert body["saved"] is True
    draft = client.get(f"/api/drafts/{body['draft_id']}")
    assert draft.status_code == 200
    assert draft.json()["status"] == "draft"


def test_drafts_save_list_get_export_and_feedback(client):
    # create via confirm flow
    created = _run_confirm_flow(client)
    draft_id = created["draft_id"]

    lst = client.get("/api/drafts")
    assert lst.status_code == 200
    assert any(d["draft_id"] == draft_id for d in lst.json())

    got = client.get(f"/api/drafts/{draft_id}")
    assert got.status_code == 200
    assert got.json()["draft_id"] == draft_id

    exp = client.get(f"/api/drafts/{draft_id}/export.json")
    assert exp.status_code == 200
    payload = exp.json()
    assert payload["export_kind"] == "gramvaani_pilot_draft_export"
    assert payload["not_official"] is True
    assert payload["draft"]["draft_id"] == draft_id

    # manual save endpoint
    saved = client.post("/api/drafts", json={"transcript": "manual draft", "original_transcript": "manual draft", "meta": {"x": 1}})
    assert saved.status_code == 200
    assert saved.json()["draft_id"]

    fb = client.post("/api/feedback", json={"category": "pilot", "message": "synthetic feedback", "draft_id": draft_id})
    assert fb.status_code == 200
    assert fb.json()["id"].startswith("fb_")


def test_evaluation_summary_reads_results(client, test_env):
    eval_dir = test_env["eval_dir"]
    sample = {"metric": "wer", "value": 0.5, "synthetic": True}
    (eval_dir / "sample.json").write_text(json.dumps(sample), encoding="utf-8")
    r = client.get("/api/evaluation/summary")
    assert r.status_code == 200
    data = r.json()
    assert data["available"] is True
    assert "sample.json" in data["files"]
    assert data["results"]["sample.json"]["metric"] == "wer"


def test_audio_upload_cleanup_and_mocked_provider(client, test_env, monkeypatch):
    audio_tmp = test_env["audio_tmp"]
    audio_tmp.mkdir(parents=True, exist_ok=True)

    class FakeProvider(ASRProvider):
        id = "fake"
        label = "Fake"
        mode = "server"

        def capability(self):
            return {"id": "fake", "label": "Fake", "available": True, "mode": "server", "requires": [], "notes": [], "configured": True}

        async def transcribe_audio(self, audio_path, language=None, content_type=None, filename=None):
            assert audio_path.exists()
            return ASRResult(
                transcript="పిల్లలు వచ్చారు",
                original_transcript="పిల్లలు వచ్చారు",
                provider="fake",
                language=language or "te",
                simulated=False,
                warnings=["test"],
            )

    import app.api.routes as routes

    monkeypatch.setattr(routes, "get_provider", lambda pid: FakeProvider())
    files = {"audio": ("sample.wav", b"RIFF....WAVEfmt data1234", "audio/wav")}
    r = client.post("/api/asr/transcribe", data={"provider": "fake", "consent_retain": "true"}, files=files)
    assert r.status_code == 200
    body = r.json()
    assert body["provider"] == "fake"
    assert body["simulated"] is False
    assert body["meta"]["retained_audio"] is False
    assert any("not store real recordings" in w.lower() or "safeguards" in w.lower() for w in body["warnings"])
    # temp audio must be cleaned up
    remaining = list(audio_tmp.glob("*"))
    # allow .gitkeep only
    assert all(p.name == ".gitkeep" for p in remaining)
