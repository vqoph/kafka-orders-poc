# Lab 1 — Clés Kafka et partitions

Exercice de l’[étape 4 du tutoriel](../../TUTORIAL.md#étape-4--publier-orderscreated-et-lab-1).  
But : **écrire un peu de Java** (publisher + résolution de clé), puis voir l’effet de la **clé** sur la **partition** et l’**ordre**.

Fichiers à compléter (cherche `TODO Lab 1`) :

- [`OrderEventPublisher.java`](../../../../services/order-service/src/main/java/com/example/orders/order/kafka/OrderEventPublisher.java) — `publishOrderCreatedWithKey`
- [`KafkaLabController.java`](../../../../services/order-service/src/main/java/com/example/orders/order/kafka/KafkaLabController.java) — `resolveKey`

Le chemin « prod » (`publishOrderCreated(Order)` après un `POST /orders`) est déjà branché.

## Prérequis

- Infra Docker up (`kafka`, `kafka-ui`, `postgres`).
- Lab 0 fait (`OrderResponse.from` marche — le republish lab renvoie aussi un `OrderResponse`).
- Kafka UI : http://localhost:8080

## Contexte code (à lire avant de coder)

Dans `OrderEventPublisher`, le template est déjà typé **strictement** :

```java
private final KafkaTemplate<String, OrderCreated> kafkaTemplate;
```

| Type | Rôle |
|---|---|
| `Order` | Entité JPA (base) — ne va **pas** sur Kafka |
| `OrderCreated` | Contrat d’événement (`libs/events`) — ce qu’on publie |
| `toEvent(order)` | Mapping entité → événement |

Pourquoi pas `KafkaTemplate<String, Object>` ? Avec `Object`, `send(..., order)` **compile** alors que c’est faux métier. Avec `OrderCreated`, le compilateur / linter refuse l’entité : on est forcé de passer par `toEvent`.  
Bonne pratique : **typer juste dès le départ**, élargir seulement quand plusieurs événements l’exigent.

Inspire-toi de `publishOrderCreated` (chemin prod) : même mapping, même `send`, même log — seule la **clé** change (paramètre, éventuellement `null`).

---

## Partie A — À coder (Java)

### A.1 `publishOrderCreatedWithKey(Order order, String key)`

1. `OrderCreated event = toEvent(order);` — **obligatoire** (ne passe pas `order` à `send`).
2. `kafkaTemplate.send(KafkaTopics.ORDERS_CREATED, key, event);`  
   `key` peut être `null` (lab B.4).
3. `log.info(...)` comme en prod (topic, key, orderId).
4. Supprimer le `UnsupportedOperationException`.

**Indices**

- `toEvent` est `private static` dans la **même** classe.
- Signature utile ici : `send(String topic, String key, OrderCreated data)` grâce au typage du template.
- Si tu écris `send(..., order)` et que ça ne compile pas : c’est le filet de sécurité — corrige avec `toEvent`.

### A.2 `resolveKey(Order order, KeyMode keyMode)`

Java n’a pas `"ORDER_ID" | "NONE"` comme TypeScript : on utilise un **`enum`**
(`KafkaLabController.KeyMode`, enum **imbriqué** dans le controller — acceptable pour un petit
endpoint lab ; fichier dédié si réutilisé ailleurs).

Spring convertit le query param vers l’enum **par nom de constante** :
`?keyMode=ORDER_ID` / `?keyMode=NONE` (pas `orderId` / `none`).

| `KeyMode` | Tu retournes |
|---|---|
| `ORDER_ID` | `order.getId().toString()` |
| `NONE` | `null` |

**Indices** : `return switch (keyMode) { case ORDER_ID -> ...; case NONE -> null; };`  
(exhaustif : pas besoin de `default` ; valeur HTTP invalide → 400 côté Spring).

Consignes aussi en commentaire markdown au-dessus de `resolveKey` dans le source.

### A.3 Compiler / relancer

```bash
mvn -pl services/order-service -am -DskipTests install
mvn -pl services/order-service spring-boot:run
# (ne pas combiner -am avec spring-boot:run — voir tuto §2.5)
```

<details>
<summary>Solution (seulement si bloqué)</summary>

`publishOrderCreatedWithKey` :

```java
OrderCreated event = toEvent(order);
kafkaTemplate.send(KafkaTopics.ORDERS_CREATED, key, event);
log.info("Published {} key={} orderId={}", KafkaTopics.ORDERS_CREATED, key, order.getId());
```

`resolveKey` :

```java
return switch (keyMode) {
    case ORDER_ID -> order.getId().toString();
    case NONE -> null;
};
```

</details>

---

## Partie B — Observer

### B.1 Smoke : create → clé = `orderId`

```bash
curl -s -X POST localhost:8081/orders -H 'content-type: application/json' \
  -d '{"customerId":"c1","items":[{"sku":"A","quantity":1}],"amount":10}'
echo
```

Kafka UI → `orders.created` : clé = UUID de la réponse. Payload = JSON `OrderCreated` (pas l’entité Hibernate).

### B.2 Dix commandes (clés différentes)

```bash
for i in 1 2 3 4 5; do
  curl -s -X POST localhost:8081/orders -H 'content-type: application/json' \
    -d "{\"customerId\":\"c1\",\"items\":[{\"sku\":\"A\",\"quantity\":1}],\"amount\":10}"
  echo
done

for i in 1 2 3 4 5; do
  curl -s -X POST localhost:8081/orders -H 'content-type: application/json' \
    -d "{\"customerId\":\"c2\",\"items\":[{\"sku\":\"B\",\"quantity\":1}],\"amount\":20}"
  echo
done
```

**Observer** : partitions souvent variées. Clé = `orderId`, pas `customerId`.  
**Conclure** : clés différentes ⇒ `hash(key) % 3` disperse.

### B.3 Republish `keyMode=ORDER_ID` (ton code A.1 + A.2)

```bash
ORDER_ID=<colle-ici-un-uuid>

curl -s -X POST "localhost:8081/labs/kafka/orders/${ORDER_ID}/republish?keyMode=ORDER_ID"; echo
curl -s -X POST "localhost:8081/labs/kafka/orders/${ORDER_ID}/republish?keyMode=ORDER_ID"; echo
curl -s -X POST "localhost:8081/labs/kafka/orders/${ORDER_ID}/republish?keyMode=ORDER_ID"; echo
```

**Observer** : même clé, même partition, offsets croissants.  
**Conclure** : ordre garanti **pour cette clé**.

### B.4 Republish `keyMode=NONE`

```bash
curl -s -X POST "localhost:8081/labs/kafka/orders/${ORDER_ID}/republish?keyMode=NONE"; echo
curl -s -X POST "localhost:8081/labs/kafka/orders/${ORDER_ID}/republish?keyMode=NONE"; echo
curl -s -X POST "localhost:8081/labs/kafka/orders/${ORDER_ID}/republish?keyMode=NONE"; echo
```

**Observer** : sans clé, partition non garantie.  
**Conclure** : pas d’ordre global fiable pour une même commande.

### B.5 Question

> Que se passe-t-il si on augmente le nombre de partitions d’un topic **existant** (ex. 3 → 6) ?

<details>
<summary>Réponse</summary>

Le mapping est `hash(key) % N`. Si `N` change, les messages **futurs** d’une même clé peuvent changer de partition. L’historique déjà écrit ne bouge pas. Le rejeu relit le log tel quel : il ne redistribue pas le passé.

Développement (problèmes + stratégies) : [Changer le nombre de partitions](../kafka-partition-count-changes.md).

</details>

---

## Critères de réussite

- [ ] `publishOrderCreatedWithKey` : `toEvent` + `send` + log (jamais l’entité `Order` sur le bus)
- [ ] Template compris : `KafkaTemplate<String, OrderCreated>` = filet de typage
- [ ] `resolveKey` sur `KeyMode` : `ORDER_ID` / `NONE` (switch exhaustif)
- [ ] Compile + run OK
- [ ] B.2–B.4 observés dans Kafka UI
- [ ] Question B.5 comprise
