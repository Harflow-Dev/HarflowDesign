import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scripts = ['tokens.js', 'registry.js', 'components.js', 'tasks.js', 'task-activity.js', 'workflows.js', 'dialogs.js', 'foundations.js'];

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
    if (!href.startsWith('#')) assert.ok(fs.existsSync(path.join(root, href)), `missing local dependency: ${href}`);
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
  assert.match(hf.renderTasks('summary', 'completed'), /artifact_fixture_01/);

  const callerOwned = hf.renderTasks('approvals', 'caller-owned');
  assert.match(callerOwned, /Caller-owned/);
  assert.match(callerOwned, /read-only in Monitor/);
  assert.doesNotMatch(callerOwned, /data-action="approval-outcome:/);
  const inspected = hf.renderTasks('approvals', 'inspected');
  assert.match(inspected, /data-action="approval-outcome:Approved"/);
  assert.match(inspected, /data-action="approval-outcome:Rejected"/);
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
