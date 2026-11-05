#!/usr/bin/env bash
# Refresh checked-in OpenAPI contracts from running Spring services (springdoc).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

fetch() {
  local name="$1"
  local url="$2"
  local out="$3"
  echo "Fetching ${name} from ${url}"
  curl -fsS "$url" | python3 -m json.tool >"$out"
  echo "  -> ${out}"
}

fetch orders       "http://localhost:8081/v3/api-docs" "$ROOT/packages/orders/openapi.json"
fetch payment      "http://localhost:8082/v3/api-docs" "$ROOT/packages/payment/openapi.json"
fetch notification "http://localhost:8084/v3/api-docs" "$ROOT/packages/notification/openapi.json"
fetch inventory    "http://localhost:8085/v3/api-docs" "$ROOT/packages/inventory/openapi.json"

echo "Done. Run: npm run generate:api"
