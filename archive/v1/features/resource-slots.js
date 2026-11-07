(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const owners = {
    build: { id:'a71c', kind:'task', title:'Build macOS app', state:'Running', since:'14:32', qualified:true },
    android: { id:'b91d', kind:'task', title:'Run Android checks', state:'Waiting', since:'14:33', qualified:true, position:1 },
    web: { id:'c03e', kind:'task', title:'Run web tests', state:'Waiting', since:'14:34', qualified:true, position:2 },
    workflow: { id:'wf-7a42', kind:'workflow', title:'Release workflow', state:'Unknown', since:'14:31', qualified:true },
    whole: { id:'task-99ab', kind:'task', title:'Prepare release', state:'Unknown', since:'14:32', qualified:true },
    longOwner: { id:'task-long-12ab', kind:'task', title:'Prepare the release candidate and verify every platform package against the full integration checklist', state:'Unknown', since:'14:32', qualified:true },
    wholeWait: { id:'task-99ac', kind:'task', title:'Prepare release', state:'Waiting', since:'14:33', qualified:true, position:1 },
    pending: { id:'pending-launch-93cd', kind:'workflow', state:'Waiting', since:'14:33', qualified:false, position:1 },
    missing: { id:'task-with-a-very-long-identifier-0123456789abcdef-0123456789abcdef', kind:'task', state:'Waiting', since:'14:34', qualified:false, position:2 },
    db1: { id:'db-01', kind:'task', title:'Migrate database', state:'Running', since:'14:30', qualified:true },
    db2: { id:'db-02', kind:'task', title:'Check database', state:'Unknown', since:'14:31', qualified:true },
    borrowed: { id:'child-db-03', kind:'task', title:'Verify migration', state:'Unknown', since:'14:32', qualified:true, borrowed:true, borrowedFrom:'db1' }
  };
  let expanded, blockerOpen, detail, origin, snapshot, availability, freshness, service, arrival = false;
  const title = o => o.title || `${o.kind === 'workflow' ? 'Workflow' : 'Task'} ${o.id}`;
  function fresh() { expanded = {heavy:true}; blockerOpen = {}; detail = null; origin = null; snapshot = 'populated'; availability = 'ready'; freshness = 'current'; service = 'available'; arrival = false; }
  function resources(state) {
    let heavy = {id:'heavy', capacity:1, holders:['build'], queue:['android','web'], total:2, blockers:{android:{holders:['build'], prior:[]}, web:{holders:['build'], prior:['android']}}};
    let db = {id:'test-db', capacity:2, holders:[], queue:[], total:0};
    if (state === 'workflow') heavy = {...heavy, holders:['workflow'], queue:['wholeWait'], total:1, blockers:{wholeWait:{holders:['workflow'],prior:[]}}};
    if (state === 'long') heavy = {...heavy, holders:['longOwner'], queue:['pending','missing'], total:2, blockers:{pending:{holders:['longOwner'],prior:[]},missing:{holders:['longOwner'],prior:['pending']}}};
    if (state === 'multi') db = {...db, holders:['db1','db2','borrowed']};
    if (state === 'truncated') heavy = {...heavy, holders:['build','whole'], total:null, truncated:true, blockers:{android:{holders:['build','whole'],prior:[]},web:{holders:['build','whole'],prior:['android']}}};
    if (state.startsWith('cleanup-')) heavy = {...heavy, cleanup:state.slice(8)};
    const result = [heavy, {id:'ios-simulator',capacity:1,holders:[],queue:[],total:0}, db];
    return state === 'truncated' ? result.map(r => ({...r, truncated:true})) : result;
  }
  const reduced = () => $('motion').value === 'reduce' || ($('motion').value === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function applyAppearance() {
    const theme = $('theme').value === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light') : $('theme').value;
    document.documentElement.dataset.theme = theme;
    const win = document.querySelector('.win'); if (win) win.classList.toggle('reduced', reduced());
    document.querySelectorAll('[data-theme-choice]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === $('theme').value)));
  }
  function ownerRow(key, res, queued) {
    const o = owners[key]; const name = title(o); const position = queued ? `Waiting, position ${o.position}${res.total == null ? '' : ` of ${res.total}`}` : 'Holder';
    const state = res.cleanup && !queued ? `Cleanup ${res.cleanup}` : o.state;
    const open = o.qualified ? `<button class="open" data-open="${esc(key)}" aria-label="Open ${esc(o.kind)} ${esc(name)}">Open ${esc(o.kind)}</button>` : '<span>Details unavailable</span>';
    const blocks = queued ? `<button class="text-button" data-block="${esc(key)}" aria-expanded="${!!blockerOpen[key]}" ${blockerOpen[key] ? `aria-controls="block-${esc(key)}"` : ''}>${blockerOpen[key] ? 'Hide' : 'Show'} blocking details</button>` : '';
    let peers = '';
    if (queued && blockerOpen[key]) {
      const {holders, prior} = res.blockers[key];
      peers = `<div class="blockers" id="block-${esc(key)}"><strong>Blocking details</strong><ul>${[...holders.map(h => `${esc(title(owners[h]))} · holder · ${esc(res.cleanup ? `Cleanup ${res.cleanup}` : owners[h].state)} · since ${esc(owners[h].since)}`), ...prior.map(q => `${esc(title(owners[q]))} · waiting · since ${esc(owners[q].since)}`)].map(s => `<li>${s}</li>`).join('')}</ul>${res.truncated ? '<p>Snapshot is truncated; other blockers may be unavailable.</p>' : ''}</div>`;
    }
    return `<div class="owner"><span class="position" ${queued ? '' : 'hidden'} aria-hidden="true">${queued ? esc(o.position) : ''}</span>${o.state === 'Running' && !res.cleanup ? '<span class="status-dot" aria-hidden="true"></span>' : ''}<div class="owner-copy"><strong>${esc(name)}</strong><span>${esc(position)} · ${esc(state)} · since ${esc(o.since)} · ${esc(o.id)}${o.borrowed ? ` · shares ${esc(title(owners[o.borrowedFrom]))}’s reservation (${esc(owners[o.borrowedFrom].id)})` : ''}</span>${blocks}</div>${open}</div>${peers}`;
  }
  function resourceCard(res) {
    const count = res.holders.filter(h => !owners[h].borrowed).length;
    const isOpen = !!expanded[res.id];
    return `<section class="resource"><button class="resource-toggle" data-resource="${esc(res.id)}" aria-expanded="${isOpen}" aria-controls="resource-${esc(res.id)}"><img class="resource-icon" src="../assets/symbols/lock.png" alt=""><span class="resource-title"><strong>${esc(res.id)}</strong><span>${res.truncated ? `At least ${count} observed in use · capacity ${res.capacity}${count > res.capacity ? ' · over capacity' : ''}` : `${count} of ${res.capacity} in use`}</span></span><img class="chevron ${isOpen ? '' : 'collapsed'}" src="../assets/symbols/chevron-down.png" alt=""></button><div class="resource-body" id="resource-${esc(res.id)}" ${isOpen ? '' : 'hidden'}>${res.holders.length ? `<p class="section-label">${count === 1 ? 'Current holder' : 'Holders'}</p>${res.holders.map(h => ownerRow(h,res,false)).join('')}` : (res.truncated ? '<p>No holders observed in this truncated snapshot.</p>' : '<p>No current holders.</p>')}${res.queue.length ? `<p class="section-label">Waiting · in order</p>${res.queue.map(q => ownerRow(q,res,true)).join('')}` : ''}</div></section>`;
  }
  function skeleton() { return `<div aria-hidden="true"><div class="resource skeleton-resource"><div class="skeleton-header"><div class="sk sk-icon"></div><div class="skeleton-copy"><div class="sk short"></div><div class="sk medium"></div></div></div><div class="resource-body"><div class="skeleton-label"><div class="sk short"></div></div><div class="skeleton-owner"><div class="sk sk-icon"></div><div class="skeleton-copy"><div class="sk medium"></div><div class="sk long"></div><div class="sk short"></div></div></div><div class="skeleton-label"><div class="sk short"></div></div>${[1,2].map(() => `<div class="skeleton-owner"><div class="sk sk-icon"></div><div class="skeleton-copy"><div class="sk medium"></div><div class="sk long"></div><div class="sk short"></div></div></div>`).join('')}</div></div>${[1,2].map(() => `<div class="resource skeleton-resource"><div class="skeleton-header"><div class="sk sk-icon"></div><div class="skeleton-copy"><div class="sk short"></div><div class="sk medium"></div></div></div></div>`).join('')}</div>`; }
  function qualifiers() {
    const notes = [];
    if (freshness === 'refreshing') notes.push(snapshot ? 'Refreshing · showing the retained snapshot.' : 'Refreshing · no qualified snapshot is available.');
    if (freshness === 'stale') notes.push(snapshot ? 'Refresh failed · showing the last snapshot.' : 'Refresh failed · no qualified snapshot is available.');
    if (service === 'unavailable') notes.push('Cleanup service is not running.');
    if (snapshot === 'truncated') notes.push('Snapshot truncated · counts and blockers may be incomplete.');
    return notes.map(note => `<div class="notice ${freshness === 'refreshing' && notes.length === 1 ? '' : 'warning'}">${note}</div>`).join('');
  }
  function overview() {
    if (availability === 'loading') return `<h2>Resource slots</h2><div class="summary skeleton-summary" aria-hidden="true"><div class="sk"></div></div>${skeleton()}`;
    const messages = {empty:['No resource slots','No configured resources are in this snapshot.'],disabled:['Resource slots are not enabled','Resource slot configuration is not enabled.'],unsupported:['Engine does not support resource slots','Select a compatible engine to view resource slots.'],error:['Resource slots unavailable','The resource snapshot could not be read.']};
    const message = messages[availability === 'ready' ? snapshot : availability];
    if (message) return `<h2>Resource slots</h2><div class="empty"><h3>${message[0]}</h3><p>${message[1]}</p></div>`;
    const data = resources(snapshot);
    const summary = snapshot === 'truncated' ? 'Counts unavailable' : `${data.reduce((n,r) => n+r.holders.filter(h => !owners[h].borrowed).length,0)} held · ${data.reduce((n,r) => n+r.queue.length,0)} waiting`;
    return `<h2>Resource slots</h2><p class="summary">${summary}</p>${data.map(resourceCard).join('')}`;
  }
  function selectState(state) {
    arrival = false;
    if (state === 'refreshing' || state === 'refresh-error') {
      freshness = state === 'refreshing' ? 'refreshing' : 'stale';
    } else if (state === 'service-unavailable') {
      service = availability === 'ready' && snapshot !== null ? 'unavailable' : 'unknown';
    } else {
      detail = null;
      freshness = 'current';
      service = 'available';
      availability = ['loading','disabled','unsupported','error'].includes(state) ? state : 'ready';
      snapshot = availability === 'ready' ? state : null;
      if (state === 'multi') expanded['test-db'] = true;
    }
  }
  function detailPage(key) {
    const o = owners[key];
    const resource = snapshot && resources(snapshot).find(r => r.holders.includes(key));
    const cleanup = resource?.cleanup;
    const state = cleanup ? `Cleanup ${cleanup}` : o.state;
    return `<button class="back" data-back>Resource slots</button><h2 tabindex="-1" id="detail-heading">${esc(title(o))}</h2><p>${esc(o.kind === 'workflow' ? 'Workflow run' : 'Task')} · ${esc(o.id)} · ${esc(state)}</p><div class="tabs"><span>Activity</span><span>Summary</span><span>Prompt</span></div><div class="context-card"><strong>Resource slot context</strong><p>This ${esc(o.kind)} is associated with the selected resource snapshot. ${cleanup ? `Cleanup ${esc(cleanup)}; the reservation still occupies capacity.` : o.position ? `Waiting in position ${o.position}.` : 'A reservation is held.'}</p><p>Since ${esc(o.since)} · ${esc(o.id)}</p></div>`;
  }
  const statisticsIcon = '<svg class="statistics-icon" viewBox="0 0 14 14" width="14.0" height="14.0" aria-hidden="true" focusable="false"><path d="M2.6 12V7.6M5.5 12V3.4M8.5 12V6.2M11.4 12V9" stroke-width="1.7"/></svg>';
  const icon = name => `<img src="../assets/symbols/${name}.png" alt="">`;
  function sidebar() { return `<aside class="sidebar"><div class="side-row"><span class="side-icon">${icon('plus')}</span><strong>New session</strong></div><input class="history-search" type="search" placeholder="Search loaded history" aria-label="Search loaded history"><div class="side-label">Overview</div><div class="side-row"><span class="side-icon">${icon('attention')}</span>Needs you</div><div class="side-row"><span class="side-icon">${statisticsIcon}</span>Statistics</div><div class="side-row selected" aria-current="page"><span class="side-icon">${icon('lock')}</span>Resource slots</div><div class="side-label">Workflows</div><div class="side-row"><span class="side-icon">${icon('workflow')}</span>code-review</div><div class="side-row"><span class="side-icon">${icon('workflow')}</span>release</div><div class="side-label">Running</div><div class="side-row"><span class="side-icon">${icon('task')}</span>Fix the login bug</div><div class="side-row"><span class="side-icon">${icon('task')}</span>Write the migration</div><div class="side-label">Today</div><div class="side-row"><span class="side-icon">${icon('checkmark.circle.fill')}</span>Refactor the parser</div><div class="side-footer">Appearance<div class="appearance"><button data-theme-choice="light" aria-label="Light" title="Light">${icon('appearance/sun.max')}</button><button data-theme-choice="dark" aria-label="Dark" title="Dark">${icon('appearance/moon')}</button><button data-theme-choice="system" aria-label="System" title="System">${icon('appearance/desktopcomputer')}</button></div><p>Settings</p></div></aside>`; }
  function render() {
    const scroll = document.querySelector('.detail')?.scrollTop || 0;
    $('specimen').innerHTML = `<div class="win ${reduced() ? 'reduced' : ''}" style="width:${esc($('width').value)}px"><div class="titlebar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="window-title"><span class="emblem" aria-hidden="true"></span>Harflow <span class="connected" aria-hidden="true"></span> Connected</span></div><div class="split">${sidebar()}<div class="detail ${arrival ? 'arrival' : ''}">${qualifiers()}${detail ? detailPage(detail) : overview()}</div></div></div>`;
    applyAppearance(); document.querySelector('.detail').scrollTop = scroll; arrival = false;
  }
  fresh(); render();
  $('state').addEventListener('change', () => { selectState($('state').value); render(); $('announcement').textContent = availability === 'loading' && freshness === 'current' ? 'Loading resource slots…' : freshness === 'stale' ? (snapshot ? 'Refresh failed. The last snapshot is shown.' : 'Refresh failed. No qualified snapshot is available.') : ''; });
  $('width').addEventListener('change', () => { document.querySelector('.win').style.width = `${$('width').value}px`; });
  $('theme').addEventListener('change', applyAppearance); $('motion').addEventListener('change', applyAppearance);
  $('reset').addEventListener('click', () => { $('state').value='populated'; $('width').value='1200'; $('theme').value='light'; $('motion').value='system'; $('announcement').textContent=''; fresh(); render(); });
  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.resource) { expanded[b.dataset.resource] = !expanded[b.dataset.resource]; render(); document.querySelector(`[data-resource="${b.dataset.resource}"]`).focus(); }
    if (b.dataset.block) { blockerOpen[b.dataset.block] = !blockerOpen[b.dataset.block]; render(); document.querySelector(`[data-block="${b.dataset.block}"]`).focus(); }
    if (b.dataset.open) { origin = b.dataset.open; detail = origin; render(); document.getElementById('detail-heading').focus(); }
    if (b.hasAttribute('data-back')) { detail = null; render(); document.querySelector(`[data-open="${origin}"]`)?.focus(); }
    if (b.dataset.themeChoice) { $('theme').value = b.dataset.themeChoice; applyAppearance(); }
    if (b.dataset.complete && $('state').value === 'loading') { $('state').value = b.dataset.complete; selectState(b.dataset.complete); arrival = true; render(); $('announcement').textContent = `Loading completed: ${b.dataset.complete}.`; }
  });
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', applyAppearance);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyAppearance);
})();
