import { describe, expect, it } from "vitest";
import { localGameError } from "@/shared/games/browse";
import {
  advancePass,
  createLocalMatch,
  localAction,
  localView,
  resetLocalToLobby,
  startLocalGame,
} from "@/lib/local-match";

describe("salida local sin fantasmas", () => {
  it("jugar → salir al lobby → Impostor no arrastra jugadores de la partida anterior", () => {
    const first = createLocalMatch(["Lucho", "Meli", "Coco", "Fantasma"]);
    const playing = startLocalGame(first, "closest", {
      options: { timerSec: 0, rounds: 1 },
    });
    expect(typeof playing).not.toBe("string");
    if (typeof playing === "string") return;
    expect(playing.players).toHaveLength(4);
    const afterGuess = localAction(playing, playing.players[0]!.id, { type: "guess", payload: { value: 10 } });
    expect(afterGuess.players).toHaveLength(4);

    const lobby = resetLocalToLobby([
      { name: "Lucho", color: "#C42B54" },
      { name: "Meli", color: "#1D4ED8" },
      { name: "Coco", color: "#A16207" },
    ]);
    expect(lobby.gameId).toBeNull();
    expect(lobby.gameState).toBeNull();
    expect(lobby.status).toBe("lobby");
    expect(lobby.players.map((p) => p.name)).toEqual(["Lucho", "Meli", "Coco"]);
    expect(lobby.players.every((p) => p.score === 0)).toBe(true);

    const impostor = startLocalGame(lobby, "impostor");
    expect(typeof impostor).not.toBe("string");
    if (typeof impostor === "string") return;
    expect(impostor.gameId).toBe("impostor");
    expect(impostor.players).toHaveLength(3);
    expect(impostor.players.map((p) => p.name).sort()).toEqual(["Coco", "Lucho", "Meli"]);
    expect(impostor.players.every((p) => p.score === 0)).toBe(true);
    expect(new Set(impostor.players.map((p) => p.id)).size).toBe(3);
    expect(impostor.players.some((p) => p.name === "Fantasma")).toBe(false);
  });

  it("en Mentira el write válido pasa el celu (sin un segundo botón)", () => {
    const match = createLocalMatch(["Lucho", "Meli", "Coco"]);
    const playing = startLocalGame(match, "mentira");
    expect(typeof playing).not.toBe("string");
    if (typeof playing === "string") return;
    const storyteller = (localView(playing, playing.players[0]!.id).public as { storytellerId: string }).storytellerId;
    const stuck = localAction(playing, storyteller, {
      type: "write",
      payload: { statements: ["corto"], lieIndex: 0 },
    });
    expect(advancePass(playing, stuck, "write").passIndex).toBe(playing.passIndex);
    const applied = localAction(playing, storyteller, {
      type: "write",
      payload: { statements: ["verdad una", "verdad dos", "el verso"], lieIndex: 2 },
    });
    const next = advancePass(playing, applied, "write");
    expect(next.passIndex).not.toBe(playing.passIndex);
  });

  it("tutti y preferís no arrancan en local", () => {
    const match = createLocalMatch(["Lucho", "Meli", "Coco"]);
    expect(startLocalGame(match, "tutti")).toBe(localGameError("tutti"));
    expect(startLocalGame(match, "preferis")).toBe(localGameError("preferis"));
  });
});
