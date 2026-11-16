# GramVaani Sandbox — experimental, simulated module

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

This is an **experimental hackathon sandbox** for exploring a *possible* future GramVaani workflow:
a worker narrates a daily Anganwadi report in Telugu, the transcript is edited and turned into structured
fields, the worker confirms them, and a structured report is transferred through a **local simulation**
to a **dummy dashboard**. It exists to let us evaluate the reliability of the plumbing — not to validate
a product, a field set, or any government compatibility.

Everything here is synthetic: worker `SYN-W001`, centre `SYN-C001`, invented field definitions,
scripted transcripts, and a gateway that never leaves the machine. There is no real audio, no real
speech recognition, no beneficiary or child data, no credentials, and no call to any external system.

## What this module is NOT

- **Not** a Phase 0 field-research deliverable and **not** evidence of need or impact.
- **Not** a Poshan Tracker or Bala Sanjeevini integration. No such integration exists, is authorised,
  or is defined — see D-11 and ADR-006.
- **Not** a source of official reporting requirements. The fields are invented for the demo.
- **Not** a finished or deployable product. There are no accounts, no sync, and no cloud services.

State of the wider project is unchanged by this module:

- **Phase 0 research status is unchanged** — the sandbox does not open, close, or advance a research gate.
- **Accepted decisions D-10 / D-11 / D-12 are unchanged** (reframe to documentation burden; no
  government integration without an authorised interface; voice stays a hypothesis until tested with
  real consented speech and measured correction effort). See
  [DECISIONS_AND_ASSUMPTIONS.md](../docs/DECISIONS_AND_ASSUMPTIONS.md).
- **The main `config/report-fields.json` is unchanged.** The sandbox reads its own, separate
  illustrative `config/sandbox-fields.json`, which is explicitly `ILLUSTRATIVE_NOT_OFFICIAL`.
  No research document or accepted decision is modified by this module.

## The three components

1. **Backend API** (`backend/`) — FastAPI + Pydantic, the voice/extraction/clarification/confirm
   pipeline, provider adapter seams, validation, SQLite persistence, and the simulated gateway.
   Run with `uv` on **port 8000**. See the [backend README](backend/README.md).
2. **Frontend** (`frontend/`) — a Next.js + TypeScript app with three surfaces: the **voice
   assistant** (`/voice`), the **simulated Anganwadi reporting app** (`/reporting`), and the **dummy
   dashboard** (`/dashboard`), plus a landing page (`/`). Run with `pnpm` on **port 3000**.
3. **Scenarios and field config** (`scenarios/` and `config/sandbox-fields.json`) — the scripted,
   synthetic inputs and the invented field definitions. Scenarios are one JSON file per id, named
   `<id>.json`, read at request time; `config/sandbox-fields.json` drives validation and clarification
   text. See the [field config](config/sandbox-fields.json) and the
   [shared contract](API_CONTRACT.md).

## Four hackathon stages

These stages organise a hackathon session; they do not change any research gate.

1. **Stage 1 — Set up and verify.** Start backend and frontend, confirm `/api/health`, and confirm the
   persistent simulation banner. Review [SAFETY.md](SAFETY.md) before anyone speaks to an audience.
2. **Stage 2 — Golden path.** Run one synthetic Telugu scenario end to end: recording → transcription →
   editable transcript → extraction → worker confirmation → structured report → simulated gateway →
   dashboard receipt. See [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
3. **Stage 3 — Edge cases and errors.** Exercise missing fields, contradictions, corrections, duplicate
   keys, rejection, and network-failure/retry using the other scenario categories. See
   [FEATURE_TEST_MAP.md](docs/FEATURE_TEST_MAP.md).
4. **Stage 4 — Evidence and claim review.** Walk the feature→test map, run the pre-demo safety
   checklist, and present the "what this does not prove" statement verbatim.

## Quick start

Prerequisites: Python ≥ 3.11 with [`uv`](https://docs.astral.sh/uv/), and Node with `pnpm`.

```bash
# Terminal 1 — backend (http://localhost:8000)
cd sandbox/backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal 2 — frontend (http://localhost:3000)
cd sandbox/frontend
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The frontend calls the backend at `http://localhost:8000/api`;
CORS is configured for that origin. Ports: **backend 8000**, **frontend 3000**.

## Where scenarios live

Scripted scenarios live in `scenarios/` at the sandbox root, one file per `<id>.json`, following the
schema in [API_CONTRACT.md §2](API_CONTRACT.md) (category: `normal`, `mixed-language`, `missing`,
`ambiguous`, `contradiction`, `duplicate`, `extraction-error`, `network`, `correction`; gateway mode:
`accept`, `reject`, `duplicate`, `network_failure`). The backend reads this directory at request time,
so adding a scenario needs no restart. If the directory has no scenario files, `/api/scenarios`
returns `[]` and unknown ids return 404 — the scripts and tests still run.

## How to verify

```bash
# Backend + pipeline tests (pytest, isolated SQLite per test)
cd sandbox/backend
uv run pytest -q
```

- Health check: `GET http://localhost:8000/api/health` → `{"status":"ok","sandbox":true}`.
- End-to-end check: follow [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) and confirm each expected screen.
- Coverage check: use [FEATURE_TEST_MAP.md](docs/FEATURE_TEST_MAP.md) to see which scenario category
  and test file exercises each feature.
- Frontend typecheck: `cd sandbox/frontend && pnpm typecheck`.

An end-to-end browser test (Playwright) is intended for the full flow; as of this writing it is a
planned test layer, not present in the repository. The backend/pipeline tests above are the
executable evidence that currently exists.

## Documentation

- [Shared contract](API_CONTRACT.md) — the single source of truth for interfaces.
- [Safety and claim discipline](SAFETY.md) — mandatory reading before any demo.
- [Architecture](docs/ARCHITECTURE.md) — components, seams, validation, persistence, ADR mapping.
- [Demo script](docs/DEMO_SCRIPT.md) — the golden-path narration and expected screens.
- [Feature/test map](docs/FEATURE_TEST_MAP.md) — what each feature is tested by.

Permitted demo wording (use verbatim):

> "We built a simulated reporting environment to evaluate whether Telugu voice input, structured
> extraction, validation and API-based data transfer work reliably. Actual government workflow
> compatibility remains subject to field validation and authorization."
