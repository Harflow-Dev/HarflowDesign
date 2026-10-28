(function () {
  const escaped = value => HF.escape(String(value ?? ''));
  const fixture = (id, source, message, retryLabel) => ({ id, source, message, retryLabel, attempts: 0, resolved: false });
  const fixtures = {
    'workflow-errors-zero': [],
    'workflow-errors-one': [fixture('workflow-read', 'Development workflow', 'Could not read the saved workflow. The last known version is still available.', 'Retry workflow read')],
    'workflow-errors-three': [
      fixture('workflow-read', 'Development workflow', 'Could not read the saved workflow. The last known version is still available.', 'Retry workflow read'),
      fixture('run-history', 'Session reliability', 'Could not load the latest run history. Existing task activity is retained.', 'Retry run history'),
      fixture('workflow-refresh', 'Workflow library', 'Could not refresh workflow metadata. The saved definition remains available.', 'Retry library refresh')
    ]
  };
  fixtures['workflow-errors-open'] = fixtures['workflow-errors-three'];
  let routeKey = '', sources = [];

  function reset(route) {
    if (!route || route.screen !== 'tasks') { routeKey = ''; sources = []; return; }
    const nextKey = route.state;
    if (nextKey !== routeKey) {
      routeKey = nextKey;
      sources = (fixtures[nextKey] || []).map(item => ({ ...item }));
    }
  }
  function activeSources() { return sources.filter(item => !item.resolved); }
  function render() {
    const active = activeSources();
    if (!active.length) return '';
    const rows = active.map(item => `<article class="workflow-error-item"><strong>${escaped(item.source)}</strong><p>${escaped(item.message)}</p><div class="workflow-error-actions"><button type="button" data-action="workflow-error-retry:${escaped(item.id)}">${escaped(item.attempts ? 'Retry requested' : item.retryLabel)}</button></div></article>`).join('');
    return `<section class="workflow-error-entry" aria-label="Workflow errors"><details class="workflow-error-popover" ${routeKey === 'workflow-errors-open' ? 'open' : ''}><summary aria-label="Workflow errors, ${active.length}"><span>Workflow errors</span><span class="workflow-error-count">${active.length}</span></summary><div class="workflow-error-list">${rows}<p class="workflow-error-note">Workflow reads retry automatically.</p></div></details></section>`;
  }
  function updateSidebar() {
    const slot = document.querySelector('.workflow-errors-slot');
    if (!slot) return;
    const wasOpen = Boolean(slot.querySelector('.workflow-error-popover[open]'));
    slot.innerHTML = render();
    const disclosure = slot.querySelector('.workflow-error-popover');
    if (disclosure && wasOpen) disclosure.open = true;
  }

  HF.resetWorkflowErrors = reset;
  HF.workflowErrorsEntry = () => {
    if (HF.route?.screen === 'tasks' && routeKey !== HF.route.state) reset(HF.route);
    return render();
  };
  HF.workflowErrorsController = {
    snapshot() { return { sources: sources.map(item => ({ ...item })), activeCount: activeSources().length, routeKey }; },
    retry(id) {
      const item = activeSources().find(source => source.id === id);
      if (!item) return this.snapshot();
      item.attempts += 1;
      HF.feedback(`${item.retryLabel} requested · mock only`);
      updateSidebar();
      return this.snapshot();
    },
    resolve(id) {
      const item = activeSources().find(source => source.id === id);
      if (item) item.resolved = true;
      updateSidebar();
      return this.snapshot();
    },
    dismissSnackbar() {
      document.querySelector('#announcement')?.classList.remove('visible');
      return this.snapshot();
    }
  };

  document.addEventListener('click', event => {
    const target = event.target.closest?.('[data-action^="workflow-error-"]');
    if (!target || target.disabled) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const [action, id] = target.dataset.action.split(':');
    if (action === 'workflow-error-retry') HF.workflowErrorsController.retry(id);
  }, true);
})();
