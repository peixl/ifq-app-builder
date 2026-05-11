<div align="center">

# IFQ App Builder

**三句话进，可执行的高质量 app 构建包出。**
PC · macOS · Windows · iOS · Android · HarmonyOS · 微信小程序 · 本地部署 Web · PWA · CLI。

[English](README.md) · [SKILL.md](SKILL.md) · [模式表](references/modes.md) · [模板索引](assets/templates/INDEX.json)

— shaped with [ifq.ai](https://ifq.ai)/app-builder

</div>

---

## 为什么造这个

"帮我做一个 App" 这个 prompt 几乎总会在第一回合崩掉：

- agent 选错平台
- 忘记打包目标
- 编造一个用户机器上跑不起来的栈
- 把后续每一轮都耗在反复澄清

`ifq-app-builder` 用 **一个契约 + 十二份模板** 把这件事钉住：

- **一个契约** —— 每次输出都是一个 `*.prompt.md` 构建包，明确写出三句话（**谁/做什么、在哪、如何算成功**），并附验收、打包、IFQ 落款。
- **十二份模板** —— 每个真实平台对应一份，自带技术栈版本、脚手架命令、验证钩子。

这套 skill 核心闭环零安装（只要 Node ≥ 18.17），可被 Codex CLI、Claude Code、Cursor、GitHub Copilot、OpenClaw、ClawHub、Hermes 等所有 AgentSkills 兼容宿主直接调用。

## 三句话承诺

```
S1（谁 + 做什么）  财务同事，每天把一堆 PDF 发票整理成 Excel 台账。
S2（在哪）        macOS + Windows 桌面，本地运行，不联网。
S3（如何算成功）  拖入文件夹自动出 .xlsx；不确定字段标黄；打包 .dmg + .exe；可一键卸载。
```

你只要给出其中一句，skill 会用带 `(assumed)` 标记的默认值把剩下两句补齐 —— 不会在第一回合反复追问。

随后它会选出性价比最高的模式（这里是 `A-01 / T-pc-tauri`），fork 对应模板、填三句话、跑 `verify:lite`，最后把构建包交给负责执行的 coding agent。

## 快速开始

```bash
git clone https://github.com/peixl/ifq-app-builder.git
cd ifq-app-builder
npm install            # 零运行时依赖
npm test               # node --test，无网络
npm run smoke          # 60 秒仓库级体检
npm run validate       # smoke + 模板策略校验 + ClawHub 包检查
npm run pack:clawhub   # 可复现的 OpenClaw/ClawHub tarball
```

本地 CI 全部跑在 `npm install && npm test && npm run validate`。不需要平台 SDK、不需要 Docker、不需要 Python。macOS / Linux / Windows 全绿。

### 在 agent 里生成一个构建包

在 Codex CLI / Claude Code / Cursor / Copilot 中注册本 skill 后：

> "用 `$ifq-app-builder` 给我做一个 Mac+Windows 桌面工具，能把 PDF 发票批量整成 Excel。"

宿主 agent 会加载 `SKILL.md`，路由到 `A-01`，把 `assets/templates/pc-tauri.prompt.md` fork 到工作目录命名为 `pdf-invoice-ledger.prompt.md`，填好三句话，跑：

```bash
npm run verify:lite -- /path/to/pdf-invoice-ledger.prompt.md
```

然后把这个构建包交给同一个或另一个 coding agent 真正动手实现。

## "高质量" 在这里的定义

一个构建包的质量由 [references/quality-bar.md](references/quality-bar.md) 中 8 条轴衡量：

| 轴 | 校验点 |
|---|---|
| **路由匹配** | 选中的模式与用户意图匹配度 >70%，否则显式声明回退。 |
| **三句话完整** | S1 / S2 / S3 都写满，没有空段。 |
| **验收可二元判定** | 每条验收都是 yes/no 可观测，而不是 vibe。 |
| **打包目标具体** | 给出明确产物：`.dmg` / `.apk` / `.hap` / `.wxapkg` / `docker image:tag`。 |
| **技术栈可构建** | 版本钉死（Tauri 2 / Flutter 3.x / iOS 17+ / ArkTS API 12 ...）。 |
| **i18n 默认** | 至少 `en` + `zh-CN`，单一字符串源。 |
| **安全基线** | OWASP 对齐：无明文密钥、无 `eval`、权限范围显式。 |
| **IFQ 氛围层** | 预留 token、附落款行、不贴大水印。 |

跑 `npm run quality:score -- <bundle.prompt.md>` 直接拿 0–100 分。

## 十二种模式

| 模式 | 模板 | 默认栈 | 产物 |
|---|---|---|---|
| **A-01** PC 跨平台桌面 | `T-pc-tauri` | Tauri 2 + React/Vite | `.dmg` / `.exe` / `.AppImage` |
| **A-02** macOS 原生 | `T-macos-swiftui` | SwiftUI + Swift 5.9 | `.dmg`、可选 MAS |
| **A-03** Windows 原生 | `T-windows-winui` | WinUI 3 + .NET 8 | MSIX / `.exe` |
| **A-04** iOS 原生 | `T-ios-swiftui` | SwiftUI + iOS 17 | `.ipa` |
| **A-05** Android 原生 | `T-android-compose` | Kotlin + Jetpack Compose | `.apk` / `.aab` |
| **A-06** HarmonyOS Next | `T-harmonyos-arkts` | ArkTS + ArkUI（Stage 模型） | `.hap` / `.app` |
| **A-07** Flutter 跨端 | `T-flutter-cross` | Flutter 3 + Riverpod | iOS + Android |
| **A-08** RN/Expo 跨端 | `T-react-native-expo` | Expo SDK + TS | iOS + Android + Web |
| **A-09** 微信小程序 | `T-wechat-miniprogram` | 原生小程序 + TS | `.wxapkg` |
| **A-10** 本地部署 Web | `T-local-web-nextjs` | Next.js 15 + Docker | docker image，自托管 |
| **A-11** PWA | `T-pwa-vite` | Vite + Workbox | 静态站 + Service Worker |
| **A-12** CLI 工具 | `T-cli-node-python` | Node 20 或 Python 3.11 | npm / pipx 包 |

详见 [references/modes.md](references/modes.md)。

## 安全姿态

- skill 脚本里没有 `eval`、没有 `new Function`、没有 `child_process`。
- 安装、校验、打分阶段均不发起网络请求。
- 必需环境变量：**无**。
- 脚本只读 `{baseDir}`，只写 `${workspace}`。
- `npm run smoke` 内置密钥模式扫描。

漏洞披露见 [SECURITY.md](SECURITY.md)。

## 许可与商标

代码与文档以 Apache-2.0 发布。"IFQ" 字标与氛围设计语言为 ifq.ai 商标 —— 详见 [LICENSE](LICENSE) 的商标条款。下游 fork 在以不同品牌再分发前，必须移除或替换 IFQ 氛围标识。

## 致谢

- 三句话框架受 [Codex-Getting-Started-Tutorial](https://github.com/peixl/Codex-Getting-Started-Tutorial) 中 prompt 质量条工作启发。
- skill 结构与验证约定沿用 [`ifq-design-skills`](https://github.com/peixl/ifq-design-skills) 的质量标准。

— shaped with [ifq.ai](https://ifq.ai)/app-builder · root · v1.0.1
