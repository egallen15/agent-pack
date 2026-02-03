# /ap:plan

## Purpose

Turn backlog problems into a small, executable plan with explicit checks.

/ap:plan combines “discuss” + “plan” by forcing:
 • surfaced decisions
 • tight tasks
 • check-first definition of done

⸻

## Inputs

Any of the following:
 • Backlog IDs (e.g. B001 B003)
 • A goal statement (e.g. “plan the next best step”)
 • Constraints or preferences (optional)

If no backlog IDs are provided, select the best next problems from BACKLOG.md using PROJECT.md success criteria and current STATUS.

⸻

## Reads

Must consult:
 • .agent-pack/context/PROJECT.md
 • .agent-pack/context/DECISIONS.md
 • .agent-pack/work/BACKLOG.md
 • .agent-pack/work/STATUS.md

May consult (if exists):
 • .agent-pack/work/PLAN.md
 • .agent-pack/work/CHECKS.md

⸻

## Process

 1. Select scope (small)
 • Choose 1–3 backlog items max.
 • State why they are chosen now.
 2. Write the plan goal
 • A concrete state change.
 3. Create a context snapshot
 • Pull only the constraints/decisions relevant to this plan.
 4. Surface decisions needed
 • Identify ambiguity that could cause rework.
 • For each decision: list options + safe default + who must decide.
 5. Produce tasks (1–5)
 • Each task must be atomic, executable, and bounded.
 • Each task must declare:
 • Scope boundary
 • Touch points (files/areas)
 • Done-when condition
 6. Define checks (1:1)
 • For every task, define exactly one check.
 • Checks must be observable + repeatable.
 7. Declare out-of-scope
 • List items explicitly not handled in this plan.
 8. Update status
 • Set Current focus and Next 3 actions.
 • The first next action should usually be /ap:do T001.

⸻

## Output rules

 • Follow OUTPUT CONTRACTS.
 • Follow PLANNING RULES.
 • Prefer clarity over completeness.
 • If uncertainty is high, reduce plan scope rather than adding complexity.

⸻

## Output contract

```md
<Output-Structure>
### Files updated

- .agent-pack/work/PLAN.md — <summary>
- .agent-pack/work/CHECKS.md — <summary>
- .agent-pack/work/STATUS.md — <summary>
- .agent-pack/context/DECISIONS.md — <summary if changed>

### Decisions made

- DN###: <decision needed> — <options + default>
- D###/P###: <any durable decision added>

### Tasks created or modified

- T###: <task> — check: C###

### Checks created or affected

- C###: <check> — task: T###

### Unknowns / needs input

- <questions>

</Output-Structure>
```

⸻

## Completion criteria

/ap:plan is complete when:
 • PLAN.md contains:
 • a plan goal
 • context snapshot
 • decisions needed (may be empty)
 • 1–5 tasks
 • out-of-scope list
 • CHECKS.md contains exactly one check per task
 • STATUS.md next actions point to executing the plan

If any of these are missing, the command must report it.

⸻

## Common failure modes

 • Too many tasks (plan is too big)
 • Tasks without clear scope boundaries
 • Checks that restate tasks instead of verifying outcomes
 • Hiding decisions inside tasks
 • Planning implementation without stating the problem being solved

⸻

## Notes

A good plan should be boring.

If the plan feels exciting, it is probably too ambitious.
