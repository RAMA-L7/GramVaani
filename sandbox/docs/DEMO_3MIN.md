# Three-minute hackathon demo

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

This is the presentation script. The longer walkthrough is in [DEMO_SCRIPT.md](DEMO_SCRIPT.md); the claim
rules are in [SAFETY.md](../SAFETY.md). Keep the five beats in order and end with the boundary statement.
Total: approximately 3 minutes.

**Before you start:** backend on port 8000, frontend on port 3000, `GET /api/health` returns `ok`, and the
banner is visible. Delete any prior dashboard state so receipts are easy to read.

---

### 0:00–0:20 — Frame (no screen action)

> "We built a simulated reporting environment to evaluate whether Telugu voice input, structured
> extraction, validation and API-based data transfer work reliably. Actual government workflow
> compatibility remains subject to field validation and authorization."
>
> "The microphone is a UI simulation: it loads a **scripted** Telugu transcript. No audio is recorded or
> uploaded, and no speech-recognition engine runs in this demo."

**Screen:** `/` landing page with the persistent simulation banner.

### 0:20–0:55 — Normal Telugu scenario

> "I select one synthetic Telugu scenario and press record. The transcript appears, and it is editable —
> the text is the source of truth."

**Action:** `/voice` → select `s01-normal-telugu` → press mic → stop → press **Extract fields from transcript**.
**Expected:** Telugu transcript in the editor; grounded extractions such as `children_present = 24`,
`meal_served = true`, each with its source phrase and `needs_confirmation`.

> "Each value points back to a verbatim phrase. Nothing enters the report without my confirmation."

### 0:55–1:30 — Correct an incorrectly extracted meal count

> "Here is a deliberately wrong extraction. I correct it before confirming — a built-in correction step
> that runs before any report is generated."

**Action:** select `s07-extraction-error-meal-count` → record → extract → change `meal_count` to **22** →
answer any clarification question → **Confirm and generate report**.
**Expected:** report preview shows `meal_count = 22` and validation `valid`.

### 1:30–2:00 — Network failure

> "Now the simulated gateway fails once. This is our own local API, not a government system."

**Action:** submit the confirmed report with `s08-network-failure-retry`.
**Expected:** error panel showing HTTP 503 / `simulated network failure; retry with the same key`.

### 2:00–2:30 — Retry with the same idempotency key, then show the dashboard

> "Retry uses the same idempotency key, so a second row is not created."

**Action:** click **Retry with same idempotency key** → open `/dashboard`.
**Expected:** `status: accepted`, a `RCPT-…` receipt, and exactly one dashboard entry. Optionally show a
repeat submit returning `duplicate`.

### 2:30–3:00 — Boundary statement (say it, do not skip)

> "This proves four things: the application components communicate correctly; structured data moves
> through the simulated workflow; validation and correction mechanisms work in the tested scenarios; and
> the simulated gateway handles duplicate submissions and network failures."
>
> "It does **not** prove actual Telugu speech recognition accuracy, regional accent handling,
> Telugu–English code-mixed speech accuracy, noisy-environment performance, workload reduction, or
> compatibility with government applications. Those require real consented speech, field observation,
> and authorization. Phase 0 status is unchanged; D-10 keeps documentation burden as the problem
> hypothesis (not app-entry time), D-11 keeps government integration out, and D-12 keeps voice unvalidated
> until tested with consented speech."

**Screen:** hold the dashboard, then return to `/` so the banner is the final frame.

---

## If something fails

| Problem | Say / do |
|---|---|
| Backend not running | Show the architecture one-pager instead; do not pretend the API worked |
| Frontend not loading | Use the API smoke test commands in [README.md](../README.md) and show JSON responses |
| Wrong scenario data in dashboard | Delete local SQLite state and restart; never edit a scenario to "make it pass" |
| Audience asks about Poshan Tracker | "No integration exists or is authorised — D-11. This is a local simulation." |
| Audience asks about accuracy or impact | "Not measured here. Real ASR and workload evaluation are separate gates." |

Supporting assets: [ARCHITECTURE_ONEPAGER.md](ARCHITECTURE_ONEPAGER.md) and
[RESULTS_SHEET.md](RESULTS_SHEET.md).
