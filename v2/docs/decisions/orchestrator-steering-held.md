# Orchestrator conversation

Status: **Approved by the owner on 2026-11-20** (relayed by the coordinator; the owner viewed the drawings first), approved in the commit titled "Approve the workflow-run question states". Approved, except the state drawn on these answers, which waits for the owner: `orchestrator-steering-command-refused` (with its `-minimum` twin) is provisional. The held states were drawn in commit `eadd22d` as the answer to the third open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`): the stale, expired and Dismiss states of orchestrator steering. All wording is design wording.

## Owner answers (2026-11-20)

1. Yes: Dismiss appears on the approved held states (open, waiting, unknown).
2. A new conversation starts through the composer caption, not a separate action.
3. One badge, "Needs you", for every held state, stale and expired included.
4. Open engine question: whether a dismissed, parked run carries a resumable checkpoint. The disabled Resume drawing stays until the engine answers.
5. Draw `command_refused`.
6. The minimum window rule is accepted (canvas 400, pane narrows, no narrower than 220).

## Source

HarflowMac at `360a67c4`: the Swift sources have no steering UI (`git grep -i steer` finds nothing), so the app draws none of these states.

HarflowMCP at `5face8b`, `src/harflow_mcp`:

- `workflow_steering.py`, `steering_admission.py`, `steering_runner.py`, `orchestrator_steering.py`: an episode holds the run while it lives.
- **Stale** (builder path): the target changed. A retarget marks the superseded episode stale and releases its hold; at a builder boundary a stale episode keeps the hold and the run is paused with the builder-path attention reason "Steering target changed at the builder boundary; explicitly retarget" (`steering_runner.py:213`). Retargeting needs text (`steering_admission.py:120-133`).
- **Expired** (builder path): more than 1800 seconds since the episode was created (not since the last turn): `steering_runner.py:198-201, 243`, with the builder-path reason "Steering episode expired; explicitly dismiss or retarget". On both paths the episode state is `expired`, or `reply` is missing from `eligible_actions` while a hold stands (`workflow_steering.py:194-197`; `orchestrator_steering.py:377, 424`).
- **Orchestrator path**: stale and expired set the episode state with `hold=True` (`orchestrator_steering.py:424, 658`). The run is paused only through `_park`, with the reason "Conversation is waiting for caller; use steering capability" (`orchestrator_steering.py:297`). That is the same pause the approved open and waiting states draw as Needs you. The builder-path texts above are not used as copy.
- **Command refused**: the engine state `command_refused` (`workflow_steering.py` STATES, `steering_schema.py:9`): a command built from the person's request was refused (`steering_runner.py:126`, `orchestrator_steering.py:424, 512`, with a refusal code such as `role_command_invalid`). The hold is kept and a reply is allowed (`steering_admission.py:137` accepts a turn in `awaiting_caller` or `command_refused`).
- **Dismiss** is `action: "dismiss"` in a `workflow-steer` request, with an optional reason. It is eligible whenever an episode holds, even on a terminal run. Asked while a turn is unsettled it becomes `dismiss_pending_settlement`: the hold stays until settlement, then the episode is dismissed. A dismissal parks the run as paused (`steering_admission.py:81-93`, `orchestrator_steering.py:292-309`); the park records no checkpoint id.
- While a hold exists, resume and recover fail with `steering_active`. `steering-status` returns `episodes[].state`, `hold`, `created_at` and `eligible_actions` (open, reply, retarget, dismiss, and others). 
- `workflow_monitor_controls.py:93-97` is the reason of the Resume control without an actionable checkpoint: "No qualified actionable checkpoint is available; refresh the workflow."

Approved v2: the orchestrator states of `v2/scripts/states-run-actions.js` (selected, open, unavailable, waiting, cancelling, unknown).

## States

All derive from `workflow-run/orchestrator-selected`, in group Messages and goal, each with a `-minimum` twin.

| State | Route | Status | Draws |
| --- | --- | --- | --- |
| Stale | `workflow-run/orchestrator-steering-stale` | Approved 2026-11-20 | Badge Needs you, Pause and Cancel run as the other held states draw them. The note "The run moved on since this conversation started." with Dismiss. The composer stays open with the caption "Your next message starts a new conversation." |
| Expired | `workflow-run/orchestrator-steering-expired` | Approved 2026-11-20 | The same, with "This conversation expired after 30 minutes. The run waits for you until you dismiss it or send a new message." |
| Dismissing | `workflow-run/orchestrator-steering-dismissing` | Approved 2026-11-20 | Dismiss was asked while a reply is unsettled: "Dismissing — waiting for running work to settle", composer locked, no actions. Badge Needs you. |
| Dismissed | `workflow-run/orchestrator-steering-dismissed` | Approved 2026-11-20 | "Conversation dismissed". The hold is gone, so the run is no longer held: it keeps the Paused badge, with Resume drawn disabled and the engine reason under it, and the composer open with a caption that sending opens a new conversation. |
| Command refused | `workflow-run/orchestrator-steering-command-refused` | Provisional | Engine state `command_refused`: a note "The orchestrator couldn't carry out that request. Reply to continue." with the reason line (fixture text standing for the engine's refusal reason), Dismiss, the composer open with the placeholder "Reply to the orchestrator", badge Needs you. |

Amendment of approved states (owner, 2026-11-20): `workflow-run/orchestrator-steering-open`, `orchestrator-steering-waiting` and `orchestrator-steering-unknown` (`v2/scripts/states-run-actions.js`, approved 2026-11-15) now carry the same Dismiss action the stale and expired states draw: the same button, as a bare row after the last item of the conversation, without the note box that stale and expired use around their text. They stay approved; nothing else in them changed, and their guides name the amendment. The record of their approval is the "Workflow and capacity states" section of the decisions README.

The 30 minute figure is the engine's 1800 second window. There is no standalone "Start again" button: a retarget needs text, so the open composer is the retarget.

## What the app would change

The app has no steering UI. It would need: the conversation pane with the held states above, Dismiss (`workflow-steer` with `action: "dismiss"`) on every held state, one Needs you badge while the hold stands, state and eligibility from `steering-status`, and Resume enablement from `monitor_controls`. Open engine question (Q4): whether dismissal should record a resumable checkpoint.

## Files

- `v2/scripts/states-run-questions.js`, `v2/scripts/states-run-actions.js` (the Dismiss amendment), `v2/styles/run-questions.css`, `tests/run-questions.test.mjs`
