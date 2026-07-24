FROM mcr.microsoft.com/devcontainers/base:ubuntu

USER vscode

RUN <<EOT
sudo apt-get update
sudo apt-get -y upgrade
type -p curl >/dev/null || sudo apt install curl -y
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh -y
GH_VERSION="$(gh --version | awk 'NR==1 {print $3}')"
dpkg --compare-versions "$GH_VERSION" ge "2.82.1"
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*
curl -fsSL https://claude.ai/install.sh | bash
EOT

ENV PATH="/home/vscode/.local/bin:${PATH}"
