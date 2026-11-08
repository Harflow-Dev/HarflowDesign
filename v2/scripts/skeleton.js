// Loading skeletons. HFV2.skeletonize(host, spec) runs after a loaded screen has rendered in the specimen and
// replaces only the data of that screen with shimmering blocks. The screen's layout containers and its static
// chrome stay as rendered, so the regions of a skeleton keep the loaded geometry. The patterns drawn inside the
// data regions (row counts, line widths, graph shape) are authored in skeleton-specs.js; nothing is measured from
// the loaded fixture except the outer box of a region and the row height.
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var SHIMMER = 'hd-skel hd-skel--shimmer';
  var SHAPES = { line: '', pill: ' hd-skel--pill', circle: ' hd-skel--circle', soft: ' hd-skel--soft', rect: '' };

  function size(v) { return typeof v === 'number' ? v + 'px' : v; }

  // The markup of one block. `w` and `h` are numbers (pixels) or CSS lengths; `style` adds declarations.
  function block(w, h, shape, style) {
    return '<span class="' + SHIMMER + (SHAPES[shape || 'line'] || '') + '" aria-hidden="true" style="width:' + size(w) + ';height:' + size(h) + ';' + (style === undefined ? 'flex:none;' : style) + '"></span>';
  }
  H.skelBlock = block;

  function matches(frame, sel) {
    return Array.prototype.slice.call(frame.querySelectorAll(sel)).filter(function (el) {
      var parent = el.parentElement;
      return !(parent && parent.closest('[data-skel-region]'));
    });
  }

  // A region keeps the border box it has in the loaded screen.
  function pin(el, mode) {
    var w = el.offsetWidth, h = el.offsetHeight, st = el.style;
    st.boxSizing = 'border-box';
    st.overflow = 'hidden';
    st.width = w + 'px';
    if (mode === 'min') { st.minHeight = h + 'px'; } else { st.height = h + 'px'; st.flex = '0 0 auto'; }
    el.setAttribute('data-skel-region', '');
  }

  function stripActions(el) {
    Array.prototype.slice.call(el.attributes).forEach(function (a) {
      if (/^data-m0\d/.test(a.name) || a.name === 'data-route') el.removeAttribute(a.name);
    });
  }

  function lineMetrics(el, h) {
    var cs = window.getComputedStyle(el), fs = parseFloat(cs.fontSize) || 14, lh = parseFloat(cs.lineHeight);
    if (!lh || isNaN(lh)) lh = Math.round(fs * 1.4);
    var bh = h || Math.max(8, Math.round(fs * 0.8));
    if (bh > lh) bh = lh;
    return { display: cs.display, lh: lh, bh: bh, gap: Math.max(0, lh - bh) };
  }

  // Text: the element keeps its line box; its content becomes one block of an authored width, or a stack of
  // blocks (`lines`) of authored widths.
  function text(el, op, i) {
    var widths = op.lines || [].concat(op.w === undefined ? 120 : op.w);
    var m = lineMetrics(el, op.h);
    if (m.display === 'inline') el.style.display = 'inline-block';
    el.textContent = '';
    el.removeAttribute('title');
    el.removeAttribute('aria-label');
    var shape = op.shape || 'line';
    if (op.lines) {
      el.innerHTML = op.lines.map(function (w) { return block(w, m.bh, shape, 'max-width:100%;margin:0 0 ' + m.gap + 'px'); }).join('');
      return;
    }
    var w = widths[i % widths.length];
    el.innerHTML = block(w, m.bh, shape, 'flex:none;max-width:100%;margin:' + (m.gap / 2) + 'px 0');
  }

  // A box (button, pill, input, avatar, chip): the element is replaced by a block of the same outer box and
  // layout, or of an authored size.
  function fill(el, op) {
    var cs = window.getComputedStyle(el), st;
    var span = document.createElement('span');
    span.className = SHIMMER + (SHAPES[op.shape || 'rect'] || '');
    span.setAttribute('aria-hidden', 'true');
    st = span.style;
    var d = cs.display;
    st.display = d === 'inline' || d === 'inline-block' || d === 'inline-flex' ? 'inline-block' : 'block';
    st.boxSizing = 'border-box';
    st.width = size(op.w !== undefined ? op.w : el.offsetWidth);
    st.height = size(op.h !== undefined ? op.h : el.offsetHeight);
    st.margin = cs.margin;
    st.flex = cs.flex === '1 1 0%' ? '1 1 0%' : '0 0 auto';
    st.alignSelf = cs.alignSelf;
    st.verticalAlign = cs.verticalAlign;
    if (cs.position === 'absolute' || cs.position === 'relative') {
      st.position = cs.position; st.top = cs.top; st.left = cs.left; st.right = cs.right; st.bottom = cs.bottom;
    }
    if (cs.gridColumnStart !== 'auto') { st.gridColumn = cs.gridColumnStart + ' / ' + cs.gridColumnEnd; }
    if (op.radius) st.borderRadius = op.radius;
    el.replaceWith(span);
  }

  function rows(el, op) {
    var first = el.firstElementChild;
    var height = op.rowHeight || (first ? first.offsetHeight : 32);
    // A table body cannot take a fixed height; its table card is pinned by a separate op.
    if (op.pin === 'none') el.setAttribute('data-skel-region', ''); else pin(el, op.pin);
    var html = '';
    for (var i = 0; i < op.count; i += 1) html += op.row(i, height);
    el.innerHTML = html;
    if (op.rowHeight !== false) {
      Array.prototype.slice.call(el.children).forEach(function (row) { row.style.height = height + 'px'; row.style.boxSizing = 'border-box'; row.style.flex = 'none'; });
    }
  }

  var KINDS = {
    rows: function (el, op) { rows(el, op); },
    html: function (el, op, i) { pin(el, op.pin); el.innerHTML = typeof op.html === 'function' ? op.html(el, i) : op.html; },
    pin: function (el, op) { pin(el, op.pin); el.removeAttribute('data-skel-region'); },
    custom: function (el, op, i) { pin(el, op.pin); op.run(el, i); },
    text: function (el, op, i) { text(el, op, i); },
    fill: function (el, op) { fill(el, op); },
    settext: function (el, op) { el.textContent = op.text; },
    hide: function (el) { el.style.visibility = 'hidden'; el.setAttribute('aria-hidden', 'true'); },
    remove: function (el) { el.remove(); },
    disable: function (el) {
      el.setAttribute('aria-disabled', 'true');
      if ('readOnly' in el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) el.readOnly = true;
      stripActions(el);
      if (el.tagName === 'A') el.removeAttribute('href');
    },
    attr: function (el, op) { if (op.value === null) el.removeAttribute(op.name); else el.setAttribute(op.name, op.value); },
    drop: function (el, op) { (op.attrs || []).forEach(function (a) { el.removeAttribute(a); }); }
  };

  // Applies spec.ops to the frame found by spec.frame. Returns { ok, unmatched } so a harness can fail on a
  // selector that no longer matches the loaded screen.
  H.skeletonize = function (host, spec) {
    var frame = host.querySelector(spec.frame);
    var report = { ok: !!frame, unmatched: [], applied: 0 };
    if (!frame) return report;
    if (frame.hasAttribute('data-skeleton')) return report;
    spec.ops.forEach(function (op) {
      var found = matches(frame, op.sel);
      // A list op of a collapsible sidebar is not expected once the frame shows the rail; any other op must match.
      if (!found.length) { if (!op.optional && !(op.expandedOnly && frame.querySelector('.hd-rail'))) report.unmatched.push(op.sel); return; }
      found.forEach(function (el, i) { if (el.isConnected) { KINDS[op.kind](el, op, i); report.applied += 1; } });
    });
    frame.setAttribute('data-skeleton', '');
    frame.setAttribute('aria-busy', 'true');
    frame.setAttribute('role', 'group');
    frame.setAttribute('aria-label', spec.label);
    return report;
  };

  // Everything a person or a screen reader could read inside a frame: text, accessible names, titles, placeholders,
  // input values and SVG text. Returns a map of string to occurrence count.
  H.skeletonScan = function (frame) {
    var seen = {};
    function add(s) { s = String(s || '').replace(/\s+/g, ' ').trim(); if (s) seen[s] = (seen[s] || 0) + 1; }
    function hidden(el) { var cs = window.getComputedStyle(el); return cs.display === 'none' || cs.visibility === 'hidden'; }
    function visit(node) {
      if (node.nodeType === 3) { add(node.textContent); return; }
      if (node.nodeType !== 1 || hidden(node) || node.hasAttribute('hidden')) return;
      ['aria-label', 'title', 'placeholder', 'alt'].forEach(function (a) { if (node.hasAttribute(a)) add(node.getAttribute(a)); });
      if ((node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') && node.value) add(node.value);
      if (node.tagName === 'OPTION') return;
      Array.prototype.forEach.call(node.childNodes, visit);
    }
    // The frame's own loading label is not content: the screen carries it once, by construction.
    Array.prototype.forEach.call(frame.childNodes, visit);
    return seen;
  };
})();
