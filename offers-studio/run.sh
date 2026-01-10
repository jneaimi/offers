#!/bin/bash
# Run script for Offers Studio

# Source nvm and use Node 22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# Add cargo to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Run tauri dev
npm run tauri dev
