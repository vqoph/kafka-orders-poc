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

Start with [doc/fr/TUTORIAL.md](./doc/fr/TUTORIAL.md). It contains the step-by-step walkthrough, the concepts behind each step, and the commands to run.

French Kafka concepts overview (appendix): [doc/fr/appendices/architecture-kafka-essentials.md](./doc/fr/appendices/architecture-kafka-essentials.md). Index: [doc/fr/README.md](./doc/fr/README.md).
