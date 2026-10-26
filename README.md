# Harflow interface reference

Editable, offline design catalog derived from the current HarflowMac implementation. The baseline is source-derived. Approved directions are recorded in the screen inventory; approval does not establish native pixel fidelity.

HarflowDesign is maintained directly in Git. Open root `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. No dependencies, build, account, engine, or sibling checkout are required. Interactions use deterministic mock data. Screen and state changes reset specimens; appearance changes preserve the current specimen. The appearance preference is stored locally in this browser, independently of native app settings.

- `styles/tokens.css`: exact appearance-aware RGB values from HfUI.
- `styles/specimens.css`: shared specimen layouts and components.
- `styles/tasks.css`, `task-activity.css`, `task-summary.css`, `task-approvals.css`, `parallel.css`, `workflows.css`, `workflow-editor.css`, `workflow-editor-inspector.css`, `workflow-run.css`, `dialogs.css`, `state-recovery.css`, `sidebar-setup.css`, `sidebar-proposals.css`, `workflow-editor-proposals.css`, `council-activity.css`, `statistics.css`, `web.css`: screen-specific layouts.
- `styles/appearance.css`: shared native-derived appearance footer and connection indicator.
- `scripts/appearance.js`: local Light/Dark/System preference and independent catalog preview override.
- `styles/catalog.css`: reference website navigation and chrome.
- `scripts/registry.js`: screen families, states, and pinned source links. It also holds proposal metadata (`proposals`, `proposal`) from which the catalog caption, state picker suffix, search, and in-stage label for exploratory ticket proposals are derived.
- `scripts/workflow-connectors.js`: shared native-derived connection geometry for workflow editor and run.
- `scripts/tasks.js`, `task-activity.js`, `task-summary.js`, `task-approvals.js`, `parallel.js`, `workflows.js`, `workflow-editor.js`, `workflow-editor-inspector.js`, `workflow-run.js`, `dialogs.js`, `state-recovery.js`, `sidebar-setup.js`, `sidebar-proposals.js`, `workflow-editor-proposals.js`, `council-activity.js`, `workflow-launch-proposals.js`, `statistics.js`, `web.js`: editable screen specimens.
- `scripts/catalog.js`: local navigation and mock interactions.
- `docs/screen-inventory.md`: coverage, limitations, and source evidence.

Exploratory ticket proposals live in the proposal modules and are labelled in the catalog; the workflow setup and teardown proposals (#21, HarflowMCP#41) add Start and End inspector states and a Run sheet command review. Use **Preview appearance** to inspect Light or Dark without changing the app preference. **App preference** follows the footer’s Light/Dark/System selection; System follows the browser’s OS appearance. Selecting a footer mode clears the preview override and preserves drafts and selections. The `system` hash suffix means follow the app preference, including an explicitly selected Light or Dark mode. Only the preference mode is persisted.

Deep links use `#screen/state/theme`, for example `#workflow-run/selected-node/dark`. Search navigation to locate a screen or state. Task activity and Task summary open the same task-detail shell; its tabs share their Activity, Summary, and Prompt renderers. Approval requests explore inline Activity cards with pending indicators on Summary and Prompt. Use the catalog width picker for 1000, 1200, or 1440-point specimens and **Focus specimen** to hide navigation. Narrow viewports scroll the native-size specimens horizontally; browser zoom remains available for inspection.

See [DESIGN.md](DESIGN.md) for foundations and the design approval workflow, and [the product glossary](docs/terminology.md) for user-facing terminology.

Validation: run `node --test tests/catalog.test.mjs` with the sibling HarflowMac checkout available at the pinned commit. Previewing the catalog does not require that checkout.


## Hosting and CI

Cloudflare Pages publishes `main` through its GitHub integration. The intended production domain is `design.harflow.dev`. Pull requests receive Pages preview deployments. GitHub Actions runs JavaScript syntax checks and the standalone catalog suite on pushes to `main` and pull requests. The native source-path test remains a local check because it requires the sibling HarflowMac repository at its pinned commit.

Pages configuration: framework **None**, production branch **main**, output directory **dist**, and build command:

```sh
for file in scripts/*.js features/*.js; do node --check "$file" || exit 1; done; node --test --test-skip-pattern='^registry source links resolve in the pinned HarflowMac tree$' tests/catalog.test.mjs && mkdir -p dist && cp index.html dist/ && cp -R scripts styles assets docs features dist/
```

Set the Pages build environment variable `NODE_VERSION` to `24`. Pages reruns validation before publishing, so a failed catalog suite blocks that deployment independently of GitHub Actions. Only the staged site directories are published; repository metadata, tests, CI configuration, and local editor projects are excluded.

The exploratory [loading-handoff motion proposal](docs/loading-handoff.md) is previewable at
`#foundations/skeleton-crossfade/light` and `/dark`, with populated, empty, error and
Reduce Motion controls. Native implementation awaits approval.
