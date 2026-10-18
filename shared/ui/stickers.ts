import type { GameId } from "@/shared/types";

export const STICKER_FILLS = {
  blue: "#4da2ff",
  mint: "#55db9c",
  lavender: "#e9ccff",
  ember: "#fb4903",
  sun: "#ffd731",
  violet: "#5c4ade",
} as const;

export type StickerName = keyof typeof STICKER_FILLS;

export const WHITE_INK_FILLS = new Set<string>([STICKER_FILLS.violet, "#000000"]);

export function stickerInk(fill: string): "#000000" | "#ffffff" {
  return WHITE_INK_FILLS.has(fill.toLowerCase()) ? "#ffffff" : "#000000";
}

export const GAME_STICKER: Record<GameId, StickerName> = {
  closest: "blue",
  whoami: "mint",
  impostor: "ember",
  "mas-o-menos": "sun",
  espia: "violet",
  votacion: "lavender",
  "completa-frase": "blue",
  mentira: "ember",
  reflejos: "mint",
  "yo-nunca": "sun",
  tutti: "lavender",
  trivia: "violet",
  cadena: "blue",
  emoji: "mint",
  preferis: "ember",
};

export function gameSticker(id: GameId): { fill: string; ink: "#000000" | "#ffffff"; name: StickerName } {
  const name = GAME_STICKER[id];
  const fill = STICKER_FILLS[name];
  return { fill, ink: stickerInk(fill), name };
}

export function titleClass(name: string): "title-long" | undefined {
  return name.length > 14 || /[¿?]/.test(name) ? "title-long" : undefined;
}
