# CC Submit — Réseau d'affiliation

Plateforme d'affiliation complète (type Impact.com) : landing page marketing, dashboards Publisher / Advertiser / Admin, moteur de tracking clics → leads → conversions → commissions, gestion des paiements et détection de fraude.

## Stack

- **Next.js 16** (App Router, React Server Components) · **TypeScript** strict
- **Tailwind CSS 4** + **shadcn/ui** · **Framer Motion** · **Recharts**
- **PostgreSQL** + **Prisma 7** · **Redis** (rate limiting & anti-fraude)
- **Auth.js v5** (next-auth) — sessions JWT, RBAC par rôle + permissions granulaires
- **Docker Compose** (db + redis + app)

## Démarrage rapide (développement)

Prérequis : Node 22+, pnpm, Docker Desktop.

```bash
# 1. Dépendances
pnpm install

# 2. Variables d'environnement
cp .env.example .env
# puis renseigner AUTH_SECRET, TRACKING_POSTBACK_SECRET et IP_HASH_SALT
# (openssl rand -base64 32)

# 3. Base de données + Redis
docker compose up -d db redis

# 4. Migrations + données de démo
pnpm db:migrate
pnpm db:seed

# 5. Lancer l'app
pnpm dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

## Comptes de démo (créés par `pnpm db:seed`)

| Rôle       | Email                    | Mot de passe     | Espace        |
| ---------- | ------------------------ | ---------------- | ------------- |
| Admin      | `admin@ccsubmit.io`      | `Admin123!`      | `/admin`      |
| Annonceur  | `advertiser@ccsubmit.io` | `Advertiser123!` | `/advertiser` |
| Publisher  | `publisher@ccsubmit.io`  | `Publisher123!`  | `/dashboard`  |
| Publisher 2| `publisher2@ccsubmit.io` | `Publisher123!`  | `/dashboard`  |

## Production (Docker)

```bash
docker compose up -d --build
# puis appliquer les migrations dans le conteneur :
docker compose exec app npx prisma migrate deploy
```

L'image applicative est un build Next.js `standalone` multi-stage (utilisateur non-root, ~150 Mo).

## Tracking

1. **Clic** — `GET /api/track/click/[token]` : enregistre le clic (device, navigateur, pays, IP hashée), applique les heuristiques anti-fraude (bots, flood, doublons), pose un cookie d'attribution (durée configurable par offre) et redirige vers la landing de l'offre avec `?click_id=`.
2. **Conversion** — `POST /api/track/conversion` : postback serveur-à-serveur signé (HMAC avec `TRACKING_POSTBACK_SECRET`). Rejoue le `click_id`, crée Lead → Conversion → Commission et crédite le solde du publisher.

Exemple de postback :

```bash
curl -X POST http://localhost:3000/api/track/conversion \
  -H "Content-Type: application/json" \
  -d '{"click_id":"<id>","event":"lead","signature":"<hmac>"}'
```

## Scripts

| Commande         | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Serveur de développement             |
| `pnpm build`     | Build de production                  |
| `pnpm typecheck` | Vérification TypeScript              |
| `pnpm lint`      | ESLint                               |
| `pnpm db:migrate`| Migrations Prisma (dev)              |
| `pnpm db:deploy` | Migrations Prisma (prod)             |
| `pnpm db:seed`   | Données de démo                      |
| `pnpm db:studio` | Prisma Studio                        |

## Architecture

```
src/
  app/
    (marketing)/      Landing page publique
    (auth)/           Sign-in / Sign-up / Reset password
    (publisher)/      Dashboard publisher  (/dashboard)
    (advertiser)/     Dashboard annonceur  (/advertiser)
    (admin)/          Panel administrateur (/admin)
    api/              REST : auth, publisher, advertiser, admin, track
  components/
    ui/               Primitives shadcn/ui
    marketing/        Sections de la landing
    dashboard/        Composants des dashboards
  lib/
    auth.ts           Config Auth.js (credentials + bcrypt)
    rbac.ts           Guards de rôle & permissions
    rate-limit.ts     Rate limiting Redis (fail-open)
    fraud.ts          Heuristiques anti-fraude sur les clics
    validations/      Schémas Zod par domaine
  proxy.ts            Protection des routes par rôle (middleware)
prisma/
  schema.prisma       18 modèles (users, offres, tracking, paiements…)
  seed.ts             Données de démo réalistes
```

## Sécurité

- Mots de passe bcrypt (12 rounds), sessions JWT signées, statuts de compte (PENDING / ACTIVE / SUSPENDED / BANNED) vérifiés à chaque requête.
- RBAC : rôle global + permissions granulaires admin (table `Permission`).
- Validation Zod sur toutes les entrées API ; Prisma paramètre toutes les requêtes SQL.
- Rate limiting Redis sur l'auth, les mutations et le tracking ; postbacks signés HMAC.
- Headers de sécurité (CSP, X-Frame-Options, Referrer-Policy…) via `next.config.ts`.
- IP jamais stockées en clair (hash salé), cookies `httpOnly` + `sameSite`.
