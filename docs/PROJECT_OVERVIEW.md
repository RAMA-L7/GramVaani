# Project Overview — GramVaani

**One line:** A Telugu-first, voice-assisted reporting prototype that turns a spoken activity summary into
an editable, structured, human-confirmed draft report for Anganwadi workers.

**Status:** Phase 0 (field research). Documentation only. No application code.
**Problem framing:** revised per **D-10** — we investigate **total documentation burden**, not app-entry time.
**Last updated:** 2026-11-16

---

## 1. Context

Anganwadi workers in Andhra Pradesh run early-childhood care, nutrition, health and pre-school activities
at the centre, and then have to record what happened — in **paper registers and digital applications**.
An early conversation named **Poshan Tracker** and **Bala Sanjeevini** as time-consuming.

> ⚠️ That conversation is `[UNVERIFIED]` from our own study — 0 sessions completed. The multi-agent desk
> study ([synthesis](../research/RESEARCH_SYNTHESIS.md)) **does not support** "app entry is the main
> burden": published time-use measurements put registers at ~51–82 min/day and apps at ~13–24 min/day.
> **D-10** therefore reframes the problem around total documentation burden. See
> [RESEARCH_FINDINGS.md](../research/RESEARCH_FINDINGS.md).

The mismatch worth investigating: documentation is spread across paper and digital surfaces, with recall,
copying and re-checking between them, while the worker's knowledge of the day is **narrative and spoken**,
naturally expressed in **Telugu with English technical terms mixed in** ("today's attendance 24, meal
served, three children weighed").

## 2. Core hypothesis

> **Working hypothesis (D-10/D-12):** much of the effort lies in **documentation as a whole** — registers,
> re-entry into digital systems, recalling details, and re-checking. Voice-assisted capture is one candidate
> way to reduce that effort, but it stays a **hypothesis** until tested with real, consented worker speech
> and measured correction effort. GramVaani is **not** positioned as an app-entry replacement.

**Falsifiable sub-hypotheses**

| ID | Hypothesis | How we would falsify it |
|---|---|---|
| H8 | Documentation burden (registers + digital entry + recall + re-checking) is the dominant workload | Four-way stopwatch in Session 01; if one category clearly dominates, target that task |
| H1 | Voice + light correction reduces total documentation effort more than the current process | Timed comparison on synthetic content, only after Session 01 |
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
- [ ] How Poshan Tracker, Bala Sanjeevini and pre-school photo submission relate to each other — separate,
      duplicated, or dependent?
- [ ] Where exactly does the time go, measured separately as paper register work, app entry,
      recall/gathering, and re-checking/corrections (D-10)? Recalled estimates are not substituted for
      measured minutes.
- [ ] Is photo submission a side task or a real bottleneck?
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
