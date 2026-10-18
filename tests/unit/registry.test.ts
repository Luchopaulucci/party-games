import { describe, expect, it } from "vitest";
import { GAME_CATALOG, getEngine, implementedGames } from "@/shared/games/registry";

const ALL = [
  "bombita",
  "closest",
  "completa-frase",
  "dibuja",
  "espia",
  "impostor",
  "mas-o-menos",
  "mentira",
  "mimica",
  "onda",
  "reflejos",
  "subasta",
  "taboo",
  "tutti",
  "votacion",
  "whoami",
  "yo-nunca",
];

describe("game registry", () => {
  it("tiene 17 juegos implementados y cero stubs", () => {
    expect(implementedGames().map((g) => g.id).sort()).toEqual(ALL);
    expect(GAME_CATALOG.filter((g) => !g.implemented)).toHaveLength(0);
    for (const id of ALL) {
      expect(getEngine(id as "closest")?.id).toBe(id);
    }
  });
});
