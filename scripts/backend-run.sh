#!/usr/bin/env bash
# Run Spring Boot module(s).
# Usage:
#   ./scripts/backend-run.sh              # all services
#   ./scripts/backend-run.sh all
#   ./scripts/backend-run.sh order-service
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODULES=(order-service payment-service inventory-service notification-service)
MODULE="${1:-all}"

run_one() {
  local name="$1"
  echo "Starting ${name}..."
  mvn -f backend/pom.xml -pl "services/${name}" spring-boot:run
}

cd "$ROOT"

if [[ "$MODULE" == "all" ]]; then
  pids=()
  cleanup() {
    echo "Stopping backend services..."
    for pid in "${pids[@]:-}"; do
      kill "$pid" 2>/dev/null || true
    done
  }
  trap cleanup EXIT INT TERM

  for name in "${MODULES[@]}"; do
    run_one "$name" &
    pids+=("$!")
  done

  echo "All services starting (order:8081 payment:8082 notification:8084 inventory:8085)."
  echo "Ctrl+C to stop."
  wait
  exit 0
fi

for name in "${MODULES[@]}"; do
  if [[ "$MODULE" == "$name" ]]; then
    run_one "$name"
    exit 0
  fi
done

echo "Unknown module: ${MODULE}" >&2
echo "Usage: $0 [all|order-service|payment-service|inventory-service|notification-service]" >&2
exit 1
