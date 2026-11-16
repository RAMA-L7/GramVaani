from __future__ import annotations

import json
import os
import importlib
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def test_env(tmp_path, monkeypatch):
    # Use real pilot config shipped in repo for realistic loading
    pilot_root = Path(__file__).resolve().parents[2]  # .../pilot
    config_path = pilot_root / "config" / "pilot-fields.json"
    db_path = tmp_path / "pilot_test.db"
    audio_tmp = tmp_path / "audio_tmp"
    eval_dir = tmp_path / "eval_results"
    eval_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("PILOT_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("PILOT_DB_PATH", str(db_path))
    monkeypatch.setenv("PILOT_AUDIO_TMP", str(audio_tmp))
    monkeypatch.setenv("PILOT_EVALUATION_RESULTS_DIR", str(eval_dir))
    monkeypatch.setenv("PILOT_CORS_ORIGINS", "http://localhost:3000,http://localhost:3010")
    monkeypatch.setenv("PILOT_RETAIN_AUDIO_DEFAULT", "false")
    # Clear cloud/faster-whisper env to make tests deterministic
    for k in [
        "FASTER_WHISPER_MODEL", "CLOUD_ASR_PROVIDER", "CLOUD_ASR_ENDPOINT",
        "CLOUD_ASR_API_KEY", "CLOUD_ASR_PROJECT_ID", "CLOUD_ASR_REGION",
    ]:
        monkeypatch.delenv(k, raising=False)

    # Reload modules that cache settings/config where needed
    import app.config as config
    import app.db as db
    import app.main as main
    config.load_field_config_cached.cache_clear()
    importlib.reload(db)
    importlib.reload(main)
    return {"config_path": config_path, "db_path": db_path, "audio_tmp": audio_tmp, "eval_dir": eval_dir, "main": main}


@pytest.fixture()
def client(test_env):
    with TestClient(test_env["main"].app) as c:
        yield c
