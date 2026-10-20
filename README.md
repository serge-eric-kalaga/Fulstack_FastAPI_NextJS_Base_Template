# Template fullstack FastAPI + Next.js

Une base pour démarrer des applications avec une API FastAPI et un frontend Next.js : authentification, profil utilisateur, e-mails, cache Redis, migrations et intégration continue.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Démarrage rapide](#démarrage-rapide)
- [Initialiser un projet](#initialiser-un-projet)
- [Production](#production)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Développement local](#développement-local)
- [Authentification et profils](#authentification-et-profils)
- [Client API TypeScript généré](#client-api-typescript-généré)
- [Ajouter une fonctionnalité](#ajouter-une-fonctionnalité)
- [Cache Redis](#cache-redis)
- [E-mails](#e-mails)
- [Migrations de base de données](#migrations-de-base-de-données)
- [Tests et qualité](#tests-et-qualité)
- [Intégration continue](#intégration-continue)
- [Logs et monitoring](#logs-et-monitoring)
- [Gestion des dépendances](#gestion-des-dépendances)

## Fonctionnalités

- Authentification JWT, inscription et connexion.
- Confirmation d’adresse e-mail activable par configuration, avec renvoi du lien.
- Modification du mot de passe et récupération par e-mail.
- Profil utilisateur avec téléphone, photo et dernière connexion.
- Interface français/anglais et thèmes clair, sombre ou système.
- Services API et hooks TanStack Query réutilisables.
- Client TypeScript généré depuis les contrats FastAPI.
- Cache Redis, invalidation par groupe et migrations Alembic.
- Socket.IO, métriques Prometheus et Grafana.
- Tests et contrôles GitHub Actions sur les pull requests.

Le frontend utilise **Next.js, React, TypeScript, Tailwind CSS, React Hook Form et Zod**. Le backend utilise **FastAPI, Pydantic, SQLAlchemy et MySQL**. Les environnements Docker reposent sur **Node.js 24** et **Python 3.14**.

Les dépendances sont définies dans [package.json](frontend/package.json) et [pyproject.toml](backend/pyproject.toml), avec leurs fichiers de verrouillage.

## Démarrage rapide

### Prérequis

- Docker et Docker Compose.
- Les fichiers de configuration décrits ci-dessous, placés à la racine du dépôt.

### Préparer l’environnement

Avec Python 3.9 ou supérieur, initialiser une copie du template depuis sa racine :

```bash
python3 scripts/init_project.py --name "Ma Boutique" --admin-email admin@example.com
```

La commande crée `.env.dev`, `.env.test` et `.env.grafana` à la racine avec les paramètres et secrets nécessaires. Elle refuse de modifier une configuration existante. Voir les [options d’initialisation](#initialiser-un-projet).

### Lancer l’application

Depuis la racine :

```bash
docker compose --env-file .env.dev config --quiet
docker compose --env-file .env.dev up -d --build
docker compose --env-file .env.dev exec -T backend uv run --frozen alembic upgrade head
```

| Service | Adresse |
| --- | --- |
| Frontend | [localhost:3000](http://localhost:3000) |
| API FastAPI | [localhost:8080](http://localhost:8080) |
| Documentation Swagger | [localhost:8080/docs](http://localhost:8080/docs) |
| OpenAPI | [localhost:8080/openapi.json](http://localhost:8080/openapi.json) |
| Healthcheck | [localhost:8080/api/healthcheck/](http://localhost:8080/api/healthcheck/) |
| phpMyAdmin | [localhost:8081](http://localhost:8081) |
| Prometheus (monitoring optionnel) | [localhost:9090](http://localhost:9090) |
| Grafana (monitoring optionnel) | [localhost:3001](http://localhost:3001) |
| Visualiseur de logs | [localhost:7777](http://localhost:7777) |

MySQL et Redis sont accessibles sur le réseau Docker, sans port publié sur l’hôte.

```bash
docker compose --env-file .env.dev ps                          # État des services
docker compose --env-file .env.dev logs -f backend frontend     # Journaux
docker compose --env-file .env.dev down                        # Arrêt sans suppression des volumes
```

Le Compose par défaut fournit un environnement de développement avec rechargement du code. Le déploiement utilise le fichier autonome `docker-compose.prod.yml` décrit dans [Production](#production).

## Initialiser un projet

La commande d’initialisation utilise uniquement la bibliothèque standard Python. Elle prépare la configuration d’un nouveau projet, sans installer de dépendances, démarrer de service ou modifier le code source.

```bash
# Nom affiché et destinataire des alertes
python3 scripts/init_project.py --name "Ma Boutique" --admin-email admin@example.com

# Identifiant technique explicite
python3 scripts/init_project.py --name "Ma Boutique" --slug ma-boutique

# Vérifier les paramètres et les fichiers prévus sans écrire de configuration
python3 scripts/init_project.py --name "Ma Boutique" --dry-run
```

Sans `--name`, un terminal interactif demande le nom. `--directory` permet de désigner une autre copie du template. Le dossier doit contenir `docker-compose.yml`, `backend/` et `frontend/`.

| Élément | Personnalisation |
| --- | --- |
| Identité | `APP_NAME` pour l’API/e-mails et `NEXT_PUBLIC_APP_NAME` pour la navbar, le pied de page et les titres |
| Ressources Docker | `COMPOSE_PROJECT_NAME` dérivé du nom, par exemple `ma-boutique` |
| MySQL | Base `ma_boutique`, compte applicatif et mots de passe générés |
| Redis | Préfixes propres au projet et à l’environnement |
| Tests | Base SQLite dédiée dans `backend/.test.db`, cache désactivé et secrets distincts |
| Grafana | Mot de passe administrateur et mot de passe SQL dédiés au monitoring |

Les secrets applicatifs, JWT, MySQL, Grafana et de l’exporteur SQL utilisent des valeurs aléatoires indépendantes. Ils sont écrits dans les fichiers d’environnement avec des permissions `0600` sur les systèmes POSIX et ne sont jamais affichés dans le terminal. L’accès Grafana utilise le compte `admin` et le mot de passe de `.env.grafana`.

Si l’un des trois fichiers existe, toute l’opération est refusée : aucune fusion, rotation ou réécriture automatique des secrets. Une erreur d’écriture annule les fichiers créés par cette exécution. Pour adapter une instance configurée, modifier directement ses fichiers racine en conservant ses secrets et identifiants de base.

Le nom affiché accepte les lettres Unicode et les espaces. Le slug doit contenir au maximum 48 lettres minuscules, chiffres ou tirets et commencer par une lettre ; utiliser `--slug` si le nom ne permet pas d’en dériver un. Les ports des services restent ceux du Compose et doivent être adaptés pour faire tourner plusieurs projets simultanément.

Utiliser `docker compose --env-file .env.dev …` pour que Compose lise aussi `COMPOSE_PROJECT_NAME` et les variables d’interpolation. Cette identité détermine les noms de ses réseaux et volumes. Le nom public du frontend est intégré lors du build Next.js : relancer le serveur de développement, ou reconstruire le frontend après modification de `NEXT_PUBLIC_APP_NAME`.

L’envoi d’e-mails demande de renseigner SMTP dans `.env.dev`. La confirmation d’adresse est désactivée par défaut et peut être activée avec `EMAIL_VERIFICATION_ENABLED=true` après cette configuration.

## Production

Cette configuration cible un serveur Docker unique avec un nom de domaine public. Elle utilise des images dédiées, Next.js standalone et Uvicorn sans rechargement, exécutés avec des utilisateurs non privilégiés. Seul Caddy publie les ports 80/443 ; MySQL, Redis et FastAPI restent sur les réseaux Docker. Les routes du compte passent toujours par le proxy Next.js.

### Préparer la configuration

Depuis la racine, même si les fichiers de développement existent déjà :

```bash
python3 scripts/init_production.py --name "Mon Projet" \
  --domain app.example.com --admin-email admin@example.com
```

La commande crée uniquement **`.env.prod` à la racine**, en mode privé `0600`, avec de nouveaux secrets SQL et JWT. Elle refuse tout écrasement. `--slug` et `--directory` permettent de choisir l’identifiant technique et le dossier cible. Le nom Compose reçoit le suffixe `-prod`, pour isoler les ressources du développement.

Renseigner les variables SMTP dans `.env.prod` avant d’utiliser les e-mails. `EMAIL_VERIFICATION_ENABLED` reste un choix explicite. `DOMAIN`, `FRONTEND_URL` et `APP_ORIGIN` doivent correspondre au domaine HTTPS final ; `SESSION_COOKIE_SECURE=true` est imposé au frontend. Le nom public `NEXT_PUBLIC_APP_NAME` est intégré à l’image : toute modification nécessite un nouveau build. Le frontend ne reçoit pas les secrets SQL ou JWT.

Faire pointer les enregistrements DNS du domaine vers le serveur et ouvrir les ports TCP 80/443 (UDP 443 pour HTTP/3). Caddy obtient et renouvelle les certificats HTTPS ; `TLS_EMAIL` est le contact ACME. Voir la [documentation HTTPS de Caddy](https://caddyserver.com/docs/automatic-https).

### Démarrer et mettre à jour

Utiliser ce fichier seul, sans le fusionner avec le Compose de développement :

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.prod -f docker-compose.prod.yml build
# Démarrer les dépendances et attendre leur disponibilité.
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --wait mysql redis
# Arrêter les processus applicatifs avant une migration potentiellement incompatible.
docker compose --env-file .env.prod -f docker-compose.prod.yml stop caddy frontend backend
# Exécution explicite à chaque déploiement, y compris après une mise à jour des images.
docker compose --env-file .env.prod -f docker-compose.prod.yml run --rm migrate
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --wait
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

Les premières révisions Alembic supposent la présence des tables initiales. Sur une base vide, le service `migrate` crée le schéma courant, applique les révisions puis vérifie sa cohérence. Sur une base existante, il exécute uniquement Alembic. Une erreur bloque le déploiement ; le serveur API ne crée ni ne modifie les tables au démarrage. Ajouter et versionner les nouvelles migrations avant chaque déploiement.

Ce parcours de mise à jour comporte une interruption de service. Sauvegarder MySQL et les photos avant toute migration ; le retour à une ancienne image ne restaure pas les données. Les volumes `mysql_data`, `backend_uploads`, `backend_logs`, `caddy_data` et `caddy_config` conservent les données, journaux et certificats. Ne pas utiliser `down --volumes` pour arrêter la production. Les mots de passe MySQL ne sont pris en compte à l’initialisation d’un volume neuf : leur rotation demande aussi une mise à jour des comptes SQL.

Les journaux Docker ont une rotation limitée ; les journaux applicatifs restent dans `backend_logs`. Le Compose de production ne lance pas phpMyAdmin, le serveur public de logs ni les interfaces de monitoring sans ajout du Compose dédié. Les sauvegardes, leur restauration et la supervision du serveur doivent être organisées pour chaque projet. Cette configuration ne fournit pas de haute disponibilité.

## Configuration

Tous les fichiers d’environnement restent **à la racine**. Ne pas en créer dans `frontend/` ou `backend/`.

| Fichier | Utilisation |
| --- | --- |
| `.env.dev` | Application et services Docker ; configuration locale du frontend |
| `.env.test` | Paramètres de la suite de tests backend |
| `.env.grafana`, `.env.grafana.prod` | Identifiants et paramètres du monitoring, isolés par environnement |

Les fichiers `.env` et `.env.*` sont ignorés par Git. Les variantes `.env.example` et `.env.*.example` peuvent servir de modèles versionnés.

### Grafana

Les identifiants Grafana et de l’exporteur SQL résident dans `.env.grafana` en développement et `.env.grafana.prod` en production. `python3 scripts/init_monitoring.py` (ou `--production`) complète les variables manquantes sans remplacer les secrets existants. Les sources Prometheus, Loki et Alertmanager sont provisionnées automatiquement ; Grafana ne dispose pas d’un accès SQL direct à l’application. Voir [Logs et monitoring](#logs-et-monitoring).

### Application et transport

| Variable | Rôle ou valeur par défaut |
| --- | --- |
| `APP_NAME` | Nom de l’application, requis |
| `NEXT_PUBLIC_APP_NAME` | Nom public affiché par le frontend ; défaut `Fullstack` |
| `COMPOSE_PROJECT_NAME` | Identité des ressources Docker, lue avec `--env-file .env.dev` |
| `ADMINS_EMAIL` | Adresses des administrateurs séparées par des virgules, requis |
| `SECRET_KEY` | Secret applicatif, requis |
| `JWT_SECRET`, `ALGORITHM` | Signature des JWT, requis |
| `DATABASE_URL` | Connexion SQLAlchemy, requise |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Durée de validité des JWT en minutes |
| `BACKEND_URL` | Adresse FastAPI utilisée uniquement par le serveur Next.js ; Compose définit `http://backend:80` |
| `FRONTEND_URL` | URL publique utilisée pour les liens envoyés par e-mail ; défaut `http://localhost:3000` |
| `APP_ORIGIN` | Origine exacte autorisée pour les écritures du proxy Next.js |
| `INITIALISE_DATABASE` | Création ORM au démarrage en développement ; `false` en production, où le service de migration gère le schéma |
| `SESSION_COOKIE_SECURE` | Imposer `true` en HTTPS ; `false` permet les tests de production sur HTTP local |

Après modification des variables injectées par Compose, recréer les services concernés :

```bash
docker compose --env-file .env.dev up -d --force-recreate backend frontend
```

### Cache et fichiers

| Variable | Valeur par défaut |
| --- | --- |
| `REDIS_URL` | `redis://redis:6379/0` dans Compose |
| `REDIS_PREFIX` | `fullstack:dev:v1` ; choisir un préfixe distinct par projet et environnement |
| `CACHE_ENABLED` | `true` |
| `CACHE_TTL_SECONDS` | `60` |
| `PROFILE_PHOTO_DIR` | `static/uploads/profile_photos` |
| `PROFILE_PHOTO_MAX_BYTES` | `5242880` — 5 Mio |
| `PROFILE_PHOTO_MAX_PIXELS` | `16000000` |

Compose utilise son environnement ou son fichier d’interpolation pour résoudre `${REDIS_URL}`. Pour remplacer son adresse par défaut avec `.env.dev`, utiliser `docker compose --env-file .env.dev up -d`.

### E-mails et comptes

| Variable | Rôle ou valeur par défaut |
| --- | --- |
| `EMAIL_HOST`, `EMAIL_PORT` | Serveur et port SMTP |
| `EMAIL_USERNAME`, `EMAIL_PASSWORD` | Identifiants SMTP |
| `EMAIL_DOMAIN` | Domaine de l’expéditeur `notification@<domaine>` |
| `EMAIL_VERIFICATION_ENABLED` | `false` ; activer pour exiger la confirmation à l’inscription |
| `EMAIL_VERIFICATION_EXPIRE_MINUTES` | `60` |
| `EMAIL_VERIFICATION_WINDOW_SECONDS` | `900` |
| `EMAIL_VERIFICATION_EMAIL_LIMIT` | `3` envois par adresse et par fenêtre, inscription comprise |
| `EMAIL_VERIFICATION_IP_LIMIT` | `30` envois par IP et par fenêtre |
| `PASSWORD_RESET_EXPIRE_MINUTES` | `30` |
| `PASSWORD_RESET_WINDOW_SECONDS` | `900` |
| `PASSWORD_RESET_EMAIL_LIMIT` | `3` demandes par adresse et par fenêtre |
| `PASSWORD_RESET_IP_LIMIT` | `30` demandes par IP et par fenêtre |

Configurer SMTP et `FRONTEND_URL` pour utiliser les parcours par e-mail. Derrière le proxy Next.js, la limite IP vue par FastAPI peut être partagée entre les visiteurs ; l’adapter au trafic et à l’infrastructure.

La définition complète des paramètres se trouve dans [config.py](backend/api/configs/config.py).

## Architecture

```text
.
├── .github/workflows/ci.yml       # Contrôles des pull requests
├── docker-compose.yml
├── backend/
│   ├── api/
│   │   ├── configs/              # Paramètres et logs
│   │   ├── database/             # Modèles SQLAlchemy et CRUD partagé
│   │   ├── schemas/              # Contrats Pydantic
│   │   ├── views/                # Routes FastAPI
│   │   ├── services/             # Services métier, JWT, cache, e-mails et Socket.IO
│   │   └── html/email/           # Modèles d’e-mail
│   ├── migrations/              # Révisions Alembic
│   ├── scripts/                 # Export OpenAPI et contrôle des migrations
│   ├── test/                    # Tests backend
│   ├── static/uploads/          # Fichiers téléversés
│   ├── openapi.json             # Contrat public versionné
│   └── run.py                   # Point d’entrée ASGI
├── frontend/
│   ├── src/
│   │   ├── app/                 # Pages et proxy API Next.js
│   │   ├── components/          # Composants partagés
│   │   ├── features/            # Services, hooks et formulaires par fonctionnalité
│   │   └── lib/                 # Transport API, SDK généré, i18n et providers
│   ├── scripts/                # Génération et comparaison du SDK
│   └── tests/                  # Tests frontend et HTTP
├── scripts/                    # Utilitaires de CI
└── monitoring/                 # Prometheus et Grafana
```

Les appels applicatifs suivent ce parcours :

```text
Composant → hook TanStack Query → service navigateur
          → proxy Next.js → SDK TypeScript généré → FastAPI → base de données
```

Le proxy conserve le JWT dans un cookie **HttpOnly, SameSite=Lax**, vérifie l’origine des écritures et limite les routes accessibles. Une instance du SDK est créée par requête ; aucun JWT n’est partagé dans un singleton. Les réponses privées utilisent `no-store`.

TanStack Query gère les données serveur, React Hook Form et Zod les formulaires, et React l’état local. Les changements de compte purgent le cache privé. i18next et next-themes gèrent les préférences de langue et de thème dans le navigateur.

## Développement local

### Backend

Avec Python, uv et des services SQL/Redis accessibles depuis l’hôte :

```bash
cd backend
uv sync --frozen --group dev
uv run --env-file ../.env.dev uvicorn run:app --host 0.0.0.0 --port 8000 --reload --reload-dir api
```

Adapter `DATABASE_URL` et `REDIS_URL` dans le fichier racine aux adresses accessibles depuis l’hôte. Les noms Docker `mysql` et `redis` ne sont pas résolus en dehors de leur réseau.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

En développement, le frontend lit `.env.dev` à la racine. En mode production, les variables sont injectées explicitement par Compose ; ce fichier de développement n’est pas chargé. Pour joindre le backend local ci-dessus, utiliser `BACKEND_URL=http://127.0.0.1:8000`. Après `npm run build`, `npm run start` lance Next.js en mode production.

Dans Docker, le code est monté depuis l’hôte. Uvicorn surveille `backend/api/` ; redémarrer le backend après modification de `run.py`.

## Authentification et profils

### Parcours utilisateur

- **Inscription** : crée un compte. Si la vérification d’e-mail est activée, l’adresse est obligatoire et la connexion attend sa confirmation ; sinon, le frontend connecte le compte directement.
- **Confirmation** : le lien ouvre `/confirmer-email`. Un bouton confirme explicitement l’adresse. Un renvoi remplace le lien précédent.
- **Profil** : `/profil` permet de modifier le téléphone, la photo, l’adresse e-mail et le mot de passe. Le menu du compte affiche la dernière connexion et permet de se déconnecter.
- **Changement de mot de passe** : exige le mot de passe actuel et révoque les sessions ainsi que les liens de réinitialisation.
- **Changement d’adresse** : exige le mot de passe actuel et une reconnexion ; si la vérification est active, la nouvelle adresse doit être confirmée.
- **Mot de passe oublié** : `/mot-de-passe-oublie` envoie un lien vers `/reinitialiser-mot-de-passe`. Après réinitialisation, l’utilisateur se connecte avec son nouveau mot de passe.

L’adresse e-mail et sa date de confirmation figurent uniquement dans le profil privé. Activer la vérification ne bloque pas les comptes créés sans cette exigence. Les comptes inscrits avec vérification restent soumis à celle-ci tant que l’option est active.

Les liens par e-mail sont temporaires et à usage unique. Leur secret est transmis dans le fragment de l’URL, conservé en mémoire côté navigateur et stocké sous forme de hash en base. Les réponses publiques de renvoi et de récupération ne révèlent pas l’existence du compte. Une réinitialisation de mot de passe ne remplace pas la confirmation d’adresse requise.

### Routes principales de FastAPI

| Méthode | Route | Utilisation |
| --- | --- | --- |
| `GET` | `/api/auth/config` | Options publiques d’inscription |
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion JSON |
| `POST` | `/api/auth/verify-email` | Confirmation de l’adresse |
| `POST` | `/api/auth/resend-verification` | Renvoi du lien de confirmation |
| `POST` | `/api/auth/forgot-password` | Demande de réinitialisation |
| `POST` | `/api/auth/reset-password` | Définition du nouveau mot de passe avec le lien |
| `GET`, `PATCH` | `/api/user/me` | Lecture et modification du profil |
| `PATCH` | `/api/user/me/email` | Modification de l’adresse e-mail |
| `PUT` | `/api/user/me/password` | Modification du mot de passe |
| `PUT` | `/api/user/me/photo` | Téléversement d’une photo |
| `GET` | `/api/user/{username}/photo` | Lecture authentifiée d’une photo |

Pour appeler directement les routes privées de FastAPI, envoyer `Authorization: Bearer <token>`. Dans Swagger, utiliser **Authorize**. Les listes et détails publics d’utilisateurs nécessitent également une authentification ; la modification et la suppression sont limitées au compte connecté.

Les schémas, paramètres et réponses détaillés sont disponibles dans [Swagger](http://localhost:8080/docs). Les réponses applicatives FastAPI utilisent l’enveloppe `status`, `status_code`, `message`, `data` ; le proxy navigateur expose `data` et normalise les erreurs.

### Photos et stockage

Les photos acceptées sont JPEG, PNG et WebP fixes. Le backend vérifie le contenu, la taille et les dimensions, puis réencode l’image en WebP sans métadonnées, au maximum 1024 × 1024 pixels. Le champ multipart attendu est `photo`.

Le volume `backend_uploads` conserve les fichiers de `static/uploads/`. Les photos sont servies par une route authentifiée, sans cache HTTP. Sauvegarder ce volume avec la base SQL ; utiliser un stockage partagé pour plusieurs instances sur des machines distinctes.

## Client API TypeScript généré

[Hey API](https://heyapi.dev/docs/openapi/typescript/get-started) génère les types, les fonctions d’appel et le transport Fetch à partir de `backend/openapi.json`. Le SDK est réservé au serveur Next.js ; les services et hooks navigateur passent par le proxy.

Après ajout ou modification d’une route ou d’un schéma :

```bash
# Depuis la racine, avec les services Docker démarrés
docker compose --env-file .env.dev exec -T backend uv run --frozen python scripts/export_openapi.py
docker compose --env-file .env.dev exec -T frontend npm run api:generate
docker compose --env-file .env.dev exec -T frontend npm run typecheck
```

Sans Docker :

```bash
(cd backend && uv run --frozen python scripts/export_openapi.py)
(cd frontend && npm run api:generate && npm run typecheck)
```

L’export fonctionne hors ligne, sans initialiser la base. Le contrat et les fichiers de `frontend/src/lib/api/generated/` doivent être versionnés avec les changements applicatifs. Ne pas modifier le code généré à la main.

Les commandes `export_openapi.py --check` et `npm run api:check` détectent les écarts sans réécrire les fichiers. La génération ne rend aucune route accessible dans le proxy et ne remplace pas la validation Zod/Pydantic.

Voir le [guide du client généré](frontend/README.md#client-api-typescript-généré) pour la configuration, les adaptateurs et les exemples d’appel.

## Ajouter une fonctionnalité

1. Créer les modèles SQLAlchemy, les schémas Pydantic et le service métier backend.
2. Définir les routes FastAPI et leurs autorisations, avec un `response_model` précis et un `operation_id` stable.
3. Générer une migration si le schéma SQL change, puis régénérer le contrat OpenAPI et le SDK.
4. Ajouter explicitement les branches nécessaires au proxy Next.js, avec validation des entrées et authentification.
5. Créer le service navigateur et ses hooks TanStack Query ; invalider les requêtes concernées après une écriture.
6. Construire les composants et formulaires, compléter les traductions FR/EN et couvrir le parcours par des tests.

Le [guide frontend](frontend/README.md#ajouter-une-fonctionnalité-avec-les-services-api-et-tanstack-query) présente un exemple de module. Pour les styles, utiliser la palette de `frontend/src/app/globals.css` afin de respecter les thèmes clair et sombre.

## Cache Redis

Le module [cache.py](backend/api/services/cache.py) fournit des dépendances réutilisables basées sur `fastapi-redis-sdk` :

```python
from fastapi import Depends
from api.services.cache import cached_response, invalidate_cache

@router.get("/products", dependencies=[Depends(cached_response("products", ttl=120))])
def list_products():
    return {"items": []}

@router.post("/products", dependencies=[Depends(invalidate_cache("products"))])
def create_product():
    # Valider la transaction SQL avant de retourner la réponse.
    return {"created": True}
```

Les lectures sont authentifiées par défaut, y compris sur un cache HIT. Les clés séparent les utilisateurs ; un cache public demande explicitement `authenticated=False`. L’invalidation d’un groupe intervient après une écriture réussie.

Le préfixe `REDIS_PREFIX` isole les projets et environnements. `X-Redis-Cache` indique `HIT`, `MISS` ou `BYPASS`. Si Redis est indisponible, l’API utilise la base ; une invalidation manquée peut laisser une entrée jusqu’à son expiration. `CACHE_ENABLED=false` désactive le cache.

## E-mails

Le service [mail.py](backend/api/services/mail.py) utilise SMTP avec STARTTLS et authentification. Les modèles HTML se trouvent dans `backend/api/html/email/`.

```python
from api.services.mail import send_email

send_email(
    receiver_email=["alice@example.com", "bob@example.com"],
    message_text="<p>Bonjour.</p>",
    object="Notification",
)
```

`receiver_email` accepte une adresse ou une liste. Les espaces et doublons sont retirés. Les destinataires d’un envoi collectif sont visibles dans l’en-tête `To` ; les alertes administrateur sont envoyées individuellement.

La fonction retourne `True` si le serveur SMTP accepte tous les destinataires, sinon `False`. Cette acceptation ne garantit pas la livraison finale. Les parcours de compte fournissent des modèles bilingues de confirmation, récupération et notification de modification des identifiants.

## Migrations de base de données

Alembic utilise `DATABASE_URL` et les modèles SQLAlchemy. Les migrations se trouvent dans `backend/migrations/` et sont appliquées explicitement.

Pour modifier le schéma avec Docker, arrêter le backend avant de modifier les modèles afin que l’initialisation automatique des tables ne masque pas une nouvelle table :

```bash
docker compose --env-file .env.dev stop backend
# Modifier les modèles, puis générer la révision.
docker compose --env-file .env.dev run --rm --no-deps backend uv run --frozen alembic revision --autogenerate -m "Ajouter une fonctionnalité"
```

Relire la révision générée, puis l’appliquer :

```bash
docker compose --env-file .env.dev run --rm --no-deps backend uv run --frozen alembic upgrade head
docker compose --env-file .env.dev run --rm --no-deps backend uv run --frozen alembic check
docker compose --env-file .env.dev up -d backend
```

Sans Docker, depuis `backend/` :

```bash
uv run --env-file ../.env.dev alembic revision --autogenerate -m "Ajouter une fonctionnalité"
uv run --env-file ../.env.dev alembic upgrade head
uv run --env-file ../.env.dev alembic check
```

Versionner les révisions avec les modèles. Utiliser `alembic current` pour consulter la révision appliquée, `alembic history` pour les révisions disponibles et `alembic downgrade -1` pour annuler la dernière révision sur une base de test, selon les opérations de son `downgrade()`.

## Tests et qualité

### Commande d’initialisation

Depuis la racine, sans dépendance externe :

```bash
python3 -m unittest discover -s scripts/tests -v
```

Les tests utilisent des dossiers temporaires et couvrent la cohérence des configurations, les secrets, les permissions, la protection des fichiers existants, le mode simulation et l’annulation en cas d’erreur.


### Backend

Créer `.env.test` **à la racine**, avec les paramètres backend requis et une base réservée aux tests. La suite ne réutilise jamais implicitement `DATABASE_URL` de l’application : elle choisit `TEST_DATABASE_URL` si cette variable est fournie, sinon `DATABASE_URL` du fichier racine `.env.test`, sinon une base SQLite temporaire. Les bases explicitement désignées doivent être réservées aux tests : la suite y supprime et recrée des tables. Une URL SQLite dédiée peut être utilisée, par exemple `sqlite:////tmp/fullstack-tests.db`.

```bash
cd backend
uv sync --frozen --group dev
uv run --frozen ruff check --config pyproject.toml . ../scripts
CACHE_ENABLED=false uv run --env-file ../.env.test pytest -q
uv run --frozen python scripts/export_openapi.py --check
uv run --env-file ../.env.test python scripts/check_migrations.py
```

Le cache applicatif reste désactivé par défaut pendant les tests, avec des préfixes isolés. Pour inclure les tests Redis, définir `TEST_REDIS_URL` vers une instance réservée aux tests. `TEST_MIGRATION_DATABASE_URL` permet de vérifier les migrations sur des bases MySQL temporaires ; sans cette variable, le contrôle utilise SQLite. La suite simule le transport SMTP.

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm run test:i18n
npm run api:check
npm run build
npm audit
```

Avec le backend et le frontend démarrés, exécuter les parcours HTTP :

```bash
npm run test:api
npm run test:passwords
npm run test:generated-api
```

Ces parcours créent et suppriment des comptes temporaires. Utiliser une instance de test avec `EMAIL_VERIFICATION_ENABLED=false`. Adapter `FRONTEND_TEST_URL` et `BACKEND_TEST_URL` aux services testés ; en production HTTP locale, définir également `APP_ORIGIN` et `SESSION_COOKIE_SECURE=false`.

## Intégration continue

Le workflow [ci.yml](.github/workflows/ci.yml) s’exécute sur les pull requests et peut être lancé manuellement depuis GitHub Actions.

| Job | Contrôles |
| --- | --- |
| `Backend (sqlite)` | Initialisation du template, Ruff, Pytest avec Redis, export OpenAPI et migrations SQLite |
| `Backend (mysql)` | Mêmes contrôles avec MySQL et vérification des migrations MySQL |
| `Production et monitoring (Docker)` | Images dédiées, migrations, chaîne applicative, métriques, dashboards, logs et alertes |
| `Frontend` | Installation verrouillée, ESLint, TypeScript, traductions, contrat/SDK, build de production et tests HTTP |

Les jobs utilisent des services jetables et une configuration indépendante des fichiers `.env` locaux. Aucun secret GitHub n’est requis. Une nouvelle exécution remplace celle de la même PR. Les contrôles OpenAPI et SDK font échouer la CI si les fichiers générés ne sont pas à jour.

Pour conditionner la fusion à ces résultats, sélectionner les contrôles backend, frontend et production/monitoring dans les règles de protection de la branche du dépôt.

## Logs et monitoring

Le fichier [docker-compose.monitoring.yml](docker-compose.monitoring.yml) ajoute une stack de supervision au Compose de développement ou de production. Les tableaux de bord, sources de données, règles et collecteurs sont versionnés dans `monitoring/`. Les interfaces sont liées à `127.0.0.1` ; Loki et les exporteurs n’exposent aucun port sur l’hôte.

### Activer en développement

Depuis la racine :

```bash
python3 scripts/init_monitoring.py
docker compose --env-file .env.dev --env-file .env.grafana \
  -f docker-compose.yml -f docker-compose.monitoring.yml up -d --build
```

### Activer en production

```bash
python3 scripts/init_monitoring.py --production
docker compose --env-file .env.prod --env-file .env.grafana.prod \
  -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d --build
```

Charger les deux fichiers d’environnement et les deux fichiers Compose pour toutes les commandes suivantes concernant le monitoring. La configuration de l’application reste dans `.env.dev` ou `.env.prod` ; aucun fichier d’environnement n’est créé dans les sous-répertoires.

Sur une base MySQL **déjà initialisée**, préparer le compte de collecte après le premier démarrage avec le Compose de monitoring :

```bash
# Développement ; utiliser les fichiers production correspondants sur le serveur.
docker compose --env-file .env.dev --env-file .env.grafana \
  -f docker-compose.yml -f docker-compose.monitoring.yml \
  exec -T mysql bash /docker-entrypoint-initdb.d/20-monitoring.sh
```

Sur un volume MySQL neuf, ce script est exécuté automatiquement. Il crée le compte `monitoring`, limité à trois connexions, avec les droits `PROCESS`, `REPLICATION CLIENT` et `SELECT` nécessaires à l’exporteur. Il peut être relancé après une rotation de `MYSQL_MONITORING_PASSWORD`. L’exporteur n’utilise ni le compte root, ni le compte applicatif. Les anciens paramètres `GRAFANA_MYSQL_*` ne sont plus utilisés.

### Consulter les dashboards

| Interface | Accès local | Usage |
| --- | --- | --- |
| Grafana | [localhost:3001](http://localhost:3001) | Dashboards, recherche des logs et exploration des données |
| Prometheus | [localhost:9090](http://localhost:9090) | Séries, état des cibles et règles d’alerte |
| Alertmanager | [localhost:9093](http://localhost:9093) | Alertes reçues, regroupements et silences |

La vue d’ensemble est configurée comme accueil par défaut. Se connecter à Grafana avec `GF_SECURITY_ADMIN_USER` et `GF_SECURITY_ADMIN_PASSWORD` du fichier Grafana racine. Sur un serveur distant, utiliser un tunnel SSH, par exemple `ssh -L 3001:127.0.0.1:3001 -L 9090:127.0.0.1:9090 -L 9093:127.0.0.1:9093 utilisateur@serveur`. Ne pas publier ces interfaces via le domaine applicatif sans protection supplémentaire.

Le dossier **Fullstack Template** contient :

- **Vue d’ensemble** : disponibilité, sondes HTTP, débit, p95, erreurs et alertes actives.
- **API FastAPI** : débit et latence par route, statuts HTTP, mémoire, CPU et descripteurs du processus.
- **MySQL et Redis** : disponibilité, connexions, requêtes SQL, mémoire, efficacité et évictions du cache.
- **Logs backend** : journal centralisé, filtrable par niveau, avec regroupement des traces multilignes.

Les dashboards sont provisionnés depuis les fichiers JSON : modifier et versionner ces fichiers pour personnaliser le template. Les changements dans Grafana ne remplacent pas leur source Git. La collecte s’effectue toutes les 15 secondes ; les débits nécessitent plusieurs échantillons et les latences restent vides sans trafic applicatif. Les sondes utilisent `/api/healthcheck/` et `/api/auth/config` via Next.js. Le healthcheck HTTP de l’API ne teste pas SQL/Redis ; les exporteurs vérifient ces services séparément.

### Alertes et notifications

Les règles couvrent les cibles indisponibles, les sondes HTTP, MySQL/Redis, le taux de 5xx, la latence et la mémoire de l’API, les connexions MySQL et la mémoire/les évictions Redis. Les délais évitent d’alerter sur une brève interruption ; les alertes de taux et latence exigent un trafic minimal. Adapter les seuils à chaque projet dans [rules.yml](monitoring/prometheus/rules.yml).

`Watchdog` est une alerte `info` permanente qui vérifie Prometheus → Alertmanager. Elle est volontaire et exclue des alertes opérationnelles de la vue d’ensemble. **Aucune notification externe n’est envoyée par défaut.** Renseigner `ALERTMANAGER_WEBHOOK_URL` dans le fichier Grafana racine pour transmettre les alertes `warning` et `critical` à un récepteur compatible avec le format webhook Alertmanager. Le webhook reste dans le fichier privé et la configuration runtime, jamais dans Git. Les alertes résolues sont transmises aussi ; les doublons sont regroupés, avec rappel toutes les quatre heures.

Après une modification du webhook, régénérer la configuration et redémarrer Alertmanager :

```bash
docker compose --env-file .env.dev --env-file .env.grafana \
  -f docker-compose.yml -f docker-compose.monitoring.yml run --rm monitoring-config
docker compose --env-file .env.dev --env-file .env.grafana \
  -f docker-compose.yml -f docker-compose.monitoring.yml restart alertmanager
```

### Stockage et exploitation

Prometheus conserve au maximum 15 jours ou 2 Go de métriques. Loki conserve les logs sept jours, avec suppression asynchrone par le compacteur. Les volumes Grafana, Alertmanager, Prometheus, Loki et Alloy conservent leur état. Éviter `down --volumes` pour conserver ces données ; sauvegarder notamment le volume Grafana avant une mise à jour majeure.

Alloy lit uniquement `backend/logs/app.log` en développement, ou le volume `backend_logs` en production, en lecture seule. Il n’accède pas au socket Docker. Ses positions de lecture sont persistantes. Les fichiers applicatifs restent en ajout, avec rotation quotidienne UTC et 200 archives ; Loki a sa propre rétention. Les journaux peuvent contenir des données métier : limiter les comptes Grafana et adapter la rétention au projet. Ce socle ne collecte pas les métriques de l’hôte, des conteneurs ou les traces distribuées ; il fonctionne sur Docker Desktop comme sur un serveur Docker, sans montage privilégié de l’hôte.

Les ports locaux peuvent être modifiés via `GRAFANA_PORT`, `PROMETHEUS_PORT` et `ALERTMANAGER_PORT`. `MONITORING_ENV` sélectionne les cibles backend du développement (port 80) ou de production (8000), et `BACKEND_LOG_SOURCE` sélectionne le stockage des logs. Les initialiseurs préparent ces valeurs.

### Vérifier le monitoring

```bash
python3 scripts/check_monitoring.py --env-file .env.grafana
# Production : remplacer le fichier par .env.grafana.prod.
```

Le contrôle attend les cibles, les métriques applicatives, les quatre dashboards, les logs et le signal Watchdog dans Alertmanager. Utiliser `--grafana`, `--prometheus` et `--alertmanager` pour des ports différents. Les tests des seuils et délais des alertes sont exécutables avec `promtool test rules monitoring/prometheus/tests/rules.yml` ; la CI vérifie aussi la stack de production.

## Gestion des dépendances

Depuis `backend/` :

```bash
uv add <package>
uv sync --frozen --group dev
```

Depuis `frontend/` :

```bash
npm install <package>
npm ci
```

Versionner ensemble les manifestes et leurs fichiers de verrouillage. Dans Docker, reconstruire le service après un changement de dépendances. Pour le frontend, synchroniser aussi le volume `node_modules` :

```bash
docker compose --env-file .env.dev run --rm --no-deps frontend npm ci
docker compose --env-file .env.dev up -d --no-deps --build frontend
```
