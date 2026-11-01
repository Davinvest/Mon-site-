# Tri des contacts pour la prospection

Cet outil lit les carnets d'adresses **iCloud** (iPhone) et **Google**, garde les numéros **français**, fusionne
les doublons et propose pour chaque contact une **catégorie**, un **message personnalisé** et un bouton
**WhatsApp / SMS** pour l'envoyer en un geste, un par un, sans liste de diffusion.

> ⚠️ Le dépôt GitHub est **public**. Ne déposez jamais vos fichiers de contacts ni le classeur produit.
> Le dossier `donnees/` et les fichiers `.vcf`, `.csv`, `.xlsx` de ce dossier sont ignorés par git.

## 1. Exporter les contacts

**iCloud (contacts de l'iPhone)**, depuis un ordinateur :
1. aller sur [icloud.com](https://www.icloud.com), ouvrir **Contacts** ;
2. cliquer sur un contact, puis `Cmd + A` (Mac) ou `Ctrl + A` (PC) pour tout sélectionner ;
3. menu **⋯** (ou ⚙) → **Exporter la vCard** : on obtient un fichier `.vcf`.

Depuis l'iPhone seul (iOS 16 et plus, selon la version) : app **Contacts** → **Listes** → appui long sur
**Tous les iCloud** → **Exporter**.

Astuce : si vous avez des listes (« Clients », « Dentistes », « Acheteurs Résidence X »…), exportez-les aussi
une par une, en gardant leur nom pour le fichier : ce nom devient une étiquette, qui aide le classement.

**Google** : [contacts.google.com](https://contacts.google.com) → **Exporter** → **Contacts** → format
**CSV Google** → **Exporter**.

## 2. Lancer le tri

- **Le plus simple** : transmettez les fichiers à Claude, qui lance le tri et vous renvoie le classeur.
- **Sur votre ordinateur** (Python 3) :

```bash
pip install openpyxl
```

```bash
python3 trier_contacts.py donnees/contacts.vcf donnees/contacts.csv --signature "Votre prénom"
```

Options : `-o fichier.xlsx` (nom du classeur), `--site` (adresse citée dans les messages),
`--tutoyer 123` (segments à tutoyer ; par défaut `23` : on vouvoie les professionnels du segment 1).

## 3. Le classeur produit

| Onglet | Contenu |
|---|---|
| Synthèse | nombre de contacts lus, fusionnés, français, à vérifier ; répartition par catégorie |
| Mode d'emploi | la méthode d'envoi et les bonnes pratiques |
| À contacter (France) | un contact par ligne, trié par segment ; message proposé, liens WhatsApp / SMS, statut, comptable recommandé |
| À vérifier | numéros en 05 ou 07 sans indicatif, qui peuvent être français ou israéliens |
| Israël et autres pays | contacts sans numéro français |
| Sans téléphone (e-mail) | contacts avec seulement un e-mail |

Segments :

1. **Cible directe** : expert-comptable, notaire, avocat, « Maître », huissier, mandataire ;
2. **Prescripteur** : chef d'entreprise, santé (dentiste, médecin), immobilier, banque et patrimoine, anciens clients ;
3. **Réseau personnel** : amis, famille, anciens élèves, artisans, contacts à classer ;
4. **À écarter** : services, administrations, livraisons…

## Comment les numéros sont reconnus

| Saisie | Résultat |
|---|---|
| `+33…`, `0033…`, `+33 (0)6…` | France, sûr |
| `06…` (10 chiffres), `01`–`04`, `09`, `08` | France, sûr |
| `+262`, `+590`, `+594`, `+596`… | France d'outre-mer |
| `+972…`, ou 9 chiffres commençant par `0` (`03-1234567`) | Israël, sûr |
| `052-123-4567` (écrit à l'israélienne) | Israël, probable |
| `05 56 12 34 56` (écrit par paires) | France, probable |
| `0521234567`, `0771234567` sans séparateurs | **ambigu** : tranché par les autres coordonnées du contact (e-mail en `.fr` ou `.co.il`, adresse, autre numéro), sinon placé dans « À vérifier » |
| `612345678` (zéro perdu) | France, probable |

Les doublons sont fusionnés quand deux fiches ont le même numéro ou le même e-mail **et** un nom compatible :
deux collaborateurs d'un même cabinet qui partagent le standard restent deux contacts distincts.

La catégorie est déduite du nom, de la société, de la fonction, des notes, des groupes et du domaine de l'e-mail
(`@notaires.fr`, `avocats-…`, `…-cpa`…). Les mots-clés et les messages se modifient en tête de
`trier_contacts.py` (`REGLES`, `DEMANDES`, `ACCROCHES`…).

## Tests

```bash
python3 -m unittest -v
```

Les tests n'utilisent que des données fictives (plages de numéros réservées à la fiction par l'ARCEP).
