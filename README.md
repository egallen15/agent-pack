# agent-pack

A lightweight starter pack for building projects with agents.

agent-pack borrows the working ideas from GSD (Get Shit Done): clear specs,
small executable plans, explicit decisions, and verification, while deliberately
cutting ceremony, commands, and file sprawl.

If GSD feels powerful but heavy, agent-pack aims to feel small, fast, and
obvious.

## Two surfaces, one philosophy

agent-pack has two complementary surfaces:

- Runtime workflow (`/ap:*`): how agents execute work inside a project.
- CLI (`agent-pack` / `agentpack`): how you install, inspect, and refresh packs.

The philosophy is the same in both places: keep durable truth small, plans
executable, decisions explicit, and verification mandatory.

## Core principles

1. Few durable truths
   - Capture what must not drift (vision, constraints, decisions) once, and
     reuse it everywhere.
2. Small plans, small tasks
   - Plans are rolling windows. Tasks are atomic and verifiable.
3. Decisions are first-class
   - If something matters, write it down with a reason. If it might change
     tomorrow, do not lock it.
4. Verification beats completion
   - "Done" means checks pass, not "the agent said it is finished."
5. Lightweight by default
   - Minimal commands. A handful of files. No mandatory swarm behavior.

## Project layout (after `agent-pack add core`)

All agent-pack state lives under `.agent-pack/`, with generated discovery files
in platform directories.

```txt
.
├─ README.md                     # project overview (humans)
├─ AGENTS.md                     # rules of engagement (optional, protected)
│
├─ .agent-pack/
│  ├─ manifest.lock.json
│  ├─ core/
│  │  ├─ README.md               # operator manual
│  │  ├─ AGENTS.md               # template copy
│  │  ├─ context/
│  │  │  ├─ PROJECT.md
│  │  │  ├─ DECISIONS.md
│  │  │  ├─ USERS.md
│  │  │  ├─ SECURITY.md
│  │  │  └─ PROGRESS.md
│  │  ├─ work/
│  │  │  ├─ BACKLOG.md
│  │  │  ├─ PLAN.md
│  │  │  ├─ CHECKS.md
│  │  │  ├─ STATUS.md
│  │  │  └─ LOADOUT.md
│  │  ├─ runs/
│  │  ├─ skills/
│  │  └─ scripts/
│  ├─ modules/<module-id>/...
│  ├─ loadouts/<loadout-id>.json
│  └─ system/
│     ├─ state.json
│     └─ templates/<module-id>/<version>/...
│
├─ .github/prompts/              # generated skill discovery files
├─ .claude/skills/               # generated skill discovery files
├─ .codex/prompts/               # generated skill discovery files (if present)
└─ .vscode/prompts/              # generated skill discovery files (if present)
```

`runs/` can be gitignored (or partially committed) based on how much execution
evidence you want in version control.

## Module authoring blueprint

If you treat modules as fully packaged capabilities (for example: Jira
integration with MCP, auth, context, and repeatable workflows), this structure
works well:

```txt
modules/<module-id>/
├─ manifest.json                # current installer contract (required today)
├─ module.toml                  # richer module contract (optional extension)
├─ README.md                    # quick start + module guarantees
├─ AGENTS.md                    # module-specific operating rules
├─ RUNBOOK.md                   # operator procedures + failure recovery
├─ skills/                      # skills used by this module
├─ context/                     # domain terms, schemas, examples, policies
├─ workflows/                   # executable workflows (sync, triage, update)
├─ prompts/                     # stable templates used by skills/workflows
├─ mcp/                         # MCP server/tool config and auth docs
├─ scripts/                     # setup, validation, and utility scripts
├─ checks/                      # smoke checks for module health
├─ security.md                  # secret handling + least-privilege model
└─ CHANGELOG.md                 # module evolution and compatibility notes
```

### `module.toml` (proposed schema)

This does not replace `manifest.json` yet. Think of it as an authoring/runtime
contract for richer modules.

```toml
schema_version = 1
id = "jira-acme"
name = "Jira (Acme)"
version = "0.1.0"
kind = "integration"
description = "Acme Jira workflows via MCP"
owners = ["platform@acme.com"]
requires = ["core"]
conflicts = []
tags = ["jira", "mcp", "incident"]

[files]
root = "files"

[entrypoints]
init_skill = "skills/ap-jira-init/SKILL.md"
default_workflow = "workflows/sync-open-issues.yaml"
status_check = "checks/smoke.sh"

[mcp]
required = true
servers = ["jira"]
required_tools = [
  "jira.search_issues",
  "jira.get_issue",
  "jira.update_issue",
  "jira.add_comment"
]

[[mcp.server]]
name = "jira"
config_file = "mcp/jira.server.json"
auth_profile = "oauth-acme"

[auth]
method = "oauth2"
scopes = ["read:jira-work", "write:jira-work", "offline_access"]
env_required = ["JIRA_BASE_URL", "JIRA_CLIENT_ID", "JIRA_CLIENT_SECRET"]
token_storage = "os_keychain"
rotation_days = 90

[context]
required_files = [
  "context/PROJECT.md",
  "context/JIRA_FIELDS.md",
  "context/ESCALATION_POLICY.md"
]

[[workflow]]
id = "daily-triage"
file = "workflows/daily-triage.yaml"
description = "Collect new high-priority tickets and post triage summary"
produces = ["runs/daily-triage.md"]

[[workflow]]
id = "status-sync"
file = "workflows/status-sync.yaml"
description = "Sync local status artifacts into Jira comments"
produces = ["runs/status-sync.md"]

[validation]
smoke_checks = [
  "checks/mcp-connectivity.sh",
  "checks/permissions.sh",
  "checks/workflow-dry-run.sh"
]
required_before_use = true

[observability]
run_log_dir = "runs"
audit_fields = ["workflow_id", "ticket_key", "actor", "timestamp", "outcome"]

[support]
runbook = "RUNBOOK.md"
security = "security.md"
changelog = "CHANGELOG.md"
```

### Canonical module kinds (tight model)

Use exactly four `kind` values:

- `workflow` - defines how work is executed (skills, plans, checks, role behavior)
- `integration` - connects external systems (MCP tools, auth, sync/update flows)
- `domain` - encodes business truth (terminology, policies, schemas, constraints)
- `control` - enforces guardrails (security, compliance, quality gates, validation)

Everything else should be a `tag`, not a new `kind`.

Recommended tags:

- `quality`
- `compliance`
- `data`
- `ui`
- `automation`
- `starter`
- `role`
- `platform`

Rule of thumb:

- If it changes compatibility/resolution behavior, it is `kind`.
- If it improves discovery/filtering, it is a `tag`.

Reference examples in this repo:

- `module:example-workflow`
- `module:example-integration`
- `module:example-domain`
- `module:example-control`

### Design notes for integration modules

- Keep `manifest.json` minimal for install/compatibility resolution.
- Put operational complexity in `module.toml` + `mcp/` + `workflows/`.
- Define required MCP tools explicitly so modules fail fast when capabilities are missing.
- Document auth scopes and secret handling in-module, not in tribal memory.
- Ship at least one smoke check that validates auth + MCP connectivity + no-op workflow execution.

## The runtime loop (`/ap:*`)

These are behavioral contracts used by agents during execution:

1. `/ap:init` - ground project truth
2. `/ap:plan` - define a small, executable plan
3. `/ap:do <task-id>` - execute one task
4. `/ap:check` - verify outcomes and add fix tasks if needed

Optional helper:

- `/ap:status` - summarize current state and recommended next action

You can skip steps when appropriate. Skipping verification is usually a smell.

## Core files (mental model)

- `PROJECT.md` -> what are we building, for whom, under which constraints?
- `DECISIONS.md` -> what is locked, and why?
- `USERS.md` -> who matters most, and what signals success?
- `SECURITY.md` -> what risk boundaries and controls must be respected?
- `BACKLOG.md` -> what problems are worth solving next?
- `PLAN.md` -> what is the smallest coherent next slice?
- `CHECKS.md` -> how do we prove it worked?
- `STATUS.md` -> where are we now, and what is next?
- `PROGRESS.md` -> append-only record of completed work and learnings

If something does not fit one of these, it probably does not need a new file.

## CLI

The package ships two equivalent commands:

- `agent-pack`
- `agentpack`

Quick start:

```bash
npx agent-pack list
npx agent-pack add core
```

### CLI commands

```bash
agent-pack add <module-or-loadout>
agent-pack refresh <module-or-loadout> [--scope=context|work|all] [--mode=report|merge|reset]
agent-pack list [--type=all|module|loadout]
agent-pack info <id> [--json]
```

### `add` examples

```bash
agent-pack add core
agent-pack add module:research
agent-pack add loadout:fullstack
```

### `add` flags

- `--agents-md=auto|add|skip|overwrite` (default: `auto`)
- `--force-agents-md` (required for non-interactive overwrite)
- `--force` (only for `.agent-pack/**`)
- `--dry-run`
- `--yes`
- `--no-interactive`
- `--source=official`

### `refresh` examples

```bash
agent-pack refresh core --mode=report
agent-pack refresh core --mode=merge --scope=context
agent-pack refresh loadout:fullstack --mode=reset --scope=all --yes
```

### `refresh` behavior

- `report`: detect drift, no writes
- `merge`: perform clean 3-way merges and write conflict artifacts under
  `.agent-pack/system/conflicts/<timestamp>/...`
- `reset`: back up local files under `.agent-pack/backups/<timestamp>/...` and
  replace with template content

Status labels include:

- `unchanged`
- `customized`
- `new-template`
- `missing-local`
- `conflict-risk`

### AGENTS.md safety

Default behavior never overwrites existing `AGENTS.md`.

To overwrite intentionally:

1. pass `--agents-md=overwrite`
2. and either pass `--force-agents-md` (non-interactive), or confirm in
   interactive mode

### Migration note

Legacy CLI commands (`install`, `sync-skills`) were removed.
Use `add`, `refresh`, `list`, and `info`.

## Agent roles (by role, not swarm)

Typical roles:

- planner -> backlog to executable plan, ambiguity resolution
- researcher -> options analysis with recommendation
- builder -> implements one task
- reviewer -> validates output quality and checks
- scribe -> keeps project memory clean and consistent

The key is not swarm size, but strict output contracts per role.

## Output contracts

Every command and role output should state:

- files updated
- decisions made
- tasks/checks created or changed
- unknowns or required user input

If output does not match its contract, it is incomplete.

## What agent-pack deliberately does not do

- No mandatory phases
- No required agent swarms
- No giant planning trees
- No pretending long-range plans survive reality unchanged

If you want heavier process, GSD is a great fit.
agent-pack is for moving fast without losing your footing.

## Development (this repository)

```bash
npm test
npm run pack:cli
```

Monorepo packages:

- `packages/cli` -> npm package `@agent-pack/cli`
- `packages/packs` -> npm package `@agent-pack/packs`

## Status

agent-pack is intentionally small and evolving. Simplicity is a feature.

The README defines the philosophy and the public surface area.
Everything else should earn its existence.
