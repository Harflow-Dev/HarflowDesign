# Shared answering proposal (#46)

Approved by the owner on 2026-11-02 in the implementation session. Reference: the shared-answer, caller-answered and harflow-answered states in the listed files. Hosted deployment is verified separately. This extends the approved Needs you #30 and queued-message #42 designs without changing their historical states. Request: [HarflowMac #46](https://github.com/Harflow-Dev/HarflowMac/issues/46), consuming [HarflowMCP #102](https://github.com/Harflow-Dev/HarflowMCP/issues/102).

## Review states

Open [Messages and recovery](../features/work-interaction.html), select **Node task** or **Orchestrator Activity**, then **Shared answer**, **Caller answered first**, or **Harflow answered first**. The recovery form retains its existing placement and fields. The Shared answer form accepts edits and enables Resume and Continue with one more retry when the answer is nonempty. Either button models the engine accepting the answer; no real action is sent.

Open [Needs you](../features/needs-you.html), choose Request detail, then the same three states. Question and Approval are selectable. In Shared answer, submit an answer or approval and use the fixture controls to choose Engine accepts or Caller answers first. The caller-first completion closes the form, shows the winning answer, and retains the typed draft under **Your saved draft**. Appearance changes keep the draft and result; Reset restores deterministic defaults.

Both specimens support Light and Dark. The one-line note below the form is **The original caller can also answer. Whichever answers first is used.** It describes the engine's explicit `responders: ["caller", "monitor"]` capability, not process liveness. Other input validation and action eligibility still apply.

A losing response shows **Already answered by the caller**, the winning answer or approval decision, and **Your saved draft**. The answer form closes so the same stale decision cannot be submitted again. History labels are **Answered in Harflow** and **Answered by the caller**, with a timestamp and answer text. Answering does not transfer ownership; later questions remain answerable from both places.

These labels and race outcomes also apply to goal revision, task and node approvals, and questions routed through the root. Child workflows still direct answering through the root. Message boxes keep their existing queue/delivery behavior and must use explicit engine eligibility; posting a message is not itself an answer to a pending checkpoint. No global composer is added to the workflow canvas.

Older engines without the responders capability retain the approved legacy behavior. The specimens' existing attempt-limit/child and approved Needs you states remain historical references; they do not imply the new engine has the same caller-alive refusal.

## Source and limits

Native structural reference: HarflowMac `b6b9bd994ebc188ca209ace6406ff18857e27a86`, `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Workflow/WorkflowRecoveryForm.swift`, `Workflow/WorkflowModels.swift` in the same source root, and `macos/HfCore/HfRepository/Sources/HfRepository/NeedsYou/NeedsYouModels.swift`. The new note and result states are proposed behavior, not source-derived controls.

The editable files are `features/work-interaction.html`, `features/work-interaction.js`, `features/needs-you.html`, and `features/needs-you.js`. Existing semantic tokens and native-sized panel layouts are reused. Browser controls, typography, materials and focus behavior approximate native rendering. The fixed 10:42 timestamp and answer text are deterministic fixtures. Engine concurrency, native UI fidelity, browser visual verification and accessibility validation require separate evidence; no approval or deployment is claimed.

## Interaction notifications

The owner requested an individual notification for each pending question, approval and recovery request, and each accepted answer, plus completed and failed tasks. The Needs you Notification surface adds `caller-answered`, `harflow-answered` and `individual` exploratory states. Answer banners identify the responder, run, timestamp and winning answer. Several requests produce separate banners rather than one aggregate. The existing grouped state is retained as a legacy design reference. Clicking a banner opens its request or retained result; desktop operating-system delivery and permission remain separate native checks.
