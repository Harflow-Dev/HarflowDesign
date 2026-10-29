# Queued messages — proposal for HarflowMac #42

Status: approved by the owner on 2026-10-29. Open [the work interaction reference](../features/work-interaction.html). Choose a surface, a state, Light or Dark, and 1000, 1200 or 1440 points. This approval is the working tree of that reference; it does not yet name a commit.

This replaces the strip above the composer. The strip is gone on Task, Node task, Orchestrator Activity, and each Parallel column. The workflow run canvas still has no composer, and the workflow window has no workflow builder composer (HarflowMac #43).

## The bubble

A queued message is the user's own bubble, right-aligned, in the same shape as other messages the user sent. The caption reads **Queued**. The word is the status; the softer fill only supports it. Several messages stack in send order, oldest first, newest nearest the composer. They stay at the end of the activity.

Cancel is a text button under the bubble. Its accessible name is "Cancel queued message". It is available only while the status is `queued`. Choosing it removes that bubble. Reduce Motion removes it immediately. Otherwise it fades out in 180 ms and the gap closes without moving the rest of the transcript.

Long text clamps to three lines and offers Show more, the same rule as other user bubbles.

## Where activity goes

New agent output, including the live "Reading the ledger…" line, is inserted above the pinned bubbles. The bubbles stay below it (`streaming`).

| State | Bubble |
|---|---|
| Queued | Caption Queued. Cancel is available. |
| Delivering | Still pinned, still captioned Queued. Cancel is gone, because the engine no longer accepts cancellation. |
| Delivered | The Queued caption is gone. The bubble is an ordinary user message at the point the continuation took it. The agent's following line comes after it. If that continuation already shows the same message, only one bubble remains. |
| Send now refused | The bubble stays queued. The refusal is a sentence under the text: "Send now isn't available. This operation can't be interrupted safely." Cancel remains. |
| Undeliverable | Caption Undeliverable, with the reason under the text. It is not pinned under later activity and it cannot be cancelled. |
| Delivery uncertain | Caption Delivery uncertain, with the reason. Same placement as undeliverable. It is not put back in the queue. |
| Cancelled | The bubble is gone. The status line says "Queued message cancelled." |

Delivered, undeliverable and delivery uncertain keep the message text. They are not a second copy of a prompt the transcript already shows. Matching is by message id. The same words sent twice remain two bubbles.

## Scrolling

If you are following the live end, a new queued bubble stays in view. If you have scrolled up, the transcript does not jump. A button at the bottom of the activity reads "Queued message" or "Queued messages" and moves to the bubbles (`scrolled`). It is absent when you are already at the end.

## Surfaces

Each bubble belongs to the activity it was sent from. A Parallel column does not show another column's queue. Orchestrator Activity and a selected node each keep their own. An embedded builder task keeps its own.
