# Changelog

All notable changes to this project will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] — 2026-05-11

### Changed

- Bumped root skill, package metadata, agent metadata, template registry, and ClawHub edition to `1.0.1`.
- Hardened ClawHub packaging, policy validation, and reproducible archive checks.

## [1.0.0] — 2026-05-11

### Added

- Initial release of `ifq-app-builder`.
- `SKILL.md` root router with the three-sentence contract, 12-mode quick reference, IFQ ambient layer, conversation patterns, error recovery, safety contract.
- 12 build-bundle templates under `assets/templates/`:
  - `T-pc-tauri`, `T-macos-swiftui`, `T-windows-winui`, `T-ios-swiftui`,
    `T-android-compose`, `T-harmonyos-arkts`, `T-flutter-cross`,
    `T-react-native-expo`, `T-wechat-miniprogram`, `T-local-web-nextjs`,
    `T-pwa-vite`, `T-cli-node-python`.
- Policy-validated `assets/templates/INDEX.json` without shipping schema artifacts.
- `references/` deep docs: modes, three-sentence contract, platform matrix, quality bar, verification, packaging, i18n, security baseline, IFQ brand spec, agent compatibility, quickstart.
- Scripts: `verify-lite.mjs`, `smoke-test.mjs`, `validate-templates.mjs`, `quality-score.mjs`.
- `tests/` with `node --test` coverage for verify-lite, smoke, templates, and quality-score.
- `.github/workflows/ci.yml` running on Node 18 / 20 / 22.
- `agents/openai.yaml` invocation chips.
- IFQ brand kit under `assets/ifq-brand/`.

[1.0.1]: https://github.com/peixl/ifq-app-builder/releases/tag/v1.0.1
[1.0.0]: https://github.com/peixl/ifq-app-builder/releases/tag/v1.0.0
