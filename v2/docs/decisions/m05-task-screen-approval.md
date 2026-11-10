# M05 task screen — scoped owner approval

Date: 2026-11-07.

The owner reviewed the proposal, whose latest commit was then HarflowDesign `a9c65fe` (it differs from `3e85e26` by one documentation sentence), and said, as relayed by the coordinating session:

> I already review the design. I think the recomended is good. lets continue with that

The coordinator had told the owner that anything without a recommendation would be taken as drawn. That reading is the coordinator's, and is recorded here as such.

The immutable reference is the commit containing this record, with these paths:

- `v2/scripts/screens-m05-proposal.js`
- `v2/scripts/m05-proposal.js`
- `v2/styles/m05-proposal.css`
- [Semantics and copy tables](m05-task-screen-proposal.md)

That commit changes approval labels and documents only. Specimen layouts and fixtures are unchanged from the reviewed commits. Decision boards are records, and options not chosen on them are not approved.

## Approved as recommended

| Gap | Decision |
| --- | --- |
| G-TASK-STATES | Retry is Continue in a new session. Stop in both the composer and overflow; the outcome word stays Cancelled. Settling is the reported status plus a notice |
| G-OVERFLOW | Takeover entry in overflow |
| G-DIFF | Tab count rule: sum of stored rows when every repository and scope is available and none hit the row limit, otherwise no number. Current turn with a turn picker |
| G-ADAPTIVE | Pane over the transcript at 1000 × 620 |
| G-PLATFORM | Option C: accepted title position with badge and meta adjacent |

## Approved as drawn

Unknown-outcome treatments, Stop dialog wording, overflow layout, top bar facts chips, turn count and resource card placement, Changes hierarchy and attribution, three-tab pane with facts groups at the top of Events, the 900-point split threshold, and the running and failed pane defaults.

## Conditions

- **"Status unavailable"** is approved for display only. It is not a task status and does not extend the closed status vocabulary.
- **The "Won't be stopped" list** stays, labelled as client-derived. The engine returns no such list.
- **Option C** still needs a real-window check at implementation, because native title width is unmeasured. Approval does not remove it. The same applies to the 900-point threshold.
- **Takeover** is human-only and ctl-only on the engine side. No state may imply an agent can reach it.

## Stays provisional, not approved

- `state-cancel-partial`: `cancel` has no canonical fixture and `contracts.md` does not specify its cascade fields. HarflowMCP issue 118 is open.
- `artifacts-populated`, `artifacts-page-error`, `artifacts-empty`, `artifacts-loading`, `artifacts-error`, and Artifacts content reached from any other state's pane: `task-artifacts` has no canonical fixture or capability string. The Artifacts tab's position in the pane is approved; its content is not.

`state-continue-refused` is approved, but relies on a chain-stop marker that is not on status or in `contracts.md`, so the app learns it only from the refusal.

## Routes

Approved, each with `/light` and `/dark` and both frames, under `m05-proposal/`:

- **G-TASK-STATES:** `state-running`, `state-stopping`, `state-cancelled`, `state-timed-out`, `state-settling`, `state-unknown-failed`, `state-unknown-done`, `state-owner-lost`, `state-unverified`, `state-launch-unknown`, `state-status-unavailable` (display only), `state-pending`, `state-taken-over`, `state-continue-starting`, `state-continue-started`, `state-continue-refused`, `state-failed`
- **G-OVERFLOW:** `overflow-running`, `overflow-settled`, `overflow-subtask`, `cancel-dialog`, `cancel-dialog-lineage`, `takeover-dialog`
- **Top bar content:** `topbar-facts`, `topbar-resource`, `topbar-minimum`
- **G-DIFF:** `changes-single`, `changes-multi`, `changes-multi-limited`, `changes-same-path`, `changes-row-states`, `changes-incomplete`, `changes-not-captured`, `changes-unmerged`, `changes-running`, `changes-zero`, `changes-no-repository`, `changes-text`, `changes-loading`, `changes-error`, `changes-turns`
- **Events tab:** `events-populated`, `events-page`, `events-page-error`, `events-not-started`, `events-loading`, `events-empty`, `events-error`
- **G-ADAPTIVE:** `adaptive-overlay`, `adaptive-split`, `adaptive-running-closed`, `adaptive-running-open`, `adaptive-failed-default`

Decision records, not pin targets: `overview`, `retry-options`, `stop-options`, `adaptive-options`, `platform-options`. Option C appears on `platform-options` and in every screen route above.

## Limits

Approval covers state meanings, direction and presentation. It does not establish native pixel fidelity, accessibility or VoiceOver, real scroll anchoring, runtime behaviour, performance or product acceptance. It does not authorize a push, a release or a contract change.

Read-only contract review by Codex: two rounds plus a narrow confirmation at `a9c65fe` that the last four fixes hold and introduced nothing new.

## Copy amendment — 2026-11-10

The owner approved these exact copy changes. This amendment is limited to wording; it does not approve additional states or features.

- `state-continue-started`: notice title **New session accepted**; body **The engine accepted the request. It may still be waiting for resources; acceptance does not mean completion.** The catalog title and description use acceptance language. `state-continue-started` and its route ID remain unchanged.
- `state-continue-refused`: replace **Nothing started. The engine said:** with **The engine refused this request.** The engine reason remains separate and unchanged.
- `state-launch-unknown`: retain its warning and **Check for a new task** action unchanged.
