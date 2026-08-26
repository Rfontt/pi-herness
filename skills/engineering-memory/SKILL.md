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
- `context/` — useful non-decision info: setup, environment, conventions.

## When to READ
At the start of any task, read the relevant .ai/ files.

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
