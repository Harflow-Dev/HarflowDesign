// Screen templates for the resources family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['resources/slots'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item is-active" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
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
    <div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>
    <div class="hd-scroll">
      <div class="hd-page">
        <div class="hd-page__head"><h1 class="hd-page__title">Resources</h1></div>
        <p class="hd-muted" style="margin: calc(-1 * var(--space-3)) 0 var(--space-5);">Slots limit how many tasks each harness runs at once. A task waits for a free slot before it starts.</p>
        <div class="hd-grid hd-grid--2">
        <section class="hd-card" aria-label="Claude Code">
          <div class="hd-meter">
            <div class="hd-meter__head"><span class="hd-meter__name">Claude Code</span><span class="hd-meter__value">2 of 3 in use</span></div>
            <div class="hd-meter__cells" role="img" aria-label="2 of 3 in use"><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell "></span></div>
          </div>
          <div style="margin-top: var(--space-3);"><a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a><a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">11:40</span></a></div>
        </section>
        <section class="hd-card" aria-label="Codex">
          <div class="hd-meter hd-meter--full">
            <div class="hd-meter__head"><span class="hd-meter__name">Codex</span><span class="hd-badge hd-badge--warning">1 waiting</span><span class="hd-meter__value">2 of 2 in use</span></div>
            <div class="hd-meter__cells" role="img" aria-label="2 of 2 in use"><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-waiting"></span></div>
          </div>
          <div style="margin-top: var(--space-3);"><a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Nightly dependency audit: Open pull request</span><span class="hd-task-row__meta">32:05</span></a><a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Review: Electron preload bridge</span><span class="hd-task-row__meta">06:31</span></a></div>
        </section>
        <section class="hd-card" aria-label="Opencode">
          <div class="hd-meter">
            <div class="hd-meter__head"><span class="hd-meter__name">Opencode</span><span class="hd-meter__value">0 of 2 in use</span></div>
            <div class="hd-meter__cells" role="img" aria-label="0 of 2 in use"><span class="hd-meter__cell "></span><span class="hd-meter__cell "></span></div>
          </div>
          <div style="margin-top: var(--space-3);"><div class="caption hd-faint" style="padding: 0 var(--space-2);">No tasks holding a slot.</div></div>
        </section>
        <section class="hd-card" aria-label="Mistral Vibe">
          <div class="hd-meter hd-meter--full">
            <div class="hd-meter__head"><span class="hd-meter__name">Mistral Vibe</span><span class="hd-meter__value">1 of 1 in use</span></div>
            <div class="hd-meter__cells" role="img" aria-label="1 of 1 in use"><span class="hd-meter__cell is-used"></span></div>
          </div>
          <div style="margin-top: var(--space-3);"><a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">18:22</span></a></div>
        </section>
        <section class="hd-card" aria-label="Antigravity" style="opacity: .75;">
          <div class="hd-meter">
            <div class="hd-meter__head"><span class="hd-meter__name">Antigravity</span><span class="hd-meter__value">Not installed</span></div>
            <div class="hd-meter__cells" aria-hidden="true"><span class="hd-meter__cell"></span><span class="hd-meter__cell"></span></div>
          </div>
          <div style="margin-top: var(--space-3); padding: 0 var(--space-2);"><a class="hd-btn hd-btn--secondary hd-btn--sm" href="#install-antigravity"><span class="hd-i hd-i--sm hd-i-external" aria-hidden="true"></span>Install</a></div>
        </section>
        </div>
        <h2 class="heading" style="margin: var(--space-6) 0 var(--space-2);">Waiting for a slot</h2>
        <div class="hd-list">
          <div class="hd-list-row"><span class="hd-glyph hd-glyph--queued" aria-hidden="true"></span><span class="hd-list-row__body"><span class="hd-list-row__title">Write contract fixtures for v1 tasks</span><span class="hd-list-row__desc">Waiting for a Codex slot</span></span><span class="hd-list-row__meta">Waited 4m</span><span class="hd-list-row__actions"><a class="hd-btn hd-btn--ghost hd-btn--sm" href="#task/running">Open task</a></span></div>
        </div>
      </div>
    </div>
  </main>
</div>
`;
})();
