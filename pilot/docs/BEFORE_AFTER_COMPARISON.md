# Pilot Frontend — Before/After Comparison (Worker-Simplification Redesign)

**Date:** 2026-11-16  
**Scope:** `D:\GramVaani\pilot\frontend` (separate from frozen sandbox).  
**Evidence basis:** Pre-redesign source audit (`UI_AUDIT.md`, captured routes/components/flows/styles), implemented redesign, automated checks/build, and **after** screenshots in `pilot/docs/screenshots/after/`.  
**Note:** Pre-redesign (“before”) live screenshots were **not captured in this redesign session**; comparison below is factual from the audited prior implementation vs the redesigned implementation and after-state screenshots. Usability improvement is **not validated without real worker testing**.

## 1. Navigation and information architecture

| Aspect | Before (audited) | After (implemented) |
|---|---|---|
| Worker navigation | Sticky header with **7 equal links** (Home, Voice, Transcript, Report, Scenarios, Evaluation, Feedback) visible at all times | **Minimal worker shell**: brand + discreet “పరిశోధకులు / Researcher” link only; **no multi-item worker menu**. Guided step flow. |
| Researcher/dev tools | Mixed into primary nav and home tiles (scenarios, evaluation, feedback) | **Separate area** `/research/*` with own layout/nav (Overview, Diagnostics, Scenarios, Evaluation, Feedback) |
| Entry point | Home offered multiple tiles/CTAs (voice, transcript, report, scenarios, evaluation, feedback) | Home offers **one primary action**: large “మాట్లాడండి” (speak) CTA + simple 4-step explanation |

## 2. Worker journey and screens

| Requested screen | Before | After |
|---|---|---|
| Home | Mixed workflow/testing/research tiles, English-heavy | Telugu-first welcome, one prominent mic button, minimal steps, compact pilot boundary note (`/`) |
| Recording | `/voice`: provider dropdown/capabilities, browser STT toggle, technical metadata, recorder controls mixed together | `/speak`: large recorder state/indicator, clear start/pause/stop, timer, simple instructions, plain permission/error messages, playback/re-record; **technical provider selection hidden** (auto best path; diagnostics in research) |
| Transcript | `/transcript`: editable text + extraction controls/results, spans/confidence/gaps/ambiguities, multiple actions | `/review`: large readable Telugu text, simple edit, original reference (collapsed), re-record/listen-again path, **one primary Continue** |
| Clarification | In `/preview` flow: load questions button, sequential card, technical context mixed | `/questions`: **one question at a time**, simple Telugu prompt, large selectable answers, voice-or-text answer option, progress indicator |
| Report | `/preview`: long page with extractions/corrections/clarifications/confirmation/report/draft/export and technical details (idempotency key, raw-ish states) | `/report`: clean field cards, **missing/uncertain highlighted** in plain language, editable values, explicit confirmation checkbox, clear experimental/not-official/not-submitted labeling |
| Completion | No dedicated completion screen (result shown in preview context) | `/done`: clear success status, sample-report summary, **view/correct, save draft, export sample report**, return home |

## 3. Language, clarity, and simplicity

| Aspect | Before | After |
|---|---|---|
| Language | English-first UI chrome/instructions; mixed Telugu/English and technical terms | **Telugu-first** labels/actions/headings with concise English support where helpful |
| Terminology | Exposed `getUserMedia`/`MediaRecorder`/Web Speech API/capabilities/provider IDs/modes/credentials/confidence/span offsets/idempotency keys/raw JSON | Worker UI uses plain status/action language; **technical diagnostics moved to `/research/diagnostics`** |
| Actions per screen | Multiple competing controls and secondary actions | **One primary action emphasized per screen** with limited secondary options |
| Cognitive load | Dense cards/tables/JSON/metadata across long pages | Stepwise flow, progressive disclosure, minimal on-screen information |

## 4. Visual/accessibility/usability-oriented changes

| Aspect | Before | After |
|---|---|---|
| Touch targets & typography | 44px buttons baseline but many compact controls/nav items; smaller text in dense areas | **56px+ primary controls**, very large mic CTA, larger base text (18px), generous spacing |
| Contrast & states | Functional but mixed emphasis; technical error text | High-contrast tokens, semantic status chips/notices, clear recording/paused/processing/success/error states |
| Mobile layout | Responsive breakpoints present but content-dense and nav-heavy | Mobile-first single-column cards, simplified headers, reduced scrolling complexity per step |
| Accessibility support | Some labels/aria-live present; complex sequences | Semantic structure, visible focus, `aria-live`/alerts/pressed states where relevant, `prefers-reduced-motion` respected, large tap areas |
| Motion/dependencies | Minimal pulse animation; no UI libs | No new UI/animation libraries added; lightweight custom CSS (no Magic UI/shadcn/Radix) |

## 5. Functionality preserved (no regression intended)
- Real microphone recording (start/pause/resume/stop), duration/status, playback, re-record (`getUserMedia` + `MediaRecorder`).
- Browser Web Speech API (`te-IN`) path and backend ASR adapter integration (`/api/asr/capabilities`, `/api/voice/transcribe`, submit-text path) — **auto-selected in worker flow, configurable/inspectable in research diagnostics**.
- Transcript editing and original transcript preservation.
- Grounded extraction, clarification, worker corrections, explicit confirmation, structured **experimental sample report** (not official, not submitted).
- Draft saving and JSON export (`/api/drafts`, `/api/export` with fallback behavior preserved).
- Backend API integration and pilot safety boundaries (separate from sandbox, no government integration/submission, synthetic/non-identifying testing guidance).

## 6. After-state evidence (screenshots)
Located in `pilot/docs/screenshots/after/`:
- `mobile-home.png` — Telugu-first home, one “మాట్లాడండి” CTA
- `mobile-speak.png` — simplified recording screen and controls
- `mobile-review.png` — large editable transcript review
- `mobile-report.png` — sample report review/correction/confirmation
- `mobile-done.png` — completion with save/export actions
- `desktop-home.png`, `desktop-research.png` — responsive worker home and separated researcher area

## 7. What this comparison does **not** claim
- No claim of validated usability, comprehension, speed, or workload reduction with Anganwadi workers.
- No claim of improved ASR accuracy or field performance (D-12/Phase 0 constraints unchanged).
- Pre-redesign visuals are represented by documented audit, not session-captured screenshots.
