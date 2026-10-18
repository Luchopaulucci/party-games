import type { Metadata, Viewport } from "next";
import { Source_Code_Pro } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const mono = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mono",
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
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className={mono.variable}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
