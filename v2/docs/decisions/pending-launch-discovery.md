# Pending-launch discovery and controls

Status: **Provisional / Draft — not approved**. Owner review is required before native UI implementation. No earlier approval is extended to these states. Source base: HarflowDesign `6e31cd7`; the approved waiting-only `task/pending` remains unchanged. This proposal adds a discoverable launch selection identity and draws nonwaiting observations. Immutable proposal reference: the commit containing this record, with `v2/scripts/screens-pending-launches.js` and `v2/styles/pending-launches.css`.

## Scope and visual direction

A separate **Pending launches** section sits between the existing navigation and Running sections. Its selectable entries are launch entries, without task status glyphs, durations or fabricated Running rows. A matching inventory offers full IDs; selecting an entry opens a locked detail screen. Titles, harness, repository, creation time and resource names are displayed only from qualified metadata. Refused or unknown detail has a neutral title and no inferred metadata or controls. Existing cached sidebar observations do not become fresh authority when selected.

The specimens use existing semantic tokens, sidebar/navigation/section, top bar, badge, button, card and locked composer patterns. They approximate the approved task screen composition without changing the m05 renderer or any approved state. Native reference lineage remains DESIGN.md's pinned baseline; this new selection layout has no native implementation to claim fidelity against. Stop reuses the approved task confirmation sheet pattern and shared dialog/scrim classes. Its pending-launch wording remains provisional. The sheet captures the full ID, initially focuses Cancel, traps Tab/Shift-Tab within its actions, and supports Escape or Cancel to close and restore focus to Stop. Background app content is inert. Reopening the route resets the confirmation.

Both appearances use the catalog System / Light / Dark switch. `task/pending-waiting-minimum`, its Stop sheet `task/pending-stop-confirm-minimum`, and the accepted-request outcome `task/pending-stop-requested-minimum` draw 1000 × 620; other states draw 1280 × 800. Main content scrolls independently; the composer stays locked at the bottom. Minimum dimensions remain fixed, with catalog horizontal scrolling. Loading derives the inventory template through HFV2.skeletonize. Its two cards keep their layout, and both sidebar launch entries keep the loaded bounding boxes while their text becomes placeholders. Shared skeleton motion and reduced-motion behavior apply. This added loading state remains provisional.

### Owner-requested sidebar correction

After reviewing `57f54ab94c715c0c436cc199a9137b4f197889b5`, the owner said the different sidebar could cause confusion and requested a correction; the rest was broadly acceptable subject to that correction. This does not change the provisional approval status.

The corrected specimens extract the **actual** `new-task/default` sidebar from `v2/scripts/screens-new-task.js`, rather than rebuilding its markup. They apply the exact `hd-m04-sidebar-scroll` wrapping used by `v2/scripts/m04-proposal.js:149–165`, with the existing `v2/styles/m04-proposal.css` rules in a sidebar-only scope. The approved source is pinned at `57f54ab94c715c0c436cc199a9137b4f197889b5`; the latest source-file change in its history is `76ad937038924ee9b7d2b37f045c458c3b5e3091`. Approval lineage and the whole-sidebar-body scroll rule are recorded in [the centered composer decision](m04-centered-composer-proposal.md#owner-correction-whole-sidebar-body-scroll-2026-11-06); the centered shell redraw is approved in the decisions index.

Header/collapse button, all five navigation items with their icons and counters (including Statistics), Running, Recent work, Settings and appearance footer remain the source template bytes. Their spacing, widths, colors and slim scrollbar come from the approved styles. New task loses its selected mark while a pending launch is selected. The only added sidebar section is Pending launches: its rows use the existing navigation-row geometry and selection treatment, but remain separate launch identities without task glyphs or TaskInfo. Full ID and state remain in the inventory/detail; the sidebar row's accessible label and tooltip name the observed state. Collapse/expand use the exact approved `new-task/sidebar-collapsed` rail; expanding restores the same pending selection. All detail and Stop semantics remain unchanged.

Source-reuse tests remove only the added pending section and scroll wrapper, then compare every state's sidebar against the approved template bytes. The collapsed rail is compared directly. Browser inspection of source parity and the corrected selection remains the primary reviewer's responsibility.

## Routes and exact copy

Every route below is `task/pending-<suffix>` and is provisional. The route fixtures are deterministic; Check again and Check next page remain on the current observation. They do not invent new successful reads. All fixture state transitions are explicit links; reopening any route resets it.

| Suffix | Heading | Primary copy / action |
| --- | --- | --- |
| inventory | Pending launches | Select a launch to check its status. |
| loading | Checking pending launches | Checking this engine for pending launches… |
| empty | No pending launches observed | No pending launches were found in this completed check. New launches may appear after this check. |
| failed | Pending launches unavailable | The engine could not be read. Pending launches may still exist. |
| incomplete | More launches may exist | This check could not cover every launch. More launches may exist. |
| waiting | Waiting for resources | Waiting for Claude slots and Shared checkout. Harflow has not confirmed a running task yet. |
| preparing | Preparing | Harflow is preparing this launch. A running task has not been confirmed yet. |
| preparing-handshake | Preparing · Stop unavailable | This engine cannot stop this preparation yet. Stop becomes available after Harflow confirms the task has started. |
| granted | Launch granted | The engine granted this launch. Harflow has not confirmed a running task yet. |
| not-started | Did not start | The engine recorded that this launch did not start. Reason: resource wait was cancelled. |
| unavailable | Launch status unavailable | Harflow could not check this launch. Its outcome is unknown. |
| missing | Launch not found | This ID was not found in the latest check. It may have started or changed elsewhere. Its outcome is unknown. |
| recorded | Task record found | Harflow found a task with this ID. Check its status to open it. |
| handoff-failed | Task status unavailable | Harflow found a task, but could not check its status. Task controls remain unavailable. |
| stop-confirm | Stop this launch? | This asks the engine to stop the full launch ID below. If it starts before the request arrives, the task with this same ID may be stopped. |
| stop-requested | Stop requested | The request was accepted. This does not confirm that the launch or task stopped. Check its status again. |
| stop-uncertain | Stop outcome unknown | The Stop response could not be confirmed. The launch or task may still be active. Check its state before taking another action. |
| stop-refused | Stop refused | The workflow controls this launch, so the engine refused Stop. The launch or task may still be active. |
| stop-requested-minimum | Stop requested · 1000 × 620 | Same accepted-request copy as stop-requested; Check again retains the minimum window. |
| stop-confirm-minimum | Stop this launch? · 1000 × 620 | Same sheet and captured ID as stop-confirm, preserving the minimum window through Cancel and Escape. |
| waiting-minimum | Waiting for resources · 1000 × 620 | Waiting for Claude slots and Shared checkout. Harflow has not confirmed a running task yet. |

Stop availability note: “The engine may refuse Stop if this launch is controlled by a workflow or your access does not allow it.” Confirmation detail: “This is best effort. Files already written remain in place. The engine may refuse Stop because of workflow controls or your access.” Actions: “Cancel” / “Request Stop”. Unconfirmed Stop note: “Harflow will not send Stop again automatically. A missing launch or an unavailable status does not confirm that it stopped.” Detail note: “Harflow has not confirmed a running task yet. Messages and activity remain unavailable.” Locked composer: “Messages are unavailable until Harflow confirms the task has started” and “Pending launch · messaging unavailable”.

## Public API semantic mapping

The producer remains the canonical Python engine; this proposal depends on a new read-only, direct-human capability `task-pending-launch.v1`. `task-pending-page` is bounded inventory, not TaskInfo or TaskStatus. `task-pending-status` targets an exact full ID. The shape and field names remain subject to producer review; no UI code is authorized by this design record.

| Public observation | Presentation and authority |
| --- | --- |
| Qualified inventory metadata | Display full ID, bounded title/backend/repository/created metadata, resource names; retain opaque launch generation internally. Metadata grants no action authority. |
| Complete qualified inventory with no entries | Empty observation with check scope/time in the real adapter; no permanent absence claim. |
| Incomplete/unknown coverage, page/read limit, churn | Keep qualified observations and a coverage warning; never show an authoritative empty state. Read failure retains uncertainty. |
| pending / waiting_for_resources | Waiting for resources. Stop only if cancellation mechanism support is qualified. |
| pending / reserved or claimed | Preparing, including resource-free launches. Resource-free handshake support is currently absent; no Stop for it. Resource/worktree-backed mechanism can support Stop subject engine guards. |
| pending / granted | Launch granted; never Running. Support and permission guards remain separate. |
| pending / not_started with qualified stored reason | Did not start with the recorded reason. Owner death alone never establishes this. |
| unknown raw state / refused source / malformed or unavailable read | Unavailable; sanitize source details. No Stop or task actions. |
| not_found or disappearance | Outcome unknown, no replay permission and no successful cancellation claim. |
| recorded | Read ordinary public task status first; only a qualified ordinary record/status permits normal task presentation. If that read fails, retain the launch selection with no task controls. |
| Existing cancel acknowledgement | Stop requested only. Qualify cancel observation or exact task/launch reads before displaying settlement. Result status alone is insufficient. |

Stop invokes the existing cancel operation with the exact full ID and the selected runtime. The existing operation has no atomic generation precondition; the explicit same-ID spawn race warning is therefore required. Do not invent one in the native adapter. Existing workflow/caller restrictions still apply. Stop may be refused even when supported by the launch mechanism. No automatic launch or Stop retry is designed.

No pending selection reveals prompts, captured output, changes, artifacts, resume command, takeover, Continue, Send or Send now. Drafts belong to their original conversation/attempt and survive navigation. Selecting a discovered ID never proves that it belongs to an unknown Continue attempt and never unlocks that attempt. The existing `task/launch-unknown` handling is unchanged. A future adapter must fence read/callback application by selected root/runtime/full ID and observation identity; navigation must not retarget an in-flight cancel.

## Approval questions and limits

Owner decision requested: approve the complete pending-launch discovery proposal as drawn, including the separate sidebar section, observation-only states, unsupported preparation limitation and the existing Stop sheet pattern with the explicit same-ID spawn-race warning. These additions remain provisional until the owner answers. A stronger atomic stop guarantee would require separate producer scope.

No successful recorded handoff is fabricated: the existing approved ordinary task routes describe the destination after a real qualified ordinary status read. The handoff failure state here makes the intervening gate concrete. Generic sanitized refusal is combined with unavailable; unknown Continue attribution is preserved in its existing state rather than duplicated. Next-page and repeated reads are static fixtures, not a simulated changing inventory. Primary browser validation checked all 21 states in light and dark (42 renders), disabled composers, absence of Stop on unsupported preparation, and the 1000 × 620 minimum routes. Stop initial focus, Tab/Shift-Tab containment, Escape, return focus, accepted request and self-check dimensions were exercised. Inventory loading was inspected using the shared skeleton; screenshots and checks are retained outside this repository. JavaScript syntax and 56 v2 tests passed independently; three review rounds closed clean. Native visual fidelity, VoiceOver and real ctl integration remain unperformed. The local hosted publication was not changed or checked.

Sidebar correction verification: 57 v2 tests and syntax checks passed independently. The focused revision review closed clean. Primary browser checks covered all 21 states in light/dark, the canonical 264-point sidebar, one shared scroll body, fixed footer and the 56-point collapsed rail. Collapse/expand retained launch selection; the restored appearance footer changed the theme. Detail and Stop markup is unchanged by this correction. This revision remains provisional for owner review.
