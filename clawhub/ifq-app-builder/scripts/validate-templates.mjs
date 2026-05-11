#!/usr/bin/env node
// validate-templates — schema-check INDEX.json + verify every referenced template exists & scans clean.

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanBundle } from './lib/bundle-scanner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TPL_DIR = path.join(ROOT, 'assets/templates');

const RED = '\x1b[31m', GREEN = '\x1b[32m', DIM = '\x1b[2m', RESET = '\x1b[0m';
let failures = 0;
const fail = (msg) => { failures++; console.log(`${RED}✗${RESET} ${msg}`); };
const ok   = (msg) => console.log(`${GREEN}✓${RESET} ${msg}`);

// Lightweight JSON-schema validator — sufficient for our small schema.
// Supports: type, required, additionalProperties, minLength, minItems, pattern, items, properties.
function validate(data, schema, pathStr = '$') {
  const errs = [];
  if (schema.type) {
    const got = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data;
    if (schema.type !== got) errs.push(`${pathStr}: expected ${schema.type}, got ${got}`);
  }
  if (schema.type === 'string') {
    if (schema.minLength !== undefined && (data?.length ?? 0) < schema.minLength) errs.push(`${pathStr}: too short (<${schema.minLength})`);
    if (schema.pattern && !(new RegExp(schema.pattern)).test(data)) errs.push(`${pathStr}: does not match pattern ${schema.pattern}`);
  }
  if (schema.type === 'array') {
    if (schema.minItems !== undefined && data.length < schema.minItems) errs.push(`${pathStr}: needs >=${schema.minItems} items`);
    if (schema.items) data.forEach((item, i) => errs.push(...validate(item, schema.items, `${pathStr}[${i}]`)));
  }
  if (schema.type === 'object') {
    if (schema.required) for (const k of schema.required) if (!(k in data)) errs.push(`${pathStr}.${k}: required`);
    if (schema.properties) for (const [k, sub] of Object.entries(schema.properties)) if (k in data) errs.push(...validate(data[k], sub, `${pathStr}.${k}`));
    if (schema.additionalProperties === false && schema.properties) {
      for (const k of Object.keys(data)) if (!(k in schema.properties)) errs.push(`${pathStr}.${k}: unknown property`);
    }
  }
  return errs;
}

const indexPath  = path.join(TPL_DIR, 'INDEX.json');
const schemaPath = path.join(TPL_DIR, 'templates.schema.json');

if (!existsSync(indexPath))  { fail('assets/templates/INDEX.json missing'); process.exit(1); }
if (!existsSync(schemaPath)) { fail('assets/templates/templates.schema.json missing'); process.exit(1); }

const indexRaw  = await readFile(indexPath, 'utf8');
const schemaRaw = await readFile(schemaPath, 'utf8');
let index, schema;
try { index = JSON.parse(indexRaw); }   catch (e) { fail(`INDEX.json invalid JSON: ${e.message}`); process.exit(1); }
try { schema = JSON.parse(schemaRaw); } catch (e) { fail(`templates.schema.json invalid JSON: ${e.message}`); process.exit(1); }

const schemaErrs = validate(index, schema);
if (schemaErrs.length) { for (const e of schemaErrs) fail(e); }
else ok('INDEX.json conforms to templates.schema.json');

// Cross-check: every modeRoute references a template file that exists and scans clean.
const seenModes = new Set();
const seenTemplateIds = new Set();
for (const route of index.modeRoutes || []) {
  if (seenModes.has(route.mode)) fail(`duplicate mode ${route.mode} in INDEX.json`);
  if (seenTemplateIds.has(route.templateId)) fail(`duplicate templateId ${route.templateId} in INDEX.json`);
  seenModes.add(route.mode);
  seenTemplateIds.add(route.templateId);

  const filePath = path.join(TPL_DIR, route.templateFile);
  if (!existsSync(filePath)) { fail(`${route.mode}: templateFile ${route.templateFile} not found`); continue; }
  const raw = await readFile(filePath, 'utf8');
  const { findings } = scanBundle(raw, { templateMode: true });
  const errors = findings.filter(f => f.level === 'error');
  if (errors.length) {
    for (const e of errors) fail(`${route.templateFile} [${e.code}]: ${e.message}`);
  } else {
    ok(`${route.mode}  ${route.templateFile}`);
  }
  // mode + templateId tags must appear in the template body.
  if (!raw.includes(route.mode))      fail(`${route.templateFile} does not mention mode ${route.mode}`);
  if (!raw.includes(route.templateId))fail(`${route.templateFile} does not mention templateId ${route.templateId}`);
}

// Require all 12 modes.
const EXPECTED = ['A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08','A-09','A-10','A-11','A-12'];
for (const m of EXPECTED) if (!seenModes.has(m)) fail(`expected mode ${m} not found in INDEX.json`);

console.log('');
if (failures) { console.log(`${RED}✗ validate-templates: ${failures} failure(s)${RESET}`); process.exit(1); }
console.log(`${GREEN}✓ validate-templates: ${index.modeRoutes.length} template(s) registered, all clean${RESET}`);
