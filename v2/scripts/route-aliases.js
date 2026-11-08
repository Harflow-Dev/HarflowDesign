// Old routes that now open another route. An alias never changes meaning: the old route and its target
// render the same template through the same renderer. Keys are never reused as canonical routes.
// An owner-decided redirect (HFV2.routeRedirects in supersessions.js) sends a retired route to its
// replacement; resolveRoute applies the alias first and then at most one redirect.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  HFV2.routeAliases = {
    'm04-proposal/amendment-empty': 'new-task/centered-empty',
    'm04-proposal/composer-loading': 'new-task/composer-loading',
    'm04-proposal/composer-ready': 'new-task/composer-ready',
    'm04-proposal/composer-unqualified': 'new-task/composer-unqualified',
    'm04-proposal/composer-invalid': 'new-task/composer-invalid',
    'm04-proposal/composer-starting': 'new-task/composer-starting',
    'm04-proposal/composer-refused': 'new-task/composer-refused',
    'm04-proposal/composer-unknown': 'new-task/composer-unknown',
    'm04-proposal/amendment-ready': 'new-task/centered-ready',
    'm04-proposal/amendment-growing': 'new-task/centered-growing',
    'm04-proposal/amendment-capped': 'new-task/centered-capped',
    'm04-proposal/amendment-unknown': 'new-task/centered-unknown',
    'm04-proposal/advanced': 'new-task/options-open',
    'm04-proposal/advanced-closed': 'new-task/options-closed',
    'm04-proposal/amendment-options': 'new-task/centered-options',
    'm04-proposal/shell': 'sidebar/expanded',
    'm04-proposal/shell-collapsed': 'sidebar/collapsed',
    'm04-proposal/shell-narrow': 'sidebar/minimum',
    'm04-proposal/history-empty': 'sidebar/history-empty',
    'm04-proposal/history-loading': 'sidebar/history-loading',
    'm04-proposal/history-older': 'sidebar/history-older',
    'm04-proposal/history-error': 'sidebar/history-error',
    'm04-proposal/history-reconnecting': 'sidebar/history-reconnecting',
    'm04-proposal/history-retained': 'sidebar/history-retained',
    'm05-proposal/state-running': 'task/running-stop',
    'm05-proposal/state-stopping': 'task/stop-requested',
    'm05-proposal/state-cancelled': 'task/cancelled',
    'm05-proposal/state-cancel-partial': 'task/cancelled-partial',
    'm05-proposal/state-timed-out': 'task/timed-out',
    'm05-proposal/state-settling': 'task/settling',
    'm05-proposal/state-unknown-failed': 'task/unknown-failed',
    'm05-proposal/state-unknown-done': 'task/unknown-done',
    'm05-proposal/state-owner-lost': 'task/owner-lost',
    'm05-proposal/state-unverified': 'task/unverified',
    'm05-proposal/state-launch-unknown': 'task/launch-unknown',
    'm05-proposal/state-status-unavailable': 'task/status-unavailable',
    'm05-proposal/state-pending': 'task/pending',
    'm05-proposal/state-taken-over': 'task/taken-over',
    'm05-proposal/state-continue-starting': 'task/continue-starting',
    'm05-proposal/state-continue-started': 'task/continue-started',
    'm05-proposal/state-continue-refused': 'task/continue-refused',
    'm05-proposal/state-failed': 'task/failed-continue',
    'm05-proposal/overflow-running': 'task/overflow-running',
    'm05-proposal/overflow-settled': 'task/overflow-settled',
    'm05-proposal/overflow-subtask': 'task/overflow-subtask',
    'm05-proposal/cancel-dialog': 'task/stop-dialog',
    'm05-proposal/cancel-dialog-lineage': 'task/stop-dialog-earlier-turns',
    'm05-proposal/takeover-dialog': 'task/takeover-dialog',
    'm05-proposal/topbar-facts': 'task/topbar-facts',
    'm05-proposal/topbar-resource': 'task/topbar-resource',
    'm05-proposal/topbar-minimum': 'task/topbar-minimum',
    'd2b-proposal/observed': 'task/activity-observed',
    'd2b-proposal/loading': 'task/activity-loading',
    'd2b-proposal/partial': 'task/activity-partial',
    'd2b-proposal/unavailable': 'task/activity-unavailable',
    'd2b-proposal/integrity-failed': 'task/activity-integrity-failed',
    'd2b-proposal/reconnecting': 'task/activity-reconnecting',
    'd2b-proposal/capacity': 'task/activity-capacity',
    'd2b-proposal/events': 'task/activity-sources',
    'm05-proposal/changes-single': 'task/changes-single',
    'm05-proposal/changes-multi': 'task/changes-multi',
    'm05-proposal/changes-multi-limited': 'task/changes-multi-limited',
    'm05-proposal/changes-same-path': 'task/changes-same-path',
    'm05-proposal/changes-row-states': 'task/changes-row-states',
    'm05-proposal/changes-incomplete': 'task/changes-incomplete',
    'm05-proposal/changes-not-captured': 'task/changes-not-captured',
    'm05-proposal/changes-unmerged': 'task/changes-unmerged',
    'm05-proposal/changes-running': 'task/changes-running',
    'm05-proposal/changes-zero': 'task/changes-zero',
    'm05-proposal/changes-no-repository': 'task/changes-no-repository',
    'm05-proposal/changes-text': 'task/changes-text',
    'm05-proposal/changes-loading': 'task/changes-loading',
    'm05-proposal/changes-error': 'task/changes-error',
    'm05-proposal/changes-turns': 'task/changes-turns',
    'm05-proposal/events-populated': 'task/events-populated',
    'm05-proposal/events-page': 'task/events-page',
    'm05-proposal/events-page-error': 'task/events-page-error',
    'm05-proposal/events-not-started': 'task/events-not-started',
    'm05-proposal/events-loading': 'task/events-loading',
    'm05-proposal/events-empty': 'task/events-empty',
    'm05-proposal/events-error': 'task/events-error',
    'm05-proposal/artifacts-populated': 'task/artifacts-populated',
    'm05-proposal/artifacts-page-error': 'task/artifacts-page-error',
    'm05-proposal/artifacts-empty': 'task/artifacts-empty',
    'm05-proposal/artifacts-loading': 'task/artifacts-loading',
    'm05-proposal/artifacts-error': 'task/artifacts-error',
    'm05-proposal/adaptive-overlay': 'task/pane-overlay',
    'm05-proposal/adaptive-split': 'task/pane-split',
    'm05-proposal/adaptive-running-closed': 'task/pane-running-closed',
    'm05-proposal/adaptive-running-open': 'task/pane-running-open',
    'm05-proposal/adaptive-failed-default': 'task/pane-failed-closed',
    'm04-proposal/runtime-checking': 'harness-runtime/checking',
    'm04-proposal/runtime-install-required': 'harness-runtime/install-required',
    'm04-proposal/runtime-update-required': 'harness-runtime/update-required',
    'm04-proposal/runtime-installing': 'harness-runtime/installing',
    'm04-proposal/runtime-failed': 'harness-runtime/failed',
    'm04-proposal/runtime-listing': 'harness-runtime/listing',
    'm05-proposal/overview': 'records/task-overview',
    'm05-proposal/retry-options': 'records/retry',
    'm05-proposal/stop-options': 'records/stop',
    'm05-proposal/adaptive-options': 'records/adaptive',
    'm05-proposal/platform-options': 'records/platform'
  };

  // Route grammar: #family/state[/view][/appearance]. A state declares the views it has (`views` in the
  // registry); the segment after the state is a view only when the state declares it, and an appearance
  // only when it is light, dark or system. Any other segment is dropped when the route is canonicalised.
  var ROUTE_PATTERN = /^#([a-z0-9-]+)\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?(?:\/([a-z0-9-]+))?$/;
  var APPEARANCES = ['light', 'dark', 'system'];

  var own = function (map, key) { return Object.prototype.hasOwnProperty.call(map, key); };

  // Splits a route hash into its parts without judging the view: { family, state, view, appearance }, or
  // null when the hash is not a route. With four segments the last must be an appearance.
  HFV2.parseRoute = function (hash) {
    var match = ROUTE_PATTERN.exec(hash || '');
    if (!match) return null;
    var view = null, appearance = null;
    if (match[4]) {
      if (APPEARANCES.indexOf(match[4]) < 0) return null;
      view = match[3];
      appearance = match[4];
    } else if (match[3]) {
      if (APPEARANCES.indexOf(match[3]) >= 0) appearance = match[3];
      else view = match[3];
    }
    return { family: match[1], state: match[2], view: view, appearance: appearance };
  };

  // The views a registered route declares, or an empty list.
  HFV2.viewsOf = function (route) {
    var parts = String(route).split('/');
    var family = HFV2.findFamily && HFV2.findFamily(parts[0]);
    var state = family && HFV2.findState(family, parts[1]);
    return (state && state.views) || [];
  };

  // Returns the canonical hash for a route hash, keeping its /light, /dark or /system suffix.
  // The alias is applied first, then at most one redirect. A view is kept across both when the final route
  // declares it and dropped otherwise, so an undeclared view never reaches the catalog. A hash that is not
  // a route is returned unchanged.
  HFV2.resolveRoute = function (hash) {
    var parsed = HFV2.parseRoute(hash);
    if (!parsed) return hash;
    var key = parsed.family + '/' + parsed.state;
    var target = own(HFV2.routeAliases, key) ? HFV2.routeAliases[key] : key;
    var redirects = HFV2.routeRedirects || {};
    if (own(redirects, target)) target = redirects[target];
    var view = parsed.view && HFV2.viewsOf(target).indexOf(parsed.view) >= 0 ? parsed.view : null;
    var canonical = '#' + target + (view ? '/' + view : '') + (parsed.appearance ? '/' + parsed.appearance : '');
    return canonical === hash ? hash : canonical;
  };
})();
