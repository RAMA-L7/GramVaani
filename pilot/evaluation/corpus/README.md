# Evaluation Corpus (Real, Consented Speech)

This directory is the **layout for real, consented evaluation audio**. **Do not create or commit real recordings in this repository.** Audio and derived personal data must stay local, access-controlled, and handled per consent/safeguarding protocols.

## Required layout

Two supported forms:

### A. Manifest-based (recommended)
- `manifest.json` (local, not committed if it contains sensitive metadata)
- audio files referenced by manifest (local only)
- optional reference/expected files

Example `manifest.json` (illustrative, do not include real personal data):
```json
{
  "corpus_id": "consented-pilot-batch-01",
  "consent_metadata_ref": "local-secure-location-or-id",
  "real_speech_evaluation": true,
  "clips": [
    {
      "id": "clip-001",
      "audio": "clip-001/audio.wav",
      "reference": "clip-001/reference.txt",
      "numbers_file": "clip-001/numbers.expected.json",
      "fields_file": "clip-001/fields.expected.json",
      "consent": {
        "consent_id": "local-id",
        "date": "YYYY-MM-DD",
        "scope": "asr-evaluation",
        "withdrawal_process": "documented-locally",
        "retention": "per-protocol"
      }
    }
  ]
}
```

### B. Per-clip directory convention
```
corpus/
  <clip-id>/
    audio.wav|m4a|webm|mp3|ogg        (local, gitignored)
    reference.txt                     (local, gitignored if derived from participant speech)
    numbers.expected.json             (local)
    fields.expected.json              (local)
    consent.json                      (local, no personal identifiers committed)
```

## `numbers.expected.json`
Ordered list of normalized expected number tokens/values for recognition checks, e.g. `["10", "12.5"]`.

## `fields.expected.json`
Key/value object of expected extracted fields for the clip, e.g. `{"children_present": 10, "activity": "..."}`.

## Consent metadata
Each clip/run must be traceable to documented consent (scope, date, retention, withdrawal). Store identifiable consent records outside the repo; only local references/IDs should be used here. Follow `research/instruments/PILOT_SAFEGUARDING_PROTOCOL.md` and applicable approvals.

## Running evaluation
- Comparison runner: `python compare.py --corpus corpus --real-speech --approaches ...`
- Scoring: `python score.py --runner-results results/run.json --out results/summary.json`
- **Never fabricate recognition accuracy results.** If no real consented corpus exists, do not claim real ASR accuracy.
