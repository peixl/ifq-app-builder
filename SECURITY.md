# Security Policy

## Supported versions

The `1.x` line receives security fixes.

## Reporting a vulnerability

Please email **security@ifq.ai** with:

- A short description of the issue.
- A minimal reproduction (skill input + observed behaviour).
- The commit hash of the affected version (`git rev-parse HEAD`).

Do **not** open a public issue for unpatched vulnerabilities.

We acknowledge within 3 business days and aim to ship a fix within 14 days for high-severity issues.

## Threat model

`ifq-app-builder` runs entirely in the host agent's process at skill-load time and on `npm test / npm run smoke / npm run verify:lite / npm run validate`. The skill:

- Does **not** execute user-supplied code at verify time.
- Does **not** call `eval`, `new Function`, `child_process`, or dynamic `import()` of remote modules.
- Does **not** make network requests during install, test, or verify.
- Only reads files inside the skill's own `baseDir` and writes files inside the caller's `${workspace}`.
- Has zero required environment variables and zero required secrets.

The **generated build bundles** describe code that the calling coding agent will execute. Those bundles are reviewed as ordinary code: they must declare their network/permission scope in the `S2` / `S3` sections, and the agent that runs them is responsible for sandboxing.

## OWASP alignment

`references/security-baseline.md` enumerates the OWASP Top 10 items every generated bundle must address. The `verify:lite` scanner rejects bundles that hard-code secrets, embed plaintext API tokens, or omit the security section.
