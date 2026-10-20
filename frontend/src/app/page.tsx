"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/use-i18n";
import {
  ArrowDown,
  ArrowRight,
  Layers3,
  ShieldCheck,
  UserRound,
  KeyRound,
  Database,
  Workflow,
  Activity,
  Braces,
  Zap,
  Cloud,
  Mail,
  Radio,
  Code2,
  Check,
} from "lucide-react";
import { HomeActions } from "@/features/auth/home-actions";
import styles from "./home.module.css";
const icons = {
  Layers3,
  ShieldCheck,
  UserRound,
  KeyRound,
  Database,
  Workflow,
  Activity,
  Braces,
  Zap,
  Cloud,
  Mail,
  Radio,
  Code2,
};
const features = [
  {
    icon: "ShieldCheck",
    title: "Des comptes déjà sécurisés",
    description:
      "Inscription et connexion JWT, confirmation d’e-mail configurable, récupération et modification du mot de passe : les parcours de compte sont déjà reliés à l’API.",
  },
  {
    icon: "UserRound",
    title: "Un profil personnalisable",
    description:
      "Informations personnelles, photo de profil et dernière connexion. Les formulaires en modales, les langues français/anglais et les thèmes clair/sombre composent une base d’interface cohérente.",
  },
  {
    icon: "KeyRound",
    title: "Une administration des accès",
    description:
      "Initialisez un super administrateur, gérez les rôles et attribuez des permissions. Les dépendances FastAPI vérifient les droits ; l’interface permet de modifier les descriptions et de désactiver les accès.",
  },
  {
    icon: "Database",
    title: "Des données faciles à exploiter",
    description:
      "Pagination, recherche et tri partagent les mêmes conventions entre le frontend et l’API. Le cache Redis, son invalidation et la limitation de requêtes se branchent sur les routes concernées.",
  },
  {
    icon: "Workflow",
    title: "Des tâches en arrière-plan",
    description:
      "Déléguez les traitements longs à Celery. RabbitMQ conserve les messages et les utilitaires prévoient les tentatives de reprise ainsi que la consultation du statut des tâches.",
  },
  {
    icon: "Activity",
    title: "Déploiement et suivi",
    description:
      "Configurations Docker de développement et de production, migrations Alembic, tests en CI, métriques, journaux et dashboards : les outils pour faire évoluer et observer le projet sont inclus.",
  },
] as const;
const integrations = [
  {
    icon: "Layers3",
    stack: "Next.js · React · TypeScript",
    title: "Interface et navigation",
    description:
      "Pages, composants réutilisables et rendu adaptés aux parcours de votre application.",
  },
  {
    icon: "Braces",
    stack: "FastAPI · Pydantic · OpenAPI",
    title: "Contrats et API typés",
    description:
      "Validation des entrées, documentation des routes et génération du client TypeScript.",
  },
  {
    icon: "Database",
    stack: "MySQL · SQLAlchemy · Alembic",
    title: "Données et migrations",
    description:
      "Modèles SQL et migrations versionnées pour accompagner les évolutions du schéma.",
  },
  {
    icon: "Zap",
    stack: "Redis · fastapi-redis-sdk",
    title: "Cache et limitation",
    description:
      "Réponses mises en cache, invalidation par groupe et limites de requêtes configurables.",
  },
  {
    icon: "Workflow",
    stack: "Celery · RabbitMQ",
    title: "Traitements différés",
    description:
      "Un worker dédié et des messages persistants pour vos traitements en arrière-plan.",
  },
  {
    icon: "Cloud",
    stack: "Local · S3",
    title: "Stockage configurable",
    description:
      "Photos de profil conservées localement par défaut, ou dans un stockage compatible S3.",
  },
  {
    icon: "Mail",
    stack: "SMTP",
    title: "E-mails transactionnels",
    description:
      "Confirmation d’adresse et récupération du compte avec des modèles d’e-mail réutilisables.",
  },
  {
    icon: "Activity",
    stack: "Prometheus · Grafana · Loki",
    title: "Métriques et journaux",
    description:
      "Dashboards provisionnés, collecte des logs, sondes Blackbox et règles d’alerte.",
  },
  {
    icon: "Radio",
    stack: "Socket.IO",
    title: "Échanges en temps réel",
    description:
      "Un serveur Socket.IO intégré au backend pour construire vos événements applicatifs.",
  },
  {
    icon: "Layers3",
    stack: "Docker · Docker Compose",
    title: "Des environnements cohérents",
    description:
      "Services conteneurisés et configurations distinctes pour le développement et la production.",
  },
  {
    icon: "ShieldCheck",
    stack: "GitHub Actions",
    title: "Des contrôles à chaque pull request",
    description:
      "Tests backend et frontend, lint, build et vérification des migrations exécutés par la CI.",
  },
  {
    icon: "Code2",
    stack: "TanStack Query · React Hook Form · Zod",
    title: "État serveur et formulaires",
    description:
      "Hooks de requête, mises à jour ciblées du cache, validation et gestion des formulaires partagés.",
  },
] as const;
const modules = [
  {
    icon: "Code2",
    title: "Communiquer avec l’API",
    path: "frontend/src/lib/api",
    description:
      "Le client généré reste côté serveur Next.js. Les services navigateur passent par un proxy explicite et les hooks TanStack Query gèrent les données, le cache et les mutations ciblées.",
    utilities: ["apiRequest", "useQuery", "setQueryData"],
  },
  {
    icon: "ShieldCheck",
    title: "Protéger vos fonctionnalités",
    path: "backend/api/services/authorization.py",
    description:
      "Réutilisez les contrôles de rôles et de permissions sur vos nouvelles routes. Les droits sont relus en base ; leur désactivation ne nécessite pas de recréer les sessions.",
    utilities: ["require_roles", "require_permissions", "require_access"],
  },
  {
    icon: "Database",
    title: "Construire des listes et gérer le cache",
    path: "backend/api/services",
    description:
      "Appliquez les conventions de pagination et les utilitaires de cache à vos ressources métier, puis conservez les mêmes paramètres et types dans les services frontend.",
    utilities: ["paginate", "cached_response", "invalidate_cache"],
  },
  {
    icon: "Workflow",
    title: "Déporter vos traitements",
    path: "backend/api/services/background.py",
    description:
      "Déclarez une tâche, ajoutez son module au worker, puis mettez-la en file depuis une route. Réutilisez les utilitaires d’envoi et de suivi au lieu de coupler vos routes à Celery.",
    utilities: ["background_task", "enqueue_async", "task_status"],
  },
] as const;
const steps = [
  {
    title: "Initialisez votre projet",
    description:
      "Personnalisez son nom et préparez les fichiers d’environnement à la racine avec des secrets générés. Lancez ensuite les services Docker.",
  },
  {
    title: "Ajoutez votre logique métier",
    description:
      "Créez vos modèles et migrations, exposez vos routes FastAPI, puis régénérez le client TypeScript pour connecter vos services et composants.",
  },
  {
    title: "Validez et observez",
    description:
      "Les pull requests exécutent les contrôles de qualité. Utilisez la configuration de production et les dashboards pour préparer le déploiement et suivre le comportement des services.",
  },
] as const;

/** Présentation du socle existant, de ses intégrations et des points d’extension. */
export default function Home() {
  const { t } = useI18n();
  return (
    <main className={`${styles.root} page-shell`}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div>
          <span className={styles.eyebrow}>
            {t("TEMPLATE FULLSTACK · FASTAPI + NEXT.JS")}
          </span>
          <h1 id="home-title">
            {t("Démarrez votre projet.")}
            <br />
            <em>{t("Les bases sont prêtes.")}</em>
          </h1>
          <p className={styles.lead}>
            {t(
              "Ce template associe FastAPI et Next.js avec la connexion, les profils et la gestion des droits déjà intégrés. Ajoutez vos fonctionnalités en réutilisant les services existants.",
            )}
          </p>
          <HomeActions />

          <a className={styles.explore} href="#fonctionnalites">
            {t("Découvrir ce qui est inclus")}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
        <aside
          className={styles.architecture}
          aria-label={t("Architecture du template")}
        >
          <div className={styles.cardTop}>
            <Layers3 size={16} aria-hidden="true" />
            <span>{t("Comment les services communiquent")}</span>
          </div>
          <ol className={styles.flow}>
            <li>
              <span className={styles.nodeIcon}>
                <Code2 size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>Next.js</strong>
                <span>{t("Interface · services · hooks")}</span>
              </div>
              <span className={styles.nodeTag}>TypeScript</span>
            </li>
            <li className={styles.connector} aria-hidden="true">
              <ArrowDown size={17} />
              <span>OpenAPI · proxy</span>
            </li>
            <li>
              <span className={styles.nodeIcon}>
                <Braces size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>FastAPI</strong>
                <span>{t("Validation · routes · permissions")}</span>
              </div>
              <span className={styles.nodeTag}>Python</span>
            </li>
            <li className={styles.connector} aria-hidden="true">
              <ArrowDown size={17} />
              <span>SQLAlchemy · Celery</span>
            </li>
            <li>
              <span className={styles.nodeIcon}>
                <Database size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>MySQL · Redis · RabbitMQ</strong>
                <span>{t("Données · cache · tâches")}</span>
              </div>
            </li>
          </ol>
          <div className={styles.cardBottom}>
            <Check size={15} aria-hidden="true" />
            {t("Contrats typés, services séparés, configuration centralisée.")}
          </div>
        </aside>
      </section>
      <nav className={styles.sectionNav} aria-label={t("Explorer le template")}>
        <a href="#fonctionnalites">{t("Fonctionnalités incluses")}</a>
        <a href="#integrations">{t("Technologies et intégrations")}</a>
        <a href="#modules">{t("Modules réutilisables")}</a>
        <a href="#demarrer">{t("Démarrer un projet")}</a>
      </nav>
      <section
        id="fonctionnalites"
        className={styles.section}
        aria-labelledby="features-title"
      >
        <header className={styles.sectionHeader}>
          <span className={styles.eyebrow}>
            01 / {t("LES FONCTIONNALITÉS")}
          </span>
          <h2 id="features-title">
            {t("Ce que vous pouvez utiliser dès le départ.")}
          </h2>
          <p>
            {t(
              "Les fonctions communes à la plupart des applications sont déjà en place. Vous pouvez les essayer dans l’interface et les adapter à votre projet.",
            )}
          </p>
        </header>
        <div className={styles.featureGrid}>
          {features.map((item) => {
            const Icon = icons[item.icon];
            return (
              <article key={item.title} className={styles.feature}>
                <span className={styles.featureIcon}>
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3>{t(item.title)}</h3>
                <p>{t(item.description)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section
        id="integrations"
        className={styles.section}
        aria-labelledby="integrations-title"
      >
        <header className={styles.sectionHeader}>
          <span className={styles.eyebrow}>02 / {t("LA STACK")}</span>
          <h2 id="integrations-title">
            {t("Des technologies qui travaillent ensemble.")}
          </h2>
          <p>
            {t(
              "Les connexions entre les services sont préparées. Activez et configurez les intégrations nécessaires à votre projet avec les variables d’environnement.",
            )}
          </p>
        </header>
        <div className={styles.integrationGrid}>
          {integrations.map((item) => {
            const Icon = icons[item.icon];
            return (
              <article key={item.stack} className={styles.integration}>
                <Icon size={19} aria-hidden="true" />
                <div>
                  <span className={styles.stack}>{item.stack}</span>
                  <h3>{t(item.title)}</h3>
                  <p>{t(item.description)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section
        id="modules"
        className={styles.section}
        aria-labelledby="modules-title"
      >
        <header className={styles.sectionHeader}>
          <span className={styles.eyebrow}>
            03 / {t("LES POINTS D’EXTENSION")}
          </span>
          <h2 id="modules-title">
            {t("Ajoutez vos fonctionnalités avec les modules existants.")}
          </h2>
          <p>
            {t(
              "Chaque nouvelle fonctionnalité peut s’appuyer sur les mêmes contrats, contrôles et conventions, avec des exemples concrets dans les modules du dépôt.",
            )}
          </p>
        </header>
        <div className={styles.moduleGrid}>
          {modules.map((item) => {
            const Icon = icons[item.icon];
            return (
              <article key={item.title} className={styles.module}>
                <header>
                  <Icon size={19} aria-hidden="true" />
                  <h3>{t(item.title)}</h3>
                </header>
                <code className={styles.sourcePath}>{item.path}</code>
                <p>{t(item.description)}</p>
                <ul
                  className={styles.utilities}
                  aria-label={t("Utilitaires à réutiliser")}
                >
                  {item.utilities.map((name) => (
                    <li key={name}>
                      <code>{name}</code>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
      <section
        id="demarrer"
        className={styles.start}
        aria-labelledby="start-title"
      >
        <header className={styles.sectionHeader}>
          <span className={styles.eyebrow}>
            04 / {t("À VOUS DE CONSTRUIRE")}
          </span>
          <h2 id="start-title">{t("Pour démarrer votre projet.")}</h2>
          <p>
            {t(
              "Personnalisez la configuration, ajoutez vos premières routes, puis vérifiez que tout fonctionne.",
            )}
          </p>
        </header>
        <ol className={styles.steps}>
          {steps.map((item, index) => (
            <li key={item.title}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <h3>{t(item.title)}</h3>
              <p>{t(item.description)}</p>
            </li>
          ))}
        </ol>
        <div className={styles.command}>
          <span>{t("Depuis la racine du dépôt")}</span>
          <code>
            python3 scripts/init_project.py --name &quot;Mon projet&quot;
            --admin-email admin@example.com
          </code>
        </div>
        <div className={styles.startFooter}>
          <p>
            {t(
              "Le guide présente des exemples de code pour ajouter une fonctionnalité. Le README détaille la configuration et les commandes du projet.",
            )}
          </p>
          <Link href="/documentation">
            {t("Consulter la documentation")}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
