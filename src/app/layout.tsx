import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Cairo, Readex_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: 'swap' });
const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: 'swap' });
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], display: 'swap' });
const readex = Readex_Pro({ variable: "--font-readex", subsets: ["arabic", "latin"], display: 'swap' });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "MaalemPro - Créez des devis professionnels en moins de 60 secondes",
  description: "La solution simple pour les entrepreneurs marocains. Devis PDF, WhatsApp, et gestion clients.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="bg-[#0F172A]">
      <body className={`${inter.variable} ${plusJakarta.variable} ${cairo.variable} ${readex.variable} antialiased bg-[#0F172A] text-slate-200 font-cairo min-h-screen w-full`}>
        <div className="min-h-screen w-full relative">
          <Providers>
            <Navigation />
            <main className="w-full">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
