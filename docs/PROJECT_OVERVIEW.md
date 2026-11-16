# Project Overview — GramVaani

**One line:** A Telugu-first, voice-assisted reporting prototype that turns a spoken activity summary into
an editable, structured, human-confirmed draft report for Anganwadi workers.

**Status:** Phase 0 (discovery). Documentation only. No application code.
**Last updated:** 2026-11-16

---

## 1. Context

Anganwadi workers in Andhra Pradesh run early-childhood care, nutrition, health and pre-school activities
at the centre, and then have to record what happened. Workers we have spoken to describe substantial time
spent inside government reporting apps — **Poshan Tracker** and **Bala Sanjeevini** have both been named.

> ⚠️ This context is **reported by workers in conversation**, not yet studied systematically. It is a
> hypothesis to investigate, not an established fact. See
> [RESEARCH_FINDINGS.md](../research/RESEARCH_FINDINGS.md).

The mismatch that interests us: reporting is a **form-first, typing-heavy** task, while the worker's
knowledge of the day is **narrative and spoken**, and is naturally expressed in **Telugu with English
technical terms mixed in** ("today's attendance 24, meal served, three children weighed").

## 2. Core hypothesis

> If an Anganwadi worker can *speak* the day's summary in her own Telugu, fix a short transcript, and
> confirm a handful of extracted values, then the time and cognitive effort of preparing a routine report
> decreases — without reducing the accuracy or completeness of what gets recorded.

**Falsifiable sub-hypotheses**

| ID | Hypothesis | How we would falsify it |
|---|---|---|
| H1 | Voice + light correction is faster than typing into a form for the same content | Timed same-content tasks, Phase 0 |
| H2 | Telugu code-mixed speech transcribes accurately enough to be worth correcting | Measured WER/CER on real synthetic-style samples |
| H3 | Extraction is accurate enough that confirmation is cheaper than manual entry | Edit-distance / correction count per field |
| H4 | Workers trust and prefer the transcript-first flow over form-first | Post-task interviews, preference ranking |
| H5 | The output is acceptable as a *record of the day*, even if not as an app submission | Review with workers and supervisors |

## 3. Users

| User | Role in v0 | Notes |
|---|---|---|
| **Anganwadi worker** (primary) | Speaks the report, corrects the transcript, confirms fields | Likely comfortable with WhatsApp; typing long Telugu is the pain point |
| **Supervisor / CDPO staff** (secondary) | Would review drafts in a real deployment | Out of scope for v0 UI, informs the preview format |
| **Research team** (internal) | Runs sessions, maintains evidence | Owns `research/` |

Not a user in v0: children, families, beneficiaries. We never model them.

## 4. What v0 is

A **single-worker, single-device, single-report** prototype that demonstrates one complete loop:

```
speak (Telugu) → transcribe → edit transcript → extract → clarify gaps → confirm → preview draft
```

Everything is synthetic. The report is shown on screen and can be printed or copied. It is never sent to a
government system.

## 5. What v0 is not

| Not this | Why |
|---|---|
| A submission tool | Integration requirements are unknown and unauthorised |
| An "official" or "compatible" product | We have no approval, no certification, no endorsement |
| A beneficiary database | Privacy risk with no research benefit |
| A general-purpose Telugu ASR product | We need *this* vocabulary and *this* workflow |
| A finished app | It is a research instrument with a UI |

## 6. Scope boundaries (non-negotiable)

1. **Synthetic data only.** Sample audio is recorded by the team reading scripted content; sample names,
   centre IDs and child counts are invented.
2. **No credentials.** No government logins, no OTPs, no stored session tokens for any third-party app.
3. **No automation of government apps.** No screen-scraping, no RPA, no API calls to Poshan Tracker or
   Bala Sanjeevini.
4. **No invented requirements.** Field names, types and validation rules are hypotheses in a config file
   until a research finding says otherwise.
5. **No unlabelled claims.** In any demo, deck or README, the prototype is described as a research
   prototype, never as a government tool.

## 7. Success criteria for this phase

Phase 0 succeeds when we can answer, with citations to session notes:

- [ ] What does an Anganwadi worker actually record, in what order, and how often?
- [ ] Which apps and forms are involved, and what does each ask for? (description only, not integration)
- [ ] Where exactly does the time go — recall, typing, navigation, or re-checking?
- [ ] Which parts of the report are *narrative* vs. *tabular*?
- [ ] What Telugu/English mixing actually occurs, with real examples?
- [ ] Would a worker accept a voice-first flow at all, and under what conditions?

Success is **not** "we built a demo". Success is "we can state the workflow, the effort, and the risks with
evidence".

## 8. Primary risks

| Risk | Impact | Mitigation |
|---|---|---|
| Field research is delayed | We build the wrong thing | Keep all field definitions in config; build only the pipeline seams |
| ASR quality on code-mixed Telugu is poor | Core loop fails | Provider-agnostic ASR; benchmark before committing; edit-first design absorbs errors |
| Worker distrust of being recorded | Recruitment and validity | Consent-first protocol, on-device option, transcript always visible and editable |
| Scope creep into "just integrate it" | Legal/ethical exposure | Explicit non-goals; architecture has no submission module at all |
| Confidentiality breach | Harm to workers, project ends | Synthetic data only, no beneficiary fields, `.gitignore` guardrails |

## 9. Related documents

- [PRODUCT_REQUIREMENTS.md](PRODUCT_REQUIREMENTS.md) — capability-level requirements
- [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md) — system design and seams
- [FIELD_RESEARCH_PLAN.md](../research/FIELD_RESEARCH_PLAN.md) — how hypotheses become evidence
- [DECISIONS_AND_ASSUMPTIONS.md](DECISIONS_AND_ASSUMPTIONS.md) — ADRs and assumption register
