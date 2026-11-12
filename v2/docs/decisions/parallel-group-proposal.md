# Parallel group: lane decisions and undrawn states

Status: **Provisional / Draft, not approved**. No approver and no approval date. Owner review is required before native implementation of any state listed here. The existing approved `parallel-group/*` states (`lanes`, `loading`, `lanes-minimum`, `loading-minimum`) are unchanged and stay approved. Source base: HarflowDesign `2934681`. Immutable reference for this draft: the commit titled "Propose parallel group lane decisions and undrawn states", with `v2/scripts/states-parallel-lanes.js` and `v2/styles/parallel-lanes.css`.

This record exists because the native Parallel screen (HarflowMac `d2f03bc`) differs from the approved lanes drawing and has states the drawing never covered. Interface features are refined here first (workspace `AGENTS.md`, "Design reference"). Native wording is quoted from HarflowMac at `d2f03bc`; paths below are relative to `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/`.

## Owner decisions of 2026-11-12

Relayed by the coordinating session; they are the basis of the first group of states.

1. **Lane title.** The lane title is the task title. The caption under it is "Harness · model"; the model is left out when it is unknown. This replaces the approved drawing, where the harness name was the title.
2. **Lane actions menu.** "Open task" only. "Take over in terminal" leaves the lane and stays on the single-task screen.
3. **Lane composer.** One row, Send only, no "Send now" and no hint line. The placeholder still names the harness ("Message Claude").
4. **Group top bar.** Matches the approved drawing: the running badge ("1 running · 2 done"), one enforcement sentence, a ghost "View prompt" and a danger "Cancel all". No enforcement pills and no agents / access / repositories / started line. "Cancel all" keeps today's confirmation and is hidden when nothing is running.

## Coordinator defaults

Recorded as deviations for the owner to review. None is an owner decision.

- A settled lane ends "Done · 04:51". The approved drawing's "Done · 3 findings · 04:51" is not carried over: no engine field supplies a findings count.
- The undrawn lane states keep the native wording, restyled with the existing lane metrics.
- The View prompt reveal reuses the task screen's "Original request" disclosure.
- Lane captions use the app's display names, "Claude", "Codex" and "Opencode" (HarflowMac `d2f03bc`, `macos/HfFoundation/HfUI/Sources/HfUI/Style/Style.swift:84`, `BackendStyle.displayName`), not the approved drawing's "Claude Code". This deviates from the approved `parallel-group/lanes`.
- A settled lane shows no reported-summary line, only "Done · <duration>". Whether to add a summary is an open question (below).
- The workflow-run Graph inspector keeps its current chrome and is out of scope.
- The lane floor is 360 points at every size; native's is 630 (`Parallel/ParallelLayout.swift:18`). The approved loaded template sets 320 inline; the new states do not.
- The loading state draws two lane frames when the member count is unknown.
- Caller approvals in lanes are out of scope.

## What is drawn

All 21 states are in the `parallel-group` family, in both appearances. Titles and ids name the screen only; the status is in the approval line ("Not approved · draft for owner review, 2026-11-12"). Fixtures are deterministic and display-only; reopening a route resets it.

| Route | Draws | Native source at `d2f03bc` |
| --- | --- | --- |
| `parallel-group/lanes-titled` | Decisions 1, 3 and 4 together: task titles, "Claude · Opus 5.5" captions, one lane with no model ("Opencode"), the single-row composer, the approved top bar; settled lanes end "Done · 04:51" and "Done · 04:12" | Title: `Parallel/Component/ParallelColumnView.swift:174` (task title, two lines), subtitle `:83`; native shows "Backend · repo · N turns" with no model, so the "Harness · model" caption is the owner's decision, not native wording; top bar buttons `Parallel/ParallelView.swift:173-174` (Cancel all only while `canCancelAll`) and `:187`; badge wording `Parallel/ParallelPresentation.swift:185-207` |
| `parallel-group/lane-menu-open` | Decision 2: the lane actions menu open on lane 1 with "Open task" only | `Parallel/Component/ParallelColumnView.swift:199` ("Open task") and `:206` (the terminal button, which leaves the lane) |
| `parallel-group/prompt-shown` | View prompt revealed: each lane opens its "Original request" disclosure with "Copy original request"; the button reads as pressed | Toggle `Parallel/Component/ParallelColumnView.swift:114` (`showPrompt` is one group toggle, `Parallel/ParallelVM.swift:25`, rendered in every lane); presentation reused from `task/*` (`v2/scripts/m05-proposal.js`, `promptHtml`) |
| `parallel-group/cancel-all-confirm` | The confirmation: "Cancel every running task in this group?" with Cancel and Cancel all (danger). Focus starts on Cancel; Escape cancels | `Parallel/ParallelVM+Messages.swift:8-17` (title and one destructive "Cancel all" action) |
| `parallel-group/lanes-settled` | Nothing running: the badge reads "3 done", "Cancel all" is not shown | `Parallel/ParallelVM.swift:26` (`canCancelAll`); `Parallel/ParallelView.swift:173-174`; badge `ParallelPresentation.swift:185-207` |
| `parallel-group/lane-failed` | A failed lane: "Failed 07:48", failed glyph, the lane ends "Failed · 07:48"; badge "2 done · 1 failed" | `TaskDetail/TopBar/TaskBadgeModel.swift:109` ("Failed" plus clock); `ParallelPresentation.swift:198` (timed out counts as failed) |
| `parallel-group/lane-cancelled` | A cancelled lane: "Cancelled 04:31", the lane ends "Cancelled · 04:31"; badge "2 done · 1 cancelled". It is also where confirming Cancel all lands | `TaskDetail/TopBar/TaskBadgeModel.swift:113`; `ParallelPresentation.swift:199` |
| `parallel-group/lane-taken-over` | A lane taken over in Terminal: caption "Claude · Opus 5.5 · taken over", "Cancelled 04:31", end row "Cancelled · 04:31 · taken over", composer locked with "Messages are off — you took this task over in Terminal" | `TaskDetail/TopBar/TaskBadgeModel.swift:74-77` (suffix "· taken over"); `TaskDetail/Component/MessageBoxView.swift:34`; the v2 task screen's badge "Cancelled 04:31 · taken over" (`task/taken-over`). The lane caption carries "taken over" instead of the status text because the head is 328 points wide at the floor |
| `parallel-group/lane-activity-unavailable` | Lane 2: "Activity log unavailable.", Send disabled (no lock: native only locks taken-over lanes), "Messaging is unavailable for this activity view."; lane 3: "No activity to display." | `Parallel/ParallelPresentation.swift:123-126`; `Parallel/Component/ParallelColumnView.swift:155-157` |
| `parallel-group/lane-history-boundary` | Lane 1: "Observation session changed · cached history is not current. Replace this window to load current activity." with a "Load current activity" button; lanes 2 and 3 show the default "Available captured history" line | `Parallel/ParallelWindowAdoption.swift:48`; `Parallel/Component/ParallelColumnView.swift:116-129`; boundary block reused from the task screen (`.hd-d2b-boundary`) |
| `parallel-group/group-empty` | An empty group: "No tasks in this group any more.", no badge, no meta, no Cancel all, View prompt disabled | `Parallel/ParallelView.swift:109`; empty membership renders no badge (`ParallelPresentation.swift:188-190`) |
| `parallel-group/two-lanes` | A group of two agents: two lanes fill the width | Native divides the width and floors it (`Parallel/ParallelLayout.swift:20`); here the 360 floor |
| `parallel-group/loading-two` | The lane frames while the member count is unknown: two frames, real top bar frame and composers, the approved skeleton | Native placeholder uses two columns when the count is unknown (`Parallel/ParallelView.swift:199-200`, `placeholderContent`) |

The 1000 × 620 states, drawn with the shared minimum frame fixes (`sidebar`, `lanes`, `topbar-meta`): `lanes-titled-minimum`, `lane-menu-open-minimum`, `prompt-shown-minimum`, `cancel-all-confirm-minimum`, `lanes-settled-minimum`, `lane-cancelled-minimum`, `lane-failed-minimum` and `group-empty-minimum`. At 1000 × 620 two whole lanes show and 14 points of the third peek in; the enforcement sentence becomes the focusable dot. Not drawn at the minimum: `lane-taken-over`, `lane-activity-unavailable`, `lane-history-boundary` and `two-lanes` (the same lane frame and floor as the drawn ones), and `loading-two` (two frames fit whole; a minimum loading draft would need the `minimum` and `skeleton` registry fields together, which the approved loading-draft checks enumerate).

## Known interaction with the approved loading and minimum checks

`loading-two` needs the `skeleton` registry field, so `tests/skeleton.test.mjs` collects it with the approved loading states and its rules (approved reference, `Loading` group, no approval note) do not fit a provisional draft. The same checks already fail at HEAD because of the approved pending-launch loading state, so the failures are not new in number (2 in `minimum-frame.test.mjs`, 3 in `skeleton.test.mjs`), but whoever repairs them has to exempt provisional drafts. The 1000 × 620 states wrap themselves in the shared minimum frame and register no `minimum` field, so they stay out of the approved minimum checks; the catalog caption under them still reads 1280 × 800.

## Interaction

Fixtures move between states with explicit controls only. The lane 1 actions button opens its menu: focus lands on "Open task", Escape or Tab closes it and returns focus to the button. View prompt toggles the reveal and keeps focus on itself. Cancel all opens the confirmation: the sidebar and main area are inert, focus starts on Cancel, Tab and Shift-Tab stay inside, Escape returns focus to Cancel all, and confirming opens `lane-cancelled`. Confirming returns focus to View prompt on the new state. The lane actions buttons of lanes 2 and 3, the Copy button, Load current activity and Send do nothing in the fixtures.

## Differences from the approved lane drawing

- The lane title is the task title (up to two lines) and the harness moves into the caption; the model is omitted when unknown.
- The settled lane ends "Done · 04:51" with no findings count.
- The loaded template's inline 320 floor is not used: at 1280 × 800 three lanes at 360 points overflow the main area and scroll horizontally, so the third lane peeks. This follows from the 360-everywhere default.
- The group top bar is unchanged from the approved drawing; the sidebar sample is the approved one and is not updated per state.

## Open questions for the owner

1. **Cancel all wording.** The confirmation offers "Cancel" and "Cancel all". Native supplies only the destructive action; the dismissal comes from the system. The task screen uses "Stop"; should the group word be "Stop all"?
2. **Cancel all partial failure.** Native fans out one `cancel` per running member. When a member refuses there is no drawn outcome. Not drawn.
3. **Settled lane composer.** Failed, cancelled and done lanes keep an enabled composer, as the approved done lanes do. Should a settled lane accept a queued message?
4. **Badge tint when nothing runs.** "3 done" uses the done tone, "2 done · 1 failed" the failed tone and a cancelled lane a neutral one. Counting order follows native ("running, done, failed, cancelled"). Confirm the tints.
5. **Taken-over wording.** The caption takes "taken over" and the status stays "Cancelled 04:31", matching the task screen. A taken-over lane that is still running has no drawing.
6. **Same-harness lanes.** Two lanes of one harness differ by task title only; composers are both "Message Codex". Native already names each lane's composer group by task title (`Parallel/Component/ParallelColumnView.swift:163`, "Messages for <title>"); the drawn form keeps "Message <Harness>". Should the form's accessible name include the task title too?
7. **History boundary scope.** Only the replace-window notice with "Load current activity" is drawn. The capacity and recovery-limit notices, older-history paging and "Older activity could not be loaded" are not.
8. **"Available captured history".** Native prints it in every lane; the approved lanes do not. Drawn in `lane-history-boundary` only, to compare.
9. **Enforcement differs.** The fallback sentence "Enforcement differs between these agents; see each task's details." (`Parallel/ParallelVM.swift:31`) and an unavailable status are not drawn.
10. **Empty group top bar.** Whether View prompt stays (disabled) when no lane exists.
11. **Settled-lane summary.** Should a settled lane show the reported summary, as the task screen's Summary entry or as native's result callout? None is drawn.
12. **Queued, refused and delivery-unknown lane messages**, and caller approvals in lanes, remain out of scope.

## Verification recorded

The decisions above are checked in the browser pane at 1700 × 1100 emulated size through a local HTTP server: all 20 routes rendered in both appearances with no console errors; lane widths, frame sizes (1280 × 800 and 1000 × 620), dialog and inert state, the minimum fixes and the loading skeleton were measured by script; light and dark screenshots of the menu, confirmation, prompt, taken-over, unavailable, history boundary, loading and empty states were inspected. Keyboard flows for the menu, the reveal and the confirmation were exercised with dispatched key events, not a physical keyboard; real Tab order and VoiceOver reading are not verified. No native app was compared. HarflowMac is not changed by this record.
