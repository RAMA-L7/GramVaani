"""FastAPI application for the simulated GramVaani sandbox backend."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .routers import gateway, health, reports, scenarios, voice


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="GramVaani Sandbox Backend",
    description="Experimental, fully simulated reporting sandbox. No government integration.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(scenarios.router)
app.include_router(voice.router)
app.include_router(reports.router)
app.include_router(gateway.router)
