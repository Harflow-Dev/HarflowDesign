# Engine and runtime states

Status: **Provisional, not approved.** Drawn on 2026-11-23 on the owner's decisions of the same day (S2, S4, S5, O2, O3, O4, L2 and N2), relayed by the coordinator. The amendment of `settings/general` and the retirement of `app-states/setup` that came from the same decisions are approved and recorded in [Owner decisions of 2026-11-23](README.md#owner-decisions-of-2026-11-23). Nothing here is approved until the owner decides.

The states draw what the app shows when the runtime or the task store cannot be used, when a call to the runtime fails, and the runtime and task store rows of Settings → General. They fill the gaps listed for the engine transport, the contract and capability checks, and the managed runtime.

## Source

HarflowMac at `27b722aa` and HarflowMCP at `6ef3c0c0`, read through git objects only. `MC` is MonitorCore, `MWF` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature`.

- Contract versions: `contracts/v1/version-info.json` lists the contracts ctl, setup and events, each at version 1, and 35 advertised capabilities. It advertises no `mcp-allowlist` capability. The app understands ctl, setup and events version 1 (`CtlModels.swift:4`, `SetupClient.swift:7`, `Events.swift:9`) and the same major and minor product line (`WireContracts.swift:78,103`).
- Contract refusal text: "`<tool>` answered with contract version <v>; this app understands version <list>. Update the app or harflow so they match." (`CtlModels.swift:279-283`). Any other mismatch reads "Incompatible Harflow runtime: <detail> (incompatible_runtime)" with the details "unsupported <format> format", "product major/minor release line differs from 0.0.14", "missing required <cap> capability", "missing required <cap> contract/capability" and "app integration requires darwin/arm64" (`WireContracts.swift:147-229`).
- Tool failures (`CtlModels.swift:256-298`): "`<tool>` exited <code> without a JSON answer[: <stderr>]", "`<tool>` did not answer within <N> s." (the tool reads "harflow-ctl <command>"), "Could not run `<tool>`: <detail>" and the unsupported-command forms (`ToolError+UnsupportedCommand.swift:5-18`). Deadlines: quick 30 s, start 75 s, takeover 300 s, version-info 10 s, harflow-setup 90 s, mcp-allowlist 25 s.
- Runtime setup copy per state (`RuntimeSetupState.swift`, `RuntimeSetupWelcomeView.swift:20-66`) and the Settings → General runtime section (`GeneralSettingsView.swift:95-102`): checking, install required, update required, installing, updating, update failed, failed, ready.
- Update failed (`RuntimeSetupState.swift`): title "Update could not finish", body "The installed runtime was kept. Review the failure and retry when ready.", the failure message as status, action "Retry setup". The sidebar line is "Runtime setup required before creating or loading work."; the window title is "Harflow · Runtime setup". While an update is failed the app refuses every runtime call (`ManagedToolEnvironmentRepository.swift:72-77`, `SidebarView.swift:139-150`).
- The runtime is exactly pinned to the app version (`ManagedRuntimeInstaller.swift:177-186`), so a mismatch is fixed by updating the app.
- Title bar dot: green when the work listing has no error, red otherwise; its help text is the error message, or the connection line ("harflow-ctl not found", "harflow not readable", "harflow connected · <harnesses>", "connecting…").
- Task store: `state_recovery.py:220-257` returns `state-inspect` with a status of ready, missing, incompatible or interrupted, a reason and a message. `StoreRecoveryPresentation.swift:36-119` gives the titles "Task store is compatible", "Task store has not been created", "Task store needs attention", "Recovery was interrupted" and "Inspecting task store…", and the detail rows State root, Reason, Backup path, Recovery operation and Phase (`StoreRecoveryPanel.swift:18-22`). The sidebar header link "Task store needs attention" opens Settings → General (`SidebarView.swift:186-195`).
- Deep links (`Takeover.swift:76-92`, `AppCoordinator.swift:154-232`, `MainWindowCoordinator.swift:209-230`): `harflow://task/<id>`. While the runtime gate shows, the selection is set and the gate covers it. The app shows no text for it.

## Owner decisions applied

| Decision | Applied here |
| --- | --- |
| S2 | The Appearance group of Settings → General stays as drawn. It is a new group the app adds (the Mac General page has none today). No new drawing. |
| S4 | No "Check for updates" anywhere. The failed and update-required gates offer Retry or the managed install, never a separate update check. |
| S5 | No store backup, reset, resume or "Show backup in Finder". The task store states show status only. |
| O2 | First run keeps the implemented harness-runtime pane; `app-states/setup` is retired. |
| O3 | No qualification step in first run; it stays in Settings → Harnesses. |
| O4 | `harness-runtime/listing` also covers the first failure of the work listing after the runtime is ready; no new drawing. See the copy note below. |
| L2 | Only task links, `harflow://task/<id>`, are handled. |
| N2 | The legacy notifiers are removed. No drawing. |

## States

All routes support light and dark. The first seven rows also have a 1000 × 620 twin named `<route>-minimum` (self-rendered with the minimum window sidebar). The Settings states are in the Settings window, which has no minimum variants, so they are not drawn at the main window frames.

| State | Route | Status | Draws |
| --- | --- | --- | --- |
| Runtime · Update failed | `harness-runtime/update-failed` | Provisional | The gate "Update could not finish", the kept runtime body, the failure message and Retry setup. The sidebar shows the setup line. |
| Runtime · Task link held | `harness-runtime/deep-link-held` | Provisional | The install gate with the status line "After setup, Harflow opens the task you linked to." |
| Runtime does not match the app | `app-states/contract-refused` | Provisional | The gate with the refusal message and Retry. The `harflow-ctl` form of the message is design: the app prints "`harflow.ctl` answered …" today (see What the app would change). |
| Runtime missing a feature | `app-states/capability-missing` | Provisional | The gate with the "Incompatible Harflow runtime: missing required … (incompatible_runtime)" message and Retry. |
| Work could not be refreshed | `app-states/engine-call-failed` | Provisional | The Needs you screen of a working app: red title bar dot with its help text open, a note "Couldn't refresh your work" with Retry above the lists, the last known rows kept. |
| Work refresh timed out | `app-states/engine-call-timed-out` | Provisional | As above with "`harflow-ctl task-list-page` did not answer within 30 s." |
| Task store needs attention | `app-states/store-unusable` | Provisional | The sidebar link (the app's) and, in the main pane, a gate with the engine message, State root, Reason and Open Settings. **The main pane gate is design:** the app shows only the sidebar link (`SidebarView.swift:186-195`, `SidebarVM.swift:363-369`). |
| Runtime checking, install required, update required, installing, updating, update failed, setup failed | `settings/runtime-checking`, `runtime-install-required`, `runtime-update-required`, `runtime-installing`, `runtime-updating`, `runtime-update-failed`, `runtime-failed` | Provisional | General with only the Harflow runtime row swapped for the Mac title, detail and action; the task store row is disabled. Group "Harflow runtime". |
| Task store inspecting, not created, incompatible, recovery interrupted, inspection failed | `settings/store-inspecting`, `store-missing`, `store-incompatible`, `store-interrupted`, `store-inspect-failed` | Provisional | General with only the Task store section swapped: Mac title, the engine message, and the detail rows. Group "Task store". |

**Bases.** The five gates (`update-failed`, `deep-link-held`, `contract-refused`, `capability-missing`, `store-unusable`) keep the frame and the sidebar header and footer of the populated window, the template `new-task/default` from which the approved centered window `new-task/centered-empty` is drawn (its own route is retired, the template stays), and replace the main pane and, except for `store-unusable`, the sidebar body. `engine-call-failed` and `engine-call-timed-out` are the approved `needs-you/waiting` screen with the dot, its help text and the note added. `settings/runtime-*` and `settings/store-*` derive from the approved `settings/general` by exact swap of one section. Each derivation is by exact swap, so a changed base throws. No approved template changes.

## The missing-feature pattern

A feature that the runtime does not advertise is shown where it is needed, not as one global error. The pattern:

1. A contract version the app does not understand is the gate `app-states/contract-refused`; a feature the whole app needs (for example the events contract) is the gate `app-states/capability-missing`. Each has a title, the app's refusal text as status, and Retry.
2. A feature one screen needs is a plain sentence on that screen: "This Harflow runtime can't <do X>. Update Harflow to use it." It has no destructive action and keeps the rest of the screen usable. The approved `statistics/unsupported` and `resources/unsupported` draw the full-pane form of the same idea.
3. The sentence never names a command, a socket or a daemon, and never offers Start engine or a reinstall button.

Until the engine advertises `mcp-allowlist.v1` the app treats an unsupported-command answer as a missing feature, so the Harnesses and MCP approvals screens use form 2.

## Which path reaches which gate

| Where the failure happens | What the user sees |
| --- | --- |
| At install or update, the downloaded runtime is refused (contract, platform or feature) | `harness-runtime/failed` or `update-failed`, with the refusal as the status message. |
| After the runtime is ready, at the first work listing (`TaskListRepositoryImpl.swift:101`, contracts ctl and events) | `app-states/contract-refused` or `capability-missing`, depending on the refusal. |
| A later call returns an unreadable answer or times out | `app-states/engine-call-failed` or `engine-call-timed-out`: the app keeps working on the last known data. |
| The store inspection reports a status other than ready | `app-states/store-unusable` and the Settings store rows. |
| A task link arrives before the runtime is ready | `harness-runtime/deep-link-held`. |

## Task store reasons and messages

The engine's reason and message for each inspection result (`state_recovery.py:220-257`). The app shows the message verbatim.

| Status | Reason | Message |
| --- | --- | --- |
| ready | `compatible` | State is compatible |
| missing | `missing_root` | State root has not been initialized (inspection), or "Unsupported state root: selected root is missing; …" (ownership check) |
| incompatible | `unmarked_nonempty` | Unmarked state root contains data (inspection); "Unsupported state root: unmarked root is nonempty; …" (ownership check) |
| incompatible | `foreign_store` | Unsupported state root: foreign store marker; inspect state or select a fresh state root |
| incompatible | `unsupported_layout` | Unsupported state root: unsupported store layout; inspect state or select a fresh state root |
| incompatible | `newer_store` | Unsupported state root: incompatible store product line; inspect state or select a fresh state root (a newer store) |
| incompatible | `unsupported_source_line` | The same message for an older product line, and "Unsupported state root: store requires promotion; …" |
| incompatible | `invalid_marker` | Unsupported state root: <detail>; inspect state or select a fresh state root, with the detail "invalid store marker", "store marker is oversized", "store marker changed while opening", "<name> must be a regular file, not a symlink" or "invalid store product version" |
| incompatible | `infrastructure_unavailable` | The operating system or ownership error text |
| interrupted | `recovery_interrupted` | Explicit recovery must be resumed (inspection); "Unsupported state root: explicit state recovery is interrupted; …" (ownership check) |

Reasons and details are read from `state_ownership.py` (`_incompatible`, lines 54-121) and `state_recovery.py:220-257` at `6ef3c0c0`.

`store-unusable` draws `foreign_store` with its real detail; `store-incompatible` draws `unmarked_nonempty`. Whether the pinned runtime advertises `state-recovery.v1` is not drawn: it does, so a missing `state-recovery.v1` would show form 2 of the pattern inline in the store row.

## Recommendations

1. Use one gate box for every state that stops the app, so Retry sits in the same place as in the runtime states.
2. Keep the sidebar note of a failed refresh in the sidebar, above the lists, so the rows the user already has are never hidden by an error.
3. Quote the app's or the engine's message once, as the status line, and keep the title and body in design wording.

## Owner questions

1. A runtime update that failed in an already set-up app: the drawn form shows the sidebar setup line, which is what the app does today because it refuses every call. Should the populated sidebar stay usable instead (as `harness-runtime/updating` draws it)? That is an app change.
2. Contract and missing-feature gates offer Retry only. Should the app offer a reinstall action for the managed runtime? That is an app change; the runtime is pinned to the app version today.
3. Settings states are drawn at the Settings window size only. Should Settings also be drawn at 1000 × 620?
4. The approved ready row reads "Harflow runtime 0.9.3 is ready" with no detail. The app reads "Harflow runtime is ready" with the detail "MCP registrations are managed separately in Harnesses." and its versions are 0.0.x. Amend the ready row to the app's copy?
5. The app says "engine" in the Settings runtime detail ("Installed engine 0.0.7. This app requires engine 0.0.8."); the glossary says runtime and the drawings say runtime. Change the app copy?
6. Refusals show "<message> (<code>)" in the app, for example "(incompatible_runtime)". Drop the code from the text?
7. Approve `app-states/engine-call-failed` and `contract-refused` as the replacement of `app-states/engine-error` (below)?
8. Should the main pane be gated at all when the task store is unusable? The app shows only the sidebar link and leaves the rest of the window as it is; the drawn gate is design.

## What the app would change

- `app-states/contract-refused`: print the tool as `harflow-ctl` and the version list the app really understands. Today `WireContracts.swift:156` passes the contract name, and `understoodVersions` (`CtlModels.swift:310-319`) falls back to the event log version, so the message reads "`harflow.ctl` answered with contract version 2; this app understands version 1. …" for a ctl refusal. Fix both.
- `app-states/capability-missing` and every screen form: replace the legacy banner "harflow is incomplete or out of date" and its GitHub and uv dialog (`InstallCommands.swift:99-120`, `MenuBarVM.swift:455-540`, `HarnessesVM.swift:337-392`) and the `toolDirectory` wording with the gate and the plain sentence.
- `app-states/engine-call-failed` and `engine-call-timed-out`: add the sidebar note with Retry; today the failure is only the title bar dot and its help text.
- `harness-runtime/update-failed`: none for the drawn form; the question above lists the alternative.
- `app-states/store-unusable`: if the owner approves the main pane gate, add it; the app has only the sidebar link today (`SidebarView.swift:186-195`, `SidebarVM.swift:363-369`).
- The Settings store states: hide backup, reset, resume and "Show backup in Finder" until the engine's recovery is released (S5).
- `harness-runtime/deep-link-held`: add the status line; unknown or invalid ids stay ignored and only task links are handled (L2).
- Settings: add the Appearance group (S2) and remove "Check for updates" (S4).

## Engine needs

- `mcp-allowlist.v1`, a capability the engine would advertise for the global MCP approvals commands, in the batched 0.0.15 contract. Until then the app treats an unsupported command as a missing feature.
- No other engine change. The runtime already advertises `backend-qualification.v1`, `interaction-events.v1`, `state-recovery.v1` and `messaging.v1`.

## Copy note on the first listing (O4)

The approved `harness-runtime/listing` state reads "Your runtime is ready. Recent work could not be loaded." with the action "Retry loading work". The app's `InitialWorkLoadingView` (`MWF/Coordinator/InitialWorkLoadingView.swift:15-21`) uses the same title "Runtime ready", the same body and the same action, and shows the failure message as the status line (the accepted deviation of 2026-11-14). The two copies agree, so the decision confirms that this one state covers the first failure of the work listing after the runtime is ready; no new drawing and no app copy change.

## Decisions recorded without a drawing

S2 (the app adds the Appearance group to Settings → General), S9 (the agent ordering simplification of the migration ledger, line 98, is accepted), O3 (no qualification step in first run), L2 (task links only), N2 (the legacy notifiers are removed) and the legacy debt removals (`toolDirectory`; the mock-era "harflow is incomplete or out of date" banner and its GitHub and uv dialog, replaced by the missing-feature gate).

## Retiring `app-states/engine-error`

`app-states/engine-error` (Engine not running) is mock-era: it draws a Start engine action for a daemon the app does not run. It is not retired by this record. On the owner's approval of `app-states/contract-refused` and `engine-call-failed`, its route would open `app-states/contract-refused` or `engine-call-failed` and be recorded under Retired designs.

## Evidence and limits

- Read through git objects only: no Mac or engine tree was built or run. Copy quoted from the Mac or the engine is named in each guide; versions, paths, ids and failure details are fixture text.
- Not verified in a native build: the sidebar setup line and gate geometry at 1000 × 620, the tooltip placement of the title bar dot and the Settings rows. The drawings are browser approximations.
- The sidebar link of `store-unusable` sits in the first row of the navigation here; the app draws it in the sidebar header, under the title row (`SidebarView.swift:186-195`). The placement is a browser approximation.
- With an incompatible store the work listing likely fails too, so the populated rows and the lists in `store-unusable` are an assumption, not Mac evidence.
- The wording marked as design wording (titles and bodies of the gates, the sidebar note, "Open Settings", the held task link line, the disabled store row) has no source in the app.

## Files

`v2/scripts/states-engine-runtime.js`, `v2/styles/engine-runtime.css`, `v2/index.html`, `tests/engine-runtime.test.mjs`, `tests/minimum-frame.test.mjs`, `tests/v2.test.mjs`.
