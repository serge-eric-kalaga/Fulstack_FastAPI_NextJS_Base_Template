"use client";
import { useI18n } from "@/lib/i18n/use-i18n";
import {
  ArrowDownRight,
  Fingerprint,
  Layers3,
  Sparkles,
  UserRound,
} from "lucide-react";
import { HomeActions } from "@/features/auth/home-actions";

export default function Home() {
  const { t } = useI18n();
  return (
    <main className="page-shell home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" />
            {t("TEMPLATE FULLSTACK · FASTAPI + NEXT.JS")}
          </span>
          <h1>
            {t("Démarrez votre projet fullstack.")}
            <br />
            <em>{t("Une base prête à personnaliser.")}</em>
          </h1>
          <p>
            {t(
              "Un template FastAPI et Next.js avec authentification, gestion du profil et communication API intégrées. Adaptez cette base aux besoins de votre application.",
            )}
          </p>
          <HomeActions />
          <div className="hero-caption">
            <span className="caption-line" />
            {t(
              "Explorez les modules inclus, puis ajoutez vos fonctionnalités.",
            )}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-orbit orbit-one" />
          <span className="art-orbit orbit-two" />
          <div className="art-label">FASTAPI / NEXT.JS</div>
          <div className="art-tile tile-back">
            <Layers3 size={42} strokeWidth={1.2} />
          </div>
          <div className="art-tile tile-front">
            <span className="tile-symbol">
              <Sparkles size={38} strokeWidth={1.4} />
            </span>
            <span>
              {t("Un socle réutilisable.")}
              <br />
              <strong>{t("Votre application à construire.")}</strong>
            </span>
            <ArrowDownRight size={23} />
          </div>
          <span className="art-cross cross-one">+</span>
          <span className="art-cross cross-two">+</span>
          <span className="art-coordinate">
            {t("01 — PERSONNALISEZ CE TEMPLATE")}
          </span>
        </div>
      </section>
      <section
        className="feature-row"
        aria-label={t("Les essentiels du template")}
      >
        <article>
          <Fingerprint size={23} />
          <div>
            <h2>{t("Authentification intégrée")}</h2>
            <p>
              {t(
                "Testez les parcours de création de compte, de connexion et de déconnexion.",
              )}
            </p>
          </div>
        </article>
        <article>
          <UserRound size={23} />
          <div>
            <h2>{t("Gestion du profil")}</h2>
            <p>
              {t(
                "Un module de départ pour gérer les informations et la photo du compte.",
              )}
            </p>
          </div>
        </article>
        <article>
          <Layers3 size={23} />
          <div>
            <h2>{t("Des modules à réutiliser")}</h2>
            <p>
              {t(
                "Des composants et services API à réutiliser pour développer vos prochaines fonctionnalités.",
              )}
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
