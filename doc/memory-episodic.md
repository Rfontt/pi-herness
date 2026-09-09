# Episodic memory — transient cross-project lessons

Provided by the `episodic-memory.ts` extension. Episodes are **global** (not tied to
one project) but **transient** (they expire). They sit between `remember` (durable,
global) and `.ai/` (durable, per-project): knowledge you need across repos *right
now*, but that should stop being consulted after a date.

## Storage

```
~/.pi/agent/episodes/
├── <slug>.md          → active episodes
└── .archive/          → expired episodes (purged after 7 days)
```

Each episode is a markdown file with frontmatter:

```yaml
---
created: 2026-09-08
signature: bump:lib-v2     # optional tag grouping related episodes
expires_at: 2026-09-20                # OR permanent: true
---
<body: the reusable fix/logic>
```

## The `episode` tool

```
episode(action: "add"|"list"|"read"|"search"|"renew"|"remove",
        name?, content?, signature?, expires_at?, permanent?)
```

| Action | Behaviour |
|---|---|
| `add` | create an episode; requires `content` **and** either `expires_at` or `permanent: true` |
| `list` | all episodes |
| `read` | one episode, by slug |
| `search` | by slug/`signature`/keyword (only non-expired) |
| `renew` | push `expires_at` forward (drops `permanent`) |
| `remove` | move an episode to `.archive/` |

**Key rule:** an episode must not live forever by default — `add` is rejected without
an `expires_at` (unless `permanent: true`). This is what keeps the store from rotting.

## Lifecycle

1. **Inject** — at session start the extension injects a *filtered* index: only
   non-expired episodes, sorted by expiry. Expired episodes are simply never shown
   to the agent.
2. **Recall** — before re-solving a problem, `episode search <signature-or-keyword>`
   and reuse the logic instead of re-deriving it.
3. **Renew** — if a lesson is still live at its expiry, `renew` it.
4. **Purge** — `scripts/purge_episodes.py` (scheduled daily at 06:00 via
   `cron/jobs.d/purge-episodes.job`) moves expired episodes into `.archive/`, then
   hard-deletes `.archive/` entries older than 7 days.
5. **Promote** — if a recurring transient lesson turns out durable, distill it into
   global `engineering.md` via `/curate`, then `remove` the episode.

## When to use

- An intermittent error that does not always reproduce.
- A temporary migration/workaround with a known end date.

**Not** for: durable facts (`remember`), per-project facts/decisions (`.ai/`),
secrets, PR numbers, or task progress.
