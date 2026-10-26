# Loading handoff motion — proposal for HarflowMac #20

Status: approved by the owner on 2026-10-26. Reference proposal: `9d3916c`.
Approved states: `foundations/skeleton-crossfade/{light,dark}`, with populated,
empty and error outcomes and system/full/reduced motion variations.

Preview `#foundations/skeleton-crossfade/light` and
`#foundations/skeleton-crossfade/dark`. Replay loading, choose populated/empty/error,
change the presentation-only Reduce Motion override, and update the resolved content.
These are reference variations of existing outcomes, not new product screen states.

## Proposed rule

- Use the existing `HfMotion.arrival`: 180 ms ease-out, opacity only.
- Prepare the result before starting the handoff. Fade the skeleton from opacity 1 to 0
  while the result goes from 0 to 1 over the same interval. Do not compound this with
  an incoming `hfFadeIn()` or transform.
- Skeleton and result share the allocated viewport. Keep the outgoing skeleton out of
  layout once the result owns the container, so retiring it cannot cause a second jump.
  Do not animate size, position, padding, scroll anchors or pagination.
- Preserve natural intrinsic layout. In particular, available-empty Files edited keeps
  its existing omission. Do not invent an empty message or reserve permanent whitespace.
  A semantic change in inline content height is distinct from transition-driven motion;
  the no-shift guarantee applies to the handoff in an already allocated viewport.
- Reveal once for a retained selection identity. Streaming, pagination, appearance
  changes, viewport exit/reentry and reappearance do not restart it. A later loading
  regression uses the existing state behavior without another fade.
- One boundary owns each visible handoff. Nested deferred screens and feed/lane
  handoffs must not multiply their opacities or restart mounted content and leases.
- Reduce Motion swaps immediately. Resolve the explicit `hfReduceMotionOverride`
  before the system preference. Native fixtures that force reduced motion stay deterministic.
- The skeleton is decorative, inaccessible and never hit-testable. Prepared transparent
  content is also unavailable to interaction and accessibility; it becomes available as
  the resolved handoff begins. Loading, empty and error outcomes use the same rule.

## Native sidebar exception

The sidebar removes one diagnostic skeleton entry and inserts unrelated native item rows.
Those rows already participate in disclosure, fading tombstones, measured heights,
selection and accessibility suppression. Preserve that pipeline instead of retaining
removed hosting cells or adding a competing list overlay. Native sidebar skeleton removal
therefore remains immediate; its existing real-row presentation remains unchanged.

## Source evidence and fidelity

Baseline for this proposal: HarflowMac `2e2d3c200cc5bfb751763f8ff96e984d7dbfa96a`.
Read `HfUI/Style/HfMotion.swift`, `HfUI/Component/DeferredContent.swift`,
`SummaryPaneView.swift`, and `SidebarListReconciler.swift` for the timing, frame gate,
empty-section behavior and native reconciliation boundary.

The browser fixture uses a fixed 264-pixel sample viewport and cheap mock content.
That dimension is not a native layout token. CSS compositing approximates SwiftUI;
it does not prove native first-frame gating, lifecycle, performance or pixel fidelity.
