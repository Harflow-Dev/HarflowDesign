# D2B observation design — scoped owner approval

Date: 2026-11-05 (Asia/Jakarta).

The owner reviewed the M01-G01-D2B design at `ba10e2d659dbdf6fbf759c9c9b6165fff9d9cd38` and said:

> looks good. only one thing. the load earlier + new activity show button have no spacing. and minor: the side bar is wrong, might make this confusing for fresh session

This accepts the bounded observation-state direction with two requested corrections. The corrected reference:

- Uses an 8px token gap and wrapping for adjacent history actions, including Load earlier and New activity. Adjacent request actions use the same layout.
- Reuses the approved v2 `task/running` or `task/done` sidebar rather than maintaining a simplified parallel sidebar. Canonical navigation, icons, Running/Recent work, Settings and appearance controls remain intact; the current fixture's selected task title and destination are adapted. The legacy New task catalogue alias is normalized to the existing `new-task/default` route so navigation remains operable.

The immutable corrected reference is the commit containing this record, with these paths:

- `v2/scripts/screens-d2b-proposal.js`
- `v2/scripts/d2b-proposal.js`
- `v2/styles/d2b-proposal.css`
- [Semantic state table and bounded implementation handoff](d2b-observation-proposal.md)

Approved routes are `d2b-proposal/observed`, `loading`, `partial`, `unavailable`, `integrity-failed`, `reconnecting`, `capacity` and `events`, with Light/Dark and the documented fixture variants. The catalogue carries this family's scoped 2026-11-05 approval; it does not inherit the older global 2026-11-03 approval date. The historical pre-approval receipt and global approval/inventory files remain unchanged.

Approval covers the proposed state meanings, direction and corrected presentation. It does not establish native pixel fidelity, accessibility/VoiceOver, real streaming/runtime behavior, performance or product acceptance. It does not authorize starting D2B production implementation, M04, installation, runtime selection, publication or a push. Both existing private Mac readers remain unchanged until a separate bounded implementation assignment.

The tracker-owned coverage ledger is not edited by this correction. Proposed disposition: D2B design direction approved with the two requested corrections applied; native and production cutover acceptance remain outstanding.
