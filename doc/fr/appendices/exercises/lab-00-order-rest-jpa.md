# Lab 0 — Bases order-service (REST + mapping)

Exercice de l’[étape 3 du tutoriel](../../TUTORIAL.md#étape-3--order-service-rest-jpa-flyway).  
Plus simple que le Lab 1 : tu complètes **2 méthodes Java** pour comprendre DTO ↔ entité et un `GET` par id.

Fichiers à compléter (cherche `TODO Lab 0`) :

- [`OrderResponse.java`](../../../../../backend/services/order-service/src/main/java/com/example/orders/order/api/OrderResponse.java) — `from(Order)`
- [`OrderService.java`](../../../../../backend/services/order-service/src/main/java/com/example/orders/order/api/OrderService.java) — `findById(UUID)`

Le reste (entité, repository, `POST /orders`, Flyway, config) est déjà en place pour que tu te concentres sur le mapping et la lecture.

## Prérequis

- Postgres + `order-service` (config étape 3 OK).
- Compile / run :

```bash
mvn -f backend/pom.xml -pl services/order-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/order-service spring-boot:run
# (ne pas faire: mvn -f backend/pom.xml -pl … -am spring-boot:run → erreur mainClass sur le parent)
```

---

## Partie A — À coder

### A.1 `OrderResponse.from(Order order)`

**Rôle** : transformer l’entité JPA `Order` en DTO JSON `OrderResponse` (on n’expose pas l’entité telle quelle).

À faire :

1. Mapper chaque `OrderItem` → `new ItemResponse(sku, quantity)` (stream + `map` + `toList()`).
2. Retourner `new OrderResponse(id, customerId, amount, status, createdAt, items, paymentSuccess, inventorySuccess)` (les deux derniers peuvent être `null` avant la saga).
3. Utiliser les getters de `Order` / `OrderItem`.

**Indices**

- `order.getItems()` renvoie une `List<OrderItem>`.
- `ItemResponse` est un `record` imbriqué dans `OrderResponse`.
- En Java, `stream().map(...).toList()` produit une liste immuable (Java 16+).

### A.2 `OrderService.findById(UUID id)`

**Rôle** : cas d’usage métier « lire une commande » (le controller appelle déjà cette méthode).

À faire :

1. `orderRepository.findById(id)` → `Optional<Order>`.
2. Si vide → `throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");`
3. Sinon → `return OrderResponse.from(order);`

**Indices**

- `optional.orElseThrow(() -> ...)`
- `ResponseStatusException` et `HttpStatus` sont déjà importés dans la classe.
- Tu peux aussi réutiliser `getOrderOrThrow(id)` puis `OrderResponse.from(...)` — les deux sont valides.

### A.3 Vérifier

```bash
mvn -f backend/pom.xml -pl services/order-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/order-service spring-boot:run
```

<details>
<summary>Solution (si tu es bloqué)</summary>

`from` :

```java
List<ItemResponse> items = order.getItems().stream()
        .map(item -> new ItemResponse(item.getSku(), item.getQuantity()))
        .toList();
return new OrderResponse(
        order.getId(),
        order.getCustomerId(),
        order.getAmount(),
        order.getStatus(),
        order.getCreatedAt(),
        items,
        order.getPaymentSuccess(),
        order.getInventorySuccess());
```

`findById` :

```java
Order order = orderRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
return OrderResponse.from(order);
```

</details>

---

## Partie B — Observer

```bash
# Create
curl -s -X POST localhost:8081/orders -H 'content-type: application/json' \
  -d '{"customerId":"c1","items":[{"sku":"A","quantity":2}],"amount":42.5}'
echo

# List
curl -s localhost:8081/orders; echo

# By id (remplace l’UUID)
curl -s localhost:8081/orders/<id>; echo

# 404
curl -s -o /dev/null -w "%{http_code}\n" localhost:8081/orders/00000000-0000-0000-0000-000000000000
```

Swagger : http://localhost:8081/swagger-ui.html

---

## Critères de réussite

- [ ] `from` implémenté (POST/GET list marchent à nouveau)
- [ ] `findById` implémenté (`GET /orders/{id}` + 404)
- [ ] Tu sais dire en une phrase la différence **entité** vs **DTO** vs **service**
