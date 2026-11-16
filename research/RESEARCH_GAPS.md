# Research Gaps, Contradictions and Evidence Map

_Lead consolidation of seven domain reports + two independent reviews, 2026-11-16._
_Companion documents: [RESEARCH_SYNTHESIS.md](RESEARCH_SYNTHESIS.md), [SOURCES_AND_REFERENCES.md](SOURCES_AND_REFERENCES.md)._

---

## 1. Contradictions found and how they were handled

| # | Conflict | Resolution | Residual risk |
|---|---|---|---|
| C1 | GOVERNMENT_APPS said ICDS-CAS → Poshan Tracker replacement was `[UNKNOWN]`; ICDS_REPORTING and WORKLOAD said `[VERIFIED]` | Replaced with `[PUBLISHED EVIDENCE]` from World Bank 2024 + corroboration; **data migration / shared DB / API sync remain UNKNOWN** | We still cannot describe *how* the transition happened technically |
| C2 | Poshan Tracker rollout: 1 Mar 2021 (guidelines, SPNIWCD) vs 13 Jan 2021 (PIB 2022 document) | Use **1 Mar 2021** as best-supported; note the conflicting PIB date wherever relevant | Low impact; no product decision depends on the exact day |
| C3 | AP AWC counts: 55,607 / 26 districts (Bala Sanjeevani site) vs 55,776 / 28 districts (AP WDCW home) | Record **both**, attributed; do not pick one | Any scale claim in a deck must cite the specific portal |
| C4 | THR cadence: national 1st & 15th vs AP 1st & 3rd Friday | Treated as a genuine national/AP difference | Confirms that national rules must not be copied into AP fields |
| C5 | "Considerable time in government apps" (our O-1) vs measured app time (~13 min/day MP, ~24 min/day AP) | Origin claim stays `[UNVERIFIED]`/`[hypothesis]`; paperwork burden is `[PUBLISHED EVIDENCE]` | **Highest-risk contradiction for the project** — see RESEARCH_SYNTHESIS |
| C6 | "Preschool photo submission" (our Phase 0 step 5) vs no official rule found; documented photo mandate is commodity FRS | Keep step 5 as **observation**, explicitly not an assumed requirement; AS-14 weakened | A local practice may still exist — only a visit can settle it |
| C7 | Official claim "Poshan Tracker substantially reduced workload" (Lok Sabha 2026) vs no supporting time series | Labelled `[UNVERIFIED]` official assertion | Do not repeat as fact |
| C8 | Gram Vaani ASR Challenge corpus size: COMP says ~1,108 h; TEL says size not established | Prefer the ISCA paper (direct source) over the general note; treat TEL as incomplete | None for product decisions |
| C9 | 24-language Poshan Tracker UI: official brief `[PUBLISHED EVIDENCE]` vs snippet-only elsewhere | Use the official brief; mark the snippet as unverified | Low |
| C10 | Bala Sanjeevini TCS attribution: site credit is an image/logo | Downgraded from `[VERIFIED]` to `[PUBLISHED EVIDENCE]` | Vendor relationship detail is not decision-critical |

## 2. Duplicate findings consolidated (not repeated in the synthesis)

1. Poshan Tracker ownership, rollout and modules — GOV, ICDS, AP, COMP → one entry in synthesis.
2. ICDS-CAS → Poshan Tracker transition — ICDS, WL, COMP, GOV → one entry (see C1).
3. Dual paper + app/WhatsApp reporting — ICDS, WL, COMP → one finding with two independent sources.
4. Entry cannot be edited / faulty data not verified — GOV, COMP → one anti-pattern.
5. Device, network and server failures and the "merge the apps" request — AP, WL, COMP → one finding.
6. AP coverage counts — AP, ICDS, WL → one entry with both figures.
7. 11 registers / documentation burden — ICDS, WL, COMP → one finding with distinct source families.
8. FRS/face matching and "no child photo" — GOV, AP, ICDS, PRIV → one finding.
9. Voice/IVR and local-language typing barriers — WL, COMP, TEL → one finding.
10. Gram Vaani (Hindi) ASR challenge — TEL, COMP → one entry with corrected citation.

## 3. Over-strong labels corrected by the reviewers

| File | Correction | Reason |
|---|---|---|
| PRIVACY_AND_SAFEGUARDING.md | DPDP Act/Rules commencement dates → `[UNVERIFIED]` | Gazette PDFs blocked; secondary sources only |
| PRIVACY_AND_SAFEGUARDING.md | Wikipedia-family claims (CRC, ethics, ICDS/AWW, biometrics) → `[PUBLISHED EVIDENCE]` max | Two Wikipedia pages are one encyclopedia, not independent sources |
| PRIVACY_AND_SAFEGUARDING.md | Our own rules and the "consistent with standards" inference → project premise / `[UNVERIFIED]` | Project rule 1: never treat an assumption as a verified requirement |
| ICDS_REPORTING_REQUIREMENTS.md | Several single-family `[VERIFIED]` labels should read `[PUBLISHED EVIDENCE]` | MWCD + SPNIWCD = one programme family; AP portals = one department |
| GOVERNMENT_APPS_RESEARCH.md | MWCD ownership and PMMVY design → `[PUBLISHED EVIDENCE]` | Same product family / republished scheme data |
| ANDHRA_PRADESH_WORKFLOW_RESEARCH.md | TCS ownership → `[PUBLISHED EVIDENCE]` | Site credit is a logo; Play listing is a store |
| TELUGU_VOICE_TECH_RESEARCH.md | IndicWhisper ranking and Web Speech limits → `[PUBLISHED EVIDENCE]` | Each rests on one paper/documentation set |
| COMPARABLE_SOLUTIONS.md | FormBharo marked as **preprint** | Numbers confirmed, but not peer-reviewed |
| TELUGU_VOICE_TECH_RESEARCH.md | Source 50 arXiv ID fixed to the ISCA paper | Previous ID pointed to Vistaar |

## 4. Evidence map — research questions and assumptions

`AE` = answered by published evidence · `PA` = partially answered · `SU` = still unknown

| ID | Topic | Status | Basis / what is missing |
|---|---|---|---|
| Q-1 | Actual report fields | PA | Poshan Tracker modules and national registers documented; **no current AP field list or diary format** |
| Q-2 | Cadence | PA | Poshan Tracker daily/monthly + AP Friday distribution documented; **our prototype's cadence unconfirmed** |
| Q-3 | Where time goes | AE | ~51–82 min/day registers vs ~13–24 min/day apps (two independent time-use sources) |
| Q-4 | Telugu–English mixing | SU | No field measurement; no Telugu AWW corpus |
| Q-5 | Narrative free text | SU | Not addressed by any source |
| Q-6 | Who reads the report | PA | Supervisor/CDPO dashboards documented; **specific reader of our draft unknown** |
| Q-7 | Recording consent | SU | Not measured |
| Q-8 | Supervisor confirmation | SU | Duties documented; effect on our draft untested |
| Q-9 | Correction effort tolerance | SU | No AWW voice-reporting trial; FormBharo is Hindi and a preprint |
| Q-10 | Poshan ↔ Bala relationship | PA | **Parallel systems documented**; integration/SSO/shared DB explicitly UNKNOWN |
| Q-11 | Preschool photos | PA | No official rule found; commodity FRS photo mandate documented; local practice unknown |
| AS-01 | Workers spend considerable time in apps | PA — contradicted | Measured app time is small; reformulate as *documentation burden* |
| AS-02 | Pain is typing, not recall | SU | Paper vs typing vs recall not separated in any study |
| AS-03 | Telugu–English mixing natural | SU | No field data |
| AS-04 | Spoken summary maps to fields | SU | Wizard-of-Oz still required |
| AS-05 | Correction cheaper than typing | SU | No trial |
| AS-06 | Recording acceptable | SU | No consent data |
| AS-07 | Mid-range Android target | PA | Android-only app and device complaints documented; our target device unconfirmed |
| AS-08 | Telugu script output | SU | App UI language evidence is snippet-level |
| AS-09 | Daily/per-session cadence | PA | Poshan Tracker daily elements; our report cadence unconfirmed |
| AS-10 | Printable draft useful | SU | No consumer identified |
| AS-11 | ≤3 questions tolerable | SU | Assumption only |
| AS-12 | Cloud vs on-device | PA | On-device technically feasible; consent/acceptability untested |
| AS-13 | Field staff can edit config text | SU | Not tried |
| AS-14 | Photos are a material burden | PA — weakened | No official preschool-photo rule found |
| AS-15 | Supervisor reliable source | SU | H7 untested |
| AS-16 | One field set for both apps | SU | Separate systems documented; field compatibility unknown |

## 5. What still requires direct field observation or supervisor confirmation

Ranked by decision impact (highest first):

1. **Q-11 / AS-14 / D-9 — preschool photos.** Is anything actually photographed and submitted, how many photos, how long, is it the bottleneck? No official rule exists. Only a visit settles it.
2. **Q-1 / Q-2 / AS-09 / D-1 / D-2 — fields and cadence.** Actual AP diary/MPR format, field names, required-ness, deadlines, who fills what. Do not copy national templates into the config.
3. **Q-3 / AS-01 / AS-02 — stopwatch.** Measure the worker's own split: registers, app, recall, navigation, re-checking. Our whole value proposition depends on this.
4. **Q-10 / AS-16 / D-9 — app relationship in practice.** Does the worker touch both apps? Separate credentials? Is one copied from the other? Desk research says *parallel systems*, not *how the worker experiences them*.
5. **Q-4 / AS-03 — language.** Collect ≥10 real code-mixed utterances with consent; record which English/Hindi terms occur.
6. **Q-7 / AS-06 / AS-12 — recording consent and cloud acceptability.** Ask before choosing an ASR architecture.
7. **Q-9 / AS-05 / H1 — correction tolerance.** Timed voice vs typing comparison on synthetic content.
8. **Q-8 / AS-15 / Q-6 / AS-10 — supervisor review.** Who reads the draft; what would they reject?
9. **Q-5 — narrative.** Is free text part of the report at all?
10. **Current circulars at the project office** concerning photo/OTP/FRS and unpublished state instructions — may override public web documentation.

## 6. Source-quality and method gaps

- **websearch failed for all seven agents (HTTP 402/429).** Discovery relied on direct fetch, arXiv API and news RSS. Coverage is therefore narrower than intended; absence of evidence here is not evidence of absence.
- **20 verification fetches: 17 succeeded, 3 blocked.** Government domains (PIB, Gazette, eGazette, India Code, MeitY, UNICEF, WHO) returned 403/transport errors — exactly the sources we most wanted for legal facts.
- **No peer-reviewed study of voice-based reporting by Anganwadi workers was found.** Closest evidence is IVR with ASHAs and the FormBharo preprint with other rural users.
- **No public API documentation** for Poshan Tracker or Bala Sanjeevini. The PMMVY "Open API" statement has no published specification.
- **No Telugu Anganwadi speech corpus**, no code-mixed field ASR benchmark, no noise/accent study for this exact setting.
- **Legal specifics are the weakest area** — see the reviewer corrections in `PRIVACY_AND_SAFEGUARDING.md`.

## 7. What would change our mind

| If field research shows… | Then… |
|---|---|
| App entry really is the dominant burden locally | Revisit AS-01 and the value proposition with data; the evidence above would be the exception, not the rule |
| Photos are the real bottleneck | Pause the voice-text pipeline and re-scope D-9 entirely (rule 3: name the task being replaced) |
| Workers dictate to WhatsApp already | Test "structured WhatsApp-style voice note" rather than a new app |
| Poshan Tracker and Bala Sanjeevini are one workflow locally | Reconsider one field set vs many (AS-16) |
| Workers refuse recording | On-device-only architecture becomes a hard requirement, not a preference |
| Supervisor requires official-format output | Preview design changes; still no submission or compatibility claim |
