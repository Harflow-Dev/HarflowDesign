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
const STATUSES = ['approved', 'provisional', 'record'];
// Hash links that were never routes: buttons and specimens drawn as links. The catalog ignores a click on
// them, because only `#family/state[/appearance]` hashes parse as routes. Every other hash link must
// resolve, through aliases and at most one redirect, to a registered state.
const INERT_LINKS = new Set(['#', '#new', '#revise-goal', '#install-antigravity', '#settings', '#needs-you', '#workflows', '#resources', '#statistics', '#needs-you-empty', '#needs-you-active']);
const INERT_PATTERN = /^#t\d+$/; // anchors of the tab and table-of-contents specimens
const LINK_SHAPE = /^#[a-z0-9-]+\/[a-z0-9-]+(\/(light|dark|system))?$/;
function checkHash(href, where) {
  if (INERT_LINKS.has(href) || INERT_PATTERN.test(href)) return;
  assert.match(href, LINK_SHAPE, `${where}: ${href} is neither a route link nor an allowlisted inert link`);
  const resolved = HFV2.resolveRoute(href);
  const target = resolved.replace(/\/(light|dark|system)$/, '').slice(1);
  assert.ok(routeSet.has(target), `${where}: ${href} resolves to unregistered ${target}`);
  assert.ok(!(target in HFV2.routeRedirects), `${where}: ${href} settles on a retired route`);
  assert.ok(HFV2.describe(target), `${where}: ${href} is not renderable`);
}
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
    m04: [...HFV2.m04ProposalStates, ...HFV2.m04AmendmentStates, ...HFV2.m04RedrawStates].map(x => x.id),
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
      if (href.startsWith('#')) {
        routed += 1;
        checkHash(href, key);
      } else if (key === 'overview/areas') {
        assert.ok(fs.existsSync(path.join(v2, href.split('#')[0])), `${key} links to a missing document ${href}`);
      } else {
        assert.fail(`${key} has a non-local link ${href}`);
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
const redirects = HFV2.routeRedirects;
const retired = HFV2.retired;
const retiredByRoute = new Map(retired.map(entry => [entry.route, entry]));
const SUFFIXES = ['', '/light', '/dark', '/system'];
const reserved = JSON.parse(read(path.join(root, 'tests', 'data', 'v2-reserved-routes.json'))).routes;

// Template keys that renderers clone for other states.
function rendererReads() {
  const found = new Set();
  for (const name of ['m04-proposal.js', 'm05-proposal.js', 'd2b-proposal.js']) {
    for (const [, key] of read_(name).matchAll(/'((?:new-task|task|sidebar|workflows)\/[a-z0-9-]+)'/g)) found.add(key);
  }
  return found;
}

test('aliases resolve old routes without shadowing or chaining, and land on a live route or a retired one', () => {
  const entries = Object.entries(aliases);
  assert.equal(entries.length, descriptors.filter(d => d.renderer && !d.state.redrawOf).length + retired.filter(e => e.renderer).length, 'every renderer route has exactly one old route, retired ones included, except provisional redraws');
  for (const [old, target] of entries) {
    assert.match(old, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!routeSet.has(old), `${old} is an alias and must not also be canonical`);
    assert.ok(!(old in redirects), `${old} is an alias and must not also be a redirect`);
    assert.ok(!(target in aliases), `${old} chains through ${target}`);
    if (routeSet.has(target)) {
      const d = HFV2.describe(target);
      assert.equal(d.templateKey, old, `${old} renders the same template as ${target}`);
      assert.ok(d.renderer, `${target} keeps its renderer`);
    } else {
      const entry = retiredByRoute.get(target);
      assert.ok(entry, `${old} points at missing route ${target}`);
      assert.equal(entry.template, old, `${old} drew the template of the retired ${target}`);
      assert.ok(entry.renderer, `${target} kept its renderer when it was retired`);
    }
  }
  assert.equal(new Set(entries.map(([, target]) => target)).size, entries.length, 'no two old routes share a route');
});

test('resolveRoute canonicalises old routes and keeps the appearance suffix', () => {
  for (const suffix of SUFFIXES) {
    assert.equal(HFV2.resolveRoute(`#m05-proposal/state-running${suffix}`), `#task/running-stop${suffix}`);
    assert.equal(HFV2.resolveRoute(`#m04-proposal/history-retained${suffix}`), `#sidebar/history-retained${suffix}`);
    assert.equal(HFV2.resolveRoute(`#d2b-proposal/events${suffix}`), `#task/activity-sources${suffix}`);
    assert.equal(HFV2.resolveRoute(`#task/approval${suffix}`), `#task/approval${suffix}`, 'a canonical route is unchanged');
    assert.equal(HFV2.resolveRoute(`#task/running${suffix}`), `#task/running-stop${suffix}`, 'a retired route redirects');
    assert.equal(HFV2.resolveRoute(`#m04-proposal/composer-ready${suffix}`), `#new-task/centered-ready${suffix}`, 'an alias followed by a redirect');
    assert.equal(HFV2.resolveRoute(`#m04-proposal/advanced${suffix}`), `#new-task/centered-options${suffix}`);
  }
  for (const odd of ['', '#', '#nothing', '#a/b/c/d', '#m05-proposal/state-running/sepia', '#m05-proposal/unknown']) assert.equal(HFV2.resolveRoute(odd), odd);
  assert.equal(HFV2.resolveRoute(undefined), undefined);
  for (const [old, target] of Object.entries(aliases)) {
    const final = target in redirects ? redirects[target] : target;
    assert.equal(HFV2.resolveRoute(`#${old}/dark`), `#${final}/dark`);
  }
});

test('redirects send retired routes to live states and obey their invariants', () => {
  const entries = Object.entries(redirects);
  assert.ok(entries.length >= 9);
  assert.deepEqual(Array.from(retired, e => e.route).sort(), entries.map(([from]) => from).sort(), 'every redirect is a recorded retirement');
  for (const [from, to] of entries) {
    assert.match(from, /^[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.ok(!routeSet.has(from), `${from} is retired and must not be navigable`);
    assert.ok(!(from in aliases), `${from} must not be an alias key`);
    assert.ok(routeSet.has(to), `${from} redirects to a registered state`);
    assert.ok(!(to in redirects), `${to} is a redirect target and must not itself be retired`);
    assert.ok(!(to in aliases), `${to} is a redirect target and must not be an alias key`);
    assert.equal(HFV2.describe(to).hidden, false, `${from} does not redirect to a hidden state`);
    assert.equal(retiredByRoute.get(from).redirect, to);
  }
  for (const entry of retired) {
    for (const field of ['title', 'template', 'basis', 'pins']) assert.ok(entry[field], `${entry.route} records its ${field}`);
    assert.equal(routeSet.has(entry.route), false);
    const cloned = rendererReads().has(entry.template);
    assert.equal(typeof HFV2.templates[entry.template] === 'string', cloned, `${entry.template} stays only when a renderer clones it`);
    assert.ok(!(entry.template in HFV2.componentDocs), `${entry.template} keeps no guide`);
    if (entry.renderer) assert.equal(HFV2.routeFor(entry.renderer, entry.mount), entry.route, 'generated links still produce the retired route');
  }
  for (const suffix of SUFFIXES) for (const [from, to] of entries) assert.equal(HFV2.resolveRoute(`#${from}${suffix}`), `#${to}${suffix}`);
});

test('every alias, reserved route and appearance suffix reaches a live, renderable state in at most one redirect', () => {
  const sources = [...Object.keys(aliases), ...reserved, ...Object.keys(redirects), ...keys];
  for (const route of new Set(sources)) {
    for (const suffix of SUFFIXES) {
      const resolved = HFV2.resolveRoute(`#${route}${suffix}`);
      const target = resolved.slice(1, suffix ? -suffix.length : undefined);
      assert.ok(resolved.endsWith(suffix), `${route} keeps ${suffix || 'no suffix'}`);
      assert.ok(routeSet.has(target), `${route} resolves to missing ${target}`);
      const d = HFV2.describe(target);
      assert.equal(typeof HFV2.templates[d.templateKey], 'string', `${target} has a template`);
      if (d.renderer) assert.equal(typeof HFV2[HFV2.RENDERERS[d.renderer].api].mount, 'function');
      assert.equal(HFV2.resolveRoute(resolved), resolved, `${route} is settled after one resolution`);
    }
  }
});

test('every route registered at the base commit still opens the same design', () => {
  const routes = reserved;
  assert.ok(routes.length >= 170);
  assert.equal(new Set(routes).size, routes.length);
  for (const route of routes) {
    if (route in aliases) continue;
    if (route in redirects) continue;
    assert.ok(routeSet.has(route), `${route} neither exists nor is an alias or a redirect`);
    assert.equal(HFV2.describe(route).templateKey, route, `${route} was reused for another design`);
  }
  assert.ok(routeSet.has(HFV2.registry.defaultRoute));
  assert.equal(HFV2.registry.defaultRoute, 'overview/areas');
  assert.equal(redirects['new-task/default'], 'new-task/centered-empty');
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

test('retired states are gone from the registry; superseded-state handling no longer exists', () => {
  const stateOf = route => { const [f, s] = route.split('/'); return HFV2.findState(HFV2.findFamily(f), s); };
  assert.deepEqual(Array.from(retired, e => e.route).sort(), [
    'new-task/composer-ready', 'new-task/composer-unknown', 'new-task/default', 'new-task/harness-menu', 'new-task/options-open',
    'new-task/sidebar-collapsed', 'task/done', 'task/failed', 'task/running'
  ]);
  for (const entry of retired) {
    assert.equal(stateOf(entry.route), null, `${entry.route} is not registered`);
    assert.ok(!HFV2.currentStates(HFV2.findFamily(entry.route.split('/')[0])).some(s => s.id === entry.route.split('/')[1]));
  }
  assert.equal(redirects['task/failed'], 'task/failed-continue');
  assert.equal(redirects['task/running'], 'task/running-stop');
  assert.equal(redirects['task/done'], 'task/changes-single');
  assert.equal(redirects['new-task/default'], 'new-task/centered-empty');
  assert.equal(redirects['new-task/sidebar-collapsed'], 'sidebar/collapsed');
  assert.equal(redirects['new-task/harness-menu'], 'new-task/centered-ready');
  assert.equal(redirects['new-task/composer-ready'], 'new-task/centered-ready');
  assert.equal(redirects['new-task/composer-unknown'], 'new-task/centered-unknown');
  assert.equal(redirects['new-task/options-open'], 'new-task/centered-options');
  assert.ok(!('task/activity-sources' in redirects), 'the activity sources state waits for an owner decision');
  assert.ok(routeSet.has('task/activity-sources'));
  for (const family of HFV2.registry.families) for (const state of family.states) {
    assert.notEqual(state.status, 'superseded');
    for (const field of ['supersededBy', 'supersedes', 'awaitingDecision']) assert.equal(state[field], undefined, `${family.id}/${state.id} ${field}`);
  }
  assert.equal(HFV2.supersessions, undefined);
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.ok(!/supersededBy|awaitingDecision|AWAITING|Earlier design/.test(catalog), 'the earlier-design note is gone');
  const decisions = read(path.join(v2, 'docs', 'decisions', 'README.md'));
  for (const entry of retired) {
    assert.ok(decisions.includes(`\`${entry.route}\``), `${entry.route} is recorded in the decisions README`);
    assert.ok(decisions.includes(`\`${entry.redirect}\``), `${entry.redirect} is recorded in the decisions README`);
  }
  assert.ok(decisions.includes('Q2 owner answer 2026-11-08; target confirmed by the coordinator 2026-11-08'), 'the decisions README keeps the coordinator wording');
  assert.equal(retiredByRoute.get('new-task/default').basis, 'Owner answer 2026-11-08 (Q2); target confirmed by the coordinator 2026-11-08');
});

test('hidden families and states stay out of navigation, the picker and the overview counts', () => {
  const records = HFV2.findFamily('records');
  assert.equal(records.hidden, true);
  assert.equal(HFV2.currentStates(records).length, 0);
  assert.deepEqual(Array.from(records.states, s => s.id).sort(), ['adaptive', 'platform', 'retry', 'stop', 'task-overview']);
  assert.ok(records.states.every(s => s.status === 'record'));
  const overview = HFV2.templates['overview/areas'];
  assert.ok(!overview.includes('Decision boards'), 'hidden families are not listed');
  assert.ok(overview.includes('Replaced designs') && !overview.includes('Earlier designs') && !overview.includes('Awaiting a decision'));
  for (const entry of retired) assert.ok(overview.includes(`now opens <a href="#${entry.redirect}">`), `${entry.route} is listed under replaced designs`);
  const task = HFV2.findFamily('task');
  const current = HFV2.currentStates(task).length;
  assert.ok(new RegExp(`Task</a></td><td>${current}</td>`).test(overview), 'overview counts current states only');
  assert.equal(HFV2.currentStates(task).length, task.states.length);
  for (const d of descriptors.filter(x => x.family.id === 'records')) assert.equal(d.hidden, true);
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.match(catalog, /HFV2\.currentStates\(family\)/, 'navigation lists current states');
  assert.match(catalog, /state\.hidden && state\.id !== current\.state/, 'the picker skips hidden states except the open one');
});

test('status and approval are per state and never borrowed from a sibling', () => {
  const stateOf = route => { const [f, s] = route.split('/'); return [HFV2.findFamily(f), HFV2.findState(HFV2.findFamily(f), s)]; };
  const line = route => HFV2.approvalLine(...stateOf(route));
  assert.match(line('task/approval'), /^Approved by the owner on 2026-11-03 · canvas /);
  assert.match(line('task/activity-observed'), /^Approved by the owner on 2026-11-05 · /);
  assert.match(line('new-task/composer-loading'), /^Approved by the owner on 2026-11-05 · /);
  assert.match(line('new-task/centered-ready'), /^Approved by the owner on 2026-11-06 · /);
  assert.match(line('task/running-stop'), /^Approved by the owner on 2026-11-07 · /);
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
  for (const id of ['amendment-ready', 'shell', 'history-retained', 'runtime-checking']) assert.ok(routeSet.has(HFV2.routeFor('m04', id)), id);
  for (const id of ['composer-ready', 'composer-unknown', 'advanced']) {
    const route = HFV2.routeFor('m04', id);
    assert.ok(route && !routeSet.has(route), `${id} falls back to its retired route`);
    assert.ok(routeSet.has(HFV2.resolveRoute('#' + route).slice(1)), `${id} then redirects to a live state`);
  }
  for (const gap of HFV2.m05Proposal.GAPS) for (const id of gap.routes) assert.ok(routeSet.has(HFV2.routeFor('m05', id)), id);
});

// ---- Decisions folder ----

test('the decisions index lists every decision file and each screen has an anchor', () => {
  const dir = path.join(v2, 'docs', 'decisions');
  const index = read(path.join(dir, 'README.md'));
  const docs = fs.readdirSync(dir).filter(name => name.endsWith('.md') && name !== 'README.md');
  assert.equal(docs.length, 7);
  for (const name of docs) assert.ok(index.includes(`(${name})`), `${name} is indexed`);
  for (const family of HFV2.registry.families.filter(f => f.area)) assert.ok(index.includes(`### \`${family.id}\``), `${family.id} has a decision section`);
  for (const column of ['Status', 'Approved by and date', 'Recording commit', 'Routes', 'Files']) assert.ok(index.includes(column), column);
  for (const old of ['approval', 'm04-proposal', 'm05-task-screen-approval']) assert.ok(!fs.existsSync(path.join(v2, 'docs', `${old}.md`)), `${old}.md moved`);
});

test('the route map lists every earlier route and its current route', () => {
  const map = read(path.join(v2, 'docs', 'route-map.md'));
  for (const [old, target] of Object.entries(HFV2.routeAliases)) assert.ok(map.includes(`| \`${old}\` | \`${target}\` |`), `${old} is mapped`);
  for (const [from, to] of Object.entries(HFV2.routeRedirects)) assert.ok(map.includes(`| \`${from}\` | \`${to}\` |`), `${from} redirects to ${to} in the map`);
});

test('the coverage ledger keeps its headings and anchor, cites registered routes and annotates retired ones', () => {
  const ledger = read(path.join(v2, 'docs', 'migration-coverage.md'));
  assert.match(ledger, /^## Capability disposition ledger \(S03\)$/m);
  for (const [, now] of ledger.matchAll(/\(now `([a-z0-9/*-]+)`/g)) assert.ok(/^[a-z-]+\/[a-z0-9-]+\*?$/.test(now), `${now} is a current route`);
  let retiredCitations = 0;
  for (const match of ledger.matchAll(/`((?:task|new-task|sidebar)\/[a-z-]+)`/g)) {
    const route = match[1];
    if (route in HFV2.routeRedirects) {
      // A historical citation stays as written, followed by where it opens now.
      const rest = ledger.slice(match.index + match[0].length);
      const note = /^ \((?:retired|now)[^`]*`([a-z0-9/-]+)`/.exec(rest);
      if (note && note[1] === HFV2.routeRedirects[route]) { retiredCitations += 1; continue; }
      assert.fail(`${route} is retired and must be followed by "(retired; now opens \`${HFV2.routeRedirects[route]}\`"`);
    }
    // The target of a "now opens" note is itself cited right after a retired route; check it directly.
    assert.ok(routeSet.has(route), `${route} in the ledger exists`);
  }
  assert.ok(retiredCitations >= 8, 'the S03 ledger keeps its original route citations');
});

// ---- Strip literals and link behaviour ----

// The strip-building functions draw the catalog-only controls above each app frame. Their string
// literals are scanned for process names after markup and attribute names are removed. The decision
// boards (hidden `records` routes) are built elsewhere and are exempt: they record the history.
test('string literals in the strip builders carry no process names', () => {
  const sources = [
    ['m04-proposal.js', 'var controls=', 'var base = template('],
    ['d2b-proposal.js', "q('[data-d2b-controls]').innerHTML", "q('[data-d2b-status]')"],
    ['m05-proposal.js', 'var strip =', "host.querySelector('.hd-m05-catalog')"]
  ];
  const hits = [];
  for (const [name, from, to] of sources) {
    const source = read_(name);
    const region = source.slice(source.indexOf(from), source.indexOf(to, source.indexOf(from)));
    assert.ok(region.length > 200, `${name} strip region found`);
    for (const [, literal] of region.matchAll(/'((?:[^'\\\n]|\\.)*)'/g)) {
      const text = literal.replace(/<[^>]*>?/g, ' ').replace(/[\w:-]+=(?:"[^"]*"?|\\?')/g, ' ').replace(/\bdata-[\w-]+/g, ' ');
      if (/^m0\d$/.test(literal)) continue; // the renderer id passed to HFV2.routeFor, never displayed
      if (NAMING_RULE.test(text)) hits.push(`${name}: ${literal.slice(0, 70)}`);
    }
  }
  assert.deepEqual(hits, []);
});

test('only the overview and decision boards may navigate to documents from a specimen', () => {
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.match(catalog, /documentPage\) window\.location\.href = href/);
  assert.match(catalog, /documentPage = current\.family === 'overview' \|\| current\.family === 'records'/);
  assert.match(catalog, /event\.button !== 0 \|\| event\.metaKey \|\| event\.ctrlKey \|\| event\.shiftKey \|\| event\.altKey\)\) return;/, 'modified clicks on document links are left to the browser');
  assert.ok(catalog.indexOf('event.metaKey') < catalog.indexOf('event.preventDefault()'), 'the modifier check precedes interception');
  assert.ok(catalog.indexOf('event.preventDefault()') < catalog.indexOf('window.location.href = href'), 'other links are intercepted first');
  for (const key of Object.keys(HFV2.templates).filter(k => k !== 'overview/areas')) {
    for (const [, href] of HFV2.templates[key].matchAll(/href="([^"]*)"/g)) assert.ok(href.startsWith('#'), `${key} links to ${href}`);
  }
});

// ---- Links resolve to current states ----

test('renderer string literals that build hash links resolve to registered states', () => {
  // Chosen approach for renderer-generated hrefs: scan the string literals of the renderer sources
  // here, and check every rendered link in the pixel harness (a DOM check over every route).
  let found = 0;
  for (const name of ['m04-proposal.js', 'm05-proposal.js', 'd2b-proposal.js', 'catalog.js', 'screens-overview.js']) {
    for (const [, route] of stripComments(read_(name)).matchAll(/#([a-z0-9-]+\/[a-z0-9-]+(?:\/(?:light|dark|system))?)(?=['"\s>)\\]|$)/g)) {
      found += 1;
      checkHash('#' + route, name);
    }
  }
  assert.ok(found >= 3, 'the renderers build route links from literals');
  assert.match(read_('d2b-proposal.js'), /replace\('href="#new"', 'href="#new-task\/default"'\)/, 'the literal that builds the New task link is scanned');
  for (const d of descriptors.filter(x => x.renderer === 'd2b')) assert.equal(HFV2.routeFor('d2b', d.mount), d.route, 'generated d2b links name a registered route');
  for (const entry of HFV2.m05ProposalStates) assert.ok(routeSet.has(HFV2.routeFor('m05', entry.id)), `m05 link to ${entry.id}`);
  assert.deepEqual(Array.from(HFV2.templates['overview/areas'].matchAll(/href="(#[^"]*)"/g), m => m[1]).filter(h => !LINK_SHAPE.test(h)), []);
});

test('every in-page link of a template resolves, through aliases and redirects, to a registered state', () => {
  let checked = 0;
  for (const key of Object.keys(HFV2.templates)) {
    for (const [, href] of HFV2.templates[key].matchAll(/href="(#[^"]*)"/g)) { checked += 1; checkHash(href, key); }
  }
  assert.ok(checked > 100);
  assert.throws(() => checkHash('#task/running/sepia', 'probe'), 'a malformed link fails');
  assert.throws(() => checkHash('#nowhere/state', 'probe'), 'an unknown route fails');
  assert.doesNotThrow(() => checkHash('#task/running/dark', 'probe'), 'a retired route with a suffix redirects');
  assert.throws(() => checkHash('#something-else', 'probe'), 'an unlisted fragment fails');
});

test('strip links of the m04 renderer point at current states, never at retired ones', () => {
  const source = read_('m04-proposal.js');
  const region = source.slice(source.indexOf('var boards = amendment'), source.indexOf('var strips = H.catalogStrips.m04;'));
  const mounts = [...region.matchAll(/\['([a-z-]+)','[A-Za-z ]+'\]/g)].map(m => m[1]);
  assert.ok(mounts.length >= 11, 'both strips list their boards');
  for (const mount of mounts) {
    const route = HFV2.routeFor('m04', mount);
    assert.ok(routeSet.has(route), `${mount} links to the registered ${route}`);
  }
  assert.ok(!/routeFor\('m04', '(composer-ready|composer-unknown|advanced)'\)/.test(source), 'no strip builds a link to a retired mount');
  assert.ok(!/baselineLink|centeredLink/.test(source));
  const overviewMounts = read_('m05-proposal.js').match(/routeFor\('m05', '[a-z-]+'\)/g) || [];
  for (const call of overviewMounts) assert.ok(routeSet.has(HFV2.routeFor('m05', call.match(/'m05', '([a-z-]+)'/)[1])), call);
});

// ---- Provisional centered redraws ----

const pending = HFV2.pendingRedraw;
const REDRAW_ROUTES = ['new-task/centered-loading', 'new-task/centered-unqualified', 'new-task/centered-invalid', 'new-task/centered-starting', 'new-task/centered-refused', 'new-task/centered-options-closed'];
const stateOfRoute = route => { const [f, s] = route.split('/'); return [HFV2.findFamily(f), HFV2.findState(HFV2.findFamily(f), s)]; };

test('six centered redraws are provisional, carry no approval date and link to their earlier layout', () => {
  assert.deepEqual(Array.from(pending, pair => pair.newer), REDRAW_ROUTES);
  assert.deepEqual(Array.from(pending, pair => pair.older), [
    'new-task/composer-loading', 'new-task/composer-unqualified', 'new-task/composer-invalid', 'new-task/composer-starting', 'new-task/composer-refused', 'new-task/options-closed'
  ]);
  for (const { older, newer } of pending) {
    assert.ok(routeSet.has(older) && routeSet.has(newer), `${older} and ${newer} exist`);
    const [family, state] = stateOfRoute(newer);
    const [, earlier] = stateOfRoute(older);
    assert.equal(state.status, 'provisional');
    assert.equal(state.redrawOf, older);
    assert.equal(state.approval, undefined, `${newer} has no approval`);
    assert.equal(HFV2.approvalLine(family, state), 'Provisional · needs owner approval');
    assert.ok(!/\d{4}-\d{2}-\d{2}/.test(HFV2.approvalLine(family, state)), 'no approval date');
    assert.equal(earlier.status, 'approved', `${older} stays listed and approved until the owner decides`);
    assert.ok(!earlier.hidden);
    assert.ok(!(older in redirects) && !(newer in redirects) && !(newer in aliases));
    const d = HFV2.describe(newer);
    assert.equal(d.renderer, 'm04');
    assert.equal(d.templateKey, `m04-proposal/${d.mount}`);
    assert.match(HFV2.templates[d.templateKey], /hd-m04-amendment/, 'drawn in the centered layout');
  }
  assert.equal(new Set(pending.map(pair => pair.newer)).size, pending.length);
});

test('provisional redraw strips say so, with no approval date and no approved-amendment wording', () => {
  const strips = HFV2.catalogStrips.m04;
  assert.equal(strips.provisionalHeading, 'Provisional · needs owner approval');
  assert.match(strips.provisionalNotice, /^Provisional · needs owner approval\./);
  for (const text of [strips.provisionalHeading, strips.provisionalNotice]) {
    assert.ok(!/\d{4}-\d{2}-\d{2}/.test(text), 'no date');
    assert.ok(!/Approved|Owner 20/.test(text), 'no approval wording');
  }
});

test('the catalog labels earlier layouts that await a redraw and links the pair both ways', () => {
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.match(catalog, /Earlier layout; centered redraw awaiting owner approval/);
  assert.match(catalog, /pendingRedrawOf/);
  assert.match(catalog, /redrawsOf/);
  const overview = HFV2.templates['overview/areas'];
  assert.ok(overview.includes('Redraws awaiting approval'));
  for (const { older, newer } of pending) assert.ok(overview.includes(`<a href="#${older}">`) && overview.includes(`<a href="#${newer}">`));
  const decisions = read(path.join(v2, 'docs', 'decisions', 'README.md'));
  for (const { older, newer } of pending) assert.ok(decisions.includes(`\`${older}\``) && decisions.includes(`\`${newer}\``), `${older} and ${newer} are recorded`);
});

test('a redirect target is never retired by a later sign-off without repointing the redirect', () => {
  // Rule for a redraw sign-off: when an older state that is already a redirect target is retired, its
  // redirect is repointed to the redraw. Until then no pending older state may be a redirect key.
  const targets = new Set(Object.values(redirects));
  for (const key of Object.keys(redirects)) assert.ok(!targets.has(key), `${key} is both a redirect key and a target`);
  for (const { older } of pending) assert.ok(!(older in redirects));
});
