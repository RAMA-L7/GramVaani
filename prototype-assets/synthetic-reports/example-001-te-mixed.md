# Synthetic transcript — example 001

> **Invented.** Recorded by the team as a target for the pipeline. No real worker, child, or centre is
> represented. The numbers are made up. This is a *speech-shaped* sample, not a clean one: it includes
> false starts, English loanwords, and spoken numerals.

**Audio:** `prototype-assets/audio-samples/synthetic-001-te-mixed.wav` *(to be recorded)*
**Speaker profile (synthetic):** female, Telugu-dominant, comfortable with English work terms
**Duration (target):** ~35 s
**Scenario:** end-of-day summary, mixed activity day

---

## Verbatim (Telugu script, English tokens preserved)

ఈరోజు తేదీ... పదహారు నవంబర్. సెంటర్‌లో ఇరవై నాలుగు మంది పిల్లలు వచ్చారు. ఉదయం పూర్-స్కూల్ క్లాస్ చేశాం —
పాటలు, కథలు చెప్పాం. మధ్యాహ్నం అన్నం, పప్పు, కూర పెట్టాం. పది మంది పిల్లల బరువు తూకం వేశాం.
ఒక పిల్లవాడిని PHC కి refer చేశాం. ఇంటికి తీసుకెళ్లే పౌష్టికాహారం ఈరోజు ఇవ్వలేదు, వచ్చే వారం ఇస్తాం.
ఇంకా రెండు ఇళ్లకు home visit కి వెళ్ళాం. ముగ్గురు పిల్లలు జ్వరంతో రాలేదు.

## Romanised reading aid (for the team, not for the model)

> eeroju tēdi... padahāru navambar. sentarlō iravai nālugu mandi pillalu vacchāru. udayaṁ pūr-school class
> cēśāṁ — pāṭalu, kadhalu ceppāṁ. madhyāhnaṁ annaṁ, pappu, kūra peṭṭāṁ. padi mandi pillala baruvu tūkaṁ
> vēśāṁ. oka pillavāḍini PHC ki refer cēśāṁ. iṇṭiki tīsukeḷḷē pauṣṭikāhāraṁ eeroju ivvalēdu, vaccē vāraṁ
> isthāṁ. iṁkā reṇḍu iḷḷaku home visit ki veḷḷāṁ. mugguru pillalu jvaraṁtō rālēdu.

## What this sample is designed to stress

| Feature | Where |
|---|---|
| Spoken numeral | `ఇరవై నాలుగు` (24), `పది` (10), `రెండు` (2), `ముగ్గురు` (3) |
| English loanwords kept verbatim | `పూర్-స్కూల్`, `PHC`, `refer`, `home visit` |
| False start / filler | `తేదీ...` before the date |
| Negation | `ఇవ్వలేదు` (not given) — must not become "given" |
| Derived value | absentees `3` stated, present `24` stated — do **not** overwrite either |
| Intent needing no field | `వచ్చే వారం ఇస్తాం` (next week) — future, not today's report |
| Multi-activity day | pre-school + meal + weighing + referral + home visits |

## Notes for test authors

- The expected output is in `example-001.expected.json`. It is the *target*, not ground truth: it was written
  by the team, not validated by a worker.
- `remark` deliberately contains a health detail that must be scrubbed of any identifying information before
  display in a real deployment; here it is already generic.
