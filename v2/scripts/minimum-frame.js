// Minimum window drafts. HFV2.applyMinimum(host, fixes) runs after a loaded static screen has rendered into a
// specimen that is drawn at 1000 × 620. It only wraps, moves or hides existing nodes, wraps a bare text node, and sets
// one title copied verbatim from existing text. It never creates text content. The CSS is minimum-frame.css.
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});

  function kids(parent) { return Array.prototype.slice.call(parent.children); }

  // Mac: a fixed header, a scrolling list and a fixed footer. The nav and the sections scroll as one body.
  function sidebar(host) {
    Array.prototype.slice.call(host.querySelectorAll('.hd-sidebar')).forEach(function (side) {
      var top = null, foot = null, body = [];
      kids(side).forEach(function (child) {
        if (child.classList.contains('hd-sidebar__top')) top = child;
        else if (child.classList.contains('hd-sidebar__foot')) foot = child;
        else body.push(child);
      });
      if (!top || !foot || !body.length) return;
      var wrap = document.createElement('div');
      wrap.className = 'hd-sidebar__scroll';
      side.insertBefore(wrap, body[0]);
      body.forEach(function (node) { wrap.appendChild(node); });
    });
  }

  // Lanes keep a floor and scroll horizontally; the floor is set in CSS.
  function lanes() {}

  // The meta text is the first thing to leave the editor top bar. The dot stays, and the same text stays in the
  // accessibility tree once, as visually hidden text; the dot's wrapper carries it as a title for pointer users.
  function editorTopbar(host) {
    var meta = host.querySelector('.hd-topbar__meta');
    if (!meta) return;
    var node = null;
    Array.prototype.slice.call(meta.childNodes).forEach(function (child) {
      if (child.nodeType === 3 && child.nodeValue.trim()) node = child;
    });
    if (!node) return;
    var hidden = document.createElement('span');
    hidden.className = 'hd-sr';
    meta.replaceChild(hidden, node);
    hidden.appendChild(node);
    meta.setAttribute('title', node.nodeValue.trim());
  }

  // Mac: a fixed-size popover with a fixed header and footer; the sections between them scroll.
  function popover(host) {
    var pop = host.querySelector('section[aria-label="Harflow menu"]');
    if (!pop) return;
    var items = kids(pop);
    if (items.length < 3) return;
    var middle = items.slice(1, items.length - 1);
    var wrap = document.createElement('div');
    wrap.className = 'hd-popover__scroll';
    pop.insertBefore(wrap, middle[0]);
    middle.forEach(function (node) { wrap.appendChild(node); });
  }

  var FIXES = { sidebar: sidebar, lanes: lanes, 'editor-topbar': editorTopbar, popover: popover };

  H.minimumFixes = Object.keys(FIXES);
  H.applyMinimum = function (host, fixes) {
    (fixes || []).forEach(function (name) {
      if (!FIXES[name]) throw new Error('Unknown minimum fix ' + name);
      FIXES[name](host);
      host.classList.add('hdc-min-' + name);
    });
  };
})();
