# Design foundations and workflow

## Baseline

Source: HarflowMac commit `7fbed912b61094f2ee427a7d9be76a026767a61e`. This catalog translates current SwiftUI composition into editable browser specimens. It does not establish design approval or full-screen pixel fidelity.

Semantic RGB values are extracted directly from HfUI `Style/Palette.swift`, including harness colors. Native type sizes are 11, 12, 13, 14, 15, 18, and 22 points. Browser CSS pixels approximate points at 100% zoom. Shared radii are card 12, row/button 8, panel 16, and sheet 20. Spacing follows the native 2–28 point scale. Disclosure motion is 200 ms and arrival motion 180 ms; reduced motion follows the system browser preference.

The system font stack approximates SF. Native materials, SwiftUI forms, split handles, SF Symbols, platform menus, directory pickers, window controls, and text rasterization remain browser approximations. Workflow symbols use local SF Symbol exports. Other icons and platform controls remain approximations. Decorative window dots do not operate the host window. Canvas drag is a mock positional interaction; it does not author engine workflow contracts.

## Product terminology

Use [the canonical glossary](docs/terminology.md) for UI copy, accessibility labels, fixtures, and documentation. Harness identifies execution tools; Agent identifies participants; Node identifies workflow graph units. Public field names remain unchanged by design copy edits.

## Editing and approval

Edit shared foundations before changing individual specimens. Keep catalog navigation independent of app layout. Use source-backed loading, empty, error, and interaction states; document combinations that do not exist in the current implementation. Fixtures must remain deterministic and contain no user data.

New directions are exploratory until explicitly approved. Record an approved design using the HarflowDesign commit, file path, and screen/state/appearance. Product implementation should cite that exact reference and identify deviations. Compare full native screens before claiming pixel fidelity.

## Evidence

The Foundations / Native reference state links local HfUI rendering-test captures in both appearances (2000 × 1560; 220 tests passed in the source validation run). These validate native foundation references, not every catalog screen. Native fixture captures of the sidebar, task content, parallel view, workflows, session form, settings, and menu popover are included in `assets/references/screens/` for comparison. These are deterministic renders of pinned source views, not captures of a live user session. Current coverage and limitations are tracked in [screen-inventory.md](docs/screen-inventory.md).

## Loading handoff motion proposal

HarflowMac #20 is explored in [loading-handoff.md](docs/loading-handoff.md) and
`#foundations/skeleton-crossfade/light` / `dark`. Proposed timing is the existing
180 ms ease-out arrival, with an instant Reduce Motion swap, retained selection identity,
and a documented native sidebar exception. This direction is exploratory pending approval;
inline content preserves its natural layout, including omission of an empty Files edited section.
