# Resource Inventory

_Annotated index of the most useful resources found in the multi-agent study, 2026-11-16._
_Full deduplicated bibliography with URLs, dates and verification status: [SOURCES_AND_REFERENCES.md](SOURCES_AND_REFERENCES.md)._

Purpose: tell a future researcher **which resource to open first** for each question, and **which ones not to trust**.
This is an inventory, not a set of findings — findings live in the seven domain files.

---

## 1. Official applications and portals (highest value)

| Resource | Owner | Scope | Best for | Caution |
|---|---|---|---|---|
| Poshan Tracker — FAQ | MWCD | National | Roles, workflows, FRS, THR steps, languages, offline buffer | Rich but internally inconsistent on THR days and helpline history |
| Poshan Tracker — About / Journey | MWCD | National | Rollout (1 Mar 2021 per this source), module timeline, "data sharing" claim | Programme prose, not an API spec |
| Poshan Tracker — Resource Center | MWCD | National | Training videos, FRS and growth-monitoring PDFs | Asset dates not always shown |
| Poshan Tracker app listing (Google Play) | NeGD, GoI | National | Publisher identity, current update date | **App-store text is not proof of worker workflow** |
| Bala Sanjeevani official site | AP WD&CW | State-AP | Ownership, purpose, AWC counts, three service cards | AWC counts conflict with the AP department home page |
| Bala Sanjeevani 2.0 app (`com.ap.wdcw`) | AP WD&CW | State-AP | Current status (updated 4 Nov 2026), developer identity | Store description ≠ workflow; TCS credit is a logo, not a contract document |
| Bala Sanjeevani (older app, `com.ap.wdcw.bs`) | AP WD&CW | State-AP | Confirms a distinct legacy package | Version dates from third-party mirrors only |
| AP WDCW — Management Information Systems | AP WD&CW | State-AP | **Authoritative list of separate systems** (Poshan Tracker, Bala Sanjeevani, eSadhana, Milk Supply, THR-FRS, Supervision) | Does not describe data exchange between them |
| AP WDCW — Saksham Anganwadi and Poshan 2.0 | AP WD&CW | State-AP | AP rollout figures, THR cadence, ECCE kit and activities | Data as of 15 May 2024; budget references FY 2026-27 |
| AP WDCW / WCDSC department pages | GoAP | State-AP | Scheme history, plain/tribal Bala Sanjeevani, AWC counts | Same department family — not independent corroboration |
| PMMVY scheme + FAQ | MWCD | National | Scheme design, AWW role, Due List transfer, FRS reuse, "Open API" claim | "Open API" has no published specification; do not treat as an integration target |
| UMANG — PMMVY | GoI | National | Independent government corroboration of scheme existence | Republishes scheme data |

## 2. Policy and reporting documents

| Resource | Owner | Scope | Best for | Caution |
|---|---|---|---|---|
| Saksham Anganwadi & Poshan 2.0 — scheme guidelines (PDF) | MWCD | National | Legal basis, verticals, AWW/CDPO duties, Poshan Tracker §2.6, registers §3.9 | Exact publication date unclear from file title |
| PIB press release on the guidelines | PIB | National | Announcement, approval period, four verticals | Page date 02 Aug 2022 may be a re-post |
| SPNIWCD — Mission FAQ and Poshan Tracker brief | SPNIWCD / MWCD | National | Scheme differences, 1 Mar 2021 rollout, 24 languages | Same ministry family as the guidelines |
| ICDS District Manual (WHO-hosted, 2017) | GoI / UNICEF-supported | National | Register names, reporting chain (2nd/5th/10th/16th), supervisor/CDPO roles | **Outdated** — pre-Poshan Tracker; use for historical context only |
| World Bank learning note on mobile technology in ICDS (2024) | World Bank | National | ICDS-CAS → Poshan Tracker transition, 606k AWCs, 11 registers, dual recording | Secondary source, but the clearest statement of the transition |
| Sattva capacity-building perspective (2023) | Sattva | National | ~21 AWW responsibilities, 11 registers, worker quotes | Advocacy report, not official norms |
| AWW roles and responsibilities (state scan) | Govt of Tripura | National/state example | Independent state-government corroboration of duties | Tripura, not AP |
| NHM Format 7A (WIFS) | MoHFW | National | Example of a monthly AWC format with signatures | WIFS-specific — **not a generic ICDS template** |
| Lok Sabha reply on Poshan Tracker (2026) | MWCD / PIB | National | Official claims: March 2021, FRS, indicators, 2 CBEs/month | Political answer, not an operational manual |

## 3. Field evidence (published)

| Resource | Scope | Best for | Caution |
|---|---|---|---|
| Jain A et al., *BMC Health Serv Res* 2020 (MP, n=554) | State-MP | Time-use baseline: ~359 min workday, 51.1 min registers, 13.2 min app | Not AP; 2020 |
| CRISP time-use study, Andhra Pradesh (Jan 2025, n=21) | State-AP | **Closest AP evidence**: 17.02% ≈ 81.69 min paperwork/data entry; apps ≈ 24 min | Small n; off-site work not captured; full PDF was re-fetched by reviewer |
| Thakur et al., *Healthcare* 2025 | National | Duplicate app + WhatsApp reporting, 100+ messages/day | Qualitative |
| Gnanaselvam et al., *JFMPC* 2025 (n=381, Karnataka) | State-KA | Acceptance friction, "complicated our lives" | Training-evaluation context |
| Jain S et al., *Int J Med Inform* 2026 (n=350 AWWs) | National | Time constraint 77.4%, workload concern 80.9%, offline preference | Survey/intention, not observed behaviour |
| Patil et al., *BMJ Glob Health* 2022 | National | Digitisation improved service indicators (+8pp home visits) | Measures services, **not** reporting time |
| Jaacks et al., *Lancet Reg Health SE Asia* 2024 | National | Coverage vs. actual service caution; PMCID metadata needs checking | One suspect identifier — flagged in RESEARCH_GAPS |
| Bashingwa et al., *BMJ Glob Health* 2021 (ASHA IVR) | National | Voice/IVR reach and completion (41% initiated, 81% completed) | Different worker cadre, different task |
| Lok Sabha Q1121 (24 Jul 2026) | National | Official "substantially reduced workload" claim | Assertion without published time data — label UNVERIFIED |
| CAG ICDS audit reports (2013, 2024) | National | Register-quality findings | Checked: no quantified AWW app/reporting time |

## 4. Telugu speech and language technology

| Resource | Best for | Caution |
|---|---|---|
| Vistaar (Bhogale et al., INTERSPEECH 2023) | Telugu WER table, 59 benchmarks, noise conditions, benchmark-correlation warning | One benchmark family; Telugu absent from Common Voice comparison |
| IndicWav2Vec / "Next Billion Users" (Javed et al., AAAI 2022) | 17,000 h / 40 languages; open baseline | Clean-benchmark performance may not transfer to field audio |
| IndicVoices + IndicVoices-R (AI4Bharat) | 12,000 h / 208 districts; noise-robustness pipeline | Licence details not fully established |
| Shrutilipi (Bhogale et al., 2022) | 6,400 h mined audio-text pairs | Not Anganwadi vocabulary |
| Chauhan et al., AACL-IJCNLP 2026 ("Reality Gap") | Domain shift 11.60% → 41.72% WER; no-egress on-device adaptation | Hindi telephony, not Telugu field speech |
| Google / Azure / AWS language-support pages | Confirm `te-IN` support and feature matrices | Vendor documentation; no independent Telugu accuracy claim |
| Sarvam Saaras docs and pricing | Explicit `codemix` mode, keyterms, ₹0.49/min, streaming/batch | **Accuracy is a vendor claim (UNVERIFIED)** |
| whisper.cpp, ONNX Runtime, Vosk | On-device feasibility; Vosk Telugu is a floor (87.9 FLEURS WER) | Telugu conversion fidelity not established |
| MDN SpeechRecognition | Why Web Speech cannot be assumed offline or Telugu-capable | `te-IN` support still UNKNOWN |
| CoSTA, Telugu code-switch detection/LID papers | Evidence that code-mixing is studied mostly as text/LID/translation | No system documented as good at spontaneous Telugu–English field speech |
| Constrained decoding, SafePassage, LMDX, validation/clarification papers | Schema validity ≠ correctness; grounding, abstention, information-gain questions | Mostly general-domain, not Telugu |

## 5. Comparable tools and field reports

| Resource | Best for | Caution |
|---|---|---|
| FormBharo (arXiv, Aug 2026) | Closest analogue: calls → LLM extraction + **deterministic** validation/draft state; end-to-end evaluation on real speech | **Preprint**, numbers re-fetched and confirmed |
| Rest of World (14 Sep 2023), field interviews | Poshan Tracker no-edit/irrevocable entries, English-heavy UI, duplicate paper, upload delays | Journalism, not a representative sample |
| The Hindu (5 Aug 2025), ETV Bharat (17 Jul 2025) | AP photo+OTP+FRS mandate, device/network failures, demand to merge apps | Two independent reports; see inventory §1 |
| Dimagi "Designing for Low-Literate Users" | One-question-at-a-time audio prompts, numeric/single-select bias | Vendor guidance, useful but self-interested |
| ODK / KoboToolbox / DHIS2 docs | Form contracts, multilingual labels, skip logic, offline sync, supervisor validation | They solve form capture, **not** narration or clarification |
| HCINLP 2025 (Prabodhini vs myScheme) | Conversational voice matched emergent users' mental models better than a form app | n=15, information access only |
| Gram Vaani ASR Challenge (Interspeech 2022) | ~1,108 h spontaneous telephone **Hindi**; baselines; audio realism | Hindi, not Telugu; **unrelated to our project name** |

## 6. Legal, standards and ethics

| Resource | Best for | Caution |
|---|---|---|
| DPDP Act 2023 (Act 22 of 2023) + PRS Legislative Brief | Consent, children under 18, purpose/storage limitation, penalties | Statutory text via secondary sources; Gazette PDFs unreachable |
| DPDP Rules 2025 (SCC Times, The Hindu) | Rule-wise commencement, security safeguards, 72h breach notice | **Reviewer downgraded dates to UNVERIFIED** — re-check Gazette |
| Convention on the Rights of the Child (full text) | Best interests, privacy, protection, health/nutrition | Treaty text via Wikisource; one encyclopedia is not independent corroboration |
| GDPR Arts. 4 and 9 (comparative only) | Why voice can be biometric/special-category data | EU law, **not** Indian law |
| Local-first software (Kleppmann et al., 2019) | Seven ideals of local-first design; SQLite/JSON archival | Design essay, not a legal or clinical standard |

---

## Not found (do not go looking twice without a new lead)

- Public Poshan Tracker API/developer portal or integration specification.
- Official manual/SOP for Bala Sanjeevini 1.0 or 2.0.
- Official requirement to photograph or upload **preschool activities**.
- Documented data synchronisation, SSO or shared database between Poshan Tracker and Bala Sanjeevini.
- Current prescribed AP ICDS register list, AWW diary format, MPR template or submission deadlines.
- Telugu Anganwadi speech corpus or any field-validated Telugu AWW ASR benchmark.
- Quantified AWW app/reporting time from CAG or official audit reports.
