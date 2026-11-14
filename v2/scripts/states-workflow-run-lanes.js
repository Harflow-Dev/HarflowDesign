/* Provisional lane state of a workflow run that has ended: a message queued to a lane before the run was cancelled is
   undeliverable. Not approved. The frame is the approved workflow-run/parallel template with the run shown as cancelled
   and the lane queue and composer drawn by the parallel group lane parts (states-parallel-lanes.js, H.laneParts).
   Deterministic display-only fixture; no engine calls. Decision record: docs/decisions/README.md (Queued messages and
   approval states). Loaded after screens-workflow-run.js and states-parallel-lanes.js. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});

  var FAMILY = 'workflow-run';
  var BASE = FAMILY + '/parallel';
  var ID = 'lane-message-undeliverable';
  var KEY = FAMILY + '/' + ID;
  var NOTE = 'Provisional · not approved';

  // Fixture content, not interface copy: the message a person typed, and the reason the engine supplies. The reason is the
  // example HarflowMac uses for an undeliverable bubble (WorkMessageQueue.swift, preview data, e4635dc).
  var MESSAGE = 'Also list which advisories have a fixed version.';
  var REASON = 'The workflow ended before this message could be delivered.';
  // Same form as the taken-over lane of the parallel group: a locked composer that says why.
  var LOCKED = 'Messages are off — this run was cancelled';

  var CANCELLED_GLYPH = '<span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span>';

  // The base with its only occurrence of `find` replaced. It throws when `find` is missing or not unique, so a changed
  // base cannot silently draw a different screen.
  function swap(html, find, replace) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + BASE + ': ' + find.slice(0, 60));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + BASE + ': ' + find.slice(0, 60));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close) {
    var from = html.indexOf(open), to = html.indexOf(close, from);
    if (from < 0 || to < 0) throw new Error('Block not found in ' + BASE + ': ' + open.slice(0, 60));
    return html.slice(from, to + close.length);
  }
  function lane(html, label) {
    return between(html, '<section class="hd-lane" aria-label="' + label + '"', '</section>');
  }
  var FOOT = /<div class="hd-lane__foot">[\s\S]*?<\/form><\/div>/;
  function locked(html, harness, slug) {
    var form = H.laneParts.composer({ harness: harness, slug: slug }, { locked: true, placeholder: LOCKED });
    return html.replace(FOOT, function () { return '<div class="hd-lane__foot">' + form + '</div>'; });
  }

  function build() {
    var html = T[BASE];
    if (typeof html !== 'string') throw new Error('No template ' + BASE);
    var parts = H.laneParts;

    // The frame hosts the queue styles (messages-screen.css).
    html = swap(html, '<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">', '<div class="hd-app hd-msgq-host" data-theme="{{theme}}" data-lane-state="' + ID + '" style="width: 100%; height: 800px;">');

    // The sidebar: the run leaves Running and is the first Recent work row, cancelled.
    var running = between(html, '<a class="hd-task-row is-active" href="#workflow-run/graph-needs-you">', '</a>');
    html = swap(html, running, '');
    html = swap(html, '<div class="hd-section__head">Running <span class="hd-section__count">3</span></div>', '<div class="hd-section__head">Running <span class="hd-section__count">2</span></div>');
    var recentOpen = '<div class="hd-section__head">Recent work</div>\n      <div class="hd-section__list">\n';
    var recentRow = '        <a class="hd-task-row hd-task-row--done is-active" href="#' + KEY + '">' + CANCELLED_GLYPH + '<span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">1m</span></a>\n';
    html = swap(html, recentOpen, recentOpen + recentRow);

    // The top bar: the run is cancelled, so it offers neither Pause nor Cancel run.
    html = swap(html, '<span class="hd-badge hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Running</span>', '<span class="hd-badge">Cancelled</span>');
    html = swap(html, '<button type="button" class="hd-btn hd-btn--ghost"><span class="hd-i hd-i--sm hd-i-pause" aria-hidden="true"></span> Pause</button><button type="button" class="hd-btn hd-btn--secondary">Cancel run</button>', '');

    // The lanes: the finished scan keeps its lane; the lane that was running ends cancelled with its queued message
    // undeliverable; the node that never started has no lane. Both composers are locked.
    var first = locked(lane(html, 'Scan Python deps'), 'Codex', 'codex');
    var second = lane(html, 'Scan npm deps');
    second = swap(second, '<span class="hd-glyph hd-glyph--running" aria-label="Running"></span><div style="flex:1', CANCELLED_GLYPH + '<div style="flex:1');
    second = swap(second, 'Running 02:51', 'Cancelled 02:51');
    second = swap(second, between(second, '<div class="hd-working">', '</span></div>'), '');
    var tail = parts.queue([{ kind: 'undeliverable', text: MESSAGE, note: REASON }]) + parts.endRow('cancelled', '02:51');
    second = swap(second, '</div><div class="hd-lane__foot">', tail + '</div><div class="hd-lane__foot">');
    second = locked(second, 'Claude Code', 'claude-code');
    var lanes = '<div class="hd-lanes">' + first + second + '</div>';

    var from = html.indexOf('<div class="hd-lanes">');
    var to = html.indexOf('\n  </main>', from);
    if (from < 0 || to < 0) throw new Error('Lanes not found in ' + BASE);
    return html.slice(0, from) + lanes + html.slice(to);
  }

  // Computed on first use: the parallel template and the lane parts load in any order.
  Object.defineProperty(T, KEY, {
    enumerable: true, configurable: true,
    get: function () {
      var value = build();
      Object.defineProperty(T, KEY, { enumerable: true, configurable: true, writable: true, value: value });
      return value;
    }
  });
  H.runLaneDerivation = { route: KEY, base: BASE, build: build, message: MESSAGE, reason: REASON, locked: LOCKED };

  docs[KEY] = '<p><strong>Provisional, not approved.</strong> A run that was cancelled, drawn as lanes. A message was queued to the lane that was running; the run ended before it could be delivered, so its bubble is captioned Undeliverable, carries the reason the engine supplies, has no Cancel and is not queued again. <a href="docs/decisions/README.md#queued-messages-and-approval-states-provisional">Decision record</a>, with the contract citation and the open owner checks.</p>' +
    '<p>Derived from the approved <a href="#workflow-run/parallel">Parallel view</a>: the run is cancelled, so the badge says so and Pause and Cancel run are gone, the run moves to Recent work, the lane that was running ends cancelled, the node that never started has no lane, and the lane composers are locked with the reason. Reason text and the message are fixture content.</p>' +
    '<p>Deterministic mock text; no engine, provider or network is involved.</p>';

  H.registerState(FAMILY, {
    id: ID, title: 'Parallel view, message undeliverable',
    description: 'A cancelled run as lanes. A message queued to a lane before the run ended is captioned Undeliverable with the engine\'s reason, and the lane composers are off.',
    group: 'Workflow run', status: 'provisional', approvalNote: NOTE
  });
  H.registerState(FAMILY, {
    id: ID + '-minimum', title: 'Parallel view, message undeliverable · 1000 × 620',
    description: 'The cancelled run with an undeliverable message, in the minimum window. Each lane keeps a 360 point floor and the lanes scroll horizontally; the top bar drops its meta text so the title stays whole, and its dot shows the text on hover and focus.',
    group: 'Minimum window', status: 'provisional', approvalNote: NOTE,
    minimum: { of: KEY, fixes: ['sidebar', 'lanes', 'topbar-meta'] }
  });
})();
