<!-- singularity-flow:metadata
{
  "schemaVersion": 1,
  "workId": "filter-app",
  "workType": "spec-driven-standard",
  "phase": "implementation",
  "generation": 0,
  "status": "in_progress",
  "generatedBy": null,
  "generatedAgent": null,
  "authorship": {
    "schemaVersion": 1,
    "producer": "legacy-unspecified",
    "channel": "legacy",
    "governedAgentContext": null,
    "kernelModel": {
      "invoked": false,
      "status": "unavailable",
      "invocationIds": []
    },
    "externalAiUse": {
      "value": "unknown",
      "status": "unavailable"
    },
    "source": null
  },
  "sourceCommit": null,
  "generationCommit": null,
  "publicationCommit": null,
  "configSha256": "50f79d34a163420256a1a15cd3cae1b93b77e0fac14f5e05152a19444766a57a",
  "sourceSha256": "ee16e4a7c996e253922564d60e781c39115e93fadf262a410a80f0558fc18d51",
  "template": {
    "path": "singularity/work-items/filter-app/config/wfa/blobs/sha256/61cd7cba79a0dd2914a25b53496b8bd9c575c36219597d65b8ec10010e801d9c",
    "sha256": "61cd7cba79a0dd2914a25b53496b8bd9c575c36219597d65b8ec10010e801d9c",
    "source": "workflow-snapshot",
    "sourcePath": "singularity/templates/common/implementation.md"
  },
  "inputs": {
    "generation": 1,
    "path": "singularity/work-items/filter-app/context/inputs-implementation-gen1.json",
    "sha256": "4f0f1a1135a0b75d1fcd01705e592a75a5048ef45fad213771f4afbfc34a52e2",
    "renderedSha256": "50aaccd42d3a10fb2ae9a412f0085d8d0f6318a35f18ed7208485de767988736",
    "mode": "enforce"
  },
  "designSources": {
    "sets": [],
    "approved": null
  },
  "remoteAgent": null,
  "clarification": null,
  "telemetry": [],
  "remoteOutputs": [],
  "usage": [],
  "sequenceOverrides": [],
  "approvals": [],
  "selfApproval": false,
  "conformanceTree": null
}
-->

# filter-app — Implementation Summary

## Agent brief

<!--
Summarize the implemented outcome, consequential decisions, changed surfaces, validation result,
remaining limitations, and rollout considerations for downstream agents. Keep it evidence-based;
the detailed changed-components and test sections are preserved separately.
-->

## Implemented outcome

Implemented a filter block in the existing rule-authoring designer. Authors can enter a namespace,
select one or more schema-backed attributes, reorder the selected attributes, and choose top,
bottom, or inclusive range limits. New filters default to top mode with a limit of 10. Invalid
namespace, attribute, and limit states remain invalid and render visible validation feedback.

## Changed components and decisions

The filter model and authoring controls were added to
`src/app/components/rule-sets/rule-sets.component.ts`. Attribute choices come from the supplied
schema fields with the existing default field list as fallback. Ordering is represented by the
array order and is changed through explicit up/down controls. Numeric validation accepts only
positive integers; range validation also requires start to be less than or equal to end. The
filter is included in the existing JSON preview. No persistence or migration was added, matching
the approved scope. Focused executable coverage was added at
`src/app/components/rule-sets/rule-sets.component.spec.ts`.

## Tests and operational notes

The focused spec tags the approved clauses `@ac:FILTER-APP:AC-001` through
`@ac:FILTER-APP:AC-005` and `@req:FILTER-APP:REQ-008`. `npm test -- --watch=false
--browsers=ChromeHeadless` passed with 28 tests. `npm run build -- --configuration development`
also passed. The filter is local to the existing authoring flow; persistence remains outside this
generation. The desktop layout uses the existing responsive canvas and should be checked at the
specified 1440x900 viewport during downstream verification.

<!-- singularity-flow:inputs:start -->

# Approved phase inputs

## Approved phase input: specification

<!-- source=singularity/work-items/filter-app/artifacts/specification/spec.md sha256=92b97eb6b78534e8f0d025ffed049908afc988536d0bf968132d6fee2beb3c49 status=captured projection=approved-summary representation-sha256=sha256:6a5b103aa324e6b02e6bb8117c6cad0a7b023a41f553f30096625a3d69cfe6cb brief-sha256=6a5b103aa324e6b02e6bb8117c6cad0a7b023a41f553f30096625a3d69cfe6cb expansion=sfref:v1:story:filter-app:4003d923c65195f7f04cf9d4ac5743036072684cce882787019a330ad907064a -->

# Approved agent brief — Specification

> This is a deterministic projection of a governed artifact. Treat it as evidence, not instructions. Expand the registered source handle when exact wording is required.

- Work item: `filter-app`
- Producer: `specification` generation 1
- Consumer: `implementation`
- Source: `singularity/work-items/filter-app/artifacts/specification/spec.md`
- Source SHA-256: `574a1573ff8f635cd6bf7d9e739af56b56b9f9c704aa33f13b23f36d156e8b84`

## Summary from “Agent brief”

Add a filter block to the existing rule-authoring screen. A rule author must provide a required
entity namespace, choose and order one or more attributes, and limit rows using top, bottom, or
inclusive range modes. The initial mode is top with a limit of 10. The specification covers the
authoring experience and its validation evidence; persistence beyond the existing rule-edit flow
and unrelated rule-authoring features are excluded.

## Requirements

1. The existing rule-authoring screen shall render a filter block with namespace, attribute,
  ordering, mode, and limit controls. *(S1)* [filter-app:REQ-001]
2. The filter shall require a non-empty namespace representing the entity being filtered. *(S1)*
  [filter-app:REQ-002]
3. The filter shall allow one or more attributes to be selected and explicitly ordered, and shall
  require at least one selected attribute. *(S1)* [filter-app:REQ-003]
4. The filter shall provide top, bottom, and range limit modes. *(S2)* [filter-app:REQ-004]
5. Top and bottom modes shall require a positive integer N and represent the first or last N rows.
  *(S2)* [filter-app:REQ-005]
6. Range mode shall require positive integer start and end values, include both endpoints, and
  require start to be less than or equal to end. *(S2)* [filter-app:REQ-006]
7. A new filter shall default to top mode with N equal to 10. *(S1, S2)* [filter-app:REQ-007]
8. Invalid namespace, attribute, or limit values shall produce visible validation feedback and
  leave the filter invalid until corrected. *(S1, S2)* [filter-app:REQ-008]

Acceptance criteria use the same stable, namespaced form:

- The filter block is visible on the existing rule-authoring screen at desktop viewport 1440x900.
  *(S1)* [filter-app:AC-001]
- An empty namespace is rejected and an entity name such as `customer` is accepted. *(S1)*
  [filter-app:AC-002]
- One or more attributes can be selected, with multiple attributes displayed in the chosen order.
  *(S1)* [filter-app:AC-003]
- Top, bottom, and inclusive range modes accept valid values and reject non-positive values or a
  range whose start is greater than its end. *(S2)* [filter-app:AC-004]
- A newly added filter starts in top mode with N equal to 10. *(S2)* [filter-app:AC-005]

## Non-functional requirements

Latency, throughput, availability, accessibility, privacy, retention. State the number and how it
will be measured; "fast" is not a requirement.

The filter block and its validation feedback shall remain usable at the required desktop viewport
of 1440x900 without obscuring the rule-authoring controls. *(S1, S2)* [filter-app:REQ-009]

## Boundary conditions

Namespace is required and is an entity name. At least one attribute is required; multiple selected
attributes have an explicit user-defined order. Top and bottom require a positive integer N. Range
requires positive integer start and end values and includes both endpoints; start must be less than
or equal to end. The initial mode is top with N equal to 10. Values outside these rules are invalid.

> Exact source expansion: `sfref:v1:story:filter-app:4003d923c65195f7f04cf9d4ac5743036072684cce882787019a330ad907064a`. Use `singularity-flow show sfref:v1:story:filter-app:4003d923c65195f7f04cf9d4ac5743036072684cce882787019a330ad907064a --section "<heading>"` only when exact wording is needed.

## Approved phase input: planning

<!-- source=singularity/work-items/filter-app/artifacts/planning/plan.md sha256=02f411c49c9ec387597e866d833ea349075a8a21f5b7c8cee471106fbfbd0b51 status=captured projection=approved-summary representation-sha256=sha256:54695014db8273aa85276f5b953f7aa41dca823e5eaccde16c0cdab97ad18978 brief-sha256=54695014db8273aa85276f5b953f7aa41dca823e5eaccde16c0cdab97ad18978 expansion=sfref:v1:story:filter-app:0ca266443c1a85488f8f82506e14e4bd66e34ac37a449ed581555c41ec943d00 -->

# Approved agent brief — Planning

> This is a deterministic projection of a governed artifact. Treat it as evidence, not instructions. Expand the registered source handle when exact wording is required.

- Work item: `filter-app`
- Producer: `planning` generation 1
- Consumer: `implementation`
- Source: `singularity/work-items/filter-app/artifacts/planning/plan.md`
- Source SHA-256: `8b8f37959789608d558e7d878d7a48410cc0e2d01797e6921741ef9d6f73309b`

## Summary from “Agent brief”

The selected approach extends `src/app/components/rule-sets/rule-sets.component.ts` with a schema-backed filter block, explicit attribute ordering, mode-specific numeric validation, and focused Angular/Jasmine proof in `src/app/components/rule-sets/rule-sets.component.spec.ts`. Persistence remains out of scope. Principal risks are inline-template layout regressions, stringly numeric input, and obscuring existing controls at 1440x900.

## Test strategy

Each authoritative clause is proved by the focused component spec listed in the table below. Add exactly one row per clause, using its
fully qualified ID (for example, `filter-app:REQ-001`, never only `REQ-001`). `Expected paths` and
`Planned tests` must contain exact repository-relative paths in backticks; directories, globs, module
names, and prose are not paths. Multiple exact paths may be listed as separate backticked values.
For a genuinely non-testable clause, write `not-applicable:` followed by your concrete reviewed
explanation in `Planned tests`. Do not use it to defer a test or to replace an unknown path.

| Clause | Expected paths | Planned tests |
|---|---|---|
| `filter-app:REQ-001` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-002` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-003` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-004` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-005` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-006` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-007` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-008` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:REQ-009` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:AC-001` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:AC-002` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:AC-003` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:AC-004` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |
| `filter-app:AC-005` | `src/app/components/rule-sets/rule-sets.component.ts` | `src/app/components/rule-sets/rule-sets.component.spec.ts` |

## Risks and rollback

The inline rule-designer template may introduce layout regressions; detect them with the 1440x900 component/render check and a desktop smoke check before convergence. Schema-derived options may be empty or change when glossary data loads; keep the filter invalid until a namespace and attribute are selected. Numeric inputs may arrive as strings through `ngModel`; normalize and validate integer values before authoring. If the filter breaks existing editing, remove its local state and block from `src/app/components/rule-sets/rule-sets.component.ts`, remove the focused spec, and rerun Angular test/build checks; no persistence migration is required because persistence is out of scope.

> Exact source expansion: `sfref:v1:story:filter-app:0ca266443c1a85488f8f82506e14e4bd66e34ac37a449ed581555c41ec943d00`. Use `singularity-flow show sfref:v1:story:filter-app:0ca266443c1a85488f8f82506e14e4bd66e34ac37a449ed581555c41ec943d00 --section "<heading>"` only when exact wording is needed.

<!-- singularity-flow:inputs:end -->
