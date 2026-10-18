"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline opcional */
    });
  }, []);
  return null;
}
