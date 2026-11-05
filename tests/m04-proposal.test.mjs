import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}};
vm.createContext(context);
for (const name of ['m04-proposal.js','screens-m04-proposal.js']) vm.runInContext(fs.readFileSync(new URL('../v2/scripts/'+name,import.meta.url),'utf8'),context);
const H=context.window.HFV2, M=H.m04Proposal.model;
const ready=()=>{const s=M.create('composer-ready');s.draft='Review the queue';return s;};
test('all 24 proposal routes register without DOM or canonical templates',()=>{assert.equal(H.m04ProposalStates.length,24);assert.equal(Object.keys(H.templates).length,24);assert.ok(H.m04ProposalStates.every(x=>x.approved && x.status==='Approved'));});
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
