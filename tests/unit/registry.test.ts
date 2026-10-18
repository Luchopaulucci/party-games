import { describe, expect, it } from "vitest";
import { GAME_CATALOG, getEngine, implementedGames } from "@/shared/games/registry";
import { GAME_IDS, isPlayableGameId } from "@/shared/types";

const ALL = [
  "cadena",
  "closest",
  "completa-frase",
  "emoji",
  "espia",
  "impostor",
  "mas-o-menos",
  "mentira",
  "preferis",
  "reflejos",
  "trivia",
  "tutti",
  "votacion",
  "whoami",
  "yo-nunca",
];

const REMOVED = [
  "bombita",
  "dibuja",
  "mimica",
  "onda",
  "subasta",
  "taboo",
  "telefono",
  "verdad-reto",
];

describe("game registry", () => {
  it("tiene 15 juegos implementados y cero stubs", () => {
    expect(GAME_IDS.slice().sort()).toEqual(ALL);
    expect(implementedGames().map((g) => g.id).sort()).toEqual(ALL);
    expect(GAME_CATALOG.filter((g) => !g.implemented)).toHaveLength(0);
    for (const id of ALL) {
      expect(getEngine(id as "closest")?.id).toBe(id);
    }
  });

  it("no acepta los 8 ids borrados", () => {
    for (const id of REMOVED) {
      expect(isPlayableGameId(id)).toBe(false);
      expect(GAME_CATALOG.some((g) => g.id === id)).toBe(false);
    }
  });
});
