# Pre-presentation checklist

Run the automated check, then the human checks. The demo uses a **simulated** microphone timer — no real
microphone, audio capture or upload is involved, so "microphone check" means confirming the UI button
responds, not that a device is recording.

## Automated

```powershell
cd D:\GramVaani
node sandbox/scripts/preflight.mjs
```

This checks: backend health, scenario API, frontend HTTP 200, the three demo scenarios, the unchanged main
field config (14 fields, all `unverified`), the illustrative sandbox config, absence of stale SQLite state,
and a clean working tree. Exit code 1 means stop and fix.

## Manual, immediately before presenting

- [ ] Backend started: `cd sandbox/backend && uv run uvicorn app.main:app --port 8000`.
- [ ] Frontend started: `cd sandbox/frontend && pnpm dev --port 3000`.
- [ ] Browser open at `http://localhost:3000`; banner **SIMULATED ENVIRONMENT** visible on every page.
- [ ] Microphone button starts and stops the timer (no audio is captured).
- [ ] `backend/sandbox.db` deleted so `/dashboard` starts empty.
- [ ] Backup screen recording present at `sandbox/demo-backup/demo.webm` (gitignored, local only).
      Regenerate with: `cd sandbox/tests && pnpm exec playwright test --config=playwright.record.config.ts`.
- [ ] Frozen scope respected — no feature changes; see [DEMO_FREEZE.md](DEMO_FREEZE.md).
- [ ] [SAFETY.md](../SAFETY.md), [DEMO_3MIN.md](DEMO_3MIN.md) and [QA_PREP.md](QA_PREP.md) read.
- [ ] Final slide or spoken line is the boundary statement from
      [RESULTS_SHEET.md](RESULTS_SHEET.md).

## Timed spoken rehearsal — human step

Machine execution verifies the sequence, not narration timing. Rehearse out loud against a clock using the
timecodes in [DEMO_3MIN.md](DEMO_3MIN.md): 0:00 framing, 0:20 normal, 0:55 correction, 1:30 failure,
2:00 retry/dashboard, 2:30 boundary. Record actual elapsed time here after rehearsal:

| Rehearsal | Date | Elapsed | Boundary statement delivered? |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
