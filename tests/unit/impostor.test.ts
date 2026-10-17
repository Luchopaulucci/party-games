import { describe, expect, it } from "vitest";
import { impostorEngine, scoreImpostorRound, tallyVotes } from "@/shared/games/impostor/logic";
import { mulberry32 } from "@/shared/rng";

const ctx = {
  playerIds: ["a", "b", "c", "d"],
  rng: mulberry32(3),
  seed: { word: "supercalifragilistico", category: "test", impostorIds: ["d"] },
};

describe("impostor", () => {
  it("tally elige líder único o empate nulo", () => {
    expect(tallyVotes({ a: "d", b: "d", c: "a" }).accused).toBe("d");
    expect(tallyVotes({ a: "b", b: "a" }).accused).toBeNull();
  });

  it("puntos si pescan al impostor", () => {
    const scores = scoreImpostorRound({
      impostorIds: ["d"],
      votes: { a: "d", b: "d", c: "d", d: "a" },
      wordGuess: null,
    });
    expect(scores.a).toBeGreaterThanOrEqual(3);
    expect(scores.d ?? 0).toBe(0);
  });

  it("puntos si el impostor zafa", () => {
    const scores = scoreImpostorRound({
      impostorIds: ["d"],
      votes: { a: "b", b: "a", c: "a", d: "a" },
      wordGuess: null,
    });
    expect(scores.d).toBe(4);
  });

  it("el impostor no recibe la palabra; el resto no recibe impostorIds", () => {
    const state = impostorEngine.createState(ctx);
    const imp = JSON.stringify(impostorEngine.privateView(state, "d"));
    const crew = JSON.stringify(impostorEngine.privateView(state, "a"));
    const pub = JSON.stringify(impostorEngine.publicView(state));
    expect(imp).not.toContain("supercalifragilistico");
    expect(imp).toContain("impostor");
    expect(crew).toContain("supercalifragilistico");
    expect(pub).not.toContain("supercalifragilistico");
    expect(pub).not.toContain('"d"');
    expect(crew).not.toContain("impostorIds");
  });
});
