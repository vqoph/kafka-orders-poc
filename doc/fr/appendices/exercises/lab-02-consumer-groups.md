# Lab 2 — Consumer groups

Exercice de l’[étape 5 du tutoriel](../../TUTORIAL.md#étape-5--payment-service-et-lab-2).  
But : **écrire le premier consumer** Spring Kafka (écouter `orders.created`, publier `payments.processed`), puis **observer** comment un **consumer group** répartit les partitions, rebalance, et se distingue d’un second groupe (file vs pub/sub).

Fichiers à compléter une fois le boilerplate posé (cherche `TODO Lab 2`) — chemins cibles :

- `services/payment-service/src/main/java/com/example/orders/payment/kafka/OrderCreatedListener.java` — corps du `@KafkaListener`
- `services/payment-service/src/main/java/com/example/orders/payment/kafka/PaymentEventPublisher.java` — publication `PaymentProcessed` (clé = `orderId`)
- éventuellement une méthode `decideSuccess` / mapping événement (même package ou service dédié)

Contrat documenté (à créer dans `libs/events` si pas encore là) :

- `libs/events/src/main/java/com/example/orders/events/PaymentProcessed.java` — record `(orderId, amount, success, processedAt)`

Le boilerplate (pom `events`, `application.yml`, `KafkaTopics` / `KafkaTopicsConfig`, squelettes) est **posé par l’assistant** — tu te concentres sur le corps du listener et le publish.

## Prérequis

- Infra Docker up (`kafka`, `kafka-ui`, `postgres`) — base `payments` créée (init Postgres).
- Étape 4 + Lab 1 OK : `order-service` publie bien sur `orders.created` avec clé = `orderId`.
- Boilerplate payment-service en place (port **8082**, bootstrap **`localhost:29092`**, topic `payments.processed` à 3 partitions).
- Kafka UI : http://localhost:8080

## Contexte code (à lire avant de coder)

Tu es **à la fois consumer et producer** :

| Rôle | Topic | Type |
|---|---|---|
| Consumer | `orders.created` | `OrderCreated` |
| Producer | `payments.processed` | `PaymentProcessed` |

Listener typique (squelette déjà fourni — **corps** à toi) :

```java
@KafkaListener(topics = KafkaTopics.ORDERS_CREATED, groupId = "payment-service")
public void onOrderCreated(OrderCreated event) {
    // TODO Lab 2 : décider succès/échec, publier PaymentProcessed
}
```

| Élément | Rôle |
|---|---|
| `groupId = "payment-service"` | Identité du **groupe** : toutes les instances avec ce même id **partagent** les partitions |
| `OrderCreated` | Contrat entrant (`libs/events`) — pas une entité JPA |
| `PaymentProcessed` | Contrat sortant — ce qu’on publie |
| `payment.failure-rate` | Probabilité d’échec simulé (ex. `0.2`) — injectée depuis la config |

Inspire-toi du publisher de l’étape 4 : `KafkaTemplate<String, PaymentProcessed>`, `send(topic, key, event)`, log clair.  
**Clé** = `event.orderId().toString()` (même logique que `orders.created`).

Dans payment-service, `KafkaTopics` (boilerplate) expose en général **les deux** noms utiles ici : `ORDERS_CREATED` (écouter) et `PAYMENTS_PROCESSED` (publier) — le bean `NewTopic` ne crée que `payments.processed` (order-service crée déjà `orders.created`).

---

## Partie A — À coder (Java)

### A.1 Décider succès / échec

À partir de `payment.failure-rate` (double entre `0.0` et `1.0`) :

1. Tirer un aléa (`Math.random()` ou équivalent).
2. Succès si `random >= failureRate` (donc `failure-rate=0` → toujours OK ; `1.0` → toujours KO).
3. Idéalement une petite méthode `decideSuccess()` (ou équivalent) — plus facile à relire / tester.

**Indices**

- Injecte la propriété avec `@Value("${payment.failure-rate}")` ou `@ConfigurationProperties`.
- Ne hardcode pas le taux dans le listener.

### A.2 Publier `PaymentProcessed` (clé = `orderId`)

Dans `PaymentEventPublisher` (ou méthode équivalente) :

1. Construire `new PaymentProcessed(orderId, amount, success, Instant.now())` (champs depuis `OrderCreated` + décision A.1).
2. `kafkaTemplate.send(KafkaTopics.PAYMENTS_PROCESSED, key, event)` avec **`key = orderId.toString()`**.
3. `log.info(...)` (topic, key, success).
4. Supprimer le `UnsupportedOperationException` / stub si présent.

**Indices**

- Template typé : `KafkaTemplate<String, PaymentProcessed>` (même filet de typage qu’à l’étape 4).
- N’utilise **pas** l’entité JPA d’order-service : tu n’as que l’événement Kafka.

### A.3 Corps du `@KafkaListener`

1. Recevoir `OrderCreated event`.
2. `boolean success = decideSuccess();` (ou inline équivalent).
3. Appeler le publisher avec `event` + `success`.
4. Logger au moins `orderId` + `success`.

**Indices**

- Signature simple : `void onOrderCreated(OrderCreated event)` suffit pour ce lab (pas besoin de `ConsumerRecord` tant que tu n’inspectes pas partition/offset ici — la partie B le fait via Kafka UI / CLI).
- Si le désérialiseur ne matche pas le type : vérifie le package du record et les type headers (rappel étape 4 / lab 8 plus tard).

### A.4 Compiler / relancer

```bash
mvn -pl services/payment-service -am -DskipTests install
mvn -pl services/payment-service spring-boot:run
# (ne pas combiner -am avec spring-boot:run — voir tuto §2.5)
# (ne pas faire: mvn -pl payment-service … → module introuvable)
```

`order-service` reste sur **8081** ; payment sur **8082**.

<details>
<summary>Solution (seulement si bloqué)</summary>

Exemple minimal (noms de classes / injection peuvent varier selon le boilerplate) :

```java
boolean success = Math.random() >= failureRate;
paymentEventPublisher.publish(event, success);
```

```java
PaymentProcessed processed = new PaymentProcessed(
        order.orderId(),
        order.amount(),
        success,
        Instant.now()
);
String key = order.orderId().toString();
kafkaTemplate.send(KafkaTopics.PAYMENTS_PROCESSED, key, processed);
log.info("Published {} key={} success={}", KafkaTopics.PAYMENTS_PROCESSED, key, success);
```

</details>

---

## Partie B — Observer (consumer groups)

Garde Kafka UI ouvert : http://localhost:8080  
Utile aussi en CLI (depuis la racine du repo) :

```bash
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server kafka:9092 --describe --group payment-service
```

Tu dois voir les **membres**, les **partitions assignées**, et le **lag**.

### B.1 Une instance → 3 partitions

1. Une seule instance payment-service (**8082**).
2. Crée quelques commandes :

```bash
for i in 1 2 3 4 5; do
  curl -s -X POST localhost:8081/orders -H 'content-type: application/json' \
    -d '{"customerId":"c1","items":[{"sku":"A","quantity":1}],"amount":10}'
  echo
done
```

**Observer**

- Logs : messages consommés ; `payments.processed` apparaît dans Kafka UI.
- Consumer group `payment-service` : **un** membre possède les **3** partitions de `orders.created` (souvent `0`, `1`, `2`).

**Conclure** : avec 1 consumer et 3 partitions, une seule instance lit tout.

### B.2 Deuxième instance → rebalance

Dans un **second** terminal :

```bash
mvn -pl services/payment-service spring-boot:run \
  -Dspring-boot.run.arguments=--server.port=8083
```

**Observer**

- Logs des deux process : mention de rebalance / partition revoke / assign.
- `describe --group payment-service` : **2** membres, répartition du type **2 + 1** (ou 1+1+1 si un 3ᵉ — ici 2 instances ⇒ typiquement 2 et 1).

**Conclure** : même `groupId` ⇒ les partitions sont **partagées** ; un message donné n’est traité que par **une** des deux instances.

### B.3 Tuer une instance → reprise

1. Arrête l’instance **8083** (Ctrl+C).
2. Relance le `describe` du groupe.
3. Optionnel : crée encore 1–2 commandes.

**Observer** : les partitions de l’instance tuée reviennent à **8082** (nouveau rebalance).  
**Conclure** : le groupe continue tant qu’il reste au moins un membre ; pas de message « perdu » pour le groupe (hors fenêtre de pause pendant le rebalance — on raffine aux labs fiabilité).

### B.4 Quatrième consumer → idle

Tu as déjà 3 partitions. Pour simuler « trop » de consumers :

1. Remets **2** instances (8082 + 8083) si besoin.
2. Lance une **3ᵉ** instance (ex. port `8086`) : les 3 partitions peuvent être 1+1+1.
3. Lance une **4ᵉ** (ex. port `8087`) **avec le même** `groupId=payment-service`.

**Observer** : le 4ᵉ membre est dans le groupe mais **sans partition** (idle) — il ne consomme rien tant qu’aucune partition ne se libère.  
**Conclure** : parallélisme max ≈ **nombre de partitions**. Ajouter des instances au-delà ne scale plus la consommation.

> Si tu n’as que 2 terminaux sous la main : 1 instance + console consumer Kafka avec `--group payment-service` compte aussi comme membre du groupe (outil externe). L’idée reste : **membres > partitions ⇒ idle**.

### B.5 Autre `groupId` → pub/sub

Ajoute temporairement (lab only) un second listener **dans le même process** ou une petite app / console consumer avec un **`groupId` différent** (ex. `payment-service-audit`) sur le même topic `orders.created`.

Exemple CLI (groupe distinct, lit depuis le début pour le lab) :

```bash
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server kafka:9092 \
  --topic orders.created \
  --group payment-service-audit \
  --from-beginning \
  --property print.key=true --property print.partition=true
```

Pendant ce temps, payment-service (`groupId=payment-service`) tourne toujours.

**Observer** : le groupe `payment-service-audit` reçoit **aussi** les messages (indépendamment des offsets de `payment-service`).  
**Conclure** :

- **Même** `groupId` = file de travail (concurrence entre instances).
- **Autre** `groupId` = chaque groupe a sa propre copie logique du flux (pub/sub).

### B.6 Question

> Pourquoi augmenter le nombre d’instances de `payment-service` au-delà de 3 (avec 3 partitions) ne augmente-t-il pas le débit de consommation du groupe ?

<details>
<summary>Réponse</summary>

Une partition n’est assignée qu’à **un** consumer d’un groupe donné à un instant T. Avec 3 partitions, au plus **3** consumers du groupe `payment-service` sont actifs ; les suivants restent idle. Pour plus de parallélisme **dans ce groupe**, il faudrait plus de partitions (avec les compromis vus au Lab 1 / annexe resize).

</details>

---

## Critères de réussite

- [ ] Listener : lit `OrderCreated`, décide succès/échec via `payment.failure-rate`, appelle le publisher
- [ ] Publish : `PaymentProcessed` avec **clé = orderId** sur `payments.processed`
- [ ] Compile + run OK (`mvn -pl services/payment-service …`)
- [ ] B.1–B.3 observés (1 instance, rebalance à 2, reprise après kill)
- [ ] B.4 compris (idle si membres > partitions)
- [ ] B.5 compris (autre `groupId` = flux complet)
- [ ] Question B.6 comprise

## Tu as compris si…

- Tu expliques en une phrase la différence **même groupId** vs **autre groupId**.
- Tu sais pourquoi le 4ᵉ consumer du même groupe ne traite aucun message.
- Tu relis un `describe --group payment-service` et tu y retrouves membres + partitions assignées.
