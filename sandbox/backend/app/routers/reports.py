from fastapi import APIRouter, HTTPException

from ..db import get_report
from ..models import SandboxReport, StoredReportResponse

router = APIRouter(tags=["reports"])


@router.get("/api/reports/{report_id}")
def get_stored_report(report_id: str) -> StoredReportResponse:
    data = get_report(report_id)
    if data is None:
        raise HTTPException(status_code=404, detail="report not found")
    return StoredReportResponse(report=SandboxReport(**data))
