# /ap:init

## Purpose

Initialize (or re-ground) a project using agent-pack.

This command creates the durable truth set and the initial working surface:

- PROJECT.md (what we’re building)
- DECISIONS.md (durable decisions)
- PROGRESS.md (completed work and learnings)
- BACKLOG.md (problem list)
- STATUS.md (what’s happening next)

Use /ap:init when starting a new repo or when scope has drifted.

⸻

## Inputs

Provide as much as you can. Rough notes are fine.

- Project idea / description
- Target users
- Constraints (time, budget, tech, compliance)
- Preferred stack (optional)
- Non-goals (what we are not doing)

If inputs are missing, this command must surface them as Unknowns / needs input.

⸻

## Reads

Must consult the following if they exist:

- .agent-pack/context/PROJECT.md
- .agent-pack/context/DECISIONS.md
- .agent-pack/context/PROGRESS.md
- .agent-pack/work/BACKLOG.md
- .agent-pack/work/STATUS.md

If these do not exist, create them from templates.

⸻

## Process

1. Clarify the one-liner
   - Produce a one-sentence description that can be repeated later.
2. Extract scope shape
   - Identify users + top use cases
   - Identify non-goals
   - Identify constraints
3. Define success criteria
   - Produce 2–6 checkable success criteria.
4. Seed decisions
   - Record any obvious durable decisions as Locked.
   - Record unresolved forks as Pending.
5. Seed the backlog
   - Produce 3–10 problem statements.
   - Keep them problem-first, not solution-first.
6. Set immediate next actions
   - Update STATUS.md with current focus + next 3 actions.
   - Prefer actions that lead naturally to /ap:plan.

⸻

## Output rules

- Follow OUTPUT CONTRACTS.
- Keep content short and readable.
- Do not invent requirements.
- If uncertain, explicitly mark assumptions.

⸻

## Output contract

```md

### Files updated

- .agent-pack/context/PROJECT.md — <summary>
- .agent-pack/context/DECISIONS.md — <summary>
- .agent-pack/context/PROGRESS.md — <summary>
- .agent-pack/work/BACKLOG.md — <summary>
- .agent-pack/work/STATUS.md — <summary>

### Decisions made

- <D/P entries>

### Tasks created or modified

- (usually none; /ap:init seeds backlog, not plan tasks)

### Checks created or affected

- (none; success criteria live in PROJECT.md)

### Unknowns / needs input

- <questions>

```

⸻

## Completion criteria

/ap:init is complete when:

- PROJECT.md has a clear one-liner, users, non-goals, constraints, and success criteria
- DECISIONS.md contains at least one item (Locked or Pending)
- PROGRESS.md exists (may contain only the template)
- BACKLOG.md has at least 3 meaningful problem statements
- STATUS.md has a current focus and 3 next actions

If any of the above are missing, the command must report it.

⸻

## Common failure modes

- Writing tasks instead of problems (belongs in PLAN.md)
- Missing non-goals (scope creep risk)
- Vague success criteria (“easy”, “fast”, “robust” without signals)
- Silent assumptions instead of explicit unknowns

⸻

## Notes

/ap:init should feel fast.

If this command becomes long or painful, it is a signal that the project definition is unclear — not that more process is needed.
