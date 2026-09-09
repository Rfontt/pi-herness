---
name: code-review
description: Review the changes on a branch against main in three tracks — tests, new files, changed existing files — driven by the project's .ai/ rules, and open the findings in Hunk (via herdr). Use before committing, when reviewing PRs/MRs, or when asked for a review.
---

# Code Review

Load the project's rules, review the diff against `main` in three tracks, and surface findings in Hunk.

## Hard exclusion — `.ai/` is never reviewed
`.ai/` is engineering memory (context + rules), not production code. It is INPUT to the review
(Phase 0), never a review TARGET. Never flag `.ai/` files; keep them out of the diff, the untracked
set, and the Hunk window.

## Phase 0 — Load the project's rules (always first)
- Read `.ai/context/code-review.md` (the ruleset). Its `[RULE-ID]` rules are binding — apply every one.
- Read `.ai/architecture/` and `.ai/context/` (code-style, test-style, build) for the conventions the change must respect.
- If the project has no `.ai/`, run the `research-project` skill first (or fall back to the generic checks below).

## Phase 1 — Get the diff
- `git diff main...HEAD` — the full branch diff against main (committed work, NOT the working tree).
- EXCLUDE `.ai/`: `git diff main...HEAD -- . ':(exclude).ai'` (and skip untracked files under `.ai/`). Apply
  the same exclusion when opening Hunk: `hunk diff main...HEAD -- . ':(exclude).ai' ...`.
- Review hunk-by-hunk with Hunk (open it in Phase 3).

## Phase 2 — Review in three tracks

### Track 1 — Tests (read-only review)
- Every changed behavior needs a test: happy path AND error path.
- Review is READ-ONLY — do NOT run tests/lint/build. Flag missing or weak tests; never claim "passes".
- Tests assert the whole result, not a single field.
- Tests match the project's conventions in `.ai/context/test-style.md`.

### Track 2 — New files (full review)
- Correctness: bugs, logic errors, edge cases.
- Error handling + security (injection, secret exposure, validation).
- Concurrency/state, if applicable.
- Consistency with project patterns (architecture, naming, logging) from `.ai/`.
- New dependency? Why, and is it worth it?
- Wired/registered correctly (DI, routing, event converters) — a new file usually needs a registration elsewhere.

### Track 3 — Changed existing files (diff-focused)
- Does the diff match the stated intent?
- Respects existing patterns and the `.ai/` rules; no silent architecture/behavior change.
- No unrelated changes outside the task scope.
- Backward compatibility (schemas, contracts, nullability) — `.ai/architecture/flows.md` invariants.

## Phase 3 — Surface findings in Hunk (via herdr, never osascript)
1. Write findings to `.git/review-notes.json` in Hunk's `--agent-context` schema:
   `{"version":1,"summary":"...","files":[{"path":"<repo-relative>","summary":"...","annotations":[{"newRange":[line,line],"summary":"[RULE-ID] finding","rationale":"why + fix"}]}]}`
   — one annotation per finding, `newRange` = new-file line numbers. No findings → summary only.
2. Open Hunk on the diff with the notes, using herdr (do NOT use osascript):
   - `HERDR_ENV=1`: `herdr pane split --current --direction right --cwd "$PWD" --no-focus`, read `.result.pane.pane_id`, then `herdr pane run <pane-id> "hunk diff main...HEAD --agent-context .git/review-notes.json --agent-notes"`.
   - Not inside herdr: report findings in chat only.
3. Verify the window came up: `herdr pane read <pane-id> --source recent-unwrapped --lines 10` after a few seconds.
4. Keep the chat summary short — the detail lives in the Hunk notes.

## Output
- Severity per finding: blocker / important / suggestion.
- Format: `[<RULE-ID>] <finding> — <where> — <concrete suggestion>` (use `.ai/` rule IDs when they apply; otherwise a short category tag).
- Never claim something works without having verified it.
