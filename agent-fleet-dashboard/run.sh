#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8877}"
cd "$ROOT"

export BIOCELL_HOST="$HOST"
export BIOCELL_PORT="$PORT"

echo "BioCell Atlas 3D — local server"
echo "UI:     http://${HOST}:${PORT}/"
echo "Health: http://${HOST}:${PORT}/api/health"
echo "Cells:  http://${HOST}:${PORT}/api/cells"
echo "Fleet:  http://${HOST}:${PORT}/api/fleet"
echo "Svcs:   http://${HOST}:${PORT}/api/services"
echo "Press Ctrl-C to stop."

# Prefer python3; fall back to python if missing.
PY="$(command -v python3 || command -v python)"
if [[ -z "$PY" ]]; then
  echo "ERROR: python3 not found" >&2
  exit 1
fi

exec "$PY" "$ROOT/server.py" --host "$HOST" --port "$PORT"
