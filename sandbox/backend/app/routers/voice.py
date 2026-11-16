from fastapi import APIRouter, HTTPException

from ..db import save_report
from ..models import (
    ClarifyRequest,
    ClarifyResponse,
    ConfirmRequest,
    ConfirmResponse,
    ExtractRequest,
    ExtractResponse,
    TranscribeRequest,
    TranscribeResponse,
)
from ..pipeline.assemble import assemble_report
from ..pipeline.clarify import build_questions
from ..pipeline.extract import gaps_from
from ..providers.asr.scenario import ScenarioASRProvider
from ..providers.asr.text import TextASRProvider
from ..providers.extraction.rules import RuleExtractionProvider
from ..validation import validate_report

router = APIRouter(tags=["voice"])

_asr_scenario = ScenarioASRProvider()
_asr_text = TextASRProvider()
_extractor = RuleExtractionProvider()


@router.post("/api/voice/transcribe")
def transcribe(request: TranscribeRequest) -> TranscribeResponse:
    """SIMULATED: scripted transcript when scenario_id, otherwise echo text.

    Audio uploads are never accepted; no real ASR service is called.
    """
    if request.scenario_id:
        result = _asr_scenario.transcribe(request.scenario_id, request.text)
        if not result["transcript"]:
            raise HTTPException(status_code=404, detail="scenario not found")
        return TranscribeResponse(**result)
    if request.text is not None:
        return TranscribeResponse(**_asr_text.transcribe(None, request.text))
    return TranscribeResponse(transcript="", provider="simulated", simulated=True, duration_ms=0)


@router.post("/api/voice/extract")
def extract(request: ExtractRequest) -> ExtractResponse:
    extractions, ambiguities = _extractor.extract(request.transcript)
    return ExtractResponse(
        extractions=extractions,
        gaps=gaps_from(extractions),
        ambiguities=ambiguities,
    )


@router.post("/api/voice/clarify")
def clarify(request: ClarifyRequest) -> ClarifyResponse:
    questions = build_questions(request.gaps, request.answers)
    return ClarifyResponse(questions=questions)


@router.post("/api/voice/confirm")
def confirm(request: ConfirmRequest) -> ConfirmResponse:
    """Persist the report after the explicit confirmation step."""
    report = assemble_report(
        extractions=request.extractions,
        answers=request.answers,
        corrections=request.corrections,
        scenario_id=request.scenario_id,
    )
    validation = validate_report(report.model_dump())
    report_id = request.idempotency_key or report.confirmation.confirmed_at
    save_report(report_id, report.model_dump(mode="json"))
    return ConfirmResponse(report=report, validation=validation)
