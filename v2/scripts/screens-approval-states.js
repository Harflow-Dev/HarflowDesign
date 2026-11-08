/* Provisional approval states. Each is derived from an approved template by replacing exactly one block of it:
   the approval card, or in the exact-action state the row of decision buttons. The approved templates are not
   changed. Not approved; each state's meaning is cited in v2/docs/decisions/README.md. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  var docs = H.componentDocs = H.componentDocs || {};

  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // derive(baseKey, find, replace): the base template with its only occurrence of `find` replaced. It throws when
  // `find` is missing or not unique, so a changed base cannot silently draw a different block.
  function derive(baseKey, find, replace) {
    var base = T[baseKey];
    if (typeof base !== 'string') throw new Error('No template ' + baseKey);
    var at = base.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + baseKey);
    if (base.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + baseKey);
    return base.slice(0, at) + replace + base.slice(at + find.length);
  }
  // The approval card of a template, from its opening tag to its closing tag.
  function cardIn(baseKey, open, endsWith) {
    var base = T[baseKey], from = base.indexOf(open), to = base.indexOf(endsWith, from);
    if (from < 0 || to < 0) throw new Error('Approval card not found in ' + baseKey);
    return base.slice(from, to + endsWith.length);
  }
  // The card marked settled: the head and body stay as approved, the decision buttons are replaced by a result
  // block, and what the card links to stays. Only the settled modifier is added to the card's class.
  function settle(card, result) {
    var at = card.indexOf('<div class="hd-approval__actions"');
    if (at < 0 || card.indexOf('class="hd-approval"') < 0) throw new Error('Unexpected approval card');
    var tag = card.indexOf('<section') === 0 ? 'section' : 'div';
    var close = card.lastIndexOf('</' + tag + '>');
    var actions = card.slice(at, close);
    var compact = actions.indexOf('hd-btn--sm') >= 0;
    var link = (actions.match(/<a class="hd-btn hd-btn--ghost"[\s\S]*?<\/a>/) || [''])[0];
    var attrs = (actions.match(/^<div class="hd-approval__actions"([^>]*)>/) || ['', ''])[1];
    var rows = result.lines.map(function (line) { return '<p>' + esc(line) + '</p>'; }).join('');
    var block = '<div class="hd-approval__result' + (compact ? ' hd-approval__result--compact' : '') + '" role="status">' +
      (result.title ? '<p class="hd-approval__result-title">' + esc(result.title) + '</p>' : '') + rows + '</div>';
    var buttons = (result.refresh ? '<button type="button" class="hd-btn hd-btn--secondary' + (compact ? ' hd-btn--sm' : '') + '">Refresh</button>' : '') +
      (link ? '<span style="flex: 1;"></span>' + link : '');
    var row = buttons ? '<div class="hd-approval__actions"' + attrs + '>' + buttons + '</div>' : '';
    return card.slice(0, at).replace('class="hd-approval"', 'class="hd-approval hd-approval--settled"') + block + row + card.slice(close);
  }

  // The three approved cards the states start from.
  var TASK_OPEN = '<div class="hd-approval" role="group" aria-label="Approval needed">';
  var TASK_END = 'Reject</button></div></div>';
  var NEEDS_FIRST = '<section class="hd-approval" aria-label="Wants to run a command">';
  var NEEDS_SECOND = '<section class="hd-approval" aria-label="Wants to publish">';
  var MENU_FIRST = '<div class="hd-approval">\n          <div class="hd-approval__head" style="padding: 8px 12px;"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Run command</div>';

  // Wording. Each line cites its source in v2/docs/decisions/README.md. Mac lines are read at HarflowMac 3fdf0e8.
  var COPY = {
    notCurrent: 'The request changed or is no longer current. This response did not change it. Refresh to review the current action.',
    alreadyAnswered: 'This request already has an answer. This response did not change it.',
    settled: 'This request has already settled. This response did not change it.',
    changed: 'This request changed. Review it again.',
    unknown: 'Delivery is unknown. The decision will not be retried.',
    byMonitor: 'Answered in Harflow',
    byCaller: 'Answered by the caller',
    raceMonitor: 'Answered in Harflow',
    raceCaller: 'Already answered by the caller',
    expired: 'Expired',
    rejectionSent: 'Harflow sent a rejection when the request expired.',
    recovery: 'It can\'t be approved later. Recovery is a new continuation of the task.'
  };
  // Fixture times, read from the checked-in examples and shown in UTC.
  var AT = { answered: 'Oct 14, 2026, 17:46 UTC', unknown: 'Oct 14, 2026, 17:46 UTC', override: 'Oct 14, 2026, 17:47 UTC' };

  var DECIDED = {
    stale: { lines: [COPY.notCurrent], refresh: true },
    refused: { lines: [COPY.settled] },
    answeredMonitor: { title: COPY.raceMonitor + ' · approve', lines: [AT.answered, COPY.alreadyAnswered] },
    answeredCaller: { title: COPY.raceCaller, lines: [AT.answered, 'Recorded decision: approve'] },
    uncertain: { title: COPY.unknown, lines: [COPY.byMonitor + ' · ' + AT.unknown, 'Recorded decision: approve', 'Delivery: delivery_unknown', 'Observed execution: unknown'] },
    expiredOverride: { title: COPY.expired, lines: [COPY.byCaller + ' · ' + AT.override, 'Recorded decision: approve', 'Effective decision: reject', 'Delivered decision: reject', COPY.rejectionSent, 'Delivery: sent', 'Observed execution: unknown', COPY.recovery] },
    expiredUnanswered: { title: COPY.expired, lines: ['Effective decision: reject', 'Delivered decision: reject', COPY.rejectionSent, 'Delivery: sent', 'Observed execution: unknown', COPY.recovery] },
    checkpointStale: { lines: [COPY.changed], refresh: true }
  };

  var derivations = H.approvalDerivations = [];
  // Defines a template that is computed from its base on first use, because the base screens load in any order.
  function lazy(route, base, find, build) {
    Object.defineProperty(T, route, {
      enumerable: true, configurable: true,
      get: function () {
        var f = typeof find === 'function' ? find() : find;
        var value = derive(base, f, build(f));
        Object.defineProperty(T, route, { enumerable: true, configurable: true, writable: true, value: value });
        return value;
      }
    });
    derivations.push({ route: route, base: base, find: function () { return typeof find === 'function' ? find() : find; }, build: build });
  }

  // task/approval-exact: the base card without the task-wide choice. Approve once names the exact action.
  var EXACT_BUTTON = '<button type="button" class="hd-btn hd-btn--secondary">Approve for this task</button>';
  lazy('task/approval-exact', 'task/approval', EXACT_BUTTON, function () { return ''; });

  function settledTask(route, result) {
    lazy(route, 'task/approval-exact', function () { return cardIn('task/approval-exact', TASK_OPEN, TASK_END); }, function (card) { return settle(card, result); });
  }
  settledTask('task/approval-stale', DECIDED.stale);
  settledTask('task/approval-expired', DECIDED.expiredOverride);
  settledTask('task/approval-answered-elsewhere', DECIDED.answeredMonitor);
  settledTask('task/approval-refused', DECIDED.refused);
  settledTask('task/approval-uncertain', DECIDED.uncertain);

  function settledNeeds(route, open, result) {
    var end = '</section>';
    lazy(route, 'needs-you/waiting', function () { return cardIn('needs-you/waiting', open, end); }, function (card) { return settle(card, result); });
  }
  settledNeeds('needs-you/approval-stale', NEEDS_FIRST, DECIDED.stale);
  settledNeeds('needs-you/approval-expired', NEEDS_FIRST, DECIDED.expiredUnanswered);
  settledNeeds('needs-you/answered-elsewhere', NEEDS_FIRST, DECIDED.answeredCaller);
  settledNeeds('needs-you/checkpoint-stale', NEEDS_SECOND, DECIDED.checkpointStale);

  function settledMenu(route, result) {
    lazy(route, 'menu-bar/busy', function () {
      var base = T['menu-bar/busy'], from = base.indexOf(MENU_FIRST), to = base.indexOf('</div>\n        </div>', base.indexOf('hd-approval__actions', from));
      if (from < 0 || to < 0) throw new Error('Approval card not found in menu-bar/busy');
      return base.slice(from, to + '</div>\n        </div>'.length);
    }, function (card) { return settle(card, result); });
  }
  settledMenu('menu-bar/approval-stale', DECIDED.stale);
  settledMenu('menu-bar/answered-elsewhere', DECIDED.answeredCaller);

  var PLAIN = 'Provisional · not approved';
  var GAP = 'Provisional · not approved · contract gap open';
  // [family, id, group, title, description, approval note, guide]
  var ROWS = [
    ['task', 'approval-exact', 'Status', 'Waiting for approval, exact action',
      'An approval card that offers Approve once and Reject. Each approval covers one exact action, so the task-wide choice is gone.', PLAIN,
      '<p>Each approval covers one exact action: the response scope is <code>exact_action_once</code> and responding never installs a reusable grant (<code>harness-permissions.md</code>, fixture <code>ctl-approval-get-claude-bash.json</code>). This is the drafted reading of the exact-action decision; the owner confirms it. It replaces <a href="#task/approval">Waiting for approval</a> once approved.</p>'],
    ['task', 'approval-stale', 'Status', 'Approval no longer current',
      'The request changed after it was shown. The card offers no decision, says the response changed nothing and offers Refresh.', PLAIN,
      '<p>The typed refusal <code>not_current</code>: another identity, revision or owner generation is now current. The ledger is unchanged by the refused call, and the engine\'s rule is to refresh read-only without resubmitting (<code>contracts.md</code>, Task approval ledgers; fixture <code>ctl-approval-error-not-current.json</code>).</p>'],
    ['task', 'approval-expired', 'Status', 'Approval expired',
      'The request passed its deadline. The recorded decision is the caller\'s approve and the effective decision is reject, because Harflow sent a rejection.', PLAIN,
      '<p>The expired disposition with the caller\'s decision kept and an expiry rejection (fixture <code>ctl-approval-state-expired-override.json</code>; <code>harness-permissions.md</code>, Approval timeout). Delivery and the observed execution are separate facts; the execution outcome stays unknown. A rejection whose delivery is unknown is not drawn.</p>'],
    ['task', 'approval-answered-elsewhere', 'Status', 'Approval answered elsewhere',
      'Another responder answered first. The card is closed and says who answered, the decision and when.', GAP,
      '<p>The typed refusal <code>already_answered</code> with <code>answered_by</code>, <code>answer</code> and <code>answered_at</code> (fixture <code>ctl-approval-error-already-answered.json</code>). The contract names only the channel, caller or Monitor. It does not name the surface, device or person, and Monitor identity is not authenticated.</p>'],
    ['task', 'approval-refused', 'Status', 'Approval response refused',
      'The engine refused the response because the request had already settled. The card offers no decision.', PLAIN,
      '<p>The typed refusal <code>settled</code> (fixture <code>ctl-approval-error-settled.json</code>). The other typed refusals have their own lines, recorded with their sources in the decision record: expired, already answered, ownership lost, unauthorized, unsupported, undecidable and incomplete.</p>'],
    ['task', 'approval-uncertain', 'Status', 'Approval delivery uncertain',
      'The decision is recorded, delivery is unknown, and nothing is sent again.', PLAIN,
      '<p>The delivery state <code>delivery_unknown</code> with the execution outcome unknown (fixture <code>ctl-approval-state-delivery-unknown.json</code>). The engine never resends an uncertain decision.</p>'],
    ['needs-you', 'approval-stale', 'Needs you', 'Approval no longer current',
      'The first waiting request changed after it was shown. It offers no decision and offers Refresh.', PLAIN,
      '<p>The refusal <code>not_current</code>, drawn on the first card of <a href="#needs-you/waiting">Waiting items</a>. The counts and the waiting time are those of the approved state.</p>'],
    ['needs-you', 'approval-expired', 'Needs you', 'Approval expired',
      'The first waiting request passed its deadline unanswered. Harflow sent a rejection.', PLAIN,
      '<p>The expired disposition with no caller decision and an expiry rejection (fixture <code>ctl-approval-state-expired-unanswered.json</code>). The counts and the waiting time are those of the approved state.</p>'],
    ['needs-you', 'answered-elsewhere', 'Needs you', 'Approval answered elsewhere',
      'The first waiting request was answered by the caller first. The card is closed.', GAP,
      '<p>The refusal <code>already_answered</code>; the contract names only the channel. Altered fixture: responder changed to the caller; the time is the fixture\'s. The counts and the waiting time are those of the approved state.</p>'],
    ['needs-you', 'checkpoint-stale', 'Needs you', 'Checkpoint no longer current',
      'The workflow checkpoint changed after it was shown. The card offers no decision and offers Refresh.', PLAIN,
      '<p>The refusal <code>attention_checkpoint_stale</code>: the answer and grants were not applied (fixture <code>ctl-workflow-attention-stale.json</code>). It is drawn on the second card of <a href="#needs-you/waiting">Waiting items</a>.</p>'],
    ['menu-bar', 'approval-stale', 'Menu bar', 'Approval no longer current',
      'The request in the popover changed after it was shown. It offers no decision and offers Refresh.', PLAIN,
      '<p>The refusal <code>not_current</code>, drawn on the first request of <a href="#menu-bar/busy">Busy</a>.</p>'],
    ['menu-bar', 'answered-elsewhere', 'Menu bar', 'Approval answered elsewhere',
      'The request in the popover was answered by the caller first. It is closed.', GAP,
      '<p>The refusal <code>already_answered</code>; the contract names only the channel. Altered fixture: responder changed to the caller; the time is the fixture\'s. Drawn on the first request of <a href="#menu-bar/busy">Busy</a>.</p>']
  ];
  H.approvalStates = ROWS.map(function (r) { return { route: r[0] + '/' + r[1], title: r[3] }; });
  ROWS.forEach(function (r) {
    var route = r[0] + '/' + r[1];
    docs[route] = '<p><strong>Provisional, not approved.</strong> Derived from an approved state by replacing one block. <a href="docs/decisions/README.md#queued-messages-and-approval-states-provisional">Decision record</a>, with the source of every line and the open gaps.</p>' + r[6] +
      '<p>Deterministic mock text; the fixture times are shown in UTC.</p>';
    H.registerState(r[0], { id: r[1], title: r[3], description: r[4], group: r[2], status: 'provisional', approvalNote: r[5] });
  });
})();
