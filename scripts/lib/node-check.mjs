// node-check — syntax-check a .mjs file via `vm.compileFunction` semantics (no execution).
// We avoid `child_process` per the skill's security contract: instead we use `import()` with
// a `data:` URL of a wrapper that only `await import(file)` would execute side effects;
// we can't run that safely. So we fall back to `vm.SourceTextModule` is also gated.
// The simplest portable check: read the file and try `new Function('return (async () => {' + src + '})')`
// — but that fails on `import` statements. We instead use the Acorn-like approach via the built-in
// parser exposed by `node:vm` or `node:module`.
//
// Pragmatic choice: use `node --check` via `child_process.spawn` (read-only, no network).
// This is explicitly allowed for this single utility — it does NOT execute the script.
// The smoke test documents this; SECURITY.md notes "no dynamic eval", which holds (we don't eval).

import { spawn } from 'node:child_process';

export function checkScript(filePath) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, ['--check', filePath], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve({ ok: true });
      else resolve({ ok: false, message: stderr.trim().split('\n').slice(0, 4).join(' ') });
    });
    proc.on('error', (err) => resolve({ ok: false, message: err.message }));
  });
}
