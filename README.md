# agent-pack

A lightweight starter pack for building projects with agents.

agent-pack borrows the working ideas from GSD (Get Shit Done)—clear specs, small executable plans, explicit decisions, and verification—while deliberately cutting ceremony, commands, and file sprawl.

If GSD feels powerful but heavy, agent-pack aims to feel small, fast, and obvious.

⸻

## Core principles

1. Few durable truths
    - Capture what must not drift (vision, constraints, decisions) once, and reuse it everywhere.
2. Small plans, small tasks
    - Plans are rolling windows. Tasks are atomic and verifiable.
3. Decisions are first-class
   - If something matters, write it down with a reason. If it might change tomorrow, don’t lock it.
4. Verification beats completion
   - “Done” means checks pass, not “the agent said it’s finished.”
5. Lightweight by default
   - Four commands. A handful of files. No mandatory phases, no agent swarm unless you want one.

⸻

## Directory layout

All agent-pack state lives in a single directory:

```txt
.
├─ README.md                  # Project overview (humans)
├─ AGENTS.md                  # Rules of engagement (agents)
│
├─ .agent-pack/
│  ├─ README.md               # agent-pack operator manual
│  ├─ ap.config.json          # optional config knobs
│  │
│  ├─ context/                # durable truth (rarely changes)
│  │  ├─ PROJECT.md
│  │  ├─ DECISIONS.md
│  │  └─ PROGRESS.md
│  │
│  ├─ work/                   # rolling working surface
│  │  ├─ BACKLOG.md
│  │  ├─ PLAN.md
│  │  ├─ CHECKS.md
│  │  └─ STATUS.md
│  │
│  └─ runs/                   # execution evidence (gitignored or partial)
│     └─ .gitkeep
│
├─ skills/
│  ├─ commands/               # behavioral command contracts
│  │  ├─ ap-init.md
│  │  ├─ ap-plan.md
│  │  ├─ ap-do.md
│  │  └─ ap-check.md
│  │
│  ├─ agents/                 # agent role contracts
│  │  ├─ planner.md
│  │  ├─ researcher.md
│  │  ├─ builder.md
│  │  ├─ reviewer.md
│  │  └─ scribe.md
│  │
│  └─ references/             # shared rules & enforcement
│     ├─ output-contracts.md
│     └─ planning-rules.md
│
├─ src/                       # your actual project code
│  └─ ...
│
└─ .gitignore
```

You can commit everything except runs/ if you want a clean repo.

⸻

## The four commands

agent-pack intentionally limits itself to four commands. These map loosely to discuss → plan → execute → verify, but with less ceremony.

### /ap:init — project grounding

Creates or updates the durable truth for a project.

When to use:

- Starting a new project
- Clarifying scope that’s getting fuzzy

Produces / updates:

- context/PROJECT.md
- context/DECISIONS.md
- work/BACKLOG.md
- work/STATUS.md

⸻

### /ap:plan — discuss + plan

Turns 1–3 backlog items into a small, executable plan.

When to use:

- Before building anything non-trivial
- When you’re unsure what the next step should be

Produces / updates:

- work/PLAN.md
- work/CHECKS.md
- context/DECISIONS.md (if new durable decisions are made)

⸻

### /ap:do — execute

Implements one task from the plan.

When to use:

- You have a clear task with a defined check

Produces / updates:

- Code or artifacts
- work/STATUS.md
- A new folder under runs/ describing what changed and how to verify it

⸻

### /ap:check — verify

Runs acceptance checks and validates outcomes.

When to use:

- After one or more /ap:do runs
- Before calling something “done”

Produces / updates:

- work/CHECKS.md (pass/fail)
- work/PLAN.md (adds fix tasks if checks fail)

⸻

## Core files (mental model)

You don’t need to remember every file. Just remember what kind of truth each one holds:

- PROJECT.md → What is this? Who is it for? What constraints matter?
- DECISIONS.md → What have we locked in, and why?
- BACKLOG.md → What problems are worth solving?
- PLAN.md → What are we doing next, exactly?
- CHECKS.md → How do we know it worked?
- STATUS.md → Where are we right now?
- PROGRESS.md → What was completed and learned (append-only)

If something doesn’t fit cleanly into one of these, it probably doesn’t need its own file.

⸻

## Agents (by role, not swarm)

agent-pack uses a small set of clear roles. You don’t need all of them all the time.

Typical roles:

- planner — backlog → plan, resolves ambiguities
- researcher — explores unknowns, returns options + recommendation
- builder — implements one task
- reviewer — sanity-checks outputs and checks
- scribe — keeps docs clean and consistent

The important part is not the agents themselves, but that each role has a strict output contract.

⸻

## Output contracts (why this stays lightweight)

Every command and agent produces structured output:

- Files updated
- Decisions made
- Tasks created (if any)
- Unknowns / required user input

This replaces heavy workflow rules with a simple question:

“Did the output match the contract?”

If yes, move on. If not, fix it.

⸻

## Typical flow

 1. /ap:init — ground the project
 2. /ap:plan — define a small, safe plan
 3. /ap:do T001 — build one thing
 4. /ap:check — verify it worked
 5. Repeat

You can skip steps when appropriate. agent-pack is guidance, not a jail.

⸻

## What agent-pack deliberately does not do

- No mandatory phases
- No required agent swarms
- No massive planning trees
- No pretending long-term plans survive contact with reality

If you want those things, GSD is a great fit. agent-pack is for when you want to move fast without losing your footing.

⸻

## Status

agent-pack is intentionally small and evolving. Simplicity is a feature.

The README defines the philosophy and surface area. Everything else should earn its existence.
