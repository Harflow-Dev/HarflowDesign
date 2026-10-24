(function () {
  const states = new Map();
  const esc = value => HF.escape(String(value ?? ''));
  const button = HF.button;
  const selectedRoutes = new Set(['selected-node', 'attempts', 'on-demand-not-called', 'on-demand-calls', 'child-session', 'child-workflow', 'missing-task']);
  const terminal = new Set(['completed', 'cancelled']);
  const investigationCall = () => ({ id: 'workflow-investigation-call-1', title: 'Inspect session recovery', backend: 'codex', status: 'completed', result: 'The session state is persisted correctly.' });
  const newState = route => ({ route: route.state, mode: route.state === 'parallel' ? 'parallel' : 'graph', selection: selectedRoutes.has(route.state) ? (route.state.startsWith('on-demand') ? 'on-demand' : 'implementation') : null, nodeType: 'implementation', attempt: route.state === 'attempts' ? 2 : 1, recoveryOpen: route.state === 'attention' || route.state === 'settling', recoveryBusy: route.state === 'settling', requiresAnswer: false, exhaustedRetries: route.state === 'attention', canSkipOptionalReview: route.state === 'attention', extraAttempts: 0, recoveryInstructions: '', expanded: false, showReason: false, goalEditing: false, goal: 'Ship a reliable workflow run with clear activity and recovery.', goalDraft: 'Ship a reliable workflow run with clear activity and recovery.', goalDraftInitialized: false, deciding: ['running', 'starting'].includes(route.state), lastReason: route.state === 'running' ? 'The previous node completed successfully. The orchestrator is evaluating the next assignment.' : '', runReason: route.state === 'attention' ? 'Implementation reached its attempt limit.' : '', recoveryQuestion: '', diagnostics: [], selectedActivation: false, zoom: 1, disclosures: { request: false, goal: false, technical: false }, feedScroll: {}, canvasScroll: 0, canvasScrollLeft: 0, parallelScroll: 0, parallelLaneScrollLeft: 0, sidebarScroll: 0, focusTarget: null });
  const getState = () => {
    const route = HF.route || { state: 'running' };
    if (!states.has(route.state)) states.set(route.state, newState(route));
    return states.get(route.state);
  };
  const status = state => ({ running: 'Running', starting: 'Starting', paused: 'Paused', attention: 'Needs attention', settling: 'Cancelling', completed: 'Completed', cancelled: 'Cancelled', error: 'Unavailable', loading: 'Loading', 'parent-owned': 'Parent controlled' })[state] || 'Running';
  const runTitle = 'Session reliability';
  const icon = (type, extra = '') => `<span class="wf-symbol ${extra}" style="--wf-symbol:url(../assets/symbols/${type}.png)" aria-hidden="true"></span>`;
  const nodeDefinitions = [
    { type: 'start', name: 'Start', x: 28, width: 72, status: 'Completed' },
    { type: 'planning', name: 'Plan', x: 150, backend: 'Codex', status: 'Pending' },
    { type: 'implementation', name: 'Implementation', x: 400, backend: 'Codex', status: 'Running', attempt: true },
    { type: 'review', name: 'Review', x: 650, backend: 'Codex', status: 'Pending' },
    { type: 'end', name: 'End', x: 900, width: 72, status: 'Pending' }
  ];
  function graph(state) {
    const current = getState();
    const nodes = nodeDefinitions.map(node => {
      const isSelected = current.mode === 'graph' && current.selection === node.type;
      const isAttempt = node.attempt && ['attempts', 'selected-node', 'running'].includes(state);
      const recordStatus = node.backend ? resolveTask(node.type, current.attempt).status : state === 'completed' ? 'completed' : state === 'cancelled' ? 'cancelled' : node.status.toLowerCase();
      const nodeStatus = recordStatus[0].toUpperCase() + recordStatus.slice(1);
      const visualStatus = node.type === 'implementation' && state === 'attempts' && current.attempt === 1 ? 'Failed' : nodeStatus;
      const completed = visualStatus === 'Completed';
      const active = visualStatus === 'Running';
      return `<button type="button" class="node ${node.width ? 'wf-terminal' : ''} ${isSelected ? 'selected' : ''} ${active ? 'wf-running-node' : ''} ${completed ? 'wf-completed-node' : ''}" data-action="wr-select:${node.type}" style="left:${node.x}px;${node.width ? `width:${node.width}px` : ''}" aria-label="Select ${node.name}"><span class="wf-node-icon" aria-hidden="true">${icon(node.width && completed ? 'checkmark' : node.type)}</span><strong>${node.name}</strong>${node.backend ? `<span class="wf-backend"><i class="wf-dot codex"></i>${node.backend}</span>` : ''}${node.attempt && isAttempt ? `<small class="wf-node-attempt">Attempt ${current.attempt}</small>` : ''}${node.backend ? `<small>${visualStatus}</small>` : ''}${active && !node.width ? '<span class="wfr-node-spinner wfr-spinner" aria-hidden="true"></span>' : ''}</button>`;
    }).join('');
    const connector = `<svg class="wf-connectors" viewBox="0 0 1050 160" aria-hidden="true"><defs><marker id="wfr-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8"/></marker></defs><path marker-end="url(#wfr-arrow)" d="M100 46 H150 M350 46 H400 M600 46 H650 M850 46 H900"/><path marker-end="url(#wfr-arrow)" d="M850 46 H870 V0 H380 V46 H400"/></svg>`;
    return `<div class="wf-canvas wf-run-canvas" id="workflow-canvas"><div class="wf-graph-inner graph-inner" id="graph-inner" data-zoom="${current.zoom}" style="transform:scale(${current.zoom})">${connector}<div class="wf-graph-row">${nodes}</div></div><div class="wf-graph-controls"><button data-action="wr-zoom:out" aria-label="Zoom out">−</button><button data-action="wr-zoom:reset" aria-label="Reset zoom">${Math.round(current.zoom * 100)}%</button><button data-action="wr-zoom:in" aria-label="Zoom in">+</button></div></div>`;
  }
  function standalone(state) {
    const current = getState();
    const onDemand = ['on-demand-not-called', 'on-demand-calls'].includes(state);
    return `<section class="wf-standalone"><div class="wf-standalone-label"><strong>Standalone</strong><span>Outside the workflow path</span></div><div class="wf-standalone-items"><button type="button" class="wf-standalone-card ${current.selection === 'orchestrator' ? 'selected' : ''}" data-action="wr-select:orchestrator"><span class="wf-orchestrator-icon">${icon('orchestrator')}</span><strong>Orchestrator</strong><img class="wf-lock" src="assets/symbols/lock.png" alt="Always present"><small><i class="wf-dot codex"></i>Codex</small><span class="wf-subtitle">${state === 'attention' ? 'Needs attention' : 'Deciding'}</span></button><button type="button" class="wf-standalone-card wfr-on-demand-card ${current.selection === 'on-demand' ? 'selected' : ''}" data-action="wr-select:on-demand"><span class="wf-orchestrator-icon investigation"><span class="wfr-bolt" aria-hidden="true">ϟ</span></span><strong>Investigation</strong><small><i class="wf-dot"></i></small><span class="wf-subtitle">${state === 'on-demand-calls' ? 'Called' : 'Not called'}</span></button></div></section>`;
  }
  function plan(state) {
    if (state === 'loading') return `<div class="wfr-loading-panel"><div class="wfr-skeleton wide"></div><div class="wfr-skeleton"></div><div class="wfr-skeleton"></div></div>`;
    const completed = state === 'completed' ? 2 : 1;
    const current = getState();
    const parentOwned = ['parent-owned', 'child-workflow'].includes(state);
    const canReviseGoal = ['running', 'paused', 'attention'].includes(state) && !current.recoveryBusy;
    const goal = current.goalEditing ? `<label class="wfr-goal-editor">Revised workflow goal<textarea id="wfr-goal-draft">${esc(current.goalDraft)}</textarea></label><div class="wfr-goal-actions">${button('Cancel', 'wr-goal-cancel', 'quiet')}<button data-action="wr-goal-save" ${current.recoveryBusy || !current.goalDraft.trim() ? 'disabled' : ''}>Save goal</button></div>` : `<p>${esc(current.goal)}</p>${canReviseGoal ? button('Revise goal…', 'wr-goal-edit', 'quiet') : '<p class="wf-help">'+(parentOwned ? 'The owning workflow controls goal revisions.' : 'Goal revisions are unavailable for this run state.')+'</p>'}`;
    return `<div class="wfr-sidebar-default"><details class="wfr-accordion" data-disclosure="request" ${current.disclosures.request ? 'open' : ''}><summary>${parentOwned ? 'Assignment for this child' : 'Original request'}</summary><p>Improve session reliability while preserving recovery behavior.</p></details><details class="wfr-accordion" data-disclosure="goal" ${current.disclosures.goal ? 'open' : ''}><summary>Goal · revision 0</summary>${goal}<details class="wfr-accordion wfr-history"><summary>Revision history</summary><p>Revision 0</p><p>Ship a reliable workflow run with clear activity and recovery.</p></details></details><details class="wf-plan" open><summary><strong>Plan · ${completed} of 2 completed</strong><div class="wf-progress"><span style="width:${completed * 50}%"></span></div></summary><ol><li>${icon('plan-completed', 'wf-plan-done')}<div><strong>Add regression coverage</strong><p class="wf-help">Orchestrator confirmed the successful test result.</p></div></li><li>${icon(state === 'completed' ? 'plan-completed' : 'plan-pending', state === 'completed' ? 'wf-plan-done' : 'wf-plan-pending')}<div><strong>Implement the change</strong></div></li></ol></details><details class="wfr-accordion" data-disclosure="technical" ${current.disclosures.technical ? 'open' : ''}><summary>Technical plan</summary><p>Inspect current behavior, preserve task identity, implement the change, and verify recovery.</p></details></div>`;
  }
  const statusBadge = value => `<span class="wfr-badge ${value.toLowerCase().replace(/\s+/g, '-')}">${value === 'Running' ? '<span class="wfr-spinner" aria-hidden="true"></span>' : ''}${value}</span>`;
  const resolveTask = (type, attempt = 1) => {
    const state = getState();
    if (type === 'on-demand' && state.route === 'on-demand-calls') { const task = investigationCall(); return { ...task, type, attempt: 1, sessionID: task.id }; }
    attempt = type === 'implementation' ? attempt : 1;
    const fixture = HF.workflowNodeFixture(type, state.route, attempt);
    let taskStatus = ['completed', 'cancelled'].includes(state.route) ? state.route : type === 'implementation' ? 'running' : 'pending';
    if (type === 'implementation' && state.route === 'paused') taskStatus = 'paused';
    if (type === 'implementation' && state.route === 'attempts' && attempt === 1) taskStatus = 'failed';
    if (type === 'review' && state.route === 'parallel') taskStatus = 'completed';
    const backend = type === 'implementation' ? 'claude' : 'codex';
    return { ...fixture, status: taskStatus, backend, sessionID: fixture.id, activityFixture: 'native-eight-steps' };
  };
  const taskFixture = (type = getState().nodeType, attempt = getState().attempt) => {
    const task = resolveTask(type, attempt);
    return { ...task, status: task.status[0].toUpperCase() + task.status.slice(1), backend: task.backend[0].toUpperCase() + task.backend.slice(1), repo: 'HarflowMac', taskID: task.id };
  };
  function activity(task) {
    const isEmpty = ['missing-task', 'loading', 'error'].includes(HF.route.state);
    const sharedColumn = HF.renderParallelColumn({ id: task.taskID, title: `${task.title} · ${task.attempt}`, backend: task.backend.toLowerCase(), status: task.status.toLowerCase(), prompt: task.prompt || 'I’ll start by reading the test and the code it exercises.', activity: !isEmpty && task.status.toLowerCase() !== 'pending', sessionID: task.sessionID || task.taskID, activityFixture: 'native-eight-steps', summary: task.status === 'Completed' ? task.result : '' });
    const columns = isEmpty ? `<div class="parallel-empty">Activity unavailable${HF.route.state === 'missing-task' ? ': the task record is not available.' : '.'}</div>` : sharedColumn;
    return `<div class="wfr-selected-activity"><header><strong>${esc(task.title)}</strong>${button('<span class="wf-sr-only">Close selected activity</span>'+icon('close'), 'wr-deselect', 'quiet')}</header>${HF.route.state === 'attempts' && task.type === 'implementation' ? `<label class="wfr-attempt">Attempt<select data-action="wr-attempt"><option value="2" ${task.attempt === 2 ? 'selected' : ''}>Attempt 2 · Running</option><option value="1" ${task.attempt === 1 ? 'selected' : ''}>Attempt 1 · Failed</option></select></label>` : ''}<div class="parallel-app wfr-shared-column"><div class="parallel-app-body"><div class="parallel-lanes">${columns}</div></div></div></div>`;
  }
  function workflowParallelRecords() {
    return [resolveTask('implementation', getState().attempt), resolveTask('review', 1)].map(task => ({ ...task, session: true, summary: task.status === 'completed' ? task.result : '', outcome: '', activity: task.status !== 'pending' }));
  }
  function parallelColumns() {
    const records = workflowParallelRecords();
    const columns = HF.renderParallelColumns('mixed', records);
    return `<div class="parallel-app wfr-parallel-columns"><div class="parallel-app-body">${columns}</div></div>`;
  }
  function openTask() {
    const state = getState();
    const task = resolveTask(state.selection === 'on-demand' ? 'on-demand' : state.nodeType, state.attempt);
    HF.pendingParallelTask = { ...task, time: '9:02 AM', repoPath: '/Users/demo/HarflowMac' };
    HF.navigate('task-detail', task.status);
  }
  function childWorkflow() {
    return `<div class="wfr-child-workflow"><header><strong>Implementation</strong>${button(icon('close')+'<span class="wf-sr-only">Close selected node</span>', 'wr-deselect', 'quiet')}</header><div class="wfr-child-body"><h3>Child workflow</h3><p>This node opens a nested workflow run.</p>${button('Open workflow', 'wr-open-child', 'quiet')}</div></div>`;
  }
  function onDemand(state) {
    const calls = state === 'on-demand-calls';
    const current = getState();
    if (calls) current.callTask = investigationCall();
    return `<div class="wfr-on-demand"><header><strong>Investigation</strong>${button(icon('close')+'<span class="wf-sr-only">Close selected node</span>', 'wr-deselect', 'quiet')}</header><div class="wfr-call-meta"><span>${calls ? '1 call' : '0 calls'}</span><span>Investigation · on demand · Access level: Read-only · network unspecified</span></div>${calls ? `<div class="wfr-call-list"><article class="wfr-call"><h3>#1 · Inspect session recovery ${statusBadge('Completed')}</h3><p>Called by the orchestrator after node</p><p>Investigate recovery failure.</p><p>“The session state is persisted correctly.”</p>${button('Open task', 'wr-open-task', 'link')}</article></div>` : HF.empty('Not called', 'The orchestrator has not called this node.')}</div>`;
  }
  function recovery(state) {
    const current = getState();
    const settling = state === 'settling';
    const disabled = settling || current.recoveryBusy || (current.requiresAnswer && !current.recoveryInstructions?.trim());
    return `<section class="wf-recovery wfr-recovery" role="dialog" aria-label="Recovery options" data-settling="${settling}" data-busy="${current.recoveryBusy}" data-requires-answer="${current.requiresAnswer}"><div class="wf-recovery-head"><strong>Recovery options</strong>${button(icon('close')+'<span class="wf-sr-only">Close recovery options</span>', 'wr-close-recovery', 'quiet')}</div><p class="wf-recovery-message">${icon('attention')} ${esc(current.recoveryQuestion || (settling ? 'Scheduling is paused.' : current.runReason || 'Implementation reached its attempt limit.'))}</p>${settling ? '<p class="wf-help">Waiting for running branches to finish…</p>' : ''}<label>Additional instructions<textarea id="wfr-recovery-instructions" aria-label="Additional instructions">${esc(current.recoveryInstructions || '')}</textarea></label><div class="wf-recovery-controls"><label>Extra attempts: <input id="wfr-extra-attempts" type="number" value="${current.extraAttempts ?? 0}" min="0" max="100" aria-label="Extra attempts"></label>${current.exhaustedRetries ? '<button data-action="wr-recovery-retry" '+(disabled?'disabled':'')+'>Continue with one more retry</button>' : ''}${current.canSkipOptionalReview ? '<button data-action="wr-recovery-skip" '+(disabled?'disabled':'')+'>Proceed without optional reviewer</button>' : ''}<button data-action="wr-recovery-submit" ${disabled ? 'disabled' : ''}>${state === 'attention' ? 'Recover' : 'Resume'}</button></div></section>`;
  }
  function summary(state) {
    const current = getState();
    const expanded = current.expanded;
    const decision = current.deciding ? 'Orchestrator is choosing the next node…' : current.lastReason || current.runReason || (state === 'starting' ? 'Waiting for the first node' : '');
    const preview = current.runReason || status(state).toLowerCase();
    const question = current.recoveryOpen ? current.recoveryQuestion.trim() : '';
    const hiddenPreview = question && preview.trim() === question;
    const hiddenDecision = !current.deciding && !current.lastReason && question && decision.trim() === question;
    const diagnostics = current.diagnostics.map(item => `<article class="wfr-diagnostic"><strong>${esc(item.title)}</strong>${item.outcome ? `<span>${esc(item.outcome)}</span>` : ''}${item.detail ? `<p>${esc(item.detail)}</p>` : ''}</article>`).join('');
    const reason = current.lastReason && current.showReason ? `<div class="wfr-reason-popover" role="status"><strong>Last decision</strong><p>${esc(current.lastReason)}</p>${button('Close','wr-reason-close','quiet')}</div>` : '';
    const showLatest = current.selectedActivation ? button('Show latest nodes','wr-latest-nodes','quiet') : '';
    return `<footer class="wfr-summary ${expanded ? 'expanded' : ''}" id="run-summary"><div class="wfr-summary-head"><strong>Summary</strong><span ${hiddenPreview ? 'style="visibility:hidden" aria-hidden="true"' : ''}>${esc(preview)}</span><span class="spacer"></span>${showLatest}${button(icon(expanded ? 'chevron-down' : 'chevron-up')+`<span class="wf-sr-only">${expanded ? 'Collapse' : 'Expand'} summary</span>`, 'wr-summary', 'quiet')}</div>${expanded ? `<div class="wfr-summary-details">${decision ? `<div class="wfr-decision-line" ${hiddenDecision ? 'style="visibility:hidden" aria-hidden="true"' : ''}>${esc(decision)}${current.lastReason && !current.deciding ? button('Show more','wr-reason','link') : ''}</div>` : ''}${reason}${diagnostics}</div>` : ''}</footer>`;
  }
  HF.renderRun = state => {
    const current = getState(); current.route = state;
    const noView = state === 'loading' || state === 'error';
    const selected = current.mode === 'graph' && current.selection;
    const controls = state === 'error' ? '<button class="wf-capsule" disabled>Pause</button><button class="wf-cancel" disabled>Cancel run</button>' : state === 'parent-owned' ? button('Open root to cancel', 'wr-parent', 'wf-capsule') : ['running', 'starting'].includes(state) ? `${button('Pause', 'wr-pause', 'wf-capsule')}${button('Cancel run', 'wr-cancel', 'wf-cancel')}` : state === 'paused' ? `${button('Resume', 'wr-resume', 'wf-capsule')}${button('Cancel run', 'wr-cancel', 'wf-cancel')}` : terminal.has(state) || noView ? '' : button('Cancel run', 'wr-cancel', 'wf-cancel');
    const activeMode = current.mode;
    const loadingOverlay = `<div class="wfr-loading-canvas wfr-graph-loading" aria-label="Loading workflow run"><div class="wfr-loading-graph">${[true, false, false, true].map((compact, index) => `${index ? '<i class="wfr-loading-connector"></i>' : ''}<div class="wfr-loading-node ${compact ? 'compact' : ''}"><i></i>${compact ? '' : '<i></i>'}</div>`).join('')}</div></div>`;
    const left = state === 'error' ? `<div class="wfr-error-state">${icon('attention')}<h2>Workflow could not be loaded</h2></div>` : state === 'loading' ? loadingOverlay : activeMode === 'parallel' ? `<div class="wfr-parallel">${parallelColumns()}</div>` : `<div class="wfr-run-left">${standalone(state)}${graph(state)}</div>`;
    const sidebar = state === 'error' ? '' : selected ? (['start', 'end', 'orchestrator'].includes(current.selection) ? plan(state) : state === 'child-workflow' ? childWorkflow() : current.selection === 'on-demand' ? onDemand(state.startsWith('on-demand') ? state : 'on-demand-not-called') : activity(taskFixture(current.nodeType, current.attempt))) : state === 'loading' ? `<div class="wfr-inspector-loading"><i class="wfr-loading-heading"></i>${[0,1,2].map(() => '<div class="wfr-loading-row"><i></i><div><i></i><i></i></div></div>').join('')}</div>` : plan(state);
    const attention = state === 'attention' ? button(`${icon('attention')} Needs attention`, 'wr-open-recovery', 'wfr-attention') : '';
    const wideSelection = Boolean(selected && !['start', 'end', 'orchestrator'].includes(current.selection));
    return HF.app(`<header class="wfr-toolbar ${state === 'loading' ? 'wfr-loading-header' : ''}"><div class="wfr-title"><strong>${runTitle}</strong>${statusBadge(status(state === 'error' ? 'running' : state))}<small>Run started 9:02 · HarflowMac</small></div><span class="spacer"></span>${attention}<span class="wfr-view-label">View</span><div class="wfr-view-picker" role="group" aria-label="View">${noView ? '<button class="selected" disabled>Graph</button><button disabled>Parallel</button>' : button('Graph','wr-mode:graph',activeMode==='graph'?'selected':'')+button('Parallel','wr-mode:parallel',activeMode==='parallel'?'selected':'')}</div>${controls}</header><div class="wfr-run-layout ${wideSelection ? 'has-selection' : ''} ${activeMode === 'parallel' ? 'parallel-mode' : ''} ${state === 'error' ? 'error-state' : ''}" data-mode="${activeMode}"><main class="wfr-run-main" id="run-main">${left}</main>${state === 'error' ? '' : `<aside class="wfr-run-sidebar" id="run-sidebar" tabindex="-1">${sidebar}</aside>`}${current.recoveryOpen ? recovery(state) : ''}</div>${summary(state)}`, 'workflow-specimen wfr-specimen', 'Workflow run');
  };
  let lastRouteKey = '';
  HF.workflowRunController = {
    snapshot() { const value = getState(); return { ...value, disclosures: { ...value.disclosures }, diagnostics: value.diagnostics.map(item => ({ ...item })) }; },
    render(state = HF.route?.state) { return state ? HF.renderRun(state) : ''; },
    select(type, render = false) { const value = getState(); value.selection = type; if (['planning','implementation','review'].includes(type)) { if (value.nodeType !== type) value.selectedTask = null; value.nodeType = type; value.selectedTaskType = value.selectedTask ? type : null; delete value.callTask; } if (type === 'on-demand') { value.mode = 'graph'; if (HF.route.state === 'on-demand-calls' && !value.callTask) value.callTask = { id: 'workflow-investigation-call-1', title: 'Investigation', backend: 'codex', status: 'running' }; } if (render) renderCurrent(); return this.snapshot(); },
    deselect(render = false) { const value = getState(); value.selection = null; if (render) renderCurrent(); return this.snapshot(); },
    setMode(mode, render = false) { if (mode === 'graph' || mode === 'parallel') getState().mode = mode; if (render) renderCurrent(); return this.snapshot(); },
    toggleSummary(render = false) { const value = getState(); value.expanded = !value.expanded; if (render) renderCurrent(); return this.snapshot(); },
    setRecovery(open, render = false) { const value = getState(); value.recoveryOpen = Boolean(open); if (render) renderCurrent(); return this.snapshot(); },
    setAttempt(attempt, render = false) { const state = getState(); if (state.route !== 'attempts' || state.selection !== 'implementation' || ![1, 2].includes(Number(attempt))) return this.snapshot(); state.attempt = Number(attempt); if (render) renderCurrent(); return this.snapshot(); },
    setDisclosure(key, open, render = false) { if (Object.prototype.hasOwnProperty.call(getState().disclosures, key)) getState().disclosures[key] = Boolean(open); if (render) renderCurrent(); return this.snapshot(); },
    setSummaryState(values, render = false) { Object.assign(getState(), values); if (render) renderCurrent(); return this.snapshot(); }
  };
  HF.resetWorkflowRun = route => {
    const key = route?.screen === 'workflow-run' ? `${route.state}/${route.theme}` : '';
    if (key !== lastRouteKey) states.clear();
    lastRouteKey = key;
    if (key && !states.has(route.state)) states.set(route.state, newState(route));
  };
  HF.afterWorkflowRunRender = () => {
    const current = getState();
    const split = document.querySelector('.wfr-run-layout');
    if (!split) return;
    split.querySelectorAll('.parallel-feed-scroll').forEach(feed => {
      const id = feed.closest('.parallel-lane')?.dataset.taskId;
      feed.scrollTop = id ? current.feedScroll[id] ?? 0 : 0;
    });
    const canvas = split.querySelector('.wf-run-canvas');
    if (canvas) { canvas.scrollTop = current.canvasScroll; canvas.scrollLeft = current.canvasScrollLeft; }
    const parallel = split.querySelector('.wfr-parallel-columns .parallel-app-body');
    if (parallel) parallel.scrollTop = current.parallelScroll;
    const lanes = split.querySelector('.wfr-parallel-columns .parallel-lanes');
    if (lanes) lanes.scrollLeft = current.parallelLaneScrollLeft;
    const sidebar = split.querySelector('#run-sidebar');
    if (sidebar) sidebar.scrollTop = current.sidebarScroll;
  };

  function renderCurrent() {
    const stage = document.querySelector('#stage');
    if (!stage || HF.route?.screen !== 'workflow-run') return;
    const current = getState();
    document.querySelectorAll('.wfr-specimen .parallel-feed-scroll').forEach(feed => { current.feedScroll[feed.closest('.parallel-lane')?.dataset.taskId || ''] = feed.scrollTop; });
    current.canvasScroll = document.querySelector('.wf-run-canvas')?.scrollTop ?? current.canvasScroll;
    current.canvasScrollLeft = document.querySelector('.wf-run-canvas')?.scrollLeft ?? current.canvasScrollLeft;
    current.parallelScroll = document.querySelector('.wfr-parallel-columns .parallel-app-body')?.scrollTop ?? current.parallelScroll;
    current.parallelLaneScrollLeft = document.querySelector('.wfr-parallel-columns .parallel-lanes')?.scrollLeft ?? current.parallelLaneScrollLeft;
    current.sidebarScroll = document.querySelector('#run-sidebar')?.scrollTop ?? current.sidebarScroll;
    stage.innerHTML = HF.renderRun(HF.route.state);
    const app = stage.querySelector('.app'); if (app) app.style.width = document.querySelector('#width-picker').value + 'px';
    HF.afterWorkflowRunRender();
    const restore = getState().focusTarget;
    if (restore) { stage.querySelector(`[data-action="${CSS.escape(restore)}"]`)?.focus({ preventScroll: true }); getState().focusTarget = null; }
  }
  function runHandler(event) {
    const target = event.target.closest('[data-action^="wr-"], .parallel-lane [data-action^="parallel-"]');
    if (!target || !target.isConnected || HF.route?.screen !== 'workflow-run') return;
    const [action, value] = target.dataset.action.split(':');
    if (action === 'wr-attempt' && event.type === 'change') { event.preventDefault(); event.stopImmediatePropagation(); if (getState().route !== 'attempts' || getState().selection !== 'implementation' || ![1, 2].includes(Number(target.value))) return; getState().attempt = Number(target.value); getState().scrollTop = document.querySelector('.parallel-feed-scroll')?.scrollTop || 0; renderCurrent(); return; }
    if (event.type !== 'click') return;
    event.preventDefault(); event.stopImmediatePropagation();
    const current = getState();
    if (target.dataset.action.startsWith('parallel-')) {
      const [parallelAction, id] = target.dataset.action.split(':');
      if (parallelAction === 'parallel-open' && target.closest('.wfr-selected-activity')) { openTask(); return; }
      if (parallelAction === 'parallel-open') {
        current.selectedTask = workflowParallelRecords().find(task => task.id === id) || null;
        current.selectedTaskType = current.selectedTask?.type || 'implementation'; current.nodeType = current.selectedTaskType; delete current.callTask; current.selection = current.nodeType; current.mode = 'graph'; current.focusTarget = 'wr-deselect'; renderCurrent();
      } else HF.feedback('Mock parallel action recorded');
      return;
    }
    switch (action) {
      case 'wr-select':
        current.selection = current.selection === value ? null : value; current.focusTarget = current.selection ? 'wr-deselect' : 'wr-select:implementation';
        if (['planning','implementation','review'].includes(value)) { if (current.nodeType !== value) current.selectedTask = null; current.nodeType = value; current.selectedTaskType = current.selectedTask ? value : null; delete current.callTask; }
        if (value === 'on-demand') current.mode = 'graph';
        break;
      case 'wr-deselect': current.selection = null; current.focusTarget = 'wr-select:implementation'; break;
      case 'wr-mode': current.mode = value; current.focusTarget = `wr-mode:${value}`; break;
      case 'wr-summary': current.expanded = !current.expanded; current.focusTarget = 'wr-summary'; break;
      case 'wr-reason': current.showReason = true; current.focusTarget = 'wr-reason-close'; break;
      case 'wr-reason-close': current.showReason = false; current.focusTarget = 'wr-reason'; break;
      case 'wr-latest-nodes': current.selectedActivation = true; HF.feedback('Latest nodes selected'); renderCurrent(); return;
      case 'wr-open-recovery': current.recoveryOpen = true; current.focusTarget = 'wr-close-recovery'; break;
      case 'wr-close-recovery': current.recoveryOpen = false; current.focusTarget = 'wr-open-recovery'; break;
      case 'wr-recovery-submit': case 'wr-recovery-retry': case 'wr-recovery-skip': if (target.disabled) return; HF.feedback('Mock recovery request recorded · no run state changed'); return;
      case 'wr-goal-edit': if (!current.goalEditing) current.goalDraft = current.goal; current.goalEditing = true; current.focusTarget = 'wr-goal-cancel'; break;
      case 'wr-goal-cancel': current.goalEditing = false; current.focusTarget = 'wr-goal-edit'; break;
      case 'wr-goal-save': if (target.disabled) return; HF.feedback('Mock goal revision requested · current goal unchanged'); return;
      case 'wr-open-child': HF.feedback('Child workflow selected · mock only'); return;
      case 'wr-cancel': if (HF.route.state === 'parent-owned') return; HF.feedback('Mock cancellation requested · run state unchanged'); return;
      case 'wr-pause': case 'wr-resume': HF.feedback('Mock run action recorded · run state unchanged'); return;
      case 'wr-parent': HF.feedback('Parent workflow selected · mock only'); return;
      case 'wr-retry': HF.feedback('Mock reload requested'); return;
      case 'wr-open-task': openTask(); return;
      case 'wr-zoom': { const next = value === 'reset' ? 1 : Math.max(.5, Math.min(2, current.zoom + (value === 'in' ? .25 : -.25))); current.zoom = Math.round(next * 100) / 100; renderCurrent(); return; }
      default: return;
    }
    renderCurrent();
  }
  document.addEventListener('click', runHandler, true);
  document.addEventListener('change', runHandler, true);
  document.addEventListener('input', event => {
    if (HF.route?.screen !== 'workflow-run') return;
    const current = getState();
    if (event.target.id === 'wfr-goal-draft') { current.goalDraft = event.target.value; const save = document.querySelector('[data-action="wr-goal-save"]'); if (save) save.disabled = current.recoveryBusy || !event.target.value.trim(); }
    if (event.target.id === 'wfr-recovery-instructions') { current.recoveryInstructions = event.target.value; const panel = event.target.closest('.wfr-recovery'); panel?.querySelectorAll('[data-action^="wr-recovery-"]').forEach(button => { button.disabled = current.recoveryBusy || (current.requiresAnswer && !event.target.value.trim()); }); }
    if (event.target.id === 'wfr-extra-attempts') { const parsed = Number.parseInt(event.target.value, 10); current.extraAttempts = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0; }
  }, true);
  document.addEventListener('change', event => {
    if (HF.route?.screen !== 'workflow-run' || event.target.id !== 'wfr-extra-attempts') return;
    const current = getState();
    const parsed = Number.parseInt(event.target.value, 10);
    current.extraAttempts = Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : 0;
    event.target.value = String(current.extraAttempts);
  }, true);
  document.addEventListener('scroll', event => {
    if (HF.route?.screen !== 'workflow-run') return;
    const current = getState();
    const feed = event.target.closest?.('.parallel-feed-scroll');
    if (feed) { const id = feed.closest('.parallel-lane')?.dataset.taskId || ''; current.feedScroll[id] = feed.scrollTop; current.scrollTop = feed.scrollTop; }
    if (event.target.matches?.('.wf-run-canvas')) { current.canvasScroll = event.target.scrollTop; current.canvasScrollLeft = event.target.scrollLeft; }
    if (event.target.matches?.('.wfr-parallel-columns .parallel-app-body')) current.parallelScroll = event.target.scrollTop;
    if (event.target.matches?.('.wfr-parallel-columns .parallel-lanes')) current.parallelLaneScrollLeft = event.target.scrollLeft;
    if (event.target.matches?.('#run-sidebar')) current.sidebarScroll = event.target.scrollTop;
  }, true);
  document.addEventListener('click', event => {
    const canvas = event.target.closest('.wf-run-canvas');
    if (HF.route?.screen !== 'workflow-run' || !canvas || event.target.closest('[data-action]')) return;
    const current = getState();
    if (current.selection) { event.preventDefault(); event.stopImmediatePropagation(); current.selection = null; current.focusTarget = 'wr-select:implementation'; renderCurrent(); }
  }, true);
  document.addEventListener('toggle', event => { const key = event.target.dataset.disclosure; if (key && HF.route?.screen === 'workflow-run') getState().disclosures[key] = event.target.open; }, true);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || HF.route?.screen !== 'workflow-run') return;
    if (event.target.closest('input,textarea,select,[contenteditable="true"],[role="dialog"].sheet')) return;
    const current = getState();
    if (current.recoveryOpen) { event.preventDefault(); current.recoveryOpen = false; current.focusTarget = 'wr-open-recovery'; renderCurrent(); }
    else if (current.selection && current.mode === 'graph') { event.preventDefault(); current.selection = null; current.focusTarget = 'wr-select:implementation'; renderCurrent(); }
  }, true);
})();
