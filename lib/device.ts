"use client";

import { useEffect, useState } from "react";

export type DeviceKind = "phone" | "tablet" | "desktop";

export function detectDevice(width = typeof window === "undefined" ? 390 : window.innerWidth): DeviceKind {
  if (width < 768) return "phone";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function deviceCopy(kind: DeviceKind) {
  if (kind === "tablet") {
    return {
      kicker: "Una tablet. Toda la mesa.",
      headline: "Juegos para la tablet.",
      deviceWord: "tablet",
    };
  }
  if (kind === "desktop") {
    return {
      kicker: "Una compu. Toda la mesa.",
      headline: "Juegos para la compu.",
      deviceWord: "compu",
    };
  }
  return {
    kicker: "Un celu. Toda la mesa.",
    headline: "Juegos para el celu.",
    deviceWord: "celu",
  };
}

export function useDeviceKind(): DeviceKind {
  const [kind, setKind] = useState<DeviceKind>("phone");

  useEffect(() => {
    const update = () => setKind(detectDevice(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return kind;
}
