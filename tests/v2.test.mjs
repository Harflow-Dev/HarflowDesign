import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const v2 = path.join(root, 'v2');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(v2);
const textFiles = files.filter(file => /\.(html|css|js|md)$/.test(file));
const read = file => fs.readFileSync(file, 'utf8');

function loadRuntime() {
  const context = vm.createContext({ window: {} });
  context.window = context;
  const scripts = fs.readdirSync(path.join(v2, 'scripts')).filter(name => name !== 'catalog.js');
  const order = ['registry.js', ...scripts.filter(name => name !== 'registry.js')];
  for (const name of order) vm.runInContext(read(path.join(v2, 'scripts', name)), context, { filename: name });
  return context.HFV2;
}

const HFV2 = loadRuntime();
const keys = HFV2.stateKeys();
const routeSet = new Set(keys);
const descriptors = keys.map(route => HFV2.describe(route));
const templateKeys = [...new Set(descriptors.map(d => d.templateKey))];
const STATUSES = ['approved', 'provisional', 'superseded', 'record'];
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b/i;

test('registry routes are unique and every descriptor resolves to a template, guide and mount', () => {
  assert.ok(keys.length >= 30);
  assert.equal(routeSet.size, keys.length);
  assert.equal(HFV2.registry.families.at(-1).id, 'components');
  assert.equal(HFV2.registry.families.at(-1).states[0].id, 'cover');
  const areas = new Set(HFV2.registry.areas.map(area => area.id));
  for (const family of HFV2.registry.families) {
    assert.ok(family.title && family.description, `${family.id} has metadata`);
    if (family.area) assert.ok(areas.has(family.area), `${family.id} sits in a known area`);
    for (const state of family.states) {
      const route = `${family.id}/${state.id}`;
      assert.match(route, /^[a-z0-9-]+\/[a-z0-9-]+$/);
      assert.ok(state.title && state.description, `${route} has metadata`);
      assert.ok(STATUSES.includes(state.status), `${route} has a known status`);
      if (family.groups) assert.ok(family.groups.includes(state.group), `${route} sits in a known group`);
    }
  }
  for (const d of descriptors) {
    assert.equal(typeof HFV2.templates[d.templateKey], 'string', `${d.route} has a template`);
    assert.ok(HFV2.templates[d.templateKey].trim().length > 0, `${d.route} template is not empty`);
    if (d.guideKey in (HFV2.componentDocs || {})) assert.equal(typeof HFV2.componentDocs[d.guideKey], 'string', `${d.route} guide resolves`);
    if (d.renderer) {
      const renderer = HFV2.RENDERERS[d.renderer];
      assert.ok(renderer, `${d.route} names a known renderer`);
      assert.equal(typeof HFV2[renderer.api].mount, 'function', `${d.route} renderer mounts`);
      assert.ok(d.mount, `${d.route} names its mount id`);
      assert.ok(d.componentMeta === null, `${d.route} is not a component specimen`);
    } else {
      assert.equal(d.templateKey, d.route, `${d.route} renders its own template`);
    }
  }
  const mountIds = {
    m04: [...HFV2.m04ProposalStates, ...HFV2.m04AmendmentStates].map(x => x.id),
    m05: HFV2.m05ProposalStates.map(x => x.id)
  };
  for (const d of descriptors.filter(x => x.renderer)) {
    if (d.renderer === 'd2b') assert.equal(HFV2.d2bProposal.createState(d.mount).name, d.mount, `${d.route} is a known fixture`);
    else assert.ok(mountIds[d.renderer].includes(d.mount), `${d.route} mounts a known fixture`);
  }
});

test('every template is reached by a descriptor or is a base key a renderer reads', () => {
  const reached = new Set(templateKeys);
  const read = new Set();
  for (const name of ['m04-proposal.js', 'm05-proposal.js', 'd2b-proposal.js']) {
    for (const [, key] of read_(name).matchAll(/'((?:new-task|task|sidebar|workflows)\/[a-z0-9-]+)'/g)) read.add(key);
  }
  assert.ok(read.size >= 3, 'renderers read base templates');
  for (const key of read) assert.equal(typeof HFV2.templates[key], 'string', `a renderer reads ${key}`);
  for (const key of Object.keys(HFV2.templates)) assert.ok(reached.has(key) || read.has(key), `${key} is reached`);
});
function read_(name) { return read(path.join(v2, 'scripts', name)); }

test('no placeholder survives rendering in any appearance', () => {
  for (const key of templateKeys) {
    for (const [selection, resolved] of [['light', 'light'], ['dark', 'dark'], ['system', 'light'], ['system', 'dark']]) {
      const html = HFV2.fill(HFV2.templates[key], selection, resolved);
      assert.ok(!html.includes('{{'), `${key} (${selection}/${resolved}) has no leftover placeholder`);
    }
  }
  const sample = HFV2.fill(HFV2.templates['new-task/default'], 'dark', 'dark');
  assert.match(sample, /data-theme="dark"/);
  assert.match(sample, /aria-pressed="true" aria-label="Dark"/);
});

test('internal links inside templates resolve to a canonical route or an alias of one', () => {
  let routed = 0;
  for (const key of Object.keys(HFV2.templates)) {
    for (const [, href] of HFV2.templates[key].matchAll(/href="([^"]*)"/g)) {
      const match = /^#([a-z0-9-]+\/[a-z0-9-]+)$/.exec(href);
      if (match) {
        routed += 1;
        const target = HFV2.resolveRoute(href).slice(1);
        assert.ok(routeSet.has(target), `${key} links to unknown route ${href}`);
      } else if (key === 'overview/areas') {
        assert.ok(fs.existsSync(path.join(v2, href.split('#')[0])), `${key} links to a missing document ${href}`);
      } else {
        assert.ok(href.startsWith('#'), `${key} has a non-local link ${href}`);
      }
    }
  }
  assert.ok(routed > 100);
});

test('no .dc.html references remain', () => {
  for (const file of textFiles) {
    if (file.endsWith('.md') || file === path.join(v2, 'scripts', 'catalog.js')) continue;
    assert.ok(!read(file).includes('.dc.html'), `${path.relative(root, file)} mentions .dc.html`);
  }
  for (const key of templateKeys) assert.ok(!HFV2.templates[key].includes('.dc.html'), key);
});

test('v2 paths are relative and self-contained', () => {
  const refs = [];
  for (const file of textFiles.filter(f => /\.(html|js)$/.test(f))) {
    for (const m of read(file).matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)) refs.push([file, m[1]]);
  }
  for (const file of textFiles.filter(f => f.endsWith('.css'))) {
    for (const m of read(file).matchAll(/url\(\s*["']?([^)"']+)["']?\s*\)/g)) refs.push([file, m[1]]);
  }
  for (const [file, ref] of refs) {
    const where = `${path.relative(root, file)}: ${ref}`;
    if (ref.startsWith('data:') || ref.startsWith('#')) continue;
    assert.ok(!ref.startsWith('/'), `${where} is absolute`);
    assert.ok(!/^[a-z][a-z0-9+.-]*:/i.test(ref), `${where} is external`);
    assert.ok(!ref.includes('/v2/'), `${where} contains /v2/`);
    assert.ok(!ref.includes('..'), `${where} leaves v2`);
  }
  for (const file of textFiles.filter(f => f.endsWith('.js') && !f.endsWith('catalog.js'))) {
    assert.ok(!read(file).includes('/v2/'), `${path.relative(root, file)} contains /v2/`);
  }
  for (const file of textFiles.filter(f => /\.(html|css|js)$/.test(f))) {
    assert.ok(!/@import|fetch\(|XMLHttpRequest/.test(read(file).replace(/data:image[^"')]*/g, '')), `${path.relative(root, file)} loads remote resources`);
  }
});

test('screen templates use tokens, not literal colours', () => {
  const screens = files.filter(file => /scripts[\\/]screens-.*\.js$/.test(file));
  assert.ok(screens.length >= 12);
  for (const file of screens) {
    const source = read(file);
    assert.ok(!/(?<!&)#[0-9a-fA-F]{3,8}\b/.test(source), `${path.relative(root, file)} has a hex colour`);
    assert.ok(!/\brgba?\(|\bhsla?\(/.test(source), `${path.relative(root, file)} has a functional colour`);
  }
});

test('every file referenced by v2/index.html exists', () => {
  const html = read(path.join(v2, 'index.html'));
  const refs = [...html.matchAll(/\b(?:href|src)="([^"#][^"]*)"/g)].map(m => m[1]);
  refs.push(...[...html.matchAll(/srcset="([^"]+)"/g)].map(m => m[1].split(/\s+/)[0]));
  assert.ok(refs.length >= 15);
  for (const ref of refs) assert.ok(fs.existsSync(path.join(v2, ref)), `v2/${ref} exists`);
  for (const name of fs.readdirSync(path.join(v2, 'scripts')).filter(n => n.startsWith('screens-'))) {
    assert.ok(html.includes(`scripts/${name}`), `index.html loads ${name}`);
  }
});

test('catalog chrome classes use the hdc- prefix and the appearance key is stable', () => {
  const css = read(path.join(v2, 'styles', 'catalog.css'));
  for (const [, name] of css.matchAll(/\.([a-z][a-z0-9_-]*)/g)) {
    if (/^\d/.test(name)) continue;
    assert.ok(name.startsWith('hdc-') || name.startsWith('hd-'), `catalog.css class ${name}`);
  }
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.ok(catalog.includes("'hf-v2-appearance'"));
  assert.match(catalog, /try \{[\s\S]*localStorage\.getItem/);
  assert.match(catalog, /try \{[\s\S]*localStorage\.setItem/);
});

test('v2 contains no claude.ai reference', () => {
  for (const file of textFiles) {
    assert.ok(!/claude\.ai/i.test(read(file)), `${path.relative(root, file)} mentions claude.ai`);
  }
});

const tokensCss = read(path.join(v2, 'styles', 'tokens.css'));
const cssTokens = [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)].map(m => ({ name: m[1], value: m[2].trim() }));
const foundationsSource = read(path.join(v2, 'scripts', 'foundations.js'));
const foundationKeys = keys.filter(key => key.startsWith('foundations/'));
const foundationHtml = foundationKeys.map(key => HFV2.templates[key]).join('\n');
const componentKeys = keys.filter(key => key.startsWith('components/'));

test('brand and foundations families precede components and have templates', () => {
  const ids = HFV2.registry.families.map(family => family.id);
  assert.equal(ids.indexOf('brand') + 1, ids.indexOf('foundations'));
  assert.equal(ids.indexOf('foundations') + 1, ids.indexOf('components'));
  assert.equal(foundationKeys.map(key => key.split('/')[1]).join(), 'colour,typography,spacing-radius,elevation');
  const brand = keys.filter(key => key.startsWith('brand/'));
  assert.ok(brand.length >= 9);
  for (const key of [...brand, ...foundationKeys]) {
    assert.ok(HFV2.templates[key].trim().length > 100, `${key} has content`);
    assert.ok(HFV2.componentMeta[key], `${key} renders at component width`);
  }
});

test('every token of tokens.css appears on the foundations pages', () => {
  assert.ok(cssTokens.length >= 60);
  for (const { name } of cssTokens) {
    const pattern = new RegExp(`${name}(?![a-z0-9-])`);
    assert.ok(pattern.test(foundationHtml), `${name} is documented`);
  }
});

test('colour and shadow values shown match tokens.css', () => {
  const colour = HFV2.templates['foundations/colour'] + HFV2.templates['foundations/elevation'];
  const light = tokensCss.split('[data-theme="dark"]')[0];
  const dark = tokensCss.split('[data-theme="dark"]')[1].split(':root {')[0];
  for (const block of [light, dark]) {
    for (const [, name, value] of block.matchAll(/^\s*(--(?!font|space|radius|sidebar|rail|content|pane|titlebar|row)[a-z0-9-]+):\s*([^;]+);/gm)) {
      assert.ok(colour.includes(`<code>${value.trim()}</code>`), `${name} value ${value} is shown`);
    }
  }
});

test('var() references in foundations.js are defined in tokens.css', () => {
  const defined = new Set(cssTokens.map(t => t.name));
  const markup = foundationsSource.replace(/<code>[\s\S]*?<\/code>/g, '');
  const used = [...markup.matchAll(/var\((--[a-z0-9-]+)/g)].map(m => m[1]);
  assert.ok(used.length > 50);
  for (const name of used) assert.ok(defined.has(name), `${name} is defined`);
});

test('every component except the cover has full guideline text', () => {
  assert.ok(HFV2.componentDocs);
  for (const key of componentKeys) {
    if (key === 'components/cover') {
      assert.equal(HFV2.componentDocs[key], undefined);
      continue;
    }
    const doc = HFV2.componentDocs[key];
    assert.equal(typeof doc, 'string', `${key} has guidelines`);
    assert.match(doc, /<h3>Anatomy<\/h3>/, `${key} guidelines include the anatomy`);
    assert.ok(!doc.includes('{{'), `${key} guidelines have no placeholder`);
  }
  const guideKeys = new Set(descriptors.map(d => d.guideKey));
  for (const key of Object.keys(HFV2.componentDocs)) assert.ok(guideKeys.has(key), `${key} is the guide of a registered route`);
});

test('catalog renders guidelines into the hdc-doc region', () => {
  const html = read(path.join(v2, 'index.html'));
  assert.match(html, /id="hdc-doc"[^>]*\bhidden\b/);
  assert.ok(html.indexOf('scripts/foundations.js') < html.indexOf('scripts/catalog.js'));
  assert.ok(html.indexOf('scripts/component-docs.js') < html.indexOf('scripts/catalog.js'));
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.ok(catalog.includes('HFV2.componentDocs'));
  assert.ok(catalog.includes('els.doc.hidden'));
});

test('generated documentation is escaped and offline', () => {
  for (const name of ['foundations.js', 'component-docs.js']) {
    const source = read(path.join(v2, 'scripts', name));
    assert.ok(!/<script|javascript:|onerror=|onclick=/i.test(source), `${name} has no active markup`);
    assert.ok(!/https?:\/\//.test(source.replace(/xmlns="[^"]*"/g, '')), `${name} has no external URL`);
  }
});

test('every standalone strip starts with the locked orchestrator', () => {
  let strips = 0;
  for (const key of keys) {
    const html = HFV2.templates[key] || '';
    const parts = html.split('<div class="hd-standalone__nodes">').slice(1);
    for (const part of parts) {
      strips += 1;
      assert.match(part, /^<button type="button" class="hd-node hd-node--orchestrator[ "]/, key + ': strip must start with the orchestrator');
      assert.match(part.slice(0, 400), /hd-i-lock/, key + ': orchestrator card must show the lock');
      assert.equal((part.match(/hd-node--orchestrator/g) || []).length, 1, key + ': exactly one orchestrator per strip');
    }
  }
  assert.ok(strips >= 8, 'expected the editor, run and component strips');
});

// ---- Information architecture: naming, aliases, supersessions ----

const textOf = html => html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const stripComments = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Exempt from the naming rule, each with its reason:
// - alias keys in route-aliases.js: old routes exist only to keep links working;
// - code comments, internal template and fixture keys, and never-displayed CSS classes and ids;
// - the specimen copy of the decision boards (the hidden `records` family), which records the history.
test('no milestone or process names appear in navigation, metadata, guides or catalog strips', () => {
  const hits = [];
  const check = (where, value) => { if (typeof value === 'string' && NAMING_RULE.test(value)) hits.push(`${where}: ${value.slice(0, 80)}`); };
  HFV2.registry.areas.forEach(area => { check(`area ${area.id}`, area.id); check(`area ${area.id}`, area.title); });
  HFV2.registry.families.forEach(family => {
    for (const field of ['id', 'title', 'description']) check(`family ${family.id} ${field}`, family[field]);
    (family.groups || []).forEach(group => check(`family ${family.id} group`, group));
    family.states.forEach(state => {
      const route = `${family.id}/${state.id}`;
      for (const field of ['id', 'title', 'description', 'group', 'approvalNote']) check(`${route} ${field}`, state[field]);
      check(`${route} approval line`, HFV2.approvalLine(family, state));
      check(`${route} document title`, `${state.title} · ${family.title} · Harflow Desktop · Interface reference`);
    });
  });
  for (const [key, guide] of Object.entries(HFV2.componentDocs)) check(`guide ${key}`, textOf(guide));
  for (const [renderer, strips] of Object.entries(HFV2.catalogStrips)) {
    for (const [name, label] of Object.entries(strips)) check(`strip ${renderer}.${name}`, label);
  }
  // Strip text is built from each task state's own fields, except in the decision boards.
  for (const state of HFV2.m05ProposalStates.filter(x => x.kind !== 'record')) {
    for (const field of ['gap', 'summary', 'basis', 'flag']) check(`m05 strip ${state.id} ${field}`, state[field]);
  }
  check('v2/index.html', textOf(read(path.join(v2, 'index.html'))));
  check('catalog.js', stripComments(read(path.join(v2, 'scripts', 'catalog.js'))));
  check('overview', textOf(HFV2.templates['overview/areas']));
  assert.deepEqual(hits, []);
});

test('the naming rule catches the names it forbids', () => {
  for (const name of ['M04 review', 'D2B states', 'Failed · proposed banner', 'the proposal', 'native entry', 'G-DIFF', 'm05 task']) assert.match(name, NAMING_RULE, name);
  for (const name of ['Task', 'Centered composer', 'Decision', 'Statistics']) assert.doesNotMatch(name, NAMING_RULE, name);
});

const aliases = HFV2.routeAliases;

test('aliases resolve old routes without shadowing, chaining or pointing nowhere', () => {
  const entries = Object.entries(aliases);
  assert.equal(entries.length, descriptors.filter(d => d.renderer).length, 'every renderer route has exactly one old route');
  for (const [old, target] of entries) {
    assert.match(old, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!routeSet.has(old), `${old} is an alias and must not also be canonical`);
    assert.ok(routeSet.has(target), `${old} points at missing route ${target}`);
    assert.ok(!(target in aliases), `${old} chains through ${target}`);
    const d = HFV2.describe(target);
    assert.equal(d.templateKey, old, `${old} renders the same template as ${target}`);
    assert.ok(d.renderer, `${target} keeps its renderer`);
  }
  assert.equal(new Set(entries.map(([, target]) => target)).size, entries.length, 'no two old routes share a route');
});

test('resolveRoute canonicalises old routes and keeps the appearance suffix', () => {
  for (const suffix of ['', '/light', '/dark', '/system']) {
    assert.equal(HFV2.resolveRoute(`#m05-proposal/state-running${suffix}`), `#task/running-stop${suffix}`);
    assert.equal(HFV2.resolveRoute(`#m04-proposal/history-retained${suffix}`), `#sidebar/history-retained${suffix}`);
    assert.equal(HFV2.resolveRoute(`#d2b-proposal/events${suffix}`), `#task/activity-sources${suffix}`);
    assert.equal(HFV2.resolveRoute(`#task/running${suffix}`), `#task/running${suffix}`, 'a canonical route is unchanged');
  }
  for (const odd of ['', '#', '#nothing', '#a/b/c/d', '#m05-proposal/state-running/sepia', '#m05-proposal/unknown']) assert.equal(HFV2.resolveRoute(odd), odd);
  assert.equal(HFV2.resolveRoute(undefined), undefined);
  for (const [old, target] of Object.entries(aliases)) assert.equal(HFV2.resolveRoute(`#${old}/dark`), `#${target}/dark`);
});

test('every route registered at the base commit still opens the same design', () => {
  const { routes } = JSON.parse(read(path.join(root, 'tests', 'data', 'v2-reserved-routes.json')));
  assert.ok(routes.length >= 170);
  assert.equal(new Set(routes).size, routes.length);
  for (const route of routes) {
    if (route in aliases) continue;
    assert.ok(routeSet.has(route), `${route} neither exists nor is an alias`);
    assert.equal(HFV2.describe(route).templateKey, route, `${route} was reused for another design`);
  }
  assert.ok(routeSet.has(HFV2.registry.defaultRoute));
  assert.equal(HFV2.registry.defaultRoute, 'overview/areas');
  assert.ok(routeSet.has('new-task/default'));
});

test('catalog canonicalises the address only when rendering, after alias lookup', () => {
  const source = read(path.join(v2, 'scripts', 'catalog.js'));
  const render = source.slice(source.indexOf('function render()'), source.indexOf('function setPreference'));
  assert.ok(render.indexOf('parseHash(hash)') >= 0 && render.indexOf('parseHash(hash)') < render.indexOf('defaultRoute'), 'alias lookup precedes the default-route fallback');
  assert.equal((source.match(/\.replaceState\(/g) || []).length, 2, 'only render() rewrites the address');
  assert.equal((render.match(/\.replaceState\(/g) || []).length, 2);
  assert.match(source, /function parseHash[\s\S]*?HFV2\.resolveRoute\(hash/, 'clicked links resolve aliases too');
  assert.match(source, /addEventListener\('hashchange', render\)/, 'back and forward re-render');
  assert.match(source, /try \{[\s\S]*localStorage\.getItem[\s\S]*catch/, 'unavailable storage is tolerated');
});

test('applied supersessions hide the older state; proposed ones label it and hide nothing', () => {
  const { applied, proposed } = HFV2.supersessions;
  const stateOf = route => { const [f, s] = route.split('/'); return HFV2.findState(HFV2.findFamily(f), s); };
  assert.deepEqual(Array.from(applied, e => `${e.older} → ${e.newer}`), ['task/failed → task/failed-continue']);
  for (const { older, newer, basis } of applied) {
    assert.ok(basis, `${older} cites its basis`);
    assert.equal(stateOf(older).status, 'superseded');
    assert.equal(stateOf(older).hidden, true);
    assert.equal(stateOf(older).supersededBy, newer);
    assert.deepEqual(Array.from(stateOf(newer).supersedes), [older]);
    assert.ok(!stateOf(newer).hidden);
    assert.equal(HFV2.describe(older).hidden, true);
    assert.equal(typeof HFV2.templates[HFV2.describe(older).templateKey], 'string', 'a superseded state keeps its template');
  }
  assert.ok(!HFV2.currentStates(HFV2.findFamily('task')).some(s => s.id === 'failed'));
  for (const { older, newer } of proposed) {
    assert.ok(routeSet.has(older) && routeSet.has(newer), `${older} → ${newer}`);
    assert.notEqual(stateOf(older).status, 'superseded');
    assert.ok(!stateOf(older).hidden, `${older} stays listed until the owner decides`);
    assert.equal(stateOf(older).awaitingDecision, newer);
    assert.equal(stateOf(newer).supersedes, undefined);
  }
  assert.ok(!proposed.some(e => e.older === 'task/failed'));
  assert.ok(proposed.some(e => e.older === 'task/running'), 'the running state is still awaiting a decision');
});

test('hidden families and states stay out of navigation, the picker and the overview counts', () => {
  const records = HFV2.findFamily('records');
  assert.equal(records.hidden, true);
  assert.equal(HFV2.currentStates(records).length, 0);
  assert.deepEqual(Array.from(records.states, s => s.id).sort(), ['adaptive', 'platform', 'retry', 'stop', 'task-overview']);
  assert.ok(records.states.every(s => s.status === 'record'));
  const overview = HFV2.templates['overview/areas'];
  assert.ok(!overview.includes('Decision boards'), 'hidden families are not listed');
  assert.ok(overview.includes('href="#task/failed"'), 'the earlier design is listed under earlier designs');
  const task = HFV2.findFamily('task');
  const current = HFV2.currentStates(task).length;
  assert.ok(new RegExp(`Task</a></td><td>${current}</td>`).test(overview), 'overview counts current states only');
  assert.equal(HFV2.currentStates(task).length, task.states.length - 1);
  for (const d of descriptors.filter(x => x.family.id === 'records')) assert.equal(d.hidden, true);
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.match(catalog, /HFV2\.currentStates\(family\)/, 'navigation lists current states');
  assert.match(catalog, /state\.hidden && state\.id !== current\.state/, 'the picker skips hidden states except the open one');
});

test('status and approval are per state and never borrowed from a sibling', () => {
  const stateOf = route => { const [f, s] = route.split('/'); return [HFV2.findFamily(f), HFV2.findState(HFV2.findFamily(f), s)]; };
  const line = route => HFV2.approvalLine(...stateOf(route));
  assert.match(line('task/running'), /^Approved by the owner on 2026-11-03 · canvas /);
  assert.match(line('task/activity-observed'), /^Approved by the owner on 2026-11-05 · /);
  assert.match(line('new-task/composer-ready'), /^Approved by the owner on 2026-11-05 · /);
  assert.match(line('new-task/centered-ready'), /^Approved by the owner on 2026-11-06 · /);
  assert.match(line('task/running-stop'), /^Approved by the owner on 2026-11-07 · /);
  assert.match(line('task/failed'), /^Approved by the owner on 2026-11-03 · canvas /, 'a superseded state keeps its own approval');
  assert.equal(stateOf('task/cancelled-partial')[1].status, 'provisional');
  assert.equal(line('task/cancelled-partial'), 'Provisional · not approved · contract gap open');
  for (const state of ['populated', 'page-error', 'empty', 'loading', 'error']) assert.equal(stateOf(`task/artifacts-${state}`)[1].status, 'provisional', `artifacts-${state}`);
  assert.equal(line('records/retry'), 'Decision record · options not chosen are not approved');
  for (const family of HFV2.registry.families) {
    assert.equal(family.approval, undefined, `${family.id} carries no family approval; each state owns its own`);
    for (const state of family.states.filter(x => x.approval)) assert.ok(state.approval.date && state.approval.by && state.approval.decision, `${family.id}/${state.id} approval is complete`);
  }
});

test('the provisional notice survives for artifacts reached from any approved task state', () => {
  const source = read(path.join(v2, 'scripts', 'm05-proposal.js'));
  assert.match(source, /Needs contract: task-artifacts has no canonical fixture or capability string yet\./);
  assert.match(source, /ui\.pane && ui\.tab === 'artifacts'/);
  assert.match(source, /state\.flag\.indexOf\('task-artifacts'\)/);
  assert.equal(HFV2.findState(HFV2.findFamily('task'), 'changes-single').status, 'approved');
});

test('retargeted links in renderers resolve to registered routes', () => {
  assert.equal(HFV2.routeFor('m05', 'overview'), 'records/task-overview');
  assert.equal(HFV2.routeFor('m04', 'history-retained'), 'sidebar/history-retained');
  assert.equal(HFV2.routeFor('m04', 'history-older'), 'sidebar/history-older');
  assert.equal(HFV2.routeFor('d2b', 'observed'), 'task/activity-observed');
  assert.equal(HFV2.routeFor('m04', 'unknown'), null);
  for (const id of ['composer-ready', 'amendment-ready', 'shell', 'advanced', 'history-retained', 'runtime-checking']) assert.ok(routeSet.has(HFV2.routeFor('m04', id)), id);
  for (const gap of HFV2.m05Proposal.GAPS) for (const id of gap.routes) assert.ok(routeSet.has(HFV2.routeFor('m05', id)), id);
});
