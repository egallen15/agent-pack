# OUTPUT CONTRACTS

Output contracts define what a command or agent must produce.
They are the primary mechanism that keeps agent-pack lightweight and predictable.

If the output matches the contract, the work is acceptable.
If it does not, the work is incomplete — regardless of effort or explanation.

⸻

## Why output contracts exist

Instead of complex workflows or heavy validation rules, agent-pack relies on one question:

“Did this output meet the contract?”

This allows:

- Simple commands
- Independent agents
- Easy verification by humans
- Fewer hidden assumptions

Contracts trade flexibility in format for clarity in outcome.

⸻

## Universal output contract

Every command and agent must produce output that can be summarized using the following structure:

```md

### Files updated

- <file path> — <what changed>

### Decisions made

- <decision ID or description> — <summary> — <why>

### Tasks created or modified

- <task ID> - <task title> — <what changed> — <related check ID> - <related check title>

### Checks created or affected

- <check ID> - <check title> — <what changed>

### Unknowns / needs input

- <question or missing info>

### Suggested next steps

- <1-3 commands a user can run next>

```

Sections may be empty, but they should never be omitted.

⸻

## ID listing format

When listing milestones, backlog items, tasks, or checks in agent chat output:

- Always include both ID and title.
- Use this format: `<ID> - <Title>`.
- Never list bare IDs alone (for example: `B001`, `M01`, `T003`, `C002`).

⸻

## File update rules

When listing files:

- Only include files that materially changed.
- Be specific about what changed (not just “updated”).
- If no files changed, explicitly say so.

This makes review fast and avoids silent side effects.

⸻

## Decision rules

A decision should be recorded when:

- It meaningfully constrains future work, or
- Multiple reasonable options existed.

Rules:

- Durable decisions go to DECISIONS.md.
- Temporary assumptions stay in PLAN.md.
- If unsure, record the decision and mark it reversible.

Never bury decisions in prose.

⸻

## Task rules

When creating or modifying tasks:

- Tasks must be small and executable.
- Each task must map to exactly one check.
- Tasks should reference the problem or goal they serve.

If a task cannot be checked, it is not a task.

⸻

## Check rules

Checks should:

- Verify outcomes, not internal steps.
- Be runnable by a human or agent without extra context.
- Produce a clear pass/fail signal.

If a check is ambiguous, rewrite it.

⸻

## Unknowns and handoffs

If progress depends on missing information:

- Surface it explicitly under Unknowns / needs input.
- Do not silently guess unless a default is documented.

Clear handoffs prevent rework and hallucinated assumptions.

⸻

## Suggested next steps

To help a smooth flow (init -> plan -> do -> check), include 1-3 next-step commands.

These suggestions are meant to be machine-readable so clients (like VS Code) can surface them as actions.

⸻

## Contract enforcement

A reviewer (human or agent) should be able to:

 1. Read the output summary
 2. Cross-check listed files
 3. Confirm decisions, tasks, and checks are consistent

If this cannot be done quickly, the output violates the contract.

⸻

## When to tighten or relax contracts

- Tighten contracts when errors repeat or ambiguity increases.
- Relax contracts when friction outweighs clarity.

The goal is not compliance — it is reliable forward motion.

⸻

## Last updated

 —
