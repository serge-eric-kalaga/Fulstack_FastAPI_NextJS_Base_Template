# Fullstack FastAPI + Next.js Template

Base réutilisable pour des applications avec une API **FastAPI** et un frontend **Next.js**. Le backend fournit l’authentification JWT, la gestion des utilisateurs, Socket.IO, les e-mails et les métriques. Le frontend propose une navbar responsive, l’inscription, la connexion et un espace personnel avec téléphone, photo et dernière connexion. Il inclut le français et l’anglais, ainsi que les thèmes clair, sombre et système.

## Sommaire

- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Configuration](#configuration)
- [Démarrage avec Docker](#démarrage-avec-docker)
- [Développement local](#développement-local)
- [API et authentification](#api-et-authentification)
- [Cache Redis réutilisable](#cache-redis-réutilisable)
- [Photos de profil](#photos-de-profil)
- [Envoi des e-mails](#envoi-des-e-mails)
- [Logs et monitoring](#logs-et-monitoring)
- [Migrations avec Alembic](#migrations-avec-alembic)
- [Gestion des dépendances](#gestion-des-dépendances)
- [Tests et vérifications](#tests-et-vérifications)
- [Intégration continue avec GitHub Actions](#intégration-continue-avec-github-actions)

## Stack technique

| Domaine | Technologies du projet |
|---|---|
| Frontend | Next.js 16.4.2, React 19.3, TypeScript, App Router |
| Styles et qualité | Tailwind CSS 4, ESLint, contrôle TypeScript |
| Runtime frontend | Node.js 24, npm et `package-lock.json` |
| Backend | Python `>=3.11,<4`, image Docker Python 3.14, FastAPI 0.148, Uvicorn |
| Validation | Pydantic 2, pydantic-settings |
| Base de données | MySQL, SQLAlchemy 2.1, PyMySQL |
| Cache | fastapi-redis-sdk 0.9.1, Redis 7.4+ ; dépendances GET et invalidation par groupe |
| Authentification | JWT avec python-jose ; hachage à la création du compte avec Werkzeug |
| Temps réel | Socket.IO, transports polling et WebSocket |
| E-mails | SMTP avec STARTTLS, modèles HTML Jinja2 |
| Observabilité | Prometheus, Grafana, journaux texte avec rotation quotidienne |
| Tests | Pytest, Faker, TestClient FastAPI et mocks SMTP |
| Dépendances Python | uv, `pyproject.toml` et `uv.lock` |

Les versions exactes sont définies dans [frontend/package-lock.json](frontend/package-lock.json) et [backend/uv.lock](backend/uv.lock).

## Structure du projet

```text
.
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── run.py                    # Point d’entrée ASGI
│   ├── logs/                     # app.log et archives de rotation
│   ├── static/uploads/           # Fichiers téléversés, dont profile_photos/
│   ├── test/                     # Tests applicatifs et de non-régression
│   └── api/
│       ├── __init__.py            # Factory createApp, routes et exceptions
│       ├── configs/              # Paramètres et journalisation
│       ├── database/             # Modèles SQLAlchemy et BaseTemplate
│       ├── schemas/              # Schémas Pydantic et documentation OpenAPI
│       ├── views/                # Routes auth, utilisateurs et healthcheck
│       ├── services/             # Authentification, JWT, e-mails et Socket.IO
│       ├── html/email/           # Modèles HTML des e-mails
│       ├── middleware/
│       └── utility/
├── frontend/
│   ├── Dockerfile                # Serveur de développement Next.js
│   ├── package.json
│   ├── package-lock.json
│   └── src/app/                  # Layout, page d’accueil et styles
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   └── signoz/                   # Fichiers séparés, hors du Compose principal
└── nginx/                        # Configuration séparée, hors du Compose principal
```

## Configuration

Préparer les fichiers locaux suivants avant de démarrer :

| Fichier | Utilisation |
|---|---|
| `.env.dev` | Injecté par Compose dans le backend, le frontend, MySQL, Redis et phpMyAdmin |
| `.env.test` | Chargé par la suite de tests backend |
| `.env.grafana` | Injecté dans Grafana |

Tous les fichiers d’environnement sont conservés à la racine du projet ; aucun fichier env ne doit être ajouté dans `frontend/` ou `backend/`. Les fichiers `.env` et `.env.*` sont ignorés par Git. Les modèles `.env.example` et `.env.*.example` peuvent être versionnés. Le fichier `.env.prod`, s’il est créé, nécessite une configuration de déploiement dédiée : le Compose actuel utilise `.env.dev`.

### Backend

| Variable | Utilisation |
|---|---|
| `APP_NAME` | Nom affiché par l’API et dans les alertes e-mail |
| `SECRET_KEY` | Clé de configuration de l’application |
| `JWT_SECRET` | Secret de signature des jetons JWT |
| `ALGORITHM` | Algorithme JWT, par exemple `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Durée de validité des jetons, en minutes |
| `DATABASE_URL` | Connexion SQLAlchemy, par exemple `mysql+pymysql://<user>:<password>@mysql:3306/<database>` dans Compose |
| `REDIS_URL` | URL du SDK Redis ; Compose utilise `redis://redis:6379/0` par défaut |
| `REDIS_DATABASE_URL` | Ancien nom compatible, utilisé si `REDIS_URL` est absent |
| `REDIS_PREFIX` | Namespace du cache (défaut `fullstack:dev:v1`), à rendre unique par projet et environnement |
| `CACHE_ENABLED` | Activer le cache (défaut `true`) |
| `CACHE_TTL_SECONDS` | TTL par défaut strictement positif (60 secondes) |
| `PROFILE_PHOTO_DIR` | Répertoire des photos (défaut `static/uploads/profile_photos`) |
| `PROFILE_PHOTO_MAX_BYTES` | Limite du fichier téléversé (défaut 5 Mio) |
| `PROFILE_PHOTO_MAX_PIXELS` | Limite de pixels avant décodage complet (défaut 16 millions) |
| `ADMINS_EMAIL` | Adresses des administrateurs séparées par des virgules |
| `EMAIL_DOMAIN` | Domaine de l’expéditeur `notification@<domaine>` |
| `EMAIL_HOST`, `EMAIL_PORT` | Serveur et port SMTP |
| `EMAIL_USERNAME`, `EMAIL_PASSWORD` | Identifiants SMTP |

`APP_NAME`, `ADMINS_EMAIL`, `SECRET_KEY`, `JWT_SECRET`, `ALGORITHM` et `DATABASE_URL` sont requis par la configuration Pydantic. Pour envoyer des e-mails, renseigner également les paramètres SMTP.

Configurer les variables `MYSQL_*` attendues par l’image MySQL et les variables `PMA_*` de phpMyAdmin dans `.env.dev`. Les identifiants et le nom de base doivent correspondre à `DATABASE_URL`. Adapter également la source MySQL définie dans [datasources.yaml](monitoring/grafana/datasources.yaml) ; ne pas conserver d’identifiants réels dans un fichier versionné.

## Démarrage avec Docker

Prérequis : Docker et Docker Compose, avec les fichiers d’environnement préparés.

```bash
# Vérifier la configuration sans afficher les valeurs résolues
docker compose config --quiet

# Construire et démarrer la stack
docker compose up -d --build

# Consulter l’état et les logs
docker compose ps
docker compose logs -f backend frontend
```

| Service | Accès depuis l’hôte |
|---|---|
| Frontend Next.js | [localhost:3000](http://localhost:3000) |
| Backend FastAPI | [localhost:8080](http://localhost:8080) |
| Swagger UI | [localhost:8080/docs](http://localhost:8080/docs) |
| Schéma OpenAPI | [localhost:8080/openapi.json](http://localhost:8080/openapi.json) |
| Healthcheck | [localhost:8080/api/healthcheck/](http://localhost:8080/api/healthcheck/) |
| phpMyAdmin | [localhost:8081](http://localhost:8081) |
| Prometheus | [localhost:9090](http://localhost:9090) |
| Grafana | [localhost:3001](http://localhost:3001) |
| Visualiseur de logs | [localhost:7777](http://localhost:7777) |
| MySQL / Redis | Réseau Docker uniquement, ports internes 3306 / 6379 |

Les données MySQL, Prometheus et Grafana utilisent des volumes Docker nommés. Les photos utilisent le volume `backend_uploads`, monté dans `/app/static/uploads`, et survivent aux recréations du backend. Le frontend possède des volumes distincts pour `node_modules` et `.next`.

Le Compose et les Dockerfiles actuels servent au développement : rechargement automatique activé côté backend et frontend. Ils doivent être adaptés avant un déploiement en production.

### Rechargement du backend

Le code `backend/` est monté dans `/app`. Les dépendances Python sont installées dans `/opt/venv` au build et restent disponibles malgré ce montage. Le serveur démarre directement avec cet environnement, sans réinstaller les dépendances à chaque lancement.

Uvicorn surveille uniquement `/app/api`. Les changements dans les environnements locaux `.venv` et `venv` ne provoquent plus de rechargement.

```bash
# Après modification de run.py
docker compose restart backend

# Après modification des dépendances ou du Dockerfile backend
docker compose up -d --no-deps --build backend

# Arrêter la stack en conservant les volumes
docker compose down
```

## Développement local

### Frontend

Prérequis : Node.js 24 et npm. La version Node est indiquée dans `frontend/.nvmrc`.

```bash
cd frontend
npm ci
npm run dev
```

Ouvrir [localhost:3000](http://localhost:3000). Le point de départ est [page.tsx](frontend/src/app/page.tsx). Configurer `BACKEND_URL` côté serveur Next.js pour joindre FastAPI ; Compose définit déjà cette adresse.

Après un build, `npm start` permet de démarrer le serveur Next.js en mode production. Voir aussi le [README frontend](frontend/README.md).

### Backend

Prérequis : Python compatible, uv et une base MySQL accessible depuis l’hôte.

```bash
cd backend
uv sync --frozen
uv run --env-file ../.env.dev uvicorn run:app --host 0.0.0.0 --port 8000 --reload --reload-dir api
```

Le backend local est alors disponible sur le port 8000. Définir `BACKEND_URL=http://127.0.0.1:8000` dans le fichier `.env.dev` à la racine pour utiliser ce backend.

Les noms `mysql` et `redis` ne sont résolus que dans le réseau Docker. Pour un backend exécuté sur l’hôte, utiliser des services accessibles depuis l’hôte et adapter leurs URL. Le Compose actuel ne publie pas les ports MySQL et Redis.

## API et authentification

Les réponses applicatives utilisent l’enveloppe suivante ; les champs présents peuvent varier pour les erreurs :

```json
{
  "status": 1,
  "status_code": 200,
  "message": "ok",
  "data": {}
}
```

### Authentification

| Méthode | Route | Utilisation |
|---|---|---|
| `POST` | `/api/auth/register` | Créer un compte |
| `POST` | `/api/auth/login` | Se connecter avec un corps JSON |
| `POST` | `/api/auth/doc-login` | Connexion OAuth2 par formulaire pour Swagger |

Exemple de création de compte :

```json
{
  "username": "utilisateur_demo",
  "password": "ExempleMotDePasse!2026",
  "telephone": "+22670000000"
}
```

La connexion JSON attend `username` et `password`. Elle retourne `data.username` et `data.token`. Envoyer ensuite le jeton dans l’en-tête `Authorization: Bearer <token>` pour accéder aux routes protégées. Dans Swagger, utiliser le bouton **Authorize**.

### Utilisateurs

Ces routes nécessitent un jeton Bearer valide.

| Méthode | Route | Utilisation |
|---|---|---|
| `GET` | `/api/user/me` | Compte connecté et dernière connexion UTC |
| `PATCH` | `/api/user/me` | Modifier son téléphone (`null` pour le supprimer) |
| `PATCH` | `/api/user/me/email` | Définir son adresse de récupération avec le mot de passe actuel |
| `PUT` | `/api/user/me/password` | Modifier son mot de passe et révoquer les sessions |
| `GET` | `/api/user/` | Lister les utilisateurs |
| `GET` | `/api/user/{username}` | Consulter un utilisateur |
| `PUT` | `/api/user/{username}` | Mettre à jour son propre compte, hors identifiants sensibles |
| `DELETE` | `/api/user/{username}` | Supprimer son propre compte |

L’adresse e-mail est privée : elle est présente uniquement dans `/api/user/me`, jamais dans les listes ou profils publics. Le changement de mot de passe passe exclusivement par sa route dédiée ; le champ `password` est refusé sur la mise à jour générique.

Les descriptions et exemples des attributs sont définis dans [schemas/user.py](backend/api/schemas/user.py) et visibles dans Swagger. Pour une mise à jour, les attributs omis ou à `null` sont ignorés par le service actuel.

### Autres points d’entrée

| Protocole | Route | Utilisation |
|---|---|---|
| HTTP GET | `/api/healthcheck/` | Vérifier que l’API répond |
| HTTP GET | `/metrics` | Exposer les métriques Prometheus |
| Socket.IO | `/ws/socket.io/` | Handshake polling ou WebSocket avec un client Socket.IO |

Le healthcheck actuel ne teste pas explicitement Redis ni une requête SQL. Le montage Socket.IO utilise le chemin complet `/ws/socket.io` pour correspondre au routage Starlette.

## Cache Redis réutilisable

Le [SDK Redis officiel pour FastAPI](https://github.com/redis/fastapi-redis-sdk) est initialisé dans `configure_cache` et conserve le lifespan de l’application. Les connexions sont fermées à l’arrêt. Le module [services/cache.py](backend/api/services/cache.py) fournit deux dépendances :

```python
from fastapi import Depends
from api.services.cache import cached_response, invalidate_cache

@router.get("/products", dependencies=[Depends(cached_response("products", ttl=120))])
def list_products():
    return {"items": []}

@router.post("/products", dependencies=[Depends(invalidate_cache("products"))])
def create_product():
    # Valider l’écriture SQL avant de retourner la réponse.
    return {"created": True}
```

- `cached_response` authentifie par JWT par défaut, y compris sur un HIT. La clé combine chemin, paramètres de requête et identité utilisateur hachée ; elle ne contient pas le jeton.
- Pour un contenu public, demander explicitement `authenticated=False`. Ne pas mettre en cache les routes de connexion ni les réponses contenant des secrets.
- `invalidate_cache` efface le groupe uniquement après une écriture réussie. Appliquer cette dépendance à toutes les routes qui modifient les données du groupe.
- Les lectures utilisateur (liste et détail) utilisent le groupe `users`. Création, mise à jour, suppression et remplacement de photo invalident ce groupe.
- Le SDK expose `X-Redis-Cache: MISS`, `HIT` ou `BYPASS`. Les réponses privées portent `Cache-Control: no-store` pour ne pas être conservées par les navigateurs/proxies ; Redis conserve son entrée jusqu’au TTL ou à l’invalidation.
- Si Redis devient indisponible, les opérations de cache échouent en mode dégradé : l’API continue de lire/écrire dans la base. Une invalidation manquée peut laisser une ancienne entrée jusqu’à son expiration.

Pour les tests unitaires sans Redis réel, remplacer `get_cache_client` via `app.dependency_overrides`. Le TTL est toujours borné et strictement positif dans le helper. Le préfixe doit être unique par projet/environnement ; le modifier lors d’un changement incompatible du format des réponses. Les paramètres réseau du SDK (`REDIS_SOCKET_TIMEOUT`, `REDIS_SOCKET_CONNECT_TIMEOUT`, etc.) restent configurables par environnement.

Dans Compose, `REDIS_URL` est injecté avec une valeur par défaut. Pour un Redis différent, définir cette variable dans l’environnement de Compose ou son fichier `.env`. `CACHE_ENABLED=false` permet de travailler sans cache. Les identifiants Redis éventuels doivent correspondre à la configuration du serveur.

## Photos de profil

La page frontend `/profil` permet de modifier sa photo et son téléphone. Le menu de la navbar affiche la dernière connexion et propose la déconnexion.

| Méthode | Route | Utilisation |
|---|---|---|
| `PUT` | `/api/user/me/photo` | Ajouter/remplacer sa propre photo avec le champ multipart `photo` |
| `GET` | `/api/user/{username}/photo` | Lire une photo avec un jeton Bearer valide |

L’utilisateur cible du téléversement est déterminé par le JWT : aucun identifiant d’un autre compte n’est accepté. La réponse contient `data.profile_photo_url`, également présent dans les lectures utilisateur ; il vaut `null` en l’absence de photo. Cette URL relative nécessite un en-tête `Authorization: Bearer <token>` à la lecture.

Les formats acceptés sont JPEG, PNG et WebP fixes. Le serveur contrôle le type réel, rejette les fichiers invalides/animés, limite la taille et le nombre de pixels, puis réencode les pixels en WebP sans métadonnées, au maximum 1024 × 1024. Les noms de fichier sont générés côté serveur. Une photo refusée ne remplace pas l’ancienne ; en cas d’échec du commit SQL, le nouveau fichier est supprimé. Après remplacement réussi, l’ancien fichier est supprimé. La suppression du compte nettoie également sa photo.

Les fichiers binaires ne sont pas stockés dans Redis. Leur lecture utilise `Cache-Control: private, no-store` et `X-Content-Type-Options: nosniff`.

Les fichiers téléversés sont regroupés sous `static/uploads/`. Le volume `backend_uploads` est réutilisé au nouveau point de montage : ses photos existantes restent disponibles sans copie. Les photos restent servies par la route authentifiée ; ce dossier n’est pas exposé publiquement par StaticFiles.

Le volume `backend_uploads` conserve les images ; sauvegarder ce volume avec la base SQL. Pour plusieurs instances sur des machines différentes, remplacer ce stockage local par un stockage partagé.

## Envoi des e-mails

Le service [mail.py](backend/api/services/mail.py) expose `send_email(receiver_email, message_text, object)` :

```python
from api.services.mail import send_email

# Une adresse
send_email(
    receiver_email="alice@example.invalid",
    message_text="<p>Bonjour.</p>",
    object="Notification",
)

# Plusieurs adresses
send_email(
    receiver_email=["alice@example.invalid", "bob@example.invalid"],
    message_text="<p>Bonjour à tous.</p>",
    object="Notification collective",
)
```

Une chaîne représente une seule adresse ; utiliser une liste pour plusieurs destinataires. Les espaces sont supprimés et les doublons retirés. Les destinataires d’un envoi collectif figurent dans l’en-tête `To` et sont donc visibles entre eux.

La fonction utilise SMTP avec STARTTLS et authentification. Elle retourne `True` si tous les destinataires sont acceptés par le serveur SMTP, `False` si la liste est vide, si un destinataire est refusé ou si l’envoi échoue. En cas de refus partiel, certains destinataires peuvent tout de même avoir reçu l’e-mail ; l’acceptation SMTP ne garantit pas sa réception finale.

`send_app_exception_to_admin` effectue des envois individuels aux adresses de `ADMINS_EMAIL`. Le modèle [error500_admin_mail.html](backend/api/html/email/error500_admin_mail.html) affiche le nom de l’application, le type et le message d’erreur, ainsi que l’horodatage UTC. Il échappe les variables HTML et utilise l’identité FastAPI + Next.js.

## Logs et monitoring

### Journaux applicatifs

- Fichier : `backend/logs/app.log`, conservé dans le dossier monté depuis l’hôte.
- Les démarrages et rechargements conservent son contenu ; `run.py` ouvre le fichier en mode ajout.
- Rotation quotidienne à minuit UTC avec conservation de 200 archives au maximum.
- Format texte avec date, chemin du fichier appelant, numéro de ligne et niveau ; le logger configuré n’utilise pas de format JSON.
- Fonctions : `logInfo`, `logDebug`, `logError` et `logResponse` dans [logging.py](backend/api/configs/logging.py).

Le middleware de la factory journalise actuellement les requêtes du healthcheck, des métriques et du chemin Socket.IO explicitement listé dans son code. Il ne journalise pas toutes les routes HTTP.

Le visualiseur de logs rend le dossier `backend/logs` accessible sur le port 7777. Réserver cet accès à l’environnement de développement prévu.

### Prometheus et Grafana

Prometheus collecte les métriques de `backend:80/metrics` toutes les 15 secondes. Sa configuration se trouve dans [prometheus.yml](monitoring/prometheus/prometheus.yml).

Grafana provisionne les sources Prometheus et MySQL depuis [datasources.yaml](monitoring/grafana/datasources.yaml). Les tableaux de bord métier restent à construire. Les nombreuses migrations Grafana sont attendues lors de l’initialisation d’un volume neuf.

Le dossier `monitoring/signoz` et la configuration Nginx sont séparés ; aucun service correspondant n’est démarré par le Compose principal.

## Migrations avec Alembic

Alembic est configuré dans [backend/alembic.ini](backend/alembic.ini) et [migrations/env.py](backend/migrations/env.py). Il utilise `DATABASE_URL` et les métadonnées des modèles SQLAlchemy. La migration `0001_last_login_at` ajoute la dernière connexion. Si SQLAlchemy a déjà créé cette colonne sur une base neuve, elle vérifie sa compatibilité. Exécuter `alembic upgrade head` avant de redémarrer le backend sur une base existante.

Après modification d’un modèle, depuis `backend/`, générer une migration en comparant les modèles à la base de développement existante :

```bash
uv sync --frozen
uv run --env-file ../.env.dev alembic revision --autogenerate -m "Ajouter un champ utilisateur"
```

Relire le fichier généré dans `migrations/versions/`, puis appliquer la migration avant de redémarrer le backend :

```bash
uv run --env-file ../.env.dev alembic upgrade head
uv run --env-file ../.env.dev alembic current
uv run --env-file ../.env.dev alembic check
```

Pour utiliser la connexion MySQL interne de Compose, exécuter ces commandes dans le conteneur backend (après reconstruction de son image pour installer Alembic) :

```bash
docker compose build backend
docker compose run --rm --no-deps backend alembic revision --autogenerate -m "Ajouter un champ utilisateur"
docker compose run --rm --no-deps backend alembic upgrade head
docker compose run --rm --no-deps backend alembic current
docker compose run --rm --no-deps backend alembic check
```

Le montage du code conserve les fichiers générés sur l’hôte. Versionner chaque migration avec la modification du modèle. `revision --autogenerate` génère un fichier à relire ; `upgrade head` l’applique. `check` indique les différences restantes entre modèles et base. Pour consulter les migrations : `alembic history`. Pour annuler la dernière migration sur une base de test : `alembic downgrade -1` ; les pertes de données dépendent des opérations présentes dans `downgrade()`.

Le démarrage actuel de l’application reste inchangé. Les commandes Alembic sont exécutées explicitement et aucune migration des anciens changements n’est ajoutée. Le test [test_alembic.py](backend/test/test_alembic.py) génère une future modification dans un dossier temporaire, vérifie son application et son annulation en conservant l’utilisateur de test.

## Gestion des dépendances

### Backend avec uv

Depuis `backend/` :

```bash
uv add <package>       # Ajouter une dépendance et mettre à jour le lockfile
uv sync --frozen       # Installer la résolution verrouillée
uv lock --upgrade      # Mettre à jour dans les contraintes de pyproject.toml
```

Versionner `pyproject.toml` et `uv.lock` ensemble. Pour changer une version majeure au-delà des bornes déclarées, adapter les contraintes puis vérifier la compatibilité applicative.

### Frontend avec npm

Depuis `frontend/` :

```bash
npm install <package>
npm ci
npm audit
```

Versionner `package.json` et `package-lock.json` ensemble. Un override ciblé du plugin ESLint Next.js remplace sa dépendance `fast-glob` par `tinyglobby@0.2.17`, afin de supprimer la chaîne vulnérable `micromatch` / `braces` sans rétrograder Next.js. Réévaluer cet override lors d’un correctif amont ; détails dans le [README frontend](frontend/README.md).

Dans Compose, après modification des dépendances frontend, synchroniser le volume `node_modules`, puis reconstruire le service :

```bash
docker compose run --rm --no-deps frontend npm ci
docker compose up -d --no-deps --build frontend
```

## Tests et vérifications

### Backend

Configurer `.env.test` avec une **base exclusivement réservée aux tests** : `BaseTest.setUpClass` supprime les tables avant les tests utilisateurs.

```bash
cd backend
uv sync --frozen
CACHE_ENABLED=false uv run pytest -q
```

La suite couvre la création et la mise à jour des utilisateurs, les routes de disponibilité et de documentation, les métriques, les handshakes Socket.IO, la validation HTTP, les destinataires e-mail et les échecs SMTP simulés, ainsi que la conservation des logs sur deux chargements du point d’entrée.

Dernière validation réalisée : **59 tests réussis sur SQLite et sur MySQL 8.4**, sous Python 3.14 avec Redis 7.4 isolé. Les tests incluent le cache HIT/MISS, les clés par utilisateur, l’authentification sur HIT, l’expiration, les écritures réussies/refusées, les pannes Redis, les photos et leur rollback, ainsi que la génération et l’application d’une future migration Alembic sur une base jetable. Les tests d’e-mail utilisent des mocks et n’effectuent aucun envoi réel. L’exécution sous Python 3.11 reste non testée.

Pour inclure les tests Redis, définir `TEST_REDIS_URL` vers une instance **réservée aux tests**. Sans cette variable, les scénarios d’intégration Redis sont ignorés. Pour les autres tests sans Redis, utiliser `CACHE_ENABLED=false` :

```bash
cd backend
CACHE_ENABLED=false uv run pytest -q
# Avec un Redis de test accessible :
CACHE_ENABLED=false TEST_REDIS_URL=redis://localhost:6379/15 uv run pytest -q
```

### Frontend

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
npm run test:i18n
# Frontend et backend démarrés :
npm run test:api
npm run test:passwords
npm audit
```

Dernières vérifications réalisées : lint, typage, build de production en conteneur et affichage navigateur réussis ; audit npm sans vulnérabilité signalée lors de cette validation. Le rechargement backend a aussi été vérifié : modification du code API détectée, modifications des environnements Python ignorées, healthcheck HTTP 200.

### Session frontend

TanStack Query partage le compte connecté et les données serveur ; React Hook Form et Zod gèrent les formulaires. Les appels navigateur passent par Next.js, qui conserve le JWT dans un cookie HttpOnly, SameSite=Lax, et communique avec FastAPI via `BACKEND_URL`. Les écritures vérifient l’origine et les réponses privées utilisent `no-store`. En production HTTPS, définir `APP_ORIGIN` avec l’origine publique exacte et conserver le cookie Secure. Voir le [README frontend](frontend/README.md) pour étendre ces services et lancer `npm run test:api`.

## Étendre le template frontend

Le [guide frontend](frontend/README.md#ajouter-une-fonctionnalité-avec-les-services-api-et-tanstack-query) décrit l’ajout d’un module de projets : route FastAPI et permissions, route Next.js autorisée, service HTTP typé, hooks Query, formulaire et invalidation du cache. Le client `apiRequest` centralise le transport ; TanStack Query gère les données serveur, React Hook Form les formulaires et React l’état local. Les changements de compte purgent les données privées du cache.

La navbar permet de choisir le **français ou l’anglais**, ainsi que le thème **clair, sombre ou système**. Les préférences sont mémorisées dans le navigateur et synchronisées entre onglets. i18next traduit les écrans, les libellés, les validations et les dates ; next-themes applique le thème avant hydratation. Ces préférences ne passent pas par l’API. Les routes restent identiques dans les deux langues et les métadonnées initiales restent françaises.

Pour étendre les traductions, compléter les catalogues de `frontend/src/lib/i18n/locales/`. Pour un nouveau composant, utiliser les variables CSS de la palette dans `globals.css` et vérifier les deux thèmes. Voir les sections [internationalisation](frontend/README.md#internationalisation-français--anglais) et [thèmes](frontend/README.md#thèmes-clair-sombre-et-système) pour les conventions et exemples. Les fichiers d’environnement restent exclusivement à la racine.

## Mots de passe et récupération par e-mail

Lorsque `EMAIL_VERIFICATION_ENABLED=false`, l’inscription accepte une adresse e-mail facultative. Pour un compte existant, l’ajouter depuis `/profil` en confirmant le mot de passe actuel. Une adresse unique est normalisée en minuscules ; elle reste privée. Son association seule ne confirme pas la boîte mail. Le statut `email_verified_at` est renseigné uniquement par le parcours de confirmation décrit ci-dessous.

Le profil propose un formulaire avec mot de passe actuel, nouveau mot de passe et confirmation. Après succès, toutes les sessions et tous les liens en attente sont révoqués, puis le frontend redirige vers la connexion. La mise à jour de l’adresse de récupération exige aussi le mot de passe actuel et une reconnexion. Les routes historiques de modification/suppression d’utilisateur sont limitées au compte connecté et ne permettent plus de modifier un mot de passe.

Depuis `/connexion`, le lien **Mot de passe oublié ?** ouvre `/mot-de-passe-oublie`. Le backend répond toujours de la même manière pour une adresse existante, inconnue ou limitée. Une tâche après réponse envoie le message dans la langue de l’interface, avec un lien vers `/reinitialiser-mot-de-passe`. Le jeton aléatoire de 256 bits est transmis dans le fragment du lien, retiré de l’URL après lecture et conservé uniquement en mémoire côté navigateur. Seul son SHA-256 est stocké en base. L’UPDATE conditionnel garantit l’usage unique, même si deux requêtes arrivent simultanément. Aucun mot de passe n’est envoyé par e-mail et aucun jeton n’est retourné par l’API publique. Après réinitialisation, la connexion reste manuelle et un message de notification est envoyé à l’adresse associée.

Avant mise en service sur une base existante, appliquer la migration `0002_password_recovery` avec `alembic upgrade head` (voir les commandes ci-dessus). Elle ajoute l’adresse privée, la version d’authentification, le hash/expiration de récupération et les compteurs de limitation sans modifier les comptes ni leurs hashes de mot de passe. Les JWT précédents sans version restent acceptés à la version zéro ; la première modification des identifiants les révoque. Les nouveaux JWT sont aussi liés à l’identifiant interne du compte.

Configurer uniquement les fichiers env à la racine :

| Variable | Valeur de développement / rôle |
|---|---|
| `FRONTEND_URL` | `http://localhost:3000`, origine publique de confiance utilisée pour construire les liens ; URL HTTPS en production |
| `PASSWORD_RESET_EXPIRE_MINUTES` | `30`, validité d’un lien (1 à 120 minutes) |
| `PASSWORD_RESET_WINDOW_SECONDS` | `900`, fenêtre de 60 à 86 400 secondes des compteurs SQL partagés entre workers |
| `PASSWORD_RESET_EMAIL_LIMIT` | `3`, demandes par adresse et par fenêtre |
| `PASSWORD_RESET_IP_LIMIT` | `30`, demandes par IP vue par FastAPI et par fenêtre |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_DOMAIN`, `EMAIL_USERNAME`, `EMAIL_PASSWORD` | Paramètres SMTP existants, avec STARTTLS et authentification ; délai de connexion borné à 10 s |

Derrière le proxy Next.js, FastAPI voit l’IP du serveur Next.js : ce quota IP est donc partagé par ses visiteurs. Aucun `X-Forwarded-For` fourni par le client n’est accepté comme preuve d’adresse. Adapter le quota au trafic prévu et configurer la transmission d’IP uniquement à travers un proxy de confiance si nécessaire. Les changements de mot de passe/adresse sont limités à dix tentatives par compte et par fenêtre ; la confirmation d’un lien est limitée à trente tentatives par IP et par fenêtre.

En cas d’échec SMTP, la réponse publique reste générique et le nouveau jeton est invalidé. Les logs de validation ne contiennent ni entrée brute ni traceback Pydantic susceptible d’exposer un mot de passe ou un jeton. Le backend vérifie la version d’authentification avant les réponses en cache. Les compteurs ne stockent ni IP ni e-mail en clair et sont nettoyés après deux jours.

Routes publiques ajoutées : `POST /api/auth/forgot-password` et `POST /api/auth/reset-password`. Les contrats détaillés sont visibles dans Swagger. Les modèles d’e-mail sont dans `backend/api/html/email/password_reset.html`, `password_changed.html` et `recovery_email_changed.html`. Une modification de l’adresse de récupération notifie son ancienne adresse, si elle existe.

Validation : 59 tests backend sur SQLite et MySQL avec Redis isolé, dont expiration, rejeu, concurrence, limitation, échec SMTP, adresse privée, rollback d’un doublon et révocation sur cache HIT. Le transport SMTP est neutralisé automatiquement dans la suite de tests ; le parcours navigateur complet est vérifié avec capture locale des messages, sans envoi réel. Les tests HTTP frontend des identifiants utilisent `npm run test:passwords`. Le [guide frontend](frontend/README.md#étendre-les-parcours-des-identifiants) explique comment réutiliser les composants et mutations.

### Confirmation optionnelle de l’adresse e-mail

Le template peut exiger une confirmation par e-mail avant la première connexion. La configuration appartient uniquement au fichier **`.env.dev` à la racine** ; aucune variable `NEXT_PUBLIC_*` supplémentaire n’est nécessaire. Le frontend consulte `GET /api/auth/config` via son proxy pour adapter l’inscription au réglage du backend.

| Variable | Valeur par défaut et rôle |
| --- | --- |
| `EMAIL_VERIFICATION_ENABLED` | `false` ; mettre `true` pour exiger un e-mail et sa confirmation à l’inscription |
| `EMAIL_VERIFICATION_EXPIRE_MINUTES` | `60` ; durée d’un lien, entre 1 et 1 440 minutes |
| `EMAIL_VERIFICATION_WINDOW_SECONDS` | `900` ; fenêtre des limites d’envoi, entre 60 et 86 400 secondes |
| `EMAIL_VERIFICATION_EMAIL_LIMIT` | `3` ; envois par adresse et par fenêtre, inscription comprise |
| `EMAIL_VERIFICATION_IP_LIMIT` | `30` ; envois par IP vue par FastAPI et par fenêtre |

Renseigner aussi `FRONTEND_URL` (origine publique de confiance) et les paramètres SMTP décrits dans la section récupération. Après modification du fichier d’environnement :

```bash
docker compose exec backend alembic upgrade head
docker compose up -d --force-recreate backend
```

La migration additive `0003_email_verification` ajoute la date de confirmation, l’exigence par compte et le hash/expiration du jeton. **Les comptes existants ne sont pas bloqués lors de l’activation** et ne sont pas marqués artificiellement comme confirmés. Un compte créé lorsque l’option était désactivée reste utilisable. Un compte créé sous l’option active reste en attente tant qu’il n’a pas confirmé son adresse ; désactiver l’option autorise temporairement sa connexion, puis la réactiver rétablit cette exigence.

En mode actif, l’inscription crée le compte sans session et affiche un écran invitant à consulter sa messagerie. La connexion classique, celle de Swagger et les routes privées refusent l’accès aux comptes en attente. Un changement d’adresse depuis le profil efface l’ancienne confirmation, révoque les sessions et envoie un lien à la nouvelle adresse. En mode désactivé, le parcours habituel reste disponible sans e-mail obligatoire ni envoi de confirmation.

Le lien ouvre `/confirmer-email#token=...`. Son secret aléatoire de 256 bits est retiré de l’URL et conservé en mémoire ; seul son SHA-256 est enregistré en base. **Le bouton de confirmation effectue un POST explicite** : ouvrir le lien ou le prévisualiser ne consomme pas le jeton. Un renvoi remplace le lien précédent. L’expiration, l’usage unique et les requêtes concurrentes sont contrôlés en base. Une confirmation invalide également les anciennes sessions et demandes de réinitialisation ; elle ne connecte pas automatiquement le compte. Un reset du mot de passe ne contourne pas l’obligation de confirmation.

Le renvoi est accessible après inscription ou depuis le lien **Renvoyer le lien de confirmation** sur `/connexion`. `POST /api/auth/resend-verification` retourne toujours la même réponse `202`, pour une adresse inconnue, déjà confirmée, limitée ou si l’option est désactivée. Les limites utilisent des clés HMAC sans e-mail/IP en clair et sont partagées entre workers SQL. Derrière le proxy Next, l’IP observée peut être commune aux visiteurs : calibrer cette limite globale et ne pas accepter des en-têtes d’IP fournis librement par les clients.

Routes FastAPI : `GET /api/auth/config`, `POST /api/auth/resend-verification` (`email`, `language`) et `POST /api/auth/verify-email` (`token`). Le résultat de `POST /api/auth/register` inclut `verification_required`, sans JWT. Le proxy Next retourne `data: null` avec le statut `202` lorsque la confirmation est attendue, et conserve le profil/session habituel quand elle ne l’est pas. `email_verified_at` est visible uniquement dans le profil privé ; les hashes et expirations ne sont jamais sérialisés.

Le modèle bilingue du message est `backend/api/html/email/email_verification.html`. Les tests de `backend/test/test_email_verification.py` couvrent les deux modes, les comptes existants, le renvoi, l’expiration, la concurrence, les limites, les pannes SMTP et les contournements par connexion Swagger, JWT ou reset. Les messages sont capturés localement pendant la recette ; un serveur SMTP fonctionnel reste nécessaire pour une livraison réelle.


## Intégration continue avec GitHub Actions

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s’exécute à l’ouverture, à la réouverture et à chaque nouveau commit d’une pull request, sur toutes les branches cibles. Il peut aussi être lancé manuellement depuis l’onglet **Actions → CI → Run workflow**, après publication du workflow sur la branche par défaut. Une nouvelle exécution sur la même PR annule la précédente. Aucun déploiement n’est effectué.

| Contrôle GitHub | Vérifications |
| --- | --- |
| `Backend (sqlite)` | Installation `uv sync --frozen --group dev`, Ruff, suite Pytest avec Redis réel et vérification des migrations sur SQLite |
| `Backend (mysql)` | Mêmes contrôles avec MySQL 8.4 et Redis 7.4 jetables, y compris les tests de concurrence et les migrations MySQL |
| `Frontend` | `npm ci`, ESLint, TypeScript, traductions FR/EN, build de production et tests HTTP `test:api` / `test:passwords` contre Next.js en mode production et une API isolée |

La CI utilise Python 3.14, Node.js 24 et uv 0.13.1, avec les dépendances des fichiers de verrouillage. Ruff 0.17.1 est une dépendance du groupe `dev`, configurée dans `backend/pyproject.toml` : erreurs Python, imports/variables inutilisés, comparaisons, alias UTC et dépendances FastAPI. L’exception `E402` du package `api/database` conserve les imports différés nécessaires à l’enregistrement des modèles.

Tous les paramètres de CI sont des valeurs jetables définies dans le workflow. **Aucun fichier `.env` n’est créé dans le frontend ou le backend, et aucun secret GitHub n’est requis.** Les fichiers `.env.dev`, `.env.test` et `.env.grafana` locaux restent indépendants. Le transport SMTP est simulé dans Pytest ; pour les tests HTTP, sa destination est limitée à la boucle locale sur un port fermé. La vérification d’e-mail est désactivée pour ces parcours HTTP classiques, et ses deux modes sont testés par la suite backend.

Les tests backend peuvent supprimer et recréer leurs tables : ils utilisent exclusivement les bases des services jetables du job. `TEST_REDIS_URL` active les tests de cache avec Redis réel. Le contrôle MySQL des migrations crée puis supprime des bases temporaires avec le compte administrateur du service de CI ; ce compte et ce mot de passe ne sont destinés à aucun déploiement.

Le script `backend/scripts/check_migrations.py` crée une **base de test temporaire avec le schéma antérieur à Alembic**, applique `upgrade head`, exécute `alembic check`, teste `downgrade -1` puis `upgrade head`, et vérifie la conservation d’un utilisateur. Cette référence figée est uniquement une fixture de CI : elle n’ajoute aucune migration historique. Le script ne lance pas `Base.metadata.create_all()`, car cela pourrait masquer un champ ajouté au modèle sans migration. Un test négatif vérifie explicitement que ce cas fait échouer la CI. En local, sans `TEST_MIGRATION_DATABASE_URL`, le script utilise un fichier SQLite temporaire.

Pour reproduire les contrôles Python depuis `backend/`, avec les variables racine habituelles exportées et une **base jetable** :

```bash
uv sync --frozen --group dev
uv run --frozen ruff check --config pyproject.toml . ../scripts
uv run --frozen pytest -q
uv run --frozen python scripts/check_migrations.py
```

Les commandes frontend restent `npm run lint`, `npm run typecheck`, `npm run test:i18n` et `npm run build`. Les tests HTTP demandent un backend disponible et un frontend lancé avec `npm run start` ; les variables `BACKEND_TEST_URL`, `FRONTEND_TEST_URL`, `BACKEND_URL`, `APP_ORIGIN` et `SESSION_COOKIE_SECURE=false` doivent correspondre aux URLs locales utilisées.

Les actions sont référencées par SHA, le jeton GitHub dispose uniquement de `contents: read` et le checkout ne conserve pas ses identifiants. Le déclencheur est [`pull_request`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request), ce qui permet les PR de forks sans exposer de secrets. Les journaux des serveurs HTTP sont affichés si le parcours échoue, puis leurs processus sont arrêtés. Pour rendre ces résultats obligatoires avant une fusion, sélectionner les trois contrôles ci-dessus dans les règles de protection de la branche du dépôt cible.
