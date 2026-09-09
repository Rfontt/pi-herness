---
name: episodic-memory
description: Capture and reuse transient, cross-project engineering lessons that auto-expire (unless permanent). Use for time-boxed knowledge like a version bump whose fix will be resolved everywhere, an intermittent error, or a temporary migration quirk. Use before re-solving a known transient problem, and when a lesson is learned that should not live forever.
---

# Episodic Memory

Transient, cross-project knowledge with a shelf life. Unlike `remember` (durable) and `.ai/` (per-project), episodes are GLOBAL and expire automatically unless flagged `permanent: true`.

## When to use

- A version bump / lib change that generated adjustments across repos, eventually resolved everywhere.
- An intermittent error that doesn't always reproduce.
- A temporary migration/workaround with a known end date.

NOT for: durable facts (use `remember`), per-project facts/decisions (use `.ai/`), secrets, PR numbers, task progress.

## Capture (episode add)

- `content`: the reusable fix/logic — self-contained, concise.
- `signature`: a tag grouping related episodes (e.g. `bump:lib-v2`).
- `expires_at`: YYYY-MM-DD when it stops being useful. REQUIRED unless permanent.
- `permanent`: true only when it turns out durable.

## Recall (episode search / read)

Before re-solving a problem, `episode search <signature-or-keyword>`. If a matching episode exists, reuse its logic instead of re-deriving it.

## Lifecycle

- Every session start, expired episodes are archived automatically (no manual step).
- Promote a recurring transient lesson to durable: distill it into global `engineering.md` via `/curate`, then remove the episode.
