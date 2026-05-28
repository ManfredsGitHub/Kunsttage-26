import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "Lions Kunsttage 2026 – Villa Ludwigshöhe",
  description: "Kunstausstellung und Benefizveranstaltung des Lions Club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <Header />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          <footer className="mt-16 py-6 text-center text-sm text-gray-400 border-t print:hidden">
            Lions Club Villa Ludwigshöhe · Kunsttage 2026 · Alle Erlöse für gemeinnützige Zwecke
          </footer>
        </Providers>
      </body>
    </html>
  );
}
