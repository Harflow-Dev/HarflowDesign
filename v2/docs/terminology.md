# Harflow Desktop terminology

User-facing wording for Harflow Desktop. Plain, literal, short; sentence case everywhere; no exclamation marks, jokes or emoji. Errors state the fact and the fix. Buttons are imperative verbs: Run, Approve, Reject, Take over in terminal.

## Status vocabulary

The set is closed: Running, Settling, Done, Failed, Timed out, Cancelled, Pending, Needs you. Workflow runs add Starting, Paused and Cancelling. Needs you is this redesign's word for needs attention. Status is always a glyph plus a word, never colour alone.

Elapsed time is mm:ss (h:mm:ss past an hour). Ages are now, 5m, 2h, 3d.

## Access levels

Read-only, Can edit this repo, Can publish, Full access.

## Harness, Agent, Model

- Harness: the installed tool that runs a task (Claude Code, Codex, Opencode, Mistral Vibe, Antigravity).
- Agent: an AI participant in a task or workflow, such as an orchestrator or a worker.
- Model: the model an agent runs on.

Harness and model are shown together as "Claude · Opus 5.5".

## Other terms

- Task: one unit of work dispatched to a harness. The New task view starts one.
- Workflow: a graph of nodes. Run workflow asks for a Task (required) and a Goal (optional).
- On-demand node: a standalone node outside the workflow path that agents call when needed.
- Parallel group: agents running side by side in lanes, started only through MCP.
- Slot: concurrency capacity for one harness. A task waits for a free slot before it starts.
