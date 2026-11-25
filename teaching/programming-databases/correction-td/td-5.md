---
layout: page
title: Correction de TD – TD 5
# Keeps "Teaching" highlighted in the menu on this page
parent: /teaching.html
---

[← Back to Correction de TD]({{ '/teaching/programming-databases/correction-td.html' | relative_url }})

# TD de Bases de Données : corrections des exercices 1 et 2

*Auteurs des corrections : Liliana Ibanescu, Juliette Dibie-Barthélemy, Cristina Manfredotti (2010–2021) - remarques et détails rajoutés par Joseph Allyndrée*

Base utilisée : `client_commande`
Les tables de la base et les colonnes qui les relient :

```
client ──NCLI── commande ──NCOM── detail ──NPRO── produit
```

Les résultats indiqués ont été obtenus sur le contenu de la base (fichier `client_commande.sqlite`).

---

## Exercice 1 : requêtes simples sur une table

### Questions préliminaires

**1. Combien de lignes (d'enregistrements) existent dans chaque table ?**

| Table      | Nombre de lignes |
|------------|-----------------:|
| `client`   | 16 |
| `commande` | 7  |
| `detail`   | 14 |
| `produit`  | 7  |

**2. Quel est le prix du produit 'POINTE ACIER 60 (1K)' ? Combien en reste-t-il en stock ?**

Le prix est de 95,00 et la quantité en stock est de 134.

**3. Quels sont les noms des clients de catégorie 'B1' ?**

GILLET, AVRON, VANBIST, GUILLAUME.

**4. Combien de commandes le client 'FERARD' a-t-il passées ?**

Trois commandes (30179, 30184 et 30186).

**5. Combien de commandes le client 'VANBIST' a-t-il passées ?**

Une commande (30178).

**6. Quel(s) produit(s) le client 'VANBIST' a-t-il commandé(s), et en quelle quantité ?**

Le produit 'CHEV. SAPIN 400x6x4', en quantité 25.

**7. Pour chacune des colonnes ADRESSE, DATECOM, QSTOCK, COMPTE, NCOM et NPRO, donnez son type et la table où elle se trouve.**

| Colonne   | Table(s)                                             | Type (SQLite) |
|-----------|------------------------------------------------------|---------------|
| `ADRESSE` | `client`                                             | TEXT |
| `DATECOM` | `commande`                                           | TEXT (date au format `AAAA-MM-JJ`) |
| `QSTOCK`  | `produit`                                            | INTEGER |
| `COMPTE`  | `client`                                             | REAL |
| `NCOM`    | `commande` (clé primaire) et `detail` (clé étrangère) | TEXT |
| `NPRO`    | `produit` (clé primaire) et `detail` (clé étrangère)  | TEXT |

> Les dates sont stockées sous forme de texte `AAAA-MM-JJ`. Dans ce format, l'ordre alphabétique est aussi l'ordre chronologique, c'est pourquoi des comparaisons comme `DATECOM < '2009-01-01'` fonctionnent.

### Exercice 1a : exemples de requêtes simples

#### Requête 1.1

```sql
SELECT *
FROM produit
WHERE LIBELLE LIKE '%ACIER%'
ORDER BY PRIX
```

**Ce que fait la requête :** elle sélectionne toutes les colonnes (NPRO, LIBELLE, PRIX, QSTOCK) de la table `produit`, pour les lignes dont le libellé contient « ACIER », triées par prix croissant (l'ordre croissant est implicite).

| NPRO | LIBELLE              | PRIX   | QSTOCK |
|------|----------------------|-------:|-------:|
| PA60 | POINTE ACIER 60 (1K) | 95.00  | 134 |
| PA45 | POINTE ACIER 45 (1K) | 105.00 | 580 |

> **Et avec `LIBELLE = '%ACIER%'` ?** La requête est valide (pas d'erreur), mais elle renvoie **0 ligne**.
>
> Le `%` n'est un joker qu'avec `LIKE`. Avec `=`, la comparaison est exacte et `%` est un caractère comme un autre : la requête cherche un produit dont le libellé est littéralement `%ACIER%`, et il n'y en a aucun.
>
> - `LIKE '%ACIER%'` : le libellé **contient** « ACIER » ;
> - `= 'POINTE ACIER 60 (1K)'` : le libellé est **exactement** « POINTE ACIER 60 (1K) ».

> **Les deux jokers de `LIKE` :**
>
> - `%` remplace **n'importe quelle suite de caractères** (y compris aucun) ;
> - `_` remplace **exactement un caractère**.
>
> Par exemple, `NPRO LIKE 'PA__'` (avec deux `_`) renvoie les produits dont le numéro fait 4 caractères et commence par « PA » : PA45 et PA60.

#### Requête 1.2

```sql
SELECT NCOM, DATECOM
FROM commande
WHERE NCLI = 'C400'
AND DATECOM < '2009-01-01'
```

**Ce que fait la requête :** elle sélectionne les colonnes NCOM et DATECOM de la table `commande`, pour les commandes du client 'C400' passées avant le 1er janvier 2009.

| NCOM  | DATECOM    |
|-------|------------|
| 30179 | 2008-12-22 |
| 30184 | 2008-12-23 |

#### Requête 1.3

```sql
SELECT NOM, ADRESSE, COMPTE
FROM client
WHERE COMPTE > 0
AND (CAT = 'C1' OR LOCALITE = 'Paris')
```

**Ce que fait la requête :** elle sélectionne les colonnes NOM, ADRESSE et COMPTE de la table `client`, pour les clients dont le compte est positif **et** qui sont soit de catégorie 'C1', soit domiciliés à Paris.

| NOM      | ADRESSE       | COMPTE  |
|----------|---------------|--------:|
| HANSENNE | 23, a. Dumont | 1250.00 |

#### Requête 1.4

```sql
SELECT NOM, ADRESSE, COMPTE
FROM client
WHERE COMPTE > 0 OR CAT = 'C1' AND LOCALITE = 'Paris'
```

**Ce que fait la requête :** elle sélectionne les colonnes NOM, ADRESSE et COMPTE de la table `client`, pour les clients dont **soit** le compte est positif, **soit** la catégorie est 'C1' et la localité est Paris.

| NOM      | ADRESSE           | COMPTE  |
|----------|-------------------|--------:|
| HANSENNE | 23, a. Dumont     | 1250.00 |
| FERARD   | 65, r. du Tertre  | 350.00  |
| VANBIST  | 180, r. Florimont | 720.00  |

#### Q.1.4. Dans l'expression `COMPTE > 0 OR CAT = 'C1' AND LOCALITE = 'Paris'`, dans quel ordre sont évalués les opérateurs logiques OR et AND ?

**Réponse R2 :**

```sql
COMPTE > 0 OR (CAT = 'C1' AND LOCALITE = 'Paris')
```

`AND` est prioritaire sur `OR`, de la même façon que la multiplication est prioritaire sur l'addition. En cas de doute, ajoutez des parenthèses.

### Exercice 1b : requêtes simples

#### Q.1.5. Affichez en ordre alphabétique la liste des localités (sans doublon) où habitent les clients.

```sql
SELECT DISTINCT LOCALITE
FROM client
ORDER BY LOCALITE
```

> Utilisez `DISTINCT` pour ne pas avoir de doublons dans la réponse.

Résultat : Bruxelles, Geneve, Lille, Namur, Paris, Poitiers, Toulouse.

#### Q.1.6. Affichez les commandes passées pendant les dix derniers jours de l'année 2008.

Les dix derniers jours de 2008 vont du 22 au 31 décembre.

```sql
SELECT NCOM, DATECOM
FROM commande
WHERE DATECOM > '2008-12-21'
AND DATECOM < '2009-01-01'
```

ou bien :

```sql
SELECT NCOM, DATECOM
FROM commande
WHERE DATECOM BETWEEN '2008-12-22' AND '2008-12-31'
```

| NCOM  | DATECOM    |
|-------|------------|
| 30179 | 2008-12-22 |
| 30182 | 2008-12-23 |
| 30184 | 2008-12-23 |

> **Attention :** `BETWEEN` **inclut les deux bornes**. Écrire `BETWEEN '2008-12-21' AND '2009-01-01'` renverrait aussi la commande 30178 du 21 décembre, soit 4 lignes au lieu de 3.

#### Q.1.7. Affichez le stock de chaque produit de type sapin.

```sql
SELECT LIBELLE, QSTOCK
FROM produit
WHERE LIBELLE LIKE '%sapin%'
```

| LIBELLE             | QSTOCK |
|---------------------|-------:|
| CHEV. SAPIN 200x6x2 | 20   |
| CHEV. SAPIN 200x6x4 | 2690 |
| CHEV. SAPIN 400x6x4 | 450  |
| PL. SAPIN 200x20x2  | 1220 |

> **Majuscules et minuscules :** les libellés sont écrits en majuscules (« SAPIN »), pourtant `LIKE '%sapin%'` les trouve. En SQLite, `LIKE` ne tient pas compte de la casse.
>
> Ce n'est pas le cas de `=` : `LOCALITE = 'paris'` renvoie **0 ligne**, alors que `LOCALITE = 'Paris'` renvoie 1 client.
>
> Le comportement de `LIKE` dépend aussi du SGBD : dans PostgreSQL, par exemple, `LIKE` tient compte de la casse, et `LIKE '%sapin%'` ne renverrait rien. Dans le doute, écrivez la valeur avec la même casse que dans la base.

#### Q.1.8. Affichez les produits dont le prix est inférieur à 200 et le stock est supérieur à 150.

```sql
SELECT LIBELLE
FROM produit
WHERE PRIX < 200
AND QSTOCK > 150
```

Résultat : CHEV. SAPIN 200x6x4, POINTE ACIER 45 (1K), PL. SAPIN 200x20x2.

#### Q.1.9. Affichez le numéro, le nom et la localité des clients de catégorie B1 n'habitant pas à Paris.

```sql
SELECT NCLI, NOM, LOCALITE, CAT
FROM client
WHERE LOCALITE NOT LIKE 'Paris'
AND CAT = 'B1'
```

| NCLI | NOM     | LOCALITE | CAT |
|------|---------|----------|-----|
| B512 | GILLET  | Toulouse | B1 |
| C003 | AVRON   | Toulouse | B1 |
| K111 | VANBIST | Lille    | B1 |

### Questions de révision

#### Q.R.1. Expliquez ce que fait la requête suivante.

```sql
SELECT LIBELLE, PRIX, QSTOCK
FROM produit
WHERE PRIX < 100 AND QSTOCK > 0
```

Elle affiche le libellé, le prix et le stock des produits qui coûtent moins de 100 et qui sont encore en stock.

| LIBELLE              | PRIX  | QSTOCK |
|----------------------|------:|-------:|
| CHEV. SAPIN 200x6x2  | 75.00 | 20  |
| POINTE ACIER 60 (1K) | 95.00 | 134 |

---

## Exercice 2 : requêtes avec jointures entre tables

### Exercice 2a : exemples de requêtes avec jointures

#### Requête 2.1

```sql
SELECT NOM, NCOM
FROM client, commande
WHERE client.NCLI = commande.NCLI
AND LOCALITE = 'Toulouse'
```

**Ce que fait la requête :**

- elle met en correspondance les lignes des tables `client` et `commande` par la colonne NCLI des deux tables ;
- elle ne garde que les clients habitant à Toulouse ;
- elle affiche le nom de ces clients et le numéro des commandes qu'ils ont passées.

| NOM      | NCOM  |
|----------|-------|
| PONCELET | 30185 |
| GILLET   | 30188 |

#### Requête 2.2

```sql
SELECT LIBELLE, PRIX, QCOM
FROM detail, produit
WHERE detail.NPRO = produit.NPRO
AND NCOM = '30188'
```

**Ce que fait la requête :**

- elle met en correspondance les lignes des tables `detail` et `produit` par la colonne NPRO des deux tables ;
- elle ne garde que les lignes de la commande n° 30188 ;
- elle affiche, pour cette commande, le libellé des produits, leur prix et la quantité commandée.

| LIBELLE              | PRIX   | QCOM |
|----------------------|-------:|-----:|
| CHEV. SAPIN 400x6x4  | 220.00 | 180 |
| POINTE ACIER 45 (1K) | 105.00 | 22  |
| POINTE ACIER 60 (1K) | 95.00  | 70  |
| PL. HETRE 200x20x2   | 230.00 | 92  |

#### Requête 2.3 (incomplète)

```sql
SELECT NOM, commande.NCOM, detail.NCOM, LIBELLE, PRIX, QCOM
FROM client, commande, detail, produit
WHERE client.NCLI = commande.NCLI
AND detail.NPRO = produit.NPRO
AND commande.NCOM = '30188'
```

**Cette requête est incomplète :**

- elle met en correspondance `client` et `commande` par NCLI ;
- elle met en correspondance `detail` et `produit` par NPRO ;
- mais elle **ne met pas en correspondance** `commande` et `detail`.

Chaque ligne de `detail`, quelle que soit sa commande, est donc associée à la commande 30188. On obtient 14 lignes au lieu de 4, et les deux colonnes NCOM ne sont pas égales.

Pour corriger la requête, il faut ajouter la condition de jointure `commande.NCOM = detail.NCOM`.

#### Requête 2.3 (corrigée)

```sql
SELECT NOM, commande.NCOM, detail.NCOM, LIBELLE, PRIX, QCOM
FROM client, commande, detail, produit
WHERE client.NCLI = commande.NCLI
AND detail.NPRO = produit.NPRO
AND commande.NCOM = detail.NCOM    -- condition à ajouter
AND commande.NCOM = '30188'
```

La requête met maintenant en correspondance les lignes des 4 tables avec les 3 conditions de jointure. Elle ne garde que la commande n° 30188 et affiche le nom du client, le numéro de la commande, le libellé des produits, leur prix et la quantité commandée.

| NOM    | NCOM  | NCOM  | LIBELLE              | PRIX   | QCOM |
|--------|-------|-------|----------------------|-------:|-----:|
| GILLET | 30188 | 30188 | CHEV. SAPIN 400x6x4  | 220.00 | 180 |
| GILLET | 30188 | 30188 | POINTE ACIER 45 (1K) | 105.00 | 22  |
| GILLET | 30188 | 30188 | POINTE ACIER 60 (1K) | 95.00  | 70  |
| GILLET | 30188 | 30188 | PL. HETRE 200x20x2   | 230.00 | 92  |

> **Pourquoi deux colonnes NCOM ?** Parce que le `SELECT` demande explicitement les deux : `commande.NCOM` **et** `detail.NCOM`. Dans la version incomplète, cela permet de repérer l'erreur, car les deux valeurs sont différentes. Une fois la jointure corrigée, elles sont toujours égales, donc l'une des deux est inutile.
>
> **Pour n'avoir qu'un seul NCOM**, il suffit d'en garder une seule dans le `SELECT` :
>
> ```sql
> SELECT NOM, commande.NCOM, LIBELLE, PRIX, QCOM
> ```
>
> Il faut quand même préciser la table (`commande.NCOM` ou `detail.NCOM`). La colonne NCOM existe dans les deux tables, donc écrire `SELECT NOM, NCOM, ...` provoque une erreur : *ambiguous column name: NCOM*.

> **Raccourcir avec des alias de tables :** on peut donner un nom court à chaque table dans le `FROM`, puis utiliser ce nom partout dans la requête. La requête 2.3 corrigée devient :
>
> ```sql
> SELECT NOM, co.NCOM, LIBELLE, PRIX, QCOM
> FROM client cl, commande co, detail d, produit p
> WHERE cl.NCLI = co.NCLI
> AND co.NCOM = d.NCOM
> AND d.NPRO = p.NPRO
> AND co.NCOM = '30188'
> ```
>
> Le résultat est le même. Attention : une fois l'alias défini, il faut l'utiliser. Écrire `commande.NCOM` alors que la table s'appelle `co` dans le `FROM` provoque une erreur : *no such column: commande.NCOM*.

> **À retenir :** pour joindre *n* tables, il faut *n − 1* conditions de jointure.

### Exercice 2b : requêtes avec jointures

#### Q.2.4. Affichez tous les produits commandés (nom, prix, quantité) par le client 'B512'.

```sql
SELECT NCLI, commande.NCOM, LIBELLE, PRIX, QCOM
FROM commande, detail, produit
WHERE detail.NPRO = produit.NPRO
AND commande.NCOM = detail.NCOM
AND NCLI LIKE 'B512'
```

| NCLI | NCOM  | LIBELLE              | PRIX   | QCOM |
|------|-------|----------------------|-------:|-----:|
| B512 | 30188 | CHEV. SAPIN 400x6x4  | 220.00 | 180 |
| B512 | 30188 | POINTE ACIER 45 (1K) | 105.00 | 22  |
| B512 | 30188 | POINTE ACIER 60 (1K) | 95.00  | 70  |
| B512 | 30188 | PL. HETRE 200x20x2   | 230.00 | 92  |

#### Q.2.5. Affichez tous les produits (nom, prix, quantité) commandés par le client 'FERARD', par ordre croissant de numéro de commande puis par ordre alphabétique sur le nom de produit.

```sql
SELECT client.NCLI, NOM, commande.NCOM, DATECOM, LIBELLE, PRIX, QCOM
FROM client, commande, detail, produit
WHERE client.NCLI = commande.NCLI
AND commande.NCOM = detail.NCOM
AND detail.NPRO = produit.NPRO
AND NOM LIKE 'FERARD'
ORDER BY commande.NCOM, LIBELLE
```

| NCLI | NOM    | NCOM  | DATECOM    | LIBELLE              | PRIX   | QCOM |
|------|--------|-------|------------|----------------------|-------:|-----:|
| C400 | FERARD | 30179 | 2008-12-22 | CHEV. SAPIN 200x6x2  | 75.00  | 60  |
| C400 | FERARD | 30179 | 2008-12-22 | POINTE ACIER 60 (1K) | 95.00  | 20  |
| C400 | FERARD | 30184 | 2008-12-23 | CHEV. SAPIN 400x6x4  | 220.00 | 120 |
| C400 | FERARD | 30184 | 2008-12-23 | POINTE ACIER 45 (1K) | 105.00 | 20  |
| C400 | FERARD | 30186 | 2009-01-02 | POINTE ACIER 45 (1K) | 105.00 | 3   |

> **Attention :** le nom d'un client n'est pas unique dans la table `client`. Si plusieurs clients s'appelaient 'FERARD', cette requête donnerait les produits commandés par **tous** les 'FERARD'. On affiche donc aussi la colonne NCLI, car c'est le numéro du client qui est unique.

#### Q.2.6. Quels clients ont commandé en 2009 ?

```sql
SELECT DISTINCT client.NCLI, NOM
FROM client, commande
WHERE client.NCLI = commande.NCLI
AND DATECOM >= '2009-01-01' AND DATECOM <= '2009-12-31'
```

| NCLI | NOM      |
|------|----------|
| F011 | PONCELET |
| C400 | FERARD   |
| B512 | GILLET   |

#### Q.2.7. Quels sont les noms des produits qui ont été commandés les dix derniers jours de l'année 2008 ?

```sql
SELECT DISTINCT LIBELLE
FROM commande, detail, produit
WHERE commande.NCOM = detail.NCOM
AND detail.NPRO = produit.NPRO
AND DATECOM > '2008-12-21' AND DATECOM < '2009-01-01'
```

Résultat : CHEV. SAPIN 200x6x2, POINTE ACIER 60 (1K), CHEV. SAPIN 400x6x4, POINTE ACIER 45 (1K).

#### Q.2.8. Affichez les localités des clients qui ont commandé le produit de numéro 'CS464'.

```sql
SELECT DISTINCT LOCALITE
FROM client, commande, detail
WHERE client.NCLI = commande.NCLI
AND commande.NCOM = detail.NCOM
AND NPRO = 'CS464'
```

Résultat : Lille, Poitiers, Toulouse.

> La table `produit` n'est pas nécessaire ici : le numéro de produit NPRO se trouve déjà dans la table `detail`.

#### Q.2.9. Quels sont les produits de type sapin qui ont été commandés ?

```sql
SELECT DISTINCT produit.NPRO, LIBELLE
FROM produit, detail
WHERE produit.NPRO = detail.NPRO
AND LIBELLE LIKE '%SAPIN%'
```

| NPRO  | LIBELLE             |
|-------|---------------------|
| CS464 | CHEV. SAPIN 400x6x4 |
| CS262 | CHEV. SAPIN 200x6x2 |
| PS222 | PL. SAPIN 200x20x2  |

> Sans `DISTINCT`, le produit CS464 apparaîtrait 4 fois (une fois par ligne de commande), soit 6 lignes au lieu de 3.
### Questions de révision

#### Q.R.1. Quelle est la syntaxe générale d'une requête de jointure sur 2 tables ?

```sql
SELECT colonnes
FROM table1, table2
WHERE table1.cle = table2.cle      -- condition de jointure
AND autres_conditions
```

#### Q.R.2. Quelle est la syntaxe générale d'une requête de jointure sur 3 tables ?

```sql
SELECT colonnes
FROM table1, table2, table3
WHERE table1.cle_a = table2.cle_a  -- jointure 1
AND table2.cle_b = table3.cle_b    -- jointure 2
AND autres_conditions
```

Avec 3 tables, il faut 2 conditions de jointure (voir la requête 2.3).
