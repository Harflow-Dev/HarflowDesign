/* Renderer of the provisional task transcript states. The m05 task screen frame is reused through its hooks;
   the transcript builders and the controller come from d2b-proposal.js. Deterministic browser-only fixtures. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};
  var NAME = 'Fix slot release test', META = 'Codex · HarflowMCP';

  function mount(root, mountId, options) {
    var host = root.matches && root.matches('.hd-m05') ? root : root.querySelector('.hd-m05');
    if (!host) return function () {};
    var model = H.d2bProposal.createState(mountId);
    var running = model.status === 'Running';
    var route = H.routeFor('transcript', mountId);
    var strips = H.catalogStrips.transcript;
    var badge = H.m05Proposal.BADGES[running ? 'running' : 'done'];
    var controller = H.d2bTranscript.attach(host, model, function () {
      var facts = host.querySelector('[data-d2b-facts]');
      return {
        controls: host.querySelector('[data-d2b-controls]'), request: host.querySelector('[data-d2b-request]'),
        boundary: host.querySelector('[data-d2b-boundary]'), rows: host.querySelector('[data-d2b-rows]'),
        history: host.querySelector('.hd-d2b-history'), live: host.querySelector('[data-d2b-live]'),
        facts: facts, factsScroll: facts && facts.closest('.hd-m05-panescroll')
      };
    });
    var ext = {
      hooks: {
        transcriptSlot: function () {
          return '<div data-d2b-request></div><div class="hd-scroll hd-d2b-history" tabindex="0" aria-label="Captured transcript"><div data-d2b-boundary tabindex="-1"></div><div data-d2b-rows></div></div><div class="hd-d2b-live hd-muted" role="status" aria-live="polite" data-d2b-live></div>';
        },
        eventsBody: function () { return '<div class="hd-d2b-facts hd-tr-facts" data-d2b-facts></div>'; },
        identity: {
          title: NAME, meta: META, badge: [badge[0], badge[1], running ? 'Running' : 'Done'], chips: '', menu: false,
          sidebarTitle: NAME, href: '#' + route, disabledTabs: ['changes', 'artifacts']
        }
      },
      strip: function (state, ui, frameLabel) {
        return '<div class="hd-m05-strip"><strong>' + strips.provisional + '</strong>' + frameLabel + '<span class="hd-tr-controls" data-d2b-controls></span></div><p class="hd-faint">' + strips.note + '</p>';
      },
      beforeRender: function () { return controller.snapshot(); },
      afterRender: function (stage, saved) { controller.refresh(saved); }
    };
    var spec = { badge: running ? 'running' : 'done', task: running ? 'running' : 'done', composer: running ? 'running' : 'settled', pane: !!(options && options.view === 'events'), tab: 'events' };
    var dispose = H.m05Proposal.mountState(root, { id: mountId, spec: spec, kind: 'provisional', gap: '', summary: '', basis: '', flag: '' }, ext);
    return function () { controller.dispose(); dispose(); };
  }
  H.transcriptScreen = { mount: mount };
})();
