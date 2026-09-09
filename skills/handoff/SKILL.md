---
name: handoff
description: Close a work session with a TYPED, single-use handoff. Use at the end of a task, when the user asks to wrap up / continue later, or when switching to another agent.
---

# Handoff

Write the handoff to `.ai/context/handoff.md` (one per project). It is a typed,
single-use record: the next agent (pi, Claude Code, or any agent reading the repo)
consumes it exactly once and marks it claimed.

## Frontmatter (required)

```yaml
---
status: open          # open | claimed | expired — only ONE open handoff at a time
owner: <who wrote it> # you, or the team member
created: <YYYY-MM-DD>
---
```

## Body (required sections)

- Done: what was completed this session (concrete, verifiable).
- Failed / pending: what didn't work, what was blocked, what is still open.
- Next: the single suggested next step (or a short ordered list).
- Open questions: anything still to answer or confirm.
- Decisions / lessons: pointers to `.ai/decisions/`, `.ai/lessons/`, etc.

## Protocol rules

- Single-use: when you start a session and find an `open` handoff, read it, act on it, then mark it `status: claimed` (append `claimed_by` + `claimed_at`). Never reuse an already-claimed handoff.
- Never overwrite a handoff that is still `open` and not yours — append instead.
- The `handoff` extension auto-writes a minimal fallback handoff if a session ends without an open one. Prefer writing a good one yourself via this skill.
