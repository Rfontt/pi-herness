---
description: Reflect at the end of a session and WRITE durable memory (.ai/)
---
Run the reflection checklist. This is NOT optional — it is how the harness learns:

1. Decision made this session? → write `.ai/decisions/<slug>.md` (ADR: status, context, decision, consequences).
2. Lesson learned (gotcha, hard bug, wrong assumption)? → write `.ai/lessons/<slug>.md`.
3. Incident or outage? → write `.ai/incidents/<slug>.md` (root cause, fix, prevention).
4. New durable context (setup, convention, environment)? → write `.ai/context/<slug>.md`.
5. Did anything you wrote contradict an existing `.ai/` page? → add a `contradicts:` relation, or supersede the old page.
6. Any ephemeral note that should expire? → set `expires_at:`.

Then ensure a handoff exists: run the `handoff` skill (typed, single-use).

Be concise. Memory is evidence, not instruction. Never write raw secrets or full transcripts.
