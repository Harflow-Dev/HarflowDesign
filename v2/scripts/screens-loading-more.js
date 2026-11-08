// Loading states of the attention, workflow, capacity and settings screens. Each is drawn from the loaded screen it
// mirrors (see skeleton-specs.js for the data regions and patterns).
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var APPROVAL = { by: 'the owner', date: '2026-11-08', decision: 'Loading states' };

  function loading(familyId, state) {
    var base = { group: 'Loading', status: 'approved', approval: APPROVAL };
    Object.keys(state).forEach(function (k) { base[k] = state[k]; });
    return H.registerState(familyId, base);
  }

  loading('needs-you', {
    id: 'loading', title: 'Loading', description: 'Requests being read: the waiting count and the request cards are placeholders; the title and sidebar navigation are the real screen.',
    skeleton: { of: 'needs-you/waiting', spec: 'needs-you' }
  });
  loading('menu-bar', {
    id: 'loading', title: 'Loading', description: 'The popover while its lists are read: counts and the Needs you, Running and Recent rows are placeholders; the section headings and footer actions are real.',
    skeleton: { of: 'menu-bar/busy', spec: 'menu-bar' }
  });
  loading('workflows', {
    id: 'loading', title: 'Loading', description: 'The workflow list being read: the rows are placeholders; the title, search and New workflow are real.',
    skeleton: { of: 'workflows/list', spec: 'workflows' }
  });
  loading('workflow-editor', {
    id: 'loading', title: 'Loading', description: 'A workflow being opened: the title, standalone nodes, canvas graph and inspector fields are placeholders; the toolbar, node tray and zoom are real.',
    skeleton: { of: 'workflow-editor/node-selected', spec: 'workflow-editor' }
  });
  loading('workflow-run', {
    id: 'loading', title: 'Loading', description: 'A run being opened on its graph: the header, standalone nodes, canvas and node pane are placeholders.',
    skeleton: { of: 'workflow-run/on-demand', spec: 'workflow-run' }
  });
  loading('workflow-run', {
    id: 'loading-parallel', title: 'Loading · Parallel view', description: 'A run being opened as lanes: the header and each lane are placeholders.',
    skeleton: { of: 'workflow-run/parallel', spec: 'workflow-run-parallel' }
  });
  loading('resources', {
    id: 'loading', title: 'Loading', description: 'Slots being read: the harness cards and the waiting list are placeholders; the title and headings are real.',
    skeleton: { of: 'resources/slots', spec: 'resources' }
  });
  loading('statistics', {
    id: 'loading', title: 'Loading', description: 'Usage being read: the figures, chart and table cells are placeholders; the title, range control, labels and column headers are real.',
    skeleton: { of: 'statistics/overview', spec: 'statistics' }
  });
  loading('settings', {
    id: 'loading-general', title: 'Loading · General', description: 'The General page being read: toggles and status text are placeholders; the labels are real.',
    skeleton: { of: 'settings/general', spec: 'settings-general' }
  });
  loading('settings', {
    id: 'loading-harnesses', title: 'Loading · Harnesses', description: 'The Harnesses page being read: the harness rows and qualification are placeholders.',
    skeleton: { of: 'settings/harnesses', spec: 'settings-harnesses' }
  });
  loading('settings', {
    id: 'loading-mcp-approvals', title: 'Loading · MCP approvals', description: 'Tool approvals being read: the harness rows and the approvals list are placeholders.',
    skeleton: { of: 'settings/mcp-approvals', spec: 'settings-mcp-approvals' }
  });
})();
