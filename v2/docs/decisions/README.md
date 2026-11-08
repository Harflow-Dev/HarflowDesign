# Decisions

Every owner decision behind the `v2/` interface reference, in one place. The catalog itself names screens and components only; the history of how each state was proposed, reviewed and approved lives here.

A decision record is the commit that contains it. Cite the HarflowDesign commit, the file path and the route. Approval covers the design direction of the listed states; it does not establish native pixel fidelity or product acceptance.

Routes are written as the current route, with the route used before the information architecture changed in parentheses. Old routes still open. An alias opens the same design under its current route. A route the owner retired opens its replacement. [route-map.md](../route-map.md) lists every one.

## Index

| Decision | Area | Status | Approved by and date | Recording commit | Routes | Files |
| --- | --- | --- | --- | --- | --- | --- |
| Harflow Desktop redesign, design system, foundations, brand and components | All areas | Approved; nine of its states are retired (see [Retired designs](#retired-designs)) | The owner, 2026-11-03; design system republished 2026-11-04 | `24958cf` (amendments `3643d08`, `d7d3f46`; foundations and brand `c3fc670`) | Every base route (six now retired, see Retired designs): `new-task/default`, `harness-menu`, `sidebar-collapsed`, `needs-you/*`, `workflows/*`, `workflow-editor/*`, `task/running`, `approval`, `done`, `failed`, `parallel-group/*`, `workflow-run/*`, `resources/*`, `statistics/*`, `settings/*`, `menu-bar/*`, `app-states/*`, `brand/*`, `foundations/*`, `components/*` | [approval.md](approval.md) |
| Activity transcript states of the task screen (observation design) | Task | Approved | The owner, 2026-11-05, with spacing and sidebar corrections applied | `227da87` (proposal `ba10e2d`) | `task/activity-observed` (`d2b-proposal/observed`), `activity-loading` (`loading`), `activity-partial` (`partial`), `activity-unavailable` (`unavailable`), `activity-integrity-failed` (`integrity-failed`), `activity-reconnecting` (`reconnecting`), `activity-capacity` (`capacity`), `activity-sources` (`events`). Retired 2026-11-08: each opens `task/transcript-<state>` (`transcript-sources` for `activity-sources`) | [d2b-observation-approval.md](d2b-observation-approval.md), [d2b-observation-proposal.md](d2b-observation-proposal.md) |
| Entry, sidebar and runtime states (entry direction) | Start work; Settings and setup | Approved | The owner, 2026-11-05 | `5b37a3d` (earlier `ad80bcd`, `bd5d349`) | 24 states, thirteen of them now retired (see Retired designs): `sidebar/expanded`, `collapsed`, `minimum` and `history-loading` (now `sidebar/loading`); `new-task/composer-loading`, `composer-unqualified`, `composer-invalid`, `composer-starting`, `composer-refused`, `options-open`, `options-closed`, `composer-ready` and `composer-unknown`. The other `history-*` and the `harness-runtime/*` states stay. Old routes `m04-proposal/*`, listed in the route map | [m04-proposal.md](m04-proposal.md), [approval.md](approval.md) |
| Centered composer amendment, with the unified sidebar scroll | Start work | Approved, separately from the entry direction | The owner, 2026-11-06 | `9d64bfd` | `new-task/centered-empty`, `centered-ready`, `centered-growing`, `centered-capped`, `centered-options`, `centered-unknown` (`m04-proposal/amendment-*`) | [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) |
| Centered and transcript redraws | Start work; Task | Approved | The owner, 2026-11-08 ("Yes, accept all", relayed by the coordinator) | `b19520c` (base `3f12d29`); the hint under the Harness select of `new-task/centered-harness-open` follows in `48a54d3`; the gated option follows in `19365d9` | `new-task/centered-loading`, `centered-unqualified`, `centered-invalid`, `centered-starting`, `centered-refused`, `centered-options-closed`, `centered-harness-open`; `sidebar/centered-collapsed`, `centered-minimum`; `task/transcript-observed`, `transcript-loading`, `transcript-partial`, `transcript-unavailable`, `transcript-integrity-failed`, `transcript-reconnecting`, `transcript-capacity`, `transcript-sources`. Eighteen earlier states are retired (see Retired designs) | This file ([Centered and transcript redraws](#centered-and-transcript-redraws)), [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) |
| Loading states | All screens with a first load | Approved | The owner, 2026-11-08 (`sidebar/loading` in the redraw decision; the other 15 states and the shimmer primitive: "I see the design and I think all looks good. I approve", relayed by the coordinator) | `8f52ad3` (the primitive and specs), `28f5066` (the start work and task states, the sidebar approval and the retirement of `sidebar/history-loading`), `a4a2c82` (the other states); review fixes `abb416c` and `ba8c928` (the approved design); approval recorded in the commit titled "Approve the loading states" | `new-task/loading`, `sidebar/loading`, `task/loading`, `task/loading-pane`, `parallel-group/loading`, `needs-you/loading`, `menu-bar/loading`, `workflows/loading`, `workflow-editor/loading`, `workflow-run/loading`, `workflow-run/loading-parallel`, `resources/loading`, `statistics/loading`, `settings/loading-general`, `settings/loading-harnesses`, `settings/loading-mcp-approvals`, `components/skeleton-shimmer` | `v2/scripts/skeleton.js`, `v2/scripts/skeleton-specs.js`, `v2/styles/skeleton.css`, `v2/scripts/screens-loading-work.js`, `v2/scripts/screens-loading-more.js` |
| Minimum window (1000 × 620) | Needs you, Parallel group, Workflow run, Workflow editor, Menu bar | Approved | The owner, 2026-11-08: "Yes, approve", the answer to "Approve the 11 minimum-window screens with my three fixes?", relayed by the coordinator. The three fixes: the canvas scrolls, as on Mac; the meta dot is keyboard-focusable and shows its text on focus; the wrapped label at 288 is accepted. Sizes decided earlier the same day ("Yes, take them") | `9fca1fb`, `70ba6ab`, `c15dae3`, `6428285`, `1279752` and `c147372` (the states, the sizing decisions, the orchestrator and loading states, review fixes and the two fixes); approval recorded in the commit titled "Approve the minimum window drafts with canvas scrolling and focusable meta" | `workflow-editor/orchestrator-minimum`, `needs-you/loading-minimum`, `parallel-group/loading-minimum`, `workflow-run/loading-parallel-minimum`, `workflow-editor/loading-minimum`, `menu-bar/loading-minimum`, `needs-you/waiting-minimum`, `parallel-group/lanes-minimum`, `workflow-run/parallel-minimum`, `workflow-editor/node-selected-minimum`, `menu-bar/busy-minimum` | `v2/scripts/screens-minimum.js`, `v2/scripts/minimum-frame.js`, `v2/styles/minimum-frame.css`, `tests/minimum-frame.test.mjs` |
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
| `new-task/sidebar-collapsed` | `sidebar/centered-collapsed` | Q2, owner answer 2026-11-08; repointed on 2026-11-08 when `sidebar/collapsed` was retired for its centered redraw | `new-task/sidebar-collapsed` at `17739e4` and `bce377c` |
| `new-task/harness-menu` | `new-task/centered-harness-open` | Q2 and Q3, owner answers 2026-11-08; repointed on 2026-11-08 to the centered composer's harness picker open (item 5 of the owner decision below) | `new-task/harness-menu` at `17739e4` and `bce377c` |
| `new-task/composer-ready` | `new-task/centered-ready` | Q3, owner answer 2026-11-08. A centered drawing exists | `m04-proposal/composer-ready` at `17739e4`; `new-task/composer-ready` at `bce377c` |
| `new-task/composer-unknown` | `new-task/centered-unknown` | Q3, owner answer 2026-11-08. A centered drawing exists | `m04-proposal/composer-unknown` at `17739e4`; `new-task/composer-unknown` at `bce377c` |
| `new-task/options-open` | `new-task/centered-options` | Q3, owner answer 2026-11-08. A centered drawing exists | `m04-proposal/advanced` at `17739e4`; `new-task/options-open` at `bce377c` |
| `new-task/composer-loading` | `new-task/centered-loading` | Owner answer 2026-11-08: redraws accepted | `new-task/composer-loading` at `3f12d29` |
| `new-task/composer-unqualified` | `new-task/centered-unqualified` | Owner answer 2026-11-08: redraws accepted | `new-task/composer-unqualified` at `3f12d29` |
| `new-task/composer-invalid` | `new-task/centered-invalid` | Owner answer 2026-11-08: redraws accepted | `new-task/composer-invalid` at `3f12d29` |
| `new-task/composer-starting` | `new-task/centered-starting` | Owner answer 2026-11-08: redraws accepted | `new-task/composer-starting` at `3f12d29` |
| `new-task/composer-refused` | `new-task/centered-refused` | Owner answer 2026-11-08: redraws accepted | `new-task/composer-refused` at `3f12d29` |
| `new-task/options-closed` | `new-task/centered-options-closed` | Owner answer 2026-11-08: redraws accepted | `new-task/options-closed` at `3f12d29` (mount `advanced-closed`) |
| `sidebar/expanded` | `new-task/centered-empty` | Owner answer 2026-11-08: redraws accepted; owner item 1: the expanded shell and its centered redraw both drew the window of `new-task/centered-empty` | `sidebar/expanded` at `3f12d29` (mount `shell`) |
| `sidebar/centered-expanded` | `new-task/centered-empty` | Owner answer 2026-11-08: redraws accepted; accepted, then retired as a duplicate (owner item 1) | `sidebar/centered-expanded` at `3f12d29` (mount `centered-shell`) |
| `sidebar/collapsed` | `sidebar/centered-collapsed` | Owner answer 2026-11-08: redraws accepted | `sidebar/collapsed` at `3f12d29` (mount `shell-collapsed`) |
| `sidebar/minimum` | `sidebar/centered-minimum` | Owner answer 2026-11-08: redraws accepted | `sidebar/minimum` at `3f12d29` (mount `shell-narrow`) |
| `task/activity-observed` | `task/transcript-observed` | Owner answer 2026-11-08: redraws accepted | `task/activity-observed` at `3f12d29` (mount `observed`) |
| `task/activity-loading` | `task/transcript-loading` | Owner answer 2026-11-08: redraws accepted | `task/activity-loading` at `3f12d29` (mount `loading`) |
| `task/activity-partial` | `task/transcript-partial` | Owner answer 2026-11-08: redraws accepted | `task/activity-partial` at `3f12d29` (mount `partial`) |
| `task/activity-unavailable` | `task/transcript-unavailable` | Owner answer 2026-11-08: redraws accepted | `task/activity-unavailable` at `3f12d29` (mount `unavailable`) |
| `task/activity-integrity-failed` | `task/transcript-integrity-failed` | Owner answer 2026-11-08: redraws accepted | `task/activity-integrity-failed` at `3f12d29` (mount `integrity-failed`) |
| `task/activity-reconnecting` | `task/transcript-reconnecting` | Owner answer 2026-11-08: redraws accepted | `task/activity-reconnecting` at `3f12d29` (mount `reconnecting`) |
| `task/activity-capacity` | `task/transcript-capacity` | Owner answer 2026-11-08: redraws accepted | `task/activity-capacity` at `3f12d29` (mount `capacity`) |
| `task/activity-sources` | `task/transcript-sources` | Owner answer 2026-11-08: redraws accepted; owner item 3 | `task/activity-sources` at `3f12d29` (mount `events`) |
| `sidebar/history-loading` | `sidebar/loading` | Owner answer 2026-11-08 (option B): the first listing shows skeleton rows instead of text only. The earlier state said the initial listing has no fabricated work rows; the skeleton rows carry no work data | `sidebar/history-loading` at `854caae` (mount `history-loading`) |

The templates that other states clone (`task/running`, `task/done`, `task/failed`, `new-task/default`, `new-task/sidebar-collapsed`) stay in the code. Deleted with their states: the `new-task/harness-menu` template; the `m04-proposal/*` templates and mounts of the retired composer and shell states; and the activity transcript wrapper templates, guides, mount and renderer (`d2b-proposal/*`). The transcript fixtures and builders stay, because the transcript routes use them.

### Owner answers of 2026-11-08

| Question | Answer |
| --- | --- |
| Q1: is `task/done` replaced by the Changes states? | Yes. Retired, see above |
| Q2: is the base New task screen replaced by the entry states? | Yes. `new-task/default` opens `new-task/centered-empty`; the collapsed variant opens `sidebar/collapsed` |
| Q3: composer states drawn only in the bottom layout | Redraw the six (loading, unqualified, invalid, starting, refused, task options closed) in the centered layout with the same content and copy. The redraws were provisional; the owner approved them on 2026-11-08 (see [Centered and transcript redraws](#centered-and-transcript-redraws)) |
| Q4: is the standalone Events pane replaced by the Events tab? | Replaced. `task/activity-sources` was resolved on 2026-11-08: it opens `task/transcript-sources` |
| Q5: is the base running Task screen replaced by the running state with Stop in the composer? | Yes. Retired, see above |

"Task options closed" in Q3 means `new-task/options-closed`.

Resolved (QA), 2026-11-08: `task/activity-sources` opens `task/transcript-sources`, the transcript state redrawn inside the task screen frame (owner item 3 in [Centered and transcript redraws](#centered-and-transcript-redraws)).

<a id="provisional-redraws-awaiting-owner-review"></a>

## Centered and transcript redraws

The owner decided on 2026-11-08, answering "Yes, accept all", relayed by the coordinator: all 17 redraws of the batch at `3f12d29` are accepted, with the coordinator's six recommendations.

| Item | Decision |
| --- | --- |
| 1 | `sidebar/expanded` is retired and opens `new-task/centered-empty`. `sidebar/centered-expanded` is identical, so it is accepted and then retired the same way |
| 2 | The four Events elements the approved Events tab omits (Copy record, the Recovered message disclosure, Record ordering and "independent of captured activity") are kept and approved on the eight `task/transcript-*` routes |
| 3 | `task/activity-sources` opens `task/transcript-sources`. This resolves the open question (QA) of the earlier Q4 answer |
| 4 | The `new-task/centered-invalid` task options popover over the greeting is accepted at the minimum frame |
| 5 | The open harness pill menu is drawn in the centered composer as the new state `new-task/centered-harness-open`, approved by extension |
| 6 | Sidebar loading: option B. `sidebar/loading` (skeleton rows) is approved and `sidebar/history-loading` is retired and opens it; see [Loading states](#loading-states) |

Sixteen redraws survive as approved states, and `sidebar/centered-expanded` is retired as a duplicate. Eighteen earlier states are retired (see [Retired designs](#retired-designs)): the 17 earlier states and the duplicate. `HFV2.pendingRedraw` (`v2/scripts/supersessions.js`) is empty; the mechanism stays for the next redraw. Each redraw reuses the fixtures and copy of its earlier state; only the layout changes, and no in-app copy is invented. The earlier states stay in Git history at `3f12d29`.

### The harness picker open

`new-task/centered-harness-open` is the centered composer's own harness pill picker, opened, with the fixtures of the closed centered states. Basis: item 5 of the owner decision above, relayed by the coordinator, and the coordinator's confirmation of 2026-11-08 of the content, option (a). The retired `new-task/harness-menu` list is not drawn and none of its content is used. The coordinator added one requirement: the unavailable harness must show its gated treatment with an explanation. The fixtures already hold the pieces, so the state selects "Unavailable harness" (model Default, qualification unqualified): Start is disabled and the status line reads "Choose a qualified harness and model.", the existing copy of the composer when the qualification is not ready. The open menu hid most of that line, so the same string is repeated verbatim as a hint directly under the Harness select inside the menu (referenced by `aria-describedby`); the closed status line stays. No other copy is added. The picker is a native `<details>` and `<summary>`, anchored by the existing picker placement; Escape does not close the picker, the same as the other centered pickers: it is left to the native control and there is no custom handler. The "Unavailable harness" option is disabled and stays selected, so the row itself carries the gated state. Reset restores the state as drawn, with the picker open.

### Redraws and the questions put to the owner

| Redraw | Earlier state | Basis | Question put to the owner |
| --- | --- | --- | --- |
| `new-task/centered-loading` | `new-task/composer-loading` | Q3, owner answer 2026-11-08: redraw the six composer states drawn only in the bottom layout, in the centered layout, with the same content and copy | Is the centered layout accepted for this state? |
| `new-task/centered-unqualified` | `new-task/composer-unqualified` | Q3 | Is the centered layout accepted for this state? |
| `new-task/centered-invalid` | `new-task/composer-invalid` | Q3 | Is the task options popover acceptable where the placement rule of `new-task/centered-options` puts it, including at the minimum frame, where the space is smaller? |
| `new-task/centered-starting` | `new-task/composer-starting` | Q3 | Is the centered layout accepted for this state? |
| `new-task/centered-refused` | `new-task/composer-refused` | Q3 | Is the centered layout accepted for this state? |
| `new-task/centered-options-closed` | `new-task/options-closed` | Q3 | Is the centered layout accepted for this state? |
| `sidebar/centered-expanded` (retired) | `sidebar/expanded` | Q2, owner answer 2026-11-08, and the coordinator's confirmation of 2026-11-08 that the three shell states still draw the bottom composer | See the duplication note below |
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

**Duplication, resolved.** `sidebar/centered-expanded` duplicated `new-task/centered-empty`: its fixture equals the centered empty draft apart from the route, and a headless browser comparison found the window markup and pixels identical in both appearances at 1280 × 800 and 1000 × 620. Item 1 retires it, together with `sidebar/expanded`.

On sign-off a pair moves into the retired designs table above: the earlier state, its templates and its guides are removed, and a redirect that already targeted the earlier state is repointed to the redraw (`new-task/sidebar-collapsed` and `new-task/harness-menu`).

The questions the redraws left open were answered by the items above: the `new-task/centered-invalid` popover (item 4), the open harness pill (item 5), `task/activity-sources` (item 3) and the four Events elements (item 2).

## Loading states

The owner asked on 2026-11-08 for "the shimmer page for each page", each "resembling the new design". Every screen with a first load has one state named Loading, in a Loading group under its own screen. Each is drawn from the loaded state it mirrors: the loaded template and renderer run, then the data regions of that screen are replaced by shimmering blocks and everything else stays real (`v2/scripts/skeleton.js`; the regions and patterns are authored in `v2/scripts/skeleton-specs.js`). The region boxes, column widths, top bar, pane geometry and row height therefore equal the loaded screen's; the patterns inside a region (row counts, line widths, the four-node graph) are fixed and authored, not measured from fixtures.

**Sidebar.** The owner chose option B (item 6 of [Centered and transcript redraws](#centered-and-transcript-redraws)): `sidebar/loading` shows skeleton rows while the work listing is read, and it is **approved** (the owner, 2026-11-08, decision "Sidebar"). `sidebar/history-loading`, which showed text only ("Initial listing has no fabricated work rows"), is retired and opens it. The skeleton rows carry no work data, which is what the earlier state's rule protected.

**When it shows.** The sidebar shimmers only while the sidebar listing itself is unread, on a cold start; the drawings depict a cold start, which is why every loading screen shimmers the sidebar. On navigation the loaded sidebar stays; the other loading states do not clear it, because it is already known.

**Partial loads stay as approved.** These depict part of a screen loading while the rest is known, and they are not changed: `task/changes-loading`, `task/events-loading`, `task/artifacts-loading`, `task/transcript-loading`, `sidebar/history-older`, `new-task/centered-loading` (re-checking options that are already known), `harness-runtime/checking` and `listing`, and `app-states/loading` (connecting to the engine; they are the first-load screens of their own areas).

**Loading states (approved).** The owner approved `sidebar/loading` first (2026-11-08, decision "Sidebar"). On 2026-11-08 the owner approved the other 15 states and the shimmer primitive (decision "Loading states"; "I see the design and I think all looks good. I approve", relayed by the coordinator). The approved design is at `ba8c928`. Approval does not establish native fidelity: the Mac differences and the 1000 × 620 gaps below stand. Each mirrors the region geometry of an approved state. Static families are drawn at their native frame (1280 × 800) only; the New task, Sidebar and Task states offer both frames through their Frame control. Five loading states at 1000 × 620 for the static screens are approved with the minimum window states and are recorded in [Minimum window](#minimum-window).

| Route | Mirrors | What shimmers |
| --- | --- | --- |
| `new-task/loading` | `new-task/centered-empty` | The repository, the three option pills, the status line and the sidebar work rows and counts. The greeting, composer frame, task options trigger and navigation are real |
| `sidebar/loading` (approved) | `new-task/centered-empty` | Sidebar rows only: the Needs you count and the Running and Recent work rows. The main area, including the option pills and the top-bar caption, is drawn exactly as `new-task/centered-empty` draws it (the pills are `aria-disabled` in the specimen; that is a catalog limitation, not designed behaviour: only the sidebar rows were approved, and the composer does not depend on the sidebar listing, so Mac and Web keep it operable while the listing loads). It differs from `new-task/loading`, which also shimmers the pills, the caption and the status line |
| `task/loading` | `task/running-stop` | Title, status badge, meta and chips; the transcript; the Stop button; the sidebar rows. The right pane toggle, composer and sidebar navigation are real |
| `task/loading-pane` | `task/pane-running-open` | As `task/loading`, plus the pane body. Tab names are real |
| `parallel-group/loading` | `parallel-group/lanes` | The top bar facts and, in each of the three lanes (as the loaded state draws), the header and transcript. Lane frames and composers are real |
| `needs-you/loading` | `needs-you/waiting` | The waiting count and the request cards |
| `menu-bar/loading` | `menu-bar/busy` | The running count, the Needs you cards and the Running and Recent rows. The section headings and footer actions are real |
| `workflows/loading` | `workflows/list` | The workflow rows. The title, search and New workflow are real |
| `workflow-editor/loading` | `workflow-editor/node-selected` | Title, meta, standalone nodes, the canvas graph (four nodes at the loaded node size with connectors) and the inspector fields. The toolbar is real and its actions are disabled |
| `workflow-run/loading` | `workflow-run/on-demand` | Header, standalone nodes, graph and node pane |
| `workflow-run/loading-parallel` | `workflow-run/parallel` | Header and the three lanes, and the orchestrator strip |
| `resources/loading` | `resources/slots` | The five harness cards and the waiting row |
| `statistics/loading` | `statistics/overview` | The four figures, the chart and the table cells. Labels, range control and column headers are real |
| `settings/loading-general` | `settings/general` | Toggles and the runtime and task store status |
| `settings/loading-harnesses` | `settings/harnesses` | The harness rows and the qualification rows |
| `settings/loading-mcp-approvals` | `settings/mcp-approvals` | Five uniform harness items, each with one approval row beneath; no item is expanded |
| `components/skeleton-shimmer` | the primitive | Light, dark and the reduced-motion form |

**Rules the drawings follow.**
- No data: names, counts, digits and times do not appear. Count slots are empty pills. A hand-written allowlist per screen (`chrome` in the spec) lists every string the screen may show, with its count; a check compares both ways. The only digits are numeric chrome: `⌘N`, the editor and run zoom (65%, 70%), the range control (7 days, 30 days), and the clock of the operating system menu bar around the popover.
- Motion: a sheen sweeps each block every 1.4 s (`cubic-bezier(0.37, 0, 0.63, 1)`), clipped to the block. Under reduced motion the block is static: no sweep and no pulse. Both are drawn on `components/skeleton-shimmer`.
- Interaction: one rule. An action that needs the data is blocked: the renderer ignores it and the control is `aria-disabled` (or replaced by a block when the control itself is data). Chrome works: navigation, the right pane and its tabs, and the sidebar toggle in the New task and Sidebar frames (the task frame has none). Each screen carries `aria-busy` and one label, "Loading <screen>", which is not counted as content; blocks are hidden from assistive technology, and no focusable control is left without an accessible name. The catalog Frame control keeps working.
- Handoff: the catalog draws states, not transitions. When content arrives Mac crossfades the placeholder (0.18 s, ease-out, instant under Reduce Motion); this is a note for implementers, not drawn. A task title that is already known may render for real instead of shimmering; this is also not drawn as a separate state.

**Differences from HarflowMac** (evidence at HarflowMac `3fdf0e8`, not a target; Mac and Web implement from the drawings):

| | Mac | Drawings |
| --- | --- | --- |
| Fill | Black at 6% (light) and white at 7% (dark), `Shimmer.swift:20` | The opaque `--surface-active` |
| Sheen | White at 75% (light) and 8% (dark), `Shimmer.swift:25`; a 1.4 s clock-driven cosine sweep clipped to each block, `Shimmer.swift:48-53` | The same colours as `--skeleton-sheen`; the same period; a cubic-bezier approximation of the cosine |
| Reduced motion | The block pulses its opacity between 0.55 and 1.0 every 1.6 s, `Shimmer.swift:45-46` | Static: no sweep and no pulse |
| Layout ownership | While loading, only the placeholder is rendered; the real content takes over layout in the prepared and revealing phases, `SkeletonContent.swift:101-120` | The data regions inside the loaded layout are replaced, so the loaded geometry holds by construction |
| Sidebar headings | Hidden during the skeleton in the unified sidebar, `SidebarListReconciler.swift:186-191`; kept in the sectioned roles, `:214-218` | Kept (the section headings are static chrome) |
| Screens with a spinner or text | New task first load: a pulsing 260 × 12 status capsule, `StartScreenView.swift:49-57`; `InitialWorkLoadingView.swift:21-24` is a spinner and "Loading your work for the first time…" (the runtime listing screen); Needs you: a spinner, `NeedsYouListView.swift:62-65`; Statistics: a spinner, `StatisticsView.swift:57-60`; the workflow runner sheet: a disabled picker and a spinner, `WorkflowRunnerView.swift:51,56`; Events and Artifacts: text, `ObservationViews.swift:181,211,223`; menu bar counts: "…", `MenuBarLabelView.swift:60` | Skeletons. Workflows, the sidebar, Resources (`ResourceSlotsContent.swift:43-44`) and the workflow screens already use skeletons on Mac |
| Workflow editor and run | A fixed graph skeleton of four nodes (`WorkflowLoadingView.swift:36-46`), and header blocks, `WorkflowView.swift:65-70, 551` | The same four-node graph at the loaded node size |
| Parallel lanes | Deferred lane placeholders, `ParallelView.swift:204-243` | The same lane structure on the real lane frames |
| Accessibility | One label, "Loading workflow run" or "Loading workflow canvas", `WorkflowLoadingView.swift:26-27` | `aria-busy` and one label per screen, "Loading <screen>" |
| Task title | The real title and repository when already known, `TaskLoadingSkeleton.swift:55-62` | Shimmered in `task/loading` |
| Task toolbar | Fixed-size blocks, `TaskLoadingSkeleton.swift:216-290` | Blocks at the approved top bar's own geometry |

**Loaded-screen gaps at 1000 × 620.** The drawings keep the static families at their native frame, but the check renders each loaded static screen and its loading state at 1000 × 620 as well. They agree, and the check showed gaps in the loaded designs. The first measurements were corrected when the minimum window states were drawn; their status is in [Minimum window](#minimum-window). The five loading states at 1000 × 620 are approved; the approved loading states at 1280 × 800 are not redrawn.

**Questions for the owner.**
- Is a known task title shown for real while the rest loads (not drawn)?

<a id="minimum-window-drafts"></a>

## Minimum window

**Approved.** Every loading state, including those at 1000 × 620, is approved. On 2026-11-08 the owner decided four sizes ("Yes, take them", relayed by the coordinator): the lane floor is 360, the inspector is 288, the popover is 380 and the top bar meta drops first on the lane screens. Later the same day the owner answered "Yes, approve" to "Approve the 11 minimum-window screens with my three fixes?" (relayed by the coordinator), which approved all 11 states with three fixes: the canvas scrolls, as on Mac; the meta dot is keyboard-focusable and shows its text on focus; and the wrapped "On-demand calls per decision" label at 288 is accepted as it is. The approval decision is "Minimum window". Approval does not establish native fidelity: the lane floor of 360 against Mac's 630 and the popover bounded by the 620 frame are drawing decisions. Six states draw loaded screens, and five more draw their loading, in the 1000 × 620 window with the fixes that window needs. They are derived states: the loaded template runs unchanged and `HFV2.applyMinimum` (`v2/scripts/minimum-frame.js`) wraps, moves or hides existing nodes after rendering; it adds no text. The stylesheet is `v2/styles/minimum-frame.css`, and every selector in it sits under `.hdc-specimen--minimum`. The 1280 × 800 states stay as approved; no approved pixel or copy changed.

| Route | Derived from | Fixes |
| --- | --- | --- |
| `needs-you/waiting-minimum` | `needs-you/waiting` | Sidebar. The representative drawing of the shared sidebar rule |
| `parallel-group/lanes-minimum` | `parallel-group/lanes` | Sidebar, lanes, top bar meta |
| `workflow-run/parallel-minimum` | `workflow-run/parallel` | Sidebar, lanes, top bar meta |
| `workflow-editor/node-selected-minimum` | `workflow-editor/node-selected` | Sidebar, inspector (288), canvas, top bar meta |
| `workflow-editor/orchestrator-minimum` | `workflow-editor/orchestrator` | Sidebar, inspector (288), canvas, top bar meta |
| `menu-bar/busy-minimum` | `menu-bar/busy` | Popover (380 × 560) |

The loading states are the minimum window state of the same screen with its loading skeleton applied: the template runs, then the minimum fixes, then the skeleton (`v2/scripts/catalog.js`), so the skeleton pins the boxes the fixes have laid out. Each declares both a minimum and a skeleton and resolves its template from the loaded route in one hop. Titles read "Loading · 1000 × 620"; they are approved.

| Route | Loading of | Skeleton spec | Fixes |
| --- | --- | --- | --- |
| `needs-you/loading-minimum` | `needs-you/waiting-minimum` | `needs-you` (the approved spec) | Sidebar |
| `parallel-group/loading-minimum` | `parallel-group/lanes-minimum` | `parallel-group-minimum` | Sidebar, lanes, top bar meta |
| `workflow-run/loading-parallel-minimum` | `workflow-run/parallel-minimum` | `workflow-run-parallel-minimum` | Sidebar, lanes, top bar meta |
| `workflow-editor/loading-minimum` | `workflow-editor/node-selected-minimum` | `workflow-editor-minimum` | Sidebar, inspector (288), canvas, top bar meta |
| `menu-bar/loading-minimum` | `menu-bar/busy-minimum` | `menu-bar` (the approved spec) | Popover |

The approved loading specs of the lane screens and the editor draw a shimmering block in place of the top bar meta, which would undo the meta fix. Their minimum variants (`v2/scripts/skeleton-specs.js`) leave the approved specs untouched and change only the meta and where the graph is found: the block is not drawn, the hidden text is removed (the meta is data), the meta leaves the tab order and loses its role, and its dot is hidden, so the loading screen has no focusable meta. The graph placeholder is drawn in the canvas viewport, which keeps its name and scrolls. The meta box keeps the geometry it has in the minimum loaded state. The variant of the editor draws the title block 117 wide, the width of the loaded title at 1000 × 620 (the approved spec draws 150, which is its width at 1280 × 800 and not the loaded one). There is no loading state for `workflow-editor/orchestrator-minimum`: the loaded orchestrator screen has no loading state.
**Evidence.** HarflowMac at `3fdf0e8`, read with `git show 3fdf0e8:<path>`:
- Sidebar: a fixed header, a scrolling list and a fixed footer (`macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Sidebar/SidebarView.swift:143-147`, `SidebarNativeList.swift:19-20`).
- Lanes: a 630 point floor, scrolling horizontally (`Parallel/ParallelLayout.swift:8-24`, `Parallel/ParallelView.swift:112-117`, same package).
- Inspector: initial 288, minimum 220, maximum 500, canvas minimum 400 (`macos/HfFoundation/HfUI/Sources/HfUI/Style/HfRadius.swift:226-229`; `Workflow/WorkflowInspectorSplit.swift:15-18`).
- Popover: a fixed 380 × 560 frame with a fixed header and footer and a scrolling body (`macos/HfFeatures/MenuBarFeature/Sources/MenuBarFeature/MenuBar/MenuBarView.swift:127-146`, `HfRadius.swift:383,385`).

**What each fix does.**
- **Sidebar.** The navigation and the work sections scroll as one body between the fixed header (44) and footer. This is the rule of the approved 2026-11-06 correction (the New task, Sidebar and Task frames already have it), applied to the static screens. It is drawn on five loaded routes (`needs-you/waiting-minimum` and the four window states with a sidebar: the two lane screens, the node selected editor and the orchestrator) and on the four loading states that carry a sidebar.
- **Lanes.** The effective lane width of the loaded states at 1000 × 620 is 320 points (the templates set a 320 floor inline): three lanes and two gaps need 962 and the detail area is 736. These states use a 360 point floor, the component minimum: 3 × 360 + 2 = 1082, so two whole lanes show (722) and 14 points of the third peek in. The lanes scroll horizontally, are not snapped (Mac does not snap), and the third lane's controls (its composer where it has one) are reached by horizontal scroll and by Tab.
- **Top bar meta.** The meta text drops first on the editor and on both lane screens, as `task/topbar-minimum` does. Every meta element of the top bar keeps its text once in the accessibility tree as visually hidden text, and shows it as a tooltip when the pointer is on the meta or the meta has keyboard focus. The meta is a small focusable target (`tabindex="0"`, `role="note"`, 16 × 16 with a 6 point dot, laid out as before) with the catalog focus ring. Its dot is the editor's own; the lane screens and the orchestrator have none, so `applyMinimum` adds one empty, `aria-hidden` dot in the tertiary text colour (not the attention colour, which would suggest unsaved changes). The meta has no `title`, so there is no second exposure and no native tooltip. The tooltip sits directly under the meta with no gap, so the pointer can move onto it, and it is above the lanes, the canvas and the inspector. Escape dismisses it, whether hover or focus revealed it; it stays dismissed until both the pointer and the focus have left. The lane meta of `parallel-group/lanes` is the enforcement statement ("Enforced for every agent here: Network: not controlled."); that of `workflow-run/parallel` is "Run started 02:00 · HarflowMCP", which is not one. Measured at 1000 × 620: the editor title goes from 54.92 (cut to an ellipsis, the More actions button squeezed from 26 to 18) to 117.28 untruncated, the button is 26 and the top bar `scrollWidth` is 736 of 736; the `parallel-group/lanes` title goes from 31.67 to 150 (of 150) and the `workflow-run/parallel` title from 98.63 to 173.34 (of 173.34), both with `scrollWidth` equal to `clientWidth`. Adding the dot to the lane screens and the orchestrator changed no title width and no control width: the top bar spacer absorbs the 6 points. In the Chrome accessibility tree the text appears once, as the static text of the focused note. VoiceOver was not run.
- **Canvas.** The graph canvas scrolls, as on Mac (`Workflow/WorkflowCanvas.swift:125` at `3fdf0e8`). The graph layer, and only that layer, is wrapped in a viewport with a thin visible scrollbar; the add-node tray and the zoom control stay over it, and the dot grid scrolls with the graph. The viewport is focusable (`tabindex="0"`, `role="region"`) and carries the canvas label, moved verbatim; the arrow keys scroll it. It scrolls to the graph's own edge: 741 wide in a 448 point viewport, with no blank travel, and no vertical scrolling (the graph is 279.5 tall in 429). The scroll position is 0 when the state renders, as on Mac. The loading state of the editor draws its graph placeholder in the same viewport.
- **Inspector.** The editor inspector is 288 points wide, as Mac opens it. The canvas gains 52 points, from 396 to 448 (the inspector was 340). No field of the inspector is clipped. Fields that wrap at 288 and not at 340: none on `workflow-editor/node-selected`; none that are new there (its three two-line helper texts also wrap at 340). The canvas scrolls (see Canvas).
- **Popover.** The popover is 380 wide and 560 tall (the space below the menu bar is 580), as on Mac. The header and footer stay fixed and the Needs you, Running and Recent sections scroll between them. Its left edge is at 550 and it ends 70 points inside the frame; it was 360 wide.

**Coverage of the sidebar rule.** The rule is drawn on five loaded routes (`needs-you/waiting-minimum` and four app-window states: `parallel-group/lanes-minimum`, `workflow-run/parallel-minimum`, `workflow-editor/node-selected-minimum`, `workflow-editor/orchestrator-minimum`) and, separately, on the four loading states with a sidebar (`needs-you/loading-minimum`, `parallel-group/loading-minimum`, `workflow-run/loading-parallel-minimum`, `workflow-editor/loading-minimum`). Every static template with a sidebar has the structure the rule needs (header, navigation, sections, footer as direct children); `tests/minimum-frame.test.mjs` checks exactly 27 templates: the 22 static screens below plus `new-task/default`, `task/running`, `task/done`, `task/failed` (templates the New task and Task renderers read) and `components/sidebar`. A check in a browser applied the rule to the 22 static screens that have a sidebar, in both appearances, outside the catalog: the header is 44, the footer is inside the frame and the sidebar does not overflow. Those 22 are not drawn as routes. The collapsed rail, the menu bar and the New task, Sidebar and Task frames are outside the rule: the first two have no sidebar column and the frames already have the fix.

**Status of the gaps found at 1000 × 620.**

| Gap | Status |
| --- | --- |
| The static sidebar has no bounded scrolling body, so its header shrinks and its sections compress | Drawn, approved (`needs-you/waiting-minimum` and the four window states with a sidebar; the four loading states with a sidebar are listed separately) |
| `parallel-group/lanes` and `workflow-run/parallel`: the lanes scroll horizontally and the third lane's composer is off screen | Drawn, approved, with a 360 floor (decided by the owner, 2026-11-08). The first measurement said "at least 360 needs 962"; the loaded states use 320, which needs 962, and 360 needs 1082 |
| `workflow-editor/node-selected`: the top bar content overflows by about 2 points | Corrected: the top bar does not overflow, its title and a button are squeezed. Drawn, approved |
| `menu-bar/busy`: the popover is 739 points tall and the frame is 620 | Drawn, approved, at the Mac size of 380 × 560 (width decided by the owner, 2026-11-08) |
| The top bar title of `parallel-group/lanes` is cut to 31.67 of 150 points and that of `workflow-run/parallel` to 98.63 of 173 at 1000 × 620 | Fixed (`parallel-group/lanes-minimum`, `workflow-run/parallel-minimum`): the meta drops first, as the owner decided on 2026-11-08; its dot is focusable and shows the text on hover and focus, as the owner required on 2026-11-08 (the meta was a `title` on a span that keyboard and touch users could not reach). The titles are 150 of 150 and 173.34 of 173.34 points. The `workflow-run/parallel` meta is not an enforcement statement |
| `workflow-editor/orchestrator`: the frame overflows at 1000 × 620 | Fixed (`workflow-editor/orchestrator-minimum`), approved. Measured: the main area is not wider than the frame (736 of 736); the frame's scroll height was 632 of 620. The cause was the visually hidden label of the Instructions field, whose containing block was the frame because the inspector body did not establish one, so it sat 12 points below the frame instead of scrolling with its field. The inspector body is now the containing block, as the sidebar and popover bodies are (part of the inspector fix); the frame measures 620 of 620. At 288 the orchestrator inspector label "On-demand calls per decision" wraps to two lines; it fits one line at 340. Accepted by the owner, 2026-11-08; not restyled |
| The canvas viewport clips the graph at 1000 × 620 (`workflow-editor/orchestrator-minimum` and `workflow-editor/node-selected-minimum`) | Fixed: scrolls like the native canvas (`Workflow/WorkflowCanvas.swift:125` at `3fdf0e8`). A 741 point graph sits in 448 points of canvas (396 before the inspector was 288), and the canvas scrolls horizontally to the last node |
| The rect check at 1000 × 620 between a loading state and its loaded state leaves out the static families' sidebar regions: their loaded sidebar has no bounded scrolling body, so its sections compress by flexbox rather than by design, and two renders of the same compressing layout cannot be held to 0.5 px. The main area is checked | Closed for the five routes below: the check runs on the minimum window states, whose sidebar is bounded, and includes the sidebar regions (within 0.5 points). It stays open for the approved loading states at 1280 × 800 of the other static families, which are not drawn at 1000 × 620 |
| The Loading states at 1000 × 620 for these screens | Drawn, approved: `needs-you/loading-minimum`, `parallel-group/loading-minimum`, `workflow-run/loading-parallel-minimum`, `workflow-editor/loading-minimum`, `menu-bar/loading-minimum`. The other static screens have no loading state at 1000 × 620; the orchestrator has no loading state |

Checks of the loading states, light and dark: the frame is 1000 × 620 and does not overflow; region rects (including the sidebar, the top bar, its title and the meta box, the lanes, the inspector and the popover) match the minimum loaded state within 0.5 points, with one exception: the x position of the zero-width hidden meta of `workflow-run/loading-parallel-minimum` is 0.64 points off, because the integer-width blocks drawn for the title and the badge sum a rounding of 0.64 (checked to 1 point); row rhythm; the two-way data-free allowlist; the loading scan holds neither the meta text nor a title, and no loading meta is focusable (no focusable element is unnamed except the lane composer fields, which carry no name at the base commit either); `aria-busy` and the label; blocked controls; reduced motion (no animation).

**Approved by the owner, 2026-11-08 ("Yes, approve", relayed by the coordinator), with three fixes.**
- The canvas scrolls, as on Mac. Applied to `workflow-editor/node-selected-minimum`, `workflow-editor/orchestrator-minimum` and `workflow-editor/loading-minimum`; see Canvas above.
- The meta dot is keyboard-focusable and shows its text on focus. Applied to the four screens with a meta (the two lane screens, the editor and the orchestrator); see Top bar meta above. Keyboard access of the dropped meta text is therefore not a limitation any more. Not verified: VoiceOver, and native Mac fidelity of the reveal.
- The wrapped "On-demand calls per decision" label at 288 is accepted as it is.

**Superseded: "Decided by the owner, 2026-11-08 ('Yes, take them', relayed by the coordinator): sizing only; the drafts stay provisional."** These four sizing decisions stand; the states are no longer provisional:
- Lane floor: 360 (two lanes visible), not Mac's 630.
- Inspector width: 288, as Mac opens it (minimum 220); it was 340.
- Popover width: 380, as Mac; it was 360. On Mac the popover is bounded by the screen, so the 620 frame is a drawing bound.
- The lane screens' top bar: the meta drops first and the title stays whole.

## By screen

Each screen links here from the overview. The decision that covers it is listed first.

### `overview`

Not a design state. It indexes the current design.

### `new-task`

[approval.md](approval.md) (base states), [m04-proposal.md](m04-proposal.md) (composer and task options), [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) (centered composer).

### `sidebar`

[m04-proposal.md](m04-proposal.md) and [m04-centered-composer-proposal.md](m04-centered-composer-proposal.md) (the sidebar body scrolls as one bounded area). Centered shell redraws: [Centered and transcript redraws](#centered-and-transcript-redraws).

### `task`

[approval.md](approval.md) (base states), [d2b-observation-approval.md](d2b-observation-approval.md) (activity transcript), [m05-task-screen-approval.md](m05-task-screen-approval.md) (status, actions, top bar, changes, events, artifacts, layout). Transcript redraws: [Centered and transcript redraws](#centered-and-transcript-redraws).

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
