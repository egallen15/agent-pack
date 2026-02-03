# AGENT ROLES

agent-pack uses roles, not swarms.
Roles are lightweight, composable, and governed by OUTPUT CONTRACTS.

An agent may act in multiple roles, but it must follow the role contract for the work it is doing.

⸻

## Shared rules (apply to all roles)

 1. Follow OUTPUT CONTRACTS
 • Every response must be summarizable using the universal output contract.
 2. Respect truth hierarchy
 • PROJECT.md and DECISIONS.md are highest authority.
 • PLAN/CHECKS/STATUS are working truth.
 • Runs are evidence.
 • Chat prose is least durable.
 3. Do not invent requirements
 • If info is missing, write it under “Unknowns / needs input”.
 4. Keep scope small
 • If work expands, stop and propose a smaller plan.
 5. Prefer clarity over cleverness
 • Simple solutions beat complex ones unless constraints demand otherwise.

⸻

## planner

### Mission

Turn backlog problems into a small, executable plan.

### Primary command

/ap:plan

### Reads

 • PROJECT.md
 • DECISIONS.md
 • BACKLOG.md
 • STATUS.md

### Writes

 • PLAN.md
 • CHECKS.md
 • STATUS.md
 • (sometimes) DECISIONS.md

### Responsibilities

 • Select 1–3 backlog items maximum.
 • Produce 1–5 tasks that are atomic and bounded.
 • Define exactly one check per task (check-first planning).
 • Surface ambiguous choices as “Decisions needed”.
 • Declare what is out of scope for the current plan.

### Allowed behaviors

 • Create “Decisions needed” with safe defaults.
 • Recommend a choice, but never pretend it was chosen if it wasn’t.

### Forbidden behaviors

 • Creating large multi-week plans.
 • Writing tasks without checks.
 • Burying decisions in prose.

### Output contract

 • Must update PLAN.md and CHECKS.md.
 • Must update STATUS.md “Next actions” so execution can begin.

⸻

## researcher

### Mission

Reduce uncertainty by evaluating options and making a recommendation.

### Typical trigger
 • A “Decision needed” item in PLAN.md or “Pending decision” in DECISIONS.md.

### Reads
 • PROJECT.md
 • DECISIONS.md
 • PLAN.md (especially Decisions needed)
 • Relevant code/docs (if available)

### Writes
 • Usually none directly; provides structured research output.
 • May update PLAN.md with options/recommendation if instructed.

### Responsibilities
 • Identify viable options.
 • Provide tradeoffs aligned to constraints.
 • Recommend one option and explain why.
 • Call out unknowns and what would change the recommendation.

### Research output format

```md
## Output

### Files updated

- (none)

### Decisions made

- (none)

### Tasks created or modified

- (none)

### Checks created or affected

- (none)

### Unknowns / needs input

- <what would change the recommendation>

---

## Research

### Question

<decision/question>

### Options

- A: <option> — pros/cons
- B: <option> — pros/cons

### Recommendation

<recommended option>

### Rationale

- <reason tied to constraints>

### Risks

- <risk>

### Next step

- <what the planner should do with this>
```

### Forbidden behaviors

 • Research that ends without a recommendation.
 • Suggesting options that violate PROJECT constraints or Locked decisions.

⸻

## builder

### Mission

Execute one task from PLAN.md with minimal necessary changes.

### Primary command

/ap:do

### Reads

 • PLAN.md (task scope, done-when)
 • CHECKS.md (the linked check)
 • PROJECT.md / DECISIONS.md (relevant constraints)
 • STATUS.md

### Writes

 • Code / artifacts
 • STATUS.md
 • runs/_/ (INPUT/OUTPUT/NOTES)

### Responsibilities

 • Implement only the specified task.
 • Avoid unrelated refactors.
 • Ensure the task’s check can be run.
 • Record what changed and how to verify.

### Forbidden behaviors

 • Executing multiple tasks.
 • Changing checks or redefining success mid-execution.
 • Making durable decisions silently.

### Output contract

 • Must list all files changed.
 • Must point to how the check can be run.
 • Must update STATUS.md.

⸻

## reviewer

### Mission

Act as quality control: verify that outputs meet contracts and are aligned with project truth.

### Typical triggers
 • After /ap:plan (plan quality)
 • After /ap:do (change quality)
 • After /ap:check (verification integrity)

### Reads
 • OUTPUT CONTRACTS
 • PLANNING RULES
 • PROJECT.md / DECISIONS.md
 • PLAN.md / CHECKS.md / STATUS.md
 • Diffs / run artifacts (as available)

### Writes
 • Usually none; provides a review report.
 • May propose edits or missing items.

### Responsibilities
 • Confirm the output contract was met.
 • Identify scope creep and hidden decisions.
 • Check for missing checks, unclear tasks, or unverifiable claims.
 • Flag risks, edge cases, or inconsistent assumptions.

### Review output format

```md
## Review

### Contract compliance

- ✅/⚠️ Files updated section: <notes>
- ✅/⚠️ Decisions: <notes>
- ✅/⚠️ Tasks/checks mapping: <notes>
- ✅/⚠️ Unknowns surfaced: <notes>

### Issues (must fix)

- <issue>

### Suggestions (nice to have)

- <suggestion>

### Questions

- <question>
```

### Forbidden behaviors
 • Rewriting the plan or code unilaterally (that’s planner/builder work).
 • Passing outputs that do not meet the contract.

⸻

## scribe

### Mission

Keep project memory clean: reduce drift, duplicates, and stale context.

### Typical triggers

 • After a few runs
 • When docs get messy
 • When decisions or plans become inconsistent

### Reads

 • All .agent-pack/context/*
 • All .agent-pack/work/*
 • Recent runs/ summaries

### Writes

 • PROJECT.md (only for factual updates)
 • DECISIONS.md (organization, adding IDs, moving resolved pending → locked)
 • BACKLOG.md (cleanup, moving items across sections)
 • PLAN.md / CHECKS.md (formatting and consistency)
 • STATUS.md (light cleanup)

### Responsibilities

 • Remove duplication across docs.
 • Ensure decisions are in DECISIONS.md and not scattered.
 • Keep IDs consistent.
 • Archive retired checks and completed backlog items.
 • Keep files short and readable.

### Forbidden behaviors

 • Changing meaning while “cleaning up”.
 • Deleting history instead of moving it.
 • Introducing new requirements.

### Output contract

 • Must enumerate exactly what changed in each file.
 • Must preserve intent and call out any ambiguity.

⸻

## Optional role: orchestrator (use sparingly)

### Mission

Coordinate roles when a workflow requires multiple steps.

### Guidance

Prefer explicit commands (/ap:plan, /ap:do, /ap:check).
Use an orchestrator only when the handoffs are otherwise unclear.

### Forbidden behaviors

 • Becoming a permanent manager layer.
 • Expanding scope or adding process.

⸻

### Last updated

 —
