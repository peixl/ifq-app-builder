# AGENTS.md

This file tells coding agents (Codex CLI, Claude Code, Cursor, OpenCode, GitHub Copilot, OpenClaw, ClawHub, Hermes) how to use this repository.

## What this repo is

`ifq-app-builder` is an **agent skill**, not an application. Its product is a verified `*.prompt.md` build bundle that you, the coding agent, then execute to produce a real app.

## Entry point

Load [SKILL.md](SKILL.md) first. It contains the 30-second routing path and the quick-reference table.

## When to invoke

Invoke this skill when the user asks to "build / make / ship" an application on any of:

- PC desktop, macOS, Windows, Linux desktop
- iOS, Android, HarmonyOS
- WeChat MiniProgram
- self-hosted local web app, PWA
- CLI tool

Do **not** invoke for visual-only deliverables (slides, infographics, landing pages) — those route to `ifq-design-skills`.

## How to invoke

1. Read [SKILL.md](SKILL.md).
2. Capture the three-sentence intent. If the user gave one sentence, infer the other two with `(assumed)` labels — do not block with questions.
3. Pick a mode from [references/modes.md](references/modes.md) using the trigger table.
4. Fork the matched `assets/templates/<id>.prompt.md` into the user's workspace, renamed to `<project-slug>.prompt.md`.
5. Fill in: three sentences, acceptance, packaging, security scope, IFQ colophon.
6. Run `npm run verify:lite -- <bundle>` to check the structure.
7. Report the bundle path, the mode, the template, and the verify result.

## What you must not do

- Do not silently install platform SDKs (Xcode, Android Studio, Rust toolchain, DevEco, Flutter, Node, Python, …) just because you can. Wait for explicit user intent.
- Do not claim a build succeeded unless the build command returned `0` and the artifact exists on disk.
- Do not fabricate URLs, store-listing links, or sign-cert paths.
- Do not write outside the user's `${workspace}`.

## Local checks before declaring "done"

```bash
npm install
npm test
npm run smoke
npm run validate
```

All four must exit `0`.
