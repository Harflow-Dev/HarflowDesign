(function () {
  // Start screen: the main window's detail pane when no task or workflow is selected.
  // Pure helpers (HF.startGreeting, HF.startStatusLine, HF.startWorkflowRows) hold the content rules;
  // HF.startScreen renders them. Nothing here reads the clock: callers pass the hour, so specimens stay deterministic.
  const esc = HF.escape;
  const WORKFLOW_LIMIT = 3;
  const count = value => Number.isInteger(value) && value > 0 ? value : 0;
  const plural = (n, noun) => `${n} ${noun}${n === 1 ? '' : 's'}`;
  // "1 task", "2 workflows", "1 task and 2 workflows"; a zero part is left out.
  const phrase = (tasks, workflows) => [tasks && plural(tasks, 'task'), workflows && plural(workflows, 'workflow')].filter(Boolean).join(' and ');
  const collator = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

  // Greeting by local hour: 05-06 early start, 07-11 morning, 12-17 afternoon, 18-22 evening, 23-04 working late.
  HF.startGreeting = hour => {
    const h = Number.isFinite(hour) ? ((Math.floor(hour) % 24) + 24) % 24 : 12;
    if (h >= 5 && h < 7) return 'Early start';
    if (h >= 7 && h < 12) return 'Good morning';
    if (h >= 12 && h < 18) return 'Good afternoon';
    if (h >= 18 && h < 23) return 'Good evening';
    return 'Working late';
  };

  // counts: { runningTasks, runningWorkflows, finishedToday, finishedYesterday, finishedLast7Days }, where each
  // finished entry is { tasks, workflows }. Tasks that a workflow run started are counted once, as the run.
  // Returns '' when counts are unknown (null or undefined) or still loading ('loading'); the renderer decides
  // between no line and a skeleton bar.
  HF.startStatusLine = counts => {
    if (!counts || typeof counts !== 'object') return '';
    const running = phrase(count(counts.runningTasks), count(counts.runningWorkflows));
    const sentence = running ? `${running} running.` : 'Nothing running.';
    const windows = [['finishedToday', 'today'], ['finishedYesterday', 'yesterday'], ['finishedLast7Days', 'in the last 7 days']];
    for (const [key, label] of windows) {
      const finished = phrase(count(counts[key]?.tasks), count(counts[key]?.workflows));
      if (finished) return `${sentence} ${finished} finished ${label}.`;
    }
    return sentence;
  };

  // Up to three workflows, most runs first; ties and never-run workflows alphabetical (localized, case-insensitive).
  // Run counts are shown only when every workflow has one; otherwise all are listed alphabetically without counts.
  HF.startWorkflowRows = workflows => {
    const list = (workflows || []).map((workflow, index) => ({ ...workflow, index }));
    const known = list.every(workflow => Number.isInteger(workflow.runs) && workflow.runs >= 0);
    const ordered = list.sort((a, b) => (known ? b.runs - a.runs : 0) || collator(a.name, b.name) || a.index - b.index);
    const label = runs => runs === 0 ? 'Never run' : plural(runs, 'run');
    return {
      total: ordered.length,
      showAll: ordered.length > WORKFLOW_LIMIT,
      rows: ordered.slice(0, WORKFLOW_LIMIT).map(workflow => ({ id: workflow.id, name: workflow.name, runs: known ? label(workflow.runs) : '' }))
    };
  };

  const statusBlock = counts => counts === 'loading'
    ? '<div class="start-status-skeleton" role="status" aria-label="Loading status"><i></i></div>'
    : counts ? `<p class="start-status">${esc(HF.startStatusLine(counts))}</p>` : '';

  const workflowCard = workflows => {
    const { rows, total, showAll } = HF.startWorkflowRows(workflows);
    if (!rows.length) {
      return `<div class="start-card start-card-empty"><h3 class="start-empty-title">No workflows yet</h3><p class="start-empty-body">A workflow is a saved graph of agents, such as plan, implement and review. Build one once and run it on any task.</p><button type="button" class="start-btn tinted" data-action="route:workflow-editor/empty"><i class="start-glyph start-glyph-plus" aria-hidden="true"></i><span>Create workflow</span></button></div>`;
    }
    const items = rows.map(row => `<button type="button" class="start-workflow-row" data-action="route:workflow-launch/launch" aria-label="Run ${esc(row.name)}"${row.id ? ` data-workflow-id="${esc(row.id)}"` : ''}><span class="start-tile" aria-hidden="true"><i class="start-glyph start-glyph-workflow"></i></span><span class="start-workflow-name">${esc(row.name)}</span>${row.runs ? `<span class="start-workflow-runs" aria-hidden="true">${row.runs}</span>` : ''}<span class="start-run" aria-hidden="true"><i class="start-glyph start-glyph-play"></i><span>Run</span></span></button>`).join('');
    const more = showAll ? `<button type="button" class="start-show-all" data-action="route:workflow-launch/library">Show all ${total} workflows</button>` : '';
    return `<div class="start-card">${items}${more}</div>`;
  };

  // options: { hour (0-23), counts (object | null | 'loading'), workflows: [{ id?, name, runs? }] }
  HF.startScreen = (options = {}) => {
    const workflows = options.workflows || [];
    const hasWorkflows = workflows.length > 0;
    const actions = `<div class="start-actions"><button type="button" class="start-btn primary" data-action="route:new-session/default" aria-label="New session, Command N"><i class="start-glyph start-glyph-plus" aria-hidden="true"></i><span>New session</span><span class="start-shortcut" aria-hidden="true">⌘N</span></button>${hasWorkflows ? '<button type="button" class="start-btn tinted" data-action="route:workflow-editor/empty"><i class="start-glyph start-glyph-workflow" aria-hidden="true"></i><span>New workflow</span></button>' : ''}</div>`;
    const list = hasWorkflows
      ? `<section class="start-workflows" aria-labelledby="start-workflows-heading"><h3 class="start-heading" id="start-workflows-heading">Run a workflow</h3>${workflowCard(workflows)}</section>`
      : `<section class="start-workflows" aria-label="Workflows">${workflowCard(workflows)}</section>`;
    return `<section class="start-screen" aria-labelledby="start-greeting"><div class="start-column"><header class="start-header"><span class="start-emblem" aria-hidden="true"></span><h2 class="start-greeting" id="start-greeting">${HF.startGreeting(options.hour)}</h2>${statusBlock(options.counts)}</header>${actions}${list}</div></section>`;
  };

  // ---- Deterministic specimen models ---------------------------------------------------------------------
  // Counts follow the populated sidebar fixtures (see docs/screen-inventory.md, "Approved start screen"):
  // running: "Review session persistence" (task) and the "Review bot" parallel run (counted once, as a workflow);
  // finished today: the two terminal tasks (Done child "Refine workflow validation", Failed "Implement inspector state");
  // finished yesterday: "Audit artifact references". Tasks started by the parallel run are not counted as tasks.
  const SIDEBAR_COUNTS = {
    runningTasks: 1, runningWorkflows: 1,
    finishedToday: { tasks: 2, workflows: 0 }, finishedYesterday: { tasks: 1, workflows: 0 }, finishedLast7Days: { tasks: 3, workflows: 0 }
  };
  // With no saved workflows the sidebar hides the parallel run row, so only the running task remains.
  const NO_WORKFLOW_COUNTS = { ...SIDEBAR_COUNTS, runningWorkflows: 0 };
  const NO_ACTIVITY = { runningTasks: 0, runningWorkflows: 0, finishedToday: {}, finishedYesterday: {}, finishedLast7Days: {} };
  // The two default sidebar workflows (scripts/tasks.js), with fixture run totals.
  const DEFAULT_WORKFLOWS = runs => [{ id: 'session-reliability', name: 'Session reliability', runs: runs?.[0] }, { id: 'development-workflow', name: 'Development workflow', runs: runs?.[1] }];
  const PROPOSAL_RUNS = { 'session-reliability': 12, 'development-workflow': 7, 'release-checklist': 7 };

  // Options for HF.startScreen in each catalog state that shows it, or null.
  HF.startStateModel = state => {
    if (state === 'start') return { hour: 14, counts: SIDEBAR_COUNTS, workflows: DEFAULT_WORKFLOWS([12, 1]) };
    if (state === 'no-results' || state === 'backend-empty') return { hour: 14, counts: SIDEBAR_COUNTS, workflows: DEFAULT_WORKFLOWS([12, 1]) };
    if (state === 'start-no-workflows') return { hour: 9, counts: NO_WORKFLOW_COUNTS, workflows: [] };
    if (state === 'empty') return { hour: 9, counts: NO_ACTIVITY, workflows: DEFAULT_WORKFLOWS([0, 0]) };
    if (state === 'loading') return { hour: 9, counts: 'loading', workflows: DEFAULT_WORKFLOWS() };
    if (state === 'list-error') return { hour: 9, counts: null, workflows: DEFAULT_WORKFLOWS() };
    if (HF.sidebarProposalStates?.includes(state)) {
      const shown = ['context-menu', 'delete-confirmation'].includes(state) ? HF.sidebarWorkflows.slice(0, 2) : HF.sidebarWorkflows;
      return { hour: 14, counts: SIDEBAR_COUNTS, workflows: shown.map(workflow => ({ id: workflow.id, name: workflow.name, runs: PROPOSAL_RUNS[workflow.id] })) };
    }
    return null;
  };
  HF.startStates = ['start', 'start-no-workflows', 'empty', 'loading', 'list-error', 'no-results', 'backend-empty'];
})();
