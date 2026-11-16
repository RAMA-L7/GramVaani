# Comparable Solutions and Lessons
_Agent 6 | Access date: 2026-11-16 | Status: research notes, no application changes_

> **Reviewer note (2026-11-16):** FormBharo (source 1) is an **arXiv preprint** (6 Aug 2026), not a peer-reviewed paper. Its numbers were independently re-fetched and confirmed, but treat them as preprint evidence. Sources 9, 11, 14, 15, 17, 18 and 19 are marketing/snippet-only and must not be promoted to workflow evidence.

---

## 1. Scope and method

[PUBLISHED EVIDENCE] Scope: this file records comparable tools and field reports for the GramVaani research prototype (Telugu-first, voice-assisted reporting for Anganwadi workers in Andhra Pradesh). GramVaani's planned loop is speak → transcribe → edit → extract → clarify → confirm → preview draft; it has no government integration, no submissions, no beneficiary data, and makes no official claims.

[PUBLISHED EVIDENCE] Method: web search and direct page retrieval on 2026-11-16. Official documentation, peer-reviewed papers, and credible journalism were preferred. Marketing/app-store text and search-result snippets are explicitly marked `[UNVERIFIED]`. No private accounts, credentials, or beneficiary data were accessed.

[UNVERIFIED] Search failures and access limits (recorded for transparency): the built-in `websearch` tool failed with HTTP 402 for all queries; DuckDuckGo HTML worked for several searches then served a bot CAPTCHA; Bing returned relevant results for some queries and irrelevant ones for others; several targets were unreachable (PDFs rejected by the fetch tool, `wcd.gov.in` transport error, Springer chapter page and Taylor & Francis403, `poshantracker.in`/`avni.org` empty response, `indiascienceandtechnology.gov.in` transport error). Findings from inaccessible pages are labelled `[UNVERIFIED]` and are not treated as primary evidence.

[PUBLISHED EVIDENCE] Label key: `[VERIFIED]` = 2+ independent credible sources; `[PUBLISHED EVIDENCE]` = one credible published/official source; `[UNVERIFIED]` = marketing, inference, or an inaccessible/snippet-only source; `[UNKNOWN]` = could not determine. Every substantive finding below carries exactly one label.

## 2. Voice-based data entry tools

### 2.1 FormBharo (voice agent for conversational form filling; research prototype / live pilot)
[PUBLISHED EVIDENCE] What it is: a phone-call voice agent that fills a structured form in Hindi for low-income, Hindi-speaking mothers enrolling in maternal and child health programmes; built by Artpark, Indian Institute of Science, Bengaluru, with ARMMAN; piloted in rural Maharashtra (Dalmia, Midha & Doshi, arXiv:2608.06027v1, 2026-08-06).

[PUBLISHED EVIDENCE] Workflow: VAD → speech-to-text → EXTRACT LLM extracts all answered fields from a turn → rule-based layer validates values, applies retries/skip/end rules, updates form state (single source of truth) and selects the next question (including branch logic) → REPLY LLM phrases the question → TTS speaks it back. Interruptions terminate the current turn gracefully. Validation guards include 10-digit phone numbers and past-only dates.

[PUBLISHED EVIDENCE] Strengths: openly released FormVoiceAgentBench (380 human-recorded Hindi audio clips, 3,760 unit tests, 960 simulated calls, 4 acoustic conditions: background chatter, microphone distance, fast/slow pace). Rule-based validation recovered many extraction errors: one model with 95.96% turn-level extraction reached 100% form completion because numeric string values were normalised. Smaller, cheaper models matched or beat frontier models end-to-end; model choice used Pareto filtering over accuracy, p95 latency and cost. Benchmark deliberately avoided PII.

[PUBLISHED EVIDENCE] Limitations: form completion drops by ~7.4–13.6 percentage points (median) under real-speech transcripts vs reference transcripts, with a worst model-specific decline of ~41 points; WER and LLM-WER disagree on model ranking; component-level accuracy does not predict end-to-end accuracy. Benchmark uses 5 simulated users, scripted well-formed answers, one acoustic variation per call, Hindi only, and did not evaluate TTS quality. Authors state incorrect capture could delay or deny services and call for confirm/correct guardrails before scale.

[PUBLISHED EVIDENCE] Lesson for GramVaani: evaluate the *whole loop* (transcription → extraction → clarification → final draft), not WER or field-level accuracy alone, and keep validation, retries, branching, and the draft state deterministic/rule-based while using LLMs only for interpretation and phrasing — this directly justifies the planned edit/clarify/confirm/preview stages.

### 2.2 ARMMAN's Kilkari and other outbound voice services (context for voice reach)
[PUBLISHED EVIDENCE] What it is: Kilkari is a large maternal mobile messaging/service programme in India; FormBharo cites Bashingwa et al. (BMJ Global Health, 2021) and related work reporting reach of >10 million subscribers and ~1.2 million calls/day.

[PUBLISHED EVIDENCE] Workflow/strength: prerecorded outbound calls at population scale demonstrate that voice channels can reach underserved populations where text and apps cannot (as summarised in FormBharo's related work).

[PUBLISHED EVIDENCE] Limitations: early IVR systems used touch-tone input that users often preferred to low-quality speech recognition; prerecorded/outbound calls do not capture free-form field reports and offer no edit/confirm loop.

[PUBLISHED EVIDENCE] Lesson for GramVaani: voice reach at scale is proven in India, but a one-way call is not a reporting tool — invest in the correction and confirmation turns, not only in speaking and transcribing.

### 2.3 Speech interfaces vs touch-tone for low-literate users (Sherwani et al., 2009, as reported by FormBharo)
[PUBLISHED EVIDENCE] What it is: a comparative study of a carefully designed speech interface vs an equivalent touch-tone (DTMF) interface for low-literate and literate users.

[PUBLISHED EVIDENCE] Strength/result: the speech interface achieved significantly higher task-completion rates than touch-tone for both low-literate and literate users (reported in FormBharo §1, citing Sherwani et al. 2009).

[PUBLISHED EVIDENCE] Limitation: this predates LLM agents and does not address structured-value normalisation (dates, numbers, names) or noisy field audio.

[PUBLISHED EVIDENCE] Lesson for GramVaani: natural speech can outperform keypad menus for low-literate users, but only with careful design; do not assume "voice" automatically means usable.

### 2.4 Interactive Voice Response (IVR) for surveys / humanitarian data collection
[UNVERIFIED] What it is: IVR platforms (e.g., engageSPARK, RapidPro-related guidance, and a UK government/DFID evidence review on IVR in humanitarian contexts) use recorded prompts and telephone input to collect survey responses from low-literate populations; the review notes reach, anonymity, and efficiency gains (search-result snippets only; PDFs not retrievable on 2026-11-16).

[UNVERIFIED] Documented outcomes: a pilot ofParticipant-recorded IVR dietary data in rural low-literacy settings reported high acceptability but was constrained by a requirement for three calls per day (PMC article snippet, page not fully retrieved).

[UNVERIFIED] Limitations: menu/keypad designs demand numeric literacy; call scheduling and completion burden are non-trivial; no structured draft preview for the respondent.

[PUBLISHED EVIDENCE] Lesson for GramVaani: IVR evidence supports audio-first interaction but also warns that repeated-call burden and menu complexity can quietly exclude the users we aim to serve.

### 2.5 Voice-to-form commercial/engineering tooling
[UNVERIFIED] What it is: vendor material (e.g., NoeticX "Voice Data Collection" and Salesforce engineering on low-latency voice-to-form AI) argues that ODK/Kobo-class tools still require digital literacy and that voice-to-form systems need layered on-device STT plus server-side structuring to manage latency in field conditions.

[UNVERIFIED] Strengths/limitations: these are marketing/engineering blog claims with no independent evaluation or measured field outcomes located in this study.

[UNVERIFIED] Lesson for GramVaani: treat vendor latency and accuracy claims as hypotheses for our own field testing, not as evidence.

## 3. Field data-collection platforms

### 3.1 ODK (Open Data Kit)
[PUBLISHED EVIDENCE] What it is: open-source form-based data collection platform (Get ODK Inc.); XLSForm → ODK Central server → ODK Collect Android app → upload/export.

[PUBLISHED EVIDENCE] Workflow/strengths: forms support photos, GPS, skip logic, calculations, external datasets, multiple languages; Collect and web forms work online/offline and sync when connectivity returns; Central manages users, projects, submissions, encrypted forms, audit logs; APIs and OData/Briefcase exports exist. Official docs include multilingual-form and form-testing best-practice guides.

[UNVERIFIED] Claimed scale: the marketing homepage states 2M+ users and 250M+ submissions annually, with data-centre region options; this is vendor material, not an independent evaluation.

[PUBLISHED EVIDENCE] Limitations for GramVaani's problem: data entry is manual, visual, text/menu-driven; it has no free-form narration, extraction, clarification, or spoken preview loop. It is an excellent structured-data substrate, not a voice-first reporter.

[PUBLISHED EVIDENCE] Lesson for GramVaani: adopt the *form contract* idea — explicit field types, skip logic, validation constraints, multilingual labels, and a testable draft — while keeping our interaction voice-first; do not try to reproduce ODK's full feature set.

### 3.2 KoboToolbox
[PUBLISHED EVIDENCE] What it is: open-source data collection/management/visualisation platform (Kobo); Formbuilder or XLSForm, KoboCollect Android app, web forms, and server-side project management. Official docs last updated 2026-09-29.

[PUBLISHED EVIDENCE] Strengths: 25+ question types, skip logic, calculations, validation criteria, translations in hundreds of languages, offline collection and later upload, table views that display multiple languages and validate submissions in real time, role-based permissions, case/longitudinal linkage, and automated transcription/translation plus AI-assisted qualitative analysis of audio responses.

[PUBLISHED EVIDENCE] Limitations: transcription/translation is applied to recorded audio *after* collection; the primary entry path remains typing/tapping. Validation in table views is a supervisor action after the fact, not an in-the-moment clarification with the reporter.

[PUBLISHED EVIDENCE] Lesson for GramVaani: supervisor-side validation and multilingual form definitions are worth studying as design patterns; audio transcription as an analysis add-on is not a substitute for an interactive edit/confirm step.

### 3.3 CommCare (Dimagi)
[PUBLISHED EVIDENCE] What it is: open-source mobile platform for frontline workers; no-code app builder, case management, longitudinal client tracking, offline Android/Java phones, SMS/IVR messaging, reports.

[PUBLISHED EVIDENCE] Strengths for low-literacy users: official "Designing for Low-Literate Users" guidance recommends extensive images and audio prompts, wording prompts to the worker rather than the beneficiary, minimising free-text questions (favour single-select and numeric), using headphones, breaking long multiple-choice lists into short yes/no questions, short case lists, icons, and disabling saved/incomplete-form options to reduce confusion. It also warns that monitoring reports can misrepresent how low-literate workers actually use the app, and urges field testing across literacy levels.

[UNVERIFIED] Marketing claim: the Google Play listing calls CommCare "the only platform" combining open source, longitudinal tracking, low-literate support, offline use, SMS integration, and a non-programmer builder (vendor copy).

[PUBLISHED EVIDENCE] Limitations: audio is used for *prompts*, not for dictation or extraction; text-heavy fields still need a literate helper or supervisor pre-population. It is a case/workflow system, not a speak→draft system.

[PUBLISHED EVIDENCE] Lesson for GramVaani: ask questions one at a time, in the worker's own voice, with yes/no-style confirmation; and treat supervisor dashboards as potentially misleading without observing actual field use.

### 3.4 DHIS2
[PUBLISHED EVIDENCE] What it is: open-source health information platform (HISP, University of Oslo) for collection, validation, analysis, visualisation, and secure sharing; widely used as a national HMIS.

[PUBLISHED EVIDENCE] Strengths: configure without coding; online/offline Android capture with real-time review and follow-up; strong analytics (charts, pivots, maps, dashboards); explicit localisation/translation programme (Transifex); community health and nutrition use cases; FHIR/integration tooling.

[PUBLISHED EVIDENCE] Limitations: aggregate/reporting orientation and configured data sets; not designed for free-form spoken narration or low-literacy data entry at the point of reporting.

[PUBLISHED EVIDENCE] Lesson for GramVaani: "collect anywhere, review centrally" and localisation pipelines are useful distal patterns; our prototype should stay local and draft-oriented, not become an HMIS.

### 3.5 Avni, OpenMRS, Magpi (grouped; limited direct verification)
[UNKNOWN] Avni: an open-source frontline-work platform used in Indian community-health programmes; its official site/docs did not return content during access (2026-11-16), so no verified workflow or limitation is recorded here.

[UNKNOWN] OpenMRS: an open-source medical records system commonly used in LMICs; not retrieved in this pass and outside the direct voice/field-entry comparison.

[UNVERIFIED] Magpi: a commercial mobile data-collection tool often listed with ODK/Kobo; its site returned 404 during access, so no claim is made.

[PUBLISHED EVIDENCE] Lesson for GramVaani: do not assert features or outcomes for tools we could not verify; record gaps rather than filling them from memory.

## 4. Indian public-sector and frontline-worker tools

### 4.1 Poshan Tracker (comparable product, not a template to copy)
[PUBLISHED EVIDENCE] What it is: India's Ministry of Women and Child Development nutrition-monitoring platform for Anganwadi workers; tracks supplementary nutrition, growth monitoring, attendance and daily activities, with geotagging and child height/weight uploads; launched 2021 (Rest of World, 2023-09-14).

[PUBLISHED EVIDENCE] Workflow/strength: workers enter daily activities and beneficiary measurements; supervisors receive real-time updates on centres and can follow up quickly. One child development project officer quoted said the app gave instant progress data across 261 centres where monthly paper reports had been slow.

[PUBLISHED EVIDENCE] Documented limitations (field interviews with five workers): no smartphone supplied (one worker spent ₹12,000 of her own money), unreliable connectivity (20–25 minutes to upload one item), predominantly English interface despite some regional-language sections, no way to edit a mistaken height/weight entry and no mechanism to verify faulty data, duplicate work in physical registers, and data perceived as accounting rather than outcome data. Payments were linked to app-recorded activity.

[UNVERIFIED] Official counter-claim: a Lok Sabha annexure snippet says digital reporting on Poshan Tracker reduced workload and operational challenges versus 11 physical registers; the PDF could not be retrieved, so this is recorded as a snippet-only claim. A WCD page snippet states the app is available in 24 languages; page retrieval failed, so also unverified here.

[UNVERIFIED] Academic/secondary reports: a Springer chapter (Mangal, V., 2025, "Health Digitalization and Its Impact on Frontline Workers: A Study of Anganwadi Workers from Poshan Abhiyan", pp. 73–88) is confirmed by DOI metadata; an accessible snippet of a related study describes older workers struggling with usability and preferring paper after the ICDS-CAS → Poshan Tracker transition. Full text was not retrievable.

[PUBLISHED EVIDENCE] Lesson for GramVaani: build the *edit and confirm* steps before anything else — an irrevocable wrong entry is the clearest documented failure mode — and keep the interface in the worker's language without depending on a family member to type.

### 4.2 ICDS-CAS and the transition to Poshan Tracker
[UNVERIFIED] What it is: ICDS-CAS was the earlier digital record-keeping system for Anganwadi centres, later transitioned to Poshan Tracker.

[UNVERIFIED] Limitation: a study summary (Scribd-hosted, snippet only) reports stakeholder challenges during that transition, including usability struggles for older workers; not treated as primary evidence.

[PUBLISHED EVIDENCE] Lesson for GramVaani: changing the system under a frontline worker is itself a usability cost; a research prototype should minimise new workflow obligations and never become another register to maintain.

### 4.3 ASHA/ANM/AWW apps and livelihood/survey tools
[UNKNOWN] No verified primary source was retrieved in this pass for specific ASHA/ANM apps (e.g., ASHA soft, ANMOL) or state livelihood tools; no claims are recorded.

[PUBLISHED EVIDENCE] Lesson for GramVaani: the Poshan Tracker pattern (device and network dependency, English-heavy UI, duplicate registers, pay linked to data entry) is the risk profile to design against, regardless of which specific app is examined.

## 5. Academic prototypes

### 5.1 Prabodhini vs myScheme (form-based vs conversational public-service access)
[PUBLISHED EVIDENCE] What it is: a task-based comparative study with 15 low-income participants of myScheme (government form-based Android app) and Prabodhini (voice-based conversational prototype using generative AI + RAG) for accessing welfare-scheme information (Chaitra C R et al., HCINLP 2025, ACL Anthology 2025.hcinlp-1.6, pp. 60–71, November 2025).

[PUBLISHED EVIDENCE] Strengths/results: the paper reports that Prabodhini's conversational design and natural-language input better matched emergent users' mental models, with advantages in usability, task-completion time and preference; it frames findings with the Gulf of Execution and Zipf's Law of Least Effort.

[PUBLISHED EVIDENCE] Limitations: "first impressions" study of 15 participants, focused on *information access*, not on submitting or editing records; abstract-level access only (PDF not retrievable).

[PUBLISHED EVIDENCE] Lesson for GramVaani: a voice-first conversational interface can reduce the execution gap for low-literacy users, but small usability studies need to be followed by our own task-level measures (completion, correction rate, time, trust).

### 5.2 Automated government form filling for aged and monolingual users (Kannada)
[UNVERIFIED] What it is: a published study (Taylor & Francis, 2023, DOI 10.1080/17483107.2023.2277825) describing a system that asks users questions sequentially in their native language (Kannada) regardless of the form's language, avoiding redundant fields.

[UNVERIFIED] Strength/limitation: the search-result description indicates native-language questioning as the core design; full text was blocked (403), so no measured outcomes are recorded.

[UNVERIFIED] Lesson for GramVaani: language of the *conversation* and language of the *form* can differ; Telugu prompting with a differently-labelled draft is a plausible pattern, but needs local validation.

### 5.3 Speech-interface form filling in Indian languages (multi-language app prototypes)
[UNVERIFIED] What it is: reports of a mobile speech-recognition form-filling application in eight Indian languages (ResearchGate item) and a "Development of Speech Interface for Form-filling application in Five Indian languages" page on India Science & Technology; one snippet claims 96.06% user satisfaction.

[UNVERIFIED] Limitation: full texts/official page were not retrievable; satisfaction claim is unverified and likely from promotional or low-rigour material.

[UNVERIFIED] Lesson for GramVaani: multi-language breadth is often claimed but rarely evaluated for noisy, spontaneous, code-mixed speech; prefer deep Telugu evaluation over a long language list.

### 5.4 Vocal Forms and similar STT/NLP form fillers
[UNVERIFIED] What it is: academic/engineering prototypes (Vocal Forms, IJSREM PDF; "Voice Based Form Filling System for Visually Challenged People"; a Springer HMM-based voice-enabled form filler; "Voice-based user interface for hands-free data entry at workplaces", ScienceDirect 2025) that combine browser STT or cloud STT with NLP field mapping and dynamic form rendering.

[UNVERIFIED] Strengths/limitations: they demonstrate field-by-field input, voice commands for corrections, and dynamic rendering; accessible snippets do not show rigorous field evaluations with low-literate users, and several target office/visually-impaired users rather than rural frontline workers.

[UNVERIFIED] Lesson for GramVaani: "voice commands for corrections" is a useful pattern to test, but do not import desktop/office assumptions about quiet rooms and confident typing.

### 5.5 Gram Vaani ASR Challenge (highly relevant benchmark, name overlap)
[PUBLISHED EVIDENCE] What it is: a public ASR corpus and challenge built from spontaneous telephone speech in regional variations of Hindi, collected by the social-technology enterprise Gram Vaani (Bhanushali et al., Interspeech 2022, pp. 3548–3552, DOI 10.21437/Interspeech.2022-11371).

[PUBLISHED EVIDENCE] Strengths: ~1,108 hours released (1,000 unlabelled training, 100 labelled training, 5 development, 3 evaluation); real background noise, spontaneity, and crowd-sourced transcript variability. Baseline results: TDNN WER 29.7% / CER 15.1%; Conformer E2E WER 32.9% / CER 19.0% on the evaluation set.

[PUBLISHED EVIDENCE] Limitations: Hindi only, telephone channel, and transcription quality limits; there is no Telugu equivalent established in this source.

[PUBLISHED EVIDENCE] Lesson for GramVaani: this is the closest public evidence of how hard *our* kind of audio is — plan for double-digit WER, sourceTelugu-like spontaneous speech data, and keep note that "Gram Vaani" is also an existing organisation/benchmark name (avoid confusion in documentation).

## 6. Comparison table (solution | workflow | strengths | limitations | lesson for GramVaani | evidence label)

| Solution | Workflow | Strengths | Limitations | Lesson for GramVaani | Evidence label |
|---|---|---|---|---|---|
| FormBharo (IISc/ARMMAN, 2026) | Call → STT → EXTRACT LLM → rule validation/branching → REPLY LLM → TTS | Open Hindi benchmark; rule layer recovers errors; Pareto model choice | ~7–14 pp form-completion loss on real speech; up to ~41 pp worst case; scripted users | Test the end-to-end loop; keep validation/draft state deterministic | [PUBLISHED EVIDENCE] |
| Kilkari / outbound IVR (ARMMAN) | Prerecorded outbound calls/SMS | Population-scale voice reach (>10M subscribers cited) | One-way; no free-form capture or edit | Reach is solvable; correction loop is not | [PUBLISHED EVIDENCE] |
| IVR surveys (humanitarian/low-literacy) | Recorded prompts + keypad/voice answers | Reach for low-literate users; anonymity | Menu burden; repeated calls; no draft preview | Avoid repeated-call and keypad-heavy designs | [UNVERIFIED] |
| ODK | XLSForm → Central → Collect (offline) → sync/export | Multilingual forms, logic, validation, offline, audit | Manual text/menu entry; no narration/extraction | Borrow form contracts; stay voice-first | [PUBLISHED EVIDENCE] |
| KoboToolbox | Formbuilder/XLSForm → KoboCollect/web → validate/export | Hundreds of languages, offline, real-time table validation, audio transcription | Entry is typing/tapping; analysis after collection | Supervisor validation pattern; transcription ≠ confirmation | [PUBLISHED EVIDENCE] |
| CommCare | No-code app builder → offline Android → cases/reports | Audio prompts, single-select/numeric design, low-literate guidance | Free text needs a literate helper; no dictation | One question at a time; observe actual use before trusting reports | [PUBLISHED EVIDENCE] |
| DHIS2 | Configure → offline capture → validation → dashboards | Real-time review, localisation, analytics | HMIS-oriented, aggregate; no spoken draft | Collect-anywhere/review-centrally; stay local | [PUBLISHED EVIDENCE] |
| Avni / OpenMRS / Magpi | Not verified | — | — | Record gaps honestly | [UNKNOWN] / [UNVERIFIED] |
| Poshan Tracker | Daily app entry + geotagged measurements → supervisor dashboard | Real-time supervision at scale | Device/network dependency, English-heavy, no edit, duplicate registers | Edit + confirm before any "submission"; local language UI | [PUBLISHED EVIDENCE] |
| ICDS-CAS transition | Legacy digital registers → Poshan Tracker | Digitisation goal | Transition burden; older workers struggled (snippet) | Minimise new workflow obligations | [UNVERIFIED] |
| Prabodhini vs myScheme | Voice+RAG conversation vs form app | Voice better matched emergent users' mental models | n=15; information access only | Measure our own task completion and trust | [PUBLISHED EVIDENCE] |
| Multi-language speech form fillers (8/5 Indian languages) | Speech → fields | Language breadth claimed | Claimed 96.06% satisfaction unverified; no field evidence | Deep Telugu evaluation over broad language claims | [UNVERIFIED] |
| Kannada form filler (2023) | Native-language sequential questions | Questioning language ≠ form language | Full text blocked | Test Telugu prompt / different-language draft | [UNVERIFIED] |
| Gram Vaani ASR Challenge (2022) | Spontaneous telephone Hindi corpus + baselines | 1,108 h; realistic noise; WER ~30% | Hindi only; transcript variability | Expect high WER; seek Telugu-like data; mind the name overlap | [PUBLISHED EVIDENCE] |

## 7. Anti-patterns to avoid

[PUBLISHED EVIDENCE] 1. **Irrevocable entry.** Poshan Tracker's documented "no way to go back and change it" is the strongest negative lesson; GramVaani's edit/confirm/preview stages are non-negotiable.

[PUBLISHED EVIDENCE] 2. **Optimising a component instead of the task.** FormBharo shows WER and per-turn extraction accuracy can rank models differently from final form completion; do not declare success on transcription accuracy alone.

[PUBLISHED EVIDENCE] 3. **Trusting clean speech.** FormBharo's 7–41 point drops with real acoustic conditions mean noisy Anganwadi settings must be part of every test.

[PUBLISHED EVIDENCE] 4. **English-first or helper-dependent UI.** Rest of World's interviews describe children doing data entry at home because the interface was English and the network slow; a Telugu-first prototype must not recreate this displacement.

[PUBLISHED EVIDENCE] 5. **Assuming the dashboard sees reality.** CommCare's own guidance warns that monitoring reports can misrepresent how low-literate workers use apps; pair analytics with observation.

[PUBLISHED EVIDENCE] 6. **Duplicating registers.** Workers entering the same data into app and paper is documented as increased workload; GramVaani should remain a draft Preview, not an extra record of truth.

[UNVERIFIED] 7. **Feature envy from marketing material.** Vendor "low-latency voice-to-form" claims and 96%-satisfaction snippets are not evidence; ask for field data.

[UNKNOWN] 8. **Confusing GramVaani with the prior "Gram Vaani" ASR organisation/benchmark.** Keep project naming explicit in docs and data sources.

## 8. Source table (# | title | publisher | URL | date | access date | used for)

| # | Title | Publisher/authors | URL | Date | Access date | Used for |
|---|---|---|---|---|---|---|
| 1 | FormBharo: Designing and Evaluating a Voice Agent for Conversational Form Filling in Rural India | Aman Dalmia, Sanskriti Midha, Jigar Doshi (Artpark, IISc); arXiv | https://arxiv.org/html/2608.06027v1 | 2026-08-06 | 2026-11-16 | Voice agent architecture, benchmark, measured drops, lessons |
| 2 | FormBharo (PDF, author copy) | Aman Dalmia et al. | https://www.amandalmia.com/assets/papers/Formbharo-final.pdf | 2026 | 2026-11-16 | Pilot context (ARMMAN, rural Maharashtra) — snippet only |
| 3 | India's child care workers say government tracking app makes their job harder | Divya Chirayath, Rest of World | https://restofworld.org/2023/poshan-tracker-child-care-workers-india/ | 2023-09-14 | 2026-11-16 | Poshan Tracker field limitations, supervisor benefits |
| 4 | Health Digitalization and Its Impact on Frontline Workers: A Study of Anganwadi Workers from Poshan Abhiyan | V. Mangal, in Paradigm Shifts in Population and Health in India, Springer, pp. 73–88 | https://doi.org/10.1007/978-981-95-1719-0_6 | 2025 | 2026-11-16 | Citation confirmation; metadata only |
| 5 | First Impressions from Comparing Form-Based and Conversational Interfaces for Public Service Access in India | Chaitra C R et al., HCINLP 2025, ACL | https://aclanthology.org/2025.hcinlp-1.6/ | 2025-11 | 2026-11-16 | Prabodhini/myScheme comparison |
| 6 | Designing for Low-Literate Users | Dimagi CommCare Help Site | https://dimagi.atlassian.net/wiki/spaces/commcarepublic/pages/2143958014/CommCare+for+Low-Literate+Users | Updated 2024-05-06 | 2026-11-16 | Low-literacy design guidance |
| 7 | Introduction to KoboToolbox / documentation | KoboToolbox | https://support.kobotoolbox.org/welcome.html | Last updated 2026-09-29 | 2026-11-16 | Kobo features, validation, multilingual, audio analysis |
| 8 | Welcome to ODK's Docs | Get ODK Inc. | https://docs.getodk.org/ | 2026 (page) | 2026-11-16 | ODK workflow and form capability |
| 9 | ODK homepage (marketing) | Get ODK Inc. | https://getodk.org/ | © 2025 | 2026-11-16 | Unverified scale/claims |
| 10 | DHIS2 homepage / feature navigation | DHIS2, HISP | https://dhis2.org/ | date not stated | 2026-11-16 | DHIS2 features, localisation, offline capture |
| 11 | CommCare LTS / CommCare app listings | Dimagi (Google Play) | https://play.google.com/store/apps/details?id=org.commcare.lts | date not stated | 2026-11-16 | Unverified marketing claims |
| 12 | Gram Vaani ASR Challenge on spontaneous telephone speech recordings in regional variations of Hindi | Bhanushali et al., Interspeech 2022, ISCA | https://www.isca-archive.org/interspeech_2022/bhanushali22_interspeech.html | 2022 | 2026-11-16 | Spontaneous-speech benchmark, WER baselines |
| 13 | POSHAN Tracker | Ministry of Women and Child Development, Government of India | https://www.wcd.gov.in/public/offerings/poshan-tracker | date not stated | 2026-11-16 | Official claim (snippet only; page unreachable) |
| 14 | Poshan Tracker India Key Issues (Lok Sabha annexure discussed) | Government of India / Scribd copy | https://www.scribd.com/document/1043375396/Poshan-Tracker-India-Key-Issues | date not stated | 2026-11-16 | Unverified counter-claim, snippet only |
| 15 | Transition from ICDS-CAS to Poshan Tracker | Scribd-hosted study copy | https://www.scribd.com/document/843600247/19 | date not stated | 2026-11-16 | Unverified transition-usability report |
| 16 | Automated government form filling for aged and monolingual people using speech | Taylor & Francis (DOI 10.1080/17483107.2023.2277825) | https://www.tandfonline.com/doi/abs/10.1080/17483107.2023.2277825 | 2023 | 2026-11-16 | Kannada native-language questioning (snippet only) |
| 17 | Development of Speech Interface for Form-filling application in Five Indian languages | India Science & Technology | https://www.indiascienceandtechnology.gov.in/research/development-speech-interface-form-filling-application-five-indian-languages | date not stated | 2026-11-16 | Multi-language prototype claim (unreachable) |
| 18 | Development of a mobile app for voice based form filling in eight Indian languages | ResearchGate item | https://www.researchgate.net/publication/327401943 | date not stated | 2026-11-16 | Unverified satisfaction claim (snippet only) |
| 19 | Vocal Forms: An Intelligent Voice Command Form Filling System | IJSREM | https://ijsrem.com/uploads/production/VOCAL-FORMS-AN-INTELLIGENT-VOICE-COMMAND-FORM-FILLING-SYSTEM-FOR-ACCESSIBLE-AND-HANDS-FREE-DIGITAL-DATA-ENTRY.pdf | date not stated | 2026-11-16 | Voice-command correction pattern (snippet only) |
| 20 | Interactive Voice Response in Humanitarian Contexts | UK government/DFID evidence review (PDF) | https://assets.publishing.service.gov.uk/media/5c6bd962e5274a72b6ba06de/495_Interactive_Voice_Response_in_Humanitarian_Contexts__1_.pdf | date not stated | 2026-11-16 | IVR reach claims (snippet only) |
| 21 | Voice Data Collection / low-latency voice-to-form | NoeticX; Salesforce Engineering | https://noeticx.ai/voice-data/ ; https://engineering.salesforce.com/delivering-accurate-low-latency-voice-to-form-ai-in-real-world-field-conditions/ | date not stated | 2026-11-16 | Unverified vendor/engineering claims |
| 22 | Real-time Automated Surveys among Low-literate Masses using Voice-based Telephone Services | ResearchGate / authors | https://www.researchgate.net/publication/311313584 | date not stated | 2026-11-16 | IVR survey background (snippet only) |

## 9. Questions for our own usability testing

[PUBLISHED EVIDENCE] 1. After a spoken report, can the worker *correct* any field without restarting, and does the preview make the correction obvious (Poshan Tracker's no-edit failure)?

[PUBLISHED EVIDENCE] 2. Does end-to-end draft accuracy on noisy Telugu audio differ from field-level or WER-based accuracy, as FormBharo's results predict?

[PUBLISHED EVIDENCE] 3. Which fields most often trigger clarification (dates, numbers, names, code-mixed terms), and do our retry/skip rules end the loop appropriately?

[PUBLISHED EVIDENCE] 4. Do workers understand that the draft is a *draft* and not an official submission or beneficiary record?

[UNVERIFIED] 5. Does speaking in Telugu while seeing a differently-labelled draft cause confusion (Kannada form-filling pattern)?

[PUBLISHED EVIDENCE] 6. Can workers complete the loop without a literate family member present, and without a stable network (CommCare and Rest of World guidance)?

[PUBLISHED EVIDENCE] 7. Does a supervisor-style review view tempt testers to treat the prototype as a monitoring system, and how do we prevent that framing?

[PUBLISHED EVIDENCE] 8. Are task completion, time-on-task, correction rate, and trust all measured together rather than relying on satisfaction alone (Prabodhini study and unverified 96% claims)?

[UNKNOWN] 9. What Telugu spontaneous-speech baseline should we use, given that the public Gram Vaani challenge covers Hindi only?

[UNVERIFIED] 10. Do our documentation and filenames clearly distinguish this research prototype from the pre-existing "Gram Vaani" organisation and ASR benchmark?
