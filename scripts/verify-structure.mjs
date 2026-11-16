#!/usr/bin/env node
/**
 * Structure and contract check for the GramVaani project.
 *
 * Verifies, without installing anything:
 *   1. config/report-fields.json and its schema parse
 *   2. the field config satisfies the schema's key constraints
 *      (run a full JSON Schema validator in CI once dependencies exist)
 *   3. every field carries a verification status and provenance
 *   4. the synthetic fixture only references known fields
 *   5. the mandatory non-official footer is present
 *   6. all relative Markdown links resolve
 *   7. required top-level directories exist
 *
 * Usage: node scripts/verify-structure.mjs
 * Exit code: 0 = pass, 1 = problems found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const notes = [];
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const cfg = readJson('config/report-fields.json');
readJson('config/report-fields.schema.json');
const expected = readJson('prototype-assets/synthetic-reports/example-001.expected.json');
notes.push('JSON parse: config, schema, expected fixture OK');

const requiredFieldKeys = [
  'id', 'label_te', 'label_en', 'type', 'requirement',
  'priority', 'section', 'extraction', 'clarification', 'verification',
];
const allowedTypes = new Set(['date', 'string', 'integer', 'number', 'boolean', 'enum_list', 'string_list']);
const sectionIds = new Set(cfg.preview.sections.map((s) => s.id));
const ids = new Set();

for (const f of cfg.fields) {
  for (const k of requiredFieldKeys) if (!(k in f)) errors.push(`field ${f.id}: missing "${k}"`);
  if (ids.has(f.id)) errors.push(`duplicate field id: ${f.id}`);
  ids.add(f.id);

  if (!/^[a-z][a-z0-9_]*$/.test(f.id)) errors.push(`field ${f.id}: id is not snake_case`);
  if (!allowedTypes.has(f.type)) errors.push(`field ${f.id}: unsupported type "${f.type}"`);
  if (!sectionIds.has(f.section)) errors.push(`field ${f.id}: section "${f.section}" not in preview.sections`);
  if (f.type === 'enum_list' && !Array.isArray(f.options)) errors.push(`field ${f.id}: enum_list without options`);
  if (['integer', 'number'].includes(f.type)) {
    if (!f.validation || typeof f.validation.min !== 'number' || typeof f.validation.max !== 'number') {
      errors.push(`field ${f.id}: numeric field without numeric min/max`);
    }
  }
  if (!f.extraction?.hints_te?.length) errors.push(`field ${f.id}: no Telugu extraction hints`);
  if (!f.clarification?.question_te) errors.push(`field ${f.id}: no Telugu clarification question`);

  const v = f.verification;
  if (!v || !['unverified', 'observed', 'verified', 'rejected'].includes(v.status)) {
    errors.push(`field ${f.id}: invalid verification.status`);
  } else if (v.status === 'verified' && !v.validated_in) {
    errors.push(`field ${f.id}: marked verified without a validated_in citation`);
  }
  if (!v?.note) notes.push(`field ${f.id}: no verification note (allowed, but provenance is thinner)`);
}

for (const k of Object.keys(expected.fields)) {
  if (!ids.has(k)) errors.push(`expected fixture references unknown field: ${k}`);
}
for (const k of expected.expected_absent_fields) {
  if (!ids.has(k)) errors.push(`expected_absent_fields references unknown field: ${k}`);
}

if (!cfg.preview.footer_en?.includes('Not submitted')) {
  errors.push('preview.footer_en must state that nothing is submitted');
}
if (!cfg.preview.footer_te) errors.push('preview.footer_te is missing (Telugu footer is required)');

const mdFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.next', '.venv'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) mdFiles.push(p);
  }
})(root);

let linkCount = 0;
const slug = (heading) => heading
  .toLowerCase()
  .replace(/[*`~]/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[^\p{L}\p{N}\s_-]/gu, '')
  .trim()
  .replace(/\s/g, '-');

const anchorsOf = (file) => {
  const set = new Set();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m) set.add(slug(m[1]));
  }
  return set;
};

for (const file of mdFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /\[[^\]]*\]\(([^)\s]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const target = m[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    linkCount++;
    const [clean, anchor] = target.split('#');
    const resolved = clean
      ? path.resolve(path.dirname(file), decodeURIComponent(clean))
      : file;
    if (!fs.existsSync(resolved)) {
      errors.push(`broken link in ${rel(file)} -> ${target}`);
      continue;
    }
    if (anchor && resolved.endsWith('.md')) {
      if (!anchorsOf(resolved).has(anchor.toLowerCase())) {
        errors.push(`broken anchor in ${rel(file)} -> ${target}`);
      }
    }
  }
}
notes.push(`${mdFiles.length} markdown files, ${linkCount} relative links checked (files + anchors)`);

for (const d of ['docs', 'research', 'research/instruments', 'research/notes', 'config',
  'frontend', 'backend', 'prototype-assets', 'tests', 'scripts']) {
  if (!fs.existsSync(path.join(root, d))) errors.push(`missing directory: ${d}`);
}

// Guardrail: no beneficiary, credential or submission concepts as *data structure*.
// Prose may discuss these words (the disclaimer does); keys and identifiers may not.
const bannedKeys = new Set(['beneficiary', 'beneficiaries', 'aadhaar', 'child_id', 'childid',
  'credentials', 'credential', 'password', 'submit_to', 'submission', 'child', 'person']);
const keys = new Set();
(function collectKeys(node) {
  if (Array.isArray(node)) return node.forEach(collectKeys);
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) { keys.add(k.toLowerCase()); collectKeys(v); }
  }
})(cfg);

for (const k of keys) {
  if (bannedKeys.has(k)) errors.push(`config defines a forbidden key: "${k}"`);
}
for (const f of cfg.fields) {
  for (const v of [f.id, ...(f.options ?? []).map((o) => o.value)]) {
    if (bannedKeys.has(String(v).toLowerCase())) errors.push(`config uses a forbidden identifier: "${v}"`);
  }
}

console.log('GramVaani structure check');
console.log('-------------------------');
console.log(`config_version: ${cfg.config_version}  status: ${cfg.status}`);
console.log(`fields: ${cfg.fields.length}  sections: ${cfg.preview.sections.length}`);
const counts = cfg.fields.reduce((a, f) => ((a[f.verification.status] = (a[f.verification.status] || 0) + 1), a), {});
console.log(`verification: ${JSON.stringify(counts)}`);
for (const n of notes) console.log(`· ${n}`);

if (errors.length) {
  console.log(`\nFAILED — ${errors.length} issue(s):`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  process.exit(1);
}
console.log('\nPASS — structure, contract and links are consistent.');
