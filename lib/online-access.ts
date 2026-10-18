"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { configuredSocketUrl, resolveOnlineAccess } from "@/lib/online";
import { shareOrigin } from "@/lib/room-url";

export function isNativeRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

export function useOnlineAccess() {
  const [access, setAccess] = useState(() =>
    resolveOnlineAccess({
      socketUrl: configuredSocketUrl(),
      native: typeof window === "undefined" ? false : isNativeRuntime(),
      online: typeof navigator === "undefined" ? true : navigator.onLine,
    }),
  );

  useEffect(() => {
    const update = () =>
      setAccess(
        resolveOnlineAccess({
          socketUrl: configuredSocketUrl(),
          native: isNativeRuntime(),
          online: navigator.onLine,
        }),
      );
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return access;
}

export function currentShareOrigin(): string {
  return shareOrigin({
    native: isNativeRuntime(),
    windowOrigin: typeof window === "undefined" ? "" : window.location.origin,
  });
}
