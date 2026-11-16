"""Simulated gateway: idempotent, scenario-controlled submission outcomes."""
from __future__ import annotations

import hashlib
from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ..config import gateway_mode_for
from ..db import gateway_all, gateway_get, gateway_increment_attempt, gateway_insert
from ..models import DashboardEntry, GatewaySubmitRequest, GatewaySubmitResponse, utc_now
from ..validation import validate_report

router = APIRouter(tags=["gateway"])


def _receipt_id(key: str) -> str:
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:10].upper()
    return f"RCPT-{digest}"


@router.post("/api/gateway/submit")
def submit(request: GatewaySubmitRequest) -> Any:
    key = request.idempotency_key
    scenario_id = request.scenario_id
    report_data = request.report.model_dump(mode="json")
    mode_config = gateway_mode_for(scenario_id)
    mode = mode_config["mode"]

    # An already-submitted key is always a duplicate, regardless of mode.
    existing = gateway_get(key)
    if existing is not None:
        return GatewaySubmitResponse(
            status="duplicate",
            receipt_id=existing["receipt_id"],
            errors=["idempotency_key already submitted"],
        )

    # Scenario mode: forced duplicate (no row created).
    if mode == "duplicate":
        return GatewaySubmitResponse(
            status="duplicate",
            receipt_id=_receipt_id(key),
            errors=["simulated duplicate rejection"],
        )

    # Scenario mode: simulated network failure on the first attempt for the key.
    if mode == "network_failure" and mode_config["fail_first_attempt"]:
        attempt = gateway_increment_attempt(key)
        if attempt == 1:
            return JSONResponse(
                status_code=503,
                content={
                    "detail": "simulated network failure; retry with the same key",
                    "status": "network_failure",
                },
            )

    # Scenario mode: validation rejection with HTTP 422.
    if mode == "reject":
        validation = validate_report(report_data)
        errors = validation.errors or ["simulated gateway rejection"]
        body = GatewaySubmitResponse(
            status="rejected",
            receipt_id="",
            errors=errors,
        )
        return JSONResponse(status_code=422, content=body.model_dump(mode="json"))

    # Default accept (also the retry path after a simulated network failure).
    receipt_id = _receipt_id(key)
    submitted_at = utc_now()
    inserted = gateway_insert(
        key, receipt_id, "accepted", report_data, submitted_at, scenario_id
    )
    if not inserted:
        # Defensive: another concurrent request won the race.
        row = gateway_get(key)
        return GatewaySubmitResponse(
            status="duplicate",
            receipt_id=row["receipt_id"] if row else receipt_id,
            errors=["idempotency_key already submitted"],
        )
    entry = DashboardEntry(
        receipt_id=receipt_id,
        submitted_at=submitted_at,
        report=request.report,
        status="accepted",
    )
    return GatewaySubmitResponse(
        status="accepted",
        receipt_id=receipt_id,
        errors=[],
        dashboard_entry=entry,
    )


@router.get("/api/gateway/reports")
def gateway_reports() -> list[dict[str, Any]]:
    """All accepted submissions for the simulated dashboard."""
    return [entry for entry in gateway_all() if entry["status"] == "accepted"]
