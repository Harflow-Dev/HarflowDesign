(function(){
const oldRender=HF.renderTasks;
const now=()=>Date.parse('2026-10-24T12:00:00+07:00');
const request=(overrides={})=>({id:'approval_01',task_id:'abc12345',digest:'sha256:fixture-action-01',revision:0,complete:true,disposition:'pending',delivery:'pending',execution_outcome:'not_observed',ownership:'monitor',tool_name:'Bash',workflow_node_id:'',cwd:'/Users/example/repo',freedom:'write_in_repo',scope:'task',created_at:1792818000,deadline:Date.parse('2026-10-25T07:00:00+07:00'),action:{tool_name:'Bash',input:{command:'git push origin main'}},...overrides});
const history=()=>Array.from({length:17},(_,i)=>request({id:`approval_${String(i+1).padStart(2,'0')}`,disposition:i===0?'pending':'approved',delivery:i===0?'pending':'delivered',execution_outcome:i===0?'not_observed':'succeeded',decision:i===0?'':'approve',created_at:1792818000+i}));
const scenario=state=>({
 'monitor-pending':{requests:[request()],total:1},inspected:{requests:[request()],total:1,selectedID:'approval_01',detail:request(),current:true},submitting:{requests:[request()],total:1,selectedID:'approval_01',detail:request(),current:true,submitting:true},
 'caller-owned':{requests:[request({ownership:'caller'})],total:1,selectedID:'approval_01',detail:request({ownership:'caller'}),current:true,futureMacResponseCapability:true},'caller-owned-legacy':{requests:[request({ownership:'caller'})],total:1,selectedID:'approval_01',detail:request({ownership:'caller'}),current:true,futureMacResponseCapability:false},history:{requests:history(),total:17,selectedID:'approval_01',detail:history()[0],current:true},pagination:{requests:history().slice(0,5),total:17,cursor:'page-2'},approved:{requests:[request({disposition:'approved',delivery:'delivered',decision:'approve'})],total:1,selectedID:'approval_01',detail:request({disposition:'approved',delivery:'delivered',decision:'approve'})},denied:{requests:[request({disposition:'denied',delivery:'delivered',decision:'reject'})],total:1,selectedID:'approval_01',detail:request({disposition:'denied',delivery:'delivered',decision:'reject'})},expired:{requests:[request({deadline:now()-1000})],total:1,selectedID:'approval_01',detail:request({deadline:now()-1000}),current:true},error:{requests:[],total:0,error:'Approval metadata unavailable.'}
})[state]||{requests:[request()],total:1,futureMacResponseCapability:false};
let model=scenario('monitor-pending'),generation=0;
const esc=HF.escape;
const disabled=()=>model.loading||model.submitting;
const identityMatches=(a,b)=>!!a&&!!b&&a.id===b.id&&a.digest===b.digest&&a.revision===b.revision&&a.task_id===b.task_id;
const isPending=r=>r?.disposition==='pending'&&r.delivery==='pending';
const complete=r=>!!(r?.complete&&r.id&&r.task_id&&r.digest&&Number.isInteger(r.revision)&&r.action?.input&&typeof r.action.input==='object'&&!Array.isArray(r.action.input));
const canOwnResponse=(listed,detail,owner)=>!!(listed&&detail&&listed.ownership===detail.ownership&&(detail.ownership==='monitor'||detail.ownership==='caller'&&owner?.futureMacResponseCapability===true));
const canInspect=r=>!!(r&&r.id&&r.task_id&&r.task_id===model.taskID&&r.digest&&Number.isInteger(r.revision)&&!disabled());
const refreshKeepsInspection=(detail,listed,success=true)=>!!(success&&identityMatches(detail,listed)&&isPending(listed));
const pendingCount=()=>model.requests.filter(isPending).length;
const notify=()=>HF.refreshApprovalPresentation?.();
const canRespond=()=>{const r=model.detail,listed=model.requests.find(x=>x.id===model.selectedID);return !!(model.current&&complete(r)&&r.task_id===model.taskID&&identityMatches(listed,r)&&canOwnResponse(listed,r,model)&&isPending(r)&&isPending(listed)&&r.deadline>now()&&listed.deadline>now()&&!disabled())};
const clone=value=>JSON.parse(JSON.stringify(value));
const controller=HF.approvalController={
 get state(){return model},
 reset(state){generation++;model={taskID:'abc12345',futureMacResponseCapability:false,...scenario(state)}},
 deactivate(){generation++;model={taskID:null,requests:[],total:0,futureMacResponseCapability:false}},
 identityMatches,canInspect,refreshKeepsInspection,canRespond,pendingCount,isPending,
 inspect(id,suppliedDetail){
  const listed=model.requests.find(r=>r.id===id);if(!canInspect(listed))return false;
  model.selectedID=id;model.detail=null;model.current=false;model.error=null;
  const detail=clone(suppliedDetail||listed);
  if(!identityMatches(listed,detail)||!complete(detail)||listed.disposition!==detail.disposition){model.error='The action changed or its full payload is unavailable. Refresh and inspect it again.';notify();return false}
  model.detail=detail;model.current=true;notify();return true;
 },
 refresh(page={}){
  if(disabled()||!model.taskID)return false;
  if(page.success===false){model.error=page.error||'Approval metadata unavailable.';model.current=false;notify();return false}
  if(page.requests)model.requests=clone(page.requests);
  if(page.total!==undefined)model.total=page.total;
  if(page.cursor!==undefined)model.cursor=page.cursor;
  const listed=model.requests.find(r=>r.id===model.selectedID);
  if(!refreshKeepsInspection(model.detail,listed))model.current=false;
  model.error=null;notify();return true;
 },
 loadMore(page){
  if(disabled()||!model.taskID||!model.cursor)return false;
  const next=page||{requests:history().slice(model.requests.length),total:17,cursor:null};
  const seen=new Set();model.requests=[...model.requests,...clone(next.requests)].filter(r=>!seen.has(r.id)&&seen.add(r.id));
  model.total=next.total??model.total;model.cursor=next.cursor??null;
  if(!refreshKeepsInspection(model.detail,model.requests.find(r=>r.id===model.selectedID)))model.current=false;
  notify();return true;
 },
 beginResponse(decision){
  if(!['approve','reject'].includes(decision)||!canRespond())return null;
  const owner=model,token=generation,detail=clone(model.detail);let settled=false;
  model.submitting=true;model.current=false;model.error=null;notify();
  return ()=>{
   if(settled||generation!==token||model!==owner)return false;settled=true;
   const listed=owner.requests.find(r=>r.id===detail.id),currentDetail=owner.detail;
   if(!owner.submitting||owner.selectedID!==detail.id||!complete(detail)||!identityMatches(currentDetail,detail)||!isPending(currentDetail)||!identityMatches(listed,detail)||!canOwnResponse(listed,detail,owner)||!isPending(listed)||listed.task_id!==owner.taskID||detail.deadline<=now()||listed.deadline<=now()){
    owner.submitting=false;owner.error='The request is no longer current and was not changed.';notify();return false;
   }
   const result={...detail,disposition:decision==='approve'?'approved':'denied',delivery:'delivered',execution_outcome:'not_observed',decision};
   owner.requests=owner.requests.map(r=>r.id===result.id?result:r);owner.detail={...detail,...result};owner.submitting=false;
   owner.notice=`${decision==='approve'?'Approved':'Rejected'} in this local fixture; no response was sent.`;notify();return true;
  };
 },
 respond(decision){const settle=this.beginResponse(decision);if(!settle)return false;setTimeout(settle,350);return true}
};
controller.reset('monitor-pending');
HF.approvalPanel=()=>{
 const task=HF.taskDetailContext?.task||HF.currentTask;if(!task?.approvalFixture)return '';
 const visible=model.total>0||!!model.error;if(!visible)return '';
 const rows=model.requests.slice().sort((a,b)=>{const pri=x=>x.delivery==='delivery_unknown'?1:(x.disposition==='pending'||['reserved','sending'].includes(x.delivery)?0:2);return pri(a)-pri(b)||(a.created_at-b.created_at)||a.id.localeCompare(b.id)});
 const card=rows.map(r=>{const d=model.detail;const chosen=model.selectedID===r.id;const details=chosen&&model.detail?`<div class="approval-detail"><div>Working directory: ${esc(d.cwd)}<br>Access: ${esc(d.freedom)}<br>Scope: ${esc(d.scope)}<br>Source task: ${esc(d.task_id)}</div>${d.deadline?`<div>Deadline: ${new Date(d.deadline).toLocaleString('en-US',{timeZone:'Asia/Jakarta',dateStyle:'short',timeStyle:'short'})}</div>`:''}<pre tabindex="0" aria-label="Complete exact action">${esc(JSON.stringify(d.action,null,2)||'Complete action unavailable')}</pre><div>Delivery: ${esc(d.delivery)} · Observed execution: ${esc(d.execution_outcome)}</div>${canOwnResponse(r,d,model)?`<div class="approval-buttons"><button type="button" data-action="approval-decision:approve" ${canRespond()?'':'disabled'}>Approve once</button><button type="button" data-action="approval-decision:reject" ${canRespond()?'':'disabled'}>Reject</button></div>${d.ownership==='caller'?'<p class="approval-readonly">Respond here or through the owning client.</p>':''}`:d.ownership==='caller'&&model.futureMacResponseCapability===true?'<p class="approval-readonly">Respond here or through the owning client.</p>':'<p class="approval-readonly">This engine does not support Mac responses. Respond through the owning caller’s MCP or CLI.</p>'}</div>`:'';const decisionLines=[['Caller decision',r.decision],['Effective decision',r.effective_decision&&r.effective_decision!==r.decision?r.effective_decision:''],['Delivered decision',r.delivered_decision&&r.delivered_decision!==r.decision?r.delivered_decision:'']].filter(([,v])=>v);return `<div class="approval-request" tabindex="-1"><button type="button" class="approval-inspect" data-action="approval-inspect:${esc(r.id)}" ${disabled()?'disabled':''}>Inspect ${esc(r.tool_name)} · ${esc(r.workflow_node_id||r.task_id)}</button><div class="approval-metadata">${esc(r.disposition)} · Delivery: ${esc(r.delivery)} · Observed execution: ${esc(r.execution_outcome)}</div>${decisionLines.map(([k,v])=>`<div class="approval-metadata">${k}: ${esc(v)}</div>`).join('')}${details}</div>`}).join('');
 return `<div class="approval-card approval-inline" tabindex="-1" aria-label="Caller approvals"><header><strong>Caller approvals (${model.total})</strong><button type="button" data-action="approval-refresh" ${disabled()?'disabled':''}>Refresh</button></header>${card}${model.cursor?`<button class="approval-more" type="button" data-action="approval-page" ${disabled()?'disabled':''}>Load more requests</button>`:''}${model.error?`<p class="approval-error" role="status">${esc(model.error)}</p>`:''}${model.notice?`<p class="approval-notice" role="status">${esc(model.notice)}</p>`:''}</div>`;
};
HF.approvalTail=()=>pendingCount()?'<div class="ta-live ta-approval-waiting"><i></i><span>Waiting for approval: Bash · git push origin main</span></div>':'<div class="ta-live"><i></i><span>Waiting for task activity…</span></div>';
HF.approvalHint=()=>pendingCount()?`<button type="button" class="approval-hint" data-action="approval-jump"><strong>Waiting for approval</strong><span>${pendingCount()} pending request${pendingCount()===1?'':'s'} · View in Activity</span></button>`:'';
HF.renderTasks=(screen,state)=>{
 if(screen!=='approvals'){controller.deactivate();return oldRender(screen,state)}
 HF.approvalController.reset(state);
 const task={id:'abc12345',title:'Implement persistence checks',backend:'claude',status:'running',prompt:'Implement persistence checks and run the relevant test suite.',sessionID:true,liveInput:true,approvalFixture:true,durationSeconds:96,summary:'The implementation is complete. Waiting for approval to push the branch.',notices:['Auto-denied: git push']};
 HF.currentTask=task;
 return oldRender('task-detail','running');
};
})();
