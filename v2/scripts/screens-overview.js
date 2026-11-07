// The overview page: areas, screens, how many current states each screen has and where its decision is
// recorded. Built from the registry when it is read, so it always matches the navigation.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});
  var M = (HFV2.componentMeta = HFV2.componentMeta || {});

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function routeOf(family, state) { return '#' + family.id + '/' + state.id; }

  function titleOf(route) {
    var parts = route.split('/');
    var family = HFV2.findFamily(parts[0]);
    var state = family && HFV2.findState(family, parts[1]);
    return state ? family.title + ' · ' + state.title : route;
  }

  function build() {
    var registry = HFV2.registry;
    var out = '<div class="hdc-doc hdc-page hdc-overview"><p class="hdc-lead">Each area groups the screens of the product. The counts are current states. A screen\'s decision lists who approved each state and when.</p>';
    registry.areas.forEach(function (area) {
      var families = registry.families.filter(function (family) { return family.area === area.id && !family.hidden && HFV2.currentStates(family).length; });
      if (!families.length) return;
      out += '<section class="hdc-overview__area"><h2>' + esc(area.title) + '</h2><table class="hdc-overview__table"><thead><tr><th scope="col">Screen</th><th scope="col">Current states</th><th scope="col">Groups</th><th scope="col">Decision</th></tr></thead><tbody>';
      families.forEach(function (family) {
        var states = HFV2.currentStates(family);
        var groups = (family.groups || []).filter(function (group) { return states.some(function (state) { return state.group === group; }); });
        out += '<tr><td><a href="' + routeOf(family, states[0]) + '">' + esc(family.title) + '</a></td><td>' + states.length + '</td><td>' + esc(groups.join(', ') || '·') +
          '</td><td><a href="docs/decisions/README.md#' + esc(family.id) + '">Decision</a></td></tr>';
      });
      out += '</tbody></table></section>';
    });
    var supersessions = HFV2.supersessions || { applied: [], proposed: [] };
    if (supersessions.applied.length) {
      out += '<section class="hdc-overview__area"><h2>Earlier designs</h2><p>Replaced by a current design. The route still opens and links to its replacement.</p><ul>' +
        supersessions.applied.map(function (e) { return '<li><a href="#' + e.older + '">' + esc(titleOf(e.older)) + '</a> replaced by <a href="#' + e.newer + '">' + esc(titleOf(e.newer)) + '</a></li>'; }).join('') + '</ul></section>';
    }
    if (supersessions.proposed.length) {
      out += '<section class="hdc-overview__area"><h2>Awaiting a decision</h2><p>Both layouts stay listed until the owner decides which is current.</p><ul>' +
        supersessions.proposed.map(function (e) { return '<li><a href="#' + e.older + '">' + esc(titleOf(e.older)) + '</a> · newer layout <a href="#' + e.newer + '">' + esc(titleOf(e.newer)) + '</a></li>'; }).join('') + '</ul></section>';
    }
    return out + '</div>';
  }

  Object.defineProperty(T, 'overview/areas', { enumerable: true, configurable: true, get: build });
  M['overview/areas'] = { width: 960, height: 360 };
})();
