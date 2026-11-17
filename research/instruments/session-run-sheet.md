# Session 01 run sheet — documentation burden

*Print this. One page. Tick as you go. Bring a stopwatch and a notepad; leave the laptop at home.*
*Framing per D-10: we are measuring **total documentation burden**, not app-entry time.*

**Date:** __________  **Worker code:** W__  **Centre type:** urban / rural  **Observer:** __________
**Arrival:** ______  **Departure:** ______  **Observation consent:** yes / no
**Optional speech-sample consent:** yes / no *(asked separately, step 8)*

---

## Before you begin

- [ ] Consent script printed (Telugu), two copies; signed sheet stored separately from notes
- [ ] Observation sheet printed, with the **four time categories** ready
- [ ] Stopwatch ready; phone silent; no irrelevant photos on the phone
- [ ] Reminder to self: **observe, don't help, don't demo, don't test GramVaani**
- [ ] Say aloud: "I am learning your work, not checking it. You can stop at any time."

> **Recalled time is not measured time.** If she says "it takes an hour", write that down as `[said]` — then
> time the actual task with the stopwatch and write that as `[obs]`. If they differ, keep both and note why.

## Step 1 — Describe a typical reporting day (10 min)

- [ ] "Walk me through yesterday, from when you opened the centre to when you finished reporting."
- [ ] Ask where reporting fits relative to other duties; do not lead toward apps
- **Her own account, in one paragraph (mark `[said]`):**

## Step 2 — Inventory every register and application (15 min)

- [ ] Walk the room / desk. List **every** paper register, diary, file, notebook and folder used for reporting
- [ ] List **every** digital application and portal she uses for this work (name them as she does)
- [ ] For each: who fills it, how often, and where it goes afterwards
- [ ] Ask: "Which of these do you use together?" — describe, do not assume a sync

**Paper inventory:** ______________________  **Digital inventory:** ______________________

## Step 3 — Observe one complete reporting task (30–40 min)

- [ ] **Start** the stopwatch at the **first action needed to prepare the selected report** (including paper preparation, gathering information, or retrieving registers — not only the first app interaction). **Finish** after its **required submission, checking, and corrections are complete**.
- [ ] One row per step on the observation sheet: what she did, which register/app/surface, input/action, duration
- [ ] Record **active work**, **waiting** (network/loading) and **unrelated interruptions** separately as they happen
- [ ] Write field labels verbatim. **Never copy beneficiary values, names or identifiers**
- [ ] Note pauses, look-ups, interruptions and re-checks as they happen; if categories overlap (e.g. looking up a paper register while gathering), assign to **one primary category only** on the observation sheet and do not double-count

## Step 4 — Measure four separate time categories (during step 3)

Use one stopwatch lap per category; **do not merge or double-count**. Assign each **active-work** minute to **exactly one** primary category (A–D). If categories overlap (e.g. looking up/retrieving a paper register while gathering information), assign that interval to the **single best-fit primary purpose** and note the overlap (count it once). **Waiting** and **unrelated interruptions** are recorded separately and excluded from A–D.

| Category | What counts (primary purpose) | Minutes (active, non-overlapping) | Note |
|---|---|---|---|
| **A. Paper register work** | Writing, copying, totals, filing in registers/paper records | ____ | |
| **B. App entry** | Typing/tapping/selecting into Poshan Tracker or any digital app/portal | ____ | |
| **C. Recalling / gathering information** | Pausing to recall, asking someone, finding a list or other source of information | ____ | |
| **D. Re-checking and corrections** | Going back, re-counting, fixing an entry, verifying/correcting | ____ | |
| **Total observed (A+B+C+D)** | Equals active work (excluding waiting/unrelated interruptions) | ____ | |

- [ ] Record **Active work / Waiting / Unrelated interruptions** separately (as in Step 3 / observation sheet)
- [ ] Record the worker's own estimate separately: ____ min `[said]`
- [ ] If observed ≠ recalled, note the likely reason (interruption, multi-tasking, unusual day)

## Step 5 — Poshan Tracker and Bala Sanjeevini, separately (20–30 min)

- [ ] Observe or walk through **each app separately**, with its own timing and field list
- [ ] Which content is entered in both? Does she copy from one to the other, or cross-check?
- [ ] Does she log in to each separately? (Ask about the *existence* of credentials; **never ask for them**)
- [ ] Note device, network and server problems as she describes them
- [ ] **Verdict (tick):** separate work ☐ · duplicated work ☐ · one depends on the other ☐ · unclear ☐

## Step 6 — Preschool photos: ask first, observe only if the workflow exists (10 min)

- [ ] Ask: "Are photos of preschool activities part of this report? Who asks for them?"
- [ ] If **no** → record that as a finding and move on. Do not prompt further
- [ ] If **yes** → observe the workflow only: how many photos, what must be visible, time taken, whether it
      blocks the report
- [ ] **Never take a photo yourself, never ask to see stored photos, never record a name or face**
- **Answer:** yes / no / unclear — details (workflow only): ______________________

## Step 7 — Incorrect or incomplete information (10 min)

- [ ] "What happens if you enter something wrong? How would you notice, and how would you fix it?"
- [ ] "What happens if a required piece of information is missing on the day?"
- [ ] "Who checks the finished report, and what do they check?"
- [ ] Capture verbatim answers; do not suggest a voice or correction feature yet

## Step 8 — Optional Telugu speech sample (5–10 min)

- [ ] **Ask separately** for permission to record a short speech sample. Refusal is fine and is itself a finding
- [ ] Explain: what will be recorded, where it stays, who hears it, that it is deleted after transcription
- [ ] If consented: "Tell me today's report as if you were explaining it to your supervisor." Let her finish
      uninterrupted — this is the most valuable minute of the visit
- [ ] Note the English/Hindi words she mixes in, verbatim, in Telugu script
- [ ] Record sample ID (e.g. `field-sample-01`), duration, consent status; **do not commit the audio**

**Consent:** yes / no  **Sample ID:** ______  **Duration:** ____  **Mixed terms observed:**

---

## Within 24 hours

- [ ] Write `research/notes/YYYY-MM-DD-session-01.md` from `note-template.md`
- [ ] Keep `[said]` and `[obs]` separate; keep the four time categories separate
- [ ] If audio was consented: transcribe, then delete the recording; never commit raw audio
- [ ] Any safeguarding concern → follow the district escalation path; **do not record the detail here**

## Within 48 hours

- [ ] Promote observations into `RESEARCH_FINDINGS.md` with the correct evidence label
- [ ] Update assumptions (AS-01, AS-17) in `docs/DECISIONS_AND_ASSUMPTIONS.md`
- [ ] Apply the [post-Session 01 gate](../../docs/DEVELOPMENT_ROADMAP.md#post-session-01-development-gate)
- [ ] `node scripts/verify-structure.mjs` and commit

---

## Red flags — record and report, do not interpret away

| Signal | Why it matters |
|---|---|
| Paper registers dominate the stopwatch | Supports D-10 / AS-17; changes what a prototype could usefully reduce |
| App time is negligible | Confirms our origin claim was wrong; do not revive it |
| Recall/gathering dominates | Voice input may not help; reducing look-ups might |
| Re-checking and corrections dominate | Confirmation/correction features, not dictation, may be the lever |
| The report is weekly, not daily | Cadence and field semantics change (D-2) |
| Reporting happens at home / after hours | Privacy, offline and device assumptions change |
| The supervisor does the entry | Wrong primary user |
| Photos are the bottleneck | Re-scope under rule 3: name the task being replaced |
| No useful opportunity is visible | **Run more sessions before changing the product** |
