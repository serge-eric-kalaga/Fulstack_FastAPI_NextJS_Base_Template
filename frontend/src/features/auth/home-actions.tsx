"use client";
import { useI18n } from "@/lib/i18n/use-i18n";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "./hooks";
export function HomeActions() {
  const { t } = useI18n();
  const session = useSession();
  if (session.isPending)
    return (
      <div
        className="skeleton hero-action-skeleton"
        aria-label={t("Chargement de la session")}
      />
    );
  return (
    <div className="hero-actions">
      <Link
        className="button button-primary button-large"
        href={session.data ? "/profil" : "/inscription"}
      >
        {session.data ? t("Ouvrir mon profil") : t("Tester l’inscription")}
        <ArrowRight size={18} />
      </Link>
      <Link
        className="button button-quiet"
        href={session.data ? "/profil" : "/connexion"}
      >
        {session.data
          ? t("Bonjour, {{username}}", { username: session.data.username })
          : t("Tester la connexion")}
      </Link>
    </div>
  );
}
