/* Exploratory pending-launch discovery. Deterministic display-only fixtures; no engine calls. */
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
  function render(row) {
    var id = row[0], minimum = id === 'waiting-minimum' || id === 'stop-confirm-minimum' || id === 'stop-requested-minimum';
    if (id === 'stop-confirm-minimum') id = 'stop-confirm';
    if (id === 'stop-requested-minimum') id = 'stop-requested';
    var isInventory = inventory.indexOf(id) !== -1, known = qualified.indexOf(id) !== -1;
    var title = known ? (id === 'preparing-handshake' ? 'Prepare local environment' : 'Review launch admission checks') : isInventory ? 'Pending launches' : 'Pending launch';
    var listed = id !== 'empty' && id !== 'loading' && id !== 'failed';
    var sidebar = '<aside class="hd-sidebar" aria-label="Sidebar"><div class="hd-sidebar__top"><span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span></div><nav class="hd-nav" aria-label="Main"><a class="hd-nav-item" href="#new-task/centered-empty">＋ New task</a><a class="hd-nav-item" href="#needs-you/waiting">Needs you</a><a class="hd-nav-item" href="#workflows/list">Workflows</a><a class="hd-nav-item" href="#resources/slots">Resources</a></nav><section class="hd-section"><div class="hd-section__head">Pending launches</div>' +
      (listed ? link('waiting', 'Review launch admission checks<small>Waiting for resources</small>', 'hd-pending-launch' + (!isInventory && id !== 'preparing-handshake' ? ' is-active' : '')) + link('preparing-handshake', 'Prepare local environment<small>Preparing</small>', 'hd-pending-launch' + (id === 'preparing-handshake' ? ' is-active' : '')) : '<p class="hd-pending-sidebar-note">' + (id === 'empty' ? 'None observed in this check' : 'Check unavailable') + '</p>') +
      '<a class="hd-nav-item" href="#task/pending-inventory">View pending launches</a></section><section class="hd-section hd-section--fill"><div class="hd-section__head">Recent work</div><a class="hd-task-row" href="#task/failed-continue"><span class="hd-task-row__title">Review previous delivery</span></a></section><div class="hd-sidebar__foot"><a class="hd-nav-item" href="#settings/general">Settings</a></div></aside>';
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
    return '<div class="hd-pending hd-app" data-theme="{{theme}}" style="width:' + width + 'px;height:' + height + 'px">' + sidebar + '<main' + (dialog ? ' inert' : '') + ' class="hd-main"><header class="hd-topbar"><span class="hd-topbar__title">' + title + '</span><span class="hd-badge">Pending launch</span></header><div class="hd-pending-content">' + body + '</div><footer class="hd-pending-composer"><textarea disabled aria-label="Pending launch message unavailable" placeholder="Messages are unavailable until Harflow confirms the task has started"></textarea><p>Pending launch · messaging unavailable</p></footer></main>' + dialog + '</div>';
  }
  var family = H.findFamily('task');
  if (family.groups && family.groups.indexOf('Pending launches') < 0) family.groups.push('Pending launches');
  H.pendingLaunchStates = rows;
  rows.forEach(function (row) {
    var key = 'task/pending-' + row[0];
    if (row[0] !== 'loading') T[key] = render(row);
    docs[key] = '<p><strong>Provisional · not approved.</strong> Deterministic read-only fixtures. <a href="docs/decisions/pending-launch-discovery.md">Pending-launch discovery decision</a>. Separate launch identity, not a task status. Reset by reopening the route. Tab and Enter select links; browser Back returns to the prior observation. Stop reuses the existing confirmation sheet pattern: initial focus is Cancel, Tab stays inside the sheet, and Escape or Cancel returns focus to Stop. Reopening the route resets the confirmation. Check links retain this fixture rather than invent a successful read. Request Stop draws an accepted request only; it never proves settlement.</p><p>Appearance uses the catalog System / Light / Dark control. Both 1280 × 800 and 1000 × 620 retain native dimensions and scroll instead of scaling. No engine, files or network are accessed.</p>';
    var state = { id: 'pending-' + row[0], title: row[1], description: row[2], group: 'Pending launches', status: 'provisional', approvalNote: 'Provisional · not approved · owner decision required' };
    if (row[0] === 'loading') state.skeleton = { of: 'task/pending-inventory', spec: 'pending-launches' };
    H.registerState('task', state);
  });
  var specs = H.skeletonSpecs = H.skeletonSpecs || {};
  specs['pending-launches'] = {
    frame: '.hd-pending', label: 'Checking pending launches',
    ops: [
      { sel: '.hd-pending-content .hd-pending-card h2', kind: 'settext', text: 'Checking pending launches' },
      { sel: '.hd-pending-content .hd-pending-card p', kind: 'settext', text: 'Checking this engine for pending launches…' },
      { sel: '.hd-sidebar .hd-pending-launch', kind: 'custom', pin: 'fixed', run: function (el, i) {
        el.removeAttribute('href'); el.setAttribute('aria-disabled', 'true');
        el.innerHTML = H.skelBlock(i ? 140 : 190, 12, 'line', 'max-width:100%;margin:4px 0 7px') + H.skelBlock(90, 10);
      } },
      { sel: '.hd-pending-inventory .hd-pending-launch', kind: 'disable' },
      { sel: '.hd-pending-inventory strong', kind: 'text', w: [190, 140], h: 12 },
      { sel: '.hd-pending-inventory small', kind: 'text', w: 190, h: 10 },
      { sel: '.hd-pending-inventory code', kind: 'text', w: 140, h: 10 },
      { sel: '.hd-task-row', kind: 'disable' },
      { sel: '.hd-task-row__title', kind: 'text', w: 190, h: 12 }
    ],
    chrome: { Sidebar: 1, Main: 1, Harflow: 1, '＋ New task': 1, 'Needs you': 1, Workflows: 1, Resources: 1,
      'Pending launches': 2, 'View pending launches': 1, 'Recent work': 1, Settings: 1, 'Pending launch': 1,
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
