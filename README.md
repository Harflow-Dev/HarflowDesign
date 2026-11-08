# Harflow design

HarflowDesign is the editable design website for Harflow: the interface reference for the redesigned Harflow Desktop client, its design system, and its screen states. It is maintained directly in Git and published at `design.harflow.dev`.

- `v2/` is the current interface reference, published at `design.harflow.dev/v2`. The site root opens it.
- `archive/v1/` is the archived v1 catalog of the HarflowMac implementation. It is kept as behavioral evidence and is no longer edited; see [archive/v1/README.md](archive/v1/README.md).

## Preview

Open `index.html` (it redirects to `v2/index.html`) or `v2/index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. Serve from this repository folder as the server root: served from a parent folder, the root redirector sends paths such as `/HarflowDesign/…` to `archive/v1`. No dependencies, build, account, engine, or sibling checkout are required, and everything works under `file://`. Interactions use deterministic mock data. The appearance preference (System, Light, Dark) is stored in this browser under `hf-v2-appearance`.

The root `index.html` is a redirector. With no hash it opens `v2/index.html`. With a hash it opens the archived catalog with that hash, because root hashes used to be v1 routes. On the hosted site it also forwards the old v1 paths (`/features/…`, `/scripts/…`, `/styles/…`, `/assets/…` and the v1 documents) to `archive/v1/`; `_redirects` maps the same paths for the hosting layer.

## The interface reference (`v2/`)

The catalog is organised by area. An area groups screens, a screen holds states, and states sit in ordered groups:

| Area | Screens |
| --- | --- |
| Start work | New task, Sidebar |
| Task | Task, Parallel group |
| Attention | Needs you, Menu bar |
| Workflows | Workflows, Workflow editor, Workflow run |
| Capacity and usage | Resources, Statistics |
| Settings and setup | Settings, App states, Harness runtime |
| Design system | Brand, Foundations, Components |

The default page, `#overview/areas`, lists every area and screen with its current state count and a link to its decision. Deep links use `#family/state[/view][/theme]`, for example `#workflow-editor/node-selected/dark`. A state may declare a view: the eight task transcript routes declare `events`, which opens the right pane on Events at load (`#task/transcript-observed/events/dark`). A view a state does not declare is dropped. Routes that existed before the restructure still open the same design; [v2/docs/route-map.md](v2/docs/route-map.md) lists each one.

The catalog names screens and components only. Milestone, proposal, approval and gap history is recorded in [v2/docs/decisions/](v2/docs/decisions/README.md), which indexes each decision with its status, who approved it and when, the recording commit, its routes and its files.

Each screen with a first load also has a Loading state drawn from its loaded screen: every Loading state is approved ([decisions](v2/docs/decisions/README.md#loading-states)).

Five provisional drafts draw loaded screens at the 1000 × 620 minimum window (`needs-you/waiting-minimum`, `parallel-group/lanes-minimum`, `workflow-run/parallel-minimum`, `workflow-editor/node-selected-minimum`, `menu-bar/busy-minimum`); they are not approved ([decisions](v2/docs/decisions/README.md#minimum-window-drafts)).

A design that the owner replaces is retired: it leaves navigation and its route opens the replacement (see "Retired routes" in the [route map](v2/docs/route-map.md)); the decisions record keeps the basis and the commits where the old design can be seen. A redraw that awaits approval is a provisional state, and the earlier layout stays listed with a link to it until the owner decides (`HFV2.pendingRedraw`, empty at present).

### Source layout

- `v2/index.html`, `v2/scripts/catalog.js`: the catalog shell, navigation, appearance and rendering.
- `v2/scripts/registry.js`: areas, screens and states, with each state's status and approval. `HFV2.describe(route)` resolves a route to its template, renderer, guide and approval line.
- `v2/scripts/route-aliases.js`: old routes and `HFV2.resolveRoute`. `v2/scripts/supersessions.js`: retired states, their redirects and the redraws awaiting approval.
- `v2/scripts/screens-*.js`: the screen templates, one script per screen, and the registration of states drawn by a renderer. `components.js`, `foundations.js` and `component-docs.js`: the design system pages and guidelines. `screens-overview.js`: the overview page.
- `v2/scripts/d2b-proposal.js`, `m04-proposal.js`, `m05-proposal.js`: renderers for the interactive task and entry states. The file names are historical; they do not appear in the catalog. `d2b-proposal.js` holds the transcript builders, the fixtures and the controller that `transcript-screen.js` uses; that file is the renderer of the task transcript states (registered in `screens-transcript.js`), which draws them inside the `m05-proposal.js` task screen frame through its optional hooks.
- `v2/scripts/skeleton.js`, `skeleton-specs.js`, `screens-loading-work.js`, `screens-loading-more.js`, `v2/styles/skeleton.css`: the loading states. A loading state renders the loaded screen it mirrors and replaces its data regions with shimmering blocks; the regions, patterns and chrome allowlists are in `skeleton-specs.js`.
- `v2/styles/tokens.css`, `bundle.css`: the design system tokens and components, copied as-is. `catalog.css` and the renderer stylesheets style the catalog chrome and those renderers.
- `v2/docs/`: [screen inventory](v2/docs/screen-inventory.md), [terminology](v2/docs/terminology.md), the [migration coverage ledger](v2/docs/migration-coverage.md), the [route map](v2/docs/route-map.md) and the [decisions](v2/docs/decisions/README.md).

The v2 site is self-contained: it imports nothing from the archive and uses only relative paths. Design direction and workflow are in [DESIGN.md](DESIGN.md). The user-facing glossary is [docs/terminology.md](docs/terminology.md); [v2/docs/terminology.md](v2/docs/terminology.md) covers the desktop redesign only.

## Validation

```sh
sh ci/build-site.sh
```

The script checks JavaScript syntax, runs every file in `tests/` and stages `dist/`. Two tests need the sibling HarflowMac checkout (at `../HarflowMac`, or set `HARFLOW_MAC_ROOT`): the registry source links at the pinned commit, and the bundled branding bytes. They run locally and are skipped by name in CI.

Pixel-level checks of the app frames are done with a headless browser outside the repository; they are not part of CI.

## Hosting and CI

Cloudflare Pages publishes `main` through its GitHub integration. The intended production domain is `design.harflow.dev`. Pull requests receive Pages preview deployments. GitHub Actions runs `sh ci/build-site.sh` on pushes to `main` and pull requests.

Pages configuration: framework **None**, production branch **main**, output directory **dist**, and build command:

```sh
sh ci/build-site.sh
```

The script stages `dist/` with the root page, `_redirects`, `archive`, `docs` and `v2`. The owner updates the build command in the Pages dashboard. Set the Pages build environment variable `NODE_VERSION` to `24`. Pages reruns validation before publishing, so a failed check blocks the deployment. Pages serves the root page, with status 200, for any path that does not exist; the root redirector forwards old v1 paths from there.

A saved v1 appearance preference lived at the old root origin path and may reset once in a local `file://` preview after the move. The v2 preference key is unchanged.
