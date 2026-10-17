import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/shared/rng";
import type { GameContext, TestSeed } from "@/shared/types";
import { auctionEngine, scoreAuction } from "@/shared/games/auction/logic";
import { phraseEngine } from "@/shared/games/phrase/logic";
import { lieEngine } from "@/shared/games/lie/logic";
import { drawEngine } from "@/shared/games/draw/logic";
import { reflexEngine } from "@/shared/games/reflex/logic";
import { waveEngine } from "@/shared/games/wave/logic";
import { tabooEngine } from "@/shared/games/taboo/logic";
import { neverEngine } from "@/shared/games/never/logic";
import { scoreStop, stopEngine } from "@/shared/games/stop/logic";
import { bombEngine } from "@/shared/games/bomb/logic";
import { mimicEngine } from "@/shared/games/charades/logic";

const ids = ["a", "b", "c", "d"];
const ctx = (seed: TestSeed = {}): GameContext => ({
  playerIds: ids,
  rng: mulberry32(3),
  seed,
  now: () => 1_000_000,
});

function view<T>(value: unknown): T {
  return value as T;
}

describe("subasta", () => {
  it("sin pasarse gana el más alto que no se pasó", () => {
    const ranking = scoreAuction({ a: 80, b: 95, c: 120 }, 100, "no-pasarse");
    expect(ranking.find((r) => r.playerId === "b")?.points).toBe(3);
    expect(ranking.find((r) => r.playerId === "c")?.points).toBe(0);
  });

  it("no publica el objetivo hasta revelar", () => {
    let state = auctionEngine.createState(ctx({ prompt: "x", trueAnswer: 50 }));
    state = auctionEngine.reduce(state, { type: "bid", payload: { value: 40 } }, "a", ctx());
    const pub = JSON.stringify(auctionEngine.publicView(state));
    expect(pub).not.toContain("50");
    expect(view<{ bid: number | null }>(auctionEngine.privateView(state, "b")).bid).toBeNull();
  });
});

describe("completa-frase", () => {
  it("esconde textos ajenos y no manda el mapa de votos", () => {
    const c = ctx({ prompt: "hola ___" });
    let s = phraseEngine.createState(c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "mundo" } }, "a", c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "fernet" } }, "b", c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "mate" } }, "c", c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "birra" } }, "d", c);
    s = phraseEngine.reduce(s, { type: "vote", payload: { answerId: "a-b" } }, "a", c);
    const pub = JSON.stringify(phraseEngine.publicView(s));
    expect(pub).not.toContain('"votes"');
    expect(view<{ myVote: string | null }>(phraseEngine.privateView(s, "c")).myVote).toBeNull();
    s = phraseEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(JSON.stringify(phraseEngine.publicView(s))).not.toMatch(/"votes":\{/);
  });
});

describe("mentira", () => {
  it("el resto no ve cuál es la mentira", () => {
    const c = ctx({ targetId: "a", answers: ["uno", "dos", "tres"], lieIndex: 2 });
    let s = lieEngine.createState(c);
    s = lieEngine.reduce(s, { type: "write", payload: { statements: ["uno", "dos", "tres"], lieIndex: 2 } }, "a", c);
    expect(view<{ lieIndex: number | null }>(lieEngine.privateView(s, "b")).lieIndex).toBeNull();
    expect(view<{ lieIndex?: number }>(lieEngine.publicView(s)).lieIndex).toBeUndefined();
    s = lieEngine.reduce(s, { type: "vote", payload: { index: 1 } }, "b", c);
    s = lieEngine.reduce(s, { type: "reveal" }, "a", c);
    expect(JSON.stringify(lieEngine.publicView(s))).not.toMatch(/"votes":\{/);
    expect(lieEngine.scores(s).a).toBe(1);
  });
});

describe("dibuja", () => {
  it("solo el dibujante ve la palabra", () => {
    const c = ctx({ word: "mate secreto", targetId: "a" });
    const s = drawEngine.createState(c);
    expect(view<{ word: string | null }>(drawEngine.privateView(s, "a")).word).toBe("mate secreto");
    expect(view<{ word: string | null }>(drawEngine.privateView(s, "b")).word).toBeNull();
    expect(JSON.stringify(drawEngine.publicView(s))).not.toContain("mate secreto");
  });

  it("ignora puntos nulos y colores que no son hex", () => {
    const c = ctx({ word: "mate", targetId: "a" });
    let s = drawEngine.createState(c);
    s = drawEngine.reduce(
      s,
      { type: "stroke", payload: { stroke: { color: "javascript:alert(1)", points: [null, { x: 3, y: 4 }] } } },
      "a",
      c,
    );
    const pub = view<{ strokes: { color: string; points: { x: number; y: number }[] }[] }>(drawEngine.publicView(s));
    expect(pub.strokes).toHaveLength(1);
    expect(pub.strokes[0]!.color).toBe("#1e1446");
    expect(pub.strokes[0]!.points).toEqual([{ x: 3, y: 4 }]);
    const again = drawEngine.reduce(
      s,
      { type: "stroke", payload: { stroke: { color: "#C42B54", points: [null] } } },
      "a",
      c,
    );
    expect(view<{ strokes: unknown[] }>(drawEngine.publicView(again)).strokes).toHaveLength(1);
  });
});

describe("reflejos", () => {
  it("no publica el índice correcto hasta terminar", () => {
    const c = ctx({ prompt: "x", options: ["a", "b", "c", "d"], correct: 2 });
    let s = reflexEngine.createState(c);
    expect(view<{ correct?: number }>(reflexEngine.publicView(s)).correct).toBeUndefined();
    s = reflexEngine.reduce(s, { type: "tap", payload: { index: 2 } }, "b", c);
    expect(reflexEngine.scores(s).b).toBe(3);
  });
});

describe("onda", () => {
  it("el target solo lo ve el psíquico", () => {
    const c = ctx({ targetId: "a", target: 77, poles: ["Frío", "Caliente"] });
    const s = waveEngine.createState(c);
    expect(view<{ target: number | null }>(waveEngine.privateView(s, "a")).target).toBe(77);
    expect(view<{ target: number | null }>(waveEngine.privateView(s, "b")).target).toBeNull();
    expect(JSON.stringify(waveEngine.publicView(s))).not.toContain("77");
  });
});

describe("taboo y mímica", () => {
  it("esconden la palabra al resto", () => {
    const taboo = tabooEngine.createState(ctx({ word: "secreto-taboo", targetId: "a", forbidden: ["no", "digas", "esto", "che"] }));
    expect(view<{ word: string | null }>(tabooEngine.privateView(taboo, "b")).word).toBeNull();
    expect(JSON.stringify(tabooEngine.publicView(taboo))).not.toContain("secreto-taboo");
    const mimic = mimicEngine.createState(ctx({ word: "secreto-mima", targetId: "a" }));
    expect(view<{ word: string | null }>(mimicEngine.privateView(mimic, "b")).word).toBeNull();
    expect(JSON.stringify(mimicEngine.publicView(mimic))).not.toContain("secreto-mima");
  });
});

describe("yo nunca", () => {
  it("solo totales, nunca quién dijo sí", () => {
    const c = ctx({ prompt: "yo nunca mentí" });
    let s = neverEngine.createState(c);
    s = neverEngine.reduce(s, { type: "choose", payload: { value: "si" } }, "a", c);
    s = neverEngine.reduce(s, { type: "choose", payload: { value: "no" } }, "b", c);
    s = neverEngine.reduce(s, { type: "choose", payload: { value: "si" } }, "c", c);
    s = neverEngine.reduce(s, { type: "choose", payload: { value: "no" } }, "d", c);
    const pub = JSON.stringify(neverEngine.publicView(s));
    expect(pub).not.toContain('"choices"');
    expect(view<{ yesCount?: number }>(neverEngine.publicView(s)).yesCount).toBe(2);
    expect(view<{ myChoice: string | null }>(neverEngine.privateView(s, "b")).myChoice).toBe("no");
  });
});

describe("tutti y bombita", () => {
  it("tutti esconde respuestas ajenas y puntúa únicas", () => {
    const c = ctx({ letter: "M" });
    let s = stopEngine.createState(c);
    s = stopEngine.reduce(s, { type: "write", payload: { answers: { nombre: "Meli", ciudad: "Mendoza", comida: "milanesa", famoso: "Messi", cosa: "mate" } } }, "a", c);
    expect(JSON.stringify(stopEngine.publicView(s))).not.toContain("Mendoza");
    const pts = scoreStop(
      {
        a: { nombre: "Meli", ciudad: "Mendoza", comida: "x", famoso: "y", cosa: "z" },
        b: { nombre: "Meli", ciudad: "Morón", comida: "x", famoso: "w", cosa: "q" },
      },
      ["nombre", "ciudad"],
    );
    expect(pts.a).toBe(3);
    expect(pts.b).toBe(3);
  });

  it("bombita no publica el explodeAt", () => {
    const s = bombEngine.createState(ctx({ targetId: "a", min: 50 }));
    const dumped = JSON.stringify({ pub: bombEngine.publicView(s), priv: bombEngine.privateView(s, "b") });
    expect(dumped).not.toContain("explodeAt");
    expect(dumped).not.toContain(String(s.explodeAt));
  });
});
