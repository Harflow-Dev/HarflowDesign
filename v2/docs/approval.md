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

## M04 native entry direction — 2026-11-05

The owner approved the M04 visual direction after requesting the bottom-left + task-options popover and a softer slim scrollbar. The final scrollbar uses the existing tertiary token at 72% for both standard and WebKit paths.

Approval covers all 24 `m04-proposal` states in Light and Dark: `shell`, `shell-collapsed`, `shell-narrow`, `composer-loading`, `composer-ready`, `composer-unqualified`, `composer-invalid`, `composer-starting`, `composer-refused`, `composer-unknown`, `advanced`, `advanced-closed`, `history-empty`, `history-loading`, `history-older`, `history-error`, `history-reconnecting`, `history-retained`, `runtime-checking`, `runtime-install-required`, `runtime-update-required`, `runtime-installing`, `runtime-failed` and `runtime-listing`.

Sources: `v2/scripts/screens-m04-proposal.js`, `v2/scripts/m04-proposal.js` and `v2/styles/m04-proposal.css`; behavior and scope are recorded in [m04-proposal.md](m04-proposal.md). Implementation citations must pin the eventual HarflowDesign commit containing these final files and the exact route/appearance. No future commit hash is asserted here.

This approval covers the visual direction and local interaction design. It does not establish native pixel fidelity, runtime qualification, engine version adoption, production capability enforcement, persistence policy acceptance, M03/M04 migration acceptance or permission to install, execute or publish runtime artifacts. Browser approximations and deferred native/runtime verification remain explicit.
