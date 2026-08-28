---
name: memory
description: Persist durable knowledge to long-term memory via the `remember` tool — either facts about Rita (scope=user) or global cross-project engineering rules (scope=engineering). Use when you learn something durable that would otherwise need re-explaining, or when asked to remember/forget.
---

# Memory (global, two scopes)

Pi has THREE kinds of memory — do not confuse them:

1. ENGINEERING memory (.ai/, per PROJECT): facts/decisions/lessons about ONE project's code.
   See the engineering-memory skill. Stays in the repo, versioned in git.
2. USER memory (global, scope="user" → user-context.md): durable facts about the USER
   (Rita) — preferences, environment, identity. Injected into every agent run.
3. ENGINEERING memory (global, scope="engineering" → engineering.md): cross-project rules
   she wants applied to EVERY project — programming style, code-review standards,
   architecture rules, conventions. Injected into every agent run.

The native mechanism is the `remember` tool (provided by the memory extension).
Prefer calling `remember` over hand-editing any file.

## The key distinction (scope=engineering vs .ai/)
- scope="engineering" = GLOBAL, cross-project rules. E.g. "Rita's code style: functional
  composition over class inheritance", "Architecture rule: services must not share a DB".
- .ai/ = facts/decisions/lessons about ONE project. E.g. "This service uses Postgres",
  "ADR-003: moved to event-driven".

When in doubt: if it applies to ALL future projects → scope="engineering". If it's about
the current project → .ai/.

## When to WRITE (proactive, but selective)
Write only when ALL hold:
1. DURABLE — still true in months, not just this task/session.
2. HIGH-SIGNAL — reduces future re-explaining or repeated corrections.
3. STABLE — preferences, conventions, rules, environment, identity.

Good (user):      "Rita prefers concise answers with tables and ASCII diagrams."
Good (engineering): "Code review: Rita values correctness and error-handling over brevity."
Bad (user):       "Fixed bug X in project Y." → transient.
Bad (engineering): "Project Y uses Postgres." → that's .ai/, not global.

## When NOT to write
- Task progress, completed-work logs, PR numbers, commit SHAs, "Phase N done".
- Anything stale in a week.
- Per-project facts → .ai/ engineering memory.

## How to write
- Call `remember` with scope + action="add" and a short entry.
- User facts: declarative ("Rita prefers X"), NOT imperative ("Always do X").
- Engineering rules: state the rule clearly ("Architecture rule: ...", "Convention: ...").
- If a store grows long, consolidate or remove stale entries.

## When to FORGET
When Rita corrects something, call `remember` with action="replace" (never append a
contradiction). Use action="remove" to delete an obsolete entry.
