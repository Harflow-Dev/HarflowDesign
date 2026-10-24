import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scripts = ['tokens.js', 'registry.js', 'components.js', 'tasks.js', 'task-activity.js', 'task-approvals.js', 'task-summary.js', 'workflows.js', 'dialogs.js', 'foundations.js'];

function loadDesignRuntime() {
  const document = { querySelector: () => ({ textContent: '', classList: { add() {} } }) };
  const context = vm.createContext({
    window: {},
    document,
    setTimeout,
    clearTimeout,
  });
  context.window = context;
  for (const file of scripts) {
    vm.runInContext(fs.readFileSync(path.join(root, 'scripts', file), 'utf8'), context, { filename: file });
  }
  return context.HF;
}

const renderers = {
  foundations: (hf, state) => hf.renderFoundations(state),
  tasks: (hf, state) => hf.renderTasks('tasks', state),
  'task-detail': (hf, state) => hf.renderTasks('task-detail', state),
  summary: (hf, state) => hf.renderTasks('summary', state),
  approvals: (hf, state) => hf.renderTasks('approvals', state),
  'raw-events': (hf, state) => hf.renderRaw(state),
  parallel: (hf, state) => hf.renderParallel(state),
  'workflow-editor': (hf, state) => hf.renderEditor(state),
  'workflow-run': (hf, state) => hf.renderRun(state),
  'new-session': (hf, state) => hf.renderNew(state),
  'workflow-launch': (hf, state) => hf.renderLaunch(state),
  settings: (hf, state) => hf.renderSettings(state),
  'mcp-permissions': (hf, state) => hf.renderMCP(state),
  'menu-bar': (hf, state) => hf.renderMenu(state),
};

test('registry has a renderer and distinct state output for every screen state', () => {
  const hf = loadDesignRuntime();
  assert.equal(hf.screens.length, Object.keys(renderers).length);
  for (const family of hf.screens) {
    const render = renderers[family.id];
    assert.ok(render, `missing renderer for ${family.id}`);
    for (const theme of ['light', 'dark']) {
      hf.route = { theme };
      const outputs = family.states.map((state) => {
        const html = render(hf, state);
        assert.ok(html.length > 100, `${family.id}/${state}/${theme} rendered no specimen`);
        assert.doesNotMatch(html, /undefined|null/, `${family.id}/${state}/${theme} contains an unresolved value`);
        return html;
      });
      assert.ok(new Set(outputs).size > 1, `${family.id} states all render the same output`);
    }
  }
});

test('registry source links resolve in the pinned HarflowMac tree', () => {
  const hf = loadDesignRuntime();
  const mac = path.resolve(root, '..', 'HarflowMac');
  assert.match(hf.base, /HarflowMac\/blob\/[0-9a-f]{40}\/macos\/$/);
  const commit = hf.commit;
  for (const family of hf.screens) {
    const result = requireGit(mac, ['cat-file', '-e', `${commit}:macos/${family.source}`]);
    assert.equal(result, 0, `${family.id} source is missing at pinned commit: ${family.source}`);
  }
});

function requireGit(cwd, args) {
  return spawnSync('git', ['-C', cwd, ...args], { stdio: 'ignore' }).status;
}

test('index uses only local preview dependencies', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [, href] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(!/^(?:https?:)?\/\//.test(href), `external dependency in index: ${href}`);
    if (!href.startsWith('#')) assert.ok(fs.existsSync(path.join(root, href.split(/[?#]/)[0])), `missing local dependency: ${href}`);
  }
});

test('escaping protects hostile mock form values and approval labels', () => {
  const hf = loadDesignRuntime();
  const hostile = `</textarea><img src=x onerror="alert(1)"><script>bad()</script>&"'`;
  const escaped = hf.escape(hostile);
  assert.equal(escaped, '&lt;/textarea&gt;&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&lt;script&gt;bad()&lt;/script&gt;&amp;&quot;&#39;');
  assert.doesNotMatch(hf.field('Repository', hostile), /<(?:img|script)\b|onerror="/);
  assert.doesNotMatch(hf.chip(hostile), /<(?:img|script)\b|onerror="/);
  const catalog = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  assert.match(catalog, /ta-user-message.*HF\.escape\(text\)/);
  assert.match(catalog, /insertAdjacentHTML\('beforeend',`<div class="settings-row"><code>\$\{HF\.escape\(input\.value\)\}/);
});

test('terminal and session action gating is represented in the catalog controller', () => {
  const catalog = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  assert.match(catalog, /\['busy','loading','missing-cli'\]\.includes\(state\)/);
  assert.match(catalog, /x\.disabled=state==='busy'/);
  const hf = loadDesignRuntime();
  const newBusy = hf.renderNew('busy');
  assert.match(newBusy, /Starting…/);
  assert.match(newBusy, /data-action="start-session"/);
  const newNormal = hf.renderNew('default');
  assert.match(newNormal, />Start<\/button>/);
});

test('rendered specimens preserve fixture identity and ownership semantics', () => {
  const hf = loadDesignRuntime();
  const taskList = hf.renderTasks('tasks', 'populated');
  assert.ok(hf.fixtures.length >= 4, 'fixture catalog should contain representative tasks');
  const fixtureIds = new Set(hf.fixtures.map((task) => task.id));
  assert.equal(fixtureIds.size, hf.fixtures.length, 'fixture ids must be unique');
  for (const id of fixtureIds) assert.match(taskList, new RegExp(`select-task:${id}`));
  assert.match(hf.renderRaw('populated'), /fixture_01/);
  assert.match(hf.renderTasks('summary', 'completed'), /abc12345/);

  const callerOwned = hf.renderTasks('approvals', 'caller-owned');
  assert.match(callerOwned, /data-action="approval-decision:approve"/);
  assert.equal(hf.approvalController.state.requests[0].ownership, 'caller');
  assert.equal(hf.approvalController.state.futureMacResponseCapability, true);
  assert.equal(hf.approvalController.state.taskID, 'abc12345');
  const callerOwnedLegacy = hf.renderTasks('approvals', 'caller-owned-legacy');
  assert.match(callerOwnedLegacy, /engine does not support Mac responses/);
  assert.doesNotMatch(callerOwnedLegacy, /data-action="approval-decision:/);
  assert.equal(hf.approvalController.state.requests[0].ownership, 'caller');
  assert.equal(hf.approvalController.state.futureMacResponseCapability, false);
  const inspected = hf.renderTasks('approvals', 'inspected');
  assert.match(inspected, /data-action="approval-decision:approve"/);
  assert.match(inspected, /data-action="approval-decision:reject"/);
});

test('approval controller requires a complete current identity before inspection or response', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('monitor-pending');
  const model = hf.approvalController.state;
  const listed = model.requests[0];

  assert.equal(hf.approvalController.canInspect(listed), true);
  for (const incomplete of [null, {}, { ...listed, id: '' }, { ...listed, task_id: '' }, { ...listed, digest: '' }, { ...listed, revision: undefined }, { ...listed, revision: 0.5 }]) {
    assert.equal(hf.approvalController.canInspect(incomplete), false);
  }
  assert.equal(hf.approvalController.identityMatches(listed, { ...listed }), true);
  assert.equal(hf.approvalController.identityMatches(listed, { ...listed, digest: 'sha256:changed' }), false);

  model.selectedID = listed.id;
  model.detail = { ...listed, action: { tool_name: 'Bash', input: { command: 'git status' } } };
  model.current = true;
  assert.equal(hf.approvalController.canRespond(), true, 'revision zero is a valid inspected revision');
  model.detail = { ...model.detail, action: { tool_name: 'Bash', input: {} } };
  assert.equal(hf.approvalController.canRespond(), true, 'an empty object is still a complete structured action input');
  for (const detail of [
    { ...model.detail, complete: false },
    { ...model.detail, action: { tool_name: 'Bash', input: [] } },
    { ...model.detail, action: { tool_name: 'Bash' } },
    { ...model.detail, ownership: 'caller' },
    { ...model.detail, disposition: 'approved' },
    { ...model.detail, delivery: 'reserved' },
    { ...model.detail, delivery: 'sending' },
    { ...model.detail, deadline: Date.parse('2026-10-24T11:59:59+07:00') },
  ]) {
    model.detail = detail;
    assert.equal(hf.approvalController.canRespond(), false);
  }
  model.detail = { ...listed, action: { tool_name: 'Bash', input: {} } };
  model.current = true;
  listed.disposition = 'approved';
  assert.equal(hf.approvalController.canRespond(), false, 'a changed listed disposition invalidates the inspected response');
  listed.disposition = 'pending';
  listed.delivery = 'delivered';
  assert.equal(hf.approvalController.canRespond(), false, 'a changed listed delivery invalidates the inspected response');
  model.requests = [];
  assert.equal(hf.approvalController.canRespond(), false, 'a missing listed request cannot be answered');
});

test('approval refresh retains only the same pending request and invalidates stale details', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('inspected');
  const detail = hf.approvalController.state.detail;
  const listed = hf.approvalController.state.requests[0];
  assert.equal(hf.approvalController.refreshKeepsInspection(detail, listed), true);
  assert.equal(hf.approvalController.refreshKeepsInspection(detail, { ...listed, digest: 'sha256:new' }), false);
  assert.equal(hf.approvalController.refreshKeepsInspection(detail, { ...listed, revision: 1 }), false);
  assert.equal(hf.approvalController.refreshKeepsInspection(detail, { ...listed, disposition: 'approved' }), false);
  assert.equal(hf.approvalController.refreshKeepsInspection(detail, listed, false), false);
});

test('approval inspection rejects missing task identity and changed supplied payloads', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('monitor-pending');
  const listed = hf.approvalController.state.requests[0];
  assert.equal(hf.approvalController.canInspect({ ...listed, task_id: '' }), false);
  assert.equal(hf.approvalController.inspect(listed.id, { ...listed, action: { tool_name: 'Bash', input: { command: 'changed' } } }), true);
  assert.equal(hf.approvalController.state.current, true);
  assert.equal(hf.approvalController.inspect(listed.id, { ...listed, digest: 'sha256:stale' }), false);
  assert.equal(hf.approvalController.state.current, false);
  assert.match(hf.approvalController.state.error, /full payload is unavailable/);
});

test('caller-owned responses require the explicit Mac capability and remain fully guarded', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('caller-owned');
  const caller = hf.approvalController.state;
  assert.equal(hf.approvalController.canRespond(), true);
  const callerSettlement = hf.approvalController.beginResponse('approve');
  assert.equal(callerSettlement(), true);
  assert.equal(caller.requests[0].disposition, 'approved');

  hf.approvalController.reset('caller-owned');
  const uninspected = hf.approvalController.state;
  uninspected.current = false;
  uninspected.detail = null;
  assert.equal(hf.approvalController.canRespond(), false, 'capability cannot bypass inspection');

  hf.approvalController.reset('caller-owned-legacy');
  const legacy = hf.approvalController.state;
  assert.equal(hf.approvalController.canRespond(), false, 'legacy caller ownership has no Mac response capability');
  legacy.detail.futureMacResponseCapability = true;
  assert.equal(hf.approvalController.canRespond(), false, 'a payload flag cannot grant the model capability');
});

test('caller and monitor response guards reject expiry, stale delivery, busy state, and ownership changes', () => {
  const hf = loadDesignRuntime();
  for (const state of ['inspected', 'caller-owned']) {
    hf.approvalController.reset(state);
    const model = hf.approvalController.state;
    assert.equal(hf.approvalController.canRespond(), true);
    model.detail.deadline = Date.parse('2026-10-24T11:59:59+07:00');
    assert.equal(hf.approvalController.canRespond(), false);

    hf.approvalController.reset(state);
    const stale = hf.approvalController.state;
    stale.requests[0].delivery = 'delivered';
    assert.equal(hf.approvalController.canRespond(), false);

    hf.approvalController.reset(state);
    const busy = hf.approvalController.state;
    busy.loading = true;
    assert.equal(hf.approvalController.canRespond(), false);

    hf.approvalController.reset(state);
    const settle = hf.approvalController.beginResponse('reject');
    assert.equal(typeof settle, 'function');
    hf.approvalController.state.requests[0].ownership = state === 'caller-owned' ? 'monitor' : 'caller';
    assert.equal(settle(), false, 'ownership changes invalidate the captured response');
  }
});

test('leaving the approval route resets caller response capability', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('caller-owned');
  assert.equal(hf.approvalController.state.futureMacResponseCapability, true);
  hf.approvalController.deactivate();
  assert.equal(hf.approvalController.state.futureMacResponseCapability, false);
  assert.equal(hf.approvalController.pendingCount(), 0);
});

test('approval settlement ignores route resets and settles only the captured current model', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('inspected');
  const settle = hf.approvalController.beginResponse('approve');
  assert.equal(typeof settle, 'function');
  assert.equal(hf.approvalController.state.submitting, true);
  hf.approvalController.reset('caller-owned');
  assert.equal(settle(), false);
  assert.equal(hf.approvalController.state.requests[0].ownership, 'caller');
  assert.equal(hf.approvalController.state.notice, undefined);

  hf.approvalController.reset('inspected');
  const settleReject = hf.approvalController.beginResponse('reject');
  assert.equal(settleReject(), true);
  const state = hf.approvalController.state;
  assert.equal(state.requests[0].disposition, 'denied');
  assert.equal(state.requests[0].delivery, 'delivered');
  assert.equal(state.requests[0].execution_outcome, 'not_observed');
  assert.equal(hf.approvalController.pendingCount(), 0);
  assert.match(state.notice, /Rejected in this local fixture/);
});

test('approval pagination appends pages and deduplicates existing request identities', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('pagination');
  const model = hf.approvalController.state;
  assert.equal(model.requests.length, 5);
  assert.equal(hf.approvalController.loadMore({
    requests: [model.requests[4], { ...model.requests[4], id: 'approval_06', created_at: 1792818010 }],
    total: 6,
    cursor: null,
  }), true);
  assert.equal(model.requests.length, 6);
  assert.equal(new Set(model.requests.map((request) => request.id)).size, 6);
  assert.equal(model.total, 6);
  assert.equal(model.cursor, null);
  assert.equal(hf.approvalController.loadMore({ requests: [], total: 6, cursor: null }), false);
});

test('approval settled, caller-owned, submitting, and error states expose the correct response guards', () => {
  const hf = loadDesignRuntime();
  hf.taskDetailContext = { task: { approvalFixture: true } };
  for (const state of ['approved', 'denied', 'expired', 'caller-owned', 'submitting', 'error']) {
    hf.approvalController.reset(state);
    const html = hf.renderTasks('approvals', state);
    assert.match(html, /Caller approvals/);
    if (state === 'error') assert.doesNotMatch(html, /data-action="approval-decision:/);
    else if (state === 'caller-owned') assert.match(html, /data-action="approval-decision:approve"(?![^>]*disabled)/);
    else assert.match(html, /data-action="approval-decision:approve"[^>]*disabled/);
  }
  hf.approvalController.reset('submitting');
  const submitting = hf.approvalPanel();
  assert.match(submitting, /data-action="approval-refresh"[^>]*disabled/);
  assert.match(submitting, /data-action="approval-inspect:[^"]+"[^>]*disabled/);
  hf.approvalController.reset('error');
  assert.match(hf.approvalPanel(), /Approval metadata unavailable\./);
});

test('approval rows retain source metadata, escape action JSON, and sort pending before history', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('history');
  const model = hf.approvalController.state;
  hf.taskDetailContext = { task: { approvalFixture: true } };
  model.requests = [
    { ...model.requests[1], id: 'z-history', created_at: 2 },
    { ...model.requests[0], id: 'a-pending', disposition: 'pending', delivery: 'pending', created_at: 9, action: { tool_name: 'Bash', input: { command: '</script><img src=x>' } } },
    { ...model.requests[1], id: 'm-unknown', delivery: 'delivery_unknown', created_at: 1 },
  ];
  model.total = 3;
  model.selectedID = 'a-pending';
  model.detail = model.requests[1];
  model.current = true;
  const html = hf.approvalPanel();
  const order = [...html.matchAll(/data-action="approval-inspect:([^"]+)/g)].map(([, id]) => id);
  assert.deepEqual(order, ['a-pending', 'm-unknown', 'z-history']);
  assert.match(html, /Working directory: \/Users\/example\/repo/);
  assert.match(html, /&lt;\/script&gt;&lt;img src=x&gt;/);
  assert.match(html, /Complete exact action/);
});

test('pending approvals stay inline with Activity while Summary and Prompt share a compact jump indicator', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('monitor-pending');
  const task = { id: 'approval-task', title: 'Approval task', backend: 'claude', status: 'running', approvalFixture: true, prompt: 'Review the pending action.' };
  const activity = hf.taskActivitySurface(task, 'running', 'Activity', 'running');
  const summary = hf.taskActivitySurface(task, 'running', 'Summary', 'running');
  const prompt = hf.taskActivitySurface(task, 'running', 'Prompt', 'running');
  assert.match(activity, /ta-feed[\s\S]*approval-card approval-inline[\s\S]*ta-approval-waiting/);
  assert.doesNotMatch(activity.slice(0, activity.indexOf('ta-feed')), /approval-card/);
  for (const pane of [summary, prompt]) {
    assert.match(pane, /class="approval-hint"[^>]*data-action="approval-jump"/);
    assert.match(pane, /Waiting for approval/);
    assert.doesNotMatch(pane, /class="approval-panel"/);
  }
  const catalog = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  assert.match(catalog, /case'approval-jump'/, 'the compact indicator must focus the Activity approval card');
});

test('approval focus restoration targets the matching pending request and falls back safely', () => {
  const hf = loadDesignRuntime();
  const focused = [];
  const makeControl = (action, disabled = false, request = null) => ({
    dataset: { action }, disabled,
    closest: () => request,
    focus: () => focused.push(action),
  });
  const pendingRequest = { className: 'approval-request', focus: () => focused.push('request') };
  const historyInspect = makeControl('approval-inspect:approval_02');
  const pendingInspect = makeControl('approval-inspect:approval_17');
  const root = {
    querySelectorAll: () => [historyInspect, pendingInspect],
    querySelector: (selector) => selector === '.approval-inline' ? makeControl('card') : null,
  };
  assert.equal(hf.approvalFocusTarget(root, { requestAction: 'approval-inspect:approval_17' }), pendingInspect);
  assert.equal(hf.approvalFocusTarget(root, { requestAction: 'approval-inspect:approval_missing' }), historyInspect);

  const disabledPending = makeControl('approval-inspect:approval_17', true, pendingRequest);
  const disabledRoot = {
    querySelectorAll: () => [historyInspect, disabledPending],
    querySelector: (selector) => selector === '.approval-inline' ? makeControl('card') : null,
  };
  assert.equal(hf.approvalFocusTarget(disabledRoot, { requestAction: 'approval-inspect:approval_17' }), pendingRequest);

  const json = { dataset: {}, disabled: false, focus: () => focused.push('json') };
  const jsonRoot = {
    querySelectorAll: () => [historyInspect],
    querySelector: (selector) => selector.includes('pre[') ? json : null,
  };
  assert.equal(hf.approvalFocusTarget(jsonRoot, { action: 'approval-decision:approve', json: true }), json);
  assert.equal(focused.length, 0, 'pure target selection does not move focus for an unrelated outside control');
});

test('renderer HTML carries state-specific disabled guards and recovery conditions', () => {
  const hf = loadDesignRuntime();
  for (const state of ['busy', 'loading', 'missing-cli']) {
    const html = hf.renderNew(state);
    assert.match(html, /data-action="start-session"[^>]*disabled/);
  }
  const defaultNew = hf.renderNew('default');
  assert.match(defaultNew, /data-action="start-session"[^>]*disabled/);
  assert.match(hf.renderNew('default'), /data-action="agent:opencode"[^>]*disabled/);

  const unsupported = hf.renderMCP('unsupported');
  assert.match(unsupported, /id="approval-entry"[^>]*disabled/);
  assert.match(unsupported, /data-action="add-approval"[^>]*disabled/);
  assert.match(hf.renderMCP('default'), /id="approval-entry"/);

  const attention = hf.renderRun('attention');
  assert.match(attention, /Recovery options/);
  assert.match(attention, /data-action="open-recovery"/);
  assert.match(hf.renderRun('running'), /<button[^>]*>Pause<\/button>/);
  assert.match(hf.renderRun('running'), /data-action="feedback:Workflow cancellation requested"/);
  const paused = hf.renderRun('paused');
  assert.doesNotMatch(paused, /<button[^>]*>Pause<\/button>/);
  assert.match(paused, /data-action="feedback:Workflow cancellation requested"/);
  for (const terminalState of ['completed', 'cancelled']) {
    const terminal = hf.renderRun(terminalState);
    assert.doesNotMatch(terminal, /<button[^>]*>Pause<\/button>/);
    assert.doesNotMatch(terminal, /data-action="feedback:Workflow cancellation requested"/);
  }
  const parentOwned = hf.renderRun('parent-owned');
  assert.match(parentOwned, /controlled by its parent workflow/);
  assert.match(parentOwned, /Parent workflow selected/);
  assert.doesNotMatch(parentOwned, /data-action="feedback:Workflow cancellation requested"/);

  const waiting = hf.recovery('settling', { exhaustedRetries: true });
  assert.match(waiting, /data-settling="true"/);
  assert.match(waiting, /data-action="recover:resume"[^>]*disabled/);
  const answered = hf.recovery('attention', { exhaustedRetries: true, requiresAnswer: false });
  assert.match(answered, /data-action="recover:resume"/);
  assert.doesNotMatch(answered, /data-action="recover:resume"[^>]*disabled/);

  const takenOver = hf.renderTasks('task-detail', 'taken-over');
  assert.match(takenOver, /Messages are off/);
  assert.match(takenOver, /took this task over in Terminal/);
  assert.match(takenOver, /data-kind="send"[^>]*disabled/);
  assert.doesNotMatch(takenOver, /driving this session in the terminal/);
});

test('task message eligibility follows native running and terminal rules', () => {
  const hf = loadDesignRuntime();
  const eligible = (values) => hf.taskMessageEligibility({ text: '  Follow up  ', ...values });

  assert.equal(eligible({ status: 'running', liveInput: true }).canSend, true);
  assert.equal(eligible({ status: 'running', liveInput: true }).canContinue, false);
  assert.equal(eligible({ status: 'running', liveInput: true }).action, 'Send');
  assert.equal(eligible({ status: 'running', liveInput: true, takenOver: true }).enabled, false);
  assert.equal(eligible({ status: 'running', liveInput: false }).enabled, false);
  assert.equal(eligible({ status: 'running', liveInput: true, busy: true }).enabled, false);
  assert.equal(eligible({ status: 'completed', sessionID: 'session-1' }).canSend, false);
  assert.equal(eligible({ status: 'completed', sessionID: 'session-1' }).canContinue, true);
  assert.equal(eligible({ status: 'completed', sessionID: 'session-1' }).action, 'Continue');
  assert.equal(eligible({ status: 'failed', sessionID: null }).enabled, false);
  assert.equal(eligible({ status: 'completed', sessionID: 'session-1', takenOver: true }).action, 'Continue');
  assert.equal(hf.taskMessageEligibility({ status: 'completed', sessionID: 'session-1', text: '   ' }).enabled, false);
});

test('task activity timeline preserves identity, escaping, groups, and terminal markers', () => {
  const hf = loadDesignRuntime();
  const task = {
    id: 'task_activity_fixture',
    title: 'Persistence review',
    backend: 'codex',
    prompt: '</textarea><script>alert(1)</script>',
    status: 'running',
  };
  const running = hf.taskTimeline(task, 'running');
  assert.match(running, /data-status="running"/);
  assert.match(running, /ta-tool-group/);
  assert.match(running, /Running swift test/);
  assert.doesNotMatch(running, /<script>alert/);
  assert.doesNotMatch(running, /Task completed|Task failed/);

  const surface = hf.taskActivitySurface(task, 'running');
  assert.match(surface, /<strong>Codex<\/strong>/);
  assert.match(surface, /Persistence review/);

  const completed = hf.taskTimeline({ ...task, status: 'completed' }, 'completed');
  assert.match(completed, /data-status="completed"/);
  assert.match(completed, /Finished/);
  assert.match(completed, /ta-finished/);
  assert.doesNotMatch(completed, /Running swift test/);

  const failed = hf.taskTimeline({ ...task, status: 'failed' }, 'failed');
  assert.match(failed, /Failed · exit 1/);
  assert.match(failed, /ta-finished failed/);
});

test('task activity surface renders native composer states without leaking generic activity', () => {
  const hf = loadDesignRuntime();
  const task = { id: 'task_fixture_01', title: 'Review session persistence', backend: 'claude', status: 'running' };
  const running = hf.taskActivitySurface(task, 'running');
  assert.match(running, /id="task-message"/);
  assert.match(running, /aria-label="Message this task"/);
  assert.match(running, /data-kind="send"/);
  assert.match(running, /id="task-activity-scroll"/);

  const noLive = hf.taskActivitySurface(task, 'no-live');
  assert.match(noLive, /Messages are off/);
  assert.doesNotMatch(noLive, /id="task-message"/);
  assert.match(noLive, /data-kind="send"[^>]*disabled/);

  const noSession = hf.taskActivitySurface({ ...task, status: 'completed', sessionID: null }, 'no-session');
  assert.match(noSession, /id="task-message"[^>]*disabled/);
  assert.match(noSession, /placeholder="This task has no session to continue\."/);
  assert.match(noSession, /data-kind="continue"[^>]*disabled/);
  assert.doesNotMatch(noSession, /ta-lock-field/);

  const missing = hf.taskActivitySurface(task, 'missing');
  assert.match(missing, /Task unavailable/);
  assert.doesNotMatch(missing, /ta-composer/);
});

test('task activity routes use the selected task status instead of the catalog state label', () => {
  const hf = loadDesignRuntime();
  const selected = { ...hf.fixtures[1], status: 'completed', sessionID: 'session-selected' };

  hf.currentTask = selected;
  const selectedRoute = hf.renderTasks('tasks', 'populated');
  assert.match(selectedRoute, /data-status="completed"/);
  assert.match(selectedRoute, /Finished/);
  assert.match(selectedRoute, /Refine workflow validation/);

  hf.currentTask = null;
  const defaultRoute = hf.renderTasks('tasks', 'populated');
  assert.match(defaultRoute, /data-status="running"/);
  assert.match(defaultRoute, /Review session persistence/);
  assert.doesNotMatch(defaultRoute, /data-status="populated"/);
});

test('session recovery states preserve their original warning and retry chrome', () => {
  const hf = loadDesignRuntime();
  const selected = { ...hf.fixtures[1], status: 'completed', sessionID: 'session-selected' };
  hf.currentTask = selected;

  const installRetry = hf.renderTasks('tasks', 'install-retry');
  assert.match(installRetry, /Managed runtime could not be prepared\./);
  assert.match(installRetry, /Try again/);
  assert.match(installRetry, /data-action="feedback:Runtime retry requested"/);
  assert.match(installRetry, /data-status="completed"/);

  const degradedCatalog = hf.renderTasks('tasks', 'degraded-catalog');
  assert.match(degradedCatalog, /Agent catalog unavailable\./);
  assert.match(degradedCatalog, /Showing known agents\./);
  assert.doesNotMatch(degradedCatalog, /Runtime retry requested/);
  assert.match(degradedCatalog, /data-status="completed"/);

  const olderHistory = hf.renderTasks('tasks', 'older-history-error');
  assert.match(olderHistory, /Older history unavailable\./);
  assert.match(olderHistory, /data-action="feedback:Older history retry requested"/);
  assert.match(olderHistory, /data-status="completed"/);
});

test('task summary and prompt panes share one dispatcher across route and tab entry points', () => {
  const hf = loadDesignRuntime();
  const task = { ...hf.fixtures[1], status: 'completed', sessionID: 'session-selected' };

  const summaryPane = hf.taskPane('Summary', task, 'completed', 'completed');
  const promptPane = hf.taskPane('Prompt', task, 'completed', 'completed');
  assert.equal(summaryPane, hf.summary('completed', task));
  assert.equal(promptPane, hf.taskPane('Prompt', task, 'completed', 'completed'));

  hf.currentTask = task;
  const summaryRoute = hf.renderTasks('summary', 'completed');
  assert.match(summaryRoute, new RegExp(summaryPane.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const activityShell = hf.taskActivitySurface(task, 'completed', 'Summary', 'completed');
  assert.match(activityShell, new RegExp(summaryPane.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(activityShell, /data-action="task-tab:Prompt"/);
  assert.match(activityShell, /data-action="task-tab:Summary"/);
});

test('summary identity and status come from the selected task, independent of catalog metadata state', () => {
  const hf = loadDesignRuntime();
  const selected = { ...hf.fixtures[1], id: 'selected-summary', title: 'Selected terminal audit', status: 'completed', sessionID: 'session-selected', summary: 'Selected result' };
  const model = hf.taskSummaryModel(selected, 'loading');
  assert.equal(model.title, selected.title);
  assert.equal(model.status, selected.status);
  assert.equal(model.summaryState, 'loading');
  assert.equal(model.result, selected.summary);
  assert.match(hf.taskActivitySurface(selected, 'completed', 'Summary', 'loading'), /Selected terminal audit/);
  assert.match(hf.taskPane('Summary', selected, 'completed', 'loading'), /Loading edited files/);
});

test('summary metrics omit unobserved duration while preserving terminal and running distinctions', () => {
  const hf = loadDesignRuntime();
  const completed = hf.taskSummaryModel(null, 'completed');
  assert.equal(completed.durationSeconds, 1260);
  assert.match(hf.taskPane('Summary', null, 'completed', 'completed'), /Duration/);

  const running = hf.taskSummaryModel(null, 'running');
  assert.equal(running.durationSeconds, undefined);
  assert.doesNotMatch(hf.taskPane('Summary', null, 'running', 'running'), /Duration/);

  const missingMetric = hf.taskSummaryModel({ id: 'metricless', title: 'Metricless', backend: 'codex', status: 'completed', summary: 'Done', editedFiles: [] }, 'completed');
  assert.equal(missingMetric.durationSeconds, undefined);
  assert.doesNotMatch(hf.taskPane('Summary', { id: 'metricless', title: 'Metricless', backend: 'codex', status: 'completed', summary: 'Done', editedFiles: [] }, 'completed', 'completed'), /Duration/);

  const observed = { id: 'observed-terminal', title: 'Observed terminal', backend: 'codex', status: 'completed', durationSeconds: 1260, exitCode: 0, summary: 'Done', editedFiles: [] };
  assert.equal(hf.taskSummaryModel(observed, 'completed').durationSeconds, 1260);
  assert.match(hf.taskPane('Summary', observed, 'completed', 'completed'), /Duration/);
});

test('prompt preserves absent and empty values and escapes hostile content', () => {
  const hf = loadDesignRuntime();
  const absent = hf.taskPane('Prompt', { id: 'absent-prompt', title: 'Absent', backend: 'claude' }, 'completed');
  const fallback = "The prompt is recorded in the task's event log, which has not been read yet (or does not exist).";
  assert.ok(absent.includes(hf.escape(fallback)), 'missing prompt should use the native fallback copy');

  const empty = hf.taskPane('Prompt', { id: 'empty-prompt', title: 'Empty', backend: 'claude', prompt: '' }, 'completed');
  assert.doesNotMatch(empty, /Fix the flaky login test/);
  assert.match(empty, /<p><\/p>/);

  const hostile = hf.taskPane('Prompt', { id: 'hostile-prompt', title: 'Hostile', backend: 'claude', prompt: '</p><script>alert(1)<\/script>&"' }, 'completed');
  assert.doesNotMatch(hostile, /<script>|<\/p><script>/);
  assert.match(hostile, /&lt;\/p&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('artifact and edited-file states preserve the result and guard local disclosures', () => {
  const hf = loadDesignRuntime();
  const result = 'Fixed the **login bug**.';
  for (const state of ['loading', 'error', 'unsupported', 'metadata-only', 'paged']) {
    const html = hf.taskPane('Summary', null, 'completed', state);
    assert.match(html, /Result/);
    assert.match(html, /login bug/);
  }

  const empty = hf.taskPane('Summary', null, 'completed', 'empty');
  assert.match(empty, /No final answer/);
  assert.doesNotMatch(empty, /summary-files/);

  const paged = hf.taskPane('Summary', null, 'completed', 'paged');
  assert.equal((paged.match(/class="summary-file"/g) || []).length, 8);
  assert.match(paged, /Show (?:all|loaded) 12/);
  assert.match(paged, /data-action="summary-show-all"/);
  assert.match(paged, /data-action="summary-refresh"/);
  assert.doesNotMatch(paged, /data-action="summary-load-more"/);

  const error = hf.taskPane('Summary', null, 'completed', 'error');
  assert.match(error, /Edit history isn't available for this task\./);
  assert.match(error, /data-action="summary-refresh"/);
  assert.match(error, /login bug/);
});

test('workflow fixtures keep graph, attempt, and sidebar activity projections aligned', () => {
  const hf = loadDesignRuntime();
  const graph = hf.graph(false, 'running');
  for (const type of ['start', 'planning', 'implementation', 'review', 'end']) {
    assert.match(graph, new RegExp(`data-action="select-node:${type}"`));
  }
  assert.match(graph, /<small>Completed<\/small>/);
  assert.match(graph, /<small>Running<\/small>/);
  assert.match(graph, /<small>Pending<\/small>/);

  const implementation = hf.workflowNodeFixture('implementation', 'attempts');
  assert.equal(implementation.backend, 'Codex');
  assert.equal(implementation.status, 'running');
  assert.equal(implementation.hasAttempts, true);
  const selected = hf.runSelected('attempts', 'implementation');
  assert.match(selected, /id="attempt-picker"[^>]*data-node-type="implementation"/);
  assert.match(selected, /Implementation is in progress/);

  const failedAttempt = hf.workflowNodeFixture('implementation', 'attempts', 1);
  assert.equal(failedAttempt.status, 'failed');
  assert.match(hf.workflowTaskActivity(failedAttempt), /attempt 1 failed/);

  const pendingReview = hf.workflowNodeFixture('review', 'running');
  assert.equal(pendingReview.status, 'pending');
  const pendingHTML = hf.workflowTaskActivity(pendingReview);
  assert.match(pendingHTML, /Not started/);
  assert.doesNotMatch(pendingHTML, /Final response|in progress|Attempt 2/);

  const child = hf.runSelected('child-session', 'implementation');
  assert.match(child, /Child session/);
  assert.match(child, /Task assigned to Codex/);
  assert.match(child, /data-action="route:task-detail\/spawned"/);
  assert.match(hf.renderRun('running'), /wf-sr-only">Expand summary/);
  assert.match(hf.renderRun('running'), /id="run-summary" hidden/);
});
