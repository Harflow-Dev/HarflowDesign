/* M05 task screen states. Owner-approved 2026-11-07 (relayed by the coordinator), except the
   provisional routes below; see v2/docs/decisions/m05-task-screen-approval.md. Each state is one row here; v2/scripts/m05-proposal.js renders it from `spec`.
   Catalog controls stay outside the native-size specimen. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var T = H.templates = H.templates || {};
  // Labels of the catalog-only strip above the app frame. The Node test scans them for process names.
  var STRIPS = (H.catalogStrips = H.catalogStrips || {}).m05 = {
    label: 'Task screen review controls',
    approved: 'Approved · owner 2026-11-07 · ',
    provisional: 'Provisional · not approved · ',
    record: 'Decision record · ',
    overviewLink: 'Overview and decisions'
  };
  var docs = H.componentDocs = H.componentDocs || {};

  var RUNNING = { badge: 'running', task: 'running' };
  var FAILED = { badge: 'failed', task: 'failed' };
  var DONE = { badge: 'done', task: 'done' };

  // [id, gap, title, one-line purpose, contract basis, needs-contract flag or '', spec]
  var rows = [
    ['overview', 'Overview', 'Overview and decisions', 'Every gap, its routes, what was decided and what stays provisional.', 'See the task screen decision record.', '', { board: 'overview' }],

    // G-TASK-STATES
    ['state-running', 'Status', 'Running · Stop in composer', 'Baseline running screen with the new top bar. Stop opens the same confirmation as the overflow item.', 'status running; cancel.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false })],
    ['state-stopping', 'Status', 'Stop requested, run still alive', 'Status stays Running until the monitor publishes the outcome. Only the button changes.', 'An acknowledged cancel request plus a fresh running status. The monitor decides the outcome.', '', Object.assign({}, RUNNING, { composer: 'stopping', notice: 'stopping', pane: false })],
    ['state-cancelled', 'Status', 'Cancelled', 'Settled cancel with nothing outstanding reported. Files stay. Continue can be refused, which the next two routes draw.', 'status cancelled; "work already written to disk is left in place"; continue barriers preserved.', '', { badge: 'cancelled', task: 'stopped', banner: 'cancelled', composer: 'settled', pane: false }],
    ['state-cancel-partial', 'Status', 'Cancelled, sub-tasks outstanding', 'Reports only what the cancel result names. Background processes are not listed because nothing reports them.', 'cascade fields documented in the MCP cancel_task docstring and cascade_incomplete in contracts.md.', 'Needs contract: ctl cancel has no canonical fixture, and contracts.md does not specify the cascade fields used here. HarflowMCP issue 118 (open) means survivors outside the process group are unreported.', { badge: 'cancelled', task: 'stopped', banner: 'cancelPartial', composer: 'settled', pane: false }],
    ['state-timed-out', 'Status', 'Timed out (turn limit)', 'In the engine this status means the turn cap, not a clock. Copy says so; the vocabulary word stays.', 'status timed_out; "exhausted its turn cap"; only Claude classifies it today.', '', { badge: 'timedOut', task: 'failed', banner: 'timedOut', composer: 'settled', pane: false }],
    ['state-settling', 'Status', 'Settling after finish', 'No task status is called settling. The badge keeps the reported status and a notice explains what may still arrive.', 'task-events log.state settling (30 s presentation grace); task-changes capture pending / capture_settling.', '', Object.assign({}, DONE, { notice: 'settling', composer: 'settled', pane: 'open', tab: 'changes', changes: 'settling' })],
    ['state-unknown-failed', 'Status', 'Unknown outcome · failed, exit not observed', 'Failed here is an inference. Status stays as reported, with the inference stated and Continue refused up front.', 'Terminal status with no exit code; continue requires observed exit and drained output.', '', { badge: 'failedInferred', task: 'failed', banner: 'unknownFailed', composer: 'settled', pane: false }],
    ['state-unknown-done', 'Status', 'Unknown outcome · done, reconstructed', 'Done here was reconstructed from the run\'s own output, so no recorded duration and no exit claim.', 'Recovered completed with no observed exit; the existing duration guard applies.', '', { badge: 'doneInferred', task: 'done', notice: 'reconstructed', composer: 'settled', pane: false }],
    ['state-owner-lost', 'Status', 'Unknown outcome · running, owner lost', 'The owner is confirmed dead and the process may live on. Only this case may say capture stopped.', 'supervision.owner_state dead; "confirmed owner death alone supports the loss claim".', '', { badge: 'runningOwnerLost', task: 'running', banner: 'ownerLost', composer: 'running', pane: false }],
    ['state-unverified', 'Status', 'Unknown outcome · running, owner undecidable', 'Harflow can\'t tell whether the owner is alive, so capture continuity is unknown rather than lost.', 'supervision.owner_state undecidable; output_capture unknown.', '', { badge: 'runningUnverified', task: 'running', banner: 'unverified', composer: 'running', pane: false }],
    ['state-launch-unknown', 'Status', 'Unknown outcome · continuation may have started', 'A continuation answered with no reliable report. Composer locks; the only action reads, it never replays.', 'Exit 3 with unknown.message; reconcile with reads; task-successors.v1.', '', { badge: 'failed', task: 'failed', banner: 'launchUnknown', composer: 'lockedUnknown', pane: false }],
    ['state-status-unavailable', 'Status', 'Status read unavailable', 'Reads failed. Cached transcript stays labelled, actions needing fresh authority are absent, no status is guessed.', 'Unknown error codes and transport failures are unavailable, never an empty success.', '', { badge: 'unavailable', task: 'stopped', notice: 'statusUnavailable', composer: 'lockedUnavailable', pane: false, menu: false, menuVariant: 'unavailable' }],
    ['state-pending', 'Status', 'Pending · waiting for resources', 'Launch has no task record yet. Resource context stays inline; Stop asks the owner to stop waiting.', 'task_pending_launch launch_state; cancel on a pending id.', '', { badge: 'pending', task: 'empty', resource: 'queued', composer: 'pending', pane: false }],
    ['state-taken-over', 'Status', 'Taken over', 'Takeover stays, per the owner. A taken-over task says so and its composer locks, whatever route took it over.', 'taken_over; existing badge annotation and locked composer.', '', { badge: 'takenOver', task: 'stopped', composer: 'lockedTakenOver', pane: false }],
    ['state-continue-starting', 'Status', 'Continue · starting', 'The action locks while the launch is answered. Acknowledgement is not completion.', 'Exit 0 with result.task_id acknowledges launch acceptance only.', '', Object.assign({}, FAILED, { banner: 'continueStarting', composer: 'lockedStarting', pane: false })],
    ['state-continue-started', 'Status', 'Continue · new session started', 'The successor becomes the conversation\'s next turn, and the earlier run stays readable.', 'continuation_of_task_id; a continuation is its own supervised task.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, turns: 2, notice: 'continued' })],
    ['state-continue-refused', 'Status', 'Continue · refused', 'A task with continuation history or auto-continue that was cancelled refuses Continue. Nothing started; the engine\'s reason is shown.', 'Launch refusal; stop_chain marker in task_continuation.py; not visible on status, so it is only known on refusal.', 'Source-derived: the chain-stop marker is not in contracts.md or on status, so the app learns it only from the refusal.', { badge: 'cancelled', task: 'stopped', banner: 'continueRefused', composer: 'settled', pane: false }],
    ['state-failed', 'Status', 'Failed · Continue in a new session', 'Replaces Retry with Continue in a new session, which is what ctl actually offers without new text.', 'continue: fresh session from a conclusively settled task; identical retries share one successor.', '', Object.assign({}, FAILED, { banner: 'failed', composer: 'settled', pane: false })],
    ['retry-options', 'Status', 'Decision · what Retry means', 'Three contract-honest readings of the approved Retry button, drawn side by side.', 'run, resume, continue launch semantics.', '', { board: 'retry' }],
    ['stop-options', 'Status', 'Decision · Stop or Cancel', 'The approved specimen says Stop in the composer; the ledger says Cancel in overflow.', 'Both call ctl cancel.', '', { board: 'stop' }],

    // G-OVERFLOW
    ['overflow-running', 'Actions', 'Overflow · running', 'Open menu for a running task. Takeover, per the closed owner decision, and repository actions live here once the old header goes.', 'canCancel; canTakeover; resume_command; task id; repoPath.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, menu: true })],
    ['overflow-settled', 'Actions', 'Overflow · settled', 'No Stop once settled. Copy resume command stays for the terminal route.', 'resume_command.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'single', menu: true })],
    ['overflow-subtask', 'Actions', 'Overflow · sub-task', 'Open parent task gets its surviving route. Sub-task provenance stays visible in the transcript head.', 'parent_task_id / spawned_by lineage.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, menu: true, subtask: true })],
    ['cancel-dialog', 'Actions', 'Stop confirmation', 'Exact scope in contract terms: best effort, Harflow lineage only, files stay, background processes not covered.', 'cancel_cascade; MCP cancel_task docstring; HarflowMCP issue 118.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, dialog: 'stop' })],
    ['cancel-dialog-lineage', 'Actions', 'Stop confirmation · earlier turns', 'The list of tasks this will not stop is client-derived from lineage and labelled that way.', 'Client lineage read; no engine field. Existing notCancelledByThisTitles behaviour.', 'Client-derived, not contract-backed: engine 0.0.11 returns no such list.', Object.assign({}, RUNNING, { composer: 'running', pane: false, dialog: 'stopLineage' })],
    ['takeover-dialog', 'Actions', 'Takeover · confirmation', 'Owner closed this on 2026-11-07: takeover keeps an entry. Existing confirmation text, with its entry placed in overflow.', 'takeover ctl, humans only; TaskDetailVM+Actions.swift didTapTakeover.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, dialog: 'takeover' })],

    // Top bar
    ['topbar-facts', 'Top bar', 'Top bar · chips reach facts', 'Access, notices and continuity are chips that open Events and expand the matching facts group, restoring focus on close.', 'enforcement block; status notices; supervision.adopted_after_restart.', '', Object.assign({}, RUNNING, { composer: 'running', pane: 'open', tab: 'events', events: 'populated', notices: 2, continuity: true, turns: 3, reveal: 'enforcement' })],
    ['topbar-resource', 'Top bar', 'Top bar · resource context', 'Resource context keeps its own inline card above the transcript. It is task state, not a fact to look up.', 'status resources; phase slot observation.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, resource: 'held', notices: 1 })],
    ['topbar-minimum', 'Top bar', 'Top bar · 1000 × 620', 'Meta drops first, access becomes icon-only with a label, chips keep counts. Nothing leaves reach.', 'Same as above; layout only.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false, notices: 2, continuity: true, turns: 3, frame: 'minimum' })],

    // G-DIFF
    ['changes-single', 'Changes', 'Changes · one repository', 'Repository, then scope, then rows. Attribution is the engine\'s fixed sentence, verbatim.', 'task-changes list mode; attribution; baseline_dirty.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'single' })],
    ['changes-multi', 'Changes', 'Changes · 8 repositories × 2 scopes', 'All available, more pages to read. Repositories collapse with counts, and the tab count sums stored row counts.', 'at most 8 repositories; row_count is the stored total; has_more.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'multi' })],
    ['changes-multi-limited', 'Changes', 'Changes · 8 repositories, some limited', 'One limited repository or scope removes the tab count. Each repository keeps its own number and state.', 'repository and scope state; rows_truncated.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'multiLimited' })],
    ['changes-same-path', 'Changes', 'Changes · same path in both scopes', 'Two rows, never merged; each diff header names its scope. Working tree says other writers can be in it.', 'Scopes are independent; working_tree includes other writers.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'samePath' })],
    ['changes-row-states', 'Changes', 'Changes · row content states', 'Truncated, binary, omitted, not captured, untracked directory, non-addressable and non-UTF-8 rows.', 'content {state, reason, bytes}; path_truncated; text_b64.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'rowStates' })],
    ['changes-incomplete', 'Changes', 'Changes · incomplete', 'Rows read so far stay; zero rows elsewhere is not proof of no changes while capture is incomplete.', 'capture incomplete; capture_timeout, output_ceiling, budget_exhausted.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'incomplete' })],
    ['changes-not-captured', 'Changes', 'Changes · not captured', 'Per-repository and per-scope reasons, with the document-level state above them.', 'not_captured reasons; capture.state stays available when every repository is not_captured.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'notCaptured' })],
    ['changes-unmerged', 'Changes', 'Changes · conflicts unknown', 'reported_conflicts is advisory; unmerged_unknown is stated rather than implied absent.', 'reported_conflicts; unmerged_unknown; rows are the real diff.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'unmerged' })],
    ['changes-running', 'Changes', 'Changes · running', 'Capture happens once, after the task settles. Nothing is shown as live while running.', 'pending / task_running.', '', Object.assign({}, RUNNING, { composer: 'running', pane: 'open', tab: 'changes', changes: 'running' })],
    ['changes-zero', 'Changes', 'Changes · zero rows, complete', 'Only the derived complete state may say no differences, and it still is not "the agent changed nothing".', 'available with zero rows; derived completeness.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'zero' })],
    ['changes-no-repository', 'Changes', 'Changes · no repository', 'A task can settle with no repository recorded.', 'available / no_repository.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'noRepository' })],
    ['changes-text', 'Changes', 'Changes · reading one diff', 'Text mode states: loading, a chunk with more to read, and a selector or cursor refusal.', 'text mode offset, has_more, next_cursor; changes_entry_not_found; changes_cursor_expired with reload first.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'text' })],
    ['changes-loading', 'Changes', 'Changes · loading', 'Static placeholder, no count and no zero.', 'First page read in flight.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'loading' })],
    ['changes-error', 'Changes', 'Changes · unavailable', 'Stored document unavailable. EditedFiles is not swapped in as a fallback.', 'capture_too_large, capture_error, changes_document_invalid; usage error is unsupported.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'error' })],
    ['changes-turns', 'Changes', 'Changes · which turn', 'Each turn is its own task with its own capture. The tab reads the current member by default and offers the others.', '"A continuation is its own supervised task"; task-list-page predecessor.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'turns', turns: 3 })],

    // Artifacts and Events
    ['artifacts-populated', 'Artifacts', 'Artifacts · populated', 'References with stat observations. Available does not mean unchanged contents. Load more appends a page.', 'task-artifacts availability at observed_at; page of at most 50.', 'Needs contract: task-artifacts has no canonical fixture or capability string yet.', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'artifacts', artifacts: 'populated' })],
    ['artifacts-page-error', 'Artifacts', 'Artifacts · next page failed', 'Loaded references stay. A manifest change rejects the cursor, so the read restarts.', 'Cursors are task-bound and reject manifest changes.', 'Needs contract: task-artifacts has no canonical fixture or capability string yet.', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'artifacts', artifacts: 'pageError' })],
    ['artifacts-empty', 'Artifacts', 'Artifacts · empty', 'A missing manifest is an empty registration set, not an error.', 'Missing manifests remain empty.', 'Needs contract: task-artifacts has no canonical fixture or capability string yet.', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'artifacts', artifacts: 'empty' })],
    ['artifacts-loading', 'Artifacts', 'Artifacts · loading', 'Static placeholder; no count.', 'First read in flight.', 'Needs contract: task-artifacts has no canonical fixture or capability string yet.', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'artifacts', artifacts: 'loading' })],
    ['artifacts-error', 'Artifacts', 'Artifacts · unavailable', 'A corrupt manifest reads as unavailable, with an explicit read retry.', 'Unqualified manifests report unavailable.', 'Needs contract: task-artifacts has no canonical fixture or capability string yet.', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'artifacts', artifacts: 'error' })],
    ['events-populated', 'Events', 'Events · facts and records', 'The approved activity events content inside the third tab. Facts groups sit above records, collapsed by default.', 'Activity transcript at 227da87; task-events; status snapshot.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'events', events: 'populated', notices: 2, turns: 3 })],
    ['events-page', 'Events', 'Events · paged records', 'Load earlier adds a bounded page above the records and keeps position, as the activity transcript does.', 'task-events older pages.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'events', events: 'page' })],
    ['events-page-error', 'Events', 'Events · next page failed', 'Loaded records stay; an expired cursor reloads from newest by request, as the activity transcript does.', 'event_cursor_expired and event_cursor_invalid with reload newest.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'events', events: 'pageError' })],
    ['events-not-started', 'Events', 'Pane · task not started', 'Every tab says the same honest thing while a launch is pending, because each read refuses it.', 'task_pending_launch on status, task-events, task-prompt and task-changes.', '', { badge: 'pending', task: 'empty', resource: 'queued', composer: 'pending', pane: 'open', tab: 'events' }],
    ['events-loading', 'Events', 'Events · loading', 'Independent placeholders for facts and records, as the activity transcript does.', 'task-events; status.', '', Object.assign({}, RUNNING, { composer: 'running', pane: 'open', tab: 'events', events: 'loading' })],
    ['events-empty', 'Events', 'Events · empty window', 'Empty window says so without qualifying totals.', 'Activity transcript empty captured window.', '', Object.assign({}, RUNNING, { composer: 'running', pane: 'open', tab: 'events', events: 'empty' })],
    ['events-error', 'Events', 'Events · unavailable', 'History unavailable does not imply task failure.', 'log.state unavailable; activity transcript.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'events', events: 'error' })],

    // G-ADAPTIVE
    ['adaptive-options', 'Layout', 'Decision · pane at minimum', 'Side by side leaves 316 points for the transcript. Three options drawn at the real minimum.', '1000 × 620 minimum; 264 sidebar; 420 pane.', '', { board: 'adaptive' }],
    ['adaptive-overlay', 'Layout', 'Pane over the transcript · 1000 × 620', 'Recommended below 900 points of detail width: no re-wrap, no anchor movement, Escape closes.', 'Layout only.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'single', frame: 'minimum' })],
    ['adaptive-split', 'Layout', 'Pane beside the transcript · 1280 × 800', 'At or above 900 points of detail width the pane sits beside the transcript, as approved in task/done.', 'task/done at 3643d08.', '', Object.assign({}, DONE, { composer: 'settled', pane: 'open', tab: 'changes', changes: 'single' })],
    ['adaptive-running-closed', 'Layout', 'Running · pane closed by default', 'Matches task/running. The toggle opens it; state is kept per conversation.', 'task/running at 3643d08.', '', Object.assign({}, RUNNING, { composer: 'running', pane: false })],
    ['adaptive-running-open', 'Layout', 'Running · pane opened', 'First open while running lands on Events, because Changes has nothing until capture.', 'pending / task_running; task-events log.state open.', '', Object.assign({}, RUNNING, { composer: 'running', pane: 'open', tab: 'events', events: 'populated' })],
    ['adaptive-failed-default', 'Layout', 'Failed · default pane state', 'Closed, matching the failed task screen (`task/failed`, now `task/failed-continue`), so the banner stays the focus. Remembered if the owner opens it.', 'task/failed at 3643d08.', '', Object.assign({}, FAILED, { banner: 'failed', composer: 'settled', pane: false })],

    // G-PLATFORM
    ['platform-options', 'Top bar', 'Decision · top bar composition', 'Specimen adjacency against the accepted entry title position, three ways, at both widths.', 'MainWindowNavigationView.swift:48 principal; TaskDetailToolbar.swift:80 primaryAction.', '', { board: 'platform' }]
  ];

  // Contract gaps are still open for these, so the approval does not cover them.
  var PROVISIONAL = ['state-cancel-partial', 'artifacts-populated', 'artifacts-page-error', 'artifacts-empty', 'artifacts-loading', 'artifacts-error'];
  // Boards record the decision. Options that were not chosen are not approved.
  var RECORDS = ['overview', 'retry-options', 'stop-options', 'adaptive-options', 'platform-options'];
  var DISPLAY_ONLY = 'Approved for display only: "Status unavailable" is not a task status and does not extend the status vocabulary. ';
  var states = rows.map(function (r) {
    var kind = PROVISIONAL.indexOf(r[0]) >= 0 ? 'provisional' : RECORDS.indexOf(r[0]) >= 0 ? 'record' : 'approved';
    var prefix = { approved: 'Approved by the owner, 2026-11-07. ', provisional: 'Provisional, not approved: contract gap open. ', record: 'Decision record. Options not chosen are not approved. ' }[kind];
    return { id: r[0], gap: r[1], title: r[2], summary: r[3], description: prefix + (r[0] === 'state-status-unavailable' ? DISPLAY_ONLY : '') + r[3], basis: r[4], flag: r[5], spec: r[6], kind: kind, approval: kind === 'approved' ? 'approved' : kind, approvalNote: kind === 'provisional' ? 'Provisional · not approved · contract gap open' : kind === 'record' ? 'Decision record · options not chosen are not approved' : '' };
  });
  H.m05ProposalStates = states;

  states.forEach(function (s) {
    var key = 'm05-proposal/' + s.id;
    T[key] = '<div class="hd-m05" data-theme="{{theme}}" data-light-on="{{lightOn}}" data-dark-on="{{darkOn}}" data-system-on="{{systemOn}}" data-m05-state="' + s.id + '"><div class="hd-m05-catalog" aria-label="' + STRIPS.label + '"></div><div class="hd-m05-stage"></div></div>';
    docs[key] = '<p><strong>' + (s.kind === 'approved' ? 'Approved by the owner, 2026-11-07.' : s.kind === 'provisional' ? 'Provisional, not approved.' : 'Decision record.') + '</strong> See the <a href="docs/decisions/m05-task-screen-approval.md">approval record</a> for scope. Approval does not establish native fidelity or product acceptance.</p><p>Fixtures are deterministic local text; no engine, provider or network is involved. Native toolbar, menus, materials and text rendering are browser approximations. <a href="docs/decisions/m05-task-screen-proposal.md">Semantics, copy tables and contract notes</a>.</p>';
  });

  // Routes: renderer id -> [family, state, group]. The renderer id stays the template key.
  var ROUTES = {
    'overview': ['records', 'task-overview', 'Overview'],
    'retry-options': ['records', 'retry', 'Status'],
    'stop-options': ['records', 'stop', 'Status'],
    'adaptive-options': ['records', 'adaptive', 'Layout'],
    'platform-options': ['records', 'platform', 'Top bar'],
    'state-running': ['task', 'running-stop', 'Status'],
    'state-stopping': ['task', 'stop-requested', 'Status'],
    'state-cancelled': ['task', 'cancelled', 'Status'],
    'state-cancel-partial': ['task', 'cancelled-partial', 'Status'],
    'state-timed-out': ['task', 'timed-out', 'Status'],
    'state-settling': ['task', 'settling', 'Status'],
    'state-unknown-failed': ['task', 'unknown-failed', 'Status'],
    'state-unknown-done': ['task', 'unknown-done', 'Status'],
    'state-owner-lost': ['task', 'owner-lost', 'Status'],
    'state-unverified': ['task', 'unverified', 'Status'],
    'state-launch-unknown': ['task', 'launch-unknown', 'Status'],
    'state-status-unavailable': ['task', 'status-unavailable', 'Status'],
    'state-pending': ['task', 'pending', 'Status'],
    'state-taken-over': ['task', 'taken-over', 'Status'],
    'state-continue-starting': ['task', 'continue-starting', 'Status'],
    'state-continue-started': ['task', 'continue-started', 'Status'],
    'state-continue-refused': ['task', 'continue-refused', 'Status'],
    'state-failed': ['task', 'failed-continue', 'Status'],
    'overflow-running': ['task', 'overflow-running', 'Actions'],
    'overflow-settled': ['task', 'overflow-settled', 'Actions'],
    'overflow-subtask': ['task', 'overflow-subtask', 'Actions'],
    'cancel-dialog': ['task', 'stop-dialog', 'Actions'],
    'cancel-dialog-lineage': ['task', 'stop-dialog-earlier-turns', 'Actions'],
    'takeover-dialog': ['task', 'takeover-dialog', 'Actions'],
    'topbar-facts': ['task', 'topbar-facts', 'Top bar'],
    'topbar-resource': ['task', 'topbar-resource', 'Top bar'],
    'topbar-minimum': ['task', 'topbar-minimum', 'Top bar'],
    'adaptive-overlay': ['task', 'pane-overlay', 'Layout'],
    'adaptive-split': ['task', 'pane-split', 'Layout'],
    'adaptive-running-closed': ['task', 'pane-running-closed', 'Layout'],
    'adaptive-running-open': ['task', 'pane-running-open', 'Layout'],
    'adaptive-failed-default': ['task', 'pane-failed-closed', 'Layout'],
    'changes-single': ['task', 'changes-single', 'Changes'],
    'changes-multi': ['task', 'changes-multi', 'Changes'],
    'changes-multi-limited': ['task', 'changes-multi-limited', 'Changes'],
    'changes-same-path': ['task', 'changes-same-path', 'Changes'],
    'changes-row-states': ['task', 'changes-row-states', 'Changes'],
    'changes-incomplete': ['task', 'changes-incomplete', 'Changes'],
    'changes-not-captured': ['task', 'changes-not-captured', 'Changes'],
    'changes-unmerged': ['task', 'changes-unmerged', 'Changes'],
    'changes-running': ['task', 'changes-running', 'Changes'],
    'changes-zero': ['task', 'changes-zero', 'Changes'],
    'changes-no-repository': ['task', 'changes-no-repository', 'Changes'],
    'changes-text': ['task', 'changes-text', 'Changes'],
    'changes-loading': ['task', 'changes-loading', 'Changes'],
    'changes-error': ['task', 'changes-error', 'Changes'],
    'changes-turns': ['task', 'changes-turns', 'Changes'],
    'artifacts-populated': ['task', 'artifacts-populated', 'Artifacts'],
    'artifacts-page-error': ['task', 'artifacts-page-error', 'Artifacts'],
    'artifacts-empty': ['task', 'artifacts-empty', 'Artifacts'],
    'artifacts-loading': ['task', 'artifacts-loading', 'Artifacts'],
    'artifacts-error': ['task', 'artifacts-error', 'Artifacts'],
    'events-populated': ['task', 'events-populated', 'Events'],
    'events-page': ['task', 'events-page', 'Events'],
    'events-page-error': ['task', 'events-page-error', 'Events'],
    'events-not-started': ['task', 'events-not-started', 'Events'],
    'events-loading': ['task', 'events-loading', 'Events'],
    'events-empty': ['task', 'events-empty', 'Events'],
    'events-error': ['task', 'events-error', 'Events']
  };
  var APPROVAL = { by: 'the owner', date: '2026-11-07', decision: 'Task screen states, relayed by the coordinator · native and runtime qualification separate' };
  states.forEach(function (s) {
    var route = ROUTES[s.id];
    H.registerState(route[0], {
      id: route[1], title: s.title, description: s.description, group: route[2], status: s.kind === 'approved' ? 'approved' : s.kind,
      approval: s.kind === 'approved' ? APPROVAL : undefined, approvalNote: s.approvalNote || undefined,
      source: { template: 'm05-proposal/' + s.id, renderer: 'm05', mount: s.id, guide: 'm05-proposal/' + s.id }
    });
  });
})();
