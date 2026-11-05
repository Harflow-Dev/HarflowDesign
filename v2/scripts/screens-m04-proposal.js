// Proposed M04 review routes. Canonical templates are resolved only at mount.
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var ids = ['shell','shell-collapsed','shell-narrow','composer-loading','composer-ready','composer-unqualified','composer-invalid','composer-starting','composer-refused','composer-unknown','advanced','history-empty','history-loading','history-older','history-error','history-reconnecting','history-retained','runtime-checking','runtime-install-required','runtime-update-required','runtime-installing','runtime-failed','runtime-listing'];
  H.m04ProposalStates = ids.map(function (id) { return { id: id, title: id.replace(/-/g, ' '), description: 'Proposed M04 ' + id.replace(/-/g, ' ') + ' review fixture.', status: 'Proposed', approved: false }; });
  var T = H.templates = H.templates || {};
  ids.forEach(function (id) { T['m04-proposal/' + id] = '<div class="hd-m04-proposal" data-theme="{{theme}}"><div class="hd-m04-catalog" aria-label="M04 proposal review controls"></div><div class="hd-m04-window"></div></div>'; });
})();
