import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scripts = ['tokens.js', 'registry.js', 'appearance.js', 'components.js', 'tasks.js', 'task-activity.js', 'parallel.js', 'task-approvals.js', 'task-summary.js', 'workflows.js', 'workflow-connectors.js', 'workflow-editor-proposals.js', 'workflow-editor-inspector.js', 'workflow-editor.js', 'council-activity.js', 'workflow-run.js', 'dialogs.js', 'workflow-launch-proposals.js', 'state-recovery.js', 'sidebar-setup.js', 'sidebar-proposals.js', 'statistics.js', 'foundations.js'];

function loadDesignRuntime({ captureEvents = false, querySelectorOverride, querySelectorAllOverride, history } = {}) {
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
    ...(history ? { history } : {}),
  });
  context.window = context;
  for (const file of scripts) {
    vm.runInContext(fs.readFileSync(path.join(root, 'scripts', file), 'utf8'), context, { filename: file });
  }
  if (context.HF && context.HFWorkflowConnectors) context.HF.HFWorkflowConnectors = context.HFWorkflowConnectors;
  if (captureEvents) context.HF.__dispatchDesignEvent = event => document.dispatchEvent(event);
  return context.HF;
}

function appearanceHarness({ saved = null, matches = false } = {}) {
  const writes = [];
  const mediaListeners = [];
  const root = { dataset: {} };
  const picker = { value: '' };
  const buttons = ['light', 'dark', 'system'].map(value => {
    const classes = new Set();
    return {
      dataset: { appearancePreference: value },
      classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } },
      get selected() { return classes.has('selected'); },
      setAttribute(name, value) { this[name] = value; },
    };
  });
  const document = {
    documentElement: root,
    querySelectorAll: selector => selector === '[data-appearance-preference]' ? buttons : [],
    querySelector: selector => selector === '#theme-picker' ? picker : null,
  };
  const storage = {
    getItem() { return saved; },
    setItem(key, value) { writes.push([key, value]); },
  };
  const media = {
    matches,
    addEventListener(type, listener) { if (type === 'change') mediaListeners.push(listener); },
  };
  const location = { hash: '#tasks/populated/system' };
  const history = { replaceState(_state, _title, hash) { location.hash = hash; } };
  const hf = loadDesignRuntime();
  const controller = hf.createAppearanceController({ storage, matchMedia: () => media, document, location, history });
  controller.publish();
  return { hf, controller, root, picker, buttons, writes, media, mediaListeners, location };
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
  statistics: (hf, state) => hf.renderStatistics(state),
};

test('appearance defaults to System, follows the OS, and keeps the selected control distinct from the resolved theme', () => {
  const { controller, root, buttons, media, mediaListeners } = appearanceHarness({ matches: false });
  assert.equal(controller.preference, 'system');
  assert.equal(controller.theme, 'light');
  assert.equal(root.dataset.theme, 'light');
  assert.equal(buttons.find(button => button.selected).dataset.appearancePreference, 'system');

  media.matches = true;
  mediaListeners[0]();
  assert.equal(controller.theme, 'dark');
  assert.equal(controller.themeMode, 'system');
});

test('store recovery specimens follow the native task store presentation and keep unmatched states exploratory', () => {
  const hf = loadDesignRuntime();
  const states = Array.from(hf.screens.find(screen => screen.id === 'settings').states.filter(state => state.startsWith('recovery-')));
  assert.deepEqual(states, [
    'recovery-incompatible', 'recovery-inspecting', 'recovery-confirmation', 'recovery-running', 'recovery-busy',
    'recovery-stale', 'recovery-pre-backup-failure', 'recovery-partial', 'recovery-success', 'recovery-unsupported'
  ]);
  const mapped = Array.from(hf.taskStoreStates);
  assert.deepEqual(mapped, ['recovery-incompatible', 'recovery-inspecting', 'recovery-confirmation', 'recovery-running', 'recovery-success', 'recovery-pre-backup-failure']);
  const unmatched = states.filter(state => !mapped.includes(state));
  assert.deepEqual(unmatched, ['recovery-busy', 'recovery-stale', 'recovery-partial', 'recovery-unsupported']);
  for (const state of mapped) assert.equal(hf.specimenStatus('settings', state).kind, 'source-derived', `${state} is source-derived`);
  for (const state of unmatched) assert.deepEqual(Array.from(hf.specimenStatus('settings', state).tickets), ['#12']);
  const storeGroup = state => (hf.renderSettings(state).match(/<section class="settings-group store-group">.*?<\/section>/s) || [''])[0];
  const title = state => (hf.renderSettings(state).match(/<section class="settings-group store-group">.*?<h4>(.*?)<\/h4>/s) || [])[1];
  assert.equal(title('general'), 'Task store');
  assert.equal(title('recovery-incompatible'), 'Task store needs attention');
  assert.equal(title('recovery-inspecting'), 'Task store needs attention');
  assert.equal(title('recovery-confirmation'), 'Back up and reset this store?');
  assert.equal(title('recovery-running'), 'Recovering task store…');
  assert.equal(title('recovery-success'), 'Task store is ready');
  assert.equal(title('recovery-pre-backup-failure'), 'Recovery could not finish');
  const general = hf.renderSettings('general');
  assert.match(general, /Inspect the task store to check compatibility\. Inspection does not reset history\./);
  assert.match(general, /MCP registrations are managed separately in Harnesses\./);
  assert.match(general, /Harflow runtime is ready/);
  assert.doesNotMatch(general, /prepares its paired runtime automatically|Harflow runtime is ready\./);
  const inspected = hf.renderSettings('recovery-inspecting');
  assert.match(inspected, /Inspect task store/);
  assert.match(inspected, /Review backup and reset/);
  assert.match(inspected, /Previous task history will be archived, not imported\./);
  const confirmation = hf.renderSettings('recovery-confirmation');
  assert.match(confirmation, /Confirm backup and reset/);
  assert.match(confirmation, /Backup path/);
  assert.match(confirmation, /class="danger"[^>]*>Confirm backup and reset/);
  assert.doesNotMatch(confirmation, /Inspect task store/);
  assert.doesNotMatch(confirmation, /type="checkbox"[^>]*>Confirm/);
  assert.doesNotMatch(storeGroup('recovery-running'), /<button/, 'recovering shows progress and no actions');
  assert.match(hf.renderSettings('recovery-success'), /Show backup in Finder/);
  assert.doesNotMatch(hf.renderSettings('recovery-incompatible') + inspected + confirmation, /\/Users\//);
  assert.match(hf.renderSettings('runtime-retry'), /Retry installation/);
  assert.match(hf.renderSettings('runtime-retry'), /store-card disabled/);
  assert.match(hf.renderSettings('runtime-retry'), /<button type="button" class="" data-action="feedback:Task store inspection requested" disabled>/);
  assert.match(hf.renderTasks('tasks', 'store-incompatible'), /route:settings\/recovery-incompatible/);
  for (const state of unmatched) {
    hf.route = { state };
    const html = hf.renderStateRecovery(state);
    assert.match(html, /Selected store/);
    assert.doesNotMatch(html, /state_incompatible|\/Users\//);
  }
  const partial = hf.renderStateRecovery('recovery-partial');
  assert.match(partial, /Continue recovery/);
  assert.match(partial, /preserved across the selected store and recovery backup/);
  assert.match(hf.renderStateRecovery('recovery-unsupported'), /Update Harflow/);
});

test('harness rows use the native state labels and last-action chip', () => {
  const hf = loadDesignRuntime();
  assert.match(hf.harnesses('harnesses'), /Installed<\/span>.*last: install/s);
  assert.match(hf.harnesses('outdated'), /Installed · out of date/);
  assert.match(hf.harnesses('unknown'), />Unknown</);
  assert.doesNotMatch(hf.harnesses('outdated') + hf.harnesses('unknown'), /Registration (outdated|unknown)/);
  assert.match(hf.harnesses('harnesses'), /Not installed/);
});

test('the main window titlebar carries the bundled emblem as a template image', () => {
  const hf = loadDesignRuntime();
  const bar = hf.titlebar('Harflow', { connectionStatus: true, connectionScreen: 'tasks', connectionState: 'populated' });
  assert.match(bar, /class="window-emblem" aria-hidden="true"><img src="assets\/branding\/menubarTemplate\.png" srcset="assets\/branding\/menubarTemplate@2x\.png 2x" alt=""/);
  assert.doesNotMatch(hf.titlebar('Sheet'), /window-emblem/);
  const mac = path.resolve(root, '..', 'HarflowMac');
  const source = 'macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Resources/Branding';
  for (const file of ['menubarTemplate.png', 'menubarTemplate@2x.png']) {
    const copy = fs.readFileSync(path.join(root, 'assets/branding', file));
    assert.ok(copy.length > 0, `${file} copied`);
    const native = path.join(mac, source, file);
    if (fs.existsSync(native)) assert.ok(copy.equals(fs.readFileSync(native)), `${file} matches the native resource byte for byte`);
  }
  const css = fs.readFileSync(path.join(root, 'styles/appearance.css'), 'utf8');
  assert.match(css, /\.window-emblem \{[^}]*background-color: var\(--primaryText\)[^}]*mask:/, 'the emblem is filled with the primary-text token through a mask');
  assert.match(css, /html\.file-protocol \.window-emblem img \{ display: block; \}/, 'file:// previews fall back to the image');
  assert.match(css, /\.window-emblem img \{[^}]*invert\(\.11\)/);
  assert.match(css, /data-theme="dark"\] \.window-emblem img[^}]*invert\(\.95\)/);
});

test('setup card scrolls inside a 16 point inset above a fixed footer', () => {
  const hf = loadDesignRuntime();
  assert.match(hf.sidebarSetup('setup-required'), /<div class="setup-scroll"><section class="sidebar-setup-card"/);
  assert.doesNotMatch(hf.sidebarSetup('setup-ready'), /setup-scroll/);
  const css = fs.readFileSync(path.join(root, 'styles/sidebar-setup.css'), 'utf8');
  assert.match(css, /\.sidebar-setup \.setup-scroll \{[^}]*padding: 16px/);
});

test('appearance responds to OS changes only while System is selected', () => {
  const { controller, root, media, mediaListeners } = appearanceHarness({ matches: false });
  assert.equal(mediaListeners.length, 1);
  media.matches = true;
  mediaListeners[0]();
  assert.equal(root.dataset.theme, 'dark');

  controller.setPreference('light');
  media.matches = false;
  mediaListeners[0]();
  assert.equal(controller.theme, 'light');
  assert.equal(root.dataset.theme, 'light');
  assert.equal(controller.preference, 'light');
});

test('appearance preview overrides the resolved theme without changing the stored app preference', () => {
  const { controller, root, picker, writes, location } = appearanceHarness({ saved: 'system', matches: false });
  assert.equal(controller.setPreview('dark'), 'dark');
  assert.equal(controller.preview, 'dark');
  assert.equal(controller.preference, 'system');
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(picker.value, 'dark');
  assert.deepEqual(writes, []);
  assert.equal(location.hash, '#tasks/populated/dark');

  controller.setPreference('light');
  assert.equal(controller.preview, null);
  assert.equal(controller.theme, 'light');
  assert.deepEqual(writes, [['harflow.appearance', 'light']]);
  assert.equal(location.hash, '#tasks/populated/system');
});

test('appearance persistence is mode-only and storage failures do not prevent selection', () => {
  const writes = [];
  const storage = {
    getItem() { throw new Error('storage unavailable'); },
    setItem() { throw new Error('storage unavailable'); },
  };
  const { hf } = appearanceHarness();
  const controller = hf.createAppearanceController({ storage, matchMedia: () => ({ matches: false }) });
  assert.equal(controller.preference, 'system');
  assert.doesNotThrow(() => controller.setPreference('dark'));
  assert.equal(controller.theme, 'dark');
  assert.equal(writes.length, 0);
});

test('appearance controls expose native icon buttons with an initial selected state', () => {
  const hf = loadDesignRuntime();
  const html = hf.appearanceControl();
  assert.match(html, /class="appearance-button selected"[^>]*data-appearance-preference="system"/);
  assert.match(html, /assets\/symbols\/appearance\/sun\.max\.png/);
  assert.match(html, /assets\/symbols\/appearance\/moon\.png/);
  assert.match(html, /assets\/symbols\/appearance\/desktopcomputer\.png/);
  assert.match(html, /aria-pressed="true"/);
});

test('connection indicator reflects the task-list fixture, while task panes stay connected during loading', () => {
  const hf = loadDesignRuntime();
  for (const state of ['loading', 'list-error', 'install-retry']) {
    assert.match(hf.connectionIndicator('tasks', state), /Disconnected/);
  }
  for (const state of ['empty', 'populated']) {
    assert.match(hf.connectionIndicator('tasks', state), /Connected/);
  }
  hf.route = { screen: 'summary', state: 'loading', theme: 'light' };
  const summary = hf.renderTasks('summary', 'loading');
  assert.match(summary, /aria-label="Connected"/);
  assert.match(summary, /aria-label="Connected" title="Connected"/, 'connected panes should not claim the task list has not loaded');
  hf.route = { screen: 'tasks', state: 'loading', theme: 'light' };
  assert.match(hf.renderTasks('tasks', 'loading'), /aria-label="Disconnected"/);
});

test('task toolbar actions survive appearance-aware task rendering', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'task-detail', state: 'running', theme: 'light' };
  const html = hf.renderTasks('task-detail', 'running');
  assert.match(html, /data-action="toggle-inspector"/);
  assert.match(html, /Take over in Terminal/);
  assert.match(html, /More actions/);
  assert.match(html, /class="connection-indicator connected"/);
});

test('principal title styling is scoped to the specimen title and matches native hierarchy', () => {
  const css = fs.readFileSync(path.join(root, 'styles/appearance.css'), 'utf8');
  const titleRule = css.match(/\.main-window-titlebar \.window-title\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(titleRule, /font-size\s*:\s*15px/);
  assert.match(titleRule, /font-weight\s*:\s*700/);
  assert.match(titleRule, /color\s*:\s*var\(--primaryText\)/);
  const hf = loadDesignRuntime();
  hf.route = { screen: 'task-detail', state: 'running', theme: 'light' };
  assert.match(hf.renderTasks('task-detail', 'running'), /class="titlebar main-window-titlebar"/);
  assert.match(hf.titlebar('Sheet'), /class="titlebar"/);
  assert.doesNotMatch(hf.titlebar('Sheet'), /main-window-titlebar/);
});

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
    if (!family.source) {
      assert.ok(family.proposal && !family.proposals, `${family.id} may omit a native source only as a whole-proposal family`);
      continue;
    }
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

test('shared workflow connector geometry clamps rounded corners and emits native open chevrons', () => {
  const hf = loadDesignRuntime();
  const connectors = hf.HFWorkflowConnectors;
  assert.equal(connectors.roundedPath([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }]), 'M0 0 L90 0 Q100 0 100 10 L100 100');
  assert.equal(connectors.roundedPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 6 }]), 'M0 0 L7 0 Q10 0 10 3 L10 6');
  assert.match(connectors.roundedPath([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 }]), /^M0 0 L0 0 L10 0$/);
  assert.equal(connectors.arrowPath([{ x: 10, y: 20 }, { x: 30, y: 20 }]), 'M23 25 L30 20 L23 15');
  assert.equal(connectors.arrowPath([{ x: 30, y: 20 }, { x: 10, y: 20 }]), 'M3 25 L10 20 L3 15');
  assert.equal(connectors.arrowPath([{ x: 10, y: 20 }]), '');
});

test('workflow connector renderers keep one arrow per edge and semantic backward hitboxes', () => {
  const hf = loadDesignRuntime();
  const run = hf.renderRun('running');
  assert.equal((run.match(/class="wf-connector-edge /g) || []).length, 5);
  assert.match(run, /class="wf-connector-edge backward"/);
  assert.doesNotMatch(run, /marker-end|non-scaling-stroke/);

  const editorSource = fs.readFileSync(path.join(root, 'scripts', 'workflow-editor.js'), 'utf8');
  assert.match(editorSource, /HFWorkflowConnectors\.roundedPath\(points\)/);
  assert.match(editorSource, /HFWorkflowConnectors\.arrowPath\(points\)/);
  assert.match(editorSource, /class="edge-hitbox"/);
  assert.match(editorSource, /edge\.isBackward \? 'backward'/);
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

test('sidebar setup states are registered as a complete task route family', () => {
  const hf = loadDesignRuntime();
  const states = hf.screens.find(screen => screen.id === 'tasks').states;
  assert.equal(JSON.stringify(states.slice(-7)), JSON.stringify([
    'setup-required', 'setup-installing', 'setup-failed',
    'setup-update-required', 'setup-updating', 'setup-update-failed', 'setup-ready'
  ]));
  assert.equal(typeof hf.sidebarSetup, 'function');
  assert.equal(typeof hf.renderSidebarSetup, 'function');
});

test('unready setup cards keep task history and creation controls unavailable', () => {
  const hf = loadDesignRuntime();
  const unready = [
    'setup-required', 'setup-installing', 'setup-failed',
    'setup-update-required', 'setup-updating', 'setup-update-failed'
  ];
  for (const state of unready) {
    const sidebar = hf.sidebarSetup(state);
    const page = hf.renderSidebarSetup(state);
    assert.match(sidebar, /class="sidebar sidebar-setup/);
    assert.doesNotMatch(sidebar, /task-row|task-activity-app|workflow-row|setup-empty-history/);
    assert.doesNotMatch(page, /task-row|task-activity-app|workflow-row|New session|Create workflow/);
    assert.match(page, /Finish setting up Harflow/);
  }
});

test('setup actions route to busy states and busy states suppress duplicate actions', () => {
  const hf = loadDesignRuntime();
  const required = hf.sidebarSetup('setup-required');
  assert.match(required, /Install required components/);
  assert.match(required, /data-action="route:tasks\/setup-installing"/);
  assert.doesNotMatch(required, /Update required components/);

  const installing = hf.sidebarSetup('setup-installing');
  assert.match(installing, /role="status"/);
  assert.doesNotMatch(installing, /Install required components|Retry installation|data-action="route:tasks\/setup-installing"/);

  const failedInstall = hf.sidebarSetup('setup-failed');
  assert.match(failedInstall, /Retry installation/);
  assert.match(failedInstall, /data-action="route:tasks\/setup-installing"/);

  const updateRequired = hf.sidebarSetup('setup-update-required');
  assert.match(updateRequired, /Installed<\/dt><dd>0\.0\.1/);
  assert.match(updateRequired, /Required by this app<\/dt><dd>0\.0\.2/);
  assert.match(updateRequired, /Update required components/);
  assert.match(updateRequired, /data-action="route:tasks\/setup-updating"/);
  assert.doesNotMatch(updateRequired, /Install required components/);

  const updating = hf.sidebarSetup('setup-updating');
  assert.match(updating, /role="status"/);
  assert.doesNotMatch(updating, /Update required components|Retry update|data-action="route:tasks\/setup-updating"/);

  const failedUpdate = hf.sidebarSetup('setup-update-failed');
  assert.match(failedUpdate, /Retry update/);
  assert.match(failedUpdate, /data-action="route:tasks\/setup-updating"/);
});

test('setup rendering does not leak an existing task into an unavailable session', () => {
  const hf = loadDesignRuntime();
  hf.currentTask = hf.fixtures[0];
  const html = hf.renderSidebarSetup('setup-required');
  const routed = hf.renderTasks('tasks', 'setup-required');
  assert.doesNotMatch(html, /task-row|task-activity-app|composer|workflow-row/);
  assert.match(routed, /sidebar-setup-app/);
  assert.doesNotMatch(routed, /task-row|task-activity-app|composer|workflow-row/);
  assert.doesNotMatch(html, new RegExp(hf.fixtures[0].title));
  hf.currentTask = null;
});

test('ready setup state is a normal empty shell without the setup card or fabricated history', () => {
  const hf = loadDesignRuntime();
  hf.route = { screen: 'tasks', state: 'setup-ready' };
  const sidebar = hf.sidebarSetup('setup-ready');
  const page = hf.renderSidebarSetup('setup-ready');
  assert.match(sidebar, /class="sidebar sidebar-setup setup-ready"/);
  assert.doesNotMatch(sidebar, /sidebar-setup-card|FIRST-TIME SETUP|UPDATE REQUIRED/);
  assert.match(sidebar, /No tasks yet/);
  assert.match(sidebar, /route:new-session\/default/);
  assert.match(sidebar, /route:workflow-editor\/empty/);
  assert.doesNotMatch(page, /task-row|task-activity-app|workflow-row|sidebar-setup-card/);
  assert.match(page, /Harflow is ready to use/);
  assert.match(page, /connection-indicator connected/);
  assert.match(page, /aria-label="Connected"/);
});

test('unready setup titlebars expose a disconnected runtime indicator', () => {
  const hf = loadDesignRuntime();
  for (const state of [
    'setup-required', 'setup-installing', 'setup-failed',
    'setup-update-required', 'setup-updating', 'setup-update-failed'
  ]) {
    hf.route = { screen: 'tasks', state };
    const page = hf.renderSidebarSetup(state);
    assert.match(page, /connection-indicator disconnected/);
    assert.match(page, /aria-label="Disconnected"/);
    assert.doesNotMatch(page, /aria-label="Connected"/);
  }
});

test('setup styling uses appearance tokens for both light and dark surfaces', () => {
  const css = fs.readFileSync(path.join(root, 'styles', 'sidebar-setup.css'), 'utf8');
  assert.match(css, /var\(--(?:cardBorder|cardFill|primaryText|secondaryText|accentLink)\)/);
  assert.doesNotMatch(css, /prefers-color-scheme/);
});

test('proposal metadata names real states and valid ticket references', () => {
  const hf = loadDesignRuntime();
  for (const family of hf.screens) {
    if (family.proposal) assert.ok(family.proposal.tickets.length > 0 && family.proposal.tickets.every(hf.isTicketRef), `${family.id} proposal tickets`);
    if (!family.source) assert.ok(family.proposal, `${family.id} has no native source and is not a whole-proposal family`);
    for (const [state, entry] of Object.entries(family.proposals || {})) {
      assert.ok(family.states.includes(state), `${family.id} proposal names unknown state ${state}`);
      assert.ok(entry.tickets.length > 0 && entry.tickets.every(hf.isTicketRef), `${family.id}/${state} tickets`);
      assert.ok(['state', 'element'].includes(entry.scope), `${family.id}/${state} scope`);
    }
    for (const state of family.approved?.states || []) assert.ok(family.states.includes(state), `${family.id} approved state ${state}`);
  }
  assert.ok(hf.isTicketRef('#13') && hf.isTicketRef('HarflowMCP#18'));
  assert.ok(!hf.isTicketRef('13') && !hf.isTicketRef('#') && !hf.isTicketRef('HarflowMac#1x'));
});

test('specimen status captions label exploratory, element-scope, approved, and source-derived states', () => {
  const hf = loadDesignRuntime();
  assert.deepEqual(JSON.parse(JSON.stringify(hf.specimenStatus('approvals', 'inspected'))), { kind: 'exploratory', tickets: ['#13'], caption: 'Exploratory · ticket #13 · Not approved · Inline Activity cards with a compact pending indicator on Summary and Prompt' });
  assert.match(hf.specimenStatus('approvals', 'caller-owned').caption, /^Exploratory · tickets #13, #14 · Not approved/);
  assert.match(hf.specimenStatus('approvals', 'caller-owned-legacy').caption, /Read-only guidance is current native behavior/);
  assert.equal(hf.specimenStatus('tasks', 'store-incompatible').kind, 'exploratory');
  assert.equal(hf.specimenStatus('workflow-run', 'running').kind, 'contains-exploratory');
  assert.equal(hf.specimenStatus('workflow-run', 'running').caption, 'Source-derived · contains exploratory element (#15) · Not approved');
  assert.equal(hf.specimenStatus('tasks', 'setup-required').kind, 'approved');
  assert.equal(hf.specimenStatus('tasks', 'setup-required').caption, 'First-install setup layout approved · Native fidelity under validation');
  assert.equal(hf.specimenStatus('tasks', 'populated').caption, 'Source-derived · Not approved · See coverage and native references');
  assert.equal(hf.specimenStatus('missing-family', 'x').kind, 'source-derived');
  const catalog = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  assert.match(catalog, /HF\.specimenStatus\(/);
  assert.match(catalog, /HF\.stateLabel\(/);
  assert.doesNotMatch(catalog, /Exploratory approval design|First-install setup layout approved/, 'captions must come from the registry helper');
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'scripts/state-recovery.js'), 'utf8'), /EXPLORATORY/, 'the recovery kicker is replaced by the shared specimen label');
});

test('state labels and navigation search expose exploratory states', () => {
  const hf = loadDesignRuntime();
  assert.equal(hf.stateLabel('approvals', 'inspected'), 'inspected · Exploratory');
  assert.equal(hf.stateLabel('approvals', 'monitor-pending'), 'Harflow-owned pending · Exploratory');
  assert.equal(hf.stateLabel('workflow-run', 'running'), 'running · Exploratory element');
  assert.equal(hf.stateLabel('tasks', 'backend-empty'), 'No tasks for harness');
  assert.equal(hf.stateLabel('tasks', 'populated'), 'populated');
  const search = family => hf.familySearchText(hf.screens.find(screen => screen.id === family)).toLowerCase();
  assert.ok(search('approvals').includes('exploratory'));
  assert.ok(search('workflow-run').includes('exploratory element'));
  assert.ok(!search('raw-events').includes('exploratory'));
});

test('exploratory specimens carry an in-stage label and other specimens do not', () => {
  const hf = loadDesignRuntime();
  const labelled = hf.specimenStage('approvals', 'inspected', '<section class="app"></section>');
  assert.match(labelled, /^<p class="exploratory-kicker" role="note" data-specimen-status="exploratory">Exploratory · ticket #13 · Not approved/);
  assert.ok(labelled.endsWith('<section class="app"></section>'));
  for (const [family, state] of [['workflow-run', 'running'], ['tasks', 'populated'], ['tasks', 'setup-required']]) {
    assert.equal(hf.specimenStage(family, state, '<section></section>'), '<section></section>');
  }
});

test('compact workflow-run sidebar proposal (#15) covers every state that can display it', () => {
  const hf = loadDesignRuntime();
  const run = hf.screens.find(family => family.id === 'workflow-run');
  hf.route = { theme: 'light', screen: 'workflow-run' };
  const display = [];
  for (const state of run.states) {
    hf.route = { theme: 'light', screen: 'workflow-run', state };
    hf.resetWorkflowRun(hf.route);
    const html = renderers['workflow-run'](hf, state);
    // The compact default shows initially, or after deselection or a mode change when a node starts selected.
    const canShowCompact = html.includes('wfr-sidebar-default') || html.includes('has-selection');
    if (canShowCompact) display.push(state);
    const status = hf.specimenStatus('workflow-run', state);
    if (state.startsWith('council')) { assert.equal(status.kind, 'exploratory'); assert.deepEqual(Array.from(status.tickets), ['#17', '#15']); display.pop(); continue; }
    assert.equal(status.kind === 'contains-exploratory', canShowCompact, `workflow-run/${state} #15 element metadata`);
    if (canShowCompact) assert.deepEqual(Array.from(status.tickets), ['#15']);
  }
  assert.ok(display.length >= 10, 'expected the shared run sidebar to appear in most run states');
  assert.ok(!display.includes('loading') && !display.includes('error'));
  for (const family of hf.screens) {
    if (family.id === 'workflow-run') continue;
    hf.route = { theme: 'light', screen: family.id, state: family.states[0] };
    for (const state of family.states) {
      hf.route.state = state;
      assert.doesNotMatch(renderers[family.id](hf, state), /wfr-run-sidebar|wfr-sidebar-default/, `${family.id}/${state} renders the compact run sidebar`);
    }
  }
});

test('starred workflows list first and keep the existing relative order', () => {
  const hf = loadDesignRuntime();
  const items = ['A', 'B', 'C', 'D'].map(id => ({ id }));
  const ids = starred => Array.from(hf.orderStarred(items, starred), item => item.id).join('');
  assert.equal(ids([]), 'ABCD');
  assert.equal(ids(['D', 'B']), 'BDAC', 'star D then B');
  assert.equal(ids(['D']), 'DABC');
  assert.equal(ids(['D', 'B'].filter(id => id !== 'B')), 'DABC', 'unstar B');
  const html = hf.renderTasks('tasks', 'starred-workflows');
  assert.ok(html.indexOf('Release checklist') < html.indexOf('Session reliability') && html.indexOf('Session reliability') < html.indexOf('Development workflow'));
  assert.match(html, /aria-label="Star Release checklist" aria-pressed="true"/);
  assert.match(html, /aria-label="Star Session reliability" aria-pressed="false"/);
  assert.match(html, /data-action="route:workflow-run\/running" data-sp-workflow="session-reliability"/, 'starring is a separate control and the row still opens the workflow');
});

test('sidebar context menu enables Cancel and Resume only when valid and always confirms Delete', () => {
  const hf = loadDesignRuntime();
  const items = item => Array.from(hf.contextMenuItems(item), entry => entry.separator ? '-' : `${entry.label}:${entry.enabled ? 'on' : 'off'}`).join(' ');
  assert.equal(items({ kind: 'task', status: 'completed' }), 'Cancel:off Resume:on - Delete…:on');
  assert.equal(items({ kind: 'task', status: 'running' }), 'Cancel:on Resume:off - Delete…:on');
  for (const status of ['failed', 'cancelled', 'timed-out']) assert.equal(items({ kind: 'task', status }), 'Cancel:off Resume:on - Delete…:on');
  assert.equal(items({ kind: 'workflow' }), 'Rename…:on - Delete…:on');
  const menu = hf.renderTasks('tasks', 'context-menu');
  assert.match(menu, /role="menu" aria-label="Actions for Audit artifact references"/);
  assert.match(menu, /aria-disabled="true">Cancel</);
  assert.match(menu, /class="sp-menu-item danger" data-action="sp-menu:delete" >Delete…</);
  const dialog = hf.renderTasks('tasks', 'delete-confirmation');
  assert.match(dialog, /role="alertdialog" aria-modal="true"/);
  assert.match(dialog, /Delete “Audit artifact references”\?/);
  assert.match(dialog, /This cannot be undone\./);
  assert.ok(dialog.indexOf('class="primary" data-action="sp-delete-cancel">Cancel') < dialog.indexOf('class="danger" data-action="sp-delete-confirm">Delete'), 'Cancel is the default and comes first');
  const running = hf.deleteConfirmation({ kind: 'task', name: 'Review <b>', status: 'running' });
  assert.match(running, /is still running/);
  assert.match(running, /Nothing is cancelled or removed automatically\./);
  assert.doesNotMatch(running, /sp-delete-confirm/);
  assert.match(running, /Review &lt;b&gt;/, 'item names are escaped');
  assert.doesNotMatch(dialog, /\/Users\//);
});

test('appearance moves into the header only on its exploratory state', () => {
  const hf = loadDesignRuntime();
  hf.route = { theme: 'light', screen: 'tasks', state: 'appearance-header' };
  const html = hf.renderTasks('tasks', 'appearance-header');
  assert.match(html, /class="appearance-header-control" role="group" aria-label="Appearance"/);
  assert.deepEqual(Array.from(html.matchAll(/data-appearance-preference="(\w+)" aria-label="(\w+)"/g), m => `${m[1]}:${m[2]}`), ['light:Light', 'dark:Dark', 'system:System']);
  assert.match(html, /class="appearance-segment selected" data-appearance-preference="system"[^>]*aria-pressed="true"/);
  assert.ok(html.indexOf('appearance-header-control') < html.indexOf('class="sidebar'), 'the control lives in the titlebar, before the sidebar');
  assert.doesNotMatch(html, /class="appearance-control"/, 'the footer control is removed');
  assert.match(html, /settings-gear/, 'Settings stays in the footer');
  assert.equal(hf.specimenStatus('tasks', 'appearance-header').kind, 'exploratory');
  assert.deepEqual(Array.from(hf.specimenStatus('tasks', 'appearance-header').tickets), ['#6']);
});

test('sidebar proposal markup does not leak into shared sidebar renders', () => {
  const hf = loadDesignRuntime();
  const marker = /star-toggle|appearance-header-control|sp-menu|sp-alert|sp-overlay-root|data-sp-workflow/;
  const proposal = hf.sidebarProposalStates;
  assert.deepEqual(Array.from(proposal), ['appearance-header', 'starred-workflows', 'context-menu', 'delete-confirmation']);
  for (const family of hf.screens) {
    for (const state of family.states) {
      if (family.id === 'tasks' && proposal.includes(state)) continue;
      if (family.id === 'workflow-launch' && state === 'library-starred') continue;
      hf.route = { theme: 'light', screen: family.id, state };
      if (family.id === 'workflow-run') hf.resetWorkflowRun(hf.route);
      assert.doesNotMatch(renderers[family.id](hf, state), marker, `${family.id}/${state} renders sidebar proposal markup`);
    }
  }
  for (const state of proposal) hf.route = { theme: 'light', screen: 'tasks', state };
  for (const state of ['appearance-header', 'starred-workflows', 'context-menu', 'delete-confirmation']) {
    hf.route = { theme: 'light', screen: 'tasks', state };
    const html = renderers.tasks(hf, state);
    assert.equal(/star-toggle/.test(html), state === 'starred-workflows', `${state} stars`);
    assert.equal(/appearance-header-control/.test(html), state === 'appearance-header', `${state} header control`);
    assert.equal(/sp-menu"/.test(html), state === 'context-menu', `${state} menu`);
    assert.equal(/sp-alert"/.test(html), state === 'delete-confirmation', `${state} alert`);
  }
});

test('workflow editor proposals are registered as exploratory with their tickets', () => {
  const hf = loadDesignRuntime();
  const expected = { rename: '#4', 'standalone-reorder': '#1', 'council-config': '#17', readiness: 'HarflowMCP#18' };
  for (const [state, ticket] of Object.entries(expected)) {
    const status = hf.specimenStatus('workflow-editor', state);
    assert.equal(status.kind, 'exploratory', state);
    assert.deepEqual(Array.from(status.tickets), [ticket]);
    assert.match(status.caption, new RegExp(`^Exploratory · ticket ${ticket.replace('#', '\\#')} · Not approved`));
  }
  assert.equal(hf.specimenStatus('workflow-editor', 'saved').kind, 'source-derived');
  assert.equal(hf.specimenStatus('workflow-editor', 'builder-conversation').kind, 'source-derived');
});

test('workflow rename validates empty names and collisions without dropping the edit', () => {
  const hf = loadDesignRuntime();
  const check = (value, current = 'Session reliability') => JSON.parse(JSON.stringify(hf.workflowNameValidation(value, current)));
  assert.equal(check('').kind, 'empty');
  assert.equal(check('   ').kind, 'empty');
  assert.equal(check('Development workflow').message, 'A workflow named “Development workflow” already exists.');
  assert.equal(check('  release CHECKLIST ').kind, 'collision', 'comparison trims and ignores case');
  assert.equal(check('Session reliability').valid, false, 'an unchanged name is not a rename');
  assert.equal(check('Reliability review').valid, true);
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'rename' };
  const opened = hf.renderEditor('rename');
  assert.match(opened, /value="Session reliability"/, 'opens with the current name and no error');
  assert.doesNotMatch(opened, /aria-invalid|already exists/);
  assert.match(opened, /data-editor-action="submit-modal" disabled>Rename</);
  hf.pendingRenameName = 'Release checklist';
  assert.match(hf.renderEditor('rename') + hf.editorController.reset('rename') && hf.renderEditor('rename'), /value="Release checklist"/, 'a sidebar rename opens with the clicked workflow name');
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'rename-collision' };
  const html = hf.renderEditor('rename-collision');
  assert.match(html, /role="dialog" aria-modal="true" aria-labelledby="editor-modal-title"/);
  assert.match(html, /<h2 id="editor-modal-title">Rename workflow<\/h2>/);
  assert.match(html, /value="Development workflow"[^>]*aria-invalid="true"/);
  assert.match(html, /role="alert"><span class="editor-rename-glyph" aria-hidden="true">⚠<\/span><span>A workflow named “Development workflow” already exists\./);
  assert.match(html, /data-editor-action="submit-modal" disabled>Rename</);
  assert.match(html, /This editor has unsaved changes\. Renaming keeps them in the editor and does not save them\./);
  assert.match(html, /data-editor-action="rename">Rename…</, 'Rename… is in the editor menu for this state');
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'saved' };
  assert.doesNotMatch(hf.renderEditor('saved'), /Rename…|editor-rename/);
});

test('standalone reorder moves one node to an insertion gap and changes nothing else', () => {
  const hf = loadDesignRuntime();
  const list = ['a', 'b', 'c', 'd'].map(id => ({ id }));
  const move = (id, gap) => Array.from(hf.moveStandalone(list, id, gap), item => item.id).join('');
  assert.equal(move('c', 0), 'cabd');
  assert.equal(move('a', 4), 'bcda');
  assert.equal(move('a', 1), 'abcd', 'dropping into its own gap keeps the order');
  assert.equal(move('b', 2), 'abcd');
  assert.equal(move('d', 99), 'abcd', 'out-of-range gaps clamp');
  assert.equal(move('x', 1), 'abcd', 'unknown identity is ignored');
  assert.deepEqual(list.map(item => item.id), ['a', 'b', 'c', 'd'], 'input is not mutated');
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'standalone-reorder' };
  const html = hf.renderEditor('standalone-reorder');
  assert.match(html, /class="editor-insertion-line"/);
  assert.match(html, /class="editor-standalone-slot"/);
  assert.match(html, /class="editor-reorder-preview"/);
  assert.match(html, /data-standalone-id="rollback-guide"/);
  assert.match(html, /Drag to reorder\. With the card focused, press Alt and the left or right arrow key to move it\./);
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'on-demand' };
  const onDemand = hf.renderEditor('on-demand');
  assert.ok(onDemand.indexOf('editor-orchestrator-icon') < onDemand.indexOf('Investigation') && onDemand.indexOf('Investigation') < onDemand.indexOf('editor-add-standalone'), 'cards precede the add control, as in WorkflowStandaloneBar');
  assert.doesNotMatch(onDemand, /data-standalone-id|editor-insertion-line/);
});

test('council node keeps invalid configuration visible and blocks Run without dropping edits', () => {
  const hf = loadDesignRuntime();
  const base = { question: 'Q', memberCount: 3, facilitator: '1', maxRounds: 5 };
  const errors = fields => Array.from(hf.councilValidation({ ...base, ...fields }));
  assert.deepEqual(errors({}), []);
  assert.match(errors({ memberCount: 1 })[0], /at least 2 members\. It has 1\./);
  assert.ok(errors({ facilitator: '' }).some(message => /facilitator/.test(message)));
  assert.ok(errors({ facilitator: '4' }).some(message => /facilitator/.test(message)));
  assert.ok(errors({ question: '  ' }).some(message => /question and context/.test(message)));
  assert.ok(errors({ maxRounds: 0 }).some(message => /Max rounds/.test(message)));
  assert.deepEqual(errors({ maxRounds: '' }), [], 'an empty limit means the engine default');
  assert.equal(hf.councilNodeSummary({ memberCount: 3, maxRounds: 5 }), '3 members · max 5 rounds');
  assert.equal(hf.councilNodeSummary({ memberCount: 1, maxRounds: '' }), '1 member · engine default rounds');
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'council-config' };
  hf.editorController.reset('council-config');
  const html = hf.renderEditor('council-config');
  assert.match(html, /Members \(3\)/);
  assert.match(html, /3 members · max 5 rounds/);
  assert.match(html, /The facilitator drafts candidates\. Every member must explicitly accept the exact candidate version before the council reaches consensus\./);
  assert.match(html, /aria-label="Member 1 harness"/);
  assert.match(html, /data-editor-action="add:council"/);
  assert.match(html, /Valid workflow · 2 nodes/);
  assert.equal(hf.editorController.snapshot().selected.kind, 'council');
  assert.equal(hf.editorController.snapshot().canRun, true, 'a clean, valid council draft can run');
  const snapshot = hf.editorController.setField('memberCount', 1);
  assert.equal(snapshot.dirty, true);
  assert.equal(snapshot.canRun, false);
  assert.equal(snapshot.draft.fieldValues['council:council'].memberCount, 1, 'the invalid edit is preserved');
  const invalid = hf.renderEditor('council-config');
  assert.match(invalid, /editor-council-errors" role="alert"/);
  assert.match(invalid, /Workflow is not valid: Council: A council needs at least 2 members\. It has 1\./);
  hf.editorController.reset('saved');
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'saved' };
  assert.doesNotMatch(hf.renderEditor('saved'), /editor-council|add:council/);
});

test('readiness report separates the three finding states, shows scope, and marks stale results', () => {
  const hf = loadDesignRuntime();
  const fresh = hf.renderReadinessReport(hf.readinessModel());
  for (const text of ['Ready for the checks performed', 'Blocked', 'Needs verification', 'Working directory: <code>/Example/billing-api</code>', 'saved revision 3 · checked 14:52', 'Verified:', 'Inferred:', 'Consequence:', 'Recommended:', 'Resolve issue', 'Blocked: 1 node cannot run']) assert.ok(fresh.includes(text), `report shows ${text}`);
  assert.equal((fresh.match(/Resolve issue/g) || []).length, 2, 'only findings that need action offer Resolve issue');
  assert.doesNotMatch(fresh, /editor-readiness-stale/);
  const stale = hf.renderReadinessReport(hf.readinessModel({ stale: true }));
  assert.match(stale, /editor-readiness-stale" role="status"/);
  assert.match(stale, /out of date/);
  assert.doesNotMatch(fresh + stale, /\/Users\/|secret|token|password/i);
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'readiness' };
  const html = hf.renderEditor('readiness');
  assert.match(html, /data-editor-action="inspect-readiness" aria-expanded="true">Inspect readiness</);
  assert.match(html, /aria-label="Readiness report"/);
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'saved' };
  assert.doesNotMatch(hf.renderEditor('saved'), /Inspect readiness|editor-readiness/);
});

test('workflow editor proposal markup does not leak into other editor states', () => {
  const hf = loadDesignRuntime();
  const marker = /editor-rename|editor-readiness|editor-council|editor-reorder-preview|editor-insertion-line|editor-standalone-slot|data-standalone-id|add:council|inspect-readiness|data-editor-action="rename"/;
  const family = hf.screens.find(screen => screen.id === 'workflow-editor');
  for (const state of family.states) {
    hf.route = { theme: 'light', screen: 'workflow-editor', state };
    hf.editorController.reset(state);
    const html = renderers['workflow-editor'](hf, state);
    assert.equal(marker.test(html), Object.keys(family.proposals).includes(state), `${state} proposal markup`);
  }
});

test('Run Workflow chooser lists starred workflows first and keeps native sheet copy', () => {
  const hf = loadDesignRuntime();
  hf.resetLaunchProposals();
  hf.route = { theme: 'light', screen: 'workflow-launch', state: 'library-starred' };
  const html = hf.renderLaunch('library-starred');
  assert.deepEqual(Array.from(html.matchAll(/data-launch-choice>([^<]+)</g), m => m[1]), ['Session reliability', 'Release checklist', 'Development workflow']);
  for (const text of ['Run Workflow', 'Choose a saved workflow, then review its permissions and task before running.', 'Choose a workflow', '>Cancel<', 'Continue']) assert.ok(html.includes(text), text);
  assert.match(html, /aria-label="Star Session reliability" aria-pressed="true"/);
  assert.match(html, /aria-label="Star Development workflow" aria-pressed="false"/);
  assert.doesNotMatch(html, /aria-haspopup/, 'the chooser is a disclosure, not a menu');
  assert.match(html, /aria-expanded="true" aria-controls="launch-list"/);
  assert.match(html, /data-action="lp-continue" disabled/);
  assert.match(html, /class="launch-divider" role="separator"/);
  assert.equal(hf.specimenStatus('workflow-launch', 'library-starred').kind, 'exploratory');
  assert.doesNotMatch(hf.renderLaunch('library'), /launch-star|launch-list/);
});

test('Council run activity is one feed that names agents, rounds, questions, versions, and the outcome', () => {
  const hf = loadDesignRuntime();
  const html = hf.councilActivity();
  assert.equal((html.match(/class="wfr-council-feed"/g) || []).length, 1);
  assert.equal((html.match(/class="council-speaker"/g) || []).length, (html.match(/<article class="council-turn">/g) || []).length);
  for (const text of ['Facilitator', 'Member', 'Round 1 of 5 · 14:36', 'Round 2 of 5 · 14:41', 'Iris → Noor · about Candidate v1', 'Answered', 'Supersedes v1', 'Prior acceptances reset', 'Objects to v1', 'Dana accepts v2', 'Consensus reached on Candidate v2', 'Conclusion:', 'Rationale:', 'Caveats:']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /accepts v1/, 'superseded acceptances are not shown as current');
  assert.doesNotMatch(html, /<strong>(Claude|Codex|Vibe)<\/strong>/, 'the harness is never the speaker');
  hf.route = { theme: 'light', screen: 'workflow-run', state: 'council' };
  hf.resetWorkflowRun(hf.route);
  const run = hf.renderRun('council');
  assert.match(run, /3 members · round 2 of 5/);
  assert.match(run, /data-action="wr-select:council"/);
  assert.match(run, /<button type="button" disabled>Parallel<\/button>/);
  assert.doesNotMatch(run, /wfr-sidebar-default/, 'selected Council opens the 420-point feed');
  hf.route = { theme: 'light', screen: 'workflow-run', state: 'running' };
  hf.resetWorkflowRun(hf.route);
  assert.doesNotMatch(hf.renderRun('running'), /wfr-council|wr-select:council/);
});

const statTime = text => { let m = 0; const h = /(\d+) h/.exec(text), n = /(\d+) min/.exec(text); if (h) m += 60 * Number(h[1]); if (n) m += Number(n[1]); return m; };
const statTokens = text => { const m = /([\d.]+) (M|k)? ?tokens/.exec(text); return m ? Number(m[1]) * (m[2] === 'M' ? 1000 : m[2] === 'k' ? 1 : 0.001) : 0; };
const statRoute = (hf, state) => { hf.resetStatistics(); hf.route = { theme: 'light', screen: 'statistics', state }; };
const statText = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

test('statistics is an exploratory whole-proposal family with no native source', () => {
  const hf = loadDesignRuntime();
  const family = hf.screens.find(screen => screen.id === 'statistics');
  assert.deepEqual(Array.from(family.states), ['overview', 'nodes']);
  assert.equal(family.source, undefined);
  assert.deepEqual(Array.from(family.proposal.tickets), ['#9']);
  for (const state of family.states) {
    assert.equal(hf.specimenStatus('statistics', state).kind, 'exploratory');
    assert.match(hf.specimenStatus('statistics', state).caption, /^Exploratory · ticket #9 · Not approved/);
  }
  assert.match(fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8'), /No native source/);
});

test('statistics shows no cost anywhere at any range or measure', () => {
  const hf = loadDesignRuntime();
  for (const screen of ['overview', 'nodes']) for (const range of [7, 30, 90]) for (const measure of ['time', 'usage']) for (const list of ['workflows', 'tasks']) {
    const open = { 'w:0': true, 't:0': true, 'w:5': true };
    const html = hf.statisticsBody(screen, { range, measure, list, open });
    assert.doesNotMatch(html, /Cost|cost|\$/, `${screen}/${range}/${measure}/${list}`);
  }
  for (const state of ['overview', 'nodes']) {
    statRoute(hf, state);
    assert.doesNotMatch(hf.renderStatistics(state), /Cost|\$/);
  }
});

test('statistics measure toggle switches chart label, caption, list title and column heads', () => {
  const hf = loadDesignRuntime();
  const time = hf.statisticsModel({ measure: 'time' }), usage = hf.statisticsModel({ measure: 'usage' });
  assert.equal(time.chart.label, 'Total time');
  assert.equal(usage.chart.label, 'Usage');
  assert.notEqual(time.chart.caption, usage.chart.caption);
  assert.equal(time.list.title, 'Workflows by total time');
  assert.equal(usage.list.title, 'Workflows by usage');
  assert.equal(hf.statisticsModel({ measure: 'usage', list: 'tasks' }).list.title, 'Tasks by usage');
  assert.deepEqual([time.list.valueHead, time.list.otherHead], ['Total time', 'Usage']);
  assert.deepEqual([usage.list.valueHead, usage.list.otherHead], ['Usage', 'Total time']);
  const html = hf.statisticsBody('overview', { measure: 'usage' });
  assert.match(html, /<span class="stat-caption">Usage<\/span>/);
  assert.match(html, /<h3>Workflows by usage<\/h3><span class="stat-colhead">Usage<\/span><span class="stat-colhead">Total time<\/span>/);
  assert.match(hf.statisticsBody('overview', { measure: 'time' }), /<h3>Workflows by total time<\/h3><span class="stat-colhead">Total time<\/span><span class="stat-colhead">Usage<\/span>/);
  assert.match(hf.statisticsBody('nodes', { measure: 'usage' }), /Nodes by usage/);
  assert.match(hf.statisticsBody('nodes', { measure: 'time' }), /Nodes by execution time/);
});

test('statistics coverage banner appears only in Usage and its figures are consistent', () => {
  const hf = loadDesignRuntime();
  for (const range of [7, 30, 90]) {
    assert.doesNotMatch(hf.statisticsBody('overview', { range, measure: 'time' }), /Usage covers|did not report tokens/);
    assert.doesNotMatch(hf.statisticsBody('nodes', { range, measure: 'usage' }), /Usage covers/);
    const html = hf.statisticsBody('overview', { range, measure: 'usage' });
    const m = hf.statisticsModel({ range, measure: 'usage' }), cov = m.coverage;
    assert.ok(html.includes(`Usage covers ${cov.wfRuns} of ${cov.wfRunsTotal} workflow runs and ${cov.tasks} of ${cov.tasksTotal} tasks.`));
    assert.match(html, /left out, not counted as 0/);
    assert.ok(cov.wfRuns <= cov.wfRunsTotal && cov.tasks <= cov.tasksTotal, `${range} X<=Y, A<=B`);
    const displayed = m.list.rows.reduce((sum, row) => sum + Number(/^(\d+) runs/.exec(row.meta)[1]), 0);
    assert.equal(cov.wfRunsTotal, displayed, `${range} Y equals the sum of per-workflow runs`);
  }
});

test('statistics chart has one bar and one hidden table row per day, and stacked totals match the legend', () => {
  const hf = loadDesignRuntime();
  for (const measure of ['time', 'usage']) for (const range of [7, 30, 90]) {
    const html = hf.statisticsBody('overview', { range, measure });
    const m = hf.statisticsModel({ range, measure });
    assert.equal(m.chart.bars.length, range);
    assert.equal((html.match(/class="stat-bar"/g) || []).length, range);
    const tbody = html.match(/<tbody>(.*?)<\/tbody>/)[1];
    assert.equal((tbody.match(/<tr>/g) || []).length, range, `${measure}/${range} table rows`);
    assert.match(html, /<table class="visually-hidden">/);
    const parse = measure === 'usage' ? statTokens : statTime;
    const sum = key => m.chart.bars.reduce((a, b) => a + parse(b[key]), 0);
    const tol = (range + 1) * (measure === 'usage' ? 0.5 : 0.5) + (measure === 'usage' ? 50 : 0.5);
    assert.ok(Math.abs(sum('wf') - parse(m.chart.wfTotal)) <= tol, `${measure}/${range} workflow stack`);
    assert.ok(Math.abs(sum('tk') - parse(m.chart.tkTotal)) <= tol, `${measure}/${range} task stack`);
    assert.ok(Math.abs(parse(m.chart.wfTotal) + parse(m.chart.tkTotal) - parse(m.chart.total)) <= (measure === 'usage' ? 100 : 1.5), `${measure}/${range} headline`);
    assert.match(html, new RegExp(`Workflow runs <b>${m.chart.wfTotal}</b>`));
    assert.match(html, new RegExp(`Tasks <b>${m.chart.tkTotal}</b>`));
  }
});

test('statistics workflow rows expand to at most eight runs with an honest footer', () => {
  const hf = loadDesignRuntime();
  const rowFor = (m, name) => m.list.rows.find(row => row.name === name);
  for (const range of [7, 30, 90]) {
    const m = hf.statisticsModel({ range, open: { 'w:0': true } });
    const row = rowFor(m, 'Implement and review');
    assert.ok(row.open);
    assert.ok(row.children.length <= 8);
    const total = Number(/^(\d+) runs/.exec(row.meta)[1]);
    assert.equal(row.subFooter, `Showing ${Math.min(8, total)} of ${total} runs`);
    const html = hf.statisticsBody('overview', { range, open: { 'w:0': true } });
    assert.ok(html.includes(row.subFooter));
    assert.ok(html.includes(`Show all ${total} runs`));
    assert.match(html, /View node breakdown/);
  }
  const sweepId = rowFor(hf.statisticsModel({ range: 7 }), 'Test coverage sweep').id;
  const small = hf.statisticsModel({ range: 7, open: { [sweepId]: true } });
  const sweep = rowFor(small, 'Test coverage sweep');
  assert.equal(sweep.subFooter, 'Showing 2 of 2 runs');
  assert.equal(sweep.children.length, 2);
  const html = hf.statisticsBody('overview', { range: 7, open: { [sweepId]: true } });
  assert.ok(html.includes('Showing 2 of 2 runs'));
  assert.doesNotMatch(html, /Show all \d+ runs/);
  const closed = hf.statisticsBody('overview', {});
  assert.doesNotMatch(closed, /Showing \d+ of|stat-substack/);
});

test('statistics task rows expand to their turns', () => {
  const hf = loadDesignRuntime();
  const m = hf.statisticsModel({ list: 'tasks', open: { 't:0': true, 't:5': true } });
  const first = m.list.rows.find(row => row.id === 't:0'), single = m.list.rows.find(row => row.id === 't:5');
  assert.equal(first.children.length, 4);
  assert.equal(single.children.length, 1);
  assert.match(first.meta, /4 turns/);
  assert.match(single.meta, /1 turn$/);
  assert.match(first.subFooter, /^4 turns · /);
  assert.equal(first.hasMore, false);
  const html = hf.statisticsBody('overview', { list: 'tasks', open: { 't:0': true } });
  assert.match(html, /Turn 1 · Initial prompt/);
  assert.match(html, /Turn 4 · Follow-up message/);
  assert.doesNotMatch(html, /Turn 5/);
  assert.doesNotMatch(html, /View node breakdown/);
});

test('statistics node page shares add to 100 and a retried node executes fewer times than the run count', () => {
  const hf = loadDesignRuntime();
  for (const measure of ['time', 'usage']) for (const range of [7, 30, 90]) {
    const p = hf.statisticsModel({ range, measure, screen: 'nodes' }).nodePage;
    const sum = p.nodes.reduce((a, n) => a + n.shareValue, 0);
    assert.ok(Math.abs(sum - 100) < 1e-6, `${measure}/${range} exact shares`);
    const shown = p.nodes.reduce((a, n) => a + Number(n.share.replace('%', '')), 0);
    assert.ok(Math.abs(shown - 100) <= p.nodes.length * 0.5, `${measure}/${range} rounded shares`);
    const fix = p.nodes.find(n => n.name === 'Fix review findings');
    assert.ok(fix.execs < p.runs, `${measure}/${range} fix executions < runs`);
    assert.ok(p.nodes.every(n => n.execs >= 1));
    assert.deepEqual(p.nodes.map(n => n.rank), p.nodes.map((_, i) => i + 1));
  }
  const html = hf.statisticsBody('nodes', { range: 7 });
  assert.match(html, /Back to Statistics/);
  assert.match(html, /Summed execution time/);
  assert.match(html, /Parallel nodes run at the same time/);
  const other = hf.statisticsModel({ screen: 'nodes', workflow: 'Council review' }).nodePage;
  assert.equal(other.name, 'Council review');
  assert.equal(hf.statisticsModel({ screen: 'nodes', workflow: 'Missing' }).nodePage.index, 0);
});

test('statistics sidebar entry follows the range and is the only active entry', () => {
  const hf = loadDesignRuntime();
  for (const state of ['overview', 'nodes']) {
    statRoute(hf, state);
    const html = hf.renderStatistics(state);
    assert.match(html, /data-action="route:statistics\/overview" aria-current="page"/);
    assert.doesNotMatch(html, /task-row active/);
    assert.match(html, /<strong>Statistics<\/strong><small>Last 30 days<\/small>/);
  }
});

test('statistics controls expose pressed, expanded and controlled-region semantics', () => {
  const hf = loadDesignRuntime();
  for (const screen of ['overview', 'nodes']) for (const range of [7, 30, 90]) for (const measure of ['time', 'usage']) {
    const html = hf.statisticsBody(screen, { range, measure });
    const groups = html.match(/<div class="stat-seg[^"]*" role="group" aria-label="[^"]+">.*?<\/div>/g);
    assert.equal(groups.length, screen === 'overview' ? 3 : 2);
    for (const group of groups) {
      const pressed = group.match(/aria-pressed="(true|false)"/g);
      assert.ok(pressed.length >= 2);
      assert.equal(pressed.filter(p => p.includes('true')).length, 1, 'exactly one pressed per group');
    }
    assert.ok(html.includes(`data-action="stat-range:${range}" aria-pressed="true"`));
    assert.ok(html.includes(`data-action="stat-measure:${measure}" aria-pressed="true"`));
  }
  for (const list of ['workflows', 'tasks']) {
    const open = list === 'workflows' ? { 'w:0': true, 'w:1': true, 'w:5': true } : { 't:0': true, 't:2': true };
    const html = hf.statisticsBody('overview', { list, open });
    assert.ok(html.includes(`data-action="stat-list:${list}" aria-pressed="true"`));
    const rows = html.match(/<button type="button" class="stat-row" [^>]*>/g);
    assert.equal(rows.length, hf.statisticsModel({ list }).list.rows.length);
    assert.equal(rows.filter(r => r.includes('aria-expanded="true"')).length, Object.keys(open).length);
    assert.equal(rows.filter(r => r.includes('aria-expanded="false"')).length, rows.length - Object.keys(open).length);
    const controls = rows.map(r => /aria-controls="([^"]+)"/.exec(r)?.[1]).filter(Boolean);
    assert.equal(controls.length, Object.keys(open).length);
    assert.equal(new Set(controls).size, controls.length, 'aria-controls ids unique');
    for (const id of controls) assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1, `${id} resolves once`);
    assert.equal(controls.length, new Set(html.match(/ id="[^"]+"/g)).size, 'no stray duplicate ids');
  }
});

function statisticsInteractive() {
  const announcement = { textContent: '', classList: { add() {}, remove() {} } };
  const content = { innerHTML: '', scrollTop: 5, querySelector: () => null };
  const entry = { textContent: 'Last 30 days' };
  const picker = { value: 'overview' };
  const caption = { textContent: '' };
  const replaced = [];
  const elements = { '#announcement': announcement, '#statistics-content': content, '.stat-entry small': entry, '#state-picker': picker, '#specimen-caption': caption };
  const hf = loadDesignRuntime({ captureEvents: true, querySelectorOverride: selector => elements[selector], history: { state: null, replaceState: (_s, _t, hash) => replaced.push(hash) } });
  hf.route = { theme: 'light', screen: 'statistics', state: 'overview' };
  hf.resetStatistics();
  const click = action => {
    const target = { dataset: { action }, disabled: false };
    hf.__dispatchDesignEvent({ type: 'click', target: { closest: selector => (selector.includes('data-action^="stat-"') ? target : null) }, preventDefault() {}, stopImmediatePropagation() {} });
  };
  return { hf, content, entry, picker, caption, replaced, click, mode: () => hf.appearance?.themeMode || 'system' };
}

test('statistics interactions keep range, measure and open rows across lists and the node round trip', () => {
  const { hf, content, entry, picker, caption, replaced, click, mode } = statisticsInteractive();
  click('stat-range:7');
  assert.equal(entry.textContent, 'Last 7 days');
  assert.match(content.innerHTML, /Last 7 days · All repositories/);
  click('stat-measure:usage');
  click('stat-toggle:w:0');
  assert.match(content.innerHTML, /aria-expanded="true"/);
  click('stat-list:tasks');
  assert.match(content.innerHTML, /Tasks by usage/);
  assert.doesNotMatch(content.innerHTML, /aria-expanded="true"/, 'workflow row is not in the task list');
  click('stat-toggle:t:1');
  click('stat-list:workflows');
  assert.match(content.innerHTML, /Workflows by usage/);
  assert.match(content.innerHTML, /data-action="stat-toggle:w:0" aria-expanded="true"/, 'workflow row still open');
  click('stat-list:tasks');
  assert.match(content.innerHTML, /data-action="stat-toggle:t:1" aria-expanded="true"/, 'task row still open');
  click('stat-list:workflows');

  click('stat-nodes:0');
  assert.deepEqual(Array.from(replaced), [`#statistics/nodes/${mode()}`]);
  assert.equal(picker.value, 'nodes');
  assert.equal(hf.route.state, 'nodes');
  assert.equal(caption.textContent, hf.specimenStatus('statistics', 'nodes').caption);
  assert.match(content.innerHTML, /Back to Statistics/);
  assert.match(content.innerHTML, /Nodes by usage/);
  assert.match(content.innerHTML, /Node breakdown · 22 runs · Last 7 days/);
  assert.equal(content.scrollTop, 0);
  assert.equal(entry.textContent, 'Last 7 days');

  click('stat-back');
  assert.deepEqual(Array.from(replaced), [`#statistics/nodes/${mode()}`, `#statistics/overview/${mode()}`]);
  assert.equal(picker.value, 'overview');
  assert.equal(hf.route.state, 'overview');
  assert.match(content.innerHTML, /Workflows by usage/);
  assert.match(content.innerHTML, /Last 7 days · All repositories/);
  assert.match(content.innerHTML, /data-action="stat-toggle:w:0" aria-expanded="true"/, 'open row survives the round trip');
  click('stat-list:tasks');
  assert.match(content.innerHTML, /data-action="stat-toggle:t:1" aria-expanded="true"/, 'task row survives the round trip');
  click('stat-toggle:t:1');
  assert.doesNotMatch(content.innerHTML, /aria-expanded="true"/, 'toggling closes the row');

  hf.resetStatistics();
  const html = hf.renderStatistics('overview');
  assert.ok(html.includes('data-action="stat-range:30" aria-pressed="true"'));
  assert.ok(html.includes('data-action="stat-measure:time" aria-pressed="true"'));
  assert.ok(html.includes('data-action="stat-list:workflows" aria-pressed="true"'));
  assert.doesNotMatch(html, /aria-expanded="true"/, 'reset closes the rows left open');
  assert.match(html, /<small>Last 30 days<\/small>/);
});

test('statistics clicks are ignored outside the statistics route and reset can start on the node page', () => {
  const { hf, content, click } = statisticsInteractive();
  hf.route = { theme: 'light', screen: 'tasks', state: 'populated' };
  click('stat-range:7');
  assert.equal(content.innerHTML, '');
  hf.route = { theme: 'light', screen: 'statistics', state: 'nodes' };
  hf.resetStatistics();
  assert.match(hf.renderStatistics('nodes'), /Back to Statistics/);
  assert.match(hf.renderStatistics('nodes'), /<small>Last 30 days<\/small>/);
});

test('statistics task turns sum to the row value and fall inside the range window', () => {
  const hf = loadDesignRuntime();
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const end = Date.UTC(2026, 9, 25), day = 86400000;
  const open = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map(i => [`t:${i}`, true]));
  for (const range of [7, 30, 90]) for (const measure of ['time', 'usage']) {
    const rows = hf.statisticsModel({ range, measure, list: 'tasks', open }).list.rows;
    assert.equal(rows.length, 7);
    const parse = measure === 'usage' ? statTokens : statTime;
    for (const row of rows) {
      assert.ok(row.children.length >= 1);
      const sum = row.children.reduce((a, c) => a + parse(c.value), 0);
      const tol = row.children.length * 0.5 + (measure === 'usage' ? 50 : 0.5);
      assert.ok(Math.abs(sum - parse(row.value)) <= tol, `${row.name} ${range}/${measure}: ${sum} vs ${row.value}`);
      for (const child of row.children) {
        const [, mon, d] = /^([A-Z][a-z]{2}) (\d+), \d\d:\d\d$/.exec(child.when);
        const ts = Date.UTC(2026, MON.indexOf(mon), Number(d));
        assert.ok(ts <= end && ts > end - range * day, `${row.name} ${range}: ${child.when} within window`);
      }
    }
  }
  const turns = range => hf.statisticsModel({ range, list: 'tasks', open: { 't:0': true } }).list.rows.find(r => r.id === 't:0').children.map(c => c.value).join();
  assert.equal(new Set([7, 30, 90].map(turns)).size, 3, 'turn values scale with the range');
});

test('statistics shows harness names from HF.harnessName', () => {
  const hf = loadDesignRuntime();
  assert.equal(hf.harnessName('opencode'), 'OpenCode');
  const tasks = hf.statisticsBody('overview', { list: 'tasks' });
  assert.match(tasks, /OpenCode · mobile/);
  assert.doesNotMatch(tasks, /Opencode/);
  for (const name of ['Claude', 'Codex', 'Vibe', 'Antigravity']) assert.ok(tasks.includes(name + ' · '), name);
  const nodes = hf.statisticsBody('nodes', {});
  assert.match(nodes, /Test · OpenCode · qwen3-coder/);
  assert.doesNotMatch(nodes, /Opencode/);
  assert.doesNotMatch(hf.renderStatistics('nodes'), /Opencode/);
});

test('statistics rendering is deterministic across loads and unknown ranges fall back to 30 days', () => {
  const render = hf => ['overview', 'nodes'].flatMap(state => [7, 30, 90].flatMap(range => ['time', 'usage'].map(measure => hf.statisticsBody(state, { range, measure, open: { 'w:0': true, 'w:5': true } }))));
  const first = render(loadDesignRuntime()), second = render(loadDesignRuntime());
  assert.deepEqual(first, second);
  const hf = loadDesignRuntime();
  assert.equal(hf.statisticsModel({ range: 14 }).range, 30);
  assert.equal(hf.statisticsModel({ measure: 'bogus' }).measure, 'time');
});

test('statistics output is independent of the process time zone', () => {
  const script = [
    "const fs=require('fs'),path=require('path'),vm=require('vm');",
    'const root=process.argv[1],files=JSON.parse(process.argv[2]);',
    "const context=vm.createContext({window:{},document:{querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},setTimeout,clearTimeout});context.window=context;",
    "for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,'scripts',f),'utf8'),context,{filename:f});",
    "const hf=context.HF;hf.route={theme:'light',screen:'statistics',state:'overview'};",
    'const out=[];',
    "for(const s of ['overview','nodes'])for(const r of [7,30,90])for(const m of ['time','usage'])out.push(hf.statisticsBody(s,{range:r,measure:m,open:{'w:0':true,'t:0':true}}));",
    "for(const s of ['overview','nodes']){hf.resetStatistics();out.push(hf.renderStatistics(s));}",
    'process.stdout.write(JSON.stringify(out));'
  ].join('\n');
  const outputs = ['UTC', 'Australia/Sydney', 'America/Los_Angeles'].map(TZ => {
    const result = spawnSync(process.execPath, ['-e', script, root, JSON.stringify(scripts)], { env: { ...process.env, TZ }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  });
  assert.ok(outputs[0].length > 10000);
  assert.equal(outputs[1], outputs[0], 'Australia/Sydney matches UTC');
  assert.equal(outputs[2], outputs[0], 'America/Los_Angeles matches UTC');
});

test('statistics markup does not leak into other families', () => {
  const hf = loadDesignRuntime();
  for (const other of hf.screens) {
    if (other.id === 'statistics') continue;
    hf.route = { theme: 'light', screen: other.id, state: other.states[0] };
    assert.doesNotMatch(renderers[other.id](hf, other.states[0]), /stat-entry|stat-seg|statistics-content/, `${other.id} renders statistics markup`);
  }
});
test('council limits are validated, preserved, and block Run', () => {
  const hf = loadDesignRuntime();
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'council-config' };
  hf.editorController.reset('council-config');
  const bad = { maxRounds: 0, questionLimit: -1, followUpLimit: 21, timeBudgetMinutes: 0, tokenBudget: 10000001 };
  for (const [key, value] of Object.entries(bad)) {
    hf.editorController.reset('council-config');
    const snapshot = hf.editorController.setField(key, value);
    assert.equal(snapshot.canRun, false, `${key}=${value} blocks Run`);
    assert.equal(snapshot.draft.fieldValues['council:council'][key], value, `${key} edit preserved`);
    assert.match(hf.renderEditor('council-config'), /editor-council-errors" role="alert"/);
  }
  hf.editorController.reset('council-config');
  assert.ok(Array.from(hf.councilValidation({ question: 'Q', memberCount: 3, facilitator: '1', tokenBudget: 1.5 })).some(message => /Token budget must be a whole number from 1 to 10000000\./.test(message)));
  for (const key of ['questionLimit', 'followUpLimit', 'timeBudgetMinutes', 'tokenBudget', 'maxRounds']) assert.deepEqual(Array.from(hf.councilValidation({ question: 'Q', memberCount: 3, facilitator: '1', [key]: '' })), []);
  const html = hf.renderEditor('council-config');
  assert.match(html, /<h3>Structured output<\/h3>/);
  assert.match(html, /data-editor-field="structuredOutput"/);
  assert.match(html, /<h3>Routing<\/h3>/);
  assert.match(html, /<option value="outcome"[^>]*>Route by outcome/);
  assert.doesNotMatch(html, /Structured output and routing are configured like other nodes/);
  hf.editorController.setField('structuredOutput', true);
  assert.equal(hf.editorController.snapshot().canRun, false, 'structured output without fields is flagged');
  assert.match(hf.renderEditor('council-config'), /Describe the structured output fields/);
  hf.editorController.setField('outputSchema', 'conclusion, rationale');
  assert.deepEqual(Array.from(hf.councilValidation(hf.editorController.snapshot().draft.fieldValues['council:council'])), []);
  hf.editorController.reset('saved');
});

test('council run and statistics markup appear only in their own states', () => {
  const hf = loadDesignRuntime();
  const council = /wfr-council|council-turn|wr-select:council/;
  const statistics = /stat-entry|stat-seg|statistics-content|stat-tile|stat-page/;
  for (const family of hf.screens) {
    for (const state of family.states) {
      hf.route = { theme: 'light', screen: family.id, state };
      if (family.id === 'workflow-run') hf.resetWorkflowRun(hf.route);
      if (family.id === 'workflow-editor') hf.editorController.reset(state);
      const html = renderers[family.id](hf, state);
      assert.equal(council.test(html), family.id === 'workflow-run' && state.startsWith('council'), `${family.id}/${state} council markup`);
      assert.equal(statistics.test(html), family.id === 'statistics', `${family.id}/${state} statistics markup`);
    }
  }
});
