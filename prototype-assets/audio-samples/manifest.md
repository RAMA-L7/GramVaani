# Audio sample manifest

Recorded by the team from a written script. **Audio files are not committed** (see `.gitignore`).

| File | Status | Duration | Script | Speaker profile | Stresses |
|---|---|---|---|---|---|
| `synthetic-001-te-mixed.wav` | to record | ~35 s | [example-001](../synthetic-reports/example-001-te-mixed.md) | Telugu-dominant, comfortable with English work terms | spoken numerals, negation, English loanwords, multi-activity |

## Recording checklist

- [ ] Quiet room, phone at ~30 cm, no music.
- [ ] Read the script **naturally**, including the hesitation — do not clean it up.
- [ ] One take at normal speed; optionally a second, faster take as a variant.
- [ ] Do not speak any real person's name or any real identifier.
- [ ] Save as 16 kHz mono WAV (or M4A if size matters), then note it above.
- [ ] Keep the file out of git; place it in this folder locally.

## Target coverage (as the corpus grows)

| Dimension | Variants to include |
|---|---|
| Speaker | 3+ speakers, at least one male, varying pace |
| Language mix | pure Telugu · light English terms · heavy code-mix |
| Numbers | spoken Telugu words · digits · corrections ("…no, twenty-six") |
| Content | nutrition day · preschool day · weighing day · home-visit day |
| Condition | quiet · some background noise (classroom) |
| Length | ~15 s (single activity) · ~60 s (full day) |

Aim for 30–50 clips before the ASR bake-off; fewer than that makes the comparison meaningless.
