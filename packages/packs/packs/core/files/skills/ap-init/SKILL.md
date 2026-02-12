---
name: ap-init
description: Initialize or re-ground a project by creating durable truth files (PROJECT.md, DECISIONS.md, USERS.md, SECURITY.md, PROGRESS.md, BACKLOG.md, LOADOUT.md, STATUS.md). Use when starting new work or when scope has drifted.
---

# /ap:init

## Purpose

Initialize (or re-ground) a project using agent-pack.

This command creates the durable truth set and the initial working surface:

- PROJECT.md (what we're building)
- DECISIONS.md (durable decisions)
- USERS.md (durable user segments, JTBD, goals, and success signals)
- SECURITY.md (security posture, constraints, and baseline controls)
- PROGRESS.md (completed work and learnings)
- BACKLOG.md (problem list)
- LOADOUT.md (installed modules/loadouts and phase usage guidance)
- STATUS.md (what's happening next)

Use /ap:init when starting a new repo or when scope has drifted.

---

## Inputs

Start a conversation with the user to gather as much as you can. Rough notes are fine, but we can't produce final content without clarity.

- Project idea / description
- Target users
- Constraints (time, budget, tech, compliance)
- Preferred stack (optional)
- Non-goals (what we are not doing)

If inputs are missing, this command must surface them as Unknowns / needs input. If the user cannot provide them, make assumptions but mark them clearly. Ask follow-up questions to clarify vague or incomplete inputs, and iterate until you have enough to proceed. Check with the user before finalizing the output.

---

## Reads

Must consult the following if they exist:

- .agent-pack/core/context/PROJECT.md
- .agent-pack/core/context/DECISIONS.md
- .agent-pack/core/context/USERS.md
- .agent-pack/core/context/SECURITY.md
- .agent-pack/core/context/PROGRESS.md
- .agent-pack/core/work/BACKLOG.md
- .agent-pack/core/work/LOADOUT.md
- .agent-pack/core/work/STATUS.md

If these do not exist, create them from templates.

---

## Process

1. Clarify the one-liner
   - Produce a one-sentence description that can be repeated later.
2. Extract scope shape
   - Identify users + JTBD + top use cases
   - Identify non-goals
   - Identify constraints
   - Populate USERS.md and SECURITY.md when those contexts materially affect planning
3. Define success criteria
   - Produce 2-6 checkable success criteria.
4. Seed decisions
   - Record any obvious durable decisions as Locked.
   - Record unresolved forks as Pending.
5. Seed the backlog
   - Produce 3-10 problem statements.
   - Keep them problem-first, not solution-first.
   - Milestone grouping is recommended when helpful, but not required.
   - If project shape is still uncertain, a flat backlog is acceptable.
6. Set immediate next actions
   - Update STATUS.md with current focus + next 3 actions.
   - Prefer actions that lead naturally to /ap:plan.
7. Initialize loadout context
   - Ensure LOADOUT.md reflects currently installed modules/loadouts (or placeholders if unknown).
   - Record module usage expectations for planning, building, and checks.

---

## Output rules

- Follow `.agent-pack/core/context/OUTPUT-CONTRACTS.md`.
- Keep content short and readable.
- Do not invent requirements.
- If uncertain, explicitly mark assumptions.
- When listing milestones, backlog items, tasks, or checks in chat output, always include ID and title in `ID - Title` format.
- Include a Suggested next steps section with 1-3 commands that naturally move into /ap:plan.

---

## Output contract

```md

### Files updated

- .agent-pack/core/context/PROJECT.md -- <summary>
- .agent-pack/core/context/DECISIONS.md -- <summary>
- .agent-pack/core/context/USERS.md -- <summary if created/updated>
- .agent-pack/core/context/SECURITY.md -- <summary if created/updated>
- .agent-pack/core/context/PROGRESS.md -- <summary>
- .agent-pack/core/work/BACKLOG.md -- <summary>
- .agent-pack/core/work/LOADOUT.md -- <summary>
- .agent-pack/core/work/STATUS.md -- <summary>

### Decisions made

- <D/P entries>

### Tasks created or modified

- (usually none; /ap:init seeds backlog, not plan tasks)

### Checks created or affected

- (none; success criteria live in PROJECT.md)

### Unknowns / needs input

- <questions>

### Suggested next steps

- /ap:plan (select 1-3 backlog items)
- /ap:plan ("plan the next best step")

```

---

## Completion criteria

/ap:init is complete when:

- PROJECT.md has a clear one-liner, users, non-goals, constraints, and success criteria
- DECISIONS.md contains at least one item (Locked or Pending)
- USERS.md exists when user segmentation materially affects planning quality
- SECURITY.md exists when security constraints materially affect planning quality
- PROGRESS.md exists (may contain only the template)
- BACKLOG.md has at least 3 meaningful problem statements
- LOADOUT.md exists with initial module/loadout context
- STATUS.md has a current focus and 3 next actions

If any of the above are missing, the command must report it.

---

## Common failure modes

- Writing tasks instead of problems (belongs in PLAN.md)
- Missing non-goals (scope creep risk)
- Vague success criteria ("easy", "fast", "robust" without signals)
- Silent assumptions instead of explicit unknowns

---

## Notes

/ap:init should feel fast.

If this command becomes long or painful, it is a signal that the project definition is unclear -- not that more process is needed.
