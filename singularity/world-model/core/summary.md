# logic-engine — deterministic light world model

> Generated 14 September 2026 (2026-09-14T21:04:52.248Z) · source `3959741424a3d2dc89dc20a4e11613782a1eb1c8` · branch `filter-app`

## Repository shape

- Files indexed: 81
- Source-like files: 45
- Test-like files: 3
- Build manifests: 2
- Deployment/operations files: 0
- Languages: TypeScript (42), JavaScript (3)
- Top-level areas: src (57), (root) (14), server (4), .vscode (3), .antigravity (1), .sflow (1), scripts (1)

## Facts {#core.facts}

<!-- singularity-flow:repository-facts:start -->
```yaml
# Derived from the repository, not inferred. Every path and line is checkable.
files: 81
languages_scanned: 46
frameworks: [Angular, Express, Tailwind CSS, TypeScript]
entrypoints:
  - { path: server/index.js, declared: main, at: "server/package.json:5" }
commands:
  - { run: "npm run ng", at: "package.json:5" }
  - { run: "npm run client", at: "package.json:6" }
  - { run: "npm run server", at: "package.json:7" }
  - { run: "npm run start", at: "package.json:8" }
  - { run: "npm run build", at: "package.json:9" }
  - { run: "npm run watch", at: "package.json:10" }
  - { run: "npm run test", at: "package.json:11" }
  - { run: "npm run start", at: "server/package.json:7" }
# What the rest of the repository depends on. A count, not an impression.
most_depended_on:
  - { path: src/app/models/types.ts, imported_by: 14 }
  - { path: src/app/services/rule-engine.service.ts, imported_by: 10 }
  - { path: src/app/services/rule-store.service.ts, imported_by: 10 }
  - { path: src/app/types.ts, imported_by: 8 }
  - { path: src/app/kernel/ast.ts, imported_by: 6 }
  - { path: src/app/kernel/index.ts, imported_by: 6 }
  - { path: src/app/kernel/schema.ts, imported_by: 6 }
  - { path: src/app/kernel/evaluate.ts, imported_by: 4 }
# Commits touching each file in the last year, from Git history.
most_changed:
  - { path: src/app/components/rule-sets/rule-sets.component.ts, commits: 2 }
  - { path: .antigravity/687cc105-669b-4e51-9d7a-c4e050421e45.pbtxt, commits: 1 }
  - { path: .browserslistrc, commits: 1 }
  - { path: .editorconfig, commits: 1 }
  - { path: .env.example, commits: 1 }
  - { path: .gitignore, commits: 1 }
  - { path: .npmrc, commits: 1 }
  - { path: .postcssrc.json, commits: 1 }
# 66 exported top-level declarations; the most-depended-on files' are listed.
key_symbols:
  - { name: isComparisonTerm, kind: function, at: "src/app/kernel/ast.ts:52" }
  - { name: isLogicalTerm, kind: function, at: "src/app/kernel/ast.ts:56" }
  - { name: isRuleRefTerm, kind: function, at: "src/app/kernel/ast.ts:60" }
  - { name: NULLARY_OPERATORS, kind: binding, at: "src/app/kernel/ast.ts:65" }
  - { name: ORDERING_OPERATORS, kind: binding, at: "src/app/kernel/ast.ts:71" }
  - { name: SET_OPERATORS, kind: binding, at: "src/app/kernel/ast.ts:79" }
  - { name: MEMBERSHIP_OPERATORS, kind: binding, at: "src/app/kernel/ast.ts:82" }
  - { name: OPERATOR_DISPLAY, kind: binding, at: "src/app/kernel/ast.ts:87" }
  - { name: operatorDisplay, kind: function, at: "src/app/kernel/ast.ts:102" }
  - { name: comparisonLabel, kind: function, at: "src/app/kernel/ast.ts:107" }
  - { name: RuleEngineService, kind: class, at: "src/app/services/rule-engine.service.ts:35" }
  - { name: RuleStoreService, kind: class, at: "src/app/services/rule-store.service.ts:37" }
tests: 3
```
<!-- singularity-flow:repository-facts:end -->

## Likely entry points

- `package.json`
- `server/index.js`
- `server/package.json`
- `src/app/kernel/index.ts`
- `src/main.ts`

## Observed commands

- `npm run build`
- `npm run client`
- `npm run ng`
- `npm run server`
- `npm run start`
- `npm run test`
- `npm run watch`

## Grounding boundary

This model was generated locally without Copilot or another AI model and consumed **zero model tokens**. It intentionally records only deterministic repository metadata. It does not claim runtime behavior, business meaning, ownership, security, test coverage, or architectural intent. Deeper phases can replace it with a quick, standard, or deep model when semantic analysis is worth the token cost.
