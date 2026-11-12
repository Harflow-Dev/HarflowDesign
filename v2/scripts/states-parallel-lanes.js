/* Parallel group: lane decisions of 2026-11-12 and the lane and group states the approved family never drew.
   Draft for owner review: every state here is provisional and none is approved. Deterministic display-only fixtures;
   no engine calls. Decision record: docs/decisions/parallel-group-proposal.md.
   Loaded after skeleton-specs.js (the loading state clones the approved parallel-group skeleton spec) and after
   screens-parallel-group.js (the sidebar is extracted from the approved lanes template, not rebuilt). */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});

  var NOTE = 'Not approved · draft for owner review, 2026-11-12';
  var FAMILY = 'parallel-group';
  var G_MAIN = 'Lane titles and actions', G_STATE = 'Lane states', G_MIN = 'Lanes at 1000 × 620';

  // ---- Fixtures --------------------------------------------------------------------------------------------------
  var LANES = {
    claude: {
      slug: 'claude', harness: 'Claude', model: 'Opus 5.5', title: 'Audit what the preload bridge exposes',
      prompt: 'Review the preload bridge for ways the renderer can reach Electron or Node APIs it should not. Report each exposure with the file and the line.',
      body: '<div class="hd-msg-agent"><p>Reviewing the preload bridge in <code>src/preload/bridge.ts</code>. Starting with what the renderer can reach through <code>contextBridge</code>.</p></div>' +
        tool('file', 'Read 6 files', '0:09') +
        '<div class="hd-msg-agent"><p><code>exposeInMainWorld</code> hands the renderer the raw <code>ipcRenderer.invoke</code>, so any channel name is callable. The allow-list in <code>channels.ts</code> is never applied here.</p></div>' +
        tool('terminal', 'Ran <code>rg "ipcRenderer" src/preload</code>', '0:02')
    },
    codex: {
      slug: 'codex', harness: 'Codex', model: 'gpt-6', title: 'Check the allow-list and sandbox settings',
      prompt: 'Check the preload bridge against the IPC channel allow-list and the sandbox settings. Report each gap as a finding.',
      body: '<div class="hd-msg-agent"><p>Checked the bridge against the channel allow-list and the sandbox settings.</p></div>' +
        tool('file', 'Read 5 files', '0:07') +
        '<div class="hd-msg-agent"><p>Three findings:</p><ul><li>the bridge exposes <code>ipcRenderer.invoke</code> without a channel check</li><li><code>sandbox</code> is off for the settings window</li><li>reply payloads from main are not validated before they reach the renderer</li></ul></div>'
    },
    opencode: {
      slug: 'opencode', harness: 'Opencode', model: '', title: 'Compare preload exports with renderer calls',
      prompt: 'Compare the functions the preload bridge exports with what the renderer actually calls. Report anything exported that the renderer does not need.',
      body: '<div class="hd-msg-agent"><p>Compared the preload exports with what the renderer actually calls.</p></div>' +
        tool('terminal', 'Ran <code>rg "window.harflow" src/renderer</code>', '0:03') +
        '<div class="hd-msg-agent"><p>Two findings:</p><ul><li>the bridge exposes <code>ipcRenderer.invoke</code> without a channel check</li><li><code>removeAllListeners</code> is exported, so the renderer can drop main-process listeners</li></ul></div>'
    }
  };

  function tool(icon, summary, meta) {
    return '<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-' + icon + '" aria-hidden="true"></span><span class="hd-tool__summary">' + summary + '</span><span class="hd-tool__meta">' + meta + '</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div>';
  }
  function working(text) {
    return '<div class="hd-working"><span class="hd-glyph hd-glyph--running is-animated" aria-hidden="true"></span><span>' + text + '</span></div>';
  }

  // ---- Lane parts ------------------------------------------------------------------------------------------------
  var GLYPH = {
    running: '<span class="hd-glyph hd-glyph--running" aria-label="Running"></span>',
    done: '<span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span>',
    failed: '<span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span>',
    cancelled: '<span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span>'
  };
  var WORD = { running: 'Running', done: 'Done', failed: 'Failed', cancelled: 'Cancelled' };

  // The caption under a lane title: the harness, then the model when it is known.
  function caption(l, extra) { return l.harness + (l.model ? ' · ' + l.model : '') + (extra ? ' · ' + extra : ''); }

  // The row that ends a settled lane. Done carries the duration only: no engine field counts findings.
  function endRow(kind, clock, extra) {
    var text = WORD[kind] + ' · ' + (extra ? extra + ' · ' : '') + clock;
    return '<div class="hd-pl-end hd-pl-end--' + kind + '">' + GLYPH[kind].replace(/ aria-label="[^"]*"/, ' aria-hidden="true"') + '<span>' + text + '</span></div>';
  }

  // ctx: { sfx, openMenu } — sfx is '-minimum' in the 1000 × 620 states so every fixture link keeps the window.
  function actions(l, i, ctx) {
    var open = ctx.openMenu && i === 0;
    var id = 'lane-actions-' + (i + 1);
    var wire = i === 0 ? ' data-pl-id="' + id + '" data-pl-go="' + FAMILY + (open ? '/lanes-titled' : '/lane-menu-open') + ctx.sfx + '"' + (open ? ' data-pl-close' : '') : '';
    var button = '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Lane actions" aria-haspopup="menu" aria-expanded="' + (open ? 'true' : 'false') + '"' + wire + '><span class="hd-i hd-i-more" aria-hidden="true"></span></button>';
    if (!open) return button;
    return '<span class="hd-pl-menu-anchor">' + button + '<div class="hd-menu" role="menu" aria-label="Lane actions"><a class="hd-menu__item" role="menuitem" href="#task/running-stop" data-pl-autofocus><span class="hd-i hd-i-external" aria-hidden="true"></span><span class="hd-menu__item-body">Open task</span></a></div></span>';
  }

  // One lane. o: { l, kind, clock, extra (caption suffix), status (caption text), body, end, composer }
  function lane(o, i, ctx) {
    var l = o.l, kind = o.kind;
    var status = o.status || (WORD[kind] + ' ' + o.clock);
    var head = '<div class="hd-lane__head">' + GLYPH[kind] + '<div class="hd-pl-stack"><span class="hd-lane__title">' + l.title + '</span><span class="caption hd-faint hd-pl-cap">' + caption(l, o.extra) + '</span></div><span class="caption hd-pl-status">' + status + '</span>' + actions(l, i, ctx) + '</div>';
    var lead = ctx.prompt ? promptBlock(l) : '';
    var body = '<div class="hd-lane__body">' + lead + (o.lead || '') + (o.body != null ? o.body : l.body) + (o.end || '') + '</div>';
    return '<section class="hd-lane" aria-label="' + l.title + '">' + head + body + '<div class="hd-lane__foot">' + composer(l, o.composer || {}) + '</div></section>';
  }

  // The prompt, in the task screen's presentation: the "Original request" disclosure with a Copy action.
  function promptBlock(l) {
    return '<details class="hd-m05-request" open><summary><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span>Original request</summary><p class="hd-m05-caption">Complete stored request</p><pre>' + l.prompt + '</pre><div class="hd-row hd-m05-actions"><button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Copy original request</button></div></details>';
  }

  // One row, Send only: no Send now and no hint. A locked lane keeps the row and says why.
  function composer(l, c) {
    var label = 'Message ' + l.harness, locked = !!c.locked, off = locked || !!c.disabled;
    var placeholder = locked ? c.placeholder : label;
    var field = '<textarea id="msg-' + l.slug + '" class="hd-composer__input" rows="1" placeholder="' + placeholder + '"' + (off ? ' disabled' : '') + ' style="min-height:' + (locked ? 40 : 24) + 'px;"></textarea>';
    var form = '<form class="hd-composer" aria-label="' + label + '" style="padding:var(--space-2) var(--space-2) var(--space-2) var(--space-3);flex-direction:row;align-items:center;">' +
      (locked ? '<span class="hd-i hd-i--sm hd-i-lock" aria-hidden="true"></span>' : '') +
      '<label class="hd-sr" for="msg-' + l.slug + '">' + label + '</label>' + field +
      '<button type="submit" class="hd-composer__send" aria-label="Send to ' + l.harness + '" disabled style="width:28px;height:28px;"><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></form>';
    return form + (c.note ? '<p class="caption hd-pl-note">' + c.note + '</p>' : '');
  }

  // ---- Group top bar ---------------------------------------------------------------------------------------------
  var BADGE = {
    running: ['hd-badge--running', '<span class="hd-badge__spin" aria-hidden="true"></span>'],
    done: ['hd-badge--done', ''],
    failed: ['hd-badge--failed', ''],
    neutral: ['', '']
  };
  // o: { badge: [tone, text] | null, cancel, prompt: 'off' | 'on' | 'disabled', meta }
  function topbar(o, ctx) {
    var b = o.badge ? '<span class="hd-badge ' + BADGE[o.badge[0]][0] + '">' + BADGE[o.badge[0]][1] + o.badge[1] + '</span>' : '';
    var meta = o.meta === false ? '' : '<span class="hd-topbar__meta">Enforced for every agent here: Network: not controlled.</span>';
    var viewPrompt = o.prompt === 'disabled' ? '<button type="button" class="hd-btn hd-btn--ghost" disabled>View prompt</button>'
      : '<button type="button" class="hd-btn hd-btn--ghost" aria-pressed="' + (o.prompt === 'on') + '" data-pl-id="view-prompt" data-pl-go="' + FAMILY + (o.prompt === 'on' ? '/lanes-titled' : '/prompt-shown') + ctx.sfx + '">View prompt</button>';
    var cancel = o.cancel ? '<button type="button" class="hd-btn hd-btn--danger" data-pl-id="cancel-all" data-pl-go="' + FAMILY + '/cancel-all-confirm' + ctx.sfx + '">Cancel all</button>' : '';
    return '<div class="hd-topbar"><span class="hd-topbar__title">Review preload bridge</span>' + b + meta + '<span class="hd-topbar__spacer"></span>' + viewPrompt + cancel + '</div>';
  }

  // ---- Frame -----------------------------------------------------------------------------------------------------
  var SIDEBAR = null;
  function sidebar() {
    if (SIDEBAR == null) SIDEBAR = T['parallel-group/lanes'].match(/<aside class="hd-sidebar"[\s\S]*?<\/aside>/)[0];
    return SIDEBAR;
  }

  function dialog(ctx) {
    var back = FAMILY + '/lanes-titled' + ctx.sfx;
    return '<div class="hd-m05-scrim"><div class="hd-dialog" role="dialog" aria-modal="true" aria-labelledby="pl-cancel-title"><h2 class="hd-dialog__title" id="pl-cancel-title">Cancel every running task in this group?</h2>' +
      '<div class="hd-dialog__actions"><button type="button" class="hd-btn hd-btn--secondary" data-pl-autofocus data-pl-close data-pl-id="cancel-all" data-pl-go="' + back + '">Cancel</button>' +
      '<button type="button" class="hd-btn hd-btn--danger" data-pl-id="view-prompt" data-pl-go="' + FAMILY + '/lane-cancelled' + ctx.sfx + '">Cancel all</button></div></div></div>';
  }

  // o: { id, bar, lanes: [lane options], min, dialog, empty, ctx extras }
  function frame(o) {
    var ctx = { sfx: o.min ? '-minimum' : '', openMenu: !!o.openMenu, prompt: !!o.prompt };
    var bar = topbar(o.bar, ctx);
    var main = o.empty ? '<div class="hd-pl-empty">No tasks in this group any more.</div>'
      : '<div class="hd-lanes">' + o.lanes.map(function (x, i) { return lane(x, i, ctx); }).join('') + '</div>';
    var side = sidebar();
    if (o.dialog) side = side.replace('<aside ', '<aside inert ');
    var app = '<div class="hd-app hd-pl" data-theme="{{theme}}" data-pl-state="' + o.id + '" style="width: 100%; height: ' + (o.min ? 620 : 800) + 'px;">' +
      side + '<main class="hd-main"' + (o.dialog ? ' inert' : '') + '>' + bar + main + '</main>' + (o.dialog ? dialog(ctx) : '') + '</div>';
    return o.min ? '<div class="hdc-specimen--minimum" data-pl-min="sidebar,lanes,topbar-meta">' + app + '</div>' : app;
  }

  // ---- Lane sets -------------------------------------------------------------------------------------------------
  function running() { return { l: LANES.claude, kind: 'running', clock: '03:24', body: LANES.claude.body + working('Reading src/preload/bridge.ts…') }; }
  function done(l, clock) { return { l: l, kind: 'done', clock: clock, end: endRow('done', clock) }; }
  function base() { return [running(), done(LANES.codex, '04:51'), done(LANES.opencode, '04:12')]; }
  var RUN = ['running', '1 running · 2 done'];

  var BAR_RUN = { badge: RUN, cancel: true, prompt: 'off' };
  var BAR_NONE = function (badge) { return { badge: badge, cancel: false, prompt: 'off' }; };

  var SPECS = {
    'lanes-titled': { bar: BAR_RUN, lanes: base },
    'lane-menu-open': { bar: BAR_RUN, lanes: base, openMenu: true },
    'prompt-shown': { bar: { badge: RUN, cancel: true, prompt: 'on' }, lanes: base, prompt: true },
    'cancel-all-confirm': { bar: BAR_RUN, lanes: base, dialog: true },
    'lanes-settled': { bar: BAR_NONE(['done', '3 done']), lanes: function () {
      return [{ l: LANES.claude, kind: 'done', clock: '05:02', end: endRow('done', '05:02'), body: LANES.claude.body }, done(LANES.codex, '04:51'), done(LANES.opencode, '04:12')];
    } },
    'lane-failed': { bar: BAR_NONE(['failed', '2 done · 1 failed']), lanes: function () {
      return [{ l: LANES.claude, kind: 'failed', clock: '07:48', end: endRow('failed', '07:48') }, done(LANES.codex, '04:51'), done(LANES.opencode, '04:12')];
    } },
    'lane-cancelled': { bar: BAR_NONE(['neutral', '2 done · 1 cancelled']), lanes: function () {
      return [{ l: LANES.claude, kind: 'cancelled', clock: '04:31', end: endRow('cancelled', '04:31') }, done(LANES.codex, '04:51'), done(LANES.opencode, '04:12')];
    } },
    'lane-taken-over': { bar: BAR_NONE(['neutral', '2 done · 1 cancelled']), lanes: function () {
      return [{ l: LANES.claude, kind: 'cancelled', clock: '04:31', extra: 'taken over', end: endRow('cancelled', '04:31', 'taken over'),
        composer: { locked: true, placeholder: 'Messages are off — you took this task over in Terminal' } },
        done(LANES.codex, '04:51'), done(LANES.opencode, '04:12')];
    } },
    'lane-activity-unavailable': { bar: BAR_RUN, lanes: function () {
      return [running(),
        { l: LANES.codex, kind: 'done', clock: '04:51', body: '<p class="hd-pl-note">Activity log unavailable.</p>', end: endRow('done', '04:51'),
          composer: { disabled: true, note: 'Messaging is unavailable for this activity view.' } },
        { l: LANES.opencode, kind: 'done', clock: '04:12', body: '<p class="hd-pl-note">No activity to display.</p>', end: endRow('done', '04:12') }];
    } },
    'lane-history-boundary': { bar: BAR_RUN, lanes: function () {
      var r = running();
      r.lead = '<div class="hd-d2b-boundary" role="group" aria-label="History boundary"><strong>Observation session changed · cached history is not current. Replace this window to load current activity.</strong><div class="hd-row hd-d2b-actions"><button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Load current activity</button></div></div>';
      var quiet = '<p class="hd-m05-caption">Available captured history</p>';
      var c = done(LANES.codex, '04:51'), o = done(LANES.opencode, '04:12');
      c.lead = o.lead = quiet;
      return [r, c, o];
    } },
    'group-empty': { bar: { badge: null, cancel: false, prompt: 'disabled', meta: false }, empty: true },
    'two-lanes': { bar: { badge: ['running', '1 running · 1 done'], cancel: true, prompt: 'off' }, lanes: function () { return [running(), done(LANES.codex, '04:51')]; } }
  };

  function render(id, min) {
    var s = SPECS[id];
    return frame({ id: id + (min ? '-minimum' : ''), bar: s.bar, lanes: s.lanes && s.lanes(), min: min, openMenu: s.openMenu, prompt: s.prompt, dialog: s.dialog, empty: s.empty });
  }

  // ---- Registration ----------------------------------------------------------------------------------------------
  var family = H.findFamily(FAMILY);
  [G_MAIN, G_STATE, G_MIN].forEach(function (g) { if (family.groups.indexOf(g) < 0) family.groups.push(g); });

  var ROWS = [
    ['lanes-titled', 'Lanes · Task titles', G_MAIN, 'Each lane is titled with its task and captioned with the harness and model. The model is left out when unknown. A settled lane ends with its duration only. The top bar keeps the badge, one enforcement sentence, View prompt and Cancel all.'],
    ['lane-menu-open', 'Lane actions menu open', G_MAIN, 'The lane actions menu holds Open task only. Escape or Tab closes it and returns focus to the button.'],
    ['prompt-shown', 'View prompt shown', G_MAIN, 'View prompt reveals each lane’s original request, in the task screen’s disclosure.'],
    ['cancel-all-confirm', 'Cancel all · Confirmation', G_MAIN, 'The group confirmation: “Cancel every running task in this group?”. Focus starts on Cancel; Escape cancels.'],
    ['lanes-settled', 'Lanes · All settled', G_MAIN, 'Nothing is running: the badge reads “3 done” and Cancel all is not shown.'],
    ['lane-failed', 'Lane failed', G_STATE, 'One lane failed. The badge counts it and Cancel all is not shown.'],
    ['lane-cancelled', 'Lane cancelled', G_STATE, 'One lane cancelled; the result of confirming Cancel all while it was the only lane running.'],
    ['lane-taken-over', 'Lane taken over in a terminal', G_STATE, 'A lane whose task was taken over in Terminal: the caption says so and its composer is locked.'],
    ['lane-activity-unavailable', 'Lane activity unavailable', G_STATE, 'A lane whose activity log cannot be read, with messaging unavailable (Send disabled), beside a lane with no activity to display.'],
    ['lane-history-boundary', 'Lane history boundary', G_STATE, 'A lane whose cached history is no longer current, with Load current activity.'],
    ['group-empty', 'Group empty', G_STATE, 'A group that no longer has any task.'],
    ['two-lanes', 'Two lanes', G_STATE, 'A group of two agents: the lanes fill the width.'],
    ['loading-two', 'Loading · Member count unknown', G_STATE, 'The lane frames while the member count is unknown: two frames, with the real top bar frame and composers.'],
    ['lanes-titled-minimum', 'Lanes · Task titles · 1000 × 620', G_MIN, 'Task titles at the minimum window: 360 point lanes scroll horizontally and the top bar meta becomes a dot.'],
    ['lane-menu-open-minimum', 'Lane actions menu open · 1000 × 620', G_MIN, 'The lane actions menu at the minimum window.'],
    ['prompt-shown-minimum', 'View prompt shown · 1000 × 620', G_MIN, 'The revealed prompts at the minimum window.'],
    ['cancel-all-confirm-minimum', 'Cancel all · Confirmation · 1000 × 620', G_MIN, 'The group confirmation at the minimum window.'],
    ['lanes-settled-minimum', 'Lanes · All settled · 1000 × 620', G_MIN, 'All lanes settled at the minimum window.'],
    ['lane-cancelled-minimum', 'Lane cancelled · 1000 × 620', G_MIN, 'A cancelled lane at the minimum window; where confirming Cancel all lands.'],
    ['lane-failed-minimum', 'Lane failed · 1000 × 620', G_MIN, 'A failed lane at the minimum window.'],
    ['group-empty-minimum', 'Group empty · 1000 × 620', G_MIN, 'An empty group at the minimum window.']
  ];

  H.parallelLaneStates = ROWS.map(function (r) { return r[0]; });

  ROWS.forEach(function (row) {
    var id = row[0], min = /-minimum$/.test(id), key = FAMILY + '/' + id;
    var spec = id === 'loading-two' ? 'two-lanes' : id.replace(/-minimum$/, '');
    if (id !== 'loading-two') T[key] = render(spec, min);
    docs[key] = '<p><strong>Not approved · draft for owner review, 2026-11-12.</strong> ' + row[3] + ' Deterministic display-only fixture. See <a href="docs/decisions/parallel-group-proposal.md">the parallel group lane decision record</a> for the source citations, defaults and open questions. Reopening the route resets it.</p>';
    var state = { id: id, title: row[1], description: row[3], group: row[2], status: 'provisional', approvalNote: NOTE };
    if (id === 'loading-two') state.skeleton = { of: FAMILY + '/two-lanes', spec: 'parallel-group-two' };
    H.registerState(FAMILY, state);
  });

  // Two lane frames: the approved parallel-group skeleton with two composers instead of three.
  var specs = (H.skeletonSpecs = H.skeletonSpecs || {});
  if (specs['parallel-group']) {
    specs['parallel-group-two'] = Object.assign({}, specs['parallel-group'], {
      chrome: Object.assign({}, specs['parallel-group'].chrome, { Message: 4, Send: 2 })
    });
  }

  // ---- Fixture behaviour (browser only) --------------------------------------------------------------------------
  // data-pl-go moves between fixtures; data-pl-id names the control that gets focus back; data-pl-autofocus takes
  // focus when its state opens; data-pl-close is what Escape (and Tab, in the menu) activates; data-pl-min asks the
  // shared minimum frame fixes (minimum-frame.js) to run on the 1000 × 620 states.
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    var pendingFocus = null, lastMin = null;
    var scan = function () {
      var min = document.querySelector('[data-pl-min]:not([data-pl-min-done])');
      if (!min && lastMin && !document.querySelector('[data-pl-min]')) { H.clearMinimum(lastMin); lastMin = null; }
      if (min && H.applyMinimum) {
        if (lastMin && lastMin !== min) H.clearMinimum(lastMin);
        min.setAttribute('data-pl-min-done', '');
        lastMin = min;
        var outer = min.parentNode && min.parentNode.closest && min.parentNode.closest('.hdc-specimen');
        if (outer) outer.classList.add('hdc-specimen--minimum');
        H.applyMinimum(min, min.getAttribute('data-pl-min').split(','));
      }
      var auto = document.querySelector('.hd-pl [data-pl-autofocus]:not([data-pl-focused])');
      if (auto) { auto.setAttribute('data-pl-focused', ''); pendingFocus = null; auto.focus(); return; }
      if (pendingFocus) {
        var back = document.querySelector('.hd-pl [data-pl-id="' + pendingFocus + '"]');
        if (back) { pendingFocus = null; back.focus(); }
      }
    };
    document.addEventListener('click', function (event) {
      var go = event.target.closest && event.target.closest('.hd-pl [data-pl-go]');
      if (!go) return;
      pendingFocus = go.getAttribute('data-pl-id');
      window.location.hash = '#' + go.getAttribute('data-pl-go');
    });
    document.addEventListener('keydown', function (event) {
      var dlg = document.querySelector('.hd-pl [role="dialog"]'), menu = document.querySelector('.hd-pl [role="menu"]');
      if (!dlg && !menu) return;
      var close = document.querySelector('.hd-pl [data-pl-close]');
      if (event.key === 'Escape' && close) { event.preventDefault(); close.click(); return; }
      if (event.key !== 'Tab') return;
      if (menu && close) { event.preventDefault(); close.click(); return; }
      if (dlg) {
        var buttons = dlg.querySelectorAll('button'), first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }
})();
