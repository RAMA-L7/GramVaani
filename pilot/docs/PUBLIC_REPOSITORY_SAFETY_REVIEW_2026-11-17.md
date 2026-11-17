# Public Repository Safety Review — Uncommitted Research Documents (2026-11-17)

**Repository:** `D:\GramVaani` (`main`, public: `RAMA-L7/GramVaani`)  
**Scope:** all currently uncommitted/unstaged and untracked research-related documents shown by `git status` at time of review (see below). **No files were deleted or rewritten.**  
**Reviewer:** automated/document review (text inspected; screenshot pixels not visually inspectable in this environment).

## Scope reviewed

- **Modified:** `research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md`, `research/instruments/consent-script-te.md`, `research/instruments/note-template.md`
- **Untracked:** `pilot/docs/BUGS_AND_ISSUES_2026-11-17.md`, `pilot/docs/FIELD_OBSERVATION_READINESS_ASSESSMENT_2026-11-17.md`, `pilot/docs/MANUAL_ACCEPTANCE_TEST_REPORT_2026-11-17.md`, `pilot/docs/PHASE1_2_IMPLEMENTATION_REPORT_2026-11-17.md`, `pilot/docs/TELUGU_MICROPHONE_TEST_REPORT_2026-11-17.md`, `pilot/docs/screenshots/acceptance-2026-11-17/*` (5 PNGs), `research/instruments/LIVE_MICROPHONE_TEST_CHECKLIST.md`, `research/instruments/OUTSTANDING_BLOCKER_REGISTER.md`, `research/instruments/audio-data-retention-deletion-procedure.md`, `research/instruments/field-observation-readiness-checklist.md`, `research/instruments/recruitment-and-observation-procedure.md`
- **Note:** uncommitted docs created after this review began (e.g. `INDEPENDENT_RESEARCH_GOVERNANCE_EXECUTION_BOARD.md`, `PRIVATE_EVIDENCE_CHECKLIST.md`, `workflow-mapping-template.md`, `receiver-checker-verification-questions.md`, and this report) should receive the same pre-commit safety check (templates/frameworks; verify no contacts/approvals/PII/secrets before public commit).

## Overall assessment

- **No real sensitive records evidenced in reviewed text:** no executed consent forms, no participant names/IDs/contact details, no filled sign-off signatures/names/dates, no beneficiary/child data, no Aadhaar/credential material, no secrets found.
- **Placeholders and non-authorization notices used appropriately:** `[UNRESOLVED]`, template fields (`W__`, blanks), and draft/NOT APPROVED/NOT AUTHORIZED status reduce risk of false claims.
- **Primary concerns:** (1) **acceptance screenshots** — likely synthetic UI/test states but **not visually verified** (incidental on-screen PII/environment data cannot be excluded without human review); (2) **local environment/test artifact details** in some pilot reports (absolute path, localhost URLs/ports, local DB filename, synthetic draft IDs) — not PII, but may be unnecessary/sensitive to publish; (3) future commits must never add filled contacts, approvals/sign-offs with personal details, consent records, participant/linkage data, raw notes/audio/transcripts, DBs, logs, or recordings.

## Per-file recommendations

| File(s) | Sensitive details found | Recommendation |
|---|---|---|
| `research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md` | No contacts/approvals/PII; unresolved placeholders; process/framework detail only | **Public-OK with review** (draft framework; keep placeholders unresolved; do not add instance contacts/approvals without governance review) |
| `research/instruments/consent-script-te.md` | No approvals/contacts/PII; template fields and `[UNRESOLVED]`; clearly marked draft pending human review | **Public-OK with review** (keep "NOT APPROVED FOR USE/pending human review"; never commit executed/signed forms) |
| `research/instruments/note-template.md` | No real records/PII; anonymization guidance; template consent/handling fields only | **Public-OK** (template). Filled session notes are research records — keep private if any linkable/contextual detail |
| `pilot/docs/BUGS_AND_ISSUES_2026-11-17.md` | Synthetic context; local test draft IDs (`draft_93b984b92ddf`, `draft_4e149cfdabd4`) noted | **Public-OK with review** (confirm synthetic/local IDs acceptable to disclose; no DB committed) |
| `pilot/docs/FIELD_OBSERVATION_READINESS_ASSESSMENT_2026-11-17.md` | No contacts/approvals/PII; states NOT AUTHORIZED/unresolved; includes local repo path reference | **Public-OK with review** |
| `pilot/docs/MANUAL_ACCEPTANCE_TEST_REPORT_2026-11-17.md` | Local absolute path, localhost URLs/ports, local DB path/name, synthetic draft IDs/utterances; no PII/credentials | **Prefer private/internal or sanitize before public** (highest environment specificity) |
| `pilot/docs/PHASE1_2_IMPLEMENTATION_REPORT_2026-11-17.md` | No contacts/approvals/PII; unresolved requirements listed | **Public-OK with review** |
| `pilot/docs/TELUGU_MICROPHONE_TEST_REPORT_2026-11-17.md` | Local URLs/OS/automation context; no PII/credentials; no speech performed | **Public-OK with review** |
| `pilot/docs/screenshots/acceptance-2026-11-17/*.png` (5) | **Not visually verified** (binary); filenames/context suggest synthetic UI states, but incidental on-screen data cannot be excluded | **Do not commit to public repo by default** — keep private/internal or commit only after **human visual review** of every image and redaction/cropping of any browser chrome, local URLs/paths, IDs, notifications, usernames, or other sensitive/contextual details |
| `research/instruments/LIVE_MICROPHONE_TEST_CHECKLIST.md` | Template/checklist; blank tester/sign-off fields; no secrets/recordings | **Public-OK** (completed checklists with names/devices/logs/screenshots require review before public commit) |
| `research/instruments/OUTSTANDING_BLOCKER_REGISTER.md` | No actual contacts/approvals; tracks unresolved/missing evidence | **Public-OK with review** (do not add real contact PII or confidential determinations without approval) |
| `research/instruments/audio-data-retention-deletion-procedure.md` | Draft framework; unresolved instance specifics; no PII/secrets | **Public-OK with review** |
| `research/instruments/field-observation-readiness-checklist.md` | Template/checklist; no PII; references unresolved blockers | **Public-OK** |
| `research/instruments/recruitment-and-observation-procedure.md` | Draft, not authorized; no contacts/PII | **Public-OK with review** |

## Public vs private boundary (recommended)

| Public repository (after review/redaction as noted) | Private/off-repo approved storage (restricted) |
|---|---|
| Anonymized research materials, reusable templates, draft frameworks, protocols/consent drafts with placeholders (no approvals/contacts/PII), public-safe findings and code docs | Participant identities/contact details, consent records/signatures, approvals/sign-offs with personal details, withdrawal/linkage records, completed safeguarding/incident contacts/pathway details, raw notes/audio/transcripts, local DBs (`pilot.db`), logs/runtime exports, credentials/secrets, photos of people/children or screens with real/sensitive data, unredacted screenshots/test artifacts |

## Never commit (reinforced)

- Raw audio/recordings, session transcripts tied to participants, filled consent forms/signatures, participant/linkage lists
- Session notes with real observations or linkable/contextual details
- Local databases (`pilot.db`), logs, runtime exports, `.env`/secrets/credentials
- Photos/videos of people/children or beneficiary/government-account screens
- Unredacted screenshots that may contain incidental PII, usernames, paths, URLs, IDs, or notifications

## Addendum — 2026-11-17 (post-review artifacts)

- **New public-safe doc (reviewed, synthetic/evidence-based):** `pilot/docs/CONFIRMATION_STATE_BROWSER_VERIFICATION_2026-11-17.md` — automated browser UI verification (Playwright Chromium) of confirmation-state fix; no PII/secrets/recordings; clearly distinct from physical Chrome microphone acceptance (still incomplete). Contains local URLs/synthetic draft IDs consistent with prior pilot test docs.
- **New screenshots (synthetic automated UI captures):** `pilot/docs/screenshots/acceptance-2026-11-17/t2-test1-invalid-confirm.png`, `t2-test2-valid-confirm-done.png`, `t2-test3-done-unconfirmed.png`, `t2-test4-history.png` — localhost pilot UI with synthetic values. **Unreviewed for public commit by human visual inspection; exclude from commit by default** (or include only after human review/redaction if needed).
- **Unfilled working checklist copy:** `research/instruments/LIVE_MICROPHONE_TEST_CHECKLIST_chrome_2026-11-17.md` — template values/empty fields; no personal data, no recordings. Public-safe if included as template.
- **Runtime logs:** `_backend_err.log`, `_backend_out.log` created during local runs contained local request traces; **removed** and must not be committed.

## Required actions before any public commit/push

1. **Human visual review** all acceptance/verification screenshots (including any `t2-*` images) if considering public commit; **exclude by default** if unreviewed.
2. **Sanitize or keep private** pilot acceptance/verification reports if absolute paths, localhost details, DB/draft identifiers, or environment specifics should not be public.
3. **Verify** no filled contacts, approvals/sign-offs, legal determinations, consent records, or participant data added to instruments/reports.
4. **Confirm** `.gitignore`/local hygiene excludes DBs, logs, env files, recordings, and runtime artifacts (do not stage them).
5. Re-run this safety check for any newly created/modified docs before commit.

**No files were deleted or rewritten as part of this review (except removal of transient local log files noted above).** Participant observation remains **NOT AUTHORIZED**.