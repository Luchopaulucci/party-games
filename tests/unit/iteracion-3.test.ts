import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/shared/rng";
import type { GameContext, TestSeed } from "@/shared/types";
import { triviaEngine } from "@/shared/games/trivia/logic";
import { chainEngine } from "@/shared/games/chain/logic";
import { emojiEngine } from "@/shared/games/emoji/logic";
import { wouldEngine } from "@/shared/games/would/logic";

const ids = ["a", "b", "c", "d"];
const ctx = (seed: TestSeed = {}): GameContext => ({
  playerIds: ids,
  rng: mulberry32(4),
  seed,
  now: () => 1_000_000,
});

function view<T>(value: unknown): T {
  return value as T;
}

describe("trivia", () => {
  it("esconde el índice correcto hasta revelar", () => {
    const c = ctx({ prompt: "2+2", options: ["3", "4", "5", "22"], correct: 1 });
    let s = triviaEngine.createState(c);
    expect(view<{ correct?: number }>(triviaEngine.publicView(s)).correct).toBeUndefined();
    s = triviaEngine.reduce(s, { type: "answer", payload: { index: 1 } }, "a", c);
    s = triviaEngine.reduce(s, { type: "answer", payload: { index: 0 } }, "b", c);
    s = triviaEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(view<{ correct?: number }>(triviaEngine.publicView(s)).correct).toBe(1);
    expect(triviaEngine.scores(s).a).toBe(2);
    expect(triviaEngine.scores(s).b).toBeUndefined();
  });
});

describe("cadena", () => {
  it("no publica la cadena ni la última palabra hasta el cierre", () => {
    const c = ctx({ word: "mate" });
    let s = chainEngine.createState(c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "yerba" } }, "a", c);
    const pub = JSON.stringify(chainEngine.publicView(s));
    expect(pub).not.toContain("chain");
    expect(pub).not.toContain("yerba");
    expect(view<{ lastWord: string | null }>(chainEngine.privateView(s, "b")).lastWord).toBe("yerba");
    expect(view<{ lastWord: string | null }>(chainEngine.privateView(s, "a")).lastWord).toBeNull();
    s = chainEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(view<{ chain?: { text: string }[] }>(chainEngine.publicView(s)).chain?.map((w) => w.text)).toEqual([
      "mate",
      "yerba",
    ]);
  });

  it("rechaza más de dos palabras y no crashea", () => {
    const c = ctx({ word: "mate" });
    let s = chainEngine.createState(c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "una dos tres" } }, "a", c);
    s = chainEngine.reduce(s, { type: "word", payload: null }, "a", c);
    s = chainEngine.reduce(s, { type: "word", payload: 9 }, "a", c);
    expect(s.phase).toBe("turn");
    expect(s.words).toHaveLength(1);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "yerba mate" } }, "a", c);
    expect(s.words.at(-1)?.text).toBe("yerba mate");
  });

  it("cierra a una vuelta y arma la frase", () => {
    const c = ctx({ word: "mate" });
    let s = chainEngine.createState(c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "bombilla" } }, "a", c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "calor" } }, "b", c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "siesta" } }, "c", c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "verano" } }, "d", c);
    expect(chainEngine.isFinished(s)).toBe(true);
    expect(view<{ phrase?: string }>(chainEngine.publicView(s)).phrase).toBe("mate bombilla calor siesta verano");
  });
});

describe("emoji", () => {
  it("esconde la respuesta hasta el final de la ronda", () => {
    const c = ctx({ prompt: "🦁👑", answer: "el rey leon", hint: "disney" });
    let s = emojiEngine.createState(c);
    expect(JSON.stringify(emojiEngine.publicView(s))).not.toContain("el rey leon");
    s = emojiEngine.reduce(s, { type: "pass" }, "a", c);
    s = emojiEngine.reduce(s, { type: "guess", payload: { text: "El Rey León" } }, "c", c);
    expect(emojiEngine.isFinished(s)).toBe(false);
    expect(view<{ answer?: string }>(emojiEngine.publicView(s)).answer).toBeUndefined();
    s = emojiEngine.reduce(s, { type: "pass" }, "b", c);
    s = emojiEngine.reduce(s, { type: "pass" }, "c", c);
    s = emojiEngine.reduce(s, { type: "pass" }, "d", c);
    expect(emojiEngine.isFinished(s)).toBe(true);
    expect(view<{ answer?: string }>(emojiEngine.publicView(s)).answer).toBe("el rey leon");
  });

  it("un pass podrido no crashea ni filtra la respuesta", () => {
    const c = ctx({ prompt: "🦁👑", answer: "el rey leon" });
    let s = emojiEngine.createState(c);
    s = emojiEngine.reduce(s, { type: "pass", payload: { text: null } }, "a", c);
    s = emojiEngine.reduce(s, { type: "guess", payload: 1 }, "b", c);
    expect(JSON.stringify(emojiEngine.publicView(s))).not.toContain("el rey leon");
    expect(emojiEngine.privateView(s, "b")).toEqual({ seen: false });
  });
});

describe("preferis", () => {
  it("solo totales, nunca el mapa de votos", () => {
    const c = ctx({ prompt: "mate", answer: "café" });
    let s = wouldEngine.createState(c);
    s = wouldEngine.reduce(s, { type: "vote", payload: { side: "left" } }, "a", c);
    s = wouldEngine.reduce(s, { type: "vote", payload: { side: "right" } }, "b", c);
    expect(JSON.stringify(wouldEngine.publicView(s))).not.toMatch(/"votes":\{/);
    s = wouldEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(view<{ totals?: { left: number; right: number } }>(wouldEngine.publicView(s)).totals).toEqual({
      left: 1,
      right: 1,
    });
  });
});
