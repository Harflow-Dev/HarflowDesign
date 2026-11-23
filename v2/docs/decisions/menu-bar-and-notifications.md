# Menu bar and notification states

Status: **Approved by the owner on 2026-11-23** ("approve with your pick", relayed by the coordinator), approved in the commit titled "Approve the harness settings and menu bar states". The states were drawn on 2026-11-23 in `344d56f` on the owner's decisions of the same day (N1, N2 and L2, with N3 confirmed) relayed by the coordinator, and on the missing-feature pattern of [engine-and-runtime.md](engine-and-runtime.md). The approval covers the design of the 33 routes below and amends the approved popover templates, which draw the elapsed time on the workflow row instead of "2/4" (owner answer 5); it does not establish native pixel fidelity or implementation, which stays open. The amendment is recorded under [Owner decisions of 2026-11-23](README.md#owner-decisions-of-2026-11-23) and [Amendments after approval](approval.md#amendments-after-approval).

The states draw what the popover shows when the runtime is not ready or a refresh fails, each stage of answering a question inside the popover, an engine that cannot report workflow questions, unavailable workflow status, the notification banners Harflow posts, and the notification permission rows of Settings → General.

## Source

HarflowMac at `27b722aa` and HarflowMCP at `6ef3c0c0`, read through git objects only. `MB` is `macos/HfFeatures/MenuBarFeature/Sources/MenuBarFeature/MenuBar`, `NY` is `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NeedsYou`, `R` is `macos/HfCore/HfRepository/Sources/HfRepository`.

- Popover (`MB/MenuBarView.swift`, `MenuBarVM.swift`): 380 × 560 (`HfRadius.swift:383-385`). Header title "Nothing running" or "N running", subline "harflow connected" while the list is healthy, else the connection line (`MenuBarVM.swift:122-124`; `TaskListRepositoryImpl.swift:583`, `TaskListRepository.swift:149`). "+" has the help text "New session" (`MenuBarView.swift:209-210`); the coordinator ignores a new-session request while the runtime is not ready. Sections: Needs you, Running, Recent, Workflows (`MenuBarView.swift:280-320`); the footer holds Open Harflow, Settings… and Quit (`:336-348`).
- Runtime not ready (`MenuBarVM.swift:455-523`): the install banner for an install stage reads "Preparing Harflow runtime…" with the detail "Preparing the exact paired runtime. This can take a few minutes."; a failed preparation reads "Harflow runtime preparation failed" with the detail "The managed runtime is unavailable. Try again to prepare it.", the failure message and "Try again". While the managed runtime is unavailable the banner is hidden and the red list error shows.
- Needs you section (`MB/MenuBarNeedsYou.swift:8-190`): "Needs you · N", rows with "Approval", "Question" or "Recovery", the run title, who started it, and Open; an approval row can decide in place ("Approve once", "Reject", "Submitting…", "Refresh"); a question or recovery row has an **Answer button that opens the item in the window** (`:130-132`, `didSelectNeedsYou`). "Show all N" opens the list. An engine that reports no workflow inputs shows "This engine version cannot report workflow questions here." (`:142-145`).
- Question outcomes (`NY/NeedsYouQuestion.swift:119-190`, `R/NeedsYou/NeedsYouModels.swift:215-255`): accepted settles the card as "Answered" with the answer; `interaction_already_answered` shows "Already answered by the caller" or "Answered in Harflow", the answer (with "Answer excerpt · " when shortened), the time and "Your saved draft"; `attention_checkpoint_stale` shows "This request changed. Review it again."; a workflow error ending "; caller is alive" shows "The caller is answering this again." with the saved draft; any other failure shows its message and keeps the draft. Only approvals have an uncertain outcome ("Delivery is unknown. The decision will not be retried."); questions have none. Submitting reads "Submitting…" with "Submitting your answer to the engine…" (`NY/NeedsYouDetailView.swift:116, :194`). An answer is at most 64 KiB; "Write an answer first." is the empty answer (`NeedsYouRepositoryImpl.swift:246`).
- Workflow status (`MB/WorkflowMenuBarStatusVM.swift:152`): any refresh failure reads "Workflow status unavailable".
- Notifications (`R/NeedsYouNotifier/InteractionEventNotifier.swift:118-159`, `interaction-events.v1`): rows of kind question, approval, recovery or task, and state pending, answered, completed or failed. Titles: "Done: <title>" or "Failed: <title>" for a task; "Approval: <title>", "Question: <title>" or "Recovery: <title>" while pending; "Answered in Harflow" or "Answered by the caller" with the event title as subtitle once answered. The body is the first 512 characters, the thread is `harflow-interactions`, and the click carries `workflow_run_id` or `task_id`. The app asks for `[.alert, .sound]` at the first delivery and reads no status; a denied permission drops the notification silently (`NotificationCentering.swift`, `FinishNotifierImpl.swift:37`). The legacy notifiers start when the engine answers `unsupportedCommand` (`InteractionEventNotifier.swift:110-114`). The notifier `InteractionEventNotifier` never removes a notification; the legacy `NeedsYouNotifierImpl.swift:96` does remove one, and N2 removes that notifier.
- Menu bar answering is not in the app: `stage2-gate.md:116-119` says direct inline submission in the menu bar needs an approved design. The approved popover draws the question card with an inline field and **Answer**; the label is kept.

## Owner decisions applied

| Decision | Applied here |
| --- | --- |
| N1 | Notifications have no action buttons. A click opens the task for a finished or failed task, and the Needs you item for an approval, a question or a recovery. A notification is removed once its request is answered. |
| N2 | The legacy notifiers are removed. With no fallback, a runtime without `interaction-events.v1` sends no notifications (`settings/notifications-unavailable`). |
| N3 | Confirmed: the existing not-found states cover a click that lands on a task or run that has been pruned. No new drawing. |
| L2 | Only task links, `harflow://task/<id>`, are handled. |

## States

All routes support light and dark and are approved 2026-11-23. Every popover state has a `-minimum` twin at 1000 × 620 (group Minimum window, self-rendered with the minimum window popover treatment: 380 × 560, header and footer fixed, the sections between scrolling). The notification specimen and the Settings rows are not drawn at the main window frames (owner answer 6).

| State | Route | Status | Draws |
| --- | --- | --- | --- |
| Runtime setup needed | `menu-bar/runtime-setup` | Approved 2026-11-23 | "+" disabled; a card "Finish setting up Harflow to see your work." with Open Harflow (owner answer 2). Subline, card and "+" being disabled are design. Derived from `menu-bar/empty`. |
| Runtime being prepared | `menu-bar/runtime-preparing` | Approved 2026-11-23 | The app's "Preparing Harflow runtime…" and its detail. The app's banner shows a busy indicator (`isBusy: true`, `MenuBarVM.swift:475`); leaving it out is a deliberate departure, not parity, because the approved runtime states draw none and runtime words are not task statuses. |
| Runtime setup failed | `menu-bar/runtime-failed` | Approved 2026-11-23 | The app's failure title and detail, a fixture failure line and Open Harflow (the app offers "Try again"). |
| Work could not be refreshed | `menu-bar/engine-call-failed` | Approved 2026-11-23 | A red dot, a note with the failed command and Retry; the rows are kept (the workflow row shows its elapsed time, answer 5). The same drawing stands for a contract refusal and a timeout (only the message differs). Derived from `menu-bar/busy-approve-once`. |
| Question · Typing an answer | `menu-bar/question-typing` | Approved 2026-11-23 | The approved card with text in the field. |
| Question · Submitting | `menu-bar/question-submitting` | Approved 2026-11-23 | Field disabled, "Submitting…", "Submitting your answer to the Harflow runtime…" (wording changed, see Owner answers). |
| Question · Answered | `menu-bar/question-answered` | Approved 2026-11-23 | The approved settled card (title "Answered", then the answer and the app's settled note "Nightly dependency audit no longer needs you.", where the run title is fixture text); no action. |
| Question · Already answered | `menu-bar/question-already-answered` | Approved 2026-11-23 | The approved settled card: "Already answered by the caller", the answer, the time and "Your saved draft". |
| Question · No longer current | `menu-bar/question-stale` | Approved 2026-11-23 | The settled card with "This request changed. Review it again.", "Your saved draft" and Open: the read-only path of the shared failed and stale branch (`NeedsYouQuestion.swift:158-166`); while the request is still observed the app shows the message as an error under the field and keeps the draft in the field. |
| Question · Answer failed | `menu-bar/question-failed` | Approved 2026-11-23 | The message under the field, Answer, and Open in Harflow (design). |
| Question · Delivery unknown | `menu-bar/question-unknown` | Approved 2026-11-23 | "Harflow couldn't confirm your answer was received. Open Needs you to check." (design) and Open Needs you (owner answer 4: a state). |
| Question · Caller answering again | `menu-bar/question-caller-returned` | Approved 2026-11-23 | "The caller is answering this again." and the saved draft. |
| Needs you · Questions unsupported | `menu-bar/needs-you-unsupported` | Approved 2026-11-23 | The task approval stays; the app's line replaces the question card. |
| Workflows · Status unavailable | `menu-bar/workflow-status-unavailable` | Approved 2026-11-23 | A Workflows section with "Workflow status unavailable". |
| Notification banners | `notifications/banners` | Approved 2026-11-23 | Five banners with no action buttons. Design-originated, not derived from an approved template. |
| Notifications · Not asked yet, Off in System Settings, Allowed, Runtime missing a feature | `settings/notifications-not-requested`, `settings/notifications-denied`, `settings/notifications-allowed`, `settings/notifications-unavailable` | Approved 2026-11-23 | One row added to the Behaviour group of General (group "Notifications"); the two switches are disabled when notifications cannot be sent. `notifications-unavailable` is design-originated, not derived from an approved state, and follows the approved missing-feature pattern (owner answer 7) of [engine-and-runtime.md](engine-and-runtime.md#the-missing-feature-pattern). |

Every popover state that draws the Running section shows the workflow row with its elapsed time ("06:31"), as the amended approved `menu-bar/busy-approve-once` does (owner answer 5). The question card is rebuilt from the same markup as the approved card, and the module throws if a rebuild differs from the approved `menu-bar/busy-approve-once`. The button label stays "Answer" (the Mac Needs you card says "Send answer"; the approved popover says "Answer").

## Notification click destinations and removal

| Notification | A click opens |
| --- | --- |
| Done or Failed | The task. Today `content()` sets `workflow_run_id` before `task_id` (`InteractionEventNotifier.swift:155-159`), so a task event that carries a run id opens the run. |
| Approval, Question or Recovery | The Needs you item (owner N1). Today the click selects the workflow run or the task named in its `userInfo`. |

A pending notification is removed once the request is answered, wherever it is answered (N1). `InteractionEventNotifier` never removes one today (the legacy notifier does, `NeedsYouNotifierImpl.swift:96`), and it posts "Answered in Harflow" or "Answered by the caller" as a new notification. The owner decided on 2026-11-23 (answer 1) that the "Answered…" notifications stop being posted: the pending notification is removed once the request is answered and nothing replaces it. This is an app change.

## Recommendations

1. Keep the popover's question answering to the approved card and its states, and open Needs you for anything the popover cannot settle (stale, failed, unknown, caller returned).
2. Draw the workflow row in the popover with the elapsed time and its canonical glyph with the accessible name "Workflow run, running", so the state does not rest on a step count. The approved popover drew the retired step count "2/4" on its workflow row; the owner's run top bar decision of 2026-11-20 replaced the step count with the elapsed time in the sidebar row, and the owner amended the popover row to match on 2026-11-23 (answer 5). A visible status word beside the glyph, which the first draft of this recommendation also proposed, was not part of the owner's answer and is not drawn.
3. Show the permission state next to the two switches, so a denied permission is not mistaken for a setting that does not work.

## Offered answers

A workflow question can carry offered answers (retry or switch). The popover has no way to show them and the approved card has a free text field only. They are not drawn: a question with offered answers is answered in the window (`NeedsYouQuestion.swift:106-113`, which accepts either an offered answer or free text, never both).

## Owner answers (2026-11-23)

The owner approved all 33 states on 2026-11-23 with these answers ("approve with your pick", relayed by the coordinator). They are numbered as the owner questions of the drawing were.

1. **The "Answered in Harflow" and "Answered by the caller" notifications stop being posted.** A pending notification is removed once the request is answered, wherever it is answered, and nothing replaces it. An app change.
2. **The not-ready popover offers Open Harflow**, as drawn, not a direct Install or Retry: setup happens in the window.
3. **The popover answers questions inline**, as the approved card draws it, with the stages drawn here. An app change: the Answer button of a question row opens the item in the window today (`MB/MenuBarNeedsYou.swift:130-132`), and `stage2-gate.md:116-119` asked for an approved design, which this approval is.
4. **"Delivery unknown" is a state of a question**, as drawn. An app change: a question has no unknown outcome today and is never sent again by itself.
5. **The approved popover's workflow row shows the elapsed time instead of "2/4"**, consistent with the approved run top bar decision ([run-top-bar.md](run-top-bar.md)). The meta reads "06:31", the elapsed time the run top bar and sidebar row of that decision draw. The amendment reaches the approved popover template (`menu-bar/busy`, the base of the approval states), `menu-bar/busy-approve-once` and its 1000 × 620 twin, `menu-bar/approval-stale` and `menu-bar/answered-elsewhere`, and every state of this record that draws the Running section. The loading popover replaces the rows with placeholders and needs no change. The parallel group row ("1/3") is not part of the decision. Recorded under [Owner decisions of 2026-11-23](README.md#owner-decisions-of-2026-11-23) and [Amendments after approval](approval.md#amendments-after-approval).
6. **No 1000 × 620 drawings** of the notification specimen and the Settings rows.
7. **The missing-feature sentence is approved** for notifications ("This Harflow runtime can't send notifications. Update Harflow to use it."), with the pattern of the engine and runtime record.

Wording (follows engine and runtime answer 5): `needs-you-unsupported` reads "This Harflow runtime version cannot report workflow questions here." The app's current string is "This engine version cannot report workflow questions here." The same answer changes `question-submitting` from the app's "Submitting your answer to the engine…" to "Submitting your answer to the Harflow runtime…". Descriptions of the catalog entries say runtime where they said engine.

Refusal codes (follows engine and runtime answer 6): no state of this record draws "<message> (<code>)". A refusal shown under the question field in the popover shows its message there and its code on a detail line; the app prints "<message> (<code>)" today, so the change is an app change.

## What the app would change

- Popover, runtime not ready: show the card and Open Harflow instead of the red list error, keep "+" disabled, hide the sections.
- Popover, failed refresh: add the note with the failed command and Retry; keep the last known rows.
- Inline question answering: submit from the popover, with the stages above, instead of opening the item in the window (`MB/MenuBarNeedsYou.swift:130-132`). Questions have no uncertain outcome today: add one and never send a question again by itself.
- Notifications: remove the legacy notifiers (N2); make an interaction notification open the Needs you item (N1); remove a pending notification once it is answered; stop posting the "Answered…" notifications (owner answer 1); offer no action buttons.
- Settings → General: read the authorization status and show the permission row, with a link to System Settings; disable the two switches while notifications cannot be sent.
- Workflow row: draw the elapsed time and drop the step count (owner answer 5); the sidebar row of the Mac already shows elapsed time.
- Wording: replace the app's "This engine version cannot report workflow questions here." with "This Harflow runtime version cannot report workflow questions here." and "Submitting your answer to the engine…" with "Submitting your answer to the Harflow runtime…" (engine and runtime answer 5).
- Refusals: print a refusal's message without its code and show the code on a detail line, wherever the app prints "<message> (<code>)" (owner answer 6 of the engine and runtime states).
- Missing feature: when the engine advertises `interaction-events.v1` no longer, show the one-sentence form instead of falling back to the legacy notifiers.

## Engine needs

None. `interaction-events.v1` is advertised by the pinned runtime.

## Evidence and limits

- Read through git objects only. Mac and engine strings are quoted with citations above; wording marked design or fixture is not from either.
- Fixture text: the failed command, exit codes, the failure line, the answers, the draft, the times, the banner bodies and titles of the specimen.
- The workflow row's "06:31" is fixture text, the elapsed time drawn by the approved run top bar decision.
- The banners are a browser approximation of the system banner. Not verified in a native build: the popover geometry with the added notes, the system banner chrome, and what macOS shows for a denied permission.
- The settled note of `question-answered` is the app's `NeedsYouPresentationMapper.settledNote` (`NeedsYouPresentation.swift:204-212`) for the plain case; the variants for a handover, a shared answer and an approval without a run are not drawn.

## Files

`v2/scripts/states-menu-bar-notifications.js`, `v2/styles/menu-bar-notifications.css`, `v2/scripts/registry.js`, `v2/index.html`, `tests/menu-bar-notifications.test.mjs`, `tests/minimum-frame.test.mjs`, `tests/skeleton.test.mjs`, `tests/v2.test.mjs`, and, for the amendment of the approved popover, `v2/scripts/screens-menu-bar.js`.
