# Workflow name before first save

Status: **Provisional — not approved.** Prepared on 2026-11-17 for owner review. No native implementation is authorized by this drawing; the existing approved name-required state remains listed.

## Source and missing interaction

Native behavior anchor: HarflowMac `c4cfc5508caa09c7a655428eb2073e181186793d`:

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowView.swift:121` renders the workflow title as static text.
- `Workflow/WorkflowVM+Editor.swift:125–143` creates a new workflow with an empty name.
- `Workflow/WorkflowLaunchSheet.swift:37–40` exposes the name field only during generation.
- `Workflow/WorkflowVM+Save.swift` requires a nonblank name and exact current successful validation before Save becomes available.

Approved design `b710856a31702e46e3b8f3a54be19f3cb7c422dc`, `v2/scripts/states-workflow-gaps.js`, `workflow-editor/name-required`, draws a static faint “New workflow” title, “Enter a workflow name.” and disabled Save. It supplies no naming interaction for Blank workflow. Generating a workflow has its own name field; opening that unrelated form is not the intended Blank naming route. The saved-workflow rename proposal remains outside this work, as recorded in the migration coverage ledger.

## Proposed interaction

For a **new, never-saved workflow only**, replace the title with one native single-line text field labelled “Workflow name”, with placeholder “New workflow”. Keep its place in the existing top bar. After the first successful save, show the saved name as the existing static title. Opening an existing workflow keeps the static title. No Rename action is added.

Typing updates the draft name directly through the existing binding. Blur retains the current draft text. There is no extra commit/cancel mode: Enter does not save or submit; Escape does not restore an earlier name. Existing draft persistence and validation rules still apply. Empty and whitespace-only names show the existing name-required status and keep Save disabled. A nonblank edit revokes prior readiness and shows the existing checking status until the real validator answers. A valid response, an invalid response and an unavailable validator retain the already approved readiness behavior.

The field can be focused with the keyboard and uses the shared native focus treatment. The focused empty drawing begins with focus in the field; the long-name drawing begins with the caret at the end so the input scrolls horizontally. No automatic focus-on-every-edit or focus transfer from other controls is implied. A browser input approximates native single-line selection, caret, focus and horizontal scrolling.

The field occupies the existing title slot: nominal width 260, minimum width 96, shrinking with the available top-bar space. The minimum frame keeps the approved sidebar, inspector, canvas and top-bar-meta adaptations. These proposed field sizes still require browser inspection and native fitting verification; no pixel-fidelity claim is made.

## Review routes

All routes support light and dark appearance through the existing catalog controls or `/light` and `/dark` suffixes. Normal size is 1280 × 800; minimum size is 1000 × 620.

| State | Normal | Minimum |
| --- | --- | --- |
| Empty, unfocused | `workflow-editor/name-entry-empty` | `workflow-editor/name-entry-empty-minimum` |
| Empty, focused | `workflow-editor/name-entry-focused` | `workflow-editor/name-entry-focused-minimum` |
| Name entered, awaiting validation | `workflow-editor/name-entry-named` | `workflow-editor/name-entry-named-minimum` |
| Long name, focused, awaiting validation | `workflow-editor/name-entry-long` | `workflow-editor/name-entry-long-minimum` |

The name input is interactive. No engine call, Save operation, provider operation or simulated successful validation occurs. Named specimens deliberately keep Save disabled while checking. Reloading or reopening a route resets its deterministic name and focus state. Saved static-title evidence remains the unchanged approved `workflow-editor/node-selected` and `node-selected-minimum` routes.

## Files and evidence

- `v2/scripts/states-workflow-naming.js`: eight provisional states and bounded input/focus demonstration.
- `v2/styles/gap-workflow.css`: field fitting and placeholder treatment using existing semantic tokens.
- `v2/index.html`: classic-script registration, preserving offline and `file://` preview.

JavaScript syntax was checked with `node --check`. Browser inspection, keyboard/blur checks, both appearances, minimum-frame overflow checks and owner approval are pending. No build, test suite, native implementation, commit, deployment or release was performed for this preparation.
