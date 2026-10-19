"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Layers3,
  LoaderCircle,
  LogOut,
  UserRound,
} from "lucide-react";
import { useLogout, useSession } from "@/features/auth/hooks";
import { Avatar } from "@/components/ui/avatar";
import { formatConnection } from "@/lib/date";

export function Navbar() {
  const session = useSession();
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const user = session.data;
  return (
    <header className="site-header">
      <nav className="navbar page-shell" aria-label="Navigation principale">
        <Link href="/" className="brand" aria-label="Fullstack, accueil">
          <span className="brand-mark">
            <Layers3 size={20} />
          </span>
          <span className="brand-word">
            fullstack<span className="brand-dot">.</span>
          </span>
          <span className="brand-tag">BASE TEMPLATE</span>
        </Link>
        <div className="nav-actions">
          {session.isPending ? (
            <div className="nav-skeleton skeleton" role="status">
              <span className="sr-only">Chargement de la session…</span>
            </div>
          ) : session.isError ? (
            <button
              className="button button-quiet"
              onClick={() => void session.refetch()}
            >
              Réessayer la connexion
            </button>
          ) : user ? (
            <>
              <Dropdown.Root>
                <Dropdown.Trigger
                  className="account-trigger"
                  aria-label="Ouvrir le menu du compte"
                >
                  <Avatar user={user} />
                  <span className="account-name">{user.username}</span>
                  <ChevronDown size={15} />
                </Dropdown.Trigger>
                <Dropdown.Portal>
                  <Dropdown.Content
                    className="account-menu"
                    align="end"
                    sideOffset={12}
                    collisionPadding={12}
                  >
                    <Dropdown.Label className="menu-identity">
                      <span className="overline">MON COMPTE</span>
                      <strong>{user.username}</strong>
                    </Dropdown.Label>
                    <div className="menu-connection">
                      <Clock3 size={15} />
                      <div>
                        <span>Dernière connexion</span>
                        <time dateTime={user.last_login_at || undefined}>
                          {formatConnection(user.last_login_at)}
                        </time>
                      </div>
                    </div>
                    <Dropdown.Separator className="menu-separator" />
                    <Dropdown.Item asChild>
                      <Link href="/profil" className="menu-item">
                        <UserRound size={17} />
                        Modifier mon profil
                        <ArrowUpRight size={15} className="push-right" />
                      </Link>
                    </Dropdown.Item>
                    <Dropdown.Item
                      className="menu-item menu-danger"
                      disabled={logout.isPending}
                      onSelect={() =>
                        logout.mutate(undefined, {
                          onSuccess: () => router.replace("/"),
                        })
                      }
                    >
                      {logout.isPending ? (
                        <LoaderCircle size={17} className="spin" />
                      ) : (
                        <LogOut size={17} />
                      )}
                      Se déconnecter
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>
              {logout.isError ? (
                <span className="nav-error" role="alert">
                  Déconnexion impossible. Réessayez.
                </span>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className={`button button-quiet${pathname === "/connexion" ? " is-active" : ""}`}
              >
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="button button-primary nav-signup"
              >
                Créer un compte
                <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
