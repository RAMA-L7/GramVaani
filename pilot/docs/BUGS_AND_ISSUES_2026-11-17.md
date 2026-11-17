# Bugs and Issues — Acceptance Readiness (2026-11-17)

**Date:** 2026-11-17  
**Context:** manual/API/browser acceptance run for GramVaani pilot (`b8dee39`) using synthetic/non-identifying data.  
**Scope:** reproducible issues observed in this run + noted risks/gaps requiring verification. No frozen sandbox or `config/report-fields.json` modified.

## Reproducible defects

| ID | Severity | Area | Description | Repro / evidence | Status |
|---|---|---|---|---|---|
| — | — | — | **No reproducible critical or high-severity functional defects** were observed in tested paths (strict confirm rejection, invalid-confirm-as-draft, API extraction/edit/re-extract/confirm/save/export, history API/UI rendering and open/edit navigation). | API test scripts (synthetic), Playwright UI snapshots/screenshots | N/A |

## Observations / non-blocking notes

| ID | Severity | Area | Description | Notes / suggested follow-up |
|---|---|---|---|---|
| OBS-1 | **Low (test-environment/documentation)** | History API contract | `/api/drafts/history` returns history payload under `records` (and `counts`/period aggregates), not `items`. This matched UI behavior and is consistent with current implementation; an initial ad-hoc test assumed `items`. | Not a runtime bug observed in UI. If external consumers/tests expect `items`, align contract/docs or add compatibility alias (out of scope for this readiness pass; no product feature change made). |
| OBS-2 | **Info** | Acceptance side-effect | Two additive synthetic test drafts were created in local `pilot.db` during acceptance: `draft_93b984b92ddf` (draft, invalid-confirm case) and `draft_4e149cfdabd4` (confirmed_sample). Existing records/draft IDs preserved. | Documented for traceability; retained to avoid modifying/deleting local records. Remove only with explicit user intent if cleanup is desired. |
| OBS-3 | **Medium (verification gap)** | Live mic UI flow | Consecutive live microphone recordings with different numbers and full permission/record/pause/resume/stop/playback behavior not executed in real browser/device context. | Frontend isolation/gating implemented and automated checks pass; **manual live verification required** (blocker for voice-path confidence, not a reproduced defect). |
| OBS-4 | **Medium (environment/config)** | Server ASR availability | `faster_whisper` and `cloud_http` unavailable in current environment (not installed/configured). Browser Web Speech remains default/available but device/browser dependent. | Expected given config; affects what can be tested, not an application defect. Configure only if/when credentials/models intentionally available (no secrets committed). |

## Changes made during this run

- **Application/code:** none (read-only testing/inspection against `b8dee39` behavior plus local server runs).
- **Research/instrument materials (documentation/readiness):** updated `research/instruments/note-template.md` (anonymized session note with explicit timing/consent/data-handling fields); added `research/instruments/field-observation-readiness-checklist.md`.
- **Deliverables added:** acceptance/mic/bugs/readiness reports and screenshots under `pilot/docs/` (uncommitted local artifacts).

## Severity key

- **Critical:** data loss, unsafe confirmation/submission behavior, PII/credential exposure risk, or blocking core workflow failure.  
- **High:** major workflow broken with no reasonable workaround.  
- **Medium:** important gap or verification blocker; workaround or pending manual validation.  
- **Low/Info:** minor/documentation/traceability observations.