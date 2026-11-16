# Scripts

Developer utilities. Empty for now — deliberately, since most of them depend on code that does not exist.

## Planned (Phase 1+)

| Script | Purpose | Dependency |
|---|---|---|
| `validate-config.mjs` | Validate `config/report-fields.json` against its schema; run in CI and pre-commit | Node + ajv |
| `bench-asr.mjs` | Run the provider bake-off over `prototype-assets/audio-samples/`, emit WER/CER + latency table | Phase 1 providers |
| `make-fixture.mjs` | Turn a synthetic transcript into an extraction fixture skeleton | Phase 3 |
| `report-config-diff.mjs` | Show what changed between config versions, in plain language | Config only |

Until then, validate the config with a single command:

```powershell
node -e "JSON.parse(require('fs').readFileSync('config/report-fields.json','utf8')); console.log('config JSON ok')"
```
