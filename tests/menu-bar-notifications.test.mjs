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
const T = HFV2.templates;
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b/i;
const PLAN_WORDS = /\bslice\b|capabilit|\bgap\b|milestone|proposal/i;
const POPOVER = ['runtime-setup', 'runtime-preparing', 'runtime-failed', 'engine-call-failed', 'question-typing', 'question-submitting', 'question-answered', 'question-already-answered', 'question-stale', 'question-failed', 'question-unknown', 'question-caller-returned', 'needs-you-unsupported', 'workflow-status-unavailable'].map(id => `menu-bar/${id}`);
const SETTINGS = ['notifications-not-requested', 'notifications-denied', 'notifications-allowed', 'notifications-unavailable'].map(id => `settings/${id}`);
const ALL = [...POPOVER, ...POPOVER.map(r => `${r}-minimum`), 'notifications/banners', ...SETTINGS];
const stateOf = route => { const [f, s] = route.split('/'); return HFV2.findState(HFV2.findFamily(f), s); };
const BUSY = T['menu-bar/busy-approve-once'], EMPTY = T['menu-bar/empty'], GENERAL = T['settings/general'];
const card = html => html.slice(html.indexOf('<form class="hd-approval'), html.indexOf('</form>', html.indexOf('<form class="hd-approval')) + 7);

test('the menu bar and notification states are registered, provisional and named for the product screen only', () => {
  assert.deepEqual([...HFV2.menuBarStates, ...HFV2.notificationStates].sort(), [...ALL].sort());
  assert.equal(ALL.length, 33);
  const family = HFV2.findFamily('notifications');
  assert.equal(family.area, 'attention');
  assert.deepEqual(Array.from(family.states, s => s.id), ['banners']);
  for (const route of ALL) {
    const state = stateOf(route);
    assert.equal(state.status, 'provisional', route);
    assert.equal(state.approval, undefined);
    assert.equal(HFV2.describe(route).approval, 'Provisional · not approved');
    for (const text of [route, state.title, state.description, state.group || '']) assert.ok(!NAMING_RULE.test(text) && !PLAN_WORDS.test(text), `${route}: ${text}`);
    assert.ok(HFV2.componentDocs[route].includes('Provisional, not approved.') && HFV2.componentDocs[route].includes('menu-bar-and-notifications.md'), route);
    assert.equal(typeof T[route], 'string');
  }
  assert.ok(Array.from(HFV2.findFamily('settings').groups).includes('Notifications'));
  for (const route of POPOVER) assert.ok(!('minimum' in stateOf(route)) && !('minimum' in stateOf(`${route}-minimum`)), `${route} twins are self-rendered`);
  assert.equal(HFV2.registry.families.filter(f => f.id === 'notifications').length, 1);
});

test('each popover state has a self-rendered 1000 × 620 twin with the popover treatment', () => {
  for (const route of POPOVER) {
    const twin = stateOf(`${route}-minimum`), id = route.split('/')[1];
    assert.equal(twin.group, 'Minimum window');
    assert.equal(twin.specimenSize, '1000 × 620');
    assert.deepEqual({ ...twin.source }, { renderer: 'menuBarPopover', mount: `${id}-minimum` });
    assert.equal(HFV2.routeFor('menuBarPopover', `${id}-minimum`), `${route}-minimum`);
    assert.equal(T[`${route}-minimum`].replace('width: 1000px; height: 620px;', 'width: 100%; height: 800px;'), T[route].replace('<section class="hd-mb-capped" ', '<section ').replace('overflow-y: auto; max-height: calc(100% - 12px);', 'overflow: hidden;'), `${route} twin differs only in its frame and cap`);
  }
  assert.equal(HFV2.RENDERERS.menuBarPopover.api, 'menuBarPopover');
  assert.equal(typeof HFV2.menuBarPopover.mount, 'function');
  assert.match(read('scripts/states-menu-bar-notifications.js'), /applyMinimum\(root, \['popover'\]\)/);
});

test('every popover state is the approved popover with only its blocks replaced, and the question card keeps its Answer label', () => {
  const squash = html => html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  const uncap = html => html.replace('<section class="hd-mb-capped" ', '<section ').replace('overflow-y: auto; max-height: calc(100% - 12px);', 'overflow: hidden;');
  const approvedCard = card(BUSY);
  assert.ok(approvedCard.includes('>Answer</button>') && approvedCard.includes('placeholder="Type an answer"'));
  for (const id of ['question-typing', 'question-submitting', 'question-answered', 'question-already-answered', 'question-stale', 'question-failed', 'question-unknown', 'question-caller-returned']) {
    const html = uncap(T[`menu-bar/${id}`]);
    assert.equal(squash(html.replace(card(html), approvedCard)), squash(BUSY), `${id} changes only the question card`);
  }
  for (const id of ['question-typing', 'question-submitting', 'question-failed']) assert.ok(card(T[`menu-bar/${id}`]).includes('Answer') || card(T[`menu-bar/${id}`]).includes('Submitting…'), id);
  assert.ok(/class="hd-btn hd-btn--primary hd-btn--sm"[^>]*>Answer<\/button>/.test(card(T['menu-bar/question-typing'])));
  assert.ok(!/Send answer/.test(POPOVER.map(r => T[r]).join('')), 'the approved label Answer is kept');
  for (const id of ['runtime-setup', 'runtime-preparing', 'runtime-failed']) {
    const html = uncap(T[`menu-bar/${id}`]);
    assert.ok(html.includes('aria-label="New task" disabled'), `${id} disables "+"`);
    assert.ok(!html.includes('aria-label="Needs you"') && !html.includes('aria-label="Running"'), `${id} hides the sections`);
    const FOOTER = '<div style="display: flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-3); border-top: 1px solid var(--border);">';
    const restored = html.replace(' disabled title="Finish setting up Harflow first"', '');
    const rebuilt = restored.slice(0, restored.indexOf('<div class="hd-mb-block">')) + EMPTY.slice(EMPTY.indexOf('<div class="hd-empty"'), EMPTY.indexOf(FOOTER)) + restored.slice(restored.indexOf(FOOTER));
    assert.equal(squash(rebuilt), squash(EMPTY), `${id} keeps the approved header and footer`);
  }
  const unsupported = uncap(T['menu-bar/needs-you-unsupported']);
  assert.ok(unsupported.includes('Run command') && !unsupported.includes('Nightly dependency audit asks') && unsupported.includes('This engine version cannot report workflow questions here.'));
  const workflows = uncap(T['menu-bar/workflow-status-unavailable']);
  assert.equal(squash(workflows.replace(/<section aria-label="Workflows"[\s\S]*?<\/section>/, '')), squash(BUSY));
  assert.ok(workflows.includes('Workflow status unavailable'));
  const failed = uncap(T['menu-bar/engine-call-failed']);
  assert.ok(failed.includes('hd-mb-dot') && failed.includes('Couldn\'t refresh your work') && failed.includes('aria-label="Recent"') && failed.includes('Retry'));
});

test('Mac strings are verbatim, no unknown outcome is invented for questions, and design wording is marked', () => {
  const t = id => T[`menu-bar/${id}`], docOf = id => HFV2.componentDocs[`menu-bar/${id}`];
  assert.ok(t('runtime-preparing').includes('Preparing Harflow runtime…') && t('runtime-preparing').includes('Preparing the exact paired runtime. This can take a few minutes.'));
  assert.ok(!/hd-glyph--running|hd-badge__spin/.test(t('runtime-preparing')), 'no spinner for a runtime word');
  assert.ok(t('runtime-failed').includes('Harflow runtime preparation failed') && t('runtime-failed').includes('The managed runtime is unavailable. Try again to prepare it.'));
  assert.ok(t('question-submitting').includes('Submitting…') && t('question-submitting').includes('Submitting your answer to the engine…') && t('question-submitting').includes('disabled'));
  assert.ok(t('question-answered').includes('Answered') && !card(t('question-answered')).includes('hd-approval__actions'));
  assert.ok(t('question-already-answered').includes('Already answered by the caller') && t('question-already-answered').includes('Your saved draft'));
  for (const id of ['question-answered', 'question-already-answered', 'question-stale', 'question-caller-returned']) {
    const c = card(t(id));
    assert.ok(c.startsWith('<form class="hd-approval hd-approval--settled"') && c.includes('hd-approval__result hd-approval__result--compact') && !/hd-glyph|--success|hd-mb-result/.test(c), `${id} uses the approved settled card, with no glyph or colour`);
  }
  assert.ok(card(t('question-answered')).includes('<p class="hd-approval__result-title">Answered</p>') && card(t('question-answered')).includes('Nightly dependency audit no longer needs you.') && !card(t('question-answered')).includes('5:46 PM'));
  assert.ok(card(t('question-already-answered')).includes('<p class="hd-approval__result-title">Already answered by the caller</p>') && card(t('question-already-answered')).includes('Oct 14, 2026, 5:46 PM'));
  assert.ok(card(t('question-stale')).includes('Your saved draft'));
  assert.ok(t('question-stale').includes('This request changed. Review it again.') && docOf('question-stale').includes('NeedsYouQuestion.swift:158-166') && !docOf('question-stale').includes('.changed') && docOf('question-stale').includes('only the message text differs'));
  assert.ok(t('question-caller-returned').includes('The caller is answering this again.') && t('question-caller-returned').includes('Your saved draft'));
  assert.ok(t('question-unknown').includes('Harflow couldn\'t confirm your answer was received. Open Needs you to check.') && !/Send again|Resend|Retry/.test(t('question-unknown')), 'a question is never sent again by itself');
  assert.ok(docOf('question-unknown').includes('Design wording and an app change'));
  assert.ok(t('workflow-status-unavailable').includes('>Workflow status unavailable<'));
  assert.ok(docOf('question-already-answered').includes('NeedsYouQuestion.swift:143-152') && docOf('question-stale').includes('attention_checkpoint_stale'));
  assert.ok(docOf('engine-call-failed').includes('contract version 2') && docOf('engine-call-failed').includes('did not answer within 30 s'));
  for (const route of ALL) for (const banned of ['Start engine', 'socket', 'daemon', 'Check for updates', 'Send answer']) assert.ok(!T[route].includes(banned), `${route} has no ${banned}`);
});

test('the notification banners have no action buttons and keep the app\'s titles', () => {
  const html = T['notifications/banners'];
  assert.ok(!/<button|role="button"|<a /.test(html), 'no action buttons');
  for (const title of ['Done: ', 'Failed: ', 'Approval: ', 'Question: ', 'Recovery: ']) assert.ok(html.includes(`>${title}`) || html.includes(`aria-label="${title}`), title);
  assert.equal((html.match(/<article class="hd-nt-banner"/g) || []).length, 5);
  assert.ok(!html.includes('Answered in Harflow') && !html.includes('Answered by the caller'), 'no "Answered…" banner is drawn');
  const guide = HFV2.componentDocs['notifications/banners'];
  assert.ok(guide.includes('design-originated') && guide.includes('harflow-interactions') && guide.includes('no action buttons'));
});

test('the Settings rows are settings/general with one block added, and the unavailable state uses the pattern sentence', () => {
  for (const route of SETTINGS) {
    const html = T[route].replace(/ disabled>/g, '>');
    const without = html.replace(/<hr style="border: 0; border-top: 1px solid var\(--border\); margin: 0;"><div class="hd-form-row" style="min-height: 40px;"><div class="hd-form-row__label">Notifications<span class="hd-form-row__hint">[\s\S]*?<\/span><\/div>(?:<button[^>]*>Open System Settings<\/button>)?<\/div>/, '');
    assert.equal(without, GENERAL, `${route} adds only the permission row`);
    assert.ok(stateOf(route).group === 'Notifications');
  }
  assert.ok(T['settings/notifications-not-requested'].includes('macOS asks the first time Harflow sends a notification.'));
  assert.ok(T['settings/notifications-denied'].includes('Open System Settings') && (T['settings/notifications-denied'].match(/role="switch"[^>]*disabled/g) || []).length === 2);
  assert.ok(T['settings/notifications-allowed'].includes('Notifications are allowed for Harflow.') && !/role="switch"[^>]*disabled/.test(T['settings/notifications-allowed']));
  assert.ok(T['settings/notifications-unavailable'].includes('This Harflow runtime can\'t send notifications. Update Harflow to use it.') && (T['settings/notifications-unavailable'].match(/role="switch"[^>]*disabled/g) || []).length === 2);
  const guide = HFV2.componentDocs['settings/notifications-unavailable'];
  assert.ok(/design-originated/i.test(guide) && guide.includes('depends on that pattern') && guide.includes('interaction-events.v1'));
});

test('the stylesheet adds only new hd-mb- and hd-nt- selectors, so no approved state changes', () => {
  const css = read('styles/menu-bar-notifications.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].flatMap(m => m[1].split(',').map(x => x.trim())).filter(Boolean);
  assert.ok(selectors.length > 10);
  for (const selector of selectors) assert.ok(/\.hd-(mb|nt)-[a-z-]+/.test(selector), `${selector} names an hd-mb- or hd-nt- class`);
  for (const route of ['menu-bar/empty', 'menu-bar/busy-approve-once', 'settings/general']) assert.ok(!/hd-(mb|nt)-/.test(T[route]), `${route} uses no new class`);
});

test('the record carries the decisions, the click destinations, the owner questions and the dependency on the pattern', () => {
  const record = read('docs/decisions/menu-bar-and-notifications.md');
  for (const heading of ['## Source', '## Owner decisions applied', '## States', '## Notification click destinations and removal', '## Offered answers', '## Owner questions', '## What the app would change', '## Engine needs', '## Evidence and limits', '## Files']) assert.ok(record.includes(heading), heading);
  for (const text of ['N1', 'N2', 'N3', 'L2', 'harflow-interactions', 'Answered in Harflow', 'the workflow row', 'depends on the missing-feature pattern', 'stage2-gate.md', 'Answer button that opens the item', 'visible status word']) assert.ok(record.includes(text) || (text === 'the workflow row' && /Draw the workflow row/.test(record)), text);
  for (const route of [...POPOVER, 'notifications/banners', ...SETTINGS]) assert.ok(record.includes(`\`${route}\``) || record.includes(`\`${route.split('/')[1]}\``), `${route} is in the record`);
  assert.ok(read('docs/decisions/README.md').includes('[menu-bar-and-notifications.md](menu-bar-and-notifications.md)'));
  for (const doc of ['docs/migration-coverage.md', 'docs/screen-inventory.md', 'docs/route-map.md']) assert.ok(read(doc).includes('menu-bar-and-notifications.md'), doc);
  assert.ok(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8').includes('menu bar and notification states'));
  assert.ok(fs.readFileSync(path.join(root, 'README.md'), 'utf8').includes('| Attention | Needs you, Menu bar, Notifications |'));
  const html = read('index.html');
  assert.ok(html.includes('styles/menu-bar-notifications.css') && html.indexOf('scripts/states-menu-bar-notifications.js') < html.indexOf('scripts/catalog.js'));
});
