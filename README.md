# Harflow interface reference

Editable, offline design catalog derived from the current HarflowMac implementation. This is a source-derived baseline, **not an approved design or a pixel-verified reproduction**.

Open this checkout with the desktop app’s **Open folder** action and preview root `index.html`. You can also open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. No dependencies, build, account, engine, or sibling checkout are required. All interactions use deterministic mock data and reset when the screen, state, or appearance changes.

- `styles/tokens.css`: exact appearance-aware RGB values from HfUI.
- `styles/specimens.css`: shared specimen layouts and components.
- `styles/tasks.css`, `workflows.css`, `dialogs.css`: screen-specific layouts.
- `styles/catalog.css`: reference website navigation and chrome.
- `scripts/registry.js`: screen families, states, and pinned source links.
- `scripts/tasks.js`, `workflows.js`, `dialogs.js`: editable screen specimens.
- `scripts/catalog.js`: local navigation and mock interactions.
- `docs/screen-inventory.md`: coverage, limitations, and source evidence.

Deep links use `#screen/state/theme`, for example `#workflow-run/selected-node/dark`. Search navigation to locate a screen or state. Use the catalog width picker for 1000, 1200, or 1440-point specimens and **Focus specimen** to hide navigation. Narrow viewports scroll the native-size specimens horizontally; browser zoom remains available for inspection.

See [DESIGN.md](DESIGN.md) for foundations and the design approval workflow.

Validation: run `node --test tests/catalog.test.mjs` with the sibling HarflowMac checkout available at the pinned commit. Previewing the catalog does not require that checkout.
