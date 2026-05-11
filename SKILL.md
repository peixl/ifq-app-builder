---
name: ifq-app-builder
description: "Use this skill whenever the user wants to ship a real, working application — desktop (Windows/Mac/Linux), mobile (iOS/Android/HarmonyOS), WeChat MiniProgram, self-hosted local web, PWA, or CLI — from a short natural-language brief. It converts a three-sentence intent into a verified build-ready prompt bundle (target platform, scaffold, acceptance, packaging, IFQ ambient signature) that any coding agent (Codex CLI, Claude Code, Cursor, OpenClaw, Copilot, ClawHub, Hermes) can execute end-to-end. Do not use for visual-only design deliverables (use ifq-design-skills), pure copy editing, SEO marketing pages, or backend-only services with no user-facing surface."
version: "1.0.0"
license: "Apache-2.0"
homepage: "https://github.com/peixl/ifq-app-builder"
metadata: {"author":"ifq.ai","version":"1.0.0","homepage":"https://github.com/peixl/ifq-app-builder","category":"engineering","tags":["app","desktop","mobile","ios","android","harmonyos","miniprogram","tauri","electron","flutter","react-native","swiftui","kotlin","arkts","wechat","pwa","cli","ifq","prompt-engineering","scaffold"],"openclaw":{"category":"engineering","tags":["app","desktop","mobile","ios","android","harmonyos","miniprogram","tauri","flutter","wechat","pwa","cli","scaffold","prompt-bundle","ifq"],"homepage":"https://github.com/peixl/ifq-app-builder","requires":{"bins":["node"],"env":[]},"primaryEnv":null},"hermes":{"category":"engineering","tags":["app","cross-platform","prompt-bundle","scaffold","ifq"]},"clawhub":{"category":"engineering","tags":["app","cross-platform","scaffold","ifq"],"requires":{"bins":["node"],"env":[]},"capability_signals":{"crypto":false,"can_make_purchases":false,"requires_sensitive_credentials":false},"audit":"passes-static-security-scan"},"agentskills":{"standard":"agentskills.io/v1"},"capabilities":{"read_files":true,"write_files":true,"run_shell":"optional","network":"optional_fact_checks_only","dynamic_eval":false,"silent_install":false,"persistent_background":false},"permissions":{"filesystem":{"read":["{baseDir}/**"],"write":["${workspace}/**"]},"shell_allowlist":["npm test","npm run verify:lite","npm run smoke","npm run validate","npm run validate:clawhub","npm run quality:score"],"network_allowlist":["web_search"]},"security":{"audit_clean":true,"node_python_process_control":false,"dynamic_eval":false,"script_network":false,"secrets_in_repo":false,"zero_install_core_loop":true},"entrypoints":["SKILL.md","references/modes.md","assets/templates/INDEX.json"],"compatibility":["claude_code","codex_cli","opencode","openclaw","hermes","cursor","codebuddy","copilot","generic"]}
---

# IFQ App Builder

Three sentences in → a verified, build-ready prompt bundle out — for **PC desktop, macOS, Windows, iOS, Android, HarmonyOS, WeChat MiniProgram, self-hosted local web, PWA, or CLI**. This file is the short router. Load deeper files only when the task requires them.

> Made by [ifq.ai](https://ifq.ai). The IFQ ambient layer (calm rhythm, warm paper, rust ledger, signal spark, quiet URL, mono field notes) is woven into every output as a subtle authorship signature — never as a loud watermark.

## 30-Second Load Path

1. Confirm the request is "ship a real app". If it is a visual-only deliverable, defer to `ifq-design-skills`.
2. Capture the **three-sentence intent** ([references/three-sentence-contract.md](references/three-sentence-contract.md)). If user gave one sentence, infer the other two with labeled assumptions — do **not** stop to ask more than one question.
3. Pick a mode from [references/modes.md](references/modes.md), then read [assets/templates/INDEX.json](assets/templates/INDEX.json).
4. Fork the matched `*.prompt.md` template into the user's workspace and fill in the three-sentence content, acceptance, packaging, IFQ ambient signature.
5. Verify with `npm run verify:lite -- <bundle.prompt.md>`. Hand the bundle to the coding agent for execution.

## Human + Agent Promise

- **Humans** get one paste-ready prompt bundle that a coding agent can finish end-to-end (scaffold → run → verify → package) — no second prompt round needed for the happy path.
- **Agents** get a short route: mode, template, must-read references, three-sentence contract, verification command.
- **Maintainers** get regression pressure: 12 mode evals, scanner-clean scripts, policy-validated template index.
- **Marketplaces** get a readable package: one-line install (`npm test` is the whole local CI), zero required env vars, explicit permissions, no silent installs, no network at install time.

## First-Run Success Path

After install, the first interaction produces a visible bundle in one turn:

1. Accept a natural-language app request without turning it into setup.
2. Route it to **one mode** and **one template**; name both in the final evidence.
3. Write `<workspace>/<slug>.prompt.md` with labeled assumptions for anything unresolved.
4. Run `npm run verify:lite -- <bundle.prompt.md>` when shell is available.
5. Report the bundle path, route, template, verification result, and only caveats that affect use.

Do not ask for account login, global install, or broad environment changes during the first-run path.

## Output Boundary

- **Core output is a verified `*.prompt.md` build bundle**, plus an optional `scaffold/` folder when the user explicitly asks for code.
- Actual project scaffolding (running `cargo tauri init`, `flutter create`, `xcodegen`, `npx create-next-app`, etc.) is executed by the **calling coding agent** using the bundle — this skill does not silently install platform SDKs.
- Never claim a build, package, screenshot, or store-submission status until the relevant command has actually returned `0` and the artifact exists on disk.

## Use When

- User wants a real shippable app on a concrete platform (desktop / mobile / mini / local web / CLI).
- User says "用 Codex / Claude Code / Cursor 给我做一个 ... app".
- User wants packaging output (`.dmg`, `.exe`, `.apk`, `.ipa`, `.hap`, `.wxapkg`, `docker image`).
- User wants the same idea on multiple platforms and needs a per-platform plan, not one-size-fits-all.

## Do Not Use When

- Visual-only deliverable (slide deck, infographic, landing page) — route to `ifq-design-skills`.
- Pure copy editing with no app surface.
- The real task is a single CSS bug inside an existing production app.
- The user asks for an SEO-critical marketing site (use the design skill or a Next.js starter directly).

## Tier Policy

| Tier | Default? | Requires | Use for |
|---|---:|---|---|
| Tier 0 | yes | Node >= 18.17 | Generate + verify the prompt bundle (`npm test`, `npm run verify:lite`, `npm run smoke`). Zero install beyond `node`. |
| Tier 1 | opt-in | Platform SDK chosen by the **caller** (Xcode / Android Studio / Rust + Tauri / Flutter / DevEco / 微信开发者工具 / Node) | Actually building the app the bundle describes. |
| Tier 2 | opt-in | CI runners, code-signing certs, store accounts | Notarization, store submission, OTA channels. |

Do not install Tier 1/2 tooling unless the user explicitly intends to build right now.

## Routing Decision Tree

```
User request arrives
  │
  ├─ Is it "ship a real app"? ── No → exit skill, hand back to default agent
  │
  ├─ Three-sentence intent complete? ── No → infer with labeled assumptions, do not ask
  │                                          more than one question this turn
  │
  ├─ Match a mode trigger at >70% confidence? ── Yes → fork template → fill → verify
  │
  ├─ Multiple platforms? ── Yes → emit one bundle per platform with a shared "shared-core"
  │                                section so the calling agent can reuse business logic
  │
  └─ Unclear platform? ── Use platform-matrix.md to pick the cheapest viable mode and
                          name the assumption out loud
```

Read [references/modes.md](references/modes.md) for the full mode protocol. The Quick Reference below is the speed layer.

## Quick Reference (Agent Speed Table)

| Mode | Trigger keywords | Template | Tech default |
|---|---|---|---|
| A-01 | PC 桌面、跨平台桌面、Win+Mac、desktop tool | `T-pc-tauri` | Tauri 2 + React/Vite |
| A-02 | macOS 原生、Mac App、menu bar | `T-macos-swiftui` | SwiftUI + AppKit bridge |
| A-03 | Windows 原生、WinUI、WPF | `T-windows-winui` | WinUI 3 + .NET 8 |
| A-04 | iOS App、iPhone、App Store | `T-ios-swiftui` | SwiftUI + Swift Package |
| A-05 | Android App、安卓、Play 商店 | `T-android-compose` | Kotlin + Jetpack Compose |
| A-06 | 鸿蒙、HarmonyOS、ArkTS、华为应用市场 | `T-harmonyos-arkts` | ArkTS + ArkUI (Stage Model) |
| A-07 | Flutter、一份代码多端、跨端移动 | `T-flutter-cross` | Flutter 3 + Riverpod |
| A-08 | React Native、Expo、跨端 JS | `T-react-native-expo` | Expo SDK + TypeScript |
| A-09 | 微信小程序、WeChat MiniProgram | `T-wechat-miniprogram` | 原生小程序 + TypeScript |
| A-10 | 本地部署网页、self-host web、内网 web | `T-local-web-nextjs` | Next.js 15 + Docker |
| A-11 | PWA、离线 Web、可安装网页 | `T-pwa-vite` | Vite + Workbox |
| A-12 | CLI 工具、命令行、脚本 | `T-cli-node-python` | Node 20 or Python 3.11 |

All bundles verify with: `npm run verify:lite -- <bundle.prompt.md>` (Tier 0, zero-install).

## The Three-Sentence Contract

Every bundle must include — explicitly labeled — three sentences:

1. **S1 — WHO + WHAT**: who uses it, what they do, what data flows in/out.
2. **S2 — WHERE**: platform target(s), runtime constraints, distribution channel.
3. **S3 — HOW SUCCESS LOOKS**: acceptance criteria, packaging artifact, non-goals.

If the user only gives one sentence, the skill **infers** the other two and prints them with `(assumed)` next to each — never blocks for clarification on the first turn. See [references/three-sentence-contract.md](references/three-sentence-contract.md).

## IFQ Ambient Layer

- The user's app is the subject. IFQ is the authored layer: calm rhythm, warm paper, rust ledger accents, signal spark for primary actions, mono field-notes captions, quiet URL/footer.
- Every bundle ends with a single-line colophon: `— shaped with ifq.ai/app-builder · <mode> · <template>`.
- Every bundle reserves one place for IFQ tokens (`assets/ifq-brand/ifq-tokens.css` for web/desktop, `references/ifq-brand-spec.md` for native).
- Avoid visible internal taxonomy labels (e.g. literal "Rust Ledger") in user-facing copy. Write real product content instead.

## Conversation Patterns

**Pattern A — Specific request (one turn):**
> 用户："给我做一个 Mac 桌面小工具，把 PDF 发票批量整理成 Excel" → 路由 A-01（Tauri，跨 Mac/Win） → 套用 `T-pc-tauri` → 填三句话 → 写出 `pdf-invoice-ledger.prompt.md` → `verify:lite` → 报告路径。

**Pattern B — Confident default (one turn):**
> 用户："做一个记账 App" → 默认 A-07 Flutter（跨 iOS/Android，单代码库性价比最高） → 命名假设："（assumed: iOS + Android, no web）" → 输出 bundle。

**Pattern C — Multi-platform (one turn, multiple bundles):**
> 用户："iOS、Android、鸿蒙都要" → 输出 3 个 bundle，共享一个 `shared-core` 业务逻辑章节；每个 bundle 顶部注明 `shared-core: ./shared-core.md`。

**Pattern D — Iterative refinement:**
> 用户："上次那个 Mac 工具，再加一个右键菜单导出 PDF" → 定位历史 bundle → 在 S3 增加验收条目 → 重新 verify → 报告改动。

Rule: **never ask more than 1 question per turn**. Use defaults for everything else and name them.

## Error Recovery

| Failure | Recovery |
|---|---|
| No mode matches | Fall back to A-01 (Tauri) for desktop, A-07 (Flutter) for mobile, A-10 (Next.js) for web. Name the fallback in the bundle. |
| `verify:lite` reports missing S1/S2/S3 | Fill the missing sentence with `(inferred)` content and re-verify. |
| `verify:lite` reports missing IFQ colophon | Append the standard colophon line and re-verify. |
| User says "too generic" | Re-route to a more specific mode (e.g. A-02 SwiftUI instead of A-01) and re-emit. |
| Coding agent fails the build | Capture the error verbatim, suggest the specific Tier 1 install command, never claim the build succeeded. |
| Platform requires resources we don't have (Apple Developer cert etc.) | Mark `S3.packaging` as `(blocked: need <resource>)` and proceed with unsigned/dev build. |
| Out of scope (visual-only) | Hand off to `ifq-design-skills` by name. |

## Safety Contract

- Root instructions stay scoped to app-bundle generation. No background services, persistent agents, or shell hooks.
- Scripts are local-first: no dynamic `eval`, no runtime network calls, no hidden installs, no writes outside the user's workspace.
- Required environment variables are intentionally empty. Optional platform SDKs are documented and invoked only after explicit user intent.
- OpenClaw/ClawHub metadata lives in the single-line JSON `metadata` field so parsers can gate on `metadata.openclaw.requires.bins` and `metadata.openclaw.requires.env`.

## Verification Before Delivery

1. Run `npm run verify:lite -- <bundle.prompt.md>` (checks: S1/S2/S3 present, mode tag valid, IFQ colophon, no `TODO:` leaks, no fabricated URLs, no hard-coded secrets).
2. For multi-platform requests, run `verify:lite` against each bundle.
3. After repo edits, run `npm test && npm run smoke && npm run validate`.

## Reference Map

| Need | Load |
|---|---|
| First-time quickstart | [references/quickstart.md](references/quickstart.md) |
| Full mode protocol | [references/modes.md](references/modes.md) |
| The three-sentence contract | [references/three-sentence-contract.md](references/three-sentence-contract.md) |
| Pick the cheapest viable platform | [references/platform-matrix.md](references/platform-matrix.md) |
| App-quality bar (what "high quality" means here) | [references/quality-bar.md](references/quality-bar.md) |
| Verification commands and exit codes | [references/verification.md](references/verification.md) |
| Packaging per platform (dmg/exe/apk/ipa/hap/wxapkg/docker) | [references/packaging.md](references/packaging.md) |
| i18n defaults (zh-CN / en) | [references/i18n.md](references/i18n.md) |
| Security baseline (OWASP-aligned) | [references/security-baseline.md](references/security-baseline.md) |
| IFQ brand specification | [references/ifq-brand-spec.md](references/ifq-brand-spec.md) |
| Agent compatibility (Codex / Claude / Cursor / Copilot / OpenClaw) | [references/agent-compatibility.md](references/agent-compatibility.md) |

## Completion Rule

Deliver the smallest verified bundle that satisfies the request. Report the bundle path(s), the verification commands run, and any caveats. Do not claim a built app, a store submission, or a signed installer unless the relevant command actually returned success.

— shaped with [ifq.ai](https://ifq.ai)/app-builder · root · v1.0.0
