// Navigation, appearance and rendering for the v2 interface reference.
(function () {
  'use strict';

  var HFV2 = window.HFV2;
  var STORAGE_KEY = 'hf-v2-appearance';
  var MODES = ['system', 'light', 'dark'];
  var ROUTE_PATTERN = /^#([a-z0-9-]+)\/([a-z0-9-]+)(?:\/(light|dark|system))?$/;

  var els = {
    nav: document.getElementById('hdc-nav'),
    picker: document.getElementById('hdc-state-picker'),
    theme: document.getElementById('hdc-theme'),
    eyebrow: document.getElementById('hdc-eyebrow'),
    title: document.getElementById('hdc-title'),
    description: document.getElementById('hdc-description'),
    approval: document.getElementById('hdc-approval'),
    stage: document.getElementById('hdc-stage'),
    specimen: document.getElementById('hdc-specimen'),
    caption: document.getElementById('hdc-caption'),
    doc: document.getElementById('hdc-doc'),
    live: document.getElementById('hdc-live')
  };

  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var current = { family: null, state: null, override: null };

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

  function findFamily(id) {
    return HFV2.registry.families.filter(function (family) { return family.id === id; })[0] || null;
  }

  function findState(family, id) {
    return family.states.filter(function (state) { return state.id === id; })[0] || null;
  }

  function parseHash(hash) {
    var match = ROUTE_PATTERN.exec(hash || '');
    if (!match) return null;
    var family = findFamily(match[1]);
    if (!family || !findState(family, match[2])) return null;
    return { family: match[1], state: match[2], override: match[3] || null };
  }

  function hashFor(family, state, override) {
    return '#' + family + '/' + state + (override ? '/' + override : '');
  }

  function go(family, state, override) {
    var hash = hashFor(family, state, override);
    if (window.location.hash === hash) render();
    else window.location.hash = hash;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function buildNav() {
    HFV2.registry.families.forEach(function (family) {
      var group = el('section', 'hdc-nav-group');
      group.appendChild(el('h2', 'hdc-nav-group__title', family.title));
      var list = el('ul');
      family.states.forEach(function (state) {
        var item = el('li');
        var link = el('a', 'hdc-nav-link', state.title);
        link.href = hashFor(family.id, state.id);
        link.setAttribute('data-route', family.id + '/' + state.id);
        item.appendChild(link);
        list.appendChild(item);
      });
      group.appendChild(list);
      els.nav.appendChild(group);
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
      var option = el('option', '', family.title + ' · ' + state.title);
      option.value = state.id;
      els.picker.appendChild(option);
    });
    els.picker.value = current.state;
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
    var parsed = parseHash(window.location.hash);
    if (!parsed) {
      var fallback = HFV2.registry.defaultRoute.split('/');
      parsed = { family: fallback[0], state: fallback[1], override: null };
      if (window.location.hash && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hashFor(parsed.family, parsed.state));
      }
    }
    current = parsed;

    var family = findFamily(current.family);
    var state = findState(family, current.state);
    var key = current.family + '/' + current.state;
    var mode = selection();
    var resolved = resolve(mode);

    document.documentElement.setAttribute('data-theme', resolved);

    var html = HFV2.fill(HFV2.templates[key] || '', mode, resolved);
    var meta = HFV2.componentMeta && HFV2.componentMeta[key];
    if (meta) {
      els.specimen.className = 'hdc-specimen hdc-specimen--component';
      els.specimen.style.minHeight = meta.height + 'px';
      els.specimen.innerHTML = '<div data-theme="' + resolved + '" style="background: var(--bg); color: var(--text);">' + html + '</div>';
    } else {
      els.specimen.className = current.family === 'd2b-proposal'
        ? 'hdc-specimen hdc-specimen--d2b'
        : (current.family === 'm04-proposal' ? 'hdc-specimen hdc-specimen--m04' : 'hdc-specimen');
      els.specimen.style.minHeight = '';
      els.specimen.innerHTML = html;
    }
    if (current.family === 'd2b-proposal' && HFV2.d2bProposal) {
      specimenCleanup = HFV2.d2bProposal.mount(els.specimen, current.state);
    }
    if (current.family === 'm04-proposal' && HFV2.m04Proposal) {
      specimenCleanup = HFV2.m04Proposal.mount(els.specimen, current.state);
    }
    var guide = HFV2.componentDocs && HFV2.componentDocs[key];
    els.doc.innerHTML = guide || '';
    els.doc.hidden = !guide;
    els.stage.scrollLeft = 0;
    els.stage.scrollTop = 0;

    els.eyebrow.textContent = 'Harflow Desktop / ' + family.title;
    els.title.textContent = state.title;
    els.description.textContent = state.description;
    var approval = family.approval || HFV2.registry.approval;
    els.approval.textContent = state.approval === 'approved'
      ? 'Approved by ' + approval.by + ' on ' + approval.date + (approval.reference ? ' · ' + approval.reference : ' · canvas ' + approval.canvas + ' · design system ' + approval.designSystem)
      : 'Not approved';
    var specimenSize = (current.family === 'd2b-proposal' || current.family === 'm04-proposal')
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
    go(current.family, current.state, null);
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
      event.preventDefault();
      var href = link.getAttribute('href') || '';
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
