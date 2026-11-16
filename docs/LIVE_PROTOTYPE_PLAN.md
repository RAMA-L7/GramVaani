# Live Prototype Plan — Mobile-First Telugu Voice Web (Field-Testing Milestone)

**Date:** 2026-11-16  
**Status:** Plan only — not implemented, not deployed, not validated  
**Audience:** Small engineering + research team preparing the first real field-testing milestone  
**Scope:** A separate, real voice-capture web prototype track for consented pilot sessions. This is an evolution track **distinct** from the simulated sandbox and from main research prototypes.

> **Hard boundary:** This document proposes work to build and evaluate. It does **not** claim that any component described here is built, working, accurate, adopted, or field-validated.

---

## 1. Purpose and relationship to existing artifacts

### 1.1 Why a separate live prototype track

The current `sandbox/` module is a **simulated environment** (scripted Telugu transcripts, synthetic data, no real audio, no live ASR, no government integration) used to evaluate workflow plumbing and demo claim discipline (`sandbox/README.md`, `sandbox/API_CONTRACT.md`, `sandbox/docs/ARCHITECTURE.md`). Its value is as a controlled fallback/demo artifact with deterministic behavior.

A live prototype for field testing has different needs: real microphone capture, real transcript generation via swappable ASR providers, consent-gated handling of participant audio, and research instrumentation. Mixing these into `sandbox/` would break its simulated nature and blur evidence boundaries.

### 1.2 Separation rules (non-negotiable)

- **Keep `sandbox/` unchanged in nature:** no live ASR, no real audio ingestion, no beneficiary/participant data, no external provider calls added to sandbox flows. Sandbox remains the fallback/demo artifact.
- **Do not mutate main research config:** `config/report-fields.json` remains unchanged and **unverified/hypothesis-only** (`status: hypothesis-only`, all fields `unverified`). The live prototype must **not** present it as official or field-confirmed.
- **Separate module/track:** create a clearly separated top-level track (proposed: `pilot/`) with its own frontend, backend, config, storage, contracts, and documentation. No shared runtime state or DB with `sandbox/`.
- **Pilot field config is pilot-owned:** `pilot/config/pilot-fields.json` (or equivalent) may evolve with field evidence but must be explicitly marked as pilot/research config (e.g. `ILLUSTRATIVE_NOT_OFFICIAL` / `PILOT_UNVERIFIED`), versioned, and traceable to research notes — never labeled as official reporting requirements.

### 1.3 Decisions and constraints this plan must honor

| Source | Constraint | Implication for live prototype |
|---|---|---|
| D-10 / AS-17 (`docs/DECISIONS_AND_ASSUMPTIONS.md`) | Reframe around total documentation burden, not app-entry replacement | Prototype measures/captures workflow burden signals; no claim of replacing app entry or reducing workload without evidence |
| D-11 / ADR-006 | No government integration without authorized, documented interface | No submission, no credentials, no connectors, no compatibility claims; outputs are sample/draft only |
| D-12 / ADR-002 / `sandbox/docs/TECHNICAL_EVALUATION_PLAN.md` | Voice is a hypothesis; ASR not selected from marketing/benchmarks | Use `ASRProvider` adapters and evaluate on a consented corpus; editable transcript is source of truth; no accuracy claims in-product |
| ADR-008 / project rules | Synthetic/non-identifying data only in early pilots | No beneficiary data, no child photos, no Aadhaar, no credentials; participant identifiers pseudonymized |
| `config/report-fields.json` | Main config unverified | Pilot config separate, clearly marked, evidence-linked |

---

## 2. Proposed repository/module structure (separate track)

Proposed layout (illustrative; final paths decided at implementation start, but must remain clearly separated):

```text
pilot/                         # live field-testing prototype track (separate from sandbox/)
  README.md                    # scope, safety banner, what is/is not claimed
  API_CONTRACT.md              # pilot-specific HTTP/contracts (versioned separately)
  config/
    pilot-fields.json          # pilot field definitions; explicitly PILOT_UNVERIFIED
    pilot-fields.schema.json
  frontend/                    # Next.js + TypeScript, mobile-first web UI
  backend/                     # FastAPI service, ASR adapters, extraction/validation, persistence
  docs/
    CONSENT_AND_DATA_HANDLING.md
    PILOT_RUNBOOK.md
  scripts/
  tests/
```

**Boundary notes:**
- `pilot/` may reuse *patterns* from `sandbox/` (transcript-first flow, span grounding concepts, validation layering, adapter seams per ADR-004) but must not import sandbox runtime modules or mutate sandbox scenarios/config.
- `sandbox/` remains runnable as-is for demos/fallback.
- Any shared utilities, if introduced later, must be extracted deliberately without changing sandbox behavior (out of scope for this plan).

---

## 3. First milestone (field-testing acceptance target)

**Milestone statement (target user experience):**  
“A worker opens a website on her phone, taps the microphone, speaks naturally in Telugu, sees the transcript, corrects it, and generates a sample report.”

This is an **acceptance target for a pilot build**, not a claim of achieved reliability. “Reliably” for this milestone means the following **minimum, testable behaviors under defined pilot conditions** (device/network/consent prerequisites documented in runbook), not universal or field-proven performance.

### 3.1 Minimum acceptance criteria

| Area | Minimum criterion | Notes |
|---|---|---|
| Access & device | Worker can open the pilot URL on a supported mobile browser over HTTPS and reach the voice flow | Pilot access may be gated (e.g. access code); supported browser/device matrix defined in runbook |
| Microphone permission | App requests mic permission with clear purpose; handles granted/denied/previously blocked states with actionable guidance | No recording starts without explicit user action and consent gate satisfied |
| Record / stop | User can start and stop recording with visible state (recording indicator, elapsed time/limit) | Reasonable max duration/size enforced client-side with clear messaging |
| Upload / stream | Recorded audio is transferred to backend for transcription via a defined mechanism (chunked upload or streaming, per implementation choice) with progress/failure feedback | Poor-network behavior handled (retry/resume where feasible, or clear fail + fallback) |
| Transcript returned | System returns a transcript for the submitted audio using the configured `ASRProvider` (or a clear failure state if not) | Response must indicate provider/mode metadata for research logging (not shown as accuracy claim) |
| Editable transcript | Transcript is shown in an editable field and treated as the **source of truth** (ADR-002) | Worker can correct text before extraction/generation |
| Retry / manual fallback | User can re-record, retry transcription, or switch to manual text entry if mic/ASR fails | Flow must not dead-end on ASR failure |
| Sample report preview/export | From confirmed/edited content, user can generate a **sample/draft** report preview and export/copy/print/share as allowed by pilot design | Must carry a clear footer: sample/draft, not official, not submitted, no government integration (D-11) |
| Error states | User-visible, recoverable error states for: permission denied, no mic, upload failure, timeout, ASR failure, validation gaps, session expiry | Errors logged without PII; no silent failure |

### 3.2 Evidence and non-claims at milestone

- Passing these criteria in a controlled pilot session demonstrates **basic functional viability of the flow**, not ASR accuracy, workload reduction, adoption, or compatibility with any government workflow.
- Session outcomes, correction effort, and failure modes must be captured for evaluation (Section 7, Layer C) and interpreted alongside `sandbox/docs/TECHNICAL_EVALUATION_PLAN.md`.

---

## 4. Proposed architecture

### 4.1 Components

| Component | Proposed technology | Rationale / notes |
|---|---|---|
| Frontend (mobile web) | Next.js (App Router) + TypeScript | Aligns with existing stack patterns (`docs/TECHNICAL_ARCHITECTURE.md`, sandbox frontend); good mobile web iteration, SSR/edge options if needed later; PWA/offline considerations can be added incrementally |
| Backend API | FastAPI (Python) | Aligns with `docs/TECHNICAL_ARCHITECTURE.md` (Python ASR ecosystem, Pydantic contracts); hosts ASR adapters, extraction/validation, consent-aware session handling |
| Local dev DB | SQLite | Zero-ops for development/testing, consistent with ADR-005/local-first patterns; isolated per environment |
| Hosted pilot DB | PostgreSQL | Better concurrency, backups, migrations, and operational controls for a small hosted pilot; required before multi-user/shared pilot deployment |
| Audio/object storage | **Private, consent-gated object storage** (e.g. S3-compatible bucket or equivalent) for retained research audio **only when explicitly consented and policy allows**; otherwise **ephemeral processing** (temp file deleted immediately after transcription/evaluation step) | Default posture: do not persist audio; persistence is opt-in per consent, encrypted at rest, access-controlled, retention-limited, never committed to git |
| Transport/security | HTTPS everywhere for pilot | Required for mic access in modern browsers (secure context) and for protecting audio/transcripts in transit |
| Pilot access | Access codes / lightweight auth for pilot site | Prevents open public abuse; not a beneficiary identity system; no credentials for government systems |

**Alternatives/notes:** A single-runtime Next.js app could be considered later, but splitting keeps ASR/provider work in Python (per `TECHNICAL_ARCHITECTURE.md` tradeoff). Any deviation must preserve adapter seams and consent/data-handling guarantees.

### 4.2 Data flow (text/Mermaid)

```mermaid
flowchart TB
  subgraph Client["Mobile Browser (Next.js, HTTPS, pilot access)"]
    U["Worker"] --> CG["Consent gate + purpose disclosure"]
    CG -->|consent granted| MIC["Mic permission + MediaRecorder"]
    MIC --> REC["Record / stop / re-record"]
    REC --> UP["Upload audio (chunked/stream) or manual text fallback"]
    UP --> TR["Editable transcript view (source of truth)"]
    TR --> EXT["Extraction + clarification + corrections"]
    EXT --> CONF["Explicit confirmation"]
    CONF --> PREV["Sample report preview / draft save / export"]
    PREV --> FB["Optional feedback (text/voice) + session metrics"]
  end

  subgraph API["Pilot Backend (FastAPI, HTTPS)"]
    AUTH["Access control / rate limit / session"]
    ASR["ASRProvider adapter\n(hosted/on-device-explore later, per eval)"]
    NORM["Normalize + span grounding"]
    EX["Field extraction (pilot config-driven)"]
    VAL["Validation + gaps/ambiguities"]
    REP["Draft/sample report assembly + footer"]
    EVT["Anonymised event/metrics logger (no PII)"]
  end

  subgraph Data["Storage (separated from sandbox)"]
    DB[(Pilot DB: SQLite dev / PostgreSQL hosted)]
    OBJ[(Private audio storage: consent-gated, encrypted):::optional]
    TMP["Ephemeral temp audio (default, auto-delete)"]
  end

  UP -->|audio + session metadata (no PII)| AUTH
  AUTH --> ASR
  ASR -->|temp read| TMP
  ASR -.->|only if consent+policy| OBJ
  ASR --> TR
  TR --> NORM --> EX --> VAL --> CONF
  CONF --> REP --> DB
  FB --> DB
  EVT --> DB

  classDef optional stroke-dasharray: 5 5;
```

**Flow constraints:**
- Audio is **not** recorded or uploaded without passing the consent gate and an explicit user recording action.
- Transcription requests go only to the configured, reviewed provider path; provider selection/config is an operational/research decision, not hard-coded vendor lock-in.
- No outbound path to any government system exists (D-11/ADR-006). Report output is local/pilot-only sample draft.

### 4.3 Environment split

| Environment | Purpose | Data/storage posture |
|---|---|---|
| Local dev | Developer testing with synthetic audio/text | SQLite, ephemeral audio, no real participant data |
| Hosted pilot (controlled) | Consented field-testing sessions | PostgreSQL, HTTPS, access codes, consent-gated audio handling, strict retention/deletion, anonymised metrics |

---

## 5. Layer A — Voice capture and transcription

### 5.1 Browser capture (MediaRecorder)

- Use browser **MediaRecorder API** (secure context/HTTPS required) with capability detection and graceful fallback messaging for unsupported browsers/devices.
- **Permission UX:** explain why mic is needed, request on explicit tap, show recording indicator, and provide clear recovery steps when denied/blocked.
- **Format/size constraints (to be finalized in implementation spike, documented in runbook):**
  - Prefer widely supported compressed formats (e.g. `audio/webm;codecs=opus` or `audio/mp4` where available) based on device/provider compatibility; record negotiated MIME type in metadata.
  - Enforce **maximum duration** and **maximum file/chunk size** to control upload time, cost, and failure rates on poor networks.
  - Capture minimal technical metadata needed for debugging/evaluation (duration, sample rate if available, MIME type, size) — no device identifiers beyond what is necessary and policy-approved.
- **Chunking/upload:**
  - Support chunked upload (e.g. time-sliced blobs) or single-upload-after-stop depending on reliability tradeoffs; include retry with idempotency keys per upload session.
  - For poor networks: resumable/retryable uploads where feasible; always offer "save transcript/text draft locally in-session" and manual fallback if upload cannot complete.

### 5.2 ASR adapter interface (D-12, ADR-004)

Define a provider-agnostic interface in `pilot/backend` (conceptually aligned with `docs/TECHNICAL_ARCHITECTURE.md` and sandbox seams, but implemented separately):

- **Example contract shape (illustrative):** `ASRProvider.transcribe(audio_ref|stream, lang_hint, context) -> TranscriptResult`
- **`TranscriptResult` should include:** text/segments (if available), timestamps/confidence where provided, provider id/model/version, latency, language hints used, and error/retryable flags. Do **not** present confidence as ground-truth correctness.
- **Adapter goals:**
  - Support comparison of multiple providers on the **same consented corpus** per `sandbox/docs/TECHNICAL_EVALUATION_PLAN.md` (no selection from marketing/benchmarks alone).
  - Allow hosted providers (subject to consent/data terms review and audio-egress decision) and keep room to explore **on-device/offline** options later behind the same interface.
  - Isolate vendor SDKs/HTTP specifics inside provider implementations; no vendor types leaking into pipeline/core.
- **Language:** pass `te-IN` / Telugu hints where supported; expect Telugu–English code-mixing (ADR-007). Keep English tokens/numbers handling explicit in normalization.
- **Number and correction handling:** normalization layer must support spoken numerals and corrections (e.g. "ఇరవై నాలుగు… లేదు, ఇరవై ఆరు") as test cases in evaluation; do not auto-trust ambiguous numeric parses.

### 5.3 Transcript as source of truth and UX safeguards

- **Editable transcript is authoritative** for downstream extraction/confirmation (ADR-002). Every extracted value intended for the sample report must be traceable to transcript spans or explicit worker corrections/answers.
- **Retry and fallback:** one-tap re-record, re-transcribe, and manual typing/editing at all times; ASR failure must route to manual continuation, not blockage.
- **Low quality / uncertainty UX (without overclaiming):** may show provider confidence or "low confidence/unclear audio" hints **only as prompts to review**, never as "accurate/verified". Encourage listening context not required; focus UI on "please review and correct" and highlighting fields needing confirmation.

---

## 6. Layer B — Minimal reporting workflow

### 6.1 Pilot field configuration (separate, evidence-evolving)

- Use `pilot/config/pilot-fields.json` (separate from `config/report-fields.json`) with schema validation.
- Config must be clearly marked **pilot/unverified** and must not claim to represent Poshan Tracker, Bala Sanjeevini, or any official requirement (D-11).
- Each field definition should carry provenance/status metadata (e.g. hypothesis, observed in session, retired) and linkable notes once field research produces evidence. Unknown/contested fields remain optional or excluded rather than guessed as verified.

### 6.2 Extraction, clarification, and confirmation

- **Extraction:** derive candidate structured values from the edited transcript into pilot field schema; prefer span-grounded/traceable outputs and drop or flag unverifiable values (consistent with `docs/TECHNICAL_ARCHITECTURE.md` guardrails).
- **Clarification:** generate a small, prioritized set of questions for missing/ambiguous/contradictory required-pilot fields (config-driven question text where possible; Telugu/English as appropriate for pilot).
- **Corrections:** worker can edit field values and/or transcript; edits invalidate dependent extracted values until reconfirmed.
- **Worker confirmation:** explicit confirmation step before generating/saving the sample draft (no silent acceptance).
- **Traceability:** store/link which transcript version and which spans/corrections produced each confirmed value for research review (within consent/retention policy).

### 6.3 Sample report output (draft only)

- **Preview:** mobile-friendly sample report preview showing confirmed fields, gaps, and timestamp/session metadata (anonymised).
- **Save/export:** draft save within pilot system (if enabled) and export/print/copy options suitable for pilot review; all outputs include a persistent footer such as: *"Sample draft prepared with a research prototype. Not an official record. Not submitted. No government integration."*
- **No submission:** no API, button, or background job for submitting to any external/government system (ADR-006, D-11).

---

## 7. Layer C — Feedback and research capture

- **In-app feedback:** short post-task form (e.g. clarity, effort, what failed, what to change) in worker-preferred language where feasible; optional.
- **Optional voice/text feedback:** same consent/retention rules as primary audio; clearly separated from report audio.
- **Session metrics/events (anonymised, no PII):** timestamps for record start/stop, upload duration/outcome, ASR latency/outcome/provider id, edit counts/correction effort proxies, clarification count, retry/fallback usage, completion/abandonment, error codes. Used to evaluate flow and ASR in context, not to make performance claims without analysis.
- **Link to pilot protocol:** UI/runbook must reference the applicable pilot protocol, consent script/version, and data-handling notice (and `sandbox/docs/TECHNICAL_EVALUATION_PLAN.md` for ASR evaluation alignment where relevant).

---

## 8. Non-functional and safety requirements

### 8.1 Consent, privacy, and data handling

- **Consent gates:** explicit, informed consent before any audio recording/upload; separate consent for optional audio retention for research evaluation if applicable. Consent version and timestamp recorded (without storing unnecessary personal data).
- **No audio by default:** no background recording; no upload without action + consent. Provide "text-only/manual" path.
- **Retention/deletion:** define retention periods per data class (ephemeral audio, retained research audio, transcripts, drafts, metrics). Support deletion requests/workflow for participant-associated data where identifiable in pilot records; document operational deletion procedure in runbook.
- **Never committed:** audio files, transcripts containing participant content, exports with pilot data, and secrets must be gitignored and excluded from commits/artifacts.
- **Synthetic/non-identifying early pilot posture:** use pseudonymous worker/session codes; no beneficiary data, no child photos, no Aadhaar, no credentials. Pilot config and UI must not solicit these.

### 8.2 Security and operations (pilot-appropriate)

- **Access control:** HTTPS, pilot access codes/lightweight authentication, session expiry; least-privilege access to DB/object storage.
- **Logging without PII:** structured logs and metrics must redact/avoid transcript text, raw audio paths exposed broadly, names, phone numbers, and any sensitive identifiers. Use opaque session IDs.
- **Rate limits/basic abuse protection:** per-IP/session throttling, upload size/time limits, auth attempt limits, basic bot protection/CDN controls as appropriate for a small pilot site.
- **Secrets/config:** provider keys and storage credentials via environment/secret store, never in repo; rotate/revoke for pilot.

### 8.3 Offline/poor-network considerations

- Mobile networks may be intermittent: show clear connectivity/upload state, allow retries, preserve in-progress editable text where feasible (client-side resilience), and provide manual text fallback.
- Full offline ASR is **not assumed** in Phase 1; on-device/offline exploration is a later adapter/evaluation track (Section 9) and must be validated before any claim.

---

## 9. Phased implementation steps (roadmap-aligned)

Sandbox remains the **fallback/demo artifact** throughout. Each phase requires explicit entry/exit review; phases may iterate based on field research and safety review.

### Phase 1 — Voice capture spike (real mic → transcript, minimal UI)

**Objective:** prove basic mobile-web capture and transcription path end-to-end in a controlled setting, with consent and fallback behaviors.

- **Entry criteria:** plan reviewed; pilot track (`pilot/`) scaffolded separately; consent/data-handling draft for pilot sessions; no sandbox/main-config changes required.
- **Key work:** mobile-first record/stop UI, MediaRecorder integration, upload mechanism, FastAPI endpoint, initial `ASRProvider` adapter(s) behind interface, editable transcript view, retry/manual fallback, error states, HTTPS dev/proxy story for device testing.
- **Exit criteria:** first milestone core flow demonstrable in controlled tests (mic → transcript → edit) with consent gate and fallbacks; basic anonymised event logging; no audio persistence by default; known device/browser limitations documented.
- **Dependencies:** consent wording for any human test; provider access/terms review if hosted ASR used; device test matrix.

### Phase 2 — Extraction + sample report flow (minimal Layer B)

**Objective:** turn corrected transcripts into a **sample/draft** report using pilot field config, with traceability and confirmation.

- **Entry criteria:** Phase 1 exit; initial `pilot-fields.json` drafted from research hypotheses (clearly unverified); normalization/span-grounding approach defined.
- **Key work:** extraction pipeline, clarification questions, correction/confirmation UI, sample report preview/export with mandatory footer, pilot DB schema for drafts/sessions (SQLite dev), validation and gap handling.
- **Exit criteria:** user can generate and export a sample report from an edited transcript in controlled scenarios; traceability from report fields to transcript/corrections recorded; no official/compatibility claims in UI.
- **Dependencies:** ongoing field research to refine pilot fields (D-10, Qs in decisions register); agreement on pilot report footer/copy.

### Phase 3 — Feedback, instrumentation, and pilot hardening

**Objective:** make the prototype usable for consented pilot sessions and research learning.

- **Entry criteria:** Phase 2 exit; pilot protocol outline; hosted environment plan (PostgreSQL, object storage policy decision, access control).
- **Key work:** in-app feedback, anonymised metrics dashboard/export (internal), retention/deletion workflows, rate limiting/abuse protection, PostgreSQL migration for hosted pilot, private object storage integration **only if** consent/policy requires retained audio, runbook and support procedures.
- **Exit criteria:** deployable pilot build with documented runbook, consent/version tracking, operational deletion/retention controls, and monitoring/logging without PII; ready for small consented pilot sessions.
- **Dependencies:** field research access/approvals as applicable; consent and data governance sign-off; hosting/security review.

### Phase 4 — Evaluation-driven iteration and ASR comparison

**Objective:** improve the prototype based on pilot evidence and execute ASR evaluation per plan.

- **Entry criteria:** Phase 3 exit; consented pilot sessions and/or consented audio corpus collection process approved; evaluation protocol frozen.
- **Key work:** run/coordinate ASR bake-off on same corpus (`sandbox/docs/TECHNICAL_EVALUATION_PLAN.md`), analyze correction effort and failure modes, iterate UX/config/adapters, explore on-device/offline adapter feasibility if warranted, update pilot fields based on evidence with provenance.
- **Exit criteria:** documented evaluation results (corpus/conditions stated), prioritized backlog from evidence, decision record on provider/approach **for pilot context only** (no generalized claims); sandbox still available as fallback demo.
- **Dependencies:** sufficient consented data, native Telugu review capacity, time for controlled scoring; D-12 gate respected (no provider selection without evaluation).

---

## 10. Open technical decisions and risks

| # | Topic | Open decision / question | Risk if mishandled | Mitigation / next step |
|---|---|---|---|---|
| T-1 | ASR provider(s) & data egress | Which hosted/on-device approaches to include in bake-off; is audio egress acceptable under consent/terms? | Privacy/compliance harm, poor accuracy, lock-in | Follow `sandbox/docs/TECHNICAL_EVALUATION_PLAN.md`; legal/consent review before hosted use; keep adapters swappable |
| T-2 | Audio upload strategy | Single upload vs chunked/streaming; resumability on poor networks | Failed sessions, user frustration, data loss in-session | Prototype both if needed; measure on target devices/networks in Phase 1 |
| T-3 | Audio retention | Ephemeral-only vs consent-gated retained storage for evaluation | Unnecessary data exposure or inability to evaluate/debug | Default ephemeral; retain only with explicit consent, encryption, tight retention, audited access |
| T-4 | Browser/device support | Minimum supported Android browsers/versions for MediaRecorder and upload reliability | Milestone fails on real worker devices | Define test matrix early; include manual text fallback; consider lightweight PWA later (not assumed) |
| T-5 | Extraction method | Rules-only, LLM-assisted behind adapter, or hybrid (and offline constraints) | Hallucinated/ungrounded fields, cost/latency, connectivity dependence | Require span grounding/confirmation; config-driven constraints; evaluate before relying on LLM extraction |
| T-6 | Pilot field evolution governance | How field changes are proposed, evidenced, versioned, and reviewed | Config drifts into "assumed official" requirements | Mandatory provenance/status tags, schema validation, research-note links, change log in pilot config/docs |
| T-7 | Hosted pilot ops | Where/how to host (region, TLS termination, backups), and who operates it | Downtime, data exposure, unclear incident response | Small-team runbook, least privilege, backups for DB, monitored access; security review before pilot |
| T-8 | Identity/session model | Access codes vs per-worker accounts; how to pseudonymize consistently | PII leakage or unusable research linkage | Prefer opaque session/participant codes issued by research protocol; store minimal identifiers |
| T-9 | Offline/low-connectivity UX | What can be preserved client-side vs requires server | Data loss or confusing states | Clear state machine, local draft buffering where safe, explicit sync/retry cues; avoid overpromising offline ASR |
| T-10 | Evidence interpretation | How to report correction effort and failures without overclaiming | Misleading stakeholders about readiness/accuracy | Pair metrics with qualitative notes; require "conditions/corpus" statements per eval plan; maintain claim discipline |

---

## 11. Claim discipline (must appear in pilot artifacts)

All pilot UI, docs, demos, and reports must be consistent with:

- **Sample/draft only:** outputs are not official records and are **not submitted** anywhere.
- **No integration:** no Poshan Tracker/Bala Sanjeevini integration, no credentials, no compatibility or authorization claims (D-11/ADR-006).
- **Voice is hypothesis:** transcription quality and usefulness are to be measured, not assumed (D-12).
- **Fields unverified:** pilot fields are research/pilot artifacts unless and until supported by documented field evidence; main `config/report-fields.json` remains unchanged and unverified.
- **Privacy:** synthetic/non-identifying data posture in early pilots; consent-gated audio handling with retention/deletion controls.

**Suggested UI/footer text (adapt as needed, keep meaning):**  
*"Sample draft prepared with a research prototype for pilot evaluation. Not an official record. Not submitted. No government integration."*

---

## 12. Summary

The first field-testing milestone is a **separate `pilot/` track** that delivers a consented, mobile-first Telugu voice web flow — record, transcribe via swappable `ASRProvider` adapters, edit transcript, confirm, and generate a **sample report** — while preserving `sandbox/` as a simulated fallback and keeping main research config/decisions intact. Success at this stage is defined by **functional, safe, and measurable** pilot behavior under controlled conditions, with ASR quality and workflow value treated as hypotheses to be evaluated through field research and the technical evaluation plan.