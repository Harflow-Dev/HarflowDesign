# Repository picker

Status: **Provisional — not approved.** Drawn on 2026-11-19 at the coordinator's request, for owner review. No native change is authorized by this drawing.

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
| Recent repositories | `new-task/centered-repository-recents` | The field holds `/Users/me/Code/HarflowMCP`; five chips, the HarflowMCP chip highlighted. Short names share the first row with the label; longer names wrap to rows of their own; the longest ends in an ellipsis. |
| Full path | `new-task/centered-repository-hover` | The tooltip of the truncated chip shows its full path, wrapped as a help tag wraps a long path. |
| Keyboard focus | `new-task/centered-repository-focus` | The focus ring on the HarflowDesign chip. |
| Missing folder | `new-task/centered-repository-invalid` | The field holds `/Users/me/Code/HarflowMPC`, outlined in the failed colour with "Choose an existing folder." under it; the composer status repeats it and Start is disabled. |

The popover is interactive. Typing updates the pill, the top bar and the highlighted chip; leaving the field or pressing Return checks the typed path against the fixture's folders; a chip fills the field; "Choose folder…" stands in for the open panel, which is not drawn, and picks the fixture's other folder. Fixture controls check the typed path, switch between no recents and five, switch the chip cap between the row width and 240 pt, and show or hide the tooltip. No file system, engine or real path is read; the paths are fixtures.

## Choices made

- **Chip width: change the 240 pt cap to the row width.** A chip may be as wide as the popover's content (328 pt including its padding), still one line, still truncated at the tail. The 240 pt cap was borrowed from the closed pill, where it bounds the composer bar; inside the popover it only truncates a name while the row has room. Names that fit under 240 pt lay out as before; a longer name takes up to a row of its own instead of being cut: in the drawing, "customer-onboarding-service-integration-tests" shows in full, where the 240 pt cap cuts it. The fixture control "Chip cap" compares the two.
- **A typed path is checked when the field is committed**, not only at Start: on leaving the field or pressing Return, with the same existence check the recents already use. A missing folder marks the field, shows the app's own string "Choose an existing folder." under it and in the composer status, in the failed colour as the app does, and disables Start until the path changes. Typing clears the mark. A blank field is not an error. Return only commits the field; it does not start the task, which stays on ⌘Return as in the app.
- **No recents draws no Recent row**, as the app does, and no placeholder text. The recents are also empty until their first existence check finishes; that moment draws the same as no recents.
- **The empty field's status** reads "Choose a repository to continue." (new copy, matching the composer's "Describe a task to continue."). The app disables Start with no message.
- **The popover opens above the pill** where the frame has no room below, as a native popover does; the drawn tooltip likewise opens above its chip. A browser cannot show a native help tag on demand, so the tooltip is drawn with the catalog's tooltip component; that chip drops its browser `title` so two tooltips do not show at once. The path field is drawn 24 px tall, as the app's rounded field measures in the captures.
- **Keyboard focus**: the field, "Choose folder…" and each chip are in the Tab order. On macOS, plain SwiftUI buttons take keyboard focus only when the user turns on keyboard navigation; the drawing assumes it is on. The drawn focus ring of the keyboard focus state gives way to real focus as soon as focus moves.

## Questions for the owner

1. Approve the five states, or name changes.
2. Chip width: the row width (drawn), or keep the 240 pt cap?
3. Truncation: the tail (drawn, as the app does), or the middle, which keeps the end of a name, where worktree and branch suffixes such as `-e2f0c3` usually differ?
4. Check a typed path when the field is committed and hold Start (drawn), or keep the app's check at Start only?
5. Accept "Choose a repository to continue." for an empty field, or leave the status empty as the app does?

## What the app would change if approved as drawn

- `HfRadius.Metrics.recentRepoChipMaxWidth`: from 240 pt to the popover's content width, so a chip is never wider than its row.
- Check a typed path when the field is committed, with the existing existence check, and show "Choose an existing folder." under the field and in the composer status; keep Start disabled while it stands.
- Show "Choose a repository to continue." in the composer status while the field is empty. The drawing treats a field of only spaces as empty; the app's `canStart` checks `repo.isEmpty` without trimming.

## Files

- `v2/scripts/m04-proposal.js`: the fixtures, the popover, the check and the fixture controls.
- `v2/scripts/screens-m04-proposal.js`: the five provisional states in the "Repository" group of New task.
- `v2/styles/m04-proposal.css`: the popover, the Recent row, the chips and the tooltip placement.
