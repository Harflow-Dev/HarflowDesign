import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
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
const NEW_M05_MOUNTS = new Set(['changes-inline', 'changes-inline-minimum', 'events-result-usage', 'events-result-usage-minimum', 'events-usage', 'events-usage-minimum', 'running-composer-empty', 'running-composer-empty-minimum', 'running-composer-draft', 'running-composer-draft-minimum']);
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
      // A loading state draws the template of the loaded screen it mirrors; every other state renders its own.
      // A loading draft at 1000 × 620 declares a minimum and a skeleton and no skeleton.of: its template is the minimum's.
      if (d.minimum) assert.equal(d.templateKey, HFV2.describe(d.minimum.of).templateKey, `${d.route} renders the template of ${d.minimum.of}`);
      else if (d.skeleton) assert.equal(d.templateKey, HFV2.describe(d.skeleton.of).templateKey, `${d.route} renders the template of ${d.skeleton.of}`);
      else assert.equal(d.templateKey, d.route, `${d.route} renders its own template`);
    }
  }
  const mountIds = {
    m04: [...HFV2.m04ProposalStates, ...HFV2.m04AmendmentStates, ...HFV2.m04RedrawStates, ...HFV2.m04ModelStates, ...HFV2.m04RuntimeStates, ...HFV2.m04RepositoryStates].map(x => x.id),
    m05: HFV2.m05ProposalStates.map(x => x.id),
    messages: HFV2.messageStates.map(x => x.id),
    workflowQuestions: HFV2.findFamily('needs-you').states.filter(x => x.source?.renderer === 'workflowQuestions').map(x => x.id),
    workflowNaming: HFV2.findFamily('workflow-editor').states.filter(x => x.source?.renderer === 'workflowNaming').map(x => x.id),
    runQuestions: HFV2.findFamily('workflow-run').states.filter(x => x.source?.renderer === 'runQuestions').map(x => x.id),
    rootApprovals: HFV2.findFamily('workflow-run').states.filter(x => x.source?.renderer === 'rootApprovals').map(x => x.id),
    composerEdge: HFV2.findFamily('task').states.filter(x => x.source?.renderer === 'composerEdge').map(x => x.id),
    inspectorApprovals: HFV2.findFamily('workflow-run').states.filter(x => x.source?.renderer === 'inspectorApprovals').map(x => x.id),
    menuBarPopover: HFV2.findFamily('menu-bar').states.filter(x => x.source?.renderer === 'menuBarPopover').map(x => x.id),
    engineRuntime: HFV2.registry.families.flatMap(f => f.states).filter(x => x.source?.renderer === 'engineRuntime').map(x => x.id)
  };
  for (const d of descriptors.filter(x => x.renderer)) {
    if (d.renderer === 'transcript') assert.equal(HFV2.d2bProposal.createState(d.mount).name, d.mount, `${d.route} is a known fixture`);
    else assert.ok(mountIds[d.renderer].includes(d.mount), `${d.route} mounts a known fixture`);
  }
});

test('composer edge companions stay provisional and retain their derivation routes', () => {
  const expected = {
    task: ['composer-edge', 'composer-edge-end', 'composer-edge-short', 'composer-edge-minimum', 'composer-edge-embedded'],
    'parallel-group': ['composer-edge', 'composer-edge-minimum'],
    'workflow-run': ['composer-edge-parallel', 'composer-edge-parallel-minimum', 'composer-edge-graph', 'composer-edge-graph-minimum']
  };
  const bases = {
    'task/composer-edge': 'task/running-composer-empty',
    'task/composer-edge-end': 'task/running-composer-empty',
    'task/composer-edge-short': 'task/running-composer-empty',
    'task/composer-edge-minimum': 'task/running-composer-empty',
    'task/composer-edge-embedded': 'task/running-stop',
    'parallel-group/composer-edge': 'parallel-group/lane-messages-queued',
    'parallel-group/composer-edge-minimum': 'parallel-group/lane-messages-queued',
    'workflow-run/composer-edge-parallel': 'workflow-run/parallel',
    'workflow-run/composer-edge-parallel-minimum': 'workflow-run/parallel',
    'workflow-run/composer-edge-graph': 'workflow-run/node-message-queued',
    'workflow-run/composer-edge-graph-minimum': 'workflow-run/node-message-queued'
  };
  for (const [family, ids] of Object.entries(expected)) for (const id of ids) {
    const route = `${family}/${id}`;
    const state = HFV2.findState(HFV2.findFamily(family), id);
    assert.ok(state, `${route} is registered`);
    assert.equal(state.status, 'provisional', route);
    assert.equal(HFV2.describe(route).status, 'provisional', `${route} route keeps its status`);
    const base = bases[route];
    assert.ok(routeSet.has(base), `${route} derives from a registered route`);
    assert.ok(HFV2.describe(base), `${route} derivation route is renderable`);
    assert.match(HFV2.componentDocs[route], new RegExp(`Derived from <a href="#${base}">`), `${route} records route provenance`);
    assert.equal(typeof HFV2.templates[route], 'string', `${route} resolves to a rendered template`);
  }
  for (const [family, ids] of Object.entries(expected)) {
    const actual = HFV2.findFamily(family).states.filter(state => state.id.startsWith('composer-edge')).map(state => state.id);
    assert.deepEqual(JSON.parse(JSON.stringify(actual)), ids, `${family} companion routes stay explicit`);
  }
});

test('composer edge fade activation requires remaining content and no focus in the feed', () => {
  const source = read(path.join(v2, 'scripts', 'states-composer-edge.js'));
  const styles = read(path.join(v2, 'styles', 'composer-edge.css'));
  assert.match(source, /var more = feed\.scrollHeight - feed\.clientHeight - feed\.scrollTop > 1;/);
  assert.match(source, /wrapper\.classList\.toggle\('has-more', more && !feed\.contains\(document\.activeElement\)\);/);
  assert.match(styles, /\.hd-composer-edge-viewport\.has-more::after/);
  assert.doesNotMatch(styles, /\.hd-composer-edge-viewport::after\s*\{/);
});

test('composer edge content stays before live or queued rows, including minimum companions', () => {
  const activityRoutes = [
    'parallel-group/composer-edge', 'parallel-group/composer-edge-minimum',
    'workflow-run/composer-edge-parallel', 'workflow-run/composer-edge-parallel-minimum'
  ];
  for (const route of activityRoutes) {
    const html = HFV2.templates[route];
    const filler = html.indexOf('data-edge-fixture="activity"');
    const live = html.indexOf('class="hd-working"');
    assert.ok(filler >= 0 && live > filler, `${route}: synthetic activity precedes the live row`);
  }
  for (const route of ['workflow-run/composer-edge-graph', 'workflow-run/composer-edge-graph-minimum']) {
    const html = HFV2.templates[route];
    const paneStart = html.indexOf('aria-label="Selected on-demand node"');
    assert.ok(paneStart >= 0, `${route}: selected node pane exists`);
    const pane = html.slice(paneStart);
    const filler = pane.indexOf('data-edge-fixture="completed-call"');
    const queuedMatch = /class="[^"]*\bhd-msgq\b[^"]*"/.exec(pane);
    assert.ok(filler >= 0 && queuedMatch && queuedMatch.index > filler, `${route}: completed call output precedes the queued message in the selected node pane`);
  }
  for (const route of [
    'parallel-group/composer-edge-minimum', 'workflow-run/composer-edge-parallel-minimum',
    'workflow-run/composer-edge-graph-minimum'
  ]) {
    const html = HFV2.templates[route];
    const graph = route.includes('-graph-');
    assert.match(html, /height: 620px;/, `${route}: minimum height`);
    assert.match(html, new RegExp(`data-pl-min="sidebar,${graph ? 'canvas' : 'lanes'},topbar-meta"`), `${route}: minimum fixes`);
  }

  // The task companion is mounted dynamically; capture its renderer hook and inspect the resulting DOM string.
  const original = HFV2.m05Proposal.mountState;
  let captured;
  HFV2.m05Proposal.mountState = (root, state, extensions) => { captured = { state, extensions }; return extensions; };
  try {
    const extensions = HFV2.composerEdge.mount({}, 'composer-edge');
    const body = '<div class="hd-msg-agent">Earlier</div><div class="hd-working">Running</div>';
    const html = extensions.hooks.transcriptTail({}, body);
    assert.ok(html.indexOf('data-edge-fixture="activity"') < html.indexOf('class="hd-working"'), 'Task synthetic activity precedes the live row');
    assert.ok(html.indexOf('class="hd-working"') < html.indexOf('hd-msgq--pending'), 'the queued message remains below live activity');
    HFV2.composerEdge.mount({}, 'composer-edge-minimum');
    assert.equal(captured.state.spec.frame, 'minimum', 'Task minimum companion selects the minimum frame');
  } finally {
    HFV2.m05Proposal.mountState = original;
  }
});

test('every template is reached by a descriptor or is a base key a renderer reads', () => {
  const reached = new Set(templateKeys);
  const read = new Set();
  for (const name of ['m04-proposal.js', 'm05-proposal.js', 'd2b-proposal.js']) {
    for (const [, key] of read_(name).matchAll(/'((?:new-task|task|sidebar|workflows)\/[a-z0-9-]+)'/g)) read.add(key);
  }
  // The approval states are derived from base templates; two of those bases (task/approval, menu-bar/busy) belong to retired routes.
  for (const derivation of HFV2.approvalDerivations) read.add(derivation.base);
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
  assert.ok(Object.keys(HFV2.catalogStrips.transcript).length >= 3, 'the transcript renderer strip fields are scanned too');
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
  // The approval states clone the templates of task/approval and menu-bar/busy, whose routes were retired on 2026-11-15.
  for (const derivation of HFV2.approvalDerivations) found.add(derivation.base);
  return found;
}

test('aliases resolve old routes without shadowing or chaining, and land on a live route or a retired one', () => {
  const entries = Object.entries(aliases);
  // The transcript, queued-message, workflow-question and workflow-naming renderers, the centered redraws and model picker states have new canonical routes with no earlier name.
  // The retired duplicate shell state and the retired starting state (replaced on 2026-11-09) had no earlier name either.
  const redrawMounts = new Set([...HFV2.m04RedrawStates, ...HFV2.m04ModelStates, ...HFV2.m04RuntimeStates, ...HFV2.m04RepositoryStates].map(x => x.id));
  // The retired runtime card draft (2026-11-14) was a provisional route with no earlier name either.
  // Composer-edge states are new provisional companions and have no earlier route identity.
  const nameless = new Set(['sidebar/centered-expanded', 'new-task/centered-starting', 'harness-runtime/installing-sidebar']);
  assert.equal(entries.length, descriptors.filter(d => d.renderer && !d.skeleton && d.renderer !== 'transcript' && d.renderer !== 'messages' && d.renderer !== 'workflowQuestions' && d.renderer !== 'workflowNaming' && d.renderer !== 'runQuestions' && d.renderer !== 'rootApprovals' && d.renderer !== 'composerEdge' && d.renderer !== 'inspectorApprovals' && d.renderer !== 'engineRuntime' && d.renderer !== 'menuBarPopover' && !(d.renderer === 'm05' && NEW_M05_MOUNTS.has(d.mount)) && !(d.renderer === 'm04' && redrawMounts.has(d.mount))).length + retired.filter(e => e.renderer && !nameless.has(e.route)).length, 'every renderer route has exactly one old route, retired ones included, except new companions and redraws');
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
    assert.equal(HFV2.resolveRoute(`#d2b-proposal/events${suffix}`), `#task/transcript-sources${suffix}`, 'an alias followed by a redirect');
    assert.equal(HFV2.resolveRoute(`#task/activity-sources${suffix}`), `#task/transcript-sources${suffix}`);
    assert.equal(HFV2.resolveRoute(`#m04-proposal/shell${suffix}`), `#new-task/centered-empty${suffix}`);
    assert.equal(HFV2.resolveRoute(`#task/approval-exact${suffix}`), `#task/approval-exact${suffix}`, 'a canonical route is unchanged');
    assert.equal(HFV2.resolveRoute(`#task/approval${suffix}`), `#task/approval-exact${suffix}`, 'a retired route redirects');
    assert.equal(HFV2.resolveRoute(`#task/running${suffix}`), `#task/running-stop${suffix}`, 'a retired route redirects');
    assert.equal(HFV2.resolveRoute(`#m04-proposal/composer-ready${suffix}`), `#new-task/centered-ready${suffix}`, 'an alias followed by a redirect');
    assert.equal(HFV2.resolveRoute(`#m04-proposal/advanced${suffix}`), `#new-task/centered-options${suffix}`);
  }
  for (const odd of ['', '#', '#nothing', '#a/b/c/d', '#m05-proposal/unknown', '#a/b/c/d/e']) assert.equal(HFV2.resolveRoute(odd), odd);
  assert.equal(HFV2.resolveRoute('#m05-proposal/state-running/sepia'), '#task/running-stop', 'an undeclared view is dropped, never kept');
  assert.equal(HFV2.resolveRoute(undefined), undefined);
  for (const [old, target] of Object.entries(aliases)) {
    const final = target in redirects ? redirects[target] : target;
    assert.equal(HFV2.resolveRoute(`#${old}/dark`), `#${final}/dark`);
  }
});

test('redirects send retired routes to live states and obey their invariants', () => {
  const entries = Object.entries(redirects);
  assert.equal(entries.length, 43);
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
    if (entry.route === 'statistics/all-time') {
      assert.equal(entry.template, 'statistics/overview', 'the retired derived state records its shared base template');
      assert.equal(typeof HFV2.templates[entry.template], 'string', 'the shared Statistics template remains for current states');
      assert.ok(!HFV2.componentDocs[entry.route], 'the retired state guide is removed');
      continue;
    }
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
    'app-states/setup', 'harness-runtime/installing-sidebar', 'menu-bar/busy', 'menu-bar/busy-minimum', 'new-task/centered-starting', 'new-task/composer-invalid', 'new-task/composer-loading', 'new-task/composer-ready', 'new-task/composer-refused', 'new-task/composer-starting',
    'new-task/composer-unknown', 'new-task/composer-unqualified', 'new-task/default', 'new-task/harness-menu', 'new-task/options-closed', 'new-task/options-open',
    'new-task/sidebar-collapsed', 'sidebar/centered-expanded', 'sidebar/collapsed', 'sidebar/expanded', 'sidebar/history-loading', 'sidebar/minimum',
    'statistics/all-time',
    'task/activity-capacity', 'task/activity-integrity-failed', 'task/activity-loading', 'task/activity-observed', 'task/activity-partial', 'task/activity-reconnecting',
    'task/activity-sources', 'task/activity-unavailable', 'task/approval', 'task/done', 'task/failed', 'task/running',
    ...['topbar-started', 'topbar-counts', 'topbar-more-actions', 'topbar-more-actions-disabled'].flatMap(id => [`workflow-run/${id}`, `workflow-run/${id}-minimum`])
  ].sort());
  for (const entry of retired) {
    assert.equal(stateOf(entry.route), null, `${entry.route} is not registered`);
    assert.ok(!HFV2.currentStates(HFV2.findFamily(entry.route.split('/')[0])).some(s => s.id === entry.route.split('/')[1]));
  }
  assert.equal(redirects['task/failed'], 'task/failed-continue');
  assert.equal(redirects['task/running'], 'task/running-stop');
  assert.equal(redirects['task/done'], 'task/changes-single');
  assert.equal(redirects['new-task/default'], 'new-task/centered-empty');
  assert.equal(redirects['new-task/sidebar-collapsed'], 'sidebar/centered-collapsed');
  assert.equal(redirects['new-task/harness-menu'], 'new-task/centered-harness-open');
  assert.equal(redirects['new-task/centered-starting'], 'new-task/centered-starting-plain');
  assert.equal(redirects['new-task/composer-starting'], 'new-task/centered-starting-plain', 'the earlier redirect is repointed in one hop');
  assert.equal(redirects['new-task/composer-ready'], 'new-task/centered-ready');
  assert.equal(redirects['new-task/composer-unknown'], 'new-task/centered-unknown');
  assert.equal(redirects['new-task/options-open'], 'new-task/centered-options');
  assert.equal(redirects['task/activity-sources'], 'task/transcript-sources');
  assert.equal(redirects['statistics/all-time'], 'statistics/overview');
  assert.ok(!routeSet.has('task/activity-sources'));
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
  assert.match(line('needs-you/waiting'), /^Approved by the owner on 2026-11-03 · canvas /);
  assert.equal(line('task/transcript-observed'), 'Approved by the owner on 2026-11-08 · Task transcript');
  assert.equal(line('new-task/centered-loading'), 'Approved by the owner on 2026-11-08 · Centered composer');
  assert.equal(line('sidebar/centered-minimum'), 'Approved by the owner on 2026-11-08 · Sidebar');
  assert.equal(line('new-task/centered-harness-open'), 'Approved by the owner on 2026-11-15 · Centered composer · Model field');
  assert.equal(line('new-task/centered-model-truncated'), 'Approved by the owner on 2026-11-15 · Model picker');
  assert.equal(line('new-task/centered-model-default'), 'Approved by the owner on 2026-11-15 · Model picker');
  assert.equal(line('harness-runtime/updating'), 'Approved by the owner on 2026-11-15 · Runtime update');
  assert.equal(line('task/approval-exact'), 'Approved by the owner on 2026-11-15 · Queued messages and approval states');
  assert.equal(line('task/loading-known-title'), 'Provisional · not approved');
  assert.match(line('sidebar/history-empty'), /^Approved by the owner on 2026-11-05 · /);
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
  assert.equal(HFV2.routeFor('transcript', 'observed'), 'task/transcript-observed');
  assert.equal(HFV2.routeFor('d2b', 'observed'), 'task/activity-observed', 'the retired activity state keeps its mount for the fallback');
  assert.equal(HFV2.routeFor('m04', 'unknown'), null);
  for (const id of ['amendment-ready', 'centered-harness-open', 'history-retained', 'runtime-checking']) assert.ok(routeSet.has(HFV2.routeFor('m04', id)), id);
  for (const id of ['composer-ready', 'composer-unknown', 'advanced', 'shell', 'shell-collapsed', 'shell-narrow', 'composer-loading', 'advanced-closed', 'centered-shell']) {
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
  assert.deepEqual(docs.sort(), [
    'approval.md', 'd2b-observation-approval.md', 'd2b-observation-proposal.md',
    'm04-centered-composer-proposal.md', 'm04-proposal.md',
    'm05-task-screen-approval.md', 'm05-task-screen-proposal.md',
    'parallel-group-proposal.md', 'pending-launch-discovery.md', 'repository-picker.md', 'task-detail-and-workflow-approvals.md', 'workflow-first-save-name.md', 'workflow-questions.md',
    'run-top-bar.md', 'parallel-run-pane.md', 'orchestrator-steering-held.md', 'run-message-locks.md', 'task-composer-edge.md', 'selected-inspector-approvals.md', 'engine-and-runtime.md', 'harness-settings.md', 'menu-bar-and-notifications.md'
  ].sort());
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

test('selected inspector approval companions keep one expandable pane scroll and independent request decisions', () => {
  function matchingDivClose(html, openingIndex) {
    if (openingIndex < 0) return -1;
    const tags = /<\/?div\b[^>]*>/g;
    tags.lastIndex = openingIndex;
    let depth = 0;
    let match;
    while ((match = tags.exec(html))) {
      if (match[0].startsWith('</')) depth -= 1;
      else depth += 1;
      if (depth === 0) return match.index;
    }
    return -1;
  }

  const ids = ['inspector-approvals-single', 'inspector-approvals', 'inspector-approvals-expanded', 'inspector-approvals-settled', 'inspector-approvals-steering'];
  const routes = ids.flatMap(id => [
    `workflow-run/${id}`,
    `workflow-run/${id}-minimum`
  ]);
  assert.equal(routes.length, 10);

  for (const route of routes) {
    const descriptor = HFV2.describe(route);
    assert.equal(descriptor.status, 'provisional', route);
    const html = HFV2.templates[descriptor.templateKey];
    assert.ok(html.includes('hd-inspector-approvals-fixture'), `${route} is scoped`);
    assert.equal((html.match(/class="hd-scroll"/g) || []).length, 1, `${route} has one pane scroll`);
    assert.equal((html.match(/class="hd-composer"/g) || []).length, route.includes('-single') ? 0 : 1, `${route} has only the eligible composer`);
    assert.equal((html.match(/style="flex:none;padding:var\(--space-3\);border-top:1px solid var\(--border\);"/g) || []).length, route.includes('-single') ? 0 : 1, `${route} has one anchored footer`);
    if (route.includes('-steering')) {
      assert.ok(!html.includes('id="msg-node"'), `${route} excludes the separate task composer`);
      assert.ok(html.includes('id="msg-orchestrator"'), `${route} retains the root reply composer`);
    } else if (!route.includes('-single')) {
      assert.ok(html.includes('id="msg-node"'), `${route} retains the selected task composer`);
    }
    const taskSection = html.split('<section class="hd-root-approvals" aria-label="Task approval requests">')[1]?.split('</section>')[0];
    assert.ok(taskSection, `${route} has a task request group`);
    const taskCards = [...taskSection.matchAll(/<details class="hd-approval hd-root-approval[^>]*>/g)];
    assert.equal(taskCards.length, route.includes('-single') ? 1 : 5, `${route} retains every task request`);
    const taskRows = [...taskSection.matchAll(/(<details class="hd-approval hd-root-approval[^>]*>)([\s\S]*?)<\/details>/g)];
    const openTaskNames = taskRows.filter(([, opening]) => /\sopen>/.test(opening)).map(([, , card]) => /<strong>([^<]+)<\/strong>/.exec(card)?.[1]);
    assert.deepEqual(openTaskNames, route.includes('-expanded')
      ? ['Run verification', 'Inspect packages', 'Check reports', 'Run final check']
      : ['Run verification'], `${route} has the expected independently expanded task cards`);
    if (!route.includes('-settled')) assert.ok(taskSection.includes('Approve once') && taskSection.includes('Reject'), `${route} shows request decisions`);
    assert.ok(html.includes('aria-label="Task approval requests"'), `${route} names task requests`);
    if (route.includes('-minimum')) assert.equal(descriptor.state.specimenSize, '1000 × 620', route);
    assert.ok(!html.includes('Send now'), `${route} hides Send now while the draft is blank`);
    if (route.includes('-steering')) {
      const runStart = html.indexOf('<section class="hd-root-approvals" aria-label="Run-scoped worker approval requests">');
      const dismiss = html.indexOf('>Dismiss</button>');
      const reply = html.indexOf('Reply to the orchestrator');
      const heading = html.indexOf('>Orchestrator</h3>');
      assert.ok(taskSection && heading > html.indexOf('aria-label="Task approval requests"'), `${route} places Orchestrator after task approvals`);
      assert.ok(runStart > heading && dismiss > runStart && reply > dismiss, `${route} orders run approvals, Dismiss and root reply`);
      const runSection = html.slice(runStart).split('</section>')[0];
      const runRows = [...runSection.matchAll(/(<details class="hd-approval hd-root-approval[^>]*>)([\s\S]*?)<\/details>/g)];
      assert.equal(runRows.length, 2, `${route} has two run-scoped requests`);
      assert.deepEqual(runRows.filter(([, opening]) => /\sopen>/.test(opening)).map(([, , card]) => /<strong>([^<]+)<\/strong>/.exec(card)?.[1]),
        ['Install dependencies', 'Run migration check'], `${route} expands the expected run-scoped requests`);
    }
    if (route.includes('-settled')) {
      assert.ok(html.includes('hd-approval--settled'), `${route} draws a settled request`);
      const firstCard = taskCards[0][0] + taskSection.slice(taskCards[0].index + taskCards[0][0].length, taskSection.indexOf('</details>') + '</details>'.length);
      assert.ok(!firstCard.includes('data-inspector-decision'), `${route} settled card has no decision actions`);
    }
    if (!route.includes('-single') && !route.includes('-steering')) {
      const scroll = html.indexOf('<div class="hd-scroll"');
      const scrollClose = matchingDivClose(html, scroll);
      const bubble = html.indexOf('<div class="hd-msg-user hd-msgq hd-msgq--pending">', scroll);
      const bubbleClose = matchingDivClose(html, bubble);
      const footerOpen = html.indexOf('<div style="flex:none;padding:var(--space-3);border-top:1px solid var(--border);"><form class="hd-composer"');
      const composer = html.indexOf('<form class="hd-composer"');
      assert.ok(scroll >= 0 && bubble > scroll && bubbleClose > bubble, `${route} places the pending user message in the task content`);
      assert.match(html.slice(bubble, bubbleClose), /hd-msg-user hd-msgq hd-msgq--pending[\s\S]*?hd-msgq__caption">Queued/);
      assert.match(html.slice(bubble, bubbleClose), /hd-msgq__text">Check the lockfile too\./);
      assert.match(html.slice(bubble, bubbleClose), /aria-label="Cancel queued message"/);
      assert.ok(bubbleClose < scrollClose && html.slice(bubbleClose + '</div>'.length, scrollClose).trim() === '',
        `${route} places the unsent message last in the task scroll`);
      assert.ok(scrollClose < footerOpen && footerOpen < composer,
        `${route} keeps the composer in its fixed footer after the scroll`);
      assert.ok(!html.includes('Also check whether the lockfile pins a vulnerable transitive dependency.'),
        `${route} has no duplicate queued message`);
    }
  }

  const css = read(path.join(v2, 'styles', 'inspector-approvals.css'));
  const toolBodyRule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, selector]) =>
    selector.includes('.hd-inspector-approvals-fixture') && selector.includes('.hd-pane') && selector.includes('.hd-tool__body'));
  assert.ok(toolBodyRule, 'the tool body override stays scoped to the companion');
  const declarations = Object.fromEntries(toolBodyRule[2].split(';').map(item => item.trim()).filter(Boolean).map(item => {
    const separator = item.indexOf(':');
    return [item.slice(0, separator).trim(), item.slice(separator + 1).trim()];
  }));
  assert.equal(declarations['max-height'], 'none');
  assert.equal(declarations.overflow, 'visible');
  assert.equal(typeof HFV2.composerEdge.setup, 'function', 'the preview exposes the shared composer edge hook');
});

test('the route map lists every redraw with the route it replaces and the Events deep links', () => {
  const map = read(path.join(v2, 'docs', 'route-map.md'));
  assert.ok(map.includes('## Redraw routes') && map.includes('### Route grammar'));
  assert.ok(!map.includes('provisional-redraws-awaiting-owner-review') && !map.includes('Provisional redraw'));
  assert.ok(map.includes('decisions/README.md#centered-and-transcript-redraws'));
  assert.ok(map.includes('43 retired routes'));
  const redraws = [...COMPOSER_REDRAWS, ...SHELL_REDRAWS, ...TRANSCRIPT_REDRAWS, ['new-task/harness-menu', 'new-task/centered-harness-open']].map(([older, newer]) => ({ older, newer }));
  for (const { older, newer } of redraws) {
    const row = map.split('\n').find(line => line.startsWith(`| \`${newer}\` |`));
    assert.ok(row, `${newer} is listed`);
    assert.ok(row.includes(`\`${older}\``), `${newer} names ${older}`);
    if (HFV2.viewsOf(newer).includes('events')) assert.ok(row.includes(`\`#${newer}/events\``), `${newer} lists its Events deep link`);
    assert.ok(!(newer in HFV2.routeAliases) && !(newer in HFV2.routeRedirects), `${newer} is canonical, not an alias or a redirect`);
  }
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
    ['d2b-proposal.js', 'function controlsHtml', 'function requestHtml'],
    ['m05-proposal.js', 'var strip =', "host.querySelector('.hd-m05-catalog')"],
    ['transcript-screen.js', 'strip: function', 'beforeRender:']
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
  for (const name of ['m04-proposal.js', 'm05-proposal.js', 'd2b-proposal.js', 'transcript-screen.js', 'screens-transcript.js', 'catalog.js', 'screens-overview.js']) {
    for (const [, route] of stripComments(read_(name)).matchAll(/#([a-z0-9-]+\/[a-z0-9-]+(?:\/(?:light|dark|system))?)(?=['"\s>)\\]|$)/g)) {
      found += 1;
      checkHash('#' + route, name);
    }
  }
  assert.ok(found >= 3, 'the renderers build route links from literals');
  assert.ok(!/sidebarForState|\bmount\b/.test(read_('d2b-proposal.js').replace(/^\s*\/\/.*$/gm, '')), 'the unreachable activity mount and its sidebar builder are gone');
  for (const d of descriptors.filter(x => x.renderer === 'transcript')) assert.equal(HFV2.routeFor('transcript', d.mount), d.route, 'generated transcript links name a registered route');
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
  assert.ok(!/routeFor\('m04', '(composer-ready|composer-unknown|advanced|shell|shell-collapsed|shell-narrow|centered-shell|composer-[a-z]+|advanced-closed)'\)/.test(source), 'no strip builds a link to a retired mount');
  for (const mount of ['shell', 'centered-shell']) assert.ok(!mounts.includes(mount), `no strip lists the retired mount ${mount}`);
  assert.ok(!/baselineLink|centeredLink/.test(source));
  const overviewMounts = read_('m05-proposal.js').match(/routeFor\('m05', '[a-z-]+'\)/g) || [];
  for (const call of overviewMounts) assert.ok(routeSet.has(HFV2.routeFor('m05', call.match(/'m05', '([a-z-]+)'/)[1])), call);
});

// ---- Approved redraws ----

const pending = HFV2.pendingRedraw;
const COMPOSER_REDRAWS = [
  ['new-task/composer-loading', 'new-task/centered-loading'], ['new-task/composer-unqualified', 'new-task/centered-unqualified'], ['new-task/composer-invalid', 'new-task/centered-invalid'],
  ['new-task/composer-starting', 'new-task/centered-starting-plain'], ['new-task/composer-refused', 'new-task/centered-refused'], ['new-task/options-closed', 'new-task/centered-options-closed']
];
const SHELL_REDRAWS = [['sidebar/collapsed', 'sidebar/centered-collapsed'], ['sidebar/minimum', 'sidebar/centered-minimum']];
const TRANSCRIPT_REDRAWS = ['observed', 'loading', 'partial', 'unavailable', 'integrity-failed', 'reconnecting', 'capacity', 'sources'].map(name => [`task/activity-${name}`, `task/transcript-${name}`]);
const overviewHas = pair => { const o = HFV2.templates['overview/areas']; return o.includes(`<a href="#${pair.older}">`) && o.includes(`<a href="#${pair.newer}">`); };
const stateOfRoute = route => { const [f, s] = route.split('/'); return [HFV2.findFamily(f), HFV2.findState(HFV2.findFamily(f), s)]; };
const DECISION = { 'new-task': 'Centered composer', sidebar: 'Sidebar', task: 'Task transcript' };

const PENDING_PAIRS = [
  { older: 'parallel-group/loading', newer: 'parallel-group/loading-known-title' },
  { older: 'parallel-group/loading-minimum', newer: 'parallel-group/loading-known-title-minimum' },
  { older: 'parallel-group/loading-two', newer: 'parallel-group/loading-two-known-title' }
];
// The drafts the owner approved on 2026-11-15, with the decision name of each approval line.
const APPROVED_1115 = [
  ...['queued', 'delivering', 'delivered', 'cancelled', 'send-now-refused', 'uncertain', 'unsupported', 'queued-settled'].map(id => [`task/message-${id}`, 'Queued messages and approval states']),
  ...['exact', 'stale', 'expired', 'answered-elsewhere', 'refused', 'uncertain'].map(id => [`task/approval-${id}`, 'Queued messages and approval states']),
  ...['approval-stale', 'approval-expired', 'answered-elsewhere', 'checkpoint-stale'].map(id => [`needs-you/${id}`, 'Queued messages and approval states']),
  ...['busy-approve-once', 'busy-approve-once-minimum', 'approval-stale', 'answered-elsewhere'].map(id => [`menu-bar/${id}`, 'Queued messages and approval states']),
  ['workflow-run/lane-message-undeliverable', 'Queued messages and approval states'],
  ['workflow-run/lane-message-undeliverable-minimum', 'Queued messages and approval states'],
  ['harness-runtime/updating', 'Runtime update'],
  ['new-task/centered-model-default', 'Model picker']
];
const STILL_PROVISIONAL = ['task/loading-known-title', 'task/loading-pane-known-title', ...PENDING_PAIRS.map(pair => pair.newer)];
test('three redraws are pending, the workflow name and parallel group loading titles, and the drafts approved on 2026-11-15 are approved with their own approval', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(pending)), PENDING_PAIRS);
  assert.ok(!routeSet.has('new-task/centered-starting'), 'the earlier starting state is retired');
  assert.equal(stateOfRoute('new-task/centered-starting-plain')[1].status, 'approved');
  assert.equal(HFV2.describe('new-task/centered-starting-plain').approval, 'Approved by the owner on 2026-11-09 · Starting row');
  assert.equal(APPROVED_1115.length, 8 + 6 + 4 + 4 + 2 + 2);
  for (const [route, decision] of APPROVED_1115) {
    const [, state] = stateOfRoute(route);
    assert.ok(state, `${route} is registered`);
    assert.equal(state.status, 'approved', `${route} is approved`);
    assert.deepEqual({ ...state.approval }, { by: 'the owner', date: '2026-11-15', decision }, `${route} approval`);
    assert.equal(state.approvalNote, undefined, `${route} carries no approval note`);
    assert.equal(HFV2.describe(route).approval, `Approved by the owner on 2026-11-15 · ${decision}`);
    assert.ok(!/Provisional|provisional|not approved|redraw/i.test(state.title + ' ' + state.description), `${route} title and description carry no history`);
    assert.ok(!pending.some(pair => pair.older === route || pair.newer === route), `${route} has no pending pair`);
    const guide = HFV2.componentDocs[HFV2.describe(route).guideKey];
    if (guide) assert.ok(!/Provisional|not approved/.test(guide), `${route} guide is no longer provisional`);
  }
  // The states that stay provisional: the known-title loading states and their three pending pairs.
  for (const route of STILL_PROVISIONAL) {
    assert.equal(stateOfRoute(route)[1].status, 'provisional', `${route} stays provisional`);
    assert.equal(stateOfRoute(route)[1].approval, undefined, `${route} carries no approval object`);
    assert.equal(HFV2.describe(route).approval, 'Provisional · not approved');
  }
  assert.ok(!routeSet.has('harness-runtime/installing-sidebar'), 'the sidebar card draft is retired');
  assert.equal(stateOfRoute('harness-runtime/installing')[1].status, 'approved');
  assert.ok(!pending.some(pair => pair.older === 'harness-runtime/installing' || pair.newer === 'harness-runtime/installing'), 'harness-runtime/installing has no pending pair');
  // Owner decision 2026-11-23 (O2): first run keeps the runtime pane, so the setup checklist is retired.
  assert.ok(!routeSet.has('app-states/setup'), 'app-states/setup is retired');
  assert.equal(HFV2.routeRedirects['app-states/setup'], 'harness-runtime/install-required', 'app-states/setup opens the first-run runtime pane');
  assert.equal(HFV2.resolveRoute('#app-states/setup/dark'), '#harness-runtime/install-required/dark');
  assert.ok(read(path.join(v2, 'docs', 'decisions', 'README.md')).includes('| `app-states/setup` | `harness-runtime/install-required` |'), 'the retired designs table lists app-states/setup');
  assert.ok(routeSet.has('harness-runtime/install-required'), 'the replacement is a live state');
  for (const pair of PENDING_PAIRS) {
    for (const route of [pair.older, pair.newer]) assert.ok(routeSet.has(route), `${route} stays listed`);
    assert.equal(stateOfRoute(pair.older)[1].status, 'approved', `${pair.older} keeps its approval`);
    assert.ok(overviewHas(pair), `the overview lists ${pair.newer}`);
  }
  // The minimum state of the menu bar derives from the full one, and the loading states mirror it.
  assert.deepEqual(JSON.parse(JSON.stringify(stateOfRoute('menu-bar/busy-approve-once-minimum')[1].minimum)), { of: 'menu-bar/busy-approve-once', fixes: ['popover'] });
  assert.ok(!routeSet.has('menu-bar/busy-minimum'), 'the earlier minimum state is retired');
  const catalog = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.match(catalog, /var PENDING = 'Earlier layout; redraw awaiting owner approval';/);
  assert.match(catalog, /pendingRedrawOf/);
  assert.match(catalog, /redrawsOf/);
  const page = read(path.join(v2, 'index.html'));
  assert.ok(page.indexOf('id="hdc-note"') > page.indexOf('id="hdc-approval"') && page.indexOf('id="hdc-note"') < page.indexOf('id="hdc-specimen"'), 'the note sits beside the approval line, outside the specimen');
  assert.match(read_('screens-overview.js'), /Redraws awaiting approval/);
  const overview = HFV2.templates['overview/areas'];
  assert.ok(overview.includes('Redraws awaiting approval') && !overview.includes('<a href="#task/approval">') && !overview.includes('<a href="#menu-bar/busy">'), 'the overview lists only the pending redraws');
  assert.equal((overview.match(/Redraws awaiting approval/g) || []).length, 1);
  // Nothing else is waiting: the approved redraws are retired pairs, not pending ones.
  for (const pair of pending) assert.ok(!(pair.older in HFV2.routeRedirects) && !(pair.newer in HFV2.routeRedirects));
  // The base templates of the three retired routes stay: the approval states are derived from them.
  assert.equal(typeof HFV2.templates['task/approval'], 'string');
  assert.equal(typeof HFV2.templates['menu-bar/busy'], 'string');
});

test('the 16 redraws are approved by the owner on 2026-11-08, the starting state on 2026-11-09 and the Model field of the open harness picker on 2026-11-15, with the decision of their screen', () => {
  const redraws = [...COMPOSER_REDRAWS, ...SHELL_REDRAWS, ...TRANSCRIPT_REDRAWS].map(pair => pair[1]).concat('new-task/centered-harness-open');
  assert.equal(redraws.length, 17);
  for (const route of redraws) {
    assert.ok(routeSet.has(route), `${route} is registered`);
    const [family, state] = stateOfRoute(route);
    assert.equal(state.status, 'approved');
    const decision = route === 'new-task/centered-starting-plain' ? 'Starting row' : route === 'new-task/centered-harness-open' ? 'Centered composer · Model field' : DECISION[family.id];
    const date = route === 'new-task/centered-starting-plain' ? '2026-11-09' : route === 'new-task/centered-harness-open' ? '2026-11-15' : '2026-11-08';
    assert.deepEqual({ ...state.approval }, { by: 'the owner', date, decision }, `${route} approval`);
    assert.equal(HFV2.describe(route).approval, `Approved by the owner on ${date} · ${decision}`);
    assert.equal(state.redrawOf, undefined);
    assert.equal(state.approvalNote, undefined);
    assert.ok(!/earlier layout|Provisional|provisional|redraw of/i.test(state.description), `${route} description names no earlier layout`);
    assert.ok(!(route in redirects) && !(route in aliases));
    const d = HFV2.describe(route);
    if (family.id === 'task') {
      assert.equal(d.renderer, 'transcript');
      const guide = HFV2.componentDocs[d.guideKey];
      assert.ok(!/Provisional|not approved|stays listed|earlier layout/i.test(guide), `${route} guide is no longer provisional`);
      assert.ok(guide.includes('Approved by the owner, 2026-11-08') && guide.includes(`href="#${route}/events"`), `${route} guide states the approval and links Events open`);
    } else {
      assert.equal(d.renderer, 'm04');
      assert.match(HFV2.templates[d.templateKey], /hd-m04-amendment/, 'drawn in the centered layout');
    }
  }
  for (const [older, newer] of [...COMPOSER_REDRAWS, ...SHELL_REDRAWS, ...TRANSCRIPT_REDRAWS]) {
    assert.ok(!routeSet.has(older), `${older} is retired`);
    assert.equal(redirects[older], newer);
  }
  assert.equal(HFV2.findState(HFV2.findFamily('sidebar'), 'centered-collapsed').group, 'Layout');
  for (const [, newer] of TRANSCRIPT_REDRAWS) assert.equal(stateOfRoute(newer)[1].group, 'Transcript');
});

test('18 states are retired by the redraws and 20 redirects point at the redraws, in one hop with suffix and view kept', () => {
  const expected = {
    ...Object.fromEntries([...COMPOSER_REDRAWS, ...SHELL_REDRAWS, ...TRANSCRIPT_REDRAWS]),
    'sidebar/expanded': 'new-task/centered-empty',
    'sidebar/centered-expanded': 'new-task/centered-empty',
    'new-task/sidebar-collapsed': 'sidebar/centered-collapsed',
    'new-task/harness-menu': 'new-task/centered-harness-open'
  };
  assert.equal(Object.keys(expected).length, 20);
  for (const [from, to] of Object.entries(expected)) {
    assert.equal(redirects[from], to, from);
    assert.ok(routeSet.has(to) && !(to in redirects), `${to} is a live state`);
    for (const suffix of SUFFIXES) assert.equal(HFV2.resolveRoute(`#${from}${suffix}`), `#${to}${suffix}`, `${from}${suffix}`);
  }
  // The starting state drawn with the status row was retired on 2026-11-09 and opens its replacement in one hop.
  const startingRetired = retired.find(e => e.route === 'new-task/centered-starting');
  assert.equal(startingRetired.redirect, 'new-task/centered-starting-plain');
  assert.equal(startingRetired.basis, 'Owner decision 2026-11-09: no status row under the composer while starting');
  assert.equal(startingRetired.pins, 'new-task/centered-starting at d82b59f (mount centered-starting)');
  assert.ok(startingRetired.renderer === 'm04' && startingRetired.mount === 'centered-starting', 'it keeps its renderer and mount for the link fallback');
  assert.equal(HFV2.routeFor('m04', 'centered-starting'), 'new-task/centered-starting');
  for (const suffix of SUFFIXES) assert.equal(HFV2.resolveRoute(`#new-task/centered-starting${suffix}`), `#new-task/centered-starting-plain${suffix}`);
  const redrawRetired = retired.filter(e => e.pins && e.pins.includes('3f12d29'));
  assert.equal(redrawRetired.length, 18);
  for (const entry of redrawRetired) {
    assert.equal(entry.basis, 'Owner answer 2026-11-08: redraws accepted');
    assert.match(entry.pins, /^[a-z0-9/-]+ at 3f12d29/);
    assert.ok(entry.renderer && entry.mount, `${entry.route} keeps its renderer and mount for the link fallback`);
  }
  // The runtime card draft was retired on 2026-11-14 for the main-pane update state, which the owner approved on 2026-11-15.
  const cardRetired = retired.find(e => e.route === 'harness-runtime/installing-sidebar');
  assert.equal(cardRetired.redirect, 'harness-runtime/updating');
  assert.equal(cardRetired.pins, 'harness-runtime/installing-sidebar at 4ff7d83 (mount runtime-installing-sidebar)');
  assert.ok(cardRetired.renderer === 'm04' && cardRetired.mount === 'runtime-installing-sidebar' && cardRetired.template === 'm04-proposal/runtime-installing-sidebar');
  assert.equal(HFV2.routeFor('m04', 'runtime-installing-sidebar'), 'harness-runtime/installing-sidebar');
  assert.equal(stateOfRoute('harness-runtime/updating')[1].status, 'approved', 'the redirect target is approved');
  assert.ok(!('m04-proposal/runtime-installing-sidebar' in HFV2.templates), 'the retired draft keeps no template');
  for (const suffix of SUFFIXES) assert.equal(HFV2.resolveRoute(`#harness-runtime/installing-sidebar${suffix}`), `#harness-runtime/updating${suffix}`);
  for (const entry of retired.filter(e => !(e.pins || '').includes('3f12d29') && !(e.pins || '').includes('854caae') && !(e.pins || '').includes('d82b59f') && !(e.pins || '').includes('4ff7d83') && !(e.pins || '').includes('9709483') && !(e.pins || '').includes('eadd22d') && !(e.pins || '').includes('3101abe') && !(e.pins || '').includes('be78fa4'))) assert.ok(/at 17739e4/.test(entry.pins), `${entry.route} keeps its generated pins`);
  const statisticsPeriodRetired = retired.find(e => e.route === 'statistics/all-time');
  assert.equal(statisticsPeriodRetired.redirect, 'statistics/overview');
  assert.equal(statisticsPeriodRetired.basis, 'Owner decision 2026-11-21: Statistics offers only 7 days and 30 days, with 30 days selected by default');
  assert.equal(statisticsPeriodRetired.pins, 'statistics/all-time at 3101abe');
  // The exact-action approval and the two menu bar relabels replaced approved drawings on 2026-11-15. The old designs are visible at 9709483.
  const approvalRetired = [
    ['task/approval', 'task/approval-exact', 'task/approval'],
    ['menu-bar/busy', 'menu-bar/busy-approve-once', 'menu-bar/busy'],
    ['menu-bar/busy-minimum', 'menu-bar/busy-approve-once-minimum', 'menu-bar/busy']
  ];
  assert.deepEqual(Array.from(retired.filter(e => (e.pins || '').includes('9709483'), []), e => e.route), approvalRetired.map(r => r[0]));
  for (const [route, target, template] of approvalRetired) {
    const entry = retired.find(e => e.route === route);
    assert.equal(entry.redirect, target);
    assert.equal(entry.template, template);
    assert.equal(entry.pins, `${route} at 9709483`);
    assert.match(entry.basis, /^Owner decision 2026-11-15: /);
    assert.equal(entry.renderer, null);
    assert.equal(stateOfRoute(route)[1], null, `${route} is not registered`);
    assert.equal(stateOfRoute(target)[1].status, 'approved', `${target} is approved`);
    assert.ok(!(target in redirects), `${target} is not itself retired`);
    for (const suffix of SUFFIXES) assert.equal(HFV2.resolveRoute(`#${route}${suffix}`), `#${target}${suffix}`);
  }
  // The templates stay: the approval states and the loading mirror clone them.
  assert.ok(HFV2.templates['task/approval'].includes('Approve for this task') && HFV2.templates['menu-bar/busy'].includes('>Approve</button>'));
  assert.ok(!HFV2.templates['task/approval-exact'].includes('Approve for this task'));
  assert.ok(HFV2.describe('menu-bar/loading').skeleton.of === 'menu-bar/busy-approve-once');
  assert.ok(HFV2.describe('menu-bar/loading-minimum').minimum.of === 'menu-bar/busy-approve-once');
  const sidebarLoading = retired.filter(e => (e.pins || '').includes('854caae'));
  assert.deepEqual(JSON.parse(JSON.stringify(sidebarLoading.map(e => [e.route, e.redirect, e.mount]))), [['sidebar/history-loading', 'sidebar/loading', 'history-loading']]);
  assert.equal(sidebarLoading[0].pins, 'sidebar/history-loading at 854caae (mount history-loading)');
  // An alias followed by a redirect is still one resolution.
  assert.equal(HFV2.resolveRoute('#m04-proposal/shell/dark'), '#new-task/centered-empty/dark');
  assert.equal(HFV2.resolveRoute('#m04-proposal/shell-collapsed'), '#sidebar/centered-collapsed');
  assert.equal(HFV2.resolveRoute('#m04-proposal/advanced-closed/light'), '#new-task/centered-options-closed/light');
  for (const [, now] of TRANSCRIPT_REDRAWS) assert.ok(HFV2.viewsOf(now).includes('events'));
});

test('the open harness picker is registered after the one-line ready state with the existing fixtures and no new copy', () => {
  const family = HFV2.findFamily('new-task');
  const ids = family.states.map(state => state.id);
  assert.equal(ids.indexOf('centered-harness-open'), ids.indexOf('centered-ready') + 1);
  const state = HFV2.findState(family, 'centered-harness-open');
  assert.equal(state.group, 'Composer');
  assert.equal(state.title, 'Centered composer · Harness picker open');
  const model = HFV2.m04Proposal.model;
  const open = model.create('centered-harness-open'), ready = model.create('amendment-ready');
  assert.equal(open.picker, 'harness');
  assert.equal(open.draft, ready.draft);
  assert.equal(open.repository, ready.repository);
  assert.equal(open.harness, 'Unavailable harness');
  assert.equal(open.qualification, 'unqualified');
  assert.equal(model.problem(open), 'Choose a qualified harness and model.', 'the existing message gives the explanation');
  assert.equal(model.isAmendment('centered-harness-open'), true);
  assert.equal(model.create('centered-ready'.replace('centered', 'amendment')).picker, '', 'other states keep their pickers closed');
  assert.equal(HFV2.routeFor('m04', 'centered-harness-open'), 'new-task/centered-harness-open');
  const source = read_('m04-proposal.js');
  assert.ok(!/key === 'Escape'|Escape.*picker|picker.*Escape/.test(source.replace(/function keydown[^\n]*/, '')), 'no custom Escape handler for the picker');
  assert.match(source, /data-m04-picker/, 'only this route marks its picker');
});

test('redraw strips carry the approval and none of the provisional wording', () => {
  const strips = HFV2.catalogStrips.m04;
  assert.equal(strips.redrawHeading, 'Approved · Centered composer · Owner 2026-11-08');
  assert.equal(strips.redrawShellHeading, 'Approved · Sidebar · Owner 2026-11-08');
  assert.match(strips.redrawNotice, /^Approved by the owner, 2026-11-08\./);
  assert.equal(strips.redrawStartingHeading, 'Approved · Starting row · Owner 2026-11-09');
  assert.match(strips.redrawStartingNotice, /^Approved by the owner, 2026-11-09\./);
  assert.equal(HFV2.catalogStrips.transcript.approved, 'Approved · owner 2026-11-08');
  for (const key of Object.keys(strips)) assert.ok(!/provisional/i.test(key), `no provisional key ${key}`);
  for (const text of [...Object.values(strips), ...Object.values(HFV2.catalogStrips.transcript)]) assert.ok(!/Provisional|needs owner approval|Centered redraw of the earlier/.test(text), text);
  assert.ok(!/centered-shell'\)===0 \? strips\.provisional/.test(read_('m04-proposal.js')));
  assert.ok(!('provisional' in HFV2.catalogStrips.transcript));
  assert.ok(!('d2b' in HFV2.catalogStrips));
  const m04source = read_('m04-proposal.js');
  assert.equal(strips.redrawHarnessHeading, 'Approved · Centered composer · Owner 2026-11-08 · Model field 2026-11-15');
  assert.match(strips.redrawHarnessNotice, /^Approved by the owner, 2026-11-08; the Model field .* 2026-11-15\./);
  assert.equal(strips.modelHeading, 'Approved · Model picker · Owner 2026-11-15');
  assert.match(strips.modelNotice, /^Approved by the owner, 2026-11-15\./);
  assert.match(m04source, /isRedraw\(route\) \? \(route\.indexOf\('centered-shell'\)===0 \? strips\.redrawShellHeading : route==='centered-starting-plain' \? strips\.redrawStartingHeading : route==='centered-harness-open' \? strips\.redrawHarnessHeading : strips\.redrawHeading\)/);
  assert.match(m04source, /route==='centered-starting-plain' \? strips\.redrawStartingNotice : route==='centered-harness-open' \? strips\.redrawHarnessNotice : strips\.redrawNotice/);
  assert.match(m04source, /isModelApproved\(route\) \? strips\.modelHeading/);
});

test('the decisions record lists every redraw with its earlier state, the owner items and the Events deep links', () => {
  const decisions = read(path.join(v2, 'docs', 'decisions', 'README.md'));
  const proposal = read(path.join(v2, 'docs', 'decisions', 'm05-task-screen-proposal.md')).split('\n');
  assert.match(proposal[167], /^Events holds the approved D2B content below collapsed facts groups/, 'line 168 is the sentence the redraws cite');
  assert.ok(decisions.includes('`v2/docs/decisions/m05-task-screen-proposal.md:168`'));
  assert.match(decisions, /^## Centered and transcript redraws$/m);
  assert.ok(!decisions.includes('Provisional redraws awaiting owner review') && decisions.split('provisional-redraws-awaiting-owner-review').length === 2, 'only the explicit anchor remains');
  const section = decisions.slice(decisions.indexOf('## Centered and transcript redraws'), decisions.indexOf('## By screen'));
  for (const [older, newer] of [...COMPOSER_REDRAWS, ...SHELL_REDRAWS, ...TRANSCRIPT_REDRAWS]) {
    const row = section.split('\n').find(line => line.startsWith(`| \`${newer}\` |`));
    assert.ok(row, `${newer} has a row`);
    const cells = row.split('|').map(cell => cell.trim());
    assert.equal(cells[2], `\`${older}\``, `${newer} names its source`);
    assert.ok(cells[3].length > 1 && cells[4].length > 1, `${newer} gives a basis and a question`);
  }
  for (const [, newer] of TRANSCRIPT_REDRAWS) assert.ok(section.includes(`\`#${newer}/events\``), `${newer} lists its Events deep link`);
  assert.ok(section.includes('It is a state of the route, not a separate route'));
  assert.ok(section.includes('Yes, accept all') && section.includes('relayed by the coordinator'));
  assert.ok(section.includes('option (a)') && section.includes('Choose a qualified harness and model.'), 'the content basis of the open picker is recorded');
  assert.ok(section.includes('`sidebar/centered-expanded`') && section.includes('duplicate'));
  assert.ok(section.includes('Copy record') && section.includes('Record ordering'), 'the four Events elements are recorded as approved');
  assert.ok(decisions.includes('| Centered and transcript redraws |'));
  assert.ok(decisions.includes('<a id="provisional-redraws-awaiting-owner-review"></a>'), 'the earlier anchor of the renamed section keeps working');
  for (const link of decisions.matchAll(/\(#([a-z0-9-]+)\)/g)) {
    const anchor = link[1];
    assert.ok(decisions.split('\n').some(line => /^#{1,6} /.test(line) && line.replace(/^#+ /, '').toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-') === anchor), `${anchor} resolves to a heading`);
  }
});

test('the decisions record approves the starting row, retires the runtime card draft and approves the runtime update', () => {
  const decisions = read(path.join(v2, 'docs', 'decisions', 'README.md'));
  const row = decisions.split('\n').find(line => line.startsWith('| Starting row |'));
  assert.ok(row && row.includes('| Approved |') && row.includes('2026-11-09') && row.includes('`new-task/centered-starting-plain`'));
  const card = decisions.split('\n').find(line => line.startsWith('| Runtime card in the sidebar'));
  assert.ok(card && card.includes('Dropped by the owner, 2026-11-14') && card.includes('`harness-runtime/installing-sidebar`') && card.includes('`harness-runtime/updating`'));
  const update = decisions.split('\n').find(line => line.startsWith('| Runtime update in the main pane'));
  assert.ok(update && update.includes('| Approved |') && update.includes('`harness-runtime/updating`') && update.includes('2026-11-15') && update.includes('Approve the provisional drafts of 2026-11-15'));
  assert.ok(!update.includes('Provisional, not approved'));
  assert.ok(!decisions.includes('starting-row-and-runtime-card-provisional') && decisions.includes('## Starting row and runtime card\n'));
  assert.ok(decisions.includes('| `new-task/centered-starting` | `new-task/centered-starting-plain` |'), 'the retirement is recorded');
  assert.equal(HFV2.describe('harness-runtime/updating').approval, 'Approved by the owner on 2026-11-15 · Runtime update');
  assert.ok(decisions.includes('| `harness-runtime/installing-sidebar` | `harness-runtime/updating` |'), 'the retirement is recorded in the retired designs table');
  assert.ok(!decisions.includes('The first redirect to a provisional state'));
  for (const route of ['task/approval', 'menu-bar/busy', 'menu-bar/busy-minimum']) assert.ok(decisions.includes(`| \`${route}\` | \`${HFV2.routeRedirects[route]}\` |`), `${route} is recorded in the retired designs table`);
  const queued = decisions.split('\n').find(line => line.startsWith('| Queued messages and approval states |'));
  assert.ok(queued && queued.includes('| Approved |') && queued.includes('2026-11-15') && queued.includes('Approve the provisional drafts of 2026-11-15'));
  const model = decisions.split('\n').find(line => line.startsWith('| Model picker states, the default tag'));
  assert.ok(model && model.includes('| Approved |') && !model.includes('(provisional)') && !model.includes('provisional `new-task/centered-model-default`'));
  assert.ok(decisions.includes('## Approval of the provisional drafts of 2026-11-15') && decisions.includes('<a id="queued-messages-and-approval-states-provisional"></a>'));
  assert.ok(decisions.includes('## Queued messages and approval states\n'));
});

test('a redirect target is never retired by a later sign-off without repointing the redirect', () => {
  // Rule for a redraw sign-off: when an older state that is already a redirect target is retired, its
  // redirect is repointed to the redraw. No redirect key may be a target, so none chains.
  const targets = new Set(Object.values(redirects));
  for (const key of Object.keys(redirects)) assert.ok(!targets.has(key), `${key} is both a redirect key and a target`);
  for (const { older } of pending) assert.ok(!(older in redirects));
});

// ---- Route grammar: #family/state[/view][/appearance] ----

test('route hashes parse into family, state, view and appearance', () => {
  const parse = hash => HFV2.parseRoute(hash);
  assert.deepEqual({ ...parse('#task/transcript-observed') }, { family: 'task', state: 'transcript-observed', view: null, appearance: null });
  for (const appearance of ['light', 'dark', 'system']) {
    assert.deepEqual({ ...parse(`#task/transcript-observed/${appearance}`) }, { family: 'task', state: 'transcript-observed', view: null, appearance });
    assert.deepEqual({ ...parse(`#task/transcript-observed/events/${appearance}`) }, { family: 'task', state: 'transcript-observed', view: 'events', appearance });
  }
  assert.deepEqual({ ...parse('#task/transcript-observed/events') }, { family: 'task', state: 'transcript-observed', view: 'events', appearance: null });
  assert.deepEqual({ ...parse('#task/transcript-observed/other') }, { family: 'task', state: 'transcript-observed', view: 'other', appearance: null });
  for (const bad of ['', '#', '#task', '#task/', '#task/x/y/z', '#task/x/events/sepia', '#task/x/a/b/c', '#Task/x', '#task/x/events/']) assert.equal(parse(bad), null, `${bad} is not a route`);
  assert.deepEqual(Array.from(HFV2.viewsOf('task/transcript-observed')), ['events']);
  assert.deepEqual(Array.from(HFV2.viewsOf('task/activity-observed')), []);
  assert.deepEqual(Array.from(HFV2.viewsOf('nothing/here')), []);
});

test('a declared view is kept through aliases and redirects and an undeclared one is dropped', () => {
  const route = 'task/transcript-sources';
  for (const suffix of SUFFIXES) {
    assert.equal(HFV2.resolveRoute(`#${route}/events${suffix}`), `#${route}/events${suffix}`, 'a canonical route keeps its declared view');
    assert.equal(HFV2.resolveRoute(`#${route}${suffix}`), `#${route}${suffix}`);
    assert.equal(HFV2.resolveRoute(`#${route}/bogus${suffix}`), `#${route}${suffix}`, 'an unknown view is dropped');
    assert.equal(HFV2.resolveRoute(`#task/activity-sources/events${suffix}`), `#task/transcript-sources/events${suffix}`, 'a redirect keeps a view the replacement declares');
    assert.equal(HFV2.resolveRoute(`#d2b-proposal/events/events${suffix}`), `#task/transcript-sources/events${suffix}`, 'an alias then a redirect keeps it');
    assert.equal(HFV2.resolveRoute(`#task/activity-sources/changes${suffix}`), `#task/transcript-sources${suffix}`, 'an undeclared view is dropped at the final route');
    for (const [old, now] of TRANSCRIPT_REDRAWS) {
      assert.equal(HFV2.resolveRoute(`#${old}/events${suffix}`), `#${now}/events${suffix}`, `${old} keeps Events open`);
      assert.equal(HFV2.resolveRoute(`#${old}${suffix}`), `#${now}${suffix}`, `${old} opens with the pane closed`);
    }
    assert.equal(HFV2.resolveRoute(`#task/running/events${suffix}`), `#task/running-stop${suffix}`, 'a redirect drops it when its target declares none');
  }
  // A view survives an alias and a redirect whose final route declares it.
  const runtime = loadRuntime();
  runtime.routeAliases['probe-old/state'] = 'task/transcript-observed';
  runtime.routeRedirects['task/probe-retired'] = 'task/transcript-observed';
  runtime.routeAliases['probe-old/chain'] = 'task/probe-retired';
  for (const suffix of SUFFIXES) {
    assert.equal(runtime.resolveRoute(`#probe-old/state/events${suffix}`), `#task/transcript-observed/events${suffix}`, 'alias');
    assert.equal(runtime.resolveRoute(`#task/probe-retired/events${suffix}`), `#task/transcript-observed/events${suffix}`, 'redirect');
    assert.equal(runtime.resolveRoute(`#probe-old/chain/events${suffix}`), `#task/transcript-observed/events${suffix}`, 'alias then redirect');
    assert.equal(runtime.resolveRoute(`#probe-old/chain/events${suffix}`), runtime.resolveRoute(runtime.resolveRoute(`#probe-old/chain/events${suffix}`)), 'settled after one resolution');
  }
  // Every route of the registry: only the eight transcript routes declare a view.
  for (const key of keys) {
    const declared = HFV2.viewsOf(key);
    assert.equal(HFV2.resolveRoute(`#${key}/events`), declared.includes('events') ? `#${key}/events` : `#${key}`, key);
  }
  assert.deepEqual(Array.from(keys).filter(key => HFV2.viewsOf(key).length), TRANSCRIPT_REDRAWS.map(pair => pair[1]));
});

test('the catalog opens a declared view at load and canonicalises the address without falling back', () => {
  const source = read(path.join(v2, 'scripts', 'catalog.js'));
  assert.match(source, /HFV2\.parseRoute\(HFV2\.resolveRoute\(hash \|\| ''\)\)/);
  assert.match(source, /function hashFor\(family, state, override, view\)[\s\S]*?\(view \? '\/' \+ view : ''\)[\s\S]*?\(override \? '\/' \+ override : ''\)/, 'the view precedes the appearance');
  assert.match(source, /var options = \{ view: current\.view \};[\s\S]*?renderer\.mount\(els\.specimen, d\.mount, options\)/);
  assert.match(source, /go\(current\.family, current\.state, null, current\.view\)/, 'an appearance change keeps the view');
  const render = source.slice(source.indexOf('function render()'), source.indexOf('function setPreference'));
  assert.match(render, /hashFor\(parsed\.family, parsed\.state, parsed\.override, parsed\.view\)/);
  assert.equal(HFV2.describe('task/transcript-observed').views.length, 1);
  assert.deepEqual(Array.from(HFV2.describe('task/transcript-observed').views), ['events']);
  assert.deepEqual(Array.from(HFV2.describe('task/approval-exact').views), []);
});

// ---- The transcript renderer ----

test('the transcript renderer is registered and draws each activity fixture in the task screen frame', () => {
  const renderer = HFV2.RENDERERS.transcript;
  assert.ok(renderer && renderer.api === 'transcriptScreen' && renderer.wrapper.includes('hdc-specimen--m05'));
  assert.equal(typeof HFV2.transcriptScreen.mount, 'function');
  assert.deepEqual(Array.from(HFV2.transcriptRows, row => row.route), TRANSCRIPT_REDRAWS.map(pair => pair[1]));
  const composerOf = { observed: 'settled', loading: 'running', partial: 'settled', unavailable: 'settled', 'integrity-failed': 'settled', reconnecting: 'running', capacity: 'running', events: 'settled' };
  for (const row of HFV2.transcriptRows) {
    const d = HFV2.describe(row.route);
    assert.equal(HFV2.routeFor('transcript', row.mount), row.route);
    assert.equal(d.status, 'approved');
    assert.equal(d.family.id, 'task');
    // The run status of each source decides the composer, as the source's own fixture has it.
    const status = HFV2.d2bProposal.createState(row.mount).status;
    assert.equal(status === 'Running' ? 'running' : 'settled', composerOf[row.mount], `${row.mount} status ${status}`);
    // The retired activity state drew the same fixture, and its route opens this one.
    const earlier = TRANSCRIPT_REDRAWS.find(pair => pair[1] === row.route)[0];
    assert.equal(retiredByRoute.get(earlier).mount, row.mount);
    assert.equal(retiredByRoute.get(earlier).redirect, row.route);
    assert.ok(typeof HFV2.componentDocs[d.guideKey] === 'string' && HFV2.componentDocs[d.guideKey].includes('/events'), `${row.route} guide explains how to open Events`);
  }
  const source = read_('transcript-screen.js');
  assert.match(source, /H\.d2bProposal\.createState\(mountId\)/, 'each transcript route draws the fixture object of the activity state it replaced');
  assert.match(source, /disabledTabs: \['changes', 'artifacts'\]/);
  assert.match(source, /chips: ''/);
  assert.match(source, /menu: false/);
  assert.match(source, /tab: 'events'/);
  const css = read(path.join(v2, 'styles', 'transcript-screen.css'));
  assert.ok(!/\.hd-d2b\{min-width|min-width:1280px/.test(css), 'the minimum width of the activity frame is not extended');
  assert.match(css, /prefers-reduced-motion:reduce\)\{\.hd-tr-host \*/);
  assert.ok(read(path.join(v2, 'index.html')).includes('styles/transcript-screen.css'));
});

// ---- Task screen hooks ----

// The digest covers task screen markup in eight interface variants and both appearances. The 2026-11-10
// owner-approved continuation copy amendment intentionally changes two state specimens; the updated
// digest records that copy change while guarding all resulting markup against unintended drift. The owner's canonical
// task glyphs (2026-11-14) change the timed-out badge and sidebar glyph from a clock to the failed x. The owner's copy
// decision of 2026-11-15 changes the events-page-error retry wording; only that state's digests change.
test('the task screen markup of every existing state is unchanged by the optional hooks', () => {
  const m05 = HFV2.m05Proposal;
  assert.equal(typeof m05.screenHtml, 'function');
  const lines = [];
  for (const state of HFV2.m05ProposalStates) {
    if (state.spec.board || NEW_M05_MOUNTS.has(state.id)) continue;
    const base = m05.initialUi(state.spec);
    const variants = [base, { ...base, pane: true, tab: 'events' }, { ...base, pane: true, tab: 'changes' }, { ...base, pane: true, tab: 'artifacts' }, { ...base, frame: 'minimum' }, { ...base, frame: 'minimum', pane: true, tab: 'events' }, { ...base, menu: true }, { ...base, dialog: 'stop' }];
    variants.forEach((ui, i) => {
      for (const appearance of ['light', 'dark']) {
        lines.push(`${state.id}:${i}:${appearance}:` + crypto.createHash('sha256').update(m05.screenHtml(state.spec, ui, appearance, appearance)).digest('hex'));
        assert.equal(m05.screenHtml(state.spec, ui, appearance, appearance, {}), m05.screenHtml(state.spec, ui, appearance, appearance), `${state.id}: empty hooks change nothing`);
      }
    });
  }
  assert.equal(lines.length, 944);
  assert.equal(crypto.createHash('sha256').update(lines.join('\n')).digest('hex'), '7513aa777a569ad3cee81c3402be412de8fb717a1b2bd1570b53661b31177b44');
});

test('the Events page error retries the same earlier page with the app wording', () => {
  const renderer = read(path.join(v2, 'scripts', 'm05-proposal.js'));
  assert.match(renderer, /'Earlier records couldn\\'t be read', 'Records below stay\. Retrying reads the same earlier page again\.', btn\('Retry history read'\)/);
  assert.doesNotMatch(renderer, /Reload from newest|starts again from the newest page/);
});

test('continuation copy separates acceptance from completion and refusal reason', () => {
  const renderer = read(path.join(v2, 'scripts', 'm05-proposal.js'));
  const screens = read(path.join(v2, 'scripts', 'screens-m05-proposal.js'));
  assert.match(renderer, /continued: \['info', 'New session accepted', 'The engine accepted the request\. It may still be waiting for resources; acceptance does not mean completion\.'/);
  assert.match(renderer, /The engine refused this request\.<\/div><div class="hd-mono hd-m05-err">/);
  assert.doesNotMatch(renderer, /Nothing started\. The engine said:/);
  assert.match(screens, /\['state-continue-started', 'Status', 'Continue · request accepted', 'The engine accepted the request\. It may still be waiting for resources; acceptance does not mean completion\.'/);
  assert.match(screens, /\['state-continue-refused', 'Status', 'Continue · refused', 'A task with continuation history or auto-continue that was cancelled refuses Continue\. The engine refused this request; its reason is shown\.'/);
  assert.match(renderer, /btn\('Check for a new task'\)/);
});

test('the task screen hooks replace the transcript column, the Events body and the task identity', () => {
  const m05 = HFV2.m05Proposal;
  const spec = { badge: 'done', task: 'done', composer: 'settled', pane: true, tab: 'events' };
  const ui = { ...m05.initialUi(spec), pane: true, tab: 'events' };
  const plain = m05.screenHtml(spec, ui, 'light', 'light');
  const hooks = {
    transcriptSlot: () => '<p data-slot="transcript"></p>',
    eventsBody: () => '<p data-slot="events"></p>',
    identity: { title: 'Task title', meta: 'Harness · Repo', badge: ['hd-badge--done', '', 'Done'], chips: '', menu: false, sidebarTitle: 'Task title', href: '#task/probe', disabledTabs: ['changes', 'artifacts'] }
  };
  const html = m05.screenHtml(spec, ui, 'light', 'light', hooks);
  assert.ok(plain.includes('Original request') && plain.includes('hd-m05-more-anchor') && plain.includes('Can edit this repo'));
  assert.ok(html.includes('data-slot="transcript"') && html.includes('data-slot="events"'));
  assert.ok(!html.includes('Original request') && !html.includes('hd-m05-more-anchor') && !html.includes('Can edit this repo') && !html.includes('hd-m05-chip'));
  assert.ok(html.includes('>Task title</span>') && html.includes('Harness · Repo'));
  assert.match(html, /<a class="hd-task-row[^"]*is-active[^"]*" href="#task\/probe">/);
  for (const tab of ['Changes', 'Artifacts']) assert.match(html, new RegExp(`aria-selected="false" aria-disabled="true" class="hd-tab is-disabled">${tab}</button>`));
  assert.ok(!/data-m05="tab-(changes|artifacts)"/.test(html), 'a disabled tab has no action');
  assert.ok(html.includes('data-m05="tab-events"') && html.includes('data-m05="pane"'));
});


test('owner-approved pending launch discovery separates cancellation support from observation', () => {
  const states = HFV2.pendingLaunchStates;
  assert.equal(states.length, 21);
  for (const [id] of states) {
    const route = `task/pending-${id}`;
    assert.equal(HFV2.describe(route).status, 'approved', route);
    const approval = HFV2.describe(route).state.approval;
    assert.equal(approval.date, '2026-11-10');
    assert.equal(approval.reference, '83d820f57e6ec2d82cccd3a1e335128332fdb672');
    assert.match(HFV2.describe(route).approval, /Approved by the owner on 2026-11-10/);
    assert.doesNotMatch(HFV2.componentDocs[route], /Provisional|not approved/);
    const html = HFV2.templates[HFV2.describe(route).templateKey];
    assert.match(html, /textarea disabled/);
    assert.doesNotMatch(html, /Copy resume|Take over|Send now|Original request|Captured output/);
  }
  const html = id => HFV2.templates[HFV2.describe(`task/pending-${id}`).templateKey];
  for (const id of ['preparing-handshake', 'not-started', 'unavailable', 'missing', 'recorded', 'handoff-failed', 'stop-requested', 'stop-uncertain', 'stop-refused']) {
    assert.ok(!html(id).includes('href="#task/pending-stop-confirm"'), `${id} grants no Stop`);
  }
  assert.match(html('stop-confirm'), /task with this same ID may be stopped/);
  assert.match(html('stop-confirm'), /role="dialog" aria-modal="true"/);
  assert.match(html('stop-confirm'), /<aside inert/);
  assert.match(html('stop-confirm'), /<main inert/);
  for (const [id] of states) assert.doesNotMatch(html(id), /qualified|ordinary task record|launch mechanism|read bounds/);
  assert.match(html('stop-requested'), /does not confirm that the launch or task stopped/);
  assert.match(html('missing'), /Its outcome is unknown/);
  assert.match(html('granted'), /Harflow has not confirmed a running task yet/);
  assert.match(html('waiting-minimum'), /width:1000px;height:620px/);
  assert.match(html('waiting-minimum'), /href="#task\/pending-stop-confirm-minimum"/);
  assert.match(html('stop-confirm-minimum'), /width:1000px;height:620px/);
  assert.match(html('stop-confirm-minimum'), /href="#task\/pending-waiting-minimum"/);
  assert.match(html('stop-confirm-minimum'), /href="#task\/pending-stop-requested-minimum"/);
  assert.match(html('stop-requested-minimum'), /width:1000px;height:620px/);
  assert.match(html('stop-requested-minimum'), /href="#task\/pending-stop-requested-minimum"/);
  const controller = read(path.join(v2, 'scripts', 'screens-pending-launches.js'));
  assert.match(controller, /pending-stop-confirm-minimum'\) !== -1\) returnRoute = '#task\/pending-waiting-minimum'/);
  assert.match(controller, /event.key === 'Escape'[\s\S]*?restoreStop = true; links\[0\].click\(\)/);
  assert.match(controller, /if \(stop\) \{ restoreStop = false; stop.focus\(\)/);

  assert.match(html('granted'), /The engine granted this launch/);
  assert.doesNotMatch(html('granted'), /ready to start/);
  const loading = HFV2.describe('task/pending-loading');
  assert.equal(loading.skeleton.of, 'task/pending-inventory');
  assert.equal(loading.templateKey, 'task/pending-inventory');
  const skeleton = HFV2.skeletonSpecs[loading.skeleton.spec];
  assert.ok(skeleton.ops.some(op => op.sel === '.hd-task-row__title' && op.kind === 'text'));
  for (const selector of ['strong', 'small', 'code']) assert.ok(skeleton.ops.some(op => op.sel === `.hd-pending-inventory ${selector}` && op.kind === 'text'));
  assert.equal((html('loading').match(/<strong>/g) || []).length, 2, 'loading derives both inventory cards');

  assert.equal(HFV2.describe('task/pending').status, 'approved', 'earlier waiting-only approval preserved');
});


test('pending launches add one icon-led navigation item to sparse approved sidebar fixtures', () => {
  const extract = key => HFV2.templates[key].match(/<aside class="hd-(?:sidebar|rail)"[\s\S]*?<\/aside>/)[0];
  const base = extract('new-task/default').replace('hd-nav-item is-active', 'hd-nav-item');
  const rail = extract('new-task/sidebar-collapsed').replace('hd-rail-item is-active', 'hd-rail-item').replace('aria-label="2 running">2</span>', 'aria-label="1 running">1</span>');
  const section = (html, label) => html.match(new RegExp('<section class="hd-section[^\"]*" aria-label="' + label + '">[\\s\\S]*?<\\/section>'))[0];
  const rows = html => html.match(/<a class="hd-task-row[\s\S]*?<\/a>/g) || [];
  for (const [id] of HFV2.pendingLaunchStates) {
    const sidebar = HFV2.pendingLaunchSidebar(id, false);
    const nav = sidebar.match(/<a class="hd-nav-item is-active"[^>]*data-pending-nav>[\s\S]*?<\/a>/g) || [];
    assert.equal(nav.length, 1, `${id}: one selected pending nav parent`);
    assert.match(nav[0], /hd-i-clock/);
    assert.match(nav[0], /href="#task\/pending-inventory"/);
    assert.doesNotMatch(sidebar, /data-pending-section|hd-pending-selection|View pending launches/);
    let original = sidebar.replace(nav[0], '')
      .replace('<div class="hd-m04-sidebar-scroll"><nav class="hd-nav"', '<nav class="hd-nav"')
      .replace('</div><div class="hd-sidebar__foot">', '<div class="hd-sidebar__foot">');
    for (const [label, keep] of [['Running', 1], ['Recent work', 2]]) {
      const sourceSection = section(base, label), sparse = section(sidebar, label);
      assert.deepEqual(rows(sparse), rows(sourceSection).slice(0, keep), `${id}: retained ${label} rows are exact approved source`);
      assert.doesNotMatch(sparse, /hd-sidebar__more/);
      original = original.replace(sparse, sourceSection);
    }
    assert.equal(original, base, `${id}: all remaining shell bytes are approved source`);
    const collapsed = HFV2.pendingLaunchSidebar(id, true);
    const icon = collapsed.match(/<a class="hd-rail-item is-active"[^>]*data-pending-nav>[\s\S]*?<\/a>/)[0];
    assert.match(icon, /aria-label="Pending launches"/);
    assert.match(icon, /hd-i-clock/);
    assert.equal(collapsed.replace(icon, ''), rail, `${id}: canonical rail plus pending icon and accurate count`);
    assert.equal((sidebar.match(/<a class="hd-task-row/g) || []).length, 3, `${id}: sparse history budget`);
  }
  const tokens = read(path.join(v2, 'styles', 'tokens.css'));
  assert.match(tokens, /--row-height:\s*32px/);
  const css = read(path.join(v2, 'styles', 'pending-launches.css'));
  assert.doesNotMatch(css, /overflow[^;}]*hidden|scrollbar-width|::-webkit-scrollbar/);
  // Conservative fixture geometry: six 32px nav rows + padding, two 40px section heads,
  // three 32px history rows with gaps, plus 52px header + 56px footer stays below 620px.
  assert.ok(6 * 32 + 24 + 2 * 40 + 3 * 32 + 4 + 52 + 56 < 620);
});


test('pending discovery approval is pinned and does not broaden unrelated provisional states', () => {
  const record = read(path.join(v2, 'docs', 'decisions', 'pending-launch-discovery.md'));
  assert.match(record, /83d820f57e6ec2d82cccd3a1e335128332fdb672/);
  assert.match(record, /Yes, approve this design/);
  assert.match(record, /does not authorize truncating production history or disabling actual overflow/);
  for (const route of ['task/cancelled-partial', 'task/artifacts-empty', 'task/loading-known-title']) assert.equal(HFV2.describe(route).status, 'provisional', route);
});


test('owner-approved parallel-group lane states register, stay display-only and link only to registered routes', () => {
  const states = HFV2.parallelLaneStates;
  assert.equal(states.length, 25);
  const html = id => HFV2.templates['parallel-group/' + id];
  const withTemplate = states.filter(id => id !== 'loading-two');
  for (const id of states) {
    assert.ok(routeSet.has('parallel-group/' + id), `${id} is registered`);
    const d = HFV2.describe('parallel-group/' + id);
    assert.equal(d.status, 'approved', `${id} is approved`);
    assert.equal(d.state.approval.date, '2026-11-12', id);
    assert.equal(d.state.approval.reference, '2153ab1d963709d8fbe77cd0bfd678292202a863', id);
    assert.match(d.approval, /Approved by the owner on 2026-11-12/, id);
    assert.doesNotMatch(HFV2.componentDocs['parallel-group/' + id], /Not approved|draft for owner review/, id);
  }
  for (const id of ['lanes', 'loading', 'lanes-minimum', 'loading-minimum']) assert.equal(HFV2.describe('parallel-group/' + id).status, 'approved', `${id} stays approved`);

  // Copy and styling rules shared by every lane template.
  for (const id of withTemplate) {
    const t = html(id);
    assert.ok(t, `${id} has a template`);
    assert.doesNotMatch(t, /Send now/, id);
    assert.doesNotMatch(t, /(Done|Failed|Cancelled)[^<]*findings/i, `${id}: settled rows carry no findings count`);
    assert.doesNotMatch(t, /flex:\s*1 0 320px|min-width:\s*320px/, `${id}: no inline lane sizing`);
    assert.doesNotMatch(t, /#[0-9a-fA-F]{3,8}\b|rgba?\(/, `${id}: no colour literals`);
    assert.doesNotMatch(t, /Take over/, id);
    assert.equal((t.match(/placeholder="/g) || []).length, (t.match(/class="hd-lane"/g) || []).length, `${id}: one composer per lane`);
    const wrapped = /-minimum$/.test(id);
    if (wrapped) {
      assert.ok(t.startsWith('<div class="hdc-specimen--minimum" data-pl-min="sidebar,lanes,topbar-meta">'), `${id}: minimum wrapper`);
      assert.match(t, /height: 620px/, id);
    } else {
      assert.match(t, /height: 800px/, id);
      assert.doesNotMatch(t, /data-pl-min/, id);
    }
  }
  const titled = html('lanes-titled');
  for (const s of ['placeholder="Message Claude"', 'Send to Claude', 'placeholder="Message Codex"', 'placeholder="Message Opencode"',
    'Audit what the preload bridge exposes', 'Claude · Opus 5.5', 'Done · 04:51', 'Done · 04:12', 'data-pl-id="cancel-all"']) assert.ok(titled.includes(s), `lanes-titled: ${s}`);
  assert.ok(titled.includes('hd-pl-cap">Opencode<'), 'third lane caption is the harness only');
  assert.ok(!/Opencode ·/.test(titled), 'no model after Opencode');

  // Lane menu: Open task only.
  for (const id of ['lane-menu-open', 'lane-menu-open-minimum']) {
    const t = html(id);
    assert.equal((t.match(/role="menu"/g) || []).length, 1, id);
    const items = t.match(/role="menuitem"/g) || [];
    assert.equal(items.length, 1, `${id}: one menu item`);
    assert.match(t, /role="menuitem"[^>]*>[\s\S]*?Open task<\/span><\/a>/, id);
  }

  // Cancel all confirmation.
  for (const id of ['cancel-all-confirm', 'cancel-all-confirm-minimum']) {
    const t = html(id);
    for (const s of ['Cancel every running task in this group?', 'role="dialog" aria-modal="true"', '<aside inert', '<main class="hd-main" inert']) assert.ok(t.includes(s), `${id}: ${s}`);
  }
  assert.ok(html('cancel-all-confirm').includes('data-pl-go="parallel-group/lanes-titled"'));
  assert.ok(html('cancel-all-confirm-minimum').includes('data-pl-go="parallel-group/lanes-titled-minimum"'));
  for (const id of ['lanes-settled', 'lane-failed', 'lane-cancelled', 'lane-taken-over', 'group-empty']) assert.doesNotMatch(html(id), /data-pl-id="cancel-all"|>Cancel all</, `${id}: no Cancel all`);

  // Settled and degraded copy.
  const has = (id, ...parts) => parts.forEach(s => assert.ok(html(id).includes(s), `${id}: ${s}`));
  has('lane-failed', 'Failed · 07:48', '2 done · 1 failed');
  has('lane-cancelled', 'Cancelled · 04:31', '2 done · 1 cancelled');
  has('lane-taken-over', 'Messages are off — you took this task over in Terminal', 'taken over');
  has('lane-activity-unavailable', 'Activity log unavailable.', 'No activity to display.', 'Messaging is unavailable for this activity view.');
  has('lane-history-boundary', 'Load current activity');
  assert.doesNotMatch(html('lane-history-boundary'), /Available captured history/, 'owner answer 8: the line stays out of lanes');
  has('group-empty', 'No tasks in this group any more.');
  assert.equal((html('prompt-shown').match(/<details class="hd-m05-request" open>/g) || []).length, 3);

  // Links: every fixture target is a registered route, and minimum states stay minimum.
  for (const id of withTemplate) {
    for (const [, target] of html(id).matchAll(/data-pl-go="([^"]+)"/g)) {
      assert.ok(routeSet.has(target), `${id}: ${target} is registered`);
      if (/-minimum$/.test(id)) assert.match(target, /-minimum$/, `${id}: ${target} stays at 1000 × 620`);
    }
    for (const [, href] of html(id).matchAll(/href="(#[^"]+)"/g)) checkHash(href, id);
  }

  // Loading derives from the two-lane base.
  const loading = HFV2.describe('parallel-group/loading-two');
  assert.equal(loading.skeleton.of, 'parallel-group/two-lanes');
  assert.equal(loading.templateKey, 'parallel-group/two-lanes');
  const spec = HFV2.skeletonSpecs['parallel-group-two'];
  assert.ok(spec);
  assert.equal(spec.chrome.Message, 4);
  assert.equal(spec.chrome.Send, 2);
  assert.equal((html('two-lanes').match(/class="hd-lane"/g) || []).length, 2);
});


test('parallel group lane approval is pinned, quotes the question and answer, and does not broaden other provisional states', () => {
  const record = read(path.join(v2, 'docs', 'decisions', 'parallel-group-proposal.md'));
  assert.match(record, /2153ab1d963709d8fbe77cd0bfd678292202a863/);
  assert.match(record, /Do you approve the drawn parallel group states in HarflowDesign at commit 2153ab1/);
  assert.match(record, /"Approve all \(Recommended\)"/);
  assert.doesNotMatch(record, /Provisional \/ Draft/);
  for (const route of ['task/cancelled-partial', 'task/artifacts-empty', 'task/loading-known-title']) assert.equal(HFV2.describe(route).status, 'provisional', route);
});

test('workflow question approval is pinned to the eight cards and does not broaden other provisional states', () => {
  const record = read(path.join(v2, 'docs', 'decisions', 'workflow-questions.md'));
  assert.match(record, /9093e7515a7759f864c106a210649292209f87e4/);
  assert.match(record, /“Approve these cards”/);
  assert.match(record, /does not close the full M07 gap or establish a new retention policy/);
  for (const id of ['workflow-question', 'workflow-question-offered', 'workflow-question-answered', 'workflow-question-unavailable']) {
    for (const suffix of ['', '-minimum']) {
      const d = HFV2.describe(`needs-you/${id}${suffix}`);
      assert.equal(d.status, 'approved');
      assert.deepEqual(Object.keys(d.state.approval).sort(), ['by', 'date', 'decision']);
      assert.equal(d.state.approval.by, 'the owner');
      assert.equal(d.state.approval.date, '2026-11-17');
      assert.equal(d.state.approval.decision, 'Workflow questions');
      const html = HFV2.templates[d.templateKey];
      assert.ok(html.includes('aria-label="Workflow question"'));
      assert.ok(!html.includes('Preview only') && !html.includes('data-question-result'));
      assert.ok(html.includes('aria-label="Wants to publish"'));
      if (id.endsWith('-offered')) {
        assert.ok(html.includes('value="retry"') && html.includes('value="switch"'));
        assert.ok(!html.includes('<textarea'));
      }
      if (id.endsWith('-answered')) {
        assert.ok(html.includes('Already answered by the caller') && html.includes('Your saved draft'));
        assert.ok(!html.includes('data-question-form'));
      }
      if (id.endsWith('-unavailable')) {
        assert.ok(html.includes('<fieldset disabled>') && html.includes('data-question-retry'));
      }
      assert.ok(html.includes(suffix ? 'width: 1000px; height: 620px;' : 'width: 1280px; height: 800px;'));
    }
  }
  for (const route of ['task/cancelled-partial', 'task/artifacts-empty', 'task/loading-known-title']) assert.equal(HFV2.describe(route).status, 'provisional', route);
});


test('workflow first-save naming has exactly eight approved routes without implying saved-workflow rename approval', () => {
  const routes = ['empty', 'focused', 'named', 'long'].flatMap(name => [
    `workflow-editor/name-entry-${name}`, `workflow-editor/name-entry-${name}-minimum`
  ]);
  assert.deepEqual(Array.from(descriptors.filter(d => d.renderer === 'workflowNaming'), d => d.route).sort(), routes.sort());
  for (const route of routes) {
    const state = stateOfRoute(route)[1];
    assert.equal(state.status, 'approved');
    assert.equal(state.approval.date, '2026-11-17');
    assert.equal(state.approval.decision, 'Workflow name before first save');
  }
  assert.equal(stateOfRoute('workflow-editor/name-required')[1].status, 'approved');
});
