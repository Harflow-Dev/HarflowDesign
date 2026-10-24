(function () {
  const unavailable = new Set([
    'setup-required', 'setup-installing', 'setup-failed',
    'setup-update-required', 'setup-updating', 'setup-update-failed'
  ]);
  const b = HF.button;

  HF.isSidebarSetupState = state => unavailable.has(state) || state === 'setup-ready';

  HF.sidebarSetup = state => {
    const setupCard = state === 'setup-required'
      ? `<section class="sidebar-setup-card" aria-labelledby="setup-card-title"><span class="setup-eyebrow">FIRST-TIME SETUP</span><h2 id="setup-card-title">Prepare Harflow</h2><p>Install the components Harflow needs to run.</p>${b('Install required components', 'route:tasks/setup-installing', 'primary setup-action')}</section>`
      : state === 'setup-installing'
        ? `<section class="sidebar-setup-card" aria-labelledby="setup-card-title"><span class="setup-eyebrow">FIRST-TIME SETUP</span><h2 id="setup-card-title">Preparing Harflow…</h2><p role="status">Installing required components for this app.</p><span class="setup-spinner" aria-hidden="true"></span></section>`
        : state === 'setup-failed'
          ? `<section class="sidebar-setup-card" aria-labelledby="setup-card-title"><span class="setup-eyebrow">FIRST-TIME SETUP</span><h2 id="setup-card-title">Setup did not finish</h2><p>The required components could not be installed. No session has started; try again.</p>${b('Retry installation', 'route:tasks/setup-installing', 'primary setup-action')}</section>`
          : state === 'setup-update-required'
            ? `<section class="sidebar-setup-card" aria-labelledby="setup-card-title"><span class="setup-eyebrow">UPDATE REQUIRED</span><h2 id="setup-card-title">Update Harflow runtime</h2><p>This version of Harflow needs updated components.</p><dl class="setup-versions"><div><dt>Installed</dt><dd>0.0.1</dd></div><div><dt>Required by this app</dt><dd>0.0.2</dd></div></dl><p class="setup-footnote">Your task history and existing installation are kept while Harflow updates.</p>${b('Update required components', 'route:tasks/setup-updating', 'primary setup-action')}</section>`
            : state === 'setup-updating'
              ? `<section class="sidebar-setup-card" aria-labelledby="setup-card-title"><span class="setup-eyebrow">UPDATE REQUIRED</span><h2 id="setup-card-title">Updating Harflow…</h2><p role="status">Installing the update. Your task history is preserved during the update.</p><span class="setup-spinner" aria-hidden="true"></span></section>`
              : state === 'setup-update-failed'
                ? `<section class="sidebar-setup-card" aria-labelledby="setup-card-title"><span class="setup-eyebrow">UPDATE REQUIRED</span><h2 id="setup-card-title">Update did not finish</h2><p>Your history and existing installation have been kept.</p>${b('Retry update', 'route:tasks/setup-updating', 'primary setup-action')}</section>`
                : '';

    const ready = state === 'setup-ready';
    const controls = ready
      ? `<button type="button" class="new-session" aria-label="New session, Command N" data-action="route:new-session/default"><svg aria-hidden="true" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12"/></svg><span>New session</span><kbd>⌘N</kbd></button><div class="search-row"><label class="search"><input id="task-search" type="search" aria-label="Search loaded history" placeholder="Search loaded history" disabled></label></div><div class="workflows-heading"><strong>Workflows</strong>${b('<span aria-hidden="true">+</span><span class="visually-hidden">New workflow</span>', 'route:workflow-editor/empty', 'quiet workflow-add')}</div><div class="setup-empty-history">No tasks yet</div>`
      : setupCard;
    return `<aside class="sidebar sidebar-setup ${ready ? 'setup-ready' : ''}">${controls}<div class="sidebar-bottom">${HF.appearanceControl()}${b('<img src="assets/symbols/gearshape-16pt-2x.png" alt=""><span class="visually-hidden">Settings</span>', 'route:settings/general', 'settings-gear')}</div></aside>`;
  };

  HF.renderSidebarSetup = state => {
    const ready = state === 'setup-ready';
    const main = ready
      ? `<div class="setup-welcome"><span class="setup-eyebrow">READY</span><h2>Harflow is ready to use</h2><p>Start a session or create a workflow. Your task list will appear here when work begins.</p><div class="setup-welcome-actions">${b('New session', 'route:new-session/default', 'primary')}${b('Create workflow', 'route:workflow-editor/empty')}</div></div>`
      : `<div class="setup-welcome"><span class="setup-eyebrow">SETUP REQUIRED</span><h2>Finish setting up Harflow</h2><p>Once the runtime components required by this app are ready, sessions and workflows will be available here.</p></div>`;
    return HF.app(`<div class="split">${HF.sidebarSetup(state)}<main class="content setup-content">${main}</main></div>`, 'sidebar-setup-app', 'Harflow');
  };
})();
