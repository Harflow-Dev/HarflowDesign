# Centered composer amendment (owner-approved 2026-11-06)

Status: **Centered composer approved by the owner on 2026-11-06**. The owner
subsequently requested the sidebar correction recorded below. This is a bounded amendment to the
owner-approved M04 native entry direction of 2026-11-05; the approval is recorded
separately and does not rewrite the baseline provenance. The 24 approved baseline
routes (`#m04-proposal/shell` through `#m04-proposal/runtime-listing`) keep their
separate 2026-11-05 record, except for the owner correction of 2026-11-06 below,
which applies to every M04 specimen route and is part of the approved M04 sidebar
design. The owner requested commit and push; the primary commits and pushes after
the final test and review pass. Native validation remains pending.

## Source baseline

- HarflowDesign `5b37a3d4d4d06b3d96c517cd384892e1ac6883cf` (HEAD at the time of the
  amendment): `v2/scripts/m04-proposal.js`, `v2/scripts/screens-m04-proposal.js`,
  `v2/styles/m04-proposal.css`.
- The mounted specimen reuses the canonical `new-task/default`,
  `new-task/harness-menu` and `new-task/sidebar-collapsed` templates unchanged;
  the amendment only adds presentational behavior after mounting.
- Approved direction record: [m04-proposal.md](m04-proposal.md) and
  [approval.md](approval.md).

## Requested behavior

The owner judged the current New task composer too tall. The amendment centers the
whole greeting / composer / status / help group in the New task area and makes the
prompt grow with its text:

- The whole inner group is centered with natural flex auto margins. When the group
  cannot fit the minimum frame, the auto margins collapse to zero, the top is
  never clipped, and the content area scrolls normally instead of shrinking the
  app.
- The prompt starts compact at one visual line (existing 22px line-height plus the
  2px top and bottom paddings; 26px with border-box accounted for). This overrides
  the baseline `rows="3"` and the 44px `min-height` in the amendment routes only.
- The prompt grows from the actual `scrollHeight`, so soft-wrapped visual lines
  count. After **six visible lines** (explicitly chosen by the owner) the height
  stops at 136px (6 × 22px + 4px padding, border-box sizing) and the prompt
  scrolls with the existing thin, soft design-system scrollbar. The caret and
  selection stay visible once capped because the prompt itself scrolls.
- The size recalculates after input (growth and deletion shrink it), after
  render/reset, after appearance changes, and after width/frame changes. Width
  changes are observed with a ResizeObserver on the specimen frame that triggers
  only on width changes and batches into one requestAnimationFrame, so changing
  the textarea height cannot feed back into the observer. Observers, the pending
  RAF frame and listeners are all removed on disposal.
- For the amendment routes only, the task options popover picks above or below by
  the space actually available inside the specimen viewport, with no artificial
  minimum height (the baseline above-only popup and its 64px floor stay as
  approved). The popover stays dismissible by Escape (focus returns to the +
  button) and by outside pointer clicks, and its keyboard access is unchanged.

Preserved semantics: caret and focus while typing, the draft, selected choices,
per-repository remembered choices, and the Start locks (single flight, refused,
unknown outcome, created). Route changes and Reset fixture still clear the draft,
choices, remembered values and outcomes; appearance changes on the same route
still preserve them.

## Review routes

All routes are `#m04-proposal/<state>/light` or `/dark`, scoped by the new
`hd-m04-amendment` root class so they cannot affect the approved baseline:

| Route | State |
|---|---|
| `amendment-empty` | Centered group, compact empty prompt |
| `amendment-ready` | One visual line, ready to start |
| `amendment-growing` | Grown to roughly three soft-wrapped lines |
| `amendment-capped` | More than six lines, capped and scrolling |
| `amendment-options` | Task options open from the centered composer |
| `amendment-unknown` | Unknown start outcome locked inside the centered layout |

The board links label the states, the catalog strip reads "Approved amendment ·
Centered composer · Owner 2026-11-06" on the amendment routes, and the catalog copy
and registry descriptions record the amendment approval separately from the
2026-11-05 baseline. The approved baseline routes link to the amendment (labeled
"Centered composer (amendment)") and the amendment routes link back
("Baseline (approved 2026-11-05)"), so both directions carry their own approval
record instead of borrowing the other's.

## Owner correction: whole sidebar body scroll (2026-11-06)

The owner clarified the M04 sidebar direction on 2026-11-06, before any native
implementation: the navigation, Running and Recent work must scroll together as
one bounded body with the thin soft scrollbar, while the sidebar header and the
Settings/appearance footer stay fixed. This supersedes the earlier M04
Recent-only bounded list, whose `hd-section--fill` overflow and row-shrink rules
were removed from `v2/styles/m04-proposal.css`.

Implementation in the scoped proposal only (`v2/scripts/m04-proposal.js` and
`v2/styles/m04-proposal.css`; no canonical template changes):

- At mount, the direct sidebar `.hd-nav` and both `.hd-section` children are
  wrapped in a dedicated `.hd-m04-sidebar-scroll` element, leaving
  `.hd-sidebar__top` (header) and `.hd-sidebar__foot` (Settings/appearance) fixed
  as direct sidebar children.
- The wrapper is the single bounded flex scrolling area (`flex:1 1 auto`,
  `min-height:0`, `overflow-y:auto`) and reuses the soft 6px scrollbar treatment
  from the options popover and capped prompt.
- Sections and lists no longer fill or scroll on their own inside the body;
  task rows keep the canonical 32px `--row-height` and the loading row its 28px.
- The runtime and history branches keep their behavior: the runtime gate still
  inserts before the fixed footer (the emptied scroll body is hidden), history
  rows and the note use descendant selectors, and the collapsed rail uses
  `.hd-rail` and is untouched.
- Composer behavior is unchanged by the correction. The centered-composer
  amendment was approved separately by the owner on 2026-11-06 before the
  subsequent sidebar correction request; these decisions and the 2026-11-05
  baseline approval remain distinct records.

Primary browser verification of the corrected behavior (minimum frame 1000 × 620,
both appearances): all 12 task rows (3 Running, 9 Recent work) measure 32px, the
single scroll body measures clientHeight 517 / scrollHeight 675, wheel over
Running moves the body (scrollTop 158) while the Recent work list itself does
not scroll (scrollTop 0), and the header and Settings/appearance footer stay
fixed (viewport Y 381 and 950 unchanged). The focused Node suites pass (77
tests, primary run). Reference-frame and remaining wheel-path checks are native
fidelity follow-ups unless the primary records them.

## Browser and native limits

- Browser verification is owned independently by the primary; no browser
  interaction was performed while authoring this amendment. Native titlebar, OS
  controls, popover behavior, text rasterization and scrollbars remain browser
  approximations.
- Fixtures are deterministic local text; no engine, provider, backend or network
  operation runs, and no user data is involved. No native or runtime
  implementation is claimed by this browser specimen. The owner separately
  authorized native implementation and strict validation, excluding runtime smoke.
- The owner approved this amendment on 2026-11-06 and requested commit and push.
  The primary records the HarflowDesign commit hash and file paths when it
  commits and pushes after the final test and review pass. The approval does not
  extend or rewrite the 2026-11-05 approval of the M04 baseline, and native
  fidelity remains a separate pending validation step.

## Validation status

Local checks run during authoring: `node --check` on the changed scripts and
`node --test` on `tests/m04-proposal.test.mjs` (28 pass), `tests/v2.test.mjs`
(17 pass), `tests/d2b-proposal.test.mjs` and `tests/statistics-accounting.test.mjs`
(32 pass), and `tests/catalog.test.mjs` with the local source-link skip (224
pass). Primary post-correction verification: the focused Node suites pass (77
tests, primary run).
Browser geometry checks cover all six amendment routes in both appearances at
1280 × 800 and 1000 × 620 (24 cases): the group remains centered and the options
popup stays inside its viewport. Interactive typing, soft wrapping, deletion shrink,
caret scrolling and Escape dismissal were checked. A fresh read-only review found
no actionable code findings.

Owner decisions, 2026-11-06: the owner approved the centered six-line design,
authorized native implementation and strict validation, and requested the design
commit and push. The owner then requested normal sidebar row spacing, one shared
sidebar body scroll, and the existing native app's small scrollbar. The primary
verified that correction as recorded above; no additional owner review after that
verification is claimed. Native implementation and fidelity validation remain pending.
