import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// Provisional queued-message and approval states: how they are derived, what copy they may show, and where they are recorded.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const v2 = path.join(root, 'v2');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function loadRuntime() {
  const context = vm.createContext({ window: {} });
  context.window = context;
  const scripts = fs.readdirSync(path.join(v2, 'scripts')).filter(name => name !== 'catalog.js');
  for (const name of ['registry.js', ...scripts.filter(name => name !== 'registry.js')]) vm.runInContext(read(`v2/scripts/${name}`), context, { filename: name });
  return context.HFV2;
}
const H = loadRuntime();
const NAMING_RULE = /\bm0\d\b|d2b|propos(al|ed)|native entry|\bG-[A-Z]+\b|milestone/i;
const MESSAGE_IDS = ['queued', 'delivering', 'delivered', 'cancelled', 'send-now-refused', 'uncertain', 'undeliverable', 'unsupported', 'queued-settled'].map(x => `message-${x}`);
const APPROVALS = [
  'task/approval-exact', 'task/approval-stale', 'task/approval-expired', 'task/approval-answered-elsewhere', 'task/approval-refused', 'task/approval-uncertain',
  'needs-you/approval-stale', 'needs-you/approval-expired', 'needs-you/answered-elsewhere', 'needs-you/checkpoint-stale', 'needs-you/interaction-answered-elsewhere',
  'menu-bar/approval-stale', 'menu-bar/answered-elsewhere'
];
const GAP_NOTE = 'Provisional · not approved · contract gap open';
const PLAIN_NOTE = 'Provisional · not approved';
const stateOf = route => { const [f, s] = route.split('/'); return [H.findFamily(f), H.findState(H.findFamily(f), s)]; };

// Text a person can read or hear in a block of markup: text nodes and the accessible attributes.
function lines(html) {
  const out = [];
  for (const piece of html.replace(/<[^>]*>/g, '\n').split('\n')) { const t = piece.replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim(); if (t) out.push(t); }
  for (const m of html.matchAll(/\b(title|aria-label|placeholder)="([^"]*)"/g)) if (m[2]) out.push(m[2]);
  return out;
}
const multiset = list => list.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
function added(base, now) {
  const have = multiset(lines(base)), out = [];
  for (const line of lines(now)) { const n = have.get(line) || 0; if (n > 0) have.set(line, n - 1); else out.push(line); }
  return out;
}

// Every line a specimen adds to its base, with its source (HarflowMac lines are read at 3fdf0e8). The decision record lists the same lines.
const MESSAGE_COPY = new Set([
  'Queued', 'Undeliverable', 'Delivery uncertain',                                          // WorkMessageQueue.swift:49-51
  'Cancel', 'Cancel queued message',                                                        // PromptBubbleView.swift:93, :98
  'Send now', 'Ask for immediate delivery; an engine refusal keeps the message queued',     // MessageBoxView.swift:258, :262
  'Send now isn\'t available. This operation can\'t be interrupted safely.',                // WorkMessageQueue.swift:67
  'Delivery is in progress.', 'Message delivered.',                                         // TaskActionRepositoryImpl.swift:129-130
  'Queued message cancelled.',                                                              // ParallelViewRepository.swift:111
  'Delivery could not be confirmed. The message is not requeued.',                          // neutral: contracts.md:1709-1712
  'The run was cancelled, so no further dispatch will consume this message.',               // neutral: contracts.md:1683-1685
  'Once the fix is in, run the whole slots suite one more time.', 'Then summarise what changed in two sentences.' // fixture content
]);
const APPROVAL_COPY = new Set([
  'Refresh',
  'The request changed or is no longer current. This response did not change it. Refresh to review the current action.', // CallerApprovalPresentation.swift:8
  'This request already has an answer. This response did not change it.',                                               // :10
  'This request has already settled. This response did not change it.',                                                  // :12
  'This request changed. Review it again.',                                                                              // NeedsYouModels.swift:190
  'Delivery is unknown. The decision will not be retried.',                                                              // CallerApprovalController.swift:349
  'Answered in Harflow · approve',                                                                                       // CallerApprovalController.swift:328
  'Already answered by the caller',                                                                                      // NeedsYouVM+Actions.swift:87, WorkflowInteractionOutcomeView.swift:16
  'Answered in Harflow · Oct 14, 2026, 17:46 UTC', 'Answered by the caller · Oct 14, 2026, 17:47 UTC',                   // CallerApprovalPresentation.swift:50
  'Recorded decision: approve', 'Effective decision: reject', 'Delivered decision: reject',                              // :54-56
  'Delivery: sent', 'Delivery: delivery_unknown', 'Observed execution: unknown',                                         // CallerApprovalCard.swift:165-166
  'Expired',                                                                                                             // neutral: disposition expired
  'Harflow sent a rejection when the request expired.',                                                                  // neutral: harness-permissions.md:710-714
  'It can\'t be approved later. Recovery is a new continuation of the task.',                                            // neutral: harness-permissions.md:718
  'Oct 14, 2026, 17:46 UTC', 'Nov 2, 2026, 01:00 UTC',                                                                   // fixture times
  'Use staging, and postpone the Thursday release.'                                                                      // fixture answer
]);
const NEUTRAL = ['Delivery could not be confirmed. The message is not requeued.', 'The run was cancelled, so no further dispatch will consume this message.', 'Expired', 'Harflow sent a rejection when the request expired.', 'It can\'t be approved later. Recovery is a new continuation of the task.'];

// ---- Registration ----

test('the nine queued-message states are provisional, in the Messages group, with their own note and no approval', () => {
  const task = H.findFamily('task');
  assert.ok(task.groups.includes('Messages'));
  assert.deepEqual(Array.from(H.messageStates, s => s.id), MESSAGE_IDS);
  for (const id of MESSAGE_IDS) {
    const [family, state] = stateOf(`task/${id}`);
    assert.equal(state.status, 'provisional', id);
    assert.equal(state.group, 'Messages');
    assert.equal(state.approval, undefined, `${id} carries no approval object`);
    assert.deepEqual(JSON.parse(JSON.stringify(state.source)), { template: `messages/${id}`, renderer: 'messages', mount: id, guide: `messages/${id}` });
    assert.ok([PLAIN_NOTE, GAP_NOTE].includes(state.approvalNote), id);
    assert.equal(H.approvalLine(family, state), state.approvalNote);
    assert.equal(H.describe(`task/${id}`).renderer, 'messages');
    assert.equal(H.routeFor('messages', id), `task/${id}`);
  }
  // The suffix is only on states with a real contract gap; the queued, delivering, delivered and cancelled states have only the design question.
  assert.deepEqual(MESSAGE_IDS.filter(id => stateOf(`task/${id}`)[1].approvalNote === GAP_NOTE), ['message-send-now-refused', 'message-uncertain', 'message-undeliverable', 'message-unsupported', 'message-queued-settled']);
  // The states sit after the transcript states and before the Changes group.
  const groups = task.states.map(s => s.group);
  assert.ok(groups.lastIndexOf('Transcript') < groups.indexOf('Messages') && groups.lastIndexOf('Messages') < groups.indexOf('Changes'));
});

test('the thirteen approval states are provisional with no approval object, and only real gaps carry the gap suffix', () => {
  for (const route of APPROVALS) {
    const [family, state] = stateOf(route);
    assert.equal(state.status, 'provisional', route);
    assert.equal(state.approval, undefined, route);
    assert.equal(state.source, undefined, `${route} renders its own template`);
    assert.equal(H.describe(route).templateKey, route);
    assert.equal(H.approvalLine(family, state), state.approvalNote);
  }
  const gap = APPROVALS.filter(route => stateOf(route)[1].approvalNote === GAP_NOTE).sort();
  assert.deepEqual(gap, ['menu-bar/answered-elsewhere', 'needs-you/answered-elsewhere', 'needs-you/interaction-answered-elsewhere', 'task/approval-answered-elsewhere']);
  assert.equal(H.approvalStates.length, 13);
});

test('titles, descriptions, guides and the queued-message strip name the product screen only', () => {
  const hit = [];
  const check = (where, value) => { if (NAMING_RULE.test(value)) hit.push(`${where}: ${value.slice(0, 60)}`); };
  for (const route of [...MESSAGE_IDS.map(id => `task/${id}`), ...APPROVALS]) {
    const [family, state] = stateOf(route);
    for (const field of ['id', 'title', 'description', 'group', 'approvalNote']) check(`${route} ${field}`, state[field]);
    const d = H.describe(route);
    check(`${route} guide`, (H.componentDocs[d.guideKey] || '').replace(/<[^>]*>/g, ' '));
    assert.ok(typeof H.componentDocs[d.guideKey] === 'string', `${route} has a guide`);
  }
  for (const [name, value] of Object.entries(H.catalogStrips.messages)) check(`strip messages.${name}`, value);
  assert.ok(Object.keys(H.catalogStrips.messages).length >= 3);
  assert.deepEqual(hit, []);
});

// ---- Approval states are derived from approved templates by replacing one block ----

test('each approval template equals its base with exactly one block replaced, and the base is not changed', () => {
  assert.equal(H.approvalDerivations.length, 13);
  const bases = new Set();
  for (const d of H.approvalDerivations) {
    const base = H.templates[d.base], find = d.find(), replace = d.build(find), now = H.templates[d.route];
    bases.add(d.base);
    assert.equal(base.split(find).length - 1, 1, `${d.route}: the block is unique in ${d.base}`);
    assert.equal(now, base.replace(find, () => replace), `${d.route} is its base with that block replaced`);
    if (replace) assert.equal(now.replace(replace, () => find), base, `${d.route}: undoing the replacement gives the base back`);
    else assert.equal(base.replace(find, ''), now, `${d.route} removes the block`);
    assert.notEqual(now, base);
  }
  assert.deepEqual(Array.from(bases).sort(), ['menu-bar/busy', 'needs-you/waiting', 'task/approval', 'task/approval-exact']);
  // The approved states still hold their text: the exact-action card removes only the task-wide button.
  assert.ok(H.templates['task/approval'].includes('Approve for this task'));
  const exact = H.approvalDerivations.find(d => d.route === 'task/approval-exact');
  assert.equal(exact.find(), '<button type="button" class="hd-btn hd-btn--secondary">Approve for this task</button>');
  assert.equal(exact.build(exact.find()), '');
});

test('no new template says "for this task", and no settled card offers a decision', () => {
  for (const route of APPROVALS) assert.ok(!/for this task/i.test(H.templates[route]), `${route} has no task-wide approval`);
  assert.match(H.templates['task/approval-exact'], /Approve once<\/button>/);
  assert.match(H.templates['task/approval-exact'], /Reject<\/button>/);
  const refresh = ['task/approval-stale', 'needs-you/approval-stale', 'menu-bar/approval-stale', 'needs-you/checkpoint-stale'];
  for (const d of H.approvalDerivations.filter(x => x.route !== 'task/approval-exact')) {
    const card = d.build(d.find());
    assert.equal((card.match(/hd-approval--settled/g) || []).length, 1, `${d.route} marks one card settled`);
    assert.equal((H.templates[d.base].match(/hd-approval--settled/g) || []).length, 0, `${d.base} has no settled card`);
    assert.equal((H.templates[d.route].match(/hd-approval--settled/g) || []).length, 1, `${d.route}: only the replaced card is settled`);
    assert.ok(!/>(Approve|Approve once|Reject|Send)<\/button>/.test(card), `${d.route}: the settled card has no decision button`);
    assert.ok(card.includes('role="status"'), `${d.route} has a status block`);
    assert.equal(card.includes('>Refresh</button>'), refresh.includes(d.route), `${d.route}: Refresh only where the request must be read again`);
  }
}
);

test('an approval draft says only what the contract says: the expired text never claims the action was not run', () => {
  for (const route of ['task/approval-expired', 'needs-you/approval-expired']) {
    const text = lines(H.templates[route]).join(' ');
    assert.ok(!/not run|did not run|was not executed|never ran/i.test(text), route);
    assert.match(text, /Observed execution: unknown/);
    assert.match(text, /Harflow sent a rejection when the request expired\./);
  }
  const override = lines(H.templates['task/approval-expired']).join('\n');
  assert.match(override, /Recorded decision: approve/);
  assert.match(override, /Effective decision: reject/);
  const unanswered = lines(H.templates['needs-you/approval-expired']).join('\n');
  assert.ok(!/Recorded decision/.test(unanswered), 'the unanswered request has no caller decision');
});

test('every line a draft adds to its base is in the copy allowlist, and the neutral lines are the ones marked neutral', () => {
  const unknown = [];
  for (const d of H.approvalDerivations) {
    if (d.route === 'task/approval-exact') continue;
    for (const line of added(H.templates[d.base], H.templates[d.route])) if (!APPROVAL_COPY.has(line)) unknown.push(`${d.route}: ${line}`);
  }
  // The modifier class and the settled head carry no text; the lines above are the whole addition.
  const exactAdded = added(H.templates['task/approval'], H.templates['task/approval-exact']);
  assert.deepEqual(exactAdded, [], 'the exact-action state adds no text');
  assert.deepEqual(unknown, []);
  const m05 = H.m05Proposal;
  const spec = id => H.m05ProposalStates.find(s => s.id === id).spec;
  for (const def of H.messageStates) {
    const built = H.messagesScreen.build(def.id);
    const ui = m05.initialUi(built.state.spec);
    const plain = m05.screenHtml(built.state.spec, ui, 'light', 'light');
    const now = m05.screenHtml(built.state.spec, ui, 'light', 'light', built.hooks);
    for (const line of added(plain, now)) assert.ok(MESSAGE_COPY.has(line), `${def.id}: ${line}`);
    assert.equal(spec(def.base), built.state.spec);
  }
  for (const line of NEUTRAL) assert.ok(MESSAGE_COPY.has(line) || APPROVAL_COPY.has(line), line);
});

// ---- The queued-message drawing ----

test('each queued-message state draws what the contract defines and nothing else', () => {
  const m05 = H.m05Proposal;
  const draw = id => { const b = H.messagesScreen.build(id); return m05.screenHtml(b.state.spec, m05.initialUi(b.state.spec), 'light', 'light', b.hooks); };
  const text = id => lines(draw(id)).join('\n');
  const count = (html, re) => (html.match(re) || []).length;
  const cancel = html => count(html, /class="hd-msgq__cancel"/g);
  // queued: two pinned bubbles, each with Cancel; Send now is beside Send
  let html = draw('message-queued');
  assert.equal(count(html, /class="hd-msg-user hd-msgq hd-msgq--pending"/g), 2);
  assert.equal(cancel(html), 2);
  assert.match(html, /disabled title="Ask for immediate delivery; an engine refusal keeps the message queued">Send now<\/button><button type="submit"/);
  // delivering: still Queued, no Cancel, in progress
  html = draw('message-delivering');
  assert.equal(count(html, /hd-msgq__caption">Queued</g), 1);
  assert.equal(cancel(html), 0);
  assert.match(text('message-delivering'), /Delivery is in progress\./);
  // delivered and cancelled keep metadata only: no message text for the gone message
  html = draw('message-delivered');
  assert.equal(count(html, /hd-msgq__text/g), 0);
  assert.match(text('message-delivered'), /Message delivered\./);
  assert.ok(!/delivered[^.]*(acted|read|executed)/i.test(text('message-delivered')), 'delivered does not imply the message was acted on');
  html = draw('message-cancelled');
  assert.equal(count(html, /hd-msgq__text/g), 1);
  assert.match(text('message-cancelled'), /Queued message cancelled\./);
  // refused: queued, refusal under it, Cancel stays
  html = draw('message-send-now-refused');
  assert.equal(cancel(html), 1);
  assert.match(html, /hd-msgq__note">Send now isn&#39;t available\. This operation can&#39;t be interrupted safely\.</);
  // uncertain: not pinned, no Cancel, above the live activity, never requeued
  html = draw('message-uncertain');
  assert.equal(count(html, /hd-msgq--pending/g), 0);
  assert.equal(cancel(html), 0);
  assert.ok(html.indexOf('Delivery uncertain') < html.indexOf('<div class="hd-working">'), 'settled bubbles stay above the live activity');
  assert.match(html, /The message is not requeued\./);
  // undeliverable: on the cancelled task, no Cancel
  html = draw('message-undeliverable');
  assert.equal(cancel(html), 0);
  assert.match(html, /Undeliverable/);
  assert.match(html, /Cancelled 04:31/);
  // unsupported: locked composer, no placeholder, no hint, no Send now, no bubbles
  html = draw('message-unsupported');
  assert.match(html, /placeholder="" disabled/);
  assert.ok(!/Send now|Send queues|Queue a message/.test(html));
  assert.equal(count(html, /hd-msgq/g), 0);
  // settled: the failed task keeps its one Continue beside the queued bubbles
  html = draw('message-queued-settled');
  assert.equal(count(html, /Continue in a new session/g), 1);
  assert.equal(cancel(html), 2);
  assert.ok(!/target_settled|waits for|will be delivered/i.test(text('message-queued-settled')), 'no settled-target note is drawn');
});

test('Cancel removes a queued message, says so, and only a queued message can be cancelled', () => {
  const b = H.messagesScreen.build('message-queued');
  assert.equal(b.act('msg-cancel:nope'), false);
  assert.equal(b.act('noop'), false);
  assert.equal(b.act('msg-cancel:a'), '.hd-msgq__outcome');
  const html = b.hooks.transcriptTail({}, '');
  assert.ok(!html.includes('data-message="a"') && html.includes('data-message="b"') && html.includes('Queued message cancelled.'));
  assert.equal(b.act('msg-cancel:a'), false, 'a removed message cannot be cancelled twice');
  const d = H.messagesScreen.build('message-delivering');
  assert.equal(d.act('msg-cancel:a'), false, 'a claimed message cannot be cancelled');
  const u = H.messagesScreen.build('message-uncertain');
  assert.equal(u.act('msg-cancel:a'), false);
  // each build starts a fresh mock
  assert.ok(H.messagesScreen.build('message-queued').hooks.transcriptTail({}, '').includes('data-message="a"'));
});

test('the new hooks change nothing for a route that passes none, and apply with a transcript slot', () => {
  const m05 = H.m05Proposal;
  const spec = H.m05ProposalStates.find(s => s.id === 'state-running').spec, ui = m05.initialUi(spec);
  const plain = m05.screenHtml(spec, ui, 'dark', 'dark');
  assert.equal(m05.screenHtml(spec, ui, 'dark', 'dark', {}), plain);
  assert.equal(m05.screenHtml(spec, ui, 'dark', 'dark', { transcriptTail: (s, body) => body, composerSlot: (s, html) => html }), plain, 'identity hooks change nothing');
  const tail = m05.screenHtml(spec, ui, 'dark', 'dark', { transcriptTail: (s, body) => body + '<p data-tail></p>' });
  assert.ok(tail.includes('<p data-tail></p></div></div><div class="hd-m05-composer">'));
  const composer = m05.screenHtml(spec, ui, 'dark', 'dark', { composerSlot: (s, html) => '<div data-composer></div>' });
  assert.ok(composer.includes('<div data-composer></div></section>') && !composer.includes('hd-composer__send'));
  const slotted = m05.screenHtml(spec, ui, 'dark', 'dark', { transcriptSlot: () => '<p data-slot></p>', composerSlot: (s, html) => '<div data-composer></div>' });
  assert.ok(slotted.includes('<p data-slot></p><div data-composer></div></section>'));
  assert.equal(H.m05ProposalStates.filter(s => !s.spec.board).length > 40, true);
});

// ---- Records ----

test('the decision record lists every new route, every neutral line, the gaps and the owner questions', () => {
  const decisions = read('v2/docs/decisions/README.md');
  const at = decisions.indexOf('## Queued messages and approval states (provisional)');
  assert.ok(at > 0 && decisions.includes('<a id="queued-messages-and-approval-states-provisional"></a>'));
  const section = decisions.slice(at, decisions.indexOf('\n## ', at + 5));
  for (const route of [...MESSAGE_IDS.map(id => `task/${id}`), ...APPROVALS]) assert.ok(section.includes(`\`${route}\``), `${route} is recorded`);
  for (const line of [...MESSAGE_COPY, ...APPROVAL_COPY].filter(l => !/ UTC|·/.test(l) && !/^Oct|^Nov/.test(l))) assert.ok(section.includes(line.replace(/ approve$/, '')), `the allowlist cites: ${line}`);
  for (const line of NEUTRAL) { const row = section.split('\n').find(l => l.startsWith(`| ${line} |`)); assert.ok(row && /\| Neutral \|$/.test(row), `${line} is marked neutral`); }
  for (const text of ['Open gaps', 'Owner questions', 'Provisional wording for owner review', 'The exact-action relabel', '3fdf0e8', '0936746']) assert.ok(section.includes(text), text);
  assert.ok(!/archive\/v1/.test(section.replace(/Nothing is copied from `archive\/v1`\./, '')), 'v1 is not a source');
  assert.ok(decisions.includes('A pending redraw may also change copy when an owner decision requires it'));
  assert.ok(decisions.includes('| Queued messages and approval states (provisional drafts) |'));
  const map = read('v2/docs/route-map.md');
  for (const route of [...MESSAGE_IDS.map(id => `task/${id}`), ...APPROVALS]) assert.ok(map.includes(`\`${route}\``), `${route} is in the route map`);
  assert.ok(map.includes('## Provisional routes') && map.includes('### Redraw awaiting approval'));
  const inventory = read('v2/docs/screen-inventory.md');
  for (const route of [...MESSAGE_IDS.map(id => `task/${id}`), ...APPROVALS]) assert.ok(inventory.includes(`\`${route.split('/')[1]}\``) || inventory.includes(`\`${route}\``), `${route} is in the inventory`);
  assert.ok(read('CHANGELOG.md').includes('Add provisional queued-message and approval state drafts'));
  const ledger = read('v2/docs/migration-coverage.md');
  assert.ok(/G-QUEUE[^\n]*Provisional drafts of nine states/.test(ledger) && /G-APPROVAL-STATES[^\n]*Provisional drafts exist/.test(ledger));
});

test('the pages load the new scripts and styles in order, and no sibling repository or archive is touched by them', () => {
  const page = read('v2/index.html');
  const at = name => page.indexOf(name);
  assert.ok(at('scripts/screens-menu-bar.js') < at('scripts/screens-approval-states.js') && at('scripts/screens-approval-states.js') < at('scripts/screens-app-states.js'));
  assert.ok(at('scripts/m05-proposal.js') < at('scripts/screens-messages.js') && at('scripts/screens-messages.js') < at('scripts/messages-screen.js') && at('scripts/messages-screen.js') < at('scripts/supersessions.js'));
  assert.ok(at('styles/messages-screen.css') > 0 && at('styles/approval-states.css') > 0);
  for (const file of ['v2/scripts/screens-messages.js', 'v2/scripts/messages-screen.js', 'v2/scripts/screens-approval-states.js', 'v2/styles/messages-screen.css', 'v2/styles/approval-states.css']) {
    const source = read(file);
    assert.ok(!/archive\/v1|\.\.\/HarflowMac|\.\.\/HarflowMCP/.test(source.replace(/\/\*[\s\S]*?\*\//g, '')), file);
    assert.ok(!/\bfetch\(|XMLHttpRequest|import\(/.test(source), `${file} makes no request`);
  }
});
