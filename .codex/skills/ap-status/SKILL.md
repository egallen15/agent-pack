---
name: ap-status
description: Summarize current project status from STATUS.md and related files. Use to quickly re-orient and decide the next step.
---

# /ap:status

## Purpose

Provide a short "where are we at?" snapshot to reboot context.

---

## Inputs

Optional:

- Focus area or question (e.g. "next actions only" or "checks status").

If no input, provide a general snapshot.

---

## Reads

Must consult:

- .agent-pack/work/STATUS.md
- .agent-pack/work/PLAN.md

May consult:

- .agent-pack/work/CHECKS.md
- .agent-pack/context/PROJECT.md
- .agent-pack/context/DECISIONS.md
- .agent-pack/context/PROGRESS.md
- .agent-pack/work/BACKLOG.md
- Recent runs/ entries (if needed for recency)

---

## Process

1. Pull current focus and next actions from STATUS.md.
2. If PLAN.md has active tasks, surface the next incomplete task and its check.
3. If CHECKS.md shows failures, call them out briefly.
4. Mention any blocking issues or open questions from STATUS.md.
5. End with a recommendation to run /ap-do for the next task.

---

## Output rules

- Follow OUTPUT CONTRACTS.
- Keep the snapshot short and scannable (3-7 bullets).
- Prefer STATUS.md as the source of truth; only add other file info if it changes next steps.
- Always include a friendly nudge to run /ap-do.

---

## Output contract

```md
### Status snapshot
- <3-7 bullets; focus, next actions, blockers, checks>

### Suggested next step
- Run /ap:do <task-id> (or /ap:plan if no plan exists)

### Files updated
- (none)

### Decisions made
- (none)

### Tasks created or modified
- (none)

### Checks created or affected
- (none)

### Unknowns / needs input
- <questions if the next step is unclear>
```

---

## Completion criteria

/ap:status is complete when:

- The snapshot reflects STATUS.md
- The next step is clear and actionable
- The output is brief and friendly

---

## Common failure modes

- Copying large sections of files
- Ignoring blockers or failed checks
- Missing the /ap-do recommendation

