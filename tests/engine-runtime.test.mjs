import test from 'node:test';
import assert from 'node:assert/strict';
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
const PLAN_WORDS = /\bslice\b|capabilit|\bgap\b|milestone|proposal/i;
const GATES = ['app-states/contract-refused', 'app-states/capability-missing', 'app-states/store-unusable', 'harness-runtime/update-failed', 'harness-runtime/deep-link-held'];
const CALLS = ['app-states/engine-call-failed', 'app-states/engine-call-timed-out'];
const TWINNED = [...GATES, ...CALLS];
const RUNTIME_ROWS = ['checking', 'install-required', 'update-required', 'installing', 'updating', 'update-failed', 'failed'].map(x => `settings/runtime-${x}`);
const STORE_ROWS = ['inspecting', 'missing', 'incompatible', 'interrupted', 'inspect-failed'].map(x => `settings/store-${x}`);
const ALL = [...TWINNED, ...TWINNED.map(r => `${r}-minimum`), ...RUNTIME_ROWS, ...STORE_ROWS];
const stateOf = route => { const [f, s] = route.split('/'); return HFV2.findState(HFV2.findFamily(f), s); };
const section = (html, name) => { const from = html.indexOf(`<section aria-label="${name}"`); return html.slice(from, html.indexOf('</section>', from) + '</section>'.length); };

test('the engine and runtime states are registered, approved and named for the product screen only', () => {
  assert.deepEqual([...HFV2.engineRuntimeStates].sort(), [...ALL].sort());
  assert.equal(HFV2.engineRuntimeStates.length, 26);
  for (const route of ALL) {
    const state = stateOf(route);
    assert.ok(state, `${route} is registered`);
    assert.equal(state.status, 'approved', route);
    assert.deepEqual({ ...state.approval }, { by: 'the owner', date: '2026-11-23', decision: 'Engine and runtime states' }, `${route} carries its approval`);
    assert.equal(state.approvalNote, undefined, `${route} carries no approval note`);
    assert.equal(HFV2.describe(route).approval, 'Approved by the owner on 2026-11-23 · Engine and runtime states');
    for (const text of [route, state.id, state.title, state.description, state.group || '']) {
      assert.ok(!NAMING_RULE.test(text), `${route}: ${text}`);
      assert.ok(!PLAN_WORDS.test(text.replace(/capability-missing/, '')), `${route} catalog text: ${text}`);
    }
    assert.equal(typeof HFV2.templates[route], 'string', `${route} has a template`);
    assert.ok(HFV2.componentDocs[route].startsWith('<p><strong>Approved by the owner · 2026-11-23.</strong>') && !/Provisional|not approved/.test(HFV2.componentDocs[route]), `${route} guide`);
    assert.ok(HFV2.componentDocs[route].includes('decisions/engine-and-runtime.md'), `${route} links its record`);
    assert.ok(!NAMING_RULE.test(HFV2.componentDocs[route]), `${route} guide`);
  }
  assert.deepEqual(Array.from(HFV2.findFamily('settings').groups), ['Settings', 'Harflow runtime', 'Task store', 'Harness registration', 'Harness qualification', 'MCP approvals', 'Notifications', 'Loading']);
});

test('each of the seven gate and call states has a self-rendered 1000 × 620 twin', () => {
  for (const route of TWINNED) {
    const twin = stateOf(`${route}-minimum`);
    assert.equal(twin.minimum, undefined, `${route} twin is self-rendered`);
    assert.equal(twin.specimenSize, '1000 × 620');
    assert.deepEqual({ ...twin.source }, { renderer: 'engineRuntime', mount: `${route.split('/')[1]}-minimum` });
    assert.equal(HFV2.routeFor('engineRuntime', `${route.split('/')[1]}-minimum`), `${route}-minimum`);
    const base = HFV2.templates[route], min = HFV2.templates[`${route}-minimum`];
    assert.equal(min, base.replace('width: 100%; height: 800px;', 'width: 1000px; height: 620px;'), `${route} twin differs only in its frame`);
  }
  assert.equal(HFV2.RENDERERS.engineRuntime.api, 'engineRuntime');
  assert.equal(typeof HFV2.engineRuntime.mount, 'function');
  assert.ok(!stateOf('settings/runtime-failed').source, 'Settings states are not drawn at the main window frames');
});

test('every state is an exact derivation of an approved template: the populated window frame, needs-you/waiting or settings/general', () => {
  const populated = HFV2.templates['new-task/default'], general = HFV2.templates['settings/general'];
  const main = html => html.slice(html.indexOf('<main class="hd-main">'), html.indexOf('</main>') + 7);
  const part = (html, from, to) => html.slice(html.indexOf(from), html.indexOf(to) + to.length);
  // update-failed keeps the whole populated window: with its main pane put back, it is new-task/default exactly.
  const failedUpdate = HFV2.templates['harness-runtime/update-failed'];
  assert.equal(failedUpdate.replace(main(failedUpdate), main(populated)), populated, 'update-failed changes only the main pane of new-task/default');
  for (const route of GATES) {
    const html = HFV2.templates[route];
    assert.equal(part(html, '<div class="hd-sidebar__top">', '</div>\n'), part(populated, '<div class="hd-sidebar__top">', '</div>\n'), `${route} keeps the sidebar header`);
    assert.equal(part(html, '<div class="hd-sidebar__foot">', '</aside>'), part(populated, '<div class="hd-sidebar__foot">', '</aside>'), `${route} keeps the sidebar footer`);
    assert.equal(html.slice(0, html.indexOf('<aside')), populated.slice(0, populated.indexOf('<aside')), `${route} keeps the app frame`);
  }
  for (const route of RUNTIME_ROWS) {
    const html = HFV2.templates[route];
    assert.equal(html.replace(section(html, 'Harflow runtime'), section(general, 'Harflow runtime')).replace(section(html, 'Task store'), section(general, 'Task store')), general, `${route} changes only the runtime and task store sections`);
    assert.ok(section(html, 'Task store').includes('disabled'), `${route} disables the task store row`);
  }
  for (const route of STORE_ROWS) {
    const html = HFV2.templates[route];
    assert.equal(html.replace(section(html, 'Task store'), section(general, 'Task store')), general, `${route} changes only the task store section`);
  }
  const working = HFV2.templates['needs-you/waiting'];
  for (const route of CALLS) {
    const html = HFV2.templates[route];
    assert.ok(html.includes('Couldn\'t refresh your work') && html.includes('hd-ev-dot') && html.includes('role="tooltip"'));
    assert.ok(html.includes('Fix flaky slot release test') && html.includes('Recent work'), `${route} keeps the last known rows`);
    const undone = html.replace(/    <div class="hd-ev-note"[\s\S]*?<\/div>\n/, '').replace(/<span class="hd-ev-conn">[\s\S]*?<\/span><\/span>/, '');
    assert.equal(undone, working, `${route} is needs-you/waiting with only the dot, its help text and the note added`);
  }
});

test('copy follows the Mac app and the engine, with no retired or invented controls', () => {
  const t = HFV2.templates;
  assert.ok(t['harness-runtime/update-failed'].includes('Update could not finish') && t['harness-runtime/update-failed'].includes('The installed runtime was kept. Review the failure and retry when ready.') && t['harness-runtime/update-failed'].includes('Retry setup'));
  assert.ok(!t['harness-runtime/update-failed'].includes('hd-m04-sidebar-gate') && t['harness-runtime/update-failed'].includes('aria-label="Recent work"'), 'update-failed keeps the populated, usable sidebar');
  assert.ok(t['harness-runtime/deep-link-held'].includes('After setup, Harflow opens the task you linked to.') && t['harness-runtime/deep-link-held'].includes('Install runtime'));
  assert.ok(t['app-states/contract-refused'].includes('answered with contract version 2; this app understands version 1. Update the app or harflow so they match.'));
  assert.ok(t['app-states/capability-missing'].includes('Incompatible Harflow runtime: missing required events.v1 contract/capability</div>') && !t['app-states/capability-missing'].includes('(incompatible_runtime)') && /hd-ev-detail"><span class="caption hd-faint">Code<\/span><span class="hd-ev-mono">incompatible_runtime/.test(t['app-states/capability-missing']), 'the message shows without its code, which sits on a detail line');
  assert.ok(t['app-states/engine-call-failed'].includes('exited 1 without a JSON answer.'));
  assert.ok(t['app-states/engine-call-timed-out'].includes('did not answer within 30 s.'));
  assert.ok(t['app-states/store-unusable'].includes('Unsupported state root: foreign store marker; inspect state or select a fresh state root') && t['app-states/store-unusable'].includes('foreign_store') && !t['app-states/store-unusable'].includes('unrecognized') && t['app-states/store-unusable'].includes('State root') && t['app-states/store-unusable'].includes('Reason') && t['app-states/store-unusable'].includes('Open Settings'));
  const expected = { checking: 'Checking Harflow runtime…', 'install-required': 'Install required components', 'update-required': 'Update required components', installing: 'Preparing Harflow…', updating: 'Updating Harflow…', 'update-failed': 'Retry update', failed: 'Retry installation' };
  for (const [id, text] of Object.entries(expected)) assert.ok(t[`settings/runtime-${id}`].includes(text), id);
  for (const text of ['Inspect again before retrying. Any reported backup evidence is retained; the operation may have partially completed.', 'Task store has not been created', 'State root has not been initialized', 'Recovery was interrupted', 'Explicit recovery must be resumed', 'Backup path', 'Recovery operation', 'Phase', 'Inspecting task store…']) assert.ok(ALL.some(r => HFV2.templates[r].includes(text)), text);
  for (const route of ALL) {
    const html = HFV2.templates[route];
    for (const banned of ['Start engine', 'socket', 'daemon', 'Check for updates', 'Show backup in Finder', 'Back up and reset', 'Resume recovery', 'Reset task store', 'incomplete or out of date']) assert.ok(!html.includes(banned), `${route} has no ${banned}`);
    assert.ok(!/\{\{(?!theme|lightOn|darkOn|systemOn|themeIcon)/.test(html), `${route} has no stray placeholder`);
  }
  assert.ok(t['app-states/contract-refused'].includes('>Retry</button>') && !t['app-states/contract-refused'].includes('Update runtime'), 'the refusals offer Retry only');
});

test('state glyphs are the canonical ones and no state relies on colour alone', () => {
  for (const route of ['installing', 'updating', 'checking']) assert.ok(HFV2.templates[`settings/runtime-${route}`].includes('hd-glyph--running'), route);
  for (const route of ['update-failed', 'failed']) { const html = HFV2.templates[`settings/runtime-${route}`]; assert.ok(html.includes('hd-glyph--failed') && html.includes('hd-i-x'), route); }
  for (const route of STORE_ROWS.filter(r => !r.endsWith('inspecting'))) assert.ok(HFV2.templates[route].includes('hd-i-alert'), `${route} pairs its warning colour with an icon`);
  assert.ok(HFV2.templates['app-states/engine-call-failed'].includes('role="img" aria-label="Harflow runtime error"'));
});

test('the sidebar of each setup-line gate carries the setup line, the update failure and the unusable store keep the populated sidebar', () => {
  for (const route of ['harness-runtime/deep-link-held', 'app-states/contract-refused', 'app-states/capability-missing']) {
    const html = HFV2.templates[route];
    assert.ok(html.includes('<div class="hd-m04-sidebar-gate">Runtime setup required before creating or loading work.</div>') && !html.includes('aria-label="Recent work"'), route);
  }
  const store = HFV2.templates['app-states/store-unusable'];
  assert.ok(store.includes('hd-ev-attention') && store.includes('Task store needs attention</span>') && store.includes('aria-label="Recent work"'));
  for (const route of RUNTIME_ROWS) {
    const row = section(HFV2.templates[route], 'Task store');
    assert.ok(row.includes('Task store</div>') || row.includes('>Task store</span>'), `${route} titles the disabled panel`);
    assert.ok(row.includes('Inspect the task store to check compatibility. Inspection does not reset history.') && /<button[^>]* disabled>Inspect task store/.test(row), `${route} draws the disabled panel with the app's copy`);
  }
  const calls = HFV2.templates['app-states/engine-call-failed'];
  assert.ok(calls.indexOf('hd-ev-note') < calls.indexOf('aria-label="Running"'), 'the note sits above the lists');
});

test('app-states/engine-error is retired to the call failure state; the record and index carry the states', () => {
  assert.equal(stateOf('app-states/engine-error'), null);
  assert.equal(HFV2.routeRedirects['app-states/engine-error'], 'app-states/engine-call-failed');
  assert.equal(HFV2.resolveRoute('#app-states/engine-error/dark'), '#app-states/engine-call-failed/dark');
  assert.equal(HFV2.templates['app-states/engine-error'], undefined);
  assert.equal(HFV2.retired.find(e => e.route === 'app-states/engine-error').pins, 'app-states/engine-error at 344d56f');
  assert.ok(read('docs/decisions/README.md').includes('| `app-states/engine-error` | `app-states/engine-call-failed` |'));
  const record = read('docs/decisions/engine-and-runtime.md');
  for (const heading of ['## Source', '## States', '## The missing-feature pattern', '## Which path reaches which gate', '## Owner answers (2026-11-23)', '## What the app would change', '## Engine needs', '## Decisions recorded without a drawing', '## Retired `app-states/engine-error`', '## Files']) assert.ok(record.includes(heading), heading);
  for (const route of ALL.filter(r => !r.endsWith('-minimum'))) assert.ok(record.includes(`\`${route}\``) || record.includes(`\`${route.split('/')[1]}\``), `${route} is in the record`);
  for (const text of ['harflow-ctl', 'mcp-allowlist.v1', 'InitialWorkLoadingView', 'S9', 'O3', 'L2', 'N2', 'CtlModels.swift:310-319']) assert.ok(record.includes(text), text);
  const decisions = read('docs/decisions/README.md');
  assert.ok(decisions.includes('[engine-and-runtime.md](engine-and-runtime.md)'));
  const html = read('index.html');
  assert.ok(html.indexOf('styles/engine-runtime.css') > 0 && html.indexOf('scripts/states-engine-runtime.js') < html.indexOf('scripts/catalog.js'));
  for (const doc of ['docs/migration-coverage.md', 'docs/screen-inventory.md', 'docs/route-map.md']) assert.ok(read(doc).includes('engine-and-runtime.md'), doc);
  assert.ok(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8').includes('engine and runtime states'));
});

test('the stylesheet scopes every gate rule to the new gates and leaves the approved runtime states alone', () => {
  const css = read('styles/engine-runtime.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].flatMap(m => m[1].split(',').map(x => x.trim())).filter(Boolean);
  assert.ok(selectors.some(x => x.startsWith('.hd-m04-gate')));
  for (const selector of selectors.filter(x => x.startsWith('.hd-m04-gate'))) assert.ok(selector.startsWith('.hd-m04-gate.hd-ev-gate'), `${selector} is scoped to .hd-ev-gate`);
  for (const route of ALL.filter(r => !r.startsWith('settings/') && !r.includes('engine-call'))) assert.ok(HFV2.templates[route].includes('<div class="hd-m04-gate hd-ev-gate">'), `${route} marks its gate`);
});

test('the gate emits the markup of the approved runtime gate, apart from its scope class', () => {
  const source = read('scripts/m04-proposal.js');
  const at = source.indexOf('function gateMain(title, body, status, actions) {');
  const end = source.indexOf('\n  }', at);
  assert.ok(at > 0 && end > at, 'gateMain is found in m04-proposal.js');
  const gateMain = new Function(`${source.slice(at, end + 4)}; return gateMain;`)();
  const inputs = [
    ['Update could not finish', 'The installed runtime was kept.', 'Package verification failed.', '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Retry setup</button>'],
    ['Set up Harflow', 'The required runtime is not installed.', '', '']
  ];
  for (const [title, body, status, actions] of inputs) {
    const mine = HFV2.engineRuntimeGate({ title, body, status, actions }).replace(/^<main class="hd-main">\n\s*/, '').replace(/\n\s*<\/main>$/, '').replace(/<\/div>\n\s*<div class="hd-m04-gate/, '</div><div class="hd-m04-gate').replace(' hd-ev-gate', '');
    assert.equal(mine, gateMain(title, body, status, actions));
  }
});
