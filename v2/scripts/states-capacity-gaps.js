/* Resources and Statistics states for the engine conditions the approved pages do not draw: capacity not enabled,
   unsupported or unavailable, empty, stale and over capacity; no finished work, incomplete history, partial usage
   accounting, all time and an unsupported runtime. Approved by the owner on 2026-11-15.
   Each state is the approved resources/slots or statistics/overview template with one block replaced. Templates are
   computed on first use. Engine messages and figures are fixture text; the wording that has no Mac source is design
   wording and is named in each guide. The pages gain no search or filter controls.
   Decision record: docs/decisions/README.md (Workflow and capacity states). Display only: no engine calls. */
(function () {
  'use strict';
  var H = (window.HFV2 = window.HFV2 || {});
  var T = (H.templates = H.templates || {});
  var docs = (H.componentDocs = H.componentDocs || {});
  H.gapStates = H.gapStates || [];

  var APPROVAL = { by: 'the owner', date: '2026-11-15', decision: 'Workflow and capacity states' };
  var RECORD = '<a href="docs/decisions/README.md#workflow-and-capacity-states">Decision record</a>';

  // The base with its only occurrence of `find` replaced. It throws when `find` is missing or not unique, so a changed
  // base cannot silently draw a different screen.
  function swap(html, find, replace, base) {
    var at = html.indexOf(find);
    if (at < 0) throw new Error('Block not found in ' + base + ': ' + find.slice(0, 60));
    if (html.indexOf(find, at + 1) >= 0) throw new Error('Block not unique in ' + base + ': ' + find.slice(0, 60));
    return html.slice(0, at) + replace + html.slice(at + find.length);
  }
  function between(html, open, close, base) {
    var from = html.indexOf(open), to = from < 0 ? -1 : html.indexOf(close, from);
    if (from < 0 || to < 0) throw new Error('Block not found in ' + base + ': ' + open.slice(0, 60));
    return html.slice(from, to + close.length);
  }
  function ensureGroup(familyId, name) {
    var family = H.findFamily(familyId);
    if (family.groups.indexOf(name) < 0) {
      var at = family.groups.indexOf('Loading');
      family.groups.splice(at < 0 ? family.groups.length : at, 0, name);
    }
  }
  // Registers one derived state: a lazy template under its own route, its guide, and the catalog entry.
  function define(familyId, group, id, base, build, state, guide) {
    var route = familyId + '/' + id;
    Object.defineProperty(T, route, {
      enumerable: true, configurable: true,
      get: function () {
        var html = T[base];
        if (typeof html !== 'string') throw new Error('No template ' + base);
        var value = build(html, base);
        Object.defineProperty(T, route, { enumerable: true, configurable: true, writable: true, value: value });
        return value;
      }
    });
    docs[route] = '<p><strong>Approved by the owner · 2026-11-15.</strong> ' + guide + ' ' + RECORD + '.</p>';
    H.gapStates.push(route);
    ensureGroup(familyId, group);
    H.registerState(familyId, Object.assign({ id: id, group: group, status: 'approved', approval: APPROVAL }, state));
  }

  var RETRY = '<button type="button" class="hd-btn hd-btn--secondary">Retry</button>';
  function empty(icon, title, text, button, failed) {
    return '<div class="hd-card"><div class="hd-empty' + (failed ? ' hd-gap-empty--failed' : '') + '"><div class="hd-empty__icon"><span class="hd-i hd-i-' + icon + '" aria-hidden="true"></span></div>' +
      '<span class="hd-empty__title">' + title + '</span>' + (text ? '<span class="hd-empty__text">' + text + '</span>' : '') + (button || '') + '</div></div>';
  }
  function warning(text, button) {
    return '<div class="hd-banner hd-banner--warning hd-gap-banner" role="status"><span class="hd-i hd-i--sm hd-i-alert" aria-hidden="true"></span><div class="hd-banner__body">' + text + '</div>' + button + '</div>';
  }

  // ---- Resources -------------------------------------------------------------------------------------------------
  var RES = 'resources';
  var RES_GROUP = 'Resource states';
  var SLOTS = RES + '/slots';
  var GRID_OPEN = '<div class="hd-grid hd-grid--2">';
  var LIST_END = 'Open task</a></span></div>\n        </div>';

  function replaceSlots(html, base, block) {
    return swap(html, between(html, GRID_OPEN, LIST_END, base), block, base);
  }
  function emptySlots(icon, title, text, button) {
    return function (html, base) { return replaceSlots(html, base, empty(icon, title, text, button)); };
  }

  define(RES, RES_GROUP, 'not-enabled', SLOTS, emptySlots('gauge', 'Resource slots are not enabled', 'The selected runtime has not enabled phase slots.'), {
    title: 'Resource slots not enabled',
    description: 'The page head and intro stay; the slot cards and the waiting list give way to a note that the selected runtime has not enabled phase slots.'
  }, 'Resources when the runtime has not enabled phase slots. The title and sentence are Mac copy (HarflowMac ResourceSlotsAssembly.swift). Derived from <a href="#resources/slots">Resource slots</a>.');

  define(RES, RES_GROUP, 'unsupported', SLOTS, emptySlots('gauge', 'Resource slots are unsupported', 'The selected runtime does not support phase-slots.v1.'), {
    title: 'Resource slots unsupported',
    description: 'The slot cards and waiting list give way to a note that the selected runtime does not support phase slots.'
  }, 'Resources when the runtime lacks the <code>phase-slots.v1</code> capability. The title and sentence are Mac copy (HarflowMac ResourceSlotsAssembly.swift), naming that capability.');

  define(RES, RES_GROUP, 'unavailable', SLOTS, emptySlots('gauge', 'Resource slots are unavailable', 'The engine did not provide qualified resource observations.', RETRY), {
    title: 'Resource slots unavailable',
    description: 'The slot cards and waiting list give way to a note that the engine returned no qualified observations, with Retry.'
  }, 'Resources when the engine returns no qualified observations. The title and sentence are Mac copy (HarflowMac ResourceSlotsAssembly.swift); Retry only re-reads and changes nothing.');

  define(RES, RES_GROUP, 'unavailable-permission', SLOTS, emptySlots('gauge', 'Resource slots are unavailable', 'Reading resource slots requires the local user that owns the runtime.', RETRY), {
    title: 'Unavailable · engine reason',
    description: 'The unavailable note with the engine\'s own message in place of the default sentence.'
  }, 'Resources unavailable, with the engine\'s message replacing the default sentence. A permission refusal is shown through the engine\'s message; the page adds no permission copy. The message is fixture text.');

  define(RES, RES_GROUP, 'empty', SLOTS, emptySlots('gauge', 'No resource slots', 'No configured names or active reservations were reported in these observations.'), {
    title: 'No resource slots',
    description: 'Observations were read and contain no configured slot names and no active reservations.'
  }, 'Resources when the observations contain no configured names and no active reservations. The title and sentence are Mac copy (HarflowMac ResourceSlotsAssembly.swift).');

  define(RES, RES_GROUP, 'stale', SLOTS, function (html, base) {
    var banner = warning('Showing the last successful observations. Refresh failed.', '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Retry</button>');
    return swap(html, GRID_OPEN, banner + GRID_OPEN, base);
  }, {
    title: 'Last observations',
    description: 'The populated page with a warning above the slot cards: the last successful observations are shown because the refresh failed.'
  }, 'Resources showing the last successful observations after a failed refresh, with a warning between the intro and the cards and a Retry. The banner sentence is Mac copy (HarflowMac ResourceSlotsAssembly.swift).');

  define(RES, RES_GROUP, 'over-capacity', SLOTS, function (html, base) {
    var cells = '<span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-waiting"></span>';
    html = swap(html, cells, '<span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-used hd-gap-cell--over"></span><span class="hd-meter__cell is-waiting"></span>', base);
    html = swap(html, '<span class="hd-meter__value">2 of 2 in use</span>', '<span class="hd-meter__value">3 of 2 in use · above capacity</span>', base);
    html = swap(html, 'aria-label="2 of 2 in use"', 'aria-label="3 of 2 in use, above capacity"', base);
    var last = 'Review: Electron preload bridge</span><span class="hd-task-row__meta">06:31</span></a>';
    var third = '<a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Regenerate API client</span><span class="hd-task-row__meta">02:48</span></a>' +
      '<div class="caption hd-faint hd-gap-holder-note">Phase capacity is overcommitted</div>';
    return swap(html, last, last + third, base);
  }, {
    title: 'Over capacity',
    description: 'A harness holds more slots than its capacity: the value reads above capacity, the extra cell has a warning outline, and a third holder is listed with a note.'
  }, 'The Codex card with three holders against a capacity of two. The wording above capacity and the holder note are Mac copy (HarflowMac ResourceSlotsAssembly.swift); only the outlined cell is design. The extra holder is fixture text.');

  // ---- Statistics ------------------------------------------------------------------------------------------------
  var STAT = 'statistics';
  var STAT_GROUP = 'Statistics states';
  var OVERVIEW = STAT + '/overview';
  var TILES_OPEN = '<div class="hd-grid hd-grid--4">';
  var COST_END = 'as reported by harness; 3 harnesses don\'t report cost</span></div></div>';
  var TABLE_END = '</table></div>';
  var PAGE_END = TABLE_END + '</div></div>\n  </main>';

  // Everything from the tiles to the end of the By harness card.
  function replaceStatistics(html, base, block) {
    var from = html.indexOf(TILES_OPEN), end = html.indexOf(PAGE_END);
    if (from < 0 || end < 0 || html.indexOf(TILES_OPEN, from + 1) >= 0) throw new Error('Statistics body not found in ' + base);
    return html.slice(0, from) + block + html.slice(end + TABLE_END.length);
  }
  function note(text) { return '<p class="caption hd-faint hd-gap-stat-note">' + text + '</p>'; }

  define(STAT, STAT_GROUP, 'empty', OVERVIEW, function (html, base) {
    return replaceStatistics(html, base, empty('chart', 'No finished work in this retained history.', 'Choose another range to look for retained finished work.'));
  }, {
    title: 'No finished work',
    description: 'The page head and range selector stay; the tiles, chart and table give way to a note that the retained history has no finished work.'
  }, 'Statistics when the retained history holds no finished work. The title is Mac copy (HarflowMac StatisticsProjection.swift) and the second sentence is design wording. Derived from <a href="#statistics/overview">Statistics overview</a>.');

  define(STAT, STAT_GROUP, 'error', OVERVIEW, function (html, base) {
    return replaceStatistics(html, base, empty('alert', 'History is incomplete or unavailable. No totals are shown.', '', RETRY, true));
  }, {
    title: 'History unavailable',
    description: 'The tiles, chart and table give way to a failed note that no totals are shown, with Retry.'
  }, 'Statistics when the history is incomplete or unavailable: no total is shown because a partial total would mislead. The title is Mac copy (HarflowMac StatisticsHistoryWorker.swift).');

  define(STAT, STAT_GROUP, 'stale', OVERVIEW, function (html, base) {
    var banner = warning('Showing the last complete snapshot. Refresh failed: the history read exceeded its time budget.', '<button type="button" class="hd-btn hd-btn--secondary hd-btn--sm">Retry refresh</button>');
    return swap(html, TILES_OPEN, banner + TILES_OPEN, base);
  }, {
    title: 'Last complete snapshot',
    description: 'The overview with a warning above the tiles: the last complete snapshot is shown because the refresh failed.'
  }, 'Statistics showing the last complete snapshot after a failed refresh. The prefix of the warning is the wording the Mac app uses; the reason after it is fixture text.');

  define(STAT, STAT_GROUP, 'partial-accounting', OVERVIEW, function (html, base) {
    var tile = '<span class="hd-stat__value hd-gap-stat-value--unavailable">Unavailable</span><span class="hd-stat__delta">reported by 2 of 5 harnesses; the rest are left out, not counted as zero</span></div></div>' +
      note('Retained history only. Usage accounting: Partial · 212 of 284 independent executions · 340 execution records.');
    return swap(html, '<span class="hd-stat__value">$182.40</span><span class="hd-stat__delta">' + COST_END, tile, base);
  }, {
    title: 'Partial usage accounting',
    description: 'Reported cost reads Unavailable because only some harnesses report it, and a line under the tiles states how much of the history the accounting covers.'
  }, 'Statistics when usage accounting is partial. The per-harness table already shows Unavailable, never zero, for harnesses that do not report cost. The Usage accounting label and the delta wording are design wording; the counts are fixture text.');

  define(STAT, STAT_GROUP, 'all-time', OVERVIEW, function (html, base) {
    var seg = '<button type="button" class="hd-seg__item">7 days</button><button type="button" class="hd-seg__item is-active" aria-pressed="true">30 days</button><button type="button" class="hd-seg__item">All time</button>';
    html = swap(html, seg, '<button type="button" class="hd-seg__item">7 days</button><button type="button" class="hd-seg__item">30 days</button><button type="button" class="hd-seg__item is-active" aria-pressed="true">All time</button>', base);
    html = swap(html, '<span class="hd-stat__delta">Last 30 days</span>', '<span class="hd-stat__delta">All retained history</span>', base);
    return swap(html, COST_END, COST_END + note('Retained history only. Retention: 90 days; selected ranges may exceed retained history.'), base);
  }, {
    title: 'All time selected',
    description: 'All time is the active range, the first tile reads All retained history, and a line under the tiles states the retention.'
  }, 'Statistics with All time selected. The retention line is Mac copy (HarflowMac StatisticsProjection+Metrics.swift); the delta is design wording and the retention figure is fixture text. The chart below is the overview specimen and still draws the 30 day bars. The range is All time, as in the approved overview; the 90 day option of the Mac is not adopted.');

  define(STAT, STAT_GROUP, 'unsupported', OVERVIEW, function (html, base) {
    return replaceStatistics(html, base, empty('chart', 'Statistics are unavailable in this runtime', 'The installed runtime does not provide the statistics history. Update the Harflow runtime.'));
  }, {
    title: 'Statistics unavailable',
    description: 'The tiles, chart and table give way to a note that the installed runtime does not provide statistics.'
  }, 'Statistics on a runtime without the statistics history. The wording is design wording; the Mac shows a technical command message instead.');
})();
