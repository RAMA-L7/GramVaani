# Pilot Safeguarding Protocol (Controlled Live Pilot)

**Project:** GramVaani (research prototype, Telugu-first, voice-assisted)  
**Document:** Ethics, consent, privacy, and safety protocol for a controlled live pilot  
**Date:** 2026-11-16  
**Status:** Draft research protocol (desk research; **not legal advice**)  
**Location context:** Pilot begins with Anganwadi worker contacts in West Godavari district, Andhra Pradesh (subject to recruitment and consent)  

> **Important:** This protocol is practical research guidance, not legal advice or a compliance determination. DPDP Act/Rules commencement, exemptions, and any field-research ethics approvals (e.g., IEC) must be re-verified with qualified counsel/ethics reviewers before real-world deployment or data collection.

---

## 1. Purpose and scope

### 1.1 Purpose
This protocol defines how to run a **small, controlled, voluntary live pilot** of the GramVaani Telugu voice prototype with Anganwadi workers in a way that protects participants, prevents misuse of sensitive information, and keeps the pilot clearly separate from government systems and mandatory reporting.

The pilot is intended to learn whether and how a voice-assisted draft/report-preparation aid is usable, understandable, and trustworthy in practice (including correction effort and consent to audio handling), **not** to evaluate workers, produce official records, or replace existing reporting.

### 1.2 Scope
Applies to:
- Recruitment and participation in pilot sessions (in-person or remote, if used).
- Prototype use during pilot sessions, including hosted/web access to a prototype.
- Collection, handling, storage, access, retention, and deletion of pilot data (session metadata, transcripts, corrections, feedback, and audio **only if separately consented**).
- Researcher conduct, incident/safeguarding response, and dashboard/analytics outputs derived from pilot data.

Out of scope:
- Any integration with government applications/systems (e.g., Poshan Tracker, Bala Sanjeevini) or use of government credentials (D-11, ADR-006).
- Collection or processing of real beneficiary/child data, official records, or operational submissions.
- Production deployment, public open access, or use of pilot outputs as official evidence.

### 1.3 Key principles (hard constraints)
- **Voluntary participation:** no coercion, no penalty for declining/stopping, and no dependency on the prototype for mandatory reporting. **Experimental outputs are never sent to government systems.**
- **Synthetic or non-identifying information only (initial pilots):** no children's names, Aadhaar/beneficiary identifiers, child photos, addresses/phone numbers of families, or government app credentials/logins.
- **Consent before recording speech:** separate, explicit consent for (a) observation/prototype use, (b) audio recording, and (c) research use/storage/sharing of recordings and transcripts beyond the session.
- **Transparency (D-12 / ASR unproven):** explain that voice recognition/extraction may be inaccurate, outputs are drafts, and worker review/correction is required.
- **Least privilege and minimisation:** collect only what is needed; restrict access; retain for the shortest justified period; delete securely.
- **No performance ranking:** no individual worker rankings/leaderboards in dashboards or reports; analytics must be aggregated/anonymised and used only to improve the product/research.

---

## 2. Participant eligibility and recruitment

### 2.1 Eligibility
**Inclusion (indicative):**
- Currently working as an Anganwadi worker (or closely related reporting role, if explicitly justified and consented) and preparing reports themselves.
- Able to consent independently.
- Willing to participate voluntarily in a prototype/research session using synthetic or non-identifying information only.

**Exclusion:**
- Anyone unable to consent independently.
- Anyone who feels pressured by a supervisor/employer/intermediary to participate.
- Sessions where the participant cannot avoid discussing or displaying real beneficiary/child-identifying information (reschedule or stop; see incident handling).

### 2.2 Recruitment
- **Starting point:** West Godavari district contact(s), through a trusted local intermediary where appropriate.
- **Voluntary:** make clear that participation is optional, not monitored as job performance, and will not affect employment, benefits, or reporting obligations.
- **Varied experience:** aim to include workers with varied experience levels, centre contexts, and device familiarity (as feasible in a small pilot) to understand different needs; do not over-recruit or incentivize in ways that distort consent.
- **No dependency:** participants must continue to use their normal, approved processes for any mandatory reporting; the prototype is a research aid only.
- **Anonymisation codes:** assign participant codes (e.g., `W1`, `W2`…) for notes, files, and analysis. Keep any name/contact-to-code linkage (if needed for scheduling/withdrawal) separate from research data, in a restricted location, and delete when no longer needed.

### 2.3 Participant information (plain language)
Before consent, explain clearly:
- What the study/pilot is, who is conducting it, and that it is **not** a government programme and **not** a test of the worker.
- What the prototype can/cannot do; that ASR/voice understanding may make mistakes (D-12) and outputs are drafts requiring review.
- What will be asked (e.g., try the prototype with **synthetic/non-identifying** examples, share feedback, optional audio sample).
- What data may be collected, where stored, who can access, how long retained, and how to withdraw/delete data.
- That the participant can skip any question/action, pause, or stop at any time without giving a reason.

---

## 3. Informed consent (separate, explicit components)

Consent must be obtained **before** any recording or research data collection. Use plain language, read aloud if helpful, allow questions, and provide a copy/record of consent as appropriate. **Consent for audio recording and for research use/storage/sharing is separate** from consent to observe/use the prototype.

Align with existing field-research consent practices (see `research/instruments/consent-script-te.md`) and extend for hosted pilot/audio uploads.

### 3.1 Consent components (obtain separately)
| Component | Required for | Notes |
|---|---:|---|
| **A. Participation / observation / prototype use** | Any pilot session | Voluntary; can stop anytime; synthetic/non-identifying info only; prototype not for mandatory reporting. |
| **B. Audio recording** | Recording speech during the session | **Consent before recording.** Participant can participate without audio recording. Explain microphone/audio capture, possible background voices, and upload/storage if hosted. |
| **C. Research use, storage, and sharing of recordings/transcripts** | Keeping/analysing audio or transcripts beyond the immediate session | Separate, explicit consent. Specify who can access (named roles/team), retention period, allowed research uses, and whether any sharing beyond the core research team is permitted (**default: no external sharing of raw audio/transcripts**). |
| **D. Screen capture / photos of app screens (optional, rare)** | Only if needed and explicitly consented | **No photos of children, ever.** Screen captures only if they contain no personal/beneficiary/government-account data and only with separate consent. Prefer not to capture screens. |

### 3.2 Participant-facing consent text (Telugu) — **DRAFT, needs review**
> Use and adapt the existing script in `research/instruments/consent-script-te.md` as the base. Below are **pilot-specific additions/placeholders** to be reviewed by a fluent Telugu speaker and, where appropriate, ethics/legal reviewers before use. Read slowly; do not paraphrase in ways that change meaning.

**పాల్గొనడం / పరిశీలన (ఘటం A) — డ్రాఫ్ట్**  
- `[PLACEHOLDER_TE_A1]` మీరు ఈ పైలట్/పరిశోధనలో పాల్గొనడం పూర్తిగా స్వచ్ఛందం. ఏ సమయంలోనైనా ఆపవచ్చు. కారణం చెప్పాల్సిన అవసరం లేదు.  
- `[PLACEHOLDER_TE_A2]` ఇది మీ పనిని పరీక్షించడం కాదు. ఈ ప్రోటోటైప్ ప్రభుత్వ నివేదికలు సమర్పించడానికి కాదు; తప్పనిసరి నివేదికల కోసం మీరు సాధారణంగా ఉపయోగించే అధికారిక విధానాన్నే కొనసాగించాలి.  
- `[PLACEHOLDER_TE_A3]` దయచేసి పిల్లల పేర్లు, ఆధార్/లబ్ధిదారుల గుర్తింపు సంఖ్యలు, కుటుంబాల వివరాలు, పిల్లల ఫోటోలు, ప్రభుత్వ యాప్ లాగిన్ వివరాలు చెప్పవద్దు/చూపవద్దు. మనం **నకిలీ (synthetic) లేదా గుర్తింపు లేని** సమాచారంతో మాత్రమే ప్రయత్నిస్తాము.  
- `[PLACEHOLDER_TE_A4]` వాయిస్/ASR సరిగా గుర్తించకపోవచ్చు; చూపించిన సమాచారం డ్రాఫ్ట్ మాత్రమే. మీరు సరిచూసి అవసరమైతే మార్చాలి.  

**ఆడియో రికార్డింగ్ (ఘటం B, ప్రత్యేక అనుమతి) — డ్రాఫ్ట్**  
- `[PLACEHOLDER_TE_B1]` మీ అనుమతి ఉంటే మాత్రమే మీ మాటలను రికార్డ్ చేస్తాము. రికార్డింగ్ లేకుండా కూడా పాల్గొనవచ్చు.  
- `[PLACEHOLDER_TE_B2]` ఏమి రికార్డ్ అవుతుంది: `[PLACEHOLDER: session speech/audio, duration/context]`  
- `[PLACEHOLDER_TE_B3]` ఎక్కడ నిల్వ చేస్తాము: `[PLACEHOLDER: device/secure storage/hosting location]` | ఎవరు చూడగలరు: `[PLACEHOLDER: roles]` | ఎంతకాలం: `[PLACEHOLDER: retention period]`  
- `[PLACEHOLDER_TE_B4]` మీరు ఏ సమయంలోనైనా రికార్డింగ్ ఆపమని చెప్పవచ్చు.  

**రికార్డింగ్/ట్రాన్స్‌క్రిప్ట్‌ల పరిశోధన ఉపయోగం, నిల్వ, భాగస్వామ్యం (ఘటం C, ప్రత్యేక అనుమతి) — డ్రాఫ్ట్**  
- `[PLACEHOLDER_TE_C1]` రికార్డింగ్‌లు/ట్రాన్స్‌క్రిప్ట్‌లను పరిశోధన కోసం ఉపయోగించడానికి, నిల్వ చేయడానికి మీ ప్రత్యేక అనుమతి అవసరం.  
- `[PLACEHOLDER_TE_C2]` ఉపయోగం: `[PLACEHOLDER: improve prototype, analyse errors/corrections, research summary - no individual performance ranking]`  
- `[PLACEHOLDER_TE_C3]` భాగస్వామ్యం: `[PLACEHOLDER: default no sharing outside core research team / specify if any]`  
- `[PLACEHOLDER_TE_C4]` ఉపసంహరణ/తొలగింపు: `[PLACEHOLDER: how to withdraw and request deletion, contact, timeframe within retention period]`  

**English meaning of placeholders (for team review, not read aloud):**
- A1: participation voluntary; can stop anytime, no reason needed.
- A2: not a test; prototype not for government submission; continue normal official process for mandatory reporting.
- A3: do not share/show child names, Aadhaar/beneficiary IDs, family details, child photos, government logins; use synthetic/non-identifying info only.
- A4: ASR may be inaccurate; outputs are drafts and must be reviewed/corrected.
- B1–B4: audio recorded only with separate permission; can participate without it; what/where/who/how long; can stop recording anytime.
- C1–C4: separate permission for research use/storage/sharing of recordings/transcripts; purpose; sharing limits; withdrawal/deletion path.

### 3.3 Consent documentation
- Record which components (A/B/C/D) were consented to, date/time, session/pilot ID, and participant code.
- Do **not** store consent records in the same file/location as raw audio/transcripts where avoidable; keep linkable via participant/session code with restricted access.
- If audio consent is refused, proceed only with non-audio components (if consented) and note refusal neutrally as a finding/context, not a failure.
- Re-confirm consent if the session purpose, data handling, or recording method changes.

---

## 4. Data collected and prohibited data

### 4.1 What may be collected (minimum necessary)
| Category | Examples | Conditions |
|---|---|---|
| **Session metadata** | Date/time window, session ID, participant code (W1…), centre context type (e.g., urban/rural, non-identifying), device/app version, language settings, task/scenario used | No names, no precise addresses, no centre names in filenames/IDs. |
| **Prototype interaction data** | Synthetic/non-identifying inputs entered or spoken, UI actions/events relevant to usability (as designed), error states | Must not contain beneficiary/child-identifying data. |
| **Transcripts** | ASR transcript and/or researcher-verified transcript of **synthetic/non-identifying** speech | Collect/store only with appropriate consent (and separate research-use consent if retained beyond session). Review for accidental identifiers before retention. |
| **Corrections** | Worker corrections/edits to transcript or extracted draft fields, correction counts/time/notes (aggregatable) | Used to assess usability/ASR quality (D-12); do not use for individual performance ranking. |
| **Feedback** | Interview/think-aloud notes, usability ratings, trust/concerns, suggestions | Anonymised/coded; avoid attributing sensitive personal opinions in identifiable ways in shared outputs. |
| **Audio recordings** | Session speech audio for evaluation/research | **Only with separate, explicit consent (B and C as applicable).** Prefer short, purpose-limited samples. Disclose if uploaded to hosted services. |

### 4.2 Prohibited data (must not be collected, requested, stored, or shared)
- **Children/beneficiary data:** children's names, photos/images/videos of children, dates of birth, growth/health records linked to individuals, Aadhaar numbers, beneficiary IDs, ration/family identifiers, addresses/phone numbers of families, or any other identifying information about children/families.
- **Government credentials/systems:** app usernames/passwords, OTPs, device unlock codes, tokens, screenshots showing logged-in government accounts, or any access to Poshan Tracker/Bala Sanjeevini/government backends (D-11, ADR-006).
- **Unnecessary personal data:** participant's government ID numbers, bank details, or personal contacts beyond what is strictly needed for scheduling/withdrawal (and if collected, keep separate and minimal).
- **Covert recording:** no audio/screen capture without the participant's knowledge and explicit prior consent.
- **Performance surveillance data:** keystroke-level monitoring or metrics intended to rank/discipline individual workers.

### 4.3 Handling accidental capture
If prohibited/identifying information appears (on screen, spoken, typed, or recorded):
1. **Stop** the relevant capture/recording immediately.
2. **Do not** transcribe, copy, photograph, or retain the identifying content.
3. Note only that an incidental exposure occurred and what corrective action was taken (without recording the content).
4. Delete/securely discard the affected audio/file/segment where feasible; document deletion.
5. If the participant is distressed or a safeguarding concern arises, follow §8.

---

## 5. Access control and security

### 5.1 Access principles
- **Least privilege:** only named research team members with a legitimate need may access pilot data.
- **Role separation:** separate roles for facilitation, transcription/analysis, and data administration where possible.
- **Individual pilot access codes:** each participant/session uses a unique access code or session link/code as appropriate; do not share codes publicly or reuse across participants.
- **No public access:** the prototype website being reachable over HTTPS does **not** mean pilot data is public. Research data, recordings, transcripts, and admin interfaces must be access-restricted.

### 5.2 Hosted prototype / web pilot controls
- **Transport security:** HTTPS for all hosted access; avoid transmitting data over unsecured channels.
- **Authentication/access:** individual pilot/session access codes (or equivalent) for participants; restricted researcher/admin access (strong authentication, no shared accounts where feasible).
- **Researcher access:** least privilege, need-to-know, and revocation when no longer required.
- **Logging/auditing:** maintain audit logs of administrative/researcher access and key data-handling events (e.g., upload/export/delete actions) **without logging raw audio, transcript content, or secrets** inappropriately.
- **Data minimisation in logs:** do not include participant names, speech content, credentials, or identifiers in application logs.
- **Environment separation:** keep pilot/research data stores separate from any public/demo environment; disable analytics/telemetry that collects content unless explicitly consented and documented.

### 5.3 Device and storage security
- Use encrypted devices/storage for notes and any consented audio where feasible.
- Avoid storing pilot data in personal/unmanaged messaging apps or public folders.
- Do not commit raw notes, audio, transcripts, consent forms with identifiers, or exports containing pilot data to git/public repositories.
- If third-party/cloud services are used for hosting, storage, transcription, or ASR, document provider, purpose, region, retention, and access controls; review against the project's cloud/AI due-diligence questions (`research/PRIVACY_AND_SAFEGUARDING.md` §7) before enabling.

---

## 6. Storage, retention, and deletion

### 6.1 Storage locations (to be specified per pilot instance)
| Data type | Storage location | Access | Notes |
|---|---|---|---|
| Consent records (component-level) | `[PLACEHOLDER: restricted location/system]` | Research lead / authorised staff only | Keep separate from raw content where possible. |
| Participant code linkage (if any) | `[PLACEHOLDER: restricted location/system]` | Minimum necessary staff | Delete when no longer needed for withdrawal/contact. |
| Session metadata / feedback / corrections | `[PLACEHOLDER: restricted research store]` | Authorised researchers | Store using participant/session codes. |
| Transcripts (if consented) | `[PLACEHOLDER: restricted research store]` | Authorised researchers | Review/redact accidental identifiers before retention. |
| Audio (if consented) | `[PLACEHOLDER: encrypted/restricted store]` | Strictly limited authorised researchers | Do not store in general shared drives. |
| Audit/access logs | `[PLACEHOLDER: restricted logging system]` | Admin/research lead | No raw content/secrets. |

### 6.2 Retention
- **Baseline (aligned with field research):** raw audio and identifiable/raw session notes retained for **up to 90 days after the pilot/study activity closes**, or a shorter period if sufficient, unless a justified and documented exception is approved. Delete earlier on valid withdrawal/deletion request where applicable.
- **Transcripts/corrections/feedback:** retain only as long as needed for analysis and documented research/product-improvement purposes; prefer de-identified/aggregated derivatives for longer retention.
- **Aggregated/anonymised outputs:** may be retained longer if they cannot reasonably be linked to an individual participant and contain no sensitive content.
- **Hosted uploads:** define and enforce retention/deletion for any uploaded audio/session data in the hosting environment; do not rely on indefinite provider retention.

`[PLACEHOLDER: specify exact retention period(s) for this pilot instance, including hosted backups/logs, and justification if different from 90 days]`

### 6.3 Secure deletion procedure
1. Identify all locations/copies for the participant/session (audio, transcripts, notes, exports, hosted storage, backups where feasible, and local researcher devices).
2. Delete requested/in-scope data from primary stores and revoke access links/codes as needed.
3. Remove or anonymise references in working files where feasible; retain a minimal withdrawal/deletion log entry (date, participant/session code, action taken) without storing deleted content.
4. Confirm deletion actions were completed by the responsible researcher/admin and record completion date.
5. For third-party/hosted systems, follow provider deletion mechanisms and document limitations (e.g., backup retention windows) transparently.

`[PLACEHOLDER: name responsible role(s), systems/tools used for deletion, and expected completion timeline]`

---

## 7. Withdrawal

### 7.1 Withdrawal during a session
- Participant may pause or stop at any time, for any reason, without explanation or penalty.
- On request: stop recording immediately, stop the task, and confirm whether already-captured audio/notes for that session should be deleted.
- If withdrawal occurs, thank the participant and provide/support any agreed follow-up (e.g., deletion confirmation contact path).

### 7.2 Withdrawal after a session (within retention period)
- Participant may request withdrawal of data and/or deletion of their audio, transcripts, and identifiable notes within the applicable retention period.
- Use participant code/session details and/or the separate contact/linkage process to locate records.
- Complete deletion as per §6.3 and communicate outcome where contact is possible/appropriate.
- If data has already been irreversibly anonymised and aggregated such that it cannot be linked back, explain this limitation clearly and delete all still-linkable records.

### 7.3 Withdrawal contact/path (to be completed before pilot)
- **Contact person/role:** `[PLACEHOLDER]`
- **Phone/email/channel:** `[PLACEHOLDER]`
- **Languages supported:** `[PLACEHOLDER: Telugu/English/other]`
- **Expected response time:** `[PLACEHOLDER]`
- **Identity verification (privacy-preserving):** `[PLACEHOLDER: use participant/session code or agreed method; avoid collecting extra identifiers]`

---

## 8. Incident and safeguarding response

### 8.1 Safeguarding concerns (including child protection)
- If a participant discloses a safeguarding concern or a child-protection concern: **stop the session** (or stop recording/data capture), prioritise safety, listen without pressing for detail, and follow the applicable district/local child-protection escalation path.
- **Do not** record sensitive disclosure details in project files, notes, transcripts, tickets, or chat tools beyond the minimum necessary administrative note required by the escalation process (and handle any such note under restricted access).
- Seek guidance from the designated safeguarding/field lead immediately: `[PLACEHOLDER: named role/contact]`.

### 8.2 Data/privacy incidents
Examples: accidental recording without consent, capture of beneficiary/child-identifying data, credential exposure, unauthorised access, lost device, unintended sharing/upload, or log containing sensitive content.
1. **Contain:** stop recording, disable access/link, remove exposed file/access, or isolate affected system as appropriate.
2. **Assess:** what data was involved, who had access, whether it included prohibited/identifying content, and whether copies exist.
3. **Remediate:** delete/secure affected data, rotate credentials/tokens if relevant, and document actions.
4. **Notify/escalate:** inform research lead and follow organisational/legal/ethics reporting requirements as applicable. `[PLACEHOLDER: incident owner, escalation contacts, and notification criteria/timelines to be confirmed with qualified reviewers]`
5. **Learn:** record a de-identified incident summary and update protocol/controls.

### 8.3 Participant distress or discomfort
- Pause or stop the session, offer to skip topics/tasks, and remind the participant of the right to withdraw.
- Do not pressure continuation. Adjust the protocol for future sessions if needed.

---

## 9. Researcher responsibilities

Researchers/facilitators must:
- Complete a protocol briefing before conducting pilot sessions; understand consent, prohibited data, and stop/escalation procedures.
- Use only approved scripts/materials; describe the prototype honestly, including ASR limitations and non-government status (D-11, D-12).
- Obtain and document **separate** consents (A/B/C/D as applicable) before relevant activities; never record covertly.
- Use **synthetic/non-identifying** scenarios only; actively steer away from real beneficiary details and government credentials.
- Protect confidentiality: anonymise/coded records (W1…), secure devices/files, least-privilege access, no sharing of raw data outside authorised channels.
- Avoid leading questions and avoid framing the session as worker evaluation.
- Report incidents/safeguarding concerns promptly per §8.
- Respect withdrawal and deletion requests and follow retention/deletion rules.
- Do not make legal, official, or performance claims based on pilot observations.

---

## 10. Dashboard and analytics rules

- **Purpose:** dashboards/analytics are for understanding usability, reliability, correction burden, and product improvement only.
- **Aggregation/anonymisation:** report metrics in aggregate (e.g., by session count, task type, time bands, error/correction categories) and suppress small-cell outputs that could identify an individual or centre.
- **No individual rankings:** do **not** produce or display leaderboards, worker-by-worker performance rankings, "best/worst worker" comparisons, or metrics framed for supervision/discipline.
- **No surveillance framing:** avoid continuous monitoring indicators; collect only measures justified by the research questions and consent.
- **Content safety:** dashboards must not display raw audio, raw transcripts, or free-text notes that may contain identifiers; review outputs for accidental identifying content before sharing.
- **Access:** restrict dashboard access to authorised researchers/product team members under least privilege; do not share externally without review and only in aggregated/anonymised form consistent with consent.
- **Interpretation:** accompany findings with limitations (small sample, prototype/ASR unproven, not generalisable; desk research not legal advice where relevant).

---

## 11. Pre-pilot checklist

Complete and sign off before the first pilot session:

### 11.1 Governance and materials
- [ ] Protocol reviewed by research lead; legal/ethics review status recorded (`[PLACEHOLDER: counsel/IEC/reviewer, date, outcome]`).
- [ ] Participant information and consent materials finalized (English + Telugu draft reviewed by fluent speaker) with separate A/B/C/D components.
- [ ] Withdrawal contact/path, retention period(s), and deletion owner/process filled in (§6, §7).
- [ ] Incident/safeguarding escalation contacts and local child-protection pathway confirmed (§8).
- [ ] Synthetic/non-identifying pilot scenarios/scripts prepared (no real beneficiary data).

### 11.2 Technical and security controls
- [ ] Hosted prototype uses HTTPS; individual pilot access codes/session controls configured and tested.
- [ ] Researcher/admin access restricted (least privilege), accounts reviewed, and audit/logging enabled without capturing sensitive content.
- [ ] Storage locations for consent records, metadata, transcripts, and audio (if any) are access-controlled and documented.
- [ ] Backup/retention/deletion behavior understood for all systems (including third-party services, if used).
- [ ] Cloud/AI/ASR provider due diligence completed and documented if any hosted processing is used; in-product disclosure prepared (§5.3, privacy note).
- [ ] No government integration, no credential capture, and no submission/export path to government systems.

### 11.3 Session readiness
- [ ] Researchers briefed on prohibited data, accidental-capture steps, and stop/escalation procedures.
- [ ] Devices checked (encryption where feasible, storage space, microphone only if audio-consented).
- [ ] Participant code scheme ready (W1…); linkage file (if needed) stored separately/restricted.
- [ ] Plan for "no audio consent" path confirmed (notes/feedback only, as consented).

### 11.4 Post-session readiness
- [ ] Template/location ready for de-identified session notes and metadata.
- [ ] Process for reviewing transcripts/audio for accidental identifiers before retention.
- [ ] Deletion/withdrawal request tracking method ready.

**Pre-pilot sign-off:**  
- Research lead: `[PLACEHOLDER: name, signature/initials, date]`  
- Data/security owner (if different): `[PLACEHOLDER]`  
- Safeguarding/field lead (if assigned): `[PLACEHOLDER]`

---

## 12. Alignment notes (project context)

- **Field research alignment:** extends `research/FIELD_RESEARCH_PLAN.md` ethics and session practices (voluntary consent in Telugu/read aloud, participant codes W1…, no beneficiary data/photos/credentials, 90-day raw retention baseline unless justified, stop-and-escalate for safeguarding concerns).
- **Privacy/safeguarding alignment:** consistent with `research/PRIVACY_AND_SAFEGUARDING.md` (synthetic/non-identifying data, session-scoped handling, cloud/AI due diligence before hosted processing; desk research, not legal advice).
- **Decisions/ADRs:** reflects D-10 (documentation burden framing; do not overclaim), D-11/ADR-006 (no government integration/credentials/submission), D-12 (voice/ASR unproven; transparency and correction), ADR-005/ADR-008 principles as applicable to pilot handling.
- **Sandbox safety:** `sandbox/docs/SAFETY.md` was not found at time of drafting; if created later, review and align this protocol with it.

## 13. Document history

| Date | Version | Change | Author/Owner |
|---|---|---|---|
| 2026-11-16 | 0.1 (draft) | Initial pilot safeguarding protocol created for controlled live pilot (ethics, consent, privacy, safety). | `[PLACEHOLDER]` |
| `[PLACEHOLDER]` | `[PLACEHOLDER]` | `[PLACEHOLDER: Telugu review / legal-ethics review / pilot-specific updates]` | `[PLACEHOLDER]` |
