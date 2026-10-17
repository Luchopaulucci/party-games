import { describe, expect, it } from "vitest";
import { PREMISES } from "@/shared/games/closest/catalog";
import { closestEngine, scoreClosestRound } from "@/shared/games/closest/logic";
import { mulberry32 } from "@/shared/rng";

const ctx = {
  playerIds: ["a", "b", "c"],
  rng: mulberry32(7),
  seed: { prompt: "¿Cuánto es 2+2?", trueAnswer: 4, questionId: "t" },
};

describe("closest scoring", () => {
  it("le da 3 al más cercano y 1 al segundo", () => {
    const ranking = scoreClosestRound({ a: 5, b: 10, c: 100 }, 4);
    expect(ranking[0]).toMatchObject({ playerId: "a", points: 3 });
    expect(ranking.find((r) => r.playerId === "b")?.points).toBe(1);
    expect(ranking.find((r) => r.playerId === "c")?.points).toBe(0);
  });

  it("bonifica el número exacto", () => {
    const ranking = scoreClosestRound({ a: 4, b: 8 }, 4);
    expect(ranking[0]).toMatchObject({ playerId: "a", points: 5 });
  });

  it("reparte si hay empate de cercanía", () => {
    const ranking = scoreClosestRound({ a: 3, b: 5 }, 4);
    expect(ranking.every((r) => r.points === 2)).toBe(true);
  });
});

describe("closest engine privacy", () => {
  it("no publica la respuesta ni los palos hasta revelar", () => {
    let state = closestEngine.createState(ctx);
    state = closestEngine.reduce(state, { type: "guess", payload: { value: 7 } }, "a", ctx);
    const pub = closestEngine.publicView(state) as { trueAnswer?: number; ranking?: unknown };
    const privB = closestEngine.privateView(state, "b") as { guess: number | null };
    expect(pub.trueAnswer).toBeUndefined();
    expect(pub.ranking).toBeUndefined();
    expect(JSON.stringify(pub)).not.toContain("4");
    expect(privB.guess).toBeNull();
    expect(JSON.stringify(closestEngine.privateView(state, "b"))).not.toContain("7");
  });

  it("cierra cuando todos mandaron y asigna puntos", () => {
    let state = closestEngine.createState(ctx);
    state = closestEngine.reduce(state, { type: "guess", payload: { value: 4 } }, "a", ctx);
    state = closestEngine.reduce(state, { type: "guess", payload: { value: 9 } }, "b", ctx);
    state = closestEngine.reduce(state, { type: "guess", payload: { value: 1 } }, "c", ctx);
    expect(closestEngine.isFinished(state)).toBe(true);
    expect(closestEngine.scores(state).a).toBe(5);
    expect((closestEngine.publicView(state) as { trueAnswer: number }).trueAnswer).toBe(4);
  });

  it("respeta categorías del mazo de ¿Cuánto es?", () => {
    const state = closestEngine.createState({
      playerIds: ["a", "b"],
      rng: mulberry32(1),
      categories: ["animales"],
      picante: false,
    });
    expect(PREMISES.find((p) => p.id === state.questionId)?.category).toBe("animales");
  });
});
