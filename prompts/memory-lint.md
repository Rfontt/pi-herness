---
description: Lint the engineering memory — find contradictions and expired pages
---
Scan the current project's `.ai/` for memory problems:

1. Contradictions: grep for `contradicts:` in frontmatter. For each page that declares a contradiction (or two pages that disagree in substance), report the pair and what should be reconciled.
2. Expired pages: grep for `expires_at:`. For each with a date in the past, report it as due for deletion.
3. Dangling relations: flag `fixes:` / `contradicts:` / `causes:` targets that point to files that no longer exist.

Report findings as a list. Do NOT delete or edit anything without asking Rita. For each finding, propose the resolution (which page wins / supersede the old / confirm deletion).
