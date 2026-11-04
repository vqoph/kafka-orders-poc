# Lab 3 — Saga chorégraphiée

Exercice de l’[étape 6 du tutoriel](../../TUTORIAL.md#étape-6--inventory-service-et-saga-chorégraphie).  
But : **réserver du stock** à partir de `OrderCreated`, puis **agréger** paiement + inventory côté order-service pour `CONFIRMED` / `CANCELLED` (+ compensations), et **observer** happy path vs échec paiement.

Fichiers à compléter une fois le boilerplate posé (cherche `TODO Lab 3`) — chemins cibles :

- `services/inventory-service/.../InventoryReservation.java` (ou équivalent) — décider succès / décrémenter le stock
- `services/order-service/.../SagaService.java` (ou équivalent) — quand les deux résultats sont connus, trancher + compenser

Le boilerplate (events, Flyway inventory / saga columns, topics, listeners, publishers, refund listener) est **posé par l’assistant**.

## Prérequis

- Infra Docker up (`kafka`, `kafka-ui`, `postgres`) — bases `orders`, `payments`, `inventory`.
- Étapes 4–5 OK : `order-service` + `payment-service` publient / consomment correctement.
- Boilerplate étape 6 en place (inventory **8085**, saga columns, topics `inventory.reserved`, `orders.status`, compensations).
- Kafka UI : http://localhost:8080

## Contexte (à lire avant de coder)

Flux parallèle :

| Service | Écoute | Publie |
|---|---|---|
| payment-service | `orders.created` | `payments.processed` |
| inventory-service | `orders.created` | `inventory.reserved` |
| order-service | `payments.processed` + `inventory.reserved` | `orders.status` (+ refund / release si besoin) |

Corrélation = **clé Kafka `orderId`**.

État saga sur la ligne `orders` :

| Colonne | Sens |
|---|---|
| `payment_success` | `NULL` = pas encore reçu ; `true`/`false` = résultat payment |
| `inventory_success` | idem inventory |
| `status` | `PENDING` → `CONFIRMED` ou `CANCELLED` |

Compensation (uniquement si la saga échoue **et** qu’une branche avait réussi) :

| Branche réussie | Événement |
|---|---|
| paiement OK, inventory KO (ou l’inverse / les deux KO avec une OK) | `payments.refund.requested` si paiement OK |
| inventory OK, paiement KO | `inventory.release.requested` si inventory OK |

Si **les deux** OK → `CONFIRMED`, **aucune** compensation.

---

## Partie A — À coder (Java)

### A.1 Réservation stock (inventory)

À partir des lignes `OrderCreated.items` et de la table `stock` :

1. Pour chaque SKU : si quantité demandée `>` stock disponible → **échec** (`success=false`), ne pas modifier le stock (ou rollback transaction).
2. Sinon décrémenter chaque SKU, enregistrer la réservation, `success=true`.
3. Le boilerplate publie ensuite `InventoryReserved(orderId, success, reservedAt)` avec clé = `orderId`.

**Indices**

- SKU seed **`A`** (voir Flyway inventory) — les curls du tuto utilisent souvent `"sku":"A"`.
- Garde le traitement dans une `@Transactional` (décrément + insert reservation atomiques).
- Chaos optionnel : si `inventory.failure-rate` > 0, tu peux forcer un échec **après** ou **à la place** de la règle stock (selon ce que le boilerplate expose).

### A.2 Agrégation saga (order-service)

Quand un `PaymentProcessed` ou `InventoryReserved` arrive :

1. Persister le booléen correspondant (`payment_success` / `inventory_success`).
2. Si **l’une** des deux colonnes est encore `NULL` → **ne rien décider** (attendre l’autre).
3. Si les deux sont non-null et le statut est encore `PENDING` :
   - les deux `true` → `CONFIRMED` + publier `OrderStatusChanged`
   - sinon → `CANCELLED` + `OrderStatusChanged` + :
     - si `payment_success == true` → `PaymentRefundRequested`
     - si `inventory_success == true` → `InventoryReleaseRequested`
4. Si déjà terminal (`CONFIRMED`/`CANCELLED`) → no-op (rejeu).

**Indices**

- Une seule méthode du genre `onPaymentProcessed` / `onInventoryReserved` qui appelle `tryComplete(orderId)` évite la duplication.
- Publier les compensations **après** avoir passé le statut à `CANCELLED` en base (même dual-write que d’habitude).

<details>
<summary>Solution (seulement si bloqué)</summary>

Agrégation (pseudo) :

```java
if (order.getPaymentSuccess() == null || order.getInventorySuccess() == null) {
    return; // wait
}
if (order.getStatus() != OrderStatus.PENDING) {
    return; // already terminal
}
boolean ok = Boolean.TRUE.equals(order.getPaymentSuccess())
        && Boolean.TRUE.equals(order.getInventorySuccess());
if (ok) {
    order.confirm();
    publishStatus(order);
} else {
    order.cancel();
    publishStatus(order);
    if (Boolean.TRUE.equals(order.getPaymentSuccess())) {
        publishRefund(order);
    }
    if (Boolean.TRUE.equals(order.getInventorySuccess())) {
        publishRelease(order);
    }
}
```

Réservation : boucle items → `stock.quantity >= qty` pour tous, sinon `success=false` ; sinon décrémente et `success=true`.

</details>

### A.3 Compiler / relancer

```bash
mvn -pl services/order-service,services/payment-service,services/inventory-service -am -DskipTests install
mvn -pl services/order-service spring-boot:run
mvn -pl services/payment-service spring-boot:run
mvn -pl services/inventory-service spring-boot:run
```

Ports : order **8081**, payment **8082**, inventory **8085**.

---

## Partie B — Observer

### B.1 Happy path → CONFIRMED

1. Les trois services up ; `payment.failure-rate` raisonnable (ex. `0.0` pour un test déterministe).
2. Crée une commande :

```bash
curl -s -X POST localhost:8081/orders -H 'content-type: application/json' \
  -d '{"customerId":"c1","items":[{"sku":"A","quantity":1}],"amount":10}'
```

3. `GET /orders/{id}` → statut **`CONFIRMED`**.
4. Kafka UI : `payments.processed` (`success=true`), `inventory.reserved` (`success=true`), `orders.status` (`CONFIRMED`).
5. Optionnel : stock SKU `A` décrémenté en base `inventory`.

**Conclure** : les deux branches OK → confirmation sans compensation.

### B.2 Échec paiement → CANCELLED + release

1. Relance payment-service avec échec forcé :

```bash
mvn -pl services/payment-service spring-boot:run \
  -Dspring-boot.run.arguments=--payment.failure-rate=1.0
```

2. Nouvelle commande (même payload SKU `A`).
3. `GET` → **`CANCELLED`**.
4. Kafka UI : `payments.processed` `success=false` ; `inventory.reserved` souvent `success=true` (parallèle) ; puis `inventory.release.requested` + `orders.status` `CANCELLED`.
5. Logs inventory : release ; stock restauré (ou réservation annulée).

**Conclure** : chorégraphie + compensation — inventory avait pu réussir avant de savoir que le paiement échouerait.

### B.3 Question

> Pourquoi inventory peut-il publier `success=true` alors que la commande finira `CANCELLED` à cause du paiement ?

<details>
<summary>Réponse</summary>

Parce que payment et inventory consomment `orders.created` **en parallèle**, sans attendre l’autre. L’échec paiement n’est connu d’order-service qu’à l’agrégation ; la compensation (`inventory.release.requested`) annule alors la réservation déjà faite.

</details>

---

## Critères de réussite

- [ ] A.1 réservation stock OK (succès / échec si quantité insuffisante)
- [ ] A.2 agrégation : attendre les deux résultats ; CONFIRMED vs CANCELLED + compensations
- [ ] Compile + run des trois services
- [ ] B.1 happy path observé (`CONFIRMED`)
- [ ] B.2 `failure-rate=1.0` → `CANCELLED` + release
- [ ] B.3 compris (parallélisme → besoin de compensation)

## Tu as compris si…

- Tu expliques en une phrase la différence **orchestration** vs **chorégraphie** dans ce POC.
- Tu sais pourquoi `payment_success` / `inventory_success` sont **nullable**.
- Tu listes quelles compensations partir quand seul le paiement échoue.
