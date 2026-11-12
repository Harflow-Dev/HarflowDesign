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
const APPROVAL = { by: 'the owner', date: '2026-11-08', decision: 'Minimum window' };
const APPROVED_LINE = 'Approved by the owner on 2026-11-08 · Minimum window';
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b/i;

const STATES = {
  'needs-you/waiting-minimum': { of: 'needs-you/waiting', fixes: ['sidebar'], title: 'Waiting · 1000 × 620' },
  'parallel-group/lanes-minimum': { of: 'parallel-group/lanes', fixes: ['sidebar', 'lanes', 'topbar-meta'], title: 'Lanes · 1000 × 620' },
  'workflow-run/parallel-minimum': { of: 'workflow-run/parallel', fixes: ['sidebar', 'lanes', 'topbar-meta'], title: 'Parallel view · 1000 × 620' },
  'workflow-editor/node-selected-minimum': { of: 'workflow-editor/node-selected', fixes: ['sidebar', 'inspector', 'canvas', 'topbar-meta'], title: 'Node selected · 1000 × 620' },
  'workflow-editor/orchestrator-minimum': { of: 'workflow-editor/orchestrator', fixes: ['sidebar', 'inspector', 'canvas', 'topbar-meta'], title: 'Orchestrator · 1000 × 620' },
  'menu-bar/busy-minimum': { of: 'menu-bar/busy', fixes: ['popover'], title: 'Busy · 1000 × 620' }
};

// The loading drafts: the minimum draft of the same screen with its loading skeleton. `of` is the loaded route the draft
// derives from (one hop), `base` the minimum draft it is compared with in the browser checks.
const LOADING = {
  'needs-you/loading-minimum': { of: 'needs-you/waiting', base: 'needs-you/waiting-minimum', fixes: ['sidebar'], spec: 'needs-you' },
  'parallel-group/loading-minimum': { of: 'parallel-group/lanes', base: 'parallel-group/lanes-minimum', fixes: ['sidebar', 'lanes', 'topbar-meta'], spec: 'parallel-group-minimum' },
  'workflow-run/loading-parallel-minimum': { of: 'workflow-run/parallel', base: 'workflow-run/parallel-minimum', fixes: ['sidebar', 'lanes', 'topbar-meta'], spec: 'workflow-run-parallel-minimum' },
  'workflow-editor/loading-minimum': { of: 'workflow-editor/node-selected', base: 'workflow-editor/node-selected-minimum', fixes: ['sidebar', 'inspector', 'canvas', 'topbar-meta'], spec: 'workflow-editor-minimum' },
  'menu-bar/loading-minimum': { of: 'menu-bar/busy', base: 'menu-bar/busy-minimum', fixes: ['popover'], spec: 'menu-bar' }
};

test('the six minimum window states are registered, approved and derived from their loaded state', () => {
  const all = HFV2.registry.families.flatMap(f => f.states.filter(s => s.minimum && !s.skeleton).map(s => `${f.id}/${s.id}`));
  assert.deepEqual([...all].sort(), Object.keys(STATES).sort());
  for (const [route, want] of Object.entries(STATES)) {
    const [familyId, stateId] = route.split('/');
    const family = HFV2.findFamily(familyId);
    const state = HFV2.findState(family, stateId);
    assert.equal(state.status, 'approved', route);
    assert.ok(!('approvalNote' in state), `${route} carries no approval note`);
    assert.deepEqual(json(state.approval), APPROVAL, route);
    assert.equal(HFV2.approvalLine(family, state), APPROVED_LINE, route);
    assert.equal(state.group, 'Minimum window', route);
    assert.ok(family.groups.includes('Minimum window'), `${familyId} lists the group`);
    assert.equal(state.title, want.title);
    assert.deepEqual(JSON.parse(JSON.stringify(state.minimum)), { of: want.of, fixes: want.fixes });
    for (const fix of want.fixes) assert.ok(HFV2.minimumFixes.includes(fix), `${route} uses a known fix ${fix}`);
    const loaded = HFV2.describe(want.of), d = HFV2.describe(route);
    assert.equal(loaded.status, 'approved', `${want.of} is approved`);
    assert.equal(d.templateKey, loaded.templateKey, `${route} renders the template of ${want.of}`);
    assert.equal(d.renderer, null);
    assert.ok(d.templateKey in HFV2.templates);
    assert.equal(d.status, 'approved');
    assert.equal(d.approval, APPROVED_LINE);
    assert.deepEqual(JSON.parse(JSON.stringify(d.minimum)), { of: want.of, fixes: want.fixes });
    assert.ok(!(`${familyId}/${stateId}` in HFV2.templates), `${route} has no template of its own`);
  }
});

test('all eleven minimum window states are approved, each with its own approval, no approval note and no provisional strip', () => {
  const minimumStates = HFV2.registry.families.flatMap(f => f.states.filter(s => s.minimum).map(s => ({ family: f, state: s, route: `${f.id}/${s.id}` })));
  assert.equal(minimumStates.length, 11);
  assert.ok(minimumStates.every(({ route }) => route.endsWith('-minimum')), 'every minimum state has a -minimum id');
  const approvals = new Set();
  for (const { family, state, route } of minimumStates) {
    assert.ok(!('approvalNote' in state), `${route} carries no approval note`);
    assert.equal(state.status, 'approved', route);
    assert.deepEqual(json(state.approval), APPROVAL, route);
    approvals.add(state.approval);
    const d = HFV2.describe(route);
    assert.equal(d.approval, APPROVED_LINE, `${route} strip`);
    assert.ok(!/Provisional|needs owner approval|not approved/i.test(d.approval + state.title + state.description), `${route} says nothing provisional`);
    assert.equal(HFV2.approvalLine(family, state), APPROVED_LINE);
  }
  assert.equal(approvals.size, 11, 'each registration has its own approval object');
  // Other states whose id ends in -minimum (task/topbar-minimum) are not derived states and keep their own records.
  assert.deepEqual(json(HFV2.registry.families.flatMap(f => f.states.filter(s => s.minimum && 'approvalNote' in s).map(s => `${f.id}/${s.id}`))), []);
});

// The manifest holds the template digests of ba8c928. The templates are identical at 9d19fd7, the commit this work builds
// on (the baseline of these drafts), because that commit changed no template.
test('no existing template changed: the digests equal those of the base commit and none was added', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'data', 'templates-ba8c928.json'), 'utf8'));
  // The only templates added since are the provisional queued-message and approval states, the starting state without a status row
  // (approved 2026-11-09) and the provisional runtime card draft. The template of the retired starting state is removed with it.
  const added = [
    ...['stale', 'expired', 'answered-elsewhere', 'refused', 'uncertain', 'exact'].map(x => `task/approval-${x}`),
    'needs-you/approval-stale', 'needs-you/approval-expired', 'needs-you/answered-elsewhere', 'needs-you/checkpoint-stale',
    'menu-bar/approval-stale', 'menu-bar/answered-elsewhere',
    ...['queued', 'delivering', 'delivered', 'cancelled', 'send-now-refused', 'uncertain', 'unsupported', 'queued-settled'].map(x => `messages/message-${x}`),
    'm04-proposal/centered-starting-plain', 'm04-proposal/runtime-installing-sidebar',
    // The approved pending-launch states (2026-11-10) and the approved parallel-group lane states (2026-11-12).
    ...HFV2.pendingLaunchStates.map(([id]) => `task/pending-${id}`).filter(key => key in HFV2.templates),
    ...HFV2.parallelLaneStates.map(id => `parallel-group/${id}`).filter(key => key in HFV2.templates)
  ];
  assert.equal(added.length, 22 + 20 + 24);
  const removed = ['m04-proposal/centered-starting'];
  for (const key of removed) { assert.ok(key in manifest && !(key in HFV2.templates), `${key} is removed with its retired state`); delete manifest[key]; }
  for (const key of added) assert.ok(key in HFV2.templates, `${key} is a template`);
  assert.deepEqual(Object.keys(HFV2.templates).filter(key => !added.includes(key)).sort(), Object.keys(manifest).sort());
  // The overview page is generated from the registry (state counts and links), so it changes with every state added.
  for (const [key, sha] of Object.entries(manifest).filter(([key]) => key !== 'overview/areas')) {
    assert.equal(crypto.createHash('sha1').update(HFV2.templates[key]).digest('hex'), sha, `${key} is unchanged`);
  }
});

test('the five loading states are registered with the minimum() helper, approved, in the Minimum window group', () => {
  const all = HFV2.registry.families.flatMap(f => f.states.filter(s => s.minimum && s.skeleton).map(s => `${f.id}/${s.id}`));
  assert.deepEqual([...all].sort(), Object.keys(LOADING).sort());
  const source = read('scripts/screens-minimum.js');
  assert.equal((source.match(/^  minimum\('/gm) || []).length, 11, 'all eleven states go through minimum()');
  for (const [route, want] of Object.entries(LOADING)) {
    const [familyId, stateId] = route.split('/');
    const family = HFV2.findFamily(familyId), state = HFV2.findState(family, stateId);
    assert.equal(state.status, 'approved', route);
    assert.ok(!('approvalNote' in state), `${route} carries no approval note`);
    assert.deepEqual(json(state.approval), APPROVAL, route);
    assert.equal(state.group, 'Minimum window', route);
    assert.equal(state.title, 'Loading · 1000 × 620');
    assert.deepEqual(json(state.minimum), { of: want.of, fixes: want.fixes });
    assert.deepEqual(json(state.skeleton), { spec: want.spec }, `${route} declares a spec and no skeleton.of`);
    assert.equal(HFV2.approvalLine(family, state), APPROVED_LINE, `${route} shows the approval line, not a loading strip`);
    // The fix list is the one of the minimum draft it is compared with.
    const [bf, bs] = want.base.split('/');
    assert.deepEqual(json(HFV2.findState(HFV2.findFamily(bf), bs).minimum.fixes), want.fixes, `${route} uses the fixes of ${want.base}`);
    // Resolved in one place: the template of the loaded route, both declarations kept, and no chain through another draft.
    const d = HFV2.describe(route), loaded = HFV2.describe(want.of);
    assert.equal(d.templateKey, loaded.templateKey);
    assert.equal(d.renderer, null);
    assert.deepEqual(json(d.minimum), { of: want.of, fixes: want.fixes });
    assert.deepEqual(json(d.skeleton), { spec: want.spec });
    assert.equal(d.status, 'approved');
    assert.equal(d.approval, APPROVED_LINE);
    assert.ok(HFV2.skeletonSpecs[want.spec], `${route} names a registered spec`);
    assert.ok(!(route in HFV2.templates));
    for (const field of ['id', 'title', 'description', 'group']) assert.ok(!NAMING_RULE.test(state[field]), `${route} ${field}`);
  }
});

test('the loading drafts keep the approved specs; the variants drop the top bar meta and find the graph in the canvas viewport', () => {
  const ops = key => HFV2.skeletonSpecs[key].ops;
  const pairs = [['parallel-group', 'parallel-group-minimum'], ['workflow-run-parallel', 'workflow-run-parallel-minimum'], ['workflow-editor', 'workflow-editor-minimum']];
  const graphLayer = '.hd-app .hd-canvas > div:first-child', viewportLayer = '.hd-app .hd-canvas__scroll > div:first-child';
  const mapSel = sel => (sel === graphLayer ? viewportLayer : sel);
  for (const [base, variant] of pairs) {
    const meta = '.hd-app .hd-topbar .hd-topbar__meta';
    const kept = ops(base).filter(op => !(op.kind === 'text' && op.sel === meta));
    assert.equal(ops(base).length - kept.length, 1, `${base} has one meta block op`);
    const v = ops(variant);
    assert.ok(!v.some(op => op.kind === 'text' && op.sel === meta), `${variant} draws no meta block`);
    assert.deepEqual(v.slice(0, kept.length).map(op => `${op.kind} ${op.sel}`), kept.map(op => `${op.kind} ${mapSel(op.sel)}`), `${variant} keeps the other ops in order`);
    const added = v.slice(kept.length);
    assert.deepEqual(json(added.map(op => [op.kind, op.sel, op.name === undefined ? '-' : op.name, op.value === undefined ? '-' : op.value])), [
      ['attr', meta, 'tabindex', null], ['attr', meta, 'role', null], ['remove', meta + ' .hd-sr', '-', '-'],
      ['hide', meta + ' .hd-dot', '-', '-'], ['hide', meta + ' .hd-topbar__meta-dot', '-', '-']]);
    assert.deepEqual(HFV2.skeletonSpecs[variant].chrome, HFV2.skeletonSpecs[base].chrome, `${variant} has the allowlist of ${base}`);
    assert.equal(HFV2.skeletonSpecs[variant].frame, HFV2.skeletonSpecs[base].frame);
  }
  // The approved editor spec still finds the graph layer in the canvas itself; only its minimum variant looks in the viewport.
  assert.ok(ops('workflow-editor').some(op => op.kind === 'custom' && op.sel === graphLayer));
  assert.ok(!ops('workflow-editor').some(op => op.sel === viewportLayer));
  assert.ok(ops('workflow-editor-minimum').some(op => op.kind === 'custom' && op.sel === viewportLayer && op.pin === 'fixed'));
  assert.ok(!ops('workflow-editor-minimum').some(op => op.sel === graphLayer));
  // The approved loading states still name the approved specs.
  for (const [route, spec] of [['parallel-group/loading', 'parallel-group'], ['workflow-run/loading-parallel', 'workflow-run-parallel'], ['workflow-editor/loading', 'workflow-editor']]) assert.equal(HFV2.findState(HFV2.findFamily(route.split('/')[0]), route.split('/')[1]).skeleton.spec, spec);
  // needs-you and menu-bar need no variant: nothing in their specs touches a minimum fix.
  assert.equal(LOADING['needs-you/loading-minimum'].spec, 'needs-you');
  assert.equal(LOADING['menu-bar/loading-minimum'].spec, 'menu-bar');
  assert.ok(!HFV2.skeletonSpecs['needs-you'].ops.concat(HFV2.skeletonSpecs['menu-bar'].ops).some(op => /topbar__meta|hd-canvas/.test(op.sel)));
});

// Runs catalog.js against a tolerant stub page. The stub element stores what is assigned to it and answers every other
// property with a function that does nothing, which is all the render path needs. applyMinimum and skeletonize are
// replaced by recorders, so the test sees the order in which the catalog calls them and what the specimen holds then.
function runCatalog(route) {
  const calls = [];
  const stub = () => new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'querySelectorAll') return () => [];
      if (key === 'firstChild' || key === 'closest') return null;
      if (key === 'classList') return { add() {}, remove() {}, contains: () => false };
      return () => stub();
    },
    set(target, key, value) { target[key] = value; return true; }
  });
  const listeners = {}, elements = {};
  const context = vm.createContext({
    window: {},
    document: { getElementById: id => (elements[id] = elements[id] || stub()), createElement: () => stub(), createTextNode: () => stub(), documentElement: stub(), title: '' }
  });
  context.window = context;
  context.location = { hash: `#${route}/light`, href: '' };
  context.history = { replaceState() {} };
  context.addEventListener = (type, fn) => { listeners[type] = fn; };
  const scripts = fs.readdirSync(path.join(v2, 'scripts')).filter(name => name !== 'catalog.js' && name !== 'registry.js');
  for (const name of ['registry.js', ...scripts]) vm.runInContext(read(path.join('scripts', name)), context, { filename: name });
  const H = context.HFV2;
  H.applyMinimum = (host, fixes) => calls.push({ step: 'minimum', fixes: json(fixes), specimenHasTemplate: String(host.innerHTML).includes('hd-app') });
  H.skeletonize = (host, spec) => { calls.push({ step: 'skeleton', spec, minimumFirst: calls.some(c => c.step === 'minimum') }); return { ok: true, unmatched: [] }; };
  vm.runInContext(read('scripts/catalog.js'), context, { filename: 'catalog.js' });
  return { H, calls, rerender: hash => { context.location.hash = hash; listeners.hashchange(); }, specimen: elements['hdc-specimen'] };
}

test('the catalog applies the template, then the minimum fixes, then the skeleton, on the first render and on a second render', () => {
  for (const [route, want] of Object.entries(LOADING)) {
    const run = runCatalog(route);
    run.rerender(`#${route}/dark`);
    const spec = run.H.skeletonSpecs[want.spec];
    assert.deepEqual(json(run.calls.map(c => c.step)), ['minimum', 'skeleton', 'minimum', 'skeleton'], `${route}: minimum before skeleton on both passes`);
    for (const c of run.calls) {
      if (c.step === 'minimum') { assert.deepEqual(c.fixes, want.fixes, route); assert.ok(c.specimenHasTemplate, `${route}: the template is in the specimen first`); }
      else { assert.equal(c.spec, spec, `${route} skeletonizes with ${want.spec}`); assert.ok(c.minimumFirst, route); }
    }
    assert.match(String(run.specimen.className), /hdc-specimen--minimum/);
  }
  // A plain minimum draft applies the fixes and no skeleton; the fixes are applied again on a second render.
  const plain = runCatalog('menu-bar/busy-minimum');
  plain.rerender('#menu-bar/busy-minimum/dark');
  assert.deepEqual(json(plain.calls.map(c => c.step)), ['minimum', 'minimum']);
  const registry = read('scripts/registry.js');
  assert.ok(registry.indexOf('state.skeleton && state.minimum') < registry.indexOf('if (state.skeleton) {'), 'tripwire: the combined branch is checked first');
});

test('every minimum draft derives from a static screen: applyMinimum runs only on the static path', () => {
  const drafts = HFV2.registry.families.flatMap(f => f.states.filter(s => s.minimum).map(s => `${f.id}/${s.id}`));
  assert.equal(drafts.length, 11);
  for (const route of drafts) {
    const state = HFV2.findState(HFV2.findFamily(route.split('/')[0]), route.split('/')[1]);
    assert.equal(HFV2.describe(state.minimum.of).renderer, null, `${route} derives from ${state.minimum.of}, which has no renderer`);
    assert.equal(HFV2.describe(route).renderer, null, route);
  }
});

test('the loaded states the drafts derive from are untouched', () => {
  for (const want of [...Object.values(STATES), ...Object.values(LOADING)]) {
    const state = HFV2.findState(HFV2.findFamily(want.of.split('/')[0]), want.of.split('/')[1]);
    assert.equal(state.status, 'approved');
    assert.ok(!state.minimum);
  }
});

test('every minimum-frame selector is scoped under .hdc-specimen--minimum', () => {
  const css = read('styles/minimum-frame.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = css.split('}').map(r => r.trim()).filter(Boolean);
  assert.ok(rules.length >= 8);
  for (const rule of rules) {
    const selectors = rule.slice(0, rule.indexOf('{')).split(',').map(s => s.trim());
    for (const sel of selectors) assert.ok(sel.startsWith('.hdc-specimen--minimum'), `unscoped selector: ${sel}`);
  }
});

test('tripwire: applyMinimum creates no text and makes only the listed attribute and element changes', () => {
  const source = read('scripts/minimum-frame.js').replace(/\/\/.*$/gm, '');
  for (const forbidden of ['createTextNode', 'textContent', 'innerHTML', 'innerText', 'outerHTML', 'insertAdjacentHTML', 'insertAdjacentText', '.data =', 'nodeValue =']) assert.ok(!source.includes(forbidden), `minimum-frame.js uses ${forbidden}`);
  // Attributes: tabindex and role on the meta and the canvas viewport, aria-hidden on the empty dot, and the canvas
  // label moved verbatim. No title is set and none is removed.
  const attrs = [...source.matchAll(/setAttribute\('([a-z-]+)', ('[^']*'|label)\)/g)].map(m => `${m[1]}=${m[2]}`);
  assert.deepEqual(attrs, ["aria-hidden='true'", "tabindex='0'", "role='note'", 'aria-label=label', "tabindex='0'", "role='region'"]);
  assert.equal((source.match(/setAttribute\(/g) || []).length, attrs.length, 'every setAttribute call is listed');
  assert.deepEqual([...source.matchAll(/removeAttribute\('([a-z-]+)'\)/g)].map(m => m[1]), ['aria-label']);
  assert.ok(!/title/.test(source.replace(/\/\*[\s\S]*?\*\//g, '')), 'no title is set');
  const created = [...source.matchAll(/createElement\('([a-z]+)'\)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(created)].sort(), ['div', 'span']);
  // The empty elements: the popover and sidebar bodies, the canvas viewport (div), the .hd-sr wrapper and the dot (span).
  assert.equal(created.filter(t => t === 'div').length, 3);
  assert.equal(created.filter(t => t === 'span').length, 2);
  // Listeners: the meta's hover and focus, and one document keydown listener that the next render removes.
  assert.deepEqual([...source.matchAll(/meta\.addEventListener\('([a-z]+)'/g)].map(m => m[1]), ['mouseenter', 'mouseleave', 'focusin', 'focusout']);
  assert.equal((source.match(/document\.addEventListener\('keydown'/g) || []).length, 1);
  assert.equal((source.match(/document\.removeEventListener\('keydown'/g) || []).length, 1);
  assert.ok(!/\.removeChild\(|\.remove\(\)/.test(source), 'no node is removed');
});

test('tripwire: index.html and the catalog wire the drafts', () => {
  const html = read('index.html');
  assert.ok(html.includes('<link rel="stylesheet" href="styles/minimum-frame.css">'));
  const order = ['scripts/registry.js', 'scripts/screens-minimum.js', 'scripts/minimum-frame.js', 'scripts/catalog.js'].map(s => html.indexOf(`<script src="${s}"></script>`));
  assert.ok(order.every(i => i >= 0), 'all four scripts are included');
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'registry, drafts, frame, catalog in that order');
  const catalog = read('scripts/catalog.js');
  assert.match(catalog, /d\.minimum/);
  assert.match(catalog, /HFV2\.applyMinimum\(els\.specimen, d\.minimum\.fixes\)/);
  assert.match(catalog, /hdc-specimen--minimum/);
  assert.match(catalog, /1000 × 620/);
});

// ---- Static sidebar structure the shared rule depends on: top, nav, sections, foot as direct children. ----
function sidebarChildren(html) {
  const start = html.indexOf('<aside class="hd-sidebar"');
  if (start < 0) return null;
  const VOID = new Set(['input', 'br', 'img', 'hr', 'meta', 'link']);
  const tag = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  tag.lastIndex = start;
  let depth = 0, m;
  const children = [];
  while ((m = tag.exec(html))) {
    const [, close, name, attrs, selfClose] = m;
    if (close) { depth -= 1; if (depth === 0) break; continue; }
    if (depth === 1) children.push({ name, cls: (/class="([^"]*)"/.exec(attrs) || [, ''])[1].split(/\s+/) });
    if (!VOID.has(name) && !selfClose) depth += 1;
  }
  return children;
}

test('every static template with a sidebar has the top, nav, sections and foot structure the rule needs', () => {
  // The pending-launch states carry the sidebar inside the M04 scroll wrapper (approved 2026-11-10), a different shape.
  const keys = Object.keys(HFV2.templates).filter(k => HFV2.templates[k].includes('<aside class="hd-sidebar"') && !k.startsWith('task/pending-'));
  // 22 static screens, plus the four templates the New task and Task renderers read and components/sidebar,
  // plus the ten provisional approval states that start from a task or Needs you screen.
  assert.equal(keys.length, 59);
  const odd = [];
  for (const key of keys) {
    const kids = sidebarChildren(HFV2.templates[key]);
    const first = kids[0], last = kids[kids.length - 1], middle = kids.slice(1, -1);
    const ok = first.cls.includes('hd-sidebar__top') && last.cls.includes('hd-sidebar__foot') &&
      kids.filter(c => c.cls.includes('hd-sidebar__top')).length === 1 && kids.filter(c => c.cls.includes('hd-sidebar__foot')).length === 1 &&
      middle.length >= 2 && middle[0].name === 'nav' && middle.slice(1).every(c => c.name === 'section' && c.cls.includes('hd-section'));
    if (!ok) odd.push(key);
  }
  assert.deepEqual(odd, []);
});

test('the fix names and their host classes name the product screen only, and the old top bar name is an alias', () => {
  for (const name of HFV2.minimumFixes) { assert.ok(!NAMING_RULE.test(name), name); assert.ok(!NAMING_RULE.test(`hdc-min-${name}`)); }
  const css = read('styles/minimum-frame.css');
  for (const cls of new Set(css.match(/hdc-min-[a-z-]+|hd-[a-z-]+scroll/g))) assert.ok(!NAMING_RULE.test(cls), cls);
  assert.ok(HFV2.minimumFixes.includes('topbar-meta') && HFV2.minimumFixes.includes('editor-topbar'));
  assert.deepEqual([...HFV2.minimumFixes].sort(), ['canvas', 'editor-topbar', 'inspector', 'lanes', 'popover', 'sidebar', 'topbar-meta']);
});

test('the sizing decisions are in the stylesheet: inspector 288, popover 380 by 560, lane floor 360', () => {
  const css = read('styles/minimum-frame.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.hdc-min-inspector \.hd-inspector\{flex:0 0 288px!important;width:288px!important\}/);
  assert.match(css, /section\[aria-label="Harflow menu"\]\{width:380px!important;height:560px\}/);
  assert.match(css, /\.hd-lane\{flex:0 0 360px!important;min-width:360px!important\}/);
  assert.match(css, /\.hdc-min-inspector \.hd-inspector__body\{position:relative\}/);
});

test('the states name the product screen only', () => {
  for (const route of Object.keys(STATES)) {
    const [familyId, stateId] = route.split('/');
    const family = HFV2.findFamily(familyId), state = HFV2.findState(family, stateId);
    for (const field of ['id', 'title', 'description', 'group']) assert.ok(!NAMING_RULE.test(state[field]), `${route} ${field}`);
    assert.ok(!NAMING_RULE.test(HFV2.approvalLine(family, state)));
  }
});

// ---- Behaviour of applyMinimum on a small hand-written node tree (no DOM library). ----
class FakeNode {
  constructor(tag, attrs = {}, kids = []) {
    this.nodeType = 1; this.tag = tag; this.attrs = { ...attrs }; this.childNodes = []; this.parent = null; this.listeners = {};
    this.classes = new Set((attrs.class || '').split(/\s+/).filter(Boolean));
    this.classList = { add: c => this.classes.add(c), remove: c => this.classes.delete(c), contains: c => this.classes.has(c) };
    kids.forEach(k => this.appendChild(k));
  }
  set className(v) { this.classes = new Set(v.split(/\s+/).filter(Boolean)); }
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }
  fire(type, event = {}) { (this.listeners[type] || []).forEach(fn => fn(event)); }
  detach(n) { if (n.parent) n.parent.childNodes.splice(n.parent.childNodes.indexOf(n), 1); n.parent = this; }
  appendChild(n) { this.detach(n); this.childNodes.push(n); return n; }
  insertBefore(n, ref) { this.detach(n); this.childNodes.splice(this.childNodes.indexOf(ref), 0, n); return n; }
  replaceChild(n, old) { this.detach(n); this.childNodes[this.childNodes.indexOf(old)] = n; old.parent = null; return old; }
  matches(sel) { const m = /^([a-z]*)((?:\.[\w-]+)*)(?:\[aria-label="([^"]+)"\])?$/.exec(sel); return (!m[1] || m[1] === this.tag) && m[2].split('.').filter(Boolean).every(c => this.classes.has(c)) && (!m[3] || this.attrs['aria-label'] === m[3]); }
  all() { return this.children.flatMap(c => [c, ...c.all()]); }
  querySelectorAll(sel) { return this.all().filter(n => n.matches(sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
class FakeText { constructor(v) { this.nodeType = 3; this.nodeValue = v; this.parent = null; } }
const el = (tag, cls, kids = [], attrs = {}) => new FakeNode(tag, { class: cls, ...attrs }, kids);
function texts(node, out = []) { node.childNodes.forEach(n => (n.nodeType === 3 ? out.push(n.nodeValue.trim()) : texts(n, out))); return out.filter(Boolean).sort(); }

// One shared fake document records the listeners added to and removed from it.
function runMinimum(host, fixes, doc) {
  const document = doc || makeDocument();
  const context = vm.createContext({ window: {}, document });
  context.window = context;
  vm.runInContext(read('scripts/minimum-frame.js'), context);
  context.HFV2.applyMinimum(host, fixes);
  return document;
}
function makeDocument() {
  const document = { listeners: [], removed: [], createElement: tag => new FakeNode(tag) };
  document.addEventListener = (type, fn) => document.listeners.push({ type, fn });
  document.removeEventListener = (type, fn) => { document.removed.push({ type, fn }); document.listeners = document.listeners.filter(l => !(l.type === type && l.fn === fn)); };
  document.press = key => document.listeners.filter(l => l.type === 'keydown').forEach(l => l.fn({ key }));
  return document;
}

test('applyMinimum on a hand-written node tree: sidebar, popover, canvas and top bar meta', () => {
  const sidebar = el('aside', 'hd-sidebar', [el('div', 'hd-sidebar__top'), el('nav', 'hd-nav'), el('section', 'hd-section'), el('section', 'hd-section hd-section--fill'), el('div', 'hd-sidebar__foot')]);
  const pop = el('section', '', [el('div', 'h'), el('section', 'a'), el('section', 'b'), el('section', 'c'), el('div', 'f')], { 'aria-label': 'Harflow menu' });
  const phrase = 'Unsaved changes · Revision 7', phrase2 = 'Enforced for every agent here: Network: not controlled.';
  const meta = el('span', 'hd-topbar__meta', [el('span', 'hd-dot', [], { 'aria-hidden': 'true' })]);
  meta.appendChild(new FakeText(phrase));
  const meta2 = el('span', 'hd-topbar__meta');
  meta2.appendChild(new FakeText(phrase2));
  const layer = el('div', 'layer'), tray = el('div', 'hd-tray'), zoom = el('div', 'hd-zoom');
  const canvas = el('div', 'hd-canvas', [layer, tray, zoom], { 'aria-label': 'Workflow canvas' });
  const host = el('div', 'hdc-specimen', [sidebar, pop, el('div', 'hd-topbar', [meta, meta2]), canvas]);
  sidebar.children[2].appendChild(new FakeText('Running'));
  const before = texts(host);
  runMinimum(host, ['sidebar', 'popover', 'topbar-meta', 'lanes', 'inspector', 'canvas']);

  const side = sidebar.children.map(c => [...c.classes][0]);
  assert.deepEqual(side, ['hd-sidebar__top', 'hd-sidebar__scroll', 'hd-sidebar__foot']);
  assert.deepEqual(sidebar.children[1].children.map(c => c.tag), ['nav', 'section', 'section']);

  assert.deepEqual(pop.children.map(c => [...c.classes][0]), ['h', 'hd-popover__scroll', 'f']);
  assert.deepEqual(pop.children[1].children.map(c => [...c.classes][0]), ['a', 'b', 'c']);

  // The canvas: only the graph layer moves into the viewport; the tray and zoom stay on the canvas. The label moves verbatim.
  assert.deepEqual(canvas.children.map(c => [...c.classes][0]), ['hd-canvas__scroll', 'hd-tray', 'hd-zoom']);
  const viewport = canvas.children[0];
  assert.deepEqual(viewport.children, [layer]);
  assert.equal(viewport.getAttribute('aria-label'), 'Workflow canvas');
  assert.ok(!canvas.hasAttribute('aria-label'), 'the label is on the viewport only');
  assert.equal(viewport.getAttribute('tabindex'), '0');
  assert.equal(viewport.getAttribute('role'), 'region');
  assert.equal(viewport.children.length, 1);
  assert.deepEqual(viewport.childNodes.filter(n => n.nodeType === 3), []);

  for (const [node, text, ownDot] of [[meta, phrase, true], [meta2, phrase2, false]]) {
    const hidden = node.children.find(c => c.classes.has('hd-sr'));
    assert.ok(hidden, 'the meta text sits in .hd-sr');
    assert.equal(hidden.childNodes.length, 1);
    assert.equal(hidden.childNodes[0].nodeValue, text);
    assert.ok(!node.hasAttribute('title'), 'no title: the text is shown on hover and focus instead');
    assert.equal(node.children.filter(c => c.classes.has('hd-sr')).length, 1, 'the text is exposed once');
    assert.deepEqual(node.childNodes.filter(n => n.nodeType === 3), [], 'no bare text is left in the meta');
    assert.equal(node.getAttribute('tabindex'), '0');
    assert.equal(node.getAttribute('role'), 'note');
    assert.ok(!node.hasAttribute('aria-label'), 'no second name');
    // One dot: the screen's own, or one empty decorative element added in its place.
    const dots = node.children.filter(c => c.classes.has('hd-dot') || c.classes.has('hd-topbar__meta-dot'));
    assert.equal(dots.length, 1);
    assert.equal(dots[0].classes.has('hd-dot'), ownDot);
    assert.equal(dots[0].getAttribute('aria-hidden'), 'true');
    assert.deepEqual(dots[0].childNodes, [], 'a decorative dot holds nothing');
    assert.ok(node.children.indexOf(dots[0]) < node.children.indexOf(hidden));
    for (const type of ['mouseenter', 'mouseleave', 'focusin', 'focusout']) assert.equal((node.listeners[type] || []).length, 1, `${type} listener`);
  }

  assert.deepEqual(texts(host), before, 'the text multiset is unchanged');
  for (const fix of ['sidebar', 'popover', 'topbar-meta', 'lanes', 'inspector', 'canvas']) assert.ok(host.classes.has(`hdc-min-${fix}`));
  assert.throws(() => runMinimum(host, ['unknown']), /Unknown minimum fix/);
});

test('the canvas fix is idempotent and leaves a canvas with no graph layer alone', () => {
  const canvas = el('div', 'hd-canvas', [el('div', 'layer')], { 'aria-label': 'Workflow canvas' });
  const empty = el('div', 'hd-canvas');
  const host = el('div', 'hdc-specimen', [canvas, empty]);
  runMinimum(host, ['canvas', 'canvas']);
  assert.equal(canvas.children.length, 1);
  assert.equal(canvas.children[0].children.length, 1);
  assert.equal(empty.children.length, 0);
});

// The meta text is shown while the pointer is on it or it has focus. Escape dismisses it; it stays dismissed until
// both the pointer and the focus have left, and only then can the next hover or focus reveal it again.
test('the meta text is dismissible: hover and focus are tracked independently and Escape is one document listener', () => {
  const build = () => {
    const meta = el('span', 'hd-topbar__meta');
    meta.appendChild(new FakeText('Revision 7'));
    return { meta, host: el('div', 'hdc-specimen', [el('div', 'hd-topbar', [meta])]) };
  };
  const hidden = m => m.classes.has('is-dismissed');
  const { meta, host } = build();
  const doc = runMinimum(host, ['topbar-meta']);
  assert.equal(doc.listeners.filter(l => l.type === 'keydown').length, 1);

  // Escape with nothing revealed does nothing.
  doc.press('Escape'); assert.ok(!hidden(meta));
  // A reveal by hover alone, with focus on the body, is dismissed.
  meta.fire('mouseenter'); doc.press('Enter'); assert.ok(!hidden(meta), 'other keys do nothing');
  doc.press('Escape'); assert.ok(hidden(meta));
  meta.fire('mouseleave'); assert.ok(!hidden(meta), 'reset once neither hover nor focus remains');
  // Escape, then the pointer leaves while the focus stays: still hidden.
  meta.fire('focusin'); meta.fire('mouseenter'); doc.press('Escape'); assert.ok(hidden(meta));
  meta.fire('mouseleave'); assert.ok(hidden(meta), 'focus remains');
  meta.fire('focusout'); assert.ok(!hidden(meta), 'both ended');
  // Escape, then the focus leaves while the pointer stays: still hidden.
  meta.fire('focusin'); meta.fire('mouseenter'); doc.press('Escape'); meta.fire('focusout'); assert.ok(hidden(meta), 'hover remains');
  meta.fire('mouseleave'); assert.ok(!hidden(meta));
  // A focus reveal is dismissed too, and the next focus shows it again.
  meta.fire('focusin'); doc.press('Escape'); assert.ok(hidden(meta));
  meta.fire('focusout'); meta.fire('focusin'); assert.ok(!hidden(meta));

  // A second render into the same host removes the first listener before it adds its own, so they never stack.
  const again = build();
  host.childNodes.forEach(n => { n.parent = null; });
  host.childNodes = [];
  host.appendChild(again.host.children[0]);
  runMinimum(host, ['topbar-meta'], doc);
  assert.equal(doc.listeners.filter(l => l.type === 'keydown').length, 1);
  assert.equal(doc.removed.filter(l => l.type === 'keydown').length, 1);
  const fresh = host.querySelector('.hd-topbar__meta');
  fresh.fire('mouseenter'); doc.press('Escape');
  assert.ok(hidden(fresh), 'the new listener acts on the new meta');
  // A render with no meta (another fix list) removes the listener and adds none.
  runMinimum(host, ['sidebar'], doc);
  assert.equal(doc.listeners.length, 0);
});

test('the inspector fix touches no node, and the old top bar name still applies the same fix', () => {
  const meta = el('span', 'hd-topbar__meta');
  meta.appendChild(new FakeText('Run started 02:00 · HarflowMCP'));
  const inspector = el('aside', 'hd-inspector', [el('div', 'hd-inspector__body')]);
  const host = el('div', 'hdc-specimen', [el('div', 'hd-topbar', [meta]), inspector]);
  runMinimum(host, ['inspector', 'editor-topbar']);
  assert.deepEqual(inspector.children.map(c => [...c.classes][0]), ['hd-inspector__body']);
  assert.equal(inspector.children[0].children.length, 0);
  assert.ok(!meta.hasAttribute('title'));
  assert.equal(meta.getAttribute('tabindex'), '0');
  assert.ok(host.classes.has('hdc-min-inspector') && host.classes.has('hdc-min-editor-topbar'));
});

test('the stylesheet: the canvas viewport scrolls, the meta layout is unchanged and the reveal has no gap', () => {
  const css = read('styles/minimum-frame.css').replace(/\/\*[\s\S]*?\*\//g, '');
  // The canvas keeps its clipping and its colour; the viewport scrolls and carries the dot grid with the graph.
  assert.match(css, /\.hdc-min-canvas \.hd-canvas__scroll\{position:absolute;inset:0;overflow:auto;[^}]*background-attachment:local;scrollbar-width:thin;/);
  assert.match(css, /\.hdc-min-canvas \.hd-canvas\{background-image:none\}/);
  assert.match(css, /\.hdc-min-canvas \.hd-canvas__scroll:focus-visible\{outline-offset:-2px\}/);
  assert.match(css, /\.hd-canvas>\.hd-tray,[^{]*\.hd-canvas>\.hd-zoom\{z-index:2\}/);
  // The meta's padding and its negative margin cancel, so the top bar lays out as before.
  const m = /\.hdc-min-topbar-meta \.hd-topbar__meta,[^{]*\{[^}]*padding:(\d+)px;margin:-(\d+)px\}/.exec(css);
  assert.ok(m && m[1] === m[2], 'padding and negative margin are equal');
  // The tooltip is reached from the meta's own box (no gap), on hover and on focus, and a dismissed meta shows none.
  assert.match(css, /\.hd-topbar__meta\[tabindex\]:hover:not\(\.is-dismissed\)>\.hd-sr,[^{]*\.hd-topbar__meta\[tabindex\]:focus-visible:not\(\.is-dismissed\)>\.hd-sr\{position:absolute;left:0;top:100%;/);
  assert.match(css, /\.hd-topbar__meta\[tabindex\]\{position:relative;z-index:6;/);
  // The neutral dot is the tertiary text colour, not the attention colour of an unsaved change.
  assert.match(css, /\.hd-topbar__meta-dot\{[^}]*background:var\(--text-tertiary\)/);
});

test('a render that is not a minimum state clears the Escape listener a minimum render left on the document', () => {
  // The catalog calls clearMinimum for a route without a minimum, and only for those.
  const run = runCatalog('menu-bar/busy-minimum');
  const cleared = [];
  run.H.clearMinimum = host => cleared.push(host);
  run.rerender('#menu-bar/busy-minimum/dark');
  assert.equal(cleared.length, 0, 'a minimum route does not call it');
  run.rerender('#needs-you/waiting/light');
  assert.equal(cleared.length, 1, 'a plain route calls it');
  assert.ok(/if \(!d\.minimum\) HFV2\.clearMinimum\(els\.specimen\);/.test(read('scripts/catalog.js')));

  // The real cleanup, on the fake DOM: render a minimum route, then clear it as the plain route does.
  const meta = el('span', 'hd-topbar__meta');
  meta.appendChild(new FakeText('Revision 7'));
  const host = el('div', 'hdc-specimen', [el('div', 'hd-topbar', [meta])]);
  const document = makeDocument();
  const context = vm.createContext({ window: {}, document });
  context.window = context;
  vm.runInContext(read('scripts/minimum-frame.js'), context);
  context.HFV2.applyMinimum(host, ['topbar-meta']);
  assert.equal(document.listeners.filter(l => l.type === 'keydown').length, 1);
  context.HFV2.clearMinimum(host);
  assert.equal(document.listeners.length, 0, 'no listener is left on the document');
  context.HFV2.clearMinimum(host);
  assert.equal(document.removed.length, 1, 'clearing twice removes nothing more');
});
