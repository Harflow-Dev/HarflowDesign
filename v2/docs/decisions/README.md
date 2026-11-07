# Decisions

Every owner decision behind the `v2/` interface reference, in one place. The catalog itself names screens and components only; the history of how each state was proposed, reviewed and approved lives here.

A decision record is the commit that contains it. Cite the HarflowDesign commit, the file path and the route. Approval covers the design direction of the listed states; it does not establish native pixel fidelity or product acceptance.

Routes are written as the current route, with the route used before the information architecture changed in parentheses. Old routes still open: they resolve to the same design. [route-map.md](../route-map.md) lists every one.

## Index

| Decision | Area | Status | Approved by and date | Recording commit | Routes | Files |
| --- | --- | --- | --- | --- | --- | --- |
| Harflow Desktop redesign, design system, foundations, brand and components | All areas | Approved; the failed task state is superseded | The owner, 2026-11-03; design system republished 2026-11-04 | `24958cf` (amendments `3643d08`, `d7d3f46`; foundations and brand `c3fc670`) | Every base route: `new-task/default`, `harness-menu`, `sidebar-collapsed`, `needs-you/*`, `workflows/*`, `workflow-editor/*`, `task/running`, `approval`, `done`, `failed`, `parallel-group/*`, `workflow-run/*`, `resources/*`, `statistics/*`, `settings/*`, `menu-bar/*`, `app-states/*`, `brand/*`, `foundations/*`, `components/*` | [approval.md](approval.md) |
| Activity transcript states of the task screen (observation design) | Task | Approved | The owner, 2026-11-05, with spacing and sidebar corrections applied | `227da87` (proposal `ba10e2d`) | `task/activity-observed` (`d2b-proposal/observed`), `activity-loading` (`loading`), `activity-partial` (`partial`), `activity-unavailable` (`unavailable`), `activity-integrity-failed` (`integrity-failed`), `activity-reconnecting` (`reconnecting`), `activity-capacity` (`capacity`), `activity-sources` (`events`) | [d2b-observation-approval.md](d2b-observation-approval.md), [d2b-observation-proposal.md](d2b-observation-proposal.md) |
| Entry, sidebar and runtime states (entry direction) | Start work; Settings and setup | Approved | The owner, 2026-11-05 | `5b37a3d` (earlier `ad80bcd`, `bd5d349`) | 24 states: `sidebar/expanded`, `collapsed`, `minimum`, `history-*`; `new-task/composer-*`, `options-open`, `options-closed`; `harness-runtime/*`. Old routes `m04-proposal/*`, listed in the route map | [m04-proposal.md](m04-proposal.md), [approval.md](approval.md) |
| Centered composer amendment, with the unified sidebar scroll | Start work | Approved, separately from the entry direction | The owner, 2026-11-06 | `9d64bfd` | `new-task/centered-empty`, `centered-ready`, `centered-growing`, `centered-capped`, `centered-options`, `centered-unknown` (`m04-proposal/amendment-*`) | [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) |
| Task screen states (statuses, actions, top bar, changes, events, artifacts, layout) | Task | Approved, except the provisional routes below | The owner, 2026-11-07, relayed by the coordinator | `17739e4` (proposal `3e85e26`, `a9c65fe`) | `task/running-stop` (`m05-proposal/state-running`), the other status, action, top bar, changes, events and layout routes, and the decision boards under `records/` (`m05-proposal/overview`, `retry-options`, `stop-options`, `adaptive-options`, `platform-options`). Provisional, not approved: `task/cancelled-partial` and `task/artifacts-*`, until the contract gaps close | [m05-task-screen-approval.md](m05-task-screen-approval.md), [m05-task-screen-proposal.md](m05-task-screen-proposal.md) |

## Supersessions

One supersession is applied, and it is cited. The rest are proposals that wait for an owner decision.

| Earlier state | Current state | Status | Basis |
| --- | --- | --- | --- |
| `task/failed` (Retry) | `task/failed-continue` | Applied | The approved row for the failed state replaces Retry with Continue in a new session. The earlier route opens with a note that links to the current design. |
| `task/running` | `task/running-stop` | Proposed | The approved running row describes its own fixture and does not replace the base running screen. |
| `task/done` | `task/changes-single`, `task/pane-split` | Proposed | The task screen states redraw the done screen with the new pane. |
| `task/activity-sources` | `task/events-populated` | Proposed | Same content, now inside the Events tab. |
| `new-task/default`, `harness-menu`, `sidebar-collapsed` | `sidebar/expanded`, `new-task/composer-ready`, `sidebar/collapsed` | Proposed | The entry direction is drawn on these templates. |
| `new-task/composer-ready`, `composer-unknown`, `options-open` | `new-task/centered-ready`, `centered-unknown`, `centered-options` | Proposed | The native app implemented the centered composer for every composer state; the amendment draws only these. The other composer states have no centered drawing. |

Until an owner decision applies a proposed row, both states stay listed and the earlier one is labelled "Earlier layout; current status awaiting decision". Nothing is hidden on inference. The proposed rows are in `v2/scripts/supersessions.js`; applying one moves it to the `applied` list.

Owner questions still open:

- Is `task/done` replaced by the new Changes pane states?
- Is the base New task screen replaced by the entry states?
- For composer states drawn only in the bottom layout (loading, unqualified, invalid, starting, refused, task options closed), are they current until a centered drawing exists, or superseded with the centered layout implied?
- Is the standalone Events pane replaced by the Events tab?
- Is the base running task screen replaced by the running state with Stop in the composer?

## By screen

Each screen links here from the overview. The decision that covers it is listed first.

### `overview`

Not a design state. It indexes the current design.

### `new-task`

[approval.md](approval.md) (base states), [m04-proposal.md](m04-proposal.md) (composer and task options), [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) (centered composer).

### `sidebar`

[m04-proposal.md](m04-proposal.md) and [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) (the sidebar body scrolls as one bounded area).

### `task`

[approval.md](approval.md) (base states), [d2b-observation-approval.md](d2b-observation-approval.md) (activity transcript), [m05-task-screen-approval.md](m05-task-screen-approval.md) (status, actions, top bar, changes, events, artifacts, layout).

### `parallel-group`

[approval.md](approval.md).

### `needs-you`

[approval.md](approval.md).

### `menu-bar`

[approval.md](approval.md).

### `workflows`

[approval.md](approval.md).

### `workflow-editor`

[approval.md](approval.md), including the 2026-11-03 connector style and builder pane amendments.

### `workflow-run`

[approval.md](approval.md).

### `resources`

[approval.md](approval.md).

### `statistics`

[approval.md](approval.md).

### `settings`

[approval.md](approval.md).

### `app-states`

[approval.md](approval.md).

### `harness-runtime`

[m04-proposal.md](m04-proposal.md).

### `brand`

[approval.md](approval.md).

### `foundations`

[approval.md](approval.md).

### `components`

[approval.md](approval.md).

## Moved from

These files were in `v2/docs/` until the information architecture changed. Receipts and sibling repositories that cite the old paths record them as they were.

| Earlier path | Path now |
| --- | --- |
| `v2/docs/approval.md` | `v2/docs/decisions/approval.md` |
| `v2/docs/d2b-observation-approval.md` | `v2/docs/decisions/d2b-observation-approval.md` |
| `v2/docs/d2b-observation-proposal.md` | `v2/docs/decisions/d2b-observation-proposal.md` |
| `v2/docs/m04-proposal.md` | `v2/docs/decisions/m04-proposal.md` |
| `v2/docs/m04-centered-composer-proposal.md` | `v2/docs/decisions/m04-centered-composer-proposal.md` |
| `v2/docs/m05-task-screen-approval.md` | `v2/docs/decisions/m05-task-screen-approval.md` |
| `v2/docs/m05-task-screen-proposal.md` | `v2/docs/decisions/m05-task-screen-proposal.md` |

`v2/docs/migration-coverage.md`, `screen-inventory.md` and `terminology.md` stay where they were.
