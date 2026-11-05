#!/usr/bin/env bash
# Run one Spring Boot module. Usage: ./scripts/backend-run.sh order-service
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULE="${1:-}"
if [[ -z "$MODULE" ]]; then
  echo "Usage: $0 <module>" >&2
  echo "  modules: order-service | payment-service | inventory-service | notification-service" >&2
  exit 1
fi
cd "$ROOT"
mvn -f backend/pom.xml -pl "services/${MODULE}" spring-boot:run
