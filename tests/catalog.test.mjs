import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scripts = ['tokens.js', 'registry.js', 'appearance.js', 'components.js', 'tasks.js', 'task-activity.js', 'parallel.js', 'task-approvals.js', 'task-summary.js', 'workflows.js', 'workflow-connectors.js', 'workflow-editor-proposals.js', 'workflow-editor-inspector.js', 'workflow-editor.js', 'council-activity.js', 'workflow-run.js', 'dialogs.js', 'workflow-launch-proposals.js', 'state-recovery.js', 'sidebar-setup.js', 'sidebar-proposals.js', 'statistics.js', 'web.js', 'foundations.js'];

function loadDesignRuntime({ captureEvents = false, querySelectorOverride, querySelectorAllOverride, history, timers } = {}) {
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
    setTimeout: timers?.setTimeout ?? setTimeout,
    clearTimeout: timers?.clearTimeout ?? clearTimeout,
    CSS: { escape: value => String(value) },
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
  web: (hf, state) => hf.renderWeb(state),
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
  assert.match(callerOwned, /data-action="approval-decision:approve:[^"]+"/);
  assert.equal(hf.approvalController.state.requests[0].ownership, 'caller');
  assert.equal(hf.approvalController.state.futureMacResponseCapability, true);
  assert.equal(hf.approvalController.state.taskID, 'abc12345');
  const callerOwnedLegacy = hf.renderTasks('approvals', 'caller-owned-legacy');
  assert.match(callerOwnedLegacy, /engine does not support Mac responses/);
  assert.doesNotMatch(callerOwnedLegacy, /data-action="approval-decision:/);
  assert.equal(hf.approvalController.state.requests[0].ownership, 'caller');
  assert.equal(hf.approvalController.state.futureMacResponseCapability, false);
  const inspected = hf.renderTasks('approvals', 'inspected');
  assert.match(inspected, /data-action="approval-decision:approve:[^"]+"/);
  assert.match(inspected, /data-action="approval-decision:reject:[^"]+"/);
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
    if (state === 'error' || state === 'expired') assert.doesNotMatch(html, /data-action="approval-decision:/);
    else if (state === 'caller-owned') assert.match(html, /data-action="approval-decision:approve:[^"]+"(?![^>]*disabled)/);
    else assert.match(html, /data-action="approval-decision:approve:[^"]+"[^>]*disabled/);
  }
  hf.approvalController.reset('submitting');
  const submitting = hf.approvalPanel();
  assert.match(submitting, /data-action="approval-refresh"[^>]*disabled/);
  assert.match(submitting, /data-action="approval-decision:approve:[^"]+"[^>]*disabled/);
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
  const order = [...html.matchAll(/data-request-id="([^"]+)"/g)].map(([, id]) => id);
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
  const rows = [...html.matchAll(/data-request-id="([^"]+)"[\s\S]*?<div class="approval-metadata">([^<]+)/g)];
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
    if (['setup-running', 'setup-failed', 'teardown-pending'].includes(state)) { assert.equal(status.kind, 'exploratory'); assert.deepEqual(Array.from(status.tickets), ['#21', 'HarflowMCP#41']); if (canShowCompact) display.pop(); continue; }
    if (state.startsWith('run-approval-')) { assert.equal(status.kind, 'exploratory'); assert.deepEqual(Array.from(status.tickets), ['#13', '#14']); if (canShowCompact) display.pop(); continue; }
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
  const marker = /editor-rename|editor-readiness|editor-council|editor-reorder-preview|editor-insertion-line|editor-standalone-slot|data-standalone-id|add:council|inspect-readiness|data-editor-action="rename"|data-setup-inspector|editor-setup-dot/;
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
  for (const screen of ['overview', 'nodes']) for (const range of [7, 30, 90]) for (const measure of ['time', 'usage']) for (const list of ['workflows', 'tasks', 'harnesses']) {
    const open = { 'w:0': true, 't:0': true, 'w:5': true, 'h:0': true, 'h:2': true };
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
  for (const list of ['workflows', 'tasks', 'harnesses']) {
    const open = list === 'workflows' ? { 'w:0': true, 'w:1': true, 'w:5': true } : list === 'tasks' ? { 't:0': true, 't:2': true } : { 'h:0': true, 'h:2': true };
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

test('statistics Harnesses list: rows, dots, totals and footer copy', () => {
  const hf = loadDesignRuntime();
  const open = { 'h:0': true, 'h:1': true, 'h:2': true, 'h:3': true, 'h:4': true };
  for (const measure of ['time', 'usage']) for (const range of [7, 30, 90]) {
    const m = hf.statisticsModel({ list: 'harnesses', measure, range, open });
    assert.equal(m.listKind, 'harnesses');
    assert.equal(m.list.title, `Harnesses by ${measure === 'usage' ? 'usage' : 'total time'}`);
    assert.equal(m.list.footer, '5 harnesses · workflow nodes and tasks combined · select a row to see its models');
    assert.equal(m.list.rows.length, 5);
    assert.equal(m.list.rows[0].pct, 100);
    // Fixture consistency only: harness totals equal the formatted chart grand total (workflows + TASK_TOTAL), not the
    // seven listed tasks or the node fixtures. Compared through the formatted values, within display rounding.
    const parse = measure === 'usage' ? statTokens : statTime;
    const sum = m.list.rows.reduce((a, row) => a + parse(row.value), 0);
    const tol = 5 * 0.5 + (measure === 'usage' ? 5 * 50 : 0.5);
    assert.ok(Math.abs(sum - parse(m.chart.total)) <= tol, `${measure}/${range}: ${sum} vs ${m.chart.total}`);
    for (const row of m.list.rows) {
      assert.equal(row.kind, 'harness');
      assert.match(row.id, /^h:\d$/);
      assert.equal(row.hasMore, false);
      const executions = row.children.reduce((a, c) => a + c.executions, 0);
      assert.equal(executions, row.executions, `${row.name} executions add up exactly`);
      assert.equal(row.children[0].pct, 100, `${row.name} top model bar`);
      assert.ok(row.children.every((c, i, all) => i === 0 || parse(all[i - 1].value) >= parse(c.value) - 1e-9), 'models sorted by the measure');
      const tolerance = measure === 'usage' ? (row.children.length + 1) * 50 : (row.children.length + 1) * 0.5;
      assert.ok(Math.abs(row.children.reduce((a, c) => a + parse(c.value), 0) - parse(row.value)) <= tolerance, `${row.name} models sum to the row`);
      assert.equal(row.meta, `${executions === 1 ? '1 execution' : executions + ' executions'} · ${row.children.length === 1 ? '1 model' : row.children.length + ' models'}`);
      assert.equal(row.subFooter, `${row.children.length === 1 ? '1 model' : row.children.length + ' models'} · the model the harness reported, not the one requested`);
      assert.equal(row.subTitle, measure === 'usage' ? 'Models, most tokens first' : 'Models, longest first');
    }
  }
});

test('statistics Harnesses list markup: kind-slot dot, names, plural model, no Show all or node button', () => {
  const hf = loadDesignRuntime();
  const open = { 'h:0': true, 'h:1': true, 'h:2': true, 'h:3': true, 'h:4': true };
  const html = hf.statisticsBody('overview', { list: 'harnesses', open });
  assert.ok(html.includes('data-action="stat-list:harnesses" aria-pressed="true"'));
  assert.match(html, /<h3>Harnesses by total time<\/h3>/);
  const rows = html.match(/<button type="button" class="stat-row"[\s\S]*?<\/button>/g);
  assert.equal(rows.length, 5);
  for (const row of rows) {
    assert.match(row, /<span class="stat-kind"><span class="backend-dot [a-z]+" aria-hidden="true"><\/span><\/span>/, 'a dot in the kind slot');
    assert.doesNotMatch(row, /<span class="stat-kind"><svg/, 'not the terminal or workflow glyph');
    assert.equal((row.match(/backend-dot/g) || []).length, 1, 'no second dot in the meta line');
  }
  assert.match(html, /<strong>OpenCode<\/strong>/);
  assert.doesNotMatch(html, /Opencode/);
  assert.match(html, /<strong>Antigravity<\/strong>/);
  assert.match(html, /<span class="stat-ellipsis">18 executions · 1 model<\/span>/, 'Antigravity: 18 executions, one model');
  assert.match(html, /<span class="stat-ellipsis">(?:\d+) executions · 3 models<\/span>/);
  assert.match(html, /· 1 model</);
  assert.match(html, /· 3 models</);
  assert.doesNotMatch(html, /Show all|stat-more-runs|stat-all-tasks|View node breakdown|stat-nodes:/);
  assert.match(html, /<span class="stat-model">qwen3-coder<\/span>/);
  assert.match(html, /Models, longest first/);
  assert.match(html, /5 harnesses · workflow nodes and tasks combined/);
  assert.doesNotMatch(html, /stat-status|stat-when/, 'model sub-rows have no status or time slot');
  // Workflow and task rows keep the glyph in the kind slot.
  assert.match(hf.statisticsBody('overview', {}), /<span class="stat-kind"><svg/);
  // Every computed count is pluralised exactly. The fixtures never reach 1 execution at any range (the smallest is 4 at
  // 7 days), so the singular "1 execution" path is not reachable through the model and is not asserted here.
  for (const range of [7, 30, 90]) for (const row of hf.statisticsModel({ list: 'harnesses', range, open }).list.rows) {
    const noun = n => `${n} execution${n === 1 ? '' : 's'}`;
    assert.ok(row.meta.startsWith(`${noun(row.executions)} · `), `${range}/${row.name}: ${row.meta}`);
    for (const child of row.children) { assert.ok(child.executions >= 4, `${range}/${child.model}`); assert.ok(child.meta.startsWith(`${noun(child.executions)} · `), child.meta); }
  }
  assert.equal(hf.statisticsModel({ list: 'bogus' }).listKind, 'workflows');
});

test('statistics Harnesses model averages and execution counts scale with the range', () => {
  const hf = loadDesignRuntime();
  const expected = { claude: { opus: [1600, 310], sonnet: [980, 260], haiku: [40, 22] }, codex: { 'gpt-5': [980, 190], 'gpt-5-mini': [230, 60] }, opencode: { 'qwen3-coder': [720, 140] }, vibe: { devstral: [410, 110] }, antigravity: { 'gemini-2.5-pro': [172, 18] } };
  const names = ['Claude', 'Codex', 'OpenCode', 'Vibe', 'Antigravity'];
  const factor = { 7: 0.23, 30: 1, 90: 2.9 };
  const fmt = m => { m = Math.round(m); if (m < 1) return '< 1 min'; if (m < 60) return m + ' min'; const h = Math.floor(m / 60), r = m % 60; return r ? h + ' h ' + r + ' min' : h + ' h'; };
  const open = { 'h:0': true, 'h:1': true, 'h:2': true, 'h:3': true, 'h:4': true };
  for (const measure of ['time', 'usage']) for (const range of [7, 30, 90]) {
    const rows = hf.statisticsModel({ list: 'harnesses', measure, range, open }).list.rows;
    for (const row of rows) {
      const models = Object.entries(expected)[names.indexOf(row.name)][1];
      assert.equal(row.children.length, Object.keys(models).length);
      for (const child of row.children) {
        const [min, ex] = models[child.model];
        const executions = Math.max(1, Math.round(ex * factor[range]));
        assert.equal(child.executions, executions, `${row.name}/${child.model} ${range}`);
        assert.equal(child.meta, `${executions === 1 ? '1 execution' : executions + ' executions'} · ${fmt(min * factor[range] / executions)} avg`, `${row.name}/${child.model} ${measure}/${range} average is always time`);
      }
    }
  }
});

test('statistics Harnesses open keys stay on the same harness as the order changes and survive navigation', () => {
  const { hf, content, click } = statisticsInteractive();
  const order = measure => Array.from(hf.statisticsModel({ list: 'harnesses', measure }).list.rows.map(row => row.name));
  assert.deepEqual(order('time'), ['Claude', 'Codex', 'OpenCode', 'Vibe', 'Antigravity']);
  assert.deepEqual(order('usage'), ['Claude', 'Codex', 'Vibe', 'OpenCode', 'Antigravity'], 'Vibe and OpenCode swap');
  const openName = html => { const m = /aria-expanded="true"[\s\S]*?<strong>([^<]+)<\/strong>/.exec(html); return m && m[1]; };
  click('stat-list:harnesses');
  assert.match(content.innerHTML, /Harnesses by total time/);
  assert.match(content.innerHTML, /data-action="stat-list:harnesses" aria-pressed="true"/);
  click('stat-toggle:h:2');
  assert.equal(openName(content.innerHTML), 'OpenCode');
  assert.match(content.innerHTML, /data-action="stat-toggle:h:2" aria-expanded="true" aria-controls="stat-sub-h-2"/);
  click('stat-measure:usage');
  assert.deepEqual(Array.from(content.innerHTML.matchAll(/<span class="stat-rank">(\d)<\/span>[\s\S]*?<strong>([^<]+)<\/strong>/g), x => x[2]), order('usage'));
  assert.equal(openName(content.innerHTML), 'OpenCode', 'the open row follows the harness, not the rank');
  assert.match(content.innerHTML, /Models, most tokens first/);
  click('stat-range:7');
  assert.equal(openName(content.innerHTML), 'OpenCode');
  click('stat-list:workflows');
  assert.doesNotMatch(content.innerHTML, /aria-expanded="true"/);
  click('stat-list:tasks');
  click('stat-list:harnesses');
  assert.equal(openName(content.innerHTML), 'OpenCode', 'survives list switches');
  click('stat-list:workflows');
  click('stat-toggle:w:0');
  click('stat-nodes:0');
  click('stat-back');
  click('stat-list:harnesses');
  assert.equal(openName(content.innerHTML), 'OpenCode', 'survives the node-page round trip');
  assert.match(content.innerHTML, /Last 7 days/);
  click('stat-toggle:h:2');
  assert.doesNotMatch(content.innerHTML, /aria-expanded="true"/, 'toggle closes');
  click('stat-toggle:h:3');
  hf.resetStatistics();
  const html = hf.renderStatistics('overview');
  assert.doesNotMatch(html, /aria-expanded="true"/, 'reset clears the open harness rows');
  assert.ok(html.includes('data-action="stat-list:workflows" aria-pressed="true"'));
  assert.match(html, /<small>Last 30 days<\/small>/);
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
const councilRoute = (hf, route) => { hf.route = { theme: 'light', screen: 'workflow-editor', state: route }; hf.editorController.reset(route); return hf.editorController; };
const councilFields = snap => JSON.parse(JSON.stringify((snap.draft || snap).fieldValues['council:council']));
const councilUiState = snap => JSON.parse(JSON.stringify(snap.councilUi));
const councilMembers = (members = []) => members.map(([id, name, optional = false, harness = 'claude']) => ({ id, name, harness, model: '', effort: '', instructions: '', optional }));
const councilRun = (hf, state) => { hf.route = { theme: 'light', screen: 'workflow-run', state }; hf.resetWorkflowRun(hf.route); return hf.renderRun(state); };

test('council validation: names, required count, question, and the only-message rule', () => {
  const hf = loadDesignRuntime();
  const check = (members, extra = {}) => Array.from(hf.councilValidation({ question: 'Q', facilitator: members[0]?.id, members: councilMembers(members), ...extra }));
  assert.deepEqual(check([['a', 'Alpha'], ['b', 'Beta']]), []);
  const blank = 'Name this member. The name labels its messages in Activity.';
  assert.deepEqual(check([['a', 'Alpha'], ['b', 'Beta'], ['c', '']]), [blank]);
  assert.deepEqual(check([['a', 'Alpha'], ['b', 'Beta'], ['c', '   ']]), [blank], 'whitespace-only is blank');
  const dup = name => `Another member is named ${name}. Names must be unique so every message is attributable.`;
  assert.deepEqual(check([['a', 'QA'], ['b', ' qa '], ['c', 'Gamma']]), [dup('QA'), dup('qa')], 'duplicates ignore case and surrounding whitespace');
  assert.deepEqual(check([['a', 'Alpha'], ['b', 'Beta'], ['c', 'Gamma']]), []);
  // Question
  assert.deepEqual(check([['a', 'A'], ['b', 'B']], { question: '  ' }), ['Enter the question and context for the council.']);
  // Required count: optional members do not count; there is no member cap.
  assert.deepEqual(check([['a', 'A'], ['b', 'B', true]]), ['A council needs at least 2 required members']);
  assert.deepEqual(check([['a', 'A'], ['b', 'B', true], ['c', 'C', true]]), ['A council needs at least 2 required members']);
  assert.deepEqual(check([['a', 'A'], ['b', 'B'], ['c', 'C', true]]), []);
  assert.deepEqual(check([['a', 'A']]), ['A council needs at least 2 required members']);
  assert.deepEqual(check([]), ['A council needs at least 2 required members']);
  const many = Array.from({ length: 9 }, (_, i) => [`m${i}`, `Member ${i}`]);
  assert.deepEqual(check(many), [], 'no maximum member count');
  // No required member: the too-few banner is the only message (no separate facilitator message).
  const none = check([['a', 'A', true], ['b', 'B', true]], { facilitator: 'a' });
  assert.deepEqual(none, ['A council needs at least 2 required members']);
  assert.equal(hf.councilModel({ question: 'Q', facilitator: '', members: councilMembers([['a', 'A', true]]) }).facilitatorId, '');
  // Detail variants for the banner.
  assert.match(hf.councilModel({ members: councilMembers([['a', 'A'], ['b', 'B', true]]) }).tooFewDetail, /^Optional members do not count\. Clear Optional on a member or add one\. Your edits are kept\.$/);
  assert.match(hf.councilModel({ members: councilMembers([['a', 'A']]) }).tooFewDetail, /^Add a member to run this node\. Your edits are kept\.$/);
  assert.equal(hf.councilModel({ members: councilMembers([['a', 'A'], ['b', 'B', true], ['c', 'C', true]]) }).heading, 'Members (3 · 2 optional)');
  assert.equal(hf.councilModel({ members: councilMembers([['a', 'A'], ['b', 'B']]) }).heading, 'Members (2)');
  assert.deepEqual(Array.from(hf.councilModel({ members: councilMembers([['a', '']]) }).rows.map(row => row.title)), ['Member 1']);
});

test('council facilitator is derived on read without side effects and never optional', () => {
  const hf = loadDesignRuntime();
  const fields = { question: 'Q', facilitator: 'z', members: councilMembers([['a', 'A', true], ['b', 'B'], ['c', 'C']]) };
  const before = JSON.stringify(fields);
  assert.equal(hf.councilEffectiveFacilitator(fields), 'b', 'stale id falls back to the first required member');
  hf.councilModel(fields); hf.councilValidation(fields); hf.councilNodeSummary(fields);
  assert.equal(JSON.stringify(fields), before, 'read paths do not mutate the draft');
  assert.equal(hf.councilEffectiveFacilitator({ facilitator: 'a', members: fields.members }), 'b', 'an optional member is never the facilitator');
  assert.equal(hf.councilEffectiveFacilitator({ facilitator: 'c', members: fields.members }), 'c');
  assert.equal(hf.councilEffectiveFacilitator({ members: councilMembers([['a', 'A', true]]) }), '');
  assert.equal(hf.councilEffectiveFacilitator({}), '');
  hf.councilNormalizeFacilitator(fields);
  assert.equal(fields.facilitator, 'b', 'normalize persists the derived id');
  const model = hf.councilModel(fields);
  assert.deepEqual(Array.from(model.rows.filter(row => row.isFacilitator).map(row => row.id)), ['b']);
  assert.equal(model.rows.find(row => row.id === 'b').optionalHelp, 'The facilitator is always required.');
});

test('council editor: facilitator checkbox is disabled, the select lists required members only, and removal reassigns', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  let html = hf.renderEditor('council-config');
  assert.match(html, /<h3 data-council-heading>Members \(3 · 1 optional\)<\/h3>/);
  assert.match(html, /id="council-optional-m1" type="checkbox" data-council-member="m1" data-council-field="optional"\s+disabled>/);
  assert.match(html, /The facilitator is always required\./);
  const select = html.match(/<select data-council-field="facilitator"[^>]*>(.*?)<\/select>/)[1];
  assert.match(select, /Architect · Claude/);
  assert.match(select, /Frontend · Codex/);
  assert.doesNotMatch(select, /QA/, 'optional members cannot be facilitators');
  assert.equal((select.match(/<option/g) || []).length, 2);
  // Attempting to make the facilitator optional is ignored.
  let snap = editor.councilSet('m1', 'optional', true);
  assert.equal(councilFields(snap).members[0].optional, false);
  assert.equal(snap.dirty, false);
  // Removing the facilitator reassigns it to the first remaining required member.
  snap = editor.councilToggle('m2');
  snap = editor.councilRemove('m1');
  assert.deepEqual(councilFields(snap).members.map(member => member.id), ['m2', 'm3']);
  assert.equal(councilFields(snap).facilitator, 'm2');
  assert.equal(snap.dirty, true);
  html = hf.renderEditor('council-config');
  assert.match(html, /A council needs at least 2 required members/);
  assert.equal(snap.canRun, false);
  assert.equal(snap.canSave, false);
  // Selecting another facilitator persists it.
  editor.reset('council-config');
  snap = editor.councilSet('m1', 'facilitator', 'm2');
  assert.equal(councilFields(snap).facilitator, 'm2');
  snap = editor.councilSet('m1', 'facilitator', 'm3');
  assert.equal(councilFields(snap).facilitator, 'm2', 'an optional member is not accepted as facilitator');
});

test('council editor recovers from removing the facilitator while the others are optional', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-too-few');
  let snap = editor.snapshot();
  assert.deepEqual(councilFields(snap).members.map(member => member.optional), [false, true, true]);
  assert.equal(councilFields(snap).facilitator, 'm1');
  snap = editor.councilRemove('m1');
  assert.equal(councilFields(snap).facilitator, '', 'no required member: no facilitator');
  let html = hf.renderEditor('council-too-few');
  assert.match(html, /<select data-council-field="facilitator" aria-label="Facilitator" disabled><option>No required members<\/option>/);
  assert.equal((html.match(/editor-council-banner/g) || []).length, 1);
  snap = editor.councilAdd();
  const added = councilFields(snap).members.at(-1);
  assert.equal(councilFields(snap).facilitator, added.id, 'the new required member becomes the facilitator');
  snap = editor.councilSet(added.id, 'name', 'Reviewer');
  snap = editor.councilSet('m2', 'optional', false);
  const fields = councilFields(snap);
  assert.equal(fields.facilitator, added.id, 'the facilitator is stable once required members exist');
  assert.deepEqual(Array.from(hf.councilValidation(fields)), []);
  assert.equal(hf.councilModel(fields).requiredCount, 2);
  // Un-optional path: remove facilitator again, then clear Optional on two members.
  editor.reset('council-too-few');
  editor.councilRemove('m1');
  snap = editor.councilSet('m2', 'optional', false);
  assert.equal(councilFields(snap).facilitator, 'm2');
  snap = editor.councilSet('m3', 'optional', false);
  assert.equal(councilFields(snap).facilitator, 'm2');
  assert.deepEqual(Array.from(hf.councilValidation(councilFields(snap))), []);
  html = hf.renderEditor('council-too-few');
  assert.doesNotMatch(html, /editor-council-banner/);
});

test('council editor: effort cycles, Vibe has no effort, and the summary follows', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  editor.councilToggle('m2');
  const effort = () => councilFields(editor.snapshot()).members[1].effort;
  assert.equal(effort(), 'medium');
  const seen = [];
  for (let i = 0; i < 4; i++) { editor.councilCycleEffort('m2'); seen.push(effort()); }
  assert.deepEqual(seen, ['high', '', 'low', 'medium'], 'Default, Low, Medium, High cycle');
  assert.match(hf.renderEditor('council-config'), /aria-label="Effort for Frontend: Medium"/);
  const open = hf.renderEditor('council-config');
  assert.doesNotMatch(open, /Vibe does not take a reasoning effort/);
  // Switching to Vibe hides the control and clears the stored effort.
  let snap = editor.councilSet('m2', 'harness', 'vibe');
  assert.equal(councilFields(snap).members[1].effort, '');
  const html = hf.renderEditor('council-config');
  assert.match(html, /Vibe does not take a reasoning effort\./);
  assert.doesNotMatch(html, /data-action="editor-council-effort:m2"/);
  editor.councilToggle('m2');
  const closed = hf.renderEditor('council-config');
  assert.match(closed, /Vibe · Default<\/span>/, 'collapsed summary drops the effort');
  assert.doesNotMatch(closed, /Vibe · Default · /);
  // Cycling a Vibe member is ignored.
  snap = editor.councilCycleEffort('m2');
  assert.equal(councilFields(snap).members[1].effort, '');
  assert.equal(hf.councilModel({ members: councilMembers([['a', 'A', false, 'vibe']]) }).rows[0].summary, 'Vibe · Default');
  assert.equal(hf.councilModel({ members: councilMembers([['a', 'A', false, 'opencode']]) }).rows[0].summary, 'OpenCode · Default · Default');
  // An unknown harness is rejected.
  snap = editor.councilSet('m2', 'harness', 'nope');
  assert.equal(councilFields(snap).members[1].harness, 'vibe');
});

test('council accordion keeps the draft clean and ids are deterministic after reset', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  hf.renderEditor('council-config');
  assert.equal(editor.snapshot().councilUi.council.open, 'm1');
  for (const id of ['m2', 'm2', 'm3', 'm1']) { const snap = editor.councilToggle(id); assert.equal(snap.dirty, false, `toggle ${id}`); assert.equal(snap.canRun, true); }
  assert.equal(editor.snapshot().councilUi.council.open, 'm1');
  editor.councilToggle('m1');
  assert.equal(editor.snapshot().councilUi.council.open, null, 'toggling the open card collapses it');
  editor.councilToggle('m2');
  assert.equal(editor.snapshot().councilUi.council.open, 'm2', 'one card open at a time');
  const html = hf.renderEditor('council-config');
  assert.equal((html.match(/class="editor-council-card is-open"/g) || []).length, 1);
  assert.equal((html.match(/aria-expanded="true"/g) || []).length, 1);
  assert.match(html, /aria-label="Collapse Frontend"/);
  assert.match(html, /aria-label="Edit Architect"/);
  assert.match(html, /aria-label="Remove Frontend"/);
  assert.equal(editor.councilToggle('missing').councilUi.council.open, 'm2', 'unknown ids are ignored');
  // Ids come from a counter that reset reseeds.
  const first = editor.councilAdd(); const second = editor.councilAdd();
  assert.deepEqual(councilFields(second).members.slice(3).map(member => member.id), ['m4', 'm5']);
  assert.equal(second.councilUi.council.open, 'm5');
  editor.reset('council-config');
  const again = editor.councilAdd();
  assert.deepEqual(councilFields(again).members.slice(3).map(member => member.id), ['m4']);
  assert.equal(first.dirty, true);
  assert.deepEqual(Object.keys(editor.reset('council-config').councilUi), [], 'reset clears accordion state');
  assert.equal(councilFields(editor.reset('council-name-errors')).members.at(-1).id, 'm4');
  assert.equal(editor.snapshot().councilUi.council.open, 'm4');
  assert.equal(councilFields(editor.reset('council-name-errors')).members.at(-1).id, 'm4', 'same route, same ids');
});

test('council Save needs a dirty valid draft, Run a saved valid one, and Discard restores the saved baseline', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  let snap = editor.snapshot();
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun, snap.canDiscard], [false, false, true, false]);
  snap = editor.councilSet('m2', 'name', 'Frontend lead');
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun, snap.canDiscard], [true, true, false, true]);
  snap = editor.save();
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun], [false, false, true]);
  assert.equal(councilFields(snap.baseline).members[1].name, 'Frontend lead');
  snap = editor.councilSet('m2', 'name', '');
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun], [true, false, false], 'a blank name blocks Save and Run');
  assert.equal(councilFields(snap).members[1].name, '', 'the invalid edit is kept');
  assert.match(hf.renderEditor('council-config'), /Workflow is not valid: Council: Name this member/);
  snap = editor.discard();
  assert.equal(councilFields(snap).members[1].name, 'Frontend lead', 'Discard restores the last saved baseline, not the seed');
  assert.deepEqual([snap.dirty, snap.canRun], [false, true]);
  snap = editor.councilSet('m1', 'question', '   ');
  assert.equal(snap.canSave, false);
  assert.match(hf.renderEditor('council-config'), /Enter the question and context for the council\./);
  assert.equal(snap.canRun, false);
  editor.discard();
  // Re-entry reseeds from the canvas fixture.
  const fresh = editor.reset('council-config');
  assert.equal(councilFields(fresh).members[1].name, 'Frontend');
});

test('council-name-errors and council-too-few start dirty and invalid over a valid baseline', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-name-errors');
  let snap = editor.snapshot();
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun, snap.canDiscard], [true, false, false, true]);
  assert.deepEqual(councilFields(snap).members.map(member => member.name), ['Architect', 'QA', 'QA', '']);
  assert.deepEqual(Array.from(hf.councilValidation(councilFields(snap.baseline))), [], 'the baseline is valid');
  assert.equal(snap.councilUi.council.open, 'm4', 'the blank member is expanded');
  const html = hf.renderEditor('council-name-errors');
  assert.ok((html.match(/Another member is named QA\. Names must be unique/g) || []).length >= 2, 'both duplicates show the error');
  assert.equal((html.match(/editor-council-excerpt is-error/g) || []).length, 2, 'collapsed duplicates show the error as their excerpt');
  assert.match(html, /Name this member\. The name labels its messages in Activity\./);
  assert.match(html, /aria-invalid="true" aria-describedby="council-name-error-m4"/);
  assert.match(html, /Fix the configuration to run/);
  assert.match(html, /Member 4/);
  assert.match(html, /placeholder="For example, QA"/);
  assert.doesNotMatch(html, /editor-council-banner/);
  snap = editor.discard();
  assert.deepEqual(councilFields(snap).members.map(member => member.name), ['Architect', 'Frontend', 'QA']);
  assert.deepEqual([snap.dirty, snap.canRun], [false, true]);

  const few = councilRoute(hf, 'council-too-few');
  snap = few.snapshot();
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun, snap.canDiscard], [true, false, false, true]);
  assert.deepEqual(councilFields(snap).members.map(member => member.optional), [false, true, true]);
  assert.equal(snap.councilUi.council.open, null);
  const fewHtml = hf.renderEditor('council-too-few');
  assert.match(fewHtml, /role="alert"><svg[^>]*>.*<strong>A council needs at least 2 required members<\/strong><span>Optional members do not count\. Clear Optional on a member or add one\. Your edits are kept\.<\/span>/);
  assert.match(fewHtml, /Members \(3 · 2 optional\)/);
  assert.equal(few.discard().canRun, true);
});

test('two Council nodes keep independent members', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  let snap = editor.addNode('council');
  const second = snap.selected.id;
  assert.notEqual(second, 'council');
  const fields = id => JSON.parse(JSON.stringify(editor.snapshot().draft.fieldValues[`council:${id}`]));
  assert.ok(fields(second), 'the new node has its own council fields');
  assert.deepEqual(fields(second).members.map(member => member.name), ['Architect', 'Frontend', 'QA']);
  editor.select('council', second);
  editor.councilSet('m2', 'name', 'Second node only');
  editor.councilRemove('m3');
  assert.deepEqual(fields(second).members.map(member => member.name), ['Architect', 'Second node only']);
  assert.deepEqual(fields('council').members.map(member => member.name), ['Architect', 'Frontend', 'QA'], 'the first node is untouched');
  editor.select('council', 'council');
  editor.councilAdd();
  assert.equal(fields('council').members.length, 4);
  assert.equal(fields(second).members.length, 2);
  const ui = editor.snapshot().councilUi;
  assert.ok(ui.council && ui[second], 'accordion state is per node');
  const html = hf.renderEditor('council-config');
  assert.match(html, /Architect, Second node only/);
  assert.match(html, /Architect, Frontend, QA, Member 4/);
});

test('council node summaries are consistent in the editor and the run for every state', () => {
  const hf = loadDesignRuntime();
  const summary = fields => JSON.parse(JSON.stringify(hf.councilNodeSummary(fields)));
  assert.deepEqual(summary({ question: 'Q', facilitator: 'a', members: councilMembers([['a', 'A'], ['b', 'B'], ['c', 'C', true]]) }), { members: 'A, B, C', meta: '2 required · 1 optional · max 5 rounds' });
  assert.deepEqual(summary({ question: 'Q', facilitator: 'a', members: councilMembers([['a', 'A'], ['b', 'B']]) }), { members: 'A, B', meta: '2 required · max 5 rounds' });
  assert.deepEqual(summary({ question: 'Q', members: councilMembers([['a', 'A'], ['b', 'B', true]]) }), { members: 'A, B', meta: 'Fix the configuration to run' });
  assert.deepEqual(summary({ question: 'Q', members: councilMembers([['a', ''], ['b', 'B']]) }), { members: 'Member 1, B', meta: 'Fix the configuration to run' });
  const expectedMeta = { 'council-config': '2 required · 1 optional · max 5 rounds', 'council-name-errors': 'Fix the configuration to run', 'council-too-few': 'Fix the configuration to run' };
  for (const route of hf.councilEditorRoutes) {
    councilRoute(hf, route);
    const rendered = hf.renderEditor(route);
    assert.ok(rendered.includes(`data-council-meta>${expectedMeta[route]}</small>`), `${route} meta`);
    assert.match(rendered, /data-council-members>Architect, /, `${route} members`);
  }
  const lines = { council: ['Architect, Frontend, QA · round 2 of 5', 'Phase: voting on v2', 'Round 2 of 5 · Voting on v2', 'Running'], 'council-consensus': ['Architect, Frontend, QA · round 2 of 5', 'Phase: consensus on v2', 'Round 2 of 5 · Consensus on v2', 'Completed'], 'council-member-left': ['Architect, Frontend, QA · round 1 of 5', 'Phase: discussing v1', 'Round 1 of 5 · Discussing v1', 'Running'], 'council-failed': ['Architect, Frontend, QA · round 1 of 5', 'Phase: failed', 'Round 1 of 5 · Failed', 'Failed'] };
  assert.deepEqual(Array.from(hf.councilRunStates), Object.keys(lines));
  for (const [state, [line, phase, header, status]] of Object.entries(lines)) {
    const run = hf.councilRunSummary(state);
    assert.deepEqual([run.line, run.phase, run.header, run.status], [line, phase, header, status], state);
    const html = councilRun(hf, state);
    assert.ok(html.includes(`<small>${line}</small><small>${phase}</small>`), `${state} node lines`);
    assert.ok(html.includes(`<span class="council-phase">${header}</span>`), `${state} header`);
  }
  assert.deepEqual(Array.from(hf.councilRunSummary('council-member-left').left), ['QA']);
  assert.deepEqual(Array.from(hf.councilRunSummary('unknown').left), [], 'unknown states fall back to the default run');
});

test('council run states cut the feed, show the right chips, roster, outcome and system messages', () => {
  const hf = loadDesignRuntime();
  const articles = html => (html.match(/<article class="council-turn"/g) || []).length;
  const labels = state => Array.from(hf.councilActivity(state).matchAll(/<article class="council-turn" aria-label="([^"]*)"/g), match => match[1]);
  const feed = state => hf.councilActivity(state);

  const base = feed('council');
  assert.equal(articles(base), 8);
  assert.deepEqual(labels('council').filter(label => label.startsWith('Council')), ['Council, system, 14:41', 'Council, system, 14:44']);
  for (const text of ['Round 1 of 5 · 14:36', 'Round 2 of 5 · 14:41', 'Question to <strong>Architect</strong> · about Candidate v1', 'Answered 14:41', 'Reply to <strong>QA</strong>’s question', 'Supersedes v1', 'Prior acceptances reset', 'Objects to v1', 'Architect accepts', 'Frontend accepts', 'QA (optional): no vote yet', 'Candidate v2']) assert.ok(base.includes(text), text);
  assert.doesNotMatch(base, /Consensus reached|QA left the council|Council failed|Withdrawn|Unresolved/);
  assert.doesNotMatch(base, /<strong>(Claude|Codex|Vibe)<\/strong>/, 'the harness is never the speaker');
  assert.equal((base.match(/class="wfr-council-feed" id="council-feed" tabindex="0" role="region" aria-label="Council discussion, one feed"/g) || []).length, 1);
  assert.match(base, /aria-label="Close selected activity"/);
  assert.match(base, /role="list" aria-label="Members"/);

  const consensus = feed('council-consensus');
  assert.equal(articles(consensus), 9);
  assert.equal(labels('council-consensus').at(-1), 'Council, system, consensus');
  assert.match(consensus, /Consensus reached on Candidate v2/);
  assert.match(consensus, /Accepted by Architect and Frontend \(2 of 2 required\)\./);
  assert.match(consensus, /QA \(optional\) did not vote\./);
  assert.match(consensus, /Caveat from Architect: the bound was not load tested\./);
  assert.doesNotMatch(consensus, /Go to outcome|Conclusion|Rationale/);

  const left = feed('council-member-left');
  assert.equal(articles(left), 4, 'cut off before QA’s question is answered');
  assert.equal(labels('council-member-left').at(-1), 'Council, system, optional member failed');
  assert.match(left, /council-chip disposition withdrawn">Withdrawn</);
  assert.doesNotMatch(left, /Answered|Round 2 of 5|Supersedes|Candidate v2/);
  assert.match(left, /QA left the council/);
  assert.match(left, /QA’s harness \(Vibe\) exited unexpectedly\. QA is optional, so the council continues with Architect and Frontend\./);
  assert.match(left, /QA’s open question to Architect is withdrawn\./);
  assert.match(left, /<strong>QA<\/strong><span>Optional<\/span><span class="council-left">Left<\/span>/);
  assert.equal((left.match(/council-left"/g) || []).length, 1, 'only QA is marked Left');

  const failed = feed('council-failed');
  assert.equal(articles(failed), 4);
  assert.equal(labels('council-failed').at(-1), 'Council, system, failed');
  assert.match(failed, /council-chip disposition unresolved">Unresolved</);
  assert.match(failed, /Council failed/);
  assert.match(failed, /This is a failure, not a lack of consensus\./);
  assert.doesNotMatch(failed, /council-left|Withdrawn|Answered/);
  for (const state of ['council', 'council-consensus']) assert.doesNotMatch(feed(state), /council-left"/);
  for (const state of hf.councilRunStates) assert.equal((feed(state).match(/<span class="council-role">(Facilitator|Member|Optional)<\/span>/g) || []).length >= 3, true);
});

test('council run states set the graph node, badge, toolbar and spinners; failed never shows the load error', () => {
  const hf = loadDesignRuntime();
  const run = state => councilRun(hf, state);
  const spinners = html => (html.match(/wfr-spinner/g) || []).length;
  const running = run('council');
  assert.match(running, /<span class="wfr-badge running">(?:<span[^>]*><\/span>)?Running<\/span>/);
  assert.match(running, /Cancel run/);
  assert.match(running, /wf-running-node/);
  assert.match(running, /data-action="wr-select:council"/);
  assert.match(running, /<button type="button" disabled>Parallel<\/button>/);

  const consensus = run('council-consensus');
  assert.match(consensus, /<span class="wfr-badge running">(?:<span[^>]*><\/span>)?Running<\/span>/, 'the run is still running after consensus');
  assert.match(consensus, /Cancel run/);
  assert.match(consensus, /class="node wfr-council-node[^"]*wf-completed-node/, 'the Council node is completed without a spinner');
  assert.match(consensus, /wfr-council-node[^>]*>(?:(?!<\/button>).)*Phase: consensus on v2<\/small><\/button>/, 'no spinner inside the Council node');
  assert.match(consensus, /<strong>Review<\/strong>.*?<small>Running<\/small><span class="wfr-node-spinner wfr-spinner"/, 'Review runs next');

  const left = run('council-member-left');
  assert.match(left, /<span class="wfr-badge running">(?:<span[^>]*><\/span>)?Running<\/span>/);
  assert.match(left, /Cancel run/);
  assert.match(left, /wfr-council-node[^"]*wf-running-node/);
  assert.match(left, /<strong>Review<\/strong>.*?<small>Pending<\/small>/);

  const failed = run('council-failed');
  assert.match(failed, /<span class="wfr-badge failed">Failed<\/span>/);
  assert.equal(spinners(failed), 0, 'no spinners anywhere');
  assert.doesNotMatch(failed, /Cancel run|>Pause</, 'the run is over: no Pause or Cancel run');
  assert.match(failed, /wfr-council-node[^"]*wf-failed-node/);
  assert.match(failed, /Phase: failed/);
  assert.match(failed, /<strong>Review<\/strong>.*?<small>Pending<\/small>/);
  assert.match(failed, /<button type="button" class="selected" data-action="wr-mode:graph">Graph<\/button><button type="button" disabled>Parallel<\/button>/);
  assert.doesNotMatch(failed, /error-state|wfr-error-state/, 'a failed council is not the load-error presentation');
  assert.match(run('error'), /wfr-error-state/, 'the real error route still shows it');
  assert.ok(spinners(running) > 0 && spinners(left) > 0);
  for (const state of hf.councilRunStates) {
    const html = run(state);
    assert.match(html, /wfr-council/, `${state} opens the Council feed`);
    assert.doesNotMatch(html, /wfr-sidebar-default/);
  }
});

test('council states never offer outcome jump, token budget, structured output, routing or editable limits', () => {
  const hf = loadDesignRuntime();
  const banned = /Go to outcome|wr-council-jump|council-outcome"|Token budget|Structured output|Routing|outputSchema|Route by outcome|maxRounds|questionLimit|followUpLimit|timeBudget|type="number"|memberCount/i;
  for (const state of hf.councilRunStates) {
    assert.doesNotMatch(councilRun(hf, state), banned, `run/${state}`);
    assert.doesNotMatch(hf.councilActivity(state), banned, `activity/${state}`);
  }
  for (const route of hf.councilEditorRoutes) {
    councilRoute(hf, route);
    const rendered = hf.renderEditor(route);
    assert.doesNotMatch(rendered, banned, route);
    assert.doesNotMatch(rendered, /editor-council-errors/, route);
  }
  hf.editorController.reset('council-config');
  const html = hf.renderEditor('council-config');
  assert.match(html, /<dl class="editor-council-limits"><div><dt>Max rounds<\/dt><dd>5<\/dd><\/div><div><dt>Question limit<\/dt><dd>3<\/dd><\/div><div><dt>Follow-up limit<\/dt><dd>2<\/dd><\/div><div><dt>Time budget<\/dt><dd>15 min<\/dd><\/div><\/dl>/, 'limits are read-only rows');
  assert.doesNotMatch(html, /<input[^>]*data-editor-field="(maxRounds|questionLimit|followUpLimit|timeBudgetMinutes|tokenBudget)"/);
  assert.doesNotMatch(html, /disabled>Add member/);
  const editor = hf.editorController;
  for (let i = 0; i < 4; i++) editor.councilAdd();
  assert.equal(councilFields(editor.snapshot()).members.length, 7, 'no member cap');
  assert.match(hf.renderEditor('council-config'), /data-action="editor-council-add"(?![^>]*disabled)/);
});

test('council states are registered as exploratory with their tickets', () => {
  const hf = loadDesignRuntime();
  const editor = hf.screens.find(screen => screen.id === 'workflow-editor'), runFamily = hf.screens.find(screen => screen.id === 'workflow-run');
  for (const state of hf.councilEditorRoutes) {
    assert.ok(editor.states.includes(state), state);
    const status = hf.specimenStatus('workflow-editor', state);
    assert.equal(status.kind, 'exploratory');
    assert.deepEqual(Array.from(status.tickets), ['#17']);
    assert.match(status.caption, /^Exploratory · ticket #17 · Not approved/);
  }
  for (const state of hf.councilRunStates) {
    assert.ok(runFamily.states.includes(state), state);
    const status = hf.specimenStatus('workflow-run', state);
    assert.equal(status.kind, 'exploratory');
    assert.deepEqual(Array.from(status.tickets), ['#17', '#15'], `${state} also shows the compact sidebar when closed`);
  }
  assert.equal(hf.specimenStatus('workflow-run', 'running').kind === 'exploratory', false);
});

test('council editor focus follows add, remove and toggle', () => {
  const focused = [];
  const hf = loadDesignRuntime({ querySelectorOverride: selector => selector.startsWith('.editor-app ') ? { focus: () => focused.push(selector) } : undefined });
  const editor = councilRoute(hf, 'council-config');
  editor.councilAdd();
  assert.equal(focused.at(-1), '.editor-app #council-name-m4', 'Add member focuses the new Name input');
  editor.councilRemove('m4');
  assert.equal(focused.at(-1), '.editor-app [data-action="editor-council-toggle:m3"]', 'removing the last card focuses the previous card’s toggle');
  editor.councilRemove('m2');
  assert.equal(focused.at(-1), '.editor-app [data-action="editor-council-toggle:m3"]', 'focus moves to the next card’s toggle');
  editor.councilRemove('m3');
  assert.equal(focused.at(-1), '.editor-app [data-action="editor-council-toggle:m1"]', 'otherwise the previous card’s toggle');
  editor.councilToggle('m1');
  assert.equal(focused.at(-1), '.editor-app [data-action="editor-council-toggle:m1"]');
  editor.councilCycleEffort('m1');
  assert.equal(focused.at(-1), '.editor-app [data-action="editor-council-effort:m1"]', 'cycling effort keeps focus on the effort control');
  editor.councilRemove('m1');
  assert.equal(focused.at(-1), '.editor-app [data-action="editor-council-add"]', 'removing the only card focuses Add member');
  editor.councilAdd();
  assert.match(focused.at(-1), /^\.editor-app #council-name-m\d+$/);
});

const councilFocusDom = hf => {
  const focused = [];
  let rendering = false;
  const find = selector => {
    if (rendering || !selector.startsWith('.editor-app ')) return undefined;
    rendering = true;
    let html;
    try { html = hf.renderEditor(hf.route.state); } finally { rendering = false; }
    const inner = selector.slice('.editor-app '.length);
    const tags = html.match(/<(?:button|input|select|textarea)\b[^>]*>/g) || [];
    const attrs = [...inner.matchAll(/\[([\w-]+)="([^"]*)"\]/g)].map(m => `${m[1]}="${m[2]}"`);
    const byId = /^#([\w-]+)$/.exec(inner);
    const tag = tags.find(t => byId ? t.includes(` id="${byId[1]}"`) : attrs.length && attrs.every(a => t.includes(a)));
    if (!tag) return undefined;
    const disabled = /\sdisabled(?=[\s>=])/.test(tag);
    return { disabled, focus: () => { assert.equal(disabled, false, `focus() on a disabled control: ${selector}`); focused.push(inner); } };
  };
  return { focused, find };
};

test('Council run states render Pause and Cancel run while running and neither once failed', () => {
  const hf = loadDesignRuntime();
  for (const state of ['council', 'council-consensus', 'council-member-left']) {
    const html = councilRun(hf, state);
    assert.match(html, /data-action="wr-pause"/, `${state} Pause`);
    assert.match(html, /data-action="wr-cancel"/, `${state} Cancel run`);
  }
  const failed = councilRun(hf, 'council-failed');
  assert.doesNotMatch(failed, /wr-pause|wr-cancel|>Pause<|Cancel run/);
});

test('Council collapsed cards describe themselves with a unique excerpt that carries the name error', () => {
  const hf = loadDesignRuntime();
  for (const route of hf.councilEditorRoutes) {
    councilRoute(hf, route);
    const html = hf.renderEditor(route);
    const buttons = html.match(/<button[^>]*data-council-card="[^"]+"[^>]*>/g) || [];
    assert.ok(buttons.length >= 1, route);
    const ids = buttons.map(button => /aria-describedby="([^"]+)"/.exec(button)?.[1]);
    assert.ok(ids.every(Boolean), `${route} every collapsed card has aria-describedby`);
    assert.equal(new Set(ids).size, ids.length, 'unique ids');
    for (const id of ids) assert.equal((html.match(new RegExp(` id="${id}"`, 'g')) || []).length, 1, `${id} resolves exactly once`);
  }
  councilRoute(hf, 'council-name-errors');
  const html = hf.renderEditor('council-name-errors');
  for (const id of ['m2', 'm3']) assert.match(html, new RegExp(`class="editor-council-excerpt is-error" id="council-excerpt-${id}" data-council-excerpt>Another member is named QA\\.`));
  assert.match(html, /aria-describedby="council-excerpt-m2"/);
  assert.match(html, /id="council-excerpt-m1" data-council-excerpt>You are the architect/);
});

test('Council Discard, and Add then Discard, leave exactly one card open: the first member', () => {
  const hf = loadDesignRuntime();
  const openCards = html => (html.match(/class="editor-council-card is-open"/g) || []).length;
  const editor = councilRoute(hf, 'council-name-errors');
  assert.equal(editor.snapshot().councilUi.council.open, 'm4');
  hf.renderEditor('council-name-errors');
  let snap = editor.discard();
  assert.equal(snap.councilUi.council.open, 'm1');
  let html = hf.renderEditor('council-name-errors');
  assert.equal(openCards(html), 1);
  assert.match(html, /aria-expanded="true"[^>]*aria-label="Collapse Architect"|aria-label="Collapse Architect"[^>]*aria-expanded="true"/);
  editor.reset('council-config');
  hf.renderEditor('council-config');
  snap = editor.councilAdd();
  assert.equal(snap.councilUi.council.open, 'm4');
  snap = editor.discard();
  assert.equal(snap.councilUi.council.open, 'm1', 'the removed member’s card is not left open');
  html = hf.renderEditor('council-config');
  assert.equal(openCards(html), 1);
  assert.equal(councilFields(snap).members.length, 3);
  // An open card that still exists stays open.
  editor.councilToggle('m2');
  editor.councilSet('m2', 'name', 'Frontend lead');
  assert.equal(editor.discard().councilUi.council.open, 'm2');
});

test('Council-consensus Review lane status matches the graph, and other council states keep it pending', () => {
  const stage = { innerHTML: '', querySelector: () => null };
  const hf = loadDesignRuntime({ captureEvents: true, querySelectorOverride: selector => selector === '#stage' ? stage : undefined });
  hf.route = { theme: 'light', screen: 'workflow-run', state: 'council-consensus' };
  const select = (state, node) => {
    hf.route = { theme: 'light', screen: 'workflow-run', state }; hf.resetWorkflowRun(hf.route);
    const target = { dataset: { action: `wr-select:${node}` }, isConnected: true, closest: selector => selector.startsWith('[data-action^="wr-"') ? target : null };
    hf.__dispatchDesignEvent({ type: 'click', target, preventDefault() {}, stopImmediatePropagation() {} });
    return stage.innerHTML;
  };
  const consensus = select('council-consensus', 'review');
  assert.match(consensus, /<strong>Review<\/strong>/);
  assert.match(consensus, /<article class="parallel-lane running" data-task-id="workflow-review-attempt-1">/);
  for (const state of ['council', 'council-member-left', 'council-failed']) {
    assert.match(select(state, 'review'), /<article class="parallel-lane pending" data-task-id="workflow-review-attempt-1">/, `${state} Review stays pending`);
  }
  assert.match(select('council-consensus', 'planning'), /<article class="parallel-lane completed"/, 'Plan is done in council states');
});

test('Council changing a member harness resets its model to Default', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  assert.equal(councilFields(editor.snapshot()).members[0].model, 'Opus');
  const snap = editor.councilSet('m1', 'harness', 'codex');
  assert.equal(councilFields(snap).members[0].harness, 'codex');
  assert.equal(councilFields(snap).members[0].model, '');
  hf.renderEditor('council-config');
  assert.match(hf.renderEditor('council-config'), /Model for Architect: Default/);
  assert.equal(councilFields(editor.councilSet('m2', 'harness', 'vibe')).members[1].model, '');
});

test('Council focus after an eligibility change never lands on a disabled or missing control', () => {
  let dom;
  const hf = loadDesignRuntime({ querySelectorOverride: selector => dom?.find(selector) });
  dom = councilFocusDom(hf);
  // Collapsed: focus goes to the card toggle.
  let editor = councilRoute(hf, 'council-too-few');
  editor.councilRemove('m1');
  dom.focused.length = 0;
  let snap = editor.councilSet('m2', 'optional', false);
  assert.equal(councilFields(snap).facilitator, 'm2', 'the member became the facilitator, so its checkbox is disabled');
  assert.deepEqual(dom.focused, ['[data-action="editor-council-toggle:m2"]']);
  // Expanded: focus goes to the Name input.
  editor = councilRoute(hf, 'council-too-few');
  editor.councilRemove('m1');
  editor.councilToggle('m2');
  dom.focused.length = 0;
  editor.councilSet('m2', 'optional', false);
  assert.deepEqual(dom.focused, ['#council-name-m2']);
  // A control that stays enabled keeps focus.
  editor = councilRoute(hf, 'council-config');
  editor.councilToggle('m3');
  dom.focused.length = 0;
  editor.councilSet('m3', 'optional', false);
  assert.deepEqual(dom.focused, ['[data-council-member="m3"][data-council-field="optional"]']);
  // The stub itself rejects disabled and missing targets.
  councilRoute(hf, 'council-config');
  assert.equal(dom.find('.editor-app [data-council-member="m1"][data-council-field="optional"]').disabled, true);
  assert.equal(dom.find('.editor-app #council-name-nope'), undefined);
  assert.throws(() => dom.find('.editor-app [data-council-member="m1"][data-council-field="optional"]').focus(), /disabled control/);
});

test('an added Council node has the seeded node’s dimensions', () => {
  const hf = loadDesignRuntime();
  const editor = councilRoute(hf, 'council-config');
  assert.deepEqual(JSON.parse(JSON.stringify(hf.councilNodeSize)), { width: 240, height: 108 });
  const nodes = () => editor.snapshot().draft.nodes;
  const seeded = nodes().find(node => node.id === 'council');
  assert.deepEqual([seeded.width, seeded.height], [240, 108]);
  const snap = editor.addNode('council');
  const added = nodes().find(node => node.id === snap.selected.id);
  assert.notEqual(added.id, 'council');
  assert.deepEqual([added.width, added.height], [seeded.width, seeded.height]);
  const other = editor.addNode('planning'), plain = nodes().find(node => node.id === other.selected.id);
  assert.notEqual(plain.height, seeded.height, 'other node kinds keep their own size');
});

test('Council Add member is the pill button and the collapsed summary sits on the title line', () => {
  const hf = loadDesignRuntime();
  councilRoute(hf, 'council-config');
  const html = hf.renderEditor('council-config');
  assert.match(html, /<button type="button" class="editor-inspector-secondary editor-council-add" data-action="editor-council-add">/);
  const css = fs.readFileSync(path.join(root, 'styles/workflow-editor-proposals.css'), 'utf8');
  const rule = css.split('\n').find(line => /\.editor-council-add \{/.test(line));
  assert.match(rule, /border-radius: 9999px/, 'the pill radius');
  assert.match(css, /\.editor-council-add:hover \{ background: var\(--pillFill\)/);
  const card = html.match(/<button[^>]*data-council-card="m2"[\s\S]*?<\/button>/)[0];
  const line = /<span class="editor-council-line">([\s\S]*?)<\/span><span class="editor-council-excerpt/.exec(card)[1];
  assert.match(line, /^<span class="editor-council-title[^"]*" data-council-title>Frontend<\/span>/, 'title first');
  assert.match(line, /<span class="editor-council-harness"><span class="backend-dot codex" aria-hidden="true"><\/span><span class="editor-council-harness-text">Codex · Default · Medium<\/span><\/span>$/, 'harness summary ends the title line');
  assert.ok(card.indexOf('editor-council-harness') < card.indexOf('editor-council-excerpt'), 'the excerpt is on its own line below');
  assert.match(css, /\.editor-council-line \{[^}]*flex-wrap: nowrap/);
});

test('Council document input and change listeners edit the draft and gate Save', () => {
  const hf = loadDesignRuntime({ captureEvents: true });
  const editor = councilRoute(hf, 'council-config');
  const app = { querySelector: () => null, querySelectorAll: () => [] };
  const control = dataset => {
    const el = { id: '', dataset, value: '', checked: false, matches: () => false, closest: selector => selector === '[data-council-field]' ? el : selector === '.editor-app' ? app : null };
    return el;
  };
  const fire = (type, el) => hf.__dispatchDesignEvent({ type, target: el, preventDefault() {}, stopImmediatePropagation() {} });
  let name = control({ councilMember: 'm2', councilField: 'name' });
  name.value = 'Frontend lead'; fire('input', name);
  let snap = editor.snapshot();
  assert.equal(councilFields(snap).members[1].name, 'Frontend lead');
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun], [true, true, false]);
  name.value = ''; fire('input', name);
  snap = editor.snapshot();
  assert.equal(councilFields(snap).members[1].name, '', 'the invalid edit is kept');
  assert.deepEqual([snap.dirty, snap.canSave, snap.canRun], [true, false, false], 'Save is disabled while a name is blank');
  const question = control({ councilMember: undefined, councilField: 'question' });
  name.value = 'Frontend'; fire('input', name);
  question.value = '  '; fire('input', question);
  assert.equal(editor.snapshot().canSave, false, 'a blank question also blocks Save');
  question.value = 'New question'; fire('input', question);
  assert.equal(councilFields(editor.snapshot()).question, 'New question');
  // change events: the Optional checkbox and the harness select.
  const optional = control({ councilMember: 'm3', councilField: 'optional' });
  optional.checked = false; fire('change', optional);
  assert.equal(councilFields(editor.snapshot()).members[2].optional, false);
  const harness = control({ councilMember: 'm2', councilField: 'harness' });
  harness.value = 'vibe'; fire('change', harness);
  assert.equal(councilFields(editor.snapshot()).members[1].harness, 'vibe');
  // Controls outside the editor are ignored.
  const outside = control({ councilMember: 'm1', councilField: 'name' });
  outside.closest = selector => selector === '[data-council-field]' ? outside : null;
  outside.value = 'Ignored'; fire('input', outside);
  assert.equal(councilFields(editor.snapshot()).members[0].name, 'Architect');
});

const setupRoute = (hf, route) => { hf.route = { theme: 'light', screen: 'workflow-editor', state: route }; hf.editorController.reset(route); return hf.editorController; };
const setupFields = (editor, kind) => { const { id, title, ...fields } = JSON.parse(JSON.stringify(editor.snapshot().draft.fieldValues[`${kind}:${kind}`] || {})); return fields; };
// A fake control that satisfies the document-level setup listeners.
const setupHarness = () => {
  const app = { querySelector: () => null, querySelectorAll: () => [] };
  const hf = loadDesignRuntime({ captureEvents: true });
  const control = props => { const el = { id: '', type: 'text', value: '', checked: false, disabled: false, dataset: {}, matches: selector => (props.matchSelectors || []).includes(selector), ...props, closest: selector => (props.closestSelectors || {})[selector] === undefined ? (selector === '.editor-app' ? app : null) : (props.closestSelectors[selector] ? el : null) }; return el; };
  const fire = (type, target, extra = {}) => hf.__dispatchDesignEvent({ type, target, key: extra.key, preventDefault() {}, stopImmediatePropagation() {} });
  const click = action => { const target = control({ dataset: { action }, closestSelectors: { '[data-action^="su-"]': true } }); fire('click', target); return target; };
  const text = (field, value) => { const target = control({ dataset: { setupField: field }, value, matchSelectors: ['textarea'], closestSelectors: { 'textarea[data-setup-field]': true, '[data-setup-field]': true } }); fire('input', target); return target; };
  const change = (field, props) => { const target = control({ dataset: { setupField: field }, closestSelectors: { '[data-setup-field]': true, 'textarea[data-setup-field]': false }, ...props }); fire('change', target); return target; };
  const key = (name, field) => { const target = control({ dataset: { setupSpin: field }, closestSelectors: { '[data-setup-spin]': true } }); fire('keydown', target, { key: name }); };
  return { hf, click, text, change, key, fire, control };
};
const setupTerminalLabel = (html, node) => (new RegExp(`data-node-id="${node}"[^>]*aria-label="([^"]*)"`).exec(html) || [])[1];

test('setup and teardown proposal markup appears only in its four states', () => {
  const hf = loadDesignRuntime();
  const marker = /data-setup-inspector|editor-setup|data-setup-field|data-setup-spin|su-up:|su-vars:/;
  const launch = /su-review|su-code|data-su-reviewed|data-su-repo|su-footer/;
  for (const family of hf.screens) for (const state of family.states) {
    hf.route = { theme: 'light', screen: family.id, state };
    if (family.id === 'workflow-run') hf.resetWorkflowRun(hf.route);
    if (family.id === 'workflow-editor') hf.editorController.reset(state);
    const html = renderers[family.id](hf, state);
    assert.equal(marker.test(html), family.id === 'workflow-editor' && hf.setupRoutes.includes(state), `${family.id}/${state} editor setup markup`);
    assert.equal(launch.test(html), family.id === 'workflow-launch' && state === 'setup-review', `${family.id}/${state} sheet setup markup`);
  }
  hf.editorController.reset('saved');
  assert.deepEqual(Array.from(hf.setupRoutes), ['start-setup', 'start-new-folder', 'end-teardown']);
  for (const route of hf.setupRoutes) assert.ok(hf.editorProposalRoutes.includes(route));
});

test('setup and teardown states are registered with labels that pass isTicketRef', () => {
  const hf = loadDesignRuntime();
  for (const [family, state] of [['workflow-editor', 'start-setup'], ['workflow-editor', 'start-new-folder'], ['workflow-editor', 'end-teardown'], ['workflow-launch', 'setup-review']]) {
    const status = hf.specimenStatus(family, state);
    assert.equal(status.kind, 'exploratory', state);
    assert.deepEqual(Array.from(status.tickets), ['#21', 'HarflowMCP#41']);
    assert.ok(Array.from(status.tickets).every(ref => hf.isTicketRef(ref)));
    assert.match(status.caption, /^Exploratory · .*#21.*HarflowMCP#41.* · Not approved/);
  }
  assert.ok(hf.screens.find(screen => screen.id === 'workflow-launch').states.includes('setup-review'));
  assert.equal(hf.isTicketRef('HarflowMCP#41'), true);
  assert.equal(hf.isTicketRef('41'), false);
});

test('start-setup, start-new-folder and end-teardown render their own copy and state', () => {
  const hf = loadDesignRuntime();
  let editor = setupRoute(hf, 'start-setup');
  let html = hf.renderEditor('start-setup');
  assert.match(html, /data-setup-inspector="start"/);
  assert.match(html, /<h2>Start<\/h2>/);
  const plain = html.replace(/&#39;/g, "'");
  for (const text of ['Runs once before the first node and decides where every node works.', 'Run a setup command', 'Off: nodes run in the launch folder. On: the command creates a folder at', '$HARFLOW_WORKSPACE', 'Setup command', 'Variables (6)', "Runs with Harflow's own access", "Harness permissions don't apply to this command. You review it each time you start the workflow yourself."]) assert.ok(plain.includes(text), text);
  assert.match(html, /<input type="checkbox" data-setup-field="setupEnabled" checked>/);
  assert.match(html, /git -C &quot;\$HARFLOW_LAUNCH_DIR&quot; fetch origin/);
  assert.match(html, /aria-valuenow="5"[^>]*aria-valuetext="5 minutes"/);
  assert.match(html, /is the folder chosen when the run starts\. Inputs arrive only as variables\. Harflow never inserts them into the command text\./);
  assert.doesNotMatch(html, /Run when|Teardown/);
  let snap = editor.snapshot();
  assert.equal(snap.selected.kind, 'start');
  assert.equal(snap.dirty, true, 'start-setup holds an unsaved edit over a saved baseline');
  assert.notEqual(snap.baseline.fieldValues['start:start'].setupEnabled, true, 'the saved baseline has setup off');

  editor = setupRoute(hf, 'start-new-folder');
  html = hf.renderEditor('start-new-folder');
  assert.match(html, /mkdir -p &quot;\$HARFLOW_WORKSPACE&quot;/);
  assert.match(html, /cp -R ~\/templates\/ios-sample\/\. &quot;\$HARFLOW_WORKSPACE&quot;/);
  assert.match(html, /aria-valuenow="1"[^>]*aria-valuetext="1 minute"/, 'singular minute');
  assert.match(html, /Variables \(4\)/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /class="editor-setup-pill"/, 'collapsed: no pills');
  assert.match(html, /<div id="su-variables" class="editor-setup-pills" hidden><\/div>/);
  assert.equal(editor.snapshot().dirty, false);

  editor = setupRoute(hf, 'end-teardown');
  html = hf.renderEditor('end-teardown');
  assert.match(html, /data-setup-inspector="end"/);
  assert.match(html, /<h2>End<\/h2>/);
  assert.match(html, /Runs once after the workflow run finishes\. Choose when below\./, 'S7 wording');
  assert.doesNotMatch(html, /even when it fails or is cancelled/);
  assert.match(html, /Adds <span class="editor-setup-mono">HARFLOW_RUN_OUTCOME<\/span>: completed, failed or cancelled\. The branch stays, so an open pull request keeps working\./, 'T1 wording');
  assert.doesNotMatch(html, /succeeded or failed|succeeded,/);
  assert.match(html, /Run a teardown command/);
  assert.match(html, /<option value="success" selected>The run succeeds<\/option><option value="always" >Always<\/option>/);
  assert.match(html, /If Harflow stops during teardown, the run shows &quot;Teardown pending&quot; until you run it from recovery\.|If Harflow stops during teardown, the run shows "Teardown pending" until you run it from recovery\./);
  assert.match(html, /A failed teardown is recorded but never changes the run/);
  assert.match(html, /git -C &quot;\$HARFLOW_LAUNCH_DIR&quot; worktree remove/);
  assert.match(html, /Variables \(7\)/);
  assert.equal(editor.snapshot().selected.kind, 'end');
  assert.equal(editor.snapshot().dirty, false);
});

test('setup routes use the proposal revision and reset deterministically', () => {
  const hf = loadDesignRuntime();
  for (const route of hf.setupRoutes) assert.equal(setupRoute(hf, route).snapshot().draft.revision, 3, `${route} uses the proposal revision`);
  assert.notEqual(setupRoute(hf, 'saved').snapshot().draft.revision, 3);
  const first = hf.setupRoutes.map(route => { const editor = setupRoute(hf, route); return hf.renderEditor(route) + JSON.stringify(editor.snapshot().draft.fieldValues); });
  const editor = setupRoute(hf, 'end-teardown');
  editor.patchFields('end:end', { teardownTimeoutMinutes: 9, teardownCommand: 'x' }, true);
  hf.setupToggleVariables('end');
  const second = hf.setupRoutes.map(route => { const e = setupRoute(hf, route); return hf.renderEditor(route) + JSON.stringify(e.snapshot().draft.fieldValues); });
  assert.deepEqual(second, first, 'a mutated session resets to the same output');
  assert.deepEqual(JSON.parse(JSON.stringify(hf.setupUi())), { open: {} }, 'end-teardown starts with every disclosure closed');
  assert.deepEqual(JSON.parse(JSON.stringify(setupRoute(hf, 'start-setup') && hf.setupUi())), { open: { start: true } });
});

test('setup and teardown fields bind through the document listeners and Discard restores them together', () => {
  const { hf, text, change, click } = setupHarness();
  let editor = setupRoute(hf, 'end-teardown');
  hf.renderEditor('end-teardown');
  const original = setupFields(editor, 'end');
  assert.deepEqual(original, { teardownEnabled: true, teardownCommand: hf.setupFixture.commands.teardown, teardownTimeoutMinutes: 2, runWhen: 'success' });
  text('teardownCommand', 'echo done');
  assert.equal(setupFields(editor, 'end').teardownCommand, 'echo done');
  assert.equal(editor.snapshot().dirty, true);
  change('runWhen', { value: 'always', type: 'select-one' });
  assert.equal(setupFields(editor, 'end').runWhen, 'always');
  click('su-up:teardownTimeoutMinutes');
  assert.equal(setupFields(editor, 'end').teardownTimeoutMinutes, 3);
  change('teardownEnabled', { type: 'checkbox', checked: false });
  assert.equal(setupFields(editor, 'end').teardownEnabled, false);
  assert.equal(editor.snapshot().canSave, true);
  assert.equal(editor.snapshot().canRun, false);
  assert.equal(setupTerminalLabel(hf.renderEditor('end-teardown'), 'end'), 'Select End', 'the indicator goes away with the checkbox');
  const snap = editor.discard();
  assert.deepEqual(setupFields(editor, 'end'), original, 'checkbox, timeout, Run when and command are restored together');
  assert.equal(snap.dirty, false);
  assert.match(hf.renderEditor('end-teardown'), /data-setup-field="teardownEnabled" checked/);

  // start-setup: the unsaved edit over the baseline is discarded as a whole.
  editor = setupRoute(hf, 'start-setup');
  hf.renderEditor('start-setup');
  assert.equal(setupFields(editor, 'start').setupEnabled, true);
  text('setupCommand', 'echo hi');
  editor.discard();
  const start = setupFields(editor, 'start');
  assert.equal(start.setupEnabled === true, false);
  assert.ok(!start.setupCommand);
  assert.match(hf.renderEditor('start-setup'), /data-setup-field="setupEnabled" >/);
});

test('setup fields survive deleting another node and a disabled command keeps its values', () => {
  const { hf, change } = setupHarness();
  const editor = setupRoute(hf, 'end-teardown');
  hf.renderEditor('end-teardown');
  const before = setupFields(editor, 'end');
  editor.select('node', 'planning');
  editor.removeSelected();
  assert.ok(!editor.snapshot().draft.nodes.some(node => node.id === 'planning'));
  assert.deepEqual(setupFields(editor, 'end'), before, 'end fields survive');
  const start = setupRoute(hf, 'start-setup');
  const startBefore = setupFields(start, 'start');
  start.select('node', 'planning');
  start.removeSelected();
  assert.deepEqual(setupFields(start, 'start'), startBefore, 'start fields survive');
  // Unchecking disables the controls and keeps the values.
  setupRoute(hf, 'end-teardown'); hf.renderEditor('end-teardown');
  change('teardownEnabled', { type: 'checkbox', checked: false });
  const html = hf.renderEditor('end-teardown');
  assert.match(html, /<textarea[^>]*data-setup-field="teardownCommand"[^>]*disabled>git -C/);
  assert.match(html, /<select data-setup-field="runWhen"[^>]*disabled>/);
  assert.match(html, /data-action="su-up:teardownTimeoutMinutes"[^>]*disabled/);
  assert.match(html, /data-action="su-down:teardownTimeoutMinutes"[^>]*disabled/);
  assert.match(html, /role="spinbutton" tabindex="-1"[^>]*aria-valuenow="2"[^>]*aria-disabled="true"/);
  const kept = setupFields(hf.editorController, 'end');
  assert.equal(kept.teardownEnabled, false);
  assert.equal(kept.teardownTimeoutMinutes, 2);
  assert.equal(kept.teardownCommand, hf.setupFixture.commands.teardown);
  assert.equal(kept.runWhen, 'success');
  // Re-checking restores an enabled form with the same values.
  change('teardownEnabled', { type: 'checkbox', checked: true });
  assert.doesNotMatch(hf.renderEditor('end-teardown'), /data-setup-field="teardownCommand"[^>]*disabled/);
});

test('setup timeout is an accessible spinbutton with proposal bounds and clamping', () => {
  const { hf, click, key } = setupHarness();
  assert.deepEqual(JSON.parse(JSON.stringify(hf.setupBounds)), { start: { min: 1, max: 60 }, end: { min: 1, max: 30 } });
  assert.equal(hf.setupClamp('start', 0), 1);
  assert.equal(hf.setupClamp('start', 99), 60);
  assert.equal(hf.setupClamp('end', 99), 30);
  assert.equal(hf.setupClamp('end', -4), 1);
  assert.equal(hf.setupClamp('start', 2.6), 3);
  assert.equal(hf.setupClamp('start', 'abc'), 1);
  assert.equal(hf.setupMinutesText(1), '1 minute');
  assert.equal(hf.setupMinutesText(5), '5 minutes');
  let editor = setupRoute(hf, 'start-setup');
  let html = hf.renderEditor('start-setup');
  assert.match(html, /role="spinbutton" tabindex="0" data-setup-spin="setupTimeoutMinutes" aria-labelledby="su-timeout-label" aria-valuenow="5" aria-valuemin="1" aria-valuemax="60" aria-valuetext="5 minutes"/);
  assert.match(html, /id="su-timeout-label">Timeout</);
  assert.match(html, /aria-label="Increase timeout"/);
  assert.match(html, /aria-label="Decrease timeout"/);
  key('End', 'setupTimeoutMinutes');
  assert.equal(setupFields(editor, 'start').setupTimeoutMinutes, 60);
  click('su-up:setupTimeoutMinutes');
  assert.equal(setupFields(editor, 'start').setupTimeoutMinutes, 60, 'clamped at the maximum');
  key('Home', 'setupTimeoutMinutes');
  assert.equal(setupFields(editor, 'start').setupTimeoutMinutes, 1);
  click('su-down:setupTimeoutMinutes');
  assert.equal(setupFields(editor, 'start').setupTimeoutMinutes, 1, 'clamped at the minimum');
  key('ArrowUp', 'setupTimeoutMinutes'); key('PageUp', 'setupTimeoutMinutes');
  assert.equal(setupFields(editor, 'start').setupTimeoutMinutes, 7);
  key('PageDown', 'setupTimeoutMinutes'); key('ArrowDown', 'setupTimeoutMinutes');
  assert.equal(setupFields(editor, 'start').setupTimeoutMinutes, 1);
  html = hf.renderEditor('start-setup');
  assert.match(html, /aria-valuenow="1"[^>]*aria-valuetext="1 minute"/);
  editor = setupRoute(hf, 'end-teardown');
  hf.renderEditor('end-teardown');
  key('End', 'teardownTimeoutMinutes');
  assert.equal(setupFields(editor, 'end').teardownTimeoutMinutes, 30);
  assert.match(hf.renderEditor('end-teardown'), /aria-valuemin="1" aria-valuemax="30"/);
  click('su-up:teardownTimeoutMinutes');
  assert.equal(setupFields(editor, 'end').teardownTimeoutMinutes, 30);
  // A disabled form ignores the steppers.
  editor.patchFields('end:end', { teardownEnabled: false }, true);
  key('Home', 'teardownTimeoutMinutes');
  assert.equal(setupFields(editor, 'end').teardownTimeoutMinutes, 30);
});

test('setup Variables disclosure toggles aria-expanded and counts without dirtying the draft', () => {
  const { hf, click } = setupHarness();
  const counts = { 'start-setup': ['start', 6], 'start-new-folder': ['start', 4], 'end-teardown': ['end', 7] };
  for (const [route, [kind, count]] of Object.entries(counts)) {
    const editor = setupRoute(hf, route);
    const dirty = editor.snapshot().dirty, fieldsBefore = JSON.stringify(editor.snapshot().draft.fieldValues);
    const names = hf.setupVariables(kind, route);
    assert.equal(names.length, count, route);
    assert.equal(new Set(names).size, count);
    let html = hf.renderEditor(route);
    const startsOpen = route === 'start-setup';
    assert.ok(html.includes(`aria-expanded="${startsOpen}" aria-controls="su-variables"`), `${route} initial state`);
    assert.equal((html.match(/class="editor-setup-pill"/g) || []).length, startsOpen ? count : 0);
    assert.ok(html.includes(`Variables (${count})`));
    click(`su-vars:${kind}`);
    html = hf.renderEditor(route);
    assert.ok(html.includes(`aria-expanded="${!startsOpen}" aria-controls="su-variables"`), `${route} toggled`);
    assert.equal((html.match(/class="editor-setup-pill"/g) || []).length, startsOpen ? 0 : count);
    assert.equal(editor.snapshot().dirty, dirty, `${route} toggling never dirties the draft`);
    assert.equal(JSON.stringify(editor.snapshot().draft.fieldValues), fieldsBefore);
    click(`su-vars:${kind}`);
    assert.ok(hf.renderEditor(route).includes(`aria-expanded="${startsOpen}"`));
  }
  setupRoute(hf, 'end-teardown'); click('su-vars:end');
  const open = hf.renderEditor('end-teardown');
  for (const name of ['HARFLOW_LAUNCH_DIR', 'HARFLOW_WORKSPACE', 'HARFLOW_RUN_ID', 'HARFLOW_WORKFLOW_NAME', 'HARFLOW_INPUT_BASE', 'HARFLOW_INPUT_ISSUE', 'HARFLOW_RUN_OUTCOME']) assert.ok(open.includes(`<span class="editor-setup-pill">${name}</span>`), name);
  setupRoute(hf, 'end-teardown');
  assert.equal(hf.setupUi().open.end, undefined, 're-entry closes the disclosure');
});

test('Start and End nodes show a setup indicator exposed in their accessible name', () => {
  const hf = loadDesignRuntime();
  assert.deepEqual(JSON.parse(JSON.stringify(hf.setupIndicator('start', { setupEnabled: true }))), { label: ', setup command on' });
  assert.deepEqual(JSON.parse(JSON.stringify(hf.setupIndicator('end', { teardownEnabled: true }))), { label: ', teardown command on' });
  for (const [type, fields] of [['start', { setupEnabled: false }], ['start', {}], ['start', undefined], ['end', { teardownEnabled: false }], ['start', { teardownEnabled: true }], ['end', { setupEnabled: true }], ['agent', { setupEnabled: true }]]) assert.equal(hf.setupIndicator(type, fields), null, `${type} ${JSON.stringify(fields)}`);
  setupRoute(hf, 'start-setup');
  let html = hf.renderEditor('start-setup');
  assert.equal(setupTerminalLabel(html, 'start'), 'Select Start, setup command on');
  assert.equal(setupTerminalLabel(html, 'end'), 'Select End');
  assert.equal((html.match(/editor-setup-dot/g) || []).length, 1);
  setupRoute(hf, 'end-teardown');
  html = hf.renderEditor('end-teardown');
  assert.equal(setupTerminalLabel(html, 'end'), 'Select End, teardown command on');
  assert.equal(setupTerminalLabel(html, 'start'), 'Select Start');
  setupRoute(hf, 'start-new-folder');
  assert.equal(setupTerminalLabel(hf.renderEditor('start-new-folder'), 'start'), 'Select Start, setup command on');
  setupRoute(hf, 'saved');
  html = hf.renderEditor('saved');
  assert.doesNotMatch(html, /editor-setup-dot|command on/);
  // Turning the command off removes the indicator.
  const editor = setupRoute(hf, 'end-teardown');
  editor.patchFields('end:end', { teardownEnabled: false }, true);
  assert.equal(setupTerminalLabel(hf.renderEditor('end-teardown'), 'end'), 'Select End');
});

test('non-proposal Start and End inspectors keep their source-derived copy', () => {
  const hf = loadDesignRuntime();
  const editor = setupRoute(hf, 'saved');
  editor.select('start', 'start');
  let html = hf.renderEditor('saved');
  assert.match(html, /Start has no settings\./);
  assert.doesNotMatch(html, /data-setup-inspector|Run a setup command/);
  editor.select('end', 'end');
  html = hf.renderEditor('saved');
  assert.match(html, /End has no settings\./);
  assert.doesNotMatch(html, /data-setup-inspector|Run a teardown command/);
});

test('the setup-review sheet gates Run on review and a Repository edit asks again', () => {
  const run = { disabled: true }, box = { checked: false }, caption = { textContent: '' };
  const elements = { '[data-action="launch-workflow"]': run, '[data-su-reviewed]': box, '[data-su-launch-dir]': caption };
  const hf = loadDesignRuntime({ captureEvents: true, querySelectorOverride: selector => elements[selector] });
  hf.route = { theme: 'light', screen: 'workflow-launch', state: 'setup-review' };
  hf.resetLaunchProposals();
  const html = hf.renderLaunch('setup-review');
  assert.match(html, /Run workflow/);
  assert.match(html, /Development workflow · Revision 4/);
  assert.match(html, /Fix APP-2481: crash when opening a listing with no photos/);
  assert.match(html, /Commands this run will execute/);
  assert.match(html, /Harflow&#39;s own access|Harflow's own access/);
  assert.match(html, /Setup · before the first node · timeout 5 min/);
  assert.match(html, /Teardown · when the run succeeds · timeout 2 min/);
  assert.match(html, /Launch folder: <span class="su-mono" data-su-launch-dir>~\/repos\/app<\/span> · Workspace: <span class="su-mono">~\/Harflow\/Workspaces\/&lt;run id&gt;<\/span>/);
  assert.match(html, /<input type="checkbox" id="su-reviewed" data-su-reviewed >/);
  assert.match(html, /<button type="button" class="primary" data-action="launch-workflow" disabled>Run<\/button>/);
  assert.match(html, /Run stays disabled until the commands are reviewed\. Changing them asks again\./);
  assert.match(html, /Access level/);
  assert.match(html, /Orchestrator/);
  // Catalog hook: disabled until reviewed, other states unaffected, busy stays disabled in the catalog expression.
  assert.equal(hf.launchRunDisabled('setup-review'), true);
  for (const state of ['launch', 'busy', 'validation', 'library']) assert.equal(!!hf.launchRunDisabled(state), false, state);
  // Run the catalog render's own disable step (extracted from catalog.js, which needs the full page to load) against stub buttons.
  const statement = /document\.querySelectorAll\('\[data-action="launch-workflow"\]'\)\.forEach\([^;]*\);/.exec(fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8'))?.[0];
  assert.ok(statement, 'the catalog disable step exists');
  const catalogDisabled = state => { const button = { disabled: null }; new Function('document', 'HF', 'state', statement)({ querySelectorAll: selector => selector === '[data-action="launch-workflow"]' ? [button] : [] }, hf, state); return button.disabled; };
  assert.equal(catalogDisabled('setup-review'), true, 'unreviewed');
  assert.equal(catalogDisabled('launch'), false);
  assert.equal(catalogDisabled('busy'), true, 'busy stays disabled');
  assert.equal(catalogDisabled('validation'), false);
  const fire = (type, target) => hf.__dispatchDesignEvent({ type, target, preventDefault() {}, stopImmediatePropagation() {} });
  const reviewed = checked => ({ checked, closest: () => null, matches: selector => selector === '[data-su-reviewed]' });
  fire('change', reviewed(true));
  assert.equal(hf.launchRunDisabled('setup-review'), false);
  assert.equal(run.disabled, false, 'Run is enabled once reviewed');
  assert.equal(catalogDisabled('setup-review'), false, 'the catalog step enables Run once reviewed');
  assert.equal(catalogDisabled('busy'), true);
  assert.match(hf.renderLaunch('setup-review'), /data-su-reviewed checked>/);
  assert.match(hf.renderLaunch('setup-review'), /data-action="launch-workflow" >Run/);
  fire('change', reviewed(false));
  assert.equal(hf.launchRunDisabled('setup-review'), true);
  assert.equal(run.disabled, true, 'unchecking disables Run again');
  // A Repository edit clears the review, disables Run and updates the Launch folder caption.
  fire('change', reviewed(true)); box.checked = true;
  fire('input', { value: '~/repos/other', closest: () => null, matches: selector => selector === '[data-su-repo]' });
  assert.equal(hf.launchRunDisabled('setup-review'), true);
  assert.equal(run.disabled, true);
  assert.equal(box.checked, false, 'the review checkbox is cleared');
  assert.equal(caption.textContent, '~/repos/other');
  assert.match(hf.renderLaunch('setup-review'), /data-su-launch-dir>~\/repos\/other</);
  assert.match(hf.renderLaunch('setup-review'), /id="launch-repo" data-su-repo value="~\/repos\/other"/);
  // Events from other states are ignored.
  fire('change', reviewed(true));
  hf.route = { theme: 'light', screen: 'workflow-launch', state: 'launch' };
  fire('change', reviewed(true));
  hf.route = { theme: 'light', screen: 'workflow-launch', state: 'setup-review' };
  // Re-entry resets the review and the repository.
  fire('change', reviewed(true));
  assert.equal(hf.launchRunDisabled('setup-review'), false);
  hf.resetLaunchProposals();
  assert.equal(hf.launchRunDisabled('setup-review'), true, 'reset on re-entry');
  assert.match(hf.renderLaunch('setup-review'), /data-su-launch-dir>~\/repos\/app</);
  // Other launch states do not show the review.
  assert.doesNotMatch(hf.renderLaunch('launch'), /su-review|data-su-reviewed/);
});

test('setup-review keeps the review across an appearance change', () => {
  const run = { disabled: true }, box = { checked: false };
  const hf = loadDesignRuntime({ captureEvents: true, querySelectorOverride: selector => ({ '[data-action="launch-workflow"]': run, '[data-su-reviewed]': box })[selector] });
  hf.route = { theme: 'light', screen: 'workflow-launch', state: 'setup-review' };
  hf.resetLaunchProposals();
  hf.__dispatchDesignEvent({ type: 'change', target: { checked: true, closest: () => null, matches: s => s === '[data-su-reviewed]' }, preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(hf.launchRunDisabled('setup-review'), false);
  // Drive the real appearance controller; it publishes the theme without re-rendering the page.
  const root = { dataset: {} }, writes = [];
  const controller = hf.createAppearanceController({ storage: { getItem: () => null, setItem: (key, value) => writes.push([key, value]) }, matchMedia: () => ({ matches: false, addEventListener() {} }), document: { documentElement: root, querySelectorAll: () => [], querySelector: () => null }, location: { hash: '#workflow-launch/setup-review/system' }, history: { replaceState() {} } });
  controller.setPreview('dark');
  assert.equal(root.dataset.theme, 'dark');
  controller.setPreference('light');
  assert.equal(hf.appearance, controller);
  assert.equal(hf.launchRunDisabled('setup-review'), false, 'the review survives the appearance change');
  assert.equal(run.disabled, false);
  assert.match(hf.renderLaunch('setup-review'), /data-su-reviewed checked>/);
  assert.match(hf.renderLaunch('setup-review'), /data-action="launch-workflow" >Run/);
});

test('setup and teardown commands are escaped in the editor and the sheet', () => {
  const hf = loadDesignRuntime({ captureEvents: true, querySelectorOverride: () => undefined });
  const nasty = 'echo "<b>x</b> & done" > "$HARFLOW_WORKSPACE/a<b>.txt"';
  const saved = { ...hf.setupFixture.commands };
  try {
    Object.assign(hf.setupFixture.commands, { worktree: nasty, teardown: nasty, newFolder: nasty });
    const escaped = 'echo &quot;&lt;b&gt;x&lt;/b&gt; &amp; done&quot;';
    for (const route of hf.setupRoutes) {
      setupRoute(hf, route);
      const html = hf.renderEditor(route);
      assert.ok(html.includes(escaped), `${route} editor textarea is escaped`);
      assert.doesNotMatch(html, /<b>x<\/b>/, route);
    }
    hf.route = { theme: 'light', screen: 'workflow-launch', state: 'setup-review' };
    hf.resetLaunchProposals();
    const sheet = hf.renderLaunch('setup-review');
    assert.ok(sheet.includes(escaped), 'sheet commands are escaped');
    assert.doesNotMatch(sheet, /<b>x<\/b>/);
    assert.equal((sheet.match(/&lt;b&gt;x&lt;\/b&gt;/g) || []).length, 2, 'setup and teardown');
    // The Repository value is escaped too.
    hf.__dispatchDesignEvent({ type: 'input', target: { value: '~/a"<&', closest: () => null, matches: s => s === '[data-su-repo]' }, preventDefault() {}, stopImmediatePropagation() {} });
    const after = hf.renderLaunch('setup-review');
    assert.ok(after.includes('value="~/a&quot;&lt;&amp;"'));
    assert.ok(after.includes('data-su-launch-dir>~/a&quot;&lt;&amp;<'));
  } finally {
    Object.assign(hf.setupFixture.commands, saved);
  }
  assert.equal(hf.setupFixture.commands.worktree, saved.worktree, 'the fixture is restored');
  setupRoute(hf, 'start-setup');
  assert.doesNotMatch(hf.renderEditor('start-setup'), /&lt;b&gt;/);
});

// Resolves a focus selector against rendered HTML. Descendant parts are matched in document order, and a disabled or
// missing target is rejected, mirroring what a browser would refuse to focus.
const focusResolver = (getHtml, focused) => selector => {
  const tags = [...getHtml().matchAll(/<[a-z][a-z0-9]*\b[^>]*>/g)];
  let from = 0, found = null;
  for (const part of selector.trim().split(/\s+(?=\[)/)) {
    const wanted = [...part.matchAll(/\[([\w-]+)="([^"]*)"\]/g)].map(match => `${match[1]}="${match[2]}"`);
    const index = tags.findIndex((tag, i) => i >= from && wanted.length && wanted.every(attribute => tag[0].includes(attribute)));
    if (index < 0) return undefined;
    found = tags[index][0]; from = index;
  }
  if (!found || /\sdisabled(?=[\s>=])/.test(found)) return undefined;
  return { focus: () => focused.push(selector) };
};
const setupRunHarness = ({ timers } = {}) => {
  const focused = [];
  const resolve = focusResolver(() => stage.innerHTML, focused);
  const stage = { innerHTML: '', querySelector: selector => /^\[data-action="[^"]+"\]$/.test(selector) ? resolve(selector) : null };
  const announcement = { textContent: '', classList: { add() {}, remove() {} } };
  const hf = loadDesignRuntime({ captureEvents: true, timers, querySelectorOverride: selector => selector === '#stage' ? stage : selector === '#announcement' ? announcement : undefined });
  const start = state => { hf.route = { theme: 'light', screen: 'workflow-run', state: 'running' }; hf.resetWorkflowRun(hf.route); hf.route = { theme: 'light', screen: 'workflow-run', state }; hf.resetWorkflowRun(hf.route); return hf.renderRun(state); };
  const click = action => { const target = { dataset: { action }, isConnected: true, closest: selector => selector.startsWith('[data-action^="wr-"') ? target : null }; hf.__dispatchDesignEvent({ type: 'click', target, preventDefault() {}, stopImmediatePropagation() {} }); return stage.innerHTML; };
  return { hf, stage, announcement, start, click, focused };
};
const runToolbar = html => html.slice(html.indexOf('wfr-toolbar'), html.indexOf('wfr-run-layout'));
const runActions = html => Array.from(runToolbar(html).matchAll(/data-action="([^"]+)"/g), match => match[1]);
const runText = html => html.replace(/<svg.*?<\/svg>/g, '').replace(/<[^>]+>/g, '|').replace(/&#39;/g, "'").replace(/\|+/g, '|');

test('setup run states set the header badge, elapsed time, controls and summary', () => {
  const { hf, start } = setupRunHarness();
  assert.deepEqual(Array.from(hf.setupRunStates), ['setup-running', 'setup-failed', 'teardown-pending']);
  const expected = {
    'setup-running': { badge: 'Starting', elapsed: '00:07', actions: ['wr-mode:graph', 'wr-cancel'], summary: 'Preparing the workspace', cls: 'starting' },
    'setup-failed': { badge: 'Failed', elapsed: '00:03', actions: ['wr-mode:graph', 'wr-run-again'], summary: 'Setup failed before the first node: invalid reference origin/release-9.', cls: 'failed' },
    'teardown-pending': { badge: 'Completed', elapsed: '21:04', actions: ['wr-open-end', 'wr-mode:graph', 'wr-mode:parallel', 'wr-run-again'], summary: 'All nodes done. Teardown pending: Harflow stopped before it finished.', cls: 'completed' }
  };
  for (const [state, want] of Object.entries(expected)) {
    const html = start(state);
    assert.match(html, new RegExp(`<span class="wfr-badge ${want.cls}">(?:<span class="wfr-spinner" aria-hidden="true"></span>)?${want.badge}<span class="wfr-badge-elapsed">${want.elapsed}</span></span>`), `${state} badge`);
    assert.deepEqual(runActions(html), want.actions, `${state} controls`);
    assert.ok(runText(html).includes(want.summary), `${state} summary`);
    assert.match(html, /<strong>Session reliability<\/strong>/, 'the family keeps its own title');
  }
  const running = start('setup-running');
  assert.doesNotMatch(running, /wr-pause|>Pause</, 'no Pause during setup');
  assert.match(runToolbar(running), /<button type="button" disabled>Parallel<\/button>/);
  assert.match(running, /class="wf-cancel"/, 'destructive Cancel run');
  assert.ok((runToolbar(running).match(/wfr-spinner/g) || []).length === 1, 'only the badge spins in the toolbar');
  const failed = start('setup-failed');
  assert.match(failed, /class="[^"]*wfr-run-again primary[^"]*" data-action="wr-run-again"/);
  assert.doesNotMatch(failed, /wr-cancel|wfr-spinner/, 'nothing spins and nothing can be cancelled');
  assert.match(runToolbar(failed), /<button type="button" disabled>Parallel<\/button>/);
  const pending = start('teardown-pending');
  assert.match(pending, /class="[^"]*wfr-run-again glass[^"]*" data-action="wr-run-again"/);
  assert.match(pending, /data-action="wr-mode:parallel"/, 'Parallel is enabled once the nodes are done');
  assert.doesNotMatch(runToolbar(pending), /wr-cancel|wr-pause/);
});

test('setup run states show the setup or teardown pane, the workspace path and the outcome copy', () => {
  const { hf, start } = setupRunHarness();
  assert.equal(hf.setupRunWorkspace, '~/Harflow/Workspaces/01JB7K2M');
  for (const state of hf.setupRunStates) {
    const html = start(state);
    assert.ok(html.includes(`data-setup-run="${state}"`), state);
    assert.ok(runText(html).includes('~/Harflow/Workspaces/01JB7K2M'), `${state} workspace`);
    assert.doesNotMatch(html, /~\/\.harflow|\.harflow\/workspaces/, `${state} has no ~/.harflow path`);
    assert.match(html, /data-action="wr-open-log"/);
    assert.match(html, /aria-controls="wfr-setup-command"/);
  }
  const running = runText(start('setup-running'));
  for (const text of ['Start › Setup', 'No agent starts until setup finishes. Timeout 5 min.', 'Running the setup command', 'Updating files:  64% (812/1268)']) assert.ok(running.includes(text), text);
  const failed = runText(start('setup-failed'));
  for (const text of ['exit 128', 'The run never started work: no agent ran and there is nothing to recover. Fix the cause, then Run again.', 'fatal: invalid reference: origin/release-9', 'Teardown', 'Skipped', 'Set to run only when the run succeeds']) assert.ok(failed.includes(text), text);
  const pending = runText(start('teardown-pending'));
  for (const text of ['End › Teardown', "The run's outcome stays Completed.", 'Run teardown', '[output ends here]', 'Nothing runs again until you choose to.']) assert.ok(pending.includes(text), text);
  assert.match(start('teardown-pending'), /aria-label="Select End, teardown pending"/);
  assert.match(start('teardown-pending'), /wf-attention-node/);
  assert.match(start('teardown-pending'), /<span class="wf-subtitle">Finished<\/span>/);
  assert.match(start('setup-running'), /<span class="wf-subtitle">Waiting for setup<\/span>/);
  assert.match(start('setup-failed'), /<span class="wf-subtitle">Never started<\/span>/);
});

test('setup run states keep agent nodes pending and show Not started when one is selected', () => {
  const { hf, start, click } = setupRunHarness();
  for (const state of ['setup-running', 'setup-failed']) {
    const html = start(state);
    assert.deepEqual(Array.from(html.matchAll(/<small>(Pending|Running|Completed|Failed)<\/small>/g), match => match[1]), ['Pending', 'Pending', 'Pending'], `${state} agent nodes`);
    for (const node of ['planning', 'implementation', 'review']) {
      start(state);
      const after = click(`wr-select:${node}`);
      assert.match(after, /wfr-setup-idle/, `${state}/${node}`);
      assert.ok(runText(after).includes('Not started'));
      assert.ok(runText(after).includes('No agent runs until setup finishes, so there is no activity yet.'));
      assert.doesNotMatch(after, /parallel-lane|wfr-selected-activity/, 'no activity');
    }
  }
  start('teardown-pending');
  const done = click('wr-select:planning');
  assert.doesNotMatch(done, /wfr-setup-idle/);
  assert.match(done, /wfr-selected-activity/, 'completed nodes keep their task activity');
  assert.ok(runText(done).includes('Done'));
  assert.ok(hf.setupRunNotStarted('Plan').includes('Not started'));
});

test('setup run command disclosure toggles aria-expanded', () => {
  const { start, click } = setupRunHarness();
  for (const state of ['setup-running', 'setup-failed']) {
    assert.match(start(state), /data-action="wr-command" aria-expanded="false" aria-controls="wfr-setup-command"/);
    assert.match(start(state), /<pre id="wfr-setup-command" class="wfr-setup-code" hidden><\/pre>/);
    let html = click('wr-command');
    assert.match(html, /data-action="wr-command" aria-expanded="true"/);
    assert.match(html, /<pre id="wfr-setup-command" class="wfr-setup-code" >git -C &quot;\$HARFLOW_LAUNCH_DIR&quot; fetch origin/);
    html = click('wr-command');
    assert.match(html, /aria-expanded="false"/);
  }
  start('teardown-pending');
  assert.match(click('wr-open-end'), /data-action="wr-command" aria-expanded="false"/);
  assert.match(click('wr-command'), /worktree remove/);
});

test('teardown-pending: Needs attention opens the End pane and Run teardown moves to Completed', async () => {
  const { hf, announcement, start, click } = setupRunHarness();
  let html = start('teardown-pending');
  assert.match(html, /data-setup-run="teardown-pending" data-teardown="pending"/, 'End is selected on entry');
  assert.match(html, /data-action="wr-open-end"/);
  assert.match(html, /data-action="wr-run-teardown"/);
  // Needs attention reopens the End pane after it was closed.
  html = click('wr-deselect');
  assert.doesNotMatch(html, /data-setup-run=/);
  html = click('wr-open-end');
  assert.match(html, /data-setup-run="teardown-pending" data-teardown="pending"/);
  assert.match(html, /wfr-layout|has-selection/);
  html = click('wr-run-teardown');
  assert.match(html, /data-teardown="running"/);
  assert.equal(announcement.textContent, 'Mock teardown started');
  assert.ok(runText(html).includes('Running'));
  assert.ok(runText(html).includes("Running teardown once. The run's outcome stays Completed."));
  assert.doesNotMatch(html, /data-action="wr-run-teardown"/, 'cannot start twice');
  assert.match(html, /wf-running-node/, 'End shows running');
  assert.match(html, /wfr-attention/, 'still needs attention while running');
  click('wr-run-teardown');
  await new Promise(resolve => setTimeout(resolve, 900));
  html = hf.renderRun('teardown-pending');
  assert.match(html, /data-teardown="completed"/);
  assert.ok(runText(html).includes("Teardown finished. The run's outcome stays Completed."));
  assert.ok(runText(html).includes('Worktree removed'));
  assert.ok(runText(html).includes('All nodes done. Teardown completed.'));
  assert.doesNotMatch(html, /wfr-attention|wr-open-end|wf-attention-node/, 'Needs attention clears');
  assert.match(html, /Teardown completed · the run outcome stays Completed|Select End"/);
  assert.equal(announcement.textContent, 'Mock teardown completed · the run outcome stays Completed');
  // Re-entry resets the mock transition.
  assert.match(start('teardown-pending'), /data-teardown="pending"/);
});

test('setup run Run again and Open full log only show toasts', () => {
  const { hf, announcement, start, click } = setupRunHarness();
  for (const state of ['setup-failed', 'teardown-pending']) {
    start(state);
    click('wr-run-again');
    assert.equal(announcement.textContent, 'Mock run again requested · no run started');
    assert.equal(hf.route.screen, 'workflow-run', `${state} stays on the run`);
    assert.equal(hf.route.state, state);
    assert.doesNotMatch(hf.renderRun(state), /launch-sheet|setup-review/, 'never opens the macOS sheet');
  }
  start('setup-running');
  click('wr-open-log');
  assert.equal(announcement.textContent, 'Full log is mock only');
});

test('setup run states are registered with their tickets and the sidebar element metadata', () => {
  const hf = loadDesignRuntime();
  for (const state of hf.setupRunStates) {
    const status = hf.specimenStatus('workflow-run', state);
    assert.equal(status.kind, 'exploratory', state);
    assert.deepEqual(Array.from(status.tickets), ['#21', 'HarflowMCP#41']);
    assert.ok(hf.screens.find(family => family.id === 'workflow-run').states.includes(state));
  }
  assert.match(hf.specimenStatus('workflow-run', 'teardown-pending').caption, /the run outcome stays Completed/);
  assert.match(hf.specimenStatus('workflow-run', 'setup-failed').caption, /the run never started work/);
  assert.equal(hf.specimenStatus('workflow-run', 'running').kind, 'contains-exploratory');
});

test('setup Not designed keeps timed out, teardown running beyond the mock, teardown failed, and cancel during setup', () => {
  const inventory = fs.readFileSync(path.join(root, 'docs/screen-inventory.md'), 'utf8');
  const clause = /workflow setup and teardown run states \(([^)]*)\)/.exec(inventory)?.[1];
  assert.ok(clause, 'the Not designed clause exists');
  assert.equal(clause, 'setup timed out, teardown running beyond the mock transition, teardown failed, and cancel during setup');
  assert.doesNotMatch(clause, /setup running|setup failed|Teardown pending/i, 'the designed states are not listed as undesigned');
});

test('the Start setup banner says the review applies to manual launches', () => {
  const hf = loadDesignRuntime();
  hf.route = { theme: 'light', screen: 'workflow-editor', state: 'start-setup' };
  hf.editorController.reset('start-setup');
  const html = hf.renderEditor('start-setup').replace(/&#39;/g, "'");
  assert.ok(html.includes("Harness permissions don't apply to this command. You review it each time you start the workflow yourself."));
  assert.doesNotMatch(html, /You review it each time the workflow runs/);
  hf.editorController.reset('end-teardown');
});

const webHarness = () => {
  const html = { current: '' };
  const announcement = { textContent: '', classList: { add() {}, remove() {} } };
  const app = { style: {}, querySelector: () => null, querySelectorAll: () => [], get outerHTML() { return html.current; }, set outerHTML(value) { html.current = value; } };
  const focused = [];
  const resolve = focusResolver(() => html.current, focused);
  const hf = loadDesignRuntime({ captureEvents: true, querySelectorOverride: selector => selector === '.web-app' ? app : selector === '#announcement' ? announcement : selector.startsWith('.web-app ') ? resolve(selector.slice('.web-app '.length)) : undefined });
  const navigations = [];
  hf.navigate = (...args) => navigations.push(args);
  hf.route = { theme: 'light', screen: 'web', state: 'triggers' };
  hf.resetWeb();
  const fire = (type, target) => hf.__dispatchDesignEvent({ type, target, preventDefault() {}, stopImmediatePropagation() {} });
  const click = action => { const target = { dataset: { action }, disabled: false, closest: selector => selector === '[data-action^="web-"]' || selector === '.web-app' ? (selector === '.web-app' ? app : target) : null }; fire('click', target); return html.current; };
  const field = (type, name, props = {}) => { const target = { matches: () => false, dataset: { webField: name, ...(props.id ? { id: props.id } : {}) }, value: props.value ?? '', checked: !!props.checked, closest: selector => selector === '[data-web-field]' ? target : selector === '.web-app' ? app : null }; fire(type, target); };
  return { hf, html, announcement, navigations, click, field, app, focused, route: state => { hf.route = { theme: 'light', screen: 'web', state }; html.current = hf.renderWeb(state); } };
};
const webText = html => html.replace(/<svg.*?<\/svg>/g, '').replace(/<[^>]+>/g, '|').replace(/&#39;/g, "'").replace(/\|+/g, '|');

test('the Harflow web family is registered as a web platform with no source', () => {
  const hf = loadDesignRuntime();
  const family = hf.screens.find(screen => screen.id === 'web');
  assert.deepEqual(Array.from(family.states), ['triggers', 'trigger-editor', 'incoming', 'run-failed']);
  assert.equal(family.platform, 'web');
  assert.equal(family.source, undefined);
  assert.equal(family.proposals, undefined);
  assert.deepEqual(Array.from(family.proposal.tickets), ['HarflowWeb#1', 'HarflowWeb#2']);
  assert.ok(Array.from(family.proposal.tickets).every(ref => hf.isTicketRef(ref)));
  assert.equal(hf.isTicketRef('HarflowWeb#3'), true);
  assert.equal(hf.isTicketRef('HarflowWeb3'), false);
  for (const state of family.states) {
    const status = hf.specimenStatus('web', state);
    assert.equal(status.kind, 'exploratory');
    assert.match(status.caption, /^Exploratory · .*HarflowWeb#1.*HarflowWeb#2.* · Not approved/);
  }
  assert.ok(hf.screens.filter(screen => screen.id !== 'web').every(screen => !screen.platform), 'every other family is macOS');
  assert.match(fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8'), /No native source/);
});

test('catalog navigation groups families by platform, search hides empty groups, and the eyebrow follows', () => {
  const hf = loadDesignRuntime();
  const source = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  const start = source.indexOf('function renderNav(){');
  let depth = 0, end = start;
  for (let i = source.indexOf('{', start); i < source.length; i++) { if (source[i] === '{') depth++; if (source[i] === '}' && --depth === 0) { end = i + 1; break; } }
  const renderNav = source.slice(start, end);
  const nav = { innerHTML: '' }, search = { value: '' };
  hf.route = { screen: 'web' };
  const run = query => { search.value = query; new Function('HF', 'document', `${renderNav}; renderNav();`)(hf, { querySelector: selector => selector === '#catalog-search' ? search : selector === '#catalog-nav' ? nav : null }); return nav.innerHTML; };
  let html = run('');
  assert.equal((html.match(/<section class="nav-group"/g) || []).length, 2);
  assert.match(html, /<section class="nav-group" data-nav-group="macos"><h2 class="nav-group-title" id="nav-group-macos">macOS<\/h2><ul aria-labelledby="nav-group-macos">/);
  assert.match(html, /<section class="nav-group" data-nav-group="web"><h2 class="nav-group-title" id="nav-group-web">Harflow web<\/h2><ul aria-labelledby="nav-group-web"><li><button class="nav-item active" data-action="route:web\/triggers">Harflow web<small>4<\/small>/);
  assert.ok(html.indexOf('data-nav-group="macos"') < html.indexOf('data-nav-group="web"'));
  assert.equal((html.match(/<li>/g) || []).length, hf.screens.length);
  html = run('incoming');
  assert.match(html, /data-nav-group="web"/);
  assert.doesNotMatch(html, /data-nav-group="macos"/, 'a group with no match is hidden');
  html = run('statistics');
  assert.doesNotMatch(html, /data-nav-group="web"/);
  assert.match(html, /data-nav-group="macos"/);
  assert.equal(run('zzzz-no-match'), '');
  // The eyebrow is set by one statement inside render(), which also drives the whole page (DOM, router, every family
  // renderer), so render() cannot be loaded in this harness. The statement is extracted by text and executed instead; if
  // render() is ever split into functions, extract the whole function with the brace matching used for renderNav above.
  const eyebrowStatement = /document\.querySelector\('#eyebrow'\)\.textContent=family\.platform==='web'\?'HARFLOW \/ WEB':'HARFLOW \/ MACOS';/.exec(source)?.[0];
  assert.ok(eyebrowStatement, 'render sets the eyebrow');
  const eyebrow = family => { const node = { textContent: '' }; new Function('document', 'family', eyebrowStatement)({ querySelector: selector => selector === '#eyebrow' ? node : null }, family); return node.textContent; };
  assert.equal(eyebrow(hf.screens.find(screen => screen.id === 'web')), 'HARFLOW / WEB');
  for (const family of hf.screens.filter(screen => screen.id !== 'web')) assert.equal(eyebrow(family), 'HARFLOW / MACOS', family.id);
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /id="eyebrow"/);
});

test('web states render their copy and the specimen is a fluid shell', () => {
  const { hf } = webHarness();
  const triggers = webText(hf.renderWeb('triggers'));
  for (const text of ['Fix assigned bug', 'Revision 4 · Triggers', 'New trigger', 'Triggers start this workflow from outside Harflow.', 'Bug assigned to me', 'Slack /harflow fix', 'Weekly crash sweep', 'Paused', 'Webhooks arrive on their own port']) assert.ok(triggers.includes(text), text);
  const editor = webText(hf.renderWeb('trigger-editor'));
  for (const text of ['All triggers', 'Enabled', 'Conditions', 'Run inputs', 'When a run is already going', 'Same run when', 'Payload URL', 'https://hooks.home.example/hooks/trg_8f2kq1', 'Access, from the workflow', 'Caller approvals are on for Review and open PR and can be answered from the Mac app or the web app.']) assert.ok(editor.includes(text), text);
  const incoming = webText(hf.renderWeb('incoming'));
  for (const text of ['Every delivery to every trigger in the last 30 days', 'Today', 'Earlier', 'Checks', 'Run inputs', 'Payload · 8.4 KB']) assert.ok(incoming.includes(text), text);
  const failed = webText(hf.renderWeb('run-failed'));
  for (const text of ['Run started 10:02 · harflow-mac · Revision 3 · from Bug assigned to me', 'Run again uses revision 5', 'the setup command changed, so you review it first', 'Fix #2481', 'gh pr create was denied after 3 attempts.']) assert.ok(failed.includes(text), text);
  for (const state of hf.webStates) {
    const html = hf.renderWeb(state);
    assert.ok(html.includes(`<section class="app web-app" data-web-state="${state}"`), state);
    assert.doesNotMatch(html, /nativeSurface|wfr-|editor-app/);
  }
  assert.equal(new Set(hf.webStates.map(state => hf.renderWeb(state))).size, 4, 'four distinct states');
  // The editor sidebar drops the Today group; the others keep it.
  assert.match(hf.renderWeb('triggers'), /<h2 class="web-side-heading">Today<\/h2>/);
  assert.doesNotMatch(hf.renderWeb('trigger-editor'), /<h2 class="web-side-heading">Today<\/h2>/);
  assert.equal(hf.webRejectedCount(), 1);
  assert.match(hf.renderWeb('incoming'), /<span class="web-count" aria-label="1 rejected">1<\/span>/);
});

test('web Incoming: filters, newest-first rows, selection and the metadata-only Rejected row', () => {
  const { hf, click, route } = webHarness();
  route('incoming');
  const deliveries = Array.from(hf.webDeliveries);
  const order = group => deliveries.filter(delivery => delivery.group === group).map(delivery => delivery.time);
  assert.deepEqual(order('Today'), ['10:04', '10:02', '10:02', '07:41', '07:15'], 'Today is newest first');
  assert.deepEqual(deliveries.filter(delivery => delivery.group === 'Earlier').map(delivery => delivery.when), ['Oct 24, 16:20', 'Oct 23, 18:05'], 'Earlier is newest first');
  assert.deepEqual(Array.from(hf.webFilters, ([id]) => id), ['all', 'started', 'notstarted', 'rejected']);
  const ids = filter => Array.from(hf.webVisibleDeliveries(filter), delivery => delivery.id);
  assert.deepEqual(ids('all'), ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7']);
  assert.deepEqual(ids('started'), ['d2', 'd5', 'd6']);
  assert.deepEqual(ids('notstarted'), ['d1', 'd3', 'd4']);
  assert.deepEqual(ids('rejected'), ['d7']);
  assert.deepEqual(Array.from(new Set(deliveries.map(delivery => delivery.status))).sort(), ['Duplicate', 'Filtered out', 'Queued', 'Rejected', 'Started run']);
  let html = hf.renderWeb('incoming');
  assert.deepEqual(Array.from(html.matchAll(/data-action="web-select:(d\d)"/g), match => match[1]), ids('all'));
  assert.ok(html.indexOf('<h3>Today</h3>') < html.indexOf('<h3>Earlier</h3>'));
  assert.match(html, /web-delivery is-selected" data-action="web-select:d2"/, 'the first started run is selected');
  html = click('web-filter:rejected');
  assert.equal(hf.webState().filter, 'rejected');
  assert.deepEqual(Array.from(html.matchAll(/data-action="web-select:(d\d)"/g), match => match[1]), ['d7']);
  assert.doesNotMatch(html, /<h3>Today<\/h3>/, 'an empty group has no heading');
  assert.equal(hf.webState().selected, 'd7', 'the selection moves into the filtered list');
  assert.match(html, /data-action="web-filter:rejected" aria-pressed="true"/);
  // The Rejected inspector is metadata only.
  assert.match(html, /data-web-no-payload>Payload not shown for rejected deliveries\. Only the metadata above is kept\./);
  assert.doesNotMatch(html, /data-action="web-payload"|id="web-payload"/);
  assert.ok(webText(html).includes("Signature didn't match: check the secret on the sender"));
  assert.ok(webText(html).includes('Nothing was extracted: the delivery was rejected.'));
  html = click('web-filter:all');
  html = click('web-select:d4');
  assert.equal(hf.webState().selected, 'd4');
  assert.match(html, /<h2 id="dl-title">#2477 assigned to kevin<\/h2>/);
  assert.ok(webText(html).includes('Conditions did not match: assignee.login was kevin, expected hainayanda'));
  assert.match(html, /web-delivery is-selected" data-action="web-select:d4"/);
  html = click('web-select:d1');
  assert.ok(webText(html).includes('Active run for issue 2481: waits for the 10:02 run'));
  assert.match(html, /<span class="web-sr"> \(did not pass\)<\/span>/);
  // Conditions in the checks match the editor's condition count.
  const seed = hf.webEditorSeed();
  assert.ok(webText(click('web-select:d2')).includes(`Conditions matched, ${seed.conditions.length} of ${seed.conditions.length}`));
  assert.match(click('web-select:d2'), /data-action="route:web\/run-failed">Open the run</);
});

test('web payloads are escaped JSON with no null literals and reveal resets', () => {
  const { hf, click, route } = webHarness();
  route('incoming');
  for (const delivery of hf.webDeliveries) {
    if (delivery.metadataOnly) { assert.equal(delivery.payload, undefined); continue; }
    assert.doesNotMatch(delivery.payload, /\bnull\b/, delivery.id);
    assert.doesNotThrow(() => JSON.parse(delivery.payload), delivery.id);
  }
  let html = click('web-payload');
  assert.match(html, /aria-expanded="true" aria-controls="web-payload"/);
  const body = /<pre[^>]*id="web-payload"[^>]*>([\s\S]*?)<\/pre>/.exec(html)?.[1];
  assert.ok(body, 'the payload is shown');
  assert.match(body, /&quot;action&quot;: &quot;assigned&quot;/);
  assert.doesNotMatch(body, /"|<|\bnull\b/, 'escaped');
  click('web-select:d6');
  html = click('web-payload');
  assert.match(html, /&quot;command&quot;: &quot;\/harflow&quot;/);
  assert.equal(hf.webState().payloadOpen, true);
  assert.equal(hf.webState().selected, 'd6');
  html = click('web-select:d2');
  assert.equal(hf.webState().payloadOpen, false, 'selecting closes the payload');
  const original = hf.webDeliveries[1].payload;
  hf.webDeliveries[1].payload = '{"title":"<img src=x onerror=alert(1)> & \\"q\\""}';
  try {
    html = click('web-payload');
    // Only the payload region is checked: the title bar emblem and the appearance buttons are legitimate <img> elements.
    const payload = /<pre[^>]*id="web-payload"[^>]*>([\s\S]*?)<\/pre>/.exec(html)[1];
    assert.doesNotMatch(payload, /<img/);
    assert.match(payload, /&lt;img src=x onerror=alert\(1\)&gt; &amp; /);
  } finally { hf.webDeliveries[1].payload = original; }
});

test('web trigger editor: Task template, required actor condition, dirty state and Discard', () => {
  const { hf, click, field, route } = webHarness();
  route('trigger-editor');
  const seed = hf.webEditorSeed();
  assert.equal(seed.task, 'Fix #{issue.number}');
  assert.equal(seed.key, 'issue.number');
  let html = hf.renderWeb('trigger-editor');
  assert.doesNotMatch(html, /ISSUE_BODY|Untrusted text/i);
  assert.doesNotMatch(webText(html), /Untrusted/);
  assert.match(html, /data-web-field="task" value="Fix #\{issue\.number\}"/);
  assert.match(html, /data-web-field="key" value="issue\.number"/);
  // The actor condition is required: no remove button, locked path and operator.
  const actor = /<div class="web-form-row web-condition" data-condition="c1">[\s\S]*?<\/div>/.exec(html)[0];
  assert.match(actor, /<span class="web-chip">Actor<\/span>/);
  assert.match(actor, /value="sender\.login" aria-label="Condition path" readonly/);
  assert.match(actor, /value="hainayanda"/);
  assert.doesNotMatch(actor, /web-cond-remove/);
  assert.match(actor, /Required/);
  assert.equal((html.match(/data-action="web-cond-remove:/g) || []).length, 2);
  assert.match(html, /aria-label="Remove condition assignee\.login"/);
  assert.equal(hf.webState().dirty, false);
  assert.match(html, /<button type="button" class="web-btn primary" data-action="web-run" >/);
  assert.match(html, /data-action="web-discard" disabled/);
  assert.match(html, /data-action="web-save" disabled/);
  // An edit dirties the draft, disables Run, and Discard restores the seed.
  field('input', 'task', { value: 'Fix #{issue.number} now' });
  let state = hf.webState();
  assert.equal(state.dirty, true);
  assert.equal(state.draft.task, 'Fix #{issue.number} now');
  assert.equal(state.baseline.task, 'Fix #{issue.number}');
  html = click('web-cond-remove:c2');
  state = hf.webState();
  assert.deepEqual(Array.from(state.draft.conditions, condition => condition.id), ['c1', 'c3']);
  assert.match(html, /Unsaved changes · Revision 4 · Triggers/);
  assert.match(html, /data-action="web-run" disabled/, 'Run is disabled while dirty');
  assert.doesNotMatch(html, /data-action="web-discard" disabled/);
  assert.doesNotMatch(html, /web-cond-remove:c1/, 'the required actor condition offers no remove control');
  html = click('web-cond-add');
  assert.deepEqual(Array.from(hf.webState().draft.conditions, condition => condition.id), ['c1', 'c3', 'c4']);
  field('input', 'cond-path', { id: 'c4', value: 'issue.state' });
  assert.equal(hf.webState().draft.conditions.find(condition => condition.id === 'c4').path, 'issue.state');
  field('change', 'enabled', { checked: false });
  assert.equal(hf.webState().draft.enabled, false);
  field('change', 'cond-op', { id: 'c3', value: 'equals' });
  assert.equal(hf.webState().draft.conditions.find(condition => condition.id === 'c3').op, 'equals');
  html = click('web-concurrency:cancel');
  assert.equal(hf.webState().draft.concurrency, 'cancel');
  html = click('web-discard');
  state = hf.webState();
  assert.equal(state.dirty, false);
  assert.equal(JSON.stringify(state.draft), JSON.stringify(state.baseline));
  assert.equal(JSON.stringify(state.draft), JSON.stringify(hf.webEditorSeed()));
  assert.match(html, /data-action="web-run" >/);
  // Save makes the draft the new baseline.
  field('input', 'repository', { value: 'Harflow-Dev/Other' });
  click('web-save');
  assert.equal(hf.webState().dirty, false);
  assert.equal(hf.webState().baseline.repository, 'Harflow-Dev/Other');
});

test('web trigger editor: other sources are not designed, and Reveal shows a fixed fake secret', () => {
  const { hf, click, announcement, route } = webHarness();
  route('trigger-editor');
  let html = hf.renderWeb('trigger-editor');
  assert.doesNotMatch(html, /data-web-source-note/);
  assert.match(html, /data-action="web-source:github" aria-pressed="true"/);
  for (const [id, label] of [['slack', 'Slack'], ['webhook', 'Webhook'], ['schedule', 'Schedule']]) {
    html = click(`web-source:${id}`);
    assert.match(html, new RegExp(`data-web-source-note>${label} source settings are not designed\\. Only GitHub is drawn\\.<`));
    assert.match(html, new RegExp(`data-action="web-source:${id}" aria-pressed="true"`));
    assert.doesNotMatch(html, /data-web-field="event"/);
    assert.equal(hf.webState().dirty, false, 'switching the source view does not dirty the draft');
  }
  click('web-source:github');
  assert.doesNotMatch(hf.renderWeb('trigger-editor'), new RegExp(hf.webSecret));
  assert.match(hf.renderWeb('trigger-editor'), /••••••••••••••••/);
  html = click('web-reveal');
  assert.ok(html.includes(hf.webSecret));
  assert.equal(hf.webSecret, 'whsec_7Qm2xk9ZpL4vTn8c');
  assert.equal(announcement.textContent, 'Secret shown · fixed fake value');
  assert.equal(hf.webState().reveal, true);
  html = click('web-reveal');
  assert.ok(!html.includes(hf.webSecret));
  assert.equal(announcement.textContent, 'Secret hidden');
  click('web-reveal');
  hf.resetWeb();
  assert.equal(hf.webState().reveal, false, 're-entry hides the secret');
  assert.ok(!hf.renderWeb('trigger-editor').includes(hf.webSecret));
});

test('web manual launches only show toasts and never navigate to the macOS sheet', () => {
  const { hf, click, announcement, navigations, route } = webHarness();
  const notDesigned = 'Web command review is not designed · mock only';
  for (const [state, action] of [['triggers', 'web-run'], ['trigger-editor', 'web-run'], ['run-failed', 'web-run-again']]) {
    route(state);
    announcement.textContent = '';
    click(action);
    assert.equal(announcement.textContent, notDesigned, `${state} ${action}`);
  }
  assert.deepEqual(navigations, [], 'no navigation happened');
  assert.doesNotMatch(hf.renderWeb('run-failed') + hf.renderWeb('triggers') + hf.renderWeb('trigger-editor'), /setup-review|workflow-launch|Run workflow/);
  click('web-mock:New session');
  assert.equal(announcement.textContent, 'New session · mock only');
  click('web-mock:Recovery options are not designed on the web · mock only');
  assert.equal(announcement.textContent, 'Recovery options are not designed on the web · mock only');
  route('triggers');
  click('web-editor-tab');
  assert.deepEqual(navigations.map(args => args.join('/')), ['workflow-editor/saved'], 'the Editor tab leaves the web family and says so');
  assert.equal(announcement.textContent, 'The web editor is not designed · mock only');
  // Clicks outside the web route are ignored.
  navigations.length = 0;
  hf.route = { theme: 'light', screen: 'tasks', state: 'populated' };
  announcement.textContent = '';
  click('web-run');
  assert.equal(announcement.textContent, '');
});

test('resetWeb restores all web state, including the run-failed disclosures and the condition counter', () => {
  const { hf, click, field, route } = webHarness();
  route('incoming');
  click('web-filter:started');
  click('web-select:d5');
  click('web-payload');
  click('web-source:slack');
  click('web-reveal');
  field('input', 'task', { value: 'changed' });
  click('web-cond-add');
  route('run-failed');
  click('web-inputs');
  click('web-plan');
  const dirty = hf.webState();
  assert.notEqual(dirty.filter, 'all');
  assert.equal(dirty.dirty, true);
  assert.equal(dirty.inputsOpen, false);
  assert.equal(dirty.planOpen, false);
  assert.equal(dirty.nextCondition, 5);
  assert.match(hf.renderWeb('run-failed'), /data-action="web-inputs" aria-expanded="false"/);
  hf.resetWeb();
  const fresh = { filter: 'all', selected: 'd2', payloadOpen: false, reveal: false, source: 'github', draft: hf.webEditorSeed(), baseline: hf.webEditorSeed(), dirty: false, inputsOpen: true, planOpen: true, nextCondition: 4 };
  assert.equal(JSON.stringify(hf.webState()), JSON.stringify(fresh));
  assert.match(hf.renderWeb('run-failed'), /data-action="web-inputs" aria-expanded="true"/);
  route('trigger-editor');
  click('web-cond-add');
  assert.deepEqual(Array.from(hf.webState().draft.conditions, condition => condition.id), ['c1', 'c2', 'c3', 'c4'], 'the counter restarts after a reset');
  hf.resetWeb();
  const first = hf.webStates.map(state => hf.renderWeb(state));
  click('web-filter:rejected');
  hf.resetWeb();
  assert.deepEqual(hf.webStates.map(state => hf.renderWeb(state)), first, 'deterministic output after a reset');
});

test('web focus after Save, Discard, condition changes, filters and selection lands on an enabled control', () => {
  const { hf, click, field, focused, route } = webHarness();
  route('trigger-editor');
  field('input', 'task', { value: 'Fix #{issue.number} now' });
  click('web-save');
  assert.equal(focused.at(-1), '[data-web-field="enabled"]', 'after Save');
  field('input', 'task', { value: 'again' });
  click('web-discard');
  assert.equal(focused.at(-1), '[data-web-field="enabled"]', 'after Discard');
  assert.equal(hf.webState().dirty, false);
  click('web-cond-add');
  assert.equal(focused.at(-1), '[data-condition="c4"] [data-web-field="cond-path"]', 'the new condition path');
  click('web-cond-remove:c2');
  assert.equal(focused.at(-1), '[data-condition="c3"] [data-web-field="cond-path"]', 'the next condition');
  click('web-cond-remove:c4');
  assert.equal(focused.at(-1), '[data-condition="c3"] [data-web-field="cond-path"]', 'the previous condition when the last row goes');
  click('web-cond-remove:c3');
  assert.equal(focused.at(-1), '[data-condition="c1"] [data-web-field="cond-path"]', 'the remaining actor condition');
  // The resolver rejects disabled and missing targets, so every assertion above names a focusable control.
  assert.match(hf.renderWeb('trigger-editor'), /data-web-field="enabled" checked>/);
  route('incoming');
  focused.length = 0;
  click('web-filter:started');
  assert.equal(focused.at(-1), '[data-action="web-filter:started"]');
  click('web-select:d5');
  assert.equal(focused.at(-1), '[data-action="web-select:d5"]');
  click('web-payload');
  assert.equal(focused.at(-1), '[data-action="web-payload"]');
  route('trigger-editor');
  click('web-source:slack');
  assert.equal(focused.at(-1), '[data-action="web-source:slack"]');
  click('web-reveal');
  assert.equal(focused.at(-1), '[data-action="web-reveal"]');
  assert.equal(focusResolver(() => '<button data-action="web-save" disabled>', [])('[data-action="web-save"]'), undefined, 'a disabled control is never focusable');
  assert.equal(focusResolver(() => '<button data-action="web-save">', [])('[data-action="web-missing"]'), undefined, 'a missing control is never focusable');
});

test('teardown completion moves focus to the close button and the command disclosure keeps focus', async () => {
  const { start, click, focused } = setupRunHarness();
  start('teardown-pending');
  click('wr-command');
  assert.equal(focused.at(-1), '[data-action="wr-command"]', 'the disclosure keeps focus on itself');
  click('wr-command');
  click('wr-run-teardown');
  assert.equal(focused.at(-1), '[data-action="wr-deselect"]', 'focus moves when teardown starts');
  focused.length = 0;
  await new Promise(resolve => setTimeout(resolve, 900));
  assert.deepEqual(focused, ['[data-action="wr-deselect"]'], 'and again when it completes');
  // The disclosure restores focus to itself on setup states too.
  start('setup-running');
  focused.length = 0;
  click('wr-command');
  assert.deepEqual(focused, ['[data-action="wr-command"]']);
  click('wr-command');
  assert.deepEqual(focused, ['[data-action="wr-command"]', '[data-action="wr-command"]']);
});

// Attribute-presence helpers: markup is matched by what an element has, not by the order its attributes are written.
const htmlTags = html => Array.from(html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/g), match => ({ tag: match[1], attrs: Object.fromEntries(Array.from(match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g), attr => [attr[1], attr[2] ?? true])) }));
const webEl = (html, want, tag) => htmlTags(html).find(el => (!tag || el.tag === tag) && Object.entries(want).every(([key, value]) => key === 'class' ? String(el.attrs.class || '').split(/\s+/).includes(value) : value === true ? el.attrs[key] !== undefined : el.attrs[key] === value));
const webSidebar = html => /<aside class="web-sidebar"[\s\S]*?<\/aside>/.exec(html)[0];
const webSidebarRows = html => {
  const sections = webSidebar(html).split(/<h2 class="web-side-heading">/).slice(1).map(part => ({ name: part.slice(0, part.indexOf('</h2>')), body: part }));
  const row = /<div class="web-task-row"><span class="task-status (\w+)" aria-hidden="true"><\/span><div class="web-task-text"><strong>([^<]*)<\/strong><span class="web-task-meta">(?:<span class="backend-dot (\w+)" aria-hidden="true"><\/span>)?<span>([^<]*)<\/span><\/span><\/div><span class="web-time">([^<]*)<\/span>(?:<span class="visually-hidden">(\w+)<\/span>)?<\/div>/g;
  return Object.fromEntries(sections.filter(section => section.name !== 'Workflows').map(section => [section.name, Array.from(section.body.matchAll(row), match => ({ status: match[1], title: match[2], dot: match[3] || null, meta: match[4], time: match[5], sr: match[6] || null }))]));
};

test('each web state has its own board sidebar rows with status, dots, times and screen-reader words', () => {
  const { hf } = webHarness();
  const run = (issue, time) => [{ status: 'running', title: `Fix #${issue}`, dot: 'claude', meta: 'Claude · harflow-mac', time, sr: null }];
  const queued = issue => [{ status: 'queued', title: `Fix #${issue}`, dot: null, meta: 'Pending · waits for the run above', time: 'now', sr: null }];
  const review = { status: 'completed', title: 'Address review on #412', dot: 'codex', meta: 'Codex · harflow-mac', time: '2h', sr: 'completed' };
  const expected = {
    triggers: { Running: run(2481, '03:12'), Queued: queued(2481), Today: [review] },
    'trigger-editor': { Running: run(2481, '03:12'), Queued: queued(2481) },
    incoming: { Running: run(2481, '03:12'), Queued: queued(2481) },
    'run-failed': { Running: run(2488, '01:40'), Queued: queued(2488), Today: [{ status: 'failed', title: 'Fix #2481', dot: 'claude', meta: 'Claude · harflow-mac', time: '8m', sr: 'failed' }, review] }
  };
  for (const [state, want] of Object.entries(expected)) assert.equal(JSON.stringify(webSidebarRows(hf.renderWeb(state))), JSON.stringify(want), state);
  assert.doesNotMatch(webText(webSidebar(hf.renderWeb('run-failed'))), /03:12/, 'run-failed shows 01:40, not 03:12');
  for (const state of hf.webStates) {
    const rows = Object.values(webSidebarRows(hf.renderWeb(state))).flat();
    for (const item of rows.filter(item => item.status === 'queued')) assert.equal(item.dot, null, `${state} queued rows have no harness dot`);
    for (const item of rows.filter(item => item.status !== 'queued')) assert.ok(item.dot, `${state} ${item.title}`);
    assert.match(hf.renderWeb(state), /<span class="task-status running" aria-hidden="true">/);
  }
});

test('web sidebar current-page markers and workflow rows', () => {
  const { hf } = webHarness();
  const current = html => Array.from(webSidebar(html).matchAll(/<button[^>]*aria-current="page"[^>]*>[\s\S]*?<span class="web-fill">([^<]*)<\/span>/g), match => match[1]);
  assert.deepEqual(current(hf.renderWeb('triggers')), ['Fix assigned bug']);
  assert.deepEqual(current(hf.renderWeb('trigger-editor')), ['Fix assigned bug']);
  assert.deepEqual(current(hf.renderWeb('incoming')), ['Incoming'], 'Incoming is current only on the incoming state');
  assert.deepEqual(current(hf.renderWeb('run-failed')), [], 'no item is current on run-failed');
  for (const state of ['triggers', 'trigger-editor', 'run-failed']) assert.ok(!String(webEl(webSidebar(hf.renderWeb(state)), { 'data-action': 'route:web/incoming' }).attrs.class).includes('is-selected'), state);
  for (const state of hf.webStates) {
    const html = webSidebar(hf.renderWeb(state));
    assert.match(html, /data-action="route:web\/incoming"/);
    const workflow = webEl(html, { 'data-action': 'route:web/triggers' }, 'button');
    assert.ok(workflow && workflow.attrs.class.includes('web-side-item'), `${state} Fix assigned bug routes to the triggers state`);
    assert.match(/data-action="route:web\/triggers"[\s\S]*?<\/button>/.exec(html)[0], /web-fill[^>]*>Fix assigned bug</);
    assert.equal((html.match(/data-action="route:web\/triggers"/g) || []).length, 1);
    assert.match(html, /<span class="web-count" aria-label="1 rejected">1<\/span>/);
  }
  const workflows = state => Array.from(webSidebar(hf.renderWeb(state)).matchAll(/class="web-side-item[^"]*" data-action="([^"]+)"[^>]*><span class="web-side-glyph">[\s\S]*?<span class="web-fill">([^<]*)<\/span>/g), match => [match[1], match[2]]).filter(([, label]) => label !== 'Incoming');
  assert.deepEqual(workflows('triggers'), [['route:web/triggers', 'Fix assigned bug'], ['web-mock:Address review comments', 'Address review comments'], ['web-mock:Implement and review', 'Implement and review']]);
  assert.deepEqual(workflows('incoming').map(([action]) => action), ['route:web/triggers', 'web-mock:Address review comments', 'web-mock:Draft release notes']);
  assert.deepEqual(workflows('run-failed').map(([, label]) => label), ['Fix assigned bug', 'Address review comments']);
  assert.match(/data-action="route:web\/incoming"[\s\S]*?<\/button>/.exec(webSidebar(hf.renderWeb('triggers')))[0], /<svg[\s\S]*?M1\.8 8\.2 3\.6 2\.6/, 'Incoming has the inbox glyph');
});

test('web sidebar controls, labels and the disabled search field', () => {
  const { hf } = webHarness();
  const html = webSidebar(hf.renderWeb('triggers'));
  const newSession = webEl(html, { class: 'web-new-session' }, 'button');
  assert.equal(newSession.attrs['data-action'], 'web-mock:New session');
  assert.equal(newSession.attrs['aria-label'], 'New session, Command N');
  assert.match(html, /<kbd[^>]*aria-hidden="true"[^>]*>⌘N<\/kbd>/);
  const search = webEl(html, { type: 'search' }, 'input');
  assert.ok(search.attrs.disabled !== undefined, 'the search field is disabled');
  assert.equal(search.attrs['aria-label'], 'Search loaded history');
  assert.equal(search.attrs.placeholder, 'Search loaded history');
  assert.equal(search.attrs.id, undefined, 'the search field has no id');
  assert.doesNotMatch(html, /<input[^>]*\sid=/);
  const filter = webEl(html, { class: 'web-filter' }, 'button');
  assert.equal(filter.attrs['data-action'], 'web-mock:Harness filter is not designed on the web');
  assert.equal(filter.attrs['aria-label'], 'Filter tasks by harness, All harnesses');
  assert.deepEqual(Array.from(/class="web-filter-dots"[\s\S]*?<\/span><\/span>/.exec(html)[0].matchAll(/backend-dot (\w+)/g), match => match[1]), ['claude', 'codex', 'opencode']);
  const add = webEl(html, { class: 'web-side-add' }, 'button');
  assert.equal(add.attrs['data-action'], 'web-mock:New workflow');
  assert.equal(add.attrs['aria-label'], 'New workflow');
  assert.match(html, /web-side-heading-row[^>]*>\s*<h2[^>]*>Workflows<\/h2>/);
  const gear = webEl(html, { class: 'web-gear' }, 'button');
  assert.equal(gear.attrs['data-action'], 'web-mock:Settings');
  assert.equal(gear.attrs['aria-label'], 'Settings');
  assert.match(/class="web-gear"[\s\S]*?<\/button>/.exec(html)[0], /<img[^>]*src="assets\/symbols\/gearshape-16pt-2x\.png"[^>]*alt=""/);
  const group = webEl(html, { class: 'appearance-control' });
  assert.equal(group.attrs.role, 'group');
  assert.equal(group.attrs['aria-label'], 'Appearance');
  assert.ok(html.indexOf('appearance-control') > html.indexOf('web-sidebar-foot'), 'the appearance control sits in the footer');
  assert.equal(webEl(html, { class: 'web-sidebar-list' }, 'nav').attrs['aria-label'], 'Workflows and runs');
  assert.equal((html.match(/<h2[^>]*class="web-side-heading"[^>]*>/g) || []).length, 4, 'Workflows, Running, Queued, Today');
  assert.ok(html.lastIndexOf('web-sidebar-foot') > html.lastIndexOf('web-task-row'), 'the footer follows the list');
  const marks = htmlTags(html).filter(el => String(el.attrs.class || '').split(/\s+/).includes('task-status'));
  assert.equal(marks.length, 3);
  assert.ok(marks.every(el => el.attrs['aria-hidden'] === 'true'));
  assert.ok(htmlTags(html).filter(el => el.tag === 'svg').every(el => el.attrs['aria-hidden'] === 'true'), 'every glyph is aria-hidden');
});

test('web title bar has the Hide sidebar button, the Harflow emblem and Connected, and no traffic lights', () => {
  const { hf } = webHarness();
  for (const state of hf.webStates) {
    const html = hf.renderWeb(state);
    assert.doesNotMatch(html, /window-dots/, `${state} has no macOS traffic lights`);
    assert.equal(webEl(html, { class: 'titlebar' }), undefined);
    assert.ok(webEl(html, { class: 'web-titlebar-side' }), `${state} sidebar-side title row`);
    const hide = webEl(html, { 'data-action': 'web-mock:Hide sidebar' }, 'button');
    assert.equal(hide.attrs['aria-label'], 'Hide sidebar');
    assert.ok(html.indexOf('web-titlebar-side') < html.indexOf('</aside>'), 'Hide sidebar lives in the sidebar');
    assert.ok(html.indexOf('web-titlebar-detail') > html.indexOf('</aside>'), `${state} the brand bar sits in the detail pane`);
    const bar = html.slice(html.indexOf('web-titlebar-detail'));
    const brand = webEl(bar, { class: 'web-brand' });
    assert.equal(brand.attrs.role, 'group');
    assert.equal(brand.attrs['aria-label'], 'Harflow');
    assert.equal(webEl(bar, { class: 'window-emblem' }).attrs['aria-hidden'], 'true');
    const img = webEl(bar, { src: 'assets/branding/menubarTemplate.png' }, 'img');
    assert.ok(img, 'the emblem keeps its img for the file:// fallback');
    assert.equal(img.attrs.alt, '');
    assert.ok(img.attrs.srcset.includes('menubarTemplate@2x.png 2x'));
    assert.match(bar, /class="web-brand-name"[^>]*>Harflow</);
    assert.ok(bar.includes(hf.connectionIndicator('web', 'connected')), 'the Connected indicator');
    assert.match(hf.connectionIndicator('web', 'connected'), /Connected/, 'the indicator names its state');
  }
});

test('web sidebar is isolated from macOS hooks, ids and fixtures', () => {
  const { hf } = webHarness();
  const banned = ['filter', 'select-task'];
  for (const state of hf.webStates) {
    const html = hf.renderWeb(state);
    for (const [, action] of html.matchAll(/data-action="([^"]*)"/g)) {
      const name = action.split(':')[0];
      assert.ok(!banned.includes(name), `${state}: ${action}`);
      if (name === 'route') assert.match(action, /^route:web\//, `${state}: ${action}`);
      assert.ok(!/^route:(settings|new-session|workflow-editor)/.test(action), `${state}: ${action}`);
      assert.ok(name.startsWith('web-') || name === 'route', `${state}: ${action}`);
    }
    assert.ok(/data-action="web-filter:/.test(html) === (state === 'incoming'), `${state} keeps only its own web-filter segments`);
    const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${state} ids are unique`);
    assert.ok(!ids.includes('task-search') && !ids.includes('task-list'), state);
    assert.doesNotMatch(html, /task-filter|id="task-/, state);
    for (const text of ['Review session persistence', 'Session reliability', 'Development workflow', 'Review persistence', 'Verify recovery', 'fixture-']) assert.ok(!html.includes(text), `${state} leaks ${text}`);
  }
});

test('the appearance control says device on the web and Mac elsewhere', () => {
  const hf = loadDesignRuntime();
  assert.match(hf.appearanceControl({ web: true }), /title="System — follows this device"/);
  assert.doesNotMatch(hf.appearanceControl({ web: true }), /this Mac/);
  assert.match(hf.appearanceControl(), /title="System — follows this Mac"/);
  assert.match(hf.appearanceControl({}), /follows this Mac/);
  assert.doesNotMatch(hf.appearanceControl(), /this device/);
  for (const state of hf.webStates) {
    assert.match(hf.renderWeb(state), /follows this device/);
    assert.doesNotMatch(hf.renderWeb(state), /follows this Mac/);
  }
  hf.route = { theme: 'light', screen: 'tasks', state: 'populated' };
  assert.match(hf.sidebar('populated'), /follows this Mac/);
});

test('every web sidebar and title bar mock control shows a toast and never navigates', () => {
  const { hf, click, announcement, navigations, route } = webHarness();
  for (const state of hf.webStates) {
    route(state);
    const shell = hf.renderWeb(state);
    const mocks = Array.from(new Set(Array.from(webSidebar(shell).matchAll(/data-action="(web-mock:[^"]+)"/g), match => match[1]).concat(Array.from(/<div class="web-titlebar web-titlebar-side">[\s\S]*?<\/div>/.exec(shell)[0].matchAll(/data-action="(web-mock:[^"]+)"/g), match => match[1]))));
    assert.ok(mocks.includes('web-mock:New session') && mocks.includes('web-mock:Hide sidebar') && mocks.includes('web-mock:New workflow') && mocks.includes('web-mock:Settings'), state);
    for (const action of mocks) {
      announcement.textContent = '';
      click(action);
      const name = action.slice('web-mock:'.length);
      assert.equal(announcement.textContent, name.includes('mock only') ? name : `${name} · mock only`, `${state} ${action}`);
    }
  }
  assert.deepEqual(navigations, [], 'mock controls never navigate');
  // Incoming is a real route and keeps the web family.
  assert.match(webSidebar(hf.renderWeb('triggers')), /data-action="route:web\/incoming"/);
});

test('the web sidebar is a fixed 272 px column and long titles truncate', () => {
  // No layout engine is available, so the sizing and truncation rules are checked as CSS text.
  const css = fs.readFileSync(path.join(root, 'styles/web.css'), 'utf8');
  const rule = selector => css.split('\n').find(line => line.startsWith(`${selector} {`)) || '';
  const sidebar = rule('.web-sidebar');
  assert.match(sidebar, /\bwidth: 272px\b/);
  assert.match(sidebar, /\bmin-width: 0\b/);
  assert.match(sidebar, /\bmax-width: 272px\b/);
  assert.match(sidebar, /flex: 0 0 272px/);
  for (const selector of ['.web-task-text strong', '.web-side-item .web-fill']) {
    const declaration = rule(selector);
    assert.match(declaration, /overflow: hidden/, selector);
    assert.match(declaration, /text-overflow: ellipsis/, selector);
    assert.match(declaration, /white-space: nowrap/, selector);
  }
  assert.match(rule('.web-task-text'), /min-width: 0/, 'the text column can shrink below its content');
});

test('clicking the web Incoming item runs the catalog route handler into the web incoming state', () => {
  const { hf } = webHarness();
  const action = webEl(webSidebar(hf.renderWeb('triggers')), { 'data-action': 'route:web/incoming' }, 'button').attrs['data-action'];
  // route: actions are handled by one case in catalog.js, which cannot be loaded here; that case is extracted and run.
  const source = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  const routeCase = /case'route':(\{[^}]*\})/.exec(source)?.[1];
  assert.ok(routeCase, 'the catalog route case exists');
  const calls = [];
  const [name, ...tail] = action.split(':');
  new Function('HF', 'action', 'value', `switch(action){case'route':${routeCase}}`)({ navigate: (...args) => calls.push(args) }, name, tail.join(':'));
  assert.deepEqual(calls, [['web', 'incoming']]);
  assert.ok(hf.screens.find(screen => screen.id === 'web').states.includes('incoming'));
  assert.equal(hf.specimenStatus('web', 'incoming').kind, 'exploratory');
});

test('an appearance click in the web specimen changes the preference and keeps the web state', () => {
  const { hf, click, field, route } = webHarness();
  const writes = [];
  hf.createAppearanceController({ storage: { getItem: () => null, setItem: (key, value) => writes.push([key, value]) }, matchMedia: () => ({ matches: false, addEventListener() {} }), document: { documentElement: { dataset: {} }, querySelectorAll: () => [], querySelector: () => null }, location: { hash: '#web/incoming/system' }, history: { replaceState() {} } });
  route('incoming');
  click('web-filter:started');
  click('web-select:d5');
  route('trigger-editor');
  field('input', 'task', { value: 'edited' });
  const before = JSON.stringify(hf.webState());
  const light = webEl(hf.renderWeb('trigger-editor'), { 'data-appearance-preference': 'light' }, 'button');
  assert.ok(light, 'the web footer has the Light button');
  // The catalog click listener begins with the appearance branch; that branch is extracted and run with a real click target.
  const source = fs.readFileSync(path.join(root, 'scripts/catalog.js'), 'utf8');
  const branch = /const appearanceButton=e\.target\.closest\('\[data-appearance-preference\]'\);if\(appearanceButton\)\{[^}]*\}/.exec(source)?.[0];
  assert.ok(branch, 'the appearance branch exists');
  const target = { dataset: { appearancePreference: light.attrs['data-appearance-preference'] }, closest: selector => selector === '[data-appearance-preference]' ? target : null };
  new Function('HF', 'e', branch)(hf, { target });
  assert.equal(hf.appearance.preference, 'light');
  assert.deepEqual(writes.at(-1), ['harflow.appearance', 'light']);
  assert.equal(JSON.stringify(hf.webState()), before, 'filter, selection and the editor draft are unchanged');
  assert.equal(hf.webState().dirty, true);
  assert.equal(webEl(hf.renderWeb('trigger-editor'), { 'data-appearance-preference': 'light' }, 'button').attrs['aria-pressed'], 'true');
});

test('the inventory describes the web search as static and keeps the Today sentence once', () => {
  const inventory = fs.readFileSync(path.join(root, 'docs/screen-inventory.md'), 'utf8');
  const row = inventory.split('\n').find(line => line.startsWith('| `web/triggers`'));
  assert.ok(row, 'the web row exists');
  assert.ok(row.includes('a static disabled search field'));
  assert.ok(row.includes('the search field is static and disabled with no toast'));
  assert.doesNotMatch(row, /search[^;.]{0,40}(?:shows?|with) a toast/i);
  assert.equal(inventory.split('the editor sidebar drops the Today group as drawn').length - 1, 1);
});

test('web delivery fixtures: the Rejected workflow, Open the run, and Reveal semantics', () => {
  const { hf, click, route } = webHarness();
  route('incoming');
  const rejected = hf.webDeliveries.find(delivery => delivery.status === 'Rejected');
  assert.equal(rejected.workflow, 'Draft release notes');
  assert.ok(hf.webDeliveries.every(delivery => delivery.workflow !== 'Not started'), 'no row names "Not started" as a workflow');
  assert.ok(webText(click('web-select:d7')).includes('Workflow|Draft release notes|'));
  const withRun = [];
  for (const delivery of hf.webDeliveries) {
    const html = click(`web-select:${delivery.id}`);
    if (html.includes('Open the run')) withRun.push(delivery.id);
    assert.ok(!webText(html).includes('Workflow|Not started'), delivery.id);
  }
  assert.deepEqual(withRun, ['d2'], 'only the delivery that started #2481 links to the run');
  assert.match(click('web-select:d2'), /data-action="route:web\/run-failed">Open the run</);
  // Reveal keeps its label while aria-pressed carries the state.
  route('trigger-editor');
  let html = hf.renderWeb('trigger-editor');
  assert.equal(webEl(html, { 'data-action': 'web-reveal' }, 'button').attrs['aria-pressed'], 'false');
  assert.match(/data-action="web-reveal"[^>]*>([^<]*)</.exec(html)[1], /^Reveal$/);
  html = click('web-reveal');
  assert.equal(webEl(html, { 'data-action': 'web-reveal' }, 'button').attrs['aria-pressed'], 'true');
  assert.match(/data-action="web-reveal"[^>]*>([^<]*)</.exec(html)[1], /^Reveal$/);
  assert.doesNotMatch(html, />Hide</);
  html = click('web-reveal');
  assert.equal(webEl(html, { 'data-action': 'web-reveal' }, 'button').attrs['aria-pressed'], 'false');
});

test('the required actor condition survives a dispatched remove and the Not designed clause lists every ticket item', () => {
  const { hf, click, route } = webHarness();
  route('trigger-editor');
  click('web-cond-remove:c1');
  assert.deepEqual(Array.from(hf.webState().draft.conditions, condition => condition.id), ['c1', 'c2', 'c3']);
  assert.equal(hf.webState().dirty, false, 'a refused remove does not dirty the draft');
  click('web-cond-remove:c2');
  assert.deepEqual(Array.from(hf.webState().draft.conditions, condition => condition.id), ['c1', 'c3']);

  const inventory = fs.readFileSync(path.join(root, 'docs/screen-inventory.md'), 'utf8');
  const end = inventory.indexOf('(HarflowWeb#1, HarflowWeb#2).');
  assert.ok(end > 0, 'the web clause ends with the ticket references');
  const clause = inventory.slice(inventory.lastIndexOf("the web app's Login", end), end);
  const items = [
    // HarflowWeb#1 Not yet designed
    'Slack, generic Webhook and Schedule source settings', 'the new trigger flow and delete trigger', 'Test with sample results', 'secret rotation confirmation', 'the trigger list empty state', 'queue view and cancelling a queued run', 'recovery options behind the Failed badge', 'the web workflow editor', 'the web command review sheet for manual launches', 'the web approvals surface',
    // HarflowWeb#2 Not yet designed
    'empty and loading states', 'paging beyond the list', 'search', 'redelivering or replaying a delivery', 'waiting-for-approval presentation'
  ];
  for (const item of items) assert.ok(clause.includes(item), `missing: ${item}`);
  assert.ok(clause.startsWith("the web app's Login (HarflowWeb#3)"));
  assert.ok(inventory.includes('(HarflowWeb#1, HarflowWeb#2). '));
  assert.ok(clause.indexOf('Slack, generic') < clause.indexOf('empty and loading states'), 'HarflowWeb#1 items come before HarflowWeb#2 items');
});

test('the run-failed graph stacks inside a container when the run pane is narrow', () => {
  // No layout engine is available, so the stacking rule is checked as CSS text.
  const css = fs.readFileSync(path.join(root, 'styles/web.css'), 'utf8');
  assert.match(css, /\.web-run-main \{ container-type: inline-size; \}/);
  const block = /@container \(max-width: 640px\) \{([\s\S]*?)\n\}/.exec(css)?.[1];
  assert.ok(block, 'the container query exists');
  assert.match(block, /\.web-graph \{ flex-direction: column; align-items: stretch; overflow-y: auto; \}/);
  assert.match(block, /\.web-edge \{[^}]*width: 1\.5px; height: 16px/);
  assert.match(block, /\.web-node\.terminal \{ align-self: center; \}/);
  const hf = loadDesignRuntime();
  const html = hf.renderWeb('run-failed');
  assert.match(html, /<div class="web-run-main">[\s\S]*<div class="web-graph" role="group" aria-label="Workflow graph">/, 'the graph sits inside the container element');
});

test('the teardown mock timer is generation-guarded and cleared by a route change', () => {
  const scheduled = [], cleared = [];
  let nextId = 1;
  // The toast timer also uses setTimeout; the teardown mock is the 800 ms one.
  const mock = () => scheduled.filter(timer => timer.delay === 800);
  const timers = { setTimeout: (callback, delay) => { const id = nextId++; scheduled.push({ id, callback, delay }); return id; }, clearTimeout: id => { cleared.push(id); } };
  const { hf, announcement, start, click } = setupRunHarness({ timers });
  start('teardown-pending');
  click('wr-run-teardown');
  assert.equal(mock().length, 1);
  assert.match(hf.renderRun('teardown-pending'), /data-teardown="running"/);
  // Leaving the route clears the pending timer; entering again starts from Pending.
  hf.route = { theme: 'light', screen: 'workflow-run', state: 'running' };
  hf.resetWorkflowRun(hf.route);
  assert.ok(cleared.includes(mock()[0].id), 'the route change cleared the first timer');
  start('teardown-pending');
  assert.match(hf.renderRun('teardown-pending'), /data-teardown="pending"/);
  click('wr-run-teardown');
  assert.equal(mock().length, 2, 'the second run scheduled its own timer');
  assert.match(hf.renderRun('teardown-pending'), /data-teardown="running"/);
  // A stale first callback must not complete the second run.
  mock()[0].callback();
  assert.match(hf.renderRun('teardown-pending'), /data-teardown="running"/, 'the second run stays Running after the stale callback');
  assert.notEqual(announcement.textContent, 'Mock teardown completed · the run outcome stays Completed');
  mock()[1].callback();
  assert.match(hf.renderRun('teardown-pending'), /data-teardown="completed"/, 'its own callback completes it');
  assert.equal(announcement.textContent, 'Mock teardown completed · the run outcome stays Completed');
  // A callback that fires after leaving the route does nothing.
  hf.route = { theme: 'light', screen: 'workflow-run', state: 'running' };
  hf.resetWorkflowRun(hf.route);
  start('teardown-pending');
  click('wr-run-teardown');
  const late = mock().at(-1);
  hf.route = { theme: 'light', screen: 'workflow-run', state: 'setup-running' };
  hf.resetWorkflowRun(hf.route);
  late.callback();
  announcement.textContent = '';
  assert.match(hf.renderRun('setup-running'), /data-setup-run="setup-running"/);
  assert.notEqual(announcement.textContent, 'Mock teardown completed · the run outcome stays Completed');
});

test('setup run fallback panes never claim work that did not happen', () => {
  const { hf, start, click } = setupRunHarness();
  const copy = {
    'setup-running': ['Plan', 'Nothing has started yet. The plan appears once setup finishes.', 'Orchestrator: Waiting for setup'],
    'setup-failed': ['Plan', 'Nothing started. The run never reached its first node.', 'Orchestrator: Never started'],
    'teardown-pending': ['Plan · all nodes completed', "All nodes done. The run's outcome is Completed.", 'Orchestrator: Finished']
  };
  const banned = /1 of 2 completed|Orchestrator confirmed|Plan · \d of \d/;
  const check = (state, html, path) => {
    const pane = /<div class="wfr-setup wfr-setup-summary" data-setup-fallback="([^"]+)">([\s\S]*?)<\/div>/.exec(html);
    assert.ok(pane, `${state} ${path}: the fallback pane renders`);
    assert.equal(pane[1], state);
    const text = runText(pane[2]).replace(/^\||\|$/g, '').split('|');
    assert.deepEqual(text.slice(0, 3), copy[state], `${state} ${path} copy`);
    if (state === 'teardown-pending') assert.equal(text[3], 'Teardown pending: Harflow stopped before it finished. Select End to run it.', `${state} ${path} note`);
    else assert.equal(text.length, 3);
    assert.doesNotMatch(html, banned, `${state} ${path}`);
    assert.doesNotMatch(html, /data-setup-run=/, `${state} ${path} is not the command pane`);
  };
  for (const state of hf.setupRunStates) {
    start(state);
    check(state, click('wr-deselect'), 'deselected');
    start(state);
    check(state, click('wr-select:orchestrator'), 'orchestrator');
  }
  start('teardown-pending');
  check('teardown-pending', click('wr-mode:parallel'), 'parallel mode');
  // The fallback follows the teardown mock.
  assert.match(hf.setupRunFallback('teardown-pending', 'running'), /Teardown is running\./);
  assert.match(hf.setupRunFallback('teardown-pending', 'completed'), /Teardown completed\./);
  assert.doesNotMatch(hf.setupRunFallback('setup-failed'), /Teardown/);
});

test('the inventory keeps the run-failed header name and the web header renders it', () => {
  const inventory = fs.readFileSync(path.join(root, 'docs/screen-inventory.md'), 'utf8');
  assert.ok(inventory.includes('sidebar task titles and the run\'s Task input read "Fix #2481"'));
  assert.ok(inventory.includes('the run-failed header keeps the workflow name "Fix assigned bug" as on the canvas'));
  const hf = loadDesignRuntime();
  const header = /<header class="web-header"><div class="web-title"><h2>([\s\S]*?)<\/h2>/.exec(hf.renderWeb('run-failed'))[1];
  assert.match(header, /^Fix assigned bug /);
  assert.doesNotMatch(header, /Fix #2481/);
  assert.match(webText(hf.renderWeb('run-failed')), /Fix #2481/, 'task titles still read Fix #2481');
});

test('every asset cache key in index.html is the first 12 hex characters of the file SHA-256', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const references = [...html.matchAll(/(?:href|src)="([^"?]+)\?v=([0-9a-f]+)"/g)];
  assert.ok(references.length >= 40, 'index.html references versioned assets');
  const stale = [];
  for (const [, file, key] of references) {
    const digest = createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 12);
    if (digest !== key) stale.push(`${file}: ${key} should be ${digest}`);
  }
  assert.deepEqual(stale, []);
  assert.equal((html.match(/\?v=/g) || []).length, references.length, 'every ?v= reference was checked');
  assert.ok(references.some(([, file]) => file === 'scripts/appearance.js'));
});

test('web and setup-run markup stay inside their own states', () => {
  const hf = loadDesignRuntime();
  const web = /web-app|web-sidebar|data-web-field|web-delivery|web-segmented/;
  const run = /data-setup-run|wfr-setup|wfr-badge-elapsed|wfr-run-again/;
  for (const family of hf.screens) for (const state of family.states) {
    hf.route = { theme: 'light', screen: family.id, state };
    if (family.id === 'workflow-run') hf.resetWorkflowRun(hf.route);
    if (family.id === 'workflow-editor') hf.editorController.reset(state);
    if (family.id === 'web') hf.resetWeb();
    const html = renderers[family.id](hf, state);
    assert.equal(web.test(html), family.id === 'web', `${family.id}/${state} web markup`);
    assert.equal(run.test(html), family.id === 'workflow-run' && hf.setupRunStates.includes(state), `${family.id}/${state} setup run markup`);
  }
  hf.editorController.reset('saved');
});

test('council editor markup and run markup stay inside their own states', () => {
  const hf = loadDesignRuntime();
  const editorMarkup = /editor-council|add:council|data-council-(member|field|card|heading|root)/;
  const runMarkup = /wfr-council|council-turn|wr-select:council|council-phase/;
  for (const family of hf.screens) {
    for (const state of family.states) {
      hf.route = { theme: 'light', screen: family.id, state };
      if (family.id === 'workflow-run') hf.resetWorkflowRun(hf.route);
      if (family.id === 'workflow-editor') hf.editorController.reset(state);
      const html = renderers[family.id](hf, state);
      assert.equal(editorMarkup.test(html), family.id === 'workflow-editor' && hf.councilEditorRoutes.includes(state), `${family.id}/${state} council editor markup`);
      assert.equal(runMarkup.test(html), family.id === 'workflow-run' && hf.councilRunStates.includes(state), `${family.id}/${state} council run markup`);
    }
  }
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

const approvalStates = ['delivering', 'delivered', 'executed-succeeded', 'executed-failed', 'delivery-unknown', 'decision-lost', 'result-unknown', 'expiry-override', 'system-rejected', 'invalidated', 'incomplete', 'capability-lost', 'undecidable', 'multiple-pending', 'multiple-bounded', 'loading', 'action-bash', 'action-write', 'action-edit', 'action-codex-command', 'action-codex-filechange', 'action-generic', 'answered-from-monitor', 'source-attribution', 'accepted', 'not-delivered', 'cancelled', 'ownership-lost', 'unknown-values'];
const approvalText = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('exploratory approval states are registered, reachable, listed in the inventory and render without raw JSON or ids', () => {
  const hf = loadDesignRuntime();
  const family = hf.screens.find((screen) => screen.id === 'approvals');
  const inventory = fs.readFileSync(path.join(root, 'docs/screen-inventory.md'), 'utf8');
  for (const state of approvalStates) {
    assert.ok(family.states.includes(state), `${state} is registered`);
    assert.ok(inventory.includes(`approvals/${state}\``), `${state} is in the inventory`);
    assert.equal(hf.specimenStatus('approvals', state).kind, 'exploratory', state);
    for (const theme of ['light', 'dark']) {
      hf.route = { theme, screen: 'approvals', state };
      const html = hf.renderTasks('approvals', state);
      assert.ok(html.length > 0, `${state} renders in ${theme}`);
      const panel = hf.approvalPanel();
      assert.ok(panel.length > 0, `${state} has an approval panel`);
      assert.doesNotMatch(approvalText(panel), /approval_0\d|sha256:|\{"|"tool_name"|task_id/, `${state} exposes no raw JSON or routine ids`);
    }
  }
  assert.match(inventory, /Exploratory, pending approval/);
});

test('delivery and outcome states keep approval distinct from successful execution', () => {
  const hf = loadDesignRuntime();
  const text = (state) => { hf.renderTasks('approvals', state); return approvalText(hf.approvalPanel()); };
  assert.match(text('delivering'), /Decision accepted\. Delivering to the agent\./);
  assert.doesNotMatch(text('delivering'), /Approve once/);
  assert.match(text('delivered'), /Whether the action ran has not been observed\. Approval does not mean the action succeeded\./);
  assert.match(text('executed-succeeded'), /The action ran and succeeded\./);
  assert.match(text('executed-failed'), /The action ran and failed\. Approval does not mean the action succeeded\./);
  assert.match(text('delivery-unknown'), /Harflow will not retry this decision\./);
  assert.match(text('expiry-override'), /The deadline passed before the approval could be delivered\. Harflow sent a rejection instead, so the action was not run\./);
  const system = text('system-rejected');
  assert.match(system, /rejected by Harflow/);
  hf.renderTasks('approvals', 'system-rejected');
  assert.match(approvalText(hf.approvalPanel()), /Request too large to review/, 'row metadata carries the system reason');
  assert.match(approvalText(hf.approvalPanel()), /Rejected by Harflow: Protected path, agents cannot change \.git\/config\. The action was not run\./);
  assert.match(text('invalidated'), /Decision not applied\./);
  assert.equal(hf.approvalController.canRespond(), false);
});

test('refusal, capability and incomplete states disable approval with an explanation', () => {
  const hf = loadDesignRuntime();
  const text = (state) => { hf.renderTasks('approvals', state); return approvalText(hf.approvalPanel()); };
  assert.match(text('decision-lost'), /The request is no longer current and was not changed\./);
  assert.match(text('result-unknown'), /The result could not be confirmed\. Harflow refreshed this request and did not send your answer again\./);
  assert.equal(hf.approvalController.canRespond(), false);
  assert.match(text('incomplete'), /Approval is disabled because the full action is not available to review\./);
  assert.match(hf.approvalPanel(), /data-action="approval-decision:approve:[^"]+" disabled/);
  assert.equal(hf.approvalController.canRespond(), false);
  const lost = text('capability-lost');
  assert.match(lost, /This engine does not support Mac responses\./);
  assert.match(lost, /became unavailable after inspection/);
  assert.doesNotMatch(hf.approvalPanel(), /data-action="approval-decision:/);
  assert.match(text('undecidable'), /could not confirm this Mac is not running inside an agent task/);
  assert.doesNotMatch(hf.approvalPanel(), /data-action="approval-decision:/);
  assert.equal(hf.approvalController.canRespond(), false);
  assert.match(text('loading'), /Loading approval requests/);
});

test('multiple pending requests render separate cards, a counted hint and bounded guidance', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'multiple-pending');
  assert.equal((hf.approvalPanel().match(/class="approval-card approval-inline approval-pending"/g) || []).length, 3);
  assert.match(approvalText(hf.approvalTail()), /Waiting for approval: Bash · git push origin main · 2 more/);
  assert.match(approvalText(hf.approvalHint()), /3 pending requests · View in Activity/);
  assert.doesNotMatch(approvalText(hf.approvalPanel()), /More requests are pending than shown/);
  hf.renderTasks('approvals', 'multiple-bounded');
  assert.match(approvalText(hf.approvalPanel()), /More requests are pending than shown here\. Refresh or load more to see them\./);
  assert.match(hf.approvalPanel(), /data-action="approval-page"/);
  assert.match(approvalText(hf.approvalHint()), /3\+ pending requests/);
  assert.match(hf.approvalPanel(), /role="group" tabindex="-1" aria-label="Approval request 1 of 3"/);
  hf.renderTasks('approvals', 'source-attribution');
  assert.match(approvalText(hf.approvalPanel()), /Workflow step: Implement/, 'visible without inspection');
  assert.match(approvalText(hf.approvalTail()), /Waiting for approval: Write · Sources\/Persistence\/Store\.swift/);
  hf.renderTasks('approvals', 'monitor-pending');
  assert.equal(approvalText(hf.approvalTail()).trim(), 'Waiting for approval: Bash · git push origin main');
});

test('readable action renderers show every authorization-relevant value', () => {
  const hf = loadDesignRuntime();
  const text = (state) => { hf.renderTasks('approvals', state); return approvalText(hf.approvalPanel()); };
  const bash = text('action-bash');
  for (const part of ['Run command', 'swift test --filter PersistenceTests', 'Run the persistence tests', 'In /Users/example/repo', 'timeout', '120000']) assert.ok(bash.includes(part), `bash: ${part}`);
  const write = text('action-write');
  for (const part of ['Write file', 'Path: Sources/Persistence/Store.swift', 'import Foundation', 'let value39 = "39"']) assert.ok(write.includes(part), `write: ${part}`);
  assert.match(hf.approvalPanel(), /class="approval-scroll"/);
  const edit = text('action-edit');
  for (const part of ['Edit file', 'Replace this text', 'let limit = 10', 'With this text', 'let retries = 3', 'replace_all', 'No']) assert.ok(edit.includes(part), `edit: ${part}`);
  const codex = text('action-codex-command');
  for (const part of ['swift test --filter PersistenceTests', 'In /Users/example/repo', 'timeout_ms', 'sandbox · mode', 'workspace-write', 'sandbox · network']) assert.ok(codex.includes(part), `codex command: ${part}`);
  const files = text('action-codex-filechange');
  for (const part of ['Change files', 'Update Sources/Store.swift', 'Add Sources/Cache.swift', 'Delete Sources/Legacy.swift', 'Update Sources/Old.swift → Sources/Renamed.swift', '+let limit = 25', '-final class Legacy {}']) assert.ok(files.includes(part), `file change: ${part}`);
  const generic = text('action-generic');
  for (const part of ['mcp__tracker__update_issue', 'Leading space kept', 'labels 1', 'bug', 'labels 2', 'Empty text', 'assignee', 'No value', 'estimate', '3', 'archived', 'metadata', 'Empty object', 'options · notify', 'options · fields 2', 'owner', 'unknown_future_key', 'kept as is']) assert.ok(generic.includes(part), `generic: ${part}`);
  assert.match(hf.approvalPanel(), /<dd>  Leading space kept <\/dd>/);
});

test('settled cards state their provenance and bound the agent reason', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'answered-from-monitor');
  const answered = approvalText(hf.approvalPanel());
  assert.match(answered, /Answered from Harflow/);
  assert.match(answered, /Answered by the owning caller/);
  assert.match(answered, /Agent's stated reason/);
  assert.doesNotMatch(answered, /by you/i);
  const state = hf.approvalController.state;
  state.detail = { ...state.detail, reason: 'x'.repeat(900) };
  const reason = /approval-reason"><span>[^<]*<\/span><p>([^<]*)<\/p>/.exec(hf.approvalPanel())[1];
  assert.equal(reason.length, 400);
  assert.ok(reason.endsWith('…'));
  hf.renderTasks('approvals', 'approved');
  assert.doesNotMatch(approvalText(hf.approvalPanel()), /Answered (from|by)/);
});

test('invalidation copy depends on delivery, and accepted, delivering and failed delivery are distinct', () => {
  const hf = loadDesignRuntime();
  const text = (state) => { hf.renderTasks('approvals', state); return approvalText(hf.approvalPanel()); };
  assert.match(text('invalidated'), /The task stopped or its owner is gone, so the answer was not delivered\./);
  const cancelled = text('cancelled');
  assert.match(cancelled, /Decision not applied\. Delivery could not be confirmed; Harflow will not retry\./);
  assert.doesNotMatch(cancelled, /was not delivered/);
  assert.match(cancelled, /invalidated · delivery unknown/);
  hf.approvalController.state.detail = { ...hf.approvalController.state.detail, delivery: 'sent' };
  assert.doesNotMatch(approvalText(hf.approvalPanel()), /was not delivered|will not retry/);
  assert.match(text('ownership-lost'), /Decision not applied\. The owner of this request is gone\./);
  assert.equal(hf.approvalController.canRespond(), false);
  assert.match(text('accepted'), /Decision accepted\. Waiting to deliver to the agent\./);
  assert.match(text('accepted'), /approved · accepted/);
  assert.match(text('delivering'), /approved · delivering/);
  assert.match(text('not-delivered'), /Not delivered\. The action was not run\./);
  assert.match(text('expiry-override'), /rejection delivered/, 'delivery state stays visible');
});

test('unknown ownership, state, delivery and reason values display as unknown and are never actionable', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'unknown-values');
  const text = approvalText(hf.approvalPanel());
  assert.match(text, /unknown/);
  assert.match(text, /does not recognize/);
  assert.doesNotMatch(hf.approvalPanel(), /data-action="approval-decision:/);
  assert.equal(hf.approvalController.canRespond(), false);
  for (const field of ['ownership', 'disposition', 'delivery', 'execution_outcome']) {
    hf.renderTasks('approvals', 'inspected');
    const model = hf.approvalController.state;
    assert.equal(hf.approvalController.canRespond(), true);
    model.detail = { ...model.detail, [field]: 'future-value' };
    model.requests = model.requests.map((r) => ({ ...r, [field]: 'future-value' }));
    assert.equal(hf.approvalController.canRespond(), false, field);
  }
});

test('uncertain submissions stay read-only across inspection and refresh', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'result-unknown');
  const model = hf.approvalController.state;
  assert.equal(hf.approvalController.canRespond(), false);
  assert.ok(hf.approvalController.inspect('approval_01'));
  assert.equal(model.current, true);
  assert.equal(hf.approvalController.canRespond(), false, 'inspection does not re-enable approval');
  assert.match(approvalText(hf.approvalPanel()), /did not send your answer again/);
  assert.ok(hf.approvalController.refresh({ requests: model.requests, total: 1 }));
  assert.equal(hf.approvalController.canRespond(), false, 'refresh does not re-enable approval');
  assert.equal(hf.approvalController.beginResponse('approve'), null);
  assert.match(approvalText(hf.approvalPanel()), /did not send your answer again/);
  hf.approvalController.refresh({ requests: model.requests.map((r) => ({ ...r, disposition: 'approved', delivery: 'sent' })), total: 1 });
  assert.equal(model.uncertain, false, 'reconciliation clears uncertainty once the request settled');
});

test('approval is gated on renderer coverage of the whole action', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'action-codex-filechange');
  const model = hf.approvalController.state;
  const mutate = (change) => {
    hf.renderTasks('approvals', 'inspected');
    const m = hf.approvalController.state;
    m.requests[0] = { ...m.requests[0], tool_name: 'fileChange', action: { tool_name: 'fileChange', input: { changes: [change] } } };
    m.detail = m.requests[0];
    return m;
  };
  mutate({ path: 'a.swift', kind: 'update', diff: '+x' });
  assert.equal(hf.approvalController.canRespond(), true, 'fully rendered change is approvable');
  mutate({ path: 'a.swift', kind: { type: 'update', futureFlag: true }, diff: '+x' });
  assert.match(approvalText(hf.approvalPanel()), /kind · futureFlag/);
  assert.equal(hf.approvalController.canRespond(), true, 'extra nested keys are rendered through the generic renderer');
  mutate({ path: 'a.swift', kind: 'update', diff: { hunks: 3 }, extra: [1, 2] });
  const typed = approvalText(hf.approvalPanel());
  assert.match(typed, /diff · hunks 3/);
  assert.match(typed, /extra 1 1/);
  mutate({ path: 'a.swift', kind: 42, diff: null });
  assert.match(approvalText(hf.approvalPanel()), /kind 42/);
  assert.match(approvalText(hf.approvalPanel()), /diff No value/);
  assert.ok(model, 'model reference kept');
  hf.renderTasks('approvals', 'action-write');
  const write = hf.approvalController.state;
  write.detail = { ...write.detail, action: { tool_name: 'Write', input: { file_path: 'a', content: 'b', mode: 420 } } };
  assert.match(approvalText(hf.approvalPanel()), /mode 420/);
});

test('known routine Codex metadata is hidden while unknown inputs stay visible', () => {
  const hf = loadDesignRuntime();
  for (const state of ['action-codex-command', 'action-codex-filechange']) {
    hf.renderTasks('approvals', state);
    assert.doesNotMatch(approvalText(hf.approvalPanel()), /threadId|turnId|itemId|startedAtMs|thr_01|item_0/, state);
    assert.equal(hf.approvalController.canRespond(), true, `${state} stays approvable with hidden routine metadata`);
  }
  const model = hf.approvalController.state;
  model.detail = { ...model.detail, action: { tool_name: 'fileChange', input: { threadId: 't', changes: [{ path: 'a', kind: 'add', diff: '+' }], approvalPolicy: 'never' } } };
  const html = approvalText(hf.approvalPanel());
  assert.match(html, /approvalPolicy never/);
  assert.doesNotMatch(html, /threadId/);
});

test('the agent reason sits outside the requested action region', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'answered-from-monitor');
  const html = hf.approvalPanel();
  const focus = /<div class="approval-action-focus"[\s\S]*?<\/div><\/div>/.exec(html)[0];
  assert.doesNotMatch(focus, /stated reason/);
  assert.ok(html.indexOf('approval-reason') > html.indexOf(focus));
});

test('approved approval states keep the approved markup (pending always expanded, settled rows collapsible)', () => {
  const hf = loadDesignRuntime();
  const baseline = { 'monitor-pending': '6b4d099cadfbfa0d', inspected: '6b4d099cadfbfa0d', submitting: 'e1aed47d58095cd1', 'caller-owned': '184f97372d984dc7', 'caller-owned-legacy': 'ef3a33afbc0eab43', history: 'c735a62fc9b671f9', pagination: 'bff6f023009868dc', approved: '12b3f7025b228d0c', denied: 'e47e38c78a76776c', expired: 'd3b082b499a8f850', error: '1dd6a3893861702f' };
  for (const [state, expected] of Object.entries(baseline)) {
    const page = hf.renderTasks('approvals', state);
    const digest = createHash('sha256').update([page, hf.approvalPanel(), hf.approvalTail(), hf.approvalHint()].join('\n--\n')).digest('hex').slice(0, 16);
    assert.equal(digest, expected, `${state} markup is unchanged`);
  }
});

test('uncertainty and ownership loss follow the submitted request, not the selection', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'result-unknown');
  const model = hf.approvalController.state;
  const original = model.requests[0];
  const settled = { ...original, id: 'approval_02', digest: 'sha256:fixture-action-02', disposition: 'approved', delivery: 'sent', decision: 'approve' };
  hf.approvalController.refresh({ requests: [original, settled], total: 2 });
  assert.ok(hf.approvalController.inspect('approval_02'));
  hf.approvalController.refresh({ requests: [original, settled], total: 2 });
  assert.ok(hf.approvalController.inspect('approval_01'));
  assert.equal(hf.approvalController.canRespond(), false, 'the submitted request stays blocked');
  assert.equal(hf.approvalController.beginResponse('reject'), null);
  hf.approvalController.refresh({ requests: [{ ...original, disposition: 'approved', delivery: 'sent' }, settled], total: 2 });
  assert.equal(model.uncertain, false, 'reconciled by identity once that request settles');
  hf.renderTasks('approvals', 'ownership-lost');
  assert.ok(hf.approvalController.inspect('approval_01'));
  assert.match(hf.approvalController.state.error, /owner of this request is gone/);
  assert.equal(hf.approvalController.canRespond(), false);
  assert.equal(hf.approvalController.beginResponse('approve'), null);
  assert.equal(hf.approvalController.beginResponse('reject'), null);
  hf.approvalController.refresh({ requests: hf.approvalController.state.requests, total: 1 });
  assert.equal(hf.approvalController.canRespond(), false);
});

test('run sidebar approval states render caller approvals above the request and goal', () => {
  const hf = loadDesignRuntime();
  const family = hf.screens.find(f => f.id === 'workflow-run');
  const render = state => { hf.route = { screen: 'workflow-run', state, theme: 'light' }; hf.resetWorkflowRun(hf.route); return hf.renderRun(state); };
  const sidebar = html => /<aside class="wfr-run-sidebar"[\s\S]*?<\/aside>/.exec(html)[0];
  const text = html => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const state of ['run-approval-pending', 'run-approval-multiple', 'run-approval-settled', 'run-approval-legacy']) {
    assert.ok(family.states.includes(state));
    assert.equal(hf.specimenStatus('workflow-run', state).kind, 'exploratory');
  }
  const pending = sidebar(render('run-approval-pending'));
  assert.ok(pending.indexOf('wfr-approvals') < pending.indexOf('Original request'), 'approvals precede the request');
  assert.match(text(pending), /Workflow step: Implement/);
  assert.match(text(pending), /Agent task: Implement persistence checks/);
  assert.match(pending, /data-action="approval-decision:approve:[^"]+"/);
  assert.doesNotMatch(text(pending), /task_0|approval_0|sha256/);
  const multiple = text(sidebar(render('run-approval-multiple')));
  assert.match(multiple, /Approval request 1 of 2\+/);
  assert.match(multiple, /Workflow step: Review/);
  assert.match(multiple, /More requests are pending/);
  assert.equal((sidebar(render('run-approval-multiple')).match(/class="approval-action-focus"/g) || []).length, 2, 'both pending requests are expanded');
  assert.doesNotMatch(sidebar(render('run-approval-multiple')), /data-action="approval-inspect:/, 'pending requests have no inspect toggle');
  assert.equal(hf.approvalController.inspect('approval_02'), true, 'run-scoped requests from other tasks can be inspected');
  assert.match(text(hf.approvalRunPanel()), /Sources\/Persistence\/Store\.swift/);
  assert.equal(hf.approvalController.canRespond(), true);
  const settled = text(sidebar(render('run-approval-settled')));
  assert.match(settled, /Answered from Harflow/);
  assert.match(settled, /expired/);
  const legacy = sidebar(render('run-approval-legacy'));
  assert.match(text(legacy), /does not support Mac responses/);
  assert.doesNotMatch(legacy, /approval-decision/);
  assert.doesNotMatch(sidebar(render('running')), /wfr-approvals/);
});

test('a pending request is always expanded and cannot be collapsed', () => {
  const hf = loadDesignRuntime();
  for (const state of ['monitor-pending', 'multiple-pending', 'incomplete', 'capability-lost', 'undecidable', 'ownership-lost', 'unknown-values', 'result-unknown', 'decision-lost']) {
    hf.renderTasks('approvals', state);
    const html = hf.approvalPanel();
    assert.doesNotMatch(html, /data-pending="(true)"[^>]*>(?:<button[^>]*approval-inspect)/, `${state} has no inspect toggle on pending`);
    assert.equal((html.match(/class="approval-action-focus"/g) || []).length, hf.approvalController.state.requests.length, `${state} expands every request`);
  }
  hf.renderTasks('approvals', 'multiple-pending');
  assert.equal(hf.approvalController.state.requests.every(hf.approvalController.isPending), true);
  assert.equal((hf.approvalPanel().match(/Approve once/g) || []).length, 3);
  const before = hf.approvalPanel();
  hf.approvalController.inspect('approval_01');
  assert.equal(hf.approvalController.state.selectedID, 'approval_01');
  assert.equal(hf.approvalController.inspect('approval_01'), true);
  assert.equal(hf.approvalController.state.selectedID, 'approval_01', 'a second inspect does not collapse a pending request');
  assert.match(hf.approvalPanel(), /Approve once/);
  assert.ok(before.length > 0);
  assert.equal(hf.approvalController.respond('approve', 'approval_03'), true, 'any expanded pending request can be answered');
});

test('a refresh that settles a request collapses it to its compact row', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'inspected');
  const model = hf.approvalController.state;
  assert.match(hf.approvalPanel(), /class="approval-action-focus"/);
  const settled = { ...model.requests[0], disposition: 'approved', delivery: 'sent', decision: 'approve', decided_by: 'caller', responder: 'caller' };
  assert.ok(hf.approvalController.refresh({ requests: [settled], total: 1 }));
  const html = hf.approvalPanel();
  assert.doesNotMatch(html, /class="approval-action-focus"/, 'the settled request is collapsed');
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /approved · delivered/);
});

test('settled rows expand and collapse, and settling a local response collapses the row', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'history');
  hf.approvalController.state.selectedID = null;
  hf.approvalController.state.detail = null;
  assert.doesNotMatch(hf.approvalPanel(), /aria-expanded="true"/);
  assert.equal(hf.approvalController.inspect('approval_02'), true);
  assert.match(hf.approvalPanel(), /aria-expanded="true"[^>]*aria-label="Collapse/);
  assert.equal(hf.approvalController.inspect('approval_02'), true);
  assert.doesNotMatch(hf.approvalPanel(), /aria-expanded="true"/);
  hf.renderTasks('approvals', 'caller-owned');
  const settle = hf.approvalController.beginResponse('approve');
  assert.ok(settle());
  assert.equal(hf.approvalController.state.selectedID, null);
  assert.doesNotMatch(hf.approvalPanel(), /class="approval-action-focus"/);
});

test('pending approval cards carry the warning class and settled rows do not', () => {
  const hf = loadDesignRuntime();
  for (const state of ['monitor-pending', 'multiple-pending', 'incomplete', 'capability-lost', 'undecidable', 'ownership-lost', 'unknown-values', 'result-unknown', 'submitting']) {
    hf.renderTasks('approvals', state);
    assert.match(hf.approvalPanel(), /class="approval-card approval-inline approval-pending"/, `${state} is warned`);
  }
  for (const state of ['approved', 'denied', 'expired', 'delivered', 'executed-succeeded']) {
    hf.renderTasks('approvals', state);
    assert.doesNotMatch(hf.approvalPanel(), /approval-pending/, `${state} is neutral`);
  }
  assert.match(fs.readFileSync(path.join(root, 'styles/task-approvals.css'), 'utf8'), /\.approval-card\.approval-pending \{ background:var\(--warningBG\); border:1px solid var\(--warningFG\)/);
  const hf2 = loadDesignRuntime();
  hf2.route = { screen: 'workflow-run', state: 'run-approval-settled', theme: 'light' };
  hf2.resetWorkflowRun(hf2.route);
  assert.doesNotMatch(hf2.renderRun('run-approval-settled'), /approval-pending/);
  hf2.route = { screen: 'workflow-run', state: 'run-approval-multiple', theme: 'light' };
  hf2.resetWorkflowRun(hf2.route);
  assert.equal((hf2.renderRun('run-approval-multiple').match(/approval-pending/g) || []).length, 2);
});

test('an expired request is a settled, collapsed, neutral row that can be expanded', () => {
  const hf = loadDesignRuntime();
  hf.renderTasks('approvals', 'expired');
  const html = hf.approvalPanel();
  assert.match(html, /expired · rejected by Harflow/);
  assert.doesNotMatch(html, /approval-pending|approval-action-focus/);
  assert.equal(hf.approvalController.inspect('approval_01'), true);
  assert.match(hf.approvalPanel(), /Harflow rejected the request, so the action was not run/);
});
