export const WAKE_WINDOW_MS = 60_000;

export const WAKE_MESSAGE = "Despertando el servidor…";

export const WAKE_FAIL_MESSAGE =
  "El server de salas no despertó. Probá de nuevo o revisá NEXT_PUBLIC_SOCKET_URL.";

export const ORIGIN_FAIL_MESSAGE =
  "El server rechazó este origen (CORS). No está dormido: el socket no acepta esta URL. Tocá Reintentar. En local con npm start el mismo origen y localhost/LAN tienen que entrar solos.";

export function isOriginConnectError(err: { message?: string } | undefined): boolean {
  const text = (err?.message ?? "").toLowerCase();
  if (!text) return false;
  if (text.includes("origen no permitido")) return true;
  if (text.includes("not allowed by cors")) return true;
  if (text.includes("blocked by cors")) return true;
  return text.includes("cors") && (text.includes("origin") || text.includes("origen"));
}

export function wakeStatus(
  elapsedMs: number,
  windowMs = WAKE_WINDOW_MS,
): { kind: "waking"; message: string } | { kind: "failed"; message: string } {
  if (elapsedMs < windowMs) return { kind: "waking", message: WAKE_MESSAGE };
  return { kind: "failed", message: WAKE_FAIL_MESSAGE };
}

export function connectFailureStatus(
  elapsedMs: number,
  err?: { message?: string },
  windowMs = WAKE_WINDOW_MS,
): { kind: "waking" | "failed" | "origin"; message: string } {
  if (isOriginConnectError(err)) return { kind: "origin", message: ORIGIN_FAIL_MESSAGE };
  return wakeStatus(elapsedMs, windowMs);
}
