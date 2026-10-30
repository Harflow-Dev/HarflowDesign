# Needs you proposal - HarflowMac #30

Status: exploratory, not approved. Specimen: [features/needs-you.html](../features/needs-you.html), with [script](../features/needs-you.js) and [style](../features/needs-you.css). It is offline, uses invented deterministic fixtures, and never contacts an engine or sends an answer.

Goal: show every pending user input in the Mac app, whoever started the run, and let the user answer when the engine confirms that is permitted.

## Surfaces and state ids

| Surface | State ids |
|---|---|
| Sidebar entry and list (`list`) | `populated`, `single`, `empty`, `loading`, `error` (partial results with a notice), `older` (no `interaction_state`) |
| Request detail and answer (`detail`) | `answerable`, `handed-over`, `waiting`, `unknown`, `handed-live`, `submitting`, `answered`, `expired`, `refused`, `recovery`, `very-long`, `older`; Request kind control selects Question or Approval |
| Notification (`notify`) | `question`, `approval`, `recovery`, `waiting`, `grouped` |
| Menu-bar extra (`menubar`) | `populated` (shows 3 of 8), `few`, `empty`, `older` |

Controls outside the specimen: Surface, State, Request kind, Width (1000, 1200, 1440), Appearance (Light, Dark), Reduce Motion, Reset. Fixture buttons stand in for the engine (accept, refuse because the caller returned, refuse because the checkpoint changed, expire, caller ended). Reset restores the list surface, 1000 width, and all fixture data; it keeps Appearance and Reduce Motion as viewing preferences. No timers other than the 180 ms fade exist.

## Design summary

- A Needs you row sits above Running in the sidebar with a count badge. Selecting it shows a list in the detail pane, ordered oldest first. Each row shows the kind (Approval, Question, Recovery), run title, the path to the node (for example Release checklist > Choose deployment target, or three levels for a child workflow), who started it, caller status (Connected, Ended, Unknown), age, and the full request text. Text longer than about 180 characters is clamped to three lines with Show more.
- Detail shows the full request, never truncated; text over about 900 characters is clamped to ten lines with Show more. Pending answerable requests use the existing approval card look: uniform warning outline and tint, no left stripe, always expanded, Approve once and Reject for approvals. Read-only and settled requests use the neutral card. A provenance block lists run, path, started by, caller, owner, age, engine note and any handover record.
- Answering when the caller has ended states that the run passes to Harflow and the original caller can no longer answer, and that the engine rechecks on submit. A refusal keeps the typed answer. If the caller returned, the request becomes read-only and the unsent answer remains visible; if the checkpoint changed, the answer stays editable.
- Answered requests fade out in 180 ms (immediate under Reduce Motion or the system setting), leave the list, and the badge count drops. The handed-over-live transition fades a status notice in with the same rule.
- Notification banner: app icon, Harflow, title `<Kind>: <run title>`, body with the first line of the question or the approval action and target. Waiting-for-caller requests also notify, with a subtitle saying who they wait for. A grouped banner lists several. Selecting a banner opens that request, or the list for a group.
- Menu-bar extra: a Needs you section with the count and up to 3 rows, Show all opens the list, and empty and older-engine variants.

## Source basis

HarflowMac pinned at `da2f4cab79e5b9240b250857cbb783a3a83e16fe` (read-only):

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Sidebar/SidebarSection.swift` and `SidebarView.swift`: sections Running, Today and Earlier; Needs you is a new row above them.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/CallerApprovalController.swift` and `CallerApprovalCard.swift`: current caller-owned approvals are read-only text unless the engine supports Monitor responses; the pending card look (warning fill and outline), Approve once, Reject.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowModels.swift`: caller-controlled runs; `allowsMonitorControl` is false when `interaction_owner` is `caller`, and child runs defer to the root.
- `macos/HfFeatures/MenuBarFeature/Sources/MenuBarFeature/`: the popover sections (running rows, recent items, workflow rows); the Needs you section is new.
- `macos/HfCore/HfRepository/Sources/HfRepository/FinishNotifier/`: existing finish notifications (title and body only).

Engine contract: HarflowMCP 0.0.5, `docs/contracts.md` section "Caller loss and workflow interaction handover" and fixture `contracts/v1/ctl-workflow-interaction-handover.json`.

## Engine field mapping

Workflow status and detail carry `interaction_state` with `owner`, `caller_state`, `monitor_available`, `reason` and `handover`. Full text is in `input_question` and `pending_inputs`.

| Specimen state | Engine fields |
|---|---|
| `answerable` | `owner: caller`, `caller_state: dead`, `monitor_available: true` |
| `handed-over` | `owner: monitor` with a non-null `handover` (`timestamp`, `reason`, `previous_owner`, `responder`, `action`) |
| Started in this app (list row Quarterly report draft) | `owner: monitor`, `handover: null` |
| `waiting` and `handed-live` start | `caller_state: alive`; `monitor_available: false`; `reason` shown as the explanation. `handed-live` ends when a refresh reports `dead` with `monitor_available: true` |
| `unknown` | `caller_state: unknown`; Harflow fails closed and does not take over |
| Dead caller with `monitor_available: false` | Treated as read-only with the engine `reason` (handled in the specimen logic, not a separate state) |
| `submitting`, `answered`, `refused`, `expired` | A mutation request and its result. Availability is advisory; the engine rechecks authority and the checkpoint on submit, so a refusal is expected to be possible. Refusal reasons are fixture wording, not engine strings |
| `older` | `interaction_state` absent. Items are read-only with guidance to answer through the owning caller |
| `recovery` | A recovery checkpoint with the attempt limit; consistent with the work-interaction recovery form (Answer, Additional attempts) |
| Row scope Task | Task-level request; see below |

Descendants inherit root authority after a handover, and a returning caller can no longer answer; the design says so in the answerable copy. Caller identity is established by the engine, never by the app. Process command lines are not exposed by the contract and are not shown.

## Unsupported and deferred

- Live-caller opt-in: the contract states no live-caller opt-in is implemented. The design does not draw an opted-in state; a connected caller always produces the read-only waiting state.
- Task-level caller-loss handover: checked in the contract. `interaction_state` is defined for workflow status and detail projections only; no task projection carries it. The specimen therefore shows task-level requests with caller status Unknown, read-only, with guidance to answer through the caller (the Add retry to webhook client row). Whether existing Monitor responses for task caller approvals should make some of these answerable is an open question.
- Real-time updates: the specimen has no polling. The native list needs a refresh policy; none is invented here.
- Notification delivery rules, sound and badge behavior beyond the banner content.

## Labels

Existing glossary terms used: Workflow run, Task, Node, MCP client, Harflow. Labels invented for this proposal and not in `docs/terminology.md`:

- Needs you (sidebar row, list title, menu-bar section)
- Nothing needs you (empty state; mirrors the existing menu-bar phrase "Nothing running")
- Approval, Question, Recovery (request kinds)
- Connected, Ended, Unknown (caller status)
- Started by, Caller, Owner, Waiting since, Provenance and ownership
- Waiting for <caller>, Caller status unknown, Answer through the caller
- Answer, Send answer, Resume with answer (Answer and Resume follow work-interaction; the combined button label is new)
- Show all <count>, Open, View (row actions)
- Notification subtitle "Waiting for <caller>" and group title "<n> requests need you"
- Mac app, harflow-ctl and "Harflow task" as started-by values (harflow-ctl and Claude Code are real names; Mac app is a label)

## Open questions for the owner

1. Should Needs you be a sidebar row above Running, as drawn, or a badge on the Running section header? A row gives a destination and survives an empty Running list.
2. Should waiting-for-caller requests count in the badge and notify at all? The specimen counts and notifies them, with explicit wording. The alternative is to count and notify only requests the user can act on.
3. List order: oldest first as drawn, or answerable requests before read-only ones.
4. Should the empty menu-bar section show "Nothing needs you" or be omitted?
5. Menu-bar limit: 3 rows is a placeholder.
6. Should task-level requests use the existing Monitor-response capability to become answerable when the engine supports it, or stay read-only until the contract adds task-level handover?
7. Should an answer from a Mac-started run (owner Monitor from the start) be labeled differently from a taken-over run?

## Browser approximations

The window, sidebar, notification banner and menu-bar popover are CSS approximations. Native materials, SF Symbols, the notification center grouping stack and its actions, window controls and text rasterization are not reproduced. The sidebar's other rows are decorative. Timestamps are relative fixtures. The window keeps its 1000-point native minimum width and scrolls horizontally on narrow viewports. Native layout, VoiceOver behavior and actual notification rendering remain unverified.

## Verification performed

JavaScript syntax check, the repository test suite, a scripted pass through every surface and state with no console errors, the answer, refusal, expiry, caller-ended, Reset and cross-surface navigation flows, and a visual check of Light and Dark in the browser pane. No native or VoiceOver checks were performed.
