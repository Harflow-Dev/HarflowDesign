/* Engine and runtime states the approved screens do not draw: the runtime and the task store gates of the main window,
   the app when a call to the runtime fails or times out, a runtime update that did not finish, a task link that arrives
   before setup, and the runtime and task store rows of Settings → General. All of them are approved by the owner (2026-11-23).
   Each state is an approved template with only the blocks it changes replaced, by exact swap, so a changed base throws
   instead of silently drawing another screen: the gates keep the frame, sidebar header and footer of the populated window
   (the template new-task/default, which the approved centered window is drawn from) and replace the main pane and the
   sidebar body, the refresh failures are the approved needs-you/waiting screen, and the Settings states are settings/general. The five app states and the two runtime states also have a 1000 × 620 twin, rendered here
   (self-rendered, the same form as the run question states) with the minimum window sidebar treatment. Templates are
   computed on first use. Titles and messages quoted from the Mac app or the engine are named as such in each guide;
   the rest is design wording. Decision record: docs/decisions/engine-and-runtime.md. Display only: no engine calls. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.engineRuntimeStates = H.engineRuntimeStates || [];
  H.engineRuntimeSidebarStates = H.engineRuntimeSidebarStates || [];

  var APPROVAL = { by: 'the owner', date: '2026-11-23', decision: 'Engine and runtime states' };
  var POPULATED = 'new-task/default';
  var WORKING = 'needs-you/waiting';
  var GENERAL = 'settings/general';
  var RECORD = '<a href="docs/decisions/engine-and-runtime.md">Decision record</a>';

  function swap(html, find, replace, base) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + base + ': ' + find.slice(0, 60));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + find.slice(0, 60));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close, base) {
    var from = html.indexOf(open), to = from < 0 ? -1 : html.indexOf(close, from);
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
  function ensureGroup(familyId, name) {
    var family = H.findFamily(familyId);
    if (!family.groups || family.groups.indexOf(name) >= 0) return;
    var at = family.groups.indexOf('Loading');
    family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
  }
  function code(text) { return '<code>' + text + '</code>'; }
  function icon(name) { return '<span class="hd-i hd-i--sm hd-i-' + name + '" aria-hidden="true"></span>'; }

  // ---- Fixture text -------------------------------------------------------------------------------------------------
  var INSTALLED = '0.0.7', REQUIRED = '0.0.8';
  var PACKAGE_FAILURE = 'Package verification failed. No replacement was activated.';
  var STATE_ROOT = '/Users/me/Library/Application Support/Harflow/State';
  var BACKUP_PATH = STATE_ROOT + '.harflow-backup-3f9c1e';
  var SIDEBAR_GATE = 'Runtime setup required before creating or loading work.';

  // ---- Main window pieces ---------------------------------------------------------------------------------------------
  // The sidebar of a window that cannot load work yet: the navigation and the lists give way to one line, as the app does.
  function gateSidebar(html, base) {
    var body = between(html, '<nav class="hd-nav" aria-label="Main">', '</section>\n    <div class="hd-sidebar__foot">', base);
    body = body.slice(0, body.length - '<div class="hd-sidebar__foot">'.length).replace(/\s+$/, '');
    return swap(html, body, '<div class="hd-m04-sidebar-gate">' + SIDEBAR_GATE + '</div>', base);
  }
  function mainOf(html, base) { return between(html, '<main class="hd-main">', '</main>', base); }
  function button(text, kind) { return '<button type="button" class="hd-btn hd-btn--' + (kind || 'secondary') + ' hd-btn--sm">' + text + '</button>'; }
  // The gate of the main pane: the same box as the approved runtime gates (title, body, one status line, actions).
  function gate(o) {
    var rows = (o.rows || []).map(function (r) {
      return '<div class="hd-ev-detail"><span class="caption hd-faint">' + r[0] + '</span><span class="hd-ev-mono">' + r[1] + '</span></div>';
    }).join('');
    return '<main class="hd-main">\n    <div class="hd-topbar"><span class="caption hd-faint">Harflow · Runtime setup</span><span class="hd-topbar__spacer"></span></div>\n' +
      '    <div class="hd-m04-gate hd-ev-gate"><h1 class="display">' + o.title + '</h1><p>' + o.body + '</p>' +
      (o.rows ? '<div class="hd-ev-details">' + rows + '</div>' : '') +
      '<div role="status">' + (o.status || '') + '</div><div class="hd-m04-actions">' + (o.actions || '') + '</div></div>\n  </main>';
  }
  function withGate(o) {
    return function (html, base) { return swap(gateSidebar(html, base), mainOf(html, base), gate(o), base); };
  }

  // ---- Definitions ----------------------------------------------------------------------------------------------------
  H.engineRuntimeGate = function (o) { return gate(o); };
  var DEFS = [];
  function def(o) { DEFS.push(o); }

  def({
    family: 'harness-runtime', id: 'update-failed', twin: true,
    title: 'Runtime · Update failed',
    description: 'A runtime update did not finish. The installed runtime was kept and stays usable: the sidebar keeps its lists, and the main pane gives the failure and Retry setup.',
    build: function (html, base) { return swap(html, mainOf(html, base), gate({ title: 'Update could not finish', body: 'The installed runtime was kept. Review the failure and retry when ready.', status: PACKAGE_FAILURE, actions: button('Retry setup') }), base); },
    guide: 'The gate of an installed app whose runtime update failed. The title, body, status line shape and the Retry setup action are the Mac app\'s (RuntimeSetupWelcomeView, RuntimeSetupState); the failure message is fixture text. The installed runtime was kept, so the app stays usable: the sidebar is the populated one of <a href="#harness-runtime/updating">Runtime · Updating</a> and <a href="#new-task/centered-empty">the approved centered window</a>, with its navigation and lists. Today the app refuses every runtime call while an update is failed and shows the setup line; keeping the tools usable is an app change (owner answer 1).'
  });
  def({
    family: 'harness-runtime', id: 'deep-link-held', twin: true, gateLine: true,
    title: 'Runtime · Task link held',
    description: 'A link to a task arrived before the runtime is ready: the install gate says Harflow opens that task after setup.',
    build: withGate({ title: 'Set up Harflow', body: 'The required runtime is not installed.', status: 'After setup, Harflow opens the task you linked to.', actions: button('Install runtime') }),
    guide: 'The first-run install gate of <a href="#harness-runtime/install-required">Runtime · Installation required</a> with one extra status line, design wording, for a <code>harflow://task/&lt;id&gt;</code> link opened while the runtime gate shows. The app keeps the selection and the gate covers it. Only task links are handled; an unknown or invalid id stays ignored.'
  });
  def({
    family: 'app-states', id: 'contract-refused', twin: true, gateLine: true,
    title: 'Runtime does not match the app',
    description: 'The runtime answers with a contract version this app does not understand: the gate names the tool and both versions and offers Retry.',
    build: withGate({
      title: 'This Harflow runtime doesn\'t match the app',
      body: 'Update the Harflow app to a version that matches this runtime.',
      status: code('harflow-ctl') + ' answered with contract version 2; this app understands version 1. Update the app or harflow so they match.',
      actions: button('Retry')
    }),
    guide: 'A runtime that answers with another contract version. The title and body are design wording. The status line is the app\'s refusal message with the tool name corrected to <code>harflow-ctl</code> (the app prints the contract name today); the versions are fixture text. The only action is Retry: the runtime is pinned to the app version, so the fix is updating the app. The frame, sidebar header and footer are those of <a href="#new-task/centered-empty">the approved centered window</a>; its sidebar body gives way to the setup line and its main pane to the gate.'
  });
  def({
    family: 'app-states', id: 'capability-missing', twin: true, gateLine: true,
    title: 'Runtime missing a feature',
    description: 'The runtime lacks a feature the app requires: the gate quotes the refusal and offers Retry.',
    build: withGate({
      title: 'This Harflow runtime is missing a feature the app needs',
      body: 'Update the Harflow app to get a runtime that has it.',
      status: 'Incompatible Harflow runtime: missing required events.v1 contract/capability',
      rows: [['Code', 'incompatible_runtime']],
      actions: button('Retry')
    }),
    guide: 'A runtime that does not advertise a feature the app requires. The title and body are design wording; the status line is the app\'s refusal text without its code, with the missing feature as fixture text; the code sits on a detail line (owner answer 6, an app change: the app prints "&lt;message&gt; (&lt;code&gt;)" today). A feature that only one screen needs is drawn on that screen, not as a gate: the plain sentence "This Harflow runtime can\'t …. Update Harflow to use it." with no destructive action (see the decision record).'
  });
  // The engine call failures keep the working window: the last known work stays, the title bar dot turns red and its help
  // text names the failed command.
  function callFailure(message) {
    return function (html, base) {
      html = swap(html, '<div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>',
        '<div class="hd-topbar"><span class="hd-topbar__spacer"></span><span class="hd-ev-conn"><span class="hd-ev-dot" role="img" aria-label="Harflow runtime error"></span>' +
        '<span class="hd-tooltip hd-ev-tip" role="tooltip">' + message + '</span></span></div>', base);
      return swap(html, '    <section class="hd-section" aria-label="Running">',
        '    <div class="hd-ev-note" role="status"><span>Couldn\'t refresh your work</span>' + button('Retry', 'ghost') + '</div>\n    <section class="hd-section" aria-label="Running">', base);
    };
  }
  def({
    family: 'app-states', id: 'engine-call-failed', twin: true, base: WORKING,
    title: 'Work could not be refreshed',
    description: 'A call to the runtime failed in a working app: the title bar dot is red with its help text, a note above the lists offers Retry and the last known rows stay.',
    build: callFailure(code('harflow-ctl task-list-page') + ' exited 1 without a JSON answer.'),
    guide: 'A failed call while the app already shows work. The help text of the dot is the app\'s message for an unreadable answer (fixture command and exit code); the note above the lists and its Retry are design wording. The lists keep the last known rows. Derived from <a href="#needs-you/waiting">Needs you</a>, an approved screen with the populated sidebar.'
  });
  def({
    family: 'app-states', id: 'engine-call-timed-out', twin: true, base: WORKING,
    title: 'Work refresh timed out',
    description: 'A call to the runtime did not answer in time: the same working window with the timeout message in the dot\'s help text.',
    build: callFailure(code('harflow-ctl task-list-page') + ' did not answer within 30 s.'),
    guide: 'As <a href="#app-states/engine-call-failed">Work could not be refreshed</a>, for a call that passed its deadline. The message is the app\'s timeout message (the deadline of a listing call is 30 seconds).'
  });
  function storeLink(html, base) {
    return swap(html, '<nav class="hd-nav" aria-label="Main">\n',
      '<nav class="hd-nav" aria-label="Main">\n      <a class="hd-nav-item hd-ev-attention" href="#settings/general" title="Open Settings → General to inspect the store and review recovery">' + icon('alert') + '<span class="hd-nav-item__label">Task store needs attention</span></a>\n', base);
  }
  def({
    family: 'app-states', id: 'store-unusable', twin: true,
    title: 'Task store needs attention',
    description: 'The task store cannot be used: the sidebar carries the link, and the main pane shows the engine message with the State root and Reason; the one action opens Settings.',
    build: function (html, base) {
      html = storeLink(html, base);
      return swap(html, mainOf(html, base), gate({
        title: 'Task store needs attention',
        body: 'Unsupported state root: foreign store marker; inspect state or select a fresh state root',
        rows: [['State root', STATE_ROOT], ['Reason', 'foreign_store']],
        actions: button('Open Settings')
      }), base);
    },
    guide: 'A task store the runtime cannot use. Only the sidebar link is the app\'s: the app shows no gate in the main pane, so <strong>the main pane gate is design</strong> (owner question in the record). The link\'s help text is the title attribute. The title is the app\'s title for an incompatible store; the message and the reason <code>foreign_store</code> are the engine\'s; the State root path is fixture text. With an incompatible store the work listing likely fails too, so the populated rows of the sidebar are an assumption. No recovery action is drawn: backup, reset and resume stay hidden until the engine\'s recovery is released. Open Settings is design wording.'
  });

  // ---- Settings → General rows ------------------------------------------------------------------------------------------
  var SECTION_STYLE = 'display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-6);';
  function section(name, inner) {
    return '<section aria-label="' + name + '" style="' + SECTION_STYLE + '"><h2 class="label hd-faint" style="margin: 0; font-weight: 500;">' + name + '</h2>' + inner + '</section>';
  }
  var G = {
    busy: '<span class="hd-glyph hd-glyph--running" aria-label="In progress"></span>',
    done: '<span class="hd-glyph hd-glyph--done" aria-hidden="true">' + icon('check') + '</span>',
    failed: '<span class="hd-glyph hd-glyph--failed" aria-hidden="true">' + icon('x') + '</span>',
    attention: '<span class="hd-ev-warn" aria-hidden="true">' + icon('alert') + '</span>'
  };
  function formRow(glyph, title, detail, action, disabled) {
    return '<div class="hd-form-row' + (disabled ? ' hd-ev-disabled' : '') + '" style="min-height: 40px;"' + (disabled ? ' aria-disabled="true"' : '') + '><div class="hd-form-row__label"><span style="display: inline-flex; align-items: center; gap: var(--space-2);">' +
      (glyph || '') + title + '</span>' + (detail ? '<span class="hd-form-row__hint">' + detail + '</span>' : '') + '</div>' + (action || '') + '</div>';
  }
  function rowButton(text, disabled) { return '<button type="button" class="hd-btn hd-btn--secondary"' + (disabled ? ' disabled' : '') + '>' + text + '</button>'; }
  function swapRuntime(html, base, inner) {
    return swap(html, between(html, '<section aria-label="Harflow runtime"', '</section>', base), section('Harflow runtime', inner), base);
  }
  function swapStore(html, base, inner) {
    return swap(html, between(html, '<section aria-label="Task store"', '</section>', base), section('Task store', inner), base);
  }
  var STORE_WAITING = formRow('', 'Task store', '', rowButton('Inspect task store', true), true) +
    '<p class="hd-ev-msg hd-ev-disabled">Inspect the task store to check compatibility. Inspection does not reset history.</p>';

  var RUNTIME = [
    ['checking', 'Runtime checking', 'The runtime row while Harflow checks the managed installation; the task store row waits.', G.busy, 'Checking Harflow runtime…', 'Checking the managed installation on this Mac.', ''],
    ['install-required', 'Runtime install required', 'The runtime is not installed: the row offers to install the required components.', '', 'Prepare Harflow', 'Install the components Harflow needs to run. Required runtime: ' + REQUIRED + '.', 'Install required components'],
    ['update-required', 'Runtime update required', 'The installed runtime is older than the app requires: the row names both versions and offers the update.', '', 'Update Harflow runtime', 'Installed runtime ' + INSTALLED + '. This app requires runtime ' + REQUIRED + '.', 'Update required components'],
    ['installing', 'Runtime installing', 'The required components are being installed; the row shows progress and no action.', G.busy, 'Preparing Harflow…', 'Installing required components for this app.', ''],
    ['updating', 'Runtime updating', 'The runtime is being updated; the row says the task history is preserved.', G.busy, 'Updating Harflow…', 'Installing the update from runtime ' + INSTALLED + ' to ' + REQUIRED + '. Your task history is preserved during the update.', ''],
    ['update-failed', 'Runtime update failed', 'The update did not finish and the installed runtime was kept; the row offers Retry update.', G.failed, 'Update did not finish', 'Installed runtime ' + INSTALLED + '; required runtime ' + REQUIRED + '. Your history and existing installation have been kept. ' + PACKAGE_FAILURE, 'Retry update'],
    ['failed', 'Runtime setup failed', 'Setup did not finish; the row gives the failure and offers Retry installation.', G.failed, 'Setup did not finish', PACKAGE_FAILURE, 'Retry installation']
  ];
  RUNTIME.forEach(function (r) {
    def({
      family: 'settings', id: 'runtime-' + r[0], group: 'Harflow runtime', plain: true,
      title: r[1], description: r[2],
      build: function (html, base) {
        html = swapRuntime(html, base, formRow(r[3], r[4], r[5], r[6] ? rowButton(r[6]) : ''));
        return swapStore(html, base, STORE_WAITING);
      },
      guide: 'The Harflow runtime row of <a href="#settings/general">General</a> when the state is "' + r[1].toLowerCase() + '". Title, detail and action are the Mac app\'s copy with "runtime" where the app says "engine"; the versions and the failure message are fixture text. The task store row is disabled until the runtime is ready. Nothing else on the page changes. There is no Check for updates button.'
    });
  });

  var INTERRUPTED_NOTE = 'Inspect again before retrying. Any reported backup evidence is retained; the operation may have partially completed.';
  function storeRows(title, glyph, message, rows, inspect, note) {
    var head = formRow(glyph, title, '', inspect === false ? '' : rowButton('Inspect task store'));
    var details = rows.map(function (r) {
      return '<div class="hd-ev-detail"><span class="caption hd-faint">' + r[0] + '</span><span class="hd-ev-mono">' + r[1] + '</span></div>';
    }).join('');
    return head + '<p class="hd-ev-msg">' + message + '</p>' + (rows.length ? '<div class="hd-ev-details">' + details + '</div>' : '') + (note ? '<p class="hd-ev-msg">' + note + '</p>' : '');
  }
  var STORE = [
    ['inspecting', 'Task store inspecting', 'The task store is being inspected: a progress mark, no action.', storeRows('Inspecting task store…', G.busy, 'Inspect the task store to check compatibility. Inspection does not reset history.', [], false)],
    ['missing', 'Task store not created', 'The store has not been created yet; the row shows the engine message and the State root.', storeRows('Task store has not been created', G.attention, 'State root has not been initialized', [['State root', STATE_ROOT], ['Reason', 'missing_root']])],
    ['incompatible', 'Task store incompatible', 'The store holds data Harflow cannot use; the row shows the engine message, the State root and the Reason.', storeRows('Task store needs attention', G.attention, 'Unmarked state root contains data', [['State root', STATE_ROOT], ['Reason', 'unmarked_nonempty']])],
    ['interrupted', 'Task store recovery interrupted', 'An earlier recovery did not finish; the row shows the backup path, the phase and the operation, with no resume action.', storeRows('Recovery was interrupted', G.attention, 'Explicit recovery must be resumed', [['State root', STATE_ROOT], ['Reason', 'recovery_interrupted'], ['Backup path', BACKUP_PATH], ['Recovery operation', '3f9c1e07-5b2a-4d18-9a6e-1c0f2d7b8e45'], ['Phase', 'copying']], true, INTERRUPTED_NOTE)],
    ['inspect-failed', 'Task store inspection failed', 'The inspection itself failed; the row shows the failed command and keeps Inspect task store.', storeRows('Task store needs attention', G.attention, code('harflow-ctl state-inspect') + ' exited 1 without a JSON answer.', [])]
  ];
  STORE.forEach(function (s) {
    def({
      family: 'settings', id: 'store-' + s[0], group: 'Task store', plain: true,
      title: s[1], description: s[2],
      build: function (html, base) { return swapStore(html, base, s[3]); },
      guide: 'The Task store row of <a href="#settings/general">General</a> after an inspection. Titles, detail labels and the order of the rows are the Mac app\'s (StoreRecoveryPresentation); the message is the engine\'s sentence for this status; paths, ids and the phase are fixture text. The note under the rows is the app\'s (it shows when a phase is reported and no recovery request is offered, which is always the case while recovery actions are hidden). The row is a display of the status only: backup, reset, resume and Show backup in Finder are not drawn.'
    });
  });

  // ---- Registration -------------------------------------------------------------------------------------------------------
  function resize(html, base) { return swap(html, 'width: 100%; height: 800px;', 'width: 1000px; height: 620px;', base); }
  ['Harflow runtime', 'Task store'].forEach(function (g) { ensureGroup('settings', g); });
  DEFS.forEach(function (d) {
    var route = d.family + '/' + d.id, base = d.plain ? GENERAL : (d.base || POPULATED);
    function make() {
      var html = T[base];
      if (typeof html !== 'string') throw new Error('No template ' + base);
      return d.build(html, base);
    }
    lazy(route, make);
    docs[route] = '<p><strong>Approved by the owner · 2026-11-23.</strong> ' + d.guide + ' ' + RECORD + '.</p>';
    H.engineRuntimeStates.push(route);
    var state = { id: d.id, title: d.title, description: d.description, status: 'approved', approval: APPROVAL };
    if (d.group) state.group = d.group;
    H.registerState(d.family, state);
    if (!d.twin) return;
    var minRoute = route + '-minimum';
    lazy(minRoute, function () { return resize(make(), base); });
    docs[minRoute] = '<p><strong>Approved by the owner · 2026-11-23.</strong> The same state in the minimum window (1000 × 620), with the sidebar scrolling between its fixed header and footer. ' + RECORD + '.</p>';
    H.engineRuntimeStates.push(minRoute);
    if (d.gateLine) H.engineRuntimeSidebarStates.push(route, minRoute);
    H.registerState(d.family, {
      id: d.id + '-minimum', title: d.title + ' · 1000 × 620', description: d.description + ' Drawn in the minimum window.',
      status: 'approved', approval: APPROVAL, specimenSize: '1000 × 620',
      source: { renderer: 'engineRuntime', mount: d.id + '-minimum' }
    });
  });

  H.RENDERERS.engineRuntime = { api: 'engineRuntime', wrapper: 'hdc-specimen' };
  // The twin is a template; the mount adds the minimum window sidebar treatment to the rendered frame and removes it again.
  H.engineRuntime = {
    mount: function (root) {
      root.classList.add('hdc-specimen--minimum');
      H.applyMinimum(root, ['sidebar']);
      return function () {
        H.clearMinimum(root);
        root.classList.remove('hdc-specimen--minimum', 'hdc-min-sidebar');
      };
    }
  };
})();
