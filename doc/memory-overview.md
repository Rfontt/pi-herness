# Memory — the mental model

## Why memory lives in the harness, not the model

Pi separates **model** (reasoning/generation) from **harness** (context, tools,
workflow, memory, skills, verification). Memory is a harness responsibility: the
model only ever *reasons* over whatever the harness hands it. This is why memory
works the same regardless of which provider/model is configured.

Memory is **compiled, not retrieved**. There is no vector DB or RAG pipeline. Each
memory store is a small, curated, plain-markdown file (or a directory of them) that
is either:

1. **injected** into the system prompt at the start of every run, or
2. **read on demand** by the agent when a task starts.

Small + curated beats large + searched, because the goal is to *reduce future
re-explaining*, not to archive everything.

## The two axes

| Axis | Values | Question it answers |
|---|---|---|
| **Scope** | global / per-project | "Does this matter everywhere, or only in this repo?" |
| **Lifetime** | durable / transient (TTL) / single-use | "Will this still be true in months, days, or one handoff?" |

Crossing the axes gives the four store types (see `README.md` for the map). The
separation exists so that **global** knowledge is never polluted with
**project-specific** facts, and **durable** knowledge is never buried under
**transient** noise.

## How injection works

Extensions hook Pi's `before_agent_start` event and append a block to the system
prompt. Three extensions do this:

| Extension | Injects |
|---|---|
| `memory.ts` | `user-context.md` + `engineering.md` (the `remember` stores) |
| `episodic-memory.ts` | a filtered index of non-expired episodes |
| `handoff.ts` | the open handoff, if one exists |

The result: every run starts already knowing *who Rita is*, *her global rules*, any
*time-boxed lessons*, and *where the last session left off* — before the model has
read a single line of the repo.

## Evidence, not instruction

All memory (global and `.ai/`) is **evidence**, never instruction. It *informs* the
model; it does not *command* it. Write declarative facts ("Rita prefers X", "service
A owns the billing table") — not imperatives ("always do X"). The harness's standing
instructions live in `AGENTS.md` and skills; memory holds *facts*.

## Which memory for what

| You want to record… | Use | Via |
|---|---|---|
| A durable fact about Rita (preference, environment, identity) | user memory | `remember` scope=user |
| A cross-project rule (style, architecture, review standard) | engineering rules | `remember` scope=engineering |
| A fact/decision/lesson about *this* codebase | `.ai/` | `/retro` or `/handoff` |
| A time-boxed cross-project lesson (bump, intermittent bug, temporary quirk) | episode | `episode` |
| Where the session ended, for the next agent | handoff | `/handoff` (or auto) |

Rule of thumb: **global → durable → `remember`; global → transient → `episode`;
per-project → `.ai/`; continuity → handoff.**
