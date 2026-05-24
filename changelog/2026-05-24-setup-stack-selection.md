# Setup Stack Selection

Timestamp: 2026-05-24 18:49 Africa/Johannesburg

## Changed Files

- `cleanclaw/cli/setup-wizard.ts`
- `plans/incomplete/2026-05-12-install-project-setup-next-steps.md`
- `plans/complete/2026-05-24-setup-stack-selection.md`

## Summary

- Wired stack inference into project setup.
- Displayed inferred stack evidence during setup.
- Replaced raw stack id entry with numbered stack confirmation choices when inference is available.
- Allowed manual override when the inferred stack is wrong.
- Stored the selected stack in both `cleanclaw.config.json` and project-local settings.

## Reason

CleanClaw setup should infer the stack and ask the user to approve or override instead of requiring internal stack ids.

## Validation

- `npm.cmd run build:cleanclaw`
- `node bin/cleanclaw.js --help`
