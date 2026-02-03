# agent-pack (operator README)

This directory contains the operating system for running a project with agents.

If you are an agent or a human collaborator executing work: start here.

## What agent-pack is

agent-pack is a lightweight framework for building projects with agents.

It is intentionally small and opinionated. It favors:

- small, executable plans
- explicit, durable decisions
- outcome-based verification
- minimal ceremony

If you follow the files and commands in this directory, you should always know:

- what the project is
- what constraints apply
- what to do next
- how to tell if the work succeeded

---

## Truth hierarchy (very important)

When instructions or information conflict, resolve them in this order:

1. context/PROJECT.md — what we’re building and why
2. context/DECISIONS.md — durable decisions and constraints
3. work/PLAN.md — current executable intent
4. work/CHECKS.md — how success is verified
5. work/STATUS.md — current state and next actions
6. work/BACKLOG.md — future problems to solve
7. runs/ — evidence and execution history
8. Chat or ad-hoc discussion — lowest authority

Never violate higher truth to satisfy lower truth.

---

## The working loop

Most work in this repo follows this loop:

1. Initialize or re-ground the project
    - /ap:init
2. Plan the next step
    - /ap:plan
3. Execute exactly one task
    - /ap:do `<task-id>`
4. Verify outcomes
    - /ap:check

Repeat until the plan is complete.

Skipping steps is allowed when appropriate, but skipping verification is a smell.

⸻

## File roles (quick reference)

Durable truth

- context/PROJECT.md
- Problem, users, constraints, success criteria
- context/DECISIONS.md
- Locked, pending, and reversed decisions

## Working documents

- work/BACKLOG.md
- Problem-first backlog
- work/PLAN.md
- Short-horizon executable plan
- work/CHECKS.md
- Acceptance and verification checks
- work/STATUS.md
- Current focus and next actions

## Evidence

- runs/
- What was done, when, and why

⸻

## Commands (behavioral contracts)

Commands are agreements about behavior, not tooling.

- /ap:init — create or re-ground project truth
- /ap:plan — produce a small executable plan
- /ap:do — execute exactly one task
- /ap:check — verify outcomes and create fix tasks

If a command’s output does not match its contract, the command is incomplete.

⸻

## Agent roles

Agents operate under explicit roles:

- planner — turns problems into plans
- researcher — evaluates options and recommends
- builder — executes one task
- reviewer — enforces contracts and quality
- scribe — maintains clean project memory

An agent may act in multiple roles, but must follow the rules of the role it is acting in.

⸻

## Output contracts

All commands and roles must follow Output Contracts.

Every output must clearly state:

- files updated
- decisions made
- tasks or checks affected
- unknowns or required input

If this summary is missing or unclear, the work is not done.

⸻

## Planning discipline

When creating or modifying plans:

- plans are small (days, not weeks)
- tasks are atomic
- checks are defined first
- decisions are explicit

When things feel messy, shrink the plan.

⸻

## Common failure modes

If progress stalls, look for:

- tasks without checks
- hidden or implicit decisions
- plans that are too large
- execution without verification
- stale STATUS.md

These are signals to adjust process, not push harder.

⸻

## How to recover

- Confusion → reread PROJECT.md and DECISIONS.md
- Scope creep → shrink PLAN.md
- Repeated failures → improve task boundaries or checks
- Drift → run /ap:init again

agent-pack is designed for fast recovery.

⸻

## Final note

agent-pack stays useful by staying small.

Before adding new files, commands, or roles:

- ask whether an existing contract can be clarified instead
- ask whether the added complexity will pay for itself

Simplicity is a feature.

⸻

## Last updated

—
