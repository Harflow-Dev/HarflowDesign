# Migration coverage and intent ledger

Current direction (2026-11-04): native HarflowMac redesign and Rust in parallel
after accepted shared readiness, converging at native/Rust integration, later full
HarflowWeb frontend/server, native Windows long after accepted Web stability.
[Revision 3](../../../HARFLOW_MIGRATION_PLAN_V3.md) governs. HarflowClient and
HarflowDesktop are retired target components, not build dependencies. Existing
capability approval/Proposed/Undecided statuses and historical receipts stay unchanged.
M01/M01-Gxx reconcile native adaptations before dependent implementation; Linux has
no desktop design requirement. Old Sxx references identify historical planning only.

This is a planning ledger, not a receipt or authorization to implement. The owner approved the v2 redesign on 2026-11-03, including two subsequent amendments: the HarflowMac connector style ([commit 3643d083700be4032c93237813b573d04bab6ab1](https://github.com/Harflow-Dev/HarflowDesign/tree/3643d083700be4032c93237813b573d04bab6ab1/v2)) and the Edit with agent right-side builder pane ([commit 34c3b0576e221d17b1096136db6c5d0fbb4c5000](https://github.com/Harflow-Dev/HarflowDesign/tree/34c3b0576e221d17b1096136db6c5d0fbb4c5000/v2), approval confirmed by the owner in S03). The [approval record](decisions/approval.md), [screen inventory](screen-inventory.md) and [terminology](terminology.md) describe the approved material. Its 30 product states and component states are approved visual references, not proof that every required state or runtime capability exists. The archived v1 catalog (`archive/v1/`, formerly the root) remains a legacy reference; do not automatically copy it or revert v2.

Cite the exact design commit, path and state for each implementation: the commit that last changed the cited file. `v2/scripts/screens-workflow-editor.js` state `workflow-editor/edit-with-agent` cites `34c3b05`; other v2 families cite `3643d08` until a later approved change. Themes are available through `/light` and `/dark`; exact individual state routes are enumerated in the inventory.

| Family | Route | Source |
| --- | --- | --- |
| New task | `new-task/*` | `v2/scripts/screens-new-task.js` |
| Needs you | `needs-you/*` | `v2/scripts/screens-needs-you.js` |
| Workflows | `workflows/*` | `v2/scripts/screens-workflows.js` |
| Workflow editor | `workflow-editor/*` | `v2/scripts/screens-workflow-editor.js` |
| Task | `task/*` | `v2/scripts/screens-task.js` |
| Parallel group | `parallel-group/*` | `v2/scripts/screens-parallel-group.js` |
| Workflow run | `workflow-run/*` | `v2/scripts/screens-workflow-run.js` |
| Resources | `resources/*` | `v2/scripts/screens-resources.js` |
| Statistics | `statistics/*` | `v2/scripts/screens-statistics.js` |
| Settings | `settings/*` | `v2/scripts/screens-settings.js` |
| Menu bar | `menu-bar/*` | `v2/scripts/screens-menu-bar.js` |
| App states | `app-states/*` | `v2/scripts/screens-app-states.js` |
| Components and tokens | `components/*` | `v2/scripts/components.js`, `v2/styles/` |

## Principles

The owner directed a simpler v2 redesign, now applied to the native Mac app rather than an Electron replacement; it does not automatically reproduce every old app feature. Core execution safety and observability remain required. UI removal does not delete engine APIs or historical data. Visual approval does not authorize expanded authority, public contract changes, new backends or deferred features. Undecided functionality is neither silently dropped nor restored.

## Capability disposition ledger (S03)

Recorded by [S03](../../../HarflowMCP/docs/migration-receipts/S03.md) against HarflowMac `7e78cb5fade2d1dc0480be0434bbf20bb5be1d10` (legacy behavior evidence) and HarflowMCP `10654cb20a0ec6dea4292916c750203656af210e`. Status **Accepted** means an owner decision exists (dated plan decision, v2 approval or an S03 answer). **Proposed** means the S03 lead's classification derived from those decisions; it becomes accepted with the S03 receipt. "Gap" names the design or contract follow-up in the register below.

### Keep

| Capability | Status | v2 reference / gap |
| --- | --- | --- |
| Start task: repository, harness and model, access level, prompt | Accepted | `new-task/default` (retired; now opens `new-task/centered-empty`), `new-task/harness-menu` (retired; now opens `new-task/centered-harness-open`) |
| Harness menu lists every harness the selected engine reports and qualifies, gated by its capability cells | Accepted (S03) | `new-task/harness-menu` (retired; now opens `new-task/centered-harness-open`, the centered composer's own harness picker open, with the fixtures of the closed centered states); Rust v1 backend scope is unchanged (below) |
| Reasoning effort, turn limit and caller approvals where the backend supports them | Accepted (visual direction); fixtures open | The task options popover, approved 2026-11-05, and its centered redraw, approved 2026-11-08: `new-task/centered-options`, `new-task/centered-options-closed`. The caller-approvals fixture is mock capability data and must still be checked against the real engine capability (`decisions/m04-proposal.md:14`); gap G-NEWTASK-ADVANCED |
| Permission/enforcement preview before start | Accepted (visual direction); fixtures open | Shown in the same task options popover: `new-task/centered-options`, `new-task/centered-options-closed`. The enforcement fixtures must still be checked against the real engine capability (`decisions/m04-proposal.md:14`); safety observability; gap G-NEWTASK-ADVANCED |
| Running and Recent work with older-history paging | Accepted | `new-task/default` (retired; now opens `new-task/centered-empty`); paging gap G-HISTORY |
| Task transcript, tool calls, live state, follow-up composer, Continue for a settled task | Accepted | `task/running` (retired; now opens `task/running-stop`), `task/done` (retired; now opens `task/changes-single`) |
| Queued messages, Send now, cancel queued message | Accepted | Gap G-QUEUE; provisional drafts `task/message-*` (not approved) |
| Cancel task (top bar overflow) | Accepted | `task/running` (retired; now opens `task/running-stop`); gap G-TASK-STATES |
| Right pane: Changes, Artifacts, Events | Accepted | `task/done` (retired; now opens `task/changes-single`); diff gap G-DIFF |
| Copy resume command and copy task ID (overflow menu) | Accepted (S03) | Gap G-OVERFLOW |
| Approvals and questions answered inline in transcript, Needs you and menu bar | Accepted | `task/approval`, `needs-you/*`, `menu-bar/busy`; gaps G-APPROVAL-STATES, G-APPROVAL-WORDING; provisional drafts `task/approval-*`, `needs-you/approval-*`, `menu-bar/approval-stale` (not approved) |
| Workflow recovery checkpoints in Needs you | Accepted | `needs-you/waiting`, `workflow-run/recovery` |
| Desktop notifications on finish and on Needs you, with their settings | Accepted | `settings/general`; gap G-PLATFORM |
| Menu bar or tray popover | Accepted | `menu-bar/*` |
| Deep link to a task, single instance | Accepted | No visual state; M11 |
| Workflows list, Run workflow with Task, Goal, repository and orchestrator override | Accepted | `workflows/list`, `workflows/run`, `workflows/empty` |
| Workflow editor: canvas, node types (agent roles, child workflow, parallel start/end, on-demand), connections and conditions, inspector, orchestrator settings and limits, fallback harnesses, undo/redo, copy/paste | Accepted | `workflow-editor/node-selected`, `workflow-editor/orchestrator`; gap G-EDITOR |
| Edit with agent | Accepted | `workflow-editor/edit-with-agent` at `34c3b05` |
| Generate a workflow with the builder agent | Accepted (S03) | Gap G-GENERATE |
| Delete a workflow, with confirmation (native: editor More actions) | Accepted (S03) | Gap G-WORKFLOW-MENU |
| Workflow run graph and parallel view, node and on-demand inspection, pause, resume, cancel, recover | Accepted | `workflow-run/*` |
| Workflow node/orchestrator messages and revise goal | Accepted (owner, 2026-11-08) | Kept, consistent with full parity including steering; gap G-RUN-ACTIONS stays open (nothing drawn yet) |
| Parallel group lanes, per-lane composer, Cancel all | Accepted | `parallel-group/lanes` |
| Resource slots observation | Accepted | `resources/slots`; gap G-RESOURCES |
| Statistics overview with range selector | Accepted | `statistics/overview`; gap G-STATS |
| Settings: appearance, behaviour, runtime, task store status | Accepted | `settings/general` |
| Harness MCP registration install/update/remove and qualification | Accepted | `settings/harnesses` |
| Global MCP approvals (existing human-only `mcp-allowlist`) | Accepted | `settings/mcp-approvals`; gap G-ALLOWLIST |
| First run, runtime install/update, loading, engine unavailable | Accepted | `app-states/*`; gap G-TRANSPORT |
| Appearance System/Light/Dark in sidebar footer and rail | Accepted | Components; `new-task/sidebar-collapsed` (retired; now opens `sidebar/centered-collapsed`) |
| Keyboard, focus, Reduce Motion, accessibility, narrow windows | Accepted | Gap G-ADAPTIVE |
| Truthful enforcement, unknown and failure states | Accepted | Required on whichever surface displays the task; not a panel requirement |
| Terminal takeover entry (human-only and ctl-only on the engine) | Accepted (owner, 2026-11-07) | `m05-proposal/overflow-running`, `m05-proposal/takeover-dialog` (now `task/overflow-running`, `task/takeover-dialog`); moved back into v1 from D12 |
| Builder-session "Always allow Harflow tools" shortcut | Accepted (owner, 2026-11-07) | Retained; no longer proposed for removal |
| First-load skeleton for each screen with a first load | Accepted (owner, 2026-11-08) | the `*/loading` routes (see [decisions, Loading states](decisions/README.md#loading-states)); Mac differences recorded there |

### Simplify

| Capability | Status | Treatment |
| --- | --- | --- |
| Sidebar sections Running/Today/Earlier and nested conversation trees | Accepted | Flat Running and Recent work rows |
| Task-level Summary and Prompt tabs | Accepted | Prompt is the expandable Original request disclosure at the start of the transcript, per D2B and the owner's 2026-11-07 decision; summary in the transcript: `task/done` (retired; now opens `task/changes-single`) |
| Raw events sheet | Accepted | Replaced by the approved Events right-pane tab: `task/events-populated`, `events-page`, `events-page-error`, `events-not-started`, `events-loading`, `events-empty`, `events-error`, and the Events-open state of the eight `task/transcript-*` routes (`decisions/m05-task-screen-approval.md:56`, `decisions/README.md:68`) |
| Registered artifacts | Accepted | Artifacts right-pane tab |
| Parallel groups in the sidebar | Accepted | One flat row with the parallel icon; created only through MCP |
| Workflow definitions in the sidebar with run status | Accepted | Workflows list without run status; runs only in Running and Recent work |
| Separate approval popups and sheets | Accepted | Inline only |
| Run diagnostics (decision attempts, context delivery, retry metadata) | Proposed | Show only what the approved run states show; recovery truth stays |
| Slot administration (enable, configure, service, resolve, repair, release) | Proposed | Observation only in the client; administration stays in ctl/MCP |
| New-session agent usage ordering (`agentUsage.v1`) | Proposed | Choices remembered per repository (v2 composer); usage counts are not transferred |
| Settings window tabs | Accepted | `settings/general`, `settings/harnesses`, `settings/mcp-approvals` |

### Deliberately remove (client only; engine APIs remain)

| Capability | Status | Note |
| --- | --- | --- |
| Product search and sidebar harness filter | Accepted | Design-catalog navigation and the Statistics range selector are unaffected |
| Former task Activity/Summary/Prompt tabs | Accepted | Right-pane tabs remain |
| Council | Accepted | Never shown; also absent from native source |
| Task inspector panel and its Technical info section | Accepted (S03) | Enforcement truth stays required elsewhere (Keep row above) |
| Duplicate a workflow (native: editor More actions) | Accepted (S03) | Users copy a definition outside the client if needed; engine operations are unchanged |
| Exploratory-only legacy proposals never shipped natively: starring (#7), sidebar context menus and delete (#8), task and workflow rename (#4; native has no rename of a saved workflow), standalone node reordering (#1), workflow setup/teardown (#21), readiness (MCP#18), store-recovery proposal states (#12), header appearance control (#6) | Proposed | Not in the native baseline; tickets stay open and unchanged as post-v1 backlog |

### Deferred (accepted plan D12; not shown in the v1 client)

Webhook notifications and subscriptions; limit-hit projections; `auto_continue`, `group_report_output`, `extra_writable_paths`; Codex app-server caller approvals; workflow `migrate`; legacy `PB_*` variables. Python keeps these engine operations. The owner may move any item back into v1. The owner moved terminal takeover back on 2026-11-07 (Keep, above).

### Undecided

| Item | Owner of the next decision |
| --- | --- |
| Task store recovery actions (inspect, backup and reset) beyond status display, given Rust's fresh store | Deferred (owner, 2026-11-08) until the Rust store design (R01) settles; then affected native settings slice |
| Worktree and scratch observation in the client (engine features retained; no v2 surface) | Accepted (owner, 2026-11-08) as read-only observation, with no create or delete |

## Gap register

For a required retained or approved simplified feature, create missing states in HarflowDesign v2, obtain explicit owner approval and record exact commit/path/state before dependent implementation. Use bounded M01-G01 and subsequent sub-sessions as needed, with the feature owner and relevant contract owner. An unresolved required state blocks its dependent feature, not independent work. Contract gaps require an independently approved public contract or an owner-approved limited presentation; never invent an API or broaden permission to match a mock.

| ID | Gap | Type and owner session | Evidence / required next decision |
| --- | --- | --- | --- |
| G-TASK-STATES | Task cancellation, timed out, settling and unknown outcome | DESIGN — M01-Gxx / M04–M05 | Design and approve safe status and action states; preserve uncertainty and avoid automatic retry. Contract blockers (`task/cancelled-partial`, the chain-stop marker behind `task/continue-refused`) are not drawn until the HarflowMCP contract lands (2026-11-08). |
| G-NEWTASK-ADVANCED | Effort, turn limit, caller approvals, enforcement preview and harness qualification in the composer | DESIGN — M01-Gxx / M04–M05 | Approved: the task options popover holds effort, turn limit, caller approvals and the enforcement preview (`new-task/centered-options`, `centered-options-closed`; `decisions/README.md:16-17`, `decisions/m04-proposal.md:62`). Open: check the caller-approvals and enforcement fixtures against real engine capability (`decisions/m04-proposal.md:14`); harness qualification is G-HARNESS. |
| G-QUEUE | Queue refusal and delivery uncertainty | DESIGN — M01-Gxx / M06 | Approve queued, refused, unknown and unsupported states. Provisional drafts of nine states exist (`task/message-*`, not approved); open contract gaps and owner questions are in [the decision record](decisions/README.md#queued-messages-and-approval-states-provisional). |
| G-APPROVAL-STATES | Approval/checkpoint stale, expiry and shared responder | DESIGN — M01-Gxx / M07 | Approve inline failure and refresh states that refuse obsolete decisions across surfaces. Provisional drafts exist for stale, expired, answered elsewhere, refused, checkpoint stale and delivery uncertain (`task/approval-*`, `needs-you/approval-stale`, `approval-expired`, `answered-elsewhere`, `checkpoint-stale`, `interaction-answered-elsewhere`, `menu-bar/approval-stale`, `answered-elsewhere`; not approved). |
| G-APPROVAL-WORDING | "Approve for this task" wording | DESIGN — M01-Gxx / M07 | Decided in S03: relabel to exact-action approval; no task-wide authority and no new contract. Separate from global MCP allowlist settings. Drawn as the provisional redraw `task/approval-exact` of `task/approval` (not approved; the pair is pending the owner). |
| G-ALLOWLIST | MCP approval settings | CAPABILITY — S05 / M03–M11 | Existing `harflow-ctl mcp-allowlist --backend --allow|--remove --json` supports human-only edits to future-session configuration with backend-specific restrictions; expose only supported narrow authority. See `HarflowMCP/docs/harness-permissions.md`. |
| G-DIFF | Task changed files and diff | CONTRACT + DESIGN — S04 / M03–M05 | S04 follow-up implements `task-changes.v1`: stored bounded committed-range and working-tree diffs with provenance and non-authorship attribution. Contract read gap delivered, receipt acceptance pending. Design incomplete, not_captured and unmerged_unknown states; retain capture limits. No direct Git or private engine access. |
| G-OVERFLOW | Task overflow menu with Cancel, Copy resume command, Copy task ID | DESIGN — M01-Gxx / M04–M05 | Design approved 2026-11-07: `m05-proposal/overflow-*`, `cancel-dialog*`, `takeover-dialog` (now `task/overflow-*`, `task/stop-dialog*`, `task/takeover-dialog`). Takeover keeps an entry, in overflow (owner, 2026-11-07). |
| G-EDITOR | Editor validation, conflicts, missing child references, proposal loading/failure | DESIGN — M01-Gxx / M08 | Approve recoverable states preserving unsaved edits and explicit proposal review. |
| G-WORKFLOW-MENU | Workflow overflow menu with Delete and its confirmation | DESIGN — M01-Gxx / M08 | Native confirmation states that existing run snapshots remain available; no Duplicate or Rename entry. |
| G-GENERATE | Generate workflow with agent | DESIGN — M01-Gxx / M08 | New-workflow entry, description form and builder progress, consistent with `34c3b05`. |
| G-RUN-ACTIONS | Workflow node/orchestrator messages and revise goal | DESIGN — M01-Gxx / M09 | Not drawn in the approved run states. The capability is accepted (owner, 2026-11-08); the gap stays open until it is drawn. |
| G-HISTORY | History paging, retention, reconnect and read-only unavailable | CONTRACT reads delivered, DESIGN direction approved — S04 / M03–M05 | Contract: S04 and its follow-up deliver bounded event and prompt reads, cursor and retention semantics, successor discovery and live workflow node activity; receipt acceptance pending. Design: loss, reconnect and unavailable states approved by the owner on 2026-11-05 as `d2b-proposal/*` (now `task/activity-*`, retired; now opens `task/transcript-*`) at `227da87` (`d2b-observation-approval.md`, now `decisions/d2b-observation-approval.md`); sidebar paging approved as `m04-proposal/history-*` (now `sidebar/history-*`) (`m04-proposal.md`, now `decisions/m04-proposal.md`). No design remains open. Native fidelity and product acceptance remain with M05. |
| G-RESOURCES | Resource over-limit, permission, not-enabled and unsupported responses | DESIGN — M01-Gxx / M10 | Distinct safe responses without new capacity tiers. |
| G-STATS | Statistics empty, error and incomplete; unsupported metrics | DESIGN + CONTRACT — S04 / M10 | Follow-up adds cost, coverage and observed model with provenance; null remains unknown, not zero. All-time history beyond retention remains unavailable; success rate/median require a complete generation client-side. Empty, error, incomplete and unsupported presentations still need design approval. |
| G-TRANSPORT | Engine startup and transport | CONTRACT + DESIGN — S05 / M03–M11 | The Start engine, ECONNREFUSED and `engine.sock` specimen is mock content. The `harness-runtime/*` states (`checking`, `install-required`, `update-required`, `installing`, `failed`, `listing`) are approved (`decisions/m04-proposal.md`). Still open: honest engine-unavailable and recovery states over the public CLI lifecycle; no hidden file or socket access. |
| G-HARNESS | Harness menu gating | CAPABILITY — S05 / M03–M11 | Decided in S03: list engine-reported harnesses gated by capability cells; Native Python-route qualification targets Claude, Codex and Vibe; other harnesses carry no new native qualification claim. |
| G-PLATFORM | macOS window chrome, tray, notifications | DESIGN — M01 / M11 | Native macOS adaptation first; Web browser/Linux access later; Windows native adaptations only after W05 and WIN01. |
| G-ADAPTIVE | Keyboard, narrow windows, Reduce Motion and focus | DESIGN — M01-Gxx / M04–M12 | Approve adaptive and interaction states, then validate production pixels and accessibility. Approved minimum window states (the owner, 2026-11-08) for the static screens, the lanes, the editor inspector, canvas and top bar and the popover: `needs-you/waiting-minimum`, `parallel-group/lanes-minimum`, `workflow-run/parallel-minimum`, `workflow-editor/node-selected-minimum`, `workflow-editor/orchestrator-minimum`, `menu-bar/busy-minimum`, and their loading states `needs-you/loading-minimum`, `parallel-group/loading-minimum`, `workflow-run/loading-parallel-minimum`, `workflow-editor/loading-minimum`, `menu-bar/loading-minimum`. Layout only; no capability changes. |

M05 task screen, 2026-11-07: the owner approved the recommended options, relayed by the coordinator. See [the approval record](decisions/m05-task-screen-approval.md). It covers G-TASK-STATES, G-OVERFLOW, G-DIFF, G-ADAPTIVE, the G-PLATFORM task top bar and the task-pane part of the right-pane rows, and names Stop as the action word for Cancel task above. `state-cancel-partial` (now `task/cancelled-partial`) and all `artifacts-*` routes (now `task/artifacts-*`) stay provisional on open contract gaps. On 2026-11-08 the owner confirmed that the M05 contract blockers are not drawn until the HarflowMCP contract lands (Codex is working on them in HarflowMCP): `task/cancelled-partial` (G-TASK-STATES), `task/artifacts-*` and `task/continue-refused`, whose chain-stop marker is not on status or in `contracts.md`. Rows above keep their statuses unless named here.

## Contract receipt reconciliation — 2026-11-04

[S04](../../../HarflowMCP/docs/migration-receipts/S04.md) and its
[follow-up](../../../HarflowMCP/docs/migration-receipts/S04-gaps.md) supersede the
initial no-diff/no-cost/missing-successor/live-activity audit findings below.
Follow-up code identity: `73182381fb597a7ff4664fc230dd006c20c31d8f`;
canonical manifest: `06094a8f210130d0794afe3913d66c853baf8d43c9022fd3140e22ebfe0aacaa`.
Delivery is not owner receipt acceptance, release or client adoption. No required
design state or Proposed/Undecided disposition is accepted by this reconciliation.
The follow-up records 898 targeted passes/1 skip, six path-sensitive runtime-loader
failures in its extracted-copy full run, and 14/14 loader checks in the primary
checkout. These historical checks were not rerun here.

## Initial interface audit provenance

These observations identify planning inputs, not a new compatibility guarantee. S04/S05 reverify them against the pinned Python baseline before implementation.

- Global allowlist: HarflowMCP `src/harflow_mcp/ctl.py` (`mcp-allowlist` parser and human-only handler), `src/harflow_mcp/mcp_allowlist.py` and `docs/harness-permissions.md`.
- Changed-file evidence: HarflowMCP `src/harflow_mcp/task_outcomes.py` exposes endpoint working-tree observations and committed diff statistics; public task artifacts describe metadata/stat references. This does not establish exclusive attribution of changes in a shared checkout.
- Statistics: HarflowMCP `docs/contracts.md`, `statistics-page.v1`, is the source for retained-history coverage and accounting.

The Python development route uses its public CLI and selected runtime. Rust implementation runs alongside native work after shared readiness; Mac-on-Rust integration and cutover follow accepted M12 and R14; fresh-state cutover, exclusive writers and no historical execution-state import remain unchanged. Cross-platform adaptations require their own approved v2 references. No planning entry marks a migration checklist item complete.
