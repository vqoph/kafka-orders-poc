#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

if [[ ! -d "${FRONTEND_DIR}" ]]; then
  echo "frontend/ directory not found at ${FRONTEND_DIR}" >&2
  exit 1
fi

cd "${FRONTEND_DIR}"
if [[ ! -d node_modules ]]; then
  echo "node_modules missing — running npm install"
  npm install
fi
echo "Starting MF apps via turbo (shell :5000, remotes :5001-5003)"
npm run dev
