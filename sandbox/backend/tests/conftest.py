import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db import DB_PATH, init_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """Use an isolated SQLite database for every test."""
    monkeypatch.setattr("app.db.DB_PATH", tmp_path / "sandbox.db")
    init_db()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def db_path():
    return DB_PATH
