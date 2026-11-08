// Skeleton specs: for each screen with a loading state, the data regions of the loaded screen and the pattern drawn
// inside each of them, plus the chrome allowlist. This file is the reviewed artifact of the loading states.
//
// Rules the specs follow:
//  - A region (rows, html, custom) keeps the outer box it has in the loaded screen; the pattern inside it is authored
//    here: row count, row shapes, line widths. Row height is the loaded row's height. Nothing else is measured.
//  - Static chrome (navigation, screen titles, section headings, labels, tab names, static buttons) renders as in the
//    loaded screen. Everything the engine would have to read to know (names, counts, times, status) is data.
//  - Line widths alternate 190 and 140 (titles) and 90 (secondary lines), the fixed pattern used by Mac's SkeletonRows;
//    a block never exceeds its container (max-width 100%).
//  - `chrome` lists every string the loading screen may show, with how many times (n) and, optionally, the region it
//    sits in. Anything else is data and fails the check; digits are allowed only in listed strings.
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var B = function () { return H.skelBlock.apply(null, arguments); };
  var TITLE = [190, 140, 168, 120];

  (H.catalogStrips = H.catalogStrips || {}).loading = {
    heading: 'Provisional · needs owner approval',
    approvedHeading: 'Approved · Sidebar · Owner 2026-11-08',
    approvedNote: 'Approved by the owner, 2026-11-08. Loading placeholder drawn from the loaded screen: the work rows are shimmering blocks and everything else is the real screen. Reduce Motion: static blocks. Native titlebar and OS controls are browser approximations.',
    note: 'Provisional · needs owner approval. Loading placeholder drawn from the loaded screen: its data regions are shimmering blocks and everything else is the real screen. Reduce Motion: static blocks. Native titlebar and OS controls are browser approximations.'
  };

  // ---- Shared drawing helpers ----
  // One sidebar task row: status glyph, title line, trailing meta.
  function taskRow(i) {
    return '<div class="hd-task-row" aria-hidden="true">' + B(16, 16, 'circle') +
      '<span style="flex:1;min-width:0;display:block">' + B(TITLE[i % TITLE.length], 12, 'line', 'max-width:100%') + '</span>' + B(24, 10, 'pill') + '</div>';
  }

  // The sidebar's data: the Needs you count, the attention dot, and the Running and Recent work lists.
  function sidebarOps(scope, optional) {
    var s = scope ? scope + ' ' : '';
    return [
      { sel: s + '.hd-nav-item__count', kind: 'text', w: 14, h: 12, shape: 'pill', optional: !!optional },
      { sel: s + '.hd-nav .hd-dot', kind: 'hide', optional: !!optional },
      { sel: s + '.hd-rail-item__badge', kind: 'text', w: 14, h: 10, shape: 'pill', optional: true },
      { sel: s + '.hd-rail .hd-dot', kind: 'hide', optional: true },
      { sel: s + '[aria-label="Running"] .hd-section__count', kind: 'text', w: 14, h: 12, shape: 'pill', optional: !!optional },
      { sel: s + '[aria-label="Running"] .hd-section__list', kind: 'rows', count: 2, row: taskRow, pin: 'fixed', optional: !!optional },
      { sel: s + '[aria-label="Recent work"] .hd-section__list', kind: 'rows', count: 8, row: taskRow, pin: 'fixed', optional: !!optional }
    ];
  }


  var S = (H.skeletonSpecs = H.skeletonSpecs || {});

  // ---- New task: the centered composer, empty ----
  var M04 = '.hd-m04-window .hd-app';
  // Blocked controls: the renderer ignores them while loading and they are marked aria-disabled.
  function blockedOps() {
    return [
      { sel: M04 + ' [data-m04="options"]', kind: 'disable' },
      { sel: M04 + ' .hd-composer__input', kind: 'disable' },
      { sel: M04 + ' .hd-composer__send', kind: 'disable' }
    ];
  }
  S['new-task'] = {
    frame: M04, label: 'Loading New task',
    ops: [
      { sel: M04 + ' .hd-topbar .caption', kind: 'text', w: 140, h: 12 },
      { sel: M04 + ' .hd-m04-picker', kind: 'fill', shape: 'pill' },
      { sel: M04 + ' .hd-m04-status', kind: 'text', w: 150, h: 12 }
    ].concat(sidebarOps(M04, true), blockedOps())
  };
  // Sidebar rows only: the main area renders exactly as new-task/centered-empty draws it. The pills stay, inert.
  S['sidebar'] = {
    frame: M04, label: 'Loading Sidebar',
    ops: sidebarOps(M04, true).concat([{ sel: M04 + ' .hd-m04-picker summary', kind: 'disable' }], blockedOps())
  };

  // ---- Task: the task screen (m05 frame) ----
  var M05 = '.hd-m05-window .hd-app';
  function line(w, h, extra) { return B(w, h || 12, 'line', 'max-width:100%;' + (extra || '')); }
  function para(widths) {
    return '<div style="margin:0 0 18px;display:flex;flex-direction:column;gap:8px">' + widths.map(function (w) { return line(w, 12); }).join('') + '</div>';
  }
  function toolRow(w) {
    return '<div style="height:28px;margin:0 0 16px;display:flex;align-items:center;gap:10px">' + B(14, 14, 'soft') + line(w, 12) + '</div>';
  }
  function transcriptPattern() {
    return '<div style="height:36px;margin:0 0 16px;display:flex;align-items:center;gap:10px">' + B(14, 14, 'soft') + line(140, 12) + '</div>' +
      para(['100%', '94%', '58%']) + toolRow(120) + para(['100%', '72%']) + toolRow(190) + toolRow(150) + para(['100%', '88%', '40%']);
  }
  function paneBodyPattern() {
    var head = '<div style="margin:0 0 14px">' + line(90, 14) + '</div>';
    var disclosure = function (w) { return '<div style="height:28px;margin:0 0 8px;display:flex;align-items:center;gap:10px">' + B(14, 14, 'soft') + line(w, 12) + '</div>'; };
    var facts = '<div style="display:grid;grid-template-columns:61px 1fr;gap:10px 12px;margin:0 0 20px">' + [140, 190, 120, 168, 100, 150].map(function (w) { return line(48, 10) + line(w, 12); }).join('') + '</div>';
    return disclosure(40) + facts + disclosure(120) + disclosure(52) + '<div style="margin:16px 0 8px">' + line(150, 14) + '</div>' + para(['70%']) + '<div style="margin:0 0 8px">' + line(110, 14) + '</div>' + para(['100%', '86%']);
  }
  S['task'] = {
    frame: M05, label: 'Loading Task',
    ops: [
      { sel: M05 + ' .hd-m05-bar__center .hd-topbar__title', kind: 'text', w: 190, h: 14 },
      { sel: M05 + ' .hd-m05-bar__center .hd-badge', kind: 'fill', shape: 'pill' },
      { sel: M05 + ' .hd-m05-bar__center .hd-topbar__meta', kind: 'text', w: 170, h: 10, optional: true },
      { sel: M05 + ' .hd-m05-chip', kind: 'fill', shape: 'pill', optional: true },
      { sel: M05 + ' .hd-m05-more-anchor button', kind: 'disable' },
      { sel: M05 + ' .hd-transcript', kind: 'html', html: transcriptPattern, pin: 'fixed' },
      { sel: M05 + ' .hd-m05-composer .hd-btn--secondary', kind: 'fill', shape: 'pill' },
      { sel: M05 + ' .hd-composer__input', kind: 'disable' },
      { sel: M05 + ' .hd-composer__send', kind: 'disable' },
      { sel: M05 + ' .hd-m05-panebody', kind: 'html', html: paneBodyPattern, pin: 'fixed', optional: true },
      { sel: M05 + ' .hd-tab__count', kind: 'text', w: 14, h: 10, shape: 'pill', optional: true }
    ].concat(sidebarOps(M05))
  };
  S['task-pane'] = Object.assign({}, S['task'], { label: 'Loading Task' });

  // ---- Static-frame screens (1280 × 800 templates; the sidebar is the same as in the task screen) ----
  var APP = '.hd-app';
  var SB = sidebarOps(APP);
  function row32(i) { return taskRow(i); }
  // Approval-card shell shared by Needs you and the menu bar popover.
  function approvalCard(i, h) {
    return '<div class="hd-approval" aria-hidden="true" style="height:' + h + 'px;margin:0 0 12px"><div class="hd-approval__head" style="height:38px;gap:10px">' + B(16, 16, 'circle') + line(150, 12) +
      '</div><div class="hd-approval__body" style="gap:10px">' + line('90%', 14) + line(200, 10) + '</div><div class="hd-approval__actions" style="gap:8px">' + B(90, 28, 'pill') + B(60, 28, 'pill') + '</div></div>';
  }
  // Generic graph: four nodes at the loaded node size joined by connectors, drawn in the canvas's own coordinates.
  function graph(el) {
    var node = el.querySelector('.hd-node:not(.hd-node--terminal):not(.hd-node--boundary)');
    var term = el.querySelector('.hd-node--terminal');
    var nw = node ? node.offsetWidth : 220, nh = node ? node.offsetHeight : 88;
    var tw = term ? term.offsetWidth : 70, th = term ? term.offsetHeight : 38;
    var cy = node ? node.offsetTop + nh / 2 : 270, gap = Math.round(nw * 0.5);
    var x = 8, items = [[tw, th, 'pill'], [nw, nh, 'soft'], [nw, nh, 'soft'], [tw, th, 'pill']], html = '', edges = '';
    items.forEach(function (it, i) {
      html += B(it[0], it[1], it[2], 'position:absolute;left:' + x + 'px;top:' + Math.round(cy - it[1] / 2) + 'px;');
      if (i < items.length - 1) edges += '<line x1="' + (x + it[0]) + '" y1="' + cy + '" x2="' + (x + it[0] + gap) + '" y2="' + cy + '" stroke="var(--border-strong)" stroke-width="1.5"/>';
      x += it[0] + gap;
    });
    el.innerHTML = '<svg width="' + el.offsetWidth + '" height="' + el.offsetHeight + '" style="position:absolute;left:0;top:0" aria-hidden="true">' + edges + '</svg>' + html;
  }
  function standaloneNodes() {
    return [0, 1, 2].map(function () { return '<div style="width:200px;height:74px;flex:none;border-radius:var(--radius-lg);overflow:hidden">' + B('100%', '100%', 'soft', 'flex:none') + '</div>'; }).join('');
  }
  function listRow(i) {
    return '<div class="hd-list-row" aria-hidden="true">' + B(32, 32, 'soft') +
      '<span class="hd-list-row__body">' + line(TITLE[i % TITLE.length], 14) + line(280 + (i % 2) * 60, 10) + '</span>' + B(46, 12, 'pill') + '<span class="hd-list-row__actions">' + B(70, 32, 'pill') + B(70, 32, 'pill') + '</span></div>';
  }
  function topbarOps(titleW, metaW) {
    return [
      { sel: APP + ' .hd-topbar .hd-topbar__title', kind: 'text', w: titleW, h: 14 },
      { sel: APP + ' .hd-topbar .hd-badge', kind: 'fill', shape: 'pill' },
      { sel: APP + ' .hd-topbar .hd-topbar__meta', kind: 'text', w: metaW, h: 10 }
    ];
  }

  // Needs you
  S['needs-you'] = {
    frame: APP, label: 'Loading Needs you',
    ops: [
      { sel: APP + ' .hd-page__head .hd-badge', kind: 'fill', shape: 'pill' },
      { sel: APP + ' .hd-page > div:not(.hd-page__head)', kind: 'html', pin: 'fixed', html: function () { return approvalCard(0, 167) + approvalCard(1, 167) + approvalCard(2, 154); } }
    ].concat(SB)
  };

  // Menu bar popover
  var POP = '[aria-label="Harflow menu"]';
  S['menu-bar'] = {
    frame: APP, label: 'Loading Menu bar',
    ops: [
      { sel: POP + ' > div:first-child > .caption', kind: 'text', w: 70, h: 12 },
      { sel: POP + ' [aria-label="Needs you"] .hd-section__count', kind: 'text', w: 14, h: 12, shape: 'pill' },
      { sel: POP + ' [aria-label="Needs you"] > div:last-child', kind: 'html', pin: 'fixed', html: function () { return approvalCard(0, 144) + approvalCard(1, 164); } },
      { sel: POP + ' [aria-label="Running"] .hd-section__count', kind: 'text', w: 14, h: 12, shape: 'pill' },
      { sel: POP + ' [aria-label="Running"] .hd-section__list', kind: 'rows', count: 3, row: row32, pin: 'fixed' },
      { sel: POP + ' [aria-label="Recent"] .hd-section__list', kind: 'rows', count: 3, row: row32, pin: 'fixed' }
    ]
  };

  // Workflows
  S['workflows'] = {
    frame: APP, label: 'Loading Workflows',
    ops: [
      { sel: APP + ' .hd-list', kind: 'rows', count: 5, row: listRow, pin: 'fixed' }
    ].concat(SB)
  };

  // Workflow editor
  var INSPECTOR = APP + ' .hd-inspector';
  S['workflow-editor'] = {
    frame: APP, label: 'Loading Workflow editor',
    ops: [
      { sel: APP + ' .hd-topbar .hd-topbar__title', kind: 'text', w: 150, h: 14 },
      { sel: APP + ' .hd-topbar .hd-topbar__meta', kind: 'text', w: 150, h: 10 },
      { sel: APP + ' .hd-topbar button', kind: 'disable' },
      { sel: APP + ' .hd-topbar button', kind: 'attr', name: 'title', value: null },
      { sel: APP + ' .hd-topbar button[aria-label^="Run,"]', kind: 'attr', name: 'aria-label', value: null },
      { sel: INSPECTOR + ' .hd-inspector__head button', kind: 'disable' },
      { sel: APP + ' .hd-standalone__nodes', kind: 'html', pin: 'fixed', html: standaloneNodes },
      { sel: APP + ' .hd-canvas > div:first-child', kind: 'custom', pin: 'fixed', run: graph },
      { sel: APP + ' .hd-split > div > .caption', kind: 'text', w: 180, h: 10 },
      { sel: INSPECTOR + ' .hd-inspector__title', kind: 'text', w: 90, h: 14 },
      { sel: INSPECTOR + ' .hd-input, ' + INSPECTOR + ' .hd-switch, ' + INSPECTOR + ' .hd-stepper', kind: 'fill', shape: 'soft' },
      { sel: INSPECTOR + ' button.hd-form-row', kind: 'fill', shape: 'soft' },
      { sel: INSPECTOR + ' .hd-row', kind: 'text', w: 120, h: 12, optional: true }
    ].concat(SB)
  };

  // Lanes shared by Parallel group and the workflow run's parallel view
  var LANE = APP + ' .hd-lane';
  function laneHead() {
    return B(16, 16, 'circle') + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">' + line(120, 12) + line(80, 10) + '</div>' + B(64, 12, 'pill') + B(26, 26, 'soft');
  }
  function laneBody(el, i) {
    var long = i % 2 === 0;
    return para(long ? ['100%', '96%', '80%', '45%'] : ['100%', '70%']) + toolRow(long ? 170 : 130) + para(['100%', '92%', '60%']) + toolRow(150) + (long ? para(['100%', '84%']) : '');
  }
  function lanesOps() {
    return [
      { sel: LANE, kind: 'attr', name: 'aria-label', value: null },
      { sel: LANE + '__foot .hd-composer', kind: 'attr', name: 'aria-label', value: 'Message' },
      { sel: LANE + '__foot .hd-composer__send', kind: 'attr', name: 'aria-label', value: 'Send' },
      { sel: LANE + '__foot .caption', kind: 'text', w: 120, h: 10, optional: true },
      { sel: LANE + '__head', kind: 'html', pin: 'fixed', html: laneHead },
      { sel: LANE + '__body', kind: 'html', pin: 'fixed', html: laneBody },
      { sel: LANE + '__foot .hd-sr', kind: 'settext', text: 'Message' },
      { sel: LANE + '__foot .hd-composer__input', kind: 'disable' },
      { sel: LANE + '__foot .hd-composer__input', kind: 'drop', attrs: ['placeholder'] },
      { sel: LANE + '__foot .hd-composer__send', kind: 'disable' }
    ];
  }
  S['parallel-group'] = {
    frame: APP, label: 'Loading Parallel group',
    ops: topbarOps(150, 300).concat([
      { sel: APP + ' .hd-topbar button', kind: 'disable' }
    ], lanesOps(), SB)
  };

  // Workflow run
  function runOps() {
    return topbarOps(173, 105).concat([
      { sel: APP + ' .hd-topbar button', kind: 'disable' }
    ]);
  }
  S['workflow-run'] = {
    frame: APP, label: 'Loading Workflow run',
    ops: runOps().concat([
      { sel: APP + ' .hd-standalone__nodes', kind: 'html', pin: 'fixed', html: standaloneNodes },
      { sel: APP + ' [aria-label^="Workflow steps"]', kind: 'attr', name: 'aria-label', value: 'Workflow steps' },
      { sel: APP + ' [aria-label="Selected on-demand node"]', kind: 'attr', name: 'aria-label', value: null },
      { sel: APP + ' .hd-pane .hd-composer__send', kind: 'attr', name: 'aria-label', value: 'Send' },
      { sel: APP + ' .hd-canvas > div:first-child', kind: 'custom', pin: 'fixed', run: graph },
      { sel: APP + ' .hd-pane__head .hd-topbar__title', kind: 'text', w: 110, h: 14 },
      { sel: APP + ' .hd-pane__head .caption', kind: 'text', w: 60, h: 10, shape: 'pill' },
      { sel: APP + ' .hd-pane > .hd-scroll', kind: 'html', pin: 'fixed', html: function () { return para(['100%', '70%']) + '<div style="margin:0 0 8px">' + line(60, 10) + '</div>' + toolRow(200) + toolRow(200) + para(['60%']) + para(['100%', '95%', '50%']) + toolRow(190); } },
      { sel: APP + ' .hd-pane .hd-composer__input', kind: 'disable' },
      { sel: APP + ' .hd-pane .hd-composer__send', kind: 'disable' }
    ], SB)
  };
  S['workflow-run-parallel'] = {
    frame: APP, label: 'Loading Workflow run',
    ops: runOps().concat(lanesOps(), [
      { sel: APP + ' .hd-main > .hd-lanes ~ div', kind: 'html', pin: 'fixed', html: function () { return '<div style="display:flex;align-items:center;gap:10px;padding:0 16px;height:100%">' + B(16, 16, 'circle') + line(230, 12) + '<span style="flex:1"></span>' + line(110, 10) + '</div>'; } }
    ], SB)
  };

  // Resources
  function meterCard(el, i) {
    var rows = 1;
    var html = '<div style="display:flex;flex-direction:column;gap:8px;padding:0"><div style="display:flex;justify-content:space-between;align-items:center">' + line(110, 14) + B(70, 12, 'pill') + '</div>' + B('100%', 8, 'pill', 'flex:none');
    for (var r = 0; r < rows; r += 1) html += '<div class="hd-task-row" style="padding:0">' + B(14, 14, 'circle') + '<span style="flex:1;display:block">' + line(TITLE[(i + r) % 4], 12) + '</span>' + B(34, 10, 'pill') + '</div>';
    return html + '</div>';
  }
  S['resources'] = {
    frame: APP, label: 'Loading Resources',
    ops: [
      { sel: APP + ' .hd-grid--2 > .hd-card', kind: 'attr', name: 'aria-label', value: null },
      { sel: APP + ' .hd-grid--2 > .hd-card', kind: 'html', pin: 'fixed', html: meterCard },
      { sel: APP + ' .hd-list', kind: 'rows', count: 1, pin: 'fixed', row: function () {
        return '<div class="hd-list-row" aria-hidden="true">' + B(13, 13, 'circle') + '<span class="hd-list-row__body">' + line(190, 14) + line(150, 10) + '</span>' + B(61, 12, 'pill') + B(77, 26, 'pill') + '</div>';
      } }
    ].concat(SB)
  };

  // Statistics
  function bars() {
    var h = [40, 70, 55, 90, 60, 100, 75, 45, 85, 65, 95, 50, 80, 58, 72, 92, 48, 68];
    return '<div style="flex:1;min-width:0"><div style="display:flex;align-items:flex-end;gap:10px;height:176px;padding:16px 8px 0 0;box-sizing:border-box">' + h.map(function (v) { return B(0, v + '%', 'soft', 'flex:1;min-width:0;'); }).join('') + '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-top:6px">' + line(40, 10) + line(40, 10) + line(40, 10) + '</div></div>';
  }
  // A table row: five cells in the loaded columns, one block each.
  function statRow(i) {
    var w = [110, 30, 40, 46, 60];
    return '<tr aria-hidden="true" style="border-bottom:1px solid var(--border)">' + w.map(function (v) { return '<td style="padding:8px 12px">' + B(v, 12, 'line', 'max-width:100%') + '</td>'; }).join('') + '</tr>';
  }
  S['statistics'] = {
    frame: APP, label: 'Loading Statistics',
    ops: [
      { sel: APP + ' .hd-stat', kind: 'pin', pin: 'fixed' },
      { sel: APP + ' .hd-stat__value', kind: 'text', w: 80, h: 24 },
      { sel: APP + ' .hd-stat__delta', kind: 'text', w: 120, h: 10 },
      { sel: APP + ' .hd-card .hd-row + div', kind: 'html', pin: 'fixed', html: bars },
      { sel: APP + ' .hd-card table tbody', kind: 'rows', count: 5, pin: 'none', row: statRow }
    ].concat(SB)
  };

  // Settings: General, Harnesses, MCP approvals
  var SET = APP + ' .hd-scroll';
  function harnessList() {
    var out = '<hr style="border:0;border-top:1px solid var(--border);margin:0">';
    for (var i = 0; i < 5; i += 1) {
      out += '<div class="hd-form-row" aria-hidden="true" style="height:44px;box-sizing:border-box">' + B(32, 32, 'soft') + '<span style="flex:1;display:block">' + line(TITLE[i % 4] / 2, 14) + '</span>' + B(82, 22, 'pill') + B(75, 32, 'pill') + '</div><hr style="border:0;border-top:1px solid var(--border);margin:0">';
    }
    return out;
  }
  function qualificationRow(el, i) {
    return B(130, 14, 'line') + '<span style="flex:1;display:flex;align-items:center;gap:8px">' + B(16, 16, 'circle') + line(i === 1 ? 300 : 60, 12) + '</span>';
  }
  var SETTINGS_TOP = [
    { sel: SET + ' .hd-tabs ~ div > div:first-child .caption.hd-faint', kind: 'text', w: 220, h: 10 },
    { sel: SET + ' .hd-tabs ~ div > div:first-child button', kind: 'disable' }
  ];
  S['settings-general'] = {
    frame: APP, label: 'Loading Settings',
    ops: [
      { sel: SET + ' .hd-switch', kind: 'fill', shape: 'pill' },
      { sel: SET + ' section:nth-of-type(3) .hd-form-row__label', kind: 'text', w: 200, h: 12 },
      { sel: SET + ' section:nth-of-type(4) .hd-form-row__label', kind: 'text', w: 170, h: 12 },
      { sel: SET + ' section:nth-of-type(3) button, ' + SET + ' section:nth-of-type(4) button', kind: 'disable' }
    ].concat(SB)
  };
  S['settings-harnesses'] = {
    frame: APP, label: 'Loading Settings',
    ops: SETTINGS_TOP.concat([
      { sel: SET + ' .hd-tabs ~ div > div:nth-child(2)', kind: 'html', pin: 'fixed', html: harnessList },
      { sel: SET + ' .hd-tabs ~ div > section .hd-form-row', kind: 'html', pin: 'fixed', html: qualificationRow }
    ], SB)
  };
  // Five uniform items, each a harness row with one approval row beneath it: no row is expanded.
  function approvalsList() {
    var hr = '<hr style="border:0;border-top:1px solid var(--border);margin:0">', out = hr;
    for (var i = 0; i < 5; i += 1) {
      out += '<div class="hd-form-row" aria-hidden="true" style="height:44px;box-sizing:border-box">' + B(32, 32, 'soft') + '<span style="flex:1;display:block">' + line(TITLE[i % 4] / 2, 14) + '</span>' + B(82, 22, 'pill') + B(75, 32, 'pill') + '</div>' +
        '<div class="hd-form-row" aria-hidden="true" style="height:44px;box-sizing:border-box;padding-left:44px">' + line(TITLE[(i + 1) % 4], 14) + '<span style="flex:1"></span>' + B(64, 26, 'pill') + '</div>' + hr;
    }
    return out;
  }
  S['settings-mcp-approvals'] = {
    frame: APP, label: 'Loading Settings',
    ops: SETTINGS_TOP.concat([
      { sel: SET + ' .hd-tabs ~ div > div:nth-child(2)', kind: 'html', pin: 'fixed', html: approvalsList },
      { sel: SET + ' .hd-tabs ~ div > section .hd-form-row', kind: 'html', pin: 'fixed', html: qualificationRow }
    ], SB)
  };

  // ---- Chrome allowlists ----
  // Every string a loading screen may show (visible text, accessible names, titles, placeholders), with the number of
  // times it appears at the native frame. Strings with digits are listed here and only here. Reviewed by hand against
  // the loaded screens: names, counts, times and statuses are data and never appear. "Tue 14:32" and "Harflow, menu
  // open" are the host operating system's menu bar around the popover, drawn as in the loaded screen.
  var CHROME = {
    "new-task": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 2, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "What should we work on?": 1, "Task prompt": 1, "Describe the task. Use @ to mention files.": 1, "More task options": 2, "Default options": 1, "Start task": 1
    },
    "sidebar": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 2, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "HarflowMCP · New task": 1, "What should we work on?": 1, "Task prompt": 1, "Describe the task. Use @ to mention files.": 1, "More task options": 2, "Default options": 1, "HarflowMCP": 1, "Repository / recent folders": 1, "Claude Code · Opus 5.5": 1, "Harness": 1, "Model": 1, "Can edit this repo": 1, "Access": 1, "Start task": 1, "Describe a task to continue.": 1
    },
    "task": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Show right pane": 1, "More actions": 1, "Task conversation": 1, "Follow-up": 1, "Message this task": 1, "Queue a message…": 1, "Send queues. Send now requests delivery when safe.": 1, "Send": 1
    },
    "task-pane": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Hide right pane": 1, "More actions": 1, "Task conversation": 1, "Follow-up": 1, "Message this task": 1, "Queue a message…": 1, "Send queues. Send now requests delivery when safe.": 1, "Send": 1, "Task details": 1, "Changes": 1, "Artifacts": 1, "Events": 1, "Close right pane": 1
    },
    "parallel-group": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "View prompt": 1, "Cancel all": 1, "Message": 6, "Send": 3
    },
    "needs-you": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 2, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2
    },
    "menu-bar": {
      "Harflow": 1, "Harflow, menu open": 1, "Tue 14:32": 1, "Harflow menu": 1, "New task": 1, "Needs you": 2, "Running": 2, "Recent": 2, "Open Harflow": 1, "Settings…": 1, "Quit": 1
    },
    "workflows": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 2, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Search workflows": 2, "New workflow": 1
    },
    "workflow-editor": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 2, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Edit with agent": 1, "More actions": 1, "Discard": 1, "Save": 1, "Run": 1, "Standalone": 1, "Outside the workflow path": 1, "Add on-demand node": 1, "Workflow canvas": 1, "Add node": 1, "Planning": 1, "Implementation": 1, "Review": 1, "Task": 1, "Run workflow": 1, "Start": 1, "Parallel group": 1, "End": 1, "Zoom": 1, "Zoom out": 1, "−": 1, "65%": 1, "Zoom in": 1, "+": 1, "Node settings": 1, "Delete node": 1, "NODE": 1, "Node name": 1, "Role": 1, "Optional": 1, "Continue if this node fails within a parallel branch.": 1, "INSTRUCTIONS": 1, "Instructions": 1, "AGENT": 1, "Harness": 1, "Model": 1, "Effort": 1, "Turn limit": 1, "Caller approvals": 1, "Tried in order for confirmed quota, model or availability failures.": 1, "RUN": 1, "Execution": 1, "Session": 1, "Time limit": 1, "Stop and settle the attempt before retrying or using a fallback.": 1, "Limit": 1, "Attempts per visit": 1, "Context questions": 1, "ACCESS": 1, "Access level": 1
    },
    "workflow-run": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Run view": 1, "Graph": 1, "Parallel": 1, "Pause": 1, "Cancel run": 1, "More actions": 1, "Standalone": 1, "Outside the workflow path": 1, "Workflow steps": 1, "Zoom": 1, "Zoom out": 1, "−": 1, "70%": 1, "Zoom in": 1, "+": 1, "Close": 1, "Message this node": 3, "Send": 1
    },
    "workflow-run-parallel": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Run view": 1, "Graph": 1, "Parallel": 1, "Pause": 1, "Cancel run": 1, "Message": 4, "Send": 2
    },
    "resources": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 2, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Slots limit how many tasks each harness runs at once. A task waits for a free slot before it starts.": 1, "Waiting for a slot": 1
    },
    "statistics": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 2, "Running": 2, "Recent work": 2, "Settings": 1, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Period": 1, "7 days": 1, "30 days": 1, "All time": 1, "Tasks run": 1, "Success rate": 1, "Agent time": 1, "Reported cost": 1, "Tasks per day": 1, "Done": 1, "Failed": 1, "By harness": 1, "Harness": 1, "Tasks": 1, "Success": 1, "Median duration": 1, "Cost": 1
    },
    "settings-general": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 2, "Appearance": 3, "System": 2, "System, follows this computer": 1, "Light": 3, "Dark": 3, "Settings sections": 1, "General": 1, "Harnesses": 1, "Theme": 2, "Also in the sidebar footer.": 1, "Behaviour": 2, "Open the window when a task starts": 1, "Notify when a task finishes": 1, "Notify when a request needs you": 1, "Harflow runtime": 2, "Check for updates": 1, "Task store": 2, "Inspect task store": 1, "Show backup in Finder": 1
    },
    "settings-harnesses": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 2, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Settings sections": 1, "General": 1, "Harnesses": 1, "Where Harflow is registered as an MCP server": 1, "Refresh": 1, "Harness qualification": 2
    },
    "settings-mcp-approvals": {
      "Sidebar": 1, "Harflow": 1, "Collapse sidebar": 1, "Main": 1, "New task": 1, "⌘N": 1, "Needs you": 1, "Workflows": 1, "Resources": 1, "Statistics": 1, "Running": 2, "Recent work": 2, "Settings": 2, "Appearance": 1, "System": 1, "System, follows this computer": 1, "Light": 2, "Dark": 2, "Settings sections": 1, "General": 1, "Harnesses": 1, "Where Harflow is registered as an MCP server": 1, "Refresh": 1, "Harness qualification": 2
    }
  };
  Object.keys(CHROME).forEach(function (key) { S[key].chrome = CHROME[key]; });
  // The two frames whose sidebar can collapse also show the rail's own chrome once it has.
  S['new-task'].chromeCollapsed = S['sidebar'].chromeCollapsed = { 'Expand sidebar': 2, 'Change appearance': 1 };
})();
