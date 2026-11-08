/* Provisional redraws of the eight activity transcript states on the task screen: the same transcript
   content with the top bar, sidebar, composer and Events pane of the approved task screen. Not approved.
   Catalog controls are outside the native specimen. See v2/docs/decisions/README.md. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  var docs = H.componentDocs = H.componentDocs || {};

  // Labels of the catalog-only strip above the app frame. The Node test scans them for process names.
  var STRIPS = (H.catalogStrips = H.catalogStrips || {}).transcript = {
    label: 'Transcript review controls',
    provisional: 'Provisional · needs owner approval',
    note: 'Deterministic mock · design reference. Frame and the review controls are catalog-only.'
  };

  // [fixture and template id, route state, earlier route, title, description]
  var ROWS = [
    ['observed', 'transcript-observed', 'task/activity-observed', 'Task transcript · Observed activity', 'A qualified observed summary beside the current activity window; original request provenance remains explicit.'],
    ['loading', 'transcript-loading', 'task/activity-loading', 'Task transcript · Loading observations', 'Independent request and captured activity reads; missing totals are never shown as zero.'],
    ['partial', 'transcript-partial', 'task/activity-partial', 'Task transcript · Incomplete history', 'Known loss and partial request text retain their qualifications.'],
    ['unavailable', 'transcript-unavailable', 'task/activity-unavailable', 'Task transcript · Observation unavailable', 'A read refusal or unsupported capability is separate from task execution status.'],
    ['integrity-failed', 'transcript-integrity-failed', 'task/activity-integrity-failed', 'Task transcript · Request integrity failure', 'Questionable assignment text is withheld while independent task facts remain visible.'],
    ['reconnecting', 'transcript-reconnecting', 'task/activity-reconnecting', 'Task transcript · Reconnect and source change', 'Cached rows retain reading position; a changed source requires an explicit new view.'],
    ['capacity', 'transcript-capacity', 'task/activity-capacity', 'Task transcript · Reading window at capacity', 'Keep the current rows and position; independently qualified summary facts can remain available.'],
    ['events', 'transcript-sources', 'task/activity-sources', 'Task transcript · Normalized and recovered sources', 'Public normalized records and stubs retain file order, with a separate recovery source.']
  ];
  H.transcriptRows = ROWS.map(function (row) { return { mount: row[0], state: row[1], route: 'task/' + row[1], redrawOf: row[2] }; });

  ROWS.forEach(function (row) {
    var id = row[0], key = 'transcript/' + id;
    T[key] = '<div class="hd-m05 hd-tr-host" data-theme="{{theme}}" data-light-on="{{lightOn}}" data-dark-on="{{darkOn}}" data-system-on="{{systemOn}}" data-transcript-state="' + id + '"><div class="hd-m05-catalog" aria-label="' + STRIPS.label + '"></div><div class="hd-m05-stage"></div></div>';
    docs[key] = '<p><strong>Provisional redraw, not approved.</strong> The owner has not approved this layout, so it carries no approval date. The <a href="#' + row[2] + '">earlier layout</a> stays listed until the owner decides. <a href="docs/decisions/README.md#provisional-redraws-awaiting-owner-review">What each redraw answers</a>.</p>' +
      '<p>The transcript region carries the earlier state unchanged: request disclosure, boundary notice, rows, history actions and live announcements, with the same fixtures and copy. It sits in the approved task screen frame: sidebar, top bar with the status and the right pane toggle, and the composer for the run status.</p>' +
      '<p>The right pane opens on Events with the earlier side pane sections unchanged. Open it with the toggle in the top bar, or append <code>/events</code> to the route to open it at load. The Changes and Artifacts tabs are disabled: the earlier state has no changes or artifacts data.</p>' +
      '<p>Frame, Request, History and Totals are catalog-only review controls. All interactions use deterministic local fixtures; the request uses a tiny ASCII mock bound of 64 to 128 bytes. Catalog route and appearance changes reset the browser mock. Native pixel and accessibility acceptance remain separate.</p>';
    H.registerState('task', {
      id: row[1], title: row[3], description: row[4] + ' Task screen redraw of the earlier layout.', group: 'Transcript',
      status: 'provisional', approvalNote: STRIPS.provisional, redrawOf: row[2], views: ['events'],
      source: { template: key, renderer: 'transcript', mount: id, guide: key }
    });
  });
})();
