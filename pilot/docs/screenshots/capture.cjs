const fs = require("fs");
const path = require("path");

(async () => {
  const { chromium } = require("D:/GramVaani/sandbox/tests/node_modules/playwright");
  const base = "http://127.0.0.1:3010";
  const out = "D:/GramVaani/pilot/docs/screenshots/after";
  fs.mkdirSync(out, { recursive: true });

  const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const desktop = { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 };

  async function shot(page, name) {
    await page.screenshot({ path: path.join(out, name), fullPage: true });
    console.log("saved", name);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const ctxM = await browser.newContext(mobile);
    const pm = await ctxM.newPage();
    await pm.goto(base + "/", { waitUntil: "networkidle" });
    await shot(pm, "mobile-home.png");
    await pm.goto(base + "/speak", { waitUntil: "networkidle" });
    await shot(pm, "mobile-speak.png");

    await pm.goto(base + "/", { waitUntil: "domcontentloaded" });
    await pm.evaluate(() => {
      const state = {
        transcript: "ఈరోజు కేంద్రం SYN-PILOT-C001 లో 24 మంది పిల్లలు హాజరయ్యారు. భోజనం పెట్టాము, 24 భోజనాలు వడ్డించాము. ప్రీస్కూల్ కార్యకలాపం: పాటలు.",
        originalTranscript: "ఈరోజు కేంద్రం SYN-PILOT-C001 లో 24 మంది పిల్లలు హాజరయ్యారు. భోజనం పెట్టాము, 24 భోజనాలు వడ్డించాము. ప్రీస్కూల్ కార్యకలాపం: పాటలు.",
        transcriptMeta: { provider: "browser_web_speech", simulated: false },
        extractions: [
          { field_id: "report_date", value: "2026-11-16", raw_text: "ఈరోజు", source_span: [0, 5], confidence: 0.9 },
          { field_id: "centre_code", value: "SYN-PILOT-C001", raw_text: "SYN-PILOT-C001", source_span: [14, 28], confidence: 0.95 },
          { field_id: "children_present", value: 24, raw_text: "24 మంది పిల్లలు", source_span: [32, 46], confidence: 0.9 }
        ],
        gaps: ["meal_served"],
        ambiguities: [],
        answers: {},
        corrections: {},
        report: null,
        validation: null,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("gramvaani_pilot_workflow_v1", JSON.stringify(state));
    });
    await pm.goto(base + "/review", { waitUntil: "networkidle" });
    await shot(pm, "mobile-review.png");
    await pm.goto(base + "/report", { waitUntil: "networkidle" });
    await shot(pm, "mobile-report.png");

    await pm.evaluate(() => {
      const state = JSON.parse(localStorage.getItem("gramvaani_pilot_workflow_v1") || "{}");
      state.report = {
        schema_version: "pilot-0.1",
        worker: { worker_code: "SYN-PILOT-W001", centre_code: "SYN-PILOT-C001" },
        report_date: "2026-11-16",
        fields: { report_date: "2026-11-16", centre_code: "SYN-PILOT-C001", children_present: 24, meal_served: true },
        confirmation: { confirmed_by: "SYN-PILOT-W001", confirmed_at: new Date().toISOString(), explicit_confirmation: true },
        status: "sample_report",
        sample: true,
        not_official: true,
        not_submitted: true,
        experimental: true,
        label: "EXPERIMENTAL SAMPLE REPORT — NOT OFFICIAL, NOT SUBMITTED"
      };
      state.validation = { valid: true, errors: [], warnings: [] };
      localStorage.setItem("gramvaani_pilot_workflow_v1", JSON.stringify(state));
    });
    await pm.goto(base + "/done", { waitUntil: "networkidle" });
    await shot(pm, "mobile-done.png");
    await ctxM.close();

    const ctxD = await browser.newContext(desktop);
    const pd = await ctxD.newPage();
    await pd.goto(base + "/", { waitUntil: "networkidle" });
    await shot(pd, "desktop-home.png");
    await pd.goto(base + "/research", { waitUntil: "networkidle" });
    await shot(pd, "desktop-research.png");
    await ctxD.close();
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
