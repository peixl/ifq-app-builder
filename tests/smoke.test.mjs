import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(script, args = []) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [path.join('scripts', script), ...args], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    proc.stdout.on('data', d => (out += d));
    proc.stderr.on('data', d => (err += d));
    proc.on('close', code => resolve({ code, out, err }));
  });
}

test('smoke-test.mjs: exits 0', async () => {
  const r = await run('smoke-test.mjs');
  assert.equal(r.code, 0, `smoke-test failed:\nSTDOUT:\n${r.out}\nSTDERR:\n${r.err}`);
});

test('validate-templates.mjs: exits 0', async () => {
  const r = await run('validate-templates.mjs');
  assert.equal(r.code, 0, `validate-templates failed:\nSTDOUT:\n${r.out}\nSTDERR:\n${r.err}`);
});

test('verify-lite.mjs: clean on sample bundle', async () => {
  const r = await run('verify-lite.mjs', ['tests/fixtures/sample-bundle.prompt.md']);
  assert.equal(r.code, 0, `verify-lite failed:\nSTDOUT:\n${r.out}\nSTDERR:\n${r.err}`);
});

test('verify-lite.mjs: --template mode on every template exits 0', async () => {
  const r = await run('verify-lite.mjs', [
    '--template',
    'assets/templates/pc-tauri.prompt.md',
    'assets/templates/macos-swiftui.prompt.md',
    'assets/templates/local-web-nextjs.prompt.md',
  ]);
  assert.equal(r.code, 0, `verify-lite --template failed:\nSTDOUT:\n${r.out}\nSTDERR:\n${r.err}`);
});

test('quality-score.mjs --json on sample bundle parses & total>=90', async () => {
  const r = await run('quality-score.mjs', ['--json', 'tests/fixtures/sample-bundle.prompt.md']);
  assert.equal(r.code, 0, `quality-score exited ${r.code}:\n${r.err}`);
  const data = JSON.parse(r.out);
  assert.ok(Array.isArray(data) && data.length === 1);
  assert.ok(data[0].total >= 90, `expected score >=90, got ${data[0].total}`);
});

test('quality-score.mjs: exits 2 for missing bundle', async () => {
  const r = await run('quality-score.mjs', ['missing.prompt.md']);
  assert.equal(r.code, 2, `quality-score should fail on missing input:\nSTDOUT:\n${r.out}\nSTDERR:\n${r.err}`);
});
