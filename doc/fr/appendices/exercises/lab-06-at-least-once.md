# Lab 6 — At-least-once et idempotence métier

Exercice de l’[étape 8 du tutoriel](../../TUTORIAL.md#étape-8--fiabilité-labs-6-et-7).  
But : coder le **skip idempotent**, puis **rejouer** un message déjà traité (reset d’offset en bash) et vérifier qu’il n’y a pas de double effet.

Fichiers à compléter (cherche `TODO Lab 6`) :

- [`PaymentService.java`](../../../../backend/services/payment-service/src/main/java/com/example/orders/payment/PaymentService.java)
- [`InventoryService.java`](../../../../backend/services/inventory-service/src/main/java/com/example/orders/inventory/InventoryService.java)

Boilerplate déjà posé : `UNIQUE(order_id)`, `existsByOrderId`.  
Le rejeu se force **en bash** (pas de flag lab dans le runtime).

## Prérequis

- Infra Docker up (`kafka`, `postgres`, …).
- `payment-service` et/ou `inventory-service` up.
- Si Flyway UNIQUE échoue sur des doublons : `docker compose down -v && docker compose up -d`.

## Contexte

Kafka = **at-least-once** en pratique : un même message peut être traité plus d’une fois (crash, rebalance, **reset d’offset**).

Idempotence **métier** ici :

| Service | Invariant |
|---|---|
| payment | au plus **un** paiement par `order_id` |
| inventory | au plus **une** réservation par `order_id` |

Sans skip : au rejeu, 2ᵉ `save` → violation UNIQUE (ou pire, double effet si pas de contrainte).  
Avec skip : 2ᵉ passage = no-op + log.

Alternative générique (lecture) : table `processed_events(event_id)`.

---

## Partie A — À coder

Dans chaque `processOrderCreated`, **avant** decide / reserve :

1. Détecter si cet `orderId` a **déjà** une ligne en base (repo : `existsByOrderId`).
2. Si oui : logger et `return` (pas de 2ᵉ insert / publish).
3. Sinon : laisser le flux actuel.

À faire dans **payment** et **inventory**.

---

## Partie B — Forcer un rejeu (bash)

Exemple sur **payment-service** (même idée pour inventory / group `inventory-service`).

### B.1 Créer une commande

```bash
ORDER_ID=$(curl -s -X POST localhost:8081/orders \
  -H 'content-type: application/json' \
  -d '{"customerId":"c1","amount":42.00,"items":[{"sku":"SKU-001","quantity":1}]}' \
  | jq -r .id)
echo "orderId=$ORDER_ID"

docker compose exec -T postgres psql -U postgres -d payments -c \
  "SELECT id, order_id, success FROM payments WHERE order_id = '$ORDER_ID';"
```

Logs : `Processed payment orderId=…`.

### B.2 Stopper le consumer, reculer l’offset

Le group doit être **idle** (aucun membre) pour `--reset-offsets --execute` :

```bash
# Arrête payment-service (Ctrl+C), puis :

docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 \
  --group payment-service \
  --topic orders.created \
  --reset-offsets \
  --to-earliest \
  --execute
```

### B.3 Relancer et observer

```bash
mvn -f backend/pom.xml -pl services/payment-service spring-boot:run
```

**Avec le skip Lab 6** :

- Log : `Skipping already processed payment orderId=…`
- Toujours une seule ligne :

```bash
docker compose exec -T postgres psql -U postgres -d payments -c \
  "SELECT count(*) FROM payments WHERE order_id = '$ORDER_ID';"
```

**Sans le skip** : erreur UNIQUE (ou 2 lignes si tu avais retiré la contrainte) — symptôme du rejeu.

Répète côté inventory (`inventory-service`, base `inventory`, table `reservations`) si tu veux.

**Lab 6 ok** : skip codé des deux côtés + reset d’offset + `Skipping` + `count(*) = 1` sur au moins un service.
