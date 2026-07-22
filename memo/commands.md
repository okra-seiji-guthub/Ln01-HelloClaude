
```bash
# build docker image
docker build -t claude-dev:local .

# check image you built
docker images claude-dev

# then create devcontainer.json file and setting docker image and user that you built
# file name `.devcontainer/devcontainer.json`
# {
#     "image": "claude-dev:local",
#     "remoteUser": "vscode",
#     "containerUser": "vscode"
# }
```
