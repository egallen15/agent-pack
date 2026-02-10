---
name: ap-check
description: Verify completed work against defined checks, record evidence, mark pass or fail, and add fix tasks when checks fail. Use after /ap:do or before calling work done.
---

# /ap:check

## Purpose

Verify that completed work actually meets expectations.

/ap:check runs acceptance checks, records results, and determines what happens next.
It is the only command that can mark checks as pass or fail.

---

## Inputs

Any of the following:

- One or more check IDs (e.g. C001 C002)
- One or more task IDs (checks are inferred)
- No input (defaults to all active checks)

Optional:

- Notes on how checks should be run (e.g. "manual review acceptable").

---

## Reads

Must consult:

- .agent-pack/work/CHECKS.md
- .agent-pack/work/PLAN.md
- .agent-pack/work/STATUS.md
- .agent-pack/context/PROJECT.md

May consult:

- Recent runs/ output
- Repo source code

---

## Process

1. Select checks
    - Resolve input into a concrete list of checks.
    - Only checks from the active plan may be run.
    - Preserve traceability between each check ID and task ID using repo conventions.
2. Re-read intent
     - Review the task's done-when condition and plan goal.
3. Run the check
     - Follow the "How to verify" steps.
     - Record evidence.
4. Record result
     - Mark each check as pass or fail.
     - Move failed checks to the Failed section.
5. Handle failures
   - For each failed check:
   - Identify failure mode
   - Propose one or more fix tasks
   - Each fix task must be small and map to a new check (or reuse the failed one)
   - Add fix tasks directly to PLAN.md under a clearly marked "Fix tasks" section.
   - Do not implement fixes during verification unless explicitly instructed.
6. Update status
    - Update STATUS.md to reflect progress.
    - If all checks pass, mark the plan complete.

---

## Output rules

- Follow OUTPUT CONTRACTS.
- Checks must not be redefined during verification.
- Evidence should be sufficient for later review.

---

## Output contract

```md
### Files updated

- .agent-pack/work/CHECKS.md -- <summary>
- .agent-pack/work/STATUS.md -- <summary>
- .agent-pack/work/PLAN.md -- <summary if status changed>

### Decisions made

- (rare; only if verification forces a durable change)

### Tasks created or modified

- <fix tasks added to PLAN.md, if any>

- <new fix tasks, if any>

### Checks created or affected

- C### -- pass / fail

### Unknowns / needs input

- <questions or blockers>
```

---

## Completion criteria

/ap:check is complete when:

- Each selected check is marked pass or fail
- Evidence is recorded for each result
- STATUS.md reflects the current state

If failures exist, next actions must be explicit.

---

## Common failure modes

- Marking checks as pass without evidence
- Quietly changing checks to make them pass
- Fixing issues during verification without visibility
- Leaving ambiguous or partial results

---

## Notes

Verification is not a formality.

If checks frequently fail, improve planning or task scoping -- not the checking process.
