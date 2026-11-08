// Areas, families and states of the Harflow Desktop interface reference.
// Route format: family/state. A state is rendered from its template, by the renderer named in its
// `source`; states without a `source` render the template with their own route as the key.
// Screen scripts add their states with HFV2.registerState; supersessions.js lists retired states and their redirects.
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
    "defaultRoute": "overview/areas",
    "areas": [
      {
        "id": "start-work",
        "title": "Start work"
      },
      {
        "id": "task",
        "title": "Task"
      },
      {
        "id": "attention",
        "title": "Attention"
      },
      {
        "id": "workflows",
        "title": "Workflows"
      },
      {
        "id": "capacity",
        "title": "Capacity and usage"
      },
      {
        "id": "settings",
        "title": "Settings and setup"
      },
      {
        "id": "design-system",
        "title": "Design system"
      }
    ],
    "families": [
      {
        "id": "overview",
        "title": "Overview",
        "area": null,
        "description": "The areas of the product, the screens in each, how many current states each screen has and the decision behind it.",
        "states": [
          {
            "id": "areas",
            "title": "Areas and screens",
            "description": "Every area with its screens, their current states and where each decision is recorded.",
            "status": "record",
            "approvalNote": "Index of the current design · not a design state"
          }
        ]
      },
      {
        "id": "new-task",
        "title": "New task",
        "area": "start-work",
        "groups": [
          "Entry",
          "Composer",
          "Task options",
          "Loading"
        ],
        "description": "Starting a task: the greeting, the composer with its option pills and the task options.",
        "states": []
      },
      {
        "id": "sidebar",
        "title": "Sidebar",
        "area": "start-work",
        "groups": [
          "Layout",
          "Recent work",
          "Loading"
        ],
        "description": "The navigation column expanded, collapsed to the icon rail and at the minimum window, with Running and Recent work and their loading, failure and reconnecting states. Owner correction (2026-11-06): the sidebar body (navigation, Running, Recent work) scrolls as one bounded area with the header and the Settings and appearance footer fixed, in every layout.",
        "states": []
      },
      {
        "id": "task",
        "title": "Task",
        "area": "task",
        "groups": [
          "Status",
          "Actions",
          "Top bar",
          "Transcript",
          "Changes",
          "Events",
          "Artifacts",
          "Layout",
          "Loading"
        ],
        "description": "Task detail: a slim top bar, the transcript, inline approvals and the composer, with every status, the actions menu, the changes, events and artifacts panes and the adaptive layout.",
        "states": [
          {
            "id": "approval",
            "title": "Waiting for approval",
            "description": "An approval card in the transcript, answered inline.",
            "status": "approved",
            "group": "Status"
          }
        ]
      },
      {
        "id": "parallel-group",
        "title": "Parallel group",
        "area": "task",
        "groups": [
          "Parallel group",
          "Loading"
        ],
        "description": "One flat sidebar row with the parallel icon; its page shows the lanes.",
        "states": [
          {
            "id": "lanes",
            "title": "Lanes",
            "description": "Agents side by side, each in its own lane with its own composer. Started only through MCP.",
            "status": "approved",
            "group": "Parallel group"
          }
        ]
      },
      {
        "id": "needs-you",
        "title": "Needs you",
        "area": "attention",
        "groups": [
          "Needs you",
          "Loading"
        ],
        "description": "Every request that waits for the person, answered inline.",
        "states": [
          {
            "id": "waiting",
            "title": "Waiting items",
            "description": "Approvals and a question from tasks and workflow runs, each answerable in place.",
            "status": "approved",
            "group": "Needs you"
          },
          {
            "id": "empty",
            "title": "Empty",
            "description": "Nothing waits for the person.",
            "status": "approved",
            "group": "Needs you"
          }
        ]
      },
      {
        "id": "menu-bar",
        "title": "Menu bar",
        "area": "attention",
        "groups": [
          "Menu bar",
          "Loading"
        ],
        "description": "The menu bar popover and its monochrome template glyph.",
        "states": [
          {
            "id": "busy",
            "title": "Busy",
            "description": "Running work and requests answered inline from the popover.",
            "status": "approved",
            "group": "Menu bar"
          },
          {
            "id": "empty",
            "title": "Nothing running",
            "description": "No tasks yet, with the way to open Harflow.",
            "status": "approved",
            "group": "Menu bar"
          }
        ]
      },
      {
        "id": "workflows",
        "title": "Workflows",
        "area": "workflows",
        "groups": [
          "Workflows",
          "Loading"
        ],
        "description": "The workflow list and the Run workflow sheet.",
        "states": [
          {
            "id": "list",
            "title": "List",
            "description": "Workflows with node count, Edit and Run. No run status is shown.",
            "status": "approved",
            "group": "Workflows"
          },
          {
            "id": "empty",
            "title": "Empty",
            "description": "No workflows yet, with the next step.",
            "status": "approved",
            "group": "Workflows"
          },
          {
            "id": "run",
            "title": "Run workflow",
            "description": "Task (required), Goal (optional), repository and orchestrator override.",
            "status": "approved",
            "group": "Workflows"
          }
        ]
      },
      {
        "id": "workflow-editor",
        "title": "Workflow editor",
        "area": "workflows",
        "groups": [
          "Workflow editor",
          "Loading"
        ],
        "description": "The canvas editor, flowing left to right, with the inspector for the selected node.",
        "states": [
          {
            "id": "node-selected",
            "title": "Node selected",
            "description": "A node selected on the canvas with its inspector open.",
            "status": "approved",
            "group": "Workflow editor"
          },
          {
            "id": "orchestrator",
            "title": "Orchestrator settings",
            "description": "The locked orchestrator selected in the Standalone strip, with its harness, model and access settings in the inspector.",
            "status": "approved",
            "group": "Workflow editor"
          },
          {
            "id": "edit-with-agent",
            "title": "Edit with agent",
            "description": "The changes the agent suggests on the canvas, with the builder activity in the right pane, reviewed before they are applied.",
            "status": "approved",
            "group": "Workflow editor"
          }
        ]
      },
      {
        "id": "workflow-run",
        "title": "Workflow run",
        "area": "workflows",
        "groups": [
          "Workflow run",
          "Loading"
        ],
        "description": "A workflow run as a graph, as parallel lanes, and its recovery and on-demand states.",
        "states": [
          {
            "id": "graph-needs-you",
            "title": "Graph, needs you",
            "description": "Run graph flowing left to right with a node that needs the person.",
            "status": "approved",
            "group": "Workflow run"
          },
          {
            "id": "parallel",
            "title": "Parallel view",
            "description": "The run's agents as lanes with their transcripts.",
            "status": "approved",
            "group": "Workflow run"
          },
          {
            "id": "recovery",
            "title": "Paused, recovery",
            "description": "A paused run with a failed node and the recovery actions.",
            "status": "approved",
            "group": "Workflow run"
          },
          {
            "id": "on-demand",
            "title": "On-demand node selected",
            "description": "A standalone on-demand node selected on a run to inspect its calls.",
            "status": "approved",
            "group": "Workflow run"
          }
        ]
      },
      {
        "id": "resources",
        "title": "Resources",
        "area": "capacity",
        "groups": [
          "Resources",
          "Loading"
        ],
        "description": "Concurrency capacity per harness.",
        "states": [
          {
            "id": "slots",
            "title": "Slots",
            "description": "Slots in use per harness, the tasks holding them, and tasks waiting for a slot.",
            "status": "approved",
            "group": "Resources"
          }
        ]
      },
      {
        "id": "statistics",
        "title": "Statistics",
        "area": "capacity",
        "groups": [
          "Statistics",
          "Loading"
        ],
        "description": "Usage over a time range.",
        "states": [
          {
            "id": "overview",
            "title": "Overview",
            "description": "Headline numbers, tasks per day, and a per-harness breakdown.",
            "status": "approved",
            "group": "Statistics"
          }
        ]
      },
      {
        "id": "settings",
        "title": "Settings",
        "area": "settings",
        "groups": [
          "Settings",
          "Loading"
        ],
        "description": "Appearance, behaviour, runtime and harness management.",
        "states": [
          {
            "id": "general",
            "title": "General",
            "description": "Appearance, behaviour toggles, runtime and task store.",
            "status": "approved",
            "group": "Settings"
          },
          {
            "id": "harnesses",
            "title": "Harnesses",
            "description": "Registration, install state and qualification for each harness.",
            "status": "approved",
            "group": "Settings"
          },
          {
            "id": "mcp-approvals",
            "title": "MCP approvals",
            "description": "Global tool approvals listed and managed inline.",
            "status": "approved",
            "group": "Settings"
          }
        ]
      },
      {
        "id": "app-states",
        "title": "App states",
        "area": "settings",
        "description": "First run, loading and engine failure.",
        "states": [
          {
            "id": "setup",
            "title": "First run, setup",
            "description": "Preparing the runtime and registering Harflow with the harnesses.",
            "status": "approved"
          },
          {
            "id": "loading",
            "title": "Loading",
            "description": "Connecting to the engine.",
            "status": "approved"
          },
          {
            "id": "engine-error",
            "title": "Engine not running",
            "description": "The engine cannot be reached, with the fix.",
            "status": "approved"
          }
        ]
      },
      {
        "id": "harness-runtime",
        "title": "Harness runtime",
        "area": "settings",
        "description": "Checking, installing and updating the managed runtime before work can start, and the first connection to the work listing.",
        "states": []
      },
      {
        "id": "records",
        "title": "Decision boards",
        "area": null,
        "hidden": true,
        "description": "Boards that compare the options behind a decision and record the one chosen. They are records, not design states.",
        "states": []
      },
      {
        "id": "brand",
        "title": "Brand",
        "area": "design-system",
        "description": "The brand book of the Harflow Desktop design system: principles, the brand mark, appearance, voice, visual foundations, layout and iconography.",
        "states": [
          {
            "id": "principles",
            "title": "Principles",
            "description": "The design principles: minimal, quiet surfaces, one accent, mid-grey dark mode and status as glyph plus word.",
            "status": "approved"
          },
          {
            "id": "brand-mark",
            "title": "Brand mark",
            "description": "The violet app icon, the CSS brand mark and the monochrome menu bar glyph, at several sizes on both appearances.",
            "status": "approved"
          },
          {
            "id": "appearance",
            "title": "Appearance",
            "description": "System, Light and Dark, and where the appearance toggle sits.",
            "status": "approved"
          },
          {
            "id": "content-fundamentals",
            "title": "Content fundamentals",
            "description": "Voice, button wording, the closed status vocabulary, time formats, access levels, terminology and sample content.",
            "status": "approved"
          },
          {
            "id": "visual-foundations",
            "title": "Visual foundations",
            "description": "Colour roles, type styles, spacing, radius and elevation rules.",
            "status": "approved"
          },
          {
            "id": "layout",
            "title": "Layout",
            "description": "Fixed sizes of the sidebar, rail, content column, right pane, title bar and rows.",
            "status": "approved"
          },
          {
            "id": "iconography",
            "title": "Iconography",
            "description": "The 16px stroke icon set, drawn as CSS masks, and how to mark it up.",
            "status": "approved"
          },
          {
            "id": "using-the-components",
            "title": "Using the components",
            "description": "How the plain HTML components use tokens, classes and real elements.",
            "status": "approved"
          },
          {
            "id": "not-in-this-system",
            "title": "Not in this system",
            "description": "What the design system leaves out.",
            "status": "approved"
          }
        ]
      },
      {
        "id": "foundations",
        "title": "Foundations",
        "area": "design-system",
        "description": "Every design token with its value and usage: colour, typography, spacing, radius, sizes and elevation.",
        "states": [
          {
            "id": "colour",
            "title": "Colour",
            "description": "Every colour token with a live swatch, its light and dark values and its usage.",
            "status": "approved"
          },
          {
            "id": "typography",
            "title": "Typography",
            "description": "Font families and every text style, each rendered as a live sample.",
            "status": "approved"
          },
          {
            "id": "spacing-radius",
            "title": "Spacing, radius and size",
            "description": "Spacing steps, corner radii and fixed layout sizes drawn from the tokens.",
            "status": "approved"
          },
          {
            "id": "elevation",
            "title": "Elevation",
            "description": "The shadow tokens on sample cards, with usage.",
            "status": "approved"
          }
        ]
      },
      {
        "id": "components",
        "title": "Components",
        "area": "design-system",
        "description": "The Harflow Desktop design system components as used by the screens. Every class is prefixed hd-.",
        "states": [
          {
            "id": "cover",
            "title": "Cover",
            "description": "The design system cover: a sidebar slab with satellite shapes, the Needs you dot and the violet blossom app icon.",
            "status": "approved"
          },
          {
            "id": "button",
            "title": "Button",
            "description": "Button triggers an action; four styles and two sizes cover every command in the app. Use it for: Primary: the one main action in a view (Run, Approve); Secondary: other actions beside it (Reject, Keep running); Ghost: low-emphasis actions (Edit, Take over in terminal).",
            "status": "approved"
          },
          {
            "id": "menu",
            "title": "Menu",
            "description": "Menu is a small popover list for choosing an option or running an action. Use it for: Opened from a pill or an overflow button; Not for navigation; use the sidebar or Tabs.",
            "status": "approved"
          },
          {
            "id": "pill",
            "title": "Pill",
            "description": "Pill is a compact option chip: the composer choices and the workflow chip. Use it for: Composer options along the bottom edge: folder, harness plus model, access level; The accent pill shows the selected workflow in the Run composer; Each pill with a chevron opens a Menu.",
            "status": "approved"
          },
          {
            "id": "theme-toggle",
            "title": "Theme toggle",
            "description": "Theme toggle switches the app appearance between System, Light and Dark. Use it for: In the sidebar footer, beside Settings; In the collapsed rail, use the single cycling button instead of the group.",
            "status": "approved"
          },
          {
            "id": "changed-files",
            "title": "Changed files",
            "description": "Changed files lists files changed by a task and shows a diff. Use it for: The Changes tab of the right pane.",
            "status": "approved"
          },
          {
            "id": "slot-meter",
            "title": "Slot meter",
            "description": "Slot meter shows how much of a harness's concurrency capacity is in use. Use it for: The Resources page: one meter per harness.",
            "status": "approved"
          },
          {
            "id": "stat-tile",
            "title": "Stat tile",
            "description": "Stat tile shows one headline number with a label and a note. Use it for: Statistics page, in a `hd-grid--4` (or 3, 2).",
            "status": "approved"
          },
          {
            "id": "workflow-row",
            "title": "Workflow row",
            "description": "Workflow row is one workflow in the Workflows list, with its node count and Edit and Run actions. It shows no run status: the same workflow can run several times at once, and those runs appear in the sidebar under Running and Recent work. Use it for: The Workflows page and any list of saved workflows.",
            "status": "approved"
          },
          {
            "id": "banner",
            "title": "Banner",
            "description": "Banner reports an error or a warning inline, with an action to fix it. Use it for: Engine or harness problems; limits reached.",
            "status": "approved"
          },
          {
            "id": "empty-state",
            "title": "Empty state",
            "description": "Empty state explains an empty view and offers the next step. Use it for: No Needs you items, no workflows, no results.",
            "status": "approved"
          },
          {
            "id": "skeleton",
            "title": "Skeleton",
            "description": "Skeleton is a placeholder shape shown while content loads. Use it for: Lists and text blocks that load asynchronously.",
            "status": "approved"
          },
          {
            "id": "skeleton-shimmer",
            "title": "Skeleton shimmer",
            "description": "Skeleton shimmer is the placeholder block of a screen's first load, with a sheen that sweeps every 1.4 seconds and a static form under reduced motion. Use it for: The data regions of a loading screen; the screen's real chrome stays as drawn.",
            "status": "provisional",
            "approvalNote": "Provisional · needs owner approval"
          },
          {
            "id": "icons",
            "title": "Icons",
            "description": "Icons is the set of 39 stroke icons, drawn as CSS masks so they take the current text colour. Use it for: Next to a label, in a button, row, pill or menu item; Alone only in an icon button, with an `aria-label` on the button; Do not use icons as decoration; each one should carry meaning.",
            "status": "approved"
          },
          {
            "id": "composer",
            "title": "Composer",
            "description": "Composer is the input box for starting a task, replying to an agent, or running a workflow. Use it for: New task: centred under the greeting; Follow-up: pinned at the bottom of a task; Workflow run: with a workflow pill and input fields.",
            "status": "approved"
          },
          {
            "id": "form-controls",
            "title": "Form controls",
            "description": "Form controls are the switch, the stepper and the form row that lays them out beside a label. Use it for: Switch: an on/off setting that applies at once (Override orchestrator harness); Stepper: a small whole number (Turn limit, slot limit); Form row: any label-and-control pair in settings, dialogs and the inspector.",
            "status": "approved"
          },
          {
            "id": "text-field",
            "title": "Text field",
            "description": "Text field is a labelled single-line input, textarea, search field or select-looking button. Use it for: Forms, workflow inputs and settings; Search uses `hd-search` with a leading icon.",
            "status": "approved"
          },
          {
            "id": "sidebar",
            "title": "Sidebar",
            "description": "Sidebar is the 264px navigation column; it collapses to a 56px icon rail. Use it for: Always present on the left of the window; Collapse to the rail with the sidebar icon button.",
            "status": "approved"
          },
          {
            "id": "sidebar-nav-item",
            "title": "Sidebar nav item",
            "description": "Sidebar nav item is one row of primary navigation in the sidebar. Use it for: Top-level destinations: New task, Needs you, Workflows, Resources, Statistics, Settings.",
            "status": "approved"
          },
          {
            "id": "sidebar-task-row",
            "title": "Sidebar task row",
            "description": "Sidebar task row is one task or workflow run in the Running and Recent work lists. Use it for: Inside the sidebar sections Running and Recent work; Tasks and workflow runs share the row; the glyph tells them apart.",
            "status": "approved"
          },
          {
            "id": "tabs",
            "title": "Tabs",
            "description": "Tabs switches between panes of a view; the segmented control switches a filter or range. Use it for: `hd-tabs`: Changes, Artifacts, Events in the task pane; `hd-seg`: a small set of mutually exclusive options such as a time range.",
            "status": "approved"
          },
          {
            "id": "dialog",
            "title": "Dialog",
            "description": "Dialog asks for a decision that blocks the screen behind it. Use it for: Confirming destructive actions such as cancelling a task.",
            "status": "approved"
          },
          {
            "id": "status-badge",
            "title": "Status badge",
            "description": "Status badge shows a task or run status as a glyph plus its word. Use it for: Task header and detail views where the status needs a label; In lists use the bare glyph (SidebarTaskRow).",
            "status": "approved"
          },
          {
            "id": "approval-card",
            "title": "Approval card",
            "description": "Approval card asks the person to approve, reject or answer something inline in the transcript. Use it for: The agent needs permission (command, publish) or an answer.",
            "status": "approved"
          },
          {
            "id": "tool-call-row",
            "title": "Tool call row",
            "description": "Tool call row is a one-line summary of a tool call that expands to show its output. Use it for: Between agent messages in a transcript; keeps tool noise to one line each.",
            "status": "approved"
          },
          {
            "id": "transcript-message",
            "title": "Transcript message",
            "description": "Transcript message renders the conversation: user bubbles, agent prose, turn separators and the working indicator. Use it for: Inside `hd-transcript`, the centred 760px column of a task.",
            "status": "approved"
          },
          {
            "id": "inspector",
            "title": "Inspector",
            "description": "Inspector is the right panel of the workflow editor that edits the selected node. Use it for: In the workflow editor, beside the canvas, when a node is selected; Not for task detail; that uses the right pane with tabs.",
            "status": "approved"
          },
          {
            "id": "node-tray",
            "title": "Node tray",
            "description": "Node tray is the editor's bottom tray of draggable node chips, shown with the zoom control and the Standalone strip. Use it for: In the workflow editor, over the canvas, to add nodes by dragging; The zoom control sits at the bottom-right corner of every canvas, in the editor and on a run. The Standalone strip sits between the top bar and the canvas.",
            "status": "approved"
          },
          {
            "id": "parallel-lanes",
            "title": "Parallel lanes",
            "description": "Parallel lanes show the agents of a parallel group side by side, each in its own lane with its own composer. Use it for: In the run view of a parallel group, so every agent is visible at once; Not for a single agent; that uses the normal task detail.",
            "status": "approved"
          },
          {
            "id": "workflow-node",
            "title": "Workflow node",
            "description": "Workflow node is a step on the workflow canvas, connected to others by edges. Use it for: The workflow editor and run view. The canvas includes the zoom control at its bottom-right.",
            "status": "approved"
          }
        ]
      }
    ]
  };

  HFV2.findFamily = function (id) {
    return HFV2.registry.families.filter(function (family) { return family.id === id; })[0] || null;
  };

  HFV2.findState = function (family, id) {
    return family.states.filter(function (state) { return state.id === id; })[0] || null;
  };

  HFV2.stateKeys = function () {
    var keys = [];
    HFV2.registry.families.forEach(function (family) {
      family.states.forEach(function (state) { keys.push(family.id + '/' + state.id); });
    });
    return keys;
  };

  // Renderers draw the app frame of their states themselves. Each is exposed as HFV2[api]
  // with mount(root, mountId); `wrapper` is the class list of the specimen that hosts it.
  HFV2.RENDERERS = {
    m04: { api: 'm04Proposal', wrapper: 'hdc-specimen hdc-specimen--m04' },
    m05: { api: 'm05Proposal', wrapper: 'hdc-specimen hdc-specimen--m05' },
    transcript: { api: 'transcriptScreen', wrapper: 'hdc-specimen hdc-specimen--m05 hdc-specimen--transcript' }
  };

  // Adds a state to a family and keeps the family's states in group order.
  HFV2.registerState = function (familyId, state) {
    var family = HFV2.findFamily(familyId);
    if (!family) throw new Error('Unknown family ' + familyId);
    if (HFV2.findState(family, state.id)) throw new Error('Duplicate route ' + familyId + '/' + state.id);
    family.states.push(state);
    if (family.groups) {
      family.states.sort(function (a, b) { return family.groups.indexOf(a.group) - family.groups.indexOf(b.group); });
    }
    return state;
  };

  // The route of the state a renderer draws from its own id, or null. A retired state is not
  // registered, so its route comes from HFV2.retired; opening it redirects to the replacement.
  HFV2.routeFor = function (renderer, mountId) {
    var found = null;
    HFV2.registry.families.forEach(function (family) {
      family.states.forEach(function (state) {
        var source = state.source;
        if (source && source.renderer === renderer && source.mount === mountId) found = family.id + '/' + state.id;
      });
    });
    if (!found) (HFV2.retired || []).forEach(function (entry) {
      if (entry.renderer === renderer && entry.mount === mountId) found = entry.route;
    });
    return found;
  };

  // The approval line of a state. The state's own approval is read before its family's, then the registry's.
  HFV2.approvalLine = function (family, state) {
    if (state.status === 'provisional' || state.status === 'record') return state.approvalNote || 'Not approved';
    var a = state.approval || family.approval || HFV2.registry.approval;
    var detail = a.decision || a.reference;
    return 'Approved by ' + a.by + ' on ' + a.date + (detail ? ' · ' + detail : ' · canvas ' + a.canvas + ' · design system ' + a.designSystem);
  };

  // Everything the catalog needs to draw one route, resolved in one place.
  HFV2.describe = function (route) {
    var parts = String(route).split('/');
    var family = HFV2.findFamily(parts[0]);
    var state = family && HFV2.findState(family, parts[1]);
    if (!state) return null;
    if (state.skeleton) {
      // A loading state draws the template and renderer of the loaded screen it mirrors; only its own metadata,
      // approval and skeleton declaration differ.
      var loaded = HFV2.describe(state.skeleton.of);
      return Object.assign({}, loaded, {
        route: route, family: family, state: state, guideKey: route, approval: HFV2.approvalLine(family, state),
        views: [], status: state.status, hidden: !!(state.hidden || family.hidden), skeleton: state.skeleton
      });
    }
    var source = state.source || {};
    var key = source.template || route;
    var renderer = source.renderer || null;
    var meta = (HFV2.componentMeta && HFV2.componentMeta[key]) || null;
    return {
      route: route,
      family: family,
      state: state,
      templateKey: key,
      renderer: renderer,
      mount: renderer ? source.mount : null,
      wrapperClass: renderer ? HFV2.RENDERERS[renderer].wrapper : (meta ? 'hdc-specimen hdc-specimen--component' : 'hdc-specimen'),
      componentMeta: meta,
      guideKey: source.guide || key,
      approval: HFV2.approvalLine(family, state),
      sizeCaption: !!renderer,
      views: state.views || [],
      status: state.status,
      hidden: !!(state.hidden || family.hidden)
    };
  };

  // States shown in navigation, the picker and the overview counts.
  HFV2.currentStates = function (family) {
    return family.hidden ? [] : family.states.filter(function (state) { return !state.hidden; });
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
})();
