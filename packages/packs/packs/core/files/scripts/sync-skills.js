const fs = require("fs");
const path = require("path");

const DEFAULT_TARGETS = [".github/skills", ".claude/skills", ".codex/skills"];

function listSkillDirs(sourceRoot) {
  if (!fs.existsSync(sourceRoot)) {
    return [];
  }

  return fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(sourceRoot, entry.name))
    .filter((dirPath) => fs.existsSync(path.join(dirPath, "SKILL.md")));
}

function ensureEmptyDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, { recursive: true });
}

function syncSkills({ sourceRoot, targets = DEFAULT_TARGETS }) {
  const skillDirs = listSkillDirs(sourceRoot);

  targets.forEach((target) => {
    const targetRoot = path.join(process.cwd(), target);
    ensureEmptyDir(targetRoot);

    skillDirs.forEach((skillDir) => {
      const skillName = path.basename(skillDir);
      copyDir(skillDir, path.join(targetRoot, skillName));
    });
  });

  return { skillCount: skillDirs.length, targets };
}

if (require.main === module) {
  const result = syncSkills({
    sourceRoot: path.join(process.cwd(), "skills"),
    targets: DEFAULT_TARGETS,
  });

  console.log(
    `Synced ${result.skillCount} skill(s) to ${result.targets.join(", ")}.`
  );
}

module.exports = {
  syncSkills,
  DEFAULT_TARGETS,
};
