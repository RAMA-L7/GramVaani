# Sandbox testing guide

This module is a simulated reporting environment. Every transcript is invented,
Telugu or Telugu-English code-mixed, and contains no real names, child
identifiers, Aadhaar numbers or phone numbers. No audio is recorded or uploaded.
The fields are illustrative, not official reporting requirements.

## Scenario catalogue (22)

All scenario JSON files live in `../scenarios/`. The index is
`../scenarios/manifest.json`. Every scenario sets `"synthetic": true`.

| ID | Category | What it tests | Expected validation | Gateway mode |
| --- | --- | --- | --- | --- |
| s01-normal-telugu | normal | Clean Telugu daily report; golden path with attendance, meal and remarks grounded in the transcript | valid | accept |
| s02-mixed-language | mixed-language | Telugu-English code-mixed tokens still produce correct extractions | valid | accept |
| s03-missing-attendance-count | missing | Required attendance count absent; becomes a clarification question | valid after answer | accept |
| s04-unclear-number | ambiguous | Two competing numbers near "వచ్చారు" flag the field for clarification | valid after answer | accept |
| s05-contradictory-information | contradiction | Present + absent exceeds enrolled and meal counted though not served; two validation errors | invalid | accept |
| s06-duplicate-voice-submission | duplicate | Same report submitted twice with one idempotency key | valid | duplicate |
| s07-extraction-error-meal-count | extraction-error | Parser reads 30 meals; worker corrects to 22 before confirmation | valid after correction | accept |
| s08-network-failure-retry | network | First gateway POST returns HTTP 503; retry with same key is accepted | valid | network_failure |
| s09-gateway-reject | API failure via gateway | Locally valid report is rejected with HTTP 422 by the simulated gateway | valid locally, rejected by gateway | reject |
| s10-worker-correction-attendance | correction | Worker changes extracted attendance from 30 to 28 before confirming | valid after correction | accept |
| s11-negation-meal-not-given | normal | Negative "పెట్టలేదు" yields meal_served=false, never true | valid | accept |
| s12-future-plan-not-today | normal | Tomorrow's plan of 30 must not overwrite today's attendance of 20 | valid | accept |
| s13-multiple-activities | normal | Four activities collected in one enum-list field | valid | accept |
| s14-spoken-numerals | normal | Composite spoken numeral "నలభై రెండు" parsed as 42 | valid | accept |
| s15-photo-step | normal | Synthetic sample photo flag; never a child photo | valid | accept |
| s16-empty-transcript | missing | Empty scripted transcript yields both required fields as gaps | valid after answers | accept |
| s17-boundary-values | normal | Attendance at max 200 and absence at min 0 validate cleanly | valid | accept |
| s18-extra-remarks | normal | Free-text remarks captured and "చిత్రం లేదు" yields photo_attached=false | valid | accept |
| s19-wrong-date | correction | Old date in transcript corrected before the report is generated | valid after correction | accept |
| s20-absent-meal | normal | Home visit with no meal: meal_served=false, no invented meal_count | valid | accept |
| s21-enrolled-exceeded | contradiction | 10 present + 5 absent exceeds 10 enrolled; worker corrects enrolment to 16 | valid after correction | accept |
| s22-clarification-missing-activity | missing | No activity synonym present; activity_type becomes a clarification gap | valid after answer | accept |

Gateway modes covered: **accept, duplicate, network_failure, reject**.

## Run the backend tests (pytest)

From `sandbox/backend`:

```
uv run pytest -q
```

These cover the extraction pipeline, validation rules and the simulated API.

## Run the structure verifier

From `sandbox/`:

```
node scripts/verify-sandbox.mjs
```

It checks every scenario JSON for unique ids, required keys, `synthetic === true`,
valid `gateway.mode`, valid field ids against `config/sandbox-fields.json`, and
that `scenarios/manifest.json` matches the files on disk. Exit code 0 means all
checks passed; exit code 1 prints one line per problem.

## Run Playwright

Start the backend and frontend as described in [README.md](README.md), then from
`sandbox/`:

```
npx playwright install chromium
npx playwright test --config=tests/playwright.config.ts
```

The spec `e2e/flow.spec.ts` covers the golden path (select scenario, simulated
record, edit transcript, extract, confirm, submit, see accepted result), a
worker-correction case (s07), and a network-failure retry (s08).
