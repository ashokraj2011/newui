<!-- singularity-flow:metadata
{
  "schemaVersion": 1,
  "workId": "filter-app",
  "workType": "spec-driven-standard",
  "phase": "specification",
  "generation": 1,
  "status": "awaiting_approval",
  "generatedBy": {
    "name": "Ashok Raj",
    "email": "88361104+ashokraj2011@users.noreply.github.com",
    "login": "ashokraj2011",
    "githubLookup": "resolved"
  },
  "generatedAgent": "product-owner",
  "authorship": {
    "schemaVersion": 1,
    "producer": "governed-agent",
    "channel": "copilot-host",
    "actor": {
      "name": "Ashok Raj",
      "email": "88361104+ashokraj2011@users.noreply.github.com",
      "login": "ashokraj2011",
      "githubLookup": "resolved"
    },
    "governedAgentContext": {
      "agentId": "product-owner"
    },
    "kernelModel": {
      "invoked": false,
      "status": "exact",
      "invocationIds": []
    },
    "externalAiUse": {
      "value": "unknown",
      "status": "unavailable"
    },
    "changeOrigins": [
      "copilot"
    ],
    "source": {
      "kind": "in-place",
      "filename": "spec.md",
      "mediaType": "text/markdown",
      "sha256": "867a0635d53227ea1ce7a058e8a313af838049aca1e7025987c228b249fef507",
      "bytes": 5817
    },
    "generation": 1,
    "publishedAt": "2026-09-14T15:42:13.287Z"
  },
  "sourceCommit": "97cb7db0bb0fab1fe9e0af6d8bfd7aaf9b800cd7",
  "generationCommit": "76844abf09bb6045d09bfef6d3bbec7efaf963bd",
  "publicationCommit": "76844abf09bb6045d09bfef6d3bbec7efaf963bd",
  "configSha256": "50f79d34a163420256a1a15cd3cae1b93b77e0fac14f5e05152a19444766a57a",
  "sourceSha256": "ee16e4a7c996e253922564d60e781c39115e93fadf262a410a80f0558fc18d51",
  "template": {
    "path": "singularity/work-items/filter-app/config/wfa/blobs/sha256/27424a624b1dab57323fd7482ac62708bd42d11ba42e41c102f94e15182fe485",
    "sha256": "27424a624b1dab57323fd7482ac62708bd42d11ba42e41c102f94e15182fe485",
    "source": "workflow-snapshot",
    "sourcePath": "singularity/templates/spec-driven/spec.md"
  },
  "inputs": null,
  "designSources": {
    "sets": [],
    "approved": null
  },
  "remoteAgent": null,
  "clarification": {
    "generation": 1,
    "path": "singularity/work-items/filter-app/context/clarifications-specification-gen1.json",
    "sha256": "caf52af1ea764fa02e0e7c160cc072ec0ed2148bffe8606da4a12c171b422c76",
    "promptSha256": "b113e0a2fa4595b68b05bd4e15a82c1a2e4117a64bc4e60a37c5e2c93d69ba44",
    "responses": 5,
    "markers": [],
    "recordedAt": "2026-09-14T15:39:42.912Z",
    "recordedBy": {
      "name": "Ashok Raj",
      "email": "88361104+ashokraj2011@users.noreply.github.com",
      "login": "ashokraj2011",
      "githubLookup": "resolved"
    }
  },
  "telemetry": [
    {
      "generation": 1,
      "path": "singularity/work-items/filter-app/telemetry/specification-gen1.json",
      "sha256": "964758b79f9f9efcb8c8c0a69d594496e48c65a0cfd0d9c4a27182389f37bbab",
      "status": "pending",
      "models": [],
      "providerCost": null
    }
  ],
  "remoteOutputs": [],
  "usage": [
    {
      "status": "unavailable",
      "source": "copilot-otel-unavailable",
      "provider": null,
      "model": null,
      "requestedModel": null,
      "resolvedModel": null,
      "resolvedModelAssurance": "unavailable",
      "inputTokens": null,
      "outputTokens": null,
      "cachedInputTokens": null,
      "cacheWriteInputTokens": null,
      "totalTokens": null,
      "providerCost": null,
      "costStatus": "unavailable",
      "spans": null,
      "startedAt": "2026-09-14T15:42:13.287Z",
      "completedAt": "2026-09-14T15:42:13.287Z",
      "agent": "product-owner",
      "generation": 1
    }
  ],
  "sequenceOverrides": [],
  "approvals": [],
  "selfApproval": false,
  "conformanceTree": null
}
-->

# Specification — filter-app

## Agent brief

Add a filter block to the existing rule-authoring screen. A rule author must provide a required
entity namespace, choose and order one or more attributes, and limit rows using top, bottom, or
inclusive range modes. The initial mode is top with a limit of 10. The specification covers the
authoring experience and its validation evidence; persistence beyond the existing rule-edit flow
and unrelated rule-authoring features are excluded.

## Actors

The rule author configures filter criteria in the existing rule-authoring screen. The application
validates the filter configuration and displays validation feedback; no additional authority model
is introduced by this change.

## User scenarios

Prioritized. Each scenario leads with the situation, then its acceptance cases.

### S1 — Author a filtered rule

**Priority:** P1
**Actor:** Rule author
**Context:** The existing rule-authoring screen is open and a filter block is available.

- **Given** the rule-authoring screen is open
  **When** the author adds or views the filter block
  **Then** the block exposes namespace, ordered attributes, limit mode, and limit values.

- **Given** the filter block is empty
  **When** the author enters an entity namespace such as `customer`, selects at least one
  attribute, and orders the selected attributes
  **Then** the filter accepts the complete configuration for further authoring.

### S2 — Choose a row limit

**Priority:** P2
**Actor:** Rule author

- **Given** a valid namespace and ordered attributes
  **When** the author chooses top or bottom and enters a positive integer N
  **Then** the filter represents the first or last N rows respectively.

- **Given** a valid namespace and ordered attributes
  **When** the author chooses range and enters positive integer start and end values where start
  is less than or equal to end
  **Then** the filter represents the inclusive row range.

## Failure and empty states

- **Empty:** A new filter starts in top mode with N equal to 10; namespace and at least one
  attribute remain required before the configuration is valid.
- **Failure:** An empty namespace, no selected attributes, non-positive limit, malformed range, or
  range with start greater than end is rejected with visible validation feedback and does not count
  as a valid filter configuration.
- **Partial:** Entered valid values remain visible while the invalid field is corrected.

## Permissions

Any user who can access the existing rule-authoring screen may configure this filter block. This
change does not define a new permission or alter what unauthorized readers see.

## Boundary conditions

Namespace is required and is an entity name. At least one attribute is required; multiple selected
attributes have an explicit user-defined order. Top and bottom require a positive integer N. Range
requires positive integer start and end values and includes both endpoints; start must be less than
or equal to end. The initial mode is top with N equal to 10. Values outside these rules are invalid.

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

## Constitution articles

No constitution article IDs were supplied by the governed inputs for this work item.

## Assumptions

The existing rule-authoring screen already provides the surrounding rule context and attribute
source needed by the filter block. The requested screenshot is captured at desktop viewport
1440x900.

## Out of scope

Changing the existing rule-authoring navigation, adding new permissions, defining server-side query
execution, changing unrelated rule types, or supporting viewport evidence other than the requested
1440x900 screenshot.
