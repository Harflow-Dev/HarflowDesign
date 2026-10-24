(function () {
  const starterNodes = [
    { id: 'start', title: 'Start', type: 'start', x: 68, y: 110, width: 72, height: 72 },
    { id: 'planning', title: 'Plan', type: 'agent', role: 'planning', x: 190, y: 100, width: 200, height: 92, backend: 'Codex' },
    { id: 'implementation', title: 'Implementation', type: 'agent', role: 'implementation', x: 440, y: 100, width: 200, height: 92, backend: 'Codex' },
    { id: 'review', title: 'Review', type: 'agent', role: 'review', x: 690, y: 100, width: 200, height: 92, backend: 'Codex' },
    { id: 'end', title: 'End', type: 'end', x: 940, y: 110, width: 72, height: 72 }
  ];
  const starterEdges = [
    { id: 'start-planning', source: 'start', target: 'planning', condition: '' },
    { id: 'planning-implementation', source: 'planning', target: 'implementation', condition: '' },
    { id: 'implementation-review', source: 'implementation', target: 'review', condition: '' },
    { id: 'review-end', source: 'review', target: 'end', condition: 'The review approves the implementation and validation; no changes remain.' },
    { id: 'review-implementation', source: 'review', target: 'implementation', condition: 'The review finds concrete changes needed. Implement the review feedback, then request another review.', isBackward: true }
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => HF.escape(String(value ?? ''));
  const state = { route: '', draft: null, baseline: null, selected: null, selectedByUser: false, zoom: 100, modal: null, builderMessage: '', mockTask: false, proposal: false };
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  const deepEqual = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
  const fieldKind = kind => kind === 'missing-reference' ? 'child-reference' : kind === 'parallel-group' ? 'parallel' : kind;

  function freshDraft(route) {
    const draft = { name: 'Session reliability', revision: 0, nodes: clone(starterNodes), edges: clone(starterEdges), standalone: {}, status: route, busy: false, selectedRun: false };
    if (route === 'empty') { draft.nodes = []; draft.edges = []; }
    if (route === 'conflict') draft.conflict = 'The saved workflow changed or was replaced. Your unsaved draft is preserved.';
    if (route === 'read-error') draft.readError = true;
    if (route === 'validation') draft.validation = 'Workflow is not valid: connect the final node to End.';
    if (route === 'loading') draft.loading = true;
    if (route === 'branch' || route === 'parallel-group') {
      draft.nodes = draft.nodes.filter(node => node.id !== 'review');
      draft.nodes.find(node => node.id === 'end').x = 1340;
      draft.nodes.push({id:'parallel-start',title:'Parallel start',type:'parallel_start',role:'parallel',x:690,y:110,width:72,height:72,groupLabel:'Review',groupId:'review-group',partnerId:'parallel-end'}, {id:'parallel-review',title:'Review',type:'agent',role:'review',x:812,y:100,width:200,height:92,backend:'Codex',groupId:'review-group'}, {id:'parallel-end',title:'Parallel end',type:'parallel_end',role:'parallel',x:1062,y:110,width:72,height:72,groupLabel:'Review',groupId:'review-group',partnerId:'parallel-start'});
      draft.edges = draft.edges.filter(edge => ![edge.source, edge.target].includes('review'));
      draft.edges.push({id:'implementation-parallel-start',source:'implementation',target:'parallel-start',condition:''},{id:'parallel-start-review',source:'parallel-start',target:'parallel-review',condition:''},{id:'parallel-review-parallel-end',source:'parallel-review',target:'parallel-end',condition:''},{id:'parallel-end-end',source:'parallel-end',target:'end',condition:''});
    }
    if (route === 'child-reference' || route === 'missing-reference') draft.nodes.push({id:'workflow-step',title:'Run workflow',type:'workflow',role:'workflow',x:400,y:300,width:200,height:92,backend:'',workflowName:route==='missing-reference'?'Unavailable workflow':''});
    if (route === 'on-demand') draft.standaloneNodes=[{id:'investigation',title:'Investigation',type:'on-demand',backend:'Codex'}];
    if (['node', 'branch', 'child-reference', 'missing-reference', 'on-demand', 'connection', 'parallel-group'].includes(route)) {
      if (route === 'connection') draft.selected = { kind: 'connection', id: 'review-implementation' };
      else if (route === 'on-demand') draft.selected = { kind: 'on-demand', id: 'investigation' };
      else if (route === 'child-reference' || route === 'missing-reference') draft.selected = { kind: route === 'missing-reference' ? 'missing-reference' : 'child-reference', id: 'workflow-step' };
      else if (route === 'branch' || route === 'parallel-group') draft.selected = { kind: 'parallel', id: 'parallel-start' };
      else draft.selected = { kind: 'node', id: route === 'child-reference' || route === 'missing-reference' ? 'workflow-step' : 'implementation' };
    } else draft.selected = { kind: 'orchestrator', id: 'orchestrator' };
    return draft;
  }

  HF.resetWorkflowEditor = (screen, route) => {
    if (screen !== 'workflow-editor') { state.route = ''; return; }
    state.route = route;
    state.draft = freshDraft(route);
    state.nextEntityID = 0;
    state.allocatedIDs = new Set([...state.draft.nodes, ...state.draft.edges, ...(state.draft.standaloneNodes || [])].map(entity => entity.id));
    initializeFieldMaps(state.draft);
    state.baseline = clone(state.draft);
    if (route === 'dirty') { state.draft.fieldValues['node:implementation'].instructions += ' Add regression evidence before completion.'; state.draft.nodes.find(n => n.id === 'implementation').instructions = state.draft.fieldValues['node:implementation'].instructions; }
    state.selected = clone(state.draft.selected);
    state.selectedByUser = false;
    state.zoom = 100;
    state.modal = null;
    state.builderMessage = '';
    state.mockTask = ['builder-conversation', 'proposal-ready'].includes(route);
    state.proposal = route === 'proposal-ready';
    state.proposalContext = state.proposal ? proposalSnapshot() : null;
    if (state.mockTask) state.draft.workspace = true;
  };
  HF.afterWorkflowEditorRender = () => { if (typeof document !== 'undefined' && state.route) { drawEdges(); updateButtons(); } };
  const isDirty = () => !deepEqual(editableDraft(), editableBaseline());
  const editableDraft = () => { const { loading, readError, conflict, validation, busy, selectedRun, workspace, selected, ...draft } = state.draft || {}; return draft; };
  const editableBaseline = () => { const { loading, readError, conflict, validation, busy, selectedRun, workspace, selected, ...draft } = state.baseline || {}; return draft; };
  const blocked = () => !state.draft || state.draft.loading || state.draft.readError || state.draft.conflict || state.draft.busy || state.draft.selectedRun;
  const canSave = () => isDirty() && !blocked() && !state.draft.workspace;
  const canDiscard = () => isDirty() && !state.draft.workspace && !state.draft.loading && !state.draft.readError && !state.draft.busy && !state.draft.selectedRun;
  const canRun = () => !isDirty() && !blocked() && !state.draft.workspace && !state.draft.validation;

  HF.renderEditor = route => {
    if (!state.draft || state.route !== route) HF.resetWorkflowEditor('workflow-editor', route);
    const d = state.draft;
    const isBuilder = ['builder-conversation', 'proposal-ready'].includes(route);
    const unavailable = d.loading || d.readError;
    if (d.loading) return loadingScreen();
    return `<section class="app workflow-specimen editor-app" data-editor-route="${esc(route)}">
      <header class="editor-header"><div class="editor-heading"><strong>${esc(d.name)}</strong><span>Revision ${d.revision} · Workflow editor${isDirty() ? ' · Unsaved changes' : ''}</span></div><div class="editor-actions" ${d.readError ? 'inert' : ''}>${isBuilder ? builderHeaderActions() : `<button class="editor-agent-button" data-editor-action="launch-builder"><span class="editor-glyph sparkles" aria-hidden="true"></span><span>Edit with agent</span></button><details class="editor-menu"><summary aria-label="More workflow actions"><span class="editor-glyph ellipsis" aria-hidden="true"></span></summary><div><button data-editor-action="duplicate">Duplicate</button><button data-editor-action="delete">Delete</button><button data-editor-action="generate">Generate with agent…</button></div></details><button data-editor-action="discard" ${canDiscard() ? '' : 'disabled'}>Discard</button><button data-editor-action="save" ${canSave() ? '' : 'disabled'}>Save</button><button class="editor-run" data-editor-action="run" ${canRun() ? '' : 'disabled'}><span class="editor-glyph play" aria-hidden="true"></span><span>Run</span></button>`}</div></header>
      <div class="editor-workspace ${isBuilder ? 'has-builder' : ''}">
        <div class="editor-upper"><main class="editor-main">
          ${d.readError ? '' : standalone()}
          <section class="editor-canvas-shell"><div class="editor-canvas" tabindex="0" aria-label="Workflow graph canvas">${unavailable ? (d.loading ? `<div class="editor-loading" aria-label="Loading workflow"><span></span><span></span><span></span></div>` : `<div class="editor-unavailable"><span class="editor-glyph warning"></span><strong>Workflow could not be loaded</strong><button data-editor-action="refresh">Refresh workflow</button></div>`) : graph()}</div>
          <div class="editor-canvas-controls"><button data-editor-action="zoom-out" aria-label="Zoom out">−</button><button data-editor-action="zoom-reset">${state.zoom}%</button><button data-editor-action="zoom-in" aria-label="Zoom in">+</button></div>
          <div class="editor-tray"><strong>Add</strong><button data-editor-action="add:planning"><span class="editor-glyph planning"></span>Planning</button><button data-editor-action="add:implementation"><span class="editor-glyph implementation"></span>Implementation</button><button data-editor-action="add:review"><span class="editor-glyph review"></span>Review</button><button data-editor-action="add:task"><span class="editor-glyph task"></span>Task</button><button data-editor-action="add:workflow"><span class="editor-glyph workflow"></span>Run workflow</button><i></i><button data-editor-action="add:start" ${d.nodes.some(n => n.type === 'start') ? 'disabled' : ''}>Start</button><button data-editor-action="add:parallel">Parallel group</button><button data-editor-action="add:end" ${d.nodes.some(n => n.type === 'end') ? 'disabled' : ''}>End</button></div>
          ${d.readError ? '' : bottomStatus()}
          </section></main>${unavailable ? '' : inspector()}</div>
        ${isBuilder ? builderWorkspace(route) : ''}
      </div>${state.modal ? modal() : ''}</section>`;
  };

  function standalone() {
    const selected = state.selected?.kind === 'orchestrator' && state.selectedByUser;
    return `<section class="editor-standalone"><div class="editor-standalone-label"><strong>Standalone</strong><span>Outside the workflow path</span></div><button class="editor-standalone-card ${selected ? 'selected' : ''}" data-editor-select="orchestrator"><span class="editor-orchestrator-icon"></span><span class="editor-card-title"><strong>Orchestrator</strong><span class="editor-glyph lock" aria-label="Always present"></span></span><span class="editor-backend"><i></i>Codex</span><span class="editor-subtitle">Decides each node</span></button><button class="editor-add-standalone" data-editor-action="add-on-demand" aria-label="Add on-demand node"><span class="editor-glyph plus" aria-hidden="true"></span></button>${(state.draft.standaloneNodes || []).map(node => `<button class="editor-standalone-card" data-editor-select="on-demand:${esc(node.id)}"><strong>${esc(node.title)}</strong><span>${esc(node.backend || 'Codex')}</span></button>`).join('')}</section>`;
  }
  function graph() {
    if (!state.draft.nodes.length) return '<div class="editor-empty-canvas" aria-label="Empty workflow canvas"></div>';
    return `<div class="editor-graph-viewport"><div class="editor-graph" id="editor-graph" style="width:${Math.max(1120, ...state.draft.nodes.map(n => n.x + n.width + 80))}px;height:${Math.max(520, ...state.draft.nodes.map(n => n.y + n.height + 100))}px;transform:scale(${state.zoom / 100})"><svg class="editor-edges" aria-hidden="true"></svg>${state.draft.nodes.map(node => nodeCard(node)).join('')}</div></div>`;
  }
  function nodeCard(n) {
    const selected = state.selected?.id === n.id;
    const terminal = ['start', 'end', 'parallel_start', 'parallel_end'].includes(n.type);
    const title = n.title || n.name || n.type;
    return `<button class="editor-node ${terminal ? 'terminal' : ''} ${selected ? 'selected' : ''}" data-editor-select="node:${esc(n.id)}" data-node-id="${esc(n.id)}" style="left:${n.x}px;top:${n.y}px;width:${n.width || (terminal ? 72 : 200)}px;height:${n.height || (terminal ? 72 : 92)}px" aria-label="Select ${esc(title)}" ${terminal ? '' : 'draggable="true"'}>${terminal ? `<span class="editor-terminal-icon ${n.type}"></span><strong>${esc(title)}</strong>` : `<span class="editor-node-title"><span class="editor-node-icon ${glyphClass(n.role || n.type)}"></span><strong>${esc(title)}</strong></span>${n.type === 'agent' ? `<span class="editor-backend"><i></i>${esc(({codex:'Codex',claude:'Claude',opencode:'OpenCode',vibe:'Vibe',antigravity:'Antigravity'})[state.draft.fieldValues?.[`node:${n.id}`]?.backend] || n.backend || 'Codex')}</span>` : `<small>${esc(nodeSubtitle(n))}</small>`}`}${n.type !== 'start' ? `<span class="editor-port input" aria-hidden="true"></span>` : ''}${n.type !== 'end' ? `<span class="editor-port output" aria-hidden="true"></span>` : ''}</button>`;
  }
  function glyphClass(role) { return ({ planning: 'planning', implementation: 'implementation', review: 'review', task: 'task', workflow: 'workflow', parallel_start: 'parallel', parallel_end: 'parallel' })[role] || 'task'; }
  function nodeSubtitle(n) { return n.type === 'workflow' ? n.workflowName || 'Select workflow' : n.type === 'parallel_start' ? `Parallel · ${n.groupLabel || 'Group'}` : n.type; }
  function drawEdges() {
    const graph = document.querySelector('.editor-app #editor-graph'); if (!graph) return;
    const svg = graph.querySelector('svg');
    const paths = state.draft.edges.map(edge => {
      const source = state.draft.nodes.find(n => n.id === edge.source), target = state.draft.nodes.find(n => n.id === edge.target); if (!source || !target) return '';
      const sw = source.width || 72, sh = source.height || 72, tw = target.width || 72, th = target.height || 72;
      let x1 = source.x + sw, y1 = source.y + sh / 2, x2 = target.x, y2 = target.y + th / 2;
      let d;
      if (edge.isBackward || target.x < source.x) { const top = Math.min(source.y, target.y) - 18; d = roundedPath([{x:x1,y:y1},{x:x1+18,y:y1},{x:x1+18,y:top},{x:x2-18,y:top},{x:x2-18,y:y2},{x:x2,y:y2}]); }
      else { const mid = (x1 + x2) / 2; d = roundedPath([{x:x1,y:y1},{x:mid,y:y1},{x:mid,y:y2},{x:x2,y:y2}]); }
      const selected = state.selected?.kind === 'connection' && state.selected.id === edge.id;
      return `<g class="editor-edge-hit ${selected ? 'selected' : ''}" role="button" tabindex="0" aria-label="Select connection from ${esc(source.title)} to ${esc(target.title)}" data-editor-select="connection:${esc(edge.id)}"><path d="${d}"/><path class="edge-hitbox" d="${d}"/></g>`;
    }).join('');
    svg.innerHTML = `<defs><marker id="editor-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#777982"/></marker></defs>${paths}`;
    svg.setAttribute('width', graph.style.width); svg.setAttribute('height', graph.style.height);
  }
  function roundedPath(points) {
    if (points.length < 2) return '';
    let path = `M${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const prev=points[i-1],corner=points[i],next=points[i+1];
      const radius=Math.min(10,Math.abs(corner.x-prev.x)/2||Math.abs(corner.y-prev.y)/2,Math.abs(next.x-corner.x)/2||Math.abs(next.y-corner.y)/2);
      const before={x:corner.x-Math.sign(corner.x-prev.x)*radius,y:corner.y-Math.sign(corner.y-prev.y)*radius};
      const after={x:corner.x+Math.sign(next.x-corner.x)*radius,y:corner.y+Math.sign(next.y-corner.y)*radius};
      path+=` L${before.x} ${before.y} Q${corner.x} ${corner.y} ${after.x} ${after.y}`;
    }
    const last=points[points.length-1]; return `${path} L${last.x} ${last.y}`;
  }
  function bottomStatus() {
    const d = state.draft;
    const message = d.conflict ? `${d.conflict} ${button('reload', 'Reload')}` : d.validation ? d.validation : d.readError ? 'Workflow definition unavailable. Refresh to try again.' : d.loading ? 'Loading workflow definition…' : `Valid workflow · ${d.nodes.filter(n => !['start', 'end', 'parallel_start', 'parallel_end'].includes(n.type)).length} nodes · ${(d.standaloneNodes || []).length} on demand`;
    return `<div class="editor-validation ${d.conflict || d.validation || d.readError ? 'problem' : ''}" role="status">${escTextWithButton(message)}</div>`;
  }
  function escTextWithButton(message) { return message.replace('<button data-editor-action="reload">Reload</button>', '<button data-editor-action="reload">Reload</button>'); }
  function button(action, label) { return `<button data-editor-action="${action}">${label}</button>`; }
  function inspector() {
    const selected = state.selected || { kind: 'orchestrator', id: 'orchestrator' };
    if (typeof HF.renderEditorInspector === 'function') {
      const kind = selected.kind === 'parallel-group' ? 'parallel' : selected.kind;
      const fields = { ...HF.editorInspectorDefaults(kind, selected.id) };
      const saved = kind === 'orchestrator' ? state.draft.orchestrator : state.draft.fieldValues?.[`${fieldKind(kind)}:${selected.id}`];
      Object.assign(fields, saved || {});
      return HF.renderEditorInspector(kind, fields);
    }
    return '<aside class="editor-inspector"><h2>Orchestrator</h2><p>Every workflow has one. It cannot be removed.</p><p>Inspector fields are loading.</p></aside>';
  }
  function initializeFieldMaps(draft) {
    draft.fieldValues = draft.fieldValues || {};
    draft.orchestrator = draft.orchestrator || { ...HF.editorInspectorDefaults('orchestrator', 'orchestrator') };
    for (const node of draft.nodes) {
      let kind = node.type === 'start' || node.type === 'end' ? node.type : node.type.startsWith('parallel_') ? 'parallel' : node.type === 'workflow' ? 'child-reference' : 'node';
      if (draft.fieldValues[`${kind}:${node.id}`]) continue;
      const fields = { ...HF.editorInspectorDefaults(kind, node.id) };
      if (kind === 'node') Object.assign(fields, HF.editorInspectorDefaults('node', node.role || node.id));
      fields.id = node.id;
      if (node.title) fields.title = node.title;
      if (node.role) fields.role = node.role;
      if (node.instructions) fields.instructions = node.instructions;
      else if ('instructions' in fields) node.instructions = fields.instructions;
      if (node.groupLabel) fields.groupLabel = node.groupLabel;
      if (kind === 'parallel') { fields.boundaryType = node.type; fields.hasPartner = draft.nodes.some(other => other.id === node.partnerId); fields.branchCount = draft.nodes.filter(other => other.groupId === node.groupId && other.type === 'agent').length; }
      if (kind === 'child-reference') { fields.workflowName = node.workflowName || ''; if (node.workflowName === 'Unavailable workflow') { fields.isMissing = true; fields.workflowId = 'missing-workflow-id'; } }
      draft.fieldValues[`${kind}:${node.id}`] = fields;
    }
    for (const edge of draft.edges) if (!draft.fieldValues[`connection:${edge.id}`]) draft.fieldValues[`connection:${edge.id}`] = { ...HF.editorInspectorDefaults('connection', edge.id), source: edge.source, target: edge.target, condition: edge.condition || '', isBackward: edge.isBackward || edge.target === 'implementation', defaultPath: false, limitRetries: !!edge.isBackward };
    for (const node of draft.standaloneNodes || []) if (!draft.fieldValues[`on-demand:${node.id}`]) draft.fieldValues[`on-demand:${node.id}`] = { ...HF.editorInspectorDefaults('on-demand', node.id), title: node.title };
  }
  function updateButtons() {
    if (typeof document === 'undefined') return;
    const root = document.querySelector('.editor-app'); if (!root) return;
    const saveButton=root.querySelector('[data-editor-action="save"]'), discardButton=root.querySelector('[data-editor-action="discard"]'), runButton=root.querySelector('[data-editor-action="run"]');
    if(saveButton)saveButton.disabled = !canSave();
    if(discardButton)discardButton.disabled = !canDiscard();
    if(runButton)runButton.disabled = !canRun();
    const applyButton=root.querySelector('[data-editor-action="apply-proposal"]');
    if(applyButton)applyButton.disabled = !canApplyProposal();
    const subtitle = root.querySelector('.editor-heading span'); if (subtitle) subtitle.textContent = `Revision ${state.draft.revision} · Workflow editor${isDirty() ? ' · Unsaved changes' : ''}`;
  }
  function refresh() { if (typeof document === 'undefined') return; const root = document.querySelector('.editor-app'); if (root) { root.outerHTML = HF.renderEditor(state.route); HF.afterWorkflowEditorRender(); } }
  function select(kind, id) {
    if (kind === 'node') {
      const node = state.draft.nodes.find(item => item.id === id);
      if (node?.type === 'start' || node?.type === 'end') kind = node.type;
      else if (node?.type?.startsWith('parallel_')) kind = 'parallel';
      else if (node?.type === 'workflow') kind = state.draft.fieldValues?.[`child-reference:${id}`]?.isMissing ? 'missing-reference' : 'child-reference';
    }
    state.selected = { kind, id }; state.selectedByUser = true; refresh();
  }
  function updateField(control) {
    const field = control.dataset.editorField; if (!field) return;
    const selected = state.selected || { kind: 'orchestrator', id: 'orchestrator' };
    if (blocked() || control.disabled) return;
    const fields = selected.kind === 'orchestrator' ? state.draft.orchestrator : state.draft.fieldValues?.[`${fieldKind(selected.kind)}:${selected.id}`];
    if (!fields) return;
    const schema = HF.editorInspectorDefaults(fieldKind(selected.kind), selected.id);
    const original = schema[field];
    const value = typeof original === 'boolean' || control.type === 'checkbox' ? !!control.checked : typeof original === 'number' && control.value !== '' ? Number(control.value) : control.value;
    if (selected.kind === 'orchestrator') state.draft.orchestrator = { ...(state.draft.orchestrator || {}), [field]: value };
    else {
      const storageKey = `${fieldKind(selected.kind)}:${selected.id}`;
      state.draft.fieldValues = state.draft.fieldValues || {};
      state.draft.fieldValues[storageKey] = { ...(state.draft.fieldValues[storageKey] || {}), [field]: value };
      applyFieldToEntity(selected, field, value);
    }
    updateButtons();
  }
  function applyFieldToEntity(selected, field, value) {
    if (selected.kind === 'node' || selected.kind === 'child-reference' || selected.kind === 'missing-reference' || selected.kind === 'parallel') { const node = state.draft.nodes.find(n => n.id === selected.id); if (node) { if (field === 'title') node.title = value; else if (field === 'instructions' || field === 'role' || field === 'groupLabel') node[field] = value;  } }
    if (selected.kind === 'connection') { const edge = state.draft.edges.find(e => e.id === selected.id); if (edge && ['source', 'target', 'condition'].includes(field)) edge[field] = value; }
    if (selected.kind === 'on-demand') { const node = (state.draft.standaloneNodes || []).find(n => n.id === selected.id); if (node && field === 'title') node[field] = value; }
  }
  function allocateEntityID(prefix, suffixes = [], preferBare = false) {
    const existing = new Set([...state.draft.nodes, ...state.draft.edges, ...(state.draft.standaloneNodes || [])].map(entity => entity.id));
    let id = preferBare ? prefix : `${prefix}-${++state.nextEntityID}`;
    while ([id, ...suffixes.map(suffix => id + suffix)].some(candidate => state.allocatedIDs.has(candidate) || existing.has(candidate))) id = `${prefix}-${++state.nextEntityID}`;
    for (const candidate of [id, ...suffixes.map(suffix => id + suffix)]) state.allocatedIDs.add(candidate);
    return id;
  }
  function addOnDemand() {
    if (blocked()) return;
    const id = allocateEntityID('on-demand');
    state.draft.standaloneNodes = state.draft.standaloneNodes || [];
    state.draft.standaloneNodes.push({id,title:'On-demand node',type:'on-demand',backend:'Codex'});
    initializeFieldMaps(state.draft); state.selected={kind:'on-demand',id}; refresh();
  }
  function makeNode(kind) {
    if (blocked()) return;
    const regular = !['start', 'end'].includes(kind), number = state.draft.nodes.length + 1;
    const id = allocateEntityID(kind, kind === 'parallel' ? ['-start', '-end'] : []);
    const n = { id, title: ({planning:'Plan',implementation:'Implementation',review:'Review',task:'Task',workflow:'Run workflow',start:'Start',end:'End',parallel:'Parallel group'})[kind] || kind, type: kind === 'parallel' ? 'parallel_start' : kind === 'workflow' ? 'workflow' : ['start','end'].includes(kind) ? kind : 'agent', role: kind, x: 250 + (number % 3) * 230, y: 220 + Math.floor(number / 3) * 130, width: regular ? 200 : 72, height: regular ? 92 : 72, backend: 'Codex' };
    if (kind === 'parallel') state.draft.nodes.push({ ...n, id: `${id}-start`, type: 'parallel_start', title: 'Parallel group', width:72,height:72,groupLabel:'Group',groupId:id,partnerId:`${id}-end` }, { ...n, id:`${id}-end`, type:'parallel_end', title:'Parallel group end', x:n.x+290,width:72,height:72,groupLabel:'Group',groupId:id,partnerId:`${id}-start` });
    else state.draft.nodes.push(n);
    if (kind === 'start' || kind === 'end') state.draft.nodes.sort((a,b) => a.x-b.x);
    initializeFieldMaps(state.draft);
    select('node', kind === 'parallel' ? `${id}-start` : id);
    refresh();
  }
  function save() { if (!canSave()) return; state.baseline = clone(state.draft); state.draft.revision += 1; state.baseline.revision = state.draft.revision; HF.feedback('Mock workflow saved'); refresh(); }
  function discard() { if (!canDiscard()) return; const revision = state.baseline.revision; state.draft = clone(state.baseline); state.draft.revision = revision; state.selected = clone(state.draft.selected || {kind:'orchestrator',id:'orchestrator'}); HF.feedback('Mock workflow changes discarded'); refresh(); }
  function removeSelected() {
    if (!state.selected || blocked()) return;
    if (['node','child-reference','missing-reference','parallel'].includes(state.selected.kind)) { const id = state.selected.id; const removeIds = state.selected.kind === 'parallel' ? state.draft.nodes.filter(n=>n.id === id || n.id === state.draft.nodes.find(node => node.id === id)?.partnerId).map(n=>n.id) : [id]; state.draft.nodes = state.draft.nodes.filter(n => !removeIds.includes(n.id)); state.draft.edges = state.draft.edges.filter(e => !removeIds.includes(e.source) && !removeIds.includes(e.target)); }
    if (state.selected.kind === 'connection') state.draft.edges = state.draft.edges.filter(e => e.id !== state.selected.id);
    if (state.selected.kind === 'on-demand') state.draft.standaloneNodes = (state.draft.standaloneNodes || []).filter(n => n.id !== state.selected.id);
    const entityIds = new Set([...state.draft.nodes, ...state.draft.edges, ...(state.draft.standaloneNodes || [])].map(item => item.id));
    for (const key of Object.keys(state.draft.fieldValues)) if (!entityIds.has(key.slice(key.indexOf(':')+1))) delete state.draft.fieldValues[key];
    state.selected = { kind:'orchestrator', id:'orchestrator' }; refresh();
  }
  function launchSheet(mode) {
    const trigger = mode === 'run' ? 'run' : mode === 'generate' ? 'generate' : 'launch-builder';
    state.modal = { mode, returnAction: `[data-editor-action="${trigger}"]` };
    refresh();
    const first = document.querySelector('.editor-modal textarea, .editor-modal input, .editor-modal select, .editor-modal button');
    first?.focus();
  }
  function modal() {
    const mode = state.modal.mode, generating = mode !== 'run', refining = mode === 'builder' || mode === 'propose';
    const title = mode === 'run' ? 'Run workflow' : refining ? 'Edit workflow with agent' : 'Generate a workflow';
    const description = mode === 'run' ? 'Agents follow the graph. Harflow tracks execution and enforces limits.' : refining ? 'An agent proposes changes to your current canvas. Review and apply them, then Save when ready.' : 'An agent creates a draft. Harflow validates and stores it for you to edit.';
    const submitLabel = mode === 'run' ? 'Run' : refining ? 'Propose changes' : 'Generate';
    return `<div class="editor-modal-backdrop" data-editor-action="modal-backdrop"><section class="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-modal-title"><div class="editor-modal-body"><header><h2 id="editor-modal-title">${title}</h2><button data-editor-action="close-modal" aria-label="Close">×</button></header><p class="editor-modal-description">${description}</p>${mode === 'run' ? `<strong>${esc(state.draft.name)}</strong><label>Task<textarea data-modal-field="task" placeholder="Describe the task for this workflow"></textarea></label><label>Goal (optional)<textarea data-modal-field="goal" placeholder="Describe the result and evidence needed to verify it"></textarea><small>Describe the result and the evidence needed to verify it.</small></label><label>Repository<span class="editor-repo-row"><input data-modal-field="repository" placeholder="/path/to/repository"><button type="button" class="editor-choose-repo" data-editor-action="choose-repo">Choose…</button></span></label><label class="editor-modal-toggle"><input type="checkbox" data-modal-field="override"> Override orchestrator agent</label><div class="editor-override-fields" hidden><div class="editor-modal-agent-group"><label>Harness<select data-modal-field="agent"><option>Codex</option><option>Claude</option><option>OpenCode</option><option>Vibe</option><option>Antigravity</option></select></label><label>Model<select data-modal-field="model" disabled><option>Default</option></select></label><label>Effort<select data-modal-field="effort"><option>Default</option><option>Low</option><option>Medium</option><option>High</option><option>Xhigh</option></select></label></div><label class="editor-modal-toggle"><input type="checkbox" disabled> Caller approvals: ask before each eligible action</label><small>Caller approvals are unsupported or unmeasured for this harness.</small><p><small>Saved fallback harnesses remain in effect.</small></p></div>` : `<label class="editor-modal-name"><span class="editor-sr-only">Workflow name</span><input aria-label="Workflow name" data-modal-field="name" value="${esc(state.draft.name)}"></label><label>${refining ? 'Describe the changes' : 'Describe the workflow'}<textarea data-modal-field="prompt" aria-label="Workflow request" placeholder="${refining ? 'Describe the changes to propose' : 'Describe the workflow to generate'}"></textarea></label><label>Repository (optional)<span class="editor-repo-row"><input data-modal-field="repository" placeholder="Optional repository for context"><button type="button" class="editor-choose-repo" data-editor-action="choose-repo">Choose…</button></span></label><h3 class="editor-modal-section-label">Builder agent</h3><div class="editor-modal-agent-group"><label>Harness<select data-modal-field="agent"><option>Codex</option><option>Claude</option><option>OpenCode</option><option>Vibe</option><option>Antigravity</option></select></label><label>Model<select data-modal-field="model" disabled><option>Default</option></select></label><label>Effort<select data-modal-field="effort"><option>Default</option><option>Low</option><option>Medium</option><option>High</option><option>Xhigh</option></select></label></div><label class="editor-modal-toggle"><input type="checkbox" disabled> Caller approvals: ask before each eligible action</label><small>Caller approvals are unsupported or unmeasured for this harness.</small><details class="editor-modal-fallbacks"><summary>Fallback harnesses (0)</summary><p>No fallback harnesses configured.</p></details>`}</div><footer><button data-editor-action="close-modal">Cancel</button><button class="editor-primary" data-editor-action="submit-modal" disabled>${submitLabel}</button></footer></section></div>`;
  }
  function builderHeaderActions() {
    return `${state.proposal ? `<button data-editor-action="apply-proposal" ${canApplyProposal() ? '' : 'disabled'}>Apply proposal</button>` : ''}<button data-editor-action="return-to-canvas">Return to canvas</button>${state.proposal ? '' : '<button data-editor-action="cancel-builder">Cancel run</button>'}`;
  }
  function returnToCanvas() {
    state.draft.workspace=false; state.mockTask=false; state.proposal=false; state.proposalContext=null; state.route='saved'; refresh();
  }
  function builderWorkspace(route) {
    return `<section class="editor-builder-workspace"><div class="editor-builder-head"><strong>${state.mockTask ? 'Workflow builder task' : 'Edit with agent'}</strong>${state.mockTask ? '<span class="editor-mock-chip">Mock task</span>' : ''}</div>${state.mockTask ? `<article class="editor-builder-task"><h3>Improve session reliability</h3><p>Add a focused reliability node and retain the existing workflow structure.</p><div class="editor-builder-message"><i></i><p>${esc(state.builderMessage || 'Inspect the workflow definition and propose a safe improvement.')}</p></div></article>` : '<p>Describe the workflow change. A mock builder task will appear here.</p>'}${state.proposal ? `<article class="editor-proposal"><strong>Proposal ready</strong><p>Add “Reliability check” to the workflow after Implementation.</p><button data-editor-action="dismiss-proposal">Dismiss</button></article>` : ''}<form class="editor-builder-form"><label class="editor-sr-only" for="editor-builder-input">Message the workflow builder</label><textarea id="editor-builder-input" placeholder="Describe a workflow change">${esc(state.builderMessage)}</textarea><button data-editor-action="send-builder">Send</button></form></section>`;
  }

  if (typeof document !== 'undefined') {
  document.addEventListener('click', event => {
    const app = event.target.closest('.editor-app'); if (!app) return;
    const selectTarget = event.target.closest('[data-editor-select],.editor-edge-hit');
    const target = event.target.closest('[data-editor-action],[data-action^="editor-"]');
    if (selectTarget) { event.preventDefault(); event.stopImmediatePropagation(); const [kind,id] = selectTarget.dataset.editorSelect.split(':'); select(kind, id || 'orchestrator'); return; }
    if (!target || target.dataset.editorAction === 'modal-backdrop' && event.target !== target) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const actionData = target.dataset.editorAction || target.dataset.action; const [action, value] = actionData.split(':');
    switch (action) {
      case 'return-to-canvas': returnToCanvas(); break;
      case 'cancel-builder': HF.feedback('Mock workflow builder cancellation requested'); break;
      case 'save': save(); break; case 'discard': discard(); break;
      case 'run': if (canRun()) launchSheet('run'); break;
      case 'launch-builder': if (!blocked()) launchSheet('builder'); break; case 'generate': launchSheet('generate'); break;
      case 'refresh': HF.feedback('Mock workflow refresh requested'); HF.resetWorkflowEditor('workflow-editor', 'saved'); refresh(); break;
      case 'reload': HF.feedback('Mock workflow reload requested'); HF.resetWorkflowEditor('workflow-editor', 'saved'); refresh(); break;
      case 'zoom-in': state.zoom = Math.min(200,state.zoom+25); refresh(); break; case 'zoom-out': state.zoom = Math.max(50,state.zoom-25); refresh(); break; case 'zoom-reset': state.zoom = 100; refresh(); break;
      case 'add': makeNode(value); break;
      case 'add-on-demand': addOnDemand(); break;
      case 'duplicate': HF.feedback('Mock workflow duplicate created'); break; case 'delete': HF.feedback('Mock workflow deletion requested'); break;
      case 'editor-delete': removeSelected(); break;
      case 'editor-select-partner': { const node=state.draft.nodes.find(n=>n.id===state.selected.id), partner=state.draft.nodes.find(n=>n.id===node?.partnerId); if(partner)select('parallel',partner.id); break; }
      case 'editor-add-fallback': { const selection=state.selected,kind=selection?.kind==='orchestrator'?'orchestrator':selection?.kind; const key=kind==='orchestrator'?'orchestrator':`${fieldKind(kind)}:${selection.id}`; const fields=kind==='orchestrator'?state.draft.orchestrator:state.draft.fieldValues[key]; fields.fallbackCount=Number(fields.fallbackCount||0)+1; refresh(); break; }
      case 'choose-repo': HF.feedback('Repository chooser is unavailable in the browser preview'); break;
      case 'builder': launchSheet('builder'); break;
      case 'modal-backdrop': if (event.target === target) closeModal(); break; case 'close-modal': closeModal(); break;
      
      case 'submit-modal': submitModal(); break;
      case 'send-builder': { const input = app.querySelector('#editor-builder-input'); if (!input?.value.trim()) { input?.focus(); break; } state.builderMessage = input.value; state.mockTask = true; state.proposal = false; refresh(); break; }
      case 'apply-proposal': applyProposal(); break;
      case 'dismiss-proposal': state.proposal=false; refresh(); break;
    }
  }, true);
  document.addEventListener('input', event => { const app=event.target.closest('.editor-app'); if(!app)return; if(event.target.matches('[data-editor-field]')) updateField(event.target); if(event.target.id==='editor-builder-input') state.builderMessage=event.target.value; updateSubmitEligibility(app); }, true);
  document.addEventListener('change', event => { const app=event.target.closest('.editor-app'); if(!app)return; if(event.target.matches('[data-editor-field]')) { updateField(event.target); refresh(); } if(event.target.dataset.modalField==='override') app.querySelector('.editor-override-fields').hidden=!event.target.checked; updateSubmitEligibility(app); }, true);
  document.addEventListener('keydown', event => {
    const app=event.target.closest('.editor-app'); if(!app)return;
    if (event.key === 'Escape' && state.modal) { event.preventDefault(); closeModal(); }
    if (state.modal && event.key === 'Tab') { const controls=[...app.querySelectorAll('.editor-modal button:not(:disabled),.editor-modal input:not(:disabled),.editor-modal textarea:not(:disabled),.editor-modal select:not(:disabled)')]; const first=controls[0],last=controls.at(-1); if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()} }
  }, true);
  function closeModal() { const selector=state.modal?.returnAction; state.modal=null; refresh(); const trigger=document.querySelector(selector); const menu=trigger?.closest('details'); if(menu) menu.open=true; trigger?.focus?.(); }
  function updateSubmitEligibility(app) { const button=app.querySelector('[data-editor-action="submit-modal"]'); if(!button)return; const mode=state.modal?.mode; if(mode==='run') button.disabled=!(app.querySelector('[data-modal-field="task"]')?.value.trim()&&app.querySelector('[data-modal-field="repository"]')?.value.trim()); else button.disabled=!(app.querySelector('[data-modal-field="name"]')?.value.trim()&&app.querySelector('[data-modal-field="prompt"]')?.value.trim()); }
  function submitModal() {
    const mode=state.modal?.mode;
    if(mode==='run'){ const task=document.querySelector('[data-modal-field="task"]'),repo=document.querySelector('[data-modal-field="repository"]'); if(!task?.value.trim()||!repo?.value.trim()) { HF.feedback('Enter task instructions and repository path'); (task?.value.trim()?repo:task)?.focus(); return; } state.draft.busy=true; state.draft.selectedRun=true; state.modal=null; HF.feedback('Mock workflow run prepared'); HF.navigate('workflow-run','running'); return; }
    const prompt=document.querySelector('[data-modal-field="prompt"]'), name=document.querySelector('[data-modal-field="name"]'); if(!prompt?.value.trim()||!name?.value.trim()){(prompt?.value.trim()?name:prompt)?.focus();return;} state.draft.name=name.value; state.builderMessage=prompt.value; state.mockTask=true; state.proposal=mode==='propose'||mode==='builder'; state.proposalContext=state.proposal?proposalSnapshot():null; state.draft.workspace=true; state.modal=null; state.route=state.proposal?'proposal-ready':'builder-conversation'; refresh();
  }
  document.addEventListener('dragstart', event => { const app=event.target.closest('.editor-app'); if(!app||!event.target.matches('.editor-node[draggable]'))return; event.dataTransfer.setData('text/plain',event.target.dataset.nodeId); const r=event.target.getBoundingClientRect(); event.target.dataset.dragOffsetX=(event.clientX-r.left)/state.zoom*100; event.target.dataset.dragOffsetY=(event.clientY-r.top)/state.zoom*100; }, true);
  document.addEventListener('dragover', event => { if(event.target.closest('.editor-app .editor-graph')) event.preventDefault(); }, true);
  document.addEventListener('drop', event => { const graph=event.target.closest('.editor-app .editor-graph'); if(!graph)return; const id=event.dataTransfer.getData('text/plain'),node=state.draft.nodes.find(n=>n.id===id); if(!node)return; event.preventDefault(); const rect=graph.getBoundingClientRect(); node.x=Math.max(0,Math.round(((event.clientX-rect.left)/state.zoom*100)/10)*10); node.y=Math.max(0,Math.round(((event.clientY-rect.top)/state.zoom*100)/10)*10); refresh(); }, true);
  }
  function proposalSnapshot() { return { draft: clone(editableDraft()), baseline: clone(editableBaseline()) }; }
  function canApplyProposal() { return !!state.proposal && !!state.proposalContext && !blocked() && deepEqual(state.proposalContext, proposalSnapshot()); }
  function applyProposal() {
    if (!canApplyProposal()) { HF.feedback('The canvas changed after this request. Return to the canvas to keep your edits; open the proposal from history separately.'); return; }
    const id = allocateEntityID('reliability-check', [], true);
    const n={id,title:'Reliability check',type:'agent',role:'review',x:440,y:245,width:200,height:92,backend:'Codex'};
    state.draft.nodes.push(n);
    state.draft.edges = state.draft.edges.filter(edge => edge.id !== 'implementation-review');
    state.draft.edges.push({id:allocateEntityID(`implementation-${id}`, [], true),source:'implementation',target:n.id,condition:''},{id:allocateEntityID(`${id}-review`, [], true),source:n.id,target:'review',condition:''});
    initializeFieldMaps(state.draft); state.selected={kind:'orchestrator',id:'orchestrator'}; state.proposal=false; state.proposalContext=null; state.mockTask=false; state.draft.workspace=false; state.route='saved'; refresh();
  }
  function loadingScreen() {
    const block = (width, height) => `<span class="editor-skeleton" style="width:${width};height:${height}px"></span>`;
    const node = compact => `<div class="editor-loading-node ${compact ? 'compact' : ''}">${block(compact ? '24px' : '75px',12)}${compact ? '' : block('45px',8)}</div>`;
    return `<section class="app workflow-specimen editor-app" data-editor-route="loading" aria-label="Loading workflow canvas"><header class="editor-header editor-loading-header">${block('288px',20)}${block('180px',14)}</header><div class="editor-upper"><div class="editor-loading-canvas"><div class="editor-loading-graph">${node(true)}<i></i>${node(false)}<i></i>${node(false)}<i></i>${node(true)}</div></div><aside class="workflow-editor-inspector editor-loading-inspector">${block('120px',16)}${Array.from({length:5},()=>block('100%',32)).join('')}${block('100%',100)}</aside></div></section>`;
  }
  HF.editorController = {
    reset(route='saved') { HF.resetWorkflowEditor('workflow-editor',route); return this.snapshot(); },
    snapshot() { return { draft: clone(state.draft), baseline: clone(state.baseline), selected: clone(state.selected), canApplyProposal: canApplyProposal(), zoom: state.zoom, dirty: isDirty(), canSave: canSave(), canDiscard: canDiscard(), canRun: canRun() }; },
    select(kind,id) { select(kind,id); return this.snapshot(); },
    setField(key,value) { updateField({dataset:{editorField:key},type:typeof value==='boolean'?'checkbox':'text',checked:value,value}); return this.snapshot(); },
    addNode(kind) { makeNode(kind); return this.snapshot(); },
    addOnDemand() { addOnDemand(); return this.snapshot(); },
    removeSelected() { removeSelected(); return this.snapshot(); },
    addFallback() { const key=fieldKind(state.selected.kind); const fields=key==='orchestrator'?state.draft.orchestrator:state.draft.fieldValues[`${key}:${state.selected.id}`]; if(fields) fields.fallbackCount=Number(fields.fallbackCount||0)+1; return this.snapshot(); },
    applyProposal() { applyProposal(); return this.snapshot(); },
    returnToCanvas() { returnToCanvas(); return this.snapshot(); },
    save() { save(); return this.snapshot(); },
    discard() { discard(); return this.snapshot(); },
    zoomBy(delta) { state.zoom=Math.max(50,Math.min(200,state.zoom+delta)); return this.snapshot(); },
    setGuard(name,value) { if(state.draft) state.draft[name]=value; return this.snapshot(); }
  };
})();
