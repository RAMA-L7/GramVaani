# Manual Acceptance Test Report (Pilot)

**Date:** 2026-11-17  
**Project:** `D:\GramVaani` (pilot track)  
**Branch/commit context:** `main` at `b8dee39` (`HEAD==origin/main`, clean working tree at start/end of this run except untracked local acceptance artifacts/logs not committed)  
**Tester:** automated/API-assisted + browser UI inspection (Playwright) in local environment; **no live human Telugu microphone speech performed** (see microphone report)  
**Scope:** manual application acceptance per readiness objective (critical confirmation/recording-isolation focus), using **synthetic/non-identifying data only**. No real participant/beneficiary data, no credentials.

## Environment

| Item | Observed |
|---|---|
| OS | Windows (win32), local dev machine |
| Backend | FastAPI (uvicorn) on `http://127.0.0.1:8010`, health `{"status":"ok","pilot":true,"sandbox":false}` |
| Frontend | Next.js dev server on `http://localhost:3010`, HTTP 200 |
| Pilot config/DB | `pilot/config/pilot-fields.json` (pilot-only, unverified); local SQLite `pilot/backend/pilot.db` (**preserved**; existing records/draft IDs retained) |
| Browser automation | Playwright MCP (Chromium) for navigation/snapshots/screenshots (screenshots saved under `pilot/docs/screenshots/acceptance-2026-11-17/`) |

**DB preservation note:** existing 6 draft records present before testing were preserved (IDs unchanged). During acceptance, **2 additive synthetic test drafts** were created and retained in local DB: `draft_93b984b92ddf` (draft, invalid-confirm case) and `draft_4e149cfdabd4` (confirmed_sample, valid flow case). No existing records deleted or modified.

## Test summary

| Area | Result | Notes |
|---|---|---|
| Backend/frontend startup & health | **PASS** | Both services started locally and responded. |
| Strict confirmation rejection (`/api/confirm`, `/api/voice/confirm`) | **PASS** | Missing/false/string-valued confirmation and `sample_report` alternate path rejected with 400. |
| Invalid report on confirm remains editable draft | **PASS** | Saved as `draft` (not confirmed), validation errors returned, report confirmation not marked explicit; draft retrievable/exportable. |
| Two consecutive workflows with different numbers (API) | **PASS** | Independent submit/extract flows produced correct different values (12/12 vs 25/25); no cross-request carryover. |
| Transcript editing and re-extraction | **PASS** | Edited transcript re-extracted to updated values (26/26) with original transcript preserved in response. |
| Valid confirm/save/export labels | **PASS** | Confirmed sample saved, draft recoverable, export JSON generated; labels indicate not official/not submitted/experimental. |
| History and draft recovery (API + UI) | **PASS** | `/api/drafts/history` returned counts/records; UI history page rendered counts/day groups/records; Open/Edit navigated to report for selected draft (recovery UX observed). |
| Report/export safety labeling | **PASS (observed)** | UI/API show experimental/sample, not official, not submitted. |
| Mobile/desktop layout inspection | **PASS (visual smoke)** | Screenshots/snapshots captured for home (mobile), speak (mobile), review (desktop), history (desktop), report (desktop); layouts rendered without obvious breakage in captured states. |
| Real microphone permissions/record/pause/resume/stop/playback with human speech | **NOT PERFORMED** | Automated environment cannot perform live human mic interaction/speech; UI elements present (see microphone report). |
| Consecutive recording sessions UI isolation (live mic) | **PARTIAL (code/API + UI structure)** | Code fixes verified (session reset/invalidation, Continue gating); live two-take mic UI behavior not executed with real audio input in browser automation. |

**Overall (automated/API/UI-inspected scope):** critical confirmation and draft-safety paths **PASS**; history/draft recovery/export **PASS**; consecutive extraction/transcript-edit flows **PASS**. Live microphone/speech acceptance **incomplete** (separate report).

## Detailed results

### 1. Startup and health
- **PASS**: `GET /api/health` → `{"status":"ok","pilot":true,"sandbox":false}` (200). Frontend `GET /` → 200.

### 2. Strict confirmation and rejection paths
Synthetic payload (non-identifying): transcript/extractions/answers for confirm endpoints.

| Case | Endpoint | Expected | Actual | Result |
|---|---|---:|---:|---|
| Missing `explicit_confirmation` | `/api/confirm` | 400 | 400, explicit confirmation required | **PASS** |
| `explicit_confirmation=false` | `/api/confirm` | 400 | 400 | **PASS** |
| `explicit_confirmation="false"` (string) | `/api/confirm` | 400 | 400 | **PASS** |
| Missing `explicit_confirmation` | `/api/voice/confirm` | 400 | 400 | **PASS** |
| `explicit_confirmation="true"` (string) | `/api/voice/confirm` | 400 | 400 | **PASS** |
| `sample_report=true` alternate path (no explicit boolean true) | `/api/voice/confirm` | 400 | 400 | **PASS** |

### 3. Invalid report remains editable draft
- **PASS**: `POST /api/confirm` with `explicit_confirmation=true` but invalid/incomplete report data (`extractions=[]`, missing required answers) returned **200** with `validation.valid=false`, `report.status="draft"`, `report.confirmation.explicit_confirmation=false`, and saved `draft_id` (`draft_93b984b92ddf`).
- **PASS**: `GET /api/drafts/{id}` returned stored draft status `draft`.
- **PASS**: `GET /api/drafts/{id}/export.json` returned export payload (HTTP 200).

### 4. Consecutive workflows with deliberately different numbers (isolation)
- **Flow 1 (synthetic):** "ఈరోజు 12 మంది పిల్లలు వచ్చారు. భోజనం పెట్టారు 12 మందికి. ప్రీ స్కూల్ జరిగింది." → extracted `children_present=12`, `meal_count=12` (**PASS**).
- **Flow 2 (different numbers, consecutive):** "ఈరోజు 25 మంది పిల్లలు వచ్చారు. భోజనం పెట్టారు 25 మందికి. ఆరోగ్య తనిఖీ జరిగింది." → extracted `children_present=25`, `meal_count=25` (**PASS**); flow 1 values unchanged in comparison.
- **Interpretation:** backend extraction/submit paths are stateless per request and produced correct independent results. **UI-level consecutive recording isolation** (clearing previous transcript/audio/derived state across two live mic takes) is implemented in frontend code and structurally observed (session reset hooks, invalidation, Continue gating) but **not executed end-to-end with real mic recordings** in this run.

### 5. Transcript editing and re-extraction
- **PASS**: edited flow 2 transcript from 25→26 ("26 మంది... 26 మందికి") and re-extracted → `children_present=26`, `meal_count=26`, `original_transcript` preserved as prior original in request/response handling as tested.

### 6. Valid confirmation, draft save, recovery, export
- **PASS**: valid `POST /api/confirm` with `explicit_confirmation=true` and required fields/answers returned `validation.valid=true`, `report.status="confirmed_sample"`, labels `not_official=true`, `not_submitted=true`, `experimental=true`, `draft_id=draft_4e149cfdabd4`.
- **PASS**: draft retrieval returned stored confirmed sample; export JSON returned (contained draft id and `not_submitted` marker). History endpoint/ UI included the saved draft (counts increased; record visible in `/history`).

### 7. History and UI recovery
- **PASS (API):** `/api/drafts/history` returned `records`, `counts`, and period aggregations; created drafts appeared in records.
- **PASS (UI):** `/history` displayed counts (total/completed/draft-pending/corrected), day/week/month view controls, record statuses/timestamps/profile IDs, and Open/Edit actions.
- **PASS (UI recovery action):** clicking Open/Edit for `draft_93b984b92ddf` navigated to `/report` and loaded draft workflow state (report page rendered; draft had empty extracted fields as created, so "details empty" state observed — consistent with that invalid-draft record).

### 8. Mobile/desktop layout checks (visual smoke)
Screenshots captured (`pilot/docs/screenshots/acceptance-2026-11-17/`):
- `acceptance-home-mobile.png` (390x844)
- `acceptance-speak-mobile.png` (390x844) — recorder UI shows Ready state, mic/start control, disabled Pause/Stop, Continue control and guidance text
- `acceptance-review-desktop.png` (1280x900)
- `acceptance-history-desktop.png` (1280x900)
- `acceptance-report-desktop.png` (1280x900)

**Observed:** no obvious layout breakage in captured static states; safety banner ("experimental, not official, not submitted") present. Full responsive/touch usability on real devices not exhaustively validated.

## Reproducible bugs and issues

No **critical** functional failures reproduced in tested API/UI flows. See bug list document for observations and non-blocking notes.

## Residual risks / not completed

- Live browser microphone acceptance (permissions, real recording/pause/resume/stop/playback behavior, natural Telugu and Telugu–English speech recognition, correction flow on real STT output) **not performed**.
- End-to-end UI confirmation of **two consecutive live mic recordings** with different numbers and no stale state carryover **not performed** with real audio (code changes in place; requires manual browser/device test).
- Real-corpus ASR evaluation/accuracy (D-12) **not run**; no accuracy claims.
- Field validation/impact and official workflow compatibility remain **unproven**.

## Acceptance decision (for this run)

- **Critical confirmation and invalid-draft handling:** **PASS**
- **Draft recovery/history/export (tested paths):** **PASS**
- **Recording-isolation (backend/consecutive logic + frontend implementation):** **PASS (partial evidence)** — live mic UI confirmation still required
- **Overall readiness for first worker observation (app + process):** **BLOCKED by non-app and manual-verification prerequisites** (see readiness assessment and microphone report) — do **not** introduce pilot to worker before observation; do **not** collect real participant data.

*All tested outputs are experimental sample/local pilot records only — not official, not submitted, no government integration.*