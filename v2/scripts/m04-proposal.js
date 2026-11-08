(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var lastRoute, lastState;
  // Owner-approved centered-composer amendment (2026-11-06): six review routes,
  // approved separately from the 2026-11-05 M04 baseline direction.
  // The prompt grows from one visual line to a six-line cap, measured from real
  // scrollHeight so soft-wrapped lines count, then scrolls inside the textarea.
  var AMENDMENT_LINE_CAP = 6;
  var AMENDMENT_DRAFTS = {
    'amendment-empty': '',
    'amendment-ready': 'Review the delivery queue',
    'amendment-growing': 'Review the delivery queue for the nightly dependency audit, summarize each failure with its owning workflow and the failing node, and open a follow-up task that covers the two harnesses still reporting unsupported effort levels. Include the run number in each summary.',
    'amendment-capped': 'Review the nightly dependency audit results for the HarflowMCP repository and prepare a short written digest. For each failed run, name the owning workflow, the failing node, the harness and model that reported it, and the turn where the failure appeared. Separate genuine regressions from known upstream flakes by checking the two most recent audited revisions side by side. Where a fix is obvious, open a follow-up task that names the repository, quotes the failing node, and lists the affected workflows so the next reviewer can start immediately. Do not start any code changes yourself. Post the finished digest with one line per failure, a short overall conclusion, and the follow-up task link, so the queue can be triaged before the next nightly run.',
    'amendment-options': 'Review the delivery queue',
    'amendment-unknown': 'Review the nightly dependency audit results for the HarflowMCP repository and prepare a short written digest. For each failed run, name the owning workflow, the failing node, the harness and model that reported it, and the turn where the failure appeared. Separate genuine regressions from known upstream flakes by checking the two most recent audited revisions side by side. Where a fix is obvious, open a follow-up task that names the repository, quotes the failing node, and lists the affected workflows so the next reviewer can start immediately. Do not start any code changes yourself. Post the finished digest with one line per failure, a short overall conclusion, and the follow-up task link, so the queue can be triaged before the next nightly run.'
  };
  // Owner-approved centered redraws of six bottom-layout composer states and two shell states, and the open
  // harness picker. Each mount copies the fixture of its source mount; only the layout differs.
  var REDRAW_SOURCES = {
    'centered-loading': 'composer-loading',
    'centered-unqualified': 'composer-unqualified',
    'centered-invalid': 'composer-invalid',
    'centered-starting': 'composer-starting',
    'centered-refused': 'composer-refused',
    'centered-options-closed': 'advanced-closed',
    'centered-harness-open': 'amendment-ready',
    'centered-shell-collapsed': 'shell-collapsed',
    'centered-shell-narrow': 'shell-narrow'
  };
  // Provisional drafts, not approved. Each copies the fixture of its source mount.
  var PENDING_SOURCES = {
    'centered-starting-plain': 'centered-starting',
    'runtime-installing-sidebar': 'runtime-installing'
  };
  function has(map, key) { return Object.prototype.hasOwnProperty.call(map, key); }
  function isRedraw(route) { return has(REDRAW_SOURCES, route); }
  function isPending(route) { return has(PENDING_SOURCES, route); }
  // The centered layout: the six amendment mounts, the redraw mounts and the provisional drafts.
  function isAmendment(route) { return has(AMENDMENT_DRAFTS, route) || isRedraw(route) || isPending(route); }
  function promptOneLineHeight(lineHeight, verticalExtra) { return lineHeight + verticalExtra; }
  function promptCapHeight(lineHeight, verticalExtra) { return lineHeight * AMENDMENT_LINE_CAP + verticalExtra; }
  // Amendment only: the scrollable compose area clips the popover, so its height
  // is bounded to that viewport intersected with the specimen frame. The 16px
  // margin keeps the existing 8px popover gap plus 8px breathing room on the
  // chosen side; the newer 400px popover cap and no artificial minimum remain.
  function amendmentPopupMetrics(anchor, viewport, frame) {
    var top = Math.max(viewport.top, frame.top), bottom = Math.min(viewport.bottom, frame.bottom);
    var above = anchor.top - top - 16, below = bottom - anchor.bottom - 16;
    return { above: above, below: below, belowWins: below > above, maxHeight: Math.max(0, Math.min(400, Math.max(above, below))) };
  }
  // The actions a loading mount lets through: the sidebar toggle is chrome. Every other in-frame action is data-dependent.
  function loadingAllows(action) { return action === 'collapse'; }
  function create(route) {
    if (isPending(route)) { var draft = create(PENDING_SOURCES[route]); draft.route = route; return draft; }
    if (isRedraw(route)) {
      var copy = create(REDRAW_SOURCES[route]); copy.route = route;
      if (route === 'centered-harness-open') {
        // The harness picker is open and an unavailable harness is selected, so the gated state shows with
        // the qualification message the composer already gives.
        copy.harness = 'Unavailable harness'; copy.model = 'Default'; copy.qualification = 'unqualified'; copy.picker = 'harness';
      }
      return copy;
    }
    var s = { route: route, draft: '', repository: 'HarflowMCP', harness: 'Claude Code', model: 'Opus 5.5', qualification: 'ready', revision: 0, status: 'idle', effort: 'default', turns: '12', approvals: 'harness', access: 'write_in_repo', enforcement: 'supported', advanced: route === 'advanced', collapsed: route === 'shell-collapsed', narrow: route === 'shell-narrow', runtime: 'qualified', listing: 'ready', selected: 'retry-budget', picker: '', rows: ['retry-budget','events-reader'], fixtures: false, remembered: {} };
    if (route.indexOf('composer-')===0 || route==='advanced' || route==='advanced-closed') s.draft='Review the delivery queue';
    if (isAmendment(route)) {
      s.draft = AMENDMENT_DRAFTS[route] !== undefined ? AMENDMENT_DRAFTS[route] : '';
      if (route === 'amendment-options') s.advanced = true;
      if (route === 'amendment-unknown') s.status = 'unknown';
    }
    if(route==='advanced-closed')s.effort='high';
    if (/composer-(loading|unqualified)/.test(route)) s.qualification = route.endsWith('loading') ? 'checking' : 'unqualified';
    if (route === 'composer-invalid') { s.draft = 'Review the delivery queue'; s.turns = '0'; s.advanced = true; }
    if (/composer-(starting|refused|unknown)/.test(route)) { s.draft = 'Review the delivery queue'; s.status = route.split('-')[1]; }
    if (route === 'history-retained') s.rows=['events-reader'];
    if (route === 'history-empty') s.rows = [];
    if (route.indexOf('runtime-') === 0) { s.runtime = route.slice(8); s.listing = 'pending'; if (s.runtime === 'listing') s.runtime = 'qualified'; }
    return s;
  }
  function customized(s){return s.effort!=='default'||s.turns!=='12'||s.approvals!=='harness';}
  function optionsOpen(s,open){s.advanced=!!open;}
  function models(harness){return {'Claude Code':['Default','Opus 5.5','Sonnet 5.5'],'Codex':['Default','gpt-6-astra'],'Mistral Vibe':['Default']}[harness] || ['Default'];}
  function problem(s) {
    if (!s.draft.trim()) return 'Describe a task to continue.';
    if (!['default','low','medium','high','xhigh'].includes(s.effort) || (s.harness === 'Mistral Vibe' && s.effort !== 'default')) return 'This harness does not support the requested effort. Review task options.';
    if (s.turns && (!/^\d+$/.test(s.turns) || +s.turns < 1 || !Number.isSafeInteger(+s.turns))) return 'Enter a whole number above 0, or leave it empty for the default.';
    if (s.turns && s.harness === 'Codex') return 'This harness does not support a turn limit. Clear it in task options.';
    if (!models(s.harness).includes(s.model)) return s.harness==='Mistral Vibe'?'Vibe uses its configured model. Select Default before continuing.':'The requested model is unavailable for this harness. Choose a supported model.';
    if(s.enforcement!=='supported') return 'Required permission enforcement is '+s.enforcement+'. Review the selection before starting.';
    if (s.approvals === 'caller' && (s.harness !== 'Claude Code' || s.turns || !['write_in_repo','publish'].includes(s.access))) return 'Caller approvals require a supported harness, repository write access and an empty turn limit. Review task options.';
    if (s.status === 'created') return 'Task already created.';
    if (s.qualification !== 'ready') return 'Choose a qualified harness and model.';
    if (s.runtime !== 'qualified') return 'Set up the required runtime first.';
    if (s.status === 'starting') return 'Starting task…';
    if (s.status === 'unknown') return 'The outcome is unknown. Review Recent work before starting again.';
    return '';
  }
  function select(s, key, value) {
    if (s.status === 'starting' || s.status === 'unknown') return;
    s[key] = value; s.revision += 1; s.qualification = 'checking';
    var saved = s.remembered[s.repository];
    if (key === 'repository' && saved) Object.assign(s, saved);
  }
  function qualify(s, revision, result) { if (revision === s.revision) s.qualification = result; }
  function start(s) { if (problem(s)) return false; s.status = 'starting'; s.remembered[s.repository] = { harness:s.harness, model:s.model, effort:s.effort, turns:s.turns, approvals:s.approvals, access:s.access }; return true; }
  function settle(s, outcome) { if (s.status === 'starting' && ['refused','unknown','created'].includes(outcome)) s.status = outcome; }
  function history(s, rows) { s.rows = rows.slice(); /* selection remains stable even outside retained page */ }
  function listing(s, result) { s.listing = result; }
  function esc(value) { return String(value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function button(text, action, disabled) { return '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm" data-m04="' + action + '"' + (disabled ? ' disabled' : '') + '>' + text + '</button>'; }
  // `options` is optional and passed by no existing route: { loading, approved, afterRender(host) }. A loading mount
  // starts from a fresh fixture, keeps no state for the next mount, ignores every in-frame action and lets only
  // the catalog Frame control through. afterRender(host) runs after every render of the app frame.
  function mount(root, route, options) {
    var host = root.matches && root.matches('.hd-m04-proposal') ? root : root.querySelector('.hd-m04-proposal');
    if (!host) return function () {};
    var loading = !!(options && options.loading), afterRender = options && options.afterRender, loadingStrip = loading ? H.loadingStrip(options.decision) : null;
    var s = !loading && lastRoute === route && lastState ? lastState : create(route), disposed = false;
    var amendment = isAmendment(route);
    if (loading) { lastRoute = null; lastState = null; } else { lastRoute = route; lastState = s; }
    var frame = host.querySelector('.hd-m04-window'), catalog = host.querySelector('.hd-m04-catalog');
    function template(key) { var box = document.createElement('div'); box.innerHTML = H.fill ? H.fill(H.templates[key], host.getAttribute('data-theme') || 'light', host.getAttribute('data-theme') || 'light') : H.templates[key]; return box; }
    function render() {
      if (disposed) return;
      renderBody();
      if (afterRender && !disposed) afterRender(host);
    }
    function renderBody() {
      var theme = host.getAttribute('data-theme') || 'light';
      var runtimeSidebar = route === 'runtime-installing-sidebar', runtimeLocked = runtimeIsLocked();
      var runtimeBoard=route.indexOf('runtime-')===0 && !isPending(route), historyBoard=route.indexOf('history-')===0;
      var controls=runtimeSidebar ? button('Installing','install')+button('Runtime ready','runtime-ready') : runtimeBoard ? button('Runtime failure','runtime-failure')+button('Runtime ready','runtime-ready')+button('Listing ready','listing-ready')+button('Listing failed','listing-failed') : historyBoard ? '' : button('Qualification ready','qualified')+button('Qualification unavailable','unqualified')+button('Complete: created','created',s.status!=='starting')+button('Complete: refused','refused',s.status!=='starting')+button('Complete: unknown','unknown',s.status!=='starting')+button('Enforcement supported','enforcement-supported')+button('Enforcement unknown','enforcement-unknown')+button('Enforcement unsupported','enforcement-unsupported');
      // Strip links point at current states only. The earlier composer and Advanced links now open the
      // centered composer states that replaced them.
      var boards = amendment
        ? (isRedraw(route)
          ? (route.indexOf('centered-shell')===0
            ? [['amendment-empty','Expanded'],['centered-shell-collapsed','Collapsed'],['centered-shell-narrow','Minimum']]
            : [['centered-loading','Loading'],['centered-unqualified','Unavailable'],['centered-invalid','Validation'],['centered-starting','Starting'],['centered-refused','Refused'],['centered-options-closed','Options closed'],['centered-harness-open','Harness open']])
          : [['amendment-empty','Empty'],['amendment-ready','One line'],['amendment-growing','Growing'],['amendment-capped','Capped'],['amendment-options','Options open'],['amendment-unknown','Unknown']])
        : [['amendment-empty','Shell'],['amendment-ready','Composer'],['amendment-options','Advanced'],['history-retained','History'],['runtime-checking','Runtime']];
      if (isPending(route)) boards = [[PENDING_SOURCES[route], 'Earlier layout']];
      var boardLinks = boards.map(function (board) { return '<a href="#' + H.routeFor('m04', board[0]) + '/' + theme + '">' + board[1] + '</a>'; }).join('');
      var strips = H.catalogStrips.m04;
      var notice = isPending(route) ? strips.pendingNotice : isRedraw(route) ? strips.redrawNotice : amendment ? strips.centeredNotice : strips.baselineNotice;
      var heading = isPending(route) ? strips.pendingHeading : isRedraw(route) ? (route.indexOf('centered-shell')===0 ? strips.redrawShellHeading : strips.redrawHeading) : amendment ? strips.centeredHeading : strips.baselineHeading;
      if (loading) catalog.innerHTML = '<div class="hd-m04-actions"><strong>' + loadingStrip.heading + '</strong><label>Frame <select data-m04-field="size"><option value="reference"' + (!s.narrow?' selected':'') + '>1280 × 800</option><option value="minimum"' + (s.narrow?' selected':'') + '>1000 × 620</option></select></label></div><p>' + loadingStrip.note + '</p>';
      else catalog.innerHTML = '<div class="hd-m04-actions"><strong>' + heading + '</strong>' + boardLinks + '<label>Frame <select data-m04-field="size"><option value="reference"' + (!s.narrow?' selected':'') + '>1280 × 800</option><option value="minimum"' + (s.narrow?' selected':'') + '>1000 × 620</option></select></label>' + button('Reset fixture','reset') + '</div><p>' + notice + '</p><details class="hd-m04-fixtures"'+(s.fixtures?' open':'')+'><summary>Fixture controls</summary><div class="hd-m04-actions">' + controls + '</div></details>';
      var base = template(s.collapsed ? 'new-task/sidebar-collapsed' : 'new-task/default');
      var app = base.querySelector('.hd-app'); app.removeAttribute('style'); app.classList.add('hd-m04-app'); app.setAttribute('data-theme',theme);
      frame.classList.toggle('hd-m04-window--minimum',s.narrow); frame.replaceChildren(app);
      // Owner correction: nav, Running and Recent work scroll together as one
      // bounded body; the sidebar header and the Settings/appearance footer
      // stay fixed. The wrapper is mounted before the branch manipulations so
      // history rows, the runtime gate and the collapsed rail keep working
      // through descendant selectors.
      var sidebarHost = app.querySelector('.hd-sidebar');
      if (sidebarHost) {
        var scrollBody = document.createElement('div');
        scrollBody.className = 'hd-m04-sidebar-scroll';
        var bodyNodes = Array.from(sidebarHost.children).filter(function (node) { return node.matches('.hd-nav,.hd-section'); });
        if (bodyNodes.length) {
          sidebarHost.insertBefore(scrollBody, bodyNodes[0]);
          bodyNodes.forEach(function (node) { scrollBody.appendChild(node); });
        }
      }
      if (runtimeLocked) {
        // The runtime preparation card sits in the sidebar scroll, between Statistics and Running. The nav is
        // disabled and Running and Recent work show headings only, as in the first-run setup state.
        app.querySelectorAll('.hd-nav-item').forEach(function (node) {
          node.classList.remove('is-active'); node.setAttribute('aria-disabled', 'true'); node.setAttribute('tabindex', '-1');
          node.style.opacity = '.45'; node.style.pointerEvents = 'none';
          node.querySelectorAll('.hd-dot,.hd-nav-item__count').forEach(function (x) { x.remove(); });
        });
        app.querySelectorAll('.hd-section').forEach(function (node) {
          node.querySelectorAll('.hd-section__list,.hd-section__count').forEach(function (x) { x.remove(); });
        });
        var running = app.querySelector('[aria-label="Running"]');
        if (running) running.insertAdjacentHTML('beforebegin', '<section class="hd-m04-sidebar-runtime" aria-labelledby="m04-runtime-title"><h2 id="m04-runtime-title">Installing runtime</h2><p>Preparing and verifying the required runtime…</p><div role="status">Installation in progress</div></section>');
        var rail = app.querySelector('[aria-label="Collapse sidebar"]');
        if (rail) rail.setAttribute('aria-disabled', 'true');
      }
      var main = app.querySelector('.hd-main');
      var topbar=main.querySelector('.hd-topbar'); if(topbar)topbar.innerHTML='<span class="caption hd-faint">'+esc(runtimeBoard?'Harflow · Setup':s.repository+' · New task')+'</span><span class="hd-topbar__spacer"></span>';
      if(route==='history-empty'){var running=app.querySelector('[aria-label="Running"]');if(running){running.querySelector('.hd-section__list').textContent='No running work';var count=running.querySelector('.hd-section__count');if(count)count.textContent='0';}}
      var collapse = app.querySelector('[aria-label="Collapse sidebar"], [aria-label="Expand sidebar"]'); if(collapse) collapse.dataset.m04='collapse';
      var recent = app.querySelector('[aria-label="Recent work"] .hd-section__list');
      if (recent && route.indexOf('history-') === 0) {
        var sourceRows=Array.from(recent.querySelectorAll('.hd-task-row'));
        var identityRows={'retry-budget':sourceRows[0],'events-reader':sourceRows[1]};
        var rows = s.rows.map(function(id){var row=identityRows[id]; if(row)row.dataset.identity=id;return row;}).filter(Boolean);
        rows.forEach(function(row) { if (row.dataset.identity===s.selected) { row.classList.add('is-active'); row.setAttribute('aria-current','true'); } });
        recent.replaceChildren.apply(recent,rows);
        var messages = {'history-empty':'No recent work yet.','history-older':'Loading older work…','history-error':'Older work could not be loaded. Loaded work is retained.','history-reconnecting':'Reconnecting… Loaded work may be incomplete.','history-retained':'Older history is outside this retained page. Selection is preserved.'};
        var note=document.createElement('div'); note.className='hd-m04-history-note caption'; note.textContent=messages[route]; recent.appendChild(note);
        if(route==='history-error') note.insertAdjacentHTML('beforeend',button('Retry older work','older'));
      }
      if (['history-older','history-error','history-reconnecting','history-retained'].includes(route)) {
        app.querySelectorAll('.hd-nav-item.is-active').forEach(function(node){node.classList.remove('is-active');});
        var done = template('task/done').querySelector('.hd-main');done.dataset.taskIdentity=s.selected;main.replaceWith(done); return;
      }
      if (runtimeBoard) {
        if(s.runtime!=='qualified') {
          app.querySelectorAll('.hd-nav,.hd-section').forEach(function(node){node.remove();});
          var side=app.querySelector('.hd-sidebar');
          if(side){var gate=document.createElement('div');gate.className='hd-m04-sidebar-gate';gate.textContent='Runtime setup required before creating or loading work.';side.insertBefore(gate,side.querySelector('.hd-sidebar__foot'));}
        } else if(s.listing!=='ready') {
          app.querySelectorAll('.hd-section').forEach(function(node){node.remove();});
        }
        var runtimeCopy={checking:['Checking Harflow runtime','Checking the managed runtime before loading your work.'], 'install-required':['Set up Harflow','The required runtime is not installed.'], 'update-required':['Update required','Installed 0.0.7 · required 0.0.8'],installing:['Installing runtime','Preparing and verifying the required runtime…'],failed:['Setup could not finish','The previous usable runtime is preserved. Review the failure and retry when ready.'],qualified:['Runtime ready',s.listing==='failed'?'Your runtime is ready. Recent work could not be loaded.':s.listing==='ready'?'Your runtime is ready and recent work is available.':'Loading your work for the first time…']};
        var copy=runtimeCopy[s.runtime] || runtimeCopy.checking;
        main.innerHTML='<div class="hd-topbar"><span class="caption hd-faint">Harflow · Runtime setup</span><span class="hd-topbar__spacer"></span></div><div class="hd-m04-gate"><h1 class="display">'+copy[0]+'</h1><p>'+copy[1]+'</p><div role="status">'+(s.runtime==='installing'?'Installation in progress':s.runtime==='failed'?'Package verification failed. No replacement was activated.':'')+'</div><div class="hd-m04-actions">'+(s.runtime==='install-required'?button('Install runtime','install'):s.runtime==='update-required'?button('Update runtime','install'):s.runtime==='failed'?button('Retry setup','install'):s.listing==='failed'?button('Retry loading work','listing-retry'):'')+'</div></div>'; return;
      }
      var textarea=app.querySelector('textarea'); textarea.value=s.draft; textarea.dataset.m04Field='draft'; textarea.disabled=runtimeLocked||['starting','unknown','created'].includes(s.status);
      var bar=app.querySelector('.hd-composer__bar');
      var locked=runtimeLocked||['starting','unknown','created'].includes(s.status);
      var plainStarting = route === 'centered-starting-plain' && s.status === 'starting';
      function options(values,current,gated){var all=values.slice();if(!all.includes(current))all.push(current);return all.map(function(v){return '<option value="'+esc(v)+'"'+(v===current?' selected':'')+(gated&&v===gated?' disabled':'')+'>'+esc(v)+(values.includes(v)?'':' — unavailable for this harness')+'</option>';}).join('');}
      function pill(label,icon,content,key){return '<details class="hd-m04-picker"'+(key&&s.picker===key?' open':'')+(key&&route==='centered-harness-open'?' data-m04-picker="'+key+'"':'')+'><summary class="hd-pill"><span class="hd-i hd-i-'+icon+'" aria-hidden="true"></span><span class="hd-pill__label">'+esc(label)+'</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></summary><div class="hd-menu hd-m04-picker-menu">'+content+'</div></details>';}
      // Only the open harness picker repeats the existing status message under the Harness select.
      function field(label,key,values){var gate=route==='centered-harness-open'&&key==='harness',hint=gate&&(s.harness==='Unavailable harness'||s.qualification!=='ready')?'Choose a qualified harness and model.':'';return '<label class="hd-m04-menu-field">'+label+'<select data-m04-field="'+key+'"'+(locked?' disabled':'')+(hint?' aria-describedby="m04-harness-hint"':'')+'>'+options(values,s[key],gate?'Unavailable harness':'')+'</select>'+(hint?'<span class="hd-field__hint" id="m04-harness-hint">'+esc(hint)+'</span>':'')+'</label>';}
      bar.innerHTML='<span class="hd-m04-options-anchor"><button type="button" class="hd-btn hd-btn--icon hd-m04-options-trigger" data-m04="options" aria-label="More task options" title="More task options" aria-expanded="'+s.advanced+'" aria-controls="m04-task-options" aria-describedby="m04-options-description"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-m04-options-dot"'+(customized(s)?'':' hidden')+' aria-hidden="true"></span><span class="hd-sr" id="m04-options-description">'+(customized(s)?'Customized options':'Default options')+'</span></button></span>'+pill(s.repository,'folder',field('Repository / recent folders','repository',['HarflowMCP','HarflowDesign','Unavailable folder']))+pill(s.harness+' · '+s.model,'harness',field('Harness','harness',['Claude Code','Codex','Mistral Vibe','Unavailable harness'])+field('Model','model',models(s.harness)),'harness')+pill({'read_only':'Read only','write_in_repo':'Can edit this repo','publish':'Can publish','unrestricted':'Broad access'}[s.access],'shield','<label class="hd-m04-menu-field">Access<select data-m04-field="access"'+(locked?' disabled':'')+'>'+['read_only','write_in_repo','publish','unrestricted'].map(function(v){return '<option value="'+v+'"'+(s.access===v?' selected':'')+'>'+({'read_only':'Read only','write_in_repo':'Can edit this repo','publish':'Can publish','unrestricted':'Broad access'})[v]+'</option>';}).join('')+'</select></label>')+'<span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="'+(plainStarting?'Starting task':'Start task')+'"'+(problem(s)||runtimeLocked||s.status==='created'?' disabled':'')+'><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button>';

      var wrap=app.querySelector('.hd-composer').parentElement;
      var oldCaption=wrap.querySelector('p'); if(oldCaption) oldCaption.remove();
      bar.querySelector('.hd-m04-options-anchor').insertAdjacentHTML('beforeend','<div id="m04-task-options" class="hd-menu hd-m04-options-popover" role="group" aria-label="Task options"'+(s.advanced?'':' hidden')+'><strong>Task options</strong><div class="hd-m04-actions"><label>Effort<select data-m04-field="effort"'+(locked?' disabled':'')+'>'+['default','low','medium','high','xhigh','unsupported'].map(function(x){return '<option'+(s.effort===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select></label><label>Turn limit<input class="hd-input" data-m04-field="turns" type="text" inputmode="numeric" value="'+esc(s.turns)+'"'+(locked?' disabled':'')+'></label><label>Approvals<select data-m04-field="approvals"'+(locked?' disabled':'')+'><option value="harness">Harness managed</option><option value="caller"'+(s.approvals==='caller'?' selected':'')+'>Caller approvals (supported harness only)</option></select></label></div><p class="caption">Permission preview: '+esc({'read_only':'Read only','write_in_repo':'Repository write','publish':'Publish access','unrestricted':'Broad access'}[s.access])+' · enforcement '+esc(s.enforcement)+'. '+(s.enforcement==='supported'?'The selected harness reports support for the requested access; this is not an OS sandbox guarantee.':'Required enforcement is not confirmed; Start is blocked.')+'</p><p class="caption" data-m04-qualification>Harness qualification: '+esc(s.qualification)+'. Unsupported requested choices stay visible for review.</p></div>');
      wrap.insertAdjacentHTML('beforeend','<div class="hd-m04-status'+(plainStarting?' hd-sr':'')+'" role="status">'+esc(runtimeLocked?'Set up the required runtime first.':s.status==='refused'?'Start was refused. Review the settings and try again.':s.status==='created'?'Task created.':problem(s)||'Ready to start · '+s.model)+'</div><div class="hd-m04-actions">'+(s.status==='unknown'?button('Review Recent work','recent'):s.status==='refused'?button('Review settings','settings'):'')+'</div>');
      app.querySelector('.hd-scroll').classList.add('hd-m04-compose-area');
      if (amendment) {
        // Override the baseline rows=3 and min-height:44px with a compact
        // one-visual-line prompt, then size it from real content.
        textarea.rows = 1;
        sizePrompt();
      }
      syncOptions();
    }
    // Amendment routes only: grow the prompt from actual scrollHeight so soft
    // wrapped lines count, and cap it at six visible lines with box-sizing and
    // textarea padding/border accounted for. The prompt scrolls past the cap,
    // so the caret and selection stay visible.
    function sizePrompt() {
      if (!amendment) return;
      var input = frame.querySelector('.hd-composer__input');
      if (!input) return;
      var style = window.getComputedStyle(input);
      var lineHeight = parseFloat(style.lineHeight) || 22;
      var verticalExtra = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
      var cap = promptCapHeight(lineHeight, verticalExtra);
      input.style.height = 'auto';
      var wanted = input.scrollHeight;
      input.style.height = Math.min(wanted, cap) + 'px';
      input.style.overflowY = wanted > cap ? 'auto' : 'hidden';
    }
    // The runtime preparation draft locks the composer while the runtime is not qualified.
    function runtimeIsLocked() { return route === 'runtime-installing-sidebar' && s.runtime !== 'qualified'; }
    function syncOptions(){
      var trigger=frame.querySelector('[data-m04="options"]'), popup=frame.querySelector('#m04-task-options');
      if(!trigger||!popup)return;
      var hint=popup.querySelector('[data-m04-qualification]');if(hint)hint.textContent='Harness qualification: '+s.qualification+'. Unsupported requested choices stay visible for review.';
      trigger.setAttribute('aria-expanded',String(s.advanced));popup.hidden=!s.advanced;
      if(s.advanced){
        if(amendment){
          // Amendment only: pick above or below by the space actually available
          // inside the clipping compose-area viewport (intersected with the
          // outer frame), with no artificial minimum height.
          var area=frame.querySelector('.hd-m04-compose-area');
          var metrics=amendmentPopupMetrics(trigger.getBoundingClientRect(), area?area.getBoundingClientRect():frame.getBoundingClientRect(), frame.getBoundingClientRect());
          popup.classList.toggle('hd-m04-options-popover--below', metrics.belowWins);
          popup.style.maxHeight=metrics.maxHeight+'px';
        } else {
          var scroll=frame.querySelector('.hd-scroll');var boundary=scroll?scroll.getBoundingClientRect().top:frame.getBoundingClientRect().top;var available=trigger.getBoundingClientRect().top-boundary-16;popup.style.maxHeight=Math.max(64,Math.min(400,available))+'px';
        }
      }
      trigger.querySelector('.hd-m04-options-dot').hidden=!customized(s);
      trigger.querySelector('.hd-sr').textContent=customized(s)?'Customized options':'Default options';
      var send=frame.querySelector('[type="submit"]');if(send)send.disabled=!!problem(s)||runtimeIsLocked();
      var status=frame.querySelector('.hd-m04-status');if(status)status.textContent=runtimeIsLocked()?'Set up the required runtime first.':s.status==='refused'?'Start was refused. Review the settings and try again.':problem(s)||'Ready to start · '+s.model;
    }
    function closeOptions(focus){if(!s.advanced)return;optionsOpen(s,false);syncOptions();if(focus){var trigger=frame.querySelector('[data-m04="options"]');if(trigger)trigger.focus();}}
    function keydown(e){if(e.key==='Escape'&&s.advanced){e.preventDefault();closeOptions(true);}}
    function outside(e){if(s.advanced&&!host.querySelector('.hd-m04-options-anchor')?.contains(e.target))closeOptions(false);}
    function input(e) {
      if (loading) return;
      var key=e.target.dataset.m04Field;if(!['draft','turns'].includes(key))return;
      if(['starting','unknown','created'].includes(s.status))return;
      if (key==='draft')s.draft=e.target.value;else select(s,key,e.target.value);
      syncOptions();
      sizePrompt();
    }

    function change(e) { var key=e.target.dataset.m04Field; if(!key || key==='draft')return;if(loading && key!=='size')return;if(key==='turns' && s.turns===e.target.value)return;if(['effort','turns','approvals'].includes(key)){select(s,key,e.target.value);syncOptions();return;} if(key==='size')s.narrow=e.target.value==='minimum'; else if(key==='repository'||key==='harness'||key==='model'||key==='access'||key==='effort'||key==='turns'||key==='approvals') select(s,key,e.target.value); else if(!['starting','unknown','created'].includes(s.status)) s[key]=e.target.value; render(); }
    function click(e) { var b=e.target.closest('[data-m04]'); if(loading){ if(e.target.closest('summary'))e.preventDefault(); if(!b||!loadingAllows(b.dataset.m04))return; } if(!b)return; var a=b.dataset.m04;
      if(a==='options'){optionsOpen(s,!s.advanced);syncOptions();if(s.advanced&&e.detail===0){var first=frame.querySelector('#m04-task-options select');if(first)first.focus();}return;}
      if(a==='reset'){s=create(route);lastState=s;} if(a==='collapse'&&!runtimeIsLocked())s.collapsed=!s.collapsed;
      if(a==='qualified')qualify(s,s.revision,s.repository==='Unavailable folder'||s.harness==='Unavailable harness'?'unqualified':'ready');
      if(a==='unqualified')qualify(s,s.revision,'unqualified');
      if(['created','refused','unknown'].includes(a))settle(s,a);
      if(a==='settings'){s.status='idle';s.advanced=true;}
      if(a==='recent'){location.hash='#'+H.routeFor('m04','history-retained')+'/'+(host.getAttribute('data-theme')||'light');return;}
      if(a.indexOf('enforcement-')===0){s.enforcement=a.slice(12);s.revision+=1;s.qualification='checking';}
      if(a==='runtime-failure')s.runtime='failed'; if(a==='install')s.runtime='installing'; if(a==='runtime-ready')s.runtime='qualified';
      if(a==='listing-ready')listing(s,'ready');if(a==='listing-failed')listing(s,'failed');if(a==='listing-retry')listing(s,'pending');
      if(a==='older'){location.hash='#'+H.routeFor('m04','history-older')+'/'+(host.getAttribute('data-theme')||'light');return;} render();
    }
    function submit(e){if(e.target.matches('.hd-composer')){e.preventDefault();if(loading)return;start(s);render();}}
    function toggle(e){if(e.target.matches('.hd-m04-fixtures'))s.fixtures=e.target.open;else if(route==='centered-harness-open'&&e.target.matches('.hd-m04-picker[data-m04-picker]'))s.picker=e.target.open?e.target.dataset.m04Picker:'';}
    host.addEventListener('input',input);host.addEventListener('change',change);host.addEventListener('click',click);host.addEventListener('submit',submit);host.addEventListener('toggle',toggle,true);
    host.addEventListener('keydown',keydown);document.addEventListener('click',outside);
    // Amendment only: prompt wrapping depends on the width, not the height, so
    // the observer triggers solely on a width change and batches into one RAF.
    // Sizing changes the textarea height only, which cannot feed back into the
    // observer; the frame itself keeps a fixed size.
    var widthObserver=null, widthRaf=0;
    if (amendment && typeof ResizeObserver==='function') {
      var lastWidth=frame.getBoundingClientRect().width;
      widthObserver=new ResizeObserver(function(){
        if(disposed)return;
        var width=frame.getBoundingClientRect().width;
        if(width===lastWidth)return;
        lastWidth=width;
        if(!widthRaf)widthRaf=window.requestAnimationFrame(function(){widthRaf=0;if(!disposed)sizePrompt();});
      });
      widthObserver.observe(frame);
    }
    render();
    return function(){disposed=true;host.removeEventListener('keydown',keydown);document.removeEventListener('click',outside);host.removeEventListener('input',input);host.removeEventListener('change',change);host.removeEventListener('click',click);host.removeEventListener('submit',submit);host.removeEventListener('toggle',toggle,true);if(widthRaf)window.cancelAnimationFrame(widthRaf);if(widthObserver)widthObserver.disconnect();};
  }
  H.m04Proposal={mount:mount,model:{loadingAllows:loadingAllows,create:create,customized:customized,optionsOpen:optionsOpen,problem:problem,select:select,qualify:qualify,start:start,settle:settle,history:history,listing:listing,isAmendment:isAmendment,isRedraw:isRedraw,isPending:isPending,redrawSources:REDRAW_SOURCES,pendingSources:PENDING_SOURCES,amendmentPopupMetrics:amendmentPopupMetrics,promptOneLineHeight:promptOneLineHeight,promptCapHeight:promptCapHeight,amendmentDrafts:AMENDMENT_DRAFTS}};
})();
