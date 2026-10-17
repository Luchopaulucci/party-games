import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { sameText } from "../helpers";
import { DRAW_WORDS } from "./words";

export type DrawPhase = "draw" | "guess" | "reveal";
export type DrawPoint = { x: number; y: number };
export type DrawStroke = { color: string; points: DrawPoint[] };

export interface DrawState {
  phase: DrawPhase;
  drawerId: string;
  wordId: string;
  word: string;
  strokes: DrawStroke[];
  guesses: { playerId: string; text: string; correct: boolean }[];
  winnerId: string | null;
}

export interface DrawPublicView {
  phase: DrawPhase;
  drawerId: string;
  strokes: DrawStroke[];
  guessCount: number;
  winnerId: string | null;
  word?: string;
}

export interface DrawPrivateView {
  isDrawer: boolean;
  word: string | null;
}

export const drawEngine: GameEngine<DrawState> = {
  id: "dibuja",

  createState(ctx) {
    const word = ctx.seed?.word
      ? { id: "seeded", word: ctx.seed.word }
      : pickRandom(DRAW_WORDS, ctx.rng, ctx.usedContentIds ?? [], (w) => w.id);
    const drawerId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
    return {
      phase: "draw",
      drawerId,
      wordId: word.id,
      word: word.word,
      strokes: [],
      guesses: [],
      winnerId: null,
    };
  },

  reduce(state, action, playerId) {
    if (state.phase === "reveal") return state;

    if (action.type === "stroke" && playerId === state.drawerId) {
      const stroke = (action.payload as { stroke?: DrawStroke })?.stroke;
      if (!stroke?.points?.length) return state;
      const points = stroke.points
        .slice(0, 200)
        .map((p) => ({ x: Number(p.x), y: Number(p.y) }))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
      if (!points.length) return state;
      return { ...state, strokes: [...state.strokes, { color: stroke.color || "#1e1446", points }].slice(-80) };
    }

    if (action.type === "open-guess" && playerId === state.drawerId) {
      return { ...state, phase: "guess" };
    }

    if (action.type === "guess" && playerId !== state.drawerId) {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2) return state;
      const correct = sameText(text, state.word);
      const guesses = [...state.guesses, { playerId, text, correct }];
      if (correct) return { ...state, guesses, phase: "reveal", winnerId: playerId };
      return { ...state, phase: "guess", guesses };
    }

    if (action.type === "timeout" || action.type === "give-up") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): DrawPublicView {
    const view: DrawPublicView = {
      phase: state.phase,
      drawerId: state.drawerId,
      strokes: state.strokes,
      guessCount: state.guesses.length,
      winnerId: state.winnerId,
    };
    if (state.phase === "reveal") view.word = state.word;
    return view;
  },

  privateView(state, playerId): DrawPrivateView {
    const isDrawer = playerId === state.drawerId;
    return { isDrawer, word: isDrawer || state.phase === "reveal" ? state.word : null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    if (state.winnerId) return { [state.winnerId]: 3, [state.drawerId]: 2 };
    return {};
  },

  usedContentId(state) {
    return state.wordId;
  },
};
