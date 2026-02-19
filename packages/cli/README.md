# agent-pack

Agent-Pack CLI for installing and refreshing official packs.

## Install

```sh
npm install -g @agent-pack/cli
```

Or run via npx:

```sh
npx @agent-pack/cli --help
```

## Usage

```sh
agent-pack list
agent-pack info core
agent-pack add core
agent-pack refresh core --scope=all --mode=report
agent-pack clean-empty-dirs --dry-run
```

## Docs

See the repo README for full docs and module authoring guidance:
<https://github.com/egallen15/agent-pack#readme>
