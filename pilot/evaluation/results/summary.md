# Evaluation Results Summary

**Status:** No real speech evaluation run.

- **Real speech evaluation:** not performed (no consented corpus evaluated in-repo).
- **Real recognition accuracy claims:** none. Results are **not fabricated**.
- **Synthetic/automated pipeline checks:** available via transcript-based fixtures in `evaluation/fixtures/` (`python score.py --fixtures`). These are synthetic checks only and must not be interpreted as real-world Telugu ASR accuracy.

## Approaches (configured, not measured on real corpus)
| Approach | Real-corpus status | Metrics |
|---|---|---|
| A. Browser Web Speech API / client transcript capture | not run | n/a |
| B. Local faster-whisper (or whisper.cpp) | not run | n/a |
| C. Cloud provider via config (Google/Azure/Sarvam etc.) | not run | n/a |

See `summary.json` for machine-readable state consumable by the frontend Evaluation page.
