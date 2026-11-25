#!/usr/bin/env bash
set -euo pipefail
# Backup the Postgres database used by the self-hosted stack.
# Usage: ./scripts/backup.sh [output_dir]
OUT="${1:-./backups}"
mkdir -p "$OUT"
TS=$(date +%Y%m%d_%H%M%S)
FILE="$OUT/apex_${TS}.dump"
docker compose exec -T db pg_dump -U apex -d apex -Fc > "$FILE"
echo "Backup written to $FILE"
