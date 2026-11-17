# Telugu Microphone Test Report (Pilot)

**Date:** 2026-11-17  
**Project:** `D:\GramVaani` pilot (`http://localhost:3010`, backend `http://127.0.0.1:8010`)  
**Tester/environment:** automated inspection in local Windows environment via Playwright/browser snapshots + backend capability/API checks. **No human tester spoke into a microphone during this run.**

## Objective and constraints

Assess microphone permissions, recording/pause/resume/stop/playback, and natural Telugu / Telugu–English code-mixed speech flow, including transcript review/correction and report generation.  
**Constraint respected:** do not claim speech accuracy without a measured evaluation (D-12).

## What was actually tested/observed

| Check | Method | Observation | Status |
|---|---|---|---|
| Speak screen availability and recorder UI structure | Playwright navigation + accessibility snapshot (`/speak`, mobile viewport) | Page rendered "మీ మాటలు చెప్పండి"; recorder region present with Ready state, timer `00:00`, mic/start button ("మాట్లాడండి"), Pause/Stop controls present (disabled in idle), Continue/Review control present with guidance; safety banner visible. | **PASS (UI present)** |
| Continue gating logic (no premature continue during active recording) | Code inspection + UI state (idle) + prior implementation changes | Continue disabled while recording/paused/busy per implementation; active recording state could not be exercised without live mic stream in automation. | **PARTIAL (implemented, not live-exercised)** |
| Backend ASR capability reporting | `GET /api/asr/capabilities` | `default_provider=browser`, browser/client mode available/configured, requires mic permission + browser support, notes variability for `te-IN`/accent/noise; `faster_whisper` unavailable (package/model not installed); `cloud_http` unavailable (unconfigured credentials/provider); `manual` available. | **PASS (reported truthfully)** |
| Transcript submission/review/extract/report flow with synthetic text (proxy for post-recognition path) | API workflow tests (synthetic Telugu text) | Submit-text → extract (grounded) → edit/re-extract → confirm/save/export worked; corrections/explicit confirmation enforced. Demonstrates downstream flow when transcript is available, not mic/STT quality. | **PASS (downstream flow)** |
| Playback/re-record controls in live session | Not executable without real recording | Not observed in this run. | **NOT PERFORMED** |
| Natural Telugu speech recognition | Not performed | No human speech input provided. | **NOT PERFORMED** |
| Telugu–English code-mixed speech recognition | Not performed | No human speech input provided. | **NOT PERFORMED** |
| Transcript correction and report generation from real STT output | Not performed with real STT | Downstream correction/report path verified with synthetic transcripts only. | **PARTIAL** |

## Browser, OS, ASR path, and limitations (observed/reported)

| Dimension | Details |
|---|---|
| **Browser (automation)** | Playwright-controlled Chromium session used for UI inspection/screenshots (headless/automated context). Real user-browser behavior (Chrome/Edge on target device) **not validated** in this run. |
| **OS** | Windows (local dev environment). Mobile device/Android Chrome behavior **not tested**. |
| **ASR paths available (current config)** | **Browser/client Web Speech (default, available):** recognition runs client-side when supported; accuracy/accent/noise robustness and Telugu coverage vary by browser/device/network and are **not guaranteed**. **Manual transcript:** available fallback. **Local faster-whisper:** unavailable (not installed/configured). **Cloud HTTP ASR:** unavailable (not configured/no credentials). |
| **Microphone permissions** | `getUserMedia` permission flow requires real user gesture and browser permission prompt in a supported context; **not exercised** in automated run. Denial/unsupported-browser error states exist in implementation but not manually triggered/verified here. |
| **Recording controls** | UI exposes start, pause, stop and status/timer elements; playback/re-record behavior depends on actual captured media stream — **not exercised**. |
| **Speech accuracy** | **Not measured.** No consented corpus, no real utterances, no WER/CER/field accuracy from real speech collected in this run (D-12). |

## Actual observed limitations

1. **No live human microphone/speech test performed:** cannot confirm end-user mic permission prompt behavior, actual audio capture quality, pause/resume continuity, stop/finalization timing, or playback on target browser/device.
2. **No natural Telugu or Telugu–English code-mix recognition observed:** STT accuracy, latency, accent/noise robustness, and numeric/term recognition remain **unverified**.
3. **Client ASR variability:** browser Web Speech support for `te-IN` depends on browser/OS/network; server-side ASR options not configured in this environment.
4. **Automation constraints:** Playwright session cannot substitute for real device mic interaction; mobile touch/real Android Chrome behavior untested.
5. **Real-corpus evaluation not available:** comparison harness/metrics exist but no measured real-speech results produced.

## Required manual microphone acceptance (to complete)

Perform on the **actual target browser/device** (recommended: Android Chrome and/or desktop Chrome/Edge, as available), with synthetic/non-identifying content only:

1. Open `/speak`, grant microphone permission; confirm prompt/allow flow and clear status.
2. Record natural Telugu utterance; verify timer/status, **pause/resume**, **stop/finalization**, and **playback**.
3. Re-record and perform **two consecutive takes with deliberately different numbers**; confirm prior audio/transcript/derived state does not carry over and Continue remains gated until finalized.
4. Test Telugu–English code-mixed utterance; review transcript, correct errors, re-extract, complete clarification/explicit confirmation, and generate/export sample report.
5. Deny permission / use unsupported context to verify safe, clear errors (no fabricated transcript).
6. Record **browser name/version, OS/device, ASR path used, network conditions, failures, and observed limitations** (timestamps/screenshots as appropriate). Do **not** claim accuracy without measured evaluation.

## Conclusion

**Microphone/speech acceptance: INCOMPLETE.** UI and capability plumbing are present and downstream transcript/report flow works with synthetic input, but **real Telugu and code-mixed speech capture/recognition was not performed** in this run. Live device/browser manual testing is required before relying on the voice path. No speech accuracy claimed.

**Note (2026-11-17, separate verification):** automated browser UI verification of the frontend confirmation-state fix (Playwright Chromium; synthetic data) was completed and documented in `CONFIRMATION_STATE_BROWSER_VERIFICATION_2026-11-17.md`. This is **distinct from** physical Chrome/device microphone acceptance — actual microphone permissions, recording/pause/resume/stop/playback, and natural/code-mixed speech capture on real hardware **remain not performed/incomplete**. No recordings retained.