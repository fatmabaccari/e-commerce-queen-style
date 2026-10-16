<div align="center">

<img src="frontend/public/logo.jpg" alt="Queen Style" width="120" />

# Queen Style

**Plateforme e-commerce full-stack avec tableau de bord d'administration**

Boutique de mode en ligne, API REST sécurisée et back-office complet,
conteneurisés avec Docker.

<br />

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)

<br />

[Aperçu](#-aperçu) ·
[Fonctionnalités](#-fonctionnalités) ·
[Architecture](#-architecture) ·
[Démarrage rapide](#-démarrage-rapide) ·
[API](#-api) ·
[Déploiement](#-déploiement) ·
[Auteurs](#-auteurs)

</div>

---

## 📑 Sommaire

- [À propos](#-à-propos)
- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture](#-architecture)
- [Choix d'architecture](#-choix-darchitecture)
- [Structure du projet](#-structure-du-projet)
- [Démarrage rapide](#-démarrage-rapide)
- [Configuration](#-configuration)
- [API](#-api)
- [Sécurité](#-sécurité)
- [Déploiement](#-déploiement)
- [Dépannage](#-dépannage)
- [Feuille de route](#-feuille-de-route)
- [Contribuer](#-contribuer)
- [Auteurs](#-auteurs)
- [Licence](#-licence)

---

## 🎯 À propos

**Queen Style** est une application e-commerce complète pour la boutique de mode Queen Style, à Sfax (Tunisie). Elle sépare trois responsabilités :

| Composant | Rôle |
|---|---|
| **Boutique** | Parcours d'achat : catalogue, fiche produit, panier, commande, compte client |
| **Back-office** | Gestion du catalogue, des commandes, du stock, des promotions, des utilisateurs et du contenu de l'accueil |
| **API REST** | Logique métier, authentification, accès aux données via Prisma et PostgreSQL |

## 📸 Aperçu

> Place tes captures d'écran dans `docs/screenshots/` (PNG, largeur ≈ 1400 px).

<table>
  <tr>
    <td align="center"><b>Accueil</b><br /><img src="docs/screenshots/home.png" alt="Page d'accueil" /></td>
    <td align="center"><b>Fiche produit</b><br /><img src="docs/screenshots/product.png" alt="Fiche produit" /></td>
  </tr>
  <tr>
    <td align="center"><b>Panier</b><br /><img src="docs/screenshots/cart.png" alt="Panier" /></td>
    <td align="center"><b>Tableau de bord</b><br /><img src="docs/screenshots/dashboard.png" alt="Tableau de bord" /></td>
  </tr>
</table>

## ✨ Fonctionnalités

### 🛍️ Boutique

- Page d'accueil dynamique : section hero avec image principale, galerie et carrousel de slides, entièrement administrables
- Catalogue avec filtres, organisé par **catégories hiérarchiques** (catégories et sous-catégories)
- Fiches produit avec **variantes** (taille, couleur, prix, stock) et **galerie d'images** par variante
- Panier et tunnel de commande
- Commande possible **avec ou sans compte client**
- **Paiement à la livraison**, avec frais de livraison de 8 TND intégrés au total du panier
- Compte client : profil, carnet d'adresses, historique des commandes
- Promotions : réductions en **pourcentage** ou **montant fixe**, limitées dans le temps, appliquées à des produits ou à des catégories
- Page de contact et liens vers les réseaux sociaux de la boutique

### 🧑‍💼 Back-office

- Tableau de bord avec statistiques
- CRUD complet : produits, variantes, images de variantes, catégories, réductions, utilisateurs
- Suivi des commandes par statut : `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- Journal des **mouvements de stock**, rattachés à l'administrateur à l'origine de la modification
- Gestion du contenu de l'accueil (hero et slides)
- Authentification administrateur séparée, avec **rôles** et permissions
- Export PDF

### ⚙️ Technique

- Authentification **JWT**, contrôle d'accès par rôle (`admin`, `super_admin`)
- Validation des entrées, pagination et gestion centralisée des erreurs
- Upload d'images avec persistance via volume Docker
- Healthcheck de l'API et ordre de démarrage orchestré par Docker Compose
- Reverse proxy nginx avec prise en charge SSL

## 🧰 Stack technique

| Couche | Technologies |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Recharts |
| Backend | Node.js, Express, Multer (upload d'images) |
| Base de données | PostgreSQL, Prisma ORM |
| Authentification | JSON Web Tokens |
| Infrastructure | Docker, Docker Compose, nginx |
| Production | VPS OVH : PM2, nginx, Let's Encrypt, PostgreSQL |
| Autres cibles préparées | Docker, Railway, Render, Fly.io, Neon |
| Qualité de code | ESLint, Prettier |

## 🏗️ Architecture

```mermaid
flowchart LR
    U([Navigateur]) --> N[nginx<br/>:80 / :443]
    N --> F[Frontend Next.js<br/>:3001]
    N --> A[API Express<br/>:3000]
    F -. appels API .-> A
    A --> P[(PostgreSQL)]
    A --> V[/uploads<br/>volume Docker/]
```

### Modèle de données

```mermaid
erDiagram
    users ||--o{ user_addresses : possède
    users ||--o{ orders : passe
    orders ||--|{ order_items : contient
    categories ||--o{ categories : "sous-catégories"
    categories ||--o{ products : regroupe
    products ||--|{ product_variants : décline
    product_variants ||--o{ product_variant_images : illustre
    product_variants ||--o{ order_items : commandée
    product_variants ||--o{ stock_movements : trace
    admins ||--o{ stock_movements : effectue
    roles ||--o{ admins : attribue
    discounts ||--o{ discount_products : cible
    discounts ||--o{ discount_categories : cible
    products ||--o{ discount_products : concerné
    categories ||--o{ discount_categories : concernée
    HeroSection ||--o{ HeroGalleryImage : affiche
```

Le schéma complet est défini dans [`prisma/schema.prisma`](prisma/schema.prisma). Les tables `HeroSlide` et `Contact` (informations de la boutique) sont indépendantes.

## 🧩 Choix d'architecture

- **Architecture en couches** : routes → contrôleurs → modèles (accès aux données via Prisma)
- **Chaîne de middlewares composables** : `authenticate`, `authorize`, validation, pagination, upload. Le tableau `adminOnly` assemble `authenticate` et `authorize` pour protéger une route en une ligne
- **Middlewares générés par des fonctions (factory)** : `authorize(roles, permissions)`, `checkOwnership(model)`, `uploadSingle(champ)`
- **Contrôle d'accès par rôles (RBAC)** : rôles et permissions stockés en base, vérifiés à chaque requête d'administration
- **Gestion d'erreurs centralisée** : classe `AppError` (erreurs opérationnelles), enveloppe `asyncHandler`, et un gestionnaire global qui traduit les erreurs Prisma et JWT en réponses HTTP claires. Le détail technique n'est exposé qu'en développement
- **Instance unique du client Prisma** partagée dans toute l'application
- **Validation et assainissement des entrées** avant l'arrivée dans les contrôleurs (e-mail, mots de passe, commandes, réductions)
- **Pagination réutilisable** : middleware de lecture des paramètres et constructeur de réponse paginée
- **Upload sécurisé** : types d'images autorisés, taille limitée à 5 Mo, noms de fichiers uniques

## 📂 Structure du projet

```
.
├── app.js                      # Point d'entrée de l'API
├── config/                     # Chargement de l'environnement
├── controllers/                # Logique métier par ressource
├── routes/                     # Routes de l'API
├── middlewares/                # Auth, rôles, validation, erreurs, upload, pagination
├── models/                     # Modèles de données
├── database/                   # Client Prisma
├── prisma/                     # Schéma et migrations
├── scripts/                    # hash-admin.js, setup-ssl.sh
├── frontend/                   # Application Next.js
│   ├── app/
│   │   ├── client/             # Boutique (accueil, produits, panier, checkout, compte)
│   │   ├── dashboard/          # Back-office
│   │   └── login/
│   ├── components/
│   ├── hooks/
│   └── lib/                    # Client API, auth, utilitaires
├── nginx/                      # Reverse proxy
├── docs/                       # Guides de déploiement
├── docker-compose.yml          # Production (base externe)
├── docker-compose.dev.yml      # Développement
├── Dockerfile
├── fly.toml                    # Fly.io
├── railway.json                # Railway
└── render.yaml                 # Render
```

## 🚀 Démarrage rapide

### Prérequis

| Outil | Version |
|---|---|
| [Node.js](https://nodejs.org/) | 18 ou supérieure |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Récente |
| PostgreSQL | Locale, ou hébergée (ex. [Neon](https://neon.tech)) |

### 1. Cloner le dépôt

```bash
git clone https://github.com/fatmabaccari/e-commerce-queen-style.git
cd e-commerce-queen-style
```

### 2. Configurer l'environnement

```bash
cp env.production.template .env
```

Renseigne **tes propres valeurs** dans `.env` (voir [Configuration](#-configuration)).

### 3. Lancer l'application

**Avec Docker, base de données incluse (le plus simple pour tester)**

```bash
docker compose -f docker-compose.prod.yml up --build
```

Ce fichier lance PostgreSQL, l'API, le frontend et nginx. Dans `.env`, définis `POSTGRES_PASSWORD`, `JWT_SECRET` et `SESSION_SECRET`, avec `FRONTEND_URL=http://localhost` et `NEXT_PUBLIC_API_URL=http://localhost/api`. Le site est disponible sur **http://localhost**.

Pour utiliser une base externe (ex. Neon), lance `docker-compose.prod.external-db.yml` avec ta propre `DATABASE_URL`.

Si les tables ne se créent pas au démarrage, lance :

```bash
docker exec queen-style-backend npx prisma db push
```

**En développement (sans Docker)**

```bash
# Backend
npm install
npx prisma generate
npx prisma db push        # crée les tables sur une base vide
npm run dev               # API sur http://localhost:3000

# Frontend (second terminal)
cd frontend
npm install
npm run dev
```

### 4. Créer un compte administrateur

Le mot de passe d'un administrateur est stocké haché. Le script `scripts/hash-admin.js` sert à générer ce hash :

```bash
node scripts/hash-admin.js
```

Insère ensuite l'administrateur (avec son rôle) dans les tables `roles` et `admins`, par exemple avec `npx prisma studio`.

## ⚙️ Configuration

| Variable | Obligatoire | Description | Exemple |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `JWT_SECRET` | ✅ | Clé de signature des tokens | chaîne aléatoire de 32+ caractères |
| `SESSION_SECRET` | ✅ | Clé de signature des sessions | chaîne aléatoire de 32+ caractères |
| `JWT_EXPIRES_IN` | ➖ | Durée de validité des tokens | `7d` |
| `FRONTEND_URL` | ➖ | Origine autorisée (CORS) | `http://localhost` |
| `NEXT_PUBLIC_API_URL` | ➖ | URL de l'API vue par le navigateur | `http://localhost/api` |
| `HTTP_PORT` / `HTTPS_PORT` | ➖ | Ports exposés par nginx | `80` / `443` |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | ➖ | Base locale (uniquement `docker-compose.prod.yml`) | `queenstyle` / mot de passe fort / `queen_style` |

Générer un secret solide :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `NEXT_PUBLIC_API_URL` est intégrée au frontend **à la construction** : relance `docker compose up --build` après l'avoir modifiée. Elle doit être accessible depuis le navigateur, donc pas de `http://backend:3000`.

## 🔌 API

| Ressource | Description |
|---|---|
| `auth` | Inscription et connexion des clients |
| `admin-auth` | Connexion des administrateurs |
| `users`, `user-addresses` | Comptes et adresses de livraison |
| `products` | Produits |
| `product-variants`, `product-variant-images` | Déclinaisons et visuels |
| `categories` | Catégories et sous-catégories |
| `cart` | Panier |
| `orders` | Commandes |
| `discounts` | Réductions |
| `stock-movements` | Journal du stock |
| `hero-section`, `hero-slides` | Contenu de la page d'accueil |
| `contact` | Informations de la boutique (téléphone, adresse, réseaux sociaux) |

- Les routes d'administration exigent un rôle `admin` ou `super_admin`.
- `GET /health` retourne l'état du service (utilisé par le healthcheck Docker).

## 🔒 Sécurité

- Aucun secret n'est versionné : `.env` et `.env.*` sont exclus par le `.gitignore`.
- Les mots de passe sont stockés sous forme hachée (`password_hash`).
- Routes sensibles protégées par authentification et contrôle de rôle.
- CORS restreint à `FRONTEND_URL`.
- En production, génère des secrets uniques, jamais ceux d'un environnement de test.

## 🌍 Déploiement

Le dépôt fournit quatre fichiers Docker Compose :

| Fichier | Services | Usage |
|---|---|---|
| `docker-compose.prod.yml` | PostgreSQL, API, frontend, nginx | Test local complet ou serveur autonome |
| `docker-compose.prod.external-db.yml` | API, frontend, nginx (base externe via `DATABASE_URL`) | Production avec Neon |
| `docker-compose.yml` | API, frontend (base externe, sans nginx) | Plateformes qui fournissent leur propre proxy |
| `docker-compose.dev.yml` | API, frontend en mode développement (base externe) | Développement |

Autres cibles préparées :

| Cible | Fichier |
|---|---|
| Railway | `railway.json` (démarre avec `npm start`) |
| Fly.io | `fly.toml` (API sur le port 3000) |
| Render | `render.yaml` |

La mise en production d'origine tourne sur un **VPS OVH sans Docker** (PM2 + nginx + Let's Encrypt).

Les guides détaillés sont dans [`docs/`](docs/) : Neon, hébergement gratuit, comparatif d'hébergeurs, Railway.

## 🩺 Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `P1000: Authentication failed` | `DATABASE_URL` absente ou incorrecte | Vérifie le fichier `.env` et son nom exact |
| Tables manquantes ou `migrate deploy` en erreur | Une seule migration existe (ajout du hero), sans migration initiale | Sur une base vide : `npx prisma db push` |
| Aucun produit affiché | `NEXT_PUBLIC_API_URL` inaccessible depuis le navigateur | Utilise `http://localhost/api`, puis relance avec `--build` |
| Port déjà utilisé | Un autre service occupe 80, 3000 ou 3001 | Change `HTTP_PORT` ou arrête le service |
| Réinitialiser Docker | État corrompu | `docker compose down -v`, puis relance |

## 🗺️ Feuille de route

- [x] Catalogue avec variantes, images et catégories hiérarchiques
- [x] Commandes avec ou sans compte
- [x] Réductions par produit et par catégorie
- [x] Back-office avec gestion du stock
- [x] Déploiement Docker
- [ ] Paiement par carte en ligne (le mode existe dans le modèle de données)
- [ ] Recherche plein texte
- [ ] Notifications par e-mail
- [ ] Migration Prisma initiale complète
- [ ] Tests automatisés
- [ ] Intégration continue (GitHub Actions)
- [ ] Internationalisation (FR / AR / EN)

## 🤝 Contribuer

1. Crée une branche : `git checkout -b feat/ma-fonctionnalite`
2. Commite avec des messages clairs ([Conventional Commits](https://www.conventionalcommits.org/fr/)) :
   `feat: add product search`, `fix: cart total`, `docs: update README`
3. Pousse la branche et ouvre une *pull request*.

## 👥 Auteurs

Projet réalisé en collaboration avec **[M3dnux](https://github.com/M3dnux)**.

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/fatmabaccari">
        <img src="https://github.com/fatmabaccari.png" width="80" alt="Fatma Baccari" /><br />
        <b>Fatma Baccari</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/M3dnux">
        <img src="https://github.com/M3dnux.png" width="80" alt="Mohamed Ali Walha" /><br />
        <b>Mohamed Ali Walha</b>
      </a>
    </td>
  </tr>
</table>

## 📄 Licence

© 2025 Queen Style. Tous droits réservés.
