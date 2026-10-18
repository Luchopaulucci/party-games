import { describe, expect, it } from "vitest";
import { voteEngine, voteTotals } from "@/shared/games/vote/logic";
import { mulberry32 } from "@/shared/rng";

const ctx = {
  playerIds: ["a", "b", "c"],
  rng: mulberry32(5),
  seed: { prompt: "¿Quién come la última empanada?" },
};

describe("votación", () => {
  it("totales sin mapa de votante", () => {
    expect(voteTotals({ a: "b", b: "b", c: "a" })).toEqual([
      { playerId: "b", count: 2 },
      { playerId: "a", count: 1 },
    ]);
  });

  it("ni público ni privado filtran el mapa de votos", () => {
    let state = voteEngine.createState(ctx);
    state = voteEngine.reduce(state, { type: "vote", payload: { targetId: "b" } }, "a", ctx);
    state = voteEngine.reduce(state, { type: "vote", payload: { targetId: "a" } }, "b", ctx);
    const pub = voteEngine.publicView(state) as { votes?: unknown; votedIds: string[] };
    const privA = voteEngine.privateView(state, "a") as { myVote: string | null; votes?: unknown };
    const privB = voteEngine.privateView(state, "b") as { myVote: string | null };
    expect(pub.votes).toBeUndefined();
    expect(privA.votes).toBeUndefined();
    expect(JSON.stringify(pub)).not.toContain('"votes"');
    expect(privA.myVote).toBe("b");
    expect(privB.myVote).toBe("a");
    expect(JSON.stringify(privA)).not.toContain('"a":"b"');
    expect(pub.votedIds).toEqual(["a", "b"]);
  });

  it("un voto podrido no crashea y hay un lector", () => {
    let state = voteEngine.createState(ctx);
    expect(state.readerId).toBeTruthy();
    state = voteEngine.reduce(state, { type: "vote", payload: null }, "a", ctx);
    state = voteEngine.reduce(state, { type: "vote", payload: { targetId: 1 } }, "a", ctx);
    expect(state.phase).toBe("voting");
    expect((voteEngine.publicView(state) as { totals?: unknown }).totals).toBeUndefined();
    expect((voteEngine.privateView(state, "b") as { myVote: string | null }).myVote).toBeNull();
  });

  it("al revelar solo hay totales y +1 al más votado", () => {
    let state = voteEngine.createState(ctx);
    state = voteEngine.reduce(state, { type: "vote", payload: { targetId: "c" } }, "a", ctx);
    state = voteEngine.reduce(state, { type: "vote", payload: { targetId: "c" } }, "b", ctx);
    state = voteEngine.reduce(state, { type: "vote", payload: { targetId: "a" } }, "c", ctx);
    const pub = voteEngine.publicView(state) as { totals?: { playerId: string; count: number }[]; votes?: unknown };
    expect(pub.votes).toBeUndefined();
    expect(pub.totals).toEqual([
      { playerId: "c", count: 2 },
      { playerId: "a", count: 1 },
    ]);
    expect(voteEngine.scores(state)).toEqual({ c: 1 });
    expect(JSON.stringify(pub)).not.toContain('"votes"');
  });
});
