# Needs you proposal - HarflowMac #30

Status: Approved by the owner on 2026-10-30 at commit `3925e65`, covering every surface and state in the specimen at that commit; this is the implementation reference for HarflowMac #30. Specimen: [features/needs-you.html](../features/needs-you.html), with [script](../features/needs-you.js) and [style](../features/needs-you.css). It is offline, uses invented deterministic fixtures, and never contacts an engine or sends an answer.

Goal: gather every pending input the user can act on now, whoever started the run, into one place.

**Rule (owner, 2026-10-30):** Needs you lists only requests the user can answer now. A request the user cannot answer never appears in the list, the badge count, notifications, or the menu-bar section. Requests that wait for a connected caller, or whose caller cannot be identified, stay visible only in the run's own views (task Activity and the workflow run sidebar). This page does not redesign those views.

## Surfaces and state ids

| Surface | State ids |
|---|---|
| Sidebar entry and list (`list`) | `populated` (6), `single`, `empty` (excluded requests exist but none is answerable), `loading`, `error` (partial results with a notice), `arriving` (a waiting request becomes answerable), `older` (no `interaction_state`) |
| Request detail and answer (`detail`) | `answerable`, `handed-over`, `task-approval`, `submitting`, `answered`, `expired`, `refused` (checkpoint changed), `recovery`, `very-long`; the Request kind control selects Question or Approval |
| Notification (`notify`) | `question`, `approval`, `recovery`, `arrived` (a waiting request became answerable), `grouped` |
| Menu-bar extra (`menubar`) | `populated` (3 of 6 plus Show all), `few`, `empty`, `older` |

Controls outside the specimen: Surface, State, Request kind, Width (1000, 1200, 1440), Appearance (Light, Dark), Reduce Motion, Reset. Fixture buttons stand in for the engine: accept, refuse because the caller returned, refuse because the checkpoint changed, request expired, caller ended. Reset restores the list surface, 1000 width, and all fixture data; it keeps Appearance and Reduce Motion as viewing preferences. The only timer is the 180 ms fade.

The fixture holds eight requests; two are not answerable (a connected caller, an unidentifiable caller) and are present only to show they never appear.

## Design summary

- Needs you is the first row of the sidebar's Overview group, above Statistics (placement owner-chosen, 2026-10-30; the group is followed by Workflows, Running, Today and Earlier). It stays visible when nothing is pending, without a badge, so the rows below do not shift. The badge counts answerable requests only.
- Selecting it shows a list ordered oldest first. Each row shows the kind (Approval, Question, Recovery), run title, the path to the node (for example Release checklist > Choose deployment target, or three levels for a child workflow), who started it, the caller status "Ended" when a caller ended, age, and the full request text (clamped to three lines with Show more over about 180 characters).
- Detail shows the full request, never truncated (over about 900 characters it is clamped to ten lines with Show more). Answerable requests use the existing approval card look: uniform warning outline and tint, no left stripe, always expanded, Approve once and Reject for approvals. Settled requests use the neutral card. A provenance block lists run, path, started by, caller (when ended), owner, age, engine note, and the handover record only when a handover happened. "Started by: Mac app" needs no extra label.
- Answering after a caller ended states that the run passes to Harflow, the original caller can no longer answer, and the engine rechecks on submit.
- Answered requests fade out in 180 ms (immediate under Reduce Motion or the system setting), leave the list, and the badge drops.
- Refusal because the checkpoint changed keeps the typed answer and an error message. Refusal because the caller returned removes the request from Needs you, because it is no longer answerable here, and returns to the list with a status notice that the caller is answering it again. The unsent answer is discarded rather than shown, because it was written for a request Harflow can no longer answer; this is the simpler choice and keeps the notice short.
- `arriving`: when a waiting request's caller ends, a row appears (fade, unless Reduce Motion), the badge increments, and a notification banner fires. The banner opens that request.
- Notification banner: app icon, Harflow, title `<Kind>: <run title>`, body with the first line of the question or the approval action and target. The `arrived` banner adds a subtitle saying the caller ended. A grouped banner lists several answerable requests.
- Menu-bar extra: a Needs you section with the count and up to 3 rows, Show all opens the list, and the empty section reads "Nothing needs you".
- Older engine: workflow interactions cannot be shown as answerable, so they are excluded. Only task approvals answerable through the existing Monitor-response capability are listed, with a short notice that this engine version cannot report workflow questions here. The menu-bar `older` state follows the same rule.
- Task approvals: answerable through the existing Monitor-response capability (HarflowMac #14) when the engine supports it; when it does not, they are excluded and not shown read-only. Their detail offers Approve once and Reject and does not claim a handover.

## Source basis

HarflowMac pinned at `da2f4cab79e5b9240b250857cbb783a3a83e16fe` (read-only):

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Sidebar/SidebarSection.swift` and `SidebarView.swift`: sections Running, Today and Earlier.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Sidebar/SidebarListReconciler.swift`: the list starts with the Overview heading and the Statistics row (`overview:statistics`), then the Workflows header; Needs you is a new Overview row before Statistics.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/CallerApprovalController.swift` and `CallerApprovalCard.swift`: caller approvals, `supportsMonitorResponseForCallerApprovals`, the pending card look (warning fill and outline), Approve once, Reject.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowModels.swift`: caller-controlled runs; `allowsMonitorControl` is false when `interaction_owner` is `caller`, and child runs defer to the root.
- `macos/HfFeatures/MenuBarFeature/Sources/MenuBarFeature/`: the popover sections; the Needs you section is new.
- `macos/HfCore/HfRepository/Sources/HfRepository/FinishNotifier/`: existing finish notifications (title and body only).

Engine contract: HarflowMCP 0.0.5, `docs/contracts.md` section "Caller loss and workflow interaction handover" and fixture `contracts/v1/ctl-workflow-interaction-handover.json`.

## Engine field mapping

Workflow status and detail carry `interaction_state` with `owner`, `caller_state`, `monitor_available`, `reason` and `handover`. Full text is in `input_question` and `pending_inputs`.

| Presentation | Engine fields |
|---|---|
| Answerable, listed | `owner: monitor`, or `caller_state: dead` with `monitor_available: true` |
| `handed-over` | `owner: monitor` with a non-null `handover` (`timestamp`, `reason`, `previous_owner`, `responder`, `action`); the record is shown only then |
| Mac-started run | `owner: monitor`, `handover: null`; no special label beyond "Started by: Mac app" |
| Excluded everywhere | `caller_state: alive`, `caller_state: unknown`, or `caller_state: dead` with `monitor_available: false`. Unknown identity fails closed |
| `arriving` / `arrived` | A refresh reports an excluded request as `caller_state: dead` with `monitor_available: true` |
| Task approvals | No `interaction_state` (see below). Listed only when the engine supports Monitor responses for caller approvals (HarflowMac #14); otherwise excluded |
| `older` | `interaction_state` absent: workflow interactions excluded; task approvals follow the Monitor-response rule |
| `submitting`, `answered`, `refused`, `expired` | A mutation request and its result. Availability is advisory; the engine rechecks authority and the checkpoint on submit, so refusal is possible. Refusal wording is fixture text, not engine strings |
| `recovery` | A recovery checkpoint with the attempt limit; consistent with the work-interaction recovery form (Answer, Additional attempts) |

Descendants inherit root authority after a handover, and a returning caller can no longer answer; the answerable copy says so. Caller identity is established by the engine, never by the app. The contract exposes no process command lines and none are shown.

## Unsupported and deferred

- Live-caller opt-in: the contract states none is implemented. No opted-in state is drawn; a connected caller's requests are never listed.
- Task-level caller-loss handover: the contract defines `interaction_state` for workflow status and detail projections only, so no task projection reports caller loss. Task approvals therefore depend on the Monitor-response capability alone.
- The waiting and unknown requests' own views (task Activity, workflow run sidebar) are not redesigned here.
- Refresh and polling policy for the native list is not specified here.
- Notification delivery rules beyond the banner content (sound, badge, grouping thresholds).

## Labels

Existing glossary terms used: Workflow run, Task, Node, MCP client, Harflow. Labels invented for this proposal and not in `docs/terminology.md`:

- Needs you (sidebar row, list title, menu-bar section)
- Nothing needs you (empty state; mirrors the menu-bar phrase "Nothing running")
- Approval, Question, Recovery (request kinds)
- Ended (caller status), Started by, Caller, Owner, Waiting since, Provenance and ownership
- Answer, Send answer, Resume with answer (Answer and Resume follow work-interaction; the combined button label is new)
- Show all <count>, Answer (row action)
- Notification subtitle "The caller ended. You can answer now." and group title "<n> requests need you"
- Mac app, harflow-ctl and "Harflow task" as started-by values (harflow-ctl and Claude Code are real names; Mac app is a label)

## Decisions (owner, 2026-10-30)

1. Placement: Needs you is a row in the Overview group above Statistics, not a badge on Running.
2. Needs you lists only requests the user can answer now. Waiting-for-caller and caller-unknown requests are excluded from the list, badge, notifications and menu-bar section, and remain only in the run's own views. Notifications fire only for answerable requests, including when a waiting request becomes answerable. A refusal because the caller returned removes the request from Needs you with a status notice.
3. The list is ordered oldest first.
4. The empty menu-bar section reads "Nothing needs you".
5. The menu bar shows 3 rows, then Show all.
6. Task-level caller approvals are answerable through the existing Monitor-response capability (HarflowMac #14) when the engine supports it; otherwise they are excluded, not shown read-only.
7. There is no separate label for Mac-started runs; "Started by: Mac app" suffices. The handover record appears only when a handover happened.

## Browser approximations

The window, sidebar, notification banner and menu-bar popover are CSS approximations. Native materials, SF Symbols, the notification center grouping stack and its actions, window controls and text rasterization are not reproduced. The sidebar's other rows are decorative. Timestamps are relative fixtures. The window keeps its 1000-point native minimum width and scrolls horizontally on narrow viewports. Native layout, VoiceOver behavior and actual notification rendering remain unverified.

## Verification performed

JavaScript syntax check, the repository test suite, and a scripted pass through every surface and state with no console errors: answer, refusal (both kinds), expiry, caller-ended arrival, task approval, Reset and cross-surface navigation. The scripted pass also checked that no state shows a waiting or unknown request. No native, VoiceOver or full two-appearance visual review was performed.
