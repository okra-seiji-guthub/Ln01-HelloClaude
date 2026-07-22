

##senario1 If Pull Request's Rejected.

```bash
# add new branch and worktree
git worktree add .worktrees/feature-001 -b feature/feature-001 main

cd .worktrees/feature-001

# commit changes and push to origin
git add .
git commit -m "feat: Add some feacher."
git push -u origin feature/feature-002

# create PR
gh pr create -t "feat: feature/feature-001" -b "Add these feachers: ...."

# PR rejected

# remove worktree
git worktree remove .worktrees/feature-001

# delete local and remote branches
git branch -D feature-001
git push origin --delete feature-001

```

##senario2 If Pull Request's merged.

``` bash
# 
git worktree add .worktrees/feature-002 -b feature/feature-002 main

cd .worktrees/feature-001

# commit changes and push to origin
git add .
git commit -m "feat: Add some feacher."
git push -u origin feature/feature-002

# create PR
gh pr create -t "feat: feature/feature-002" -b "Add these feachers: ...."

# PR merged.

# remove worktree
git worktree remove .worktrees/feature-002

# delete local and remote branches
git pull origin main
git fetch --prune

git branch -D feature-002

git push origin --delete feature-002

```


## senario3 If cancel the changes and revert everything as if nothing had happened.

# add new branch and worktree
git worktree add .worktrees/feature-003 -b feature/feature-003 main

cd .worktrees/feature-003

git add .
git commit -m "feat: Add some feacher."


# cancel the changes

# remove worktree with --force option
git worktree remove .worktrees/feature-003 --force

# delete local and remote branches
git branch -D feature-003
