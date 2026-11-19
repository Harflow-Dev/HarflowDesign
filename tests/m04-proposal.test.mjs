import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}};
vm.createContext(context);
for (const name of ['registry.js','m04-proposal.js','screens-m04-proposal.js']) vm.runInContext(fs.readFileSync(new URL('../v2/scripts/'+name,import.meta.url),'utf8'),context);
const H=context.window.HFV2, M=H.m04Proposal.model;
const ready=()=>{const s=M.create('composer-ready');s.draft='Review the queue';return s;};
test('all 11 approved baseline routes register without DOM or canonical templates',()=>{
  assert.equal(H.m04ProposalStates.length,11);
  assert.ok(H.m04ProposalStates.every(x=>x.approved && x.status==='Approved'));
  for(const x of H.m04ProposalStates){
    assert.equal(typeof H.templates['m04-proposal/'+x.id],'string');
    assert.ok(!H.templates['m04-proposal/'+x.id].includes('hd-m04-amendment'),'baseline route '+x.id+' is not amendment-scoped');
  }
});
test('blank, stale and unqualified requests never start',()=>{const s=M.create('shell');assert.equal(M.start(s),false);s.draft='Review';M.select(s,'repository','HarflowDesign');M.qualify(s,0,'ready');assert.equal(M.start(s),false);M.qualify(s,s.revision,'unqualified');assert.equal(M.start(s),false);M.qualify(s,s.revision,'ready');assert.equal(M.start(s),true);});
test('single flight and unknown outcomes retain draft and block retries',()=>{const s=ready();assert.equal(M.start(s),true);assert.equal(M.start(s),false);M.settle(s,'unknown');assert.equal(s.draft,'Review the queue');M.select(s,'repository','HarflowDesign');assert.equal(s.repository,'HarflowMCP');assert.equal(M.start(s),false);M.settle(s,'created');assert.equal(s.status,'unknown');});
test('definitive refusal can be reviewed; created tasks cannot duplicate',()=>{const s=ready();M.start(s);M.settle(s,'refused');assert.equal(s.draft,'Review the queue');assert.equal(M.start(s),true);M.settle(s,'created');assert.equal(M.start(s),false);});
test('unsupported requested authority is blocked instead of dropped',()=>{const s=ready();s.approvals='caller';assert.equal(M.start(s),false);assert.equal(s.approvals,'caller');s.turns='';assert.equal(M.start(s),true);const codex=ready();codex.harness='Codex';codex.turns='';codex.approvals='caller';assert.equal(M.start(codex),false);assert.equal(codex.approvals,'caller');});
test('invalid Advanced and unsupported effort/turn/model choices block start',()=>{for(const value of ['0','-1','1.2','NaN']){const s=ready();s.turns=value;assert.equal(M.start(s),false);}const s=ready();s.effort='unsupported';assert.equal(M.start(s),false);s.effort='high';s.harness='Mistral Vibe';assert.equal(M.start(s),false);});
test('history refresh retains selection identity outside visible page',()=>{const s=M.create('history-retained');M.history(s,['another-task']);assert.equal(s.selected,'retry-budget');assert.deepEqual(Array.from(s.rows),['another-task']);});
test('listing failure never dequalifies managed runtime',()=>{const s=M.create('runtime-listing');M.listing(s,'failed');assert.equal(s.runtime,'qualified');assert.equal(s.listing,'failed');s.draft='Review';assert.equal(M.start(s),true);});
test('remembered selections are repository scoped and reset clears them',()=>{const s=ready();s.effort='high';M.start(s);M.settle(s,'refused');M.select(s,'repository','HarflowDesign');s.effort='low';M.select(s,'repository','HarflowMCP');assert.equal(s.effort,'high');const fresh=M.create('composer-ready');assert.equal(fresh.draft,'Review the delivery queue');assert.equal(Object.keys(fresh.remembered).length,0);});

test('ready and advanced demonstrate valid examples; shell stays blank',()=>{for(const route of ['composer-ready','advanced'])assert.equal(M.problem(M.create(route)),'');assert.equal(M.create('shell').draft,'');});
test('positive turn limit 101 is valid without invented upper cap',()=>{const s=ready();s.turns='101';assert.equal(M.start(s),true);});
test('permission enforcement and caller authority fail closed',()=>{for(const enforcement of ['unknown','unsupported']){const s=ready();s.enforcement=enforcement;assert.equal(M.start(s),false);}const s=ready();s.turns='';s.approvals='caller';s.access='read_only';assert.equal(M.start(s),false);assert.equal(s.approvals,'caller');});
test('Codex effort is supported but its caller approval remains deferred',()=>{const s=ready();s.harness='Codex';s.model='Default';s.turns='';s.effort='xhigh';assert.equal(M.problem(s),'');s.approvals='caller';assert.equal(M.start(s),false);});
test('refusal survives edits while qualification revision invalidates old answers',()=>{const s=ready();M.start(s);M.settle(s,'refused');M.select(s,'access','read_only');assert.equal(s.status,'refused');M.qualify(s,0,'ready');assert.equal(s.qualification,'checking');assert.equal(M.start(s),false);});

test('retained fixture selected main identity is outside its visible page',()=>{const s=M.create('history-retained');assert.equal(s.selected,'retry-budget');assert.deepEqual(Array.from(s.rows),['events-reader']);});

test('Broad access remains an explicit requested authority but cannot use caller approvals',()=>{const s=ready();M.select(s,'access','unrestricted');assert.equal(s.access,'unrestricted');M.qualify(s,s.revision,'ready');assert.equal(M.problem(s),'');s.turns='';s.approvals='caller';assert.equal(M.start(s),false);assert.equal(s.access,'unrestricted');assert.equal(s.approvals,'caller');});

test('switching harness preserves unsupported model and blocks even after fresh qualification',()=>{const s=ready();M.select(s,'harness','Codex');s.turns='';M.qualify(s,s.revision,'ready');assert.equal(s.model,'Opus 5.5');assert.equal(M.start(s),false);M.select(s,'model','gpt-6-astra');M.qualify(s,s.revision,'ready');assert.equal(M.start(s),true);});
test('turn edits immediately invalidate qualification and retain the typed value',()=>{const s=ready();M.select(s,'turns','0');assert.equal(s.turns,'0');assert.equal(M.start(s),false);M.qualify(s,s.revision,'ready');assert.equal(M.start(s),false);assert.equal(s.turns,'0');});

test('task options toggle preserves draft and authority without changing qualification',()=>{const s=ready();s.effort='high';s.approvals='caller';const revision=s.revision;M.optionsOpen(s,true);M.optionsOpen(s,false);assert.equal(s.advanced,false);assert.equal(s.draft,'Review the queue');assert.equal(s.effort,'high');assert.equal(s.approvals,'caller');assert.equal(s.revision,revision);assert.equal(M.customized(s),true);});
test('closed customized route and open options route share the same valid composer',()=>{const open=M.create('advanced'),closed=M.create('advanced-closed');assert.equal(open.advanced,true);assert.equal(closed.advanced,false);assert.equal(M.customized(closed),true);assert.equal(M.problem(open),'');assert.equal(M.problem(closed),'');});
test('invalid options remain actionable when task options are closed',()=>{const s=ready();M.select(s,'turns','0');M.optionsOpen(s,false);assert.match(M.problem(s),/whole number above 0/);assert.equal(M.start(s),false);});

// Owner-approved centered-composer amendment routes (2026-11-06): separate
// provenance from the approved baseline, with the same state, reset and lock behavior.
test('amendment routes are separate and approved by the owner on 2026-11-06',()=>{
  assert.equal(H.m04AmendmentStates.length,6);
  const baseline=new Set(H.m04ProposalStates.map(x=>'m04-proposal/'+x.id));
  for(const x of H.m04AmendmentStates){
    const key='m04-proposal/'+x.id;
    assert.ok(!baseline.has(key),'route '+key+' does not overlap the approved baseline');
    assert.equal(x.approved,true);
    assert.equal(x.status,'Approved');
    assert.match(x.description,/Owner-approved centered-composer amendment/);
    assert.match(x.description,/2026-11-06/);
    assert.match(x.description,/2026-11-05/,'the amendment approval is recorded separately from the baseline approval');
    assert.doesNotMatch(x.description,/Not approved/);
    assert.match(H.templates[key],/hd-m04-amendment/);
    assert.doesNotMatch(H.templates[key],/Approved/);
  }
});
// The provisional repository picker drafts are counted on their own (see the repository tests).
const m04States=()=>H.registry.families.flatMap(f=>f.states.filter(s=>s.source&&s.source.renderer==='m04'&&!H.m04RepositoryStates.some(x=>x.id===s.source.mount)).map(s=>Object.assign({route:f.id+'/'+s.id},s)));
test('registry lists 33 approved entry states: 11 baseline, six amendment, nine redraws, six model picker states and the runtime update on separate provenance',()=>{
  const registered=m04States();
  assert.equal(registered.length,33,'11 baseline states (history loading is retired), the six centered composer states, nine redraws, six model picker states and the runtime update');
  assert.equal(registered.filter(s=>s.status==='provisional').length,0);
  const all=registered;
  assert.ok(all.every(s=>s.status==='approved'));
  const centered=all.filter(s=>s.source.mount.startsWith('amendment-'));
  assert.equal(centered.length,6,'the six centered composer states stay separate routes');
  assert.deepEqual(Array.from(centered,s=>s.route).sort(),['new-task/centered-capped','new-task/centered-empty','new-task/centered-growing','new-task/centered-options','new-task/centered-ready','new-task/centered-unknown']);
  assert.ok(centered.every(s=>/Owner-approved centered-composer amendment \(2026-11-06, separate from the 2026-11-05 entry direction\)/.test(s.description)));
  assert.ok(centered.every(s=>s.approval.date==='2026-11-06'&&/separate from the 2026-11-05 entry direction/.test(s.approval.decision)));
  const redraws=all.filter(s=>H.m04RedrawStates.some(x=>x.id===s.source.mount));
  assert.equal(redraws.length,9);
  assert.ok(redraws.every(s=>s.approval.by==='the owner'&&s.approval.date===(s.source.mount==='centered-starting-plain'?'2026-11-09':s.source.mount==='centered-harness-open'?'2026-11-15':'2026-11-08')));
  assert.equal(redraws.find(s=>s.source.mount==='centered-starting-plain').approval.decision,'Starting row');
  assert.equal(redraws.find(s=>s.source.mount==='centered-harness-open').approval.decision,'Centered composer · Model field');
  const models=all.filter(s=>H.m04ModelStates.some(x=>x.id===s.source.mount));
  assert.equal(models.length,6);
  assert.ok(models.every(s=>s.approval.by==='the owner'&&s.approval.date==='2026-11-15'&&s.approval.decision==='Model picker'));
  const runtime=all.filter(s=>H.m04RuntimeStates.some(x=>x.id===s.source.mount));
  assert.equal(runtime.length,1);
  assert.ok(runtime.every(s=>s.approval.by==='the owner'&&s.approval.date==='2026-11-15'&&s.approval.decision==='Runtime update'));
  const baseline=all.filter(s=>!s.source.mount.startsWith('amendment-')&&!redraws.includes(s)&&!models.includes(s)&&!runtime.includes(s));
  assert.equal(baseline.length,11);
  assert.ok(baseline.every(s=>s.approval.date==='2026-11-05'),'folding the states keeps each state\'s own approval date');
  const sidebar=H.registry.families.find(f=>f.id==='sidebar');
  assert.match(sidebar.description,/scrolls as one bounded area/,'the owner sidebar correction is documented for the sidebar');
  assert.match(H.catalogStrips.m04.centeredNotice,/sidebar body-scroll correction applies to every entry, composer and sidebar state/);
  assert.doesNotMatch(sidebar.description,/are not approved/);
});
test('amendment fixtures cover centered empty, one line, growth and the six-line cap',()=>{
  assert.equal(M.isAmendment('amendment-capped'),true);
  assert.equal(M.isAmendment('composer-ready'),false);
  assert.equal(M.isAmendment('runtime-failed'),false);
  const empty=M.create('amendment-empty');
  assert.equal(empty.draft,'');
  const one=M.create('amendment-ready');
  assert.equal(one.draft,'Review the delivery queue');
  assert.equal(M.problem(one),'');
  const growing=M.create('amendment-growing');
  const capped=M.create('amendment-capped');
  assert.ok(growing.draft.length>one.draft.length,'growing fixture adds visual lines');
  assert.ok(capped.draft.length>growing.draft.length,'capped fixture exceeds the growing fixture');
  assert.equal(capped.status,'idle');
  const options=M.create('amendment-options');
  assert.equal(options.advanced,true,'options route opens the task options popover');
});
test('prompt floor and cap count six visible 22px lines plus padding',()=>{
  assert.equal(M.promptOneLineHeight(22,4),26);
  assert.equal(M.promptCapHeight(22,4),136);
  assert.equal(M.promptCapHeight(22,0),132);
});
test('amendment reset clears draft state, remembered choices and outcome',()=>{
  const s=M.create('amendment-growing');
  s.effort='high';s.turns='7';
  assert.equal(M.start(s),true);
  M.settle(s,'refused');
  const fresh=M.create('amendment-growing');
  assert.equal(fresh.effort,'default');
  assert.equal(fresh.turns,'12');
  assert.equal(fresh.status,'idle');
  assert.equal(fresh.draft,M.amendmentDrafts['amendment-growing']);
  assert.equal(Object.keys(fresh.remembered).length,0);
});
test('centered unknown outcome retains the draft, blocks retry and locks selections',()=>{
  const s=M.create('amendment-unknown');
  assert.equal(s.status,'unknown');
  assert.equal(s.draft,M.amendmentDrafts['amendment-unknown']);
  assert.equal(M.start(s),false,'unknown outcome blocks a retry start');
  M.select(s,'repository','HarflowDesign');
  assert.equal(s.repository,'HarflowMCP','locked selections refuse changes');
  assert.equal(s.draft,M.amendmentDrafts['amendment-unknown'],'draft survives the lock');
  const settled=()=>{const t=M.create('amendment-empty');t.draft='Review';M.start(t);M.settle(t,'unknown');return t;};
  const t=settled();
  assert.equal(t.status,'unknown');
  assert.equal(M.start(t),false);
});
test('amendment popup height is bounded by the clipping compose-area viewport',()=>{
  // Regression geometry from the minimum-frame browser review: anchor bar at
  // 390..422, compose-area viewport starting at 68 below the topbar, frame 0..620.
  const anchor={top:390,bottom:422}, area={top:68,bottom:620}, frame={top:0,bottom:620};
  const bounded=M.amendmentPopupMetrics(anchor,area,frame);
  assert.equal(bounded.maxHeight,306);
  assert.equal(bounded.belowWins,false,'the popover opens above with more space there');
  // The frame-only bound measured 374 because it counted the space the scroll
  // viewport clips away; the corrected bound never claims space above area top.
  assert.equal(M.amendmentPopupMetrics(anchor,frame,frame).maxHeight,374);
  assert.ok(bounded.maxHeight<374,'space hidden behind the topbar is no longer claimed');
  assert.ok(anchor.top-8-bounded.maxHeight>=area.top+8,'popup top stays inside the viewport with the 8px gap');
  // Below wins when the anchor sits near the viewport top; the 400px cap holds.
  const low=M.amendmentPopupMetrics({top:120,bottom:152},area,frame);
  assert.equal(low.belowWins,true);
  assert.equal(low.maxHeight,Math.min(400,620-152-16));
});

// Owner-approved centered redraws of six bottom-layout composer states and two shell states: the same fixture, a different layout.
const REDRAWS={'centered-loading':'composer-loading','centered-unqualified':'composer-unqualified','centered-invalid':'composer-invalid','centered-starting-plain':'composer-starting','centered-refused':'composer-refused','centered-options-closed':'advanced-closed','centered-harness-open':'amendment-ready','centered-shell-collapsed':'shell-collapsed','centered-shell-narrow':'shell-narrow'};
const SHELL_REDRAWS=['centered-shell-collapsed','centered-shell-narrow'];
test('each centered redraw has the model of its source apart from the route',()=>{
  assert.deepEqual(Object.assign({},M.redrawSources),REDRAWS);
  assert.deepEqual(Array.from(H.m04RedrawStates,x=>x.id).sort(),Object.keys(REDRAWS).sort());
  for(const [redraw,source] of Object.entries(REDRAWS)){
    const a=M.create(redraw),b=M.create(source);
    assert.equal(a.route,redraw);
    assert.notEqual(a.remembered,b.remembered,'fixtures do not share state');
    assert.equal(M.isAmendment(redraw),true,redraw+' uses the centered layout');
    assert.equal(M.isRedraw(redraw),true);
    if(redraw==='centered-harness-open')continue;
    assert.deepEqual(Object.assign({},a,{route:b.route,remembered:{}}),Object.assign({},b,{remembered:{}}),redraw+' copies '+source);
    assert.equal(M.problem(a),M.problem(b));
    assert.equal(M.isAmendment(source),false,source+' keeps the bottom layout');
    assert.equal(M.isRedraw(source),false);
  }
  assert.equal(M.create('centered-invalid').advanced,true,'the validation redraw opens the task options');
  assert.equal(M.create('centered-options-closed').effort,'high');
  assert.equal(M.create('centered-starting-plain').status,'starting');
  assert.equal(M.isAmendment('centered-starting'),false,'the retired starting state has no mount');
});
test('the open harness picker copies the one-line ready fixture and only changes the harness selection',()=>{
  const open=M.create('centered-harness-open'),ready=M.create('amendment-ready');
  const combo={harnessList:open.harnessList,modelHarness:open.modelHarness,modelOption:open.modelOption,catalog:open.catalog};
  assert.equal(JSON.stringify(Object.assign({},open,{route:ready.route,harness:ready.harness,model:ready.model,qualification:ready.qualification,picker:ready.picker,remembered:{}})),JSON.stringify(Object.assign({},ready,combo,{remembered:{}})));
  assert.equal(open.picker,'harness');
  assert.equal(open.harness,'Unavailable harness');
  // Owner amendment (2026-11-15): Model is the editable combo; empty text means Default and no listing is read.
  assert.equal(open.model,'');assert.equal(M.modelName(open),'Default');
  assert.equal(JSON.stringify(open.catalog),JSON.stringify({state:'not_read',models:[]}));assert.equal(M.modelNote(open),'');
  assert.equal(M.problem(open),'Choose a qualified harness and model.');
  assert.equal(M.problem(ready),'');
  assert.equal(M.create('amendment-ready').picker,'');
});
test('redraw routes are not amendments of 2026-11-06 and keep no amendment draft',()=>{
  for(const redraw of Object.keys(REDRAWS)){
    assert.equal(M.amendmentDrafts[redraw],undefined);
    assert.ok(!H.m04AmendmentStates.some(x=>x.id===redraw));
    assert.equal(M.create(redraw).draft,SHELL_REDRAWS.includes(redraw)?'':'Review the delivery queue');
    assert.match(H.templates['m04-proposal/'+redraw],/hd-m04-amendment/);
    assert.doesNotMatch(H.templates['m04-proposal/'+redraw],/Approved/);
  }
  assert.equal(M.create('centered-loading').draft,M.create('composer-loading').draft);
  assert.equal(M.create('centered-shell-collapsed').collapsed,true);
  assert.equal(M.create('centered-shell-narrow').narrow,true);
  assert.equal(M.isAmendment('amendment-ready'),true);
  assert.equal(M.isRedraw('centered-shell'),false,'the retired expanded shell redraw has no mount');
});
test('redraw descriptions carry the approval date and no provisional wording',()=>{
  for(const x of H.m04RedrawStates){assert.equal(x.approved,true);assert.equal(x.status,'Approved');assert.match(x.description,x.id==='centered-starting-plain'?/Owner-approved centered redraw \(2026-11-09\)/:x.id==='centered-harness-open'?/Owner-approved centered redraw \(2026-11-08; Model field amended 2026-11-15\)/:/Owner-approved centered redraw \(2026-11-08\)/);}
  for(const s of m04States().filter(s=>H.m04RedrawStates.some(x=>x.id===s.source.mount))){
    assert.equal(s.status,'approved');
    assert.equal(s.approvalNote,undefined);
    assert.equal(s.redrawOf,undefined);
    assert.doesNotMatch(s.description,/Provisional|earlier layout/i);
  }
});
test('only the open harness picker repeats the status message under the Harness select',()=>{
  const src=fs.readFileSync(new URL('../v2/scripts/m04-proposal.js',import.meta.url),'utf8');
  assert.match(src,/route==='centered-harness-open'&&key==='harness',hint=gate&&\(s\.harness==='Unavailable harness'\|\|s\.qualification!=='ready'\)\?'Choose a qualified harness and model\.':''/);
  assert.equal(M.problem(M.create('centered-harness-open')),'Choose a qualified harness and model.','the hint string equals the existing message');
  assert.match(src,/aria-describedby="m04-harness-hint"/);
  assert.match(src,/class="hd-field__hint" id="m04-harness-hint"/);
  assert.equal(M.problem(M.create('centered-harness-open')),'Choose a qualified harness and model.');
});
test('the open harness picker disables the unavailable option and shows the hint only while unqualified',()=>{
  const src=fs.readFileSync(new URL('../v2/scripts/m04-proposal.js',import.meta.url),'utf8');
  
  assert.match(src,/gated&&v===gated\?' disabled'/);
  assert.match(src,/options\(values,s\[key\],gate\?'Unavailable harness':''\)/);
});

// The starting state without a status row is approved (2026-11-09). The runtime update in the main pane and the six model picker
// states, the default marker included, were approved on 2026-11-15. No entry draft is provisional any more.
test('the runtime update and model picker states copy their source fixture apart from the route and are centered',()=>{
  assert.deepEqual(Array.from(H.m04RuntimeStates,x=>x.id),['runtime-updating']);
  assert.ok(H.m04RuntimeStates.every(x=>x.approved===true&&x.status==='Approved'&&/Owner-approved runtime update \(2026-11-15\)/.test(x.description)));
  assert.equal(H.m04PendingStates,undefined,'no provisional entry draft remains');
  assert.equal(M.pendingSources,undefined);assert.equal(M.isPending,undefined);
  assert.deepEqual(Array.from(H.m04ModelStates,x=>x.id),['model-loading','model-unavailable','model-not-installed','model-truncated','model-empty','model-default']);
  assert.ok(H.m04ModelStates.every(x=>x.approved===true&&x.status==='Approved'&&/Owner-approved model picker state \(2026-11-15\)/.test(x.description)));
  for(const [route,source] of Object.entries(Object.assign({},M.runtimeSources,M.modelSources))){
    const draft=M.create(route),from=M.create(source);
    assert.equal(M.isRuntimeUpdate(route),!M.isModelApproved(route));assert.equal(M.isAmendment(route),true);assert.equal(M.isRedraw(route),false);
    assert.equal(draft.route,route);
    // A model picker draft opens the harness picker and sets only its own harness, listing and Default model.
    const own=M.isModelState(route)?(d=>Object.assign(d,{modelHarness:d.harness,modelOption:d.harness==='Mistral Vibe'?'unsupported':'supported'}))(Object.assign({model:'',picker:'harness',harnessList:'ready'},JSON.parse(JSON.stringify(M.modelStates[route])))):{};
    assert.deepEqual(JSON.parse(JSON.stringify(Object.assign({},draft,{route:''}))),JSON.parse(JSON.stringify(Object.assign({},from,own,{route:''}))));
    assert.match(H.templates['m04-proposal/'+route],/hd-m04-amendment/);
  }
  assert.equal(M.isRuntimeUpdate('centered-starting'),false);
  assert.equal(M.isRuntimeUpdate('centered-starting-plain'),false);
  assert.deepEqual(Object.keys(M.runtimeSources),['runtime-updating']);
  const runtime=H.registry.families.find(f=>f.id==='harness-runtime').states.find(x=>x.id==='updating');
  assert.equal(runtime.status,'approved');assert.equal(runtime.approvalNote,undefined);
  assert.equal(JSON.stringify(runtime.approval),JSON.stringify({by:'the owner',date:'2026-11-15',decision:'Runtime update'}));
  const strips=H.catalogStrips.m04;
  assert.equal(strips.runtimeHeading,'Approved · Runtime update · Owner 2026-11-15');
  assert.match(strips.runtimeNotice,/^Approved by the owner, 2026-11-15\./);
  assert.ok(!('pendingHeading' in strips)&&!('pendingNotice' in strips));
});
test('a start already in flight cannot start again on the state without the row',()=>{
  const s=M.create('centered-starting-plain');
  assert.equal(s.status,'starting');assert.equal(M.start(s),false);assert.equal(s.status,'starting');
});
test('the runtime update draft is the centered shell of a qualified runtime, so its composer is not locked',()=>{
  const s=M.create('runtime-updating');
  assert.equal(s.runtime,'qualified');
  assert.equal(M.create('runtime-installing').runtime,'installing','the approved installing state still locks');
  s.draft='Review the queue';
  assert.equal(M.start(s),true);
});

test('source gates of the starting state without the row and the runtime update draft',()=>{
  const src=fs.readFileSync(new URL('../v2/scripts/m04-proposal.js',import.meta.url),'utf8');
  assert.match(src,/plainStarting = route === 'centered-starting-plain' && s\.status === 'starting'/);
  assert.match(src,/hd-m04-status'\+\(plainStarting\?' hd-sr':''\)/);
  assert.match(src,/aria-label="'\+\(plainStarting\?'Starting task':'Start task'\)\+'"/);
  // The retired sidebar card draft left no lock, card or mount behind.
  assert.ok(!/runtimeIsLocked|runtimeLocked|runtimeSidebar|runtime-installing-sidebar|hd-m04-sidebar-runtime/.test(src));
  assert.match(src,/var updating = route === 'runtime-updating' && !s\.updated;/);
  // The updating gate and the approved installing gate come from one function, so they are the same box.
  assert.equal((src.match(/gateMain\(/g)||[]).length,3,'one definition and two uses');
  assert.match(src,/main\.innerHTML=gateMain\('Updating runtime',INSTALLING_BODY,'Update in progress',''\);/);
  assert.match(src,/installing:\['Installing runtime',INSTALLING_BODY\]/);
  assert.match(src,/if\(a==='collapse'\)s\.collapsed=!s\.collapsed;/);
});


// Model picker drafts: editable Model combo backed by advisory listings.
const J=x=>JSON.parse(JSON.stringify(x));
const MODEL_ROUTES=['model-loading','model-unavailable','model-not-installed','model-truncated','model-empty','model-default'];
const modelDraft=route=>{const s=M.create(route);if(!s.draft.trim())s.draft='Review the queue';return s;};
test('model drafts register and every one is a model draft, approved routes are not',()=>{
  assert.deepEqual(J(Object.keys(M.modelStates)),MODEL_ROUTES);
  for(const r of MODEL_ROUTES){assert.equal(M.isModelState(r),true);assert.ok(M.create(r).catalog,r+' has a catalog');}
  assert.equal(M.isModelState('amendment-ready'),false);
  assert.equal(M.create('amendment-ready').catalog,undefined);
});
test('model notes match the approved copy for each draft as created',()=>{
  assert.equal(M.modelNote(M.create('model-loading')),'Loading suggested models… You can still type a model name.');
  assert.equal(M.modelNote(M.create('model-unavailable')),"Suggested models aren't available. Codex's model cache wasn't found. You can still type a model name.");
  assert.equal(M.modelNote(M.create('model-not-installed')),"Antigravity wasn't found on your PATH — starting this harness may fail.");
  assert.equal(M.modelNote(M.create('model-truncated')),"Showing the first 400 models Opencode listed. You can type a model name that isn't shown.");
  assert.equal(M.modelNote(M.create('model-empty')),'Codex lists no models. You can still type a model name.');
});
test('dropped rows extend the truncated note with plural and singular copy',()=>{
  const s=M.create('model-truncated');
  assert.equal(M.modelAction(s,'dropped-3'),true);
  assert.equal(s.catalog.dropped,3);
  assert.equal(M.modelNote(s),"Showing the first 400 models Opencode listed. You can type a model name that isn't shown. 3 entries were invalid or repeated and were left out.");
  s.catalog.dropped=1;
  assert.equal(M.modelNote(s),"Showing the first 400 models Opencode listed. You can type a model name that isn't shown. 1 entry was invalid or repeated and was left out.");
  M.modelAction(s,'dropped-0');
  assert.equal(s.catalog.dropped,0);
  assert.equal(M.modelNote(s),"Showing the first 400 models Opencode listed. You can type a model name that isn't shown.");
});
test('an available untruncated listing has no note and unsupported harness has its own note',()=>{
  const s=modelDraft('model-loading');M.modelAction(s,'model-listed');
  assert.equal(s.catalog.state,'available');assert.equal(M.modelNote(s),'');
  M.pickHarness(s,'Mistral Vibe');
  assert.equal(s.catalog.state,'not_read');assert.equal(s.modelOption,'unsupported');
  assert.equal(M.modelNote(s),"Model selection isn't available for this harness.");
  M.modelAction(s,'harness-list-loading');assert.equal(M.modelNote(s),'');
});
test('available listing with dropped rows but no truncation shows only the dropped note',()=>{
  const s=modelDraft('model-loading');M.modelAction(s,'model-listed');
  s.catalog.dropped=3;assert.equal(M.modelNote(s),'3 entries were invalid or repeated and were left out.');
  s.catalog.dropped=1;assert.equal(M.modelNote(s),'1 entry was invalid or repeated and was left out.');
});
test('create sets modelHarness and modelOption for model drafts',()=>{
  for(const r of MODEL_ROUTES){const s=M.create(r);assert.equal(s.modelHarness,s.harness);assert.equal(s.modelOption,'supported');}
  const v=M.create('model-loading');M.pickHarness(v,'Mistral Vibe');assert.equal(v.modelOption,'unsupported');
  M.pickHarness(v,'Codex');assert.equal(v.modelOption,'supported');
});
test('listing state unsupported and unknown states have their own notes and do not block typing',()=>{
  const s=modelDraft('model-loading');s.catalog={state:'unsupported',models:[]};s.model='my-custom-id';
  assert.equal(M.modelNote(s),"Suggested models aren't available for this harness. You can still type a model name.");
  assert.equal(M.problem(s),'');
  s.catalog={state:'future_state',models:[]};
  assert.equal(M.modelNote(s),"Suggested models aren't available. You can still type a model name.");
  assert.equal(M.problem(s),'');
});
test('model chosen for another harness must be reviewed once the harness list is ready',()=>{
  const MSG='Review and select the model for this harness.';
  let s=modelDraft('model-loading');M.modelAction(s,'model-type');assert.equal(M.problem(s),'');
  M.pickHarness(s,'Codex');assert.equal(s.modelHarness,'Claude Code');assert.equal(M.problem(s),MSG);assert.equal(M.start(s),false);
  M.modelAction(s,'model-type');assert.equal(M.problem(s),'');
  s=modelDraft('model-loading');M.modelAction(s,'model-type');M.pickHarness(s,'Codex');
  M.modelAction(s,'model-pick',{dataset:{model:'gpt-6-astra'}});assert.equal(M.problem(s),'');
  s=modelDraft('model-loading');M.modelAction(s,'model-type');M.pickHarness(s,'Codex');
  M.modelAction(s,'model-default');assert.equal(M.problem(s),'');
  s=modelDraft('model-loading');M.modelAction(s,'model-type');M.pickHarness(s,'Codex');
  M.modelAction(s,'harness-list-loading');assert.notEqual(M.problem(s),MSG);
});
test('Mistral Vibe typed-model problem applies only while the harness list is ready',()=>{
  const s=modelDraft('model-loading');M.pickHarness(s,'Mistral Vibe');s.model='x';s.modelHarness='Mistral Vibe';
  M.modelAction(s,'harness-list-loading');
  assert.equal(M.problem(s),"Harness options can't be checked until the harness list is available.");
});
test('Codex and Opencode listings use the fixture rows',()=>{
  assert.deepEqual(J(M.listingFor('Codex').models.map(m=>m.id)),['gpt-6.1-sol','gpt-6-astra','gpt-6-luna','gpt-5.6-luna']);
  assert.equal(M.listingFor('Codex').models[0].label,'GPT-6.1-Sol');
  assert.deepEqual(J(M.listingFor('Opencode').models[0]),{id:'opencode/beam-free',label:'Beam Free'});
});
test('the listing alone never blocks Start, including with a typed model',()=>{
  for(const r of ['model-loading','model-unavailable','model-truncated','model-empty']){
    const s=modelDraft(r);assert.equal(s.harnessList,'ready');
    assert.equal(M.problem(s),'',r+' default model');
    s.model='my-custom-id';
    assert.equal(M.problem(s),'',r+' typed model');
    assert.equal(M.start(s),true,r+' starts');
  }
});
test('modelName shows Default for empty text and the typed text otherwise',()=>{
  const s=modelDraft('model-loading');
  assert.equal(M.modelName(s),'Default');
  s.model='   ';assert.equal(M.modelName(s),'Default');
  s.model='my-custom-id';assert.equal(M.modelName(s),'my-custom-id');
  const a=M.create('amendment-ready');assert.equal(M.modelName(a),a.model);
  a.model='';assert.equal(M.modelName(a),'');
});
test('loading harness list blocks only non-default model, effort or turn limit',()=>{
  const MSG="Harness options can't be checked until the harness list is available.";
  for(const turns of ['12','']){const s=modelDraft('model-loading');M.modelAction(s,'harness-list-loading');s.turns=turns;assert.equal(s.harnessList,'loading');assert.notEqual(M.problem(s),MSG,'turns '+turns);assert.equal(M.problem(s),'');}
  let s=modelDraft('model-loading');M.modelAction(s,'harness-list-loading');s.model='my-custom-id';assert.equal(M.problem(s),MSG);assert.equal(M.start(s),false);
  s=modelDraft('model-loading');M.modelAction(s,'harness-list-loading');s.effort='high';assert.equal(M.problem(s),MSG);assert.equal(M.start(s),false);
  s=modelDraft('model-loading');M.modelAction(s,'harness-list-loading');s.turns='20';assert.equal(M.problem(s),MSG);assert.equal(M.start(s),false);
  M.modelAction(s,'harness-list-ready');assert.equal(M.problem(s),'');
});
test('not-installed draft is unqualified and cannot start',()=>{
  const s=modelDraft('model-not-installed');
  assert.equal(M.problem(s),'Choose a qualified harness and model.');
  assert.equal(M.start(s),false);assert.equal(s.status,'idle');
});
test('Mistral Vibe rejects a typed model until Default is chosen explicitly',()=>{
  const s=modelDraft('model-loading');M.pickHarness(s,'Mistral Vibe');
  s.model='my-custom-id';
  assert.equal(M.problem(s),'This harness does not accept a model option. Choose Default explicitly.');
  assert.equal(M.start(s),false);
  M.modelAction(s,'model-default');
  assert.equal(s.model,'');
  assert.notEqual(M.problem(s),'This harness does not accept a model option. Choose Default explicitly.');
});
test('each unavailable reason switches harness, state, reason and qualification',()=>{
  const keys=Object.keys(M.reasons);
  assert.ok(keys.length>=7);
  for(const key of keys){
    const s=modelDraft('model-unavailable');
    assert.equal(M.modelAction(s,'reason-'+key),true);
    assert.equal(s.harness,M.reasons[key][0]);
    assert.equal(s.catalog.state,'unavailable');
    assert.equal(s.catalog.reason,key);
    assert.equal(s.qualification,'ready');
    assert.ok(M.modelNote(s).includes(M.reasons[key][1]),key);
  }
  assert.equal(M.modelAction(modelDraft('model-unavailable'),'reason-nope'),false);
});
test('retry returns to loading and listed restores the harness listing',()=>{
  const s=modelDraft('model-unavailable');
  M.modelAction(s,'model-retry');assert.equal(s.catalog.state,'loading');
  M.modelAction(s,'model-listed');
  assert.deepEqual(J(s.catalog),J(M.listingFor(s.harness)));
  assert.equal(s.catalog.state,'available');
});
test('Opencode listing has 400 unique rows and is truncated',()=>{
  const l=M.listingFor('Opencode');
  assert.equal(l.state,'available');assert.equal(l.truncated,true);assert.equal(l.models.length,400);
  assert.equal(new Set(l.models.map(m=>m.id)).size,400);
  assert.equal(M.listingFor('Codex').truncated,false);
  assert.equal(M.listingFor('Antigravity').state,'not_installed');
  assert.equal(M.listingFor('Mistral Vibe').state,'not_read');
  // Cursor lists the contract fixture's rows; its sign-in failure is reached through the auth_required reason control.
  assert.equal(M.listingFor('Cursor').state,'available');assert.equal(M.listingFor('Cursor').models[0].default,true);
});
test('Codex model drafts have empty turns and no model draft counts as customized',()=>{
  for(const r of ['model-unavailable','model-empty'])assert.equal(M.create(r).turns,'');
  for(const r of MODEL_ROUTES)assert.equal(M.customized(M.create(r)),false,r);
  assert.equal(M.customized(M.create('amendment-ready')),false);
  const a=M.create('amendment-ready');a.turns='';assert.equal(M.customized(a),true);
});
test('locked model drafts ignore pick, type and default actions',()=>{
  const b={dataset:{model:'picked'}};
  for(const status of ['starting','unknown','created']){
    const s=modelDraft('model-truncated');s.model='keep';s.status=status;
    M.modelAction(s,'model-pick',b);assert.equal(s.model,'keep',status);
    M.modelAction(s,'model-type');assert.equal(s.model,'keep',status);
    M.modelAction(s,'model-default');assert.equal(s.model,'keep',status);
  }
  const s=modelDraft('model-truncated');M.modelAction(s,'model-pick',b);assert.equal(s.model,'picked');assert.equal(s.catalog.open,false);
});

// Default marker draft, approved model picker status and the open harness picker's model field.
const regState=id=>H.registry.families.find(f=>f.id==='new-task').states.find(s=>s.id===id);
test('Cursor catalog rows come from the contract fixture and mark only Auto as default',()=>{
  const rows=J(M.catalogRows('Cursor'));
  assert.deepEqual(rows.map(r=>r.id),['auto','gpt-5.3-codex-low','gpt-5.3-codex-low-fast','gpt-5.3-codex','gpt-5.3-codex-fast','gpt-5.3-codex-high','gpt-5.3-codex-high-fast']);
  assert.deepEqual(rows[0],{id:'auto',label:'Auto',default:true});
  assert.ok(rows.slice(1).every(r=>r.default===false));
  for(const h of ['Claude Code','Codex','Opencode'])assert.ok(M.catalogRows(h).every(r=>!r.default),h);
  const l=M.listingFor('Cursor');assert.equal(l.state,'available');assert.ok(!l.truncated);assert.equal(JSON.stringify(l.models),JSON.stringify(rows));
});
test('model-default is an approved Cursor state with the default marked and the picker open',()=>{
  assert.ok('model-default' in M.modelSources);assert.ok(!('model-default' in M.runtimeSources));
  assert.equal(M.isRuntimeUpdate('model-default'),false);assert.equal(M.isModelApproved('model-default'),true);assert.equal(M.isModelState('model-default'),true);
  const s=M.create('model-default');
  assert.equal(s.harness,'Cursor');assert.equal(s.catalog.state,'available');assert.equal(s.catalog.open,true);
  assert.equal(JSON.stringify(s.catalog.models),JSON.stringify(M.catalogRows('Cursor')));
  assert.equal(s.model,'');assert.equal(M.modelNote(s),'');assert.equal(M.customized(s),false);
  s.draft='Review the queue';assert.equal(M.problem(s),'');
  const p=H.m04ModelStates.find(x=>x.id==='model-default');assert.equal(p.status,'Approved');assert.equal(p.approved,true);
  const r=regState('centered-model-default');assert.equal(r.status,'approved');assert.equal(r.approvalNote,undefined);
  assert.equal(JSON.stringify(r.approval),JSON.stringify({by:'the owner',date:'2026-11-15',decision:'Model picker'}));
});
test('the six model picker states are approved amendments with the 2026-11-15 owner decision',()=>{
  for(const route of Object.keys(M.modelSources)){
    assert.equal(M.isModelApproved(route),true,route);assert.equal(M.isRuntimeUpdate(route),false,route);assert.equal(M.isAmendment(route),true,route);
    const r=regState('centered-'+route);
    assert.equal(r.status,'approved',route);
    assert.equal(JSON.stringify(r.approval),JSON.stringify({by:'the owner',date:'2026-11-15',decision:'Model picker'}),route);
    assert.equal(r.approvalNote,undefined,route);
  }
  assert.equal(Object.keys(M.modelSources).length,6);
});
test('the open harness route starts gated with an unread catalog and an editable empty model',()=>{
  const s=M.create('centered-harness-open');
  assert.equal(JSON.stringify(s.catalog),JSON.stringify({state:'not_read',models:[]}));
  assert.equal(s.model,'');assert.equal(s.harnessList,'ready');assert.equal(s.modelHarness,'Unavailable harness');assert.equal(s.modelOption,'supported');
  assert.equal(M.modelNote(s),'');assert.equal(M.problem(s),'Choose a qualified harness and model.');
});
test('pickOpenHarness keeps the approved qualification check and reads the harness listing',()=>{
  const s=M.create('centered-harness-open'),rev=s.revision;
  M.pickOpenHarness(s,'Claude Code');
  assert.equal(s.qualification,'checking');assert.equal(s.revision,rev+1);
  assert.equal(JSON.stringify(s.catalog),JSON.stringify(M.listingFor('Claude Code')));assert.equal(s.modelOption,'supported');
  s.draft='Review the queue';assert.equal(M.problem(s),'Choose a qualified harness and model.');
  M.qualify(s,s.revision,'ready');assert.equal(M.problem(s),'');
  const v=M.create('centered-harness-open');M.pickOpenHarness(v,'Mistral Vibe');
  assert.equal(v.modelOption,'unsupported');assert.equal(M.modelNote(v),"Model selection isn't available for this harness.");
  M.pickOpenHarness(v,'Unavailable harness');assert.equal(v.catalog.state,'not_read');assert.equal(v.catalog.models.length,0);
  const p=M.create('centered-harness-open'),q=M.create('centered-harness-open');M.pickHarness(p,'Claude Code');M.pickOpenHarness(q,'Claude Code');
  assert.equal(p.qualification,'ready');assert.equal(q.qualification,'checking');
});
test('open harness picker keeps the approved turn-limit and typed-model review rules',()=>{
  let s=M.create('centered-harness-open');s.draft='Review the queue';M.pickOpenHarness(s,'Codex');M.qualify(s,s.revision,'ready');
  assert.equal(s.turns,'12');assert.equal(M.problem(s),'This harness does not support a turn limit. Clear it in task options.');
  s=M.create('centered-harness-open');s.draft='Review the queue';M.pickOpenHarness(s,'Claude Code');M.qualify(s,s.revision,'ready');
  M.modelAction(s,'model-type');assert.equal(s.modelHarness,'Claude Code');assert.equal(M.problem(s),'');
  M.pickOpenHarness(s,'Codex');s.turns='';M.qualify(s,s.revision,'ready');
  assert.equal(M.problem(s),'Review and select the model for this harness.');
});
const m04Src=()=>fs.readFileSync(new URL('../v2/scripts/m04-proposal.js',import.meta.url),'utf8');
const m04Css=()=>fs.readFileSync(new URL('../v2/styles/m04-proposal.css',import.meta.url),'utf8');
test('the default tag is emitted only for rows whose default is truthy and is styled',()=>{
  assert.ok(m04Src().includes(`(m.default?'<span class="hd-m04-combo__tag">default</span>':'')`));
  assert.match(m04Css(),/\.hd-m04-combo__tag\{/);
});
test('the suggestion list drops below the combo when it passes the compose area right edge',()=>{
  assert.match(m04Src(),/modelList\.closest\('\.hd-m04-compose-area'\)[\s\S]*modelList\.getBoundingClientRect\(\)\.right>clip\.getBoundingClientRect\(\)\.right[\s\S]*?classList\.add\('hd-m04-combo__list--below'\)/);
  assert.match(m04Css(),/\.hd-m04-combo__list--below\{/);
});
test('the app has no Use default model button; the fixture control is Clear the model',()=>{
  assert.ok(!m04Src().includes('Use default model'));
  assert.ok(m04Src().includes("button('Clear the model','model-default')"));
});

// Owner-approved repository picker states (2026-11-19).
const REPO_ROUTES=['repository-empty','repository-recents','repository-hover','repository-focus','repository-invalid'];
const RECENTS=J(M.recentRepos);
test('repository states register as approved amendments sourced from the ready composer',()=>{
  assert.deepEqual(J(Object.keys(M.repositorySources)),REPO_ROUTES);
  assert.deepEqual(Array.from(H.m04RepositoryStates,x=>x.id),REPO_ROUTES);
  assert.ok(H.m04RepositoryStates.every(x=>x.status==='Approved'&&x.approved===true&&/^Owner-approved repository picker state \(2026-11-19\)/.test(x.description)));
  for(const r of REPO_ROUTES){
    assert.equal(M.repositorySources[r],'amendment-ready',r);
    assert.equal(M.isRepositoryState(r),true);assert.equal(M.isAmendment(r),true);assert.equal(M.isRedraw(r),false);assert.equal(M.isModelApproved(r),false);
    const st=regState('centered-'+r);
    assert.equal(st.status,'approved',r);assert.equal(st.approvalNote,undefined,r);assert.equal(JSON.stringify(st.approval),JSON.stringify({by:'the owner',date:'2026-11-19',decision:'Repository picker'}),r);assert.equal(st.group,'Repository',r);
  }
  assert.equal(M.isRepositoryState('amendment-ready'),false);
});
test('repository states copy the ready fixture apart from the picker and repository fields',()=>{
  const base=J(M.create('amendment-ready')),own=['route','picker','repository','repoPath','recents','repoTip','repoFocus','repoError','repoPicker'];
  for(const r of REPO_ROUTES){
    const s=M.create(r),d=J(s);
    assert.equal(s.picker,'repository');assert.equal(s.repoPicker,true);assert.equal(s.chipCap,undefined);
    for(const k of own){delete d[k];delete base[k];}
    assert.equal(JSON.stringify(d),JSON.stringify(base),r);
    Object.assign(base,J(M.create('amendment-ready')));
  }
  assert.equal(M.recentRepos.length,5);
  let s=M.create('repository-empty');
  assert.equal(s.repoPath,'');assert.equal(s.recents.length,0);assert.equal(s.repository,'Choose repository');assert.equal(M.problem(s),'Choose a repository to continue.');
  for(const r of ['repository-recents','repository-hover','repository-focus']){
    s=M.create(r);assert.equal(s.repoPath,RECENTS[0]);assert.equal(JSON.stringify(s.recents),JSON.stringify(RECENTS));assert.equal(s.repository,'HarflowMCP');assert.equal(M.problem(s),'');
  }
  assert.equal(M.create('repository-hover').repoTip,RECENTS[4]);assert.equal(M.create('repository-focus').repoFocus,RECENTS[1]);
  s=M.create('repository-invalid');s.draft='Review';
  assert.equal(s.repoPath,'/Users/me/Code/HarflowMPC');assert.equal(s.repoError,true);assert.equal(M.problem(s),'Choose an existing folder.');assert.equal(M.start(s),false);
});
test('approved entry states are unaffected by the repository fields',()=>{
  const s=M.create('amendment-ready');assert.ok(!s.repoPicker);assert.equal(M.problem(s),'');
});
test('repoName takes the last path component and ignores trailing slashes',()=>{
  assert.equal(M.repoName('/Users/me/Code/HarflowMCP'),'HarflowMCP');assert.equal(M.repoName('/Users/me/Code/HarflowMCP///'),'HarflowMCP');assert.equal(M.repoName(''),'');
});
test('setRepoPath updates the repository name and clears the error',()=>{
  const s=M.create('repository-invalid');M.setRepoPath(s,'/a/b/Web/');assert.equal(s.repoPath,'/a/b/Web/');assert.equal(s.repository,'Web');assert.equal(s.repoError,false);
  M.setRepoPath(s,'');assert.equal(s.repository,'Choose repository');
});
test('checkRepoPath flags only non-blank paths that are not existing fixture folders',()=>{
  const s=M.create('repository-empty');
  for(const p of ['','   ',...RECENTS,'/Users/me/Code/HarflowWeb','/Users/me/Code/HarflowWeb/',RECENTS[0]+'/']){s.repoPath=p;assert.equal(M.checkRepoPath(s),true,p);assert.equal(s.repoError,false,p);}
  s.repoPath='/nowhere';assert.equal(M.checkRepoPath(s),false);assert.equal(s.repoError,true);
  s.repoPath='';assert.equal(M.checkRepoPath(s),true);assert.equal(s.repoError,false);
});
test('repoAction drives the popover and the fixture controls',()=>{
  let s=M.create('repository-invalid');s.repoFocus='x';s.repoTip='y';
  assert.equal(M.repoAction(s,'repo-pick',{dataset:{path:RECENTS[1]}}),true);
  assert.equal(s.repoPath,RECENTS[1]);assert.equal(s.repository,'HarflowDesign');assert.equal(s.repoError,false);assert.equal(s.repoFocus,'');assert.equal(s.repoTip,'');
  M.repoAction(s,'repo-choose');assert.equal(s.repoPath,'/Users/me/Code/HarflowWeb');assert.equal(s.repository,'HarflowWeb');
  s.repoPath='/nowhere';assert.equal(M.repoAction(s,'repo-check'),true);assert.equal(s.repoError,true);
  M.repoAction(s,'repo-recents-none');assert.equal(s.recents.length,0);
  M.repoAction(s,'repo-recents-five');assert.equal(JSON.stringify(s.recents),JSON.stringify(RECENTS));
  assert.equal(M.repoAction(s,'repo-cap-240'),false);assert.equal(M.repoAction(s,'repo-cap-row'),false);assert.equal(s.chipCap,undefined);
  M.repoAction(s,'repo-tip-long');assert.equal(s.repoTip,RECENTS[4]);M.repoAction(s,'repo-tip-none');assert.equal(s.repoTip,'');
  M.repoAction(s,'repo-recents-none');M.repoAction(s,'repo-tip-long');assert.equal(s.repoTip,'');
  assert.equal(M.repoAction(s,'not-an-action'),false);
  s=M.create('repository-recents');s.status='starting';
  assert.equal(M.repoAction(s,'repo-pick',{dataset:{path:RECENTS[1]}}),true);assert.equal(s.repoPath,RECENTS[0]);
  assert.equal(M.repoAction(s,'repo-choose'),true);assert.equal(s.repoPath,RECENTS[0]);
});
test('repository picker markup carries the full path, accessible names and the error wiring',()=>{
  const src=m04Src();
  assert.ok(src.includes(`title="'+esc(path)+'"`));assert.ok(src.includes(`aria-description="'+esc(path)+'"`));
  assert.ok(src.includes(`aria-label="Recent repository '+esc(repoName(path))+'"`));assert.ok(src.includes(`aria-pressed="'+on+'"`));
  assert.ok(src.includes(`(s.recents.length?'<div class="hd-m04-recents" role="group"`));
  assert.ok(src.includes(`aria-invalid="true" aria-describedby="m04-repo-error"`));assert.ok(src.includes(`id="m04-repo-error">Choose an existing folder.</span>`));
  const css=m04Css();
  assert.ok(css.includes('.hd-m04-picker-menu.hd-m04-repo{width:360px'));
  assert.ok(!css.includes('cap240'));
  assert.match(css,/\.hd-m04-chip\{[^}]*max-width:100%/);
});
test('middleTruncate keeps the head and tail of a name',()=>{
  const n='abcdefghijklmnopqrstuvwxyz';
  assert.equal(M.middleTruncate('short',5),'short');assert.equal(M.middleTruncate('short',9),'short');
  assert.equal(M.middleTruncate(n,10),'abcde…vwxyz');assert.equal(M.middleTruncate(n,9),'abcde…wxyz');
  assert.equal(M.middleTruncate(n,1),'a…');
});
test('long worktree names stay distinguishable under middle truncation',()=>{
  const [a,b]=RECENTS.slice(3).map(M.repoName);
  assert.equal(a.slice(0,-6),b.slice(0,-6));assert.notEqual(a.slice(-6),b.slice(-6));
  for(let k=12;k<a.length;k++)assert.notEqual(M.middleTruncate(a,k),M.middleTruncate(b,k),String(k));
});
test('start checks a typed repository path that was never committed',()=>{
  const s=M.create('repository-recents');s.draft='Review';M.setRepoPath(s,'/nowhere');assert.equal(s.repoError,false);
  assert.equal(M.start(s),false);assert.equal(s.repoError,true);assert.equal(M.problem(s),'Choose an existing folder.');
  const t=M.create('repository-recents');t.draft='Review';M.setRepoPath(t,'/Users/me/Code/HarflowWeb');assert.equal(M.start(t),true);
});
test('chip labels are measured and middle truncated from the full name, and the accessible name stays full',()=>{
  const src=m04Src();
  assert.ok(src.includes(".hd-m04-chip__label"));assert.ok(src.includes('middleTruncate('));
  assert.ok(src.includes('label.dataset.name=name'));assert.ok(src.includes('label.dataset.name||label.textContent'));
  assert.ok(src.includes(`aria-label="Recent repository '+esc(repoName(path))+'"`));
});
