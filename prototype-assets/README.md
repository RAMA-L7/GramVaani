# Prototype assets

Everything here is **synthetic and team-authored**. Nothing is derived from a real worker, child, family, or
centre.

| Folder | Contains | Rule |
|---|---|---|
| `audio-samples/` | Team-recorded scripted clips (Telugu, code-mixed) | Audio is gitignored; keep a `manifest.md` with the script and duration |
| `synthetic-reports/` | Example transcripts + expected extraction output | Paired `.md` / `.expected.json` |
| `prompt-library/` | Draft prompts used by the extraction stage | Versioned; note the config version they assume |
| `ui-mocks/` | Wireframes and screenshots of the flow | Screenshots only from synthetic sessions |

## Why this folder exists separately from `tests/`

`tests/` holds assertions. This folder holds **raw material**: the audio, the scripts, the prompts, the
mocks. Tests reference assets here by path, so a fixture has one home and can be inspected by a
non-engineer.

## Adding a sample

1. Write the script first (`synthetic-reports/example-<nnn>-<name>.md`).
2. Record it; name the file `synthetic-<nnn>-<lang>-<variant>.<ext>`.
3. Add a line to `audio-samples/manifest.md`: file, duration, script path, speaker profile, notable features.
4. If it becomes a regression fixture, add the expected output and wire it into `tests/`.
