// Which design replaces which. Applied entries mark the older state superseded and hide it from
// navigation, the picker and the overview counts; its route keeps rendering, with a note that links
// to the current design. Proposed entries wait for an owner decision: both states stay listed and the
// older one is labelled "Earlier layout; current status awaiting decision". To apply a proposed
// entry, move it to `applied`; nothing else changes.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});

  HFV2.supersessions = {
    applied: [
      { older: 'task/failed', newer: 'task/failed-continue', basis: 'The approved row for the failed state replaces Retry with Continue in a new session.' }
    ],
    proposed: [
      { older: 'task/running', newer: 'task/running-stop' },
      { older: 'task/done', newer: 'task/changes-single' },
      { older: 'task/activity-sources', newer: 'task/events-populated' },
      { older: 'new-task/default', newer: 'sidebar/expanded' },
      { older: 'new-task/harness-menu', newer: 'new-task/composer-ready' },
      { older: 'new-task/sidebar-collapsed', newer: 'sidebar/collapsed' },
      { older: 'new-task/composer-ready', newer: 'new-task/centered-ready' },
      { older: 'new-task/composer-unknown', newer: 'new-task/centered-unknown' },
      { older: 'new-task/options-open', newer: 'new-task/centered-options' }
    ]
  };

  function stateOf(route) {
    var parts = route.split('/');
    var family = HFV2.findFamily(parts[0]);
    return family ? HFV2.findState(family, parts[1]) : null;
  }

  HFV2.supersessions.applied.forEach(function (entry) {
    var older = stateOf(entry.older);
    var newer = stateOf(entry.newer);
    if (!older || !newer) throw new Error('Unknown route in supersession ' + entry.older + ' → ' + entry.newer);
    older.status = 'superseded';
    older.hidden = true;
    older.supersededBy = entry.newer;
    newer.supersedes = (newer.supersedes || []).concat(entry.older);
  });

  HFV2.supersessions.proposed.forEach(function (entry) {
    var older = stateOf(entry.older);
    if (!older || !stateOf(entry.newer)) throw new Error('Unknown route in supersession ' + entry.older + ' → ' + entry.newer);
    older.awaitingDecision = entry.newer;
  });
})();
