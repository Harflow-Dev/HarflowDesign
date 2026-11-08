/* Renderer of the queued-message states. The task screen frame is reused through its hooks: the bubbles are
   added to the transcript and the composer gains Send now or is locked. Deterministic browser-only fixtures. */
(function () {
  'use strict';
  var H = window.HFV2 = window.HFV2 || {};

  function esc(v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function must(html, from, to) {
    if (html.indexOf(from) < 0) throw new Error('Composer markup changed: ' + from);
    return html.replace(from, to);
  }

  // Captions are the labels of the native bubble: a claimed message is still captioned Queued.
  var CAPTION = { queued: 'Queued', delivering: 'Queued', uncertain: 'Delivery uncertain' };
  var SEND_NOW = '<button type="button" class="hd-btn hd-btn--ghost hd-btn--sm" data-m05="noop" disabled title="Ask for immediate delivery; an engine refusal keeps the message queued">Send now</button>';
  var CANCEL_LABEL = 'Cancel queued message';

  function pinned(b) { return b.kind === 'queued' || b.kind === 'delivering'; }
  // No whitespace between the parts: the user bubble keeps line breaks.
  function bubbleHtml(b) {
    return '<div class="hd-msg-user hd-msgq' + (pinned(b) ? ' hd-msgq--pending' : '') + '" data-message="' + esc(b.id) + '">' +
      '<span class="hd-msgq__caption">' + CAPTION[b.kind] + '</span>' +
      '<span class="hd-msgq__text">' + esc(b.text) + '</span>' +
      (b.note ? '<span class="hd-msgq__note">' + esc(b.note) + '</span>' : '') +
      (b.kind === 'queued' ? '<button type="button" class="hd-msgq__cancel" data-m05="msg-cancel:' + esc(b.id) + '" aria-label="' + CANCEL_LABEL + '">Cancel</button>' : '') +
      '</div>';
  }

  // The task screen state, hooks and action handler of one queued-message state. Each call starts a fresh mock.
  function build(mountId) {
    var def = (H.messageStates || []).filter(function (s) { return s.id === mountId; })[0];
    var base = def && (H.m05ProposalStates || []).filter(function (s) { return s.id === def.base; })[0];
    if (!def || !base) return null;
    var model = { removed: [], outcome: def.outcome };

    function visible() { return def.bubbles.filter(function (b) { return model.removed.indexOf(b.id) < 0; }); }

    var hooks = {
      // Settled bubbles stay above the live activity, pinned ones below it, in send order.
      transcriptTail: function (spec, body) {
        var list = visible();
        var settled = list.filter(function (b) { return !pinned(b); }).map(bubbleHtml).join('');
        var below = list.filter(pinned).map(bubbleHtml).join('');
        var live = body.lastIndexOf('<div class="hd-working">');
        if (live >= 0) body = body.slice(0, live) + settled + body.slice(live); else body += settled;
        return body + below + (model.outcome ? '<p class="hd-m05-caption hd-msgq__outcome" role="status" tabindex="-1">' + esc(model.outcome) + '</p>' : '');
      },
      composerSlot: function (spec, html) {
        if (def.composer === 'sendNow') return must(html, '<button type="submit" class="hd-composer__send"', SEND_NOW + '<button type="submit" class="hd-composer__send"');
        if (def.composer === 'locked') {
          html = must(html, 'placeholder="Queue a message…"', 'placeholder="" disabled');
          return must(html, 'Send queues. Send now requests delivery when safe.', '');
        }
        return html;
      }
    };
    // Cancel removes the message and moves focus to the outcome line, which is announced.
    function act(a) {
      if (a.indexOf('msg-cancel:') !== 0) return false;
      var id = a.slice('msg-cancel:'.length);
      if (visible().filter(function (b) { return b.id === id && b.kind === 'queued'; }).length === 0) return false;
      model.removed.push(id);
      model.outcome = 'Queued message cancelled.';
      return '.hd-msgq__outcome';
    }
    return { def: def, hooks: hooks, act: act, state: { id: mountId, spec: base.spec, kind: 'provisional', gap: '', summary: '', basis: '', flag: '' } };
  }

  function mount(root, mountId) {
    var built = build(mountId);
    if (!built) return function () {};
    var strips = H.catalogStrips.messages;
    var ext = {
      hooks: built.hooks,
      strip: function (state, ui, frameLabel) {
        return '<div class="hd-m05-strip"><strong>' + strips.provisional + '</strong>' + frameLabel + '</div><p class="hd-faint">' + strips.note + '</p>';
      },
      act: built.act
    };
    return H.m05Proposal.mountState(root, built.state, ext);
  }
  H.messagesScreen = { mount: mount, build: build };
})();
