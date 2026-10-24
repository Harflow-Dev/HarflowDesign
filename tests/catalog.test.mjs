import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scripts = ['tokens.js', 'registry.js', 'components.js', 'tasks.js', 'task-activity.js', 'parallel.js', 'task-approvals.js', 'task-summary.js', 'workflows.js', 'workflow-editor-inspector.js', 'workflow-editor.js', 'workflow-run.js', 'dialogs.js', 'foundations.js'];

function loadDesignRuntime({ captureEvents = false, querySelectorOverride, querySelectorAllOverride } = {}) {
  const announcement = { textContent: '', classList: { add() {}, remove() {} } };
  const listeners = new Map();
  const document = {
    querySelector: selector => querySelectorOverride?.(selector) ?? (selector === '#announcement' ? announcement : null),
    querySelectorAll: selector => querySelectorAllOverride?.(selector) ?? [],
    addEventListener(type, listener) {
      if (!captureEvents) return;
      const registered = listeners.get(type) || [];
      registered.push(listener);
      listeners.set(type, registered);
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event.type) || []) listener(event);
    }
  };
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
  if (captureEvents) context.HF.__dispatchDesignEvent = event => document.dispatchEvent(event);
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

test('parallel group keeps lane identity, status strips, and terminal eligibility explicit', () => {
  const hf = loadDesignRuntime();
  const mixed = hf.renderParallel('mixed');
  assert.match(mixed, /class="parallel-lane running"[^>]*data-task-id="mock-session-0"/);
  assert.match(mixed, /class="parallel-lane completed"[^>]*data-task-id="mock-session-1"/);
  assert.match(mixed, /class="parallel-lane failed"[^>]*data-task-id="mock-session-2"/);
  assert.equal((mixed.match(/<\/article>/g) || []).length, 3, 'each lane must close independently for stable scrolling and actions');
  assert.equal((mixed.match(/Take over in terminal/g) || []).length, 3, 'each lane exposes the same takeover affordance in the standalone group');
  assert.match(mixed, /No network/);
  assert.match(mixed, /Enforced for every agent here: Access stays within the repository\./);
  assert.match(mixed, /Beginning of activity/);

  const twoLanes = hf.renderParallel('two-lanes');
  assert.equal((twoLanes.match(/class="parallel-lane /g) || []).length, 2);
  assert.match(twoLanes, /2 agents · read_only, write_in_repo · ~\/HarflowMac/);
  assert.doesNotMatch(twoLanes, /mock-session-2/);

  const empty = hf.renderParallel('empty');
  assert.match(empty, /No tasks in this group any more\./);
  assert.doesNotMatch(empty, /parallel-lane /);
  assert.doesNotMatch(empty, /No network/);

  const deferred = hf.renderParallel('deferred');
  assert.match(deferred, /parallel-header-skeleton/);
  assert.match(deferred, /parallel-lane-skeleton/);
  assert.doesNotMatch(deferred, /Review persistence|Take over in terminal|parallel-0/);

  const fixtures = hf.parallelFixtures('two-lanes');
  assert.equal(fixtures.map(task => task.id).join(','), 'mock-session-0,mock-session-1');
  assert.equal(fixtures[0].prompt, 'Review persistence, validate recovery, and report findings.');
  assert.equal(fixtures[0].activityFixture, 'native-eight-steps');
  assert.equal(fixtures[1].activityFixture, 'empty');
  assert.match(hf.taskTimeline(fixtures[1], 'completed'), /Beginning of activity/);
  assert.doesNotMatch(hf.taskTimeline(fixtures[1], 'completed'), /8 steps|ta-tool|ta-prose/);
  assert.equal(hf.parallelTerminalEligibility({ sessionID: 'session-1' }).enabled, true);
  assert.equal(hf.parallelTerminalEligibility({ sessionID: 'session-1', busy: true }).enabled, false);
  assert.equal(hf.parallelTerminalEligibility({ sessionID: 'session-1', workflowID: 'workflow-1' }).visible, false);

  const completed = hf.renderParallel('completed');
  assert.equal((completed.match(/parallel-lane completed/g) || []).length, 3);
  assert.match(completed, /Fixed the login bug\./);
  assert.doesNotMatch(completed, /data-action="parallel-cancel"/);
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
  for (const state of ['inspected', 'caller-owned']) {
    let hf = loadDesignRuntime();
    hf.approvalController.reset(state);
    const model = hf.approvalController.state;
    assert.equal(hf.approvalController.canRespond(), true);
    model.detail.deadline = Date.parse('2026-10-24T11:59:59+07:00');
    assert.equal(hf.approvalController.canRespond(), false);

    hf = loadDesignRuntime();
    hf.approvalController.reset(state);
    const stale = hf.approvalController.state;
    stale.requests[0].delivery = 'delivered';
    assert.equal(hf.approvalController.canRespond(), false);

    hf = loadDesignRuntime();
    hf.approvalController.reset(state);
    const busy = hf.approvalController.state;
    busy.loading = true;
    assert.equal(hf.approvalController.canRespond(), false);

    hf = loadDesignRuntime();
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
  model.selectedID = model.requests[0].id;
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
  assert.match(html, /Run command/);
  assert.match(html, /In \/Users\/example\/repo/);
  assert.match(html, /Command/);
  assert.match(html, /&lt;\/script&gt;&lt;img src=x&gt;/);
  assert.doesNotMatch(html, /Complete exact action|"tool_name"/);
});

test('approval action presentation preserves descriptions and every structured input value without raw JSON', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('monitor-pending');
  hf.taskDetailContext = { task: { approvalFixture: true } };
  const model = hf.approvalController.state;
  model.selectedID = model.requests[0].id;
  model.detail = { ...model.requests[0], description: '  Explain <unsafe>  ', action: { tool_name: 'Custom tool', input: {
    emptyString: '', emptyArray: [], emptyObject: {}, falseValue: false, zeroValue: 0,
    nested: { list: [null, { deep: 'value' }] },
  } } };
  model.current = true;
  const described = hf.approvalPanel();
  assert.match(described, /Explain &lt;unsafe&gt;/);
  assert.match(described, /emptyString/);
  assert.match(described, /Empty list/);
  assert.match(described, /Empty object/);
  assert.match(described, /false/);
  assert.match(described, />0</);
  assert.match(described, /nested · list 2 · deep/);
  assert.match(described, /No value/);
  assert.match(described, /value/);
  assert.doesNotMatch(described, /"emptyString"|"nested"|Complete exact action/);

  model.detail = { ...model.detail, description: '   ' };
  const noDescription = hf.approvalPanel();
  assert.doesNotMatch(noDescription, /approval-description/);
});

test('caller-owned fixture resets are isolated within one runtime', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('caller-owned');
  const first = hf.approvalController.state;
  first.detail.deadline = Date.parse('2026-10-24T11:59:59+07:00');
  first.requests[0].delivery = 'delivered';
  hf.approvalController.reset('caller-owned');
  const second = hf.approvalController.state;
  assert.equal(second.detail.deadline, Date.parse('2026-10-25T07:00:00+07:00'));
  assert.equal(second.requests[0].delivery, 'pending');
  assert.equal(hf.approvalController.canRespond(), true);
});

test('approval history rows render each listed disposition independently of the inspected row', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('history');
  hf.taskDetailContext = { task: { approvalFixture: true } };
  const html = hf.approvalPanel();
  const rows = [...html.matchAll(/data-action="approval-inspect:([^"]+)"[\s\S]*?<div class="approval-metadata">([^<]+)/g)];
  assert.equal(rows[0][1], 'approval_01');
  assert.equal(rows[0][2], 'pending');
  assert.equal(rows[1][1], 'approval_02');
  assert.equal(rows[1][2], 'approved');
  assert.equal(rows[2][1], 'approval_03');
  assert.equal(rows[2][2], 'approved');
});

test('Bash actions keep non-string command values readable without falling back to raw JSON', () => {
  const hf = loadDesignRuntime();
  hf.approvalController.reset('monitor-pending');
  hf.taskDetailContext = { task: { approvalFixture: true } };
  const model = hf.approvalController.state;
  model.selectedID = model.requests[0].id;
  model.current = true;
  for (const [command, expected] of [[null, 'No value'], [[], 'Empty list']]) {
    model.detail = { ...model.requests[0], action: { tool_name: 'Bash', input: { command } } };
    const html = hf.approvalPanel();
    assert.match(html, /Run command/);
    assert.match(html, /<dt>command<\/dt>/);
    assert.match(html, new RegExp(expected));
    assert.doesNotMatch(html, /"tool_name"|Complete exact action/);
  }
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

  const actionContent = { dataset: {}, disabled: false, focus: () => focused.push('action-content') };
  const jsonRoot = {
    querySelectorAll: () => [historyInspect],
    querySelector: (selector) => selector === '.approval-action-focus' ? actionContent : null,
  };
  assert.equal(hf.approvalFocusTarget(jsonRoot, { action: 'approval-decision:approve', actionContent: true }), actionContent);
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

  hf.route = { screen: 'workflow-run', state: 'attention', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const attention = hf.renderRun('attention');
  assert.match(attention, /Recovery options/);
  assert.match(attention, /data-action="wr-open-recovery"/);
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  assert.match(hf.renderRun('running'), /<button[^>]*>Pause<\/button>/);
  assert.match(hf.renderRun('running'), /data-action="wr-cancel"/);
  hf.route = { screen: 'workflow-run', state: 'paused', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const paused = hf.renderRun('paused');
  assert.doesNotMatch(paused, /<button[^>]*>Pause<\/button>/);
  assert.match(paused, /data-action="wr-cancel"/);
  for (const terminalState of ['completed', 'cancelled']) {
    hf.route = { screen: 'workflow-run', state: terminalState, theme: 'light' };
    hf.resetWorkflowRun(hf.route);
    const terminal = hf.renderRun(terminalState);
    assert.doesNotMatch(terminal, /<button[^>]*>Pause<\/button>/);
    assert.doesNotMatch(terminal, /data-action="feedback:Workflow cancellation requested"/);
  }
  hf.route = { screen: 'workflow-run', state: 'parent-owned', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const parentOwned = hf.renderRun('parent-owned');
  assert.match(parentOwned, /Parent controlled/);
  assert.match(parentOwned, /Open root to cancel/);
  assert.doesNotMatch(parentOwned, /data-action="wr-cancel"/);

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
  assert.match(degradedCatalog, /Harness catalog unavailable\./);
  assert.match(degradedCatalog, /Showing known harnesses\./);
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
  assert.match(hf.renderRun('running'), /id="run-summary"/);
});

test('workflow run controller preserves graph and parallel presentation transitions', () => {
  const hf = loadDesignRuntime();
  const routeRun = (state, theme = 'light') => {
    hf.route = { screen: 'workflow-run', state, theme };
    hf.resetWorkflowRun(hf.route);
    return hf.workflowRunController;
  };

  const controller = routeRun('running');
  assert.equal(controller.snapshot().mode, 'graph');
  assert.equal(controller.snapshot().selection, null);
  controller.select('implementation');
  assert.match(controller.render('running'), /class="wfr-run-layout has-selection/);
  assert.match(controller.render('running'), /wfr-selected-activity/);

  controller.setMode('parallel');
  const parallel = controller.render('running');
  assert.match(parallel, /class="wfr-run-layout[^\"]*parallel-mode/);
  assert.doesNotMatch(parallel, /class="wfr-run-layout has-selection/);
  assert.equal((parallel.match(/class="parallel-lane /g) || []).length, 2);
  assert.match(parallel, /<h3>Implementation<\/h3>/);
  assert.match(parallel, /<h3>Review<\/h3>/);
  assert.equal((parallel.match(/Take over in terminal/g) || []).length, 2);

  controller.setMode('graph');
  const restored = controller.render('running');
  assert.match(restored, /class="wfr-run-layout has-selection/);
  assert.match(restored, /wfr-selected-activity/);

  controller.select('start');
  const structural = controller.render('running');
  assert.doesNotMatch(structural, /class="wfr-run-layout has-selection/);
  assert.match(structural, /wfr-sidebar-default/);
  controller.select('start');
  assert.equal(controller.snapshot().selection, 'start', 'reselecting a structural node keeps its identity');
  controller.deselect();
  assert.equal(controller.snapshot().selection, null);
});

test('workflow run selected activity keeps attempt identity and truthful special cases', () => {
  const hf = loadDesignRuntime();
  const routeRun = state => {
    hf.route = { screen: 'workflow-run', state, theme: 'light' };
    hf.resetWorkflowRun(hf.route);
    return hf.workflowRunController;
  };

  const attempts = routeRun('attempts');
  attempts.select('implementation');
  assert.match(attempts.render('attempts'), /Attempt 2 · Running/);
  attempts.setAttempt(1);
  const failedAttempt = attempts.render('attempts');
  assert.match(failedAttempt, /Attempt 1 · Failed/);
  assert.match(failedAttempt, /class="parallel-lane failed"/);

  const emptyCall = routeRun('on-demand-not-called');
  emptyCall.select('on-demand');
  assert.match(emptyCall.render('on-demand-not-called'), /0 calls/);
  assert.match(emptyCall.render('on-demand-not-called'), /Not called/);

  const called = routeRun('on-demand-calls');
  called.select('on-demand');
  const calledHTML = called.render('on-demand-calls');
  assert.match(calledHTML, /1 call/);
  assert.match(calledHTML, /Open task/);
  assert.match(calledHTML, /#1 · Inspect session recovery/);
  assert.match(calledHTML, /Completed/);
  assert.match(calledHTML, /Called by the orchestrator after node/);
  assert.match(calledHTML, /The session state is persisted correctly/);

  const childSession = routeRun('child-session');
  childSession.select('implementation');
  assert.match(childSession.render('child-session'), /wfr-selected-activity/);
  const childWorkflow = routeRun('child-workflow');
  childWorkflow.select('implementation');
  assert.match(childWorkflow.render('child-workflow'), /Child workflow/);
  const missing = routeRun('missing-task');
  missing.select('implementation');
  assert.match(missing.render('missing-task'), /Activity unavailable: the task record is not available\./);
});

test('workflow run selected Plan and Review retain node identity and status', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  for (const [type, title, status] of [['planning', 'Plan', 'Pending'], ['review', 'Review', 'Pending']]) {
    controller.select(type);
    const html = controller.render('running');
    const sidebar = html.match(/<aside class="wfr-run-sidebar"[\s\S]*?<\/aside>/)?.[0] || '';
    assert.match(sidebar, new RegExp(`<strong>${title}<\\/strong>`));
    assert.match(sidebar, new RegExp(`${title} · 1`));
    assert.match(sidebar, new RegExp(`>${status}<`));
    assert.doesNotMatch(html, /class="wfr-attempt"/);
  }
});

test('workflow run clears on-demand call context when selecting a graph node', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'on-demand-calls', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  controller.select('on-demand');
  assert.match(controller.render('on-demand-calls'), /1 call/);
  controller.select('implementation');
  const html = controller.render('on-demand-calls');
  const sidebar = html.match(/<aside class="wfr-run-sidebar"[\s\S]*?<\/aside>/)?.[0] || '';
  assert.match(sidebar, /<strong>Implementation<\/strong>/);
  assert.doesNotMatch(sidebar, /Review persistence|1 call|wfr-call-list/);
  assert.equal(controller.snapshot().callTask, undefined);
});

test('workflow run opens the canonical selected task through its real click handler', () => {
  const openTask = (state, attempt) => {
    const hf = loadDesignRuntime({ captureEvents: true });
    let destination;
    hf.navigate = (screen, nextState) => { destination = { screen, state: nextState }; };
    hf.route = { screen: 'workflow-run', state, theme: 'light' };
    hf.resetWorkflowRun(hf.route);
    const controller = hf.workflowRunController;
    controller.select('implementation');
    controller.setAttempt(attempt);
    const target = {
      dataset: { action: 'wr-open-task' },
      disabled: false,
      isConnected: true,
      closest: selector => selector.startsWith('[data-action') ? target : null
    };
    hf.__dispatchDesignEvent({ type: 'click', target, preventDefault() {}, stopImmediatePropagation() {} });
    return { task: hf.pendingParallelTask, destination };
  };

  const running = openTask('running', 1);
  assert.equal(running.task.id, 'workflow-implementation-attempt-1');
  assert.equal(running.task.status, 'running');
  assert.equal(running.task.backend, 'claude');
  assert.deepEqual(running.destination, { screen: 'task-detail', state: 'running' });

  const failed = openTask('attempts', 1);
  assert.equal(failed.task.id, 'workflow-implementation-attempt-1');
  assert.equal(failed.task.status, 'failed');
  assert.equal(failed.task.backend, 'claude');
  assert.deepEqual(failed.destination, { screen: 'task-detail', state: 'failed' });
});

test('workflow run parallel mode preserves its two canonical lane records', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  controller.setMode('parallel');
  const html = controller.render('running');
  const lanes = html.match(/<article class="parallel-lane ([^"]+)"[^>]*data-task-id="([^"]+)"[\s\S]*?<\/article>/g) || [];
  assert.equal(lanes.length, 2);
  assert.match(lanes[0], /parallel-lane running/);
  assert.match(lanes[0], /data-task-id="workflow-implementation-attempt-1"/);
  assert.match(lanes[0], /<h3>Implementation<\/h3>/);
  assert.match(lanes[0], /Claude/);
  assert.match(lanes[1], /parallel-lane pending/);
  assert.match(lanes[1], /data-task-id="workflow-review-attempt-1"/);
  assert.match(lanes[1], /<h3>Review<\/h3>/);
  assert.match(lanes[1], /Codex/);
});

test('workflow run keeps selected activity scroll identity and failed attempt open target', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'attempts', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  controller.select('implementation');
  controller.setAttempt(1);
  controller.setSummaryState({ scrollTop: 88 });
  const failed = controller.render('attempts');
  assert.match(failed, /class="parallel-lane failed" data-task-id="[^"]*implementation-attempt-1"/);
  assert.match(failed, /data-action="parallel-open:[^"]*implementation-attempt-1"/);
  controller.select('review');
  assert.equal(controller.snapshot().scrollTop, 88);
  controller.select('implementation');
  assert.equal(controller.snapshot().scrollTop, 88);
});

test('workflow run retains validated extra attempts and empty goal drafts across summary rerenders', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'attention', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  controller.setSummaryState({ extraAttempts: 4, expanded: false });
  assert.match(controller.render('attention'), /id="wfr-extra-attempts"[^>]*value="4"/);
  controller.toggleSummary();
  assert.match(controller.render('attention'), /id="wfr-extra-attempts"[^>]*value="4"/);

  controller.setSummaryState({ goalEditing: true, goalDraft: 'Keep the recovery path explicit.' });
  assert.doesNotMatch(controller.render('attention'), /data-action="wr-goal-save" disabled/);
  controller.setSummaryState({ goalDraft: '' });
  const emptyGoal = controller.render('attention');
  assert.match(emptyGoal, /id="wfr-goal-draft"><\/textarea>/);
  assert.match(emptyGoal, /data-action="wr-goal-save" disabled/);
  controller.toggleSummary();
  const rerendered = controller.render('attention');
  assert.match(rerendered, /id="wfr-goal-draft"><\/textarea>/);
  assert.match(rerendered, /data-action="wr-goal-save" disabled/);
});

test('workflow run goal actions restore the current goal after cancellation and preserve typed empty drafts', () => {
  const hf = loadDesignRuntime({ captureEvents: true });
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  const dispatch = action => {
    const target = { dataset: { action }, disabled: false, isConnected: true, closest: selector => selector.startsWith('[data-action') ? target : null };
    hf.__dispatchDesignEvent({ type: 'click', target, preventDefault() {}, stopImmediatePropagation() {} });
  };

  dispatch('wr-goal-edit');
  assert.equal(controller.snapshot().goalEditing, true);
  assert.equal(controller.snapshot().goalDraft, 'Ship a reliable workflow run with clear activity and recovery.');
  controller.setSummaryState({ goalDraft: '' });
  dispatch('wr-goal-cancel');
  assert.equal(controller.snapshot().goalEditing, false);
  assert.equal(controller.snapshot().goalDraft, '');

  dispatch('wr-goal-edit');
  assert.equal(controller.snapshot().goalDraft, 'Ship a reliable workflow run with clear activity and recovery.');
  controller.setSummaryState({ goalDraft: '' });
  dispatch('wr-summary');
  assert.equal(controller.snapshot().goalDraft, '');
  assert.match(controller.render('running'), /id="wfr-goal-draft"><\/textarea>/);
});

test('workflow run restores scroll offsets for every activity feed and the graph canvas', () => {
  const feeds = ['task-a', 'task-b'].map(id => ({ scrollTop: 0, closest: () => ({ dataset: { taskId: id } }) }));
  const canvas = { scrollTop: 0, scrollLeft: 0 };
  const split = {
    querySelector: selector => selector === '.wfr-selected-activity .parallel-feed-scroll' ? feeds[0] : selector === '.wf-run-canvas' ? canvas : null,
    querySelectorAll: selector => selector === '.parallel-feed-scroll' ? feeds : []
  };
  const hf = loadDesignRuntime({
    querySelectorOverride: selector => selector === '.wfr-run-layout' ? split : null
  });
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  hf.workflowRunController.setSummaryState({ feedScroll: { 'task-a': 17, 'task-b': 29 }, canvasScroll: 11, canvasScrollLeft: 23 });
  hf.afterWorkflowRunRender();
  assert.equal(feeds[0].scrollTop, 17);
  assert.equal(feeds[1].scrollTop, 29);
  assert.equal(canvas.scrollTop, 11);
  assert.equal(canvas.scrollLeft, 23);
});

test('workflow run keeps graph zoom scale and label across selection and summary rerenders', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  controller.setSummaryState({ zoom: 1.2 });
  const zoomed = controller.render('running');
  assert.match(zoomed, /data-zoom="1\.2"/);
  assert.match(zoomed, />120%<\/button>/);
  controller.select('implementation');
  controller.toggleSummary();
  const rerendered = controller.render('running');
  assert.match(rerendered, /data-zoom="1\.2"/);
  assert.match(rerendered, />120%<\/button>/);
});

test('workflow run summary and recovery remain independently guarded', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'workflow-run', state: 'attention', theme: 'dark' };
  hf.resetWorkflowRun(hf.route);
  const controller = hf.workflowRunController;
  assert.equal(controller.snapshot().recoveryOpen, true);
  controller.setSummaryState({ expanded: true, recoveryBusy: true, requiresAnswer: true });
  const busy = controller.render('attention');
  assert.match(busy, /class="wfr-summary expanded"/);
  assert.match(busy, /Recovery options/);
  assert.match(busy, /data-action="wr-recovery-submit" disabled/);
  assert.match(busy, /data-action="wr-recovery-retry" disabled/);
  controller.setRecovery(false);
  assert.doesNotMatch(controller.render('attention'), /Recovery options/);
  assert.match(controller.render('attention'), /class="wfr-summary expanded"/);

  hf.route = { screen: 'workflow-run', state: 'loading', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const loading = hf.workflowRunController.render('loading');
  assert.match(loading, /wfr-graph-loading/);
  assert.doesNotMatch(loading, /data-action="wr-cancel"/);
  hf.route = { screen: 'workflow-run', state: 'error', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  const error = hf.workflowRunController.render('error');
  assert.match(error, /Workflow could not be loaded/);
  assert.match(error, /error-state/);
  assert.doesNotMatch(error, /data-action="wr-retry"/);

  hf.route = { screen: 'workflow-run', state: 'running', theme: 'dark' };
  hf.resetWorkflowRun(hf.route);
  hf.workflowRunController.select('implementation');
  hf.route = { screen: 'workflow-run', state: 'running', theme: 'light' };
  hf.resetWorkflowRun(hf.route);
  assert.equal(hf.workflowRunController.snapshot().selection, null, 'changing route theme resets transient selection state');
});

test('workflow editor exposes the saved, dirty, recovery, and empty states with safe action guards', () => {
  const hf = loadDesignRuntime();
  const source = fs.readFileSync(path.join(root, 'scripts', 'workflow-editor.js'), 'utf8');
  const saved = hf.renderEditor('saved');
  assert.match(saved, /data-editor-route="saved"/);
  assert.match(saved, /Valid workflow · 3 nodes/);
  assert.match(saved, /data-editor-action="save" disabled/);
  assert.match(saved, /data-editor-action="discard" disabled/);
  assert.match(saved, /data-editor-action="run"/);

  const dirty = hf.renderEditor('dirty');
  assert.match(dirty, /Unsaved changes/);
  assert.match(dirty, /data-editor-action="save"(?![^>]*disabled)/);
  assert.match(dirty, /data-editor-action="discard"(?![^>]*disabled)/);
  assert.match(dirty, /data-editor-action="run"[^>]*disabled/);

  const empty = hf.renderEditor('empty');
  assert.match(empty, /editor-empty-canvas/);
  assert.match(empty, /Valid workflow · 0 nodes/);
  const conflict = hf.renderEditor('conflict');
  assert.match(conflict, /class="editor-validation problem"/);
  assert.match(conflict, /data-editor-action="reload"/);
  assert.match(conflict, /data-editor-action="save"[^>]*disabled/);
  const validation = hf.renderEditor('validation');
  assert.match(validation, /class="editor-validation problem"/);
  assert.doesNotMatch(validation, /data-editor-action="reload"/);
  assert.match(validation, /data-editor-action="save"[^>]*disabled/);
  const loading = hf.renderEditor('loading');
  assert.match(loading, /aria-label="Loading workflow canvas"/);
  assert.match(loading, /editor-loading-graph/);
  const readError = hf.renderEditor('read-error');
  assert.match(readError, /Workflow could not be loaded|Workflow unavailable/);
  assert.match(readError, /data-editor-action="refresh"/);
  assert.match(source, /d\.busy|selectedRun/);
  assert.match(source, /state\.draft\.busy=true/);
  assert.match(source, /state\.draft\.selectedRun=true/);
});

test('workflow editor selection inspectors preserve values, conditional fields, and escaping', () => {
  const hf = loadDesignRuntime();
  const hostile = '</textarea><img src=x onerror="bad()">';
  const nodeDefaults = hf.editorInspectorDefaults('node', 'planning');
  assert.equal(nodeDefaults.role, 'planning');
  assert.equal(nodeDefaults.access, 'read_only');
  const planning = hf.renderEditorInspector('node', { ...nodeDefaults, title: hostile, instructions: hostile, role: 'planning' });
  assert.match(planning, /Planning/);
  assert.match(planning, /Require task list/);
  assert.doesNotMatch(planning, /<img|onerror="/);
  assert.match(planning, /&lt;\/textarea&gt;&lt;img/);

  const implementation = hf.renderEditorInspector('node', { ...hf.editorInspectorDefaults('node', 'implementation'), role: 'implementation' });
  assert.doesNotMatch(implementation, /Require task list/);
  assert.match(implementation, /Node instructions/);
  const connection = hf.renderEditorInspector('connection', { ...hf.editorInspectorDefaults('connection', 'review-implementation'), isBackward: true, limitRetries: true, condition: hostile, maxRetries: 2 });
  assert.match(connection, /Limit retries/);
  assert.match(connection, /Max retries/);
  assert.match(connection, /&lt;\/textarea&gt;&lt;img/);
  const child = hf.renderEditorInspector('child-reference', { ...hf.editorInspectorDefaults('child-reference', 'workflow-step'), workflowId: 'wf-1', workflowName: 'Development workflow', orchestratorMode: 'child', showsChildSessionPolicy: true });
  assert.match(child, /Child session/);
  assert.match(child, /Workflow tree access requirements/);
  const missing = hf.renderEditorInspector('missing-reference', { ...hf.editorInspectorDefaults('missing-reference', 'workflow-step'), workflowId: 'missing-workflow-id', availableWorkflows: 'wf-2:Recovery workflow' });
  assert.match(missing, /Unavailable workflow/);
  assert.match(missing, /missing-workflow-id/);
  assert.match(missing, /Replace all matching nodes/);
});

test('canonical terminology distinguishes harnesses and nodes from participant agent copy', () => {
  const hf = loadDesignRuntime();
  const catalog = hf.renderTasks('tasks', 'degraded-catalog');
  assert.match(catalog, /aria-label="Filter tasks by harness"/);
  assert.match(catalog, /Harness catalog unavailable\. Showing known harnesses\./);
  assert.doesNotMatch(catalog, /Agent catalog unavailable|known agents/);

  const editor = hf.renderEditor('saved');
  assert.match(editor, /data-editor-select="node:implementation"[^>]*data-node-id="implementation"/);
  assert.match(editor, /Valid workflow · 3 nodes/);
  assert.match(editor, /data-editor-field="backend" aria-label="Harness"/);

  const node = hf.renderEditorInspector('node', { ...hf.editorInspectorDefaults('node', 'implementation'), role: 'implementation' });
  assert.match(node, /Node instructions/);
  assert.doesNotMatch(node, /Step instructions/);
  const orchestrator = hf.renderEditorInspector('orchestrator', hf.editorInspectorDefaults('orchestrator', 'orchestrator'));
  assert.match(orchestrator, /Parallel agents/);

  const summary = hf.taskPane('Summary', { id: 'terminology-task', title: 'Terminology', backend: 'codex', status: 'completed', summaryTurns: 4, summary: 'Done', editedFiles: [] }, 'completed');
  assert.match(summary, /Agent turns/);
  assert.match(editor, /Edit with agent/);

  const parallel = hf.renderParallel('two-lanes');
  assert.match(parallel, /2 agents · read_only, write_in_repo/);
  assert.match(parallel, /Enforced for every agent here/);

  const workflowSource = fs.readFileSync(path.join(root, 'scripts', 'workflow-editor.js'), 'utf8');
  assert.match(workflowSource, /data-modal-field="agent"/);
  assert.match(workflowSource, /data-editor-field/);
});

test('workflow editor zoom clamps to 50–200 in 25 point increments and preserves graph topology fixtures', () => {
  const hf = loadDesignRuntime();
  const source = fs.readFileSync(path.join(root, 'scripts', 'workflow-editor.js'), 'utf8');
  assert.match(source, /Math\.min\(200,state\.zoom\+25\)/);
  assert.match(source, /Math\.max\(50,state\.zoom-25\)/);
  assert.match(hf.renderEditor('branch'), /parallel_start/);
  assert.match(hf.renderEditor('branch'), /parallel_end/);
  assert.match(hf.renderEditor('child-reference'), /Run workflow/);
  assert.match(hf.renderEditor('on-demand'), /Investigation/);
  assert.match(hf.renderEditor('connection'), /Connection/);
  assert.match(hf.renderEditor('parallel-group'), /Parallel start/);
  assert.match(hf.renderEditor('parallel-group'), /data-editor-select="node:parallel-start/);
});

test('workflow editor builder and run sheets keep their source-shaped launch fields', () => {
  const hf = loadDesignRuntime();
  const source = fs.readFileSync(path.join(root, 'scripts', 'workflow-editor.js'), 'utf8');
  assert.match(source, /launchSheet\('builder'\)/);
  assert.match(source, /launchSheet\('run'\)/);
  assert.match(source, /data-modal-field="task"/);
  assert.match(source, /data-modal-field="repository"/);
  assert.match(source, /data-modal-field="prompt"/);
  assert.match(source, /data-modal-field="name"/);
  assert.match(source, /state\.draft\.selectedRun=true/);
  assert.match(source, /HF\.navigate\('workflow-run','running'\)/);
  const builder = hf.renderEditor('builder-conversation');
  assert.match(builder, /editor-builder-workspace/);
  assert.match(builder, /Return to canvas/);
  assert.match(builder, /Cancel run/);
  assert.doesNotMatch(builder, /data-editor-action="save"|data-editor-action="discard"|data-editor-action="run"/);
  assert.match(builder, /Describe a workflow change/);
  const proposal = hf.renderEditor('proposal-ready');
  assert.match(proposal, /Proposal ready/);
  assert.match(proposal, /Apply proposal/);
});

test('workflow editor builder workspace guards canvas actions and returns without losing the draft', () => {
  const hf = loadDesignRuntime();
  let snapshot = hf.editorController.reset('builder-conversation');
  const draftName = snapshot.draft.name;
  assert.equal(snapshot.draft.workspace, true);
  assert.equal(snapshot.canSave, false);
  assert.equal(snapshot.canDiscard, false);
  assert.equal(snapshot.canRun, false);
  snapshot = hf.editorController.setField('title', 'Builder edit retained');
  assert.equal(snapshot.draft.orchestrator.title, 'Builder edit retained');
  snapshot = hf.editorController.returnToCanvas();
  assert.equal(snapshot.draft.workspace, false);
  assert.equal(snapshot.draft.name, draftName);
  assert.equal(snapshot.draft.orchestrator.title, 'Builder edit retained', 'returning to canvas should retain unsaved edits');
  assert.equal(snapshot.canSave, true);
  assert.equal(snapshot.canRun, false, 'a retained edit should continue to block Run until saved');

  snapshot = hf.editorController.reset('proposal-ready');
  assert.equal(snapshot.canApplyProposal, true);
  assert.equal(snapshot.canSave, false);
  const nodeCount = snapshot.draft.nodes.length;
  snapshot = hf.editorController.returnToCanvas();
  assert.equal(snapshot.draft.workspace, false);
  assert.equal(snapshot.draft.nodes.length, nodeCount, 'returning to canvas should retain the proposal draft topology');
  assert.equal(snapshot.canApplyProposal, false);
});

test('workflow editor controller keeps typed inspector edits and clean false defaults stable', () => {
  const hf = loadDesignRuntime();
  let snapshot = hf.editorController.reset('node');
  assert.equal(snapshot.selected.kind, 'node');
  snapshot = hf.editorController.setField('optional', true);
  assert.equal(snapshot.draft.fieldValues['node:implementation'].optional, true);
  assert.equal(snapshot.draft.fieldValues['node:implementation'].optional, true);
  snapshot = hf.editorController.setField('optional', false);
  assert.equal(snapshot.draft.fieldValues['node:implementation'].optional, false);
  assert.equal(snapshot.dirty, false, 'reverting optional to its baseline should clear dirty state');
  snapshot = hf.editorController.setField('maxAttempts', 5);
  assert.equal(snapshot.draft.fieldValues['node:implementation'].maxAttempts, 5);
  snapshot = hf.editorController.setField('maxAttempts', '3');
  assert.equal(snapshot.draft.fieldValues['node:implementation'].maxAttempts, 3);
  assert.equal(snapshot.dirty, false, 'numeric string matching the baseline should remain clean');
  snapshot = hf.editorController.select('orchestrator', 'orchestrator');
  snapshot = hf.editorController.setField('maxParallel', 5);
  assert.equal(snapshot.draft.orchestrator.maxParallel, 5);
  snapshot = hf.editorController.setField('maxParallel', '4');
  assert.equal(snapshot.draft.orchestrator.maxParallel, 4);

  snapshot = hf.editorController.reset('connection');
  assert.equal(snapshot.dirty, false);
  snapshot = hf.editorController.setField('defaultPath', false);
  assert.equal(snapshot.draft.fieldValues['connection:review-implementation'].defaultPath, false);
  assert.equal(snapshot.dirty, false, 'writing the existing false default must not create a dirty draft');
});

test('workflow editor controller exposes field maps for every seeded selection kind', () => {
  const hf = loadDesignRuntime();
  for (const [route, kind] of [['node', 'node'], ['connection', 'connection'], ['branch', 'parallel'], ['child-reference', 'child-reference'], ['missing-reference', 'missing-reference'], ['on-demand', 'on-demand']]) {
    const initial = hf.editorController.reset(route);
    const selected = initial.selected;
    const snapshot = hf.editorController.select(kind, selected.id);
    assert.equal(snapshot.selected.kind, kind, `${route} selection kind should be retained`);
    const canonicalKind = kind === 'missing-reference' ? 'child-reference' : kind;
    assert.ok(snapshot.draft.fieldValues[`${canonicalKind}:${selected.id}`], `${route} should have initialized fields for selected item`);
    const withFallback = hf.editorController.setField('fallbackCount', 1);
    assert.equal(withFallback.draft.fieldValues[`${canonicalKind}:${selected.id}`].fallbackCount, 1);
  }
});

test('workflow editor controller guards additions, proposal snapshots, and paired parallel deletion', () => {
  const hf = loadDesignRuntime();
  hf.editorController.reset('saved');
  for (const kind of ['planning', 'implementation', 'review', 'task', 'workflow', 'start', 'end', 'parallel']) {
    const snapshot = hf.editorController.addNode(kind);
    const selected = snapshot.selected;
    const keyKind = selected.kind === 'parallel' ? 'parallel' : selected.kind === 'node' ? 'node' : selected.kind;
    assert.ok(snapshot.draft.fieldValues[`${keyKind}:${selected.id}`], `${kind} addition should initialize inspector fields`);
    const fallback = hf.editorController.addFallback();
    assert.equal(fallback.draft.fieldValues[`${keyKind}:${selected.id}`].fallbackCount, 1, `${kind} fallback should target selected fields`);
  }

  const proposal = hf.editorController.reset('proposal-ready');
  assert.equal(proposal.canApplyProposal, true);
  const stale = hf.editorController.setField('title', 'Edited while proposal was running');
  assert.equal(stale.canApplyProposal, false);
  const before = stale.draft.nodes.length;
  const rejected = hf.editorController.applyProposal();
  assert.equal(rejected.draft.nodes.length, before, 'stale proposal must not overwrite current edits');
  const fresh = hf.editorController.reset('proposal-ready');
  assert.equal(fresh.canApplyProposal, true);
  const applied = hf.editorController.applyProposal();
  assert.equal(applied.draft.nodes.some(node => node.id === 'reliability-check'), true);

  let parallel = hf.editorController.reset('saved');
  parallel = hf.editorController.addNode('parallel');
  const firstPair = parallel.selected.id;
  parallel = hf.editorController.addNode('parallel');
  const secondPair = parallel.selected.id;
  assert.equal(parallel.draft.nodes.filter(node => node.type.startsWith('parallel_')).length, 4);
  parallel = hf.editorController.select('parallel', firstPair);
  parallel = hf.editorController.removeSelected();
  assert.equal(parallel.draft.nodes.some(node => node.id === firstPair), false);
  assert.equal(parallel.draft.nodes.some(node => node.id === secondPair), true, 'deleting one group must preserve the other pair');
  assert.equal(parallel.draft.nodes.filter(node => node.type.startsWith('parallel_')).length, 2);
});

test('workflow editor controller preserves numeric schema when a limit is cleared and restored', () => {
  const hf = loadDesignRuntime();
  hf.editorController.reset('saved');
  let snapshot = hf.editorController.select('orchestrator', 'orchestrator');
  assert.equal(snapshot.draft.orchestrator.maxParallel, 4);
  snapshot = hf.editorController.setField('maxParallel', '');
  assert.equal(snapshot.draft.orchestrator.maxParallel, '');
  snapshot = hf.editorController.setField('maxParallel', '4');
  assert.equal(snapshot.draft.orchestrator.maxParallel, 4);
  assert.equal(typeof snapshot.draft.orchestrator.maxParallel, 'number');
  assert.equal(snapshot.dirty, false, 'restoring a cleared numeric limit should return to the baseline');
});

test('workflow editor controller keeps generated node identities unique after delete and re-add', () => {
  const hf = loadDesignRuntime();
  hf.editorController.reset('saved');
  const first = hf.editorController.addNode('task');
  const firstID = first.selected.id;
  const second = hf.editorController.addNode('task');
  const secondID = second.selected.id;
  assert.notEqual(firstID, secondID);
  hf.editorController.select('node', firstID);
  const afterDelete = hf.editorController.removeSelected();
  assert.equal(afterDelete.draft.nodes.some(node => node.id === firstID), false);
  assert.equal(afterDelete.draft.nodes.some(node => node.id === secondID), true);
  const readded = hf.editorController.addNode('task');
  const readdedID = readded.selected.id;
  assert.notEqual(readdedID, firstID, 'a re-added task must not reuse a deleted identity');
  assert.notEqual(readdedID, secondID, 'a re-added task must not collide with a surviving identity');
  assert.equal(new Set(readded.draft.nodes.map(node => node.id)).size, readded.draft.nodes.length);
});

test('workflow editor controller keeps on-demand identities unique after delete and re-add', () => {
  const hf = loadDesignRuntime();
  hf.editorController.reset('saved');
  assert.equal(typeof hf.editorController.addOnDemand, 'function');
  const first = hf.editorController.addOnDemand();
  const firstID = first.selected.id;
  const second = hf.editorController.addOnDemand();
  const secondID = second.selected.id;
  assert.notEqual(firstID, secondID);
  hf.editorController.select('on-demand', firstID);
  const afterDelete = hf.editorController.removeSelected();
  assert.equal(afterDelete.draft.standaloneNodes.some(node => node.id === firstID), false);
  const readded = hf.editorController.addOnDemand();
  const readdedID = readded.selected.id;
  assert.notEqual(readdedID, firstID);
  assert.notEqual(readdedID, secondID);
  assert.equal(new Set(readded.draft.standaloneNodes.map(node => node.id)).size, readded.draft.standaloneNodes.length);
});
