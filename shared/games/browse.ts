import type { GameId } from "../types";
import { GAME_CATALOG, getGameMeta } from "./registry";

export type PlayMode = "local" | "online";
export type GameGroupId = "hielo" | "numeros" | "roles" | "palabras";

export const GAME_GROUPS: { id: GameGroupId; name: string; blurb: string }[] = [
  { id: "hielo", name: "Para romper el hielo", blurb: "Para cuando todavía nadie se animó al segundo fernet." },
  { id: "numeros", name: "Adivinanzas y números", blurb: "Palos, trivia y reflejos. El que se va al pasto invita." },
  { id: "roles", name: "Mentiras y roles", blurb: "Hay que chamuyar. O pescar al que chamuya." },
  { id: "palabras", name: "Palabras", blurb: "Escribí rápido. Pensá después." },
];

const GROUP_BY_ID: Record<GameId, GameGroupId> = {
  closest: "numeros",
  whoami: "roles",
  impostor: "roles",
  "mas-o-menos": "numeros",
  espia: "roles",
  votacion: "hielo",
  "completa-frase": "palabras",
  mentira: "roles",
  reflejos: "numeros",
  "yo-nunca": "hielo",
  tutti: "palabras",
  trivia: "numeros",
  cadena: "palabras",
  emoji: "numeros",
  preferis: "hielo",
};

const MODES_BY_ID: Record<GameId, PlayMode[]> = {
  closest: ["local", "online"],
  whoami: ["local", "online"],
  impostor: ["local", "online"],
  "mas-o-menos": ["local", "online"],
  espia: ["local", "online"],
  votacion: ["local", "online"],
  "completa-frase": ["local", "online"],
  mentira: ["local", "online"],
  reflejos: ["local", "online"],
  "yo-nunca": ["local"],
  tutti: ["online"],
  trivia: ["local", "online"],
  cadena: ["local", "online"],
  emoji: ["local", "online"],
  preferis: ["online"],
};

export function groupFor(id: GameId): GameGroupId {
  return GROUP_BY_ID[id];
}

export function modesFor(id: GameId): PlayMode[] {
  return MODES_BY_ID[id];
}

export function supportsMode(id: GameId, mode: PlayMode): boolean {
  return modesFor(id).includes(mode);
}

export const ONLINE_MODE_ERROR = "Ese juego es solo pasándose el celu.";
export const LOCAL_MODE_ERROR = "Ese juego es solo en red.";

export function onlineGameError(id: GameId): string | null {
  return supportsMode(id, "online") ? null : ONLINE_MODE_ERROR;
}

export function localGameError(id: GameId): string | null {
  return supportsMode(id, "local") ? null : LOCAL_MODE_ERROR;
}

export function groupedCatalog() {
  return GAME_GROUPS.map((group) => ({
    ...group,
    games: GAME_CATALOG.filter((game) => groupFor(game.id) === group.id),
  }));
}

export function parseGameId(raw: string | null | undefined): GameId | null {
  if (!raw) return null;
  return getGameMeta(raw as GameId) ? (raw as GameId) : null;
}
