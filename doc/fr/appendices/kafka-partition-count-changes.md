# Changer le nombre de partitions d’un topic

Complément au [Lab 1](./exercises/lab-01-keys-partitions.md) et à l’[étape 4](../TUTORIAL.md#étape-4--publier-orderscreated-et-lab-1).

## Rappel

La partition d’un message **avec clé** est en général :

```text
partition = hash(key) % nombreDePartitions
```

Si `nombreDePartitions` passe de 3 à 6, le **modulo change**.

## Ce qui se passe concrètement

| | Comportement |
|---|---|
| Messages **déjà** écrits | Restent sur leur partition d’origine. Kafka **ne réécrit pas** l’historique. |
| Messages **nouveaux** (même clé) | Recalculés avec `% nouveau N` → peuvent aller sur une **autre** partition. |
| Rejeu (`earliest`, nouveau consumer group) | Relit le log **tel quel** ; ça ne “répare” pas le mapping. |

Exemple : pour `orderId=abc`, l’historique peut être sur la partition 1, et les events suivants sur la partition 4. Un consumer assigné à une seule partition ne voit plus **toute** la séquence de cette clé.

## Problèmes que ça peut causer

1. **Ordre par clé cassé** — garantie “même clé ⇒ même partition ⇒ ordre” ne tient plus sur toute la vie du topic.
2. **Sagas / agrégation** — un service qui suppose l’ordre strict des events d’une commande peut traiter hors séquence ou manquer la continuité.
3. **Topics compactés** (“dernier état par clé”) — anciennes et nouvelles versions d’une clé peuvent vivre sur des partitions différentes ; comportement délicat.
4. **False sense of safety** — “on peut toujours rejouer” ne redistribue pas le passé.

## Comment on gère ça

| Approche | Idée |
|---|---|
| **Prévoir large au départ** | Choisir dès le début un nombre de partitions suffisant (souvent surestimé). Le resize est rare. |
| **Éviter le resize** si l’ordre par clé compte | Pour une saga `orderId`, on ne “scale” pas les partitions de `orders.created` à la légère. |
| **Nouveau topic + migration** | Créer `….v2` avec plus de partitions, dual-write ou rejeu contrôlé, basculer les consumers, déprécier l’ancien. |
| **Parallélisme autrement** | Plus d’instances dans le **même** consumer group (plafond = nombre de partitions actuel), ou découper les responsabilités sur d’autres topics. |
| **Conception résiliente** | Idempotence, versions d’events, état en base corrélé par `orderId` (pas seulement l’ordre Kafka). |

Un *custom partitioner* ne magique pas le problème : dès que `N` change, le mapping clé→partition change pour le futur.

## Pour ce POC

`orders.created` reste à **3 partitions**. Si un jour il faut plus de débit **et** garder l’ordre par `orderId`, on préférera un **nouveau topic** (ou accepter plus de consumers jusqu’à 3) plutôt qu’un `alter` du nombre de partitions sur le topic vivant.

## Voir aussi

- [Lab 1 — Clés et partitions](./exercises/lab-01-keys-partitions.md) (question B.5)
- [Architecture Kafka — l’essentiel](./architecture-kafka-essentials.md)
