# Boutique en ligne — single-store e-commerce (Algérie) 🇩🇿

Une boutique en ligne complète pour **un seul commerçant** : les clients
parcourent les produits, ajoutent au panier, et commandent avec **paiement
à la livraison (COD)** — le mode de paiement dominant en Algérie (~95%
des commandes en ligne, cartes bancaires très peu utilisées). Le
propriétaire gère tout depuis un tableau de bord protégé.

Ce n'est **pas** un marketplace multi-vendeurs : une seule boutique par
déploiement. Pour vendre le concept à plusieurs clients, on redéploie ce
même projet une fois par client (nouveau dépôt / nouveau projet Vercel),
et chacun personnalise son thème, son nom et ses produits indépendamment.

## Ce qui a changé vs. l'ancienne version

- **Fini le multi-vendeurs.** L'ancienne version laissait n'importe qui
  créer un compte + une boutique, et les clients ne pouvaient que
  "commander sur WhatsApp" sans panier ni suivi — inutilisable pour un
  vrai commerce. Maintenant : une seule boutique, un seul compte admin.
- **Panier + tunnel de commande réels** : panier persistant (localStorage),
  tiroir panier, page de commande avec nom / téléphone / wilaya / commune /
  adresse, choix livraison à domicile ou bureau (stop desk), calcul
  automatique des frais.
- **Paiement à la livraison** : pas de passerelle de paiement à configurer
  (aucune carte ne fonctionne bien en Algérie pour ce type de commerce) —
  le client paie cash à la réception, comme Jumia, Ouedkniss, ou toute
  boutique Instagram qui utilise Yalidine/Maystro.
- **Gestion des commandes** : les commandes arrivent dans le tableau de
  bord (statuts : en attente → confirmée → expédiée → livrée / annulée),
  avec décrément automatique du stock.
- **Inscription à usage unique** : `/register` ne fonctionne qu'une seule
  fois (tant qu'aucune boutique n'existe) — ça crée le compte admin et
  configure la boutique. Après ça, la route se ferme d'elle-même.
- **Produits enrichis** : stock, prix barré (réduction), mise en avant
  sur la page d'accueil.
- **Paramètres boutique complets** : logo, nom, description, WhatsApp,
  Instagram/Facebook, wilaya d'expédition, frais de livraison
  (domicile / bureau), seuil de livraison gratuite.

## 🎨 Personnaliser pour un client

Tout ce qui est spécifique à un client se configure **sans toucher au
code** :
1. Déployez le projet (voir plus bas), ouvrez `/register` une seule fois
   pour créer le compte admin + la boutique.
2. Dans `/dashboard/settings`, changez le nom, le logo, la description,
   le numéro WhatsApp, la wilaya, les frais de livraison.
3. Ajoutez les produits depuis `/dashboard/products/new`.

Pour un changement plus profond (thème de couleurs, polices, nom de
domaine), modifiez `tailwind.config.js` (couleurs `souk.*`) et
`src/app/layout.tsx` (polices). Chaque client = un dépôt Git séparé
(fork ce projet), pour garder les personnalisations indépendantes.

## 🚀 Installation

### Étape 0 — Prérequis
- Node.js 20+ → https://nodejs.org
- Git → https://git-scm.com/downloads

### Étape 1 — Comptes gratuits à créer

**MongoDB Atlas**
1. https://cloud.mongodb.com → Sign Up
2. Créer un cluster gratuit (M0, région Paris ou Francfort)
3. Database Access → créer un utilisateur (ex: `sela_user`)
4. Network Access → Add IP → `0.0.0.0/0` (autoriser depuis n'importe où)
5. Connect → Drivers → copier l'URI de connexion

**Cloudinary** (photos produits) — recommandé
1. https://cloudinary.com → Sign Up
2. Dashboard → copier Cloud Name, API Key, API Secret

**Google Gemini** (génération IA de descriptions) — optionnel
1. https://aistudio.google.com/app/apikey → Create API Key

**Vercel** (déploiement)
1. https://vercel.com → Sign Up with GitHub

### Étape 2 — Installer

```bash
cd sela-marketplace
npm install
```

### Étape 3 — Variables d'environnement

```bash
cp .env.example .env.local
```

Remplissez `.env.local`. Pour générer `NEXTAUTH_SECRET` :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Étape 4 — Lancer en local

```bash
npm run dev
```

Ouvrez http://localhost:3000/register pour créer le compte admin et
configurer la boutique (une seule fois).

### Étape 5 — Déployer sur Vercel

1. Poussez le code sur GitHub (un dépôt par client)
2. https://vercel.com/new → Import le repo
3. Ajoutez toutes les variables de `.env.local` dans Environment
   Variables (⚠️ `NEXTAUTH_URL` doit pointer vers le domaine Vercel réel,
   ex. `https://nom-client.vercel.app`)
4. Deploy, puis ouvrez `/register` une seule fois sur le site en ligne

## 📁 Structure du projet

```
src/
├── app/
│   ├── page.tsx                    # Page d'accueil (vitrine)
│   ├── products/                   # Liste + détail produit (public)
│   ├── checkout/                   # Tunnel de commande (COD)
│   ├── order-confirmation/[id]/    # Confirmation de commande (client)
│   ├── (auth)/login/               # Connexion admin
│   ├── (auth)/register/            # Configuration initiale (une fois)
│   ├── dashboard/                  # Espace admin (protégé)
│   │   ├── page.tsx                # Statistiques
│   │   ├── orders/                 # Gestion des commandes
│   │   ├── products/               # CRUD produits, IA, upload photo
│   │   └── settings/               # Paramètres boutique + livraison
│   └── api/                        # Routes API (auth, produits, commandes, store, upload, ai)
├── components/                     # UI, panier, cartes produit...
├── constants/                      # wilayas (58), catégories
├── lib/                            # mongodb, auth, store, gemini, cloudinary, utils
├── models/                         # User, Shop (paramètres boutique), Product, Order
└── middleware.ts                   # Protège /dashboard/*
```

## 🧰 Stack

| Couche       | Techno                          |
|--------------|----------------------------------|
| Frontend     | Next.js 14 (App Router), Tailwind CSS |
| Auth         | NextAuth.js (Credentials, JWT)   |
| Base de données | MongoDB Atlas + Mongoose      |
| IA           | Google Gemini 1.5 Flash (optionnel) |
| Images       | Cloudinary                       |
| Paiement     | Cash on Delivery (aucune passerelle) |
| Déploiement  | Vercel                           |

## 💵 Comment fonctionne une commande

1. Le client ajoute des produits au panier (persistant, sans compte requis).
2. À la page `/checkout`, il choisit livraison à domicile ou bureau, saisit
   ses coordonnées, et confirme.
3. La commande est enregistrée avec le statut **en attente**, le stock est
   décrémenté, et le client voit une page de confirmation (avec un bouton
   WhatsApp optionnel pour confirmer directement avec le vendeur).
4. Le vendeur suit et met à jour le statut de chaque commande depuis
   `/dashboard/orders`.
5. Le client paie cash au livreur à la réception — aucune carte, aucune
   commission, aucune passerelle de paiement à configurer.

## Prochaines étapes possibles

- Intégration directe avec l'API Yalidine/Maystro (création de bordereau automatique)
- Notifications WhatsApp automatiques au vendeur à chaque nouvelle commande
- Avis clients par produit
- Multi-langue (arabe / français)
- Thèmes de couleurs prêts à l'emploi par secteur (mode, alimentation, électronique...)
