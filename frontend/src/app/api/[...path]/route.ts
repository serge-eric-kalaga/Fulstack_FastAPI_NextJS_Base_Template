import { NextRequest, NextResponse } from "next/server";
import {
  loginSchema,
  registerSchema,
  profileSchema,
  changePasswordSchema,
  changeEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  confirmEmailSchema,
} from "@/features/auth/schemas";
import {
  BackendError,
  backendData,
  backendFetch,
  browserUser,
  checkOrigin,
  jsonData,
  readBody,
  readJson,
  requireSession,
  SESSION_COOKIE,
  setSession,
} from "@/lib/api/server";
import type { CurrentUser } from "@/lib/api/types";

type Context = { params: Promise<{ path: string[] }> };

/** Proxy limité aux routes du compte ; aucune URL arbitraire ni jeton côté client. */
async function handle(request: NextRequest, context: Context) {
  const path = (await context.params).path.join("/");
  const method = request.method;
  try {
    if (method !== "GET") checkOrigin(request);
    if (path === "auth/config" && method === "GET") {
      return jsonData(
        await backendData<{ email_verification_enabled: boolean }>(
          "/api/auth/config",
        ),
      );
    }
    if (path === "auth/resend-verification" && method === "POST") {
      const input = forgotPasswordSchema.safeParse(await readJson(request));
      if (!input.success)
        throw new BackendError(400, "Adresse e-mail invalide.");
      await backendData("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input.data,
          language: request.headers.get("accept-language")?.startsWith("en")
            ? "en"
            : "fr",
        }),
      });
      return jsonData(null, 202);
    }
    if (path === "auth/verify-email" && method === "POST") {
      const input = confirmEmailSchema.safeParse(await readJson(request));
      if (!input.success)
        throw new BackendError(
          400,
          "Le lien de confirmation est invalide ou a expiré. Demandez un nouveau lien.",
        );
      await backendData("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.data),
      });
      const response = jsonData(null);
      setSession(response, "", 0);
      return response;
    }
    if (path === "auth/logout" && method === "POST") {
      const response = jsonData(null);
      setSession(response, "", 0);
      return response;
    }
    if (
      (path === "auth/login" || path === "auth/register") &&
      method === "POST"
    ) {
      const input = await readJson(request);
      const parsed = (
        path === "auth/register" ? registerSchema : loginSchema
      ).safeParse(input);
      if (!parsed.success)
        throw new BackendError(
          400,
          parsed.error.issues[0]?.message ||
            "Vérifiez les informations saisies.",
        );
      if (path === "auth/register") {
        const registration = await backendData<{
          verification_required: boolean;
        }>("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            language: request.headers.get("accept-language")?.startsWith("en")
              ? "en"
              : "fr",
            email:
              "email" in parsed.data ? parsed.data.email || null : undefined,
          }),
        });
        if (registration.verification_required) {
          const response = jsonData(null, 202);
          setSession(response, "", 0);
          return response;
        }
      }
      const login = await backendData<{ token: string }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: parsed.data.username,
          password: parsed.data.password,
        }),
      });
      if (typeof login.token !== "string" || login.token.length > 4096)
        throw new BackendError(502, "Réponse de connexion invalide.");
      const user = await backendData<CurrentUser>(
        "/api/user/me",
        {},
        login.token,
      );
      const response = jsonData(browserUser(user));
      setSession(response, login.token);
      return response;
    }
    if (path === "auth/forgot-password" && method === "POST") {
      const body = await readJson(request);
      const input = forgotPasswordSchema.safeParse(body);
      if (!input.success)
        throw new BackendError(400, "Adresse e-mail invalide.");
      const language = request.headers.get("accept-language")?.startsWith("en")
        ? "en"
        : "fr";
      await backendData("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input.data, language }),
      });
      return jsonData(null, 202);
    }
    if (path === "auth/reset-password" && method === "POST") {
      const input = resetPasswordSchema.safeParse(await readJson(request));
      if (!input.success)
        throw new BackendError(
          400,
          input.error.issues[0]?.message ||
            "Vérifiez les informations saisies.",
        );
      await backendData("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": request.headers.get("accept-language") || "fr",
        },
        body: JSON.stringify({
          token: input.data.token,
          new_password: input.data.new_password,
        }),
      });
      const response = jsonData(null);
      setSession(response, "", 0);
      return response;
    }
    if (
      (path === "profile/password" && method === "PUT") ||
      (path === "profile/email" && method === "PATCH")
    ) {
      const token = requireSession(request);
      const password = path === "profile/password";
      const input = (
        password ? changePasswordSchema : changeEmailSchema
      ).safeParse(await readJson(request));
      if (!input.success)
        throw new BackendError(
          400,
          input.error.issues[0]?.message ||
            "Vérifiez les informations saisies.",
        );
      const { current_password } = input.data;
      const body =
        "new_password" in input.data
          ? { current_password, new_password: input.data.new_password }
          : { current_password, email: input.data.email };
      await backendData(
        password ? "/api/user/me/password" : "/api/user/me/email",
        {
          method: password ? "PUT" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept-Language": request.headers.get("accept-language") || "fr",
          },
          body: JSON.stringify(body),
        },
        token,
      );
      const response = jsonData(null);
      setSession(response, "", 0);
      return response;
    }
    if (path === "session" && method === "GET") {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      if (!token) return jsonData(null);
      try {
        return jsonData(
          browserUser(
            await backendData<CurrentUser>("/api/user/me", {}, token),
          ),
        );
      } catch (error) {
        if (
          error instanceof BackendError &&
          [401, 404].includes(error.status)
        ) {
          const response = jsonData(null);
          setSession(response, "", 0);
          return response;
        }
        throw error;
      }
    }
    if (path === "profile" && method === "PATCH") {
      const token = requireSession(request);
      const input = profileSchema.safeParse(await readJson(request));
      if (!input.success)
        throw new BackendError(
          400,
          "Le téléphone doit contenir au maximum 32 caractères.",
        );
      const user = await backendData<CurrentUser>(
        "/api/user/me",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ telephone: input.data.telephone || null }),
        },
        token,
      );
      return jsonData(browserUser(user));
    }
    if (path === "profile/photo" && method === "PUT") {
      const token = requireSession(request);
      const type = request.headers.get("content-type") || "";
      if (!type.startsWith("multipart/form-data;"))
        throw new BackendError(415, "Sélectionnez une photo à téléverser.");
      const body = await readBody(request, 6 * 1024 * 1024);
      await backendData(
        "/api/user/me/photo",
        {
          method: "PUT",
          headers: { "Content-Type": type },
          body: body as BodyInit,
        },
        token,
      );
      return jsonData(
        browserUser(await backendData<CurrentUser>("/api/user/me", {}, token)),
      );
    }
    if (path === "profile/photo" && method === "GET") {
      const token = requireSession(request);
      const user = await backendData<CurrentUser>("/api/user/me", {}, token);
      if (!user.profile_photo_url)
        throw new BackendError(404, "Aucune photo de profil.");
      const photo = await backendFetch(
        `/api/user/${encodeURIComponent(user.username)}/photo`,
        {},
        token,
      );
      if (!photo.ok)
        throw new BackendError(photo.status, "Photo indisponible.");
      return new NextResponse(await photo.arrayBuffer(), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return NextResponse.json(
      { message: "Route introuvable." },
      { status: 404 },
    );
  } catch (error) {
    const status = error instanceof BackendError ? error.status : 500;
    const response = NextResponse.json(
      {
        message:
          error instanceof BackendError
            ? error.message
            : "Une erreur est survenue. Réessayez.",
      },
      { status, headers: { "Cache-Control": "private, no-store" } },
    );
    if (status === 401) setSession(response, "", 0);
    return response;
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
