#!/usr/bin/env node
/**
 * Dependency-free structure verifier for the GramVaani Sandbox scenarios.
 *
 * Checks every scenario JSON, cross-references field ids with config, and
 * verifies that scenarios/manifest.json exactly matches the files on disk.
 * Paths resolve relative to this script's location, never the current cwd.
 *
 * Exit 0 with a summary on success, exit 1 with one line per problem on failure.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SANDBOX_DIR = resolve(SCRIPT_DIR, '..');
const SCENARIOS_DIR = join(SANDBOX_DIR, 'scenarios');
const FIELDS_PATH = join(SANDBOX_DIR, 'config', 'sandbox-fields.json');
const MANIFEST_PATH = join(SCENARIOS_DIR, 'manifest.json');

const REQUIRED_KEYS = [
  'id', 'title', 'category', 'transcript', 'expected_extracted',
  'expected_missing', 'clarification_answers', 'worker_corrections',
  'expected_validation', 'gateway', 'notes', 'synthetic',
];
const VALID_CATEGORIES = new Set([
  'normal', 'mixed-language', 'missing', 'ambiguous', 'contradiction',
  'duplicate', 'extraction-error', 'network', 'correction',
]);
const VALID_GATEWAY_MODES = new Set(['accept', 'reject', 'duplicate', 'network_failure']);

const problems = [];
const fail = (message) => problems.push(message);

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`${label}: invalid JSON (${err.message})`);
    return null;
  }
}

function main() {
  if (!existsSync(FIELDS_PATH)) {
    console.error(`FATAL: field config not found at ${FIELDS_PATH}`);
    process.exit(1);
  }
  if (!existsSync(SCENARIOS_DIR)) {
    console.error(`FATAL: scenarios directory not found at ${SCENARIOS_DIR}`);
    process.exit(1);
  }

  const fieldConfig = readJson(FIELDS_PATH, 'config/sandbox-fields.json');
  if (!fieldConfig) {
    console.error('FATAL: cannot read field config');
    process.exit(1);
  }
  const validFieldIds = new Set((fieldConfig.fields || []).map((f) => f.id));

  const manifest = readJson(MANIFEST_PATH, 'scenarios/manifest.json');
  if (!manifest) {
    console.error('FATAL: cannot read manifest');
    process.exit(1);
  }

  const files = readdirSync(SCENARIOS_DIR)
    .filter((name) => name.endsWith('.json') && name !== 'manifest.json')
    .sort();

  const seenIds = new Set();
  const scenarioById = new Map();

  for (const file of files) {
    const path = join(SCENARIOS_DIR, file);
    const scenario = readJson(path, `scenarios/${file}`);
    if (!scenario || typeof scenario !== 'object') continue;
    const label = `scenarios/${file}`;
    const id = scenario.id;

    if (typeof id !== 'string' || !id) {
      fail(`${label}: missing or invalid "id"`);
    } else {
      if (seenIds.has(id)) fail(`${label}: duplicate id "${id}"`);
      seenIds.add(id);
      scenarioById.set(id, scenario);
      if (file !== `${id}.json`) {
        fail(`${label}: file name must be "${id}.json"`);
      }
    }

    for (const key of REQUIRED_KEYS) {
      if (!(key in scenario)) fail(`${label}: missing required key "${key}"`);
    }
    if (scenario.synthetic !== true) {
      fail(`${label}: "synthetic" must be exactly true`);
    }
    if (!VALID_CATEGORIES.has(scenario.category)) {
      fail(`${label}: invalid category "${scenario.category}"`);
    }

    const gw = scenario.gateway;
    if (!gw || typeof gw !== 'object') {
      fail(`${label}: missing or invalid "gateway" object`);
    } else {
      if (!VALID_GATEWAY_MODES.has(gw.mode)) {
        fail(`${label}: invalid gateway.mode "${gw.mode}"`);
      }
      if (typeof gw.fail_first_attempt !== 'boolean') {
        fail(`${label}: gateway.fail_first_attempt must be a boolean`);
      }
    }

    const validation = scenario.expected_validation;
    if (!validation || typeof validation.valid !== 'boolean' || !Array.isArray(validation.errors)) {
      fail(`${label}: expected_validation must have boolean "valid" and array "errors"`);
    }

    const objects = [
      ['expected_extracted', scenario.expected_extracted],
      ['clarification_answers', scenario.clarification_answers],
      ['worker_corrections', scenario.worker_corrections],
    ];
    for (const [key, obj] of objects) {
      if (obj === undefined) continue;
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        fail(`${label}: "${key}" must be an object`);
        continue;
      }
      for (const fieldId of Object.keys(obj)) {
        if (!validFieldIds.has(fieldId)) {
          fail(`${label}: ${key} uses unknown field id "${fieldId}"`);
        }
      }
    }
    if (Array.isArray(scenario.expected_missing)) {
      for (const fieldId of scenario.expected_missing) {
        if (!validFieldIds.has(fieldId)) {
          fail(`${label}: expected_missing uses unknown field id "${fieldId}"`);
        }
      }
    } else if (scenario.expected_missing !== undefined) {
      fail(`${label}: "expected_missing" must be an array`);
    }
  }

  // Manifest header.
  if (manifest.synthetic !== true) {
    fail('scenarios/manifest.json: header "synthetic" must be exactly true');
  }
  if (typeof manifest.disclaimer !== 'string' || !manifest.disclaimer.trim()) {
    fail('scenarios/manifest.json: header "disclaimer" must be a non-empty string');
  }
  const entries = manifest.scenarios;
  if (!Array.isArray(entries)) {
    fail('scenarios/manifest.json: "scenarios" must be an array');
  } else {
    if (manifest.count !== entries.length) {
      fail(`scenarios/manifest.json: count ${manifest.count} != entries ${entries.length}`);
    }
    if (manifest.count !== files.length) {
      fail(`scenarios/manifest.json: count ${manifest.count} != scenario files ${files.length}`);
    }
    const manifestIds = new Set();
    for (const entry of entries) {
      for (const key of ['id', 'title', 'category', 'gateway_mode', 'file']) {
        if (!(key in entry)) fail(`manifest entry ${entry.id || '?'}: missing "${key}"`);
      }
      if (manifestIds.has(entry.id)) fail(`manifest: duplicate entry id "${entry.id}"`);
      manifestIds.add(entry.id);

      const scenario = scenarioById.get(entry.id);
      if (!scenario) {
        fail(`manifest: entry "${entry.id}" has no matching scenario file`);
        continue;
      }
      if (entry.file !== `${entry.id}.json`) {
        fail(`manifest entry "${entry.id}": file must be "${entry.id}.json"`);
      }
      if (entry.title !== scenario.title) {
        fail(`manifest entry "${entry.id}": title does not match scenario`);
      }
      if (entry.category !== scenario.category) {
        fail(`manifest entry "${entry.id}": category does not match scenario`);
      }
      if (entry.gateway_mode !== scenario.gateway?.mode) {
        fail(`manifest entry "${entry.id}": gateway_mode does not match scenario`);
      }
    }
    for (const id of seenIds) {
      if (!manifestIds.has(id)) fail(`manifest: scenario "${id}" is missing from the manifest`);
    }
  }

  if (problems.length > 0) {
    console.error(`Sandbox verification FAILED with ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }

  const modes = [...new Set([...scenarioById.values()].map((s) => s.gateway.mode))].sort();
  const categories = [...new Set([...scenarioById.values()].map((s) => s.category))].sort();
  console.log(`Sandbox verification PASSED`);
  console.log(`  Scenarios checked : ${files.length}`);
  console.log(`  Field ids allowed : ${validFieldIds.size}`);
  console.log(`  Gateway modes     : ${modes.join(', ')}`);
  console.log(`  Categories        : ${categories.join(', ')}`);
  console.log(`  Manifest entries  : ${entries.length} (count header ${manifest.count})`);
  process.exit(0);
}

main();
