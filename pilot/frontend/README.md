# GramVaani Pilot Frontend

Experimental, mobile-first Next.js + TypeScript pilot frontend for the GramVaani voice reporting workflow. This app is **separate from the frozen sandbox frontend** and must not modify sandbox or main configs.

> **Important:** This is an experimental pilot for research/testing with synthetic or non-identifying data only. It has **no government integration or submission**. Any generated report is a clearly labeled **sample/experimental report**.

## Features

- **Real microphone workflow** (`getUserMedia` + `MediaRecorder`): start, pause, resume, stop, timer/status, playback, and re-recording with permission/unsupported/error handling (Telugu + English messages).
- **Speech recognition paths**
  - **Browser Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`, `te-IN`) when supported for client-side real-time recognition.
  - **Pilot backend ASR endpoints** (audio upload or provider request) based on `/api/asr/capabilities`.
  - Provider/capability UI shows availability/credential requirements and never pretends recognition works when unavailable.
- **Transcript workspace**: editable Telugu/mixed text, original transcript preserved, re-recording, re-run extraction/corrections.
- **Reporting workflow** (backend-connected): extraction, grounded values with exact source spans, clarification questions, corrections, explicit worker confirmation, structured **sample report** preview, draft saving, and JSON export.
- **Research/testing pages**: synthetic test scenarios, evaluation results summary (distinguishes synthetic/simulated vs real speech; shows no real results when absent), and feedback form.
- Persistent pilot banner and sample-report labeling throughout.

## Routes

- `/` Home
- `/voice` Voice reporting (recording + provider selection + transcription)
- `/transcript` Transcript review/editing and extraction
- `/preview` Clarifications, explicit confirmation, sample report, draft save, JSON export
- `/test-scenarios` Synthetic test utterances/transcripts loader
- `/evaluation` Evaluation summary/metrics from backend
- `/feedback` Research feedback form

## Prerequisites (Windows)

- Node.js 18+ (LTS recommended)
- `pnpm` installed globally (e.g. `corepack enable` or `npm i -g pnpm`)
- Pilot backend running and reachable (default expected: `http://localhost:8010/api`)

## Setup

```powershell
cd D:\GramVaani\pilot\frontend
pnpm install
copy .env.example .env.local
# edit .env.local if your backend base differs
pnpm dev --port 3010
```

Open: http://localhost:3010

### Environment

- `NEXT_PUBLIC_API_BASE` - pilot backend API base, e.g. `http://localhost:8010/api`

## Scripts

- `pnpm dev` - start dev server
- `pnpm dev --port 3010` - recommended pilot port
- `pnpm build` - production build
- `pnpm start` - start production server
- `pnpm typecheck` - TypeScript check (`tsc --noEmit`)
- `pnpm test` - lightweight unit tests (vitest) for utils/helpers

## Expected backend API conventions

Frontend is designed to coordinate with pilot backend endpoints such as:

- `GET /health`
- `GET /asr/capabilities`
- `POST /voice/transcribe` (JSON or multipart audio upload)
- `POST /voice/extract`
- `POST /voice/clarify`
- `POST /voice/confirm`
- `POST/GET /drafts` (and optional `GET /drafts/:id`)
- `POST /export`
- `POST /feedback`
- `GET /evaluation/summary`
- `GET /scenarios` (test scenarios; UI also includes local synthetic fixtures)

The typed client in `lib/api.ts` is tolerant of common response shapes, but backend contracts should be aligned for full functionality.

## Notes

- No API keys or credentials in frontend. Provider credentials/configuration are backend responsibilities.
- Browser microphone and Web Speech API support vary by browser/OS; the UI reports capability and errors clearly.
- Sample reports are experimental outputs for pilot evaluation only - not official and never submitted.
- Workflow state is persisted locally in browser storage for convenience during the pilot.
