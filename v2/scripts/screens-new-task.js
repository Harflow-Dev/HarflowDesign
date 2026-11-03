// Screen templates for the new-task family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['new-task/default'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item is-active" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
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

  <main class="hd-main">
    <div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>
    <div class="hd-scroll" style="display: flex; flex-direction: column; align-items: center; padding: 120px var(--space-6) var(--space-6);">
      <div style="width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: var(--space-5);">
        <h1 class="display" style="margin: 0; text-align: center;">What should we work on?</h1>
        <form class="hd-composer" aria-label="New task">
          <label class="hd-sr" for="prompt">Task prompt</label>
          <textarea id="prompt" class="hd-composer__input" rows="3" placeholder="Describe the task. Use @ to mention files."></textarea>
          <div class="hd-composer__bar">
            <button type="button" class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
            <button type="button" class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Claude · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
            <button type="button" class="hd-pill"><span class="hd-i hd-i-shield" aria-hidden="true"></span><span class="hd-pill__label">Can edit this repo</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
            <span class="hd-composer__spacer"></span>
            <button type="submit" class="hd-composer__send" aria-label="Start task" disabled><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button>
          </div>
        </form>
        <p class="caption hd-faint" style="margin: 0; text-align: center;">Press <span class="hd-kbd">↵</span> to start. Choices are remembered per repository.</p>
      </div>
    </div>
  </main>
</div>
`;

  T['new-task/harness-menu'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item is-active" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
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
    <div class="hd-scroll" style="display: flex; flex-direction: column; align-items: center; padding: 120px var(--space-6) var(--space-6);">
      <div style="width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: var(--space-5);">
        <h1 class="display" style="margin: 0; text-align: center;">What should we work on?</h1>
        <form class="hd-composer" aria-label="New task">
          <label class="hd-sr" for="prompt">Task prompt</label>
          <textarea id="prompt" class="hd-composer__input" rows="3" placeholder="Describe the task. Use @ to mention files."></textarea>
          <div class="hd-composer__bar">
            <button type="button" class="hd-pill"><span class="hd-i  hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i  hd-i-chevron-down" aria-hidden="true"></span></button>
            <span style="position: relative; display: inline-flex;">
              <button type="button" class="hd-pill is-open"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Claude · Opus 5.5</span><span class="hd-i  hd-i-chevron-down" aria-hidden="true"></span></button>
              <div class="hd-menu" role="menu" aria-label="Harness and model" style="position: absolute; top: calc(100% + 6px); left: 0; z-index: 5; width: 300px;">
                <div class="hd-menu__label">Harness</div>
                <button type="button" class="hd-menu__item"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Claude Code</span><span class="hd-menu__item-hint">Opus 5.5</span></span><span class="hd-menu__check"><span class="hd-i  hd-i-check" aria-hidden="true"></span></span></button>
                <button type="button" class="hd-menu__item"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Codex</span><span class="hd-menu__item-hint">gpt-6-astra</span></span></button>
                <button type="button" class="hd-menu__item"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Opencode</span><span class="hd-menu__item-hint">claude-sonnet-5</span></span></button>
                <button type="button" class="hd-menu__item"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Mistral Vibe</span><span class="hd-menu__item-hint">Default model</span></span></button>
                <button type="button" class="hd-menu__item" disabled aria-disabled="true" style="opacity: .5; cursor: default;"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Antigravity</span><span class="hd-menu__item-hint">Not installed</span></span></button>
                <div class="hd-menu__sep"></div>
                <div class="hd-menu__label">Model for Claude Code</div>
                <button type="button" class="hd-menu__item"><span class="hd-menu__item-body"><span>Opus 5.5</span></span><span class="hd-menu__check"><span class="hd-i  hd-i-check" aria-hidden="true"></span></span></button>
                <button type="button" class="hd-menu__item"><span class="hd-menu__item-body"><span>Sonnet 5.5</span></span></button>
                <button type="button" class="hd-menu__item"><span class="hd-menu__item-body"><span>Haiku 5</span></span></button>
              </div>
            
            </span>
            <button type="button" class="hd-pill"><span class="hd-i  hd-i-shield" aria-hidden="true"></span><span class="hd-pill__label">Can edit this repo</span><span class="hd-i  hd-i-chevron-down" aria-hidden="true"></span></button>
            <span class="hd-composer__spacer"></span>
            <button type="submit" class="hd-composer__send" aria-label="Start task" disabled><span class="hd-i  hd-i-arrow-up" aria-hidden="true"></span></button>
          </div>
        </form>
        <p class="caption hd-faint" style="margin: 0; text-align: center;">Press <span class="hd-kbd">↵</span> to start. Choices are remembered per repository.</p>
      </div>
    </div>
  </main>
</div>
`;

  T['new-task/sidebar-collapsed'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-rail" aria-label="Sidebar">
    <div class="hd-rail__top"><button class="hd-rail-item" aria-label="Expand sidebar" title="Expand sidebar"><span class="hd-brand__mark" aria-hidden="true"></span></button></div>
    <a class="hd-rail-item is-active" href="#new-task/default" aria-label="New task" title="New task"><span class="hd-i  hd-i-plus" aria-hidden="true"></span><span class="hd-rail-item__badge" aria-label="2 running">2</span></a>
    <a class="hd-rail-item" href="#needs-you/waiting" aria-label="Needs you" title="Needs you"><span class="hd-i  hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span></a>
    <a class="hd-rail-item" href="#workflows/list" aria-label="Workflows" title="Workflows"><span class="hd-i  hd-i-workflow" aria-hidden="true"></span></a>
    <a class="hd-rail-item" href="#resources/slots" aria-label="Resources" title="Resources"><span class="hd-i  hd-i-gauge" aria-hidden="true"></span></a>
    <a class="hd-rail-item" href="#statistics/overview" aria-label="Statistics" title="Statistics"><span class="hd-i  hd-i-chart" aria-hidden="true"></span></a>
    <span class="hd-rail__spacer"></span>
    <button type="button" class="hd-rail-item" aria-label="Change appearance" title="Appearance"><span class="hd-i hd-i-{{themeIcon}}" aria-hidden="true"></span></button>
    <a class="hd-rail-item" href="#settings/general" aria-label="Settings" title="Settings"><span class="hd-i  hd-i-settings" aria-hidden="true"></span></a>
  </aside>

  <main class="hd-main">
    <div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>
    <div class="hd-scroll" style="display: flex; flex-direction: column; align-items: center; padding: 120px var(--space-6) var(--space-6);">
      <div style="width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: var(--space-5);">
        <h1 class="display" style="margin: 0; text-align: center;">What should we work on?</h1>
        <form class="hd-composer" aria-label="New task">
          <label class="hd-sr" for="prompt">Task prompt</label>
          <textarea id="prompt" class="hd-composer__input" rows="3" placeholder="Describe the task. Use @ to mention files."></textarea>
          <div class="hd-composer__bar">
            <button type="button" class="hd-pill"><span class="hd-i  hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i  hd-i-chevron-down" aria-hidden="true"></span></button>
            <span style="position: relative; display: inline-flex;">
              <button type="button" class="hd-pill"><span class="hd-i  hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Claude · Opus 5.5</span><span class="hd-i  hd-i-chevron-down" aria-hidden="true"></span></button>
            </span>
            <button type="button" class="hd-pill"><span class="hd-i  hd-i-shield" aria-hidden="true"></span><span class="hd-pill__label">Can edit this repo</span><span class="hd-i  hd-i-chevron-down" aria-hidden="true"></span></button>
            <span class="hd-composer__spacer"></span>
            <button type="submit" class="hd-composer__send" aria-label="Start task" disabled><span class="hd-i  hd-i-arrow-up" aria-hidden="true"></span></button>
          </div>
        </form>
        <p class="caption hd-faint" style="margin: 0; text-align: center;">Press <span class="hd-kbd">↵</span> to start. Choices are remembered per repository.</p>
      </div>
    </div>
  </main>
</div>
`;
})();
