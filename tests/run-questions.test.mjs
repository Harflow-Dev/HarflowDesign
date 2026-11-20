import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// The provisional workflow run drawings for the four open questions (2026-11-20): registration, derivation from their
// approved bases, the copy they carry and their decision records.
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

// id -> [group, base, record, strings the template carries]
const Q1 = 'Run top bar', Q2 = 'Parallel view', Q3 = 'Messages and goal', Q4 = 'Run message locks';
const STATES = {
  'topbar-started': [Q1, 'workflow-run/graph-needs-you', 'run-top-bar', ['Run started 02:00 · HarflowMCP', 'aria-label="More actions"']],
  'topbar-counts': [Q1, 'workflow-run/graph-needs-you', 'run-top-bar', ['Run started 02:00 · 4 finished · 1 active']],
  'topbar-no-more': [Q1, 'workflow-run/graph-needs-you', 'run-top-bar', ['Run started 02:00 · HarflowMCP']],
  'topbar-more-actions': [Q1, 'workflow-run/graph-needs-you', 'run-top-bar', ['role="menu" aria-label="More actions"', 'Revise goal…', 'Copy run ID', 'Cancel run</button>']],
  'topbar-more-actions-disabled': [Q1, 'workflow-run/parallel', 'run-top-bar', ['Revise goal…', 'aria-disabled="true"', 'Goal revision requires a paused or awaiting-input checkpoint', 'Copy run ID']],
  'parallel-run-pane': [Q2, 'workflow-run/parallel', 'parallel-run-pane', ['aria-label="Run"', 'style="width: 288px;"', 'GOAL', 'Original request', 'RUN PLAN', 'Technical plan', 'hd-lanes']],
  'orchestrator-steering-stale': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['The run moved on since this conversation started.', 'Your next message starts a new conversation.', '>Dismiss</button>', 'Paused</span>']],
  'orchestrator-steering-expired': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['This conversation expired after 30 minutes.', 'Your next message starts a new conversation.', '>Dismiss</button>', 'Paused</span>']],
  'orchestrator-steering-dismissing': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['Dismissing — waiting for running work to settle', 'disabled style="min-height:40px;"']],
  'orchestrator-steering-dismissed': [Q3, 'workflow-run/orchestrator-selected', 'orchestrator-steering-held', ['Conversation dismissed', 'Resume</button>', 'No qualified actionable checkpoint is available; refresh the workflow.', 'Paused</span>']],
  'lanes-completed': [Q4, 'workflow-run/parallel', 'run-message-locks', ['hd-badge--done', 'Messages are off — this run is complete', 'Done · 02:51']],
  'lanes-cancelling': [Q4, 'workflow-run/parallel', 'run-message-locks', ['Cancelling</span>', 'Messages are off — this run is cancelling', 'hd-msgq__cancel']],
  'cancelled-node-locked': [Q4, 'workflow-run/on-demand', 'run-message-locks', ['hd-i-stop" aria-hidden="true"></span>Cancelled</span>', 'Messages are off — this run was cancelled']],
  'cancelled-orchestrator-locked': [Q4, 'workflow-run/orchestrator-selected', 'run-message-locks', ['hd-i-stop" aria-hidden="true"></span>Cancelled</span>', 'Messages are off — this run was cancelled']],
  'lanes-unsupported': [Q4, 'workflow-run/parallel', 'run-message-locks', ['placeholder="" disabled']]
};
const IDS = Object.keys(STATES);
const family = H.findFamily('workflow-run');

test('fifteen provisional states, each with a minimum twin, are registered in their question groups', () => {
  assert.equal(IDS.length, 15);
  assert.equal(H.runQuestionStates.length, 30);
  for (const id of IDS) {
    const [group] = STATES[id];
    const full = H.findState(family, id), small = H.findState(family, id + '-minimum');
    assert.ok(full && small, id);
    assert.equal(full.group, group, id);
    assert.equal(small.group, 'Minimum window', id);
    for (const state of [full, small]) {
      assert.equal(state.status, 'provisional', `${state.id} is provisional`);
      assert.equal(state.approvalNote, NOTE);
      assert.equal(H.approvalLine(family, state), NOTE);
      assert.ok(!('approval' in state), `${state.id} carries no approval`);
    }
    assert.equal(small.specimenSize, '1000 × 620');
    assert.deepEqual({ ...small.source }, { renderer: 'runQuestions', mount: id + '-minimum' });
    assert.equal(H.describe(`workflow-run/${id}-minimum`).mount, id + '-minimum');
    assert.ok(H.RENDERERS.runQuestions && typeof H.runQuestions.mount === 'function');
  }
  for (const group of [Q1, Q2, Q4]) assert.ok(family.groups.includes(group), group);
});

test('each state is its approved base with only the changed blocks swapped, and its twin differs only in the frame size', () => {
  for (const id of IDS) {
    const [, base, , strings] = STATES[id];
    const html = H.templates[`workflow-run/${id}`];
    assert.equal(typeof html, 'string', id);
    assert.ok(html.includes('{{theme}}'), `${id} keeps the theme placeholder`);
    assert.notEqual(html, H.templates[base], `${id} differs from ${base}`);
    for (const text of strings) assert.ok(html.includes(text), `${id} carries ${text}`);
    const twin = H.templates[`workflow-run/${id}-minimum`];
    assert.equal(twin, html.replace('width: 100%; height: 800px;', 'width: 1000px; height: 620px;'), `${id} twin`);
    assert.ok(!html.includes('slice'), `${id} says nothing about slices`);
  }
});

test('the run top bar states replace the step count only where intended', () => {
  const base = H.templates['workflow-run/graph-needs-you'];
  assert.ok(base.includes('Step 2 of 4 · 06:31') && base.includes('hd-task-row__meta">2/4'), 'the approved state is unchanged');
  for (const id of ['topbar-started', 'topbar-counts', 'topbar-no-more', 'topbar-more-actions']) {
    const html = H.templates[`workflow-run/${id}`];
    assert.ok(!html.includes('Step 2 of 4') && !html.includes('hd-task-row__meta">2/4'), `${id} has no step count`);
    assert.ok(html.includes('hd-task-row__meta">06:31'), `${id} shows the elapsed time in the sidebar row`);
  }
  assert.ok(!H.templates['workflow-run/topbar-no-more'].includes('More actions'));
  assert.ok(!H.templates['workflow-run/topbar-counts'].match(/ of \d/), 'no total is drawn');
  const menu = H.templates['workflow-run/topbar-more-actions'];
  assert.ok(!menu.includes('Show artifacts'), 'no artifacts surface is approved for a run');
  assert.ok(menu.includes('Pause</button>') && menu.includes('>Cancel run</button>'), 'Pause and Cancel run stay buttons');
  assert.ok(!menu.includes('hd-rq-menu__item--off'), 'Revise goal is enabled while the run needs input');
  const off = H.templates['workflow-run/topbar-more-actions-disabled'];
  assert.match(off, /hd-rq-menu__item--off[^>]*aria-disabled="true" aria-describedby="rq-revise-reason"/);
});

test('the held conversation states keep the composer open only where the engine accepts a message', () => {
  const read = id => H.templates[`workflow-run/${id}`];
  for (const id of ['orchestrator-steering-stale', 'orchestrator-steering-expired']) {
    assert.ok(read(id).includes('placeholder="Ask or tell the orchestrator" style="min-height:24px;"'), `${id} composer is open`);
    assert.ok(!read(id).includes('>Start again<'), `${id} has no standalone Start again`);
    assert.equal((read(id).match(/>Dismiss<\/button>/g) || []).length, 1, `${id} has one Dismiss`);
    assert.ok(!read(id).includes('>Pause</button>') && read(id).includes('>Cancel run</button>'));
  }
  assert.ok(read('orchestrator-steering-dismissing').includes('hd-i-lock') && !read('orchestrator-steering-dismissing').includes('>Dismiss<'));
  assert.ok(read('orchestrator-steering-dismissing').includes('Needs you</span>'), 'the run is not paused while a turn settles');
  const dismissed = read('orchestrator-steering-dismissed');
  assert.match(dismissed, /<button type="button" class="hd-btn hd-btn--ghost" disabled aria-describedby="rq-resume-reason">[\s\S]*Resume<\/button>/);
  assert.ok(dismissed.includes('placeholder="Ask or tell the orchestrator" style="min-height:24px;"'));
});

test('lane and node locks follow the run status', () => {
  const lanes = id => H.templates[`workflow-run/${id}`];
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

test('no state of the group keeps the 2/4 meta except the approved Messages and goal ones', () => {
  assert.ok(!H.templates['workflow-run/topbar-more-actions-disabled'].includes('hd-task-row__meta">2/4'));
  assert.ok(H.templates['workflow-run/parallel-run-pane'].indexOf('Original request') < H.templates['workflow-run/parallel-run-pane'].indexOf('>GOAL<'));
});

test('badges and glyphs are the canonical ones and the status words are in the closed vocabulary', () => {
  const vocabulary = new Set(['Running', 'Settling', 'Done', 'Failed', 'Timed out', 'Cancelled', 'Pending', 'Needs you', 'Starting', 'Paused', 'Cancelling']);
  for (const id of IDS) {
    const html = H.templates[`workflow-run/${id}`];
    for (const [, word] of html.matchAll(/<span class="hd-badge[^"]*">(?:<span[^>]*><\/span>)?([A-Za-z ]+)<\/span>/g)) assert.ok(vocabulary.has(word), `${id}: ${word}`);
    for (const [, glyph] of html.matchAll(/hd-glyph[^"]*" aria-label="([^"]+)"/g)) assert.ok(vocabulary.has(glyph) || glyph === 'Parallel group, running', `${id}: glyph ${glyph}`);
  }
  assert.ok(H.templates['workflow-run/lanes-completed'].includes('hd-badge hd-badge--done"><span class="hd-i hd-i-check"'));
  assert.ok(H.templates['workflow-run/orchestrator-steering-stale'].includes('hd-badge hd-badge--warning"><span class="hd-i hd-i--sm hd-i-pause"'));
});

test('catalog text names the screen only and the guides link to existing records', () => {
  const records = new Set(Object.values(STATES).map(x => x[2]));
  assert.equal(records.size, 4);
  for (const id of IDS) for (const state of [H.findState(family, id), H.findState(family, id + '-minimum')]) {
    for (const field of ['id', 'title', 'description', 'group', 'approvalNote']) assert.ok(!NAMING_RULE.test(state[field]), `${state.id} ${field}`);
    const guide = H.componentDocs[`workflow-run/${state.id}`];
    assert.ok(guide.startsWith('<p><strong>Provisional, not approved.</strong>'), state.id);
    assert.ok(!NAMING_RULE.test(guide.replace(/<[^>]*>/g, ' ')), `${state.id} guide`);
    const link = guide.match(/href="docs\/decisions\/([a-z-]+\.md)"/);
    assert.ok(link && fs.existsSync(path.join(root, 'v2', 'docs', 'decisions', link[1])), `${state.id} links to a record`);
  }
  for (const record of records) {
    const text = fs.readFileSync(path.join(root, 'v2', 'docs', 'decisions', `${record}.md`), 'utf8');
    for (const heading of ['Source', 'States', 'Recommendations', 'Owner questions', 'What the app would change', 'Files']) {
      assert.match(text, new RegExp(`^## ${heading}\\b`, 'm'), `${record} has ${heading}`);
    }
    assert.match(text, /^Status: \*\*Provisional/m, record);
  }
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
    const stop = H.runQuestions.mount(root_, 'topbar-started-minimum');
    assert.deepEqual(JSON.parse(JSON.stringify(applied[0])), ['sidebar', 'canvas', 'topbar-meta']);
    assert.ok(classes.has('hdc-specimen--minimum') && classes.has('hd-rq-min--graph'));
    stop();
    assert.equal(classes.size, 0);
    H.runQuestions.mount(root_, 'lanes-completed-minimum')();
    assert.deepEqual(JSON.parse(JSON.stringify(applied[1])), ['sidebar', 'lanes', 'topbar-meta']);
  } finally { H.applyMinimum = original; }
  const css = fs.readFileSync(path.join(root, 'v2', 'styles', 'run-questions.css'), 'utf8');
  assert.match(css, /flex:1 0 400px;min-width:400px/);
  assert.match(css, /min-width:220px;max-width:500px/);
});
