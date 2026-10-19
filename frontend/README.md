# Frontend Next.js

Next.js App Router, TypeScript et Tailwind CSS. Node.js 24 requis (`.nvmrc`).

```bash
npm ci
npm run dev
```

Ouvrir http://localhost:3000. Les commandes npm chargent le fichier `.env.dev` à la racine du projet, sans fichier env dans `frontend/`. FastAPI doit être accessible à `BACKEND_URL` côté serveur (défaut `http://127.0.0.1:8080`). Compose configure `http://backend:80`.

## Parcours

- `/` : accueil et navigation selon la session.
- `/inscription` : création de compte puis connexion automatique.
- `/connexion` : authentification avec validation des champs.
- `/profil` : téléphone, photo et dernière connexion dans le fuseau du navigateur. L’identifiant reste en lecture seule.
- Navbar : photo du compte, menu accessible au clavier, profil et déconnexion.

Photos JPEG, PNG ou WebP, maximum 5 Mio. FastAPI valide et convertit les images en WebP. La dernière connexion correspond à la dernière authentification réussie, enregistrée en UTC.

## Architecture réutilisable

| Emplacement | Responsabilité |
|---|---|
| `src/lib/api/client.ts` | Transport navigateur commun, JSON/FormData, erreurs et annulation |
| `src/lib/api/server.ts` | Transport serveur vers FastAPI, cookie, origine et limite des corps |
| `src/app/api/[...path]/route.ts` | Routes Next.js explicitement autorisées |
| `src/features/auth/api.ts` | Service métier typé |
| `src/features/auth/hooks.ts` | Requêtes et mutations TanStack Query |
| `src/features/auth/schemas.ts` | Validation Zod partagée entre formulaires et serveur |
| `src/components/providers.tsx` | QueryClient, expiration et synchronisation entre onglets |
| `src/components/ui` | Champs et avatar réutilisables |

Pour une nouvelle fonctionnalité, définir types et service HTTP, autoriser ses routes côté Next.js, puis créer des hooks avec des clés Query dédiées. Invalider les données concernées après mutation. TanStack Query gère les données serveur et React Hook Form l’état des formulaires ; Redux n’est pas nécessaire pour ces usages.

## Session et configuration

Ces variables sont définies dans `.env.dev` à la racine. `APP_ORIGIN=http://localhost:3000` correspond à l’adresse du navigateur en développement ; adapter cette valeur si l’application est ouverte depuis une autre origine.

Le JWT reste dans le cookie `template_session`, HttpOnly et SameSite=Lax ; il n’est transmis ni au JavaScript navigateur ni au stockage local. FastAPI conserve les contrôles d’accès. Les réponses privées utilisent `no-store`, les mutations vérifient `Origin`, et les changements de compte purgent le cache privé et synchronisent les onglets via BroadcastChannel.

- `BACKEND_URL` : URL interne du backend, uniquement côté serveur (`http://127.0.0.1:8080` sur l’hôte ; Compose la remplace par `http://backend:80`).
- `APP_ORIGIN` : origine publique exacte, à définir derrière un proxy, par exemple `https://app.example.com`. Sinon comparaison avec le protocole et le Host de la requête.
- `NEXT_TELEMETRY_DISABLED=1` : désactive la télémétrie Next.js.
- `SESSION_COOKIE_SECURE` : Secure activé par défaut en production. `false` sert uniquement aux essais locaux HTTP d’un build de production.

La déconnexion retire le cookie et le cache privé ; elle ne révoque pas un JWT déjà émis côté API, valable jusqu’à son expiration. Aucun secret ne doit porter le préfixe `NEXT_PUBLIC_`.

Sur une base existante, appliquer d’abord la migration backend `last_login_at` : voir le README racine.

## Vérifications

```bash
npm run lint
npm run typecheck
npm run build
npm audit
# Frontend et backend démarrés :
npm run test:api
```

Le test HTTP vérifie session, cookie, refus d’origine, profil, photo privée, déconnexion et reconnexion avec un compte temporaire supprimé en fin de test. Adresses personnalisables via `FRONTEND_TEST_URL` et `BACKEND_TEST_URL`.

Le Dockerfile sert au développement : `docker compose up --build frontend` depuis la racine. Après modification des dépendances, synchroniser aussi le volume avec `docker compose run --rm --no-deps frontend npm ci`.

## Dépendance transitive ESLint

Un override ciblé remplace `fast-glob` par `tinyglobby@0.2.17` uniquement dans `@next/eslint-plugin-next`. Cela supprime la chaîne vulnérable `micromatch` / `braces` (GHSA-vfj7-8cjw-p6xm), sans rétrograder Next.js ni désactiver ses règles ESLint. Le plugin utilise uniquement `globSync` avec `onlyDirectories`, pris en charge par cette alternative. Réévaluer cet override lorsqu’un correctif amont sera publié.

## Surveillance en développement

L’import Tailwind de `src/app/globals.css` limite la détection des classes à `src` avec `source("..")`. Conserver cette limite : une détection depuis la racine du frontend inclut des fichiers techniques générés et peut entraîner des recompilations et rechargements répétés. Après modification de ce périmètre, redémarrer le service frontend pour réinitialiser ses dépendances de surveillance.
