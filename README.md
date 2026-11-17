# GramVaani

**A Telugu-first, voice-assisted reporting research project exploring ways to reduce documentation
burden for Anganwadi workers in Andhra Pradesh.**

> **Research repository (public).** This repository contains field-research materials and evidence tracking,
> a clearly separated **experimental [sandbox](sandbox/README.md)** (simulated apps, scripted transcripts,
> synthetic data, local API simulation only), and a separate **real-voice [pilot](pilot/README.md)** prototype
> track (experimental local application with evaluation/docs; distinct pilot config/DB; synthetic/non-identifying
> by default). Nothing here is a validated, deployed, or officially endorsed system. No government integration,
> submission, credentials, or compatibility claims (D-10/D-11/D-12 and safeguarding/consent requirements apply).

## Project status (honest, as of commit `02075b3`)

| Track | Honest current description |
|---|---|
| **Field validation** | **Zero completed sessions**; 0 verified findings (Phase 0 open). |
| **Sandbox** | **Implemented simulation** (scripted/synthetic, no government integration). |
| **Pilot** | **Implemented experimental local application** (worker voice/report workflow, researcher tools, local APIs/DB, `/history` dashboard); testing/accuracy/field-fit limitations apply (see `pilot/docs/`). |
| **Real speech evaluation** | **Not yet completed** on a consented real-speech corpus; no fabricated accuracy claims (D-12). |
| **Official workflow compatibility** | **Unverified** (fields/workflows/mappings not field-validated). |
| **Government integration** | **None** (no submission, no credentials, no automated interaction, no approval). |

**Test/report labeling:** repository test and verification reports (e.g. `pilot/docs/TEST_AND_VERIFICATION_REPORT.md`, `pilot/docs/VERIFICATION_REPORT_WORKER_UI.md`) are **repository-reported** for the commits they describe; they should be read with their stated scope/commit context and are not independent reproductions unless explicitly stated.

---

## 1. Introduction and problem context

Anganwadi workers in Andhra Pradesh deliver early-childhood care, nutrition, health and pre-school
activities, then record what happened in **paper registers and digital applications**. Documentation is
spread across surfaces: writing or copying into registers, entering the same information into apps,
recalling details from memory or other records, and re-checking entries.

Our original framing assumed that government app entry was the main source of workload. A 2026 multi-agent
desk study **did not support that claim**: published time-use measurements put paper registers at roughly
**51–82 minutes per day** and app entry at approximately **13–24 minutes per day**. The working problem is
therefore **total documentation burden**, not app-entry time. See
[RESEARCH_SYNTHESIS.md](research/RESEARCH_SYNTHESIS.md) and accepted decision
[D-10](docs/DECISIONS_AND_ASSUMPTIONS.md#31-accepted-decisions-recorded-2026-11-16).

**D-10** reframes the problem. **D-11** rules out government integration without an authorized, documented
interface. **D-12** keeps voice as a hypothesis until it is tested with real, consented worker speech and
measured correction effort.

## 2. Why this is being researched

Workers and supervisors describe reporting as time-consuming, but we do not yet know *which part* of the
work is expensive, *where* the effort actually occurs, or *what* a useful intervention would replace.
Building a product before answering those questions risks adding another register to maintain.

The research aims to establish, with evidence:

- the real end-to-end workflow, including paper and digital steps;
- how time is split across registers, app entry, recall and re-checking;
- which fields, cadence and formats are actually required;
- whether speech input could reduce a specific, named task;
- whether a prepared draft has a realistic consumer and path of use.

Findings are recorded before features. If the first sessions do not reveal a useful opportunity, more
sessions happen before the product changes.

## 3. Target users

| User | Role in the research | Notes |
|---|---|---|
| **Anganwadi worker** (primary) | Participant and prospective user of any future prototype | Likely comfortable with phones; long-form Telugu typing is a suspected friction point, not yet verified |
| **Supervisor / CDPO staff** (secondary) | Source of requirement and review-context evidence | Not a v0 UI user; consulted to understand what happens to a completed report |
| **Research team** (internal) | Owns instruments, notes and evidence register | Maintains `research/` |

Children, families and beneficiaries are **not users and not data subjects** in this prototype. No
beneficiary information is collected, modelled or stored.

## 4. Research-first approach

Development is gated by evidence. The current phase is **Phase 0 — field research**, and the next gate is
the [post-Session 01 development gate](docs/DEVELOPMENT_ROADMAP.md#post-session-01-development-gate):

- at least one fully documented real workflow;
- paper and digital tasks clearly separated;
- verified cadence and required fields;
- observed time evidence, not recalled estimates;
- one specific task GramVaani could reduce;
- a realistic path for using the prepared output.

If the gate is not met, Phase 0 stays open. **No UI is being built.** The session protocol is in
[session-run-sheet.md](research/instruments/session-run-sheet.md), with a four-way stopwatch (paper,
app, recall, re-checking) and separate optional consent for a Telugu speech sample.

## 5. Research status and evidence limitations

| Measure | Status |
|---|---|
| Completed field sessions | **0** |
| Verified findings | **0** — by design, see [RESEARCH_FINDINGS.md](research/RESEARCH_FINDINGS.md) |
| Desk-study sources | 138 deduplicated sources, all accessed 2026-11-16 |
| Independent spot-checks | 20 fetch attempts: 17 confirmed, 3 blocked |
| Origin claim ("time in government apps") | `[UNVERIFIED]` and **challenged** by published evidence |

Evidence labels used throughout the research files: `VERIFIED`, `PUBLISHED EVIDENCE`, `UNVERIFIED`,
`UNKNOWN`, plus `NATIONAL` / `STATE-AP` scope markers. Two documents from one ministry or encyclopedia
count as **one** source, not independent corroboration. The built-in web search tool failed during the
study (HTTP 402/429); discovery relied on direct fetch, arXiv API and news RSS, so absence of evidence
is not evidence of absence. Reviewer corrections are recorded in
[RESEARCH_GAPS.md](research/RESEARCH_GAPS.md). Start at the [research index](research/README.md).

## 6. Candidate capabilities — **unvalidated, not committed scope**

These are hypotheses about what a future prototype *might* do. None is approved for implementation.

1. Telugu voice input with session-scoped audio.
2. Speech transcription to an editable Telugu-script transcript.
3. Editable transcript as the source of truth.
4. Telugu–English code-mixed speech handling, preserving English terms verbatim.
5. Structured information extraction from configurable fields.
6. Clarification questions for missing or ambiguous information.
7. Worker confirmation and correction of every extracted value.
8. A basic, printable **draft preview** with a mandatory "not an official record, not submitted" footer.

Reporting fields live in [`config/report-fields.json`](config/report-fields.json) and are all marked
`unverified`. The file is deliberately **not a specification of official reporting requirements**.

## 7. Six-phase development roadmap

| Phase | Focus | Gate to proceed |
|---|---|---|
| **0 — Field research** *(current)* | Observe real workflows; measure four time categories; interview a supervisor | Post-Session 01 gate above |
| **1 — Validated product requirements** | Rewrite requirements from evidence; update field config; name the task being replaced | Every requirement traces to a finding or an accepted assumption |
| **2 — Telugu voice-input prototype** | Recorder, ASR provider bake-off on consented speech, editable transcript, code-mix normalisation | Measured correction is cheaper than the current process |
| **3 — Information extraction + clarification** | Config-driven extraction, span grounding, ≤3 questions | Zero ungrounded values on the golden set |
| **4 — Report preparation + validation** | Confirmation, gaps, printable draft preview | A worker completes the loop unaided on synthetic content |
| **5 — Usability testing + impact measurement** | Small pilot against the Phase 0 baseline | Evidence for continue / pivot / stop |

A deadline changes **scope**, never evidence. See the full
[DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md).

## 8. Technology and architecture decisions

Provisional, unimplemented choices, recorded as ADRs in
[DECISIONS_AND_ASSUMPTIONS.md](docs/DECISIONS_AND_ASSUMPTIONS.md):

| Decision | Summary |
|---|---|
| ADR-001 | Config-driven fields — JSON + JSON Schema, no field names in source code |
| ADR-002 | Transcript-first — the editable transcript is the source of truth; extracted values need a source span |
| ADR-003 | Next.js frontend + FastAPI backend behind typed HTTP contracts |
| ADR-004 | `ASRProvider` / `ExtractionEngine` interfaces; no vendor chosen before a measured bake-off |
| ADR-005 | Local-first SQLite, one worker, one device, no accounts or sync |
| ADR-006 | **No submission module, credential store or scheduler exists in the codebase** |
| ADR-007 | Telugu script canonical; English tokens preserved; no "correction" of the worker's register |
| ADR-008 | Synthetic data only; no beneficiary entity in the data model |
| ADR-009 | Documentation, research and code kept in separate directories |

Pipeline shape (design only): `audio → capture → ASR → code-mix normalisation → extraction → clarification →
draft assembly → preview`. Full detail in
[TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md). Product requirements are in
[PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md).

## 9. Privacy and safeguarding principles

- **Synthetic data only.** No beneficiary records, names, child IDs, Aadhaar numbers or health records.
- **No government credentials**, no API keys for government systems, and no authentication to any app.
- **No photos of children.** Photo submission is observed as a workflow only, never as content.
- **Audio lifecycle:** session-scoped; deleted after transcription unless separately consented for research;
  never committed (gitignored).
- **Local-first:** SQLite locally, opt-in local logs, no third-party telemetry by default; any cloud ASR or
  LLM call must be disclosed before it happens.
- **No official claims:** every draft carries a "research prototype — not an official record — not
  submitted" footer.
- **Ethics:** consent in Telugu, withdrawal at any time, anonymised codes, 90-day raw-data retention, and
  ethics review before any work with real people.

The legal note in [PRIVACY_AND_SAFEGUARDING.md](research/PRIVACY_AND_SAFEGUARDING.md) is desk research,
**not legal advice**; statutory commencement dates still need Gazette verification.

## 10. Project structure

```
D:\GramVaani
├── README.md                        # This document
├── .gitignore / .gitattributes      # Safety net: audio, private notes, line endings
├── config/                          # Configurable, all-unverified reporting fields + JSON Schema
├── docs/                            # Overview, requirements, architecture, roadmap, decisions
├── research/                        # Research index, 7 domain reports, gaps, synthesis, sources
│   ├── instruments/                 # Consent, interview guide, observation sheet, run sheet
│   └── notes/                       # Dated session notes (anonymised; private notes gitignored)
├── prototype-assets/                # Synthetic transcripts, audio manifest, prompt drafts, mocks
├── frontend/                        # Placeholder README — no code
├── backend/                         # Placeholder README — no code
├── tests/                           # Test strategy; golden fixture plan
├── scripts/verify-structure.mjs     # Dependency-free structure and contract check
├── sandbox/                         # Experimental module: simulated apps, 22 scenarios, local gateway
└── pilot/                           # Real-voice prototype track (separate): evaluation, scripts, docs
```

## 11. Setup and verification

Nothing needs to be installed to review the research. Node.js 26 (or any recent Node) is enough for the
check; Python is intentionally not required yet (a future backend would use `uv`).

```powershell
cd D:\GramVaani

# Structure, config contract, fixture references, Markdown links and anchors
node scripts/verify-structure.mjs

# Optional: validate the sandbox's 22 synthetic scenarios and manifest
node sandbox/scripts/verify-sandbox.mjs

# Optional full JSON Schema validation (fetches ajv-cli once)
npx --yes ajv-cli@5 validate -s config/report-fields.schema.json `
  -d config/report-fields.json --spec=draft2020
```

A passing check exits `0`. There is no dev server, build or test suite yet — adding one before the Phase 0
gate would violate the research-first approach. Future scaffold commands are documented in
[frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md).

## 12. Current status and contribution guidance

- **Status:** private research repository; Phase 0 open; no application code; no deployment.
- **Not seeking:** feature PRs, UI work, integrations, or "official compatibility" contributions.
- **Welcome:** research questions, source suggestions, corrections to evidence labels, and feedback on the
  instruments — raise a private issue in this repository.
- **Rules for any contribution:** never treat an assumption as a verified requirement; never add real
  beneficiary data, credentials or child photos; never add a feature without naming the existing task it
  improves or replaces.
- **Decisions D-10, D-11 and D-12 are accepted** and should not be changed without new field evidence and
  an explicit decision record.

No contributors, achievements, statistics or deployments are claimed here beyond what the linked research
documents actually record.

## 13. Field-testing & live pilot planning (proposed)

Planning documents now outline a possible, **gated** path from the simulated sandbox to controlled field
testing of a real mobile-first Telugu voice prototype. These are **plans only** — not implementation,
not validation, and not evidence of readiness, speech accuracy, or real-world impact.

- [docs/FIELD_TESTING_PROGRAM.md](docs/FIELD_TESTING_PROGRAM.md) — controlled pilot programme
  (layers, staged pilots, metrics, worker research dashboard, safeguards, feedback loop).
- [docs/LIVE_PROTOTYPE_PLAN.md](docs/LIVE_PROTOTYPE_PLAN.md) — technical plan for a separate live
  prototype track (real mic/ASR adapters, editable transcript, sample report, sandbox kept as fallback).
- [research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md](research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md)
  — draft consent, privacy, access, retention, withdrawal and safeguarding protocol.

All pilot planning remains subject to **Phase 0** evidence, **D-10** (total documentation burden, not
app-entry replacement), **D-11/ADR-006** (no government integration, submission, credentials or
compatibility claims), **D-12** (voice unproven until tested with real consented speech and measured
correction effort), synthetic/non-identifying initial pilots, and explicit worker consent. The main field
config remains unverified.
