# HarflowDesign migration sessions

Status: planned. The [workspace session index](../../HARFLOW_MIGRATION_SESSIONS.md) defines dispatch order; the [repository checklist](migration-plan.md) retains full item criteria. These session specifications include work led or co-owned by this repository.

## Dispatch protocol

Read the workspace `AGENTS.md` and `HARFLOW_MIGRATION_CHECKLIST.md`, the lead and co-owned repositories' `AGENTS.md` files where present, their `docs/migration-plan.md` files, applicable package guidance, and the session and all accepted prerequisite receipts before work. The workspace session index gives the full sequence. A session is a bounded assignment, not an instruction to start the next session. A standalone session lead owns the normal required plan/code reviews, test delegation and validation; a worker explicitly handed off by an orchestrator follows that handoff and does not restart its workflow. Stop and report a concrete unresolved ambiguity or missing prerequisite instead of inventing a decision.

Use primary checkouts and preserve concurrent work. Never share a writable state root between engines or import historical task/run/event state. Work on isolated roots and fixtures unless separately authorized. MCP owns canonical contracts until explicit S50 transfer. Cross-repository package changes require a committed producer, exact consumer pin and clean install without sibling source dependencies; a necessary push requires current authorization. Do not run concurrent sessions that mutate the same repository, generated contract bundle or IPC boundary. Within a session, coordinate delegated workers through explicit file ownership. Approval for publication, signing, paid probes, live state, registrations, cutover and retirement is separate and current; prepare concrete evidence first.

A session receipt is proposed at the lead repository's `docs/migration-receipts/<session>.md`. It records prerequisites, accepted scope and decisions, exact commits for every involved repository, contract/design/package/runtime identities, actual commands and results, platform and profiles, acceptance evidence, deviations, missing checks and authorization or blockers. Distinguish local, committed, pushed, CI-passed, packaged and released states. It contains technical evidence, not review transcripts. A multi-repository session has one lead receipt covering each repository. A receipt is accepted only after the applicable review and owner decisions. All sessions here are planned, not accepted.

Checklist items may span sessions. Each mention is partial until the final contributing session identified below; even then, check the source item only after all contributing receipts and the full original item acceptance have been reviewed and accepted. The sequential order is the safe default; S25's isolated research exception and optional sessions are explicit. There is no duration guarantee. Defects or follow-up work discovered during a session need separately scoped assignments; they do not automatically expand or advance the session.

Copyable dispatch (replace bracketed inputs):

```text
Run session Sxx from HARFLOW_MIGRATION_SESSIONS.md and the lead repository's docs/migration-sessions.md.
Accepted prerequisite receipt paths and IDs: [paths and IDs]
Pinned contract, design, package and runtime identities: [commits, digests and paths]
Allowed isolated roots, fixtures and external actions: [scope and authorizations]
Return the session receipt at the specified lead-repository path, including all repository commits, evidence, decisions and blockers. Complete only this session; do not start the next.
```

For optional work replace `Sxx` with `X01`, `X02` or `X03`.

## Sessions

### S03 — Freeze, parity and scope decisions

- Status: planned. Lead: HarflowMCP. Co-owned: HarflowMac, HarflowDesign, HarflowEngine, HarflowWeb.
- Prerequisite receipts: S02.
- Checklist coverage: B0-MC-02 (final contribution), B0-MA-04 (final contribution), B0-DS-01 (final contribution), C0-DS-04 (partial), B0-EN-01 (final contribution), B0-WE-01 (partial).
- Scope and acceptance: Obtain owner decisions on freeze, parity, scope, representative datasets and performance budgets; inventory design approvals, engine scaffold and deferred Web; record accepted baselines and unknowns.
- Output: lead receipt `docs/migration-receipts/S03.md`, with the evidence and identities required by the dispatch protocol.

### S10 — Approved macOS design references

- Status: planned. Lead: HarflowDesign. Co-owned: HarflowMac.
- Prerequisite receipts: S09.
- Checklist coverage: C0-DS-01 (final contribution), C0-DS-02 (final contribution), C0-DS-03 (final contribution), C0-DS-04 (final contribution), E0-DS-01 (final contribution).
- Scope and acceptance: Prepare macOS adaptations and token/state references, including accessibility, interactions and appearances; obtain explicit owner approval and record commit/path/state or stop on missing decisions.
- Output: lead receipt `docs/migration-receipts/S10.md`, with the evidence and identities required by the dispatch protocol.

### S11 — Client contract boundary

- Status: planned. Lead: HarflowClient. Co-owned: HarflowMCP, HarflowDesign.
- Prerequisite receipts: S09 and S10, with approved references for the assigned states.
- Checklist coverage: C0-CL-01 (final contribution), C0-CL-02 (final contribution), C0-CL-03 (final contribution).
- Scope and acceptance: Deliver traceable immutable types, validators, injected ports, fakes and contract checks, with pinned contract and approved design identities.
- Output: lead receipt `docs/migration-receipts/S11.md`, with the evidence and identities required by the dispatch protocol.

### S12 — Client shell and components

- Status: planned. Lead: HarflowClient. Co-owned: HarflowDesign.
- Prerequisite receipts: S11.
- Checklist coverage: E0-CL-04 (partial), E0-CL-06 (partial), E0-CL-14 (partial).
- Scope and acceptance: Deliver tokens, components, shell and navigation coordinator; exercise fake ports, keyboard, lifecycle and approved states.
- Output: lead receipt `docs/migration-receipts/S12.md`, with the evidence and identities required by the dispatch protocol.

### S13 — Secure Electron shell

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowDesign.
- Prerequisite receipts: S12.
- Checklist coverage: C0-DE-02 (final contribution), E0-DE-01 (final contribution), E0-DE-05 (partial).
- Scope and acceptance: Implement allowlisted validated IPC, trusted sender and navigation boundaries, sandboxed shell and macOS lifecycle; validate security and actual window behavior.
- Output: lead receipt `docs/migration-receipts/S13.md`, with the evidence and identities required by the dispatch protocol.

### S23 — Native integration

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowClient, HarflowDesign.
- Prerequisite receipts: S22.
- Checklist coverage: E0-DE-03 (final contribution), E0-DE-05 (final contribution).
- Scope and acceptance: Deliver scoped tray, notifications, deep links, dialogs and single instance; verify native interactions and approved design states.
- Output: lead receipt `docs/migration-receipts/S23.md`, with the evidence and identities required by the dispatch protocol.

### S24 — Electron on Python acceptance

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowMCP, HarflowMac, HarflowDesign, HarflowClient.
- Prerequisite receipts: S23.
- Checklist coverage: E0-MC-01 (final contribution), E0-MA-01 (final contribution), E0-DS-02 (final contribution), E0-CL-05 (final contribution), E0-CL-06 (final contribution), E0-CL-07 (final contribution), E0-CL-14 (final contribution), E0-DE-02 (final contribution), E0-DE-06 (final contribution), E0-DE-12 (final contribution).
- Scope and acceptance: Run full E0 scenarios including reconnect, disposal, accessibility, production pixels, performance, clean pinned install and sandbox smoke; accept exact app/client/Python/contract identities and limitations.
- Output: lead receipt `docs/migration-receipts/S24.md`, with the evidence and identities required by the dispatch protocol.

### S45 — Integrated Rust acceptance

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowClient, HarflowDesign, HarflowEngine.
- Prerequisite receipts: S44.
- Checklist coverage: I0-DE-01 (final contribution), I0-DE-03 (partial), I0-CL-01 (final contribution), I0-DS-01 (final contribution), I0-EN-01 (final contribution).
- Scope and acceptance: Re-run full Rust-backed macOS acceptance, production pixels, accessibility, performance, clean-user install and upgrade; verify no hidden Python or private store coupling.
- Output: lead receipt `docs/migration-receipts/S45.md`, with the evidence and identities required by the dispatch protocol.

### X01 — Linux qualification

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowDesign, HarflowEngine, HarflowClient.
- Prerequisite receipts: S45 (accepted macOS integration).
- Checklist coverage: I0-DS-02 (partial), I0-DE-03 (partial).
- Scope and acceptance: After integrated macOS acceptance, approve Linux design and independently qualify Linux x86_64 engine, backend and Desktop with native evidence before claiming support.
- Output: lead receipt `docs/migration-receipts/X01.md`, with the evidence and identities required by the dispatch protocol.

### X02 — Windows qualification

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowDesign, HarflowEngine, HarflowClient.
- Prerequisite receipts: S45 (accepted macOS integration) and X01 (Linux qualification).
- Checklist coverage: I0-DS-02 (final contribution), I0-DE-03 (final contribution).
- Scope and acceptance: After integrated macOS acceptance, approve Windows design and independently qualify Windows x86_64 engine, backend and Desktop with native evidence; does not block owner cutover.
- Output: lead receipt `docs/migration-receipts/X02.md`, with the evidence and identities required by the dispatch protocol.
