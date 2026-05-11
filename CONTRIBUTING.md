# Contributing

Thanks for considering a contribution. This skill is small on purpose — please keep PRs focused.

## Ground rules

1. **One concern per PR.** A new mode, a fixed test, a doc tweak — pick one.
2. **No new runtime dependencies.** The core loop must stay zero-install.
3. **No network at install / verify time.** If your script needs the network, it lives outside the core loop and is gated by explicit user intent.
4. **Tests must pass on Node 18, 20, and 22.** Run `npm test && npm run validate` before pushing.
5. **No silent IFQ branding changes.** The ambient layer is part of the skill's identity; discuss in an issue first.

## Local checks

```bash
npm install
npm test                  # node --test
npm run smoke             # repo-wide sanity
npm run validate          # smoke + template policy + ClawHub package checks
npm run verify:lite -- assets/templates/pc-tauri.prompt.md
npm run quality:score -- assets/templates/pc-tauri.prompt.md
```

All four must exit `0` before you push.

## Adding a new mode

1. Add an entry to `assets/templates/INDEX.json` (validated by the built-in template registry policy).
2. Write `assets/templates/<your-template>.prompt.md` that follows the three-sentence contract.
3. Add a row to the Quick Reference table in `SKILL.md` and to the table in both READMEs.
4. Add a unit test under `tests/` that loads your template and checks it scores ≥ 90 with `quality-score.mjs`.
5. Run `npm test && npm run validate` and paste the green output in your PR.

## Commit style

`<scope>: <imperative summary>` — for example `templates: add A-13 Roku channel`.

## License

By contributing you agree your work is published under Apache-2.0 with the IFQ trademark clause in [LICENSE](LICENSE).
