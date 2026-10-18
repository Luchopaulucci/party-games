export const WAKE_WINDOW_MS = 60_000;

export const WAKE_MESSAGE = "Despertando el servidor…";

export const WAKE_FAIL_MESSAGE =
  "El server de salas no despertó. Probá de nuevo en un rato o revisá NEXT_PUBLIC_SOCKET_URL.";

export function wakeStatus(
  elapsedMs: number,
  windowMs = WAKE_WINDOW_MS,
): { kind: "waking"; message: string } | { kind: "failed"; message: string } {
  if (elapsedMs < windowMs) return { kind: "waking", message: WAKE_MESSAGE };
  return { kind: "failed", message: WAKE_FAIL_MESSAGE };
}
