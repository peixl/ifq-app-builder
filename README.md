<div align="center">

# IFQ App Builder

**Three sentences in → a verified, build-ready prompt bundle out.**
PC · macOS · Windows · iOS · Android · HarmonyOS · WeChat MiniProgram · self-hosted local web · PWA · CLI.

[简体中文](README.zh-CN.md) · [SKILL.md](SKILL.md) · [Modes](references/modes.md) · [Templates](assets/templates/INDEX.json)

— shaped with [ifq.ai](https://ifq.ai)/app-builder

</div>

---

## Why this exists

Most "build me an app" prompts collapse on the first turn: the agent picks the wrong platform, forgets packaging, hallucinates a stack the user can't run, and leaves the operator to re-prompt three times.

`ifq-app-builder` is a single agent-native skill that fixes that collapse with **one contract** and **twelve templates**:

- **One contract** — every output is a `*.prompt.md` build bundle with three explicitly-labeled sentences (WHO/WHAT, WHERE, HOW SUCCESS LOOKS), an acceptance section, a packaging section, and a single-line IFQ colophon.
- **Twelve templates** — one per realistic platform path, each carrying its own quality bar, scaffold command, and verification hook.

The skill runs zero-install (Node ≥ 18.17). It is consumed by Codex CLI, Claude Code, Cursor, GitHub Copilot, OpenClaw, ClawHub, Hermes, and any AgentSkills-compatible host.

## The 3-sentence promise

```
S1 (WHO + WHAT)   财务同事，每天把一堆 PDF 发票整理成 Excel 台账。
S2 (WHERE)        macOS + Windows 桌面，本地运行，不联网。
S3 (HOW SUCCESS)  拖入文件夹自动出 .xlsx；不确定字段标黄；打包 .dmg + .exe；可一键卸载。
```

Paste those three lines (one is enough — the skill will infer the rest with labeled `(assumed)` defaults). The skill picks the cheapest viable mode (here: `A-01 / T-pc-tauri`), forks the matching template, fills it in, runs `verify:lite`, and hands the bundle to a coding agent for execution.

## Quick start

```bash
git clone https://github.com/peixl/ifq-app-builder.git
cd ifq-app-builder
npm install            # zero runtime deps; installs nothing platform-specific
npm test               # node --test (unit tests, no network)
npm run smoke          # 60s repo-wide sanity check
npm run validate       # smoke + template schema validation
```

Local CI runs entirely on `npm install && npm test && npm run validate`. No platform SDKs, no Docker, no Python. Green on macOS, Linux, Windows.

### Generate a bundle (inside a host agent)

Inside Codex CLI / Claude Code / Cursor / Copilot, after the skill is registered:

> "Use `$ifq-app-builder` to make a Mac + Windows desktop tool that batches PDF invoices into Excel."

The host agent loads `SKILL.md`, routes to `A-01`, forks `assets/templates/pc-tauri.prompt.md` into your workspace as `pdf-invoice-ledger.prompt.md`, fills the three sentences, and runs:

```bash
npx --yes ifq-app-builder@1 verify:lite -- pdf-invoice-ledger.prompt.md
# (or, from this repo)
npm run verify:lite -- /path/to/pdf-invoice-ledger.prompt.md
```

You then hand that bundle to the same coding agent — or a different one — to actually build the app.

## What "high quality" means here

A bundle is **high quality** when it scores well on every axis in [references/quality-bar.md](references/quality-bar.md):

| Axis | What we check |
|---|---|
| **Routing fit** | The chosen mode matches user intent at >70% confidence, or the fallback is named. |
| **Three-sentence completeness** | S1 / S2 / S3 are all present and non-empty. |
| **Acceptance is binary** | Every acceptance item is a yes/no observable, not a vibe. |
| **Packaging is concrete** | The target artifact (`.dmg`, `.apk`, `.hap`, `.wxapkg`, `docker image:tag`, etc.) is named. |
| **Stack is buildable** | Versions pinned (Tauri 2, Flutter 3.x, SwiftUI iOS 17+, ArkTS API 12, etc.). |
| **i18n default** | At minimum `en` + `zh-CN`, with a single source of strings. |
| **Security baseline** | OWASP-aligned: no plaintext secrets, no `eval`, explicit permission scope. |
| **IFQ ambient layer** | Tokens reserved, colophon line present, no loud watermark. |

Run `npm run quality:score -- <bundle.prompt.md>` to print a 0–100 score with the missing axes.

## Modes (the 12 templates)

| Mode | Template | Tech default | Output artifact |
|---|---|---|---|
| **A-01** PC 跨平台桌面 | `T-pc-tauri` | Tauri 2 + React/Vite | `.dmg` / `.exe` / `.AppImage` |
| **A-02** macOS 原生 | `T-macos-swiftui` | SwiftUI + Swift 5.9 | `.dmg`, optional MAS |
| **A-03** Windows 原生 | `T-windows-winui` | WinUI 3 + .NET 8 | MSIX / `.exe` |
| **A-04** iOS 原生 | `T-ios-swiftui` | SwiftUI + iOS 17 | `.ipa` (Dev or App Store) |
| **A-05** Android 原生 | `T-android-compose` | Kotlin + Jetpack Compose | `.apk` / `.aab` |
| **A-06** HarmonyOS Next | `T-harmonyos-arkts` | ArkTS + ArkUI (Stage) | `.hap` / `.app` |
| **A-07** Flutter 跨端 | `T-flutter-cross` | Flutter 3 + Riverpod | iOS + Android |
| **A-08** RN/Expo 跨端 | `T-react-native-expo` | Expo SDK + TS | iOS + Android + Web |
| **A-09** 微信小程序 | `T-wechat-miniprogram` | 原生小程序 + TS | `.wxapkg` |
| **A-10** 本地部署 Web | `T-local-web-nextjs` | Next.js 15 + Docker | docker image, self-host |
| **A-11** PWA | `T-pwa-vite` | Vite + Workbox | static site + SW |
| **A-12** CLI 工具 | `T-cli-node-python` | Node 20 or Python 3.11 | npm / pipx package |

See [references/modes.md](references/modes.md) for triggers, fallbacks, and verification per mode.

## Repository layout

```
SKILL.md                    Root router (load this first)
agents/openai.yaml          Display name, examples, invocation chips
assets/
  ifq-brand/                Brand tokens, DNA, ambient marks
  templates/
    INDEX.json              Schema-validated registry of the 12 templates
    *.prompt.md             The 12 build bundles you fork
references/                 Deep docs: contract, modes, quality, packaging, ...
scripts/
  verify-lite.mjs           Static scan: S1/S2/S3, colophon, placeholders, secrets
  smoke-test.mjs            60s repo-wide sanity
  validate-templates.mjs    INDEX.json + each template schema check
  quality-score.mjs         0–100 score with missing axes
tests/                      node --test
.github/workflows/ci.yml    Local-equivalent CI on Node 18 / 20 / 22
```

## Agent compatibility

| Host | How to register |
|---|---|
| **Codex CLI** | Drop the repo under `~/.codex/skills/ifq-app-builder/`. |
| **Claude Code** | `.claude/skills/ifq-app-builder/` or workspace-level `SKILL.md`. |
| **Cursor / OpenCode** | Reference via the workspace `AGENTS.md`. |
| **GitHub Copilot** (this skill format) | Place under `.github/copilot/skills/` or VS Code agent customization. |
| **OpenClaw / ClawHub / Hermes** | `metadata.openclaw` is already populated in `SKILL.md` front-matter. |

See [references/agent-compatibility.md](references/agent-compatibility.md).

## Security posture

- No dynamic `eval`, no `new Function`, no `child_process` in skill scripts.
- No network calls at install or verify time.
- Required environment variables: **none**.
- Scripts only read inside `{baseDir}` and write inside `${workspace}`.
- Secret-pattern scanner runs in `npm run smoke`.

Report security issues per [SECURITY.md](SECURITY.md).

## License & trademark

Code and docs are Apache-2.0. The "IFQ" wordmark and ambient design language are trademarks of ifq.ai — see the trademark clause in [LICENSE](LICENSE). Downstream forks must remove or replace IFQ ambient marks before redistributing under a different brand.

## Acknowledgements

- The three-sentence framing is informed by the prompt-quality work in [Codex-Getting-Started-Tutorial](https://github.com/peixl/Codex-Getting-Started-Tutorial).
- The skill structure and verification conventions follow the [`ifq-design-skills`](https://github.com/peixl/ifq-design-skills) quality bar.

— shaped with [ifq.ai](https://ifq.ai)/app-builder · root · v1.0.0
