import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const datesForRange = range => Array.from({ length: range }, (_, index) => new Date(Date.UTC(2026, 9, 27) - (range - 1 - index) * 86400000).toISOString().slice(0, 10));
const scripts = ['tokens.js', 'registry.js', 'appearance.js', 'components.js', 'start-screen.js', 'tasks.js', 'task-activity.js', 'parallel.js', 'task-approvals.js', 'task-summary.js', 'workflows.js', 'workflow-connectors.js', 'workflow-editor-proposals.js', 'workflow-editor-inspector.js', 'workflow-editor.js', 'council-activity.js', 'workflow-run.js', 'dialogs.js', 'workflow-launch-proposals.js', 'state-recovery.js', 'sidebar-setup.js', 'sidebar-proposals.js', 'statistics.js', 'statistics-accounting.js', 'web.js', 'skeleton-crossfade.js', 'foundations.js'];

function runtime({ captureEvents = false, elements = {}, history = { state: null, replaceState() {} } } = {}) {
  const listeners = new Map();
  const document = {
    querySelector: selector => elements[selector] || null,
    querySelectorAll: () => [],
    addEventListener(type, listener) {
      const registered = listeners.get(type) || [];
      registered.push(listener);
      listeners.set(type, registered);
    },
    dispatchEvent(event) {
      for (const listener of listeners.get(event.type) || []) listener(event);
    }
  };
  const context = vm.createContext({ window: {}, document, history, CSS: { escape: String }, setTimeout, clearTimeout });
  context.window = context;
  for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(root, 'scripts', file), 'utf8'), context, { filename: file });
  if (context.HFWorkflowConnectors) context.HF.HFWorkflowConnectors = context.HFWorkflowConnectors;
  if (captureEvents) context.HF.__dispatchDesignEvent = event => document.dispatchEvent(event);
  return context.HF;
}

test('one root ledger reconciles elapsed time, qualified usage, and execution contributions', () => {
  const hf = runtime();
  const m = hf.accountingModel();
  assert.deepEqual(Array.from(m.roots, r => r.id), ['r1', 'r2', 't1', 't2', 't3', 'r6']);
  assert.equal(m.elapsed, 225, 'workflow roots contribute wall time while standalone tasks contribute execution intervals');
  assert.equal(m.usage, 670, 'only qualified, non-ambiguous execution totals contribute');
  assert.equal(m.qualified, 8, 'a qualified zero is included in coverage');
  assert.equal(m.unavailable, 3);
  assert.equal(m.ambiguous, 1);
  assert.equal(m.rawEvidenceCount, 13);
  assert.equal(m.duplicateEvidenceCount, 1, 'the repeated e2 snapshot resolves to one execution contribution');
  assert.equal(m.activeExcluded, 1);
  assert.equal(m.incompleteExcluded, 1, 'a finished status without a qualified finish witness stays outside settled totals');
  assert.equal(m.roots.some(r => r.id === 'r5'), false);
  assert.deepEqual(Array.from(m.rootCoverage, r => [r.id, r.status]), [
    ['r1', 'partial'], ['r2', 'partial'], ['t1', 'partial'], ['t2', 'unavailable'], ['t3', 'complete'], ['r6', 'complete']
  ]);
  assert.equal(hf.accountingFixture.timezone, 'Asia/Jakarta (UTC+07:00)');
  assert.equal(hf.accountingFixture.now, '2026-10-27T12:00:00+07:00');
  assert.equal(m.daily.length, 30);
  assert.deepEqual(Array.from(m.daily, d => d.day), datesForRange(30), 'daily axis includes every local calendar day in the cohort range');
  assert.equal(m.daily.find(d => d.day === '2026-10-26').time, 60, 'cross-midnight workflow wall time is assigned once to its start day');
  assert.equal(m.rootMetrics.find(r => r.id === 't1').minutes, 50, 'task duration sums execution intervals without idle gaps');
  assert.equal(m.rootMetrics.find(r => r.id === 't1').usage, 110, 'the unavailable resume segment does not erase known attempt usage');
  assert.equal(hf.accountingFixture.executions.find(e => e.id === 'e6').status, 'failed');
  for (const row of m.daily) {
    if (row.time != null) assert.equal((row.workflowTime || 0) + (row.taskTime || 0), row.time);
    if (row.usage != null) assert.equal((row.workflowUsage || 0) + (row.taskUsage || 0), row.usage);
  }
  assert.equal(m.daily.find(d => d.day === '2026-10-22').time, 0, 'empty days have zero elapsed time');
  assert.equal(m.daily.find(d => d.day === '2026-10-22').usage, null, 'empty days have unavailable usage, not reported zero');
  assert.equal(m.daily.reduce((sum, d) => sum + (d.time || 0), 0), m.elapsed);
  assert.equal(m.daily.reduce((sum, d) => sum + (d.usage ?? 0), 0), m.usage);
  const implementation = m.rankings.workflow.find(group => group.name === 'Implementation');
  assert.equal(implementation.runCount, 2);
  assert.deepEqual(Array.from(implementation.runs, run => run.id), ['r1', 'r6']);
  assert.equal(implementation.minutes, 80);
  assert.equal(implementation.averageMinutes, 40);
  assert.equal(implementation.usage, 520);
  assert.equal(implementation.coverage, 'partial', 'one partial run keeps the aggregate partial');
  const implementationRuns = hf.accountingModel({ workflow: 'Implementation' });
  assert.equal(implementationRuns.runRankings.length, 2);
  assert.equal(implementationRuns.elapsed, implementation.minutes, 'workflow aggregate equals its individual runs');
  assert.equal(implementationRuns.usage, implementation.usage);
  assert.match(hf.accountingBody('accounting-overview'), /Implementation/);
  assert.match(hf.accountingBody('accounting-runs', { workflow: 'Implementation' }), /2 matching runs/);
});

test('execution filters narrow matching root cohorts without turning nested work into another run', () => {
  const hf = runtime();
  const m = hf.accountingModel({ harness: 'Codex', observed: 'Model B', requested: 'Model A' });
  assert.deepEqual(Array.from(m.roots, r => r.id), ['r1', 'r2', 't1']);
  assert.equal(m.elapsed, 155, 'the r1 workflow remains one 60 minute root despite matching two execution contributions');
  assert.equal(m.executions.length, 4, 'the nested contribution remains inspectable under its root');
  assert.equal(m.usage, 380, 'requested and observed models remain separate filters');
  assert.deepEqual(Array.from(m.groups.harness, g => [g.name, g.count]), [['Codex', 4]]);

  const node = hf.accountingModel({ node: 'Plan' });
  assert.deepEqual(Array.from(node.roots, r => r.id), ['r1']);
  assert.equal(node.elapsed, 60, 'node-filtered contributions retain whole root elapsed time');
  assert.deepEqual(Array.from(node.daily.filter(d => d.time > 0), d => d.day), ['2026-10-26']);

});

test('calendar cohort, repository identity, and active work use fixed local fixture time', () => {
  const hf = runtime();
  const seven = hf.accountingModel({ range: 7 });
  const ninety = hf.accountingModel({ range: 90 });
  assert.deepEqual(Array.from(seven.roots, r => r.id), ['r1', 'r2', 't1']);
  assert.equal(seven.daily.length, 7);
  assert.deepEqual(Array.from(seven.daily, d => d.day), datesForRange(7));
  assert.deepEqual(Array.from(ninety.roots, r => r.id), ['r1', 'r2', 't1', 't2', 't3', 'r3', 'r6']);
  assert.equal(ninety.daily.length, 90);
  assert.deepEqual(Array.from(ninety.daily, d => d.day), datesForRange(90));
  assert.deepEqual(Array.from(hf.accountingModel({ repository: '/workspace/team-a/Harflow' }).roots, r => r.id), ['r1', 'r2', 't1', 'r6']);
  assert.deepEqual(Array.from(hf.accountingModel({ repository: '/workspace/team-b/Harflow' }).roots, r => r.id), ['t3']);
  const active = hf.accountingModel({ active: true, range: 7 });
  assert.deepEqual(Array.from(active.roots, r => r.id), ['r4']);
  assert.equal(active.elapsed, 30, 'active elapsed stops at the fixed fixture clock, not current wall time');
  assert.equal(active.usage, 55);
  assert.equal(active.activeExcluded, 0, 'active mode does not count the visible active root as excluded');
  assert.equal(hf.accountingModel({ repository: '/workspace/team-b/Harflow' }).activeExcluded, 0, 'active exclusion counts honor root-level filters');
  assert.equal(hf.accountingModel({ repository: '/workspace/team-a/Harflow' }).activeExcluded, 1);
});

test('category subtotals preserve zero, null, overlap, retries, resumes, and native-child exclusion', () => {
  const hf = runtime();
  const m = hf.accountingModel({ range: 90 });
  assert.equal(m.categories.input.subtotal, 710);
  assert.equal(m.categories.output.subtotal, 100);
  assert.equal(m.categories.input.known, 10);
  assert.equal(m.categories.output.known, 9);
  assert.equal(m.executions.some(e => e.id === 'e5'), false, 'ambiguous native child evidence never enters additive contributions');
  assert.equal(m.executions.some(e => e.id === 'e7'), true, 'a retry remains its own execution');
  assert.equal(m.executions.find(e => e.id === 'e11').total, 0, 'qualified zero differs from an unavailable total');
  assert.equal(m.daily.find(d => d.day === '2026-10-10').usage, 0, 'the zero-only contribution day retains reported zero');
  assert.equal(m.daily.find(d => d.day === '2026-10-11').usage, null, 'a day without contributions remains unavailable');
  assert.equal(m.executions.find(e => e.id === 'e9').total, null, 'an unavailable resumed segment stays null');
  assert.equal(m.rootCoverage.find(r => r.id === 't3').status, 'complete', 'reported zero counts as qualified coverage');
  assert.equal(m.rootCoverage.find(r => r.id === 't1').status, 'partial', 'resume history gaps keep the root partial');
  const ambiguousOnly = hf.accountingModel({ node: 'Native child' });
  assert.deepEqual(Array.from(ambiguousOnly.roots, r => r.id), ['r1'], 'uncertain evidence still keeps its matching root visible');
  assert.equal(ambiguousOnly.evidence.length, 1);
  assert.equal(ambiguousOnly.executions.length, 0, 'ambiguous evidence is never an additive contribution');
  assert.equal(ambiguousOnly.usage, null, 'no qualified evidence is unavailable, not zero');
  assert.equal(ambiguousOnly.categories.input.subtotal, null);
  assert.equal(ambiguousOnly.rootCoverage[0].status, 'unavailable');
  const detail = hf.accountingBody('accounting-detail', { selected: 'r1' });
  assert.match(detail, /Nested review · nested attempt/);
  assert.match(detail, /Native child · native child/);
  assert.match(detail, /Ownership overlaps transport evidence/);
  const turns = hf.accountingBody('accounting-turns');
  assert.match(turns, /Initial message/);
  assert.match(turns, /Follow-up message/);
  assert.match(turns, /never apportioned across messages/);
  assert.match(hf.accountingFixture.executions.find(e => e.id === 'e9').start, /11:40:00\+07:00/);
  assert.equal(hf.accountingFixture.executions.find(e => e.id === 'e9').status, 'done');
  assert.equal(new Set(hf.accountingFixture.executions.map(e => e.id)).size, hf.accountingFixture.executions.length);
  assert.doesNotMatch(hf.accountingBody('accounting-detail', { selected: 't1' }), /nested workflow/i, 'task details do not display unrelated nested workflow boundaries');
  const missingFinish = hf.accountingBody('accounting-detail', { selected: 'r5' });
  assert.match(missingFinish, /Root completion witness missing; excluded from settled accounting/);
  assert.match(missingFinish, /Unavailable · Root wall clock/, 'incomplete historical work has no qualified elapsed duration');
});

test('accounting states expose isolated markup and loading, empty, no-history, and failure distinctions', () => {
  const hf = runtime();
  for (const state of ['accounting-overview', 'accounting-loading', 'accounting-empty', 'accounting-no-history', 'accounting-error', 'accounting-active', 'accounting-runs', 'accounting-tasks', 'accounting-detail', 'accounting-turns', 'accounting-context-workflow', 'accounting-context-run', 'accounting-context-repository']) {
    const html = hf.renderAccounting(state);
    assert.match(html, /id="accounting-content"/, state);
    assert.doesNotMatch(html, /id="statistics-content"|data-action="stat-[^"]*"/, state);
  }
  assert.match(hf.accountingBody('accounting-loading'), /Loading statistics/);
  assert.match(hf.accountingBody('accounting-empty'), /No matching work/);
  assert.match(hf.accountingBody('accounting-no-history'), /No retained history/);
  assert.match(hf.accountingBody('accounting-error'), /role="alert"/);
  assert.match(hf.accountingBody('accounting-active'), /Provisional known token subtotal/);
  const overview = hf.accountingBody('accounting-overview');
  assert.match(overview, /Common scale: 0–60 min/);
  assert.match(overview, /Workflow runs/);
  assert.match(overview, /Standalone tasks/);
  assert.match(overview, /Daily values \(min\)/);
  const zeroUsage = hf.accountingBody('accounting-overview', { range: 90, measure: 'usage' });
  assert.match(zeroUsage, /\b0 tokens\b/, 'a qualified zero remains distinguishable from unavailable totals');
});

test('pagination, contextual navigation, deterministic reset, and legacy handler coexistence', () => {
  const content = { innerHTML: '', scrollTop: 0 };
  const legacyContent = { innerHTML: '', scrollTop: 0, querySelector: () => null };
  const announcement = { textContent: '', classList: { add() {}, remove() {} } };
  const picker = { value: '' };
  const caption = { textContent: '' };
  const hashes = [];
  const hf = runtime({ captureEvents: true, elements: { '#accounting-content': content, '#statistics-content': legacyContent, '#state-picker': picker, '#specimen-caption': caption, '#announcement': announcement }, history: { state: null, replaceState(_state, _title, hash) { hashes.push(hash); } } });
  hf.route = { theme: 'light', screen: 'statistics', state: 'accounting-runs' };
  hf.resetAccounting('accounting-runs');
  content.innerHTML = hf.accountingBody('accounting-runs', hf.accountingController.state);
  const click = action => {
    const target = { dataset: { action }, disabled: false };
    hf.__dispatchDesignEvent({ type: 'click', target: { closest: selector => selector.includes('data-action^="acct-"') ? target : null }, preventDefault() {}, stopImmediatePropagation() {} });
    return content.innerHTML;
  };
  const change = (key, value) => hf.__dispatchDesignEvent({ type: 'change', target: { value, closest: selector => selector === '[data-acct-filter]' ? { value, dataset: { acctFilter: key } } : null }, preventDefault() {}, stopImmediatePropagation() {} });
  change('range', '90');
  assert.match(content.innerHTML, /Plan changes/);
  click('acct-page:1');
  assert.match(hf.accountingBody('accounting-runs', { range: 90, page: 0 }), /Implement and review/);
  assert.match(hf.accountingBody('accounting-runs', { range: 90, page: 0 }), /Plan changes/);
  assert.match(hf.accountingBody('accounting-runs', { range: 90, page: 1 }), /Review release/);
  assert.doesNotMatch(hf.accountingBody('accounting-runs', { range: 90, page: 1 }), /Implement and review/);

  assert.match(content.innerHTML, /Page 2 of 2/);
  click('acct-page:0');
  click('acct-detail:r1');
  assert.equal(hf.route.state, 'accounting-detail');
  assert.equal(picker.value, 'accounting-detail');
  assert.ok(hashes.at(-1).startsWith('#statistics/accounting-detail/'));
  click('acct-turns');
  assert.equal(hf.route.state, 'accounting-turns');
  click('acct-detail:t1');
  click('acct-back');
  assert.equal(hf.route.state, 'accounting-turns', 'back restores the caller state');
  click('acct-overview');
  assert.equal(hf.route.state, 'accounting-overview');
  assert.equal(caption.textContent, hf.specimenStatus('statistics', 'accounting-overview').caption);
  hf.resetAccounting('accounting-overview');
  assert.equal(hf.accountingController.state.range, 30);
  assert.equal(hf.accountingController.state.page, 0);
  assert.equal(hf.accountingController.state.repository, 'all');

  hf.route.state = 'overview';
  hf.resetStatistics();
  hf.__dispatchDesignEvent({ type: 'click', target: { closest: selector => selector.includes('data-action^="stat-"') ? { dataset: { action: 'stat-range:7' }, disabled: false } : null }, preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(hf.accountingController.state.range, 30, 'legacy controls do not change accounting state');
  assert.match(legacyContent.innerHTML, /Last 7 days/, 'the legacy handler continues to process its own route');
});

test('workflow aggregates reconcile to their runs and active context survives list, detail, and back', () => {
  const content = { innerHTML: '', scrollTop: 0 };
  const picker = { value: '' };
  const caption = { textContent: '' };
  const hashes = [];
  const hf = runtime({ captureEvents: true, elements: { '#accounting-content': content, '#state-picker': picker, '#specimen-caption': caption }, history: { state: null, replaceState(_state, _title, hash) { hashes.push(hash); } } });
  hf.route = { theme: 'light', screen: 'statistics', state: 'accounting-active' };
  hf.resetStatistics();
  assert.equal(hf.accountingController.state.view, 'active', 'deep-link reset initializes active view from the route');
  const activeHTML = hf.renderStatistics('accounting-active');
  assert.match(activeHTML, /Provisional known token subtotal/);
  assert.match(activeHTML, /data-action="acct-workflow-runs:Implementation"/);
  assert.match(activeHTML, /30 min provisional live elapsed; no settled average/);
  assert.doesNotMatch(activeHTML, /qualified run durations|Average settled workflow|Mean settled workflow/i);

  const click = action => {
    const target = { dataset: { action }, disabled: false };
    hf.__dispatchDesignEvent({ type: 'click', target: { closest: selector => selector.includes('data-action^="acct-"') ? target : null }, preventDefault() {}, stopImmediatePropagation() {} });
    return content.innerHTML;
  };
  click('acct-workflow-runs:Implementation');
  assert.equal(hf.route.state, 'accounting-runs');
  assert.equal(hf.accountingController.state.view, 'active', 'opening the run list keeps active mode');
  assert.equal(hf.accountingController.state.workflow, 'Implementation');
  assert.match(content.innerHTML, /Active implementation/);
  assert.match(content.innerHTML, /1 matching runs/);

  click('acct-detail:r4');
  assert.equal(hf.route.state, 'accounting-detail');
  assert.equal(hf.accountingController.state.view, 'active');
  click('acct-back');
  assert.equal(hf.route.state, 'accounting-runs');
  assert.equal(hf.accountingController.state.view, 'active', 'back restores active list context');
  assert.equal(hf.accountingController.state.workflow, 'Implementation');
  assert.match(content.innerHTML, /Active implementation/);
  assert.ok(hashes.some(hash => hash.startsWith('#statistics/accounting-runs/')));
});
