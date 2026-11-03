// Screen templates for the task family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['task/running'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running">
      <div class="hd-section__head">Running <span class="hd-section__count">2</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row is-active" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
        <a class="hd-task-row" href="#workflow-run/graph-needs-you"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
      </div>
    </section>
    <section class="hd-section hd-section--fill" aria-label="Recent work">
      <div class="hd-section__head">Recent work</div>
      <div class="hd-section__list">
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12m</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/failed"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Review: Electron preload bridge</span><span class="hd-task-row__meta">2h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Release checklist v0.4.2</span><span class="hd-task-row__meta">3h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Rename legacy env variables</span><span class="hd-task-row__meta">5h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span><span class="hd-task-row__title">Profile sidebar re-renders</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Write contract fixtures for v1 tasks</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Weekly backlog triage</span><span class="hd-task-row__meta">2d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Tidy CHANGELOG for 0.4.1</span><span class="hd-task-row__meta">3d</span></a>
        <div class="hd-sidebar__more"><span class="hd-glyph hd-glyph--running" aria-hidden="true" style="width: 12px; height: 12px;"></span>Loading older work</div>
      </div>
    </section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" style="flex: 1;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main" style="flex-direction: row;">
<div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; min-height: 0;"><div class="hd-topbar"><span class="hd-topbar__title">Fix flaky slot release test</span><span class="hd-badge hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Running 04:12</span><span class="hd-topbar__meta">Claude · Opus 5.5 · HarflowMCP</span><span class="hd-topbar__spacer"></span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Toggle right pane"><span class="hd-i hd-i-panel-right" aria-hidden="true"></span></button><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button></div><div class="hd-scroll" style="display: flex; flex-direction: column-reverse;"><div class="hd-transcript"><div class="hd-msg-user">The test_release_frees_slot test in tests/test_slots.py fails about one run in ten. Find out why and fix it without adding sleeps.</div>
<div class="hd-msg-agent"><p>I'll start with the slot release path and the test, then look for a race between the release call and the waiter being woken.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-tool__summary">Read 4 files</span><span class="hd-tool__meta">0:06</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div>
<div class="hd-msg-agent"><p>Found a likely cause. <code>SlotPool.release()</code> in <code>harflow_mcp/slots.py</code> sets the slot free and then notifies waiters outside the lock, so a waiter can wake, see the old count and go back to sleep. The test only passes when the notification lands first.</p>
<p>I'll reproduce it before changing anything.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran <code>pytest tests/test_slots.py -k release --count 20</code></span><span class="hd-tool__meta">0:41</span><span class="hd-i hd-i--sm hd-i-chevron-down" aria-hidden="true"></span></button><div class="hd-tool__body"><b>FAILED</b> tests/test_slots.py::test_release_frees_slot[7] - AssertionError: waiter still blocked
<b>FAILED</b> tests/test_slots.py::test_release_frees_slot[15] - AssertionError: waiter still blocked
2 failed, 18 passed in 38.52s</div></div>
<div class="hd-msg-agent"><p>Reproduced: 2 failures in 20 runs. The fix is to update the count and notify under the same lock:</p>
<ul><li>move <code>notify_all()</code> inside the <code>with self._lock</code> block</li><li>re-check the free count in the waiter loop instead of trusting the wake-up</li></ul></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span><span class="hd-tool__summary">Edited <code>harflow_mcp/slots.py</code> &nbsp;<span style="color: var(--success);">+18</span> <span style="color: var(--danger);">−6</span></span><span class="hd-tool__meta">0:12</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div>
<div class="hd-working"><span class="hd-glyph hd-glyph--running is-animated" aria-hidden="true"></span><span>Running tests…</span></div></div></div><div style="flex: none; width: 100%; max-width: var(--content-width); margin: 0 auto; padding: var(--space-2) var(--space-6) var(--space-5);"><form class="hd-composer" aria-label="Follow-up"><label class="hd-sr" for="followup">Follow-up message</label><textarea id="followup" class="hd-composer__input" rows="2" placeholder="Send a follow-up. It is delivered after the current turn." style="min-height: 28px;"></textarea><div class="hd-composer__bar"><span class="hd-composer__spacer"></span><button type="button" class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span> Stop</button><button type="submit" class="hd-composer__send" aria-label="Send follow-up" disabled><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></div></form></div></div>
  </main>
</div>
`;

  T['task/approval'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running">
      <div class="hd-section__head">Running <span class="hd-section__count">2</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row is-active" href="#task/running"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
        <a class="hd-task-row" href="#workflow-run/graph-needs-you"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
      </div>
    </section>
    <section class="hd-section hd-section--fill" aria-label="Recent work">
      <div class="hd-section__head">Recent work</div>
      <div class="hd-section__list">
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12m</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/failed"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Review: Electron preload bridge</span><span class="hd-task-row__meta">2h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Release checklist v0.4.2</span><span class="hd-task-row__meta">3h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Rename legacy env variables</span><span class="hd-task-row__meta">5h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span><span class="hd-task-row__title">Profile sidebar re-renders</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Write contract fixtures for v1 tasks</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Weekly backlog triage</span><span class="hd-task-row__meta">2d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Tidy CHANGELOG for 0.4.1</span><span class="hd-task-row__meta">3d</span></a>
        <div class="hd-sidebar__more"><span class="hd-glyph hd-glyph--running" aria-hidden="true" style="width: 12px; height: 12px;"></span>Loading older work</div>
      </div>
    </section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" style="flex: 1;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main" style="flex-direction: row;">
<div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; min-height: 0;"><div class="hd-topbar"><span class="hd-topbar__title">Fix flaky slot release test</span><span class="hd-badge hd-badge--attention"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you</span><span class="hd-topbar__meta">Claude · Opus 5.5 · HarflowMCP</span><span class="hd-topbar__spacer"></span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Toggle right pane"><span class="hd-i hd-i-panel-right" aria-hidden="true"></span></button><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button></div><div class="hd-scroll" style="display: flex; flex-direction: column-reverse;"><div class="hd-transcript"><div class="hd-msg-user">The test_release_frees_slot test in tests/test_slots.py fails about one run in ten. Find out why and fix it without adding sleeps.</div>
<div class="hd-msg-agent"><p>I'll start with the slot release path and the test, then look for a race between the release call and the waiter being woken.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-tool__summary">Read 4 files</span><span class="hd-tool__meta">0:06</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div>
<div class="hd-msg-agent"><p>Found a likely cause. <code>SlotPool.release()</code> in <code>harflow_mcp/slots.py</code> sets the slot free and then notifies waiters outside the lock, so a waiter can wake, see the old count and go back to sleep. The test only passes when the notification lands first.</p>
<p>I'll reproduce it before changing anything.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran <code>pytest tests/test_slots.py -k release --count 20</code></span><span class="hd-tool__meta">0:41</span><span class="hd-i hd-i--sm hd-i-chevron-down" aria-hidden="true"></span></button><div class="hd-tool__body"><b>FAILED</b> tests/test_slots.py::test_release_frees_slot[7] - AssertionError: waiter still blocked
<b>FAILED</b> tests/test_slots.py::test_release_frees_slot[15] - AssertionError: waiter still blocked
2 failed, 18 passed in 38.52s</div></div>
<div class="hd-msg-agent"><p>Reproduced: 2 failures in 20 runs. The fix is to update the count and notify under the same lock:</p>
<ul><li>move <code>notify_all()</code> inside the <code>with self._lock</code> block</li><li>re-check the free count in the waiter loop instead of trusting the wake-up</li></ul></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span><span class="hd-tool__summary">Edited <code>harflow_mcp/slots.py</code> &nbsp;<span style="color: var(--success);">+18</span> <span style="color: var(--danger);">−6</span></span><span class="hd-tool__meta">0:12</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div>
<div class="hd-approval" role="group" aria-label="Approval needed">
<div class="hd-approval__head"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span><span>Run command</span><span class="hd-approval__src">Claude · Bash</span></div>
<div class="hd-approval__body"><div class="hd-approval__cmd">pytest tests/test_slots.py -k release --count 50</div>
<div class="hd-approval__meta">in ~/Code/Harflow/HarflowMCP</div>
<p style="margin: 0; font-size: 13px; line-height: 20px;">Reason: confirm the race no longer reproduces over 50 runs, up from 20 before the fix.</p></div>
<div class="hd-approval__actions"><button type="button" class="hd-btn hd-btn--primary">Approve once</button><button type="button" class="hd-btn hd-btn--secondary">Approve for this task</button><button type="button" class="hd-btn hd-btn--ghost">Reject</button></div></div></div></div><div style="flex: none; width: 100%; max-width: var(--content-width); margin: 0 auto; padding: var(--space-2) var(--space-6) var(--space-5);"><form class="hd-composer" aria-label="Follow-up"><label class="hd-sr" for="followup">Follow-up message</label><textarea id="followup" class="hd-composer__input" rows="2" placeholder="Send a follow-up. It is delivered after the current turn." style="min-height: 28px;"></textarea><div class="hd-composer__bar"><span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="Send follow-up" disabled><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></div></form></div></div>
  </main>
</div>
`;

  T['task/done'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running">
      <div class="hd-section__head">Running <span class="hd-section__count">2</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
        <a class="hd-task-row" href="#workflow-run/graph-needs-you"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
      </div>
    </section>
    <section class="hd-section hd-section--fill" aria-label="Recent work">
      <div class="hd-section__head">Recent work</div>
      <div class="hd-section__list">
        <a class="hd-task-row is-active hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12m</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/failed"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Review: Electron preload bridge</span><span class="hd-task-row__meta">2h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Release checklist v0.4.2</span><span class="hd-task-row__meta">3h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Rename legacy env variables</span><span class="hd-task-row__meta">5h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span><span class="hd-task-row__title">Profile sidebar re-renders</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Write contract fixtures for v1 tasks</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Weekly backlog triage</span><span class="hd-task-row__meta">2d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Tidy CHANGELOG for 0.4.1</span><span class="hd-task-row__meta">3d</span></a>
        <div class="hd-sidebar__more"><span class="hd-glyph hd-glyph--running" aria-hidden="true" style="width: 12px; height: 12px;"></span>Loading older work</div>
      </div>
    </section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" style="flex: 1;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main">
<div class="hd-split"><div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; min-height: 0;"><div class="hd-topbar"><span class="hd-topbar__title">Add retry budget to delivery queue</span><span class="hd-badge hd-badge--done"><span class="hd-i hd-i-check" aria-hidden="true"></span>Done 21:04</span><span class="hd-topbar__meta">Claude · Opus 5.5 · HarflowWeb</span><span class="hd-topbar__spacer"></span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Toggle right pane"><span class="hd-i hd-i-panel-right" aria-hidden="true"></span></button><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button></div><div class="hd-scroll" style="display: flex; flex-direction: column-reverse;"><div class="hd-transcript"><div class="hd-msg-user">Add a retry budget to the delivery queue so a failing webhook stops after 5 attempts per hour instead of retrying forever.</div>
<div class="hd-msg-agent"><p>I'll read the delivery queue and its tests first.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-tool__summary">Read 6 files</span><span class="hd-tool__meta">0:09</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div><div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span><span class="hd-tool__summary">Edited <code>harflow_web/delivery/queue.py</code> &nbsp;<span style="color: var(--success);">+24</span> <span style="color: var(--danger);">−3</span></span><span class="hd-tool__meta">0:20</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div><div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span><span class="hd-tool__summary">Edited <code>tests/test_delivery_queue.py</code> &nbsp;<span style="color: var(--success);">+31</span></span><span class="hd-tool__meta">0:14</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div><div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran <code>pytest tests/test_delivery_queue.py</code></span><span class="hd-tool__meta">0:27</span><span class="hd-i hd-i--sm hd-i-chevron-down" aria-hidden="true"></span></button><div class="hd-tool__body"><b>tests/test_delivery_queue.py</b> ........... [100%]
11 passed in 2.04s</div></div>
<div class="hd-turn-sep">Summary</div>
<div class="hd-msg-agent"><p>Deliveries now have a retry budget of 5 attempts per hour per target. When the budget is spent, the delivery is marked <code>exhausted</code> and is no longer retried until the window resets.</p>
<ul><li><code>queue.py</code> tracks attempts in a sliding window per target.</li><li>The budget is configurable through <code>HARFLOW_DELIVERY_RETRY_BUDGET</code>.</li><li>Three new tests cover the limit, the reset and the config override. All 11 tests pass.</li></ul></div></div></div><div style="flex: none; width: 100%; max-width: var(--content-width); margin: 0 auto; padding: var(--space-2) var(--space-6) var(--space-5);"><form class="hd-composer" aria-label="Follow-up"><label class="hd-sr" for="followup">Follow-up message</label><textarea id="followup" class="hd-composer__input" rows="2" placeholder="Continue this task" style="min-height: 28px;"></textarea><div class="hd-composer__bar"><span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="Send follow-up" disabled><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></div></form></div></div><aside class="hd-pane" aria-label="Task details">
<div class="hd-pane__head"><div class="hd-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" class="hd-tab is-active">Changes <span class="hd-tab__count">3</span></button><button type="button" role="tab" aria-selected="false" class="hd-tab">Artifacts</button><button type="button" role="tab" aria-selected="false" class="hd-tab">Events</button></div></div>
<div class="hd-scroll" style="padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-3);">
<div><div class="hd-file"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-file__path">harflow_web/delivery/queue.py</span><span class="hd-file__add">+24</span><span class="hd-file__del">−3</span></div><div class="hd-file"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-file__path">harflow_web/config.py</span><span class="hd-file__add">+2</span><span class="hd-file__del">−0</span></div><div class="hd-file"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-file__path">tests/test_delivery_queue.py</span><span class="hd-file__add">+31</span><span class="hd-file__del">−0</span></div></div>
<div class="caption hd-faint" style="padding: 0 var(--space-3);">harflow_web/delivery/queue.py</div>
<div class="hd-diff" role="group" aria-label="Diff of queue.py"><div class="hd-diff__line hd-diff__line--hunk"><span class="hd-diff__sign"></span>@@ -41,9 +41,18 @@ class DeliveryQueue</div><div class="hd-diff__line"><span class="hd-diff__sign"></span>    def next_attempt(self, target):</div><div class="hd-diff__line hd-diff__line--del"><span class="hd-diff__sign">−</span>        return self._attempts[target] + 1</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>        window = self._window(target)</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>        if len(window) &gt;= self.retry_budget:</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>            self._mark_exhausted(target)</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>            return None</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>        window.append(self._clock())</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>        return len(window)</div><div class="hd-diff__line"><span class="hd-diff__sign"></span>    def _on_failure(self, delivery):</div><div class="hd-diff__line hd-diff__line--del"><span class="hd-diff__sign">−</span>        self._requeue(delivery)</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>        if self.next_attempt(delivery.target):</div><div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>            self._requeue(delivery)</div></div></div></aside></div>
  </main>
</div>
`;

  T['task/failed'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running">
      <div class="hd-section__head">Running <span class="hd-section__count">2</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
        <a class="hd-task-row" href="#workflow-run/graph-needs-you"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
      </div>
    </section>
    <section class="hd-section hd-section--fill" aria-label="Recent work">
      <div class="hd-section__head">Recent work</div>
      <div class="hd-section__list">
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12m</span></a>
        <a class="hd-task-row is-active hd-task-row--done" href="#task/failed"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Review: Electron preload bridge</span><span class="hd-task-row__meta">2h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Release checklist v0.4.2</span><span class="hd-task-row__meta">3h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Rename legacy env variables</span><span class="hd-task-row__meta">5h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span><span class="hd-task-row__title">Profile sidebar re-renders</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Write contract fixtures for v1 tasks</span><span class="hd-task-row__meta">1d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Weekly backlog triage</span><span class="hd-task-row__meta">2d</span></a>
        <a class="hd-task-row hd-task-row--done" href="#task/done"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Tidy CHANGELOG for 0.4.1</span><span class="hd-task-row__meta">3d</span></a>
        <div class="hd-sidebar__more"><span class="hd-glyph hd-glyph--running" aria-hidden="true" style="width: 12px; height: 12px;"></span>Loading older work</div>
      </div>
    </section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" style="flex: 1;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main" style="flex-direction: row;">
<div style="flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; min-height: 0;"><div class="hd-topbar"><span class="hd-topbar__title">Migrate events.jsonl reader</span><span class="hd-badge hd-badge--failed"><span class="hd-i hd-i-x" aria-hidden="true"></span>Failed 07:48</span><span class="hd-topbar__meta">Claude · Opus 5.5 · HarflowMCP</span><span class="hd-topbar__spacer"></span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Toggle right pane"><span class="hd-i hd-i-panel-right" aria-hidden="true"></span></button><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button></div><div class="hd-scroll" style="display: flex; flex-direction: column-reverse;"><div class="hd-transcript"><div class="hd-msg-user">Move the events.jsonl reader to the streaming parser and keep reading partially written trailing lines.</div>
<div class="hd-msg-agent"><p>I'll look at how the reader is used before swapping the parser.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-file" aria-hidden="true"></span><span class="hd-tool__summary">Read 5 files</span><span class="hd-tool__meta">0:08</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div><div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span><span class="hd-tool__summary">Edited <code>harflow_mcp/events/reader.py</code> &nbsp;<span style="color: var(--success);">+42</span> <span style="color: var(--danger);">−19</span></span><span class="hd-tool__meta">0:31</span><span class="hd-i hd-i--sm hd-i-chevron-right" aria-hidden="true"></span></button></div>
<div class="hd-msg-agent"><p>The reader now yields events lazily and holds back an incomplete trailing line until the next read. Running the events tests to confirm.</p></div>
<div class="hd-tool"><button type="button" class="hd-tool__head"><span class="hd-i hd-i--sm hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran <code>pytest tests/test_events_reader.py</code></span><span class="hd-tool__meta">0:19</span><span class="hd-i hd-i--sm hd-i-chevron-down" aria-hidden="true"></span></button><div class="hd-tool__body"><b>FAILED</b> tests/test_events_reader.py::test_partial_trailing_line
E   json.decoder.JSONDecodeError: Unterminated string starting at: line 1 column 38
1 failed, 14 passed in 1.77s</div></div>
<div class="hd-banner" role="alert"><span class="hd-i hd-i-alert" aria-hidden="true"></span><div class="hd-banner__body"><div class="hd-banner__title">Task failed: the harness exited with code 1</div>
<div>The last error was:</div>
<div class="hd-mono" style="margin: 4px 0 10px; word-break: break-all;">json.decoder.JSONDecodeError: Unterminated string starting at: line 1 column 38</div>
<div class="hd-row"><button type="button" class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i--sm hd-i-refresh" aria-hidden="true"></span> Retry</button><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm"><span class="hd-i hd-i--sm hd-i-copy" aria-hidden="true"></span> Copy resume command</button></div></div></div></div></div><div style="flex: none; width: 100%; max-width: var(--content-width); margin: 0 auto; padding: var(--space-2) var(--space-6) var(--space-5);"><form class="hd-composer" aria-label="Follow-up"><label class="hd-sr" for="followup">Follow-up message</label><textarea id="followup" class="hd-composer__input" rows="2" placeholder="Tell the agent how to continue" style="min-height: 28px;"></textarea><div class="hd-composer__bar"><span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="Send follow-up" disabled><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button></div></form></div></div>
  </main>
</div>
`;
})();
