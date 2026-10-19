import { AuthForm } from "@/features/auth/auth-form";
export const metadata = { title: "Connexion · Fullstack" };
export default function LoginPage() {
  return <AuthForm mode="login" />;
}
