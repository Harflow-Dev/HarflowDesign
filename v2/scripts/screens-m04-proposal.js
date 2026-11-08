// Owner-approved M04 visual direction (2026-11-05). Canonical templates are resolved only at mount.
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var ids = ['shell','shell-collapsed','shell-narrow','composer-loading','composer-unqualified','composer-invalid','composer-starting','composer-refused','advanced-closed','history-empty','history-loading','history-older','history-error','history-reconnecting','history-retained','runtime-checking','runtime-install-required','runtime-update-required','runtime-installing','runtime-failed','runtime-listing'];
  H.m04ProposalStates = ids.map(function (id) { return { id: id, title: id.replace(/-/g, ' '), description: 'Approved M04 visual direction (2026-11-05): ' + id.replace(/-/g, ' ') + ' review fixture.', status: 'Approved', approved: true }; });
  // Owner-approved centered-composer amendment (2026-11-06), recorded separately
  // from the baseline approval above. Separate routes with their own root class
  // (hd-m04-amendment); the 24 baseline states are unchanged.
  var amendmentIds = ['amendment-empty','amendment-ready','amendment-growing','amendment-capped','amendment-options','amendment-unknown'];
  H.m04AmendmentStates = amendmentIds.map(function (id) { return { id: id, title: id.replace(/-/g, ' '), description: 'Owner-approved centered-composer amendment (2026-11-06, separate from the M04 baseline approval of 2026-11-05): ' + id.replace(/-/g, ' ') + ' review fixture.', status: 'Approved', approved: true }; });
  // Provisional centered redraws of six bottom-layout composer states and three shell states (not approved). The fixture of each
  // comes from its source mount, named in m04-proposal.js.
  var redrawIds = ['centered-loading','centered-unqualified','centered-invalid','centered-starting','centered-refused','centered-options-closed','centered-shell','centered-shell-collapsed','centered-shell-narrow'];
  H.m04RedrawStates = redrawIds.map(function (id) { return { id: id, title: id.replace(/-/g, ' '), description: 'Provisional centered redraw: ' + id.replace(/-/g, ' ') + ' review fixture.', status: 'Provisional', approved: false }; });
  var T = H.templates = H.templates || {};
  // Labels of the catalog-only strip above the app frame. The Node test scans them for process names.
  var STRIPS = (H.catalogStrips = H.catalogStrips || {}).m04 = {
    baselineLabel: 'Entry review controls',
    centeredLabel: 'Centered composer review controls',
    baselineHeading: 'Approved direction · 2026-11-05',
    centeredHeading: 'Approved amendment · Centered composer · Owner 2026-11-06',
    baselineNotice: 'Local preview · appearance preserves draft · route changes reset · Reduce Motion: instant changes. Native titlebar and OS controls are browser approximations.',
    provisionalHeading: 'Provisional · needs owner approval',
    provisionalNotice: 'Provisional · needs owner approval. Centered redraw of the earlier composer layout with the same content. Local preview · appearance preserves draft · route changes reset · Reduce Motion: instant changes. Native titlebar and OS controls are browser approximations.',
    centeredNotice: 'Approved amendment (owner, 2026-11-06), separate from the 2026-11-05 approval; the 2026-11-06 sidebar body-scroll correction applies to every entry, composer and sidebar state. Local preview · appearance preserves draft · route changes reset · Reduce Motion: instant changes. Native titlebar and OS controls are browser approximations; native validation is pending.'
  };
  ids.forEach(function (id) { T['m04-proposal/' + id] = '<div class="hd-m04-proposal" data-theme="{{theme}}"><div class="hd-m04-catalog" aria-label="' + STRIPS.baselineLabel + '"></div><div class="hd-m04-window"></div></div>'; });
  amendmentIds.concat(redrawIds).forEach(function (id) { T['m04-proposal/' + id] = '<div class="hd-m04-proposal hd-m04-amendment" data-theme="{{theme}}"><div class="hd-m04-catalog" aria-label="' + STRIPS.centeredLabel + '"></div><div class="hd-m04-window"></div></div>'; });

  // Routes: [renderer id, family, state, group, title, description]. The renderer id stays the template key.
  var ROWS = [
    ["shell", "sidebar", "expanded", "Layout", "Shell · Expanded", "Native shell adaptation of the approved composer."],
    ["shell-collapsed", "sidebar", "collapsed", "Layout", "Shell · Collapsed rail", "Native collapsed rail and accessible navigation."],
    ["shell-narrow", "sidebar", "minimum", "Layout", "Shell · Minimum window", "Minimum-size composition without font scaling."],
    ["composer-loading", "new-task", "composer-loading", "Composer", "Composer · Checking options", "Readiness is pending; the draft remains editable."],
    ["composer-unqualified", "new-task", "composer-unqualified", "Composer", "Composer · Unavailable options", "Unsupported or unqualified selections cannot start."],
    ["composer-invalid", "new-task", "composer-invalid", "Composer", "Composer · Validation", "Invalid input and requested options need correction."],
    ["composer-starting", "new-task", "composer-starting", "Composer", "Composer · Starting", "One in-flight start retains the draft and prevents duplicates."],
    ["composer-refused", "new-task", "composer-refused", "Composer", "Composer · Refused", "A definitive refusal preserves the draft for review."],
    ["advanced-closed", "new-task", "options-closed", "Task options", "Task options · Closed", "Customized task options retained behind the bottom-left plus button."],
    ["history-empty", "sidebar", "history-empty", "Recent work", "History · Empty", "No running or recent work in the available listing."],
    ["history-loading", "sidebar", "history-loading", "Recent work", "History · Loading", "Initial listing has no fabricated work rows."],
    ["history-older", "sidebar", "history-older", "Recent work", "History · Loading older", "Older-page loading retains already loaded rows."],
    ["history-error", "sidebar", "history-error", "Recent work", "History · Read failure", "Failed reads preserve loaded work and offer explicit retry."],
    ["history-reconnecting", "sidebar", "history-reconnecting", "Recent work", "History · Reconnecting", "Reconnect preserves identity and uncertainty."],
    ["history-retained", "sidebar", "history-retained", "Recent work", "History · Retained selection", "A selected identity remains stable across retention changes."],
    ["runtime-checking", "harness-runtime", "checking", null, "Runtime · Checking", "Runtime readiness is not yet established."],
    ["runtime-install-required", "harness-runtime", "install-required", null, "Runtime · Installation required", "Explicit runtime installation is required before creation."],
    ["runtime-update-required", "harness-runtime", "update-required", null, "Runtime · Update required", "Installed and required versions remain distinct."],
    ["runtime-installing", "harness-runtime", "installing", null, "Runtime · Preparing", "Local fixture of preparation progress; no downloads occur."],
    ["runtime-failed", "harness-runtime", "failed", null, "Runtime · Failure and retry", "A retained diagnostic requires explicit retry."],
    ["runtime-listing", "harness-runtime", "listing", null, "Runtime · Ready, listing pending", "Qualified runtime and first-list connection are independent."],
    ["amendment-empty", "new-task", "centered-empty", "Entry", "Centered composer · Empty", "Owner-approved centered-composer amendment (2026-11-06, separate from the 2026-11-05 entry direction): the greeting, composer, status and help group centered in the New task area, with the prompt compact at one visual line."],
    ["amendment-ready", "new-task", "centered-ready", "Composer", "Centered composer · One line ready", "Owner-approved centered-composer amendment (2026-11-06, separate from the 2026-11-05 entry direction): a one-line ready draft with valid, qualified selections in the centered layout."],
    ["amendment-growing", "new-task", "centered-growing", "Composer", "Centered composer · Growing", "Owner-approved centered-composer amendment (2026-11-06, separate from the 2026-11-05 entry direction): the prompt grows to roughly three soft-wrapped visual lines as the draft is typed."],
    ["amendment-capped", "new-task", "centered-capped", "Composer", "Centered composer · Capped at six lines", "Owner-approved centered-composer amendment (2026-11-06, separate from the 2026-11-05 entry direction): past six visible lines the prompt stops growing and scrolls with the existing soft slim scrollbar."],
    ["amendment-options", "new-task", "centered-options", "Task options", "Centered composer · Options open", "Owner-approved centered-composer amendment (2026-11-06, separate from the 2026-11-05 entry direction): task options open from the centered composer, placed above or below by the space actually available."],
    ["amendment-unknown", "new-task", "centered-unknown", "Composer", "Centered composer · Outcome unknown", "Owner-approved centered-composer amendment (2026-11-06, separate from the 2026-11-05 entry direction): an unknown start outcome locks the retained draft and selections inside the centered layout."],
    ["centered-loading", "new-task", "centered-loading", "Composer", "Centered composer · Checking options", "Readiness is pending; the draft remains editable.", "composer-loading"],
    ["centered-unqualified", "new-task", "centered-unqualified", "Composer", "Centered composer · Unavailable options", "Unsupported or unqualified selections cannot start.", "composer-unqualified"],
    ["centered-invalid", "new-task", "centered-invalid", "Composer", "Centered composer · Validation", "Invalid input and requested options need correction.", "composer-invalid"],
    ["centered-starting", "new-task", "centered-starting", "Composer", "Centered composer · Starting", "One in-flight start retains the draft and prevents duplicates.", "composer-starting"],
    ["centered-refused", "new-task", "centered-refused", "Composer", "Centered composer · Refused", "A definitive refusal preserves the draft for review.", "composer-refused"],
    ["centered-options-closed", "new-task", "centered-options-closed", "Task options", "Centered composer · Task options closed", "Customized task options retained behind the bottom-left plus button.", "advanced-closed"],
    ["centered-shell", "sidebar", "centered-expanded", "Layout", "Centered shell · Expanded", "Native shell adaptation of the composer.", "shell"],
    ["centered-shell-collapsed", "sidebar", "centered-collapsed", "Layout", "Centered shell · Collapsed rail", "Native collapsed rail and accessible navigation.", "shell-collapsed"],
    ["centered-shell-narrow", "sidebar", "centered-minimum", "Layout", "Centered shell · Minimum window", "Minimum-size composition without font scaling.", "shell-narrow"]
  ];
  var APPROVAL = {
    baseline: { by: 'the owner', date: '2026-11-05', decision: 'Entry visual direction · native and runtime qualification separate' },
    centered: { by: 'the owner', date: '2026-11-06', decision: 'Centered composer amendment · separate from the 2026-11-05 entry direction' }
  };
  var ROUTE_OF = {};
  ROWS.forEach(function (row) { ROUTE_OF[row[0]] = row[1] + '/' + row[2]; });
  ROWS.forEach(function (row) {
    var id = row[0];
    var redraw = redrawIds.indexOf(id) >= 0;
    var state = {
      id: row[2], title: row[4], description: redraw ? row[5] + ' Centered redraw of the earlier layout.' : row[5], group: row[3] || undefined,
      source: { template: 'm04-proposal/' + id, renderer: 'm04', mount: id, guide: 'm04-proposal/' + id }
    };
    if (redraw) {
      // Not approved: no approval date, and a link to the earlier layout it redraws.
      state.status = 'provisional';
      state.approvalNote = STRIPS.provisionalHeading;
      state.redrawOf = ROUTE_OF[row[6]];
    } else {
      state.status = 'approved';
      state.approval = amendmentIds.indexOf(id) >= 0 ? APPROVAL.centered : APPROVAL.baseline;
    }
    H.registerState(row[1], state);
  });
})();
