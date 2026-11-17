# Audio and Data Retention & Deletion Procedure (Draft)

**Date:** 2026-11-17  
**Status:** Draft procedure framework — **instance-specific values, systems, owners, and timelines are UNRESOLVED BLOCKERS** until approved/evidenced (see `OUTSTANDING_BLOCKER_REGISTER.md`, DATA-01/02/03, CON-01, SAFE-03).  
**Scope:** handling of data for workflow observation/pilot research activities, with strict separation of consented audio categories and non-identifying/anonymized records.  
**Principles:** collect minimum necessary; synthetic/non-identifying examples for prototype testing; no beneficiary/child PII, no Aadhaar/IDs, no government credentials; separate explicit consents; least privilege; no retention without approved basis.

## 1. Data categories and consent/handling separation

| Category | Examples | Collection condition | Retention/deletion (status) |
|---|---|---|---|
| **Consent records (component-level)** | A/B/C/D consent status, date/time, session/participant code, consent form ref | Before relevant activity | **[UNRESOLVED: approved location/retention/access — DATA-01/02]** Keep separate from raw research content where possible. |
| **Participant code linkage** (if any) | Minimal mapping needed for scheduling/withdrawal (kept separate) | Only if necessary, minimal | **[UNRESOLVED]** Delete when no longer needed for withdrawal/contact; shortest justified period. |
| **Session metadata** (anonymized) | session code (W#), date window, centre type (non-identifying), device/context, timings/aggregates | With observation consent | **[UNRESOLVED: approved period/location — DATA-01/02]** |
| **Observation/interview notes** (anonymized) | process steps, timings, field labels (no values/PII), non-identifying quotes as consented | With observation/notes consent | **[UNRESOLVED]** Review for accidental identifiers before retention. |
| **Transcripts** (non-identifying) | ASR/researcher transcript of synthetic/non-identifying speech | Appropriate consent; **separate retained research-use consent (Component C)** if kept beyond immediate session | **[UNRESOLVED]** |
| **Temporary transcription audio** | Audio captured/used only to produce transcript during/immediately after session, not intended for research retention | **Only with separate explicit audio-recording consent (Component B)** and clear participant understanding | **[UNRESOLVED: define "temporary" window, storage, and deletion trigger/timeline — DATA-01/03]** Must be deleted after transcription/verification per approved procedure; do not retain as research sample. |
| **Retained research/evaluation audio samples** | Audio kept for research/evaluation beyond immediate session | **Only with separate explicit audio-recording consent (B) AND separate retained research-use/storage/sharing consent (C)** | **[UNRESOLVED: approved period, storage, access, sharing limits, deletion — DATA-01/02/03, CON-03]** |
| **Corrections/feedback/interaction data** (non-identifying) | edits, correction counts, usability feedback | As consented, minimum necessary | **[UNRESOLVED]** |
| **Audit/access logs** | administrative access/events (no raw content/secrets) | As needed for security/accountability | **[UNRESOLVED]** |

**Prohibited:** child/beneficiary PII, names/photos of children, Aadhaar/beneficiary IDs, family contact/address details, government credentials/logins/OTPs, covert recordings.

## 2. Consent and recording rules

- **No audio without separate explicit consent.** Audio recording consent (B) is optional and separate from observation consent (A). Declining audio must not affect observation-only participation.
- **Temporary transcription vs retained sample:** must be explained separately. Temporary transcription audio (if consented for capture) is for immediate transcription only and deleted per approved temporary window; retained research/evaluation samples require **additional separate consent (C)** specifying purpose, storage, access, sharing limits, retention, and withdrawal/deletion.
- **Do not record/retain** if consent is absent, unclear, withdrawn, or if prohibited/identifying information is present (stop, do not retain content, follow protocol).

## 3. Storage, access, and security (framework)

> **BLOCKER (DATA-02):** storage locations/systems, access roles, encryption, backups, and hosted/third-party processing details must be specified and approved.

- **Locations/systems:** `[UNRESOLVED — specify per data category]` (consent records separate from raw content where possible; audio/transcripts in restricted, access-controlled stores).
- **Access control:** least privilege, named authorized roles only, no shared accounts where feasible, access revocation when not required. `[UNRESOLVED — name roles/owners]`
- **Protection:** encrypted devices/storage where feasible; no storage in personal/unmanaged apps/public folders; no commit to git/public repos.
- **Hosted/third-party services:** if used for hosting/storage/transcription/ASR, document provider, purpose, region, retention, access controls, and complete due diligence/disclosure before enabling. `[UNRESOLVED]`
- **Logging:** audit admin/access events without logging raw audio, transcript content, or secrets.

## 4. Retention (framework — no invented periods)

> **BLOCKER (DATA-01):** instance-specific retention periods must be approved and documented. Do not invent or assume periods.

- **Baseline principle (from protocol, not an approved instance schedule):** raw audio and identifiable/raw session notes retained for **up to 90 days after pilot/study activity closes**, or shorter if sufficient, **unless a justified and documented exception is approved**. Earlier deletion on valid withdrawal/deletion request where applicable and still linkable.
- **Transcripts/corrections/feedback:** retain only as long as needed for approved analysis purposes; prefer de-identified/aggregated derivatives. `[UNRESOLVED — approved period]`
- **Temporary transcription audio:** delete as soon as transcription/verification is complete within an **approved** temporary window. `[UNRESOLVED — define window/trigger]`
- **Retained research/evaluation samples:** only under Component C consent and **approved** retention schedule. `[UNRESOLVED]`
- **Backups/logs/hosted copies:** retention/deletion behavior must be understood, documented, and enforced to extent feasible. `[UNRESOLVED]`
- **Aggregated/anonymised outputs:** may be retained longer only if not reasonably linkable to individuals and free of sensitive content (confirm per approved process).

## 5. Deletion procedure (framework)

> **BLOCKER (DATA-03):** deletion owner(s), systems/tools, verification, and completion timeline must be assigned and approved.

1. **Identify scope:** locate all copies for participant/session (audio, transcripts, notes, exports, hosted storage, local devices, backups where feasible) using anonymized session/participant codes and approved linkage process.
2. **Delete/secure:** remove requested/in-scope data from primary stores; revoke access links/codes as needed. For temporary transcription audio, delete immediately after approved transcription step (no retention as sample).
3. **Third-party/hosted:** follow provider deletion mechanisms; document limitations (e.g. backup windows) transparently.
4. **Verify and record:** responsible owner verifies completion and records date/action in a minimal deletion log (no deleted content). `[UNRESOLVED — owner, timeline/SLA]`
5. **Withdrawal:** process per §7 of `PILOT_SAFEGUARDING_PROTOCOL.md` and approved withdrawal contact/path (CON-01). If data already irreversibly anonymised/aggregated and unlinkable, explain limitation and delete all still-linkable records.

## 6. Accidental capture / incident handling

- If prohibited/identifying information appears: stop capture/recording, do not transcribe/copy/retain identifying content, delete affected segment/file where feasible, document action without recording sensitive content, and escalate per approved safeguarding/incident pathway (SAFE-01/02/03).
- Data/privacy incidents (unauthorized access, loss, unintended sharing/upload, consent failure): contain, assess, remediate, notify/escalate per approved criteria, and document de-identified summary.

## 7. Pre-use checklist (must be satisfied before collecting/retaining data)

- [ ] DATA-01/02/03 resolved and evidenced (retention, storage/access, deletion owners/tools/timelines).
- [ ] CON-01/02/03 and GOV-01 resolved/evidenced as applicable; approved consent materials in use.
- [ ] SAFE-01/02/03 resolved/evidenced; escalation pathway known to researchers.
- [ ] Separate consent obtained and documented for each applicable component; observation-only path available.
- [ ] Anonymized session identifiers used; prohibited data excluded. No audio retained without required consents.

*This document defines required process structure and separation; it does not authorize data collection/retention and does not specify approved instance-specific periods, contacts, or systems.*