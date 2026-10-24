# Product terminology

This glossary governs user-facing design copy. The terminology was requested during the workflow-run design pass; product implementation is tracked in [HarflowMac #16](https://github.com/Harflow-Dev/HarflowMac/issues/16). It does not rename public fields or internal adapter symbols.

| Term | Meaning and usage |
| --- | --- |
| Harness | Installed execution tool, such as Claude Code, Codex CLI, opencode, Mistral Vibe, or Antigravity. Use in tool selectors, filters, and tool status. |
| Agent | Autonomous AI participant doing work. A harness runs an agent. Retain for orchestrators, workers, and generated roles, including multiple agents using one harness. |
| Model | Selected model inside a harness. Keep separate from harness identity and agent role. |
| Orchestrator | Agent coordinating a workflow and choosing its next actions. |
| Worker | Agent assigned a task or node. Planning, Implementation, Review, and Test describe roles rather than harnesses. |
| Workflow | Saved definition of nodes and transitions. |
| Node | Unit in a workflow graph, including branching, parallel execution, and nested workflows. Use in canvas, inspector, accessibility labels, guides, and technical explanations. Use step only for ordinary procedural instructions. |
| Workflow run / Run | One execution of a workflow. Prefer Workflow run when Run is ambiguous. |
| Task | One assigned unit of work, with its own identity and lifecycle. Keep distinct from Workflow run. |
| Session | Harness conversation/context that can resume across task executions. Show the harness separately. |
| Execution mode | Launch mechanism, such as Headless or Orchestrator subagent. Keep separate from the Harness selector. |
| Runtime | Packaged Python engine and dependencies, distinct from external harnesses. |
| MCP client | Application connecting to Harflow through MCP. |
| Access level | Requested read/write/publish scope. Describe actual enforced permissions separately. |
| Activity | Event stream shown to users. |
| Harflow | Application/product name. Historical source paths may retain older names where needed for accurate provenance. |

## Applying the glossary

Inventory each actual label before replacing it. A selector listing execution tools uses Harness; a count of autonomous participants uses Agent. Where harness context is already clear, use Model instead of Agent model. Use Session instead of Agent session.

Preserve accurate internal Backend adapter abstractions and fixture keys. Public tool/CLI field renames require the explicit v1 contract reset, with corresponding contract fixtures, caller documentation, and consumer changes; they are not copy edits. Source excerpts and historical provenance remain exact and are labeled when they differ from the design.

New reference captures remain outside Git. The editable design fixtures and accessibility labels use this glossary; native reference images may show prior product terminology until the native ticket is implemented.
