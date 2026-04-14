#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
set -e

echo "CleanClaw installer"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 22 ]; then
  echo "Error: Node.js 22+ required. Install with: fnm install 22"
  exit 1
fi

# Install dependencies
npm install

# Create symlink on PATH
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
chmod +x "$REPO_ROOT/bin/cleanclaw.js"
mkdir -p "$HOME/.local/bin"
ln -sf "$REPO_ROOT/bin/cleanclaw.js" "$HOME/.local/bin/cleanclaw"

echo "CleanClaw installed. Run: cleanclaw init"
echo "If 'cleanclaw' is not found, add ~/.local/bin to your PATH:"
echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
