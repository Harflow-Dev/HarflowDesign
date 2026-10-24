(function () {
  const base = [
    {id:'mock-session-0',title:'Review persistence',backend:'claude',status:'running',session:true,summary:'',outcome:'',activity:true},
    {id:'mock-session-1',title:'Verify recovery',backend:'codex',status:'completed',session:true,summary:'Refactored the parser into smaller functions.',outcome:'',activity:false},
    {id:'mock-session-2',title:'Inspect task lineage',backend:'vibe',status:'failed',session:true,summary:'One edge-case test failed.',outcome:'The test process exited with code 1.',activity:false}
  ];
  const promptText='Review persistence, validate recovery, and report findings.';
  const taskRecord=task=>({...task,prompt:promptText,activityFixture:task.activity?'native-eight-steps':'empty'});
  let state = 'mixed', promptOpen = false, cancelOpen = false;
  HF.resetParallel = () => { promptOpen=false; cancelOpen=false; };
  const statuses = {running:['Running','running'],pending:['Pending','pending'],completed:['Done','completed'],failed:['Failed','failed'],cancelled:['Cancelled','cancelled']};
  const escape = value => HF.escape(value);
  const group = () => {
    if (state === 'empty') return [];
    if (state === 'two-lanes') return base.slice(0,2);
    if (state === 'completed') return base.map(x=>({...x,status:'completed',outcome:'',summary:x.id==='mock-session-0'?'Fixed the login bug.':'Refactored the parser into smaller functions.',activity:false}));
    return base;
  };
  HF.parallelFixtures = nextState => { const previous=state; state=nextState; const tasks=group().map(task=>({...task})); state=previous; return tasks.map(taskRecord); };
  HF.parallelTerminalEligibility = task => ({visible:!task.workflowID&&!task.workflowRunID,enabled:!!(task.sessionID ?? task.session)&&!task.busy});
  HF.presentParallel = () => { document.querySelectorAll('.parallel-feed-scroll').forEach(feed => { feed.scrollTop=feed.scrollHeight; }); };
  const statusSummary = lanes => lanes.length ? state==='completed'?'3 done':lanes.map(x=>x.status).reduce((a,s)=>(a[s]=(a[s]||0)+1,a),{}) && ['running','completed','failed','cancelled'].filter(s=>lanes.some(x=>x.status===s)).map(s=>`${lanes.filter(x=>x.status===s).length} ${s==='completed'?'done':s}`).join(' · ') : '';
  function lane(task) {
    const [label,kind] = statuses[task.status] || statuses.running;
    const symbol=task.status==='completed'?'checkmark.circle.fill.png':task.status==='failed'?'xmark.circle.fill.png':task.status==='cancelled'?'stop.circle.fill.png':null;
    const statusIcon=symbol?`<span class="parallel-symbol" aria-hidden="true"></span>`:'<i class="parallel-spinner" aria-hidden="true"></i>';
    const backend = task.backend[0].toUpperCase()+task.backend.slice(1);
    const timelineTask={id:task.id,backend:task.backend,status:'running',prompt:'Review persistence, validate recovery, and report findings.'};
    const timeline=HF.taskTimeline(timelineTask,'running').replace(/<div class="ta-started">[\s\S]*?(?=<p class="ta-prose">)/,'').replace(/<div class="ta-live">[\s\S]*?<\/div>/,'').replace('class="ta-feed"','class="parallel-feed-content"');
    const activity = task.activity ? `<div class="parallel-step-count">8 activity items</div><div class="parallel-feed-scroll" tabindex="0" role="region" aria-label="${escape(task.title)} activity">${timeline}</div>` : `<div class="parallel-no-tools">No tool calls recorded</div>`;
    const terminal = HF.parallelTerminalEligibility(task);
    const prompt = promptOpen ? '<div class="parallel-prompt">Review persistence, validate recovery, and report findings.</div>' : '';
    const result = task.summary ? `<div class="parallel-result"><div class="parallel-summary ${kind}">${escape(task.summary)}</div></div>` : '';
    return `<article class="parallel-lane ${kind}" data-task-id="${task.id}"><div class="parallel-lane-head"><div class="parallel-lane-title"><span class="parallel-icon ${kind}" aria-hidden="true">${statusIcon}</span><div class="parallel-lane-copy"><h3>${escape(task.title)}</h3><div class="parallel-lane-meta"><span class="backend-dot ${task.backend}" aria-hidden="true"></span>${backend} · HarflowMac</div></div><span class="parallel-status ${kind}">${statusIcon}${label}${task.status==='running'?' &nbsp;01:30':''}</span></div><div class="parallel-lane-actions"><button class="parallel-open" data-action="parallel-open:${task.id}">Open task</button><span class="spacer"></span>${terminal.visible?`<button class="parallel-terminal" data-action="parallel-terminal:${task.id}" ${terminal.enabled?'':'disabled'}><img src="assets/symbols/task-activity/terminal.png" alt="">Take over in terminal</button>`:''}</div></div>${task.outcome?`<p class="parallel-outcome">${escape(task.outcome)}</p>`:''}${prompt}<div class="parallel-divider"></div>${result}${activity}</article>`;
  }
  HF.renderParallel = nextState => {
    if(state!==nextState) HF.resetParallel();
    state=nextState;
    const lanes=group(), summary=statusSummary(lanes);
    const title=state==='deferred'?'<header class="parallel-group-header parallel-header-skeleton"><i></i><i></i></header>':`<header class="parallel-group-header"><div><h2>Session reliability</h2><p>${escape(state==='two-lanes'?'2 agents · read_only, write_in_repo · ~/HarflowMac · started 10:02 AM':'3 agents · read_only, write_in_repo · ~/HarflowMac · started 10:02 AM')}</p></div></header>`;
    const toolbar=state==='deferred'?'':`<div class="parallel-toolbar">${HF.button('View prompt','parallel-prompt')} ${lanes.some(x=>x.status==='running')?HF.button('Cancel all','parallel-cancel','danger'):''}</div>`;
    let body;
    if(state==='empty') body=`<div class="parallel-empty">No tasks in this group any more.</div>`;
    else if(state==='deferred') body=`<div class="parallel-lanes">${[0,1].map(()=>'<div class="parallel-lane-skeleton"><i></i><i></i><hr><b></b><b></b><b></b></div>').join('')}</div>`;
    else body=`<div class="parallel-claims"><span>No network</span><p>Enforced for every agent here: Access stays within the repository.</p></div><div class="parallel-lanes">${lanes.map(lane).join('')}</div>`;
    const confirm=cancelOpen?`<div class="parallel-dialog-backdrop" role="presentation"><section class="parallel-dialog" role="alertdialog" aria-modal="true" aria-labelledby="parallel-cancel-title"><h3 id="parallel-cancel-title">Cancel every running task in this group?</h3><p>This is a local mock action.</p>${HF.button('Keep running','parallel-close')} ${HF.button('Cancel all','parallel-confirm','danger')}</section></div>`:'';
    return HF.app(`<div class="parallel-app-body">${toolbar}${title}<div class="parallel-status-summary">${escape(summary)}</div>${body}${confirm}</div>`,'parallel-app','Harflow');
  };
  HF.renderParallelColumn = task => lane(task);
  HF.renderParallelColumns = (nextState = 'mixed', tasks = null) => {
    const previous = state;
    try {
      state = nextState;
      const columns = tasks || group();
      return `<div class="parallel-lanes">${columns.map(lane).join('')}</div>`;
    } finally {
      state = previous;
    }
  };
  if (typeof document !== 'undefined') document.addEventListener('keydown', event => {
    if (!cancelOpen || event.key !== 'Escape') return;
    event.preventDefault();
    document.querySelector('[data-action="parallel-close"]')?.click();
  });
  if (typeof document !== 'undefined') document.addEventListener('click', event => {
    const button=event.target.closest('[data-action^="parallel-"]'); if(!button||button.disabled)return;
    const rerender=focusAction=>{const width=document.querySelector('.parallel-app')?.style.width, scrolls=Array.from(document.querySelectorAll('.parallel-feed-scroll'),feed=>feed.scrollTop), offset=document.querySelector('.parallel-lanes')?.scrollLeft||0;document.querySelector('#stage').innerHTML=HF.renderParallel(state);if(width)document.querySelector('.parallel-app').style.width=width;document.querySelectorAll('.parallel-feed-scroll').forEach((feed,index)=>feed.scrollTop=scrolls[index]||0);const lanes=document.querySelector('.parallel-lanes');if(lanes)lanes.scrollLeft=offset;document.querySelector(`[data-action="${focusAction}"]`)?.focus()};
    event.preventDefault(); event.stopImmediatePropagation();
    const [action,id]=button.dataset.action.split(':');
    if(action==='parallel-open'){const task=group().find(item=>item.id===id);if(task){HF.pendingParallelTask={...taskRecord(task),time:'10:02 AM',sessionID:task.id,repoPath:'/Users/demo/HarflowMac'};HF.navigate('task-detail',task.status)}}
    if(action==='parallel-terminal')HF.feedback('Mock terminal action for '+id);
    if(action==='parallel-prompt'){promptOpen=!promptOpen;rerender('parallel-prompt')}
    if(action==='parallel-cancel'){cancelOpen=true;rerender('parallel-close')}
    if(action==='parallel-close'){cancelOpen=false;rerender('parallel-cancel')}
    if(action==='parallel-confirm'){cancelOpen=false;rerender('parallel-prompt');HF.feedback('Mock group cancellation requested')}
  });
})();
