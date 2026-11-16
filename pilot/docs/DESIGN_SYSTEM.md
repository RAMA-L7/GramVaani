# Pilot Frontend — Simplified Design System (Worker-First)

**Date:** 2026-11-16  
**Scope:** `D:\GramVaani\pilot\frontend` redesign for Telugu-speaking Anganwadi workers (varying smartphone experience).  
**Principles:** Telugu-first, one primary action per screen, large touch targets, high contrast, minimal navigation, clear states, fast/lightweight, no unnecessary animation.

## 1. Audience and product boundaries
- **Worker-facing:** guided task flow only (speak → review → answer questions → confirm sample report → done).
- **Researcher-facing:** separate `/research/*` area (diagnostics, synthetic scenarios, evaluation, feedback) — not in normal worker journey.
- **Safety labels (always visible in context):** experimental pilot/sample report, **not official**, **not submitted**, **no government integration**. Use synthetic/non-identifying data for testing.

## 2. Design tokens (`app/globals.css`)

### Color & surfaces
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f6f8f4` | App background (calm, high readability) |
| `--surface` | `#ffffff` | Cards/inputs |
| `--ink` | `#102018` | Primary text (high contrast) |
| `--muted` | `#4b5d52` | Secondary/help text |
| `--primary` / `--primary-dark` | `#1f6f43` / `#165434` | Primary actions, key accents |
| `--danger` / `--warn` / `--ok` / `--info` + soft variants | semantic pairs | Recording/error, caution/missing, success, guidance |
| `--focus` | `#0f766e` | Keyboard focus ring (3px, offset) |

### Typography
- **Font stack:** `"Noto Sans Telugu", "Nirmala UI", "Noto Sans", system-ui, ...` (Telugu readability prioritized).
- **Base:** 18px body, line-height 1.6; large headings (`h1` clamp up to 2.3rem).
- **Transcript/content:** larger, relaxed line-height (`1.15rem–1.8`) with `lang="te"` where appropriate.
- **Copy style:** short, plain, action-oriented; Telugu-first labels with brief English support where helpful; consistent action names (e.g. “మాట్లాడండి”, “ముందుకు వెళ్లండి”, “నిర్ధారించండి”).

### Shape, spacing, elevation
- Radius: `--radius: 18px`, `--radius-sm: 12px`; buttons 16px.
- Generous padding (`16–28px` cards, 14px controls) and stacked layouts with clear gaps.
- Subtle shadow only for separation (`--shadow`); no decorative effects.

## 3. Components & patterns

| Pattern | Implementation | Rationale |
|---|---|---|
| **Primary CTA (home/start)** | `.mic-cta` large circular button (min ~220px / 70vw), icon + “మాట్లాడండి” | One-tap start, thumb-friendly, unmistakable |
| **Buttons** | `.btn` full-width, min-height 56px, 1.05rem bold; variants primary/secondary/danger | Large touch targets, clear hierarchy |
| **Recording states** | `.status-chip` + `.dot` + `.timer` (2rem tabular); state colors (idle/recording/paused/stopped/processing) | Unambiguous listening/paused/recorded feedback |
| **Notices/errors** | `.notice` + semantic variants (warn/info/ok/error), `role="alert"` for important errors | Important errors never hidden; plain-language recovery |
| **Forms/inputs** | Large inputs/textarea (min-height 56px, 14–16px padding, 2px border), visible focus | Easy editing on mobile |
| **Choices (clarification)** | `.choice-list` / `.choice-btn` large selectable options with `aria-pressed` | One question at a time, tap-friendly answers |
| **Progress/steps** | Simple step text/progress (e.g. “ప్రశ్న 1 / N”) and guided navigation | Predictable flow |
| **Field review** | `.field-item` cards with status pills (ఖాళీ/సరిచూడండి/ఉంది) | Highlights missing/uncertain without technical jargon |
| **Details (progressive disclosure)** | `<details class="simple">` for original transcript/secondary info | Keeps primary screen simple |

## 4. Layout & navigation
- **Worker shell (`app/(worker)/layout.tsx`):** minimal top bar (brand + discreet “పరిశోధకులు / Researcher” link), compact pilot boundary notice, single-column content (`.wrap` max 760px). **No 7-item worker nav.**
- **Research shell (`app/research/layout.tsx`):** separate header/nav for Diagnostics, Scenarios, Evaluation, Feedback.
- **Flow:** `/` (Home) → `/speak` → `/review` → `/questions` → `/report` → `/done` (each with one primary action).
- **Responsive:** mobile-first, single column, grids collapse; comfortable at 360px+ widths.

## 5. Accessibility & interaction
- Visible `:focus-visible` outlines; semantic headings/labels/buttons/links; `lang="te"` on Telugu content areas.
- `aria-live` for timers/status where relevant; `role="alert"` for blocking errors; `aria-pressed` for toggle choices.
- Checkbox/controls sized for touch (24px+ checkboxes).
- **Reduced motion:** `prefers-reduced-motion: reduce` disables animations/transitions (no non-essential motion used).
- Color not sole indicator (text labels + icons/chips accompany states).

## 6. Performance & implementation choices
- No new UI libraries, no Tailwind/shadcn/Magic UI, no animation libraries; **pure lightweight CSS** over existing Next.js/React stack.
- Minimal client-side logic per screen; reuse existing API/workflow/utils; heavy diagnostics moved off worker path.
- Browser speech + recorded audio paths preserved; provider complexity hidden from workers (auto-selection) but available in `/research/diagnostics`.

## 7. Worker screen map
| Screen | Route | Primary action |
|---|---|---|
| Home | `/` | **మాట్లాడండి** (start speaking) |
| Recording | `/speak` | Record/pause/stop, then continue to review |
| Transcript | `/review` | Edit/check text, **సరే, ముందుకు వెళ్లండి** |
| Questions | `/questions` | Answer one question at a time, continue |
| Sample report | `/report` | Review/correct, explicit confirm checkbox, generate sample |
| Completion | `/done` | View, save draft, export JSON, return home |

*Design-system choices support simplicity and task completion; real-world usability requires validation with Anganwadi workers.*
