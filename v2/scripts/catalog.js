// Navigation, appearance and rendering for the v2 interface reference.
(function () {
  'use strict';

  var HFV2 = window.HFV2;
  var STORAGE_KEY = 'hf-v2-appearance';
  var MODES = ['system', 'light', 'dark'];
  var PENDING = 'Earlier layout; redraw awaiting owner approval';

  var els = {
    nav: document.getElementById('hdc-nav'),
    picker: document.getElementById('hdc-state-picker'),
    theme: document.getElementById('hdc-theme'),
    eyebrow: document.getElementById('hdc-eyebrow'),
    title: document.getElementById('hdc-title'),
    description: document.getElementById('hdc-description'),
    approval: document.getElementById('hdc-approval'),
    note: document.getElementById('hdc-note'),
    stage: document.getElementById('hdc-stage'),
    specimen: document.getElementById('hdc-specimen'),
    caption: document.getElementById('hdc-caption'),
    doc: document.getElementById('hdc-doc'),
    live: document.getElementById('hdc-live')
  };

  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var current = { family: null, state: null, override: null, view: null };

  function readPreference() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return MODES.indexOf(value) >= 0 ? value : 'system';
    } catch (error) {
      return 'system';
    }
  }

  function writePreference(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      // Storage can be unavailable; the preference then lasts for this page only.
    }
  }

  var preference = readPreference();

  function selection() {
    return current.override || preference;
  }

  function resolve(mode) {
    if (mode === 'system') return media && media.matches ? 'dark' : 'light';
    return mode;
  }

  var findFamily = HFV2.findFamily;
  var findState = HFV2.findState;

  // Old routes resolve to their canonical route (alias, then redirect) before the route is looked up. The
  // canonical route keeps a view only when its state declares it, so a view here is always a declared one.
  function parseHash(hash) {
    var match = HFV2.parseRoute(HFV2.resolveRoute(hash || ''));
    if (!match) return null;
    var family = findFamily(match.family);
    if (!family || !findState(family, match.state)) return null;
    return { family: match.family, state: match.state, view: match.view, override: match.appearance };
  }

  function hashFor(family, state, override, view) {
    return '#' + family + '/' + state + (view ? '/' + view : '') + (override ? '/' + override : '');
  }

  function go(family, state, override, view) {
    var hash = hashFor(family, state, override, view);
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function titleOfRoute(route) {
    var parts = route.split('/');
    var family = findFamily(parts[0]);
    var state = family && findState(family, parts[1]);
    return state ? family.title + ' · ' + state.title : route;
  }

  function navList(family, states) {
    var list = el('ul');
    states.forEach(function (state) {
      var item = el('li');
      var link = el('a', 'hdc-nav-link', state.title);
      link.href = hashFor(family.id, state.id);
      link.setAttribute('data-route', family.id + '/' + state.id);
      if (pendingRedrawOf(family.id + '/' + state.id)) link.title = PENDING;
      item.appendChild(link);
      list.appendChild(item);
    });
    return list;
  }

  function navFamily(family, heading) {
    var states = HFV2.currentStates(family);
    if (!states.length) return null;
    var group = el('section', 'hdc-nav-group');
    group.appendChild(el(heading, 'hdc-nav-group__title', family.title));
    (family.groups || [null]).forEach(function (name) {
      var inGroup = states.filter(function (state) { return (state.group || null) === name; });
      if (!inGroup.length) return;
      if (name) group.appendChild(el('p', 'hdc-nav-subgroup', name));
      group.appendChild(navList(family, inGroup));
    });
    return group;
  }

  function buildNav() {
    var families = HFV2.registry.families;
    families.filter(function (family) { return !family.area; }).forEach(function (family) {
      var group = navFamily(family, 'h2');
      if (group) els.nav.appendChild(group);
    });
    HFV2.registry.areas.forEach(function (area) {
      var section = el('section', 'hdc-nav-area');
      families.filter(function (family) { return family.area === area.id; }).forEach(function (family) {
        var group = navFamily(family, 'h3');
        if (group) section.appendChild(group);
      });
      if (!section.firstChild) return;
      section.insertBefore(el('h2', 'hdc-nav-area__title', area.title), section.firstChild);
      els.nav.appendChild(section);
    });
  }

  function updateNav() {
    var links = els.nav.querySelectorAll('a[data-route]');
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].getAttribute('data-route') === current.family + '/' + current.state) {
        links[i].setAttribute('aria-current', 'page');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
  }

  function updatePicker(family) {
    els.picker.textContent = '';
    family.states.forEach(function (state) {
      if (state.hidden && state.id !== current.state) return;
      var option = el('option', '', family.title + ' · ' + state.title);
      option.value = state.id;
      els.picker.appendChild(option);
    });
    els.picker.value = current.state;
  }

  function linkTo(route) {
    var link = el('a', '', titleOfRoute(route));
    link.href = '#' + route;
    return link;
  }

  function pendingRedrawOf(route) {
    return (HFV2.pendingRedraw || []).filter(function (pair) { return pair.older === route; })[0] || null;
  }

  function redrawsOf(route) {
    return (HFV2.pendingRedraw || []).filter(function (pair) { return pair.newer === route; });
  }

  // Tells a reader that a state has a centered redraw waiting for approval, or is that redraw.
  function updateNote(route) {
    els.note.textContent = '';
    var parts = [];
    var pending = pendingRedrawOf(route);
    if (pending) parts.push([PENDING + '. Redraw: ', [pending.newer]]);
    var redraws = redrawsOf(route);
    if (redraws.length) parts.push(['Earlier layout: ', redraws.map(function (pair) { return pair.older; })]);
    parts.forEach(function (part) {
      var line = el('span', 'hdc-note__line');
      line.appendChild(document.createTextNode(part[0]));
      part[1].forEach(function (target, i) {
        if (i) line.appendChild(document.createTextNode(', '));
        line.appendChild(linkTo(target));
      });
      line.appendChild(document.createTextNode('.'));
      els.note.appendChild(line);
    });
    els.note.hidden = !parts.length;
  }

  function updateToggle() {
    var buttons = els.theme.querySelectorAll('[data-appearance]');
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-appearance') === selection()));
    }
  }

  var specimenCleanup = null;

  function render() {
    if (specimenCleanup) { specimenCleanup(); specimenCleanup = null; }
    var hash = window.location.hash;
    var parsed = parseHash(hash);
    if (!parsed) {
      var fallback = HFV2.registry.defaultRoute.split('/');
      parsed = { family: fallback[0], state: fallback[1], override: null, view: null };
      if (hash && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hashFor(parsed.family, parsed.state));
      }
    } else if (hash !== hashFor(parsed.family, parsed.state, parsed.override, parsed.view) && window.history && window.history.replaceState) {
      // An old route, or a view the state does not declare: show the canonical route in the address bar.
      window.history.replaceState(null, '', hashFor(parsed.family, parsed.state, parsed.override, parsed.view));
    }
    current = parsed;

    var route = current.family + '/' + current.state;
    var d = HFV2.describe(route);
    var family = d.family;
    var state = d.state;
    var mode = selection();
    var resolved = resolve(mode);

    document.documentElement.setAttribute('data-theme', resolved);

    var html = HFV2.fill(HFV2.templates[d.templateKey] || '', mode, resolved);
    var meta = d.componentMeta;
    if (!d.minimum) HFV2.clearMinimum(els.specimen);
    els.specimen.className = d.wrapperClass + (d.minimum ? ' hdc-specimen--minimum' : '');
    if (meta) {
      els.specimen.style.minHeight = meta.height + 'px';
      els.specimen.innerHTML = '<div data-theme="' + resolved + '" style="background: var(--bg); color: var(--text);">' + html + '</div>';
    } else {
      els.specimen.style.minHeight = '';
      els.specimen.innerHTML = html;
    }
    var renderer = d.renderer && HFV2[HFV2.RENDERERS[d.renderer].api];
    // A loading state draws its loaded screen, then replaces the data of that screen with skeleton blocks. A
    // renderer that redraws its frame calls afterRender after every render, so the skeleton survives a resize.
    var options = { view: current.view };
    var skeletonSpec = d.skeleton && HFV2.skeletonSpecs[d.skeleton.spec];
    var applySkeleton = function (host) { HFV2.skeletonReport = HFV2.skeletonize(host, skeletonSpec); };
    if (skeletonSpec) { options.loading = true; options.decision = (d.state.approval || {}).decision; options.afterRender = applySkeleton; }
    if (renderer) specimenCleanup = renderer.mount(els.specimen, d.mount, options);
    else {
      // Template, then the minimum fixes, then the skeleton: a skeleton pins the boxes the fixes have laid out.
      if (d.minimum) HFV2.applyMinimum(els.specimen, d.minimum.fixes);
      if (skeletonSpec) applySkeleton(els.specimen);
    }
    var guide = HFV2.componentDocs && HFV2.componentDocs[d.guideKey];
    els.doc.innerHTML = guide || '';
    els.doc.hidden = !guide;
    els.stage.scrollLeft = 0;
    els.stage.scrollTop = 0;

    els.eyebrow.textContent = 'Harflow Desktop / ' + family.title;
    els.title.textContent = state.title;
    els.description.textContent = state.description;
    els.approval.textContent = d.approval;
    updateNote(route);
    var specimenSize = d.minimum ? '1000 × 620' : d.sizeCaption
      ? 'app frame 1280 × 800 or minimum 1000 × 620 via Size; catalogue controls outside the app'
      : (meta ? meta.width + ' wide' : '1280 × 800');
    els.caption.textContent = 'Specimen at native size (' + specimenSize + '). Appearance: ' +
      (current.override ? current.override + ' (this view only)' : preference) + (mode === 'system' ? ', currently ' + resolved : '') + '.';
    document.title = state.title + ' · ' + family.title + ' · Harflow Desktop · Interface reference';

    updateNav();
    updatePicker(family);
    updateToggle();
    els.live.textContent = family.title + ', ' + state.title + ', ' + resolved + ' appearance';
  }

  function setPreference(value) {
    if (MODES.indexOf(value) < 0) return;
    preference = value;
    writePreference(value);
    go(current.family, current.state, null, current.view);
  }

  els.theme.addEventListener('click', function (event) {
    var button = event.target.closest('[data-appearance]');
    if (button) setPreference(button.getAttribute('data-appearance'));
  });

  els.picker.addEventListener('change', function () {
    go(current.family, els.picker.value, current.override);
  });

  // Specimen interactions: routes between specimens and the appearance controls.
  els.specimen.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (link) {
      var href = link.getAttribute('href') || '';
      var documentPage = current.family === 'overview' || current.family === 'records';
      // Modified or non-primary clicks on document links keep the browser's behaviour (new tab, new window).
      if (href.charAt(0) !== '#' && documentPage && (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
      event.preventDefault();
      // Only the overview and the decision boards link to documents; app specimens never navigate.
      if (href.charAt(0) !== '#') {
        if (documentPage) window.location.href = href;
        return;
      }
      var parsed = parseHash(href);
      if (parsed) go(parsed.family, parsed.state, current.override);
      return;
    }
    var item = event.target.closest('.hd-theme__item');
    if (item) {
      var label = (item.getAttribute('aria-label') || '').toLowerCase();
      if (MODES.indexOf(label) >= 0) setPreference(label);
      return;
    }
    var rail = event.target.closest('.hd-rail-item[aria-label="Change appearance"]');
    if (rail) setPreference(MODES[(MODES.indexOf(selection()) + 1) % MODES.length]);
  });

  els.specimen.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  window.addEventListener('hashchange', render);
  if (media && media.addEventListener) {
    media.addEventListener('change', function () { if (selection() === 'system') render(); });
  }

  buildNav();
  render();
})();
