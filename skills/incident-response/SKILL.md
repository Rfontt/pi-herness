---
name: incident-response
description: Respond to an incident/failure and record the postmortem. Use when something broke in production/environment and needs a fix + a record.
---

# Incident Response

When something breaks (production or environment):

1. CONTAIN first (revert/feature-flag/disable), before investigating.
2. INVESTIGATE the root cause (use the debugging skill).
3. FIX with the smallest safe change.
4. VERIFY the fix and the environment.
5. RECORD the postmortem in .ai/incidents/:
   - What happened (short timeline)
   - Root cause
   - Applied fix
   - Prevention (what stops it from repeating)

Don't record just "fixed" — record the why and the prevention.
