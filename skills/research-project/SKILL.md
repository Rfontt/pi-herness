---
name: research-project
description: Research an unfamiliar project and bootstrap its .ai/ engineering memory — architecture (DDD/layered), build & dependencies, libraries, code style, test style, business rules, and API endpoints. Use when entering a new project, when .ai/ is missing or stale, or when asked to "research", "onboard", or "understand" a project.
---

# Research Project

Bootstrap a project's `.ai/` engineering memory so every later task starts from accurate, evidence-based context instead of re-discovering the codebase.

## When to use
- Entering a project with no `.ai/`, or a sparse/stale one.
- Asked to "research", "onboard", "understand", or "build the project memory".
- Before a large feature/spec when the memory is thin.

## When NOT to use
- `.ai/` already exists and is current → read it (engineering-memory skill); don't rewrite.
- Small, well-scoped change in a project with fresh memory.

## Principles (senior-engineer bar)
1. Evidence over guessing — every claim traces to a file you actually read. Never invent commands, versions, or libraries.
2. One subject per file, concise, dated.
3. Tag every claim FACT / DECISION / LESSON / CONTEXT.
4. Single source of truth + pointers — never copy the OpenAPI spec or an exhaustive dep list into memory; record the mechanism and point at the source.
5. Concrete over generic — "command handlers log aggregateId", not "log well".
6. Layer-scoped, not service-dumped — split memory per layer/concern so an agent working on `application` loads only the application slice, not the whole service. `overview.md` is a map with pointers, never a dump of every layer.

## Workflow

### Phase 0 — Identify the project (triage)
From the root manifests answer: language, framework, build tool, repo shape (monorepo vs single service), architecture style.

### Phase 1 — Build & dependencies
- Build files: settings.gradle.kts, build.gradle.kts, pom.xml, package.json, go.mod, pyproject.toml, Cargo.toml.
- Version catalogs / lockfiles / BOMs.
- Exact build / test / lint / format commands (from the build file; run one cheap command to confirm).

**Docker Compose dependency (full build).** If the project declares a `docker-compose.yml` / `compose.yml` (Docker services such as LocalStack, databases, WireMock, Redis), the complete build/test run depends on those services being up. Record this in context/build.md and note that the stack is brought up via the `/docker-up` quick prompt. Valid whenever the project uses docker compose.

### Phase 2 — Architecture (layer-scoped)
- Module/package layout and DDD/layered boundaries (domain → application → adapters, or the project's equivalent).
- Dependency direction (strictly inward?).
- Entry points: HTTP routes/controllers/handlers, message consumers, cron jobs.
- Ports (interfaces) vs adapters (implementations); wiring mechanism (DI framework, functional beans DSL, annotations).
- Split the memory per layer: `domain.md`, `application.md`, and one file per adapter KIND (http, messaging, persistence, downstream). Do NOT dump everything into a single overview.

### Phase 3 — Code style & conventions
- Naming, comment policy, formatting config (.editorconfig, prettier, gofmt, black).
- Logging library + conventions (per layer if they differ).
- Error-handling pattern (exception hierarchy, status/error-code mapping).
- Read 2–3 representative files per layer for real examples.

### Phase 4 — Test style
- Test framework + runner; how to run a single test.
- File organization (fixtures / mocks / helpers naming).
- Mocking library + conventions.
- Per-layer patterns (unit vs integration vs contract).

### Phase 5 — Business rules & flows
- Key domain entities + invariants.
- Core flows (from handlers/services/domain), including multi-hop or async flows.
- Deliberate deviations and gotchas.
- Record each rule in the file of the layer where it lives (domain rule → domain.md, handler rule → application.md, client routing rule → downstream.md); flows.md only traces the end-to-end path.

### Phase 6 — API surface
- Enumerate endpoints from routes/controllers/handlers.
- If an OpenAPI/AsyncAPI spec exists → do NOT transcribe; write a pointer: "endpoint schema in docs/openapi/<file>.yaml — read on demand when a task touches an endpoint."

## Output — write .ai/
Create the structure from references/ai-memory-template.md (load it now). Memory is layer-scoped: one file per layer/concern so the agent loads only the slice its task touches.

- architecture/overview.md — the thin map (identity, deployables, module tree, dependency direction, wiring) + a routing table pointing at the per-layer files.
- architecture/domain.md + application.md — one file per core layer.
- architecture/<adapter-kind>.md — one file per adapter KIND actually present (http, messaging, persistence, downstream), NOT one file per Gradle module.
- architecture/flows.md — end-to-end flows that cross layers, each referencing the layer files it spans.
- context/build.md, context/libs.md, context/code-style.md, context/test-style.md — cross-cutting.
- Optional: architecture/runtime-config.md, context/lint.md.
- README.md — index with a ROUTING table ("working on X → load these files").
- Code-review ruleset → NOT generated here. Delegate to the `code-review-ruleset` skill (which writes context/code-review.md with stable rule IDs).

## OpenAPI — pointer, never copy
Reference the spec file; never duplicate endpoints/schemas into .ai/. Memory says where the contract lives, not the whole contract.

## Quality bar (check before finishing)
- [ ] Every claim backed by a file I read (list sources).
- [ ] No invented commands/versions/libraries.
- [ ] One subject per file; concise; dated; tags correct.
- [ ] Memory is layer-scoped (domain/application/adapter files), not a single service dump.
- [ ] README has a routing table mapping task → files to load.
- [ ] OpenAPI referenced as a pointer, not transcribed.
- [ ] Build/test/lint/format commands exact (one cheap command actually run).

## Verify
- Re-read generated files; confirm they'd steer a future task correctly.
- Confirm the routing table in README points at files that actually exist.
