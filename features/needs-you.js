(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  const reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const reduced = () => $('reduce').checked || reduceQuery.matches;
  const MENU_LIMIT = 3;
  const FADE_MS = 180;

  const LONG_QUESTION = 'Two deployment targets are available for this release: the existing staging cluster in the eu-west region, and the preview environment created by the last workflow run. The preview environment has no monitoring. The staging cluster has monitoring, but another release is already scheduled there for Thursday.\n\nWhich target should this release use? If you choose staging, also say whether the Thursday release should be postponed, because the checklist cannot continue until that is settled. Reply with the target name and, if relevant, the postponement decision.';
  const VERY_LONG_QUESTION = Array.from({ length: 9 }, (_, index) =>
    `${index + 1}. Item ${index + 1} of the migration inventory lists a table, its row count and the owner who last changed it. The workflow cannot tell whether this table may be archived, so please state whether it stays in place, moves to the archive schema, or is dropped after the export finishes, and name anyone who must be told before it changes.`
  ).join('\n\n');

  const people = {
    cc: { type: 'mcp', name: 'Claude Code' },
    codex: { type: 'mcp', name: 'Codex CLI' },
    app: { type: 'app', name: 'Mac app' },
    ctl: { type: 'ctl', name: 'harflow-ctl' },
    task: { type: 'task', name: 'Plan docs overhaul' }
  };
  const startedByLabel = who => who.type === 'mcp' ? `${who.name} · MCP client` : who.type === 'task' ? `Harflow task · ${who.name}` : who.name;

  function makeItems() {
    return [
      { id: 'audit', kind: 'recovery', title: 'Nightly dependency audit', path: ['Nightly dependency audit', 'Audit packages'], by: people.ctl, mins: 120, scope: 'workflow',
        interaction: { owner: 'caller', caller: 'dead', available: true, reason: 'The caller process is no longer running.', handover: null },
        rowText: 'Attempt limit reached (3 of 3) while checking the lockfile. Resume with an answer to continue.',
        text: 'The node reached its attempt limit (3 of 3) while checking the lockfile. The last attempt stopped because two packages report conflicting versions. Say which version to keep, or how the node should proceed, then resume.' },
      { id: 'notes', kind: 'question', title: 'Weekly changelog', path: ['Weekly changelog', 'Draft notes'], by: people.cc, mins: 60, scope: 'workflow',
        interaction: { owner: 'monitor', caller: 'dead', available: true, reason: '', handover: { when: '18 minutes ago', previous: 'Caller', reason: 'The caller process was no longer running.' } },
        rowText: 'Should the changelog mention the renamed settings pane, or only the new options?',
        text: 'Should the changelog mention the renamed settings pane, or only the new options?' },
      { id: 'target', kind: 'question', title: 'Release checklist', path: ['Release checklist', 'Choose deployment target'], by: people.codex, mins: 42, scope: 'workflow',
        interaction: { owner: 'caller', caller: 'dead', available: true, reason: 'The caller process is no longer running.', handover: null },
        rowText: LONG_QUESTION, text: LONG_QUESTION },
      { id: 'region', kind: 'question', title: 'Provision preview environment', path: ['Provision preview environment', 'Pick region'], by: people.ctl, mins: 25, scope: 'workflow',
        interaction: { owner: 'caller', caller: 'unknown', available: false, reason: 'The caller was started through a shell script, so its process cannot be identified.', handover: null },
        rowText: 'Which region should the preview environment use?', text: 'Which region should the preview environment use?' },
      { id: 'schema', kind: 'approval', title: 'Migrate billing exports', path: ['Migrate billing exports', 'Verify exports', 'Apply schema change'], by: people.cc, mins: 14, scope: 'workflow',
        interaction: { owner: 'caller', caller: 'dead', available: true, reason: 'The caller process is no longer running.', handover: null },
        action: 'Run command', description: 'The Apply schema change node wants to run a command outside its allowed commands.',
        command: './scripts/apply-schema.sh --target staging',
        inputs: [['Working folder', '~/Projects/billing'], ['Access level', 'Write in repository']],
        rowText: 'Run command: ./scripts/apply-schema.sh --target staging' },
      { id: 'webhook', kind: 'approval', title: 'Add retry to webhook client', path: ['Add retry to webhook client'], by: people.cc, mins: 9, scope: 'task',
        interaction: null,
        action: 'Edit file', description: 'The task wants to change a file outside the folders it may write to.',
        command: 'src/clients/webhook.py',
        inputs: [['Change', '14 lines added, 2 removed']],
        rowText: 'Edit file: src/clients/webhook.py' },
      { id: 'audience', kind: 'question', title: 'Quarterly report draft', path: ['Quarterly report draft', 'Review loop', 'Confirm audience'], by: people.app, mins: 3, scope: 'workflow',
        interaction: { owner: 'monitor', caller: 'alive', available: true, reason: '', handover: null },
        rowText: 'Who is the audience for the quarterly summary: leadership or the wider team?',
        text: 'Who is the audience for the quarterly summary: leadership or the wider team?' },
      { id: 'links', kind: 'question', title: 'Docs link check', path: ['Docs link check', 'Review broken links'], by: people.task, mins: 1, scope: 'workflow',
        interaction: { owner: 'caller', caller: 'alive', available: false, reason: 'The caller process is still running.', handover: null },
        rowText: 'Three links return 404. Remove them, or replace them with the archived versions?',
        text: 'Three links return 404. Remove them, or replace them with the archived versions?' }
    ];
  }
  const byId = (items, id) => items.find(item => item.id === id);
  const clone = value => JSON.parse(JSON.stringify(value));

  const kindLabel = { approval: 'Approval', question: 'Question', recovery: 'Recovery' };
  const callerLabel = { alive: 'Connected', dead: 'Ended', unknown: 'Unknown' };
  const callerClass = { alive: 'cs-alive', dead: 'cs-dead', unknown: 'cs-unknown' };

  const surfaceStates = {
    list: [['populated', 'Populated'], ['single', 'Single item'], ['empty', 'Empty'], ['loading', 'Loading'], ['error', 'Partial list error'], ['older', 'Older engine']],
    detail: [['answerable', 'Answerable'], ['handed-over', 'Already handed over'], ['waiting', 'Waiting for caller'], ['unknown', 'Caller unknown'], ['handed-live', 'Handed over live'], ['submitting', 'Submitting'], ['answered', 'Answered'], ['expired', 'Expired'], ['refused', 'Refused on submit'], ['recovery', 'Recovery checkpoint'], ['very-long', 'Very long text'], ['older', 'Older engine']],
    notify: [['question', 'Question'], ['approval', 'Approval'], ['recovery', 'Recovery'], ['waiting', 'Waiting for caller'], ['grouped', 'Several grouped']],
    menubar: [['populated', 'Populated'], ['few', 'Two items'], ['empty', 'Empty'], ['older', 'Older engine']]
  };
  const surfaceHints = {
    list: 'Sidebar row above Running, with the list in the detail pane. Select a title to open the request.',
    detail: 'Full request, provenance and ownership. Use the Request kind control for Question or Approval states.',
    notify: 'A mock macOS banner. Waiting-for-caller requests also notify, and the banner says so. Select a banner to open the request.',
    menubar: `Menu-bar popover with up to ${MENU_LIMIT} requests. Show all opens the main window list.`
  };

  let S;
  let timer = null;
  function fresh() {
    return { surface: 'list', listState: 'populated', state: 'populated', items: makeItems(), current: null, phase: 'idle', answer: '', attempts: '1',
      expandedRows: {}, detailExpanded: false, notice: '', error: '', unreadable: 0, loading: false, live: false, focus: null, leavingId: null,
      notify: 'question', menu: 'populated', answeredTitle: '', answeredText: '', unsent: '' };
  }
  function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
  function announce(text) { $('live').textContent = text; }

  // Mode mapping from engine interaction_state.
  function mode(r) {
    const i = r.interaction;
    if (!i) return r.scope === 'task' ? 'task-level' : 'older';
    if (i.owner === 'monitor') return i.handover ? 'handed-over' : 'monitor-owned';
    if (i.caller === 'alive') return 'waiting';
    if (i.caller === 'unknown') return 'unknown';
    return i.available ? 'answerable' : 'unavailable';
  }
  const answerable = r => ['answerable', 'handed-over', 'monitor-owned'].includes(mode(r));
  const callerStatus = r => r.interaction ? r.interaction.caller : 'unknown';
  const age = m => m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
  const firstLine = text => String(text).split('\n')[0];
  const sorted = items => items.slice().sort((a, b) => b.mins - a.mins);
  const lastSegment = r => r.path[r.path.length - 1];
  const waitingFor = r => r.by.name;

  function pathHtml(r) {
    return `<ol class="path" aria-label="Path">${r.path.map(segment => `<li>${esc(segment)}</li>`).join('')}</ol>`;
  }
  function kindChip(r) { return `<span class="kind kind-${r.kind}">${kindLabel[r.kind]}</span>`; }
  function callerChip(r) {
    const status = callerStatus(r);
    return `<span class="cstatus ${callerClass[status]}">${callerLabel[status]}</span>`;
  }

  // ---- State presets -------------------------------------------------------------------
  function detailPreset(state, kindValue) {
    const base = state === 'recovery' ? byId(makeItems(), 'audit') : byId(makeItems(), kindValue === 'approval' ? 'schema' : 'target');
    const r = clone(base);
    if (state === 'very-long') r.text = r.rowText = VERY_LONG_QUESTION;
    const i = r.interaction;
    if (state === 'handed-over') { i.owner = 'monitor'; i.handover = { when: '18 minutes ago', previous: 'Caller', reason: 'The caller process was no longer running.' }; i.reason = ''; }
    if (state === 'waiting' || state === 'handed-live') { i.caller = 'alive'; i.available = false; i.reason = 'The caller process is still running.'; }
    if (state === 'unknown') { i.caller = 'unknown'; i.available = false; i.reason = 'The caller was started through a shell script, so its process cannot be identified.'; }
    if (state === 'older') { r.interaction = null; r.scope = 'workflow'; }
    return r;
  }

  function applyState() {
    clearTimer();
    const surface = $('surface').value, state = $('state').value, width = S.width;
    S = fresh(); S.width = width; S.surface = surface; S.state = state;
    if (surface === 'list') {
      S.listState = state;
      if (state === 'single') S.items = [byId(S.items, 'schema')];
      if (state === 'empty') S.items = [];
      if (state === 'loading') { S.items = []; S.loading = true; }
      if (state === 'error') { S.items = ['notes', 'target', 'schema', 'links'].map(id => byId(S.items, id)); S.unreadable = 2; }
      if (state === 'older') S.items.forEach(item => { item.interaction = null; if (item.scope !== 'task') item.scope = 'workflow'; });
    }
    if (surface === 'detail') {
      S.current = detailPreset(state, $('kind').value);
      S.items = S.items.map(item => item.id === S.current.id ? S.current : item);
      if (state === 'submitting') { S.phase = 'submitting'; S.answer = S.current.kind === 'approval' ? '' : 'Use staging, and postpone the Thursday release.'; S.submitted = S.current.kind === 'approval' ? 'Approve once' : 'Send answer'; }
      if (state === 'answered') { S.submitted = S.current.kind === 'approval' ? 'Approve once' : 'Send answer'; settle('Use staging, and postpone the Thursday release.'); }
      if (state === 'expired') { S.phase = 'expired'; }
      if (state === 'refused') { S.answer = 'Use staging, and postpone the Thursday release.'; S.phase = 'idle'; S.error = 'This request changed after you opened it. Review the current question, then send again.'; }
      if (state === 'handed-live') { S.live = true; }
    }
    if (surface === 'notify') { S.notify = state; }
    if (surface === 'menubar') {
      S.menu = state;
      if (state === 'few') S.items = ['audience', 'schema'].map(id => byId(S.items, id));
      if (state === 'empty') S.items = [];
      if (state === 'older') S.items.forEach(item => { item.interaction = null; if (item.scope !== 'task') item.scope = 'workflow'; });
    }
    syncControls();
    render();
  }

  function syncControls() {
    $('kind').disabled = !(S.surface === 'detail') || $('state').value === 'recovery';
    $('surface-hint').textContent = surfaceHints[$('surface').value] || '';
    const hasSubmitting = S.phase === 'submitting';
    ['deliver-accept', 'deliver-returned', 'deliver-changed', 'deliver-expired'].forEach(id => { $(id).disabled = !hasSubmitting; });
    $('deliver-ended').disabled = !(S.live && S.current && mode(S.current) === 'waiting');
  }

  function fillStates(surface, selected) {
    $('state').replaceChildren(...surfaceStates[surface].map(([value, label]) => {
      const option = document.createElement('option'); option.value = value; option.textContent = label; return option;
    }));
    $('state').value = selected || surfaceStates[surface][0][0];
  }

  // Navigate by interacting inside the specimen (does not rebuild fixtures).
  function navigate(surface, current) {
    S.surface = surface; S.current = current || null; S.phase = 'idle'; S.answer = ''; S.error = ''; S.notice = ''; S.detailExpanded = false; S.live = false;
    $('surface').value = surface;
    if (surface === 'detail') {
      const m = current ? mode(current) : 'answerable';
      const stateId = m === 'waiting' ? 'waiting' : m === 'unknown' || m === 'unavailable' ? 'unknown' : m === 'handed-over' ? 'handed-over' : m === 'older' || m === 'task-level' ? 'older' : current && current.kind === 'recovery' ? 'recovery' : 'answerable';
      fillStates('detail', stateId);
      if (current && (current.kind === 'question' || current.kind === 'approval')) $('kind').value = current.kind;
      S.focus = 'detail-heading';
    } else {
      S.state = S.surface === 'list' ? S.listState : 'populated';
      fillStates(surface, S.state);
      S.focus = surface === 'list' ? (current ? `open-${current.id}` : 'list-heading') : null;
    }
    syncControls();
    render();
  }

  function settle(answerText) {
    S.phase = 'answered'; S.answeredText = answerText; S.answeredTitle = S.current.title;
    S.items = S.items.filter(item => item.id !== S.current.id);
  }

  // ---- Rendering -----------------------------------------------------------------------
  function sidebar() {
    const count = S.items.length;
    const badge = S.loading ? '' : count === 0 ? '' : `<span class="badge" aria-hidden="true">${S.unreadable ? `${count}+` : count}</span>`;
    const label = S.loading ? 'Needs you, loading' : count === 0 ? 'Needs you, nothing pending' : `Needs you, ${S.unreadable ? 'at least ' : ''}${count} pending`;
    const current = S.surface === 'list' || S.surface === 'detail';
    const stub = (name, tint) => `<li class="sb-row" aria-hidden="true"><span class="dot dot-${tint}"></span><span>${name}</span></li>`;
    return `<nav class="sidebar" aria-label="Sidebar">
      <ul class="sb-list">
        <li><button type="button" class="sb-row sb-needs" data-act="show-list" data-fk="sidebar-needs" ${current ? 'aria-current="page"' : ''} aria-label="${esc(label)}"><span class="sb-glyph" aria-hidden="true">!</span><span class="sb-name" aria-hidden="true">Needs you</span>${badge}</button></li>
      </ul>
      <p class="sb-label">Running</p><ul class="sb-list">${stub('Refactor settings screen', 'run')}${stub('Triage support inbox', 'run')}</ul>
      <p class="sb-label">Today</p><ul class="sb-list">${stub('Update release notes', 'done')}${stub('Fix flaky timeout test', 'done')}</ul>
      <p class="sb-label">Earlier</p><ul class="sb-list">${stub('Audit lockfile', 'done')}</ul>
      <div class="sb-footer" aria-hidden="true"><span>Settings</span></div>
    </nav>`;
  }

  function rowHtml(r) {
    const m = mode(r);
    const long = r.rowText.length > 180;
    const open = !!S.expandedRows[r.id];
    const clamped = long && !open;
    let guidance = '';
    if (m === 'waiting') guidance = `<p class="nr-note">Waiting for ${esc(waitingFor(r))}. ${esc(r.interaction.reason)}</p>`;
    if (m === 'unknown' || m === 'unavailable') guidance = `<p class="nr-note">Harflow could not confirm the caller ended, so it will not take over.</p>`;
    if (m === 'older' || m === 'task-level') guidance = `<p class="nr-note">Answer through ${esc(r.by.name)}. This engine does not report who can answer here.</p>`;
    const action = answerable(r) ? 'Answer' : 'View';
    return `<li class="need-row${S.leavingId === r.id ? ' leaving' : ''}" data-row="${esc(r.id)}">
      <div class="nr-main">
        <div class="nr-top">${kindChip(r)}<button type="button" class="nr-title" data-act="open" data-id="${esc(r.id)}" data-fk="open-${esc(r.id)}">${esc(r.title)}</button></div>
        ${r.path.length > 1 ? pathHtml(r) : '<p class="nr-task">Task</p>'}
        <p class="nr-text${clamped ? ' clamped' : ''}">${esc(r.rowText)}</p>
        ${long ? `<button type="button" class="link" data-act="toggle-row" data-id="${esc(r.id)}" data-fk="more-${esc(r.id)}" aria-expanded="${open}">${open ? 'Show less' : 'Show more'}</button>` : ''}
        <p class="nr-meta"><span>Started by ${esc(startedByLabel(r.by))}</span><span>Caller ${callerChip(r)}</span><span>${age(r.mins)}</span></p>
        ${guidance}
      </div>
      <div class="nr-side"><button type="button" data-act="open" data-id="${esc(r.id)}" aria-label="${action} ${esc(r.title)}">${action}</button></div>
    </li>`;
  }

  function listPane() {
    const n = S.items.length;
    const head = `<header class="pane-head"><h2 id="list-heading" tabindex="-1" data-fk="list-heading">Needs you</h2><p>${S.loading ? 'Checking tasks and workflow runs…' : n === 0 ? 'Nothing needs you' : `${S.unreadable ? 'At least ' : ''}${n} ${n === 1 ? 'request' : 'requests'} from tasks and workflow runs`}</p></header>`;
    let body;
    if (S.loading) {
      body = `<div class="skeleton-list" role="status" aria-label="Loading requests" aria-busy="true">${[0, 1, 2].map(() => '<div class="skeleton-row"><span class="sk sk-a"></span><span class="sk sk-b"></span><span class="sk sk-c"></span></div>').join('')}</div>`;
    } else if (n === 0) {
      body = `<div class="empty"><h3>Nothing needs you</h3><p>Approvals, questions and recovery checkpoints from any run appear here when they are waiting.</p></div>`;
    } else {
      body = `<ul class="need-list" aria-label="Pending requests">${sorted(S.items).map(rowHtml).join('')}</ul>`;
    }
    const legacy = !S.loading && n > 0 && S.items.every(r => !r.interaction) && S.items.some(r => r.scope === 'workflow')
      ? '<p class="banner-note" role="note">This engine does not report who can answer. These requests are read-only here; answer through the caller that started each run.</p>' : '';
    const partial = S.unreadable ? `<div class="banner-note warn" role="status"><span>Could not read ${S.unreadable} runs. Showing the requests Harflow could read.</span><button type="button" class="link" data-act="retry" data-fk="retry">Try again</button></div>` : '';
    return `<div class="pane-scroll">${head}${partial}${legacy}${body}</div>`;
  }

  function requestCard(r) {
    const m = mode(r);
    const can = answerable(r);
    const busy = S.phase === 'submitting';
    const long = r.kind === 'question' && r.text.length > 900;
    const text = r.kind === 'approval' ? '' :
      `<div class="req-text${long && !S.detailExpanded ? ' clamped' : ''}" id="req-text">${esc(r.text)}</div>${long ? `<button type="button" class="link" data-act="toggle-detail" data-fk="detail-more" aria-expanded="${S.detailExpanded}">${S.detailExpanded ? 'Show less' : 'Show more'}</button>` : ''}`;
    const approval = r.kind !== 'approval' ? '' : `<div class="approval-body"><strong class="action-title">${esc(r.action)}</strong><p>${esc(r.description)}</p><pre>${esc(r.command)}</pre><dl class="inputs">${r.inputs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>`;
    const recoveryHead = r.kind === 'recovery' ? '<h3 class="rec-title">Attempt limit reached</h3>' : '';
    const source = `${esc(kindLabel[r.kind])} · ${esc(lastSegment(r))}`;
    const label = can ? `<p class="req-source">${source}</p>` : `<p class="req-source plain">${source} · Pending</p>`;
    let controls = '';
    if (can && S.phase !== 'answered' && S.phase !== 'expired') {
      const owned = m === 'handed-over' || m === 'monitor-owned';
      const handoverCopy = owned
        ? `<p class="handover-note">Harflow owns this run, so you can answer here.${m === 'handed-over' ? ` ${esc(r.by.name)} can no longer answer it.` : ''}</p>`
        : `<p class="handover-note">${esc(r.by.name)} has ended. Answering hands this run to Harflow, and ${esc(r.by.name)} can no longer answer it. Harflow checks again when you send, and the engine may refuse.</p>`;
      if (r.kind === 'approval') {
        controls = `${handoverCopy}<div class="approval-buttons"><button type="button" class="primary" data-act="submit" data-decision="approve" data-fk="approve" ${busy ? 'disabled' : ''}>${busy ? 'Submitting…' : 'Approve once'}</button><button type="button" class="reject" data-act="submit" data-decision="reject" data-fk="reject" ${busy ? 'disabled' : ''}>Reject</button></div>`;
      } else {
        const extra = r.kind === 'recovery' ? `<label class="field">Additional attempts<input type="number" min="0" id="attempts" value="${esc(S.attempts)}" ${busy ? 'disabled' : ''}></label>` : '';
        controls = `<label class="field" for="answer">${r.kind === 'recovery' ? 'Answer' : 'Your answer'}</label><textarea id="answer" data-fk="answer" placeholder="Type your answer…" ${busy ? 'disabled' : ''}>${esc(S.answer)}</textarea>${extra}${handoverCopy}<div class="approval-buttons"><button type="button" class="primary" id="send" data-act="submit" data-decision="answer" data-fk="send" ${busy || !S.answer.trim() ? 'disabled' : ''}>${busy ? 'Submitting…' : r.kind === 'recovery' ? 'Resume with answer' : 'Send answer'}</button></div>`;
      }
      if (busy) controls += `<p class="status-line" role="status">Submitting your ${r.kind === 'approval' ? 'decision' : 'answer'} to the engine…</p>`;
    }
    let readOnly = '';
    if (!can && S.phase !== 'expired' && S.phase !== 'answered') {
      let title, body;
      if (m === 'waiting') { title = `Waiting for ${r.by.name}`; body = `${r.by.name} is connected and can still answer. Harflow answers only after the caller has ended. ${r.interaction.reason}`; }
      else if (m === 'unknown' || m === 'unavailable') { title = 'Caller status unknown'; body = `Harflow could not confirm that ${r.by.name} ended, so it will not take over this run. ${r.interaction.reason} Answer through the caller.`; }
      else if (m === 'task-level') { title = 'Answer through the caller'; body = `This engine reports caller status for workflow runs only, so Harflow cannot tell whether ${r.by.name} has ended. Answer through the caller.`; }
      else { title = 'Answer through the caller'; body = `This engine does not report who can answer, so this request is read-only here. Answer through ${r.by.name}.`; }
      readOnly = `<div class="readonly"><strong>${esc(title)}</strong><p>${esc(body)}</p></div>`;
    }
    const unsent = S.unsent ? `<label class="field" for="unsent">Your unsent answer</label><textarea id="unsent" readonly>${esc(S.unsent)}</textarea>` : '';
    const error = S.error ? `<p class="error" role="alert">${esc(S.error)}</p>` : '';
    if (S.phase === 'answered') return settledCard(r);
    if (S.phase === 'expired') {
      return `<section class="need-card settled" aria-label="Request"><p class="req-source plain">${source} · Expired</p><p class="settled-title">This request is no longer pending</p><p class="muted">It expired before it was answered, or another responder answered it. Nothing was sent.</p></section>`;
    }
    return `<section class="need-card${can ? ' pending' : ' readonly-card'}${S.leavingId === r.id ? ' leaving' : ''}" aria-label="Request">${label}${recoveryHead}${text}${approval}${r.kind === 'recovery' ? `<p class="muted">The run stopped after its configured attempts. The checkpoint stays as it is until an answer arrives.</p>` : ''}${error}${readOnly}${unsent}${controls}</section>`;
  }

  function settledCard(r) {
    const decision = S.submitted === 'Reject' ? 'Rejected' : r.kind === 'approval' ? 'Approved once' : r.kind === 'recovery' ? 'Resumed with answer' : 'Answered';
    const detail = r.kind === 'approval' ? '' : `<p class="settled-answer">${esc(S.answeredText)}</p>`;
    return `<section class="need-card settled arrive" aria-label="Request"><p class="req-source plain">${esc(kindLabel[r.kind])} · ${esc(lastSegment(r))}</p><p class="settled-title">${decision} by Harflow</p>${detail}<p class="muted">Harflow now owns this run. ${esc(r.by.name)} can no longer answer it, and ${esc(r.title)} no longer needs you.</p></section>`;
  }

  function provenance(r) {
    const m = mode(r);
    const owner = ['handed-over', 'monitor-owned'].includes(m) ? 'Harflow' : m === 'answerable' ? `${r.by.name} (ended; Harflow can take over)` : m === 'task-level' || m === 'older' ? 'Not reported by this engine' : 'Caller';
    const rows = [
      ['Run', r.title], ['Path', r.path.length > 1 ? r.path.join(' › ') : 'Task'], ['Started by', startedByLabel(r.by)],
      ['Caller', `${callerLabel[callerStatus(r)]}${r.interaction ? '' : ' · not reported'}`], ['Owner', owner], ['Waiting since', age(r.mins)]
    ];
    if (r.interaction && r.interaction.reason) rows.push(['Engine note', r.interaction.reason]);
    if (r.interaction && r.interaction.handover) rows.push(['Handover', `${r.interaction.handover.when}. Previous owner: ${r.interaction.handover.previous}. ${r.interaction.handover.reason}`]);
    return `<section class="provenance" aria-labelledby="prov-title"><h3 id="prov-title">Provenance and ownership</h3><dl>${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`;
  }

  function detailPane() {
    const r = S.current;
    const notice = S.notice ? `<p class="notice arrive" role="status">${esc(S.notice)}</p>` : '';
    return `<div class="pane-scroll"><button type="button" class="back" data-act="back" data-fk="back"><span aria-hidden="true">‹</span> Needs you</button>
      <header class="req-head">${kindChip(r)}<h2 id="detail-heading" tabindex="-1" data-fk="detail-heading">${esc(r.title)}</h2>${r.path.length > 1 ? pathHtml(r) : ''}</header>
      ${notice}${requestCard(r)}${provenance(r)}</div>`;
  }

  function windowHtml() {
    const pane = S.surface === 'detail' ? detailPane() : listPane();
    return `<div class="win" style="width:${S.width}px"><div class="titlebar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="wtitle">Harflow</span></div><div class="split">${sidebar()}<section class="detail" aria-label="${S.surface === 'detail' ? 'Request detail' : 'Needs you'}">${pane}</section></div></div>`;
  }

  function notifyTitle(r) { return `${kindLabel[r.kind]}: ${r.title}`; }
  function notifyBody(r) { return r.kind === 'approval' ? r.rowText : firstLine(r.text); }
  function bannerHtml(r, subtitle) {
    return `<button type="button" class="banner" data-act="open" data-id="${esc(r.id)}" data-fk="banner-${esc(r.id)}"><img src="../assets/branding/app-icon-64.png" alt="" width="32" height="32"><span class="b-text"><span class="b-app">Harflow<span class="b-time">now</span></span><span class="b-title">${esc(notifyTitle(r))}</span>${subtitle ? `<span class="b-sub">${esc(subtitle)}</span>` : ''}<span class="b-body">${esc(notifyBody(r))}</span></span></button>`;
  }
  function notifyHtml() {
    const items = makeItems();
    const pick = id => byId(items, id);
    let inner;
    if (S.notify === 'question') inner = bannerHtml(pick('target'));
    else if (S.notify === 'approval') inner = bannerHtml(pick('schema'));
    else if (S.notify === 'recovery') inner = bannerHtml(pick('audit'));
    else if (S.notify === 'waiting') inner = bannerHtml(pick('links'), `Waiting for ${pick('links').by.name}`);
    else {
      const group = ['schema', 'target', 'links'].map(pick);
      inner = `<div class="stack"><span class="stack-layer l2" aria-hidden="true"></span><span class="stack-layer l1" aria-hidden="true"></span><button type="button" class="banner grouped" data-act="show-list" data-fk="banner-group"><img src="../assets/branding/app-icon-64.png" alt="" width="32" height="32"><span class="b-text"><span class="b-app">Harflow<span class="b-time">now</span></span><span class="b-title">3 requests need you</span><span class="b-body">${group.map(r => `${esc(notifyTitle(r))}${r.interaction.caller === 'alive' ? ' (waiting for ' + esc(r.by.name) + ')' : ''}`).join('<br>')}</span></span></button></div>`;
    }
    return `<div class="desktop" style="width:${S.width}px"><div class="macbar" aria-hidden="true"><span>Finder</span><span class="macbar-r">Tue 10:42</span></div><div class="banner-slot">${inner}</div></div>`;
  }

  function menuRow(r) {
    const status = callerStatus(r);
    const sub = r.interaction ? `${callerLabel[status]} · ${esc(r.by.name)}` : `Answer through ${esc(r.by.name)}`;
    return `<li><button type="button" class="mb-row" data-act="open" data-id="${esc(r.id)}" data-fk="mb-${esc(r.id)}">${kindChip(r)}<span class="mb-text"><span class="mb-title">${esc(r.title)}</span><span class="mb-sub">${sub}</span></span></button></li>`;
  }
  function menubarHtml() {
    const items = sorted(S.items);
    const n = items.length;
    const shown = items.slice(0, MENU_LIMIT);
    const label = n ? `Harflow, ${n} ${n === 1 ? 'request needs' : 'requests need'} you` : 'Harflow';
    const section = n === 0
      ? '<p class="mb-empty">Nothing needs you</p>'
      : `<ul class="mb-list" aria-label="Needs you">${shown.map(menuRow).join('')}</ul>${n > shown.length ? `<button type="button" class="mb-all" data-act="show-list" data-fk="mb-all">Show all ${n}</button>` : ''}`;
    return `<div class="desktop menubar" style="width:${S.width}px"><div class="macbar"><span aria-hidden="true">Finder</span><span class="macbar-r"><span class="extra" role="img" aria-label="${esc(label)}"><img src="../assets/branding/menubarTemplate.png" alt="" width="16" height="16">${n ? `<b>${n}</b>` : ''}</span><span aria-hidden="true">Tue 10:42</span></span></div>
      <div class="popover" role="group" aria-label="Harflow menu-bar extra"><header><strong>2 running</strong><span>Connected</span></header>
      <div class="mb-section"><p class="mb-label">Needs you${n ? ` · ${n}` : ''}</p>${section}</div>
      <div class="mb-section"><p class="mb-label">Running</p><p class="mb-static">Refactor settings screen</p><p class="mb-static">Triage support inbox</p></div>
      <footer><span>New session</span><span>Open Harflow</span></footer></div></div>`;
  }

  function render() {
    const active = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fk : null;
    const want = S.focus || active;
    S.focus = null;
    const html = S.surface === 'notify' ? notifyHtml() : S.surface === 'menubar' ? menubarHtml() : windowHtml();
    $('specimen').innerHTML = html;
    if (S.surface === 'detail') { const answer = $('answer'); if (answer) answer.value = S.answer; }
    if (want) { const target = $('specimen').querySelector(`[data-fk="${CSS.escape(want)}"]`); if (target) target.focus({ preventScroll: true }); }
    syncControls();
  }

  // ---- Interaction ---------------------------------------------------------------------
  function submit(decision) {
    const r = S.current;
    if (!r || S.phase === 'submitting') return;
    if (decision === 'answer' && !S.answer.trim()) return;
    S.phase = 'submitting'; S.error = ''; S.unsent = '';
    S.submitted = decision === 'reject' ? 'Reject' : decision === 'approve' ? 'Approve once' : 'Send answer';
    announce('Submitting. Choose the engine response in the fixture controls.');
    render();
  }

  function resolveAccept() {
    const r = S.current; if (!r || S.phase !== 'submitting') return;
    const answerText = S.answer;
    const finish = () => { S.leavingId = null; settle(answerText); S.focus = 'back'; announce('Answer accepted. The request left Needs you.'); render(); };
    if (reduced()) { finish(); return; }
    S.leavingId = r.id; render();
    timer = setTimeout(finish, FADE_MS);
  }
  function resolveReturned() {
    const r = S.current; if (!r || S.phase !== 'submitting') return;
    r.interaction.caller = 'alive'; r.interaction.available = false; r.interaction.reason = 'The caller process is running again.';
    S.items.forEach(item => { if (item.id === r.id) item.interaction = r.interaction; });
    S.phase = 'idle'; S.unsent = S.answer; S.error = `${r.by.name} returned before Harflow took over, so nothing was sent and the caller keeps ownership. Your answer is kept below.`;
    announce('Refused. The caller returned.'); render();
  }
  function resolveChanged() {
    const r = S.current; if (!r || S.phase !== 'submitting') return;
    S.phase = 'idle'; S.error = 'This request changed after you opened it. Review the current question, then send again. Your answer is kept.';
    announce('Refused. The checkpoint changed.'); S.focus = 'answer'; render();
  }
  function resolveExpired() {
    const r = S.current; if (!r || S.phase !== 'submitting') return;
    S.items = S.items.filter(item => item.id !== r.id);
    S.phase = 'expired'; announce('The request expired.'); S.focus = 'back'; render();
  }
  function resolveEnded() {
    const r = S.current; if (!r || !S.live || mode(r) !== 'waiting') return;
    r.interaction.caller = 'dead'; r.interaction.available = true; r.interaction.reason = 'The caller process is no longer running.';
    S.live = false; S.notice = `${r.by.name} ended. Harflow can now take this request.`;
    announce(S.notice); render();
  }

  function onClick(event) {
    const target = event.target.closest('[data-act]');
    if (!target) return;
    const act = target.dataset.act, id = target.dataset.id;
    if (act === 'open') navigate('detail', byId(S.items, id) || null);
    else if (act === 'show-list') navigate('list', null);
    else if (act === 'back') navigate('list', S.current && S.items.some(item => item.id === S.current.id) ? S.current : null);
    else if (act === 'toggle-row') { S.expandedRows[id] = !S.expandedRows[id]; S.focus = `more-${id}`; render(); }
    else if (act === 'toggle-detail') { S.detailExpanded = !S.detailExpanded; S.focus = 'detail-more'; render(); }
    else if (act === 'submit') submit(target.dataset.decision);
    else if (act === 'retry') announce('Fixture only: a retry would read the runs again. Choose another State to see a result.');
  }

  $('specimen').addEventListener('click', onClick);
  $('specimen').addEventListener('input', event => {
    if (event.target.id === 'answer') {
      S.answer = event.target.value;
      const send = $('send'); if (send) send.disabled = !S.answer.trim() || S.phase === 'submitting';
    }
    if (event.target.id === 'attempts') S.attempts = event.target.value;
  });
  $('surface').addEventListener('change', () => { fillStates($('surface').value); applyState(); });
  $('state').addEventListener('change', applyState);
  $('kind').addEventListener('change', applyState);
  $('width').addEventListener('change', () => { S.width = Number($('width').value); render(); });
  $('theme').addEventListener('change', () => { document.documentElement.dataset.theme = $('theme').value; });
  $('reduce').addEventListener('change', () => { document.documentElement.classList.toggle('reduce-motion', $('reduce').checked); });
  $('deliver-accept').addEventListener('click', resolveAccept);
  $('deliver-returned').addEventListener('click', resolveReturned);
  $('deliver-changed').addEventListener('click', resolveChanged);
  $('deliver-expired').addEventListener('click', resolveExpired);
  $('deliver-ended').addEventListener('click', resolveEnded);
  $('reset').addEventListener('click', () => {
    clearTimer();
    $('surface').value = 'list'; fillStates('list'); $('kind').value = 'question'; $('width').value = '1000';
    S = fresh(); S.width = 1000; announce('Fixture controls are enabled when the matching state is reached.');
    applyState();
  });

  S = fresh(); S.width = 1000; $('width').value = '1000';
  fillStates('list');
  applyState();
})();
