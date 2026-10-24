# Screen inventory and fidelity

Baseline: HarflowMac [`7fbed912`](https://github.com/Harflow-Dev/HarflowMac/tree/7fbed912b61094f2ee427a7d9be76a026767a61e). All specimens are source-derived, editable HTML approximations; none is approved or full-screen pixel-verified. The following state selectors are actual catalog routes, not claims that every native runtime combination has been exercised.

| Family | Editable states | Pinned source | Fidelity |
|---|---|---|---|
| Foundations | `default`, `components`, `native-reference` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFoundation/HfUI/Sources/HfUI/Style/Palette.swift) | Native foundation reference available |
| Sessions & sidebar | `populated`, `loading`, `empty`, `no-results`, `backend-empty`, `list-error`, `install-retry`, `degraded-catalog`, `older-history-error` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Coordinator/MainWindowNavigationView.swift) | Native sidebar fixture compared; host materials approximated |
| Task activity | `running`, `completed`, `failed`, `timed-out`, `cancelled`, `taken-over`, `spawned`, `missing`, `deferred`, `no-live`, `no-session` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/TaskDetailView.swift) | Rich native running, completed, failed, and running-takeover fixtures compared; host toolbar approximated |
| Task summary | `completed`, `loading`, `empty`, `paged`, `error`, `unsupported`, `metadata-only` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/TaskDetailView.swift) | Native Summary and Prompt fixtures compared; shared task-detail shell |
| Approval requests | `monitor-pending`, `inspected`, `submitting`, `caller-owned`, `caller-owned-legacy`, `history`, `approved`, `denied`, `expired`, `error`, `pagination` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/TaskDetailView.swift) | Exploratory inline placement; native controls and Summary fixtures compared |
| Raw events | `populated`, `empty`, `unknown-event` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/Component/RawEventsSheetView.swift) | Source-derived; native screen comparison pending |
| Parallel group | `mixed`, `empty`, `deferred`, `completed`, `two-lanes` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Parallel/ParallelView.swift) | Native parallel fixture compared |
| Workflow editor | `saved`, `dirty`, `empty`, `validation`, `conflict`, `read-error`, `loading`, `node`, `connection`, `branch`, `child-reference`, `missing-reference`, `orchestrator`, `on-demand`, `builder-conversation`, `proposal-ready` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowView.swift) | Native saved/orchestrator fixture compared |
| Workflow run | `running`, `selected-node`, `attempts`, `parallel`, `on-demand-not-called`, `on-demand-calls`, `child-session`, `child-workflow`, `missing-task`, `attention`, `settling`, `paused`, `completed`, `cancelled`, `error`, `loading`, `parent-owned` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowRunPanes.swift) | Fresh native Graph, selected Activity, Parallel, on-demand, completed, loading, and read-failure fixtures compared; compact default sidebar is an intentional proposal |
| New session | `default`, `loading`, `unavailable`, `missing-cli`, `validation`, `start-failed`, `busy` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NewSession/NewSessionView.swift) | Native default fixture compared |
| Workflow launch | `library`, `empty`, `read-error`, `launch`, `generate`, `propose`, `validation`, `busy` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowRunnerView.swift) | Source-derived; native screen comparison pending |
| Settings | `general`, `runtime-retry`, `harnesses`, `outdated`, `unknown`, `error`, `loading`, `working`, `remove-confirmation` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/SettingsFeature/Sources/SettingsFeature/General/GeneralSettingsView.swift) | Native General/Harnesses fixtures compared; host controls approximated |
| MCP permissions | `default`, `loading`, `working`, `error`, `unsupported` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/SettingsFeature/Sources/SettingsFeature/Harnesses/MCPAllowlistView.swift) | Source-derived; native screen comparison pending |
| Menu bar | `populated`, `loading`, `empty`, `attention`, `disconnected`, `install-banner` | [Swift source](https://github.com/Harflow-Dev/HarflowMac/blob/7fbed912b61094f2ee427a7d9be76a026767a61e/macos/HfFeatures/MenuBarFeature/Sources/MenuBarFeature/MenuBar/MenuBarView.swift) | Native populated fixture compared; materials approximated |

## Source-specific evidence

- Foundations: `HfFoundation/HfUI/Sources/HfUI/Style/{Palette,Style,HfRadius,HfMotion}.swift`. Exact light/dark RGB values and harness identity colors are retained; derived opacity tokens are represented where used by components.
- Task summary and registered artifact metadata: `TaskDetail/Component/SummaryPaneView.swift` and `TaskArtifactsView.swift`. Artifact references are metadata, not content previews.
- Approval ownership and inspect-before-action: `TaskDetail/CallerApprovalCard.swift`. Caller-owned requests are read-only; Harflow-owned current pending requests expose actions after inspection.
- Workflow right sidebar: `Workflow/WorkflowRunPanes.swift`, `WorkflowSelectedSidebar.swift`, `WorkflowRunPlan.swift`, `WorkflowRunSummary.swift`, `WorkflowRecoveryForm.swift`, and `WorkflowOnDemandCallsView.swift`. The current native sidebar ideal is 420 points; on-demand nodes remain outside traversal.
- Settings global approval list: `SettingsFeature/Harnesses/MCPAllowlistView.swift`; Add approval/Remove/Refresh/Done.

All relative source descriptions above refer to the matching feature under `macos/HfFeatures/` at the pinned commit. The primary family links resolve exact repository paths.

## Native fixture references

These images are reference evidence; edit the HTML/CSS specimens to change the design. The populated-workflow sidebar references were captured from an active native host on 2026-10-24 at 272 × 696 points (2×), matching the browser sidebar content size.

| Surface | Light | Dark |
|---|---|---|
| sidebar | [Light](../assets/references/screens/sidebar-light.png) | [Dark](../assets/references/screens/sidebar-dark.png) |
| sidebar, populated workflows | [Light](../assets/references/screens/sidebar-populated-light.png) | [Dark](../assets/references/screens/sidebar-populated-dark.png) |
| task-detail | [Light](../assets/references/screens/task-detail-light.png) | [Dark](../assets/references/screens/task-detail-dark.png) |
| task activity, start of feed | [Light](../assets/references/screens/task-activity-top-light.png) | [Dark](../assets/references/screens/task-activity-top-dark.png) |
| task activity, running | [Light](../assets/references/screens/task-activity-running-light.png) | [Dark](../assets/references/screens/task-activity-running-dark.png) |
| task activity, completed | [Light](../assets/references/screens/task-activity-completed-light.png) | [Dark](../assets/references/screens/task-activity-completed-dark.png) |
| task activity, failed | [Light](../assets/references/screens/task-activity-failed-light.png) | [Dark](../assets/references/screens/task-activity-failed-dark.png) |
| task activity, taken-over | [Light](../assets/references/screens/task-activity-taken-over-light.png) | [Dark](../assets/references/screens/task-activity-taken-over-dark.png) |
| task summary, completed | [Light](../assets/references/screens/task-summary-completed-light.png) | [Dark](../assets/references/screens/task-summary-completed-dark.png) |
| task summary, running | [Light](../assets/references/screens/task-summary-running-light.png) | [Dark](../assets/references/screens/task-summary-running-dark.png) |
| task summary, failed | [Light](../assets/references/screens/task-summary-failed-light.png) | [Dark](../assets/references/screens/task-summary-failed-dark.png) |
| task summary, empty | [Light](../assets/references/screens/task-summary-empty-light.png) | [Dark](../assets/references/screens/task-summary-empty-dark.png) |
| task summary, many-files | [Light](../assets/references/screens/task-summary-many-files-light.png) | [Dark](../assets/references/screens/task-summary-many-files-dark.png) |
| task summary, prompt | [Light](../assets/references/screens/task-summary-prompt-light.png) | [Dark](../assets/references/screens/task-summary-prompt-dark.png) |
| task summary, prompt-empty | [Light](../assets/references/screens/task-summary-prompt-empty-light.png) | [Dark](../assets/references/screens/task-summary-prompt-empty-dark.png) |
| task artifacts, populated | [Light](../assets/references/screens/task-artifacts-populated-light.png) | [Dark](../assets/references/screens/task-artifacts-populated-dark.png) |
| task artifacts, error | [Light](../assets/references/screens/task-artifacts-error-light.png) | [Dark](../assets/references/screens/task-artifacts-error-dark.png) |
| task artifacts, loading | [Light](../assets/references/screens/task-artifacts-loading-light.png) | [Dark](../assets/references/screens/task-artifacts-loading-dark.png) |
| task artifacts, unsupported | [Light](../assets/references/screens/task-artifacts-unsupported-light.png) | [Dark](../assets/references/screens/task-artifacts-unsupported-dark.png) |
| task artifacts, metadata-only | [Light](../assets/references/screens/task-artifacts-metadata-only-light.png) | [Dark](../assets/references/screens/task-artifacts-metadata-only-dark.png) |
| task artifacts, paged | [Light](../assets/references/screens/task-artifacts-paged-light.png) | [Dark](../assets/references/screens/task-artifacts-paged-dark.png) |
| task artifacts, expanded | [Light](../assets/references/screens/task-artifacts-expanded-light.png) | [Dark](../assets/references/screens/task-artifacts-expanded-dark.png) |
| approvals, pending | [Light](../assets/references/screens/task-approval-pending-light.png) | [Dark](../assets/references/screens/task-approval-pending-dark.png) |
| approvals, expanded | [Light](../assets/references/screens/task-approval-expanded-light.png) | [Dark](../assets/references/screens/task-approval-expanded-dark.png) |
| approvals, caller-owned | [Light](../assets/references/screens/task-approval-caller-owned-light.png) | [Dark](../assets/references/screens/task-approval-caller-owned-dark.png) |
| approvals, submitting | [Light](../assets/references/screens/task-approval-submitting-light.png) | [Dark](../assets/references/screens/task-approval-submitting-dark.png) |
| approvals, history | [Light](../assets/references/screens/task-approval-history-light.png) | [Dark](../assets/references/screens/task-approval-history-dark.png) |
| approvals, error | [Light](../assets/references/screens/task-approval-error-light.png) | [Dark](../assets/references/screens/task-approval-error-dark.png) |
| approvals, summary | [Light](../assets/references/screens/task-approval-summary-light.png) | [Dark](../assets/references/screens/task-approval-summary-dark.png) |
| approvals, expanded, panel bottom | [Light](../assets/references/screens/task-approval-expanded-bottom-light.png) | [Dark](../assets/references/screens/task-approval-expanded-bottom-dark.png) |
| approvals, caller-owned, panel bottom | [Light](../assets/references/screens/task-approval-caller-owned-bottom-light.png) | [Dark](../assets/references/screens/task-approval-caller-owned-bottom-dark.png) |
| approvals, submitting, panel bottom | [Light](../assets/references/screens/task-approval-submitting-bottom-light.png) | [Dark](../assets/references/screens/task-approval-submitting-bottom-dark.png) |
| approvals, history, panel bottom | [Light](../assets/references/screens/task-approval-history-bottom-light.png) | [Dark](../assets/references/screens/task-approval-history-bottom-dark.png) |
| parallel | [Light](../assets/references/screens/parallel-light.png) | [Dark](../assets/references/screens/parallel-dark.png) |
| workflow-editor | [Light](../assets/references/screens/workflow-editor-light.png) | [Dark](../assets/references/screens/workflow-editor-dark.png) |
| workflow-run | [Light](../assets/references/screens/workflow-run-light.png) | [Dark](../assets/references/screens/workflow-run-dark.png) |
| new-session | [Light](../assets/references/screens/new-session-light.png) | [Dark](../assets/references/screens/new-session-dark.png) |
| settings-general | [Light](../assets/references/screens/settings-general-light.png) | [Dark](../assets/references/screens/settings-general-dark.png) |
| settings-harnesses | [Light](../assets/references/screens/settings-harnesses-light.png) | [Dark](../assets/references/screens/settings-harnesses-dark.png) |
| menu-bar-popover | [Light](../assets/references/screens/menu-bar-popover-light.png) | [Dark](../assets/references/screens/menu-bar-popover-dark.png) |
| parallel group, mixed | [Light](../assets/references/screens/parallel-group-populated-light.png) | [Dark](../assets/references/screens/parallel-group-populated-dark.png) |
| parallel group, two lanes | [Light](../assets/references/screens/parallel-group-two-lanes-light.png) | [Dark](../assets/references/screens/parallel-group-two-lanes-dark.png) |
| parallel group, completed | [Light](../assets/references/screens/parallel-group-completed-light.png) | [Dark](../assets/references/screens/parallel-group-completed-dark.png) |
| parallel group, empty | [Light](../assets/references/screens/parallel-group-empty-light.png) | [Dark](../assets/references/screens/parallel-group-empty-dark.png) |

## Interaction coverage

The catalog supports screen/state/appearance deep links, navigation search, loaded-task filters and selection, detail tabs, follow-up fixtures, inspector disclosure, graph selection, node attempts, retained plan/sidebar, Graph/Parallel mode, summary expansion, 10-point node drag snapping, zoom, builder fields, validation feedback, harness/access level choices, settings toggles, and modal close/action feedback. All operations are local fixtures and reset on route/state/appearance change. They do not simulate filesystem, terminal, agent execution, workflow persistence, or native permission enforcement.

## Not applicable and approximation boundaries

- Raw events have no source-backed search, loading, or error presentation in this sheet; only supplied events, empty events, and unknown-event treatment are represented.
- Caller-owned requests have no Harflow approval buttons. Settled or expired approvals have no active response controls.
- MCP global approvals are free-text entries, not a per-tool checkbox permission picker.
- Turn limits apply to Claude and Vibe. Antigravity does not expose xhigh effort. Native harness catalogs may vary; this fixture catalog is fixed.
- Missing/deferred task records do not imply live composer or takeover availability. Terminal workflow states do not permit Pause/Cancel.
- Library, modal, settings, and menu-bar dimensions are independent native surfaces; they are intentionally shown within a catalog stage instead of stretched to the main window.
- Canvas connectors and ports are visual baseline specimens. Drag changes mock positions; connection creation, multi-selection, split-resize, native context menus, and complete graph editing semantics are not implemented.
- Some isolated states retain surrounding fixture context for comparison. They demonstrate a specific source-derived presentation rather than a complete runtime transition simulation.
- Native fixture captures are included under `assets/references/screens/` in both appearances: sidebar, task-detail, parallel, workflow-editor, workflow-run, new-session, settings-general, settings-harnesses, and menu-bar-popover. They render actual pinned SwiftUI views at 2× scale with isolated mock data. A capture-only test passed through the source package test runner. The composed main-window capture was unsuitable as a complete reference and is excluded.
- Transparent native material regions in isolated settings/menu/sidebar captures are not palette evidence. Browser materials and host window chrome remain approximations. The foundation captures are 2000 × 1560 and accompany a 220-test validation result. Reference images are inspectable evidence, not the editable UI.

## Verification status

JavaScript syntax and local asset/source path checks run during authoring. Browser route/interaction checks are recorded separately by the integrating agent. Representative native fixture comparisons cover the surfaces identified in the table. Unlisted variants are source-derived and have not received individual native image comparisons. Complete live-window fidelity, platform material rendering, and accessibility parity remain outstanding.

Task activity uses a dedicated renderer so shared Parallel and workflow activity fixtures remain independent. Native references use production preview activity rows at 926 × 696 points (2×); the taken-over reference is a running task with locked messages. The native window toolbar is outside these content captures. Its controls are represented in the catalog’s simulated titlebar; browser glass, host chrome, and text rasterization remain approximations. Existing example task names differ from the source capture fixture names. Preview rows in settled native captures retain their supplied completion marker; failed, timed-out, and cancelled catalog markers follow the source status mapping. The browser scrollbar thumb is visual; wheel and keyboard scrolling use the actual overflow region.

## Fixture behavior guards

Task selection uses stable fixture IDs and renders the corresponding backend, status, detail, and inspector. Structural workflow nodes do not fabricate task activity. MCP unsupported and busy states follow native control guards; blank approval entries cannot be added. Sheet bodies scroll within the fixed specimen so Advanced controls and final actions remain reachable.

Task Summary and Prompt use the same task-detail shell and pane renderers when opened from the catalog or selected as tabs. Native references render the real TaskDetailView with a supplied SummaryPaneModel at 926 × 696 points (2×). Metrics describe the current agent run; edited files describe reported edit tools across the conversation and are not a Git diff. Summary showcase states vary local metadata availability independently of task status. Native materials and text rasterization remain browser approximations.

The expanded-artifact reference injects the disclosure’s expanded state in an isolated scratch copy, then restores the source. It verifies native expanded layout, not a native end-to-end disclosure interaction. Other Summary and artifact references use unchanged production view composition with supplied mock data.

Approval references use production TaskDetailView, CallerApprovalPanel, and CallerApprovalCard at 926 × 696 points (2×). The isolated capture host initializes deterministic controller state and disables repository calls and polling; it does not change production layout. The native approval panel remains above the header on Activity, Summary, and Prompt. It reserves vertical space even when collapsed, and expanded request actions can require scrolling the panel. Bottom references show that overflow. Browser actions are local mock transitions, not real approval responses.

The approval design intentionally differs from native placement. Full request cards appear inline in Activity beside the blocked action, using the shared activity reading column. Summary and Prompt show a compact pending-request indicator that returns to and focuses the relevant Activity request. Settled requests do not retain a pending indicator. Inspection and decision guards remain source-backed; actions only change local fixtures.

This also removes a native layout defect: the production collapsed card is approximately 82 points tall while its panel reserves approximately 288 points at the reference window size. The website uses the Activity feed's existing scroll region instead of a separate panel scroll region; readable action details retain independent bounded scrolling when necessary. Native implementation of the new placement and the wasted-space fix is tracked in [HarflowMac #13](https://github.com/Harflow-Dev/HarflowMac/issues/13). The inline placement is exploratory until the finished design is reviewed.

The caller-owned state previews Mac approval responses through a future supported engine path, tracked in [HarflowMac #14](https://github.com/Harflow-Dev/HarflowMac/issues/14). It offers the shared inspected Approve once/Reject controls while retaining caller ownership. The separate caller-owned-legacy state remains read-only for unsupported engines. This is a local design capability, not current native or wire-contract support; request payloads cannot enable it.

Approval cards show the requested action in readable form rather than raw JSON or routine request metadata. Shell commands retain their exact text and supplied working directory; other inputs retain their labeled values. A nonblank supplied description appears separately, with no invented rationale when absent. Native parsing currently has no normalized description field, so the illustrated optional description is explicit exploratory fixture data. Full structured payloads remain internal to inspection and decision validation.

Parallel group references render production ParallelView and ParallelColumnView from the pinned native commit at 1200 × 696 points (2×), using supplied mixed, two-lane, completed, and empty fixtures. Native toolbar actions are outside these content captures and are represented in the simulated window titlebar. The isolated hosting window is resized after toolbar installation to preserve the requested content dimensions. The capture-only test passed through the guarded runner (one test, one suite); production sources were unchanged. Running elapsed values advance during native capture; the website uses a fixed fixture clock. Deferred mounting remains source-derived rather than individually captured.

The standalone parallel renderer is isolated from workflow Parallel fixtures. Its lanes retain a 420-point minimum, expand evenly when they fit, and keep independent activity scroll regions. Status-colored top strips, source-backed action labels, claim pills, outcome copy, and bounded result callouts follow the native references. Prompt and cancellation controls operate on local fixtures; cancellation confirms intent and reports the mock request without fabricating backend settlement. Task detail receives the selected lane identity, prompt, summary, and activity availability. Native button materials and status glyph rendering remain approximations.

Workflow editor comparisons render production WorkflowView and WorkflowLaunchSheet from the pinned native commit, with deterministic supplied preview models. Editor content is 1200 × 740 points (2×); the sheet capture uses a 760 × 740 host around its intrinsic 580-point content and serves as a component reference. Saved, implementation, retry connection, on-demand, child workflow, parallel boundary, empty graph, loading, and read failure states were captured in both appearances. Polling is stopped after appearance and validation text is supplied as settled fixture data. The guarded capture-only test passed (one test, one suite). The native 100% starter graph clips its End node at this viewport; the website retains the scrollable graph geometry. Preview model choices and caller-approval capabilities are deliberately limited. No production source was changed.

The generation, refinement, and Run launch sheets have separate native references. Refinement and Run were captured at their exact 580 × 650-point size (2×), with a fixed footer and scrolling form body. Builder conversation/proposal fixtures approximate injected task content; the native upper graph and lower task-pane topology remains authoritative.

New workflow editor comparison screenshots are intentionally kept outside Git. The capture evidence verifies the authoring pass but is not a runtime dependency of the design website.

Workflow-run comparisons render the production WorkflowView, graph, selected sidebar, and Parallel columns from the pinned native commit at 1200 × 740 points (2×), excluding the system titlebar. Fresh light/dark captures cover default, selected task activity, structural selection, on-demand calls, Parallel, completed, loading, and read failure. The isolated scratch host supplies deterministic immutable models and stops polling; production workflow sources are unchanged. The guarded capture-only run passed one test in one suite. Expanded summary behavior is source-derived because the isolated host did not expose its accessibility action for capture. Fresh reference screenshots remain outside Git.

The compact default workflow-run sidebar is an intentional proposal tracked in [HarflowMac #15](https://github.com/Harflow-Dev/HarflowMac/issues/15): 288-point preferred width for default content and 420 points when selected-node Activity replaces it in Graph. Parallel retains the default sidebar; returning to Graph restores the selected Activity presentation. Current native references use 420 points for both.

The [canonical product glossary](terminology.md) governs design copy; native implementation is tracked in [HarflowMac #16](https://github.com/Harflow-Dev/HarflowMac/issues/16). Native reference images and exact source provenance may retain prior wording. Public tool and CLI fields are not renamed by this copy pass.
