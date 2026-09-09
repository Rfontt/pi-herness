# Handoff & compaction recovery — session continuity

Provided by the `handoff.ts` extension. This is the bridge between "working memory"
(the live session transcript) and durable memory: it records *where a session ended*
so the next agent (Pi, Claude Code, or any agent reading the repo) can continue
without re-doing the thinking.

## The handoff file

One per project: `.ai/context/handoff.md`. It is a **typed, single-use** record.

```yaml
---
status: open        # open | claimed | expired — only ONE open handoff at a time
owner: <who wrote it>
created: <YYYY-MM-DD>
---
```

Required body sections:

- **Done** — what was completed (concrete, verifiable).
- **Failed / pending** — what was blocked or still open.
- **Next** — the single suggested next step (or a short ordered list).
- **Open questions** — anything still to answer.
- **Decisions / lessons** — pointers to `.ai/decisions/`, `.ai/lessons/`, etc.

## Protocol

- **Single-use**: on finding an `open` handoff, read it, act on it, then mark it
  `claimed` (append `claimed_by` + `claimed_at`). Never reuse a claimed handoff.
- **Never overwrite** a handoff that is still `open` and not yours — append instead.
- Prefer writing a good handoff yourself via the `/handoff` skill; the extension
  only auto-writes a minimal fallback.

## Automatic behaviour

| Event | What the extension does |
|---|---|
| `session_shutdown` | if no `open` handoff exists, writes a minimal fallback handoff |
| `before_agent_start` | if an `open` handoff exists, injects it (capped at 4000 chars) |
| `session_before_compact` | writes `.ai/context/compaction-recovery.md` |

The fallback handoff is intentionally minimal ("run /handoff to replace this"), so
the signal that *a proper handoff is missing* is not lost.

## Compaction recovery

When a session is about to be compacted (context trimmed), the extension writes
`.ai/context/compaction-recovery.md` capturing the tools used, the error count, and
the last few prompts (topic only). This lets the post-compaction model reconstruct
what it was doing without the full transcript.
