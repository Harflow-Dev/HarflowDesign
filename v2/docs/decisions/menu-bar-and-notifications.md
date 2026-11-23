# Menu bar and notification states

Status: **Provisional, not approved.** Drawn on 2026-11-23 on the owner's decisions of the same day (N1, N2 and L2, with N3 confirmed) relayed by the coordinator, and on the missing-feature pattern of [engine-and-runtime.md](engine-and-runtime.md). Nothing here is approved until the owner decides, and no approved state is amended: the approved `menu-bar/busy-approve-once` and `menu-bar/empty`, and `settings/general`, stay as they are.

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

All routes support light and dark. Every popover state has a `-minimum` twin at 1000 × 620 (group Minimum window, self-rendered with the minimum window popover treatment: 380 × 560, header and footer fixed, the sections between scrolling). The notification specimen and the Settings rows are not drawn at the main window frames (owner question 6).

| State | Route | Draws |
| --- | --- | --- |
| Runtime setup needed | `menu-bar/runtime-setup` | "+" disabled; a card "Finish setting up Harflow to see your work." with Open Harflow. Subline, card and "+" being disabled are design. Derived from `menu-bar/empty`. |
| Runtime being prepared | `menu-bar/runtime-preparing` | The app's "Preparing Harflow runtime…" and its detail. The app's banner shows a busy indicator (`isBusy: true`, `MenuBarVM.swift:475`); leaving it out is a deliberate departure, not parity, because the approved runtime states draw none and runtime words are not task statuses. |
| Runtime setup failed | `menu-bar/runtime-failed` | The app's failure title and detail, a fixture failure line and Open Harflow (the app offers "Try again"). |
| Work could not be refreshed | `menu-bar/engine-call-failed` | A red dot, a note with the failed command and Retry; the rows are kept. The same drawing stands for a contract refusal and a timeout (only the message differs). Derived from `menu-bar/busy-approve-once`. |
| Question · Typing an answer | `menu-bar/question-typing` | The approved card with text in the field. |
| Question · Submitting | `menu-bar/question-submitting` | Field disabled, "Submitting…", "Submitting your answer to the engine…". |
| Question · Answered | `menu-bar/question-answered` | The approved settled card (title "Answered", then the answer and the app's settled note "Nightly dependency audit no longer needs you.", where the run title is fixture text); no action. |
| Question · Already answered | `menu-bar/question-already-answered` | The approved settled card: "Already answered by the caller", the answer, the time and "Your saved draft". |
| Question · No longer current | `menu-bar/question-stale` | The settled card with "This request changed. Review it again.", "Your saved draft" and Open: the read-only path of the shared failed and stale branch (`NeedsYouQuestion.swift:158-166`); while the request is still observed the app shows the message as an error under the field and keeps the draft in the field. |
| Question · Answer failed | `menu-bar/question-failed` | The message under the field, Answer, and Open in Harflow (design). |
| Question · Delivery unknown | `menu-bar/question-unknown` | "Harflow couldn't confirm your answer was received. Open Needs you to check." (design) and Open Needs you. |
| Question · Caller answering again | `menu-bar/question-caller-returned` | "The caller is answering this again." and the saved draft. |
| Needs you · Questions unsupported | `menu-bar/needs-you-unsupported` | The task approval stays; the app's line replaces the question card. |
| Workflows · Status unavailable | `menu-bar/workflow-status-unavailable` | A Workflows section with "Workflow status unavailable". |
| Notification banners | `notifications/banners` | Five banners with no action buttons. Design-originated, not derived from an approved template. |
| Notifications · Not asked yet, Off in System Settings, Allowed, Runtime missing a feature | `settings/notifications-not-requested`, `settings/notifications-denied`, `settings/notifications-allowed`, `settings/notifications-unavailable` | One row added to the Behaviour group of General (group "Notifications"); the two switches are disabled when notifications cannot be sent. `notifications-unavailable` is design-originated, not derived from an approved state, and depends on the missing-feature pattern of [engine-and-runtime.md](engine-and-runtime.md#the-missing-feature-pattern) being approved. |

The question card is rebuilt from the same markup as the approved card, and the module throws if a rebuild differs from the approved `menu-bar/busy-approve-once`. The button label stays "Answer" (the Mac Needs you card says "Send answer"; the approved popover says "Answer").

## Notification click destinations and removal

| Notification | A click opens |
| --- | --- |
| Done or Failed | The task. Today `content()` sets `workflow_run_id` before `task_id` (`InteractionEventNotifier.swift:155-159`), so a task event that carries a run id opens the run. |
| Approval, Question or Recovery | The Needs you item (owner N1). Today the click selects the workflow run or the task named in its `userInfo`. |

A pending notification is removed once the request is answered, wherever it is answered (N1). `InteractionEventNotifier` never removes one today (the legacy notifier does, `NeedsYouNotifierImpl.swift:96`), and it posts "Answered in Harflow" or "Answered by the caller" as a new notification. Owner question 1 asks whether the "Answered…" notification should stop being posted: it is no longer needed if the pending one is removed.

## Recommendations

1. Keep the popover's question answering to the approved card and its states, and open Needs you for anything the popover cannot settle (stale, failed, unknown, caller returned).
2. Draw the workflow row in the popover with a visible status word from the vocabulary ("Running", "Needs you") beside its canonical glyph, and the accessible name "Workflow run, running", so the state does not rest on the glyph or on a step count alone. The approved popover still draws the retired step count "2/4" on its workflow row; the owner's run top bar decision of 2026-11-20 replaced the step count with the elapsed time in the sidebar row. This record does not amend it (owner question 5).
3. Show the permission state next to the two switches, so a denied permission is not mistaken for a setting that does not work.

## Offered answers

A workflow question can carry offered answers (retry or switch). The popover has no way to show them and the approved card has a free text field only. They are not drawn: a question with offered answers is answered in the window (`NeedsYouQuestion.swift:106-113`, which accepts either an offered answer or free text, never both).

## Owner questions

1. Stop posting the "Answered in Harflow" and "Answered by the caller" notifications, now that a pending notification is removed once answered?
2. Open Harflow or a direct Install and Retry in the not-ready popover? The record recommends Open Harflow, because setup happens in the window.
3. Should the popover answer questions at all, or keep the app's behaviour of opening the item? The approved card draws inline answering; the app opens Needs you (`stage2-gate.md:116-119` asks for an approved design).
4. Should an unknown delivery of a question be a state? The app has none and never sends a question again by itself.
5. Amend the approved popover workflow row (the "2/4" meta and the status word)?
6. Draw the notification specimen and the Settings rows at 1000 × 620?
7. Approve the missing-feature sentence for notifications (the pattern of the engine and runtime record)?

## What the app would change

- Popover, runtime not ready: show the card and Open Harflow instead of the red list error, keep "+" disabled, hide the sections.
- Popover, failed refresh: add the note with the failed command and Retry; keep the last known rows.
- Inline question answering: submit from the popover, with the stages above, instead of opening the item in the window (`MB/MenuBarNeedsYou.swift:130-132`). Questions have no uncertain outcome today: add one and never send a question again by itself.
- Notifications: remove the legacy notifiers (N2); make an interaction notification open the Needs you item (N1); remove a pending notification once it is answered; stop posting the "Answered…" notification if the owner agrees; offer no action buttons.
- Settings → General: read the authorization status and show the permission row, with a link to System Settings; disable the two switches while notifications cannot be sent.
- Workflow row: draw the visible status word and drop the step count.
- Missing feature: when the engine advertises `interaction-events.v1` no longer, show the one-sentence form instead of falling back to the legacy notifiers.

## Engine needs

None. `interaction-events.v1` is advertised by the pinned runtime.

## Evidence and limits

- Read through git objects only. Mac and engine strings are quoted with citations above; wording marked design or fixture is not from either.
- Fixture text: the failed command, exit codes, the failure line, the answers, the draft, the times, the banner bodies and titles of the specimen.
- The banners are a browser approximation of the system banner. Not verified in a native build: the popover geometry with the added notes, the system banner chrome, and what macOS shows for a denied permission.
- The settled note of `question-answered` is the app's `NeedsYouPresentationMapper.settledNote` (`NeedsYouPresentation.swift:204-212`) for the plain case; the variants for a handover, a shared answer and an approval without a run are not drawn.

## Files

`v2/scripts/states-menu-bar-notifications.js`, `v2/styles/menu-bar-notifications.css`, `v2/scripts/registry.js`, `v2/index.html`, `tests/menu-bar-notifications.test.mjs`, `tests/minimum-frame.test.mjs`, `tests/v2.test.mjs`.
