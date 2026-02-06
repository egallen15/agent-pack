#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { syncSkills, DEFAULT_TARGETS } = require("./sync-skills");

function printHelp() {
  console.log("agent-pack\n");
  console.log("Usage:");
  console.log("  agent-pack install [--vscode] [--claude] [--all] [--force] (default)");
  console.log("  agent-pack sync-skills [--vscode] [--claude] [--all] [--source <path>]");
  console.log("");
  console.log("Options:");
  console.log("  --vscode   Sync to .github/skills only");
  console.log("  --claude   Sync to .claude/skills only");
  console.log("  --all      Sync to both .github/skills and .claude/skills (default)");
  console.log("  --source   Source skills directory (default: ./skills)");
  console.log("  --force    Overwrite existing files during install");
}

function parseArgs(argv) {
  const args = [...argv];
  const hasFlag = (flag) => args.includes(flag);
  const command = args.find((arg) => !arg.startsWith("--")) || "install";

  if (hasFlag("--help") || command === "help") {
    return { help: true };
  }

  const sourceIndex = args.indexOf("--source");
  const source =
    sourceIndex >= 0 && args[sourceIndex + 1]
      ? args[sourceIndex + 1]
      : "skills";

  const targets = [];
  if (hasFlag("--vscode")) {
    targets.push(".github/skills");
  }
  if (hasFlag("--claude")) {
    targets.push(".claude/skills");
  }

  return {
    command,
    source,
    targets: targets.length > 0 ? targets : DEFAULT_TARGETS,
    force: hasFlag("--force"),
  };
}

function copyPath(sourcePath, targetPath, { force }) {
  if (fs.existsSync(targetPath)) {
    if (!force) {
      return { skipped: true, targetPath };
    }

    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  const stats = fs.statSync(sourcePath);
  if (stats.isDirectory()) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.cpSync(sourcePath, targetPath, { recursive: true });
  } else {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }

  return { skipped: false, targetPath };
}

function install({ repoRoot, targets, force }) {
  const targetRoot = process.cwd();

  const results = [];
  results.push(
    copyPath(path.join(repoRoot, ".agent-pack"), path.join(targetRoot, ".agent-pack"), {
      force,
    })
  );
  results.push(
    copyPath(path.join(repoRoot, "AGENTS.md.disabled"), path.join(targetRoot, "AGENTS.md"), {
      force,
    })
  );
  results.push(
    copyPath(path.join(repoRoot, "README.md"), path.join(targetRoot, "README.md"), {
      force,
    })
  );

  const skillResult = syncSkills({
    sourceRoot: path.join(repoRoot, "skills"),
    targets,
  });

  return {
    copied: results.filter((result) => !result.skipped).length,
    skipped: results.filter((result) => result.skipped).length,
    skillResult,
  };
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const repoRoot = path.resolve(__dirname, "..");

if (options.command === "install") {
  const result = install({
    repoRoot,
    targets: options.targets,
    force: options.force,
  });

  console.log(
    `Installed ${result.copied} item(s), skipped ${result.skipped}. Synced ${result.skillResult.skillCount} skill(s) to ${result.skillResult.targets.join(", ")}.`
  );
  process.exit(0);
}

if (options.command !== "sync-skills") {
  console.error(`Unknown command: ${options.command}`);
  printHelp();
  process.exit(1);
}

const sourceRoot = path.resolve(repoRoot, options.source);

const result = syncSkills({
  sourceRoot,
  targets: options.targets,
});

console.log(`Synced ${result.skillCount} skill(s) to ${result.targets.join(", ")}.`);
