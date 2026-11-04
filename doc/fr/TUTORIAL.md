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
Next.js (web) --REST--> order-service --outbox--> Kafka: orders.created
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
                                          notification-service --SSE--> web
```

- Topics : 3 partitions, clé de message = `orderId`.
- Saga en chorégraphie : pas de chef d'orchestre, chaque service réagit aux événements des autres.
- Compensation : paiement OK + stock KO (ou l'inverse) => annulation + remboursement / libération du stock.

## Stack

- Java 21 LTS, Spring Boot 3.5.x, Maven multi-module (le module `events` joue le rôle de `ts-shared`).
- Spring Kafka, Spring Web, Spring Data JPA, Flyway, springdoc-openapi, Actuator.
- Kafka en KRaft (image `apache/kafka`, pas de Zookeeper) + Kafka UI + Postgres (une base par service).
- Front : mêmes versions que monkeytype (Next 16, React 19, Tailwind 4, TypeScript 5.9, RTK Query + codegen OpenAPI, react-hook-form, zod). Les versions exactes seront recopiées depuis `apps/web/package.json` de monkeytype au moment de l'étape front.
- Tests : JUnit 5 + Testcontainers (peu, ciblés).

## Correspondances NestJS vers Spring

- `@Controller` / `@Injectable` / `Module` : `@RestController` / `@Service` / `@Component` / `@Configuration`.
- class-validator DTO : Jakarta Validation (`@Valid`, `@NotNull`) sur des `record`.
- MikroORM + migrations : Spring Data JPA (Hibernate) + Flyway.
- `@nestjs/config` : `application.yml` + profils + `@ConfigurationProperties`.
- `@nestjs/swagger` : springdoc-openapi.
- `@EventPattern` / transport Kafka de Nest : `@KafkaListener`.
- Jest : JUnit 5 + Mockito + Testcontainers.
- `ts-shared` : module Maven `events`.
- `npm` / `package.json` : Maven / `pom.xml` (les dépendances sont téléchargées dans `~/.m2`, pas dans un `node_modules` local).

---

## Progression

Suivi personnel dans [TODO.md](./TODO.md) (ignoré par git). Point de départ versionné : [TODO.md.sample](./TODO.md.sample).

Complément hors parcours : [Architecture Kafka — l'essentiel](./appendices/architecture-kafka-essentials.md) (vue d'ensemble producers / topics / brokers / consumer groups / KRaft). Voir aussi [Appendices](./appendices/README.md).

```bash
cp doc/fr/TODO.md.sample doc/fr/TODO.md
```

---

## Étape 0 : environnement WSL

**Pourquoi** : Docker est déjà dans ton WSL, mais il manque Java et Maven. Node 26 / npm 11 sont requis pour avoir la même toolchain que monkeytype.

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

- **Layout groupé** (proche Nest `apps/` + `libs/`) :
  ```text
  pom.xml                   # parent multi-module (à créer EN PREMIER)
  libs/events/              # contrat partagé (records d'événements)
  services/order-service/
  services/payment-service/
  services/inventory-service/
  services/notification-service/
  apps/web/                 # Next.js, étape 9
  ```
- **Parent pom** : versions et dépendances communes (équivalent d'un `package.json` racine avec workspaces + `turbo`).
- **Spring Boot BOM** (`spring-boot-starter-parent`) : on ne précise pas les versions des libs Spring, elles sont cohérentes entre elles.
- **Module** `libs/events` : records Java partagés (`OrderCreated`, `PaymentProcessed`, ...). C'est le contrat entre services.
- Un `record` Java = classe immuable avec getters/equals/hashCode générés (proche d'un type TS `readonly`).

**Ordre recommandé** : parent → `libs/events` → générer les services (CLI) → rattacher chaque service au parent.  
`spring init` produit toujours un projet autonome (parent = `spring-boot-starter-parent`) : le reparenting est normal.

> start.spring.io n'accepte plus Spring Boot 3.5.x (compatibilité ≥ 4.0). On fige **4.1.2**.

### 2.1 Parent `pom.xml` (racine)

`packaging=pom` : agrégateur seulement (pas de jar). Il hérite de `spring-boot-starter-parent` **4.1.2**, fixe `java.version=21`, et déclare les `<modules>`.

### 2.2 Module `libs/events`

Jar simple (pas d'app Spring, pas de `spring-boot-maven-plugin`). Son `<parent>` pointe vers `../../pom.xml`. Package placeholder : `com.example.orders.events`.

### 2.3 Générer les services (Spring Boot CLI)

**Prérequis** : `sdk install springboot` (une fois). Vérifier : `spring version`.

Maven obligatoire (`--build=maven` : le défaut CLI est Gradle).

```bash
mkdir -p services libs

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=order-service --name=order-service \
  --package-name=com.example.orders.order \
  --dependencies=web,data-jpa,flyway,postgresql,validation,actuator,kafka \
  --extract services/order-service

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=payment-service --name=payment-service \
  --package-name=com.example.orders.payment \
  --dependencies=web,data-jpa,flyway,postgresql,validation,actuator,kafka \
  --extract services/payment-service

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=inventory-service --name=inventory-service \
  --package-name=com.example.orders.inventory \
  --dependencies=web,data-jpa,flyway,postgresql,validation,actuator,kafka \
  --extract services/inventory-service

spring init --build=maven --boot-version=4.1.2 --java-version=21 \
  --group-id=com.example.orders --artifact-id=notification-service --name=notification-service \
  --package-name=com.example.orders.notification \
  --dependencies=web,actuator,kafka \
  --extract services/notification-service
```

### 2.4 Rattacher chaque service au parent

Dans chaque `services/*/pom.xml`, remplacer le parent Initializr par :

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
mvn -q -DskipTests install
# -pl = project list (chemin du module depuis la racine)
mvn -pl services/order-service spring-boot:run
```

**Piège `-am` + `spring-boot:run`** : `-am` (*also make*) rebuild bien les modules dont tu dépends (`libs/events`, …), mais Maven applique aussi la goal `run` au **parent** (`packaging=pom`, pas de `main`) → `Unable to find a suitable main class`.

```bash
# OK : installer les deps du reactor, puis run uniquement le service
mvn -pl services/order-service -am -DskipTests install
mvn -pl services/order-service spring-boot:run

# OK aussi si events n’a pas changé (déjà dans ~/.m2)
mvn -pl services/order-service spring-boot:run

# KO : run propagé au parent
mvn -pl services/order-service -am spring-boot:run
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

| Classe | Rôle (Nest approx.) |
|---|---|
| `domain/Order` | **Entité** JPA — modèle DB (`@Entity`), pas le JSON HTTP |
| `domain/OrderRepository` | **Repository** — interface ; Spring génère `save` / `findAll` / `findById` |
| `api/CreateOrderRequest` | **DTO entrée** — body JSON + validation (`@Valid`) |
| `api/OrderResponse` | **DTO sortie** — JSON renvoyé au client (`from(Order)` à coder au Lab 0) |
| `api/OrderService` | **Service** — cas d’usage (`@Service`, comme `@Injectable`) |
| `api/OrderController` | **Controller** REST — routes HTTP minces (`@RestController`) |

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

### 4.1 Contrat `OrderCreated` (`libs/events`)

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
mvn -pl services/order-service -am -DskipTests install
mvn -pl services/order-service spring-boot:run

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

- `@KafkaListener(topics = "orders.created", groupId = "payment-service")` ≈ `@EventPattern` Nest, mais le **`groupId`** est explicite et central.
- **Consumer group** : les partitions d’un topic sont réparties entre les **membres** du groupe. Un message n’est traité que par **un** membre du groupe ; chaque **groupe distinct** reçoit **tous** les messages (file de travail vs pub/sub).
- **Rebalance** : arrivée / départ d’un membre → réassignation des partitions (pause brève).
- Max consumers **actifs** dans un groupe ≈ nombre de **partitions** (ici 3). Au-delà : membres **idle**.
- Le service publie `payments.processed` avec `payment.failure-rate` (ex. `0.2` = ~20 % d’échecs simulés).

### Qui fait quoi (Nest → Spring)

| Nest (approx.) | Spring Kafka |
|---|---|
| `@EventPattern('orders.created')` | `@KafkaListener(topics = "orders.created", groupId = "…")` |
| `ClientKafka` / emit | `KafkaTemplate.send(topic, key, value)` |
| transport `groupId` dans la config microservice | `groupId` sur le listener (ou `spring.kafka.consumer.group-id`) |
| type partagé `ts-shared` | record `PaymentProcessed` dans `libs/events` |

### 5.1 Contrat `PaymentProcessed` (`libs/events`)

Record partagé = contrat entre services (comme `OrderCreated`).

Chemin cible : `libs/events/src/main/java/com/example/orders/events/PaymentProcessed.java`

```java
public record PaymentProcessed(
        UUID orderId,
        BigDecimal amount,
        boolean success,
        Instant processedAt
) {}
```

Topic : `payments.processed`. Clé Kafka recommandée : **`orderId`** (ordre par commande, comme à l’étape 4).

### 5.2 Dépendance + config (boilerplate — assistant)

À poser / expliquer avant le lab (tu ne codes pas ça dans le Lab 2) :

- dépendance Maven `events` dans `services/payment-service/pom.xml`
- `application.yml` : port **8082**, datasource **`jdbc:…/payments`**, Kafka bootstrap **`localhost:29092`**, consumer + producer JSON, propriété `payment.failure-rate`
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

**Lancer (chemin Maven correct)** — jamais `mvn -pl payment-service` seul (module introuvable depuis la racine) :

```bash
# Voir étape 2.5 : ne pas combiner -am avec spring-boot:run
mvn -pl services/payment-service -am -DskipTests install
mvn -pl services/payment-service spring-boot:run
```

2ᵉ instance pour le lab (port **8083**) :

```bash
mvn -pl services/payment-service spring-boot:run \
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
- **Corrélation** : partout la même clé Kafka = **`orderId`**.
- **État de saga** en base côté `order-service` (colonnes `payment_success` / `inventory_success` nullable : `NULL` = pas encore reçu).
- Sérialisation Boot 4 : `JacksonJsonSerializer` / `JacksonJsonDeserializer` (pas les `Json*` Jackson 2 dépréciés).

### Qui fait quoi

| Rôle | Service | Topics |
|---|---|---|
| Publie la commande | order-service | `orders.created` |
| Paiement | payment-service | in `orders.created` → out `payments.processed` ; in `payments.refund.requested` |
| Stock | inventory-service | in `orders.created` → out `inventory.reserved` ; in `inventory.release.requested` |
| Cerveau saga | order-service | in `payments.processed` + `inventory.reserved` → out `orders.status` (+ compensations) |

### 6.1 Contrats événements (`libs/events` — boilerplate)

Records partagés (chemins sous `libs/events/.../events/`) :

```java
public record InventoryReserved(UUID orderId, boolean success, Instant reservedAt) {}

public record PaymentRefundRequested(UUID orderId, BigDecimal amount, Instant requestedAt) {}

public record InventoryReleaseRequested(UUID orderId, Instant requestedAt) {}

public record OrderStatusChanged(UUID orderId, String status, Instant changedAt) {}
```

(`status` = nom de l’enum `PENDING` / `CONFIRMED` / `CANCELLED`, string pour garder le module `events` sans dépendance JPA.)

### 6.2 inventory-service (boilerplate — assistant)

À poser avant le lab (tu ne recodes pas le câblage Kafka) :

- dépendance Maven `events` ; port **8085** ; datasource **`jdbc:…/inventory`** ; Kafka **`localhost:29092`** ; `JacksonJson*`
- Flyway : `stock(sku, quantity)` + `reservations(...)` ; seed SKU **`A`** (quantité confortable pour les curls)
- Topics `NewTopic` : `inventory.reserved`, `inventory.release.requested` (**3 partitions**)
- Listener mince `orders.created` → service réserve → persist → publish `InventoryReserved` (clé = `orderId`)
- Listener `inventory.release.requested` → remet le stock (compensation)
- Optionnel : `inventory.failure-rate` (chaos, défaut `0.0`)

### 6.3 payment-service — compensation (boilerplate)

- Topic / listener `payments.refund.requested` : log + marque le paiement remboursé (pas de PSP réel).

### 6.4 order-service — état saga (boilerplate + Lab 3)

Boilerplate :

- Flyway `V2__saga_state.sql` : `payment_success BOOLEAN NULL`, `inventory_success BOOLEAN NULL` sur `orders`
- Listeners `payments.processed` + `inventory.reserved` (`groupId=order-service`)
- Publisher `orders.status` + publishers de compensation
- Garde-fou : si statut déjà `CONFIRMED` / `CANCELLED`, ignorer (évite double compensation ; raffiné aux labs fiabilité)

**À coder (Lab 3)** :

1. Règle de **réservation** inventory (stock suffisant → décrément + succès ; sinon échec).
2. **Agrégation** : quand les deux colonnes sont non-null → `CONFIRMED` si les deux `true`, sinon `CANCELLED` + publier la/les compensation(s) pour la branche qui avait réussi.

### 6.5 Exercice (à coder + observer)

**Exercice** : [Lab 3 — Saga chorégraphiée](./appendices/exercises/lab-03-saga-choreography.md)  
→ Partie A = Java (réservation + agrégation) ; Partie B = smoke happy path + `payment.failure-rate=1.0`.

**Lancer** (trois services ; jamais `-am` avec `spring-boot:run`) :

```bash
mvn -pl services/order-service,services/payment-service,services/inventory-service -am -DskipTests install

mvn -pl services/order-service spring-boot:run          # 8081
mvn -pl services/payment-service spring-boot:run        # 8082
mvn -pl services/inventory-service spring-boot:run      # 8085
```

**Smoke (aperçu)** : `POST /orders` avec SKU `A` → `GET` order `CONFIRMED` + messages `inventory.reserved` / `orders.status`.  
Puis payment avec `--payment.failure-rate=1.0` → nouvelle order `CANCELLED` + release stock.

**Étape 6 ok** : Lab 3 partie A + partie B (happy path + compensation après échec paiement).

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

- Consumer group dédié (`notification-service`) : il lit `orders.status` indépendamment des autres services, sans les perturber.
- SSE avec `SseEmitter` : proche de ce que tu fais avec Mercure, en plus simple (une connexion HTTP qui reste ouverte).
- Limite à connaître : l'état des connexions SSE est local à l'instance ; avec plusieurs instances, il faut un mécanisme de diffusion (ici, on reste à une instance et on en parle).

**Commande**

```bash
curl -N localhost:8084/notifications/stream
```

Crée une commande dans un autre terminal : l'événement apparaît dans le flux.

---

## Étape 9 : front Next.js

**Concepts**

- Même socle que monkeytype : Next 16 (App Router), React 19, Tailwind 4, TypeScript 5.9, RTK Query avec codegen depuis l'OpenAPI de springdoc, react-hook-form + zod.
- `rewrites` dans `next.config` vers les services Java : pas de CORS.
- `EventSource` côté client pour le live.
- Pages : création de commande, liste avec statut live, détail avec timeline d'événements, panneau "chaos" (taux d'échec du paiement, etc.).

**Commandes (toi, jamais moi)**

```bash
cd apps/web
npm install
npm run codegen   # needs order-service running (reads its /v3/api-docs)
npm run dev
```

---

## Étape 10 : tout dans Docker

**Concepts**

- Dockerfile multi-stage : étape de build Maven puis image runtime avec JRE seulement (layers Spring Boot pour de meilleurs caches).
- Image Next.js en `output: 'standalone'`.
- Dans le réseau Docker, les services parlent à `kafka:9092` et `postgres:5432`. Depuis ton WSL, c'est `localhost:29092`. Deux profils Spring : `local` et `docker`.
- Healthchecks + `depends_on: condition: service_healthy`.

```bash
docker compose --profile apps up --build
```

---

## Étape 11 : labs avancés

**Lab 5 : dual write et outbox**

- Problème : "save en base puis `kafka.send`" n'est pas atomique. Plante entre les deux et tu perds l'événement (ou inversement).
- Solution : table `outbox` écrite dans la **même transaction** que la commande, puis un poller qui publie et marque comme envoyé. Bonus : Debezium.

**Lab 6 : config du producer**

- `acks=all`, `enable.idempotence=true`, `linger.ms`, `batch.size`, `compression.type`. Mesure l'effet sur latence/débit avec un petit générateur de charge.

**Lab 7 : rétention et rejeu**

- Nouveau consumer group avec `auto.offset.reset=earliest` : il relit tout l'historique.
- `kafka-consumer-groups.sh --reset-offsets` pour rejouer.
- Topic **compacté** (`cleanup.policy=compact`) pour garder le dernier état par clé (ex. stock).

**Lab 8 : sérialisation**

- Pièges des type headers JSON entre services, `JacksonJsonDeserializer.TRUSTED_PACKAGES`.
- Bonus : Avro + Schema Registry, évolution de schéma compatible.

**Bonus : multi-broker**

- Cluster à 3 brokers, `replication.factor=3`, `min.insync.replicas=2`, tuer un broker et observer l'élection de leader.

**Bonus : parallélisme in-process (virtual threads)**

- Exercice type “Promise.all” sans Promise : dans un service, lancer **plusieurs appels IO bloquants en parallèle** (ex. enrichir une commande : prix + promo + profil client), attendre les résultats, puis répondre.
- API : `Executors.newVirtualThreadPerTaskExecutor()` + `Future.get()` / `executor.invokeAll(...)` (Java 21). Code impératif, proche de ce qu’on écrit en sync.
- Optionnel Spring : `spring.threads.virtual.enabled=true` (Boot 3.2+) pour le serveur HTTP.
- Rappel : le parallélisme métier de *cette* archi reste surtout Kafka (partitions / consumer groups) ; ici on ne couvre que le cas “plusieurs IO dans le même process”.

---

## Commandes utiles

```bash
# Run a service (never: mvn -pl … -am spring-boot:run — fails on parent pom)
mvn -pl services/order-service -am -DskipTests install
mvn -pl services/order-service spring-boot:run

# List topics
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9092 --list

# Consumer group status (members, lag)
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 --describe --group payment-service

# Read a topic with keys and partitions
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 --topic orders.created --from-beginning \
  --property print.key=true --property print.partition=true --property print.offset=true

# Reset everything (containers + volumes)
docker compose down -v
```

## Ports prévus

- Kafka : 9092 (réseau Docker), 29092 (depuis WSL)
- Kafka UI : 8080
- Postgres : 5432
- order-service : 8081
- payment-service : 8082
- inventory-service : 8085
- notification-service : 8084
- web (Next.js) : 3000
