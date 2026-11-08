// Owner-decided replacements. A retired state is no longer registered, so it is not listed in
// navigation, the picker or the overview counts. Its route stays valid: HFV2.routeRedirects sends it
// to the state that replaced it (resolveRoute applies it after the route aliases, at most one hop), and
// HFV2.retired records what was retired. Templates that renderers clone for other states stay in
// HFV2.templates. The decisions README records each retirement with the commits where the old design
// can be seen. HFV2.pendingRedraw lists older states that stay listed until the owner approves their
// provisional redraw.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});

  var Q = 'Owner answer 2026-11-08';
  // Pins: the commits where the old design can be seen, with its route name at each (m04-proposal/* at
  // 17739e4, the current name at bce377c).
  function pinsOf(entry) {
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
    { route: 'new-task/sidebar-collapsed', title: 'New task · Sidebar collapsed', redirect: 'sidebar/collapsed', template: 'new-task/sidebar-collapsed', basis: Q + ' (Q2)' },
    { route: 'new-task/harness-menu', title: 'New task · Harness menu open', redirect: 'new-task/centered-ready', template: 'new-task/harness-menu', basis: Q + ' (Q2, Q3); the open harness pill is not drawn in the centered layout' },
    { route: 'new-task/composer-ready', title: 'New task · Composer · Ready', redirect: 'new-task/centered-ready', renderer: 'm04', mount: 'composer-ready', template: 'm04-proposal/composer-ready', basis: Q + ' (Q3)' },
    { route: 'new-task/composer-unknown', title: 'New task · Composer · Outcome unknown', redirect: 'new-task/centered-unknown', renderer: 'm04', mount: 'composer-unknown', template: 'm04-proposal/composer-unknown', basis: Q + ' (Q3)' },
    { route: 'new-task/options-open', title: 'New task · Task options · Open', redirect: 'new-task/centered-options', renderer: 'm04', mount: 'advanced', template: 'm04-proposal/advanced', basis: Q + ' (Q3)' }
  ];

  HFV2.retired = RETIRED.map(function (entry) {
    return { route: entry.route, title: entry.title, renderer: entry.renderer || null, mount: entry.mount || null, template: entry.template, redirect: entry.redirect, basis: entry.basis, pins: pinsOf(entry) };
  });

  HFV2.routeRedirects = {};
  HFV2.retired.forEach(function (entry) { HFV2.routeRedirects[entry.route] = entry.redirect; });

  // Redraws awaiting owner approval. Both states stay listed. On sign-off the pair moves into RETIRED
  // above, the earlier state, its templates and guides are removed, and a redirect that already targets the
  // earlier state is repointed to the redraw. The catalog notes each pair outside the specimen.
  HFV2.pendingRedraw = [
    { older: 'new-task/composer-loading', newer: 'new-task/centered-loading' },
    { older: 'new-task/composer-unqualified', newer: 'new-task/centered-unqualified' },
    { older: 'new-task/composer-invalid', newer: 'new-task/centered-invalid' },
    { older: 'new-task/composer-starting', newer: 'new-task/centered-starting' },
    { older: 'new-task/composer-refused', newer: 'new-task/centered-refused' },
    { older: 'new-task/options-closed', newer: 'new-task/centered-options-closed' },
    { older: 'sidebar/expanded', newer: 'sidebar/centered-expanded' },
    { older: 'sidebar/collapsed', newer: 'sidebar/centered-collapsed' },
    { older: 'sidebar/minimum', newer: 'sidebar/centered-minimum' },
    { older: 'task/activity-observed', newer: 'task/transcript-observed' },
    { older: 'task/activity-loading', newer: 'task/transcript-loading' },
    { older: 'task/activity-partial', newer: 'task/transcript-partial' },
    { older: 'task/activity-unavailable', newer: 'task/transcript-unavailable' },
    { older: 'task/activity-integrity-failed', newer: 'task/transcript-integrity-failed' },
    { older: 'task/activity-reconnecting', newer: 'task/transcript-reconnecting' },
    { older: 'task/activity-capacity', newer: 'task/transcript-capacity' },
    { older: 'task/activity-sources', newer: 'task/transcript-sources' }
  ];
})();
