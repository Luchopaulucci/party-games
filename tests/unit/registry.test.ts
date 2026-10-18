import { describe, expect, it } from "vitest";
import { GAME_CATALOG, getEngine, implementedGames } from "@/shared/games/registry";

describe("game registry", () => {
  it("tiene los 6 MVP y 5 stubs", () => {
    expect(implementedGames().map((g) => g.id).sort()).toEqual([
      "closest",
      "espia",
      "impostor",
      "mas-o-menos",
      "votacion",
      "whoami",
    ]);
    expect(GAME_CATALOG.filter((g) => !g.implemented)).toHaveLength(5);
    expect(getEngine("mas-o-menos")?.id).toBe("mas-o-menos");
    expect(getEngine("subasta")).toBeUndefined();
  });
});
