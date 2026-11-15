import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptsDir = path.join(root, 'v2', 'scripts');
const OWN = 'states-workflow-gaps.js';
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b/i;
const NOTE = 'Provisional · not approved';
const APPROVAL = { by: 'the owner', date: '2026-11-15', decision: 'Workflow and capacity states' };
// Drawn on the owner's decisions of 2026-11-15 and not yet seen by the owner; every other state here is approved.
const PROVISIONAL = new Set(['workflow-editor/delete-confirm-saved', 'workflow-editor/discard-confirm', 'workflows/generate-builder-options']);

function load(skip) {
  const context = vm.createContext({ window: {} });
  context.window = context;
  const names = fs.readdirSync(scriptsDir).filter(n => n !== 'catalog.js' && !skip.includes(n));
  for (const name of ['registry.js', ...names.filter(n => n !== 'registry.js')]) vm.runInContext(fs.readFileSync(path.join(scriptsDir, name), 'utf8'), context, { filename: name });
  return context.HFV2;
}
// The runtime without this script, to compare the base templates against.
const WITHOUT = load([OWN, 'states-run-actions.js', 'states-capacity-gaps.js']);
const HFV2 = load([]);

// route: [group, base template, key strings the specimen must contain]
const EDITOR = 'workflow-editor';
const STATES = {
  'workflow-editor/checking': ['Validation and saving', 'workflow-editor/node-selected', ['Checking workflow… · 6 nodes · 1 on demand', 'hd-glyph--running']],
  'workflow-editor/invalid': ['Validation and saving', 'workflow-editor/node-selected', ['Node ‘Review’ has no outgoing connection.', 'aria-label="Save, fix the problem first"']],
  'workflow-editor/validate-unavailable': ['Validation and saving', 'workflow-editor/node-selected', ['Unable to validate workflow. The validator did not respond.']],
  'workflow-editor/name-required': ['Validation and saving', 'workflow-editor/node-selected', ['New workflow</span>', 'Enter a workflow name. · 6 nodes · 1 on demand']],
  'workflow-editor/missing-child': ['Validation and saving', 'workflow-editor/node-selected', ['2 missing workflow references', 'Review missing workflows', 'hd-gap-node--warning', 'Replace all matching nodes…']],
  'workflow-editor/missing-child-paths': ['Validation and saving', 'workflow-editor/node-selected', ['role="menu"', 'Release checklist → Checks → Security sweep', 'Additional missing references may remain']],
  'workflow-editor/missing-child-replace': ['Validation and saving', 'workflow-editor/node-selected', ['role="dialog"', 'Replace unavailable workflow in 2 nodes?', 'Security sweep (node 4)', '>Replace all<']],
  'workflow-editor/conflict': ['Validation and saving', 'workflow-editor/node-selected', ['The saved workflow changed or was replaced.', 'Save copy and reload']],
  'workflow-editor/conflict-unreadable': ['Validation and saving', 'workflow-editor/node-selected', ['could not be read', 'Workflow ‘release-checklist’ was not found.']],
  'workflow-editor/save-failed': ['Validation and saving', 'workflow-editor/node-selected', ['Couldn’t save the workflow.', 'The workflow catalog is busy.']],
  'workflow-editor/load-failed': ['Validation and saving', 'workflow-editor/node-selected', ['Workflow could not be loaded', 'The workflow file could not be read.', '>Retry<']],
  'workflow-editor/agent-request': ['Edit with agent', 'workflow-editor/node-selected', ['Edit workflow with agent', 'Propose changes', 'Describe the changes']],
  'workflow-editor/agent-starting': ['Edit with agent', 'workflow-editor/edit-with-agent', ['Starting workflow builder…', 'Editing with agent']],
  'workflow-editor/agent-working': ['Edit with agent', 'workflow-editor/edit-with-agent', ['Cancel run', 'Pause', 'Working']],
  'workflow-editor/agent-failed': ['Edit with agent', 'workflow-editor/edit-with-agent', ['hd-glyph--failed', 'The builder stopped: the harness reported a usage limit.', 'Message the workflow builder']],
  'workflow-editor/agent-cancelled': ['Edit with agent', 'workflow-editor/edit-with-agent', ['hd-glyph--cancelled', 'Cancelled']],
  'workflow-editor/agent-canvas-changed': ['Edit with agent', 'workflow-editor/edit-with-agent', ['The canvas changed after this request.', 'disabled class="hd-btn hd-btn--primary hd-btn--sm">Apply proposal']],
  'workflow-editor/more-actions': ['More actions', 'workflow-editor/node-selected', ['aria-haspopup="menu" aria-expanded="true"', 'Generate with agent…', 'hd-menu__item--danger', '>Delete…</span>', '#workflow-editor/delete-confirm']],
  'workflow-editor/more-actions-unsaved': ['More actions', 'workflow-editor/node-selected', ['aria-disabled="true"', '>Delete…</span>', 'Unsaved changes</span>']],
  'workflow-editor/delete-confirm': ['More actions', 'workflow-editor/node-selected', ['Delete workflow ‘Release checklist’?', 'Existing run snapshots remain available.', 'Unsaved changes will be lost.', 'hd-btn--danger']],
  'workflow-editor/delete-confirm-saved': ['More actions', 'workflow-editor/orchestrator', ['Delete workflow ‘Release checklist’?', 'Existing run snapshots remain available.', 'href="#workflow-editor/orchestrator">Cancel', 'hd-btn--danger', 'Revision 7</span>']],
  'workflow-editor/discard-confirm': ['Validation and saving', 'workflow-editor/node-selected', ['Discard unsaved changes?', 'The workflow returns to revision 7, its last saved revision.', 'hd-btn--secondary" href="#workflow-editor/node-selected">Cancel', 'hd-btn--danger">Discard</button>']],
  'workflow-editor/delete-failed': ['More actions', 'workflow-editor/node-selected', ['Couldn’t delete the workflow.', 'hd-banner']],
  'workflows/new-menu': ['New workflow', 'workflows/list', ['Blank workflow', 'Generate with agent…', '#workflows/generate', '#workflow-editor/name-required']],
  'workflows/generate': ['New workflow', 'workflows/run', ['Generate a workflow', 'Workflow name', 'No repository', 'Builder: Claude Code · Opus 5.5', 'aria-label="Generate"']],
  'workflows/generate-builder-options': ['New workflow', 'workflows/generate', ['aria-label="Builder options"', 'Fallback harnesses (1)', 'Tried in order for confirmed quota, model or availability failures.', 'Move fallback 1 up', 'Move fallback 1 down', 'Remove fallback 1', 'Add fallback', 'Turn limit']],
  'workflows/generate-refused': ['New workflow', 'workflows/run', ['The workflow agent is already starting or running.']],
  'workflows/generate-uncertain': ['New workflow', 'workflows/run', ['interrupted before its run ID was received', 'hd-banner--warning']],
  'workflow-editor/generate-starting': ['Generate', 'workflow-editor/edit-with-agent', ['dependency-audit', 'Generating', 'The draft appears here when the builder saves it.', 'Return to workflows']],
  'workflow-editor/generate-working': ['Generate', 'workflow-editor/edit-with-agent', ['Generating', 'Cancel run', 'Working']],
  'workflow-editor/generate-ready': ['Generate', 'workflow-editor/edit-with-agent', ['Draft saved', 'Open generated draft', 'Draft saved · 6 nodes']],
  'workflow-editor/generate-failed': ['Generate', 'workflow-editor/edit-with-agent', ['hd-badge--failed', 'Message the workflow builder']]
};

const INERT_LINKS = new Set(['#', '#new', '#revise-goal', '#install-antigravity', '#settings', '#needs-you', '#workflows', '#resources', '#statistics', '#needs-you-empty', '#needs-you-active']);
const LINK_SHAPE = /^#[a-z0-9-]+\/[a-z0-9-]+(\/(light|dark|system))?$/;
const routeSet = new Set(HFV2.stateKeys());
function checkHash(href, where) {
  if (INERT_LINKS.has(href)) return;
  assert.match(href, LINK_SHAPE, `${where}: ${href}`);
  const target = HFV2.resolveRoute(href).replace(/\/(light|dark|system)$/, '').slice(1);
  assert.ok(routeSet.has(target), `${where}: ${href} resolves to unregistered ${target}`);
  assert.ok(HFV2.describe(target), `${where}: ${href} is not renderable`);
}
const state = route => { const [f, s] = route.split('/'); return { family: HFV2.findFamily(f), state: HFV2.findState(HFV2.findFamily(f), s) }; };
const mine = Object.keys(STATES);

test('the workflow states are registered, approved except the three drawn on the owner\'s decisions, in their groups, and listed in HFV2.gapStates', () => {
  assert.equal(mine.length, 32);
  for (const route of mine) {
    const { family, state: s } = state(route);
    assert.ok(s, `${route} is registered`);
    if (PROVISIONAL.has(route)) {
      assert.equal(s.status, 'provisional', route);
      assert.equal(s.approvalNote, NOTE, route);
      assert.equal(s.approval, undefined, route);
    } else {
      assert.equal(s.status, 'approved', route);
      assert.deepEqual(JSON.parse(JSON.stringify(s.approval)), APPROVAL, route);
      assert.equal(s.approvalNote, undefined, route);
      assert.equal(HFV2.approvalLine(family, s), 'Approved by the owner on 2026-11-15 · Workflow and capacity states', route);
    }
    assert.equal(s.group, STATES[route][0], route);
    assert.ok(family.groups.includes(s.group), `${route} group is declared by its family`);
    assert.ok(family.groups.indexOf(s.group) < family.groups.indexOf('Loading'), `${route} group precedes Loading`);
    assert.ok(HFV2.gapStates.includes(route), `${route} is in gapStates`);
    assert.equal(HFV2.describe(route).templateKey, route);
  }
});

test('each state has its own template, different from its approved base, and the base is unchanged', () => {
  for (const route of mine) {
    const base = STATES[route][1];
    const html = HFV2.templates[route];
    assert.equal(typeof html, 'string', route);
    assert.notEqual(html, HFV2.templates[base], `${route} differs from ${base}`);
    // A base drawn by these scripts (the generate page) is not in the runtime without them.
    if (base in WITHOUT.templates) assert.equal(HFV2.templates[base], WITHOUT.templates[base], `${base} is unchanged`);
    assert.ok(html.includes('hd-app'), route);
  }
});

test('each specimen carries the content that defines it', () => {
  for (const route of mine) for (const text of STATES[route][2]) assert.ok(HFV2.templates[route].includes(text), `${route} contains ${text}`);
});

test('dialog states mark the sidebar and main inert and name the dialog', () => {
  const dialogs = ['workflow-editor/missing-child-replace', 'workflow-editor/agent-request', 'workflow-editor/delete-confirm', 'workflow-editor/delete-confirm-saved', 'workflow-editor/discard-confirm'];
  for (const route of dialogs) {
    const html = HFV2.templates[route];
    assert.ok(html.includes('<aside inert class="hd-sidebar"'), `${route} sidebar inert`);
    assert.ok(/<main class="hd-main" inert>/.test(html), `${route} main inert`);
    const label = /role="dialog" aria-modal="true" aria-labelledby="([^"]+)"/.exec(html);
    assert.ok(label, `${route} dialog`);
    assert.ok(html.includes(`id="${label[1]}"`), `${route} dialog label target`);
  }
});

test('menus declare their popup state and menu items', () => {
  for (const route of ['workflow-editor/more-actions', 'workflow-editor/more-actions-unsaved', 'workflow-editor/missing-child-paths', 'workflows/new-menu']) {
    const html = HFV2.templates[route];
    assert.ok(html.includes('aria-haspopup="menu"') && html.includes('aria-expanded="true"'), route);
    assert.ok(html.includes('role="menu"') && html.includes('role="menuitem"'), route);
  }
});

test('no search, filter, rename, duplicate or task tabs are added', () => {
  const count = (html, re) => (html.match(re) || []).length;
  for (const route of mine) {
    const html = HFV2.templates[route], base = HFV2.templates[STATES[route][1]];
    assert.ok(count(html, /type="search"/g) <= count(base, /type="search"/g), `${route} adds no search field`);
    const main = html.slice(html.indexOf('<main'));
    assert.ok(!/Duplicate|Rename|role="tablist"/.test(main), `${route} has no Duplicate, Rename or tabs`);
    assert.ok(!/hd-filter|aria-label="Filter/.test(main), `${route} has no filter`);
  }
});

test('catalog text follows the naming rule', () => {
  for (const route of mine) {
    const { state: s } = state(route);
    for (const field of ['id', 'title', 'description', 'group', 'approvalNote']) assert.ok(!NAMING_RULE.test(s[field] || ''), `${route} ${field}`);
    const guide = HFV2.componentDocs[route];
    const lead = PROVISIONAL.has(route) ? '<p><strong>Provisional, not approved.</strong>' : '<p><strong>Approved by the owner · 2026-11-15.</strong>';
    assert.ok(guide && guide.startsWith(lead), `${route} guide`);
    assert.ok(guide.includes('docs/decisions/README.md#workflow-and-capacity-states"'), `${route} guide links the record`);
    assert.ok(!NAMING_RULE.test(guide.replace(/<[^>]*>/g, ' ')), `${route} guide`);
    assert.ok(!/gap/i.test(`${s.title} ${s.description} ${s.group} ${HFV2.approvalLine(HFV2.findFamily(route.split('/')[0]), s)}`), `${route} carries no gap vocabulary`);
  }
});

test('every hash link in the specimens resolves to a registered route', () => {
  for (const route of mine) for (const [, href] of HFV2.templates[route].matchAll(/href="(#[^"]*)"/g)) checkHash(href, route);
});

test('glyphs use only the canonical pairs', () => {
  const pairs = { running: '', done: 'hd-i-check', failed: 'hd-i-x', cancelled: 'hd-i-stop', attention: 'hd-i-hand' };
  for (const route of mine) {
    const html = HFV2.templates[route];
    for (const [, kind, inner] of html.slice(html.indexOf('<main')).matchAll(/<span class="hd-glyph hd-glyph--(running|done|failed|cancelled|attention)"[^>]*>((?:<span[^>]*><\/span>)?)<\/span>/g)) {
      const icon = /hd-i-([a-z][a-z-]*)/.exec(inner);
      assert.equal(icon ? 'hd-i-' + icon[1] : '', pairs[kind], `${route} ${kind} glyph`);
    }
  }
});

test('starting states offer neither Pause nor Cancel run; load-failed has no meta; live regions hold no controls', () => {
  for (const route of ['workflow-editor/agent-starting', 'workflow-editor/generate-starting']) {
    const main = HFV2.templates[route].slice(HFV2.templates[route].indexOf('<main'));
    assert.ok(!main.includes('Pause') && !main.includes('Cancel run'), route);
  }
  const failed = HFV2.templates['workflow-editor/load-failed'];
  assert.ok(!failed.includes('Revision 7') && !failed.includes('hd-topbar__meta'));
  for (const route of ['workflow-editor/missing-child', 'workflow-editor/missing-child-paths', 'workflow-editor/conflict', 'workflow-editor/conflict-unreadable']) {
    for (const [, inner] of HFV2.templates[route].matchAll(/role="status"[^>]*>((?:(?!role="status").)*?)<\/(?:div|span)>/g)) assert.ok(!/<button|<a /.test(inner), `${route} live region`);
  }
  for (const route of mine.filter(r => r.includes('generate-') && r.startsWith('workflow-editor/'))) assert.ok(!HFV2.templates[route].includes('Describe the changes'), route);
});

test('the Delete label ends with an ellipsis and the delete confirmation names unsaved changes only when there are some', () => {
  for (const route of ['workflow-editor/more-actions', 'workflow-editor/more-actions-unsaved']) {
    const html = HFV2.templates[route];
    assert.ok(html.includes('hd-menu__item-body">Delete…</span>'), route);
    assert.ok(!html.includes('hd-menu__item-body">Delete</span>'), route);
  }
  const unsaved = HFV2.templates['workflow-editor/delete-confirm'], saved = HFV2.templates['workflow-editor/delete-confirm-saved'];
  assert.ok(unsaved.includes('Unsaved changes · Revision 7') && unsaved.includes('Unsaved changes will be lost.'));
  assert.ok(!saved.includes('Unsaved changes') && !saved.includes('will be lost'));
  assert.ok(/class="hd-btn hd-btn--ghost hd-btn--sm" disabled>Discard<\/button><button type="button" class="hd-btn hd-btn--secondary hd-btn--sm" disabled>Save/.test(saved), 'the saved form: Discard and Save off');
});

test('the Workflows page and the states derived from it have no search field', () => {
  for (const route of ['workflows/list', 'workflows/new-menu']) {
    const html = HFV2.templates[route];
    assert.ok(!html.includes('Search workflows') && !html.includes('type="search"') && !html.includes('wf-search'), route);
    assert.ok(html.includes('>New workflow</button>') || html.includes('New workflow</button>'), route);
  }
});

test('the discard confirmation offers Cancel and a danger Discard', () => {
  const html = HFV2.templates['workflow-editor/discard-confirm'];
  assert.ok(/<h2 class="hd-dialog__title" id="gap-discard-title">Discard unsaved changes\?<\/h2>/.test(html));
  assert.ok(/hd-dialog__actions"><a class="hd-btn hd-btn--secondary" href="#workflow-editor\/node-selected">Cancel<\/a><button type="button" class="hd-btn hd-btn--danger">Discard<\/button>/.test(html));
});

test('the builder options popover holds the agent fields and one fallback', () => {
  const html = HFV2.templates['workflows/generate-builder-options'];
  const popover = html.slice(html.indexOf('aria-label="Builder options"'));
  for (const label of ['Harness', 'Model', 'Effort', 'Turn limit']) assert.ok(popover.includes(`>${label}</label>`), label);
  assert.ok(popover.includes('<span>Default</span>'), 'Effort starts at Default');
  assert.ok(/id="gbo-t" class="hd-input" type="text" placeholder="Default" value=""/.test(popover), 'the turn limit is empty');
  assert.ok(popover.includes('aria-expanded="true" aria-controls="gbo-fb"'));
  assert.equal((popover.match(/Fallback 1</g) || []).length, 1);
  assert.ok(/aria-label="Move fallback 1 up" disabled/.test(popover) && /aria-label="Move fallback 1 down" disabled/.test(popover), 'one fallback cannot move');
  assert.ok(/aria-label="Remove fallback 1">/.test(popover));
  assert.ok(!popover.includes('Caller approvals'), 'the caller approvals switch is not drawn');
  assert.ok(html.includes('class="hd-pill is-open" aria-haspopup="dialog" aria-expanded="true"'));
});
