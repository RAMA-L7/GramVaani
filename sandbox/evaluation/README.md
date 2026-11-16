# ASR evaluation workspace

**Status: prepared, not run.** No audio corpus, no ASR output, no WER/CER results exist here. This folder is
a tool and template for the independent evaluation described in
[TECHNICAL_EVALUATION_PLAN.md](../docs/TECHNICAL_EVALUATION_PLAN.md). It is not part of the sandbox product.

## Contents

| File | Purpose |
|---|---|
| `score.py` | Standard-library WER/CER scorer from reference/hypothesis JSONL files |
| `reference.template.jsonl` | Example record shape only — **not** real transcripts or results |

## How to use (once consented audio and transcripts exist)

Create one JSONL file per system output, with identical `id` values:

```json
{"id": "clip-001", "text": "ఈరోజు ఇరవై నాలుగు మంది పిల్లలు వచ్చారు"}
```

Then run:

```powershell
cd D:\GramVaani\sandbox\evaluation
uv run python score.py reference.jsonl hypothesis-indicwhisper.jsonl
uv run python score.py reference.jsonl hypothesis-hosted.jsonl
uv run python score.py reference.jsonl hypothesis-ondevice.jsonl
```

The script prints per-clip and aggregate WER/CER with substitution/deletion/insertion counts. Number and
field extraction accuracy, correction frequency and latency are measured by the same procedure defined in
the evaluation plan; this scorer covers only the error rates.

## Rules

- Only use audio recorded with separate, documented consent and no beneficiary data.
- Never put raw audio or real field notes in Git; they are gitignored.
- Do not publish a provider ranking without stating corpus, device, normalisation and consent conditions.
- Scripted sandbox transcripts are a control, **not** an ASR measurement.
