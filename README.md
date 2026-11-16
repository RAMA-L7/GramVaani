# GramVaani

Telugu-first, voice-assisted reporting prototype for Anganwadi workers in Andhra Pradesh.

> **Status: Phase 0 — field research. Documentation only.**
> No application code has been written. Nothing here integrates with, submits to, or is endorsed by any
> government system. Hackathon date: not recorded yet — see
> [deadline discipline](docs/DEVELOPMENT_ROADMAP.md#deadline-discipline-hackathon).

---

## The problem we are investigating

Anganwadi workers report spending significant time entering routine activity data into government
reporting apps, including Poshan Tracker and Bala Sanjeevini. That time is taken away from the children
and families they serve.

Our hypothesis — **not yet verified** — is that preparing the same report by *speaking naturally in Telugu*
(and mixing English where they already do), then correcting an editable transcript, reduces the effort
compared with typing into a form-first app.

The actual reporting workflow, the real field set, and any integration requirements are **still under
field research**. See [FIELD_RESEARCH_PLAN.md](research/FIELD_RESEARCH_PLAN.md).

## What the v0 prototype will do

1. **Telugu voice input** — record a spoken activity summary.
2. **Speech transcription** — convert speech to editable Telugu text.
3. **Editable transcript** — the transcript is the source of truth; the worker can fix anything.
4. **Telugu–English mixed-language handling** — code-mixed speech is expected, not an edge case.
5. **Structured information extraction** — pull candidate field values out of the transcript.
6. **Missing-information clarification** — ask short follow-up questions for gaps only.
7. **User confirmation and correction** — every extracted value is confirmed or fixed by the worker.
8. **Basic report preview** — a readable, printable draft. No submission.

Reporting fields are **configurable**, not hard-coded: see [config/report-fields.json](config/report-fields.json).

## What this project will not do

- ❌ Integrate with Poshan Tracker, Bala Sanjeevini, or any government app or API.
- ❌ Submit reports automatically, or on the worker's behalf.
- ❌ Claim official compatibility, certification, accuracy, or approval.
- ❌ Collect beneficiary information, personal health records, Aadhaar, or government credentials.
- ❌ Invent official reporting requirements. Every field is a labelled hypothesis until verified.
- ❌ Upload real field audio to third-party services without an explicit, documented decision.

## Repository layout

```
D:\GramVaani
├── README.md                       # You are here
├── .gitignore
├── docs/                           # Product, architecture, roadmap, decisions
│   ├── PROJECT_OVERVIEW.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── DEVELOPMENT_ROADMAP.md
│   └── DECISIONS_AND_ASSUMPTIONS.md
├── research/                       # Field research: plans, instruments, notes, findings
│   ├── FIELD_RESEARCH_PLAN.md
│   ├── RESEARCH_FINDINGS.md
│   ├── instruments/                # Consent script, interview guide, observation sheet, run sheet
│   └── notes/                      # Dated session notes, one file per session
├── config/                         # Configurable reporting fields (the contract)
│   ├── report-fields.json
│   └── report-fields.schema.json
├── frontend/                       # Next.js app (not scaffolded yet)
├── backend/                        # FastAPI service (not scaffolded yet)
├── prototype-assets/               # Synthetic audio, transcripts, prompts, UI mocks
│   ├── audio-samples/
│   ├── synthetic-reports/
│   ├── prompt-library/
│   └── ui-mocks/
├── tests/                          # Cross-cutting test strategy and fixtures
└── scripts/                        # Developer utilities (verify-structure.mjs)
```

## Documents

| Document | Answers |
|---|---|
| [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Why this exists, for whom, what success looks like |
| [PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) | What v0 must do, with acceptance criteria |
| [TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) | How the pieces fit, and the seams that keep it flexible |
| [FIELD_RESEARCH_PLAN.md](research/FIELD_RESEARCH_PLAN.md) | How we replace assumptions with evidence |
| [RESEARCH_FINDINGS.md](research/RESEARCH_FINDINGS.md) | What we actually know so far (currently: very little) |
| [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) | Phased build order and gates |
| [DECISIONS_AND_ASSUMPTIONS.md](docs/DECISIONS_AND_ASSUMPTIONS.md) | Decisions made, assumptions held, and how each gets tested |

## The three rules

1. **Never treat an assumption as a verified requirement.** A field is `unverified` until a session note
   says otherwise.
2. **Never use real beneficiary data in the prototype.** No names, no child records, no photos of children,
   no credentials — synthetic only.
3. **Never build a feature without naming the existing task it improves or replaces.** If it replaces
   nothing, it is scope creep.

How each rule is enforced in practice (not just stated):
[DECISIONS_AND_ASSUMPTIONS.md §4](docs/DECISIONS_AND_ASSUMPTIONS.md#4-how-the-three-project-rules-are-enforced).

Two supporting conventions: **config over code** (fields live in `config/`), and **provider-agnostic with no
unofficial claims** (ASR/extraction behind interfaces; always described as a research prototype).

## Getting started

There is nothing to run yet. **The next action is a visit, not a commit.**

1. Arrange one observation session with an Anganwadi worker.
2. Print [`research/instruments/session-run-sheet.md`](research/instruments/session-run-sheet.md) and the
   [consent script](research/instruments/consent-script-te.md) (Telugu).
3. Observe Poshan Tracker, Bala Sanjeevini and photo submission; time each step.
4. Write the note, then update [RESEARCH_FINDINGS.md](research/RESEARCH_FINDINGS.md) and
   [`config/report-fields.json`](config/report-fields.json).

The milestone after that is **Phase 0 exit**, described in
[DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md#phase-0--field-research-current).
