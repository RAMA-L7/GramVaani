# Demo scope freeze

**Frozen from 2026-11-16 until after the hackathon presentation.** The goal is reliability and a clear
story, not more features. See [DEMO_3MIN.md](DEMO_3MIN.md) for the presentation script.

## Allowed

- Rehearsing the five-beat demo and refining narration/timing notes.
- Correcting documentation that does not match observed behaviour.
- Re-running verification commands and recording results in the results sheet.
- Fixing a demonstrated defect with the smallest possible change, then re-running all checks.

## Blocked until after the presentation

- New application features, new pages, new fields or new workflow steps.
- Changing `config/sandbox-fields.json` or the main `config/report-fields.json`.
- Adding new scenarios that change the demo sequence (additive test fixtures are acceptable only if they
  do not alter the three demo scenarios).
- Selecting an ASR or LLM provider, or adding any real model/cloud call.
- Editing research documents, ADRs, or decisions D-10 / D-11 / D-12.

If a change seems necessary, ask first: **does it improve the reliability of the demonstrated loop?** If
not, defer it.

## Technical rehearsal log — 2026-11-16

Clean run from an empty SQLite database through the local HTTP API, in the demo order:

| Beat | Scenario | Observed result |
|---|---|---|
| 1 | `s01-normal-telugu` | 7 grounded extractions, 0 gaps, validation valid, gateway `accepted` |
| 2 | `s07-extraction-error-meal-count` | extracted `meal_count = 30` corrected to `22` before confirmation, validation valid |
| 3 | `s08-network-failure-retry` | first gateway attempt HTTP 503 with retry instruction |
| 4 | same key retried, then submitted again | retry `accepted`; repeat `duplicate`; dashboard shows 2 entries |

This verifies the **technical sequence**. Narration timing is not machine-measurable — the human presenter
must rehearse the three-minute script out loud and keep the boundary statement intact.

## Pre-presentation checks

- [ ] Delete `backend/sandbox.db` before the final run so the dashboard starts empty.
- [ ] Re-run `node scripts/verify-structure.mjs` and `node sandbox/scripts/verify-sandbox.mjs`.
- [ ] Confirm the banner is visible on every page and the boundary statement is in the script.
- [ ] Read [SAFETY.md](../SAFETY.md) and [QA_PREP.md](QA_PREP.md) immediately before presenting.
- [ ] Confirm the repository is still private and `main` is pushed.
