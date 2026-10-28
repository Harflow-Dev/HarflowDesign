# Task continuity after a server restart

The owner approved this direction in [HarflowMac #37](https://github.com/Harflow-Dev/HarflowMac/issues/37)
on 2026-10-28. This specimen records that direction; approval does not certify the
browser approximation or native fidelity. Pin the HarflowDesign commit containing
this document and `features/task-continuity.html` before native implementation.

## Reference and states

Open [the specimen](../features/task-continuity.html). It works offline and uses
only local deterministic fixtures. Its state selector supplies `normal`, `surviving`,
`details`, `uncertain`, `capture`, `input`, `both`, `completed`, `absent`,
`unsupported` and `invalid-time`, each in Light and Dark. Activity, Summary and
Prompt share one header. Changing appearance or tab preserves evidence, diagnostic
history and inspector expansion; changing evidence state resets its fixture history.
Reset returns to surviving restart and Activity, keeping the selected appearance.

The 1000-point specimen is horizontally scrollable at narrower browser widths.
Its 288-point inspector is a browser approximation; this specimen isolates task
content rather than the application sidebar or native toolbar.

## Presentation contract

- Qualified restart evidence with a live owner and intact capture shows one row
  below the task header and above the tabs: “Server restarted · Task still running”.
  It uses secondary 12-point text, a muted restart symbol, no colored background,
  and a Details button. The actual Running indicator remains unchanged.
- The row is separate from Refusals & warnings and contributes no warning count.
  Uncertain ownership says “Task connection is uncertain”; lost capture says
  “Output capture stopped”; lost live input says “Messages can no longer be delivered”.
  Real warnings can coexist and supersede the healthy continuity claim. A live
  owner draining an exited agent does not itself imply dispatcher loss.
- Details opens Technical info → Supervision and moves keyboard focus to that
  section. Closing the inspector restores focus to its trigger. Raw process and
  generation identities stay in diagnostics. Tabs support arrow keys, Home and End.
- Identical polling and tab changes retain one row without a live announcement.
  Later observer generations create distinct diagnostic history entries. The
  fixture uses task and generation keys; native code must additionally preserve
  actual engine identities, scope by task and distinguish reused process IDs.
- Terminal state removes the healthy row. Restart history remains under Technical
  info without claiming that completed work is still running.
- No qualified evidence, an older engine or unavailable optional fields produces
  no restart row. Do not infer a restart from a PID difference.
- A valid adoption `at` is labeled “Observing process started at …” for a
  `parent_process` observer, or “Observing server started at …” for a true MCP
  server observer, in the user's local time. Details similarly labels the parent
  identity “Current observing process”, preserving “Current server” for a server. It is not the crash time, restart time or ownership-transfer time.
  The invalid-time fixture omits the label instead of inventing a timestamp.

The fixture's later-generation control records identities and a history count;
it does not simulate real server lifecycle, process reuse or persistent storage.
The repeat-poll feedback is catalog chrome, not an in-app announcement.

## Source basis

Native baseline: HarflowMac commit `c93d789174a20c98674ca7c5f4aa18663cba06ff`.
The following exact paths were inspected:

- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/TaskDetailView.swift`
  owns the header, tabs and inspector visibility.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/Component/InspectorView.swift`
  owns Technical info and diagnostic presentation.
- `macos/HfFeatures/MainWindowFeature/Sources/MainWindowFeature/TaskDetail/TaskDetailVM+Inspector.swift`
  builds the inspector's snapshot-backed state.
- `macos/HfCore/MonitorCore/Sources/MonitorCore/TaskRecovery.swift`
  decodes supervision and its existing loss notices.

The added neutral row and supervision navigation are the approved new direction,
not existing native behavior at that baseline. Optional engine evidence is defined
by HarflowMCP commit `318bd997d8672066d6e1393dd340cfea82e9e984`,
`docs/contracts.md`, “Surviving execution after dispatcher restart”:
`supervision.adopted_after_restart: {at, previous_server, current_server}`.
Execution ownership does not change. Coordinated ctl integration uses
`--observer-parent` to qualify its actual immediate parent by PID and process start
identity. The stable `observer_kind: "parent_process"` diagnostic distinguishes that
observer from a true MCP server; transient ctl polling subprocesses must not create
new restart observations. The specimen defaults to this parent-process observer,
with an MCP-server selector for the original semantics. This is a necessary
clarification to diagnostic labels; the approved main “Server restarted” row is
unchanged. Healthy capture uses the actual contract value `live`.
Native integration must explicitly select a
supporting released engine and tolerate missing, null or malformed optional fields.

## Validation limits

The layout uses shared semantic color tokens. Browser fonts, the restart glyph,
buttons, tabs and focus outlines approximate native controls and SF Symbols.
Syntax checks are automated; browser appearance and keyboard verification and
actual native minimum-width, both-appearance and VoiceOver verification must be
recorded separately. This document does not claim those checks have passed.
