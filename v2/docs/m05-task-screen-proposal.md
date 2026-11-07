# M05 task screen proposal

Status: **proposal, not approved.** Nothing here authorizes implementation. Approval requires an explicit owner decision, recorded by commit, path and state. Until then the Mac keeps today's behaviour for every gated slice (D1, D2, G1, G2, H2).

Entry: [overview and decisions](../index.html#m05-proposal/overview/light). Every route under `m05-proposal/` supports `/light` and `/dark`; screen routes also have a 1280 × 800 and 1000 × 620 frame selector in the catalog strip.

Sources:

- Scripts and styles: `v2/scripts/screens-m05-proposal.js`, `v2/scripts/m05-proposal.js`, `v2/styles/m05-proposal.css`.
- Approved visual base: `task/running`, `task/done`, `task/failed` from `v2/scripts/screens-task.js` at `24958cf`, container `3643d08`. D2B observation states at `227da87`. M04 sidebar and composer metrics at their recorded approvals.
- Contract: `HarflowMCP/docs/contracts.md`, fixtures in `contracts/v1`, engine 0.0.11. Where this document relies on engine source or a tool docstring instead, it says so.
- Behaviour evidence: HarflowMac `17efff4`.

Conventions in the specimens: tool rows have no durations or `+18 −6` counts, because they have no source. Composer text keeps the app's truthful wording as a recorded deviation, and its stacked shape stays out of scope (G-QUEUE). Specimens draw the recommended top bar (option C), still an open question.

## Closed by the owner, 2026-11-07

Relayed by the coordinator and recorded in the M05 plan: "lets do original request we can expand. and keep takeover too. and keep always allow harflow tools".

- The prompt stays the expandable D2B Original request disclosure, not a bubble.
- Takeover keeps an entry, against ledger D12 and G-OVERFLOW. Its placement is the only design question left, and it stays at `TaskDetailToolbar.swift:80` until that is approved.
- The builder's Always allow Harflow tools stays, against ledger 102. It is not a task screen item.

These decisions are not reopened here. Ledger text reflecting them is proposed below.

## Needs a contract change or fixture

These are flagged rather than designed around.

| Item | Finding | Effect on this proposal |
| --- | --- | --- |
| `cancel` result | No canonical fixture. `contracts.md` names only `cascade.pending_cancel_requested`, `pending_settled`, `cascade_incomplete` and refused ids. The fuller list (`cancelled_descendants`, `sigkill_survivors`, `owner_still_settling`, `not_signalled`, `not_recorded`) is in the MCP `cancel_task` docstring and `tasks.py`. | `state-cancel-partial` is provisional until HarflowMCP specifies and fixtures those fields. |
| Processes outside the process group | HarflowMCP issue 118 is open. `sigkill_survivors` covers lineage tasks, not background builds, and the slot can release while they run. | The dialog says these can keep running and that Harflow can't list them. No survivor list is drawn. |
| `task-artifacts` | No canonical fixture or capability string. | All `artifacts-*` routes are provisional. |
| "Settling" and "unknown" for a task | The engine's task statuses are `running`, `completed`, `failed`, `timed_out`, `cancelled`. Neither word is a task status. | Both are derived here from separate reads. A real status needs a contract decision. |
| Chain-stop marker | `stop_chain` in `task_continuation.py` writes a marker when a task with `auto_continue` or continuation history is cancelled, and `continue` then refuses. It is not on status or in `contracts.md`. | The app learns it only from the refusal, so Continue stays enabled on Cancelled and `state-continue-refused` draws the result. An additive status field would let the UI say so up front. |
| Earlier-turn tasks a cancel won't reach | No engine field. Today's list is client-derived from lineage. | Labelled as client-derived in `cancel-dialog-lineage`, or dropped if the owner prefers. |

## G-TASK-STATES

The badge always carries the status the engine reported. Qualifiers explain it and never replace it.

| Route | Evidence | Badge | What the person can do |
| --- | --- | --- | --- |
| `state-running` | `running` | Running 04:12 | Stop, queue a message |
| `state-stopping` | Cancel acknowledged, a fresh status still reads `running` | Running, unchanged | Button reads Stopping…; no second cancel |
| `state-cancelled` | `cancelled` | Cancelled 04:31 | Continue in a new session. Accepted on a plain task; refused for one with `auto_continue` or continuation history |
| `state-cancel-partial` | `cancelled` plus cascade fields | Cancelled | Open the named task, refresh |
| `state-timed-out` | `timed_out`. Only Claude's `error_max_turns` produces it; Vibe's breach reads as failed | Timed out 12:40 | Copy says turn limit, not a clock |
| `state-settling` | Terminal status with `log.state: settling` and capture `pending / capture_settling` | Reported status | Notice only. 30 s is a presentation grace, not closure |
| `state-unknown-failed` | `failed` with no exit code; `log.state: incomplete` | Failed · exit not observed | Continue disabled with its reason; Copy resume command |
| `state-unknown-done` | `completed` with no exit code, reconstructed from output | Done · exit not observed | No recorded duration, per the existing guard |
| `state-owner-lost` | `running`, `owner_state` dead. Confirmed owner death alone supports the loss claim | Running · owner lost | Says capture stopped; Stop, refresh, warned against a replacement |
| `state-unverified` | `running`, `owner_state` undecidable | Running · not verified | Says continuity is unknown, not lost; refresh, Stop |
| `state-launch-unknown` | `continue` or `resume` exit 3 with `unknown.message` | Unchanged | Composer locks; Check for a new task reads `task-list-page --predecessor-task-id` |
| `state-status-unavailable` | Transport failure or refused status read | Status unavailable (outside the vocabulary) | Retry read; only Copy task ID and repository actions remain |
| `state-pending` | `task_pending_launch`, `launch_state: waiting_for_resources` | Pending | Stop. No message, prompt or access facts, since no record exists yet. Every pane tab says the same (`events-not-started`) |
| `state-taken-over` | `taken_over` | Cancelled · taken over | Composer locked with the existing text. Holds whichever route took it over |
| `state-continue-starting`, `-started`, `-refused` | Launch in flight; exit 0 with `result.task_id`; exit 1 with an error | Reported status | Started is acknowledgement, not completion; refused keeps the task as it is and shows the engine's reason |

Reachable pane tabs follow the state too: running shows Changes as pending, and a run with no observed exit shows `not_captured / outcome_unobserved`.

Retry: the approved `task/failed` banner says Retry, and ctl has no retry. See `retry-options`.

| Option | Operation | Honest meaning |
| --- | --- | --- |
| Continue in a new session (recommended) | `continue` | Fresh session from the stored request, latest summary and outcome. Same harness, model and access. No new text needed; identical requests share one successor. Refused without observed exit, drained output and an untruncated request, and for workflow-owned tasks |
| Resume session | `resume` | Same session, needs follow-up text. Acceptance is not completion. Adds a send mode the composer lacks |
| Run again | `run` | No dedicated operation; repeats side effects. Not recommended |

Follow-ups queued with `send` are consumed by `continue`, which the composer's Send now already reaches on a settled task.

Stop or Cancel: `task/running` shows Stop in the composer and ledger 51 says Cancel in overflow. Both call `cancel`. Recommended: Stop in both, because "Cancel" beside a message field can read as discarding the draft. The outcome word stays Cancelled, since the status vocabulary is closed.

**Owner decides:** Retry option. Stop or Cancel. Reported status plus notice for settling, or a Settling badge. Four unknown treatments rather than one badge. Whether "Status unavailable" may sit outside the closed vocabulary.

## G-OVERFLOW

Order: Stop task… (running or pending only), Take over in terminal… or Open in terminal… (existing labels, where `allowsTerminal`; disabled with existing help when no session is reported), Open parent task (sub-task only), Copy resume command (not while pending, nor when status is unavailable), Copy task ID, then a repository group with Open in Finder and Copy path. The old Events item goes, since Events is a tab.

Copy feedback keeps the existing durable outcome text.

Stop dialog, exact copy:

> **Stop this task?**
> Harflow asks this run and the tasks it started through Harflow to stop. This is best effort.
> - Files already written stay in place.
> - Builds and other background processes the run started can keep running. Harflow can't list them.
>
> [Keep running] [Stop task]

Basis: `cancel` help ("best-effort, its live descendants"), `spawned_by` and `root_task_id` lineage, "work the agent had already written to disk is left in place", issue 118. A stale dialog keeps today's refusal: "The conversation moved on — review and try again." Workflow-owned, builder and native-control tasks keep their existing `canCancel` gating.

Takeover placement: recommended in overflow, using the existing confirmation text unchanged (`takeover-dialog`), because the top bar is already busy and the action is rare. The alternative is keeping today's toolbar button.

**Owner decides:** Menu order and repository group. Dialog wording. Keep or drop the client-derived list. Takeover placement.

## Top bar content

| Old header item | New home | Why |
| --- | --- | --- |
| Harness, model, repository | Meta line, dropped first at narrow widths and when chips crowd it; always in Facts | Specimen content |
| Turn count | Meta line and Facts | Client-derived from conversation members |
| Access label and enforcement | Access chip opens Events and expands What was enforced. Icon-only at minimum, with its label kept for accessibility | Ledger 75: enforcement stays reachable, no panel required |
| Notice summary | Chip, only when count is above 0, opens Notices | Same reveal path |
| Continuity | Chip, only when `showsContinuity`, opens Continuity. Copy says observation resumed and ownership did not change | `adopted_after_restart` describes observation only. `contracts.md` notes Mac presentation needs a design; this is that draft |
| `TaskResourceContextView` | Inline card above the transcript | It is current task state with an action, not a fact to look up |
| Breadcrumbs and sub-task banner | Open parent task in overflow; one provenance line in the transcript head | Named route exists before removal, per D2 |

Revealing a group opens the pane on Events, expands that group, moves focus to it, and Escape closes and returns focus to the chip.

**Owner decides:** Chips rather than a header row. Turn count placement. Resource card placement.

## G-DIFF

Reads `task-changes`. Structure is repository, then scope (Committed, Working tree), then rows sorted as the engine returns them.

- **Non-authorship:** the fixed `attribution` string is shown verbatim for each repository: "Observed repository differences; not evidence of task authorship."
- **Other writers:** Working tree always says "Includes other writers' and pre-existing changes in this checkout." `baseline_dirty` is shown as Yes, No or Unknown.
- **Same path in both scopes:** two rows, never merged. Each diff header names its scope. `counts_and_patch_separate` is stated on working-tree diffs.
- **8 × 2:** repositories collapse with count and state. `has_more` shows "Showing 2 of 84 rows" with Load more.
- **Tab count:** the sum of stored `row_count`, a stored total, so unread pages don't change it (`changes-multi`). It counts rows, not files. Recommended: shown when `capture.state` is `available` and every repository and scope is `available` with no `rows_truncated`, otherwise no number (`changes-multi-limited`).
- **No differences:** a stricter test, the plan's derived completeness value: the above, plus all pages read and `unmerged_unknown` false. Only that may say no differences observed.
- **Which task id:** each resume or continuation is its own supervised task with its own capture. Recommended: read the current member and offer a turn picker. A combined view is not offered, since no contract supports one and an approximate union would be a new claim.

Document state copy:

| `capture` | Reason | Copy |
| --- | --- | --- |
| `pending` | `task_running` | No changes to show while this runs |
| `pending` | `capture_settling` | Stored changes aren't available yet; capture may still be settling; view re-reads. This can also be a missing receipt inside the grace period |
| `available` | `no_repository` | No repository recorded |
| `available` | none, complete | No differences observed, repository-level, never "no changes by the agent" |
| `incomplete` | `capture_timeout`, `output_ceiling`, `budget_exhausted` | Capture incomplete; rows so far kept, more may exist |
| `not_captured` | `outcome_unobserved`, `capture_missing` | Not captured |
| `unavailable` | `capture_too_large`, `capture_error`, `changes_document_invalid` | Stored changes unavailable, Retry read |
| usage error | older engine | This engine does not support Changes |
| refusal | `changes_cursor_expired` | Reload from the first page, then continue |

`capture.state` stays `available` when every repository is `not_captured`, so the view reads repository states and never treats the document state alone as complete.

Scope and repository reasons (`head_missing`, `base_missing`, `base_not_ancestor`, `git_dir_unverified`, `index_unsafe_path`, `tree_unreadable`, `repository_identity_changed`, `object_store_untrusted`, `alternates_present`, `repository_unavailable`) each get a tag and one sentence. `git_failed`, `listing_unparsable`, `patch_alignment_failed`, `patch_failed`, `spawn_failed`, `capture_error` read as incomplete or unavailable as the engine reports them.

Row states:

| Contract | Row label |
| --- | --- |
| `truncated` / `file_limit` | Truncated · over 64 KiB |
| `truncated` / `task_limit` | Partial text · task limit, with the retained text readable |
| `omitted_size` / `task_limit` | Text omitted · task limit |
| `truncated` / `capture_timeout`, `output_ceiling` | Truncated · time or output limit |
| `binary` | Binary, with no counts, never zero |
| `not_captured` / `untracked`, `submodule`, `unmerged`, `path_too_long` | Name only, Submodule · no text, Unmerged · no text, Path cut · no text |
| `path_truncated`, `fields_truncated` | Non-addressable: no text read offered |
| `path_bytes_b64`, `text_b64` | Bytes, not UTF-8: path shown escaped; patch byte-decoded, never reported as corrupt |
| untracked directory | One row ending in `/` |

Text mode (`changes-text`): a row read shows a placeholder, a chunk with `has_more` offers Read more, `changes_entry_not_found` and `changes_cursor_expired` reload the list.

`unmerged_unknown` is stated as "Conflicts may exist", and also appears on scopes cut short. `reported_conflicts` is advisory and never adds, changes or hides a row. Renames are off, so a rename shows as a deletion and an addition. `EditedFiles` is never swapped in as a fallback. Diff text stays out of persistence and logs because the contract claims no redaction.

**Owner decides:** Hierarchy and two-row treatment. Tab count rule. Which task id. Attribution always visible.

## Artifacts and Events tabs

Three tabs share one pane: Changes, Artifacts, Events. They are not a return of the old task-level tabs, which the ledger removed.

Events holds the approved D2B content below collapsed facts groups, with paging (`events-page`, `events-page-error`): Task, What was enforced, Notices, Continuity. Captured activity facts, captured records and the recovered transcript follow, as D2B has them. This keeps enforcement truth reachable without restoring the Inspector, but it is the one place that could start to look like one, so it goes to the owner.

Artifacts shows references with stat observations. Availability is `available`, `changed`, `deleted` or `unavailable` at `observed_at`; available does not establish unchanged contents. A missing manifest is empty, a corrupt one unavailable. Pages hold at most 50, and the tab shows no count because a page has no total. Load more appends; a cursor rejected after a manifest change restarts the read (`artifacts-page-error`).

**Owner decides:** Facts groups at the top of Events. Artifacts stays provisional until the contract item above is done.

## G-ADAPTIVE

Measured from tokens: 1000 minus the 264 sidebar leaves 736, and a 420 pane leaves 316 for the transcript. `adaptive-options` draws three answers.

| Option | Transcript | Trade-off |
| --- | --- | --- |
| A, recommended: pane over the transcript | Keeps 736 | No re-wrap, so reading anchor and row heights stay put. Covers content; Escape or the toggle closes |
| B: collapse the sidebar while open | 524 | Both visible. Changes a setting the person did not touch, and re-wraps |
| C: side by side anyway | 316 | Simple. Transcript is hard to read |

Rule: split at or above 900 points of detail width (420 pane plus 480 transcript), otherwise overlay. Collapsing the sidebar by hand at minimum gives 944, so a split. 900 is a proposal and needs native checking against the feed's measurement key.

Defaults: running is closed, matching `task/running`, and first open lands on Events because Changes has nothing until capture. Done is open at split widths, matching `task/done`, and closed at overlay widths. Failed is closed, matching `task/failed`, so the banner keeps the focus. A person's choice is kept per conversation.

**Owner decides:** Option. Threshold. Running and failed defaults.

## G-PLATFORM

`platform-options` draws one toolbar line per option at both detail widths.

| Option | Layout | Trade-off |
| --- | --- | --- |
| A: specimen adjacency | Title, badge, meta at leading edge | Matches the specimen. Title jumps between screens; connection status needs a new home |
| B: accepted position, status apart | Title and connection status in principal; badge trailing | No move from M04, closest to today. Title and status no longer read together |
| C, recommended: accepted position, adjacent | Principal holds title, badge, meta, connection status | Keeps both. Long titles truncate first, meta drops first |

Native principal item width and truncation are unmeasured, and a real-window check is needed before pixel acceptance, as M04 had. D1 stays gated until this is chosen.

## Proposed ledger text

Not applied. For `v2/docs/migration-coverage.md`:

G-HISTORY, gap register:

> | G-HISTORY | History paging, retention, reconnect and read-only unavailable | CONTRACT reads delivered, DESIGN direction approved — S04 / M03–M05 | Contract: S04 and its follow-up deliver bounded event and prompt reads, cursor and retention semantics, successor discovery and live workflow node activity; receipt acceptance pending. Design: loss, reconnect and unavailable states approved by the owner on 2026-11-05 as `d2b-proposal/*` at `227da87` (`v2/docs/d2b-observation-approval.md`); sidebar paging approved as `m04-proposal/history-*` (`v2/docs/m04-proposal.md`). No design remains open. Native fidelity and product acceptance remain with M05. |

Owner decisions of 2026-11-07:

- Simplify, Task-level Summary and Prompt tabs: "Prompt is the expandable Original request disclosure at the start of the transcript, per D2B and the owner's 2026-11-07 decision; summary in the transcript (`task/done`)."
- G-OVERFLOW: replace "No takeover entry while takeover is deferred." with "Takeover keeps an entry (owner, 2026-11-07); placement pending approval."
- Deferred (D12): remove "Terminal takeover and attach" from the deferred list and record the same decision.
- Deliberately remove, builder "Always allow Harflow tools": move out of removal; retained by the owner on 2026-11-07.

## Fidelity and validation

Fixtures are deterministic local text; no engine, provider, network or user data is involved. Native toolbar, menus, sheets, materials, scrolling and text are browser approximations. Accessibility, VoiceOver, Dynamic Type and real scroll-anchor behaviour are unverified. Catalog route changes reset a specimen; native state must persist as described above.

Validation evidence is recorded in the commit message for this proposal.
