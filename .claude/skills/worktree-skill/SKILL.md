---
name: worktree-skill
description: Safely and interactively create or remove git worktrees under `.worktrees/`, using a numbered branch-naming convention tracked in `branch_ids.json`. Use when the user wants to create a new worktree for a feature/fix/refactor/doc/chore/spike, or wants to remove an existing worktree (optionally deleting its branch too).
---

# worktree-skill

This skill creates and removes git worktrees under `.worktrees/`, using a
sequential numbering scheme per branch-name prefix, and always performs the
actual git operations through `worktree-script.sh` in this directory.

## Files

- `branch_ids.json` — tracks the next-available number for each prefix
  (`feature`, `fix`, `refactor`, `doc`, `chore`, `spike`). Read and update
  this file directly (it is plain JSON) — do not hand-edit numbering logic
  elsewhere.
- `worktree-script.sh` — the only script allowed to run `git worktree`
  commands. Always call it instead of running `git worktree` directly.

## Naming rule

Format: `<prefix>-<3-digit zero-padded number>`

- Worktree folder: always `.worktrees/<prefix>-<NNN>`
  (e.g. `.worktrees/feature-001`, `.worktrees/fix-003`, `.worktrees/spike-012`)
- Branch name:
  - For prefix `feature`, use `feature/feature-<NNN>` (e.g. `feature/feature-001`).
  - For every other prefix (`fix`, `refactor`, `doc`, `chore`, `spike`), use
    the bare `<prefix>-<NNN>` with no slash (e.g. `fix-003`, `spike-012`).

  This asymmetry matches the branch_ids.json convention already in use in
  this repo — do not "normalize" it into `prefix/prefix-NNN` for every
  prefix.

## Create workflow

1. Ask the user for the branch-name **prefix** (`feature`, `fix`,
   `refactor`, `doc`, `chore`, or `spike`) if not already given.
2. Read `branch_ids.json` and take the current value `N` for that prefix.
3. Compute the next number as `N + 1`, zero-padded to 3 digits (`NNN`).
4. Derive the worktree folder and branch name per the naming rule above.
5. Run:
   ```
   .claude/skills/worktree-skill/worktree-script.sh --create -w .worktrees/<prefix>-<NNN> -b <branch-name>
   ```
6. On success, update `branch_ids.json`, setting that prefix's value to
   `N + 1`, and save the file.
7. Report the created worktree path and branch name to the user.

If the script fails (e.g. worktree or branch already exists), do not update
`branch_ids.json`, and report the error to the user.

## Remove workflow

1. Ask the user for the branch-name **prefix** whose worktree should be
   removed (or the exact worktree name if there may be more than one
   candidate for that prefix).
2. Identify the target worktree folder under `.worktrees/` and its
   associated branch name (via `git worktree list` or by asking the user to
   confirm if ambiguous).
3. Ask the user for confirmation before deleting anything: "Also delete
   branch `<branch-name>`? (y/N)".
4. Run exactly one of the following, based on the answer:
   - If `y`/`yes`, delete both worktree and branch in one call:
     ```
     .claude/skills/worktree-skill/worktree-script.sh --remove -w .worktrees/<prefix>-<NNN> -b <branch-name> --del-branch
     ```
   - If `n`/`N`/empty, remove only the worktree and leave the branch intact:
     ```
     .claude/skills/worktree-skill/worktree-script.sh --remove -w .worktrees/<prefix>-<NNN> -b <branch-name>
     ```
5. Report what was removed (worktree, and branch if applicable) to the user.

## Constraints

- Never modify files outside `.claude/skills/worktree-skill/` as part of
  running this skill.
- Never run `git worktree` or `git branch -D` directly — always go through
  `worktree-script.sh`.
- Never guess a prefix's next number without reading `branch_ids.json`
  first, and never leave `branch_ids.json` out of sync with the worktrees
  actually created.
