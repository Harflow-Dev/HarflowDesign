# Migration coverage and intent ledger

This is a planning ledger, not a receipt or authorization to implement. The owner approved the v2 redesign on 2026-11-03, including the subsequent HarflowMac connector amendment. The immutable baseline is [HarflowDesign commit 3643d083700be4032c93237813b573d04bab6ab1](https://github.com/Harflow-Dev/HarflowDesign/tree/3643d083700be4032c93237813b573d04bab6ab1/v2), with [approval record](approval.md), [screen inventory](screen-inventory.md), and [terminology](terminology.md). Its 30 product states and component states are approved visual references, not proof that every required state or runtime capability exists. The root v1 catalog remains a legacy reference; do not automatically copy it or revert v2.

Cite the exact design commit, path and state for each implementation. Paths below are relative to the Design repository and refer to the pinned commit. Themes are available through `/light` and `/dark`; exact individual state routes are enumerated in the inventory.

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

## Intent and readiness

The owner directed a simpler Electron redesign, not automatic reproduction of every old app feature. S03 must complete decisions on legacy functionality not explicitly decided below. Undecided functionality is neither silently dropped nor restored. Core execution safety and observability remain required. UI removal does not delete engine APIs or historical data. Visual approval does not authorize expanded authority, public contract changes, new backends or deferred features.

| Intent | Scope and readiness |
| --- | --- |
| Keep | Safe execution, status, uncertainty, approved inline decisions, workflow execution and recovery, and resource visibility remain required; missing states below are not yet approved. Global MCP allowlist editing is an existing human-only public operation for future sessions, subject to backend capability restrictions. |
| Simplify | Running and Recent work use flat rows; parallel groups have lanes and are created only through MCP. Workflow definitions show no aggregate run status; runs appear in the sidebar. Task detail retains the right-side Changes/Artifacts/Events pane. |
| Deliberately remove | Product search and sidebar filtering; former top-level task Activity, Summary and Prompt tabs; Council. These removals do not create design gaps or delete engine behavior. Generic search components or design-catalog navigation do not reintroduce product search. |
| Undecided | Other legacy functionality, expanded approval semantics, unverified statistics metrics, unsupported harnesses and terminal takeover require explicit scope and capability decisions. Terminal takeover appears in terminology/components; it remains deferred, not an accepted product-screen requirement. |

## Gap loop and initial register

For a required retained or approved simplified feature, resolve scope first, then create missing states in HarflowDesign v2, obtain explicit owner approval and record exact commit/path/state before dependent implementation. Use bounded S10-G01 and subsequent sub-sessions as needed, with the feature owner and relevant contract owner. An unresolved required state blocks its dependent feature, not independent work. Existing mock states must not be treated as complete coverage. Contract gaps require an independently approved public contract or an owner-approved limited presentation; never invent an API or broaden permission to match a mock.

| Gap | Type and owner session | Evidence / required next decision |
| --- | --- | --- |
| Task cancellation, timed out, settling and unknown outcome | DESIGN — S10-Gxx / S16 | Design and approve safe status and action states; preserve uncertainty and avoid automatic retry. |
| Queue refusal and delivery uncertainty | DESIGN — S10-Gxx / S18 | Decide retained messaging scope, then approve queued, refused, unknown and unsupported states. |
| Approval/checkpoint stale, expiry and shared responder | DESIGN — S10-Gxx / S19 | Approve inline failure and refresh states that refuse obsolete decisions across surfaces. |
| Approval wording and authority | CONTRACT + DESIGN — S05 / S19 | Visible “Approve for this task” needs explicit reconciliation with existing exact-action authority. Decide wording and scope; do not silently grant task-wide authority. This is separate from global MCP allowlist settings. |
| MCP approval settings | CAPABILITY — S05 / S15 | Existing `harflow-ctl mcp-allowlist --backend --allow|--remove --json` supports human-only edits to future-session configuration, with backend-specific restrictions; audit capabilities and expose only supported narrow authority. See `HarflowMCP/docs/harness-permissions.md`. |
| Task changed files and diff | CONTRACT + DESIGN — S04 / S17 | Existing terminal outcome exposes baseline/terminal working-tree status and committed diff statistics; artifacts provide metadata/statistics. A full unified diff/content public read was not found in the initial audit. Decide bounded public read and provenance or approve a limited presentation; no direct Git or private engine access as an implicit substitute. |
| Editor validation, conflicts, missing child references and proposal loading/failure | DESIGN — S10-Gxx / S20 | Approve recoverable states preserving unsaved edits and explicit proposal review. |
| History paging, retention, reconnect and read-only unavailable | DESIGN + CONTRACT — S04 / S17 | Audit public bounded reads, cursors and retention; approve loss, reconnect and unavailable presentations. |
| Resource over-limit, permission and unsupported response | DESIGN — S10-Gxx / S22 | Audit capabilities and approve distinct safe responses without new capacity tiers. |
| Statistics empty, error and incomplete | DESIGN + CONTRACT — S04 / S22 | Compare All time, success rate, median duration and cost with existing `statistics-page` public data and accounting semantics; decide unsupported metrics and approve empty/error/incomplete states. |
| Engine startup and transport | CONTRACT + DESIGN — S05 / S15 | The Start engine, ECONNREFUSED and `engine.sock` specimen is mock content, not an accepted transport. Audit supported public CLI lifecycle and design honest unavailable/recovery states; no hidden file or socket access. |
| Harness menu | CAPABILITY — S05 / S15 | Opencode and Antigravity appear in the mock; Rust v1 plans Claude, Codex and Vibe. Decide scope separately and gate by actual qualified capabilities; the visual does not authorize new backends. |
| Terminal takeover | SCOPE — S03 / S15 | Deferred; owner must explicitly decide inclusion and its authority before design or implementation. |
| Other legacy controls and diagnostic placement | SCOPE — S03 / affected feature session | Starring, workflow rename/context menus, standalone Node reordering and detailed capture/supervision panels are not individually classified by the new specimens. Record keep/simplify/remove/undecided before commissioning designs. Keep truthful failure/unknown state and safe recovery even if an old panel is removed. |
| Keyboard, narrow windows, Reduce Motion and focus | DESIGN — S10-Gxx / S12–S24 | Design and approve required adaptive and interaction states, then validate actual production pixels and native accessibility behavior. |

## Initial interface audit provenance

These observations identify planning inputs, not a new compatibility guarantee.
S04/S05 reverify them against the pinned Python baseline before implementation.

- Global allowlist: HarflowMCP `src/harflow_mcp/ctl.py` (`mcp-allowlist` parser and
  human-only handler), `src/harflow_mcp/mcp_allowlist.py` and
  `docs/harness-permissions.md` (global future-session scope, per-backend grammar,
  backups and atomic configuration changes).
- Changed-file evidence: HarflowMCP `src/harflow_mcp/task_outcomes.py` exposes
  endpoint working-tree observations and committed diff statistics; public task
  artifacts describe metadata/stat references. Full unified diff/content reads
  were not found in this audit. This does not establish exclusive attribution of
  changes in a checkout shared with a person or another task.
- Statistics: HarflowMCP `docs/contracts.md`, `statistics-page.v1`, is the source
  for retained-history coverage and accounting. Mock values, All time and reported
  cost do not establish availability or complete history.

The Python development route uses its public CLI and selected runtime. Rust production work follows accepted E0; fresh-state cutover, exclusive writers and no historical execution-state import remain unchanged. Cross-platform adaptations require their own approved v2 references. No planning entry marks a migration checklist item complete.
