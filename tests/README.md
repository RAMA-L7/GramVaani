# Tests

Cross-cutting test strategy. No tests exist yet; this file states what must be tested and why, so the first
tests are the right ones.

## Order of implementation

| # | Test | Why it comes first |
|---|---|---|
| 1 | **Config validation** — `report-fields.json` against `report-fields.schema.json` | Every other feature depends on a valid contract; catches a bad field in CI, not at runtime |
| 2 | **Normalisation unit tests** — Telugu numerals, English token preservation, span offsets | Deterministic, fast, and where most code-mix bugs live |
| 3 | **Extraction grounding** — every non-null value's `source_span` is a verbatim substring | Non-negotiable safety property; a hallucination regression must break the build |
| 4 | **Clarification ordering** — required-missing first, max 3, no dupes | Cheap to test, easy to get subtly wrong |
| 5 | **Pipeline fixture** — `example-001` transcript → `example-001.expected.json` | End-to-end traceability against a known synthetic input |
| 6 | **Privacy guard** — assert the data model/schema exposes no beneficiary, credential, or submission concept | Prevents accidental drift; should fail loudly if someone adds a `child_id` |
| 7 | **E2E flow** — Playwright: record (fake provider) → edit → extract → clarify → confirm → preview | The only test that proves the loop works |

## Structure

```
tests/
├── fixtures/
│   ├── transcripts/          # links/copies of synthetic-reports samples
│   └── expected/             # golden extraction outputs
├── contract/                 # config schema validation
├── unit/                     # normalise, clarify ranking, span verification
├── integration/              # pipeline with fake providers
└── e2e/                      # Playwright flows (added in Phase 4)
```

Backend unit tests will live in `backend/tests/` (pytest convention); this folder holds cross-cutting
fixtures and end-to-end tests. Keep the split, don't duplicate fixtures.

## Non-goals

- Tests against live model providers in CI (flaky, costs money). Use recorded responses or the `fake`
  provider.
- Tests with real field data. Ever.
- Snapshot tests of Telugu copy (it will change with research); assert presence, not exact wording.

## Running (once scaffolded)

```powershell
# frontend
cd D:\GramVaani\frontend; pnpm test

# backend
cd D:\GramVaani\backend; uv run pytest

# end-to-end
cd D:\GramVaani\frontend; pnpm test:e2e
```
