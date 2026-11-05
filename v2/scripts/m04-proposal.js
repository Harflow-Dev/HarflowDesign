(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var lastRoute, lastState;
  function create(route) {
    var s = { route: route, draft: '', repository: 'HarflowMCP', harness: 'Claude Code', model: 'Opus 5.5', qualification: 'ready', revision: 0, status: 'idle', effort: 'default', turns: '12', approvals: 'harness', access: 'write_in_repo', enforcement: 'supported', advanced: route === 'advanced', collapsed: route === 'shell-collapsed', narrow: route === 'shell-narrow', runtime: 'qualified', listing: 'ready', selected: 'retry-budget', rows: ['retry-budget','events-reader'], fixtures: false, remembered: {} };
    if (route.indexOf('composer-')===0 || route==='advanced' || route==='advanced-closed') s.draft='Review the delivery queue';
    if(route==='advanced-closed')s.effort='high';
    if (/composer-(loading|unqualified)/.test(route)) s.qualification = route.endsWith('loading') ? 'checking' : 'unqualified';
    if (route === 'composer-invalid') { s.draft = 'Review the delivery queue'; s.turns = '0'; s.advanced = true; }
    if (/composer-(starting|refused|unknown)/.test(route)) { s.draft = 'Review the delivery queue'; s.status = route.split('-')[1]; }
    if (route === 'history-retained') s.rows=['events-reader'];
    if (route === 'history-empty' || route === 'history-loading') s.rows = [];
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
  function mount(root, route) {
    var host = root.matches && root.matches('.hd-m04-proposal') ? root : root.querySelector('.hd-m04-proposal');
    if (!host) return function () {};
    var s = lastRoute === route && lastState ? lastState : create(route), disposed = false;
    lastRoute = route; lastState = s;
    var frame = host.querySelector('.hd-m04-window'), catalog = host.querySelector('.hd-m04-catalog');
    function template(key) { var box = document.createElement('div'); box.innerHTML = H.fill ? H.fill(H.templates[key], host.getAttribute('data-theme') || 'light', host.getAttribute('data-theme') || 'light') : H.templates[key]; return box; }
    function render() {
      if (disposed) return;
      var theme = host.getAttribute('data-theme') || 'light';
      var runtimeBoard=route.indexOf('runtime-')===0, historyBoard=route.indexOf('history-')===0;
      var controls=runtimeBoard ? button('Runtime failure','runtime-failure')+button('Runtime ready','runtime-ready')+button('Listing ready','listing-ready')+button('Listing failed','listing-failed') : historyBoard ? '' : button('Qualification ready','qualified')+button('Qualification unavailable','unqualified')+button('Complete: created','created',s.status!=='starting')+button('Complete: refused','refused',s.status!=='starting')+button('Complete: unknown','unknown',s.status!=='starting')+button('Enforcement supported','enforcement-supported')+button('Enforcement unknown','enforcement-unknown')+button('Enforcement unsupported','enforcement-unsupported');
      catalog.innerHTML = '<div class="hd-m04-actions"><strong>Approved direction · M04 review</strong>' + ['shell','composer-ready','advanced','history-retained','runtime-checking'].map(function (id) { return '<a href="#m04-proposal/' + id + '/' + theme + '">' + ({shell:'Shell','composer-ready':'Composer',advanced:'Advanced','history-retained':'History','runtime-checking':'Runtime'})[id] + '</a>'; }).join('') + '<label>Frame <select data-m04-field="size"><option value="reference"' + (!s.narrow?' selected':'') + '>1280 × 800</option><option value="minimum"' + (s.narrow?' selected':'') + '>1000 × 620</option></select></label>' + button('Reset fixture','reset') + '</div><p>Local preview · appearance preserves draft · route changes reset · Reduce Motion: instant changes. Native titlebar and OS controls are browser approximations.</p><details class="hd-m04-fixtures"'+(s.fixtures?' open':'')+'><summary>Fixture controls</summary><div class="hd-m04-actions">' + controls + '</div></details>';
      var base = template(s.collapsed ? 'new-task/sidebar-collapsed' : 'new-task/default');
      var app = base.querySelector('.hd-app'); app.removeAttribute('style'); app.classList.add('hd-m04-app'); app.setAttribute('data-theme',theme);
      frame.classList.toggle('hd-m04-window--minimum',s.narrow); frame.replaceChildren(app);
      var main = app.querySelector('.hd-main');
      var topbar=main.querySelector('.hd-topbar'); if(topbar)topbar.innerHTML='<span class="caption hd-faint">'+esc(route.indexOf('runtime-')===0?'Harflow · Setup':s.repository+' · New task')+'</span><span class="hd-topbar__spacer"></span>';
      if(route==='history-empty'||route==='history-loading'){var running=app.querySelector('[aria-label="Running"]');if(running){running.querySelector('.hd-section__list').textContent=route==='history-loading'?'Loading running work…':'No running work';var count=running.querySelector('.hd-section__count');if(count)count.textContent=route==='history-loading'?'':'0';}}
      var collapse = app.querySelector('[aria-label="Collapse sidebar"], [aria-label="Expand sidebar"]'); if(collapse) collapse.dataset.m04='collapse';
      var recent = app.querySelector('[aria-label="Recent work"] .hd-section__list');
      if (recent && route.indexOf('history-') === 0) {
        var sourceRows=Array.from(recent.querySelectorAll('.hd-task-row'));
        var identityRows={'retry-budget':sourceRows[0],'events-reader':sourceRows[1]};
        var rows = s.rows.map(function(id){var row=identityRows[id]; if(row)row.dataset.identity=id;return row;}).filter(Boolean);
        rows.forEach(function(row) { if (row.dataset.identity===s.selected) { row.classList.add('is-active'); row.setAttribute('aria-current','true'); } });
        recent.replaceChildren.apply(recent,rows);
        var messages = {'history-empty':'No recent work yet.','history-loading':'Loading recent work…','history-older':'Loading older work…','history-error':'Older work could not be loaded. Loaded work is retained.','history-reconnecting':'Reconnecting… Loaded work may be incomplete.','history-retained':'Older history is outside this retained page. Selection is preserved.'};
        var note=document.createElement('div'); note.className='hd-m04-history-note caption'; note.textContent=messages[route]; recent.appendChild(note);
        if(route==='history-error') note.insertAdjacentHTML('beforeend',button('Retry older work','older'));
      }
      if (['history-older','history-error','history-reconnecting','history-retained'].includes(route)) {
        app.querySelectorAll('.hd-nav-item.is-active').forEach(function(node){node.classList.remove('is-active');});
        var done = template('task/done').querySelector('.hd-main');done.dataset.taskIdentity=s.selected;main.replaceWith(done); return;
      }
      if (route.indexOf('runtime-')===0) {
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
      var textarea=app.querySelector('textarea'); textarea.value=s.draft; textarea.dataset.m04Field='draft'; textarea.disabled=['starting','unknown','created'].includes(s.status);
      var bar=app.querySelector('.hd-composer__bar');
      var locked=['starting','unknown','created'].includes(s.status);
      function options(values,current){var all=values.slice();if(!all.includes(current))all.push(current);return all.map(function(v){return '<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+(values.includes(v)?'':' — unavailable for this harness')+'</option>';}).join('');}
      function pill(label,icon,content){return '<details class="hd-m04-picker"><summary class="hd-pill"><span class="hd-i hd-i-'+icon+'" aria-hidden="true"></span><span class="hd-pill__label">'+esc(label)+'</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></summary><div class="hd-menu hd-m04-picker-menu">'+content+'</div></details>';}
      function field(label,key,values){return '<label class="hd-m04-menu-field">'+label+'<select data-m04-field="'+key+'"'+(locked?' disabled':'')+'>'+options(values,s[key])+'</select></label>';}
      bar.innerHTML='<span class="hd-m04-options-anchor"><button type="button" class="hd-btn hd-btn--icon hd-m04-options-trigger" data-m04="options" aria-label="More task options" title="More task options" aria-expanded="'+s.advanced+'" aria-controls="m04-task-options" aria-describedby="m04-options-description"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-m04-options-dot"'+(customized(s)?'':' hidden')+' aria-hidden="true"></span><span class="hd-sr" id="m04-options-description">'+(customized(s)?'Customized options':'Default options')+'</span></button></span>'+pill(s.repository,'folder',field('Repository / recent folders','repository',['HarflowMCP','HarflowDesign','Unavailable folder']))+pill(s.harness+' · '+s.model,'harness',field('Harness','harness',['Claude Code','Codex','Mistral Vibe','Unavailable harness'])+field('Model','model',models(s.harness)))+pill({'read_only':'Read only','write_in_repo':'Can edit this repo','publish':'Can publish','unrestricted':'Broad access'}[s.access],'shield','<label class="hd-m04-menu-field">Access<select data-m04-field="access"'+(locked?' disabled':'')+'>'+['read_only','write_in_repo','publish','unrestricted'].map(function(v){return '<option value="'+v+'"'+(s.access===v?' selected':'')+'>'+({'read_only':'Read only','write_in_repo':'Can edit this repo','publish':'Can publish','unrestricted':'Broad access'})[v]+'</option>';}).join('')+'</select></label>')+'<span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="Start task"'+(problem(s)||s.status==='created'?' disabled':'')+'><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button>';

      var wrap=app.querySelector('.hd-composer').parentElement;
      var oldCaption=wrap.querySelector('p'); if(oldCaption) oldCaption.remove();
      bar.querySelector('.hd-m04-options-anchor').insertAdjacentHTML('beforeend','<div id="m04-task-options" class="hd-menu hd-m04-options-popover" role="group" aria-label="Task options"'+(s.advanced?'':' hidden')+'><strong>Task options</strong><div class="hd-m04-actions"><label>Effort<select data-m04-field="effort"'+(locked?' disabled':'')+'>'+['default','low','medium','high','xhigh','unsupported'].map(function(x){return '<option'+(s.effort===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select></label><label>Turn limit<input class="hd-input" data-m04-field="turns" type="text" inputmode="numeric" value="'+esc(s.turns)+'"'+(locked?' disabled':'')+'></label><label>Approvals<select data-m04-field="approvals"'+(locked?' disabled':'')+'><option value="harness">Harness managed</option><option value="caller"'+(s.approvals==='caller'?' selected':'')+'>Caller approvals (supported harness only)</option></select></label></div><p class="caption">Permission preview: '+esc({'read_only':'Read only','write_in_repo':'Repository write','publish':'Publish access','unrestricted':'Broad access'}[s.access])+' · enforcement '+esc(s.enforcement)+'. '+(s.enforcement==='supported'?'The selected harness reports support for the requested access; this is not an OS sandbox guarantee.':'Required enforcement is not confirmed; Start is blocked.')+'</p><p class="caption" data-m04-qualification>Harness qualification: '+esc(s.qualification)+'. Unsupported requested choices stay visible for review.</p></div>');
      wrap.insertAdjacentHTML('beforeend','<div class="hd-m04-status" role="status">'+esc(s.status==='refused'?'Start was refused. Review the settings and try again.':s.status==='created'?'Task created.':problem(s)||'Ready to start · '+s.model)+'</div><div class="hd-m04-actions">'+(s.status==='unknown'?button('Review Recent work','recent'):s.status==='refused'?button('Review settings','settings'):'')+'</div>');
      app.querySelector('.hd-scroll').classList.add('hd-m04-compose-area');
      syncOptions();
    }
    function syncOptions(){
      var trigger=frame.querySelector('[data-m04="options"]'), popup=frame.querySelector('#m04-task-options');
      if(!trigger||!popup)return;
      var hint=popup.querySelector('[data-m04-qualification]');if(hint)hint.textContent='Harness qualification: '+s.qualification+'. Unsupported requested choices stay visible for review.';
      trigger.setAttribute('aria-expanded',String(s.advanced));popup.hidden=!s.advanced;
      if(s.advanced){var scroll=frame.querySelector('.hd-scroll');var boundary=scroll?scroll.getBoundingClientRect().top:frame.getBoundingClientRect().top;var available=trigger.getBoundingClientRect().top-boundary-16;popup.style.maxHeight=Math.max(64,Math.min(400,available))+'px';}
      trigger.querySelector('.hd-m04-options-dot').hidden=!customized(s);
      trigger.querySelector('.hd-sr').textContent=customized(s)?'Customized options':'Default options';
      var send=frame.querySelector('[type="submit"]');if(send)send.disabled=!!problem(s);
      var status=frame.querySelector('.hd-m04-status');if(status)status.textContent=s.status==='refused'?'Start was refused. Review the settings and try again.':problem(s)||'Ready to start · '+s.model;
    }
    function closeOptions(focus){if(!s.advanced)return;optionsOpen(s,false);syncOptions();if(focus){var trigger=frame.querySelector('[data-m04="options"]');if(trigger)trigger.focus();}}
    function keydown(e){if(e.key==='Escape'&&s.advanced){e.preventDefault();closeOptions(true);}}
    function outside(e){if(s.advanced&&!host.querySelector('.hd-m04-options-anchor')?.contains(e.target))closeOptions(false);}
    function input(e) {
      var key=e.target.dataset.m04Field;if(!['draft','turns'].includes(key))return;
      if(['starting','unknown','created'].includes(s.status))return;
      if(key==='draft')s.draft=e.target.value;else select(s,key,e.target.value);
      syncOptions();
    }

    function change(e) { var key=e.target.dataset.m04Field; if(!key || key==='draft')return;if(key==='turns' && s.turns===e.target.value)return;if(['effort','turns','approvals'].includes(key)){select(s,key,e.target.value);syncOptions();return;} if(key==='size')s.narrow=e.target.value==='minimum'; else if(key==='repository'||key==='harness'||key==='model'||key==='access'||key==='effort'||key==='turns'||key==='approvals') select(s,key,e.target.value); else if(!['starting','unknown','created'].includes(s.status)) s[key]=e.target.value; render(); }
    function click(e) { var b=e.target.closest('[data-m04]'); if(!b)return; var a=b.dataset.m04;
      if(a==='options'){optionsOpen(s,!s.advanced);syncOptions();if(s.advanced&&e.detail===0){var first=frame.querySelector('#m04-task-options select');if(first)first.focus();}return;}
      if(a==='reset'){s=create(route);lastState=s;} if(a==='collapse')s.collapsed=!s.collapsed;
      if(a==='qualified')qualify(s,s.revision,s.repository==='Unavailable folder'||s.harness==='Unavailable harness'?'unqualified':'ready');
      if(a==='unqualified')qualify(s,s.revision,'unqualified');
      if(['created','refused','unknown'].includes(a))settle(s,a);
      if(a==='settings'){s.status='idle';s.advanced=true;}
      if(a==='recent'){location.hash='#m04-proposal/history-retained/'+(host.getAttribute('data-theme')||'light');return;}
      if(a.indexOf('enforcement-')===0){s.enforcement=a.slice(12);s.revision+=1;s.qualification='checking';}
      if(a==='runtime-failure')s.runtime='failed'; if(a==='install')s.runtime='installing'; if(a==='runtime-ready')s.runtime='qualified';
      if(a==='listing-ready')listing(s,'ready');if(a==='listing-failed')listing(s,'failed');if(a==='listing-retry')listing(s,'pending');
      if(a==='older'){location.hash='#m04-proposal/history-older/'+(host.getAttribute('data-theme')||'light');return;} render();
    }
    function submit(e){if(e.target.matches('.hd-composer')){e.preventDefault();start(s);render();}}
    function toggle(e){if(e.target.matches('.hd-m04-fixtures'))s.fixtures=e.target.open;}
    host.addEventListener('input',input);host.addEventListener('change',change);host.addEventListener('click',click);host.addEventListener('submit',submit);host.addEventListener('toggle',toggle,true);
    host.addEventListener('keydown',keydown);document.addEventListener('click',outside);
    render();
    return function(){disposed=true;host.removeEventListener('keydown',keydown);document.removeEventListener('click',outside);host.removeEventListener('input',input);host.removeEventListener('change',change);host.removeEventListener('click',click);host.removeEventListener('submit',submit);host.removeEventListener('toggle',toggle,true);};
  }
  H.m04Proposal={mount:mount,model:{create:create,customized:customized,optionsOpen:optionsOpen,problem:problem,select:select,qualify:qualify,start:start,settle:settle,history:history,listing:listing}};
})();
