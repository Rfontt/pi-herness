---
name: engineering-memory
description: Read and write the engineering memory (.ai/). Use at the start of any task (read context) and when closing decisions/incidents/lessons (write).
---

# Engineering Memory

Engineering memory lives in `.ai/` (markdown in git). Structure:

- `decisions/` — intentional decisions (ADR-style): title, date, status, context, decision, consequences.
- `architecture/` — objective facts: components, invariants, how the system works.
- `incidents/` — postmortems: what happened, root cause, fix, prevention.
- `lessons/` — lessons from debugging/experience, short and actionable.
- `context/` — useful non-decision info: setup, environment, conventions, handoff.

## When to READ

At the start of any task, read the relevant `.ai/` files — especially
`.ai/context/handoff.md` (an `open` handoff is a direct instruction to continue).

## When to WRITE (never automatic)

- Architectural/engineering decision made → decisions/
- Incident resolved → incidents/
- Lesson learned (hard bug, gotcha) → lessons/
- New durable context discovered → context/

## Quality rules

- One subject per file. Concise. Dated.
- Distinguish FACT / DECISION / LESSON / CONTEXT in the content.
- Prefer append/update over duplication.
- Do not create a giant generic memory file.

## Frontmatter conventions (typed relations + TTL)

Pages MAY declare optional frontmatter to keep memory self-consistent:

```yaml
---
expires_at: 2026-09-12   # optional TTL: "valid until this date", for ephemeral state/notes
relations:               # optional typed edges to other pages
  fixes: ["lessons/linker-oom.md"]
  contradicts: ["decisions/0007-static-linking.md"]
  causes: ["incidents/outage-2026-08.md"]
---
```

- `expires_at` — ephemeral notes that should stop being consulted after a date. `/memory-lint` surfaces expired pages for deletion.
- `fixes` / `contradicts` / `causes` — typed relations between pages. Declaring a `contradicts` edge is the signal that two pages disagree; `/memory-lint` reports the pair until reconciled. When you correct an old fact, use `contradicts` (or supersede the old page) rather than silently editing history.
- Relations are optional and rare — declare them only when the contradiction/fix/cause is real. Plain prose is fine otherwise.
