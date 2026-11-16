# Hackathon demo script — golden path

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

Use this script for a single, honest loop with one synthetic Telugu scenario (`s01-normal-telugu`).
Read [SAFETY.md](../SAFETY.md) first. Use the permitted wording verbatim and include the
"What this does not prove" statement. Never claim government compatibility or measured impact.

**Setup:** backend running on `http://localhost:8000`, frontend on `http://localhost:3000`, a scenario
file `scenarios/s01-normal-telugu.json` present (see [README.md](../README.md)). The scripted transcript
is: "ఈరోజు ఇరవై నాలుగు మంది పిల్లలు వచ్చారు. ముగ్గురు పిల్లలు జ్వరంతో రాలేదు. భోజనం పెట్టారు. ఇరవై నాలుగు
మందికి భోజనం పెట్టారు. ప్రీస్కూల్ పాటలు కథలు. చిత్రం జోడించారు."

---

## Recommended 3-minute run — see [DEMO_3MIN.md](DEMO_3MIN.md)

Use five demo beats after a short framing intro: **normal Telugu scenario → incorrect meal-count
correction → network failure → retry and dashboard → boundary statement**. The detailed 8-step walkthrough
below is the reference; the 3-minute script is what to actually present.

## What this proves — say only these

- The application components communicate correctly.
- Structured data moves through the simulated workflow.
- Validation and correction mechanisms work in tested scenarios.
- The simulated gateway handles duplicate submissions and network failures.

## What remains unproven — state every time

- Actual Telugu speech recognition accuracy.
- Regional Telugu accent handling.
- Telugu–English code-mixed speech accuracy.
- Performance in noisy environments.
- Whether the workflow reduces Anganwadi workers' workload.
- Compatibility with government applications.

---

### Step 1 — Frame the demo (narrator, no screen action)

> "We built a simulated reporting environment to evaluate whether Telugu voice input, structured
> extraction, validation and API-based data transfer work reliably. Actual government workflow
> compatibility remains subject to field validation and authorization."

**Expected screen:** `/` landing page with the persistent banner:
**SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

---

### Step 2 — Pick the scenario

> "I'm selecting one scripted Telugu scenario. Everything you'll see uses synthetic worker `SYN-W001`
> and centre `SYN-C001` — no real person or record."

**Action:** On `/voice`, select `s01-normal-telugu` in the scenario picker.
**Expected screen:** Scenario details card showing category `normal`, gateway mode `accept`,
`synthetic: true`, and the scenario notes.

---

### Step 3 — Scripted "recording" → transcription

> "The microphone button is a UI simulation. It starts a timer and then loads the scenario's scripted
> transcript from the API. No audio is recorded or uploaded, and no speech-recognition engine runs."

**Action:** Press the mic button, let the timer run a moment, press stop.
**Expected screen:** Transcript editor populated with the Telugu transcript, labelled with
`simulated: true` and the provider name.

---

### Step 4 — Editable transcript (the source of truth)

> "The editable transcript is the single source of truth. I can fix the ground text before anything is
> derived from it — this is transcript-first, not form-first."

**Action:** Click into the transcript and show that it is editable (make no substantive change, or
restore it).
**Expected screen:** Transcript editor in edit mode.

---

### Step 5 — Extraction

> "I extract structured fields from the transcript. Each value is grounded in a verbatim phrase from
> the text — if I couldn't point to the phrase, it would be dropped."

**Action:** Click "Extract fields from transcript".
**Expected screen:** Extraction review with values such as `children_present = 24`, `children_absent = 3`,
`meal_served = true`, `meal_count = 24`, `photo_attached = true`, each with its raw phrase and span,
all marked as needing confirmation. A clarification question appears for the missing
`preschool_activity`.

---

### Step 6 — Worker confirmation and correction

> "No value enters the report until I explicitly confirm. Here I answer the clarification question
> and correct one extracted number before the report is generated."

**Action:** Answer `preschool_activity` with "పాటలు, కథలు". In the extraction review, change
`meal_count` from 24 to **22**. Click "Confirm and generate report".
**Expected screen:** "All clarification questions answered"; a report preview with `status: draft`,
the corrected `meal_count = 22`, `preschool_activity = "పాటలు, కథలు"`, synthetic worker/centre codes,
`transcript_ref: s01-normal-telugu`, and a `validation` result of valid with no errors.

---

### Step 7 — Simulated gateway transfer

> "This transfers the confirmed report to the sandbox gateway only — a local simulation that writes to
> a SQLite table and produces a receipt for a dummy dashboard. It does not contact any government
> system. The idempotency key stays the same across retries."

**Action:** Click "Submit to gateway"; optionally click "Submit again (same key)" to show a `duplicate`
result with no second receipt.
**Expected screen:** Gateway result showing `status: accepted`, a `receipt_id` beginning `RCPT-`, and a
dashboard entry. A repeat should show `status: duplicate` with a single receipt.

---

### Step 8 — Dashboard receipt and close

> "The dummy dashboard shows what arrived through the simulated gateway — not a real government
> system."

**Action:** Open `/dashboard`.
**Expected screen:** A list containing the submitted receipt (`RCPT-…`), timestamp, status, and the
report. Then present the closing statement below.

---

## "What this does not prove" — include as a slide or spoken line

> "This demo does not prove government compatibility, field accuracy, or impact. It uses a scripted
> Telugu transcript rather than real speech; real speech-recognition evaluation remains a Phase 2 gate.
> The fields are invented for a sandbox, not verified official reporting requirements. Nothing was
> submitted to any government system, no real data was used, and no workload reduction or time saving
> was measured. Phase 0 research status and decisions D-10, D-11 and D-12 are unchanged."

Use the permitted wording from [SAFETY.md](../SAFETY.md) as the positive claim; use the statement above
as the honest boundary. For scenario coverage, see [FEATURE_TEST_MAP.md](FEATURE_TEST_MAP.md); for the
system design, see [ARCHITECTURE.md](ARCHITECTURE.md).
