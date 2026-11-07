# HarflowDesign

This repository owns Harflow's editable design website, reusable interface components, foundations, and screen states. Read README.md, DESIGN.md, and v2/docs/screen-inventory.md before editing.

## Scope

Work in this checkout. Preserve existing edits. Do not modify sibling repositories, import predecessor prototypes, create worktrees or branches, or push without explicit authorization. Keep professional artifacts neutral.

## Design workspace

This Git checkout is the design source of truth. Edit its files directly and preview
`v2/index.html` (the root `index.html` redirects to it) in a browser, preferably through a local HTTP server. Do not use OpenDesign
or maintain a separate managed copy. The publication target is `https://design.harflow.dev`
on Cloudflare Pages; verify deployment status before claiming the hosted site is current.

## Architecture

Keep v2/index.html previewable offline and under file://, and keep the root index.html redirector working under file:// and on the hosted site. `archive/v1/` is the archived v1 catalog: do not edit it except to keep its links valid. Use local classic scripts and relative assets. Do not add build tools, package installation, CDN dependencies, fetch-based fixtures, real backend calls, credentials, or real user data. Keep catalog chrome distinct from native app specimens. Use shared semantic tokens and cohesive modules.

## Source and fidelity

Trace baseline UI to a pinned HarflowMac commit and exact source path. Verify source behavior before adding states. Document browser approximations and unsupported combinations. Do not label source-derived or exploratory designs approved. Preserve native minimum sizes and horizontal scrolling instead of shrinking whole screens.

Use `docs/terminology.md` as the canonical user-facing glossary (`v2/docs/terminology.md` covers the desktop redesign only and does not replace it). Classify labels by meaning before replacing them; preserve accurate participant terms, internal adapter symbols, and public fields.

## Catalog naming

Navigation, family and state ids and titles, descriptions, the approval line, the page title, the state picker, catalog control strips and guide text name the product screen or component only. Milestone, proposal, approval and gap history lives in `v2/docs/decisions/`; `tests/v2.test.mjs` enforces this. Each state carries its own status and approval; record a new decision in `v2/docs/decisions/README.md`. An alias never changes meaning: moved routes stay as aliases in `v2/scripts/route-aliases.js`. An owner-decided redirect sends a retired route to its replacement (`v2/scripts/supersessions.js`); record the retirement in the decisions README.

## Design workflow

Refine features here before product implementation. Include relevant loading, empty, populated, error, and interaction states supported by the feature. Record approved designs by repository commit, file path, and screen state; approval requires an explicit user decision. Flag missing references or technical constraints.

## Validation

Run JavaScript syntax checks, verify local links and pinned source paths, and inspect affected states in both appearances. Check keyboard access, readable labels, overflow, and deterministic reset. Use proportionate browser checks. Record actual evidence and outstanding native fidelity checks; do not claim unperformed verification.

Migration work: see [docs/migration-plan.md](docs/migration-plan.md).
