# GramVaani Sandbox — shared contract

**Status:** experimental module contract. Read this before writing code.
**Hard rule:** this is a **simulated** environment. No Poshan Tracker / Bala Sanjeevini integration,
no official reporting requirement, no real speech recognition provider, no beneficiary data.

This file is the single source of truth for the interfaces between the three components. Do not change it
without lead approval. Local ports: backend `8000`, frontend `3000`.

---

## 1. Data model — `SandboxReport`

Flat field map keyed by IDs in `config/sandbox-fields.json`. All values are illustrative and synthetic.

```jsonc
{
  "schema_version": "sandbox-0.1",
  "worker": { "worker_code": "SYN-W001", "centre_code": "SYN-C001" },  // always synthetic
  "report_date": "2026-11-16",
  "fields": {
    "activity_type": ["pre_school", "nutrition"],
    "children_present": 24,
    "children_absent": 3,
    "meal_served": true,
    "meal_count": 24,
    "preschool_activity": "పాటలు, కథలు",
    "photo_attached": true,
    "remarks": "ముగ్గురు పిల్లలు జ్వరంతో రాలేదు."
  },
  "transcript_ref": "s01-normal-telugu",
  "confirmation": { "confirmed_by": "SYN-W001", "confirmed_at": "2026-11-16T10:00:00Z" },
  "status": "draft"
}
```

Fields are **not** official reporting requirements. `photo_attached` may only reference a synthetic sample
image; never a child photo.

## 2. Scenario file schema

One JSON file per scenario in `scenarios/`, named `<id>.json`.

```jsonc
{
  "id": "s01-normal-telugu",
  "title": "Normal Telugu daily report",
  "category": "normal",              // normal | mixed-language | missing | ambiguous | contradiction
                                      // | duplicate | extraction-error | network | correction
  "transcript": "ఈరోజు ...",          // scripted Telugu / code-mixed transcript (synthetic)
  "expected_extracted": { "children_present": 24, "meal_served": true },
  "expected_missing": ["preschool_activity"],
  "clarification_answers": { "preschool_activity": "పాటలు, కథలు" },
  "worker_corrections": { "meal_count": 22 },
  "expected_validation": { "valid": true, "errors": [] },
  "gateway": {
    "mode": "accept",                // accept | reject | duplicate | network_failure
    "fail_first_attempt": false
  },
  "notes": "Why this scenario exists",
  "synthetic": true
}
```

`gateway.mode = network_failure` returns HTTP 503 on the first attempt for that idempotency key and accepts
the retry. `duplicate` returns status `duplicate` without creating a second row. `reject` returns HTTP 422
with validation errors.

## 3. Backend HTTP API (FastAPI, all under `/api`)

All request/response bodies are JSON. CORS allows `http://localhost:3000`.

| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/api/health` | — | `{ "status": "ok", "sandbox": true }` |
| GET | `/api/scenarios` | — | `[{ "id", "title", "category" }]` |
| GET | `/api/scenarios/{id}` | — | full scenario JSON or 404 |
| POST | `/api/voice/transcribe` | `{ "scenario_id": "s01-...", "text": null }` | `{ "transcript", "provider", "simulated": true, "duration_ms" }` |
| POST | `/api/voice/extract` | `{ "transcript": "...", "scenario_id": "s01-..." }` | `{ "extractions": [Extraction], "gaps": [field_id], "ambiguities": [field_id] }` |
| POST | `/api/voice/clarify` | `{ "gaps": ["field_id"], "answers": {} }` | `{ "questions": [{ "field_id", "question_te", "question_en", "type" }] }` |
| POST | `/api/voice/confirm` | `{ "extractions": [], "answers": {}, "corrections": {}, "scenario_id": "s01-...", "idempotency_key": "..." }` | `{ "report": SandboxReport, "validation": { "valid", "errors" } }` |
| GET | `/api/reports/{id}` | — | stored `SandboxReport` or 404 |
| POST | `/api/gateway/submit` | `{ "report": SandboxReport, "idempotency_key": "...", "scenario_id": "s01-..." }` | `{ "status": "accepted"|"duplicate"|"rejected", "receipt_id", "errors": [], "dashboard_entry": {...} }` |
| GET | `/api/gateway/reports` | — | `[{ "receipt_id", "submitted_at", "report", "status" }]` |

`Extraction` shape:

```jsonc
{
  "field_id": "children_present",
  "value": 24,
  "raw_text": "ఇరవై నాలుగు మంది పిల్లలు వచ్చారు",
  "source_span": [start, end],        // character offsets into the transcript
  "confidence": 0.9,
  "needs_confirmation": true
}
```

Rules:

- `source_span` must be a verbatim substring of the transcript; otherwise drop the extraction.
- Missing required fields go to `gaps`; contradictions go to `ambiguities`.
- No value is accepted into the report without a confirmation step.
- `/api/voice/transcribe` is explicitly `simulated: true` — scripted transcript, not live ASR.
- Backend persists reports and gateway submissions in SQLite, surviving restarts.

## 4. Frontend pages (Next.js + TypeScript)

| Route | Purpose |
|---|---|
| `/` | Landing: what the sandbox is, safety banner, links to the three components |
| `/voice` | Voice assistant: scenario select → simulated record → editable transcript → extraction → clarification → confirmation → report → transfer |
| `/reporting` | Simulated Anganwadi reporting app: manual entry form with validation and submission status |
| `/dashboard` | Dummy reporting dashboard listing submissions received through the gateway |

The UI must show a persistent banner: **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

`/voice` must let the worker edit the transcript, correct extracted values, answer clarification questions,
and explicitly confirm before a report is generated. `/dashboard` shows what arrived through the simulated
gateway, not a real government system.

## 5. Validation rules (backend)

- Required fields per `config/sandbox-fields.json` must be present.
- Integer fields must be within `min`/`max` and non-negative.
- `children_absent + children_present <= children_enrolled` when enrolled is configured.
- `meal_served = false` with `meal_count > 0` is a contradiction.
- Duplicate idempotency keys at the gateway are rejected as `duplicate`.
- Gateway `mode` from the scenario can force `reject` or `network_failure` for testing.

## 6. Technology

Frontend: Next.js App Router + TypeScript + plain CSS. Backend: FastAPI + Pydantic + SQLite via `uv`.
Testing: pytest for backend/pipeline, Playwright for the end-to-end flow. No cloud keys, no external model
calls, no real audio upload.

## 7. Claim discipline

Permitted demo wording:

> "We built a simulated reporting environment to evaluate whether Telugu voice input, structured
> extraction, validation and API-based data transfer work reliably. Actual government workflow
> compatibility remains subject to field validation and authorization."

Forbidden claims: Poshan Tracker integration, Bala Sanjeevini integration, official requirements verified,
government approval, proven workload reduction.
