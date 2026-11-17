# Live Microphone Test Checklist (Target Browser/Device)

**Date:** 2026-11-17  
**Purpose:** complete outstanding manual microphone acceptance on the **actual target browser/device** before relying on the pilot voice path.  
**Important:** This is **not** a prerequisite for observation-only field research (observe existing workflow without introducing GramVaani). Do **not** claim speech/recognition accuracy without a measured evaluation (D-12). Use **synthetic/non-identifying content only**.

## Test context (record actual values)

| Item | Value |
|---|---|
| Tester name/role |  |
| Date/time |  |
| Device model/type |  |
| OS + version |  |
| Browser + version |  |
| Network conditions |  |
| Pilot frontend URL |  |
| Pilot backend URL/health |  |
| ASR path used (browser Web Speech / local faster-whisper / cloud_http / manual) |  |
| Language(s) tested (`te-IN`, Telugu–English mix) |  |
| Build/commit/context tested |  |

## Preconditions

- [ ] Backend and frontend running and reachable; `/api/health` OK; ASR capabilities reviewed (`/api/asr/capabilities`).
- [ ] **Synthetic/non-identifying** test utterances prepared (no beneficiary/child details, no Aadhaar/IDs, no credentials). Include cases with different numbers for consecutive-take isolation.
- [ ] Environment quiet/controlled as feasible; note background noise conditions.
- [ ] If server ASR (local/cloud) is used: credentials/models configured intentionally and securely (no secrets committed). If not configured, verify clear non-fabricated error/status behavior.

## A. Permissions and basic recording controls

| # | Step | Expected | Actual / notes | Pass/Fail |
|---|---|---|---|---|
| A1 | Open `/speak`, initiate microphone/record | Browser permission prompt shown in supported context; clear UI state |  |  |
| A2 | Grant permission and start recording | Recording state visible, timer/status updates, controls appropriate |  |  |
| A3 | Pause recording | Paused state visible; timer/status behaves correctly |  |  |
| A4 | Resume recording | Recording resumes; state/timer consistent |  |  |
| A5 | Stop/finalize recording | Recording stops cleanly; finalization completes; captured audio available for playback (if supported) |  |  |
| A6 | Playback recorded audio | Audio plays back correctly (or clear limitation noted) |  |  |
| A7 | Re-record | Previous take replaced/reset as expected; no unintended carryover into new take |  |  |

## B. Consecutive recording isolation (critical)

| # | Step | Expected | Actual / notes | Pass/Fail |
|---|---|---|---|---|
| B1 | Complete take 1 with **number set A** (e.g. 12/12) and proceed to generate transcript/review | Transcript/extractions reflect take 1 only |  |  |
| B2 | Start a **new recording session/take 2** with **different numbers B** (e.g. 25/25) | Prior transcript/audio/derived state (extractions, answers, corrections, confirmation/report) cleared/invalidated for new take |  |  |
| B3 | Attempt Continue while recording/paused/not finalized | Continue blocked/gated with clear guidance |  |  |
| B4 | Finalize take 2 and proceed | Only take 2 content used; no stale values from take 1 |  |  |

## C. Speech and downstream workflow (synthetic content)

| # | Step | Expected | Actual / notes | Pass/Fail |
|---|---|---|---|---|
| C1 | Natural Telugu utterance (synthetic) | Transcript generated via selected ASR path or clear non-fabricated error/status; reviewable/editable |  |  |
| C2 | Telugu–English code-mixed utterance (synthetic) | Behavior observed and recorded; errors correctable in transcript |  |  |
| C3 | Transcript review/edit and re-extraction | Edits applied; extraction/clarification updated appropriately; no stale derived state |  |  |
| C4 | Clarification/corrections and **explicit confirmation** | Confirmation required; invalid cases handled safely (editable draft, not confirmed) |  |  |
| C5 | Generate/save/export sample report | Experimental/sample labels present; not official, not submitted; export works |  |  |

## D. Failure and edge cases

| # | Step | Expected | Actual / notes | Pass/Fail |
|---|---|---|---|---|
| D1 | Deny microphone permission | Clear, safe error/guidance; no fabricated transcript/success |  |  |
| D2 | Unsupported browser/context for chosen ASR path | Clear status/error; fallback/manual path behavior as designed |  |  |
| D3 | Empty/silent/failed capture or unavailable provider | Safe failure, clear message, no fabricated recognition |  |  |
| D4 | Interruptions (call/background/navigation) if applicable | Document behavior/limitations; no data loss beyond expected |  |  |

## Observations to record (required)

- Browser/device/OS/ASR path and configuration used
- Permission behavior and any prompts/issues
- Recording/pause/resume/stop/playback behavior and latency/finalization notes
- Natural Telugu and code-mix observations (qualitative; **no accuracy claims**)
- Consecutive-take isolation result (pass/fail with details)
- Failures, console/network errors (if available), and screenshots
- Limitations and reproducibility notes

## Outcome

| Overall result | ☐ PASS (voice path acceptable for controlled use) ☐ FAIL (critical issues) ☐ PARTIAL |
|---|---|
| Critical issues found |  |
| Blocks voice-path reliance? |  |
| Tester sign-off (name/date) |  |

*Attach screenshots/log excerpts as needed (no sensitive data, no recordings committed). Experimental sample outputs only — not official, not submitted.*