(function(){
const terminal=new Set(['completed','failed','cancelled','timed-out']);
const sessionStates=new Set(['populated','install-retry','degraded-catalog','older-history-error']);
const fallbackPrompt='Fix the flaky login test. It fails about one run in five on CI and only when the keychain is cold.';

HF.taskMessageEligibility=({status,liveInput=false,takenOver=false,sessionID=null,text='',busy=false}={})=>{
  const hasText=String(text).trim().length>0;
  const running=status==='running';
  const canSend=running&&!!liveInput&&!takenOver&&!!hasText&&!busy;
  const canContinue=terminal.has(status)&&!!sessionID&&!busy&&hasText;
  return {canSend,canContinue,enabled:canSend||canContinue,action:canSend?'Send':canContinue?'Continue':null};
};

HF.taskActivityStatus=(task,state)=>sessionStates.has(state)?task?.status||'running':state==='spawned'?'running':state==='taken-over'?(terminal.has(task?.status)?task.status:'running'):state==='no-live'?'running':state==='no-session'?(task?.status||'completed'):state||task?.status||'running';

HF.taskTimeline=(task,state)=>{
  if(task?.activityFixture==='empty')return `<div class="ta-feed" data-status="${HF.escape(HF.taskActivityStatus(task,state))}"><div class="ta-beginning">Beginning of activity</div></div>`;
  const status=HF.taskActivityStatus(task,state);
  const running=status==='running';
  const prompt=HF.taskPrompt(task);
  const backend=task?.backend||'claude',backendLabel=backend[0].toUpperCase()+backend.slice(1);
  const finishedLabel=status==='completed'?'Finished':status==='failed'?'Failed · exit 1':status==='timed-out'?'Timed out':status==='cancelled'?'Cancelled':status;
  const finishedSymbol=status==='completed'?'checkmark.circle.fill':status==='cancelled'?'stop.circle.fill':'xmark.circle.fill';
  const commandsPending=running&&!task?.approvalFixture;
  const promptIsLong=prompt.length>240||(prompt.match(/\n/g)||[]).length>=3;
  const ending=task?.approvalFixture?HF.approvalTail():running?'<div class="ta-live"><i></i><span>Running swift test --filter LoginTests...</span></div>':`<div class="ta-finished${status==='failed'||status==='timed-out'?' failed':''}${status==='cancelled'?' cancelled':''}" role="status"><span><img src="assets/symbols/task-activity/${finishedSymbol}.png" alt="">${HF.escape(finishedLabel)}</span></div>`;
  const approvalCard=task?.approvalFixture&&HF.approvalPanel?HF.approvalPanel():'';
  return `<div class="ta-feed" data-status="${HF.escape(status)}">
    <div class="ta-beginning">Beginning of activity</div>
    <div class="ta-started"><div class="ta-prompt-wrap"><p class="ta-prompt${promptIsLong?' clamped':''}" data-full-prompt="${HF.escape(prompt)}">${HF.escape(prompt)}</p>${promptIsLong?'<button class="ta-disclosure" data-action="task-prompt-toggle">Show more</button>':''}</div><div class="ta-start-line"><span class="backend-dot ${HF.escape(backend)}"></span><span>${HF.escape(backendLabel)} started</span><span class="ta-access">Access level: Can edit this repo</span></div></div>
    <p class="ta-prose">I'll start by reading the test and the code it exercises.</p>
    <details class="ta-tool-group"><summary><img src="assets/symbols/task-activity/doc.text.png" alt=""><strong>Read 3 files</strong><span class="ta-chevron"></span></summary><div class="ta-tool-items"><div><code>/Users/example/repo/Sources/LoginTests.swift</code></div><div><code>/Users/example/repo/Sources/LoginViewModel.swift</code></div><div><code>/Users/example/repo/Sources/KeychainStore.swift</code></div></div></details>
    <p class="ta-prose">The store is read before it is warmed. Let me look for other callers.</p>
    <details class="ta-tool-group ta-search-group"><summary><img src="assets/symbols/task-activity/magnifyingglass.png" alt=""><span><strong>Searched 1 time</strong><small>KeychainStore.read</small></span><span class="ta-chevron"></span></summary><div class="ta-tool-items"><div><code>KeychainStore.read</code></div></div></details>
    <details class="ta-tool-group ta-edit-group" open><summary><img src="assets/symbols/task-activity/pencil.png" alt=""><strong>Edit</strong><code>/Users/example/repo/Sources/KeychainStore.swift</code><img class="ta-open-link" src="assets/symbols/task-activity/arrow.up.right.square.png" alt=""></summary><div class="ta-diff"><div class="ta-diff-line removed"><span>−</span><code>let value = read(key)</code></div><div class="ta-diff-line added"><span>+</span><code>let value = warmed ? read(key) : nil</code></div></div></details>
    <details class="ta-tool-group"><summary><img src="assets/symbols/task-activity/terminal.png" alt=""><strong>Ran 2 commands</strong>${commandsPending?'<i class="ta-spinner"></i>':''}<span class="ta-chevron"></span></summary><div class="ta-tool-items"><div><code>swift test</code><em>Passed</em></div><div><code>git diff --check</code><em>Passed</em></div></div></details>
    ${task?.approvalFixture?`<div class="ta-approval-slot">${approvalCard}</div><div class="ta-approval-tail">${ending}</div>`:ending}
  </div>`;
};
HF.taskActivitySurface=(task,state,initialTab='Activity',summaryState=state)=>{
  const status=HF.taskActivityStatus(task,state);
  HF.taskDetailContext={task,state,summaryState};
  const title=task?.title|| (state==='spawned'?'Implement persistence checks':'Review session persistence');
  const backend=task?.backend||'claude';
  const missing=['missing','deferred'].includes(status);
  const running=status==='running'||status==='taken-over';
  const sessionID=state==='no-session'?false:(task?.sessionID===undefined?true:task.sessionID);
  const liveInput=status==='running'&&(state==='no-live'?false:(task?.liveInput===undefined?true:task.liveInput));
  const takenOver=state==='taken-over'||!!task?.takenOver;
  const noSession=state==='no-session'||(!running&&!sessionID);
  const locked=running&&(!liveInput||takenOver);
  const fieldEnabled=!locked&&!noSession;
  const reason=noSession?'This task has no session to continue.':takenOver?'Messages are off — you took this task over in Terminal':!liveInput?"Messages are off — this task wasn't started with live input":'This task has no session to continue.';
  const placeholder=noSession?reason:running?'Message this task while it runs…':'Send a follow-up — it continues this conversation';
  const composer=missing?'':`<div class="ta-composer-wrap"><div class="ta-composer">${locked?`<div class="ta-lock-field"><img src="assets/symbols/task-activity/lock.fill.png" alt=""><span>${HF.escape(reason)}</span></div>`:`<textarea rows="1" id="task-message" ${fieldEnabled?'':'disabled'} aria-label="${running?'Message this task':'Continue this task'}" placeholder="${placeholder}"></textarea>`}<button class="ta-submit" data-action="send-message" data-kind="${running?'send':'continue'}" aria-label="${running?'Send':'Continue'}" title="${running?'Send':'Continue'}" disabled><img src="assets/symbols/task-activity/arrow.up.png" alt=""></button></div>${fieldEnabled?'<div class="ta-shortcut">⌘↩ to send</div>':''}</div>`;
  const activity=missing?status==='missing'?HF.empty('Task unavailable','The task record could not be found.'):HF.skeleton():`${task?.activityFixture==='empty'?'':'<div class="ta-count">8 activity items</div>'}<div class="ta-scroll-frame"><div class="ta-scroll" id="task-activity-scroll" tabindex="0" role="region" aria-label="Task activity"><div class="ta-reading">${HF.taskTimeline(task,status)}</div></div><div class="ta-scrollbar" aria-hidden="true"></div></div>`;
  const tabContent=initialTab==='Activity'?activity:`<div class="ta-tab-scroll"><div class="ta-reading">${task?.approvalFixture?`<div class="approval-hint-slot">${HF.approvalHint?HF.approvalHint():''}</div>`:''}${HF.taskPane(initialTab,task,state,summaryState)}</div></div>`;
  return `<div class="ta-page" data-task-state="${HF.escape(state)}"><div class="ta-main"><div class="ta-heading"><h2 id="task-title">${HF.escape(title)}</h2><div class="ta-meta"><span class="backend-dot ${HF.escape(backend)}"></span><strong>${HF.escape(backend[0].toUpperCase()+backend.slice(1))}</strong><span>repo</span><span>·</span><span>Access level: Can edit this repo</span></div></div><div class="tabs task-tabs" role="tablist">${['Activity','Summary','Prompt'].map(v=>`<button type="button" role="tab" aria-selected="${v===initialTab}" class="${v===initialTab?'active':''}" data-action="task-tab:${v}">${v}</button>`).join('')}</div><div id="task-tab-content">${tabContent}</div>${composer}</div>${HF.taskInspector(status).replace('task_fixture_01',task?.id||'task_fixture_01')}</div>`;
};

const base=HF.renderTasks;
HF.renderTasks=(screen,state)=>{
  if(screen==='tasks'&&HF.isSidebarSetupState?.(state)){
    HF.currentTask=null;
    HF.taskDetailContext=null;
    return HF.renderSidebarSetup(state);
  }
  if(screen==='tasks'&&HF.sidebarProposalStates?.includes(state)){
    HF.currentTask=null;
    HF.taskDetailContext=null;
    return HF.renderSidebarProposal(state);
  }
  if(!['tasks','task-detail','summary'].includes(screen)||['empty','no-results','backend-empty','loading','list-error','missing','deferred'].includes(state)&&screen!=='summary') return base(screen,state);
  let task=HF.currentTask;
  const summaryRoute=screen==='summary';
  if(summaryRoute&&!task)task=HF.taskSummaryFixture();
  if(!task){const status=HF.taskActivityStatus(null,state);task={id:'task_fixture_01',title:state==='spawned'?'Implement persistence checks':'Review session persistence',backend:'claude',status,prompt:fallbackPrompt,sessionID:state==='no-session'?null:true,liveInput:state!=='no-live',takenOver:state==='taken-over'};}
  const effective=summaryRoute?(task?.status||'completed'):sessionStates.has(state)?task?.status||'running':['taken-over','no-live','no-session'].includes(state)?state:(task?.status||state);
  const initialTab=summaryRoute?'Summary':'Activity';
  const warning=['install-retry','degraded-catalog','store-incompatible'].includes(state)?HF.banner(state==='install-retry'?'Managed runtime could not be prepared. '+HF.button('Try again','feedback:Runtime retry requested'):state==='store-incompatible'?'Harflow cannot read the selected store format. Your data remains in place. '+HF.button('Review in General settings','route:settings/recovery-incompatible'):'Harness catalog unavailable. Showing known harnesses.'):'';
  const body=`<div class="split">${HF.sidebar(screen==='tasks'?state:'populated')}<div class="content ta-content">${warning}<div class="ta-chrome">${HF.taskActivitySurface(task,effective,initialTab,summaryRoute?state:effective)}</div></div></div>`;
  const actionState=HF.taskActivityStatus(task,effective);
  const running=actionState==='running'||actionState==='taken-over';
  const sessionID=effective==='no-session'?false:(task?.sessionID===undefined?true:task.sessionID);
  const takeLabel=running&&!effective.includes('taken-over')?'Take over in Terminal':'Open in Terminal';
  const menu=[...(running?['Cancel task']:[]),...(sessionID?['Copy resume command']:[]),...(effective==='spawned'?['Open parent']:[]),'Raw events'];
  const actions=`<div class="ta-titlebar-actions"><span class="ta-status ${actionState==='failed'?'failed':terminal.has(actionState)?'completed':'running'}">${actionState.replaceAll('-',' ')}</span>${HF.button(takeLabel,takeLabel==='Open in Terminal'?'feedback:Mock terminal selected':'feedback:Mock terminal takeover requested')}<button class="ta-inspector-button" type="button" data-action="toggle-inspector" aria-label="Show inspector" title="Show inspector"><img src="assets/symbols/task-activity/sidebar.right.png" alt=""></button><details><summary aria-label="More actions"><img src="assets/symbols/task-activity/ellipsis.circle.png" alt=""></summary>${menu.map(v=>HF.button(v,v==='Raw events'?'route:raw-events/populated':'feedback:'+v)).join('')}</details></div>`;
  const options={connectionStatus:true,connectionScreen:HF.route?.screen,connectionState:HF.route?.state,actions};
  return HF.app(body,'task-activity-app','Harflow').replace(HF.titlebar('Harflow',{connectionStatus:true,connectionScreen:HF.route?.screen,connectionState:HF.route?.state}),HF.titlebar('Harflow',options));
};

HF.updateTaskMessageEligibility=()=>{
  const button=document.querySelector('.ta-submit');if(!button)return;
  const task=HF.taskDetailContext?.task||HF.currentTask||HF.fixtures[0],state=document.querySelector('.ta-page')?.dataset.taskState||HF.route.state;
  const status=HF.taskActivityStatus(task,state),field=document.querySelector('#task-message');
  const result=HF.taskMessageEligibility({status,liveInput:task.liveInput!==false&&state!=='no-live',takenOver:task.takenOver===true||state==='taken-over',sessionID:state==='no-session'?false:(task.sessionID===undefined?true:task.sessionID),text:field?.value||'',busy:task.busy===true});
  button.disabled=!result.enabled;
};
let scrollObserver;
HF.syncTaskScrollbar=()=>{
  const scroll=document.querySelector('#task-activity-scroll'),thumb=document.querySelector('.ta-scrollbar');if(!scroll||!thumb)return;
  const height=scroll.clientHeight,total=scroll.scrollHeight,range=total-height;
  thumb.hidden=range<=1;
  if(range>1){const size=Math.max(24,height*height/total);thumb.style.height=size+'px';thumb.style.top=(scroll.scrollTop/range*(height-size))+'px'}
};
HF.followTaskTail=()=>{
  const scroll=document.querySelector('#task-activity-scroll');if(!scroll)return;
  scroll.scrollTop=scroll.scrollHeight;HF.syncTaskScrollbar();
  scrollObserver?.disconnect();
  if(typeof ResizeObserver!=='undefined'){scrollObserver=new ResizeObserver(HF.syncTaskScrollbar);scrollObserver.observe(scroll);scrollObserver.observe(scroll.firstElementChild)}
};
if(document.addEventListener){
  document.addEventListener('scroll',event=>{if(event.target.id==='task-activity-scroll')HF.syncTaskScrollbar()},true);
  document.addEventListener('input',event=>{if(event.target.matches('.task-activity-app #task-message')){event.target.style.height='26px';event.target.style.height=Math.min(126,event.target.scrollHeight)+'px'}});
  document.addEventListener('keydown',event=>{if(event.metaKey&&event.key==='Enter'&&event.target.matches('.task-activity-app #task-message')){event.preventDefault();document.querySelector('.ta-submit:not(:disabled)')?.click()}});
}

let savedActivity;
HF.approvalFocusTarget=(root,focus)=>{
  const controls=Array.from(root.querySelectorAll('[data-action]'));
  const same=controls.find(button=>button.dataset.action===focus.action&&!button.disabled);
  if(same)return same;
  if(focus.actionContent){const content=root.querySelector('.approval-action-focus');if(content)return content}
  const inspect=controls.find(button=>button.dataset.action===focus.requestAction)||controls.find(button=>button.dataset.action.startsWith('approval-inspect:')&&!button.disabled);
  if(inspect)return inspect.disabled?inspect.closest('.approval-request'):inspect;
  return root.querySelector('.approval-inline');
};
HF.refreshApprovalPresentation=()=>{
  if(HF.route?.screen==='workflow-run'){HF.refreshRunApprovals?.();return}
  const page=document.querySelector('.ta-page');
  if(!page?.querySelector||!HF.taskDetailContext?.task?.approvalFixture)return;
  const slot=page.querySelector('.ta-approval-slot'),hintSlot=page.querySelector('.approval-hint-slot'),active=document.activeElement;
  const hadCardFocus=!!slot?.contains?.(active),hadHintFocus=!!hintSlot?.contains?.(active);
  const focus=hadCardFocus?{action:active.dataset?.action,requestAction:active.closest('.approval-request')?.querySelector('[data-action^="approval-inspect:"]')?.dataset.action,actionContent:active.matches('.approval-action-focus')||!!active.closest('.approval-action-focus')}:null;
  const update=root=>{
    const slot=root.querySelector('.ta-approval-slot');if(slot)slot.innerHTML=HF.approvalPanel();
    const tail=root.querySelector('.ta-approval-tail');if(tail)tail.innerHTML=HF.approvalTail();
    const hint=root.querySelector('.approval-hint-slot');if(hint)hint.innerHTML=HF.approvalHint();
  };
  const scroll=page.querySelector('#task-activity-scroll'),position=scroll?.scrollTop;
  update(page);
  if(focus)HF.approvalFocusTarget(page,focus)?.focus({preventScroll:true});
  else if(hadHintFocus)(page.querySelector('.approval-hint')||page.querySelector('[role="tab"][aria-selected="true"]'))?.focus({preventScroll:true});
  if(scroll){scroll.scrollTop=position;HF.syncTaskScrollbar()}
  if(savedActivity?.page===page){const holder=document.createElement('div');holder.innerHTML=savedActivity.html;update(holder);savedActivity.html=holder.innerHTML}
};
HF.appendTaskMessage=html=>{
  const page=document.querySelector('.ta-page');
  if(page&&savedActivity?.page!==page&&!document.querySelector('#task-activity-scroll')){const holder=document.createElement('div'),context=HF.taskDetailContext;holder.innerHTML=HF.taskActivitySurface(context.task,context.state,'Activity',context.summaryState);savedActivity={page,html:holder.querySelector('#task-tab-content').innerHTML,scrollTop:Number.MAX_SAFE_INTEGER};}
  const feed=document.querySelector('#task-activity-scroll .ta-reading');
  if(feed){feed.insertAdjacentHTML('beforeend',html);return}
  if(savedActivity?.page===document.querySelector('.ta-page')){
    const holder=document.createElement('div');holder.innerHTML=savedActivity.html;
    holder.querySelector('.ta-reading')?.insertAdjacentHTML('beforeend',html);
    savedActivity.html=holder.innerHTML;savedActivity.scrollTop=Number.MAX_SAFE_INTEGER;
  }
};
HF.renderTaskTab=(tab)=>{
  const content=document.querySelector('#task-tab-content');if(!content)return;
  const page=document.querySelector('.ta-page'),context=HF.taskDetailContext,task=page?context?.task:HF.currentTask,state=page?.dataset.taskState||HF.route.state,summaryState=page?context?.summaryState:state;
  if(content.querySelector('#task-activity-scroll'))savedActivity={page,html:content.innerHTML,scrollTop:content.querySelector('#task-activity-scroll').scrollTop};
  if(tab==='Summary'||tab==='Prompt')content.innerHTML=`<div class="ta-tab-scroll"><div class="ta-reading">${task?.approvalFixture?`<div class="approval-hint-slot">${HF.approvalHint?HF.approvalHint():''}</div>`:''}${HF.taskPane(tab,task,state,summaryState)}</div></div>`;
  else if(page){if(savedActivity?.page===page){content.innerHTML=savedActivity.html;HF.followTaskTail();content.querySelector('#task-activity-scroll').scrollTop=savedActivity.scrollTop;HF.syncTaskScrollbar()}else{const shell=document.createElement('div');shell.innerHTML=HF.taskActivitySurface(task,state,'Activity',summaryState);content.innerHTML=shell.querySelector('#task-tab-content')?.innerHTML||HF.taskActivity(task||HF.fixtures[0]);HF.followTaskTail()}HF.updateTaskMessageEligibility()}
  else content.innerHTML=HF.taskPane('Activity',task,state);
  if(task?.approvalFixture)HF.refreshApprovalPresentation();
};
})();
