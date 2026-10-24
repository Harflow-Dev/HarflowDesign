# Preferences proposal

`preferences.html` is an exploratory, standalone proposal for usage-ranked agent/model choices and an app-wide Light, Dark, or System appearance preference in the main-window header. It is not approved for implementation. The initial appearance follows System; the browser preview responds to `prefers-color-scheme`. A selected value may be remembered in this page's local storage when the browser permits it.

Open the file directly or link to it from the catalog. It imports the shared semantic palette at the exact relative path `../styles/tokens.css`; all scripts and styles are local. No build, network access, backend, or package installation is required.

The controls outside the specimen select New Session, Orchestrator, or Workflow node; populated/tied/loading/no-history/error fixtures; and two deterministic ranking samples. They update visible agent/model ordering while preserving explicit selections across ranking-sample or orchestrator changes. In the Workflow node fixture, the configured orchestrator agent appears first once, and its exact provider-qualified model is promoted only when supported for the selected agent. That compatible node model leads the menu, with `Default` still available; other menus keep `Default` first. Loading and catalog errors disable unavailable pickers; no-history retains available choices in stable alphabetical order. Browser controls approximate native menus and do not implement a native surface.

Usage ranking is proposed as a shared lifetime count of successful submissions to New Session and the effective workflow orchestrator/builder choices, starting when the feature ships. Counts in Sample A and Sample B are invented only to demonstrate ranking changes and stable explicit selections. Workflow definitions alone do not establish that an agent or model ran. The page does not claim actual usage analytics. The second-window preview follows Light, Dark, or the browser's System appearance but approximates a native New Session sheet, system materials, and window controls. Persisted page appearance has no native app effect.

## Source basis

Pinned HarflowMac revision `079281e72da37145f0de4c7d901a5a1864fc6800`:

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Coordinator/MainWindowNavigationView.swift` — split sidebar/detail composition, shared sheet presentation, and 1000 × 620 point minimum window.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NewSession/NewSessionView.swift` — New Session sheet fields, agent/model controls, and explicit Default model choice.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowAgentEditor.swift` — workflow candidate backend/model controls, backend-dependent model availability, and fallback candidate structure.

The specimen approximates a coherent main-window sidebar and task detail with a labelled, keyboard-operable Light/Dark/System segmented control and titlebar actions at the 1000-point minimum width. The appearance setting, usage ranking, ranking samples, and second-window specimen are exploratory proposals; they are not represented as existing native behavior or an approved design.
