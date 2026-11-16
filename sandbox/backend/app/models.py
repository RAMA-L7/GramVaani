"""Pydantic models mirroring the shared API contract."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class Extraction(BaseModel):
    field_id: str
    value: Any
    raw_text: str
    source_span: list[int]  # [start, end] character offsets into the transcript
    confidence: float = 0.9
    needs_confirmation: bool = True


class Worker(BaseModel):
    worker_code: str = "SYN-W001"
    centre_code: str = "SYN-C001"


class Confirmation(BaseModel):
    confirmed_by: str = "SYN-W001"
    confirmed_at: str = Field(default_factory=utc_now)


class SandboxReport(BaseModel):
    schema_version: str = "sandbox-0.1"
    worker: Worker = Field(default_factory=Worker)
    report_date: str
    fields: dict[str, Any] = Field(default_factory=dict)
    transcript_ref: str | None = None
    confirmation: Confirmation = Field(default_factory=Confirmation)
    status: str = "draft"


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str] = Field(default_factory=list)


# ---- Requests -------------------------------------------------------------

class TranscribeRequest(BaseModel):
    scenario_id: str | None = None
    text: str | None = None


class ExtractRequest(BaseModel):
    transcript: str
    scenario_id: str | None = None


class ClarifyRequest(BaseModel):
    gaps: list[str] = Field(default_factory=list)
    answers: dict[str, Any] = Field(default_factory=dict)


class ConfirmRequest(BaseModel):
    extractions: list[Extraction] = Field(default_factory=list)
    answers: dict[str, Any] = Field(default_factory=dict)
    corrections: dict[str, Any] = Field(default_factory=dict)
    scenario_id: str | None = None
    idempotency_key: str | None = None


class GatewaySubmitRequest(BaseModel):
    report: SandboxReport
    idempotency_key: str
    scenario_id: str | None = None


# ---- Responses ------------------------------------------------------------

class TranscribeResponse(BaseModel):
    transcript: str
    provider: str
    simulated: bool = True
    duration_ms: int = 0


class ExtractResponse(BaseModel):
    extractions: list[Extraction]
    gaps: list[str]
    ambiguities: list[str]


class Question(BaseModel):
    field_id: str
    question_te: str
    question_en: str
    type: str


class ClarifyResponse(BaseModel):
    questions: list[Question]


class ConfirmResponse(BaseModel):
    report: SandboxReport
    validation: ValidationResult


class DashboardEntry(BaseModel):
    receipt_id: str
    submitted_at: str
    report: SandboxReport
    status: str


class GatewaySubmitResponse(BaseModel):
    status: str  # accepted | duplicate | rejected
    receipt_id: str = ""
    errors: list[str] = Field(default_factory=list)
    dashboard_entry: DashboardEntry | None = None


class StoredReportResponse(BaseModel):
    report: SandboxReport
