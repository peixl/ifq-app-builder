import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanBundle } from '../scripts/lib/bundle-scanner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TPL_DIR = path.resolve(__dirname, '../assets/templates');

test('templates: INDEX.json registers exactly 12 modes', async () => {
  const index = JSON.parse(await readFile(path.join(TPL_DIR, 'INDEX.json'), 'utf8'));
  assert.equal(index.modeRoutes.length, 12, 'INDEX.json must list 12 modeRoutes');
  const modes = index.modeRoutes.map(r => r.mode).sort();
  const expected = ['A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08','A-09','A-10','A-11','A-12'];
  assert.deepEqual(modes, expected);
});

test('templates: every registered template file exists', async () => {
  const index = JSON.parse(await readFile(path.join(TPL_DIR, 'INDEX.json'), 'utf8'));
  const onDisk = new Set((await readdir(TPL_DIR)).filter(f => f.endsWith('.prompt.md')));
  for (const route of index.modeRoutes) {
    assert.ok(onDisk.has(route.templateFile), `template file ${route.templateFile} missing on disk`);
  }
});

test('templates: every template scans clean in template-mode', async () => {
  const files = (await readdir(TPL_DIR)).filter(f => f.endsWith('.prompt.md'));
  const allErrors = [];
  for (const f of files) {
    const raw = await readFile(path.join(TPL_DIR, f), 'utf8');
    const { findings } = scanBundle(raw, { templateMode: true });
    const errors = findings.filter(x => x.level === 'error');
    if (errors.length) allErrors.push(`${f}: ${errors.map(e => e.code).join(',')}`);
  }
  assert.deepEqual(allErrors, [], `template-mode scan errors:\n${allErrors.join('\n')}`);
});

test('templates: every template names its mode and templateId', async () => {
  const index = JSON.parse(await readFile(path.join(TPL_DIR, 'INDEX.json'), 'utf8'));
  for (const route of index.modeRoutes) {
    const raw = await readFile(path.join(TPL_DIR, route.templateFile), 'utf8');
    assert.ok(raw.includes(route.mode),       `${route.templateFile} missing mode tag ${route.mode}`);
    assert.ok(raw.includes(route.templateId), `${route.templateFile} missing templateId ${route.templateId}`);
  }
});

test('templates: every template has IFQ colophon', async () => {
  const files = (await readdir(TPL_DIR)).filter(f => f.endsWith('.prompt.md'));
  for (const f of files) {
    const raw = await readFile(path.join(TPL_DIR, f), 'utf8');
    assert.ok(/—\s*shaped\s+with\s+ifq\.ai\/app-builder/i.test(raw), `${f} missing colophon`);
  }
});
