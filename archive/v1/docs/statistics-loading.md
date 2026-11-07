# Statistics loading — proposal for HarflowMac #41

Status: not approved. Preview `#statistics/loading/light`, `#statistics/loading/dark`, and the same paths for `empty`, `error`, `unsupported` and `refreshing`. Use the catalog width picker at 1000, 1200 and 1440 points.

This is the loading state for the existing Statistics overview. It does not redesign the chart, the ranked list, or the accounting specimens.

## What you see while the first projection loads

- The header stays real: "Statistics" and "Last 30 days · All repositories". It does not depend on the projection.
- The time range, Repository, Harness, Model and Measure controls are shimmer blocks in the control row's places. They are hidden from assistive technology. The handoff replaces those blocks with the real controls.
- The chart card and the ranked list are skeleton blocks in the overview's geometry: hero lines, legend, a 180-point plot with 30 placeholder bars, axis ticks, a ranking header, and four rows. The blocks are hidden from assistive technology and do not accept clicks.
- Each block is one placeholder shape. A single highlight travels inside that shape every 1.4 seconds, clipped to the shape. The chart bars use the same highlight. Nothing else sweeps across the plot. Reduce Motion keeps the blocks still in place and pulses their opacity instead. There is no spinner and no "Preparing statistics…" label.

## Handoff

The first result uses the approved loading handoff (`foundations/skeleton-crossfade`, [loading-handoff.md](loading-handoff.md)): 180 ms opacity crossfade, once. Reduce Motion swaps immediately. Later refreshes do not play it again.

| Outcome | What replaces the skeleton |
|---|---|
| Populated | The existing overview |
| Empty | "No finished work in this retained history. Choose another range or adjust the filters to look for retained finished work." The controls become enabled. There is no chart. |
| Error | "History read exceeded its time budget. No totals are shown." plus Retry. The controls become enabled. |
| Unsupported | "This engine does not provide statistics." No Retry. The controls become enabled. |

Empty is also the no-history outcome. A store with no finished work and a range with no finished work use the same sentence. There is not a second screen.

## Changing range or measure

The skeleton is only for the first projection, and for Retry when nothing is on screen yet.

Changing the range keeps the current chart and list. The range control and the header update immediately, and a status line says the figures are still the previous range (`statistics/refreshing` shows Last 7 days selected over the Last 30 days chart). When the new range arrives, the figures replace in place. There is no second skeleton and no second crossfade. If that refresh fails, the figures stay and the existing "Showing the last complete snapshot" line is used.

Changing Measure, the ranking, or a filter is local. The figures update immediately. No skeleton.

## Fidelity

The browser specimen approximates SwiftUI shimmer and the native control metrics. It does not prove the native crossfade, VoiceOver, or pixel fidelity.
