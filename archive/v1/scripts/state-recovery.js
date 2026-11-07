(function () {
  const root = '/Example/.harflow';
  const backup = '/Example/.harflow.backup-20261024-a17c';
  const labels = {
    'recovery-busy': 'Recovery is blocked while the store is in use',
    'recovery-stale': 'Check the store again',
    'recovery-partial': 'Recovery stopped before finishing',
    'recovery-unsupported': 'Recovery needs a newer engine'
  };

  // Task store group of General settings. Presentations follow StoreRecoveryPresentation.swift and
  // StoreRecoveryPanel.swift at HarflowMac 5128aeb; fixture values follow the ContractsV1 state fixtures.
  const storeRoot = '/Example/state';
  const storeOperation = '1234567890abcdef1234567890abcdef';
  const storeBackup = `/Example/state.harflow-backup-${storeOperation}`;
  const reviewNotice = 'Previous task history will be archived, not imported. Recovery checks cooperative ownership; close sessions using this store first. The backup is archival history, not an automatic restore.';
  const inspected = { root: storeRoot, reason: 'unmarked_nonempty', message: 'Unmarked state root contains data', backup: storeBackup, operation: storeOperation, phase: 'proposed' };
  const storeModels = {
    general: { title: 'Task store', message: 'Inspect the task store to check compatibility. Inspection does not reset history.', inspect: ['Inspect task store', 'feedback:Task store inspection requested'] },
    'recovery-incompatible': { title: 'Task store needs attention', message: 'Unmarked state root contains data', root: storeRoot, reason: 'state_incompatible', inspect: ['Inspect task store', 'route:settings/recovery-inspecting'] },
    'recovery-inspecting': { ...inspected, title: 'Task store needs attention', notice: true, inspect: ['Inspect task store', 'route:settings/recovery-inspecting'], request: ['Review backup and reset', 'route:settings/recovery-confirmation'] },
    'recovery-confirmation': { ...inspected, title: 'Back up and reset this store?', notice: true, confirming: true, cancel: ['Cancel', 'route:settings/recovery-inspecting'], confirm: ['Confirm backup and reset', 'route:settings/recovery-running'] },
    'recovery-running': { ...inspected, title: 'Recovering task store…', busy: true },
    'recovery-success': { title: 'Task store is ready', message: 'Recovery completed. Previous history is archived in the backup; it is not imported into the new store.', root: storeRoot, backup: storeBackup, operation: storeOperation, phase: 'completed', inspect: ['Inspect task store', 'route:settings/recovery-inspecting'], reveal: ['Show backup in Finder', 'feedback:Mock Finder reveal requested for backup'] },
    'recovery-pre-backup-failure': { ...inspected, title: 'Recovery could not finish', message: 'State recovery did not complete', reason: 'state_recovery_failed', inspect: ['Inspect task store', 'route:settings/recovery-inspecting'], retained: true }
  };
  HF.taskStoreStates = Object.keys(storeModels).filter(state => state !== 'general');
  const detail = (label, value) => `<div class="store-detail"><span>${label}</span><code tabindex="0">${HF.escape(value)}</code></div>`;
  HF.taskStorePanel = (state, disabled = false) => {
    const m = storeModels[state] || storeModels.general;
    const btn = (spec, cls = '') => `<button type="button" class="${cls}" data-action="${spec[1]}" ${disabled ? 'disabled' : ''}>${spec[0]}</button>`;
    const rows = [m.root && detail('State root', m.root), m.reason && detail('Reason', m.reason), m.backup && detail('Backup path', m.backup), m.operation && detail('Recovery operation', m.operation), m.phase && detail('Phase', m.phase)].filter(Boolean).join('');
    return `<section class="settings-group store-group"><h3>Task store</h3><div class="settings-card store-card${disabled ? ' disabled' : ''}" ${m.busy ? 'aria-busy="true"' : ''}><h4>${m.title}</h4>${m.message ? `<p class="store-message">${m.message}</p>` : ''}${rows}${m.notice ? `<p class="store-callout">${reviewNotice}</p>` : ''}${m.busy ? `<span class="spinner" role="status" aria-label="${m.title}"></span>` : ''}<div class="store-actions">${m.inspect ? btn(m.inspect) : ''}${m.request ? btn(m.request) : ''}${m.cancel ? btn(m.cancel) : ''}${m.confirm ? btn(m.confirm, 'danger') : ''}${m.reveal ? btn(m.reveal) : ''}</div>${m.retained ? '<p class="store-callout">Inspect again before retrying. Any reported backup evidence is retained; the operation may have partially completed.</p>' : ''}</div></section>`;
  };
  const route = state => `settings/${state}`;
  const action = (label, state, primary = false) => `<button type="button" class="${primary ? 'primary' : ''}" data-action="route:${route(state)}">${label}</button>`;
  const pathRow = (label, value) => `<div class="recovery-path"><span>${label}</span><code tabindex="0">${value}</code></div>`;
  const step = (state, title, detail) => `<a class="recovery-step ${state === HF.route?.state ? 'current' : ''}" href="#${route(state)}/${HF.appearance?.themeMode || 'system'}"><span>${title}</span><small>${detail}</small></a>`;

  HF.renderStateRecovery = state => {
    const header = `<header class="recovery-heading"><h2>${labels[state]}</h2></header>`;
    const paths = pathRow('Selected store', root);
    let body = '';
    switch (state) {
      case 'recovery-busy':
        body = `<div class="recovery-callout warning"><strong>Another process may still be using this store.</strong><p>Harflow cannot confirm that the store is free, so recovery is blocked and no files have been moved. Close the other Harflow process and inspect again. If ownership remains unclear, contact support before continuing.</p></div>${paths}<div class="recovery-actions">${action('Inspect again', 'recovery-inspecting', true)}</div>`;
        break;
      case 'recovery-stale':
        body = `<div class="recovery-callout warning"><strong>The store changed after it was checked.</strong><p>Harflow has not started recovery. Inspect the current store again to confirm its contents and ownership before continuing.</p></div>${paths}${pathRow('Previously proposed backup', backup)}<div class="recovery-actions">${action('Inspect again', 'recovery-inspecting', true)}</div>`;
        break;
      case 'recovery-partial':
        body = `<div class="recovery-callout warning"><strong>Recovery stopped before the new store was ready.</strong><p>Existing data is preserved across the selected store and recovery backup. Harflow will not finish this automatically; continue this same recovery operation when the location is available.</p></div>${paths}${pathRow('Recovery backup', backup)}<div class="recovery-actions">${action('Continue recovery', 'recovery-running', true)}${action('Close', 'general')}</div>`;
        break;
      case 'recovery-unsupported':
        body = `<div class="recovery-callout"><strong>This engine cannot inspect or recover this store.</strong><p>Update Harflow to a version with store recovery support, then return to General settings. No recovery action is available from this engine.</p></div>${paths}<div class="recovery-actions">${action('General settings', 'general', true)}</div>`;
        break;
    }
    return `<section class="settings-group recovery-panel">${header}${body}<details class="recovery-states"><summary>Explore recovery states</summary><nav aria-label="Recovery state examples">${step('recovery-incompatible', 'Task store needs attention', 'Incompatible')}${step('recovery-inspecting', 'Task store needs attention', 'Inspected, review backup and reset')}${step('recovery-confirmation', 'Back up and reset this store?', 'Confirming')}${step('recovery-running', 'Recovering task store…', 'Recovering')}${step('recovery-busy', 'Store in use', 'Recovery blocked')}${step('recovery-stale', 'Stale confirmation', 'Inspect again')}${step('recovery-pre-backup-failure', 'Recovery could not finish', 'Failed')}${step('recovery-partial', 'Interrupted', 'Continue same operation')}${step('recovery-success', 'Task store is ready', 'Completed')}${step('recovery-unsupported', 'Unsupported', 'No action')}</nav></details></section>`;
  };
})();
