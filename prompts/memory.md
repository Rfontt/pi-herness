---
description: Review and update global memory (user facts and engineering rules)
argument-hint: "[fato ou regra para lembrar/esquecer]"
---
Use the `remember` tool to inspect and manage global memory. Steps:
1. Call `remember` with action="list" for scope="user" and scope="engineering" to show
   what is currently remembered.
2. If the user gave something to record: follow the `memory` skill rules — scope="user"
   for facts about Rita, scope="engineering" for cross-project engineering rules.
   Use action="add" for new entries, action="replace" to correct, action="remove" to forget.
3. If nothing was given: report what is remembered (both scopes), flag stale or redundant
   entries, and propose edits. Do not change anything without confirmation.
