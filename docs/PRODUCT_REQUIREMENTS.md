# Product Requirements — v0 Prototype

**Version:** 0.1 (draft, pre-research)
**Scope:** one worker, one device, one report, synthetic data.
**Rule:** any requirement marked 🧪 is a **hypothesis** and may be deleted or rewritten after Phase 0.

---

## 1. The job to be done

> "I have finished my work for the day. I know what happened. I need it recorded correctly without
> spending my evening typing."

## 2. User journey (v0)

| Step | Worker does | System does |
|---|---|---|
| 1 | Taps a large record button, speaks in Telugu | Shows live level/time, stops on tap |
| 2 | — | Transcribes; shows text as soon as it is ready |
| 3 | Reads and fixes the transcript (keyboard or re-speak a sentence) | Keeps transcript editable; nothing is frozen |
| 4 | Taps "Continue" | Extracts candidate field values from the transcript |
| 5 | Answers 0–3 short questions | Asks **only** about missing or ambiguous required fields |
| 6 | Confirms / corrects each extracted value | Shows each value with its source phrase |
| 7 | Views the draft report | Renders a plain, printable preview |
| 8 | Copies or prints the draft | Explicitly offers no submission |

## 3. Functional requirements

### FR-1 — Telugu voice input
- Record a single utterance of 15 s–5 min with one tap; visible recording state; cancel is always available.
- Audio is kept only for the current session unless the user opts to save it.
- No account, no login, no background recording.

**Acceptance:** a 30-second Telugu summary records, plays back, and transcribes in one flow on a mid-range
Android Chrome device. 🧪

### FR-2 — Speech transcription
- Produce a Telugu-script transcript with word-level timings if the provider supports them.
- Surface confidence; low-confidence spans are visually marked, not silently accepted.
- Provider is behind an interface (`ASRProvider`) with at least one local/offline-capable option. 🧪

**Acceptance:** transcript appears within 5 s of stop for a 30 s clip (network path), or ≤ 2× clip duration
offline. Quality target set after baseline measurement — **no invented WER number**.

### FR-3 — Editable transcript
- The transcript is plain, fully editable text. Selecting a word offers "re-speak this part". 🧪
- Edits are tracked (what changed, in which segment) for research metrics only — never used to correct the
  worker silently.
- Confirmed values are invalidated if their source segment is edited, and re-extracted on request.

**Acceptance:** any character can be edited; a re-extraction after an edit never shows a stale value.

### FR-4 — Telugu–English mixed-language handling
- Accept code-mixed input without error: `ఈరోజు attendance 24, meal serve చేశాం`.
- Canonical form for storage is **Telugu script**; recognised English tokens are preserved verbatim rather
  than transliterated away.
- Numerals: accept Telugu words (`ఇరవై నాలుగు`), digits (`24`), and mixed forms; normalise to a number plus
  the original surface text.
- Do not "correct" the worker's language toward formal Telugu.

**Acceptance:** a labelled test set of mixed utterances transcribes and extracts with English domain terms
intact, and no digits are dropped.

### FR-5 — Structured information extraction
- Extract candidate values for fields defined **only** in `config/report-fields.json`.
- Each extracted value carries: `value`, `field_id`, `confidence`, `source_span`, `needs_confirmation`.
- Never fabricate: absent information yields `null` + a reason, never a plausible guess.
- Schema is data, not code — adding a field must require no source change.

**Acceptance:** for the synthetic transcript set, every non-null extraction is traceable to a transcript
span; no field outside the config can be produced.

### FR-6 — Missing-information clarification
- Ask about at most 3 gaps per report, highest priority first (field `priority`).
- One question per screen, in spoken-style Telugu, with a "not applicable / don't know" escape.
- Answers are appended to the transcript record and re-extracted for that field only.
- Never ask for anything outside the configured field list. Never ask for beneficiary details.

**Acceptance:** a transcript missing two required fields produces exactly two questions; "don't know" is
accepted and the report is still previewable with a visible gap marker.

### FR-7 — Confirmation and correction
- Every extracted value is shown with its source phrase; confirm-all is allowed only when no value is
  low-confidence.
- Corrections are one tap away and persist into the preview.
- An unconfirmed value is never presented as fact in the preview; gaps are explicit.

**Acceptance:** no value reaches the preview without either confirmation or an explicit "unconfirmed"
marker.

### FR-8 — Report preview
- Plain-language, printable, single-page-ish layout; Telugu labels with English in parentheses. 🧪
- Shows the report date, activity summary, field table, and a footer: *"Draft prepared with a research
  prototype. Not an official record. Not submitted."*
- Actions: copy text, print/PDF, start over. **No send / submit / sync.**

**Acceptance:** the footer is always present and cannot be disabled by configuration.

## 4. Non-functional requirements

| Area | Requirement |
|---|---|
| **Privacy** | No beneficiary data model exists. No credentials. Local-first storage; any network call to a model provider is logged in-session and disclosed in the UI. |
| **Devices** | Mid-range Android phone, Chrome, portrait, usable one-handed; 360 px minimum width. |
| **Language** | UI in Telugu (primary) with English secondary labels. Not a settings toggle in v0. |
| **Performance** | Recording start < 300 ms; UI stays responsive during transcription (no blocking spinner over the record button). |
| **Accessibility** | ≥ 48 px targets, high contrast, screen-reader labels, works at 200% text size. |
| **Offline** | Capture and editing must work offline; transcription may queue. 🧪 |
| **Configurability** | Field set, clarification questions, and preview labels all derive from `config/`. |
| **Observability** | Local, opt-in session log (timings, edit counts) exported as JSON for research. No telemetry by default. |

## 5. Out of scope for v0

- Authentication, multi-user, roles, sync between devices.
- Any government app integration, submission, or "export to Poshan Tracker / Bala Sanjeevini".
- Beneficiary records, child-level tracking, growth charts.
- Photo/document capture, offline maps, supervisor dashboards.
- Multi-language support beyond Telugu + English terms.
- Model fine-tuning (evaluate first, fine-tune only if Phase 1 benchmarks justify it).

## 6. Metrics we intend to collect (research, not product analytics)

| Metric | Definition | Purpose |
|---|---|---|
| Time-to-report | Stop-speaking → preview shown | Tests H1 |
| Correction rate | Edited characters ÷ transcript characters | Tests H2/H3 |
| Field correction count | Confirmed values changed per report | Tests H3 |
| Clarification count | Questions asked per report | Tests extraction coverage |
| Perceived effort | Single 5-point item + think-aloud | Tests H4 |

No numeric targets are set until a baseline exists. Setting them now would be invention.

## 7. Open questions blocking refinement

1. What does the real daily/weekly report actually contain? (blocks FR-5 field list)
2. Is the report entered daily, weekly, or event-driven?
3. Which parts are numeric/tabular vs. free text?
4. Is there a supervisor review step that changes the required format?
5. What is the acceptable level of ASR error before correction becomes worse than typing?
6. Would workers accept cloud transcription, or is on-device a hard requirement?

Tracked in [RESEARCH_FINDINGS.md](../research/RESEARCH_FINDINGS.md#3-open-questions).
