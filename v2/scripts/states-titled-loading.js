/* Loading states with a known title. Provisional, not approved.
   When the title of a task or a parallel group is already known, the loading screen shows it in the top bar instead of
   a shimmering block. Each state is the approved loading state it redraws with that one block changed: the same loaded
   template, the same skeleton spec, minus the title op.
   - Task: the title is known once the work listing has been read, so the sidebar is the loaded one with the task
     selected; everything else is the loading placeholder of task/loading. task/loading stays for a task whose title is
     not known yet (opened before the listing is read, for example from a link on a cold start).
   - Parallel group: the group is opened by its name, so the title is always known; the redraws keep the cold-start
     sidebar of the approved states and only stop shimmering the title. Their pairs are in HFV2.pendingRedraw.
   Loaded after skeleton-specs.js and states-parallel-lanes.js, whose specs it derives from. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var S = H.skeletonSpecs;
  if (!S || !S['task'] || !S['task-pane'] || !S['parallel-group'] || !S['parallel-group-minimum'] || !S['parallel-group-two']) return;
  var docs = (H.componentDocs = H.componentDocs || {});
  var NOTE = 'Provisional · not approved';

  var TASK_TITLE = '.hd-m05-window .hd-app .hd-m05-bar__center .hd-topbar__title';
  var GROUP_TITLE = '.hd-app .hd-topbar .hd-topbar__title';
  // The sidebar ops of the task specs: every op inside the sidebar listing.
  var SIDEBAR = /\.hd-nav-item__count|\.hd-nav \.hd-dot|\.hd-rail|\[aria-label="(Running|Recent work)"\]/;

  // `known` names the regions that render loaded fixture text (the title; for a task also the sidebar). The allowlist
  // comparison excludes them; every other string must still be on the approved allowlist, which is copied unchanged.
  function without(base, test, known) {
    var ops = base.ops.filter(function (op) { return !test(op); });
    return Object.assign({}, base, { ops: ops, chrome: Object.assign({}, base.chrome), known: known });
  }
  function taskVariant(base) {
    return without(base, function (op) { return op.sel === TASK_TITLE || SIDEBAR.test(op.sel); }, ['title', 'sidebar']);
  }
  function groupVariant(base) {
    return without(base, function (op) { return op.sel === GROUP_TITLE && op.kind === 'text'; }, ['title']);
  }

  S['task-known-title'] = taskVariant(S['task']);
  S['task-pane-known-title'] = taskVariant(S['task-pane']);
  S['parallel-group-known-title'] = groupVariant(S['parallel-group']);
  S['parallel-group-minimum-known-title'] = groupVariant(S['parallel-group-minimum']);
  S['parallel-group-two-known-title'] = groupVariant(S['parallel-group-two']);

  function doc(route, text) {
    docs[route] = '<p><strong>Provisional, not approved.</strong> ' + text + ' <a href="docs/decisions/README.md#loading-states-with-a-known-title">Decision record</a>.</p>';
  }
  function provisional(familyId, state, text) {
    doc(familyId + '/' + state.id, text);
    return H.registerState(familyId, Object.assign({ status: 'provisional', approvalNote: NOTE }, state));
  }

  provisional('task', {
    id: 'loading-known-title', title: 'Loading · Title known', group: 'Loading',
    description: 'A task whose title is already known, for example from the sidebar: the top bar shows the title and the sidebar is the loaded one with the task selected; the status, meta, transcript and composer options are placeholders.',
    skeleton: { of: 'task/running-stop', spec: 'task-known-title' }
  }, 'Task · Loading with the title known. The title is drawn as in the loaded screen; the other data regions are those of Task · Loading. Task · Loading remains the state for a task whose title is not known yet.');
  provisional('task', {
    id: 'loading-pane-known-title', title: 'Loading · Right pane open · Title known', group: 'Loading',
    description: 'The same read with the right pane open: the top bar shows the known title, tab names are real and the pane body is a placeholder.',
    skeleton: { of: 'task/pane-running-open', spec: 'task-pane-known-title' }
  }, 'Task · Loading with the right pane open and the title known. Task · Loading · Right pane open remains the state for a task whose title is not known yet.');
  provisional('parallel-group', {
    id: 'loading-known-title', title: 'Loading · Title known', group: 'Loading',
    description: 'The lanes of a parallel group being read: the top bar shows the group title; the top bar facts, each lane header and its transcript are placeholders on the real lane frames and composers.',
    skeleton: { of: 'parallel-group/lanes', spec: 'parallel-group-known-title' }
  }, 'Parallel group · Loading with the group title shown. Redraws Parallel group · Loading, whose title shimmers.');
  provisional('parallel-group', {
    id: 'loading-known-title-minimum', title: 'Loading · Title known · 1000 × 620', group: 'Minimum window',
    description: 'The lanes of a parallel group while they are read, in the minimum window: the top bar shows the group title and no meta text, the lane contents are placeholders, and the lanes keep their 360 point floor and scroll horizontally.',
    minimum: { of: 'parallel-group/lanes', fixes: ['sidebar', 'lanes', 'topbar-meta'] }, skeleton: { spec: 'parallel-group-minimum-known-title' }
  }, 'Parallel group · Loading at 1000 × 620 with the group title shown. Redraws Parallel group · Loading · 1000 × 620.');
  provisional('parallel-group', {
    id: 'loading-two-known-title', title: 'Loading · Member count unknown · Title known', group: 'Lane states',
    description: 'The lane frames while the member count is unknown: the top bar shows the group title; two frames, with the real top bar frame and composers.',
    skeleton: { of: 'parallel-group/two-lanes', spec: 'parallel-group-two-known-title' }
  }, 'Parallel group · Loading with the member count unknown and the group title shown. Redraws Parallel group · Loading · Member count unknown.');
})();
