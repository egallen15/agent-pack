# PLANNING RULES

These rules define what a good plan looks like in agent-pack.
They exist to keep planning lightweight, executable, and resistant to drift.

⸻

## What planning is (and is not)

Planning is:

- Deciding what to do next
- Reducing uncertainty before building
- Creating tasks that can be executed independently

Planning is not:

- Predicting the entire future
- Designing everything up front
- Writing documentation for its own sake

If planning feels heavy, it has gone too far.

⸻

## Plan size rules

- A plan should cover days, not weeks.
- Prefer 1–5 tasks per plan.
- If a plan feels safe to hand to someone else and walk away, it’s probably the right size.

If you cannot imagine finishing the plan soon, shrink it.

⸻

Task rules

A task is valid only if all of the following are true:

- It can be executed in isolation.
- It has a clear scope boundary.
- It produces an observable change.
- It maps to exactly one check.

Red flags:

- “And then…”
- “Refactor everything…”
- “Investigate / explore” (use research instead)

If a task triggers a lot of follow-up discussion, it is too large or too vague.

⸻

## Check-first planning

Every task must define its check at planning time.

Good checks:

- Verify outcomes, not implementation steps
- Can be run without tribal knowledge
- Produce a clear pass/fail

If you can’t define the check, you don’t yet understand the task.

⸻

## Decision handling rules

During planning:

- Surface ambiguous choices explicitly.
- Record unresolved choices in Decisions needed.
- Assign a default only if it is safe and reversible.

After planning:

- Promote durable decisions to DECISIONS.md.
- Leave temporary assumptions in PLAN.md.

Never hide decisions inside task descriptions.

⸻

## Research rules

Research is justified only when:

- There is a genuine unknown that blocks planning, or
- Multiple viable approaches exist with meaningful tradeoffs.

Research output should:

- Summarize options
- Recommend one
- Explain why

Research that does not end in a recommendation is incomplete.

⸻

## Context snapshot rules

Use the context snapshot to:

- Pull in only what is relevant to this plan
- Prevent loss of key constraints or decisions

Do not copy entire files. Brevity beats completeness.

⸻

## Scope control rules

Every plan should explicitly state:

- What it will accomplish
- What it will not address

If scope keeps expanding:

- Split the plan
- Or push items back to the backlog

Plans fail more often from excess scope than from missing detail.

⸻

## When to abandon or redo a plan

Abandon or replace a plan when:

- Key assumptions are invalidated
- New information changes priorities
- Execution repeatedly stalls

Mark the plan as abandoned, note why, and create a new one.

This is a success condition, not a failure.

⸻

## Planning smell checklist

If you notice any of these, stop and adjust:

- Tasks without checks
- Plans with many open questions
- Frequent “quick fixes” added mid-execution
- Repeated re-planning without execution

These are signals, not mistakes.

⸻

## Last updated

 —
