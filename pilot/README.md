# GramVaani Pilot (Real-Voice Prototype Track)

> **Research prototype — not an official record, not submitted, no government integration.** This pilot track is **separate from the frozen [sandbox](../sandbox/README.md)** and from Phase 0 field-research instruments. It is intended for controlled, consented exploration of voice-assisted draft preparation (D-12: voice remains a hypothesis until tested with real consented speech and measured correction effort). No government credentials, submission, or compatibility claims (D-11/ADR-006).

## Overview
The pilot track provides a space for:
- real microphone/voice-input experimentation in a **controlled, consented** setting,
- ASR approach comparison and evaluation on the **same consented corpus when available** (`evaluation/`),
- editable transcript and draft-preparation workflows (when scaffolded), keeping the transcript as source of truth,
- local-first development with synthetic/non-identifying data by default.

**Do not treat this as a validated, production, or officially endorsed system.** Claims must remain disciplined and evidence-backed.

## Architecture (current/planned)
- **Frontend** (`frontend/`): Next.js app (planned/scaffolded) for mic capture, transcript editing, draft preview, and evaluation views. Dev port **3010**.
- **Backend** (`backend/`): FastAPI service (planned/scaffolded) for sessions, ASR adapters, persistence, and APIs. Dev port **8010**.
- **Evaluation** (`evaluation/`): stdlib-first framework for WER/CER, number/field accuracy, correction/effort/latency/failure metrics, synthetic fixtures, and ASR comparison harness (browser Web Speech capture, local faster-whisper, cloud provider via config). Outputs JSON consumable by an Evaluation page.
- **Config/DB**: pilot-local `.env`/DB (e.g. `pilot.db*`), separate from sandbox state. Main field config remains [`../config/report-fields.json`](../config/report-fields.json) (unverified, not modified by pilot).
- **Scripts** (`scripts/`): `start-pilot.ps1`, `stop-pilot.ps1` for Windows-friendly local startup.

Ports are chosen to avoid sandbox conflicts (sandbox uses 8000/3000).

## Safety labels
- **Separate from sandbox:** sandbox remains frozen/simulated; pilot is the real-voice prototype track.
- **Pilot config/db:** local, pilot-scoped; no shared production state.
- **Synthetic/non-identifying:** development fixtures and demos must use synthetic data only; no beneficiary PII, no child photos, no government records.
- **No government integration:** no submission, no credentials, no scraping/automation of official systems, no "official compatibility" claims (D-11, ADR-006).
- **D-12:** do not claim voice/ASR accuracy, accent/noise robustness, or burden reduction without measured evidence on consented speech and correction effort.
- **Consent & safeguarding:** real recordings require explicit consent, withdrawal path, retention limits, and secure local handling per [`../research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md`](../research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md).

## Setup (Windows)
Prerequisites: Python 3.11+ with [uv](https://docs.astral.sh/uv/), Node.js with [pnpm](https://pnpm.io/). (Verified in dev: Node v26.7.0, pnpm 11.7.0, uv 0.5.9.)

```powershell
cd D:\GramVaani\pilot

# 1) Environment (never commit secrets/recordings)
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
# edit backend/.env for optional ASR providers; frontend defaults to http://localhost:8010/api

# 2) Backend
cd backend
uv sync
cd ..

# 3) Frontend
cd frontend
pnpm install
cd ..
```

## Startup
```powershell
cd D:\GramVaani\pilot
.\scripts\start-pilot.ps1
# optional: .\scripts\start-pilot.ps1 -BackendPort 8010 -FrontendPort 3010
# stop:    .\scripts\stop-pilot.ps1
```
If your environment blocks `pnpm` dev's pre-run install (ignored build scripts), start frontend directly:
```powershell
cd D:\GramVaani\pilot\frontend
& "C:\Program Files\nodejs\node.exe" .\node_modules\next\dist\bin\next dev --port 3010
```
- Backend API: **http://127.0.0.1:8010** (health: `/api/health`, caps: `/api/asr/capabilities`)
- Frontend app: **http://localhost:3010** (local URL to open and test)
- Evaluation (CLI): `cd evaluation; python score.py --fixtures`

## How to test the real microphone flow (controlled, consented)
1. **Prereqs:** backend+frontend running, open **http://localhost:3010** in Chrome/Edge (desktop or mobile-sized view). Use synthetic/non-identifying prompts only.
2. **Consent/safeguards:** no real recordings without required consent and storage safeguards. Do not enter child/beneficiary identifiers, Aadhaar, child photos, or government credentials. See `research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md`.
3. **Record:** Voice reporting → allow microphone → Start/Pause/Resume/Stop, observe timer/status → Playback → Re-record if needed.
4. **Transcribe (real, not simulated):** use **Browser Web Speech API** (`te-IN`, when supported) for client-side recognition and/or send recorded audio to a configured backend ASR provider. The app must not fake results; unavailable/misconfigured providers show clear status/errors.
5. **Review & correct:** Transcript workspace shows original + editable transcript (Telugu/mixed, English terms preserved). Edit incorrect words/numbers, run/re-run extraction to see grounded values with exact `source_span`.
6. **Confirm & report:** answer clarification questions, correct values, give **explicit confirmation**, generate the **experimental sample report** (not official, not submitted), save draft and export JSON.
7. **Failure handling:** verify safe behavior for mic permission denial, unsupported browser/provider, empty/unavailable transcription, and other recording/recognition failures.
8. **Data handling:** keep any consented audio local and gitignored; delete per protocol. Never commit recordings or secrets. Real ASR accuracy is unmeasured without a consented corpus (D-12).

## Known limitations / unresolved dependencies
- **Real Telugu ASR accuracy unmeasured** without a consented corpus; no accuracy claims fabricated.
- **Accent/noise/background conditions not claimed** or validated.
- **Cloud providers require credentials** and provider-specific adapters/SDKs (not bundled).
- **Local models may require download/compute** (e.g. faster-whisper model files, CPU/GPU resources).
- **No field validation (Phase 0):** extracted/entered fields are not validated against official requirements.
- **No public deployment / no worker invite:** local research prototype only.
- See [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) and [`docs/TEST_AND_VERIFICATION_REPORT.md`](docs/TEST_AND_VERIFICATION_REPORT.md).

## Documentation
- [`docs/TEST_AND_VERIFICATION_REPORT.md`](docs/TEST_AND_VERIFICATION_REPORT.md)
- [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md)
- [`evaluation/README.md`](evaluation/README.md)
- Root planning: [`../docs/FIELD_TESTING_PROGRAM.md`](../docs/FIELD_TESTING_PROGRAM.md), [`../docs/LIVE_PROTOTYPE_PLAN.md`](../docs/LIVE_PROTOTYPE_PLAN.md)
