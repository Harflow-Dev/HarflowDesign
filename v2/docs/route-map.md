# Route map

Every route that existed before the information architecture changed still opens, and it opens the same design: the old route and the route it points to are rendered from the same template by the same renderer, so the app frame is identical. The address bar then shows the current route. The `/light`, `/dark` or `/system` suffix is kept.

The aliases and the route grammar are defined in `v2/scripts/route-aliases.js`. An alias never changes meaning. An owner-decided redirect (`v2/scripts/supersessions.js`) sends a retired route to its replacement: the alias is applied first, then at most one redirect. A test checks that no alias shadows a current route or chains, that every redirect lands on a current state, and that every route registered at the base commit `17739e4` is either still current, an alias or a redirect.

## Unchanged routes

The routes of the base screens, the brand book, the foundations and the components keep their ids (for example `needs-you/waiting`, `workflow-editor/node-selected`, `components/button`), except the 28 retired routes listed under "Retired routes".

## Retired routes

The owner replaced these designs on 2026-11-08, nine of them by answering the replacement questions and eighteen by accepting the centered and transcript redraws. The route still opens, and it shows the replacement. The address bar then shows the replacement route. The decisions record gives the basis and the commits where the old design can be seen.

| Retired route | Opens | Screen and state |
| --- | --- | --- |
| `task/running` | `task/running-stop` | Task · Running · Stop in composer |
| `task/done` | `task/changes-single` | Task · Changes · one repository |
| `task/failed` | `task/failed-continue` | Task · Failed · Continue in a new session |
| `new-task/default` | `new-task/centered-empty` | New task · Centered composer · Empty |
| `new-task/sidebar-collapsed` | `sidebar/centered-collapsed` | Sidebar · Centered shell · Collapsed rail |
| `new-task/harness-menu` | `new-task/centered-harness-open` | New task · Centered composer · Harness picker open |
| `new-task/composer-ready` | `new-task/centered-ready` | New task · Centered composer · One line ready |
| `new-task/composer-unknown` | `new-task/centered-unknown` | New task · Centered composer · Outcome unknown |
| `new-task/options-open` | `new-task/centered-options` | New task · Centered composer · Options open |
| `new-task/composer-loading` | `new-task/centered-loading` | New task · Centered composer · Checking options |
| `new-task/composer-unqualified` | `new-task/centered-unqualified` | New task · Centered composer · Unavailable options |
| `new-task/composer-invalid` | `new-task/centered-invalid` | New task · Centered composer · Validation |
| `new-task/composer-starting` | `new-task/centered-starting` | New task · Centered composer · Starting |
| `new-task/composer-refused` | `new-task/centered-refused` | New task · Centered composer · Refused |
| `new-task/options-closed` | `new-task/centered-options-closed` | New task · Centered composer · Task options closed |
| `sidebar/expanded` | `new-task/centered-empty` | New task · Centered composer · Empty |
| `sidebar/centered-expanded` | `new-task/centered-empty` | New task · Centered composer · Empty |
| `sidebar/collapsed` | `sidebar/centered-collapsed` | Sidebar · Centered shell · Collapsed rail |
| `sidebar/minimum` | `sidebar/centered-minimum` | Sidebar · Centered shell · Minimum window |
| `task/activity-observed` | `task/transcript-observed` | Task · Task transcript · Observed activity |
| `task/activity-loading` | `task/transcript-loading` | Task · Task transcript · Loading observations |
| `task/activity-partial` | `task/transcript-partial` | Task · Task transcript · Incomplete history |
| `task/activity-unavailable` | `task/transcript-unavailable` | Task · Task transcript · Observation unavailable |
| `task/activity-integrity-failed` | `task/transcript-integrity-failed` | Task · Task transcript · Request integrity failure |
| `task/activity-reconnecting` | `task/transcript-reconnecting` | Task · Task transcript · Reconnect and source change |
| `task/activity-capacity` | `task/transcript-capacity` | Task · Task transcript · Reading window at capacity |
| `task/activity-sources` | `task/transcript-sources` | Task · Task transcript · Normalized and recovered sources |
| `sidebar/history-loading` | `sidebar/loading` | Sidebar · Loading |

The earlier routes `m04-proposal/*` and `d2b-proposal/*` of the retired states (listed below) reach the same replacements through their alias followed by the redirect. `sidebar/centered-expanded` was a duplicate of `new-task/centered-empty` and opens it.

A redirect carries a view only when the replacement declares it. The eight `task/activity-*` routes declared no views, so `#task/activity-observed/events` opens `#task/transcript-observed/events` because the replacement declares `events`. A redirect that carries no view opens the replacement with the right pane closed; the pane opens at load only with the `/events` view.

## Redraw routes

These routes are canonical routes with no earlier name; they are not aliases or redirects. The owner accepted them on 2026-11-08 ([decisions](decisions/README.md#centered-and-transcript-redraws)), and each earlier layout they redraw is now a retired route above.

| Redraw route | Replaces | Events open |
| --- | --- | --- |
| `new-task/centered-loading` | `new-task/composer-loading` | |
| `new-task/centered-unqualified` | `new-task/composer-unqualified` | |
| `new-task/centered-invalid` | `new-task/composer-invalid` | |
| `new-task/centered-starting` | `new-task/composer-starting` | |
| `new-task/centered-refused` | `new-task/composer-refused` | |
| `new-task/centered-options-closed` | `new-task/options-closed` | |
| `new-task/centered-harness-open` | `new-task/harness-menu` | |
| `sidebar/centered-collapsed` | `sidebar/collapsed` | |
| `sidebar/centered-minimum` | `sidebar/minimum` | |
| `task/transcript-observed` | `task/activity-observed` | `#task/transcript-observed/events` |
| `task/transcript-loading` | `task/activity-loading` | `#task/transcript-loading/events` |
| `task/transcript-partial` | `task/activity-partial` | `#task/transcript-partial/events` |
| `task/transcript-unavailable` | `task/activity-unavailable` | `#task/transcript-unavailable/events` |
| `task/transcript-integrity-failed` | `task/activity-integrity-failed` | `#task/transcript-integrity-failed/events` |
| `task/transcript-reconnecting` | `task/activity-reconnecting` | `#task/transcript-reconnecting/events` |
| `task/transcript-capacity` | `task/activity-capacity` | `#task/transcript-capacity/events` |
| `task/transcript-sources` | `task/activity-sources` | `#task/transcript-sources/events` |

`sidebar/centered-expanded` is listed under "Retired routes": it duplicated `new-task/centered-empty`.

### Route grammar

A route is `#family/state[/view][/appearance]`. A state may declare views (`views` in the registry); only the eight transcript routes do, and each declares `events`, which opens the right pane on Events at load. The segment after the state is a view only when that state declares it, and an appearance only when it is `light`, `dark` or `system`. Any other segment is dropped when the address is canonicalised, so an undeclared view never opens the overview. An alias or a redirect carries the view to its target and drops it when the target does not declare it. Opening or closing the pane by clicking does not rewrite the address.

## Loading routes

These are canonical routes with no earlier name; they are not aliases or redirects. Each mirrors the loaded state in the second column ([decisions](decisions/README.md#loading-states)). Append `/light`, `/dark` or `/system` for an appearance, for example `#task/loading/dark`. None declares a view.

| Loading route | Mirrors |
| --- | --- |
| `new-task/loading` | `new-task/centered-empty` |
| `sidebar/loading` | `new-task/centered-empty` |
| `task/loading` | `task/running-stop` |
| `task/loading-pane` | `task/pane-running-open` |
| `parallel-group/loading` | `parallel-group/lanes` |
| `needs-you/loading` | `needs-you/waiting` |
| `menu-bar/loading` | `menu-bar/busy` |
| `workflows/loading` | `workflows/list` |
| `workflow-editor/loading` | `workflow-editor/node-selected` |
| `workflow-run/loading` | `workflow-run/on-demand` |
| `workflow-run/loading-parallel` | `workflow-run/parallel` |
| `resources/loading` | `resources/slots` |
| `statistics/loading` | `statistics/overview` |
| `settings/loading-general` | `settings/general` |
| `settings/loading-harnesses` | `settings/harnesses` |
| `settings/loading-mcp-approvals` | `settings/mcp-approvals` |
| `components/skeleton-shimmer` | The primitive |

`sidebar/history-loading` is retired and opens `sidebar/loading`.

## Minimum window routes

These are canonical routes with no earlier name. Each draws the state in the second column at 1000 × 620 with the fixes the window needs (the loading routes add the loading skeleton); they are approved ([decisions](decisions/README.md#minimum-window)). None declares a view. Every loading state, including those at 1000 × 620, is approved.

| Minimum window route | Derived from |
| --- | --- |
| `needs-you/waiting-minimum` | `needs-you/waiting` |
| `parallel-group/lanes-minimum` | `parallel-group/lanes` |
| `workflow-run/parallel-minimum` | `workflow-run/parallel` |
| `workflow-editor/node-selected-minimum` | `workflow-editor/node-selected` |
| `workflow-editor/orchestrator-minimum` | `workflow-editor/orchestrator` |
| `menu-bar/busy-minimum` | `menu-bar/busy` |
| `needs-you/loading-minimum` | `needs-you/waiting-minimum` with its loading skeleton |
| `parallel-group/loading-minimum` | `parallel-group/lanes-minimum` with its loading skeleton |
| `workflow-run/loading-parallel-minimum` | `workflow-run/parallel-minimum` with its loading skeleton |
| `workflow-editor/loading-minimum` | `workflow-editor/node-selected-minimum` with its loading skeleton |
| `menu-bar/loading-minimum` | `menu-bar/busy-minimum` with its loading skeleton |

## Moved routes

| Earlier route | Current route | Screen and state | Listed in navigation |
| --- | --- | --- | --- |
| `d2b-proposal/observed` | `task/activity-observed` | Task · Observed captured activity | No, retired: opens `task/transcript-observed` |
| `d2b-proposal/loading` | `task/activity-loading` | Task · Loading observations | No, retired: opens `task/transcript-loading` |
| `d2b-proposal/partial` | `task/activity-partial` | Task · Incomplete captured history | No, retired: opens `task/transcript-partial` |
| `d2b-proposal/unavailable` | `task/activity-unavailable` | Task · Observation unavailable | No, retired: opens `task/transcript-unavailable` |
| `d2b-proposal/integrity-failed` | `task/activity-integrity-failed` | Task · Request integrity failure | No, retired: opens `task/transcript-integrity-failed` |
| `d2b-proposal/reconnecting` | `task/activity-reconnecting` | Task · Reconnect and source change | No, retired: opens `task/transcript-reconnecting` |
| `d2b-proposal/capacity` | `task/activity-capacity` | Task · Reading window at capacity | No, retired: opens `task/transcript-capacity` |
| `d2b-proposal/events` | `task/activity-sources` | Task · Normalized and recovered sources | No, retired: opens `task/transcript-sources` |
| `m04-proposal/amendment-empty` | `new-task/centered-empty` | New task · Centered composer · Empty | Yes |
| `m04-proposal/composer-loading` | `new-task/composer-loading` | New task · Composer · Checking options | No, retired: opens `new-task/centered-loading` |
| `m04-proposal/composer-ready` | `new-task/composer-ready` | New task · Composer · Ready | No, retired: opens `new-task/centered-ready` |
| `m04-proposal/composer-unqualified` | `new-task/composer-unqualified` | New task · Composer · Unavailable options | No, retired: opens `new-task/centered-unqualified` |
| `m04-proposal/composer-invalid` | `new-task/composer-invalid` | New task · Composer · Validation | No, retired: opens `new-task/centered-invalid` |
| `m04-proposal/composer-starting` | `new-task/composer-starting` | New task · Composer · Starting | No, retired: opens `new-task/centered-starting` |
| `m04-proposal/composer-refused` | `new-task/composer-refused` | New task · Composer · Refused | No, retired: opens `new-task/centered-refused` |
| `m04-proposal/composer-unknown` | `new-task/composer-unknown` | New task · Composer · Outcome unknown | No, retired: opens `new-task/centered-unknown` |
| `m04-proposal/amendment-ready` | `new-task/centered-ready` | New task · Centered composer · One line ready | Yes |
| `m04-proposal/amendment-growing` | `new-task/centered-growing` | New task · Centered composer · Growing | Yes |
| `m04-proposal/amendment-capped` | `new-task/centered-capped` | New task · Centered composer · Capped at six lines | Yes |
| `m04-proposal/amendment-unknown` | `new-task/centered-unknown` | New task · Centered composer · Outcome unknown | Yes |
| `m04-proposal/advanced` | `new-task/options-open` | New task · Task options · Open | No, retired: opens `new-task/centered-options` |
| `m04-proposal/advanced-closed` | `new-task/options-closed` | New task · Task options · Closed | No, retired: opens `new-task/centered-options-closed` |
| `m04-proposal/amendment-options` | `new-task/centered-options` | New task · Centered composer · Options open | Yes |
| `m04-proposal/shell` | `sidebar/expanded` | Sidebar · Shell · Expanded | No, retired: opens `new-task/centered-empty` |
| `m04-proposal/shell-collapsed` | `sidebar/collapsed` | Sidebar · Shell · Collapsed rail | No, retired: opens `sidebar/centered-collapsed` |
| `m04-proposal/shell-narrow` | `sidebar/minimum` | Sidebar · Shell · Minimum window | No, retired: opens `sidebar/centered-minimum` |
| `m04-proposal/history-empty` | `sidebar/history-empty` | Sidebar · History · Empty | Yes |
| `m04-proposal/history-loading` | `sidebar/history-loading` | Sidebar · History · Loading | No, retired: opens `sidebar/loading` |
| `m04-proposal/history-older` | `sidebar/history-older` | Sidebar · History · Loading older | Yes |
| `m04-proposal/history-error` | `sidebar/history-error` | Sidebar · History · Read failure | Yes |
| `m04-proposal/history-reconnecting` | `sidebar/history-reconnecting` | Sidebar · History · Reconnecting | Yes |
| `m04-proposal/history-retained` | `sidebar/history-retained` | Sidebar · History · Retained selection | Yes |
| `m04-proposal/runtime-checking` | `harness-runtime/checking` | Harness runtime · Runtime · Checking | Yes |
| `m04-proposal/runtime-install-required` | `harness-runtime/install-required` | Harness runtime · Runtime · Installation required | Yes |
| `m04-proposal/runtime-update-required` | `harness-runtime/update-required` | Harness runtime · Runtime · Update required | Yes |
| `m04-proposal/runtime-installing` | `harness-runtime/installing` | Harness runtime · Runtime · Preparing | Yes |
| `m04-proposal/runtime-failed` | `harness-runtime/failed` | Harness runtime · Runtime · Failure and retry | Yes |
| `m04-proposal/runtime-listing` | `harness-runtime/listing` | Harness runtime · Runtime · Ready, listing pending | Yes |
| `m05-proposal/state-running` | `task/running-stop` | Task · Running · Stop in composer | Yes |
| `m05-proposal/state-stopping` | `task/stop-requested` | Task · Stop requested, run still alive | Yes |
| `m05-proposal/state-cancelled` | `task/cancelled` | Task · Cancelled | Yes |
| `m05-proposal/state-cancel-partial` | `task/cancelled-partial` | Task · Cancelled, sub-tasks outstanding | Yes, provisional |
| `m05-proposal/state-timed-out` | `task/timed-out` | Task · Timed out (turn limit) | Yes |
| `m05-proposal/state-settling` | `task/settling` | Task · Settling after finish | Yes |
| `m05-proposal/state-unknown-failed` | `task/unknown-failed` | Task · Unknown outcome · failed, exit not observed | Yes |
| `m05-proposal/state-unknown-done` | `task/unknown-done` | Task · Unknown outcome · done, reconstructed | Yes |
| `m05-proposal/state-owner-lost` | `task/owner-lost` | Task · Unknown outcome · running, owner lost | Yes |
| `m05-proposal/state-unverified` | `task/unverified` | Task · Unknown outcome · running, owner undecidable | Yes |
| `m05-proposal/state-launch-unknown` | `task/launch-unknown` | Task · Unknown outcome · continuation may have started | Yes |
| `m05-proposal/state-status-unavailable` | `task/status-unavailable` | Task · Status read unavailable | Yes |
| `m05-proposal/state-pending` | `task/pending` | Task · Pending · waiting for resources | Yes |
| `m05-proposal/state-taken-over` | `task/taken-over` | Task · Taken over | Yes |
| `m05-proposal/state-continue-starting` | `task/continue-starting` | Task · Continue · starting | Yes |
| `m05-proposal/state-continue-started` | `task/continue-started` | Task · Continue · new session started | Yes |
| `m05-proposal/state-continue-refused` | `task/continue-refused` | Task · Continue · refused | Yes |
| `m05-proposal/state-failed` | `task/failed-continue` | Task · Failed · Continue in a new session | Yes |
| `m05-proposal/overflow-running` | `task/overflow-running` | Task · Overflow · running | Yes |
| `m05-proposal/overflow-settled` | `task/overflow-settled` | Task · Overflow · settled | Yes |
| `m05-proposal/overflow-subtask` | `task/overflow-subtask` | Task · Overflow · sub-task | Yes |
| `m05-proposal/cancel-dialog` | `task/stop-dialog` | Task · Stop confirmation | Yes |
| `m05-proposal/cancel-dialog-lineage` | `task/stop-dialog-earlier-turns` | Task · Stop confirmation · earlier turns | Yes |
| `m05-proposal/takeover-dialog` | `task/takeover-dialog` | Task · Takeover · confirmation | Yes |
| `m05-proposal/topbar-facts` | `task/topbar-facts` | Task · Top bar · chips reach facts | Yes |
| `m05-proposal/topbar-resource` | `task/topbar-resource` | Task · Top bar · resource context | Yes |
| `m05-proposal/topbar-minimum` | `task/topbar-minimum` | Task · Top bar · 1000 × 620 | Yes |
| `m05-proposal/changes-single` | `task/changes-single` | Task · Changes · one repository | Yes |
| `m05-proposal/changes-multi` | `task/changes-multi` | Task · Changes · 8 repositories × 2 scopes | Yes |
| `m05-proposal/changes-multi-limited` | `task/changes-multi-limited` | Task · Changes · 8 repositories, some limited | Yes |
| `m05-proposal/changes-same-path` | `task/changes-same-path` | Task · Changes · same path in both scopes | Yes |
| `m05-proposal/changes-row-states` | `task/changes-row-states` | Task · Changes · row content states | Yes |
| `m05-proposal/changes-incomplete` | `task/changes-incomplete` | Task · Changes · incomplete | Yes |
| `m05-proposal/changes-not-captured` | `task/changes-not-captured` | Task · Changes · not captured | Yes |
| `m05-proposal/changes-unmerged` | `task/changes-unmerged` | Task · Changes · conflicts unknown | Yes |
| `m05-proposal/changes-running` | `task/changes-running` | Task · Changes · running | Yes |
| `m05-proposal/changes-zero` | `task/changes-zero` | Task · Changes · zero rows, complete | Yes |
| `m05-proposal/changes-no-repository` | `task/changes-no-repository` | Task · Changes · no repository | Yes |
| `m05-proposal/changes-text` | `task/changes-text` | Task · Changes · reading one diff | Yes |
| `m05-proposal/changes-loading` | `task/changes-loading` | Task · Changes · loading | Yes |
| `m05-proposal/changes-error` | `task/changes-error` | Task · Changes · unavailable | Yes |
| `m05-proposal/changes-turns` | `task/changes-turns` | Task · Changes · which turn | Yes |
| `m05-proposal/events-populated` | `task/events-populated` | Task · Events · facts and records | Yes |
| `m05-proposal/events-page` | `task/events-page` | Task · Events · paged records | Yes |
| `m05-proposal/events-page-error` | `task/events-page-error` | Task · Events · next page failed | Yes |
| `m05-proposal/events-not-started` | `task/events-not-started` | Task · Pane · task not started | Yes |
| `m05-proposal/events-loading` | `task/events-loading` | Task · Events · loading | Yes |
| `m05-proposal/events-empty` | `task/events-empty` | Task · Events · empty window | Yes |
| `m05-proposal/events-error` | `task/events-error` | Task · Events · unavailable | Yes |
| `m05-proposal/artifacts-populated` | `task/artifacts-populated` | Task · Artifacts · populated | Yes, provisional |
| `m05-proposal/artifacts-page-error` | `task/artifacts-page-error` | Task · Artifacts · next page failed | Yes, provisional |
| `m05-proposal/artifacts-empty` | `task/artifacts-empty` | Task · Artifacts · empty | Yes, provisional |
| `m05-proposal/artifacts-loading` | `task/artifacts-loading` | Task · Artifacts · loading | Yes, provisional |
| `m05-proposal/artifacts-error` | `task/artifacts-error` | Task · Artifacts · unavailable | Yes, provisional |
| `m05-proposal/adaptive-overlay` | `task/pane-overlay` | Task · Pane over the transcript · 1000 × 620 | Yes |
| `m05-proposal/adaptive-split` | `task/pane-split` | Task · Pane beside the transcript · 1280 × 800 | Yes |
| `m05-proposal/adaptive-running-closed` | `task/pane-running-closed` | Task · Running · pane closed by default | Yes |
| `m05-proposal/adaptive-running-open` | `task/pane-running-open` | Task · Running · pane opened | Yes |
| `m05-proposal/adaptive-failed-default` | `task/pane-failed-closed` | Task · Failed · default pane state | Yes |
| `m05-proposal/overview` | `records/task-overview` | Decision boards · Overview and decisions | No |
| `m05-proposal/retry-options` | `records/retry` | Decision boards · Decision · what Retry means | No |
| `m05-proposal/stop-options` | `records/stop` | Decision boards · Decision · Stop or Cancel | No |
| `m05-proposal/adaptive-options` | `records/adaptive` | Decision boards · Decision · pane at minimum | No |
| `m05-proposal/platform-options` | `records/platform` | Decision boards · Decision · top bar composition | No |

## Root hashes of the archived catalog

Before the restructure, the root `index.html` was the v1 catalog and its hashes were v1 routes (`#screen/state/theme`). The root page now opens v2. A root address with a hash opens the archived catalog at `archive/v1/index.html` with the same hash; paths such as `features/needs-you.html`, `scripts/…`, `styles/…`, `assets/…` and the v1 documents under `docs/` redirect to `archive/v1/…`.

## Moved documents

See the "Moved from" table in [decisions/README.md](decisions/README.md).
