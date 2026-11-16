# Privacy, Data Protection and Safeguarding
_Agent 7 | Access date: 2026-11-16 | Research notes, NOT legal advice_

> **Disclaimer.** This document is a desk research note produced for the GramVaani research study. It is **not legal advice**, not a compliance opinion, and not a substitute for review by a qualified Indian lawyer, an ethics committee / Institutional Ethics Committee (IEC), and a data-protection professional. No private accounts, government credentials, beneficiary records or identifying data were accessed in preparing it. Every source was accessed on **2026-11-16**; where a source could not be opened directly, this is stated explicitly. Statutory commencement dates and rule numbers must be re-verified against the Gazette before any real-world deployment.

> **Reviewer corrections (2026-11-16 — lead + independent review).** These supersede over-strong labels in the body:
> - DPDP Act section-level and DPDP Rules rule-wise commencement → `[UNVERIFIED]`. The Gazette PDFs (sources 6, 7, 19) could not be fetched directly (403/transport error); dates come from PRS/SCC Times/The Hindu/Wikipedia only. Re-verify against the Gazette before any deployment.
> - Claims resting on two or more Wikipedia articles (CRC, research ethics, ICDS/AWW, voice biometrics) → `[PUBLISHED EVIDENCE]` at most. Wikipedia is one encyclopedia, not independent corroboration.
> - Statements of **our own** adopted rules or design choices (e.g., §1's prototype description) are project rules/assumptions, **not** `[VERIFIED]` external findings — this directly enforces project rule 1.
> - "Our exclusion of beneficiary fields is consistent with the sourced standards" (§6) → `[UNVERIFIED]` inference, not a verified fact.
> All `[UNKNOWN]` markers stand. Nothing in this document is legal advice.

---

## 1. Scope and method

[VERIFIED] GramVaani is a **research prototype**, Telugu-first and voice-assisted, for Anganwadi workers in Andhra Pradesh. Its adopted rules are: synthetic data only; no beneficiary records; no government credentials; no photos of children; no government integrations; no submissions; no official-compatibility claims. Planned architecture: local-first SQLite, session-scoped audio that is deleted, opt-in local logs, no telemetry by default. (Project context supplied by the coordinating session; treated as a factual premise of this note, not an externally sourced finding.)

[PUBLISHED EVIDENCE] Method: web search was unavailable for this session (HTTP 402/429), so sources were retrieved by direct URL fetch. Primary/official domains (indiacode.nic.in, meity.gov.in, pib.gov.in, unicef.org, who.int, egazette.gov.in, legislative.gov.in) returned HTTP 403 or transport errors; the analysis therefore relies on (a) the text of the Act and Rules as reproduced and cited by PRS Legislative Research, SCC Times, The Hindu and Wikipedia, (b) the full treaty text of the UN Convention on the Rights of the Child via Wikisource, and (c) the full text of GDPR Articles 4 and 9 via gdpr-info.eu. Every source used is listed in §8 with URL and date. (Sources 1–19; access date 2026-11-16.)

[UNVERIFIED] Consequently, section-level commencement of the DPDP Act and the exact rule-wise commencement of the DPDP Rules 2025 are reported below as the best established from secondary sources, but are **flagged for qualified re-verification** against the Gazette notifications themselves. Where I could not establish a point, it is marked `[UNKNOWN]` rather than inferred.

[PUBLISHED EVIDENCE] Label key used throughout: `[VERIFIED]` = 2+ independent credible sources; `[PUBLISHED EVIDENCE]` = one credible official/academic/legal-secondary source; `[UNVERIFIED]` = reasoned inference from sourced material; `[UNKNOWN]` = not established from sources reviewed.

---

## 2. DPDP Act 2023 and rules — status and key obligations

### 2.1 Status as of 2026-11-16

[VERIFIED] The Digital Personal Data Protection Act, 2023 is **Act No. 22 of 2023**, passed by Lok Sabha on 7 August 2023 and Rajya Sabha on 9 August 2023, assented to by the President on 11 August 2023. (Sources 1, 2, 7; Gazette PDF cited via Source 1.)

[PUBLISHED EVIDENCE] The Act's substantive provisions commenced in stages. The reported commencement notification (G.S.R. 843(E), 13 November 2025) brought into force section 1(2), section 2 (definitions), sections 18–26 (Data Protection Board of India), section 35, sections 38–43, and sections 44(1) and 44(3). A later stage (13 November 2026) is reported for section 6(9) and section 27(1)(d); the **remaining provisions** are reported to commence on **13 May 2027**. (Source 1, citing the Gazette notification; the PDF itself returned a transport error on direct fetch — re-verify.)

[PUBLISHED EVIDENCE] The Digital Personal Data Protection Rules, 2025 were notified by MeitY around 13–14 November 2025 (SCC Times says "notified 13-11-2025"; Wikipedia/PIB say 14 November 2025). They are described as "in force" but with **phased commencement**. (Sources 3, 4, 5, 19; PIB press release could not be fetched directly — HTTP 403.)

[PUBLISHED EVIDENCE] Rule-wise commencement reported by SCC Times: Rules 1, 2 and 17–21 effective 13 November 2025; Rule 4 (Consent Managers) effective 13 November 2026; **Rules 3, 5–16 and 22–23 effective 13 May 2027**. (Source 4.)

[UNVERIFIED] Practical reading for GramVaani: as of 2026-11-16 the operational duties most relevant to a prototype — privacy notice (Rule 3), security safeguards and processor contracts (Rule 6), breach reporting, erasure, and children's verifiable consent (Rule 10) — appear **not yet in force**, with a reported effective date of 13 May 2027. This is a staged-commencement inference from Source 4, not a legal conclusion; the Board-related provisions are in force. Treat the forthcoming obligations as a design target now.

[UNKNOWN] The exact section-by-section status of the Act on 2026-11-16, and whether any later amendment or commencement notification has changed the 13 May 2027 date, could not be independently confirmed from the sources reachable in this session.

### 2.2 Obligations relevant to a research prototype

[VERIFIED] **Consent.** Personal data may be processed only for a lawful purpose on the individual's consent, after a notice stating the data and purpose; consent may be withdrawn at any point. (Sources 1, 2.) PRS records that consent must be freely given and that legitimate uses (voluntary sharing, government benefits, medical emergency, employment) do not require consent. (Source 2.)

[VERIFIED] **Purpose limitation and storage limitation / erasure.** Data fiduciaries must maintain accuracy, keep data secure, and **erase personal data once the purpose has been met** and retention is not needed for legal purposes. (Sources 1, 2.) The Rules add erasure once the purpose and the period in the Third Schedule are exhausted, 48 hours' advance notice to the data principal before erasure, and an overriding one-year retention of personal data and associated logs under the Seventh Schedule. (Source 4 — note that Rule-level duties are reported as commencing 13 May 2027.)

[UNVERIFIED] **Data minimisation.** The sources reviewed describe accuracy, security, purpose limitation and storage limitation; an explicit statutory phrase "data minimisation" was **not located** in them. Minimisation is therefore presented here as good practice derived from purpose/storage limitation and from research-ethics norms, **not** as a quoted statutory duty. (Sources 1, 2, 4, 10.)

[VERIFIED] **Children.** A "child" is a person **below 18 years**. Consent for a child's personal data must be given by a parent or legal guardian. Processing that is detrimental to children's well-being, or involves their tracking, behavioural monitoring or targeted advertising, is not permitted. (Sources 1, 2.) Penalties for non-fulfilment of children's obligations are reported up to ₹200 crore. (Source 2.)

[PUBLISHED EVIDENCE] **Children and disability in the Rules.** Rule 10 requires technical and organisational measures to obtain **verifiable parental consent** before processing a child's data, with due diligence to confirm the consenting person is an adult (18+), including via identity/age details or a token from an authorised entity such as a DigiLocker provider. Rule 11 requires verifiable consent from a lawful guardian for persons with disabilities. A Fourth Schedule creates exemptions from children's-data obligations for certain classes and purposes. (Source 4.)

[PUBLISHED EVIDENCE] **Security and processors.** Rule 6 requires minimum safeguards including encryption, masking or tokenisation, access controls, logging and monitoring, backups, one-year log retention, and **contractual obligations on Data Processors** to maintain safeguards. Breach reporting: notify affected principals promptly and the Board with an initial description and a detailed report within 72 hours. Rule 9 requires publication of a Data Protection Officer / responsible-person contact. (Source 4.) The Hindu notes access control, encryption and security audits for "significant data fiduciaries". (Source 5.)

[VERIFIED] **Rights.** Data principals have rights to access, correction and erasure, withdrawal of consent, nomination (including on death/incapacity), and grievance redressal; the Rules set grievance response within 90 days. (Sources 1, 2, 4.)

[VERIFIED] **Cross-border transfer.** The final Act permits transfer of personal data outside India **except to jurisdictions restricted by the Central Government**; it removed the earlier "sensitive/critical personal data" localisation classification. (Sources 1, 2.) The Rules add a condition of compliance with Central Government orders regarding availability of data to foreign States or their agencies. (Source 4.) No general "store all data in India" mandate was located in the sources reviewed.

[UNKNOWN] Whether any jurisdiction-restricting notification exists as of 2026-11-16 could not be established.

[PUBLISHED EVIDENCE] **Penalties.** PRS reports up to ₹250 crore for failure to take security measures to prevent breaches and up to ₹200 crore for non-fulfilment of children's obligations; the Schedule contains further tiers that were not fully verified here. (Source 2; cf. Source 1.)

[UNKNOWN] The complete penalty schedule and the exact amounts for every breach category were not established.

[PUBLISHED EVIDENCE] **Research exemption.** PRS records that the Bill allowed the Central Government to exempt, by notification, activities including "research, archiving, or statistical purposes". (Source 2.)

[UNKNOWN] Whether any such exemption has been notified, and whether it would cover a prototype like GramVaani, could not be established — do not rely on it without legal review.

[PUBLISHED EVIDENCE] **Language.** Terms and conditions and information about collection must be available in all 22 languages in the Eighth Schedule, which includes Telugu. (Source 1.)

---

## 3. Children, photographs and safeguarding standards

[VERIFIED] The **UN Convention on the Rights of the Child (CRC)** defines a child as every human being below 18 (Article 1), requires that the **best interests of the child be a primary consideration** in all actions concerning children (Article 3), protects children against arbitrary or unlawful interference with privacy (Article 16), requires protection from all forms of physical or mental violence, injury, abuse, neglect and exploitation (Article 19), recognises the right to the highest attainable standard of health and measures to combat disease and malnutrition (Article 24), and requires protection from sexual exploitation and abuse including exploitative use of children in pornographic performances and materials (Article 34). India is a party to the CRC. (Sources 8, 9; treaty adopted 20 November 1989.)

[PUBLISHED EVIDENCE] **Research ethics governance.** Research ethics codes conventionally cited include the 1947 Nuremberg Code, 1964 Declaration of Helsinki and 1978 Belmont Report; ethics committees / IRBs govern and oversee responsible human-subject research. (Source 10.)

[PUBLISHED EVIDENCE] **Children as a vulnerable population.** Research participants with limited autonomy — explicitly including children — are termed "vulnerable populations"; the Declaration of Helsinki requires special care with consent involving vulnerable groups with barriers to informed consent. (Sources 10, 12.)

[PUBLISHED EVIDENCE] **Consent and assent.** Children often lack the legal competence to give true informed consent; parents or legal guardians provide permission, and the American Academy of Pediatrics encourages seeking the **assent** of older children with age-appropriate information. (Source 11.) In clinical research with children, ICH Good Clinical Practice requires ethics review before the study begins; IRB/IEC review covers protocol, recruitment, consent form and incentives; a child cannot legally give informed consent but must be given the opportunity to decline, and a parent or guardian legally consents. (Source 12.)

[UNVERIFIED] **Why "observe but never collect beneficiary data" is the safer design.** Combining CRC Articles 3, 16, 19 and 24 with the DPDP children's provisions and the vulnerable-populations/assent standards, a prototype that never ingests child-identifying or child-health data avoids the hardest consent problem entirely (no guardian consent or child assent is needed for data that is never collected), eliminates re-identification and function-creep risk, and removes any need to justify processing as "detrimental to well-being" or as tracking/behavioural monitoring. (Derived from Sources 1, 2, 8, 10, 11, 12.) This is a reasoned synthesis, not a legal rule.

[UNKNOWN] **Photographs of children.** No specific Indian statutory rule, UNICEF image-guideline text, or court judgment prohibiting photographs of children in research could be retrieved in this session (UNICEF domains returned HTTP 403; web search failed). I therefore **do not assert any legal prohibition**. The GramVaani "no photos of children" rule is recorded in §6 as **our own precaution**, justified by CRC Articles 3, 16, 19 and 34 and by the DPDP children's provisions — not as a quoted legal requirement.

---

## 4. ICDS/health data confidentiality

[VERIFIED] ICDS is a Government of India programme providing supplementary nutrition, nutrition and health education, immunisation, health check-up, referral services and non-formal pre-school education to children under six and their mothers; Anganwadi centres are the frontline delivery points, and WHO child growth standards were adopted for measuring and monitoring child growth in ICDS. (Sources 13, 14; both citing Government of India / PIB / WHO materials.)

[PUBLISHED EVIDENCE] Anganwadi workers receive incentives linked to **growth monitoring** and home visits, and centres deliver basic health care including nutrition education and supplementation. (Source 14.) Anganwadi records are therefore functioning health/nutrition records about young children even when kept as paper ledgers. (Source 14.)

[PUBLISHED EVIDENCE] Digitisation of Anganwadi records has already occurred: workers were given a smartphone app to record data, with reported consequences for wages/food rations when uploads failed, and reported usability problems (English-only, memory-heavy, crashes, poor connectivity). (Source 14, citing The Economist, 16 October 2021.) This is a strong practical reason for GramVaani to remain a **standalone, non-integrated prototype**.

[UNKNOWN] **No documented legal confidentiality rule located.** The sources reviewed did **not** yield an ICDS manual, Anganwadi worker code, or Indian statute expressly imposing a confidentiality duty on Anganwadi workers in respect of beneficiary registers, growth-monitoring data or beneficiary identifiers. Whether such a rule exists in ICDS guidelines, State ICDS rules, the National Food Security Act 2013 rules, or service conditions was not established. Per the assignment, **no such legal requirement is invented here**.

[UNVERIFIED] Interim characterisation for design purposes: growth measurements, weights, ages, names, mother's name, AWC code and beneficiary IDs would, if they related to identifiable individuals, ordinarily be treated as sensitive in practice — but the DPDP Act does **not** create a statutory "sensitive personal data" category, so the heightened treatment is our precaution grounded in CRC Article 24 privacy implications and research ethics, not a DPDP classification. (Sources 1, 2, 8, 10.)

[UNVERIFIED] Our inference: the exclusion of beneficiary fields from the GramVaani data model is consistent with the sourced standards (children's best interests, child privacy, vulnerable-population protections, purpose/storage limitation), even though no specific ICDS confidentiality rule was located. (Sources 1, 2, 8, 10, 11, 12. This is our reasoning, not a legal conclusion.)

---

## 5. Voice/audio data considerations

[PUBLISHED EVIDENCE] **Voice as personal / biometric data.** "Speaker recognition" is identification of a person from characteristics of the voice, answering "Who is speaking?"; it uses acoustic features reflecting anatomy and learned behaviour. Enrollment records the voice and extracts a "voice print", template or model; speaker **verification** is a 1:1 match while speaker **identification** is a 1:N match, and identification can operate covertly without the user's knowledge. (Source 15.)

[PUBLISHED EVIDENCE] Voice appears in both the physiological and behavioural lists of biometric identifiers; biometric identifiers are unique to individuals but their collection "raises privacy concerns", including unintended functional scope, unintended application scope and covert identification. (Source 16.)

[PUBLISHED EVIDENCE] Under GDPR Article 4(1), "personal data" is any information relating to an identified or identifiable natural person, including factors specific to physical, physiological, genetic, mental, economic, cultural or social identity. Article 4(14) defines "biometric data" as personal data resulting from specific technical processing relating to physical, physiological or behavioural characteristics which allow or confirm unique identification. Article 9(1) prohibits processing biometric data **for the purpose of uniquely identifying** a natural person, and data concerning health, unless an Article 9(2) condition applies — including explicit consent (9(2)(a)) and scientific/historical research or statistical purposes (9(2)(j)). (Sources 17, 18.) GDPR is a comparative standard; it is not asserted to apply directly to GramVaani in India.

[UNVERIFIED] **Speech-as-text vs voice-biometrics distinction.** Transcribing synthetic speech with ASR (processing the linguistic content) and enrolling a speaker identity (a voiceprint) are materially different activities: the former is content processing, the latter is biometric identification with the covert-identification and function-creep concerns described in Sources 15–16. GramVaani should stay on the content side and never implement speaker recognition, voiceprints, speaker diarisation, or "who is speaking?" features. (Synthesis from Sources 15, 16, 17, 18; inference.)

[UNVERIFIED] Even a recording of a synthetic voice may embed identifying content (a name, village or AWC code spoken aloud) or incidental background voices; deletion at session end is therefore a content-control measure as well as a storage measure. (Inference from Sources 1, 15, 17.)

[VERIFIED] **Retention/deletion baseline.** Storage limitation (erase once purpose met) is a statutory fiduciary duty in the Act, and the Rules add scheduled erasure, 48-hour pre-erasure notice and one-year log retention — which is why "opt-in local logs" must be a separate, explicitly consented category from session audio. (Sources 1, 2, 4.)

[PUBLISHED EVIDENCE] **Consent for recording.** Consent must be informed, unambiguous and given by clear affirmative action, with a prior notice; withdrawal must be as easy as giving consent. (Sources 1, 2, 11, 17 — GDPR Art. 4(11) definition of consent.) For any real participant's voice this would require a specific, granular, revocable consent; for GramVaani's synthetic speakers the analogous control is a clear in-product disclosure that audio is synthetic and session-scoped.

[UNVERIFIED] **Cross-border posture.** Because the DPDP Act permits transfers except to restricted countries and no localisation mandate was located, "keep audio and logs on-device / in India" is **our precaution**, not a demonstrated legal requirement. It is nevertheless the strongest way to avoid the Rules' foreign-State-access condition and to keep the prototype out of cross-border transfer analysis. (Sources 1, 2, 4.)

---

## 6. Practical checklist for GramVaani (each item: source or precaution)

_Format: "[LABEL] Requirement — basis." "Source n" refers to §8. "Our precaution" means a team-chosen safeguard, not a sourced legal duty._

[VERIFIED] **1. No beneficiary fields in the SQLite schema** — no child name, age, DOB, weight, height, growth chart, mother's name, AWC code, beneficiary ID, ration card or Aadhaar number. Basis: children's best interests and privacy (CRC Arts. 3, 16 — Source 8), DPDP children's provisions and storage limitation (Sources 1, 2), vulnerable-population research norms (Sources 10, 12). Our design choice, not a quoted ICDS rule.

[UNVERIFIED] **2. Data-model allow-list** — store only synthetic report content (free text/Telugu transcript), synthetic worker pseudonym, timestamps, and an app-generated session ID; add a schema-level check/test that rejects known beneficiary field names. Our precaution (derived from Sources 1, 2, 8).

[PUBLISHED EVIDENCE] **3. No government credentials, no AWC/ICDS logins, no official identifiers stored** — basis: the project's adopted rules plus the documented digitisation/credential pressures on Anganwadi workers (Source 14). Our precaution.

[PUBLISHED EVIDENCE] **4. No government integrations and no submissions** — keep the tool standalone; do not connect to ICDS/AWC systems or any State portal. Basis: project rules and the reported failures of official digitisation (Source 14). Our precaution.

[VERIFIED] **5. Audio lifecycle — session-scoped, deleted on exit/timeout** — basis: statutory storage limitation (Sources 1, 2) and Rules erasure (Source 4). Our implementation choice; treat the deletion as a hard requirement with a test.

[UNVERIFIED] **6. Never persist raw audio to disk unless strictly necessary; if used, hold in memory and overwrite/delete on session end; never ship a "save recording" feature** — our precaution (Sources 1, 15, 17).

[PUBLISHED EVIDENCE] **7. Logs are opt-in, local-only, and contain no audio or transcripts by default** — basis: Rule 6 one-year log retention under the Rules (Source 4) shows why logs must be treated as a separate, higher-retention data category. Our precaution.

[PUBLISHED EVIDENCE] **8. No telemetry by default; no analytics SDK, no crash reporter with payload capture** — basis: purpose limitation and notice/consent duties (Sources 1, 2) and processor-contract safeguards (Source 4). Our precaution.

[UNVERIFIED] **9. Consent flow for any future human participant** — plain-language Telugu notice covering purpose, categories, retention, withdrawal, and any cloud call; granular, revocable, with consent recorded locally. Basis: consent and notice duties (Sources 1, 2), informed-consent elements (Source 11), GDPR Art. 4(11) (Source 17). Because we use synthetic data only, this is a design-ready template, not currently exercised.

[PUBLISHED EVIDENCE] **10. Child-Data Rule: never collect data about children, and never ask a worker to enter it** — if the prototype ever touches a real child's data, verifiable guardian consent and the no-tracking/no-behavioural-monitoring limits would apply (Sources 1, 2, 4, 8). Our design avoids the trigger entirely.

[UNVERIFIED] **11. No photos of children, full stop — no camera permission, no image upload, no image fields** — basis: CRC Arts. 3, 16, 19, 34 (Source 8) and DPDP children's provisions (Sources 1, 2). **Our precaution**; no legal prohibition on child photography was sourced.

[UNVERIFIED] **12. No speaker recognition, voiceprints, diarisation or "who is speaking?" features** — basis: voice-biometric risks and GDPR Art. 9 biometric rules (Sources 15, 16, 17, 18). Our precaution.

[PUBLISHED EVIDENCE] **13. Telugu-first notices and disclosures** — basis: Eighth Schedule language requirement for information about collection (Source 1). Our implementation applies this to prototype disclosures even though no legal duty is yet asserted.

[UNVERIFIED] **14. Disclose every cloud/AI call in-product and in the README** — if synthetic audio/text is ever sent to a hosted ASR/LLM, say so, name the provider category, describe what is sent, and apply §7 questions before enabling. Basis: notice/consent and processor safeguards (Sources 1, 2, 4). Our precaution.

[UNVERIFIED] **15. Prefer on-device processing; treat any cloud call as a deliberate architecture decision requiring re-review** — basis: cross-border transfer regime and processor duties (Sources 1, 2, 4). Our precaution.

[PUBLISHED EVIDENCE] **16. Ethics review before any field use with real people** — obtain IEC/ethics-committee review and a documented protocol before any non-synthetic evaluation involving Anganwadi workers; basis: research-ethics governance and vulnerable-population standards (Sources 10, 11, 12). Our recommendation.

[PUBLISHED EVIDENCE] **17. Security baseline for any local store** — encryption/at-rest protection where feasible, access controls, minimal logging, backups only if needed, and processor contracts if any vendor handles data; basis: Rule 6 safeguards (Source 4). Our precaution; note these Rule duties are reported to commence 13 May 2027.

[UNVERIFIED] **18. Disclaimers in the product: "research prototype", "synthetic data", "not an official government tool", "no submissions"** — basis: project rules plus the need for transparent notice (Sources 1, 2). Our precaution.

[UNVERIFIED] **19. Re-verify DPDP commencement and any research exemption with counsel before deployment** — basis: the staged-commencement uncertainty documented in §2.1 and the unsourced research exemption in §2.2 (Sources 1, 2, 4). Our recommendation.

---

## 7. Cloud/AI provider due-diligence questions

[PUBLISHED EVIDENCE] Rationale for asking: Rule 6 requires contractual safeguards from Data Processors and specifies encryption, access control, logging and breach duties (Source 4); the Act and Rules permit cross-border transfers subject to government restrictions/orders (Sources 1, 2, 4); GDPR Articles 28 and 5 establish controller–processor accountability and data-protection-by-design in a comparable regime (Source 17 lists both articles). **No vendor is assumed to behave in any particular way** — these are questions to put to any provider before sending even synthetic audio.

[UNVERIFIED] **Data use and training**
1. Will our audio, transcripts or prompts be used to train, fine-tune, evaluate or improve your models — now or in future?
2. Can we contractually prohibit all such training, and is that prohibition technically enforced (not just a policy statement)?
3. Do humans review or annotate our inputs? If so, who, where, under what confidentiality terms, and can we opt out?

[UNVERIFIED] **Retention and deletion**
4. How long are audio, transcripts, embeddings, logs and temporary files retained, and in which storage layers (including backups and caches)?
5. Can we request immediate deletion on session end, and can you delete from backups? What is the deletion SLA and how is it evidenced?
6. Do you keep abuse-monitoring or safety logs that contain our content, and for how long?

[UNVERIFIED] **Residency and cross-border transfer**
7. In which country/region is the data processed and stored, including support access and sub-processors?
8. Can we pin processing and storage to India or to a specified region? Which sub-processors are involved and where are they located?
9. How do you handle government or law-enforcement requests for our data, and will you notify us?

[UNVERIFIED] **Security and access**
10. What encryption in transit and at rest, key management, tenant isolation and access controls apply?
11. What is your breach-notification timeline and does it meet the 72-hour Board / prompt-principal reporting model in the Rules (Source 4)?
12. Do you publish independent audits (SOC 2 Type II, ISO 27001, penetration-test summaries)?

[UNVERIFIED] **Legal posture**
13. Are you willing to sign a data-processing agreement with purpose limitation, sub-processor controls, audit rights and deletion obligations?
14. What is your position on the DPDP Act's processor obligations and the Rules' cross-border conditions once they are in force (Sources 1, 2, 4)?
15. If we send only **synthetic, non-identifying** audio, will you still treat it as customer content under the same terms — and can you confirm that no speaker-identification/voiceprint feature is enabled?

[UNVERIFIED] **Decision rule** — our own precaution: no cloud call is enabled until questions 1, 2, 4, 5, 7, 8, 10, 11 and 13 have written answers acceptable to the team, and the in-product disclosure in checklist item 14 is updated.

---

## 8. Source table (# | title | publisher | URL | date | access date | used for)

| # | Title | Publisher / authors | URL | Publication date | Access date | Used for |
|---|---|---|---|---|---|---|
| 1 | Digital Personal Data Protection Act, 2023 (Wikipedia article, rev. 1383700425) | Wikipedia contributors | https://en.wikipedia.org/wiki/Digital_Personal_Data_Protection_Act,_2023 | date not stated (page retrieved 2026); cites Gazette 11 Aug 2023 and commencement 13 Nov 2025 | 2026-11-16 | Act No. 22/2023, assent, staged commencement, rights, children, languages, cross-border, penalties |
| 2 | The Digital Personal Data Protection Bill, 2023 (Legislative Brief / billtrack) | PRS Legislative Research | https://prsindia.org/billtrack/digital-personal-data-protection-bill-2023 | date not stated (2023; page shows 2026 copyright) | 2026-11-16 | Consent, notice, legitimate uses, fiduciary duties, storage limitation, children under 18, verifiable guardian consent, penalties ₹200cr/₹250cr, cross-border, research/State exemptions |
| 3 | Digital Personal Data Protection Rules, 2025 (Wikipedia article, rev. 1383750821) | Wikipedia contributors | https://en.wikipedia.org/wiki/Digital_Personal_Data_Protection_Rules,_2025 | date not stated (page last edited 4 Nov 2026) | 2026-11-16 | Rules notified Nov 2025, key provisions, phased compliance, children/disability protections |
| 4 | Your Complete Guide to Digital Personal Data Protection Rules, 2025 | SCC Times / SCC Online; author Shubhi | https://www.scconline.com/blog/post/2025/11/14/meity-notified-digital-personal-data-protection-rules-2025/ | 14 November 2025 | 2026-11-16 | Rule-wise commencement dates; Rules 3, 4, 5, 6, 7, 9, 10, 11; Schedules; breach 72h; cross-border condition; Board procedure |
| 5 | What are the Digital Personal Data Protection Rules and when do they apply? | The Hindu; Aroon Deep | https://www.thehindu.com/sci-tech/technology/what-are-the-digital-personal-data-protection-rules-and-when-do-they-apply/article70283392.ece | Published 15 November 2025; updated 17 November 2025 | 2026-11-16 | Rules notified 14 Nov 2025; GDPR comparison; access control/encryption; significant data fiduciaries |
| 6 | G.S.R. 843(E): Commencement notification, DPDP Act 2023 | Gazette of India, Extraordinary / MeitY | https://egazette.gov.in/WriteReadData/2025/267647.pdf | 13 November 2025 | 2026-11-16 (via Source 1; direct fetch failed — transport error) | Section-level commencement reported in §2.1 |
| 7 | The Digital Personal Data Protection Act, 2023, No. 22 of 2023 | The Gazette of India | https://egazette.gov.in/WriteReadData/2023/248045.pdf | 11 August 2023 | 2026-11-16 (cited via Source 1; direct fetch 403) | Act number and assent date |
| 8 | Convention on the Rights of the Child — full text (Wikisource transcript; original UN treaty) | United Nations / Wikisource | https://en.wikisource.org/wiki/United_Nations_Convention_on_the_Rights_of_the_Child | 20 November 1989 | 2026-11-16 | Arts. 1, 3, 12, 16, 19, 24, 34 — child definition, best interests, privacy, protection, health/nutrition, exploitation |
| 9 | Convention on the Rights of the Child (Wikipedia overview) | Wikipedia contributors | https://en.wikipedia.org/wiki/Convention_on_the_Rights_of_the_Child | date not stated (page current 2026) | 2026-11-16 | CRC ratification/India party status; treaty context |
| 10 | Research ethics | Wikipedia contributors | https://en.wikipedia.org/wiki/Research_ethics | date not stated (rev. current 2026) | 2026-11-16 | Nuremberg Code, Declaration of Helsinki, Belmont Report; ethics committees; vulnerable populations; participant rights |
| 11 | Informed consent | Wikipedia contributors | https://en.wikipedia.org/wiki/Informed_consent | date not stated (rev. current 2026) | 2026-11-16 | Disclosure/capacity/voluntariness; parental permission and child assent; withdrawal; research consent |
| 12 | Children in clinical research | Wikipedia contributors | https://en.wikipedia.org/wiki/Children_in_clinical_research | date not stated (page last edited 5 Dec 2025) | 2026-11-16 | ICH GCP ethics review; Declaration of Helsinki special care for minors; minimal risk; assent; parental consent |
| 13 | Integrated Child Development Services | Wikipedia contributors | https://en.wikipedia.org/wiki/Integrated_Child_Development_Services | date not stated (page last edited 2 Nov 2026) | 2026-11-16 | ICDS services for under-6 children and mothers; WHO growth standards; health check-up and referral |
| 14 | Anganwadi | Wikipedia contributors | https://en.wikipedia.org/wiki/Anganwadi | date not stated (rev. current 2026) | 2026-11-16 | AWC role; growth-monitoring incentives; digitisation/app pressures (cites The Economist 16 Oct 2021 and PIB 23 Mar 2026) |
| 15 | Speaker recognition (redirect from "Voice biometrics") | Wikipedia contributors | https://en.wikipedia.org/wiki/Speaker_recognition | date not stated (page last edited 14 Oct 2026) | 2026-11-16 | Voice as identity signal; verification vs identification; enrollment/voiceprint; covert identification |
| 16 | Biometrics | Wikipedia contributors | https://en.wikipedia.org/wiki/Biometrics | date not stated (rev. current 2026) | 2026-11-16 | Voice as physiological/behavioural biometric; privacy concerns; unintended scope and covert identification |
| 17 | GDPR Art. 4 — Definitions | gdpr-info.eu / intersoft consulting services AG | https://gdpr-info.eu/art-4-gdpr/ | date not stated | 2026-11-16 | Personal data, consent, biometric data, processor definitions; comparative standard |
| 18 | GDPR Art. 9 — Processing of special categories of personal data | gdpr-info.eu / intersoft consulting services AG | https://gdpr-info.eu/art-9-gdpr/ | date not stated | 2026-11-16 | Biometric-for-identification and health data; explicit consent and research exceptions; comparative standard |
| 19 | Digital Personal Data Protection (DPDP) Rules, 2025 – Press Release | Press Information Bureau (PIB), Government of India | https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2190014 | 14 November 2025 | 2026-11-16 (not fetched directly — HTTP 403; cited via Sources 3 and 4) | Official notification date and children/disability protections |

**Sources attempted but not retrievable in this session (not relied on):** indiacode.nic.in DPDP Act PDF (403); meity.gov.in Data Protection Framework and Rules PDF (403); egazette.gov.in PDFs (transport error / 403); unicef.org Innocenti ethics pages and PDFs (403); who.int research-ethics page (404); legislative.gov.in Act page (403); websearch tool (HTTP 402/429).

---

## 9. Points requiring qualified legal/ethical review

[UNVERIFIED] **1. DPDP commencement.** Confirm against the original Gazette notifications the exact sections in force on 2026-11-16, the reported 13 November 2026 stage, and the reported 13 May 2027 "remaining provisions" date (§2.1). This determines whether notice, security, children and breach duties are legally operative yet.

[UNVERIFIED] **2. Rule numbers and dates.** Verify the rule-wise commencement in Source 4 against the notified Rules text (MeitY PDF), especially Rules 3, 6, 7, 9, 10 and the Third/Seventh Schedules.

[UNKNOWN] **3. Research exemption.** Whether any exemption for research/archiving/statistics has been notified under section 27, and whether a voice-interface prototype for Anganwadi workers could ever qualify (§2.2).

[UNKNOWN] **4. ICDS confidentiality.** Whether any ICDS guideline, State rule, service regulation or secrecy obligation governs Anganwadi workers' handling of beneficiary registers, growth charts or identifiers (§4). This note deliberately does not invent one.

[UNKNOWN] **5. Child photography.** The specific legal and safeguarding rules applicable to photographing or filming children in Indian research and field settings; no authoritative source was reachable (§3).

[UNVERIFIED] **6. Synthetic-data boundary.** Whether fully synthetic audio and text that contain no personal data fall outside the DPDP Act entirely (the Act covers *digital personal data*), and at what point a synthetic-but-realistic voice or a worker pseudonym becomes identifying — needs counsel.

[UNVERIFIED] **7. Consent design for any future field evaluation.** Whether worker consent alone is sufficient, whether an IEC approval is mandatory for a non-interventional usability study, and whether any guardian/assent process would be triggered if a child ever appeared in audio or video.

[UNVERIFIED] **8. Cloud/AI provider contracts.** Review any DPA, sub-processor list, training opt-out and deletion SLA before enabling hosted ASR/LLM calls (§7).

[UNVERIFIED] **9. Cross-border restrictions.** Check for any Central Government notification restricting transfers to particular jurisdictions, and the Rules' condition on availability to foreign States/agencies, before any non-India processing.

[UNVERIFIED] **10. "No official-compatibility claims" boundary.** Have counsel and the ethics reviewer confirm the exact wording of disclaimers so the prototype is not presented as an ICDS/government tool.

---
_END OF NOTE — research guidance only; not legal advice; qualified review required before any real-world deployment._
