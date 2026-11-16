# Session run sheet — first observation

*Print this. One page. Tick as you go. Bring a timer and a notepad; leave the laptop at home.*

**Date:** __________  **Worker code:** W__  **Centre type:** urban / rural  **Observer:** __________
**Arrival:** ______  **Departure:** ______  **Audio consent:** yes / no  **Photo consent:** yes / no

---

## Before you knock

- [ ] Consent script printed (Telugu), two copies
- [ ] Observation sheet printed (2 copies — one per report type)
- [ ] Timer/stopwatch ready
- [ ] Phone on silent; storage cleared of any irrelevant photos
- [ ] Reminder to self: **observe, don't help, don't demo**

## Step 1 — Settle in (5 min)

- [ ] Greet, explain who you are and why you are there
- [ ] Make clear: "I am learning your work, not checking it"
- [ ] Ask what reports are due today, and which app each uses
- **Note:** the day's plan in one line →

## Step 2 — Consent (10 min)

- [ ] Read the consent script aloud, slowly
- [ ] Answer questions; do not oversell the project
- [ ] Signed sheet collected and stored separately from notes
- [ ] Audio consent asked **separately**; if refused, notes only — and record the refusal as a finding
- [ ] "You can stop at any time, no reason needed" — said out loud

## Step 3 — Poshan Tracker (30–40 min)

- [ ] Start the timer at the **first interaction with the app**
- [ ] One row per step on the observation sheet: screen, input type, duration
- [ ] Write field labels **verbatim**; never copy values
- [ ] Mark pauses, re-checks, hunts for information
- **Timings** — recall ___  typing ___  tapping ___  re-check ___  waiting ___  **total ___
- **Blocked by:** ______________________

## Step 4 — Bala Sanjeevini (20–30 min)

- [ ] Same timing discipline, separate sheet
- [ ] Note explicitly: which content is **also** entered in Poshan Tracker, and which is not
- [ ] Note whether one is done *from* the other (copying, cross-checking)
- **Verdict (tick):** fully separate ☐ · partly duplicated ☐ · synchronised ☐ · don't know yet ☐
- **Overlap in one sentence:** ______________________

## Step 5 — Pre-school photo submission (10–15 min)

- [ ] Observe the **workflow only**: when photos are taken, how many, what must be visible, what the app does
      with them, whether it blocks the report
- [ ] Note the number of photos and the time it takes — that is the interesting number
- [ ] **Do not** take photos yourself, and do not ask to see photos of children
- [ ] **Do not** record names, faces, or any identifying detail in notes — write "children present: yes"
- [ ] If the worker offers to show stored photos, decline politely and explain why

**Photo step timing:** ______ min  **Blocks report:** yes / no / sometimes  **Notes:**

## Step 6 — Difficulties (5 min, right after)

- [ ] What went wrong or nearly went wrong?
- [ ] Where did she hesitate? What did she look for?
- [ ] Did she use paper, a notebook, or a second phone first?
- [ ] Frustration moments, verbatim if possible

## Step 7 — Interview (30–40 min)

- [ ] `interview-guide.md` §1–§4 (workflow, language, workarounds)
- [ ] Spoken walkthrough: "tell me today's report as if I were your supervisor" — **let her finish, don't
      interrupt**; this is the most valuable 60 seconds of the visit
- [ ] Card sort of the current candidate fields: must / sometimes / not needed + "what's missing?"
- [ ] §5 reactions to the voice idea (describe, don't demo)

## Step 8 — Wrap-up (5 min)

- [ ] "What should I have asked and didn't?"
- [ ] Ask permission to return with a rough version
- [ ] Thank them; no promises about a product or a timeline
- [ ] Confirm how to reach them for follow-up questions

---

## Within 24 hours

- [ ] Write `research/notes/YYYY-MM-DD-session-01.md` from `note-template.md`
- [ ] Separate facts from interpretation (template §2 vs §7)
- [ ] Transcribe consented audio, then delete the audio
- [ ] Any safeguarding concern → follow the district escalation path; **do not** write the detail in project files

## Within 48 hours

- [ ] Promote findings to `RESEARCH_FINDINGS.md` with the right label (`observed` vs `verified`)
- [ ] Mark contradicted assumptions `rejected` in `DECISIONS_AND_ASSUMPTIONS.md`
- [ ] Update `config/report-fields.json`; bump `config_version`
- [ ] `node scripts/verify-structure.mjs` and commit

---

## Red flags — stop and rethink if you see these

| Signal | Why it matters |
|---|---|
| The report is **weekly**, not daily | The whole interaction model and field cadence change |
| Reporting happens **at home**, not at the centre | Offline, privacy and device assumptions change |
| The supervisor does the entry, not the worker | Wrong user; voice input may help nobody |
| Photos are the bottleneck, not text | The product idea may be wrong; pivot toward capture |
| She dictates into WhatsApp already | Strong signal for feasibility — or for "already solved" |
| She refuses audio recording | Architecture must be on-device; a finding, not a failure |
