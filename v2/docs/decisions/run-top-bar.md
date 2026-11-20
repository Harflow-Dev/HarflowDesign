# Run top bar

Status: **Approved by the owner on 2026-11-20** (relayed by the coordinator; the owner viewed the drawings first), approved in the commit titled "Approve the workflow-run question states". The states were drawn in commit `eadd22d` as the answer to the first open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`, "Open owner questions"): the run top bar ("Step N of M" and its More actions menu).

## Owner answers (2026-11-20)

1. Counter form: the started line, "Run started {time} · {repo}".
2. No More actions menu.
3. The sidebar row shows the elapsed time, not "2/4".
4. Moot: the counts were not chosen.

## Source

HarflowMac at `360a67c4`, read through git objects only. `MWF` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature`, `W` is `MWF/Workflow`:

- `W/WorkflowExecutionPresentation.swift:84-86` and `W/WorkflowView.swift:153-155`: the app derives no "step N of M". The state line of a run is "Run started {time} · {repo}".
- `W/WorkflowView.swift:193-237`: the run header offers Open parent, the Graph and Parallel switch, Pause, Cancel run, "Cancelling…" while cancelling and "Open root to cancel" for a child run. A refused cancellation reads "Cancellation unavailable: {reason}". There is no More actions menu.
- `MWF/Sidebar/SidebarVM+PresentationTick.swift`: a running row shows an elapsed label from the start time, not a step count.

HarflowMCP at `5face8b` (read-only):

- `workflow_responses.py:304`: `workflow-status` reports `progress {executions, active, settled}` and `current_stage`. It has no step index and no total; the total cannot be known up front (on-demand nodes, retries and orchestrator-chosen branches).
- `workflow_monitor_controls.py:47-117`: `workflow-status --monitor-view` returns `monitor_controls`, each `{allowed, reason}`, for pause, resume, recover, revise_goal, skip_optional_review, additional_attempts and cancel. `workflow_goals.py:113,140` is the reason of Revise goal outside a paused or awaiting-input checkpoint: "Goal revision requires a paused or awaiting-input checkpoint".
- `workflow-artifacts` returns artifact metadata. There is no export, delete-run, rerun or duplicate command.

Approved v2 drawings this decision supersedes as the app reference (not edited): `workflow-run/graph-needs-you` and `on-demand` draw "Step 2 of 4 · 06:31" and a More actions icon button (`v2/scripts/screens-workflow-run.js`), and the sidebar row meta "2/4". `parallel` and `recovery` already draw "Run started 02:00 · HarflowMCP" and no More button. The lock states derived from `on-demand` (for example `cancelled-node-locked`) and the held states derived from `orchestrator-selected` also keep "Step 2 of 4".

## States

All routes support light and dark, and the approved state has a `-minimum` twin at 1000 × 620 (group Minimum window).

| State | Route | Status | Draws |
| --- | --- | --- | --- |
| Run started line | `workflow-run/topbar-no-more` | Approved 2026-11-20 | `graph-needs-you` with "Run started 02:00 · HarflowMCP" in place of "Step 2 of 4 · 06:31", Pause and Cancel run, no More actions button, and the elapsed time in the sidebar row. |

## Not chosen

Retired on 2026-11-20; each route and its `-minimum` twin opens `workflow-run/topbar-no-more` (or its twin) through `v2/scripts/supersessions.js`, and the old drawings stay in Git at `eadd22d`:

- `workflow-run/topbar-started`: the started line with a More actions icon button kept. The owner chose no menu.
- `workflow-run/topbar-counts`: "Run started 02:00 · 4 finished · 1 active". The owner chose the started line.
- `workflow-run/topbar-more-actions` and `workflow-run/topbar-more-actions-disabled`: the menu open with Revise goal… and Copy run ID. The owner chose no menu; Revise goal stays reachable from the goal block of the run pane.

## What the app would change

- Nothing in the app for the top bar: the Mac already draws the started line and has no run menu, and its sidebar row already shows elapsed time.
- The change is to the approved v2 references. The approved "Step 2 of 4" top bars (`workflow-run/graph-needs-you`, `on-demand` and the states derived from them) and the "2/4" sidebar meta are superseded as the reference for the app by this decision. Those approved templates are not edited in this change; they stay as drawn until they are redrawn, and the states of the group Messages and goal derived from them keep their step count. The states drawn on this decision (`topbar-no-more`, the run pane states) use the decided top bar.
- Engine: `progress {executions, active, settled}` stays unused for the top bar; no total exists to draw.

## Files

- `v2/scripts/states-run-questions.js`: the state, derived from the approved template by exact swap.
- `v2/scripts/supersessions.js`: the eight retired routes.
- `v2/styles/run-questions.css`
- `tests/run-questions.test.mjs`
