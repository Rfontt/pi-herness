# Engineering memory — `.ai/` (per-project)

Per-project, durable knowledge about **one** codebase. Lives in `.ai/` at the repo
root, is written in markdown, and is **versioned in that project's own git repo** —
so it travels with the code, survives machine swaps, and can be reviewed in PRs.

## Structure

```
.ai/
├── decisions/     → intentional decisions (ADR-style)
├── architecture/  → objective facts about the system
├── incidents/     → postmortems
├── lessons/       → lessons from debugging/experience
└── context/       → useful non-decision info (setup, conventions, handoff)
```

## The four-way distinction

Every `.ai/` page should make its kind explicit in the content:

| Kind | Meaning |
|---|---|
| **FACT** | objective truth about the system ("service A owns the billing table") |
| **DECISION** | intentional choice ("ADR-003: moved to event-driven") |
| **LESSON** | learned from experience ("the linker OOMs when…") |
| **CONTEXT** | useful info that is none of the above (setup steps, conventions) |

## Frontmatter (typed relations + TTL)

Pages *may* declare optional frontmatter to keep memory self-consistent:

```yaml
---
expires_at: 2026-09-12     # TTL: stop consulting after this date
relations:
  fixes: ["lessons/linker-oom.md"]
  contradicts: ["decisions/0007-static-linking.md"]
  causes: ["incidents/outage-2026-08.md"]
---
```

- `expires_at` — for ephemeral notes; `/memory-lint` surfaces expired pages.
- `fixes` / `contradicts` / `causes` — typed edges between pages. Declaring a
  `contradicts` edge is the signal that two pages disagree; `/memory-lint` reports
  the pair until reconciled. Correct a fact by *contradicting* (or superseding) the
  old page — never by silently editing history.
- Relations are optional and rare; plain prose is fine most of the time.

## Read / write timing

- **Read** at the start of every task — especially `.ai/context/handoff.md` (an
  `open` handoff is a direct instruction to continue).
- **Write** only at defined moments, never automatically on every conversation:
  - decision made → `decisions/`
  - incident resolved → `incidents/`
  - lesson learned → `lessons/`
  - durable context discovered → `context/`

## Maintenance

- `/retro` — end-of-session reflection that writes the right `.ai/` page(s).
- `/memory-lint` — scans for contradictions, expired pages, and dangling relations
  (reports only; never edits without asking).
- One subject per file; concise; dated; prefer append/update over duplication.
