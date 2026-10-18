export function parseRoomCode(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const code = raw.trim();
  if (!code || code.toLowerCase() === "nueva") return undefined;
  return code.toUpperCase();
}

export function roomPagePath(input: {
  code?: string;
  name?: string;
  game?: string | null;
  resume?: boolean;
} = {}): string {
  const q = new URLSearchParams();
  const code = parseRoomCode(input.code);
  if (code) q.set("code", code);
  if (input.name?.trim()) q.set("name", input.name.trim());
  if (input.game) q.set("game", input.game);
  if (input.resume) q.set("resume", "1");
  const qs = q.toString();
  return qs ? `/online/sala?${qs}` : "/online/sala";
}

export function roomSharePath(code: string): string {
  return `/online?code=${code.toUpperCase()}`;
}

export function roomShareUrl(code: string, origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${roomSharePath(code)}`;
}

export function shareOrigin(input: {
  webOrigin?: string;
  windowOrigin?: string;
  native?: boolean;
} = {}): string {
  const configured = (input.webOrigin ?? process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "").trim().replace(/\/$/, "");
  if (configured) return configured;
  if (input.native) return "";
  return (input.windowOrigin ?? "").replace(/\/$/, "");
}

export function legacySalaRedirect(
  code: string,
  search: Record<string, string | undefined> = {},
): string {
  const next: { code?: string; name?: string; game?: string | null; resume?: boolean } = {
    name: search.name,
    game: search.game,
    resume: search.resume === "1",
  };
  const parsed = parseRoomCode(code);
  if (parsed) next.code = parsed;
  else if (search.code) next.code = search.code;
  return roomPagePath(next);
}
