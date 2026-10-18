import { describe, expect, it } from "vitest";
import { GAME_GROUPS, groupedCatalog, modesFor, supportsMode } from "@/shared/games/browse";
import { GAME_IDS } from "@/shared/types";
import { getGameMeta } from "@/shared/games/registry";

describe("catálogo de home", () => {
  it("parte los 15 juegos en las 4 categorías sin repetir", () => {
    expect(GAME_GROUPS.map((g) => g.name)).toEqual([
      "Para romper el hielo",
      "Adivinanzas y números",
      "Mentiras y roles",
      "Palabras",
    ]);
    const grouped = groupedCatalog();
    const ids = grouped.flatMap((g) => g.games.map((game) => game.id)).sort();
    expect(ids).toEqual([...GAME_IDS].sort());
    expect(new Set(ids).size).toBe(15);
  });

  it("cada juego muestra solo sus modos y Votación se llama ¿Quién es más probable?", () => {
    expect(modesFor("yo-nunca")).toEqual(["local"]);
    expect(supportsMode("yo-nunca", "online")).toBe(false);
    expect(modesFor("tutti")).toEqual(["online"]);
    expect(modesFor("preferis")).toEqual(["online"]);
    expect(modesFor("impostor")).toEqual(["local", "online"]);
    expect(getGameMeta("votacion")?.name).toBe("¿Quién es más probable?");
  });
});
