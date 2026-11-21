/* Provisional task activity edge. Derived fixtures only; earlier routes are unchanged. */
(function () {
  'use strict';
  var H = window.HFV2, T = H.templates, docs = H.componentDocs;
  var group = 'Conversation';
  var extra = '<div class="hd-msg-agent" data-edge-fixture="activity"><p>Checking the remaining changes and their effect on the current task.</p></div><div class="hd-msg-agent"><p>The validation is still running. I will report the result when it finishes.</p></div><div class="hd-msg-agent"><p>Reviewing the next section of the activity before the final check.</p></div>';
  var completed = '<div class="hd-msg-agent" data-edge-fixture="completed-call"><p>Checked the lockfile and reviewed the package changes against the advisory results.</p><p>The completed scan found no additional advisories in the updated packages.</p><p>The review is recorded with the call output.</p></div>';
  function insertBefore(html, marker, addition, start) {
    var at = html.indexOf(marker, start || 0);
    if (at < 0) throw new Error('Composer edge insertion point missing: ' + marker);
    return html.slice(0, at) + addition + html.slice(at);
  }
  function define(family, id, title, description, base, mode, min) {
    var route = family + '/' + id;
    var f = H.findFamily(family);
    if (f.groups.indexOf(group) < 0) f.groups.push(group);
    docs[route] = '<p><strong>Provisional, not approved.</strong> ' + description + ' Derived from <a href="#' + base + '">' + base + '</a>. Synthetic activity; browser rendering approximates the native interface.</p>';
    if (mode === 'task') {
      T[route] = '<div class="hd-m05 hd-msgq-host" data-theme="{{theme}}" data-light-on="{{lightOn}}" data-dark-on="{{darkOn}}" data-system-on="{{systemOn}}"><div class="hd-m05-catalog"></div><div class="hd-m05-stage"></div></div>';
    } else {
      Object.defineProperty(T, route, { configurable: true, enumerable: true, get: function () {
        var html = T[base];
        if (typeof html !== 'string') throw new Error('Missing edge base ' + base);
        if (id.indexOf('composer-edge-graph') === 0) {
          var call = html.indexOf('Call 2 · Codex');
          if (call < 0) throw new Error('Composer edge call detail missing');
          html = insertBefore(html, '<div style="display:flex;align-items:center;gap:var(--space-2);font-size:13px;line-height:18px;font-weight:500;color:var(--success);">', completed + completed, call);
        } else {
          var running = html.indexOf('hd-glyph--running', html.indexOf('<div class="hd-lanes">'));
          if (running < 0) throw new Error('Composer edge running lane missing');
          html = insertBefore(html, '<div class="hd-working">', extra + extra + extra + extra, running);
        }
        html = html.replace('class="hd-app', 'class="hd-app hd-composer-edge-fixture').replace('height: 800px', 'height: ' + (min ? '620' : '800') + 'px');
        if (min && html.indexOf('data-pl-min=') < 0) {
          var graph = id === 'composer-edge-graph-minimum';
          html = '<div class="hdc-specimen--minimum' + (graph ? ' hd-rq-min--graph' : '') + '" data-pl-min="sidebar,' + (graph ? 'canvas' : 'lanes') + ',topbar-meta">' + html + '</div>';
        }
        return html;
      }});
    }
    H.registerState(family, { id:id, title:title, description:description, group:group, status:'provisional', specimenSize:min ? '1000 × 620' : '1280 × 800', source: mode === 'task' ? {template:route, renderer:'composerEdge', mount:id, guide:route} : {template:route, guide:route} });
  }
  define('task','composer-edge','Conversation · Scrolling','Activity fades at the composer while more content remains below.','task/running-composer-empty','task');
  define('task','composer-edge-end','Conversation · At the end','The same activity reaches its end without a fade.','task/running-composer-empty','task');
  define('task','composer-edge-short','Conversation · Short activity','A short conversation leaves the composer anchored without a fade.','task/running-composer-empty','task');
  define('task','composer-edge-minimum','Conversation · Minimum window','Activity and composer at the minimum window size.','task/running-composer-empty','task',true);
  define('task','composer-edge-embedded','Conversation · Embedded detail','Partial shared task conversation boundary as mounted by group and embedded detail; host chrome is omitted.','task/running-stop','task');
  define('parallel-group','composer-edge','Lane conversation · Scrolling','The running lane retains its queued messages and controls.','parallel-group/lane-messages-queued','static');
  define('parallel-group','composer-edge-minimum','Lane conversation · Minimum window','The running lane at the minimum window size.','parallel-group/lane-messages-queued','static',true);
  define('workflow-run','composer-edge-parallel','Parallel conversation · Scrolling','Task lane activity above its fixed composer.','workflow-run/parallel','static');
  define('workflow-run','composer-edge-parallel-minimum','Parallel conversation · Minimum window','Task lane activity at the minimum window size.','workflow-run/parallel','static',true);
  define('workflow-run','composer-edge-graph','Selected node conversation · Scrolling','The selected on-demand node retains its queued message and controls.','workflow-run/node-message-queued','static');
  define('workflow-run','composer-edge-graph-minimum','Selected node conversation · Minimum window','The selected on-demand node at the minimum window size.','workflow-run/node-message-queued','static',true);

  H.RENDERERS.composerEdge = { api:'composerEdge', wrapper:'hdc-specimen hdc-specimen--m05' };
  H.composerEdge = { mount:function (root, id) {
    var base = H.m05ProposalStates.filter(function (s) { return s.id === (id === 'composer-edge-embedded' ? 'state-running' : 'running-composer-empty'); })[0];
    var state = Object.assign({}, base, { spec:Object.assign({}, base.spec, {frame:id === 'composer-edge-minimum' ? 'minimum' : 'reference'}) });
    var queued = H.messagesScreen.build('message-queued'), revealOutcome = false;
    var ext = { strip:function (s, ui, frameLabel) { return '<div class="hd-m05-strip"><strong>Provisional · not approved</strong>' + frameLabel + '</div><p class="hd-faint">Scroll the activity to compare its edge with the composer.</p>'; },
      hooks:{ transcriptTail:function (s, body) { if (id === 'composer-edge-short') return body; var at = body.lastIndexOf('<div class="hd-working">'); if (at < 0) throw new Error('Composer edge live activity missing'); return queued.hooks.transcriptTail(s, body.slice(0, at) + extra + extra + body.slice(at)); } },
      act:function (action) { var result = queued.act(action); revealOutcome = result === '.hd-msgq__outcome'; return result; },
      beforeRender:function () { var feed = root.querySelector('.hd-m05-scroll'); return feed ? feed.scrollTop : null; },
      afterRender:function (stage, saved) {
        var app = stage.querySelector('.hd-app'); app.classList.add('hd-composer-edge-fixture');
        if (id === 'composer-edge-embedded') app.classList.add('hd-composer-edge-partial');
        var feed = stage.querySelector('.hd-m05-scroll');
        if (id === 'composer-edge-short') feed.querySelector('.hd-transcript').innerHTML = '<div class="hd-msg-agent"><p>Checking the task now.</p></div>';
        setup(feed, saved === null && id === 'composer-edge-end');
        if (saved !== null) feed.scrollTop = saved;
        if (revealOutcome) {
          var outcome = feed.querySelector('.hd-msgq__outcome');
          if (outcome) {
            var view = feed.getBoundingClientRect(), row = outcome.getBoundingClientRect();
            if (row.bottom > view.bottom) feed.scrollTop += row.bottom - view.bottom;
            else if (row.top < view.top) feed.scrollTop -= view.top - row.top;
          }
          revealOutcome = false;
        }
      }
    };
    return H.m05Proposal.mountState(root, state, ext);
  }};

  function setup(feed, end) {
    if (!feed || feed.dataset.edgeReady) return;
    feed.dataset.edgeReady = 'true';
    var wrapper = document.createElement('div'); wrapper.className = 'hd-composer-edge-viewport';
    feed.parentNode.insertBefore(wrapper, feed); wrapper.appendChild(feed);
    var observer = new ResizeObserver(update), content = new MutationObserver(update);
    observer.observe(feed); if (feed.firstElementChild) observer.observe(feed.firstElementChild);
    content.observe(feed, {childList:true, subtree:true, characterData:true});
    function update() {
      if (!feed.isConnected) { observer.disconnect(); content.disconnect(); return; }
      var more = feed.scrollHeight - feed.clientHeight - feed.scrollTop > 1;
      wrapper.classList.toggle('has-more', more && !feed.contains(document.activeElement));
    }
    feed.addEventListener('scroll', update, {passive:true});
    feed.addEventListener('focusin', update); feed.addEventListener('focusout', function () { requestAnimationFrame(update); });
    if (end) feed.scrollTop = feed.scrollHeight;
    update();
  }
  function scan() {
    document.querySelectorAll('.hd-composer-edge-fixture').forEach(function (app) {
      app.querySelectorAll('.hd-lane').forEach(function (lane) {
        var feed = lane.querySelector(':scope > .hd-lane__body'), footer = lane.querySelector(':scope > .hd-lane__foot');
        if (!feed || !footer || feed.dataset.edgeReady) return;
        setup(feed, false);
      });
      var pane = app.querySelector('.hd-pane[aria-label="Selected on-demand node"]');
      if (pane) { var feed = pane.querySelector(':scope > .hd-scroll'); if (feed && !feed.dataset.edgeReady) setup(feed, false); }
    });
  }
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    new MutationObserver(scan).observe(document.body, {childList:true, subtree:true});
    scan();
  }
})();
