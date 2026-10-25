# Changelog

## Unreleased

- Add exploratory workflow setup and teardown proposals: Setup and Teardown commands on the Start and End inspectors (`start-setup`, `start-new-folder`, `end-teardown`) and a Run sheet command review (`workflow-launch/setup-review`) that keeps Run disabled until the commands are reviewed, shown without a native source.

- Show the Harflow app icon beside the catalog title and as the browser tab icon, using PNGs exported from HarflowMac `macos/Harflow/Resources/AppIcon.icns`.

- Add a Harnesses option to the exploratory Statistics ranked list, with executions and model count per harness and a model drill-down, and move the reference to canvas version 1792893875-1b6a.

- Revise the exploratory Council configuration and run activity to the new canvas design: named members with instructions as accordion cards, optional members that never block consensus, read-only limits, name and required-count validation, a labelled feed with a members roster, and consensus, member-left, and failed outcome states; editable limits, structured output, routing, and the Go to outcome link are removed.

- Revise the exploratory Statistics family to the new design: the Total time or Usage measure, a daily stacked chart, ranked workflow and task lists with run and turn drill-down, and a node breakdown page replace the totals tiles, cost, and empty state; dates are fixed and UTC-based.

- Validate every Council limit, add structured output and routing controls, open Rename with the clicked workflow's name, and tighten proposal accessibility, emblem tinting, and Statistics fixtures.

- Add an exploratory Statistics family with overview and empty states and a sidebar entry, shown without a native source link.

- Add exploratory starred workflows in the Run Workflow chooser and the Council run activity feed, and route the sidebar Rename action to the editor rename dialog.

- Add exploratory workflow editor proposals for rename, standalone node reordering, the Council node configuration, and the readiness report, and fix standalone card order and layout.

- Add exploratory sidebar proposals for the header appearance control, starred workflows, and the context menu with delete confirmation.

- Align shipped Settings and setup specimens with the native app: the main-window titlebar emblem, the scrolling setup card, the General Task store group with native recovery states, runtime retry copy, and Harnesses row labels.

- Label exploratory ticket proposals from registry metadata with one caption helper, state picker and search suffix, and an in-stage label, and mark compact-sidebar run states as containing an exploratory element.

- Match native icon-only Light/Dark/System controls and titlebar connection status; separate catalog preview appearance from the locally persisted app preference.

- Share native rounded connector geometry, open arrowheads, backward dashes, and zoom scaling between workflow editor and run.

- Calibrate workflow run layouts and states against native mocks; preview compact default and full-width selected Activity sidebars.
- Establish a canonical product glossary for Harness, Agent, Node, Session, and related design terminology.

- Align workflow editor states, inspectors, launch sheets, and canvas layout using native fixture comparisons.
- Align standalone parallel groups with native headers, lane status strips, actions, results, and adaptive lane widths; add fresh native mock references in both appearances.
- Present approval actions and optional supplied descriptions in readable form instead of raw JSON.
- Preview caller-owned approval responses in the Mac design, with a separate read-only compatibility state.
- Match approval requests to native panel references and retain the shared task context across Activity, Summary, and Prompt.
- Align task Summary and Prompt with native references and share their panes across task-detail tabs and catalog entry points.
- Added an offline, editable source-derived HarflowMac interface catalog.
- Added shared HfUI colors, typography, geometry, screen states, pinned source links, and mock interactions.
- Added source coverage and fidelity documentation with native foundation references.
- Calibrated workflow, task, dialog, settings, and menu layouts using native SwiftUI fixture references.
- Corrected sidebar workflow symbols, status-symbol cutouts, tree guides, group layout, and search contrast against fresh native mock captures.
- Calibrated task activity against native rich-feed captures, including grouped tools, prompt disclosure, composer eligibility, and terminal/takeover states.
