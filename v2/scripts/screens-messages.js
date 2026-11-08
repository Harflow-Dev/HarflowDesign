/* Provisional queued-message states of the task screen: the messaging ledger of a task drawn in the task screen
   frame. Not approved; each state's meaning is cited in v2/docs/decisions/README.md. The frame comes from
   m05-proposal.js, the bubbles and composer additions from messages-screen.js. Deterministic browser-only fixtures. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  var docs = H.componentDocs = H.componentDocs || {};

  // Labels of the catalog-only strip above the app frame. The Node test scans them for process names.
  (H.catalogStrips = H.catalogStrips || {}).messages = {
    label: 'Queued message review controls',
    provisional: 'Provisional · not approved',
    note: 'Deterministic mock · design reference. Frame and the review controls are catalog-only.'
  };

  // Mock text a person typed. It is fixture content, not interface copy.
  var FIRST = 'Once the fix is in, run the whole slots suite one more time.';
  var SECOND = 'Then summarise what changed in two sentences.';
  var NOT_REQUEUED = 'Delivery could not be confirmed. The message is not requeued.';
  var CANT_INTERRUPT = 'Send now isn\'t available. This operation can\'t be interrupted safely.';

  // [id, title, description, base task screen state, bubbles, composer, outcome line, approval note, how to read it]
  // A bubble is { id, kind: queued | delivering | uncertain, text, note }. A queued bubble can be cancelled.
  var NOTE_PLAIN = 'Provisional · not approved';
  var NOTE_GAP = 'Provisional · not approved · contract gap open';
  var ROWS = [
    ['message-queued', 'Queued messages',
      'Two messages queued for the next turn sit below the live activity, each captioned Queued with Cancel. The composer shows Send now beside Send. Cancel removes a message and says so.',
      'state-running', [{ id: 'a', kind: 'queued', text: FIRST }, { id: 'b', kind: 'queued', text: SECOND }], 'sendNow', '', NOTE_PLAIN,
      '<p>Queued messages wait for the next explicitly requested continuation. A queued send never folds into the live turn, and Cancel is offered only while a message is queued. Statuses and cancel: <code>contracts.md</code>, Queued task and workflow messaging.</p><p>The approved composer has a single Send button and a hint that mentions Send now. Whether Send now is a separate control, or only the hint and the existing behaviour, is an owner design question; this state draws a separate control to show one answer.</p>'],
    ['message-delivering', 'Message delivering',
      'A message the engine has claimed keeps the Queued caption and loses Cancel while delivery is in progress.',
      'state-running', [{ id: 'a', kind: 'delivering', text: FIRST }], 'sendNow', 'Delivery is in progress.', NOTE_PLAIN,
      '<p>The engine\'s <code>delivering</code> status (a <code>reserved</code> follow-up maps to it). Dispatch reservation claims eligible messages atomically, so a claimed message can no longer be cancelled.</p>'],
    ['message-delivered', 'Message delivered',
      'A delivered message leaves the queue. The outcome line says it was delivered; it does not say the agent acted on it.',
      'state-running', [], 'sendNow', 'Message delivered.', NOTE_PLAIN,
      '<p>Delivered means handed to an issued process, not successful execution, and delivered records retain metadata only (<code>delivery_task_id</code>; fixture <code>ctl-workflow-messages.json</code>, sequence 2). No message text is drawn because the record no longer holds it.</p>'],
    ['message-cancelled', 'Message cancelled',
      'A cancelled message leaves the queue and an outcome line says so.',
      'state-running', [{ id: 'b', kind: 'queued', text: SECOND }], 'sendNow', 'Queued message cancelled.', NOTE_PLAIN,
      '<p>The <code>cancelled</code> status. Cancelled records retain metadata only, so the cancelled message is not drawn. The other queued message stays queued.</p>'],
    ['message-send-now-refused', 'Send now refused',
      'The message stays queued with the refusal under it, and Cancel stays available.',
      'state-running', [{ id: 'a', kind: 'queued', text: FIRST, note: CANT_INTERRUPT }], 'sendNow', '', NOTE_GAP,
      '<p>A now-refusal is an accepted queued response carrying a refusal code; it does not roll back admission (fixture <code>ctl-messaging-queued.json</code>, <code>interrupt_unsupported</code>, status <code>queued</code>). The other codes the contract lists, <code>workflow_checkpoint_required</code> and <code>continuation_refused</code>, have no fixture and no drawn copy.</p>'],
    ['message-uncertain', 'Delivery uncertain',
      'A claimed message whose delivery cannot be confirmed is not requeued, has no Cancel and is not pinned below the live activity.',
      'state-running', [{ id: 'a', kind: 'uncertain', text: FIRST, note: NOT_REQUEUED }], 'sendNow', '', NOTE_GAP,
      '<p>Uncertain delivery stays <code>delivering</code> with a reason and never requeues. messaging.v1 has no distinct status or fixture for it, so the reason line is neutral provisional wording.</p>'],
    ['message-unsupported', 'Messages unavailable',
      'Send now removed; input locked, when the engine does not offer queued messages. The disabled Send button stays.',
      'state-running', [], 'locked', '', NOTE_GAP,
      '<p>Consumers must require the <code>messaging.v1</code> capability before sending. The contract defines a usage error and no copy, so the locked composer carries no placeholder or hint. Send now is removed and the input is locked; the disabled Send button stays.</p>'],
    ['message-queued-settled', 'Queued on a finished task',
      'Queued messages on a failed task keep waiting, with Cancel, beside the one way to continue the task.',
      'state-failed', [{ id: 'a', kind: 'queued', text: FIRST }, { id: 'b', kind: 'queued', text: SECOND }], 'standard', '', NOTE_GAP,
      '<p>A queued send to a settled task adds <code>target_settled</code> and <code>target_status</code>, and the message waits for <code>resume_task</code> or <code>continue_task</code>. Automatic continuation never consumes it. The failed task screen offers only Continue in a new session. The contract gives no text for the settled-target note, so none is drawn.</p>']
  ];

  H.messageStates = ROWS.map(function (r) {
    return { id: r[0], title: r[1], description: r[2], base: r[3], bubbles: r[4], composer: r[5], outcome: r[6], approvalNote: r[7] };
  });

  ROWS.forEach(function (r) {
    var key = 'messages/' + r[0];
    T[key] = '<div class="hd-m05 hd-msgq-host" data-theme="{{theme}}" data-light-on="{{lightOn}}" data-dark-on="{{darkOn}}" data-system-on="{{systemOn}}" data-messages-state="' + r[0] + '"><div class="hd-m05-catalog" aria-label="' + H.catalogStrips.messages.label + '"></div><div class="hd-m05-stage"></div></div>';
    docs[key] = '<p><strong>Provisional, not approved.</strong> The messaging ledger of a task drawn inside the task screen frame. <a href="docs/decisions/README.md#queued-messages-and-approval-states-provisional">Decision record</a>, with the contract citation and the open gaps of every state.</p>' + r[8] +
      '<p>Deterministic mock text; no engine, provider or network is involved. Reloading the route resets the mock.</p>';
    H.registerState('task', {
      id: r[0], title: r[1], description: r[2], group: 'Messages', status: 'provisional', approvalNote: r[7],
      source: { template: key, renderer: 'messages', mount: r[0], guide: key }
    });
  });
})();
