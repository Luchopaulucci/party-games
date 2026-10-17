import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

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
  themeColor: "#1e1446",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={`${sans.variable} ${display.variable}`}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
