# Run pane

Status: **Approved by the owner on 2026-11-20** (relayed by the coordinator; the owner viewed the drawings first), approved in the commit titled "Approve the workflow-run question states". The pane was drawn in commit `eadd22d` as the answer to the second open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`): the right-pane content of the Parallel view. The states drawn on the owner's answers (`parallel-run-pane-collapsed` and `graph-no-selection`) were approved the same day (decision "Run pane"). The toggle is new behaviour, not parity (see the correction under answer 3).

## Owner answers (2026-11-20)

1. The pane, as drawn.
2. All four blocks: Original request, goal, run plan and Technical plan.
3. Collapsible, matching the Mac toggle: the toggle is drawn.

   Correction (2026-11-20): the question claimed that the Mac sidebar can be toggled; that was inaccurate at 360a67c4 (the sidebar is in an `HSplitView` with a 220 minimum, and the run view has no toggle). The owner was told the sidebar cannot be hidden today and confirmed "Add the toggle" on 2026-11-20. The toggle is therefore new behaviour, not parity: it reuses the task screen's `inspectorToggle` control and labels (`TaskDetailToolbar.swift:178-185`).
4. Yes: draw the Graph view with no node selected in this decision.
5. The minimum window rule is accepted.

## Source

HarflowMac at `360a67c4`, read through git objects only. `MWF` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature`, `W` is `MWF/Workflow`:

- `W/WorkflowRunPanes.swift:8-24, 59-80` and `W/WorkflowRecoveryPanePresentation.swift:19-25`: the Parallel view keeps the default run sidebar on the right. Its width has a minimum of 220, an ideal of 460 for activity and a maximum of 500; the default sidebar ideal is 288 (`HfRadius.swift:233-239`).
- `W/WorkflowView+RunSidebar.swift:12-103`: the sidebar holds, from the top, a child-run banner, Open owning orchestrator, caller approvals, child links, an "Original request" disclosure, then the goal block (order at `WorkflowView+RunSidebar.swift:64-83`), the run plan and a "Technical plan" disclosure.
- `W/WorkflowInspectorSplit.swift:13`: the graph canvas has a minimum width of 400.

HarflowMCP at `5face8b`: `workflow-status` supplies the goal and its assessment; the run plan and technical plan are orchestrator data.

Approved v2: `workflow-run/parallel` has no right pane (lanes full width); `parallel-group-proposal.md` D21 says the Parallel group and the run Parallel view share one lane view.

Toggle (HarflowMac at `360a67c4`, git objects only): the Mac run view has no toggle for its run sidebar. `WorkflowRunPanes.swift` keeps the sidebar in an `HSplitView` with a 220 minimum, so it cannot be hidden. The Mac control that hides a right pane is the task screen's `inspectorToggle` (`TaskDetail/Component/TaskDetailToolbar.swift:178-185`, `TaskDetailView.swift`): icon `sidebar.right`, quiet button style selected while the pane shows, and the help and accessibility label "Hide right pane" while it is open and "Show right pane" while it is hidden. v2 draws the same control for the task right pane. The drawings reuse that control, with its label verbatim, at the right end of the run top bar.

Graph with no node selected: `WorkflowRecoveryPanePresentation.swift:19-25` resolves the slot. With no node selected and no recovery checkpoint the Graph view shows the default run sidebar (288 ideal); a node selection shows the selected-node pane (460 ideal); a recovery-eligible run shows the recovery pane (360), which `workflow-run/recovery` already draws.

## States

| State | Route | Status | Draws |
| --- | --- | --- | --- |
| Run pane | `workflow-run/parallel-run-pane` | Approved 2026-11-20 | `workflow-run/parallel` with a 288 wide pane on the right: an Original request disclosure (collapsed), the goal block as the Graph view draws it, the run plan and a collapsed Technical plan disclosure, and the toggle "Hide right pane" (selected) at the right end of the top bar. The lanes scroll beside it; the elapsed time shows in the sidebar row. |
| Run pane hidden | `workflow-run/parallel-run-pane-collapsed` | Approved 2026-11-20 | The same top bar with the toggle off ("Show right pane"); no pane, lanes at full width. |
| Graph, no step selected | `workflow-run/graph-no-selection` | Approved 2026-11-20 | `workflow-run/graph-needs-you` with the step deselected and the same run pane at 288, its plan listing the four steps of the graph; the decided top bar (started line, no More actions) and the toggle. |

Each has a `-minimum` twin (1000 × 620). The Parallel twins keep the lanes at their 360 floor, scrolling horizontally, beside the 288 pane. The Graph twin keeps the canvas at 400 and lets the pane narrow to what is left, no narrower than 220 (the accepted rule).

The approved `workflow-run/parallel` stays as drawn and is the base of these states. Not drawn for a root run with no caller approvals: the child-run banner, Open owning orchestrator, the child links and the caller approvals panel. The run plan list and its look are design wording; the Original request disclosure reuses the approved task wording, with its loading and unavailable forms as the task screens draw them (not redrawn).

## What the app would change

- The Mac app already shows the pane; the v2 reference gains it.
- Add the toggle to the run top bar, wired to hiding the right side of the `HSplitView`, with the task screen's label and icon. This is new behaviour, not parity: the Mac run view cannot hide its sidebar today.
- The minimum window rule for graph runs: the canvas keeps 400 and the pane narrows to what remains, no narrower than 220.

## Files

- `v2/scripts/states-run-questions.js`, `v2/styles/run-questions.css`, `tests/run-questions.test.mjs`
