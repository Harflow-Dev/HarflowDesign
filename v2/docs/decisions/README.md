# Decisions

Every owner decision behind the `v2/` interface reference, in one place. The catalog itself names screens and components only; the history of how each state was proposed, reviewed and approved lives here.

A decision record is the commit that contains it. Cite the HarflowDesign commit, the file path and the route. Approval covers the design direction of the listed states; it does not establish native pixel fidelity or product acceptance.

Routes are written as the current route, with the route used before the information architecture changed in parentheses. Old routes still open. An alias opens the same design under its current route. A route the owner retired opens its replacement. [route-map.md](../route-map.md) lists every one.

## Index

| Decision | Area | Status | Approved by and date | Recording commit | Routes | Files |
| --- | --- | --- | --- | --- | --- | --- |
| Harflow Desktop redesign, design system, foundations, brand and components | All areas | Approved; nine of its states are retired (see [Retired designs](#retired-designs)) | The owner, 2026-11-03; design system republished 2026-11-04 | `24958cf` (amendments `3643d08`, `d7d3f46`; foundations and brand `c3fc670`) | Every base route (six now retired, see Retired designs): `new-task/default`, `harness-menu`, `sidebar-collapsed`, `needs-you/*`, `workflows/*`, `workflow-editor/*`, `task/running`, `approval`, `done`, `failed`, `parallel-group/*`, `workflow-run/*`, `resources/*`, `statistics/*`, `settings/*`, `menu-bar/*`, `app-states/*`, `brand/*`, `foundations/*`, `components/*` | [approval.md](approval.md) |
| Activity transcript states of the task screen (observation design) | Task | Approved | The owner, 2026-11-05, with spacing and sidebar corrections applied | `227da87` (proposal `ba10e2d`) | `task/activity-observed` (`d2b-proposal/observed`), `activity-loading` (`loading`), `activity-partial` (`partial`), `activity-unavailable` (`unavailable`), `activity-integrity-failed` (`integrity-failed`), `activity-reconnecting` (`reconnecting`), `activity-capacity` (`capacity`), `activity-sources` (`events`) | [d2b-observation-approval.md](d2b-observation-approval.md), [d2b-observation-proposal.md](d2b-observation-proposal.md) |
| Entry, sidebar and runtime states (entry direction) | Start work; Settings and setup | Approved | The owner, 2026-11-05 | `5b37a3d` (earlier `ad80bcd`, `bd5d349`) | 24 states, three of them now retired: `sidebar/expanded`, `collapsed`, `minimum`, `history-*`; `new-task/composer-*`, `options-open` (retired), `options-closed`; retired `composer-ready` and `composer-unknown`; `harness-runtime/*`. Old routes `m04-proposal/*`, listed in the route map | [m04-proposal.md](m04-proposal.md), [approval.md](approval.md) |
| Centered composer amendment, with the unified sidebar scroll | Start work | Approved, separately from the entry direction | The owner, 2026-11-06 | `9d64bfd` | `new-task/centered-empty`, `centered-ready`, `centered-growing`, `centered-capped`, `centered-options`, `centered-unknown` (`m04-proposal/amendment-*`) | [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) |
| Task screen states (statuses, actions, top bar, changes, events, artifacts, layout) | Task | Approved, except the provisional routes below | The owner, 2026-11-07, relayed by the coordinator | `17739e4` (proposal `3e85e26`, `a9c65fe`) | `task/running-stop` (`m05-proposal/state-running`), the other status, action, top bar, changes, events and layout routes, and the decision boards under `records/` (`m05-proposal/overview`, `retry-options`, `stop-options`, `adaptive-options`, `platform-options`). Provisional, not approved: `task/cancelled-partial` and `task/artifacts-*`, until the contract gaps close | [m05-task-screen-approval.md](m05-task-screen-approval.md), [m05-task-screen-proposal.md](m05-task-screen-proposal.md) |

## Retired designs

The owner answered the five replacement questions on 2026-11-08. A retired design leaves navigation, the picker and the overview counts. Its route still opens and shows the replacement; the old design stays in Git history, at the commits below. Records live in `v2/scripts/supersessions.js` (`routeRedirects` and `retired`).

Pins use the route names at each commit: the old milestone routes (`m04-proposal/*`) at `17739e4`, and the current names at `bce377c`.

| Retired route | Opens | Basis | Old design visible at |
| --- | --- | --- | --- |
| `task/running` | `task/running-stop` | Q5, owner answer 2026-11-08 | `task/running` at `17739e4` and `bce377c` |
| `task/done` | `task/changes-single` | Q1, owner answer 2026-11-08. The approved Changes state shows the done screen with the pane open; `task/pane-split` is a layout state, not the done screen | `task/done` at `17739e4` and `bce377c` |
| `task/failed` | `task/failed-continue` | The approved row for the failed state replaces Retry with Continue in a new session. Previously applied as a hidden state with a note; now a redirect like the others | `task/failed` at `17739e4` and `bce377c` |
| `new-task/default` | `new-task/centered-empty` | Q2 owner answer 2026-11-08; target confirmed by the coordinator 2026-11-08 | `new-task/default` at `17739e4` and `bce377c` |
| `new-task/sidebar-collapsed` | `sidebar/collapsed` | Q2, owner answer 2026-11-08 | `new-task/sidebar-collapsed` at `17739e4` and `bce377c` |
| `new-task/harness-menu` | `new-task/centered-ready` | Q2 and Q3, owner answers 2026-11-08. The open harness pill is not drawn in the centered layout: open design question | `new-task/harness-menu` at `17739e4` and `bce377c` |
| `new-task/composer-ready` | `new-task/centered-ready` | Q3, owner answer 2026-11-08. A centered drawing exists | `m04-proposal/composer-ready` at `17739e4`; `new-task/composer-ready` at `bce377c` |
| `new-task/composer-unknown` | `new-task/centered-unknown` | Q3, owner answer 2026-11-08. A centered drawing exists | `m04-proposal/composer-unknown` at `17739e4`; `new-task/composer-unknown` at `bce377c` |
| `new-task/options-open` | `new-task/centered-options` | Q3, owner answer 2026-11-08. A centered drawing exists | `m04-proposal/advanced` at `17739e4`; `new-task/options-open` at `bce377c` |

The templates that other states clone (`task/running`, `task/done`, `task/failed`, `new-task/default`, `new-task/sidebar-collapsed`) stay in the code; the `new-task/harness-menu` template and the `m04-proposal/composer-ready`, `composer-unknown` and `advanced` templates were deleted.

### Owner answers of 2026-11-08

| Question | Answer |
| --- | --- |
| Q1: is `task/done` replaced by the Changes states? | Yes. Retired, see above |
| Q2: is the base New task screen replaced by the entry states? | Yes. `new-task/default` opens `new-task/centered-empty`; the collapsed variant opens `sidebar/collapsed` |
| Q3: composer states drawn only in the bottom layout | Redraw the six (loading, unqualified, invalid, starting, refused, task options closed) in the centered layout with the same content and copy. The redraws are provisional and need owner approval |
| Q4: is the standalone Events pane replaced by the Events tab? | Replaced. `task/activity-sources` waits for the coordinator's scope decision (QA) and stays listed unchanged until then |
| Q5: is the base running Task screen replaced by the running state with Stop in the composer? | Yes. Retired, see above |

"Task options closed" in Q3 means `new-task/options-closed`.

Open (QA): whether `task/activity-sources` is redirected to `task/events-populated`, or kept while the transcript states are redrawn inside the task screen frame (see [Provisional redraws awaiting owner review](#provisional-redraws-awaiting-owner-review)). Until the owner decides, the state stays as it is.

## Provisional redraws awaiting owner review

Seventeen routes are provisional redraws. None is approved: each carries no approval date, its strip reads "Provisional · needs owner approval", and the earlier state stays listed, labelled "Earlier layout; redraw awaiting owner approval" outside the specimen, with a link to its redraw. The pairs are in `HFV2.pendingRedraw` (`v2/scripts/supersessions.js`). Each redraw reuses the fixtures and copy of its earlier state; only the layout changes, and no in-app copy is invented.

| Provisional redraw | Earlier state | Basis | Owner question |
| --- | --- | --- | --- |
| `new-task/centered-loading` | `new-task/composer-loading` | Q3, owner answer 2026-11-08: redraw the six composer states drawn only in the bottom layout, in the centered layout, with the same content and copy | Is the centered layout accepted for this state? |
| `new-task/centered-unqualified` | `new-task/composer-unqualified` | Q3 | Is the centered layout accepted for this state? |
| `new-task/centered-invalid` | `new-task/composer-invalid` | Q3 | Is the task options popover acceptable where the placement rule of `new-task/centered-options` puts it, including at the minimum frame, where the space is smaller? |
| `new-task/centered-starting` | `new-task/composer-starting` | Q3 | Is the centered layout accepted for this state? |
| `new-task/centered-refused` | `new-task/composer-refused` | Q3 | Is the centered layout accepted for this state? |
| `new-task/centered-options-closed` | `new-task/options-closed` | Q3 | Is the centered layout accepted for this state? |
| `sidebar/centered-expanded` | `sidebar/expanded` | Q2, owner answer 2026-11-08, and the coordinator's confirmation of 2026-11-08 that the three shell states still draw the bottom composer | See the duplication note below |
| `sidebar/centered-collapsed` | `sidebar/collapsed` | Q2 and the same confirmation. `new-task/sidebar-collapsed` already redirects to `sidebar/collapsed`; on sign-off that redirect is repointed to this redraw | Is the centered layout accepted beside the collapsed rail? |
| `sidebar/centered-minimum` | `sidebar/minimum` | Q2 and the same confirmation | Does the centered layout fit the minimum window without clipping, as drawn? |
| `task/transcript-observed` | `task/activity-observed` | Q4, owner answer 2026-11-08: the Events side pane is replaced by the Events tab. None of the eight activity states has an approved equivalent, because the approved Events states draw different content | Is the transcript, drawn inside the task screen frame with the Events pane, accepted for this state? |
| `task/transcript-loading` | `task/activity-loading` | Q4 | The same. The loading placeholders are static |
| `task/transcript-partial` | `task/activity-partial` | Q4 | The same. Events adds the unsupported-record stub and the record ordering disclosure |
| `task/transcript-unavailable` | `task/activity-unavailable` | Q4 | The same |
| `task/transcript-integrity-failed` | `task/activity-integrity-failed` | Q4 | The same. The request text stays withheld |
| `task/transcript-reconnecting` | `task/activity-reconnecting` | Q4 | The same |
| `task/transcript-capacity` | `task/activity-capacity` | Q4 | The same |
| `task/transcript-sources` | `task/activity-sources` | Q4, and the owner's pending scope decision (QA) for this state. It holds the public stubs, the file order disclosure and a recovery source that `task/events-populated` lacks | The same, and whether `task/activity-sources` is redirected to `task/events-populated` instead |
| Events content the approved Events tab omits (all eight `task/transcript-*` routes) | The approved `task/events-*` states | `v2/docs/decisions/m05-task-screen-proposal.md:168`: Events holds the activity transcript content "as D2B has them", but the approved Events states omit four elements the activity states have: Copy normalized record, the Recovered message disclosure, Record ordering and the "independent of captured activity" qualifier. The redraws draw all four, with the earlier side pane sections verbatim and their own headings, inside the approved Events tab frame | Does Events keep the four elements, or do the approved Events states stand as drawn? |

**Events open.** Each transcript route has an Events-open state, reached by the right pane toggle in the top bar or by the deep link below. It is a state of the route, not a separate route: the owner reviews eight routes and each has an open state. The deep link `/events` follows the state and precedes the appearance; opening or closing Events by clicking does not change the address.

| Route | Closed | Events open |
| --- | --- | --- |
| `task/transcript-observed` | `#task/transcript-observed` | `#task/transcript-observed/events` |
| `task/transcript-loading` | `#task/transcript-loading` | `#task/transcript-loading/events` |
| `task/transcript-partial` | `#task/transcript-partial` | `#task/transcript-partial/events` |
| `task/transcript-unavailable` | `#task/transcript-unavailable` | `#task/transcript-unavailable/events` |
| `task/transcript-integrity-failed` | `#task/transcript-integrity-failed` | `#task/transcript-integrity-failed/events` |
| `task/transcript-reconnecting` | `#task/transcript-reconnecting` | `#task/transcript-reconnecting/events` |
| `task/transcript-capacity` | `#task/transcript-capacity` | `#task/transcript-capacity/events` |
| `task/transcript-sources` | `#task/transcript-sources` | `#task/transcript-sources/events` |

Append `/light`, `/dark` or `/system` for an appearance, for example `#task/transcript-observed/events/dark`. A view a state does not declare is dropped; it never opens the overview.

**Catalog limitations of the transcript redraws.** The top bar shows only the facts the earlier state has: title, meta, status and the Events toggle. It has no notices or continuity chips and no More menu, because the earlier state has none; at the minimum frame the meta drops, as it does on the approved top bar. The Changes and Artifacts tabs keep their approved chrome but are disabled, with no content and no new copy, because the earlier state has no changes or artifacts data and the task screen fixtures would invent it. The earlier request disclosure replaces the task screen's "Complete stored request" disclosure in these routes only.

**Duplication.** `sidebar/centered-expanded` duplicates `new-task/centered-empty`. Its fixture equals the centered empty draft apart from the route, and a headless browser comparison found the window markup and pixels identical in both appearances at 1280 × 800 and 1000 × 620, so the two routes differ only in their catalog strips. It is drawn anyway, as instructed, and nothing is retired. On sign-off the owner can retire `sidebar/expanded` as a redirect to `new-task/centered-empty` instead of keeping both states. The sidebar region of all three shell redraws is identical to its earlier state (markup and pixels), and their New task area equals the one of `new-task/centered-empty`.

On sign-off, a pair moves into the retired designs table above: the earlier state, its templates and its guides are removed, and a redirect that already targets the earlier state is repointed to the redraw (`new-task/sidebar-collapsed` and `sidebar/collapsed` are the only such case among these pairs).

Open design questions for the redraws:

- `new-task/centered-invalid` opens the task options popover, as its source does. Where it sits in the centered layout follows the placement rule of `new-task/centered-options` (above or below, by the space available), and at the minimum frame the available space is smaller. The owner decides whether that is acceptable.
- Whether the open harness pill (the retired `new-task/harness-menu`) is drawn in the centered layout.
- Whether `task/activity-sources` is kept, redirected to `task/events-populated`, or replaced by `task/transcript-sources` (QA).
- Whether the four elements named above belong in the approved Events tab.

## By screen

Each screen links here from the overview. The decision that covers it is listed first.

### `overview`

Not a design state. It indexes the current design.

### `new-task`

[approval.md](approval.md) (base states), [m04-proposal.md](m04-proposal.md) (composer and task options), [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) (centered composer).

### `sidebar`

[m04-proposal.md](m04-proposal.md) and [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) (the sidebar body scrolls as one bounded area)). Provisional centered shell redraws: [awaiting owner review](#provisional-redraws-awaiting-owner-review).

### `task`

[approval.md](approval.md) (base states), [d2b-observation-approval.md](d2b-observation-approval.md) (activity transcript), [m05-task-screen-approval.md](m05-task-screen-approval.md) (status, actions, top bar, changes, events, artifacts, layout). Provisional transcript redraws: [awaiting owner review](#provisional-redraws-awaiting-owner-review).

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
