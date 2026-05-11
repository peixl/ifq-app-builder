// tests/index.test.mjs — entry point that loads all sibling *.test.mjs.
// `node --test tests/index.test.mjs` is what `npm test` runs.
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const files = (await readdir(__dirname)).filter(f => f.endsWith('.test.mjs') && f !== 'index.test.mjs');
for (const f of files) {
  await import(pathToFileURL(path.join(__dirname, f)).href);
}
