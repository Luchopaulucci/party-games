import { MAX_LOCAL_PLAYERS, nextPlayerColor } from "@/shared/ui/colors";

export const LOCAL_ROSTER_KEY = "previa:local:roster:v1";

export type RosterPlayer = { id: string; name: string; color: string };

export function emptyRoster(): RosterPlayer[] {
  return [];
}

export function parseRoster(raw: unknown): RosterPlayer[] {
  if (!Array.isArray(raw)) return [];
  const out: RosterPlayer[] = [];
  const used: string[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { id?: unknown; name?: unknown; color?: unknown };
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (name.length < 2) continue;
    const id = typeof rec.id === "string" && rec.id.trim() ? rec.id : `p${out.length + 1}`;
    let color = typeof rec.color === "string" ? rec.color : "";
    if (!color || used.includes(color)) color = nextPlayerColor(used);
    used.push(color);
    out.push({ id, name: name.slice(0, 24), color });
    if (out.length >= MAX_LOCAL_PLAYERS) break;
  }
  return out;
}

export function loadRoster(storage?: Storage | null): RosterPlayer[] {
  if (!storage) return emptyRoster();
  try {
    const raw = storage.getItem(LOCAL_ROSTER_KEY);
    if (!raw) return emptyRoster();
    return parseRoster(JSON.parse(raw));
  } catch {
    return emptyRoster();
  }
}

export function saveRoster(players: RosterPlayer[], storage?: Storage | null): void {
  if (!storage) return;
  storage.setItem(LOCAL_ROSTER_KEY, JSON.stringify(parseRoster(players)));
}
