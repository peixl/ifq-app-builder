#!/usr/bin/env node
// smoke-test — 60s repo-wide sanity. No network. No installs.
// Checks: required files exist, no schema artifacts ship as skill content, no secret leaks anywhere
// in repo, each template scans clean in template-mode, SKILL.md front-matter parses.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanBundle, _internal } from './lib/bundle-scanner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RED = '\x1b[31m', GREEN = '\x1b[32m', DIM = '\x1b[2m', RESET = '\x1b[0m';
let failures = 0;
const fail = (m) => { failures++; console.log(`${RED}✗${RESET} ${m}`); };
const ok   = (m) => console.log(`${GREEN}✓${RESET} ${m}`);

const REQUIRED_FILES = [
  'SKILL.md', 'README.md', 'README.zh-CN.md', 'LICENSE', 'SECURITY.md',
  'CONTRIBUTING.md', 'CHANGELOG.md', 'AGENTS.md', 'package.json',
  'agents/openai.yaml',
  'assets/ifq-brand/ifq-tokens.css', 'assets/ifq-brand/BRAND-DNA.md', 'assets/ifq-brand/mark.svg',
  'assets/templates/INDEX.json',
  'references/modes.md', 'references/three-sentence-contract.md', 'references/platform-matrix.md',
  'references/quality-bar.md', 'references/verification.md', 'references/packaging.md',
  'references/i18n.md', 'references/security-baseline.md', 'references/ifq-brand-spec.md',
  'references/agent-compatibility.md', 'references/quickstart.md',
];

for (const rel of REQUIRED_FILES) {
  const p = path.join(ROOT, rel);
  if (!existsSync(p)) fail(`missing required file: ${rel}`);
}
ok(`${REQUIRED_FILES.length} required files checked`);

// Walk the repo for secret-shaped tokens (skip .git, node_modules).
const SKIP = new Set(['.git', 'node_modules', '.next', '.omx', '.tmp', 'coverage', 'dist', 'build', 'out']);
const TEXT_EXT = new Set(['.md', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.json', '.yml', '.yaml', '.css', '.html', '.svg', '.toml']);

async function walk(dir) {
  let acc = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) acc = acc.concat(await walk(p));
    else if (entry.isFile() && TEXT_EXT.has(path.extname(entry.name))) acc.push(p);
  }
  return acc;
}

const allFiles = await walk(ROOT);
ok(`${allFiles.length} text files discovered`);

const schemaArtifacts = allFiles
  .map(f => path.relative(ROOT, f).replace(/\\/g, '/'))
  .filter(rel => rel.endsWith('.schema.json'));
if (schemaArtifacts.length) {
  for (const rel of schemaArtifacts) fail(`schema artifact must not ship in skill content: ${rel}`);
} else {
  ok('no *.schema.json artifacts present in skill content');
}

// Secret scan, except inside test fixtures expected to carry obfuscated examples.
const SECRET_PATTERNS = _internal.SECRET_PATTERNS;
let secretFinds = 0;
for (const f of allFiles) {
  const raw = await readFile(f, 'utf8');
  for (const [name, re] of SECRET_PATTERNS) {
    if (re.test(raw)) {
      // Allow regex literals themselves (these patterns appear inside bundle-scanner.mjs by definition).
      if (path.basename(f) === 'bundle-scanner.mjs') continue;
      // Allow doc files that explicitly enumerate the patterns.
      if (/security-baseline\.md|verification\.md|SECURITY\.md/.test(f)) continue;
      fail(`secret-shaped match (${name}) in ${path.relative(ROOT, f)}`);
      secretFinds++;
      break;
    }
  }
}
if (secretFinds === 0) ok('no secret-shaped tokens found in repo');

// Skill scripts must avoid process-spawning and dynamic-code primitives.
const scripts = (await walk(path.join(ROOT, 'scripts'))).filter(p => p.endsWith('.mjs'));
for (const f of scripts) {
  const rel = path.relative(ROOT, f);
  const raw = await readFile(f, 'utf8');
  if (/^\s*import\s+.*['"](?:node:)?child_process['"]/m.test(raw)) fail(`${rel}: imports process-spawning primitives`);
  if (/\beval\s*\(|\bnew\s+Function\s*\(|\bimport\s*\(/.test(raw)) fail(`${rel}: uses dynamic code-loading primitive`);
}
ok(`${scripts.length} script source file(s) avoid process spawning and dynamic code loading`);

// SKILL.md must start with valid YAML front-matter.
const skill = await readFile(path.join(ROOT, 'SKILL.md'), 'utf8');
if (!skill.startsWith('---')) fail('SKILL.md missing YAML front-matter');
else {
  const end = skill.indexOf('\n---', 3);
  if (end === -1) fail('SKILL.md front-matter never closes');
  else {
    const fm = skill.slice(4, end);
    if (!/\bname:\s*ifq-app-builder\b/.test(fm)) fail('SKILL.md front-matter missing name');
    if (!/\bdescription:\s*"/.test(fm))           fail('SKILL.md front-matter missing description');
    if (!/\bversion:\s*"/.test(fm))               fail('SKILL.md front-matter missing version');
    if (!/\bmetadata:/.test(fm))                  fail('SKILL.md front-matter missing metadata block');
    else ok('SKILL.md front-matter parses (name, description, version, metadata)');
  }
}

// agents/openai.yaml has display_name + examples list.
const ag = await readFile(path.join(ROOT, 'agents/openai.yaml'), 'utf8');
if (!/display_name:/.test(ag))    fail('agents/openai.yaml missing display_name');
if (!/examples:/.test(ag))        fail('agents/openai.yaml missing examples');
if (!/category_tags:/.test(ag))   fail('agents/openai.yaml missing category_tags');
ok('agents/openai.yaml passes shape check');

// Every template scans clean in template mode.
const tplDir = path.join(ROOT, 'assets/templates');
const templates = (await readdir(tplDir)).filter(f => f.endsWith('.prompt.md'));
for (const t of templates) {
  const raw = await readFile(path.join(tplDir, t), 'utf8');
  const { findings } = scanBundle(raw, { templateMode: true });
  const errors = findings.filter(f => f.level === 'error');
  if (errors.length) {
    for (const e of errors) fail(`${t} [${e.code}]: ${e.message}`);
  }
}
if (templates.length === 12 && failures === 0) ok(`${templates.length} templates scan clean in template-mode`);
else if (templates.length !== 12) fail(`expected 12 templates, found ${templates.length}`);

console.log('');
if (failures) { console.log(`${RED}✗ smoke: ${failures} failure(s)${RESET}`); process.exit(1); }
console.log(`${GREEN}✓ smoke: all clean${RESET}`);
