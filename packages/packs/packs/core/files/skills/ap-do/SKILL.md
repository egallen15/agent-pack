---
name: ap-do
description: Execute exactly one task from the active plan, update status, and record evidence. Use when a single task with a defined check is ready to build.
---

# /ap:do

## Purpose

Execute one task from the current plan.

/ap:do is intentionally narrow: it builds a single task, updates status, and records what happened.
If more than one task is executed, the command has failed.

---

## Inputs

Required:

- A task ID from PLAN.md (e.g. T001 or another repo-convention ID)

Optional:

- Notes or constraints (e.g. "prioritize correctness over speed")

If no task ID is provided, pick the next incomplete task from the PLAN.md.

---

## Reads

Must consult:

- .agent-pack/core/work/PLAN.md
- .agent-pack/core/work/CHECKS.md
- .agent-pack/core/work/LOADOUT.md
- .agent-pack/core/work/STATUS.md
- .agent-pack/core/context/PROJECT.md
- .agent-pack/core/context/DECISIONS.md
- .agent-pack/core/context/PROGRESS.md

May consult:

- Repo source code
- Relevant runs/ history

---

## Process

1. Validate the task
   - Confirm the task exists and is in the active plan.
   - Confirm the task has exactly one associated check.
   - Confirm task/check IDs are traceable under the repo's conventions.
2. Reconstruct intent
   - Re-read task scope, done-when condition, and related decisions.
   - Confirm the task's approach aligns with installed module/loadout rules in LOADOUT.md.
   - If intent is unclear, stop and report an unknown.
3. Execute the task
   - Make the minimum changes required to satisfy the task.
   - Do not perform unrelated refactors or improvements.
4. Self-check against the defined check
   - Run or simulate the check.
   - Do not invent new checks during execution.
5. Record the run
   - Create a new folder under runs/:
   - `<timestamp>_<task-id>`/
   - Record inputs, outputs, and notes.
6. Update status
   - Mark progress in STATUS.md.
   - Update "Recent changes" with a pointer to the run.
7. Append progress log
   - Add a dated entry to PROGRESS.md with a short summary and any learnings.

---

## Output rules

- Follow `.agent-pack/core/context/OUTPUT-CONTRACTS.md`.
- Change only what the task requires.
- Prefer correctness and clarity over cleverness.
- If the task reveals a missing decision, stop and report it.
- When listing milestones, backlog items, tasks, or checks in chat output, always include ID and title in `ID - Title` format.

---

## Output contract

```md
### Files updated

- <file path> -- <what changed>
- .agent-pack/core/context/PROGRESS.md -- <progress entry>

### Decisions made

- (none expected; new durable decisions should be rare)

### Tasks created or modified

- T### - <task title> -- <status update or note>

### Checks created or affected

- C### - <check title> -- <result or notes>

### Unknowns / needs input

- <questions or blockers>
```

---

## Completion criteria

/ap:do is complete when:

- The task's done-when condition is satisfied
- The associated check can be run
- STATUS.md reflects the new state
- A run record exists under runs/
- PROGRESS.md records the completed work

If the task cannot be completed, the command must report why.

---

## Common failure modes

- Executing multiple tasks in one run
- Expanding scope beyond the task definition
- Quietly changing decisions
- Creating new checks mid-execution
- Forgetting to update STATUS.md

---

## Notes

/ap:do should feel focused and boring.

Momentum comes from finishing small tasks, not heroic executions.
