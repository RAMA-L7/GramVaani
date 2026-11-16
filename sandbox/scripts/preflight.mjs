#!/usr/bin/env node
/**
 * Pre-presentation checks for GramVaani Sandbox. No dependencies.
 * Run from anywhere: node sandbox/scripts/preflight.mjs
 *
 * Checks backend, frontend, demo scenarios, config boundaries and local state.
 * It does NOT check a microphone: the demo uses a simulated recording timer and
 * never captures audio. It does not verify claim wording — read SAFETY.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sandbox = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(sandbox, '..');
const DEMO_IDS = ['s01-normal-telugu', 's07-extraction-error-meal-count', 's08-network-failure-retry'];
const problems = [];
const warnings = [];
const ok = [];

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

async function http(url, expect = 200) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.status !== expect) throw new Error(`HTTP ${res.status}, expected ${expect}`);
    return await res.json();
  } catch (err) {
    problems.push(`${url} — ${err.message}`);
    return null;
  }
}

const health = await http('http://localhost:8000/api/health');
if (health?.status === 'ok' && health?.sandbox === true) ok.push('backend health: ok, sandbox=true');
else if (health) problems.push(`backend health unexpected: ${JSON.stringify(health)}`);

const scenarios = await http('http://localhost:8000/api/scenarios');
if (Array.isArray(scenarios)) {
  ok.push(`backend scenarios: ${scenarios.length}`);
  const ids = new Set(scenarios.map((s) => s.id));
  for (const id of DEMO_IDS) {
    if (!ids.has(id)) problems.push(`demo scenario missing from API: ${id}`);
  }
  if (scenarios.length < 22) warnings.push(`only ${scenarios.length} scenarios (expected at least 22)`);
}

try {
  const res = await fetch('http://localhost:3000/', { signal: AbortSignal.timeout(5000) });
  if (res.status === 200) ok.push('frontend: HTTP 200');
  else problems.push(`frontend HTTP ${res.status}`);
} catch (err) {
  problems.push(`frontend — ${err.message}`);
}

const mainConfig = read(path.join(root, 'config/report-fields.json'));
if (mainConfig.fields.length !== 14 || mainConfig.fields.some((f) => f.verification.status !== 'unverified')) {
  problems.push('main config changed: expected 14 fields, all unverified');
} else {
  ok.push('main config unchanged: 14 fields, all unverified');
}

const sandboxConfig = read(path.join(sandbox, 'config/sandbox-fields.json'));
if (sandboxConfig.status !== 'ILLUSTRATIVE_NOT_OFFICIAL') {
  problems.push('sandbox field config lost ILLUSTRATIVE_NOT_OFFICIAL status');
} else {
  ok.push('sandbox field config: illustrative only');
}

for (const id of DEMO_IDS) {
  const file = path.join(sandbox, 'scenarios', `${id}.json`);
  if (!fs.existsSync(file)) problems.push(`scenario file missing: ${id}.json`);
  else if (read(file).synthetic !== true) problems.push(`scenario not synthetic: ${id}`);
}
ok.push('three demo scenario files present and synthetic');

const dashboard = await http('http://localhost:8000/api/gateway/reports');
if (Array.isArray(dashboard)) {
  if (dashboard.length > 0) {
    warnings.push(`dashboard has ${dashboard.length} stored submission(s) — delete backend/sandbox.db and restart before the final demo`);
  } else {
    ok.push('dashboard empty: no stored submissions');
  }
}

try {
  const output = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim();
  if (output) warnings.push('working tree is not clean — commit or stash before presenting');
  else ok.push('working tree clean');
} catch {
  warnings.push('could not check git status');
}

console.log('GramVaani Sandbox preflight');
console.log('---------------------------');
for (const line of ok) console.log(`  ok    ${line}`);
for (const line of warnings) console.log(`  WARN  ${line}`);
for (const line of problems) console.log(`  FAIL  ${line}`);
if (problems.length) {
  console.log(`\nFAILED — ${problems.length} problem(s). Start backend and frontend before presenting.`);
  process.exit(1);
}
console.log(`\nPASS — ${warnings.length} warning(s). Read SAFETY.md and DEMO_3MIN.md before presenting.`);
