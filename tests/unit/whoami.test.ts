import { describe, expect, it } from "vitest";
import { guessMatches, whoamiEngine } from "@/shared/games/whoami/logic";
import { mulberry32 } from "@/shared/rng";

const ctx = {
  playerIds: ["t", "p2", "p3"],
  rng: mulberry32(1),
  seed: { character: "Zlatan Testosterone", hint: "ego", targetId: "t" },
};

describe("whoami", () => {
  it("acepta el apellido como acierto", () => {
    expect(guessMatches("testosterone", "Zlatan Testosterone")).toBe(true);
    expect(guessMatches("messi", "Zlatan Testosterone")).toBe(false);
  });

  it("el target no ve el personaje y los otros sí", () => {
    const state = whoamiEngine.createState(ctx);
    const target = whoamiEngine.privateView(state, "t") as { character: string | null; isTarget: boolean };
    const other = whoamiEngine.privateView(state, "p2") as { character: string | null };
    const pub = JSON.stringify(whoamiEngine.publicView(state));
    expect(target.isTarget).toBe(true);
    expect(target.character).toBeNull();
    expect(other.character).toBe("Zlatan Testosterone");
    expect(pub).not.toContain("Zlatan");
    expect(JSON.stringify(target)).not.toContain("Zlatan");
  });

  it("cierra con 3 puntos si adivina", () => {
    let state = whoamiEngine.createState(ctx);
    state = whoamiEngine.reduce(state, { type: "guess", payload: { text: "Zlatan Testosterone" } }, "t", ctx);
    expect(whoamiEngine.isFinished(state)).toBe(true);
    expect(whoamiEngine.scores(state)).toEqual({ t: 3 });
    expect((whoamiEngine.publicView(state) as { character: string }).character).toBe("Zlatan Testosterone");
  });

  it("no deja que el target conteste sus propias preguntas", () => {
    let state = whoamiEngine.createState(ctx);
    state = whoamiEngine.reduce(state, { type: "ask", payload: { text: "¿Soy futbolista?" } }, "t", ctx);
    const blocked = whoamiEngine.reduce(state, { type: "answer", payload: { questionId: state.questions[0]?.id, value: "si" } }, "t", ctx);
    expect(blocked.questions[0]?.answer).toBeNull();
    const ok = whoamiEngine.reduce(state, { type: "answer", payload: { questionId: state.questions[0]?.id, value: "si" } }, "p2", ctx);
    expect(ok.questions[0]?.answer).toBe("si");
  });
});
