# GramVaani Sandbox — architecture (one page)

> **SIMULATED ENVIRONMENT — scripted Telugu transcripts, synthetic data, no government integration.**

Print this page. Full design notes are in [ARCHITECTURE.md](ARCHITECTURE.md).

```
                         ┌──────────────────────────────┐
                         │  Browser (Next.js, port 3000) │
                         │  /voice  /reporting  /dashboard│
                         └───────────────┬──────────────┘
                                         │ typed JSON over localhost
                         ┌───────────────▼──────────────┐
                         │   FastAPI service (port 8000) │
                         │       /api/*  + CORS          │
                         └───────────────┬──────────────┘
     ┌───────────────────────────────────┼───────────────────────────────────┐
     │                                   │                                   │
┌────▼─────────────┐   ┌─────────────────▼──────────────┐   ┌────────────────▼─────┐
│ Scenario store   │   │ Voice pipeline                  │   │ Simulated gateway    │
│ scenarios/*.json │   │ ASR adapter → normalise →       │   │ /gateway/submit      │
│ 22 synthetic     │   │ extract → clarify → confirm →   │   │ idempotency + modes  │
│ cases            │   │ assemble → validate            │   │ → dummy dashboard    │
└──────────────────┘   └─────────────────┬──────────────┘   └────────────────┬─────┘
                                         │                                  │
                         ┌───────────────▼──────────────┐                   │
                         │ SQLite (sandbox.db)          │◄──────────────────┘
                         │ reports + gateway submissions │
                         └──────────────────────────────┘

  ASR adapter: ScenarioASRProvider / TextASRProvider   (scripted, simulated:true — no real speech)
  Extraction adapter: RuleExtractionProvider            (deterministic, source-span grounded)
  Field contract: config/sandbox-fields.json            (ILLUSTRATIVE_NOT_OFFICIAL, separate from main config)
```

## Seams that matter

| Seam | Why it exists |
|---|---|
| ASR provider adapter | A real Telugu ASR can be added later without touching the pipeline — but only after a measured evaluation with consented audio (D-12) |
| Extraction adapter | Rules today; a schema-constrained model later; both must produce verbatim `source_span` |
| Field config | Illustrative fields are data, not code; the main `config/report-fields.json` is untouched |
| Gateway | Local simulation only — idempotency, validation rejection, network failure/retry; never contacts a government system (D-11, ADR-006) |

## Data boundary

- Worker `SYN-W001`, centre `SYN-C001`, invented counts and remarks. No beneficiary, credential, child photo
  or real audio anywhere.
- `photo_attached` is a boolean flag for a synthetic placeholder only.
- No external model calls, no cloud keys, no telemetry, nothing leaves the machine.

## Claim boundary

Proves component communication, grounded data flow, validation/correction, and that the simulated gateway
handles duplicate submissions and network failures in tested scenarios. Does **not** prove actual Telugu
speech recognition accuracy, regional Telugu accent handling, Telugu–English code-mixed speech accuracy,
performance in noisy environments, workload reduction, or government compatibility. The problem hypothesis
remains total documentation burden (D-10), not app-entry time. See [RESULTS_SHEET.md](RESULTS_SHEET.md).
