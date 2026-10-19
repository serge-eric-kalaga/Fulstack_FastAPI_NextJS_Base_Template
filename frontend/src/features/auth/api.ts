import { apiRequest } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";
import type { LoginInput, ProfileInput, RegisterInput } from "./schemas";

/** Services métier réutilisables : les composants ne connaissent pas les détails HTTP. */
export const authApi = {
  session: (signal?: AbortSignal) =>
    apiRequest<CurrentUser | null>("/session", { signal }),
  login: (body: LoginInput) =>
    apiRequest<CurrentUser>("/auth/login", { method: "POST", body }),
  register: (body: RegisterInput) =>
    apiRequest<CurrentUser>("/auth/register", { method: "POST", body }),
  logout: () => apiRequest<null>("/auth/logout", { method: "POST" }),
  updateProfile: (body: ProfileInput) =>
    apiRequest<CurrentUser>("/profile", { method: "PATCH", body }),
  uploadPhoto: (photo: File) => {
    const body = new FormData();
    body.set("photo", photo);
    return apiRequest<CurrentUser>("/profile/photo", { method: "PUT", body });
  },
};
