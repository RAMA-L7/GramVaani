# Confirmation-State Browser Verification Report (Frontend Fix, Phase 1.4 follow-up)

**Date:** 2026-11-17  
**Project:** `D:\GramVaani` pilot (existing local pilot; **not** frozen `sandbox/`)  
**Scope:** browser verification of the frontend confirmation-state fix (invalid confirmation must not be presented as a generated/confirmed sample). **This is not physical Chrome microphone acceptance (T2 mic) and not field validation.**

## Environment (recorded)

| Item | Value |
|---|---|
| Automated UI verification browser (actual run) | Playwright Chromium (HeadlessChrome) — `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/157.0.0.0 Safari/537.36` (automated browser engine) |
| System target browser confirmed available | Google Chrome **157.0.8103.79** (`C:\Program Files\Google\Chrome\Application\chrome.exe`) |
| OS | Windows 11 Home Single Language 25H2, build 26200 |
| Pilot URLs | Frontend `http://localhost:3010`, Backend `http://127.0.0.1:8010` (`/api/health` OK) |
| Data | **Synthetic/non-identifying only**; no beneficiary/child/PII/Aadhaar/credentials; no recordings retained |

**Constraints respected:** no existing DB records rewritten; no confirmation metadata fabricated; backend validation not weakened; `sandbox/` and `config/report-fields.json` unchanged; no participant data, no official submission, no commit/push during verification.

## Test results (PASS/FAIL)

| Test | Result | Summary |
|---|---|---|
| 1. Invalid report | **PASS** | HTTP-200 invalid confirmation (`validation.valid=false`, draft) did **not** navigate to `/done`; TE+EN validation shown; checkbox reset; report remained editable; corrected values/transcript/answers/draft ID preserved; backend/export stored draft + `explicit_confirmation=false` |
| 2. Valid report | **PASS** | Valid internal enum value + explicit confirmation produced `confirmed_sample` (`explicit_confirmation=true`, `validation.valid=true`) and navigated to `/done` only after valid confirmed response; correct values and experimental/not-official/not-submitted labels shown |
| 3. Direct Done-page protection | **PASS** (minor observation) | Unconfirmed draft opened on `/done` shown as draft/not-confirmed (no success/confirmed message), validation issues and draft details shown, experimental labels preserved. Export clicked (download, no DB rewrite); on-screen export success notice not captured in DOM query during observation window (no misleading confirmation observed). Save not clicked for existing draft to avoid rewriting an existing DB record. |
| 4. Persistence | **PASS** | History showed distinct draft vs confirmed_sample statuses; JSON exports preserved backend truth for representative draft and confirmed_sample records |

## Exact inputs and observations

### Test 1 — Invalid report (expected: no success navigation, draft preserved)
- **Inputs (synthetic):** transcript `ఈరోజు 26 మంది పిల్లలు వచ్చారు. పిల్లలతో ప్రీస్కూల్ కార్యకలాపాలు నిర్వహించారు.`; `report_date=2026-11-17`; `children_present=26`; `activity_type=["పిల్లలతో ప్రీస్కూల్ కార్యకలాపాలు నిర్వహించారు"]` (**invalid** — not in allowed enum values `pre_school,nutrition,health_check,weighing,home_visit` per `pilot/config/pilot-fields.json`); worker `SYN-PILOT-W001/SYN-PILOT-C001`. Explicit confirmation checked, confirm submitted.
- **UI observations:** remained on `http://localhost:3010/report` (no `/done`). Alert: “సమస్య / Not confirmed” with TE+EN messages (“నమూనా నివేదిక నిర్ధారించబడలేదు… ఇది డ్రాఫ్ట్ మాత్రమే, నిర్ధారించబడలేదు.” / “Sample report was not confirmed… Saved/kept as draft, not confirmed.”) and detail `activity_type.0: 'పిల్లలతో ప్రీస్కూల్ కార్యకలాపాలు నిర్వహించారు' is not one of ['pre_school', 'nutrition', 'health_check', 'weighing', 'home_visit']`. Confirmation checkbox **reset (unchecked)**. Inputs remained editable with values `26`, invalid activity text, `2026-11-17`.
- **State/persistence (backend truth):** draft created/preserved as `draft_f285ab9fc29a` with `status=draft`, `report.status=draft`, `confirmation.explicit_confirmation=false`, `validation.valid=false` (same enum error), fields preserved; JSON export matched. **No confirmation fabricated.**
- **Evidence:** `pilot/docs/screenshots/acceptance-2026-11-17/t2-test1-invalid-confirm.png` (synthetic UI).

### Test 2 — Valid report (expected: confirmed only after valid response)
- **Inputs (synthetic):** corrected `activity_type` to valid internal value **`pre_school`** (supported by `pilot/config/pilot-fields.json`), `children_present=26`, `report_date=2026-11-17`, same synthetic context/profile; explicit confirmation checked and submitted.
- **UI observations:** navigated to `http://localhost:3010/done` after valid response. Done page showed ✅ “నమూనా నివేదిక సిద్ధం”, correct values (`హాజరైన పిల్లలు=26`, `కార్యకలాపం=pre_school`), and experimental/not-official/not-submitted labels.
- **State/persistence:** workflow/report `status=confirmed_sample`, `confirmation.explicit_confirmation=true`, `validation.valid=true`; backend/export for `draft_f285ab9fc29a` reflected `confirmed_sample` with `explicit_confirmation=true` and fields `{children_present:26, activity_type:["pre_school"]}`.
- **Evidence:** `pilot/docs/screenshots/acceptance-2026-11-17/t2-test2-valid-confirm-done.png`.

### Test 3 — Direct Done-page protection (unconfirmed draft)
- **Inputs (synthetic):** unconfirmed draft `draft_9022c020a3a1` (existing local draft; **not rewritten**) loaded and opened at `/done` — `report.status=draft`, `confirmation.explicit_confirmation=false`, invalid validation, fields `{children_present:26, activity_type:["పిల్లలతో ప్రీస్కూల్ కార్యకలాపాలు నిర్వహించారు"]}`.
- **UI observations:** 📝 “డ్రాఫ్ట్ (నిర్ధారించబడలేదు)” with “Draft only — not confirmed, not submitted.” and alert “నిర్ధారణ లేదు / Not confirmed”; **no** successful confirmed-report message. Validation issues and “డ్రాఫ్ట్ వివరాలు (Draft details)” shown; experimental/not-official/not-submitted labels preserved.
- **Minor observation:** export (JSON) clicked (no DB rewrite); on-screen export success notice not captured in DOM query during observation window — **no misleading confirmation observed**. Save not exercised on this existing draft to avoid rewriting an existing DB record (unconfirmed save messaging implemented as draft/not-confirmed).
- **Evidence:** `pilot/docs/screenshots/acceptance-2026-11-17/t2-test3-done-unconfirmed.png`.

### Test 4 — Persistence (history + exports)
- **UI observations:** History displayed distinct statuses (e.g. `draft_f285ab9fc29a` **Completed (sample)**, `draft_9022c020a3a1` **Draft**, `draft_4e149cfdabd4` **Completed (sample)**, `draft_93b984b92ddf` **Draft**).
- **Export/backend truth (representative):** `draft_9022c020a3a1` DB/export remained `draft` with `explicit_confirmation=false` and preserved fields; `draft_f285ab9fc29a` DB/export `confirmed_sample` with `explicit_confirmation=true` and correct fields.
- **Evidence:** `pilot/docs/screenshots/acceptance-2026-11-17/t2-test4-history.png`.

## Remaining defects / notes
- **Minor:** Test 3 export success notice text not captured in automated DOM query (no misleading confirmation observed). Manual spot-check can confirm “Draft downloaded — not confirmed” renders.
- **Verification scope:** automated browser UI verification (Playwright Chromium) of confirmation-state flow; **distinct from physical Chrome microphone tests**. **T2 live microphone acceptance on actual Chrome/device with physical mic remains incomplete** (see `TELUGU_MICROPHONE_TEST_REPORT_2026-11-17.md` / `LIVE_MICROPHONE_TEST_CHECKLIST*.md`) and is not claimed complete here.
- **Finding preserved:** invalid `activity_type` enum value correctly rejected by backend validation; correct internal mapping uses allowed enum values (e.g. `pre_school`) per `pilot/config/pilot-fields.json`. Draft vs `confirmed_sample` distinction preserved.

*Experimental/sample outputs only — not official, not submitted. No participant observation authorized.*