# agent-pack

`agent-pack` is a CLI for installing modular agent capability bundles into any repository.

## CLI names

The package ships two equivalent commands:

- `agent-pack`
- `agentpack`

Examples:

```bash
npx agent-pack list
npx agentpack add loadout:researcher
```

## Commands

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

### `refresh` flags

- `--scope=context|work|all` (default: `all`)
- `--mode=report|merge|reset` (default: `report`)
- `--dry-run`
- `--yes`

## Install output shape

`add` writes into the target repository:

```txt
.agent-pack/
  manifest.lock.json
  core/*
  modules/<module-id>/manifest.json
  modules/<module-id>/*
  loadouts/<loadout-id>.json
AGENTS.md (optional, based on --agents-md mode)
```

For the `core` module, payload files are also materialized into repo root from
`packages/packs/packs/core/files`.
Non-platform files are written under `.agent-pack/core/` for core, and
`.agent-pack/modules/<module-id>/` for other modules. Only platform
directories are written to repo root (`.github/`, `.claude/`, `.codex/`,
`.vscode/`). Existing user files are not overwritten.

For `core`, memory files under `.agent-pack/core/context/*` and
`.agent-pack/core/work/*` are never overwritten by `add`, including
`add --force`. Missing memory files can be created, but existing files are
treated as user-owned state.

`add` also stores versioned snapshots at:

```txt
.agent-pack/system/templates/<module-id>/<version>/*
```

State is tracked in:

```txt
.agent-pack/system/state.json
```

## Refresh behavior

`refresh` compares local memory files with template snapshots:

- `report`: print statuses, no writes
- `merge`: apply clean 3-way merges; write conflict artifacts under
  `.agent-pack/system/conflicts/<timestamp>/...`
- `reset`: backup local files under `.agent-pack/backups/<timestamp>/...` and
  replace with template content

Status labels include:

- `unchanged`
- `customized`
- `new-template`
- `missing-local`
- `conflict-risk`

## AGENTS.md safety

Default behavior never overwrites an existing `AGENTS.md`.

To overwrite:

1. pass `--agents-md=overwrite`
2. and either:
   - pass `--force-agents-md` in non-interactive mode
   - or type `OVERWRITE AGENTS.md` when prompted interactively

## Monorepo layout

```txt
packages/
  cli/    # npm package: agent-pack
  packs/  # npm package: @agentpack/packs
```

## Development

```bash
npm test
npm run pack:cli
```

## Migration note

Legacy commands (`install`, `sync-skills`) were removed from the CLI surface.
Use `add`, `list`, and `info`.
