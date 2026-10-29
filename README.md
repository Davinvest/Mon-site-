# Comptoir Légal — comptoirlegal.fr

Site de publication d'annonces légales au tarif réglementé et de prise en charge des formalités d'entreprise.
Next.js 16 (App Router, TypeScript), paiement Stripe, e-mails via le SMTP OVH.

## Ce que contient la phase 1

| Rubrique | URL |
|---|---|
| Accueil | `/` |
| Guide des annonces légales + catalogue | `/annonces-legales` |
| Tarifs 2026 (forfaits, Réunion/Mayotte, prix au caractère) | `/annonces-legales/tarifs` |
| 10 catégories, 57 fiches d'annonces (modèle, mentions, prix) | `/annonces-legales/{categorie}/{type}` |
| Tunnel de commande en 5 étapes | `/tunnel` (ou `/tunnel?type=constitution-sas`) |
| Formalités (27 fiches avec formulaire « être rappelé ») | `/formalites`, `/formalites/{categorie}/{slug}` |
| Honoraires formalités | `/formalites/tarifs` |
| Offre professionnels (CRM, API en préparation) | `/professionnels` |
| Guides | `/guides` |
| Qui sommes-nous, contact, CGV, mentions légales, confidentialité | … |

Fonctionnement d'une commande :

1. Le client choisit l'annonce, remplit le formulaire ; l'aperçu et le prix se calculent en direct.
2. `POST /api/commande` **recalcule le prix côté serveur** (le prix envoyé par le navigateur n'est jamais utilisé),
   vérifie que le code postal de publication figure dans le texte, puis ouvre une session Stripe Checkout.
3. Stripe appelle `POST /api/stripe/webhook` après paiement : la commande est transmise via le **connecteur**
   (e-mail à l'équipe en mode `local`, API de Jordan en mode `lgdf`) et le client reçoit sa confirmation.

Sans clé Stripe, le site fonctionne en **mode démonstration** : la commande est traitée sans paiement.

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis compléter
npm run dev                  # http://localhost:3000
npm test                     # tests du calcul des prix et des modèles
npm run lint && npm run typecheck && npm run build
```

## Fichiers à connaître

- `src/data/tarifs-annonces.ts` — **la grille tarifaire officielle**. À mettre à jour chaque année à la
  parution du nouvel arrêté (fin décembre), puis lancer `npm test`.
- `src/data/annonces.ts` — les 57 types d'annonces (catégorie, forfait, modèle).
- `src/data/modeles.ts` — les formulaires et les modèles de rédaction.
- `src/data/formalites.ts` — formalités et **honoraires (indicatifs, à valider)**.
- `src/data/site.ts` — **coordonnées de l'éditeur à compléter** (raison sociale, SIREN, adresse…).
- `src/lib/connecteur/` — le branchement vers le journal partenaire / l'API de Jordan.

## Avant la mise en ligne (checklist)

- [ ] Compléter `src/data/site.ts` (société, SIREN, TVA, directeur de publication) et le médiateur dans `src/app/cgv/page.tsx`.
- [ ] Valider les honoraires dans `src/data/formalites.ts`.
- [ ] Créer les boîtes `contact@comptoirlegal.fr` et `commandes@comptoirlegal.fr` chez OVH.
- [ ] Ouvrir le compte Stripe (société, SIREN, IBAN) et le compte Vercel **Pro** (usage commercial).
- [ ] Renseigner les variables d'environnement sur Vercel (ci-dessous).
- [ ] Relier le domaine (ci-dessous) et tester une vraie commande à petit montant.

## Déploiement sur Vercel

1. Sur vercel.com : *Add New → Project*, importer le dépôt GitHub `davinvest/mon-site-`. Framework détecté : Next.js.
2. *Settings → Environment Variables* : reprendre `.env.example`.

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://comptoirlegal.fr` |
| `CONNECTEUR` | `local` (puis `lgdf` quand l'API de Jordan est prête) |
| `JOURNAL_PARTENAIRE_NOM` | nom du journal habilité partenaire |
| `STRIPE_SECRET_KEY` | clé secrète Stripe (`sk_live_…`, ou `sk_test_…` pour tester) |
| `STRIPE_WEBHOOK_SECRET` | secret du webhook (`whsec_…`, voir ci-dessous) |
| `SMTP_HOST` / `SMTP_PORT` | `ssl0.ovh.net` / `465` |
| `SMTP_USER` / `SMTP_PASSWORD` | adresse et mot de passe de la boîte OVH qui envoie |
| `MAIL_FROM` | `Comptoir Légal <contact@comptoirlegal.fr>` |
| `MAIL_COMMANDES` | `commandes@comptoirlegal.fr` |

3. **Webhook Stripe** : dans Stripe, *Développeurs → Webhooks → Ajouter un endpoint* :
   URL `https://comptoirlegal.fr/api/stripe/webhook`, événements `checkout.session.completed` et
   `checkout.session.async_payment_succeeded`. Copier le secret `whsec_…` dans `STRIPE_WEBHOOK_SECRET`.

## Relier comptoirlegal.fr (OVH) à Vercel

1. Vercel : *Settings → Domains* → ajouter `comptoirlegal.fr` et `www.comptoirlegal.fr`
   (et `comptoirlegal.com` en redirection vers `.fr` si le .com est acquis).
2. OVH : *Web Cloud → Noms de domaine → comptoirlegal.fr → Zone DNS* :
   - modifier l'enregistrement **A** de `comptoirlegal.fr` vers l'adresse IP indiquée par Vercel ;
   - créer/modifier le **CNAME** `www` vers la cible indiquée par Vercel (`….vercel-dns.com.`) ;
   - **ne pas toucher aux enregistrements MX, SPF et autres liés aux e-mails** (boîtes Zimbra).
3. Attendre la propagation (quelques minutes à quelques heures) : Vercel génère le certificat HTTPS automatiquement.

## Brancher l'API de Jordan (Le Guichet des Formalités)

Le connecteur `src/lib/connecteur/lgdf.ts` suit la documentation publique de leur API
(`authenticate`, `types`, `generate`, `order/{id}/config`, `order/pay`, `order/{id}/certificate`).
Quand la clé de test et la documentation complète sont fournies :

1. ajuster les routes et les champs de `lgdf.ts` à la documentation réelle ;
2. définir `CONNECTEUR=lgdf`, `LGDF_API_URL` et `LGDF_API_KEY` sur Vercel (environnement *Preview* d'abord) ;
3. tester une commande de bout en bout, puis passer en production.

Questions à trancher avec Jordan : qui encaisse et facture le client (Stripe chez Comptoir Légal puis
paiement du partenaire par portefeuille, ou encaissement direct chez lui), et le partage de la marge.

## Phases suivantes

- **Phase 2** : lecture des statuts par IA pour pré-remplir l'annonce, espace client (historique,
  attestations), back-office du formaliste.
- **Phase 3** : annuaire des entreprises, CRM et API ouverts aux cabinets, brouillons guichet unique.
