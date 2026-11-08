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
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b/i;

const STATES = {
  'needs-you/waiting-minimum': { of: 'needs-you/waiting', fixes: ['sidebar'], title: 'Waiting · 1000 × 620' },
  'parallel-group/lanes-minimum': { of: 'parallel-group/lanes', fixes: ['sidebar', 'lanes'], title: 'Lanes · 1000 × 620' },
  'workflow-run/parallel-minimum': { of: 'workflow-run/parallel', fixes: ['sidebar', 'lanes'], title: 'Parallel view · 1000 × 620' },
  'workflow-editor/node-selected-minimum': { of: 'workflow-editor/node-selected', fixes: ['sidebar', 'editor-topbar'], title: 'Node selected · 1000 × 620' },
  'menu-bar/busy-minimum': { of: 'menu-bar/busy', fixes: ['popover'], title: 'Busy · 1000 × 620' }
};

test('the five minimum window drafts are registered, provisional and derived from their loaded state', () => {
  const all = HFV2.registry.families.flatMap(f => f.states.filter(s => s.minimum).map(s => `${f.id}/${s.id}`));
  assert.deepEqual([...all].sort(), Object.keys(STATES).sort());
  for (const [route, want] of Object.entries(STATES)) {
    const [familyId, stateId] = route.split('/');
    const family = HFV2.findFamily(familyId);
    const state = HFV2.findState(family, stateId);
    assert.equal(state.status, 'provisional', route);
    assert.equal(state.approvalNote, 'Provisional · needs owner approval', route);
    assert.ok(!state.approval, `${route} carries no approval`);
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
    assert.equal(d.status, 'provisional');
    assert.equal(d.approval, 'Provisional · needs owner approval');
    assert.deepEqual(JSON.parse(JSON.stringify(d.minimum)), { of: want.of, fixes: want.fixes });
    assert.ok(!(`${familyId}/${stateId}` in HFV2.templates), `${route} has no template of its own`);
  }
});

test('no existing template changed: the digests equal those of the base commit and none was added', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'data', 'templates-ba8c928.json'), 'utf8'));
  assert.deepEqual(Object.keys(HFV2.templates).sort(), Object.keys(manifest).sort());
  // The overview page is generated from the registry (state counts and links), so it changes with every state added.
  for (const [key, sha] of Object.entries(manifest).filter(([key]) => key !== 'overview/areas')) {
    assert.equal(crypto.createHash('sha1').update(HFV2.templates[key]).digest('hex'), sha, `${key} is unchanged`);
  }
});

test('the loaded states the drafts derive from are untouched', () => {
  for (const want of Object.values(STATES)) {
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

test('tripwire: applyMinimum creates no text and sets exactly one title', () => {
  const source = read('scripts/minimum-frame.js').replace(/\/\/.*$/gm, '');
  for (const forbidden of ['createTextNode', 'textContent', 'innerHTML', 'innerText', 'outerHTML', 'insertAdjacentHTML', 'insertAdjacentText', '.data =', 'nodeValue =']) assert.ok(!source.includes(forbidden), `minimum-frame.js uses ${forbidden}`);
  assert.equal((source.match(/setAttribute\(/g) || []).length, 1, 'one setAttribute call');
  assert.match(source, /setAttribute\('title', node\.nodeValue\.trim\(\)\)/);
  const created = [...source.matchAll(/createElement\('([a-z]+)'\)/g)].map(m => m[1]);
  assert.deepEqual([...new Set(created)].sort(), ['div', 'span']);
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
  const keys = Object.keys(HFV2.templates).filter(k => HFV2.templates[k].includes('<aside class="hd-sidebar"'));
  assert.ok(keys.length >= 20);
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

test('the drafts name the product screen only', () => {
  for (const route of Object.keys(STATES)) {
    const [familyId, stateId] = route.split('/');
    const family = HFV2.findFamily(familyId), state = HFV2.findState(family, stateId);
    for (const field of ['id', 'title', 'description', 'group', 'approvalNote']) assert.ok(!NAMING_RULE.test(state[field]), `${route} ${field}`);
    assert.ok(!NAMING_RULE.test(HFV2.approvalLine(family, state)));
  }
});
