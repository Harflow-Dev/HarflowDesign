# Harness settings states

Status: **Approved by the owner on 2026-11-23** ("approve with your pick", relayed by the coordinator), approved in the commit titled "Approve the harness settings and menu bar states". The states were drawn on 2026-11-23 in `76a680d` on the owner's decisions of the same day (O3 and N2) relayed by the coordinator, from the Mac inventory items S6 (harness registration), S7 (global MCP approvals) and S8 (harness qualification), and on the engine and runtime pattern of [engine-and-runtime.md](engine-and-runtime.md). The approval covers the design of the 19 routes below and amends two approved pages, `settings/harnesses` and `settings/mcp-approvals` (owner answers 1, 3 and 5); it does not establish native pixel fidelity or implementation, which stays open. The amendments are recorded under [Owner decisions of 2026-11-23](README.md#owner-decisions-of-2026-11-23) and [Amendments after approval](approval.md#amendments-after-approval).

The states draw what Settings → Harnesses shows when the runtime is not ready, a registration fails or is refused, no harness exists, a harness qualifies in each state the app has, and each state of the global MCP approvals panel the approved page does not show.

## Source

HarflowMac at `27b722aa` and HarflowMCP at `6ef3c0c0`, read through git objects only. `S` is `macos/HfFeatures/SettingsFeature/Sources/SettingsFeature`.

- Registration (`S/Harnesses/HarnessesView.swift:67-110`, `HarnessesVM.swift`): header "Where harflow is registered as an MCP server", the server path line, Refresh. Each row already draws the setup row's own `error` in red, its `notes` and a "last: <action>" chip (`HarnessRowView.swift:57-61`). Only a tool failure of the load or of the action itself shows as one red line above the list, with no Retry (`HarnessesVM.swift:294-323`); the Refresh button is disabled only while loading or while an action runs (`HarnessesVM.swift:120`). Row labels from the setup document: "Installed · out of date", "Installed", "Not installed", "Not found on this Mac", "Unknown"; a row carries `error` and `notes`. The runtime not ready shows nothing, and an empty list draws blank.
- Confirmations (`HarnessesVM.swift:176-190`): "Install harflow into <name>?" or "Update harflow in <name>?", and "Remove harflow from <name>?", each with "This runs harflow-setup, which edits <name>'s own configuration." and the buttons Install, Update or Remove.
- Setup refusals: "Incompatible Harflow runtime: <detail> (incompatible_runtime)" (`WireContracts.swift:147-229`), for example "unsupported harflow.setup format". Error documents carry the codes `usage` and `setup_error` (`SetupClient.swift:73`). A refusal renders as "<message> (<code>)" (`CtlModels.swift:367-370`).
- Qualification (`HfUI/.../HarnessQualificationModel.swift:29-52`, `S/QualificationPresentation.swift:60-230`, `HarnessesVM.swift:60-103`): states Not checked, Qualifying, Ready, Failed, Failed at runtime, Harness unavailable, Unsupported engine, Cancelled and Binary changed, with the actions Check harness, Cancel check, Check again and Retry qualification. Messages: "Check the required harness features before running.", "Checking required features…", "Required features are ready.", "Required feature evidence is unavailable. Check this harness explicitly.", "Check cancelled. Late results will not enable launch.", "The request changed. Fresh qualification evidence is required.", "Harness qualification is unavailable in the selected engine. A supporting managed runtime is required." Feature rows read "<Ready|Failed|Unavailable> · <source>" with the engine reason; the cancelling note is "Cancelling stops waiting for this check. The engine may still finish it." Discovery failure (`HarnessesViewRepository.swift:26`): an unreadable-answer error for `harflow-ctl backends` with the stderr text "Harness qualification discovery is unavailable. Refresh to retry."
- MCP approvals (`S/Harnesses/MCPAllowlistView.swift:34-80`, `MCPAllowlistVM.swift`): "Global tool approvals apply across projects and future tasks.", the config path, the engine's detail line, a red error line, the entries with Remove, the help text, the field, Add approval and Refresh. Dialogs: "Allow <value> globally?" with "This lets <title> call this MCP tool across projects and future tasks. A tool name of * allows every tool on that server. Other harness policies still apply." (Vibe: "This approves only the named tool." in place of the sentence about *) and "Allow globally"; "Remove global approval for <value>?" with "This removes the explicit approval from <title>'s global configuration. Other permission rules remain unchanged." and "Remove approval". Vibe help: "Vibe supports exact tool names only; server wildcards are unavailable." The app disables Add approval when a Vibe entry contains `*` (`MCPAllowlistVM.swift:61-63, :66-69`). The error line shows the tool error's message, which for an engine refusal is "<message> (<code>)".
- Engine (`ctl.py:2308-2321`, `mcp_allowlist.py:28-51`, `backends/mcp_approval.py`): `mcp-allowlist` returns `{backend, supported, config_path, entries, detail}`. The read detail is the harness prefix and "Global rules apply to future sessions. Harness deny rules and project overrides still apply." Errors: `allowlist_error` with "Harness configuration changed; reload and try again" (`mcp_allowlist.py:47`), "Refusing to edit symlinked harness configuration or backup" (`:40`) and for Vibe "Vibe requires individual tool names; add server/tool entries" (`mcp_approval.py:203`); `human_only` with "Only a verified human may change global MCP approval rules: <reason>" (`ctl.py:2316`), where the reason names the caller (for example "it was called from task <id> (detected by <method>)", `takeover.py:94-98`). Unsupported harnesses answer `supported: false` with a reason, for Cursor "Cursor MCP approvals are per project directory and are not edited by Harflow." (`mcp_approval.py:270`). The engine advertises no allowlist feature.

## States

All routes are in Settings → Harnesses (family `settings`), light and dark, approved 2026-11-23. Settings is its own window, so none is drawn at the main window frames (owner answer 4). Each is derived from the amended `settings/harnesses` or `settings/mcp-approvals` by exact swap of the blocks it changes; the module rebuilds the approved list and panel and throws if a rebuild differs from the amended page. The inline panel of the approved page is kept: no sheet.

| State | Route | Group | Status | Draws |
| --- | --- | --- | --- | --- |
| Harnesses · Runtime not ready | `settings/harnesses-runtime-not-ready` | Harness registration | Approved 2026-11-23 | Refresh disabled (a design choice: the app disables it only while loading or while an action runs); the list and qualification give way to a note and Open setup (both design wording; the app shows nothing). |
| Harnesses · Registration failed | `settings/harnesses-registration-failed` | Harness registration | Approved 2026-11-23 | The acted row (Codex) shows the error, its code `setup_error` on a detail line, and its note, with Retry on the row (owner answer 2, an app change: the app has a page-level line and no Retry). Error text and note are fixture text. |
| Harnesses · None found | `settings/harnesses-empty` | Harness registration | Approved 2026-11-23 | "No harnesses found on this Mac." and "Install a supported harness, then refresh." (design; the app draws a blank list). The approved qualification section stays: it comes from `harflow-ctl backends`, which does not depend on the setup tool. |
| Harnesses · Setup refused | `settings/harnesses-setup-refused` | Harness registration | Approved 2026-11-23 | The refusal "Incompatible Harflow runtime: unsupported harflow.setup format" (the app's message; the format name is fixture text), the code `incompatible_runtime` on a detail line, and Retry (design). No rows, no server path; the approved qualification section stays. |
| Harnesses · Remove confirmation | `settings/harnesses-remove-confirm` | Harness registration | Approved 2026-11-23 | The Mac confirmation, verbatim, over the page. Install and update confirmations have the same shape; only this one is drawn. |
| Qualification · Mixed results | `settings/qualification-mixed` | Harness qualification | Approved 2026-11-23 | Claude Code Ready, Codex Failed with two feature rows ("Failed · failed", each with its engine reason) and Retry qualification, Vibe Qualifying with Cancel check and the cancelling note; Opencode "No native qualification for this harness" (design) and Antigravity as approved. The approved page's rows say the same for Opencode (owner answer 1). |
| Qualification · Not checked | `settings/qualification-not-checked` | Harness qualification | Approved 2026-11-23 | The three harnesses Not checked, each with Check harness. |
| Qualification · Cancelled and changed | `settings/qualification-cancelled` | Harness qualification | Approved 2026-11-23 | Cancelled, Binary changed and Failed at runtime, each with its action. |
| Qualification · Unsupported runtime | `settings/qualification-unsupported` | Harness qualification | Approved 2026-11-23 | The three cards "Unsupported runtime" with the app's message (wording changed, see Owner answers) and no action. |
| Qualification · Discovery failed | `settings/qualification-discovery-failed` | Harness qualification | Approved 2026-11-23 | One failed card "Harness discovery" with the unreadable-answer message and Retry qualification. |
| MCP approvals · No approvals | `settings/mcp-approvals-empty` | MCP approvals | Approved 2026-11-23 | The open panel with "No global approvals yet." (design) and the field. |
| MCP approvals · Add confirmation | `settings/mcp-approvals-add-confirm` | MCP approvals | Approved 2026-11-23 | "Allow github/* globally?" over the panel with the typed value. |
| MCP approvals · Remove confirmation | `settings/mcp-approvals-remove-confirm` | MCP approvals | Approved 2026-11-23 | "Remove global approval for linear/get_issue?" over the panel. |
| MCP approvals · Change refused | `settings/mcp-approvals-write-refused` | MCP approvals | Approved 2026-11-23 | "Harness configuration changed; reload and try again", the code `allowlist_error` on a detail line; entries kept, the typed value kept, the config path, detail line and Refresh of the amended panel. |
| MCP approvals · Vibe | `settings/mcp-approvals-vibe` | MCP approvals | Approved 2026-11-23 | The Vibe panel: its detail line and help text, a typed `github/*`, Add approval disabled. |
| MCP approvals · Unsupported harness | `settings/mcp-approvals-unsupported` | MCP approvals | Approved 2026-11-23 | A Cursor row (fixture only, owner answer 6: the page lists the rows the engine reports and the approved page lists none) with the engine's reason; field, Add approval and Remove disabled. |
| MCP approvals · Read failed | `settings/mcp-approvals-read-failed` | MCP approvals | Approved 2026-11-23 | The failed command (fixture exit code), an empty list, the field disabled, Refresh. |
| MCP approvals · Runtime missing a feature | `settings/mcp-approvals-capability-missing` | MCP approvals | Approved 2026-11-23 | The sentence "This Harflow runtime can't edit global MCP approvals. Update Harflow to use it." (design, approved with owner answer 7), field disabled. It follows the missing-feature pattern of [engine-and-runtime.md](engine-and-runtime.md#the-missing-feature-pattern), approved on 2026-11-23. |
| MCP approvals · Human only | `settings/mcp-approvals-human-only` | MCP approvals | Approved 2026-11-23 | "Only a verified human may change global MCP approval rules: it was called from task 4f2a91c0 (detected by lineage)", the code `human_only` on a detail line (task id and method are fixture text). |

## Refusals

A refusal shows its message in the main text and its code on a detail line labelled "Code", as the approved `app-states/capability-missing` draws it. This follows the owner's answer 6 of [engine-and-runtime.md](engine-and-runtime.md) (drop the code from the main message text and keep it on a detail line), which the owner applied to these states with this approval on 2026-11-23. The app prints "<message> (<code>)" today (`CtlModels.swift:367-370`), so the change is an app change. The codes are shown, not dropped: `incompatible_runtime`, `setup_error`, `allowlist_error` and `human_only`, each as the "Code" row of `harnesses-setup-refused`, `harnesses-registration-failed`, `mcp-approvals-write-refused` and `mcp-approvals-human-only`.

## The Vibe wildcard

The engine refuses a Vibe wildcard with "Vibe requires individual tool names; add server/tool entries (allowlist_error)". The app never sends it: it disables Add approval for a Vibe entry with `*` and shows the help text instead (`MCPAllowlistVM.swift:61-63, :66-69`). The state draws the app's behaviour. The engine refusal is recorded here, not drawn, because showing it would draw a path the app does not take.

## Qualification and G-HARNESS

Native qualification targets Claude Code, Codex and Vibe only (migration ledger, G-HARNESS); other harnesses carry no native qualification claim. The qualification states therefore show cards for those three and "No native qualification for this harness" for Opencode, with no check action.

**Amended approved page.** The approved `settings/harnesses` showed Opencode as "Ready" and a Codex row "Codex needs sign-in: run codex login, then refresh." Neither the engine nor the app models either: the engine reports qualification for the three harnesses only, and neither side has a sign-in state. On the owner's answer 1 of 2026-11-23 the qualification rows of the approved page are amended to match G-HARNESS and the engine: Claude Code, Codex and Mistral Vibe read Ready (the approved populated example), Opencode reads "No native qualification for this harness" with no action, and Antigravity keeps its not-found row. There is no sign-in state. The approved `settings/mcp-approvals` shares the page and follows; `settings/loading-harnesses` and `settings/loading-mcp-approvals` need no change because their qualification rows are placeholders without text.

Qualification words (Ready, Failed, Qualifying, Not checked and the others) are harness-check labels, outside the task status set. Qualifying and Not checked therefore draw no glyph, and the title text carries the state; the other states use the canonical glyphs: done for Ready, failed for Failed, Failed at runtime and the discovery card, and cancelled with the stop icon for a cancelled check (the approved Settings rows use the cancelled glyph with an x for a harness not found). Every state also has its title text, so colour is never the only signal.

The feature result form is "<Ready|Failed|Unavailable> · <source>" (`QualificationPresentation.swift:164-167`). A card shows Failed only when a feature's source is `failed` (`:143-146`), and the engine sends the two reasons with `source: "failed"` (`qualification.py:408`, `:446`), so the Codex rows read "Failed · failed".

The cards show the Mac card's states and actions (Check harness, Cancel check, Check again, Retry qualification). The Mac's page-level labels "Check required harnesses" and "Retry required harnesses" apply only to a request with several requirement rows and are not used in Settings.

## Recommendations

1. Put a failed registration on its row with a Retry, so the user sees which harness failed and can try again without scanning the page.
2. Keep the config path, the engine's detail line and Refresh of the approvals sheet available in the inline panel (the owner chose to draw them in the approved panel, answer 3).
3. Say plainly when a harness has no native qualification, instead of showing a state the engine does not report.

## Owner answers (2026-11-23)

The owner approved all 19 states on 2026-11-23 with these answers ("approve with your pick", relayed by the coordinator). They are numbered as the owner questions of the drawing were.

1. **The approved qualification rows are amended** to match G-HARNESS and the engine, with no "needs sign-in": Claude Code, Codex and Mistral Vibe are drawn Ready, Opencode shows "No native qualification for this harness" with no action, Antigravity keeps its not-found row. `settings/harnesses` and `settings/mcp-approvals` (which shares the page) are amended; the loading skeletons follow without a change. Recorded under [Owner decisions of 2026-11-23](README.md#owner-decisions-of-2026-11-23) and [Amendments after approval](approval.md#amendments-after-approval).
2. **A tool failure of a registration action moves onto the row it acted on, with Retry.** An app change; the row's own error, notes and "last:" chip are already drawn.
3. **The inline panel shows the config path, the engine's detail line and Refresh.** The approved `settings/mcp-approvals` panel is amended to draw them with the fixture config path `~/.claude/settings.json` and the engine's read detail for Claude Code, "Global rules apply to future sessions. Harness deny rules and project overrides still apply."; the forms of the states are the same panel. A state with no engine answer (`mcp-approvals-read-failed`, `mcp-approvals-capability-missing`) shows neither the path nor the detail and keeps Refresh.
4. **No 1000 × 620 drawings.** Settings is its own window.
5. **The placeholder reads "server/tool or server/*"** in the approved `settings/mcp-approvals` panel. Vibe keeps "server/tool", as the app does (`mcp-approvals-vibe`).
6. **Only rows the engine reports.** The page lists no Cursor row; the Cursor row of `mcp-approvals-unsupported` is fixture only, there to draw the unsupported answer.
7. **The missing-feature sentence is approved** for MCP approvals ("This Harflow runtime can't edit global MCP approvals. Update Harflow to use it."), with the pattern of the engine and runtime record.

Wording (follows engine and runtime answer 5): `qualification-unsupported` reads "Harness qualification is unavailable in this Harflow runtime. A supporting managed runtime is required." The app's current string is "Harness qualification is unavailable in the selected engine. A supporting managed runtime is required." The same answer changes the card title from the app's "Unsupported engine" to "Unsupported runtime" and the cancelling note from the app's "Cancelling stops waiting for this check. The engine may still finish it." to "Cancelling stops waiting for this check. The runtime may still finish it." Descriptions of the catalog entries say runtime where they said engine.

Refusal codes (follows engine and runtime answer 6): the four refusals of this record move the code from the main text to a "Code" detail line; see [Refusals](#refusals).

## What the app would change

- Row-level failure and Retry: move a tool failure of the action from the page-level line onto the row it acted on, and add a Retry there (`HarnessesVM.swift:294-323`), with its code on a detail line. The row's own error, notes and "last:" chip are already drawn (`HarnessRowView.swift:57-61`).
- Empty state: draw "No harnesses found on this Mac." and its second line instead of a blank list.
- Setup-refused UI: show the refusal with a Retry and hide the rows; drop the legacy "harflow is incomplete or out of date" banner (`HarnessesVM.swift:373`).
- Runtime not ready: draw the note and Open setup instead of nothing.
- Wording: replace the app's "Harness qualification is unavailable in the selected engine. A supporting managed runtime is required." with "Harness qualification is unavailable in this Harflow runtime. A supporting managed runtime is required.", "Unsupported engine" with "Unsupported runtime" and "The engine may still finish it." with "The runtime may still finish it." (engine and runtime answer 5).
- Refusals: print the message without its code and show the code on a detail line, wherever the app prints "<message> (<code>)" (`CtlModels.swift:367-370`; owner answer 6 of the engine and runtime states).
- Allowlist capability gate: when the engine advertises no allowlist feature, show the one-sentence missing-feature form instead of the unsupported-command message "The installed `harflow-ctl` has no `mcp-allowlist` command — it predates this app. Use a compatible managed Harflow runtime."
- Qualification: draw no check action and "No native qualification for this harness" for harnesses outside Claude Code, Codex and Vibe; the page has no sign-in state.
- Allowlist panel: draw the inline panel of the approved page instead of the sheet, with the config path, the engine's detail line and Refresh, and the placeholder "server/tool or server/*" (exact "server/tool" for Vibe).

## Engine needs

- `mcp-allowlist.v1`, a feature the engine would advertise for the global MCP approvals commands, in the batched 0.0.15 contract. Until then the app treats an unsupported-command answer as a missing feature. The allowlist read and edit commands, `supported: false` and the refusal codes already exist.
- No other engine change.

## Evidence and limits

- Read through git objects only. Mac and engine strings are quoted with citations above; wording marked design or fixture is not from either.
- Feature names (`live_input`, `approval_requests`), versions, config paths, the error text of the failed registration, the Cursor row and the task id of the human-only refusal are fixture text.
- Not verified in a native build: the card layout (the Mac draws a card per harness; the page draws compact rows), the dialogs' Cancel button, and the placement of Retry on a row.

## Files

`v2/scripts/states-harness-settings.js`, `v2/styles/harness-settings.css`, `v2/index.html`, `tests/harness-settings.test.mjs`, `tests/minimum-frame.test.mjs`, `tests/skeleton.test.mjs`, and, for the amendment of the approved pages, `v2/scripts/screens-settings.js`.
