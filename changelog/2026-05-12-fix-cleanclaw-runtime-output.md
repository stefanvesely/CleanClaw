# Fix CleanClaw Runtime Output Path

Timestamp: 2026-05-12T19:04:42+02:00

## Changed Files

- `tsconfig.cleanclaw.json`
- `package.json`
- `bin/cleanclaw.js`
- `scripts/write-cleanclaw-dist-package.js`
- `plans/complete/2026-05-12-fix-cleanclaw-runtime-output.md`

## Summary

- Updated `build:cleanclaw` to emit CleanClaw runtime files under `dist/cleanclaw`, matching the CLI imports and package manifest.
- Added a post-build helper that writes `dist/cleanclaw/package.json` with `"type": "module"` so Node treats the generated CleanClaw files as ESM.
- Switched `bin/cleanclaw.js` to CommonJS for the top-level commander import while keeping dynamic imports for built ESM modules.

## Reason

- The CLI imports CleanClaw modules from `dist/cleanclaw`, but the build was outputting them to `cleanclaw/dist/cleanclaw`. After fixing the output path, Node also needed a package marker to load the generated ESM modules without warnings.

## Validation

- `node --check bin/cleanclaw.js`
- `node --check scripts/write-cleanclaw-dist-package.js`
- `node_modules/.bin/tsc.cmd -p tsconfig.cleanclaw.json`
- `node scripts/write-cleanclaw-dist-package.js`
- `node bin/cleanclaw.js --version`
- `node bin/cleanclaw.js status`
- `git diff --check`
