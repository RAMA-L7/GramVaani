# Pilot Frontend — UX Audit (Anganwadi Worker Perspective)

**Date:** 2026-11-16  
**Audited app:** `D:\GramVaani\pilot\frontend` (Next.js 15 App Router, React 19, custom CSS, no UI framework)  
**Primary user lens:** Telugu-speaking Anganwadi worker with varying smartphone experience; goal = understand in ~30s, start speaking with one tap, review transcript and generate a sample report without complex menus.  
**Evidence:** Source inspection of routes, components, libs, styles, and README (pre-redesign state).

## 1. Routes/pages inventory and audience classification

| Route | File | Purpose (current) | Audience fit | Notes |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Landing with 6 tiles + boundaries + 2 CTAs | Mixed | Exposes testing/research areas alongside worker flow; multiple choices, not one-tap start |
| `/voice` | `app/voice\page.tsx` | Mic recording, browser STT toggle, ASR provider selection/capabilities, transcription submit | **Worker core** but developer-heavy | Provider IDs/modes/credentials, technical status/reasons, branching behavior; high cognitive load |
| `/transcript` | `app\transcript\page.tsx` | Edit transcript, run extraction, view grounded spans/corrections, continue | **Worker core** but technical | Extraction jargon (gaps/ambiguities/confidence/spans), multiple actions, dense review |
| `/preview` | `app\preview\page.tsx` | Clarifications, corrections, explicit confirmation, sample report, draft save, JSON export | **Worker core** but complex | Many controls/states (idempotency key shown, validation/raw-ish details), sequential steps mixed on long page |
| `/test-scenarios` | `app\test-scenarios\page.tsx` | Load synthetic scenarios into workflow | **Researcher/developer/tester** | Synthetic fixtures, scenario metadata — should not be in worker journey |
| `/evaluation` | `app\evaluation\page.tsx` | Evaluation summary/metrics/runs/raw JSON, synthetic vs real speech indicators | **Researcher/developer** | Technical metrics/raw payloads |
| `/feedback` | `app\feedback\page.tsx` | Research feedback form (ratings/comments/consent) | **Researcher/pilot study** (non-identifying) | Useful for study but not required for worker task completion |

**Global shell (`app/layout.tsx`):** Persistent sticky header nav links to **all 7 pages** + `SafetyBanner` + footer. Worker and researcher destinations given equal prominence.

## 2. Findings by requested audit area

### 2.1 Too many buttons or navigation options
- **7 primary nav items always visible** (Home, Voice, Transcript, Report, Scenarios, Evaluation, Feedback).
- Home presents **6 clickable tiles** plus 2 CTA buttons; worker must choose path rather than act.
- Voice page combines provider dropdown, STT toggle, recorder controls (start/pause/resume/stop/re-record), transcribe action, open transcript, plus dynamic status/actions.
- Transcript/Preview expose multiple secondary actions (save, restore original, re-run extraction, load clarifications, back/export/draft, etc.).
- **Impact:** Violates “one primary action per screen”; slows comprehension for low-experience users.

### 2.2 Technical terminology (worker-facing)
Examples observed: `getUserMedia`, `MediaRecorder`, `Web Speech API`, `/asr/capabilities`, provider `id`/name/modes, “credentials/config required”, “simulated/provider-side test mode”, `scenario_id`, **confidence %**, **source span offsets `[start,end]`**, gaps/ambiguities, **idempotency/Confirm key**, schema/version/status codes, raw JSON (evaluation/export contexts), `JSON export`, `blob` fallback behavior implied.
- **Impact:** Confusing and intimidating; obscures the simple task “speak → check → confirm”.

### 2.3 Confusing workflows
- Core flow split across 4+ pages with manual progression and re-runnable steps; state persisted in `localStorage` (resume helpful but can surprise with stale data).
- Re-extraction/reset behaviors (answers/corrections/report cleared in places) not obvious.
- Multiple transcript sources (recorded audio, browser realtime text, backend transcript, synthetic scenario, manual edits, original preserved).
- Clarification may require explicit “Load clarification questions” and then answer sequentially before confirm; confirm gated by checkbox but reasons/errors can be technical.
- **Impact:** Hard to know “what to do next” without guidance.

### 2.4 Small touch targets
- Global styles set `min-height: 44px` for `.btn` (good baseline) but nav links, badges, inline controls, and some `.btn-small`/compact elements can be smaller/tighter on phones.
- Dense forms/tables (extraction list, report grid/table, evaluation tables) and choice layouts risk tap errors.
- **Impact:** Frustrating on small Android screens / variable dexterity.

### 2.5 Unnecessary information
- Developer/provider diagnostics on voice screen (availability booleans, credentials flags, modes, reasons).
- Evaluation metrics/runs/raw JSON and synthetic/real distinctions shown as first-class destinations.
- Test scenarios, draft IDs, confirm keys, file sizes/formats, character counts, timestamps, raw-ish validation/status metadata.
- **Impact:** Increases cognitive load and distracts from reporting task.

### 2.6 Difficult transcript correction
- Transcript is editable (good) but correction also spread across extraction per-field inputs, clarification answers, and re-extraction cycles.
- Highlighted spans/confidence/offsets are technical; “what needs fixing” not prioritized in plain Telugu.
- Original vs edited handling present but explanations/actions can be unclear.
- **Impact:** Users may not confidently fix recognition mistakes.

### 2.7 Unclear recording states
- States exist (idle/recording/paused/stopped, timer, status pill) but mixed with provider/STT technical options and messages.
- Permission/unsupported/interruption/error cases surfaced, sometimes with mixed-language/technical phrasing in UI logic; importance of errors may compete with other notices.
- Primary “record” affordance shares space with configuration.
- **Impact:** Worker may not know if app is listening, paused, or failed.

### 2.8 Poor mobile layouts
- Single-column base and responsive breakpoints exist (`700/560/420px`), but pages are content-dense (cards, grids, tables with horizontal scroll, long forms/pre blocks).
- Sticky header with many wrapped nav items consumes vertical space.
- Large textareas/tables/json blocks and multi-section flows require extensive scrolling.
- **Impact:** Slow, fiddly experience on low-end/small devices.

### 2.9 Telugu readability problems
- Telugu present in labels/messages and `lang="te"` used in places (good), but **interface chrome/navigation/most headings/instructions are English-first**.
- Some system strings are technical/mixed; font stack includes Noto Sans Telugu/Nirmala UI but typography scale/line length not optimized for primary Telugu reading.
- Inconsistent bilingual presentation can force translation effort.
- **Impact:** Primary Telugu speakers may not understand actions quickly.

### 2.10 Accessibility issues
- Some positives: form labels in places, `aria-label`/`role="note"`/`aria-live` in recorder/timer/highlight areas, visible focus styles partially defined.
- Concerns: information density and complex sequences, color-only/status reliance in places, long pages without clear step landmarks, technical error text, horizontal-scroll tables/preformatted blocks, small/compact controls, potential contrast/focus visibility inconsistencies across custom components, no explicit reduced-motion handling beyond minimal animation (pulse) noted in CSS.
- **Impact:** Barriers for low vision, motor, cognitive, and assistive-technology users.

## 3. Functional elements that must be preserved (redesign constraint)
Real microphone recording (`getUserMedia`/`MediaRecorder` start-pause-resume-stop, playback, re-record), browser Web Speech API (`te-IN`), ASR provider adapters/capabilities integration, transcript editing + original preservation, grounded extraction with exact `source_span`, clarification flow, worker corrections, explicit confirmation, draft saving, JSON export, backend API integration, sample/experimental labeling and safety boundaries (no govt integration/submission). **Frozen sandbox and main `config/report-fields.json` untouched.**

## 4. Redesign priorities (derived)
1. **One guided worker journey:** Home → Speak (one tap) → Review transcript → Answer questions (one at a time) → Report (confirm) → Done.
2. **Telugu-first, plain language:** Prominent “మాట్లాడండి”, simple status/error copy, minimal English only where helpful.
3. **Large, thumb-friendly controls & high contrast:** single primary CTA per screen, generous spacing, readable text.
4. **Progressive disclosure:** hide provider diagnostics/IDs/keys/raw JSON/confidence-offset internals from worker flow; keep accessible in researcher area.
5. **Clear states:** recording/paused/processing/success/error unmistakable; never hide important errors.
6. **Separate researcher area:** move scenarios, evaluation, feedback, diagnostics; remove from worker nav/journey.
7. **Mobile performance/simplicity:** lightweight UI, no unnecessary animation/deps, responsive for small Android screens.

*This audit documents pre-redesign issues; usability improvement is **not validated without real worker testing**.*
