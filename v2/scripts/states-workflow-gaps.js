/* Workflow editor and Workflows states: validation and saving, edit with agent, more actions, new workflow and
   generate. Approved by the owner on 2026-11-15 except the states drawn on that decision (provisional). Each state derives from an approved template by exact swaps (an exception is thrown when a block is missing or
   not unique, so a changed base cannot silently draw a different screen). Deterministic display-only fixtures; no engine
   calls. Decision record: docs/decisions/README.md (Workflow and capacity states). Loaded after the screen scripts. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.gapStates = H.gapStates || [];

  var NOTE = 'Provisional · not approved';
  var APPROVAL = { by: 'the owner', date: '2026-11-15', decision: 'Workflow and capacity states' };
  var RECORD = '<a href="docs/decisions/README.md#workflow-and-capacity-states">Decision record</a>';
  var WE = 'workflow-editor';
  var NS = WE + '/node-selected';
  var EWA = WE + '/edit-with-agent';
  var COUNTS = ' · 6 nodes · 1 on demand';
  var where = '';

  // ---- Template helpers -------------------------------------------------------------------------------------------
  function swap(html, find, replace) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + where + ': ' + find.slice(0, 70));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + where + ': ' + find.slice(0, 70));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close) {
    var from = html.indexOf(open), to = from < 0 ? -1 : html.indexOf(close, from + open.length);
    if (from < 0 || to < 0) throw new Error('Block not found in ' + where + ': ' + open.slice(0, 70));
    return html.slice(from, to + close.length);
  }
  function base(key) {
    var html = T[key];
    if (typeof html !== 'string') throw new Error('No template ' + key);
    return html;
  }

  // ---- Shared markup ----------------------------------------------------------------------------------------------
  var GLYPHS = {
    running: ['Running', ''], done: ['Done', 'check'], failed: ['Failed', 'x'], cancelled: ['Cancelled', 'stop'], attention: ['Needs you', 'hand']
  };
  function glyph(kind, small) {
    var g = GLYPHS[kind];
    var label = small ? 'aria-hidden="true" style="width:14px;height:14px;"' : 'aria-label="' + g[0] + '"';
    var icon = g[1] ? '<span class="hd-i hd-i--sm hd-i-' + g[1] + '" aria-hidden="true"></span>' : '';
    return '<span class="hd-glyph hd-glyph--' + kind + '" ' + label + '>' + icon + '</span>';
  }
  function icon(name) { return '<span class="hd-i hd-i--sm hd-i-' + name + '" aria-hidden="true"></span>'; }
  function banner(tone, title, body, extra) {
    return '<div class="hd-banner' + (tone === 'warning' ? ' hd-banner--warning' : '') + (extra ? ' ' + extra : '') + '" role="' + (tone === 'warning' ? 'status' : 'alert') + '">' +
      '<span class="hd-i hd-i-alert" aria-hidden="true"></span><div class="hd-banner__body">' + (title ? '<div class="hd-banner__title">' + title + '</div>' : '') + body + '</div></div>';
  }
  function dialog(html, id, title, body, actions) {
    html = swap(html, '<aside class="hd-sidebar"', '<aside inert class="hd-sidebar"');
    html = swap(html, '<main class="hd-main">', '<main class="hd-main" inert>');
    return swap(html, '</main>', '</main><div class="hd-m05-scrim"><div class="hd-dialog" role="dialog" aria-modal="true" aria-labelledby="' + id + '">' +
      '<h2 class="hd-dialog__title" id="' + id + '">' + title + '</h2>' + body + '<div class="hd-dialog__actions">' + actions + '</div></div></div>');
  }
  function menuItem(iconName, label, o) {
    o = o || {};
    var tag = o.href ? 'a' : 'button';
    var attrs = (o.href ? ' href="' + o.href + '"' : ' type="button"') + (o.disabled ? ' aria-disabled="true"' : '');
    return '<' + tag + ' class="hd-menu__item' + (o.danger ? ' hd-menu__item--danger' : '') + '" role="menuitem"' + attrs + '>' +
      (iconName ? icon(iconName) : '') + '<span class="hd-menu__item-body">' + label + '</span></' + tag + '>';
  }
  var SEP = '<div class="hd-menu__sep" role="separator"></div>';

  // ---- Workflow editor: frame pieces ------------------------------------------------------------------------------
  var SAVE = '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm" >Save</button>';
  var ROW_OPEN = '<div class="caption hd-faint" style="flex:none;display:flex;align-items:center;gap:6px;';
  var ROW_CLOSE = 'Ready to save</span></div>';
  var MORE = '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions">';
  var STRIP = '<div class="hd-standalone" style="flex:none;">';

  function statusRow(inner, plain) {
    return '<div class="caption hd-faint" style="flex:none;display:flex;align-items:center;gap:6px;padding:6px var(--space-4);border-top:1px solid var(--border);"' + (plain ? '' : ' role="status"') + '>' + inner + '</div>';
  }
  function setRow(html, row) { return swap(html, between(html, ROW_OPEN, ROW_CLOSE), row); }
  function messageRow(kind, text) { return statusRow((kind ? glyph(kind, true) : '') + '<span>' + text + COUNTS + '</span>'); }
  function saveDisabled(html, label) {
    return swap(html, SAVE, '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm" disabled' + (label ? ' aria-label="' + label + '"' : '') + '>Save</button>');
  }
  function afterBar(html, markup) { return swap(html, STRIP, '<div class="hd-gap-strip">' + markup + '</div>' + STRIP); }

  function newWorkflow(html) {
    html = swap(html, '<span class="hd-topbar__title">Release checklist</span>', '<span class="hd-topbar__title hd-faint">New workflow</span>');
    html = swap(html, 'Unsaved changes · Revision 7</span>', 'Unsaved changes</span>');
    html = setRow(html, messageRow(null, 'Enter a workflow name.'));
    return saveDisabled(html);
  }

  var REVIEW_LINK = '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" aria-haspopup="menu"';
  function missingNode(html, top, selected) {
    var node = between(html, '<div class="hd-node" style="left:486px;top:' + top + 'px;', '<span class="hd-port hd-port--out"></span></div>');
    return swap(html, node, '<div class="hd-node' + (selected ? ' is-selected' : '') + ' hd-gap-node--warning" style="left:486px;top:' + top + 'px;min-width:0;width:172px;height:82px;">' +
      '<div class="hd-node__kind">Run workflow</div><div class="hd-node__head" style="white-space:nowrap;"><span>Security sweep</span></div>' +
      '<div class="hd-node__meta" style="white-space:nowrap;">' + icon('alert') + 'Unavailable workflow</div>' +
      '<span class="hd-port hd-port--in"></span><span class="hd-port hd-port--out"></span></div>');
  }
  function reviewButton(open) {
    return REVIEW_LINK + (open ? ' aria-expanded="true"' : ' aria-expanded="false"') + '>Review missing workflows</button>';
  }
  function missingRow(open) {
    var menu = '';
    if (open) {
      menu = '<div class="hd-menu" role="menu" aria-label="Missing workflows">' +
        menuItem(null, 'Release checklist → Security sweep') + menuItem(null, 'Release checklist → Checks → Security sweep') + SEP +
        '<div class="hd-menu__label" role="presentation">Additional missing references may remain; validate again after repairs.</div></div>';
    }
    return statusRow('<span class="hd-gap-warn" role="status">' + icon('alert') + '<span>2 missing workflow references' + COUNTS + '</span></span><span class="hd-topbar__spacer"></span>' +
      '<span class="hd-gap-menu-anchor hd-gap-menu-anchor--up">' + reviewButton(open) + menu + '</span>', true);
  }
  var MISSING_INSPECTOR = '<aside class="hd-inspector" aria-label="Node settings"><div class="hd-inspector__head"><span class="hd-inspector__title">Security sweep</span>' +
    '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Delete node">' + icon('x') + '</button></div><div class="hd-inspector__body">' +
    '<section class="hd-inspector__section"><h3 class="hd-inspector__label" style="margin:0;">NODE</h3><div class="hd-field"><label class="hd-field__label" for="gap-nn">Node name</label>' +
    '<input id="gap-nn" class="hd-input" type="text" value="Security sweep"></div></section>' +
    '<section class="hd-inspector__section"><h3 class="hd-inspector__label" style="margin:0;">WORKFLOW</h3>' +
    banner('warning', '', 'Unavailable workflow: security-sweep. Choose a replacement for this node, or replace all matching nodes below.') +
    '<div class="hd-form-row"><label class="hd-form-row__label" for="gap-nw">Workflow</label><button type="button" id="gap-nw" class="hd-input hd-select"><span>Unavailable workflow</span>' + icon('chevron-down') + '</button></div>' +
    '<a class="hd-btn hd-btn--secondary" href="#workflow-editor/missing-child-replace">Replace all matching nodes…</a></section></div></aside>';

  function missingChild(html, open) {
    html = missingNode(html, 168, true);
    html = missingNode(html, 290, false);
    html = swap(html, '<div class="hd-node is-selected" style="left:882px', '<div class="hd-node" style="left:882px');
    html = setRow(html, missingRow(open));
    html = swap(html, between(html, '<aside class="hd-inspector" aria-label="Node settings">', '</aside>'), MISSING_INSPECTOR);
    return saveDisabled(html);
  }

  function conflict(html, text, detail) {
    html = setRow(html, '<div class="hd-banner hd-banner--warning hd-gap-banner-row"><span class="hd-i hd-i-alert" aria-hidden="true"></span><div class="hd-banner__body" role="status">' + text +
      (detail ? '<div class="caption hd-faint">' + detail + '</div>' : '') + '</div><button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Save copy and reload</button></div>');
    return saveDisabled(html);
  }

  function loadFailed(html) {
    html = swap(html, '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm"><span class="hd-i hd-i--sm hd-i-sparkle"', '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" disabled><span class="hd-i hd-i--sm hd-i-sparkle"');
    html = swap(html, MORE, '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions" disabled>');
    html = swap(html, '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Discard</button>', '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" disabled>Discard</button>');
    html = saveDisabled(html);
    html = swap(html, between(html, '<span class="hd-topbar__meta"', 'Unsaved changes · Revision 7</span>'), '');
    var from = html.indexOf(STRIP), to = html.indexOf('</main>');
    if (from < 0 || to < 0) throw new Error('Block not found in ' + where + ': split');
    return html.slice(0, from) + '<div class="hd-empty" style="flex:1;justify-content:center;"><div class="hd-empty__icon"><span class="hd-i hd-i-alert" aria-hidden="true"></span></div>' +
      '<div class="hd-empty__title">Workflow could not be loaded</div><div class="hd-empty__text">The workflow file could not be read.</div>' +
      '<button type="button" class="hd-btn hd-btn--secondary">Retry</button></div>\n' + html.slice(to);
  }

  function moreActions(html, unsaved) {
    var menu = '<div class="hd-menu" role="menu" aria-label="More actions">' + menuItem('sparkle', 'Generate with agent…') + SEP +
      (unsaved ? menuItem(null, 'Delete…', { danger: true, disabled: true }) : menuItem(null, 'Delete…', { danger: true, href: '#workflow-editor/delete-confirm' })) + '</div>';
    var button = MORE + '<span class="hd-i hd-i-more" aria-hidden="true"></span></button>';
    return swap(html, button, '<span class="hd-gap-menu-anchor"><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions" aria-haspopup="menu" aria-expanded="true"><span class="hd-i hd-i-more" aria-hidden="true"></span></button>' + menu + '</span>');
  }

  // ---- Edit with agent and Generate ------------------------------------------------------------------------------
  var BADGE = '<span class="hd-badge hd-badge--running"><span class="hd-i hd-i--sm hd-i-sparkle" aria-hidden="true"></span>Editing with agent</span>';
  var RETURN = '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Return to canvas</button>';
  var APPLY = '<button type="button" class="hd-btn hd-btn--primary hd-btn--sm">Apply proposal</button>';
  var PAUSE = '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">' + icon('pause') + ' Pause</button>';
  var CANCEL_RUN = '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Cancel run</button>';
  var TRANSCRIPT_OPEN = '<div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border);">';
  var TRANSCRIPT_END = 'Proposal ready · 1 node added · 1 connection removed</span></div></div>';
  var COMPOSER_LABEL = '<label class="hd-sr" for="bm">Describe the changes</label>';
  var COMPOSER_INPUT = '<textarea id="bm" class="hd-composer__input" rows="1" placeholder="Describe the changes" style="min-height:24px;"></textarea>';
  var REQUEST = 'Add a security review that runs only when dependencies change';
  var GEN_REQUEST = 'Create a workflow that checks dependencies every night and opens a pull request for outdated packages.';
  var REASON = 'The builder stopped: the harness reported a usage limit.';

  function bubble(text) { return '<div class="hd-msg-user">' + text + '</div>'; }
  function status(kind, text) { return '<div class="hd-gap-status hd-gap-status--' + kind + '">' + glyph(kind) + '<span>' + text + '</span></div>'; }
  function toolRow(summary, meta) {
    return '<div class="hd-tool"><button type="button" class="hd-tool__head" aria-expanded="false">' + icon('workflow') + '<span class="hd-tool__summary">' + summary + '</span>' +
      '<span class="hd-tool__meta">' + meta + '</span>' + icon('chevron-right') + '</button></div>';
  }
  function transcript(html, content) {
    return swap(html, between(html, TRANSCRIPT_OPEN, TRANSCRIPT_END), TRANSCRIPT_OPEN + content + '</div>');
  }
  function composer(html, o) {
    if (o.placeholder) {
      html = swap(html, COMPOSER_LABEL, '<label class="hd-sr" for="bm">' + o.placeholder + '</label>');
      html = swap(html, COMPOSER_INPUT, '<textarea id="bm" class="hd-composer__input" rows="1" placeholder="' + o.placeholder + '"' + (o.disabled ? ' disabled' : '') + ' style="min-height:24px;"></textarea>');
    } else if (o.disabled) {
      html = swap(html, COMPOSER_INPUT, '<textarea id="bm" class="hd-composer__input" rows="1" placeholder="Describe the changes" disabled style="min-height:24px;"></textarea>');
    }
    return html;
  }
  // The canvas of the Node selected state, without a selection or the add tray.
  function plainCanvas() {
    var ns = base(NS);
    var from = ns.indexOf('<div class="hd-canvas" aria-label="Workflow canvas">');
    var to = ns.indexOf('<div class="caption hd-faint" style="flex:none;display:flex;align-items:center;gap:6px;', from);
    if (from < 0 || to < 0) throw new Error('Canvas not found in ' + NS);
    var canvas = ns.slice(from, to);
    canvas = swap(canvas, '<div class="hd-node is-selected"', '<div class="hd-node"');
    var tray = canvas.slice(canvas.indexOf('<div class="hd-tray"'), canvas.indexOf('<div class="hd-zoom"'));
    return swap(canvas, tray, '');
  }
  function withCanvas(html, canvas) {
    var from = html.indexOf('<div class="hd-canvas" aria-label="Proposed workflow">'), to = html.indexOf('<aside class="hd-pane"', from);
    if (from < 0 || to < 0) throw new Error('Canvas not found in ' + where);
    return html.slice(0, from) + '<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;min-height:0;">' + canvas + '</div>' + html.slice(to);
  }
  function agentFrame(html, o) {
    html = withCanvas(html, plainCanvas());
    if (o.badge) html = swap(html, BADGE, o.badge);
    html = swap(html, RETURN + APPLY, (o.before || '') + RETURN + (o.apply === false ? '' : (o.apply === 'disabled' ? APPLY.replace('<button type="button"', '<button type="button" disabled') : APPLY)));
    html = transcript(html, o.content);
    return composer(html, o.composer || {});
  }

  var FAILED_BADGE = '<span class="hd-badge hd-badge--failed">' + glyph('failed', true) + 'Failed</span>';
  var CANCELLED_BADGE = '<span class="hd-badge">' + glyph('cancelled', true) + 'Cancelled</span>';

  var INTRO = '<p class="body" style="margin:0;color:var(--text-secondary);">';
  var ON_DEMAND = ['Security reviewer', 'Docs checker'];
  function generate(html, o) {
    html = swap(html, '<span class="hd-topbar__title">Release checklist</span>', '<span class="hd-topbar__title">dependency-audit</span>');
    html = swap(html, BADGE, o.badge);
    html = swap(html, '<span class="hd-topbar__meta">Revision 7</span>', '<span class="hd-topbar__meta">New workflow</span>');
    html = swap(html, RETURN + APPLY, (o.before || '') + '<a class="hd-btn hd-btn--ghost hd-btn--sm" href="#workflows/list">Return to workflows</a>' + (o.primary || ''));
    ON_DEMAND.forEach(function (name) {
      html = swap(html, between(html, '<button type="button" class="hd-node hd-node--ondemand" aria-label="' + name + ', on demand node">', '</button>'), '');
    });
    html = swap(html, between(html, '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Add on-demand node">', '</button>'), '');
    html = swap(html, between(html, INTRO, '</p>'), '');
    html = o.canvas ? withCanvas(html, plainCanvas()) :
      swap(html, between(html, '<div class="hd-canvas" aria-label="Proposed workflow">', '<aside class="hd-pane"').slice(0, -'<aside class="hd-pane"'.length),
        '<div class="hd-canvas" aria-label="Workflow draft"><div class="hd-gap-canvas-note">The draft appears here when the builder saves it.</div></div>');
    html = transcript(html, o.content);
    return composer(html, Object.assign({ placeholder: 'Message the workflow builder' }, o.composer || {}));
  }

  // The builder's agent options, opened from the builder pill: the fields of the agent editor of a node (Harness, Model, Effort,
  // Turn limit) and its fallback harnesses.
  var BUILDER_PILL = '<button type="button" class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Builder: Claude Code · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>';
  function selectField(id, label, value) {
    return '<div class="hd-field"><label class="hd-field__label" for="' + id + '">' + label + '</label><button type="button" id="' + id + '" class="hd-input hd-select"><span>' + value + '</span>' + icon('chevron-down') + '</button></div>';
  }
  function iconButton(name, label, o) {
    return '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm' + (o && o.flip ? ' hd-gap-flip' : '') + '" aria-label="' + label + '"' + (o && o.disabled ? ' disabled' : '') + '>' + icon(name) + '</button>';
  }
  function builderOptions() {
    var fallback = '<div class="hd-gap-fallback"><div class="hd-gap-fallback__head"><span class="hd-gap-fallback__title">Fallback 1</span><span class="hd-topbar__spacer"></span>' +
      iconButton('arrow-up', 'Move fallback 1 up', { disabled: true }) + iconButton('arrow-up', 'Move fallback 1 down', { disabled: true, flip: true }) + iconButton('minus', 'Remove fallback 1') + '</div>' +
      '<div class="hd-gap-grid">' + selectField('gbo-fh', 'Harness', 'Codex') + selectField('gbo-fm', 'Model', 'gpt-6-astra') + '</div></div>';
    return '<div class="hd-menu hd-gap-popover" role="dialog" aria-label="Builder options">' +
      '<div class="hd-menu__label" role="presentation">Workflow builder</div>' +
      '<div class="hd-gap-grid">' + selectField('gbo-h', 'Harness', 'Claude Code') + selectField('gbo-m', 'Model', 'Opus 5.5') + '</div>' +
      '<div class="hd-gap-grid">' + selectField('gbo-e', 'Effort', 'Default') +
      '<div class="hd-field"><label class="hd-field__label" for="gbo-t">Turn limit</label><input id="gbo-t" class="hd-input" type="text" placeholder="Default" value=""></div></div>' +
      '<button type="button" class="hd-gap-disclosure" aria-expanded="true" aria-controls="gbo-fb"><span>Fallback harnesses (1)</span>' + icon('chevron-down') + '</button>' +
      '<div id="gbo-fb" class="hd-gap-fallbacks">' + fallback +
      '<div class="hd-gap-add-row"><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">' + icon('plus') + 'Add fallback</button></div>' +
      '<span class="hd-form-row__hint hd-gap-hint">Tried in order for confirmed quota, model or availability failures.</span></div></div>';
  }
  function builderOpen(html) {
    return swap(html, BUILDER_PILL, '<span class="hd-popover-anchor"><button type="button" class="hd-pill is-open" aria-haspopup="dialog" aria-expanded="true"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Builder: Claude Code · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>' + builderOptions() + '</span>');
  }

  // ---- Workflows ---------------------------------------------------------------------------------------------------
  var NEW_BUTTON = '<button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-plus" aria-hidden="true"></span>New workflow</button>';
  function newMenu(html) {
    var menu = '<div class="hd-menu" role="menu" aria-label="New workflow">' + menuItem('plus', 'Blank workflow', { href: '#workflow-editor/name-required' }) +
      menuItem('sparkle', 'Generate with agent…', { href: '#workflows/generate' }) + '</div>';
    return swap(html, NEW_BUTTON, '<span class="hd-gap-menu-anchor"><button type="button" class="hd-btn hd-btn--secondary" aria-haspopup="menu" aria-expanded="true"><span class="hd-i hd-i--sm hd-i-plus" aria-hidden="true"></span>New workflow</button>' + menu + '</span>');
  }
  function generateForm(html) {
    html = swap(html, 'Run Release checklist</h1>', 'Generate a workflow</h1>');
    html = swap(html, '<form class="hd-composer" aria-label="Run workflow">', '<form class="hd-composer" aria-label="Generate workflow">');
    var fields = html.slice(html.indexOf('<form class="hd-composer" aria-label="Generate workflow">') + '<form class="hd-composer" aria-label="Generate workflow">'.length, html.indexOf('<div class="hd-composer__bar">'));
    html = swap(html, fields, '<div class="hd-field"><label class="hd-field__label" for="gen-name">Workflow name</label><input id="gen-name" class="hd-input" type="text" value="dependency-audit"></div>' +
      '<div class="hd-field" style="border-top:1px solid var(--border);padding-top:var(--space-2);"><label class="hd-field__label" for="gen-desc">Describe the workflow</label>' +
      '<textarea id="gen-desc" class="hd-composer__input" rows="3">' + GEN_REQUEST + '</textarea>' +
      '<span class="hd-field__hint">An agent creates a draft. Harflow validates and stores it for you to edit.</span></div>');
    var bar = between(html, '<div class="hd-composer__bar">', '</div></form>');
    html = swap(html, bar, '<div class="hd-composer__bar"><button type="button" class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">No repository</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>' +
      '<button type="button" class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Builder: Claude Code · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>' +
      '<span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="Generate"><span class="hd-i hd-i-sparkle" aria-hidden="true"></span></button></div></form>');
    return swap(html, between(html, '<section aria-label="Permissions preview"', '</section>'), '');
  }

  // ---- Registration ------------------------------------------------------------------------------------------------
  function addGroups(familyId, names) {
    var family = H.findFamily(familyId);
    names.forEach(function (name) {
      if (family.groups.indexOf(name) >= 0) return;
      var at = family.groups.indexOf('Loading');
      family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
    });
  }
  function def(familyId, o) {
    var key = familyId + '/' + o.id;
    docs[key] = '<p><strong>' + (o.provisional ? 'Provisional, not approved.' : 'Approved by the owner · 2026-11-15.') + '</strong> ' + o.guide + ' ' + RECORD + '.</p>';
    Object.defineProperty(T, key, {
      enumerable: true, configurable: true,
      get: function () {
        var from = base(o.base);
        where = key;
        var value = o.build(from);
        Object.defineProperty(T, key, { enumerable: true, configurable: true, writable: true, value: value });
        return value;
      }
    });
    H.gapStates.push(key);
    var state = { id: o.id, title: o.title, description: o.description, group: o.group };
    if (o.provisional) { state.status = 'provisional'; state.approvalNote = NOTE; } else { state.status = 'approved'; state.approval = APPROVAL; }
    H.registerState(familyId, state);
  }

  addGroups(WE, ['Validation and saving', 'Edit with agent', 'More actions', 'Generate']);
  addGroups('workflows', ['New workflow']);

  var G1 = 'Validation and saving', G2 = 'Edit with agent', G3 = 'More actions', G4 = 'Generate';
  var ENGINE = ' The engine message is fixture text.';
  var DESIGN_GLYPH = ' The leading glyph in the status row is a design addition; the message and counts follow the Mac caption.';

  // 1-11 Validation and saving
  def(WE, {
    id: 'checking', title: 'Checking the workflow', group: G1, base: NS,
    description: 'The status row under the canvas while the workflow is being checked: a running glyph and the Mac caption, with Save off.',
    guide: 'The status row while the workflow is validated. Save is off until the check ends.' + DESIGN_GLYPH,
    build: function (h) { return saveDisabled(setRow(h, messageRow('running', 'Checking workflow…')), ''); }
  });
  def(WE, {
    id: 'invalid', title: 'Invalid workflow', group: G1, base: NS,
    description: 'The status row names the problem the engine found; Save is off with a label that says to fix it first.',
    guide: 'The validator found a problem, so the row names it and Save stays off.' + ENGINE + DESIGN_GLYPH,
    build: function (h) { return saveDisabled(setRow(h, messageRow('failed', 'Node ‘Review’ has no outgoing connection.')), 'Save, fix the problem first'); }
  });
  def(WE, {
    id: 'validate-unavailable', title: 'Validation unavailable', group: G1, base: NS,
    description: 'The status row when the validator could not be reached; Save is off.',
    guide: 'The workflow could not be checked at all. The second sentence of the row is fixture text.' + DESIGN_GLYPH,
    build: function (h) { return saveDisabled(setRow(h, messageRow('failed', 'Unable to validate workflow. The validator did not respond.'))); }
  });
  def(WE, {
    id: 'name-required', title: 'Name required', group: G1, base: NS,
    description: 'A new unsaved workflow with no name yet: the top bar shows a faint placeholder title and the status row asks for a name; Save is off.',
    guide: 'A workflow that has not been saved and has no name. Only the title and the status row differ from Node selected. The title wording is a design addition.',
    build: newWorkflow
  });
  def(WE, {
    id: 'missing-child', title: 'Unavailable child workflow', group: G1, base: NS,
    description: 'Two Run workflow nodes point to a workflow that no longer exists. The nodes carry a warning outline, the status row counts the missing references and the inspector offers a replacement.',
    guide: 'Both parallel branches are Run workflow nodes whose workflow is unavailable. The warning outline on the nodes and the inspector layout are design additions; the workflow names are fixture text.',
    build: function (h) { return missingChild(h, false); }
  });
  def(WE, {
    id: 'missing-child-paths', title: 'Missing workflows listed', group: G1, base: NS,
    description: 'The Review missing workflows menu open above the status row, listing each path to a missing workflow.',
    guide: 'The menu lists every path that reaches a missing workflow, then a note that more may remain. The paths are fixture text; the note is Mac copy (W/WorkflowValidationStatus.swift:38).',
    build: function (h) { return missingChild(h, true); }
  });
  def(WE, {
    id: 'missing-child-replace', title: 'Replace all matching nodes', group: G1, base: NS,
    description: 'A confirmation to use one workflow in every node that points to the unavailable one, in this workflow only.',
    guide: 'The confirmation names each affected node and the replacement. Cancel returns to the unavailable child workflow state. The replacement name and the dialog wording are design additions.',
    build: function (h) {
      return dialog(missingChild(h, false), 'gap-replace-title', 'Replace unavailable workflow in 2 nodes?',
        '<ul class="hd-gap-lines hd-dialog__text"><li>Security sweep (node 2)</li><li>Security sweep (node 4)</li></ul><p class="hd-dialog__text">Use ‘Dependency audit’ in these nodes of this workflow only.</p>',
        '<a class="hd-btn hd-btn--secondary" href="#workflow-editor/missing-child">Cancel</a><button type="button" class="hd-btn hd-btn--primary">Replace all</button>');
    }
  });
  def(WE, {
    id: 'conflict', title: 'Saved version changed', group: G1, base: NS,
    description: 'The saved workflow changed or was replaced while it was open: a warning row keeps the draft and offers to save a copy and reload.',
    guide: 'The saved workflow changed under the open draft. The draft is kept; Save is off. The warning row layout is a design addition.',
    build: function (h) { return conflict(h, 'The saved workflow changed or was replaced. Your draft is preserved. Save a copy and reload to reconcile it.'); }
  });
  def(WE, {
    id: 'conflict-unreadable', title: 'Saved version unreadable', group: G1, base: NS,
    description: 'The saved workflow could not be read, possibly because it was deleted: a warning row keeps the draft and offers to save a copy and reload.',
    guide: 'The current saved version could not be read. The detail line is fixture text from the engine.',
    build: function (h) { return conflict(h, 'The current saved workflow could not be read. It may have been deleted. Your unsaved draft is preserved.', 'Workflow ‘release-checklist’ was not found.'); }
  });
  def(WE, {
    id: 'save-failed', title: 'Save failed', group: G1, base: NS,
    description: 'A danger banner under the top bar after a failed save; the edits are kept and Save stays available.',
    guide: 'Saving failed and nothing was lost: the meta still says Unsaved changes. The banner reason is fixture text.',
    build: function (h) { return afterBar(h, banner('danger', 'Couldn’t save the workflow.', 'The workflow catalog is busy. Try again in a moment.')); }
  });
  def(WE, {
    id: 'load-failed', title: 'Workflow not loaded', group: G1, base: NS,
    description: 'The workflow file could not be read: the top bar actions are off and the canvas is replaced by an empty state with Retry.',
    guide: 'Nothing can be edited until the file loads. The reason text is fixture text.',
    build: loadFailed
  });

  def(WE, {
    id: 'discard-confirm', title: 'Discard unsaved changes', group: G1, base: NS, provisional: true,
    description: 'A confirmation before unsaved changes are discarded: the workflow returns to its last saved revision.',
    guide: 'The confirmation of Discard. The wording is design wording; the Mac discards without asking. The state is drawn on the owner\'s decision and has not been seen by the owner.',
    build: function (h) {
      return dialog(h, 'gap-discard-title', 'Discard unsaved changes?', '<p class="hd-dialog__text">The workflow returns to revision 7, its last saved revision.</p>',
        '<a class="hd-btn hd-btn--secondary" href="#workflow-editor/node-selected">Cancel</a><button type="button" class="hd-btn hd-btn--danger">Discard</button>');
    }
  });

  // 12-17 Edit with agent
  def(WE, {
    id: 'agent-request', title: 'Edit with agent request', group: G2, base: NS,
    description: 'The request sheet for Edit with agent, filled in, above the editor.',
    guide: 'The sheet where the change is described before the builder starts. The request text is fixture text.',
    build: function (h) {
      return dialog(h, 'gap-agent-title', 'Edit workflow with agent',
        '<p class="hd-dialog__text">An agent proposes changes to your current canvas. Review and apply them, then Save when ready.</p>' +
        '<div class="hd-field"><label class="hd-field__label" for="gap-agent-request">Describe the changes</label><textarea id="gap-agent-request" class="hd-input" rows="3">' + REQUEST + '</textarea></div>',
        '<a class="hd-btn hd-btn--secondary" href="#workflow-editor/node-selected">Cancel</a><button type="button" class="hd-btn hd-btn--primary">Propose changes</button>');
    }
  });
  def(WE, {
    id: 'agent-starting', title: 'Edit with agent · starting', group: G2, base: EWA,
    description: 'The builder is starting: the canvas shows the current workflow, Apply is off and the composer is locked.',
    guide: 'The request was sent and the builder has not produced anything yet. The canvas is the unchanged workflow.',
    build: function (h) {
      return agentFrame(h, { apply: 'disabled', composer: { disabled: true }, content: bubble(REQUEST) + status('running', 'Starting workflow builder…') });
    }
  });
  def(WE, {
    id: 'agent-working', title: 'Edit with agent · working', group: G2, base: EWA,
    description: 'The builder is working: Pause and Cancel run are available, Apply is off and the transcript is filling in.',
    guide: 'The builder is reading the workflow. The transcript lines are fixture text.',
    build: function (h) {
      return agentFrame(h, {
        before: PAUSE + CANCEL_RUN, apply: 'disabled', composer: { disabled: true },
        content: bubble(REQUEST) + '<div class="hd-msg-agent"><p>I’m reading the current workflow and the release checklist nodes.</p></div>' + toolRow('Read the workflow draft', '0:03') + status('running', 'Working')
      });
    }
  });
  def(WE, {
    id: 'agent-failed', title: 'Edit with agent · failed', group: G2, base: EWA,
    description: 'The builder stopped with an error: the badge says Failed, the reason is shown, Apply is gone and the composer is open for a new message.',
    guide: 'The builder run failed. The reason is fixture text from the engine.',
    build: function (h) {
      return agentFrame(h, {
        badge: FAILED_BADGE, apply: false, composer: { placeholder: 'Message the workflow builder' },
        content: bubble(REQUEST) + status('failed', 'Failed') + '<p class="hd-gap-reason">' + REASON + '</p>'
      });
    }
  });
  def(WE, {
    id: 'agent-cancelled', title: 'Builder cancelled', group: G2, base: EWA,
    description: 'The builder run was cancelled: the badge says Cancelled, Apply is gone and the composer is locked.',
    guide: 'The builder run was cancelled. The same state stands for a cancelled Generate.',
    build: function (h) {
      return agentFrame(h, {
        badge: CANCELLED_BADGE, apply: false, composer: { placeholder: 'Message the workflow builder', disabled: true },
        content: bubble(REQUEST) + status('cancelled', 'Cancelled')
      });
    }
  });
  def(WE, {
    id: 'agent-canvas-changed', title: 'Edit with agent · canvas changed', group: G2, base: EWA,
    description: 'The canvas was edited after the request: a warning at the top of the pane says so and Apply is off.',
    guide: 'The suggested changes no longer match the canvas. The warning wording is a design addition.',
    build: function (h) {
      h = swap(h, '<div class="hd-scroll" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4);">' + INTRO,
        '<div class="hd-scroll" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4);">' +
        banner('warning', '', 'The canvas changed after this request. Return to the canvas to keep your edits; open the proposal from history separately.') + INTRO);
      return swap(h, APPLY, APPLY.replace('<button type="button"', '<button type="button" disabled'));
    }
  });

  // 18-21 More actions
  def(WE, {
    id: 'more-actions', title: 'More actions open', group: G3, base: NS,
    description: 'The More actions menu open in the top bar, with Generate with agent and Delete….',
    guide: 'The menu of a saved workflow. Delete… opens its confirmation; the label ends with an ellipsis for that reason.',
    build: function (h) { return moreActions(h, false); }
  });
  def(WE, {
    id: 'more-actions-unsaved', title: 'More actions · never saved', group: G3, base: NS,
    description: 'The More actions menu of a workflow that was never saved: Delete… is unavailable.',
    guide: 'There is nothing saved to delete, so Delete… is off. The top bar is that of Name required.',
    build: function (h) { return moreActions(newWorkflow(h), true); }
  });
  def(WE, {
    id: 'delete-confirm', title: 'Delete workflow confirmation', group: G3, base: NS,
    description: 'A confirmation before a workflow with unsaved changes is deleted; the unsaved changes are lost and earlier runs keep their snapshots.',
    guide: 'The confirmation of Delete while the workflow has unsaved changes, so it says they are lost. The workflow name is fixture text. The line about unsaved changes is design wording.',
    build: function (h) {
      return dialog(h, 'gap-delete-title', 'Delete workflow ‘Release checklist’?', '<p class="hd-dialog__text">Existing run snapshots remain available.</p><p class="hd-dialog__text">Unsaved changes will be lost.</p>',
        '<a class="hd-btn hd-btn--secondary" href="#workflow-editor/node-selected">Cancel</a><button type="button" class="hd-btn hd-btn--danger">Delete</button>');
    }
  });
  def(WE, {
    id: 'delete-confirm-saved', title: 'Delete workflow confirmation, no unsaved changes', group: G3, base: WE + '/orchestrator', provisional: true,
    description: 'The same confirmation over a saved workflow: there are no unsaved changes, so the line about them is absent.',
    guide: 'Drawn on the saved editor (Revision 7, Save and Discard off). Only the sentence about unsaved changes differs from the other confirmation. The state is drawn on the owner\'s decision and has not been seen by the owner.',
    build: function (h) {
      return dialog(h, 'gap-delete-title', 'Delete workflow ‘Release checklist’?', '<p class="hd-dialog__text">Existing run snapshots remain available.</p>',
        '<a class="hd-btn hd-btn--secondary" href="#workflow-editor/orchestrator">Cancel</a><button type="button" class="hd-btn hd-btn--danger">Delete</button>');
    }
  });
  def(WE, {
    id: 'delete-failed', title: 'Delete failed', group: G3, base: NS,
    description: 'A danger banner under the top bar after a failed delete; the workflow stays open.',
    guide: 'Deleting failed and the workflow is still open. The banner reason is fixture text.',
    build: function (h) { return afterBar(h, banner('danger', 'Couldn’t delete the workflow.', 'The workflow catalog is busy. Try again in a moment.')); }
  });

  // 22-25 New workflow
  def('workflows', {
    id: 'new-menu', title: 'New workflow menu', group: 'New workflow', base: 'workflows/list',
    description: 'The New workflow button open with Blank workflow and Generate with agent.',
    guide: 'The two ways to start a workflow. Blank workflow opens the editor for an unsaved workflow.',
    build: newMenu
  });
  def('workflows', {
    id: 'generate', title: 'Generate a workflow', group: 'New workflow', base: 'workflows/run',
    description: 'The page for generating a workflow with an agent: a name, a description, the repository and the builder.',
    guide: 'Drawn from the Run workflow page with the form replaced. The name, the description and the builder are fixture text; the hint under the description is Mac copy (W/WorkflowLaunchSheet.swift:19) and the pill labels are design wording.',
    build: generateForm
  });
  def('workflows', {
    id: 'generate-refused', title: 'Generate refused', group: 'New workflow', base: 'workflows/run',
    description: 'The generate sheet after the engine refused the request because an agent is already running.',
    guide: 'The refusal is shown under the form. The sentence is fixture text from the engine.',
    build: function (h) {
      return swap(generateForm(h), '</form>', '</form><p class="hd-gap-note hd-gap-note--danger" role="alert">The workflow agent is already starting or running.</p>');
    }
  });
  def('workflows', {
    id: 'generate-uncertain', title: 'Earlier request uncertain', group: 'New workflow', base: 'workflows/run',
    description: 'The generate sheet with a warning that an earlier request may already have started a builder run.',
    guide: 'An earlier request was interrupted before its run ID arrived. The warning wording is a design addition; Generate stays available.',
    build: function (h) {
      return swap(generateForm(h), '<form class="hd-composer" aria-label="Generate workflow">',
        banner('warning', '', 'The previous workflow agent request was interrupted before its run ID was received. It may already have created a builder run. Check workflow history before starting another request.') +
        '<form class="hd-composer" aria-label="Generate workflow">');
    }
  });

  def('workflows', {
    id: 'generate-builder-options', title: 'Builder options', group: 'New workflow', base: 'workflows/generate', provisional: true,
    description: 'The builder pill opened as a popover with the agent options: harness, model, effort, turn limit and fallback harnesses.',
    guide: 'The builder pill of the generate page opened. The fields and the fallback captions are the agent editor of the Mac (W/WorkflowAgentEditor.swift); Effort starts at Default. The caller approvals switch of that editor is not drawn. A fallback shows its harness and model; its effort, turn limit and caller approvals are not drawn. The state is drawn on the owner\'s decision and has not been seen by the owner.',
    build: builderOpen
  });

  // 26-29 Generate
  var RUNNING_BADGE = '<span class="hd-badge hd-badge--running"><span class="hd-i hd-i--sm hd-i-sparkle" aria-hidden="true"></span>Generating</span>';
  def(WE, {
    id: 'generate-starting', title: 'Generating · starting', group: G4, base: EWA,
    description: 'A new workflow being generated: the builder is starting and the canvas has no draft yet.',
    guide: 'Drawn from Edit with agent for a workflow that does not exist yet. The note on the canvas and the Return to workflows link are design additions; the name and the request are fixture text.',
    build: function (h) {
      return generate(h, { badge: RUNNING_BADGE, composer: { disabled: true }, content: bubble(GEN_REQUEST) + status('running', 'Starting workflow builder…') });
    }
  });
  def(WE, {
    id: 'generate-working', title: 'Generating · working', group: G4, base: EWA,
    description: 'The builder is writing the draft: Pause and Cancel run are available and the canvas still has no draft.',
    guide: 'Drawn like the starting state with Pause and Cancel run added. The transcript lines are fixture text.',
    build: function (h) {
      return generate(h, {
        badge: RUNNING_BADGE, before: PAUSE + CANCEL_RUN, composer: { disabled: true },
        content: bubble(GEN_REQUEST) + '<div class="hd-msg-agent"><p>I’m laying out the nightly checks and the pull request step.</p></div>' + toolRow('Drafted the workflow nodes', '0:06') + status('running', 'Working')
      });
    }
  });
  def(WE, {
    id: 'generate-ready', title: 'Generated draft ready', group: G4, base: EWA,
    description: 'The draft was saved: the canvas shows it and Open generated draft opens it in the editor.',
    guide: 'The builder saved the draft. The canvas reuses the Node selected canvas as a stand-in for the draft; the badge and the closing line are design wording.',
    build: function (h) {
      return generate(h, {
        badge: '<span class="hd-badge hd-badge--done">' + icon('check') + 'Draft saved</span>', canvas: true, composer: { disabled: true },
        primary: '<a class="hd-btn hd-btn--primary hd-btn--sm" href="#workflow-editor/node-selected">Open generated draft</a>',
        content: bubble(GEN_REQUEST) + toolRow('Saved the workflow draft', '0:11') + status('done', 'Draft saved · 6 nodes')
      });
    }
  });
  def(WE, {
    id: 'generate-failed', title: 'Generate failed', group: G4, base: EWA,
    description: 'The builder stopped while generating: the badge says Failed, the reason is shown and the composer is open.',
    guide: 'No draft was saved. The reason is fixture text from the engine.',
    build: function (h) {
      return generate(h, {
        badge: FAILED_BADGE, composer: { placeholder: 'Message the workflow builder' },
        content: bubble(GEN_REQUEST) + status('failed', 'Failed') + '<p class="hd-gap-reason">' + REASON + '</p>'
      });
    }
  });
})();
