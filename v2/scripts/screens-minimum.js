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
    description: 'The lanes of a parallel group in the minimum window. Each lane keeps a 360 point floor and the lanes scroll horizontally; the top bar drops its meta text so the title stays whole, and its dot shows the text on hover and focus; the sidebar body scrolls.',
    minimum: { of: 'parallel-group/lanes', fixes: ['sidebar', 'lanes', 'topbar-meta'] }
  });
  minimum('workflow-run', {
    id: 'parallel-minimum', title: 'Parallel view · 1000 × 620',
    description: 'A run as lanes in the minimum window. Each lane keeps a 360 point floor and the lanes scroll horizontally; the top bar drops its meta text so the title stays whole, and its dot shows the text on hover and focus; the sidebar body scrolls.',
    minimum: { of: 'workflow-run/parallel', fixes: ['sidebar', 'lanes', 'topbar-meta'] }
  });
  minimum('workflow-editor', {
    id: 'node-selected-minimum', title: 'Node selected · 1000 × 620',
    description: 'The editor with a node selected in the minimum window. The inspector is 288 points wide; the canvas scrolls; the top bar drops its meta text so the title stays whole, and its dot shows the text on hover and focus; the sidebar body scrolls.',
    minimum: { of: 'workflow-editor/node-selected', fixes: ['sidebar', 'inspector', 'canvas', 'topbar-meta'] }
  });
  minimum('workflow-editor', {
    id: 'orchestrator-minimum', title: 'Orchestrator · 1000 × 620',
    description: 'The locked orchestrator selected, in the minimum window. The inspector is 288 points wide and its body scrolls; the canvas scrolls; the top bar drops its meta text so the title stays whole, and its dot shows the text on hover and focus; the sidebar body scrolls.',
    minimum: { of: 'workflow-editor/orchestrator', fixes: ['sidebar', 'inspector', 'canvas', 'topbar-meta'] }
  });
  minimum('menu-bar', {
    id: 'busy-minimum', title: 'Busy · 1000 × 620',
    description: 'The popover with work in progress, in the minimum window. It is 380 points wide and 560 points tall; the header and footer stay fixed and the sections between them scroll.',
    minimum: { of: 'menu-bar/busy', fixes: ['popover'] }
  });

  // The loading drafts at 1000 × 620: the minimum fixes, then the loading skeleton of the loaded screen. `minimum.of`
  // names the loaded route the minimum draft derives from (one hop); `skeleton.spec` names the skeleton spec, a
  // minimum variant where the approved spec would undo a minimum fix (skeleton-specs.js).
  minimum('needs-you', {
    id: 'loading-minimum', title: 'Loading · 1000 × 620',
    description: 'The waiting list while its requests are read, in the minimum window: the request cards are placeholders, and the sidebar keeps its fixed header and footer with one scrolling body.',
    minimum: { of: 'needs-you/waiting', fixes: ['sidebar'] }, skeleton: { spec: 'needs-you' }
  });
  minimum('parallel-group', {
    id: 'loading-minimum', title: 'Loading · 1000 × 620',
    description: 'The lanes of a parallel group while they are read, in the minimum window: the lane contents are placeholders, the lanes keep their 360 point floor and scroll horizontally, and the top bar shows no meta text.',
    minimum: { of: 'parallel-group/lanes', fixes: ['sidebar', 'lanes', 'topbar-meta'] }, skeleton: { spec: 'parallel-group-minimum' }
  });
  minimum('workflow-run', {
    id: 'loading-parallel-minimum', title: 'Loading · 1000 × 620',
    description: 'A run as lanes while it is read, in the minimum window: the lane contents are placeholders, the lanes keep their 360 point floor and scroll horizontally, and the top bar shows no meta text.',
    minimum: { of: 'workflow-run/parallel', fixes: ['sidebar', 'lanes', 'topbar-meta'] }, skeleton: { spec: 'workflow-run-parallel-minimum' }
  });
  minimum('workflow-editor', {
    id: 'loading-minimum', title: 'Loading · 1000 × 620',
    description: 'A workflow being opened, in the minimum window: the title, standalone nodes, canvas graph and inspector fields are placeholders, the canvas scrolls, the inspector is 288 points wide, and the top bar shows no meta text.',
    minimum: { of: 'workflow-editor/node-selected', fixes: ['sidebar', 'inspector', 'canvas', 'topbar-meta'] }, skeleton: { spec: 'workflow-editor-minimum' }
  });
  minimum('menu-bar', {
    id: 'loading-minimum', title: 'Loading · 1000 × 620',
    description: 'The popover while its lists are read, in the minimum window: the counts and the Needs you, Running and Recent rows are placeholders, and the popover keeps its fixed header and footer.',
    minimum: { of: 'menu-bar/busy', fixes: ['popover'] }, skeleton: { spec: 'menu-bar' }
  });
})();
