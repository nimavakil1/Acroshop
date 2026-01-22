import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "ACROPAQ - Büro und Homeoffice-Bedarf",
    template: "%s | ACROPAQ",
  },
  description: "Büro und Homeoffice-Bedarf in bester Qualität. Seit 2001 im Herzen Europas zuhause.",
  keywords: ["Bürobedarf", "Laminiergeräte", "Geldkassetten", "Büroorganisation", "B2B", "ACROPAQ"],
  openGraph: {
    title: "ACROPAQ",
    description: "Büro und Homeoffice-Bedarf in bester Qualität",
    type: "website",
    locale: "de_DE",
    siteName: "ACROPAQ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
