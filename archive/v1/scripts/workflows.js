(function () {
  const b = HF.button;
  const c = HF.chip;

  const nodes = [
    { name: 'Start', type: 'start', x: 28, width: 72, cls: 'wf-terminal' },
    { name: 'Plan', type: 'planning', x: 150, backend: 'codex' },
    { name: 'Implementation', type: 'implementation', x: 400, backend: 'codex' },
    { name: 'Review', type: 'review', x: 650, backend: 'codex' },
    { name: 'End', type: 'end', x: 900, width: 72, cls: 'wf-terminal' }
  ];

  // One deterministic task projection drives graph labels, selection and attempts.
  HF.workflowNodeFixture = (type, state, attempt = 2) => {
    const definitions = {
      planning: { title: 'Plan', prompt: 'Plan the implementation and regression checks for the workflow change.', result: 'Implementation plan: update the workflow behavior, add focused regression coverage, and verify the result.' },
      implementation: { title: 'Implementation', prompt: 'Implement the change and add the regression coverage from the plan.', result: 'The implementation and regression coverage are complete.' },
      review: { title: 'Review', prompt: 'Review the implementation against the plan and report verified findings.', result: 'The implementation follows the plan.' }
    };
    const definition = definitions[type] || { title: 'Task', prompt: 'Complete the assigned workflow task.', result: 'The assigned task is complete.' };
    const progressed = ['running', 'selected-node', 'attempts', 'child-session'].includes(state);
    let status = state === 'completed' ? 'completed' : ['cancelled', 'paused'].includes(state) ? state : progressed && type === 'planning' ? 'completed' : progressed && type === 'implementation' ? 'running' : 'pending';
    if (type === 'implementation' && progressed && attempt === 1) status = 'failed';
    return { ...definition, id: 'workflow-' + type + '-attempt-' + attempt, type, backend: 'Codex', status, attempt, hasAttempts: progressed && type === 'implementation' };
  };

  HF.workflowTaskActivity = task => {
    if (task.status === 'pending') return HF.empty('Not started', 'No task activity is available for this node.');
    const label = HF.escape(task.backend), title = HF.escape(task.title);
    return `<div class="activity-origin"><span>Attempt ${task.attempt}</span><span>Beginning of activity</span></div><div class="prompt">${HF.escape(task.prompt)}</div><div class="meta"><span class="backend-dot codex" aria-hidden="true"></span><strong>${label}</strong>${c(task.status, task.status)}</div>${task.status === 'failed' ? HF.banner(`${title} attempt ${task.attempt} failed before producing a result.`, true) : task.status === 'completed' ? `<div class="result"><h3>Final response</h3><p>${HF.escape(task.result)}</p></div>` : task.status === 'running' ? `<p>${title} is in progress. The final response is not available yet.</p>` : `<p>${title} is ${HF.escape(task.status)}.</p>`}`;
  };

  HF.graph = (editor, state) => {

    const graphNodes = nodes.map((node, index) => {
      const fixture = HF.workflowNodeFixture(node.type, state);
      const status = editor ? '' : fixture.status[0].toUpperCase() + fixture.status.slice(1);
      return `<button type="button" data-action="select-node:${node.type}" class="node ${node.cls || ''} ${['selected-node', 'attempts'].includes(state) && index === 2 ? 'selected' : ''}" style="left:${node.x}px;${node.width ? `width:${node.width}px` : ''}" ${editor ? 'draggable="true"' : ''} aria-label="Select ${node.name}"><span class="wf-node-icon" aria-hidden="true"><span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/${node.type}.png)"></span></span><strong>${node.name}</strong>${node.backend ? `<span class="wf-backend"><i class="wf-dot codex"></i>Codex</span>` : ''}${status && node.backend ? `<small>${status}</small>` : ''}</button>`;
    }).join('');
    const connector = `<svg class="wf-connectors" viewBox="0 0 1050 160" aria-hidden="true"><defs><marker id="wf-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8"/></marker></defs><path marker-end="url(#wf-arrow)" d="M100 46 H150 M350 46 H400 M600 46 H650 M850 46 H900"/><path marker-end="url(#wf-arrow)" d="M850 46 H860 Q870 46 870 36 V0 Q870 -10 860 -10 H380 Q370 -10 370 0 V36 Q370 46 380 46 H400"/></svg>`;
    return `<div class="wf-canvas" id="workflow-canvas"><div class="wf-graph-inner graph-inner" id="graph-inner">${connector}<div class="wf-graph-row">${graphNodes}</div></div>${editor ? `<div class="wf-add-palette" aria-label="Add to workflow"><span>Add</span>${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/planning.png)"></span>Planning', 'add-node', 'quiet')}${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/implementation.png)"></span>Implementation', 'add-node', 'quiet')}${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/review.png)"></span>Review', 'add-node', 'quiet')}${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/task.png)"></span>Task', 'add-node', 'quiet')}${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/workflow.png)"></span>Run workflow', 'feedback:Run workflow added', 'quiet')}<span class="wf-palette-divider"></span><button type="button" disabled>Start</button>${b('Parallel group', 'feedback:Parallel group added', 'quiet')}<button type="button" disabled>End</button></div>` : ''}${editor ? '<div class="wf-validation-status">Drag nodes onto the canvas; connect their dots.</div>' : ''}<div class="wf-graph-controls">${b('−', 'zoom:out')}${b('100%', 'zoom:reset')}${b('+', 'zoom:in')}</div></div>`;
  };

  HF.updateWorkflowConnectors = graph => {
    const row = graph.querySelector('.wf-graph-row');
    const paths = graph.querySelectorAll('.wf-connectors > path');
    if (!row || paths.length !== 2) return;
    const cards = [...row.querySelectorAll('.node')];
    const port = (node, output) => ({ x: node.offsetLeft + (output ? node.offsetWidth : 0), y: node.offsetTop + node.offsetHeight / 2 });
    paths[0].setAttribute('d', cards.slice(0, -1).map((node, i) => {
      const from = port(node, true), to = port(cards[i + 1], false);
      return `M${from.x} ${from.y} H${(from.x + to.x) / 2} V${to.y} H${to.x}`;
    }).join(' '));
    const from = port(cards[3], true), to = port(cards[2], false), top = Math.min(from.y, to.y) - 56;
    paths[1].setAttribute('d', `M${from.x} ${from.y} H${from.x + 20} V${top} H${to.x - 30} V${to.y} H${to.x}`);
  };

  HF.editorInspector = (state) => {
    const title = state === 'connection' ? 'Connection' : state === 'branch' ? 'Branch' : state === 'child-reference' ? 'Child workflow' : state === 'missing-reference' ? 'Missing reference' : state === 'on-demand' ? 'On-demand node' : state === 'node' ? 'Implementation' : 'Orchestrator';
    if (state === 'connection') return `<aside class="wf-inspector" id="workflow-inspector"><h2>${title}</h2>${HF.select('Condition', ['approved', 'rejected', 'always'])}${HF.field('From', 'Review')}${HF.field('To', 'End')}${b('Delete connection', 'feedback:Connection removed', 'danger')}</aside>`;
    if (state === 'missing-reference') return `<aside class="wf-inspector" id="workflow-inspector"><h2>${title}</h2>${HF.banner('Referenced workflow is unavailable. Choose an existing workflow to repair this reference.', true)}${HF.select('Workflow', ['Select workflow', 'Development workflow'])}</aside>`;
    if (state === 'branch') return `<aside class="wf-inspector" id="workflow-inspector"><h2>${title}</h2>${HF.field('Branch name', 'Review changes')}${HF.select('Branch strategy', ['All branches', 'First successful'])}${HF.field('Repository claim', 'Sources/')}</aside>`;
    const orchestrator = state === 'orchestrator' || !['node', 'on-demand', 'child-reference'].includes(state);
    return `<aside class="wf-inspector" id="workflow-inspector"><h2>${title}</h2>${orchestrator ? '<p class="wf-help">Every workflow has one. It can\'t be removed.</p>' : ''}<h3>Harness</h3><div class="wf-form-group">${wfPickerRow('Harness', ['Claude', 'Codex', 'OpenCode', 'Vibe', 'Antigravity'], 'Codex')}${wfPickerRow('Model', ['Default'], 'Default')}${wfPickerRow('Effort', ['Default', 'Low', 'Medium', 'High', 'Xhigh'], 'Default')}</div><label class="wf-check"><input type="checkbox" disabled> ${orchestrator ? 'Caller approvals: ask before each eligible action' : 'Ask before each eligible action'}</label><p class="wf-help">Caller approvals are unsupported or unmeasured for this harness.</p><details class="wf-disclosure"><summary>Fallback harnesses (0)</summary><p class="wf-help">No fallback harnesses configured.</p>${HF.select('Fallback harness', ['Select harness', 'Claude', 'Codex'])}</details><h3>Instructions</h3><textarea class="wf-instructions" aria-label="Instructions">${orchestrator ? '' : 'Inspect the current implementation and report verified findings.'}</textarea><h3>Limits</h3><div class="wf-form-group">${wfLimitRow('Decision attempts', 3)}${wfLimitRow('Inspections', 20)}${wfLimitRow('On-demand calls per decision', 5)}${wfLimitRow('Parallel agents', 4)}${wfLimitRow('Transition limit', 100)}</div>${state === 'child-reference' ? HF.select('Workflow reference', ['Development workflow', 'Review workflow']) : ''}</aside>`;
  };

  function wfRow(label, value) { return `<div class="wf-form-row"><span>${label}</span>${value}</div>`; }
  function wfPickerRow(label, choices, selected) { return wfRow(label, `<select aria-label="${label}" ${choices.length === 1 ? 'disabled' : ''}>${choices.map(choice => `<option ${choice.toLowerCase() === selected.toLowerCase() ? 'selected' : ''}>${choice}</option>`).join('')}</select>`); }
  function wfLimitRow(label, value) { const max = ({'Decision attempts':10, Inspections:1000, 'On-demand calls per decision':50, 'Parallel agents':64, 'Transition limit':10000})[label] || 100; return wfRow(label, `<input type="number" aria-label="${label}" value="${value}" min="1" max="${max}">`); }

  HF.onDemandRail = (editor = true, state = 'orchestrator') => `<section class="wf-standalone"><div class="wf-standalone-label"><strong>Standalone</strong><span>Outside the workflow path</span></div><div class="wf-standalone-items"><button type="button" class="wf-standalone-card" data-action="select-node:orchestrator"><span class="wf-orchestrator-icon"><span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/orchestrator.png)"></span></span><strong>Orchestrator</strong><img class="wf-lock" src="assets/symbols/lock.png" alt="Always present"><small><i class="wf-dot codex"></i>Codex</small><span class="wf-subtitle">${editor ? 'Decides each node' : 'Deciding'}</span></button>${editor ? '<button type="button" class="wf-add-tile" data-action="add-on-demand" aria-label="Add on-demand node"><span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/plus.png)"></span></button>' : ''}</div></section>`;

  HF.renderEditor = state => HF.app(`<header class="wf-toolbar"><div class="wf-title"><strong>code-review</strong><span>Revision 0 · Workflow editor</span></div><span class="spacer"></span>${b('<span class="wf-symbol wf-action-icon" style="--wf-symbol:url(../assets/symbols/sparkles.png)" aria-hidden="true"></span>Edit with agent', 'builder', 'wf-tinted')}<details class="wf-menu"><summary aria-label="More workflow actions"><span class="wf-symbol wf-action-icon" style="--wf-symbol:url(../assets/symbols/ellipsis.png)" aria-hidden="true"></span></summary>${b('Duplicate', 'feedback:Workflow duplicate created')}${b('Delete', 'feedback:Mock workflow deletion requested', 'danger')}</details>${b('Discard', 'feedback:Edits discarded', 'wf-capsule')}${b('Save', 'save-workflow', 'wf-capsule')}${b('<span class="wf-symbol wf-action-icon" style="--wf-symbol:url(../assets/symbols/play.png)" aria-hidden="true"></span>Run', 'route:workflow-run/running', 'wf-run-button')}</header>${['validation', 'conflict', 'read-error'].includes(state) ? HF.banner(({ validation: 'Workflow is not valid: connect the final node to End.', conflict: 'This workflow changed on disk. Reload before saving.', 'read-error': 'Could not read the workflow definition. Try reloading.' })[state] + ' ' + b('Reload', 'feedback:Workflow reload requested'), true) : ''}<div class="wf-editor-layout">${state === 'loading' ? `<div class="wf-editor-loading">${HF.skeleton()}</div>` : `<main class="wf-editor-main">${HF.onDemandRail(true, state)}${state === 'empty' ? HF.empty('Create a workflow', 'Add a node or generate a workflow from a task.', b('Add node', 'add-node')) : HF.graph(true, state)}</main>`}${HF.editorInspector(state)}${['builder-conversation', 'proposal-ready'].includes(state) ? HF.builder(state) : ''}</div>`, 'workflow-specimen', 'Workflow editor');

  HF.builder = state => `<aside class="builder-conversation"><h3>Edit with agent</h3><div class="prompt">Add a specialist review before the workflow finishes.</div><p>I can add an on-demand specialist task and retain the existing graph.</p>${state === 'proposal-ready' ? `<div class="card"><h4>Proposal ready</h4><p>Add “Specialist review” to the on-demand rail.</p>${b('Apply proposal', 'feedback:Proposal applied to mock workflow', 'primary')}${b('Dismiss', 'feedback:Proposal dismissed')}</div>` : HF.skeleton()}<textarea aria-label="Builder message" placeholder="Describe a workflow change"></textarea>${b('Send', 'feedback:Builder message added')}</aside>`;

  HF.runPlan = state => `<details class="wf-plan" open><summary><strong>Plan · 1 of 2 completed</strong><div class="wf-progress"><span style="width:50%"></span></div></summary><ol><li><span class="wf-symbol wf-plan-done" style="--wf-symbol:url(../assets/symbols/plan-completed.png)" role="img" aria-label="Completed by orchestrator"></span><div><strong>Add regression coverage</strong><p class="wf-help">Orchestrator confirmed the successful test result.</p></div></li><li><span class="wf-symbol wf-plan-pending" style="--wf-symbol:url(../assets/symbols/plan-pending.png)" role="img" aria-label="Pending"></span><div><strong>Implement the change</strong></div></li></ol></details>`;

  HF.runSelected = (state, type = 'implementation') => `<div class="wf-selected"><header><strong>${state.startsWith('on-demand') ? 'Specialist review' : state === 'child-workflow' ? 'Child workflow' : HF.escape(HF.workflowNodeFixture(type, state).title)}</strong>${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/close.png)" aria-hidden="true"></span><span class="wf-sr-only">Show workflow summary</span>', 'deselect-node', 'quiet')}</header>${HF.workflowNodeFixture(type, state).hasAttempts ? `<label class="form-field">Attempt<select id="attempt-picker" data-node-type="${type}" data-workflow-state="${state}"><option>Attempt 2 · Running</option><option>Attempt 1 · Failed</option></select></label>` : ''}<div class="reading">${state === 'on-demand-not-called' ? HF.empty('Not called', 'The orchestrator has not called this task.') : state === 'on-demand-calls' ? `<h3>Calls</h3>${[2, 1].map((n, i) => `<div class="card"><strong>Call ${n}</strong> ${c(i ? 'completed' : 'running', i ? 'completed' : 'running')}<p class="caption">Assigned to Codex · ${i ? '14:20' : '14:32'}</p><p>Origin: orchestrator</p><p>Reason: verify persistence guarantees.</p>${i ? '<p>Result: no additional findings.</p>' : ''}${b('Open task', 'route:task-detail/running')}</div>`).join('')}` : state === 'missing-task' ? HF.empty('Activity unavailable', 'The task record is not available.') : state === 'child-workflow' ? HF.empty('Child workflow', 'Open the nested run to inspect its graph.', b('Open workflow', 'feedback:Child workflow selected')) : state === 'child-session' ? `<h3>Child session</h3>${c('running', 'running')}<p>Task assigned to Codex.</p>${b('Open task', 'route:task-detail/spawned')}${HF.workflowTaskActivity(HF.workflowNodeFixture('implementation', 'child-session'))}` : HF.workflowTaskActivity(HF.workflowNodeFixture(type, state))}</div></div>`;

  HF.recovery = (state, options = {}) => {
    const settling = options.settling ?? state === 'settling';
    const needsAnswer = options.requiresAnswer ?? false;
    const exhaustedRetries = options.exhaustedRetries ?? false;
    const canSkipOptionalReview = options.canSkipOptionalReview ?? false;
    const busy = options.busy ?? false;
    const disabled = settling || busy || needsAnswer ? 'disabled' : '';
    const command = (options.status ?? state) === 'failed' ? 'recover' : 'resume';
    return `<section class="wf-recovery" data-settling="${settling}" data-requires-answer="${needsAnswer}" data-busy="${busy}"><div class="wf-recovery-head"><strong>Recovery options</strong>${b('<span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/close.png)" aria-hidden="true"></span><span class="wf-sr-only">Close recovery options</span>', 'close-recovery', 'quiet')}</div><p class="wf-recovery-message"><span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/attention.png)" aria-hidden="true"></span>${settling ? 'Scheduling is paused.' : 'Implementation reached its attempt limit.'}</p>${settling ? '<p class="wf-help">Waiting for running branches to finish…</p>' : ''}<label>Additional instructions<textarea id="recovery-instructions" aria-label="Additional instructions"></textarea></label><div class="wf-recovery-controls"><label>Extra attempts: <input type="number" aria-label="Extra attempts" value="0" min="0" max="100" step="1"></label>${exhaustedRetries ? `<button class="wf-secondary-control" data-action="recover:retry" ${disabled}>Continue with one more retry</button>` : ''}${canSkipOptionalReview ? `<button class="wf-secondary-control" data-action="recover:skip" ${disabled}>Proceed without optional reviewer</button>` : ''}<button data-action="recover:${command}" ${disabled}>${command === 'recover' ? 'Recover' : 'Resume'}</button></div></section>`;
  };

  HF.renderRun = state => {
    const selected = ['selected-node', 'attempts', 'on-demand-not-called', 'on-demand-calls', 'child-session', 'child-workflow', 'missing-task'].includes(state);
    const statusIsSettled = ['completed', 'failed', 'cancelled', 'cancelling'].includes(state);
    const runControls = [
      ['running', 'starting'].includes(state) ? '<button>Pause</button>' : '',
      state === 'parent-owned' ? b('Open root to cancel', 'route:workflow-run/running') : statusIsSettled || ['loading', 'error'].includes(state) ? '' : b('Cancel run', 'feedback:Workflow cancellation requested', 'wf-cancel'),
      state === 'cancelling' ? '<span class="wf-cancelling">Cancelling…</span>' : ''
    ].join('');
    const sidebar = ['attention', 'settling'].includes(state) ? HF.recovery(state) + (state === 'attention' ? '' : HF.runPlan(state)) : selected ? HF.runSelected(state) : HF.runPlan(state);
    return HF.app(`<header class="wf-toolbar wf-run-toolbar"><div class="wf-title"><strong>code-review</strong>${state === 'attention' ? '<button type="button" class="chip warning wf-recovery-badge" data-action="open-recovery" aria-label="Open recovery options"><span class="wf-symbol" style="--wf-symbol:url(../assets/symbols/attention.png)"></span>Needs attention</button>' : ''}</div><span class="spacer"></span><span class="wf-view-label">View</span><div class="wf-view-picker" role="group" aria-label="View">${b('Graph', 'run-mode:graph', state !== 'parallel' ? 'selected' : '')}${b('Parallel', 'run-mode:parallel', state === 'parallel' ? 'selected' : '')}</div>${runControls}</header>${state === 'parent-owned' ? HF.banner('This child run is controlled by its parent workflow. ' + b('Open parent', 'feedback:Parent workflow selected')) : ''}${state === 'error' ? HF.banner('Workflow run could not be loaded. ' + b('Retry', 'feedback:Workflow retry requested'), true) : ''}<div class="wf-run-layout"><main class="wf-run-main" id="run-main">${HF.onDemandRail(false, state)}${state === 'loading' ? HF.skeleton() : state === 'parallel' ? HF.lanes('mixed') : HF.graph(false, state)}</main><aside class="wf-run-sidebar" id="run-sidebar">${sidebar}</aside></div><footer class="wf-summary"><div class="wf-summary-head">${b('Summary', 'toggle-summary', 'quiet')}<span class="spacer"></span>${b('<span class="wf-symbol wf-action-icon" style="--wf-symbol:url(../assets/symbols/chevron-up.png)" aria-hidden="true"></span><span class="wf-sr-only">Expand summary</span>', 'toggle-summary', 'quiet')}</div><div id="run-summary" hidden class="wf-summary-details"><h3>Run summary</h3><p>2 tasks · Completed: Add regression coverage · Pending: Implement the change</p></div></footer>`, 'workflow-specimen wf-run-specimen', 'Workflow run');
  };
})();
