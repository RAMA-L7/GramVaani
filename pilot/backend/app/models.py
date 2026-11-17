"""Pydantic models for the GramVaani pilot backend.

Pilot outputs are SAMPLE REPORTS only: experimental, PILOT_UNVERIFIED,
NOT_OFFICIAL, and NOT SUBMITTED to any government system.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field

from .config import DEFAULT_SCHEMA_VERSION, SAMPLE_REPORT_LABEL


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class ExtractionEvidence(BaseModel):
    value: Any
    raw_text: str
    source_span: list[int]
    supporting_phrase: str | None = None
    label_context: str | None = None
    negated: bool = False


class Extraction(BaseModel):
    field_id: str
    value: Any
    raw_text: str
    source_span: list[int]
    confidence: float = 0.9
    confidence_kind: str = "heuristic_rule"
    needs_confirmation: bool = True
    supporting_phrase: str | None = None
    evidence: list[ExtractionEvidence] = Field(default_factory=list)


class Worker(BaseModel):
    worker_code: str = "SYN-PILOT-W001"
    centre_code: str = "SYN-PILOT-C001"


class Confirmation(BaseModel):
    confirmed_by: str = "SYN-PILOT-W001"
    confirmed_at: str = Field(default_factory=utc_now)
    explicit_confirmation: bool = False


class SampleReport(BaseModel):
    schema_version: str = DEFAULT_SCHEMA_VERSION
    report_kind: Literal["sample_report"] = "sample_report"
    status_label: str = SAMPLE_REPORT_LABEL
    experimental: bool = True
    not_official: bool = True
    not_submitted: bool = True
    pilot_unverified: bool = True
    worker: Worker = Field(default_factory=Worker)
    report_date: str
    fields: dict[str, Any] = Field(default_factory=dict)
    transcript_ref: str | None = None
    confirmation: Confirmation = Field(default_factory=Confirmation)
    status: str = "draft"


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str] = Field(default_factory=list)


class TranscribeResponse(BaseModel):
    transcript: str
    original_transcript: str
    provider: str
    language: str | None = None
    duration_ms: int | None = None
    segments: list[dict[str, Any]] | None = None
    confidence: float | None = None
    warnings: list[str] = Field(default_factory=list)
    simulated: bool = False
    meta: dict[str, Any] = Field(default_factory=dict)


class SubmitTextRequest(BaseModel):
    transcript: str
    provider: str = "browser"
    language: str | None = "te-IN"
    original_transcript: str | None = None
    confidence: float | None = None
    segments: list[dict[str, Any]] | None = None
    warnings: list[str] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)


class ExtractRequest(BaseModel):
    transcript: str
    original_transcript: str | None = None
    scenario_id: str | None = None


class ExtractResponse(BaseModel):
    extractions: list[Extraction]
    gaps: list[str]
    ambiguities: list[str]
    original_transcript: str
    transcript: str


class ClarifyRequest(BaseModel):
    gaps: list[str] = Field(default_factory=list)
    answers: dict[str, Any] = Field(default_factory=dict)


class Question(BaseModel):
    field_id: str
    question_te: str
    question_en: str
    type: str


class ClarifyResponse(BaseModel):
    questions: list[Question]


class ConfirmRequest(BaseModel):
    transcript: str
    original_transcript: str | None = None
    extractions: list[Extraction] = Field(default_factory=list)
    answers: dict[str, Any] = Field(default_factory=dict)
    corrections: dict[str, Any] = Field(default_factory=dict)
    explicit_confirmation: bool = False
    draft_id: str | None = None
    report_date: str | None = None
    worker: Worker | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class ConfirmResponse(BaseModel):
    report: SampleReport
    validation: ValidationResult
    draft_id: str | None = None
    saved: bool = False


class DraftSaveRequest(BaseModel):
    draft_id: str | None = None
    transcript: str | None = None
    original_transcript: str | None = None
    extractions: list[Extraction] = Field(default_factory=list)
    answers: dict[str, Any] = Field(default_factory=dict)
    corrections: dict[str, Any] = Field(default_factory=dict)
    report: SampleReport | None = None
    meta: dict[str, Any] = Field(default_factory=dict)


class DraftRecord(BaseModel):
    draft_id: str
    created_at: str
    updated_at: str
    status: str
    data: dict[str, Any]


class FeedbackRequest(BaseModel):
    category: str = "general"
    message: str
    draft_id: str | None = None
    report_kind: str = "sample_report"
    meta: dict[str, Any] = Field(default_factory=dict)


class ProviderCapability(BaseModel):
    id: str
    label: str
    available: bool
    mode: str
    requires: list[str] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)
    configured: bool = False


class ProviderCapabilitiesResponse(BaseModel):
    providers: list[ProviderCapability]
    disclaimer: str
