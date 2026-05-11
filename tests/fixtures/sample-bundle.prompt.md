---
templateId: T-pc-tauri
ifqMode: A-01
stack: tauri-2 + react + vite
artifact: dmg+exe+AppImage
locale: ['zh-CN', 'en']
---

# pdf-invoice-ledger — A-01 / T-pc-tauri

Cross-platform desktop helper that turns a folder of PDF invoices into a single `.xlsx` ledger.
Mode A-01, template T-pc-tauri.

## S1 — WHO + WHAT

财务同事，每天把一堆 PDF 发票整理成 Excel 台账。输入：一个本地文件夹（PDF 发票，10~200 张）。输出：一份 `.xlsx`，列含发票号、开票方、税额、合计、不确定项黄色标注。

## S2 — WHERE

macOS 13+ 与 Windows 10/11 桌面，100% 本地运行，不联网，不上传任何文件。Distribution: signed `.dmg` 与 NSIS `.exe`，公司内网下载页面分发。Locales: zh-CN 与 en 双语 UI。

## S3 — HOW SUCCESS LOOKS

- 拖入文件夹后 30 秒内出 `.xlsx`。
- 不确定字段在 Excel 中以黄色背景标出。
- 产物为 `pdf-invoice-ledger.dmg` 与 `pdf-invoice-ledger-setup.exe`，皆已签名。
- 非目标：不做 OCR 手写体识别，不做云同步，不做发票真伪查询。

## Acceptance (binary, yes/no observable)

- [ ] `npm run tauri build` 在 macOS 上生成 `pdf-invoice-ledger.dmg`，文件存在且 `codesign -dv` 通过。
- [ ] `npm run tauri build` 在 Windows 上生成 `pdf-invoice-ledger-setup.exe`，`signtool verify /pa` 通过。
- [ ] 用样例 20 张 PDF 拖入，30 秒内输出 `.xlsx`，列数与样例一致。
- [ ] zh-CN 与 en 切换后所有可见字符串均切换（无硬编码英文遗留）。
- [ ] 关闭网络后启动应用仍可完整完成主流程。

## Scaffold (run order)

1. `npm create tauri-app@latest pdf-invoice-ledger -- --template react-ts`
2. `cd pdf-invoice-ledger && npm install`
3. Add deps: `pdfjs-dist`, `exceljs`, `i18next`, `react-i18next`.
4. Create `src/i18n/zh-CN.json` 与 `src/i18n/en.json`（key 同构）。
5. Wire Tauri allowlist: only `fs.readDir`, `fs.readBinaryFile`, `dialog.open`, `dialog.save`. Disable shell, http, process.
6. Build flow: `src-tauri/tauri.conf.json` 中 bundle.targets = `['dmg','nsis']`.
7. `npm run tauri build` per platform.

## Packaging

- macOS: `npm run tauri build` → `src-tauri/target/release/bundle/dmg/pdf-invoice-ledger.dmg`. Notarize via `xcrun notarytool submit ... --wait`.
- Windows: `npm run tauri build` → `src-tauri/target/release/bundle/nsis/pdf-invoice-ledger-setup.exe`. Sign via `signtool sign /tr http://timestamp.digicert.com /td SHA256 /fd SHA256 /a`.

## Security baseline

- Tauri allowlist scoped to filesystem-read and dialogs only; `shell`, `http`, `process` disabled.
- All file paths canonicalized and rejected if outside the user-picked root.
- No `eval`, no `new Function`, no remote `import()`.
- Sandbox: macOS hardened runtime entitlements minimal; Windows MSIX-style capability declaration.
- No telemetry, no analytics, no network calls anywhere.

## IFQ ambient

- Import tokens from `assets/ifq-brand/ifq-tokens.css` into the React app entry.
- Warm paper background, rust accent only on primary action.
- Field-notes mono caption in the footer with build date.

## Agent execution contract

- Pre-flight: confirm Rust toolchain present (`rustup --version`) and Node 20.
- During build: never `chmod -R` system paths; never modify global keychain.
- On failure: print last 40 lines of `cargo` log and stop; do not retry blindly.

— shaped with ifq.ai/app-builder · A-01 · T-pc-tauri
