"use client";
import { useI18n } from "@/lib/i18n/use-i18n";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "./api";
import { ResendVerification } from "./email-verification";
import { Field } from "@/components/ui/field";
import { useAuthenticate, useSession } from "./hooks";
import { loginSchema, registerSchema, type RegisterInput } from "./schemas";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const signup = mode === "register";
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const config = useQuery({
    queryKey: ["auth-config"],
    queryFn: authApi.config,
    enabled: signup,
    staleTime: 30_000,
    retry: false,
  });
  const verificationRequired = config.data?.email_verification_enabled === true;
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
    defaultValues: { username: "", telephone: "", email: "", password: "" },
  });
  useEffect(() => {
    if (session.data) router.replace("/profil");
  }, [session.data, router]);
  async function submit(values: RegisterInput) {
    if (!signup) {
      const parsed = loginSchema.safeParse(values);
      if (!parsed.success) return;
    }
    if (signup && verificationRequired && !values.email) {
      form.setError("email", {
        message: "Une adresse e-mail est requise pour confirmer votre compte.",
      });
      return;
    }
    mutation.mutate(values, {
      onSuccess: (user) => {
        form.reset();
        if (signup && !user) setPendingEmail(values.email || "");
        else router.replace("/profil");
      },
    });
  }
  return (
    <section className="auth-layout page-shell">
      <aside className="auth-story">
        <span className="eyebrow">
          <span className="status-dot" />
          {t("AUTHENTIFICATION · MODULE DU TEMPLATE")}
        </span>
        <h1>
          {signup ? (
            <>
              {t("Un compte.")}
              <br />
              {t("Un premier test.")}
              <br />
              <em>{t("Votre projet démarre.")}</em>
            </>
          ) : (
            <>
              {t("Votre projet.")}
              <br />
              {t("Une connexion")}
              <em> {t("déjà intégrée.")}</em>
            </>
          )}
        </h1>
        <p>
          {signup
            ? t(
                "Créez un compte pour tester le parcours d’inscription inclus dans ce template fullstack.",
              )
            : t(
                "Connectez-vous pour explorer le profil utilisateur et les fonctionnalités de départ du template.",
              )}
        </p>
        <div className="story-note">
          <ShieldCheck size={21} />
          <span>
            {t("Inscription, connexion et profil.")}
            <br />
            <strong>{t("Une base à adapter à votre application.")}</strong>
          </span>
        </div>
        <span className="story-grid" aria-hidden="true" />
      </aside>
      <div className="auth-card">
        <div className="section-index">
          {signup ? t("01 / INSCRIPTION") : t("01 / CONNEXION")}
        </div>
        <h2>{signup ? t("Créer votre compte") : t("Se connecter")}</h2>
        <p className="muted">
          {signup
            ? t("Renseignez les informations du compte à créer.")
            : t("Utilisez le compte créé sur cette instance du template.")}
        </p>
        {!signup ? (
          <Suspense fallback={null}>
            <LoginNotice />
          </Suspense>
        ) : null}
        {pendingEmail !== null ? (
          <>
            <p role="status" className="notice notice-success">
              {t(
                "Compte créé. Consultez votre boîte e-mail pour confirmer votre adresse avant de vous connecter.",
              )}
            </p>
            <ResendVerification initialEmail={pendingEmail} />
          </>
        ) : (
          <form
            className="form-stack"
            onSubmit={form.handleSubmit(submit)}
            noValidate
          >
            <Field
              id="username"
              label={t("Nom d’utilisateur")}
              autoComplete="username"
              placeholder="ex. alex_martin"
              maxLength={64}
              {...form.register("username")}
              error={
                form.formState.errors.username?.message
                  ? t(form.formState.errors.username.message)
                  : undefined
              }
            />
            {signup ? (
              <Field
                id="email"
                label={
                  verificationRequired
                    ? t("Adresse e-mail")
                    : t("E-mail (facultatif)")
                }
                required={verificationRequired}
                type="email"
                autoComplete="email"
                maxLength={254}
                {...form.register("email")}
                error={
                  form.formState.errors.email?.message
                    ? t(form.formState.errors.email.message)
                    : undefined
                }
                hint={t(
                  verificationRequired
                    ? "Confirmez votre adresse e-mail pour activer votre compte."
                    : "Nécessaire pour réinitialiser votre mot de passe par e-mail.",
                )}
              />
            ) : null}
            {signup ? (
              <Field
                id="telephone"
                label={t("Téléphone (facultatif)")}
                autoComplete="tel"
                type="tel"
                placeholder="+226 70 00 00 00"
                maxLength={32}
                {...form.register("telephone")}
                error={
                  form.formState.errors.telephone?.message
                    ? t(form.formState.errors.telephone.message)
                    : undefined
                }
              />
            ) : null}
            <div className="password-field">
              <Field
                id="password"
                label={t("Mot de passe")}
                type={showPassword ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder={
                  signup ? t("8 caractères minimum") : t("Votre mot de passe")
                }
                maxLength={128}
                {...form.register("password")}
                error={
                  form.formState.errors.password?.message
                    ? t(form.formState.errors.password.message)
                    : undefined
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? t("Masquer le mot de passe")
                    : t("Afficher le mot de passe")
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!signup ? (
              <Link className="forgot-link" href="/mot-de-passe-oublie">
                {t("Mot de passe oublié ?")}
              </Link>
            ) : null}
            {signup && config.error ? (
              <p role="alert" className="notice notice-error">
                {t(config.error.message)}{" "}
                <button
                  type="button"
                  className="button"
                  onClick={() => config.refetch()}
                >
                  {t("Réessayer")}
                </button>
              </p>
            ) : null}
            {mutation.error ? (
              <p role="alert" className="notice notice-error">
                {t(mutation.error.message)}
              </p>
            ) : null}
            <button
              className="button button-primary button-full"
              type="submit"
              disabled={
                mutation.isPending || !!session.data || (signup && !config.data)
              }
            >
              {mutation.isPending ? (
                <>
                  <LoaderCircle size={17} className="spin" />
                  {signup ? t("Création du compte…") : t("Connexion en cours…")}
                </>
              ) : (
                <>
                  {signup ? t("Créer mon compte") : t("Se connecter")}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        )}
        {!signup ? (
          <p className="auth-switch">
            <Link href="/confirmer-email">
              {t("Renvoyer le lien de confirmation")}
            </Link>
          </p>
        ) : null}
        <p className="auth-switch">
          {signup ? t("Déjà un compte ?") : t("Pas encore de compte ?")}{" "}
          <Link href={signup ? "/connexion" : "/inscription"}>
            {signup ? t("Se connecter") : t("Créer un compte")}
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

function LoginNotice() {
  const params = useSearchParams();
  const { t } = useI18n();
  const notice = params.get("notice");
  const message =
    notice === "password-changed"
      ? t(
          "Mot de passe modifié. Reconnectez-vous avec le nouveau mot de passe.",
        )
      : notice === "email-changed"
        ? t(
            "Adresse e-mail enregistrée. Si une confirmation est requise, consultez votre boîte e-mail avant de vous reconnecter.",
          )
        : null;
  return message ? (
    <p className="notice notice-success" role="status">
      {message}
    </p>
  ) : null;
}
