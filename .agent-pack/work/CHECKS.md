# CHECKS

Checks define how we know the work actually succeeded.
If a task does not have a check, it is not complete.

⸻

## How to use checks

- Each check maps to exactly one task in PLAN.md.
- Checks should be observable and repeatable.
- Prefer outcome-based checks over implementation details.

A good check can be run by a human or an agent without extra interpretation.

⸻

## Active checks

Checks for the current plan.

- C001 —
  - Task: T001
  - How to verify:
    - `<step>`
    - `<step>`
  - Expected result:
    - `<observable outcome>`
  - Status: ☐ not run / ☐ pass / ☐ fail
  - Evidence:
  - <link, output, screenshot, log, or note (optional)>

- C002 —
  - Task: T002
  - How to verify:
  - Expected result:
  - Status: ☐ not run / ☐ pass / ☐ fail
  - Evidence:

⸻

## Failed checks

Checks that did not pass and require follow-up.

- C010 —
- Task: T010
- Failure mode:
- Suspected cause:
- Next action:

Failed checks should usually result in new tasks in PLAN.md.

⸻

## Retired checks

Checks from completed or superseded plans.

- C000 —
- Task: T000
- Outcome: pass / fail
- Notes:

This section provides lightweight history without cluttering active work.

⸻

## Check hygiene

- If a check is hard to run, simplify it.
- If a check is vague, rewrite it.
- If a che#ck keeps failing, the task or decision is probably wrong.

⸻

## Last updated

 —
