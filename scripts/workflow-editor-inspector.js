(function () {
  const escape = value => HF.escape(value == null ? '' : String(value));
  const value = (fields, key, fallback = '') => fields[key] == null ? fallback : String(fields[key]);
  const checked = (fields, key) => fields[key] === true || fields[key] === 'true' || fields[key] === 1 || fields[key] === '1';
  const option = (current, entries) => entries.map(([id, label, disabled]) =>
    `<option value="${escape(id)}" ${String(current) === String(id) ? 'selected' : ''} ${disabled ? 'disabled' : ''}>${escape(label)}</option>`
  ).join('');
  const input = (fields, key, label, opts = {}) => `<label class="editor-inspector-field${opts.inline ? ' is-inline' : ''}${opts.hideLabel ? ' is-label-hidden' : ''}"><span>${escape(label)}</span><input data-editor-field="${escape(key)}" aria-label="${escape(label)}" type="${opts.type || 'text'}" value="${escape(value(fields, key))}" ${opts.placeholder ? `placeholder="${escape(opts.placeholder)}"` : ''} ${opts.min != null ? `min="${opts.min}"` : ''} ${opts.max != null ? `max="${opts.max}"` : ''} ${opts.disabled ? 'disabled' : ''}></label>`;
  const textarea = (fields, key, label, opts = {}) => `<label class="editor-inspector-field editor-inspector-textarea${opts.hideLabel ? ' is-label-hidden' : ''}${opts.instruction ? ' is-instruction' : ''}"><span>${escape(label)}</span><textarea data-editor-field="${escape(key)}" aria-label="${escape(label)}" rows="${opts.rows || 5}" ${opts.disabled ? 'disabled' : ''}>${escape(value(fields, key))}</textarea></label>`;
  const select = (fields, key, label, entries, opts = {}) => `<label class="editor-inspector-field${opts.inline ? ' is-inline' : ''}${opts.hideLabel ? ' is-label-hidden' : ''}"><span>${escape(label)}</span><select data-editor-field="${escape(key)}" aria-label="${escape(label)}" ${opts.disabled ? 'disabled' : ''}>${option(value(fields, key), entries)}</select></label>`;
  const toggle = (fields, key, label, opts = {}) => `<label class="editor-inspector-toggle${opts.disabled ? ' is-disabled' : ''}"><input data-editor-field="${escape(key)}" aria-label="${escape(label)}" type="checkbox" ${checked(fields, key) ? 'checked' : ''} ${opts.disabled ? 'disabled' : ''}><span>${escape(label)}</span></label>`;
  const help = text => `<p class="editor-inspector-help">${escape(text)}</p>`;
  const heading = text => `<h3>${escape(text)}</h3>`;
  const deleteButton = (kind, label = 'Delete step') => `<button type="button" class="editor-inspector-delete" data-action="editor-delete" data-editor-kind="${escape(kind)}">${escape(label)}</button>`;
  const group = body => `<div class="editor-inspector-group">${body}</div>`;
  const candidate = fields => {
    const backend = value(fields, 'backend', 'codex');
    const supportsModel = backend !== 'vibe';
    const modelDisabled = fields.modelDisabled === undefined ? true : checked(fields, 'modelDisabled');
    const approvalSupported = checked(fields, 'callerApprovalSupported');
    const turnLimitSupported = fields.turnLimitSupported === undefined ? ['claude', 'vibe'].includes(backend) : checked(fields, 'turnLimitSupported');
    const effortLevels = backend === 'antigravity' ? ['low', 'medium', 'high'] : ['low', 'medium', 'high', 'xhigh'];
    const rows = select(fields, 'backend', 'Agent', [
      ['claude', 'Claude'], ['codex', 'Codex'], ['opencode', 'OpenCode'], ['vibe', 'Vibe'], ['antigravity', 'Antigravity']
    ], { inline: true }) + (supportsModel ? `${select(fields, 'model', 'Model', [['', 'Default']], { inline: true, disabled: modelDisabled })}${select(fields, 'effort', 'Effort', [['', 'Default'], ...effortLevels.map(level => [level, level.charAt(0).toUpperCase() + level.slice(1)])], { inline: true })}` : '') + (turnLimitSupported ? input(fields, 'turnLimit', 'Turn limit', { type: 'number', min: 1, max: 100000, inline: true }) : '');
    const fallbacks = Number(value(fields, 'fallbackCount', '0')) > 0
      ? Array.from({ length: Math.min(Number(value(fields, 'fallbackCount', '0')), 8) }, (_, index) => {
        const prefix = `fallback${index}`;
        const fallbackBackend = value(fields, `${prefix}Backend`, 'codex');
        return `<div class="editor-inspector-fallback">${select(fields, `${prefix}Backend`, `Fallback ${index + 1}`, [['claude', 'Claude'], ['codex', 'Codex'], ['opencode', 'OpenCode'], ['vibe', 'Vibe'], ['antigravity', 'Antigravity']])}${fallbackBackend === 'vibe' ? '' : `${select(fields, `${prefix}Model`, `Fallback ${index + 1} model`, [['', 'Default']], { disabled: true })}${select(fields, `${prefix}Effort`, `Fallback ${index + 1} effort`, [['', 'Default'], ...((fallbackBackend === 'antigravity' ? ['low', 'medium', 'high'] : ['low', 'medium', 'high', 'xhigh']).map(level => [level, level.charAt(0).toUpperCase() + level.slice(1)]))])}`}</div>`;
      }).join('')
      : `${help('No fallback agents configured.')}<button type="button" class="editor-inspector-secondary" data-action="editor-add-fallback">Add fallback</button>`;
    return `${group(rows)}${toggle(fields, 'callerApprovals', 'Caller approvals: ask before each eligible action', { disabled: !approvalSupported })}${!approvalSupported ? help('Caller approvals are unsupported or unmeasured for this agent.') : checked(fields, 'callerApprovals') ? help('Caller approvals require an empty turn limit. Clear the explicit cap before starting.') : ''}<details class="editor-inspector-disclosure"><summary>Fallback agents (${escape(value(fields, 'fallbackCount', '0'))})</summary>${fallbacks}</details>`;
  };
  const limits = fields => group(
    input(fields, 'maxDecisionAttempts', 'Decision attempts', { type: 'number', min: 1, max: 10 }) +
    input(fields, 'maxInspections', 'Inspections', { type: 'number', min: 1, max: 1000 }) +
    input(fields, 'maxOnDemandCalls', 'On-demand calls per decision', { type: 'number', min: 1, max: 50 }) +
    input(fields, 'maxParallel', 'Parallel agents', { type: 'number', min: 1, max: 64 }) +
    input(fields, 'maxTransitions', 'Transition limit', { type: 'number', min: 1, max: 10000 })
  );
  const section = (title, content) => `${heading(title)}${content}`;
  const accessEntries = role => [
    ...(role === 'implementation' ? [] : [['read_only', 'Read only']]),
    ['write_in_repo', 'Write in repository'], ['publish', 'Publish'], ['unrestricted', 'Unrestricted']
  ];

  HF.editorInspectorDefaults = (kind, id) => {
    const base = { id: id || '', title: '', instructions: '', backend: 'codex', model: '', effort: '', callerApprovals: false, callerApprovalSupported: false, fallbackCount: 0 };
    if (kind === 'orchestrator') return { ...base, title: 'Orchestrator', instructions: '', maxDecisionAttempts: 3, maxInspections: 20, maxOnDemandCalls: 5, maxParallel: 4, maxTransitions: 100, modelDisabled: true };
    if (kind === 'connection') return { id: id || 'review-implementation', source: 'review', target: 'implementation', condition: 'The review finds concrete changes needed. Implement the review feedback, then request another review.', defaultPath: false, isBackward: false, limitRetries: false, maxRetries: 3 };
    if (kind === 'on-demand') return { ...base, id: id || 'investigation', title: 'Investigation', callCondition: '', instructions: 'Investigate the problem and report evidence.', access: 'read_only', network: 'inherit', session: 'agent_decides', execution: 'headless', modelDisabled: true };
    if (kind === 'child-reference' || kind === 'missing-reference') return { id: id || 'workflow', title: 'Run workflow', instructions: '', workflowId: '', workflowName: '', orchestratorMode: 'child', childSessionPolicy: 'agent_decides', showsChildSessionPolicy: true, timeLimitEnabled: false, timeLimitSeconds: 900, maxAttempts: 3, optional: false, availableWorkflows: '', accessRequirements: 'Select a saved workflow to validate its full dependency tree.', isMissing: kind === 'missing-reference' };
    if (kind === 'parallel' || kind === 'parallel-group') return { id: id || 'parallel-end', title: 'Parallel end', groupLabel: '', branchCount: 0, boundaryType: id === 'parallel-start' ? 'parallel_start' : 'parallel_end', branchSelection: 'all', selectionGuidance: '', hasPartner: false };
    if (kind === 'start' || kind === 'end') return { id: id || kind, title: kind === 'start' ? 'Start' : 'End' };

    const role = id === 'planning' ? 'planning' : id === 'review' ? 'review' : id === 'task' ? 'task' : 'implementation';
    const instructions = {
      planning: 'Inspect the task and produce a concrete task list. Do not modify files.',
      implementation: 'Implement the planned tasks. Report completed task IDs and observed validation evidence.',
      review: 'Review the implementation and validation. Report approval or concrete changes needed. Do not modify files.',
      task: ''
    }[role];
    return { ...base, id: id || 'implementation', title: role === 'planning' ? 'Plan' : role === 'review' ? 'Review' : role === 'task' ? 'Task' : 'Implementation', role, optional: false, instructions, backend: 'codex', model: '', effort: '', callerApprovals: false, callerApprovalSupported: false, fallbackCount: 0, execution: 'prefer_subagent', nativeSubagentsAvailable: false, session: 'agent_decides', timeLimitEnabled: false, timeLimitSeconds: 900, maxAttempts: 3, maxContextQuestions: 10, access: role === 'planning' || role === 'review' ? 'read_only' : role === 'task' ? 'publish' : 'write_in_repo', requireTasks: true, requireTechnicalPlan: true, modelDisabled: true, turnLimitSupported: false, accessRequirements: 'Select a saved workflow to validate its full dependency tree.' };
  };

  HF.renderEditorInspector = (kind, fields = {}) => {
    const f = fields || {};
    let title = value(f, 'title', 'Orchestrator');
    let body = '';
    if (kind === 'parallel-group') kind = 'parallel';
    if (kind === 'orchestrator') {
      title = 'Orchestrator';
      body = `${help("Every workflow has one. It can't be removed.")}${section('Agent', candidate(f))}${section('Instructions', textarea(f, 'instructions', 'Instructions', { rows: 5, hideLabel: true, instruction: true }))}${section('Limits', limits(f))}${help('Select a node or connection to edit its instructions and conditions.')}`;
    } else if (kind === 'connection') {
      title = 'Connection';
      const backward = checked(f, 'isBackward');
      body = `<p class="editor-inspector-endpoints">${escape(value(f, 'source'))} → ${escape(value(f, 'target'))}</p>${textarea(f, 'condition', 'Condition', { rows: 3 })}${toggle(f, 'defaultPath', 'Default path')}${(backward || checked(f, 'limitRetries')) ? `${toggle(f, 'limitRetries', 'Limit retries')}${checked(f, 'limitRetries') ? `${input(f, 'maxRetries', 'Max retries', { type: 'number', min: 0, max: 1000, disabled: !backward })}${help(backward ? '0 disables this retry. Node attempt and workflow limits still apply.' : 'This limit applies when the connection returns to an earlier step.')}` : ''}` : ''}${help('The orchestrator chooses exactly one outgoing path from ordinary nodes. Parallel start runs every branch; its matching Parallel end waits for all branches. Returning to an earlier step creates a loop automatically; Harflow enforces connected paths and attempt limits.')}`;
    } else if (kind === 'on-demand') {
      title = 'On-demand node';
      body = `${input(f, 'title', 'Node name')}${section('When to call', textarea(f, 'callCondition', 'When to call', { rows: 3 }))}${help('The orchestrator reads this guidance to decide when to call the node.')}${section('Instructions', textarea(f, 'instructions', 'Worker instructions', { rows: 4 }))}${section('Agent', candidate(f))}${section('When called', select(f, 'access', 'Access', accessEntries('task')) + select(f, 'network', 'Network', [['inherit', 'Inherit'], ['on', 'On'], ['off', 'Off']]) + select(f, 'session', 'Session', [['agent_decides', 'Agent decides'], ['fresh', 'Fresh'], ['resume', 'Resume']]) + select(f, 'execution', 'Execution', [['headless', 'Headless'], ['prefer_subagent', 'Prefer orchestrator subagent']]))}${help('No connections. It runs only when the orchestrator calls it, one call at a time, and an unused node never blocks the run from finishing.')}`;
    } else if (kind === 'child-reference' || kind === 'missing-reference') {
      title = 'Run workflow';
      const workflowOptions = [['', 'Select workflow']];
      if (value(f, 'workflowId')) workflowOptions.push([value(f, 'workflowId'), kind === 'missing-reference' ? 'Unavailable workflow' : value(f, 'workflowName', value(f, 'workflowId'))]);
      const choices = value(f, 'availableWorkflows').split('|').map(entry => entry.split(':')).filter(parts => parts[0] && parts[1]);
      workflowOptions.push(...choices);
      body = `${input(f, 'title', 'Step name')}${select(f, 'workflowId', 'Saved workflow', workflowOptions)}${kind === 'missing-reference' ? `${help(`Unavailable workflow: ${value(f, 'workflowId')}. Choose an existing workflow to repair this reference.`)}${select(f, 'replacementWorkflowId', 'Replace all matching steps', [['', 'Select workflow'], ...choices])}` : ''}${select(f, 'orchestratorMode', 'Orchestrator mode', [['child', 'Child orchestrator'], ['current', 'Current orchestrator']])}${checked(f, 'showsChildSessionPolicy') && value(f, 'orchestratorMode') === 'child' ? `${select(f, 'childSessionPolicy', 'Child conversation', [['fresh', 'Fresh'], ['resume', 'Resume'], ['agent_decides', 'Agent decides']])}${help('Resume reuses the latest compatible completed conversation from this step in this parent run. Each invocation starts a new workflow. Explicit Resume refuses when reuse is unavailable.')}` : ''}${help(value(f, 'orchestratorMode') === 'current' ? "The current orchestrator directs the child's nodes in its own workflow boundary." : 'The child uses its saved orchestrator and its own planning context.')}${section('Assignment guidance', textarea(f, 'instructions', 'Assignment guidance', { rows: 4 }))}${toggle(f, 'optional', 'Optional')}${help("Optional branches follow the workflow's failure safety rules.")}${toggle(f, 'timeLimitEnabled', 'Time limit')}${checked(f, 'timeLimitEnabled') ? input(f, 'timeLimitSeconds', 'Duration', { type: 'number', min: 1, max: 86400 }) : ''}${input(f, 'maxAttempts', 'Attempts per visit', { type: 'number', min: 1, max: 10000 })}<div class="editor-inspector-access-requirements">${heading('Workflow tree access requirements')}${help(value(f, 'accessRequirements', 'Select a saved workflow to validate its full dependency tree.'))}</div>${help('Harness, access, network and session settings remain owned by the saved child workflows.')}`;
    } else if (kind === 'parallel') {
      title = value(f, 'title', value(f, 'boundaryType') === 'parallel_start' ? 'Parallel start' : 'Parallel end');
      const start = value(f, 'boundaryType') === 'parallel_start';
      body = `${input(f, 'groupLabel', 'Group name')}${`<p class="editor-inspector-branch-count">${escape(value(f, 'branchCount', '0'))} ${value(f, 'branchCount', '0') === '1' ? 'branch' : 'branches'}</p>`}${start ? `${select(f, 'branchSelection', 'Branch selection', [['all', 'All branches'], ['orchestrator', 'Orchestrator selects']])}${section('Selection guidance (optional)', textarea(f, 'selectionGuidance', 'Selection guidance', { rows: 3 }))}${help('Select applicable branch entries before dispatch. Optional steps still follow their normal failure rules.')}` : ''}${checked(f, 'hasPartner') ? `<button type="button" class="editor-inspector-secondary" data-action="editor-select-partner">Select ${start ? 'Parallel end' : 'Parallel start'}</button>` : help('Missing matching parallel boundary. Repair the pair before saving.')}${help(start ? 'Branch membership is fixed for each invocation. Re-entering the group may make a new selection.' : 'Waits for every selected branch to resolve before the orchestrator chooses the next step.')}${deleteButton(kind, 'Delete boundary')}`;
    } else if (kind === 'start' || kind === 'end') {
      title = kind === 'start' ? 'Start' : 'End';
      body = help(`${title} has no settings.`);
    } else {
      title = value(f, 'role', 'implementation');
      title = title.charAt(0).toUpperCase() + title.slice(1);
      body = `${input(f, 'title', 'Step name', { hideLabel: true, placeholder: 'Step name' })}${select(f, 'role', 'Role', [['planning', 'Planning'], ['implementation', 'Implementation'], ['review', 'Review'], ['task', 'Task']], { inline: true })}${value(f, 'role') === 'planning' ? `${toggle(f, 'requireTasks', 'Require task list')}${toggle(f, 'requireTechnicalPlan', 'Require technical plan')}${help("Disable both for a brief result without replacing the run's existing plan or task list.")}` : ''}${toggle(f, 'optional', 'Optional')}${help('Continue if this step fails within a parallel branch. Required branches must succeed.')}${section('Instructions', textarea(f, 'instructions', 'Step instructions', { rows: 5, hideLabel: true, instruction: true }))}${section('Agent', candidate(f))}${select(f, 'execution', 'Execution', [['headless', 'Headless'], ['prefer_subagent', 'Prefer orchestrator subagent']])}${help(checked(f, 'nativeSubagentsAvailable') ? 'Uses the owning orchestrator when the harness and settings are supported; otherwise starts Headless.' : 'No certified native adapter is available. This preference falls back to Headless.')}${select(f, 'session', 'Session', [['agent_decides', 'Let agent decide'], ['resume', 'Resume this node'], ['fresh', 'Fresh'], ['continue_previous', 'Continue previous node', !checked(f, 'canContinuePrevious')]], { disabled: false })}${value(f, 'session') === 'continue_previous' ? help('Reuse the previous serial node’s compatible session. Otherwise start Fresh; fallbacks also start Fresh.') : ''}${toggle(f, 'timeLimitEnabled', 'Time limit')}${checked(f, 'timeLimitEnabled') ? `${input(f, 'timeLimitSeconds', 'Duration', { type: 'number', min: 1, max: 86400 })}${help('Stop and settle the attempt before retrying or using a fallback.')}` : ''}${input(f, 'maxAttempts', 'Attempts per visit', { type: 'number', min: 1, max: 10000 })}${input(f, 'maxContextQuestions', 'Context questions', { type: 'number', min: 1, max: 100 })}${select(f, 'access', 'Access', accessEntries(value(f, 'role', 'task')) )}`;
    }
    const headerDelete = ['node', 'child-reference', 'missing-reference', 'connection', 'on-demand'].includes(kind);
    const deleteLabel = kind === 'on-demand' ? 'Remove' : kind === 'connection' ? 'Delete connection' : 'Delete step';
    return `<aside class="workflow-editor-inspector" id="workflow-inspector" data-inspector-kind="${escape(kind)}" aria-label="${escape(title)} inspector"><div class="editor-inspector-content"><div class="editor-inspector-heading"><h2>${escape(title)}</h2>${headerDelete ? deleteButton(kind, deleteLabel) : ''}</div>${body}</div></aside>`;
  };
})();
