#!/usr/bin/env bash
# git worktree create/remove helper used by the worktree-skill Skill.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  worktree-script.sh --create -w <worktree-dir> -b <branch-name>
  worktree-script.sh --remove -w <worktree-dir> -b <branch-name> [--del-branch]

Examples:
  worktree-script.sh --create -w .worktrees/chore-001 -b chore-001
  worktree-script.sh --remove -w .worktrees/chore-001 -b chore-001 --del-branch
EOF
}

mode=""
worktree_dir=""
branch_name=""
del_branch=false

while [ $# -gt 0 ]; do
  case "$1" in
    --create)
      mode="create"
      shift
      ;;
    --remove)
      mode="remove"
      shift
      ;;
    -w)
      worktree_dir="${2:-}"
      shift 2
      ;;
    -b)
      branch_name="${2:-}"
      shift 2
      ;;
    --del-branch)
      del_branch=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ -z "$mode" ]; then
  echo "Error: specify --create or --remove" >&2
  usage >&2
  exit 1
fi

if [ -z "$worktree_dir" ] || [ -z "$branch_name" ]; then
  echo "Error: -w <worktree-dir> and -b <branch-name> are required" >&2
  usage >&2
  exit 1
fi

case "$worktree_dir" in
  .worktrees/*) ;;
  *)
    echo "Error: worktree dir must be under .worktrees/ (got: $worktree_dir)" >&2
    exit 1
    ;;
esac

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [ "$mode" = "create" ]; then
  if [ -e "$worktree_dir" ]; then
    echo "Error: worktree dir already exists: $worktree_dir" >&2
    exit 1
  fi
  if git show-ref --verify --quiet "refs/heads/$branch_name"; then
    echo "Error: branch already exists: $branch_name" >&2
    exit 1
  fi
  mkdir -p "$(dirname "$worktree_dir")"
  git worktree add -b "$branch_name" "$worktree_dir"
  echo "Created worktree '$worktree_dir' on branch '$branch_name'."
  exit 0
fi

if [ "$mode" = "remove" ]; then
  if [ ! -e "$worktree_dir" ]; then
    echo "Error: worktree dir does not exist: $worktree_dir" >&2
    exit 1
  fi
  git worktree remove "$worktree_dir"
  echo "Removed worktree '$worktree_dir'."

  if [ "$del_branch" = true ]; then
    if ! git show-ref --verify --quiet "refs/heads/$branch_name"; then
      echo "Error: branch does not exist, cannot delete: $branch_name" >&2
      exit 1
    fi
    git branch -D "$branch_name"
    echo "Deleted branch '$branch_name'."
  fi
  exit 0
fi
