#!/bin/sh
# Manual bucket initialization script for RustFS.
# Usage: run after `docker compose up -d rustfs` to create the birdlog-photos bucket.
#
# Prerequisites: mc (MinIO Client) must be installed.
#   macOS:  brew install minio/stable/mc
#   Linux:  curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc

set -e

ENDPOINT="${RUSTFS_ENDPOINT:-http://localhost:9000}"
ALIAS="local"
BUCKET="${RUSTFS_BUCKET:-birdlog-photos}"
USER="${RUSTFS_ROOT_USER:-rustfsadmin}"
PASS="${RUSTFS_ROOT_PASSWORD:-rustfsadmin}"

echo "Waiting for RustFS to be ready at ${ENDPOINT}..."
until mc alias set "${ALIAS}" "${ENDPOINT}" "${USER}" "${PASS}" > /dev/null 2>&1; do
  sleep 2
done

echo "Creating bucket: ${BUCKET}"
mc mb --ignore-existing "${ALIAS}/${BUCKET}"

echo "Setting anonymous download policy on ${BUCKET}"
mc anonymous set download "${ALIAS}/${BUCKET}"

echo "Done. Bucket '${BUCKET}' is ready."
