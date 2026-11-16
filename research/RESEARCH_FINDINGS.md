# Research Findings

**Last updated:** 2026-11-16
**Sessions completed:** 0
**Verified findings:** 0

> This file is deliberately mostly empty. It will be filled by evidence, not by writing plausible things.
> If a claim has no citation, it does not belong in §1.

Evidence labels are defined in
[DECISIONS_AND_ASSUMPTIONS.md §0](../docs/DECISIONS_AND_ASSUMPTIONS.md#0-evidence-taxonomy-used-across-all-docs):
`verified` · `observed` · `hypothesis` · `assumption` · `rejected`.

---

## 1. Verified findings

*None yet. A finding enters this table only with ≥ 2 independent sources or direct documented observation,
and a citation of the form `notes/<file>.md §<section>`.*

| # | Finding | Implication | Evidence | Date |
|---|---|---|---|---|
| — | *(empty)* | | | |

## 2. Observed but not corroborated

*Single sightings. Useful, but they cannot justify code on their own.*

| # | Observation | Context | Confidence | Session |
|---|---|---|---|---|
| O-1 | Workers describe spending significant time in government reporting apps, naming **Poshan Tracker** and **Bala Sanjeevini** | Informal conversations, pre-study | `hypothesis` | pre-study |

> O-1 is the origin of the project's framing. It has **not** been measured, timed, or corroborated. Treat
> any statement like "workers spend X hours per week reporting" as unsupported until §1 has an entry.

## 3. Open questions

| # | Question | Blocks | Status |
|---|---|---|---|
| Q-1 | What fields does the routine report actually contain? | `config/report-fields.json`, FR-5 | open |
| Q-2 | Daily, weekly, or event-driven reporting? | Cadence, D-2 | open |
| Q-3 | Where does the time go — recall, typing, navigation, or re-checking? | H1, AS-02 | open |
| Q-4 | How much Telugu–English mixing occurs in practice, and in which terms? | AS-03, ADR-007 | open |
| Q-5 | Is narrative free text part of the report, or is it all tabular? | Preview design | open |
| Q-6 | Who reads the report after it is entered, and in what form? | AS-10, D-6 | open |
| Q-7 | Would workers accept audio recording for transcription? On-device only? | AS-12, AS-06 | open |
| Q-8 | Is there a supervisor review step that changes the required content? | Field config | open |
| Q-9 | What is the maximum tolerable correction effort before voice loses to typing? | Phase 2 gate | open |

## 4. Working hypotheses under test

| ID | Hypothesis | Test | Status |
|---|---|---|---|
| H1 | Voice + light correction is faster than form typing for the same content | Timed task comparison | untested |
| H2 | Code-mixed Telugu ASR is accurate enough that correction is cheaper than typing | WER/CER + correction rate | untested |
| H3 | Extraction is accurate enough that confirmation costs less than manual entry | Per-field correction count | untested |
| H4 | Workers trust a transcript-first flow more than a form-first flow | Interviews + preference | untested |
| H5 | A draft (not a submission) is an acceptable output | Supervisor/worker interviews | untested |

## 5. Rejected assumptions

*Recorded so we do not silently re-adopt them. Empty for now.*

| # | Assumption | Why rejected | Date |
|---|---|---|---|
| — | *(empty)* | | |

## 6. Evidence log

One line per session, linking to the note file.

| Date | Session | Participant | Method | Note | Key takeaway |
|---|---|---|---|---|---|
| — | — | — | — | — | *(no sessions yet)* |

## 7. How to add a finding

1. Write the session note first: `research/notes/YYYY-MM-DD-session-NN.md` (template in
   `research/instruments/note-template.md`). Anonymised codes only.
2. Decide the label honestly:
   - seen once → `observed` (§2)
   - two independent sources, or timed and documented → `verified` (§1)
   - reasoned but unobserved → leave it in the hypothesis table (§4), don't inflate it
3. If a finding contradicts an assumption in `docs/DECISIONS_AND_ASSUMPTIONS.md`, mark that assumption
   `rejected` in the same commit and note which design decision it affects.
4. If it changes the field picture, update `config/report-fields.json` and bump `config_version`.
5. Update §6 evidence log.

**Anti-patterns we are avoiding:** rounding "a worker said" into "workers say"; citing a news article as
field evidence; using a conference deck as a substitute for a session; writing a requirement because a
competitor has that feature.
