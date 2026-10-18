import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { REFLEX_PROMPTS } from "./prompts";

export type ReflexPhase = "live" | "done";

export interface ReflexState {
  phase: ReflexPhase;
  promptId: string;
  prompt: string;
  options: string[];
  correct: number;
  taps: Record<string, number>;
  winnerId: string | null;
}

export interface ReflexPublicView {
  phase: ReflexPhase;
  prompt: string;
  options: string[];
  tappedIds: string[];
  winnerId: string | null;
  correct?: number;
}

export interface ReflexPrivateView {
  myTap: number | null;
}

export const reflexEngine: GameEngine<ReflexState> = {
  id: "reflejos",

  createState(ctx) {
    const item =
      ctx.seed?.prompt && ctx.seed.options && ctx.seed.correct !== undefined
        ? {
            id: ctx.seed.questionId ?? "seeded",
            prompt: ctx.seed.prompt,
            options: ctx.seed.options,
            correct: ctx.seed.correct,
          }
        : pickRandom(REFLEX_PROMPTS, ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    return {
      phase: "live",
      promptId: item.id,
      prompt: item.prompt,
      options: item.options,
      correct: item.correct,
      taps: {},
      winnerId: null,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "done") return state;
    if (action.type === "tap") {
      if (state.taps[playerId] !== undefined) return state;
      const index = Number((action.payload as { index?: unknown })?.index);
      if (!Number.isInteger(index) || index < 0 || index >= state.options.length) return state;
      const taps = { ...state.taps, [playerId]: index };
      if (index === state.correct) {
        return { ...state, taps, phase: "done", winnerId: playerId };
      }
      const allWrong = ctx.playerIds.every((id) => taps[id] !== undefined && taps[id] !== state.correct);
      if (allWrong) return { ...state, taps, phase: "done", winnerId: null };
      return { ...state, taps };
    }
    if (action.type === "timeout") {
      return { ...state, phase: "done" };
    }
    return state;
  },

  publicView(state): ReflexPublicView {
    const view: ReflexPublicView = {
      phase: state.phase,
      prompt: state.prompt,
      options: state.options,
      tappedIds: Object.keys(state.taps),
      winnerId: state.winnerId,
    };
    if (state.phase === "done") view.correct = state.correct;
    return view;
  },

  privateView(state, playerId): ReflexPrivateView {
    return { myTap: state.taps[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(state): ScoreMap {
    if (state.phase !== "done") return {};
    const out: ScoreMap = {};
    if (state.winnerId) out[state.winnerId] = 3;
    for (const [id, tap] of Object.entries(state.taps)) {
      if (tap !== state.correct) out[id] = (out[id] ?? 0) - 1;
    }
    return out;
  },

  usedContentId(state) {
    return state.promptId;
  },
};
