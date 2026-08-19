#!/usr/bin/env bash
# Assemble the Next.js standalone server for SOGo6 UI.
#
# Builds with webpack and copies the static output + public assets into
# .next/standalone, making sure HIDDEN public files (e.g. .well-known/security.txt)
# are included. Without the trailing "/." copy trick, `cp public/*` silently drops
# dotfiles and /.well-known/security.txt 404s after every rebuild.
#
# Usage:
#   PORT=3099 REACT_APP_API_BASE_URL=https://host/api/user/v1 \
#     NEXT_PUBLIC_API_BASE_URL=https://host ./scripts/deploy-standalone.sh
#
# Then start:
#   PORT=$PORT REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL \
#     NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
#     node .next/standalone/server.js -H 0.0.0.0
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3099}"
REACT_APP_API_BASE_URL="${REACT_APP_API_BASE_URL:-https://sogo6.contextual-intelligence.org/api/user/v1}"
NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-https://sogo6.contextual-intelligence.org}"

STANDALONE=".next/standalone"

echo ">> Building (webpack)..."
npm run build:webpack

echo ">> Assembling standalone output in $STANDALONE ..."
rm -rf "$STANDALONE/.next/static"
cp -r .next/static "$STANDALONE/.next/static"
# Copy public/ INCLUDING hidden dirs (.well-known) — trailing "/." is required.
cp -r public/. "$STANDALONE/public/"

echo ">> Verifying /.well-known/security.txt is present..."
if [ -f "$STANDALONE/public/.well-known/security.txt" ]; then
  echo "   ok: security.txt copied"
else
  echo "   WARNING: public/.well-known/security.txt missing from source" >&2
fi

echo ">> Standalone assembled."
echo ">> Start with:"
echo "   PORT=$PORT REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL node $STANDALONE/server.js -H 0.0.0.0"
