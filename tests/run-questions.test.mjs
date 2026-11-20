import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// The workflow run drawings for the four questions the owner decided on 2026-11-20: registration, derivation from their
// approved bases, the copy they carry, the retired top bar states and their decision records. All are approved.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptsDir = path.join(root, 'v2', 'scripts');

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
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b|\bslice\b/i;
const NOTE = 'Provisional · not approved';
const DATE = '2026-11-20';

// id -> [group, base, record, strings the template carries, provisional]
const Q1 = 'Run top bar', Q2 = 'Run pane', Q3 = 'Messages and goal', Q4 = 'Run message locks';
const APPROVAL = {
  'run-top-bar': 'Run top bar', 'parallel-run-pane': 'Run pane',
  'orchestrator-steering-held': 'Orchestrator conversation', 'run-message-locks': 'Run message locks'
};
const STATES = {
  'topbar-no-more': [Q1, 'workflow-run/graph-needs-you', 'run-top-bar', ['Run started 02:00 · HarflowMCP']],
  'parallel-run-pane': [Q2, 'workflow-run/parallel', 'parallel-run-pane', ['aria-label="Run"', 'style="width: 288px;"', 'GOAL', 'Original request', 'RUN PLAN', 'Technical plan', 'hd-lanes', 'aria-label="Hide right pane"']],
  'parallel-run-pane-collapsed': [Q2, 'workflow-run/parallel', 'parallel-run-pane', ['aria-label="Show right pane"', 'hd-lanes']],
  'graph-no-selection': [Q2, 'workflow-run/graph-needs-you', 'parallel-run-pane', ['aria-label="Run"', 'style="width: 288px;"', 'GOAL', 'Original request', 'RUN PLAN', 'Technical plan', 'Run started 02:00 · HarflowMCP', 'aria-label="Hide right pane"']],
  'orchestrator-steering-stale': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['The run moved on since this conversation started.', 'Your next message starts a new conversation.', '>Dismiss</button>', 'Needs you</span>']],
  'orchestrator-steering-expired': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['This conversation expired after 30 minutes.', 'Your next message starts a new conversation.', '>Dismiss</button>', 'Needs you</span>']],
  'orchestrator-steering-command-refused': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['The orchestrator couldn\'t carry out that request. Reply to continue.', 'Reason: ', '>Dismiss</button>', 'Needs you</span>', 'placeholder="Reply to the orchestrator" style="min-height:24px;"']],
  'orchestrator-steering-dismissing': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['Dismissing — waiting for running work to settle', 'disabled style="min-height:40px;"']],
  'orchestrator-steering-dismissed': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['Conversation dismissed', 'Resume</button>', 'No qualified actionable checkpoint is available; refresh the workflow.', 'Paused</span>']],
  'lanes-completed': [Q4, 'workflow-run/parallel', 'run-message-locks', ['hd-badge--done', 'Messages are off — this run is complete', 'Done · 02:51']],
  'lanes-cancelling': [Q4, 'workflow-run/parallel', 'run-message-locks', ['Cancelling</span>', 'Messages are off — this run is cancelling', 'hd-msgq__cancel']],
  'cancelled-node-locked': [Q4, 'workflow-run/on-demand', 'run-message-locks', ['hd-i-stop" aria-hidden="true"></span>Cancelled</span>', 'Messages are off — this run was cancelled']],
  'cancelled-orchestrator-locked': [Q4, 'workflow-run/orchestrator-selected', 'run-message-locks', ['hd-i-stop" aria-hidden="true"></span>Cancelled</span>', 'Messages are off — this run was cancelled']],
  'lanes-unsupported': [Q4, 'workflow-run/parallel', 'run-message-locks', ['placeholder="" disabled']]
};
const IDS = Object.keys(STATES);
const PROVISIONAL = IDS.filter(id => STATES[id][4]);
const RETIRED = ['topbar-started', 'topbar-counts', 'topbar-more-actions', 'topbar-more-actions-disabled'];
const family = H.findFamily('workflow-run');
const read = id => H.templates[`workflow-run/${id}`];

test('fourteen states, each with a minimum twin, are registered in their groups; all approved', () => {
  assert.equal(IDS.length, 14);
  assert.deepEqual(PROVISIONAL, []);
  assert.equal(H.runQuestionStates.length, 28);
  for (const id of IDS) {
    const [group, , record] = STATES[id];
    const full = H.findState(family, id), small = H.findState(family, id + '-minimum');
    assert.ok(full && small, id);
    assert.equal(full.group, group, id);
    assert.equal(small.group, 'Minimum window', id);
    for (const state of [full, small]) {
      if (PROVISIONAL.includes(id)) {
        assert.equal(state.status, 'provisional', `${state.id} is provisional`);
        assert.equal(state.approvalNote, NOTE);
        assert.equal(H.approvalLine(family, state), NOTE);
        assert.ok(!('approval' in state), `${state.id} carries no approval`);
      } else {
        assert.equal(state.status, 'approved', `${state.id} is approved`);
        assert.deepEqual({ ...state.approval }, { by: 'the owner', date: DATE, decision: APPROVAL[record] }, `${state.id} approval`);
        assert.ok(!('approvalNote' in state), `${state.id} carries no approval note`);
        assert.equal(H.approvalLine(family, state), `Approved by the owner on ${DATE} · ${APPROVAL[record]}`);
      }
    }
    assert.equal(small.specimenSize, '1000 × 620');
    assert.deepEqual({ ...small.source }, { renderer: 'runQuestions', mount: id + '-minimum' });
    assert.equal(H.describe(`workflow-run/${id}-minimum`).mount, id + '-minimum');
    assert.ok(H.RENDERERS.runQuestions && typeof H.runQuestions.mount === 'function');
  }
  for (const group of [Q1, Q2, Q4]) assert.ok(family.groups.includes(group), group);
  assert.ok(!family.groups.includes('Parallel view'), 'the group is named for the pane, since it holds a Graph view state too');
});

test('each state is its approved base with only the changed blocks swapped, and its twin differs only in the frame size', () => {
  for (const id of IDS) {
    const [, base, , strings] = STATES[id];
    const html = read(id);
    assert.equal(typeof html, 'string', id);
    assert.ok(html.includes('{{theme}}'), `${id} keeps the theme placeholder`);
    assert.notEqual(html, H.templates[base], `${id} differs from ${base}`);
    for (const text of strings) assert.ok(html.includes(text), `${id} carries ${text}`);
    assert.equal(read(id + '-minimum'), html.replace('width: 100%; height: 800px;', 'width: 1000px; height: 620px;'), `${id} twin`);
    assert.ok(!html.includes('slice'), `${id} says nothing about slices`);
    assert.ok(!/\{\{(?!theme\}\}|systemOn\}\}|lightOn\}\}|darkOn\}\})[^}]*\}\}/.test(html), `${id} has no stray placeholder`);
  }
});

test('the chosen run top bar replaces the step count and keeps no More actions', () => {
  const base = H.templates['workflow-run/graph-needs-you'];
  assert.ok(base.includes('Step 2 of 4 · 06:31') && base.includes('hd-task-row__meta">2/4'), 'the approved state is unchanged');
  const html = read('topbar-no-more');
  assert.ok(!html.includes('Step 2 of 4') && !html.includes('hd-task-row__meta">2/4'));
  assert.ok(html.includes('hd-task-row__meta">06:31'), 'the sidebar row shows the elapsed time');
  assert.ok(!html.includes('More actions'), 'no More actions button');
  assert.ok(html.includes('Pause</button>') && html.includes('>Cancel run</button>'));
  assert.ok(!/right pane/i.test(html), 'the step pane is the approved one, so it draws no run pane toggle');
});

test('the four top bar states the owner did not choose are retired and open the chosen one', () => {
  const routes = new Set(H.registry.families.flatMap(f => f.states.map(s => `${f.id}/${s.id}`)));
  for (const id of RETIRED) for (const suffix of ['', '-minimum']) {
    const route = `workflow-run/${id}${suffix}`;
    assert.ok(!routes.has(route), `${route} is no longer registered`);
    assert.ok(!(route in H.templates), `${route} keeps no template`);
    assert.ok(!(route in H.componentDocs), `${route} keeps no guide`);
    assert.equal(H.routeRedirects[route], `workflow-run/topbar-no-more${suffix}`);
    assert.equal(H.resolveRoute(`#${route}/dark`), `#workflow-run/topbar-no-more${suffix}/dark`);
    const entry = H.retired.find(e => e.route === route);
    assert.equal(entry.pins, `${route} at eadd22d`);
    assert.match(entry.basis, /^Owner decision 2026-11-20: /);
    assert.ok(!H.runQuestionStates.includes(route));
  }
  assert.ok(routes.has('workflow-run/topbar-no-more') && routes.has('workflow-run/topbar-no-more-minimum'));
  assert.ok(!('topbar-more-actions-disabled' in {}) && !Object.values(H.templates).some(html => typeof html === 'string' && html.includes('hd-rq-menu')), 'no menu markup remains');
});

test('the run pane has a toggle that matches the task screen, is on while the pane shows and off while it is hidden', () => {
  const on = 'class="hd-btn hd-btn--icon hd-btn--sm hd-rq-toggle is-active" aria-pressed="true" aria-label="Hide right pane" title="Hide right pane"';
  const off = 'class="hd-btn hd-btn--icon hd-btn--sm hd-rq-toggle" aria-pressed="false" aria-label="Show right pane" title="Show right pane"';
  for (const id of ['parallel-run-pane', 'graph-no-selection']) {
    const html = read(id);
    assert.equal(html.split(on).length, 2, `${id} has one toggle, on`);
    assert.ok(html.includes('hd-i-panel-right'));
    assert.ok(html.includes('<aside class="hd-pane" style="width: 288px;" aria-label="Run">'), id);
    assert.ok(html.includes('hd-task-row__meta">06:31') && !html.includes('hd-task-row__meta">2/4'), `${id} shows the elapsed time`);
  }
  const collapsed = read('parallel-run-pane-collapsed');
  assert.equal(collapsed.split(off).length, 2, 'one toggle, off');
  assert.ok(!collapsed.includes('<aside class="hd-pane"') && !collapsed.includes('hd-rq-lanes') && !collapsed.includes('hd-split'), 'no pane, the lanes keep the full width');
  assert.equal(collapsed.match(/<section class="hd-lane"/g).length, 3);
  for (const id of IDS.filter(id => !['parallel-run-pane', 'parallel-run-pane-collapsed', 'graph-no-selection'].includes(id))) assert.ok(!/right pane/i.test(read(id)), `${id} draws no run pane toggle`);
  // The toggle follows the Mac task screen: the same labels, and the toggle sits after Cancel run, at the right end of the bar.
  const bar = read('parallel-run-pane').split('<div class="hd-lanes">')[0];
  assert.ok(bar.indexOf('Cancel run') < bar.indexOf('Hide right pane'));
});

test('the Graph view with no step selected draws the run pane and no selected step', () => {
  const html = read('graph-no-selection');
  const base = H.templates['workflow-run/graph-needs-you'];
  assert.ok(base.includes('hd-node hd-node--waiting is-selected"') && base.includes('aria-label="Selected step"'));
  assert.ok(!html.includes('is-selected') && !html.includes('Selected step'), 'no step is selected and no step pane is drawn');
  assert.ok(html.includes('hd-canvas') && html.includes('hd-standalone'), 'the canvas and standalone strip are the base ones');
  assert.ok(html.includes('aria-label="Workflow steps: Scan lockfiles, Draft upgrade plan, Open pull request, Notify"'));
  assert.ok(html.indexOf('Original request') < html.indexOf('>GOAL<') && html.indexOf('>GOAL<') < html.indexOf('RUN PLAN') && html.indexOf('RUN PLAN') < html.indexOf('Technical plan'));
  assert.ok(!html.includes('More actions') && !html.includes('Step 2 of 4'));
  for (const step of ['Scan lockfiles', 'Draft upgrade plan', 'Open pull request', 'Notify']) assert.ok(html.slice(html.indexOf('hd-rq-plan')).includes(`<span>${step}</span>`), step);
});

test('the held conversation states carry Dismiss and one Needs you badge, except the dismissed run', () => {
  const dismiss = '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Dismiss</button>';
  const bar = html => html.slice(html.indexOf('<div class="hd-topbar">'), html.indexOf('<div class="hd-standalone"'));
  for (const id of ['orchestrator-steering-stale', 'orchestrator-steering-expired', 'orchestrator-steering-command-refused']) {
    const html = read(id);
    assert.ok(html.includes('placeholder="') && /<textarea id="msg-orchestrator"(?![^>]*disabled)/.test(html), `${id} composer is open`);
    assert.ok(!html.includes('>Start again<'), `${id} has no standalone Start again`);
    assert.equal(html.split(dismiss).length, 2, `${id} has one Dismiss`);
    assert.ok(bar(html).includes('hd-badge--attention') && bar(html).includes('Needs you</span>') && !bar(html).includes('Paused'), `${id} is Needs you`);
    assert.ok(bar(html).includes('Pause</button>') && bar(html).includes('>Cancel run</button>'), `${id} keeps Pause and Cancel run as the approved held states do`);
  }
  assert.ok(!read('orchestrator-steering-stale').includes('The run is paused.') && !read('orchestrator-steering-expired').includes('stays paused'));
  assert.ok(read('orchestrator-steering-dismissing').includes('hd-i-lock') && !read('orchestrator-steering-dismissing').includes('>Dismiss<'));
  assert.ok(bar(read('orchestrator-steering-dismissing')).includes('Needs you</span>'), 'the run is not paused while a turn settles');
  const dismissed = read('orchestrator-steering-dismissed');
  assert.match(dismissed, /<button type="button" class="hd-btn hd-btn--ghost" disabled aria-describedby="rq-resume-reason">[\s\S]*Resume<\/button>/);
  assert.ok(bar(dismissed).includes('Paused</span>') && !dismissed.includes('>Dismiss<'), 'a dismissed run is parked, no longer held');
  assert.ok(dismissed.includes('placeholder="Ask or tell the orchestrator" style="min-height:24px;"'));
  const refused = read('orchestrator-steering-command-refused');
  assert.ok(refused.includes('Replace the Security reviewer with a custom checker.') && refused.includes('The request could not be applied to the current run.'));
});

// sha1 of the three approved templates at eadd22d, before Dismiss was added. None has a minimum twin.
const DIGESTS_EADD22D = {
  'orchestrator-steering-open': 'a218965b38169bcefbc392a974960db29a6b05d1',
  'orchestrator-steering-waiting': '9ceb3a3d1180cfe3caa4a71eb4b7d39b720e9547',
  'orchestrator-steering-unknown': 'd8aa4243277a481adddfe85067f7c92c8be0138c'
};
test('Dismiss is added to the approved open, waiting and unknown states and nothing else of them changes', () => {
  const dismiss = '<div class="hd-row" style="gap:var(--space-2);"><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Dismiss</button></div>';
  const amended = ['orchestrator-steering-open', 'orchestrator-steering-waiting', 'orchestrator-steering-unknown'];
  for (const id of amended) {
    const html = read(id);
    const state = H.findState(family, id);
    assert.equal(state.status, 'approved');
    assert.deepEqual({ ...state.approval }, { by: 'the owner', date: '2026-11-15', decision: 'Workflow and capacity states' }, `${id} keeps its approval`);
    assert.equal(html.split(dismiss).length, 2, `${id} has one Dismiss`);
    // Removing the row leaves the approved drawing: the row is the last item of the conversation, before its section closes.
    const without = html.replace(dismiss, '');
    assert.ok(!without.includes('Dismiss'));
    assert.equal(crypto.createHash('sha1').update(without).digest('hex'), DIGESTS_EADD22D[id], `${id} without Dismiss is its eadd22d drawing`);
    assert.ok(!H.findState(family, id + '-minimum'), `${id} has no minimum twin`);
    assert.ok(html.indexOf(dismiss) < html.indexOf('<textarea id="msg-orchestrator"'), `${id} Dismiss is in the pane body, above the composer`);
    assert.ok(H.componentDocs[`workflow-run/${id}`].includes('Dismiss was added'), `${id} guide names the amendment`);
    assert.ok(H.componentDocs[`workflow-run/${id}`].startsWith('<p><strong>Approved by the owner · 2026-11-15.</strong>'));
  }
  for (const id of ['orchestrator-selected', 'orchestrator-steering-unavailable', 'orchestrator-steering-cancelling']) assert.ok(!read(id).includes('Dismiss'), `${id} is unchanged`);
});

test('lane and node locks follow the run status', () => {
  const lanes = id => read(id);
  const locked = (html, text) => (html.match(new RegExp(`placeholder="${text}" disabled`, 'g')) || []).length;
  assert.equal(locked(lanes('lanes-completed'), 'Messages are off — this run is complete'), 3);
  assert.equal(locked(lanes('lanes-cancelling'), 'Messages are off — this run is cancelling'), 2);
  assert.ok(lanes('lanes-cancelling').includes('hd-msgq__cancel'), 'a queued message keeps Cancel while cancelling');
  assert.ok(!lanes('lanes-completed').includes('>Pause<') && !lanes('lanes-cancelling').includes('>Pause<'));
  assert.equal(locked(lanes('cancelled-node-locked'), 'Messages are off — this run was cancelled'), 1);
  assert.equal(locked(lanes('cancelled-orchestrator-locked'), 'Messages are off — this run was cancelled'), 1);
  assert.equal((lanes('lanes-unsupported').match(/placeholder="" disabled style="min-height:24px;"/g) || []).length, 2);
  for (const id of ['lanes-completed', 'lanes-cancelling', 'cancelled-node-locked', 'cancelled-orchestrator-locked', 'lanes-unsupported']) {
    assert.ok(!/Messages are off — this run was cancelled[\s\S]*Messages are off — this run is complete/.test(lanes(id)), id);
  }
});

test('badges and glyphs are the canonical ones and the status words are in the closed vocabulary', () => {
  const vocabulary = new Set(['Running', 'Settling', 'Done', 'Failed', 'Timed out', 'Cancelled', 'Pending', 'Needs you', 'Starting', 'Paused', 'Cancelling']);
  for (const id of IDS) {
    const html = read(id);
    for (const [, word] of html.matchAll(/<span class="hd-badge[^"]*">(?:<span[^>]*><\/span>)?([A-Za-z ]+)<\/span>/g)) assert.ok(vocabulary.has(word), `${id}: ${word}`);
    for (const [, glyph] of html.matchAll(/hd-glyph[^"]*" aria-label="([^"]+)"/g)) assert.ok(vocabulary.has(glyph) || glyph === 'Parallel group, running', `${id}: glyph ${glyph}`);
  }
  assert.ok(read('lanes-completed').includes('hd-badge hd-badge--done"><span class="hd-i hd-i-check"'));
  assert.ok(read('orchestrator-steering-stale').includes('hd-badge hd-badge--attention"><span class="hd-i hd-i-hand"'));
  assert.ok(read('orchestrator-steering-dismissed').includes('hd-badge hd-badge--warning"><span class="hd-i hd-i--sm hd-i-pause"'));
});

test('catalog text names the screen only and the guides link to existing records', () => {
  const records = new Set(Object.values(STATES).map(x => x[2]));
  assert.equal(records.size, 4);
  for (const id of IDS) for (const state of [H.findState(family, id), H.findState(family, id + '-minimum')]) {
    for (const field of ['id', 'title', 'description', 'group', 'approvalNote']) assert.ok(!NAMING_RULE.test(state[field] || ''), `${state.id} ${field}`);
    if (state.approval) assert.ok(!NAMING_RULE.test(state.approval.decision), `${state.id} decision`);
    const guide = H.componentDocs[`workflow-run/${state.id}`];
    const lead = PROVISIONAL.includes(id) ? '<p><strong>Provisional, not approved.</strong>' : `<p><strong>Approved by the owner · ${DATE}.</strong>`;
    assert.ok(guide.startsWith(lead), state.id);
    assert.ok(!NAMING_RULE.test(guide.replace(/<[^>]*>/g, ' ')), `${state.id} guide`);
    const link = guide.match(/href="docs\/decisions\/([a-z-]+\.md)"/);
    assert.ok(link && fs.existsSync(path.join(root, 'v2', 'docs', 'decisions', link[1])), `${state.id} links to a record`);
  }
  const owners = { 'run-top-bar': 'Run top bar', 'parallel-run-pane': 'Run pane', 'orchestrator-steering-held': 'Orchestrator conversation', 'run-message-locks': 'Run message locks' };
  for (const record of records) {
    const text = fs.readFileSync(path.join(root, 'v2', 'docs', 'decisions', `${record}.md`), 'utf8');
    for (const heading of ['Source', 'States', 'Owner answers \\(2026-11-20\\)', 'What the app would change', 'Files']) {
      assert.match(text, new RegExp(`^## ${heading}$`, 'm'), `${record} has ${heading}`);
    }
    assert.ok(text.startsWith(`# ${owners[record]}\n`), `${record} is titled for the decision label`);
    assert.match(text, /^Status: \*\*Approved by the owner on 2026-11-20\*\*/m, record);
    assert.ok(text.includes('`eadd22d`') && text.includes('approved in the commit titled "Approve the workflow-run question states"'), record);
    assert.ok(!/^## (Recommendations|Owner questions)\b/m.test(text), `${record} no longer lists open questions`);
  }
  const pane = fs.readFileSync(path.join(root, 'v2', 'docs', 'decisions', 'parallel-run-pane.md'), 'utf8');
  assert.ok(pane.includes('inaccurate at 360a67c4') && pane.includes('HSplitView') && pane.includes('cannot be hidden today') && pane.includes('confirmed "Add the toggle" on 2026-11-20'));
  assert.ok(pane.includes('new behaviour, not parity') && pane.includes('TaskDetailToolbar.swift:178-185'));
  assert.ok(!pane.includes('Only if the owner confirms') && /^- Add the toggle to the run top bar/m.test(pane));
  assert.ok(!/## Source\n\n\n/.test(pane));
  assert.ok(fs.readFileSync(path.join(root, 'v2', 'docs', 'decisions', 'orchestrator-steering-held.md'), 'utf8').includes('Nothing in this record is provisional.'));
  const top = fs.readFileSync(path.join(root, 'v2', 'docs', 'decisions', 'run-top-bar.md'), 'utf8');
  assert.ok(top.includes('Approved v2 drawings this decision supersedes as the app reference (not edited):') && top.includes('cancelled-node-locked'));
  for (const id of RETIRED) assert.ok(top.includes(`workflow-run/${id}`), `${id} is named under Not chosen`);
  const readme = fs.readFileSync(path.join(root, 'v2', 'docs', 'decisions', 'README.md'), 'utf8');
  assert.ok(readme.includes('`orchestrator-steering-open`, `-waiting` and `-unknown` (approved 2026-11-15) amended with Dismiss'), 'the decisions README records the amendment');
});

test('the minimum twins reuse the existing minimum treatments and clean up after themselves', () => {
  const applied = [];
  const classes = new Set();
  const root_ = {
    classList: { add: (...names) => names.forEach(n => classes.add(n)), remove: (...names) => names.forEach(n => classes.delete(n)) },
    querySelectorAll: () => [], __hdcMinEscape: null
  };
  const original = H.applyMinimum;
  H.applyMinimum = (host, fixes) => { applied.push(fixes); fixes.forEach(f => host.classList.add(`hdc-min-${f}`)); };
  try {
    const stop = H.runQuestions.mount(root_, 'topbar-no-more-minimum');
    assert.deepEqual(JSON.parse(JSON.stringify(applied[0])), ['sidebar', 'canvas', 'topbar-meta']);
    assert.ok(classes.has('hdc-specimen--minimum') && classes.has('hd-rq-min--graph') && !classes.has('hd-rq-min--run'));
    stop();
    assert.equal(classes.size, 0);
    const stopRun = H.runQuestions.mount(root_, 'graph-no-selection-minimum');
    assert.ok(classes.has('hd-rq-min--graph') && classes.has('hd-rq-min--run'), 'the Graph run pane keeps its own width rule');
    stopRun();
    assert.equal(classes.size, 0);
    H.runQuestions.mount(root_, 'lanes-completed-minimum')();
    assert.deepEqual(JSON.parse(JSON.stringify(applied[2])), ['sidebar', 'lanes', 'topbar-meta']);
    H.runQuestions.mount(root_, 'parallel-run-pane-collapsed-minimum')();
    assert.deepEqual(JSON.parse(JSON.stringify(applied[3])), ['sidebar', 'lanes', 'topbar-meta']);
  } finally { H.applyMinimum = original; }
  const css = fs.readFileSync(path.join(root, 'v2', 'styles', 'run-questions.css'), 'utf8');
  assert.match(css, /flex:1 0 400px;min-width:400px/);
  assert.match(css, /min-width:220px;max-width:500px/);
  assert.match(css, /hd-rq-min--run \.hd-split>\.hd-pane\{flex:0 1 288px!important\}/);
  assert.ok(!/hd-rq-menu|hd-rq-anchor/.test(css), 'the menu rules are gone with the menu');
});
