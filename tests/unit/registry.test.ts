import { describe, expect, it } from "vitest";
import { GAME_CATALOG, getEngine, implementedGames } from "@/shared/games/registry";

describe("game registry", () => {
  it("tiene los 3 MVP y 8 stubs", () => {
    expect(implementedGames().map((g) => g.id).sort()).toEqual(["closest", "impostor", "whoami"]);
    expect(GAME_CATALOG.filter((g) => !g.implemented)).toHaveLength(8);
    expect(getEngine("mas-o-menos")).toBeUndefined();
    expect(getEngine("closest")?.id).toBe("closest");
  });
});
