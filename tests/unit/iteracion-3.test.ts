import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/shared/rng";
import type { GameContext, TestSeed } from "@/shared/types";
import { dareEngine } from "@/shared/games/dare/logic";
import { triviaEngine } from "@/shared/games/trivia/logic";
import { chainEngine } from "@/shared/games/chain/logic";
import { emojiEngine } from "@/shared/games/emoji/logic";
import { phoneEngine } from "@/shared/games/phone/logic";
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

describe("verdad-reto", () => {
  it("la mesa vota cumplió sin mapa de votos", () => {
    const c = ctx({ targetId: "a", prompt: "Contá un secreto boludo" });
    let s = dareEngine.createState(c);
    s = dareEngine.reduce(s, { type: "pick", payload: { choice: "verdad" } }, "a", c);
    expect(view<{ card: { text: string } | null }>(dareEngine.publicView(s)).card?.text).toContain("secreto");
    s = dareEngine.reduce(s, { type: "vote", payload: { value: "cumplio" } }, "b", c);
    s = dareEngine.reduce(s, { type: "vote", payload: { value: "cumplio" } }, "c", c);
    expect(JSON.stringify(dareEngine.publicView(s))).not.toMatch(/"votes":\{/);
    s = dareEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(dareEngine.scores(s).a).toBe(2);
  });
});

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
  it("no publica la cadena completa hasta el cierre", () => {
    const c = ctx({ word: "mate" });
    let s = chainEngine.createState(c);
    s = chainEngine.reduce(s, { type: "word", payload: { text: "yerba" } }, "a", c);
    expect(JSON.stringify(chainEngine.publicView(s))).not.toContain("chain");
    expect(view<{ lastWord: string }>(chainEngine.publicView(s)).lastWord).toBe("yerba");
    s = chainEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(view<{ chain?: { text: string }[] }>(chainEngine.publicView(s)).chain?.map((w) => w.text)).toEqual([
      "mate",
      "yerba",
    ]);
  });
});

describe("emoji", () => {
  it("esconde la respuesta hasta que alguien clava", () => {
    const c = ctx({ prompt: "🦁👑", answer: "el rey leon", hint: "disney" });
    let s = emojiEngine.createState(c);
    expect(JSON.stringify(emojiEngine.publicView(s))).not.toContain("el rey leon");
    s = emojiEngine.reduce(s, { type: "guess", payload: { text: "El Rey León" } }, "c", c);
    expect(emojiEngine.scores(s).c).toBe(3);
  });
});

describe("telefono", () => {
  it("solo el escritor ve el texto anterior", () => {
    const c = ctx({ prompt: "frase secreta de la mesa" });
    let s = phoneEngine.createState(c);
    expect(view<{ previous: string | null }>(phoneEngine.privateView(s, "a")).previous).toBe("frase secreta de la mesa");
    expect(view<{ previous: string | null }>(phoneEngine.privateView(s, "b")).previous).toBeNull();
    expect(JSON.stringify(phoneEngine.publicView(s))).not.toContain("frase secreta de la mesa");
    s = phoneEngine.reduce(s, { type: "write", payload: { text: "version de a" } }, "a", c);
    expect(view<{ previous: string | null }>(phoneEngine.privateView(s, "b")).previous).toBe("version de a");
    expect(view<{ previous: string | null }>(phoneEngine.privateView(s, "c")).previous).toBeNull();
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
