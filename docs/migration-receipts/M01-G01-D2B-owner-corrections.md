# D2B owner corrections and scoped approval

Date: 2026-11-05 (Asia/Jakarta). Base: `ba10e2d659dbdf6fbf759c9c9b6165fff9d9cd38`.

The owner accepted the D2B direction and requested spacing between Load earlier/New activity and a correct sidebar for future sessions. [Scoped approval record](../../v2/docs/d2b-observation-approval.md) preserves the exact feedback and scope. The previous proposal receipt/checks remain historical evidence, unchanged.

## Corrections

- History actions now use an 8px token gap with wrapping. Adjacent request actions use the same row treatment.
- The sidebar is derived from the approved v2 task/running or task/done template at mount time. Navigation icons, Resources, Statistics, Running, Recent work, Settings and the appearance footer no longer diverge in a simplified copy. Only the selected mock task title/destination are adapted; the legacy New task alias is normalized to the existing working catalogue route.
- System/Light/Dark selection is retained independently of resolved appearance. The underlying approved task templates are unchanged. A proposal-only auto-height catalogue wrapper accommodates the fixture controls plus the full native frame, so the restored footer is not clipped.
- The D2B family records scoped owner approval on 2026-11-05. The older global approval date and other families remain unchanged. The semantic packet and scoped record explicitly keep native qualification and product implementation separate.

## Validation

[Checks](M01-G01-D2B-owner-corrections-checks.json): final catalogue/v2/proposal tests passed **267/267**, no failures/skips. All JavaScript syntax and whitespace checks passed. Existing 24 semantic cases were retained; the new sidebar test checks canonical parity across snapshot states and appearance selections, including System and the working New task alias. Approval assertions now reflect the actual owner decision rather than stale exploratory status.

In-app browser checks covered Running and Done examples in Light/Dark at 1280×800 and 1000×620. History button spacing measured 8px in both sizes/appearances, layout wraps, one sidebar renders, and the footer stays inside both the native frame and the catalogue clipping frame. Its positive 248×41px dimensions, visible/flex styles and hit-tested Settings/appearance controls were checked in all eight combinations. System selection, Settings navigation and New task navigation were exercised; keyboard focus moves from Load earlier to New activity with a visible outline. The Settings route still shows its original 2026-11-03 approval metadata, proving the new date is scoped.

An existing browser-tab handle could not be reclaimed; a fresh tab in the same in-app browser completed verification. No tool installation or alternate UI mechanism was used. Browser/native fidelity limitations from the original packet remain.

Independent review adjudicated both owner comments as valid, caught the inherited New task alias regression, and reviewed its correction. Final source, visual and record accuracy review approved. An intermediate visual check exposed the catalogue’s fixed-height envelope clipping the footer despite its valid native-frame coordinates; that diagnostic is superseded by the outer-clip/hit-test checks and refreshed corrected Light/Dark captures. Leaving the proposal restores the standard 800px canonical frame. The reviewer accepts the scoped approval interpretation after the two requested corrections, without another permission loop.

The three tracker-owned plan/session/coverage paths are preserved and excluded. No product code, private-reader cutover, M04, runtime selection, installation, push or hosted publication is included. The corrected immutable source reference is the commit containing this record; native/product implementation requires its separate bounded assignment.
