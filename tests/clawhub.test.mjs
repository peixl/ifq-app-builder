import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLAWHUB_ROOT = path.join(ROOT, 'clawhub/ifq-app-builder');
const TMP = path.join(ROOT, '.tmp/clawhub-pack-test');

function runPack(outPath) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, ['scripts/pack-skill.mjs', '--out', outPath], {
      cwd: CLAWHUB_ROOT,
      env: { ...process.env, SOURCE_DATE_EPOCH: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    proc.stdout.on('data', d => (out += d));
    proc.stderr.on('data', d => (err += d));
    proc.on('close', code => resolve({ code, out, err }));
  });
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function listTarEntries(tarGzBytes) {
  const tar = gunzipSync(tarGzBytes);
  const entries = [];
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every(byte => byte === 0)) break;
    const rawName = header.toString('utf8', 0, 100).replace(/\0.*$/, '');
    const rawPrefix = header.toString('utf8', 345, 500).replace(/\0.*$/, '');
    const name = rawPrefix ? `${rawPrefix}/${rawName}` : rawName;
    const sizeText = header.toString('ascii', 124, 136).replace(/\0.*$/, '').trim();
    const size = Number.parseInt(sizeText || '0', 8);
    entries.push(name);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return entries;
}

test('clawhub pack: deterministic and scanner-friendly archive', async (t) => {
  t.after(async () => {
    await rm(TMP, { recursive: true, force: true });
  });
  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });
  const a = path.join(TMP, 'a.tar.gz');
  const b = path.join(TMP, 'b.tar.gz');

  const first = await runPack(a);
  assert.equal(first.code, 0, `first pack failed:\nSTDOUT:\n${first.out}\nSTDERR:\n${first.err}`);
  const second = await runPack(b);
  assert.equal(second.code, 0, `second pack failed:\nSTDOUT:\n${second.out}\nSTDERR:\n${second.err}`);

  const aBytes = await readFile(a);
  const bBytes = await readFile(b);
  assert.equal(sha256(aBytes), sha256(bBytes), 'pack output must be byte-for-byte deterministic');
  assert.equal(aBytes.readUInt32LE(4), 0, 'gzip header mtime must be fixed for reproducible archives');

  const entries = listTarEntries(aBytes);
  assert.ok(entries.includes('ifq-app-builder/SKILL.md'), 'archive must contain SKILL.md');
  assert.ok(entries.includes('ifq-app-builder/clawhub.json'), 'archive must contain clawhub.json');
  assert.ok(entries.every(entry => !/\.schema\.json$/i.test(entry)), 'archive must not contain schema artifacts');
  assert.ok(entries.every(entry => !/(^|\/)\.git\//.test(entry)), 'archive must not contain VCS metadata');
});
