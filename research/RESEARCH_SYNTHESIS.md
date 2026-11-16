# Research Synthesis — GramVaani Phase 0 (desk research)

_Lead research agent consolidation | 7 domain agents + 2 independent reviewers | 2026-11-16._
**This is desk research, not field evidence.** It contains no participant observations and changes no
verified findings in [RESEARCH_FINDINGS.md](RESEARCH_FINDINGS.md). No application code, configuration or
production system was modified.

---

## 1. Executive summary

The study produced a usable evidence base, and it **challenged the project's founding assumption**.

- **The strongest finding is a correction.** Published time-use evidence does **not** support "workers spend
  considerable time in government apps". Two independent measurements put app time at roughly **13 min/day
  (Madhya Pradesh)** and **24 min/day (Andhra Pradesh)**, while documentation/register work is **51–82
  min/day**. The problem is *paperwork and duplicate recording*, not app entry time alone. Our origin claim
  stays `[UNVERIFIED]` and is now reformulated as a testable question about total documentation burden.
- **There is no documented integration to build against.** Poshan Tracker and Bala Sanjeevini are listed by
  AP WDCW as **separate systems**; no public API, SSO, shared database or synchronisation specification was
  found for either. PMMVY has a documented one-way "Due List" transfer and face-verification reuse — it is a
  maternity benefit scheme, **not** routine Anganwadi activity reporting.
- **The preschool-photo premise is unconfirmed.** No official requirement to photograph or upload preschool
  activities was found in English or Telugu. The documented photo mandate is **commodity distribution with
  face recognition**, explicitly without a child photo. Step 5 of our field plan remains observation, not an
  assumed requirement.
- **Voice input is technically plausible but field-unproven.** IndicWhisper has the best independently
  published Telugu benchmark numbers, but benchmark ranking does not transfer to field audio; no Telugu
  Anganwadi speech corpus or code-mixed field ASR evaluation exists. The design consequence is not "pick a
  vendor" — it is **edit-first, confirmation-first, with a measured bake-off using our own synthetic corpus**.
- **The clearest product anti-pattern is irrevocable entry.** Field reporting about Poshan Tracker describes
  no way to correct a wrong entry and no verification of faulty data, alongside duplicate paper registers.
  That is direct evidence for our transcript-first and confirm-before-preview stages — and none of it
  depends on the unverified "time in apps" claim.
- **Privacy posture is sound but legal specifics need expert review.** Our rules (synthetic data, no
  beneficiary fields, no credentials, no child photos, no submissions) are well aligned with data
  minimisation and child-protection principles. The exact DPDP commencement dates could not be verified
  from the Gazette and were downgraded to `[UNVERIFIED]`.

## 2. Findings by research objective

### 2.1 Government applications and workflows

- `[PUBLISHED EVIDENCE][NATIONAL]` Poshan Tracker is an MWCD platform, rolled out around March 2021 under
  Saksham Anganwadi / POSHAN 2.0. The official FAQ documents roles (AWW, helper, supervisor, CDPO, district),
  growth monitoring, attendance/daily tracking, home visits, THR distribution, 24 languages and a 5-day
  offline buffer. Two MWCD-family sources give conflicting rollout dates; see RESEARCH_GAPS C2.
- `[UNKNOWN][NATIONAL]` **No public API or developer portal found.** The About page's "seamless data sharing"
  is programme language, not a specification. PMMVY's "Open API" statement has no published schema.
- `[PUBLISHED EVIDENCE][NATIONAL]` PMMVY is a separate maternity DBT scheme. Its documented links to Poshan
  Tracker are a **Due List transferred at Anganwadi level** and reuse of face-verification data since
  21 May 2025. It is not a routine activity-reporting surface for AWWs.
- `[VERIFIED][STATE-AP]` Bala Sanjeevini is both a supplementary-nutrition scheme and an AP WD&CW app
  (two packages: 2.0 and a legacy app). AP WDCW lists Poshan Tracker, Bala Sanjeevini, eSadhana, Milk Supply
  Tracking, THR-FRS and Supervision as **distinct systems with distinct URLs**.
- `[UNKNOWN][STATE-AP]` **No official documentation of integration/synchronisation** between the two apps:
  no government order, tender, press release, audit, API/SSO spec or shared-database description was found.
  A user review mentioning "migration" is a participant claim only.
- `[PUBLISHED EVIDENCE][STATE-AP]` The documented photo workflow is **commodity distribution with OTP and
  face recognition**, reported by two independent outlets (The Hindu, 5 Aug 2025; ETV Bharat, 17 Jul 2025).
  It is beneficiary identification, **not** preschool evidence. No official preschool-photo rule found.

### 2.2 Policies and reporting requirements

- `[VERIFIED][NATIONAL]` Mission Saksham Anganwadi and POSHAN 2.0 subsumed ICDS/Anganwadi Services, Poshan
  Abhiyaan and SAG into four verticals; Centrally Sponsored, state-implemented, approved for 2021-22 to
  2025-26. AWW duties include feeding Poshan Tracker "on a regular basis", monthly weighing, growth-card
  recording, referral cards, child cards and submitting specified reports.
- `[PUBLISHED EVIDENCE][NATIONAL]` The 2017 ICDS District Manual lists many registers and a paper reporting
  chain (AWW → Supervisor on the 2nd, → CDPO on the 5th, → DPO on the 10th, → MWCD on the 16th). It is
  **outdated** and must not be presented as the current workflow.
- `[PUBLISHED EVIDENCE][NATIONAL]` The World Bank (2024) describes ICDS-CAS being replaced by Poshan Tracker
  and notes that dual paper+digital recording was not eliminated. **Migration mechanics and data exchange
  remain UNKNOWN.**
- `[VERIFIED][STATE-AP]` AP documents ~55.6k AWCs, THR on 1st/3rd Friday, two Nutrition & Health Days a
  month, a special register for referred children, and its own MIS portals. AP AWC counts conflict between
  two official portals.
- `[UNKNOWN][NATIONAL/STATE-AP]` No official AWW diary definition, current AP register list, AP MPR template
  or AP submission deadlines were found. These were deliberately **not** filled in from national norms.

### 2.3 Workload and field evidence

- `[VERIFIED][STATE-MP]` n=554: ~359 min workday; paper registers 51.1 min/day (14%), 83% above the
  government's 30-min expectation; app updating 13.2 min/day, median 0 (Jain A et al., BMC HSR 2020).
- `[PUBLISHED EVIDENCE][STATE-AP]` n=21, 8-day observation, 15 districts: paperwork/data entry 17.02%
  ≈ **81.69 min/day**; YSR Sampoorna Poshana app 3.04% (~14.6 min), other app 1.99% (~9.6 min)
  (CRISP, Jan 2025). Off-site work was not captured.
- `[VERIFIED]` Dual reporting is real: paper kept "as a failsafe" even when apps exist; a 2025 study quotes
  workers maintaining both app entries and WhatsApp reporting.
- `[PUBLISHED EVIDENCE]` Digitisation studies mostly measure service coverage, not effort: ICDS-CAS raised
  home visits and counselling by ~8pp; higher Poshan Tracker coverage may partly reflect improved reporting.
- `[UNVERIFIED]` An official 2026 parliamentary answer claims Poshan Tracker "substantially reduced"
  workload — no time series was found to support it.
- **No peer-reviewed trial of voice-based reporting by Anganwadi workers exists.** Closest: ASHA IVR
  (81% completion among those who initiated) and a preprint voice-form system with rural users.

### 2.4 Technical options

- `[VERIFIED]` IndicWhisper leads published Telugu WER across Vistaar benchmarks (avg 28.8, beating Google
  STT on 57/59 and IndicWav2Vec on 45/59 in that evaluation). **But** benchmark correlation between test
  sets is poor (Spearman −0.26), so a single "best Telugu ASR" claim is fragile.
- `[PUBLISHED EVIDENCE]` Domain shift is severe: IndicWav2Vec went from 11.60% WER on clean read Hindi to
  41.72% on telephonic field-style audio; a no-egress on-device adaptation regime was evaluated.
- `[UNKNOWN]` No published system is documented as handling **spontaneous Telugu–English code-mixed field
  speech** well, and no study covers Telugu Anganwadi accents or handheld field acoustics. Available
  code-mix work is mostly text NLP, language identification or speech translation.
- `[VERIFIED]` Structured-output research shows **schema validity ≠ correctness**: 100% schema-valid output
  can coexist with ~80% semantic success. Grounding checks, plausibility filters, abstention and selective
  human review are needed — directly supporting our span-grounding and confirm-before-preview design.
- `[VERIFIED]` Web Speech cannot be assumed offline or Telugu-capable; Chrome performs server-based
  recognition and `te-IN` support is `[UNKNOWN]`.
- Off-device options (whisper.cpp, ONNX) exist; Telugu-specific on-device fidelity is `[UNKNOWN]`.

### 2.5 Comparable solutions

- `[PUBLISHED EVIDENCE]` FormBharo (preprint, numbers re-verified) is the closest analogue: phone-call form
  filling with LLM extraction plus a **deterministic validation/draft layer**. On real speech, completion
  fell ~7–14 points (up to ~41 for one model); rule-based normalisation raised one model from 95.96%
  turn-level extraction to 100% form completion. Lesson: **evaluate the full loop, not components**.
- `[PUBLISHED EVIDENCE]` Poshan Tracker field reporting describes no edit for wrong entries, English-heavy
  UI, duplicate paper, and 20–25 min uploads — an anti-pattern catalogue for our own design.
- `[PUBLISHED EVIDENCE]` CommCare's low-literacy guidance (one question at a time, numeric/single-select
  bias) and ODK/Kobo's form contracts are worth borrowing; neither solves narration or clarification.
- `[UNKNOWN]` No comparable product was found that combines Telugu voice, editable transcript, ground-traced
  extraction and a non-official draft preview for AWWs.

## 3. What this changes for GramVaani

| Existing item | Desk-research effect | Action |
|---|---|---|
| Rule 1 (assumptions ≠ requirements) | Strengthened — origin claim is contradicted by published numbers | Keep O-1 `[hypothesis]`; do not promote |
| AS-01 ("time in apps") | Contradicted/partially answered | Rewrite as *documentation burden* in Phase 1 requirements |
| AS-14/H6 (photo burden) | Weakened — no official preschool-photo rule | Keep as observation priority #1 |
| AS-16 / D-9 (one field set?) | Separate systems confirmed, field compatibility unknown | Keep open; observe |
| ADR-002 (transcript-first) | Supported by no-edit failure reports and extraction research | No change |
| ADR-006 (no submission module) | Reinforced — no API/permission exists to build against | No change |
| ADR-004 (provider adapters) | Supported — no vendor is field-validated for Telugu | No change; bake-off stays a Phase 2 gate |
| Field plan step 5 (photos) | Scope clarified: observe, never collect | Keep the safeguarding rule |
| Roadmap Phase 0 | Still the correct next phase; now sharper | Prioritise the ranked observation list in RESEARCH_GAPS §5 |

## 4. Decisions this research does **not** justify

1. Choosing an ASR vendor — no Telugu field benchmark exists.
2. Any specific reporting field list — no current AP template was found.
3. Any integration, API client, credential flow or auto-submission — none exists or is authorised.
4. Any claim of official compatibility, accuracy or approval.
5. Treating desk research as a substitute for the supervisor interview in step 7 of our session sequence.
6. Any legal conclusion from the privacy note — it is not legal advice and Gazette sources were unreachable.

## 5. Recommended next action

**Keep Phase 0 open. Run session 01 with the sharpened protocol.**

Concretely, change the first visit in two ways before you go:

1. Add a **stopwatch column split four ways** — paper registers, app entry, recall/looking things up,
   re-checking — so we can test the corrected problem statement (documentation burden, not app time).
2. Ask the worker to **show the preschool-photo step if it exists**, while keeping the existing rule:
   observe the workflow only, never photograph children, never view stored child photos.

Then print [`session-run-sheet.md`](instruments/session-run-sheet.md) and the Telugu consent script, write
`research/notes/YYYY-MM-DD-session-01.md` within 24 hours, and only then update
[RESEARCH_FINDINGS.md](RESEARCH_FINDINGS.md) and `config/report-fields.json`.

The desk research is now good enough to make the visit more discriminating. It is not good enough to build a
screen.

---

**Coverage:** 7 independent domain agents, 2 independent reviewers, 138 deduplicated sources
(20 spot-check fetches: 17 confirmed, 3 blocked). See [SOURCES_AND_REFERENCES.md](SOURCES_AND_REFERENCES.md),
[RESOURCE_INVENTORY.md](RESOURCE_INVENTORY.md) and [RESEARCH_GAPS.md](RESEARCH_GAPS.md).
