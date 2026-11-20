# Orchestrator conversation held states

Status: **Provisional, not approved.** Drawn on 2026-11-20 on the owner's "yes please", relayed by the coordinator, as the answer to the third open question of the Mac workflow run receipt (HarflowMac `docs/migration-receipts/M09.md`): the stale, expired and Dismiss states of orchestrator steering. No owner decision exists. All wording is design wording.

## Source

HarflowMac at `360a67c4`: the Swift sources have no steering UI (`git grep -i steer` finds nothing), so the app draws none of these states.

HarflowMCP at `5face8b`, `src/harflow_mcp`:

- `workflow_steering.py`, `steering_admission.py`, `steering_runner.py`, `orchestrator_steering.py`: an episode holds the run while it lives.
- **Stale** (builder path): the target changed. A retarget marks the superseded episode stale and releases its hold; at a builder boundary a stale episode keeps the hold and the run is paused with the builder-path attention reason "Steering target changed at the builder boundary; explicitly retarget" (`steering_runner.py:213`). Retargeting needs text (`steering_admission.py:120-133`).
- **Expired** (builder path): more than 1800 seconds since the episode was created (not since the last turn): `steering_runner.py:198-201, 243`, with the builder-path reason "Steering episode expired; explicitly dismiss or retarget". On both paths the episode state is `expired`, or `reply` is missing from `eligible_actions` while a hold stands (`workflow_steering.py:194-197`; `orchestrator_steering.py:377, 424`).
- **Orchestrator path**: stale and expired set the episode state with `hold=True` (`orchestrator_steering.py:424, 658`). The run is paused only through `_park`, with the reason "Conversation is waiting for caller; use steering capability" (`orchestrator_steering.py:297`). That is the same pause the approved open and waiting states draw as Needs you. The builder-path texts above are not used as copy.
- **Dismiss** is `action: "dismiss"` in a `workflow-steer` request, with an optional reason. It is eligible whenever an episode holds, even on a terminal run. Asked while a turn is unsettled it becomes `dismiss_pending_settlement`: the hold stays until settlement, then the episode is dismissed. A dismissal parks the run as paused (`steering_admission.py:81-93`, `orchestrator_steering.py:292-309`); the park records no checkpoint id.
- While a hold exists, resume and recover fail with `steering_active`. `steering-status` returns `episodes[].state`, `hold`, `created_at` and `eligible_actions` (open, reply, retarget, dismiss, and others). 
- `workflow_monitor_controls.py:93-97` is the reason of the Resume control without an actionable checkpoint: "No qualified actionable checkpoint is available; refresh the workflow."

Approved v2: the orchestrator states of `v2/scripts/states-run-actions.js` (selected, open, unavailable, waiting, cancelling, unknown).

## States

All derive from `workflow-run/orchestrator-selected`, in group Messages and goal, each with a `-minimum` twin. A paused run draws the Paused badge as `recovery` does, without Pause and without Resume enabled.

| State | Route | Draws |
| --- | --- | --- |
| Stale | `workflow-run/orchestrator-steering-stale` | Run paused. The note "The run moved on since this conversation started." with one Dismiss action. The composer stays open with the caption "Your next message starts a new conversation." |
| Expired | `workflow-run/orchestrator-steering-expired` | The same, with "This conversation expired after 30 minutes. The run stays paused until you dismiss it or send a new message." |
| Dismissing | `workflow-run/orchestrator-steering-dismissing` | Dismiss was asked while a reply is unsettled: "Dismissing — waiting for running work to settle", composer locked, no actions. The run status is unchanged. |
| Dismissed | `workflow-run/orchestrator-steering-dismissed` | "Conversation dismissed"; the run is parked as paused with Resume drawn disabled and the engine reason under it; the composer is open and a caption says sending opens a new conversation. |

The 30 minute figure is the engine's 1800 second window. There is no standalone "Start again" button: a retarget needs text, so the open composer is the retarget.

## Recommendations

1. Draw stale and expired as an open composer plus a Dismiss action, because that is what the engine accepts.
2. Draw the paused run honestly: Pause removed, no Resume while the hold stands (the engine refuses it with `steering_active`).
3. Dismissed: Resume is enabled only if `monitor_controls.resume.allowed`. Whether a dismissed, parked run should carry a resumable checkpoint is an engine question (the park sets no checkpoint id), so the drawing shows the disabled form with the engine reason.

## Owner questions

1. Should Dismiss also appear on the approved held states (waiting, unknown, open)? The engine allows it whenever a hold exists.
2. Wording: "Start a new conversation" through the composer caption, or a separate action?
3. The approved held states (open, waiting, unknown) keep the "Needs you" badge and are unchanged; stale and expired draw "Paused", but on the orchestrator path the engine's pause (`_park`, reason "Conversation is waiting for caller") is the same one the approved open and waiting states draw as Needs you. Should every held state use one badge, and which?
4. Engine question: does a dismissed, parked run carry a resumable checkpoint?
5. Draw `command_refused` (the orchestrator refused a command; a reply is still allowed) as well?
6. The graph run states use a new minimum rule: the canvas keeps 400 and the pane narrows to what remains (no narrower than 220). Acceptable?

## What the app would change

The app has no steering UI. It would need: the conversation pane with the held states above, Dismiss (`workflow-steer` with `action: "dismiss"`), state and eligibility from `steering-status`, and Resume enablement from `monitor_controls`.

## Files

- `v2/scripts/states-run-questions.js`, `v2/styles/run-questions.css`, `tests/run-questions.test.mjs`
