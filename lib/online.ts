export const ONLINE_OFFLINE_MESSAGE =
  "Sin internet no hay salas en red. El modo local (un solo celu) sigue andando.";

export const ONLINE_NO_SERVER_MESSAGE =
  "Esta APK no tiene server de salas. El modo local anda igual, sin WiFi ni datos.";

export function configuredSocketUrl(raw = process.env.NEXT_PUBLIC_SOCKET_URL): string | undefined {
  const value = raw?.trim().replace(/\/$/, "");
  return value || undefined;
}

export function resolveOnlineAccess(input: {
  socketUrl?: string;
  native: boolean;
  online: boolean;
}): { ok: true } | { ok: false; message: string } {
  if (!input.online) return { ok: false, message: ONLINE_OFFLINE_MESSAGE };
  if (input.native && !input.socketUrl) return { ok: false, message: ONLINE_NO_SERVER_MESSAGE };
  return { ok: true };
}
