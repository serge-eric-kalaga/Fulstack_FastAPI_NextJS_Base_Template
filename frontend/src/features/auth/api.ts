import { apiRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";
import type {
  LoginInput,
  ProfileInput,
  RegisterInput,
  ChangePasswordInput,
  ChangeEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./schemas";

/** Services métier réutilisables : les composants ne connaissent pas les détails HTTP. */
export const authApi = {
  session: (signal?: AbortSignal) =>
    apiRequest<CurrentUser | null>("/session", { signal }),
  login: (body: LoginInput) =>
    apiRequest<CurrentUser>("/auth/login", { method: "POST", body }),
  register: (body: RegisterInput) =>
    apiRequest<CurrentUser>("/auth/register", { method: "POST", body }),
  changePassword: (body: ChangePasswordInput, language: string) =>
    apiRequest<null>("/profile/password", {
      method: "PUT",
      body,
      headers: { "Accept-Language": language },
    }),
  changeEmail: (body: ChangeEmailInput, language: string) =>
    apiRequest<null>("/profile/email", {
      method: "PATCH",
      body,
      headers: { "Accept-Language": language },
    }),
  forgotPassword: (body: ForgotPasswordInput, language: string) =>
    apiRequest<null>("/auth/forgot-password", {
      method: "POST",
      body,
      headers: { "Accept-Language": language },
    }),
  resetPassword: (body: ResetPasswordInput, language: string) =>
    apiRequest<null>("/auth/reset-password", {
      method: "POST",
      body,
      headers: { "Accept-Language": language },
    }),
  logout: () => apiRequest<null>("/auth/logout", { method: "POST" }),
  updateProfile: (body: ProfileInput) =>
    apiRequest<CurrentUser>("/profile", { method: "PATCH", body }),
  uploadPhoto: (photo: File) => {
    const body = new FormData();
    body.set("photo", photo);
    return apiRequest<CurrentUser>("/profile/photo", { method: "PUT", body });
  },
};
