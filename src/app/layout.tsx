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
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "MaalemPro - Créez des devis professionnels en moins de 60 secondes",
  description: "La solution simple pour les entrepreneurs marocains. Devis PDF, WhatsApp, et gestion clients.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="bg-[#0F172A]">
      <body className={`${inter.variable} ${plusJakarta.variable} ${cairo.variable} ${readex.variable} antialiased bg-[#0F172A] text-slate-200 font-cairo min-h-screen w-full overflow-x-hidden`}>

        {/* DEBUG: runs immediately — open browser console to see which element is on top */}
        <script dangerouslySetInnerHTML={{
          __html: `
          window.addEventListener('load', function() {
            setTimeout(function() {
              var all = document.querySelectorAll('*');
              var fixed = [];
              for (var i = 0; i < all.length; i++) {
                var cs = window.getComputedStyle(all[i]);
                if (cs.position === 'fixed' || cs.position === 'sticky') {
                  fixed.push({
                    tag: all[i].tagName,
                    cls: all[i].className.toString().slice(0, 80),
                    z: cs.zIndex,
                    pe: cs.pointerEvents,
                    bg: cs.backgroundColor,
                    w: all[i].offsetWidth,
                    h: all[i].offsetHeight
                  });
                }
              }
              console.warn('🚨 ALL FIXED/STICKY ELEMENTS:', JSON.stringify(fixed, null, 2));
              var top = document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
              if (top) console.warn('🎯 TOP ELEMENT AT CENTER:', top.tagName, top.className.toString().slice(0,100), window.getComputedStyle(top).pointerEvents);
            }, 2000);
          });
        ` }} />

        {/* Background decoration — pointer-events-none so NOTHING can block clicks */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.4, background: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.05), transparent 70%)', borderRadius: '50%' }} />
        </div>

        {/* App — z-index 10 so it's always above background */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Providers>
            <Navigation />
            <main className="min-h-screen w-full">
              {children}
            </main>
          </Providers>
        </div>

      </body>
    </html>
  );
}
