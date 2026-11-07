/* Owner-approved activity transcript states of the task screen; native acceptance remains separate. Catalog controls are outside the native specimen. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  var docs = H.componentDocs = H.componentDocs || {};
  ['observed','loading','partial','unavailable','integrity-failed','reconnecting','capacity','events'].forEach(function (state) {
    docs['d2b-proposal/' + state] = '<p>Owner approved this direction on 2026-11-05 with button-spacing and canonical-sidebar corrections, now applied. Native pixel and accessibility acceptance remain separate.</p><p>The reference app is 1280 × 800; the catalog-only Size picker also shows the native minimum of 1000 × 620. Fonts and spacing do not scale. Browser sizing is an approximation, not native pixel acceptance. Review controls are catalog-only and add height above the app. The request uses a tiny ASCII mock bound of 64 → 128 bytes; the native default is 65536 bytes and maximum is 131072 bytes. Read more replaces the bounded prefix.</p><p>Catalog route and appearance rerenders reset the browser mock. Native appearance changes must preserve reading anchors. Activity windows and captured activity totals have independent coverage; scrolling alone changes neither the task status nor summary authority.</p><p>All interactions use deterministic local fixtures. <a href="docs/d2b-observation-proposal.md">Activity semantics and native handoff</a>.</p>';
    T['d2b-proposal/' + state] = '<div class="hd-d2b" data-theme="{{theme}}" data-light-on="{{lightOn}}" data-dark-on="{{darkOn}}" data-system-on="{{systemOn}}" data-d2b-state="' + state + '"><div class="hdc-d2b-controls" data-d2b-controls></div><div class="hd-app hd-d2b-app"><div data-d2b-sidebar></div><main class="hd-main"><div class="hd-topbar"><span class="hd-topbar__title">Fix slot release test</span><span data-d2b-status></span><span class="hd-topbar__meta">Codex · HarflowMCP</span></div><div class="hd-d2b-body"><section class="hd-d2b-conversation" aria-label="Task conversation"><div data-d2b-request></div><div class="hd-scroll hd-d2b-history" tabindex="0" aria-label="Captured transcript"><div data-d2b-boundary tabindex="-1"></div><div data-d2b-rows></div></div><div class="hd-d2b-live hd-muted" role="status" aria-live="polite" data-d2b-live></div></section><aside class="hd-pane hd-d2b-pane" aria-label="Captured activity"><div class="hd-pane__head">Events</div><div class="hd-scroll hd-d2b-facts" data-d2b-facts></div></aside></div></main></div></div>';
  });

  // Labels of the catalog-only strip above the app frame. The Node test scans them for process names.
  (H.catalogStrips = H.catalogStrips || {}).d2b = { controls: 'Review controls · catalog only', note: 'Deterministic mock · design reference' };
  var APPROVAL = { by: 'the owner', date: '2026-11-05', decision: 'Activity transcript states · requested corrections applied' };
  // Routes: [renderer id, state, title, description]. The renderer id stays the template key.
  [
    ["observed", "activity-observed", "Observed captured activity", "A qualified observed summary beside the current activity window; original request provenance remains explicit."],
    ["loading", "activity-loading", "Loading observations", "Independent request and captured activity reads; missing totals are never shown as zero."],
    ["partial", "activity-partial", "Incomplete captured history", "Known loss and partial request text retain their qualifications."],
    ["unavailable", "activity-unavailable", "Observation unavailable", "A read refusal or unsupported capability is separate from task execution status."],
    ["integrity-failed", "activity-integrity-failed", "Request integrity failure", "Questionable assignment text is withheld while independent task facts remain visible."],
    ["reconnecting", "activity-reconnecting", "Reconnect and source change", "Cached rows retain reading position; a changed source requires an explicit new view."],
    ["capacity", "activity-capacity", "Reading window at capacity", "Keep the current rows and position; independently qualified summary facts can remain available."],
    ["events", "activity-sources", "Normalized and recovered sources", "Public normalized records and stubs retain file order, with a separate recovery source."]
  ].forEach(function (row) {
    H.registerState('task', {
      id: row[1], title: row[2], description: row[3], group: 'Transcript', status: 'approved', approval: APPROVAL,
      source: { template: 'd2b-proposal/' + row[0], renderer: 'd2b', mount: row[0], guide: 'd2b-proposal/' + row[0] }
    });
  });
})();
