# Pilot Frontend Redesign — Skill Discovery Report

**Date:** 2026-11-16  
**Scope:** GramVaani pilot frontend (`D:\GramVaani\pilot\frontend`) Telugu-first, mobile-first, accessible simplification for Anganwadi workers.  
**Constraint:** Read skill instructions before use; do not install unnecessary packages or apply animation-heavy components; preserve real voice/report workflow and backend integration.

## 1. Locations inspected

| Location | Result |
|---|---|
| `D:\GramVaani\.opencode\skills` | **Not found** |
| `D:\VLSI-Task-Factory\.opencode\skills` | **Accessible, not relevant** — VLSI benchmark/task-delivery skills only (task-specification, rubric-engineering, reference-solution, independent-audit, EDA verification, delivery/benchmark skills). No UI/UX/web redesign guidance. |
| Global OpenCode/config dirs (`%USERPROFILE%\.config\opencode\skills`, `.claude\skills`, Claude plugins marketplace, `.agents\skills`, AppData/local/roaming OpenCode) | **Accessible (scanned)** — most skills unrelated (automation, motion-graphics, Playwright tooling, cloud/mobile-ads/build, office/agent tooling). |
| Harness-provided available skills (system prompt) | **`magic-ui`** available (`D:\agent-skills\skills\magic-ui`, SKILL.md read). |
| Claude official plugins (discovered) | **`frontend-design`** found and read: `C:\Users\91846\.claude\plugins\marketplaces\claude-plugins-official\plugins\frontend-design\skills\frontend-design\SKILL.md`. |

## 2. Relevant skills/resources identified

### 2.1 `frontend-design` (Claude plugin) — **selected, primary design-process guidance**
- **Path:** `C:\Users\91846\.claude\plugins\marketplaces\claude-plugins-official\plugins\frontend-design\skills\frontend-design\SKILL.md`
- **Instructions summary (read):** Ground design in subject/audience/page job; deliberate palette/type/layout/signature; hero as thesis; structure encodes meaning; match complexity to vision; treat copy as design material (clear, user-centered, actionable, consistent action names, helpful errors/empties). Process: brainstorm → compact token system (color/type/layout/signature) → self-critique vs generic defaults → build → critique again. Quality floor: responsive down to mobile, visible keyboard focus, reduced motion respected; spend boldness in one place and cut non-serving decoration.
- **Relevance to this redesign:** High for **UI simplification, mobile-first/responsive discipline, clear copy, task-focused hierarchy, accessibility-minded fundamentals (focus/reduced motion)** and avoiding templated clutter. Helps define a compact worker-first design system and guided flow.
- **Gaps:** Not Telugu-localization-specific, not low-literacy/low-tech UX research, not a WCAG audit checklist, not a React component-library implementation guide.

### 2.2 `magic-ui` (harness available skill) — **considered, not adopted for this implementation**
- **Path/ID:** `magic-ui` (`D:\agent-skills\skills\magic-ui`)
- **Instructions summary (read):** Add/customize Magic UI registry components (`npx shadcn@latest add @magicui/*`) for animated sections/effects (marquee, blur-fade, shiny-button, particles, etc.); requires React/Next.js + Tailwind + shadcn init; validate accessibility/responsiveness/performance; avoid stacking heavy motion.
- **Relevance:** Potential for polish in marketing/research views, but **not aligned with worker-facing goals** (extreme simplicity, fast load on low-end phones, one primary action, no unnecessary animations, minimal dependencies). Worker UI benefits more from large static controls, high contrast, and predictable layouts than motion effects.
- **Decision:** **Not used.** No Magic UI components added; no shadcn/Tailwind/Magic UI packages installed. Lightweight custom CSS/components preferred per design rules.

### 2.3 Playwright skills (bundled, indirect) — **optional for verification only**
- **Examples:** `playwright-cli`, `playwright-component-testing`, `playwright-trace` in OpenCode/node_modules and sandbox test deps.
- **Relevance:** Useful for browser inspection/screenshots and regression checks if available; **not** UI/UX design skills. Used only where helpful for verification/screenshots (no new test framework dependency added to pilot frontend).

## 3. Specifically checked: Magic UI, shadcn/ui, Radix UI
| Resource | Installed/discoverable skill? | In existing pilot frontend deps? | Decision |
|---|---|---|---|
| **Magic UI** | Yes — harness skill available (instructions read) | No | **Do not install/use** (animation/dependency overhead not needed for worker simplicity) |
| **shadcn/ui** | No dedicated installed skill found | No | **Do not adopt** for this pass; custom lightweight components + existing CSS approach sufficient and lower risk |
| **Radix UI** | No dedicated installed skill found | No | **Do not adopt**; native/semantic HTML controls preferred for simplicity and accessibility |

## 4. Skills not found (gaps)
No installed skills specifically covering: **Telugu-first/Indic typography-localization**, **low-literacy/low-tech usability audit heuristics**, **formal WCAG audit methodology**, or **React/Next.js component-library implementation patterns** (shadcn/Radix/Magic UI) beyond the general guidance above.

## 5. Selected combination and rationale
| Need | Selected approach/skill | Why |
|---|---|---|
| Design direction, simplification, copy clarity, mobile/responsive restraint, focus/reduced-motion awareness | **`frontend-design`** principles/process | Best fit for “simple, task-complete, not decorative” worker UI; prevents generic clutter; supports one-primary-action hierarchy |
| Animated/component-library enhancements | **None** (Magic UI/shadcn/Radix not used) | Avoids unnecessary packages, motion, and load/complexity on low-end devices; preserves fast, predictable UI |
| Functional correctness (voice/ASR/extraction/clarify/confirm/draft/export APIs) | **Existing pilot architecture + backend contracts** (inspect before modify) | Must not break real workflow; redesign focuses on presentation/flow/navigation separation |
| Verification | **Existing frontend tests/build/typecheck + targeted browser checks/screenshots** | Evidence-based regression check without introducing heavy new tooling |

## 6. Application to this redesign
- **Worker-first:** Telugu-first labels/copy, one prominent action per screen, large touch targets, high contrast, minimal navigation, clear recording/processing/error states.
- **Researcher separation:** Move scenarios, evaluation, feedback, provider diagnostics, and technical metadata into `/research/*` (separate area) out of normal worker journey.
- **Preserve:** `getUserMedia`/MediaRecorder, browser Web Speech (`te-IN`), backend ASR endpoints, transcript editing/original preservation, grounded extraction/spans, clarification, corrections, explicit confirmation, draft save, JSON export, backend integration.
- **No claims:** UI simplification is a design change; **usability not validated without real worker testing**.
