(function(){
const summaryStates=new Set(['completed','loading','empty','paged','error','unsupported','metadata-only']);
const terminal=new Set(['completed','failed','cancelled','timed-out']);
const sampleFiles=[
  {path:'macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/Component/SummaryPaneView.swift',status:'edited'},
  {path:'macos/HfFeatures/MainWindowFeature/Tests/MainWindowFeatureTests/TaskDetail/SummaryPaneModelTests.swift',status:'failed'},
  {path:'README.md',status:'unconfirmed'}
];
const sample={id:'abc12345',title:'Fix the login bug',backend:'claude',status:'completed',prompt:'Fix the flaky login test. It fails about one run in five on CI and only when the keychain is cold.',durationSeconds:1260,exitCode:0,summaryTurns:12,inputTokens:48210,outputTokens:3150,costUSD:.4213,summary:'Fixed the **login bug**. The store is now warmed before it is read.',editedFiles:sampleFiles};
const missingPrompt="The prompt is recorded in the task's event log, which has not been read yet (or does not exist).";
const escape=value=>HF.escape(String(value));
const markdown=value=>escape(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
function clock(seconds){const total=Math.max(0,Math.floor(seconds));return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
function durationText(seconds){const total=Math.max(0,Math.floor(seconds)),minutes=Math.floor(total/60);return total<60?`${total} sec`:minutes<60?`${minutes} min`:`${Math.floor(minutes/60)} h${minutes%60?` ${minutes%60} min`:''}`}
function folderName(path){const parts=path.split('/').filter(Boolean);return parts.length>1?parts[parts.length-2]:''}
HF.taskSummaryFixture=(status='completed')=>({...sample,status,sessionID:true,summaryFixture:true,...(status==='running'?{durationSeconds:90,exitCode:null,summary:null,editedFiles:[]}:{exitCode:status==='failed'?1:0})});
function model(task,state){
  const isSample=!task||task.summaryFixture===true;
  const status=task?.status||(['running','failed','cancelled','timed-out'].includes(state)?state:'completed');
  const chosen=task||HF.taskSummaryFixture(status),fileState=summaryStates.has(state)?state:'completed';
  const durationSeconds=terminal.has(status)&&chosen.exitCode!=null&&Number.isFinite(chosen.durationSeconds)&&chosen.durationSeconds>=0?chosen.durationSeconds:undefined;
  const turns=chosen.summaryTurns??chosen.numTurns;
  const input=chosen.inputTokens??chosen.usage?.input_tokens??chosen.usage?.input;
  const output=chosen.outputTokens??chosen.usage?.output_tokens??chosen.usage?.output,cost=chosen.costUSD;
  const tiles=[];
  if(durationSeconds!==undefined)tiles.push(['Duration',clock(durationSeconds)]);
  if(turns!=null)tiles.push(['Agent turns',String(turns)]);
  if(input!=null||output!=null)tiles.push(['Tokens (in / out)',`${input==null?'–':input} / ${output==null?'–':output}`]);
  if(cost!=null)tiles.push(['Cost',`$${Number(cost).toFixed(4)}`]);
  let files=chosen.editedFiles||[];
  if(fileState==='empty')files=[];
  if(fileState==='paged'&&isSample)files=Array.from({length:12},(_,i)=>({path:`macos/HfFeatures/Feature${i+1}/View${i+1}.swift`,status:'edited'}));
  const artifact=['unsupported','metadata-only','loading','error'].includes(fileState)?fileState:fileState==='paged'?'available':'none';
  return {id:chosen.id,title:chosen.title,backend:chosen.backend||'claude',status,durationSeconds,elapsedSeconds:chosen.durationSeconds,turns,tiles,result:isSample&&fileState==='empty'?null:chosen.summary||null,files,artifact,summaryState:fileState,refusalLines:[...(chosen.permissionDenials||[]).map(denial=>typeof denial==='string'?denial:denial.command||denial.title||'an action'),...(chosen.notices||[])],editedFilesNote:chosen.editedFilesNote};
}
function hero(m){
  const label={completed:'Done',running:'Running',failed:'Failed',cancelled:'Cancelled','timed-out':'Timed out'}[m.status]||m.status;
  const headline=m.status==='running'?`${label} · ${clock(m.elapsedSeconds||0)}`:m.durationSeconds!==undefined?`${label} ${m.status==='completed'?'in':'after'} ${durationText(m.durationSeconds)}`:label;
  const symbol=m.status==='completed'?'checkmark.circle.fill':['failed','timed-out'].includes(m.status)?'xmark.circle.fill':'stop.circle.fill';
  return `<section class="summary-hero status-${escape(m.status)}" aria-label="Task result status"><span class="summary-status-mark" aria-hidden="true">${m.status==='running'?'<i></i>':`<img src="assets/symbols/task-activity/${symbol}.png" alt="">`}</span><div><h2>${escape(headline)}</h2><p><span class="backend-dot ${escape(m.backend)}" aria-hidden="true"></span>${escape(m.backend[0].toUpperCase()+m.backend.slice(1))}${m.turns!=null?` · Agent turns: ${escape(m.turns)}`:''}</p>${m.tiles.length?'<small>Reported by current agent run</small>':''}</div></section>`;
}
function stats(m){return m.tiles.length?`<section class="summary-stats" data-tile-count="${m.tiles.length}" aria-label="Current agent run metrics">${m.tiles.map(([label,value])=>`<div class="summary-stat"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`).join('')}</section>`:''}
function fileRow(file){
  const status=file.status||'unconfirmed',symbol=status==='edited'?'✓':status==='failed'?'✗':'?',label=status==='edited'?'Edited':status==='failed'?'Edit failed':'Edit unconfirmed, no result recorded';
  return `<div class="summary-file" title="${escape(file.path)}" aria-label="${escape(label+' '+file.path)}"><img class="summary-file-icon" src="assets/symbols/task-activity/doc.text.png" alt=""><span class="summary-file-mark ${escape(status)}" aria-hidden="true">${symbol}</span><code>${escape(file.path.split('/').pop())}</code>${folderName(file.path)?`<span class="summary-file-path">${escape(folderName(file.path))}</span>`:''}${status==='unconfirmed'?'<span class="summary-file-status">no result recorded</span>':''}</div>`;
}
function files(m){
  if(m.summaryState==='loading')return '<section class="summary-files"><h3>Files edited</h3><div class="summary-file-loading" role="status" aria-label="Loading edited files"><i></i><i></i><i></i></div></section>';
  if(m.summaryState==='error')return '<section class="summary-files"><h3>Files edited</h3><p class="summary-note">Edit history isn\'t available for this task.</p></section>';
  if(!m.files.length)return '';
  const note="As reported by the agent's own edit tools — not a git diff; changes made by shell commands aren't listed.";
  return `<section class="summary-files"><div class="summary-section-heading"><h3>Files edited · ${m.files.length}</h3><p>${escape(note)}</p></div>${m.editedFilesNote?`<p class="summary-note">${escape(m.editedFilesNote)}</p>`:''}<div class="summary-file-list">${m.files.slice(0,8).map(fileRow).join('')}${m.files.length>8?`<div class="summary-file summary-file-action"><button class="summary-disclosure" type="button" data-action="summary-show-all" aria-expanded="false">Show loaded ${m.files.length}</button></div>`:''}</div></section>`;
}
function artifactRow(sourceTask){return `<details><summary>report · available</summary><div class="summary-artifact-details"><p>Login test investigation report.</p><code>/tmp/login-report.md</code><p>Artifact: login-report</p><p>Registrar: register_artifact · ${escape(sourceTask)}</p><p>Registered: 2026-10-24T00:00:00Z</p><p>Observed: 2026-10-24T00:00:00Z</p></div></details>`}
function artifacts(m){
  if(m.artifact==='none')return '';
  const unloaded=m.artifact==='metadata-only',loading=m.artifact==='loading',failed=['unsupported','error'].includes(m.artifact),source=m.id||'abc12345';
  return `<section class="summary-artifacts"><h3>Registered artifacts</h3><p class="summary-artifact-caption">Agent-registered metadata, separate from edited files and task success. Availability is an observation at the time shown.</p><div class="summary-artifact-member"><p class="summary-artifact-source">Source task: ${escape(source)}</p>${unloaded||loading?'':`<p>${m.summaryState==='paged'?3:1} registered</p>`}${!unloaded&&!loading&&!failed?artifactRow(source):''}${failed?'<p class="summary-artifact-message">Artifact metadata unavailable.</p>':''}<button type="button" data-action="summary-refresh" ${loading?'disabled':''}>${loading?'Loading…':unloaded?'Load artifact metadata':m.summaryState==='paged'?'Load more artifacts':'Refresh artifacts'}</button></div></section>`;
}
function warnings(m){return m.refusalLines.length?`<details class="summary-warnings"><summary>⚠ <strong>Refusals &amp; warnings</strong> <span>· ${m.refusalLines.length}</span></summary><div>${m.refusalLines.map(line=>`<p>${escape(line)}</p>`).join('')}</div></details>`:''}
HF.taskSummaryModel=model;
HF.taskPrompt=task=>task&&typeof task.prompt==='string'?task.prompt:missingPrompt;
HF.taskPane=(pane,task,state,summaryState=state)=>{
  if(pane==='Prompt')return `<section class="summary-prompt" aria-label="Original task prompt"><p>${escape(HF.taskPrompt(task))}</p></section>`;
  if(pane==='Activity')return task?HF.taskActivity(task):HF.activity();
  const m=model(task,summaryState),result=m.result?`<div class="summary-result-copy">${markdown(m.result)}</div>`:`<p class="summary-note">${m.status==='running'?'No answer yet.':'No final answer.'}</p>`;
  return `<div class="summary-document">${hero(m)}${stats(m)}<section class="summary-result"><h3>Result</h3>${result}</section>${artifacts(m)}${files(m)}${warnings(m)}</div>`;
};
HF.summary=(state,task)=>HF.taskPane('Summary',task,state);
HF.summaryActions=action=>{
  if(action==='summary-refresh'){HF.feedback('Artifact metadata requested · deterministic fixture unchanged')}
  else if(action==='summary-show-all'){
    const list=document.querySelector('.summary-file-list');if(!list)return;
    const context=HF.taskDetailContext||{},m=model(context.task||HF.currentTask,context.summaryState||HF.route.state);
    list.innerHTML=m.files.map(fileRow).join('');
  }
};
})();
