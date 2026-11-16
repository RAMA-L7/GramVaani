# Decisions and Assumptions

Two registers: **ADR** = a choice we made. **AS** = a belief we hold but have not verified.
Anything not in one of these registers is not a requirement.

---

## 0. Evidence taxonomy (used across all docs)

Every claim in this repository must carry one of these labels.

| Label | Meaning | May drive code? |
|---|---|---|
| `verified` | Confirmed by ≥ 2 independent sources, or by direct observation with a written note | Yes |
| `observed` | Seen once in a session; a single note, not corroborated | Only behind a config flag |
| `hypothesis` | Reasoned guess, testable, not yet checked | Only as a stub/experiment |
| `assumption` | Needed to make progress; we accept the risk knowingly | Yes, if reversible and documented |
| `rejected` | Tested and found false | No — remove, don't leave dead code |

Rule: **`verified` requires a citation** (`research/notes/<file>#section`). If there is no citation, it is
`observed` at best.

---

## 1. Architecture decisions (ADR)

### ADR-001 — Config-driven field definitions
**Status:** accepted
**Decision:** all reporting fields, labels, bounds, extraction hints and clarification text live in
`config/report-fields.json`, validated by a JSON Schema. No field names in source code.
**Why:** we do not know the real field set. Research will change it repeatedly.
**Consequence:** extraction needs a generic schema-driven path; the LLM prompt is generated, not hand-written
per field. Slight complexity cost now, large rewrite avoided later.

### ADR-002 — Transcript-first, never form-first
**Status:** accepted
**Decision:** the editable transcript is the single source of truth; structured values are derived from it.
**Why:** ASR will make mistakes, and the worker must always be able to see and fix the ground truth.
Hiding errors behind a form would make them invisible.
**Consequence:** every extracted value must carry a `source_span`; editing a span invalidates derived values.

### ADR-003 — Two runtimes: Next.js frontend, FastAPI backend
**Status:** provisional (accepted for Phase 2)
**Decision:** separate frontend and backend processes, talking over typed HTTP.
**Why:** the ASR/model ecosystem is Python; the best mobile-web iteration speed is Node. A single-language
app would compromise one of them.
**Consequence:** two dev servers, CORS locally, a shared contract to keep in sync (generated from Pydantic).
**Revisit if:** a single Next.js app can host a Python sidecar cleanly, or the team is single-language.

### ADR-004 — Provider adapters for ASR and extraction
**Status:** accepted
**Decision:** `ASRProvider` and `ExtractionEngine` are interfaces with at least two implementations during
evaluation.
**Why:** no Telugu code-mixed ASR provider has been benchmarked; vendor choice is an open question.
**Consequence:** no vendor SDK import outside `providers/`; a fake provider is used in tests.

### ADR-005 — Local-first storage, SQLite, no accounts
**Status:** accepted
**Decision:** one local SQLite file, one user, no auth, no sync in v0.
**Why:** matches a single-worker prototype; avoids becoming a system of record for real data.
**Consequence:** nothing to deploy; research export is a JSON file the worker/implements can choose to share.

### ADR-006 — No submission capability exists in the codebase
**Status:** accepted (non-negotiable)
**Decision:** no module, flag, or interface for submitting to any government system; no credential storage.
**Why:** integration is unauthorised, undefined, and would create legal and safeguarding exposure.
**Consequence:** if integration is ever legitimately required, it is a new project with approvals — not a
config toggle here.

### ADR-007 — Canonical storage in Telugu script, English tokens preserved
**Status:** accepted
**Decision:** normalise to Telugu script for display/storage; keep English domain terms verbatim; never
auto-"correct" the worker's register toward formal Telugu.
**Why:** code-mixing is how people actually speak; forcing purity increases correction effort and reduces
trust.
**Consequence:** numeric and term normalisation is deterministic and unit-tested; no transliteration model.

### ADR-008 — Synthetic data only, enforced in the schema
**Status:** accepted (non-negotiable)
**Decision:** no beneficiary/child/person entity exists in the data model; sample assets are team-recorded
and scripted.
**Why:** safeguarding and confidentiality; also keeps the research ethics review simple.
**Consequence:** some realistic edge cases cannot be tested (real names, real growth values). Accepted.

### ADR-009 — Documentation in `docs/`, research in `research/`, separate from code
**Status:** accepted
**Decision:** docs are not mixed into `frontend/` or `backend/`; field-research notes are dated files in
`research/notes/`.
**Why:** provenance matters more than discoverability-by-proximity; research will be read by non-engineers.
**Consequence:** README index is the entry point; links must be kept working.

---

## 2. Assumption register

| ID | Assumption | Label | Risk if wrong | How it gets tested | Status |
|---|---|---|---|---|---|
| AS-01 | Anganwadi workers spend meaningful time per report in Poshan Tracker / Bala Sanjeevini | `hypothesis` | The whole problem framing is weak | Timed observation, Phase 0 | open |
| AS-02 | The pain is typing/entry, not recall or navigation | `hypothesis` | Voice input solves the wrong bottleneck | Task breakdown + think-aloud | open |
| AS-03 | Workers speak a Telugu–English mix naturally for this content | `hypothesis` | A pure-Telugu design under-serves; or mix is rare | Recorded samples, Phase 0 | open |
| AS-04 | A spoken summary can be mapped to report fields without reading from the app | `hypothesis` | Voice flow needs the form on screen | Wizard-of-Oz test | open |
| AS-05 | Correction of a transcript is cheaper than typing the report | `hypothesis` | Core value proposition fails | Timed comparison | open |
| AS-06 | Workers will accept being recorded for a report | `hypothesis` | Adoption barrier unrelated to tech | Interviews, consent uptake | open |
| AS-07 | A mid-range Android phone with mobile data is the target device | `assumption` | Wrong device constraints | Ask in Phase 0 | accepted |
| AS-08 | Telugu script (not Romanised Telugu) is the acceptable output form | `assumption` | Romanised output would be preferred | Ask in Phase 0 | accepted |
| AS-09 | Reports are prepared daily or per-session | `hypothesis` | Cadence changes the whole UX | Phase 0 | open |
| AS-10 | A printable/copyable draft is useful even without submission | `hypothesis` | Output has no consumer | Ask supervisors | open |
| AS-11 | ≤ 3 clarification questions is tolerable | `assumption` | More questions kill the flow | Phase 5 pilot usage data | accepted |
| AS-12 | A hosted ASR call is acceptable under consent, or on-device is required | `hypothesis` | Architecture/legal rework | Phase 0 consent discussion | open |
| AS-13 | Field staff can review Telugu question text in config without engineering help | `assumption` | Config review becomes a bottleneck | Try it with one reviewer | accepted |
| AS-14 | Photo submission is a material part of the reporting burden, not a side task | `hypothesis` | If photos are the real bottleneck, a text/voice product may miss the point | Timed observation of the photo step | open |
| AS-15 | A supervisor is a reliable source for "what is actually required" | `hypothesis` | We optimise for the wrong reviewer | Supervisor interview + cross-check against worker practice | open |
| AS-16 | One field set can serve both Poshan Tracker and Bala Sanjeevini | `hypothesis` | Two divergent field sets; duplicated UI | Observe both, compare field lists | open |

**Rules for this register:** an assumption may be *accepted* only if it is reversible and documented here.
It may never be silently promoted to `verified`. When a finding contradicts an assumption, the assumption is
marked `rejected` and the dependent design is revisited in the same week.

---

## 3. Open decisions (blocked on research)

| # | Decision | Blocked by |
|---|---|---|
| D-1 | Final field list, types, required/optional, bounds | AS-01, AS-04, AS-09 |
| D-2 | Report cadence and period semantics (daily vs. weekly; "today" vs. "this week") | AS-09 |
| D-3 | ASR provider | Phase 2 bake-off |
| D-4 | Cloud vs. on-device transcription | AS-12 |
| D-5 | Whether confirmation is per-field or per-section | Phase 4 usability |
| D-6 | Whether the preview should mimic any existing form layout | AS-10, supervisor input |
| D-7 | Language of the UI chrome (Telugu-only vs. bilingual labels) | Phase 0 preference |
| D-8 | Hackathon date and demo scope | Date not yet recorded — see roadmap "Deadline discipline" |
| D-9 | Scope relationship: one field set for both apps, or per-app field sets? Is photo capture in scope? | Q-10, Q-11 |

---

## 4. How the three project rules are enforced

Not slogans — each has a mechanism that fails loudly.

| Rule | Enforced by |
|---|---|
| **1. Never treat an assumption as a verified requirement** | `verified` requires a `validated_in` citation (schema-enforced); `scripts/verify-structure.mjs` fails a `verified` field without one; every config field carries a `verification.status`; `RESEARCH_FINDINGS.md` separates verified from observed |
| **2. Never use real beneficiary data** | No beneficiary/child entity exists in the data model; the config guardrail rejects `beneficiary`, `aadhaar`, `child_id`, `credentials` keys; no photos of children at any stage; `.gitignore` blocks recorded audio |
| **3. Never build a feature without naming the task it improves or replaces** | Each phase gate names the replaced task; a requirement without a Phase 0 citation stays in the hypothesis column; roadmap rule 3 rejects features that replace nothing |

## 5. Change log

| Date | Change | By |
|---|---|---|
| 2026-11-16 | Initial registers created; ADR-001…009, AS-01…AS-13 | Project init |
| 2026-11-16 | Phase structure aligned to the agreed 6-phase plan; photo submission added as a research target; AS-14…AS-16 and D-8/D-9 added | Planning review |
