# Lab 7 — Retries et Dead Letter Topic (DLT)

Exercice de l’[étape 8 du tutoriel](../../TUTORIAL.md#étape-8--fiabilité-labs-6-et-7).  
But : observer qu’un **poison pill** ne doit pas bloquer la partition : retries avec backoff, puis envoi vers `orders.created.DLT`.

Le boilerplate (`DefaultErrorHandler` + `DeadLetterPublishingRecoverer` + topic DLT) est **posé par l’assistant** sur payment-service et inventory-service.

## Prérequis

- Lab 6 compris (at-least-once).
- Services payment + inventory up, Kafka UI : http://localhost:8080
- Topic `orders.created.DLT` créé au démarrage (`NewTopic`).

## Contexte

| Étape | Comportement |
|---|---|
| Échec handler | `ExponentialBackOff` (retries) |
| Épuisement | `DeadLetterPublishingRecoverer` → `orders.created.DLT` |
| Sans DLT | poison pill → partition bloquée |

Deux façons de casser le traitement de `orders.created` :

### Cas A — métier (`amount` négatif)

Payment et inventory rejettent `amount.signum() < 0` (`IllegalArgumentException`).  
Le `POST /orders` REST refuse déjà `amount < 0.01` → il faut **publier à la main** sur Kafka (bypass REST).

### Cas B — désérialisation (JSON cassé)

Un payload non-JSON / schema incompatible → erreur avant le listener → même chemin error handler → DLT.

---

## Partie A — Observer (Cas A)

1. Prépare un JSON `OrderCreated` avec `"amount": -10` (reste du payload plausible : `orderId`, `customerId`, `items`, `createdAt`).
2. Produis sur `orders.created` avec clé = `orderId` (Kafka UI *Produce Message*, ou `kafka-console-producer`).  
   Astuce type headers Jackson : si la deser échoue, passe au Cas B ou copie les headers d’un message sain depuis Kafka UI.
3. Regarde les logs payment / inventory : plusieurs tentatives avec backoff.
4. Kafka UI → topic **`orders.created.DLT`** : le message y apparaît.
5. Le reste du topic `orders.created` continue d’être consommé (pas de blocage de partition).

## Partie B — Observer (Cas B, optionnel)

1. Produis `not-json` sur `orders.created`.
2. Même observation : retries puis DLT (selon config deser / error handler).

## Partie C — Rejeu (aperçu)

1. Lis un message dans `orders.created.DLT`.
2. Corrige le payload (amount positif) et republie sur `orders.created` (ou consomme depuis la DLT selon ton outil).
3. Les services traitent normalement.

**Lab 7 ok** : au moins Cas A observé (retries + message dans `orders.created.DLT`) sur payment **ou** inventory (idéalement les deux groups voient le poison).
