# Frontend Next.js

App Router, TypeScript, Tailwind CSS et ESLint. Prérequis : Node.js 24 (voir `.nvmrc`).

```bash
npm ci
npm run dev
```

Application : http://localhost:3000. Point de départ : `src/app/page.tsx`.

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

Le Dockerfile démarre le serveur de développement. Depuis la racine : `docker compose up --build frontend`.

Les liens vers l’API locale sont à adapter lors de la personnalisation du template. Voir le README racine pour la configuration du backend et les ports de la stack.

## Dépendance transitive ESLint

Un override ciblé remplace `fast-glob` par `tinyglobby@0.2.17` uniquement dans `@next/eslint-plugin-next`. Cela supprime la chaîne vulnérable `micromatch` / `braces` (GHSA-vfj7-8cjw-p6xm), sans rétrograder Next.js ni désactiver ses règles ESLint. Le plugin utilise uniquement `globSync` avec `onlyDirectories`, pris en charge par cette alternative. Réévaluer cet override lorsqu’un correctif amont sera publié.
