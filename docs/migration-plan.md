# Native and later-platform design migration checklist

Revised 2026-11-04. Governing [revision 3](../../HARFLOW_MIGRATION_PLAN_V3.md),
[workspace gates](../../HARFLOW_MIGRATION_CHECKLIST.md) and [current sessions](migration-sessions.md).

Approved v2 remains the design source, with exact commit/path/state/appearance
references. Root legacy catalog is behavioral evidence, not a replacement target.

- [ ] M01 Audit retained/simplified/removed/undecided capabilities against existing
  Mac implementation; ratify native state/adaptive/accessibility/performance criteria.
- [ ] M01-Gxx Approve required native loading/empty/error/recovery/interaction states
  before dependent M02–M12 code, including transcript/diffs, queues, approval expiry,
  workflow conflicts/builder/generate/delete, statistics/resources and transport.
- [ ] M04–M12 Compare native pixels and real flows in both appearances, keyboard,
  focus/Reduce Motion/narrow windows and accessibility; do not restore removed UI.
- [ ] I04 Recheck native Rust-backed states for changed uncertainty/capabilities.
- [ ] W01/W03/W04 Later Web-owned frontend adaptive/browser states and acceptance.
- [ ] WIN01/WIN03/WIN04 Native Windows design only after accepted Web stability
  and explicit owner decision; no Linux desktop adaptations are required.

Capability dispositions in v2/docs/migration-coverage.md retain acceptance status.
No visual approval invents engine authority or accepts Proposed/Undecided scope.
Validate links/syntax and affected light/dark states proportionately when assigned.

## Parallel-track coordination

M01 shared readiness follows S09 coverage disposition and the native capability,
code/private-read inventory, with ratified initial ctl/capability/fixture baseline,
exact identities, explicit blocking gaps and canonical change owner. M02+ native
and R01/R02+ Rust work may then run concurrently with disjoint files/isolated roots.
Pin each accepted subset, serialize canonical changes under MCP before O04 (Engine
afterward), coordinate consumer fixture deltas and carry forward affected conformance.
Both accepted M12 and R14 are required before I01; missing baseline/fault evidence
is not automatically waived. Read-only research remains separately assignable.

## Boundaries and evidence

This plan authorizes no implementation by itself. Follow workspace/child/package
AGENTS.md and the current session brief; preserve concurrent work in primary
checkouts. Use isolated roots/fixtures. No implicit live-state, install, registration,
paid-probe, signing, push, publication, retirement or deletion authority. Record exact
commit/contract/design/runtime/profile identities, actual checks/reviews, missing
coverage and owner decisions in the lead receipt. Delivery and acceptance differ.
Builds/tests must not depend on sibling source checkouts. Documentation-only plan
changes need link/consistency checks, not product test reruns.
