import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(3, "Au moins 3 caractères.")
  .max(64, "64 caractères maximum.")
  .regex(
    /^[\p{L}\p{N}_.-]+$/u,
    "Utilisez des lettres, chiffres, points, tirets ou underscores.",
  );
export const loginSchema = z.object({
  username,
  password: z
    .string()
    .min(1, "Saisissez votre mot de passe.")
    .max(128, "128 caractères maximum."),
});
export const registerSchema = z.object({
  username,
  telephone: z.string().trim().max(32, "32 caractères maximum."),
  password: z
    .string()
    .min(8, "Au moins 8 caractères.")
    .max(128, "128 caractères maximum."),
});
export const profileSchema = z.object({
  telephone: z.string().trim().max(32, "32 caractères maximum."),
});
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
