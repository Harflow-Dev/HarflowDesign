(function () {
  // Exploratory starred workflows in the Run Workflow chooser (#7). The sheet copy follows WorkflowRunnerView.swift;
  // the star controls and starred-first order are the proposal.
  const esc = HF.escape;
  const INITIAL = ['session-reliability', 'release-checklist'];
  const REPOSITORY = '~/repos/app';
  let current = { starred: INITIAL.slice(), open: true, selected: '', reviewed: false, repository: REPOSITORY };
  HF.resetLaunchProposals = () => { current = { starred: INITIAL.slice(), open: true, selected: '', reviewed: false, repository: REPOSITORY }; };
  const active = () => HF.route?.screen === 'workflow-launch' && HF.route.state === 'library-starred';
  const star = (workflow, starred) => `<button type="button" class="star-toggle launch-star${starred ? ' starred' : ''}" data-action="lp-star:${workflow.id}" aria-label="Star ${esc(workflow.name)}" aria-pressed="${starred ? 'true' : 'false'}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.4l-4 2.2.9-4.4-3.3-3 4.5-.5z" fill="${starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg></button>`;
  HF.launchChooserRows = (starredIds, selected = '') => {
    const ordered = HF.orderStarred(HF.sidebarWorkflows, starredIds);
    const split = ordered.findIndex(workflow => !starredIds.includes(workflow.id));
    return ordered.map((workflow, index) => `${index === split && split > 0 ? '<li class="launch-divider" role="separator"></li>' : ''}<li class="launch-row"><button type="button" class="launch-choice${selected === workflow.id ? ' selected' : ''}" data-action="lp-choose:${workflow.id}" data-launch-choice>${esc(workflow.name)}</button>${star(workflow, starredIds.includes(workflow.id))}</li>`).join('');
  };
  HF.renderLaunchChooser = () => HF.sheet(`<h2>Run Workflow</h2><p class="muted">Choose a saved workflow, then review its permissions and task before running.</p><div class="launch-chooser"><button type="button" class="launch-picker" id="launch-picker" aria-expanded="${current.open}" aria-controls="launch-list" data-action="lp-toggle">${esc(HF.sidebarWorkflows.find(workflow => workflow.id === current.selected)?.name || 'Choose a workflow')}<span aria-hidden="true">⌃⌄</span></button><ul class="launch-list" id="launch-list" aria-label="Saved workflows" ${current.open ? '' : 'hidden'}>${HF.launchChooserRows(current.starred, current.selected)}</ul></div><div class="footer">${HF.button('Cancel', 'close-modal')}<button type="button" class="primary" data-action="lp-continue" ${current.selected ? '' : 'disabled'}>Continue</button></div>`, 'launch-sheet launch-chooser-sheet');

  // ---- #21 / HarflowMCP#41 Run sheet with a command review -----------------------------------------------------
  // Keeps the existing sheet fields and adds the commands this run will execute. Run stays disabled until the
  // commands are reviewed; editing the Repository (the launch folder) asks for review again.
  const reviewActive = () => HF.route?.screen === 'workflow-launch' && HF.route.state === 'setup-review';
  HF.launchRunDisabled = state => state === 'setup-review' && !current.reviewed;
  const WORKSPACE = '~/Harflow/Workspaces/<run id>';
  const command = (icon, title, text) => `<div class="su-command"><span class="su-command-title"><span aria-hidden="true">${icon}</span>${esc(title)}</span><pre class="su-code" tabindex="0" aria-label="${esc(title)} command">${esc(text)}</pre></div>`;
  HF.renderSetupReview = () => {
    const f = HF.setupFixture, setup = f.commands.worktree, teardown = f.commands.teardown;
    const when = { success: 'when the run succeeds', always: 'always' }.success;
    return HF.sheet(`<h2>Run workflow</h2><p class="muted">Development workflow · Revision 4</p><div class="su-body"><label class="form-field">Task<textarea id="launch-task">Fix APP-2481: crash when opening a listing with no photos</textarea></label><label class="form-field">Repository<input id="launch-repo" data-su-repo value="${esc(current.repository)}" autocomplete="off" spellcheck="false" aria-describedby="launch-repo-help"></label><p class="caption su-help" id="launch-repo-help">Setup and teardown see this folder as <span class="su-mono">$HARFLOW_LAUNCH_DIR</span>. Nodes run in the folder setup creates.</p>${HF.select('Access level', ['read_only', 'write_in_repo', 'publish', 'unrestricted'])}<h3>Orchestrator</h3>${HF.select('Harness', ['claude', 'codex', 'vibe'])}${HF.select('Model', ['Default', 'Configured model'])}<div class="card"><h4>Review</h4><p>5 graph nodes · 1 on-demand node</p><p class="caption">The orchestrator coordinates the plan and task assignments.</p></div><section class="su-review" aria-labelledby="su-review-title"><div class="su-review-head"><h4 id="su-review-title">Commands this run will execute</h4><span class="su-pill">Harflow's own access</span></div>${command('▶', 'Setup · before the first node · timeout 5 min', setup)}${command('■', `Teardown · ${when} · timeout 2 min`, teardown)}<p class="caption su-help">Launch folder: <span class="su-mono" data-su-launch-dir>${esc(current.repository)}</span> · Workspace: <span class="su-mono">${esc(WORKSPACE)}</span></p><label class="su-check"><input type="checkbox" id="su-reviewed" data-su-reviewed ${current.reviewed ? 'checked' : ''}><span>I've reviewed these commands</span></label></section></div><div class="footer su-footer"><span class="caption su-footer-note">Run stays disabled until the commands are reviewed. Changing them asks again.</span>${HF.button('Cancel', 'close-modal')}<button type="button" class="primary" data-action="launch-workflow" ${current.reviewed ? '' : 'disabled'}>Run</button></div>`, 'launch-sheet setup-review-sheet');
  };
  const syncRun = () => { const run = document.querySelector('[data-action="launch-workflow"]'); if (run) run.disabled = !current.reviewed; };
  document.addEventListener('change', event => {
    if (!reviewActive() || !event.target.matches?.('[data-su-reviewed]')) return;
    current.reviewed = event.target.checked; syncRun();
  }, true);
  document.addEventListener('input', event => {
    if (!reviewActive() || !event.target.matches?.('[data-su-repo]')) return;
    current.repository = event.target.value; current.reviewed = false;
    const box = document.querySelector('[data-su-reviewed]'); if (box) box.checked = false;
    const caption = document.querySelector('[data-su-launch-dir]'); if (caption) caption.textContent = current.repository;
    syncRun();
  }, true);

  const refresh = focusSelector => {
    const stage = document.querySelector('#stage'); if (!stage) return;
    const sheet = stage.querySelector('.sheet'); if (!sheet) return;
    sheet.outerHTML = HF.renderLaunchChooser().match(/<section class="sheet[\s\S]*<\/section>/)[0];
    if (focusSelector) stage.querySelector(focusSelector)?.focus();
  };
  document.addEventListener('click', event => {
    if (!active()) return;
    const target = event.target.closest('[data-action^="lp-"]'); if (!target) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const [action, value] = target.dataset.action.split(':');
    if (action === 'lp-toggle') { current.open = !current.open; refresh('#launch-picker'); return; }
    if (action === 'lp-choose') { current.selected = value; current.open = false; refresh('#launch-picker'); HF.feedback(`${HF.sidebarWorkflows.find(workflow => workflow.id === value).name} selected`); return; }
    if (action === 'lp-star') {
      const workflow = HF.sidebarWorkflows.find(entry => entry.id === value), index = current.starred.indexOf(value);
      if (index >= 0) current.starred.splice(index, 1); else current.starred.push(value);
      refresh(`[data-action="lp-star:${value}"]`);
      HF.feedback(index >= 0 ? `Unstarred ${workflow.name}` : `Starred ${workflow.name} · listed first`);
      return;
    }
    if (action === 'lp-continue' && !target.disabled) HF.navigate('workflow-launch', 'launch');
  }, true);
  document.addEventListener('keydown', event => {
    if (!active()) return;
    const list = event.target.closest?.('.launch-list');
    if (event.key === 'Escape' && current.open && (list || event.target.id === 'launch-picker')) { event.preventDefault(); event.stopPropagation(); current.open = false; refresh('#launch-picker'); return; }
    if (list && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      const items = [...list.querySelectorAll('[data-launch-choice]')], index = items.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault(); items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    }
    if (event.target.id === 'launch-picker' && event.key === 'ArrowDown' && current.open) { event.preventDefault(); document.querySelector('[data-launch-choice]')?.focus(); }
  }, true);
})();
