FROM mcr.microsoft.com/devcontainers/base:ubuntu

USER vscode

RUN <<EOT
apt-get update
apt-get -y upgrade
apt-get install -y curl
apt-get install -y gh
apt-get clean
rm -rf /var/lib/apt/lists/*
curl -fsSL https://claude.ai/install.sh | bash
EOT

ENV PATH="/home/vscode/.local/bin:${PATH}"
