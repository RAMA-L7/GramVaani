# Technical evaluation plan — Telugu ASR (not yet run)

> **No results are reported here.** The sandbox uses scripted transcripts; scripted text cannot measure
> real speech recognition accuracy. This plan defines how to evaluate real ASR independently before any
> provider is chosen. It does not change decision D-12: voice stays a hypothesis until tested with real,
> consented worker speech and measured correction effort.

## 1. Question

Which of at least three ASR approaches gives the best *usable* transcript for Telugu / Telugu–English
code-mixed Anganwadi reporting under field-like conditions — and at what privacy, latency and cost trade-off?

## 2. Approaches to compare (same corpus, same scoring)

| # | Approach | What it answers | Caveat |
|---|---|---|---|
| A | **IndicWhisper / open Indic model, self-hosted** | Best open-model accuracy; no audio egress | Needs compute; Telugu field accuracy not established |
| B | **Hosted ASR with documented `te-IN` support** (e.g., Google, Azure or Sarvam) | Cloud baseline and latency | Audio leaves the device — consent and data terms must be checked first |
| C | **On-device / quantized baseline** (e.g., whisper.cpp or Vosk Telugu) | Offline feasibility and privacy | Vosk Telugu is a weak floor; quantization fidelity unknown |
| Control | **Scripted transcript** (current sandbox) | Upper bound for the pipeline only | Not an ASR system; never report its numbers as ASR accuracy |

Prior research is in [TELUGU_VOICE_TECH_RESEARCH.md](../../research/TELUGU_VOICE_TECH_RESEARCH.md): open Telugu
benchmarks exist, but no field-validated Telugu Anganwadi ASR and no documented good code-mixed field system
were found. Benchmark ranking does not transfer to field audio.

## 3. Corpus requirements

- **30–50 clips**, 16 kHz mono, 15–60 s each, recorded by the team or by workers **with separate audio
  consent**; no beneficiary voice, names, records or credentials.
- Balanced across: pure Telugu; light Telugu–English mixing (`attendance`, ` meal`, `PHC`, `home visit`);
  spoken numerals; regional accents; quiet vs. classroom-like noise; one corrected utterance
  ("ఇరవై నాలుగు… లేదు, ఇరవై ఆరు").
- Reference transcripts written by a native Telugu speaker and reviewed by a second person; store
  `reference.txt`, `numbers.expected.json` and `fields.expected.json` per clip.
- Consent record, speaker code, device, acoustic condition and collection date stored with each clip.
  Raw audio is gitignored and deleted per the retention rule.

## 4. Metrics (define before running)

| Metric | Definition |
|---|---|
| WER | `(S + D + I) / N` edits (substitutions, deletions, insertions) over reference words, after documented normalisation |
| CER | Same edit rate over characters; report both script-level and romanised if used |
| Number extraction accuracy | Correct numeric values ÷ expected numeric values (including correction cases) |
| Field extraction accuracy | Correct field values ÷ expected field values, per field ID in `config/sandbox-fields.json` |
| Correction frequency | Characters edited ÷ transcript characters, and fields corrected ÷ fields, by a reviewer |
| Processing latency | p50 and p95 ms from audio end to transcript (and to extracted fields), per approach and device |
| Operational | Audio egress yes/no, estimated cost per hour, failure count, provider/model version |

Use the stdlib scorer in [evaluation/README.md](../evaluation/README.md) for WER/CER; report all metrics per
category (clean/noisy, pure/code-mixed, numeral-heavy), not just one aggregate. Freeze the normalisation
rules before scoring and apply the same rules to all approaches.

## 5. Procedure

1. Freeze corpus, reference transcripts, normalisation rules and the metric script.
2. Run all approaches on the **same** clips, with fixed versions and recorded settings; no tuning on the test set.
3. Store raw outputs (`id`, `hypothesis`, `reference`, timestamps) for audit.
4. Score WER/CER, then run the sandbox extraction on each hypothesis to get number/field accuracy.
5. Have a Telugu reviewer measure correction effort on a fixed subset; keep their edits as evidence.
6. Report failures and edge cases explicitly; do not discard difficult clips after seeing results.
7. Only then make a recommendation, with a written data-egress and consent decision.

## 6. Decision gate

No ASR/LLM provider is selected until this evaluation is complete and reviewed. A provider's advertised
accuracy is `[UNVERIFIED]` for our purpose. Any recommendation must state which corpus, device,
normalisation and consent conditions it was measured under.

**Permitted claim after evaluation:** "Under our corpus and conditions, approach X had the lowest WER and
correction effort." **Not permitted:** "Telugu ASR is accurate" or "voice reduces workload" — the latter
needs Phase 0/Phase 5 field measurement, not a technical benchmark.
