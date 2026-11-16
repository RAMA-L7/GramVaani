# Question preparation — hackathon demo

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

Short, honest answers to the questions most likely to be asked. Use the permitted wording in
[SAFETY.md](../SAFETY.md) and never upgrade a hypothesis into a claim. The demo boundary lists are in
[RESULTS_SHEET.md](RESULTS_SHEET.md).

## The strategic question

**"What makes GramVaani different from a normal voice-to-text application?"**

> "Voice-to-text only produces text. GramVaani is a **controlled reporting workflow**: Telugu speech →
> grounded extraction → clarification → human confirmation → structured report → simulated reporting
> transfer. Every extracted value carries the exact transcript phrase it came from, missing information is
> asked about rather than guessed, and nothing becomes a report until the worker confirms it. We stop at a
> local simulated hand-off — no real government system is involved. That workflow, not the dictation itself,
> is what we are testing."

A shorter version for a panel:

> "Dictation gives you text. GramVaani gives you a traceable, worker-approved report and a testable hand-off."

## Why simulated government applications?

> "Our research found no public API, SSO or documented integration for Poshan Tracker or Bala Sanjeevini,
> and no authorization to build one (D-11). A local simulation lets us test our own API contract, field
> mapping, validation errors, duplicate handling and retries without claiming compatibility, collecting
> credentials, or touching a real system. The dummy dashboard is our own; nothing leaves the machine."

Say explicitly: "This is **not** a Poshan Tracker or Bala Sanjeevini integration."

## Why is human confirmation necessary?

> "Because extraction can be wrong. In the demo, the rule parser reads 30 meals and the worker corrects it
> to 22 before the report is generated. Every value is shown with its source phrase so the worker can
> check it. We never let an unconfirmed value become a fact in the report. That is a design safeguard, not
> a judgement about workers — ASR and extraction are still unproven for this setting (D-12)."

Key points: transcript-first source of truth (ADR-002); `source_span` traceability; no silent correction;
clarification instead of guessing; explicit confirm gate.

## How will you validate real Telugu speech recognition?

> "We will not pick a provider from advertised accuracy. The evaluation plan compares at least three
> approaches on the **same** consented audio corpus — 30–50 clips covering Telugu, Telugu–English mixing,
> spoken numerals, regional accents and noise. We measure WER, CER, number extraction accuracy, field
> extraction accuracy, correction frequency and latency, then report per-category results. Until that
> happens, voice remains a hypothesis (D-12)."

Say explicitly: "The scripted transcripts in this demo are a **control**, not an ASR measurement."

## "Is GramVaani ready for deployment?"

Distinguish three stages — this is stronger than an unsupported yes/no:

| Stage | Status | Evidence |
|---|---|---|
| **Technical feasibility** | **Demonstrated in the sandbox** | Components communicate, grounded extraction and correction work, local gateway handles duplicates and retries — see [RESULTS_SHEET.md](RESULTS_SHEET.md) |
| **Speech accuracy** | **Not evaluated with real audio** | The demo uses scripted transcripts; WER/CER, accent, code-mixed and noise performance are unmeasured — see [TECHNICAL_EVALUATION_PLAN.md](TECHNICAL_EVALUATION_PLAN.md) |
| **Real-world impact** | **Not established through field research** | Phase 0 is open: 0 sessions, 0 verified findings; workload reduction is a hypothesis (D-10) |

> "Not yet. Technical feasibility is demonstrated in a simulated environment. Speech accuracy has not been
> measured with real consented audio, and real-world impact has not been established through field research.
> We are presenting a technical proof of concept and keeping those two questions open."

## Other likely questions

| Question | Answer |
|---|---|
| "Are these official reporting fields?" | "No. `config/sandbox-fields.json` is marked `ILLUSTRATIVE_NOT_OFFICIAL`; the main field config is unchanged and all 14 fields are `unverified`." |
| "Did you work with Anganwadi workers?" | "Not in this technical sandbox. Phase 0 field research is still open: 0 sessions, 0 verified findings." |
| "Does it reduce workload?" | "Not measured. Workload is a research question under D-10, not a result of this demo." |
| "Why SQLite / why local?" | "One worker, one device, no accounts, no sync — local-first keeps data under the worker's control and avoids creating a system of record for real data." |
| "What if the transcript is wrong?" | "It is editable, and extraction is re-run from the edited text. Values are dropped if their source phrase cannot be found." |
| "What happens if the API fails?" | "The simulated gateway returns a controlled error; retry reuses the same idempotency key, so no duplicate row is created." |
| "Why no photos of children?" | "No child photos at any stage — research found no official preschool-photo rule, and the sandbox uses a synthetic placeholder only." |

## Do not say

Any of the forbidden claims in [SAFETY.md](../SAFETY.md), especially "integrated with Poshan Tracker",
"official requirements verified", "government-approved", or "proven workload reduction". If you do not
know, say "unverified" — the credibility of the presentation depends on it.
