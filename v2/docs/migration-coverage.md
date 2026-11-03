# Migration coverage and intent ledger

This is a planning ledger, not a receipt or authorization to implement. The owner approved the v2 redesign on 2026-11-03, including two subsequent amendments: the HarflowMac connector style ([commit 3643d083700be4032c93237813b573d04bab6ab1](https://github.com/Harflow-Dev/HarflowDesign/tree/3643d083700be4032c93237813b573d04bab6ab1/v2)) and the Edit with agent right-side builder pane ([commit 34c3b0576e221d17b1096136db6c5d0fbb4c5000](https://github.com/Harflow-Dev/HarflowDesign/tree/34c3b0576e221d17b1096136db6c5d0fbb4c5000/v2), approval confirmed by the owner in S03). The [approval record](approval.md), [screen inventory](screen-inventory.md) and [terminology](terminology.md) describe the approved material. Its 30 product states and component states are approved visual references, not proof that every required state or runtime capability exists. The root v1 catalog remains a legacy reference; do not automatically copy it or revert v2.

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

The owner directed a simpler Electron redesign, not automatic reproduction of every old app feature. Core execution safety and observability remain required. UI removal does not delete engine APIs or historical data. Visual approval does not authorize expanded authority, public contract changes, new backends or deferred features. Undecided functionality is neither silently dropped nor restored.

## Capability disposition ledger (S03)

Recorded by [S03](../../../HarflowMCP/docs/migration-receipts/S03.md) against HarflowMac `7e78cb5fade2d1dc0480be0434bbf20bb5be1d10` (legacy behavior evidence) and HarflowMCP `10654cb20a0ec6dea4292916c750203656af210e`. Status **Accepted** means an owner decision exists (dated plan decision, v2 approval or an S03 answer). **Proposed** means the S03 lead's classification derived from those decisions; it becomes accepted with the S03 receipt. "Gap" names the design or contract follow-up in the register below.

### Keep

| Capability | Status | v2 reference / gap |
| --- | --- | --- |
| Start task: repository, harness and model, access level, prompt | Accepted | `new-task/default`, `new-task/harness-menu` |
| Harness menu lists every harness the selected engine reports and qualifies, gated by its capability cells | Accepted (S03) | `new-task/harness-menu`; Rust v1 backend scope is unchanged (below) |
| Reasoning effort, turn limit and caller approvals where the backend supports them | Proposed | Gap G-NEWTASK-ADVANCED |
| Permission/enforcement preview before start | Proposed | Safety observability; gap G-NEWTASK-ADVANCED |
| Running and Recent work with older-history paging | Accepted | `new-task/default`; paging gap G-HISTORY |
| Task transcript, tool calls, live state, follow-up composer, Continue for a settled task | Accepted | `task/running`, `task/done` |
| Queued messages, Send now, cancel queued message | Accepted | Gap G-QUEUE |
| Cancel task (top bar overflow) | Accepted | `task/running`; gap G-TASK-STATES |
| Right pane: Changes, Artifacts, Events | Accepted | `task/done`; diff gap G-DIFF |
| Copy resume command and copy task ID (overflow menu) | Accepted (S03) | Gap G-OVERFLOW |
| Approvals and questions answered inline in transcript, Needs you and menu bar | Accepted | `task/approval`, `needs-you/*`, `menu-bar/busy`; gaps G-APPROVAL-STATES, G-APPROVAL-WORDING |
| Workflow recovery checkpoints in Needs you | Accepted | `needs-you/waiting`, `workflow-run/recovery` |
| Desktop notifications on finish and on Needs you, with their settings | Accepted | `settings/general`; gap G-PLATFORM |
| Menu bar or tray popover | Accepted | `menu-bar/*` |
| Deep link to a task, single instance | Accepted | No visual state; S23 |
| Workflows list, Run workflow with Task, Goal, repository and orchestrator override | Accepted | `workflows/list`, `workflows/run`, `workflows/empty` |
| Workflow editor: canvas, node types (agent roles, child workflow, parallel start/end, on-demand), connections and conditions, inspector, orchestrator settings and limits, fallback harnesses, undo/redo, copy/paste | Accepted | `workflow-editor/node-selected`, `workflow-editor/orchestrator`; gap G-EDITOR |
| Edit with agent | Accepted | `workflow-editor/edit-with-agent` at `34c3b05` |
| Generate a workflow with the builder agent | Accepted (S03) | Gap G-GENERATE |
| Delete a workflow, with confirmation (native: editor More actions) | Accepted (S03) | Gap G-WORKFLOW-MENU |
| Workflow run graph and parallel view, node and on-demand inspection, pause, resume, cancel, recover | Accepted | `workflow-run/*` |
| Workflow node/orchestrator messages and revise goal | Proposed | Included in plan v1 scope; gap G-RUN-ACTIONS |
| Parallel group lanes, per-lane composer, Cancel all | Accepted | `parallel-group/lanes` |
| Resource slots observation | Accepted | `resources/slots`; gap G-RESOURCES |
| Statistics overview with range selector | Accepted | `statistics/overview`; gap G-STATS |
| Settings: appearance, behaviour, runtime, task store status | Accepted | `settings/general` |
| Harness MCP registration install/update/remove and qualification | Accepted | `settings/harnesses` |
| Global MCP approvals (existing human-only `mcp-allowlist`) | Accepted | `settings/mcp-approvals`; gap G-ALLOWLIST |
| First run, runtime install/update, loading, engine unavailable | Accepted | `app-states/*`; gap G-TRANSPORT |
| Appearance System/Light/Dark in sidebar footer and rail | Accepted | Components; `new-task/sidebar-collapsed` |
| Keyboard, focus, Reduce Motion, accessibility, narrow windows | Accepted | Gap G-ADAPTIVE |
| Truthful enforcement, unknown and failure states | Accepted | Required on whichever surface displays the task; not a panel requirement |

### Simplify

| Capability | Status | Treatment |
| --- | --- | --- |
| Sidebar sections Running/Today/Earlier and nested conversation trees | Accepted | Flat Running and Recent work rows |
| Task-level Summary and Prompt tabs | Accepted | Prompt is the first transcript message; summary in the transcript (`task/done`) |
| Raw events sheet | Proposed | Events right-pane tab |
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
| Builder-session "Always allow Harflow tools" shortcut | Proposed | Builder approvals go through ordinary inline approvals |
| Exploratory-only legacy proposals never shipped natively: starring (#7), sidebar context menus and delete (#8), task and workflow rename (#4; native has no rename of a saved workflow), standalone node reordering (#1), workflow setup/teardown (#21), readiness (MCP#18), store-recovery proposal states (#12), header appearance control (#6) | Proposed | Not in the native baseline; tickets stay open and unchanged as post-v1 backlog |

### Deferred (accepted plan D12; not shown in the v1 client)

Terminal takeover and attach (including "Take over in terminal" in terminology and the old lanes); webhook notifications and subscriptions; limit-hit projections; `auto_continue`, `group_report_output`, `extra_writable_paths`; Codex app-server caller approvals; workflow `migrate`; legacy `PB_*` variables. Python keeps these engine operations. The owner may move any item back into v1.

### Undecided

| Item | Owner of the next decision |
| --- | --- |
| Task store recovery actions (inspect, backup and reset) beyond status display, given Rust's fresh store | S25 store decisions, then S15 |
| Worktree and scratch observation in the client (engine features retained; no v2 surface) | Owner, before S22 |

## Gap register

For a required retained or approved simplified feature, create missing states in HarflowDesign v2, obtain explicit owner approval and record exact commit/path/state before dependent implementation. Use bounded S10-G01 and subsequent sub-sessions as needed, with the feature owner and relevant contract owner. An unresolved required state blocks its dependent feature, not independent work. Contract gaps require an independently approved public contract or an owner-approved limited presentation; never invent an API or broaden permission to match a mock.

| ID | Gap | Type and owner session | Evidence / required next decision |
| --- | --- | --- | --- |
| G-TASK-STATES | Task cancellation, timed out, settling and unknown outcome | DESIGN — S10-Gxx / S16 | Design and approve safe status and action states; preserve uncertainty and avoid automatic retry. |
| G-NEWTASK-ADVANCED | Effort, turn limit, caller approvals, enforcement preview and harness qualification in the composer | DESIGN — S10-Gxx / S16 | The v2 composer shows repository, harness/model and access only. |
| G-QUEUE | Queue refusal and delivery uncertainty | DESIGN — S10-Gxx / S18 | Approve queued, refused, unknown and unsupported states. |
| G-APPROVAL-STATES | Approval/checkpoint stale, expiry and shared responder | DESIGN — S10-Gxx / S19 | Approve inline failure and refresh states that refuse obsolete decisions across surfaces. |
| G-APPROVAL-WORDING | "Approve for this task" wording | DESIGN — S10-Gxx / S19 | Decided in S03: relabel to exact-action approval; no task-wide authority and no new contract. Separate from global MCP allowlist settings. |
| G-ALLOWLIST | MCP approval settings | CAPABILITY — S05 / S15 | Existing `harflow-ctl mcp-allowlist --backend --allow|--remove --json` supports human-only edits to future-session configuration with backend-specific restrictions; expose only supported narrow authority. See `HarflowMCP/docs/harness-permissions.md`. |
| G-DIFF | Task changed files and diff | CONTRACT + DESIGN — S04 / S17 | Terminal outcome exposes working-tree status and committed diff statistics; no full unified diff/content public read was found. Decide a bounded public read with provenance or approve a limited presentation; no direct Git or private engine access. |
| G-OVERFLOW | Task overflow menu with Cancel, Copy resume command, Copy task ID | DESIGN — S10-Gxx / S16 | No takeover entry while takeover is deferred. |
| G-EDITOR | Editor validation, conflicts, missing child references, proposal loading/failure | DESIGN — S10-Gxx / S20 | Approve recoverable states preserving unsaved edits and explicit proposal review. |
| G-WORKFLOW-MENU | Workflow overflow menu with Delete and its confirmation | DESIGN — S10-Gxx / S20 | Native confirmation states that existing run snapshots remain available; no Duplicate or Rename entry. |
| G-GENERATE | Generate workflow with agent | DESIGN — S10-Gxx / S20 | New-workflow entry, description form and builder progress, consistent with `34c3b05`. |
| G-RUN-ACTIONS | Workflow node/orchestrator messages and revise goal | DESIGN — S10-Gxx / S21 | Not drawn in the approved run states. |
| G-HISTORY | History paging, retention, reconnect and read-only unavailable | DESIGN + CONTRACT — S04 / S17 | Audit bounded reads, cursors and retention; approve loss, reconnect and unavailable presentations. |
| G-RESOURCES | Resource over-limit, permission, not-enabled and unsupported responses | DESIGN — S10-Gxx / S22 | Distinct safe responses without new capacity tiers. |
| G-STATS | Statistics empty, error and incomplete; unsupported metrics | DESIGN + CONTRACT — S04 / S22 | Compare All time, success rate, median duration and cost with `statistics-page`; mark unsupported metrics. |
| G-TRANSPORT | Engine startup and transport | CONTRACT + DESIGN — S05 / S15 | The Start engine, ECONNREFUSED and `engine.sock` specimen is mock content. Design honest unavailable/recovery states over the public CLI lifecycle; no hidden file or socket access. |
| G-HARNESS | Harness menu gating | CAPABILITY — S05 / S15 | Decided in S03: list engine-reported harnesses gated by capability cells; E0 qualification covers Claude, Codex and Vibe; other harnesses carry no E0 qualification claim. |
| G-PLATFORM | macOS window chrome, tray, notifications | DESIGN — S10 (C0-DS-02) | Linux and Windows adaptations follow before X01/X02. |
| G-ADAPTIVE | Keyboard, narrow windows, Reduce Motion and focus | DESIGN — S10-Gxx / S12–S24 | Approve adaptive and interaction states, then validate production pixels and accessibility. |

## Initial interface audit provenance

These observations identify planning inputs, not a new compatibility guarantee. S04/S05 reverify them against the pinned Python baseline before implementation.

- Global allowlist: HarflowMCP `src/harflow_mcp/ctl.py` (`mcp-allowlist` parser and human-only handler), `src/harflow_mcp/mcp_allowlist.py` and `docs/harness-permissions.md`.
- Changed-file evidence: HarflowMCP `src/harflow_mcp/task_outcomes.py` exposes endpoint working-tree observations and committed diff statistics; public task artifacts describe metadata/stat references. This does not establish exclusive attribution of changes in a shared checkout.
- Statistics: HarflowMCP `docs/contracts.md`, `statistics-page.v1`, is the source for retained-history coverage and accounting.

The Python development route uses its public CLI and selected runtime. Rust production work follows accepted E0; fresh-state cutover, exclusive writers and no historical execution-state import remain unchanged. Cross-platform adaptations require their own approved v2 references. No planning entry marks a migration checklist item complete.
