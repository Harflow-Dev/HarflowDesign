(function () {
  // Exploratory workflow editor proposals: rename (#4), standalone reorder (#1), Council node (#17), and the
  // readiness report (HarflowMCP#18). Pure helpers and markup builders; the editor controller owns state.
  const esc = value => HF.escape(value == null ? '' : String(value));
  HF.editorProposalRoutes = ['rename', 'rename-collision', 'standalone-reorder', 'council-config', 'council-name-errors', 'council-too-few', 'start-setup', 'start-new-folder', 'end-teardown', 'readiness'];
  HF.councilEditorRoutes = ['council-config', 'council-name-errors', 'council-too-few'];

  // ---- #4 Rename ----------------------------------------------------------------------------------------
  HF.otherWorkflowNames = current => HF.sidebarWorkflows.map(workflow => workflow.name).filter(name => name !== current);
  // The ticket asks for feedback on empty or invalid names and on collisions; it does not define "invalid"
  // beyond empty, so blank names are the only invalid case here.
  HF.workflowNameValidation = (value, current, others = HF.otherWorkflowNames(current)) => {
    const name = String(value ?? '').trim();
    if (!name) return { valid: false, kind: 'empty', message: 'Enter a workflow name.' };
    const clash = others.find(other => other.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
    if (clash) return { valid: false, kind: 'collision', message: `A workflow named “${clash}” already exists.` };
    if (name === String(current).trim()) return { valid: false, kind: 'unchanged', message: '' };
    return { valid: true, kind: 'ok', message: '' };
  };
  HF.renameDialog = (value, current, dirty) => {
    const result = HF.workflowNameValidation(value, current);
    const invalid = result.kind === 'empty' || result.kind === 'collision';
    return `<div class="editor-modal-backdrop" data-editor-action="modal-backdrop"><section class="editor-modal editor-rename" role="dialog" aria-modal="true" aria-labelledby="editor-modal-title"><div class="editor-modal-body"><header><h2 id="editor-modal-title">Rename workflow</h2></header><label class="editor-rename-field">Name<input id="editor-rename-input" data-modal-field="rename" type="text" value="${esc(value)}" autocomplete="off" spellcheck="false" ${invalid ? 'aria-invalid="true"' : ''} aria-describedby="editor-rename-error${dirty ? ' editor-rename-note' : ''}"></label><p class="editor-rename-error" id="editor-rename-error" role="alert">${invalid ? `<span class="editor-rename-glyph" aria-hidden="true">⚠</span><span>${esc(result.message)}</span>` : ''}</p>${dirty ? '<p class="editor-rename-note" id="editor-rename-note">This editor has unsaved changes. Renaming keeps them in the editor and does not save them.</p>' : ''}<footer class="editor-modal-actions"><button type="button" data-editor-action="close-modal">Cancel</button><button type="button" class="primary" data-editor-action="submit-modal" ${result.valid ? '' : 'disabled'}>Rename</button></footer></div></section></div>`;
  };

  // ---- #1 Standalone reorder ----------------------------------------------------------------------------
  // `index` is the insertion gap (0..list.length) measured before the dragged item is removed.
  HF.moveStandalone = (list, id, index) => {
    const from = list.findIndex(item => item.id === id);
    if (from < 0 || !Number.isInteger(index)) return list.slice();
    const target = Math.max(0, Math.min(list.length, index));
    const rest = list.filter(item => item.id !== id);
    rest.splice(target > from ? target - 1 : target, 0, list[from]);
    return rest;
  };

  // ---- #17 Council node ---------------------------------------------------------------------------------
  // Members are a list keyed by stable ids; the facilitator is a member id. A council needs at least two
  // required members; optional members never count toward that minimum and never block the outcome.
  HF.councilMinRequired = 2;
  HF.councilNodeSize = { width: 240, height: 108 };
  // Read-only engine defaults; the editor does not expose them as controls.
  HF.councilEngineLimits = [['Max rounds', '5'], ['Question limit', '3'], ['Follow-up limit', '2'], ['Time budget', '15 min']];
  HF.councilHarnesses = ['claude', 'codex', 'opencode', 'vibe', 'antigravity'];
  HF.councilEfforts = [['', 'Default'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']];
  HF.councilSeedQuestion = 'How should refund retries work when the payment provider times out? Context: billing-api refund endpoint; idempotency keys already landed.';
  HF.councilSeedMembers = () => [
    { id: 'm1', name: 'Architect', harness: 'claude', model: 'Opus', effort: 'high', instructions: 'You are the architect. Argue as the architect: draft each candidate as a complete retry policy, keep the ledger consistent and prefer the smallest change that resolves every objection.', optional: false },
    { id: 'm2', name: 'Frontend', harness: 'codex', model: '', effort: 'medium', instructions: 'You are a frontend engineer. Argue as frontend: what the refund screen shows while retries run, loading and error states, and the copy for failures. Object with a concrete reason and the change that resolves it.', optional: false },
    { id: 'm3', name: 'QA', harness: 'vibe', model: '', effort: '', instructions: 'You are QA. Argue as QA: edge cases, duplicate refunds, provider-side retries and how each behaviour is tested.', optional: true }
  ];
  HF.councilNewMember = id => ({ id, name: '', harness: 'claude', model: '', effort: '', instructions: '', optional: false });
  HF.councilTakesEffort = harness => harness !== 'vibe';
  HF.councilEffortLabel = effort => (HF.councilEfforts.find(([value]) => value === (effort || '')) || HF.councilEfforts[0])[1];
  HF.harnessName = backend => ({ claude: 'Claude', codex: 'Codex', opencode: 'OpenCode', vibe: 'Vibe', antigravity: 'Antigravity', cursor: 'Cursor' })[backend] || String(backend);
  HF.councilErrors = {
    question: 'Enter the question and context for the council.',
    blankName: 'Name this member. The name labels its messages in Activity.',
    duplicateName: name => `Another member is named ${name}. Names must be unique so every message is attributable.`,
    tooFew: `A council needs at least ${HF.councilMinRequired} required members`
  };
  // The effective facilitator is derived on read: the stored id if it names a required member, otherwise the
  // first required member, otherwise none. Reading never changes the draft; the editor persists the derived id
  // inside the actions that change eligibility (HF.councilNormalizeFacilitator).
  HF.councilEffectiveFacilitator = fields => {
    const required = (fields.members || []).filter(member => !member.optional);
    return (required.find(member => member.id === fields.facilitator) || required[0] || {}).id || '';
  };
  HF.councilNormalizeFacilitator = fields => { fields.facilitator = HF.councilEffectiveFacilitator(fields); return fields; };
  // One view model for the inspector, validation, and the node summary so they cannot disagree.
  HF.councilModel = fields => {
    const members = Array.isArray(fields.members) ? fields.members : [];
    const key = value => String(value ?? '').trim().toLocaleLowerCase();
    const counts = {};
    for (const member of members) if (key(member.name)) counts[key(member.name)] = (counts[key(member.name)] || 0) + 1;
    const facilitatorId = HF.councilEffectiveFacilitator(fields);
    const rows = members.map((member, index) => {
      const name = String(member.name ?? '').trim();
      const error = !name ? HF.councilErrors.blankName : counts[key(name)] > 1 ? HF.councilErrors.duplicateName(name) : '';
      const title = name || `Member ${index + 1}`;
      const takesEffort = HF.councilTakesEffort(member.harness);
      const instructions = String(member.instructions ?? '').trim();
      const isFacilitator = member.id === facilitatorId;
      return {
        id: member.id, member, index, name, title, unnamed: !name, error, takesEffort, isFacilitator, optional: !!member.optional,
        harnessLabel: HF.harnessName(member.harness), modelLabel: member.model || 'Default', effortLabel: HF.councilEffortLabel(member.effort),
        summary: `${HF.harnessName(member.harness)} · ${member.model || 'Default'}${takesEffort ? ` · ${HF.councilEffortLabel(member.effort)}` : ''}`,
        excerpt: error ? { kind: 'error', text: error } : instructions ? { kind: 'text', text: instructions } : { kind: 'none', text: 'No instructions' },
        optionalHelp: isFacilitator ? 'The facilitator is always required.' : member.optional ? 'Joins the discussion; its vote and its failure do not block the outcome.' : 'Required: its acceptance is needed for consensus.'
      };
    });
    const requiredCount = rows.filter(row => !row.optional).length;
    const optionalCount = rows.length - requiredCount;
    const tooFew = requiredCount < HF.councilMinRequired;
    const questionError = String(fields.question ?? '').trim() ? '' : HF.councilErrors.question;
    const errors = [];
    if (questionError) errors.push(questionError);
    for (const row of rows) if (row.error) errors.push(row.error);
    if (tooFew) errors.push(HF.councilErrors.tooFew);
    return {
      rows, requiredCount, optionalCount, tooFew, questionError, errors, facilitatorId,
      facilitator: rows.find(row => row.id === facilitatorId) || null,
      heading: `Members (${rows.length}${optionalCount ? ` · ${optionalCount} optional` : ''})`,
      tooFewDetail: `${rows.length >= 2 ? 'Optional members do not count. Clear Optional on a member or add one.' : 'Add a member to run this node.'} Your edits are kept.`
    };
  };
  // Invalid edits are reported and preserved; nothing is dropped silently.
  HF.councilValidation = fields => HF.councilModel(fields).errors;
  // Two lines on the editor canvas node: member names, then the required and optional counts.
  HF.councilNodeSummary = fields => {
    const model = HF.councilModel(fields);
    return {
      members: model.rows.map(row => row.title).join(', '),
      meta: model.errors.length ? 'Fix the configuration to run' : `${model.requiredCount} required${model.optionalCount ? ` · ${model.optionalCount} optional` : ''} · max 5 rounds`
    };
  };
  HF.councilGlyph = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5.5" cy="5.6" r="2.1" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="11" cy="6.4" r="1.7" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M1.8 13c.2-2.3 1.7-3.5 3.7-3.5s3.5 1.2 3.7 3.5M9.6 9.9c.5-.3 1-.4 1.5-.4 1.6 0 2.8 1 3 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

  // ---- #21 / HarflowMCP#41 Workflow setup and teardown ------------------------------------------------------
  // Exploratory commands on the Start and End nodes. Fields live under the existing draft keys start:start and
  // end:end so deleting another node keeps them; the Variables disclosure is transient UI state outside the draft.
  HF.setupRoutes = ['start-setup', 'start-new-folder', 'end-teardown'];
  HF.setupBounds = { start: { min: 1, max: 60 }, end: { min: 1, max: 30 } };
  HF.setupFixture = {
    builtins: ['HARFLOW_LAUNCH_DIR', 'HARFLOW_WORKSPACE', 'HARFLOW_RUN_ID', 'HARFLOW_WORKFLOW_NAME'],
    inputs: ['HARFLOW_INPUT_BASE', 'HARFLOW_INPUT_ISSUE'],
    outcome: 'HARFLOW_RUN_OUTCOME',
    // One fixture for the editor and the Run sheet. The canvas sheet shows the setup command on two unwrapped lines.
    commands: {
      worktree: 'git -C "$HARFLOW_LAUNCH_DIR" fetch origin\ngit -C "$HARFLOW_LAUNCH_DIR" worktree add \\\n  -b "harflow/$HARFLOW_RUN_ID" \\\n  "$HARFLOW_WORKSPACE" \\\n  "origin/${HARFLOW_INPUT_BASE:-main}"',
      newFolder: 'mkdir -p "$HARFLOW_WORKSPACE"\ncp -R ~/templates/ios-sample/. "$HARFLOW_WORKSPACE"',
      teardown: 'git -C "$HARFLOW_LAUNCH_DIR" worktree remove \\\n  --force "$HARFLOW_WORKSPACE"'
    }
  };
  HF.setupWhenLabels = { success: 'The run succeeds', always: 'Always' };
  HF.setupFieldDefaults = kind => kind === 'start'
    ? { setupEnabled: false, setupCommand: '', setupTimeoutMinutes: 5 }
    : { teardownEnabled: false, teardownCommand: '', teardownTimeoutMinutes: 2, runWhen: 'success' };
  const setupOn = () => ({ start: { setupEnabled: true, setupCommand: HF.setupFixture.commands.worktree, setupTimeoutMinutes: 5 }, end: { teardownEnabled: true, teardownCommand: HF.setupFixture.commands.teardown, teardownTimeoutMinutes: 2, runWhen: 'success' } });
  // Per route: the saved baseline, the unsaved edit over it, and which Variables disclosures start open.
  HF.setupRouteConfig = route => ({
    'start-setup': { baseline: {}, draft: { 'start:start': setupOn().start }, open: { start: true } },
    'start-new-folder': { baseline: { 'start:start': { setupEnabled: true, setupCommand: HF.setupFixture.commands.newFolder, setupTimeoutMinutes: 1 } }, draft: {}, open: {} },
    'end-teardown': { baseline: { 'end:end': setupOn().end }, draft: {}, open: {} }
  })[route] || null;
  HF.setupVariables = (kind, route) => kind === 'start'
    ? (route === 'start-new-folder' ? HF.setupFixture.builtins : [...HF.setupFixture.builtins, ...HF.setupFixture.inputs])
    : [...HF.setupFixture.builtins, ...HF.setupFixture.inputs, HF.setupFixture.outcome];
  HF.setupMinutesText = value => `${value} ${Number(value) === 1 ? 'minute' : 'minutes'}`;
  HF.setupClamp = (kind, value) => { const { min, max } = HF.setupBounds[kind]; const number = Math.round(Number(value)); return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : min; };
  // Accent dot on the Start or End terminal node while its command is on, exposed in the node's accessible name.
  HF.setupIndicator = (type, fields) => {
    if (type === 'start' && fields?.setupEnabled === true) return { label: ', setup command on' };
    if (type === 'end' && fields?.teardownEnabled === true) return { label: ', teardown command on' };
    return null;
  };
  let setupUi = { open: {} };
  HF.setupUi = () => ({ open: { ...setupUi.open } });
  HF.setupToggleVariables = kind => { setupUi.open[kind] = !setupUi.open[kind]; return !!setupUi.open[kind]; };
  HF.afterWorkflowEditorReset = route => {
    setupUi = { open: {} };
    const config = HF.setupRouteConfig(route); if (!config) return;
    setupUi.open = { ...config.open };
    HF.editorController.proposalFields(config.baseline, config.draft);
  };
  const suIcon = {
    updown: '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M2 4.6 5 1.8 8 4.6M2 7.4 5 10.2 8 7.4"/></svg>',
    chevron: open => `<svg viewBox="0 0 10 10" aria-hidden="true"><path d="${open ? 'M1.8 3.6 5 6.8 8.2 3.6' : 'M3.6 1.8 6.8 5 3.6 8.2'}"/></svg>`,
    info: '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="5.6"/><path d="M7 6.2V10M7 4V4.1"/></svg>'
  };
  const mono = text => `<span class="editor-setup-mono">${esc(text)}</span>`;
  HF.renderSetupInspector = (kind, fields = {}, route = '', open = false) => {
    const start = kind === 'start';
    const f = { ...HF.setupFieldDefaults(kind), ...fields };
    const enabledKey = start ? 'setupEnabled' : 'teardownEnabled', commandKey = start ? 'setupCommand' : 'teardownCommand', timeoutKey = start ? 'setupTimeoutMinutes' : 'teardownTimeoutMinutes';
    const enabled = f[enabledKey] === true, bounds = HF.setupBounds[kind], timeout = HF.setupClamp(kind, f[timeoutKey]);
    const off = enabled ? '' : 'disabled';
    const variables = HF.setupVariables(kind, route);
    const timeoutRow = `<div class="editor-setup-row"><span id="su-timeout-label">Timeout</span><span class="editor-setup-stepper"><span class="editor-setup-value" role="spinbutton" tabindex="${enabled ? 0 : -1}" data-setup-spin="${timeoutKey}" aria-labelledby="su-timeout-label" aria-valuenow="${timeout}" aria-valuemin="${bounds.min}" aria-valuemax="${bounds.max}" aria-valuetext="${esc(HF.setupMinutesText(timeout))}" ${enabled ? '' : 'aria-disabled="true"'}>${timeout} min</span><span class="editor-setup-steps"><button type="button" tabindex="-1" data-action="su-up:${timeoutKey}" aria-label="Increase timeout" ${off}><svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1.5 5 5 1.5 8.5 5"/></svg></button><button type="button" tabindex="-1" data-action="su-down:${timeoutKey}" aria-label="Decrease timeout" ${off}><svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1.5 1 5 4.5 8.5 1"/></svg></button></span></span></div>`;
    const whenRow = start ? '' : `<div class="editor-setup-row"><span id="su-when-label">Run when</span><label class="editor-setup-popup"><select data-setup-field="runWhen" aria-labelledby="su-when-label" ${off}>${Object.entries(HF.setupWhenLabels).map(([value, label]) => `<option value="${value}" ${f.runWhen === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>${suIcon.updown}</label></div>`;
    const command = `<h3>${start ? 'Setup command' : 'Teardown command'}</h3><textarea class="editor-setup-command" data-setup-field="${commandKey}" aria-label="${start ? 'Setup command' : 'Teardown command'}" rows="${start ? 6 : 4}" spellcheck="false" ${off}>${esc(f[commandKey])}</textarea>`;
    const disclosure = `<div class="editor-setup-vars"><button type="button" class="editor-setup-disc" data-action="su-vars:${kind}" aria-expanded="${open ? 'true' : 'false'}" aria-controls="su-variables">${suIcon.chevron(open)}<span>Variables (${variables.length})</span></button><div id="su-variables" class="editor-setup-pills" ${open ? '' : 'hidden'}>${open ? variables.map(name => `<span class="editor-setup-pill">${esc(name)}</span>`).join('') : ''}</div>${open && start ? `<p class="editor-inspector-help">${mono('HARFLOW_LAUNCH_DIR')} is the folder chosen when the run starts. Inputs arrive only as variables. Harflow never inserts them into the command text.</p>` : ''}</div>`;
    const banner = (title, text) => `<div class="editor-setup-banner">${suIcon.info}<div><strong>${esc(title)}</strong><span>${esc(text)}</span></div></div>`;
    const checkbox = label => `<label class="editor-setup-check"><input type="checkbox" data-setup-field="${enabledKey}" ${enabled ? 'checked' : ''}><span>${esc(label)}</span></label>`;
    const body = start
      ? `<p class="editor-inspector-help">Runs once before the first node and decides where every node works.</p><h3>Setup</h3>${checkbox('Run a setup command')}<p class="editor-inspector-help">Off: nodes run in the launch folder. On: the command creates a folder at ${mono('$HARFLOW_WORKSPACE')} and every node starts there.</p><div class="editor-setup-form">${timeoutRow}</div>${command}${disclosure}${banner("Runs with Harflow's own access", "Harness permissions don't apply to this command. You review it each time you start the workflow yourself.")}`
      : `<p class="editor-inspector-help">Runs once after the workflow run finishes. Choose when below.</p><h3>Teardown</h3>${checkbox('Run a teardown command')}<div class="editor-setup-form">${whenRow}${timeoutRow}</div><p class="editor-inspector-help">"The run succeeds" keeps a failed run's folder so you can inspect it. Choose "Always" to clean up every time.</p>${command}${disclosure}<p class="editor-inspector-help">Adds ${mono(HF.setupFixture.outcome)}: completed, failed or cancelled. The branch stays, so an open pull request keeps working.</p><p class="editor-setup-notice">If Harflow stops during teardown, the run shows "Teardown pending" until you run it from recovery.</p>${banner("Runs with Harflow's own access", "A failed teardown is recorded but never changes the run's outcome.")}`;
    return `<aside class="workflow-editor-inspector editor-setup" id="workflow-inspector" data-inspector-kind="${kind}" data-setup-inspector="${kind}" aria-label="${start ? 'Start node' : 'End node'}"><div class="editor-inspector-content"><div class="editor-inspector-heading"><h2>${start ? 'Start' : 'End'}</h2></div>${body}</div></aside>`;
  };
  if (typeof document !== 'undefined') {
    const key = kind => `${kind}:${kind}`;
    const selectedKind = () => { const selected = HF.editorController.snapshot().selected; return selected?.kind === 'start' || selected?.kind === 'end' ? selected.kind : null; };
    const fieldsOf = kind => HF.editorController.snapshot().draft.fieldValues[key(kind)] || {};
    const focusAfter = selector => { const target = document.querySelector(`.editor-app ${selector}`); target?.focus?.(); };
    const commit = (kind, patch, selector) => { HF.editorController.patchFields(key(kind), patch, true); focusAfter(selector); };
    const timeoutKey = kind => kind === 'start' ? 'setupTimeoutMinutes' : 'teardownTimeoutMinutes';
    const enabledKey = kind => kind === 'start' ? 'setupEnabled' : 'teardownEnabled';
    const step = (kind, delta, absolute) => {
      const fields = { ...HF.setupFieldDefaults(kind), ...fieldsOf(kind) }; if (fields[enabledKey(kind)] !== true) return;
      const next = absolute != null ? absolute : HF.setupClamp(kind, fields[timeoutKey(kind)]) + delta;
      commit(kind, { [timeoutKey(kind)]: HF.setupClamp(kind, next) }, '[data-setup-spin]');
    };
    document.addEventListener('click', event => {
      const target = event.target.closest?.('[data-action^="su-"]'); if (!target || !target.closest('.editor-app')) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const kind = selectedKind(); if (!kind || target.disabled) return;
      const [action, value] = target.dataset.action.split(':');
      if (action === 'su-vars') { HF.setupToggleVariables(kind); HF.editorController.refresh(); focusAfter('[data-action^="su-vars"]'); }
      if (action === 'su-up') step(kind, 1);
      if (action === 'su-down') step(kind, -1);
    }, true);
    document.addEventListener('keydown', event => {
      const spin = event.target.closest?.('[data-setup-spin]'); if (!spin || !spin.closest('.editor-app')) return;
      const kind = selectedKind(); if (!kind) return;
      const bounds = HF.setupBounds[kind], handled = { ArrowUp: () => step(kind, 1), ArrowDown: () => step(kind, -1), PageUp: () => step(kind, 5), PageDown: () => step(kind, -5), Home: () => step(kind, 0, bounds.min), End: () => step(kind, 0, bounds.max) }[event.key];
      if (!handled) return; event.preventDefault(); handled();
    }, true);
    document.addEventListener('input', event => {
      const control = event.target.closest?.('textarea[data-setup-field]'); if (!control || !control.closest('.editor-app')) return;
      const kind = selectedKind(); if (kind && !control.disabled) HF.editorController.patchFields(key(kind), { [control.dataset.setupField]: control.value }, false);
    }, true);
    document.addEventListener('change', event => {
      const control = event.target.closest?.('[data-setup-field]'); if (!control || !control.closest('.editor-app') || control.matches('textarea')) return;
      const kind = selectedKind(); if (!kind) return;
      const name = control.dataset.setupField;
      commit(kind, { [name]: control.type === 'checkbox' ? control.checked : control.value }, `[data-setup-field="${name}"]`);
    }, true);
  }

  // ---- #21 / HarflowMCP#41 Setup and teardown run states ------------------------------------------------------
  // Exploratory run panes for a setup that is running or failed and a teardown that is pending. Markup only; the
  // workflow-run module owns the header, graph, toolbar, summary and the mock transitions.
  HF.setupRunStates = ['setup-running', 'setup-failed', 'teardown-pending'];
  HF.setupRunWorkspace = '~/Harflow/Workspaces/01JB7K2M';
  HF.setupRunSummary = {
    'setup-running': 'Preparing the workspace',
    'setup-failed': 'Setup failed before the first node: invalid reference origin/release-9.',
    'teardown-pending': 'All nodes done. Teardown pending: Harflow stopped before it finished.',
    'teardown-completed': 'All nodes done. Teardown completed.'
  };
  const runPre = lines => `<pre class="wfr-setup-output" tabindex="0" aria-label="Output">${lines.map(esc).join('\n')}</pre>`;
  const runCommand = (id, open, text) => `<div class="wfr-setup-command"><button type="button" class="wfr-setup-disc" data-action="wr-command" aria-expanded="${open ? 'true' : 'false'}" aria-controls="${id}"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="${open ? 'M1.8 3.6 5 6.8 8.2 3.6' : 'M3.6 1.8 6.8 5 3.6 8.2'}"/></svg><span>Command</span></button><pre id="${id}" class="wfr-setup-code" ${open ? '' : 'hidden'}>${open ? esc(text) : ''}</pre></div>`;
  const runFooter = () => `<p class="wfr-setup-workspace">Workspace: <span class="wfr-setup-mono">${esc(HF.setupRunWorkspace)}</span></p><button type="button" class="wfr-setup-link" data-action="wr-open-log">Open full log</button>`;
  const runHead = (crumb, label, tone, elapsed) => `<header class="wfr-setup-head"><strong>${esc(crumb)}</strong><span class="wfr-setup-status ${tone}">${tone === 'running' ? '<span class="wfr-spinner" aria-hidden="true"></span>' : ''}${esc(label)}</span>${elapsed ? `<span class="wfr-setup-elapsed">${esc(elapsed)}</span>` : ''}<span class="spacer"></span><button type="button" class="quiet" data-action="wr-deselect" aria-label="Close selected activity">×</button></header>`;
  // pane(state, { commandOpen, teardown }) with teardown one of pending, running, completed.
  HF.setupRunPane = (state, ui = {}) => {
    const open = !!ui.commandOpen;
    if (state === 'setup-running') return `<div class="wfr-setup" data-setup-run="${state}">${runHead('Start › Setup', 'Running', 'running', '00:07')}<p class="wfr-setup-note">No agent starts until setup finishes. Timeout 5 min.</p><h4>Output</h4>${runPre(['From github.com:Harflow-Dev/HarflowMac', '* branch            main       -> FETCH_HEAD', "Preparing worktree (new branch 'harflow/01JB7K2M')", 'Updating files:  64% (812/1268)'])}<p class="wfr-setup-note is-live" role="status">Running the setup command</p>${runCommand('wfr-setup-command', open, HF.setupFixture.commands.worktree)}${runFooter()}</div>`;
    if (state === 'setup-failed') return `<div class="wfr-setup" data-setup-run="${state}">${runHead('Start › Setup', 'Failed', 'failed', 'exit 128')}<p class="wfr-setup-notice" role="status">The run never started work: no agent ran and there is nothing to recover. Fix the cause, then Run again.</p><h4>Output</h4>${runPre(['From github.com:Harflow-Dev/HarflowMac', 'fatal: invalid reference: origin/release-9'])}<p class="wfr-setup-note">HARFLOW_INPUT_BASE was release-9, from the run's inputs.</p>${runCommand('wfr-setup-command', open, HF.setupFixture.commands.worktree)}${runFooter()}<section class="wfr-setup-skipped"><h4>Teardown <span class="wfr-setup-status skipped">Skipped</span></h4><p class="wfr-setup-note">Set to run only when the run succeeds, so anything setup left behind stays for you to inspect.</p></section></div>`;
    const teardown = ui.teardown || 'pending';
    const label = { pending: 'Pending', running: 'Running', completed: 'Completed' }[teardown];
    const tone = { pending: 'pending', running: 'running', completed: 'completed' }[teardown];
    const lines = teardown === 'completed' ? [`Removing worktree '${HF.setupRunWorkspace}'`, 'Worktree removed'] : [`Removing worktree '${HF.setupRunWorkspace}'`, ...(teardown === 'running' ? [] : ['[output ends here]'])];
    const description = teardown === 'pending' ? "Harflow stopped while teardown was running, so it may not have finished. The run's outcome stays Completed. Nothing runs again until you choose to." : teardown === 'running' ? "Running teardown once. The run's outcome stays Completed." : "Teardown finished. The run's outcome stays Completed.";
    const action = teardown === 'pending' ? `<div class="wfr-setup-action"><button type="button" class="primary" data-action="wr-run-teardown">Run teardown</button><span class="wfr-setup-note">Runs it once, with the launch folder this run recorded.</span></div>` : '';
    return `<div class="wfr-setup" data-setup-run="${state}" data-teardown="${teardown}">${runHead('End › Teardown', label, tone, '')}<p class="wfr-setup-note">${esc(description)}</p><h4>Output</h4>${runPre(lines)}${action}${runCommand('wfr-setup-command', open, HF.setupFixture.commands.teardown)}${runFooter()}</div>`;
  };
  // Pane shown when Start or End is deselected or the Orchestrator is selected: it must not claim work that never ran.
  HF.setupRunFallback = (state, teardown = 'pending') => {
    const body = {
      'setup-running': ['Plan', 'Nothing has started yet. The plan appears once setup finishes.', 'Orchestrator: Waiting for setup'],
      'setup-failed': ['Plan', 'Nothing started. The run never reached its first node.', 'Orchestrator: Never started'],
      'teardown-pending': ['Plan · all nodes completed', 'All nodes done. The run\'s outcome is Completed.', 'Orchestrator: Finished']
    }[state];
    const note = state === 'teardown-pending' ? `<p class="wfr-setup-notice" role="status">${teardown === 'completed' ? 'Teardown completed.' : teardown === 'running' ? 'Teardown is running.' : 'Teardown pending: Harflow stopped before it finished. Select End to run it.'}</p>` : '';
    return `<div class="wfr-setup wfr-setup-summary" data-setup-fallback="${state}"><h4>${esc(body[0])}</h4><p class="wfr-setup-note">${esc(body[1])}</p><p class="wfr-setup-note">${esc(body[2])}</p>${note}</div>`;
  };
  HF.setupRunNotStarted = name => `<div class="wfr-setup wfr-setup-idle"><header class="wfr-setup-head"><strong>${esc(name)}</strong><span class="wfr-setup-status pending">Not started</span><span class="spacer"></span><button type="button" class="quiet" data-action="wr-deselect" aria-label="Close selected activity">×</button></header><p class="wfr-setup-note">No agent runs until setup finishes, so there is no activity yet.</p></div>`;

  // ---- HarflowMCP#18 Readiness report -------------------------------------------------------------------
  HF.readinessStatus = { ready: 'Ready for the checks performed', blocked: 'Blocked', verify: 'Needs verification' };
  HF.readinessFindings = [
    { node: 'Plan', status: 'ready', evidence: [['Verified', 'harness reachable, instructions parse']] },
    { node: 'Implementation', status: 'blocked', evidence: [['Verified', 'Codex cannot write to the working directory']], consequence: 'The node cannot start.', recommended: 'Choose a working directory the harness can write to.' },
    { node: 'Review', status: 'verify', evidence: [['Inferred', 'the review harness may lack read access to the diff']], consequence: 'The review may report nothing.', recommended: 'Run a smoke check with write access disabled.' }
  ];
  HF.readinessModel = (overrides = {}) => ({ workingDirectory: '/Example/billing-api', revision: 3, scope: 'saved revision', checkedAt: '14:52', stale: false, findings: HF.readinessFindings, ...overrides });
  HF.renderReadinessReport = model => {
    const blocked = model.findings.filter(finding => finding.status === 'blocked').length;
    const verify = model.findings.filter(finding => finding.status === 'verify').length;
    const overall = blocked ? `Blocked: ${blocked} ${blocked === 1 ? 'node cannot' : 'nodes cannot'} run` : verify ? `Needs verification: ${verify} ${verify === 1 ? 'node' : 'nodes'}` : 'Ready for the checks performed';
    const tone = blocked ? 'blocked' : verify ? 'verify' : 'ready';
    const glyph = { ready: '✓', blocked: '✕', verify: '⚠' };
    return `<aside class="editor-readiness" id="workflow-inspector" data-inspector-kind="readiness" aria-label="Readiness report"><div class="editor-readiness-content"><div class="editor-readiness-heading"><h2>Readiness</h2><button type="button" data-editor-action="close-readiness" aria-label="Close readiness report">×</button></div><p class="editor-readiness-meta">Working directory: <code>${esc(model.workingDirectory)}</code> · ${esc(model.scope)} ${esc(model.revision)} · checked ${esc(model.checkedAt)}</p>${model.stale ? '<p class="editor-readiness-stale" role="status"><span aria-hidden="true">⚠</span><span>The workflow changed after this check. Inspect readiness again for current results.</span></p>' : ''}<p class="editor-readiness-overall ${tone}" role="status"><span aria-hidden="true">${glyph[tone]}</span> ${esc(overall)}${model.stale ? ' · out of date' : ''}</p><p class="editor-readiness-scope">Findings cover the checks performed for each node. Verified evidence is listed separately from inferred risk.</p><ul class="editor-readiness-findings">${model.findings.map(finding => `<li class="editor-readiness-finding ${finding.status}"><div class="editor-readiness-row"><h3>${esc(finding.node)}</h3><span class="editor-readiness-badge ${finding.status}"><span aria-hidden="true">${glyph[finding.status]}</span> ${esc(HF.readinessStatus[finding.status])}</span></div>${finding.evidence.map(([kind, text]) => `<p><strong>${esc(kind)}:</strong> ${esc(text)}</p>`).join('')}${finding.consequence ? `<p><strong>Consequence:</strong> ${esc(finding.consequence)}</p>` : ''}${finding.recommended ? `<p><strong>Recommended:</strong> ${esc(finding.recommended)}</p>` : ''}${finding.status === 'ready' ? '' : `<button type="button" data-editor-action="resolve-issue:${esc(finding.node.toLowerCase())}">Resolve issue</button>`}</li>`).join('')}</ul></div></aside>`;
  };
})();
