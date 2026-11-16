# Field Research Plan

**Purpose:** replace our assumptions about Anganwadi reporting with observed evidence, before writing
application code.
**Duration:** 2–3 weeks, 4–6 sessions.
**Owner:** research lead (one person is enough at this stage).
**Status:** not started.

---

## 1. Research questions

| # | Question | Feeds |
|---|---|---|
| RQ1 | What exactly does a worker record, field by field, and in what order? | Field config, D-1 |
| RQ2 | How often, and at what time of day, is each report prepared? | Cadence, D-2 |
| RQ3 | Which apps/screens are used, and what does each ask for? (description only) | Problem framing |
| RQ9 | What is the relationship between Poshan Tracker and Bala Sanjeevini — separate, duplicated, or dependent? | Scope, D-9 |
| RQ10 | What does pre-school photo submission involve: how many photos, what must be visible, time taken, does it block the report? | Scope, D-9 |
| RQ4 | Where does the time actually go: recall, typing, navigation, re-checking? | AS-02, H1 |
| RQ5 | What Telugu/English mixing occurs? Collect concrete utterances. | AS-03, ADR-007 |
| RQ6 | What would make a worker trust or distrust a voice-prepared draft? | AS-06, H4 |
| RQ7 | Who consumes the report afterwards, and in what form? | AS-10, D-6 |
| RQ8 | What must never be recorded or shared? | Privacy design |
| RQ12 | What happens when information is incorrect or a report is incomplete — who notices, who fixes it? | Error/recovery design, D-12 |
| RQ13 | Will the worker consent to a real Telugu speech sample, and how much correction does it need? | D-12, ASR bake-off |

## 2. Non-goals for this study

- No evaluation of our prototype (it does not exist yet; see §6 for the later Wizard-of-Oz step).
- No requests for credentials, logins, screenshots of beneficiary records, or app exports.
- No collection of beneficiary data of any kind — not even anonymised counts tied to real children.
- No claims about official requirements. We record what workers *do*, not what the government *requires*.

## 3. Participants

- 4–6 Anganwadi workers, ideally across 2 centres and 2 supervisors, in one district.
- Recruitment through a trusted local intermediary; no incentive large enough to distort participation.
- Inclusion: currently preparing reports themselves. Exclusion: anyone who cannot consent independently.
- Record only: role, centre type (urban/rural), years of experience, device model. **No names of children or
  families; worker names replaced by codes (W1…W6).**

## 4. Methods (in order)

### 4.1 Contextual observation (60–75 min, per worker)
Watch one real reporting session. Do not help. Time each step on the observation sheet.
Record: app/screen sequence, field order, typing vs. tapping, pauses, re-checks, interruptions.
Ask "what are you thinking here?" sparingly — every 5–7 minutes at most.

Observe **each report type separately** (Poshan Tracker, Bala Sanjeevini, photo submission), and then note
how they relate: is one copied from the other, does one block the other, is the same content entered twice?
That relationship is a finding in itself, and it decides whether we need one field set or several.

**Photo submission is observed as a workflow, never as content.** We record how many photos, how long it
takes, and whether it blocks the report. We do not photograph children, do not ask to see stored photos, and
do not write down anything identifying. See §5.

### 4.2 Semi-structured interview (30–40 min)
Use `instruments/interview-guide.md`. Focus on effort, workarounds, and what they would change.
Ask for a **spoken walkthrough**: "tell me today's report out loud, as if I were your supervisor."
Record only with written consent; otherwise take notes.

### 4.3 Card sort / prioritisation (10 min)
Show a printed list of candidate report items (from the current config) and ask which are essential,
occasional, or irrelevant. This directly edits `config/report-fields.json`.

### 4.4 Wizard-of-Oz check (optional, 20 min, later in the study)
Researcher plays the "system": worker speaks, researcher types the transcript and reads back extracted
values. Tests AS-04/AS-05 cheaply, with zero code.

## 5. Data handling and ethics

| Rule | Detail |
|---|---|
| Consent | Written, in Telugu, read aloud. Withdrawal any time, no explanation needed. See `instruments/consent-script-te.md`. |
| Audio | Recorded only with explicit separate consent. Stored on an encrypted device, deleted after transcription, never committed to git. |
| Notes | Anonymised codes only. No centre names in filenames. |
| Beneficiary data | **Never** captured. If it appears on a screen, look away from it and note "beneficiary screen present" only. |
| Photographs | **No photos of children, ever** — not taken, not reviewed, not stored. Observe the photo-submission workflow only. Photos of app screens are allowed only if they contain no names or faces, and only with separate consent. |
| Credentials | Never requested, never observed, never stored. |
| Sharing | Raw notes stay with the research lead. Summaries go into this repo, anonymised. |
| Retention | Raw audio/notes deleted 90 days after the study closes, or on request. |

If a participant discloses a safeguarding concern, stop the session, follow the district's child-protection
escalation path, and do not record the detail in project files.

## 6. Session protocol (checklist)

> Printable one-pager with the full 8-step sequence, timing boxes and red flags:
> [`instruments/session-run-sheet.md`](instruments/session-run-sheet.md). Print it for every visit.

1. Confirm consent; give the participant the withdrawal option again.
2. Observation: start the timer at first interaction with the reporting app; note each step.
3. Interview: audio only if consented; otherwise notes.
4. Card sort: photograph the sorted piles (no personal data on them).
5. Debrief: ask "what did I miss?" and "what should I not have asked?"
6. Within 24 h: write `research/notes/YYYY-MM-DD-session-NN.md` using `instruments/note-template.md`.
7. Within 48 h: promote observations into `RESEARCH_FINDINGS.md` with the evidence label.
8. Update `config/report-fields.json` if the field picture changed materially.

## 7. Analysis

- Open coding of notes → themes → map each theme to RQ1–RQ8.
- Build a **task-time table** per worker (minutes per step, per report type).
- Build a **field frequency table**: field → how many workers mentioned it → status.
- Triangulate: an item becomes `verified` only with ≥ 2 independent sources.
- Write a one-page "what changed in our model of the workflow" note.

## 8. Exit criteria

- [ ] RQ1 answered with a field-level table (partial answers labelled).
- [ ] RQ4 answered with observed timings, not estimates, split into **four separate categories**: paper
      register work, app entry, recalling/gathering, re-checking/corrections (D-10). The worker's recalled
      estimate is recorded separately and labelled `[said]`.
- [ ] RQ5 answered with at least 10 real, consented example utterances (or a statement that consent was
      declined, which is itself a finding).
- [ ] RQ9 answered: the Poshan Tracker / Bala Sanjeevini / photo relationship is described, even if only
      partially.
- [ ] RQ10 answered: photo count, timing, and whether it blocks the report.
- [ ] `config/report-fields.json` updated; every field has `verification.status` and a citation or an
      explicit open flag.
- [ ] Privacy constraints (RQ8) written into the architecture, not just noted.
- [ ] Go/no-go recorded in `RESEARCH_FINDINGS.md` for starting Phase 1 (validated product requirements).

## 9. Timeline (indicative)

| Week | Activity |
|---|---|
| 1 | Recruitment, consent, 2 observation sessions, instruments refined |
| 2 | 2–3 more sessions, transcripts of consented audio, coding begins |
| 3 | Final sessions if needed, analysis, field config rewrite, go/no-go |

## 10. Known limitations (state these in any write-up)

- Small, convenience sample; not generalisable to all of Andhra Pradesh.
- Observation changes behaviour (Hawthorne effect).
- Self-reported time is unreliable; prefer timing.
- One district and one season; reporting load is seasonal.
- We cannot validate anything against official documentation without authorisation, so all requirements
  stay hypotheses.
