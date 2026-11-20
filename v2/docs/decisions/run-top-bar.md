# Run top bar

Status: **Provisional, not approved.** Drawn on 2026-11-20 on the owner's "yes please", relayed by the coordinator, as the answer to the first open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`, "Open owner questions"): the run top bar ("Step N of M" and its More actions menu). No owner decision exists; every state below is a drawing to decide on.

## Source

HarflowMac at `360a67c4`, read through git objects only. `MWF` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature`, `W` is `MWF/Workflow`:

- `W/WorkflowExecutionPresentation.swift:84-86` and `W/WorkflowView.swift:153-155`: the app derives no "step N of M". The state line of a run is "Run started {time} · {repo}".
- `W/WorkflowView.swift:193-237`: the run header offers Open parent, the Graph and Parallel switch, Pause, Cancel run, "Cancelling…" while cancelling and "Open root to cancel" for a child run. A refused cancellation reads "Cancellation unavailable: {reason}". There is no More actions menu.
- `MWF/Sidebar/SidebarVM+PresentationTick.swift`: a running row shows an elapsed label from the start time, not a step count.

HarflowMCP at `5face8b` (read-only):

- `workflow_responses.py:304`: `workflow-status` reports `progress {executions, active, settled}` and `current_stage`. It has no step index and no total; the total cannot be known up front (on-demand nodes, retries and orchestrator-chosen branches).
- `workflow_monitor_controls.py:47-117`: `workflow-status --monitor-view` returns `monitor_controls`, each `{allowed, reason}`, for pause, resume, recover, revise_goal, skip_optional_review, additional_attempts and cancel. `workflow_goals.py:113,140` is the reason of Revise goal outside a paused or awaiting-input checkpoint: "Goal revision requires a paused or awaiting-input checkpoint".
- `workflow-artifacts` returns artifact metadata. There is no export, delete-run, rerun or duplicate command.

Approved v2 drawings this changes nothing in: `workflow-run/graph-needs-you` and `on-demand` draw "Step 2 of 4 · 06:31" and a More actions icon button (`v2/scripts/screens-workflow-run.js`), and the sidebar row meta "2/4". `parallel` and `recovery` already draw "Run started 02:00 · HarflowMCP" and no More button.

## States

All routes support light and dark, and each has a `-minimum` twin at 1000 × 620 (group Minimum window). Every state is provisional.

| State | Route | Draws |
| --- | --- | --- |
| Run started line | `workflow-run/topbar-started` | `graph-needs-you` with "Run started 02:00 · HarflowMCP" in place of "Step 2 of 4 · 06:31", and the elapsed time in the sidebar row. More actions stays an icon button. |
| Finished and active counts | `workflow-run/topbar-counts` | The same, reading "Run started 02:00 · 4 finished · 1 active": the engine's settled and active counts, with no total. |
| No More actions | `workflow-run/topbar-no-more` | The started line and the Mac's header: no More actions button. |
| More actions menu | `workflow-run/topbar-more-actions` | The menu open on the run that needs you: Revise goal… (enabled), a separator, Copy run ID. Pause and Cancel run stay buttons. |
| More actions, revise goal unavailable | `workflow-run/topbar-more-actions-disabled` | The menu open on a running run (the Parallel view top bar, which gains a More button for this drawing): Revise goal… disabled with the engine's reason under it. |

The counts come from the executions of the Graph view fixture (Scan lockfiles, Draft upgrade plan and the two Security reviewer calls are finished; Open pull request is active). Menu wording other than Revise goal… is design wording; Copy run ID is a client-only action. The elapsed time in the sidebar row is the form the other running rows use.

## Recommendations

1. **The started line** (`topbar-started`). It is what the app draws, it is true for every run and it needs no engine data. The approved "Step N of M" promises a total the engine cannot give.
2. **Counts are an alternative** (`topbar-counts`) if the owner wants progress at a glance. They are real engine numbers but carry no total, and "finished" includes failed and cancelled executions, so the wording may need another word.
3. **Keep a More actions menu only if it carries something the buttons do not.** On the engine's contract the run-level actions are Revise goal (already reachable from the goal block of the pane) and nothing else; there is no export, delete-run, rerun or duplicate. The menu drawn is therefore thin. The Mac has none (`topbar-no-more`).
4. No Show artifacts item is drawn: no artifacts surface is approved for a workflow run.

## Owner questions

1. Counter form: the started line, or the counts, or the approved "Step N of M" kept as a design intent with the app computing nothing?
2. Keep a run More actions menu at all (the Mac has none), and if so which items? Revise goal… in the menu duplicates the approved pane entry point (`workflow-run/revise-goal`). Is Copy run ID wanted?
3. The sidebar row meta: elapsed time (drawn) instead of "2/4".
4. Should "finished" in the counts include failed and cancelled executions, or is another word needed?

## What the app would change

- Started line: nothing; the Mac already draws it. The v2 reference would replace "Step 2 of 4 · 06:31" and "2/4" in the approved states once the owner decides.
- Counts: show `progress.settled` and `progress.active` of `workflow-status` after the started line.
- More actions menu: add the menu to the run header with the chosen items, reading enablement and reasons from `monitor_controls` (Revise goal: `revise_goal.allowed` and `.reason`).

Not changed now: the approved states that draw "Step 2 of 4" or "2/4" are left as they are: `workflow-run/graph-needs-you`, `on-demand`, their sidebar rows, the derived states of the group Messages and goal, and the drawings derived from them.

## Files

- `v2/scripts/states-run-questions.js`: the states, derived from the approved templates by exact swap.
- `v2/styles/run-questions.css`: the menu anchor and the minimum window rules.
- `tests/run-questions.test.mjs`
