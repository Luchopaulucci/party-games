import type { GameEngine, ScoreMap } from "../../types";
import { shuffle } from "../../rng";
import { NEVER_PROMPTS } from "./prompts";

export type NeverPhase = "card" | "done";

export interface NeverState {
  phase: NeverPhase;
  deck: { id: string; prompt: string }[];
  index: number;
}

export interface NeverPublicView {
  phase: NeverPhase;
  prompt: string;
  index: number;
  total: number;
}

export interface NeverPrivateView {
  myChoice: null;
}

export const neverEngine: GameEngine<NeverState> = {
  id: "yo-nunca",

  createState(ctx) {
    if (ctx.seed?.prompt) {
      const first = { id: ctx.seed.questionId ?? "seeded", prompt: ctx.seed.prompt };
      const rest = shuffle(
        NEVER_PROMPTS.filter((p) => p.id !== first.id),
        ctx.rng,
      );
      return { phase: "card", deck: [first, ...rest], index: 0 };
    }
    return { phase: "card", deck: shuffle(NEVER_PROMPTS, ctx.rng), index: 0 };
  },

  reduce(state, action) {
    if (state.phase === "done") return state;
    if (action.type === "next" || action.type === "choose") {
      const next = state.index + 1;
      if (next >= state.deck.length) return { ...state, phase: "done", index: state.deck.length - 1 };
      return { ...state, index: next };
    }
    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "done" };
    }
    return state;
  },

  publicView(state): NeverPublicView {
    const card = state.deck[state.index] ?? state.deck[0]!;
    return {
      phase: state.phase,
      prompt: card.prompt,
      index: state.index,
      total: state.deck.length,
    };
  },

  privateView(): NeverPrivateView {
    return { myChoice: null };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(): ScoreMap {
    return {};
  },

  usedContentId(state) {
    return state.deck[state.index]?.id;
  },
};
