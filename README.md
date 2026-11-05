# kafka-orders-poc

Learning POC: Java / Spring Boot microservices talking through Kafka (order saga), Docker Compose, and a microfrontend UI under `frontend/`.

## Layout

- `backend/` — Maven multi-module (`libs/events` + Spring Boot services)
- `frontend/` — microfrontends (shell + remotes; see `scripts/frontend-*.sh`)
- `docker-compose.yml` — Kafka, Kafka UI, Postgres
- `scripts/` — infra / backend / frontend helpers

## Quick start

```bash
./scripts/infra-up.sh
./scripts/backend-install.sh
# then run services, e.g.:
#   mvn -f backend/pom.xml -pl services/order-service spring-boot:run
```

Start with [doc/fr/TUTORIAL.md](./doc/fr/TUTORIAL.md). It contains the step-by-step walkthrough, the concepts behind each step, and the commands to run.

French Kafka concepts overview (appendix): [doc/fr/appendices/architecture-kafka-essentials.md](./doc/fr/appendices/architecture-kafka-essentials.md). Index: [doc/fr/README.md](./doc/fr/README.md).
