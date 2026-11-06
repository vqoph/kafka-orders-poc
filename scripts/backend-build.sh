#!/usr/bin/env bash
# Build Spring Boot module(s) (install into local .m2).
# Usage:
#   ./scripts/backend-build.sh              # all modules
#   ./scripts/backend-build.sh all
#   ./scripts/backend-build.sh order-service
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULES=(order-service payment-service inventory-service notification-service)
MODULE="${1:-all}"

cd "$ROOT"

if [[ "$MODULE" == "all" ]]; then
  echo "Building all backend modules..."
  mvn -f backend/pom.xml -DskipTests install
  exit 0
fi

for name in "${MODULES[@]}"; do
  if [[ "$MODULE" == "$name" ]]; then
    echo "Building ${name} (+ dependencies)..."
    mvn -f backend/pom.xml -pl "services/${name}" -am -DskipTests install
    exit 0
  fi
done

echo "Unknown module: ${MODULE}" >&2
echo "Usage: $0 [all|order-service|payment-service|inventory-service|notification-service]" >&2
exit 1
