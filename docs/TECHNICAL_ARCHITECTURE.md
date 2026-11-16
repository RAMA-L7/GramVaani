# Technical Architecture — v0

**Status:** proposed, nothing implemented.
**Design goal:** a thin, testable pipeline where every uncertain decision (ASR vendor, extraction method,
field set, storage) sits behind a seam that can be replaced without touching the rest.

---

## 1. Shape of the system

```
┌────────────────────────── Browser (Next.js, Telugu UI) ──────────────────────────┐
│  Recorder  →  TranscriptEditor  →  ClarificationCards  →  ConfirmationList       │
│                                  →  ReportPreview (print / copy only)            │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │  JSON over HTTP (localhost in v0)
┌───────────────────────────────────────▼──────────────────────────────────────────┐
│                        FastAPI service  (one pipeline, 6 stages)                  │
│                                                                                  │
│  audio ──▶ [1] Capture ──▶ [2] ASR ──▶ [3] Normalise ──▶ [4] Extract            │
│                                        (code-mix)          (config-driven)        │
│                                                                 │                │
│                                                     [5] Clarify (gap finder)      │
│                                                                 │                │
│                                                     [6] Assemble draft ──▶ store │
└──────────────────────────────────────────────────────────────────────────────────┘
        │                    │                        │
   ASRProvider        ExtractionEngine        SessionStore
 (swap: local/cloud) (swap: LLM/rules)      (SQLite → JSON)
```

**Hard architectural guarantee:** there is **no submission module, no scheduler, no credentials store, and
no outbound connector** to any government service. This is not a policy note — the code has nowhere to put
one.

## 2. Stage contracts

Each stage is a pure function over an explicit data structure, so it can be tested without a browser or a
model.

### [1] Capture
- Input: audio blob (+ mime, sample rate, duration).
- Output: `AudioRef { id, uri, duration_ms, sample_rate, sha256 }`.
- Rule: audio is written to a session-scoped temp path, deleted on report completion unless the session is
  marked `keep_audio: true` (research only). 🧪

### [2] ASR — `ASRProvider` interface

```python
class ASRProvider(Protocol):
    name: str
    def transcribe(self, audio: AudioRef, lang_hint: str = "te") -> Transcript: ...
```

`Transcript = { segments: [{ id, text, start_ms, end_ms, confidence }], provider, model, latency_ms }`

Candidate implementations, **all unevaluated**:

| Option | Why it is on the list | Open question |
|---|---|---|
| IndicWhisper / Whisper-family fine-tunes | Telugu support in open weights, runs locally | Accuracy on code-mixed speech? |
| AI4Bharat / Indic ASR models | Designed for Indian languages | Latency on mid-range phones? |
| Hosted Indic ASR (e.g. Sarvam, Google STT) | Strong baseline, fast to integrate | Data-handling terms acceptable? |
| On-device Web Speech / OS API | No audio leaves device | Telugu coverage is unreliable |

> Selection is a **bake-off**, not an assumption. See
> [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md#phase-2--telugu-voice-input-prototype).

### [3] Normalise (code-mixing layer)
Deterministic, no model:
- Script normalisation (ZWNJ/ZWJ, common OCR-style variants) without changing meaning.
- Number words → digits, retaining `surface_text` for display and traceability.
- Keep English tokens verbatim; do **not** transliterate them into Telugu script.
- Segment the text into candidate spans (time/date, counts, activity verbs, food items).
- Output: `NormalisedTranscript { full_text, tokens[], spans[], number_mentions[] }`

This layer is where most "Telugu–English mixed-language handling" actually lives, and it is fully unit
testable.

### [4] Extract — `ExtractionEngine` interface

```python
class ExtractionEngine(Protocol):
    def extract(self, norm: NormalisedTranscript, fields: FieldConfig) -> list[Extraction]: ...
```

`Extraction = { field_id, value, raw_text, source_span, confidence, method, needs_confirmation }`

Two implementations, selected by config:

1. **`LlmExtractor`** (default): constrained prompt + **JSON-schema-validated** output; every value must
   quote a span from the transcript, and spans are verified by substring/offset lookup. Unverifiable
   values are dropped, not trusted.
2. **`RuleExtractor`** (fallback / offline): span + pattern rules per field from the config's
   `extraction.hints`. Lower recall, zero hallucination, no network.

Guardrails that apply to both:
- Fields not in config are impossible to emit (output is validated against the generated schema).
- `null` + `reason` is a first-class result; guessing is a defect.
- Numerical sanity bounds come from config (`min`, `max`), never from code.

### [5] Clarify (gap finder)
- Input: extractions + field config.
- Output: ordered list of ≤ 3 `Clarification { field_id, question_te, question_en, type }`.
- Pure ranking logic: required-and-missing → ambiguous (multi-candidate) → optional-and-missing.
- Question text comes from `config/report-fields.json`, not from a prompt, so it is reviewable by a Telugu
  speaker without reading code.

### [6] Assemble draft
- Merge confirmed values → `ReportDraft`; unresolved fields become explicit gaps.
- Compute `completeness` and `confidence_summary` for display.
- Render preview from a **label map in config**, so the preview format is swappable (screen, print, future
  supervisor view).

## 3. Data model (v0, all synthetic)

```jsonc
ReportDraft {
  id, created_at, config_version,
  transcript: { full_text, segments[], edits[] },
  extractions: [ { field_id, value, raw_text, source_span, confidence, method } ],
  clarifications: [ { field_id, question, answer, asked_at } ],
  confirmations: [ { field_id, decision: "confirmed"|"corrected"|"unconfirmed", corrected_value } ],
  gaps: [field_id],
  status: "draft" | "previewed",
  footer: "Draft prepared with a research prototype. Not an official record. Not submitted."
}
```

Deliberately absent: `beneficiary`, `child_id`, `aadhaar`, `phone`, `credentials`, `submission`.

Storage: SQLite file under a local app-data path, one row per draft, plus a JSON export for research.
No server-side multi-user store in v0.

## 4. Configuration as the contract

`config/report-fields.json` is the single source of truth for:

- which fields exist, their type, bounds, and priority;
- Telugu and English labels;
- extraction hints (Telugu phrases the worker is likely to say);
- clarification question text;
- preview ordering.

Adding a field = editing JSON + bumping `config_version`. No source change, no migration script.
`config/report-fields.schema.json` validates it in CI.

## 5. Privacy and safety posture

| Concern | Measure |
|---|---|
| Audio handling | Session temp only; deleted on completion; off by default. |
| Network calls | One place: the `ASRProvider` / `LlmExtractor` adapters. Disclosed in UI before first call. |
| Beneficiary data | No schema for it. Cannot be stored even by mistake. |
| Credentials | No credential store exists. |
| Logs | Local, opt-in, exportable; no third-party telemetry. |
| Demo artefacts | Synthetic only; filenames carry `synthetic-`. |
| Claims | Every preview surface carries the "research prototype / not official" footer. |

## 6. Technology choices (provisional)

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind | Fast iteration, good mobile web, easy print CSS |
| Backend | FastAPI + Pydantic | Typed contracts, OpenAPI for free, Python ASR ecosystem |
| Runtime | Python 3.12 managed by `uv` | Reproducible env without system Python (none is installed here) |
| Storage | SQLite (local) | Zero-ops, file-portable, good enough for one worker |
| Config | JSON + JSON Schema | Human-reviewable by non-engineers, validatable in CI |
| Tests | Vitest (frontend), pytest (backend), Playwright (flow) | Standard, low friction |

Alternatives rejected for v0: a single Next.js app with route handlers (would force ASR work into Node),
a mobile-native app (higher cost, slower iteration), a hosted BaaS (adds a data processor for no benefit).

> These are **provisional** and recorded as ADR-003…006 in
> [DECISIONS_AND_ASSUMPTIONS.md](DECISIONS_AND_ASSUMPTIONS.md). Nothing here has been installed or run.

## 7. Module boundaries → folders (once scaffolded)

| Folder | Owns | Must not |
|---|---|---|
| `frontend/app/` | Routes, screens, print layout | Call model providers directly |
| `frontend/components/` | Recorder, editor, cards, preview | Contain field names |
| `frontend/lib/api.ts` | Typed client for backend | Business logic |
| `backend/app/api/` | HTTP routes, validation | Pipeline internals |
| `backend/app/pipeline/` | Capture, normalise, clarify, assemble | Vendor SDK imports |
| `backend/app/providers/asr/` | `ASRProvider` implementations | Leak vendor types upward |
| `backend/app/providers/extraction/` | `ExtractionEngine` implementations | Hard-code field lists |
| `backend/app/config/` | Load + validate field config | Defaults that bypass schema |
| `tests/` | Cross-cutting fixtures, golden transcripts | — |

## 8. Failure modes and behaviour

| Failure | Behaviour |
|---|---|
| ASR unavailable (offline/hosted down) | Keep audio, show "transcription pending", allow manual typing |
| ASR returns empty | Ask to re-record one sentence; never fabricate a transcript |
| Extraction returns nothing | Go straight to clarification for required fields |
| Extraction value not span-grounded | Drop the value; log the drop locally |
| Config invalid | Refuse to start; fail loudly in CI, not at runtime |
| Worker abandons mid-flow | Draft persists locally with `status: "draft"` |

## 9. What would force a redesign (and why we are not blocked)

| Future requirement | Expected change | Containment |
|---|---|---|
| Real field set from research | `config/report-fields.json` only | Zero code change |
| Better Telugu ASR | New `ASRProvider` | One class |
| On-device inference | New provider + WASM/ONNX runtime | Provider layer |
| Supervisor review | New read-only route + export format | Additive |
| Offline sync | Add a sync adapter | New module, no pipeline change |
| Different report cadence | Config + a scheduling field | Additive |

No known requirement forces a restructuring. That is the point of the seams.
