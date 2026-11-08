// Owner-decided replacements. A retired state is no longer registered, so it is not listed in
// navigation, the picker or the overview counts. Its route stays valid: HFV2.routeRedirects sends it
// to the state that replaced it (resolveRoute applies it after the route aliases, at most one hop), and
// HFV2.retired records what was retired. Templates that renderers clone for other states stay in
// HFV2.templates. The decisions README records each retirement with the commits where the old design
// can be seen. HFV2.pendingRedraw lists older states that stay listed until the owner approves their
// redraw; it is empty while no redraw is waiting.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});

  var Q = 'Owner answer 2026-11-08';
  var R = Q + ': redraws accepted';
  // Pins: the commits where the old design can be seen, with its route name at each (m04-proposal/* at
  // 17739e4, the current name at bce377c).
  function pinsOf(entry) {
    if (entry.pins) return entry.pins;
    return entry.mount
      ? 'm04-proposal/' + entry.mount + ' at 17739e4; ' + entry.route + ' at bce377c'
      : entry.route + ' at 17739e4 and bce377c';
  }

  // route, redirect target, renderer and mount (when a renderer drew it), template key, basis.
  var RETIRED = [
    { route: 'task/running', title: 'Task · Running', redirect: 'task/running-stop', template: 'task/running', basis: Q + ' (Q5)' },
    { route: 'task/done', title: 'Task · Done, changes pane', redirect: 'task/changes-single', template: 'task/done', basis: Q + ' (Q1)' },
    { route: 'task/failed', title: 'Task · Failed', redirect: 'task/failed-continue', template: 'task/failed', basis: 'The approved row for the failed state replaces Retry with Continue in a new session.' },
    { route: 'new-task/default', title: 'New task · Default', redirect: 'new-task/centered-empty', template: 'new-task/default', basis: Q + ' (Q2); target confirmed by the coordinator 2026-11-08' },
    { route: 'new-task/sidebar-collapsed', title: 'New task · Sidebar collapsed', redirect: 'sidebar/centered-collapsed', template: 'new-task/sidebar-collapsed', basis: Q + ' (Q2)' },
    { route: 'new-task/harness-menu', title: 'New task · Harness menu open', redirect: 'new-task/centered-harness-open', template: 'new-task/harness-menu', basis: Q + ' (Q2, Q3); the open harness picker is drawn in the centered layout' },
    { route: 'new-task/composer-ready', title: 'New task · Composer · Ready', redirect: 'new-task/centered-ready', renderer: 'm04', mount: 'composer-ready', template: 'm04-proposal/composer-ready', basis: Q + ' (Q3)' },
    { route: 'new-task/composer-unknown', title: 'New task · Composer · Outcome unknown', redirect: 'new-task/centered-unknown', renderer: 'm04', mount: 'composer-unknown', template: 'm04-proposal/composer-unknown', basis: Q + ' (Q3)' },
    { route: 'new-task/options-open', title: 'New task · Task options · Open', redirect: 'new-task/centered-options', renderer: 'm04', mount: 'advanced', template: 'm04-proposal/advanced', basis: Q + ' (Q3)' },
    { route: 'new-task/composer-loading', title: 'New task · Composer · Checking options', redirect: 'new-task/centered-loading', renderer: 'm04', mount: 'composer-loading', template: 'm04-proposal/composer-loading', basis: R, pins: 'new-task/composer-loading at 3f12d29' },
    { route: 'new-task/composer-unqualified', title: 'New task · Composer · Unavailable options', redirect: 'new-task/centered-unqualified', renderer: 'm04', mount: 'composer-unqualified', template: 'm04-proposal/composer-unqualified', basis: R, pins: 'new-task/composer-unqualified at 3f12d29' },
    { route: 'new-task/composer-invalid', title: 'New task · Composer · Validation', redirect: 'new-task/centered-invalid', renderer: 'm04', mount: 'composer-invalid', template: 'm04-proposal/composer-invalid', basis: R, pins: 'new-task/composer-invalid at 3f12d29' },
    { route: 'new-task/composer-starting', title: 'New task · Composer · Starting', redirect: 'new-task/centered-starting', renderer: 'm04', mount: 'composer-starting', template: 'm04-proposal/composer-starting', basis: R, pins: 'new-task/composer-starting at 3f12d29' },
    { route: 'new-task/composer-refused', title: 'New task · Composer · Refused', redirect: 'new-task/centered-refused', renderer: 'm04', mount: 'composer-refused', template: 'm04-proposal/composer-refused', basis: R, pins: 'new-task/composer-refused at 3f12d29' },
    { route: 'new-task/options-closed', title: 'New task · Task options · Closed', redirect: 'new-task/centered-options-closed', renderer: 'm04', mount: 'advanced-closed', template: 'm04-proposal/advanced-closed', basis: R, pins: 'new-task/options-closed at 3f12d29 (mount advanced-closed)' },
    { route: 'sidebar/expanded', title: 'Sidebar · Shell · Expanded', redirect: 'new-task/centered-empty', renderer: 'm04', mount: 'shell', template: 'm04-proposal/shell', basis: R, pins: 'sidebar/expanded at 3f12d29 (mount shell)' },
    { route: 'sidebar/centered-expanded', title: 'Sidebar · Centered shell · Expanded', redirect: 'new-task/centered-empty', renderer: 'm04', mount: 'centered-shell', template: 'm04-proposal/centered-shell', basis: R, pins: 'sidebar/centered-expanded at 3f12d29 (mount centered-shell)' },
    { route: 'sidebar/collapsed', title: 'Sidebar · Shell · Collapsed rail', redirect: 'sidebar/centered-collapsed', renderer: 'm04', mount: 'shell-collapsed', template: 'm04-proposal/shell-collapsed', basis: R, pins: 'sidebar/collapsed at 3f12d29 (mount shell-collapsed)' },
    { route: 'sidebar/minimum', title: 'Sidebar · Shell · Minimum window', redirect: 'sidebar/centered-minimum', renderer: 'm04', mount: 'shell-narrow', template: 'm04-proposal/shell-narrow', basis: R, pins: 'sidebar/minimum at 3f12d29 (mount shell-narrow)' },
    { route: 'task/activity-observed', title: 'Task · Observed captured activity', redirect: 'task/transcript-observed', renderer: 'd2b', mount: 'observed', template: 'd2b-proposal/observed', basis: R, pins: 'task/activity-observed at 3f12d29 (mount observed)' },
    { route: 'task/activity-loading', title: 'Task · Loading observations', redirect: 'task/transcript-loading', renderer: 'd2b', mount: 'loading', template: 'd2b-proposal/loading', basis: R, pins: 'task/activity-loading at 3f12d29 (mount loading)' },
    { route: 'task/activity-partial', title: 'Task · Incomplete captured history', redirect: 'task/transcript-partial', renderer: 'd2b', mount: 'partial', template: 'd2b-proposal/partial', basis: R, pins: 'task/activity-partial at 3f12d29 (mount partial)' },
    { route: 'task/activity-unavailable', title: 'Task · Observation unavailable', redirect: 'task/transcript-unavailable', renderer: 'd2b', mount: 'unavailable', template: 'd2b-proposal/unavailable', basis: R, pins: 'task/activity-unavailable at 3f12d29 (mount unavailable)' },
    { route: 'task/activity-integrity-failed', title: 'Task · Request integrity failure', redirect: 'task/transcript-integrity-failed', renderer: 'd2b', mount: 'integrity-failed', template: 'd2b-proposal/integrity-failed', basis: R, pins: 'task/activity-integrity-failed at 3f12d29 (mount integrity-failed)' },
    { route: 'task/activity-reconnecting', title: 'Task · Reconnect and source change', redirect: 'task/transcript-reconnecting', renderer: 'd2b', mount: 'reconnecting', template: 'd2b-proposal/reconnecting', basis: R, pins: 'task/activity-reconnecting at 3f12d29 (mount reconnecting)' },
    { route: 'task/activity-capacity', title: 'Task · Reading window at capacity', redirect: 'task/transcript-capacity', renderer: 'd2b', mount: 'capacity', template: 'd2b-proposal/capacity', basis: R, pins: 'task/activity-capacity at 3f12d29 (mount capacity)' },
    { route: 'task/activity-sources', title: 'Task · Normalized and recovered sources', redirect: 'task/transcript-sources', renderer: 'd2b', mount: 'events', template: 'd2b-proposal/events', basis: R, pins: 'task/activity-sources at 3f12d29 (mount events)' },
    { route: 'sidebar/history-loading', title: 'Sidebar · History · Loading', redirect: 'sidebar/loading', renderer: 'm04', mount: 'history-loading', template: 'm04-proposal/history-loading', basis: Q + ': skeleton rows chosen for the first listing', pins: 'sidebar/history-loading at 854caae (mount history-loading)' }
  ];

  HFV2.retired = RETIRED.map(function (entry) {
    return { route: entry.route, title: entry.title, renderer: entry.renderer || null, mount: entry.mount || null, template: entry.template, redirect: entry.redirect, basis: entry.basis, pins: pinsOf(entry) };
  });

  HFV2.routeRedirects = {};
  HFV2.retired.forEach(function (entry) { HFV2.routeRedirects[entry.route] = entry.redirect; });

  // Redraws awaiting owner approval. Both states of a pair stay listed. On sign-off the pair moves into
  // RETIRED above, the earlier state, its templates and guides are removed, and a redirect that already
  // targets the earlier state is repointed to the redraw. The catalog notes each pair outside the specimen.
  // One redraw is waiting: the exact-action approval, which removes the task-wide choice from the approval card.
  HFV2.pendingRedraw = [{ older: 'task/approval', newer: 'task/approval-exact' }];
})();
