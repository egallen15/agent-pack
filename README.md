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
