// Loading states of the start-work and task screens. Each is drawn from the loaded screen it mirrors: the loaded
// template and renderer run, then HFV2.skeletonize replaces the data regions (patterns in skeleton-specs.js).
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var PROVISIONAL = 'Provisional · needs owner approval';
  var SIDEBAR_APPROVAL = { by: 'the owner', date: '2026-11-08', decision: 'Sidebar' };

  function loading(familyId, state) {
    var base = { group: 'Loading', status: 'provisional', approvalNote: PROVISIONAL };
    Object.keys(state).forEach(function (k) { base[k] = state[k]; });
    return H.registerState(familyId, base);
  }

  loading('new-task', {
    id: 'loading', title: 'Loading', description: 'The first listing: the composer options, the repository and the sidebar work rows are placeholders while the greeting, composer frame and navigation are the real screen.',
    skeleton: { of: 'new-task/centered-empty', spec: 'new-task' }
  });
  loading('sidebar', {
    id: 'loading', title: 'Loading', description: 'Running and Recent work rows are placeholders while the navigation, section headings and footer are real.',
    skeleton: { of: 'new-task/centered-empty', spec: 'sidebar' }, status: 'approved', approval: SIDEBAR_APPROVAL, approvalNote: undefined
  });
  loading('task', {
    id: 'loading', title: 'Loading', description: 'A task being read for the first time: the title, status, transcript and composer options are placeholders; the top bar frame, Events toggle and composer are the real screen.',
    skeleton: { of: 'task/running-stop', spec: 'task' }
  });
  loading('task', {
    id: 'loading-pane', title: 'Loading · Right pane open', description: 'The same first read with the right pane open: tab names are real and the pane body is a placeholder.',
    skeleton: { of: 'task/pane-running-open', spec: 'task-pane' }
  });

  loading('parallel-group', {
    id: 'loading', title: 'Loading', description: 'The lanes of a parallel group being read: the top bar facts, each lane header and its transcript are placeholders on the real lane frames and composers.',
    skeleton: { of: 'parallel-group/lanes', spec: 'parallel-group' }
  });
})();
