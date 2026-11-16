# Workflow questions

Status: provisional. Owner approval pending. No approval is inherited from the waiting shell. HarflowDesign base: `b710856`. No commit or publication is claimed.

## Routes and composition

All routes are in Needs you / Workflow questions:

| Route | Meaning |
| --- | --- |
| `needs-you/workflow-question` | Free-text workflow question, multiline Your answer and Send answer |
| `needs-you/workflow-question-offered` | Usage-limit question; only the exact offered answers `retry` and `switch` |
| `needs-you/workflow-question-answered` | Already answered by the caller; winning answer, receipt time and saved local draft |
| `needs-you/workflow-question-unavailable` | Last known question while its source is unreadable; draft and controls disabled; Try again |

Each route also has a `-minimum` variant at 1000 × 620. Append `/light` or `/dark` for the appearance. Normal specimens are 1280 × 800. Local semantic tokens support both appearances. Existing `needs-you/loading`, `loading-minimum` and `empty` remain the page-level loading/empty references; no question-specific loading claim is made.

The question replaces only the task-question card in `needs-you/waiting`. The publish approval and command approval remain separate and unchanged. The waiting screen's counts, badges and other request ages are surrounding sample context, not counts derived from the question fixture; the settled receipt is shown in place for inspection. Sidebar uses the existing fixed header/footer with one scrolling body. The main pane scrolls vertically, without scaling the specimen at smaller browser widths.

## Behavior and reset

Serve the repository root or open `v2/index.html` offline, then select a route. Typing non-whitespace enables Send answer. Clicking it or an offered answer prevents native form navigation and preserves input and focus. These controls are demonstrations only, with no submitted or accepted outcome. Try again repeats a deterministic unavailable observation, preserves the draft and keeps controls disabled. The answered state has no answer controls. Reload or navigate away and back to reset. There is no persistence or connection.

## Source evidence

Behavioral pin: HarflowMac `80f3f1b661929ca7c206bd4e639637ae65f56f79` (M07-A context binding), inspected read-only:

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NeedsYou/NeedsYouDetailView.swift`: question vs approval controls; multiline answer; offered-answer buttons; withdrawn message and Try again; disabled controls; settled card and saved draft.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NeedsYou/NeedsYouVM+Actions.swift`: current displayed request guard, offered membership check, blank-answer guard, winning receipt and draft retention. Browser controls grant none of this authority.
- `macos/HfCore/HfRepository/Sources/HfRepository/NeedsYou/NeedsYouModels.swift`: question items are display prose, not tokens; offered answers belong to usage-limit decisions; withdrawn observations are last known and unresolved. The engine supplies no caller identity.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowInteractionOutcomeView.swift`: caller/Harflow receipt vocabulary, receipt timestamp, optional answer excerpt, retained unsent draft.
- `macos/HfCore/HfRepository/Sources/HfRepository/NeedsYou/NeedsYouCore.swift` and `NeedsYouMapper.swift`: offered choices are obtained for the matching usage-limit decision, not every question.
- `macos/HfCore/MonitorCore/Tests/MonitorCoreTests/WorkflowPendingInputTests.swift`: synthetic usage-limit choices `retry`, `switch`. These tokens are contextual fixtures, not a universal menu or a new engine contract.

Question prose, shared-answering sentence, fixture run/step, answer, timestamp and draft are deterministic design wording. The winner label is the source-supported caller role, not a named person or device. Browser fonts, icons, focus, materials and scrolling approximate native controls.

## Open limits and approval

Generic question stale refusals and transport-unknown outcomes remain explicit gaps. This drawing adds no expiry policy, authenticated caller identity, automatic replay, new wire semantics, engine authority or retry guarantee. Unavailable means the specific withdrawn last-known source only. Retry here is a read attempt, not submission or recovery from an unknown send.

Before native UI implementation, an explicit owner decision must approve the concrete Design commit/path/states. These states remain provisional.

Primary verification on 2026-11-16, after the native gate released the serialized execution lane:

- Complete Node test suite: 498 passed, zero failed. Initial inventory failures were corrected with an explicit eight-route allowlist; existing baseline digests remain checked.
- Temporary-profile headless Chrome: all 16 state/size/appearance combinations captured and 694 checks passed, including exact dimensions, horizontal overflow, fixed sidebar footer bounds, disabled controls, draft retention, reset, Tab navigation and Enter activation on the free-text answer.
- Every existing descriptor and specimen template was compared in memory with `b710856`. Only the overview catalog row was explicitly adjusted for the eight added states/group; existing app templates remain identical. The approved waiting app DOM is unchanged after navigation through the new renderer. This is not a baseline pixel comparison.
- Primary visually inspected the four card variants across light/dark plus the minimum sidebar. This caught an initial minimum-footer clipping issue, corrected by enabling the existing scoped minimum layout; all browser checks and the full Node suite passed after that fix.

Evidence remains outside the product repository in workspace `.claude-work/codex-2026-11-16/question-browser/` and `question-unit-final.log`. Captures include app frames and card details. No real engine, native implementation or VoiceOver validation is claimed. The local proposal has not been published.
