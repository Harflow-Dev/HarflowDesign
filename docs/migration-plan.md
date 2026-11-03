# Design references migration checklist

Dispatchable work packages: [migration sessions](migration-sessions.md).

Status: planned, 2026-11-02. All work items remain unverified.

Own the Git-backed design source and approved state references, not product
implementation. Inputs are the reviewed parity ledger and current source;
outputs identify approved designs by exact commit, path and state. Do not
invent approvals or make unrelated backlog polish a migration blocker.

## Redesign target and intent

The approved baseline is [HarflowDesign v2 at commit `3643d083700be4032c93237813b573d04bab6ab1`](https://github.com/Harflow-Dev/HarflowDesign/tree/3643d083700be4032c93237813b573d04bab6ab1/v2), including the owner-approved Mac connector amendment. Consult the optional workspace [coverage and intent ledger](../../HarflowDesign/v2/docs/migration-coverage.md); it is not a build dependency. Own the approved v2 baseline and per-feature gap loop; new required states need explicit owner approval. Missing required states need a v2 design and explicit owner approval with exact commit, path and state before dependent implementation. Approval of visuals does not authorize new authority, public contract changes, backends or deferred features. Core execution safety and observability remain required.

## Dispatch and boundaries

Work only on the assigned item. Read the workspace AGENTS.md, this repository's AGENTS.md if present, and
applicable package instructions first; preserve concurrent edits and use primary checkouts.
The orchestrator delegates unit tests under the current workflow. A checkbox is
not authorization to start runtimes, mutate real roots, register clients, push,
release, clean up, or expand scope. Use disposable roots and workspaces where
needed. Report a blocker with concrete evidence; task status is not proof of
completion. Repository builds and tests must not depend on sibling checkouts.

The optional [workspace coordination index](../../HARFLOW_MIGRATION_CHECKLIST.md)
uses B0 (baseline), C0 (contracts and design), E0 (client and Electron on
Python), R0 (Rust parity), I0 (integrated stack), and O0 (owner cutover and
publication). It is not a build dependency. Freeze and qualify the reproducible existing baseline without waiting for open
feature tickets. Use the v2 intent ledger to decide retained and simplified scope;
legacy UI parity and open tickets do not independently mandate inclusion. All boxes below are deliberately unchecked;
scaffolds alone do not establish completion. Early-use gates and defaults remain
subject to evidence and explicit authorization for root registration. Use fresh
Rust state; archive historical task, run and event records rather than importing
them. Import only definitions, configuration and preferences, with an explicit
registration backup and handoff. No engine may share a writable root.

Stage dependencies: B0 → C0 → E0 → R0 → I0 → O0. macOS design
references gate macOS E0; later platform adaptations follow their own gates.

## B0 / C0 — inventory and foundations

- [ ] B0-DS-01 Inventory source-derived, exploratory and explicitly approved
      screens and record missing or inconsistent approval evidence.
- [ ] C0-DS-01 Record approved token source and exact commit, path and state for
      each retained or approved simplified v2 feature; identify decisions still needed from the owner.
- [ ] C0-DS-02 Adapt approved designs for macOS, including window chrome, tray
      and notifications, before the macOS E0 gate.
- [ ] I0-DS-02 Adapt approved Linux and Windows designs before their respective
      platform gates; neither blocks macOS E0.
- [ ] C0-DS-03 Provide loading, empty, populated, error and interaction states
      for each accepted feature, with accessible and keyboard behavior.
- [ ] C0-DS-04 Record parity-ledger decisions for sidebar proposals and other
      uncertain scope; do not treat an open ticket as automatic inclusion.

## E0 / I0 — visual handoff

- [ ] E0-DS-01 Supply approved references and tokens to the shared client with
      exact commit and path, identifying any unresolved design constraints.
- [ ] E0-DS-02 Compare actual client pixels and relevant states with approved
      references; record appearance, keyboard and accessibility evidence.
- [ ] I0-DS-01 Recheck integrated Rust-backed behavior for any visual impact;
      distinguish local preview from hosted deployment.

## Validation

Preview root `index.html` directly or through a local HTTP server. Run
`node --test --test-skip-pattern='^registry source links resolve in the pinned HarflowMac tree$' tests/catalog.test.mjs`
and relevant JavaScript syntax checks; inspect affected states in both
appearances. The optional pinned-source check described in the [README](../README.md)
needs a separate source checkout but is not a build dependency. Follow
[screen inventory](screen-inventory.md) and [design rules](../DESIGN.md); do not
introduce a package build tool.

## Handoff evidence

For every assigned item report: item ID and result; repository and dependency
commit IDs; fixture manifest hash where applicable; commands, environment,
results and evidence locations; local, committed, pushed, CI-passed, packaged
and released state, stated separately; approved design commit, path and state where
applicable; deviations, blockers and remaining work. Record unrun checks and
why. Do not infer passing gates from a dispatched task's status.
