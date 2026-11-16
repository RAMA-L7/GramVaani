from typing import Any

from fastapi import APIRouter, HTTPException

from ..config import list_scenarios, load_scenario

router = APIRouter(tags=["scenarios"])


@router.get("/api/scenarios")
def scenarios() -> list[dict[str, Any]]:
    return list_scenarios()


@router.get("/api/scenarios/{scenario_id}")
def scenario(scenario_id: str) -> dict[str, Any]:
    data = load_scenario(scenario_id)
    if data is None:
        raise HTTPException(status_code=404, detail="scenario not found")
    return data
