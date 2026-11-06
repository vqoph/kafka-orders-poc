# Tutoriel : saga de commandes avec Java, Spring Boot et Kafka

Objectif : comprendre Kafka (et ses subtilités) en construisant un petit système de microservices, avec le bagage NestJS/TS que tu as déjà.

## Règles du jeu (mode tuto)

- **Tu lances toutes les commandes** (terminal WSL, dans ce dossier). Je ne lance rien à ta place.
- **Je t'explique avant de coder** : à chaque étape, tu as d'abord le "pourquoi", ensuite les commandes, ensuite ce que tu dois observer.
- **Répartition du code** :
  - Boilerplate (pom.xml, Dockerfile, config) : je l'écris et je te l'explique ligne utile par ligne utile.
  - Code Kafka (producers, consumers, gestion d'erreurs) : je te l'explique d'abord, puis on l'écrit ensemble. Tu peux le retaper toi-même ou me dire "écris-le" et tu le relis.
  - Labs : tu manipules, tu observes dans Kafka UI, et tu me dis ce que tu as compris.
- Après chaque étape, tu me dis "étape N ok" (ou colles l'erreur) et on passe à la suite.
- Code et commentaires en anglais, explications en français.
- Je ne lance jamais `npm run dev/start/build` ; c'est toi.

## Le projet en une image

```
Browser / microfronts --REST/SSE--> order / payment / inventory / notification
                                         |
                    order-service --outbox--> Kafka: orders.created
                                                      |
                              +-----------------------+-----------------------+
                              v                                               v
                       payment-service                               inventory-service
                              |                                               |
                       payments.processed                            inventory.reserved
                              +-----------------------+-----------------------+
                                                      v
                                              order-service (saga)
                                                      |
                                                orders.status
                                                      v
                                          notification-service --SSE--> UI
```

- Topics : 3 partitions, clé de message = `orderId`.
- Saga en chorégraphie : pas de chef d'orchestre, chaque service réagit aux événements des autres.
- Compensation : paiement OK + stock KO (ou l'inverse) => annulation + remboursement / libération du stock.

## Stack

- Java 21 LTS, **Spring Boot 4.1.2**, Maven multi-module sous `**backend/`\*\*.
- Modules partagés : `libs/events` (contrats Kafka ≈ `ts-shared`) et `libs/web` (pagination Spring commune : `Pageable` + sérialisation `VIA_DTO` / `PagedModel`).
- Spring Kafka, Spring Web, Spring Data JPA, Flyway, springdoc-openapi, Actuator.
- Sérialisation Kafka : `JacksonJsonSerializer` / `JacksonJsonDeserializer` (Jackson **3**, Boot 4 — pas les `Json`\* Jackson 2).
- Kafka en KRaft (image `apache/kafka`, pas de Zookeeper) + Kafka UI + Postgres (une base par service).
- Front (hors parcours Kafka) : microfrontends sous `frontend/` (shell + remotes, ports 5000–5004), OpenAPI → RTK Query.
- Scripts racine : `./scripts/backend-run.sh`, `./scripts/frontend-dev.sh`.
- Tests : JUnit 5 + Testcontainers (peu, ciblés).

## Architecture repo (état actuel)

```text
kafka-orders-poc/
  backend/
    pom.xml                 # parent multi-module
    libs/events/            # records d'événements partagés
    libs/web/               # auto-config pagination / helpers web
    services/order-service/      # :8081
    services/payment-service/    # :8082
    services/inventory-service/  # :8085
    services/notification-service/ # :8084 SSE
  frontend/                 # shell + remotes (hors parcours étapes 0–7)
  docker-compose.yml
  docker/postgres/init/     # CREATE DATABASE orders|payments|inventory
  scripts/backend-run.sh
  scripts/frontend-dev.sh
  doc/fr/                   # ce tutoriel + labs
```

Maven : toujours depuis la racine du repo avec `**-f backend/pom.xml**`.  
Raccourci run : `./scripts/backend-run.sh` (tous) ou `./scripts/backend-run.sh order-service`.

## Correspondances NestJS vers Spring

- `@Controller` / `@Injectable` / `Module` : `@RestController` / `@Service` / `@Component` / `@Configuration`.
- class-validator DTO : Jakarta Validation (`@Valid`, `@NotNull`) sur des `record`.
- MikroORM + migrations : Spring Data JPA (Hibernate) + Flyway.
- `@nestjs/config` : `application.yml` + profils + `@ConfigurationProperties`.
- `@nestjs/swagger` : springdoc-openapi.
- `@EventPattern` / transport Kafka de Nest : `@KafkaListener`.
- Jest : JUnit 5 + Mockito + Testcontainers.
- `ts-shared` : module Maven `backend/libs/events`.
- `npm` / `package.json` : Maven / `backend/pom.xml` (deps dans `~/.m2`).

---

## Progression

Suivi personnel dans [TODO.md](./TODO.md) (ignoré par git). Point de départ versionné : [TODO.md.sample](./TODO.md.sample).

Complément hors parcours : [Architecture Kafka — l'essentiel](./appendices/architecture-kafka-essentials.md) (vue d'ensemble producers / topics / brokers / consumer groups / KRaft). Voir aussi [Appendices](./appendices/README.md).

```bash
cp doc/fr/TODO.md.sample doc/fr/TODO.md
```

---

## Étape 0 : environnement WSL

```bash
# Install SDKMAN (manages JDK and Maven versions, like nvm for Node)
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# List available Java 21 builds, then install a Temurin 21 one
sdk list java | grep -E "21\..*-tem"
sdk install java <the-21.x-tem-identifier-you-picked>
sdk install maven

# Node 26 / npm 11 through nvm (skip if already installed)
nvm install 26
nvm use 26

# Check everything
java -version
mvn -v
node -v
npm -v
docker version
docker compose version
```

**À observer** : `java -version` affiche 21, `node -v` affiche 26.x, `docker version` répond côté client ET serveur. Si le serveur ne répond pas, le daemon n'est pas démarré (`sudo dockerd` dans un autre terminal, ou le service Docker de ton WSL).

**Point Java** : un JDK = compilateur + JVM. Maven est l'outil de build (équivalent de `npm` + scripts) ; `pom.xml` = `package.json`.

---

## Étape 1 : infra Docker et premier message

**Concepts avant de coder**

Pour le vocabulaire et le schéma d'ensemble (avant de manipuler) : [Architecture Kafka — l'essentiel](./appendices/architecture-kafka-essentials.md).

- Un **broker** Kafka stocke des messages dans des **topics**. Un topic est découpé en **partitions** (des logs append-only, ordonnés).
- Un message = clé + valeur + headers + timestamp. Chaque message d'une partition a un **offset** (sa position).
- **KRaft** : Kafka gère lui-même son quorum de métadonnées, il n'y a plus de Zookeeper.
- Piège classique : les **advertised listeners**. Le broker dit aux clients "reconnecte-toi sur cette adresse". Depuis un conteneur c'est `kafka:9092`, depuis ton WSL c'est `localhost:29092`. Si ça ne colle pas, la connexion initiale marche mais les produce/consume échouent.

**Ce qu'on crée** : `docker-compose.yml` avec `kafka` (KRaft, deux listeners), `kafka-ui`, `postgres` (avec un script d'init qui crée une base par service).

**Commandes (tu les lances)**

```bash
docker compose up -d
docker compose ps

# Kafka UI: http://localhost:8080
# Create a topic by hand and look at it
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka:9092 --create --topic hello --partitions 3 --replication-factor 1

docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka:9092 --describe --topic hello

# Terminal A: producer (type lines, each Enter = one message)
docker compose exec -it kafka /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server kafka:9092 --topic hello

# Terminal B: consumer
docker compose exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 --topic hello --from-beginning
```

**À observer** : tes lignes tapées dans A apparaissent dans B, et dans Kafka UI tu vois les 3 partitions et la répartition des messages. Sans clé, les messages sont répartis entre partitions.

---

## Étape 2 : squelette Maven multi-module

**Concepts**

- **Layout groupé** (proche Nest `apps/` + `libs/`), sous `backend/` — voir [Architecture repo](#architecture-repo-état-actuel).
- **Parent pom** : versions et dépendances communes (équivalent d'un `package.json` racine avec workspaces).
- **Spring Boot BOM** (`spring-boot-starter-parent` **4.1.2**) : on ne précise pas les versions des libs Spring.
- `**backend/libs/events**` : records partagés (`OrderCreated`, `PaymentProcessed`, …).
- `**backend/libs/web**` (ajouté plus tard) : helpers web partagés (pagination `Pageable` + `pageSerializationMode = VIA_DTO` → JSON stable `{ content, page }` côté order-service).
- Un `record` Java = classe immuable avec getters/equals/hashCode générés (proche d'un type TS `readonly`).

**Ordre recommandé** : parent → `libs/events` → générer les services (CLI) → rattacher chaque service au parent → (plus tard) `libs/web`.  
`spring init` produit toujours un projet autonome (parent = `spring-boot-starter-parent`) : le reparenting est normal.

> start.spring.io n'accepte plus Spring Boot 3.5.x (compatibilité ≥ 4.0). On fige **4.1.2**.

### 2.1 Parent `backend/pom.xml`

`packaging=pom` : agrégateur seulement (pas de jar). Il hérite de `spring-boot-starter-parent` **4.1.2**, fixe `java.version=21`, et déclare les `<modules>` (`libs/events`, `libs/web`, les 4 services).

### 2.2 Module `backend/libs/events`

Jar simple (pas d'app Spring, pas de `spring-boot-maven-plugin`). Son `<parent>` pointe vers `../../pom.xml` (le parent sous `backend/`). Package placeholder : `com.example.orders.events`.

### 2.3 Générer les services (Spring Boot CLI)

**Prérequis** : `sdk install springboot` (une fois). Vérifier : `spring version`.

Maven obligatoire (`--build=maven` : le défaut CLI est Gradle).

```bash
mkdir -p backend/services backend/libs

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=order-service --name=order-service \
  --package-name=com.example.orders.order \
  --dependencies=web,data-jpa,flyway,postgresql,validation,actuator,kafka \
  --extract backend/services/order-service

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=payment-service --name=payment-service \
  --package-name=com.example.orders.payment \
  --dependencies=web,data-jpa,flyway,postgresql,validation,actuator,kafka \
  --extract backend/services/payment-service

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=inventory-service --name=inventory-service \
  --package-name=com.example.orders.inventory \
  --dependencies=web,data-jpa,flyway,postgresql,validation,actuator,kafka \
  --extract backend/services/inventory-service

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=notification-service --name=notification-service \
  --package-name=com.example.orders.notification \
  --dependencies=web,actuator,kafka \
  --extract backend/services/notification-service
```

### 2.4 Rattacher chaque service au parent

Dans chaque `backend/services/*/pom.xml`, remplacer le parent Initializr par :

```xml
<parent>
  <groupId>com.example.orders</groupId>
  <artifactId>kafka-orders-poc</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <relativePath>../../pom.xml</relativePath>
</parent>
```

Puis retirer du module enfant : `groupId`, `version`, `java.version` (hérités). Garder `artifactId`, les `<dependencies>` et le `spring-boot-maven-plugin`.

### 2.5 Build

```bash
# Depuis la racine du repo
mvn -f backend/pom.xml -q -DskipTests install

# -pl = chemin du module RELATIF au pom backend (services/…, pas backend/services/…)
mvn -f backend/pom.xml -pl services/order-service spring-boot:run

# Équivalent script
./scripts/backend-run.sh order-service
# tous les services : ./scripts/backend-run.sh
```

**Piège `-am` + `spring-boot:run`** : `-am` (_also make_) rebuild bien les modules dont tu dépends (`libs/events`, …), mais Maven applique aussi la goal `run` au **parent** (`packaging=pom`, pas de `main`) → `Unable to find a suitable main class`.

```bash
# OK : installer les deps du reactor, puis run uniquement le service
mvn -f backend/pom.xml -pl services/order-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/order-service spring-boot:run

# OK aussi si events n’a pas changé (déjà dans ~/.m2)
mvn -f backend/pom.xml -pl services/order-service spring-boot:run

# KO : run propagé au parent
mvn -f backend/pom.xml -pl services/order-service -am spring-boot:run
```

**À observer** : le build passe. Un `order-service` pleinement `UP` sur `/actuator/health` attendra la config Postgres (étape 3).

---

## Étape 3 : order-service (REST, JPA, Flyway)

**Concepts**

- `@RestController` + `record` DTO validé avec `@Valid`.
- **Spring Data JPA** : une interface `Repository` suffit, Spring génère l'implémentation.
- **Flyway** : migrations SQL versionnées dans `src/main/resources/db/migration` (équivalent des migrations MikroORM).
- `ddl-auto: validate` : Hibernate ne modifie jamais le schéma, Flyway en est le seul maître.
- Entité `Order` avec un statut (`PENDING`, `CONFIRMED`, `CANCELLED`).

### Qui fait quoi (classes)

| Classe                   | Rôle (Nest approx.)                                                        |
| ------------------------ | -------------------------------------------------------------------------- |
| `domain/Order`           | **Entité** JPA — modèle DB (`@Entity`), pas le JSON HTTP                   |
| `domain/OrderRepository` | **Repository** — interface ; Spring génère `save` / `findAll` / `findById` |
| `api/CreateOrderRequest` | **DTO entrée** — body JSON + validation (`@Valid`)                         |
| `api/OrderResponse`      | **DTO sortie** — JSON renvoyé au client (`from(Order)` à coder au Lab 0)   |
| `api/OrderService`       | **Service** — cas d’usage (`@Service`, comme `@Injectable`)                |
| `api/OrderController`    | **Controller** REST — routes HTTP minces (`@RestController`)               |

Les commentaires Javadoc en tête de ces classes répètent ce découpage dans le code.

### Config + migration (déjà posés)

- `application.yml` : port 8081, datasource `orders`, `ddl-auto: validate`
- `V1__create_orders.sql` : tables `orders` / `order_items`

### Exercice (à coder — simple)

**Lab 0** : [Bases order-service (REST + mapping)](./appendices/exercises/lab-00-order-rest-jpa.md)

Tu implémentes `OrderResponse.from` et `OrderService.findById` (`TODO Lab 0`). Le `GET /orders/{id}` est déjà branché dans le controller.

**Commandes (après le lab)**

```bash
curl -X POST localhost:8081/orders -H 'content-type: application/json' \
  -d '{"customerId":"c1","items":[{"sku":"A","quantity":2}],"amount":42.5}'
curl localhost:8081/orders
curl localhost:8081/orders/<id>
# Swagger UI: http://localhost:8081/swagger-ui.html
```

**Étape 3 ok** : Lab 0 fait ; POST + list + getById OK.

---

## Étape 4 : publier `orders.created` et lab 1

**Concepts**

- `KafkaTemplate.send(topic, key, value)` : la **clé** détermine la partition (`hash(key) % nbPartitions`). Même clé => même partition => **ordre garanti pour cette clé**.
- Sérialisation : JSON (`JacksonJsonSerializer`, Boot 4 / Jackson 3). Piège : les type headers portent le nom de classe Java (casse entre services si les packages diffèrent) — détail au lab 8.
- Topics créés en code via beans `NewTopic` (ici 3 partitions). Auto-create est désactivé dans Docker Compose.
- Dual-write simple : `save` en base puis `send` Kafka (pas atomique). L’outbox vient à l’étape 11.

### 4.1 Contrat `OrderCreated` (`backend/libs/events`)

Record partagé = contrat entre services (comme un type dans `ts-shared`).

### 4.2 Dépendance + config producer

`order-service` dépend du module `events`. Dans `application.yml` : bootstrap `localhost:29092`, serializers JSON / String.

### 4.3 `NewTopic` + `OrderEventPublisher`

Bean `orders.created` (3 partitions, RF 1).  
Publisher : `KafkaTemplate<String, OrderCreated>` (typage strict) + `toEvent(Order)` pour ne jamais publier l’entité JPA.  
`Object` comme type de valeur compilerait un mauvais `send(..., order)` — à éviter.

### 4.4 Publish après `save`

Dans `OrderService.create` : après `orderRepository.save`, publier avec **clé = `orderId`**.

### 4.5 Endpoint lab + exercice (à coder)

Squelette avec `TODO Lab 1` :

- `OrderEventPublisher.publishOrderCreatedWithKey` (même pattern que le prod : `toEvent` + `send` + log)
- `KafkaLabController.resolveKey` + enum imbriqué `KeyMode` (`ORDER_ID` / `NONE`)

Endpoint : `POST /labs/kafka/orders/{id}/republish?keyMode=ORDER_ID|NONE`  
(Spring bind le query param sur le **nom** de la constante d’enum.)

**Exercice** : [Lab 1 — Clés et partitions](./appendices/exercises/lab-01-keys-partitions.md)  
→ Partie A = Java ; Partie B = Kafka UI.

**Smoke prod (sans le lab)** — le create publie déjà avec clé = `orderId` :

```bash
# Voir étape 2.5 : ne pas combiner -am avec spring-boot:run
mvn -f backend/pom.xml -pl services/order-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/order-service spring-boot:run

curl -X POST localhost:8081/orders -H 'content-type: application/json' \
  -d '{"customerId":"c1","items":[{"sku":"A","quantity":2}],"amount":42.5}'
```

**Étape 4 ok** : smoke OK + Lab 1 partie A (code) + partie B (observations + question).

Annexe utile après la question B.5 : [Changer le nombre de partitions](./appendices/kafka-partition-count-changes.md).

---

## Étape 5 : payment-service et lab 2

Premier **consumer** Spring Kafka du parcours : on réagit à `orders.created`, on décide succès/échec (taux configurable), et on publie `payments.processed`.  
Le Lab 2 te fait **voir** les consumer groups (répartition, rebalance, idle, second groupe).

**Concepts**

- `@KafkaListener(topics = "orders.created", groupId = "payment-service")` ≈ `@EventPattern` Nest, mais le `**groupId**` est explicite et central.
- **Consumer group** : les partitions d’un topic sont réparties entre les **membres** du groupe. Un message n’est traité que par **un** membre du groupe ; chaque **groupe distinct** reçoit **tous** les messages (file de travail vs pub/sub).
- **Rebalance** : arrivée / départ d’un membre → réassignation des partitions (pause brève).
- Max consumers **actifs** dans un groupe ≈ nombre de **partitions** (ici 3). Au-delà : membres **idle**.
- Le service publie `payments.processed` avec `payment.failure-rate` (ex. `0.2` = ~20 % d’échecs simulés).

### Qui fait quoi (Nest → Spring)

| Nest (approx.)                                  | Spring Kafka                                                    |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `@EventPattern('orders.created')`               | `@KafkaListener(topics = "orders.created", groupId = "…")`      |
| `ClientKafka` / emit                            | `KafkaTemplate.send(topic, key, value)`                         |
| transport `groupId` dans la config microservice | `groupId` sur le listener (ou `spring.kafka.consumer.group-id`) |
| type partagé `ts-shared`                        | record `PaymentProcessed` dans `backend/libs/events`            |

### 5.1 Contrat `PaymentProcessed` (`backend/libs/events`)

Record partagé = contrat entre services (comme `OrderCreated`).

Chemin cible : `backend/libs/events/src/main/java/com/example/orders/events/PaymentProcessed.java`

```java
public record PaymentProcessed(
        UUID orderId,
        BigDecimal amount,
        boolean success,
        Instant processedAt
) {}
```

Topic : `payments.processed`. Clé Kafka recommandée : `**orderId**` (ordre par commande, comme à l’étape 4).

### 5.2 Dépendance + config (boilerplate — assistant)

À poser / expliquer avant le lab (tu ne codes pas ça dans le Lab 2) :

- dépendance Maven `events` dans `backend/services/payment-service/pom.xml`
- `application.yml` : port **8082**, datasource `**jdbc:…/payments`**, Kafka bootstrap `**localhost:29092\*\*`, consumer + producer JSON, propriété `payment.failure-rate`
- Flyway `V1__create_payments.sql` + entité `Payment` / `PaymentRepository` (même dual-write DB→Kafka que order-service)
- `KafkaTopics` + `KafkaTopicsConfig` : bean `NewTopic` pour `payments.processed` (**3 partitions**, RF 1)
- `PaymentService` (décide → persist → publish), `PaymentEventPublisher`, listener `@KafkaListener` mince

### 5.3 Décision mock (point clef — toi)

Corps métier laissé au reader (`TODO Lab 2`) :

1. Implémenter `PaymentDecision.decideSuccess()` à partir de `payment.failure-rate`.
2. Relire le flux : `OrderCreated` → save `payments` → `PaymentProcessed` avec **clé = `orderId`**.

Détail et indices : Lab 2 partie A.

### 5.4 Exercice (à coder + observer)

**Exercice** : [Lab 2 — Consumer groups](./appendices/exercises/lab-02-consumer-groups.md)  
→ Partie A = Java (`decideSuccess`) ; Partie B = Kafka UI / `kafka-consumer-groups.sh`.

**Lancer (chemin Maven correct)** — jamais `mvn -f backend/pom.xml -pl payment-service` seul (module introuvable depuis la racine) :

```bash
# Voir étape 2.5 : ne pas combiner -am avec spring-boot:run
mvn -f backend/pom.xml -pl services/payment-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/payment-service spring-boot:run
```

2ᵉ instance pour le lab (port **8083**) :

```bash
mvn -f backend/pom.xml -pl services/payment-service spring-boot:run \
  -Dspring-boot.run.arguments=--server.port=8083
```

**Smoke** (order-service déjà up, Lab 1 OK) : `POST /orders` → logs payment-service + message dans `payments.processed` (Kafka UI).

**À observer (aperçu — détail dans le lab)**

1. 1 instance → les **3** partitions du topic consommé.
2. 2ᵉ instance (8083) → **rebalance** (ex. 2 + 1).
3. Tuer une instance → reprise par l’autre.
4. 4ᵉ consumer **même** `groupId` → **idle**.
5. Autre `groupId` → reçoit **tous** les messages (pub/sub vs file).

**Étape 5 ok** : smoke OK + Lab 2 partie A (code) + partie B (observations consumer groups).

Complément : [Architecture Kafka — consumer group](./appendices/architecture-kafka-essentials.md#consumer-group).

---

## Étape 6 : inventory-service et saga (chorégraphie)

Payment et inventory réagissent **en parallèle** à `orders.created`.  
`order-service` **agrège** les deux résultats et tranche `CONFIRMED` / `CANCELLED`, avec **compensations** si une branche a réussi et l’autre non.  
Le Lab 3 te fait **coder** la règle de réservation + l’agrégation, puis **observer** happy path et échec paiement.

**Concepts**

- **Choréographie** : pas d’orchestrateur central qui appelle les services ; chacun écoute des topics et publie. Ici `order-service` ne fait qu’**agréger** les faits (`payments.processed`, `inventory.reserved`).
- **Compensation** : annuler un effet déjà réussi (`payments.refund.requested`, `inventory.release.requested`) quand la saga échoue.
- **Corrélation** : partout la même clé Kafka = `**orderId`\*\*.
- **État de saga** en base côté `order-service` (colonnes `payment_success` / `inventory_success` nullable : `NULL` = pas encore reçu).
- Sérialisation Boot 4 : `JacksonJsonSerializer` / `JacksonJsonDeserializer` (pas les `Json*` Jackson 2 dépréciés).

### Qui fait quoi

| Rôle               | Service           | Topics                                                                                 |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------- |
| Publie la commande | order-service     | `orders.created`                                                                       |
| Paiement           | payment-service   | in `orders.created` → out `payments.processed` ; in `payments.refund.requested`        |
| Stock              | inventory-service | in `orders.created` → out `inventory.reserved` ; in `inventory.release.requested`      |
| Cerveau saga       | order-service     | in `payments.processed` + `inventory.reserved` → out `orders.status` (+ compensations) |

### 6.1 Contrats événements (`backend/libs/events` — boilerplate)

Records partagés (chemins sous `backend/libs/events/.../events/`) :

```java
public record InventoryReserved(UUID orderId, boolean success, Instant reservedAt) {}

public record PaymentRefundRequested(UUID orderId, BigDecimal amount, Instant requestedAt) {}

public record InventoryReleaseRequested(UUID orderId, Instant requestedAt) {}

public record OrderStatusChanged(UUID orderId, String status, Instant changedAt) {}
```

(`status` = nom de l’enum `PENDING` / `CONFIRMED` / `CANCELLED`, string pour garder le module `events` sans dépendance JPA.)

### 6.2 inventory-service (boilerplate — assistant)

À poser avant le lab (tu ne recodes pas le câblage Kafka) :

- dépendance Maven `events` ; port **8085** ; datasource `**jdbc:…/inventory`** ; Kafka `**localhost:29092\*_`;`JacksonJson_`
- Flyway : `stock(sku, quantity)` + `reservations(...)` ; seed SKU `**A**`
- Topics `NewTopic` : `inventory.reserved`, `inventory.release.requested` (**3 partitions**)
- Listener mince `orders.created` → réserve → persist → publish `InventoryReserved` (clé = `orderId`)
- Listener `inventory.release.requested` → remet le stock (compensation)
- `inventory.failure-rate` (yml) + `**PUT /chaos/failure-rate**` pour changer le taux **sans** redémarrer

### 6.3 payment-service — compensation + chaos (boilerplate)

- Topic / listener `payments.refund.requested` : marque le paiement remboursé (`refunded_at`).
- Même idée chaos : `payment.failure-rate` + `**PUT http://localhost:8082/chaos/failure-rate**`.

### 6.4 order-service — état saga (boilerplate + Lab 3)

Boilerplate :

- Flyway `V2__saga_state.sql` : `payment_success` / `inventory_success` nullable sur `orders`
- Listeners `payments.processed` + `inventory.reserved` (`groupId=order-service`)
- `SagaEventPublisher` : `orders.status` + compensations
- Garde-fou terminal : ignorer si déjà `CONFIRMED` / `CANCELLED`
- **Reject HTTP 400** si le `POST /orders` contient le **même SKU sur plusieurs lignes** (PK `(order_id, sku)` ; merge qty = variante UX panier, non retenue ici)
- Liste paginée via `libs/web` (`Pageable` sur `GET /orders`, réponse `PagedModel` via `VIA_DTO`)

**À coder (Lab 3)** — chemins :

1. [`InventoryReservation.reserve`](../../backend/services/inventory-service/src/main/java/com/example/orders/inventory/InventoryReservation.java) — stock / merge défensif par SKU / `failureRate`
2. [`SagaService.tryComplete`](../../backend/services/order-service/src/main/java/com/example/orders/order/saga/SagaService.java) — agrégation (`hasBothSagaResults` / `hasBothSagaSuccess` + compensations)

### 6.5 Exercice (à coder + observer)

**Exercice** : [Lab 3 — Saga chorégraphiée](./appendices/exercises/lab-03-saga-choreography.md)  
→ Partie A = Java ; Partie B = smoke happy path + échec paiement (chaos).

**Lancer** (jamais `-am` avec `spring-boot:run`) :

```bash
mvn -f backend/pom.xml -pl services/order-service,services/payment-service,services/inventory-service -am -DskipTests install

# Option A — trois terminaux
mvn -f backend/pom.xml -pl services/order-service spring-boot:run
mvn -f backend/pom.xml -pl services/payment-service spring-boot:run
mvn -f backend/pom.xml -pl services/inventory-service spring-boot:run

# Option B — script (lance aussi notification :8084)
./scripts/backend-run.sh
```

**Smoke (aperçu)** : `POST /orders` SKU `A` → `GET` → `CONFIRMED`.  
Chaos paiement sans restart :

```bash
curl -s -X PUT localhost:8082/chaos/failure-rate -H 'content-type: application/json' -d '{"rate":1.0}'
```

Nouvelle commande → `CANCELLED` + `inventory.release.requested`.

**Étape 6 ok** : Lab 3 A + B (happy path + compensation après échec paiement).

---

## Étape 7 : fiabilité (labs 4 et 5)

**Concepts**

- **Offsets et commits** : un consumer enregistre sa position (offset commité). Si le service tombe après avoir traité mais avant de committer, le message est **rejoué** => livraison **at-least-once**.
- Donc les consumers doivent être **idempotents** : table `processed_events(event_id)` ou contrainte unique métier.
- `enable.auto.commit=false` + `AckMode.MANUAL` (ou le mode par défaut de Spring Kafka, `BATCH`) : on contrôle quand committer.
- **Erreurs** : `DefaultErrorHandler` + `ExponentialBackOff`, puis `DeadLetterPublishingRecoverer` vers `<topic>.DLT`. `@RetryableTopic` crée des topics de retry intermédiaires.
- **Poison pill** : un message qui fait planter le consumer à chaque tentative et bloque la partition s'il n'y a pas de DLT.

**Lab 4 : at-least-once**

1. Ajoute un `Thread.sleep` + un `System.exit` après le traitement et avant le commit.
2. Relance : le message est retraité. Sans idempotence, double paiement. Avec la table `processed_events`, le doublon est ignoré.

**Lab 5 : retries et DLT**

1. Envoie un message invalide (JSON cassé, ou `amount` négatif).
2. Observe les retries avec backoff dans les logs, puis le message dans `orders.created.DLT` (Kafka UI).
3. Corrige, puis rejoue le message depuis la DLT.

---

## Étape 8 : notification-service et SSE

**Concepts**

- Consumer group dédié (`notification-service`) : lit `orders.status` **sans** rejoindre le groupe `order-service` (chaque groupe reçoit tout le flux — pub/sub).
- SSE avec `SseEmitter` (connexion HTTP longue) ; CORS ouvert pour le shell front.
- Limite : connexions SSE **locales** à l’instance (pas de fan-out multi-replicas dans ce POC).

**Lancer**

```bash
mvn -f backend/pom.xml -pl services/notification-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/notification-service spring-boot:run
# ou : ./scripts/backend-run.sh notification-service
```

```bash
curl -N localhost:8084/notifications/stream
```

Crée une commande (`POST localhost:8081/orders`) dans un autre terminal : l’événement de statut apparaît dans le flux.

---

## Étape 9 : UI microfrontends (hors parcours Kafka)

Pas une app Next monolithique : shell + remotes sous `frontend/` (Module Federation), i18n, clients **générés** depuis OpenAPI (springdoc → `openapi.json` → RTK Query).

```bash
./scripts/frontend-dev.sh          # shell http://localhost:5000
# optionnel, services up :
cd frontend && npm run fetch:openapi && npm run generate:api
```

Les chaos panels payment/inventory du front appellent les `PUT /chaos/failure-rate` des services.

---

## Étape 10 : tout dans Docker

**Concepts**

- Dockerfile multi-stage : étape de build Maven puis image runtime avec JRE seulement (layers Spring Boot pour de meilleurs caches).
- Image front optionnelle (hors scope pour l’instant).
- Dans le réseau Docker, les services parlent à `kafka:9092` et `postgres:5432`. Depuis ton WSL, c'est `localhost:29092`. Deux profils Spring : `local` et `docker`.
- Healthchecks + `depends_on: condition: service_healthy`.

```bash
docker compose --profile apps up --build
```

---

## Étape 11 : labs avancés

Numérotation **après** Lab 3 (saga) et Labs 4–5 (fiabilité étape 7).

**Lab 6 : dual write et outbox**

- Problème : "save en base puis `kafka.send`" n'est pas atomique. Plante entre les deux et tu perds l'événement (ou inversement).
- Solution : table `outbox` écrite dans la **même transaction** que la commande, puis un poller qui publie et marque comme envoyé. Bonus : Debezium.

**Lab 7 : config du producer**

- `acks=all`, `enable.idempotence=true`, `linger.ms`, `batch.size`, `compression.type`. Mesure l'effet sur latence/débit avec un petit générateur de charge.

**Lab 8 : rétention et rejeu**

- Nouveau consumer group avec `auto.offset.reset=earliest` : il relit tout l'historique.
- `kafka-consumer-groups.sh --reset-offsets` pour rejouer.
- Topic **compacté** (`cleanup.policy=compact`) pour garder le dernier état par clé (ex. stock).

**Lab 9 : sérialisation**

- Pièges des type headers JSON entre services, `JacksonJsonDeserializer.TRUSTED_PACKAGES`.
- Bonus : Avro + Schema Registry, évolution de schéma compatible.

**Bonus : multi-broker**

- Cluster à 3 brokers, `replication.factor=3`, `min.insync.replicas=2`, tuer un broker et observer l'élection de leader.

**Bonus : parallélisme in-process (virtual threads)**

- Exercice type “Promise.all” sans Promise : dans un service, lancer **plusieurs appels IO bloquants en parallèle** (ex. enrichir une commande : prix + promo + profil client), attendre les résultats, puis répondre.
- API : `Executors.newVirtualThreadPerTaskExecutor()` + `Future.get()` / `executor.invokeAll(...)` (Java 21). Code impératif, proche de ce qu’on écrit en sync.
- Optionnel Spring : `spring.threads.virtual.enabled=true` (Boot 3.2+) pour le serveur HTTP.
- Rappel : le parallélisme métier de _cette_ archi reste surtout Kafka (partitions / consumer groups) ; ici on ne couvre que le cas “plusieurs IO dans le même process”.

---

## Commandes utiles

```bash
# Infra
docker compose up -d
docker compose down -v

# Build backend (racine du repo)
mvn -f backend/pom.xml -DskipTests install

# Run services (jamais : -am spring-boot:run)
./scripts/backend-run.sh                         # order+payment+inventory+notification
./scripts/backend-run.sh order-service
mvn -f backend/pom.xml -pl services/order-service -am -DskipTests install
mvn -f backend/pom.xml -pl services/order-service spring-boot:run

# Front (hors parcours)
./scripts/frontend-dev.sh

# Chaos (sans restart)
curl -s localhost:8082/chaos/failure-rate
curl -s -X PUT localhost:8082/chaos/failure-rate -H 'content-type: application/json' -d '{"rate":1.0}'
curl -s -X PUT localhost:8085/chaos/failure-rate -H 'content-type: application/json' -d '{"rate":0.5}'

# Kafka
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9092 --list
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 --describe --group payment-service
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 --topic orders.created --from-beginning \
  --property print.key=true --property print.partition=true --property print.offset=true
```

## Ports prévus

| Service                  | Port      |
| ------------------------ | --------- |
| Kafka (réseau Docker)    | 9092      |
| Kafka (depuis WSL)       | 29092     |
| Kafka UI                 | 8080      |
| Postgres                 | 5432      |
| order-service            | 8081      |
| payment-service          | 8082      |
| notification-service     | 8084      |
| inventory-service        | 8085      |
| frontend shell / remotes | 5000–5004 |
