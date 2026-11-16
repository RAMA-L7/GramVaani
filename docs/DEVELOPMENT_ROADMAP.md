# Development Roadmap

**Principle:** research gates code. We do not build a stage until the assumption it depends on has been
tested, or is knowingly accepted as a documented risk.

---

## Phase map

```
Phase 0  Field research                     ← we are here (docs + plan only)
   │      gate: workflow, timings and field set documented with citations
Phase 1  Validated product requirements
   │      gate: every requirement traces to a finding or an accepted assumption
Phase 2  Telugu voice-input prototype
   │      gate: ASR bake-off shows correction is cheaper than typing
Phase 3  Information extraction + clarification
   │      gate: zero ungrounded values on the golden set
Phase 4  Report preparation + validation
   │      gate: full loop completed by a worker, unaided
Phase 5  Usability testing + impact measurement
          gate: evidence for continue / pivot / stop
```

---

## Phase 0 — Field research (current)

**Goal:** replace our invented picture of the workflow with an observed one.

### Session sequence (one worker, one visit)

Run these in order. Run sheet: [`research/instruments/session-run-sheet.md`](../research/instruments/session-run-sheet.md).

| # | Action | Expected result | Where it lands |
|---|---|---|---|
| 1 | Arrange the session with an Anganwadi worker | Confirmed slot, ~2 hours | `research/notes/` |
| 2 | Explain the research, obtain written consent | Permission to observe; audio consent yes/no | Signed sheet (kept offline) |
| 3 | Observe **Poshan Tracker** reporting | Actual field order, taps vs. typing, timings | Observation sheet §A–C |
| 4 | Observe **Bala Sanjeevini** work | Which tasks are separate vs. synchronised with Poshan Tracker | Observation sheet §C–D |
| 5 | Observe **pre-school photo submission** | What is photographed, how many, when, what the app requires | Observation sheet §D (workflow only — **no photos of children**) |
| 6 | Record time and difficulties | Per-step baseline: recall / typing / navigation / re-check / waiting | §A–B |
| 7 | Interview a supervisor | Which of the recorded fields are actually required, and for whom | `interview-guide.md` |
| 8 | Update findings and field config | Evidence-based scope; assumptions marked verified or rejected | `RESEARCH_FINDINGS.md`, `config/report-fields.json` |

> Steps 3–5 are **observation of existing work**, not evaluation of our idea. Do not demo, suggest, or
> "help". Note what the app asks for; never copy beneficiary values into notes.

**Deliverables**

| Item | Status |
|---|---|
| Project docs, architecture, roadmap | ✅ done |
| Session instruments (consent, guide, observation sheet, run sheet) | ✅ done |
| `config/report-fields.json` v0.1.0 (all 14 fields `unverified`) | ✅ done |
| Completed sessions | ⬜ |
| `RESEARCH_FINDINGS.md` with citations | ⬜ |
| Config revised against observed workflow | ⬜ |

**Exit criteria:** every field in the config is either cited to a session note or explicitly `unverified`
with a plan; the "what does the report contain" question has a written, partial-but-honest answer; the
Poshan Tracker / Bala Sanjeevini / photo relationship is described.

**Do not build in this phase:** UI, models, storage, integrations.

## Phase 1 — Validated product requirements

Turn evidence into a spec, not a wish list.

- `PRODUCT_REQUIREMENTS.md` v1.0: only `verified`/`observed` items, plus accepted assumptions marked as such.
- Field config v0.2: renamed/added/removed fields, real bounds, real required-ness, real cadence.
- Scope decision written down: what the prototype will do for the demo, and what it explicitly will not.
- Assumption register closed out: each `AS-*` marked verified, rejected, or accepted-with-risk.
- A one-page "task → field" map: which existing step each proposed feature replaces or improves.

**Exit criteria:** every requirement traces to a finding or a documented assumption; nothing is in the spec
because it seemed reasonable. Sign-off by the research lead.

**Do not build in this phase:** still no application code.

## Phase 2 — Telugu voice-input prototype

Three sub-milestones, in order:

1. **Capture** — record button, states, playback, cancel, duration limit, session-temp audio with deletion.
2. **Transcription** — `ASRProvider` interface + two implementations (one local, one hosted), plus a
   synthetic corpus of 30–50 clips and a WER/CER + latency benchmark.
3. **Editable transcript** — transcript-first editor, low-confidence marks, segment-level re-speak, and the
   deterministic code-mix layer (Telugu numerals → digits, English tokens preserved, span detection).

**Exit criteria:** measured provider table (WER, numeral accuracy, latency, cost, data terms) and a documented
choice; a real 30 s Telugu summary transcribed and corrected in one flow, with correction effort measured.

**Not yet:** extraction, clarification, preview.

## Phase 3 — Information extraction + clarification

- `ExtractionEngine` with a schema generated from config; LLM path + rule fallback + fake provider for tests.
- Span-grounding verifier: any value not traceable to the transcript is dropped.
- Gap finder: required-missing → ambiguous → optional; ≤ 3 questions, text served from config.
- Golden fixtures (`example-001` and successors) wired into `tests/`.

**Exit criteria:** zero ungrounded values on the golden set; per-field recall recorded; question count per
report measured.

## Phase 4 — Report preparation + validation

- Confirmation UI: every value shown with its source phrase; "don't know" path; edit invalidation.
- Draft assembly, completeness, explicit gaps.
- Printable/copyable preview with the mandatory footer: *research prototype — not an official record — not
  submitted*.
- Local session log export for research.

**Exit criteria:** a worker completes record → correct → confirm → preview without a researcher's help, on
synthetic content.

## Phase 5 — Usability testing + impact measurement

- Guided pilot with 3–5 workers using **synthetic** content.
- Measure: time-to-report vs. their own baseline (from Phase 0), correction rate, question count, perceived
  effort, trust.
- Publish an honest result, including the negative cases.

**Exit criteria:** a written recommendation — continue, pivot the interaction model, or stop — supported by
the Phase 0 baseline and Phase 5 measurements.

---

## Deadline discipline (hackathon)

A deadline changes **scope**, never **evidence**.

| Rule | Meaning |
|---|---|
| Research quality is protected | Phase 0 is never shortened to "save time for building". Ten days of research prevents ten weeks of wrong code. |
| Scope is the variable | Cut breadth: fewer fields, one activity type, one device, one flow. |
| Demo claims match evidence | If a step is a hypothesis, the demo says so. No slide turns an unverified field into an official requirement. |
| Minimum demo is one loop | One worker, one device, synthetic data, speak → transcript → extract → confirm → preview. Nothing else. |
| Dates are recorded, not guessed | The hackathon date is **not recorded in this repo yet** — see `DECISIONS_AND_ASSUMPTIONS.md` D-8. |

If the deadline lands before Phase 0 completes, the demo shows the *research*, not a fake product: the
workflow map, the timings, and the config that came out of it.

---

## Sequencing rules

1. **No phase starts before the previous gate.**
2. **Config before code.** Every new field lands in `config/` with a fixture, then in the pipeline.
3. **No feature without a replaced task.** Each feature names the existing step it removes or shortens; if
   there isn't one, the feature is scope creep.
4. **Two implementations for every uncertain vendor choice** until the bake-off is done.
5. **No submission code, ever**, in any phase of this prototype — not behind a flag.

## What we are deliberately not scheduling

- Government app integration (unauthorised, undefined).
- Beneficiary-level records (privacy; no research value yet).
- Fine-tuning a Telugu ASR model (measure first).
- Cloud deployment, auth, multi-tenancy (one worker, one device).
- Photo capture — observed in Phase 0, **out of scope** for v0 (safeguarding risk with no research need).

## Recommended next step

> **Run the first observation session using `research/instruments/session-run-sheet.md`.**

Concretely:

1. Arrange the visit and confirm the report types the worker handles that day.
2. Print the consent script and observation sheet; bring a timer and a notepad (not a laptop).
3. Observe, time, and record in plain Telugu — no suggestions, no demos.
4. Within 24 h, write `research/notes/YYYY-MM-DD-session-01.md`.
5. Within 48 h, promote observations into `RESEARCH_FINDINGS.md` and update `config/report-fields.json`.

Rationale: the cheapest possible failure is discovering in a 30-minute interview that the report is weekly,
that Bala Sanjeevini handles a different task entirely, or that photos are the real product — any of which
would invalidate a UI built today.
