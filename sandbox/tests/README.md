# GramVaani Sandbox tests

This directory holds the end-to-end (Playwright) tests and their documentation.
All content is synthetic: no real speech, no audio uploads, no beneficiary data.
For the full scenario catalogue see [TESTING.md](TESTING.md).

## Layout

- `e2e/flow.spec.ts` — Playwright tests of the `/voice` flow.
- `playwright.config.ts` — standalone Playwright config (base URL `http://localhost:3000`).
- `TESTING.md` — scenario table and how to run every test layer.

## 1. Start the backend

From `sandbox/backend` (uses `uv` and its own `.venv`):

```
uv run uvicorn app.main:app --reload --port 8000
```

Health check: `http://localhost:8000/api/health` should return
`{"status":"ok","sandbox":true}`.

## 2. Start the frontend

From `sandbox/frontend`:

```
pnpm install
pnpm dev
```

The app is served at `http://localhost:3000`. Open `/voice` to see the
scenario picker populated from the backend.

## 3. Run Playwright

From `sandbox/` (the config locates `tests/e2e` automatically):

```
npx playwright install chromium
npx playwright test --config=tests/playwright.config.ts
```

Both servers must already be running. The tests use their own random
idempotency keys, so re-running them does not create duplicate submissions.

## Notes

- The simulated microphone only starts a timer and loads a scripted transcript;
  no audio is captured or uploaded.
- Each browser page uses its own idempotency keys, so the network-failure retry
  test always starts from a fresh attempt counter.
- The UI shows a persistent "SIMULATED ENVIRONMENT" banner; all reports are
  synthetic and never leave the sandbox gateway.
