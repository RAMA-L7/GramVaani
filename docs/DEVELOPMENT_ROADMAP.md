# Development Roadmap

**Principle:** research gates code. We do not build a stage until the assumption it depends on has been
tested, or is explicitly accepted as a known risk.

---

## Phase map

```
Phase 0  Research & definition        ← we are here (docs + field plan only)
   │      gate: workflow + field hypotheses documented
Phase 1  Voice capture + transcription
   │      gate: ASR bake-off measures acceptable correction cost
Phase 2  Transcript editing + code-mix normalisation
   │      gate: correction rate ≤ baseline effort
Phase 3  Structured extraction (config-driven)
   │      gate: span-grounded extraction on golden set
Phase 4  Clarification + confirmation
   │      gate: full loop usable without researcher help
Phase 5  Report preview + research instrumentation
          gate: end-to-end session with a worker, synthetic data
```

---

## Phase 0 — Research and definition  *(current)*

**Goal:** replace invented requirements with observed ones.

| Deliverable | Status |
|---|---|
| Project docs, architecture, roadmap | ✅ done |
| `config/report-fields.json` v0 (hypotheses) | ✅ done |
| Field research plan + instruments | ✅ done |
| Completed interview/observation sessions | ⬜ |
| Findings register updated with evidence | ⬜ |
| Field config revised against real workflow | ⬜ |
| Go/no-go decision for Phase 1 | ⬜ |

**Exit criteria:** every field in the config has either a citation to a session note or an explicit
`unverified` flag with a plan; the "what does the report contain" question has a written answer
(partial answers allowed, labelled as such).

**Do not build in this phase:** UI, models, storage. The only artefacts are documents and config.

## Phase 1 — Voice capture + transcription

- Recorder component with clear states, cancel, playback, duration limit.
- `ASRProvider` interface + **two** implementations for a bake-off (one local, one hosted).
- Synthetic Telugu corpus (30–50 clips, including code-mixed and numerals) recorded by the team.
- Benchmark harness: WER/CER overall, on numerals, on English loanwords; latency per clip.
- Session temp audio handling and deletion.

**Exit criteria:** measured table of provider × {WER, numeral accuracy, latency, cost, data terms}, and a
documented choice (or a documented "none is good enough yet"). No provider is chosen by intuition.

## Phase 2 — Editable transcript + code-mix normalisation

- Editable transcript with segment-level re-speak. 🧪
- Deterministic normalisation: Telugu numerals → digits, English token preservation, span detection.
- Unit tests over a golden set of mixed-language utterances.
- Edit tracking for research metrics.

**Exit criteria:** golden-set pass rate documented; a real editing session feels faster than typing the
same content (measured, small n is acceptable if labelled).

## Phase 3 — Structured extraction

- `ExtractionEngine` interface; JSON-schema-validated LLM path; rule-based fallback.
- Span-grounding verifier (drop anything not traceable to the transcript).
- Golden transcript → expected-extraction fixtures in `tests/`.
- Config-driven schema generation from `config/report-fields.json`.

**Exit criteria:** on the golden set, zero non-grounded values; recall/precision recorded per field; field
list matches Phase 0 findings (or the mismatch is explained).

## Phase 4 — Clarification + confirmation

- Gap finder with priority ordering, ≤ 3 questions.
- Question text served from config, reviewed by a Telugu speaker.
- Per-field confirm/correct UI with source phrase; "don't know" path.
- Invalidation on transcript edit.

**Exit criteria:** a worker completes the loop unaided; question count and correction count recorded.

## Phase 5 — Preview + instrumentation

- Printable/copyable draft with the mandatory non-official footer.
- Local session log export (timings, corrections) as JSON.
- End-to-end Playwright flow test on a synthetic fixture.
- Internal pilot with 3–5 workers, synthetic content, consent-first.

**Exit criteria:** pilot notes written up; decision on whether to continue, pivot the interaction model, or
stop.

---

## Sequencing rules

1. **No phase starts before the previous gate.** The gates exist because the costs are real.
2. **Config before code.** Any new field lands in `config/` first, with a test fixture.
3. **Two implementations for every uncertain vendor choice** until the bake-off is done.
4. **No submission code, ever, in v0** — not behind a flag, not "for later".

## What we are deliberately not scheduling

- Government app integration (unauthorised, undefined).
- Beneficiary-level records (privacy, no research value yet).
- Fine-tuning a Telugu ASR model (evaluate first).
- Cloud deployment, auth, multi-tenancy (one worker, one device).
- A polished brand or marketing site.

## Recommended next step

> **Run 4–6 Phase 0 sessions using `research/instruments/`, then rewrite `config/report-fields.json` from
> what you actually saw.**

Concretely, in order:

1. Read [FIELD_RESEARCH_PLAN.md](../research/FIELD_RESEARCH_PLAN.md); print the consent script and
   observation sheet.
2. Run sessions; write one note per session in `research/notes/YYYY-MM-DD-session-NN.md`.
3. Promote observations into [RESEARCH_FINDINGS.md](../research/RESEARCH_FINDINGS.md) with the evidence
   taxonomy — verified vs. hypothesis.
4. Update `config/report-fields.json`: add/rename/remove fields, set `verification.status` and
   `validated_in`.
5. Only then scaffold `frontend/` and `backend/` (Phase 1), and immediately start the ASR bake-off.

Rationale: the cheapest possible failure is discovering in a 30-minute interview that the report is weekly,
not daily, or that workers dictate to a supervisor rather than typing. Both would invalidate a UI built
today.
