# Outstanding Blocker Register — Phase 1.2 (Governance, Consent, Safeguarding)

**Date:** 2026-11-17  
**Repository:** `D:\GramVaani` (`main`)  
**Purpose:** track governance, consent, safeguarding, and readiness blockers for the first voluntary Anganwadi workflow observation.  
**Rule:** do **not** fabricate contacts, legal requirements, institutional approvals, safeguarding arrangements, or retention periods. Every unresolved item must remain explicitly unresolved until evidenced.

## Status definitions

| Status | Meaning |
|---|---|
| **UNRESOLVED (BLOCKER)** | Required for authorized participant observation/pilot data handling but not yet resolved/evidenced. |
| **RESOLVED (EVIDENCED)** | Documented with verifiable evidence (named approver/contact, dated approval, signed record, or confirmed pathway as appropriate). |
| **N/A** | Not applicable to the specific activity (must be justified). |

## Register

| ID | Blocker | Why required | Required evidence / decision | Owner (role, to be assigned) | Status | Notes |
|---|---|---|---|---|---|---|
| GOV-01 | Legal/ethics review status not recorded | Confirm whether DPDP/legal obligations and any field-research ethics approval (e.g. IEC/institutional) apply before real-world data collection; protocol states review/reverification required. | Written record: reviewer/counsel/IEC (or confirmation not required by competent authority), date, scope, outcome/conditions. | **[UNRESOLVED: assign Research Lead / Project Owner]** | **UNRESOLVED (BLOCKER)** | Do not claim legal compliance or ethics approval without evidence. |
| GOV-02 | Pre-pilot sign-off not completed | Accountability for protocol, data/security, and safeguarding/field conduct. | Signed/recorded sign-off: research lead, data/security owner (if different), safeguarding/field lead (if assigned), with dates. | **[UNRESOLVED]** | **UNRESOLVED (BLOCKER)** | See `PILOT_SAFEGUARDING_PROTOCOL.md` §11, §13. |
| CON-01 | Withdrawal contact/path not specified | Participants must be able to ask questions and request withdrawal/deletion via a known channel. | Named contact person/role, phone/email/channel, languages supported, expected response time, privacy-preserving identity verification method; reflected in consent materials. | **[UNRESOLVED: assign Research Lead / authorized contact]** | **UNRESOLVED (BLOCKER)** | No contact details invented. Required in protocol §7.3 and consent script. |
| CON-02 | Fluent Telugu human review of participant-facing consent not completed | Ensure participant-facing Telugu is clear, accurate, and culturally appropriate; avoid unapproved paraphrase/mistranslation. | Reviewer name/role, date, reviewed version, changes/approval recorded. | **[UNRESOLVED: assign fluent Telugu reviewer]** | **UNRESOLVED (BLOCKER)** | `consent-script-te.md` is a **draft pending human review**; do not claim linguistic approval. |
| CON-03 | Consent component for retained research/evaluation use/storage/sharing (beyond session) not operationalized | Separate explicit consent required for keeping/analysing audio or transcripts beyond immediate session (protocol Component C). | Final consent form/script includes separate Component C with approved wording, purpose, sharing limits, retention, withdrawal/deletion path; administration process documented. | **[UNRESOLVED]** | **UNRESOLVED (BLOCKER)** | Draft added in materials but requires human/legal/ethics/Telugu review and approval before use. |
| SAFE-01 | Designated safeguarding/field lead and incident owner not named | Clear responsibility for safeguarding concerns, stop/escalate decisions, and incident response. | Named safeguarding/field lead and incident owner with contact/availability and escalation authority documented. | **[UNRESOLVED]** | **UNRESOLVED (BLOCKER)** | Protocol §8 requires named role/contact. |
| SAFE-02 | Local/district child-protection escalation pathway not identified | Safeguarding concerns involving children require prompt escalation via applicable local pathway. | Confirmed applicable district/local child-protection authority/pathway, contact/process, and researcher instructions approved for use (as appropriate to jurisdiction/institution). | **[UNRESOLVED: assign Safeguarding/Field Lead with qualified guidance]** | **UNRESOLVED (BLOCKER)** | Do not invent pathway or contacts; confirm with appropriate local/institutional authorities. |
| SAFE-03 | Data/privacy incident notification criteria, contacts, and timelines not confirmed | Timely containment, escalation, and notification as required by applicable obligations/institutional policy. | Documented incident owner, escalation contacts, notification criteria/timelines, and reporting requirements confirmed with qualified reviewers/institution. | **[UNRESOLVED]** | **UNRESOLVED (BLOCKER)** | Protocol §8.2 placeholder. |
| DATA-01 | Pilot-instance retention periods not approved/specified | Retention must be defined, minimized, justified, and enforceable (including hosted backups/logs if any). | Approved retention schedule per data category (audio, transcripts, notes, metadata, linkage, consent records, logs/backups), justification, and enforcement method. | **[UNRESOLVED: Research Lead + Data/Security Owner + qualified review]** | **UNRESOLVED (BLOCKER)** | Protocol provides baseline principle (e.g. up to 90 days for raw audio/identifiable notes unless justified exception approved) but **instance-specific periods are not approved**. Do not invent periods. |
| DATA-02 | Storage locations/systems and access controls not specified | Least privilege, separation, encryption, and auditability require concrete systems/locations. | Documented storage location/system per data type, access roles, encryption/protection, backup behavior, and (if hosted/third-party) provider/purpose/region/retention/access controls. | **[UNRESOLVED: Data/Security Owner]** | **UNRESOLVED (BLOCKER)** | Includes consent records, linkage, metadata, transcripts, audio, logs. |
| DATA-03 | Deletion responsibilities, tools/systems, and completion timeline not assigned | Withdrawal/deletion requests and retention expiry must be executable and verifiable. | Named deletion owner(s), systems/tools per store, procedure, verification steps, and expected completion timeline/SLA. | **[UNRESOLVED: Data/Security Owner]** | **UNRESOLVED (BLOCKER)** | Protocol §6.3 and §11.1 require this. |
| REC-01 | Recruitment/intermediary approach not confirmed as voluntary and non-coercive | Prevent pressure, undue influence, or perceived job consequences. | Documented recruitment plan, intermediary role (if any), script/approach reviewed, and confirmation that participation is voluntary and independent of employment/performance. | **[UNRESOLVED: Research Lead]** | **UNRESOLVED (BLOCKER)** | Procedure drafted; operational confirmation required. |
| TECH-01 | Live microphone acceptance on target browser/device not completed | Voice path behavior (permissions, record/pause/resume/stop/playback, natural Telugu/code-mix, consecutive takes, failures) unverified on real device. | Completed `LIVE_MICROPHONE_TEST_CHECKLIST.md` with device/browser/OS/ASR path, results, failures, and limitations; critical issues resolved or accepted with evidence. | **[UNRESOLVED: Tester/Researcher]** | **UNRESOLVED (BLOCKER for relying on voice path)** | **Not a prerequisite for observation-only research** (observe existing workflow without introducing prototype). No speech accuracy claimed (D-12). |

## Notes

- **No fabricated details:** contacts, pathways, approvals, retention periods, and arrangements listed above are intentionally unresolved where evidence/decisions are missing.
- **Observation-only path:** if all governance/safeguarding/consent blockers required for observation-only (non-audio, no prototype introduction, no participant data beyond approved consented notes/metadata per protocol) are resolved and evidenced, observation-only participation may proceed under approved protocol; audio/retained-sample collection remains separately blocked until their specific consents, storage, retention, and handling are approved.
- **Prototype introduction:** do not introduce GramVaani before observing existing workflow; do not contact workers or collect participant data until authorized.

## Decision log (to be completed)

| Date | ID | Decision | Approved by | Evidence |
|---|---|---|---|---|
| [UNRESOLVED] |  |  |  |  |