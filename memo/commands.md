
```bash
# build docker image
docker build -t claude-dev:local .

# check image you built
docker images claude-dev

# verify GitHub CLI version (required: 2.82.1+)
gh --version

# check PR command no longer hits Projects classic warning
gh pr view 4

# then create devcontainer.json file and setting docker image and user that you built
# file name `.devcontainer/devcontainer.json`
# {
#     "image": "claude-dev:local",
#     "remoteUser": "vscode",
#     "containerUser": "vscode"
# }
```
