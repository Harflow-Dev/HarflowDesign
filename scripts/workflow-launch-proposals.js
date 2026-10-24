(function () {
  // Exploratory starred workflows in the Run Workflow chooser (#7). The sheet copy follows WorkflowRunnerView.swift;
  // the star controls and starred-first order are the proposal.
  const esc = HF.escape;
  const INITIAL = ['session-reliability', 'release-checklist'];
  let current = { starred: INITIAL.slice(), open: true, selected: '' };
  HF.resetLaunchProposals = () => { current = { starred: INITIAL.slice(), open: true, selected: '' }; };
  HF.launchProposalSnapshot = () => JSON.parse(JSON.stringify(current));
  const active = () => HF.route?.screen === 'workflow-launch' && HF.route.state === 'library-starred';
  const star = (workflow, starred) => `<button type="button" class="star-toggle launch-star${starred ? ' starred' : ''}" data-action="lp-star:${workflow.id}" aria-label="${starred ? 'Starred, unstar' : 'Star'} ${esc(workflow.name)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.9 4.1 4.5.5-3.3 3 .9 4.4L8 11.4l-4 2.2.9-4.4-3.3-3 4.5-.5z" fill="${starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg></button>`;
  HF.launchChooserRows = (starredIds, selected = '') => {
    const ordered = HF.orderStarred(HF.sidebarWorkflows, starredIds);
    const split = ordered.findIndex(workflow => !starredIds.includes(workflow.id));
    return ordered.map((workflow, index) => `${index === split && split > 0 ? '<li class="launch-divider" role="separator"></li>' : ''}<li class="launch-row"><button type="button" class="launch-choice${selected === workflow.id ? ' selected' : ''}" data-action="lp-choose:${workflow.id}" data-launch-choice>${esc(workflow.name)}</button>${star(workflow, starredIds.includes(workflow.id))}</li>`).join('');
  };
  HF.renderLaunchChooser = () => HF.sheet(`<h2>Run Workflow</h2><p class="muted">Choose a saved workflow, then review its permissions and task before running.</p><div class="launch-chooser"><button type="button" class="launch-picker" id="launch-picker" aria-haspopup="true" aria-expanded="${current.open}" aria-controls="launch-list" data-action="lp-toggle">${esc(HF.sidebarWorkflows.find(workflow => workflow.id === current.selected)?.name || 'Choose a workflow')}<span aria-hidden="true">⌃⌄</span></button><ul class="launch-list" id="launch-list" aria-label="Saved workflows" ${current.open ? '' : 'hidden'}>${HF.launchChooserRows(current.starred, current.selected)}</ul></div><div class="footer">${HF.button('Cancel', 'close-modal')}<button type="button" class="primary" data-action="lp-continue" ${current.selected ? '' : 'disabled'}>Continue</button></div>`, 'launch-sheet launch-chooser-sheet');

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
