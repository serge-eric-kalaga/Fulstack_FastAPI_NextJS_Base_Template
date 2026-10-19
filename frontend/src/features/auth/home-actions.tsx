"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "./hooks";
export function HomeActions() {
  const session = useSession();
  if (session.isPending)
    return (
      <div
        className="skeleton hero-action-skeleton"
        aria-label="Chargement de la session"
      />
    );
  return (
    <div className="hero-actions">
      <Link
        className="button button-primary button-large"
        href={session.data ? "/profil" : "/inscription"}
      >
        {session.data ? "Ouvrir mon profil" : "Tester l’inscription"}
        <ArrowRight size={18} />
      </Link>
      <Link
        className="button button-quiet"
        href={session.data ? "/profil" : "/connexion"}
      >
        {session.data
          ? `Bonjour, ${session.data.username}`
          : "Tester la connexion"}
      </Link>
    </div>
  );
}
