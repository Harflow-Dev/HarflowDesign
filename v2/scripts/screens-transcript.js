/* Owner-approved transcript states of the task screen: the activity transcript content with the top bar,
   sidebar, composer and Events pane of the task screen. Catalog controls are outside the native specimen.
   See v2/docs/decisions/README.md. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  var docs = H.componentDocs = H.componentDocs || {};

  // Labels of the catalog-only strip above the app frame. The Node test scans them for process names.
  var STRIPS = (H.catalogStrips = H.catalogStrips || {}).transcript = {
    label: 'Transcript review controls',
    approved: 'Approved · owner 2026-11-08',
    note: 'Deterministic mock · design reference. Frame and the review controls are catalog-only.'
  };
  var APPROVAL = { by: 'the owner', date: '2026-11-08', decision: 'Task transcript' };

  // [fixture and template id, route state, title, description]
  var ROWS = [
    ['observed', 'transcript-observed', 'Task transcript · Observed activity', 'A qualified observed summary beside the current activity window; original request provenance remains explicit.'],
    ['loading', 'transcript-loading', 'Task transcript · Loading observations', 'Independent request and captured activity reads; missing totals are never shown as zero.'],
    ['partial', 'transcript-partial', 'Task transcript · Incomplete history', 'Known loss and partial request text retain their qualifications.'],
    ['unavailable', 'transcript-unavailable', 'Task transcript · Observation unavailable', 'A read refusal or unsupported capability is separate from task execution status.'],
    ['integrity-failed', 'transcript-integrity-failed', 'Task transcript · Request integrity failure', 'Questionable assignment text is withheld while independent task facts remain visible.'],
    ['reconnecting', 'transcript-reconnecting', 'Task transcript · Reconnect and source change', 'Cached rows retain reading position; a changed source requires an explicit new view.'],
    ['capacity', 'transcript-capacity', 'Task transcript · Reading window at capacity', 'Keep the current rows and position; independently qualified summary facts can remain available.'],
    ['events', 'transcript-sources', 'Task transcript · Normalized and recovered sources', 'Public normalized records and stubs retain file order, with a separate recovery source.']
  ];
  H.transcriptRows = ROWS.map(function (row) { return { mount: row[0], state: row[1], route: 'task/' + row[1] }; });

  ROWS.forEach(function (row) {
    var id = row[0], key = 'transcript/' + id;
    T[key] = '<div class="hd-m05 hd-tr-host" data-theme="{{theme}}" data-light-on="{{lightOn}}" data-dark-on="{{darkOn}}" data-system-on="{{systemOn}}" data-transcript-state="' + id + '"><div class="hd-m05-catalog" aria-label="' + STRIPS.label + '"></div><div class="hd-m05-stage"></div></div>';
    docs[key] = '<p><strong>Approved by the owner, 2026-11-08.</strong> The transcript of a task inside the task screen frame: sidebar, top bar with the status and the right pane toggle, the transcript and the composer for the run status. <a href="docs/decisions/README.md#centered-and-transcript-redraws">Decision record</a>. Approval does not establish native pixel fidelity or product acceptance.</p>' +
      '<p>The transcript region holds the request disclosure, boundary notice, rows, history actions and live announcements. The right pane opens on Events with the captured activity sections: the task snapshot, the captured activity totals, the normalized records with Copy record, the Recovered message disclosure and Record ordering. Open it with the toggle in the top bar, or <a href="#task/' + row[1] + '/events">open this state with Events open</a>; appending <code>/events</code> to the route opens it at load. The Changes and Artifacts tabs are disabled, because this state has no changes or artifacts data.</p>' +
      '<p>Frame, Request, History and Totals are catalog-only review controls. All interactions use deterministic local fixtures; the request uses a tiny ASCII mock bound of 64 to 128 bytes. Catalog route and appearance changes reset the browser mock. Native pixel and accessibility acceptance remain separate.</p>';
    H.registerState('task', {
      id: row[1], title: row[2], description: row[3], group: 'Transcript',
      status: 'approved', approval: APPROVAL, views: ['events'],
      source: { template: key, renderer: 'transcript', mount: id, guide: key }
    });
  });
})();
