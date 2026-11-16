"""SQLite persistence for the pilot backend.

Stores drafts, sample reports, feedback, and transcription metadata only.
No real audio is stored by default. Database is local and gitignored.
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .config import get_settings


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def db_path() -> Path:
    return Path(get_settings()["db_path"])


def _connect() -> sqlite3.Connection:
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS drafts (
                draft_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback (
                id TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS transcripts (
                id TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def save_draft(draft_id: str | None, data: dict[str, Any], status: str = "draft") -> dict[str, Any]:
    now = utc_now()
    draft_id = draft_id or _new_id("draft")
    with _connect() as conn:
        existing = conn.execute(
            "SELECT created_at FROM drafts WHERE draft_id = ?", (draft_id,)
        ).fetchone()
        created_at = existing["created_at"] if existing else now
        conn.execute(
            """
            INSERT INTO drafts (draft_id, data, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(draft_id) DO UPDATE SET
                data=excluded.data,
                status=excluded.status,
                updated_at=excluded.updated_at
            """,
            (draft_id, json.dumps(data, ensure_ascii=False), status, created_at, now),
        )
    return {"draft_id": draft_id, "created_at": created_at, "updated_at": now, "status": status, "data": data}


def get_draft(draft_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute("SELECT * FROM drafts WHERE draft_id = ?", (draft_id,)).fetchone()
    if not row:
        return None
    return {
        "draft_id": row["draft_id"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "status": row["status"],
        "data": json.loads(row["data"]),
    }


def _extract_history_fields(data: dict[str, Any]) -> dict[str, Any]:
    report = data.get("report") if isinstance(data.get("report"), dict) else {}
    worker = report.get("worker") if isinstance(report.get("worker"), dict) else {}
    confirmation = report.get("confirmation") if isinstance(report.get("confirmation"), dict) else {}
    meta = data.get("meta") if isinstance(data.get("meta"), dict) else {}
    # report_date priority: explicit top-level in data/meta/report fields
    report_date = (
        data.get("report_date")
        or meta.get("report_date")
        or report.get("report_date")
        or (report.get("fields") or {}).get("report_date")
    )
    worker_code = worker.get("worker_code") or meta.get("worker_code") or data.get("worker_code")
    centre_code = worker.get("centre_code") or meta.get("centre_code") or data.get("centre_code")
    has_report = bool(report)
    confirmed = bool(confirmation.get("explicit_confirmation"))
    return {
        "report_date": report_date,
        "worker_code": worker_code,
        "centre_code": centre_code,
        "has_report": has_report,
        "has_transcript": bool(data.get("transcript") or data.get("original_transcript")),
        "confirmed": confirmed,
        "draft_kind": "sample_report" if has_report else "draft",
    }


def list_drafts(limit: int = 100) -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT draft_id, status, created_at, updated_at, data FROM drafts ORDER BY updated_at DESC LIMIT ?",
            (int(limit),),
        ).fetchall()
    results = []
    for row in rows:
        data = json.loads(row["data"]) if row["data"] else {}
        info = _extract_history_fields(data)
        results.append(
            {
                "draft_id": row["draft_id"],
                "id": row["draft_id"],
                "status": row["status"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
                "report_date": info.get("report_date"),
                "worker_code": info.get("worker_code"),
                "centre_code": info.get("centre_code"),
                "summary": {
                    "has_report": info.get("has_report", False),
                    "has_transcript": info.get("has_transcript", False),
                    "confirmed": info.get("confirmed", False),
                    "draft_kind": info.get("draft_kind", "draft"),
                },
            }
        )
    return results


def save_feedback(payload: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    fid = _new_id("fb")
    with _connect() as conn:
        conn.execute(
            "INSERT INTO feedback (id, payload, created_at) VALUES (?, ?, ?)",
            (fid, json.dumps(payload, ensure_ascii=False), now),
        )
    return {"id": fid, "created_at": now, "payload": payload}


def save_transcript_record(payload: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    tid = _new_id("tx")
    # Strip any accidental binary/large blobs; store text/meta only.
    safe = dict(payload)
    for key in list(safe.keys()):
        if isinstance(safe[key], (bytes, bytearray)):
            safe[key] = "<omitted>"
    with _connect() as conn:
        conn.execute(
            "INSERT INTO transcripts (id, payload, created_at) VALUES (?, ?, ?)",
            (tid, json.dumps(safe, ensure_ascii=False), now),
        )
    return {"id": tid, "created_at": now}
