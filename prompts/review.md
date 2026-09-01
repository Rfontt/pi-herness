---
description: Review staged changes before committing
argument-hint: "[scope]"
---
Use the code-review skill. First load the project review ruleset: `.ai/context/code-review.md` (when present in the repo) and apply EVERY rule in it. Review the current worktree changes — `git diff HEAD` plus untracked files (the same content `hunk diff` shows) — from both perspectives: correctness + business/architecture. Report findings by severity (blocker / important / suggestion), each referencing its rule ID (e.g. [DDD-01], [STYLE-02], [PROCESS-01]), with location and a concrete suggestion. Never claim a check passes without running it.

Automate the review window (no manual steps):
1. Write the findings to `.git/review-notes.json` in Hunk's `--agent-context` schema: `{"version":1,"summary":"...","files":[{"path":"<repo-relative>","summary":"...","annotations":[{"newRange":[line,line],"summary":"[RULE-ID] finding","rationale":"why + fix"}]}]}` — one annotation per finding, newRange = new-file line numbers. If there are no findings, write only the summary.
2. Open Hunk on the diff with the notes, preferring herdr when available:
   - If `HERDR_ENV=1` (pi runs inside herdr): split a sibling pane and run hunk there — `herdr pane split --current --direction right --cwd "$PWD" --no-focus`, read `.result.pane.pane_id`, then `herdr pane run <pane-id> "hunk diff --agent-context .git/review-notes.json --agent-notes"`.
   - Else if `command -v hunk` succeeds: spawn a Terminal window — `osascript -e 'tell application "Terminal" to do script "cd <repo> && hunk diff --agent-context .git/review-notes.json --agent-notes"'`.
   - Else: report findings in chat only.
3. Verify the window came up: herdr case → `herdr pane read <pane-id> --source recent-unwrapped --lines 10` after a few seconds; osascript case → `hunk session list` (retry up to ~15s).
4. Keep the chat summary short — the detail lives in the Hunk notes.
