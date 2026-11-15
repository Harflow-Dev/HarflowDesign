/* Workflow run states for messages and goal changes. Approved by the owner on 2026-11-15.
   Each state is an approved workflow run template (on-demand or graph-needs-you) with the pane block it changes
   replaced; the frame, top bar, canvas and sidebar are the base's. Templates are computed on first use, so the base
   screens and the lane parts load in any order. The messages and engine refusals are fixture text; the orchestrator
   conversation and goal wording that has no Mac source is design wording and is named as such in each guide.
   Decision record: docs/decisions/README.md (Workflow and capacity states). Display only: no engine calls. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.gapStates = H.gapStates || [];

  var FAMILY = 'workflow-run';
  var GROUP = 'Messages and goal';
  var ON_DEMAND = FAMILY + '/on-demand';
  var NEEDS_YOU = FAMILY + '/graph-needs-you';
  var APPROVAL = { by: 'the owner', date: '2026-11-15', decision: 'Workflow and capacity states' };
  var RECORD = '<a href="docs/decisions/README.md#workflow-and-capacity-states">Decision record</a>';

  // Canonical task glyphs; no new glyphs.
  var G = {
    running: '<span class="hd-glyph hd-glyph--running" aria-label="Running"></span>',
    done: '<span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span>'
  };

  // Fixture text: what a person typed, what the orchestrator answered, goal revisions and engine reasons.
  var EARLIER_ASK = 'Skip the docs checker for this run; the docs did not change.';
  var EARLIER_ANSWER = 'Understood. I will not call Docs checker in this run.';
  var OPEN_ASK = 'Run the security reviewer again after the pull request opens.';
  var QUESTION = 'Should the security reviewer run before or after the pull request opens?';
  var QUEUED_TEXT = 'Also check whether the lockfile pins a vulnerable transitive dependency.';
  // The refusal copy of the approved Send now refused state (screens-messages.js, CANT_INTERRUPT).
  var CANT_INTERRUPT = 'Send now isn\'t available. This operation can\'t be interrupted safely.';
  var GOAL_2 = 'Upgrade the three vulnerable dependencies with all tests passing, and open one pull request with the lockfile changes.';
  var GOAL_3 = 'Upgrade the three vulnerable dependencies with all tests passing, open one pull request with the lockfile changes, and list any package that stays pinned.';
  var GOAL_1 = 'Upgrade the vulnerable dependencies and open a pull request.';
  var CALLER_GOAL = 'Upgrade the three vulnerable dependencies and open one pull request. Skip the integration tests.';
  // Design wording, aligned with the approved caller-approval phrasing of an uncertain delivery.
  var UNKNOWN_NOTE = 'Harflow couldn\'t confirm the orchestrator received this message. It will not be sent again.';
  var NOT_ACCEPTED = 'The run did not accept the new goal.';

  // The base with its only occurrence of `find` replaced. It throws when `find` is missing or not unique, so a changed
  // base cannot silently draw a different screen.
  function swap(html, find, replace, base) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + base + ': ' + find.slice(0, 60));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + find.slice(0, 60));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close, base) {
    var from = html.indexOf(open), to = from < 0 ? -1 : html.indexOf(close, from);
    if (from < 0 || to < 0) throw new Error('Block not found in ' + base + ': ' + open.slice(0, 60));
    return html.slice(from, to + close.length);
  }
  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function ensureGroup(name) {
    var family = H.findFamily(FAMILY);
    if (family.groups.indexOf(name) < 0) {
      var at = family.groups.indexOf('Loading');
      family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
    }
  }

  // Registers one derived state: a lazy template under its own route, its guide, and the catalog entry.
  function define(id, base, build, state, guide) {
    var route = FAMILY + '/' + id;
    function make() {
      var html = T[base];
      if (typeof html !== 'string') throw new Error('No template ' + base);
      return build(html, base);
    }
    Object.defineProperty(T, route, {
      enumerable: true, configurable: true,
      get: function () {
        var value = make();
        Object.defineProperty(T, route, { enumerable: true, configurable: true, writable: true, value: value });
        return value;
      }
    });
    var meta = Object.assign({ id: id, group: GROUP }, state);
    meta.status = 'approved';
    meta.approval = APPROVAL;
    docs[route] = '<p><strong>Approved by the owner · 2026-11-15.</strong> ' + guide + ' ' + RECORD + '.</p>';
    H.gapStates.push(route);
    ensureGroup(GROUP);
    H.registerState(FAMILY, meta);
  }

  // ---- Shared pieces -------------------------------------------------------------------------------------------
  var HOST_OPEN = '<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">';
  // The frame hosts the queue styles (messages-screen.css), as the approved lane state does.
  function host(html, base) {
    return swap(html, HOST_OPEN, '<div class="hd-app hd-msgq-host" data-theme="{{theme}}" style="width: 100%; height: 800px;">', base);
  }

  var ORCH = '<button type="button" class="hd-node hd-node--orchestrator" aria-label="Orchestrator, locked">';
  var ORCH_ON = '<button type="button" class="hd-node hd-node--orchestrator is-selected" aria-label="Orchestrator, locked, selected" aria-pressed="true">';
  var REVIEWER_ON = 'class="hd-node hd-node--ondemand is-selected" aria-label="Security reviewer, on demand node, 2 calls, selected" aria-pressed="true"';
  var REVIEWER_OFF = 'class="hd-node hd-node--ondemand" aria-label="Security reviewer, on demand node, 2 calls"';
  var DOCS = 'class="hd-node hd-node--ondemand hd-node--idle" aria-label="Docs checker, on demand node, not called"';
  var DOCS_ON = 'class="hd-node hd-node--ondemand hd-node--idle is-selected" aria-label="Docs checker, on demand node, not called, selected" aria-pressed="true"';

  function selectOrchestrator(html, base) {
    html = swap(html, REVIEWER_ON, REVIEWER_OFF, base);
    return swap(html, ORCH, ORCH_ON, base);
  }
  function selectDocs(html, base) {
    html = swap(html, REVIEWER_ON, REVIEWER_OFF, base);
    return swap(html, DOCS, DOCS_ON, base);
  }

  function pane(o) {
    return '<aside class="hd-pane" style="width: 460px;" aria-label="' + o.label + '">\n' +
      '<div class="hd-pane__head"><span class="hd-topbar__title">' + o.title + '</span><span class="caption hd-faint">' + o.caption + '</span><span class="hd-topbar__spacer"></span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Close"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></button></div>\n' +
      '<div class="hd-scroll" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4);">' + o.body + '</div>\n' +
      '<div style="flex:none;padding:var(--space-3);border-top:1px solid var(--border);">' + o.composer + '</div></aside>';
  }
  function replacePane(html, base, o) {
    return swap(html, between(html, '<aside class="hd-pane"', '</aside>', base), pane(o), base);
  }

  // The one-row composer of the on-demand pane, optionally locked with the reason as its placeholder.
  function composer(o) {
    var off = !!o.locked;
    return '<form class="hd-composer" aria-label="' + o.label + '" style="padding:var(--space-2) var(--space-2) var(--space-2) var(--space-3);flex-direction:row;align-items:center;">' +
      (off ? '<span class="hd-i hd-i--sm hd-i-lock" aria-hidden="true"></span>' : '') +
      '<label class="hd-sr" for="' + o.id + '">' + o.label + '</label>' +
      '<textarea id="' + o.id + '" class="hd-composer__input" rows="1" placeholder="' + o.placeholder + '"' + (off ? ' disabled' : '') + ' style="min-height:' + (off ? 40 : 24) + 'px;"></textarea>' +
      '<button type="submit" class="hd-composer__send" aria-label="' + o.send + '" disabled style="width:28px;height:28px;"><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></form>' +
      (o.note ? '<p class="caption hd-gap-composer-note">' + o.note + '</p>' : '');
  }

  var STATUS = 'display:flex;align-items:center;gap:var(--space-2);font-size:13px;line-height:18px;';
  function status(glyph, text, colour) {
    return '<div style="' + STATUS + (colour ? 'font-weight:500;color:' + colour + ';' : 'color:var(--text-secondary);') + '">' + glyph + '<span>' + text + '</span></div>';
  }

  // ---- Orchestrator pane -----------------------------------------------------------------------------------------
  var DECISION = status(G.running, 'Orchestrator is choosing the next node…');
  function conversation(parts) {
    return '<div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border);"><span class="hd-inspector__label">CONVERSATION</span>' + parts.join('') + '</div>';
  }
  var EARLIER = [
    '<div class="hd-msg-user">' + esc(EARLIER_ASK) + '</div>',
    '<div class="hd-msg-agent"><p>' + esc(EARLIER_ANSWER) + '</p></div>',
    status(G.done, 'Answered', 'var(--success)')
  ];
  function orchestratorPane(parts, comp, decision) {
    return { label: 'Selected orchestrator', title: 'Orchestrator', caption: 'Always present', body: (decision || DECISION) + conversation(parts), composer: comp };
  }
  var ORCH_COMPOSER = { id: 'msg-orchestrator', label: 'Message the orchestrator', placeholder: 'Ask or tell the orchestrator', send: 'Send to the orchestrator' };

  define('orchestrator-selected', ON_DEMAND, function (html, base) {
    html = selectOrchestrator(html, base);
    return replacePane(html, base, orchestratorPane(EARLIER, composer(ORCH_COMPOSER)));
  }, {
    title: 'Orchestrator selected',
    description: 'The orchestrator selected in the Standalone strip. The pane shows what it is doing now and one earlier exchange, and offers a composer to message it.'
  }, 'The orchestrator node selected on the on-demand run. The pane head, decision line, conversation section and the composer wording (label, placeholder) are design wording: the Mac has no orchestrator pane. The messages in the exchange are fixture text. Derived from <a href="#workflow-run/on-demand">On-demand nodes</a>.');

  define('orchestrator-steering-open', ON_DEMAND, function (html, base) {
    html = selectOrchestrator(html, base);
    var parts = EARLIER.concat(['<div class="hd-msg-user">' + esc(OPEN_ASK) + '</div>', status(G.running, 'Waiting for the orchestrator to respond')]);
    var locked = Object.assign({}, ORCH_COMPOSER, { locked: true, placeholder: 'One conversation at a time — wait for the reply' });
    return replacePane(html, base, orchestratorPane(parts, composer(locked)));
  }, {
    title: 'Orchestrator conversation open',
    description: 'A message to the orchestrator is waiting for its reply. The composer is locked until the reply arrives, so there is one conversation at a time.'
  }, 'The orchestrator pane while a message of the person is unanswered and the engine has not settled it: classifying, queued at a boundary, turn reserved or discussing. The waiting status and the locked-composer wording are design wording for those in-flight states. Delivery unknown has its own state. Settling a pending delivery (<code>dismiss_pending_settlement</code>) belongs with Dismiss, which is not drawn. The message is fixture text.');

  define('orchestrator-steering-unavailable', ON_DEMAND, function (html, base) {
    html = selectOrchestrator(html, base);
    var locked = Object.assign({}, ORCH_COMPOSER, {
      locked: true, placeholder: 'Answer the run\'s open question first.',
      note: '<a class="hd-link" href="#needs-you/waiting">Open Needs you</a>'
    });
    return replacePane(html, base, orchestratorPane(EARLIER, composer(locked)));
  }, {
    title: 'Orchestrator conversation unavailable',
    description: 'The orchestrator composer is locked while the run waits for an answer to its open question, and a link opens Needs you.'
  }, 'The orchestrator pane while the run has an open question for a person. The lock reason is design wording for the engine refusal <code>steering_question_pending</code>; the Open Needs you link goes to the approved <a href="#needs-you/waiting">Needs you</a> state.');

  define('orchestrator-steering-waiting', ON_DEMAND, function (html, base) {
    html = selectOrchestrator(html, base);
    var parts = EARLIER.concat(['<div class="hd-msg-user">' + esc(OPEN_ASK) + '</div>', '<div class="hd-msg-agent"><p>' + esc(QUESTION) + '</p></div>',
      status('', 'The orchestrator asked a question. Reply to continue.')]);
    var open = Object.assign({}, ORCH_COMPOSER, { placeholder: 'Reply to the orchestrator' });
    return replacePane(html, base, orchestratorPane(parts, composer(open)));
  }, {
    title: 'Orchestrator waiting for you',
    description: 'The orchestrator answered with a question to the person. The composer is open, with a caption that a reply is needed.'
  }, 'The orchestrator pane in the engine state <code>awaiting_caller</code>: the reply of the orchestrator is a question and the conversation waits for the person. The caption and the composer placeholder are design wording; the question is fixture text.');

  define('orchestrator-steering-cancelling', ON_DEMAND, function (html, base) {
    html = selectOrchestrator(html, base);
    html = swap(html, '<span class="hd-badge hd-badge--attention"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you</span>',
      '<span class="hd-badge hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Cancelling</span>', base);
    html = swap(html, '<button type="button" class="hd-btn hd-btn--ghost"><span class="hd-i hd-i--sm hd-i-pause" aria-hidden="true"></span> Pause</button><button type="button" class="hd-btn hd-btn--ghost">Cancel run</button>', '', base);
    var locked = Object.assign({}, ORCH_COMPOSER, { locked: true, placeholder: 'Messages are off — this run is cancelling' });
    return replacePane(html, base, orchestratorPane(EARLIER, composer(locked), status(G.running, 'Cancelling the run…')));
  }, {
    title: 'Orchestrator while the run is cancelling',
    description: 'The run is cancelling: the top bar shows Cancelling without Pause or Cancel run, and the orchestrator composer is locked.'
  }, 'The orchestrator pane while the run status is <code>cancelling</code>, when the engine refuses steering. No cancelling badge exists in the status vocabulary, so the badge is the running-style spinner badge with the word Cancelling, a design choice. The lock text follows the approved lane lock text; the decision line is design wording. The canvas is the on-demand base fixture and is not redrawn for cancelling.');

  define('orchestrator-steering-unknown', ON_DEMAND, function (html, base) {
    html = host(selectOrchestrator(html, base), base);
    var bubble = '<div class="hd-msg-user hd-msgq" data-message="steering-unknown"><span class="hd-msgq__caption">Delivery unknown</span><span class="hd-msgq__text">' + esc(OPEN_ASK) + '</span><span class="hd-msgq__note">' + esc(UNKNOWN_NOTE) + '</span></div>';
    var locked = Object.assign({}, ORCH_COMPOSER, { locked: true, placeholder: 'Messages are off until delivery is settled' });
    return replacePane(html, base, orchestratorPane(EARLIER.concat([bubble]), composer(locked)));
  }, {
    title: 'Orchestrator delivery unknown',
    description: 'A message to the orchestrator whose delivery could not be confirmed. It is captioned Delivery unknown and is not sent again; the composer is locked.'
  }, 'The orchestrator pane in the engine state <code>delivery_unknown</code>. The bubble uses the classes of the approved queued message bubble; the wording is design wording aligned with the approved caller-approval phrasing, and the composer stays locked until the engine settles the message. The message is fixture text.');

  // ---- Node messages ---------------------------------------------------------------------------------------------
  var SEND_NOW = '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" data-m05="noop" disabled title="Ask for immediate delivery; an engine refusal keeps the message queued">Send now</button>';
  var CALLS_END = '<span>Done · no advisories · 01:12</span></div></div></div>\n<div style="flex:none;';
  var NODE_SEND = '<button type="submit" class="hd-composer__send" aria-label="Send to Security reviewer"';

  function queued(note) {
    if (!H.laneParts || typeof H.laneParts.queue !== 'function') throw new Error('Lane parts are not loaded');
    return H.laneParts.queue([{ kind: 'queued', text: QUEUED_TEXT, note: note }]);
  }
  function withQueue(html, base, note) {
    html = host(html, base);
    html = swap(html, CALLS_END, '<span>Done · no advisories · 01:12</span></div></div>' + queued(note) + '</div>\n<div style="flex:none;', base);
    return swap(html, NODE_SEND, SEND_NOW + NODE_SEND, base);
  }

  define('node-message-queued', ON_DEMAND, function (html, base) { return withQueue(html, base); }, {
    title: 'Node message queued',
    description: 'A message to an on-demand node waits below the node\'s activity, captioned Queued with Cancel. The composer shows Send now beside Send.'
  }, 'A message queued to the Security reviewer node, drawn as the approved queued task message states draw it: a pinned bubble captioned Queued with Cancel, and a separate Send now control beside Send. The message is fixture text. Derived from <a href="#workflow-run/on-demand">On-demand nodes</a>.');

  define('node-message-refused', ON_DEMAND, function (html, base) { return withQueue(html, base, CANT_INTERRUPT); }, {
    title: 'Send now refused',
    description: 'The queued message to a node stays queued with the refusal under it, and Cancel stays available.'
  }, 'The queued node message after a Send now refusal, with the refusal copy of the approved <a href="#task/message-send-now-refused">Send now refused</a> state; the message stays queued. The message is fixture text.');

  define('node-message-unavailable', ON_DEMAND, function (html, base) {
    html = selectDocs(html, base);
    var body = '<p class="body" style="margin:0;color:var(--text-secondary);">Runs only when the orchestrator calls it, one call at a time.</p>' +
      '<div style="display:flex;flex-direction:column;gap:var(--space-1);"><span class="hd-inspector__label">CALLS</span><span class="caption hd-faint" style="padding:8px var(--space-2);">Not called yet.</span></div>';
    var locked = composer({ id: 'msg-node', label: 'Message this node', placeholder: 'This node has no issued task or child workflow to message yet.', send: 'Send to Docs checker', locked: true });
    return replacePane(html, base, { label: 'Selected on-demand node', title: 'Docs checker', caption: 'On demand', body: body, composer: locked });
  }, {
    title: 'Node not started',
    description: 'An on-demand node that has not been called has no calls to list, and its composer is locked with the reason.'
  }, 'The Docs checker node, which has not been called, selected. The calls list is replaced by a caption and the composer is locked; the lock reason is design wording for a node with no issued task or child workflow to message.');

  define('messages-unsupported', ON_DEMAND, function (html, base) {
    return swap(html, 'placeholder="Message this node" style="min-height:24px;"', 'placeholder="" disabled style="min-height:24px;"', base);
  }, {
    title: 'Messages unavailable in this runtime',
    description: 'The node composer is locked when the runtime does not offer queued messages. The input is disabled and the disabled Send button stays.'
  }, 'The on-demand node pane for a runtime without queued messages. It uses the locked composer of the approved <a href="#task/message-unsupported">Messages unavailable</a> state: the input is disabled with no placeholder or hint, and the disabled Send button stays.');

  // ---- Goal ----------------------------------------------------------------------------------------------------
  var GOAL_OPEN = '<div style="display:flex;flex-direction:column;gap:var(--space-2);padding-bottom:var(--space-3);border-bottom:1px solid var(--border);"><span class="hd-inspector__label">GOAL</span>';
  var GOAL_END = 'Revise goal…</a></div>';
  var BLOCK = 'display:flex;flex-direction:column;gap:var(--space-2);padding-bottom:var(--space-3);border-bottom:1px solid var(--border);';
  var ASSESSMENT = '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:13px;color:var(--text-secondary);"><span class="hd-i hd-i--sm hd-i-target" aria-hidden="true"></span><span>Assessment: in progress</span></div>';
  var REVISE_LINK = '<a href="#workflow-run/revise-goal" style="font-size:13px;color:var(--accent);text-decoration:none;">Revise goal…</a>';

  function replaceGoal(html, base, block) {
    html = swap(html, between(html, GOAL_OPEN, GOAL_END, base), block, base);
    // The cards must not shrink inside the pane's flex column: the pane scrolls instead of clipping them.
    return swap(html, '<div class="hd-approval" role="group" aria-label="Approval needed">', '<div class="hd-approval" role="group" aria-label="Approval needed" style="flex:none;">', base);
  }
  function goalBlock(label, inner) {
    return '<div style="' + BLOCK + '"><span class="hd-inspector__label">' + label + '</span>' + inner + '</div>';
  }
  function reviseForm(draft, failure) {
    return '<form class="hd-gap-goal-form" aria-label="Revise goal" style="' + BLOCK + '">' +
      '<span class="hd-inspector__label">Goal · revision 2</span>' +
      '<label class="hd-sr" for="goal-revised">Revised workflow goal</label>' +
      '<textarea id="goal-revised" class="hd-gap-field" rows="4"' + (failure ? ' aria-describedby="goal-failure"' : '') + '>' + esc(draft) + '</textarea>' +
      '<p class="caption hd-faint" style="margin:0;">The original caller can also answer. Whichever answers first is used.</p>' +
      (failure ? '<p id="goal-failure" class="hd-gap-run-note hd-gap-run-note--danger" role="alert"><strong>Couldn\'t save the goal.</strong> ' + esc(failure) + ' Your draft is preserved.</p>' : '') +
      '<div class="hd-row" style="gap:var(--space-2);"><a class="hd-btn hd-btn--ghost" href="#workflow-run/graph-needs-you">Cancel</a><button type="submit" class="hd-btn hd-btn--primary">Save goal</button></div></form>';
  }

  define('revise-goal', NEEDS_YOU, function (html, base) {
    return replaceGoal(html, base, reviseForm(GOAL_2));
  }, {
    title: 'Revising the goal',
    description: 'The goal block of the selected step becomes a form: the goal text is editable, with Cancel and Save goal.'
  }, 'The goal block of <a href="#workflow-run/graph-needs-you">Graph, needs you</a> in edit form. The revision label, the Revised workflow goal label and the shared-answering note are Mac copy (HarflowMac WorkflowGoalView.swift); the goal text is fixture text. Cancel returns to the approved state.');

  define('goal-revised', NEEDS_YOU, function (html, base) {
    var history = '<details class="hd-gap-history"><summary>Revision history</summary><ul><li><strong>Revision 2</strong><span>' + esc(GOAL_2) + '</span></li><li><strong>Revision 1</strong><span>' + esc(GOAL_1) + '</span></li></ul></details>';
    var inner = '<p class="body" style="margin:0;">' + esc(GOAL_3) + '</p>' + ASSESSMENT + history + REVISE_LINK;
    return replaceGoal(html, base, goalBlock('Goal · revision 3', inner));
  }, {
    title: 'Goal revised',
    description: 'The goal block after a revision: the new text, the assessment, a collapsed Revision history and the Revise goal link.'
  }, 'The goal block after a saved revision. The Goal · revision label is Mac copy (HarflowMac WorkflowGoalView.swift); the revision history disclosure and its entries are design wording; the goal texts and the assessment are fixture text.');

  define('revise-goal-unavailable', NEEDS_YOU, function (html, base) {
    var disabled = '<div class="hd-gap-revise"><button type="button" class="hd-gap-link" disabled aria-describedby="goal-revise-reason">Revise goal…</button><span id="goal-revise-reason" class="caption hd-faint">Waiting for workers to finish.</span></div>';
    var inner = '<p class="body" style="margin:0;">' + esc(GOAL_2) + '</p>' + ASSESSMENT + disabled;
    return replaceGoal(html, base, goalBlock('GOAL', inner));
  }, {
    title: 'Goal revision unavailable',
    description: 'Revise goal is shown disabled with the reason underneath while the engine does not accept a revision.'
  }, 'The goal block with Revise goal disabled. The reason is fixture text standing for the message the engine returns when a revision is refused.');

  define('revise-goal-answered-elsewhere', NEEDS_YOU, function (html, base) {
    var card = '<div class="hd-approval hd-approval--settled" role="group" aria-label="Goal answered elsewhere" style="flex:none;">' +
      '<div class="hd-approval__head"><span class="hd-i hd-i--sm hd-i-target" aria-hidden="true"></span><span>Goal</span></div>' +
      '<div class="hd-approval__result hd-gap-result" role="status"><p class="hd-approval__result-title">Already answered by the caller</p>' +
      '<p class="hd-gap-result__label">Answer excerpt</p><p>' + esc(CALLER_GOAL) + '</p>' +
      '<p class="hd-gap-result__label">Your saved draft</p><p>' + esc(GOAL_3) + '</p></div></div>';
    return replaceGoal(html, base, card);
  }, {
    title: 'Goal answered elsewhere',
    description: 'The caller answered the goal first. The block shows the caller\'s excerpt and keeps the person\'s draft.'
  }, 'The goal block when the original caller answered first, drawn with the card of the approved <a href="#needs-you/answered-elsewhere">Approval answered elsewhere</a> state. The labels Answer excerpt and Your saved draft are design wording; both texts are fixture text.');

  define('revise-goal-failed', NEEDS_YOU, function (html, base) {
    return replaceGoal(html, base, reviseForm(GOAL_3, NOT_ACCEPTED));
  }, {
    title: 'Goal revision failed',
    description: 'The goal form after a failed save: the person\'s draft stays in the field and a note says it is preserved.'
  }, 'The revise form after a failed save. The engine message is fixture text; the draft text is fixture text.');
})();
