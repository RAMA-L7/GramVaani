# Pilot Test and Verification Report

**Scope:** GramVaani `pilot/` — real-voice prototype track (separate from frozen sandbox and main research config).  
**Original report date:** 2026-11-16  
**Commit/context covered by sections "Environment/Commands run and results/Implemented/Not run/Manual acceptance steps/Notes" below:** repository state as exercised on 2026-11-16 (see command results recorded at that time; not independently reproduced in this addendum except where stated).  
**Principle:** factual record only. No fabricated recognition accuracy/results. Real speech evaluation requires a consented corpus (D-12) and was **not** run.

## Environment (observed)
- Windows PC, Node v26.7.0, pnpm 11.7.0, uv 0.5.9, git 2.54.0
- Local services verified running: backend **http://127.0.0.1:8010** (FastAPI), frontend **http://localhost:3010** (Next.js dev)
- Pilot config used: `pilot/config/pilot-fields.json` (`PILOT_UNVERIFIED`, `ILLUSTRATIVE_NOT_OFFICIAL`); main `config/report-fields.json` unchanged

## Commands run and results

| # | Command | Working dir | Result | Notes |
|---|---|---|---|---|
| 1 | `uv sync` | `pilot/backend` | **PASS** | Dependencies installed (`.venv` created); optional `faster-whisper` extra not installed |
| 2 | `uv run pytest -q` | `pilot/backend` | **PASS — 14 passed** | Config/loading, ASR capability & failure handling (no fake recognition), submit-text/extract/clarify/confirm flow, explicit confirmation required, grounded `source_span` checks, corrections/validation, drafts/export/feedback, evaluation summary read, audio upload cleanup/retention safeguards. 1 third-party `starlette.testclient` deprecation warning |
| 3 | `pnpm install` | `pilot/frontend` | **PASS** (with env policy warnings) | `esbuild` build scripts ignored by pnpm policy in this environment; deps installed |
| 4 | `node node_modules/typescript/bin/tsc --noEmit` | `pilot/frontend` | **PASS** (exit 0) | `pnpm` script runner hit ignored-builds install check in this env; direct binary used |
| 5 | `node node_modules/vitest/vitest.mjs run` | `pilot/frontend` | **PASS — 1 file, 5 tests** | `lib/utils.test.ts`: value coercion/stringify, span normalization/highlighting helpers |
| 6 | `node node_modules/next/dist/bin/next build` | `pilot/frontend` | **PASS** | Compiled successfully; static prerender for `/`, `/voice`, `/transcript`, `/preview`, `/test-scenarios`, `/evaluation`, `/feedback` |
| 7 | `node scripts/verify-structure.mjs` | `D:\GramVaani` (repo root) | **PASS** | Structure/config contract/links consistent (after adding pilot & planning docs) |
| 8 | Live backend smoke (HTTP) | local | **PASS** | `GET /api/health` 200; `/api/asr/capabilities` (4 providers: browser, faster_whisper, cloud_http, manual); `/api/scenarios` (3 synthetic); `/api/evaluation/summary` returns curated summary (`available:true`, `real_speech:false`, `status:no_real_speech_evaluation_run`) |
| 9 | Live workflow smoke (HTTP, transcript path) | local | **PASS** | `POST /api/transcribe/submit-text` (browser, `simulated:false`) → `POST /api/extract` (4 grounded extractions, gaps handled) with **all `source_span` values verified verbatim** → `POST /api/clarify` → `POST /api/voice/confirm` with `explicit_confirmation:true` + correction (`meal_count` 24→22) → sample report flags `not_official/not_submitted/pilot_unverified/experimental` true, draft saved → `GET /api/drafts/{id}/export.json` and `POST /api/export` OK. Also `/api/voice/transcribe` JSON client-transcript path OK |
| 10 | Live audio upload behavior (HTTP, multipart WAV) | local | **PASS (safe failure, no fake ASR)** | `POST /api/asr/transcribe` with `provider=manual` returned **400** with clear message: manual provider does not perform ASR and directed to submit transcript/choose available provider; no fabricated transcription returned. Temp audio cleanup/safeguards covered by tests |
| 11 | Backend/frontend started locally | `pilot/backend`, `pilot/frontend` | **PASS** | Backend: `uv run uvicorn app.main:app --host 127.0.0.1 --port 8010`. Frontend: direct `node node_modules/next/dist/bin/next dev --port 3010` (used because `pnpm dev` retriggered install with ignored-builds failure in this env). Frontend responded HTTP 200 |
| 12 | PowerShell script validation | `pilot/scripts` | **Partial** | `stop-pilot.ps1` fixed (read-only `$pid` variable issue) and `start-pilot.ps1` updated to prefer direct Node/Next binary when available. Full PSScriptAnalyzer lint not run (tool not installed). Startup observed via direct commands above |

## Implemented (key scope)
- **Real microphone (frontend):** `getUserMedia` + `MediaRecorder` with start/pause/resume/stop, duration/status, playback, re-record; permission/unsupported/interruption/error handling; mobile-first UI.
- **ASR (provider-independent, D-12):** capabilities/registry with **3+ practical approaches** — (A) browser Web Speech API/client transcript capture (`te-IN`, real path in supported browsers), (B) local `faster_whisper` (optional dep/model, configurable), (C) configurable cloud HTTP adapter path (Google/Azure/Sarvam/generic via env; credentials required, no keys bundled), plus manual/none fallback. No fabricated recognition; unavailable/misconfigured providers return clear errors/status.
- **Transcript workspace:** original preserved, fully editable, re-record/correct, re-extraction from edited text.
- **Reporting workflow:** grounded extraction with exact `source_span`, clarification for missing/ambiguous, corrections, **explicit confirmation required**, structured **experimental sample report** (not official/not submitted), draft save and JSON export. Pilot-only config/db (`pilot-fields.json`, `pilot.db` gitignored).
- **Evaluation framework:** WER/CER, number/field accuracy, correction frequency/effort, latency, failure rate; synthetic fixtures (Telugu/mixed, numbers, terminology, speed/pauses/incomplete); compare harness/config for 3 approaches on same consented corpus when available; curated `results/summary.json` states **no real speech evaluation run**.
- **Pages:** Home, Voice reporting, Transcript review, Report preview, Test scenarios, Evaluation results, Research feedback. Safety banners/labels present.
- **Safety/architecture:** separate `pilot/` track, sandbox untouched, no govt integration/submission/credentials, synthetic/non-identifying testing, no recordings committed, `.env`/db/audio/tmp gitignored.

## Not run / not completed (and why)
- **Full 15-step browser acceptance with a human speaking Telugu into the microphone:** requires interactive browser UI, user mic permission, and a real spoken utterance in a supported environment. I verified the running app, implemented `MediaRecorder` + browser Web Speech + backend transcription/upload pipeline and end-to-end APIs, but **I cannot personally perform the human speech/GUI interaction** in this environment. **This must be completed by you at http://localhost:3010** (steps and expected behavior below).
- **Real Telugu ASR accuracy/quality measurement:** **not run** — no consented real-speech corpus available. No accuracy results fabricated (D-12). Cloud/local-model transcription not exercised with real credentials/models.
- **Field validation / impact:** not claimed (Phase 0 open).
- **Public deployment / worker invite:** intentionally not done.

## Manual acceptance steps for you (browser, required)
1. Open **http://localhost:3010** (phone-sized responsive view recommended). Ensure backend is running on **http://127.0.0.1:8010**.
2. Go to **Voice reporting**, allow microphone permission, tap Start/record, speak a natural Telugu (or Telugu–English mixed) sentence, pause/resume if desired, then Stop. Confirm timer/status updates.
3. Play back the recorded audio and re-record if needed.
4. Generate a transcript: use **Browser Web Speech API** (real-time, supported in Chrome/Edge; select `te-IN` if shown) and/or send recorded audio to a configured backend ASR provider. Verify Telugu transcript appears (or a clear, non-faked error/status if provider unavailable/misconfigured).
5. Open **Transcript review**, edit an incorrect word/number, and run/re-run extraction (grounded `source_span` shown).
6. Continue to **Report preview**: answer clarification questions for missing/ambiguous info, correct values, give **explicit confirmation**, and generate the structured **experimental sample report**.
7. Save draft and **export JSON**. Verify sample report is labeled experimental/not official/not submitted.
8. Exercise failure handling: deny mic permission / use unsupported provider / submit empty audio or unavailable ASR and confirm safe, clear errors (no fake transcript/success).

## Notes on ASR configuration
- **Browser Web Speech API:** no server credentials; depends on browser/OS/network support for `te-IN` (commonly Chrome). Real-time client capture path is implemented.
- **Local faster-whisper:** optional; install extra/deps and configure model in `pilot/backend/.env` (e.g. `FASTER_WHISPER_MODEL=small`); first run may download model and requires compute.
- **Cloud providers:** set `CLOUD_ASR_PROVIDER`, endpoint/key/project/region in `pilot/backend/.env` (see `.env.example` and `pilot/backend/README.md`). Without valid credentials/config, endpoints return explicit configuration-required errors (no fabricated results). Do not commit secrets.

## Addendum — 2026-11-17 correctness/documentation fix batch (repository-reported)

**Commit/context covered:** uncommitted working tree on top of `02075b3` (`HEAD==origin/main` at time of checks) in `D:\GramVaani`. Not committed/pushed as part of this addendum; see `git status`/diff for exact file changes.

**Changes in this batch (scope):** observation/run-sheet timing definitions aligned (start at first action to prepare selected report; finish after required submission/checking/corrections), active/waiting/unrelated interruptions and non-overlapping D-10 category guidance; `/api/confirm` and `/api/voice/confirm` require strict boolean `explicit_confirmation===true` only (no coercion, no `sample_report` alternate path) and invalid confirmed attempts are saved as editable `draft` (not `confirmed_sample`) with validation errors and unconfirmed report state; frontend recording workflow adds distinct recording session handling, clears/invalidate stale transcript-derived state on new recording or transcript change, and disables Continue while recording/paused/busy; extraction adds heuristic confidence labeling plus supporting phrase/evidence (including per-activity/per-item spans and label/negation context where applicable); evaluation harness avoids fabricated imported-browser latency (captured timing only), separates/reuses faster-whisper model startup for warm transcription, and metrics track numerical insertions and wrong-field numeric assignments; root README status reconciled and report-labeling clarified.

**Checks rerun (this batch):**
- `cd pilot/backend && uv run pytest -q` → **PASS — 15 passed** (1 warning: `StarletteDeprecationWarning` from `starlette.testclient/httpx`).
- `cd pilot/frontend && npx tsc --noEmit` → **PASS** (exit 0).
- `cd pilot/frontend && npm test --silent` → **PASS — 1 file, 5 tests passed** (`lib/utils.test.ts`).
- `cd pilot/frontend && npm run build` → **PASS** — compiled successfully, 21 routes including `/history`.

**Not performed in this addendum:** live human browser microphone acceptance with natural Telugu speech, real-corpus/consented ASR evaluation and latency/accuracy measurement (D-12), and Phase 0 field validation/impact. Manual end-to-end UI confirmation of consecutive different recordings (no stale transcript/extractions/answers/confirmation) and invalid-confirm-as-editable-draft behavior in the running app is recommended before worker testing. All outputs remain experimental sample/local pilot records only — not official, not submitted, no government integration.
