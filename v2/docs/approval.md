# Approval record

The Harflow Desktop redesign was approved by the owner on 2026-11-03 ("everything looks good").

Approved material:

- Harflow Desktop Redesign canvas, version 1793668079-d8d9: every screen and state in [screen-inventory.md](screen-inventory.md).
- Harflow Desktop design system, version 1793668064-9e04: the components family and the tokens in `v2/styles/`.

Owner-requested change after approval, 2026-11-03: workflow connections use the HarflowMac connector style (orthogonal routes with 10px rounded corners, an open chevron arrowhead, 1.5px tertiary stroke; loop-back edges dashed), with wider node spacing in the editor at 65% zoom. Current sources: canvas version 1793668765-556b and design system version 1793668753-d733.

Owner-requested change after approval, 2026-11-03: Edit with agent shows the builder conversation in a right-side activity pane instead of a bottom split (commit `34c3b0576e221d17b1096136db6c5d0fbb4c5000`, state `#workflow-editor/edit-with-agent`). The owner confirmed this amendment as approved during migration session S03.

The foundations, the brand book and the component guidelines (`foundations/`, `brand/` and the guideline text under each `components/` preview) come from the same approved design system. The design system was republished on 2026-11-04 as version 1793748053-8785 with unchanged content.

## Citing this design

Implementations cite the HarflowDesign commit that contains the specimen, the file path, and the state, for example:

- Commit: the HarflowDesign commit hash that last changed the file.
- Path: `v2/scripts/screens-workflow-editor.js` (the family's template file) or `v2/scripts/components.js`.
- State: `#workflow-editor/node-selected` (add `/light` or `/dark` to pin an appearance).

Record any deviation from the specimen next to the citation. Approval covers the design direction and the states listed here; it does not establish native pixel fidelity.
