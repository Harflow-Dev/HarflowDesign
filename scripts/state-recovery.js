(function () {
  const root = '/Users/example/.harflow';
  const backup = '/Users/example/.harflow.backup-20261024-a17c';
  const labels = {
    'recovery-incompatible': 'Store needs attention',
    'recovery-inspecting': 'Checking the store',
    'recovery-confirmation': 'Back up and initialize?',
    'recovery-running': 'Recovery in progress',
    'recovery-busy': 'Recovery is blocked while the store is in use',
    'recovery-stale': 'Check the store again',
    'recovery-pre-backup-failure': 'Recovery could not start',
    'recovery-partial': 'Recovery stopped before finishing',
    'recovery-success': 'Store is ready',
    'recovery-unsupported': 'Recovery needs a newer engine'
  };
  const route = state => `settings/${state}`;
  const action = (label, state, primary = false) => `<button type="button" class="${primary ? 'primary' : ''}" data-action="route:${route(state)}">${label}</button>`;
  const pathRow = (label, value) => `<div class="recovery-path"><span>${label}</span><code tabindex="0">${value}</code></div>`;
  const step = (state, title, detail) => `<a class="recovery-step ${state === HF.route?.state ? 'current' : ''}" href="#${route(state)}/${HF.appearance?.themeMode || 'system'}"><span>${title}</span><small>${detail}</small></a>`;

  HF.renderStateRecovery = state => {
    const header = `<header class="recovery-heading"><span class="recovery-kicker">DATA STORE · EXPLORATORY</span><h2>${labels[state]}</h2></header>`;
    const paths = pathRow('Selected store', root);
    let body = '';
    switch (state) {
      case 'recovery-incompatible':
        body = `<div class="recovery-callout" role="status"><strong>Harflow cannot open this store yet.</strong><p>The store uses a data format this engine cannot read. Its data is still in place. Review its contents with recovery before Harflow creates a new store.</p></div>${paths}<p class="recovery-note">Recovery checks for active owners first. If ownership is active or unclear, Harflow will stop and leave the store untouched.</p><div class="recovery-actions">${action('Check store', 'recovery-inspecting', true)}</div>`;
        break;
      case 'recovery-inspecting':
        body = `<div class="recovery-progress" role="status"><span class="spinner" aria-hidden="true"></span><div><strong>Checking store contents…</strong><p>Looking for active owners and confirming the selected location. No files are being changed.</p></div></div>${paths}<div class="recovery-actions">${action('Show result', 'recovery-confirmation')}${action('Cancel', 'recovery-incompatible')}</div>`;
        break;
      case 'recovery-confirmation':
        body = `<div class="recovery-callout warning"><strong>Existing data will be kept in a backup.</strong><p>Harflow will move the existing store contents into the backup location, keep this selected store location and lock, then create a fresh store. Earlier task history will remain in the backup and will not appear in the new store.</p></div>${paths}${pathRow('Backup location', backup)}<p class="recovery-note">This check is tied to this store and operation. If its contents or ownership change, Harflow will ask you to inspect it again.</p><div class="recovery-actions">${action('Back up and initialize', 'recovery-running', true)}${action('Cancel', 'recovery-incompatible')}</div>`;
        break;
      case 'recovery-running':
        body = `<div class="recovery-progress" role="status"><span class="spinner" aria-hidden="true"></span><div><strong>Backing up and initializing…</strong><p>Keep Harflow open while it secures the existing data and prepares the new store.</p></div></div>${paths}${pathRow('Backup location', backup)}<p class="recovery-note">Recovery is running. Additional recovery requests are unavailable until this operation finishes.</p>`;
        break;
      case 'recovery-busy':
        body = `<div class="recovery-callout warning"><strong>Another process may still be using this store.</strong><p>Harflow cannot confirm that the store is free, so recovery is blocked and no files have been moved. Close the other Harflow process and inspect again. If ownership remains unclear, contact support before continuing.</p></div>${paths}<div class="recovery-actions">${action('Inspect again', 'recovery-inspecting', true)}</div>`;
        break;
      case 'recovery-stale':
        body = `<div class="recovery-callout warning"><strong>The store changed after it was checked.</strong><p>Harflow has not started recovery. Inspect the current store again to confirm its contents and ownership before continuing.</p></div>${paths}${pathRow('Previously proposed backup', backup)}<div class="recovery-actions">${action('Inspect again', 'recovery-inspecting', true)}</div>`;
        break;
      case 'recovery-pre-backup-failure':
        body = `<div class="recovery-callout error"><strong>Harflow could not safely begin recovery.</strong><p>The backup location could not be reserved. The existing store was not moved or changed. Check that the disk is available and try inspection again.</p></div>${paths}${pathRow('Proposed backup location', backup)}<div class="recovery-actions">${action('Inspect again', 'recovery-inspecting', true)}${action('Close', 'general')}</div>`;
        break;
      case 'recovery-partial':
        body = `<div class="recovery-callout warning"><strong>Recovery stopped before the new store was ready.</strong><p>Existing data is preserved across the selected store and recovery backup. Harflow will not finish this automatically; continue this same recovery operation when the location is available.</p></div>${paths}${pathRow('Recovery backup', backup)}<div class="recovery-actions">${action('Continue recovery', 'recovery-running', true)}${action('Close', 'general')}</div>`;
        break;
      case 'recovery-success':
        body = `<div class="recovery-callout success"><strong>The new store is ready.</strong><p>Harflow reconnected to the selected location. Earlier data remains in the backup and is not part of this store.</p></div>${paths}${pathRow('Recovery backup', backup)}<div class="recovery-actions"><button type="button" data-action="feedback:Mock Finder reveal requested for backup">Show backup in Finder</button>${action('Done', 'general', true)}</div>`;
        break;
      case 'recovery-unsupported':
        body = `<div class="recovery-callout"><strong>This engine cannot inspect or recover this store.</strong><p>Update Harflow to a version with store recovery support, then return to General settings. No recovery action is available from this engine.</p></div>${paths}<div class="recovery-actions">${action('General settings', 'general', true)}</div>`;
        break;
    }
    return `<section class="settings-group recovery-panel">${header}${body}<details class="recovery-states"><summary>Explore recovery states</summary><nav aria-label="Recovery state examples">${step('recovery-incompatible', 'Incompatible store', 'Entry and reason')}${step('recovery-inspecting', 'Inspecting', 'No mutation')}${step('recovery-confirmation', 'Confirmation', 'Root and unique backup')}${step('recovery-running', 'In progress', 'Single operation')}${step('recovery-busy', 'Store in use', 'Recovery blocked')}${step('recovery-stale', 'Stale confirmation', 'Inspect again')}${step('recovery-pre-backup-failure', 'Before backup', 'No data moved')}${step('recovery-partial', 'Interrupted', 'Continue same operation')}${step('recovery-success', 'Complete', 'Reconnect and reveal')}${step('recovery-unsupported', 'Unsupported', 'No action')}</nav></details></section>`;
  };
})();
