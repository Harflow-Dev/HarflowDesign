# Harflow Desktop screen inventory

Interface reference for the redesigned Harflow Desktop client. Open `v2/index.html`, or use deep links of the form `#family/state/theme` (theme is `light`, `dark` or `system`). Every screen is a 1280 by 800 specimen built from the Harflow Desktop design system (classes prefixed `hd-`); the catalog chrome uses the prefix `hdc-`.

All states below were approved by the owner on 2026-11-03 unless a row says otherwise. See [approval.md](decisions/approval.md) for the versions and the way implementations cite them. Dark appearance is covered by the appearance toggle, not by separate states.

Migration intent and unresolved coverage are tracked in the [migration coverage ledger](migration-coverage.md).

## Families and states

| Family | State | Route | Shows |
| --- | --- | --- | --- |
| Needs you | Waiting items | `needs-you/waiting` | Approvals and a question from tasks and workflow runs, answerable in place |
| Needs you | Empty | `needs-you/empty` | Nothing waits for the person |
| Workflows | List | `workflows/list` | Workflows with node count, Edit and Run; no run status |
| Workflows | Empty | `workflows/empty` | No workflows yet and the next step |
| Workflows | Run workflow | `workflows/run` | Task (required), Goal (optional), repository, orchestrator override |
| Workflow editor | Node selected | `workflow-editor/node-selected` | Left-to-right canvas, standalone on-demand nodes, node inspector |
| Workflow editor | Orchestrator settings | `workflow-editor/orchestrator` | Locked orchestrator selected in the Standalone strip; harness, model and access in the inspector |
| Workflow editor | Edit with agent | `workflow-editor/edit-with-agent` | Agent proposal on the canvas, builder activity in the right pane |
| Parallel group | Lanes | `parallel-group/lanes` | One lane per agent, each with its own composer |
| Workflow run | Graph, needs you | `workflow-run/graph-needs-you` | Run graph left to right with a node that needs the person |
| Workflow run | Parallel view | `workflow-run/parallel` | The run's agents as lanes |
| Workflow run | Paused, recovery | `workflow-run/recovery` | Paused run with a failed node and recovery actions |
| Workflow run | On-demand node selected | `workflow-run/on-demand` | Standalone on-demand node inspected with its calls |
| Resources | Slots | `resources/slots` | Slots in use per harness, holders, and tasks waiting for a slot |
| Statistics | Overview | `statistics/overview` | Range selector, headline tiles, tasks per day, per-harness table |
| Settings | General | `settings/general` | Appearance, behaviour, runtime, task store |
| Settings | Harnesses | `settings/harnesses` | Registration, install state and qualification per harness |
| Settings | MCP approvals | `settings/mcp-approvals` | Global tool approvals managed inline |
| Menu bar | Nothing running | `menu-bar/empty` | Empty popover |
| App states | First run, setup | `app-states/setup` | Runtime preparation and harness registration |
| App states | Loading | `app-states/loading` | Connecting to the engine |
| App states | Engine not running | `app-states/engine-error` | Unreachable engine with the fix |
| Brand | One state per brand book section | `brand/<section>` | Principles, brand mark, appearance, content fundamentals, visual foundations, layout, iconography, using the components, not in this system |
| Foundations | Colour, typography, spacing-radius, elevation | `foundations/<name>` | Every design token with light and dark values and usage |
| Components | One state per component | `components/<name>` | Design system components, starting with the cover; each shows its full guideline text below the preview |

The base New task states (`new-task/default`, `harness-menu`, `sidebar-collapsed`), the bottom-layout composer and shell states, the activity transcript states and the base Task states Running, Done, changes pane and Failed were replaced by later designs on the owner's decision. Their routes still open the replacement; see [the decisions record](decisions/README.md#retired-designs) and the [route map](route-map.md).

## Centered and transcript redraws

The owner approved these redraws on 2026-11-08, and the starting state on 2026-11-09; each replaced an earlier state, and the earlier route opens the redraw. See [the decisions record](decisions/README.md#centered-and-transcript-redraws) for the basis of each.

| Family | State | Route | Shows |
| --- | --- | --- | --- |
| New task | Centered composer · Checking options, Unavailable options, Validation, Refused, Task options closed | `new-task/centered-loading`, `centered-unqualified`, `centered-invalid`, `centered-refused`, `centered-options-closed` | Five of the six composer states drawn only in the bottom layout, in the centered layout |
| New task | Centered composer · Starting | `new-task/centered-starting-plain` | The sixth composer state, in the centered layout, with no visible status row under the composer: Start stays disabled and named "Starting task", and "Starting task…" is announced once. Approved 2026-11-09 (decision "Starting row"); it replaced `new-task/centered-starting`, which is retired |
| New task | Centered composer · Harness picker open | `new-task/centered-harness-open` | The centered composer's harness picker open, with a harness that is not available selected. Its Model field is the editable combo of the model picker states (owner amendment, 2026-11-15) |
| Sidebar | Centered shell · Collapsed rail, Minimum window | `sidebar/centered-collapsed`, `centered-minimum` | The shell states with the New task area in the centered layout. The expanded shell is `new-task/centered-empty` |
| Task | Task transcript · Observed activity, Loading observations, Incomplete history, Observation unavailable, Request integrity failure, Reconnect and source change, Reading window at capacity, Normalized and recovered sources | `task/transcript-observed`, `transcript-loading`, `transcript-partial`, `transcript-unavailable`, `transcript-integrity-failed`, `transcript-reconnecting`, `transcript-capacity`, `transcript-sources` | The eight transcript states inside the task screen frame. The right pane opens on Events, with the captured activity sections; open it from the top bar or with `/events` after the route |

## Loading states

Each screen with a first load has one Loading state, drawn from the loaded state it mirrors (see [the decisions record](decisions/README.md#loading-states)). Every loading state in this table is approved. The provisional states that show a known title are listed with the other provisional states ([decisions](decisions/README.md#loading-states-with-a-known-title)).

| Family | State | Route | Mirrors |
| --- | --- | --- | --- |
| New task | Loading | `new-task/loading` | `new-task/centered-empty` |
| Sidebar | Loading | `sidebar/loading` | `new-task/centered-empty`; sidebar rows only, the main area as that state draws it |
| Task | Loading, Loading · Right pane open | `task/loading`, `task/loading-pane` | `task/running-stop`, `task/pane-running-open` |
| Parallel group | Loading | `parallel-group/loading` | `parallel-group/lanes` |
| Needs you | Loading | `needs-you/loading` | `needs-you/waiting` |
| Menu bar | Loading | `menu-bar/loading` | `menu-bar/busy-approve-once`; the request cards are placeholders |
| Workflows | Loading | `workflows/loading` | `workflows/list` |
| Workflow editor | Loading | `workflow-editor/loading` | `workflow-editor/node-selected` |
| Workflow run | Loading, Loading · Parallel view | `workflow-run/loading`, `workflow-run/loading-parallel` | `workflow-run/on-demand`, `workflow-run/parallel` |
| Resources | Loading | `resources/loading` | `resources/slots` |
| Statistics | Loading | `statistics/loading` | `statistics/overview` |
| Settings | Loading · General, Harnesses, MCP approvals | `settings/loading-general`, `loading-harnesses`, `loading-mcp-approvals` | `settings/general`, `harnesses`, `mcp-approvals` |
| Components | Skeleton shimmer | `components/skeleton-shimmer` | The primitive in both appearances and its reduced-motion form |

`sidebar/history-loading` was retired for `sidebar/loading` and opens it. The partial loads (`task/changes-loading`, `events-loading`, `artifacts-loading`, `sidebar/history-older`, `new-task/centered-loading`) and the first-load screens of App states and Harness runtime are unchanged.

## Minimum window

Ten approved states draw five loaded screens and five loading states at 1000 × 620 (see [the decisions record](decisions/README.md#minimum-window)); `menu-bar/busy-approve-once-minimum` is listed below under the 2026-11-15 approval. Each is derived from its loaded state; the loaded states are unchanged. The owner decided the sizes on 2026-11-08 (lanes 360, inspector 288, popover 380, meta drops first) and approved the states the same day, with three fixes: the canvas scrolls, the meta dot is focusable and shows its text on focus, and the wrapped label at 288 is accepted.

| Family | State | Route | Derived from |
| --- | --- | --- | --- |
| Needs you | Waiting · 1000 × 620 | `needs-you/waiting-minimum` | `needs-you/waiting`; the representative drawing of the sidebar rule for every static screen |
| Parallel group | Lanes · 1000 × 620 | `parallel-group/lanes-minimum` | `parallel-group/lanes`; 360 point lanes, the top bar meta drops first |
| Workflow run | Parallel view · 1000 × 620 | `workflow-run/parallel-minimum` | `workflow-run/parallel`; 360 point lanes, the top bar meta drops first |
| Workflow editor | Node selected · 1000 × 620 | `workflow-editor/node-selected-minimum` | `workflow-editor/node-selected`; inspector 288, the canvas scrolls, the top bar meta drops first |
| Workflow editor | Orchestrator · 1000 × 620 | `workflow-editor/orchestrator-minimum` | `workflow-editor/orchestrator`; inspector 288, the canvas scrolls, the top bar meta drops first |
| Needs you | Loading · 1000 × 620 | `needs-you/loading-minimum` | `needs-you/waiting-minimum` with its loading skeleton |
| Parallel group | Loading · 1000 × 620 | `parallel-group/loading-minimum` | `parallel-group/lanes-minimum` with its loading skeleton |
| Workflow run | Loading · 1000 × 620 | `workflow-run/loading-parallel-minimum` | `workflow-run/parallel-minimum` with its loading skeleton |
| Workflow editor | Loading · 1000 × 620 | `workflow-editor/loading-minimum` | `workflow-editor/node-selected-minimum` with its loading skeleton |
| Menu bar | Loading · 1000 × 620 | `menu-bar/loading-minimum` | `menu-bar/busy-approve-once` at 1000 × 620 with its loading skeleton |
| Task | Queued messages, Message delivering, Message delivered, Message cancelled, Send now refused, Delivery uncertain, Messages unavailable, Queued on a finished task | `task/message-queued`, `message-delivering`, `message-delivered`, `message-cancelled`, `message-send-now-refused`, `message-uncertain`, `message-unsupported`, `message-queued-settled` | Approved by the owner, 2026-11-15. The task screen frame with queued-message bubbles and a composer addition; `task/running-stop` or `task/failed-continue` underneath. Decision record: [Queued messages and approval states](decisions/README.md#queued-messages-and-approval-states) |
| Task | Exact action, Approval no longer current, Approval expired, Approval answered elsewhere, Approval response refused, Approval delivery uncertain | `task/approval-exact`, `approval-stale`, `approval-expired`, `approval-answered-elsewhere`, `approval-refused`, `approval-uncertain` | Approved by the owner, 2026-11-15. The approval card of the task screen with one block replaced. `task/approval-exact` replaces `task/approval`, which is retired and opens it; it removes "Approve for this task" |
| Needs you | Approval no longer current, Approval expired, Approval answered elsewhere, Checkpoint no longer current | `needs-you/approval-stale`, `approval-expired`, `answered-elsewhere`, `checkpoint-stale` | Approved by the owner, 2026-11-15. `needs-you/waiting` with one card replaced |
| Harness runtime | Updating | `harness-runtime/updating` | Approved by the owner, 2026-11-15. The runtime update of an already set-up app: the populated sidebar and, in the main pane, the runtime gate with the title "Updating runtime" and the status "Update in progress"; standalone. `harness-runtime/installing-sidebar` is retired and opens it |
| New task | Harness default marked | `new-task/centered-model-default` | Approved by the owner, 2026-11-15. The open harness picker with Cursor selected and its suggestions open; the harness default (`auto`) carries a small "default" tag |
| Menu bar | Approval no longer current, Approval answered elsewhere | `menu-bar/approval-stale`, `menu-bar/answered-elsewhere` | Approved by the owner, 2026-11-15. The Busy popover with its first request replaced |
| Menu bar | Busy, approve once; Busy, approve once · 1000 × 620 | `menu-bar/busy-approve-once`, `menu-bar/busy-approve-once-minimum` | Approved by the owner, 2026-11-15. The popover with work in progress and the request's button named Approve once. `menu-bar/busy-approve-once` and `menu-bar/busy-approve-once-minimum` replace `menu-bar/busy` and `menu-bar/busy-minimum`, which are retired and open them |
| Workflow run | Parallel view, message undeliverable; the same · 1000 × 620 | `workflow-run/lane-message-undeliverable`, `workflow-run/lane-message-undeliverable-minimum` | Approved by the owner, 2026-11-15. `workflow-run/parallel` drawn as a cancelled run: one lane holds an undeliverable message and the lane composers are locked |
| Task | Loading · Title known; Loading · Right pane open · Title known | `task/loading-known-title`, `task/loading-pane-known-title` | Provisional, not approved. `task/loading` and `task/loading-pane` with the known title in the top bar and the loaded sidebar; the approved states stay for a title that is not known yet |
| Parallel group | Loading · Title known; the same · 1000 × 620; Loading · Member count unknown · Title known | `parallel-group/loading-known-title`, `loading-known-title-minimum`, `loading-two-known-title` | Provisional, not approved. Redraws of `parallel-group/loading`, `loading-minimum` and `loading-two` with the group title shown |

Every loading state of the Loading and Minimum window tables, including those at 1000 × 620, is approved; the provisional states that show a known title are not. The orchestrator has no loading state, so it has none at 1000 × 620.

On 2026-11-15 the owner approved the drafts above that were provisional, except the known-title loading states. Three routes are retired and open their replacements: `task/approval` (opens `task/approval-exact`), `menu-bar/busy` (opens `menu-bar/busy-approve-once`) and `menu-bar/busy-minimum` (opens `menu-bar/busy-approve-once-minimum`). The decisions record has the basis.

## Decisions recorded from the owner's feedback rounds

- The Workflows list has no search field (owner decision of 2026-11-15) and shows no run status. The same workflow can run concurrently; runs appear only in the sidebar under Running and Recent work.
- Run workflow collects Task (required) and Goal (optional), plus the repository and an orchestrator override.
- Every canvas shows the zoom control at its bottom-right corner: minus, the current scale, and plus. The editor is drawn at 65%. A run graph drawn at 70% shows 70%. A canvas drawn at full size shows 100%.
- Workflow graphs flow left to right. Connections use the HarflowMac connector style: orthogonal routes with 10px rounded corners and an open chevron arrowhead; loop-back edges are dashed.
- Edit with agent shows the builder conversation in a right-side activity pane, like a run's side pane, not in a bottom split; the canvas centres on the proposed change.
- Standalone on-demand nodes are node cards shown in the editor and on runs; tapping one inspects its calls.
- The Standalone strip always starts with the orchestrator, locked: it cannot be removed and has no connections. Selecting it in the editor opens the orchestrator settings.
- A parallel group is one flat sidebar row with the parallel icon. Its lanes are on its page. It is started only through MCP.
- Approvals and questions are answered inline (transcript, Needs you, menu bar), never in popups.
- The System / Light / Dark toggle sits in the sidebar footer. The collapsed rail shows one button that cycles through the three.
- Dark mode is mid grey (`#2b2b2d`), never near-black.
- The sidebar has no search or filter.
- Task detail has no tabs.
- Council is out of scope and is never shown.
- The menu bar icon is the monochrome blossom template glyph.
- The app icon is the violet blossom squircle.

## Fidelity and limits

The reference is a browser rendering of the design system with deterministic mock data. Native materials, window controls, platform menus and text rasterisation are approximations. Interactions are limited to navigation between specimens and the appearance controls; composers do not submit. Browser checks were performed on this reference; no native or Electron implementation exists to compare against yet.

<a id="pending-launch-discovery-provisional"></a>

## Pending-launch discovery

The 21 `task/pending-*` states are **approved by the owner on 2026-11-10**, pinned at `83d820f57e6ec2d82cccd3a1e335128332fdb672`: inventory, loading, empty, failed, incomplete, waiting, preparing, preparing-handshake, granted, not-started, unavailable, missing, recorded, handoff-failed, stop-confirm, stop-confirm-minimum, stop-requested, stop-requested-minimum, stop-uncertain, stop-refused and waiting-minimum. See [the decision record](decisions/pending-launch-discovery.md) for exact routes, approval, API mapping, copy and limits. They draw separate launch selection before a task record, including resource-free preparation without Stop support. Existing approved `task/pending` is preserved. Both appearances and the provided 1000 × 620 routes are included. Browser checks covered all 21 states; the sample sidebar has one clock-icon navigation item and no overflow. Sparse fixture history does not truncate production history or disable actual overflow. Native fidelity, VoiceOver and real ctl integration remain unverified.

## Model picker states

The six states `new-task/centered-model-loading`, `centered-model-unavailable`, `centered-model-not-installed`, `centered-model-truncated`, `centered-model-empty` and `centered-model-default` are **approved by the owner on 2026-11-15**. Each opens the harness picker of the centered composer with the Model field as an editable combo of the engine's suggested models (`backend-models.v1`) and one note for the listing state; the field accepts any model name in every state. A suggestion the harness reports as its default carries a small "default" tag. See [the decision record](decisions/README.md#model-picker-states) for the copy and what the app must change.

<a id="parallel-group-lane-decisions-provisional"></a>

## Parallel group lane decisions

The 25 states `parallel-group/lanes-titled`, `lane-menu-open`, `prompt-shown`, `cancel-all-confirm`, `lanes-settled`, `lane-failed`, `lane-cancelled`, `lane-taken-over`, `lane-activity-unavailable`, `lane-history-boundary`, `lane-messages-queued`, `lane-message-delivering`, `lane-message-uncertain`, `lane-message-cancelled`, `group-empty`, `two-lanes`, `loading-two`, `lanes-titled-minimum`, `lane-menu-open-minimum`, `prompt-shown-minimum`, `cancel-all-confirm-minimum`, `lanes-settled-minimum`, `lane-cancelled-minimum`, `lane-failed-minimum` and `group-empty-minimum` are **approved by the owner on 2026-11-12**, pinned at `2153ab1d963709d8fbe77cd0bfd678292202a863`. They apply the owner's decisions of 2026-11-12 (task titles, an "Open task" lane menu, a Send-only lane composer, the approved top bar) and draw the lane and group states the approved family never covered. See [the decision record](decisions/parallel-group-proposal.md) for approval, native citations, defaults and owner answers. The four earlier approved `parallel-group` states are unchanged. The "Available captured history" line is not drawn in `lane-history-boundary`. Browser inspection was done in light and dark; native and VoiceOver checks are outstanding.

## Workflow and capacity states

Approved by the owner on 2026-11-15, except the six states marked provisional below, which were drawn on the owner's answers and have not been seen by the owner. Each state derives from an approved template. The basis, copy sources, undrawn states and the owner's decisions are in the [decision record](decisions/README.md#workflow-and-capacity-states). The owner dropped the search field from the Workflows list the same day.

- Workflow editor, Validation and saving: `workflow-editor/checking`, `invalid`, `validate-unavailable`, `name-required`, `missing-child`, `missing-child-paths`, `missing-child-replace`, `conflict`, `conflict-unreadable`, `save-failed`, `load-failed`, and provisional `discard-confirm`.
- Workflow editor, Edit with agent: `workflow-editor/agent-request`, `agent-starting`, `agent-working`, `agent-failed`, `agent-cancelled`, `agent-canvas-changed`.
- Workflow editor, More actions: `workflow-editor/more-actions`, `more-actions-unsaved`, `delete-confirm`, `delete-failed`, and provisional `delete-confirm-saved`.
- Workflow editor, Generate: `workflow-editor/generate-starting`, `generate-working`, `generate-ready`, `generate-failed`.
- Workflows, New workflow: `workflows/new-menu`, `generate`, `generate-refused`, `generate-uncertain`, and provisional `generate-builder-options`.
- Workflow run, Messages and goal: `workflow-run/orchestrator-selected`, `orchestrator-steering-open`, `orchestrator-steering-unavailable`, provisional `orchestrator-steering-waiting`, `orchestrator-steering-cancelling` and `orchestrator-steering-unknown`, `node-message-queued`, `node-message-refused`, `node-message-unavailable`, `messages-unsupported`, `revise-goal`, `goal-revised`, `revise-goal-unavailable`, `revise-goal-answered-elsewhere`, `revise-goal-failed`.
- Resources, Resource states: `resources/not-enabled`, `unsupported`, `unavailable`, `unavailable-permission`, `empty`, `stale`, `over-capacity`.
- Statistics, Statistics states: `statistics/empty`, `error`, `stale`, `partial-accounting`, `all-time`, `unsupported`.
