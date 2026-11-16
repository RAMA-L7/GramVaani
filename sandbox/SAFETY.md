# Sandbox safety — claim checklist and data rules

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

This file is mandatory reading before anyone demonstrates or describes the sandbox. The sandbox is an
experiment in *whether a simulated pipeline works reliably*. It is not a product, not research evidence,
and not a government system. When in doubt, use the "Permitted demo wording" section
below and nothing stronger.

## Permitted demo wording

Use this sentence **verbatim** (from [API_CONTRACT.md §7](API_CONTRACT.md)). Do not paraphrase it into
a stronger claim:

> "We built a simulated reporting environment to evaluate whether Telugu voice input, structured
> extraction, validation and API-based data transfer work reliably. Actual government workflow
> compatibility remains subject to field validation and authorization."

## Forbidden demo claims

Never say or display any of the following, in slides, narration, README text, or a demo recap:

- **"Poshan Tracker integration is complete / we integrated with Poshan Tracker."** No such
  integration exists, is authorised, or has a documented interface (D-11, ADR-006).
- **"Bala Sanjeevini integration is complete / we integrated with Bala Sanjeevini."** Same — no
  documented interface exists.
- **"We verified the official requirements" / "these are the official reporting fields."** The fields
  in `config/sandbox-fields.json` are invented and marked `ILLUSTRATIVE_NOT_OFFICIAL`.
- **"Government-approved" / "endorsed" / "compatible with government systems."** No approval or
  compatibility has been established.
- **"Proven workload reduction" / "saves workers N minutes" / "reduces documentation burden."** No
  time-and-motion measurement occurred here. Workload remains a Phase 0 / Phase 5 research question
  under D-10 and D-12.

Also avoid implying that this demo realises or validates any of the open hypotheses: real Telugu ASR
accuracy, code-mixed field speech, field-unproven correction effort, cadence, or field set. None of
those are established by a scripted, synthetic run.

## Claim checklist — before you say it, check it

| If you want to say… | Allowed? | Say instead |
|---|---|---|
| "We built a simulated reporting environment." | Yes | Use the permitted wording verbatim. |
| "Telugu voice input was scripted/simulated." | Yes | Say "scripted transcript, not live speech recognition." |
| "We extracted structured fields from a transcript." | Yes | Add "from a synthetic, scripted transcript." |
| "We validated and transferred data through an API." | Yes | Add "a local simulated gateway; nothing left this machine." |
| "This works with Poshan Tracker / Bala Sanjeevini." | No | "No government integration exists or is authorised." |
| "These are the official reporting fields." | No | "The fields are invented for the demo, not official requirements." |
| "We measured/proved time or workload savings." | No | "Impact is not measured here; it stays a research question." |

## Data rules

- **Synthetic data only.** All worker/centre codes, dates, counts and remarks are invented and carry
  `synthetic: true`. Never enter, paste, or upload a real name, Aadhaar, beneficiary record, real
  attendance figure, or real growth measurement.
- **No real audio.** The microphone button is a UI simulation: it starts a timer and loads a scripted
  transcript from the API. Do not record, upload, or commit any audio file. Recorded audio is blocked
  by `.gitignore` in the wider project.
- **No child photos.** `photo_attached` may only reference a synthetic sample placeholder — never a
  photo of a child. Do not collect, view, or display child photographs at any stage. There is no
  official preschool-photo requirement established by research.
- **No credentials.** Do not enter, store, or ask for any login, API key, token, or government-system
  credential. The sandbox has no authentication and no credential store.
- **Simulated API only.** `/api/gateway/submit` writes to a local SQLite table and produces a receipt
  for a dummy dashboard. It never contacts any external or government system. Describing it as
  "submission", "integration", or "transfer to a government system" is forbidden.
- **No cloud keys, no external model calls.** Transcription is scripted; there are no live ASR or LLM
  service calls. Do not add any.

## Pre-demo review checklist

Complete every item before presenting. Any "no" means fix it or cut the claim.

- [ ] The persistent banner **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data,
      no government integration** is visible on every page.
- [ ] Narration and slides use the permitted wording verbatim; no forbidden claim appears anywhere.
- [ ] No real audio, child photo, beneficiary/personal data, or credential is present on screen or in
      the repo.
- [ ] The gateway transfer is shown and labelled as a **local simulation to a dummy dashboard**, with
      an explicit note that nothing leaves the machine and no government system is involved.
- [ ] `photo_attached`, if shown, references only a synthetic placeholder and is labelled as an
      invented, non-official field.
- [ ] The demo states that Telugu speech is **scripted**, that real ASR evaluation is a Phase 2 gate,
      and that this module does not change Phase 0 status or decisions D-10 / D-11 / D-12.
- [ ] The **"what this does not prove"** statement from the [demo script](docs/DEMO_SCRIPT.md) is
      included as a slide or spoken line.
- [ ] The field set is described as illustrative (`config/sandbox-fields.json`,
      `ILLUSTRATIVE_NOT_OFFICIAL`), not as official reporting requirements, and the main
      `config/report-fields.json` is untouched.
- [ ] A reviewer who did not build the sandbox has read this file and the claim checklist.

## Relationship to project rules and decisions

This safety posture enforces the project's standing rules: assumptions are never promoted to verified
requirements; no real beneficiary data; no feature without a named replaced task. It is consistent with
ADR-006 (no submission capability), ADR-008 (synthetic data only), and decisions D-11 and D-12. The
sandbox does not reinterpret or override any of them.
