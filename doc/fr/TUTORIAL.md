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

**À observer** : le build passe. Un `order-service` pleinement `UP` sur `/actuator/health` attendra la config Postgres (étape 3).

---

## Étape 3 : order-service (REST, JPA, Flyway)

**Concepts**

- `@RestController` + `record` DTO validé avec `@Valid`.
- **Spring Data JPA** : une interface `Repository` suffit, Spring génère l'implémentation.
- **Flyway** : migrations SQL versionnées dans `src/main/resources/db/migration` (équivalent des migrations MikroORM).
- `ddl-auto: validate` : Hibernate ne modifie jamais le schéma, Flyway en est le seul maître.
- Entité `Order` avec un statut (`PENDING`, `CONFIRMED`, `CANCELLED`).

**Commandes**

```bash
curl -X POST localhost:8081/orders -H 'content-type: application/json' \
  -d '{"customerId":"c1","items":[{"sku":"A","quantity":2}],"amount":42.5}'
curl localhost:8081/orders
# Swagger UI: http://localhost:8081/swagger-ui.html
```

---

## Étape 4 : publier `orders.created` et lab 1

**Concepts**

- `KafkaTemplate.send(topic, key, value)` : la **clé** détermine la partition (`hash(key) % nbPartitions`). Même clé => même partition => **ordre garanti pour cette clé**.
- Sérialisation : on commence en JSON (`JsonSerializer`). Piège : les type headers contiennent le nom de classe Java, ce qui casse entre services si les packages diffèrent. On y reviendra au lab 8.
- Création des topics déclarative avec des beans `NewTopic` (3 partitions).

**Lab 1 : clés et partitions**

1. Crée 10 commandes avec 2 clients différents, clé = `orderId`. Observe la répartition dans Kafka UI.
2. Envoie plusieurs événements pour la **même** commande : ils sont tous dans la même partition, dans l'ordre.
3. Retire la clé (envoi `null`) : les messages d'une même commande se dispersent, donc l'ordre n'est plus garanti.
4. Question à te poser : que se passe-t-il si on augmente le nombre de partitions d'un topic existant ? (le mapping clé -> partition change)

---

## Étape 5 : payment-service et lab 2

**Concepts**

- `@KafkaListener(topics = "orders.created", groupId = "payment-service")`.
- **Consumer group** : les partitions d'un topic sont réparties entre les membres du groupe. Un message n'est traité que par UN membre du groupe, mais chaque groupe distinct reçoit TOUS les messages.
- **Rebalance** : quand un consumer arrive/part, les partitions sont réassignées (pause brève de la consommation).
- Le nombre max de consumers actifs dans un groupe = nombre de partitions.
- Le service publie `payments.processed` avec un taux d'échec configurable (`payment.failure-rate`).

**Lab 2 : consumer groups**

```bash
# Start a second instance of payment-service on another port, then watch Kafka UI:
mvn -pl payment-service spring-boot:run -Dspring-boot.run.arguments=--server.port=8083
```

1. Avec 1 instance : elle possède les 3 partitions.
2. Démarre une 2e instance : observe le rebalance et la nouvelle répartition (par exemple 2 + 1).
3. Tue une instance : ses partitions repassent à l'autre.
4. Lance un 4e consumer dans le même groupe : il reste inactif (3 partitions seulement).
5. Ajoute un listener avec un autre `groupId` : il reçoit tous les messages. C'est la différence entre file de travail et pub/sub.

---

## Étape 6 : inventory-service et saga complète

**Concepts**

- Choréographie : `order-service` consomme `payments.processed` et `inventory.reserved`, agrège les deux résultats et décide `CONFIRMED` ou `CANCELLED`.
- Compensation : si un seul des deux échoue, on émet un événement de compensation (`PaymentRefundRequested` ou `InventoryReleaseRequested`).
- Corrélation : toutes les étapes partagent `orderId` (c'est aussi la clé Kafka).
- État de saga stocké en base côté `order-service`.

**À observer** : une commande avec stock suffisant et paiement OK passe en `CONFIRMED`. Force un échec de paiement (`payment.failure-rate=1.0`) : la commande passe en `CANCELLED` et le stock réservé est relâché.

---

## Étape 7 : fiabilité (labs 3 et 4)

**Concepts**

- **Offsets et commits** : un consumer enregistre sa position (offset commité). Si le service tombe après avoir traité mais avant de committer, le message est **rejoué** => livraison **at-least-once**.
- Donc les consumers doivent être **idempotents** : table `processed_events(event_id)` ou contrainte unique métier.
- `enable.auto.commit=false` + `AckMode.MANUAL` (ou le mode par défaut de Spring Kafka, `BATCH`) : on contrôle quand committer.
- **Erreurs** : `DefaultErrorHandler` + `ExponentialBackOff`, puis `DeadLetterPublishingRecoverer` vers `<topic>.DLT`. `@RetryableTopic` crée des topics de retry intermédiaires.
- **Poison pill** : un message qui fait planter le consumer à chaque tentative et bloque la partition s'il n'y a pas de DLT.

**Lab 3 : at-least-once**

1. Ajoute un `Thread.sleep` + un `System.exit` après le traitement et avant le commit.
2. Relance : le message est retraité. Sans idempotence, double paiement. Avec la table `processed_events`, le doublon est ignoré.

**Lab 4 : retries et DLT**

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

- Pièges des type headers JSON entre services, `JsonDeserializer.TRUSTED_PACKAGES`.
- Bonus : Avro + Schema Registry, évolution de schéma compatible.

**Bonus : multi-broker**

- Cluster à 3 brokers, `replication.factor=3`, `min.insync.replicas=2`, tuer un broker et observer l'élection de leader.

---

## Commandes utiles

```bash
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
