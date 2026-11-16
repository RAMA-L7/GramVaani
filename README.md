# GramVaani

Telugu-first, voice-assisted reporting prototype for Anganwadi workers in Andhra Pradesh.

> **Status: Phase 0 — discovery and documentation only.**
> No application code has been written. Nothing here integrates with, submits to, or is endorsed by any
> government system.

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
│   ├── instruments/                # Consent script, interview guide, observation sheet
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
└── scripts/                        # Developer utilities (empty for now)
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

## Five rules for this repository

1. **Evidence before features.** A field or workflow enters the code only after it is documented as
   verified, or explicitly flagged as a hypothesis.
2. **Synthetic data only.** No real beneficiary data, no real credentials, anywhere, at any stage.
3. **Config over code.** Reporting fields live in `config/`, not in source files.
4. **Provider-agnostic.** ASR, LLM, and storage are interfaces with swappable implementations.
5. **No unofficial claims.** We describe this as a research prototype. Always.

## Getting started

There is nothing to run yet.

The next milestone is **Phase 0 exit**: a completed field research pass that converts the open questions
in [RESEARCH_FINDINGS.md](research/RESEARCH_FINDINGS.md) into verified findings, and updates
`config/report-fields.json` accordingly. See
[DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md#recommended-next-step).
