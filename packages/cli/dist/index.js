#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const EXIT_CODES = {
  OK: 0,
  ERROR: 1,
  RESOLVER_ERROR: 2,
  AGENTS_OVERWRITE_ERROR: 3,
};

const BUILTIN_MINIMAL_AGENTS_MD = `# AGENTS.md\n\nThis repository uses Agent-Pack defaults.\n`;
const ROOT_PLATFORM_DIRS = new Set([".claude", ".codex", ".github", ".vscode"]);
const REFRESH_SCOPES = new Set(["all", "context", "work"]);
const REFRESH_MODES = new Set(["report", "merge", "reset"]);

main().catch((error) => {
  console.error(error.message || String(error));
  if (typeof error.code === "number") {
    process.exit(error.code);
  }
  process.exit(EXIT_CODES.ERROR);
});

async function main() {
  const argv = process.argv.slice(2);
  const { command, positionals, flags } = parseArgv(argv);

  if (flags.help || !command) {
    printHelp();
    process.exit(EXIT_CODES.OK);
  }

  if (command === "install" || command === "sync-skills") {
    console.error(
      `Legacy command '${command}' was removed. Use: agent-pack add <module-or-loadout>, agent-pack list, or agent-pack info <id>.`
    );
    process.exit(EXIT_CODES.ERROR);
  }

  if (flags.source && flags.source !== "official") {
    console.error("Only --source=official is supported in v0.");
    process.exit(EXIT_CODES.ERROR);
  }

  const catalog = loadCatalog();

  if (command === "list") {
    runList(catalog, flags);
    return;
  }

  if (command === "info") {
    runInfo(catalog, positionals[0], flags);
    return;
  }

  if (command === "add") {
    const specifier = positionals[0];
    if (!specifier) {
      console.error("Missing target. Usage: agent-pack add <module-or-loadout>");
      process.exit(EXIT_CODES.ERROR);
    }
    const resolved = resolveSelection(catalog, specifier);
    const result = await installSelection(catalog, resolved, flags);

    if (flags.dryRun) {
      console.log("Dry run actions:");
      for (const line of result.actions) {
        console.log(`- ${line}`);
      }
      return;
    }

    console.log(
      `Installed ${result.modulesInstalled} module(s), ${result.loadoutsInstalled} loadout(s). AGENTS.md: ${result.agentsAction}.`
    );
    return;
  }

  if (command === "refresh") {
    const specifier = positionals[0];
    if (!specifier) {
      console.error("Missing target. Usage: agent-pack refresh <module-or-loadout>");
      process.exit(EXIT_CODES.ERROR);
    }
    const resolved = resolveSelection(catalog, specifier);
    const result = refreshSelection(catalog, resolved, flags);
    if (result.actions.length === 0) {
      console.log("No refresh actions.");
      return;
    }
    console.log("Refresh actions:");
    for (const line of result.actions) {
      console.log(`- ${line}`);
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(EXIT_CODES.ERROR);
}

function parseArgv(argv) {
  const flags = {
    help: false,
    dryRun: false,
    yes: false,
    noInteractive: false,
    force: false,
    forceAgentsMd: false,
    agentsMd: "auto",
    source: "official",
    json: false,
    type: "all",
    scope: "all",
    mode: "report",
  };

  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      flags.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      flags.dryRun = true;
      continue;
    }
    if (arg === "--yes") {
      flags.yes = true;
      continue;
    }
    if (arg === "--no-interactive") {
      flags.noInteractive = true;
      continue;
    }
    if (arg === "--force") {
      flags.force = true;
      continue;
    }
    if (arg === "--force-agents-md") {
      flags.forceAgentsMd = true;
      continue;
    }
    if (arg === "--json") {
      flags.json = true;
      continue;
    }

    if (arg.startsWith("--agents-md=")) {
      flags.agentsMd = arg.split("=")[1];
      continue;
    }
    if (arg.startsWith("--source=")) {
      flags.source = arg.split("=")[1];
      continue;
    }
    if (arg.startsWith("--type=")) {
      flags.type = arg.split("=")[1];
      continue;
    }
    if (arg.startsWith("--scope=")) {
      flags.scope = arg.split("=")[1];
      continue;
    }
    if (arg.startsWith("--mode=")) {
      flags.mode = arg.split("=")[1];
      continue;
    }

    if (arg.startsWith("--")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(EXIT_CODES.ERROR);
    }

    positionals.push(arg);
  }

  const command = positionals.shift();

  if (!["auto", "add", "skip", "overwrite"].includes(flags.agentsMd)) {
    console.error("--agents-md must be one of: auto|add|skip|overwrite");
    process.exit(EXIT_CODES.ERROR);
  }

  if (!["all", "module", "loadout"].includes(flags.type)) {
    console.error("--type must be one of: all|module|loadout");
    process.exit(EXIT_CODES.ERROR);
  }

  if (!REFRESH_SCOPES.has(flags.scope)) {
    console.error("--scope must be one of: context|work|all");
    process.exit(EXIT_CODES.ERROR);
  }

  if (!REFRESH_MODES.has(flags.mode)) {
    console.error("--mode must be one of: report|merge|reset");
    process.exit(EXIT_CODES.ERROR);
  }

  return { command, positionals, flags };
}

function printHelp() {
  console.log("agent-pack (alias: agentpack)\n");
  console.log("Usage:");
  console.log("  agent-pack add <module-or-loadout> [flags]");
  console.log("  agent-pack refresh <module-or-loadout> [flags]");
  console.log("  agent-pack list [--type=all|module|loadout]");
  console.log("  agent-pack info <id> [--json]");
  console.log("");
  console.log("Examples:");
  console.log("  npx agent-pack add core");
  console.log("  npx agent-pack add module:research");
  console.log("  npx agent-pack add loadout:researcher");
  console.log("  npx agent-pack refresh core --mode=report");
  console.log("  npx agentpack list");
  console.log("");
  console.log("Flags:");
  console.log("  --agents-md=auto|add|skip|overwrite");
  console.log("  --force-agents-md");
  console.log("  --force");
  console.log("  --dry-run");
  console.log("  --yes");
  console.log("  --no-interactive");
  console.log("  --source=official");
  console.log("  --scope=context|work|all");
  console.log("  --mode=report|merge|reset");
}

function loadCatalog() {
  const packsRoot = resolvePacksRoot();
  const modules = new Map();
  const loadouts = new Map();

  const coreDir = path.join(packsRoot, "core");
  if (fs.existsSync(coreDir)) {
    const coreManifest = readJson(path.join(coreDir, "manifest.json"));
    modules.set(coreManifest.id, {
      manifest: coreManifest,
      rootDir: coreDir,
      kind: "core",
    });
  }

  const modulesDir = path.join(packsRoot, "modules");
  if (fs.existsSync(modulesDir)) {
    for (const entry of fs.readdirSync(modulesDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const moduleRoot = path.join(modulesDir, entry.name);
      const manifestPath = path.join(moduleRoot, "manifest.json");
      if (!fs.existsSync(manifestPath)) {
        continue;
      }
      const manifest = readJson(manifestPath);
      modules.set(manifest.id, { manifest, rootDir: moduleRoot, kind: "module" });
    }
  }

  const loadoutsDir = path.join(packsRoot, "loadouts");
  if (fs.existsSync(loadoutsDir)) {
    for (const entry of fs.readdirSync(loadoutsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }
      const filePath = path.join(loadoutsDir, entry.name);
      const loadout = readJson(filePath);
      loadouts.set(loadout.id, {
        loadout,
        filePath,
      });
    }
  }

  return { modules, loadouts, packsRoot };
}

function resolvePacksRoot() {
  if (process.env.AGENTPACK_PACKS_ROOT) {
    return path.resolve(process.env.AGENTPACK_PACKS_ROOT);
  }
  try {
    const pkgPath = require.resolve("@agentpack/packs/package.json", {
      paths: [process.cwd(), __dirname],
    });
    return path.join(path.dirname(pkgPath), "packs");
  } catch (error) {
    return path.resolve(__dirname, "../../packs/packs");
  }
}

function runList(catalog, flags) {
  const modules = Array.from(catalog.modules.values())
    .map((entry) => entry.manifest)
    .sort((a, b) => a.id.localeCompare(b.id));
  const loadouts = Array.from(catalog.loadouts.values())
    .map((entry) => entry.loadout)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (flags.json) {
    const out = {
      modules: flags.type === "loadout" ? [] : modules,
      loadouts: flags.type === "module" ? [] : loadouts,
    };
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  if (flags.type !== "loadout") {
    console.log("Modules:");
    for (const mod of modules) {
      console.log(`- ${mod.id} (${mod.version}) - ${mod.name}`);
    }
  }

  if (flags.type !== "module") {
    console.log("Loadouts:");
    for (const loadout of loadouts) {
      console.log(`- ${loadout.id} - ${loadout.name}`);
    }
  }
}

function runInfo(catalog, rawId, flags) {
  if (!rawId) {
    console.error("Missing id. Usage: agent-pack info <id>");
    process.exit(EXIT_CODES.ERROR);
  }

  const spec = parseSpecifier(rawId);
  let payload = null;

  if (spec.kind === "loadout") {
    const entry = catalog.loadouts.get(spec.id);
    if (!entry) {
      console.error(`Unknown loadout: ${spec.id}`);
      process.exit(EXIT_CODES.ERROR);
    }
    payload = { kind: "loadout", ...entry.loadout };
  } else if (spec.kind === "module") {
    const entry = catalog.modules.get(spec.id);
    if (!entry) {
      console.error(`Unknown module: ${spec.id}`);
      process.exit(EXIT_CODES.ERROR);
    }
    payload = { kind: entry.kind, ...entry.manifest };
  }

  if (flags.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`${payload.kind}: ${payload.id}`);
  for (const [key, value] of Object.entries(payload)) {
    if (key === "kind" || key === "id") {
      continue;
    }
    console.log(`${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
  }
}

function parseSpecifier(value) {
  if (value.startsWith("module:")) {
    return { kind: "module", id: value.slice("module:".length) };
  }
  if (value.startsWith("loadout:")) {
    return { kind: "loadout", id: value.slice("loadout:".length) };
  }
  if (value === "core") {
    return { kind: "module", id: value };
  }
  return { kind: "module", id: value };
}

function resolveSelection(catalog, rawSpecifier) {
  const moduleIds = new Set();
  const loadoutIds = new Set();
  const pendingModules = [];
  const pendingLoadouts = [];

  const addSpecifier = (specifier) => {
    if (specifier.kind === "module") {
      pendingModules.push(specifier.id);
      return;
    }
    pendingLoadouts.push(specifier.id);
  };

  addSpecifier(parseSpecifier(rawSpecifier));

  while (pendingLoadouts.length > 0) {
    const loadoutId = pendingLoadouts.shift();
    if (loadoutIds.has(loadoutId)) {
      continue;
    }
    const loadoutEntry = catalog.loadouts.get(loadoutId);
    if (!loadoutEntry) {
      const error = new Error(`Loadout not found: ${loadoutId}`);
      error.code = EXIT_CODES.RESOLVER_ERROR;
      throw error;
    }

    loadoutIds.add(loadoutId);

    for (const includeItem of loadoutEntry.loadout.include || []) {
      addSpecifier(parseSpecifier(includeItem));
    }
  }

  while (pendingModules.length > 0) {
    const moduleId = pendingModules.shift();
    if (moduleIds.has(moduleId)) {
      continue;
    }

    const moduleEntry = catalog.modules.get(moduleId);
    if (!moduleEntry) {
      const error = new Error(`Module not found: ${moduleId}`);
      error.code = EXIT_CODES.RESOLVER_ERROR;
      throw error;
    }

    moduleIds.add(moduleId);

    for (const required of moduleEntry.manifest.requires || []) {
      if (!catalog.modules.has(required)) {
        const error = new Error(
          `Module '${moduleId}' requires '${required}', but '${required}' was not found in catalog.`
        );
        error.code = EXIT_CODES.RESOLVER_ERROR;
        throw error;
      }
      pendingModules.push(required);
    }
  }

  for (const moduleId of moduleIds) {
    const moduleEntry = catalog.modules.get(moduleId);
    for (const conflicting of moduleEntry.manifest.conflicts || []) {
      if (moduleIds.has(conflicting)) {
        const error = new Error(
          `Conflict detected: module '${moduleId}' conflicts with '${conflicting}'.`
        );
        error.code = EXIT_CODES.RESOLVER_ERROR;
        throw error;
      }
    }
  }

  const resolvedModules = Array.from(moduleIds)
    .map((id) => catalog.modules.get(id))
    .sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));

  const resolvedLoadouts = Array.from(loadoutIds)
    .map((id) => catalog.loadouts.get(id))
    .sort((a, b) => a.loadout.id.localeCompare(b.loadout.id));

  return {
    modules: resolvedModules,
    loadouts: resolvedLoadouts,
    requested: rawSpecifier,
  };
}

async function installSelection(catalog, selection, flags) {
  const cwd = process.cwd();
  const actions = [];
  const filesWritten = [];

  const agentpackRoot = path.join(cwd, ".agent-pack");
  const coreRoot = path.join(agentpackRoot, "core");
  const modulesRoot = path.join(agentpackRoot, "modules");
  const loadoutsRoot = path.join(agentpackRoot, "loadouts");
  const moduleInstallRoots = new Map();

  if (!flags.dryRun) {
    fs.mkdirSync(coreRoot, { recursive: true });
    fs.mkdirSync(modulesRoot, { recursive: true });
    fs.mkdirSync(loadoutsRoot, { recursive: true });
  }

  let modulesInstalled = 0;
  let loadoutsInstalled = 0;

  for (const moduleEntry of selection.modules) {
    const moduleDir = getModuleInstallRoot({
      agentpackRoot,
      modulesRoot,
      moduleId: moduleEntry.manifest.id,
    });
    moduleInstallRoots.set(moduleEntry.manifest.id, moduleDir);
    const moduleManifestPath = path.join(moduleDir, "manifest.json");

    writeIfAllowed({
      flags,
      sourcePath: path.join(moduleEntry.rootDir, "manifest.json"),
      targetPath: moduleManifestPath,
      actions,
      filesWritten,
      force: flags.force,
    });

    const sourceFilesDir = path.join(moduleEntry.rootDir, moduleEntry.manifest.filesDir || "files");
    if (fs.existsSync(sourceFilesDir)) {
      materializeModuleFiles({
        flags,
        sourceDir: sourceFilesDir,
        moduleId: moduleEntry.manifest.id,
        moduleDir,
        destinationRoot: cwd,
        actions,
        filesWritten,
      });
      captureTemplateSnapshot({
        flags,
        sourceDir: sourceFilesDir,
        moduleId: moduleEntry.manifest.id,
        moduleVersion: moduleEntry.manifest.version,
        cwd,
        actions,
        filesWritten,
      });
    }

    modulesInstalled += 1;
  }

  for (const loadoutEntry of selection.loadouts) {
    const outPath = path.join(loadoutsRoot, `${loadoutEntry.loadout.id}.json`);
    writeIfAllowed({
      flags,
      sourcePath: loadoutEntry.filePath,
      targetPath: outPath,
      actions,
      filesWritten,
      force: flags.force,
    });
    loadoutsInstalled += 1;
  }

  const agentsResult = await handleAgentsMd({
    catalog,
    selection,
    flags,
    cwd,
    actions,
    filesWritten,
  });

  const lock = {
    schemaVersion: 1,
    tool: {
      name: "agent-pack",
      version: resolveCliVersion(),
    },
    source: flags.source || "official",
    installedAt: new Date().toISOString(),
    resolved: {
      modules: selection.modules.map((entry) => ({
        id: entry.manifest.id,
        version: entry.manifest.version,
        path: toPosix(path.relative(cwd, moduleInstallRoots.get(entry.manifest.id))),
      })),
      loadouts: selection.loadouts.map((entry) => ({
        id: entry.loadout.id,
        path: toPosix(path.relative(cwd, path.join(loadoutsRoot, `${entry.loadout.id}.json`))),
      })),
    },
    filesWritten: filesWritten.slice().sort(),
    agentsMd: agentsResult,
  };

  writeIfAllowed({
    flags,
    sourcePath: null,
    targetPath: path.join(agentpackRoot, "manifest.lock.json"),
    content: `${stableStringify(lock)}\n`,
    actions,
    filesWritten,
    force: true,
  });

  cleanupLegacyCoreReferencesDir({
    cwd,
    flags,
    actions,
    filesWritten,
  });

  updateSystemStateForInstall({
    cwd,
    selection,
    flags,
    actions,
    filesWritten,
  });

  return {
    actions,
    modulesInstalled,
    loadoutsInstalled,
    agentsAction: agentsResult.action,
  };
}

function materializeModuleFiles({
  flags,
  sourceDir,
  moduleId,
  moduleDir,
  destinationRoot,
  actions,
  filesWritten,
}) {
  copyTreeToRoot({
    flags,
    sourceRoot: sourceDir,
    currentSourceDir: sourceDir,
    moduleId,
    moduleDir,
    destinationRoot,
    actions,
    filesWritten,
  });
}

function copyTreeToRoot({
  flags,
  sourceRoot,
  currentSourceDir,
  moduleId,
  moduleDir,
  destinationRoot,
  actions,
  filesWritten,
}) {
  const entries = fs.readdirSync(currentSourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(currentSourceDir, entry.name);
    const relativePath = toPosix(path.relative(sourceRoot, sourcePath));
    const pathParts = relativePath.split("/");
    const firstPart = pathParts[0];

    if (relativePath === "AGENTS.md") {
      continue;
    }

    const targetPath = resolveMaterializedTargetPath({
      destinationRoot,
      relativePath,
      firstPart,
      moduleId,
      moduleDir,
    });
    if (entry.isDirectory()) {
      copyTreeToRoot({
        flags,
        sourceRoot,
        currentSourceDir: sourcePath,
        moduleId,
        moduleDir,
        destinationRoot,
        actions,
        filesWritten,
      });
      continue;
    }

    const targetExists = fs.existsSync(targetPath);
    const isMemoryFile = isCoreMemoryRelativePath(relativePath) && moduleId === "core";
    const canOverwrite = targetExists && flags.force && isManagedAgentPackPath(destinationRoot, targetPath) && !isMemoryFile;

    if (targetExists && !canOverwrite) {
      actions.push(`skip existing: ${toPosix(path.relative(process.cwd(), targetPath))}`);
      continue;
    }

    if (flags.dryRun) {
      actions.push(`${targetExists ? "overwrite" : "write"}: ${toPosix(path.relative(process.cwd(), targetPath))}`);
      continue;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    const relativeTarget = toPosix(path.relative(process.cwd(), targetPath));
    filesWritten.push(relativeTarget);
    actions.push(`wrote: ${relativeTarget}`);
  }
}

function resolveMaterializedTargetPath({ destinationRoot, relativePath, firstPart, moduleDir }) {
  if (ROOT_PLATFORM_DIRS.has(firstPart)) {
    return path.join(destinationRoot, relativePath);
  }
  const normalizedRelative = relativePath.startsWith(".agent-pack/")
    ? relativePath.slice(".agent-pack/".length)
    : relativePath;
  return path.join(moduleDir, normalizedRelative);
}

function getModuleInstallRoot({ agentpackRoot, modulesRoot, moduleId }) {
  if (moduleId === "core") {
    return path.join(agentpackRoot, "core");
  }
  return path.join(modulesRoot, moduleId);
}

function isManagedAgentPackPath(destinationRoot, targetPath) {
  const managedRoot = path.join(destinationRoot, ".agent-pack");
  return targetPath === managedRoot || targetPath.startsWith(`${managedRoot}${path.sep}`);
}

function writeIfAllowed({ flags, sourcePath, targetPath, content, actions, filesWritten, force }) {
  const exists = fs.existsSync(targetPath);

  if (exists && !force) {
    actions.push(`skip existing: ${toPosix(path.relative(process.cwd(), targetPath))}`);
    return;
  }

  if (flags.dryRun) {
    actions.push(`${exists ? "overwrite" : "write"}: ${toPosix(path.relative(process.cwd(), targetPath))}`);
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (sourcePath) {
    fs.copyFileSync(sourcePath, targetPath);
  } else {
    fs.writeFileSync(targetPath, content, "utf8");
  }

  actions.push(`${exists ? "overwrote" : "wrote"}: ${toPosix(path.relative(process.cwd(), targetPath))}`);
  filesWritten.push(toPosix(path.relative(process.cwd(), targetPath)));
}

async function handleAgentsMd({ catalog, selection, flags, cwd, actions, filesWritten }) {
  const targetPath = path.join(cwd, "AGENTS.md");
  const exists = fs.existsSync(targetPath);

  if (flags.agentsMd === "skip") {
    actions.push("skip AGENTS.md (--agents-md=skip)");
    return { action: "skipped", source: "none" };
  }

  if ((flags.agentsMd === "auto" || flags.agentsMd === "add") && exists) {
    actions.push("skip AGENTS.md (already exists)");
    return { action: "skipped", source: "existing" };
  }

  if (flags.agentsMd === "overwrite") {
    await assertOverwriteConfirmed(flags);
  }

  const template = selectAgentsTemplate(catalog, selection);
  const source = template.source;

  if (flags.dryRun) {
    actions.push(`${exists ? "overwrite" : "write"}: AGENTS.md from ${source}`);
    return { action: exists ? "overwritten" : "added", source };
  }

  fs.writeFileSync(targetPath, template.content, "utf8");
  filesWritten.push("AGENTS.md");
  actions.push(`${exists ? "overwrote" : "wrote"}: AGENTS.md from ${source}`);

  return { action: exists ? "overwritten" : "added", source };
}

async function assertOverwriteConfirmed(flags) {
  const interactive = process.stdin.isTTY && !flags.noInteractive && !flags.yes;

  if (!interactive) {
    if (!flags.forceAgentsMd) {
      const error = new Error(
        "Overwriting AGENTS.md requires --force-agents-md when running non-interactively."
      );
      error.code = EXIT_CODES.AGENTS_OVERWRITE_ERROR;
      throw error;
    }
    return;
  }

  if (flags.forceAgentsMd) {
    return;
  }

  const prompt =
    "Type OVERWRITE AGENTS.md to confirm replacing the existing AGENTS.md: ";
  const phrase = await promptLine(prompt);

  if (phrase.trim() !== "OVERWRITE AGENTS.md") {
    const error = new Error("AGENTS.md overwrite not confirmed.");
    error.code = EXIT_CODES.AGENTS_OVERWRITE_ERROR;
    throw error;
  }
}

function selectAgentsTemplate(catalog, selection) {
  for (const loadoutEntry of selection.loadouts) {
    if (loadoutEntry.loadout.agents && loadoutEntry.loadout.agents.agentsMdTemplate) {
      return {
        content: `${loadoutEntry.loadout.agents.agentsMdTemplate.trim()}\n`,
        source: `loadout:${loadoutEntry.loadout.id}`,
      };
    }
  }

  const coreEntry = selection.modules.find((entry) => entry.manifest.id === "core") || catalog.modules.get("core");
  if (coreEntry && coreEntry.manifest.agents && coreEntry.manifest.agents.agentsMdTemplatePath) {
    const p = path.join(coreEntry.rootDir, coreEntry.manifest.agents.agentsMdTemplatePath.replace(/^files\//, "files/"));
    if (fs.existsSync(p)) {
      return { content: fs.readFileSync(p, "utf8"), source: "module:core" };
    }
  }

  return { content: BUILTIN_MINIMAL_AGENTS_MD, source: "builtin:minimal" };
}

function refreshSelection(catalog, selection, flags) {
  const cwd = process.cwd();
  const actions = [];
  const filesWritten = [];
  const state = loadSystemState(cwd);
  const timestamp = formatTimestamp();

  for (const moduleEntry of selection.modules) {
    const moduleId = moduleEntry.manifest.id;
    if (moduleId !== "core") {
      actions.push(`skip module:${moduleId} (no refreshable memory files)`);
      continue;
    }

    const moduleState = ensureModuleState(state, moduleId);
    const installedVersion = moduleState.installedVersion || moduleEntry.manifest.version;
    const nextVersion = moduleState.latestSnapshotVersion || installedVersion;
    const baseVersion = moduleState.lastBaseVersion || null;

    const nextSnapshotDir = getSnapshotDir(cwd, moduleId, nextVersion);
    if (!fs.existsSync(nextSnapshotDir)) {
      actions.push(`skip module:${moduleId} (missing snapshot for ${nextVersion})`);
      continue;
    }

    const baseSnapshotDir = baseVersion ? getSnapshotDir(cwd, moduleId, baseVersion) : null;
    const hasBaseSnapshot = baseSnapshotDir ? fs.existsSync(baseSnapshotDir) : false;

    const relativeFiles = collectCoreMemoryTemplateFiles(nextSnapshotDir, flags.scope);
    if (relativeFiles.length === 0) {
      actions.push(`skip module:${moduleId} (no files in scope '${flags.scope}')`);
      continue;
    }

    let hadConflicts = false;

    for (const relativeFile of relativeFiles) {
      const nextPath = path.join(nextSnapshotDir, relativeFile);
      const localPath = path.join(cwd, ".agent-pack", "core", relativeFile);
      const localExists = fs.existsSync(localPath);
      const nextText = fs.readFileSync(nextPath, "utf8");

      if (!localExists) {
        actions.push(`missing-local: ${toPosix(path.join(".agent-pack", "core", relativeFile))}`);
        if (flags.mode === "reset" && !flags.dryRun) {
          fs.mkdirSync(path.dirname(localPath), { recursive: true });
          fs.writeFileSync(localPath, nextText, "utf8");
          filesWritten.push(toPosix(path.relative(cwd, localPath)));
          actions.push(`wrote: ${toPosix(path.relative(cwd, localPath))}`);
        }
        continue;
      }

      const localText = fs.readFileSync(localPath, "utf8");
      const basePath = hasBaseSnapshot ? path.join(baseSnapshotDir, relativeFile) : null;
      const baseExists = basePath ? fs.existsSync(basePath) : false;
      const baseText = baseExists ? fs.readFileSync(basePath, "utf8") : null;

      const status = classifyRefreshStatus({ localText, nextText, baseText, hasBase: baseExists });
      actions.push(`${status}: ${toPosix(path.join(".agent-pack", "core", relativeFile))}`);

      if (flags.mode === "report") {
        continue;
      }

      if (flags.mode === "reset") {
        const backupPath = path.join(cwd, ".agent-pack", "backups", timestamp, ".agent-pack", "core", relativeFile);
        if (!flags.dryRun) {
          fs.mkdirSync(path.dirname(backupPath), { recursive: true });
          fs.writeFileSync(backupPath, localText, "utf8");
          filesWritten.push(toPosix(path.relative(cwd, backupPath)));
          fs.writeFileSync(localPath, nextText, "utf8");
          filesWritten.push(toPosix(path.relative(cwd, localPath)));
        }
        actions.push(`backup: ${toPosix(path.relative(cwd, backupPath))}`);
        actions.push(`${flags.dryRun ? "would reset" : "reset"}: ${toPosix(path.relative(cwd, localPath))}`);
        continue;
      }

      if (!baseExists) {
        hadConflicts = true;
        const conflictPath = writeConflictArtifact({
          cwd,
          timestamp,
          relativeFile,
          localText,
          nextText,
          baseText: null,
          dryRun: flags.dryRun,
          filesWritten,
        });
        actions.push(`conflict-risk: ${toPosix(path.relative(cwd, conflictPath))}`);
        continue;
      }

      const merged = threeWayMergeText(baseText, localText, nextText);
      if (!merged.clean) {
        hadConflicts = true;
        const conflictPath = writeConflictArtifact({
          cwd,
          timestamp,
          relativeFile,
          localText,
          nextText,
          baseText,
          dryRun: flags.dryRun,
          filesWritten,
        });
        actions.push(`conflict-risk: ${toPosix(path.relative(cwd, conflictPath))}`);
        continue;
      }

      if (merged.output !== localText) {
        if (!flags.dryRun) {
          fs.writeFileSync(localPath, merged.output, "utf8");
          filesWritten.push(toPosix(path.relative(cwd, localPath)));
        }
        actions.push(`${flags.dryRun ? "would merge" : "merged"}: ${toPosix(path.relative(cwd, localPath))}`);
      }
    }

    const shouldAdvanceBase = flags.mode === "reset" || (flags.mode === "merge" && !hadConflicts);
    if (shouldAdvanceBase) {
      moduleState.lastBaseVersion = nextVersion;
    }

    moduleState.lastRefreshedAt = new Date().toISOString();
    moduleState.lastRefreshResult = {
      mode: flags.mode,
      scope: flags.scope,
      status: hadConflicts ? "conflicts" : "ok",
    };
  }

  cleanupLegacyCoreReferencesDir({
    cwd,
    flags,
    actions,
    filesWritten,
  });

  if (!flags.dryRun) {
    writeSystemState(cwd, state, actions, filesWritten);
  }

  return { actions, filesWritten };
}

function classifyRefreshStatus({ localText, nextText, baseText, hasBase }) {
  if (localText === nextText) {
    return "unchanged";
  }
  if (!hasBase) {
    return "conflict-risk";
  }
  if (localText === baseText && nextText !== baseText) {
    return "new-template";
  }
  if (nextText === baseText && localText !== baseText) {
    return "customized";
  }
  return "conflict-risk";
}

function writeConflictArtifact({ cwd, timestamp, relativeFile, localText, nextText, baseText, dryRun, filesWritten }) {
  const target = path.join(cwd, ".agent-pack", "system", "conflicts", timestamp, `${relativeFile}.patch`);
  const body = [
    "# agent-pack refresh conflict artifact",
    `# file: .agent-pack/core/${relativeFile}`,
    "",
    "## BASE",
    baseText == null ? "<none>" : baseText,
    "## LOCAL",
    localText,
    "## NEXT",
    nextText,
    "",
  ].join("\n");

  if (!dryRun) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body, "utf8");
    filesWritten.push(toPosix(path.relative(cwd, target)));
  }

  return target;
}

function threeWayMergeText(baseText, localText, nextText) {
  if (localText === nextText) {
    return { clean: true, output: localText };
  }
  if (localText === baseText) {
    return { clean: true, output: nextText };
  }
  if (nextText === baseText) {
    return { clean: true, output: localText };
  }

  const base = splitLines(baseText);
  const local = splitLines(localText);
  const next = splitLines(nextText);
  const out = [];
  const max = Math.max(base.lines.length, local.lines.length, next.lines.length);

  for (let i = 0; i < max; i += 1) {
    const b = lineAt(base.lines, i);
    const l = lineAt(local.lines, i);
    const n = lineAt(next.lines, i);

    if (l === n) {
      if (l != null) out.push(l);
      continue;
    }
    if (l === b) {
      if (n != null) out.push(n);
      continue;
    }
    if (n === b) {
      if (l != null) out.push(l);
      continue;
    }
    return { clean: false, output: localText };
  }

  const newline = local.hasFinalNewline || next.hasFinalNewline || base.hasFinalNewline;
  return { clean: true, output: `${out.join("\n")}${newline ? "\n" : ""}` };
}

function splitLines(value) {
  const normalized = value.replace(/\r\n/g, "\n");
  const hasFinalNewline = normalized.endsWith("\n");
  const lines = normalized.split("\n");
  if (hasFinalNewline) {
    lines.pop();
  }
  return { lines, hasFinalNewline };
}

function lineAt(lines, index) {
  if (index < 0 || index >= lines.length) {
    return null;
  }
  return lines[index];
}

function collectCoreMemoryTemplateFiles(snapshotDir, scope) {
  const roots = scope === "all" ? ["context", "work"] : [scope];
  const files = [];
  for (const root of roots) {
    const rootDir = path.join(snapshotDir, root);
    if (!fs.existsSync(rootDir)) {
      continue;
    }
    walkFiles(rootDir, (filePath) => {
      files.push(toPosix(path.relative(snapshotDir, filePath)));
    });
  }
  files.sort();
  return files;
}

function walkFiles(rootDir, onFile) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const nextPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(nextPath, onFile);
      continue;
    }
    if (entry.isFile()) {
      onFile(nextPath);
    }
  }
}

function isCoreMemoryRelativePath(relativePath) {
  return relativePath.startsWith("context/") || relativePath.startsWith("work/");
}

function captureTemplateSnapshot({ flags, sourceDir, moduleId, moduleVersion, cwd, actions, filesWritten }) {
  const targetDir = getSnapshotDir(cwd, moduleId, moduleVersion);
  if (flags.dryRun) {
    actions.push(`snapshot: ${toPosix(path.relative(cwd, targetDir))}`);
    return;
  }
  removeDirIfExists(targetDir);
  copyDirRecursive(sourceDir, targetDir);
  filesWritten.push(toPosix(path.relative(cwd, targetDir)));
  actions.push(`snapshot updated: ${toPosix(path.relative(cwd, targetDir))}`);
}

function copyDirRecursive(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(sourcePath, targetPath);
      continue;
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function removeDirIfExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function cleanupLegacyCoreReferencesDir({ cwd, flags, actions, filesWritten }) {
  const legacyDir = path.join(cwd, ".agent-pack", "core", "skills", "references");
  if (!fs.existsSync(legacyDir)) {
    return;
  }

  const relativePath = toPosix(path.relative(cwd, legacyDir));
  if (flags.dryRun) {
    actions.push(`remove legacy dir: ${relativePath}`);
    return;
  }

  fs.rmSync(legacyDir, { recursive: true, force: true });
  actions.push(`removed legacy dir: ${relativePath}`);
  filesWritten.push(relativePath);
}

function getSnapshotDir(cwd, moduleId, version) {
  return path.join(cwd, ".agent-pack", "system", "templates", moduleId, version || "unknown");
}

function updateSystemStateForInstall({ cwd, selection, flags, actions, filesWritten }) {
  const state = loadSystemState(cwd);
  for (const moduleEntry of selection.modules) {
    const moduleId = moduleEntry.manifest.id;
    const moduleVersion = moduleEntry.manifest.version;
    const moduleState = ensureModuleState(state, moduleId);
    moduleState.installedVersion = moduleVersion;
    moduleState.latestSnapshotVersion = moduleVersion;
    if (!moduleState.lastBaseVersion) {
      moduleState.lastBaseVersion = moduleVersion;
    }
  }

  if (!flags.dryRun) {
    writeSystemState(cwd, state, actions, filesWritten);
  }
}

function ensureModuleState(state, moduleId) {
  if (!state.modules[moduleId]) {
    state.modules[moduleId] = {
      installedVersion: null,
      latestSnapshotVersion: null,
      lastBaseVersion: null,
      lastRefreshedAt: null,
      lastRefreshResult: null,
    };
  }
  return state.modules[moduleId];
}

function loadSystemState(cwd) {
  const statePath = path.join(cwd, ".agent-pack", "system", "state.json");
  if (fs.existsSync(statePath)) {
    const state = readJson(statePath);
    if (!state.modules || typeof state.modules !== "object") {
      state.modules = {};
    }
    return state;
  }

  const migrated = {
    schemaVersion: 1,
    modules: {},
  };

  const lockPath = path.join(cwd, ".agent-pack", "manifest.lock.json");
  if (fs.existsSync(lockPath)) {
    const lock = readJson(lockPath);
    for (const mod of lock.resolved && Array.isArray(lock.resolved.modules) ? lock.resolved.modules : []) {
      migrated.modules[mod.id] = {
        installedVersion: mod.version || null,
        latestSnapshotVersion: mod.version || null,
        lastBaseVersion: inferBaseVersion(cwd, mod.id, mod.version || null),
        lastRefreshedAt: null,
        lastRefreshResult: null,
      };
    }
  }

  const discovered = discoverInstalledModules(cwd);
  for (const [moduleId, version] of discovered.entries()) {
    if (!migrated.modules[moduleId]) {
      migrated.modules[moduleId] = {
        installedVersion: version,
        latestSnapshotVersion: version,
        lastBaseVersion: inferBaseVersion(cwd, moduleId, version),
        lastRefreshedAt: null,
        lastRefreshResult: null,
      };
      continue;
    }
    if (!migrated.modules[moduleId].installedVersion) {
      migrated.modules[moduleId].installedVersion = version;
    }
    if (!migrated.modules[moduleId].latestSnapshotVersion) {
      migrated.modules[moduleId].latestSnapshotVersion = version;
    }
    if (!migrated.modules[moduleId].lastBaseVersion) {
      migrated.modules[moduleId].lastBaseVersion = inferBaseVersion(cwd, moduleId, version);
    }
  }

  return migrated;
}

function inferBaseVersion(cwd, moduleId, version) {
  if (!version) {
    return null;
  }
  const snapshotDir = getSnapshotDir(cwd, moduleId, version);
  return fs.existsSync(snapshotDir) ? version : null;
}

function discoverInstalledModules(cwd) {
  const out = new Map();
  const coreManifestPath = path.join(cwd, ".agent-pack", "core", "manifest.json");
  if (fs.existsSync(coreManifestPath)) {
    const core = readJson(coreManifestPath);
    out.set(core.id, core.version || null);
  }

  const modulesRoot = path.join(cwd, ".agent-pack", "modules");
  if (fs.existsSync(modulesRoot)) {
    for (const entry of fs.readdirSync(modulesRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const manifestPath = path.join(modulesRoot, entry.name, "manifest.json");
      if (!fs.existsSync(manifestPath)) {
        continue;
      }
      const manifest = readJson(manifestPath);
      out.set(manifest.id, manifest.version || null);
    }
  }

  return out;
}

function writeSystemState(cwd, state, actions, filesWritten) {
  const statePath = path.join(cwd, ".agent-pack", "system", "state.json");
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, `${stableStringify(state)}\n`, "utf8");
  const rel = toPosix(path.relative(cwd, statePath));
  actions.push(`wrote: ${rel}`);
  filesWritten.push(rel);
}

function formatTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function promptLine(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function resolveCliVersion() {
  try {
    const pkgPath = path.resolve(__dirname, "../package.json");
    return readJson(pkgPath).version;
  } catch (error) {
    return "0.0.0";
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableStringify(value) {
  return JSON.stringify(sortKeys(value), null, 2);
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeys(value[key]);
    }
    return sorted;
  }
  return value;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}
