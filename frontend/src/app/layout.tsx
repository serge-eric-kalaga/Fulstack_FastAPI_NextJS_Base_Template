import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "Fullstack Template",
  description: "Template fullstack FastAPI et Next.js avec authentification et profil utilisateur, à personnaliser pour démarrer vos projets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <a className="skip-link" href="#page-content">
            Aller au contenu
          </a>
          <Navbar />
          <div id="page-content" tabIndex={-1}>
            {children}
          </div>
          <footer className="site-footer page-shell">
            <span>fullstack.</span>
            <p>Une base réutilisable pour vos projets.</p>
            <span className="footer-stack">FASTAPI + NEXT.JS</span>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
