# Field Testing Programme — Live Web Prototype

**Date:** 2026-11-16  
**Status:** Planning document (Phase 0 remains open; 0 sessions, 0 verified findings)  
**Scope:** Disciplined, evidence-first plan for piloting a live, mobile-first web prototype with selected Anganwadi workers using synthetic or non-identifying information only.  
**Related documents:** [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md), [DECISIONS_AND_ASSUMPTIONS.md](DECISIONS_AND_ASSUMPTIONS.md), [../research/RESEARCH_SYNTHESIS.md](../research/RESEARCH_SYNTHESIS.md), [../research/RESEARCH_GAPS.md](../research/RESEARCH_GAPS.md), [../research/FIELD_RESEARCH_PLAN.md](../research/FIELD_RESEARCH_PLAN.md), [../sandbox/docs/QA_PREP.md](../sandbox/docs/QA_PREP.md), [../sandbox/docs/RESULTS_SHEET.md](../sandbox/docs/RESULTS_SHEET.md)

---

## 1. Status & evidence discipline

This programme is **forward planning**, not evidence of readiness, validation, impact, or workload reduction.

- **Phase 0 is open.** There are 0 completed field sessions and 0 verified findings. Field testing of the prototype must not be treated as a substitute for Phase 0 observation or as proof that GramVaani solves a real problem.
- **No evidence-before-claiming.** We do not claim time savings, accuracy in the field, adoption, or compatibility until measured in the relevant context with documented methods and results.
- **Evidence taxonomy applies** (per `DECISIONS_AND_ASSUMPTIONS.md`): claims must be labelled `verified`, `observed`, `hypothesis`, `assumption`, or `rejected`, with citations for `verified`.
- **Workers validate fit, not our assumptions.** Participants help us learn whether GramVaani fits their real work. They should not be asked to validate the accuracy of our assumptions for us, and their feedback must not be reframed as confirmation of untested claims.
- **Hypotheses remain hypotheses.** Voice usefulness, correction effort, reporting-field fit, and workflow value stay unproven until tested with real, consented worker speech/workflows and measured outcomes (D-12, D-10, Phase 0 gates).
- **Main field config remains unverified.** `config/report-fields.json` is v0.1.0 with 14 fields all `unverified`. Do not assume those fields match real requirements; validate fields through field research first and revise config with citations before treating any field as required or official.

---

## 2. Purpose and boundaries

### 2.1 Purpose

Test, in controlled conditions, whether a **mobile-first, real-microphone Telugu voice prototype** can help a worker speak naturally, review and correct a transcript, and generate a **sample (non-official) report draft** as part of understanding total documentation burden.

### 2.2 Hard boundaries (non-negotiable)

| Boundary | Meaning for this programme |
|---|---|
| **D-10 — Total documentation burden** | Frame evaluation around paper registers, digital reporting, recall, repeated recording, and re-checking — not app-entry time. Do not position GramVaani as an app-entry replacement or claim workload/time savings without separate measurement. |
| **D-11 / ADR-006 — No integration or submission** | No government integration, submission, credentials, compatibility claims, automated transfer, or sending experimental reports to government systems (including Poshan Tracker and Bala Sanjeevini). No submission module or credential store in this prototype. |
| **D-12 — Voice is a hypothesis** | Do not choose an ASR provider from advertised/benchmark accuracy alone. Test with real, consented worker speech and measure correction effort, number accuracy, and failure modes before selecting. |
| **Data minimisation and safeguarding** | First pilots use **synthetic or non-identifying information only**. No children's names, Aadhaar/beneficiary identifiers, child photos, or government credentials. Workers must not depend on the prototype for mandatory reporting. |
| **Consent and recording** | Obtain informed consent before any recording. Obtain **separate consent** for research use/retention of recordings. Explain storage, access, retention period, and withdrawal path before capture. Respect withdrawal and deletion requests per protocol. |
| **Controlled access** | "Publicly reachable" pilot site ≠ unrestricted research access. Use individual pilot access codes, HTTPS, and restricted researcher access. No open research database. |
| **Fallback** | Keep the current sandbox (scripted transcripts, simulated gateway) as a fallback/demo and comparison environment while developing live voice support. |

---

## 3. Relationship to the existing 6-phase development roadmap

This is a **pilot track** that runs alongside and is informed by the existing roadmap in [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md), not a replacement for it.

| Existing roadmap | How this pilot track relates |
|---|---|
| **Phase 0 — Field research (open, gate-controlled)** | **Prerequisite and ongoing constraint.** Field validation of actual workflow, field list, cadence, Poshan Tracker/Bala Sanjeevini relationship, and photo workflow must come from Phase 0 instruments/findings. Pilot tasks and sample-report fields may be exercised only with synthetic/non-identifying content and clearly marked illustrative until validated. |
| **Phase 1 — Validated product requirements** | Pilot feedback may generate hypotheses and requirement candidates, but requirements become accepted only when traced to findings or documented assumptions (per roadmap rule). |
| **Phase 2 — Telugu voice-input prototype** | This pilot track’s live microphone/ASR work aligns with Phase 2 gates (capture, transcription comparison, editable transcript, correction-effort measurement) but targets a **real mobile-first web flow** rather than extending the simulated microphone. D-12 governs provider evaluation. |
| **Phase 3/4 — Extraction, clarification, confirmation, preview** | End-to-end reporting workflow in the pilot must preserve transcript-first grounding, span traceability, worker confirmation, and explicit "sample/research prototype — not official, not submitted" framing (ADR-002, ADR-006). |
| **Phase 5 — Usability testing & impact measurement** | Controlled pilot stages here feed evidence for usability and measurement design, but must measure existing workflow and GramVaani workflow separately and avoid premature impact claims. |

**Key distinction:** the existing roadmap is the product-evidence sequence; this document defines the **controlled live-pilot operating programme** (build → deploy → test → measure → improve → retest) under the same gates and safeguards.

---

## 4. Approach and workflow (continuous feedback loop)

### 4.1 End-to-end pilot workflow

1. **Build** a working mobile-web prototype increment (real microphone and Telugu ASR, editable transcript, or end-to-end sample-report flow as scoped).
2. **Deploy** to a **controlled pilot website** (individual access codes, HTTPS, restricted researcher access) — not an open public research database.
3. **Prepare** selected, consenting workers with a clear briefing: voluntary participation, synthetic/non-identifying practice content only, no mandatory-reporting dependence, right to stop.
4. **Capture** speech on the worker’s smartphone (tap microphone, speak naturally in Telugu / Telugu–English mix as occurs).
5. **Transcribe** speech to text via ASR behind an adapter (for comparison when evaluating), show transcript promptly.
6. **Review/correct** transcript (and extracted values when applicable); allow retry and manual fallback.
7. **Prepare sample report** preview/draft from confirmed information only; save draft/export sample as allowed by pilot scope; **never submit to government systems**.
8. **Collect feedback** (structured prompts and optional written/voice feedback with separate consent where recorded).
9. **Analyse and improve** (aggregated/anonymised metrics, issue triage, config/instrument updates with evidence labels).
10. **Retest** in the next increment/stage.

### 4.2 Continuous loop

**Observe → Build → Deploy → Test → Measure → Improve → Retest**

- *Observe:* Phase 0 sessions, pilot sessions, support issues, and correction patterns (without ranking workers).
- *Measure:* pre-defined metrics (Section 9) for existing workflow and prototype workflow separately.
- *Improve:* prioritize fixes that reduce correction burden, confusion, or failure; document rationale and evidence status.
- *Retest:* verify changes in the next controlled stage before widening access.

---

## 5. Three testing layers

### Layer A — Voice testing

**Goal:** evaluate capture and transcription as a workflow under real conditions (hypothesis-driven, D-12).

| Focus | What to test | Notes |
|---|---|---|
| Capture | Microphone permission flow, tap-to-record/stop, recording states, playback (where useful), duration limits, retry, cancel | Mobile browser constraints vary; test on target devices early. |
| Language & speech | Telugu and Telugu–English mixed speech, natural phrasing, domain terms, spoken numbers, dates/quantities | Collect/code terms from field validation; do not assume vocabulary. |
| ASR output | Transcript readability, latency, segmenting, confidence/uncertainty cues (if used), failure handling | Editable transcript is mandatory; low-confidence cues must not imply correctness. |
| Correction & fallback | Ease of editing, re-speak/segment retry, manual text fallback, correction effort | Correction effort is a primary outcome, not an afterthought. |
| Conditions | Accent variation, speaking pace, background noise, intermittent connectivity behavior | Record conditions as context; do not generalise beyond observed settings. |

**Do not:** claim ASR accuracy or select a provider based only on advertised benchmarks. Keep sandbox scripted-transcript flow available for comparison and fallback.

### Layer B — Reporting workflow testing

**Goal:** test whether spoken/reviewed input can become a clear, worker-confirmed **sample report draft** without overclaiming field correctness.

| Step | What to test | Safeguards |
|---|---|---|
| Input to structure | Extract/organise information from transcript; clarify missing/ambiguous items | Extraction must be grounded in transcript/source spans where implemented; no invented values. |
| Clarification | Question count, wording clarity, timing, ability to answer/skip/mark unknown | Keep burden low; measure clarification frequency. |
| Review & confirm | Worker reviews values, edits corrections, confirms before draft generation | Transcript/content review remains worker-controlled; no silent correction. |
| Sample report output | Completed sample report preview, explicit "research prototype — not official, not submitted" labeling, draft save, sample export | Fields shown only as validated/illustrative per evidence status; no official-format or compatibility claims. |
| Task fit | Whether the draft helps recall/checking/re-recording steps in total documentation burden (as reported/observed) | Measure separately from existing workflow; workers assess fit, not assumption correctness. |

**Field validation prerequisite:** reporting fields used in pilot scenarios must be derived from field-research validation (Phase 0 / RQ1, RQ2, RQ9, RQ10 as applicable). Until then, use clearly labelled illustrative/synthetic fields and avoid presenting them as real requirements.

### Layer C — Feedback and research

**Goal:** capture structured evidence for iteration and go/no-go decisions.

- **Quantitative (session-level, anonymised):** transcription issues, repeats/retries, edits/corrections, clarification prompts, task completion, time taken (separately measured), failure types.
- **Qualitative:** understandability, difficulty, trust/confusion points, perceived fit with real work, reuse intent (as opinion, not validation), missing features/terms.
- **Feedback channels:** in-product prompts (short), optional written feedback, optional voice feedback (separate consent if recorded/stored for research).
- **Research handling:** anonymise/codify records, store separately from any operational pilot logs as appropriate, follow consent/retention/withdrawal rules.

---

## 6. Controlled pilot stages and sample sizes

Sample sizes below are **operational proposals for staged learning**, not statistically representative research requirements. Progression requires a safety/usability review at each stage.

| Stage | Proposed participants | Purpose | Entry criteria | Exit / progression review |
|---|---|---|---|---|
| **Internal testing** | Project team (and trusted testers as appropriate) | Functional checks, instrumentation, consent/copy review, failure handling, device/browser sanity | Working prototype increment; sandbox fallback available; synthetic test data only | Critical bugs, confusing flows, consent/storage issues, or unsafe copy resolved |
| **Pilot 1** | 1 worker (voluntary) | Discover major usability, comprehension, and trust issues in a real setting with synthetic/non-identifying tasks | Internal tests pass; informed consent process ready; individual access code; support/observation plan; worker not dependent on tool for mandatory reporting | Document issues, correction burden, failures, and stop/adjust criteria; fix high-severity issues before widening |
| **Pilot 2** | 3–5 workers | Compare across different experience levels/workflows and device/context variation | Pilot 1 review complete; updated prototype/instruments; continued Phase 0 alignment on task framing | Assess consistency of issues, feasibility of corrections, and safety/usability; decide whether broader test is responsible |
| **Pilot 3** | 10–15 workers | Observe consistency, recurring failure modes, and support needs at small scale | Pilot 2 review complete; monitoring/support capacity in place; aggregated dashboard/metrics ready | Safety/usability review; decide iterate, pause, narrow scope, or stop — no automatic progression to wider rollout |
| **Wider pilot** | Only after explicit review | Scale learning only if justified | Demonstrated acceptable safety/usability in prior stages and clear evidence-based rationale | Requires documented review against metrics, risks, and Phase 0/roadmap gates |

**Recruitment approach (proposed):** begin with an existing Anganwadi contact in **West Godavari** if willing and voluntary, then recruit workers with varied experience/work patterns as feasible and consented. Recruitment must remain voluntary, with no pressure and no implication of official endorsement.

---

## 7. Accessible pilot architecture (options)

Architecture should support a **real mobile-first Telugu voice application** (not extension of the simulated microphone). Components and vendors below are **options**, to be selected/validated against constraints (privacy, consent, latency, operability, D-12).

```text
Smartphone browser
  -> controlled pilot website (HTTPS, access code)
    -> voice recording (browser MediaRecorder / getUserMedia)
      -> ASR (behind provider adapter for comparison)
        -> transcript review & correction (worker)
          -> extraction & clarification (config/field-validated, grounded where implemented)
            -> confirmation
              -> sample report preview / draft save / sample export
                -> feedback capture
                  -> restricted research dashboard (aggregated/anonymised)
```

| Component | Suggested options | Pilot constraints / notes |
|---|---|---|
| Frontend | Existing **Next.js** web app, mobile-first UI, real mic capture states, editable transcript | Must work on common smartphones/browsers used by participants; graceful fallback to manual text. |
| Backend/API | Existing **FastAPI** service with typed contracts; adapter interfaces for ASR/extraction | No submission endpoints to government systems; enforce synthetic/non-identifying data rules in handling/validation where possible. |
| Storage (hosted pilot) | **PostgreSQL** for hosted pilot data (sessions, drafts, feedback metadata, aggregated events) with strict access controls | Separate/restrict research data; avoid storing sensitive identifiers; define retention and deletion workflows. |
| Hosting | Managed hosting with HTTPS, environment separation, logging controls, backups as appropriate | Minimise exposed surface; protect access codes/secrets; no public research DB. |
| Voice capture | Browser **MediaRecorder** (and related Web APIs) with clear permission/recording indicators | Capture only with consent; explain when audio is sent/processed/stored per chosen ASR mode. |
| ASR | ASR behind an **adapter** to enable side-by-side comparison; local/on-device and/or hosted options evaluated per D-12/AS-12 | No provider chosen from advertised accuracy; document data terms, latency, failure modes, and correction effort. |
| Feedback | Built-in in-app feedback prompts + optional voice/text feedback | Separate consent for research use of recordings; keep prompts short and optional. |
| Research metrics | Anonymised event/metric pipeline to restricted dashboard | Aggregated views only; no individual worker performance rankings. |
| Fallback | Current **sandbox** (scripted transcripts, simulated gateway, synthetic scenarios) | Keep available for demos, regression checks, and when live ASR/capture is unavailable. |

---

## 8. Protecting workers and beneficiaries

### 8.1 Data and participation safeguards

- **Synthetic/non-identifying only (first pilots):** no children's names, Aadhaar/beneficiary identifiers, child photos, or government credentials.
- **No mandatory dependence:** workers must not rely on the prototype for mandatory reporting; provide/maintain safe alternatives (existing process and/or sandbox/manual fallback as appropriate to session design).
- **No experimental submission:** experimental/sample reports are never sent to Poshan Tracker, Bala Sanjeevini, or any government system (D-11, ADR-006).
- **Consent:** informed consent before participation and before recording; **separate consent** for research use of recordings; explain purpose, what is captured, storage location/access, retention, risks/limitations, and withdrawal/deletion path.
- **Controlled access:** individual pilot access codes, HTTPS, restricted researcher access, least-privilege accounts, and no unrestricted public access to research data.
- **Observation ethics:** follow `FIELD_RESEARCH_PLAN.md` safeguards when sessions include observation (no beneficiary data capture, no child photos, no credentials).

### 8.2 Operational safeguards

- Use clearly labelled UI copy: *research prototype / sample report / not official / not submitted*.
- Avoid collecting unnecessary metadata; anonymise/codify participant records.
- Define incident handling for accidental data capture (stop, contain, delete, document) before Pilot 1.
- Conduct safety/usability review before progressing between pilot stages.

---

## 9. Metrics and measurement plan

Metrics must be interpreted with context (device, noise, connectivity, task type) and without overgeneralisation. **Measure the existing workflow and the GramVaani workflow separately; do not claim time savings before comparative, evidence-based measurement exists.**

| Metric | Definition / intent | How measured (examples) | Notes |
|---|---|---|---|
| **STT accuracy (WER/CER)** | Word/character error rates on consented speech samples | Compute when a suitable consented corpus/transcripts exist; report per condition (accent/noise/code-mix) | Not available from scripted sandbox transcripts; D-12 requires real consented speech. |
| **Number accuracy** | Correctness of spoken numbers/dates/quantities critical to reporting | Field-level comparison against reference for consented/synthetic-ground-truth tasks | Track separately because numeric errors have outsized impact. |
| **Correction rate / effort** | Frequency and magnitude of transcript/value edits | Edit counts, characters/fields changed, time spent correcting, re-speak count | Primary signal for whether voice reduces burden (hypothesis). |
| **Task completion rate** | Share of attempted pilot tasks completed to defined endpoint (e.g., confirmed sample report preview) | Session outcomes by task/scenario | Define "complete" per task; distinguish abandonment reasons. |
| **Completion time** | Time for defined task segments and end-to-end flow | Timed observation/instrumentation; split by step where possible | **Collect existing-workflow and GramVaani times separately** (aligned with D-10 four-way thinking where applicable); no causal savings claim from prototype timing alone. |
| **Clarification frequency** | How often and why the system asks for clarification | Count/type of prompts, resolution outcome | High frequency may indicate extraction/config issues or transcript ambiguity. |
| **User satisfaction / perceived effort** | Participant-reported understandability, difficulty, trust/confusion, reuse intent (opinion) | Short structured prompts; optional qualitative feedback | Satisfaction is not proof of accuracy, fit, or impact. |
| **Failure rate** | Technical/workflow failures (mic permission, recording, upload, ASR timeout/error, save/export issues) | Error logs/events (minimised), session notes, retry outcomes | Categorise failures to guide engineering and deployment decisions. |

**Measurement discipline:** record context, sample/task type, and denominator; keep raw and aggregated data handling consistent with consent/retention; report limitations alongside results.

---

## 10. Roadmap (pilot programme phases)

This is the **live-pilot delivery track**. It complements (does not replace) the 6-phase roadmap and must respect Phase 0 gates, D-10, D-11, D-12, and ADR-006.

| Pilot phase | Objective | Key outputs | Dependencies / gates | Fallback |
|---|---|---|---|---|
| **Phase 1 — Real microphone and Telugu ASR (editable transcript)** | Enable a worker to record speech on a phone, receive transcript, edit/correct, retry, and use manual fallback | Mobile mic capture flow; ASR adapter integration; editable transcript UI; logging for correction/latency/failures; comparative ASR evaluation plan execution (D-12) | D-12; consent/audio handling design; device/browser testing; no provider lock-in from benchmarks; Phase 0 insights inform vocabulary/tasks | **Current sandbox** remains available (scripted transcripts) for demos/tests |
| **Phase 2 — Integrate reporting workflow end-to-end** | Connect reviewed transcript to clarification, grounded extraction (where implemented), confirmation, and **sample report** preview/save/export | End-to-end flow on synthetic/non-identifying scenarios; traceability/confirmation UX; clear non-official labeling; task instrumentation | Field validation informs usable fields (do not assume main config matches reality); ADR-002/ADR-006; no government submission/compatibility | Sandbox scripted scenarios and simulated gateway for regression/comparison |
| **Phase 3 — Deploy secure pilot website** | Run controlled, access-coded pilot environment for invited participants | HTTPS deployment, individual access codes, restricted researcher/admin access, PostgreSQL-backed hosted pilot storage (option), monitoring, retention/deletion controls, support runbook | Security/privacy review; consent and incident procedures; separation from unrestricted public access | Ability to pause pilot access and revert to internal/sandbox testing |
| **Phase 4 — Conduct field testing and document findings/priorities** | Run staged pilots (Internal → Pilot 1–3) and produce evidence-based learning | Session records (consented/anonymised), aggregated metrics, issue/prioritisation log, findings updates with evidence labels, go/iterate/pause/stop recommendations | Phase 0 alignment; staged safety/usability reviews; no workload-reduction claims without evidence; workers validate fit, not assumptions | Keep sandbox fallback; stop widening if safety/usability concerns arise |

**Implementation note:** the first technical milestone for this track is: *"A worker opens a website on her phone, taps the microphone, speaks naturally in Telugu, sees the transcript, corrects it, and generates a sample report."* Once reliable in controlled testing, invite workers to test under this programme's safeguards.

---

## 11. Worker Research Dashboard (aggregated/anonymised only)

A restricted-access dashboard for researchers/facilitators to monitor pilot learning and system issues. **No individual worker performance rankings.**

| Dashboard view | Purpose | Examples (aggregated/anonymised) | Explicit exclusions |
|---|---|---|---|
| Participation & sessions | Understand pilot coverage and activity | Participant count by stage (coded), session counts, task/scenario counts, completion counts | Named individuals, leaderboards, productivity rankings |
| Recognition & workflow success | Track technical and task reliability | Recognition/ASR success vs failure rates, retries, task completion rate, clarification frequency | Per-worker "accuracy scores" or comparative rankings |
| Language/term issues | Identify systematic transcription problems | Commonly misrecognised words/terms/phrases (aggregated), code-mix patterns, domain-term confusion | Raw audio accessible broadly; any beneficiary content |
| Number & correction patterns | Prioritise high-impact fixes | Number/date/quantity error categories, average corrections per session/task, correction hotspots by field/step (illustrative/validated context only) | Individual correction rankings |
| Feedback & requests | Capture user-reported needs | Common feedback themes, difficulty points, feature requests, reuse-intent summaries (opinion) | Attributing quotes in identifiable ways without explicit permission/process |
| Reliability & operations | Support pilot stability | Failure-rate trends (capture/upload/ASR/save), latency summaries, device/browser issue categories | Unrestricted access to research database/logs |

**Access control:** dashboard available only to authorised researchers/admins; underlying records protected by least privilege; public pilot access must not expose research data.

---

## 12. Key milestone and decision point

### 12.1 Primary milestone

> **A worker opens a website on her phone, taps the microphone, speaks naturally in Telugu, sees the transcript, corrects it, and generates a sample report.**

This milestone demonstrates an end-to-end **controlled prototype flow** only. It does **not** imply verified fields, field accuracy, official compatibility, integration readiness, workload reduction, or deployment readiness.

### 12.2 Decision gate after milestone reliability

Once the milestone flow is reliable in internal/controlled testing (including fallback behavior and consent/safeguards in place):

- **Invite workers to test** in staged pilots (starting at Pilot 1) using synthetic/non-identifying tasks.
- **Review evidence** at each stage (usability, correction effort, failures, feedback, and measurement quality) before progressing.
- **Decide** to iterate, narrow scope, pause, or stop based on documented findings — not on assumptions or demo performance alone.

---

## 13. Risks and mitigations

| Risk | Why it matters | Mitigations |
|---|---|---|
| **Building on unvalidated workflow/fields** | Prototype may optimise the wrong task (D-10, Phase 0 open; main config unverified) | Treat Phase 0 as gate; validate fields/workflow through field research before claiming fit; label pilot fields/scenarios illustrative until verified; use findings to revise config with citations. |
| **Voice underperformance in real conditions** | ASR errors/noise/accent/code-mix may increase correction burden (D-12) | Keep voice as hypothesis; compare ASR options via adapter on consented speech; measure correction effort and number accuracy; provide editable transcript, retry, and manual fallback; keep sandbox fallback. |
| **Overclaiming readiness/impact** | Misleading stakeholders and unsafe decisions | Enforce evidence taxonomy and "no evidence-before-claiming"; report technical feasibility, speech accuracy, and real-world impact separately (as in sandbox QA discipline). |
| **Privacy/safeguarding breach** | Harm to workers/beneficiaries and loss of trust | Synthetic/non-identifying data only; no child photos/Aadhaar/credentials; consent + separate recording consent; defined retention/withdrawal; incident response for accidental capture; restricted access controls. |
| **Accidental dependence on prototype** | Workers may skip or duplicate mandatory reporting unsafely | Clear briefing and UI labeling; no government submission; facilitators emphasise prototype is experimental and non-official; maintain fallback to existing process. |
| **Scope creep into integration/credentials** | Legal/safeguarding/authorisation violations (D-11, ADR-006) | No submission module, no credential storage, no Poshan Tracker/Bala Sanjeevini integration claims; architectural reviews reject such features. |
| **Uncontrolled access to pilot/research data** | Exposure of recordings/feedback/session data | Individual access codes, HTTPS, least-privilege researcher access, no open research DB, audit/logging hygiene, secure hosting configuration. |
| **Misinterpretation of participant feedback** | Feedback used to "validate assumptions" rather than assess fit | Facilitation script and analysis protocol: workers validate fit with their work; record assumptions separately; triangulate with observation/metrics. |
| **Device/connectivity variability** | Poor experience or misleading failure attribution | Test on representative devices/browsers; capture context; design for retries/manual fallback; monitor failure categories in dashboard. |
| **Premature scaling** | Wider rollout before safety/usability are acceptable | Staged pilot sizes with explicit safety/usability reviews and stop/pause criteria before any wider pilot. |

---

## 14. Immediate next actions (planning checklist)

- [ ] Confirm Phase 0 instrument/readiness dependencies for any pilot tasks involving observed workflows (use `FIELD_RESEARCH_PLAN.md` and session run sheet).
- [ ] Define synthetic/non-identifying pilot scenarios and ensure no real beneficiary data pathways.
- [ ] Draft consent materials for participation and **separate** recording/research-use consent (Telugu and any required languages), including storage, retention, and withdrawal.
- [ ] Specify pilot access model (individual codes, HTTPS, researcher roles) and data retention/deletion procedure.
- [ ] Implement/verify real microphone capture + editable transcript flow with manual fallback (Pilot Phase 1) while keeping sandbox fallback operational.
- [ ] Define metric instrumentation and aggregated dashboard views (no individual rankings) aligned with Section 9 and 11.
- [ ] Establish stage-gate review template (safety, usability, evidence status, D-10/D-11/D-12 compliance) before Pilot 1.