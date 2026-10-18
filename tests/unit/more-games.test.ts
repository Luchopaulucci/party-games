import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/shared/rng";
import type { GameContext, TestSeed } from "@/shared/types";
import { phraseEngine } from "@/shared/games/phrase/logic";
import { lieEngine } from "@/shared/games/lie/logic";
import { reflexEngine } from "@/shared/games/reflex/logic";
import { neverEngine } from "@/shared/games/never/logic";
import { scoreStop, stopEngine } from "@/shared/games/stop/logic";

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

describe("completa-frase", () => {
  it("esconde textos ajenos, presenta de a una y no manda el mapa de votos", () => {
    const c = ctx({ prompt: "hola ___" });
    let s = phraseEngine.createState(c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "mundo" } }, "a", c);
    s = phraseEngine.reduce(s, { type: "write", payload: null }, "b", c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: 4 } }, "b", c);
    expect(s.answers).toHaveLength(1);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "fernet" } }, "b", c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "mate" } }, "c", c);
    s = phraseEngine.reduce(s, { type: "write", payload: { text: "birra" } }, "d", c);
    expect(s.phase).toBe("present");
    expect(s.readerId).toBeTruthy();
    expect(view<{ currentAnswer?: { text: string } }>(phraseEngine.publicView(s)).currentAnswer?.text).toBeTruthy();
    s = phraseEngine.reduce(s, { type: "next" }, "a", c);
    s = phraseEngine.reduce(s, { type: "next" }, "a", c);
    s = phraseEngine.reduce(s, { type: "next" }, "a", c);
    s = phraseEngine.reduce(s, { type: "next" }, "a", c);
    expect(s.phase).toBe("vote");
    s = phraseEngine.reduce(s, { type: "vote", payload: { answerId: "a-b" } }, "a", c);
    const pub = JSON.stringify(phraseEngine.publicView(s));
    expect(pub).not.toContain('"votes"');
    expect(view<{ myVote: string | null }>(phraseEngine.privateView(s, "c")).myVote).toBeNull();
    s = phraseEngine.reduce(s, { type: "vote", payload: { answerId: "a-a" } }, "b", c);
    s = phraseEngine.reduce(s, { type: "vote", payload: { answerId: "a-a" } }, "c", c);
    s = phraseEngine.reduce(s, { type: "vote", payload: { answerId: "a-a" } }, "d", c);
    expect(phraseEngine.isFinished(s)).toBe(true);
    expect(JSON.stringify(phraseEngine.publicView(s))).not.toMatch(/"votes":\{/);
  });
});

describe("mentira", () => {
  it("el resto no ve cuál es la mentira y el último voto revela", () => {
    const c = ctx({ targetId: "a", answers: ["uno", "dos", "tres"], lieIndex: 2 });
    let s = lieEngine.createState(c);
    s = lieEngine.reduce(s, { type: "write", payload: { nope: true } }, "a", c);
    s = lieEngine.reduce(s, { type: "write", payload: { statements: ["uno", "dos"], lieIndex: 2 } }, "a", c);
    expect(s.phase).toBe("write");
    s = lieEngine.reduce(s, { type: "write", payload: { statements: ["uno", "dos", "tres"], lieIndex: 2 } }, "a", c);
    expect(view<{ lieIndex: number | null }>(lieEngine.privateView(s, "b")).lieIndex).toBeNull();
    expect(view<{ lieIndex?: number }>(lieEngine.publicView(s)).lieIndex).toBeUndefined();
    s = lieEngine.reduce(s, { type: "vote", payload: { index: 1 } }, "b", c);
    s = lieEngine.reduce(s, { type: "vote", payload: { index: 0 } }, "c", c);
    expect(lieEngine.isFinished(s)).toBe(false);
    s = lieEngine.reduce(s, { type: "vote", payload: null }, "d", c);
    expect(lieEngine.isFinished(s)).toBe(false);
    s = lieEngine.reduce(s, { type: "vote", payload: { index: 2 } }, "d", c);
    expect(lieEngine.isFinished(s)).toBe(true);
    expect(JSON.stringify(lieEngine.publicView(s))).not.toMatch(/"votes":\{/);
    expect(lieEngine.scores(s).d).toBe(2);
  });
});

describe("reflejos", () => {
  it("objetivo entre 2 y 6 y no publica el tiempo ajeno hasta el final", () => {
    const c = ctx({ target: 5.56 });
    let s = reflexEngine.createState(c);
    expect(s.target).toBe(5.56);
    s = reflexEngine.reduce(s, { type: "start" }, "b", c);
    s = reflexEngine.reduce(s, { type: "stop", payload: { elapsed: "x" } }, "b", c);
    s = reflexEngine.reduce(s, { type: "stop", payload: { elapsed: 5.5 } }, "b", c);
    expect(view<{ results?: unknown }>(reflexEngine.publicView(s)).results).toBeUndefined();
    expect(view<{ myElapsed: number | null }>(reflexEngine.privateView(s, "a")).myElapsed).toBeNull();
    for (const id of ["a", "c", "d"]) {
      s = reflexEngine.reduce(s, { type: "start" }, id, c);
      s = reflexEngine.reduce(s, { type: "stop", payload: { elapsed: 3 } }, id, c);
    }
    expect(reflexEngine.isFinished(s)).toBe(true);
    expect(reflexEngine.scores(s).b).toBe(3);
  });
});

describe("yo nunca", () => {
  it("es un mazo de cartas, sin boleta ni roles ajenos", () => {
    const c = ctx({ prompt: "yo nunca mentí" });
    let s = neverEngine.createState(c);
    expect(view<{ prompt: string }>(neverEngine.publicView(s)).prompt).toBe("yo nunca mentí");
    s = neverEngine.reduce(s, { type: "next" }, "a", c);
    const pub = JSON.stringify(neverEngine.publicView(s));
    expect(pub).not.toContain('"choices"');
    expect(neverEngine.privateView(s, "b")).toEqual({ myChoice: null });
    expect(view<{ index: number }>(neverEngine.publicView(s)).index).toBe(1);
  });
});

describe("tutti", () => {
  it("esconde respuestas ajenas, revisa ortografía y después puntúa", () => {
    const c = ctx({ letter: "M" });
    let s = stopEngine.createState(c);
    s = stopEngine.reduce(s, { type: "write", payload: { answers: { nombre: "Meli" } } }, "a", c);
    expect(s.phase).toBe("write");
    expect(JSON.stringify(stopEngine.publicView(s))).not.toContain("Mendoza");
    s = stopEngine.reduce(s, { type: "write", payload: null }, "a", c);
    const full = { nombre: "Meli", ciudad: "Mendoza", comida: "milanesa", famoso: "Messi", cosa: "mate" };
    s = stopEngine.reduce(s, { type: "write", payload: { answers: full } }, "a", c);
    expect(s.phase).toBe("review");
    expect(view<{ review?: { text: string } }>(stopEngine.publicView(s)).review?.text).toBeTruthy();
    expect(JSON.stringify(stopEngine.privateView(s, "b"))).not.toContain("impostor");
    for (const id of ids) {
      s = stopEngine.reduce(s, { type: "review", payload: { value: "ok" } }, id, c);
    }
    expect(s.reviewIndex).toBeGreaterThan(0);
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
});
