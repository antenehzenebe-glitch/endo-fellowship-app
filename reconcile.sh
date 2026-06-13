#!/usr/bin/env bash
# Removes files retired by the 2026-06-12 reconciliation. Safe to re-run.
# Run from the repo root AFTER extracting the bundle.
set -u

retire() {
  if [ -e "$1" ]; then rm -rf "$1" && echo "removed: $1"; else echo "already gone: $1"; fi
}

# Old v1 migrations (002 is destructive — must not survive in the repo)
retire supabase/migrations/001_initial_schema.sql
retire supabase/migrations/002_fix_type_conflicts.sql

# Auto-provisioning PKCE callback (replaced by token-hash /auth/confirm)
retire app/auth/callback

# Old src/-style locations if any earlier zip was partially extracted
retire src

echo
echo "Done. Now: rm -rf node_modules package-lock.json && npm install && npm run typecheck"
