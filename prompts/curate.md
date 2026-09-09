---
description: Curation — distil durable rules from .ai/ into global engineering memory
---
Review the current project's `.ai/` (decisions/, lessons/, context/) and the global `~/.pi/agent/memory/engineering.md`.

Find rules / preferences / conventions that:
1. Are durable (will still matter in a month), AND
2. Should apply to EVERY project (style, architecture, code-review standards), not just this one.

For each, propose adding it to engineering.md via the `remember` tool (scope=engineering, action=add). If it is project-specific, leave it in `.ai/`.

Before writing:
- Check engineering.md for an existing entry — use action=replace, never duplicate.
- Ask Rita to approve if unsure.
- Never store PR numbers, commit SHAs, or task progress.
- Keep engineering.md compact: if you add, consider removing a stale entry.
