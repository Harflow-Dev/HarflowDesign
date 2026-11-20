# Run message locks

Status: **Provisional, not approved.** Drawn on 2026-11-20 on the owner's "yes please", relayed by the coordinator, as the answer to the fourth open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`): which message composers lock when a run is completed, cancelling or cancelled, and when the runtime does not support messages. No owner decision exists. Lock copy not marked Mac is design wording.

## Source

HarflowMac at `360a67c4`, read through git objects only. `MWF` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature`, `W` is `MWF/Workflow`, `P` is `MWF/Parallel`:

- Lanes lock only when the run is cancelled: "Messages are off — this run was cancelled" (`MWF/TaskDetail/Component/MessageBoxView.swift:20-54`, `W/WorkflowVM+MessagingSupport.swift:10-14`, `P/Component/ParallelColumnModel.swift:108-125`).
- Completed and cancelling lanes stay open. Graph node composers never lock on run status (`P/Component/ParallelColumnModel.swift:127-136`, `W/WorkflowActivityMessageComposer.swift:13-63`).
- An unsupported runtime locks the node pane only; lanes are untouched (`P/ParallelVM+MessageLock.swift:39-44`). The unsupported form is an empty placeholder with no hint and a disabled Send.

HarflowMCP at `5face8b`, `src/harflow_mcp`:

- Completed (non-builder) and cancelled runs accept a send but mark the message undeliverable at once, reason "Workflow ended before another matching dispatch was issued" (`workflow_messages.py:155-158`); send-now fails with `workflow_terminal`.
- While cancelling, messages stay queued until the run is cancelled, then become undeliverable; cancelling a queued message is still allowed.
- Failed runs retain messages for recovery (`workflow_messages.py:73-80`), so failed lanes and node composers stay open.
- The orchestrator composer is refused (`workflow_terminal`) on completed and failed non-builder runs as well (`workflow_steering.py:176-177`, `orchestrator_steering.py:379`).
- Without the `messaging.v1` capability sends are refused; there is no per-backend unsupported flag. Engine builder strings are not used as copy.

Approved v2: `lane-message-undeliverable` (cancelled lanes), `messages-unsupported` (node pane), `orchestrator-steering-cancelling` (orchestrator composer while cancelling, "Messages are off — this run is cancelling"). The approved `lane-message-undeliverable` draws the bare Cancelled badge; the new cancelled states use the glyph form (stop icon and "Cancelled"). The approved state is not changed.

## States

All routes have a `-minimum` twin and are in group Run message locks.

| State | Route | Draws |
| --- | --- | --- |
| Completed run, lanes | `workflow-run/lanes-completed` | The construction of `lane-message-undeliverable` applied to a completed run: badge Done, Pause and Cancel run gone, the run in Recent work, lanes ended, composers locked "Messages are off — this run is complete". |
| Cancelling run, lanes | `workflow-run/lanes-cancelling` | Badge Cancelling, Pause and Cancel run gone, composers locked "Messages are off — this run is cancelling"; a queued bubble keeps its Cancel. |
| Cancelled run, node | `workflow-run/cancelled-node-locked` | The on-demand run as cancelled: badge Cancelled, the node composer locked "Messages are off — this run was cancelled". |
| Cancelled run, orchestrator | `workflow-run/cancelled-orchestrator-locked` | The same for the orchestrator composer. |
| Unsupported runtime, lanes | `workflow-run/lanes-unsupported` | Every lane composer in the unsupported form: no placeholder, no hint, Send disabled. |

The canvases of the graph states are the base fixtures and are not redrawn for a cancelled run, as in the approved cancelling state.

## Recommendations

1. **Lock completed lanes** with copy in the form of the cancelled one ("this run is complete"). The engine marks such sends undeliverable at once; a composer that accepts them only to fail is worse than a lock. The same applies to the orchestrator composer on a completed run (proposed copy: "Messages are off — this run is complete").
2. **Lock cancelling lanes**, keeping Cancel on queued messages.
3. **Lock cancelled graph composers**, node and orchestrator.
4. **Failed runs stay open**: messages are retained for recovery.
5. **Unsupported lanes: the locked form**, as the node pane draws it, rather than hiding the composer. A hidden composer leaves no sign that messaging exists.

## Owner questions

1. Lock completed lanes (and the completed orchestrator composer), and the copy?
2. Lock cancelling lanes?
3. Lock cancelled graph composers (the Mac never does)?
4. Lanes on an unsupported runtime: locked form, or hidden composer?
5. The graph run states use a new minimum rule: the canvas keeps 400 and the pane narrows to what remains (no narrower than 220). Acceptable?

## What the app would change

- Lock lane composers for completed and cancelling runs (today only cancelled locks) in `ParallelColumnModel.swift`, with the copy chosen.
- Lock graph node and orchestrator composers when the run is cancelled, and the orchestrator composer when it is completed.
- Apply the unsupported form to lane composers (`ParallelVM+MessageLock.swift`).

## Files

- `v2/scripts/states-run-questions.js`, `v2/styles/run-questions.css`, `tests/run-questions.test.mjs`
