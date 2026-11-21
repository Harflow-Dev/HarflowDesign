/* Provisional selected-inspector approval companions. Synthetic fixtures only. */
(function () {
  'use strict';
  var H = window.HFV2, T = H.templates, docs = H.componentDocs, family = 'workflow-run';
  var requests = [
    ['Run verification', 'Security reviewer · Codex', 'bash -c "printf checking-dependency-lockfile-and-verification-results-for-the-selected-workflow-task; printf checking-the-complete-synthetic-test-output-before-continuing"', 'Run the requested verification for this task.', 'Runs in the workflow repository.'],
    ['Inspect packages', 'Security reviewer · Codex', 'bash -c "printf inspecting-synthetic-package-inventory-and-all-resolved-dependency-versions-before-the-audit-continues"', 'Inspect the package inventory.', 'Runs in the workflow repository.'],
    ['Check reports', 'Security reviewer · Codex', 'bash -c "printf checking-synthetic-audit-reports-and-comparing-the-results-with-the-current-lockfile"', 'Check the audit reports.', 'Runs in the workflow repository.'],
    ['Prepare summary', 'Security reviewer · Codex', 'bash -c "printf preparing-a-synthetic-summary-of-each-dependency-and-the-validation-results"', 'Prepare the audit summary.', 'Runs in the workflow repository.'],
    ['Run final check', 'Security reviewer · Codex', 'bash -c "printf running-the-final-synthetic-verification-of-every-package-and-all-recorded-audit-results"', 'Run the final check.', 'Runs in the workflow repository.']
  ];
  var runRequests = [
    ['Install dependencies', 'Security reviewer · Codex', 'npm ci', 'Install the dependencies from the lockfile before running the audit.', 'Runs in the workflow repository.'],
    ['Run migration check', 'Docs checker · Claude', 'python scripts/check_migrations.py --all', 'Check the complete migration set against the updated dependencies.', 'Runs in the workflow repository.']
  ];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function swap(html, from, to) {
    var at = html.indexOf(from);
    if (at < 0 || html.indexOf(from, at + from.length) >= 0) throw new Error('Expected unique fixture block: ' + from.slice(0, 80));
    return html.slice(0, at) + to + html.slice(at + from.length);
  }
  function card(r, open, settled) {
    var result = settled ? '<div class="hd-approval__result" role="status" tabindex="-1"><p class="hd-approval__result-title">Answered in Harflow · approve</p><p>Oct 14, 2026, 5:46 PM</p><p>This request already has an answer. This response did not change it.</p></div>' : '<div class="hd-approval__actions" role="group" aria-label="Decision for ' + esc(r[0]) + '"><button type="button" class="hd-btn hd-btn--primary" data-inspector-decision="approve">Approve once</button><button type="button" class="hd-btn hd-btn--ghost" data-inspector-decision="reject">Reject</button></div>';
    return '<details class="hd-approval hd-root-approval' + (settled ? ' hd-approval--settled' : '') + '"' + (open ? ' open' : '') + '><summary class="hd-approval__head"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span><span class="hd-root-approval__summary"><strong>' + esc(r[0]) + '</strong><span class="hd-root-approval__command">' + esc(r[2]) + '</span><span class="hd-approval__src">' + esc(r[1]) + '</span></span><span class="hd-i hd-i--sm hd-i-chevron-right hd-root-approval__chevron" aria-hidden="true"></span></summary><div class="hd-approval__body"><p>' + esc(r[3]) + '</p><div class="hd-approval__cmd">' + esc(r[2]) + '</div><div class="hd-approval__meta">' + esc(r[4]) + '</div></div>' + result + '</details>';
  }
  function section(label, list, expanded, settled) {
    return '<section class="hd-root-approvals" aria-label="' + label + '"><span class="hd-inspector__label">' + label.toUpperCase() + '</span>' + list.map(function (r, i) { return card(r, expanded.indexOf(i) >= 0, settled && i === 0); }).join('') + '</section>';
  }
  function paneParts(html) {
    var start = html.indexOf('<aside class="hd-pane"'), end = html.indexOf('</aside>', start), pane = html.slice(start, end + 8);
    var feed = pane.indexOf('<div class="hd-scroll"'), body = pane.indexOf('>', feed) + 1, footer = pane.lastIndexOf('<div style="flex:none;');
    if (start < 0 || end < 0 || feed < 0 || footer < 0) throw new Error('Inspector structure missing');
    return { start:start, end:end + 8, pane:pane, feed:feed, body:body, footer:footer };
  }
  function replacePane(html, old, pane) { return html.slice(0, old.start) + pane + html.slice(old.end); }
  function make(kind, minimum) {
    var single = kind === 'single', steering = kind === 'steering';
    var html = T[single || steering ? 'workflow-run/graph-needs-you' : 'workflow-run/node-message-queued'];
    var p = panePartsForGraph(html, single || steering);
    var taskRequests = requests.map(function (r) { var copy = r.slice(); if (single || steering) copy[1] = steering ? 'Orchestrator · Codex' : 'Open pull request · Codex'; return copy; });
    var cards = section('Task approval requests', taskRequests.slice(0, single ? 1 : 5), kind === 'expanded' ? [0, 1, 2, 4] : [0], kind === 'settled');
    var pane = p.pane;
    if (single || steering) {
      var approval = pane.indexOf('<div class="hd-approval" role="group"');
      if (approval < 0 || pane.indexOf('<div class="hd-approval" role="group"', approval + 1) >= 0) throw new Error('Graph approval missing or duplicated');
      pane = pane.slice(0, approval) + cards + '</div></aside>';
      if (steering) {
        var root = paneParts(T['workflow-run/orchestrator-steering-waiting']);
        var rootBody = root.pane.slice(root.body, root.footer);
        // Remove the scrolling container close; retain the conversation and Dismiss within our body.
        var dismiss = '<div class="hd-row" style="gap:var(--space-2);"><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Dismiss</button></div>';
        rootBody = swap(rootBody, dismiss, section('Run-scoped worker approval requests', runRequests, [0, 1], false) + dismiss);
        if (!/<\/div>\s*$/.test(rootBody)) throw new Error('Root feed close missing');
        rootBody = rootBody.replace(/<\/div>\s*$/, '');
        pane = swap(pane, '</div></aside>', '<h3 class="hd-inspector-approvals__heading">Orchestrator</h3>' + rootBody + '</div>' + root.pane.slice(root.footer));
      }
    } else {
      // Keep the queued reply as the last message in the task content.
      var originalQueue = H.laneParts.queue([{kind:'queued', text:'Also check whether the lockfile pins a vulnerable transitive dependency.'}]);
      var queue = H.laneParts.queue([{kind:'queued', text:'Check the lockfile too.'}]);
      var activity = '<div style="display:flex;flex-direction:column;gap:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border);"><span class="caption hd-faint">Call 2';
      if (pane.indexOf(originalQueue) < 0 || pane.indexOf(activity) < 0) throw new Error('Queued bubble or call activity missing');
      pane = swap(pane, originalQueue, queue);
      pane = swap(pane, '<span class="caption hd-faint">Call 2 · Codex · gpt-6 · HarflowMCP</span>', '<span class="caption hd-faint">Call 2 · Codex · gpt-6 · HarflowMCP</span>' + cards);
      pane = swap(pane, '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" data-m05="noop" disabled title="Ask for immediate delivery; an engine refusal keeps the message queued">Send now</button>', '');
      pane = swap(pane, '<span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span style="flex:1;min-width:0;font-weight:600;">Call 2 · Done · 01:12</span><a class="hd-link" href="#task/done">', '<span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span style="flex:1;min-width:0;font-weight:600;">Call 2 · Needs you · 01:12</span><a class="hd-link" href="#task/approval-exact">');
      pane = swap(pane, '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:13px;line-height:18px;font-weight:500;color:var(--success);"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span>Done · no advisories · 01:12</span></div>', '');
    }
    html = replacePane(html, p, pane);
    var host = single || steering ? '<div class="hd-app" data-theme=' : '<div class="hd-app hd-msgq-host" data-theme=';
    var decoratedHost = single || steering ? '<div class="hd-app hd-inspector-approvals-fixture hd-composer-edge-fixture" data-theme=' : '<div class="hd-app hd-msgq-host hd-inspector-approvals-fixture hd-composer-edge-fixture" data-theme=';
    html = swap(html, host, decoratedHost);
    if (!single && !steering) html = swap(html, '<span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span>2 calls</div></button>', '<span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span>2 calls · Needs you</div></button>');
    if (!single && !steering) html = swap(html, 'aria-label="Security reviewer, on demand node, 2 calls, selected"', 'aria-label="Security reviewer, on demand node, 2 calls, needs you, selected"');
    if (steering) {
      html = swap(html, '<button type="button" class="hd-node hd-node--orchestrator" aria-label="Orchestrator, locked">', '<button type="button" class="hd-node hd-node--orchestrator is-selected" aria-label="Orchestrator, locked, selected" aria-pressed="true">');
      html = swap(html, 'class="hd-node hd-node--waiting is-selected"', 'class="hd-node hd-node--waiting"');
      html = swap(html, '<span class="hd-topbar__title">Open pull request</span><span class="hd-badge', '<span class="hd-topbar__title">Orchestrator</span><span class="hd-badge');
      html = swap(html, '<div class="caption hd-faint">Codex · gpt-6 · HarflowMCP</div>', '<div class="caption hd-faint">Orchestrator · Codex · gpt-6 · HarflowMCP</div>');
      html = swap(html, 'The upgrade plan changes 3 packages: <code>httpx</code>, <code>pydantic</code> and <code>pytest</code>. The lockfile is updated on the branch.', 'Reviewing the workflow plan and coordinating the dependency audit.');
      html = swap(html, 'Security reviewer, on demand node, 2 calls', 'Security reviewer, on demand node, 2 calls, needs you');
      html = swap(html, 'Docs checker, on demand node, not called', 'Docs checker, on demand node, needs you');
      html = swap(html, '<span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span>2 calls · one at a time', '<span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span>2 calls · Needs you');
      html = swap(html, '<div class="hd-node__meta">Not called</div>', '<div class="hd-node__meta"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span>Needs you</div>');
      html = swap(html, 'aria-label="Selected step"', 'aria-label="Selected orchestrator task"');
    }
    if (minimum) html = swap(html, 'height: 800px', 'height: 620px');
    // The graph shell predates the approved top bar.
    html = swap(html, '<span class="hd-topbar__meta">Step 2 of 4 · 06:31</span>', '<span class="hd-topbar__meta">Run started 02:00 · HarflowMCP</span>');
    html = swap(html, '<span class="hd-task-row__meta">2/4</span>', '<span class="hd-task-row__meta">06:31</span>');
    html = swap(html, '<button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button>', '');
    return html;
  }
  function panePartsForGraph(html, graph) {
    if (!graph) return paneParts(html);
    var start = html.indexOf('<aside class="hd-pane"'), end = html.indexOf('</aside>', start);
    if (start < 0 || end < 0) throw new Error('Graph inspector missing');
    return {start:start, end:end + 8, pane:html.slice(start, end + 8)};
  }
  H.RENDERERS.inspectorApprovals = {api:'inspectorApprovals', wrapper:'hdc-specimen'};
  H.inspectorApprovals = {mount:function (root, id) {
    var min = /-minimum$/.test(id), fixes = ['sidebar','canvas','topbar-meta'];
    if (min) { root.classList.add('hdc-specimen--minimum', 'hd-rq-min', 'hd-rq-min--graph'); H.applyMinimum(root, fixes); root.querySelectorAll('.hd-canvas[role="img"]').forEach(function (canvas) { canvas.removeAttribute('role'); }); }
    var app = root.querySelector('.hd-inspector-approvals-fixture'), feed = app.querySelector('.hd-pane > .hd-scroll');
    if (id.indexOf('inspector-approvals-single') !== 0) H.composerEdge.setup(feed, false);
    function decide(event) {
      var button = event.target.closest('[data-inspector-decision]');
      if (!button || !root.contains(button)) return;
      var details = button.closest('details'), actions = button.parentNode, result = document.createElement('div');
      result.className = 'hd-approval__result'; result.setAttribute('role', 'status'); result.tabIndex = -1;
      var title = document.createElement('p'); title.className = 'hd-approval__result-title'; title.textContent = 'Answered in Harflow · ' + button.dataset.inspectorDecision; result.appendChild(title);
      actions.replaceWith(result); details.classList.add('hd-approval--settled'); result.focus();
    }
    root.addEventListener('click', decide);
    return function () { root.removeEventListener('click', decide); if (min) { H.clearMinimum(root); root.classList.remove('hdc-specimen--minimum','hd-rq-min','hd-rq-min--graph'); fixes.forEach(function (f) { root.classList.remove('hdc-min-' + f); }); } };
  }};
  var group = 'Approval requests', groups = H.findFamily(family).groups;
  if (groups.indexOf(group) < 0) groups.push(group);
  [['single','Approval request · One'],['stacked','Approval requests · Stacked'],['expanded','Approval requests · Expanded'],['settled','Approval request · Answered elsewhere'],['steering','Approval requests · Orchestrator conversation']].forEach(function (def) {
    [false,true].forEach(function (min) {
      var id = 'inspector-approvals' + (def[0] === 'stacked' ? '' : '-' + def[0]) + (min ? '-minimum' : ''), route = family + '/' + id;
      Object.defineProperty(T, route, {configurable:true, enumerable:true, get:function () { return make(def[0], min); }});
      docs[route] = '<p><strong>Provisional, not approved.</strong> Synthetic task approval requests grow within the selected inspector. Decisions belong to each request. The task composer or independently eligible orchestrator reply remains fixed where present.</p>';
      H.registerState(family, {id:id, title:'Selected inspector · ' + def[1] + (min ? ' · 1000 × 620' : ''), description:'Inline approval requests in the selected task inspector.', group:min ? 'Minimum window' : group, status:'provisional', approvalNote:'Provisional · not approved', specimenSize:min ? '1000 × 620' : '1280 × 800', source:{template:route, renderer:'inspectorApprovals', mount:id, guide:route}});
    });
  });
})();
