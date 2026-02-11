# AGENTS.md

You are operating in a repository that uses **agent-pack**.

## Read this first

Before doing any work:

1. Read `.agent-pack/core/README.md`
2. Read `.agent-pack/core/context/PROJECT.md`
3. Read `.agent-pack/core/context/DECISIONS.md`
4. Read `.agent-pack/core/context/PROGRESS.md`
5. Read `.agent-pack/core/work/LOADOUT.md`

## How to work in this repo

All work must follow these commands:

- /ap:init
- /ap:plan
- /ap:do
- /ap:check

Do not invent new workflows.

Command definitions live as Agent Skills under `.agent-pack/core/skills/` and are synced into
.github/skills and .claude/skills for tool discovery.

## Rules

- Follow `.agent-pack/core/context/OUTPUT-CONTRACTS.md`
- Do not invent requirements
- Do not execute work without a plan
- Do not mark work complete without checks
- When listing milestones, backlog items, tasks, or checks in chat output, always use `ID - Title` format (for example: `B001 - Onboarding drop-off`).

## Where truth lives

- Project truth: `.agent-pack/core/context/*`
- Progress log: `.agent-pack/core/context/PROGRESS.md`
- Plans & status: `.agent-pack/core/work/*`
- Evidence: `.agent-pack/core/runs/*`

If instructions conflict, follow the truth hierarchy defined in `.agent-pack/core/README.md`.
