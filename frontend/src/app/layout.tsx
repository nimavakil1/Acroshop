import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Acropaq Shop - Office Supplies & Equipment",
    template: "%s | Acropaq Shop",
  },
  description: "Quality office supplies, equipment, and business essentials. B2B and B2C with EU VAT support.",
  keywords: ["office supplies", "business equipment", "B2B", "EU VAT", "Acropaq"],
  openGraph: {
    title: "Acropaq Shop",
    description: "Quality office supplies and business equipment",
    type: "website",
    locale: "en_EU",
    siteName: "Acropaq Shop",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
