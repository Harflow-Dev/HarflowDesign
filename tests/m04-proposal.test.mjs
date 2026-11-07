import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}};
vm.createContext(context);
for (const name of ['registry.js','m04-proposal.js','screens-m04-proposal.js']) vm.runInContext(fs.readFileSync(new URL('../v2/scripts/'+name,import.meta.url),'utf8'),context);
const H=context.window.HFV2, M=H.m04Proposal.model;
const ready=()=>{const s=M.create('composer-ready');s.draft='Review the queue';return s;};
test('all 24 approved baseline routes register without DOM or canonical templates',()=>{
  assert.equal(H.m04ProposalStates.length,24);
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
const m04States=()=>H.registry.families.flatMap(f=>f.states.filter(s=>s.source&&s.source.renderer==='m04').map(s=>Object.assign({route:f.id+'/'+s.id},s)));
test('registry approves all 30 entry states with the six centered composer states on separate provenance',()=>{
  const all=m04States();
  assert.equal(all.length,30,'24 baseline states plus the six now-approved centered composer states');
  assert.ok(all.every(s=>s.status==='approved'));
  const centered=all.filter(s=>s.source.mount.startsWith('amendment-'));
  assert.equal(centered.length,6,'the six centered composer states stay separate routes');
  assert.deepEqual(Array.from(centered,s=>s.route).sort(),['new-task/centered-capped','new-task/centered-empty','new-task/centered-growing','new-task/centered-options','new-task/centered-ready','new-task/centered-unknown']);
  assert.ok(centered.every(s=>/Owner-approved centered-composer amendment \(2026-11-06, separate from the 2026-11-05 entry direction\)/.test(s.description)));
  assert.ok(centered.every(s=>s.approval.date==='2026-11-06'&&/separate from the 2026-11-05 entry direction/.test(s.approval.decision)));
  const baseline=all.filter(s=>!s.source.mount.startsWith('amendment-'));
  assert.equal(baseline.length,24);
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
