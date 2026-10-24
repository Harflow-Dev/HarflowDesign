(function () {
  // Exploratory Statistics page (#9). No native source exists. Figures are deterministic fixtures; a missing
  // figure is "Unavailable", never 0, and elapsed run time is labelled separately from summed execution time.
  const esc = HF.escape;
  const ranges = {
    7: { label: 'Last 7 days', runs: 31, done: 27, failed: 3, incomplete: 1, elapsed: '11 h 42 min', summed: '29 h 5 min', tokens: 'Input 2.6M · Output 0.4M', coverage: 24, rows: [['Implement and review', 20, '18 done · 1 failed · 1 incomplete', '8 h total', '24 min avg', 'Requested opus · effective opus'], ['Plan and checklist', 11, '9 done · 2 failed · 0 incomplete', '3 h total', '16 min avg', 'Requested default · effective sonnet']] },
    30: { label: 'Last 30 days', runs: 148, done: 128, failed: 14, incomplete: 6, elapsed: '52 h 10 min', summed: '131 h 4 min', tokens: 'Input 12.4M · Output 1.9M', coverage: 112, rows: [['Implement and review', 96, '88 done · 6 failed · 2 incomplete', '38 h total', '26 min avg', 'Requested opus · effective opus'], ['Plan and checklist', 52, '40 done · 8 failed · 4 incomplete', '14 h total', '16 min avg', 'Requested default · effective sonnet']] },
    90: { label: 'Last 90 days', runs: 402, done: 351, failed: 37, incomplete: 14, elapsed: '141 h 30 min', summed: '352 h 48 min', tokens: 'Input 33.8M · Output 5.2M', coverage: 301, rows: [['Implement and review', 260, '238 done · 16 failed · 6 incomplete', '103 h total', '25 min avg', 'Requested opus · effective opus'], ['Plan and checklist', 142, '113 done · 21 failed · 8 incomplete', '38 h total', '16 min avg', 'Requested default · effective sonnet']] }
  };
  let current = { range: 30 };
  HF.resetStatistics = () => { current = { range: 30 }; };
  HF.statisticsRanges = ranges;

  const tile = (label, value, note, extra = '') => `<div class="stat-tile${value === 'Unavailable' ? ' unavailable' : ''}"><span class="stat-label">${esc(label)}</span><strong class="stat-value">${esc(value)}</strong><span class="stat-note">${esc(note)}</span>${extra}</div>`;
  const controls = range => `<div class="stat-controls"><div class="stat-range" role="group" aria-label="Time range">${[7, 30, 90].map(days => `<button type="button" class="stat-range-option${days === range ? ' selected' : ''}" data-action="stat-range:${days}" aria-pressed="${days === range}"><span class="stat-check" aria-hidden="true"></span>${days} days</button>`).join('')}</div>${[['Repository', ['All', 'billing-api', 'web', 'Unknown repository']], ['Harness', ['All', 'Claude', 'Codex', 'Vibe']], ['Model', ['Actual', 'Requested']]].map(([label, values]) => `<label class="stat-filter"><span>${label}:</span><select data-action="stat-filter" aria-label="${label}">${values.map(value => `<option>${esc(value)}</option>`).join('')}</select></label>`).join('')}</div>`;

  HF.statisticsBody = (state, range = current.range) => {
    const data = ranges[range];
    if (state === 'empty') return `<header class="stat-header"><h2>Statistics</h2><p>No history yet</p></header>${controls(range)}<div class="stat-empty">${HF.empty('No statistics yet', 'Run a workflow or a task and its history appears here.')}</div>`;
    return `<header class="stat-header"><h2>Statistics</h2><p>${data.label} · All repositories</p></header>${controls(range)}<div class="stat-tiles">${tile('Runs', String(data.runs), `${data.done} done · ${data.failed} failed · ${data.incomplete} incomplete`)}${tile('Elapsed run time', data.elapsed, 'Wall clock from start to finish, added over runs')}${tile('Summed execution time', data.summed, 'All nodes added together')}${tile('Tokens', data.tokens, 'Cache: Unavailable')}${tile('Cost', 'Unavailable', 'Cost as reported by harness')}</div><p class="stat-notice" role="note"><strong>Averages exclude ${data.incomplete} running or incomplete runs.</strong><span>Token and cost totals cover ${data.coverage} of ${data.runs} runs; the harness did not report the rest.</span></p><ul class="stat-rows" aria-label="Per workflow"><li class="stat-row stat-head"><span>Workflow</span><span>Runs</span><span>Status</span><span>Total</span><span>Average</span><span>Model</span></li>${data.rows.map(([name, runs, breakdown, total, avg, model]) => `<li class="stat-row"><strong>${esc(name)}</strong><span>${runs} runs</span><span>${esc(breakdown)}</span><span>${esc(total)}</span><span>${esc(avg)}</span><span>${esc(model)}</span></li>`).join('')}<li class="stat-row"><strong>Standalone tasks<small>Unknown repository</small></strong><span>Not counted in Runs</span><span>Status unavailable</span><span>Unavailable</span><span>Unavailable</span><span>Requested default · effective unknown</span></li></ul>`;
  };

  const entry = '<div class="section-label">Overview</div><button type="button" class="task-row stat-entry active" data-action="route:statistics/overview" aria-current="page"><span class="stat-entry-icon" aria-hidden="true"></span><span class="task-row-copy"><strong>Statistics</strong><small>Last 30 days</small></span></button>';
  HF.renderStatistics = state => {
    const sidebar = HF.sidebar('populated').replace('class="task-row active"', 'class="task-row"').replace('<div class="workflows-heading">', entry + '<div class="workflows-heading">');
    return HF.app(`<div class="split">${sidebar}<main class="content stat-content" id="statistics-content">${HF.statisticsBody(state)}</main></div>`);
  };

  if (typeof document !== 'undefined') {
    const active = () => HF.route?.screen === 'statistics';
    document.addEventListener('click', event => {
      if (!active()) return;
      const target = event.target.closest('[data-action^="stat-range:"]'); if (!target) return;
      event.preventDefault(); event.stopImmediatePropagation();
      current.range = Number(target.dataset.action.split(':')[1]);
      document.querySelector('#statistics-content').innerHTML = HF.statisticsBody(HF.route.state, current.range);
      document.querySelector(`[data-action="stat-range:${current.range}"]`)?.focus();
      const sub = document.querySelector('.stat-entry small'); if (sub) sub.textContent = ranges[current.range].label;
      HF.feedback(`${ranges[current.range].label} selected`);
    }, true);
    document.addEventListener('change', event => {
      if (!active() || !event.target.matches('[data-action="stat-filter"]')) return;
      event.stopImmediatePropagation();
      HF.feedback(`${event.target.getAttribute('aria-label')} filter · mock only · figures unchanged`);
    }, true);
  }
})();
