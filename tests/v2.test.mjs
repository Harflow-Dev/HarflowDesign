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

test('registry states are unique and every state has a template', () => {
  assert.ok(keys.length >= 30);
  assert.equal(routeSet.size, keys.length);
  for (const key of keys) {
    assert.equal(typeof HFV2.templates[key], 'string', `${key} has a template`);
    assert.ok(HFV2.templates[key].trim().length > 0, `${key} template is not empty`);
  }
  for (const key of Object.keys(HFV2.templates)) assert.ok(routeSet.has(key), `${key} template is registered`);
  assert.equal(HFV2.registry.families.at(-1).id, 'components');
  assert.equal(HFV2.registry.families.at(-1).states[0].id, 'cover');
  for (const family of HFV2.registry.families) {
    for (const state of family.states) {
      assert.match(`${family.id}/${state.id}`, /^[a-z0-9-]+\/[a-z0-9-]+$/);
      assert.ok(state.title && state.description && state.approval, `${family.id}/${state.id} has metadata`);
    }
  }
});

test('no placeholder survives rendering in any appearance', () => {
  for (const key of keys) {
    for (const [selection, resolved] of [['light', 'light'], ['dark', 'dark'], ['system', 'light'], ['system', 'dark']]) {
      const html = HFV2.fill(HFV2.templates[key], selection, resolved);
      assert.ok(!html.includes('{{'), `${key} (${selection}/${resolved}) has no leftover placeholder`);
    }
  }
  const sample = HFV2.fill(HFV2.templates['new-task/default'], 'dark', 'dark');
  assert.match(sample, /data-theme="dark"/);
  assert.match(sample, /aria-pressed="true" aria-label="Dark"/);
});

test('internal links inside templates resolve', () => {
  let routed = 0;
  for (const key of keys) {
    for (const [, href] of HFV2.templates[key].matchAll(/href="([^"]*)"/g)) {
      const match = /^#([a-z0-9-]+\/[a-z0-9-]+)$/.exec(href);
      if (match) {
        routed += 1;
        assert.ok(routeSet.has(match[1]), `${key} links to unknown route ${href}`);
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
  for (const key of keys) assert.ok(!HFV2.templates[key].includes('.dc.html'), key);
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
  for (const key of Object.keys(HFV2.componentDocs)) assert.ok(routeSet.has(key), `${key} is a registered route`);
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
