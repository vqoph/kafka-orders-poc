# kafka-orders-poc

Learning POC: Java / Spring Boot microservices talking through Kafka (order saga), Docker Compose, and a microfrontend UI under `frontend/`.

## Layout

- `backend/` — Maven multi-module (`libs/events` + Spring Boot services)
- `frontend/` — microfrontends (shell + remotes)
- `docker-compose.yml` — Kafka, Kafka UI, Postgres
- `scripts/` — `backend-run.sh`, `frontend-dev.sh`

## Quick start

```bash
docker compose up -d
mvn -f backend/pom.xml -DskipTests install
./scripts/backend-run.sh                 # all services (or: order-service, …)
./scripts/frontend-dev.sh                # http://localhost:5000
```

### Frontend API-first (OpenAPI → RTK Query)

Each microfrontend owns **one** business API. Clients are generated from OpenAPI (not hand-written):

1. Backend exposes Swagger via springdoc (`/v3/api-docs`, `/swagger-ui.html`)
2. Contracts live in `frontend/packages/<mfe>/openapi.json`
3. `@rtk-query/codegen-openapi` produces `src/api/generatedApi.ts`
4. UI consumes generated hooks only (`emptyApi` + thin tag enhancements)

```bash
# optional: refresh specs from running services, then regenerate clients
cd frontend
npm run fetch:openapi
npm run generate:api
```

Start with [doc/fr/TUTORIAL.md](./doc/fr/TUTORIAL.md). It contains the step-by-step walkthrough, the concepts behind each step, and the commands to run.

French Kafka concepts overview (appendix): [doc/fr/appendices/architecture-kafka-essentials.md](./doc/fr/appendices/architecture-kafka-essentials.md). Index: [doc/fr/README.md](./doc/fr/README.md).
