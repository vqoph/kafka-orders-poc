# SSE multi-instance et Redis

Complément de l’[étape 7](../TUTORIAL.md#étape-7--notification-service-sse--invalidation-rtk) et du [Lab 5](./exercises/lab-05-notification-sse.md).  
But : comprendre pourquoi un `SseHub` en mémoire ne scale pas horizontalement, et ce que Redis Pub/Sub apporte dans ce POC.

---

## Le piège en une phrase

**Kafka livre chaque message à une seule instance du consumer group** ; **chaque navigateur SSE est collé à une seule JVM**. Sans pont entre les deux, une partie des clients rate les notifications.

---

## Ce que `SseHub` résout (et ne résout pas)

[`SseHub`](../../backend/services/notification-service/src/main/java/com/example/orders/notification/sse/SseHub.java) garde une `CopyOnWriteArrayList` d’`SseEmitter` :

| OK | KO |
| --- | --- |
| Threads HTTP (register) + threads Kafka / Redis (broadcast) sur **la même** JVM | Fan-out vers les clients SSE d’**une autre** JVM |
| Itération sûre pendant connect/disconnect | Remplacer un bus partagé |

Dès que tu as `notification-service` × N derrière un load balancer, chaque pod a **son** hub vide des emitters des autres.

---

## Consumer group ≠ fan-out UI

```text
groupId = notification-service   →  partitions partagées entre pods (1 traitement / message)
SSE clients                      →  stickés (ou round-robin) sur un pod au hasard
```

C’est voulu côté métier (pas de double traitement). C’est insuffisant côté push navigateur (tous les clients connectés doivent être prévenus).

---

## Pattern retenu : Redis Pub/Sub

Code : [`RedisNotificationFanout`](../../backend/services/notification-service/src/main/java/com/example/orders/notification/redis/RedisNotificationFanout.java) + [`RedisFanoutConfig`](../../backend/services/notification-service/src/main/java/com/example/orders/notification/redis/RedisFanoutConfig.java).

1. Un listener Kafka (une seule instance du group) mappe vers `NotificationEvent`.
2. `fanout.publish` → `PUBLISH` sur le canal `notifications.sse`.
3. **Chaque** instance (y compris celle qui a publié) reçoit le message Redis → `sseHub.broadcast` local.

Séparation des rôles :

- **Kafka** = faits métier durables (saga, rejeu, offsets).
- **Redis Pub/Sub** = relais ephemère pour le push UI.
- **SSE** = dernier kilomètre navigateur.

L’event `CONNECTED` du `GET /notifications/stream` reste **local** (pas besoin de le diffuser aux autres pods).

### Limite Pub/Sub (à retenir)

Fire-and-forget : pas de file durable, pas de replay. Si un pod n’était pas abonné au moment du `PUBLISH`, l’event SSE est perdu pour ses clients (l’UI peut toujours refetch REST). Pour de la notif “best effort”, c’est acceptable ; ce n’est **pas** un journal comme Kafka.

---

## Alternatives (même problème)

| Approche | Intérêt | Coût |
| --- | --- | --- |
| **Redis Pub/Sub** (ce POC) | Séparation métier / push ; scale pods | +1 service Docker |
| Topic Kafka `notifications.fanout` + `groupId` **par pod** | 0 nouvelle boîte | N consumers complets ; Kafka comme bus de push |
| Sticky LB seul | Simple à activer | Ne corrige pas “msg Kafka sur l’autre pod” |

---

## Comment le vérifier

Voir [Lab 5 — Partie C](./exercises/lab-05-notification-sse.md#partie-c--observer-multi-instance-redis) : deux JVM (`8084` / `8086`), deux `curl -N`, un `POST /orders` → les deux streams reçoivent les mêmes events.
