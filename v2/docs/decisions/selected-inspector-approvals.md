# Inline approvals in the selected workflow inspector

**Provisional drawings.** On 2026-11-21 the owner chose expandable
approval cards in the selected workflow inspector's main scroll, with
each request's details and buttons together and no inner scrolling.
The owner also reaffirmed the bottom edge fade above the task composer.
The exact drawing approval will be recorded here.

The selected task header and existing composer remain anchored.
The goal, call or activity content and approval cards share one
vertical scroll body. Each card discloses its exact request, action
fields and decision controls in that body. Long commands wrap and
extend the card. Expanding one request does not collapse a different
request. Scrolling the pane reaches the whole request and its controls.

The 4-point composer boundary and 16-point conditional fade follow
the approved [task composer edge](task-composer-edge.md). Clear the fade
when the feed has reached its end or keyboard focus is inside the feed.
A queued message stays with the fixed composer, below the fade. The
blank task composer hides Send now. The browser specimen presents the
blank state and leaves typed-draft behavior to the native composer.

The composer uses the approved edge from
`f345556ae3f36c6ba3ded013f272fc096c83d585`,
`v2/scripts/states-composer-edge.js`, `workflow-run/composer-edge-graph`.
The inspector shell comes from `workflow-run/graph-needs-you` or
`workflow-run/node-message-queued`. The retained steering companion
reuses the history and reply from `workflow-run/orchestrator-steering-waiting`.
The root approval reference is `5539168eee43429edc2267f2a9402daf5f9a2d15`,
`v2/scripts/states-root-approvals.js`, approved in `8312376`.
HarflowMac `47e055fac2eda42b4d5bd50dcca2440495006b89` supplies
`macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowSelectedSidebar.swift`
and the long-command fixture in
`macos/HfFeatures/MainWindowFeature/Tests/MainWindowFeatureTests/Workflow/WorkflowRunSidebarHostedTests+Approval.swift`.

The steering companion selects the Orchestrator. Its retained activity
and task-scoped requests belong to the Orchestrator's own agent task.
The run-scoped requests belong to its workers. Both groups share the
pane scroll with the retained activity and steering history.
The root reply is the only footer while steering is open. Dismiss
follows the run-scoped approvals inside the pane. Root reply retains
its own eligibility. Task and run actions remain backed by their
separate controllers.

The browser uses synthetic commands and decisions. A mock decision
uses the approved `Answered in Harflow · {decision}` form, replaces the
acted-on controls in place and focuses the result. Browser disclosure,
the scroll indicator and edge painting approximate the native views.
The retained native activity table must own the inspector scroll.
Native resize, keyboard access and request routing require hosted
verification.

| State | Route |
| --- | --- |
| One request, composer-free | `workflow-run/inspector-approvals-single` |
| Five requests, one expanded | `workflow-run/inspector-approvals` |
| Multiple expanded requests with long commands | `workflow-run/inspector-approvals-expanded` |
| Settled request | `workflow-run/inspector-approvals-settled` |
| Retained task with root steering open | `workflow-run/inspector-approvals-steering` |

Each route has a `-minimum` variant for 1000 × 620.
