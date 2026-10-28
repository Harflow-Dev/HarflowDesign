# Statistics implementation reference

The owner approved the existing Statistics overview on 2026-10-27:
`https://design.harflow.dev/#statistics/overview/system`.

The observed hosted assets match HarflowDesign commit `1b1d5d8` (also unchanged at
`1c32c2e`): `scripts/statistics.js` (SHA-256 prefix `57371d78ed13`) and
`styles/statistics.css` (`d973373f069e`). The approved reference is the original
overview layout and its demonstrated interactions, with the existing app surfaces
reused. Approval does not establish native pixel fidelity or production readiness.

The owner approved the daily chart hover card on 2026-10-28:
`https://design.harflow.dev/#statistics/chart-hover/system`. The hosted assets match
HarflowDesign commit `7c66c63`: `scripts/statistics.js` (SHA-256 prefix
`adba2f5aca88`) and `styles/statistics.css` (`7479484f44a1`). It replaces the
per-bar tooltip: the card shows the day's date with weekday, its total, the
workflow-run and task values for the selected measure, "Known qualified usage
only" for Usage, and "No finished work" on an empty day. It floats over the chart
without changing its layout, follows the pointer over full-height day columns,
highlights the hovered day, and hides when the pointer leaves. Pinning on the
highest-total day is a specimen affordance for review, not native behavior.
Keyboard access is not part of the approval.

The separate `accounting-*` specimens introduced at `f9e14a1` remain unapproved
exploration. They are not the native implementation's visual reference.

## Agreed metric behavior

- Select work by the local calendar day it started, within the selected 7, 30 or
  90 days. Include finished successful, failed and cancelled work; exclude active
  work from totals and averages.
- Count each initial task execution, retry and resume once. Messages and repeated
  accounting snapshots are not additional executions.
- Normalize input, output, cache-read and cache-creation categories within each
  harness adapter. A comparable token total requires evidence that its categories
  do not overlap. Missing or unqualified usage is unavailable, not zero, and
  aggregates disclose coverage.
- Group and filter by requested model. Missing requested identity is Unknown;
  configured or observed identity does not silently replace it. The control is
  labelled Requested model.
- Harness/model-filtered time sums the matching executions and is labelled
  Execution time. Unfiltered workflow time retains root wall-clock duration;
  parallel execution sums can exceed that duration.
- Exclude explicitly recorded user-wait intervals. Do not infer waits from quiet
  output. Historical durations without reliable wait evidence are labelled as
  elapsed time that may include user waits. Gaps between separate task/resume
  executions are excluded naturally.

## Delivery boundary

Implement existing designed screens and demonstrated disclosures. Placeholder
full-list destinations and new contextual entry points are outside the initial
scope. Loading, empty, unsupported-engine and read-error states reuse established
native patterns. No additional Statistics redesign is required.

The engine owns durable accounting, qualification and bounded public queries.
The Mac consumes those contracts and preserves unsupported/unavailable states on
older engines. Runtime publication, installation and application engine pairing
are separate from local source implementation.
