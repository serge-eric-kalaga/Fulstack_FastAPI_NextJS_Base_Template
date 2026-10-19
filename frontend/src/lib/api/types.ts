/** Contrat du compte courant. Les dates du backend sont exprimées en UTC. */
export interface CurrentUser {
  username: string;
  email: string | null;
  telephone: string | null;
  profile_photo_url: string | null;
  last_login_at: string | null;
}
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}
