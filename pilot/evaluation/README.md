# GramVaani Pilot Evaluation Framework

Dedicated, stdlib-first evaluation framework for the GramVaani **pilot** track (separate from frozen sandbox). It computes ASR/reporting-pipeline metrics, runs synthetic automated checks, and provides a comparison harness for multiple ASR approaches on the **same consented evaluation corpus when available**.

> **Safety / integrity:** This framework **never fabricates recognition accuracy results**. Synthetic fixtures are transcript-based checks only and must not be reported as real-world Telugu ASR accuracy. Real-speech evaluation requires a consented, locally stored corpus and (for some approaches) credentials/models.

## Metrics
Implemented in `wer_cer.py`, `metrics.py`, `score.py`:
- **WER / CER**: Levenshtein edit distance over normalized **words/chars**. Normalisation (`normalize.py`): Unicode NFC, whitespace collapse, Telugu→ASCII digit mapping for numeric comparison, optional Latin lowercasing, edge-punctuation stripping for word scoring. Empty-ref edge cases documented in code.
- **Number recognition accuracy**: ordered comparison of normalized number tokens (`expected_numbers` vs `observed_numbers`).
- **Field extraction accuracy**: key-wise comparison of expected vs observed extracted fields with normalization for strings/numbers.
- **Correction frequency**: rate/count of corrected records/events.
- **Manual correction effort**: word/char edit distance between produced text and corrected text (proxy for chars/fields edited effort).
- **Recognition latency**: mean/p50/p95/min/max over recorded `latency_ms` values.
- **Failure rate**: proportion of records with error/failed/timeout/unavailable status.

## ASR approaches (comparison harness: `compare.py`)
Runner records per-clip: `id, approach, hypothesis, reference, latency_ms, status/error, version/settings`.
- **A. `browser_web_speech`**: browser Web Speech API / client transcript capture. Harness ingests captured transcripts (e.g. `corpus/captured_transcripts/<id>.txt` or manifest `hypothesis`) because recognition happens client-side.
- **B. `local_faster_whisper`**: local `faster-whisper` if installed and model available. Configure model/device/compute/language via config.
- **C. `cloud_provider`**: cloud provider via config (e.g. Google/Azure/Sarvam) when credentials provided. Bundled as template/stub; supply `cloud.adapter = "module:function"` and credentials per provider SDK. No credentials bundled.

Approaches that cannot run are recorded as `unavailable`/`error` with reasons; no hypotheses invented.

## Layout
- `corpus/` — **real consented corpus layout only** (README, `.gitkeep`, gitignore). **No real recordings committed.**
- `fixtures/` — synthetic transcript-based fixtures (no personal data): Telugu-only, Telugu-English mixed, number formats, generic Anganwadi terminology/activity/material names, speaking-speed proxies, repeated words/pauses/incomplete sentences, with expected normalized numbers/fields.
- `results/` — curated `summary.json`/`summary.md` (machine-readable, frontend-consumable) indicating **no real evaluation run** in current state; raw/local outputs gitignored.
- `wer_cer.py`, `normalize.py`, `metrics.py`, `score.py`, `compare.py`

## Running

Prereqs: Python 3.10+ (stdlib-only for scoring/fixtures). Optional: [uv](https://docs.astral.sh/uv/) for env management.

### Synthetic fixtures (automated pipeline checks, no audio)
```powershell
cd D:\GramVaani\pilot\evaluation
python score.py --fixtures --out results/synthetic-fixtures-score.local.json
# or: uv run python score.py --fixtures --out results/synthetic-fixtures-score.local.json
```
Outputs metrics computed from in-repo synthetic fixtures. **Not real recognition accuracy.** (`*.local.json` ignored by `results/.gitignore`).

### Real-corpus evaluation (only with consented data/credentials/models)
1. Prepare local corpus per `corpus/README.md` with consent metadata; keep audio out of git.
2. Create a local config (do not commit secrets), e.g. `config.local.json`:
```json
{
  "approaches": {
    "browser_web_speech": {"captured_transcripts_dir": "corpus/captured_transcripts"},
    "local_faster_whisper": {"faster_whisper_model": "small", "device": "cpu", "compute_type": "int8", "language": "te"},
    "cloud_provider": {"provider": "sarvam|google|azure", "adapter": "my_adapters.sarvam:transcribe"}
  }
}
```
3. Run comparison on the same corpus:
```powershell
python compare.py --corpus corpus --real-speech --approaches browser_web_speech,local_faster_whisper,cloud_provider --config config.local.json --out results/run.local.json
python score.py --runner-results results/run.local.json --out results/summary.local.json
```
4. Review and, if appropriate, curate a non-sensitive `summary.json` for frontend consumption. Never publish identifiable data.

### Dependencies for optional approaches
- `local_faster_whisper`: `pip install faster-whisper` (+ model download/compute as needed).
- `cloud_provider`: provider SDK + credentials + a small adapter function matching `fn(clip, cfg) -> {"status","hypothesis","error?","engine?"}`.

## Frontend Evaluation page
`results/summary.json` is structured for UI consumption: `status`, `real_speech_evaluation`, `claims`, per-approach states/metrics (null when not run), and notes distinguishing synthetic vs real evaluation. Extend schema additively when real runs are curated.
