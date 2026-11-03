// Screen templates for the needs-you family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['needs-you/waiting'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item is-active" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">3</span></a>
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
    <div class="hd-scroll">
      <div class="hd-page">
        <div class="hd-page__head"><h1 class="hd-page__title">Needs you</h1><span class="hd-badge hd-badge--attention">3 waiting</span></div>
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
      <section class="hd-approval" aria-label="Wants to run a command">
        <div class="hd-approval__head"><span class="hd-i  hd-i-hand" aria-hidden="true"></span><span>Wants to run a command</span><span class="hd-approval__src">Task: Fix flaky slot release test · waiting 3m</span></div>
        <div class="hd-approval__body">
          <div class="hd-approval__cmd">npm test -- --runInBand slot-release</div>
          <div class="hd-approval__meta">In ~/Code/Harflow/HarflowMCP · Claude Code · Opus 5.5</div>
        </div>
        <div class="hd-approval__actions">
          <button type="button" class="hd-btn hd-btn--primary">Approve once</button>
          <button type="button" class="hd-btn hd-btn--secondary">Reject</button>
          <span style="flex: 1;"></span>
          <a class="hd-btn hd-btn--ghost" href="#task/running"><span class="hd-i  hd-i-external" aria-hidden="true"></span>Open task</a>
        </div>
      </section>
      <section class="hd-approval" aria-label="Wants to publish">
        <div class="hd-approval__head"><span class="hd-i  hd-i-hand" aria-hidden="true"></span><span>Wants to publish</span><span class="hd-approval__src">Workflow: Nightly dependency audit · step Open pull request · waiting 1h</span></div>
        <div class="hd-approval__body">
          <div class="hd-approval__cmd">Push branch deps/audit-2026-11-03 and open a pull request in HarflowMCP</div>
          <div class="hd-approval__meta">Needs Can publish access · Codex · gpt-6-astra</div>
        </div>
        <div class="hd-approval__actions">
          <button type="button" class="hd-btn hd-btn--primary">Approve</button>
          <button type="button" class="hd-btn hd-btn--secondary">Reject</button>
          <span style="flex: 1;"></span>
          <a class="hd-btn hd-btn--ghost" href="#workflow-run/graph-needs-you"><span class="hd-i  hd-i-external" aria-hidden="true"></span>Open run</a>
        </div>
      </section>
      <section class="hd-approval" aria-label="Asks a question">
        <div class="hd-approval__head"><span class="hd-i  hd-i-hand" aria-hidden="true"></span><span>Asks a question</span><span class="hd-approval__src">Task: Migrate events.jsonl reader · waiting 12m</span></div>
        <div class="hd-approval__body">
          <p style="margin: 0;">Which config should win when both are set?</p>
          <div class="hd-approval__meta">Opencode · claude-sonnet-5</div>
        </div>
        <form class="hd-approval__actions" aria-label="Reply">
          <label class="hd-sr" for="reply">Reply</label>
          <input id="reply" class="hd-input" type="text" placeholder="Type a reply" style="flex: 1;">
          <button type="submit" class="hd-btn hd-btn--primary">Send</button>
          <a class="hd-btn hd-btn--ghost" href="#task/running"><span class="hd-i  hd-i-external" aria-hidden="true"></span>Open task</a>
        </form>
      </section>
        </div>
      </div>
    </div>
  </main>
</div>
`;

  T['needs-you/empty'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item is-active" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running">
      <div class="hd-section__head">Running <span class="hd-section__count">2</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row" href="#task/running"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
        <a class="hd-task-row" href="#workflow-run/graph-needs-you"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
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
        <div class="hd-page__head"><h1 class="hd-page__title">Needs you</h1></div>
        <div class="hd-empty" style="padding-top: 120px;">
          <div class="hd-empty__icon"><span class="hd-i  hd-i-hand" aria-hidden="true"></span></div>
          <div class="hd-empty__title">Nothing needs you</div>
          <div class="hd-empty__text">Approvals and questions from running tasks and workflows appear here, so you can answer them in one place.</div>
        </div>
      </div>
    </div>
  </main>
</div>
`;
})();
