(function () {
  // Exploratory sidebar proposals: appearance control in the header (#6), starred workflows (#7),
  // and the sidebar context menu with delete confirmation (#8). No native source exists for any of them.
  const esc = HF.escape;
  const STATES = ['appearance-header', 'starred-workflows', 'context-menu', 'delete-confirmation'];
  const MENU_STATES = ['context-menu', 'delete-confirmation'];
  const RESUMABLE = ['completed', 'failed', 'cancelled', 'timed-out'];

  HF.sidebarProposalStates = STATES;
  HF.sidebarWorkflows = [
    { id: 'session-reliability', name: 'Session reliability', route: 'workflow-run/running' },
    { id: 'development-workflow', name: 'Development workflow', route: 'workflow-editor/saved' },
    { id: 'release-checklist', name: 'Release checklist', route: 'workflow-editor/saved' }
  ];
  const DEFAULT_STARRED = ['release-checklist'];

  // Starred group first; within each group the existing underlying order is kept.
  HF.orderStarred = (items, starredIds) => {
    const starred = new Set(starredIds);
    return [...items.filter(item => starred.has(item.id)), ...items.filter(item => !starred.has(item.id))];
  };

  HF.appearanceHeaderControl = () => `<div class="appearance-header-control" role="group" aria-label="Appearance">${[
    ['light', 'sun.max', 'Light'], ['dark', 'moon', 'Dark'], ['system', 'desktopcomputer', 'System']
  ].map(([value, symbol, label]) => {
    const selected = HF.appearance.preference === value;
    return `<button type="button" class="appearance-segment${selected ? ' selected' : ''}" data-appearance-preference="${value}" aria-label="${label}" aria-pressed="${selected}"><img src="assets/symbols/appearance/${symbol}.png" alt=""><span class="appearance-segment-check" aria-hidden="true"></span><span class="appearance-segment-label">${label}</span></button>`;
  }).join('')}</div>`;

  const starIcon = filled => filled
    ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.4l-4 2.2.9-4.4-3.3-3 4.5-.5z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg>'
    : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.4l-4 2.2.9-4.4-3.3-3 4.5-.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';

  const workflowRow = (workflow, options = {}) => {
    const starred = options.starred;
    const star = options.stars ? `<button type="button" class="star-toggle${starred ? ' starred' : ''}" data-action="sp-star:${workflow.id}" aria-label="${starred ? 'Starred, unstar' : 'Star'} ${esc(workflow.name)}">${starIcon(starred)}</button>` : '';
    return `<div class="workflow-row-wrap${options.stars ? ' has-star' : ''}"><button type="button" class="workflow-row" data-action="route:${workflow.route}" data-sp-workflow="${workflow.id}"><span class="sidebar-workflow-icon" aria-hidden="true"></span><span>${esc(workflow.name)}</span></button>${star}</div>`;
  };

  HF.starredWorkflowRows = starredIds => HF.orderStarred(HF.sidebarWorkflows, starredIds).map(workflow => workflowRow(workflow, { stars: true, starred: starredIds.includes(workflow.id) })).join('');

  // Replaces the default Workflows block of the sidebar in the states that need extra controls.
  HF.sidebarWorkflowBlock = (state, heading) => {
    if (state === 'starred-workflows') return `${heading}<div class="sp-workflows" id="sp-workflows">${HF.starredWorkflowRows(current.starred)}</div>`;
    if (MENU_STATES.includes(state)) return `${heading}<div class="sp-workflows">${HF.sidebarWorkflows.slice(0, 2).map(workflow => workflowRow(workflow)).join('')}</div>`;
    return null;
  };

  // Context menu items by item kind and state. Cancel and Resume appear only for tasks, and are enabled only when valid.
  HF.contextMenuItems = item => item.kind === 'workflow'
    ? [{ id: 'rename', label: 'Rename…', enabled: true }, { separator: true }, { id: 'delete', label: 'Delete…', enabled: true, danger: true }]
    : [{ id: 'cancel', label: 'Cancel', enabled: item.status === 'running' }, { id: 'resume', label: 'Resume', enabled: RESUMABLE.includes(item.status) }, { separator: true }, { id: 'delete', label: 'Delete…', enabled: true, danger: true }];

  HF.contextMenu = (item, position) => `<div class="sp-menu" role="menu" aria-label="Actions for ${esc(item.name)}" ${position ? `style="left:${Math.round(position.x)}px;top:${Math.round(position.y)}px"` : ''}>${HF.contextMenuItems(item).map(entry => entry.separator
    ? '<div class="sp-menu-separator" role="separator"></div>'
    : `<button type="button" role="menuitem" class="sp-menu-item${entry.danger ? ' danger' : ''}" data-action="sp-menu:${entry.id}" ${entry.enabled ? '' : 'aria-disabled="true"'}>${entry.label}</button>`).join('')}</div>`;

  // Deleting a running item is unavailable and says why; nothing is cancelled or removed silently.
  HF.deleteConfirmation = item => {
    const running = item.status === 'running';
    const scope = item.kind === 'workflow' ? 'This removes the workflow and its saved definition from this Mac.' : 'This removes the task and its recorded history from this Mac.';
    const title = running ? `“${esc(item.name)}” is still running` : `Delete “${esc(item.name)}”?`;
    const body = running ? 'Cancel it first. Nothing is cancelled or removed automatically.' : `${scope} This cannot be undone.`;
    return `<div class="sp-scrim"></div><div class="sp-alert" role="alertdialog" aria-modal="true" aria-labelledby="sp-alert-title" aria-describedby="sp-alert-body"><svg class="sp-alert-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2L22 20.5H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9.5v5.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17.6" r="1.2" fill="currentColor"/></svg><h2 id="sp-alert-title">${title}</h2><p id="sp-alert-body">${body}</p>${running ? '<button type="button" class="primary" data-action="sp-delete-cancel">OK</button>' : '<button type="button" class="primary" data-action="sp-delete-cancel">Cancel</button><button type="button" class="danger" data-action="sp-delete-confirm">Delete</button>'}</div>`;
  };

  const initialItem = () => HF.sidebarItem('task:fixture-claude-04');
  // Items are addressed as "task:<fixture id>" or "workflow:<id>".
  HF.sidebarItem = key => {
    const [kind, id] = key.split(/:(.*)/s);
    if (kind === 'workflow') {
      const workflow = HF.sidebarWorkflows.find(entry => entry.id === id);
      return workflow ? { kind, id, key, name: workflow.name } : null;
    }
    const task = HF.fixtures.find(entry => entry.id === id);
    return task ? { kind: 'task', id, key, name: task.title, status: task.status } : null;
  };

  HF.sidebarProposalOverlay = state => {
    let inner = '';
    if (state === 'context-menu') inner = HF.contextMenu(initialItem(), { x: 200, y: 560 });
    if (state === 'delete-confirmation') inner = HF.deleteConfirmation(initialItem());
    return MENU_STATES.includes(state) ? `<div class="sp-overlay-root" id="sp-overlay">${inner}</div>` : '';
  };

  // Shared shell for the four sidebar proposal states: the populated sidebar with its proposal-specific
  // regions, an unselected detail pane, and any menu or dialog overlay.
  HF.renderSidebarProposal = state => HF.app(`<div class="split">${HF.sidebar(state)}<main class="content sp-empty-detail">${HF.empty('Select a task', 'Tasks started through harflow show up in the sidebar, live.')}</main></div>${HF.sidebarProposalOverlay(state)}`, '', 'Harflow', state === 'appearance-header' ? { actions: HF.appearanceHeaderControl() } : {});

  // ---- Interaction (browser only) ------------------------------------------------------------------------
  let current = { starred: DEFAULT_STARRED.slice(), menu: null, dialog: null };
  HF.resetSidebarProposals = () => { current = { starred: DEFAULT_STARRED.slice(), menu: null, dialog: null }; };
  HF.sidebarProposalSnapshot = () => JSON.parse(JSON.stringify(current));
  const active = () => HF.route?.screen === 'tasks' && STATES.includes(HF.route.state);
  const menuActive = () => HF.route?.screen === 'tasks' && MENU_STATES.includes(HF.route.state);
  const root = () => document.querySelector('#sp-overlay');
  const openerSelector = item => item.kind === 'workflow' ? `[data-sp-workflow="${item.id}"]` : `[data-action="select-task:${item.id}"]`;

  function placeMenu(menu, x, y) {
    const app = document.querySelector('.app');
    if (!app || !menu) return;
    const box = app.getBoundingClientRect();
    const width = menu.offsetWidth, height = menu.offsetHeight;
    menu.style.left = `${Math.max(4, Math.min(x - box.left, box.width - width - 4))}px`;
    menu.style.top = `${Math.max(4, Math.min(y - box.top, box.height - height - 4))}px`;
  }
  function enabledItems(menu) { return [...menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')]; }
  function openMenu(item, x, y, focusFirst) {
    const host = root(); if (!host) return;
    current.menu = item.key; current.dialog = null;
    host.innerHTML = HF.contextMenu(item);
    const menu = host.querySelector('.sp-menu');
    placeMenu(menu, x, y);
    if (focusFirst) enabledItems(menu)[0]?.focus();
  }
  function closeMenu(restoreFocus) {
    const host = root();
    const item = current.menu && HF.sidebarItem(current.menu);
    current.menu = null;
    if (host) host.innerHTML = '';
    if (restoreFocus && item) document.querySelector(openerSelector(item))?.focus();
  }
  function setDialog(item) {
    const host = root(); if (!host) return;
    current.menu = null; current.dialog = item.key;
    host.innerHTML = HF.deleteConfirmation(item);
    const split = document.querySelector('.app > .split'); if (split) split.inert = true;
    host.querySelector('.sp-alert .primary')?.focus();
  }
  function closeDialog(message) {
    const host = root();
    const item = current.dialog && HF.sidebarItem(current.dialog);
    current.dialog = null;
    if (host) host.innerHTML = '';
    const split = document.querySelector('.app > .split'); if (split) split.inert = false;
    if (item) document.querySelector(openerSelector(item))?.focus();
    if (message) HF.feedback(message);
  }
  HF.afterSidebarProposalsRender = () => {
    if (!menuActive()) return;
    const item = initialItem();
    const row = document.querySelector(openerSelector(item));
    const menu = document.querySelector('#sp-overlay .sp-menu');
    if (row && menu) { const box = row.getBoundingClientRect(); placeMenu(menu, box.left + 40, box.top + box.height - 6); }
    if (HF.route.state === 'delete-confirmation') {
      current.dialog = item.key;
      const split = document.querySelector('.app > .split'); if (split) split.inert = true;
      document.querySelector('#sp-overlay .sp-alert .primary')?.focus();
    } else if (menu) current.menu = item.key;
  };

  document.addEventListener('contextmenu', event => {
    if (!menuActive() || current.dialog) return;
    const row = event.target.closest('.task-row:not(.parallel-group), .workflow-row');
    if (!row) return;
    const key = row.dataset.spWorkflow ? `workflow:${row.dataset.spWorkflow}` : row.dataset.action?.startsWith('select-task:') ? `task:${row.dataset.action.slice('select-task:'.length)}` : '';
    const item = key && HF.sidebarItem(key);
    if (!item) return;
    event.preventDefault();
    const keyboard = event.button === 0 && !event.pointerType;
    const box = row.getBoundingClientRect();
    openMenu(item, keyboard ? box.left + 40 : event.clientX, keyboard ? box.bottom - 6 : event.clientY, keyboard);
  }, true);

  document.addEventListener('click', event => {
    if (!active()) return;
    const target = event.target.closest('[data-action^="sp-"]');
    if (!target) {
      if (current.menu && !event.target.closest('.sp-menu')) closeMenu(false);
      return;
    }
    event.preventDefault(); event.stopImmediatePropagation();
    const [action, value] = target.dataset.action.split(':');
    if (action === 'sp-star') {
      const workflow = HF.sidebarWorkflows.find(entry => entry.id === value);
      if (!workflow) return;
      const index = current.starred.indexOf(value);
      if (index >= 0) current.starred.splice(index, 1); else current.starred.push(value);
      const list = document.querySelector('#sp-workflows');
      if (list) list.innerHTML = HF.starredWorkflowRows(current.starred);
      document.querySelector(`[data-action="sp-star:${value}"]`)?.focus();
      HF.feedback(index >= 0 ? `Unstarred ${workflow.name}` : `Starred ${workflow.name} · listed first`);
      return;
    }
    if (action === 'sp-menu') {
      if (target.getAttribute('aria-disabled') === 'true') return;
      const item = HF.sidebarItem(current.menu);
      if (!item) return;
      if (value === 'delete') { setDialog(item); return; }
      closeMenu(true);
      if (value === 'rename') { closeMenu(false); HF.navigate('workflow-editor', 'rename'); return; }
      HF.feedback( `${value === 'cancel' ? 'Cancel' : 'Resume'} requested · mock only`);
      return;
    }
    if (action === 'sp-delete-cancel') { closeDialog('Deletion cancelled'); return; }
    if (action === 'sp-delete-confirm') closeDialog('Mock deletion requested · nothing was removed');
  }, true);

  document.addEventListener('keydown', event => {
    if (!active()) return;
    const menu = event.target.closest?.('.sp-menu');
    if (menu) {
      const items = enabledItems(menu), index = items.indexOf(document.activeElement);
      if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length]?.focus(); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length]?.focus(); }
      else if (event.key === 'Home') { event.preventDefault(); items[0]?.focus(); }
      else if (event.key === 'End') { event.preventDefault(); items[items.length - 1]?.focus(); }
      else if (event.key === 'Escape' || event.key === 'Tab') { event.preventDefault(); closeMenu(true); }
      return;
    }
    const alert = event.target.closest?.('.sp-alert');
    if (alert) {
      if (event.key === 'Escape') { event.preventDefault(); closeDialog('Deletion cancelled'); }
      else if (event.key === 'Tab') {
        const buttons = [...alert.querySelectorAll('button')];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.key === 'Escape' && current.menu) { event.preventDefault(); closeMenu(true); }
    if (event.key === 'ArrowDown' && current.menu && root()?.querySelector('.sp-menu') && !event.target.closest('input,textarea,select')) {
      const first = enabledItems(root().querySelector('.sp-menu'))[0];
      if (first) { event.preventDefault(); first.focus(); }
    }
  }, true);
})();
