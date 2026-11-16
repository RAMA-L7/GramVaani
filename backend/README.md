# Backend (not scaffolded)

FastAPI service hosting the six-stage pipeline. **No code exists yet.** Nothing here runs.

## Why it is empty

The architecture is fixed, but the field set and the ASR provider are not. Both are deliberately late
bindings; see [TECHNICAL_ARCHITECTURE.md](../docs/TECHNICAL_ARCHITECTURE.md).

## Planned structure

```
backend/
├── app/
│   ├── main.py                   # FastAPI app, CORS (localhost only)
│   ├── api/
│   │   ├── reports.py            # POST /reports, GET /reports/{id}
│   │   ├── transcript.py         # POST /transcribe, PATCH /transcript
│   │   ├── extract.py            # POST /extract
│   │   └── clarify.py            # POST /clarify
│   ├── pipeline/
│   │   ├── capture.py            # audio refs, temp lifecycle, deletion
│   │   ├── normalise.py          # numerals, spans, code-mix preservation
│   │   ├── clarify.py            # gap ranking, ≤ 3 questions
│   │   └── assemble.py           # ReportDraft, completeness, gaps
│   ├── providers/
│   │   ├── asr/                  # base.py + one file per provider
│   │   └── extraction/           # base.py, llm.py, rules.py, fake.py
│   ├── config/
│   │   ├── loader.py             # load + validate report-fields.json
│   │   └── schema_gen.py         # config → extraction JSON schema
│   ├── models/                   # Pydantic: Transcript, Extraction, ReportDraft
│   └── store/                    # SQLite drafts + JSON export
├── pyproject.toml
└── tests/                        # pytest (unit + golden fixtures)
```

## Rules

- **Provider SDKs only inside `providers/`.** No vendor imports in `api/` or `pipeline/`.
- **No submission module, no credential store, no scheduler.** If a PR adds an outbound connector to a
  government service, it is rejected on sight.
- **No beneficiary entities.** `models/` must not gain a `child`, `person`, or `family` type.
- **Fail loudly on invalid config** at startup, not at request time.

## When it gets scaffolded (Phase 2)

```powershell
cd D:\GramVaani\backend
uv init --python 3.12
uv add fastapi uvicorn[standard] pydantic pydantic-settings python-multipart
uv add --dev pytest httpx ruff mypy
uv run uvicorn app.main:app --reload --port 8000
```

`uv` manages the interpreter because no system Python is installed on this machine — do not rely on `python`
being on PATH.
