# LOADOUT

This file is the operational link between what is installed and how agents should use it.

Keep it current whenever modules/loadouts change.

---

## Canonical sources

Use these files as source of truth for what is installed:

- `.agent-pack/manifest.lock.json` (resolved install snapshot)
- `.agent-pack/system/state.json` (module install/refresh state)
- `.agent-pack/core/manifest.json` and `.agent-pack/modules/*/manifest.json` (installed module manifests)
- `.agent-pack/loadouts/*.json` (installed loadout definitions)

If this file disagrees with those sources, update this file.

---

## Installed loadouts (current repo)

- `<loadout-id>` - installed via `agent-pack add loadout:<id>`

If no loadouts are installed, write: `(none)`.

---

## Installed modules (current repo)

- `core` - version `<x.y.z>` - always active
- `<module-id>` - version `<x.y.z>` - active / inactive

Include every currently installed module.

---

## Module usage map

Define when each installed module should influence behavior.

- `core`
  - Planning: required
  - Building: required
  - Testing/checks: required
  - Why: workflow contracts and project memory
- `research` (if installed)
  - Planning: required for evidence-driven scope/decisions
  - Building: optional unless task is research-heavy
  - Testing/checks: required when claims depend on external evidence
- `coding` (if installed)
  - Planning: optional for implementation tradeoff shaping
  - Building: required for code changes
  - Testing/checks: required for technical verification
- `writing` (if installed)
  - Planning: optional for doc-heavy deliverables
  - Building: required for docs/copy deliverables
  - Testing/checks: required for clarity/completeness reviews

Add entries for any custom modules.

---

## Phase rules

- Planning (`/ap:plan`):
  - Read this file before writing tasks/checks.
  - Prefer task shapes that match installed module capabilities.
- Building (`/ap:do`):
  - Confirm task assumptions are supported by installed modules.
  - Avoid using guidance from modules that are not installed.
- Testing (`/ap:check`):
  - Verify checks match the active module usage map.
  - If a check needs missing module support, mark as blocker and update plan.

---

## Update checklist

Run this checklist whenever `agent-pack add` or `agent-pack refresh` changes installed modules/loadouts:

1. Re-read canonical source files listed above.
2. Update "Installed loadouts" and "Installed modules".
3. Update "Module usage map" for any new/removed module.
4. Note behavior changes in `.agent-pack/core/work/STATUS.md` (if they affect active work).

---

## Last updated

- Date:
- Updated by:
