# D2B public observation states — owner review proposal

**Owner-approved direction, with requested corrections applied.** On 2026-11-05 the owner said “looks good” and requested spacing between Load earlier/New activity and the correct v2 sidebar. The corrected reference reuses the canonical approved sidebar and an 8px wrapping action gap. See [the scoped approval record](d2b-observation-approval.md). This approves the design direction; it does not establish native fidelity, product acceptance or authorization to start D2B implementation, M04 or publication.

## Grounding and scope

Visual direction: approved v2 Task `task/running` and `task/done`, contained at Design `9cfe4ce81789ed87c7ee40c10802ff0e3b2c7552`; task template last changed at `24958cfb155cc1149b527aba725d90931068abd0`, `v2/scripts/screens-task.js`. Shared tokens/components remain unchanged. The hosted `https://design.harflow.dev/v2/#task/done/light` was opened during preparation and its visible composition and approval metadata agree with the local baseline. This is not verification of the hosted deployment's exact Git revision.

Behavioral evidence: Mac `cd80fd1df1162953f5749bc3dc03ac4345e83668`, `docs/migration-receipts/M03-D2B-requirements.md` and the internal public-observation layer. Canonical input is immutable engine 0.0.8 `f304a65d9de948dfcba4c0c27c3d04f7f90971c8`, complete fixture manifest `6e742e1966d2b48afbfc80268b19f27da1e3f75f046f5683a35fc671228c7ce1`. The prompt's state, completeness, truncation and integrity are separate facts. Public events are normalized records, not private JSONL. No new producer semantics or installation follows from this proposal. The watcher correction is independent.

Revision3 retains the task transcript and right-pane Changes/Artifacts/Events, removes the old task Activity/Summary/Prompt tabs and task Inspector, and requires scoped approval of missing states. This proposal does not restore removed controls. A source-derived old Inspector is evidence that totals need qualification, not a reason to keep that surface.

## Recommended placement

- Put **Original request** in a disclosure at the start of the transcript. This is the sole assignment presentation in the focused specimen, not a second task tab. Do not duplicate it as a synthetic initial-message bubble. Historical messages remain distinct unless identity/provenance establishes an actual duplicate; never deduplicate by approximate text.
- Put history loading, loss, reconnect and reading-window notices **inline above retained captured rows**. Task execution status remains independent.
- Use the retained **Events right pane** for captured-activity provenance, bounded normalized records and separately labelled recovered material. A compact “Captured activity facts” group can show qualified observed counts; snapshot facts remain separately sourced. This is an Events design, not a restored task Inspector or a new statistics dashboard. Detailed Changes/diff design is outside this packet.
- Keep fixture selectors, size controls, approval/review labels and implementation explanations in the **catalogue**, outside the native app frame.

## 1. Qualified facts and totals

The summary's coverage and activity window are independent. A reader can reach its activity-window limit while the cumulative summary remains sound. Conversely, loading older visible rows does not repair a lossy cumulative summary. Preserve both frontiers in the native model.

| Source meaning | Proposed presentation | Allowed inference/action |
| --- | --- | --- |
| Summary loading | “Loading tool activity”; static skeleton | No zero or partial numeric placeholder |
| Qualified traversal from beginning, caught up, known projection sound | “2 tool calls observed” | Observed captured records only; no claim of complete execution capture |
| Same qualification with zero calls | “No tool calls observed in the available captured history” | Not “The agent used no tools” |
| Capture gap/skips, unknown kind, unsupported payload or normalization loss | “Tool activity unavailable”, with reason | Native D2A discards uncertain aggregate values; do not invent a lower bound |
| Summary key/work capacity reached | “Tool activity unavailable” / view-limit reason | No false exact file count; no permanent loading spinner |
| Activity window at capacity, independent summary still qualified | Keep “2 tool calls observed”; separate window-limit notice | Do not erase sound summary facts solely because the visible window is full |
| Snapshot status, usage/cost or child facts known independently | Separate labelled snapshot fact | Do not fill an unknown usage value from event absence, mix recovered messages into captured counts or imply authoring provenance |

Known capture uncertainty is sticky across a consumer-window rebase. Catalogue selectors must not create a supposedly qualified total across that loss/reset state, including after the window is replaced. Only a genuinely qualified fresh observation can change that meaning. A capacity-only activity limit is a supported independent-summary combination. A qualified-zero fixture must also be tool-free; the catalogue cannot show zero beside known captured tool rows. The current capacity sample has tool evidence, so selecting zero there is rejected rather than manufacturing a contradictory empty history. The focused fixture includes task status as its independently known snapshot fact; it does not fabricate cost or usage data.

## 2. Stored assignment request

| Public result / qualification | Heading and visible content | Copy / read behavior |
| --- | --- | --- |
| Loading | “Original request · loading” | No copy; static placeholder |
| available, complete, untruncated, integrity verified | “Original request”; full stored text, verified provenance | “Copy original request” copies the full returned text |
| available, complete, untruncated, integrity not_applicable (inline stored request) | “Original request”; “Complete stored request” | Full copy allowed; no invented verification badge |
| preview_only | “Request preview”; explicitly not the full assignment | “Copy preview” only; no full-assignment claim |
| available, integrity unverified | “Partial request”; “Unverified text · completeness unknown” | “Copy displayed text”; larger bounded read may remain unverified |
| available, verified but truncated/incomplete | “Partial request”; explicitly a bounded prefix | “Copy displayed text”; “Read more” replaces the prefix with a larger bounded response |
| integrity_failed | “Original request · integrity check failed”; withhold questionable text | No copy; “Retry request read” is observation only |
| unavailable / typed refusal / missing capability | “Original request unavailable”, public reason | No event/display_prompt fallback; only an explicit safe read retry/check when applicable |

Read more reissues the public one-shot read with a larger `maxBytes`; it is not cursor paging or append. Native default is 65,536 bytes; native maximum is 131,072. The catalogue uses a deterministic small ASCII fixture and legal 64→128-byte mock requests to make the boundary inspectable. At that fixture ceiling the text remains partial and the UI explains that the full request is unavailable in this view. At the read ceiling, focus stays on the expanded request text or disclosure summary when Read more disappears. Neither mock nor native UI promises an unlimited file, private-path opening or full-copy action from a prefix. Preserve whitespace and source text; do not reformat the assignment. A stale response cannot replace the selected task's current request.

Clipboard feedback must report success only after a successful write. When permission/API access fails, select the displayed text and say “Text selected. Use your system copy command to copy it.” Never announce “Copied” for that fallback. Fixture copying involves mock text only.

## 3. History health, lifetime and terminal evidence

| Observation meaning | Proposed inline notice / interaction | Safety meaning |
| --- | --- | --- |
| Loading | “Loading captured history” | No empty-history or no-tools claim |
| Empty visible captured window | “No rows in the available captured history” | Window emptiness alone does not qualify zero totals |
| Current observation caught up | “Captured activity caught up” | Not complete capture or proof of no external activity |
| Known gap, skipped lines or loss | “History incomplete · capture gap”; retain supported rows | Unknown interval stays visible; loading earlier cannot erase it |
| Unsupported record | Notice referring to Events; retain bounded normalized record/stub | Missing result.ok/text never becomes successful empty output |
| Missing public capability/read unavailable | Explicit history-unavailable reason | Does not imply task failure; no private/MCP fallback |
| Nonprogress cursor | “History paused · read made no progress”; explicit read retry | No tight automatic retry loop |
| Reconnecting | “Reconnecting · cached history is not current”; retain position | Retry reads observations; it never restarts execution |
| Source/epoch changed | “Activity source changed · cached history is not current” | Old rows are historical only; new-source material never silently replaces the anchor |
| Capacity | Explain this view's limit and retained position | Stop new materialization; no silent eviction or unlimited-history promise |
| Forward terminal marker accounted and forward observation drained | Task may be Done; captured history may be caught up | Final lifecycle alone does not establish full captured history; loss qualifications survive |

The reset specimen changes the captured-history source for the same qualified task; its displayed request and task snapshot are independently qualified fixture facts. A runtime/root/task binding change must instead clear stale current facts until each fresh read qualifies them. It cannot relabel old request or snapshot data as current under a new binding.

A safe read retry can end in partial/unavailable, not a forced success. The reconnect fixture deliberately retains a gap after retry. If observation health changes while task status remains Done/Running, the task's existing status does not change. Execution controls require their own fresh authority; this packet does not disable them merely because history is unavailable. The focused read-only specimen omits execution actions rather than inventing authority.

## 4. Reading position and identity

| Trigger | Proposed behavior | Focus / native acceptance |
| --- | --- | --- |
| Load earlier | Prepend a bounded page; preserve first visible logical row and relative vertical offset | Retain initiating control or the history boundary when that control disappears; do not focus a different message |
| New activity while reading older rows | Keep position; offer “New activity · show” | Only activation moves to the new rows, then focuses the admitted boundary/row |
| Already following the bottom | Native consumer may continue following; coalesce updates | Do not infer this from sequence values; preserve explicit follow state |
| Source reset | Separate cached evidence from current source; require explicit “Load current activity” to replace the view | Announce the source change; put focus on the boundary, never an unrelated new row |
| Activity capacity | Preserve admitted rows and last delivery cursor; show explicit rebase option | No automatic eviction, hidden pending-page queue or silent cursor advance |
| Explicit Load current activity | Replace only the consumer window; earlier rows leave that view with consent | Focus the current-window boundary; summary remains independently qualified unless source/coverage actually changes |
| Appearance change | Native preserves identity, reading anchor, disclosure state and focus | Catalogue rerender resets are a documented approximation, not native behavior approval |

Identity includes the producer/source binding, an observation-session or consumer-window epoch, and file-order occurrence. A capacity rebase keeps the producer source but creates a fresh window identity scope so new rows cannot reuse removed rows’ keys. An actual source reset keeps source-A cached rows until explicit adoption of pending source B; then it uses the new source and window scope with unknown summary coverage. Sequence numbers may repeat or regress; they are public record fields, not a global ordering/row-key/scroll target. The Events/unknown-loss example preserves 7, 7, 6 order with distinct occurrences. Healthy observed/capacity fixtures use increasing record order; they cannot claim qualified counts over that ambiguous example. These are local observation/window scopes, not a newly exposed producer generation certificate. Opaque cursors and change tokens do not establish atomic immutable history. No technical identity needs a new visible product label. Rebase is a **consumer-window operation using existing public reads**, not evidence of a missing producer API. Native adaptation must fence old callbacks and retain interest through runtime-driven session reacquisition.

## 5. Events and recovery provenance

Use **Public normalized events · bounded record window** as the captured source label. Show canonical record `kind`, observed fields and truncation/oversized markers faithfully. A stub can explain that original content is unavailable, not invent its tool output. “Copy normalized record” copies the displayed normalized JSON; it never claims original JSONL bytes. File-order examples belong to this observation and remain separate occurrences.

Show **Recovered transcript** as another source with its own qualification. It is display-only recovery evidence, not captured-activity summary authority. Do not combine its rows with captured records and silently count both. Do not present a fabricated filesystem path or offer Open original file. The producer's additive fields remain available to the bounded raw view without fabricating known-kind semantics.

## Review routes and appearances

Every route carries the scoped 2026-11-05 owner approval and supports `/light` and `/dark`:

| Route suffix under `d2b-proposal/` | Main review purpose |
| --- | --- |
| `observed` | Original request; qualified observed summary and current window |
| `loading` | Independent read placeholders, no zero default |
| `partial` | Capture loss and partial stored request; safe copy/read-more |
| `unavailable` | Read unavailable without task failure |
| `integrity-failed` | Questionable request withheld |
| `reconnecting` | Cached evidence and explicit retry/reset choices |
| `capacity` | Retained reading window with independently sound summary |
| `events` | Normalized records, unsupported stubs, duplicate/regressing sequence example and separate recovery |

Entry: [observed light](../index.html#d2b-proposal/observed/light), [partial dark](../index.html#d2b-proposal/partial/dark), [capacity](../index.html#d2b-proposal/capacity/light), [events](../index.html#d2b-proposal/events/dark). Request/history/totals selectors are catalogue fixture controls, not proposed app settings. They expose the table's less common variants without adding sprawling task screens.

## Native layout and accessibility

The approved reference is 1280×800. Existing Mac minimum is 1000×620 at `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/Coordinator/MainWindowNavigationView.swift:95` in the pinned Mac commit. Preserve those native constraints; do not shrink the whole app or its text to fit. At minimum size, text wraps and the transcript/request/Events regions scroll within their bounds. The catalogue itself scrolls horizontally when its viewport cannot contain the native-sized specimen.

All actions have literal accessible names. Tab/Shift-Tab traverse selectors and product controls; Enter/Space activate disclosures and actions. Focus remains visible in both appearances. Use one polite status announcement per requested observation/position change; do not announce polling repeatedly. Integrity errors carry visible text, not colour alone. Readable body copy uses existing v2 type/spacing tokens. Reduced Motion uses an instant state swap and static loading fill. Source reset/rebase must not use motion to conceal lost reading position.

Browser font/material/control rendering approximates SwiftUI. Native VoiceOver, Dynamic Type/accessibility sizing, AppKit window behavior, scroll anchoring under actual virtualization/streaming, focus persistence and performance remain unverified acceptance work. Catalogue route/theme resets do not approve resetting native state. No pixel-fidelity claim is made.

## Proposed tracker ledger entry (do not apply automatically)

G-HISTORY / M03-D2B: direction approved by owner on 2026-11-05, requested button-spacing/sidebar corrections applied; native/product cutover acceptance remains pending. Candidate reference is this proposal's immutable commit, `v2/scripts/screens-d2b-proposal.js`, `v2/scripts/d2b-proposal.js`, `v2/styles/d2b-proposal.css`, eight route/appearance pairs above, and this semantic table. Existing approved states remain unchanged. Do not mark G-HISTORY closed or M03 delivered from this proposal.

## Bounded implementation acceptance brief — after approval only

1. Use the scoped owner-approved direction and its two applied corrections. Pin the immutable corrected commit/path/state/appearance; commission a bounded D2B implementation assignment separately. Native exceptions and any later semantic amendments require their own disposition. Design approval is not blanket contract or native acceptance.
2. Replace BOTH production activity EventFileTailer/EventPages/LineTail and cumulative-summary LineTail scans together. Retain D2A single lineage, coverage-qualified counts, strict normalized payload interpretation, source epochs, exact lease ownership, cancellation and queued-delivery fences. Preserve activity/summary lease roles and runtime reacquisition; no private/MCP fallback or automatic runtime pin change.
3. Adopt typed prompt provenance and eliminate unsafe String?/display_prompt-as-assignment fallback. Update no-tools proof, occurrence-scoped IDs/anchors and raw pane source/label with the actual data cutover. Keep independent snapshot facts and separately labelled recovery.
4. Test loss/empty/unknown/finality, duplicate/regressing sequences, gap-preserving retries, capacities and explicit rebase, prepend/new/focus, runtime ABA and stale results/publications. Verify changed UI through isolated fixtures, both appearances, keyboard/focus and actual minimum window. Run required serialized guarded native integration and Release/strict-bundle gates on final source. Do not inherit a blanket waiver from the historical M03-C viewport exception.
5. Audit production private reads before/after; delete obsolete readers/helpers only when no active path remains. Report implemented, verified, approved and outstanding separately. This document starts none of that implementation.
