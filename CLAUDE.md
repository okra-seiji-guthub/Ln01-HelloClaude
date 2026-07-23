# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This is a learning repository for getting familiar with Claude Code, built on a DevContainer setup. The actual content is a single falling-block puzzle game (Tetris-style, Japanese UI) implemented as one self-contained HTML file.

## Architecture

- `game/index.html` — the entire game: markup, CSS, and JS all in one file, no build step, no dependencies. Open it directly in a browser to run/test.
  - Game state (`board`, `current`, `next`, `score`, `lines`, `level`) lives in closures inside a single IIFE.
  - Piece shapes/colors are defined in `SHAPES`/`COLORS` maps keyed by tetromino letter (I/J/L/O/S/Z/T).
  - Game loop uses `requestAnimationFrame` (`loop()`), driven by `dropInterval` which decreases as `level` increases (10 lines cleared per level).
  - Rotation uses a simple wall-kick offset list (`kicks = [0, -1, 1, -2, 2]`) in `rotate()`.
- `Dockerfile` — builds the devcontainer image (Ubuntu base + `gh` CLI + Claude Code CLI installed via `curl -fsSL https://claude.ai/install.sh | bash`).
- `.devcontainer/devcontainer.json` — points VS Code at the locally built `claude-dev:local` image.
- `memo/` — handwritten notes from working through this repo (setup commands, git worktree hands-on notes).

## Working with the devcontainer image

```bash
# build docker image
docker build -t claude-dev:local .

# check image you built
docker images claude-dev
```

`.devcontainer/devcontainer.json` should reference `"image": "claude-dev:local"` with `remoteUser`/`containerUser` set to `vscode`. After building, restart VS Code to pick up the image.

## Testing changes

There is no test suite or build/lint tooling. Verify changes to `game/index.html` by opening the file in a browser and playing the game (arrow keys to move/rotate, Space to hard drop, P to pause).
