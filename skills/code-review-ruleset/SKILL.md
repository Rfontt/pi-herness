---
name: code-review-ruleset
description: Create or refresh a project's code-review ruleset file (.ai/context/code-review.md) with project-specific, referenceable rule IDs. Use when setting up a new project for review, when review findings are inconsistent, or when the user asks to define/refresh review rules.
---

# Code Review Ruleset

Generate a project-specific code-review ruleset at `.ai/context/code-review.md`. This is the
single source of truth that the `/review` flow (and the `code-review` skill) loads so reviews
are consistent and findings are traceable.

## When to use
- New project / first review: create the file from scratch.
- Review feedback is vague or inconsistent: encode the repeated lessons as rules.
- The user asks to "define review rules" / "create the code review file".

## Before writing — research the project
Do NOT copy rules from another project. Inspect the real stack and patterns:
1. Read the project's `AGENTS.md` / `CLAUDE.md` and any `.ai/` files (architecture, decisions, lessons).
2. Confirm the language, framework, and architecture style (hexagonal/DDD/event-sourcing/MVC).
3. Find the build/verify commands (`./gradlew test`, `go test`, `npm test`, `./gradlew lintKotlin`, …).
4. Hunt for real anti-examples or leaks already in the repo (e.g. a test-only dep on the runtime
   classpath, a handler that re-implements domain validation) — each rule should, where possible,
   cite one.
5. Note the actual module/package layout and port/adapter names so rules reference real paths.

## File location & format
Write to `.ai/context/code-review.md`. Keep this skeleton:

```
# Code Review Ruleset (CONTEXT)

Recorded: <YYYY-MM-DD>

Review agent rules for this project. The `/review` prompt and any review flow
MUST load this file + the `code-review` skill and apply every rule to the
reviewed diff. Comments on findings reference rule IDs (`[ARCH-01]`) so rules
can evolve without breaking references.

## How to use
1. Load this file + the `code-review` skill before reviewing.
2. Review the diff against every rule below; skip none.
3. Report findings by severity: **blocker** (must fix before merge) / **important** (should fix) / **suggestion** (nice to have).
4. Comment format: `[<RULE-ID>] <finding> — <where> — <concrete suggestion>`.
5. Review is READ-ONLY — never run tests/lint/build during a review, and never claim a check passed.
   (List the author's verify commands here, e.g. `./gradlew build`, so reviewers know what the author must run — not the reviewer.)
6. To add a rule: append a new numbered entry under the right category — no other changes needed.
```

## Rule categories & ID scheme
Group numbered rules under fixed prefixes so IDs stay stable:

- **ARCH** — clean/hexagonal/module-boundary rules (dependency direction, pure domain, ports/adapters, thin handlers, DI wiring).
- **ES** — event sourcing / CQRS rules (event shape & naming, event→command bridges, serialization/schema, aggregates).
- **BR** — business rules that must not regress (flow-specific invariants, deviations, policies).
- **STYLE** — language/idiomatic code style (naming, comments, logging, error mapping, SRP, dependencies).
- **TEST** — test conventions (framework, file trio/fixtures/mocks, doubles per layer, determinism).
- **COV** — coverage rules (thresholds, sanctioned exclusions, error-path coverage).
- **PROCESS** — review-process hygiene (specific/actionable, severity, no unrelated changes, verified claims, `.ai/` is never reviewed/flagged).

## Writing each rule
- One line that states what to **FLAG** (an anti-pattern), not a vague principle.
- Reference the project's real stack/paths/names (e.g. `domain/`, `ProductService`).
- Cite a known anti-example or leak where one exists ("the bug that motivated this rule").
- Number sequentially per category (`ARCH-01`, `ARCH-02`, …).

## Adapt — never copy another language's commands
- Kotlin/Gradle → `./gradlew test`, `./gradlew lintKotlin`, `./gradlew build`.
- Go → `go test ./...`, `go vet ./...`, `go fmt ./...`.
- TypeScript → `npm test`, `npm run lint`, `npm run typecheck`.
- Only include commands that actually exist in the project.

## After writing
- Confirm the file is at `.ai/context/code-review.md`.
- Point the `/review` flow (or the user's review prompt) at it.
- Keep it append-only: new rules are added under the right category; existing IDs never change.
