(function () {
  // Exploratory workflow editor proposals: rename (#4), standalone reorder (#1), Council node (#17), and the
  // readiness report (HarflowMCP#18). Pure helpers and markup builders; the editor controller owns state.
  const esc = value => HF.escape(value == null ? '' : String(value));
  HF.editorProposalRoutes = ['rename', 'standalone-reorder', 'council-config', 'readiness'];

  // ---- #4 Rename ----------------------------------------------------------------------------------------
  HF.otherWorkflowNames = ['Development workflow', 'Release checklist'];
  // The ticket asks for feedback on empty or invalid names and on collisions; it does not define "invalid"
  // beyond empty, so blank names are the only invalid case here.
  HF.workflowNameValidation = (value, current, others = HF.otherWorkflowNames) => {
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
  HF.councilLimits = { minMembers: 2, maxMembers: 5 };
  HF.councilMembers = fields => Array.from({ length: Number(fields.memberCount) || 0 }, (_, index) => ({
    number: index + 1,
    backend: fields[`member${index + 1}Backend`] || 'codex',
    model: fields[`member${index + 1}Model`] || '',
    perspective: fields[`member${index + 1}Perspective`] || ''
  }));
  HF.harnessName = backend => ({ claude: 'Claude', codex: 'Codex', opencode: 'OpenCode', vibe: 'Vibe', antigravity: 'Antigravity' })[backend] || String(backend);
  // Invalid edits are reported and preserved; nothing is dropped silently.
  HF.councilValidation = fields => {
    const errors = [];
    const count = Number(fields.memberCount) || 0;
    if (count < HF.councilLimits.minMembers) errors.push(`A council needs at least ${HF.councilLimits.minMembers} members. It has ${count}.`);
    const facilitator = Number(fields.facilitator);
    if (!Number.isInteger(facilitator) || facilitator < 1 || facilitator > count) errors.push('Choose a facilitator from the members.');
    if (!String(fields.question ?? '').trim()) errors.push('Enter the question and context for the council.');
    const rounds = fields.maxRounds;
    if (rounds !== '' && rounds != null && (!Number.isInteger(Number(rounds)) || Number(rounds) < 1)) errors.push('Max rounds must be a whole number of at least 1.');
    return errors;
  };
  HF.councilNodeSummary = fields => {
    const count = Number(fields.memberCount) || 0;
    const rounds = fields.maxRounds === '' || fields.maxRounds == null ? 'engine default rounds' : `max ${fields.maxRounds} rounds`;
    return `${count} ${count === 1 ? 'member' : 'members'} · ${rounds}`;
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
