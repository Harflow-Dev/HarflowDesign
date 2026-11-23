/* Menu bar popover states the approved popovers do not draw (runtime not ready, a failed refresh, the stages of answering a
   question inline, an engine that cannot report workflow questions, unavailable workflow status), the notification
   banners, and the notification rows of Settings → General. All are approved by the owner (2026-11-23).
   Each popover state is the approved menu-bar/busy-approve-once or menu-bar/empty template with only the blocks it
   changes replaced, by exact swap, so a changed base throws instead of silently drawing another screen; the question
   card is rebuilt from the same markup and a rebuild with the approved fixture must equal the approved card. Every
   popover state has a 1000 × 620 twin, rendered here (self-rendered, as the run question states) with the minimum
   window popover treatment (380 × 560). The notification banners are design-originated and not derived from an
   approved template. The Settings rows are settings/general with one block added or swapped. Messages quoted from the
   Mac app or the engine, and fixture and design text, are named in each guide and in
   docs/decisions/menu-bar-and-notifications.md. Templates are computed on first use. Display only: no engine calls. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.menuBarStates = H.menuBarStates || [];
  H.notificationStates = H.notificationStates || [];

  var APPROVAL = { by: 'the owner', date: '2026-11-23', decision: 'Menu bar and notification states' };
  var RECORD = '<a href="docs/decisions/menu-bar-and-notifications.md">Decision record</a>';
  var BUSY = 'menu-bar/busy-approve-once', EMPTY = 'menu-bar/empty', GENERAL = 'settings/general';
  var G_POPOVER = 'Menu bar', G_MIN = 'Minimum window';

  function swap(html, find, replace, base) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + base + ': ' + find.slice(0, 60));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + find.slice(0, 60));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close, base) {
    var from = html.indexOf(open), to = from < 0 ? -1 : html.indexOf(close, from + open.length);
    if (from < 0 || to < 0) throw new Error('Block not found in ' + base + ': ' + open.slice(0, 60));
    if (html.indexOf(open, from + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + open.slice(0, 60));
    return html.slice(from, to + close.length);
  }
  function lazy(route, make) {
    Object.defineProperty(T, route, {
      enumerable: true, configurable: true,
      get: function () {
        var value = make();
        Object.defineProperty(T, route, { enumerable: true, configurable: true, writable: true, value: value });
        return value;
      }
    });
  }
  function ensureGroup(familyId, name, before) {
    var family = H.findFamily(familyId);
    if (!family.groups || family.groups.indexOf(name) >= 0) return;
    var at = family.groups.indexOf(before || 'Loading');
    family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
  }
  function icon(name, small) { return '<span class="hd-i' + (small ? ' hd-i--sm' : '') + ' hd-i-' + name + '" aria-hidden="true"></span>'; }
  function code(text) { return '<code>' + text + '</code>'; }
  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function squash(html) { return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim(); }

  // ---- Popover pieces -------------------------------------------------------------------------------------------------
  var PLUS = '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="New task"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button>';
  var PLUS_OFF = '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="New task" disabled title="Finish setting up Harflow first"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button>';
  var EMPTY_OPEN = '<div class="hd-empty" style="padding: var(--space-6) var(--space-4);">';
  var FOOTER_OPEN = '<div style="display: flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-3); border-top: 1px solid var(--border);">';
  function btn(text, kind, extra) { return '<button type="button" class="hd-btn hd-btn--' + (kind || 'secondary') + ' hd-btn--sm"' + (extra || '') + '>' + text + '</button>'; }
  function block(inner) { return '<div class="hd-mb-block">' + inner + '</div>'; }
  function subline(text, cls) { return '<p class="hd-mb-subline' + (cls ? ' ' + cls : '') + '">' + text + '</p>'; }

  // The not-ready popover: the header and footer of menu-bar/empty, "+" disabled, one block in place of the empty note.
  function notReady(inner) {
    return function (html, base) {
      html = swap(html, PLUS, PLUS_OFF, base);
      var from = html.indexOf(EMPTY_OPEN), to = html.indexOf(FOOTER_OPEN);
      if (from < 0 || to < 0 || to < from || html.indexOf(EMPTY_OPEN, from + 1) >= 0) throw new Error('Empty note not found in ' + base);
      return html.slice(0, from) + inner + '\n    ' + html.slice(to);
    };
  }

  // ---- The question card ----------------------------------------------------------------------------------------------
  var ASKS = 'Nightly dependency audit asks: Upgrade pydantic to 3.x?';
  var DRAFT = 'Yes, upgrade to 3.x and keep the lockfile pinned.';
  var ANSWER_BTN = '<button type="submit" class="hd-btn hd-btn--primary hd-btn--sm">Answer</button>';
  var CARD_OPEN = '<form class="hd-approval" aria-label="Question from Nightly dependency audit">';
  function question(o) {
    o = o || {};
    return CARD_OPEN.replace('class="hd-approval"', o.result ? 'class="hd-approval hd-approval--settled"' : 'class="hd-approval"') + '<div class="hd-approval__head" style="padding: 8px 12px;"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Question</div>' +
      '<div class="hd-approval__body" style="padding: 10px 12px; gap: 8px;"><div style="font-size: 13px; line-height: 18px;">' + ASKS + '</div>' +
      (o.result ? '' : '<label class="hd-sr" for="mb-answer">Your answer</label><input id="mb-answer" class="hd-input' + (o.focus ? ' hd-mb-focus' : '') + '" type="text" placeholder="Type an answer" style="height: 28px; font-size: 12.5px;"' +
        (o.value ? ' value="' + esc(o.value) + '"' : '') + (o.disabled ? ' disabled' : '') + '>') +
      (o.error ? '<p class="hd-mb-error" role="alert">' + o.error + '</p>' : '') +
      (o.status ? '<p class="hd-mb-status" role="status">' + o.status + '</p>' : '') + '</div>' + (o.result || '') +
      (o.actions === '' ? '' : '<div class="hd-approval__actions" style="padding: 0 12px 10px;">' + (o.actions || ANSWER_BTN) + '</div>') + '</form>';
  }
  function cardOf(html, base) { return between(html, CARD_OPEN, '</form>', base); }
  // The settled result block of the approved cards (screens-approval-states.js): a title and lines, no glyph, no colour.
  function result(title, lines) {
    return '<div class="hd-approval__result hd-approval__result--compact" role="status">' + (title ? '<p class="hd-approval__result-title">' + esc(title) + '</p>' : '') +
      lines.map(function (line) { return '<p>' + esc(line) + '</p>'; }).join('') + '</div>';
  }
  var AT = 'Oct 14, 2026, 5:46 PM';
  // The app's settled note for an accepted question (NeedsYouPresentation.swift:204-212); the run title is fixture text.
  var SETTLED_NOTE = 'Nightly dependency audit no longer needs you.';
  var SAVED = ['Your saved draft', DRAFT];
  var OPEN_BTN = btn('Open');
  function withCard(o) {
    return function (html, base) { return swap(html, cardOf(html, base), question(o), base); };
  }

  // ---- Definitions ----------------------------------------------------------------------------------------------------
  var DEFS = [];
  function def(o) { DEFS.push(o); }

  def({
    id: 'runtime-setup', base: EMPTY,
    title: 'Runtime setup needed',
    description: 'The runtime is not installed or needs an update: "+" is disabled and one card sends the person to the Harflow window with Open Harflow.',
    build: notReady(block(subline('Runtime setup required') +
      '<p class="hd-mb-text">Finish setting up Harflow to see your work.</p><div>' + btn('Open Harflow', 'primary') + '</div>')),
    guide: 'The not-ready popover for an install or update that is required. The app shows the red list error where the sections would be and keeps "+" ignored (the coordinator drops a new-task request while the runtime is not ready); the subline, the card and Open Harflow are design wording, and the disabled "+" is a design choice. Setup happens in the window, so the action opens it (owner answer 2: Open Harflow, not a direct Install or Retry). The sections are hidden. Derived from <a href="#menu-bar/empty">Nothing running</a>.'
  });
  def({
    id: 'runtime-preparing', base: EMPTY,
    title: 'Runtime being prepared',
    description: 'The runtime is being checked, installed or updated: the popover says so with the app\'s own words and "+" is disabled.',
    build: notReady(block(subline('Runtime setup in progress') +
      '<p class="hd-mb-text hd-mb-text--strong">Preparing Harflow runtime…</p><p class="hd-mb-text">Preparing the exact paired runtime. This can take a few minutes.</p>')),
    guide: 'The preparation progress of the managed runtime. The title and the second line are the app\'s own install banner wording (MenuBarVM.swift:515-523, an install stage); the app\'s banner shows a busy indicator (<code>isBusy: true</code>, MenuBarVM.swift:475); leaving the spinner out is a deliberate departure, not parity, because the approved runtime states draw none and the runtime words are not task statuses. The subline is design wording.'
  });
  def({
    id: 'runtime-failed', base: EMPTY,
    title: 'Runtime setup failed',
    description: 'Preparing the runtime did not finish: the popover gives the app\'s message and the failure, and offers Open Harflow.',
    build: notReady(block(subline('Runtime setup failed', 'hd-mb-subline--error') +
      '<p class="hd-mb-text hd-mb-text--strong">Harflow runtime preparation failed</p><p class="hd-mb-text">The managed runtime is unavailable. Try again to prepare it.</p>' +
      '<p class="hd-mb-error" role="alert">Package verification failed. No replacement was activated.</p><div>' + btn('Open Harflow', 'primary') + '</div>')),
    guide: 'A failed preparation or update. The title and the detail are the app\'s install banner wording (MenuBarVM.swift:455-523) and the failure line is fixture text; the app offers "Try again" here, and Open Harflow is design wording (owner answer 2, an app change). The subline is design wording.'
  });
  def({
    id: 'engine-call-failed', base: BUSY,
    title: 'Work could not be refreshed',
    description: 'A call to the runtime failed while the popover has work: a red dot, a line naming the failure and Retry; the last known rows stay.',
    build: function (html, base) {
      html = swap(html, '<span class="caption" style="flex: 1;">3 running</span>', '<span class="hd-mb-dot" role="img" aria-label="Harflow runtime error"></span><span class="caption" style="flex: 1;">3 running</span>', base);
      var note = '<div class="hd-mb-note" role="status"><div><p class="hd-mb-text hd-mb-text--strong">Couldn\'t refresh your work</p><p class="hd-mb-text">' + code('harflow-ctl task-list-page') + ' exited 1 without a JSON answer.</p></div>' + btn('Retry', 'ghost') + '</div>';
      return swap(html, '<section aria-label="Needs you"', note + '\n    <section aria-label="Needs you"', base);
    },
    guide: 'A failed list call in the popover. The app shows the failure as the red dot of the status item and a red list error; the dot is the app\'s, the line naming the command is the app\'s message for an unreadable answer (fixture command and exit code) and the note title and Retry are design wording. The same drawing stands for a runtime that refuses the contract version or a call that timed out: only the message differs ("<code>harflow-ctl</code> answered with contract version 2; this app understands version 1. …", "<code>harflow-ctl task-list-page</code> did not answer within 30 s."). Derived from <a href="#menu-bar/busy-approve-once">Busy, approve once</a>.'
  });

  // Question answering
  def({
    id: 'question-typing', base: BUSY,
    title: 'Question · Typing an answer',
    description: 'The question card with an answer typed in the field; Answer is available.',
    build: withCard({ value: DRAFT, focus: true }),
    guide: 'The approved question card with text in the field. In the app today Answer opens the Needs you item (<code>MenuBarNeedsYou.swift</code>); answering in the popover is the approved design and an app change (owner answer 3). The button label is the approved "Answer".'
  });
  def({
    id: 'question-submitting', base: BUSY,
    title: 'Question · Submitting',
    description: 'The answer is being sent: the field is disabled and the button reads Submitting….',
    build: withCard({ value: DRAFT, disabled: true, actions: '<button type="submit" class="hd-btn hd-btn--primary hd-btn--sm" disabled>Submitting…</button>', status: 'Submitting your answer to the Harflow runtime…' }),
    guide: 'The submit state of the Needs you card (NeedsYouDetailView.swift:116, :194): "Submitting…" is the app\'s word and "Submitting your answer to the Harflow runtime…" is the app\'s "Submitting your answer to the engine…" with "engine" changed to "runtime" (owner answer 5 of the engine and runtime states), here on the approved popover card.'
  });
  def({
    id: 'question-answered', base: BUSY,
    title: 'Question · Answered',
    description: 'The runtime accepted the answer: the card says Answered and shows the answer; the row leaves on the next refresh.',
    build: withCard({ result: result('Answered', [DRAFT, SETTLED_NOTE]), actions: '' }),
    guide: 'An accepted answer (<code>NeedsYouQuestion.swift</code>: the card settles with the decision "Answered" and the answer). The card has no action and leaves the list when the popover refreshes.'
  });
  def({
    id: 'question-already-answered', base: BUSY,
    title: 'Question · Already answered',
    description: 'Another responder answered first: the card names who, shows their answer and the time, and keeps the draft.',
    build: withCard({ result: result('Already answered by the caller', ['Hold at 2.x until the lockfile review is done.', AT].concat(SAVED)), actions: '' }),
    guide: 'The engine reports the winner of the race (<code>interaction_already_answered</code>); the app shows "Already answered by the caller" or "Answered in Harflow", the answer (with "Answer excerpt · " before the time when shortened), the time, and "Your saved draft" (NeedsYouQuestion.swift:143-152). The answer and the time are fixture text (a mock time, not converted).'
  });
  def({
    id: 'question-stale', base: BUSY,
    title: 'Question · No longer current',
    description: 'The request changed after it was shown: the card says so, offers no answer and offers Open.',
    build: withCard({ result: result('', ['This request changed. Review it again.'].concat(SAVED)), actions: OPEN_BTN }),
    guide: 'The refusal <code>attention_checkpoint_stale</code>, which the app classifies as <code>.stale</code> with the changed message (NeedsYouModels.swift:223, :235) and settles through the shared failed and stale branch (NeedsYouQuestion.swift:158-166). The read-only path is drawn: the message and "Your saved draft". When the request is still observed, the app instead shows the message as an error under the field and keeps the draft in the field. A workflow error of the moved-on kind takes the same branch; only the message text differs. Open is the app\'s link on the row.'
  });
  def({
    id: 'question-failed', base: BUSY,
    title: 'Question · Answer failed',
    description: 'The answer could not be sent: the failure shows under the field, Answer stays and Open in Harflow is offered.',
    build: withCard({ value: DRAFT, error: code('harflow-ctl workflow-resume') + ' exited 1 without a JSON answer.', actions: ANSWER_BTN + btn('Open in Harflow', 'ghost') }),
    guide: 'A failed answer that is still current: the card keeps the draft and shows the message (NeedsYouQuestion.swift:158-165). The message is the app\'s unreadable-answer form (fixture command and exit code); a refusal shows its message there and its code on a detail line (owner answer 6 of the engine and runtime states; the app prints "&lt;message&gt; (&lt;code&gt;)" today). Open in Harflow is design wording.'
  });
  def({
    id: 'question-unknown', base: BUSY,
    title: 'Question · Delivery unknown',
    description: 'The popover could not confirm that the answer was received: it says so, keeps the draft and sends the person to Needs you.',
    build: withCard({ value: DRAFT, disabled: true, status: 'Harflow couldn\'t confirm your answer was received. Open Needs you to check.', actions: btn('Open Needs you') }),
    guide: 'Design wording and an app change (owner answer 4: a delivery of unknown outcome is a state): the app has no unknown outcome for a question (only approvals have "Delivery is unknown. The decision will not be retried."), and a question is never sent again by itself. This drawing keeps that rule: the card does not offer to send again.'
  });
  def({
    id: 'question-caller-returned', base: BUSY,
    title: 'Question · Caller answering again',
    description: 'The caller took the question back: the card says the caller is answering it again and keeps the draft.',
    build: withCard({ result: result('', ['The caller is answering this again.'].concat(SAVED)), actions: OPEN_BTN }),
    guide: 'A workflow error ending "; caller is alive" (NeedsYouModels.swift:243-246): the app shows "The caller is answering this again." and keeps "Your saved draft".'
  });
  def({
    id: 'needs-you-unsupported', base: BUSY,
    title: 'Needs you · Questions unsupported',
    description: 'A runtime that cannot report workflow questions: only the task approval stays, with the app\'s line below it.',
    build: function (html, base) {
      html = swap(html, cardOf(html, base), '<p class="hd-mb-text hd-mb-text--primary">This Harflow runtime version cannot report workflow questions here.</p>', base);
      return swap(html, 'Needs you <span class="hd-section__count">2</span>', 'Needs you <span class="hd-section__count">1</span>', base);
    },
    guide: 'An engine that reports no workflow inputs (MenuBarNeedsYou.swift:142-145): the section keeps the task approval and the app\'s line with "engine" changed to "runtime" (owner answer 5 of the engine and runtime states; the app says "This engine version cannot report workflow questions here." today). The count falls to the one approval. Derived from <a href="#menu-bar/busy-approve-once">Busy, approve once</a>.'
  });
  def({
    id: 'workflow-status-unavailable', base: BUSY,
    title: 'Workflows · Status unavailable',
    description: 'The workflow refresh failed: a Workflows section says Workflow status unavailable; the rest of the popover is unchanged.',
    build: function (html, base) {
      var section = '<section aria-label="Workflows" style="padding: 0 var(--space-2) var(--space-1);"><div class="hd-section__head">Workflows</div><p class="hd-mb-text hd-mb-text--primary hd-mb-indent">Workflow status unavailable</p></section>';
      return swap(html, '<section aria-label="Recent"', section + '\n    <section aria-label="Recent"', base);
    },
    guide: 'Any failure of the workflow refresh (WorkflowMenuBarStatusVM.swift:152): the section label "Workflows" and the line "Workflow status unavailable" are the app\'s. The approved popover draws no Workflows section; it appears here only for this state. The workflow row of the popover shows its elapsed time (owner answer 5; see the record). Derived from <a href="#menu-bar/busy-approve-once">Busy, approve once</a>.'
  });

  // ---- Settings → General: notification permission -------------------------------------------------------------------
  var SW_FINISH = '<button type="button" class="hd-switch" role="switch" aria-checked="true" aria-label="Notify when a task finishes"></button>';
  var SW_NEEDS = '<button type="button" class="hd-switch" role="switch" aria-checked="true" aria-label="Notify when a request needs you"></button>';
  var BEHAVIOUR_END = SW_NEEDS + '</div></section>';
  var HR = '<hr style="border: 0; border-top: 1px solid var(--border); margin: 0;">';
  function permissionRow(title, detail, action) {
    return HR + '<div class="hd-form-row" style="min-height: 40px;"><div class="hd-form-row__label">' + title + '<span class="hd-form-row__hint">' + detail + '</span></div>' + (action || '') + '</div>';
  }
  function settingsRow(o) {
    return function (html, base) {
      if (o.off) {
        html = swap(html, SW_FINISH, SW_FINISH.replace('></button>', ' disabled></button>'), base);
        html = swap(html, SW_NEEDS, SW_NEEDS.replace('></button>', ' disabled></button>'), base);
        return swap(html, SW_NEEDS.replace('></button>', ' disabled></button>') + '</div></section>', SW_NEEDS.replace('></button>', ' disabled></button>') + '</div>' + o.row + '</section>', base);
      }
      return swap(html, BEHAVIOUR_END, SW_NEEDS + '</div>' + o.row + '</section>', base);
    };
  }
  var SETTINGS = [
    ['notifications-not-requested', 'Notifications · Not asked yet', 'Settings before the first notification: a row says macOS asks the first time Harflow sends one.',
      { row: permissionRow('Notifications', 'macOS asks the first time Harflow sends a notification.') },
      'The notification permission row of <a href="#settings/general">General</a> before macOS has been asked. The app requests the permission at the first delivery and reads no status today (NotificationCentering.swift, FinishNotifierImpl.swift:37); the row and its wording are design wording, and reading the status is an app change.'],
    ['notifications-denied', 'Notifications · Off in System Settings', 'Notifications are off for Harflow in System Settings: the row says so and opens System Settings, and the two switches show they have no effect.',
      { off: true, row: permissionRow('Notifications', 'Notifications are off for Harflow in System Settings. The two switches above have no effect until you allow them.', btn('Open System Settings')) },
      'Notifications denied in macOS. The app drops a notification silently when it is denied. The row, its wording and Open System Settings are design wording (an app change: read the status and link to System Settings); the two switches are disabled to show they have no effect.'],
    ['notifications-allowed', 'Notifications · Allowed', 'Notifications are allowed for Harflow: the row says so and the switches decide what is sent.',
      { row: permissionRow('Notifications', 'Notifications are allowed for Harflow.') },
      'Notifications allowed in macOS. The row and its wording are design wording.'],
    ['notifications-unavailable', 'Notifications · Runtime missing a feature', 'The runtime cannot report interactions, so notifications are off: one sentence under the switches, which are disabled.',
      { off: true, row: permissionRow('Notifications', 'This Harflow runtime can\'t send notifications. Update Harflow to use it.') },
      'A runtime that does not advertise <code>interaction-events.v1</code>. With the legacy notifiers removed (owner N2) there is no fallback, so notifications are off. Design-originated, not derived from an approved state; it uses the one-sentence pattern of the <a href="docs/decisions/engine-and-runtime.md">engine and runtime record</a>, approved with the owner\'s answer 7.']
  ];
  SETTINGS.forEach(function (s) {
    def({
      family: 'settings', id: s[0], group: 'Notifications', base: GENERAL,
      title: s[1], description: s[2], build: settingsRow(s[3]), guide: s[4], plain: true
    });
  });

  // ---- Notification banners -------------------------------------------------------------------------------------------
  var BANNERS = [
    ['Done: Add retry budget to delivery queue', 'Completed in 12m.', 'now'],
    ['Failed: Migrate events.jsonl reader', 'The run ended with an error.', '1m ago'],
    ['Approval: Fix flaky slot release test', 'pytest tests/test_slots.py -k release', '2m ago'],
    ['Question: Nightly dependency audit', 'Upgrade pydantic to 3.x?', '3m ago'],
    ['Recovery: Release checklist', 'Implementation reached its attempt limit.', '5m ago']
  ];
  function banner(b) {
    return '<article class="hd-nt-banner" aria-label="' + esc(b[0]) + '"><span class="hd-brand__mark hd-nt-icon" aria-hidden="true"></span>' +
      '<div class="hd-nt-text"><div class="hd-nt-head"><span class="hd-nt-title">' + esc(b[0]) + '</span><span class="hd-nt-time">' + b[2] + '</span></div><div class="hd-nt-body">' + esc(b[1]) + '</div></div></article>';
  }
  T['notifications/banners'] = '<div class="hd-app hd-nt-desktop" data-theme="{{theme}}" style="width: 100%; height: 800px; background: var(--bg-sidebar); flex-direction: column;">\n' +
    '  <div style="height: 28px; flex: none; display: flex; align-items: center; justify-content: flex-end; gap: var(--space-3); padding: 0 var(--space-3); background: var(--surface); border-bottom: 1px solid var(--border);">' +
    '<span class="caption hd-faint" style="margin-right: auto;">Harflow</span><span class="caption">Tue 14:32</span></div>\n' +
    '  <div class="hd-nt-stack" role="list" aria-label="Notifications">' + BANNERS.map(function (b) { return '<div role="listitem">' + banner(b) + '</div>'; }).join('') + '</div>\n</div>\n';
  docs['notifications/banners'] = '<p><strong>Approved by the owner · 2026-11-23.</strong> Five macOS notification banners as Harflow posts them, with no action buttons (owner N1): a click opens the task for a finished or failed task and the Needs you item for an approval, a question or a recovery. The titles are the app\'s (<code>InteractionEventNotifier.swift:143-152</code>): "Done: &lt;title&gt;", "Failed: &lt;title&gt;", "Approval: &lt;title&gt;", "Question: &lt;title&gt;" and "Recovery: &lt;title&gt;"; the thread is <code>harflow-interactions</code>; the body is the first 512 characters. The bodies, times and titles are fixture text. The banner chrome is a browser approximation of the system banner. This is a design-originated specimen, not derived from an approved template, and it is not drawn at 1000 × 620 (owner answer 6). ' + RECORD + '.</p>';
  H.notificationStates.push('notifications/banners');

  // ---- Registration -------------------------------------------------------------------------------------------------------
  var checked = false;
  function checkBases() {
    if (checked) return;
    var rebuilt = squash(question());
    var approved = squash(cardOf(T[BUSY], BUSY));
    if (rebuilt !== approved) throw new Error('The question card no longer matches menu-bar/busy-approve-once');
    checked = true;
  }
  function resize(html, base) { return swap(html, 'width: 100%; height: 800px;', 'width: 1000px; height: 620px;', base); }
  ensureGroup('settings', 'Notifications');
  DEFS.forEach(function (d) {
    var family = d.family || 'menu-bar', route = family + '/' + d.id, base = d.base;
    function make() {
      checkBases();
      var html = T[base];
      if (typeof html !== 'string') throw new Error('No template ' + base);
      return d.build(html, base);
    }
    // The 1280 × 800 specimen shows the popover at its natural height inside the frame: when the added blocks make it taller
    // than the frame it scrolls, with its parts kept whole. The 1000 × 620 twin is the 380 × 560 popover of the minimum window.
    function capped() {
      var html = make();
      if (d.plain) return html;
      html = swap(html, '<section aria-label="Harflow menu" style=', '<section class="hd-mb-capped" aria-label="Harflow menu" style=', base);
      return swap(html, 'overflow: hidden; display: flex; flex-direction: column;">', 'overflow-y: auto; max-height: calc(100% - 12px); display: flex; flex-direction: column;">', base);
    }
    lazy(route, capped);
    docs[route] = '<p><strong>Approved by the owner · 2026-11-23.</strong> ' + d.guide + ' ' + RECORD + '.</p>';
    var state = { id: d.id, title: d.title, description: d.description, status: 'approved', approval: APPROVAL, group: d.group || G_POPOVER };
    if (d.plain) { H.notificationStates.push(route); H.registerState(family, state); return; }
    H.menuBarStates.push(route, route + '-minimum');
    H.registerState(family, state);
    lazy(route + '-minimum', function () { return resize(make(), base); });
    docs[route + '-minimum'] = '<p><strong>Approved by the owner · 2026-11-23.</strong> The same state in the minimum window (1000 × 620): the popover is 380 points wide and 560 points tall, its header and footer stay fixed and the sections between them scroll. ' + RECORD + '.</p>';
    H.registerState(family, {
      id: d.id + '-minimum', title: d.title + ' · 1000 × 620', description: d.description + ' Drawn in the minimum window.',
      status: 'approved', approval: APPROVAL, group: G_MIN, specimenSize: '1000 × 620',
      source: { renderer: 'menuBarPopover', mount: d.id + '-minimum' }
    });
  });
  H.registerState('notifications', {
    id: 'banners', title: 'Notification banners',
    description: 'The five banners Harflow posts for finished and failed tasks and for approvals, questions and recoveries, with no action buttons.',
    status: 'approved', approval: APPROVAL
  });

  H.RENDERERS.menuBarPopover = { api: 'menuBarPopover', wrapper: 'hdc-specimen' };
  // The twin is a template; the mount adds the minimum window popover treatment to the rendered frame and removes it again.
  H.menuBarPopover = {
    mount: function (root) {
      root.classList.add('hdc-specimen--minimum');
      H.applyMinimum(root, ['popover']);
      return function () {
        H.clearMinimum(root);
        root.classList.remove('hdc-specimen--minimum', 'hdc-min-popover');
      };
    }
  };
})();
