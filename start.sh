#!/usr/bin/env bash
# Starts the FIT NATION site as a live dev server (hot reload) at http://localhost:5173
# Node was installed locally for this project; this script puts it on PATH if it is not already available.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  export PATH="$HOME/.local/opt/node-v24.21.0-linux-x64/bin:$PATH"
fi
exec npm run dev -- --port 5173 "$@"
