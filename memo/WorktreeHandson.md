

## senario 1 If Pull Request's Rejected.

```bash
# add new branch and worktree
git worktree add .worktrees/feature-001 -b feature/feature-001 main

cd .worktrees/feature-001

# commit changes and push to origin
git add .
git commit -m "feat: Add some feacher."
git push -u origin feature/feature-001

# create PR
gh pr create -t "feat: feature/feature-001" -b "Add these features: ...."

# Leave worktree (back to main branch) 
# 1. cd <main branch folder>
cd ../..

# 2. check PR list
gh pr list
  ID  TITLE                    BRANCH             CREATED AT       
  #1  feat: feature/feature-001  feature/feature-001  about 3 hours ago

# 3. view PR with web browser
gh pr view 1 -w

# 4. reject PR
gh pr close 1 -c "Un, this feature is canceled this evening."

# remove worktree
git worktree remove .worktrees/feature-001

# delete local and remote branches
git branch -D feature/feature-001
git push origin --delete feature/feature-001

```

## senario 2 If Pull Request's merged.

``` bash
# 
git worktree add .worktrees/feature-002 -b feature/feature-002 main

cd .worktrees/feature-002

# commit changes and push to origin
git add .
git commit -m "feat: Add some feacher."
git push -u origin feature/feature-002

# create PR
gh pr create -t "feat: feature/feature-002" -b "Add these features: ...."

# Leave worktree (back to main branch) 
# 1. cd <main branch folder>
cd ../..

# 2. check PR list
gh pr list
  ID  TITLE                    BRANCH             CREATED AT       
  #1  feat: feature/feature-001  feature/feature-001  about 3 hours ago

# 3. view PR with web browser
gh pr view 1 -w

# 4. Merge PR and delete branch
gh pr merge 1 --auto --squash

# remove worktree
git worktree remove .worktrees/feature-002

# delete local and remote branches
git pull origin main
git fetch --prune

git branch -D feature/feature-002
git push origin --delete feature/feature-002
```


## senario 3 If cancel the changes and revert everything as if nothing had happened.

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
