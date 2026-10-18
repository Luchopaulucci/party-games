import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { HIGHER_LOWER_PROMPTS } from "./prompts";

export type HigherLowerPhase = "guessing" | "done";
export type HigherLowerResult = "mas" | "menos" | "justo" | "pasado";

export interface HigherLowerGuess {
  playerId: string;
  value: number;
  result: HigherLowerResult;
}

export interface HigherLowerState {
  phase: HigherLowerPhase;
  promptId: string;
  prompt: string;
  secret: number;
  min: number;
  max: number;
  guesses: HigherLowerGuess[];
  currentPlayerId: string;
  winnerId: string | null;
  blurb?: string;
}

export interface HigherLowerPublicView {
  phase: HigherLowerPhase;
  prompt: string;
  min: number;
  max: number;
  guesses: HigherLowerGuess[];
  currentPlayerId: string;
  winnerId: string | null;
  secret?: number;
  blurb?: string;
}

export interface HigherLowerPrivateView {
  isYourTurn: boolean;
}

function pickPrompt(ctx: GameContext) {
  if (ctx.seed?.trueAnswer !== undefined) {
    return {
      id: ctx.seed.questionId ?? "seeded",
      prompt: ctx.seed.prompt ?? "Adiviná el número",
      answer: ctx.seed.trueAnswer,
      min: ctx.seed.min ?? 1,
      max: ctx.seed.max ?? 100,
    };
  }
  return pickRandom(HIGHER_LOWER_PROMPTS, ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
}

export function evaluateGuess(
  value: number,
  secret: number,
  min: number,
  max: number,
): HigherLowerResult {
  if (value <= min || value >= max) return "pasado";
  if (value === secret) return "justo";
  return value < secret ? "mas" : "menos";
}

export const higherLowerEngine: GameEngine<HigherLowerState> = {
  id: "mas-o-menos",

  createState(ctx) {
    const prompt = pickPrompt(ctx);
    return {
      phase: "guessing",
      promptId: prompt.id,
      prompt: prompt.prompt,
      secret: prompt.answer,
      min: prompt.min,
      max: prompt.max,
      guesses: [],
      currentPlayerId: ctx.playerIds[0]!,
      winnerId: null,
      blurb: "blurb" in prompt ? prompt.blurb : undefined,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "done") return state;

    if (action.type === "guess") {
      if (playerId !== state.currentPlayerId) return state;
      const raw = action.payload && typeof action.payload === "object" ? (action.payload as { value?: unknown }).value : action.payload;
      const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(String(raw).replace(",", ".")) : Number.NaN;
      if (!Number.isFinite(value)) return state;
      const result = evaluateGuess(value, state.secret, state.min, state.max);
      const guesses = [...state.guesses, { playerId, value, result }];
      const idx = ctx.playerIds.indexOf(state.currentPlayerId);
      const nextPlayer = ctx.playerIds[(idx + 1) % ctx.playerIds.length]!;

      if (result === "justo") {
        return {
          ...state,
          guesses,
          phase: "done",
          winnerId: playerId,
          min: value,
          max: value,
        };
      }

      let min = state.min;
      let max = state.max;
      if (result === "mas") min = value;
      if (result === "menos") max = value;

      return { ...state, guesses, min, max, currentPlayerId: nextPlayer };
    }

    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "done" };
    }

    return state;
  },

  publicView(state): HigherLowerPublicView {
    const view: HigherLowerPublicView = {
      phase: state.phase,
      prompt: state.prompt,
      min: state.min,
      max: state.max,
      guesses: state.guesses,
      currentPlayerId: state.currentPlayerId,
      winnerId: state.winnerId,
    };
    if (state.phase === "done") {
      view.secret = state.secret;
      view.blurb = state.blurb;
    }
    return view;
  },

  privateView(state, playerId): HigherLowerPrivateView {
    return { isYourTurn: state.phase === "guessing" && state.currentPlayerId === playerId };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(state): ScoreMap {
    if (state.winnerId) return { [state.winnerId]: 3 };
    return {};
  },

  usedContentId(state) {
    return state.promptId;
  },
};
