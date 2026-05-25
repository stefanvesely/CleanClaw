# Visible Route Change Policy

Created: 2026-05-25 01:35 Africa/Johannesburg
Status: Complete

Completed: 2026-05-25 01:38 Africa/Johannesburg

## Why

CleanClaw must not quietly switch provider, model, gateway route, or sandbox mode. If any of those change, the change needs explicit approval unless it is already part of a user-approved policy path.

## Assumptions

- This slice adds a reusable policy helper first.
- Existing gateway routing can call the helper later where user approval context exists.
- The helper should compare before/after route snapshots and report exactly what changed.

## Checklist

- [x] Add route snapshot type for provider/model/gateway/sandbox.
- [x] Detect hidden provider, model, gateway, and sandbox changes.
- [x] Allow changes only when approval text is supplied.
- [x] Add focused tests.
- [x] Update the master plan.
- [x] Run focused tests and build.
- [x] Add changelog.

## Validation Plan

- Run focused route change policy tests.
- Run `npm.cmd run build:cleanclaw`.
- Run `node bin/cleanclaw.js --help`.

## Validation Performed

- `npx.cmd vitest run cleanclaw/core/route-change-policy.test.ts`
- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
