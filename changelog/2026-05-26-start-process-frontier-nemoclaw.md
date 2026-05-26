# Start Process Frontier NemoClaw Wiring

Timestamp: 2026-05-26

Changed files:
- `cleanclaw/core/start-process.ts`

Summary:
- Updated `VerifyFrontierModels()` to use NemoClaw provider resolution, inference route config, and remote provider health probing.
- Added startup frontier settings loaded from the configured CleanClaw provider.
- Kept local providers local-first by skipping frontier checks when the configured provider is local.
- Updated `PromptForFrontierAPIKey()` to delegate to NemoClaw's `setupNim()` and `setupInference()` flow instead of building a separate CleanClaw provider menu.
- Implemented `VerifyNemoClawRuntime()` using NemoClaw's OpenShell version and gateway health helpers.
- Implemented `VerifyNemoClawGatewayModel()` using `openshell inference get` and NemoClaw's gateway inference parser.
- Removed `BuildStartupReadinessReport()` because the startup loop should own status/recovery reporting directly.
- Removed the placeholder `DecideStartupMode()`, `ContinueToProjectIntake()`, and `StopStartupWithRecoverySteps()` methods so startup continuation/blocking is handled directly by the process flow.
- Updated `LoadStartupConfiguration()` to rerun the existing CleanClaw setup wizard when config loading fails, then reload startup settings from the completed setup.
- Split out `runGlobalSetupWizard()` so startup config recovery repairs only global CleanClaw settings and does not run project setup.
- Wired the default `cleanclaw` command through `StartCleanClawStartupProcess()` before entering interactive project/task intake.
- Added local LLM setup to the global wizard using NemoClaw local inference helpers, writing `localModel` into global CleanClaw config.
- Added explicit global config status detection so first run/missing/invalid global config triggers global setup instead of silently using defaults.
- Rerun frontier verification after NemoClaw frontier setup succeeds so startup does not keep the original failed/skipped frontier result as the final state.
- Added guided local LLM recovery instructions to global setup when Ollama or vLLM detection fails.
- Changed frontier setup from a single retry into a verify/setup loop that exits when frontier verification is ready or setup cannot continue.
- Blocked frontier setup from continuing when NemoClaw returns a local/non-frontier provider selection.
- Added guided local LLM recovery responses for Ollama and vLLM when startup cannot verify the local provider.
- Updated NemoClaw runtime verification to call NemoClaw gateway recovery and re-check gateway health before blocking.

Reason:
- CleanClaw startup should reuse NemoClaw's existing frontier provider machinery instead of introducing a separate provider path.

Validation:
- Ran `cmd /c npm run build:cleanclaw` successfully.
