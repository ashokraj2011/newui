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
