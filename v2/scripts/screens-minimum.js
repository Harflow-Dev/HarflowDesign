// Minimum window drafts: the loaded screens drawn in the 1000 × 620 window. Each is derived from its loaded state:
// the same template runs, then HFV2.applyMinimum (minimum-frame.js) applies the fixes the window needs. The
// loaded states are not changed.
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});

  function minimum(familyId, state) {
    var base = { group: 'Minimum window', status: 'provisional', approvalNote: 'Provisional · needs owner approval' };
    Object.keys(state).forEach(function (k) { base[k] = state[k]; });
    return H.registerState(familyId, base);
  }

  minimum('needs-you', {
    id: 'waiting-minimum', title: 'Waiting · 1000 × 620',
    description: 'The waiting list in the minimum window. The sidebar keeps its header and footer fixed and scrolls its navigation and work lists as one body. Every screen with a sidebar follows this rule.',
    minimum: { of: 'needs-you/waiting', fixes: ['sidebar'] }
  });
  minimum('parallel-group', {
    id: 'lanes-minimum', title: 'Lanes · 1000 × 620',
    description: 'The lanes of a parallel group in the minimum window. Each lane keeps a 360 point floor and the lanes scroll horizontally; the top bar drops its meta text so the title stays whole; the sidebar body scrolls.',
    minimum: { of: 'parallel-group/lanes', fixes: ['sidebar', 'lanes', 'topbar-meta'] }
  });
  minimum('workflow-run', {
    id: 'parallel-minimum', title: 'Parallel view · 1000 × 620',
    description: 'A run as lanes in the minimum window. Each lane keeps a 360 point floor and the lanes scroll horizontally; the top bar drops its meta text so the title stays whole; the sidebar body scrolls.',
    minimum: { of: 'workflow-run/parallel', fixes: ['sidebar', 'lanes', 'topbar-meta'] }
  });
  minimum('workflow-editor', {
    id: 'node-selected-minimum', title: 'Node selected · 1000 × 620',
    description: 'The editor with a node selected in the minimum window. The inspector is 288 points wide; the top bar drops its meta text so the title stays whole; the sidebar body scrolls.',
    minimum: { of: 'workflow-editor/node-selected', fixes: ['sidebar', 'inspector', 'topbar-meta'] }
  });
  minimum('menu-bar', {
    id: 'busy-minimum', title: 'Busy · 1000 × 620',
    description: 'The popover with work in progress, in the minimum window. It is 380 points wide and 560 points tall; the header and footer stay fixed and the sections between them scroll.',
    minimum: { of: 'menu-bar/busy', fixes: ['popover'] }
  });
})();
