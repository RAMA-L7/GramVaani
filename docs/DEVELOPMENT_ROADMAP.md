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

**Goal:** replace our invented picture of the workflow with an observed one. Per **D-10**, the subject is
**total documentation burden** — paper registers, digital reporting, recall, repeated recording and
re-checking — not app-entry time. GramVaani is not positioned as an app-entry replacement.

### Session 01 priorities (one worker, one visit)

Run these in order. Run sheet: [`research/instruments/session-run-sheet.md`](../research/instruments/session-run-sheet.md).
Obtain observation consent before step 1; speech-sample consent is asked **separately** at step 8.

| # | Action | Expected result | Where it lands |
|---|---|---|---|
| 1 | Ask the worker to describe a typical reporting day | Her own account, marked `[said]` | Note §2 |
| 2 | Identify **every** paper register and digital application used | Complete inventory of the documentation surface | Observation sheet §C |
| 3 | Observe one complete reporting task | Step-by-step record, with timings | Observation sheet §A |
| 4 | Measure four time categories: paper register work, app entry, recall/gathering, re-checking/corrections | Four separate minutes, plus her estimate labelled separately | Observation sheet §B |
| 5 | Investigate **Poshan Tracker** and **Bala Sanjeevini** separately | Separate field lists and workflows; duplicated vs separate work | Note §4 |
| 6 | Ask whether preschool photos are required; observe the workflow **only if it exists** | Yes/no + workflow only, never photos of children | Note §5 |
| 7 | Ask what happens when information is incorrect or a report is incomplete | Error/recovery and review path | `interview-guide.md` §7 |
| 8 | Request an optional Telugu speech sample with **separate recording consent** | Consent yes/no; sample ID; mixed terms noted | Note §6, audio never committed |

> **Recalled time is not measured time.** Keep `[said]` and `[obs]` figures separate. Steps 1–7 are
> observation of existing work, not evaluation of our idea: do not demo, suggest or "help". Never ask for
> credentials, never copy beneficiary values, never photograph children.

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
Poshan Tracker / Bala Sanjeevini / photo relationship is described; and the gate below is met.

**Do not build in this phase:** UI, models, storage, integrations.

### Post-Session 01 development gate

This gate decides whether we may move toward Phase 1. It is a gate on **evidence**, not on elapsed time.
All six conditions must be met before product scope is decided:

- [ ] **At least one fully documented real workflow** — a note that lets a stranger replay the task.
- [ ] **Clear separation of paper and digital tasks** — which work happens on which surface, with the four
      timed categories kept distinct.
- [ ] **Verified reporting cadence and required fields** — confirmed with the worker, and where possible
      with the supervisor; unverified fields stay flagged in config.
- [ ] **Evidence of where workers spend their time** — observed minutes, not recalled estimates.
- [ ] **One specific task GramVaani could reduce** — named explicitly, satisfying rule 3 (which existing
      task does it improve or replace?).
- [ ] **A realistic path for using the prepared output** — who consumes the draft and what happens to it;
      no submission or compatibility claim.

**If Session 01 does not establish a useful opportunity:** conduct more sessions before changing the
product. Keep Phase 0 open. Do not build the UI.

> Phase 0 remains open. The research prevented us from building around an unverified problem; that is
> progress, not delay. Voice stays a hypothesis (D-12) until tested with real consented speech and measured
> correction effort.

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

## Pilot-track planning (proposed, gated)

Separate planning documents describe a possible controlled field-testing track for a **live, mobile-first
Telugu voice prototype** (real microphone and ASR behind adapters, editable transcript, sample report),
while keeping the current sandbox as fallback:

- [FIELD_TESTING_PROGRAM.md](FIELD_TESTING_PROGRAM.md)
- [LIVE_PROTOTYPE_PLAN.md](LIVE_PROTOTYPE_PLAN.md)
- [../research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md](../research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md)

These documents are **planning only** and do not change Phase 0 status, any gate, or accepted decisions
D-10/D-11/D-12/ADR-006. A live pilot depends on field evidence, validated fields, consent and safeguarding
readiness, synthetic/non-identifying initial use, and a measured ASR evaluation (D-12) — it is not a
shortcut past Phase 0 or a claim of accuracy, compatibility, or impact.
