"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { Field } from "@/components/ui/field";
import { useAuthenticate, useSession } from "./hooks";
import { loginSchema, registerSchema, type RegisterInput } from "./schemas";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const signup = mode === "register";
  const router = useRouter();
  const session = useSession();
  const mutation = useAuthenticate(mode);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(
      signup
        ? registerSchema
        : registerSchema.extend({ password: loginSchema.shape.password }),
    ),
    defaultValues: { username: "", telephone: "", password: "" },
  });
  useEffect(() => {
    if (session.data) router.replace("/profil");
  }, [session.data, router]);
  async function submit(values: RegisterInput) {
    if (!signup) {
      const parsed = loginSchema.safeParse(values);
      if (!parsed.success) return;
    }
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset();
        router.replace("/profil");
      },
    });
  }
  return (
    <section className="auth-layout page-shell">
      <aside className="auth-story">
        <span className="eyebrow">
          <span className="status-dot" />
          AUTHENTIFICATION · MODULE DU TEMPLATE
        </span>
        <h1>
          {signup ? (
            <>
              Un compte.
              <br />
              Un premier test.
              <br />
              <em>Votre projet démarre.</em>
            </>
          ) : (
            <>
              Votre projet.
              <br />
              Une connexion<em> déjà intégrée.</em>
            </>
          )}
        </h1>
        <p>
          {signup
            ? "Créez un compte pour tester le parcours d’inscription inclus dans ce template fullstack."
            : "Connectez-vous pour explorer le profil utilisateur et les fonctionnalités de départ du template."}
        </p>
        <div className="story-note">
          <ShieldCheck size={21} />
          <span>
            Inscription, connexion et profil.
            <br />
            <strong>Une base à adapter à votre application.</strong>
          </span>
        </div>
        <span className="story-grid" aria-hidden="true" />
      </aside>
      <div className="auth-card">
        <div className="section-index">
          {signup ? "01 / INSCRIPTION" : "01 / CONNEXION"}
        </div>
        <h2>{signup ? "Créer votre compte" : "Se connecter"}</h2>
        <p className="muted">
          {signup
            ? "Renseignez les informations du compte à créer."
            : "Utilisez le compte créé sur cette instance du template."}
        </p>
        <form
          className="form-stack"
          onSubmit={form.handleSubmit(submit)}
          noValidate
        >
          <Field
            id="username"
            label="Nom d’utilisateur"
            autoComplete="username"
            placeholder="ex. alex_martin"
            maxLength={64}
            {...form.register("username")}
            error={form.formState.errors.username?.message}
          />
          {signup ? (
            <Field
              id="telephone"
              label="Téléphone (facultatif)"
              autoComplete="tel"
              type="tel"
              placeholder="+226 70 00 00 00"
              maxLength={32}
              {...form.register("telephone")}
              error={form.formState.errors.telephone?.message}
            />
          ) : null}
          <div className="password-field">
            <Field
              id="password"
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={
                signup ? "8 caractères minimum" : "Votre mot de passe"
              }
              maxLength={128}
              {...form.register("password")}
              error={form.formState.errors.password?.message}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mutation.error ? (
            <p role="alert" className="notice notice-error">
              {mutation.error.message}
            </p>
          ) : null}
          <button
            className="button button-primary button-full"
            type="submit"
            disabled={mutation.isPending || !!session.data}
          >
            {mutation.isPending ? (
              <>
                <LoaderCircle size={17} className="spin" />
                {signup ? "Création du compte…" : "Connexion en cours…"}
              </>
            ) : (
              <>
                {signup ? "Créer mon compte" : "Se connecter"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
        <p className="auth-switch">
          {signup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <Link href={signup ? "/connexion" : "/inscription"}>
            {signup ? "Se connecter" : "Créer un compte"}
            <ArrowUpRightSmall />
          </Link>
        </p>
      </div>
    </section>
  );
}
function ArrowUpRightSmall() {
  return <ArrowRight size={13} aria-hidden="true" />;
}
