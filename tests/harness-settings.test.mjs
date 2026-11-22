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
const REGISTRATION = ['harnesses-runtime-not-ready', 'harnesses-registration-failed', 'harnesses-empty', 'harnesses-setup-refused', 'harnesses-remove-confirm'];
const QUALIFICATION = ['qualification-mixed', 'qualification-not-checked', 'qualification-cancelled', 'qualification-unsupported', 'qualification-discovery-failed'];
const APPROVALS = ['mcp-approvals-empty', 'mcp-approvals-add-confirm', 'mcp-approvals-remove-confirm', 'mcp-approvals-write-refused', 'mcp-approvals-vibe', 'mcp-approvals-unsupported', 'mcp-approvals-read-failed', 'mcp-approvals-capability-missing', 'mcp-approvals-human-only'];
const ALL = [...REGISTRATION, ...QUALIFICATION, ...APPROVALS].map(id => `settings/${id}`);
const stateOf = route => HFV2.findState(HFV2.findFamily('settings'), route.split('/')[1]);
const T = HFV2.templates;

test('the harness settings states are registered, provisional, grouped and named for the product screen only', () => {
  assert.deepEqual([...HFV2.harnessSettingsStates].sort(), [...ALL].sort());
  assert.equal(ALL.length, 19);
  const groups = { 'Harness registration': REGISTRATION, 'Harness qualification': QUALIFICATION, 'MCP approvals': APPROVALS };
  for (const [group, ids] of Object.entries(groups)) for (const id of ids) assert.equal(stateOf(`settings/${id}`).group, group, id);
  for (const route of ALL) {
    const state = stateOf(route);
    assert.equal(state.status, 'provisional', route);
    assert.equal(state.approval, undefined);
    assert.equal(HFV2.describe(route).approval, 'Provisional · not approved');
    for (const text of [state.title, state.description, state.group]) {
      assert.ok(!NAMING_RULE.test(text) && !PLAN_WORDS.test(text), `${route}: ${text}`);
    }
    assert.ok(HFV2.componentDocs[route].includes('Provisional, not approved.') && HFV2.componentDocs[route].includes('decisions/harness-settings.md'), route);
    assert.equal(typeof T[route], 'string');
  }
  assert.ok(!stateOf('settings/harnesses').approvalNote && stateOf('settings/harnesses').status === 'approved' && stateOf('settings/mcp-approvals').status === 'approved');
});

test('each state is the approved page with only the blocks it changes replaced', () => {
  const harnesses = T['settings/harnesses'], approvals = T['settings/mcp-approvals'];
  const listOf = html => html.slice(html.indexOf('<div style="margin-top: var(--space-2);"><hr'), html.indexOf('<section aria-label="Harness qualification"'));
  const qualOf = html => html.slice(html.indexOf('<section aria-label="Harness qualification"'), html.indexOf('</section>', html.indexOf('<section aria-label="Harness qualification"')) + 10);
  const strip = html => html.replace(/<div class="hd-m05-scrim">[\s\S]*<\/div><\/div><\/div>/, '').replace('<aside inert', '<aside').replace('<main class="hd-main" inert>', '<main class="hd-main">');
  for (const id of QUALIFICATION) {
    const html = T[`settings/${id}`];
    assert.equal(html.replace(qualOf(html), qualOf(harnesses)), harnesses, `${id} changes only the qualification section`);
  }
  assert.equal(strip(T['settings/harnesses-remove-confirm']), harnesses, 'the remove confirmation changes only the dialog');
  const registration = T['settings/harnesses-registration-failed'];
  assert.equal(registration.replace(listOf(registration), listOf(harnesses)), harnesses, 'registration-failed changes only the list');
  for (const id of ['harnesses-empty', 'harnesses-setup-refused']) {
    const html = T[`settings/${id}`];
    assert.equal(qualOf(html), qualOf(harnesses), `${id} keeps the approved qualification section`);
    assert.equal(html.slice(0, html.indexOf('<main')), harnesses.slice(0, harnesses.indexOf('<main')), `${id} keeps the window`);
  }
  assert.ok(T['settings/harnesses-runtime-not-ready'].includes('aria-label="Refresh" disabled'));
  const panelOf = html => html.slice(html.indexOf('<div id="mcp-approvals"'), html.indexOf('</form></div>', html.indexOf('<div id="mcp-approvals"')) + 13);
  for (const id of ['mcp-approvals-empty', 'mcp-approvals-write-refused', 'mcp-approvals-read-failed', 'mcp-approvals-capability-missing', 'mcp-approvals-human-only']) {
    const html = T[`settings/${id}`];
    assert.equal(html.replace(panelOf(html), panelOf(approvals)), approvals, `${id} changes only the approvals panel`);
  }
  for (const id of ['mcp-approvals-vibe', 'mcp-approvals-unsupported']) {
    const html = T[`settings/${id}`];
    assert.equal(html.replace(listOf(html), listOf(approvals)), approvals, `${id} changes only the harness list`);
  }
  assert.ok(!T['settings/harnesses-runtime-not-ready'].includes('aria-label="Harness qualification"'), 'only runtime-not-ready hides qualification');
  for (const id of ['mcp-approvals-add-confirm', 'mcp-approvals-remove-confirm']) assert.ok(T[`settings/${id}`].includes('role="dialog"') && T[`settings/${id}`].includes('<aside inert'), `${id} is a dialog over an inert window`);
  assert.ok(!/<dialog|hd-sheet/.test(ALL.map(r => T[r]).join('')), 'the inline panel is kept: no sheet');
});

test('Mac and engine strings are verbatim and refusals read "<message> (<code>)"', () => {
  const t = id => T[`settings/${id}`];
  assert.ok(t('harnesses-remove-confirm').includes('Remove harflow from Claude Code?') && t('harnesses-remove-confirm').includes('This runs harflow-setup, which edits Claude Code\'s own configuration.'));
  assert.ok(t('harnesses-setup-refused').includes('Incompatible Harflow runtime: unsupported harflow.setup format (incompatible_runtime)'));
  assert.ok(t('harnesses-registration-failed').includes('(setup_error)'));
  assert.ok(t('mcp-approvals-write-refused').includes('Harness configuration changed; reload and try again (allowlist_error)'));
  assert.ok(t('mcp-approvals-human-only').includes('Only a verified human may change global MCP approval rules: it was called from task') && t('mcp-approvals-human-only').includes('(human_only)'));
  assert.ok(t('mcp-approvals-add-confirm').includes('Allow github/* globally?') && t('mcp-approvals-add-confirm').includes('This lets Claude Code call this MCP tool across projects and future tasks. A tool name of * allows every tool on that server. Other harness policies still apply.') && t('mcp-approvals-add-confirm').includes('Allow globally'));
  assert.ok(t('mcp-approvals-remove-confirm').includes('Remove global approval for linear/get_issue?') && t('mcp-approvals-remove-confirm').includes('This removes the explicit approval from Claude Code\'s global configuration. Other permission rules remain unchanged.') && t('mcp-approvals-remove-confirm').includes('Remove approval'));
  assert.ok(t('mcp-approvals-vibe').includes('Vibe supports exact tool names only; server wildcards are unavailable.') && t('mcp-approvals-vibe').includes('Vibe requires individual server/tool entries.') && /<button type="submit" class="hd-btn hd-btn--secondary" disabled>Add approval/.test(t('mcp-approvals-vibe')));
  assert.ok(t('mcp-approvals-unsupported').includes('Cursor MCP approvals are per project directory and are not edited by Harflow.') && t('mcp-approvals-unsupported').includes('id="mcp-new" class="hd-input" type="text" placeholder="server/tool" disabled'));
  assert.ok(t('mcp-approvals-capability-missing').includes('This Harflow runtime can\'t edit global MCP approvals. Update Harflow to use it.'));
  assert.ok(t('mcp-approvals-read-failed').includes('exited 1 without a JSON answer.'));
  assert.ok(t('qualification-discovery-failed').includes('Harness qualification discovery is unavailable. Refresh to retry.') && t('qualification-discovery-failed').includes('Retry qualification'));
  assert.ok(t('qualification-unsupported').includes('Harness qualification is unavailable in the selected engine. A supporting managed runtime is required.') && !/hd-btn/.test(t('qualification-unsupported').slice(t('qualification-unsupported').indexOf('Harness qualification</h2>'))));
  for (const text of ['Check cancelled. Late results will not enable launch.', 'The request changed. Fresh qualification evidence is required.', 'Cancelling stops waiting for this check. The engine may still finish it.', 'Failed · failed', 'feature is not qualified on this platform', 'probe bundle did not establish this feature', 'Cancel check', 'Check harness', 'Retry qualification', 'Check again']) assert.ok(ALL.some(r => T[r].includes(text)), text);
  for (const route of ALL) for (const banned of ['incomplete or out of date', 'Start engine', 'socket', 'daemon', 'Check for updates']) assert.ok(!T[route].includes(banned), `${route} has no ${banned}`);
});

test('qualification honours G-HARNESS and leaves the approved rows alone', () => {
  for (const id of QUALIFICATION.filter(x => x !== 'qualification-discovery-failed')) {
    const html = T[`settings/${id}`];
    assert.ok(html.includes('No native qualification for this harness'), `${id} says Opencode has none`);
    const opencode = html.slice(html.indexOf('hd-hs-identity">Opencode'), html.indexOf('hd-hs-identity">Antigravity'));
    assert.ok(!/hd-btn/.test(opencode), `${id} offers no check for Opencode`);
    for (const harness of ['Claude Code ·', 'Codex ·', 'Mistral Vibe ·']) assert.ok(html.includes(harness), `${id} has ${harness}`);
  }
  const approved = T['settings/harnesses'];
  assert.ok(approved.includes('Codex needs sign-in: run codex login, then refresh.') && approved.includes('>Opencode</span><span style="display: inline-flex'), 'the approved qualification rows are untouched');
  assert.ok(!T['settings/qualification-mixed'].includes('needs sign-in'));
  for (const id of QUALIFICATION) { const html = T[`settings/${id}`]; assert.ok(!/hd-glyph--(running|queued)/.test(html.slice(html.indexOf('Harness qualification</h2>'))), `${id} uses no task status glyph for Qualifying or Not checked`); }
  const record = read('docs/decisions/harness-settings.md');
  assert.ok(/Conflict with the approved page/.test(record) && /G-HARNESS/.test(record) && record.includes('Amend the approved qualification rows'));
});

test('the stylesheet adds only new hd-hs- selectors, so no approved state changes', () => {
  const css = read('styles/harness-settings.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].flatMap(m => m[1].split(',').map(x => x.trim())).filter(Boolean);
  assert.ok(selectors.length > 5);
  for (const selector of selectors) assert.ok(/\.hd-hs-[a-z-]+/.test(selector), `${selector} names an hd-hs- class`);
  for (const selector of selectors.filter(x => !x.startsWith('.hd-hs-'))) assert.ok(/^\.hd-form-row__hint \.hd-hs-/.test(selector), `${selector} is scoped to an hd-hs- class`);
  for (const route of ['settings/harnesses', 'settings/mcp-approvals']) assert.ok(!T[route].includes('hd-hs-'), `${route} uses no new class`);
});

test('the record carries the required sections, the engine need and the dependency on the missing-feature pattern', () => {
  const record = read('docs/decisions/harness-settings.md');
  for (const heading of ['## Source', '## States', '## Refusals', '## Qualification and G-HARNESS', '## Owner questions', '## What the app would change', '## Engine needs', '## Evidence and limits', '## Files']) assert.ok(record.includes(heading), heading);
  for (const text of ['mcp-allowlist.v1', '0.15', 'Retry', 'No harnesses found on this Mac.', 'depends on the missing-feature pattern', 'MCPAllowlistVM.swift:61-63, :66-69', 'mcp_allowlist.py:47', 'ctl.py:2316']) assert.ok(record.includes(text) || (text === '0.15' && record.includes('0.0.15')), text);
  for (const route of ALL) assert.ok(record.includes(`\`${route}\``) || record.includes(`\`${route.split('/')[1]}\``), `${route} is in the record`);
  assert.ok(read('docs/decisions/README.md').includes('[harness-settings.md](harness-settings.md)'));
  for (const doc of ['docs/migration-coverage.md', 'docs/screen-inventory.md', 'docs/route-map.md']) assert.ok(read(doc).includes('harness-settings.md'), doc);
  assert.ok(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8').includes('harness settings states'));
  const html = read('index.html');
  assert.ok(html.includes('styles/harness-settings.css') && html.indexOf('scripts/states-harness-settings.js') < html.indexOf('scripts/catalog.js'));
});

test('the dialog states keep the shared sidebar structure once inert is removed', () => {
  for (const route of ['settings/harnesses-remove-confirm', 'settings/mcp-approvals-add-confirm', 'settings/mcp-approvals-remove-confirm']) {
    const html = T[route].replace('<aside inert class="hd-sidebar"', '<aside class="hd-sidebar"');
    const side = html.slice(html.indexOf('<aside class="hd-sidebar"'), html.indexOf('</aside>'));
    const base = T[route.includes('harnesses-') ? 'settings/harnesses' : 'settings/mcp-approvals'];
    assert.equal(side, base.slice(base.indexOf('<aside class="hd-sidebar"'), base.indexOf('</aside>')), `${route} has the approved sidebar structure`);
    assert.ok(side.indexOf('hd-sidebar__top') < side.indexOf('<nav class="hd-nav"') && side.indexOf('aria-label="Running"') < side.indexOf('aria-label="Recent work"') && side.indexOf('aria-label="Recent work"') < side.indexOf('hd-sidebar__foot'));
  }
});
