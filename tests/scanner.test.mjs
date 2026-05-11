import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanBundle, scoreBundle } from '../scripts/lib/bundle-scanner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE = await readFile(path.join(__dirname, 'fixtures/sample-bundle.prompt.md'), 'utf8');

const errorsOf = (raw, opts) => scanBundle(raw, opts).findings.filter(f => f.level === 'error');

test('scanner: filled sample bundle is clean', () => {
  const errors = errorsOf(SAMPLE);
  assert.deepEqual(errors, [], `expected no errors but got: ${JSON.stringify(errors, null, 2)}`);
});

test('scanner: rejects bundle missing S1', () => {
  const broken = SAMPLE.replace(/## S1 — WHO \+ WHAT[\s\S]*?(?=## S2)/, '');
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'missing-section' && /S1/.test(e.message)));
});

test('scanner: rejects bundle missing colophon', () => {
  const broken = SAMPLE.replace(/— shaped with ifq\.ai\/app-builder.*$/m, '');
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'missing-colophon'));
});

test('scanner: rejects bundle with TODO leak', () => {
  const broken = SAMPLE.replace('财务同事', 'TODO: fill this');
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'todo-leak'));
});

test('scanner: rejects bundle with brace placeholder leak', () => {
  const broken = SAMPLE.replace('财务同事', '{your persona here}');
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'brace-placeholder-leak'));
});

test('scanner: rejects bundle with <replace:> leak', () => {
  const broken = SAMPLE.replace('财务同事', '<replace: who uses it>');
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'replace-marker-leak'));
});

test('scanner: rejects stripe-live secret', () => {
  const broken = SAMPLE + '\napi_key = sk_live_' + 'A'.repeat(32) + '\n';
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'secret-stripe-live'));
});

test('scanner: rejects github PAT', () => {
  const broken = SAMPLE + '\ntoken = ghp_' + 'B'.repeat(40) + '\n';
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'secret-github-pat'));
});

test('scanner: rejects AWS access key', () => {
  // Build literal at runtime so the smoke-scan does not flag this source file.
  const fake = ['AKIA', 'IOSFODNN7EXAMPLE'].join('');
  const broken = SAMPLE + '\nAWS = ' + fake + '\n';
  const errors = errorsOf(broken);
  assert.ok(errors.some(e => e.code === 'secret-aws-access-key'));
});

test('scanner: rejects fewer than 3 acceptance items in normal mode', () => {
  const broken = SAMPLE.replace(/(## Acceptance[^\n]*\n[\s\S]*?)(?=\n## Scaffold)/, '$1\nReduced.\n')
    .replace(/- \[ \] [^\n]+\n/g, '- [ ] only one item\n');
  // Replace all checkbox lines with a single one
  const onlyOne = SAMPLE.replace(/((?:- \[ \] [^\n]+\n){2,})/g, '- [ ] just one\n');
  const errors = errorsOf(onlyOne);
  assert.ok(errors.some(e => e.code === 'too-few-acceptance-items'),
    `expected too-few-acceptance-items, got: ${errors.map(e => e.code).join(',')}`);
});

test('scanner: --template mode is lenient with <replace:> markers', () => {
  const tpl = SAMPLE.replace('财务同事', '<replace: who uses it>');
  const errors = errorsOf(tpl, { templateMode: true });
  // Should not error on the replace marker — template mode allows it.
  assert.ok(!errors.some(e => e.code === 'replace-marker-leak'));
});

test('scoreBundle: filled sample scores >= 90', () => {
  const { total, axes } = scoreBundle(SAMPLE);
  const failedAxes = axes.filter(a => !a.ok).map(a => a.name);
  assert.ok(total >= 90, `expected >=90 got ${total}; failed axes: ${failedAxes.join(', ')}`);
});

test('scoreBundle: returns 8 axes', () => {
  const { axes } = scoreBundle(SAMPLE);
  assert.equal(axes.length, 8);
});
