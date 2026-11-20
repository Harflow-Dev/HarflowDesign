/* Workflow run drawings that answer four questions about the Mac app: the run top bar, the right pane of the Parallel
   and Graph views, the held states of an orchestrator conversation, and the message locks of settled and unsupported
   runs. The owner decided the four questions on 2026-11-20 and approved the drawings, including the run pane toggle
   (new behaviour the owner chose) and the refused-command state drawn on those answers. Each state is an approved workflow run template (graph-needs-you,
   on-demand, orchestrator-selected or parallel) with only the blocks it changes replaced, by exact swap, so a changed
   base throws instead of silently drawing another screen. Every state also has a 1000 × 620 twin, rendered here (the
   same self-rendered form as the workflow question states) with the existing sidebar, canvas, lanes and top bar meta
   treatments of the minimum window. Templates are computed on first use, so the base screens and the lane parts load in
   any order. Messages, reasons and the held-conversation wording are fixture or design text and are named as such in
   each guide. Decision records: docs/decisions/run-top-bar.md, parallel-run-pane.md, orchestrator-steering-held.md,
   run-message-locks.md. Display only: no engine calls. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.runQuestionStates = H.runQuestionStates || [];

  var FAMILY = 'workflow-run';
  var NEEDS_YOU = FAMILY + '/graph-needs-you';
  var ON_DEMAND = FAMILY + '/on-demand';
  var ORCHESTRATOR = FAMILY + '/orchestrator-selected';
  var PARALLEL = FAMILY + '/parallel';
  var NOTE = 'Provisional · not approved';
  // The owner's decisions of 2026-11-20 (relayed by the coordinator after the drawings were seen), named as the records are.
  var DECIDED = '2026-11-20';
  function approval(decision) { return { by: 'the owner', date: DECIDED, decision: decision }; }
  var A_TOPBAR = approval('Run top bar'), A_PANE = approval('Run pane'), A_STEER = approval('Orchestrator conversation'), A_LOCKS = approval('Run message locks');

  var G_TOPBAR = 'Run top bar', G_PANE = 'Run pane', G_STEER = 'Messages and goal', G_LOCKS = 'Run message locks', G_MIN = 'Minimum window';

  // ---- Fixture and design text -----------------------------------------------------------------------------------
  var STARTED = 'Run started 02:00 · HarflowMCP';
  var ELAPSED = '06:31';
  // The engine text of the monitor control for Resume while no actionable checkpoint is recorded (trimmed at the clause).
  var RESUME_REASON = 'No qualified actionable checkpoint is available; refresh the workflow.';
  var EARLIER_ASK = 'Skip the docs checker for this run; the docs did not change.';
  var EARLIER_ANSWER = 'Understood. I will not call Docs checker in this run.';
  var OPEN_ASK = 'Run the security reviewer again after the pull request opens.';
  var OPEN_ANSWER = 'I will call Security reviewer again once the pull request is open.';
  var QUEUED_TEXT = 'Also list which advisories have a fixed version.';
  // Fixture text for the engine's refusal reason of a command the orchestrator could not carry out (role_command_invalid).
  var REFUSED_ASK = 'Replace the Security reviewer with a custom checker.';
  var REFUSED_REASON = 'The request could not be applied to the current run.';
  var REFUSED_CAPTION = 'The orchestrator couldn\'t carry out that request. Reply to continue.';
  var GOAL = 'Upgrade the three vulnerable dependencies with all tests passing, and open one pull request with the lockfile changes.';
  var REQUEST = 'Audit the dependencies of HarflowMCP, upgrade the vulnerable ones with all tests passing, and open one pull request.';
  var TECHNICAL = 'Scan both lockfiles in parallel, then draft one pull request with the upgrades.';
  var LOCK_COMPLETE = 'Messages are off — this run is complete';
  var LOCK_CANCELLING = 'Messages are off — this run is cancelling';
  var LOCK_CANCELLED = 'Messages are off — this run was cancelled';

  // ---- Canonical glyphs and badges (terminology.md; no new glyphs) ------------------------------------------------
  var G = {
    running: '<span class="hd-glyph hd-glyph--running" aria-label="Running"></span>',
    done: '<span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span>',
    cancelled: '<span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span>',
    attention: '<span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span>',
    paused: '<span class="hd-glyph" aria-label="Paused"><span class="hd-i hd-i--sm hd-i-pause" aria-hidden="true"></span></span>',
    pending: '<span class="hd-glyph hd-glyph--queued" aria-label="Pending"></span>'
  };
  var BADGE_ATTENTION = '<span class="hd-badge hd-badge--attention"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you</span>';
  var BADGE_RUNNING = '<span class="hd-badge hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Running</span>';
  var BADGE_PAUSED = '<span class="hd-badge hd-badge--warning"><span class="hd-i hd-i--sm hd-i-pause" aria-hidden="true"></span>Paused</span>';
  var BADGE_CANCELLING = '<span class="hd-badge hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Cancelling</span>';
  var BADGE_CANCELLED = '<span class="hd-badge"><span class="hd-i hd-i-stop" aria-hidden="true"></span>Cancelled</span>';
  var BADGE_DONE = '<span class="hd-badge hd-badge--done"><span class="hd-i hd-i-check" aria-hidden="true"></span>Done</span>';

  // ---- Swap helpers ----------------------------------------------------------------------------------------------
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
  function icon(name) { return '<span class="hd-i hd-i--sm hd-i-' + name + '" aria-hidden="true"></span>'; }

  var HOST_OPEN = '<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">';
  // The frame hosts the queue styles (messages-screen.css), as the approved lane states do.
  function host(html, base) {
    return swap(html, HOST_OPEN, '<div class="hd-app hd-msgq-host" data-theme="{{theme}}" style="width: 100%; height: 800px;">', base);
  }

  var PAUSE = '<button type="button" class="hd-btn hd-btn--ghost"><span class="hd-i hd-i--sm hd-i-pause" aria-hidden="true"></span> Pause</button>';
  var CANCEL_GHOST = '<button type="button" class="hd-btn hd-btn--ghost">Cancel run</button>';
  var CANCEL_SECONDARY = '<button type="button" class="hd-btn hd-btn--secondary">Cancel run</button>';
  var MORE_BUTTON = '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button>';
  var META_STEP = '<span class="hd-topbar__meta">Step 2 of 4 · 06:31</span>';
  var ROW_NEEDS_YOU = '<span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span>';
  var ROW_ACTIVE_OPEN = '<a class="hd-task-row is-active" href="#workflow-run/graph-needs-you">';

  function metaLine(html, text, base) {
    return swap(html, META_STEP, '<span class="hd-topbar__meta">' + text + '</span>', base);
  }
  function rowMeta(html, text, base) {
    return swap(html, '<span class="hd-task-row__meta">2/4</span>', '<span class="hd-task-row__meta">' + text + '</span>', base);
  }

  // The run leaves Running and becomes the first Recent work row, as the approved cancelled lane state does it.
  function endRunSidebar(html, key, glyph, from, to, base) {
    var running = between(html, ROW_ACTIVE_OPEN, '</a>', base);
    html = swap(html, running, '', base);
    html = swap(html, '<div class="hd-section__head">Running <span class="hd-section__count">' + from + '</span></div>', '<div class="hd-section__head">Running <span class="hd-section__count">' + to + '</span></div>', base);
    var recentOpen = '<div class="hd-section__head">Recent work</div>\n      <div class="hd-section__list">\n';
    var row = '        <a class="hd-task-row hd-task-row--done is-active" href="#' + key + '">' + glyph + '<span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">1m</span></a>\n';
    return swap(html, recentOpen, recentOpen + row, base);
  }
  // A paused run keeps its Running row; its glyph is the paused one, as the approved recovery state draws it.
  function pausedRow(html, base) {
    return swap(html, ROW_NEEDS_YOU, G.paused + '<span class="hd-task-row__title">Nightly dependency audit</span>', base);
  }

  // ---- Right pane toggle -----------------------------------------------------------------------------------------
  // The Mac run view has no toggle for its run sidebar (its split keeps a 220 point minimum); the task screen's right pane
  // toggle is the one the app draws (TaskDetailToolbar.swift, sidebar.right icon, label and help "Hide right pane" /
  // "Show right pane"). It sits at the right end of the top bar, where the task screen draws it.
  function paneToggle(open) {
    var label = open ? 'Hide right pane' : 'Show right pane';
    return '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm hd-rq-toggle' + (open ? ' is-active' : '') + '" aria-pressed="' + (open ? 'true' : 'false') + '" aria-label="' + label + '" title="' + label + '"><span class="hd-i hd-i-panel-right" aria-hidden="true"></span></button>';
  }

  // ---- Pane pieces -----------------------------------------------------------------------------------------------
  function pane(o) {
    return '<aside class="hd-pane" style="width: ' + (o.width || 460) + 'px;" aria-label="' + o.label + '">\n' +
      '<div class="hd-pane__head"><span class="hd-topbar__title">' + o.title + '</span>' + (o.caption ? '<span class="caption hd-faint">' + o.caption + '</span>' : '') + '<span class="hd-topbar__spacer"></span>' + (o.close === false ? '' : '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Close"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></button>') + '</div>\n' +
      '<div class="hd-scroll" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4);">' + o.body + '</div>' +
      (o.composer ? '\n<div style="flex:none;padding:var(--space-3);border-top:1px solid var(--border);">' + o.composer + '</div>' : '') + '</aside>';
  }
  function replacePane(html, base, o) {
    return swap(html, between(html, '<aside class="hd-pane"', '</aside>', base), pane(o), base);
  }
  function composer(o) {
    var off = !!o.locked;
    return '<form class="hd-composer" aria-label="' + o.label + '" style="padding:var(--space-2) var(--space-2) var(--space-2) var(--space-3);flex-direction:row;align-items:center;">' +
      (off ? '<span class="hd-i hd-i--sm hd-i-lock" aria-hidden="true"></span>' : '') +
      '<label class="hd-sr" for="' + o.id + '">' + o.label + '</label>' +
      '<textarea id="' + o.id + '" class="hd-composer__input" rows="1" placeholder="' + o.placeholder + '"' + (off ? ' disabled' : '') + ' style="min-height:' + (off ? 40 : 24) + 'px;"></textarea>' +
      '<button type="submit" class="hd-composer__send" aria-label="' + o.send + '" disabled style="width:28px;height:28px;"><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></form>' +
      (o.note ? '<p class="caption hd-gap-composer-note">' + o.note + '</p>' : '');
  }
  var STATUS_STYLE = 'display:flex;align-items:center;gap:var(--space-2);font-size:13px;line-height:18px;color:var(--text-secondary);';
  function status(glyph, text) { return '<div style="' + STATUS_STYLE + '">' + glyph + '<span>' + text + '</span></div>'; }
  function conversation(parts) {
    return '<div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border);"><span class="hd-inspector__label">CONVERSATION</span>' + parts.join('') + '</div>';
  }
  var EARLIER = [
    '<div class="hd-msg-user">' + esc(EARLIER_ASK) + '</div>',
    '<div class="hd-msg-agent"><p>' + esc(EARLIER_ANSWER) + '</p></div>',
    '<div style="' + STATUS_STYLE + 'font-weight:500;color:var(--success);">' + G.done + '<span>Answered</span></div>'
  ];
  var HELD = EARLIER.concat(['<div class="hd-msg-user">' + esc(OPEN_ASK) + '</div>', '<div class="hd-msg-agent"><p>' + esc(OPEN_ANSWER) + '</p></div>']);
  var ORCH_COMPOSER = { id: 'msg-orchestrator', label: 'Message the orchestrator', placeholder: 'Ask or tell the orchestrator', send: 'Send to the orchestrator' };
  function orchestratorPane(lead, parts, comp) {
    return { label: 'Selected orchestrator', title: 'Orchestrator', caption: 'Always present', body: lead + conversation(parts), composer: comp };
  }
  var DISMISS_ROW = '<div class="hd-row" style="gap:var(--space-2);"><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Dismiss</button></div>';
  function heldNote(text, withDismiss, extra) {
    return '<div class="hd-rq-note" role="status"><p>' + text + '</p>' + (extra || '') + (withDismiss ? DISMISS_ROW : '') + '</div>';
  }

  // ---- Lane pieces -----------------------------------------------------------------------------------------------
  function lane(html, label, base) {
    return between(html, '<section class="hd-lane" aria-label="' + label + '"', '</section>', base);
  }
  var FOOT = /<div class="hd-lane__foot">[\s\S]*?<\/form><\/div>/;
  function locked(section, harness, slug, text) {
    if (!H.laneParts || typeof H.laneParts.composer !== 'function') throw new Error('Lane parts are not loaded');
    var form = H.laneParts.composer({ harness: harness, slug: slug }, { locked: true, placeholder: text });
    if (!FOOT.test(section)) throw new Error('Lane composer not found');
    return section.replace(FOOT, function () { return '<div class="hd-lane__foot">' + form + '</div>'; });
  }
  function lanesFrom(html, lanes, base) {
    var from = html.indexOf('<div class="hd-lanes">');
    var to = html.indexOf('\n  </main>', from);
    if (from < 0 || to < 0) throw new Error('Lanes not found in ' + base);
    if (html.indexOf('<div class="hd-lanes">', from + 1) >= 0) throw new Error('Block not unique in ' + base + ': <div class="hd-lanes">');
    return html.slice(0, from) + '<div class="hd-lanes">' + lanes + '</div>' + html.slice(to);
  }
  // The second lane of the Parallel view ends, with its working row gone.
  function settleSecond(second, glyph, word, base) {
    second = swap(second, '<span class="hd-glyph hd-glyph--running" aria-label="Running"></span><div style="flex:1', glyph + '<div style="flex:1', base);
    second = swap(second, 'Running 02:51', word + ' 02:51', base);
    second = swap(second, between(second, '<div class="hd-working">', '</span></div>', base), '', base);
    return second;
  }
  function end(kind, clock) {
    if (!H.laneParts || typeof H.laneParts.endRow !== 'function') throw new Error('Lane parts are not loaded');
    return H.laneParts.endRow(kind, clock);
  }
  function queue(list) {
    if (!H.laneParts || typeof H.laneParts.queue !== 'function') throw new Error('Lane parts are not loaded');
    return H.laneParts.queue(list);
  }

  // ---- State definitions -----------------------------------------------------------------------------------------
  // kind 'graph': the minimum twin keeps the 400 point canvas and lets the run pane narrow; 'lanes': lanes keep their floor.
  var DEFS = [];
  function def(o) { DEFS.push(o); }

  function lockRunTopbar(html, badgeFrom, badgeTo, pauseHtml, cancelHtml, base) {
    html = swap(html, badgeFrom, badgeTo, base);
    return swap(html, pauseHtml + cancelHtml, '', base);
  }

  // ---- Run top bar -----------------------------------------------------------------------------------------------
  function started(html, base) { return rowMeta(metaLine(html, STARTED, base), ELAPSED, base); }
  def({
    id: 'topbar-no-more', base: NEEDS_YOU, kind: 'graph', group: G_TOPBAR, record: 'run-top-bar',
    title: 'Run top bar · Run started line',
    description: 'The run top bar as the Mac draws it: Run started 02:00 · HarflowMCP, Pause and Cancel run, and no More actions button. The sidebar row shows the elapsed time.',
    build: function (html, base) { return swap(started(html, base), MORE_BUTTON, '', base); },
    guide: 'The Graph view of a run that needs a person, with the top bar the Mac draws for every run: the started line (when it started and the repository) instead of a step count, the Graph and Parallel switch, Pause and Cancel run, and no More actions menu. The sidebar row shows the elapsed time the other running rows show. The engine reports no step number or total, so none is drawn. Derived from <a href="#workflow-run/graph-needs-you">Graph, needs you</a>; the approved states that draw "Step 2 of 4" and "2/4" are no longer the reference for the app.'
  });

  // ---- Run pane ----------------------------------------------------------------------------------------------------
  function disclosure(label, inner) {
    return '<details class="hd-rq-disc"><summary>' + icon('chevron-right') + label + '</summary>' + inner + '</details>';
  }
  function planRow(glyph, text) { return '<li>' + glyph + '<span>' + text + '</span></li>'; }
  // The run pane in the Mac order: Original request, goal, run plan, Technical plan. The plan list is design wording.
  function runPaneOptions(rows) {
    var goal = '<div style="display:flex;flex-direction:column;gap:var(--space-2);padding-bottom:var(--space-3);border-bottom:1px solid var(--border);"><span class="hd-inspector__label">GOAL</span><p class="body" style="margin:0;">' + esc(GOAL) + '</p>' +
      '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:13px;color:var(--text-secondary);"><span class="hd-i hd-i--sm hd-i-target" aria-hidden="true"></span><span>Assessment: in progress</span></div>' +
      '<a href="#workflow-run/revise-goal" style="font-size:13px;color:var(--accent);text-decoration:none;">Revise goal…</a></div>';
    var request = disclosure('Original request', '<p class="caption hd-faint">Complete stored request</p><p class="hd-rq-quote">' + esc(REQUEST) + '</p>');
    var plan = '<div style="display:flex;flex-direction:column;gap:var(--space-2);"><span class="hd-inspector__label">RUN PLAN</span><ul class="hd-rq-plan">' + rows + '</ul></div>';
    var technical = disclosure('Technical plan', '<p class="caption hd-faint">' + esc(TECHNICAL) + '</p>');
    return { label: 'Run', title: 'Run', caption: 'Overview', close: false, width: 288, body: request + goal + plan + technical };
  }
  var LANE_PLAN = planRow(G.done, 'Scan Python deps') + planRow(G.running, 'Scan npm deps') + planRow(G.pending, 'Draft upgrade PR');
  var GRAPH_PLAN = planRow(G.done, 'Scan lockfiles') + planRow(G.done, 'Draft upgrade plan') + planRow(G.attention, 'Open pull request') + planRow(G.pending, 'Notify');
  // The Parallel view with the pane beside the lanes (which shrink and scroll), or full width when the pane is hidden. Both
  // carry the toggle and the elapsed time of the decided top bar.
  function parallelBase(html, open, base) {
    html = rowMeta(html, ELAPSED, base);
    html = swap(html, CANCEL_SECONDARY, CANCEL_SECONDARY + paneToggle(open), base);
    if (!open) return html;
    var from = html.indexOf('<div class="hd-lanes">');
    var to = html.indexOf('\n  </main>', from);
    if (from < 0 || to < 0) throw new Error('Lanes not found in ' + base);
    return html.slice(0, from) + '<div class="hd-split"><div class="hd-rq-lanes">' + html.slice(from, to) + '</div>' + pane(runPaneOptions(LANE_PLAN)) + '</div>' + html.slice(to);
  }
  def({
    id: 'parallel-run-pane', base: PARALLEL, kind: 'lanes', group: G_PANE, record: 'parallel-run-pane',
    title: 'Parallel view · Run pane',
    description: 'The Parallel view with the run pane on the right, as the Mac shows it: the original request, the goal, the run plan and the technical plan. The lanes scroll beside it, and a toggle in the top bar hides the pane.',
    build: function (html, base) { return parallelBase(html, true, base); },
    guide: 'The Mac shows its default run sidebar beside the Parallel view. The pane is 288 wide, the Mac default sidebar width, and holds the blocks of a root run with no caller approvals, in the Mac order: an Original request disclosure (collapsed; its loading and unavailable forms are the approved Original request ones), the goal block (as drawn in the Graph view), the run plan and a collapsed Technical plan disclosure. The toggle at the right end of the top bar is new behaviour: the Mac run view cannot hide its sidebar today, and the owner chose to add the toggle on 2026-11-20. It reuses the control and labels of the Mac task screen\'s right pane toggle (icon <code>sidebar.right</code>, "Hide right pane" while open, <code>TaskDetailToolbar.swift:178-185</code>). The plan list and its look are design wording; the child-run banner, Open owning orchestrator, child links and the caller approvals panel are not drawn because this run has none. The elapsed time replaces the step count in the sidebar row. Derived from <a href="#workflow-run/parallel">Parallel view</a>; the pane hidden is <a href="#workflow-run/parallel-run-pane-collapsed">Parallel view · Run pane hidden</a>.'
  });
  def({
    id: 'parallel-run-pane-collapsed', base: PARALLEL, kind: 'lanes', group: G_PANE, record: 'parallel-run-pane',
    title: 'Parallel view · Run pane hidden',
    description: 'The Parallel view with the run pane hidden: the lanes use the full width and the toggle in the top bar reads Show right pane.',
    build: function (html, base) { return parallelBase(html, false, base); },
    guide: 'The run pane hidden with the toggle: the lanes take the full width, and the toggle is in its off state with the label Show right pane. This is the approved Parallel view with the toggle added and the elapsed time in the sidebar row. Derived from <a href="#workflow-run/parallel">Parallel view</a>.'
  });
  def({
    id: 'graph-no-selection', base: NEEDS_YOU, kind: 'graph', group: G_PANE, record: 'parallel-run-pane', run: true,
    title: 'Graph view · Run pane, no step selected',
    description: 'The Graph view with no step selected: the same run pane as the Parallel view at 288 wide, the started line in the top bar and the toggle that hides the pane.',
    build: function (html, base) {
      html = swap(started(html, base), MORE_BUTTON, paneToggle(true), base);
      html = swap(html, 'hd-node hd-node--waiting is-selected"', 'hd-node hd-node--waiting"', base);
      return replacePane(html, base, runPaneOptions(GRAPH_PLAN));
    },
    guide: 'The Mac shows the default run sidebar in the Graph view while no node is selected (and the run is not on a recovery checkpoint), at the same 288 width as in the Parallel view. This drawing deselects the step of Graph, needs you and shows that pane: the original request, the goal, the run plan (the four steps of the graph) and the technical plan. The top bar is the decided one: the started line, no More actions, and the pane toggle. Selecting a step shows its own pane as <a href="#workflow-run/graph-needs-you">Graph, needs you</a> draws it, and a paused run on a checkpoint keeps its <a href="#workflow-run/recovery">recovery pane</a>. The plan list is design wording. Derived from <a href="#workflow-run/graph-needs-you">Graph, needs you</a>.'
  });

  // ---- Orchestrator conversation: held states -----------------------------------------------------------------------
  // O is the approved orchestrator-selected state; it already has the orchestrator selected. A held conversation keeps the
  // run waiting for the person, so the top bar and the sidebar row stay as that state draws them (badge Needs you).
  function paused(html, base, withPause) {
    html = swap(html, BADGE_ATTENTION, BADGE_PAUSED, base);
    html = swap(html, PAUSE, withPause || '', base);
    return pausedRow(html, base);
  }
  var NEXT_NEW = 'Your next message starts a new conversation.';
  var WAITING_STATUS = status(G.attention, 'The run is waiting for you.');
  def({
    id: 'orchestrator-steering-stale', base: ORCHESTRATOR, kind: 'graph', group: G_STEER, record: 'orchestrator-steering-held',
    title: 'Orchestrator conversation stale',
    description: 'The run moved on since the conversation started. The run needs you, a note says so, Dismiss closes the conversation, and the composer stays open to start a new one.',
    build: function (html, base) {
      var comp = Object.assign({}, ORCH_COMPOSER, { note: NEXT_NEW });
      return replacePane(html, base, orchestratorPane(WAITING_STATUS, HELD.concat([heldNote('The run moved on since this conversation started.', true)]), composer(comp)));
    },
    guide: 'The orchestrator pane while an episode is stale: its target changed (the engine marks the superseded episode stale and keeps the hold). Every held conversation draws the Needs you badge, so the top bar and the sidebar row are the ones of the other held states, with Pause and Cancel run. The engine accepts a message only to retarget, which starts a new conversation, so the composer stays open and a caption says so; Dismiss is the one action, the same Dismiss the other held states carry. All wording is design wording; the messages are fixture text. Derived from <a href="#workflow-run/orchestrator-selected">Orchestrator selected</a>.'
  });
  def({
    id: 'orchestrator-steering-expired', base: ORCHESTRATOR, kind: 'graph', group: G_STEER, record: 'orchestrator-steering-held',
    title: 'Orchestrator conversation expired',
    description: 'The conversation expired after 30 minutes. The run needs you until the conversation is dismissed or a new message starts another; Dismiss is the one action.',
    build: function (html, base) {
      var comp = Object.assign({}, ORCH_COMPOSER, { note: NEXT_NEW });
      var text = 'This conversation expired after 30 minutes. The run waits for you until you dismiss it or send a new message.';
      return replacePane(html, base, orchestratorPane(WAITING_STATUS, HELD.concat([heldNote(text, true)]), composer(comp)));
    },
    guide: 'The orchestrator pane once the episode is older than the 1800 second window of the engine, counted from when the episode was created and not from the last turn. The hold is kept until the person dismisses or retargets, and the badge is Needs you like every held state. The 30 minute figure is the engine window; the wording is design wording. Derived from <a href="#workflow-run/orchestrator-selected">Orchestrator selected</a>.'
  });
  def({
    id: 'orchestrator-steering-command-refused', base: ORCHESTRATOR, kind: 'graph', group: G_STEER, record: 'orchestrator-steering-held',
    title: 'Orchestrator conversation refused',
    description: 'The orchestrator could not carry out a request. A note says so and shows the reason, the composer stays open for a reply, and Dismiss closes the conversation.',
    build: function (html, base) {
      var parts = EARLIER.concat(['<div class="hd-msg-user">' + esc(REFUSED_ASK) + '</div>',
        heldNote(REFUSED_CAPTION, true, '<p class="caption hd-faint">Reason: ' + esc(REFUSED_REASON) + '</p>')]);
      var open = Object.assign({}, ORCH_COMPOSER, { placeholder: 'Reply to the orchestrator' });
      return replacePane(html, base, orchestratorPane(WAITING_STATUS, parts, composer(open)));
    },
    guide: 'The orchestrator pane in the engine state <code>command_refused</code>: a request of the person became a command the engine refused, the hold is kept and a reply is still allowed (<code>workflow_steering.py</code> STATES; set at <code>steering_runner.py:126</code> and <code>orchestrator_steering.py:424, 512</code>, HarflowMCP 5face8b). The composer is open as in the waiting state, Dismiss is available as in every held state and the badge is Needs you. The caption is design wording; the reason line stands for the refusal reason the engine returns (for example <code>role_command_invalid</code>) and is fixture text, as is the message. Derived from <a href="#workflow-run/orchestrator-selected">Orchestrator selected</a>.'
  });
  def({
    id: 'orchestrator-steering-dismissing', base: ORCHESTRATOR, kind: 'graph', group: G_STEER, record: 'orchestrator-steering-held',
    title: 'Orchestrator conversation dismissing',
    description: 'Dismiss was asked while the orchestrator is still working: the pane says it is waiting for running work to settle and the composer is locked.',
    build: function (html, base) {
      var locked = Object.assign({}, ORCH_COMPOSER, { locked: true, placeholder: 'Messages are off while the conversation closes' });
      return replacePane(html, base, orchestratorPane(status(G.running, 'Dismissing — waiting for running work to settle'), HELD, composer(locked)));
    },
    guide: 'The orchestrator pane for the engine state <code>dismiss_pending_settlement</code>: dismissal was requested while a turn is unsettled, so the hold stays until settlement and the conversation is then dismissed. The run status is unchanged, so the top bar is the approved one. The caption and the locked-composer wording are design wording. Derived from <a href="#workflow-run/orchestrator-selected">Orchestrator selected</a>.'
  });
  def({
    id: 'orchestrator-steering-dismissed', base: ORCHESTRATOR, kind: 'graph', group: G_STEER, record: 'orchestrator-steering-held',
    title: 'Orchestrator conversation dismissed',
    description: 'The conversation is closed and the run is parked as paused. Resume is shown disabled with the engine reason, and the composer is open to start a new conversation.',
    build: function (html, base) {
      var resume = '<button type="button" class="hd-btn hd-btn--ghost" disabled aria-describedby="rq-resume-reason"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span> Resume</button>';
      html = paused(html, base, resume);
      var reason = '<p class="caption hd-faint" id="rq-resume-reason">Resume is unavailable. ' + esc(RESUME_REASON) + '</p>';
      var comp = Object.assign({}, ORCH_COMPOSER, { note: 'Sending a message opens a new conversation.' });
      return replacePane(html, base, orchestratorPane(status(G.paused, 'Conversation dismissed') + reason, HELD, composer(comp)));
    },
    guide: 'The orchestrator pane after a dismissal. The hold is gone, so the run is no longer held and is drawn as paused, not as needing the person. The engine no longer refuses resume with <code>steering_active</code>, but dismissal parks the run without recording a checkpoint, so Resume is drawn disabled with the engine reason of the monitor control (fixture text). Whether a dismissed run should carry a resumable checkpoint is an open engine question. The wording is design wording. Derived from <a href="#workflow-run/orchestrator-selected">Orchestrator selected</a>.'
  });

  // ---- Message locks ---------------------------------------------------------------------------------------------
  def({
    id: 'lanes-completed', base: PARALLEL, kind: 'lanes', group: G_LOCKS, record: 'run-message-locks',
    title: 'Parallel view · Completed run, messages off',
    description: 'A completed run as lanes: the badge says Done, Pause and Cancel run are gone, the lanes ended and their composers are locked with the reason.',
    build: function (html, base) {
      html = host(html, base);
      html = endRunSidebar(html, FAMILY + '/lanes-completed', G.done, 3, 2, base);
      html = swap(html, BADGE_RUNNING, BADGE_DONE, base);
      html = swap(html, PAUSE + CANCEL_SECONDARY, '', base);
      var first = locked(lane(html, 'Scan Python deps', base), 'Codex', 'codex', LOCK_COMPLETE);
      var second = settleSecond(lane(html, 'Scan npm deps', base), G.done, 'Done', base);
      second = swap(second, '</div><div class="hd-lane__foot">', end('done', '02:51') + '</div><div class="hd-lane__foot">', base);
      second = locked(second, 'Claude Code', 'claude-code', LOCK_COMPLETE);
      var third = lane(html, 'Draft upgrade PR', base);
      third = swap(third, '<span class="hd-glyph hd-glyph--queued" aria-label="Pending"></span><div style="flex:1', G.done + '<div style="flex:1', base);
      third = swap(third, '>Pending </span>', '>Done 02:40</span>', base);
      var at = third.indexOf('<div class="hd-lane__body">');
      var form = H.laneParts.composer({ harness: 'Claude Code', slug: 'claude-code-pr' }, { locked: true, placeholder: LOCK_COMPLETE });
      third = third.slice(0, at) + '<div class="hd-lane__body"><div class="hd-msg-agent"><p>Opened one pull request with the three upgrades and the lockfile changes.</p></div>' + end('done', '02:40') + '</div><div class="hd-lane__foot">' + form + '</div></section>';
      return lanesFrom(html, first + second + third, base);
    },
    guide: 'A run that completed, drawn as the approved cancelled lane state is: the badge is Done, Pause and Cancel run are gone, the run is the first Recent work row, and the three lanes end done with their composers locked with the reason; the orchestrator footer line is dropped because the run is settled. The engine accepts a message to a completed run and marks it undeliverable at once; the Mac keeps the lanes open. The lock text is design wording in the form of the approved cancelled one. Derived from <a href="#workflow-run/parallel">Parallel view</a>.'
  });
  def({
    id: 'lanes-cancelling', base: PARALLEL, kind: 'lanes', group: G_LOCKS, record: 'run-message-locks',
    title: 'Parallel view · Cancelling run, messages off',
    description: 'A run that is cancelling: the badge says Cancelling, Pause and Cancel run are gone and the lane composers are locked. A message queued earlier keeps its Cancel.',
    build: function (html, base) {
      html = host(html, base);
      html = swap(html, BADGE_RUNNING, BADGE_CANCELLING, base);
      html = swap(html, PAUSE + CANCEL_SECONDARY, '', base);
      var first = locked(lane(html, 'Scan Python deps', base), 'Codex', 'codex', LOCK_CANCELLING);
      var second = lane(html, 'Scan npm deps', base);
      second = swap(second, '</div><div class="hd-lane__foot">', queue([{ kind: 'queued', text: QUEUED_TEXT }]) + '</div><div class="hd-lane__foot">', base);
      second = locked(second, 'Claude Code', 'claude-code', LOCK_CANCELLING);
      return lanesFrom(html, first + second + lane(html, 'Draft upgrade PR', base), base);
    },
    guide: 'A run in the engine status <code>cancelling</code>. Queued messages stay queued until the run is cancelled and then become undeliverable, and the engine still allows cancelling a queued message, so the bubble keeps its Cancel. The composers are locked with the approved cancelling wording of the orchestrator pane; the orchestrator footer line is dropped because the run is cancelling; the Mac leaves the lanes open. The queued message is fixture text. Derived from <a href="#workflow-run/parallel">Parallel view</a>.'
  });
  function cancelledTop(html, base, id) {
    html = swap(html, BADGE_ATTENTION, BADGE_CANCELLED, base);
    html = swap(html, PAUSE + CANCEL_GHOST, '', base);
    return endRunSidebar(html, FAMILY + '/' + id, G.cancelled, 2, 1, base);
  }
  def({
    id: 'cancelled-node-locked', base: ON_DEMAND, kind: 'graph', group: G_LOCKS, record: 'run-message-locks',
    title: 'Cancelled run · Node messages off',
    description: 'A cancelled run with an on-demand node selected: the top bar says Cancelled without Pause or Cancel run, and the node composer is locked with the reason.',
    build: function (html, base) {
      html = cancelledTop(html, base, 'cancelled-node-locked');
      var form = between(html, '<form class="hd-composer" aria-label="Message this node"', '</form>', base);
      var locked = composer({ id: 'msg-node', label: 'Message this node', placeholder: LOCK_CANCELLED, send: 'Send to Security reviewer', locked: true });
      return swap(html, form, locked, base);
    },
    guide: 'The on-demand node pane of a cancelled run. The Mac never locks a graph node composer by run status; the engine marks messages undeliverable once a run is cancelled. The lock copy is the one of the approved cancelled lane state. The canvas is the base fixture and is not redrawn for a cancelled run. Derived from <a href="#workflow-run/on-demand">On-demand nodes</a>.'
  });
  def({
    id: 'cancelled-orchestrator-locked', base: ORCHESTRATOR, kind: 'graph', group: G_LOCKS, record: 'run-message-locks',
    title: 'Cancelled run · Orchestrator messages off',
    description: 'A cancelled run with the orchestrator selected: the top bar says Cancelled and the orchestrator composer is locked with the reason.',
    build: function (html, base) {
      html = cancelledTop(html, base, 'cancelled-orchestrator-locked');
      var comp = Object.assign({}, ORCH_COMPOSER, { locked: true, placeholder: LOCK_CANCELLED });
      return replacePane(html, base, orchestratorPane(status(G.cancelled, 'The run was cancelled.'), EARLIER, composer(comp)));
    },
    guide: 'The orchestrator pane of a cancelled run: the engine refuses steering on a terminal run (<code>workflow_terminal</code>), the same lock copy as the node pane applies, and the decision line gives way to the run status. The canvas is the base fixture. Derived from <a href="#workflow-run/orchestrator-selected">Orchestrator selected</a>.'
  });
  def({
    id: 'lanes-unsupported', base: PARALLEL, kind: 'lanes', group: G_LOCKS, record: 'run-message-locks',
    title: 'Parallel view · Messages unavailable in this runtime',
    description: 'Lanes of a runtime without queued messages: each composer is disabled, with no placeholder or hint, and the disabled Send button stays.',
    build: function (html, base) {
      html = swap(html, 'placeholder="Message Codex" style="min-height:24px;"', 'placeholder="" disabled style="min-height:24px;"', base);
      return swap(html, 'placeholder="Message Claude Code" style="min-height:24px;"', 'placeholder="" disabled style="min-height:24px;"', base);
    },
    guide: 'The lanes of a run on a runtime without queued messages, in the locked form of the approved <a href="#task/message-unsupported">Messages unavailable</a> state: the input is disabled with no placeholder or hint, and the disabled Send button stays. The Mac locks only the node pane in this case and leaves lane composers open. Derived from <a href="#workflow-run/parallel">Parallel view</a>.'
  });

  // ---- Registration ------------------------------------------------------------------------------------------------
  function ensureGroup(name, before) {
    var family = H.findFamily(FAMILY);
    if (family.groups.indexOf(name) >= 0) return;
    var at = family.groups.indexOf(before);
    family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
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
  function resize(html, base) {
    return swap(html, 'width: 100%; height: 800px;', 'width: 1000px; height: 620px;', base);
  }
  var KINDS = {};
  var APPROVALS = { 'run-top-bar': A_TOPBAR, 'parallel-run-pane': A_PANE, 'orchestrator-steering-held': A_STEER, 'run-message-locks': A_LOCKS };

  [G_TOPBAR, G_PANE, G_LOCKS].forEach(function (name) { ensureGroup(name, 'Loading'); });
  ensureGroup(G_MIN, null);
  DEFS.forEach(function (d) {
    var route = FAMILY + '/' + d.id, minRoute = route + '-minimum';
    function make() {
      var html = T[d.base];
      if (typeof html !== 'string') throw new Error('No template ' + d.base);
      return d.build(html, d.base);
    }
    lazy(route, make);
    lazy(minRoute, function () { return resize(make(), d.base); });
    KINDS[d.id + '-minimum'] = { kind: d.kind, run: !!d.run };
    var record = '<a href="docs/decisions/' + d.record + '.md">Decision record</a>';
    var lead = d.provisional ? '<strong>Provisional, not approved.</strong>' : '<strong>Approved by the owner · ' + DECIDED + '.</strong>';
    docs[route] = '<p>' + lead + ' ' + d.guide + ' ' + record + '.</p>';
    docs[minRoute] = '<p>' + lead + ' The same state in the minimum window (1000 × 620), with the sidebar scrolling' +
      (d.kind === 'graph' ? ', the canvas scrolling at 400 points and the run pane narrowing to what is left (no narrower than 220 points)' : ' and the lanes keeping their 360 point floor and scrolling horizontally') +
      ', and the top bar meta shown on hover and focus. ' + record + '.</p>';
    H.runQuestionStates.push(route, minRoute);
    var status = d.provisional ? { status: 'provisional', approvalNote: NOTE } : { status: 'approved', approval: APPROVALS[d.record] };
    H.registerState(FAMILY, Object.assign({ id: d.id, title: d.title, description: d.description, group: d.group }, status));
    H.registerState(FAMILY, Object.assign({
      id: d.id + '-minimum', title: d.title + ' · 1000 × 620',
      description: d.description + ' Drawn in the minimum window.',
      group: G_MIN, specimenSize: '1000 × 620',
      source: { renderer: 'runQuestions', mount: d.id + '-minimum' }
    }, status));
  });

  H.RENDERERS.runQuestions = { api: 'runQuestions', wrapper: 'hdc-specimen' };
  // The twin is a template; the mount adds the minimum window treatments to the rendered frame and removes them again.
  H.runQuestions = {
    mount: function (root, mountId) {
      var spec = KINDS[mountId], kind = spec.kind;
      var fixes = kind === 'graph' ? ['sidebar', 'canvas', 'topbar-meta'] : ['sidebar', 'lanes', 'topbar-meta'];
      var classes = ['hdc-specimen--minimum', 'hd-rq-min', 'hd-rq-min--' + kind].concat(spec.run ? ['hd-rq-min--run'] : []);
      root.classList.add.apply(root.classList, classes);
      H.applyMinimum(root, fixes);
      // The canvas fix makes its viewport the labelled region, so the image role of the outer box is dropped.
      Array.prototype.slice.call(root.querySelectorAll('.hd-canvas[role="img"]')).forEach(function (cv) { cv.removeAttribute('role'); });
      return function () {
        H.clearMinimum(root);
        root.classList.remove.apply(root.classList, classes);
        fixes.forEach(function (name) { root.classList.remove('hdc-min-' + name); });
      };
    }
  };
  H.runQuestionDerivation = { states: DEFS.map(function (d) { return d.id; }), locks: { complete: LOCK_COMPLETE, cancelling: LOCK_CANCELLING, cancelled: LOCK_CANCELLED }, started: STARTED };
})();
