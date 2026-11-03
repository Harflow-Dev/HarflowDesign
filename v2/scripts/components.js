// Component previews from the Harflow Desktop design system, rendered at 960 wide.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});
  var M = (HFV2.componentMeta = HFV2.componentMeta || {});

  T['components/cover'] = `
<style>
.cv{position:relative;width:960px;height:288px;background:var(--bg);overflow:hidden;font-family:var(--font-sans)}
.cv svg{position:absolute;left:0;top:0}
.cv .ink{fill:var(--text)}
.cv .side{fill:var(--bg-sidebar)}
.cv .acc{fill:var(--accent-solid)}
.cv .tint{fill:var(--surface-active)}
.cv .att{fill:var(--attention)}
.cv .row{fill:var(--surface-active)}
.cv .row-on{fill:var(--text-tertiary)}
.cv__text{position:absolute;left:40px;bottom:28px;max-width:440px}
.cv__name{margin:16px 0 0;font-size:64px;line-height:.95;font-weight:600;letter-spacing:-.02em;color:var(--text)}
.cv__tag{margin:12px 0 0;font-size:14px;line-height:20px;color:var(--text-secondary)}
</style>
<div class="cv">
<!--
blocks: side (bg-sidebar) 264×288 slab at x=504 = sidebar-width; acc (accent-solid) 168×120 radius-lg; ink (text) 120×168 radius-lg; tint (surface-active) 96×96 radius-lg; att (attention) 16px disc = the Needs you dot.
arrangement: one tall slab with satellites, the slab reads as the app's sidebar, satellites bleed off the right and bottom edges.
pattern: geometric, modular, dense UI -> sidebar rows cut at row-height 32 with radius-sm, eight rows, two of them "on"; the system is a list of tasks first.
steps and radii: space-3 12, space-4 16, space-5 24, row-height 32, sidebar-width 264, radius-sm 6, radius-lg 12, radius-full.
-->
<svg width="960" height="288" viewBox="0 0 960 288" aria-hidden="true">
  <rect class="side" x="504" y="0" width="264" height="288"/>
  <rect class="row-on" x="520" y="24" width="120" height="8" rx="4"/>
  <rect class="row" x="520" y="56" width="232" height="32" rx="6"/>
  <rect class="row" x="520" y="96" width="232" height="32" rx="6"/>
  <rect class="row" x="520" y="136" width="200" height="32" rx="6"/>
  <rect class="row" x="520" y="176" width="232" height="32" rx="6"/>
  <rect class="row" x="520" y="216" width="168" height="32" rx="6"/>
  <rect class="row" x="520" y="256" width="216" height="32" rx="6"/>
  <circle class="att" cx="736" cy="72" r="8"/>
  <rect class="acc" x="792" y="-12" width="168" height="120" rx="12"/>
  <rect class="ink" x="792" y="132" width="120" height="168" rx="12"/>
  <rect class="tint" x="924" y="132" width="96" height="96" rx="12"/>
</svg>
<div class="cv__text">
  <span class="hd-brand__mark hd-brand__mark--lg" style="display:block" aria-hidden="true"></span>
  <h1 class="cv__name">Harflow<br>Desktop</h1>
  <p class="cv__tag">Calm, minimal components for running and watching agent tasks.</p>
</div>
</div>
`;
  M['components/cover'] = { width: 960, height: 288, group: 'Foundations' };

  T['components/button'] = `
<div class="hd-stage">
  <div class="hd-col">
    <div class="caption hd-faint">Primary, secondary, ghost, danger</div>
    <div class="hd-row">
      <button class="hd-btn hd-btn--primary" style="color:var(--on-accent)">Run</button>
      <button class="hd-btn hd-btn--secondary">Reject</button>
      <button class="hd-btn hd-btn--ghost">Take over in terminal</button>
      <button class="hd-btn hd-btn--danger" style="color:var(--danger)">Cancel task</button>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">With icon, and icon only</div>
    <div class="hd-row">
      <button class="hd-btn hd-btn--primary" style="color:var(--on-accent)"><span class="hd-i hd-i-play" aria-hidden="true"></span>Run</button>
      <button class="hd-btn hd-btn--secondary"><span class="hd-i hd-i-pencil" aria-hidden="true"></span>Edit</button>
      <button class="hd-btn hd-btn--icon" aria-label="More actions"><span class="hd-i hd-i-more" aria-hidden="true"></span></button>
      <button class="hd-btn hd-btn--icon" aria-label="Copy"><span class="hd-i hd-i-copy" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Small (hd-btn--sm)</div>
    <div class="hd-row">
      <button class="hd-btn hd-btn--primary hd-btn--sm" style="color:var(--on-accent)">Approve</button>
      <button class="hd-btn hd-btn--secondary hd-btn--sm">Reject</button>
      <button class="hd-btn hd-btn--ghost hd-btn--sm">Dismiss</button>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Close"><span class="hd-i hd-i-x" aria-hidden="true"></span></button>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Disabled</div>
    <div class="hd-row">
      <button class="hd-btn hd-btn--primary" disabled style="color:var(--on-accent)">Run</button>
      <button class="hd-btn hd-btn--secondary" disabled>Reject</button>
      <button class="hd-btn hd-btn--danger" disabled style="color:var(--danger)">Cancel task</button>
    </div>
  </div>
</div>
`;
  M['components/button'] = { width: 960, height: 320, group: 'Actions' };

  T['components/menu'] = `
<div class="hd-stage">
  <div class="caption hd-faint">Access level menu, opened from the composer pill</div>
  <div class="hd-menu" role="menu" aria-label="Access level">
    <div class="hd-menu__label">Access level</div>
    <button class="hd-menu__item" role="menuitemradio" aria-checked="false"><span class="hd-i hd-i-eye" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Read-only</span><span class="hd-menu__item-hint">Reads files, cannot change them</span></span></button>
    <button class="hd-menu__item is-hover" role="menuitemradio" aria-checked="true"><span class="hd-i hd-i-pencil" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Can edit this repo</span><span class="hd-menu__item-hint">Edits files in the selected folder</span></span><span class="hd-i hd-i-check hd-menu__check" aria-hidden="true"></span></button>
    <button class="hd-menu__item" role="menuitemradio" aria-checked="false"><span class="hd-i hd-i-external" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Can publish</span><span class="hd-menu__item-hint">Commits, pushes and opens pull requests</span></span></button>
    <button class="hd-menu__item" role="menuitemradio" aria-checked="false" disabled style="opacity:.45;cursor:default"><span class="hd-i hd-i-shield" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Full access</span><span class="hd-menu__item-hint">Not available for this harness</span></span></button>
    <div class="hd-menu__sep" role="separator"></div>
    <button class="hd-menu__item hd-menu__item--danger" role="menuitem"><span class="hd-i hd-i-stop" aria-hidden="true"></span><span class="hd-menu__item-body"><span>Cancel task</span></span></button>
  </div>
  <div class="caption hd-faint">Second row is hovered (is-hover) and checked.</div>
</div>
`;
  M['components/menu'] = { width: 960, height: 390, group: 'Actions' };

  T['components/pill'] = `
<div class="hd-stage">
  <div class="hd-col">
    <div class="caption hd-faint">Default and open</div>
    <div class="hd-row">
      <button class="hd-pill"><span class="hd-pill__label">HarflowMCP</span></button>
      <button class="hd-pill is-open"><span class="hd-pill__label">HarflowMCP</span></button>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Accent, removable (workflow in the Run composer)</div>
    <div class="hd-row">
      <span class="hd-pill hd-pill--accent"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-pill__label">Release checklist</span><button class="hd-btn hd-btn--icon hd-btn--sm hd-pill__x" style="width:18px;height:18px;border-radius:var(--radius-full);color:inherit" aria-label="Remove workflow"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></button></span>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">With icons and chevron: folder, harness plus model, access level</div>
    <div class="hd-row">
      <button class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
      <button class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Claude · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
      <button class="hd-pill"><span class="hd-i hd-i-shield" aria-hidden="true"></span><span class="hd-pill__label">Can edit this repo</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
    </div>
  </div>
</div>
`;
  M['components/pill'] = { width: 960, height: 240, group: 'Actions' };

  T['components/theme-toggle'] = `
<div class="hd-stage" style="flex-direction:row;align-items:flex-start;gap:var(--space-6)">
  <div class="hd-col">
    <div class="caption hd-faint">System pressed</div>
    <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="true" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Light pressed</div>
    <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="true" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Dark pressed</div>
    <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="true" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Vertical (hd-theme--vertical)</div>
    <div class="hd-theme hd-theme--vertical" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="true" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
  </div>
  <div class="hd-col" style="width:56px">
    <div class="caption hd-faint">Rail button</div>
    <button class="hd-rail-item" aria-label="Appearance: Light. Switch to Dark" title="Appearance: Light"><span class="hd-i hd-i-sun" aria-hidden="true"></span></button>
  </div>
</div>
`;
  M['components/theme-toggle'] = { width: 960, height: 260, group: 'Actions' };

  T['components/changed-files'] = `
<div class="hd-stage" style="max-width:420px">
  <div class="caption hd-faint">File rows</div>
  <div class="hd-col" style="gap:1px">
    <div class="hd-file"><span class="hd-i hd-i-file" aria-hidden="true"></span><span class="hd-file__path">tests/test_slots.py</span><span class="hd-file__add">+12</span><span class="hd-file__del">−4</span></div>
    <div class="hd-file"><span class="hd-i hd-i-file" aria-hidden="true"></span><span class="hd-file__path">src/harflow_mcp/slots/release.py</span><span class="hd-file__add">+8</span><span class="hd-file__del">−1</span></div>
    <div class="hd-file"><span class="hd-i hd-i-file" aria-hidden="true"></span><span class="hd-file__path">CHANGELOG.md</span><span class="hd-file__add">+3</span><span class="hd-file__del">−0</span></div>
  </div>
  <div class="caption hd-faint">Diff</div>
  <div class="hd-diff" role="group" aria-label="Diff of tests/test_slots.py">
    <div class="hd-diff__line hd-diff__line--hunk"><span class="hd-diff__sign"></span>@@ -41,7 +41,9 @@ def test_release_frees_slot</div>
    <div class="hd-diff__line"><span class="hd-diff__sign"> </span>    slot = pool.acquire("claude")</div>
    <div class="hd-diff__line"><span class="hd-diff__sign"> </span>    pool.release(slot)</div>
    <div class="hd-diff__line hd-diff__line--del"><span class="hd-diff__sign">−</span>    time.sleep(0.1)</div>
    <div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>    assert pool.wait_released(slot, timeout=2)</div>
    <div class="hd-diff__line hd-diff__line--add"><span class="hd-diff__sign">+</span>    assert pool.status("claude").in_use == 0</div>
    <div class="hd-diff__line"><span class="hd-diff__sign"> </span></div>
  </div>
</div>
`;
  M['components/changed-files'] = { width: 960, height: 370, group: 'Data' };

  T['components/slot-meter'] = `
<div class="hd-stage" style="max-width:420px;gap:var(--space-5)">
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Cells, 2 of 3 in use</div>
    <div class="hd-meter">
      <div class="hd-meter__head"><span class="hd-meter__name">Claude</span><span class="hd-meter__value">2 of 3 in use</span></div>
      <div class="hd-meter__cells" role="img" aria-label="Claude: 2 of 3 slots in use"><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell is-used"></span><span class="hd-meter__cell"></span></div>
    </div>
  </div>
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Full, one task waiting (hd-meter--full)</div>
    <div class="hd-meter hd-meter--full">
      <div class="hd-meter__head"><span class="hd-meter__name">Codex</span><span class="hd-meter__value" style="color:var(--warning)">2 of 2 in use · 1 waiting</span></div>
      <div class="hd-meter__cells" role="img" aria-label="Codex: 2 of 2 slots in use, 1 task waiting"><span class="hd-meter__cell is-used" style="background:var(--warning)"></span><span class="hd-meter__cell is-used" style="background:var(--warning)"></span><span class="hd-meter__cell is-waiting"></span></div>
    </div>
  </div>
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Bar variant</div>
    <div class="hd-meter">
      <div class="hd-meter__head"><span class="hd-meter__name">Claude</span><span class="hd-meter__value">2 of 3 in use</span></div>
      <div class="hd-meter__track" role="img" aria-label="Claude: 2 of 3 slots in use"><span class="hd-meter__fill" style="width:66%"></span></div>
    </div>
    <div class="hd-meter hd-meter--full">
      <div class="hd-meter__head"><span class="hd-meter__name">Codex</span><span class="hd-meter__value">2 of 2 in use</span></div>
      <div class="hd-meter__track" role="img" aria-label="Codex: 2 of 2 slots in use"><span class="hd-meter__fill" style="width:100%"></span></div>
    </div>
  </div>
</div>
`;
  M['components/slot-meter'] = { width: 960, height: 310, group: 'Data' };

  T['components/stat-tile'] = `
<div class="hd-stage">
  <div class="hd-grid hd-grid--4">
    <div class="hd-stat"><span class="hd-stat__label">Tasks run</span><span class="hd-stat__value">1,284</span><span class="hd-stat__delta">212 this week</span></div>
    <div class="hd-stat"><span class="hd-stat__label">Success rate</span><span class="hd-stat__value">94%</span><span class="hd-stat__delta">Failed 31, Timed out 9</span></div>
    <div class="hd-stat"><span class="hd-stat__label">Median elapsed</span><span class="hd-stat__value">07:42</span><span class="hd-stat__delta">Longest 1:14:09</span></div>
    <div class="hd-stat"><span class="hd-stat__label">Workflow runs</span><span class="hd-stat__value">86</span><span class="hd-stat__delta">4 running now</span></div>
  </div>
</div>
`;
  M['components/stat-tile'] = { width: 960, height: 160, group: 'Data' };

  T['components/workflow-row'] = `
<div class="hd-stage">
  <div class="caption hd-faint">Saved workflows. Run state lives in the sidebar; Run is always available</div>
  <div class="hd-list" role="list">
    <div class="hd-list-row" role="listitem">
      <span class="hd-list-row__icon"><span class="hd-i hd-i-workflow" aria-hidden="true"></span></span>
      <div class="hd-list-row__body"><div class="hd-list-row__title">Release checklist</div><div class="hd-list-row__desc">Builds, signs and verifies a release candidate.</div></div>
      <div class="hd-list-row__meta">4 nodes</div>
      <div class="hd-list-row__actions"><button class="hd-btn hd-btn--ghost hd-btn--sm">Edit</button><button class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></div>
    </div>
    <div class="hd-list-row" role="listitem">
      <span class="hd-list-row__icon"><span class="hd-i hd-i-workflow" aria-hidden="true"></span></span>
      <div class="hd-list-row__body"><div class="hd-list-row__title">Nightly dependency audit</div><div class="hd-list-row__desc">Checks Python and npm dependencies for advisories.</div></div>
      <div class="hd-list-row__meta">4 nodes</div>
      <div class="hd-list-row__actions"><button class="hd-btn hd-btn--ghost hd-btn--sm">Edit</button><button class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></div>
    </div>
    <div class="hd-list-row" role="listitem">
      <span class="hd-list-row__icon"><span class="hd-i hd-i-workflow" aria-hidden="true"></span></span>
      <div class="hd-list-row__body"><div class="hd-list-row__title">Review pull request</div><div class="hd-list-row__desc">Reads a diff and posts review notes.</div></div>
      <div class="hd-list-row__meta">3 nodes</div>
      <div class="hd-list-row__actions"><button class="hd-btn hd-btn--ghost hd-btn--sm">Edit</button><button class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></div>
    </div>
    <div class="hd-list-row" role="listitem">
      <span class="hd-list-row__icon"><span class="hd-i hd-i-workflow" aria-hidden="true"></span></span>
      <div class="hd-list-row__body"><div class="hd-list-row__title">Weekly backlog triage</div><div class="hd-list-row__desc">Groups new issues and proposes labels.</div></div>
      <div class="hd-list-row__meta">3 nodes</div>
      <div class="hd-list-row__actions"><button class="hd-btn hd-btn--ghost hd-btn--sm">Edit</button><button class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Run</button></div>
    </div>
  </div>
</div>
`;
  M['components/workflow-row'] = { width: 960, height: 350, group: 'Data' };

  T['components/banner'] = `
<div class="hd-stage">
  <div class="caption hd-faint">Danger (default)</div>
  <div class="hd-banner" role="alert">
    <span class="hd-i hd-i-alert" aria-hidden="true"></span>
    <div class="hd-banner__body"><div class="hd-banner__title">Claude is not installed</div>Install Claude Code, then choose Retry.</div>
    <button class="hd-btn hd-btn--secondary hd-btn--sm">Retry</button>
  </div>
  <div class="caption hd-faint">Warning</div>
  <div class="hd-banner hd-banner--warning" role="status">
    <span class="hd-i hd-i-alert" aria-hidden="true"></span>
    <div class="hd-banner__body"><div class="hd-banner__title">Codex slots are full</div>1 task is waiting. Raise the limit in Resources to start it sooner.</div>
    <button class="hd-btn hd-btn--secondary hd-btn--sm">Open Resources</button>
    <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Dismiss"><span class="hd-i hd-i-x" aria-hidden="true"></span></button>
  </div>
</div>
`;
  M['components/banner'] = { width: 960, height: 250, group: 'Feedback' };

  T['components/empty-state'] = `
<div class="hd-stage" style="gap:var(--space-5)">
  <div class="caption hd-faint">Needs you, nothing waiting</div>
  <div class="hd-empty" style="padding-top:var(--space-5);padding-bottom:var(--space-5)">
    <div class="hd-empty__icon"><span class="hd-i hd-i-hand" aria-hidden="true"></span></div>
    <div class="hd-empty__title">Nothing needs you</div>
    <div class="hd-empty__text">Approvals and questions from running tasks appear here.</div>
  </div>
  <div class="caption hd-faint">Workflows, none yet</div>
  <div class="hd-empty" style="padding-top:var(--space-5);padding-bottom:var(--space-5)">
    <div class="hd-empty__icon"><span class="hd-i hd-i-workflow" aria-hidden="true"></span></div>
    <div class="hd-empty__title">No workflows yet</div>
    <div class="hd-empty__text">A workflow chains agents into steps you can run again.</div>
    <div class="hd-row" style="justify-content:center;margin-top:var(--space-2)">
      <button class="hd-btn hd-btn--primary" style="color:var(--on-accent)"><span class="hd-i hd-i-plus" aria-hidden="true"></span>New workflow</button>
      <button class="hd-btn hd-btn--secondary">Import workflow</button>
    </div>
  </div>
</div>
`;
  M['components/empty-state'] = { width: 960, height: 490, group: 'Feedback' };

  T['components/skeleton'] = `
<div class="hd-stage" style="gap:var(--space-5)">
  <div class="hd-col" style="gap:var(--space-2);width:264px">
    <div class="caption hd-faint">Sidebar rows (hd-skel--row)</div>
    <div class="hd-col" style="background:var(--bg-sidebar);padding:var(--space-2);border-radius:var(--radius-md);gap:var(--space-2)" aria-busy="true" aria-label="Loading">
      <div class="hd-skel hd-skel--row"></div>
      <div class="hd-skel hd-skel--row" style="width:85%"></div>
      <div class="hd-skel hd-skel--row" style="width:70%"></div>
      <div class="hd-skel hd-skel--row" style="width:90%"></div>
    </div>
  </div>
  <div class="hd-col" style="gap:var(--space-2);max-width:420px">
    <div class="caption hd-faint">Text lines (hd-skel--line)</div>
    <div class="hd-col" style="gap:var(--space-2)" aria-busy="true" aria-label="Loading">
      <div class="hd-skel hd-skel--line" style="width:40%"></div>
      <div class="hd-skel hd-skel--line"></div>
      <div class="hd-skel hd-skel--line"></div>
      <div class="hd-skel hd-skel--line" style="width:65%"></div>
    </div>
  </div>
</div>
`;
  M['components/skeleton'] = { width: 960, height: 360, group: 'Feedback' };

  T['components/icons'] = `
<div class="hd-stage">
<div class="caption hd-faint">16px (default) and 20px (hd-i--lg). Icons take currentColor.</div>
<div style="display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:var(--space-4) var(--space-2)">
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-plus" aria-hidden="true"></span></div><div class="caption hd-faint">plus</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-hand" aria-hidden="true"></span></div><div class="caption hd-faint">hand</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-workflow" aria-hidden="true"></span></div><div class="caption hd-faint">workflow</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-gauge" aria-hidden="true"></span></div><div class="caption hd-faint">gauge</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-chart" aria-hidden="true"></span></div><div class="caption hd-faint">chart</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-sidebar" aria-hidden="true"></span></div><div class="caption hd-faint">sidebar</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-search" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-search" aria-hidden="true"></span></div><div class="caption hd-faint">search</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-settings" aria-hidden="true"></span></div><div class="caption hd-faint">settings</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-chevron-down" aria-hidden="true"></span></div><div class="caption hd-faint">chevron-down</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-chevron-right" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-chevron-right" aria-hidden="true"></span></div><div class="caption hd-faint">chevron-right</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-arrow-up" aria-hidden="true"></span></div><div class="caption hd-faint">arrow-up</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-folder" aria-hidden="true"></span></div><div class="caption hd-faint">folder</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-harness" aria-hidden="true"></span></div><div class="caption hd-faint">harness</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-shield" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-shield" aria-hidden="true"></span></div><div class="caption hd-faint">shield</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-check" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-check" aria-hidden="true"></span></div><div class="caption hd-faint">check</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-x" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-x" aria-hidden="true"></span></div><div class="caption hd-faint">x</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-alert" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-alert" aria-hidden="true"></span></div><div class="caption hd-faint">alert</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-play" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-play" aria-hidden="true"></span></div><div class="caption hd-faint">play</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-stop" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-stop" aria-hidden="true"></span></div><div class="caption hd-faint">stop</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-pencil" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-pencil" aria-hidden="true"></span></div><div class="caption hd-faint">pencil</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-more" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-more" aria-hidden="true"></span></div><div class="caption hd-faint">more</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-terminal" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-terminal" aria-hidden="true"></span></div><div class="caption hd-faint">terminal</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-file" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-file" aria-hidden="true"></span></div><div class="caption hd-faint">file</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-diff" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-diff" aria-hidden="true"></span></div><div class="caption hd-faint">diff</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-clock" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-clock" aria-hidden="true"></span></div><div class="caption hd-faint">clock</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-task" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-task" aria-hidden="true"></span></div><div class="caption hd-faint">task</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-refresh" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-refresh" aria-hidden="true"></span></div><div class="caption hd-faint">refresh</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-panel-right" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-panel-right" aria-hidden="true"></span></div><div class="caption hd-faint">panel-right</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-copy" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-copy" aria-hidden="true"></span></div><div class="caption hd-faint">copy</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-external" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-external" aria-hidden="true"></span></div><div class="caption hd-faint">external</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-branch" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-branch" aria-hidden="true"></span></div><div class="caption hd-faint">branch</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-zap" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-zap" aria-hidden="true"></span></div><div class="caption hd-faint">zap</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-spinner" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-spinner" aria-hidden="true"></span></div><div class="caption hd-faint">spinner</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-undo" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-undo" aria-hidden="true"></span></div><div class="caption hd-faint">undo</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-filter" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-filter" aria-hidden="true"></span></div><div class="caption hd-faint">filter</div></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1)"><div class="hd-row" style="gap:var(--space-3);flex-wrap:nowrap"><span class="hd-i hd-i-eye" aria-hidden="true"></span><span class="hd-i hd-i--lg hd-i-eye" aria-hidden="true"></span></div><div class="caption hd-faint">eye</div></div>
</div>
</div>
`;
  M['components/icons'] = { width: 960, height: 350, group: 'Foundations' };

  T['components/composer'] = `
<div class="hd-stage" style="gap:var(--space-3);padding:var(--space-4) var(--space-5)">
  <div class="hd-col" style="gap:var(--space-1)">
    <div class="caption hd-faint">New task, empty (send disabled)</div>
    <form class="hd-composer" aria-label="New task">
      <label class="hd-sr" for="cp1">Task prompt</label>
      <textarea id="cp1" class="hd-composer__input" rows="2" placeholder="Describe the task. Use @ to mention files."></textarea>
      <div class="hd-composer__bar">
        <button type="button" class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <button type="button" class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Claude · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <button type="button" class="hd-pill"><span class="hd-i hd-i-shield" aria-hidden="true"></span><span class="hd-pill__label">Can edit this repo</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <span class="hd-composer__spacer"></span>
        <button type="submit" class="hd-composer__send" aria-label="Start task" disabled><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button>
      </div>
    </form>
  </div>
  <div class="hd-col" style="gap:var(--space-1)">
    <div class="caption hd-faint">New task, filled (send enabled)</div>
    <form class="hd-composer" aria-label="New task">
      <label class="hd-sr" for="cp2">Task prompt</label>
      <textarea id="cp2" class="hd-composer__input" rows="2">Fix the flaky slot release test in tests/test_slots.py. It fails about one run in ten.</textarea>
      <div class="hd-composer__bar">
        <button type="button" class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <button type="button" class="hd-pill"><span class="hd-i hd-i-harness" aria-hidden="true"></span><span class="hd-pill__label">Claude · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <button type="button" class="hd-pill"><span class="hd-i hd-i-shield" aria-hidden="true"></span><span class="hd-pill__label">Can edit this repo</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <span class="hd-composer__spacer"></span>
        <button type="submit" class="hd-composer__send" aria-label="Start task" style="color:var(--on-accent)"><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button>
      </div>
    </form>
  </div>
  <div class="hd-col" style="gap:var(--space-1)">
    <div class="caption hd-faint">Follow-up while the agent works (Stop replaces send)</div>
    <form class="hd-composer" aria-label="Follow-up">
      <label class="hd-sr" for="cp3">Follow-up message</label>
      <textarea id="cp3" class="hd-composer__input" rows="1" placeholder="Reply to the agent"></textarea>
      <div class="hd-composer__bar">
        <span class="hd-composer__context"><span class="caption hd-faint">HarflowMCP · Claude · Opus 5.5 · Can edit this repo</span></span>
        <span class="hd-composer__spacer"></span>
        <button type="button" class="hd-btn hd-btn--secondary hd-btn--sm"><span class="hd-i hd-i-stop" aria-hidden="true"></span>Stop</button>
      </div>
    </form>
  </div>
  <div class="hd-col" style="gap:var(--space-1)">
    <div class="caption hd-faint">Workflow run: accent workflow pill and input fields</div>
    <form class="hd-composer" aria-label="Run workflow">
      <div class="hd-composer__context">
        <span class="hd-pill hd-pill--accent"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-pill__label">Release checklist</span><button type="button" class="hd-btn hd-btn--icon hd-btn--sm hd-pill__x" style="width:18px;height:18px;border-radius:var(--radius-full);color:inherit" aria-label="Remove workflow"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></button></span>
      </div>
      <div class="hd-composer__fields">
        <div class="hd-field"><label class="hd-field__label" for="cf1">Version</label><input id="cf1" class="hd-input" value="0.4.2"></div>
        <div class="hd-field"><label class="hd-field__label" for="cf2">Branch</label><input id="cf2" class="hd-input" value="main"></div>
      </div>
      <label class="hd-sr" for="cp4">Notes</label>
      <textarea id="cp4" class="hd-composer__input" rows="1" placeholder="Add notes for the run (optional)"></textarea>
      <div class="hd-composer__bar">
        <button type="button" class="hd-pill"><span class="hd-i hd-i-folder" aria-hidden="true"></span><span class="hd-pill__label">HarflowMCP</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button>
        <span class="hd-composer__spacer"></span>
        <button type="submit" class="hd-composer__send" aria-label="Run workflow" style="color:var(--on-accent)"><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span></button>
      </div>
    </form>
  </div>
</div>
`;
  M['components/composer'] = { width: 960, height: 700, group: 'Inputs' };

  T['components/form-controls'] = `
<div class="hd-stage">
  <div class="hd-row" style="align-items:flex-start;gap:var(--space-6)">
    <div class="hd-col">
      <div class="caption hd-faint">Switch: on, off, disabled</div>
      <div class="hd-row">
        <button type="button" class="hd-switch" role="switch" aria-checked="true" aria-label="Override orchestrator harness"></button>
        <button type="button" class="hd-switch" role="switch" aria-checked="false" aria-label="Notify when a task needs you"></button>
        <button type="button" class="hd-switch" role="switch" aria-checked="false" aria-label="Allow network access" disabled style="opacity:.45;cursor:default"></button>
      </div>
    </div>
    <div class="hd-col">
      <div class="caption hd-faint">Stepper</div>
      <div class="hd-stepper" role="group" aria-label="Turn limit">
        <button type="button" class="hd-stepper__btn" aria-label="Decrease turn limit"><span class="hd-i hd-i-minus" aria-hidden="true"></span></button>
        <span class="hd-stepper__value">40</span>
        <button type="button" class="hd-stepper__btn" aria-label="Increase turn limit"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button>
      </div>
    </div>
  </div>
  <div class="hd-col" style="width:420px;gap:var(--space-1)">
    <div class="caption hd-faint">Form rows: label, hint, control</div>
    <div class="hd-form-row">
      <span class="hd-form-row__label">Override orchestrator harness<span class="hd-form-row__hint">Saved fallback harnesses remain in effect.</span></span>
      <button type="button" class="hd-switch" role="switch" aria-checked="true" aria-label="Override orchestrator harness"></button>
    </div>
    <div class="hd-form-row">
      <label class="hd-form-row__label" for="fc-turns">Turn limit<span class="hd-form-row__hint">Stops the agent after this many turns.</span></label>
      <div class="hd-stepper" role="group" aria-label="Turn limit">
        <button type="button" class="hd-stepper__btn" aria-label="Decrease turn limit"><span class="hd-i hd-i-minus" aria-hidden="true"></span></button>
        <span class="hd-stepper__value" id="fc-turns">40</span>
        <button type="button" class="hd-stepper__btn" aria-label="Increase turn limit"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button>
      </div>
    </div>
    <div class="hd-form-row">
      <label class="hd-form-row__label" for="fc-model">Model</label>
      <input id="fc-model" class="hd-input" value="Opus 5.5">
    </div>
  </div>
</div>
`;
  M['components/form-controls'] = { width: 960, height: 460, group: 'Inputs' };

  T['components/text-field'] = `
<div class="hd-stage" style="max-width:480px">
  <div class="hd-field"><div class="caption hd-faint">Label and input</div><label class="hd-field__label" for="tf1">Repository folder</label><input id="tf1" class="hd-input" value="~/Code/Harflow/HarflowMCP"></div>
  <div class="hd-field"><div class="caption hd-faint">Placeholder</div><label class="hd-field__label" for="tf2">Branch</label><input id="tf2" class="hd-input" placeholder="main"></div>
  <div class="hd-field"><div class="caption hd-faint">Hint</div><label class="hd-field__label" for="tf3">Slot limit</label><input id="tf3" class="hd-input" value="3" aria-describedby="tf3h"><span id="tf3h" class="hd-field__hint">Tasks above the limit wait for a free slot.</span></div>
  <div class="hd-field"><div class="caption hd-faint">Error</div><label class="hd-field__label" for="tf4">Cron schedule</label><input id="tf4" class="hd-input is-invalid" value="every night" aria-invalid="true" aria-describedby="tf4e"><span id="tf4e" class="hd-field__error"><span class="hd-i hd-i--sm hd-i-alert" aria-hidden="true"></span>Schedule is not valid. Use five fields, for example 0 2 * * *.</span></div>
  <div class="hd-field"><div class="caption hd-faint">Textarea</div><label class="hd-field__label" for="tf5">Description</label><textarea id="tf5" class="hd-input" rows="2">Checks Python and npm dependencies for known advisories.</textarea></div>
  <div class="hd-row" style="align-items:flex-end;flex-wrap:nowrap;gap:var(--space-3)">
    <div class="hd-field" style="flex:1"><div class="caption hd-faint">Search</div><div class="hd-search"><span class="hd-i hd-i-search" aria-hidden="true"></span><label class="hd-sr" for="tf6">Search workflows</label><input id="tf6" class="hd-input" placeholder="Search workflows"></div></div>
    <div class="hd-field" style="flex:1"><div class="caption hd-faint">Select-looking button</div><button type="button" class="hd-input hd-select" aria-haspopup="listbox"><span>Claude · Opus 5.5</span><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span></button></div>
  </div>
</div>
`;
  M['components/text-field'] = { width: 960, height: 630, group: 'Inputs' };

  T['components/sidebar'] = `
<div class="hd-stage" style="flex-direction:row;align-items:flex-start;gap:var(--space-5);padding:var(--space-3) var(--space-5)">
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Expanded, 264px</div>
    <div style="height:640px;display:flex;border-radius:var(--radius-md);overflow:hidden">
    <aside class="hd-sidebar" aria-label="Sidebar">
      <div class="hd-sidebar__top">
        <span class="hd-brand"><span class="hd-brand__mark" aria-hidden="true"></span>Harflow</span>
        <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Collapse sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button>
      </div>
      <nav class="hd-nav" aria-label="Main">
        <a class="hd-nav-item is-active" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
        <a class="hd-nav-item" href="#needs-you"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
        <a class="hd-nav-item" href="#workflows"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
        <a class="hd-nav-item" href="#resources"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
        <a class="hd-nav-item" href="#statistics"><span class="hd-i hd-i-chart" aria-hidden="true"></span><span class="hd-nav-item__label">Statistics</span></a>
      </nav>
      <section class="hd-section" aria-label="Running">
        <div class="hd-section__head">Running <span class="hd-section__count">2</span></div>
        <div class="hd-section__list">
          <a class="hd-task-row" href="#t1"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
          <a class="hd-task-row" href="#t2"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Nightly dependency audit</span><span class="hd-task-row__meta">2/4</span></a>
        </div>
      </section>
      <section class="hd-section hd-section--fill" aria-label="Recent work">
        <div class="hd-section__head">Recent work</div>
        <div class="hd-section__list">
          <a class="hd-task-row hd-task-row--done" href="#t3"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12m</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t4"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t5"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Review: Electron preload bridge</span><span class="hd-task-row__meta">2h</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t6"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Release checklist v0.4.2</span><span class="hd-task-row__meta">3h</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t7"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Rename legacy env variables</span><span class="hd-task-row__meta">5h</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t8"><span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span><span class="hd-task-row__title">Profile sidebar re-renders</span><span class="hd-task-row__meta">1d</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t9"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Write contract fixtures for v1 tasks</span><span class="hd-task-row__meta">1d</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t10"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Weekly backlog triage</span><span class="hd-task-row__meta">2d</span></a>
          <a class="hd-task-row hd-task-row--done" href="#t11"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Tidy CHANGELOG for 0.4.1</span><span class="hd-task-row__meta">3d</span></a>
          <div class="hd-sidebar__more"><span class="hd-glyph hd-glyph--running" aria-hidden="true" style="width:12px;height:12px"></span>Loading older work</div>
        </div>
      </section>
      <div class="hd-sidebar__foot">
        <a class="hd-nav-item" href="#settings" style="flex:1"><span class="hd-i hd-i-settings" aria-hidden="true"></span><span class="hd-nav-item__label">Settings</span></a>
        <div class="hd-theme" role="group" aria-label="Appearance"><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="System" title="System, follows this computer"><span class="hd-i hd-i--sm hd-i-monitor" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="true" aria-label="Light" title="Light"><span class="hd-i hd-i--sm hd-i-sun" aria-hidden="true"></span></button><button type="button" class="hd-theme__item" aria-pressed="false" aria-label="Dark" title="Dark"><span class="hd-i hd-i--sm hd-i-moon" aria-hidden="true"></span></button></div>
      </div>
    </aside>
    </div>
  </div>
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Collapsed rail, 56px</div>
    <div style="height:640px;display:flex;border-radius:var(--radius-md);overflow:hidden">
    <aside class="hd-rail" aria-label="Sidebar">
      <div class="hd-rail__top"><button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Expand sidebar"><span class="hd-i hd-i-sidebar" aria-hidden="true"></span></button></div>
      <button class="hd-rail-item is-active" aria-label="New task, 2 running"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-rail-item__badge">2</span></button>
      <button class="hd-rail-item" aria-label="Needs you, 2 waiting"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span></button>
      <button class="hd-rail-item" aria-label="Workflows"><span class="hd-i hd-i-workflow" aria-hidden="true"></span></button>
      <button class="hd-rail-item" aria-label="Resources"><span class="hd-i hd-i-gauge" aria-hidden="true"></span></button>
      <button class="hd-rail-item" aria-label="Statistics"><span class="hd-i hd-i-chart" aria-hidden="true"></span></button>
      <span class="hd-rail__spacer"></span>
      <button class="hd-rail-item" aria-label="Appearance: Light. Switch to Dark" title="Appearance: Light"><span class="hd-i hd-i-sun" aria-hidden="true"></span></button>
      <button class="hd-rail-item" aria-label="Settings"><span class="hd-i hd-i-settings" aria-hidden="true"></span></button>
    </aside>
    </div>
  </div>
</div>
`;
  M['components/sidebar'] = { width: 960, height: 700, group: 'Navigation' };

  T['components/sidebar-nav-item'] = `
<div class="hd-stage">
  <div style="display:flex;gap:var(--space-5);flex-wrap:wrap">
    <div class="hd-col" style="width:232px;background:var(--bg-sidebar);padding:var(--space-2);border-radius:var(--radius-md)">
      <div class="caption hd-faint" style="padding:0 var(--space-2)">Default</div>
      <a class="hd-nav-item" href="#workflows"><span class="hd-i hd-i-workflow" aria-hidden="true"></span><span class="hd-nav-item__label">Workflows</span></a>
      <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) 0">Active (is-active)</div>
      <a class="hd-nav-item is-active" href="#resources"><span class="hd-i hd-i-gauge" aria-hidden="true"></span><span class="hd-nav-item__label">Resources</span></a>
      <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) 0">With shortcut</div>
      <a class="hd-nav-item" href="#new"><span class="hd-i hd-i-plus" aria-hidden="true"></span><span class="hd-nav-item__label">New task</span><span class="hd-kbd">⌘N</span></a>
    </div>
    <div class="hd-col" style="width:232px;background:var(--bg-sidebar);padding:var(--space-2);border-radius:var(--radius-md)">
      <div class="caption hd-faint" style="padding:0 var(--space-2)">Needs you, dot and count</div>
      <a class="hd-nav-item" href="#needs-you"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
      <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) 0">Needs you, nothing waiting</div>
      <a class="hd-nav-item" href="#needs-you-empty"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span></a>
      <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) 0">Active with dot</div>
      <a class="hd-nav-item is-active" href="#needs-you-active"><span class="hd-i hd-i-hand" aria-hidden="true"></span><span class="hd-dot" aria-hidden="true"></span><span class="hd-nav-item__label">Needs you</span><span class="hd-nav-item__count">2</span></a>
    </div>
  </div>
</div>
`;
  M['components/sidebar-nav-item'] = { width: 960, height: 270, group: 'Navigation' };

  T['components/sidebar-task-row'] = `
<div class="hd-stage">
  <div class="hd-col" style="width:264px;background:var(--bg-sidebar);padding:var(--space-2);border-radius:var(--radius-md);gap:1px">
    <div class="caption hd-faint" style="padding:0 var(--space-2) var(--space-1)">Running, needs you, queued</div>
    <a class="hd-task-row" href="#t1"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
    <a class="hd-task-row" href="#t2"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-task-row__title">Add retry budget to delivery queue</span><span class="hd-task-row__meta">12:40</span></a>
    <a class="hd-task-row" href="#t3"><span class="hd-glyph hd-glyph--queued" aria-label="Pending"></span><span class="hd-task-row__title">Rename legacy env variables</span><span class="hd-task-row__meta">now</span></a>
    <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) var(--space-1)">Finished (hd-task-row--done)</div>
    <a class="hd-task-row hd-task-row--done" href="#t4"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check" aria-hidden="true"></span></span><span class="hd-task-row__title">Tidy CHANGELOG for 0.4.1</span><span class="hd-task-row__meta">12m</span></a>
    <a class="hd-task-row hd-task-row--done" href="#t5"><span class="hd-glyph hd-glyph--failed" aria-label="Failed"><span class="hd-i hd-i--sm hd-i-x" aria-hidden="true"></span></span><span class="hd-task-row__title">Migrate events.jsonl reader</span><span class="hd-task-row__meta">1h</span></a>
    <a class="hd-task-row hd-task-row--done" href="#t6"><span class="hd-glyph hd-glyph--cancelled" aria-label="Cancelled"><span class="hd-i hd-i--sm hd-i-stop" aria-hidden="true"></span></span><span class="hd-task-row__title">Profile sidebar re-renders</span><span class="hd-task-row__meta">1d</span></a>
    <a class="hd-task-row hd-task-row--done" href="#t7"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-workflow" aria-hidden="true"></span></span><span class="hd-task-row__title">Weekly backlog triage</span><span class="hd-task-row__meta">2d</span></a>
    <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) var(--space-1)">Parallel group (one row, never expands)</div>
    <a class="hd-task-row" href="#"><span class="hd-glyph hd-glyph--active" aria-label="Parallel group, running"><span class="hd-i hd-i--sm hd-i-parallel" aria-hidden="true"></span></span><span class="hd-task-row__title">Review preload bridge</span><span class="hd-task-row__meta">1/3</span></a>
    <a class="hd-task-row hd-task-row--done" href="#"><span class="hd-glyph hd-glyph--done" aria-label="Parallel group, done"><span class="hd-i hd-i--sm hd-i-parallel" aria-hidden="true"></span></span><span class="hd-task-row__title">Compare migration plans</span><span class="hd-task-row__meta">2h</span></a>
    <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) var(--space-1)">Active row (is-active)</div>
    <a class="hd-task-row is-active" href="#t8"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Fix flaky slot release test</span><span class="hd-task-row__meta">04:12</span></a>
    <div class="caption hd-faint" style="padding:var(--space-2) var(--space-2) var(--space-1)">Long title truncates</div>
    <a class="hd-task-row" href="#t9"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-task-row__title">Migrate the events.jsonl reader to the new contract fixtures and update the vendored copies</span><span class="hd-task-row__meta">1:02:09</span></a>
  </div>
</div>
`;
  M['components/sidebar-task-row'] = { width: 960, height: 600, group: 'Navigation' };

  T['components/tabs'] = `
<div class="hd-stage">
  <div class="hd-col">
    <div class="caption hd-faint">hd-tabs with counts: right pane of a task</div>
    <div class="hd-tabs" role="tablist" aria-label="Task pane">
      <button class="hd-tab is-active" role="tab" aria-selected="true">Changes <span class="hd-tab__count">4</span></button>
      <button class="hd-tab" role="tab" aria-selected="false">Artifacts <span class="hd-tab__count">1</span></button>
      <button class="hd-tab" role="tab" aria-selected="false">Events</button>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">hd-seg segmented control: statistics range</div>
    <div class="hd-seg" style="align-self:flex-start" role="group" aria-label="Range">
      <button class="hd-seg__item" aria-pressed="false">24h</button>
      <button class="hd-seg__item is-active" aria-pressed="true">7d</button>
      <button class="hd-seg__item" aria-pressed="false">30d</button>
    </div>
  </div>
</div>
`;
  M['components/tabs'] = { width: 960, height: 180, group: 'Navigation' };

  T['components/dialog'] = `
<div class="hd-stage">
  <div class="caption hd-faint">Confirm dialog on scrim</div>
  <div style="position:relative;width:520px;height:300px;background:var(--bg);border-radius:var(--radius-md);overflow:hidden">
    <div class="hd-scrim">
      <div class="hd-dialog" role="alertdialog" aria-labelledby="dlg-t" aria-describedby="dlg-d">
        <h2 class="hd-dialog__title" id="dlg-t">Cancel this task?</h2>
        <p class="hd-dialog__text" id="dlg-d">The agent stops after its current step. Changes already made stay in the working tree.</p>
        <div class="hd-dialog__actions"><button class="hd-btn hd-btn--secondary">Keep running</button><button class="hd-btn hd-btn--danger" style="color:var(--danger)">Cancel task</button></div>
      </div>
    </div>
  </div>
</div>
`;
  M['components/dialog'] = { width: 960, height: 380, group: 'Overlays' };

  T['components/status-badge'] = `
<div class="hd-stage">
  <div class="hd-col">
    <div class="caption hd-faint">Badges: glyph plus word</div>
    <div class="hd-row" style="gap:var(--space-3)">
      <span class="hd-badge hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Running</span>
      <span class="hd-badge hd-badge--attention"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you</span>
      <span class="hd-badge hd-badge--done"><span class="hd-i hd-i-check" aria-hidden="true"></span>Done</span>
      <span class="hd-badge hd-badge--failed"><span class="hd-i hd-i-x" aria-hidden="true"></span>Failed</span>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Warning and neutral</div>
    <div class="hd-row" style="gap:var(--space-3)">
      <span class="hd-badge hd-badge--warning"><span class="hd-i hd-i-clock" aria-hidden="true"></span>Timed out</span>
      <span class="hd-badge"><span class="hd-i hd-i-stop" aria-hidden="true"></span>Cancelled</span>
      <span class="hd-badge"><span class="hd-i hd-i-clock" aria-hidden="true"></span>Pending</span>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Plain badge (hd-badge--plain), used inline in the task header</div>
    <div class="hd-row" style="gap:var(--space-4)">
      <span class="hd-badge hd-badge--plain hd-badge--running"><span class="hd-badge__spin" aria-hidden="true"></span>Running</span>
      <span class="hd-badge hd-badge--plain hd-badge--done"><span class="hd-i hd-i-check" aria-hidden="true"></span>Done</span>
      <span class="hd-badge hd-badge--plain hd-badge--failed"><span class="hd-i hd-i-x" aria-hidden="true"></span>Failed</span>
    </div>
  </div>
  <div class="hd-col">
    <div class="caption hd-faint">Bare status glyphs (hd-glyph): running, needs you, done, failed, cancelled, pending</div>
    <div class="hd-row" style="gap:var(--space-5)">
      <span class="hd-row" style="gap:6px"><span class="hd-glyph hd-glyph--running is-animated" aria-hidden="true"></span><span class="caption">Running</span></span>
      <span class="hd-row" style="gap:6px"><span class="hd-glyph hd-glyph--attention" aria-hidden="true"><span class="hd-i hd-i--sm hd-i-hand"></span></span><span class="caption">Needs you</span></span>
      <span class="hd-row" style="gap:6px"><span class="hd-glyph hd-glyph--done" aria-hidden="true"><span class="hd-i hd-i--sm hd-i-check"></span></span><span class="caption">Done</span></span>
      <span class="hd-row" style="gap:6px"><span class="hd-glyph hd-glyph--failed" aria-hidden="true"><span class="hd-i hd-i--sm hd-i-x"></span></span><span class="caption">Failed</span></span>
      <span class="hd-row" style="gap:6px"><span class="hd-glyph hd-glyph--cancelled" aria-hidden="true"><span class="hd-i hd-i--sm hd-i-stop"></span></span><span class="caption">Cancelled</span></span>
      <span class="hd-row" style="gap:6px"><span class="hd-glyph hd-glyph--queued" aria-hidden="true"></span><span class="caption">Pending</span></span>
    </div>
  </div>
</div>
`;
  M['components/status-badge'] = { width: 960, height: 270, group: 'Status' };

  T['components/approval-card'] = `
<div class="hd-stage"><div class="hd-grid hd-grid--2" style="gap:var(--space-4)">
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Pending command approval</div>
    <section class="hd-approval" aria-label="Approval needed">
      <div class="hd-approval__head"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you<span class="hd-approval__src">Claude · Opus 5.5</span></div>
      <div class="hd-approval__body">
        <div>Run a command in HarflowMCP</div>
        <div class="hd-approval__cmd">rm -rf .pytest_cache &amp;&amp; pytest tests/test_slots.py -q</div>
      </div>
      <div class="hd-approval__actions"><button class="hd-btn hd-btn--primary hd-btn--sm" style="color:var(--on-accent)">Approve</button><button class="hd-btn hd-btn--secondary hd-btn--sm">Reject</button></div>
    </section>
  </div>
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Publish approval</div>
    <section class="hd-approval" aria-label="Approval needed">
      <div class="hd-approval__head"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you<span class="hd-approval__src">Claude · Opus 5.5</span></div>
      <div class="hd-approval__body">
        <div>Push 2 commits to origin/main</div>
        <div class="hd-approval__cmd">git push origin main</div>
        <div class="hd-approval__meta">Needs the Can publish access level.</div>
      </div>
      <div class="hd-approval__actions"><button class="hd-btn hd-btn--primary hd-btn--sm" style="color:var(--on-accent)">Approve</button><button class="hd-btn hd-btn--secondary hd-btn--sm">Reject</button></div>
    </section>
  </div>
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Question with reply</div>
    <section class="hd-approval" aria-label="Question">
      <div class="hd-approval__head"><span class="hd-i hd-i-hand" aria-hidden="true"></span>Needs you<span class="hd-approval__src">Claude · Opus 5.5</span></div>
      <div class="hd-approval__body">
        <div>Should the retry budget be per queue or per delivery?</div>
        <label class="hd-sr" for="aq1">Your reply</label>
        <input id="aq1" class="hd-input" placeholder="Reply to the agent">
      </div>
      <div class="hd-approval__actions"><button class="hd-btn hd-btn--primary hd-btn--sm" style="color:var(--on-accent)">Send reply</button></div>
    </section>
  </div>
  <div class="hd-col" style="gap:var(--space-2)">
    <div class="caption hd-faint">Settled (hd-approval--settled)</div>
    <section class="hd-approval hd-approval--settled" aria-label="Approval settled">
      <div class="hd-approval__head"><span class="hd-i hd-i-check" aria-hidden="true"></span>Approved by you 2m ago</div>
      <div class="hd-approval__body"><div class="hd-approval__cmd">pytest tests/test_slots.py -q</div></div>
    </section>
  </div>
</div>
</div>
`;
  M['components/approval-card'] = { width: 960, height: 470, group: 'Transcript' };

  T['components/tool-call-row'] = `
<div class="hd-stage" style="max-width:640px">
  <div class="caption hd-faint">Collapsed rows</div>
  <div class="hd-col" style="gap:2px">
    <div class="hd-tool"><button class="hd-tool__head" aria-expanded="false"><span class="hd-i hd-i-chevron-right" aria-hidden="true"></span><span class="hd-i hd-i-file" aria-hidden="true"></span><span class="hd-tool__summary">Read 3 files</span><span class="hd-tool__meta">0:02</span></button></div>
    <div class="hd-tool"><button class="hd-tool__head" aria-expanded="false"><span class="hd-i hd-i-chevron-right" aria-hidden="true"></span><span class="hd-i hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran <code>pytest tests/test_slots.py -q</code></span><span class="hd-tool__meta">0:14</span></button></div>
    <div class="hd-tool"><button class="hd-tool__head" aria-expanded="false"><span class="hd-i hd-i-chevron-right" aria-hidden="true"></span><span class="hd-i hd-i-pencil" aria-hidden="true"></span><span class="hd-tool__summary">Edited <code>tests/test_slots.py</code> <span class="hd-file__add">+12</span> <span class="hd-file__del">−4</span></span><span class="hd-tool__meta">0:01</span></button></div>
  </div>
  <div class="caption hd-faint">Expanded</div>
  <div class="hd-tool">
    <button class="hd-tool__head" aria-expanded="true"><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span><span class="hd-i hd-i-terminal" aria-hidden="true"></span><span class="hd-tool__summary">Ran <code>pytest tests/test_slots.py -q</code></span><span class="hd-tool__meta">0:14</span></button>
    <div class="hd-tool__body"><b>$ pytest tests/test_slots.py -q</b>
..........F.....
FAILED tests/test_slots.py::test_release_frees_slot
1 failed, 15 passed in 12.41s</div>
  </div>
</div>
`;
  M['components/tool-call-row'] = { width: 960, height: 350, group: 'Transcript' };

  T['components/transcript-message'] = `
<div class="hd-stage">
  <div class="hd-transcript" style="padding:0;max-width:640px;margin:0">
    <div class="caption hd-faint">User bubble</div>
    <div class="hd-msg-user">Fix the flaky slot release test. It fails about one run in ten.</div>
    <div class="caption hd-faint">Agent prose with inline code and list</div>
    <div class="hd-msg-agent">
      <p>The test releases a slot and immediately asserts on <code>slot_status()</code>, but release is asynchronous. I found two causes:</p>
      <ul>
        <li>The release callback runs after the assertion on slow runs.</li>
        <li><code>tests/test_slots.py</code> shares one fixture between cases.</li>
      </ul>
      <p>I'll wait on the release event instead of sleeping.</p>
    </div>
    <div class="caption hd-faint">Turn separator</div>
    <div class="hd-turn-sep">Turn 2</div>
    <div class="caption hd-faint">Working indicator</div>
    <div class="hd-working"><span class="hd-glyph hd-glyph--running is-animated" aria-hidden="true"></span>Working</div>
  </div>
</div>
`;
  M['components/transcript-message'] = { width: 960, height: 440, group: 'Transcript' };

  T['components/inspector'] = `
<div class="hd-stage" style="padding:0;flex-direction:row;justify-content:flex-end">
  <aside class="hd-inspector" aria-label="Node inspector" style="height:560px">
    <div class="hd-inspector__head">
      <span class="hd-glyph" aria-hidden="true"><span class="hd-i hd-i-harness"></span></span>
      <span class="hd-inspector__title">Triage findings</span>
      <button class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Close inspector"><span class="hd-i hd-i-x" aria-hidden="true"></span></button>
    </div>
    <div class="hd-inspector__body">
      <section class="hd-inspector__section" aria-label="Agent settings">
        <div class="hd-inspector__label">AGENT SETTINGS</div>
        <div class="hd-form-row"><label class="hd-form-row__label" for="in-h">Harness</label><input id="in-h" class="hd-input" value="Codex"></div>
        <div class="hd-form-row"><label class="hd-form-row__label" for="in-m">Model</label><input id="in-m" class="hd-input" value="GPT-6"></div>
        <div class="hd-form-row"><label class="hd-form-row__label" for="in-a">Access</label><input id="in-a" class="hd-input" value="Can edit this repo"></div>
        <div class="hd-form-row">
          <span class="hd-form-row__label">Caller approvals<span class="hd-form-row__hint">Ask before the agent runs commands.</span></span>
          <button type="button" class="hd-switch" role="switch" aria-checked="true" aria-label="Caller approvals"></button>
        </div>
      </section>
      <section class="hd-inspector__section" aria-label="Limits">
        <div class="hd-inspector__label">LIMITS</div>
        <div class="hd-form-row">
          <span class="hd-form-row__label">Turn limit</span>
          <div class="hd-stepper" role="group" aria-label="Turn limit"><button type="button" class="hd-stepper__btn" aria-label="Decrease turn limit"><span class="hd-i hd-i-minus" aria-hidden="true"></span></button><span class="hd-stepper__value">40</span><button type="button" class="hd-stepper__btn" aria-label="Increase turn limit"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button></div>
        </div>
        <div class="hd-form-row">
          <span class="hd-form-row__label">Retries</span>
          <div class="hd-stepper" role="group" aria-label="Retries"><button type="button" class="hd-stepper__btn" aria-label="Decrease retries"><span class="hd-i hd-i-minus" aria-hidden="true"></span></button><span class="hd-stepper__value">2</span><button type="button" class="hd-stepper__btn" aria-label="Increase retries"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button></div>
        </div>
      </section>
    </div>
  </aside>
</div>
`;
  M['components/inspector'] = { width: 960, height: 560, group: 'Workflow' };

  T['components/node-tray'] = `
<div class="hd-stage">
  <div class="hd-col">
    <div class="caption hd-faint">Add tray</div>
    <div class="hd-tray" role="toolbar" aria-label="Add node" style="align-self:flex-start">
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-task" aria-hidden="true"></span>Planning</span>
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-pencil" aria-hidden="true"></span>Implementation</span>
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-eye" aria-hidden="true"></span>Review</span>
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-harness" aria-hidden="true"></span>Task</span>
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-workflow" aria-hidden="true"></span>Run workflow</span>
      <span class="hd-tray__sep" aria-hidden="true"></span>
      <span class="hd-chip" aria-disabled="true" title="Start is already on the canvas"><span class="hd-i hd-i-play" aria-hidden="true"></span>Start</span>
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-parallel" aria-hidden="true"></span>Parallel group</span>
      <span class="hd-chip" draggable="true"><span class="hd-i hd-i-flag" aria-hidden="true"></span>End</span>
    </div>
  </div>
  <div class="hd-row" style="align-items:flex-start;gap:var(--space-6)">
    <div class="hd-col">
      <div class="caption hd-faint">Zoom</div>
      <div class="hd-zoom" role="group" aria-label="Zoom"><button class="hd-btn hd-btn--icon" aria-label="Zoom out"><span class="hd-i hd-i-minus" aria-hidden="true"></span></button><span>100%</span><button class="hd-btn hd-btn--icon" aria-label="Zoom in"><span class="hd-i hd-i-plus" aria-hidden="true"></span></button></div>
    </div>
  </div>
  <div class="hd-col" style="gap:var(--space-1)">
    <div class="caption hd-faint">Standalone strip</div>
    <div class="hd-standalone" style="border:1px solid var(--border);border-radius:var(--radius-md)"><span class="hd-standalone__label"><strong>Standalone</strong>Outside the workflow path</span><div class="hd-standalone__nodes"><button type="button" class="hd-node hd-node--ondemand" aria-label="Security reviewer, on demand node"><div class="hd-node__kind"><span class="hd-i hd-i--sm hd-i-zap" aria-hidden="true"></span>On demand</div><div class="hd-node__head"><span>Security reviewer</span></div><div class="hd-node__meta"><span class="hd-i hd-i--sm hd-i-harness" aria-hidden="true"></span>Codex</div></button><button type="button" class="hd-node hd-node--ondemand" aria-label="Docs checker, on demand node"><div class="hd-node__kind"><span class="hd-i hd-i--sm hd-i-zap" aria-hidden="true"></span>On demand</div><div class="hd-node__head"><span>Docs checker</span></div><div class="hd-node__meta"><span class="hd-i hd-i--sm hd-i-harness" aria-hidden="true"></span>Claude Code</div></button></div><button type="button" class="hd-btn hd-btn--icon hd-btn--sm" aria-label="Add on-demand node"><span class="hd-i hd-i--sm hd-i-plus" aria-hidden="true"></span></button></div>
  </div>
</div>
`;
  M['components/node-tray'] = { width: 960, height: 380, group: 'Workflow' };

  T['components/parallel-lanes'] = `
<div class="hd-stage" style="padding:0">
  <div class="hd-lanes" style="height:420px;flex:none">
    <section class="hd-lane" aria-label="Security review" style="min-width:0">
      <div class="hd-lane__head"><span class="hd-glyph hd-glyph--running" aria-label="Running"></span><span class="hd-lane__title">Security review</span><span class="caption hd-faint">Claude · Opus 5.5</span></div>
      <div class="hd-lane__body">
        <div class="hd-msg-user">Check the preload bridge for unsafe channel exposure.</div>
        <div class="body">The bridge exposes four channels. Two accept arbitrary paths; checking how the main process validates them.</div>
      </div>
      <div class="hd-lane__foot"><form class="hd-composer" aria-label="Message Security review"><label class="hd-sr" for="pl-a">Message</label><textarea id="pl-a" class="hd-composer__input" rows="1" placeholder="Reply to this agent"></textarea></form></div>
    </section>
    <section class="hd-lane" aria-label="API surface review" style="min-width:0">
      <div class="hd-lane__head"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand" aria-hidden="true"></span></span><span class="hd-lane__title">API surface review</span><span class="caption hd-faint">Codex · GPT-6</span></div>
      <div class="hd-lane__body">
        <div class="hd-msg-user">List every exported channel and its payload type.</div>
        <div class="body">Done listing. Waiting for approval to run the type check.</div>
      </div>
      <div class="hd-lane__foot"><form class="hd-composer" aria-label="Message API surface review"><label class="hd-sr" for="pl-b">Message</label><textarea id="pl-b" class="hd-composer__input" rows="1" placeholder="Reply to this agent"></textarea></form></div>
    </section>
  </div>
</div>
`;
  M['components/parallel-lanes'] = { width: 960, height: 420, group: 'Workflow' };

  T['components/workflow-node'] = `
<div class="hd-stage" style="padding:0;gap:0">
  <div class="hd-canvas" style="height:500px;flex:none">
    <svg class="hd-edge" style="left:236px;top:55px" width="58" height="2" aria-hidden="true"><defs><marker id="wn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path class="hd-edge__chevron" d="M2 1 L9 5 L2 9"/></marker></defs><path d="M0 1H58" marker-end="url(#wn-arrow)"/></svg>
    <div class="hd-node" style="left:10px;top:16px"><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__kind">Worker</div>
      <div class="hd-node__head"><span class="hd-glyph" aria-hidden="true"><span class="hd-i hd-i-harness"></span></span>Collect advisories</div>
      <div class="hd-node__meta">Default · Claude · Opus 5.5</div>
    </div>
    <div class="hd-node is-selected" style="left:300px;top:16px"><span class="hd-port hd-port--in" aria-hidden="true"></span><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__kind">Worker, selected</div>
      <div class="hd-node__head"><span class="hd-glyph" aria-hidden="true"><span class="hd-i hd-i-harness"></span></span>Triage findings</div>
      <div class="hd-node__meta">Codex · GPT-6</div>
    </div>
    <div class="hd-node hd-node--running" style="left:10px;top:180px"><span class="hd-port hd-port--in" aria-hidden="true"></span><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__kind">Worker, running</div>
      <div class="hd-node__head"><span class="hd-glyph hd-glyph--running is-animated" aria-label="Running"></span>Update lockfiles</div>
      <div class="hd-node__meta">Running 04:12</div>
    </div>
    <div class="hd-node hd-node--waiting" style="left:300px;top:180px"><span class="hd-port hd-port--in" aria-hidden="true"></span>
      <div class="hd-node__kind">Orchestrator, waiting</div>
      <div class="hd-node__head"><span class="hd-glyph hd-glyph--attention" aria-label="Needs you"><span class="hd-i hd-i--sm hd-i-hand"></span></span>Approve release<span class="hd-i hd-i--sm hd-i-lock" style="margin-left:auto;color:var(--text-tertiary)" role="img" aria-label="Orchestrator, locked"></span></div>
      <div class="hd-node__meta">Needs you</div>
    </div>
    <div class="hd-node hd-node--done" style="left:10px;top:344px"><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__kind">Worker, done</div>
      <div class="hd-node__head"><span class="hd-glyph" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check"></span></span>Run test suite</div>
      <div class="hd-node__meta">Done 06:31</div>
    </div>
    <svg class="hd-edge hd-edge--active" style="left:236px;top:384px" width="58" height="2" aria-hidden="true"><defs><marker id="wn-arrow-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path class="hd-edge__chevron" d="M2 1 L9 5 L2 9"/></marker></defs><path d="M0 1H58" marker-end="url(#wn-arrow-a)"/></svg>
    <div class="hd-node" style="left:300px;top:344px"><span class="hd-port hd-port--in" aria-hidden="true"></span>
      <div class="hd-node__kind">Worker</div>
      <div class="hd-node__head"><span class="hd-glyph" aria-hidden="true"><span class="hd-i hd-i-harness"></span></span>Publish report</div>
      <div class="hd-node__meta">Pending</div>
    </div>
    <div class="hd-node hd-node--terminal" style="left:620px;top:16px"><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__head"><span class="hd-i hd-i--sm hd-i-play" aria-hidden="true"></span>Start</div>
    </div>
    <div class="hd-node hd-node--boundary" style="left:620px;top:100px"><span class="hd-port hd-port--in" aria-hidden="true"></span><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__kind">Parallel group, start</div>
      <div class="hd-node__head"><span class="hd-i hd-i--sm hd-i-parallel" aria-hidden="true"></span>Parallel start</div>
      <div class="hd-node__meta">3 branches</div>
    </div>
    <div class="hd-node hd-node--boundary" style="left:620px;top:236px"><span class="hd-port hd-port--in" aria-hidden="true"></span><span class="hd-port hd-port--out" aria-hidden="true"></span>
      <div class="hd-node__kind">Parallel group, end</div>
      <div class="hd-node__head"><span class="hd-i hd-i--sm hd-i-parallel" aria-hidden="true"></span>Parallel end</div>
      <div class="hd-node__meta">Waits for all branches</div>
    </div>
    <div class="hd-node hd-node--terminal" style="left:620px;top:372px"><span class="hd-port hd-port--in" aria-hidden="true"></span>
      <div class="hd-node__head"><span class="hd-i hd-i--sm hd-i-flag" aria-hidden="true"></span>End</div>
    </div>
  </div>
  <div class="hd-col" style="padding:var(--space-4);gap:var(--space-3)">
    <div class="caption hd-faint">On-demand nodes. Editor, then run states: called, not called, running</div>
    <div class="hd-standalone" style="border:1px solid var(--border);border-radius:var(--radius-md)"><span class="hd-standalone__label"><strong>Standalone</strong>Outside the workflow path</span><div class="hd-standalone__nodes"><button type="button" class="hd-node hd-node--ondemand" aria-label="Security reviewer, on demand node"><div class="hd-node__kind"><span class="hd-i hd-i--sm hd-i-zap" aria-hidden="true"></span>On demand</div><div class="hd-node__head"><span>Security reviewer</span></div><div class="hd-node__meta"><span class="hd-i hd-i--sm hd-i-harness" aria-hidden="true"></span>Codex</div></button></div></div>
    <div class="hd-standalone" style="border:1px solid var(--border);border-radius:var(--radius-md)"><span class="hd-standalone__label"><strong>Standalone</strong>Outside the workflow path</span><div class="hd-standalone__nodes"><button type="button" class="hd-node hd-node--ondemand" aria-label="Security reviewer, on demand node, 2 calls"><div class="hd-node__kind"><span class="hd-i hd-i--sm hd-i-zap" aria-hidden="true"></span>On demand</div><div class="hd-node__head"><span>Security reviewer</span></div><div class="hd-node__meta"><span class="hd-glyph hd-glyph--done" aria-label="Done"><span class="hd-i hd-i--sm hd-i-check"></span></span>2 calls · one at a time</div></button><button type="button" class="hd-node hd-node--ondemand hd-node--idle" aria-label="Docs checker, on demand node, not called"><div class="hd-node__kind"><span class="hd-i hd-i--sm hd-i-zap" aria-hidden="true"></span>On demand</div><div class="hd-node__head"><span>Docs checker</span></div><div class="hd-node__meta">Not called</div></button><button type="button" class="hd-node hd-node--ondemand" aria-label="Security reviewer, on demand node, running call 3"><div class="hd-node__kind"><span class="hd-i hd-i--sm hd-i-zap" aria-hidden="true"></span>On demand</div><div class="hd-node__head"><span>Security reviewer</span></div><div class="hd-node__meta"><span class="hd-glyph hd-glyph--running is-animated" aria-label="Running"></span>Running · call 3</div></button></div></div>
  </div>
</div>
`;
  M['components/workflow-node'] = { width: 960, height: 760, group: 'Workflow' };
})();
