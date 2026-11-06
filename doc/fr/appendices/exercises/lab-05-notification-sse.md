# Lab 5 — Notification SSE (Kafka → UI)

Exercice de l’[étape 7 du tutoriel](../../TUTORIAL.md#étape-7--notification-service-sse--invalidation-rtk).  
But : brancher le **pont realtime** — `notification-service` consomme les **topics métier** déjà existants (pas un second bus), pousse en **SSE**, et le front **invalide les tags RTK**.

Fichiers à compléter (cherche `TODO Lab 5`) :

- [`SseHub.java`](../../../../backend/services/notification-service/src/main/java/com/example/orders/notification/sse/SseHub.java) — `broadcast(NotificationEvent)`
- [`OrderStatusListener.java`](../../../../backend/services/notification-service/src/main/java/com/example/orders/notification/kafka/OrderStatusListener.java)
- [`PaymentProcessedListener.java`](../../../../backend/services/notification-service/src/main/java/com/example/orders/notification/kafka/PaymentProcessedListener.java)
- [`InventoryReservedListener.java`](../../../../backend/services/notification-service/src/main/java/com/example/orders/notification/kafka/InventoryReservedListener.java)

Le boilerplate (Kafka config `group-id=notification-service`, CORS, `GET /notifications/stream`, front `invalidateTags`) est **posé par l’assistant**.

## Prérequis

- Infra Docker up (`kafka`, `kafka-ui`, `postgres`).
- Étape 6 OK : saga publie `orders.status`, `payments.processed`, `inventory.reserved`.
- Build : `mvn -f backend/pom.xml -pl services/notification-service -am -DskipTests install`
- Run : `./scripts/backend-run.sh` (ou au moins order + payment + inventory + notification).

## Contexte (à lire avant de coder)

| Topic | `NotificationEvent.type` | Effet UI (déjà câblé) |
|---|---|---|
| `orders.status` | `ORDER_STATUS` | invalidate `Orders` |
| `payments.processed` | `PAYMENT_PROCESSED` | invalidate `Payments` |
| `inventory.reserved` | `INVENTORY_RESERVED` | invalidate `Stock` |

Ce n’est **pas** “Kafka = système de notif interne” : Kafka reste le **journal métier** ; notification-service est un **abonné de plus** (comme payment lit `orders.created`).

`groupId = notification-service` ≠ `order-service` ⇒ les deux groupes reçoivent **tout** le flux `orders.status` (pub/sub).

SSE = connexion HTTP longue (`SseEmitter`). Limite POC : fan-out **local à l’instance**.

---

## Partie A — À coder (Java)

### A.1 `SseHub.broadcast`

Pour chaque emitter enregistré :

1. `emitter.send(SseEmitter.event().name(SseHub.EVENT_NAME).data(event))`
2. Sur `IOException` : retirer l’emitter + `completeWithError`

### A.2 Listeners

Dans chaque `on…` : construire un `NotificationEvent` puis `sseHub.broadcast(...)`.

Constantes utiles sur `NotificationEvent` : `TYPE_ORDER_STATUS`, `TYPE_PAYMENT_PROCESSED`, `TYPE_INVENTORY_RESERVED`.

---

## Partie B — Observer

1. Terminal : `curl -N localhost:8084/notifications/stream` → event `connected`.
2. `POST localhost:8081/orders` (SKU seed) → dans le curl : events `notification` avec types `PAYMENT_PROCESSED`, `INVENTORY_RESERVED`, puis `ORDER_STATUS`.
3. Kafka UI : même messages visibles sur les topics ; consumer group `notification-service` avance.
4. Front (`./scripts/frontend-dev.sh`) : listes Commandes / Stocks / Paiements se rafraîchissent **sans** bouton Refresh ; feed Notifications reçoit les messages.

**Étape 7 ok** : Lab 5 A + B (SSE + invalidation UI).
