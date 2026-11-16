# GramVaani Pilot Backend

Experimental pilot backend at `D:\GramVaani\pilot\backend` (separate from frozen sandbox).  
**Status:** `PILOT_UNVERIFIED`, `NOT_OFFICIAL`, sample reports only, **not submitted** to any government system, and **no government/gateway integration**.

## What this provides
- FastAPI app runnable on Windows with `uv`
- Real workflow: multipart audio upload -> ASR adapter -> transcript, plus client-provided transcript ingestion, re-extraction, clarification, explicit confirmation, sample report generation, draft save/export (JSON), feedback, evaluation summary
- Provider-independent ASR architecture (`app/providers/asr/`)
- Separate pilot config: `../config/pilot-fields.json` (illustrative, synthetic codes only)
- Separate SQLite DB (`pilot.db`, gitignored)
- Audio temp handling: uploads saved only to gitignored `.audio_tmp/` and deleted after transcription by default; **no real recordings stored without safeguards**

## Windows setup (uv)
Prerequisites: Python 3.11+ and [uv](https://docs.astral.sh/uv/).

```powershell
cd D:\GramVaani\pilot\backend
uv sync
# optional: install local faster-whisper support
# uv sync --extra asr-faster-whisper
copy .env.example .env  # optional; edit locally, never commit secrets
```

## Run
Use a port different from sandbox (sandbox uses 8000). Example:

```powershell
cd D:\GramVaani\pilot\backend
uv run uvicorn app.main:app --reload --port 8010
```

Health check: `GET http://127.0.0.1:8010/api/health`

## Test
```powershell
cd D:\GramVaani\pilot\backend
uv run pytest -q
```

## API surface (pilot)
- `GET /api/health`
- `GET /api/config/fields` (loads `../config/pilot-fields.json`)
- `GET /api/asr/capabilities` and `POST /api/asr/providers` - available ASR approaches, status/requirements, notes
- `POST /api/asr/transcribe` (multipart: `audio`, `provider`, `language`, `consent_retain=false`, `retain_audio=false`) -> transcript/original_transcript/provider/confidence/segments/warnings, `simulated:false` for real paths
- `POST /api/transcribe/submit-text` - ingest browser-recognized transcript (preserves original)
- `POST /api/extract` - grounded extraction from transcript (`source_span` must be verbatim substring; unverifiable values dropped)
- `POST /api/clarify` - clarification questions for gaps/unanswered fields
- `POST /api/confirm` - requires `explicit_confirmation=true`, applies corrections/answers, validates, generates **experimental sample report** (PILOT_UNVERIFIED / NOT_OFFICIAL / NOT SUBMITTED), and saves draft
- `GET /api/drafts`, `POST /api/drafts`, `GET /api/drafts/{id}`, `GET /api/drafts/{id}/export.json`
- `POST /api/feedback`
- `GET /api/evaluation/summary` (reads local `../evaluation/results/*.json` if present)

## ASR approaches (investigated/supported)
No provider is chosen based on advertised accuracy (D-12). Accent/noise robustness for Telugu is **not guaranteed**; capabilities and limits are reported by `/api/asr/capabilities`.

1. **`browser` / `client_provided`**: Frontend performs recognition (e.g. Web Speech API where supported) and submits transcript via `/api/transcribe/submit-text`. Real end-to-end path when browser supports it; support/accuracy vary by browser/device/language.
2. **`faster_whisper`** (local server-side): Uses `faster-whisper` if installed/configured. Configure with `FASTER_WHISPER_MODEL` (e.g. `small`/`medium`), device/compute/download root env vars. May download models on first use and may require ffmpeg/audio deps; missing deps/model return clear errors (no fake recognition).
3. **`cloud_http`** (configurable generic adapter): HTTP/SDK-ready adapter for configured providers via env vars - `CLOUD_ASR_PROVIDER=google_stt|azure_speech|sarvam|generic` plus `CLOUD_ASR_ENDPOINT`, `CLOUD_ASR_API_KEY`, `CLOUD_ASR_PROJECT_ID`, `CLOUD_ASR_REGION`, `CLOUD_ASR_LANGUAGE`, etc. If credentials/config are missing, returns clear configuration-required status; when configured it attempts provider/generic HTTP transcription (no keys hardcoded).
4. **`manual` / `none`**: Fallback when no automated recognition is available/desired; user provides transcript manually (no fabricated recognition).

**Important:** Providers never fake successful recognition. Failures/unavailable states are reported explicitly.

## Audio handling and privacy
- Uploaded audio is written only to gitignored `pilot/backend/.audio_tmp/` and deleted after transcription attempt by default.
- `retain_audio` defaults to `false`; `consent_retain` is accepted for future use but **real recordings are not stored without safeguards** in this pilot implementation.
- No audio files are committed. No API keys/secrets are committed.

## Transcript/extraction/confirmation rules
- Original transcript is preserved; editable transcript can be re-extracted.
- Every extracted value must be grounded in an exact `source_span` (verbatim substring of transcript); unverifiable values are dropped.
- Clarification requested for missing/ambiguous information.
- Corrections allowed before confirmation.
- Explicit confirmation (`explicit_confirmation=true`) required to generate a sample report.
- Generated output is an **experimental sample report** labeled `PILOT_UNVERIFIED`, `NOT_OFFICIAL`, `NOT SUBMITTED` (no external/govt submission).

## Environment variables
See `.env.example` for CORS, DB/config/audio/evaluation paths, and ASR configuration. Do not commit `.env` or secrets.
