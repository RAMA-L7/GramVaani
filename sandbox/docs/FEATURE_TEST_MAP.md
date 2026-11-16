# Feature → test map

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

This maps each feature the sandbox was built to let us test to the scenario category and test file that
exercises it. Backend/pipeline tests are executable evidence today (`cd sandbox/backend && uv run
pytest -q`). The scenario files live in `scenarios/` (one `<id>.json` per scenario; schema in
[API_CONTRACT.md](../API_CONTRACT.md)). An end-to-end browser test (Playwright) is an intended test
layer but is **not yet present** in the repository — the E2E column below marks the golden path that
such a test would automate.

Scenario categories: `normal`, `mixed-language`, `missing`, `ambiguous`, `contradiction`, `duplicate`,
`extraction-error`, `network`, `correction`. Backend test files:
`tests/test_pipeline.py`, `tests/test_api.py`, `tests/test_gateway.py`, with isolated SQLite in
`tests/conftest.py`.

> **Important caveat — Telugu speech recognition.** In this sandbox, "Telugu speech recognition" is
> **scripted and simulated** (`transcribe` returns a stored transcript with `simulated: true`). No real
> ASR engine runs and no field audio is evaluated. Real Telugu code-mixed ASR evaluation remains a
> **Phase 2 gate** (D-12; [roadmap](../../docs/DEVELOPMENT_ROADMAP.md)). These tests prove the transcript
> handling pipeline, not ASR accuracy.

| Feature | Scenario category / example | Test file(s) → test name | E2E (planned Playwright) |
|---|---|---|---|
| **Telugu speech recognition** | `normal` — `s01-normal-telugu` | `test_api.py::test_transcribe_simulated` (simulated flag + 404 on missing id); `test_pipeline.py::test_telugu_numeral_mapping_and_spans` (Telugu numerals in transcript). Simulated only — not ASR accuracy. | `/voice` select → mic → scripted transcript appears |
| **Mixed-language (Telugu + English)** | `mixed-language` | `test_pipeline.py::test_normalise_number_words_keeps_english_and_preserves_order` — Telugu numeral → digit while English token (`చిల్డ్రన్`) is preserved. | `/voice` with a code-mixed scenario |
| **Extraction (grounded)** | `normal`, `extraction-error` | `test_pipeline.py::test_extraction_is_grounded_and_covers_fields`, `test_grounding_rejects_false_spans`; `test_api.py::test_extract_endpoint` (verbatim `source_span` for every value). | `/voice` → "Extract fields" → review values + source phrases |
| **Clarification (gaps)** | `missing` | `test_pipeline.py::test_gaps_and_rank_and_questions` (gap ranking, ≤3 bilingual questions, answer filtering); `test_api.py::test_clarify_endpoint` (question order + filtering). | `/voice` → clarification card for missing field → answer |
| **Confirmation / corrections** | `correction`, `normal` | `test_api.py::test_confirm_persists_report` (persist + retrieve); `test_pipeline.py::test_assemble_validation_and_corrections` (worker corrections applied, `status: draft`). No value is accepted before confirm. | `/voice` → correct `meal_count` → "Confirm and generate report" |
| **API integration** | all | `test_api.py` — health/CORS, scenarios list + detail + 404, transcribe, extract, clarify, confirm, report get. | Full `/voice` golden path across typed HTTP calls |
| **Validation** | `contradiction`, `ambiguous` | `test_pipeline.py::test_validation_catches_contradictions_and_bounds` (bounds, non-negative, enrolled sum, meal contradiction), `test_ambiguity_on_meal_contradiction`; `test_assemble_validation_and_corrections` (valid report). | Report preview shows `validation.valid` / errors |
| **Error handling** | `network`, `duplicate`, `ambiguous`, `extraction-error` | `test_gateway.py::test_reject_mode_returns_422`, `test_network_failure_then_accept` (503 then accepted), `test_accept_and_duplicate`, `test_duplicate_mode_creates_no_row`; `test_api.py` 404 cases. | `/voice` gateway step → retry (same key) → accepted / duplicate |
| **Persistence** | all (cross-restart) | `tests/conftest.py` (isolated temp SQLite per test); `test_api.py::test_confirm_persists_report`; `test_gateway.py` (submissions survive within test DB). Tables in `app/db.py`: `reports`, `gateway_submissions`, `gateway_attempts`. | Observe receipt in `/dashboard` after transfer |
| **Report generation** | `normal`, `correction` | `test_pipeline.py::test_assemble_validation_and_corrections`; `test_api.py::test_confirm_persists_report` (report shape: `schema_version`, synthetic worker, fields, `transcript_ref`, `confirmation`, `status: draft`). | `/voice` report preview → "Transfer via simulated gateway" → `/dashboard` |

## How to run the mapped tests

```bash
cd sandbox/backend
uv run pytest -q
```

Individual groups:

```bash
uv run pytest tests/test_pipeline.py -q   # normalise, extract, clarify, validation, assemble
uv run pytest tests/test_api.py -q        # HTTP endpoints, CORS, simulated transcribe, persistence
uv run pytest tests/test_gateway.py -q    # accept / duplicate / reject / network failure
```

## Coverage notes for the lead

- **Scenario files are data, not yet committed here.** The test suite is self-contained (inline
  transcripts and monkeypatched gateway modes) and runs without `scenarios/`; the browser demo and
  `/api/scenarios` need scenario files present. See the [README](../README.md).
- **Playwright is planned, not present.** API_CONTRACT §6 calls for an end-to-end Playwright test;
  `@playwright/test` appears only as an optional peer dependency in the frontend lockfile. The E2E
  column describes intended coverage, not an existing test file.
- **Real ASR is not covered.** The "Telugu speech recognition" row tests number/span normalisation and
  the simulated transcription endpoint, not recognition accuracy. D-12 and the Phase 2 gate are
  unchanged.
- **No government integration is tested.** The gateway tests exercise a local simulation only; they
  do not validate compatibility with Poshan Tracker or Bala Sanjeevini (D-11, ADR-006).

For the walkthrough that ties these together, see [DEMO_SCRIPT.md](DEMO_SCRIPT.md); for design detail,
see [ARCHITECTURE.md](ARCHITECTURE.md); for claim discipline, see [SAFETY.md](../SAFETY.md).
