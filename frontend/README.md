# Frontend (not scaffolded)

Next.js + TypeScript + Tailwind, mobile-web-first, Telugu UI with English secondary labels.
**No code exists yet.** Nothing here runs.

## Why it is empty

Phase 0 is research. Building screens before the field set is known would bake in guesses. See
[DEVELOPMENT_ROADMAP.md](../docs/DEVELOPMENT_ROADMAP.md).

## Planned structure

```
frontend/
├── app/                      # routes: / (record), /transcript, /review, /preview
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── recorder/             # record button, level meter, timer, cancel
│   ├── transcript/           # editable transcript, low-confidence marks
│   ├── clarification/        # one question per screen
│   ├── confirmation/         # value + source span + confirm/correct
│   └── preview/              # printable draft, mandatory footer
├── lib/
│   ├── api.ts                # typed client for the backend
│   ├── strings.te.ts         # UI chrome in Telugu (NOT field labels — those come from config)
│   └── format.ts             # dates, numbers, Telugu digits if needed
└── public/
```

## Rules

- **No field labels in components.** Labels come from `config/report-fields.json` via the backend.
- **No direct model calls.** All ASR/extraction goes through the backend so audio handling stays in one place.
- **The footer is mandatory** and not configurable: *"research prototype — not an official record — not
  submitted"*.
- **No submit/send/share-to-app action** exists anywhere in the UI.
- Offline capture and editing are first-class; transcription may queue.

## When it gets scaffolded (Phase 2)

```powershell
cd D:\GramVaani\frontend
pnpm create next-app@latest . --ts --tailwind --app --eslint --src-dir false --import-alias "@/*"
pnpm dlx shadcn@latest init
```

Verify with `pnpm dev`, then add the recorder first and nothing else.
