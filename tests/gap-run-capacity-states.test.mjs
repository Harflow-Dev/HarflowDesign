import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// Workflow run, resources and statistics states (approved 2026-11-15, except the three steering states drawn on that decision): registration, derivation from their approved
// bases, the copy they carry and the links they use.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptsDir = path.join(root, 'v2', 'scripts');
const OURS = ['states-run-actions.js', 'states-capacity-gaps.js'];

function loadRuntime(skip = []) {
  const context = vm.createContext({ window: {} });
  context.window = context;
  const scripts = fs.readdirSync(scriptsDir).filter(name => name !== 'catalog.js' && !skip.includes(name));
  for (const name of ['registry.js', ...scripts.filter(name => name !== 'registry.js')]) {
    vm.runInContext(fs.readFileSync(path.join(scriptsDir, name), 'utf8'), context, { filename: name });
  }
  return context.HFV2;
}
const H = loadRuntime();
const without = loadRuntime(OURS);

const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b/i;
const NOTE = 'Provisional · not approved';
const APPROVAL = { by: 'the owner', date: '2026-11-15', decision: 'Workflow and capacity states' };
const PROVISIONAL = new Set(['workflow-run/orchestrator-steering-waiting', 'workflow-run/orchestrator-steering-cancelling', 'workflow-run/orchestrator-steering-unknown']);
const INERT_LINKS = new Set(['#', '#new', '#revise-goal', '#install-antigravity', '#settings', '#needs-you', '#workflows', '#resources', '#statistics']);

// route -> [group, base, strings the template must carry]
const RUN = 'Messages and goal', RES = 'Resource states', STAT = 'Statistics states';
const STATES = {
  'workflow-run/orchestrator-selected': [RUN, 'workflow-run/on-demand', ['aria-label="Orchestrator, locked, selected"', 'Orchestrator is choosing the next node…', 'CONVERSATION', 'Message the orchestrator', 'Ask or tell the orchestrator', 'Answered']],
  'workflow-run/orchestrator-steering-open': [RUN, 'workflow-run/on-demand', ['Waiting for the orchestrator to respond', 'One conversation at a time — wait for the reply', 'textarea id="msg-orchestrator"']],
  'workflow-run/orchestrator-steering-unavailable': [RUN, 'workflow-run/on-demand', ['Answer the run\'s open question first.', 'href="#needs-you/waiting">Open Needs you']],
  'workflow-run/orchestrator-steering-waiting': [RUN, 'workflow-run/on-demand', ['Should the security reviewer run before or after the pull request opens?', 'The orchestrator asked a question. Reply to continue.', 'placeholder="Reply to the orchestrator"']],
  'workflow-run/orchestrator-steering-cancelling': [RUN, 'workflow-run/on-demand', ['hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Cancelling</span>', 'Messages are off — this run is cancelling', 'Cancelling the run…']],
  'workflow-run/orchestrator-steering-unknown': [RUN, 'workflow-run/on-demand', ['hd-msgq__caption">Delivery unknown', 'Harflow couldn&#39;t confirm the orchestrator received this message. It will not be sent again.', 'hd-msgq-host', 'Messages are off until delivery is settled']],
  'workflow-run/node-message-queued': [RUN, 'workflow-run/on-demand', ['hd-msgq__caption">Queued', 'hd-msgq__cancel', '>Send now</button>']],
  'workflow-run/node-message-refused': [RUN, 'workflow-run/on-demand', ['Send now isn\'t available. This operation can\'t be interrupted safely.', 'hd-msgq__cancel', '>Send now</button>']],
  'workflow-run/node-message-unavailable': [RUN, 'workflow-run/on-demand', ['Not called yet.', 'This node has no issued task or child workflow to message yet.', 'Docs checker, on demand node, not called, selected']],
  'workflow-run/messages-unsupported': [RUN, 'workflow-run/on-demand', ['placeholder="" disabled']],
  'workflow-run/revise-goal': [RUN, 'workflow-run/graph-needs-you', ['Goal · revision 2', 'Revised workflow goal', 'The original caller can also answer. Whichever answers first is used.', '>Cancel</a>', '>Save goal</button>']],
  'workflow-run/goal-revised': [RUN, 'workflow-run/graph-needs-you', ['Goal · revision 3', 'Assessment: in progress', '<details', 'Revision history', 'Revision 2', 'Revision 1', 'Revise goal…']],
  'workflow-run/revise-goal-unavailable': [RUN, 'workflow-run/graph-needs-you', ['Waiting for workers to finish.', 'class="hd-gap-link" disabled']],
  'workflow-run/revise-goal-answered-elsewhere': [RUN, 'workflow-run/graph-needs-you', ['Already answered by the caller', 'Answer excerpt', 'Your saved draft', 'hd-approval hd-approval--settled']],
  'workflow-run/revise-goal-failed': [RUN, 'workflow-run/graph-needs-you', ['Couldn\'t save the goal.', 'Your draft is preserved.', 'Revised workflow goal']],
  'resources/not-enabled': [RES, 'resources/slots', ['Resource slots are not enabled', 'The selected runtime has not enabled phase slots.', 'hd-empty']],
  'resources/unsupported': [RES, 'resources/slots', ['Resource slots are unsupported', 'The selected runtime does not support phase-slots.v1.']],
  'resources/unavailable': [RES, 'resources/slots', ['Resource slots are unavailable', 'The engine did not provide qualified resource observations.', '>Retry</button>']],
  'resources/unavailable-permission': [RES, 'resources/slots', ['Reading resource slots requires the local user that owns the runtime.', '>Retry</button>']],
  'resources/empty': [RES, 'resources/slots', ['No resource slots', 'No configured names or active reservations were reported in these observations.']],
  'resources/stale': [RES, 'resources/slots', ['Showing the last successful observations. Refresh failed.', 'hd-banner--warning', '>Retry</button>', 'Waiting for a slot']],
  'resources/over-capacity': [RES, 'resources/slots', ['3 of 2 in use · above capacity', 'hd-gap-cell--over', 'Regenerate API client', 'Phase capacity is overcommitted']],
  'statistics/empty': [STAT, 'statistics/overview', ['No finished work in this retained history.', 'Choose another range to look for retained finished work.']],
  'statistics/error': [STAT, 'statistics/overview', ['History is incomplete or unavailable. No totals are shown.', '>Retry</button>', 'hd-gap-empty--failed']],
  'statistics/stale': [STAT, 'statistics/overview', ['Showing the last complete snapshot. Refresh failed: the history read exceeded its time budget.', '>Retry refresh</button>', 'Tasks per day']],
  'statistics/partial-accounting': [STAT, 'statistics/overview', ['hd-gap-stat-value--unavailable">Unavailable', 'reported by 2 of 5 harnesses; the rest are left out, not counted as zero', 'Retained history only. Usage accounting: Partial · 212 of 284 independent executions · 340 execution records.']],
  'statistics/all-time': [STAT, 'statistics/overview', ['is-active" aria-pressed="true">All time', 'All retained history', 'Retention: 90 days; selected ranges may exceed retained history.']],
  'statistics/unsupported': [STAT, 'statistics/overview', ['Statistics are unavailable in this runtime', 'The installed runtime does not provide the statistics history. Update the Harflow runtime.']]
};
const ROUTES = Object.keys(STATES);
const stateOf = route => { const [family, id] = route.split('/'); return H.findState(H.findFamily(family), id); };

test('every state is registered (approved, or provisional for the three steering states drawn on the owner\'s decision), in its group, and listed in gapStates', () => {
  assert.equal(ROUTES.length, 28);
  for (const route of ROUTES) {
    const [group] = STATES[route];
    const [family] = route.split('/');
    const state = stateOf(route);
    assert.ok(state, `${route} is registered`);
    if (PROVISIONAL.has(route)) {
      assert.equal(state.status, 'provisional', route);
      assert.equal(state.approvalNote, NOTE, route);
      assert.ok(H.componentDocs[route].includes('Provisional, not approved.'), `${route} guide`);
    } else {
      assert.equal(state.status, 'approved', route);
      assert.deepEqual(JSON.parse(JSON.stringify(state.approval)), APPROVAL, route);
      assert.equal(state.approvalNote, undefined, route);
      assert.equal(H.approvalLine(H.findFamily(family), state), 'Approved by the owner on 2026-11-15 · Workflow and capacity states', route);
      assert.ok(H.componentDocs[route].startsWith('<p><strong>Approved by the owner · 2026-11-15.</strong>'), `${route} guide`);
    }
    assert.equal(state.group, group, route);
    assert.ok(H.findFamily(family).groups.includes(group), `${route} group is in its family`);
    assert.ok(H.gapStates.includes(route), `${route} is in gapStates`);
    assert.ok(H.componentDocs[route].includes('docs/decisions/README.md#workflow-and-capacity-states"'), `${route} decision link`);
  }
  for (const family of ['workflow-run', 'resources', 'statistics']) {
    const groups = H.findFamily(family).groups;
    assert.equal(groups.indexOf('Loading') > groups.findIndex(g => ['Messages and goal', 'Resource states', 'Statistics states'].includes(g)), true, `${family} group precedes Loading`);
  }
});

test('catalog text carries no milestone, proposal or gap vocabulary', () => {
  for (const route of ROUTES) {
    const state = stateOf(route);
    for (const text of [state.id, state.title, state.description, state.group, state.approvalNote || '', H.componentDocs[route].replace(/<[^>]*>/g, ' ')]) {
      assert.ok(!NAMING_RULE.test(text), `${route}: ${text.slice(0, 80)}`);
    }
    assert.ok(!/gap/i.test(`${state.title} ${state.description} ${state.group} ${H.approvalLine(H.findFamily(route.split('/')[0]), state)}`), `${route} carries no gap vocabulary`);
  }
});

test('templates exist, differ from their base and carry their key strings', () => {
  for (const route of ROUTES) {
    const [, base, strings] = STATES[route];
    const html = H.templates[route];
    assert.equal(typeof html, 'string', route);
    assert.notEqual(html, H.templates[base], `${route} differs from ${base}`);
    for (const text of strings) assert.ok(html.includes(text), `${route} carries: ${text}`);
    assert.ok(!/Duplicate|Rename/.test(html.slice(html.indexOf('<main'))), `${route} has no Duplicate or Rename`);
  }
});

test('the base templates are unchanged by these scripts', () => {
  for (const base of new Set(Object.values(STATES).map(s => s[1]))) {
    assert.equal(H.templates[base], without.templates[base], base);
  }
  assert.equal(Object.keys(H.templates).filter(k => !(k in without.templates) && !ROUTES.includes(k) && !H.gapStates.includes(k)).length, 0);
});

test('queued node messages reuse the approved queued bubble and Send now control', () => {
  const queued = H.templates['workflow-run/node-message-queued'];
  assert.ok(queued.includes('hd-msgq-host'));
  assert.ok(queued.includes(H.laneParts.queue([{ kind: 'queued', text: 'Also check whether the lockfile pins a vulnerable transitive dependency.' }])));
  assert.equal(queued.match(/>Send now<\/button>/g).length, 1);
  const refused = H.templates['workflow-run/node-message-refused'];
  const queuedBubbles = refused.match(/<span class="hd-msgq__caption">Queued<\/span>/g) || [];
  assert.equal(queuedBubbles.length, 1, 'the refused message stays queued');
  assert.ok(refused.includes('hd-msgq__cancel'), 'Cancel stays available');
});

test('the orchestrator composer is locked while a message is in flight, refused or cancelling, and open otherwise', () => {
  for (const id of ['orchestrator-selected', 'orchestrator-steering-waiting']) {
    const html = H.templates[`workflow-run/${id}`];
    assert.ok(!/<textarea id="msg-orchestrator"[^>]*disabled/.test(html), `${id} is open`);
  }
  for (const id of ['orchestrator-steering-open', 'orchestrator-steering-unavailable', 'orchestrator-steering-cancelling', 'orchestrator-steering-unknown']) {
    const html = H.templates[`workflow-run/${id}`];
    assert.ok(/<textarea id="msg-orchestrator"[^>]*disabled/.test(html), id);
    assert.ok(/composer__send" aria-label="Send to the orchestrator" disabled/.test(html), id);
  }
});

test('resources and statistics gain no search or filter controls, and never show zero for missing cost', () => {
  for (const route of ROUTES.filter(r => !r.startsWith('workflow-run/'))) {
    const base = STATES[route][1];
    const count = (html, re) => (html.match(re) || []).length;
    for (const re of [/type="search"/g, /hd-i-search/g, /hd-i-filter/g, /<select/g]) {
      assert.equal(count(H.templates[route], re), count(H.templates[base], re), `${route} ${re}`);
    }
  }
  const partial = H.templates['statistics/partial-accounting'];
  assert.ok(!/\$0(\.00)?\b/.test(partial.slice(partial.indexOf('<main'))), 'no $0 cost');
  assert.equal((partial.match(/hd-faint">Unavailable</g) || []).length, 3, 'three harnesses without cost stay Unavailable');
});

test('statistics all-time moves the active range and nothing else of the range selector', () => {
  const html = H.templates['statistics/all-time'];
  assert.equal((html.match(/hd-seg__item is-active/g) || []).length, 1);
  assert.ok(!html.includes('is-active" aria-pressed="true">30 days'));
});

test('every hash link resolves to a registered route or an allowed inert link', () => {
  const routeSet = new Set(H.stateKeys());
  for (const route of ROUTES) {
    const hrefs = [...H.templates[route].matchAll(/href="(#[^"]*)"/g)].concat([...H.componentDocs[route].matchAll(/href="(#[^"]*)"/g)]);
    for (const [, href] of hrefs) {
      if (INERT_LINKS.has(href)) continue;
      assert.match(href, /^#[a-z0-9-]+\/[a-z0-9-]+(\/(light|dark|system))?$/, `${route}: ${href}`);
      const target = H.resolveRoute(href).replace(/\/(light|dark|system)$/, '').slice(1);
      assert.ok(routeSet.has(target), `${route}: ${href} resolves to unregistered ${target}`);
      assert.ok(!(target in H.routeRedirects), `${route}: ${href} settles on a retired route`);
    }
  }
});

test('the new glyphs are the canonical pairs', () => {
  const pairs = { running: '', done: 'hd-i-check', failed: 'hd-i-x', cancelled: 'hd-i-stop', attention: 'hd-i-hand' };
  for (const route of ROUTES) {
    const html = H.templates[route];
    const main = html.slice(html.indexOf('<main'));
    for (const [, kind, inner] of main.matchAll(/<span class="hd-glyph hd-glyph--(running|done|failed|cancelled|attention)"[^>]*>((?:<span[^>]*><\/span>)?)<\/span>/g)) {
      const icon = inner.match(/hd-i-([a-z]+)/);
      assert.equal(icon ? 'hd-i-' + icon[1] : '', pairs[kind], `${route} ${kind} glyph`);
    }
  }
});

test('goal cards do not shrink inside the pane', () => {
  for (const id of ['revise-goal', 'goal-revised', 'revise-goal-failed', 'revise-goal-answered-elsewhere']) {
    const html = H.templates[`workflow-run/${id}`];
    assert.ok(html.includes('aria-label="Approval needed" style="flex:none;"'), id);
  }
  assert.ok(H.templates['workflow-run/revise-goal-answered-elsewhere'].includes('aria-label="Goal answered elsewhere" style="flex:none;"'));
});

test('cancelling drops Pause and Cancel run, and delivery unknown is not offered Cancel or Send now', () => {
  const base = H.templates['workflow-run/on-demand'];
  assert.ok(base.includes('Cancel run') && base.includes(' Pause</button>'));
  const cancelling = H.templates['workflow-run/orchestrator-steering-cancelling'];
  const bar = cancelling.slice(cancelling.indexOf('<div class="hd-topbar">'), cancelling.indexOf('<div class="hd-standalone"'));
  assert.ok(!bar.includes('Cancel run') && !bar.includes('Pause') && bar.includes('Cancelling'));
  const unknown = H.templates['workflow-run/orchestrator-steering-unknown'];
  assert.ok(!unknown.includes('hd-msgq__cancel') && !unknown.includes('Send now'));
  const waiting = H.templates['workflow-run/orchestrator-steering-waiting'];
  assert.ok(!waiting.slice(waiting.indexOf('<aside class="hd-pane"')).includes('hd-glyph--attention'), 'no Needs you glyph in the pane');
});
