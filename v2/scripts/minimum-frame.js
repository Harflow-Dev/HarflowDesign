// Minimum window drafts. HFV2.applyMinimum(host, fixes) runs after a loaded static screen has rendered into a
// specimen that is drawn at 1000 × 620. It wraps, moves or hides existing nodes, wraps a bare text node, creates empty
// wrapper elements and one empty decorative dot per top bar meta, sets tabindex, role and aria-hidden, moves an
// aria-label verbatim, and installs the listeners that show the meta text on hover and focus. The only runtime state is
// the is-dismissed class, which the Escape handling toggles on a meta. It never creates text content. The CSS is
// minimum-frame.css.
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

  // The meta text is the first thing to leave a top bar. Every meta element of the top bar keeps its text in the
  // accessibility tree once, as visually hidden text, and shows it as a tooltip on hover and on keyboard focus. The meta
  // is a small focusable target: its dot, which is the screen's own dot or an empty neutral one added here.
  function bindMeta(meta) {
    var st = { hover: false, focus: false, dismissed: false };
    meta.__hdcMin = st;
    function sync() {
      if (!st.hover && !st.focus) st.dismissed = false;
      if (st.dismissed) meta.classList.add('is-dismissed'); else meta.classList.remove('is-dismissed');
    }
    meta.addEventListener('mouseenter', function () { st.hover = true; sync(); });
    meta.addEventListener('mouseleave', function () { st.hover = false; sync(); });
    meta.addEventListener('focusin', function () { st.focus = true; sync(); });
    meta.addEventListener('focusout', function () { st.focus = false; sync(); });
  }

  function topbarMeta(host) {
    var bound = [];
    Array.prototype.slice.call(host.querySelectorAll('.hd-topbar__meta')).forEach(function (meta) {
      var node = null;
      Array.prototype.slice.call(meta.childNodes).forEach(function (child) {
        if (child.nodeType === 3 && child.nodeValue.trim()) node = child;
      });
      if (!node) return;
      var hidden = document.createElement('span');
      hidden.className = 'hd-sr';
      meta.replaceChild(hidden, node);
      hidden.appendChild(node);
      if (!meta.querySelector('.hd-dot')) {
        var dot = document.createElement('span');
        dot.className = 'hd-topbar__meta-dot';
        dot.setAttribute('aria-hidden', 'true');
        meta.insertBefore(dot, hidden);
      }
      meta.setAttribute('tabindex', '0');
      meta.setAttribute('role', 'note');
      bindMeta(meta);
      bound.push(meta);
    });
    if (!bound.length) return;
    // One document listener per specimen render: Escape dismisses a revealed meta text, whether hover or focus
    // revealed it. The next render removes this listener (applyMinimum) before it adds its own.
    var onKey = function (event) {
      if (event.key !== 'Escape') return;
      bound.forEach(function (meta) {
        var st = meta.__hdcMin;
        if ((st.hover || st.focus) && !st.dismissed) { st.dismissed = true; meta.classList.add('is-dismissed'); }
      });
    };
    host.__hdcMinEscape = onKey;
    document.addEventListener('keydown', onKey);
  }

  // Mac: the graph canvas scrolls. Only the graph layer scrolls: the add-node tray and the zoom control stay over it.
  // The canvas label, the tab stop and the region role move to the scrolling viewport.
  function canvas(host) {
    Array.prototype.slice.call(host.querySelectorAll('.hd-canvas')).forEach(function (cv) {
      var layer = kids(cv)[0];
      if (!layer || layer.classList.contains('hd-canvas__scroll')) return;
      var scroll = document.createElement('div');
      scroll.className = 'hd-canvas__scroll';
      var label = cv.getAttribute('aria-label');
      if (label) {
        scroll.setAttribute('aria-label', label);
        cv.removeAttribute('aria-label');
      }
      scroll.setAttribute('tabindex', '0');
      scroll.setAttribute('role', 'region');
      cv.insertBefore(scroll, layer);
      scroll.appendChild(layer);
    });
  }

  // Mac: the inspector opens at 288 points. The width is set in CSS.
  function inspector() {}

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

  var FIXES = { sidebar: sidebar, lanes: lanes, canvas: canvas, inspector: inspector, 'topbar-meta': topbarMeta, 'editor-topbar': topbarMeta, popover: popover };

  H.minimumFixes = Object.keys(FIXES);
  // Removes the Escape listener a render left on the document. A render that is not a minimum state calls this.
  H.clearMinimum = function (host) {
    if (host.__hdcMinEscape) { document.removeEventListener('keydown', host.__hdcMinEscape); host.__hdcMinEscape = null; }
  };
  H.applyMinimum = function (host, fixes) {
    H.clearMinimum(host);
    (fixes || []).forEach(function (name) {
      if (!FIXES[name]) throw new Error('Unknown minimum fix ' + name);
      FIXES[name](host);
      host.classList.add('hdc-min-' + name);
    });
  };
})();
