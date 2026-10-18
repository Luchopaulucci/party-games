import type { Metadata, Viewport } from "next";
import { Bowlby_One, Inter } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const display = Bowlby_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "La Previa",
  description: "Un celu. Toda la mesa. Juegos de previa en criollo.",
  applicationName: "La Previa",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "La Previa" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${display.variable} ${sans.variable} ${sans.className}`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
