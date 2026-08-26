---
name: debugging
description: Debug systematically (root cause). Use when there is a bug, a failing test, or unexpected behavior.
---

# Systematic Debugging

1. REPRODUCE — confirm the bug and describe the symptom precisely.
2. READ the whole error message — the stack trace says where.
3. FORMULATE a root-cause hypothesis (not a symptom hypothesis).
4. TEST the hypothesis with the smallest possible check (log, test, minimal repro).
5. ONE change at a time — don't change several things at once.
6. Once you find the root cause, fix it and add a test that would fail without the fix.
7. Record it in .ai/lessons/ if it's a reusable lesson.

Never "guess" fixes or mask the symptom.
