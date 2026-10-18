import { describe, expect, it } from "vitest";
import { emptyRoster, loadRoster, LOCAL_ROSTER_KEY, parseRoster, saveRoster } from "@/lib/local-roster";
import { createLocalMatch, resetLocalToLobby, startLocalGame } from "@/lib/local-match";

function memoryStorage(seed?: Record<string, string>): Storage {
  const data = { ...(seed ?? {}) };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const key of Object.keys(data)) delete data[key];
    },
    getItem(key: string) {
      return data[key] ?? null;
    },
    key(index: number) {
      return Object.keys(data)[index] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

describe("roster local sin defaults", () => {
  it("sin storage la lista arranca vacía", () => {
    expect(emptyRoster()).toEqual([]);
    expect(loadRoster(null)).toEqual([]);
    expect(loadRoster(memoryStorage())).toEqual([]);
    expect(parseRoster(undefined)).toEqual([]);
    expect(parseRoster([{ name: "x" }])).toEqual([]);
  });

  it("otro juego → salir → Impostor local no inventa jugadores", () => {
    const storage = memoryStorage();
    saveRoster(
      [
        { id: "1", name: "Lucho", color: "#C42B54" },
        { id: "2", name: "Meli", color: "#1D4ED8" },
      ],
      storage,
    );

    const closest = startLocalGame(createLocalMatch(loadRoster(storage)), "closest");
    expect(typeof closest).not.toBe("string");
    if (typeof closest === "string") return;
    expect(closest.players.map((p) => p.name)).toEqual(["Lucho", "Meli"]);

    const lobby = resetLocalToLobby(loadRoster(storage));
    expect(lobby.players.map((p) => p.name)).toEqual(["Lucho", "Meli"]);

    const impostor = startLocalGame(lobby, "impostor");
    expect(typeof impostor).not.toBe("string");
    if (typeof impostor === "string") return;
    expect(impostor.players.map((p) => p.name).sort()).toEqual(["Lucho", "Meli"]);
    expect(impostor.players.some((p) => ["Luciano", "Coco", "Wanda", "Fantasma"].includes(p.name))).toBe(false);
    expect(storage.getItem(LOCAL_ROSTER_KEY)).not.toContain("Luciano");
    expect(storage.getItem(LOCAL_ROSTER_KEY)).not.toContain("Wanda");
  });
});
