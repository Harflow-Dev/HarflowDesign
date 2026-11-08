import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = name => fs.readFileSync(path.join(root, 'v2/scripts', name), 'utf8');
const context = vm.createContext({ window: {} });
context.window = context;
vm.runInContext(script('d2b-proposal.js'), context);
const api = context.HFV2.d2bProposal;
const state = (request, history = 'observed') => api.transition(api.transition(api.createState('observed'), 'request', request), 'history', history);

// These assertions exercise observation permissions, rather than reproducing render branches.
test('pure fixture runtime loads without a document or browser service', () => {
  for (const method of ['createState', 'transition', 'requestView', 'activityView', 'mount']) assert.equal(typeof api[method], 'function');
  assert.equal(context.document, undefined);
});

test('complete inline and verified sidecar permit the original request without conflating integrity', () => {
  const sidecar = api.requestView(state('sidecar'));
  const inline = api.requestView(state('inline'));
  for (const view of [sidecar, inline]) {
    assert.equal(view.title, 'Original request');
    assert.equal(view.full, true);
    assert.equal(view.copy, 'Copy original request');
    assert.ok(view.text.length > 0);
  }
  assert.equal(inline.text, sidecar.text);
  assert.match(sidecar.integrity, /Verified stored request/);
  assert.equal(inline.integrity, 'Complete stored request');
  assert.doesNotMatch(inline.integrity, /verified/i);
});

test('preview and partial requests never grant full-assignment copy', () => {
  const preview = api.requestView(state('preview'));
  assert.equal(preview.title, 'Request preview');
  assert.equal(preview.copy, 'Copy preview');
  for (const kind of ['preview', 'unverified', 'truncated']) {
    const view = api.requestView(state(kind));
    assert.equal(view.full, false, kind);
    assert.notEqual(view.copy, 'Copy original request', kind);
    assert.ok(view.text.length > 0, kind);
  }
  assert.match(api.requestView(state('unverified')).integrity, /Unverified/);
  assert.equal(api.requestView(state('truncated')).copy, 'Copy displayed text');
});

test('unsafe or absent request text is withheld including after a read retry', () => {
  for (const kind of ['loading', 'unavailable', 'integrity-failed']) {
    const view = api.requestView(state(kind));
    assert.equal(view.text, '', kind);
    assert.equal(view.full, false, kind);
  }
  const failed = state('integrity-failed');
  assert.match(api.requestView(failed).title, /integrity check failed/);
  const retried = api.transition(failed, 'retry-request');
  assert.equal(api.requestView(retried).text, '');
  assert.equal(failed.request, 'integrity-failed', 'transition preserves its input');
});

test('bounded read more replaces the displayed prefix, reaches a finite cap and never grants full copy', () => {
  const before = state('truncated');
  const prefix = api.requestView(before).text;
  let after = api.transition(before, 'read-more');
  const expanded = api.requestView(after).text;
  assert.ok(expanded.startsWith(prefix));
  assert.ok(expanded.length > prefix.length);
  assert.equal(expanded.indexOf(prefix), 0, 'prefix begins once at the start, rather than being appended');
  const firstBound = after.maxBytes;
  for (let i = 0; i < 20; i++) after = api.transition(after, 'read-more');
  assert.equal(after.maxBytes, firstBound, 'fixture has reached its documented bounded maximum');
  assert.ok(after.maxBytes <= 131072);
  assert.equal(api.requestView(after).full, false);
  assert.equal(api.requestView(after).copy, 'Copy displayed text');
  assert.ok(api.requestView(after).text.length < api.requestView(state('sidecar')).text.length, 'capped prefix remains actually partial');
  const unverified = api.transition(state('unverified'), 'read-more');
  assert.equal(api.requestView(unverified).full, false);
  assert.equal(api.requestView(unverified).copy, 'Copy displayed text');
  assert.match(api.requestView(unverified).integrity, /Unverified/);
  assert.equal(before.maxBytes < after.maxBytes, true);
});

test('only sound summary coverage admits a qualified observed count, including qualified zero', () => {
  assert.equal(api.activityView(state('sidecar', 'observed')).count, '2 tool calls observed');
  assert.equal(api.activityView(api.transition(api.createState('empty'), 'summaryCoverage', 'empty')).count, 'No tool calls observed in the available captured history');
  assert.equal(api.activityView(state('sidecar', 'loading')).count, 'Loading tool activity');
  for (const history of ['partial', 'unknown', 'unsupported', 'nonprogress', 'reconnecting', 'reset', 'unavailable']) {
    const view = api.activityView(state('sidecar', history));
    assert.equal(view.count, 'Tool activity unavailable', history);
    assert.doesNotMatch(view.count, /\d/, history);
  }
});

test('loading earlier and reconnecting cannot repair unknown coverage by implication', () => {
  for (const history of ['partial', 'unknown']) {
    const before = state('sidecar', history);
    const after = api.transition(before, 'earlier');
    assert.equal(after.older, true);
    assert.equal(api.activityView(after).count, 'Tool activity unavailable', history);
    assert.equal(before.older, false);
  }
  const done = state('sidecar', 'reconnecting');
  const retry = api.transition(done, 'retry');
  assert.equal(retry.status, 'Done');
  assert.equal(api.activityView(retry).count, 'Tool activity unavailable');
  assert.match(retry.message, /not restarted/);
});

test('capacity and reset require an explicit rebase while preserving task status independence', () => {
  for (const history of ['capacity', 'reset']) {
    const before = state('sidecar', history);
    assert.equal(before.currentWindow, false);
    const after = api.transition(before, 'rebase');
    assert.equal(after.currentWindow, true);
    assert.equal(after.status, before.status);
    assert.equal(api.activityView(after).toolCount, history === 'capacity' ? 2 : null);
    assert.equal(after.summaryCoverage, before.summaryCoverage);
    assert.equal(before.currentWindow, false);
  }
  assert.equal(state('sidecar', 'partial').status, 'Done');
  assert.match(api.activityView(state('sidecar', 'partial')).title, /incomplete/);
});

test('unknown counts are null instead of a lower bound or invented zero', () => {
  for (const history of api.variants.history) {
    const view = api.activityView(state('sidecar', history));
    if (['observed', 'empty', 'drained', 'capacity'].includes(history)) assert.equal(view.toolCount, 2, 'row availability alone does not replace independent totals');
    else assert.equal(view.toolCount, null, history);
    assert.equal(view.taskStatus, 'Done', 'observation selection does not change independent task status');
  }
});

test('raw occurrence order retains duplicate and regressing sequence records and stable reading anchor', () => {
  const before = api.createState('events');
  assert.deepEqual(Array.from(before.rows, row => row.seq), [7, 7, 6]);
  assert.equal(new Set(before.rows.map(row => api.rowKey(row))).size, 3);
  assert.equal(before.rows[1].type, 'unsupported');
  const after = api.transition(before, 'earlier');
  assert.equal(after.anchor, before.anchor);
  assert.equal(after.sourceEpoch, before.sourceEpoch);
  assert.deepEqual(Array.from(after.rows.slice(1), row => api.rowKey(row)), Array.from(before.rows, row => api.rowKey(row)));
  assert.equal(before.rows.length, 3, 'prepend does not mutate cached input rows');
  assert.equal(api.activityView(after).toolCount, null, 'retained stub remains disqualifying');
});

test('capacity retains its window until explicit consumer rebase preserves source and independent totals', () => {
  const before = api.createState('capacity');
  const requestOnly = api.transition(before, 'request', 'preview');
  assert.equal(requestOnly.rows, before.rows);
  assert.equal(requestOnly.anchor, before.anchor);
  assert.equal(requestOnly.history, 'capacity');
  const rebased = api.transition(before, 'rebase');
  assert.equal(rebased.sourceEpoch, before.sourceEpoch);
  assert.ok(rebased.rows.every(row => row.sourceEpoch === rebased.sourceEpoch));
  assert.ok(!rebased.rows.some(row => before.rows.some(old => old.id === row.id)));
  assert.equal(rebased.anchor, rebased.rows[0].id);
  assert.equal(api.activityView(rebased).toolCount, 2);
  const recreated = api.createState('capacity');
  assert.equal(recreated.currentWindow, false);
  assert.equal(recreated.sourceEpoch, before.sourceEpoch, 'route recreation resets the fixture deterministically');
});

test('new activity is admitted explicitly and leaves the retained anchor intact', () => {
  const before = api.createState('observed');
  const after = api.transition(before, 'new');
  assert.equal(before.fresh, false);
  assert.equal(after.fresh, true);
  assert.equal(after.anchor, before.anchor);
  assert.deepEqual(Array.from(after.rows.slice(0, before.rows.length), row => row.id), Array.from(before.rows, row => row.id));
  assert.equal(after.rows.length, before.rows.length + 1);
});

// A runtime with the registry and the task family, as the catalog loads them.
function loadCatalog() {
  const ctx = vm.createContext({ window: {} });
  ctx.window = ctx;
  for (const name of ['registry.js', 'screens-task.js', 'screens-d2b-proposal.js', 'd2b-proposal.js']) vm.runInContext(script(name), ctx);
  return ctx.HFV2;
}
const ROUTES = {
  observed: 'task/activity-observed', loading: 'task/activity-loading', partial: 'task/activity-partial', unavailable: 'task/activity-unavailable',
  'integrity-failed': 'task/activity-integrity-failed', reconnecting: 'task/activity-reconnecting', capacity: 'task/activity-capacity', events: 'task/activity-sources'
};

test('activity templates cover eight focused states with accessible local observation surfaces', () => {
  const H = loadCatalog();
  const keys = Object.keys(H.templates).filter(key => key.startsWith('d2b-proposal/'));
  assert.deepEqual(Array.from(keys).sort(), Object.keys(ROUTES).map(name => `d2b-proposal/${name}`).sort());
  for (const key of keys) assert.match(H.templates[key], /data-d2b-controls/, key);
});

test('activity approval is per state and preserves the earlier catalog approval', () => {
  const H = loadCatalog();
  const task = H.registry.families.find(item => item.id === 'task');
  const states = task.states.filter(item => item.source && item.source.renderer === 'd2b');
  assert.equal(states.length, 8);
  assert.deepEqual(Array.from(states, item => `task/${item.id}`).sort(), Object.values(ROUTES).sort());
  for (const item of states) {
    assert.equal(item.status, 'approved');
    assert.equal(item.approval.date, '2026-11-05');
    assert.equal(item.approval.by, 'the owner');
    assert.match(item.approval.decision, /requested corrections applied/);
    assert.equal(item.approval.canvas, undefined, 'state approval uses its explicit decision');
    assert.match(H.approvalLine(task, item), /^Approved by the owner on 2026-11-05 · /);
  }
  assert.equal(H.routeFor('d2b', 'observed'), 'task/activity-observed');
  const registry = H.registry;
  assert.equal(registry.approval.date, '2026-11-03');
  assert.equal(registry.approval.canvas, '1793668079-d8d9');
  assert.equal(registry.approval.designSystem, '1793668064-9e04');
  const base = task.states.filter(item => !item.source);
  assert.deepEqual(Array.from(base, item => item.id), ['approval']);
  assert.ok(base.every(item => item.status === 'approved' && item.approval === undefined), 'base task states keep the original catalog approval');
  assert.match(H.approvalLine(task, base[0]), /^Approved by the owner on 2026-11-03 · canvas /);
  assert.equal(task.approval, undefined, 'task family keeps the original catalog approval');
  assert.equal(H.catalogStrips.d2b.controls, 'Review controls · catalog only');
  assert.equal(H.catalogStrips.d2b.note, 'Deterministic mock · design reference');
  assert.match(script('d2b-proposal.js'), /H\.catalogStrips\.d2b\.controls/);
});

test('consumer rebase cannot erase capture loss or admit sound totals after an unknown source', () => {
  for (const history of ['partial', 'reset', 'unknown']) {
    const uncertain = state('sidecar', history);
    const rebased = api.transition(uncertain, 'rebase');
    for (const coverage of ['observed', 'empty']) {
      const selected = api.transition(rebased, 'summaryCoverage', coverage);
      assert.equal(api.activityView(selected).toolCount, null, `${history}/${coverage}`);
      assert.equal(api.activityView({ ...rebased, summaryCoverage: coverage }).toolCount, null, 'defensive view retains loss after consumer rebase');
    }
  }
});

test('consumer window replacement cannot reuse the complete identity of a retained row', () => {
  const before = api.createState('capacity');
  const after = api.transition(before, 'rebase');
  const identity = row => api.rowKey(row);
  assert.equal(identity(before.rows[0]), `${before.rows[0].sourceEpoch}:${before.rows[0].windowEpoch}:${before.rows[0].occurrence}`);
  assert.equal(after.sourceEpoch, before.sourceEpoch);
  assert.notEqual(after.windowEpoch, before.windowEpoch);
  assert.ok(before.rows.every(row => row.windowEpoch === before.windowEpoch));
  assert.ok(after.rows.every(row => row.windowEpoch === after.windowEpoch));
  const oldKeys = new Set(before.rows.map(identity));
  assert.ok(after.rows.every(row => !oldKeys.has(identity(row))));
  assert.equal(api.activityView(after).toolCount, 2, 'consumer replacement does not invalidate an independently sound summary');
});

test('source reset retains cached source until explicit adoption and keeps summary unknown afterward', () => {
  const reset = state('sidecar', 'reset');
  assert.ok(reset.pendingSourceEpoch);
  assert.notEqual(reset.pendingSourceEpoch, reset.sourceEpoch);
  assert.ok(reset.rows.every(row => row.sourceEpoch === reset.sourceEpoch), 'cached rows retain their original producer identity');
  const adopted = api.transition(reset, 'rebase');
  assert.equal(adopted.sourceEpoch, reset.pendingSourceEpoch);
  assert.equal(adopted.pendingSourceEpoch, null);
  assert.notEqual(adopted.windowEpoch, reset.windowEpoch);
  assert.ok(adopted.rows.every(row => row.sourceEpoch === adopted.sourceEpoch));
  assert.equal(api.activityView(adopted).toolCount, null);
  assert.equal(reset.currentWindow, false, 'adoption leaves the original cached model unchanged');
});

test('healthy observed fixtures have monotonic sequence while Events retains raw duplicates and regressions', () => {
  for (const name of ['observed', 'capacity']) {
    const model = api.createState(name);
    for (let i = 1; i < model.rows.length; i++) assert.ok(model.rows[i].seq > model.rows[i - 1].seq, name);
    assert.equal(api.activityView(model).toolCount, 2);
  }
  const events = api.createState('events');
  assert.deepEqual(Array.from(events.rows, row => row.seq), [7, 7, 6]);
  assert.equal(api.activityView(events).toolCount, null);
  const prepended = api.transition(events, 'earlier');
  assert.deepEqual(Array.from(prepended.rows.slice(1), row => row.seq), [7, 7, 6]);
  assert.equal(api.activityView(prepended).toolCount, null);
});

test('initial absent-history states admit no phantom rows while keeping snapshot status independent', () => {
  for (const name of ['loading', 'empty', 'unsupported', 'unavailable']) {
    const model = api.createState(name);
    const view = api.activityView(model);
    assert.equal(model.rows.length, 0, name);
    assert.ok(['Running', 'Done'].includes(model.status), name);
    assert.equal(view.taskStatus, model.status, name);
    assert.equal(view.toolCount, null, `${name} cannot infer a zero from absent rows`);
  }
  const qualifiedEmpty = api.transition(api.createState('empty'), 'summaryCoverage', 'empty');
  assert.equal(api.activityView(qualifiedEmpty).toolCount, 0);
  assert.equal(api.activityView(qualifiedEmpty).count, 'No tool calls observed in the available captured history');
  const reconnecting = api.createState('reconnecting');
  assert.ok(reconnecting.rows.length > 0, 'reconnection retains cached rows');
  assert.ok(reconnecting.rows.every(row => row.sourceEpoch === reconnecting.sourceEpoch));
  assert.match(api.activityView(reconnecting).title, /cached history is not current/);
  assert.equal(api.activityView(reconnecting).toolCount, null);
});


test('known captured tool evidence rejects contradictory zero even in a forged view model', () => {
  for (const name of ['observed', 'capacity']) {
    const model = api.createState(name);
    assert.ok(model.rows.some(row => ['tool_call', 'tool_result'].includes(row.type)), name);
    const selected = api.transition(model, 'summaryCoverage', 'empty');
    assert.equal(selected.summaryCoverage, 'unavailable', name);
    assert.equal(api.activityView(selected).toolCount, null, name);
    const forged = api.activityView({ ...model, summaryCoverage: 'empty' });
    assert.equal(forged.toolCount, null, name);
    assert.equal(forged.count, 'Tool activity unavailable', name);
  }
});

test('proposal sidebar preserves the canonical task navigation and appearance while adapting only its active fixture', () => {
  const H = loadCatalog();
  const activeRow = /<a class="hd-task-row[^"]*is-active[^"]*"[\s\S]*?<\/a>/;
  const normalizeActive = html => html.replace(activeRow, '<active-task-fixture>');
  for (const name of ['observed', 'loading', 'reconnecting', 'capacity']) {
    const model = H.d2bProposal.createState(name);
    const canonical = H.templates[model.status === 'Running' ? 'task/running' : 'task/done'].match(/<aside class="hd-sidebar"[\s\S]*?<\/aside>/)[0];
    for (const [selection, resolved] of [['light', 'light'], ['dark', 'dark'], ['system', 'light'], ['system', 'dark']]) {
      const sidebar = H.d2bProposal.sidebarForState(model, selection, resolved);
      assert.equal(normalizeActive(sidebar), normalizeActive(H.fill(canonical.replace('href="#new"', 'href="#new-task/default"'), selection, resolved)), `${name}/${selection}/${resolved} preserves canonical sidebar outside active row`);
      assert.match(sidebar, /href="#new-task\/default"/);
      assert.doesNotMatch(sidebar, /href="#new"/);
      assert.equal((sidebar.match(/<aside class="hd-sidebar"/g) || []).length, 1);
      assert.equal((sidebar.match(/is-active/g) || []).length, 1);
      const active = sidebar.match(activeRow)[0];
      assert.match(active, new RegExp(`href="#${ROUTES[name]}"`));
      assert.match(active, />Fix slot release test</);
      for (const label of ['Running', 'Recent work', 'Settings', 'Appearance']) assert.ok(sidebar.includes(label), label);
      for (const icon of ['plus', 'hand', 'workflow', 'gauge', 'chart', 'settings']) assert.ok(sidebar.includes(`hd-i-${icon}`), icon);
      for (const mode of ['System', 'Light', 'Dark']) assert.ok(sidebar.includes(`aria-pressed="${String(selection === mode.toLowerCase())}" aria-label="${mode}"`), `${selection}/${mode}`);
      assert.ok(!sidebar.includes('{{'), 'sidebar has no theme placeholders');
      const filledTemplate = H.fill(H.templates[`d2b-proposal/${name}`], selection, resolved);
      assert.ok(!filledTemplate.includes('{{'), 'proposal host has no theme placeholders');
      for (const mode of ['system', 'light', 'dark']) assert.ok(filledTemplate.includes(`data-${mode}-on="${String(selection === mode)}"`), `${mode} selection survives host fill`);
      assert.equal((filledTemplate.match(/data-d2b-sidebar/g) || []).length, 1);
      assert.doesNotMatch(filledTemplate, /<aside class="hd-sidebar"/, 'proposal template has one mount placeholder instead of a duplicate static sidebar');
    }
  }
});

// ---- Transcript builders and controller (shared by the activity routes and the task transcript redraws) ----

const BUILDERS = ['statusHtml', 'controlsHtml', 'requestHtml', 'boundaryHtml', 'rowsHtml', 'asideSectionsHtml'];
const catalog = loadCatalog();
const regionsOf = model => {
  const T = catalog.d2bTranscript;
  return [T.statusHtml(model), T.requestHtml(model), T.boundaryHtml(model), T.rowsHtml(model), T.asideSectionsHtml(model), T.controlsHtml(model, true)].join('\u0001');
};

test('the transcript builders and the controller are pure and available without a document', () => {
  const T = catalog.d2bTranscript;
  assert.equal(typeof T.attach, 'function');
  for (const name of BUILDERS) assert.equal(typeof T[name], 'function', name);
  assert.equal(context.document, undefined);
  const model = api.createState('observed');
  assert.equal(regionsOf(model), regionsOf(model), 'a builder depends on its state only');
  assert.equal(model.status, 'Done');
  assert.match(T.requestHtml(model), /<details data-disclosure="request" class="hd-d2b-request" open>/);
  assert.match(T.boundaryHtml(model), /data-action="earlier"/);
  assert.match(T.asideSectionsHtml(model), /<h3>Recovered transcript<\/h3>/);
  assert.equal(T.controlsHtml(model, false).includes('data-variant="size"'), false, 'the size control is catalog-only for the activity routes');
  assert.equal(T.controlsHtml(model, true).includes('data-variant="size"'), true);
  for (const name of ['request', 'history', 'summaryCoverage']) assert.ok(T.controlsHtml(model, false).includes(`data-variant="${name}"`), name);
});

// The digest was computed from the output of the same builders after the activity routes were captured
// byte for byte in a headless browser, before and after the extraction.
test('builder markup for every activity fixture, variant and action is unchanged by the extraction', () => {
  const lines = [];
  for (const name of ['observed', 'loading', 'partial', 'unavailable', 'integrity-failed', 'reconnecting', 'capacity', 'events']) {
    const model = api.createState(name);
    const digest = value => crypto.createHash('sha256').update(value).digest('hex');
    lines.push(name + ':' + digest(regionsOf(model)));
    for (const dim of ['request', 'history', 'summaryCoverage', 'size']) for (const value of api.variants[dim]) lines.push(`${name}:${dim}:${value}:` + digest(regionsOf(api.transition(model, dim, value))));
    for (const action of ['read-more', 'earlier', 'new', 'retry', 'retry-request', 'rebase']) lines.push(`${name}:${action}:` + digest(regionsOf(api.transition(model, action))));
  }
  assert.equal(lines.length, 272);
  assert.equal(crypto.createHash('sha256').update(lines.join('\n')).digest('hex'), '75c6b696a4cdddbb10dca6c8171ba438a80251dcc2220d93c2d3fdb99a0ad173');
});

test('the controller tolerates missing slots and registers its handlers once', () => {
  const T = catalog.d2bTranscript;
  const listeners = [];
  const host = { addEventListener: (type, fn) => listeners.push(['add', type, fn]), removeEventListener: (type, fn) => listeners.push(['remove', type, fn]), querySelector: () => null, querySelectorAll: () => [] };
  const controller = T.attach(host, api.createState('capacity'), () => ({}), {});
  assert.deepEqual(listeners.map(x => x.slice(0, 2).join(':')), ['add:change', 'add:click']);
  assert.doesNotThrow(() => controller.render());
  assert.doesNotThrow(() => controller.refresh(controller.snapshot()));
  assert.doesNotThrow(() => controller.refresh(null));
  assert.equal(controller.state().name, 'capacity');
  controller.dispose();
  assert.deepEqual(listeners.slice(2).map(x => x.slice(0, 2).join(':')), ['remove:change', 'remove:click']);
});
