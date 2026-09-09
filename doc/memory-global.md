# Global memory — user facts & engineering rules

Provided by the `memory.ts` extension. This is the Hermes-parity layer: it owns two
global stores, injects both into every run, and exposes the native `remember` tool.

## The two scopes

| Scope | File | Content |
|---|---|---|
| `user` | `~/.pi/agent/memory/user-context.md` | durable facts about Rita — identity, preferences, environment |
| `engineering` | `~/.pi/agent/memory/engineering.md` | global cross-project rules — programming style, code-review standards, architecture rules, conventions |

Both are plain markdown bullet lists. Each store has a **2400-char budget**
(`MAX_CHARS`); the `add` action warns when it is exceeded.

## The `remember` tool

```
remember(scope: "user"|"engineering", action: "add"|"replace"|"remove"|"list",
         fact?: string, old_fact?: string)
```

| Action | Behaviour |
|---|---|
| `list` | returns the current contents of a store |
| `add` | appends `- <fact>` (warns if over budget) |
| `replace` | finds a line by case-insensitive substring (`old_fact`) and replaces it |
| `remove` | finds a line by substring and deletes it |

`replace` is how you *correct*: when Rita changes her mind, replace the old entry —
never append a contradiction.

## When to write (selective, proactive)

Write only when **all three** hold:

1. **Durable** — still true in months, not just this task/session.
2. **High-signal** — reduces future re-explaining or repeated corrections.
3. **Stable** — preferences, conventions, rules, environment, identity.

| | Good | Bad |
|---|---|---|
| user | "Rita prefers concise answers with tables and ASCII diagrams." | "Fixed bug X in project Y." (transient) |
| engineering | "Architecture rule: services must not share a database." | "Project Y uses Postgres." (that's `.ai/`) |

## When NOT to write

- Task progress, completed-work logs, PR numbers, commit SHAs, "Phase N done".
- Anything that will be stale within a week.
- Per-project facts → these belong in `.ai/` (see `memory-engineering.md`).

## Lifecycle & maintenance

- **Curate**: when `.ai/` accumulates a rule that applies to *every* project, promote
  it into `engineering.md` via the `/curate` prompt (which uses `remember`).
- **Forget**: `replace` to correct, `remove` to delete obsolete entries.
- **Consolidate**: if a store grows, merge/reword rather than piling on.
