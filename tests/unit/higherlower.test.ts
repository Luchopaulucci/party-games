import { describe, expect, it } from "vitest";
import { evaluateGuess, higherLowerEngine } from "@/shared/games/higherlower/logic";
import { mulberry32 } from "@/shared/rng";

const ctx = {
  playerIds: ["a", "b", "c"],
  rng: mulberry32(2),
  seed: { prompt: "¿Cuánto es?", trueAnswer: 42, min: 1, max: 100 },
};

describe("más o menos", () => {
  it("clasifica más, menos, justo y pasado", () => {
    expect(evaluateGuess(10, 42, 1, 100)).toBe("mas");
    expect(evaluateGuess(80, 42, 1, 100)).toBe("menos");
    expect(evaluateGuess(42, 42, 1, 100)).toBe("justo");
    expect(evaluateGuess(1, 42, 1, 100)).toBe("pasado");
    expect(evaluateGuess(100, 42, 1, 100)).toBe("pasado");
  });

  it("no publica el secreto hasta el final", () => {
    let state = higherLowerEngine.createState(ctx);
    state = higherLowerEngine.reduce(state, { type: "guess", payload: { value: 10 } }, "a", ctx);
    const pub = JSON.stringify(higherLowerEngine.publicView(state));
    const priv = JSON.stringify(higherLowerEngine.privateView(state, "b"));
    expect(pub).not.toContain("42");
    expect(priv).not.toContain("42");
    expect((higherLowerEngine.publicView(state) as { secret?: number }).secret).toBeUndefined();
  });

  it("da 3 puntos al que clava", () => {
    let state = higherLowerEngine.createState(ctx);
    state = higherLowerEngine.reduce(state, { type: "guess", payload: { value: 42 } }, "a", ctx);
    expect(higherLowerEngine.isFinished(state)).toBe(true);
    expect(higherLowerEngine.scores(state)).toEqual({ a: 3 });
    expect((higherLowerEngine.publicView(state) as { secret: number }).secret).toBe(42);
  });
});
