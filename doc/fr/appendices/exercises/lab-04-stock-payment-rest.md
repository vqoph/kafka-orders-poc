# Lab 4 — Liste paiements + Stock CRUD (REST)

Exercice **réparti** sur deux étapes du tutoriel (pas une étape dédiée) :

| Partie | Où dans le tuto | Service |
|--------|-----------------|---------|
| **A** — liste paiements | [Étape 5](../../TUTORIAL.md#étape-5--payment-service-et-lab-2) (après Lab 2) | payment-service |
| **B** — CRUD stock | [Étape 6](../../TUTORIAL.md#étape-6--inventory-service-et-saga-chorégraphie) (avant Lab 3 saga) | inventory-service |

But : consolider **Spring Web + JPA + validation** hors Kafka (renforce Lab 0), au moment où chaque service existe déjà.

Fichiers à compléter (cherche `TODO Lab 4`) :

**Partie A (payment)**

- [`PaymentResponse.java`](../../../../backend/services/payment-service/src/main/java/com/example/orders/payment/api/PaymentResponse.java) — `from(Payment)`
- [`PaymentService.java`](../../../../backend/services/payment-service/src/main/java/com/example/orders/payment/api/PaymentService.java) — `findAll` / `findById`

**Partie B (inventory)**

- [`StockService.java`](../../../../backend/services/inventory-service/src/main/java/com/example/orders/inventory/api/StockService.java) — `create` / `update` / `delete`

Le boilerplate (controllers, DTOs request, Flyway seeds `SKU-001` / `SKU-002` / `SKU-003`, module `libs/web` sur payment) est **posé par l’assistant**. Les `GET /stock` existants restent déjà implémentés.

## Prérequis

- Infra Docker up (`postgres` ; Kafka si tu enchaînes avec les consumers).
- Partie A : étape 5 / Lab 2 OK (`payment-service` :8082).
- Partie B : boilerplate inventory posé (étape 6.2), service :8085.

```bash
mvn -f backend/pom.xml -pl services/payment-service,services/inventory-service -am -DskipTests install
./scripts/backend-run.sh payment-service    # Partie A
./scripts/backend-run.sh inventory-service  # Partie B
```

Swagger : http://localhost:8082/swagger-ui.html · http://localhost:8085/swagger-ui.html

---

## Partie A — Liste paiements (étape 5)

### A.1 `PaymentResponse.from(Payment)`

Mapper `id`, `orderId`, `amount`, `success`, `processedAt`, `refundedAt` via les getters (même idée que Lab 0 `OrderResponse.from`).

### A.2 `PaymentService.findAll` / `findById`

- `findAll` : `paymentRepository.findAll(pageable).map(PaymentResponse::from)`.
- `findById` : `findById` → `orElseThrow` 404 → `PaymentResponse.from`.

Calque : [`OrderService`](../../../../backend/services/order-service/src/main/java/com/example/orders/order/api/OrderService.java).

### A.3 Smoke payment

Après au moins un `POST /orders` traité par payment-service :

```bash
curl -s 'localhost:8082/payments?page=0&size=8'; echo
# remplace <id>
curl -s localhost:8082/payments/<id>; echo
curl -s -o /dev/null -w "%{http_code}\n" \
  localhost:8082/payments/00000000-0000-0000-0000-000000000000
```

---

## Partie B — CRUD stock (étape 6)

À faire **avant** le Lab 3 (saga) : tu gères le catalogue que la réservation va consommer.

### B.1 `StockService.create`

1. Si `stockRepository.existsById(request.sku())` → `throw new ResponseStatusException(HttpStatus.CONFLICT, ...)`.
2. Sinon `new Stock(request.sku(), request.quantity())`, `save`, retourner `StockController.StockResponse.from(saved)`.

Helpers déjà sur l’entité : constructeur `Stock(sku, quantity)`, `setQuantity`.

### B.2 `StockService.update`

1. `findById(sku)` → 404 si absent.
2. `stock.setQuantity(request.quantity())`, `save`, retourner le DTO.

### B.3 `StockService.delete`

1. Si le SKU n’existe pas → 404.
2. Sinon `deleteById(sku)` (le controller renvoie déjà **204**).

### B.4 Smoke stock

```bash
# List seeds (SKU-001, SKU-002, SKU-003)
curl -s localhost:8085/stock; echo

# Create
curl -s -X POST localhost:8085/stock -H 'content-type: application/json' \
  -d '{"sku":"SKU-DEMO","quantity":42}'
echo

# Conflict
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:8085/stock \
  -H 'content-type: application/json' -d '{"sku":"SKU-001","quantity":1}'

# Update + delete
curl -s -X PUT localhost:8085/stock/SKU-DEMO -H 'content-type: application/json' \
  -d '{"quantity":10}'; echo
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE localhost:8085/stock/SKU-DEMO
```

<details>
<summary>Solution (si tu es bloqué)</summary>

`PaymentResponse.from` :

```java
return new PaymentResponse(
        payment.getId(),
        payment.getOrderId(),
        payment.getAmount(),
        payment.isSuccess(),
        payment.getProcessedAt(),
        payment.getRefundedAt());
```

`PaymentService.findAll` :

```java
return paymentRepository.findAll(pageable).map(PaymentResponse::from);
```

`StockService.create` :

```java
if (stockRepository.existsById(request.sku())) {
    throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + request.sku());
}
Stock saved = stockRepository.save(new Stock(request.sku(), request.quantity()));
return StockController.StockResponse.from(saved);
```

</details>

---

## Critères de réussite

**Partie A (étape 5)**

- [ ] `GET /payments` page JSON (`content` + `page` via `libs/web`)
- [ ] `GET /payments/{id}` 200 / 404

**Partie B (étape 6)**

- [ ] POST /stock 201 + 409
- [ ] PUT / DELETE 200/204 + 404

- [ ] Tu sais expliquer en une phrase la diff controller vs service vs DTO
