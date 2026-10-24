(function () {
  const b = HF.button;
  const c = HF.chip;

  const nativeSurface = (kind, body, label) =>
    `<section class="app native-surface ${kind}" data-native-surface="${kind}" aria-label="${label}">${body}</section>`;

  const agentCards = [
    ['claude', 'Claude', 'Claude Code CLI', false],
    ['codex', 'Codex', 'OpenAI Codex CLI', false],
    ['vibe', 'Vibe', 'Mistral Vibe CLI, using your configured model', false],
    ['opencode', 'Opencode', 'Opencode CLI', true]
  ];

  const accessOptions = [
    ['read_only', 'Read-only', 'Requests read-only repo review.'],
    ['write_in_repo', 'Can edit this repo', 'Requests repo edits, no publishing.'],
    ['publish', 'Can publish', 'Requests edits and publish attempts.'],
    ['unrestricted', 'Full access', 'Requests broad access; use sparingly.']
  ];

  HF.renderNew = state => {
    const message = {
      unavailable: 'Harness catalog unavailable. Showing known harnesses.',
      'missing-cli': 'Claude Code CLI was not found. Install it before starting.',
      'start-failed': 'Could not start the session. Check the repository and try again.'
    }[state];
    const cards = state === 'loading'
      ? `<div class="new-agent-grid" aria-label="Loading harnesses">${Array.from({ length: 4 }, () => '<div class="new-agent-skeleton"></div>').join('')}</div>`
      : `<div class="new-agent-grid">${agentCards.map(([id, name, help, unavailable], index) => `
          <button type="button" class="new-agent-card ${index === 0 ? 'selected' : ''} ${unavailable ? 'not-installed' : ''}"
            data-action="agent:${id}" ${unavailable ? 'disabled' : ''} aria-pressed="${index === 0}">
            <span class="backend-dot ${id}" aria-hidden="true"></span>
            <span class="new-agent-copy"><strong>${name}</strong><small>${help}</small></span>
            ${unavailable ? '<span class="not-installed-label">Not installed</span>' : ''}
          </button>`).join('')}</div>`;
    return nativeSurface('new-session', `
      <div class="new-session-body">
        <div class="new-session-scroll">
          <header class="native-dialog-heading">
            <h2>New session</h2>
            <p>Start an agent on one of your repos. It runs in the background and shows up in the sidebar.</p>
          </header>
          ${message ? HF.banner(message, state === 'start-failed') : ''}
          <section class="new-session-section task-section">
            <h3>What should it do?</h3>
            <textarea class="task-input" id="new-task" aria-label="What should it do?" placeholder="Describe the task, like you would to a colleague…"></textarea>
            ${state === 'validation' ? HF.banner('Enter a task to start.', true) : ''}
            <label class="name-field"><span>Name</span><input id="session-name" aria-label="Name" placeholder="Optional — shown in the sidebar, e.g. MT-2477 iOS review"></label>
          </section>
          <section class="new-session-section">
            <h3>Harness</h3>
            ${cards}
          </section>
          <section class="new-session-section repository-section">
            <h3>Repository</h3>
            <div class="repository-control"><input id="repo-input" aria-label="Repository path" value="/Example/HarflowMac">${b('Choose…', 'feedback:Directory chooser is unavailable in this offline specimen')}</div>
            <div class="recent-repositories"><span>Recent</span><span>HarflowMac</span><span>HarflowDesign</span></div>
          </section>
          <section class="new-session-section access-section">
            <h3>Access level</h3>
            <div class="access-grid">${accessOptions.map(([value, title, description], index) => `
              <button type="button" class="access-option ${index === 0 ? 'selected' : ''}" data-action="access:${value}" aria-pressed="${index === 0}">
                <span class="access-radio" aria-hidden="true"></span><span><strong>${title}${value === 'unrestricted' ? '<span class="access-warning">Caution</span>' : ''}</strong><small>${description}</small></span>
              </button>`).join('')}</div>
            <p class="access-note">How strictly this is enforced depends on the harness. The task’s Technical info shows exactly what applied.</p>
          </section>
          <details class="new-advanced">
            <summary><span class="disclosure-mark" aria-hidden="true"></span>Advanced — model, effort, turn limit</summary>
            <div class="advanced-fields">
              <div class="advanced-row"><span>Reasoning effort</span><span id="effort-control">${HF.select('Reasoning effort', ['Default', 'medium', 'low', 'high', 'xhigh'])}</span></div>
              <div class="advanced-row"><span>Model</span><span>${HF.select('Model', ['Default', 'Configured model'])}</span></div>
              <div class="advanced-row" id="turn-control"><span>Turn limit</span><input type="number" id="turn-limit" placeholder="Empty uses the default"></div>
              <label class="advanced-check"><input type="checkbox" id="allow-network"><span>Allow network</span></label>
              <label class="advanced-check" id="approval-control"><input type="checkbox"><span>Ask before each eligible action</span></label>
            </div>
          </details>
        </div>
        <footer class="native-dialog-footer">
          <span class="keyboard-hint"><kbd>⌘</kbd><kbd>↩</kbd> to start</span>
          <span class="footer-spacer"></span>
          ${b('Cancel', 'close-modal', 'secondary')}
          ${actionButton(state === 'busy' ? 'Starting…' : 'Start', 'start-session', 'primary', true, state === 'busy' ? '' : 'Start session')}
        </footer>
      </div>`, 'New session dialog');
  };

  if (typeof document.addEventListener === 'function') document.addEventListener('click', event => {
    const agent = event.target.closest('.new-agent-card:not(:disabled)');
    if (agent) {
      document.querySelectorAll('.new-agent-card').forEach(card => {
        card.classList.toggle('selected', card === agent);
        card.setAttribute('aria-pressed', card === agent ? 'true' : 'false');
      });
    }
    const access = event.target.closest('.access-option');
    if (access) {
      document.querySelectorAll('.access-option').forEach(option => {
        option.classList.toggle('selected', option === access);
        option.setAttribute('aria-pressed', option === access ? 'true' : 'false');
      });
    }
  });

  HF.renderLaunch = state => {
    if (['library', 'empty', 'read-error'].includes(state)) return HF.app(`<div class="toolbar"><h2>Workflows</h2><span class="spacer"></span>${b('Generate workflow', 'route:workflow-launch/generate', 'primary')}</div><div class="reading">${state === 'empty' ? HF.empty('No workflows yet', 'Create a workflow to reuse a graph of nodes and transitions.', b('New workflow', 'route:workflow-editor/empty')) : state === 'read-error' ? HF.banner('Could not read workflows. ' + b('Retry', 'feedback:Library retry requested'), true) : `<div class="card"><h3>Development workflow</h3><p>Plan, implement, and review a change.</p><span class="caption">Revision 4 · 5 nodes</span><div class="inline" style="margin-top:16px">${b('Edit', 'route:workflow-editor/saved')}${b('Run', 'route:workflow-launch/launch', 'primary')}</div></div>`}</div>`);
    const variant = state === 'generate' ? 'Generate workflow' : state === 'propose' ? 'Propose changes' : 'Run workflow';
    return HF.sheet(`<h2>${variant}</h2><p class="muted">Development workflow · Revision 4</p><label class="form-field">Task<textarea id="launch-task">Review session persistence and implement verified improvements.</textarea></label>${HF.field('Repository', '/Example/HarflowMac')}${HF.select('Access level', ['read_only', 'write_in_repo', 'publish', 'unrestricted'])}<h3>Orchestrator</h3>${HF.select('Harness', ['claude', 'codex', 'vibe'])}${HF.select('Model', ['Default', 'Configured model'])}<div class="card"><h4>Review</h4><p>5 graph nodes · 1 on-demand node</p><p class="caption">The orchestrator coordinates the plan and task assignments.</p></div>${state === 'validation' ? HF.banner('Choose a repository before starting.', true) : ''}<div class="footer">${b('Cancel', 'close-modal')}${b(state === 'busy' ? 'Starting…' : variant === 'Run workflow' ? 'Run' : variant, 'launch-workflow', 'primary')}</div>`, 'launch-sheet');
  };

  HF.renderSettings = state => {
    const recovery = state.startsWith('recovery-');
    const harness = !recovery && !['general', 'runtime-retry'].includes(state);
    const activeTab = harness ? 'harnesses' : 'general';
    const content = recovery ? HF.renderStateRecovery(state) : harness ? HF.harnesses(state) : HF.general(state);
    return nativeSurface('settings', `
      <nav class="settings-tabs" aria-label="Settings sections">
        ${b('General', 'settings-tab:general', activeTab === 'general' ? 'active' : '')}
        ${b('Harnesses', 'settings-tab:harnesses', activeTab === 'harnesses' ? 'active' : '')}
      </nav>
      <div class="settings-content" id="settings-content">${content}</div>`, 'Settings');
  };

  HF.general = state => `
    <section class="settings-group">
      <h3>Managed runtime</h3>
      <div class="settings-card runtime-card">
        <p>${state === 'runtime-retry' ? 'Runtime preparation failed.' : 'Harflow runtime is ready.'}</p>
        ${state === 'runtime-retry' ? b('Try again', 'feedback:Runtime preparation retry requested') : ''}
        <p class="runtime-detail">The app prepares its paired runtime automatically. MCP registrations are managed in Harnesses.</p>
      </div>
    </section>
    <section class="settings-group">
      <h3>Behaviour</h3>
      <div class="settings-card behaviour-card">
        <label class="settings-toggle">Open the window when a task starts<input type="checkbox" checked></label>
        <label class="settings-toggle">Notify when a task finishes<input type="checkbox" checked></label>
      </div>
    </section>`;

  HF.harnesses = state => {
    const busy = state === 'working' || state === 'loading';
    const rows = [
      { name: 'Claude Code', installed: true, status: state === 'outdated' ? 'Registration outdated' : state === 'unknown' ? 'Registration unknown' : state === 'error' ? 'Could not read registration' : state === 'working' ? 'Updating registration…' : 'Installed' },
      { name: 'Codex', installed: false, status: 'Not installed' }
    ];
    return `<section class="harness-settings">
      <header class="harness-heading"><h2>Where harflow is registered as an MCP server</h2>${busy ? '<span class="working-indicator" role="status">Working…</span>' : b('Refresh', 'feedback:Harness status refreshed')}</header>
      <p class="server-path">Server: /Example/bin/harflow</p>
      ${state === 'loading' ? '<div class="harness-loading" role="status">Loading harnesses…</div>' : ''}
      ${state === 'error' ? HF.banner('Registration could not be inspected. Try refreshing.', true) : ''}
      <div class="harness-rows">${rows.map((row, index) => `<div class="harness-row">
        <div class="harness-identity"><strong>${row.name}</strong><span class="${row.installed ? 'harness-installed' : 'harness-unavailable'}">${row.status}</span></div>
        <div class="harness-actions">${actionButton('MCP approvals', 'route:mcp-permissions/default', '', busy)}${actionButton(row.installed ? (state === 'outdated' ? 'Update' : 'Reinstall') : 'Install', 'feedback:Mock harness installation requested', '', busy)}${actionButton('Remove', 'feedback:Mock harness removal requested', 'secondary', busy || !row.installed)}</div>
      </div>`).join('')}</div>
      ${state === 'remove-confirmation' ? `<div class="banner"><h4>Remove Harflow registration?</h4><p>Claude Code will no longer use this registration.</p>${b('Cancel', 'feedback:Removal cancelled')}${b('Remove', 'feedback:Mock registration removed', 'danger')}</div>` : ''}
    </section>`;
  };

  HF.renderMCP = state => {
    const busy = ['loading', 'working'].includes(state);
    const unsupported = state === 'unsupported';
    const button = (label, action, disabled = false, cls = '') => `<button type="button" class="${cls}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    return HF.sheet(`<div class="inline"><h3>Codex MCP approvals</h3><span class="spacer"></span>${busy ? '<span role="status">Working…</span>' : ''}${button('Done', 'close-modal', busy)}</div><p class="muted">Global tool approvals apply across projects and future tasks.</p><p class="caption code">~/.codex/config.toml</p><p>Other harness policies still apply.</p>${unsupported ? HF.banner('This harness does not support global approvals.') : ''}${state === 'error' ? HF.banner('Could not load global approvals. Try refreshing.', true) : ''}<div id="approval-list" style="min-height:150px;max-height:260px;overflow:auto">${state === 'loading' ? HF.skeleton() : `<div class="settings-row"><code>harflow/*</code>${button('Remove', 'remove-approval', busy || unsupported)}</div>`}</div><p class="caption">Use server/* to approve every tool on one server.</p><div class="inline"><input id="approval-entry" aria-label="Approval entry" placeholder="server/tool or server/*" ${busy || unsupported ? 'disabled' : ''}>${button('Add approval', 'add-approval', true)}${button('Refresh', 'feedback:Global approvals refreshed', busy)}</div>`, 'mcp-sheet');
  };

  HF.renderMenu = state => {
    const title = state === 'empty' ? 'Nothing running' : state === 'loading' ? 'Counting running agents…' : '2 running';
    const connected = ['disconnected', 'install-banner'].includes(state) ? 'Engine disconnected · Reconnecting…' : 'harflow connected';
    const notice = state === 'disconnected'
      ? HF.banner('Engine disconnected. Reconnecting…')
      : state === 'install-banner'
        ? HF.banner('Managed runtime is not ready. ' + b('Try again', 'feedback:Runtime retry requested'))
        : '';
    const rows = state === 'loading' ? '<div class="menu-loading" role="status">Loading tasks…</div>' : state === 'empty'
      ? '<div class="menu-empty"><p>No running tasks</p><span>Start a new session to begin.</span></div>'
      : `<section class="menu-section">
          <h3>Running</h3>
          ${menuRunningRow('Fix the login bug', 'grep -rn "login" . · harflow', '00:57')}
          ${menuRunningRow('Refactor the parser', 'Looking at the tokenizer next. · harflow', '00:25')}
        </section>
        <section class="menu-section recent-section">
          <h3>Recent</h3>
          <button type="button" class="menu-recent workflow-recent" data-action="route:workflow-run/running">
            <span class="workflow-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="menu-recent-copy"><strong>release-notes</strong><small>Parallel run · 2 of 3 finished</small><span class="mini-progress"><i></i></span></span><span class="workflow-status" aria-hidden="true"></span>
          </button>
          ${menuRecentRow('Draft release notes', 'harflow · Codex', '3h', 'completed')}
          ${menuRecentRow('Bump dependencies', 'app · Vibe', '1d', 'failed')}
        </section>`;
    return nativeSurface('popover', `
      <header class="menu-header">
        <div><h2>${title}</h2><p><span class="connection-dot ${state === 'disconnected' ? 'offline' : ''}"></span>${connected}</p></div>
        <button type="button" class="menu-add" data-action="route:new-session/default" aria-label="New session"><span class="symbol-plus" aria-hidden="true"></span></button>
      </header>
      ${notice}
      <div class="menu-scroll">${rows}</div>
      <footer class="menu-footer"><button type="button" data-action="route:tasks/populated" class="primary menu-monitor">Open Harflow <span>⌘O</span></button><button type="button" data-action="route:settings/general" class="menu-settings" aria-label="Settings"><span class="symbol-gearshape" aria-hidden="true"></span></button></footer>`, 'Harflow menu bar popover');
  };

  function menuRunningRow(title, detail, duration) {
    return `<button type="button" class="menu-running-card" data-action="route:tasks/populated">
      <span class="running-spinner" aria-hidden="true"></span><span class="menu-running-copy"><strong>${title}</strong><small>${detail}</small></span><time>${duration}</time>
    </button>`;
  }

  function menuRecentRow(title, detail, age, status) {
    return `<button type="button" class="menu-recent" data-action="route:tasks/populated">
      <span class="recent-status ${status}" role="img" aria-label="${status === 'completed' ? 'Completed' : 'Failed'}"><span aria-hidden="true"></span></span><span class="menu-recent-copy"><strong>${title}</strong><small>${detail}</small></span><time>${age}</time>
    </button>`;
  }

  function actionButton(label, action, cls = '', disabled = false, ariaLabel = '') {
    return `<button type="button" class="${cls}" data-action="${action}" ${ariaLabel ? `aria-label="${ariaLabel}"` : ''} ${disabled ? 'disabled' : ''}>${label}</button>`;
  }
})();
