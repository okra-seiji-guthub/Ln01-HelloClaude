FROM mcr.microsoft.com/devcontainers/base:ubuntu

USER vscode

RUN <<EOT
sudo apt-get update
sudo apt-get -y upgrade
sudo apt-get install -y curl
sudo apt-get install -y gh
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*
curl -fsSL https://claude.ai/install.sh | bash
EOT

ENV PATH="/home/vscode/.local/bin:${PATH}"
