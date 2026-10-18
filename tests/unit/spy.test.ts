import { describe, expect, it } from "vitest";
import { spyEngine } from "@/shared/games/spy/logic";
import { mulberry32 } from "@/shared/rng";

const location = "Hangar Secreto de Ezeiza 77";
const ctx = {
  playerIds: ["a", "b", "c", "d"],
  rng: mulberry32(4),
  seed: { location, spyIds: ["d"] },
};

describe("espía", () => {
  it("el espía no ve el lugar; el civil no ve el rol de espía", () => {
    const state = spyEngine.createState(ctx);
    const spy = spyEngine.privateView(state, "d") as { role: string; location: string | null };
    const civil = spyEngine.privateView(state, "a") as { role: string; location: string | null };
    const pub = JSON.stringify(spyEngine.publicView(state));
    expect(spy.role).toBe("espia");
    expect(spy.location).toBeNull();
    expect(JSON.stringify(spy)).not.toContain(location);
    expect(civil.role).toBe("civil");
    expect(civil.location).toBe(location);
    expect(JSON.stringify(civil)).not.toContain("espia");
    expect(pub).not.toContain(location);
    expect(pub).not.toContain("espia");
    expect(pub).not.toContain('"d"');
  });

  it("al pescar al espía suman los civiles", () => {
    let state = spyEngine.createState(ctx);
    state = spyEngine.reduce(state, { type: "open-vote" }, "a", ctx);
    state = spyEngine.reduce(state, { type: "vote", payload: { targetId: "d" } }, "a", ctx);
    state = spyEngine.reduce(state, { type: "vote", payload: { targetId: "d" } }, "b", ctx);
    state = spyEngine.reduce(state, { type: "vote", payload: { targetId: "d" } }, "c", ctx);
    state = spyEngine.reduce(state, { type: "reveal" }, "a", ctx);
    expect(spyEngine.isFinished(state)).toBe(true);
    expect(spyEngine.scores(state).a).toBeGreaterThanOrEqual(3);
    expect(spyEngine.scores(state).d ?? 0).toBe(0);
  });
});
