# Base image assumption: python:3.13-slim (Debian "bookworm" based, latest
# stable Python 3.x release as of this writing). Swap the tag below if a
# different Python minor version is required by the project.
FROM python:3.13-slim

# Assumption: Node.js 22.x is used as the "recent LTS" release. Bump
# NODE_MAJOR to track a newer LTS line (e.g. 24) when needed.
ARG NODE_MAJOR=22

# Minimal OS packages required to:
#  - create/manage the non-root "vscode" user (via sudo) that
#    .devcontainer/devcontainer.json expects as remoteUser/containerUser
#  - fetch and verify the gh CLI apt repo (curl, gnupg, ca-certificates)
#  - run the NodeSource setup script for Node.js (curl, gnupg, ca-certificates)
#  - run the Claude Code CLI install script (curl)
# python:slim images are Debian-based, so apt-get remains the right tool.
# A multi-stage build was considered but is not used here: this is a
# devcontainer development image (not a shipped application artifact), so
# the CLI tools it installs (gh, node, claude) are meant to stay in the
# final image rather than being build-only dependencies.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        sudo \
        git \
    && rm -rf /var/lib/apt/lists/*

# Create a "vscode" user equivalent to the one provided by
# mcr.microsoft.com/devcontainers/base:ubuntu, so remoteUser/containerUser
# "vscode" in .devcontainer/devcontainer.json keeps working.
RUN groupadd --gid 1000 vscode \
    && useradd --uid 1000 --gid 1000 -m -s /bin/bash vscode \
    && echo "vscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/vscode \
    && chmod 0440 /etc/sudoers.d/vscode

# Install Node.js via the official NodeSource setup script. This is
# lightweight (adds one apt repo, no extra build tooling) and keeps
# npm/npx available, which is appropriate for a slim base image.
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER vscode

RUN <<EOT
sudo apt-get update
type -p curl >/dev/null || sudo apt-get install curl -y
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt-get update
sudo apt-get install -y --no-install-recommends gh
GH_VERSION="$(gh --version | awk 'NR==1 {print $3}')"
dpkg --compare-versions "$GH_VERSION" ge "2.82.1"
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*
curl -fsSL https://claude.ai/install.sh | bash
EOT


ENV PATH="/home/vscode/.local/bin:${PATH}"
