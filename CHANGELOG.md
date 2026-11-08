# Changelog

## Unreleased

- Approve the 11 minimum window states of the `v2/` reference (decision "Minimum window") on the owner's decision of 2026-11-08, with three fixes: the canvas scrolls, the meta dot is keyboard-focusable and shows its text on focus, and the wrapped "On-demand calls per decision" label at 288 is accepted. The six loaded states (`needs-you/waiting-minimum`, `parallel-group/lanes-minimum`, `workflow-run/parallel-minimum`, `workflow-editor/node-selected-minimum`, `workflow-editor/orchestrator-minimum`, `menu-bar/busy-minimum`) and the five loading states at 1000 × 620 (`needs-you/loading-minimum`, `parallel-group/loading-minimum`, `workflow-run/loading-parallel-minimum`, `workflow-editor/loading-minimum`, `menu-bar/loading-minimum`) are now approved.

- Scroll the workflow graph canvas and make the top bar meta focusable in the minimum window drafts of the `v2/` reference, on the owner's decision of 2026-11-08: the graph of `workflow-editor/node-selected-minimum`, `workflow-editor/orchestrator-minimum` and `workflow-editor/loading-minimum` scrolls in its own viewport with a visible scrollbar and keyboard access, and the dot of the top bar meta on the lane screens, the editor and the orchestrator takes focus and shows the dropped text on hover and focus (Escape dismisses it). The lane screens and the orchestrator gain one empty decorative dot.

- Add `workflow-editor/orchestrator-minimum` and five loading drafts at 1000 × 620 (`needs-you/loading-minimum`, `parallel-group/loading-minimum`, `workflow-run/loading-parallel-minimum`, `workflow-editor/loading-minimum`, `menu-bar/loading-minimum`) to the `v2/` reference, all provisional. The 12 point overflow of the orchestrator frame (a visually hidden label outside the frame) is removed by the inspector fix of the previous entry, which makes the inspector body contain its hidden labels; that change landed with the sizing decisions, not with this entry. The loading drafts apply the minimum fixes and then the loading skeleton; the lane and editor drafts use minimum variants of the approved skeleton specs that leave the top bar meta out. The approved states are unchanged.

- Apply the owner's sizing decisions of 2026-11-08 to the minimum window drafts: the editor inspector is 288 points wide (the canvas gains 52), the popover is 380 wide, and on the lane screens the top bar meta drops first so the title stays whole. The lane floor stays 360. The drafts stay provisional; the approved states are unchanged.

- Add five provisional minimum window drafts to the `v2/` reference, drawn at 1000 × 620 from their loaded states: `needs-you/waiting-minimum` (the sidebar's fixed header and footer with one scrolling body, for every static screen), `parallel-group/lanes-minimum` and `workflow-run/parallel-minimum` (360 point lanes that scroll horizontally), `workflow-editor/node-selected-minimum` (the top bar drops its meta text first) and `menu-bar/busy-minimum` (a 560 point popover with scrolling sections). The loaded states are unchanged. Not approved: owner questions are in the decisions record.

- Approve the 15 loading states and the `components/skeleton-shimmer` primitive of the `v2/` reference on the owner's decision of 2026-11-08 (`sidebar/loading` was approved earlier the same day). The catalog strip of each loading route now shows its own decision. The design is unchanged. The Mac differences and the 1000 × 620 gaps recorded in the decisions record stand.

- Fix the loading states after review: `sidebar/loading` shimmers sidebar rows only; blocked actions are `aria-disabled` while the sidebar toggle works in the New task and Sidebar loading frames; the fallback disclosure of the workflow editor is replaced instead of left unnamed; the Resources, Statistics and MCP approvals patterns no longer follow fixture shapes; the loading label is no longer counted as content.

- Add loading states to the `v2/` reference: `new-task/loading`, `sidebar/loading`, `task/loading`, `task/loading-pane`, `parallel-group/loading`, `needs-you/loading`, `menu-bar/loading`, `workflows/loading`, `workflow-editor/loading`, `workflow-run/loading`, `workflow-run/loading-parallel`, `resources/loading`, `statistics/loading`, `settings/loading-general`, `loading-harnesses` and `loading-mcp-approvals`, plus the `components/skeleton-shimmer` primitive and the `--skeleton-sheen` token. Each is drawn from its loaded screen (`HFV2.skeletonize`, patterns and chrome allowlists in `v2/scripts/skeleton-specs.js`) with shimmering blocks in the data regions and real chrome; the sweep is 1.4 s and static under reduced motion. `sidebar/loading` is approved (owner, 2026-11-08, option B) and retires `sidebar/history-loading`, which now opens it; the other states are provisional. Families without state groups gain a group named for the screen and a Loading group. Static families are drawn at their native frame; the loaded-screen gaps found at 1000 × 620 are listed in the decisions record.

- Approve the 16 centered and transcript redraws of the `v2/` reference (added as provisional states earlier in this release) on the owner's decision of 2026-11-08 and retire the 18 earlier states they replace: the bottom-layout composer states (`new-task/composer-loading`, `composer-unqualified`, `composer-invalid`, `composer-starting`, `composer-refused`, `options-closed`), the shell states (`sidebar/expanded`, `collapsed`, `minimum` and the duplicate `sidebar/centered-expanded`) and the eight `task/activity-*` states. Each old route opens its replacement, and the eight transcript routes keep their Events view. `new-task/sidebar-collapsed` now opens `sidebar/centered-collapsed`. The four Events elements of the transcript routes are approved. `HFV2.pendingRedraw` is empty.

- Add `new-task/centered-harness-open`: the centered composer's harness picker open, with an unavailable harness selected so that Start is disabled and the existing qualification message shows. `new-task/harness-menu` opens it.

- Route hashes are now `#family/state[/view][/appearance]`; a state declares the views it has (the eight transcript routes declare `events`, which opens the right pane on Events at load, for example `#task/transcript-observed/events/dark`), and a view a state does not declare is dropped. The task screen renderer takes optional hooks for its transcript column, Events body and task identity, and the transcript regions are built by shared builders and one controller; the existing routes are unchanged.

- Remove the unused activity transcript mount, wrapper templates and guides (`d2b-proposal/*`); the transcript routes keep the shared builders and controller.

- Retire nine superseded `v2/` states on the owner's answers of 2026-11-08: `task/running`, `task/done`, `task/failed`, `new-task/default`, `new-task/sidebar-collapsed`, `new-task/harness-menu`, `new-task/composer-ready`, `new-task/composer-unknown` and `new-task/options-open`. They leave navigation and their routes redirect to the replacement states (`routeRedirects`). The "Earlier design" note and the awaiting-decision label are removed, and the overview lists the replaced designs. `task/activity-sources` is unchanged pending an owner decision (superseded: it now opens `task/transcript-sources`).

- Archive the v1 catalog at `archive/v1/` (with its documents) and make the root `index.html` a redirector: no hash opens `v2/index.html`, a hash opens the archived catalog with that hash, and the old v1 paths forward to `archive/v1/` (`_redirects` on the hosted site). The build script runs every test file and stages `archive` and `_redirects`.

- Reorganise the `v2/` catalog by area, screen and state group, with an overview as the default page. Interactive task, entry, sidebar and runtime states join the screens they belong to, and the catalog no longer shows milestone or process names. Every earlier route still opens the same design through `v2/scripts/route-aliases.js`; `v2/docs/route-map.md` lists them. States carry their own status and approval. The failed task state is superseded by the Continue in a new session state; other possible replacements stay listed and are labelled as awaiting a decision.

- Move the approval records and proposals to `v2/docs/decisions/` and add an index with status, approver, date, recording commit, routes and files.

- Show the zoom control at the bottom-right of every `v2/` canvas. Workflow run graphs drawn at 70% read 70%; the recovery graph and the workflow-node specimen, drawn at full size, read 100%. The editor stays at 65%.

- Show the locked orchestrator as the first card of every Standalone strip in the `v2/` workflow editor and run screens; selecting it opens the orchestrator settings.

- Add the design system foundations (colour, typography, spacing, radius and size, elevation), the brand book and the full component guidelines to the `v2/` interface reference, so the repository alone holds the complete design system.

- Add the Harflow Desktop interface reference as a self-contained `v2/` site (`v2/index.html`): 30 screen states in 12 families (new task, Needs you, workflows, workflow editor, task, parallel group, workflow run, resources, statistics, settings, menu bar, app states) and 29 design system components, each with System, Light and Dark appearance, deep links of the form `#family/state/theme`, and docs for the screen inventory, terminology and approval. Approved by the owner on 2026-11-03 from the Harflow Desktop Redesign canvas version 1793668079-d8d9 and design system version 1793668064-9e04. The site build moves to `ci/build-site.sh`, which also runs the new `tests/v2.test.mjs`.

- Propose a Statistics shimmer skeleton (`statistics/loading`) and the empty, error, unsupported and refreshing handoff states for HarflowMac #41. The time range and filters are shimmer blocks. Each block has one highlight inside its shape, and the chart has no second sweep across the bars. Not approved.

- Approve queued messages as pinned transcript bubbles, replacing the strip above the composer, in the work-interaction reference for HarflowMac #42. Approved by the owner on 2026-10-29.

- Remove the workflow builder composer from the workflow window (HarflowMac #43): the work-interaction reference no longer offers a Workflow editor surface. Builder tasks start from Generate or Edit with agent; an embedded builder task keeps its own composer (`workflow-editor/builder-conversation`). Requested by the owner on 2026-10-29.

- Add an exploratory `statistics/chart-hover` state (#9): a hover card on the daily chart showing the day's date, total, and workflow and task values for the selected measure, pinned on the highest-total day, replacing the native per-bar tooltip; keyboard behaviour is an open question.

- Add the approved start screen to the main window in place of the empty "Select a task" detail: a time-of-day greeting, a status line, New session and New workflow actions, and the three most-run workflows with a no-workflows variant. New `tasks/start` and `tasks/start-no-workflows` states; the empty, loading, list error, no results, and harness-empty states and the sidebar proposal states show it too. Ported from design-system canvas version 1793071559-4004.

- Match the Harflow web sidebar and title bar to the canvas boards: per-board sidebars, the Hide sidebar button, New session, search and harness filter, status marks and harness dots, the appearance control and Settings footer, and a centred Harflow brand with the Connected indicator, all built without macOS sidebar actions or fixtures.

- Clarify in the exploratory Start inspector that the setup command is reviewed each time you start the workflow yourself, because command review applies to manual launches only.

- Add an exploratory Harflow web family (HarflowWeb#1, HarflowWeb#2): the workflow Triggers tab, a trigger editor with a local draft, the Incoming delivery log with filters and an inspector, and a failed run with Run again. The catalog groups families under macOS and Harflow web, sets the eyebrow per platform, and accepts HarflowWeb ticket references.

- Add exploratory setup and teardown run states (`setup-running`, `setup-failed`, `teardown-pending`) with a run pane for the setup or teardown command, output and Command disclosure, a mock Run teardown, and Run again.

- Add exploratory workflow setup and teardown proposals: Setup and Teardown commands on the Start and End inspectors (`start-setup`, `start-new-folder`, `end-teardown`) and a Run sheet command review (`workflow-launch/setup-review`) that keeps Run disabled until the commands are reviewed, shown without a native source.

- Show the Harflow app icon beside the catalog title and as the browser tab icon, using PNGs exported from HarflowMac `macos/Harflow/Resources/AppIcon.icns`.

- Add a Harnesses option to the exploratory Statistics ranked list, with executions and model count per harness and a model drill-down, and move the reference to canvas version 1792893875-1b6a.

- Revise the exploratory Council configuration and run activity to the new canvas design: named members with instructions as accordion cards, optional members that never block consensus, read-only limits, name and required-count validation, a labelled feed with a members roster, and consensus, member-left, and failed outcome states; editable limits, structured output, routing, and the Go to outcome link are removed.

- Revise the exploratory Statistics family to the new design: the Total time or Usage measure, a daily stacked chart, ranked workflow and task lists with run and turn drill-down, and a node breakdown page replace the totals tiles, cost, and empty state; dates are fixed and UTC-based.

- Validate every Council limit, add structured output and routing controls, open Rename with the clicked workflow's name, and tighten proposal accessibility, emblem tinting, and Statistics fixtures.

- Add an exploratory Statistics family with overview and empty states and a sidebar entry, shown without a native source link.

- Add exploratory starred workflows in the Run Workflow chooser and the Council run activity feed, and route the sidebar Rename action to the editor rename dialog.

- Add exploratory workflow editor proposals for rename, standalone node reordering, the Council node configuration, and the readiness report, and fix standalone card order and layout.

- Add exploratory sidebar proposals for the header appearance control, starred workflows, and the context menu with delete confirmation.

- Align shipped Settings and setup specimens with the native app: the main-window titlebar emblem, the scrolling setup card, the General Task store group with native recovery states, runtime retry copy, and Harnesses row labels.

- Label exploratory ticket proposals from registry metadata with one caption helper, state picker and search suffix, and an in-stage label, and mark compact-sidebar run states as containing an exploratory element.

- Match native icon-only Light/Dark/System controls and titlebar connection status; separate catalog preview appearance from the locally persisted app preference.

- Share native rounded connector geometry, open arrowheads, backward dashes, and zoom scaling between workflow editor and run.

- Calibrate workflow run layouts and states against native mocks; preview compact default and full-width selected Activity sidebars.
- Establish a canonical product glossary for Harness, Agent, Node, Session, and related design terminology.

- Align workflow editor states, inspectors, launch sheets, and canvas layout using native fixture comparisons.
- Align standalone parallel groups with native headers, lane status strips, actions, results, and adaptive lane widths; add fresh native mock references in both appearances.
- Present approval actions and optional supplied descriptions in readable form instead of raw JSON.
- Preview caller-owned approval responses in the Mac design, with a separate read-only compatibility state.
- Match approval requests to native panel references and retain the shared task context across Activity, Summary, and Prompt.
- Align task Summary and Prompt with native references and share their panes across task-detail tabs and catalog entry points.
- Added an offline, editable source-derived HarflowMac interface catalog.
- Added shared HfUI colors, typography, geometry, screen states, pinned source links, and mock interactions.
- Added source coverage and fidelity documentation with native foundation references.
- Calibrated workflow, task, dialog, settings, and menu layouts using native SwiftUI fixture references.
- Corrected sidebar workflow symbols, status-symbol cutouts, tree guides, group layout, and search contrast against fresh native mock captures.
- Calibrated task activity against native rich-feed captures, including grouped tools, prompt disclosure, composer eligibility, and terminal/takeover states.
