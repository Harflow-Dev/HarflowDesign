# Task Detail and workflow approvals

Status: **Approved by the owner on 2026-11-21.** The owner approved the
drawings at `5539168eee43429edc2267f2a9402daf5f9a2d15` and authorized
native implementation. This approval covers the routes below and their
minimum variants. The pinned preview carries its original review labels.
Each route has a `-minimum` twin at 1000 × 620 and is available in both
appearances. The regular specimens are 1280 × 800. Use synthetic data for
all content and prototype interactions.

| Route | Draws |
| --- | --- |
| `task/changes-inline` | A file row expands its stored diff directly above the next file. Same-path rows in distinct scopes disclose separate payloads. Name-only and non-text rows show their recorded state. |
| `task/events-result-usage` | Reported result and usage follows the pane insets and expands to its full content height inside the Events scroll area. |
| `task/events-usage` | Reported usage for a task whose transcript already contains Summary. |
| `task/running-composer-empty` | Icon-only Stop in the trailing slot of the running task composer, with the existing confirmation. |
| `task/running-composer-draft` | Queued Send in the same slot. Send now appears while the task is running, the current runtime supports messaging and the trimmed draft contains text. |
| `workflow-run/root-approval-single` | One expanded worker approval request in the right pane, after conversation history and before Dismiss. |
| `workflow-run/root-approval-five` | Five issued worker approvals, with one expanded. |
| `workflow-run/root-approval-several` | Five issued worker approvals with several expanded, including long request details. |

Changes disclosure uses native keyboard focus and keeps row identity scoped
to the task turn, repository, scope and file paths. The toolbar can reveal
an Events section by pointer without moving keyboard focus. Keyboard reveal
moves focus to the section summary. The content scrolls with Events. Reported
metrics retain current-run provenance and omit unavailable values or use the
existing unavailable wording.

Empty or whitespace-only text hides Send now. Submitting an empty draft
from the textbox does nothing. Activating the focused Stop button opens
the confirmation. Cancel returns focus to the trailing slot and retains the
draft. The icon-only Stop and draft-dependent Send now are proposed changes
for standalone running tasks. See the existing [queued message states](README.md#queued-messages-and-approval-states)
for refusal and unsupported messaging.

Each expanded workflow request contains its issuer, details and its own
Approve once and Reject actions. Several requests can remain expanded.
The conversation and approvals share one scrolling body with Dismiss.
The heading and composer stay outside it. A positive reported steering
eligibility enables the fixture's reply control independently of approval
authority. The illustrated requests belong to issued worker tasks.

## Source and scope

- Approved reference at HarflowDesign `70d94ef16173b7f48bc72d4930949f3df0b0b7cd`.
  Task references `task/changes-single`, `task/events-populated` and
  `task/running-stop` are rendered by `v2/scripts/m05-proposal.js`.
  Workflow reference `workflow-run/orchestrator-steering-waiting` is
  rendered by `v2/scripts/states-run-actions.js`. The new specimens use
  the approved `workflow-run/topbar-no-more` treatment from
  `v2/scripts/states-run-questions.js`. The approval card styling follows
  `v2/scripts/screens-approval-states.js`.
- HarflowMac `47e055fac2eda42b4d5bd50dcca2440495006b89`, under
  `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/`.
  `Changes/TaskChangesTabView.swift` shows current file selection and diff
  placement. `Pane/FactsGroupView.swift` and `Pane/TaskEventsTabView.swift`
  show the focus transfer and its AppKit focus ring.
  `Component/SummaryPaneView.swift` shows the reported-result layout and
  provenance. `TaskDetailVM+Actions.swift` defines the running and
  messaging eligibility for Send now.
- HarflowMCP `a891388b`, `src/harflow_mcp/workflow_steering.py:173–195`
  and `src/harflow_mcp/orchestrator_steering.py:227–242,694–699` define
  the independent steering reply and worker approval authorities.

The drawings are companions to the earlier approved routes. AppKit focus behavior,
native minimum-window controls, exact approval dispatch and native task
composer transitions require separate validation after design approval.
