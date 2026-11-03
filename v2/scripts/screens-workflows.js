// Screen templates for the workflows family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['workflows/list'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item is-active" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
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
        <div class="hd-page__head"><h1 class="hd-page__title">Workflows</h1><div class="hd-search" style="width: 220px;"><span class="hd-i  hd-i-search" aria-hidden="true"></span><label class="hd-sr" for="wf-search">Search workflows</label><input id="wf-search" class="hd-input" type="search" placeholder="Search workflows"></div>
          <button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-plus" aria-hidden="true"></span>New workflow</button></div>
        <div class="hd-list">
          <div class="hd-list-row">
            <span class="hd-list-row__icon"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></span>
            <span class="hd-list-row__body"><span class="hd-list-row__title">Nightly dependency audit</span><span class="hd-list-row__desc">Checks lockfiles for outdated and vulnerable packages and opens a pull request.</span></span>
            <span class="hd-list-row__meta"><span>4 nodes</span></span>
            <span class="hd-list-row__actions"><a class="hd-btn hd-btn--ghost" href="#workflow-editor/node-selected"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span>Edit</a><button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></span>
          </div>
          <div class="hd-list-row">
            <span class="hd-list-row__icon"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></span>
            <span class="hd-list-row__body"><span class="hd-list-row__title">Release checklist</span><span class="hd-list-row__desc">Prepares the changelog, runs tests, builds installers and publishes the release.</span></span>
            <span class="hd-list-row__meta"><span>5 nodes</span></span>
            <span class="hd-list-row__actions"><a class="hd-btn hd-btn--ghost" href="#workflow-editor/node-selected"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span>Edit</a><button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></span>
          </div>
          <div class="hd-list-row">
            <span class="hd-list-row__icon"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></span>
            <span class="hd-list-row__body"><span class="hd-list-row__title">Weekly backlog triage</span><span class="hd-list-row__desc">Labels new issues, flags stale ones and drafts a summary.</span></span>
            <span class="hd-list-row__meta"><span>3 nodes</span></span>
            <span class="hd-list-row__actions"><a class="hd-btn hd-btn--ghost" href="#workflow-editor/node-selected"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span>Edit</a><button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></span>
          </div>
          <div class="hd-list-row">
            <span class="hd-list-row__icon"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></span>
            <span class="hd-list-row__body"><span class="hd-list-row__title">Review pull request</span><span class="hd-list-row__desc">Reviews a pull request for correctness and tests, then posts findings.</span></span>
            <span class="hd-list-row__meta"><span>3 nodes</span></span>
            <span class="hd-list-row__actions"><a class="hd-btn hd-btn--ghost" href="#workflow-editor/node-selected"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span>Edit</a><button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></span>
          </div>
          <div class="hd-list-row">
            <span class="hd-list-row__icon"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></span>
            <span class="hd-list-row__body"><span class="hd-list-row__title">Docs link check</span><span class="hd-list-row__desc">Finds broken links in the docs and proposes fixes.</span></span>
            <span class="hd-list-row__meta"><span>2 nodes</span></span>
            <span class="hd-list-row__actions"><a class="hd-btn hd-btn--ghost" href="#workflow-editor/node-selected"><span class="hd-i hd-i--sm hd-i-pencil" aria-hidden="true"></span>Edit</a><button type="button" class="hd-btn hd-btn--secondary"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
`;

  T['workflows/empty'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item is-active" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
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
        <div class="hd-page__head"><h1 class="hd-page__title">Workflows</h1></div>
        <div class="hd-empty" style="padding-top: 120px;">
          <div class="hd-empty__icon"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></div>
          <div class="hd-empty__title">No workflows yet</div>
          <div class="hd-empty__text">A workflow chains agents into steps you can run again. Build one on the canvas, or describe what you need and an agent drafts it.</div>
          <div class="hd-row" style="justify-content: center; margin-top: var(--space-3);">
            <button type="button" class="hd-btn hd-btn--primary"><span class="hd-i hd-i--sm hd-i-plus" aria-hidden="true"></span>New workflow</button>
            <button type="button" class="hd-btn hd-btn--secondary">Describe one to an agent</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
`;

  T['workflows/run'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item is-active" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running">
      <div class="hd-section__head">Running <span class="hd-section__count">3</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row" href="#parallel-group/lanes"><span class="hd-glyph hd-glyph--active" aria-label="Parallel group, running"><span class="hd-i hd-i--sm hd-i-parallel" aria-hidden="true"></span></span><span class="hd-task-row__title">Review preload bridge</span><span class="hd-task-row__meta">1/3</span></a>
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

<main class="hd-main"><div class="hd-topbar"><a class="hd-btn hd-btn--ghost hd-btn--sm" href="#workflows/list"><span class="hd-i hd-i--sm hd-i-arrow-left" aria-hidden="true"></span>Workflows</a><span class="hd-topbar__spacer"></span></div><div class="hd-scroll" style="display:flex;flex-direction:column;align-items:center;padding:96px var(--space-6) var(--space-6);"><div style="width:100%;max-width:720px;display:flex;flex-direction:column;gap:var(--space-5);"><h1 class="display" style="margin:0;text-align:center;">Run Release checklist</h1><form class="hd-composer" aria-label="Run workflow"><div class="hd-field"><label class="hd-field__label" for="task">Task <span class="hd-faint" style="font-weight:400;">Required</span></label><textarea id="task" class="hd-composer__input" rows="3" placeholder="What should this run do?">Prepare the 0.4.3 release of HarflowMCP: update the changelog from merged pull requests, run the full test suite and confirm the version bump matches the changelog.</textarea></div><div class="hd-field" style="border-top:1px solid var(--border);padding-top:var(--space-2);"><button type="button" id="goal-toggle" aria-expanded="true" aria-controls="goal-panel" class="hd-row" style="border:0;background:transparent;padding:0;cursor:pointer;font:inherit;font-size:12px;line-height:16px;font-weight:500;color:var(--text-secondary);gap:4px;"><span class="hd-i hd-i--sm hd-i-chevron-down" aria-hidden="true"></span>Goal (optional)</button><div id="goal-panel" style="display:flex;flex-direction:column;gap:4px;"><label class="hd-sr" for="goal">Goal</label><textarea id="goal" class="hd-composer__input" rows="2" style="min-height:44px;">A tagged release candidate with an accurate changelog and a green test run, ready to publish.</textarea><span class="hd-field__hint">Describe the result and the evidence needed to verify it.</span></div></div><div class="hd-composer__bar"><button type="button" class="hd-pill hd-pill--accent"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-pill__label">Release checklist</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button><button type="button" class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button><button type="button" class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Orchestrator: saved</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button><span class="hd-composer__spacer"></span><button type="submit" class="hd-composer__send" aria-label="Run workflow"><span class="hd-i hd-i-play" aria-hidden="true"></span></button></div></form><section aria-label="Permissions preview" style="display:flex;flex-direction:column;gap:var(--space-1);padding:0 var(--space-2);"><span class="caption hd-faint">This run will use</span><div class="hd-row caption hd-muted" style="flex-wrap:nowrap;gap:var(--space-2);"><span class="hd-i hd-i--sm hd-i-harness" aria-hidden="true"></span><span>Claude Code · Can edit this repo · Network: not controlled</span></div><div class="hd-row caption hd-muted" style="flex-wrap:nowrap;gap:var(--space-2);"><span class="hd-i hd-i--sm hd-i-harness" aria-hidden="true"></span><span>Codex · Read-only · Sandboxed</span></div></section></div></div></main>
</div>
`;
})();
