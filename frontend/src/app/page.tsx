import {
  ArrowDownRight,
  Fingerprint,
  Layers3,
  Sparkles,
  UserRound,
} from "lucide-react";
import { HomeActions } from "@/features/auth/home-actions";

export default function Home() {
  return (
    <main className="page-shell home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" />
            TEMPLATE FULLSTACK · FASTAPI + NEXT.JS
          </span>
          <h1>
            Démarrez votre projet fullstack.
            <br />
            <em>Une base prête à personnaliser.</em>
          </h1>
          <p>
            Un template FastAPI et Next.js avec authentification, gestion du profil
            et communication API intégrées. Adaptez cette base aux besoins de
            votre application.
          </p>
          <HomeActions />
          <div className="hero-caption">
            <span className="caption-line" />
            Explorez les modules inclus, puis ajoutez vos fonctionnalités.
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
              Un socle réutilisable.
              <br />
              <strong>Votre application à construire.</strong>
            </span>
            <ArrowDownRight size={23} />
          </div>
          <span className="art-cross cross-one">+</span>
          <span className="art-cross cross-two">+</span>
          <span className="art-coordinate">01 — PERSONNALISEZ CE TEMPLATE</span>
        </div>
      </section>
      <section className="feature-row" aria-label="Les essentiels du template">
        <article>
          <Fingerprint size={23} />
          <div>
            <h2>Authentification intégrée</h2>
            <p>Testez les parcours de création de compte, de connexion et de déconnexion.</p>
          </div>
        </article>
        <article>
          <UserRound size={23} />
          <div>
            <h2>Gestion du profil</h2>
            <p>Un module de départ pour gérer les informations et la photo du compte.</p>
          </div>
        </article>
        <article>
          <Layers3 size={23} />
          <div>
            <h2>Des modules à réutiliser</h2>
            <p>
              Des composants et services API à réutiliser pour développer vos
              prochaines fonctionnalités.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
