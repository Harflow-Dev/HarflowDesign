(function(){
const oldRender=HF.renderTasks;
const now=()=>Date.parse('2026-10-24T12:00:00+07:00');
const request=(overrides={})=>({id:'approval_01',task_id:'abc12345',digest:'sha256:fixture-action-01',revision:0,complete:true,disposition:'pending',delivery:'pending',execution_outcome:'not_observed',ownership:'monitor',tool_name:'Bash',workflow_node_id:'',cwd:'/Users/example/repo',freedom:'write_in_repo',scope:'task',created_at:1792818000,deadline:Date.parse('2026-10-25T07:00:00+07:00'),action:{tool_name:'Bash',input:{command:'git push origin main'}},...overrides});
const callerRequest=()=>request({ownership:'caller',description:'The caller is asking to run this command.'});
const history=()=>Array.from({length:17},(_,i)=>request({id:`approval_${String(i+1).padStart(2,'0')}`,disposition:i===0?'pending':'approved',delivery:i===0?'pending':'delivered',execution_outcome:i===0?'not_observed':'succeeded',decision:i===0?'':'approve',created_at:1792818000+i}));
const swiftSource=Array.from({length:40},(_,i)=>i===0?'import Foundation':i===1?'':`    let value${i} = "${i}"`).join('\n');
const sel=(r,more={})=>({requests:[r],total:1,selectedID:r.id,detail:r,current:true,...more});
const decided=(o={})=>request({ownership:'caller',disposition:'approved',decision:'approve',decided_by:'caller',responder:'monitor',delivery:'sent',...o});
const withInput=(tool,input,o={})=>request({tool_name:tool,action:{tool_name:tool,input},...o});
const pendingSet=()=>[request({id:'approval_01',created_at:1792818000}),withInput('Write',{file_path:'Sources/Persistence/Store.swift',content:'import Foundation'},{id:'approval_02',digest:'sha256:fixture-action-02',created_at:1792818010}),withInput('commandExecution',{command:'swift test',cwd:'/Users/example/repo'},{id:'approval_03',digest:'sha256:fixture-action-03',created_at:1792818020})];
const extra=state=>{const found=({
 accepted:sel(decided({delivery:'reserved'}),{futureMacResponseCapability:true}),
 delivering:sel(decided({delivery:'sending'}),{futureMacResponseCapability:true}),
 'not-delivered':sel(decided({delivery:'failed'}),{futureMacResponseCapability:true}),
 cancelled:sel(request({ownership:'caller',disposition:'invalidated',decision:'approve',responder:'monitor',delivery:'delivery_unknown'}),{futureMacResponseCapability:true,stopped:true}),
 'ownership-lost':sel(request({ownership:'caller'}),{current:false,lost:'approval_01',futureMacResponseCapability:true,error:'Decision not applied. The owner of this request is gone.'}),
 'unknown-values':sel(request({ownership:'future-owner',disposition:'future-state',delivery:'future-delivery',execution_outcome:'future-outcome'}),{futureMacResponseCapability:true,error:'Harflow reported a reason this version does not recognize. Refresh to see the current state.',current:false}),
 delivered:sel(decided(),{futureMacResponseCapability:true}),
 'executed-succeeded':sel(decided({execution_outcome:'succeeded'}),{futureMacResponseCapability:true}),
 'executed-failed':sel(decided({execution_outcome:'failed'}),{futureMacResponseCapability:true}),
 'delivery-unknown':sel(decided({delivery:'delivery_unknown'}),{futureMacResponseCapability:true}),
 'decision-lost':sel(decided({responder:'caller'}),{current:false,futureMacResponseCapability:true,error:'The request is no longer current and was not changed.'}),
 'result-unknown':sel(request({ownership:'caller'}),{current:false,uncertain:'approval_01',futureMacResponseCapability:true,error:'The result could not be confirmed. Harflow refreshed this request and did not send your answer again.'}),
 'expiry-override':sel(decided({disposition:'expired',effective_decision:'reject',decided_by:'harflow'}),{futureMacResponseCapability:true}),
 'system-rejected':{requests:[request({id:'approval_01',disposition:'denied',decision:'reject',decided_by:'harflow',delivery:'sent',system_reason:'Protected path, agents cannot change .git/config',tool_name:'Write',action:{tool_name:'Write',input:{file_path:'.git/config',content:'[core]'}}}),request({id:'approval_02',digest:'sha256:fixture-action-02',created_at:1792818010,disposition:'denied',decision:'reject',decided_by:'harflow',delivery:'sent',system_reason:'Request too large to review'})],total:2,selectedID:'approval_01',detail:'FIRST',current:true},
 invalidated:sel(request({ownership:'caller',disposition:'invalidated',decision:'approve'}),{futureMacResponseCapability:true,stopped:true}),
 incomplete:sel(request({complete:false}),{}),
 'capability-lost':sel(callerRequest(),{futureMacResponseCapability:false,notice:'Mac responses became unavailable after inspection. This request is now read-only here.'}),
 undecidable:sel(callerRequest(),{futureMacResponseCapability:true,undecidable:true}),
 'multiple-pending':{requests:pendingSet(),total:3,separate:true},
 'multiple-bounded':{requests:pendingSet(),total:32,separate:true,more:true,cursor:'page-2'},
 loading:{requests:[],total:0,loading:true},
 'action-bash':sel(withInput('Bash',{command:'swift test --filter PersistenceTests',description:'Run the persistence tests',timeout:120000})),
 'action-write':sel(withInput('Write',{file_path:'Sources/Persistence/Store.swift',content:swiftSource})),
 'action-edit':sel(withInput('Edit',{file_path:'Sources/Persistence/Store.swift',old_string:'let limit = 10\nlet retries = 1',new_string:'let limit = 25\nlet retries = 3',replace_all:false})),
 'action-codex-command':sel(withInput('commandExecution',{threadId:'thr_01',turnId:'turn_01',itemId:'item_01',startedAtMs:1792818000000,command:'swift test --filter PersistenceTests',cwd:'/Users/example/repo',timeout_ms:120000,sandbox:{mode:'workspace-write',network:false}})),
 'action-codex-filechange':sel(withInput('fileChange',{threadId:'thr_01',turnId:'turn_01',itemId:'item_02',changes:[{path:'Sources/Store.swift',kind:'update',diff:'@@ -1,2 +1,2 @@\n-let limit = 10\n+let limit = 25'},{path:'Sources/Cache.swift',kind:'add',diff:'+final class Cache {}'},{path:'Sources/Legacy.swift',kind:'delete',diff:'-final class Legacy {}'},{path:'Sources/Old.swift',kind:{type:'update',move_path:'Sources/Renamed.swift',futureFlag:true},diff:'@@ -1 +1 @@\n-// old\n+// renamed'}]})),
 'action-generic':sel(withInput('mcp__tracker__update_issue',{title:'  Leading space kept ',labels:['bug',''],assignee:null,estimate:3,archived:false,metadata:{},options:{notify:true,fields:['status','owner']},unknown_future_key:'kept as is'})),
 'answered-from-monitor':{requests:[decided({id:'approval_01',execution_outcome:'succeeded',reason:'The branch is ready and the tests pass, so I need to publish it for review.'}),decided({id:'approval_02',digest:'sha256:fixture-action-02',created_at:1792818010,responder:'caller',tool_name:'Write',action:{tool_name:'Write',input:{file_path:'README.md',content:'Updated'}}})],total:2,selectedID:'approval_01',detail:decided({id:'approval_01',execution_outcome:'succeeded',reason:'The branch is ready and the tests pass, so I need to publish it for review.'}),current:true,futureMacResponseCapability:true},
 'source-attribution':{requests:[withInput('Write',{file_path:'Sources/Persistence/Store.swift',content:'import Foundation'},{workflow_node_name:'Implement'})],total:1}
})[state];if(found&&found.detail==='FIRST')found.detail=found.requests[0];return found};
const scenario=state=>({
 'monitor-pending':{requests:[request()],total:1},inspected:{requests:[request()],total:1,selectedID:'approval_01',detail:request(),current:true},submitting:{requests:[request()],total:1,selectedID:'approval_01',detail:request(),current:true,submitting:true},
 'caller-owned':{requests:[callerRequest()],total:1,selectedID:'approval_01',detail:callerRequest(),current:true,futureMacResponseCapability:true},'caller-owned-legacy':{requests:[callerRequest()],total:1,selectedID:'approval_01',detail:callerRequest(),current:true,futureMacResponseCapability:false},history:{requests:history(),total:17,selectedID:'approval_01',detail:history()[0],current:true},pagination:{requests:history().slice(0,5),total:17,cursor:'page-2'},approved:{requests:[request({disposition:'approved',delivery:'delivered',decision:'approve'})],total:1,selectedID:'approval_01',detail:request({disposition:'approved',delivery:'delivered',decision:'approve'})},denied:{requests:[request({disposition:'denied',delivery:'delivered',decision:'reject'})],total:1,selectedID:'approval_01',detail:request({disposition:'denied',delivery:'delivered',decision:'reject'})},expired:{requests:[request({deadline:now()-1000})],total:1,selectedID:'approval_01',detail:request({deadline:now()-1000}),current:true},error:{requests:[],total:0,error:'Approval metadata unavailable.'}
})[state]||extra(state)||{requests:[request()],total:1,futureMacResponseCapability:false};
let model=scenario('monitor-pending'),generation=0;
const esc=HF.escape;
const displayValue=value=>value===null?'No value':value===''?'Empty text':Array.isArray(value)?value.length?'': 'Empty list':typeof value==='object'?Object.keys(value).length?'':'Empty object':typeof value==='boolean'?value?'Yes':'No':String(value);
const inputRows=(value,path='Input')=>{
 if(Array.isArray(value))return value.length?value.flatMap((item,index)=>inputRows(item,`${path} ${index+1}`)): [[path,'Empty list']];
 if(value&&typeof value==='object'){
  const entries=Object.entries(value);
  return entries.length?entries.flatMap(([key,item])=>inputRows(item,path==='Input'?key:`${path} · ${key}`)):[[path,'Empty object']];
 }
 return [[path,displayValue(value)]];
};
const clip=(value,limit)=>{const text=String(value);return text.length>limit?text.slice(0,limit-1)+'…':text};
const block=(label,text)=>`<div class="approval-command"><span>${esc(label)}</span><pre class="approval-scroll" tabindex="0" aria-label="${esc(label)}">${esc(text===''?'Empty text':text)}</pre></div>`;
const leaves=v=>Array.isArray(v)?(v.length?v.reduce((n,x)=>n+leaves(x),0):1):v&&typeof v==='object'?(Object.keys(v).length?Object.values(v).reduce((n,x)=>n+leaves(x),0):1):1;
const routineKeys=['threadId','turnId','itemId','startedAtMs'];
const kindOf=raw=>({add:'Add',update:'Update',delete:'Delete'}[raw]||'Change: '+raw);
const consumeChanges=input=>Array.isArray(input.changes)&&input.changes.length&&input.changes.every(c=>c&&typeof c==='object'&&!Array.isArray(c)&&typeof c.path==='string');
const rowsHTML=rows=>rows.length?`<dl class="approval-inputs">${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`:'';
const changeView=c=>{
 let n=1,label='Unknown change',move='',extras=[];
 const k=c.kind;
 if(typeof k==='string'){label=kindOf(k);n++}
 else if(k&&typeof k==='object'&&!Array.isArray(k)&&typeof k.type==='string'){label=kindOf(k.type);n++;if(typeof k.move_path==='string'){move=k.move_path;n++}extras=Object.entries(k).filter(([key])=>key!=='type'&&!(key==='move_path'&&typeof k.move_path==='string')).flatMap(([key,v])=>inputRows(v,'kind · '+key))}
 else if(k!==undefined)extras=inputRows(k,'kind');
 const moveTop=!move&&typeof c.move_path==='string';if(moveTop){move=c.move_path;n++}
 const diffText=typeof c.diff==='string';if(diffText)n++;
 const rest=Object.entries(c).filter(([key])=>!['path','kind'].includes(key)&&!(key==='diff'&&diffText)&&!(key==='move_path'&&moveTop)).flatMap(([key,v])=>inputRows(v,key));
 n+=extras.length+rest.length;
 return {n,html:`<div class="approval-change"><p class="approval-context"><strong>${esc(label)}</strong> ${esc(c.path)}${move?` → ${esc(move)}`:''}</p>${diffText?block('Diff',c.diff):''}${rowsHTML([...extras,...rest])}</div>`};
};
const actionSummary=r=>{
 const input=r.action?.input&&typeof r.action.input==='object'?r.action.input:{};
 const first=[input.command,input.file_path,Array.isArray(input.changes)?input.changes.map(c=>c?.path).filter(v=>typeof v==='string'&&v).join(', '):'',input.path].find(v=>typeof v==='string'&&v);
 return clip(first||Object.values(input).find(v=>typeof v==='string'&&v)||'Review the action',80);
};
const actionView=d=>{
 const tool=String(d.action?.tool_name||d.tool_name||'Unknown tool');
 const input=d.action?.input&&typeof d.action.input==='object'&&!Array.isArray(d.action.input)?d.action.input:{};
 const lower=tool.toLowerCase(),consumed=new Set(),str=k=>typeof input[k]==='string'?input[k]:undefined;
 let shown=0;const take=k=>{consumed.add(k);shown++;return input[k]};
 const isBash=lower==='bash',isCommand=isBash||lower==='commandexecution',isCodex=lower==='commandexecution'||lower==='filechange';
 let title=isCommand?'Run command':tool,topDescription=typeof d.description==='string'&&d.description.trim()?d.description.trim():'',cwd=typeof d.cwd==='string'&&d.cwd.trim()?d.cwd:'',blocks='',path='';
 if(isCodex)for(const k of routineKeys)if(k in input){consumed.add(k);shown+=leaves(input[k])}
 if(isCommand&&str('command')!==undefined){take('command');blocks+=`<div class="approval-command"><span>Command</span><pre tabindex="0" aria-label="Requested command">${esc(input.command)}</pre></div>`}
 if(isBash&&!topDescription&&str('description')){topDescription=take('description').trim()}
 if(lower==='commandexecution'&&str('cwd')){cwd=take('cwd')}
 if(lower==='write'&&str('file_path')!==undefined){title='Write file';path=take('file_path');if(str('content')!==undefined)blocks+=block('Content',take('content'))}
 if(lower==='edit'&&str('file_path')!==undefined){title='Edit file';path=take('file_path');if(str('old_string')!==undefined)blocks+=block('Replace this text',take('old_string'));if(str('new_string')!==undefined)blocks+=block('With this text',take('new_string'))}
 if(lower==='filechange'&&consumeChanges(input)){title='Change files';consumed.add('changes');for(const c of input.changes){const v=changeView(c);shown+=v.n;blocks+=v.html}}
 const description=topDescription?`<p class="approval-description">${esc(topDescription)}</p>`:'';
 const reason=typeof d.reason==='string'&&d.reason.trim()?`<div class="approval-reason"><span>Agent's stated reason</span><p>${esc(clip(d.reason.trim(),400))}</p></div>`:'';
 const step=typeof d.workflow_node_name==='string'&&d.workflow_node_name?`<p class="approval-context">Workflow step: ${esc(d.workflow_node_name)}</p>`:'';
 const location=cwd?`<p class="approval-context">In ${esc(cwd)}</p>`:'';
 const file=path!==''?`<p class="approval-context">Path: ${esc(path)}</p>`:'';
 const values=Object.entries(input).filter(([key])=>!consumed.has(key)).flatMap(([key,value])=>inputRows(value,key));
 shown+=values.length;
 const total=Object.values(input).reduce((n,v)=>n+leaves(v),0);
 return {title,reason,covered:shown===total,content:`<div class="approval-action"><strong>${esc(title)}</strong>${description}${step}${location}${file}${blocks}${rowsHTML(values)}</div>`};
};
const known={ownership:['monitor','caller'],disposition:['pending','approved','denied','expired','invalidated'],delivery:['pending','reserved','sending','sent','delivered','delivery_unknown','failed'],execution_outcome:['not_observed','succeeded','failed']};
const knownRequest=r=>!!r&&Object.entries(known).every(([k,v])=>r[k]===undefined||v.includes(r[k]));
const statusLabel=r=>{
 const d=r.disposition;
 if(!knownRequest(r))return 'unknown';
 if(d==='invalidated')return 'invalidated'+(r.delivery==='delivery_unknown'?' · delivery unknown':r.delivery==='failed'?' · not delivered':'');
 if(d==='expired'&&r.decision==='approve')return 'expired · approval overridden · rejection '+({sent:'delivered',sending:'delivering',reserved:'accepted'}[r.delivery]||r.delivery||'pending');
 if(r.decided_by==='harflow')return 'rejected by Harflow';
 if(r.delivery==='reserved')return `${d} · accepted`;
 if(r.delivery==='sending')return `${d} · delivering`;
 if(r.delivery==='delivery_unknown')return `${d} · delivery unknown`;
 if(r.delivery==='failed')return `${d} · not delivered`;
 if(r.delivery==='sent')return `${d} · delivered`+({succeeded:' · succeeded',failed:' · failed'}[r.execution_outcome]||' · execution not observed');
 return d;
};
const provenance=r=>r.responder==='monitor'?'Answered from Monitor':r.responder==='caller'?'Answered by the owning caller':'';
const guidance=r=>{
 const note=(text,tone='',hide=true)=>({text,tone,hide});
 if(!knownRequest(r))return note('This request uses a value this version does not recognize. It is shown as unknown and cannot be answered here.','warn');
 if(r.disposition==='invalidated'){
  if(r.delivery==='delivery_unknown')return note('Decision not applied. Delivery could not be confirmed; Harflow will not retry.','warn');
  if(r.delivery==='pending'||r.delivery==='failed')return note('Decision not applied. The task stopped or its owner is gone, so the answer was not delivered.','warn');
  return note('Decision not applied. Harflow could not confirm what was delivered.','warn');
 }
 if(r.disposition==='expired'&&r.decision==='approve')return note('The deadline passed before the approval could be delivered. Harflow sent a rejection instead, so the action was not run.','warn');
 if(r.decided_by==='harflow')return note(`Rejected by Harflow: ${r.system_reason||'reason unavailable'}. The action was not run.`,'warn');
 if(r.delivery==='reserved')return note('Decision accepted. Waiting to deliver to the agent.');
 if(r.delivery==='sending')return note('Decision accepted. Delivering to the agent.');
 if(r.delivery==='delivery_unknown')return note('Delivery could not be confirmed. Harflow will not retry this decision.','warn');
 if(r.delivery==='failed')return note('Not delivered. The action was not run.','warn');
 if(r.delivery==='sent')return r.execution_outcome==='succeeded'?note('Delivered. The action ran and succeeded.'):r.execution_outcome==='failed'?note('Delivered. The action ran and failed. Approval does not mean the action succeeded.','warn'):note('Delivered to the agent. Whether the action ran has not been observed. Approval does not mean the action succeeded.');
 if(r.complete===false)return note('Approval is disabled because the full action is not available to review.','warn',false);
 if(!actionView(r).covered)return note('Approval is disabled because part of this action cannot be shown here.','warn',false);
 if(model.undecidable&&r.ownership==='caller'&&isPending(r))return note('Harflow could not confirm this Mac is not running inside an agent task, so it cannot answer here. Respond through the owning caller’s MCP or CLI.','warn');
 return null;
};
const disabled=()=>model.loading||model.submitting;
const identityMatches=(a,b)=>!!a&&!!b&&a.id===b.id&&a.digest===b.digest&&a.revision===b.revision&&a.task_id===b.task_id;
const isPending=r=>r?.disposition==='pending'&&r.delivery==='pending';
const complete=r=>!!(r?.complete&&r.id&&r.task_id&&r.digest&&Number.isInteger(r.revision)&&r.action?.input&&typeof r.action.input==='object'&&!Array.isArray(r.action.input));
const canOwnResponse=(listed,detail,owner)=>!!(listed&&detail&&listed.ownership===detail.ownership&&(detail.ownership==='monitor'||detail.ownership==='caller'&&owner?.futureMacResponseCapability===true&&owner?.undecidable!==true));
const canInspect=r=>!!(r&&r.id&&r.task_id&&r.task_id===model.taskID&&r.digest&&Number.isInteger(r.revision)&&!disabled());
const refreshKeepsInspection=(detail,listed,success=true)=>!!(success&&identityMatches(detail,listed)&&isPending(listed));
const pendingCount=()=>model.requests.filter(isPending).length;
const pendingRows=()=>model.requests.filter(isPending).sort((a,b)=>(a.created_at-b.created_at)||a.id.localeCompare(b.id));
const notify=()=>HF.refreshApprovalPresentation?.();
const canRespond=()=>{const r=model.detail,listed=model.requests.find(x=>x.id===model.selectedID);return !!(model.current&&r?.id!==model.uncertain&&r?.id!==model.lost&&!model.undecidable&&knownRequest(r)&&complete(r)&&actionView(r).covered&&r.task_id===model.taskID&&identityMatches(listed,r)&&canOwnResponse(listed,r,model)&&isPending(r)&&isPending(listed)&&r.deadline>now()&&listed.deadline>now()&&!disabled())};
const clone=value=>JSON.parse(JSON.stringify(value));
const controller=HF.approvalController={
 get state(){return model},
 reset(state){generation++;model={taskID:'abc12345',futureMacResponseCapability:false,...scenario(state)}},
 deactivate(){generation++;model={taskID:null,requests:[],total:0,futureMacResponseCapability:false}},
 identityMatches,canInspect,refreshKeepsInspection,canRespond,pendingCount,isPending,
 inspect(id,suppliedDetail){
  const listed=model.requests.find(r=>r.id===id);if(!canInspect(listed))return false;
  model.selectedID=id;model.detail=null;model.current=false;if(id!==model.uncertain&&id!==model.lost)model.error=null;
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
  for(const key of ['uncertain','lost']){const held=model.requests.find(r=>r.id===model[key]);if(model[key]&&held&&!isPending(held))model[key]=false}
  if(!model.uncertain&&!model.lost)model.error=null;notify();return true;
 },
 loadMore(page){
  if(disabled()||!model.taskID||!model.cursor)return false;
  const next=page||(model.separate?{requests:[],total:model.total,cursor:null}:{requests:history().slice(model.requests.length),total:17,cursor:null});
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
 const visible=model.total>0||!!model.error||!!model.loading;if(!visible)return '';
 if(model.loading)return `<div class="approval-card approval-inline" tabindex="-1" aria-label="Caller approvals"><header><strong>Caller approvals</strong><button type="button" data-action="approval-refresh" disabled>Refresh</button></header><p class="approval-metadata" role="status">Loading approval requests…</p></div>`;
 const rows=model.requests.slice().sort((a,b)=>{const pri=x=>x.delivery==='delivery_unknown'?1:(x.disposition==='pending'||['reserved','sending'].includes(x.delivery)?0:2);return pri(a)-pri(b)||(a.created_at-b.created_at)||a.id.localeCompare(b.id)});
 const item=r=>{const d=model.detail;const chosen=model.selectedID===r.id&&!!d;const view=chosen?d:r;const action=chosen?actionView(d):null;const g=chosen?guidance(d):null;const prov=provenance(view);
  const controls=!chosen||g?.hide?'':canOwnResponse(r,d,model)?`<div class="approval-buttons"><button type="button" data-action="approval-decision:approve" ${canRespond()?'':'disabled'}>Approve once</button><button type="button" data-action="approval-decision:reject" ${canRespond()?'':'disabled'}>Reject</button></div>${d.ownership==='caller'?'<p class="approval-readonly">Respond here or through the owning client.</p>':''}`:d.ownership==='caller'&&model.futureMacResponseCapability===true?'<p class="approval-readonly">Respond here or through the owning client.</p>':'<p class="approval-readonly">This engine does not support Mac responses. Respond through the owning caller’s MCP or CLI.</p>';
  const details=chosen?`<div class="approval-detail"><div class="approval-action-focus" tabindex="0" aria-label="Requested action">${action.content}</div>${action.reason}<div class="approval-metadata">Status: ${esc(statusLabel(d))}${prov?` · ${esc(prov)}`:''}</div>${g?`<p class="approval-note ${g.tone}" role="status">${esc(g.text)}</p>`:''}${controls}</div>`:'';
  return `<div class="approval-request" tabindex="-1"><button type="button" class="approval-inspect" data-action="approval-inspect:${esc(r.id)}" ${disabled()?'':'aria-label="Inspect '+esc((chosen&&action?action.title:r.tool_name)+' action')+'"'} ${disabled()?'disabled':''}>${chosen&&action?esc(action.title):'Review '+esc(r.tool_name)+' action'}</button><div class="approval-metadata">${esc(statusLabel(view))}${prov?` · ${esc(prov)}`:''}${view.decided_by==='harflow'&&view.system_reason?` · ${esc(view.system_reason)}`:''}${view.workflow_node_name?` · Workflow step: ${esc(view.workflow_node_name)}`:''}</div>${details}</div>`};
 const refresh=`<button type="button" data-action="approval-refresh" ${disabled()?'disabled':''}>Refresh</button>`;
 const notices=`${model.error?`<p class="approval-error" role="status">${esc(model.error)}</p>`:''}${model.notice?`<p class="approval-notice" role="status">${esc(model.notice)}</p>`:''}`;
 if(model.separate){
  const n=rows.length;
  return rows.map((r,i)=>`<div class="approval-card approval-inline" role="group" tabindex="-1" aria-label="Approval request ${i+1} of ${n}"><header><strong>Approval request ${i+1} of ${n}${model.more?'+':''}</strong>${i===0?refresh:''}</header>${item(r)}</div>`).join('')+(model.more?`<div class="approval-card approval-inline" tabindex="-1"><p class="approval-note" role="status">More requests are pending than shown here. Refresh or load more to see them.</p>${model.cursor?`<button class="approval-more" type="button" data-action="approval-page" ${disabled()?'disabled':''}>Load more requests</button>`:''}</div>`:'')+(notices?`<div class="approval-card approval-inline" tabindex="-1">${notices}</div>`:'');
 }
 return `<div class="approval-card approval-inline" tabindex="-1" aria-label="Caller approvals"><header><strong>Caller approvals (${model.total})</strong>${refresh}</header>${rows.map(item).join('')}${model.cursor?`<button class="approval-more" type="button" data-action="approval-page" ${disabled()?'disabled':''}>Load more requests</button>`:''}${notices}</div>`;
};
HF.approvalTail=()=>{
 if(model.stopped)return '<div class="ta-finished cancelled" role="status"><span>Task stopped</span></div>';
 const pending=pendingRows();
 if(!pending.length)return '<div class="ta-live"><i></i><span>Waiting for task activity…</span></div>';
 const first=pending[0];
 return `<div class="ta-live ta-approval-waiting"><i></i><span>Waiting for approval: ${esc(first.tool_name)} · ${esc(actionSummary(first))}${pending.length>1||model.more?` · ${pending.length-1}${model.more?'+':''} more`:''}</span></div>`;
};
HF.approvalHint=()=>{const n=pendingCount();return n?`<button type="button" class="approval-hint" data-action="approval-jump"><strong>Waiting for approval</strong><span>${n}${model.more?'+':''} pending request${n===1&&!model.more?'':'s'} · View in Activity</span></button>`:''};
HF.renderTasks=(screen,state)=>{
 if(screen!=='approvals'){controller.deactivate();return oldRender(screen,state)}
 HF.approvalController.reset(state);
 const task={id:'abc12345',title:'Implement persistence checks',backend:'claude',status:state==='invalidated'?'cancelled':'running',prompt:'Implement persistence checks and run the relevant test suite.',sessionID:true,liveInput:true,approvalFixture:true,durationSeconds:96,summary:'The implementation is complete. Waiting for approval to push the branch.',notices:['Auto-denied: git push']};
 HF.currentTask=task;
 return oldRender('task-detail','running');
};
})();
