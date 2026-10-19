# Fullstack FastAPI + Next.js Template

Template de base pour les projets **fullstack FastAPI et Next.js**, écrit en Python avec le framework **FastAPI**. Il fournit une architecture prête à l'emploi (authentification JWT, base de données, WebSocket, logging, monitoring, conteneurisation) qui évolue régulièrement en fonction des besoins.

## Sommaire

- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Architecture du projet](#architecture-du-projet)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Démarrage avec Docker](#démarrage-avec-docker)
- [Développement local](#développement-local)
- [Gestion des dépendances (uv)](#gestion-des-dépendances-uv)
- [Tests unitaires](#tests-unitaires)
- [API](#api)
- [Monitoring](#monitoring)

## Stack technique

| Domaine | Technologie |
|---|---|
| Langage | Python `>=3.11` (image Docker : `python:3.14`) |
| Framework web | FastAPI `0.148` + Uvicorn |
| Base de données | MySQL via SQLAlchemy `2.1` (ORM) + PyMySQL |
| Cache / Broker | Redis |
| Authentification | JWT (`python-jose`), hachage des mots de passe (`werkzeug` / `bcrypt`) |
| WebSocket temps réel | `python-socketio` (monté sur `/ws`) |
| Validation / config | Pydantic `2` + `pydantic-settings` |
| Monitoring | Prometheus (`prometheus-fastapi-instrumentator`) + Grafana + Signoz |
| Logging | Logs JSON rotatifs (`python-json-logger`, `TimedRotatingFileHandler`) |
| Tests | Pytest + Faker + HTTPX (`TestClient`) |
| Gestion des dépendances | [uv](https://github.com/astral-sh/uv) (`uv_build` comme build backend) |

## Fonctionnalités

- **Authentification JWT** : enregistrement, connexion et protection des routes via un token Bearer.
- **CRUD utilisateur** complet (routes protégées par JWT).
- **Réponses normalisées** : toutes les réponses suivent le schéma `{ status, status_code, message, data }`.
- **Gestion centralisée des exceptions** (HTTP, Werkzeug, Starlette, erreurs de validation) avec envoi d'e-mail à l'administrateur en cas d'erreur 500.
- **Middleware de logging** enregistrant chaque requête/réponse.
- **BaseTemplate** ORM offrant des helpers réutilisables (`get`, `getOrNone`, `getAll`, `saveWithCommit`, `deleteWithCommit`…).
- **WebSocket** prêt à l'emploi via Socket.IO.
- **Métriques Prometheus** exposées sur `/metrics`.
- **Healthcheck** sur `/api/healthcheck/`.
- **Conteneurisation complète** via Docker Compose (backend, MySQL, phpMyAdmin, Redis, Prometheus, Grafana, visualiseur de logs).

## Architecture du projet

```
.
├── docker-compose.yml          # Orchestration de tous les services
├── .env.dev / .env.test        # Variables d'environnement (dev / tests)
├── nginx/                      # Configuration du reverse proxy Nginx
├── monitoring/                 # Prometheus, Grafana, Signoz
└── backend/
    ├── Dockerfile
    ├── pyproject.toml          # Dépendances gérées par uv
    ├── uv.lock
    ├── run.py                  # Point d'entrée (crée l'app + dossiers logs/static)
    ├── logs/                   # Logs applicatifs (app.log)
    ├── test/                   # Tests unitaires (pytest)
    └── api/
        ├── __init__.py         # createApp() : factory FastAPI (routers, middlewares, handlers)
        ├── configs/            # Settings (pydantic-settings) + logging
        ├── database/           # engine, session, BaseTemplate, modèles ORM
        ├── schemas/            # Modèles Pydantic (requêtes / réponses)
        ├── views/              # Routes : auth, user, healthcheck
        ├── services/           # Logique métier : auth, jwt, mail, socket
        ├── middleware/         # Middleware de logging
        ├── utility/            # Lifespan, utilitaires
        └── html/               # Templates e-mail
```

## Configuration des variables d'environnement

Le projet utilise trois fichiers d'environnement :

| Fichier | Usage |
|---|---|
| `.env.dev` | Développement |
| `.env.test` | Tests unitaires |
| `.env.prod` | Production (à créer, non versionné) |

Pour démarrer :

1. Configurez `.env.dev` et `.env.test` pour votre environnement.
2. Configurez également `monitoring/grafana/.env.grafana` avant de lancer la stack complète.
3. Les fichiers `.env*` sont ignorés ; seuls les modèles suffixés `.example` sont destinés à être versionnés.

Principales variables :

| Variable | Description |
|---|---|
| `APP_NAME` | Nom de l'application |
| `SECRET_KEY` | Clé secrète de l'application |
| `JWT_SECRET` / `ALGORITHM` | Secret et algorithme de signature des tokens JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Durée de validité du token |
| `DATABASE_URL` | URL de connexion MySQL (`mysql+pymysql://…`) |
| `BACKEND_REDIS_HOST` / `BACKEND_REDIS_PORT` / `REDIS_PASSWORD` | Configuration Redis |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USERNAME` / `EMAIL_PASSWORD` | Configuration SMTP |
| `ADMINS_EMAIL` | Adresse recevant les alertes d'erreurs serveur |

> Les fichiers d’environnement locaux ne doivent pas être publiés avec leurs secrets.

## Démarrage avec Docker

L'ensemble de la stack se lance en une commande :

```bash
docker compose up
```

Services et ports exposés :

| Service | URL / Port | Description |
|---|---|---|
| **backend** | http://localhost:8080 | API FastAPI |
| Documentation API | http://localhost:8080/docs | Swagger UI |
| **phpMyAdmin** | http://localhost:8081 | Administration MySQL |
| **Prometheus** | http://localhost:9090 | Collecte des métriques |
| **Frontend** | http://localhost:3000 | Application Next.js |
| **Grafana** | http://localhost:3001 | Tableaux de bord |
| **Log viewer** | http://localhost:7777 | Visualisation des logs |
| MySQL | interne (`3306`) | Base de données |
| Redis | interne (`6379`) | Cache |

## Frontend Next.js

Base initialisée avec [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app) : App Router, TypeScript, Tailwind CSS et ESLint. Node.js 24 et npm sont utilisés ; `frontend/package-lock.json` doit être versionné.

```bash
cd frontend
npm ci
npm run dev
```

Ouvrez http://localhost:3000. Les commandes `npm run lint`, `npm run typecheck` et `npm run build` permettent de vérifier le frontend. Après un build, `npm start` démarre le serveur de production.

Le Dockerfile frontend est prévu pour le développement avec rechargement automatique. Compose utilise des volumes dédiés pour `node_modules` et `.next`. Après modification des dépendances, exécutez `docker compose run --rm frontend npm ci`, puis reconstruisez le service.

Le backend Docker installe ses dépendances dans `/opt/venv`, hors du dossier source monté dans `/app`. Le démarrage utilise cet environnement directement ; Uvicorn surveille uniquement `/app/api` : les environnements locaux `.venv` et `venv` ne déclenchent plus de rechargement. Après modification du point d’entrée `run.py`, redémarrez le backend avec `docker compose restart backend`. Après modification de `pyproject.toml` ou `uv.lock`, reconstruisez et recréez le backend :

```bash
docker compose up -d --build backend
```

## Développement local

Prérequis : [uv](https://github.com/astral-sh/uv) installé.

```bash
cd backend
uv sync                 # installe les dépendances depuis uv.lock
uv run uvicorn run:app --host 0.0.0.0 --port 8000 --reload
```

> Une instance MySQL et Redis accessibles (par exemple via `docker compose up mysql redis`) sont nécessaires, avec un `DATABASE_URL` correctement configuré.

## Gestion des dépendances (uv)

Le projet a migré de Poetry vers **uv**. Les dépendances sont déclarées dans [`backend/pyproject.toml`](backend/pyproject.toml) et verrouillées dans `backend/uv.lock`.

```bash
# Ajouter une dépendance
uv add <package>

# Synchroniser l'environnement avec le lockfile
uv sync

# Mettre à jour le lockfile
uv lock
```

## Dépendances backend mises à jour

Les contraintes de `backend/pyproject.toml` ciblent les versions stables disponibles au 19 octobre 2026 ; `backend/uv.lock` verrouille la résolution exacte. Les bornes supérieures limitent les changements majeurs (ou mineurs pour les paquets en version 0.x).

| Dépendance | Version verrouillée |
|---|---|
| FastAPI / Starlette | 0.148.0 / 1.9.0 |
| Uvicorn | 0.54.0 |
| SQLAlchemy / PyMySQL | 2.1.5 / 1.2.3 |
| Pydantic / pydantic-settings | 2.14.1 / 2.16.0 |
| Redis (client Python) | 8.1.0 |
| HTTPX / Pytest | 0.28.1 / 9.1.1 |
| Cryptography / bcrypt | 50.0.2 / 5.0.0 |
| Python Socket.IO | 5.17.0 |

Validation effectuée sous Python 3.14 en Docker : installation figée, `uv pip check`, neuf tests sur MySQL 8.4 isolé (création/mise à jour utilisateur, healthcheck, Swagger/OpenAPI, métriques Prometheus, handshakes Socket.IO polling et WebSocket, validation HTTP). Le montage Socket.IO utilise le chemin complet `/ws/socket.io` pour être compatible avec Starlette actuel. La compatibilité Python 3.11 reste déclarée et résolue par uv, mais son exécution n’a pas été testée.

## Tests unitaires

Les tests utilisent `pytest`, `Faker` et le `TestClient` de FastAPI. Ils s'appuient sur `.env.test`.

```bash
cd backend
uv sync
uv run pytest
```

La classe [`BaseTest`](backend/test/baseTest.py) fournit des utilitaires (création d'un utilisateur de test, récupération de token, assertions de base) pour écrire de nouveaux tests rapidement.

## API

Toutes les réponses respectent le schéma standard suivant :

```json
{
    "status": 1,
    "status_code": 200,
    "message": "ok",
    "data": {}
}
```

### Authentification — `/api/auth`

#### Enregistrement d'un utilisateur

**URL** : `/api/auth/register` — **Méthode** : `POST`

```json
{
    "username": "johndoe",
    "password": "motdepasse",
    "telephone": "+1234567890"
}
```

**Réponse** :
```json
{
    "status": 1,
    "status_code": 200,
    "message": "ok",
    "data": { "username": "johndoe", "telephone": "+1234567890" }
}
```

#### Connexion

**URL** : `/api/auth/login` — **Méthode** : `POST`

```json
{
    "username": "johndoe",
    "password": "motdepasse"
}
```

**Réponse** :
```json
{
    "status": 1,
    "status_code": 200,
    "message": "ok",
    "data": { "username": "johndoe", "token": "<JWT>" }
}
```

> Le token JWT retourné doit être envoyé dans l'en-tête `Authorization: Bearer <token>` pour accéder aux routes protégées.

### Utilisateurs — `/api/user` *(routes protégées par JWT)*

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/user/` | Liste de tous les utilisateurs |
| `GET` | `/api/user/{username}` | Détails d'un utilisateur |
| `PUT` | `/api/user/{username}` | Mise à jour d'un utilisateur |
| `DELETE` | `/api/user/{username}` | Suppression d'un utilisateur |

### Autres routes

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/healthcheck/` | Vérification de l'état du service |
| `GET` | `/metrics` | Métriques Prometheus |
| `WS` | `/ws/socket.io/` | Connexion WebSocket (Socket.IO) |

## Monitoring

- **Prometheus** scrute l'endpoint `/metrics` du backend (voir [`monitoring/prometheus/prometheus.yml`](monitoring/prometheus/prometheus.yml)).
- **Grafana** permet de visualiser les métriques collectées (dashboards et sources de données préconfigurés).
- **Signoz** est également disponible dans le dossier `monitoring/` pour l'observabilité applicative.
- Les logs applicatifs sont écrits dans `backend/logs/app.log` (rotation quotidienne) et consultables via le **log viewer** sur le port `7777`.
