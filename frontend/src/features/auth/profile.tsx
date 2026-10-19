"use client";
import { useI18n } from "@/lib/i18n/use-i18n";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Check,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Field } from "@/components/ui/field";
import type { CurrentUser } from "@/lib/api/types";
import { formatConnection } from "@/lib/date";
import { useSession, useUpdateProfile, useUploadPhoto } from "./hooks";
import { profileSchema, type ProfileInput } from "./schemas";

export function Profile() {
  const { t } = useI18n();
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.isSuccess && !session.data) router.replace("/connexion");
  }, [session.isSuccess, session.data, router]);
  if (session.isError)
    return (
      <main className="page-shell profile-page">
        <div className="notice notice-error" role="alert">
          <p>{t("Votre profil ne peut pas être chargé pour le moment.")}</p>
          <button
            className="button button-quiet"
            onClick={() => void session.refetch()}
          >
            {t("Réessayer")}
          </button>
        </div>
      </main>
    );
  if (!session.data)
    return (
      <main className="page-shell profile-page" aria-busy="true">
        <div className="skeleton profile-skeleton" role="status">
          <span className="sr-only">{t("Chargement du profil…")}</span>
        </div>
      </main>
    );
  return <ProfileDetails key={session.data.username} user={session.data} />;
}
function ProfileDetails({ user }: { user: CurrentUser }) {
  const { t, language } = useI18n();
  const update = useUpdateProfile();
  const photo = useUploadPhoto();
  const [photoError, setPhotoError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { telephone: user.telephone || "" },
  });
  function upload(selected?: File) {
    setPhotoError(null);
    photo.reset();
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setPhotoError("Choisissez une photo JPEG, PNG ou WebP.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setPhotoError("Votre photo doit peser au maximum 5 Mio.");
      return;
    }
    photo.mutate(selected, {
      onSettled: () => {
        if (file.current) file.current.value = "";
      },
    });
  }
  return (
    <main className="page-shell profile-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{t("PROFIL · MODULE DU TEMPLATE")}</span>
          <h1>
            {t("Profil utilisateur")}
            <span className="brand-dot">.</span>
          </h1>
          <p className="muted">
            {t(
              "Testez la gestion du compte incluse dans le template et adaptez-la à votre projet.",
            )}
          </p>
        </div>
        <span className="status-pill">
          <span className="status-dot" />
          {t("Session active")}
        </span>
      </div>
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <span className="profile-tab">
            <UserRound size={18} />
            {t("Mon profil")}
          </span>
          <div className="sidebar-note">
            <LockKeyhole size={20} />
            <p>
              {t(
                "Ce module fournit une base pour la gestion des profils dans votre application.",
              )}
            </p>
          </div>
        </aside>
        <div className="profile-panels">
          <section className="panel">
            <div className="panel-heading">
              <span className="section-index">01</span>
              <div>
                <h2>{t("Photo de profil")}</h2>
                <p className="muted">
                  {t("Ajoutez ou remplacez la photo associée au compte.")}
                </p>
              </div>
            </div>
            <div className="photo-editor">
              <Avatar user={user} large />
              <div>
                <input
                  ref={file}
                  id="profile-photo"
                  aria-label={t("Photo de profil")}
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={photo.isPending}
                  onChange={(event) => upload(event.target.files?.[0])}
                />
                <button
                  className="button button-outline"
                  type="button"
                  disabled={photo.isPending}
                  onClick={() => file.current?.click()}
                >
                  {photo.isPending ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                  {photo.isPending
                    ? t("Envoi de la photo…")
                    : user.profile_photo_url
                      ? t("Changer la photo")
                      : t("Ajouter une photo")}
                </button>
                <p className="field-hint">
                  {t("JPEG, PNG ou WebP · 5 Mio maximum")}
                </p>
                <span className="sr-only" id="photo-label">
                  {t("Photo de profil")}
                </span>
              </div>
            </div>
            {photoError || photo.error ? (
              <p role="alert" className="notice notice-error">
                {t(
                  photoError ||
                    photo.error?.message ||
                    "Une erreur est survenue. Réessayez.",
                )}
              </p>
            ) : photo.isSuccess ? (
              <p role="status" className="success-message">
                <Check size={15} />
                {t("Photo de profil mise à jour.")}
              </p>
            ) : null}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <span className="section-index">02</span>
              <div>
                <h2>{t("Informations personnelles")}</h2>
                <p className="muted">
                  {t(
                    "Les champs de départ du profil, à adapter aux besoins de votre projet.",
                  )}
                </p>
              </div>
            </div>
            <form
              className="form-stack"
              onSubmit={form.handleSubmit((values) =>
                update.mutate(values, {
                  onSuccess: (updated) =>
                    form.reset({ telephone: updated.telephone || "" }),
                }),
              )}
              noValidate
            >
              <Field
                id="profile-username"
                label={t("Nom d’utilisateur")}
                value={user.username}
                readOnly
                hint={t("Votre identifiant de connexion.")}
              />
              <Field
                id="profile-telephone"
                label={t("Téléphone")}
                type="tel"
                autoComplete="tel"
                placeholder="+226 70 00 00 00"
                maxLength={32}
                {...form.register("telephone")}
                error={
                  form.formState.errors.telephone?.message
                    ? t(form.formState.errors.telephone.message)
                    : undefined
                }
              />
              {update.error ? (
                <p role="alert" className="notice notice-error">
                  {t(update.error.message)}
                </p>
              ) : null}
              <div className="form-footer">
                <span aria-live="polite" className="success-message">
                  {update.isSuccess ? (
                    <>
                      <Check size={15} />
                      {t("Modifications enregistrées.")}
                    </>
                  ) : null}
                </span>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={update.isPending || !form.formState.isDirty}
                >
                  {update.isPending ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : null}
                  {update.isPending
                    ? t("Enregistrement…")
                    : t("Enregistrer les modifications")}
                </button>
              </div>
            </form>
          </section>
          <section className="connection-panel">
            <span className="connection-icon">
              <Clock3 size={21} />
            </span>
            <div>
              <h2>{t("Dernière connexion")}</h2>
              <p>{t("Dernière authentification réussie sur votre compte.")}</p>
            </div>
            <time dateTime={user.last_login_at || undefined}>
              {formatConnection(user.last_login_at, language)}
            </time>
          </section>
        </div>
      </div>
    </main>
  );
}
