---
name: code-review
description: Review code with a dual perspective (correctness + business/architecture). Use before committing, when reviewing PRs/MRs, or when the user asks for a review.
---

# Code Review

Review code from TWO perspectives:

## 1. Correctness (does the code do what it should?)
- Bugs and logic errors
- Edge cases and error handling
- Security (injection, secret exposure, validation)
- Concurrency/state, if applicable
- Do tests cover the behavior? Did they run?

## 2. Business/architecture (is it the right thing?)
- Does it solve the actual problem asked?
- Does it respect the decisions in .ai/decisions/?
- Does it introduce a new dependency? Why? Is it worth it?
- Is it consistent with the project's patterns?
- Readability/maintainability

## Output
- List findings by severity (blocker / important / suggestion).
- For each finding: where, why, and a concrete suggestion.
- Never claim something works without having verified it.
