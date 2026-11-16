# Scripts

Developer utilities. Only `verify-structure.mjs` exists so far; the rest depend on code that does not exist.

## Available

| Script | Purpose | Run |
|---|---|---|
| `verify-structure.mjs` | Checks the field contract, provenance, fixture references, footer, folder layout, and Markdown links. No dependencies. | `node scripts/verify-structure.mjs` |

Run it before every commit. Exit code 1 means the config and the docs disagree.

## Planned (Phase 1+)

| Script | Purpose | Dependency |
|---|---|---|
| `validate-config.mjs` | Full JSON Schema validation of `config/report-fields.json` (supersedes the manual checks in `verify-structure.mjs`) | Node + ajv |
| `bench-asr.mjs` | Run the provider bake-off over `prototype-assets/audio-samples/`, emit WER/CER + latency table | Phase 1 providers |
| `make-fixture.mjs` | Turn a synthetic transcript into an extraction fixture skeleton | Phase 3 |
| `report-config-diff.mjs` | Show what changed between config versions, in plain language | Config only |

Until then, validate the config with a single command:

```powershell
node -e "JSON.parse(require('fs').readFileSync('config/report-fields.json','utf8')); console.log('config JSON ok')"
```
