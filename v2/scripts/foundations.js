// Brand book and foundations pages of the Harflow Desktop design system, rendered at 960 wide.
// Generated from the design system tokens and README; swatches are painted with the tokens themselves.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  var T = (HFV2.templates = HFV2.templates || {});
  var M = (HFV2.componentMeta = HFV2.componentMeta || {});

  T['brand/principles'] = `
<div class="hdc-doc hdc-page">
<p>Harflow Desktop is the design system for the Harflow Electron app: a quiet, minimal client for dispatching coding tasks to agent harnesses and running multi-node workflows.</p>
<p>The system is components only: tokens, one stylesheet and plain HTML. Screens live in the separate Harflow Desktop Redesign canvas.</p>
<ul><li><strong>Minimal.</strong> Few borders, no card around everything, generous space. Content leads; chrome recedes.</li><li><strong>Quiet surfaces.</strong> Backgrounds step gently: sidebar, main, raised surface. Hover and selection are tints, not outlines.</li><li><strong>One accent.</strong> Blue marks the running state, links, focus and the primary action. Orange is only for Needs you. Green and red are only for Done and Failed.</li><li><strong>Mid-grey dark mode, never near-black.</strong> Dark <code>--bg</code> is <code>#2b2b2d</code>; the sidebar steps darker, raised surfaces lighter.</li><li><strong>Status = glyph + word.</strong> Colour never carries status alone. Every status has a distinct shape and a label.</li></ul>

</div>
`;
  M['brand/principles'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/brand-mark'] = `
<div class="hdc-doc hdc-page">
<p>The app icon is a violet squircle (gradient <code>--brand-start</code> to <code>--brand-end</code>) with the white blossom. It is brand only: it appears in the sidebar and on the cover, and is never used as a UI state colour. Markup: <code>&lt;span class="hd-brand__mark" aria-hidden="true"&gt;&lt;/span&gt;</code>; <code>hd-brand__mark--lg</code> for the large size.</p>
<p>In the menu bar (macOS) or system tray (Windows) the mark is the blossom alone as a monochrome template glyph, <code>&lt;span class="hd-mark-glyph" aria-hidden="true"&gt;&lt;/span&gt;</code>, taking the current text colour, the same as the native menubarTemplate image. Never the coloured squircle there.</p>
<div class="hdc-brand-grid"><section class="hdc-brand-panel" data-theme="light" aria-label="Light background"><h3>Light</h3><p class="hdc-brand-panel__label">App icon (image)</p><div class="hdc-brand-row"><figure class="hdc-brand-item"><img src="assets/branding/app-icon-128.png" width="96" height="96" alt="Harflow app icon, 96px"><figcaption>96px</figcaption></figure><figure class="hdc-brand-item"><img src="assets/branding/app-icon-128.png" width="64" height="64" alt="Harflow app icon, 64px"><figcaption>64px</figcaption></figure><figure class="hdc-brand-item"><img src="assets/branding/app-icon-128.png" width="32" height="32" alt="Harflow app icon, 32px"><figcaption>32px</figcaption></figure></div><p class="hdc-brand-panel__label">Brand mark (CSS)</p><div class="hdc-brand-row"><figure class="hdc-brand-item"><span class="hd-brand__mark hd-brand__mark--lg" aria-hidden="true"></span><figcaption>hd-brand__mark--lg, 64px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-brand__mark" aria-hidden="true"></span><figcaption>hd-brand__mark, 20px</figcaption></figure></div><p class="hdc-brand-panel__label">Menu bar glyph (monochrome, takes the text colour)</p><div class="hdc-brand-row"><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:16px;height:16px" aria-hidden="true"></span><figcaption>16px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:24px;height:24px" aria-hidden="true"></span><figcaption>24px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:32px;height:32px" aria-hidden="true"></span><figcaption>32px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:48px;height:48px" aria-hidden="true"></span><figcaption>48px</figcaption></figure></div></section><section class="hdc-brand-panel" data-theme="dark" aria-label="Dark background"><h3>Dark</h3><p class="hdc-brand-panel__label">App icon (image)</p><div class="hdc-brand-row"><figure class="hdc-brand-item"><img src="assets/branding/app-icon-128.png" width="96" height="96" alt="Harflow app icon, 96px"><figcaption>96px</figcaption></figure><figure class="hdc-brand-item"><img src="assets/branding/app-icon-128.png" width="64" height="64" alt="Harflow app icon, 64px"><figcaption>64px</figcaption></figure><figure class="hdc-brand-item"><img src="assets/branding/app-icon-128.png" width="32" height="32" alt="Harflow app icon, 32px"><figcaption>32px</figcaption></figure></div><p class="hdc-brand-panel__label">Brand mark (CSS)</p><div class="hdc-brand-row"><figure class="hdc-brand-item"><span class="hd-brand__mark hd-brand__mark--lg" aria-hidden="true"></span><figcaption>hd-brand__mark--lg, 64px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-brand__mark" aria-hidden="true"></span><figcaption>hd-brand__mark, 20px</figcaption></figure></div><p class="hdc-brand-panel__label">Menu bar glyph (monochrome, takes the text colour)</p><div class="hdc-brand-row"><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:16px;height:16px" aria-hidden="true"></span><figcaption>16px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:24px;height:24px" aria-hidden="true"></span><figcaption>24px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:32px;height:32px" aria-hidden="true"></span><figcaption>32px</figcaption></figure><figure class="hdc-brand-item"><span class="hd-mark-glyph" style="width:48px;height:48px" aria-hidden="true"></span><figcaption>48px</figcaption></figure></div></section></div>
</div>
`;
  M['brand/brand-mark'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/appearance'] = `
<div class="hdc-doc hdc-page">
<p>The app has three appearances: System (follows the computer), Light and Dark. A System / Light / Dark toggle (<code>hd-theme</code>) sits in the sidebar footer; the collapsed rail shows one button that cycles through them. Dark is a mid grey, never near-black.</p>

</div>
`;
  M['brand/appearance'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/content-fundamentals'] = `
<div class="hdc-doc hdc-page">
<ul><li><strong>Voice.</strong> Plain, literal, short. Sentence case everywhere. No exclamation marks, jokes or emoji. Errors state the fact and the fix.</li><li><strong>Buttons</strong> are imperative verbs: Run, Approve, Reject, Take over in terminal.</li><li><strong>Status vocabulary</strong> is closed: Running, Settling, Done, Failed, Timed out, Cancelled, Pending, Needs you. Workflow runs add Starting, Paused, Cancelling…</li><li><strong>Time.</strong> Elapsed is mm:ss, h:mm:ss past an hour. Ages are now, 5m, 2h, 3d.</li><li><strong>Access levels:</strong> Read-only, Can edit this repo, Can publish, Full access.</li><li><strong>Terminology.</strong> Harness is the installed tool (Claude Code, Codex, Opencode, Mistral Vibe, Antigravity). Agent is an AI participant (orchestrator, worker). Model is the model it runs on. Show harness and model together as "Claude · Opus 5.5".</li><li><strong>Sample content</strong> uses real Harflow names: repositories HarflowMCP, HarflowMac, HarflowDesktop, HarflowClient; tasks such as "Fix flaky slot release test"; workflows such as "Nightly dependency audit". Council is never shown.</li></ul>

</div>
`;
  M['brand/content-fundamentals'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/visual-foundations'] = `
<div class="hdc-doc hdc-page">
<p><strong>Colour roles</strong> (all via <code>var(--token)</code>; light and dark values live in <code>tokens.json</code>):</p>
<table><thead><tr><th scope="col">Role</th><th scope="col">Tokens</th></tr></thead><tbody><tr><td>Grounds</td><td><code>--bg</code>, <code>--bg-sidebar</code>, <code>--surface</code>, <code>--surface-sunken</code></td></tr><tr><td>Interaction fills</td><td><code>--surface-hover</code>, <code>--surface-active</code></td></tr><tr><td>Lines</td><td><code>--border</code> (hairline), <code>--border-strong</code> (controls, 3:1)</td></tr><tr><td>Text</td><td><code>--text</code>, <code>--text-secondary</code>, <code>--text-tertiary</code></td></tr><tr><td>Accent</td><td><code>--accent</code>, <code>--accent-solid</code>, <code>--accent-solid-hover</code>, <code>--accent-subtle</code>, <code>--on-accent</code></td></tr><tr><td>Needs you</td><td><code>--attention</code>, <code>--attention-subtle</code></td></tr><tr><td>Status</td><td><code>--success</code>, <code>--danger</code>, <code>--warning</code> and their <code>-subtle</code> grounds</td></tr><tr><td>Diff and overlay</td><td><code>--diff-add</code>, <code>--diff-remove</code>, <code>--scrim</code></td></tr></tbody></table>
<p><strong>Type styles</strong> (classes): <code>.display</code> 26/32 600 (the New task greeting only), <code>.title</code> 18/24 600, <code>.heading</code> 15/22 600, <code>.body</code> 14/22, <code>.label</code> 13/18 500, <code>.caption</code> 12/16, <code>.stat</code> 28/32 600 tabular, <code>.code</code> 12.5/19 mono. Sans is the system font stack; mono is the system mono stack.</p>
<p><strong>Spacing:</strong> <code>--space-1</code> 4, <code>-2</code> 8, <code>-3</code> 12, <code>-4</code> 16, <code>-5</code> 24, <code>-6</code> 32, <code>-7</code> 48. <strong>Radius:</strong> <code>--radius-sm</code> 6, <code>-md</code> 8, <code>-lg</code> 12, <code>-xl</code> 18 (composer), <code>-full</code> pills and dots.</p>
<p><strong>Elevation.</strong> The composer is the only resting shadow (<code>--shadow-composer</code>). Popovers use <code>--shadow-popover</code>, dialogs <code>--shadow-dialog</code>; everything else is flat.</p>

</div>
`;
  M['brand/visual-foundations'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/layout'] = `
<div class="hdc-doc hdc-page">
<table><thead><tr><th scope="col">Part</th><th scope="col">Size</th></tr></thead><tbody><tr><td>Sidebar</td><td>264px (<code>--sidebar-width</code>)</td></tr><tr><td>Rail (collapsed sidebar)</td><td>56px (<code>--rail-width</code>)</td></tr><tr><td>Content (transcript, centred composer)</td><td>760px (<code>--content-width</code>)</td></tr><tr><td>Right pane, workflow inspector</td><td>420px (<code>--pane-width</code>)</td></tr><tr><td>Title bar, task header</td><td>44px (<code>--titlebar-height</code>)</td></tr><tr><td>Nav item and task row</td><td>32px (<code>--row-height</code>)</td></tr></tbody></table>

</div>
`;
  M['brand/layout'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/iconography'] = `
<div class="hdc-doc hdc-page">
<p>16px stroke icons, drawn as CSS masks so they inherit <code>currentColor</code>. Markup:</p>
<pre><code>&lt;span class="hd-i hd-i-NAME" aria-hidden="true"&gt;&lt;/span&gt;</code></pre>
<p>Sizes: default 16px, <code>hd-i--sm</code> 14px, <code>hd-i--lg</code> 20px. Icon-only buttons need an <code>aria-label</code>.</p>
<p>Names: plus, minus, hand, workflow, gauge, chart, sidebar, search, settings, chevron-down, chevron-right, arrow-up, folder, harness, shield, check, x, alert, play, stop, pencil, more, terminal, file, diff, clock, task, refresh, panel-right, copy, external, branch, zap, spinner, undo, filter, eye, sun, moon, monitor, columns, graph, lock, pause, target, parallel, flag, bell, database.</p>
<h2>Icon set</h2><ul class="hdc-icon-grid"><li><span class="hd-i hd-i-plus" aria-hidden="true"></span><code>plus</code></li><li><span class="hd-i hd-i-minus" aria-hidden="true"></span><code>minus</code></li><li><span class="hd-i hd-i-hand" aria-hidden="true"></span><code>hand</code></li><li><span class="hd-i hd-i-workflow" aria-hidden="true"></span><code>workflow</code></li><li><span class="hd-i hd-i-gauge" aria-hidden="true"></span><code>gauge</code></li><li><span class="hd-i hd-i-chart" aria-hidden="true"></span><code>chart</code></li><li><span class="hd-i hd-i-sidebar" aria-hidden="true"></span><code>sidebar</code></li><li><span class="hd-i hd-i-search" aria-hidden="true"></span><code>search</code></li><li><span class="hd-i hd-i-settings" aria-hidden="true"></span><code>settings</code></li><li><span class="hd-i hd-i-chevron-down" aria-hidden="true"></span><code>chevron-down</code></li><li><span class="hd-i hd-i-chevron-right" aria-hidden="true"></span><code>chevron-right</code></li><li><span class="hd-i hd-i-arrow-up" aria-hidden="true"></span><code>arrow-up</code></li><li><span class="hd-i hd-i-folder" aria-hidden="true"></span><code>folder</code></li><li><span class="hd-i hd-i-harness" aria-hidden="true"></span><code>harness</code></li><li><span class="hd-i hd-i-shield" aria-hidden="true"></span><code>shield</code></li><li><span class="hd-i hd-i-check" aria-hidden="true"></span><code>check</code></li><li><span class="hd-i hd-i-x" aria-hidden="true"></span><code>x</code></li><li><span class="hd-i hd-i-alert" aria-hidden="true"></span><code>alert</code></li><li><span class="hd-i hd-i-play" aria-hidden="true"></span><code>play</code></li><li><span class="hd-i hd-i-stop" aria-hidden="true"></span><code>stop</code></li><li><span class="hd-i hd-i-pencil" aria-hidden="true"></span><code>pencil</code></li><li><span class="hd-i hd-i-more" aria-hidden="true"></span><code>more</code></li><li><span class="hd-i hd-i-terminal" aria-hidden="true"></span><code>terminal</code></li><li><span class="hd-i hd-i-file" aria-hidden="true"></span><code>file</code></li><li><span class="hd-i hd-i-diff" aria-hidden="true"></span><code>diff</code></li><li><span class="hd-i hd-i-clock" aria-hidden="true"></span><code>clock</code></li><li><span class="hd-i hd-i-task" aria-hidden="true"></span><code>task</code></li><li><span class="hd-i hd-i-refresh" aria-hidden="true"></span><code>refresh</code></li><li><span class="hd-i hd-i-panel-right" aria-hidden="true"></span><code>panel-right</code></li><li><span class="hd-i hd-i-copy" aria-hidden="true"></span><code>copy</code></li><li><span class="hd-i hd-i-external" aria-hidden="true"></span><code>external</code></li><li><span class="hd-i hd-i-branch" aria-hidden="true"></span><code>branch</code></li><li><span class="hd-i hd-i-zap" aria-hidden="true"></span><code>zap</code></li><li><span class="hd-i hd-i-spinner" aria-hidden="true"></span><code>spinner</code></li><li><span class="hd-i hd-i-undo" aria-hidden="true"></span><code>undo</code></li><li><span class="hd-i hd-i-filter" aria-hidden="true"></span><code>filter</code></li><li><span class="hd-i hd-i-eye" aria-hidden="true"></span><code>eye</code></li><li><span class="hd-i hd-i-sun" aria-hidden="true"></span><code>sun</code></li><li><span class="hd-i hd-i-moon" aria-hidden="true"></span><code>moon</code></li><li><span class="hd-i hd-i-monitor" aria-hidden="true"></span><code>monitor</code></li><li><span class="hd-i hd-i-columns" aria-hidden="true"></span><code>columns</code></li><li><span class="hd-i hd-i-graph" aria-hidden="true"></span><code>graph</code></li><li><span class="hd-i hd-i-lock" aria-hidden="true"></span><code>lock</code></li><li><span class="hd-i hd-i-pause" aria-hidden="true"></span><code>pause</code></li><li><span class="hd-i hd-i-target" aria-hidden="true"></span><code>target</code></li><li><span class="hd-i hd-i-parallel" aria-hidden="true"></span><code>parallel</code></li><li><span class="hd-i hd-i-flag" aria-hidden="true"></span><code>flag</code></li><li><span class="hd-i hd-i-bell" aria-hidden="true"></span><code>bell</code></li><li><span class="hd-i hd-i-database" aria-hidden="true"></span><code>database</code></li></ul>
</div>
`;
  M['brand/iconography'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/using-the-components'] = `
<div class="hdc-doc hdc-page">
<ul><li>All markup is plain HTML with classes from <code>components/bundle.css</code> (prefix <code>hd-</code>). There is no JS bundle; state classes such as <code>is-active</code> and <code>is-open</code> are set by the host app.</li><li>Tokens come from CSS variables in <code>tokens.css</code>. Set <code>data-theme="light"</code> or <code>"dark"</code> on an ancestor.</li><li>Never write a literal colour. Compose from existing classes plus inline <code>style</code> using tokens.</li><li>Use real elements: <code>&lt;button&gt;</code>, <code>&lt;a href&gt;</code>, <code>&lt;input&gt;</code> with a <code>&lt;label&gt;</code> or <code>hd-sr</code> label.</li><li>Each component has a <code>README.md</code> and a <code>preview.html</code> in <code>components/&lt;Name&gt;/</code>: Icons, Button, Pill, ThemeToggle, Menu, SidebarNavItem, SidebarTaskRow, Sidebar, Tabs, StatusBadge, Composer, TextField, FormControls, TranscriptMessage, ToolCallRow, ApprovalCard, WorkflowRow, SlotMeter, StatTile, ChangedFiles, WorkflowNode, Inspector, NodeTray, ParallelLanes, EmptyState, Banner, Skeleton, Dialog.</li></ul>

</div>
`;
  M['brand/using-the-components'] = { width: 960, height: 400, group: 'Brand' };

  T['brand/not-in-this-system'] = `
<div class="hdc-doc hdc-page">
<ul><li>Screens: they live in the separate Harflow Desktop Redesign canvas.</li><li>Council: out of scope; never shown.</li></ul>

</div>
`;
  M['brand/not-in-this-system'] = { width: 960, height: 400, group: 'Brand' };

  T['foundations/colour'] = `
<div class="hdc-doc hdc-page">
<p class="hdc-lead">Every colour is a custom property with a light and a dark value. Swatches are painted with the token itself, so they follow the appearance selected in the header. Never write a literal colour; use the token.</p>
<h2>Backgrounds and surfaces</h2>
<table class="hdc-token-table"><thead><tr><th scope="col">Swatch</th><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage</th></tr></thead><tbody>
<tr><td><span class="hdc-swatch" style="background:var(--bg)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--bg</code></td><td><code>#fafafa</code></td><td><code>#2b2b2d</code></td><td>Main content background. Dark is a mid-dark grey on purpose, never near-black.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--bg-sidebar)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--bg-sidebar</code></td><td><code>#f2f2f1</code></td><td><code>#232325</code></td><td>Sidebar and rail background, one step quieter than bg.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--surface)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--surface</code></td><td><code>#ffffff</code></td><td><code>#343437</code></td><td>Raised objects on bg: composer, cards, menus, dialogs.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--surface-hover)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--surface-hover</code></td><td><code>#ebebea</code></td><td><code>#3b3b3e</code></td><td>Hover fill for rows, nav items and ghost buttons.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--surface-active)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--surface-active</code></td><td><code>#e3e3e2</code></td><td><code>#444448</code></td><td>Selected nav item or row; pressed state.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--surface-sunken)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--surface-sunken</code></td><td><code>#f4f4f3</code></td><td><code>#262628</code></td><td>Code blocks, expanded tool output, input wells.</td></tr>
</tbody></table>
<h2>Text</h2>
<table class="hdc-token-table"><thead><tr><th scope="col">Swatch</th><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage</th></tr></thead><tbody>
<tr><td><span class="hdc-swatch" style="background:var(--text)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--text</code></td><td><code>#1d1d1f</code></td><td><code>#ececee</code></td><td>Primary text on bg, bg-sidebar and surface.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--text-secondary)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--text-secondary</code></td><td><code>#56575c</code></td><td><code>#b7b7bc</code></td><td>Secondary text: metadata, descriptions, inactive nav labels.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--text-tertiary)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--text-tertiary</code></td><td><code>#5f6065</code></td><td><code>#adadb3</code></td><td>Section headers, timestamps, placeholders. Still 4.5:1 on every ground.</td></tr>
</tbody></table>
<h2>Borders</h2>
<table class="hdc-token-table"><thead><tr><th scope="col">Swatch</th><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage</th></tr></thead><tbody>
<tr><td><span class="hdc-swatch" style="background:var(--border)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--border</code></td><td><code>#e2e2e0</code></td><td><code>#404044</code></td><td>Hairline dividers and card outlines. Use sparingly.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--border-strong)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--border-strong</code></td><td><code>#8a8a8f</code></td><td><code>#88888e</code></td><td>Control outlines that must reach 3:1 (text fields, checkboxes).</td></tr>
</tbody></table>
<h2>Accent and brand</h2>
<table class="hdc-token-table"><thead><tr><th scope="col">Swatch</th><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage</th></tr></thead><tbody>
<tr><td><span class="hdc-swatch" style="background:var(--accent)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--accent</code></td><td><code>#2b63d9</code></td><td><code>#7aa5ff</code></td><td>The one accent: links, focus ring, running spinner, selected pill text.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--accent-solid)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--accent-solid</code></td><td><code>#2b63d9</code></td><td><code>#3d6fdc</code></td><td>Fill of the primary button and send button; carries on-accent text.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--accent-solid-hover)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--accent-solid-hover</code></td><td><code>#2455bd</code></td><td><code>#3462c9</code></td><td>Hover fill of accent-solid.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--accent-subtle)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--accent-subtle</code></td><td><code>#e7eefc</code></td><td><code>#2f3a52</code></td><td>Tinted ground for selected pills and the running badge.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--on-accent)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--on-accent</code></td><td><code>#ffffff</code></td><td><code>#ffffff</code></td><td>Text and icons on accent-solid.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--brand-start)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--brand-start</code></td><td><code>#8580ff</code></td><td><code>#8580ff</code></td><td>App icon gradient top (brand only; never for UI state).</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--brand-end)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--brand-end</code></td><td><code>#5b52ea</code></td><td><code>#5b52ea</code></td><td>App icon gradient bottom (brand only).</td></tr>
</tbody></table>
<h2>Status</h2>
<table class="hdc-token-table"><thead><tr><th scope="col">Swatch</th><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage</th></tr></thead><tbody>
<tr><td><span class="hdc-swatch" style="background:var(--attention)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--attention</code></td><td><code>#ad4210</code></td><td><code>#f08a4b</code></td><td>Needs you: the sidebar dot, hand glyph on rows waiting for a person.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--attention-subtle)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--attention-subtle</code></td><td><code>#fbeee6</code></td><td><code>#47352b</code></td><td>Ground of the approval card header and Needs you badge.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--success)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--success</code></td><td><code>#25793a</code></td><td><code>#6cc785</code></td><td>Done glyph and text.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--success-subtle)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--success-subtle</code></td><td><code>#e5f3e8</code></td><td><code>#2c3f31</code></td><td>Ground of the Done badge.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--danger)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--danger</code></td><td><code>#c0352c</code></td><td><code>#f2827a</code></td><td>Failed glyph and text, destructive buttons.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--danger-subtle)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--danger-subtle</code></td><td><code>#fbe9e7</code></td><td><code>#4a3230</code></td><td>Ground of the Failed badge and error banner.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--warning)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--warning</code></td><td><code>#8a5a00</code></td><td><code>#e5b454</code></td><td>Timed out, slot nearly full, stale data.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--warning-subtle)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--warning-subtle</code></td><td><code>#fbf1dc</code></td><td><code>#45391f</code></td><td>Ground of warning badges.</td></tr>
</tbody></table>
<h2>Diff and overlay</h2>
<table class="hdc-token-table"><thead><tr><th scope="col">Swatch</th><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage</th></tr></thead><tbody>
<tr><td><span class="hdc-swatch" style="background:var(--diff-add)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--diff-add</code></td><td><code>#e3f4e6</code></td><td><code>#2a3d2e</code></td><td>Added line ground in diffs.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--diff-remove)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--diff-remove</code></td><td><code>#fbe7e5</code></td><td><code>#43302e</code></td><td>Removed line ground in diffs.</td></tr>
<tr><td><span class="hdc-swatch" style="background:var(--scrim)" aria-hidden="true"></span></td><td class="hdc-nowrap"><code>--scrim</code></td><td><code>rgba(20, 20, 22, 0.32)</code></td><td><code>rgba(0, 0, 0, 0.45)</code></td><td>Backdrop behind dialogs.</td></tr>
</tbody></table>
</div>
`;
  M['foundations/colour'] = { width: 960, height: 400, group: 'Foundations' };

  T['foundations/typography'] = `
<div class="hdc-doc hdc-page">
<p class="hdc-lead">One sans family for the interface and one mono family for code. Each text style is a class; the samples below use the classes themselves.</p>
<h2>Font families</h2>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>--font-sans</code><p>Sans family</p></div><div><div class="hdc-type-sample" style="font-family:var(--font-sans);font-size:20px;line-height:28px">Quiet interfaces for running agent tasks</div><p class="hdc-type-row__note"><code>-apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", system-ui, Ubuntu, sans-serif</code></p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>--font-mono</code><p>Mono family</p></div><div><div class="hdc-type-sample" style="font-family:var(--font-mono);font-size:20px;line-height:28px">harflow-ctl start_task --backend codex</div><p class="hdc-type-row__note"><code>ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace</code></p></div></div>
<h2>Text styles</h2>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.display</code><p>26px / 32px, weight 600, letter-spacing -0.01em</p></div><div><div class="display hdc-type-sample">What should we work on?</div><p class="hdc-type-row__note">The New task greeting only.</p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.title</code><p>18px / 24px, weight 600</p></div><div><div class="title hdc-type-sample">Workflows</div><p class="hdc-type-row__note">Page titles: Workflows, Needs you, Statistics.</p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.heading</code><p>15px / 22px, weight 600</p></div><div><div class="heading hdc-type-sample">Refactor the session store</div><p class="hdc-type-row__note">Card and section headings, task title in the header.</p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.body</code><p>14px / 22px, weight 400</p></div><div><div class="body hdc-type-sample">I'll start by reading the store module.</div><p class="hdc-type-row__note">Transcript text, descriptions, composer input.</p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.label</code><p>13px / 18px, weight 500</p></div><div><div class="label hdc-type-sample">New task</div><p class="hdc-type-row__note">Nav items, buttons, pills, row titles.</p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.caption</code><p>12px / 16px, weight 400</p></div><div><div class="caption hdc-type-sample">Running 04:12 · Claude</div><p class="hdc-type-row__note">Metadata, timestamps, helper text, section headers.</p></div></div>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.stat</code><p>28px / 32px, weight 600</p></div><div><div class="stat hdc-type-sample" style="font-variant-numeric:tabular-nums">1,284</div><p class="hdc-type-row__note">Stat tile numbers; tabular figures.</p></div></div>
<h2>Code styles</h2>
<div class="hdc-type-row"><div class="hdc-type-row__meta"><code>.code</code><p>12.5px / 19px, weight 400</p></div><div><div class="code hdc-type-sample">npm test -- store</div><p class="hdc-type-row__note">Commands, paths, tool output, diffs.</p></div></div>
</div>
`;
  M['foundations/typography'] = { width: 960, height: 400, group: 'Foundations' };

  T['foundations/spacing-radius'] = `
<div class="hdc-doc hdc-page">
<p class="hdc-lead">Spacing steps, corner radii and fixed layout sizes. Bars and boxes are drawn from the tokens at true size.</p>
<h2>Spacing</h2>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-1</code><p>4px</p></div><div><div class="hdc-bar" style="width:var(--space-1)"></div><p class="hdc-spec-row__note">Icon-to-label gap inside small controls.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-2</code><p>8px</p></div><div><div class="hdc-bar" style="width:var(--space-2)"></div><p class="hdc-spec-row__note">Gap between pills, row inner padding.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-3</code><p>12px</p></div><div><div class="hdc-bar" style="width:var(--space-3)"></div><p class="hdc-spec-row__note">Card inner padding (compact), sidebar gutter.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-4</code><p>16px</p></div><div><div class="hdc-bar" style="width:var(--space-4)"></div><p class="hdc-spec-row__note">Card padding, gap between transcript blocks.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-5</code><p>24px</p></div><div><div class="hdc-bar" style="width:var(--space-5)"></div><p class="hdc-spec-row__note">Gap between page sections.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-6</code><p>32px</p></div><div><div class="hdc-bar" style="width:var(--space-6)"></div><p class="hdc-spec-row__note">Page side padding.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--space-7</code><p>48px</p></div><div><div class="hdc-bar" style="width:var(--space-7)"></div><p class="hdc-spec-row__note">Top offset of centred layouts (New task).</p></div></div>
<h2>Radius</h2>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--radius-sm</code><p>6px</p></div><div><div class="hdc-radius-box" style="border-radius:var(--radius-sm)"></div><p class="hdc-spec-row__note">Nav items, rows, small buttons, badges.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--radius-md</code><p>8px</p></div><div><div class="hdc-radius-box" style="border-radius:var(--radius-md)"></div><p class="hdc-spec-row__note">Buttons, inputs, menus items, code blocks.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--radius-lg</code><p>12px</p></div><div><div class="hdc-radius-box" style="border-radius:var(--radius-lg)"></div><p class="hdc-spec-row__note">Cards, menus, dialogs.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--radius-xl</code><p>18px</p></div><div><div class="hdc-radius-box" style="border-radius:var(--radius-xl)"></div><p class="hdc-spec-row__note">The composer.</p></div></div>
<div class="hdc-spec-row"><div class="hdc-spec-row__meta"><code>--radius-full</code><p>999px</p></div><div><div class="hdc-radius-box" style="border-radius:var(--radius-full)"></div><p class="hdc-spec-row__note">Pills, dots, avatars.</p></div></div>
<h2>Sizes</h2>
<div class="hdc-spec-row hdc-spec-row--stack"><div class="hdc-spec-row__meta"><code>--sidebar-width</code><p>264px</p></div><div><div class="hdc-size-bar" style="width:var(--sidebar-width)"></div><p class="hdc-spec-row__note">Expanded sidebar.</p></div></div>
<div class="hdc-spec-row hdc-spec-row--stack"><div class="hdc-spec-row__meta"><code>--rail-width</code><p>56px</p></div><div><div class="hdc-size-bar" style="width:var(--rail-width)"></div><p class="hdc-spec-row__note">Collapsed sidebar rail, icons only.</p></div></div>
<div class="hdc-spec-row hdc-spec-row--stack"><div class="hdc-spec-row__meta"><code>--content-width</code><p>760px</p></div><div><div class="hdc-size-bar" style="width:var(--content-width)"></div><p class="hdc-spec-row__note">Max width of the transcript and centred composer.</p></div></div>
<div class="hdc-spec-row hdc-spec-row--stack"><div class="hdc-spec-row__meta"><code>--pane-width</code><p>420px</p></div><div><div class="hdc-size-bar" style="width:var(--pane-width)"></div><p class="hdc-spec-row__note">Right pane (changes, artifacts, events) and workflow inspector.</p></div></div>
<div class="hdc-spec-row hdc-spec-row--stack"><div class="hdc-spec-row__meta"><code>--titlebar-height</code><p>44px</p></div><div><div class="hdc-size-box" style="height:var(--titlebar-height)"></div><p class="hdc-spec-row__note">Window title bar / task header height.</p></div></div>
<div class="hdc-spec-row hdc-spec-row--stack"><div class="hdc-spec-row__meta"><code>--row-height</code><p>32px</p></div><div><div class="hdc-size-box" style="height:var(--row-height)"></div><p class="hdc-spec-row__note">Sidebar nav items and task rows.</p></div></div>
</div>
`;
  M['foundations/spacing-radius'] = { width: 960, height: 400, group: 'Foundations' };

  T['foundations/elevation'] = `
<div class="hdc-doc hdc-page">
<p class="hdc-lead">The composer is the only resting shadow. Popovers and dialogs lift above the page; everything else is flat.</p>
<div class="hdc-shadow-grid">
<div><div class="hdc-shadow-card" style="box-shadow:var(--shadow-composer)"><code>--shadow-composer</code></div><p class="hdc-spec-row__note">The composer; the only resting shadow in the app.</p><p class="hdc-spec-row__note">Light <code>0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)</code></p><p class="hdc-spec-row__note">Dark <code>0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.25)</code></p></div>
<div><div class="hdc-shadow-card" style="box-shadow:var(--shadow-popover)"><code>--shadow-popover</code></div><p class="hdc-spec-row__note">Menus, pill pickers, tooltips.</p><p class="hdc-spec-row__note">Light <code>0 8px 28px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)</code></p><p class="hdc-spec-row__note">Dark <code>0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)</code></p></div>
<div><div class="hdc-shadow-card" style="box-shadow:var(--shadow-dialog)"><code>--shadow-dialog</code></div><p class="hdc-spec-row__note">Dialogs over the scrim.</p><p class="hdc-spec-row__note">Light <code>0 20px 60px rgba(0, 0, 0, 0.2)</code></p><p class="hdc-spec-row__note">Dark <code>0 20px 60px rgba(0, 0, 0, 0.55)</code></p></div>
</div>
</div>
`;
  M['foundations/elevation'] = { width: 960, height: 400, group: 'Foundations' };
})();
