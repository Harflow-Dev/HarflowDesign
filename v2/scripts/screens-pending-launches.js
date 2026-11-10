/* Owner-approved pending-launch discovery (2026-11-10, design 83d820f). Deterministic display-only fixtures; no engine calls. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  var docs = H.componentDocs = H.componentDocs || {};
  var ID = '20261110-093000-a17c92';
  var rows = [
    ['inventory', 'Pending launches', 'Select a launch to check its status.'],
    ['loading', 'Checking pending launches', 'Checking this engine for pending launches…'],
    ['empty', 'No pending launches observed', 'No pending launches were found in this completed check. New launches may appear after this check.'],
    ['failed', 'Pending launches unavailable', 'The engine could not be read. Pending launches may still exist.'],
    ['incomplete', 'More launches may exist', 'This check could not cover every launch. More launches may exist.'],
    ['waiting', 'Waiting for resources', 'Waiting for Claude slots and Shared checkout. Harflow has not confirmed a running task yet.'],
    ['preparing', 'Preparing', 'Harflow is preparing this launch. A running task has not been confirmed yet.'],
    ['preparing-handshake', 'Preparing · Stop unavailable', 'This engine cannot stop this preparation yet. Stop becomes available after Harflow confirms the task has started.'],
    ['granted', 'Launch granted', 'The engine granted this launch. Harflow has not confirmed a running task yet.'],
    ['not-started', 'Did not start', 'The engine recorded that this launch did not start. Reason: resource wait was cancelled.'],
    ['unavailable', 'Launch status unavailable', 'Harflow could not check this launch. Its outcome is unknown.'],
    ['missing', 'Launch not found', 'This ID was not found in the latest check. It may have started or changed elsewhere. Its outcome is unknown.'],
    ['recorded', 'Task record found', 'Harflow found a task with this ID. Check its status to open it.'],
    ['handoff-failed', 'Task status unavailable', 'Harflow found a task, but could not check its status. Task controls remain unavailable.'],
    ['stop-confirm', 'Stop this launch?', 'This asks the engine to stop the full launch ID below. If it starts before the request arrives, the task with this same ID may be stopped.'],
    ['stop-requested', 'Stop requested', 'The request was accepted. This does not confirm that the launch or task stopped. Check its status again.'],
    ['stop-uncertain', 'Stop outcome unknown', 'The Stop response could not be confirmed. The launch or task may still be active. Check its state before taking another action.'],
    ['stop-refused', 'Stop refused', 'The workflow controls this launch, so the engine refused Stop. The launch or task may still be active.'],
    ['stop-requested-minimum', 'Stop requested · 1000 × 620', 'The request was accepted. This does not confirm that the launch or task stopped. Check its status again.'],
    ['stop-confirm-minimum', 'Stop this launch? · 1000 × 620', 'Stop confirmation at the minimum window.'],
    ['waiting-minimum', 'Waiting for resources · 1000 × 620', 'Waiting for Claude slots and Shared checkout. Harflow has not confirmed a running task yet.']
  ];
  function link(id, text, cls) { return '<a class="' + (cls || 'hd-btn') + '" href="#task/pending-' + id + '">' + text + '</a>'; }
  function card(title, text) { return '<section class="hd-pending-card"><h2>' + title + '</h2><p>' + text + '</p></section>'; }
  var inventory = ['inventory', 'loading', 'empty', 'failed', 'incomplete'];
  var qualified = ['waiting', 'preparing', 'preparing-handshake', 'granted', 'not-started', 'waiting-minimum', 'stop-confirm', 'stop-requested', 'stop-uncertain', 'stop-refused'];
  // Reuse the approved M04/redrawn shell; only pending selection is additive.
  // Base 57f54ab: screens-new-task.js + m04-proposal.js:149–165 (owner scroll correction).
  function sidebarHtml(id, collapsed) {
    var key = collapsed ? 'new-task/sidebar-collapsed' : 'new-task/default';
    var base = T[key].match(/<aside class="hd-(?:sidebar|rail)"[\s\S]*?<\/aside>/)[0];
    // New task is not selected while a launch is selected; no task row is fabricated.
    base = base.replace('hd-nav-item is-active', 'hd-nav-item').replace('hd-rail-item is-active', 'hd-rail-item');
    if (collapsed) {
      var railEntry = '<a class="hd-rail-item is-active" href="#task/pending-inventory" aria-label="Pending launches" title="Pending launches" aria-current="page" data-pending-nav><span class="hd-i hd-i-clock" aria-hidden="true"></span></a>';
      return base.replace('<span class="hd-rail__spacer">', railEntry + '<span class="hd-rail__spacer">').replace('aria-label="2 running">2</span>', 'aria-label="1 running">1</span>');
    }
    var pending = '<a class="hd-nav-item is-active" href="#task/pending-inventory" aria-current="page" data-pending-nav><span class="hd-i hd-i-clock" aria-hidden="true"></span><span class="hd-nav-item__label">Pending launches</span></a>';
    base = base.replace('</nav>', pending + '</nav>');
    // Sparse representative history, not an overflow restriction: real longer lists still scroll.
    base = base.replace(/<section class="hd-section[^"]*" aria-label="(Running|Recent work)">[\s\S]*?<\/section>/g, function (section, label) {
      var index = 0, keep = label === 'Running' ? 1 : 2;
      section = section.replace(/<a class="hd-task-row[\s\S]*?<\/a>/g, function (row) { return index++ < keep ? row : ''; });
      section = section.replace(/<div class="hd-sidebar__more">[\s\S]*?<\/div>/, '');
      return label === 'Running' ? section.replace('<span class="hd-section__count">3</span>', '<span class="hd-section__count">1</span>') : section;
    });
    // Same bounded body as the approved M04 mount: header/footer stay fixed.
    return base.replace('<nav class="hd-nav"', '<div class="hd-m04-sidebar-scroll"><nav class="hd-nav"').replace('<div class="hd-sidebar__foot">', '</div><div class="hd-sidebar__foot">');
  }
  H.pendingLaunchSidebar = sidebarHtml;
  function render(row) {
    var id = row[0], minimum = id === 'waiting-minimum' || id === 'stop-confirm-minimum' || id === 'stop-requested-minimum';
    if (id === 'stop-confirm-minimum') id = 'stop-confirm';
    if (id === 'stop-requested-minimum') id = 'stop-requested';
    var isInventory = inventory.indexOf(id) !== -1, known = qualified.indexOf(id) !== -1;
    var title = known ? (id === 'preparing-handshake' ? 'Prepare local environment' : 'Review launch admission checks') : isInventory ? 'Pending launches' : 'Pending launch';
    var listed = id !== 'empty' && id !== 'loading' && id !== 'failed';
    var sidebar = sidebarHtml(id, false);
    var body = card(row[1], row[2]);
    if (!isInventory && !known) body += '<dl class="hd-pending-facts"><dt>Selected ID</dt><dd><code>' + ID + '</code></dd></dl>';
    if (isInventory && listed) body += '<div class="hd-pending-inventory">' + link('waiting', '<strong>Review launch admission checks</strong><small>Claude · Harflow · Waiting for resources</small><code>' + ID + '</code>', 'hd-pending-launch') + link('preparing-handshake', '<strong>Prepare local environment</strong><small>Codex · Harflow · Preparing</small><code>20261110-093200-b28d03</code>', 'hd-pending-launch') + '</div>';
    if (known) body += '<dl class="hd-pending-facts"><dt>Launch ID</dt><dd><code>' + (id === 'preparing-handshake' ? '20261110-093200-b28d03' : ID) + '</code></dd><dt>Harness</dt><dd>' + (id === 'preparing-handshake' ? 'Codex' : 'Claude') + '</dd><dt>Repository</dt><dd>/projects/Harflow</dd><dt>Created</dt><dd>10 Nov 2026, 09:30</dd><dt>Resources</dt><dd>' + (id === 'preparing-handshake' ? 'None requested' : 'Claude slots · Shared checkout') + '</dd></dl>';
    if (id === 'stop-confirm') body = card('Waiting for resources', 'Waiting for Claude slots and Shared checkout.') + '<p class="hd-pending-note">Harflow has not confirmed a running task yet.</p>';
    else if (['waiting','preparing','granted','waiting-minimum'].indexOf(id) !== -1) body += '<div class="hd-row">' + link(minimum ? 'stop-confirm-minimum' : 'stop-confirm', 'Stop…', 'hd-btn hd-btn--danger') + link(id, 'Check again') + '</div><p class="hd-pending-note">The engine may refuse Stop if this launch is controlled by a workflow or your access does not allow it.</p>';
    else if (id === 'recorded') body += link('handoff-failed', 'Check task status');
    else if (id !== 'loading' && id !== 'empty') body += link(minimum && id === 'stop-requested' ? 'stop-requested-minimum' : id, id === 'incomplete' ? 'Check next page' : 'Check again');
    if (id === 'stop-requested' || id === 'stop-uncertain') body += '<p class="hd-pending-note">Harflow will not send Stop again automatically. A missing launch or an unavailable status does not confirm that it stopped.</p>';
    if (!isInventory) body += '<p class="hd-pending-note">Harflow has not confirmed a running task yet. Messages and activity remain unavailable.</p>';
    var dialog = id === 'stop-confirm' ? '<div class="hd-m05-scrim"><div class="hd-dialog" role="dialog" aria-modal="true" aria-labelledby="pending-stop-title" aria-describedby="pending-stop-copy"><h2 class="hd-dialog__title" id="pending-stop-title">Stop this launch?</h2><p class="hd-dialog__text" id="pending-stop-copy">This asks the engine to stop the full launch ID below. If it starts before the request arrives, the task with this same ID may be stopped.</p><p class="hd-dialog__text hd-mono">' + ID + '</p><p class="hd-dialog__text">This is best effort. Files already written remain in place. The engine may refuse Stop because of workflow controls or your access.</p><div class="hd-dialog__actions">' + link(minimum ? 'waiting-minimum' : 'waiting', 'Cancel', 'hd-btn hd-btn--secondary hd-pending-close') + link(minimum ? 'stop-requested-minimum' : 'stop-requested', 'Request Stop', 'hd-btn hd-btn--danger') + '</div></div></div>' : '';
    if (dialog) sidebar = sidebar.replace('<aside ', '<aside inert ');
    var width = minimum ? 1000 : 1280, height = minimum ? 620 : 800;
    return '<div class="hd-pending hd-app" data-theme="{{theme}}" data-pending-state="' + row[0] + '" style="width:' + width + 'px;height:' + height + 'px">' + '<div class="hd-m04-proposal hd-pending-sidebar">' + sidebar + '</div><main' + (dialog ? ' inert' : '') + ' class="hd-main"><header class="hd-topbar"><span class="hd-topbar__title">' + title + '</span><span class="hd-badge">Pending launch</span></header><div class="hd-pending-content">' + body + '</div><footer class="hd-pending-composer"><textarea disabled aria-label="Pending launch message unavailable" placeholder="Messages are unavailable until Harflow confirms the task has started"></textarea><p>Pending launch · messaging unavailable</p></footer></main>' + dialog + '</div>';
  }
  var family = H.findFamily('task');
  if (family.groups && family.groups.indexOf('Pending launches') < 0) family.groups.push('Pending launches');
  H.pendingLaunchStates = rows;
  rows.forEach(function (row) {
    var key = 'task/pending-' + row[0];
    if (row[0] !== 'loading') T[key] = render(row);
    docs[key] = '<p><strong>Approved by the owner · 2026-11-10.</strong> Deterministic read-only fixtures. <a href="docs/decisions/pending-launch-discovery.md">Pending-launch discovery decision</a>. Separate launch identity, not a task status. Reset by reopening the route. Tab and Enter select links; browser Back returns to the prior observation. Stop reuses the existing confirmation sheet pattern: initial focus is Cancel, Tab stays inside the sheet, and Escape or Cancel returns focus to Stop. Reopening the route resets the confirmation. Check links retain this fixture rather than invent a successful read. Request Stop draws an accepted request only; it never proves settlement.</p><p>Appearance uses the catalog System / Light / Dark control. Both 1280 × 800 and 1000 × 620 retain native dimensions and scroll instead of scaling. No engine, files or network are accessed.</p>';
    var state = { id: 'pending-' + row[0], title: row[1], description: row[2], group: 'Pending launches', status: 'approved', approval: { by: 'the owner', date: '2026-11-10', decision: 'Pending-launch discovery and controls', reference: '83d820f57e6ec2d82cccd3a1e335128332fdb672' } };
    if (row[0] === 'loading') state.skeleton = { of: 'task/pending-inventory', spec: 'pending-launches' };
    H.registerState('task', state);
  });
  var specs = H.skeletonSpecs = H.skeletonSpecs || {};
  specs['pending-launches'] = {
    frame: '.hd-pending', label: 'Checking pending launches',
    ops: [
      { sel: '.hd-pending-content .hd-pending-card h2', kind: 'settext', text: 'Checking pending launches' },
      { sel: '.hd-pending-content .hd-pending-card p', kind: 'settext', text: 'Checking this engine for pending launches…' },
      { sel: '.hd-pending-inventory .hd-pending-launch', kind: 'disable' },
      { sel: '.hd-pending-inventory strong', kind: 'text', w: [190, 140], h: 12 },
      { sel: '.hd-pending-inventory small', kind: 'text', w: 190, h: 10 },
      { sel: '.hd-pending-inventory code', kind: 'text', w: 140, h: 10 },
      { sel: '.hd-task-row', kind: 'disable' },
      { sel: '.hd-glyph', kind: 'fill', shape: 'circle' },
      { sel: '.hd-task-row__meta', kind: 'text', w: 24, h: 10 },
      { sel: '.hd-nav-item__count, .hd-section__count', kind: 'text', w: 14, h: 10 },
      { sel: '.hd-nav .hd-dot', kind: 'hide' },
      { sel: '.hd-task-row__title', kind: 'text', w: 190, h: 12 }
    ],
    chrome: { Sidebar: 1, Main: 1, Harflow: 1, 'New task': 1, '⌘N': 1, 'Collapse sidebar': 1, Statistics: 1, Running: 1, Appearance: 1, System: 1, 'System, follows this computer': 1, Light: 2, Dark: 2, 'Needs you': 1, Workflows: 1, Resources: 1,
      'Pending launches': 2, 'Recent work': 1, Settings: 1, 'Pending launch': 1,
      'Checking pending launches': 1, 'Checking this engine for pending launches…': 1,
      'Pending launch message unavailable': 1, 'Messages are unavailable until Harflow confirms the task has started': 1,
      'Pending launch · messaging unavailable': 1 }
  };
  // Bind only in the browser; the catalog owns route navigation and appearance.
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    var restoreStop = false;
    var returnRoute = '#task/pending-waiting';
    window.addEventListener('hashchange', function (event) {
      var oldHash = (event.oldURL || '').split('#')[1] || '';
      if (/^task\/pending-stop-confirm(?:-minimum)?(?:\/|$)/.test(window.location.hash.slice(1)) && /^task\/pending-(waiting|preparing|granted|waiting-minimum)(?:\/|$)/.test(oldHash)) returnRoute = '#' + oldHash;
    });
    function modal() { return document.querySelector('.hd-pending [role="dialog"]'); }
    function focusSheet() {
      var sheet = modal();
      if (sheet && !sheet.dataset.focused) {
        if (window.location.hash.indexOf('pending-stop-confirm-minimum') !== -1) returnRoute = '#task/pending-waiting-minimum'; sheet.dataset.focused = 'true'; sheet.querySelector('a').setAttribute('href', returnRoute); sheet.querySelector('a').focus(); }
      else if (!sheet && restoreStop) {
        var stop = document.querySelector('.hd-pending a[href="#task/pending-stop-confirm"], .hd-pending a[href="#task/pending-stop-confirm-minimum"]');
        if (stop) { restoreStop = false; stop.focus(); }
      }
    }
    document.addEventListener('click', function (event) {
      var toggle = event.target.closest('.hd-pending-sidebar [aria-label="Collapse sidebar"], .hd-pending-sidebar [aria-label="Expand sidebar"]');
      if (toggle) {
        var app = toggle.closest('.hd-pending'), host = toggle.closest('.hd-pending-sidebar');
        var collapsed = toggle.getAttribute('aria-label') === 'Collapse sidebar';
        var selected = host.querySelector('.hd-theme__item[aria-pressed="true"]');
        var preference = selected ? selected.getAttribute('aria-label').toLowerCase() : host.dataset.preference || 'system';
        host.dataset.preference = preference;
        host.innerHTML = H.fill(sidebarHtml(app.dataset.pendingState, collapsed), preference, app.dataset.theme);
        if (app.dataset.pendingState === 'loading') {
          // Restore loaded sidebar geometry, then skeletonize only that restored sidebar.
          var ops = collapsed ? [
            { sel: '.hd-rail-item__badge', kind: 'text', w: 14, h: 10 },
            { sel: '.hd-rail-item__badge', kind: 'drop', attrs: ['aria-label'] },
            { sel: '.hd-rail .hd-dot', kind: 'hide' }
          ] : specs['pending-launches'].ops.filter(function (op) { return op.sel.indexOf('.hd-pending-content') !== 0 && op.sel.indexOf('.hd-pending-inventory') !== 0; });
          host.removeAttribute('data-skeleton');
          H.skeletonize(app, { frame: '.hd-pending-sidebar', label: 'Checking pending launches', ops: ops });
        }
        host.querySelector('[aria-label="' + (collapsed ? 'Expand sidebar' : 'Collapse sidebar') + '"]').focus();
      }
      if (event.target.closest('.hd-pending-close')) restoreStop = true;
    }, true);
    document.addEventListener('keydown', function (event) {
      var sheet = modal();
      if (!sheet) return;
      var links = sheet.querySelectorAll('a');
      if (event.key === 'Escape') { event.preventDefault(); restoreStop = true; links[0].click(); }
      if (event.key === 'Tab') {
        var first = links[0], last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    new MutationObserver(focusSheet).observe(document.body, { childList: true, subtree: true });
  }
})();
