// Families and states of the Harflow Desktop interface reference.
// Route format: family/state. Every state has a template in HFV2.templates.
(function () {
  'use strict';
  var HFV2 = (window.HFV2 = window.HFV2 || {});
  HFV2.registry = {
    "approval": {
      "date": "2026-11-03",
      "by": "the owner",
      "canvas": "1793668079-d8d9",
      "designSystem": "1793668064-9e04"
    },
    "defaultRoute": "new-task/default",
    "families": [
      {
        "id": "new-task",
        "title": "New task",
        "description": "The landing view: a greeting, the composer with its option pills, and the sidebar that lists running and recent work.",
        "states": [
          {
            "id": "default",
            "title": "Default",
            "description": "Greeting and composer with repository, harness and model, and access level pills.",
            "approval": "approved"
          },
          {
            "id": "harness-menu",
            "title": "Harness menu open",
            "description": "The harness and model pill opened to choose a harness and then a model.",
            "approval": "approved"
          },
          {
            "id": "sidebar-collapsed",
            "title": "Sidebar collapsed",
            "description": "The 56px icon rail with the Needs you dot and a running count on New task.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "needs-you",
        "title": "Needs you",
        "description": "Every request that waits for the person, answered inline.",
        "states": [
          {
            "id": "waiting",
            "title": "Waiting items",
            "description": "Approvals and a question from tasks and workflow runs, each answerable in place.",
            "approval": "approved"
          },
          {
            "id": "empty",
            "title": "Empty",
            "description": "Nothing waits for the person.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "workflows",
        "title": "Workflows",
        "description": "The workflow list and the Run workflow sheet.",
        "states": [
          {
            "id": "list",
            "title": "List",
            "description": "Workflows with node count, Edit and Run. No run status is shown.",
            "approval": "approved"
          },
          {
            "id": "empty",
            "title": "Empty",
            "description": "No workflows yet, with the next step.",
            "approval": "approved"
          },
          {
            "id": "run",
            "title": "Run workflow",
            "description": "Task (required), Goal (optional), repository and orchestrator override.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "workflow-editor",
        "title": "Workflow editor",
        "description": "The canvas editor, flowing left to right, with the inspector for the selected node.",
        "states": [
          {
            "id": "node-selected",
            "title": "Node selected",
            "description": "A node selected on the canvas with its inspector open.",
            "approval": "approved"
          },
          {
            "id": "orchestrator",
            "title": "Orchestrator settings",
            "description": "The locked orchestrator selected in the Standalone strip, with its harness, model and access settings in the inspector.",
            "approval": "approved"
          },
          {
            "id": "edit-with-agent",
            "title": "Edit with agent",
            "description": "An agent proposal on the canvas, with the builder activity in the right pane, reviewed before it is applied.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "task",
        "title": "Task",
        "description": "Task detail: a slim top bar, the transcript, inline approvals and the composer.",
        "states": [
          {
            "id": "running",
            "title": "Running",
            "description": "A running task with expanded and collapsed tool calls and a follow-up composer.",
            "approval": "approved"
          },
          {
            "id": "approval",
            "title": "Waiting for approval",
            "description": "An approval card in the transcript, answered inline.",
            "approval": "approved"
          },
          {
            "id": "done",
            "title": "Done, changes pane",
            "description": "A finished task with the summary and the changes pane open.",
            "approval": "approved"
          },
          {
            "id": "failed",
            "title": "Failed",
            "description": "A failed task with the fact and the fix.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "parallel-group",
        "title": "Parallel group",
        "description": "One flat sidebar row with the parallel icon; its page shows the lanes.",
        "states": [
          {
            "id": "lanes",
            "title": "Lanes",
            "description": "Agents side by side, each in its own lane with its own composer. Started only through MCP.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "workflow-run",
        "title": "Workflow run",
        "description": "A workflow run as a graph, as parallel lanes, and its recovery and on-demand states.",
        "states": [
          {
            "id": "graph-needs-you",
            "title": "Graph, needs you",
            "description": "Run graph flowing left to right with a node that needs the person.",
            "approval": "approved"
          },
          {
            "id": "parallel",
            "title": "Parallel view",
            "description": "The run's agents as lanes with their transcripts.",
            "approval": "approved"
          },
          {
            "id": "recovery",
            "title": "Paused, recovery",
            "description": "A paused run with a failed node and the recovery actions.",
            "approval": "approved"
          },
          {
            "id": "on-demand",
            "title": "On-demand node selected",
            "description": "A standalone on-demand node selected on a run to inspect its calls.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "resources",
        "title": "Resources",
        "description": "Concurrency capacity per harness.",
        "states": [
          {
            "id": "slots",
            "title": "Slots",
            "description": "Slots in use per harness, the tasks holding them, and tasks waiting for a slot.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "statistics",
        "title": "Statistics",
        "description": "Usage over a time range.",
        "states": [
          {
            "id": "overview",
            "title": "Overview",
            "description": "Headline numbers, tasks per day, and a per-harness breakdown.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "settings",
        "title": "Settings",
        "description": "Appearance, behaviour, runtime and harness management.",
        "states": [
          {
            "id": "general",
            "title": "General",
            "description": "Appearance, behaviour toggles, runtime and task store.",
            "approval": "approved"
          },
          {
            "id": "harnesses",
            "title": "Harnesses",
            "description": "Registration, install state and qualification for each harness.",
            "approval": "approved"
          },
          {
            "id": "mcp-approvals",
            "title": "MCP approvals",
            "description": "Global tool approvals listed and managed inline.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "menu-bar",
        "title": "Menu bar",
        "description": "The menu bar popover and its monochrome template glyph.",
        "states": [
          {
            "id": "busy",
            "title": "Busy",
            "description": "Running work and requests answered inline from the popover.",
            "approval": "approved"
          },
          {
            "id": "empty",
            "title": "Nothing running",
            "description": "No tasks yet, with the way to open Harflow.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "app-states",
        "title": "App states",
        "description": "First run, loading and engine failure.",
        "states": [
          {
            "id": "setup",
            "title": "First run, setup",
            "description": "Preparing the runtime and registering Harflow with the harnesses.",
            "approval": "approved"
          },
          {
            "id": "loading",
            "title": "Loading",
            "description": "Connecting to the engine.",
            "approval": "approved"
          },
          {
            "id": "engine-error",
            "title": "Engine not running",
            "description": "The engine cannot be reached, with the fix.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "brand",
        "title": "Brand",
        "description": "The brand book of the Harflow Desktop design system: principles, the brand mark, appearance, voice, visual foundations, layout and iconography.",
        "states": [
          {
            "id": "principles",
            "title": "Principles",
            "description": "The design principles: minimal, quiet surfaces, one accent, mid-grey dark mode and status as glyph plus word.",
            "approval": "approved"
          },
          {
            "id": "brand-mark",
            "title": "Brand mark",
            "description": "The violet app icon, the CSS brand mark and the monochrome menu bar glyph, at several sizes on both appearances.",
            "approval": "approved"
          },
          {
            "id": "appearance",
            "title": "Appearance",
            "description": "System, Light and Dark, and where the appearance toggle sits.",
            "approval": "approved"
          },
          {
            "id": "content-fundamentals",
            "title": "Content fundamentals",
            "description": "Voice, button wording, the closed status vocabulary, time formats, access levels, terminology and sample content.",
            "approval": "approved"
          },
          {
            "id": "visual-foundations",
            "title": "Visual foundations",
            "description": "Colour roles, type styles, spacing, radius and elevation rules.",
            "approval": "approved"
          },
          {
            "id": "layout",
            "title": "Layout",
            "description": "Fixed sizes of the sidebar, rail, content column, right pane, title bar and rows.",
            "approval": "approved"
          },
          {
            "id": "iconography",
            "title": "Iconography",
            "description": "The 16px stroke icon set, drawn as CSS masks, and how to mark it up.",
            "approval": "approved"
          },
          {
            "id": "using-the-components",
            "title": "Using the components",
            "description": "How the plain HTML components use tokens, classes and real elements.",
            "approval": "approved"
          },
          {
            "id": "not-in-this-system",
            "title": "Not in this system",
            "description": "What the design system leaves out.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "foundations",
        "title": "Foundations",
        "description": "Every design token with its value and usage: colour, typography, spacing, radius, sizes and elevation.",
        "states": [
          {
            "id": "colour",
            "title": "Colour",
            "description": "Every colour token with a live swatch, its light and dark values and its usage.",
            "approval": "approved"
          },
          {
            "id": "typography",
            "title": "Typography",
            "description": "Font families and every text style, each rendered as a live sample.",
            "approval": "approved"
          },
          {
            "id": "spacing-radius",
            "title": "Spacing, radius and size",
            "description": "Spacing steps, corner radii and fixed layout sizes drawn from the tokens.",
            "approval": "approved"
          },
          {
            "id": "elevation",
            "title": "Elevation",
            "description": "The shadow tokens on sample cards, with usage.",
            "approval": "approved"
          }
        ]
      },
      {
        "id": "components",
        "title": "Components",
        "description": "The Harflow Desktop design system components as used by the screens. Every class is prefixed hd-.",
        "states": [
          {
            "id": "cover",
            "title": "Cover",
            "description": "The design system cover: a sidebar slab with satellite shapes, the Needs you dot and the violet blossom app icon.",
            "approval": "approved"
          },
          {
            "id": "button",
            "title": "Button",
            "description": "Button triggers an action; four styles and two sizes cover every command in the app. Use it for: Primary: the one main action in a view (Run, Approve); Secondary: other actions beside it (Reject, Keep running); Ghost: low-emphasis actions (Edit, Take over in terminal).",
            "approval": "approved"
          },
          {
            "id": "menu",
            "title": "Menu",
            "description": "Menu is a small popover list for choosing an option or running an action. Use it for: Opened from a pill or an overflow button; Not for navigation; use the sidebar or Tabs.",
            "approval": "approved"
          },
          {
            "id": "pill",
            "title": "Pill",
            "description": "Pill is a compact option chip: the composer choices and the workflow chip. Use it for: Composer options along the bottom edge: folder, harness plus model, access level; The accent pill shows the selected workflow in the Run composer; Each pill with a chevron opens a Menu.",
            "approval": "approved"
          },
          {
            "id": "theme-toggle",
            "title": "Theme toggle",
            "description": "Theme toggle switches the app appearance between System, Light and Dark. Use it for: In the sidebar footer, beside Settings; In the collapsed rail, use the single cycling button instead of the group.",
            "approval": "approved"
          },
          {
            "id": "changed-files",
            "title": "Changed files",
            "description": "Changed files lists files changed by a task and shows a diff. Use it for: The Changes tab of the right pane.",
            "approval": "approved"
          },
          {
            "id": "slot-meter",
            "title": "Slot meter",
            "description": "Slot meter shows how much of a harness's concurrency capacity is in use. Use it for: The Resources page: one meter per harness.",
            "approval": "approved"
          },
          {
            "id": "stat-tile",
            "title": "Stat tile",
            "description": "Stat tile shows one headline number with a label and a note. Use it for: Statistics page, in a `hd-grid--4` (or 3, 2).",
            "approval": "approved"
          },
          {
            "id": "workflow-row",
            "title": "Workflow row",
            "description": "Workflow row is one workflow in the Workflows list, with its node count and Edit and Run actions. It shows no run status: the same workflow can run several times at once, and those runs appear in the sidebar under Running and Recent work. Use it for: The Workflows page and any list of saved workflows.",
            "approval": "approved"
          },
          {
            "id": "banner",
            "title": "Banner",
            "description": "Banner reports an error or a warning inline, with an action to fix it. Use it for: Engine or harness problems; limits reached.",
            "approval": "approved"
          },
          {
            "id": "empty-state",
            "title": "Empty state",
            "description": "Empty state explains an empty view and offers the next step. Use it for: No Needs you items, no workflows, no results.",
            "approval": "approved"
          },
          {
            "id": "skeleton",
            "title": "Skeleton",
            "description": "Skeleton is a placeholder shape shown while content loads. Use it for: Lists and text blocks that load asynchronously.",
            "approval": "approved"
          },
          {
            "id": "icons",
            "title": "Icons",
            "description": "Icons is the set of 39 stroke icons, drawn as CSS masks so they take the current text colour. Use it for: Next to a label, in a button, row, pill or menu item; Alone only in an icon button, with an `aria-label` on the button; Do not use icons as decoration; each one should carry meaning.",
            "approval": "approved"
          },
          {
            "id": "composer",
            "title": "Composer",
            "description": "Composer is the input box for starting a task, replying to an agent, or running a workflow. Use it for: New task: centred under the greeting; Follow-up: pinned at the bottom of a task; Workflow run: with a workflow pill and input fields.",
            "approval": "approved"
          },
          {
            "id": "form-controls",
            "title": "Form controls",
            "description": "Form controls are the switch, the stepper and the form row that lays them out beside a label. Use it for: Switch: an on/off setting that applies at once (Override orchestrator harness); Stepper: a small whole number (Turn limit, slot limit); Form row: any label-and-control pair in settings, dialogs and the inspector.",
            "approval": "approved"
          },
          {
            "id": "text-field",
            "title": "Text field",
            "description": "Text field is a labelled single-line input, textarea, search field or select-looking button. Use it for: Forms, workflow inputs and settings; Search uses `hd-search` with a leading icon.",
            "approval": "approved"
          },
          {
            "id": "sidebar",
            "title": "Sidebar",
            "description": "Sidebar is the 264px navigation column; it collapses to a 56px icon rail. Use it for: Always present on the left of the window; Collapse to the rail with the sidebar icon button.",
            "approval": "approved"
          },
          {
            "id": "sidebar-nav-item",
            "title": "Sidebar nav item",
            "description": "Sidebar nav item is one row of primary navigation in the sidebar. Use it for: Top-level destinations: New task, Needs you, Workflows, Resources, Statistics, Settings.",
            "approval": "approved"
          },
          {
            "id": "sidebar-task-row",
            "title": "Sidebar task row",
            "description": "Sidebar task row is one task or workflow run in the Running and Recent work lists. Use it for: Inside the sidebar sections Running and Recent work; Tasks and workflow runs share the row; the glyph tells them apart.",
            "approval": "approved"
          },
          {
            "id": "tabs",
            "title": "Tabs",
            "description": "Tabs switches between panes of a view; the segmented control switches a filter or range. Use it for: `hd-tabs`: Changes, Artifacts, Events in the task pane; `hd-seg`: a small set of mutually exclusive options such as a time range.",
            "approval": "approved"
          },
          {
            "id": "dialog",
            "title": "Dialog",
            "description": "Dialog asks for a decision that blocks the screen behind it. Use it for: Confirming destructive actions such as cancelling a task.",
            "approval": "approved"
          },
          {
            "id": "status-badge",
            "title": "Status badge",
            "description": "Status badge shows a task or run status as a glyph plus its word. Use it for: Task header and detail views where the status needs a label; In lists use the bare glyph (SidebarTaskRow).",
            "approval": "approved"
          },
          {
            "id": "approval-card",
            "title": "Approval card",
            "description": "Approval card asks the person to approve, reject or answer something inline in the transcript. Use it for: The agent needs permission (command, publish) or an answer.",
            "approval": "approved"
          },
          {
            "id": "tool-call-row",
            "title": "Tool call row",
            "description": "Tool call row is a one-line summary of a tool call that expands to show its output. Use it for: Between agent messages in a transcript; keeps tool noise to one line each.",
            "approval": "approved"
          },
          {
            "id": "transcript-message",
            "title": "Transcript message",
            "description": "Transcript message renders the conversation: user bubbles, agent prose, turn separators and the working indicator. Use it for: Inside `hd-transcript`, the centred 760px column of a task.",
            "approval": "approved"
          },
          {
            "id": "inspector",
            "title": "Inspector",
            "description": "Inspector is the right panel of the workflow editor that edits the selected node. Use it for: In the workflow editor, beside the canvas, when a node is selected; Not for task detail; that uses the right pane with tabs.",
            "approval": "approved"
          },
          {
            "id": "node-tray",
            "title": "Node tray",
            "description": "Node tray is the editor's bottom tray of draggable node chips, with the zoom control and the Standalone strip. Use it for: In the workflow editor, over the canvas, to add nodes by dragging; The zoom control sits at a canvas corner; the Standalone strip sits between the top bar and the canvas.",
            "approval": "approved"
          },
          {
            "id": "parallel-lanes",
            "title": "Parallel lanes",
            "description": "Parallel lanes show the agents of a parallel group side by side, each in its own lane with its own composer. Use it for: In the run view of a parallel group, so every agent is visible at once; Not for a single agent; that uses the normal task detail.",
            "approval": "approved"
          },
          {
            "id": "workflow-node",
            "title": "Workflow node",
            "description": "Workflow node is a step on the workflow canvas, connected to others by edges. Use it for: The workflow editor and run view.",
            "approval": "approved"
          }
        ]
      }
    ]
  };

  // Fills the appearance placeholders of a template. `selection` is the chosen
  // appearance (system, light or dark); `resolved` is the appearance applied
  // (light or dark).
  HFV2.fill = function (template, selection, resolved) {
    var icon = selection === 'system' ? 'monitor' : (resolved === 'dark' ? 'moon' : 'sun');
    return template
      .split('{{theme}}').join(resolved)
      .split('{{lightOn}}').join(String(selection === 'light'))
      .split('{{darkOn}}').join(String(selection === 'dark'))
      .split('{{systemOn}}').join(String(selection === 'system'))
      .split('{{themeIcon}}').join(icon);
  };

  HFV2.stateKeys = function () {
    var keys = [];
    HFV2.registry.families.forEach(function (family) {
      family.states.forEach(function (state) { keys.push(family.id + '/' + state.id); });
    });
    return keys;
  };
})();
