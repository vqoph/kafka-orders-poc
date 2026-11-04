# Appendices du tutoriel

Compléments au [tutoriel](../TUTORIAL.md) : lectures de fond et exercices hors du fil pas à pas principal.

## Concepts

- [Architecture Kafka — l'essentiel](./architecture-kafka-essentials.md) — producers, topics, brokers, consumer groups, réplication, KRaft.
- [Changer le nombre de partitions](./kafka-partition-count-changes.md) — pourquoi `hash(key) % N` casse l’ordre au resize, et comment l’éviter.

## Exercices (labs)

- [Lab 0 — Bases order-service (REST + mapping)](./exercises/lab-00-order-rest-jpa.md) — cité depuis l’[étape 3](../TUTORIAL.md#étape-3--order-service-rest-jpa-flyway).
- [Lab 1 — Clés et partitions](./exercises/lab-01-keys-partitions.md) — cité depuis l’[étape 4](../TUTORIAL.md#étape-4--publier-orderscreated-et-lab-1).

## Sources

- [Apache Kafka Architecture Diagram: Producers, Brokers, KRaft Controllers and Consumer Groups](https://bytediagram.com/blog/apache-kafka-architecture-diagram-kraft-brokers-consumer-groups.html) (ByteDiagram) — inspiration de l’annexe d’architecture.
