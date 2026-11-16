# Results sheet — coverage and limitations

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

One-page evidence summary for the hackathon. Every number below comes from a check that was actually run
on **2026-11-16** in `D:\GramVaani`. Nothing here is a measurement of speech accuracy, worker effort or
government compatibility.

## What this proves

- The application components communicate correctly.
- Structured data moves through the simulated workflow.
- Validation and correction mechanisms work in the tested scenarios.
- The simulated gateway handles duplicate submissions and network failures.

## Verification actually performed

| Check | Command | Result |
|---|---|---|
| Repo structure, config contract, links | `node scripts/verify-structure.mjs` | PASS — 46 markdown files, 101 links/anchors; main config still 14 fields, all `unverified` |
| Scenario corpus | `node sandbox/scripts/verify-sandbox.mjs` | PASS — 22 scenarios, 11 valid field IDs, 4 gateway modes |
| Backend unit + API tests | `uv run pytest -q` (in `sandbox/backend`) | 18 passed, 0 failed |
| Frontend type check and build | `pnpm exec tsc --noEmit`, `pnpm build` | both exit 0 |
| Live HTTP smoke test | transcribe → extract → confirm → submit → dashboard | 7 grounded extractions, valid report, gateway `accepted`, 1 dashboard row |
| End-to-end browser tests | `pnpm exec playwright test --config=tests/playwright.config.ts` | 3 passed — golden path, correction, network-failure retry |

## Scenario coverage

22 synthetic scenarios across 9 categories: `normal`, `mixed-language`, `missing`, `ambiguous`,
`contradiction`, `duplicate`, `extraction-error`, `network`, `correction`.
Gateway modes exercised: `accept`, `duplicate`, `reject`, `network_failure`.
See [TESTING.md](../tests/TESTING.md) and [FEATURE_TEST_MAP.md](FEATURE_TEST_MAP.md).

## Feature-to-evidence map

| Feature | Evidence in this sandbox | Status |
|---|---|---|
| Component communication | E2E golden path + live HTTP smoke test | Demonstrated |
| Structured data flow | Extraction with verbatim source spans → confirmed report → dashboard | Demonstrated |
| Validation | Required-field, range and contradiction checks; pytest cases | Demonstrated in tested cases |
| Correction | `s07` / `s10` scenarios; E2E correction test | Demonstrated |
| API integration | Local simulated gateway end to end | Demonstrated **locally only** |
| Duplicate handling | `s06`, idempotency-key tests | Demonstrated |
| Network failure / retry | `s08`, E2E retry test | Demonstrated |
| Persistence | SQLite report + gateway tables, restart-safe | Implemented and tested |
| Report generation | Same report shape from confirm and manual entry | Demonstrated |
| Telugu speech recognition | **Scripted transcript only** (`simulated: true`) | **Not measured** |
| Code-mixed speech accuracy | Scripted mixed-language scenarios | **Not measured** |
| Accent / noise robustness | No real audio | **Not measured** |
| Workload reduction | No time-and-motion study | **Not measured** |
| Government compatibility | No integration exists or is authorised | **Not applicable / not claimed** |

## What remains unproven

- Actual Telugu speech recognition accuracy.
- Regional Telugu accent handling.
- Telugu–English code-mixed speech accuracy.
- Performance in noisy environments.
- Whether the workflow reduces Anganwadi workers' workload.
- Compatibility with government applications.

## Why these gaps remain

- Transcription is **scripted**: `/api/voice/transcribe` returns a scenario's text with `simulated: true`.
  No audio is recorded, uploaded or recognised. Scripted text cannot produce WER, CER or latency figures.
- The field set is invented (`ILLUSTRATIVE_NOT_OFFICIAL`); it is not an official reporting format.
- No Anganwadi worker participated in this technical evaluation, and no consented speech corpus exists yet.
- The gateway writes to local SQLite only; it has never contacted any external system.
- Phase 0 field research is unchanged (0 sessions, 0 verified findings), as are decisions D-10, D-11 and D-12.

## Next measurement gate

Run the independent [TECHNICAL_EVALUATION_PLAN.md](TECHNICAL_EVALUATION_PLAN.md) with at least three ASR
approaches on the **same** consented audio corpus, measuring WER, CER, number and field extraction accuracy,
correction frequency and latency. No provider should be selected before those results exist.
