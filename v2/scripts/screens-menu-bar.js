// Screen templates for the menu-bar family. Placeholders: {{theme}}, {{lightOn}},
// {{darkOn}}, {{systemOn}} and {{themeIcon}} are filled in by HFV2.fill.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});

  T['menu-bar/busy'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px; background: var(--bg-sidebar); flex-direction: column;">
  <div style="height: 28px; flex: none; display: flex; align-items: center; justify-content: flex-end; gap: var(--space-3); padding: 0 var(--space-3); background: var(--surface); border-bottom: 1px solid var(--border);">
    <span class="caption hd-faint" style="margin-right: auto;">Harflow</span>
    <span class="hd-i hd-i--sm hd-i-search" aria-hidden="true"></span>
    <span aria-label="Harflow, menu open" role="img" style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 22px; border-radius: var(--radius-sm); background: var(--surface-active);"><span class="hd-mark-glyph" aria-hidden="true" style="color: var(--text);"></span></span>
    <span class="caption">Tue 14:32</span>
  </div>
  <div style="position: relative; flex: 1; min-height: 0;">
    <section aria-label="Harflow menu" style="position: absolute; top: 6px; right: 70px; width: 360px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-popover); overflow: hidden; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; padding: var(--space-3) var(--space-3) var(--space-1) var(--space-4);">
        <span class="caption" style="flex: 1;">3 running</span>
        <button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="New task"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button>
      </div>
    <section aria-label="Needs you" style="padding: 0 var(--space-3) var(--space-2);">
      <div class="hd-section__head" style="padding-left: var(--space-1); color: var(--attention);"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span>Needs you <span class="hd-section__count">2</span></div>
      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
        <div class="hd-approval">
          <div class="hd-approval__head" style="padding: 8px 12px;"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Run command</div>
          <div class="hd-approval__body" style="padding: 10px 12px; gap: 6px;">
            <div class="hd-approval__cmd" style="font-size: 12px; line-height: 18px; padding: 6px 8px;">pytest tests/test_slots.py -k release</div>
            <div class="hd-approval__meta">Fix flaky slot release test · Claude Code</div>
          </div>
          <div class="hd-approval__actions" style="padding: 0 12px 10px;"><button type="button" class="hd-btn hd-btn--primary hd-btn--sm">Approve</button><button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Reject</button></div>
        </div>
        <form class="hd-approval" aria-label="Question from Nightly dependency audit">
          <div class="hd-approval__head" style="padding: 8px 12px;"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Question</div>
          <div class="hd-approval__body" style="padding: 10px 12px; gap: 8px;">
            <div style="font-size: 13px; line-height: 18px;">Nightly dependency audit asks: Upgrade pydantic to 3.x?</div>
            <label class="hd-sr" for="mb-answer">Your answer</label>
            <input id="mb-answer" class="hd-input" type="text" placeholder="Type an answer" style="height: 28px; font-size: 12.5px;">
          </div>
          <div class="hd-approval__actions" style="padding: 0 12px 10px;"><button type="submit" class="hd-btn hd-btn--primary hd-btn--sm">Answer</button></div>
        </form>
      </div>
    </section>
    <section aria-label="Running" style="padding: 0 var(--space-2) var(--space-1);">
      <div class="hd-section__head">Running <span class="hd-section__count">3</span></div>
      <div class="hd-section__list">
        <a class="hd-task-row" href="#"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
        <a class="hd-task-row" href="#"><span class="hd-glyph hd-glyph--active" aria-label="Workflow run, running"><span class="hd-i hd-i--sm hd-i-workflow" style="color: var(--accent);" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
        <a class="hd-task-row" href="#"><span class="hd-glyph hd-glyph--active" aria-label="Parallel group, running"><span class="hd-i hd-i--sm hd-i-parallel" aria-hidden="true"></span></span><span class="hd-task-row__title">Review preload bridge</span><span class="hd-task-row__meta">1/3</span></a>
      </div>
    </section>
    <section aria-label="Recent" style="padding: 0 var(--space-2) var(--space-2);">
      <div class="hd-section__head">Recent</div>
      <div class="hd-section__list">
        <a class="hd-task-row hd-task-row--done" href="#"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12m</span></a>
        <a class="hd-task-row hd-task-row--done" href="#"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
        <a class="hd-task-row hd-task-row--done" href="#"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Release checklist v0.4.2</span><span class="hd-task-row__meta">3h</span></a>
      </div>
    </section>
    <div style="display: flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-3); border-top: 1px solid var(--border);">
      <button type="button" class="hd-btn hd-btn--ghost hd-btn--sm"><span class="hd-i hd-i--sm hd-i-external" aria-hidden="true"></span>Open Harflow</button>
      <span style="flex: 1;"></span>
      <button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Settings…</button>
      <button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Quit</button>
    </div>
    </section>
  </div>
</div>
`;

  T['menu-bar/empty'] = `
<div class="hd-app" data-theme="{{theme}}" style="width: 100%; height: 800px; background: var(--bg-sidebar); flex-direction: column;">
  <div style="height: 28px; flex: none; display: flex; align-items: center; justify-content: flex-end; gap: var(--space-3); padding: 0 var(--space-3); background: var(--surface); border-bottom: 1px solid var(--border);">
    <span class="caption hd-faint" style="margin-right: auto;">Harflow</span>
    <span class="hd-i hd-i--sm hd-i-search" aria-hidden="true"></span>
    <span aria-label="Harflow, menu open" role="img" style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 22px; border-radius: var(--radius-sm); background: var(--surface-active);"><span class="hd-mark-glyph" aria-hidden="true" style="color: var(--text);"></span></span>
    <span class="caption">Tue 14:32</span>
  </div>
  <div style="position: relative; flex: 1; min-height: 0;">
    <section aria-label="Harflow menu" style="position: absolute; top: 6px; right: 70px; width: 360px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-popover); overflow: hidden; display: flex; flex-direction: column;">
      <div style="display: flex; align-items: center; padding: var(--space-3) var(--space-3) var(--space-1) var(--space-4);">
        <span class="caption" style="flex: 1;">Nothing running</span>
        <button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="New task"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button>
      </div>
    <div class="hd-empty" style="padding: var(--space-6) var(--space-4);">
      <div class="hd-empty__icon"><span class="hd-i hd-i-check" aria-hidden="true"></span></div>
      <div class="caption hd-faint" style="margin: 0; text-wrap: balance;">No tasks yet. Tasks started through Harflow appear here.</div>
    </div>
    <div style="display: flex; align-items: center; gap: var(--space-1); padding: var(--space-2) var(--space-3); border-top: 1px solid var(--border);">
      <button type="button" class="hd-btn hd-btn--ghost hd-btn--sm"><span class="hd-i hd-i--sm hd-i-external" aria-hidden="true"></span>Open Harflow</button>
      <span style="flex: 1;"></span>
      <button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Settings…</button>
      <button type="button" class="hd-btn hd-btn--ghost hd-btn--sm">Quit</button>
    </div>
    </section>
  </div>
</div>
`;
})();
