# Harness structure

## The core idea: model vs harness

Pi splits the work in two:

- **Model** — reasons and generates only. It is stateless and interchangeable
  (DeepSeek today, any other provider tomorrow).
- **Harness** — owns everything else: context, tools, workflow, memory, skills,
  orchestration, verification.

Everything in `~/.pi/agent/` is the harness. The model never touches a file on its
own; it only reasons over what the harness hands it.

## Two config layers

| Layer | Location | Loaded |
|---|---|---|
| Global | `~/.pi/agent/` | always, every run, every project |
| Per-project | `repo/.pi/`, `repo/AGENTS.md`, `repo/.ai/` | only after the project is trusted |

## Global directory map

```
~/.pi/agent/
├── AGENTS.md          standing instructions (identity, loop, safety)
├── settings.json      default provider / model / thinking level
├── auth.json          API keys (secret, mode 0600, never versioned)
├── memory/            global memory (user-context.md + engineering.md)
├── episodes/          episodic memory (transient, TTL; created on first use)
├── extensions/        TypeScript lifecycle hooks (memory, episodic-memory, handoff)
├── skills/            SKILL.md packages, loaded on demand
├── prompts/           /command templates
├── scripts/           helper scripts (purge_episodes.py)
├── cron/              scheduled jobs (jobs.d/)
├── doc/               this documentation
├── sessions/          session transcripts (jsonl)
├── models-store.json  local model/provider cache
└── trust.json         project trust decisions (created on first trust)
```

## Per-project layer

```
repo/
├── AGENTS.md (or CLAUDE.md)   project instructions (override: AGENTS.override.md)
├── .ai/                       engineering memory
│   ├── decisions/  architecture/  incidents/  lessons/  context/
│   └── context/handoff.md
├── .pi/settings.json          project settings
├── .pi/skills/                project skills (after trust)
└── SYSTEM.md                  project system-prompt override
```

## Extensions (the injection layer)

Extensions are TypeScript modules in `extensions/` that hook Pi's lifecycle events:

| Extension | Hooks | Responsibility |
|---|---|---|
| `memory.ts` | `before_agent_start`; registers `remember` | injects global memory |
| `episodic-memory.ts` | `before_agent_start`; registers `episode` | injects the episode index |
| `handoff.ts` | `input`, `tool_execution_end`, `session_before_compact`, `session_shutdown`, `before_agent_start` | session continuity |

All three append to the system prompt through `before_agent_start` by returning
`{ systemPrompt }`. This is the single seam through which memory reaches the model.

## Native-first rule

When extending the harness, prefer, in order:

1. `AGENTS.md` / `SYSTEM.md`
2. Skills (`SKILL.md`)
3. Prompt templates (`/name`)
4. `settings.json`
5. Existing extensions / pi packages
6. A custom TypeScript extension — only if nothing above suffices

## The operating loop

`AGENTS.md` encodes a senior-engineer loop that every session follows:

```
UNDERSTAND → PLAN → IMPLEMENT → VERIFY → REVIEW → REFLECT
```

REFLECT is where durable memory is written (see the memory docs). The loop, the
safety rules, and the memory pointers all live in `AGENTS.md` — the harness's
single source of standing instruction.
