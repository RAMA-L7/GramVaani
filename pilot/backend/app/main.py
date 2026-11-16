"""FastAPI application for the GramVaani pilot backend.

Experimental pilot: real audio/transcript workflow, provider-independent ASR
adapters, and sample-report generation only. PILOT_UNVERIFIED / NOT_OFFICIAL /
NOT SUBMITTED to any government system.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as api_router
from .config import ensure_audio_tmp, get_settings
from .db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_audio_tmp()
    init_db()
    yield


settings = get_settings()
app = FastAPI(
    title="GramVaani Pilot Backend",
    description=(
        "Pilot backend with real audio upload/transcription workflow, provider-independent ASR adapters, "
        "grounded extraction, clarification, confirmation, draft/export APIs, and experimental sample reports. "
        "PILOT_UNVERIFIED / NOT_OFFICIAL / NOT SUBMITTED to any government system."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get("cors_origins", ["http://localhost:3000", "http://localhost:3010"]),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
