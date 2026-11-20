# Parallel view run pane

Status: **Provisional, not approved.** Drawn on 2026-11-20 on the owner's "yes please", relayed by the coordinator, as the answer to the second open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`): the right-pane content of the Parallel view. No owner decision exists.

## Source

HarflowMac at `360a67c4`, read through git objects only. `MWF` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature`, `W` is `MWF/Workflow`:

- `W/WorkflowRunPanes.swift:8-24, 59-80` and `W/WorkflowRecoveryPanePresentation.swift:19-25`: the Parallel view keeps the default run sidebar on the right. Its width has a minimum of 220, an ideal of 460 for activity and a maximum of 500; the default sidebar ideal is 288 (`HfRadius.swift:233-239`).
- `W/WorkflowView+RunSidebar.swift:12-103`: the sidebar holds, from the top, a child-run banner, Open owning orchestrator, caller approvals, child links, an "Original request" disclosure, then the goal block (order at `WorkflowView+RunSidebar.swift:64-83`), the run plan and a "Technical plan" disclosure.
- `W/WorkflowInspectorSplit.swift:13`: the graph canvas has a minimum width of 400.

HarflowMCP at `5face8b`: `workflow-status` supplies the goal and its assessment; the run plan and technical plan are orchestrator data.

Approved v2: `workflow-run/parallel` has no right pane (lanes full width); `parallel-group-proposal.md` D21 says the Parallel group and the run Parallel view share one lane view.

## States

| State | Route | Draws |
| --- | --- | --- |
| Run pane | `workflow-run/parallel-run-pane` | `workflow-run/parallel` with a 288 wide pane on the right: an Original request disclosure (collapsed), the goal block as the Graph view draws it, the run plan and a collapsed Technical plan disclosure. The lanes scroll beside it. |

The `-minimum` twin (1000 × 620) keeps the lanes at their 360 floor, scrolling horizontally, beside the 288 pane.

The approved `workflow-run/parallel` stays the alternative and is referenced, not redrawn.

Not drawn for a root run with no caller approvals: the child-run banner, Open owning orchestrator, the child links and the caller approvals panel. The run plan list and its look are new design (the Mac plan is a checklist whose look is not specified here); the Original request disclosure reuses the approved task wording, with its loading and unavailable forms as the task screens draw them (not redrawn).

## Recommendations

1. **Mirror the Mac: draw the pane** (`parallel-run-pane`). The run-level content (goal, original request, plan) is otherwise reachable only from the Graph view, and the lanes already scroll horizontally.
2. If the owner prefers full-width lanes, keep the approved `parallel` and make the app hide the sidebar in the Parallel view.

## Owner questions

1. Pane or no pane in the Parallel view?
2. Which blocks: all four drawn, or fewer?
3. Collapsible, or fixed? The Mac sidebar can be toggled; a toggle is not drawn.
4. The same pane would be the Graph view with no node selected, which has no approved drawing. Should it be drawn in the same decision?
5. At 1000 × 620 the pane is drawn at 288 and the lanes scroll. The graph run at that size needs a new rule (below); is it acceptable?

## What the app would change

- If the pane is approved: nothing in the app for the Parallel view; the v2 reference gains the pane.
- If no pane: the app would hide the run sidebar in the Parallel view (`WorkflowRunPanes.swift:59-72`).
- The minimum window rule for graph runs (also used by the graph states of the other records): the canvas keeps 400 and the 460 pane narrows to what remains, no narrower than 220. It is a new minimum rule, drawn with the existing sidebar, canvas, lanes and top bar meta treatments.

## Files

- `v2/scripts/states-run-questions.js`, `v2/styles/run-questions.css`, `tests/run-questions.test.mjs`
