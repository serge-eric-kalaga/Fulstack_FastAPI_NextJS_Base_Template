import { AuthForm } from "@/features/auth/auth-form";
export const metadata = { title: "Créer un compte · Fullstack" };
export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
