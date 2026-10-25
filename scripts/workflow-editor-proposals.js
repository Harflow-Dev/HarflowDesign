(function () {
  // Exploratory workflow editor proposals: rename (#4), standalone reorder (#1), Council node (#17), and the
  // readiness report (HarflowMCP#18). Pure helpers and markup builders; the editor controller owns state.
  const esc = value => HF.escape(value == null ? '' : String(value));
  HF.editorProposalRoutes = ['rename', 'rename-collision', 'standalone-reorder', 'council-config', 'council-name-errors', 'council-too-few', 'readiness'];
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
  HF.harnessName = backend => ({ claude: 'Claude', codex: 'Codex', opencode: 'OpenCode', vibe: 'Vibe', antigravity: 'Antigravity' })[backend] || String(backend);
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
