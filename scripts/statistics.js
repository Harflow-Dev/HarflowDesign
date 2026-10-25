(function () {
  // Exploratory Statistics page (#9). No native source exists. Figures are deterministic fixtures derived from the
  // Harflow Statistics design canvas (version 1792889509-4534); dates are anchored to 2026-10-25 and computed in UTC.
  const esc = HF.escape;
  const WORKFLOWS = [
    { name: 'Implement and review', min: 2292, tok: 2600, runs: 96, model: 'opus', nodes: [
      { name: 'Plan changes', role: 'Planning', h: 'claude', model: 'opus', t: 0.14, k: 0.12 },
      { name: 'Implement', role: 'Implementation', h: 'claude', model: 'opus', t: 0.52, k: 0.48 },
      { name: 'Code review', role: 'Review', h: 'codex', model: 'gpt-5', t: 0.21, k: 0.22 },
      { name: 'Run tests', role: 'Test', h: 'opencode', model: 'qwen3-coder', t: 0.18, k: 0.05 },
      { name: 'Fix review findings', role: 'Implementation', h: 'claude', model: 'sonnet', t: 0.17, k: 0.13, x: 0.6 }] },
    { name: 'Plan and checklist', min: 845, tok: 1100, runs: 52, model: 'sonnet', nodes: [
      { name: 'Draft plan', role: 'Planning', h: 'claude', model: 'sonnet', t: 0.55, k: 0.6 },
      { name: 'Build checklist', role: 'Planning', h: 'codex', model: 'gpt-5', t: 0.3, k: 0.25 },
      { name: 'Validate checklist', role: 'Review', h: 'vibe', model: 'devstral', t: 0.2, k: 0.15 }] },
    { name: 'Council review', min: 580, tok: 1400, runs: 18, model: 'opus', nodes: [
      { name: 'Gather context', role: 'Planning', h: 'claude', model: 'sonnet', t: 0.15, k: 0.1 },
      { name: 'Council member: Claude', role: 'Review', h: 'claude', model: 'opus', t: 0.4, k: 0.3 },
      { name: 'Council member: Codex', role: 'Review', h: 'codex', model: 'gpt-5', t: 0.38, k: 0.28 },
      { name: 'Council member: Vibe', role: 'Review', h: 'vibe', model: 'devstral', t: 0.35, k: 0.22 },
      { name: 'Synthesize verdict', role: 'Review', h: 'claude', model: 'opus', t: 0.12, k: 0.1 }] },
    { name: 'Release notes draft', min: 262, tok: 420, runs: 12, model: 'sonnet', nodes: [
      { name: 'Collect merged changes', role: 'Planning', h: 'codex', model: 'gpt-5', t: 0.3, k: 0.2 },
      { name: 'Draft notes', role: 'Implementation', h: 'claude', model: 'sonnet', t: 0.5, k: 0.6 },
      { name: 'Edit for tone', role: 'Review', h: 'claude', model: 'sonnet', t: 0.25, k: 0.2 }] },
    { name: 'Dependency bump', min: 190, tok: 180, runs: 21, model: 'haiku', nodes: [
      { name: 'Bump versions', role: 'Implementation', h: 'codex', model: 'gpt-5-mini', t: 0.35, k: 0.3 },
      { name: 'Run tests', role: 'Test', h: 'opencode', model: 'qwen3-coder', t: 0.5, k: 0.4 },
      { name: 'Open pull request', role: 'Implementation', h: 'codex', model: 'gpt-5-mini', t: 0.15, k: 0.3 }] },
    { name: 'Bug triage', min: 168, tok: 610, runs: 30, model: 'sonnet', nodes: [
      { name: 'Reproduce', role: 'Test', h: 'opencode', model: 'qwen3-coder', t: 0.4, k: 0.3 },
      { name: 'Classify', role: 'Planning', h: 'claude', model: 'sonnet', t: 0.25, k: 0.35 },
      { name: 'Assign and label', role: 'Planning', h: 'vibe', model: 'devstral', t: 0.35, k: 0.35 }] },
    { name: 'Test coverage sweep', min: 115, tok: 350, runs: 7, model: 'sonnet', nodes: [
      { name: 'Find coverage gaps', role: 'Planning', h: 'claude', model: 'sonnet', t: 0.2, k: 0.25 },
      { name: 'Write tests', role: 'Implementation', h: 'claude', model: 'sonnet', t: 0.55, k: 0.55 },
      { name: 'Run suite', role: 'Test', h: 'opencode', model: 'qwen3-coder', t: 0.35, k: 0.2 }] }
  ];
  const TASKS = [
    { name: 'Add idempotency keys to refund endpoint', h: 'claude', repo: 'billing-api', min: 161, tok: 380, turns: 4 },
    { name: 'Migrate analytics events to the new schema', h: 'opencode', repo: 'mobile', min: 112, tok: 510, turns: 3 },
    { name: 'Fix flaky checkout total rounding test', h: 'codex', repo: 'web', min: 78, tok: 120, turns: 2 },
    { name: 'Review the retry policy for webhook delivery', h: 'vibe', repo: 'billing-api', min: 58, tok: 210, turns: 3 },
    { name: 'Draft the Q4 release notes', h: 'claude', repo: 'web', min: 44, tok: 90, turns: 2 },
    { name: 'Check refund rounding rules in the ledger module', h: 'codex', repo: 'billing-api', min: 31, tok: 70, turns: 1 },
    { name: 'Bump the payments SDK', h: 'antigravity', repo: 'mobile', min: 22, tok: 150, turns: 2 }
  ];
  // HF.harnessName is defined by a later script, so it is resolved at render time.
  const HN = h => HF.harnessName(h);
  const ROLE_ICON = { Planning: 'clipboard', Implementation: 'hammer', Review: 'bubble-check', Test: 'terminal' };
  const REPOS = ['billing-api', 'web', 'mobile'];
  const TASK_TOTAL = { min: 680, tok: 1900, count: 41 };
  const FACTOR = { 7: 0.23, 30: 1, 90: 2.9 };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const END = Date.UTC(2026, 9, 25);
  const DAY = 86400000;
  const MAX_RUNS = 8;
  const CHART_H = 180;

  const fmtTime = m => { m = Math.round(m); if (m < 1) return '< 1 min'; if (m < 60) return m + ' min'; const h = Math.floor(m / 60), r = m % 60; return r ? h + ' h ' + r + ' min' : h + ' h'; };
  const fmtTok = k => k >= 1000 ? (k / 1000).toFixed(1) + ' M tokens' : k < 1 ? Math.round(k * 1000) + ' tokens' : Math.round(k) + ' k tokens';
  const fmtAxis = (v, usage) => usage ? (v >= 1000 ? (+(v / 1000).toFixed(1)) + ' M' : Math.round(v) + ' k') : (+(v / 60).toFixed(1)) + ' h';
  const nice = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); for (const s of [1, 2, 2.5, 5, 10]) if (s * p >= v) return s * p; return 10 * p; };
  const rnd = (i, s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const hash = str => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973; return h; };
  const pad = n => (n < 10 ? '0' : '') + n;
  const dayOf = ago => new Date(END - ago * DAY);
  const dayLabel = d => MON[d.getUTCMonth()] + ' ' + d.getUTCDate();
  const stamp = (ago, minuteOfDay) => dayLabel(dayOf(ago)) + ', ' + pad(Math.floor(minuteOfDay / 60)) + ':' + pad(minuteOfDay % 60);
  const plural = (n, one, many = one + 's') => n + ' ' + (n === 1 ? one : many);

  const fresh = state => ({ range: 30, measure: 'time', list: 'workflows', open: {}, screen: state === 'nodes' ? 'nodes' : 'overview', workflow: WORKFLOWS[0].name });
  let current = fresh();
  HF.resetStatistics = () => { current = fresh(HF.route?.screen === 'statistics' ? HF.route.state : undefined); };

  const workflowRuns = (w, range, usage, fmt, fmtOther) => {
    const seed = hash(w.name), total = Math.max(1, Math.round(w.runs * FACTOR[range])), shown = Math.min(MAX_RUNS, total), runs = [];
    for (let i = 0; i < shown; i++) {
      const a = rnd(i, seed), b = rnd(i, seed + 7), c = rnd(i, seed + 13);
      runs.push({ min: (w.min / w.runs) * (0.45 + a * 1.2), tok: (w.tok / w.runs) * (0.4 + b * 1.3), failed: c < 0.1, when: stamp(Math.floor(rnd(i, seed + 3) * range), 480 + Math.floor(rnd(i, seed + 5) * 660)), repo: REPOS[(seed + i) % 3] });
    }
    const key = usage ? 'tok' : 'min', otherKey = usage ? 'min' : 'tok';
    runs.sort((x, y) => y[key] - x[key]);
    const max = runs.length ? runs[0][key] : 1;
    return { shown, total, children: runs.map(r => ({ failed: r.failed, status: r.failed ? 'Failed' : 'Done', when: r.when, meta: r.repo + ' · ' + w.nodes.length + ' nodes', pct: +(r[key] / max * 100).toFixed(1), value: fmt(r[key]), other: fmtOther(r[otherKey]) })) };
  };

  const taskTurns = (t, usage, range, fmt, fmtOther) => {
    const seed = hash(t.name), ws = [], wk = [];
    let sw = 0, sk = 0;
    for (let i = 0; i < t.turns; i++) {
      const a = i === 0 ? 1.6 : 0.4 + rnd(i, seed), b = i === 0 ? 1.8 : 0.3 + rnd(i, seed + 9);
      ws.push(a); wk.push(b); sw += a; sk += b;
    }
    const key = usage ? 'tok' : 'min', otherKey = usage ? 'min' : 'tok';
    const f = FACTOR[range], turns = ws.map((a, i) => ({ min: a / sw * t.min * f, tok: wk[i] / sk * t.tok * f }));
    const max = Math.max(...turns.map(x => x[key]));
    const day = seed % range, start = 540 + (seed % 300);
    return turns.map((x, i) => ({ failed: false, status: 'Done', when: stamp(day, start + i * 47), meta: 'Turn ' + (i + 1) + ' · ' + (i === 0 ? 'Initial prompt' : 'Follow-up message'), pct: +(x[key] / max * 100).toFixed(1), value: fmt(x[key]), other: fmtOther(x[otherKey]) }));
  };

  // The view model. All figures shown by the specimen are computed here so they can be inspected without the DOM.
  HF.statisticsModel = (opts = {}) => {
    const o = { ...fresh(), ...opts };
    const range = FACTOR[o.range] ? o.range : 30, f = FACTOR[range];
    const usage = o.measure === 'usage', key = usage ? 'tok' : 'min', otherKey = usage ? 'min' : 'tok';
    const fmt = v => usage ? fmtTok(v) : fmtTime(v), fmtOther = v => usage ? fmtTime(v) : fmtTok(v);
    const wfSum = WORKFLOWS.reduce((a, w) => a + w[key], 0) * f, tkSum = TASK_TOTAL[key] * f;

    // Daily series seeded by days-ago so ranges overlap consistently; weekends dip.
    const days = [];
    let wW = 0, tW = 0;
    for (let i = 0; i < range; i++) {
      const ago = range - 1 - i, d = dayOf(ago), dow = d.getUTCDay(), wk = dow === 0 || dow === 6 ? 0.3 : 1;
      const w = wk * (0.35 + rnd(ago, usage ? 3 : 1)), t = wk * (0.25 + rnd(ago, usage ? 4 : 2));
      wW += w; tW += t;
      days.push({ d, ago, w, t });
    }
    let maxDay = 0;
    for (const x of days) { x.wv = x.w / wW * wfSum; x.tv = x.t / tW * tkSum; maxDay = Math.max(maxDay, x.wv + x.tv); }
    const top = usage ? nice(maxDay) : nice(maxDay / 60) * 60, every = range === 7 ? 1 : range === 30 ? 7 : 15;
    const bars = days.map(x => {
      const tkPx = x.tv / top * CHART_H, wfPx = x.wv / top * CHART_H, label = dayLabel(x.d);
      return { day: label, label: x.ago % every === 0 ? label : '', wfPx: +wfPx.toFixed(1), tkPx: +tkPx.toFixed(1), wfRadius: tkPx < 1 ? '2px 2px 0 0' : '0', wf: fmt(x.wv), tk: fmt(x.tv), total: fmt(x.wv + x.tv), tip: label + ': ' + fmt(x.wv + x.tv) + ' (workflow runs ' + fmt(x.wv) + ', tasks ' + fmt(x.tv) + ')' };
    });

    const taskCount = Math.max(TASKS.length, Math.round(TASK_TOTAL.count * f));
    const wfRunsTotal = WORKFLOWS.reduce((a, w) => a + Math.max(1, Math.round(w.runs * f)), 0);
    const coverage = { wfRuns: Math.round(wfRunsTotal * 0.76), wfRunsTotal, tasks: Math.round(taskCount * 0.9), tasksTotal: taskCount };

    const isWf = o.list === 'workflows', src = isWf ? WORKFLOWS : TASKS;
    const items = src.map((x, index) => ({ x, index, val: x[key] * f, oth: x[otherKey] * f })).sort((a, b) => b.val - a.val);
    const maxVal = items.length ? items[0].val : 1;
    const rows = items.map((it, idx) => {
      const x = it.x, id = (isWf ? 'w:' : 't:') + it.index, open = !!o.open[id], runs = isWf ? Math.max(1, Math.round(x.runs * f)) : 0;
      const row = { id, index: it.index, rank: idx + 1, name: x.name, isWorkflow: isWf, harness: isWf ? '' : x.h, meta: isWf ? runs + ' runs · ' + fmtTime(x.min / x.runs) + ' avg · ' + x.model : HN(x.h) + ' · ' + x.repo + ' · ' + plural(x.turns, 'turn'), pct: +(it.val / maxVal * 100).toFixed(1), value: fmt(it.val), other: fmtOther(it.oth), open, children: [], subTitle: '', subFooter: '', hasMore: false, moreLabel: '', runs };
      if (open && isWf) {
        const wr = workflowRuns(x, range, usage, fmt, fmtOther);
        Object.assign(row, { children: wr.children, subTitle: 'Workflow runs, ' + (usage ? 'most tokens first' : 'longest first'), subFooter: 'Showing ' + wr.shown + ' of ' + wr.total + ' runs', hasMore: wr.total > wr.shown, moreLabel: 'Show all ' + wr.total + ' runs' });
      } else if (open) {
        Object.assign(row, { children: taskTurns(x, usage, range, fmt, fmtOther), subTitle: 'Agent turns, in order', subFooter: plural(x.turns, 'turn') + ' · ' + fmt(it.val) + ' in total' });
      }
      return row;
    });

    const wfIndex = Math.max(0, WORKFLOWS.findIndex(w => w.name === o.workflow)), wf = WORKFLOWS[wfIndex];
    const nRuns = Math.max(1, Math.round(wf.runs * f)), failed = Math.round(nRuns * 0.08);
    const nodes = wf.nodes.map(n => { const execs = Math.max(1, Math.round(nRuns * (n.x || 1))); return { n, min: wf.min * f * n.t, tok: wf.tok * f * n.k, execs }; });
    const summed = nodes.reduce((a, n) => a + n.min, 0), tokAll = nodes.reduce((a, n) => a + n.tok, 0), totalKey = usage ? tokAll : summed;
    nodes.sort((a, b) => b[key] - a[key]);
    const nMax = nodes.length ? nodes[0][key] : 1;
    const nodePage = {
      index: wfIndex, name: wf.name, runs: nRuns, executions: nodes.map(n => ({ name: n.n.name, execs: n.execs })), runsBreakdown: (nRuns - failed) + ' done · ' + failed + ' failed',
      elapsed: fmtTime(wf.min * f), summed: fmtTime(summed), tokens: fmtTok(tokAll), title: 'Nodes by ' + (usage ? 'usage' : 'execution time'),
      nodes: nodes.map((n, idx) => ({ rank: idx + 1, name: n.n.name, role: n.n.role, icon: ROLE_ICON[n.n.role], harness: n.n.h, execs: n.execs, shareValue: n[key] / totalKey * 100, meta: n.n.role + ' · ' + HN(n.n.h) + ' · ' + n.n.model + ' · ' + n.execs + ' executions · ' + fmtTime(n.min / n.execs) + ' avg', pct: +(n[key] / nMax * 100).toFixed(1), share: Math.round(n[key] / totalKey * 100) + '%', value: fmt(n[key]), other: fmtOther(n[otherKey]) })),
      footer: wf.nodes.length + ' nodes · share is of the ' + (usage ? 'workflow’s total usage' : 'summed execution time')
    };

    return {
      screen: o.screen, range, measure: usage ? 'usage' : 'time', usage, listKind: isWf ? 'workflows' : 'tasks', rangeLabel: 'Last ' + range + ' days',
      chart: { label: usage ? 'Usage' : 'Total time', caption: usage ? 'Tokens as reported by harness: input, output and cache' : 'Elapsed run time per workflow run plus task time', total: fmt(wfSum + tkSum), wfTotal: fmt(wfSum), tkTotal: fmt(tkSum), yTop: fmtAxis(top, usage), yMid: fmtAxis(top / 2, usage), gap: range === 7 ? 16 : range === 30 ? 4 : 2, bars, aria: (usage ? 'Usage' : 'Total time') + ' per day, last ' + range + ' days, workflow runs and tasks stacked' },
      coverage,
      list: { title: (isWf ? 'Workflows' : 'Tasks') + ' by ' + (usage ? 'usage' : 'total time'), valueHead: usage ? 'Usage' : 'Total time', otherHead: usage ? 'Total time' : 'Usage', rows, footer: isWf ? WORKFLOWS.length + ' workflows ran in this period · select a row to see its runs' : 'Top ' + TASKS.length + ' of ' + taskCount + ' tasks · select a row to see its turns' },
      nodePage
    };
  };

  const ICONS = {
    chart: ['0 0 14 14', '<path d="M2.6 12V7.6M5.5 12V3.4M8.5 12V6.2M11.4 12V9" stroke-width="1.7"/>'],
    'chevron-down': ['0 0 10 10', '<path d="M1.8 3.6 5 6.8 8.2 3.6" stroke-width="1.6"/>'],
    'chevron-right': ['0 0 10 10', '<path d="M3.6 1.8 6.8 5 3.6 8.2" stroke-width="1.6"/>'],
    'chevron-left': ['0 0 10 10', '<path d="M6.4 1.8 3.2 5 6.4 8.2" stroke-width="1.6"/>'],
    updown: ['0 0 10 12', '<path d="M2 4.6 5 1.8 8 4.6M2 7.4 5 10.2 8 7.4" stroke-width="1.3"/>'],
    info: ['0 0 14 14', '<path fill-rule="evenodd" d="M7 .8a6.2 6.2 0 1 0 .001 0ZM6.3 3.3h1.4v1.4H6.3ZM6.3 6h1.4v4.7H6.3Z"/>', true],
    done: ['0 0 16 16', '<path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 1 0-13 0ZM4.2 8.1 5 7.3 7 9.3 11 5.2 11.8 6 7 10.9Z"/>', true],
    fail: ['0 0 16 16', '<path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 1 0-13 0ZM5.2 4.4 8 7.2 10.8 4.4 11.6 5.2 8.8 8 11.6 10.8 10.8 11.6 8 8.8 5.2 11.6 4.4 10.8 7.2 8 4.4 5.2Z"/>', true],
    terminal: ['0 0 14 14', '<rect x="1.2" y="2" width="11.6" height="10" rx="2" stroke-width="1.1"/><path d="M3.8 5.3 5.8 7 3.8 8.7M7 9h3" stroke-width="1.1"/>'],
    workflow: ['0 0 14 14', '<g fill="currentColor" stroke="none"><circle cx="7" cy="2.8" r="1.4"/><circle cx="2.8" cy="11" r="1.4"/><circle cx="11.2" cy="11" r="1.4"/></g><path d="M6.4 4.2 3.4 9.6M7.6 4.2 10.6 9.6M4.4 11H9.6" stroke-width="1" stroke-dasharray="1.6 1.2"/>'],
    clipboard: ['0 0 14 14', '<rect x="3" y="2.4" width="8" height="9.6" rx="1.4" stroke-width="1.1"/><path d="M5.4 1.6H8.6V3.4H5.4ZM5 6.4H9M5 8.8H9" stroke-width="1.1"/>'],
    hammer: ['0 0 14 14', '<path d="M2 5 6 2 8 4 6.4 5.4 12 11 10.4 12.6 4.8 7 4 8.4Z" stroke-width="1.1"/>'],
    'bubble-check': ['0 0 14 14', '<path d="M2 2.6H12V9.4H7L4 12V9.4H2ZM4.8 6 6.4 7.4 9.2 4.4" stroke-width="1.2"/>']
  };
  const icon = (name, size) => { const [box, inner, solid] = ICONS[name]; const [, , w, h] = box.split(' ').map(Number); const scale = size / Math.max(w, h); return `<svg class="stat-glyph${solid ? ' solid' : ''}" viewBox="${box}" width="${(w * scale).toFixed(1)}" height="${(h * scale).toFixed(1)}" aria-hidden="true" focusable="false">${inner}</svg>`; };

  const segment = (label, group, items, current, cls = '') => `<div class="stat-seg ${cls}" role="group" aria-label="${label}">${items.map(([value, text]) => `<button type="button" class="stat-seg-item${value === current ? ' selected' : ''}" data-action="${group}:${value}" aria-pressed="${value === current}">${esc(text)}</button>`).join('')}</div>`;
  const popup = (name, value) => `<button type="button" class="stat-popup" data-action="stat-filter:${name}">${name}: ${value}<span class="stat-popup-glyph">${icon('updown', 12)}</span></button>`;
  const controls = (m, overview) => `<div class="stat-controls">${segment('Time range', 'stat-range', [7, 30, 90].map(d => [d, d + ' days']), m.range)}${overview ? popup('Repository', 'All') + popup('Harness', 'All') + popup('Model', 'Actual') : ''}<span class="stat-spacer"></span><span class="stat-measure-label">Measure</span>${segment('Measure', 'stat-measure', [['time', 'Total time'], ['usage', 'Usage']], m.measure)}</div>`;
  const banner = (title, text) => `<div class="stat-banner" role="note">${icon('info', 14)}<div><strong>${title}</strong><span>${text}</span></div></div>`;
  const dot = h => h ? `<span class="backend-dot ${esc(h)}" aria-hidden="true"></span>` : '';
  const bar = (pct, small) => `<span class="stat-track${small ? ' small' : ''}" aria-hidden="true"><span style="width:${pct}%"></span></span>`;

  const chartCard = m => {
    const c = m.chart, cov = m.coverage;
    return `<section class="stat-card stat-chart-card" aria-label="${esc(c.label)} per day"><div class="stat-chart-head"><div class="stat-hero"><span class="stat-caption">${c.label}</span><strong>${c.total}</strong><span class="stat-sub-caption">${c.caption}</span></div><div class="stat-legend"><span><i class="stat-swatch wf" aria-hidden="true"></i>Workflow runs <b>${c.wfTotal}</b></span><span><i class="stat-swatch tk" aria-hidden="true"></i>Tasks <b>${c.tkTotal}</b></span></div></div>`
      + `<div class="stat-chart"><div class="stat-yaxis" aria-hidden="true"><span style="top:-7px">${c.yTop}</span><span style="top:83px">${c.yMid}</span><span style="top:173px">0</span></div><div class="stat-plot"><div class="stat-area"><i class="stat-line" style="top:0"></i><i class="stat-line" style="top:90px"></i><i class="stat-line base"></i><div class="stat-bars" role="img" aria-label="${esc(c.aria)}" style="gap:${c.gap}px">${c.bars.map(b => `<div class="stat-bar" title="${esc(b.tip)}" aria-hidden="true"><div class="stat-bar-tk" style="height:${b.tkPx}px"></div><div class="stat-bar-wf" style="height:${b.wfPx}px;border-radius:${b.wfRadius}"></div></div>`).join('')}</div></div><div class="stat-xaxis" style="gap:${c.gap}px" aria-hidden="true">${c.bars.map(b => `<div><span>${b.label}</span></div>`).join('')}</div></div></div>`
      + `<table class="visually-hidden"><caption>${esc(c.label)} per day, workflow runs and tasks</caption><thead><tr><th scope="col">Day</th><th scope="col">Workflow runs</th><th scope="col">Tasks</th><th scope="col">Total</th></tr></thead><tbody>${c.bars.map(b => `<tr><th scope="row">${b.day}</th><td>${b.wf}</td><td>${b.tk}</td><td>${b.total}</td></tr>`).join('')}</tbody></table>`
      + (m.usage ? banner(`Usage covers ${cov.wfRuns} of ${cov.wfRunsTotal} workflow runs and ${cov.tasks} of ${cov.tasksTotal} tasks.`, 'The harness did not report tokens for the rest; they are left out, not counted as 0.') : '') + '</section>';
  };

  const subRow = c => `<div class="stat-subrow"><span class="stat-status ${c.failed ? 'failed' : 'done'}">${icon(c.failed ? 'fail' : 'done', 13)}${c.status}</span><span class="stat-when">${c.when}</span><span class="stat-submeta">${esc(c.meta)}</span>${bar(c.pct, true)}<span class="stat-subvalue">${c.value}</span><span class="stat-other">${c.other}</span></div>`;
  const rowMarkup = r => {
    const sub = r.open ? `<div class="stat-substack" id="stat-sub-${r.id.replace(':', '-')}" role="group" aria-label="${esc(r.subTitle)}, ${esc(r.name)}"><div class="stat-subrow head"><span class="stat-caption grow">${r.subTitle}</span>${r.isWorkflow ? `<button type="button" class="stat-link" data-action="stat-nodes:${r.index}">View node breakdown${icon('chevron-right', 9)}</button>` : ''}</div>${r.children.map(subRow).join('')}<div class="stat-subrow"><span class="stat-foot grow">${r.subFooter}</span>${r.hasMore ? `<button type="button" class="stat-link" data-action="stat-more-runs">${r.moreLabel}</button>` : ''}</div></div>` : '';
    return `<div class="stat-item"><button type="button" class="stat-row" data-action="stat-toggle:${r.id}" aria-expanded="${r.open}"${r.open ? ` aria-controls="stat-sub-${r.id.replace(':', '-')}"` : ''}><span class="stat-chev">${icon(r.open ? 'chevron-down' : 'chevron-right', 10)}</span><span class="stat-rank">${r.rank}</span><span class="stat-kind">${icon(r.isWorkflow ? 'workflow' : 'terminal', 14)}</span><span class="stat-name"><strong>${esc(r.name)}</strong><span>${dot(r.harness)}<span class="stat-ellipsis">${esc(r.meta)}</span></span></span>${bar(r.pct)}<span class="stat-value">${r.value}</span><span class="stat-other">${r.other}</span></button>${sub}</div>`;
  };
  const listCard = m => {
    const l = m.list;
    return `<section class="stat-card" aria-label="${esc(l.title)}"><div class="stat-list-head">${segment('Rank', 'stat-list', [['workflows', 'Workflows'], ['tasks', 'Tasks']], m.listKind, 'rank')}<h3>${l.title}</h3><span class="stat-colhead">${l.valueHead}</span><span class="stat-colhead">${l.otherHead}</span></div>${l.rows.map(rowMarkup).join('')}<div class="stat-list-foot"><span>${l.footer}</span>${m.listKind === 'tasks' ? '<button type="button" class="stat-link" data-action="stat-all-tasks">Show all tasks</button>' : ''}</div></section>`;
  };

  const nodePageMarkup = m => {
    const p = m.nodePage, l = m.list;
    const tile = (label, value, note) => `<div class="stat-tile"><span class="stat-caption">${label}</span><strong>${value}</strong><span class="stat-sub-caption">${note}</span></div>`;
    return `<div class="stat-tiles">${tile('Runs', p.runs, p.runsBreakdown)}${tile('Elapsed run time', p.elapsed, 'Wall clock, all runs')}${tile('Summed execution time', p.summed, 'All node executions added together')}${tile('Usage', p.tokens, 'Tokens as reported by harness')}</div>`
      + banner('Node times are summed execution time.', 'Parallel nodes run at the same time, so their total can exceed the elapsed run time.')
      + `<section class="stat-card" aria-label="${esc(p.title)}"><div class="stat-list-head"><h3>${p.title}</h3><span class="stat-colhead share">Share</span><span class="stat-colhead">${l.valueHead}</span><span class="stat-colhead">${l.otherHead}</span></div>${p.nodes.map(n => `<div class="stat-row static"><span class="stat-rank">${n.rank}</span><span class="stat-role">${icon(n.icon, 14)}</span><span class="stat-name"><strong>${esc(n.name)}</strong><span>${dot(n.harness)}<span class="stat-ellipsis">${esc(n.meta)}</span></span></span>${bar(n.pct)}<span class="stat-share">${n.share}</span><span class="stat-value">${n.value}</span><span class="stat-other">${n.other}</span></div>`).join('')}<div class="stat-list-foot"><span>${p.footer}</span></div></section>`;
  };

  HF.statisticsBody = (screen, opts = {}) => {
    const m = HF.statisticsModel({ ...opts, screen });
    if (screen === 'nodes') {
      return `<div class="stat-page"><header class="stat-header"><button type="button" class="stat-back" data-action="stat-back" aria-label="Back to Statistics">${icon('chevron-left', 10)}Statistics</button><div><h2>${esc(m.nodePage.name)}</h2><p>Node breakdown · ${m.nodePage.runs} runs · ${m.rangeLabel}</p></div></header>${controls(m, false)}${nodePageMarkup(m)}</div>`;
    }
    return `<div class="stat-page"><header class="stat-header"><div><h2>Statistics</h2><p>${m.rangeLabel} · All repositories</p></div></header>${controls(m, true)}${chartCard(m)}${listCard(m)}</div>`;
  };

  const entry = range => `<div class="section-label">Overview</div><button type="button" class="task-row stat-entry active" data-action="route:statistics/overview" aria-current="page"><span class="stat-entry-icon" aria-hidden="true">${icon('chart', 14)}</span><span class="task-row-copy"><strong>Statistics</strong><small>Last ${range} days</small></span></button>`;
  HF.renderStatistics = state => {
    const sidebar = HF.sidebar('populated').replace('class="task-row active"', 'class="task-row"').replace('<div class="workflows-heading">', entry(current.range) + '<div class="workflows-heading">');
    return HF.app(`<div class="split">${sidebar}<main class="content stat-content" id="statistics-content">${HF.statisticsBody(state === 'nodes' ? 'nodes' : 'overview', current)}</main></div>`);
  };

  if (typeof document !== 'undefined') {
    const active = () => HF.route?.screen === 'statistics';
    const q = selector => document.querySelector(selector);
    const rerender = (...focus) => {
      const content = q('#statistics-content'); if (!content) return;
      content.innerHTML = HF.statisticsBody(current.screen, current);
      const sub = q('.stat-entry small'); if (sub) sub.textContent = 'Last ' + current.range + ' days';
      for (const selector of focus) { const element = content.querySelector(selector); if (element) { element.focus(); break; } }
    };
    // In-place navigation between the overview and the node page keeps the page state, so it replaces the hash
    // without a hashchange render; the catalog route (state picker, sidebar entry) still resets it.
    const syncRoute = () => {
      const state = current.screen === 'nodes' ? 'nodes' : 'overview';
      if (HF.route) HF.route.state = state;
      try { history.replaceState(history.state, '', `#statistics/${state}/${HF.appearance?.themeMode || 'system'}`); } catch { /* file:// previews may refuse */ }
      const picker = q('#state-picker'); if (picker) picker.value = state;
      const caption = q('#specimen-caption'); if (caption) caption.textContent = HF.specimenStatus('statistics', state).caption;
    };
    document.addEventListener('click', event => {
      if (!active()) return;
      const target = event.target.closest?.('[data-action^="stat-"]'); if (!target || target.disabled) return;
      event.preventDefault(); event.stopImmediatePropagation();
      const action = target.dataset.action, [name, ...rest] = action.split(':'), value = rest.join(':'), self = `[data-action="${action}"]`;
      if (name === 'stat-range') { current.range = Number(value); rerender(self); HF.feedback(`Last ${current.range} days selected`); }
      else if (name === 'stat-measure') { current.measure = value === 'usage' ? 'usage' : 'time'; rerender(self); HF.feedback(`${current.measure === 'usage' ? 'Usage' : 'Total time'} measure selected`); }
      else if (name === 'stat-list') { current.list = value === 'tasks' ? 'tasks' : 'workflows'; rerender(self); HF.feedback(`${current.list === 'tasks' ? 'Tasks' : 'Workflows'} ranking selected`); }
      else if (name === 'stat-toggle') { if (current.open[value]) delete current.open[value]; else current.open[value] = true; rerender(self); }
      else if (name === 'stat-nodes') { current.workflow = WORKFLOWS[Number(value)]?.name || current.workflow; current.screen = 'nodes'; q('#statistics-content').scrollTop = 0; rerender('[data-action="stat-back"]'); syncRoute(); }
      else if (name === 'stat-back') {
        const index = Math.max(0, WORKFLOWS.findIndex(w => w.name === current.workflow));
        current.screen = 'overview'; q('#statistics-content').scrollTop = 0; rerender(`[data-action="stat-nodes:${index}"]`, `[data-action="stat-toggle:w:${index}"]`); syncRoute();
      }
      else if (name === 'stat-filter') HF.feedback(`${value} filter · mock only · figures unchanged`);
      else if (name === 'stat-more-runs') HF.feedback('Full run list · mock only · not designed');
      else if (name === 'stat-all-tasks') HF.feedback('Full task list · mock only · not designed');
    }, true);
  }
})();
