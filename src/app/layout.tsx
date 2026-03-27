import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Observatoire National",
  description:
    "Tableau de bord open-data des statistiques nationales françaises — économie, santé, social, investissement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-dsfr-grey-light text-gray-900 antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
              <Header />
              <main className="flex-1 p-6 overflow-auto">{children}</main>
            </div>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
