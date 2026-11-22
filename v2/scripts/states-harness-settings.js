/* Harness registration, harness qualification and global MCP approval states of Settings → Harnesses that the approved
   pages do not draw: the runtime not ready, a registration that failed, no harnesses, a refused setup, the remove
   confirmation; qualification in each state the app has (mixed, not checked, cancelled and changed, unsupported runtime,
   discovery failed); and the MCP approvals panel (empty, add and remove confirmations, a refused change, Vibe, an
   unsupported harness, a failed read, a runtime without the command, and a human-only refusal). All are provisional.
   Each state is the approved settings/harnesses or settings/mcp-approvals template with only the blocks it changes
   replaced, by exact swap: the head, the harness list, the approvals panel and the qualification section are rebuilt from
   the same markup, and a rebuild with the approved fixture must equal the approved block or the module throws. The inline
   approvals panel of the approved page is kept (no sheet). Messages quoted from the Mac app or the engine, and the
   refusal form "<message> (<code>)", are named in each guide and in docs/decisions/harness-settings.md; design wording
   and fixture text are named there too. Templates are computed on first use. Display only: no engine calls. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.harnessSettingsStates = H.harnessSettingsStates || [];

  var NOTE = 'Provisional · not approved';
  var RECORD = '<a href="docs/decisions/harness-settings.md">Decision record</a>';
  var HARNESSES = 'settings/harnesses', APPROVALS = 'settings/mcp-approvals';
  var G_REG = 'Harness registration', G_QUAL = 'Harness qualification', G_MCP = 'MCP approvals';

  function swap(html, find, replace, base) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + base + ': ' + find.slice(0, 60));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + find.slice(0, 60));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close, base) {
    var from = html.indexOf(open), to = from < 0 ? -1 : html.indexOf(close, from + open.length);
    if (from < 0 || to < 0) throw new Error('Block not found in ' + base + ': ' + open.slice(0, 60));
    if (html.indexOf(open, from + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + open.slice(0, 60));
    return html.slice(from, to + close.length);
  }
  function lazy(route, make) {
    Object.defineProperty(T, route, {
      enumerable: true, configurable: true,
      get: function () {
        var value = make();
        Object.defineProperty(T, route, { enumerable: true, configurable: true, writable: true, value: value });
        return value;
      }
    });
  }
  function ensureGroup(name) {
    var family = H.findFamily('settings');
    if (family.groups.indexOf(name) >= 0) return;
    var at = family.groups.indexOf('Loading');
    family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
  }
  function icon(name, small) { return '<span class="hd-i' + (small ? ' hd-i--sm' : '') + ' hd-i-' + name + '" aria-hidden="true"></span>'; }
  function code(text) { return '<code>' + text + '</code>'; }

  // ---- Markup of the approved page, rebuilt ---------------------------------------------------------------------------
  var HR = '<hr style="border: 0; border-top: 1px solid var(--border); margin: 0;">';
  var CHECK = icon('check');
  function badge(kind, glyph, text) { return '<span class="hd-badge' + (kind ? ' hd-badge--' + kind : '') + '">' + icon(glyph) + text + '</span>'; }
  var B_INSTALLED = badge('done', 'check', 'Installed'), B_UPDATE = badge('warning', 'alert', 'Update available'), B_NOT_FOUND = badge('', 'x', 'Not found on PATH');
  function button(text, kind, extra) { return '<button type="button" class="hd-btn hd-btn--' + (kind || 'secondary') + '"' + (extra || '') + '>' + text + '</button>'; }
  function row(name, hint, badgeHtml, actions) {
    return HR + '<div class="hd-form-row" style="min-height: 44px;"><span class="hd-list-row__icon" style="flex: none;"><span class="hd-i hd-i-harness" aria-hidden="true"></span></span>' +
      '<div class="hd-form-row__label"><span style="font-weight: 500;">' + name + '</span>' + hint + '</div><span style="width: 150px; flex: none;">' + badgeHtml + '</span>' +
      '<span style="display: flex; gap: var(--space-2); justify-content: flex-end; width: 190px; flex: none;">' + actions + '</span></div>';
  }
  function hint(text) { return '<span class="hd-form-row__hint">' + (text || '') + '</span>'; }
  var REMOVE = button('Remove', 'ghost');
  var APPROVALS_BUTTON = button('MCP approvals');
  var APPROVALS_OPEN = '<button type="button" class="hd-btn hd-btn--secondary" aria-expanded="true" aria-controls="mcp-approvals">' + icon('chevron-down', true) + 'MCP approvals</button>';
  // The approved harness list: five rows between rules. `o.open` is the row whose approvals panel is open; the panel
  // follows that row (approved mcp-approvals page), and the harnesses page draws the plain button on Claude Code only.
  function list(o) {
    o = o || {};
    var rows = o.rows || [
      { name: 'Claude Code', badge: B_INSTALLED, actions: (o.open === 'Claude Code' ? APPROVALS_OPEN : APPROVALS_BUTTON) + REMOVE },
      { name: 'Codex', badge: B_UPDATE, actions: button('Update') },
      { name: 'Opencode', badge: B_INSTALLED, actions: REMOVE },
      { name: 'Mistral Vibe', badge: B_INSTALLED, actions: REMOVE },
      { name: 'Antigravity', hint: 'Install Antigravity, then refresh.', badge: B_NOT_FOUND, actions: '' }
    ];
    return '<div style="margin-top: var(--space-2);">' + rows.map(function (r) {
      return row(r.name, hint(r.hint), r.badge, r.actions) + (o.open === r.name ? o.panel : '');
    }).join('') + HR + '</div>';
  }
  var HEAD_CAPTION = '<div class="caption hd-faint code" style="font-family: var(--font-mono);">Server: ~/.harflow/bin/harflow-mcp</div>';
  var REFRESH = '<button type="button" class="hd-btn hd-btn--icon" aria-label="Refresh"><span class="hd-i hd-i-refresh" aria-hidden="true"></span></button>';
  var REFRESH_OFF = '<button type="button" class="hd-btn hd-btn--icon" aria-label="Refresh" disabled><span class="hd-i hd-i-refresh" aria-hidden="true"></span></button>';

  function listOf(html, base) {
    var from = html.indexOf('<div style="margin-top: var(--space-2);">' + HR);
    var to = html.indexOf('<section aria-label="Harness qualification"');
    if (from < 0 || to < 0) throw new Error('Harness list not found in ' + base);
    return html.slice(from, to);
  }
  function qualificationOf(html, base) { return between(html, '<section aria-label="Harness qualification"', '</section>', base); }

  // ---- Qualification section -------------------------------------------------------------------------------------------
  var SECTION_OPEN = '<section aria-label="Harness qualification" style="display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4);"><h2 class="label hd-faint" style="margin: 0; font-weight: 500;">Harness qualification</h2>';
  var GLYPH = {
    done: '<span class="hd-glyph hd-glyph--done" aria-hidden="true">' + icon('check', true) + '</span>',
    failed: '<span class="hd-glyph hd-glyph--failed" aria-hidden="true">' + icon('x', true) + '</span>',
    cancelled: '<span class="hd-glyph hd-glyph--cancelled" aria-hidden="true">' + icon('stop', true) + '</span>',
    attention: '<span class="hd-glyph hd-glyph--attention" aria-hidden="true">' + icon('alert', true) + '</span>',
    unavailable: '<span class="hd-glyph hd-glyph--cancelled" aria-hidden="true">' + icon('x', true) + '</span>'
  };
  // A card of the Mac qualification panel: identity, state title, message, feature rows, reason and one action.
  function card(c) {
    var features = (c.features || []).map(function (f) {
      return '<div class="hd-hs-feature"><code>' + f[0] + '</code><span>' + f[1] + '</span>' + (f[2] ? '<span class="hd-hs-reason">' + f[2] + '</span>' : '') + '</div>';
    }).join('');
    return '<div class="hd-hs-card"><div class="hd-form-row" style="min-height: 28px;"><span class="hd-hs-identity">' + c.identity + '</span>' +
      '<span class="hd-hs-state">' + c.glyph + c.title + '</span>' + (c.action ? button(c.action) : '') + '</div>' +
      '<p class="hd-hs-message">' + c.message + '</p>' + features + (c.note ? '<p class="hd-hs-message">' + c.note + '</p>' : '') + '</div>';
  }
  function noNative(name) {
    return '<div class="hd-form-row" style="min-height: 28px;"><span class="hd-hs-identity">' + name + '</span><span class="hd-hs-state hd-hs-state--plain">No native qualification for this harness</span></div>';
  }
  var ANTIGRAVITY_NOT_FOUND = '<div class="hd-form-row" style="min-height: 28px;"><span class="hd-hs-identity">Antigravity</span><span class="hd-hs-state hd-hs-state--plain">' + GLYPH.unavailable + 'Antigravity was not found on PATH. Install it, then refresh.</span></div>';
  function qualification(cards, tail) {
    return SECTION_OPEN + cards.join('') + (tail === false ? '' : noNative('Opencode') + ANTIGRAVITY_NOT_FOUND) + '</section>';
  }
  // Fixture versions and feature ids; the states, messages, actions and reasons are quoted in the record.
  var CLAUDE = 'Claude Code · 2.1.150', CODEX = 'Codex · 0.130.0', VIBE = 'Mistral Vibe · 2.4.1';
  var MSG_NOT_CHECKED = 'Check the required harness features before running.';
  var MSG_UNAVAILABLE = 'Required feature evidence is unavailable. Check this harness explicitly.';
  var CANCELLING = 'Cancelling stops waiting for this check. The engine may still finish it.';
  var FAIL_FEATURES = [
    ['live_input', 'Failed · failed', 'feature is not qualified on this platform'],
    ['approval_requests', 'Failed · failed', 'probe bundle did not establish this feature']
  ];

  // ---- Panels ---------------------------------------------------------------------------------------------------------
  var NOTE_LINE = 'Global tool approvals apply across projects and future tasks.';
  var HINT_DEFAULT = 'Use server/* to approve every tool on one server.';
  var HINT_VIBE = 'Vibe supports exact tool names only; server wildcards are unavailable.';
  var ENTRIES = ['harflow/*', 'github/create_pull_request', 'linear/get_issue'];
  function entry(e, off) {
    return '<div class="hd-form-row" style="min-height: 36px; padding-left: var(--space-3);"><code style="flex: 1; font-family: var(--font-mono); font-size: 12.5px;">' + e + '</code>' +
      '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" aria-label="Remove approval ' + e + '"' + (off ? ' disabled' : '') + '>Remove</button></div>';
  }
  function panel(o) {
    o = o || {};
    var entries = o.entries || ENTRIES;
    return '<div id="mcp-approvals" style="margin-left: 44px; padding: var(--space-2) 0 var(--space-3); display: flex; flex-direction: column; gap: var(--space-2);">' +
      '<p class="caption hd-faint" style="margin: 0;">' + NOTE_LINE + '</p>' +
      (o.path ? '<p class="caption hd-faint hd-hs-path">' + o.path + '</p>' : '') +
      (o.detail ? '<p class="hd-hs-detail">' + o.detail + '</p>' : '') +
      (o.error ? '<p class="hd-hs-error" role="alert">' + o.error + '</p>' : '') +
      (o.sentence ? '<p class="hd-hs-sentence" role="status">' + o.sentence + '</p>' : '') +
      (o.empty ? '<p class="hd-hs-empty">' + o.empty + '</p>' : '') +
      entries.map(function (e) { return entry(e, o.off); }).join('') +
      '<form style="display: flex; align-items: flex-start; gap: var(--space-2); padding-left: var(--space-3);"><div class="hd-field" style="flex: 1;"><label class="hd-sr" for="mcp-new">Tool approval</label>' +
      '<input id="mcp-new" class="hd-input" type="text" placeholder="server/tool"' + (o.value ? ' value="' + o.value + '"' : '') + (o.off ? ' disabled' : '') + '><span class="hd-field__hint">' + (o.hint || HINT_DEFAULT) + '</span></div>' +
      '<button type="submit" class="hd-btn hd-btn--secondary"' + (o.addOff || o.off ? ' disabled' : '') + '>Add approval</button>' +
      (o.refresh ? '<button type="button" class="hd-btn hd-btn--ghost">Refresh</button>' : '') + '</form></div>';
  }
  function panelOf(html, base) { return between(html, '<div id="mcp-approvals"', '</form></div>', base); }

  // ---- Dialog ---------------------------------------------------------------------------------------------------------
  function dialog(html, id, title, body, confirm, base) {
    html = swap(html, '<aside class="hd-sidebar"', '<aside inert class="hd-sidebar"', base);
    html = swap(html, '<main class="hd-main">', '<main class="hd-main" inert>', base);
    return swap(html, '</main>', '</main><div class="hd-m05-scrim"><div class="hd-dialog" role="dialog" aria-modal="true" aria-labelledby="' + id + '">' +
      '<h2 class="hd-dialog__title" id="' + id + '">' + title + '</h2><p class="hd-dialog__text">' + body + '</p>' +
      '<div class="hd-dialog__actions">' + button('Cancel', 'ghost') + button(confirm, 'secondary') + '</div></div></div>', base);
  }

  // ---- Definitions ----------------------------------------------------------------------------------------------------
  var DEFS = [];
  function def(o) { DEFS.push(o); }
  function mapList(html, base, inner) { return swap(html, listOf(html, base), inner, base); }
  function mapQualification(html, base, inner) { return swap(html, qualificationOf(html, base), inner, base); }
  var NOT_READY = '<p class="hd-hs-sentence" role="status">Finish runtime setup to register Harflow with your harnesses.</p><div><button type="button" class="hd-btn hd-btn--secondary">Open setup</button></div>';

  // Registration
  def({
    id: 'harnesses-runtime-not-ready', group: G_REG, base: HARNESSES,
    title: 'Harnesses · Runtime not ready',
    description: 'The runtime is not ready: the harness list gives way to a note with Open setup, Refresh is disabled and the qualification section is hidden.',
    build: function (html, base) {
      html = swap(html, REFRESH, REFRESH_OFF, base);
      html = mapList(html, base, '<div class="hd-hs-block">' + NOT_READY + '</div>');
      return swap(html, qualificationOf(html, base), '', base);
    },
    guide: 'The Harnesses page before the runtime is ready. The Mac app shows nothing in this case (the list stays blank); the note and Open setup are design wording, and the disabled Refresh is a design choice (the app disables it only while loading or while an action runs, HarnessesVM.swift:120).'
  });
  def({
    id: 'harnesses-registration-failed', group: G_REG, base: HARNESSES,
    title: 'Harnesses · Registration failed',
    description: 'An update of one harness did not finish: its row shows the error and a note, with a Retry button on the row.',
    build: function (html, base) {
      var rows = [
        { name: 'Claude Code', badge: B_INSTALLED, actions: APPROVALS_BUTTON + REMOVE },
        { name: 'Codex', hint: '<span class="hd-hs-error">Could not update the Codex configuration: permission denied (setup_error)</span><span class="hd-hs-note">Registered via ' + code('codex mcp add') + '.</span>', badge: B_UPDATE, actions: button('Retry') },
        { name: 'Opencode', badge: B_INSTALLED, actions: REMOVE },
        { name: 'Mistral Vibe', badge: B_INSTALLED, actions: REMOVE },
        { name: 'Antigravity', hint: 'Install Antigravity, then refresh.', badge: B_NOT_FOUND, actions: '' }
      ];
      return mapList(html, base, list({ rows: rows }));
    },
    guide: 'A failed install, update or removal. The app already draws the setup row\'s own <code>error</code> in red, its <code>notes</code> and a "last: &lt;action&gt;" chip on the row (HarnessRowView.swift:57-61). A tool failure of the action itself, or of the load, shows today as one red page line, <code>&lt;message&gt; (&lt;code&gt;)</code>, with no Retry (HarnessesVM.swift:294-323). The change drawn is to move that failure onto the row it acted on and add Retry (an app change). The error text is fixture text with the code <code>setup_error</code>; the note is fixture text in the form the app shows ("Registered via …").'
  });
  def({
    id: 'harnesses-empty', group: G_REG, base: HARNESSES,
    title: 'Harnesses · None found',
    description: 'No harness was found on this Mac: the list gives way to a note and Refresh stays.',
    build: function (html, base) {
      return mapList(html, base, '<div class="hd-hs-block"><p class="hd-hs-sentence" role="status">No harnesses found on this Mac.</p><p class="hd-hs-message">Install a supported harness, then refresh.</p></div>');
    },
    guide: 'An empty setup list. The Mac app draws a blank list; the sentence and its second line are design wording. The approved qualification section stays: it is read with <code>harflow-ctl backends</code>, which does not depend on the setup tool.'
  });
  def({
    id: 'harnesses-setup-refused', group: G_REG, base: HARNESSES,
    title: 'Harnesses · Setup refused',
    description: 'The setup tool of this runtime does not match the app: the page shows the refusal and Retry, without rows.',
    build: function (html, base) {
      html = swap(html, HEAD_CAPTION, '', base);
      return mapList(html, base, '<div class="hd-hs-block"><p class="hd-hs-error" role="alert">Incompatible Harflow runtime: unsupported harflow.setup format (incompatible_runtime)</p><div><button type="button" class="hd-btn hd-btn--secondary">Retry</button></div></div>');
    },
    guide: 'A setup answer in another format. The line is the app\'s refusal form <code>&lt;message&gt; (&lt;code&gt;)</code> with the app\'s message for an unsupported format (the format name is fixture text); the Mac shows it as one red line and no Retry. The approved qualification section stays (it does not depend on the setup tool). Retry is design wording, and the legacy "harflow is incomplete or out of date" banner is not drawn.'
  });
  def({
    id: 'harnesses-remove-confirm', group: G_REG, base: HARNESSES,
    title: 'Harnesses · Remove confirmation',
    description: 'The confirmation before removing Harflow from a harness, over the Harnesses page.',
    build: function (html, base) {
      return dialog(html, 'hs-remove-title', 'Remove harflow from Claude Code?', 'This runs harflow-setup, which edits Claude Code\'s own configuration.', 'Remove', base);
    },
    guide: 'The Mac confirmation (HarnessesVM.swift:187-190): the title and text are verbatim, the confirm button is Remove. Cancel is the standard alert button. Install and update use the same shape with "Install harflow into &lt;name&gt;?" or "Update harflow in &lt;name&gt;?" and the same text; only this one is drawn.'
  });

  // Qualification
  def({
    id: 'qualification-mixed', group: G_QUAL, base: HARNESSES,
    title: 'Qualification · Mixed results',
    description: 'Claude Code ready, Codex failed with its feature reasons, Vibe being checked; harnesses without native qualification say so and offer no check.',
    build: function (html, base) {
      return mapQualification(html, base, qualification([
        card({ identity: CLAUDE, glyph: GLYPH.done, title: 'Ready', message: 'Required features are ready.', action: 'Check again' }),
        card({ identity: CODEX, glyph: GLYPH.failed, title: 'Failed', message: MSG_UNAVAILABLE, features: FAIL_FEATURES, action: 'Retry qualification' }),
        card({ identity: VIBE, glyph: '', title: 'Qualifying', message: 'Checking required features…', features: [['live_input', 'Checking'], ['approval_requests', 'Checking']], action: 'Cancel check', note: CANCELLING })
      ]));
    },
    guide: 'The qualification cards of the three harnesses with native qualification (Claude Code, Codex and Vibe) in three states. States, actions, messages, the cancelling note and the feature result form "&lt;Result&gt; · &lt;source&gt;" are the Mac app\'s (HarnessQualificationModel, QualificationPresentation); the two reasons are engine text; versions and feature names are fixture text. Opencode and Antigravity carry no native qualification claim: "No native qualification for this harness" is design wording and offers no action; the Antigravity line is the approved text. This does not amend the approved <a href="#settings/harnesses">Harnesses</a> rows, which show Opencode Ready and "Codex needs sign-in".'
  });
  def({
    id: 'qualification-not-checked', group: G_QUAL, base: HARNESSES,
    title: 'Qualification · Not checked',
    description: 'No harness has been checked yet: each of the three offers Check harness.',
    build: function (html, base) {
      var c = function (id) { return card({ identity: id, glyph: '', title: 'Not checked', message: MSG_NOT_CHECKED, action: 'Check harness' }); };
      return mapQualification(html, base, qualification([c(CLAUDE), c(CODEX), c(VIBE)]));
    },
    guide: 'All three harnesses before any check. Title, message and action are the Mac app\'s; versions are fixture text. The others are as in <a href="#settings/qualification-mixed">Mixed results</a>.'
  });
  def({
    id: 'qualification-cancelled', group: G_QUAL, base: HARNESSES,
    title: 'Qualification · Cancelled and changed',
    description: 'A cancelled check, a harness whose binary changed and a feature that failed at runtime, each with its action.',
    build: function (html, base) {
      return mapQualification(html, base, qualification([
        card({ identity: CLAUDE, glyph: GLYPH.cancelled, title: 'Cancelled', message: 'Check cancelled. Late results will not enable launch.', action: 'Retry qualification' }),
        card({ identity: CODEX, glyph: GLYPH.attention, title: 'Binary changed', message: 'The request changed. Fresh qualification evidence is required.', action: 'Check harness' }),
        card({ identity: VIBE, glyph: GLYPH.failed, title: 'Failed at runtime', message: MSG_UNAVAILABLE, features: [['live_input', 'Failed · failed-at-runtime', 'feature failed at runtime']], action: 'Retry qualification' })
      ]));
    },
    guide: 'Three further states of the Mac qualification card. Titles, messages and actions are the Mac app\'s; the failed-at-runtime reason and the versions are fixture text.'
  });
  def({
    id: 'qualification-unsupported', group: G_QUAL, base: HARNESSES,
    title: 'Qualification · Unsupported runtime',
    description: 'The runtime has no harness qualification: each card says so and offers no action.',
    build: function (html, base) {
      var msg = 'Harness qualification is unavailable in the selected engine. A supporting managed runtime is required.';
      var c = function (id) { return card({ identity: id, glyph: GLYPH.attention, title: 'Unsupported engine', message: msg }); };
      return mapQualification(html, base, qualification([c(CLAUDE), c(CODEX), c(VIBE)]));
    },
    guide: 'A runtime that does not advertise <code>backend-qualification.v1</code>. The title and message are the Mac app\'s verbatim (they say "engine"); the cards offer no action. The one-sentence pattern of the engine and runtime record ("This Harflow runtime can\'t … Update Harflow to use it.") would replace this text if the owner approves it.'
  });
  def({
    id: 'qualification-discovery-failed', group: G_QUAL, base: HARNESSES,
    title: 'Qualification · Discovery failed',
    description: 'The list of harnesses to qualify could not be read: one failed card with the app\'s message and Retry qualification.',
    build: function (html, base) {
      return mapQualification(html, base, SECTION_OPEN + card({
        identity: 'Harness discovery', glyph: GLYPH.failed, title: 'Failed',
        message: code('harflow-ctl backends') + ' exited 0 without a JSON answer: Harness qualification discovery is unavailable. Refresh to retry.',
        action: 'Retry qualification'
      }) + '</section>');
    },
    guide: 'The discovery card of the Mac app (HarnessesVM.swift:74-76). The message is the unreadable-answer form of the tool error with the stderr text the repository passes (HarnessesViewRepository.swift:26); the card reloads the discovery when its button is pressed.'
  });

  // MCP approvals
  var CLAUDE_OPEN = { open: 'Claude Code' };
  function approvals(build) {
    return function (html, base) {
      var p = build(html, base);
      return swap(html, panelOf(html, base), p, base);
    };
  }
  def({
    id: 'mcp-approvals-empty', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · No approvals',
    description: 'The open approvals panel of a harness with no global approvals: a note under the heading and the field.',
    build: approvals(function () { return panel({ entries: [], empty: 'No global approvals yet.' }); }),
    guide: 'The approved inline panel with an empty list. The Mac app shows an empty list; "No global approvals yet." is design wording.'
  });
  def({
    id: 'mcp-approvals-add-confirm', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Add confirmation',
    description: 'The confirmation before approving a tool globally, over the approvals panel with the typed value.',
    build: function (html, base) {
      html = swap(html, panelOf(html, base), panel({ value: 'github/*' }), base);
      return dialog(html, 'hs-add-title', 'Allow github/* globally?', 'This lets Claude Code call this MCP tool across projects and future tasks. A tool name of * allows every tool on that server. Other harness policies still apply.', 'Allow globally', base);
    },
    guide: 'The Mac confirmation (MCPAllowlistVM.swift:76-79): title, text and the Allow globally button are verbatim for a harness that accepts wildcards. Cancel is the standard alert button. For Vibe the sentence about * becomes "This approves only the named tool.".'
  });
  def({
    id: 'mcp-approvals-remove-confirm', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Remove confirmation',
    description: 'The confirmation before removing a global approval, over the approvals panel.',
    build: function (html, base) {
      return dialog(html, 'hs-remove-approval-title', 'Remove global approval for linear/get_issue?', 'This removes the explicit approval from Claude Code\'s global configuration. Other permission rules remain unchanged.', 'Remove approval', base);
    },
    guide: 'The Mac confirmation (MCPAllowlistVM.swift:87-89), verbatim, with the Remove approval button. Cancel is the standard alert button.'
  });
  def({
    id: 'mcp-approvals-write-refused', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Change refused',
    description: 'The engine refused a change because the harness configuration changed: the refusal shows above the list, the entries stay and Refresh reloads.',
    build: approvals(function () {
      return panel({ error: 'Harness configuration changed; reload and try again (allowlist_error)', value: 'github/get_issue', refresh: true });
    }),
    guide: 'A write refused by the engine (<code>allowlist_error</code>, <code>mcp_allowlist.py:47</code>). The line is the app\'s refusal form <code>&lt;message&gt; (&lt;code&gt;)</code>; the typed value stays in the field and the list keeps its entries. Refresh is the Mac sheet\'s button; the approved panel does not draw it.'
  });
  def({
    id: 'mcp-approvals-vibe', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Vibe',
    description: 'The Vibe panel: exact tool names only, so a typed server wildcard keeps Add approval disabled and the help text says why.',
    build: function (html, base) {
      var rows = [
        { name: 'Claude Code', badge: B_INSTALLED, actions: APPROVALS_BUTTON + REMOVE },
        { name: 'Codex', badge: B_UPDATE, actions: button('Update') },
        { name: 'Opencode', badge: B_INSTALLED, actions: REMOVE },
        { name: 'Mistral Vibe', badge: B_INSTALLED, actions: APPROVALS_OPEN + REMOVE },
        { name: 'Antigravity', hint: 'Install Antigravity, then refresh.', badge: B_NOT_FOUND, actions: '' }
      ];
      var p = panel({
        entries: ['github/create_pull_request'], value: 'github/*', addOff: true, hint: HINT_VIBE, path: '~/.vibe/config.toml',
        detail: 'Vibe requires individual server/tool entries. Global rules apply to future sessions. Harness deny rules and project overrides still apply.'
      });
      var from = html.indexOf('<div style="margin-top: var(--space-2);">'), to = html.indexOf('<section aria-label="Harness qualification"');
      return html.slice(0, from) + list({ rows: rows, open: 'Mistral Vibe', panel: p }) + html.slice(to);
    },
    guide: 'The panel of a harness that accepts exact tool names only. The help text, the disabled Add approval for a typed wildcard (MCPAllowlistVM.swift:61-63, :66-69) and the detail line (engine, <code>mcp_approval.py:182</code>) are the app\'s; the config path is fixture text. Because the app blocks the wildcard before it reaches the engine, the engine\'s own refusal ("Vibe requires individual tool names; add server/tool entries (allowlist_error)") is recorded, not drawn. The Mac draws the MCP approvals button on every row (HarnessRowView.swift:66); the approved page draws it on Claude Code only, so the Mistral Vibe row carries it here.'
  });
  def({
    id: 'mcp-approvals-unsupported', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Unsupported harness',
    description: 'A harness whose approvals Harflow does not edit: the engine\'s reason is shown, the field and Add approval are disabled.',
    build: function (html, base) {
      var rows = [
        { name: 'Claude Code', badge: B_INSTALLED, actions: APPROVALS_BUTTON + REMOVE },
        { name: 'Codex', badge: B_UPDATE, actions: button('Update') },
        { name: 'Opencode', badge: B_INSTALLED, actions: REMOVE },
        { name: 'Mistral Vibe', badge: B_INSTALLED, actions: REMOVE },
        { name: 'Cursor', badge: B_INSTALLED, actions: APPROVALS_OPEN + REMOVE },
        { name: 'Antigravity', hint: 'Install Antigravity, then refresh.', badge: B_NOT_FOUND, actions: '' }
      ];
      var p = panel({ entries: [], off: true, path: '~/.cursor/mcp.json', detail: 'Cursor MCP approvals are per project directory and are not edited by Harflow.' });
      var from = html.indexOf('<div style="margin-top: var(--space-2);">'), to = html.indexOf('<section aria-label="Harness qualification"');
      return html.slice(0, from) + list({ rows: rows, open: 'Cursor', panel: p }) + html.slice(to);
    },
    guide: 'The panel when the engine answers <code>supported: false</code> (<code>mcp_approval.py:270</code>). The detail line is the engine\'s sentence for Cursor, shown as the Mac sheet shows it; the field, Add approval and Remove are disabled, as the app disables them. The Cursor row and its config path are fixture text (the approved page lists no Cursor row); the Mac draws the MCP approvals button on every row (HarnessRowView.swift:66).'
  });
  def({
    id: 'mcp-approvals-read-failed', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Read failed',
    description: 'The approvals could not be read: the failed command shows above an empty list, the field is disabled and Refresh tries again.',
    build: approvals(function () {
      return panel({ entries: [], off: true, refresh: true, error: code('harflow-ctl mcp-allowlist') + ' exited 1 without a JSON answer.' });
    }),
    guide: 'A read that failed. The line is the app\'s message for an unreadable answer (fixture command and exit code). The Mac sheet keeps the field disabled until a read succeeds. Refresh is the sheet\'s button; the approved panel does not draw it.'
  });
  def({
    id: 'mcp-approvals-capability-missing', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Runtime missing a feature',
    description: 'This runtime cannot edit global approvals: the panel says so in one sentence and the field is disabled.',
    build: approvals(function () {
      return panel({ entries: [], off: true, sentence: 'This Harflow runtime can\'t edit global MCP approvals. Update Harflow to use it.' });
    }),
    guide: 'The inline form of a missing feature, defined once in the <a href="docs/decisions/engine-and-runtime.md">engine and runtime record</a>: a plain sentence, no destructive action. It depends on that pattern being approved. The sentence is design wording; the app shows today "The installed <code>harflow-ctl</code> has no <code>mcp-allowlist</code> command — it predates this app. Use a compatible managed Harflow runtime." The engine advertises no allowlist feature yet (engine need <code>mcp-allowlist.v1</code>).'
  });
  def({
    id: 'mcp-approvals-human-only', group: G_MCP, base: APPROVALS,
    title: 'MCP approvals · Human only',
    description: 'The engine refused a change because an agent, not a person, called it: the refusal shows above the list and the entries stay.',
    build: approvals(function () {
      return panel({ error: 'Only a verified human may change global MCP approval rules: it was called from task 4f2a91c0 (detected by lineage) (human_only)', value: 'github/get_issue', refresh: true });
    }),
    guide: 'The engine\'s <code>human_only</code> refusal for a change (<code>ctl.py:2316</code>), in the app\'s form <code>&lt;message&gt; (&lt;code&gt;)</code>. The reason after the colon is the engine\'s sentence for a confirmed agent caller; the task id and detection method are fixture text. Reading stays allowed.'
  });

  // ---- Registration -------------------------------------------------------------------------------------------------------
  [G_REG, G_QUAL, G_MCP].forEach(ensureGroup);
  // The default rebuild must equal the approved blocks, or a changed base would silently draw another page.
  var checked = false;
  function checkBases() {
    if (checked) return;
    var h = T[HARNESSES], a = T[APPROVALS];
    if (listOf(h, HARNESSES) !== list({ rows: [
      { name: 'Claude Code', badge: B_INSTALLED, actions: APPROVALS_BUTTON + REMOVE }, { name: 'Codex', badge: B_UPDATE, actions: button('Update') },
      { name: 'Opencode', badge: B_INSTALLED, actions: REMOVE }, { name: 'Mistral Vibe', badge: B_INSTALLED, actions: REMOVE },
      { name: 'Antigravity', hint: 'Install Antigravity, then refresh.', badge: B_NOT_FOUND, actions: '' }] })) throw new Error('The harness list no longer matches settings/harnesses');
    var approved = a.slice(a.indexOf('<div style="margin-top: var(--space-2);">'), a.indexOf('<section aria-label="Harness qualification"'));
    if (approved !== list({ open: 'Claude Code', panel: panel() })) throw new Error('The approvals list no longer matches settings/mcp-approvals');
    checked = true;
  }
  DEFS.forEach(function (d) {
    var route = 'settings/' + d.id;
    lazy(route, function () {
      checkBases();
      var html = T[d.base];
      if (typeof html !== 'string') throw new Error('No template ' + d.base);
      return d.build(html, d.base);
    });
    docs[route] = '<p><strong>Provisional, not approved.</strong> ' + d.guide + ' Derived from <a href="#' + d.base + '">' + (d.base === HARNESSES ? 'Harnesses' : 'MCP approvals') + '</a>. ' + RECORD + '.</p>';
    H.harnessSettingsStates.push(route);
    H.registerState('settings', { id: d.id, title: d.title, description: d.description, group: d.group, status: 'provisional', approvalNote: NOTE });
  });
})();
