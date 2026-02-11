const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const CLI_PATH = path.resolve(__dirname, "../dist/index.js");

function runCli(args, { cwd, env } = {}) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    cwd: cwd || fs.mkdtempSync(path.join(os.tmpdir(), "agentpack-cwd-")),
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createCatalog(root, { modules, loadouts }) {
  for (const moduleDef of modules) {
    const base = moduleDef.id === "core"
      ? path.join(root, "core")
      : path.join(root, "modules", moduleDef.id);
    writeJson(path.join(base, "manifest.json"), moduleDef.manifest);
    fs.mkdirSync(path.join(base, "files"), { recursive: true });
    if (moduleDef.files) {
      for (const [name, content] of Object.entries(moduleDef.files)) {
        fs.mkdirSync(path.dirname(path.join(base, "files", name)), { recursive: true });
        fs.writeFileSync(path.join(base, "files", name), content, "utf8");
      }
    }
  }

  for (const loadout of loadouts) {
    writeJson(path.join(root, "loadouts", `${loadout.id}.json`), loadout);
  }
}

function buildCoreCatalog(root, version, files = {}) {
  createCatalog(root, {
    modules: [
      {
        id: "core",
        manifest: {
          schemaVersion: 1,
          id: "core",
          name: "Core",
          version,
          description: "",
          type: "workflow",
          filesDir: "files",
          requires: [],
          conflicts: [],
          agents: {
            supportsAgentsMd: true,
            agentsMdTemplatePath: "files/AGENTS.md",
          },
        },
        files: {
          "AGENTS.md": "# AGENTS\n",
          "context/PROJECT.md": "project-template\n",
          "work/STATUS.md": "status-template\n",
          ...files,
        },
      },
    ],
    loadouts: [],
  });
}

test("list prints modules and loadouts", () => {
  const result = runCli(["list"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Modules:/);
  assert.match(result.stdout, /Loadouts:/);
});

test("add module installs under .agent-pack and writes lock file", () => {
  const cwd = makeTempDir("agentpack-install-");
  const legacyReferencesDir = path.join(cwd, ".agent-pack", "core", "skills", "references");
  fs.mkdirSync(legacyReferencesDir, { recursive: true });
  fs.writeFileSync(path.join(legacyReferencesDir, "legacy.md"), "legacy\n", "utf8");

  const result = runCli(["add", "module:research", "--no-interactive"], { cwd });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "modules", "research", "manifest.json")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "manifest.json")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "manifest.lock.json")), true);
  assert.equal(fs.existsSync(path.join(cwd, "AGENTS.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "README.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "skills", "ap-plan", "SKILL.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "context", "OUTPUT-CONTRACTS.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "context", "PLANNING-RULES.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "skills", "references")), false);
  assert.equal(fs.existsSync(path.join(cwd, ".github", "prompts", "ap-plan.prompt.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "core", "scripts", "sync-skills.js")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "system", "templates", "core", "0.1.0", "context", "PROJECT.md")), true);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "system", "state.json")), true);
  assert.equal(fs.existsSync(path.join(cwd, "skills")), false);
  assert.equal(fs.existsSync(path.join(cwd, "scripts")), false);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "modules", "core")), false);
});

test("dry-run reports actions but does not write files", () => {
  const cwd = makeTempDir("agentpack-dryrun-");
  const result = runCli(["add", "core", "--dry-run", "--no-interactive"], { cwd });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Dry run actions/);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack")), false);
  assert.equal(fs.existsSync(path.join(cwd, "AGENTS.md")), false);
});

test("auto mode does not overwrite AGENTS.md", () => {
  const cwd = makeTempDir("agentpack-agents-auto-");
  const agentsPath = path.join(cwd, "AGENTS.md");
  fs.writeFileSync(agentsPath, "# keep me\n", "utf8");

  const result = runCli(["add", "core", "--agents-md=auto", "--no-interactive"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(agentsPath, "utf8"), "# keep me\n");
});

test("module payload does not overwrite existing root files", () => {
  const cwd = makeTempDir("agentpack-root-skip-");
  const skillsDir = path.join(cwd, ".agent-pack", "core", "skills", "ap-plan");
  fs.mkdirSync(skillsDir, { recursive: true });
  fs.writeFileSync(path.join(skillsDir, "SKILL.md"), "# custom\n", "utf8");

  const result = runCli(["add", "core", "--no-interactive"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(skillsDir, "SKILL.md"), "utf8"), "# custom\n");
});

test("overwrite mode requires force flag when non-interactive", () => {
  const cwd = makeTempDir("agentpack-agents-overwrite-");
  fs.writeFileSync(path.join(cwd, "AGENTS.md"), "# old\n", "utf8");

  const result = runCli(["add", "core", "--agents-md=overwrite", "--no-interactive"], { cwd });
  assert.equal(result.status, 3);
  assert.match(result.stderr, /--force-agents-md/);
});

test("legacy command exits with migration guidance", () => {
  const result = runCli(["install"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Legacy command/);
});

test("resolver fails on missing dependency", () => {
  const cwd = makeTempDir("agentpack-missing-dep-");
  const packsRoot = makeTempDir("agentpack-packs-1-");

  createCatalog(packsRoot, {
    modules: [
      {
        id: "core",
        manifest: {
          schemaVersion: 1,
          id: "core",
          name: "Core",
          version: "0.1.0",
          description: "",
          type: "workflow",
          filesDir: "files",
          requires: [],
          conflicts: [],
        },
      },
      {
        id: "broken",
        manifest: {
          schemaVersion: 1,
          id: "broken",
          name: "Broken",
          version: "0.1.0",
          description: "",
          type: "capability",
          filesDir: "files",
          requires: ["missing"],
          conflicts: [],
        },
      },
    ],
    loadouts: [],
  });

  const result = runCli(["add", "module:broken", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /requires 'missing'/);
});

test("resolver fails on module conflict", () => {
  const cwd = makeTempDir("agentpack-conflict-");
  const packsRoot = makeTempDir("agentpack-packs-2-");

  createCatalog(packsRoot, {
    modules: [
      {
        id: "core",
        manifest: {
          schemaVersion: 1,
          id: "core",
          name: "Core",
          version: "0.1.0",
          description: "",
          type: "workflow",
          filesDir: "files",
          requires: [],
          conflicts: [],
        },
      },
      {
        id: "a",
        manifest: {
          schemaVersion: 1,
          id: "a",
          name: "A",
          version: "0.1.0",
          description: "",
          type: "capability",
          filesDir: "files",
          requires: [],
          conflicts: ["b"],
        },
      },
      {
        id: "b",
        manifest: {
          schemaVersion: 1,
          id: "b",
          name: "B",
          version: "0.1.0",
          description: "",
          type: "capability",
          filesDir: "files",
          requires: [],
          conflicts: [],
        },
      },
    ],
    loadouts: [
      {
        schemaVersion: 1,
        id: "both",
        name: "Both",
        include: ["module:a", "module:b"],
      },
    ],
  });

  const result = runCli(["add", "loadout:both", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Conflict detected/);
});

test("info outputs valid json", () => {
  const result = runCli(["info", "loadout:researcher", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  const data = JSON.parse(result.stdout);
  assert.equal(data.kind, "loadout");
  assert.equal(data.id, "researcher");
});

test("add core preserves memory files even with --force", () => {
  const cwd = makeTempDir("agentpack-memory-preserve-");
  const packsRoot = makeTempDir("agentpack-packs-core-1-");
  buildCoreCatalog(packsRoot, "1.0.0");

  let result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });
  assert.equal(result.status, 0, result.stderr);

  const projectPath = path.join(cwd, ".agent-pack", "core", "context", "PROJECT.md");
  const statusPath = path.join(cwd, ".agent-pack", "core", "work", "STATUS.md");
  fs.writeFileSync(projectPath, "custom-project\n", "utf8");
  fs.writeFileSync(statusPath, "custom-status\n", "utf8");

  const packsRootV2 = makeTempDir("agentpack-packs-core-2-");
  buildCoreCatalog(packsRootV2, "1.1.0", {
    "context/PROJECT.md": "upstream-project\n",
    "work/STATUS.md": "upstream-status\n",
  });

  result = runCli(["add", "core", "--force", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRootV2 },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(projectPath, "utf8"), "custom-project\n");
  assert.equal(fs.readFileSync(statusPath, "utf8"), "custom-status\n");
});

test("refresh report shows statuses without writing files", () => {
  const cwd = makeTempDir("agentpack-refresh-report-");
  const packsRoot = makeTempDir("agentpack-packs-refresh-report-1-");
  buildCoreCatalog(packsRoot, "1.0.0", {
    "context/PROJECT.md": "project-v1\n",
    "work/STATUS.md": "status-v1\n",
  });
  let result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });
  assert.equal(result.status, 0, result.stderr);

  const projectPath = path.join(cwd, ".agent-pack", "core", "context", "PROJECT.md");
  fs.writeFileSync(projectPath, "custom-local\n", "utf8");

  const packsRootV2 = makeTempDir("agentpack-packs-refresh-report-2-");
  buildCoreCatalog(packsRootV2, "1.1.0", {
    "context/PROJECT.md": "project-v2\n",
    "work/STATUS.md": "status-v2\n",
  });
  result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRootV2 },
  });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["refresh", "core", "--mode=report", "--scope=all"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Refresh actions/);
  assert.match(result.stdout, /conflict-risk: \.agent-pack\/core\/context\/PROJECT\.md/);
  assert.equal(fs.readFileSync(projectPath, "utf8"), "custom-local\n");
});

test("refresh removes legacy core skills references directory", () => {
  const cwd = makeTempDir("agentpack-refresh-legacy-cleanup-");
  const packsRoot = makeTempDir("agentpack-packs-refresh-legacy-cleanup-");
  buildCoreCatalog(packsRoot, "1.0.0", {
    "context/PROJECT.md": "project-v1\n",
  });
  let result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });
  assert.equal(result.status, 0, result.stderr);

  const legacyReferencesDir = path.join(cwd, ".agent-pack", "core", "skills", "references");
  fs.mkdirSync(legacyReferencesDir, { recursive: true });
  fs.writeFileSync(path.join(legacyReferencesDir, "legacy.md"), "legacy\n", "utf8");
  assert.equal(fs.existsSync(legacyReferencesDir), true);

  result = runCli(["refresh", "core", "--mode=report", "--scope=context"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(legacyReferencesDir), false);
});

test("refresh merge applies clean updates and avoids conflict artifacts", () => {
  const cwd = makeTempDir("agentpack-refresh-merge-clean-");
  const packsRoot = makeTempDir("agentpack-packs-refresh-merge-1-");
  buildCoreCatalog(packsRoot, "1.0.0", {
    "context/PROJECT.md": "project-v1\n",
    "work/STATUS.md": "status-v1\n",
  });
  let result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });
  assert.equal(result.status, 0, result.stderr);

  const projectPath = path.join(cwd, ".agent-pack", "core", "context", "PROJECT.md");
  const statusPath = path.join(cwd, ".agent-pack", "core", "work", "STATUS.md");
  fs.writeFileSync(projectPath, "project-v1\n", "utf8");
  fs.writeFileSync(statusPath, "custom-status\n", "utf8");

  const packsRootV2 = makeTempDir("agentpack-packs-refresh-merge-2-");
  buildCoreCatalog(packsRootV2, "1.1.0", {
    "context/PROJECT.md": "project-v2\n",
    "work/STATUS.md": "status-v1\n",
  });
  result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRootV2 },
  });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["refresh", "core", "--mode=merge", "--scope=all"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(projectPath, "utf8"), "project-v2\n");
  assert.equal(fs.readFileSync(statusPath, "utf8"), "custom-status\n");
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "system", "conflicts")), false);
});

test("refresh merge writes conflict artifact on incompatible changes", () => {
  const cwd = makeTempDir("agentpack-refresh-merge-conflict-");
  const packsRoot = makeTempDir("agentpack-packs-refresh-conflict-1-");
  buildCoreCatalog(packsRoot, "1.0.0", {
    "context/PROJECT.md": "line1\nline2\n",
  });
  let result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });
  assert.equal(result.status, 0, result.stderr);

  const projectPath = path.join(cwd, ".agent-pack", "core", "context", "PROJECT.md");
  fs.writeFileSync(projectPath, "line1\nlocal-change\n", "utf8");

  const packsRootV2 = makeTempDir("agentpack-packs-refresh-conflict-2-");
  buildCoreCatalog(packsRootV2, "1.1.0", {
    "context/PROJECT.md": "line1\nupstream-change\n",
  });
  result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRootV2 },
  });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["refresh", "core", "--mode=merge", "--scope=context"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(projectPath, "utf8"), "line1\nlocal-change\n");

  const conflictsRoot = path.join(cwd, ".agent-pack", "system", "conflicts");
  assert.equal(fs.existsSync(conflictsRoot), true);
  const timestamps = fs.readdirSync(conflictsRoot);
  assert.equal(timestamps.length > 0, true);
});

test("refresh reset backs up local file then writes template", () => {
  const cwd = makeTempDir("agentpack-refresh-reset-");
  const packsRoot = makeTempDir("agentpack-packs-refresh-reset-1-");
  buildCoreCatalog(packsRoot, "1.0.0", {
    "context/PROJECT.md": "v1\n",
  });
  let result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRoot },
  });
  assert.equal(result.status, 0, result.stderr);

  const projectPath = path.join(cwd, ".agent-pack", "core", "context", "PROJECT.md");
  fs.writeFileSync(projectPath, "local-only\n", "utf8");

  const packsRootV2 = makeTempDir("agentpack-packs-refresh-reset-2-");
  buildCoreCatalog(packsRootV2, "1.1.0", {
    "context/PROJECT.md": "v2\n",
  });
  result = runCli(["add", "core", "--no-interactive"], {
    cwd,
    env: { AGENTPACK_PACKS_ROOT: packsRootV2 },
  });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["refresh", "core", "--mode=reset", "--scope=context", "--yes"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(projectPath, "utf8"), "v2\n");

  const backupsRoot = path.join(cwd, ".agent-pack", "backups");
  assert.equal(fs.existsSync(backupsRoot), true);
  const timestamps = fs.readdirSync(backupsRoot);
  assert.equal(timestamps.length > 0, true);
});

test("refresh initializes system state from lockfile migration path", () => {
  const cwd = makeTempDir("agentpack-refresh-migration-");
  const coreRoot = path.join(cwd, ".agent-pack", "core");
  fs.mkdirSync(coreRoot, { recursive: true });
  writeJson(path.join(coreRoot, "manifest.json"), {
    schemaVersion: 1,
    id: "core",
    version: "9.9.9",
  });
  writeJson(path.join(cwd, ".agent-pack", "manifest.lock.json"), {
    schemaVersion: 1,
    resolved: {
      modules: [
        { id: "core", version: "9.9.9" },
      ],
      loadouts: [],
    },
  });
  fs.mkdirSync(path.join(cwd, ".agent-pack", "core", "context"), { recursive: true });
  fs.writeFileSync(path.join(cwd, ".agent-pack", "core", "context", "PROJECT.md"), "local\n", "utf8");
  fs.mkdirSync(path.join(cwd, ".agent-pack", "system", "templates", "core", "9.9.9", "context"), { recursive: true });
  fs.writeFileSync(path.join(cwd, ".agent-pack", "system", "templates", "core", "9.9.9", "context", "PROJECT.md"), "tpl\n", "utf8");

  const result = runCli(["refresh", "core", "--mode=report", "--scope=context"], { cwd });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.existsSync(path.join(cwd, ".agent-pack", "system", "state.json")), true);
});
