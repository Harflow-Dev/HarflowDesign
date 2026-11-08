# Harflow Desktop screen inventory

Interface reference for the redesigned Harflow Desktop client. Open `v2/index.html`, or use deep links of the form `#family/state/theme` (theme is `light`, `dark` or `system`). Every screen is a 1280 by 800 specimen built from the Harflow Desktop design system (classes prefixed `hd-`); the catalog chrome uses the prefix `hdc-`.

All states below were approved by the owner on 2026-11-03. See [approval.md](decisions/approval.md) for the versions and the way implementations cite them. Dark appearance is covered by the appearance toggle, not by separate states.

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
| Task | Waiting for approval | `task/approval` | Inline approval card in the transcript |
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
| Menu bar | Busy | `menu-bar/busy` | Popover with requests answered inline, running and recent work |
| Menu bar | Nothing running | `menu-bar/empty` | Empty popover |
| App states | First run, setup | `app-states/setup` | Runtime preparation and harness registration |
| App states | Loading | `app-states/loading` | Connecting to the engine |
| App states | Engine not running | `app-states/engine-error` | Unreachable engine with the fix |
| Brand | One state per brand book section | `brand/<section>` | Principles, brand mark, appearance, content fundamentals, visual foundations, layout, iconography, using the components, not in this system |
| Foundations | Colour, typography, spacing-radius, elevation | `foundations/<name>` | Every design token with light and dark values and usage |
| Components | One state per component | `components/<name>` | Design system components, starting with the cover; each shows its full guideline text below the preview |

The base New task states (`new-task/default`, `harness-menu`, `sidebar-collapsed`) and the base Task states Running, Done, changes pane and Failed were replaced by later designs on the owner's decision. Their routes still open the replacement; see [the decisions record](decisions/README.md#retired-designs) and the [route map](route-map.md).

## Provisional redraws

Seventeen states are redraws that await the owner's approval. Each earlier state stays listed with a link to its redraw. See [the decisions record](decisions/README.md#provisional-redraws-awaiting-owner-review) for the source, basis and owner question of each.

| Family | State | Route | Shows |
| --- | --- | --- | --- |
| New task | Centered composer · Checking options, Unavailable options, Validation, Starting, Refused, Task options closed | `new-task/centered-loading`, `centered-unqualified`, `centered-invalid`, `centered-starting`, `centered-refused`, `centered-options-closed` | The six composer states drawn only in the bottom layout, in the centered layout |
| Sidebar | Centered shell · Expanded, Collapsed rail, Minimum window | `sidebar/centered-expanded`, `centered-collapsed`, `centered-minimum` | The shell states with the New task area in the centered layout. `centered-expanded` draws the same window as `new-task/centered-empty` |
| Task | Task transcript · Observed activity, Loading observations, Incomplete history, Observation unavailable, Request integrity failure, Reconnect and source change, Reading window at capacity, Normalized and recovered sources | `task/transcript-observed`, `transcript-loading`, `transcript-partial`, `transcript-unavailable`, `transcript-integrity-failed`, `transcript-reconnecting`, `transcript-capacity`, `transcript-sources` | The eight activity transcript states inside the task screen frame. The right pane opens on Events, with the earlier side pane sections; open it from the top bar or with `/events` after the route |

## Decisions recorded from the owner's feedback rounds

- The Workflows list shows no run status. The same workflow can run concurrently; runs appear only in the sidebar under Running and Recent work.
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
