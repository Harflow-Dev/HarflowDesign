import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const v2 = path.join(root, 'v2');
const read = file => fs.readFileSync(path.join(v2, file), 'utf8');

function loadRuntime() {
  const context = vm.createContext({ window: {} });
  context.window = context;
  const scripts = fs.readdirSync(path.join(v2, 'scripts')).filter(name => name !== 'catalog.js');
  for (const name of ['registry.js', ...scripts.filter(name => name !== 'registry.js')]) vm.runInContext(read(path.join('scripts', name)), context, { filename: name });
  return context.HFV2;
}
const HFV2 = loadRuntime();
const json = value => JSON.parse(JSON.stringify(value));
const loadingStates = HFV2.registry.families.flatMap(family => family.states.filter(state => state.skeleton).map(state => ({ family, state, route: `${family.id}/${state.id}` })));
const KINDS = ['rows', 'html', 'custom', 'text', 'fill', 'hide', 'remove', 'disable', 'drop', 'attr', 'settext', 'pin'];
const REGION_KINDS = ['rows', 'html', 'custom'];

// The loaded screen each loading state mirrors, pinned. A loaded reference is an approved, registered state.
const REFERENCES = {
  'new-task/loading': 'new-task/centered-empty',
  'sidebar/loading': 'new-task/centered-empty',
  'task/loading': 'task/running-stop',
  'task/loading-pane': 'task/pane-running-open',
  'parallel-group/loading': 'parallel-group/lanes',
  'needs-you/loading': 'needs-you/waiting',
  'menu-bar/loading': 'menu-bar/busy',
  'workflows/loading': 'workflows/list',
  'workflow-editor/loading': 'workflow-editor/node-selected',
  'workflow-run/loading': 'workflow-run/on-demand',
  'workflow-run/loading-parallel': 'workflow-run/parallel',
  'resources/loading': 'resources/slots',
  'statistics/loading': 'statistics/overview',
  'settings/loading-general': 'settings/general',
  'settings/loading-harnesses': 'settings/harnesses',
  'settings/loading-mcp-approvals': 'settings/mcp-approvals'
};

test('every loading state mirrors a pinned, approved and current loaded state', () => {
  assert.ok(loadingStates.length > 0);
  for (const { route, state, family } of loadingStates) {
    assert.ok(route in REFERENCES, `${route} is a known loading state`);
    assert.equal(state.skeleton.of, REFERENCES[route], `${route} mirrors ${REFERENCES[route]}`);
    const loaded = HFV2.describe(state.skeleton.of);
    assert.ok(loaded && loaded.status === 'approved', `${state.skeleton.of} is a registered approved state`);
    assert.ok(!(state.skeleton.of in HFV2.routeRedirects), `${state.skeleton.of} is not retired`);
    assert.equal(state.group, 'Loading');
    assert.ok(family.groups.includes('Loading'), `${family.id} has a Loading group`);
    const d = HFV2.describe(route);
    assert.equal(d.templateKey, loaded.templateKey, `${route} renders the template of its loaded state`);
    assert.equal(d.renderer, loaded.renderer);
    assert.equal(d.mount, loaded.mount);
  }
});

test('only sidebar/loading is approved; every other loading state is provisional and says so', () => {
  for (const { route, state } of loadingStates) {
    if (route === 'sidebar/loading') {
      assert.equal(state.status, 'approved');
      assert.deepEqual(json(state.approval), { by: 'the owner', date: '2026-11-08', decision: 'Sidebar' });
      assert.ok(HFV2.approvalLine(HFV2.findFamily('sidebar'), state).startsWith('Approved by the owner on 2026-11-08'));
    } else {
      assert.equal(state.status, 'provisional', route);
      assert.equal(state.approvalNote, 'Provisional · needs owner approval');
      assert.ok(!state.approval, `${route} carries no approval`);
    }
  }
});

test('sidebar/loading replaced sidebar/history-loading; no pending redraw pair names it', () => {
  assert.equal(HFV2.routeRedirects['sidebar/history-loading'], 'sidebar/loading');
  assert.equal(HFV2.findState(HFV2.findFamily('sidebar'), 'history-loading'), null);
  assert.equal(HFV2.resolveRoute('#sidebar/history-loading/dark'), '#sidebar/loading/dark');
  assert.equal(HFV2.resolveRoute('#m04-proposal/history-loading/light'), '#sidebar/loading/light', 'the earlier alias reaches it in one redirect');
  assert.equal(json(HFV2.pendingRedraw).length, 0);
  assert.ok(!('sidebar/loading' in HFV2.routeRedirects));
});

test('specs are complete: frame, label, region ops, valid kinds and an allowlist', () => {
  const used = new Set(loadingStates.map(({ state }) => state.skeleton.spec));
  for (const key of used) assert.ok(HFV2.skeletonSpecs[key], `spec ${key} exists`);
  for (const [key, spec] of Object.entries(HFV2.skeletonSpecs)) {
    assert.ok(spec.frame && /^Loading [A-Z]/.test(spec.label), `${key} has a frame and a label`);
    assert.ok(Array.isArray(spec.ops) && spec.ops.length >= 4, `${key} has ops`);
    for (const op of spec.ops) {
      assert.ok(KINDS.includes(op.kind), `${key}: ${op.kind} is a known kind`);
      assert.ok(typeof op.sel === 'string' && op.sel.startsWith(spec.frame.split(' ')[0]) || op.sel.startsWith('['), `${key}: ${op.sel} is scoped`);
      if (op.kind === 'rows') assert.ok(Number.isInteger(op.count) && op.count > 0 && typeof op.row === 'function');
      if (op.kind === 'html') assert.ok(typeof op.html === 'function' || typeof op.html === 'string');
    }
    assert.ok(spec.ops.some(op => REGION_KINDS.includes(op.kind)), `${key} replaces at least one data region`);
    assert.equal(spec.chrome[spec.label], 1, `${key} lists its loading label once`);
    for (const [text, n] of Object.entries(spec.chrome)) assert.ok(text.trim() && Number.isInteger(n) && n > 0, `${key}: ${JSON.stringify(text)} has a positive count`);
  }
  assert.notEqual(HFV2.skeletonSpecs['task'].chrome, HFV2.skeletonSpecs['task-pane'].chrome, 'the pane adds its own chrome');
});

test('the authored patterns contain blocks only: no text, digits or hrefs', () => {
  for (const [key, spec] of Object.entries(HFV2.skeletonSpecs)) {
    for (const op of spec.ops.filter(o => ['rows', 'html'].includes(o.kind))) {
      const outputs = [];
      if (op.kind === 'rows') for (let i = 0; i < op.count; i += 1) outputs.push(op.row(i, 32));
      else if (typeof op.html === 'function') for (let i = 0; i < 5; i += 1) outputs.push(op.html({}, i));
      else outputs.push(op.html);
      for (const html of outputs) {
        assert.equal(html.replace(/<[^>]*>/g, '').trim(), '', `${key}: ${op.sel} draws no text`);
        assert.ok(!/href=/.test(html), `${key}: ${op.sel} has no links`);
        assert.ok(!/aria-label|title=/.test(html), `${key}: ${op.sel} has no accessible names of its own`);
        for (const [, tag] of html.matchAll(/<(span|div|svg|line|hr)\b/g)) assert.ok(tag);
      }
    }
    for (const op of spec.ops.filter(o => o.kind === 'settext')) assert.ok(op.text in spec.chrome, `${key}: ${op.text} is allowlisted`);
    for (const op of spec.ops.filter(o => o.kind === 'attr' && o.value !== null)) assert.ok(op.value in spec.chrome, `${key}: ${op.value} is allowlisted`);
  }
});

test('allowlists carry no data: no name, count, time or status from a fixture', () => {
  const DATA = /\b(Fix flaky|Nightly dependency|Review preload|Release checklist|Add retry budget|Migrate events|Opus 5\.5|gpt-6|HarflowMCP|HarflowWeb|Scan lockfiles|Draft upgrade|Security reviewer|Docs checker|\d+ of \d+|in use|waiting)\b/;
  for (const [key, spec] of Object.entries(HFV2.skeletonSpecs)) {
    for (const text of Object.keys(spec.chrome)) {
      assert.ok(!DATA.test(text), `${key}: ${text}`);
      if (/\d/.test(text)) assert.ok(['⌘N', '65%', '70%', '7 days', '30 days', 'Tue 14:32'].includes(text), `${key}: digits only in listed numeric chrome: ${text}`);
    }
  }
});

test('the specs keep the loaded geometry: pinned regions, row counts that fit and one fixed title pattern', () => {
  const source = read('scripts/skeleton-specs.js');
  assert.match(source, /var TITLE = \[190, 140, 168, 120\]/);
  for (const [key, spec] of Object.entries(HFV2.skeletonSpecs)) {
    for (const op of spec.ops.filter(o => REGION_KINDS.includes(o.kind))) assert.ok(op.pin === 'fixed' || op.pin === 'min', `${key}: ${op.sel} pins its region`);
  }
});

test('the engine, the shimmer and the render hooks are wired', () => {
  const engine = read('scripts/skeleton.js');
  for (const name of ['H.skeletonize', 'H.skeletonScan', 'H.skelBlock']) assert.ok(engine.includes(name), name);
  assert.match(engine, /setAttribute\('aria-busy', 'true'\)/);
  assert.match(engine, /setAttribute\('role', 'group'\)/);
  assert.match(engine, /aria-hidden="true"/, 'blocks are hidden from assistive technology');
  const css = read('styles/skeleton.css');
  assert.match(css, /animation: hd-skel-sheen 1\.4s cubic-bezier\(0\.37, 0, 0\.63, 1\) infinite/);
  assert.match(css, /background-color: var\(--surface-active\)/);
  assert.match(css, /var\(--skeleton-sheen\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.hd-skel--shimmer \{ animation: none; background-image: none; \}/);
  const tokens = read('styles/tokens.css');
  assert.match(tokens, /--skeleton-sheen: rgba\(255, 255, 255, 0\.75\);/);
  assert.match(tokens, /\[data-theme="dark"\][\s\S]*--skeleton-sheen: rgba\(255, 255, 255, 0\.08\);/);
  const catalog = read('scripts/catalog.js');
  assert.match(catalog, /HFV2\.skeletonize\(host, skeletonSpec\)/);
  assert.match(catalog, /options\.afterRender = applySkeleton/);
  for (const name of ['m04-proposal.js', 'm05-proposal.js']) {
    const source = read(path.join('scripts', name));
    assert.match(source, /options\.afterRender|afterRender\(host\)/, `${name} calls afterRender`);
    assert.match(source, /loading/, `${name} has a loading mount`);
  }
  const html = read('index.html');
  for (const file of ['styles/skeleton.css', 'scripts/skeleton-specs.js', 'scripts/skeleton.js']) assert.ok(html.includes(file), `${file} is loaded`);
});

test('a loading mount ignores in-frame actions and a normal mount is untouched', () => {
  const m04 = read('scripts/m04-proposal.js');
  for (const handler of ['function input(e) {\n      if (loading) return;', 'function click(e) { if(loading)return;', 'if(loading)return;start(s);render();']) assert.ok(m04.includes(handler), handler);
  assert.match(m04, /if \(loading\) \{ lastRoute = null; lastState = null; \}/, 'a loading mount keeps no state for the next mount');
  const m05 = read('scripts/m05-proposal.js');
  assert.match(m05, /if \(ext && ext\.loading && a !== 'pane' && a\.indexOf\('tab-'\) !== 0\) return;/);
});

test('existing templates are byte-identical to the base commit apart from the token row and the retired mount', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'data', 'templates-854caae.json'), 'utf8'));
  // The overview page is generated from the registry, so its counts change with every new state.
  const CHANGED = new Set(['foundations/colour', 'brand/visual-foundations', 'overview/areas']);
  const RETIRED = new Set(['m04-proposal/history-loading']);
  for (const [key, sha] of Object.entries(manifest)) {
    if (RETIRED.has(key)) { assert.equal(HFV2.templates[key], undefined, `${key} is removed with its state`); continue; }
    assert.equal(typeof HFV2.templates[key], 'string', `${key} still exists`);
    if (CHANGED.has(key)) continue;
    assert.equal(crypto.createHash('sha1').update(HFV2.templates[key]).digest('hex'), sha, `${key} is unchanged`);
  }
});

test('the shimmer component is drawn in both appearances and its reduced-motion form', () => {
  const state = HFV2.findState(HFV2.findFamily('components'), 'skeleton-shimmer');
  assert.equal(state.status, 'provisional');
  const t = HFV2.templates['components/skeleton-shimmer'];
  assert.ok(t.includes('data-theme="light"') && t.includes('data-theme="dark"'));
  assert.ok(t.includes('hd-skel--shimmer hd-skel--still'), 'the static form is drawn');
  assert.ok(HFV2.componentDocs['components/skeleton-shimmer'].includes('aria-busy'));
});
