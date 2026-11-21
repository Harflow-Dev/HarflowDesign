# Task conversation composer edge

Status: **Approved on 2026-11-21.** The owner reviewed the composer edge
and confirmed that it applies to Parallel tasks and to tasks inside a
workflow as well as standalone Task Detail. The approved drawings are
pinned to `f345556ae3f36c6ba3ded013f272fc096c83d585`,
`v2/scripts/states-composer-edge.js` and `v2/styles/composer-edge.css`.
The pinned preview still carries its original provisional labels.

Use a 4-point inset immediately above the fixed composer where the task
surface had an 8- or 12-point inset. The composer stays anchored even in a
short conversation. A 16-point fade softens the bottom of the activity
viewport while more content remains below. At the end or in a short feed,
the fade clears so the last message and its actions are fully visible.
The decoration is outside the accessibility and hit-test paths. The
composer, action controls and any separate approval area keep their own
layout and remain clear of the fade. The fixtures use each surface's own
background and existing control styling.

| Route | Draws |
| --- | --- |
| `task/composer-edge`, `task/composer-edge-minimum` | Standalone task with enough activity to scroll. The feed fades only while content continues below. |
| `task/composer-edge-end`, `task/composer-edge-short` | A feed at its last message and a short conversation. Both leave the composer anchored and the last line clear. |
| `task/composer-edge-embedded` | The conversation column shared by group and embedded task detail, based on `task/running-stop` with surrounding host chrome omitted. |
| `parallel-group/composer-edge`, `parallel-group/composer-edge-minimum` | The task lane and its fixed composer in a Parallel group. |
| `workflow-run/composer-edge-parallel`, `workflow-run/composer-edge-parallel-minimum` | The same boundary in a workflow task lane. |
| `workflow-run/composer-edge-graph`, `workflow-run/composer-edge-graph-minimum` | Selected on-demand worker, based on the approved `workflow-run/node-message-queued` route. |

## Sources

- HarflowDesign `8312376c6891c414fb1fe24d9e27630d13c91614` includes
  approved Task Detail composer and message states, registered in
  `v2/scripts/screens-m05-proposal.js` and `v2/scripts/screens-messages.js`,
  rendered by `v2/scripts/m05-proposal.js` and `v2/scripts/messages-screen.js`.
- Parallel Group lane designs are pinned to
  `2153ab1d963709d8fbe77cd0bfd678292202a863`.
  `v2/scripts/states-parallel-lanes.js` holds the lane variants.
  Workflow Graph and Parallel use `v2/scripts/screens-workflow-run.js`,
  `v2/scripts/states-run-actions.js` and `v2/scripts/screens-minimum.js`.
- HarflowMac `47e055fac2eda42b4d5bd50dcca2440495006b89` uses
  `TaskDetail/TaskDetailView+Activity.swift` for the shared task activity and
  composer boundary and `Parallel/Component/ParallelColumnView.swift` for
  lane and inspector layout, both under `MainWindowFeature`.

The treatment covers task conversation feeds. The separate root
steering approval and workflow builder layouts retain their current design
records. Browser fixtures use synthetic data. Links in the Parallel and
Graph companions open the original interaction specimens. Native inset,
focus, scroll edge behavior and disabled appearance require their own
verification.
