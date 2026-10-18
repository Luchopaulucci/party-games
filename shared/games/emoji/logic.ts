import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { filterByPack } from "../packs";
import { EMOJI_PUZZLES, type EmojiPuzzle } from "./puzzles";

export type EmojiPhase = "show" | "reveal";

export interface EmojiState {
  phase: EmojiPhase;
  puzzle: EmojiPuzzle;
  seenIds: string[];
}

export interface EmojiPublicView {
  phase: EmojiPhase;
  puzzle: string;
  seenIds: string[];
  answer?: string;
}

export interface EmojiPrivateView {
  seen: boolean;
}

function pickPuzzle(ctx: Parameters<GameEngine<EmojiState>["createState"]>[0]): EmojiPuzzle {
  if (ctx.seed?.prompt && ctx.seed.answer) {
    return {
      id: ctx.seed.questionId ?? "seeded",
      pack: "clasico",
      puzzle: ctx.seed.prompt,
      answer: ctx.seed.answer,
      hint: ctx.seed.hint ?? "",
    };
  }
  return pickRandom(filterByPack(EMOJI_PUZZLES, ctx), ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
}

export const emojiEngine: GameEngine<EmojiState> = {
  id: "emoji",

  createState(ctx) {
    return { phase: "show", puzzle: pickPuzzle(ctx), seenIds: [] };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "pass" || action.type === "ready") {
      if (state.seenIds.includes(playerId)) return state;
      const seenIds = [...state.seenIds, playerId];
      if (ctx.playerIds.every((id) => seenIds.includes(id))) {
        return { ...state, seenIds, phase: "reveal" };
      }
      return { ...state, seenIds };
    }
    if (action.type === "timeout" || action.type === "reveal") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): EmojiPublicView {
    const view: EmojiPublicView = {
      phase: state.phase,
      puzzle: state.puzzle.puzzle,
      seenIds: state.seenIds,
    };
    if (state.phase === "reveal") view.answer = state.puzzle.answer;
    return view;
  },

  privateView(state, playerId): EmojiPrivateView {
    return { seen: state.seenIds.includes(playerId) };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(): ScoreMap {
    return {};
  },

  usedContentId(state) {
    return state.puzzle.id;
  },
};
