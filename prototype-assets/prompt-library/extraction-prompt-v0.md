# Extraction prompt — v0 draft

**Status:** draft. Not wired to any code. Expected to change several times during Phase 3.
**Used by:** `LlmExtractor` (`backend/app/providers/extraction/llm.py`, not written yet).

---

## Design constraints (non-negotiable)

1. **The field list is generated from `config/report-fields.json`.** Never hand-list fields in the prompt.
   If a field is not in the config, the model must be structurally unable to return it.
2. **Every value must be grounded in a span of the transcript.** A value with no `source_span` is dropped
   by the caller, so asking for spans is not optional.
3. **`null` is a valid answer.** Guessing is a defect. The prompt says so twice, deliberately.
4. **Negation and future tense matter.** `ఇవ్వలేదు` (not given) must not become "given"; `వచ్చే వారం ఇస్తాం`
   (we'll give next week) is not today's fact.
5. **Code-mixing is expected input, not noise.** Do not translate English terms into Telugu, do not
   "improve" the speaker's register, do not transliterate.
6. **Spoken numerals** (`ఇరవై నాలుగు`) and digits (`24`) are both normal. Output the number, keep the
   surface text in `raw_text`.

## Prompt template

```
SYSTEM
You extract structured report fields from a Telugu (code-mixed with English) spoken summary
by an Anganwadi worker.

Rules:
- Use ONLY the text provided. Do not infer, complete, or invent values.
- If a field is not clearly stated, return null and a short reason. Do not estimate.
- For every non-null value, copy the exact substring of the transcript that supports it into
  "source_span". It must appear verbatim in the transcript.
- Spoken numbers may be Telugu words. Normalise to a number; keep the original words in "raw_text".
- Do not translate or transliterate English terms (attendance, PHC, home visit). Keep them as spoken.
- Negation changes meaning: "ఇవ్వలేదు" = not given. Future plans ("వచ్చే వారం") are not today's values.
- Do not create fields that are not in the schema.
- Output JSON only, matching the schema. No prose.

USER
Schema (generated from config):
{{JSON_SCHEMA}}

Transcript:
"""
{{TRANSCRIPT}}
"""

Config hints (field_id → phrases the worker may use):
{{HINTS_TABLE}}
```

## Post-validation (in code, not in the prompt)

| Check | On failure |
|---|---|
| JSON parses against generated schema | Drop the whole response; retry once; then fall back to rules |
| `source_span` is a substring of the transcript (normalised whitespace) | Drop that value only |
| Numeric value within `validation.min/max` | Drop + log `out_of_bounds` |
| `enum_list` values in `options` | Drop unknown option, keep the rest |
| No extra fields present | Drop them silently (schema already prevents this) |
| `null` for a required field | Keep as a gap → clarification stage |

## Known weaknesses to test

- Multi-activity days: the model may pick only the first activity.
- Negation in a subordinate clause ("meal was served but ration was not given").
- Numbers spoken twice with a correction ("twenty-four… no, twenty-six came").
- Mixed date expressions ("today", "the 16th", "yesterday evening").
- Remark text that duplicates another field (allowed, but must be confirmed twice without confusion).

## Things this prompt must never be asked to do

- Summarise, advise, or judge the worker.
- Fill in a field because it is "usually" X.
- Produce a report that looks complete when it is not.
- Mention beneficiaries, names, or official requirements.
