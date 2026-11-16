# Pilot Known Limitations

This document records current limitations and unresolved dependencies for the GramVaani **pilot** (real-voice prototype track). It is not exhaustive and must be updated as evidence changes. Claims remain subject to D-10, D-11/ADR-006, D-12, and safeguarding requirements.

## Evidence and evaluation
- **Real Telugu ASR accuracy unmeasured without a consented corpus.** No real recognition accuracy results are fabricated in this repository. Synthetic fixture scores are automated, transcript-based checks only and do **not** represent real-world performance.
- **Accent, dialect, noise, and device/mic conditions not claimed or validated.** Robustness across speakers, environments, speaking rates, and code-mixing patterns is unknown until tested with consented, representative data and measured correction effort.
- **Correction effort/burden impact unproven.** Any reduction in documentation burden must be measured against real workflows (D-10, D-12); transcript/editing time may offset recognition gains.

## ASR approaches and dependencies
- **Browser Web Speech API (`browser_web_speech`)**: behavior/availability varies by browser, OS, language model, and network; transcripts are client-captured and must be ingested deliberately for comparison. Not a validated accuracy baseline.
- **Local faster-whisper (`local_faster_whisper`)**: requires optional dependency (`faster-whisper`), model download, and sufficient compute (CPU/GPU). Performance/latency will vary by model size and hardware; not run/validated here by default.
- **whisper.cpp**: not implemented as a bundled adapter in this framework; can be added as a local approach/adapter if needed.
- **Cloud providers (`cloud_provider`, e.g. Google/Azure/Sarvam)**: require credentials, network access, provider terms review, and a configured adapter; none bundled. Data handling/privacy implications must be disclosed and consented before any cloud transcription.
- **Comparison fairness:** approaches must be evaluated on the **same consented corpus** and comparable settings; missing runs must be reported as unavailable, not estimated.

## Product/scope limitations (Phase 0 / pilot constraints)
- **No field validation (Phase 0).** Field extraction/mapping is not validated against official reporting requirements; main field config remains unverified.
- **No government integration, submission, credentials, or compatibility claims** (D-11/ADR-006). Outputs are draft/research artifacts only, not official records.
- **No public deployment / no worker invite.** Pilot is for local/controlled research use; not production-hardened or publicly accessible.
- **Sandbox frozen:** pilot must not modify frozen sandbox behavior/artifacts; sandbox remains simulated fallback/reference as applicable.
- **Safeguarding/consent required for real data:** no real recordings committed; retention, withdrawal, and access controls must follow protocol and approvals.

## Operational/engineering limitations
- Backend/frontend scaffolds, end-to-end mic UI, and automated pilot tests may be incomplete depending on repo state; startup scripts detect missing entrypoints but cannot replace implementation.
- Local-first storage (e.g. `pilot.db*`) is not a secured multi-user deployment; secrets must not be committed.
- Latency/failure metrics depend on instrumentation in actual runs; synthetic fixtures do not measure runtime performance.
