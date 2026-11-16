"""SQLite persistence for reports and gateway submissions.

The database file lives in the backend directory (sandbox.db) so both reports
and gateway submissions survive restarts.  A new connection is opened per
operation because FastAPI runs synchronous endpoints in a worker thread pool.
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import BACKEND_DIR

DB_PATH = BACKEND_DIR / "sandbox.db"


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS reports (
                report_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS gateway_submissions (
                idempotency_key TEXT PRIMARY KEY,
                receipt_id TEXT NOT NULL,
                status TEXT NOT NULL,
                report TEXT NOT NULL,
                submitted_at TEXT NOT NULL,
                scenario_id TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS gateway_attempts (
                idempotency_key TEXT PRIMARY KEY,
                attempts INTEGER NOT NULL
            )
            """
        )


# ---- Reports --------------------------------------------------------------

def save_report(report_id: str, report: dict[str, Any]) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO reports (report_id, data, created_at) VALUES (?, ?, ?)",
            (report_id, json.dumps(report, ensure_ascii=False), utc_now()),
        )


def get_report(report_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT data FROM reports WHERE report_id = ?", (report_id,)
        ).fetchone()
    return json.loads(row["data"]) if row else None


# ---- Gateway submissions --------------------------------------------------

def gateway_get(key: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM gateway_submissions WHERE idempotency_key = ?", (key,)
        ).fetchone()
    if not row:
        return None
    return {
        "idempotency_key": row["idempotency_key"],
        "receipt_id": row["receipt_id"],
        "status": row["status"],
        "report": json.loads(row["report"]),
        "submitted_at": row["submitted_at"],
        "scenario_id": row["scenario_id"],
    }


def gateway_insert(
    key: str,
    receipt_id: str,
    status: str,
    report: dict[str, Any],
    submitted_at: str,
    scenario_id: str | None,
) -> bool:
    """Insert a submission. Returns False when the key already exists."""
    with _connect() as conn:
        cur = conn.execute(
            """
            INSERT OR IGNORE INTO gateway_submissions
                (idempotency_key, receipt_id, status, report, submitted_at, scenario_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                key,
                receipt_id,
                status,
                json.dumps(report, ensure_ascii=False),
                submitted_at,
                scenario_id,
            ),
        )
        return cur.rowcount == 1


def gateway_increment_attempt(key: str) -> int:
    """Increment and return the attempt counter for an idempotency key."""
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO gateway_attempts (idempotency_key, attempts) VALUES (?, 0)
            ON CONFLICT(idempotency_key) DO NOTHING
            """,
            (key,),
        )
        conn.execute(
            "UPDATE gateway_attempts SET attempts = attempts + 1 WHERE idempotency_key = ?",
            (key,),
        )
        row = conn.execute(
            "SELECT attempts FROM gateway_attempts WHERE idempotency_key = ?", (key,)
        ).fetchone()
    return int(row["attempts"])


def gateway_all() -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM gateway_submissions ORDER BY submitted_at, receipt_id"
        ).fetchall()
    return [
        {
            "receipt_id": r["receipt_id"],
            "submitted_at": r["submitted_at"],
            "report": json.loads(r["report"]),
            "status": r["status"],
        }
        for r in rows
    ]
