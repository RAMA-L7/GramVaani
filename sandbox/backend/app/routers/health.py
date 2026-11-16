from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/api/health")
def health() -> dict[str, object]:
    return {"status": "ok", "sandbox": True}
