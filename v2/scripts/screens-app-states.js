// Screen templates for the app-states family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['app-states/setup'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item" href="#new-task/default" aria-disabled="true" tabindex="-1" style="opacity: .45; pointer-events: none;" aria-disabled="true" tabindex="-1" style="opacity: .45; pointer-events: none;"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting" aria-disabled="true" tabindex="-1" style="opacity: .45; pointer-events: none;"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span></a>
      <a class="hd-nav-item" href="#workflows/list" aria-disabled="true" tabindex="-1" style="opacity: .45; pointer-events: none;"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots" aria-disabled="true" tabindex="-1" style="opacity: .45; pointer-events: none;"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview" aria-disabled="true" tabindex="-1" style="opacity: .45; pointer-events: none;"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running"><div class="hd-section__head">Running</div></section>
    <section class="hd-section hd-section--fill" aria-label="Recent work"><div class="hd-section__head">Recent work</div></section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" aria-disabled="true" tabindex="-1" style="flex: 1; opacity: .45; pointer-events: none;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main">
    <div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>
    <div class="hd-scroll" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 var(--space-6) var(--space-8, 80px);">
      <div style="width: 100%; max-width: 440px; display: flex; flex-direction: column; align-items: center; gap: var(--space-4); text-align: center;">
        <span class="hd-brand__mark hd-brand__mark--lg" aria-hidden="true"></span>
        <h1 class="title" style="margin: 0;">Finish setting up Harflow</h1>
        <p class="body hd-faint" style="margin: 0; color: var(--text-secondary);">Once the runtime components are ready, tasks and workflows will be available here.</p>
        <ul aria-label="Setup progress" style="list-style: none; margin: var(--space-2) 0; padding: 0; width: 100%; max-width: 340px; text-align: left;"><li style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-2) 0;"><span style="margin-top: 0;" class="hd-glyph hd-glyph--done" aria-hidden="true"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span style="font-size: 13px; line-height: 18px;">Git found</span></li><li style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-2) 0;"><span class="hd-glyph hd-glyph--running is-animated" aria-hidden="true" style="margin-top: 2px;"></span><span style="font-size: 13px; line-height: 18px;">Preparing the paired runtime<span class="caption hd-faint" style="display: block;">This can take a few minutes.</span></span></li><li style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-2) 0;"><span class="hd-glyph hd-glyph--queued" aria-hidden="true" style="margin-top: 2px;"></span><span style="font-size: 13px; line-height: 18px;">Register Harflow with your harnesses</span></li></ul>
        <div style="display: flex; align-items: center; gap: var(--space-3);"><button type="button" class="hd-btn hd-btn--primary" disabled>Installing…</button><a class="hd-btn hd-btn--ghost" href="#">View log</a></div>
      </div>
    </div>
  </main>
</div>
`;

  T['app-states/loading'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item is-active" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running"><div class="hd-section__head">Running</div><div class="hd-section__list"><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 60%;"></span></div><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 48%;"></span></div></div></section>
    <section class="hd-section hd-section--fill" aria-label="Recent work"><div class="hd-section__head">Recent work</div><div class="hd-section__list"><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 72%;"></span></div><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 55%;"></span></div><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 66%;"></span></div><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 40%;"></span></div><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 62%;"></span></div><div class="hd-task-row" aria-hidden="true"><span class="hd-skel" style="width: 14px; height: 14px; border-radius: 50%;"></span><span class="hd-skel hd-skel--line" style="width: 50%;"></span></div></div></section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" style="flex: 1;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main">
<div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>
<div class="hd-scroll" style="display: flex; flex-direction: column; align-items: center; padding: 120px var(--space-6) var(--space-6);" aria-busy="true">
<div style="width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: var(--space-5); align-items: center;">
<div class="hd-skel" style="width: 320px; height: 26px; border-radius: var(--radius-md);" aria-hidden="true"></div>
<div class="hd-composer" aria-hidden="true" style="gap: var(--space-3);"><span class="hd-skel hd-skel--line" style="width: 55%;"></span><span class="hd-skel hd-skel--line" style="width: 35%;"></span>
<div class="hd-row" style="gap: 6px; margin-top: var(--space-3);"><span class="hd-skel" style="width: 96px; height: 28px; border-radius: var(--radius-full);"></span><span class="hd-skel" style="width: 130px; height: 28px; border-radius: var(--radius-full);"></span><span class="hd-skel" style="width: 120px; height: 28px; border-radius: var(--radius-full);"></span></div></div>
<p class="caption hd-faint" role="status" style="margin: 0;">Connecting to the engine…</p></div></div>
  </main>
</div>
`;

  T['app-states/engine-error'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px;">
  <aside class="hd-sidebar" aria-label="Sidebar">
    <div class="hd-sidebar__top">
      <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
    </div>
    <nav class="hd-nav" aria-label="Main">
      <a class="hd-nav-item is-active" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
      <a class="hd-nav-item" href="#needs-you/waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span></a>
      <a class="hd-nav-item" href="#workflows/list"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <a class="hd-nav-item" href="#resources/slots"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <a class="hd-nav-item" href="#statistics/overview"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
    </nav>
    <section class="hd-section" aria-label="Running"><div class="hd-section__head">Running</div><div class="caption hd-faint" style="padding: 4px var(--space-2);">Unavailable</div></section>
    <section class="hd-section hd-section--fill" aria-label="Recent work"><div class="hd-section__head">Recent work</div><div class="caption hd-faint" style="padding: 4px var(--space-2);">Unavailable</div></section>
    <div class="hd-sidebar__foot">
      <a class="hd-nav-item" href="#settings/general" style="flex: 1;"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
      <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="{{systemOn}}" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{lightOn}}" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="{{darkOn}}" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
    </div>
  </aside>

  <main class="hd-main">
<div class="hd-topbar"><span class="hd-topbar__spacer"></span></div>
<div class="hd-scroll" style="display: flex; align-items: center; justify-content: center;">
<div class="hd-empty" role="alert" style="max-width: 520px; padding-top: 0;"><div class="hd-empty__icon" style="color: var(--danger);"><span class="hd-i hd-i-alert" aria-hidden="true"></span></div>
<div class="hd-empty__title">Harflow engine is not running</div>
<div class="hd-empty__text">The app could not reach harflow-ctl on this Mac. Start it, or check the engine path in Settings.</div>
<div class="hd-row" style="justify-content: center; margin-top: var(--space-2);"><button type="button" class="hd-btn hd-btn--primary">Start engine</button><button type="button" class="hd-btn hd-btn--secondary">Open settings</button></div>
<div class="hd-mono hd-faint" style="margin-top: var(--space-3);">connect ECONNREFUSED ~/.harflow/engine.sock</div></div></div>
  </main>
</div>
`;
})();
