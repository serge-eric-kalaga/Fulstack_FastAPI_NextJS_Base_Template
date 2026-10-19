import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer, SkipLink, PageTitle } from "@/components/layout/chrome";
import { Navbar } from "@/components/layout/navbar";

export const metadata: Metadata = {
  description:
    "Template fullstack FastAPI et Next.js avec authentification et profil utilisateur, à personnaliser pour démarrer vos projets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="fr" className="h-full antialiased">
      <body className="min-h-full">
        <Providers>
          <PageTitle />
          <SkipLink />
          <Navbar />
          <div id="page-content" tabIndex={-1}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
