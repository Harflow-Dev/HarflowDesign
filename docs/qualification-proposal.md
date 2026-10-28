# Harness qualification proposal — HarflowMac #36

Status: approved by the owner on 2026-10-28 for native implementation. Approved reference: HarflowDesign commit `5d48a18`, `features/qualification.html`, `features/qualification.js`, and `features/qualification.css`, all documented states in Light and Dark. Approval does not certify native fidelity or a supporting engine release. Review [the local specimen](../features/qualification.html). It is offline, uses deterministic invented versions/results, and never contacts an engine, runs a provider probe, or starts a task.

## Placement and states

The proposal puts a compact Harness qualification card immediately below the harness selection and above the launch actions in New session and Run workflow. Settings / Harnesses reuses the card for explicit inspection/checking without a launch action. The workflow specimen represents one selected candidate; multi-candidate presentation is unresolved and must list every required candidate without claiming one result covers a workflow.

The browser controls are outside the app specimen. Surface changes reset to Not checked, preserving the selected harness identity. Appearance changes preserve the current specimen. Reset returns to New session, original binary, and Not checked while retaining the preview appearance. No timers, random fixtures, or automatic completions are used.

| State selector | Card behavior |
|---|---|
| Not checked | Installed harness/version, unavailable required feature results, explicit Check harness; launch disabled |
| Qualifying | Harness/version, Checking required features, per-feature Checking, Cancel check; launch disabled |
| Ready | Per-feature Ready with seeded and auto-probed sources; explicit Check again; launch available subject to the engine's gated preflight |
| Failed | Failed source, bounded reason, explicit Retry qualification; launch disabled |
| Failed at runtime | failed-at-runtime source invalidates earlier success; bounded reason and explicit retry; launch disabled |
| Harness unavailable | Installed executable cannot be found, no invented feature results; check and launch disabled |
| Unsupported engine | Explicit unsupported explanation, no guessed readiness or implicit runtime update; check and launch disabled |
| Cancelled | UI attempt invalidated; late results cannot enable launch; explicit retry |
| Binary changed | Selected replacement version shown, old evidence unavailable; explicit new check |

The deterministic interaction is Failed → Retry qualification → Qualifying → Deliver current success/failure (catalog controls). Cancel check invalidates the UI attempt and shows Cancelled. Switching the selected version during a check invalidates the attempt; Deliver old-binary success is ignored and the launch remains disabled. The same generation rule applies after cancelling, resetting, or changing surfaces. A result from a prior attempt of the same binary is stale too. The selected access level is fixed fixture data and never changes in response to qualification failure.

Feature names map to the engine's Codex `caller_write_tools` and `caller_approval_tools`; displayed results are examples, not certification of the invented versions. The actual required set must come from the public engine interface for the requested operation, rather than hardcoding this example pair for every task. Reasons must stay bounded and wrap rather than overflow. The native renderer should retain failed details while retry is available, show stable installed identity, and use actual engine sources rather than inferring them from success.

## Source basis and integration constraints

Pinned native baseline: HarflowMac `31ed11a1186c2aa87406c29b56cf063f5bc8c762`:

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NewSession/NewSessionView.swift`: harness selection, access level, launch disabled/busy state, inline errors, 760-point sheet.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowRunnerView.swift`: workflow launch surface; the proposal does not claim one qualification check covers all workflow candidates.
- `macos/HfFeatures/SettingsFeature/Sources/SettingsFeature/Harnesses/HarnessesView.swift`: explicit refresh and per-harness actions.
- `macos/HfCore/MonitorCore/Sources/MonitorCore/CtlModels.swift`: current `BackendAvailability` contains name, binary, installation and caller-approval capability but no qualification presentation.

The engine owns qualification and identity. The Mac app must consume public ctl/setup interfaces, never inspect private qualification receipts. Discovery remains cached-only; refreshing or opening the card must not initiate provider self-tests. Explicit check calls the supporting engine's qualification command; result adoption must revalidate the selected runtime, binary identity and UI generation. A bounded launch preflight can present the same busy card before any task begins. A failure must not widen access, automatically retry unrestricted, or hide a failed dependent feature behind a seeded sibling result.

UI cancellation means stop waiting/adopting the result, not proof that an engine process has stopped or that a receipt was never written. An explicit retry must reconcile fresh public discovery with the command outcome. The current app-paired engine 0.0.4 is unsupported: its published tag predates the qualification implementation. A future supporting engine version is unspecified, not an assumed published 0.0.5. Releasing and selecting that version is a separate explicit runtime decision.

## Validation and fidelity

The specimen uses shared semantic tokens and local classic scripts. Controls have labels, focus outlines, keyboard operation, and live status announcements; failure details wrap. Light and Dark can be selected independently. Native materials, typography, titlebar chrome and platform controls are approximations. The source-derived 760-point New session width is retained through horizontal overflow on narrow screens. Native multi-candidate workflow layout and actual qualification command behavior remain unverified. Syntax, links and fixture transition checks are local verification; browser/native visual review is still required before claiming visual correctness or approval.
