import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Previa",
    short_name: "La Previa",
    description: "Juegos de celu para la juntada. Online o pasate el teléfono.",
    start_url: "/",
    display: "standalone",
    background_color: "#140c33",
    theme_color: "#1e1446",
    lang: "es-AR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
