#!/usr/bin/env bash
# Helper to set required Vercel env vars for capsy-services
# Usage: VERCEL_TOKEN=xxx ./scripts/set_vercel_env.sh production
# Requires 'vercel' CLI installed and logged in (or VERCEL_TOKEN env var)

set -euo pipefail
ENV_SCOPE=${1:-production}
REQUIRED=(ODOO_API_URL ODOO_USERNAME ODOO_PASSWORD)

if ! command -v vercel >/dev/null 2>&1; then
  echo "Please install Vercel CLI: npm i -g vercel"
  exit 2
fi

for key in "${REQUIRED[@]}"; do
  val=$(printenv "$key" || true)
  if [ -z "$val" ]; then
    read -rp "Enter value for $key: " val
  fi
  echo "Setting $key for scope $ENV_SCOPE"
  vercel env add "$key" "$val" "$ENV_SCOPE" --yes
done

echo "Done. Remember to redeploy the project on Vercel."
