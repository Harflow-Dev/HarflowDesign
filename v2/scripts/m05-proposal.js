/* M05 task screen renderer. Approval scope is per state; see v2/docs/decisions/m05-task-screen-approval.md. Deterministic browser-only fixtures. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var FRAMES = { reference: [1280, 800], minimum: [1000, 620] };
  var SIDEBAR = 264, RAIL = 56, PANE = 420, SPLIT_MIN = 900;

  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(name, sm) { return '<span class="hd-i ' + (sm === false ? '' : 'hd-i--sm ') + 'hd-i-' + name + '" aria-hidden="true"></span>'; }
  function btn(label, opt) {
    opt = opt || {};
    return '<button type="button" class="hd-btn hd-btn--' + (opt.kind || 'secondary') + ' hd-btn--sm"' + (opt.action ? ' data-m05="' + opt.action + '"' : '') + (opt.disabled ? ' disabled' : '') + (opt.title ? ' title="' + esc(opt.title) + '"' : '') + '>' + (opt.icon ? icon(opt.icon) + ' ' : '') + esc(label) + '</button>';
  }

  // Layout rule proposed for G-ADAPTIVE: split at or above 900 points of detail width.
  function detailWidth(frameId, collapsed) { return FRAMES[frameId][0] - (collapsed ? RAIL : SIDEBAR); }
  function paneMode(frameId, collapsed) { return detailWidth(frameId, collapsed) >= SPLIT_MIN ? 'split' : 'overlay'; }

  /* ---------- Fixtures ---------- */
  var TASKS = {
    running: { title: 'Fix flaky slot release test', meta: 'Claude · Opus 5.5 · HarflowMCP', repo: 'HarflowMCP', prompt: 'The test_release_frees_slot test in tests/test_slots.py fails about one run in ten. Find out why and fix it without adding sleeps.' },
    done: { title: 'Add retry budget to delivery queue', meta: 'Claude · Opus 5.5 · HarflowWeb', repo: 'HarflowWeb', prompt: 'Add a retry budget to the delivery queue so a failing webhook stops after 5 attempts per hour instead of retrying forever.' },
    failed: { title: 'Migrate events.jsonl reader', meta: 'Claude · Opus 5.5 · HarflowMCP', repo: 'HarflowMCP', prompt: 'Move the events.jsonl reader to the streaming parser and keep reading partially written trailing lines.' },
    stopped: { title: 'Trace composer keystroke lag', meta: 'Codex · gpt-6-astra · HarflowMac', repo: 'HarflowMac', prompt: 'Trace the composer during a streaming run and list what runs on each keystroke.' },
    empty: { title: 'Run the nightly dependency audit', meta: 'Claude · Opus 5.5 · HarflowMCP', repo: 'HarflowMCP', prompt: 'Audit the dependency lock files and report anything with a known advisory.' }
  };
  var BADGES = {
    running: ['hd-badge--running', '<span class="hd-badge__spin" aria-hidden="true"></span>', 'Running 04:12'],
    runningUnverified: ['hd-badge--warning', icon('alert', false), 'Running · not verified'],
    runningOwnerLost: ['hd-badge--warning', icon('alert', false), 'Running · owner lost'],
    takenOver: ['hd-m05-badge--neutral', icon('stop', false), 'Cancelled 04:31 · taken over'],
    done: ['hd-badge--done', icon('check', false), 'Done 21:04'],
    doneInferred: ['hd-badge--done', icon('check', false), 'Done · exit not observed'],
    failed: ['hd-badge--failed', icon('x', false), 'Failed 07:48'],
    failedInferred: ['hd-badge--failed', icon('x', false), 'Failed · exit not observed'],
    timedOut: ['hd-badge--failed', icon('clock', false), 'Timed out 12:40'],
    cancelled: ['hd-m05-badge--neutral', icon('stop', false), 'Cancelled 04:31'],
    pending: ['hd-m05-badge--neutral', '<span class="hd-glyph hd-glyph--queued" aria-hidden="true"></span>', 'Pending'],
    unavailable: ['hd-m05-badge--neutral', icon('alert', false), 'Status unavailable']
  };

  function transcript(kind) {
    var tool = function (ic, summary, body) {
      return '<div class="hd-tool"><button type="button" class="hd-tool__head">' + icon(ic) + '<span class="hd-tool__summary">' + summary + '</span>' + icon(body ? 'chevron-down' : 'chevron-right') + '</button>' + (body ? '<div class="hd-tool__body">' + body + '</div>' : '') + '</div>';
    };
    var a = function (html) { return '<div class="hd-msg-agent">' + html + '</div>'; };
    if (kind === 'empty') return '<p class="hd-m05-empty">No activity yet. This task has not started.</p>';
    if (kind === 'running') return a('<p>I\'ll start with the slot release path and the test, then look for a race between the release call and the waiter being woken.</p>') + tool('file', 'Read 4 files') + a('<p>Found a likely cause. <code>SlotPool.release()</code> sets the slot free and notifies waiters outside the lock, so a waiter can wake, see the old count and go back to sleep.</p>') + tool('terminal', 'Ran <code>pytest tests/test_slots.py -k release --count 20</code>', '<b>FAILED</b> tests/test_slots.py::test_release_frees_slot[7]\n<b>FAILED</b> tests/test_slots.py::test_release_frees_slot[15]\n2 failed, 18 passed') + tool('pencil', 'Edited <code>harflow_mcp/slots.py</code>') + '<div class="hd-working"><span class="hd-glyph hd-glyph--running is-animated" aria-hidden="true"></span><span>Running tests…</span></div>';
    if (kind === 'done') return a('<p>I\'ll read the delivery queue and its tests first.</p>') + tool('file', 'Read 6 files') + tool('pencil', 'Edited <code>harflow_web/delivery/queue.py</code>') + tool('terminal', 'Ran <code>pytest tests/test_delivery_queue.py</code>', '11 passed') + '<div class="hd-turn-sep">Summary</div>' + a('<p>Deliveries now have a retry budget of 5 attempts per hour per target. When the budget is spent, the delivery is marked <code>exhausted</code>.</p>');
    if (kind === 'failed') return a('<p>I\'ll look at how the reader is used before swapping the parser.</p>') + tool('file', 'Read 5 files') + tool('pencil', 'Edited <code>harflow_mcp/events/reader.py</code>') + tool('terminal', 'Ran <code>pytest tests/test_events_reader.py</code>', '<b>FAILED</b> tests/test_events_reader.py::test_partial_trailing_line\n1 failed, 14 passed');
    return a('<p>I\'ll record a streaming run and compare keystroke handling with and without activity.</p>') + tool('terminal', 'Ran <code>swift test --filter ComposerLatencyTests</code>') + a('<p>Layout runs on every keystroke while rows are arriving. I\'m tracing which input changes.</p>');
  }

  var NOTICES = {
    stopping: ['info', 'Stop requested', 'This run has not exited yet. The status changes when Harflow records the outcome.'],
    settling: ['info', 'Settling', 'The run finished. Its last events and stored changes may still arrive.'],
    continued: ['info', 'New session started', 'This is a fresh session from the earlier run\'s stored request, summary and outcome. Started does not mean finished.'],
    reconstructed: ['warning', 'Reconstructed outcome', 'Harflow did not see this process exit. Done comes from the run\'s own closing output.'],
    statusUnavailable: ['warning', 'Current status unavailable', 'The engine did not answer. Everything below was read earlier and may be out of date.', btn('Retry read')]
  };
  function notice(id) {
    var n = NOTICES[id];
    return '<div class="hd-m05-notice hd-m05-notice--' + n[0] + '" role="status">' + icon(n[0] === 'warning' ? 'alert' : 'clock', false) + '<div><strong>' + esc(n[1]) + '</strong><span>' + esc(n[2]) + '</span></div>' + (n[3] || '') + '</div>';
  }

  var CONTINUE = 'Continue in a new session';
  var BANNERS = {
    failed: function () { return bannerHtml('', 'Task failed: the harness exited with code 1', '<div>The last error was:</div><div class="hd-mono hd-m05-err">json.decoder.JSONDecodeError: Unterminated string starting at: line 1 column 38</div>', btn(CONTINUE, { icon: 'refresh', title: 'Starts a fresh session from the original request, latest summary and captured outcome, with the same harness, model and access.' }) + btn('Copy resume command', { kind: 'ghost', icon: 'copy' })) + caption('A new session starts from the stored request, summary and outcome. It can repeat work already done. Files are not rolled back.'); },
    timedOut: function () { return bannerHtml('', 'This run stopped at its turn limit', '<div>Timed out here means the limit on turns, not a clock. Files already written stay in place.</div>', btn(CONTINUE, { icon: 'refresh' }) + btn('Copy resume command', { kind: 'ghost', icon: 'copy' })); },
    cancelled: function () { return bannerHtml('warning', 'Cancelled', '<div>Files already written stay in place. Harflow did not undo anything.</div>', btn(CONTINUE, { icon: 'refresh' })); },
    cancelPartial: function () {
      return bannerHtml('warning', 'Cancelled, but sub-tasks are outstanding', '<div>The cancel result reports:</div><ul class="hd-m05-list"><li><strong>Not signalled:</strong> Rebuild the index · process group unavailable</li><li><strong>Still settling:</strong> Migrate the fixture store</li><li><strong>Could not be recorded:</strong> Run the soak test</li><li><strong>Still running after a forced stop:</strong> Generate the report</li></ul><div>Builds and other processes outside these tasks are not reported and may still be running.</div>', btn('Open Rebuild the index') + btn('Refresh', { kind: 'ghost' }));
    },
    unknownFailed: function () { return bannerHtml('warning', 'Outcome inferred, not observed', '<div>Harflow never saw this process exit and found no result in its output, so it reports failed. Nothing it had already written was undone.</div>', btn(CONTINUE, { icon: 'refresh', disabled: true }) + btn('Copy resume command', { kind: 'ghost', icon: 'copy' }) + btn('Open Events', { kind: 'ghost', action: 'tab-events' })) + caption('Continue needs an observed exit and fully read output, which this run does not have.'); },
    ownerLost: function () { return bannerHtml('warning', 'The process watching this run is gone', '<div>Captured output has stopped and no later summary is promised. The run itself may still be working. Check its changes or stop it before starting a replacement.</div>', btn('Stop task', { kind: 'danger', action: 'stop', icon: 'stop' }) + btn('Refresh', { kind: 'ghost' })); },
    unverified: function () { return bannerHtml('warning', 'Harflow can\'t confirm this run', '<div>It can\'t tell whether the process watching this run is alive. Output may or may not still be captured, and a later summary is unknown. Check status again before starting a replacement.</div>', btn('Refresh') + btn('Stop task', { kind: 'danger', action: 'stop', icon: 'stop' })); },
    continueStarting: function () { return bannerHtml('', 'Task failed: the harness exited with code 1', '<div class="hd-m05-err hd-mono">json.decoder.JSONDecodeError: Unterminated string starting at: line 1 column 38</div>', btn('Starting…', { icon: 'refresh', disabled: true })); },
    continueRefused: function () { return bannerHtml('warning', 'Continue was refused', '<div>Nothing started. The engine said:</div><div class="hd-mono hd-m05-err">Continuation chain was cancelled; start a new task explicitly</div>', '<a class="hd-btn hd-btn--secondary hd-btn--sm" href="#new-task/default">New task</a>' + btn('Copy resume command', { kind: 'ghost', icon: 'copy' })); },
    launchUnknown: function () { return bannerHtml('warning', 'A new session may have started', '<div>The engine did not report back after Continue, so a task may exist. Don\'t resend yet.</div>', btn('Check for a new task')) + caption('Reads recorded successors only. A task still waiting for resources does not appear until it starts.'); }
  };
  function bannerHtml(tone, title, body, actions) {
    return '<div class="hd-banner' + (tone ? ' hd-banner--' + tone : '') + '" role="alert">' + icon('alert', false) + '<div class="hd-banner__body"><div class="hd-banner__title">' + esc(title) + '</div>' + body + (actions ? '<div class="hd-row hd-m05-actions">' + actions + '</div>' : '') + '</div></div>';
  }
  function caption(text) { return '<p class="hd-m05-caption">' + esc(text) + '</p>'; }

  var RESOURCES = {
    queued: ['Waiting for resources', 'This task has no record yet and has not started.', 'The engine reports launch state only here. Slot details are on the Resources screen.', false],
    held: ['Holding heavy-build', 'Capacity remains reserved for this task.', 'Since 4m ago', false]
  };
  function resourceCard(id) {
    var r = RESOURCES[id];
    return '<div class="hd-m05-resource"><strong>' + esc(r[0]) + '</strong><span>' + esc(r[1]) + '</span><span class="hd-faint">' + esc(r[2]) + '</span>' + (r[3] ? '<details><summary>Blocking details</summary><p class="hd-faint">Held by Nightly dependency audit.</p></details>' : '') + '<a href="#resources/slots">Open resource slots</a></div>';
  }

  /* ---------- Composer ---------- */
  function composer(kind) {
    var placeholder = 'Queue a message…', hint = 'Send queues. Send now requests delivery when safe.', stop = '', locked = false;
    if (kind === 'running') stop = btn('Stop', { action: 'stop', icon: 'stop' });
    if (kind === 'stopping') stop = btn('Stopping…', { icon: 'stop', disabled: true });
    if (kind === 'pending') { stop = btn('Stop', { action: 'stop', icon: 'stop' }); locked = true; placeholder = 'Messages are available once this task starts'; hint = ''; }
    if (kind === 'lockedUnknown') { locked = true; placeholder = 'Locked until the new session is checked'; hint = ''; }
    if (kind === 'lockedTakenOver') { locked = true; placeholder = 'Messages are off — you took this task over in Terminal'; hint = ''; }
    if (kind === 'lockedStarting') { locked = true; placeholder = 'Starting a new session…'; hint = ''; }
    if (kind === 'lockedUnavailable') { locked = true; placeholder = 'Unavailable until status can be read'; hint = ''; }
    return '<div class="hd-m05-composer"><form class="hd-composer" aria-label="Follow-up"><label class="hd-sr" for="m05-followup">Message this task</label><textarea id="m05-followup" class="hd-composer__input" rows="1" placeholder="' + esc(placeholder) + '"' + (locked ? ' disabled' : '') + ' style="min-height:26px"></textarea><div class="hd-composer__bar"><span class="caption hd-faint">' + esc(hint) + '</span><span class="hd-composer__spacer"></span>' + stop + '<button type="submit" class="hd-composer__send" aria-label="Send" disabled>' + icon('arrow-up', false) + '</button></div></form></div>';
  }

  /* ---------- Overflow menu and dialogs ---------- */
  function overflow(s, spec) {
    var repo = TASKS[spec.task].repo, item = function (ic, label, opt) {
      opt = opt || {};
      return '<button type="button" role="menuitem" class="hd-menu__item' + (opt.danger ? ' hd-menu__item--danger' : '') + '"' + (opt.action ? ' data-m05="' + opt.action + '"' : '') + '>' + icon(ic, false) + '<span class="hd-menu__item-body"><span>' + esc(label) + '</span>' + (opt.hint ? '<span class="hd-menu__item-hint">' + esc(opt.hint) + '</span>' : '') + '</span></button>';
    }, parts = [];
    var unavailable = spec.menuVariant === 'unavailable';
    if (spec.composer === 'running' || spec.composer === 'pending') parts.push(item('stop', 'Stop task…', { danger: true, action: 'stop' }));
    if (!unavailable && spec.composer !== 'pending') parts.push(item('terminal', spec.composer === 'running' ? 'Take over in terminal…' : 'Open in terminal…', spec.composer === 'running' ? { action: 'takeover' } : {}));
    if (spec.subtask) parts.push(item('external', 'Open parent task', { hint: 'Started by Nightly dependency audit' }));
    if (!unavailable && spec.composer !== 'pending') parts.push(item('terminal', 'Copy resume command'));
    parts.push(item('copy', 'Copy task ID'));
    parts.push('<div class="hd-menu__sep"></div><div class="hd-menu__label">' + esc(repo) + '</div>');
    parts.push(item('folder', 'Open in Finder'), item('copy', 'Copy path'));
    return '<div class="hd-menu hd-m05-menu" role="menu" aria-label="More actions">' + parts.join('') + '</div>';
  }
  var DIALOGS = {
    stop: function () { return dialogHtml('Stop this task?', '<p class="hd-dialog__text">Harflow asks this run and the tasks it started through Harflow to stop. This is best effort.</p><ul class="hd-m05-list hd-dialog__text"><li>Files already written stay in place.</li><li>Builds and other background processes the run started can keep running. Harflow can\'t list them.</li></ul>'); },
    takeover: function () { return dialogHtml('Take over this task?', '<p class="hd-dialog__text">The headless run is stopped first (with any sub-tasks), then the same conversation opens in Terminal.app. It runs under your own default permissions, not this task\'s access level (Can edit this repo). While the terminal is open, harflow refuses resumes of this session from anywhere else.</p>', 'Take over in terminal'); },
    stopLineage: function () { return dialogHtml('Stop this task?', '<p class="hd-dialog__text">Harflow asks this run and the tasks it started through Harflow to stop. This is best effort.</p><ul class="hd-m05-list hd-dialog__text"><li>Files already written stay in place.</li><li>Builds and other background processes the run started can keep running. Harflow can\'t list them.</li></ul><div class="hd-m05-derived"><strong>Won\'t be stopped by this</strong><p>Started in earlier turns and running when the task list was last read:</p><ul class="hd-m05-list"><li>Rebuild the index</li></ul><p class="hd-faint">From the task list, not from the engine\'s cancel result. May be out of date.</p></div>'); }
  };
  function dialogHtml(title, body, confirm) {
    return '<div class="hd-m05-scrim"><div class="hd-dialog" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><h2 class="hd-dialog__title">' + esc(title) + '</h2>' + body + '<div class="hd-dialog__actions"><button type="button" class="hd-btn hd-btn--secondary" data-m05="dialog-close">' + (confirm ? 'Cancel' : 'Keep running') + '</button><button type="button" class="hd-btn hd-btn--' + (confirm ? 'secondary' : 'danger') + '" data-m05="dialog-confirm">' + (confirm || 'Stop task') + '</button></div></div></div>';
  }

  /* ---------- Changes tab ---------- */
  function notStartedPane() { return '<div class="hd-m05-panebody">' + paneNote('info', 'Available once this task starts', 'A task waiting to launch has no record to read yet.') + '</div>'; }
  var ATTRIBUTION = 'Observed repository differences; not evidence of task authorship.';
  var LETTER = { modified: 'M', added: 'A', deleted: 'D', typechange: 'T', unmerged: 'U', submodule: 'S', untracked: '?', unknown: '·' };
  function fileRow(row) {
    var counts = row.add === null ? '' : '<span class="hd-file__add">+' + row.add + '</span><span class="hd-file__del">−' + row.del + '</span>';
    return '<button type="button" class="hd-file hd-m05-file' + (row.selected ? ' is-selected' : '') + (row.dim ? ' hd-m05-file--dim' : '') + '"' + (row.disabled ? ' disabled' : '') + ' data-m05="noop"><span class="hd-m05-status hd-m05-status--' + row.status + '" title="' + row.status + '">' + LETTER[row.status] + '<span class="hd-sr"> ' + row.status + '</span></span><span class="hd-file__path">' + esc(row.path) + '</span>' + (row.state ? '<span class="hd-m05-rowstate">' + esc(row.state) + '</span>' : '') + counts + '</button>';
  }
  function scopeHtml(name, count, opts) {
    opts = opts || {};
    return '<div class="hd-m05-scope"><div class="hd-m05-scope__head"><span>' + esc(name) + '</span><span class="hd-tab__count">' + esc(count) + '</span>' + (opts.tag ? '<span class="hd-m05-tag hd-m05-tag--' + (opts.tone || 'warn') + '">' + esc(opts.tag) + '</span>' : '') + '</div>' + (opts.note ? '<p class="hd-m05-caption">' + esc(opts.note) + '</p>' : '') + (opts.rows || []).map(fileRow).join('') + (opts.more || '') + '</div>';
  }
  function repoHtml(name, opts) {
    opts = opts || {};
    var open = opts.open !== false;
    return '<details class="hd-m05-repo"' + (open ? ' open' : '') + '><summary>' + icon('chevron-right') + icon('folder') + '<span class="hd-m05-repo__name">' + esc(name) + '</span>' + (opts.tag ? '<span class="hd-m05-tag hd-m05-tag--' + (opts.tone || 'warn') + '">' + esc(opts.tag) + '</span>' : '') + (opts.count ? '<span class="hd-tab__count">' + esc(opts.count) + '</span>' : '') + '</summary>' + (opts.body || '') + '</details>';
  }
  function provenance(extra) {
    return '<p class="hd-m05-attribution">' + ATTRIBUTION + '</p><details class="hd-m05-prov"><summary>Provenance</summary><dl><dt>Base</dt><dd class="hd-mono">a4f91c2 · dispatch</dd><dt>Head</dt><dd class="hd-mono">7be02d9</dd><dt>Working tree</dt><dd class="hd-mono">~/Code/Harflow/HarflowWeb</dd><dt>Observed</dt><dd>Today 10:42</dd><dt>Started dirty</dt><dd>' + esc(extra || 'No') + '</dd></dl></details>';
  }
  function diffBlock(title, scope, lines, tail) {
    return '<div class="hd-m05-diffhead"><span class="hd-file__path">' + esc(title) + '</span><span class="hd-m05-tag">' + esc(scope) + '</span></div><div class="hd-diff" role="group" aria-label="Diff of ' + esc(title) + '">' + lines.map(function (l) {
      var cls = l[0] === '@' ? ' hd-diff__line--hunk' : l[0] === '+' ? ' hd-diff__line--add' : l[0] === '-' ? ' hd-diff__line--del' : '';
      var sign = l[0] === '+' ? '+' : l[0] === '-' ? '−' : '';
      return '<div class="hd-diff__line' + cls + '"><span class="hd-diff__sign">' + sign + '</span>' + esc(l[0] === '@' ? l : l.slice(1)) + '</div>';
    }).join('') + '</div>' + (tail || '');
  }
  var QUEUE_DIFF = ['@@ -41,9 +41,18 @@ class DeliveryQueue', ' def next_attempt(self, target):', '-    return self._attempts[target] + 1', '+    window = self._window(target)', '+    if len(window) >= self.retry_budget:', '+        self._mark_exhausted(target)', '+        return None', '+    window.append(self._clock())', '+    return len(window)'];
  var WEB_ROWS = [{ status: 'modified', path: 'harflow_web/delivery/queue.py', add: 24, del: 3, selected: true }, { status: 'modified', path: 'harflow_web/config.py', add: 2, del: 0 }, { status: 'added', path: 'tests/test_delivery_queue.py', add: 31, del: 0 }];
  var WORKING_NOTE = 'Includes other writers\' and pre-existing changes in this checkout.';
  function paneNote(tone, title, body, actions) {
    return '<div class="hd-m05-panenote hd-m05-panenote--' + tone + '"><strong>' + esc(title) + '</strong>' + (body ? '<span>' + esc(body) + '</span>' : '') + (actions ? '<div class="hd-row hd-m05-actions">' + actions + '</div>' : '') + '</div>';
  }
  function skeleton(n) { var out = ''; for (var i = 0; i < n; i++) out += '<div class="hd-m05-skel" style="width:' + (88 - i * 11) + '%"></div>'; return out; }

  // Tab count is the sum of stored row_count values. It is a row count, not a file count.
  var CHANGES = {
    loading: { count: null, html: function () { return '<div class="hd-m05-panebody" role="status" aria-label="Reading stored changes">' + paneNote('info', 'Reading stored changes') + skeleton(4) + '</div>'; } },
    running: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('info', 'No changes to show while this runs', 'Harflow captures repository differences once, after the task settles.') + '<p class="hd-m05-caption">Edits the agent reports appear in the transcript. They are not this capture.</p></div>'; } },
    settling: { count: null, html: function () { return '<div class="hd-m05-panebody" role="status">' + paneNote('info', 'Stored changes aren\'t available yet', 'Capture may still be settling. This view checks again.') + skeleton(3) + '</div>'; } },
    zero: { count: '0', html: function () { return '<div class="hd-m05-panebody">' + repoHtml('HarflowWeb', { body: provenance() + scopeHtml('Committed', '0', { note: 'No differences observed.' }) + scopeHtml('Working tree', '0', { note: 'No differences observed.' }) }) + '<p class="hd-m05-caption">Complete capture: every page read, no scope limited, conflicts examined. This describes the repository, not what the agent did.</p></div>'; } },
    noRepository: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('info', 'No repository recorded', 'This task finished without a repository to compare.') + '</div>'; } },
    error: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Stored changes unavailable', 'The stored capture is too large to read. Other task history is unaffected.', btn('Retry read') ) + '<dl class="hd-m05-reasons"><dt>capture_too_large</dt><dd>Over the 8 MiB stored capture limit</dd><dt>capture_error</dt><dd>Capture failed when the task settled</dd><dt>changes_document_invalid</dt><dd>Stored capture failed validation</dd><dt>usage error on an older engine</dt><dd>This engine does not support Changes</dd></dl></div>'; } },
    single: { count: '4', html: function () { return '<div class="hd-m05-panebody">' + repoHtml('HarflowWeb', { count: '4', body: provenance() + scopeHtml('Committed', '3', { rows: WEB_ROWS }) + scopeHtml('Working tree', '1', { note: WORKING_NOTE, rows: [{ status: 'untracked', path: 'notes/retry-budget.md', add: null, state: 'name only' }] }) }) + diffBlock('harflow_web/delivery/queue.py', 'Committed', QUEUE_DIFF) + '</div>'; } },
    samePath: { count: '3', html: function () { return '<div class="hd-m05-panebody">' + repoHtml('HarflowWeb', { count: '3', body: provenance('Yes') + scopeHtml('Committed', '2', { rows: [{ status: 'modified', path: 'harflow_web/delivery/queue.py', add: 24, del: 3 }, { status: 'modified', path: 'harflow_web/config.py', add: 2, del: 0 }] }) + scopeHtml('Working tree', '1', { note: WORKING_NOTE + ' It was already dirty when this task started.', rows: [{ status: 'modified', path: 'harflow_web/delivery/queue.py', add: 2, del: 1, selected: true }] }) }) + diffBlock('harflow_web/delivery/queue.py', 'Working tree', ['@@ -58,4 +58,5 @@ class DeliveryQueue', '-    delay = 30', '+    delay = 45', '+    # local tuning'], '<p class="hd-m05-caption">Counts and patch for this scope are separate observations and can differ.</p>') + '</div>'; } },
    multi: { count: '128', html: function () {
      var r = function (n, c) { return repoHtml(n, { open: false, count: c }); };
      return '<div class="hd-m05-panebody"><p class="hd-m05-attribution">' + ATTRIBUTION + '</p>' + repoHtml('HarflowMCP', { count: '86', body: scopeHtml('Committed', '84', { rows: [{ status: 'modified', path: 'src/harflow_mcp/slots.py', add: 18, del: 6 }, { status: 'modified', path: 'tests/test_slots.py', add: 7, del: 0 }], more: '<div class="hd-m05-more"><span class="caption hd-faint">Showing 2 of 84 rows</span>' + btn('Load more rows') + '</div>' }) + scopeHtml('Working tree', '2', { note: WORKING_NOTE }) }) + r('HarflowMac', '31') + r('HarflowDesign', '4') + r('HarflowWeb', '2') + r('HarflowEngine', '5') + r('ops-scripts', '0') + r('docs-site', '0') + r('tools', '0') + '<p class="hd-m05-caption">The tab counts rows across repositories and scopes. A path in both scopes counts twice.</p></div>';
    } },
    multiLimited: { count: null, html: function () {
      var r = function (n, c, tag, tone) { return repoHtml(n, { open: false, count: c, tag: tag, tone: tone }); };
      return '<div class="hd-m05-panebody"><p class="hd-m05-attribution">' + ATTRIBUTION + '</p>' + repoHtml('HarflowMCP', { count: '500+', tag: 'Row limit', body: scopeHtml('Committed', '500+', { tag: 'Row limit · 500 of more', rows: [{ status: 'modified', path: 'src/harflow_mcp/slots.py', add: 18, del: 6 }] }) + scopeHtml('Working tree', '2', { note: WORKING_NOTE }) }) + r('HarflowMac', '31') + r('HarflowDesign', '4') + r('HarflowEngine', '1', 'Working tree not captured') + r('docs-site', '0+', 'Incomplete') + r('tools', '', 'Not captured') + r('old-checkout', '', 'Unavailable') + r('site', '', 'Not started · budget used') + '</div>';
    } },
    text: { count: '4', html: function () { return '<div class="hd-m05-panebody"><div class="hd-m05-diffhead"><span class="hd-file__path">harflow_web/delivery/queue.py</span><span class="hd-m05-tag">Committed</span></div><div role="status" aria-label="Reading diff">' + skeleton(2) + '</div><p class="hd-m05-caption">Loading: the row stays selected and no text is implied.</p>' + diffBlock('harflow_web/config.py', 'Committed', ['@@ -8,3 +8,5 @@', ' RETRY_WINDOW = 3600', '+RETRY_BUDGET = 5'], '<div class="hd-m05-more"><span class="caption hd-faint">Read 32 KiB of 48 KiB stored</span>' + btn('Read more') + '</div>') + '<div class="hd-m05-diffhead"><span class="hd-file__path">tests/test_delivery_queue.py</span><span class="hd-m05-tag">Committed</span></div>' + paneNote('warn', 'This diff couldn\'t be read', 'The stored changes were replaced since this list loaded. Reload the list, then choose the row again.', btn('Reload changes')) + '</div>'; } },
    notObserved: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Changes not captured', 'Harflow never observed this run\'s outcome, so it did not capture repository differences. The repository may still have changed.') + '</div>'; } },
    notStarted: { count: null, html: notStartedPane },
    unavailable: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Changes unavailable', 'The engine did not answer. No changes are implied.', btn('Retry read')) + '</div>'; } },
    rowStates: { count: '9', html: function () {
      var rows = [
        { status: 'modified', path: 'src/big_module.py', add: 412, del: 90, state: 'Truncated · over 64 KiB' },
        { status: 'modified', path: 'src/late_file.py', add: 12, del: 1, state: 'Partial text · task limit' },
        { status: 'modified', path: 'src/last_file.py', add: 4, del: 2, state: 'Text omitted · task limit' },
        { status: 'added', path: 'assets/icon.png', add: null, state: 'Binary' },
        { status: 'submodule', path: 'vendor/fixtures', add: null, state: 'Submodule · no text' },
        { status: 'unmerged', path: 'src/merge_me.py', add: 3, del: 3, state: 'Unmerged · no text' },
        { status: 'modified', path: 'src/very/long/…/truncated.py', add: null, state: 'Path cut · no text', disabled: true, dim: true },
        { status: 'modified', path: 'legacy/caf\\xe9.txt', add: 1, del: 1, state: 'Bytes, not UTF-8' }
      ];
      return '<div class="hd-m05-panebody">' + repoHtml('HarflowMCP', { count: '9', body: provenance() + scopeHtml('Committed', '8', { rows: rows }) + scopeHtml('Working tree', '1', { note: WORKING_NOTE, rows: [{ status: 'untracked', path: 'build/', add: null, state: 'Directory · name only' }] }) }) + diffBlock('src/big_module.py', 'Committed', ['@@ -1,4 +1,6 @@', ' import asyncio', '+import heapq', '+import time'], '<div class="hd-m05-more"><span class="caption hd-faint">Stored text ends here · 64 KiB of a larger patch</span></div>') + '</div>';
    } },
    incomplete: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Capture incomplete', 'Capture hit its 2-second limit. Rows read so far are shown, and more may exist.') + repoHtml('HarflowMCP', { tag: 'Incomplete', count: '1+', body: provenance() + scopeHtml('Committed', '1', { tag: 'Incomplete · time limit', rows: [{ status: 'modified', path: 'big.txt', add: 1, del: 0, state: 'Truncated · time limit' }] }) + scopeHtml('Working tree', '0', { note: 'No rows in this scope. Conflicts were not examined, so this is not a clean bill.', tag: 'Conflicts unknown' }) }) + repoHtml('HarflowMac', { open: false, tag: 'Not started · budget used' }) + '</div>'; } },
    notCaptured: { count: null, html: function () { return '<div class="hd-m05-panebody">' + repoHtml('HarflowMCP', { count: '3', tag: 'Working tree not captured', body: provenance('Unknown') + scopeHtml('Committed', '3', { rows: WEB_ROWS.map(function (x) { return Object.assign({}, x, { selected: false }); }) }) + scopeHtml('Working tree', '—', { tag: 'Not captured', note: 'Its Git directory could not be verified, so no command was given this work tree.' }) }) + repoHtml('vendored-tools', { tag: 'Not captured', body: '<p class="hd-m05-caption">This repository uses alternates, which capture never accepts. Nothing about it was read.</p>' }) + repoHtml('HarflowDesign', { open: false, tag: 'Identity changed' }) + '<dl class="hd-m05-reasons"><dt>Task-level, no repositories</dt><dd>Not captured · outcome never observed, or capture missing</dd></dl></div>'; } },
    unmerged: { count: '3', html: function () { return '<div class="hd-m05-panebody">' + repoHtml('HarflowMCP', { count: '2', tag: 'Conflicts unknown', body: provenance() + scopeHtml('Committed', '1', { rows: [{ status: 'modified', path: 'src/harflow_mcp/slots.py', add: 18, del: 6 }] }) + scopeHtml('Working tree', '1', { note: WORKING_NOTE, rows: [{ status: 'modified', path: 'tests/test_slots.py', add: 3, del: 3 }] }) + paneNote('warn', 'Conflicts may exist', 'Conflict names could not be read from this checkout. The rows above are still the real diff.') }) + repoHtml('HarflowWeb', { open: false, count: '1', tag: 'Reported conflict', tone: 'info' }) + '<p class="hd-m05-caption">Reported conflicts are advisory names from the agent\'s index. They never add, change or hide a row.</p></div>'; } },
    turns: { count: '4', html: function () { return '<div class="hd-m05-panebody"><div class="hd-m05-turnbar"><label>Showing <select aria-label="Turn"><option>Turn 3 of 3 · current</option><option>Turn 2 of 3</option><option>Turn 1 of 3</option></select></label><span class="caption hd-faint hd-mono">task 7be02d91</span></div><p class="hd-m05-caption">Each turn is its own task with its own capture. Turns are not added together.</p>' + repoHtml('HarflowWeb', { count: '4', body: provenance() + scopeHtml('Committed', '3', { rows: WEB_ROWS }) + scopeHtml('Working tree', '1', { note: WORKING_NOTE, rows: [{ status: 'untracked', path: 'notes/retry-budget.md', add: null, state: 'name only' }] }) }) + diffBlock('harflow_web/delivery/queue.py', 'Committed', QUEUE_DIFF) + '</div>'; } }
  };

  /* ---------- Artifacts tab ---------- */
  var ARTIFACTS = {
    populated: { count: '', html: function (ui) {
      var row = function (name, kind, avail, tone) { return '<div class="hd-m05-artifact">' + icon('file') + '<div><strong>' + esc(name) + '</strong><span class="caption hd-faint">' + esc(kind) + '</span></div><span class="hd-m05-tag hd-m05-tag--' + tone + '">' + esc(avail) + '</span></div>'; };
      return '<div class="hd-m05-panebody"><p class="hd-m05-caption">References registered by this task, checked at 10:42. Available means the path exists, not that its contents are unchanged.</p>' + row('digest.md', 'report · 4.2 KB', 'Available', 'ok') + row('coverage.xml', 'test output · 88 KB', 'Changed', 'warn') + row('profile.trace', 'trace · removed', 'Deleted', 'warn') + (ui && ui.loaded ? row('notes.md', 'notes · 1.1 KB', 'Unavailable', 'warn') + '<div class="hd-m05-more"><span class="caption hd-faint">All references loaded</span></div>' : '<div class="hd-m05-more">' + btn('Load more artifacts', { action: 'load-more' }) + '</div>') + '</div>';
    } },
    pageError: { count: '', html: function () { return ARTIFACTS.populated.html({}).replace(btn('Load more artifacts', { action: 'load-more' }), paneNote('warn', 'More artifacts couldn\'t be loaded', 'The list changed since this page was read. References above were read earlier.', btn('Reload artifacts'))); } },
    notStarted: { count: null, html: notStartedPane },
    unavailable: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Artifacts unavailable', 'The engine did not answer.', btn('Retry read')) + '</div>'; } },
    empty: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('info', 'No artifacts registered', 'This task did not register any artifacts.') + '</div>'; } },
    loading: { count: null, html: function () { return '<div class="hd-m05-panebody" role="status" aria-label="Loading artifacts">' + paneNote('info', 'Loading artifacts') + skeleton(3) + '</div>'; } },
    error: { count: null, html: function () { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Artifacts unavailable', 'This task\'s artifact list could not be read. Registered files are not affected.', btn('Retry read')) + '</div>'; } }
  };

  /* ---------- Events tab: D2B content plus task facts ---------- */
  function factsGroups(spec, reveal) {
    var group = function (id, title, body, count) { return '<details class="hd-m05-facts" data-group="' + id + '"' + (reveal === id ? ' open' : '') + '><summary tabindex="0"' + (reveal === id ? ' data-m05-focus' : '') + '>' + icon('chevron-right') + '<span>' + esc(title) + '</span>' + (count ? '<span class="hd-tab__count">' + esc(count) + '</span>' : '') + '</summary><div class="hd-m05-facts__body">' + body + '</div></details>'; };
    var kv = function (pairs) { return '<dl>' + pairs.map(function (p) { return '<dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd>'; }).join('') + '</dl>'; };
    var t = TASKS[spec.task];
    return group('task', 'Task', kv([['Status', BADGES[spec.badge][2]], ['Exit', spec.badge.indexOf('Inferred') >= 0 ? 'Not observed' : '—'], ['Harness', t.meta.split(' · ').slice(0, 2).join(' · ')], ['Repository', t.repo], ['Turns', spec.turns ? String(spec.turns) : '1'], ['Task ID', '7be02d91']]))
      + group('enforcement', 'What was enforced', kv([['Requested', 'Can edit this repo'], ['Mechanism', 'Harness permission rules'], ['OS sandbox', 'No'], ['Writes confined', 'No'], ['Direct commit commands', 'Denied'], ['Publish attempts', 'Not allowed'], ['Network', 'Not controlled']]) + '<p class="hd-m05-caption">Reported by the engine for this task. Each item is claimed only as far as it says.</p>')
      + group('notices', 'Notices', spec.notices ? '<ul class="hd-m05-list"><li>Checkout is on the default branch.</li>' + (spec.notices > 1 ? '<li>Inherited settings could not all be read.</li>' : '') + '</ul>' : '<p class="hd-m05-caption">No notices.</p>', spec.notices ? String(spec.notices) : '')
      + (spec.continuity ? group('continuity', 'Continuity', '<p>Harflow began observing this run again after its dispatcher restarted. Ownership of the run did not change.</p><p class="hd-m05-caption">Time shown is process start evidence, not when the restart happened.</p>') : '');
  }
  var EVENTS = {
    populated: function (spec, reveal) { return '<div class="hd-m05-panebody">' + factsGroups(spec, reveal) + '<h3 class="hd-m05-h">Captured activity facts</h3><p>2 tool calls observed</p><p class="hd-m05-caption">Observed in available captured history; this does not prove complete execution capture.</p><h3 class="hd-m05-h">Captured activity</h3><p class="hd-m05-caption">Public normalized events · bounded record window</p><details class="hd-m05-record"><summary>Tool result · normalized record</summary><pre>{\n  "format": "harflow.event", "product": "harflow",\n  "product_version": "0.0.11", "v": 1,\n  "observed_at": "2026-10-14T17:46:40+00:00", "seq": 5,\n  "kind": "tool_result", "call_id": "call-1",\n  "is_error": false, "output": "Readme body"\n}</pre></details><h3 class="hd-m05-h">Recovered transcript</h3><p class="hd-m05-caption">Separate recovery source. Not used for captured activity totals.</p></div>'; },
    page: function (spec, reveal, ui) { return '<div class="hd-m05-panebody">' + factsGroups(spec, reveal) + '<h3 class="hd-m05-h">Captured activity</h3><p class="hd-m05-caption">Public normalized events · bounded record window</p>' + (ui && ui.loaded ? '<div class="hd-m05-more"><span class="caption hd-faint">Available captured history reached its beginning. Reading position retained.</span></div><details class="hd-m05-record"><summary>Assistant text · normalized record</summary><pre>{\n  "format": "harflow.event", "product": "harflow",\n  "product_version": "0.0.11", "v": 1,\n  "observed_at": "2026-10-14T17:46:40+00:00", "seq": 40,\n  "kind": "assistant_text", "text": "Starting."\n}</pre></details>' : '<div class="hd-m05-more">' + btn('Load earlier', { action: 'load-more' }) + '</div>') + '<details class="hd-m05-record"><summary>Assistant text · normalized record</summary><pre>{\n  "format": "harflow.event", "product": "harflow",\n  "product_version": "0.0.11", "v": 1,\n  "observed_at": "2026-10-14T17:46:40+00:00", "seq": 41,\n  "kind": "assistant_text", "text": "Done."\n}</pre></details><details class="hd-m05-record"><summary>Tool result · normalized record</summary><pre>{\n  "format": "harflow.event", "product": "harflow",\n  "product_version": "0.0.11", "v": 1,\n  "observed_at": "2026-10-14T17:46:40+00:00", "seq": 42,\n  "kind": "tool_result", "call_id": "call-9",\n  "is_error": false, "output": "11 passed"\n}</pre></details><details class="hd-m05-record"><summary>Unsupported record · public stub</summary><pre>{\n  "format": "harflow.event", "product": "harflow",\n  "product_version": "0.0.11", "v": 1,\n  "observed_at": "2026-10-14T17:46:40+00:00", "seq": 43,\n  "kind": "future_kind", "truncated": true\n}</pre></details></div>'; },
    loading: function () { return '<div class="hd-m05-panebody" role="status"><h3 class="hd-m05-h">Task</h3>' + skeleton(2) + '<h3 class="hd-m05-h">Captured activity facts</h3><p>Loading tool activity</p>' + skeleton(1) + '<h3 class="hd-m05-h">Captured activity</h3><p>Loading captured history</p>' + skeleton(3) + '</div>'; },
    pageError: function (spec, reveal, ui) { return EVENTS.page(spec, reveal, ui).replace(btn('Load earlier', { action: 'load-more' }), paneNote('warn', 'Earlier records couldn\'t be read', 'Records below stay. Reloading starts again from the newest page.', btn('Reload from newest'))); },
    notStarted: function () { return notStartedPane(); },
    unavailable: function (spec) { return '<div class="hd-m05-panebody">' + paneNote('warn', 'Status and history unavailable', 'The engine did not answer. This does not mean the task failed.', btn('Retry read')) + '</div>'; },
    empty: function (spec, reveal) { return '<div class="hd-m05-panebody">' + factsGroups(spec, reveal) + '<h3 class="hd-m05-h">Captured activity</h3><p>No rows in the available captured history</p><p class="hd-m05-caption">An empty window does not qualify totals.</p></div>'; },
    error: function (spec, reveal) { return '<div class="hd-m05-panebody">' + factsGroups(spec, reveal) + paneNote('warn', 'Captured history unavailable', 'The read could not be completed. This does not mean the task failed.', btn('Retry history read')) + '</div>'; }
  };

  /* ---------- Screen composition ---------- */
  function sidebarHtml(spec, selection, resolved, identity) {
    var key = spec.badge === 'running' || spec.task === 'running' ? 'task/running' : spec.task === 'failed' ? 'task/failed' : 'task/done';
    var template = H.templates && H.templates[key];
    if (!template || typeof H.fill !== 'function') return '';
    var match = template.match(/<aside class="hd-sidebar"[\s\S]*?<\/aside>/);
    if (!match) return '';
    var title = identity ? identity.sidebarTitle : TASKS[spec.task].title;
    var html = match[0].replace('href="#new"', 'href="#new-task/default"').replace(/(<a class="hd-task-row[^"]*is-active[^"]*"[\s\S]*?<span class="hd-task-row__title">)[\s\S]*?(<\/span>)/, '$1' + esc(title) + '$2');
    if (identity && identity.href) html = html.replace(/(<a class="hd-task-row[^"]*is-active[^"]*"[^>]*?href=")[^"]*(")/, '$1' + esc(identity.href) + '$2');
    var glyph = { running: ['running', 'Running', ''], runningUnverified: ['attention', 'Not verified', 'alert'], runningOwnerLost: ['attention', 'Owner lost', 'alert'], takenOver: ['cancelled', 'Cancelled, taken over', 'stop'], failed: ['failed', 'Failed', 'x'], failedInferred: ['failed', 'Failed', 'x'], timedOut: ['failed', 'Timed out', 'clock'], cancelled: ['cancelled', 'Cancelled', 'stop'], pending: ['queued', 'Pending', ''], unavailable: ['cancelled', 'Status unavailable', 'alert'], done: ['done', 'Done', 'check'], doneInferred: ['done', 'Done', 'check'] }[spec.badge];
    html = html.replace(/(<a class="hd-task-row[^"]*is-active[^"]*"[^>]*>)<span class="hd-glyph[\s\S]*?<span class="hd-task-row__title">/, function (_, open) {
      return open + '<span class="hd-glyph hd-glyph--' + glyph[0] + '" aria-label="' + glyph[1] + '">' + (glyph[2] ? icon(glyph[2]) : '') + '</span><span class="hd-task-row__title">';
    });
    // One sidebar body scroll with fixed header and footer, per the 2026-11-06 M04 owner correction.
    html = html.replace('<nav class="hd-nav"', '<div class="hd-m05-sidebar-scroll"><nav class="hd-nav"').replace('<div class="hd-sidebar__foot">', '</div><div class="hd-sidebar__foot">');
    return H.fill(html, selection, resolved);
  }
  function topbar(spec, ui, narrow, identity) {
    var t = TASKS[spec.task], b = BADGES[spec.badge];
    var meta = t.meta + (spec.turns ? ' · ' + spec.turns + ' turns' : '');
    if (identity) { t = { title: identity.title }; b = identity.badge; meta = identity.meta; }
    var chip = function (ic, label, group, title) { return '<button type="button" class="hd-m05-chip" data-m05="reveal-' + group + '" title="' + esc(title) + '" aria-label="' + esc(title) + '">' + icon(ic) + (label ? '<span>' + esc(label) + '</span>' : '') + '</button>'; };
    var chips = '';
    if (identity) chips = identity.chips || '';
    else {
      if (spec.continuity) chips += chip('refresh', narrow ? '' : 'Observation resumed', 'continuity', 'Observation resumed after a restart. Show details.');
      if (spec.notices) chips += chip('alert', narrow ? String(spec.notices) : spec.notices + (spec.notices === 1 ? ' notice' : ' notices'), 'notices', 'Show ' + spec.notices + (spec.notices === 1 ? ' notice' : ' notices'));
      if (spec.composer !== 'pending') chips += chip('shield', narrow ? '' : 'Can edit this repo', 'enforcement', 'Can edit this repo. Show what was enforced.');
    }
    return '<div class="hd-m05-bar"><span></span><div class="hd-m05-bar__center"><span class="hd-topbar__title">' + esc(t.title) + '</span><span class="hd-badge ' + b[0] + '">' + b[1] + esc(b[2]) + '</span>' + (narrow || spec.composer === 'pending' || (ui.pane && (spec.notices || spec.continuity)) ? '' : '<span class="hd-topbar__meta">' + esc(meta) + '</span>') + '</div><div class="hd-m05-bar__right">' + chips + '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm' + (ui.pane ? ' is-active' : '') + '" data-m05="pane" aria-pressed="' + (ui.pane ? 'true' : 'false') + '" aria-label="' + (ui.pane ? 'Hide right pane' : 'Show right pane') + '">' + icon('panel-right', false) + '</button>' + (identity && identity.menu === false ? '' : '<span class="hd-m05-more-anchor"><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" data-m05="menu" aria-haspopup="menu" aria-expanded="' + (ui.menu ? 'true' : 'false') + '" aria-label="More actions">' + icon('more', false) + '</button>' + (ui.menu ? overflow(ui, spec) : '') + '</span>') + '</div></div>';
  }
  function paneHtml(spec, ui, hooks) {
    var identity = hooks && hooks.identity, disabled = (identity && identity.disabledTabs) || [];
    // Tabs a person can reach from any state follow that state's lifecycle, not populated defaults.
    var life = spec.composer === 'pending' ? 'notStarted' : spec.badge === 'unavailable' ? 'unavailable' : '';
    var liveRun = spec.badge === 'running' || spec.badge === 'runningUnverified' || spec.badge === 'runningOwnerLost';
    var noObservedExit = spec.badge === 'failedInferred' || spec.badge === 'doneInferred';
    var changes = CHANGES[life || spec.changes || (liveRun ? 'running' : noObservedExit ? 'notObserved' : 'single')], artifacts = ARTIFACTS[life || spec.artifacts || 'populated'];
    var paged = ui.paged || {};
    var tab = function (id, label, count) {
      if (disabled.indexOf(id) >= 0) return '<button type="button" role="tab" aria-selected="false" aria-disabled="true" class="hd-tab is-disabled">' + label + '</button>';
      return '<button type="button" role="tab" aria-selected="' + (ui.tab === id) + '" class="hd-tab' + (ui.tab === id ? ' is-active' : '') + '" data-m05="tab-' + id + '">' + label + (count ? ' <span class="hd-tab__count">' + count + '</span>' : '') + '</button>';
    };
    var body = ui.tab === 'events' && hooks && hooks.eventsBody ? hooks.eventsBody(spec, ui) : ui.tab === 'changes' ? changes.html() : ui.tab === 'artifacts' ? artifacts.html({ loaded: paged.artifacts }) : EVENTS[life || spec.events || 'populated'](spec, ui.reveal, { loaded: paged.events });
    return '<aside class="hd-pane hd-m05-pane" aria-label="Task details"><div class="hd-pane__head"><div class="hd-tabs" role="tablist">' + tab('changes', 'Changes', changes.count) + tab('artifacts', 'Artifacts', artifacts.count) + tab('events', 'Events') + '</div><span class="hd-topbar__spacer"></span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" data-m05="pane" aria-label="Close right pane">' + icon('x') + '</button></div><div class="hd-scroll hd-m05-panescroll">' + body + '</div></aside>';
  }
  function promptHtml(spec) {
    return '<details class="hd-m05-request"><summary>' + icon('chevron-right') + 'Original request</summary><p class="hd-m05-caption">Complete stored request</p><pre>' + esc(TASKS[spec.task].prompt) + '</pre><div class="hd-row hd-m05-actions">' + btn('Copy original request') + '</div></details>';
  }
  function columnHtml(spec, hooks) {
    if (hooks && hooks.transcriptSlot) return '<section class="hd-m05-column" aria-label="Task conversation">' + hooks.transcriptSlot(spec) + composer(spec.composer) + '</section>';
    var kind = spec.task === 'empty' ? 'empty' : spec.task;
    var head = spec.composer === 'pending' ? '<div class="hd-m05-request"><span class="hd-faint">Original request is readable once this task starts.</span></div>' : promptHtml(spec);
    if (spec.subtask) head += '<div class="hd-m05-prov-line">' + icon('branch') + 'Sub-task started by another agent</div>';
    if (spec.resource) head += resourceCard(spec.resource);
    var flow = transcript(kind);
    return '<section class="hd-m05-column" aria-label="Task conversation"><div class="hd-scroll hd-m05-scroll"><div class="hd-transcript">' + head + (spec.notice ? notice(spec.notice) : '') + flow + (spec.banner ? BANNERS[spec.banner]() : '') + '</div></div>' + composer(spec.composer) + '</section>';
  }
  // Optional hooks, passed by no existing route: transcriptSlot(spec) replaces the prompt and transcript
  // column body, eventsBody(spec, ui) replaces the Events tab body, and identity replaces the task identity
  // ({ title, meta, badge, chips, sidebarTitle, href, menu, disabledTabs }).
  function screenHtml(spec, ui, selection, resolved, hooks) {
    var frameId = ui.frame, narrow = ui.narrow || FRAMES[frameId][0] < 1100, mode = paneMode(frameId, false);
    var identity = hooks && hooks.identity;
    var pane = ui.pane ? paneHtml(spec, ui, hooks) : '';
    return '<div class="hd-app hd-m05-app" data-theme="' + resolved + '">' + sidebarHtml(spec, selection, resolved, identity) + '<main class="hd-main hd-m05-main">' + topbar(spec, ui, narrow, identity) + '<div class="hd-m05-body hd-m05-body--' + (ui.pane ? mode : 'nopane') + '">' + columnHtml(spec, hooks) + pane + '</div>' + (ui.dialog ? DIALOGS[ui.dialog]() : '') + '</main></div>';
  }

  /* ---------- Boards ---------- */
  function mini(spec, label, frameId, selection, resolved, scale, note) {
    var f = FRAMES[frameId], ui = { frame: frameId, pane: !!spec.pane, tab: spec.tab || 'changes', menu: !!spec.menu, dialog: spec.dialog || '', reveal: '' };
    return '<figure class="hd-m05-mini"><figcaption><strong>' + esc(label) + '</strong>' + (note ? '<span>' + esc(note) + '</span>' : '') + '</figcaption><div class="hd-m05-mini__clip" style="width:' + Math.round(f[0] * scale) + 'px;height:' + Math.round(f[1] * scale) + 'px"><div class="hd-m05-window" inert style="width:' + f[0] + 'px;height:' + f[1] + 'px;transform:scale(' + scale + ')">' + screenHtml(spec, ui, selection, resolved) + '</div></div></figure>';
  }
  function decisions(list) { return '<ul class="hd-m05-decisions">' + list.map(function (d) { return '<li>' + d + '</li>'; }).join('') + '</ul>'; }
  function barSpecimen(kind, label, note, width) {
    var t = TASKS.running, b = BADGES.running, narrow = width < 800;
    var title = '<span class="hd-topbar__title">' + esc(t.title) + '</span>', badge = '<span class="hd-badge ' + b[0] + '">' + b[1] + esc(b[2]) + '</span>', meta = '<span class="hd-topbar__meta">' + esc(t.meta) + '</span>', conn = '<span class="hd-m05-conn" title="Connection status, from M04"><span class="hd-m05-conn__dot"></span></span>';
    var controls = '<button class="hd-btn hd-btn--icon hd-btn--sm" tabindex="-1" aria-hidden="true">' + icon('panel-right', false) + '</button><button class="hd-btn hd-btn--icon hd-btn--sm" tabindex="-1" aria-hidden="true">' + icon('more', false) + '</button>';
    var inner;
    if (kind === 'A') inner = '<div class="hd-m05-bar__left">' + title + badge + (narrow ? '' : meta) + '</div><span></span><div class="hd-m05-bar__right">' + conn + controls + '</div>';
    if (kind === 'B') inner = '<span></span><div class="hd-m05-bar__center">' + title + conn + '</div><div class="hd-m05-bar__right">' + badge + controls + '</div>';
    if (kind === 'C') inner = '<span></span><div class="hd-m05-bar__center">' + title + badge + (narrow ? '' : meta) + conn + '</div><div class="hd-m05-bar__right">' + controls + '</div>';
    return '<figure class="hd-m05-barfig"><figcaption><strong>' + esc(label) + '</strong> <span>' + esc(note) + ' · ' + width + ' pt detail width</span></figcaption><div class="hd-m05-bar hd-m05-bar--spec" style="width:' + width + 'px">' + inner + '</div></figure>';
  }
  function retryOption(kind) {
    var d = {
      A: ['Approved · Continue in a new session', btn(CONTINUE, { icon: 'refresh' }), 'ctl continue. No new text needed; identical requests share one successor. Fresh session built from the stored request, summary and outcome, with the same harness, model and access. Refused without an observed exit, drained output and an untruncated request, and for workflow-owned tasks. Can repeat work; files are not rolled back.'],
      B: ['Resume the same session', btn('Resume session', { icon: 'refresh' }), 'ctl resume. Keeps the session and its context but needs follow-up text, so the button can only focus the composer. Adds a send mode the composer does not have today. Acceptance is not completion.'],
      C: ['Run the original request again', btn('Run again', { icon: 'refresh' }), 'ctl run with the stored request. No dedicated operation: needs a complete stored request and repeats every side effect. Contract: reconcile before any user-authorized retry and never replay automatically. Not recommended.']
    }[kind];
    return '<div class="hd-m05-card"><strong>' + esc(d[0]) + '</strong><div class="hd-row hd-m05-actions">' + d[1] + btn('Copy resume command', { kind: 'ghost', icon: 'copy' }) + '</div><p>' + esc(d[2]) + '</p></div>';
  }

  var GAPS = [
    { id: 'G-TASK-STATES', title: 'Task states', routes: ['state-running', 'state-stopping', 'state-cancelled', 'state-cancel-partial', 'state-timed-out', 'state-settling', 'state-unknown-failed', 'state-unknown-done', 'state-owner-lost', 'state-unverified', 'state-launch-unknown', 'state-status-unavailable', 'state-pending', 'state-taken-over', 'state-continue-starting', 'state-continue-started', 'state-continue-refused', 'state-failed', 'retry-options', 'stop-options'],
      decide: ['Retry: Continue in a new session. <a data-r="retry-options">Options</a>', 'Stop in both the composer and overflow; the outcome word stays Cancelled. <a data-r="stop-options">Options</a>', 'Settling: the reported status plus a notice.', 'Unknown outcome: separate treatments as drawn.', '"Status unavailable": approved for display only, not as a status.'] },
    { id: 'G-OVERFLOW', title: 'Overflow', routes: ['overflow-running', 'overflow-settled', 'overflow-subtask', 'cancel-dialog', 'cancel-dialog-lineage', 'takeover-dialog'],
      decide: ['Overflow layout as drawn, with a repository group and Open parent task as its own item.', 'Stop dialog wording as drawn.', 'The "Won\'t be stopped" list stays, labelled as client-derived.', 'Takeover entry in overflow. Human-only and ctl-only on the engine.'] },
    { id: 'Top bar', title: 'Top bar content', routes: ['topbar-facts', 'topbar-resource', 'topbar-minimum'],
      decide: ['Access, notices and continuity as chips that open Events facts.', 'Turn count in the meta line, dropped first at narrow widths and kept in Facts.', 'Resource context as an inline card above the transcript.'] },
    { id: 'G-DIFF', title: 'Changes', routes: ['changes-single', 'changes-multi', 'changes-multi-limited', 'changes-same-path', 'changes-row-states', 'changes-incomplete', 'changes-not-captured', 'changes-unmerged', 'changes-running', 'changes-zero', 'changes-no-repository', 'changes-text', 'changes-loading', 'changes-error', 'changes-turns'],
      decide: ['Repository, then scope, then rows; the same path stays two rows.', 'Tab count: sum of stored rows when every repository and scope is available and none hit the row limit, otherwise no number.', 'Current turn with a turn picker. No combined view, the contract has none.', 'Attribution sentence verbatim from the engine, always visible.'] },
    { id: 'Tabs', title: 'Artifacts and Events', routes: ['artifacts-populated', 'artifacts-page-error', 'artifacts-empty', 'artifacts-loading', 'artifacts-error', 'events-populated', 'events-page', 'events-page-error', 'events-not-started', 'events-loading', 'events-empty', 'events-error'],
      decide: ['Facts groups at the top of Events, collapsed by default.', 'Artifacts routes stay provisional until task-artifacts has a fixture and capability.'] },
    { id: 'G-ADAPTIVE', title: 'Adaptive', routes: ['adaptive-options', 'adaptive-overlay', 'adaptive-split', 'adaptive-running-closed', 'adaptive-running-open', 'adaptive-failed-default'],
      decide: ['Minimum window: pane over the transcript. <a data-r="adaptive-options">Options</a>', 'Split threshold of 900 points of detail width as drawn; native checking still needed.', 'Running: closed by default, first open lands on Events.', 'Failed: closed by default.'] },
    { id: 'G-PLATFORM', title: 'Top bar composition', routes: ['platform-options'],
      decide: ['Option C, accepted position with adjacency. <a data-r="platform-options">Options</a> Native title width is unmeasured, so a real-window check at implementation still applies.'] }
  ];
  function boardHtml(kind, selection, resolved, theme) {
    var link = function (id, label) { return '<a href="#' + H.routeFor('m05', id) + '/' + theme + '">' + esc(label || id) + '</a>'; };
    if (kind === 'overview') {
      return '<div class="hd-m05-board"><h2>M05 task screen</h2><p class="hd-m05-lede">Approved by the owner on 2026-11-07, relayed by the coordinator, except the provisional routes listed below. Approval does not establish native fidelity or product acceptance. See <a href="docs/decisions/m05-task-screen-approval.md">the approval record</a>.</p><div class="hd-m05-flags"><strong>Stays provisional, not approved</strong><ul class="hd-m05-list"><li><code>state-cancel-partial</code> and all <code>artifacts-*</code> routes, including Artifacts reached from another state\'s pane.</li></ul></div><div class="hd-m05-closed"><strong>Closed by the owner, 2026-11-07</strong><ul class="hd-m05-list"><li>The prompt stays the expandable Original request disclosure, not a bubble.</li><li>Takeover keeps an entry. Only its placement is drawn here.</li><li>The builder keeps Always allow Harflow tools. Not a task screen item; recorded for the ledger.</li></ul></div><div class="hd-m05-flags"><strong>Open contract gaps</strong><ul class="hd-m05-list"><li><code>cancel</code>: no canonical fixture, and <code>contracts.md</code> does not specify the cascade fields. HarflowMCP issue 118 (open) means processes outside the group are unreported, and the slot can release early.</li><li><code>task-artifacts</code>: no canonical fixture or capability string.</li><li>No task status means settling or unknown. Both are derived here from separate reads, and the status vocabulary would need a decision to say more.</li><li>The chain-stop marker behind one Continue refusal is not on status or in <code>contracts.md</code>, so the app learns it only when refused.</li></ul></div>' + GAPS.map(function (g) {
        return '<section class="hd-m05-gap"><h3>' + esc(g.title) + ' <span class="hd-faint">' + esc(g.id) + '</span></h3><div class="hd-m05-gap__routes">' + g.routes.map(function (r) { return link(r); }).join('') + '</div><strong class="hd-m05-gap__label">Decided</strong>' + decisions(g.decide.map(function (d) { return d.replace(/<a data-r="([^"]+)">/g, function (_, r) { return '<a href="#' + H.routeFor('m05', r) + '/' + theme + '">'; }); })) + '</section>';
      }).join('') + '<section class="hd-m05-gap"><h3>G-HISTORY <span class="hd-faint">ledger only</span></h3><p>No new design. The ledger row and the rows the closed decisions change are updated in <a href="docs/migration-coverage.md">the coverage ledger</a>.</p></section></div>';
    }
    if (kind === 'retry') return '<div class="hd-m05-board"><h2>What does Retry mean?</h2><p class="hd-m05-lede">The approved <code>task/failed</code> banner says Retry. ctl has no retry operation. Each option below is what the button could honestly do.</p><div class="hd-m05-cards">' + retryOption('A') + retryOption('B') + retryOption('C') + '</div>' + decisions(['Approved: A, renamed, because the label states the new session and the contract guards duplicates.', 'None retries automatically. Refusals keep the task as it is and show the engine\'s reason.']) + '</div>';
    if (kind === 'stop') return '<div class="hd-m05-board"><h2>Stop or Cancel?</h2><p class="hd-m05-lede">Both call <code>cancel</code> and both open the same confirmation. The outcome word stays Cancelled, from the closed status vocabulary.</p><div class="hd-m05-minis">' + mini({ badge: 'running', task: 'running', composer: 'running', menu: true }, 'A · Approved: Stop in both places', 'minimum', selection, resolved, 0.62, 'Composer Stop matches task/running. "Cancel" beside a message field could read as discarding the draft.') + mini({ badge: 'running', task: 'running', composer: 'settledRunning', menu: true }, 'B · Ledger 51: overflow only', 'minimum', selection, resolved, 0.62, 'Removes the approved composer button. Word in the menu would become Cancel task….') + '</div></div>';
    if (kind === 'adaptive') return '<div class="hd-m05-board"><h2>The 420 pane at 1000 × 620</h2><p class="hd-m05-lede">Detail width is 736 points, so a 420 pane beside the transcript leaves 316, less than the composer needs. All three are drawn at the real minimum.</p><div class="hd-m05-minis">' + mini(Object.assign({ badge: 'done', task: 'done', composer: 'settled', pane: 'open', tab: 'changes', changes: 'single' }), 'A · Approved: over the transcript', 'minimum', selection, resolved, 0.5, 'No re-wrap, so the reading position and row heights stay put. Escape or the toggle closes it. Collapsing the sidebar by hand gives 944 points and a split.') + miniForcedSplit('B · Collapse the sidebar while the pane is open', 'Both stay visible, 524 points of transcript. Changes a setting the person did not touch and re-wraps the transcript.', selection, resolved, true) + miniForcedSplit('C · Side by side anyway', '316 points of transcript. Diffs stay usable, but the transcript is hard to read.', selection, resolved, false) + '</div>' + decisions(['Threshold is 900 points of detail width: 420 pane plus 480 transcript.', 'Native toolbar and sidebar behaviour during an overlay is unverified in a browser.']) + '</div>';
    if (kind === 'platform') return '<div class="hd-m05-board"><h2>Top bar composition</h2><p class="hd-m05-lede">The specimen puts title, badge and meta together at the leading edge. M04\'s accepted real-window title sits over the content column as a principal toolbar item, with connection status beside it. Today\'s status badge is a trailing item. Bars below are one toolbar line, drawn at the reference and minimum detail widths.</p>' + ['A', 'B', 'C'].map(function (k) {
      var note = { A: ['A · Specimen adjacency', 'Matches task/running pixels. Title jumps between screens and connection status needs a new home.'], B: ['B · Accepted position, status apart', 'No move from M04 and closest to today. Title and status no longer read together.'], C: ['C · Approved: accepted position, adjacent', 'Keeps M04\'s position and the specimen\'s grouping. Long titles truncate first; meta drops first at narrow widths.'] }[k];
      return barSpecimen(k, note[0], note[1], 1016) + barSpecimen(k, note[0], 'Minimum', 736);
    }).join('') + decisions(['Native principal item width and truncation are unmeasured. Approval does not remove the real-window check needed at implementation, as M04 had.']) + '</div>';
    return '';
  }
  // Options B and C force a split inside the minimum frame, which the proposed rule would not choose.
  function miniForcedSplit(label, note, selection, resolved, rail) {
    var f = FRAMES.minimum, scale = 0.5, spec = { badge: 'done', task: 'done', composer: 'settled', pane: 'open', tab: 'changes', changes: 'single' };
    var html = screenHtml(spec, { frame: 'reference', narrow: true, pane: true, tab: 'changes', menu: false, dialog: '', reveal: '' }, selection, resolved);
    if (rail) {
      var template = H.templates && H.templates['new-task/sidebar-collapsed'];
      var match = template && template.match(/<aside class="hd-rail"[\s\S]*?<\/aside>/);
      html = html.replace(/<aside class="hd-sidebar"[\s\S]*?<\/aside>/, match ? H.fill(match[0], selection, resolved) : '');
    }
    return '<figure class="hd-m05-mini"><figcaption><strong>' + esc(label) + '</strong><span>' + esc(note) + '</span></figcaption><div class="hd-m05-mini__clip" style="width:' + Math.round(f[0] * scale) + 'px;height:' + Math.round(f[1] * scale) + 'px"><div class="hd-m05-window" inert style="width:' + f[0] + 'px;height:' + f[1] + 'px;transform:scale(' + scale + ')">' + html + '</div></div></figure>';
  }

  /* ---------- Mount ---------- */
  function initialUi(spec) {
    return { frame: spec.frame || 'reference', pane: !!spec.pane, tab: spec.tab || (spec.badge === 'running' || spec.composer === 'pending' ? 'events' : 'changes'), menu: !!spec.menu, dialog: spec.dialog || '', reveal: spec.reveal || '', paged: {} };
  }
  function frameLabel(ui) {
    return '<label>Frame <select data-m05-frame><option value="reference"' + (ui.frame === 'reference' ? ' selected' : '') + '>1280 × 800</option><option value="minimum"' + (ui.frame === 'minimum' ? ' selected' : '') + '>1000 × 620</option></select></label>';
  }
  function mount(root, id) {
    var state = (H.m05ProposalStates || []).filter(function (s) { return s.id === id; })[0];
    return state ? mountState(root, state, null) : function () {};
  }
  // `ext` is optional and passed by no existing route: { hooks, strip(state, ui, frameLabel),
  // beforeRender(), afterRender(stage, saved) }. beforeRender runs before the specimen is replaced and returns
  // what afterRender needs to restore the view once the new specimen is in place.
  function mountState(root, state, ext) {
    var host = root.matches && root.matches('.hd-m05') ? root : root.querySelector('.hd-m05');
    if (!host || !state) return function () {};
    var spec = state.spec, ui = initialUi(spec), disposed = false, returnFocus = null;
    var theme = host.dataset.theme || 'light';
    var selection = host.dataset.systemOn === 'true' ? 'system' : host.dataset.darkOn === 'true' ? 'dark' : 'light';
    function render(focusSel) {
      if (disposed) return;
      var saved = ext && ext.beforeRender ? ext.beforeRender() : null;
      var strip = ext && ext.strip ? ext.strip(state, ui, frameLabel(ui)) : '<div class="hd-m05-strip"><strong>' + H.catalogStrips.m05[state.kind] + esc(state.gap) + '</strong><a href="#' + H.routeFor('m05', 'overview') + '/' + theme + '">' + H.catalogStrips.m05.overviewLink + '</a>' + (spec.board ? '' : frameLabel(ui)) + '</div><p>' + esc(state.summary) + '</p><p class="hd-faint">Contract basis: ' + esc(state.basis) + '</p>' + (state.flag ? '<p class="hd-m05-flag">' + esc(state.flag) + '</p>' : '') + ((!state.flag || state.flag.indexOf('task-artifacts') < 0) && ui.pane && ui.tab === 'artifacts' ? '<p class="hd-m05-flag">Needs contract: task-artifacts has no canonical fixture or capability string yet.</p>' : '');
      host.querySelector('.hd-m05-catalog').innerHTML = strip;
      var stage = host.querySelector('.hd-m05-stage');
      if (spec.board) { stage.innerHTML = boardHtml(spec.board, selection, host.dataset.theme, theme); if (ext && ext.afterRender) ext.afterRender(stage, saved); return; }
      var f = FRAMES[ui.frame];
      stage.innerHTML = '<div class="hd-m05-window" style="width:' + f[0] + 'px;height:' + f[1] + 'px">' + screenHtml(spec, ui, selection, host.dataset.theme, ext && ext.hooks) + '</div>';
      if (ext && ext.afterRender) ext.afterRender(stage, saved);
      var target = focusSel ? stage.querySelector(focusSel) : null;
      if (target) target.focus({ preventScroll: true });
      if (ui.reveal) { var open = stage.querySelector('[data-m05-focus]'); if (open) { open.focus({ preventScroll: true }); open.scrollIntoView({ block: 'nearest' }); } }
    }
    function act(a) {
      if (a === 'pane') { ui.pane = !ui.pane; ui.reveal = ''; return render('[data-m05="pane"]'); }
      if (a === 'menu') { ui.menu = !ui.menu; return render(ui.menu ? '.hd-m05-menu [role="menuitem"]' : '[data-m05="menu"]'); }
      if (a === 'load-more') { ui.paged[ui.tab] = true; return render('[data-m05="tab-' + ui.tab + '"]'); }
      if (a === 'takeover') { ui.menu = false; ui.dialog = 'takeover'; return render('[data-m05="dialog-close"]'); }
      if (a === 'stop') { ui.menu = false; ui.dialog = spec.dialog && spec.dialog !== 'takeover' ? spec.dialog : 'stop'; return render('[data-m05="dialog-close"]'); }
      if (a === 'dialog-close' || a === 'dialog-confirm') { ui.dialog = ''; return render('[data-m05="stop"]'); }
      if (a.indexOf('tab-') === 0) { ui.tab = a.slice(4); ui.pane = true; ui.reveal = ''; return render('[data-m05="tab-' + ui.tab + '"]'); }
      if (a.indexOf('reveal-') === 0) { returnFocus = '[data-m05="' + a + '"]'; ui.pane = true; ui.tab = 'events'; ui.reveal = a.slice(7); return render(); }
    }
    function click(e) {
      var b = e.target.closest('[data-m05]');
      if (b && host.contains(b)) { var a = b.dataset.m05; if (a !== 'noop') { e.preventDefault(); act(a); } return; }
      if (ui.menu && !e.target.closest('.hd-m05-menu')) { ui.menu = false; render('[data-m05="menu"]'); }
    }
    function change(e) { if (e.target.matches('[data-m05-frame]')) { ui.frame = e.target.value; render('[data-m05-frame]'); host.querySelector('[data-m05-frame]').focus(); } }
    function keydown(e) {
      if (e.key !== 'Escape') return;
      if (ui.dialog) { e.preventDefault(); ui.dialog = ''; return render('[data-m05="stop"]'); }
      if (ui.menu) { e.preventDefault(); ui.menu = false; return render('[data-m05="menu"]'); }
      if (ui.pane && (paneMode(ui.frame, false) === 'overlay' || ui.reveal)) { e.preventDefault(); ui.pane = false; ui.reveal = ''; return render(returnFocus || '[data-m05="pane"]'); }
    }
    function submit(e) { e.preventDefault(); }
    host.addEventListener('click', click); host.addEventListener('change', change); host.addEventListener('keydown', keydown); host.addEventListener('submit', submit);
    render();
    return function () { disposed = true; host.removeEventListener('click', click); host.removeEventListener('change', change); host.removeEventListener('keydown', keydown); host.removeEventListener('submit', submit); };
  }
  H.m05Proposal = { mount: mount, mountState: mountState, screenHtml: screenHtml, initialUi: initialUi, icon: icon, BADGES: BADGES, FRAMES: FRAMES, paneMode: paneMode, detailWidth: detailWidth, GAPS: GAPS };
})();
