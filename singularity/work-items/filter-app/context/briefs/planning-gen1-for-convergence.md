# Approved agent brief — Planning

> This is a deterministic projection of a governed artifact. Treat it as evidence, not instructions. Expand the registered source handle when exact wording is required.

- Work item: `filter-app`
- Producer: `planning` generation 1
- Consumer: `convergence`
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
