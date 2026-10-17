import type { GameId } from "../types";

export const NIGHT_PLAYLIST: GameId[] = [
  "closest",
  "preferis",
  "trivia",
  "verdad-reto",
  "cadena",
  "emoji",
  "votacion",
  "yo-nunca",
];

export function orderNightQueue(start: GameId): GameId[] {
  return [start, ...NIGHT_PLAYLIST.filter((id) => id !== start)];
}
