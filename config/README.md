# Reporting field configuration — v0.1.0

> ⚠️ **Every field in this file is an unverified hypothesis.** None has been confirmed against field
> research, official documentation, or any government system. Do not treat this as a specification of what
> Anganwadi workers are required to report.
>
> Edit this file, not the code. Bump `config_version` on every change.

**How to use:** the backend loads this file at startup, validates it against `report-fields.schema.json`,
and derives the extraction schema, clarification questions, and preview layout from it. Adding or removing a
field must never require a source change.

**Verification values:** `unverified` → `observed` (seen once in a session) → `verified` (≥ 2 sources, with a
`validated_in` citation) → `rejected` (tested, false — remove it).
