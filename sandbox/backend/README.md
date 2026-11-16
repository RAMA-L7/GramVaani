# GramVaani Sandbox — Backend (simulated)

Experimental, clearly separated FastAPI backend. Everything is synthetic:
worker `SYN-W001`, centre `SYN-C001`, no beneficiary names, no credentials,
no real photos, no live ASR, no government integration.

## Run

```
cd sandbox/backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

## Test

```
uv run pytest -q
```

## Endpoints

All under `/api`:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | liveness (`status: ok`, `sandbox: true`) |
| GET | `/api/scenarios` | list of `{id, title, category}` |
| GET | `/api/scenarios/{id}` | full scripted scenario JSON or 404 |
| POST | `/api/voice/transcribe` | simulated: scripted transcript by `scenario_id`, else echo `text` |
| POST | `/api/voice/extract` | deterministic, grounded extractions + gaps + ambiguities |
| POST | `/api/voice/clarify` | ranked Telugu/English questions for gaps |
| POST | `/api/voice/confirm` | assemble, validate and persist a report |
| GET | `/api/reports/{id}` | stored report or 404 |
| POST | `/api/gateway/submit` | idempotent simulated submission |
| GET | `/api/gateway/reports` | accepted submissions for the dashboard |

CORS allows `http://localhost:3000`.

## How grounding works

`app/pipeline/normalise.py` tokenises the transcript with exact `[start, end)`
character offsets and maps Telugu number words (`ఇరవై నాలుగు` -> 24) while
leaving English tokens unchanged. `app/pipeline/extract.py` uses field hints to
pick number/boolean/enum/text values, slices `raw_text` directly from the
transcript, and verifies `transcript[start:end] == raw_text` (whitespace
normalised). Ungrounded candidates are dropped. No value is accepted into a
report until `/api/voice/confirm`, which persists to SQLite (`sandbox.db`).

## Notes for the lead

- Scenarios are read at request time from `../scenarios/<id>.json`. If that
  directory is not yet present, `/api/scenarios` returns `[]` and unknown ids
  return 404; no restart is needed once scenarios appear.
- Gateway `reject` responses use HTTP 422 with a body containing
  `status: "rejected"` and `errors`. `network_failure` returns HTTP 503 on the
  first attempt per idempotency key and accepts the retry (attempts tracked in
  SQLite).
- Reports are keyed by `idempotency_key` from the confirm request (pass the
  same key to `GET /api/reports/{id}`); if none is given a timestamp key is
  used and returned in the report confirmation timestamp.
