"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { configuredSocketUrl, resolveOnlineAccess } from "@/lib/online";
import { shareOrigin } from "@/lib/room-url";

export function isNativeRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

/** Primer paint idéntico en server y cliente. El valor real se calcula en useEffect. */
export function initialOnlineAccess() {
  return resolveOnlineAccess({
    socketUrl: configuredSocketUrl(),
    native: false,
    online: true,
  });
}

export function readOnlineAccess() {
  return resolveOnlineAccess({
    socketUrl: configuredSocketUrl(),
    native: isNativeRuntime(),
    online: typeof navigator === "undefined" ? true : navigator.onLine,
  });
}

export function useOnlineAccess() {
  const [access, setAccess] = useState(initialOnlineAccess);

  useEffect(() => {
    const update = () => setAccess(readOnlineAccess());
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
