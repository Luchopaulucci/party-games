import { describe, expect, it } from "vitest";
import {
  clampImpostorCount,
  impostorEngine,
  maxImpostorCount,
  scoreImpostorRound,
  tallyVotes,
} from "@/shared/games/impostor/logic";
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
      accusedId: null,
    });
    expect(scores.a).toBeGreaterThanOrEqual(3);
    expect(scores.d ?? 0).toBe(0);
  });

  it("puntos si el impostor zafa", () => {
    const scores = scoreImpostorRound({
      impostorIds: ["d"],
      votes: { a: "b", b: "a", c: "a", d: "a" },
      wordGuess: null,
      accusedId: null,
    });
    expect(scores.d).toBe(4);
  });

  it("el impostor no recibe la palabra; nadie recibe el rol ajeno", () => {
    const state = impostorEngine.createState(ctx);
    const imp = JSON.stringify(impostorEngine.privateView(state, "d"));
    const crew = JSON.stringify(impostorEngine.privateView(state, "a"));
    const pub = JSON.stringify(impostorEngine.publicView(state));
    expect(imp).not.toContain("supercalifragilistico");
    expect(imp).toContain("impostor");
    expect(crew).toContain("supercalifragilistico");
    expect(JSON.parse(crew).isImpostor).toBe(false);
    expect(pub).not.toContain("supercalifragilistico");
    expect(pub).not.toContain('"d"');
    expect(crew).not.toContain("impostorIds");
    expect(imp).not.toContain("impostorIds");
    expect(pub).not.toContain("impostorIds");
    expect(JSON.parse(imp).role).toBe("impostor");
    expect(JSON.parse(crew).role).toBe("crew");
  });

  it("siempre hay menos impostores que el resto", () => {
    expect(maxImpostorCount(3)).toBe(1);
    expect(maxImpostorCount(4)).toBe(1);
    expect(maxImpostorCount(5)).toBe(2);
    expect(clampImpostorCount(99, 5)).toBe(2);
    expect(clampImpostorCount(2, 4)).toBe(1);
    const flooded = impostorEngine.createState({
      playerIds: ["a", "b", "c", "d", "e"],
      rng: mulberry32(1),
      options: { impostorCount: 8 },
    });
    expect(flooded.impostorIds.length).toBeLessThan(5 - flooded.impostorIds.length);
    expect(flooded.impostorIds.length).toBe(2);
  });

  it("un payload podrido no crashea ni filtra roles", () => {
    let state = impostorEngine.createState(ctx);
    state = impostorEngine.reduce(state, { type: "vote", payload: null }, "a", ctx);
    state = impostorEngine.reduce(state, { type: "ready", payload: { nope: 1 } }, "a", ctx);
    state = impostorEngine.reduce(state, { type: "accuse", payload: "x" }, "a", ctx);
    state = impostorEngine.reduce(state, { type: "guess-word", payload: 3 }, "d", ctx);
    expect(impostorEngine.isFinished(state)).toBe(false);
    expect((impostorEngine.publicView(state) as { word?: string }).word).toBeUndefined();
    expect((impostorEngine.publicView(state) as { impostorIds?: string[] }).impostorIds).toBeUndefined();
    expect((impostorEngine.privateView(state, "b") as { isImpostor: boolean }).isImpostor).toBe(false);
  });

  it("cuando todos dan OK arranca el debate", () => {
    let state = impostorEngine.createState(ctx);
    expect(state.phase).toBe("role");
    for (const id of ctx.playerIds) {
      state = impostorEngine.reduce(state, { type: "ready" }, id, ctx);
    }
    expect(state.phase).toBe("discuss");
  });

  it("el reloj de charla sale del Timer de ronda del lobby", () => {
    const state = impostorEngine.createState({ ...ctx, options: { timerSec: 45 } });
    expect(state.discussSec).toBe(45);
  });
});
