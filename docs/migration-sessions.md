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

The [v2 coverage ledger](../../HarflowDesign/v2/docs/migration-coverage.md) is an optional workspace coordination reference, not a build dependency. S10-Gxx bounded gap sub-sessions follow scope approval and obtain exact design approval before dependent work; unresolved required states block only their dependent feature. Independent work continues. The approved mock does not establish runtime capability or authority. Existing S01 evidence and S02 status remain as recorded in their receipts.

## Sessions

### S03 — Freeze, parity and scope decisions

- Status: planned. Lead: HarflowMCP. Co-owned: HarflowMac, HarflowDesign, HarflowEngine, HarflowWeb.
- Prerequisite receipts: S02.
- Checklist coverage: B0-MC-02 (final contribution), B0-MA-04 (final contribution), B0-DS-01 (final contribution), C0-DS-04 (partial), B0-EN-01 (final contribution), B0-WE-01 (partial).
- Scope and acceptance: Record Keep, Simplify, Deliberately remove and Undecided decisions in the v2 coverage ledger; obtain decisions on freeze, representative datasets and performance budgets, preserving unresolved scope and approved removals.
- Output: lead receipt `docs/migration-receipts/S03.md`, with the evidence and identities required by the dispatch protocol.

### S10 — Approved v2 design and gap reconciliation

- Status: planned. Lead: HarflowDesign. Co-owned: HarflowMac.
- Prerequisite receipts: S09.
- Checklist coverage: C0-DS-01 (final contribution), C0-DS-02 (final contribution), C0-DS-03 (final contribution), C0-DS-04 (final contribution), E0-DS-01 (final contribution).
- Scope and acceptance: Reconcile the pinned approved v2 baseline, intent ledger and contract/design gaps. For each retained or approved simplified feature, commission missing states in v2 and obtain explicit owner approval with exact commit/path/state before dependent implementation. Use bounded S10-Gxx sub-sessions as needed; independent work continues.
- Output: lead receipt `docs/migration-receipts/S10.md`, with the evidence and identities required by the dispatch protocol.

### S11 — Client contract boundary

- Status: planned. Lead: HarflowClient. Co-owned: HarflowMCP, HarflowDesign.
- Prerequisite receipts: S09 and S10, with approved references for the assigned states.
- Checklist coverage: C0-CL-01 (final contribution), C0-CL-02 (final contribution), C0-CL-03 (final contribution).
- Scope and acceptance: Deliver v2 models, validators, injected ports, fakes and contract checks traceable to canonical public contracts and exact approved design identities; do not infer authority from mocks.
- Output: lead receipt `docs/migration-receipts/S11.md`, with the evidence and identities required by the dispatch protocol.

### S12 — Client shell and components

- Status: planned. Lead: HarflowClient. Co-owned: HarflowDesign.
- Prerequisite receipts: S11.
- Checklist coverage: E0-CL-04 (partial), E0-CL-06 (partial), E0-CL-14 (partial).
- Scope and acceptance: Deliver v2 tokens, branding, components and shell, including the 264px sidebar, 56px rail and approved mid-grey appearances; exercise fake ports, keyboard and lifecycle against approved states.
- Output: lead receipt `docs/migration-receipts/S12.md`, with the evidence and identities required by the dispatch protocol.

### S13 — Secure Electron shell

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowDesign.
- Prerequisite receipts: S12.
- Checklist coverage: C0-DE-02 (final contribution), E0-DE-01 (final contribution), E0-DE-05 (partial).
- Scope and acceptance: Implement approved v2 chrome and native capabilities with allowlisted validated IPC, trusted sender and navigation boundaries, sandboxing and macOS lifecycle; verify real window behavior and security.
- Output: lead receipt `docs/migration-receipts/S13.md`, with the evidence and identities required by the dispatch protocol.

### S23 — Native integration

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowClient, HarflowDesign.
- Prerequisite receipts: S22.
- Checklist coverage: E0-DE-03 (final contribution), E0-DE-05 (final contribution).
- Scope and acceptance: Deliver scoped native menu, notifications, deep links, dialogs and single instance; apply violet blossom app branding and monochrome menu glyph, verifying native interactions and approved v2 states.
- Output: lead receipt `docs/migration-receipts/S23.md`, with the evidence and identities required by the dispatch protocol.

### S24 — Electron on Python acceptance

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowMCP, HarflowMac, HarflowDesign, HarflowClient.
- Prerequisite receipts: S23.
- Checklist coverage: E0-MC-01 (final contribution), E0-MA-01 (final contribution), E0-DS-02 (final contribution), E0-CL-05 (final contribution), E0-CL-06 (final contribution), E0-CL-07 (final contribution), E0-CL-14 (final contribution), E0-DE-02 (final contribution), E0-DE-06 (final contribution), E0-DE-12 (final contribution).
- Scope and acceptance: Accept Electron on Python against approved v2 production pixels and the retained/simplified feature ledger, including reconnect, disposal, accessibility, performance, clean pinned install and sandbox smoke. Do not restore removed UI for parity; record exact identities and limitations.
- Output: lead receipt `docs/migration-receipts/S24.md`, with the evidence and identities required by the dispatch protocol.

### S45 — Integrated Rust acceptance

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowClient, HarflowDesign, HarflowEngine.
- Prerequisite receipts: S44.
- Checklist coverage: I0-DE-01 (final contribution), I0-DE-03 (partial), I0-CL-01 (final contribution), I0-DS-01 (final contribution), I0-EN-01 (final contribution).
- Scope and acceptance: Re-run accepted v2 scope against Rust with production pixels, accessibility, performance, clean-user install and upgrade; verify no hidden Python or private store coupling.
- Output: lead receipt `docs/migration-receipts/S45.md`, with the evidence and identities required by the dispatch protocol.

### X01 — Linux qualification

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowDesign, HarflowEngine, HarflowClient.
- Prerequisite receipts: S45 (accepted macOS integration).
- Checklist coverage: I0-DS-02 (partial), I0-DE-03 (partial).
- Scope and acceptance: After macOS acceptance, adapt approved v2 for Linux and independently qualify Linux x86_64 engine, backend and Desktop with native evidence before claiming support.
- Output: lead receipt `docs/migration-receipts/X01.md`, with the evidence and identities required by the dispatch protocol.

### X02 — Windows qualification

- Status: planned. Lead: HarflowDesktop. Co-owned: HarflowDesign, HarflowEngine, HarflowClient.
- Prerequisite receipts: S45 (accepted macOS integration) and X01 (Linux qualification).
- Checklist coverage: I0-DS-02 (final contribution), I0-DE-03 (final contribution).
- Scope and acceptance: After macOS acceptance, adapt approved v2 for Windows and independently qualify Windows x86_64 engine, backend and Desktop with native evidence; does not block owner cutover.
- Output: lead receipt `docs/migration-receipts/X02.md`, with the evidence and identities required by the dispatch protocol.
