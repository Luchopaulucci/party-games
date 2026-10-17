import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "La Previa",
  description: "Juegos de celu para cuando el asado está a medio punto.",
  applicationName: "La Previa",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "La Previa" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#140c1c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${outfit.variable} ${fraunces.variable}`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
