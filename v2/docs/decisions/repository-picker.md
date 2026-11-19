# Repository picker

Status: **Approved by the owner on 2026-11-19** ("Approve with middle", relayed by the coordinator), with middle truncation. The proposal is the commit `52dfa6d` ("Propose the repository picker states"); the approval and the switch to middle truncation are recorded in the commit titled "Approve the repository picker with middle truncation". The five states carry the approval "Repository picker" of 2026-11-19.

## Source

App behaviour is HarflowMac `ba1deb8b72152f67c133d9d2d0238ef62263edab`, `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/NewSession/`:

- `NewSessionView.swift` (`repositoryOptions`): the repository pill opens a popover 360 pt wide (`Layout.optionsWidth`) with 16 pt padding and 12 pt between rows: the title "Repository", a rounded text field with the placeholder "/path/to/repo" (accessibility label "Repository path"), a "Choose folder…" button, then the Recent row. The pill shows the last path component, or "Choose repository" while the field is empty.
- `Component/RecentRepos.swift`: the Recent row is drawn only when there are recents. It is the label "Recent" and one chip per repository in a `PillFlowLayout` 6 pt apart, wrapping whole chips. A chip is one line of 12 pt text with 8 pt side and 3 pt vertical padding on the pill fill, truncated at the tail past `HfRadius.Metrics.recentRepoChipMaxWidth` (240 pt). The chip that matches the field is accent text on the running tint. Its tooltip (`help`) is the full path; its accessibility label is "Recent repository {name}" with the path as the hint.
- `NewSessionVM+Recents.swift`: at most five recents (`recentRepoLimit`), newest first, kept only while the folder still exists, rechecked off the main actor each time the popover opens.
- `NewSessionVM.swift`: Start is disabled while the field is empty (`canStart`). A typed path is checked only at Start (`resolvedRepoPath`: `~` expanded, absolute path to an existing folder); a missing folder shows "Choose an existing folder." in the composer status, in the failed colour.

App captures of the open popover (light, 1280 and 1000 windows) were the visual reference. They are outside this repository.

## States

All routes support light and dark through the catalog controls or the `/light` and `/dark` suffixes, and the 1280 × 800 and 1000 × 620 frames through the Frame control. Each draws `new-task/centered-ready` with the repository pill's popover open.

| State | Route | Draws |
| --- | --- | --- |
| No recent repositories | `new-task/centered-repository-empty` | Empty field with the placeholder, "Choose folder…", no Recent row. The pill reads "Choose repository", the top bar "New task", and Start is disabled with the status "Choose a repository to continue." |
| Recent repositories | `new-task/centered-repository-recents` | The field holds `/Users/me/Code/HarflowMCP`; five chips, the HarflowMCP chip highlighted. Short names share the first row with the label; longer names wrap to rows of their own. The two worktrees share a long prefix and are shortened in the middle, so their different endings stay visible: "harflow-mac-repository-pi…cent-chips-review-e2f0c3" and "…-9b41d7". |
| Full path | `new-task/centered-repository-hover` | The tooltip of a shortened chip shows its full path, wrapped as a help tag wraps a long path. |
| Keyboard focus | `new-task/centered-repository-focus` | The focus ring on the HarflowDesign chip. |
| Missing folder | `new-task/centered-repository-invalid` | The field holds `/Users/me/Code/HarflowMPC`, outlined in the failed colour with "Choose an existing folder." under it; the composer status repeats it and Start is disabled. |

The popover is interactive. Typing updates the pill, the top bar and the highlighted chip; leaving the field or pressing Return checks the typed path against the fixture's folders; a chip fills the field; "Choose folder…" stands in for the open panel, which is not drawn, and picks the fixture's other folder. Fixture controls check the typed path, switch between no recents and five, and show or hide the tooltip. No file system, engine or real path is read; the paths are fixtures.

## Decisions

- **Chip width: the row width, not 240 pt** (owner answer 2). A chip may be as wide as the popover's content (328 pt including its padding), still one line. The 240 pt cap was borrowed from the closed pill, where it bounds the composer bar; inside the popover it only truncates a name while the row has room. Names that fit under 240 pt lay out as before; a longer name takes up to a row of its own instead of being cut: in the drawing, "customer-onboarding-service-integration-tests" shows in full, where the 240 pt cap cuts it.
- **Middle truncation** (owner answer 3). A name too long for its row keeps its start and its end around one ellipsis, as macOS middle truncation (`truncationMode(.middle)`) does, so worktree and branch suffixes such as `-e2f0c3` stay visible. CSS can only cut the end of a line, so the drawing measures each chip label and shortens it in the middle, splitting by characters with the larger half at the start; AppKit balances by glyph width, which looks the same for these names. The full name stays the accessible label and the tooltip.
- **A typed path is checked when the field is committed** (owner answer 4), and again at Start: on leaving the field or pressing Return, with the same existence check the recents already use. A missing folder marks the field, shows the app's own string "Choose an existing folder." under it and in the composer status, in the failed colour as the app does, and disables Start until the path changes. Typing clears the mark. A blank field is not an error. Return only commits the field; it does not start the task, which stays on ⌘Return as in the app. A path typed and started straight away, without leaving the field, is checked at Start and held the same way.
- **No recents draws no Recent row**, as the app does, and no placeholder text. The recents are also empty until their first existence check finishes; that moment draws the same as no recents.
- **The empty field's status** reads "Choose a repository to continue." (owner answer 5; new copy, matching the composer's "Describe a task to continue."). The app today disables Start with no message.
- **The popover opens above the pill** where the frame has no room below, as a native popover does; the drawn tooltip likewise opens above its chip. A browser cannot show a native help tag on demand, so the tooltip is drawn with the catalog's tooltip component; that chip drops its browser `title` so two tooltips do not show at once. The path field is drawn 24 px tall, as the app's rounded field measures in the captures.
- **Keyboard focus**: the field, "Choose folder…" and each chip are in the Tab order. On macOS, plain SwiftUI buttons take keyboard focus only when the user turns on keyboard navigation; the drawing assumes it is on. The drawn focus ring of the keyboard focus state gives way to real focus as soon as focus moves.

## Owner answers (2026-11-19)

1. The five states are approved.
2. Chip width is the row width.
3. Truncation is in the middle, not the tail.
4. A typed path is checked when the field is committed, and Start is held while it is invalid.
5. "Choose a repository to continue." is accepted.

## What the app must change to match

- `HfRadius.Metrics.recentRepoChipMaxWidth`: from 240 pt to 312 pt, the popover's 328 pt content width minus the chip's two 8 pt side paddings (the frame sits on the text, before the padding), so a chip is never wider than its row.
- `RecentRepoChip`: `.truncationMode(.middle)` instead of `.tail`.
- The artefacts that state the old rule: the 240 + 16 bounds in `RecentReposSizingTests.swift` and `ModelPickerStatesHostedTests+Repository.swift`, the New Session recents note in `MainWindowFeature/AGENTS.md` ("at most 240 points … truncating at the tail") and the `RecentRepoChip` doc comment.
- Check a typed path when the field is committed (leaving the field or Return, which must not start the task), with the existing existence check, and show "Choose an existing folder." under the field and in the composer status; keep Start disabled while it stands. Keep the check at Start for a path started without leaving the field.
- Show "Choose a repository to continue." in the composer status while the field is empty. The drawing treats a field of only spaces as empty; the app's `canStart` checks `repo.isEmpty` without trimming.

## Files

- `v2/scripts/m04-proposal.js`: the fixtures, the popover, the middle truncation, the check and the fixture controls.
- `v2/scripts/screens-m04-proposal.js`: the five approved states in the "Repository" group of New task.
- `v2/styles/m04-proposal.css`: the popover, the Recent row, the chips and the tooltip placement.
