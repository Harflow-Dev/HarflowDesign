/* Provisional root-pane approval drawings derived from the approved waiting state. */
(function () {
  'use strict';
  var H = window.HFV2, T = H.templates, docs = H.componentDocs;
  var family = 'workflow-run', base = family + '/orchestrator-steering-waiting';
  // Steering eligibility is independent from the pending worker task approvals.
  var steeringReport = { eligibleActions: ['reply'], inputQuestion: null, pendingInputs: [], usageRecovery: null };
  var requests = [
    ['Publish changes', 'Open pull request · Codex', 'git push origin audit/dependency-updates', 'Push the audited branch to the remote repository so the pull request can be opened.', 'Requires the access level Can publish.'],
    ['Install dependencies', 'Scan npm deps · Claude', 'npm ci', 'Install the dependencies from the lockfile before running the audit.', 'Runs in the workflow repository.'],
    ['Run migration check', 'Draft upgrade plan · Codex', 'python scripts/check_migrations.py --all', 'Check the complete migration set against the updated dependencies. This check reads the repository and writes a temporary report for the current task.', 'Runs in the workflow repository.'],
    ['Update lockfile', 'Scan Python deps · Claude', 'uv lock --upgrade-package httpx', 'Update the selected dependency and its resolved transitive dependencies in the lockfile. Review the resulting changes before publishing.', 'Changes the working tree.'],
    ['Create audit pull request', 'Security reviewer · Codex', 'gh pr create --title "Update dependencies" --body-file /tmp/audit-summary.md', 'Create a pull request containing the dependency updates and the audit summary. The summary includes the affected packages, verification results and any remaining advisories for the reviewer.', 'Creates a pull request in the remote repository.']
  ];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function card(r, open) {
    return '<details class="hd-approval hd-root-approval"' + (open ? ' open' : '') + '><summary class="hd-approval__head"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span><span class="hd-root-approval__summary"><strong>' + esc(r[0]) + '</strong><span class="hd-root-approval__command">' + esc(r[2]) + '</span><span class="hd-approval__src">' + esc(r[1]) + '</span></span><span class="hd-i hd-i--sm hd-i-chevron-right hd-root-approval__chevron" aria-hidden="true"></span></summary>' +
      '<div class="hd-approval__body"><p>' + esc(r[3]) + '</p><div class="hd-approval__cmd">' + esc(r[2]) + '</div><div class="hd-approval__meta">' + esc(r[4]) + '</div></div><div class="hd-approval__actions" role="group" aria-label="Decision for ' + esc(r[0]) + '"><button type="button" class="hd-btn hd-btn--primary">Approve once</button><button type="button" class="hd-btn hd-btn--ghost">Reject</button></div></details>';
  }
  function make(count, expanded, minimum) {
    var html = T[base], marker = '<div class="hd-row" style="gap:var(--space-2);"><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Dismiss</button></div>';
    if (typeof html !== 'string' || html.indexOf(marker) < 0 || html.indexOf(marker) !== html.lastIndexOf(marker)) throw new Error('Waiting pane or Dismiss not found uniquely');
    if (steeringReport.eligibleActions.indexOf('reply') < 0) throw new Error('Fixture does not report reply eligibility');
    var reply = '<textarea id="msg-orchestrator" class="hd-composer__input" rows="1" placeholder="Reply to the orchestrator" style="min-height:24px;"></textarea>';
    if (html.indexOf(reply) < 0) throw new Error('Eligible reply composer not found');
    var changes = [
      ['<span class="hd-topbar__meta">Step 2 of 4 · 06:31</span>', '<span class="hd-topbar__meta">Run started 02:00 · HarflowMCP</span>'],
      ['<span class="hd-task-row__meta">2/4</span>', '<span class="hd-task-row__meta">06:31</span>'],
      ['<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button>', '']
    ];
    changes.forEach(function (change) {
      if (html.indexOf(change[0]) < 0 || html.indexOf(change[0]) !== html.lastIndexOf(change[0])) throw new Error('Top bar fixture block not found uniquely');
      html = html.replace(change[0], change[1]);
    });
    var cards = requests.slice(0, count).map(function (r, i) { return card(r, expanded.indexOf(i) >= 0); }).join('');
    html = html.replace(marker, '<section class="hd-root-approvals" aria-label="Worker approval requests"><span class="hd-inspector__label">APPROVAL REQUESTS</span>' + cards + '</section>' + marker);
    if (minimum) html = html.replace('width: 100%; height: 800px;', 'width: 1000px; height: 620px;');
    return html;
  }
  function lazy(route, fn) { Object.defineProperty(T, route, { enumerable:true, configurable:true, get:function () { var value = fn(); Object.defineProperty(T, route, { enumerable:true, configurable:true, writable:true, value:value }); return value; } }); }
  var defs = [
    ['root-approval-single', 'Approval request · One expanded', 1, [0]],
    ['root-approval-five', 'Approval requests · One expanded', 5, [0]],
    ['root-approval-several', 'Approval requests · Several expanded', 5, [0, 2, 4]]
  ];
  var group = 'Approval requests', groups = H.findFamily(family).groups;
  if (groups.indexOf(group) < 0) groups.splice(Math.max(0, groups.indexOf('Minimum window')), 0, group);
  H.RENDERERS.rootApprovals = { api:'rootApprovals', wrapper:'hdc-specimen' };
  H.rootApprovals = { mount:function (root) {
    var fixes = ['sidebar', 'canvas', 'topbar-meta'], classes = ['hdc-specimen--minimum', 'hd-rq-min', 'hd-rq-min--graph'];
    root.classList.add.apply(root.classList, classes); H.applyMinimum(root, fixes);
    Array.prototype.forEach.call(root.querySelectorAll('.hd-canvas[role="img"]'), function (canvas) { canvas.removeAttribute('role'); });
    return function () { H.clearMinimum(root); root.classList.remove.apply(root.classList, classes); fixes.forEach(function (f) { root.classList.remove('hdc-min-' + f); }); };
  } };
  defs.forEach(function (d) {
    [false, true].forEach(function (minimum) {
      var id = d[0] + (minimum ? '-minimum' : ''), route = family + '/' + id;
      lazy(route, function () { return make(d[2], d[3], minimum); });
      docs[route] = '<p><strong>Provisional, not approved.</strong> Worker task approvals expand in the orchestrator pane after conversation history. Each request has its own decisions; the steering reply remains independently eligible. The pane body scrolls as one flow while its heading and composer remain fixed. The synthetic report includes reply as a current eligible action independently of the approvals; there is no input question, pending input or usage recovery. Synthetic fixture data. Derived from <a href="#workflow-run/orchestrator-steering-waiting">Orchestrator waiting for you</a>.</p>';
      var state = { id:id, title:d[1] + (minimum ? ' · 1000 × 620' : ''), description:'Worker task approval requests in the orchestrator pane, with request-local decisions.' + (minimum ? ' Drawn in the minimum window.' : ''), group:minimum ? 'Minimum window' : group, status:'provisional', approvalNote:'Provisional · not approved' };
      if (minimum) { state.specimenSize = '1000 × 620'; state.source = { renderer:'rootApprovals', mount:id }; }
      H.registerState(family, state);
    });
  });
})();
