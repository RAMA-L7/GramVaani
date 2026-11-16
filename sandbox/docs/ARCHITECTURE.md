# Sandbox architecture

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

This document describes the experimental sandbox only. It maps onto the accepted architecture decisions
[ADR-001…009](../../docs/DECISIONS_AND_ASSUMPTIONS.md) without changing any of them, and does not advance
the [roadmap](../../docs/DEVELOPMENT_ROADMAP.md) phases. The interface contract is
[API_CONTRACT.md](../API_CONTRACT.md); claim discipline is in [SAFETY.md](../SAFETY.md).

## The three components

1. **Backend API** (`backend/`) — FastAPI + Pydantic. Owns the pipeline (normalise → extract →
   clarify → confirm → assemble), the provider adapter seams, validation, SQLite persistence, the
   report store, and the simulated gateway. Runs on **port 8000** via `uv`.
2. **Frontend** (`frontend/`) — Next.js App Router + TypeScript + plain CSS. Three surfaces:
   `/voice` (the golden-path flow), `/reporting` (manual entry), `/dashboard` (receipts from the
   simulated gateway), plus `/` (landing with the safety banner). Runs on **port 3000** via `pnpm`.
3. **Scenarios and field config** (`scenarios/`, `config/sandbox-fields.json`) — scripted, synthetic
   inputs read at request time and the invented field definitions that drive validation and the
   Telugu/English clarification text. This is a *separate* config from the main
   `config/report-fields.json`, which this module does not touch.

## Data-flow diagram (golden path)

```
        +-------------------+        +------------------------------------------+
        |  scenarios/       |        |  FRONTEND (Next.js, :3000)               |
        |  <id>.json        |        |                                          |
        |  config/          |        |  /voice  /reporting  /dashboard  /       |
        |  sandbox-fields   |        |  persistent SIMULATED banner on all      |
        +---------+---------+        +--------------------+---------------------+
                  | read at request time                   | typed HTTP :8000/api
                  v                                        v
        +----------------------------------------------------------------------------+
        |  BACKEND (FastAPI, :8000)                                                  |
        |                                                                            |
        |  GET /api/scenarios --------> pick s01-normal-telugu                        |
        |        |                                                                   |
        |        v                                                                   |
        |  POST /api/voice/transcribe  --[ ASRProvider seam: ScenarioASR / TextASR ]--+--> { transcript, simulated:true }
        |        |                                                                   |
        |        v   (worker may EDIT the transcript here — it is the source of truth)|
        |  POST /api/voice/extract ----[ ExtractionProvider seam: RulesExtraction ]--> { extractions + gaps + ambiguities }
        |        |           each value has a verbatim source_span; ungrounded dropped
        |        v                                                                   |
        |  POST /api/voice/clarify ---- gaps -> Telugu/English questions from config   |
        |        |                                                                   |
        |        v   (worker corrects values and answers gaps)                        |
        |  POST /api/voice/confirm ---- assemble + VALIDATE layers -------------------> { report (status:draft), validation }
        |        |                                                                   |
        |        +----------------------> SQLite: reports table  (survives restart)    |
        |        v                                                                   |
        |  POST /api/gateway/submit --- SIMULATED gateway ----------------------------> { status, receipt_id, dashboard_entry }
        |        |     modes: accept | reject | duplicate | network_failure            |
        |        +----------------------> SQLite: gateway_submissions + gateway_attempts|
        +---------------------------+------------------------------------------------+
                                    v
                          GET /api/gateway/reports -> rendered on /dashboard
```

No arrow leaves the machine. There is no live ASR, no LLM service, no credential, and no government
endpoint in this diagram.

## Provider adapter seams

Following **ADR-004**, vendors sit behind interfaces so no provider SDK is imported outside the
provider packages:

- **ASR** — `backend/app/providers/asr/base.py` defines `ASRProvider.transcribe(scenario_id, text)`.
  Implementations are simulated only: `scenario.py` (load the scripted transcript by scenario id) and
  `text.py` (echo supplied text). The response always carries `simulated: true`. Real ASR selection is
  a **Phase 2 bake-off gate** (D-12); this seam is where that future implementation would plug in — it
  does not validate any provider here.
- **Extraction** — `backend/app/providers/extraction/base.py` defines
  `ExtractionProvider.extract(transcript) -> (extractions, ambiguity_field_ids)`. The sandbox ships a
  deterministic `rules.py` implementation. A fake/provider path is the intended extension point; no
  external model is called.

Both seams are deliberately thin and synthetic, so the pipeline can be exercised without choosing a
vendor. See the [backend README](../backend/README.md).

## Validation layers

1. **Span grounding** (`backend/app/pipeline/normalise.py`, `extract.py`) — Telugu number words are
   mapped to digits with exact `[start, end)` offsets (English tokens preserved, per **ADR-007**).
   `raw_text` must be a verbatim substring of the transcript at that span, or the extraction is
   dropped. This is the "schema validity ≠ correctness" guard from the research synthesis.
2. **Gap / ambiguity detection** (`clarify.py`, `validation.py`) — missing required fields become
   `gaps`; contradictions (e.g. `meal_served=false` with `meal_count>0`, or
   `present + absent > enrolled`) become `ambiguities`. At most three clarifying questions are served
   from config text.
3. **Confirm gate** — no value enters a report until `/api/voice/confirm`. The worker can edit the
   transcript, correct extracted values, and answer questions first (**ADR-002**, transcript-first).
4. **Report validation** (`validation.py`) — a generated JSON Schema from
   `config/sandbox-fields.json` checks types and integer bounds, plus the contract contradiction
   rules; results are returned with the report (`validation.valid`, `validation.errors`).
5. **Gateway idempotency** — duplicate idempotency keys are returned as `duplicate` and create no
   second row.

## SQLite persistence

`backend/app/db.py` uses a single local file, `backend/sandbox.db` (**ADR-005**: one local file, one
user, no auth, no sync). Three tables:

- `reports` — confirmed `SandboxReport` documents keyed by the confirm idempotency key; retrieved via
  `GET /api/reports/{id}`.
- `gateway_submissions` — accepted/duplicate/rejected submissions keyed by submit idempotency key,
  with receipt id and timestamp; feeds the dashboard via `GET /api/gateway/reports`.
- `gateway_attempts` — retry counter per key, used by the `network_failure` mode to fail the first
  attempt and accept the retry.

Writes survive restarts. Tests use an isolated temporary SQLite file per test via `conftest.py`, so
they never touch the dev database.

## Gateway simulation modes

Driven by the scenario's `gateway` block and read through `config.gateway_mode_for`:

| Mode | Behaviour |
|---|---|
| `accept` | Creates a receipt and a dashboard entry. |
| `reject` | HTTP 422 with `status: rejected` and validation errors; writes no submission. |
| `duplicate` | Returns `status: duplicate` without creating a second row. |
| `network_failure` | HTTP 503 on the first attempt for the idempotency key; the retry is accepted. |

This is a *simulation of API behaviour* for testing transfer/retry/dedup logic. It is **not** a
submission module: **ADR-006** remains non-negotiable — no module, flag, interface, or credential for
submitting to any government system exists, and D-11 forbids integration without an authorised,
documented interface.

## Mapping to ADR-001…009 (unchanged)

| ADR | Decision | How the sandbox reflects it without changing it |
|---|---|---|
| 001 | Config-driven field definitions | Uses its own illustrative `config/sandbox-fields.json`; the main `config/report-fields.json` is untouched. Field text and bounds come from config, not hard-coded. |
| 002 | Transcript-first | Editable transcript is the source of truth; every extracted value carries a `source_span`; edits/corrections invalidate derived values before confirm. |
| 003 | Two runtimes | Next.js frontend (:3000) and FastAPI backend (:8000) over typed HTTP with local CORS. |
| 004 | Provider adapters | `ASRProvider` / `ExtractionProvider` seams with simulated implementations only; no vendor SDK outside provider packages. |
| 005 | Local-first SQLite | One `sandbox.db`, no accounts, no sync; receipts and reports survive restarts. |
| 006 | No submission capability | Gateway is a local simulation writing to SQLite; it never contacts or represents a government system. |
| 007 | Telugu script, English tokens preserved | Deterministic numeral mapping and code-mix handling in `normalise.py`; no transliteration model. |
| 008 | Synthetic data only | `SYN-W001` / `SYN-C001`, no beneficiary/child entity, no child photos, `synthetic: true` on scenarios. |
| 009 | Docs separate from code | This documentation lives in `sandbox/docs/`; research stays in `research/`; links are kept working. |

## Out of scope (deliberately)

Real speech recognition, a chosen ASR vendor, real reporting fields, government integration or
submission, beneficiary records, credentials, deployment, auth, multi-tenancy, and photo capture.
Telugu speech in this sandbox is **scripted**, and real ASR evaluation remains a Phase 2 gate (D-12).
For the feature-to-test mapping, see [FEATURE_TEST_MAP.md](FEATURE_TEST_MAP.md); for the narration,
see [DEMO_SCRIPT.md](DEMO_SCRIPT.md).
