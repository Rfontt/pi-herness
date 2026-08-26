# Pi Personal Engineering Harness

Personal configuration for [Pi](https://pi.dev/) — a minimal coding agent harness. This repo makes the harness reproducible across machines.

## Contents

- `AGENTS.md` — global instructions: identity, operating loop, safety rules, memory pointers.
- `settings.json` — default provider/model (DeepSeek `deepseek-v4-pro`, thinking `high`).
- `skills/` — capability packages: engineering-memory, planning, code-review, debugging, incident-response, handoff.
- `prompts/` — quick prompt templates: /understand /plan /implement /verify /review /retro /handoff.

## Install on a new machine

1. Install Pi:
   ```
   npm install -g --ignore-scripts @earendil-works/pi-coding-agent
   # or: curl -fsSL https://pi.dev/install.sh | sh
   ```
2. Clone this repo into the config directory:
   ```
   git clone git@github.com:Rfontt/pi-herness.git ~/.pi/agent
   ```
   (if `~/.pi/agent` already exists, move it aside first)
3. Set the DeepSeek API key (NOT in this repo — it's a secret):
   - `export DEEPSEEK_API_KEY=...`, or
   - run `pi` → `/login` → DeepSeek, or
   - write it manually to `~/.pi/agent/auth.json` (mode 0600).

## Notes

- `auth.json`, `trust.json`, `sessions/`, `models-store.json` are intentionally NOT versioned (secret / machine-specific / cache).
- Per-project engineering memory lives in each project's `.ai/` directory (versioned in that project's own git repo).
