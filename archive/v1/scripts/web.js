(function () {
  // Exploratory Harflow web family (HarflowWeb#1 triggers, HarflowWeb#2 Incoming): the workflow Triggers tab, the
  // trigger editor, the Incoming delivery log, and a failed run opened from a delivery. There is no native source.
  // Fixtures are fixed; the editor draft, filter, selection and Reveal are local state reset on every route render.
  const esc = value => HF.escape(value == null ? '' : String(value));
  const TICKETS = ['HarflowWeb#1', 'HarflowWeb#2'];
  HF.webTickets = TICKETS;
  HF.webStates = ['triggers', 'trigger-editor', 'incoming', 'run-failed'];
  HF.webSecret = 'whsec_7Qm2xk9ZpL4vTn8c';
  HF.webPayloadUrl = 'https://hooks.home.example/hooks/trg_8f2kq1';
  const NOT_DESIGNED_REVIEW = 'Web command review is not designed · mock only';

  // ---- Fixtures -----------------------------------------------------------------------------------------------
  const REPO = '/srv/repos/harflow-mac';
  // Newest first within each group. Titles keep the issue title for display; the Task template is identifiers only.
  const check = (ok, text) => ({ ok, text });
  const payload = body => JSON.stringify(body, null, 2);
  const issuePayload = (assignee, number, action = 'assigned') => payload({ action, issue: { number, assignee: { login: assignee } }, sender: { login: 'hainayanda' } });
  const githubInputs = (task, base, key, value) => [['Repository', REPO], ['Task', task], ['BASE', base], [key, value]];
  HF.webDeliveries = [
    { id: 'd1', group: 'Today', time: '10:04', when: 'Oct 25, 10:04', status: 'Queued', bucket: 'notstarted', title: '#2481 reassigned, new details', sub: 'Bug assigned to me · waits for the 10:02 run', source: 'GitHub · Issue assigned', trigger: 'Bug assigned to me', workflow: 'Fix assigned bug',
      checks: [check(true, 'Signature verified'), check(true, 'New delivery, not seen before'), check(true, 'Conditions matched, 3 of 3'), check(false, 'Active run for issue 2481: waits for the 10:02 run')], inputs: githubInputs('Fix #2481', 'main', 'ISSUE', '2481'), size: '8.4 KB', payload: issuePayload('hainayanda', 2481, 'assigned') },
    { id: 'd2', group: 'Today', time: '10:02', when: 'Oct 25, 10:02', status: 'Started run', bucket: 'started', title: '#2481 Crash when opening a listing with no photos', sub: 'Bug assigned to me · Fix assigned bug', source: 'GitHub · Issue assigned', trigger: 'Bug assigned to me', workflow: 'Fix assigned bug', run: true,
      checks: [check(true, 'Signature verified'), check(true, 'New delivery, not seen before'), check(true, 'Conditions matched, 3 of 3'), check(true, 'No active run for issue 2481')], inputs: githubInputs('Fix #2481', 'main', 'ISSUE', '2481'), size: '8.4 KB', payload: issuePayload('hainayanda', 2481) },
    { id: 'd3', group: 'Today', time: '10:02', when: 'Oct 25, 10:02', status: 'Duplicate', bucket: 'notstarted', title: '#2481 sent again by GitHub', sub: 'Bug assigned to me · same delivery ID as 10:02', source: 'GitHub · Issue assigned', trigger: 'Bug assigned to me', workflow: 'Fix assigned bug',
      checks: [check(true, 'Signature verified'), check(false, 'Delivery ID seen at 10:02: ignored as a duplicate')], inputs: [], inputsNote: 'Nothing was extracted: the delivery was ignored.', size: '8.4 KB', payload: issuePayload('hainayanda', 2481) },
    { id: 'd4', group: 'Today', time: '07:41', when: 'Oct 25, 07:41', status: 'Filtered out', bucket: 'notstarted', title: '#2477 assigned to kevin', sub: 'Bug assigned to me · assignee was kevin', source: 'GitHub · Issue assigned', trigger: 'Bug assigned to me', workflow: 'Fix assigned bug',
      checks: [check(true, 'Signature verified'), check(true, 'New delivery, not seen before'), check(false, 'Conditions did not match: assignee.login was kevin, expected hainayanda')], inputs: [], inputsNote: 'Nothing was extracted: conditions did not match.', size: '8.1 KB', payload: issuePayload('kevin', 2477) },
    { id: 'd5', group: 'Today', time: '07:15', when: 'Oct 25, 07:15', status: 'Started run', bucket: 'started', title: 'Review on #412 by kim', sub: 'Review on my pull request · Address review comments', source: 'GitHub · Pull request review submitted', trigger: 'Review on my pull request', workflow: 'Address review comments',
      checks: [check(true, 'Signature verified'), check(true, 'New delivery, not seen before'), check(true, 'Conditions matched, 2 of 2'), check(true, 'No active run for pull request 412')], inputs: githubInputs('Address review on #412', 'main', 'PULL', '412'), size: '12.2 KB', payload: payload({ action: 'submitted', review: { user: { login: 'kim' }, state: 'changes_requested' }, pull_request: { number: 412 }, sender: { login: 'kim' } }) },
    { id: 'd6', group: 'Earlier', time: 'Oct 24', when: 'Oct 24, 16:20', status: 'Started run', bucket: 'started', title: '/harflow fix 2470', sub: 'Slack /harflow fix · Fix assigned bug', source: 'Slack · Slash command', trigger: 'Slack /harflow fix', workflow: 'Fix assigned bug',
      checks: [check(true, 'Signing secret verified'), check(true, 'Timestamp within 5 minutes'), check(true, 'Conditions matched, 1 of 1')], inputs: [['Repository', REPO], ['Task', 'Fix #2470'], ['BASE', 'main'], ['ISSUE', '2470']], size: '0.6 KB', payload: payload({ command: '/harflow', text: 'fix 2470', channel_name: 'ios-dev', user_name: 'hainayanda' }) },
    { id: 'd7', group: 'Earlier', time: 'Oct 23', when: 'Oct 23, 18:05', status: 'Rejected', bucket: 'rejected', title: "Signature didn't match", sub: 'Release webhook · check the secret on the sender', source: 'Webhook', trigger: 'Release webhook', workflow: 'Draft release notes',
      checks: [check(false, "Signature didn't match: check the secret on the sender"), check(false, 'Nothing else was checked')], inputs: [], inputsNote: 'Nothing was extracted: the delivery was rejected.', metadataOnly: true, size: '3.0 KB' }
  ];
  HF.webFilters = [['all', 'All'], ['started', 'Started run'], ['notstarted', 'Not started'], ['rejected', 'Rejected']];
  HF.webRejectedCount = () => HF.webDeliveries.filter(delivery => delivery.status === 'Rejected').length;
  HF.webVisibleDeliveries = filter => HF.webDeliveries.filter(delivery => filter === 'all' || delivery.bucket === filter);
  const badgeClass = { 'Started run': 'done', Queued: 'running', Duplicate: 'pending', 'Filtered out': 'unknown', Rejected: 'warning' };
  HF.webTriggers = [
    { id: 't1', name: 'Bug assigned to me', meta: 'GitHub · Issue assigned · Harflow-Dev/HarflowMac', status: 'Started run', badge: 'done', age: '12m', action: 'route:web/trigger-editor' },
    { id: 't2', name: 'Slack /harflow fix', meta: 'Slack · Slash command · #ios-dev', status: 'Filtered out', badge: 'unknown', age: '1d' },
    { id: 't3', name: 'Weekly crash sweep', meta: 'Schedule · Mondays at 09:00 (Asia/Jakarta)', status: 'Paused', badge: 'pending', age: '6d' }
  ];
  HF.webEditorSeed = () => ({
    enabled: true, event: 'Issue assigned', repository: 'Harflow-Dev/HarflowMac',
    conditions: [
      { id: 'c1', path: 'sender.login', op: 'equals', value: 'hainayanda', required: true },
      { id: 'c2', path: 'assignee.login', op: 'equals', value: 'hainayanda' },
      { id: 'c3', path: 'issue.labels[].name', op: 'contains', value: 'bug' }
    ],
    launchFolder: REPO, task: 'Fix #{issue.number}', base: 'repository.default_branch', issue: 'issue.number', key: 'issue.number', concurrency: 'queue'
  });
  HF.webEvents = ['Issue assigned', 'Pull request review submitted', 'Issue comment created', 'Pull request opened'];
  HF.webSources = [['github', 'GitHub'], ['slack', 'Slack'], ['webhook', 'Webhook'], ['schedule', 'Schedule']];
  HF.webConcurrency = [['queue', 'Queue', 'Queue: start after the active run for this issue ends. A delivery GitHub sends twice is ignored as a duplicate.'], ['skip', 'Skip', 'Skip: ignore the delivery and record it. A delivery GitHub sends twice is ignored as a duplicate.'], ['cancel', 'Cancel the running one', 'Cancel the running one: stop the active run for this issue and start the new one. A delivery GitHub sends twice is ignored as a duplicate.']];

  // ---- Local state ---------------------------------------------------------------------------------------------
  const fresh = () => ({ filter: 'all', selected: 'd2', payloadOpen: false, reveal: false, source: 'github', draft: HF.webEditorSeed(), baseline: HF.webEditorSeed(), nextCondition: 4, inputsOpen: true, planOpen: true });
  let ui = fresh();
  HF.resetWeb = () => { ui = fresh(); };
  HF.webState = () => JSON.parse(JSON.stringify({ filter: ui.filter, selected: ui.selected, payloadOpen: ui.payloadOpen, reveal: ui.reveal, source: ui.source, draft: ui.draft, baseline: ui.baseline, dirty: isDirty(), inputsOpen: ui.inputsOpen, planOpen: ui.planOpen, nextCondition: ui.nextCondition }));
  const isDirty = () => JSON.stringify(ui.draft) !== JSON.stringify(ui.baseline);

  // ---- Markup --------------------------------------------------------------------------------------------------
  const icon = {
    chevron: open => `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="${open ? 'M1.8 3.6 5 6.8 8.2 3.6' : 'M3.6 1.8 6.8 5 3.6 8.2'}"/></svg>`,
    plus: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1.5V8.5M1.5 5H8.5"/></svg>',
    minus: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 5H8.5"/></svg>',
    ok: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.4 4.8 9 10 3"/></svg>',
    no: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2 8 8M8 2 2 8"/></svg>',
    info: '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.6"/><path d="M7 6.2V10M7 4V4.1"/></svg>',
    copy: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2"/><path d="M2 8V3.2C2 2.5 2.5 2 3.2 2H8"/></svg>',
    more: '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="3" cy="7" r="1.1"/><circle cx="7" cy="7" r="1.1"/><circle cx="11" cy="7" r="1.1"/></svg>'
  };
  const button = (label, action, cls = '', extra = '') => `<button type="button" class="web-btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;
  const segmented = (label, items, selected, actionFor, cls = '') => `<div class="web-segmented ${cls}" role="group" aria-label="${esc(label)}">${items.map(([id, text]) => `<button type="button" class="web-segment${id === selected ? ' is-selected' : ''}" data-action="${actionFor(id)}" aria-pressed="${id === selected ? 'true' : 'false'}">${esc(text)}</button>`).join('')}</div>`;
  const badge = (text, tone) => `<span class="web-badge ${tone}">${esc(text)}</span>`;
  const row = (label, content, id = '') => `<div class="web-form-row">${id ? `<label for="${id}">${label}</label>` : `<span>${label}</span>`}<span class="web-spacer"></span>${content}</div>`;
  const mono = text => `<span class="web-mono">${esc(text)}</span>`;
  // ---- Shell: title bar and sidebar -----------------------------------------------------------------------------
  // Built here, not from the macOS sidebar helpers, so the macOS actions, ids and fixtures never reach the web
  // specimen. Only visual classes are shared: .task-status, .backend-dot, .window-emblem, the connection indicator
  // and the appearance control. Each state follows its own canvas board.
  const glyph = (viewBox, inner, size = 13) => `<svg class="web-glyph" viewBox="${viewBox}" width="${size}" height="${size}" aria-hidden="true" focusable="false">${inner}</svg>`;
  const glyphs = {
    hide: glyph('0 0 14 14', '<rect x="1.2" y="2" width="11.6" height="10" rx="2"/><path d="M8.6 2.2V11.8"/>', 14),
    plus: glyph('0 0 10 10', '<path d="M5 1.5V8.5M1.5 5H8.5"/>', 11),
    plusSmall: glyph('0 0 10 10', '<path d="M5 1.5V8.5M1.5 5H8.5"/>', 9),
    search: glyph('0 0 14 14', '<circle cx="6" cy="6" r="3.8"/><path d="M9 9 12 12"/>'),
    chevron: glyph('0 0 10 10', '<path d="M1.8 3.6 5 6.8 8.2 3.6"/>', 9),
    inbox: glyph('0 0 14 14', '<path d="M1.8 8.2 3.6 2.6H10.4L12.2 8.2V11.4H1.8ZM1.8 8.2H4.8L5.6 9.6H8.4L9.2 8.2H12.2"/>'),
    workflow: glyph('0 0 14 14', '<g fill="currentColor" stroke="none"><circle cx="7" cy="2.8" r="1.4"/><circle cx="2.8" cy="11" r="1.4"/><circle cx="11.2" cy="11" r="1.4"/></g><path d="M6.4 4.2 3.4 9.6M7.6 4.2 10.6 9.6M4.4 11H9.6" stroke-dasharray="1.6 1.2"/>')
  };
  const titlebar = () => `<div class="web-titlebar web-titlebar-side"><button type="button" class="web-tbtn" data-action="web-mock:Hide sidebar" aria-label="Hide sidebar">${glyphs.hide}</button></div>`;
  const brandBar = () => `<div class="web-titlebar web-titlebar-detail"><span class="web-brand" role="group" aria-label="Harflow"><span class="window-emblem" aria-hidden="true"><img src="assets/branding/menubarTemplate.png" srcset="assets/branding/menubarTemplate@2x.png 2x" alt="" width="20" height="20"></span><span class="web-brand-name">Harflow</span>${HF.connectionIndicator('web', 'connected')}</span></div>`;
  const BOARDS = {
    triggers: { selected: 'Fix assigned bug', workflows: ['Fix assigned bug', 'Address review comments', 'Implement and review'], issue: 2481, run: '03:12', today: [['Address review on #412', 'codex', '2h', 'completed']] },
    'trigger-editor': { selected: 'Fix assigned bug', workflows: ['Fix assigned bug', 'Address review comments', 'Implement and review'], issue: 2481, run: '03:12', today: [] },
    incoming: { incoming: true, workflows: ['Fix assigned bug', 'Address review comments', 'Draft release notes'], issue: 2481, run: '03:12', today: [] },
    'run-failed': { workflows: ['Fix assigned bug', 'Address review comments'], issue: 2488, run: '01:40', today: [['Fix #2481', 'claude', '8m', 'failed'], ['Address review on #412', 'codex', '2h', 'completed']] }
  };
  const taskRow = (title, meta, time, status, harness) => `<div class="web-task-row"><span class="task-status ${status}" aria-hidden="true"></span><div class="web-task-text"><strong>${esc(title)}</strong><span class="web-task-meta">${harness ? `<span class="backend-dot ${harness}" aria-hidden="true"></span>` : ''}<span>${esc(meta)}</span></span></div><span class="web-time">${esc(time)}</span>${status === 'completed' || status === 'failed' ? `<span class="visually-hidden">${status}</span>` : ''}</div>`;
  const group = (name, rows) => `<h2 class="web-side-heading">${name}</h2>${rows}`;
  const sidebar = (name = 'triggers') => {
    const board = BOARDS[name] || BOARDS.triggers, issue = `Fix #${board.issue}`, rejected = HF.webRejectedCount();
    const workflowRow = label => {
      const action = label === 'Fix assigned bug' ? 'route:web/triggers' : `web-mock:${label}`, selected = label === board.selected;
      return `<button type="button" class="web-side-item${selected ? ' is-selected' : ''}" data-action="${action}"${selected ? ' aria-current="page"' : ''}><span class="web-side-glyph">${glyphs.workflow}</span><span class="web-fill">${esc(label)}</span></button>`;
    };
    const today = board.today.length ? group('Today', board.today.map(([title, harness, time, status]) => taskRow(title, `${HF.harnessName(harness)} · harflow-mac`, time, status, harness)).join('')) : '';
    return `<aside class="web-sidebar" aria-label="Sidebar">${titlebar()}<div class="web-sidebar-head"><button type="button" class="web-new-session" data-action="web-mock:New session" aria-label="New session, Command N"><span class="web-accent">${glyphs.plus}</span><span>New session</span><span class="web-spacer"></span><kbd aria-hidden="true">⌘N</kbd></button><div class="web-search-row"><label class="web-search"><span class="web-search-glyph">${glyphs.search}</span><input type="search" disabled placeholder="Search loaded history" aria-label="Search loaded history"></label><button type="button" class="web-filter" data-action="web-mock:Harness filter is not designed on the web" aria-label="Filter tasks by harness, All harnesses"><span class="web-filter-dots" aria-hidden="true"><span class="backend-dot claude"></span><span class="backend-dot codex"></span><span class="backend-dot opencode"></span></span>${glyphs.chevron}</button></div></div><nav class="web-sidebar-list" aria-label="Workflows and runs"><button type="button" class="web-side-item${board.incoming ? ' is-selected' : ''}" data-action="route:web/incoming"${board.incoming ? ' aria-current="page"' : ''}><span class="web-side-glyph">${glyphs.inbox}</span><span class="web-fill">Incoming</span>${rejected ? `<span class="web-count" aria-label="${rejected} rejected">${rejected}</span>` : ''}</button><div class="web-side-heading-row"><h2 class="web-side-heading">Workflows</h2><button type="button" class="web-side-add" data-action="web-mock:New workflow" aria-label="New workflow">${glyphs.plusSmall}</button></div>${board.workflows.map(workflowRow).join('')}${group('Running', taskRow(issue, 'Claude · harflow-mac', board.run, 'running', 'claude'))}${group('Queued', taskRow(issue, 'Pending · waits for the run above', 'now', 'queued'))}${today}</nav><div class="web-sidebar-foot">${HF.appearanceControl({ web: true })}<button type="button" class="web-gear" data-action="web-mock:Settings" aria-label="Settings"><img src="assets/symbols/gearshape-16pt-2x.png" alt=""></button></div></aside>`;
  };
  const header = (title, subtitle, controls, subtitleAttr = '') => `<header class="web-header"><div class="web-title"><h2>${title}</h2><span class="web-sub" ${subtitleAttr}>${subtitle}</span></div>${controls}</header>`;
  const viewTabs = () => segmented('View', [['editor', 'Editor'], ['triggers', 'Triggers']], 'triggers', id => id === 'editor' ? 'web-editor-tab' : 'web-triggers-tab', 'web-view');
  const shell = (name, body) => `<section class="app web-app" data-web-state="${name}" aria-label="Harflow web specimen">${sidebar(name)}<main class="web-detail">${brandBar()}${body}</main></section>`;

  const triggersPage = () => shell('triggers', `${header('Fix assigned bug', 'Revision 4 · Triggers', `<div class="web-actions">${viewTabs()}${button('New trigger', 'web-mock:New trigger', 'glass')}${button('Run', 'web-run', 'primary')}</div>`)}<div class="web-scroll"><div class="web-column"><p class="web-lede">Triggers start this workflow from outside Harflow. Each run uses the workflow's own agents, access and approvals.</p><ul class="web-card web-list" aria-label="Triggers">${HF.webTriggers.map(trigger => `<li><button type="button" class="web-trigger-row" data-action="${trigger.action || `web-mock:${trigger.name}`}"><span class="web-col"><strong>${esc(trigger.name)}</strong><span class="web-secondary">${esc(trigger.meta)}</span></span>${badge(trigger.status, trigger.badge)}<span class="web-age">${esc(trigger.age)}</span><span class="web-chevron" aria-hidden="true">${icon.chevron(false)}</span></button></li>`).join('')}</ul><div class="web-banner" role="note">${icon.info}<div><strong>Webhooks arrive on their own port</strong><span>Harflow listens for deliveries on port 8788 under ${mono('/hooks')}. Expose only that port through your tunnel or proxy; keep this page private.</span></div></div></div></div>`);

  const conditionRow = condition => `<div class="web-form-row web-condition" data-condition="${esc(condition.id)}">${condition.required ? '<span class="web-chip">Actor</span>' : ''}<input class="web-code-input" data-web-field="cond-path" data-id="${esc(condition.id)}" value="${esc(condition.path)}" aria-label="Condition path" ${condition.required ? 'readonly' : ''}><select class="web-select" data-web-field="cond-op" data-id="${esc(condition.id)}" aria-label="Operator" ${condition.required ? 'disabled' : ''}>${['equals', 'contains'].map(op => `<option ${op === condition.op ? 'selected' : ''}>${op}</option>`).join('')}</select><input class="web-code-input" data-web-field="cond-value" data-id="${esc(condition.id)}" value="${esc(condition.value)}" aria-label="Condition value">${condition.required ? '<span class="web-required" title="Required for events anyone can trigger">Required</span>' : `<button type="button" class="web-icon-btn" data-action="web-cond-remove:${esc(condition.id)}" aria-label="Remove condition ${esc(condition.path || 'new')}">${icon.minus}</button>`}</div>`;
  const input = (field, value, label, id) => `<input id="${id}" class="web-code-input" data-web-field="${field}" value="${esc(value)}" ${label ? `aria-label="${esc(label)}"` : ''}>`;
  const editorPage = () => {
    const d = ui.draft, dirty = isDirty();
    const concurrency = HF.webConcurrency.find(([id]) => id === d.concurrency);
    const sourceBody = ui.source === 'github'
      ? `<div class="web-form">${row('Event', `<select id="web-event" class="web-select" data-web-field="event">${HF.webEvents.map(event => `<option ${event === d.event ? 'selected' : ''}>${esc(event)}</option>`).join('')}</select>`, 'web-event')}${row('Repository', input('repository', d.repository, '', 'web-repo'), 'web-repo')}${row('Verification', `<span class="web-secondary">Signature header ${mono('X-Hub-Signature-256')}</span>`)}</div>`
      : `<p class="web-note" role="status" data-web-source-note>${esc(HF.webSources.find(([id]) => id === ui.source)[1])} source settings are not designed. Only GitHub is drawn.</p>`;
    const subtitle = `${dirty ? 'Unsaved changes · ' : ''}Revision 4 · Triggers`;
    return shell('trigger-editor', `${header('Fix assigned bug', subtitle, `<div class="web-actions">${viewTabs()}<span class="web-glass">${button(icon.more, 'web-mock:More trigger actions', 'quiet', 'aria-label="More"')}${button('Discard', 'web-discard', 'quiet', dirty ? '' : 'disabled')}${button('Save', 'web-save', 'quiet', dirty ? '' : 'disabled')}</span>${button('Run', 'web-run', 'primary', dirty ? 'disabled' : '')}</div>`, 'data-web-subtitle')}<div class="web-scroll"><div class="web-editor-page"><nav class="web-crumb" aria-label="Breadcrumb"><button type="button" class="web-link" data-action="route:web/triggers">All triggers</button></nav><div class="web-name-row"><h3>Bug assigned to me</h3><label class="web-check"><input type="checkbox" data-web-field="enabled" ${d.enabled ? 'checked' : ''}><span>Enabled</span></label>${button('Test with sample', 'web-mock:Test with sample · mock only, no run started', 'tinted')}</div><div class="web-editor-grid"><div class="web-col web-stack">
<section class="web-card" aria-labelledby="sec-source"><div class="web-card-body"><span id="sec-source" class="web-label">Source</span>${segmented('Source', HF.webSources, ui.source, id => `web-source:${id}`)}${sourceBody}</div></section>
<section class="web-card" aria-labelledby="sec-cond"><div class="web-card-body"><div class="web-col"><span id="sec-cond" class="web-label">Conditions</span><span class="web-secondary">All must match. A delivery that doesn't match is recorded as Filtered out and starts nothing. Events anyone can trigger need an actor condition.</span></div><div class="web-form" data-conditions>${d.conditions.map(conditionRow).join('')}</div>${button(`${icon.plus} Add condition`, 'web-cond-add', 'plain')}</div></section>
<section class="web-card" aria-labelledby="sec-in"><div class="web-card-body"><div class="web-col"><span id="sec-in" class="web-label">Run inputs</span><span class="web-secondary">What the Run sheet would ask for, filled from the delivery. Setup and teardown get them only as variables. The Task uses identifiers only; delivery text never reaches agents.</span></div><div class="web-form">${row('Repository', input('launchFolder', d.launchFolder, '', 'web-launch'), 'web-launch')}${row('Task', input('task', d.task, '', 'web-task'), 'web-task')}${row(`<span class="web-mono">BASE</span>`, input('base', d.base, 'BASE source field', 'web-base'))}${row(`<span class="web-mono">ISSUE</span>`, input('issue', d.issue, 'ISSUE source field', 'web-issue'))}</div><span class="web-caption">The repository is the launch folder: setup and teardown see it as ${mono('$HARFLOW_LAUNCH_DIR')}.</span></div></section>
<section class="web-card" aria-labelledby="sec-cc"><div class="web-card-body"><span id="sec-cc" class="web-label">When a run is already going</span><div class="web-form">${row('Same run when', input('key', d.key, '', 'web-key'), 'web-key')}</div>${segmented('When a run with the same key is active', HF.webConcurrency.map(([id, label]) => [id, label]), d.concurrency, id => `web-concurrency:${id}`)}<span class="web-caption" data-web-concurrency-caption>${esc(concurrency[2])}</span></div></section></div>
<aside class="web-col web-stack" aria-label="Endpoint and access"><section class="web-card" aria-labelledby="sec-ep"><div class="web-card-body"><span id="sec-ep" class="web-label">Endpoint</span><span class="web-caption">Payload URL</span><div class="web-line"><span class="web-codebox">${esc(HF.webPayloadUrl)}</span>${button(icon.copy, 'web-mock:Payload URL copied · mock only', 'plain', 'aria-label="Copy payload URL"')}</div><span class="web-caption">Secret</span><div class="web-line"><span class="web-codebox" data-web-secret>${ui.reveal ? esc(HF.webSecret) : '••••••••••••••••'}</span>${button('Reveal', 'web-reveal', 'plain', `aria-pressed="${ui.reveal}"`)}${button('Rotate', 'web-mock:Secret rotation requested · mock only', 'plain')}</div><span class="web-caption">In the repository's webhook settings, paste both and choose ${mono('application/json')} and the Issues event.</span></div></section>
<section class="web-card" aria-labelledby="sec-acc"><div class="web-card-body"><span id="sec-acc" class="web-label">Access, from the workflow</span><ul class="web-access"><li><span>Planning</span><span class="web-chip read mono">read_only</span></li><li><span>Implementation</span><span class="web-chip write mono">write_in_repo</span></li><li><span>Review and open PR</span><span class="web-chip publish mono">publish</span></li></ul><span class="web-caption">Caller approvals are on for Review and open PR and can be answered from the Mac app or the web app. Triggered runs use exactly what the workflow sets.</span><button type="button" class="web-link" data-action="web-editor-tab">Change in the editor</button></div></section></aside></div></div></div>`);
  };

  const incomingPage = () => {
    const rows = HF.webVisibleDeliveries(ui.filter), groups = ['Today', 'Earlier'];
    const selected = HF.webDeliveries.find(delivery => delivery.id === ui.selected) || rows[0];
    const list = groups.map(group => { const items = rows.filter(delivery => delivery.group === group); return items.length ? `<li class="web-group-heading"><h3>${group}</h3></li>${items.map(delivery => `<li><button type="button" class="web-delivery${delivery.id === selected.id ? ' is-selected' : ''}" data-action="web-select:${delivery.id}" aria-pressed="${delivery.id === selected.id ? 'true' : 'false'}">${badge(delivery.status, badgeClass[delivery.status])}<span class="web-col"><strong>${esc(delivery.title)}</strong><span class="web-secondary">${esc(delivery.sub)}</span></span><span class="web-age">${esc(delivery.time)}</span></button></li>`).join('')}` : ''; }).join('');
    return shell('incoming', `${header('Incoming', 'Every delivery to every trigger in the last 30 days', segmented('Show', HF.webFilters, ui.filter, id => `web-filter:${id}`))}<div class="web-incoming-body"><ul class="web-deliveries" aria-label="Deliveries">${list}</ul><aside class="web-inspector" aria-labelledby="dl-title" data-web-inspector="${selected.id}">${inspector(selected)}</aside></div>`);
  };
  const inspector = delivery => {
    const checks = delivery.checks.map(c => `<li class="${c.ok ? 'ok' : 'no'}"><span class="web-check-icon" aria-hidden="true">${c.ok ? icon.ok : icon.no}</span><span>${esc(c.text)}${c.ok ? '' : '<span class="web-sr"> (did not pass)</span>'}</span></li>`).join('');
    const inputs = delivery.inputs.length ? `<pre class="web-codebox web-pre">${esc(delivery.inputs.map(([k, v]) => `${k.padEnd(11)} ${v}`).join('\n'))}</pre>` : `<p class="web-caption">${esc(delivery.inputsNote || 'No run inputs.')}</p>`;
    const payloadBlock = delivery.metadataOnly ? `<p class="web-caption" data-web-no-payload>Payload not shown for rejected deliveries. Only the metadata above is kept.</p>` : `<div class="web-line"><button type="button" class="web-disc" data-action="web-payload" aria-expanded="${ui.payloadOpen}" aria-controls="web-payload">${icon.chevron(ui.payloadOpen)}<span>Payload · ${esc(delivery.size)}</span></button>${button(`${icon.copy} Copy`, 'web-mock:Payload copied · mock only', 'plain', 'aria-label="Copy payload"')}</div><pre id="web-payload" class="web-codebox web-pre" ${ui.payloadOpen ? '' : 'hidden'}>${ui.payloadOpen ? esc(delivery.payload) : ''}</pre>`;
    return `<div class="web-col"><h2 id="dl-title">${esc(delivery.title)}</h2><span class="web-secondary">${esc(delivery.source)} · ${esc(delivery.when)}</span></div><div class="web-line">${badge(delivery.status, badgeClass[delivery.status])}${delivery.run ? `<button type="button" class="web-link strong" data-action="route:web/run-failed">Open the run</button>` : ''}</div><div class="web-form">${row('Trigger', `<button type="button" class="web-link" data-action="route:web/trigger-editor">${esc(delivery.trigger)}</button>`)}${row('Workflow', `<span class="web-secondary">${esc(delivery.workflow)}</span>`)}</div><span class="web-label">Checks</span><ol class="web-checks">${checks}</ol><span class="web-label">Run inputs</span>${inputs}${payloadBlock}`;
  };

  const runFailedPage = () => {
    const nodes = [['Start', 'done', ''], ['Planning', 'ok', '00:42'], ['Implementation', 'ok', '06:18'], ['Review and open PR', 'failed', 'Attempt 3'], ['End', 'pending', '']];
    const graph = nodes.map(([name, tone, meta], index) => `<div class="web-node ${tone}${index === 0 || index === 4 ? ' terminal' : ''}"><strong>${name}</strong>${meta ? `<span>${meta}</span>` : ''}</div>`).join('<span class="web-edge" aria-hidden="true"></span>');
    const inputs = [['Task', 'Fix #2481'], ['Repository', REPO], ['BASE', 'main'], ['ISSUE', '2481']];
    return shell('run-failed', `${header(`Fix assigned bug <button type="button" class="web-badge danger web-badge-btn" data-action="web-mock:Recovery options are not designed on the web · mock only" aria-label="Failed. Open recovery options">Failed</button>`, 'Run started 10:02 · harflow-mac · Revision 3 · from Bug assigned to me', `<div class="web-actions">${segmented('View', [['graph', 'Graph'], ['parallel', 'Parallel']], 'graph', id => `web-mock:${id === 'graph' ? 'Graph' : 'Parallel view is not designed on the web'}`, 'web-view')}${button('Run again', 'web-run-again', 'primary')}</div>`)}<div class="web-run-body"><div class="web-run-main"><div class="web-orch"><div class="web-col"><strong>Standalone</strong><span class="web-caption">Outside the workflow path</span></div><div class="web-node orch"><strong>Orchestrator</strong><span>Claude · Stopped</span></div></div><div class="web-graph" role="group" aria-label="Workflow graph">${graph}</div></div><aside class="web-runpane" aria-label="Run details"><div class="web-banner" role="note">${icon.info}<div><strong>Run again uses revision 5</strong><span>This run used revision 3. A new run starts with the same inputs below; the setup command changed, so you review it first.</span></div></div><section><button type="button" class="web-disc" data-action="web-inputs" aria-expanded="${ui.inputsOpen}" aria-controls="web-run-inputs">${icon.chevron(ui.inputsOpen)}<span>Run inputs</span></button><div id="web-run-inputs" class="web-col" ${ui.inputsOpen ? '' : 'hidden'}>${ui.inputsOpen ? `<dl class="web-dl">${inputs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><span class="web-caption">Started by <button type="button" class="web-link" data-action="route:web/trigger-editor">Bug assigned to me</button> from <button type="button" class="web-link" data-action="route:web/incoming">a delivery at 10:02</button>.</span>` : ''}</div></section><section><button type="button" class="web-disc" data-action="web-plan" aria-expanded="${ui.planOpen}" aria-controls="web-plan">${icon.chevron(ui.planOpen)}<span>Plan · 2 of 3 completed</span></button><ol id="web-plan" class="web-plan" ${ui.planOpen ? '' : 'hidden'}>${ui.planOpen ? `<li class="done"><span aria-hidden="true">${icon.ok}</span><span>Reproduce with an empty photo list</span></li><li class="done"><span aria-hidden="true">${icon.ok}</span><span>Guard the gallery against no photos</span></li><li class="failed"><span aria-hidden="true">${icon.no}</span><span>Open the pull request<span class="web-secondary block">gh pr create was denied after 3 attempts.</span></span></li>` : ''}</ol></section></aside></div><footer class="web-summary"><strong>Summary</strong><span>Review and open PR failed: the publish action was rejected. Recover to continue this run, or Run again to start fresh.</span></footer>`);
  };

  HF.renderWeb = state => state === 'trigger-editor' ? editorPage() : state === 'incoming' ? incomingPage() : state === 'run-failed' ? runFailedPage() : triggersPage();

  // ---- Interaction ---------------------------------------------------------------------------------------------
  if (typeof document === 'undefined') return;
  const active = () => HF.route?.screen === 'web';
  const refresh = focusSelector => {
    const app = document.querySelector('.web-app'); if (!app) return;
    const scrolls = [...app.querySelectorAll('.web-scroll, .web-deliveries, .web-inspector, .web-runpane')].map(element => element.scrollTop);
    app.outerHTML = HF.renderWeb(HF.route.state);
    const next = document.querySelector('.web-app'), picker = document.querySelector('#width-picker');
    if (picker) next.style.width = `${picker.value}px`;
    [...next.querySelectorAll('.web-scroll, .web-deliveries, .web-inspector, .web-runpane')].forEach((element, index) => { element.scrollTop = scrolls[index] || 0; });
    if (focusSelector) document.querySelector(`.web-app ${focusSelector}`)?.focus();
  };
  const syncEditor = () => {
    const dirty = isDirty(), app = document.querySelector('.web-app'); if (!app) return;
    const sub = app.querySelector('[data-web-subtitle]'); if (sub) sub.textContent = `${dirty ? 'Unsaved changes · ' : ''}Revision 4 · Triggers`;
    const set = (action, disabled) => { const control = app.querySelector(`[data-action="${action}"]`); if (control) control.disabled = disabled; };
    set('web-discard', !dirty); set('web-save', !dirty); set('web-run', dirty);
    const caption = app.querySelector('[data-web-concurrency-caption]'); if (caption) caption.textContent = HF.webConcurrency.find(([id]) => id === ui.draft.concurrency)[2];
  };
  const toast = text => HF.feedback(text);
  document.addEventListener('click', event => {
    if (!active()) return;
    const target = event.target.closest?.('[data-action^="web-"]'); if (!target || !target.closest('.web-app') || target.disabled) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const [action, ...rest] = target.dataset.action.split(':'), value = rest.join(':');
    const keep = `[data-action="${target.dataset.action}"]`;
    switch (action) {
      case 'web-mock': toast(value.includes('mock only') ? value : `${value} · mock only`); return;
      case 'web-run': case 'web-run-again': toast(NOT_DESIGNED_REVIEW); return;
      case 'web-editor-tab': HF.navigate('workflow-editor', 'saved'); toast('The web editor is not designed · mock only'); return;
      case 'web-triggers-tab': if (HF.route.state !== 'triggers') HF.navigate('web', 'triggers'); return;
      case 'web-filter': ui.filter = value; if (!HF.webVisibleDeliveries(ui.filter).some(delivery => delivery.id === ui.selected)) ui.selected = HF.webVisibleDeliveries(ui.filter)[0].id; refresh(keep); return;
      case 'web-select': ui.selected = value; ui.payloadOpen = false; refresh(keep); return;
      case 'web-payload': ui.payloadOpen = !ui.payloadOpen; refresh(keep); return;
      case 'web-inputs': ui.inputsOpen = !ui.inputsOpen; refresh(keep); return;
      case 'web-plan': ui.planOpen = !ui.planOpen; refresh(keep); return;
      case 'web-source': ui.source = value; refresh(keep); return;
      case 'web-reveal': ui.reveal = !ui.reveal; refresh(keep); toast(ui.reveal ? 'Secret shown · fixed fake value' : 'Secret hidden'); return;
      case 'web-concurrency': ui.draft.concurrency = value; refresh(keep); return;
      case 'web-cond-add': { const id = `c${ui.nextCondition++}`; ui.draft.conditions.push({ id, path: '', op: 'equals', value: '' }); refresh(`[data-condition="${id}"] [data-web-field="cond-path"]`); return; }
      case 'web-cond-remove': { const index = ui.draft.conditions.findIndex(condition => condition.id === value); if (index < 0 || ui.draft.conditions[index].required) return; ui.draft.conditions.splice(index, 1); const next = ui.draft.conditions[index] || ui.draft.conditions[index - 1]; refresh(next ? `[data-condition="${next.id}"] [data-web-field="cond-path"]` : '[data-action="web-cond-add"]'); return; }
      case 'web-save': ui.baseline = JSON.parse(JSON.stringify(ui.draft)); refresh('[data-web-field="enabled"]'); toast('Mock trigger saved'); return;
      case 'web-discard': ui.draft = JSON.parse(JSON.stringify(ui.baseline)); refresh('[data-web-field="enabled"]'); toast('Mock trigger changes discarded'); return;
      default: return;
    }
  }, true);
  document.addEventListener('input', event => {
    if (!active()) return;
    const control = event.target.closest?.('[data-web-field]'); if (!control || !control.closest('.web-app')) return;
    const field = control.dataset.webField, d = ui.draft;
    if (field.startsWith('cond-')) { const condition = d.conditions.find(item => item.id === control.dataset.id); if (condition) condition[{ 'cond-path': 'path', 'cond-op': 'op', 'cond-value': 'value' }[field]] = control.value; }
    else if (field !== 'enabled') d[field] = control.value;
    syncEditor();
  }, true);
  document.addEventListener('change', event => {
    if (!active()) return;
    const control = event.target.closest?.('[data-web-field]'); if (!control || !control.closest('.web-app')) return;
    const field = control.dataset.webField;
    if (field === 'enabled') ui.draft.enabled = control.checked;
    else if (field === 'event') ui.draft.event = control.value;
    else if (field === 'cond-op') { const condition = ui.draft.conditions.find(item => item.id === control.dataset.id); if (condition) condition.op = control.value; }
    syncEditor();
  }, true);
})();
