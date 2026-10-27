(function () {
  // Prospective, synthetic accounting evidence; these records do not represent current engine capabilities.
  const roots = [
    {id:'r1',name:'Implement and review',kind:'workflow',repository:'/workspace/team-a/Harflow',workflow:'Implementation',status:'done',start:'2026-10-26T23:40:00+07:00',finish:'2026-10-27T00:40:00+07:00'},
    {id:'r2',name:'Review release',kind:'workflow',repository:'/workspace/team-a/Harflow',workflow:'Review',status:'failed',start:'2026-10-24T10:00:00+07:00',finish:'2026-10-24T10:45:00+07:00'},
    {id:'t1',name:'Investigate a failure',kind:'task',repository:'/workspace/team-a/Harflow',workflow:null,status:'done',start:'2026-10-25T09:00:00+07:00',finish:'2026-10-25T12:00:00+07:00'},
    {id:'t2',name:'Draft notes',kind:'task',repository:null,workflow:null,status:'cancelled',start:'2026-10-20T09:00:00+07:00',finish:'2026-10-20T09:20:00+07:00'},
    {id:'t3',name:'Check the build',kind:'task',repository:'/workspace/team-b/Harflow',workflow:null,status:'done',start:'2026-10-10T09:00:00+07:00',finish:'2026-10-10T09:30:00+07:00'},
    {id:'r3',name:'Plan changes',kind:'workflow',repository:'/workspace/team-b/Harflow',workflow:'Planning',status:'done',start:'2026-09-02T09:00:00+07:00',finish:'2026-09-02T10:00:00+07:00'},
    {id:'r4',name:'Active implementation',kind:'workflow',repository:'/workspace/team-a/Harflow',workflow:'Implementation',status:'running',start:'2026-10-27T11:30:00+07:00',finish:null}
  ];
  // total is supplied only where provenance establishes disjoint category inclusion. null is unavailable, not zero.
  const ledgerRecords = [
    {id:'e1',root:'r1',node:'Plan',harness:'Claude Code',requested:'Opus',observed:'Opus',minutes:20,segment:'attempt',categories:{input:100,output:20,cacheRead:40,cacheCreation:10},total:170,rule:'Input excludes cache; all four categories are disjoint.'},
    {id:'e2',root:'r1',node:'Implement',harness:'Codex',requested:'Model A',observed:'Model B',minutes:35,segment:'attempt',categories:{input:200,output:30,cacheRead:50,cacheCreation:null},total:230,rule:'Input includes cache read; total is input plus output.'},
    {id:'e3',root:'r1',node:'Nested review',harness:'Codex',requested:'Model B',observed:'Model B',minutes:15,segment:'nested attempt',categories:{input:50,output:10,cacheRead:null,cacheCreation:null},total:60,rule:'Input and output are disjoint.'},
    {id:'e4',root:'r1',node:'Orchestrator',harness:'Claude Code',requested:'Opus',observed:'Opus',minutes:10,segment:'control',categories:{input:20,output:5,cacheRead:null,cacheCreation:null},total:25,rule:'Input and output are disjoint.'},
    {id:'e5',root:'r1',node:'Native child',harness:'Claude Code',requested:'Opus',observed:null,minutes:null,segment:'native child',categories:{input:100,output:null,cacheRead:null,cacheCreation:null},total:null,rule:'Ownership overlaps transport evidence; excluded from additive totals.',ambiguous:true},
    {id:'e6',root:'r2',node:'Review',harness:'Vibe',requested:'Large',observed:null,minutes:25,segment:'attempt',categories:{input:90,output:null,cacheRead:null,cacheCreation:null},total:null,rule:'Partial categories; no qualified total.'},
    {id:'e7',root:'r2',node:'Review',harness:'Codex',requested:'Model A',observed:'Model B',minutes:12,segment:'retry',categories:{input:40,output:0,cacheRead:null,cacheCreation:null},total:40,rule:'Input and output are disjoint.'},
    {id:'e8',root:'t1',node:null,harness:'Codex',requested:'Model A',observed:'Model B',minutes:30,segment:'attempt',categories:{input:100,output:10,cacheRead:null,cacheCreation:null},total:110,rule:'Input and output are disjoint.'},
    {id:'e9',root:'t1',node:null,harness:'Codex',requested:'Model A',observed:'Model B',minutes:20,segment:'resume',categories:{input:null,output:null,cacheRead:null,cacheCreation:null},total:null,rule:'Historical segment usage unavailable.'},
    {id:'e10',root:'t2',node:null,harness:'Vibe',requested:null,observed:null,minutes:20,segment:'attempt',categories:{input:null,output:null,cacheRead:null,cacheCreation:null},total:null,rule:'No usage reported.'},
    {id:'e11',root:'t3',node:null,harness:'Codex',requested:'Model B',observed:'Model B',minutes:30,segment:'attempt',categories:{input:0,output:0,cacheRead:null,cacheCreation:null},total:0,rule:'Qualified zero.'},
    {id:'e12',root:'r3',node:'Plan',harness:'Claude Code',requested:'Opus',observed:'Opus',minutes:40,segment:'attempt',categories:{input:80,output:20,cacheRead:null,cacheCreation:null},total:100,rule:'Input and output are disjoint.'},
    {id:'e13',root:'r4',node:'Implement',harness:'Codex',requested:'Model A',observed:'Model B',minutes:30,segment:'active',categories:{input:50,output:5,cacheRead:null,cacheCreation:null},total:55,rule:'Provisional input and output.'}
  ];
  // Synthetic completion and timestamp witnesses; no private engine records are read.
  roots.push({ id: 'r5', name: 'Completion evidence missing', kind: 'workflow',
    repository: '/workspace/team-a/Harflow', workflow: 'Review', status: 'done',
    start: '2026-10-23T10:00:00+07:00', finish: null, finishWitness: 'Missing qualified completion sequence' });
  ledgerRecords.push({ id: 'e14', root: 'r5', node: 'Review', harness: 'Codex',
    requested: 'Model A', observed: 'Model B', minutes: 10, segment: 'attempt',
    categories: { input: null, output: null, cacheRead: null, cacheCreation: null },
    total: null, rule: 'Root completion witness missing; excluded from settled accounting.' });
  roots.push({ id: 'r6', name: 'Implement documentation', kind: 'workflow',
    repository: '/workspace/team-a/Harflow', workflow: 'Implementation', status: 'done',
    start: '2026-10-19T10:00:00+07:00', finish: '2026-10-19T10:20:00+07:00' });
  ledgerRecords.push({ id: 'e15', root: 'r6', node: 'Implement', harness: 'Codex',
    requested: 'Model B', observed: 'Model B', minutes: 15, segment: 'attempt',
    categories: { input: 30, output: 5, cacheRead: null, cacheCreation: null },
    total: 35, rule: 'Input and output are disjoint.' });
  const intervals = {
    e1: ['2026-10-26T23:40:00+07:00', '2026-10-27T00:00:00+07:00', 'done'],
    e2: ['2026-10-26T23:50:00+07:00', '2026-10-27T00:25:00+07:00', 'done'],
    e3: ['2026-10-27T00:10:00+07:00', '2026-10-27T00:25:00+07:00', 'done'],
    e4: ['2026-10-26T23:40:00+07:00', '2026-10-26T23:50:00+07:00', 'done'],
    e5: [null, null, 'unknown'],
    e6: ['2026-10-24T10:00:00+07:00', '2026-10-24T10:25:00+07:00', 'failed'],
    e7: ['2026-10-24T10:30:00+07:00', '2026-10-24T10:42:00+07:00', 'done'],
    e8: ['2026-10-25T09:00:00+07:00', '2026-10-25T09:30:00+07:00', 'done'],
    e9: ['2026-10-25T11:40:00+07:00', '2026-10-25T12:00:00+07:00', 'done'],
    e10: ['2026-10-20T09:00:00+07:00', '2026-10-20T09:20:00+07:00', 'cancelled'],
    e11: ['2026-10-10T09:00:00+07:00', '2026-10-10T09:30:00+07:00', 'done'],
    e12: ['2026-09-02T09:00:00+07:00', '2026-09-02T09:40:00+07:00', 'done'],
    e13: ['2026-10-27T11:30:00+07:00', null, 'running'],
    e14: ['2026-10-23T10:00:00+07:00', '2026-10-23T10:10:00+07:00', 'done'],
    e15: ['2026-10-19T10:00:00+07:00', '2026-10-19T10:15:00+07:00', 'done']
  };
  ledgerRecords.forEach(execution => {
    const [start, finish, status] = intervals[execution.id];
    Object.assign(execution, { contributionId: execution.id, start, finish, status, completionQualified: finish !== null,
      provenance: execution.ambiguous ? 'Native-child transport copy; ownership unresolved'
        : 'Synthetic contribution identity and segment timestamp witness' });
  });
  // Identical repeated snapshots share a contribution identity. Conflicting copies fail closed.
  const rawExecutions = [...ledgerRecords, { ...ledgerRecords.find(e => e.id === 'e2') }];
  const contributions = new Map();
  rawExecutions.forEach(record => {
    const previous = contributions.get(record.contributionId);
    if (!previous) contributions.set(record.contributionId, record);
    else if (JSON.stringify(previous) !== JSON.stringify(record)) {
      contributions.set(record.contributionId, { ...previous, ambiguous: true,
        total: null, rule: 'Conflicting snapshots for this contribution; excluded from additive totals.' });
    }
  });
  const executions = [...contributions.values()];
  const nestedRuns = [
    { id: 'n1', root: 'r1', name: 'Nested review', start: '2026-10-27T00:10:00+07:00', finish: '2026-10-27T00:25:00+07:00', executions: ['e3'] }
  ];
  const messages = [
    { id: 'm1', task: 't1', order: 1, kind: 'Initial message', text: 'Investigate the failing check.', segment: 'e8' },
    { id: 'm2', task: 't1', order: 2, kind: 'Follow-up message', text: 'Continue with the additional failure evidence.', segment: 'e9' }
  ];
  const freeze = value => {
    Object.freeze(value);
    Object.values(value).forEach(child => {
      if (child && typeof child === 'object' && !Object.isFrozen(child)) freeze(child);
    });
    return value;
  };
  HF.accountingFixture = freeze({ roots, executions, rawExecutions, nestedRuns, messages,
    now: '2026-10-27T12:00:00+07:00', timezone: 'Asia/Jakarta (UTC+07:00)' });

  const initial = state => ({ range: 30, repository: state === 'accounting-empty' ? '/workspace/team-b/Harflow' : 'all', workflow: state === 'accounting-empty' ? 'Implementation' : 'all', kind: 'all',
    status: 'all', node: 'all', harness: 'all', observed: 'all', requested: 'all',
    page: 0, selected: 'r1', measure: 'time', view: 'settled' });
  let current = initial();
  const valueName = value => value == null ? 'unknown' : value;
  const fieldValue = (row, key) => key === 'node' && row[key] == null && roots.some(root => root.id === row.root && root.kind === 'task') ? 'standalone'
    : key === 'workflow' && row.kind === 'task' ? 'no-workflow' : valueName(row[key]);
  const displayName = value => value === 'unknown' ? 'Unknown' : value === 'standalone' ? 'Standalone task' : value === 'no-workflow' ? 'No workflow' : value;
  const matches = (filter, value) => !filter || filter === 'all' || filter === valueName(value);
  const day = timestamp => timestamp.slice(0, 10);
  const minutes = (start, finish) => (Date.parse(finish) - Date.parse(start)) / 60000;
  const knownSum = values => {
    const known = values.filter(value => value != null);
    return known.length ? known.reduce((sum, value) => sum + value, 0) : null;
  };
  const metricValue = (row, measure) => measure === 'usage' ? row.usage : row.minutes;
  const ranked = (rows, measure) => [...rows].sort((a, b) => {
    const left = metricValue(a, measure), right = metricValue(b, measure);
    if (left == null) return right == null ? a.name.localeCompare(b.name) : 1;
    if (right == null) return -1;
    return right - left || a.name.localeCompare(b.name);
  });
  const executionDuration = e => e.start && (e.finish || e.status === 'running')
    ? minutes(e.start, e.finish || HF.accountingFixture.now) : null;
  const rootDuration = root => root.kind === 'workflow'
    ? (root.finish || root.status === 'running' ? minutes(root.start, root.finish || HF.accountingFixture.now) : null)
    : knownSum(executions.filter(e => e.root === root.id && !e.ambiguous).map(executionDuration));

  HF.accountingModel = (options = {}) => {
    const o = { ...initial(), ...options };
    const active = o.active === true || o.view === 'active';
    const end = Date.parse('2026-10-27T00:00:00+07:00');
    const cutoff = end - (Number(o.range) - 1) * 86400000;
    const matchesExecution = e => matches(o.node, fieldValue(e, 'node')) && matches(o.harness, e.harness)
      && matches(o.observed, e.observed) && matches(o.requested, e.requested);
    const inScope = root => {
      const start = Date.parse(day(root.start) + 'T00:00:00+07:00');
      return start >= cutoff && start <= end && matches(o.repository, root.repository)
        && matches(o.workflow, fieldValue(root, 'workflow')) && matches(o.kind, root.kind)
        && matches(o.status, root.status)
        && executions.some(e => e.root === root.id && matchesExecution(e));
    };
    const scoped = roots.filter(inScope);
    const selectedRoots = scoped.filter(root => active ? root.status === 'running'
      : ['done', 'failed', 'cancelled'].includes(root.status) && root.finish);
    // Evidence includes uncertain ownership, so an unknown-only filter retains its matching root.
    const evidence = executions.filter(e => selectedRoots.some(root => root.id === e.root) && matchesExecution(e));
    const selected = evidence.filter(e => !e.ambiguous);
    const rawEvidenceCount = rawExecutions.filter(e => selectedRoots.some(root => root.id === e.root) && matchesExecution(e)).length;
    const rootCoverage = selectedRoots.map(root => {
      const members = evidence.filter(e => e.root === root.id);
      const qualified = members.filter(e => !e.ambiguous && e.total != null).length;
      return { id: root.id, status: qualified === 0 ? 'unavailable'
        : qualified === members.length ? 'complete' : 'partial' };
    });
    const rootMetrics = selectedRoots.map(root => {
      const members = selected.filter(e => e.root === root.id);
      return { ...root, minutes: rootDuration(root), usage: knownSum(members.map(e => e.total)),
        count: evidence.filter(e => e.root === root.id).length,
        qualified: members.filter(e => e.total != null).length,
        coverage: rootCoverage.find(row => row.id === root.id).status };
    });
    const calendarDays = Array.from({ length: Number(o.range) }, (_, index) =>
      new Date(cutoff + index * 86400000 + 7 * 3600000).toISOString().slice(0, 10));
    const daily = calendarDays.map(date => {
      const members = rootMetrics.filter(root => day(root.start) === date);
      const workflows = members.filter(root => root.kind === 'workflow');
      const tasks = members.filter(root => root.kind === 'task');
      return { day: date, time: members.length ? knownSum(members.map(root => root.minutes)) : 0,
        usage: knownSum(members.map(root => root.usage)),
        workflowTime: workflows.length ? knownSum(workflows.map(root => root.minutes)) : 0,
        taskTime: tasks.length ? knownSum(tasks.map(root => root.minutes)) : 0,
        workflowUsage: knownSum(workflows.map(root => root.usage)),
        taskUsage: knownSum(tasks.map(root => root.usage)),
        workflowCount: workflows.length, taskCount: tasks.length };
    });
    const groups = key => {
      const names = [...new Set(evidence.map(e => fieldValue(e, key)))];
      return ranked(names.map(name => {
        const records = evidence.filter(e => fieldValue(e, key) === name);
        const additive = records.filter(e => !e.ambiguous);
        return { name, minutes: knownSum(additive.map(executionDuration)),
          usage: knownSum(additive.map(e => e.total)), count: records.length,
          durationKnown: additive.filter(e => executionDuration(e) != null).length,
          statuses: records.reduce((counts, e) => { counts[e.status] = (counts[e.status] || 0) + 1; return counts; }, {}),
          qualified: additive.filter(e => e.total != null).length,
          ambiguous: records.filter(e => e.ambiguous).length };
      }), o.measure);
    };
    const categories = {};
    ['input', 'output', 'cacheRead', 'cacheCreation'].forEach(key => {
      const known = selected.filter(e => e.categories[key] != null);
      categories[key] = { subtotal: knownSum(known.map(e => e.categories[key])),
        known: known.length, unavailable: evidence.length - known.length };
    });
    const workflowGroups = [...new Set(rootMetrics.filter(root => root.kind === 'workflow').map(root => valueName(root.workflow)))].map(name => {
      const runs = rootMetrics.filter(root => root.kind === 'workflow' && valueName(root.workflow) === name);
      const records = evidence.filter(e => runs.some(root => root.id === e.root));
      const attribution = key => [...new Set(records.map(e => fieldValue(e, key)))].map(value => ({
        name: value, count: records.filter(e => fieldValue(e, key) === value).length
      }));
      const totalMinutes = knownSum(runs.map(root => root.minutes));
      const qualifiedRuns = runs.filter(root => root.minutes != null).length;
      return { name, runs, runCount: runs.length, minutes: totalMinutes,
        averageMinutes: qualifiedRuns ? totalMinutes / qualifiedRuns : null, durationCount: qualifiedRuns,
        usage: knownSum(runs.map(root => root.usage)),
        coverage: runs.every(root => root.coverage === 'complete') ? 'complete'
          : runs.some(root => root.usage != null) ? 'partial' : 'unavailable',
        attribution: { harness: attribution('harness'), observed: attribution('observed') } };
    });
    const incompleteRoots = active ? [] : scoped.filter(root => root.status !== 'running'
      && !(['done', 'failed', 'cancelled'].includes(root.status) && root.finish));
    return { options: o, roots: selectedRoots, executions: selected, evidence, rawEvidenceCount,
      duplicateEvidenceCount: rawEvidenceCount - evidence.length, rootMetrics, rootCoverage, daily,
      groups: { node: groups('node'), harness: groups('harness'), observed: groups('observed') },
      runRankings: ranked(rootMetrics.filter(root => root.kind === 'workflow'), o.measure),
      rankings: { workflow: ranked(workflowGroups, o.measure),
        task: ranked(rootMetrics.filter(root => root.kind === 'task'), o.measure) },
      categories, elapsed: knownSum(rootMetrics.map(root => root.minutes)),
      usage: knownSum(selected.map(e => e.total)),
      qualified: selected.filter(e => e.total != null).length,
      unavailable: selected.filter(e => e.total == null).length,
      ambiguous: evidence.filter(e => e.ambiguous).length,
      activeExcluded: active ? 0 : scoped.filter(root => root.status === 'running').length,
      incompleteRoots, incompleteExcluded: incompleteRoots.length };
  };

  const esc = HF.escape;
  const button = (action, label, attributes = '') =>
    `<button type="button" data-action="acct-${action}" ${attributes}>${label}</button>`;
  const format = (value, unit) => value == null ? 'Unavailable' : `${value} ${unit}`;
  const usageText = value => value == null ? 'Usage unavailable' : `${value} known tokens`;
  const unique = (records, key) => [...new Set(records.map(row => fieldValue(row, key)))].sort();
  const filter = (key, label, values, options) => `<label>${label}<select data-acct-filter="${key}">
    ${key === 'range' ? '' : '<option value="all">All</option>'}
    ${values.map(value => `<option value="${esc(value)}"${String(options[key]) === value ? ' selected' : ''}>${esc(displayName(value))}</option>`).join('')}
    </select></label>`;
  const toolbar = (o, active) => `<div class="acct-filters">
    ${filter('range', 'Start range (days)', ['7', '30', '90'], o)}
    ${filter('repository', 'Repository', unique(roots, 'repository'), o)}
    ${filter('workflow', 'Workflow', unique(roots, 'workflow'), o)}
    ${filter('kind', 'Work kind', ['workflow', 'task'], o)}
    ${filter('status', 'Status', active ? ['running'] : ['done', 'failed', 'cancelled'], o)}
    ${filter('node', 'Node', unique(executions, 'node'), o)}
    ${filter('harness', 'Harness', unique(executions, 'harness'), o)}
    ${filter('requested', 'Requested model', unique(executions, 'requested'), o)}
    ${filter('observed', 'Observed model', unique(executions, 'observed'), o)}
    </div><div class="acct-actions acct-view-switch">${button('overview', 'Settled work')}${button('active', 'Active work')}</div>`;
  const heading = (title, subtitle) => `<header class="acct-heading"><div>
    <h2 tabindex="-1">${esc(title)}</h2><p>${esc(subtitle)}</p></div>${button('overview', 'Overview')}</header>`;
  const coverage = m => {
    const count = status => m.rootCoverage.filter(row => row.status === status).length;
    return `<p class="acct-note">${m.roots.length} matching roots · ${m.executions.length} matching additive executions · ${m.evidence.length} unique evidence records (${m.rawEvidenceCount} raw; ${m.duplicateEvidenceCount} repeated copies removed).
      Roots: ${count('complete')} complete, ${count('partial')} partial, ${count('unavailable')} unavailable.
      Qualified executions: ${m.qualified}; unavailable: ${m.unavailable}; ambiguous evidence excluded: ${m.ambiguous}.</p>`;
  };
  const measureControls = o => `<div class="acct-actions" aria-label="Ranking and chart measure">
    ${button('measure:time', 'Time', `aria-pressed="${o.measure === 'time'}"`)}
    ${button('measure:usage', 'Usage', `aria-pressed="${o.measure === 'usage'}"`)}</div>`;
  const rootRow = (root, o) => `<div class="acct-row"><div><strong>${esc(root.name)}</strong>
    <p>${esc(root.status)} · ${esc(day(root.start))} · ${esc(root.repository || 'Unknown repository')}</p>
    <p>${format(root.minutes, 'min')} · ${usageText(root.usage)} · ${root.coverage} usage (${root.qualified}/${root.count} qualified)</p>
    <details><summary>Contribution coverage and duration</summary><p>${root.kind === 'workflow'
      ? 'Whole matching workflow wall clock, including descendants once.'
      : 'All task execution intervals, excluding idle gaps; contribution filters do not shorten this root duration.'}
      ${o.measure === 'usage' ? 'Ranked by qualified known token subtotal; unavailable values follow reported values.' : 'Ranked by root duration.'}</p></details>
    </div>${button('detail:' + root.id, 'Inspect', `aria-label="Inspect ${esc(root.name)}"`)}</div>`;
  const ranking = (kind, m, o, full = false) => {
    const rows = kind === 'workflow' ? m.runRankings : m.rankings.task;
    const size = full ? 2 : 8;
    const pageCount = Math.max(1, Math.ceil(rows.length / size));
    const page = full ? Math.max(0, Math.min(Number(o.page), pageCount - 1)) : 0;
    const shown = rows.slice(page * size, page * size + size);
    return `<section class="acct-card"><div class="acct-card-head"><h3 tabindex="-1">${kind === 'workflow' ? 'Workflow runs' : 'Standalone tasks'}</h3>${measureControls(o)}</div>
      <p>${o.measure === 'usage' ? 'Known token subtotal · qualified disjoint contributions only' : 'Root duration · minutes'} · ${rows.length} matching ${kind === 'workflow' ? 'runs' : 'tasks'}</p>
      ${shown.map(root => rootRow(root, o)).join('') || '<p>No matching work.</p>'}
      ${full ? `<div class="acct-pagination">${button('page:' + (page - 1), 'Previous', page === 0 ? 'disabled' : '')}
        <span>Page ${page + 1} of ${pageCount}</span>${button('page:' + (page + 1), 'Next', page === pageCount - 1 ? 'disabled' : '')}</div>`
        : button(kind === 'workflow' ? 'runs' : 'tasks', `Show all ${rows.length} ${kind === 'workflow' ? 'runs' : 'tasks'}`)}
      </section>`;
  };
  const workflowRanking = (m, o) => `<section class="acct-card"><div class="acct-card-head"><h3>Workflows</h3>${measureControls(o)}</div>
    <p>Grouped by workflow identity · ${o.measure === 'usage' ? 'ranked by known token subtotal' : 'ranked by total run wall time'}</p>
    ${m.rankings.workflow.slice(0, 8).map(group => `<div class="acct-workflow-group"><h4>${esc(group.name === 'unknown' ? 'Unknown workflow' : group.name)}</h4>
      <p>${group.runCount} matching runs · ${format(group.minutes, 'min')} ${m.options.active || m.options.view === 'active' ? 'provisional live elapsed; no settled average' : `total wall time · ${format(group.averageMinutes == null ? null : Number(group.averageMinutes.toFixed(1)), 'min')} average (${group.durationCount} qualified run durations)`}</p>
      <p>${usageText(group.usage)} · ${group.coverage} usage</p>
      <p>${['harness', 'observed'].map(key => `${key === 'observed' ? 'Observed models' : 'Harnesses'}: ${group.attribution[key].map(item => `${esc(item.name === 'unknown' ? 'Unknown' : item.name)} (${item.count} evidence records)`).join(', ')}`).join(' · ')}</p>
      <details${o.openWorkflow === group.name ? ' open' : ''}><summary>Contributing runs (${group.runCount})</summary>
        ${ranked(group.runs, o.measure).slice(0, 8).map(root => rootRow(root, o)).join('')}
        ${button('workflow-runs:' + encodeURIComponent(group.name), `Show all ${group.runCount} runs for ${esc(group.name)}`)}</details></div>`).join('') || '<p>No matching workflows.</p>'}
    ${button('runs', 'All workflow runs')}</section>`;
  const chart = (m, o) => {
    const usage = o.measure === 'usage', unit = usage ? 'tokens' : 'min';
    const totalKey = usage ? 'usage' : 'time';
    const workflowKey = usage ? 'workflowUsage' : 'workflowTime';
    const taskKey = usage ? 'taskUsage' : 'taskTime';
    const maximum = Math.max(1, ...m.daily.map(row => row[totalKey] || 0));
    const seriesTotal = key => knownSum(m.daily.map(row => row[key]));
    const showDayLabel = index => m.daily.length === 7 || index === 0 || index === m.daily.length - 1
      || (index < m.daily.length - 3 && index % (m.daily.length === 90 ? 15 : 7) === 0);
    return `<section class="acct-card"><div class="acct-card-head"><h3>Daily start cohort</h3>${measureControls(o)}</div>
      <p>${usage ? 'Known token subtotal' : 'Whole matching workflow elapsed; standalone task execution intervals'} · Asia/Jakarta</p>
      <p class="acct-legend"><span>Workflow runs: ${format(seriesTotal(workflowKey), unit)}</span><span>Standalone tasks: ${format(seriesTotal(taskKey), unit)}</span>Total: ${format(usage ? m.usage : m.elapsed, unit)} · Common scale: 0–${maximum} ${unit}</p>
      <div class="acct-chart acct-chart-${m.daily.length}" aria-hidden="true">${m.daily.map((row, index) => `<div class="acct-day"><span class="acct-day-value">${m.daily.length === 90 ? '' : row[totalKey] == null ? (row.workflowCount + row.taskCount ? '?' : '') : row[totalKey] || (usage ? '0' : '')}</span>
        <div class="acct-bar-space">${usage && row[totalKey] === 0 ? '<b class="acct-zero-marker" title="Reported zero tokens"></b>' : ''}<div class="acct-stack" style="height:${((row[totalKey] || 0) / maximum * 100).toFixed(3)}%">
          <i class="acct-workflow-bar" style="height:${row[totalKey] ? (row[workflowKey] || 0) / row[totalKey] * 100 : 0}%"></i>
          <i class="acct-task-bar" style="height:${row[totalKey] ? (row[taskKey] || 0) / row[totalKey] * 100 : 0}%"></i>
        </div></div><small>${showDayLabel(index) ? esc(row.day.slice(5)) : '&nbsp;'}</small></div>`).join('')}</div>
      <details><summary>Daily values (${unit})</summary><table class="acct-table"><caption>Start-day cohort; unavailable values have no qualified evidence</caption>
        <thead><tr><th>Day</th><th>Workflow runs</th><th>Standalone tasks</th><th>Total</th></tr></thead>
        <tbody>${m.daily.map(row => `<tr><th>${esc(row.day)}</th><td>${row.workflowCount ? format(row[workflowKey], unit) : 'No workflows'}</td>
          <td>${row.taskCount ? format(row[taskKey], unit) : 'No tasks'}</td><td>${format(row[totalKey], unit)}</td></tr>`).join('')}</tbody></table></details>
      <p class="acct-note">Every selected calendar day occupies one position. Empty days have zero elapsed time and no reported usage; unavailable usage has no bar. A baseline dot marks qualified zero tokens. Known subtotals exclude unqualified and ambiguous evidence; partial roots remain partial.</p></section>`;
  };
  const contributionGroups = (m, o) => `<section class="acct-card"><h3>Execution contributions</h3>
    <p>Ranked by ${o.measure === 'usage' ? 'known tokens' : 'execution minutes'}. Execution intervals may overlap and exceed run wall clock.</p>
    ${['harness', 'node', 'observed'].map(key => `<details open><summary>By ${key === 'observed' ? 'observed model' : key}</summary>
      ${m.groups[key].map(group => `<div class="acct-row"><strong>${esc(displayName(group.name))}</strong><span>
        ${format(group.minutes, 'min')} (${group.durationKnown}/${group.count} available) · ${usageText(group.usage)} (${group.qualified}/${group.count} qualified)
        ${group.ambiguous ? ` · ${group.ambiguous} ambiguous` : ''}
        <small class="acct-group-meta">Mean execution duration: ${group.durationKnown ? (group.minutes / group.durationKnown).toFixed(1) + ' min' : 'Unavailable'} (${group.durationKnown} intervals).
        ${Object.entries(group.statuses).map(([status, count]) => `${count} ${esc(status)}`).join(', ')}.
        ${o.measure === 'usage' ? (group.usage != null && m.usage ? (group.usage / m.usage * 100).toFixed(1) + '% of qualified known tokens' : 'Share unavailable (zero or unavailable denominator)')
          : group.minutes != null && knownSum(m.executions.map(executionDuration)) ? (group.minutes / knownSum(m.executions.map(executionDuration)) * 100).toFixed(1) + '% of known execution minutes' : 'Share unavailable'}</small></span></div>`).join('')}</details>`).join('')}
    <details open><summary>Category evidence</summary>${Object.entries(m.categories).map(([key, category]) => `<div class="acct-row"><span>${esc(key)}</span>
      <span>${format(category.subtotal, 'reported tokens')} · ${category.known}/${m.evidence.length} available</span></div>`).join('')}
    <p class="acct-note">Categories can overlap; never add these subtotals. Ambiguous ownership is excluded from category and scalar totals.</p></details></section>`;
  const summary = (m, active) => {
    const workflows = m.rootMetrics.filter(root => root.kind === 'workflow');
    const tasks = m.rootMetrics.filter(root => root.kind === 'task' && root.minutes != null);
    const mean = rows => rows.length ? (rows.reduce((sum, row) => sum + row.minutes, 0) / rows.length).toFixed(1) + ' min' : 'Unavailable';
    return `<div class="acct-tiles"><section><span>${active ? 'Live elapsed to fixture clock' : 'Elapsed time of matching runs and tasks'}</span>
      <strong>${format(m.elapsed, 'min')}</strong><small>Whole workflow wall clock + all standalone execution intervals</small></section>
      <section><span>${active ? 'Provisional known token subtotal' : 'Known token subtotal'}</span><strong>${format(m.usage, 'tokens')}</strong><small>${m.qualified} qualified contributions</small></section>
      <section><span>Matching roots</span><strong>${m.roots.length}</strong><small>${active ? 'Active work only; provisional values' : `${m.activeExcluded} active and ${m.incompleteExcluded} incomplete matching roots excluded`}</small></section></div>
      <p class="acct-note">Elapsed shows the whole matching root duration, including all standalone execution intervals. It is not attributable or additive across node, harness, or model filter values; those filters narrow execution usage and ranking contributions only.</p>${coverage(m)}${!active && m.incompleteExcluded ? `<details><summary>Incomplete work excluded (${m.incompleteExcluded})</summary>${m.incompleteRoots.map(root => `<p>${esc(root.name)} · ${esc(root.id)}: ${esc(root.finishWitness || 'Missing qualified root finish witness')}. No settled duration or usage included.</p>`).join('')}</details>` : ''}<p class="acct-note">${active ? 'Active work has no settled averages.'
        : `Mean settled workflow wall time: ${mean(workflows)} (${workflows.length} workflows). Mean standalone execution time: ${mean(tasks)} (${tasks.length} tasks with duration).`}</p>`;
  };
  const executionRow = e => `<div class="acct-row"><div><strong>${esc(e.node || 'Standalone task')} · ${esc(e.segment)} · ${e.id}</strong>
    <p>${esc(e.harness)} · requested ${esc(e.requested || 'Unknown')} · observed ${esc(e.observed || 'Unknown')}</p>
    <p>${esc(e.rule)}</p><p>${esc(e.status)} · completion ${e.completionQualified ? 'qualified' : 'unqualified'} · ${esc(e.provenance)}</p><p>${esc(e.start || 'Start unavailable')} → ${esc(e.finish || (e.status === 'running' ? HF.accountingFixture.now + ' (live)' : 'Finish unavailable'))}</p>${e.ambiguous ? '<p>Ambiguous ownership: evidence only, excluded from all additive totals.</p>' : ''}</div>
    <span>${format(executionDuration(e), 'min')} · ${e.total == null ? 'Usage unavailable' : e.total + ' tokens'}</span></div>`;
  const detail = o => {
    const root = roots.find(row => row.id === o.selected) || roots[0];
    const evidence = executions.filter(e => e.root === root.id);
    const nested = nestedRuns.filter(row => row.root === root.id);
    return `<div class="acct-page">${heading(root.name, 'Execution evidence · ' + root.status)}${button('back', 'Back')}
      <section class="acct-card"><p>Root ${root.id} · ${esc(root.repository || 'Unknown repository')} · started ${esc(root.start)}</p>
      <p>${root.finishWitness ? esc(root.finishWitness) : 'Qualified root timing witness'}</p><p>${format(rootDuration(root), 'min')} · ${root.kind === 'workflow' ? 'Root wall clock' : 'Execution intervals; idle gaps excluded'}</p>
      <p class="acct-note">All retained evidence for this root is shown here, including contributions outside the current filters. Back returns to the filtered ranking.</p>
      ${evidence.map(executionRow).join('')}${root.id === 't1' ? button('turns', 'View task messages') : ''}
      ${nested.map(row => `<details open><summary>${esc(row.name)} · nested workflow ${row.id}</summary><p>${format(minutes(row.start, row.finish), 'min')} wall clock · ${esc(row.start)} → ${esc(row.finish)}.
        Descendant contributions: ${row.executions.join(', ')}. Already contained within root ${root.id}; never added as a second root.</p></details>`).join('')}
      </section></div>`;
  };
  const turns = () => `<div class="acct-page">${heading('Task messages', 'Investigate a failure · standalone task')}${button('turn-back', 'Back to execution')}
    <section class="acct-card"><h3>Ordered messages</h3><ol>${messages.filter(message => message.task === 't1').map(message => `<li><strong>${message.kind}</strong>
      <p>${esc(message.text)}</p><p>Associated segment ${message.segment}; per-message time and tokens unavailable.</p></li>`).join('')}</ol>
      <h3>Separately accounted execution segments</h3>${executions.filter(e => e.root === 't1').map(executionRow).join('')}
      <p class="acct-note">Messages are not executions. Segment totals are never apportioned across messages.</p></section></div>`;
  const context = state => {
    const kind = state.slice('accounting-context-'.length);
    const title = kind === 'workflow' ? 'Implementation workflow' : kind === 'run' ? 'Implement and review · completed run' : 'Repository · /workspace/team-a/Harflow';
    return `<div class="acct-page">${heading('Statistics in context', 'Exploratory launch placement')}<section class="acct-card"><h3>${title}</h3>
      <p>${kind === 'workflow' ? 'Saved workflow · retained execution history' : kind === 'run' ? 'Completed · 26 Oct · 60 min elapsed' : 'Work in this repository'}</p>
      ${button('launch:' + kind, kind === 'run' ? 'View run accounting' : 'View statistics')}</section></div>`;
  };
  HF.accountingBody = (state, options = {}) => {
    const o = { ...initial(state), ...options };
    const active = state === 'accounting-active' || (['accounting-runs', 'accounting-tasks'].includes(state) && o.view === 'active');
    if (state.startsWith('accounting-context-')) return context(state);
    if (state === 'accounting-detail') return detail(o);
    if (state === 'accounting-turns') return turns();
    const special = {
      'accounting-loading': '<section class="acct-card" role="status">Loading statistics…</section>',
      'accounting-error': `<section class="acct-card" role="alert"><h3>Could not load statistics</h3><p>Try reading retained history again.</p>${button('retry', 'Retry')}</section>`,
      'accounting-no-history': '<section class="acct-card"><h3>No retained history</h3><p>Completed work will appear here while it remains available.</p></section>'
    };
    if (special[state]) return `<div class="acct-page">${heading('Statistics', 'Retained history')}${special[state]}</div>`;
    const m = HF.accountingModel({ ...o, active });
    let body;
    if (state === 'accounting-runs' || state === 'accounting-tasks') body = coverage(m) + ranking(state === 'accounting-runs' ? 'workflow' : 'task', m, o, true);
    else if (!m.roots.length) body = `<section class="acct-card"><h3>No matching work</h3><p>Change filters to see retained history.</p>${button('clear', 'Clear filters')}</section>`;
    else body = summary(m, active) + chart(m, o) + workflowRanking(m, o) + ranking('task', m, o) + contributionGroups(m, o);
    return `<div class="acct-page">${heading(active ? 'Active work' : 'Statistics', active ? 'Live elapsed to fixed fixture clock · provisional' : 'Settled work · start-day cohort · fixed fixture clock')}${toolbar(o, active)}${body}</div>`;
  };
  HF.resetAccounting = state => { current = { ...initial(state), view: state === 'accounting-active' ? 'active' : 'settled' }; };
  HF.renderAccounting = state => {
    if (state === 'accounting-empty') current = { ...current, repository: '/workspace/team-b/Harflow', workflow: 'Implementation' };
    const entry = `<div class="section-label">Overview</div><button type="button" class="task-row acct-entry active" data-action="acct-overview" aria-current="page"><span class="task-row-copy"><strong>Statistics</strong><small>Accounting exploration</small></span></button>`;
    const sidebar = HF.sidebar('populated').replace('class="task-row active"', 'class="task-row"')
      .replace('<div class="workflows-heading">', entry + '<div class="workflows-heading">');
    return HF.app(`<div class="split">${sidebar}<main class="content stat-content" id="accounting-content">${HF.accountingBody(state, current)}</main></div>`);
  };
  HF.accountingController = { get state() { return { ...current }; }, reset: HF.resetAccounting };

  if (typeof document !== 'undefined') {
    const activeRoute = () => HF.route?.screen === 'statistics' && HF.route.state.startsWith('accounting-');
    const focus = selector => document.querySelector(selector)?.focus();
    const render = () => {
      const content = document.querySelector('#accounting-content');
      if (content) content.innerHTML = HF.accountingBody(HF.route.state, current);
    };
    const route = state => {
      HF.route.state = state;
      try { history.replaceState(history.state, '', `#statistics/${state}/${HF.appearance?.themeMode || 'system'}`); } catch { /* Offline previews can restrict history. */ }
      const picker = document.querySelector('#state-picker');
      if (picker) picker.value = state;
      const caption = document.querySelector('#specimen-caption');
      if (caption) caption.textContent = HF.specimenStatus('statistics', state).caption;
      render();
      focus('#accounting-content h2');
    };
    document.addEventListener('change', event => {
      if (!activeRoute()) return;
      const element = event.target.closest?.('[data-acct-filter]');
      if (!element) return;
      const key = element.dataset.acctFilter;
      current[key] = element.value;
      current.page = 0;
      if (HF.route.state === 'accounting-empty') route('accounting-overview');
      else render();
      focus(`[data-acct-filter="${key}"]`);
    }, true);
    document.addEventListener('click', event => {
      if (!activeRoute()) return;
      const element = event.target.closest?.('[data-action^="acct-"]');
      if (!element || element.disabled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const [name, value] = element.dataset.action.slice(5).split(':');
      if (name === 'page' || name === 'measure') {
        current[name] = name === 'page' ? Number(value) : value;
        if (name === 'measure') current.page = 0;
        render();
        focus(name === 'page' ? '#accounting-content h3' : `[data-action="acct-measure:${value}"]`);
      } else if (name === 'detail') {
        current.returnState = HF.route.state;
        current.returnFocus = element.getAttribute?.('aria-label');
        current.selected = value;
        if (['accounting-overview', 'accounting-active'].includes(HF.route.state)) current.openWorkflow = roots.find(root => root.id === value)?.workflow;
        route('accounting-detail');
      } else if (name === 'back') {
        route(current.returnState || 'accounting-overview');
        if (current.returnFocus) focus(`[aria-label="${current.returnFocus.replace(/"/g, '\\"')}"]`);
      } else if (name === 'turn-back') {
        current.selected = 't1';
        route('accounting-detail');
      } else if (name === 'turns') {
        route('accounting-turns');
      } else if (name === 'workflow-runs') {
        current.workflow = decodeURIComponent(value);
        current.page = 0;
        route('accounting-runs');
      } else if (name === 'launch') {
        if (value === 'repository') current.repository = '/workspace/team-a/Harflow';
        if (value === 'workflow') current.workflow = 'Implementation';
        if (value === 'run') {
          current.selected = 'r1';
          current.returnState = HF.route.state;
          route('accounting-detail');
        } else route('accounting-overview');
      } else if (name === 'clear') {
        current = initial();
        route('accounting-overview');
      } else if (name === 'retry') {
        route(current.view === 'active' ? 'accounting-active' : 'accounting-overview');
      } else if (['overview', 'runs', 'tasks', 'active'].includes(name)) {
        if (name === 'active' || name === 'overview') {
          current.view = name === 'active' ? 'active' : 'settled';
          current.status = 'all';
        }
        current.page = 0;
        route('accounting-' + name);
      }
    }, true);
  }
})();
