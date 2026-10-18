import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { sameText } from "../helpers";
import { filterByPack } from "../packs";
import { EMOJI_PUZZLES, type EmojiPuzzle } from "./puzzles";

export type EmojiPhase = "guess" | "reveal";

export interface EmojiState {
  phase: EmojiPhase;
  puzzle: EmojiPuzzle;
  guesses: { playerId: string; text: string; correct: boolean }[];
  winnerId: string | null;
}

export interface EmojiPublicView {
  phase: EmojiPhase;
  puzzle: string;
  hint?: string;
  guessCount: number;
  winnerId: string | null;
  answer?: string;
}

export interface EmojiPrivateView {
  myGuesses: string[];
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
    return { phase: "guess", puzzle: pickPuzzle(ctx), guesses: [], winnerId: null };
  },

  reduce(state, action, playerId) {
    if (state.phase === "reveal") return state;
    if (action.type === "guess") {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2) return state;
      const correct = sameText(text, state.puzzle.answer);
      const guesses = [...state.guesses, { playerId, text, correct }];
      if (correct) return { ...state, guesses, phase: "reveal", winnerId: playerId };
      return { ...state, guesses };
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
      guessCount: state.guesses.length,
      winnerId: state.winnerId,
    };
    if (state.phase === "guess") view.hint = state.puzzle.hint;
    if (state.phase === "reveal") view.answer = state.puzzle.answer;
    return view;
  },

  privateView(state, playerId): EmojiPrivateView {
    return { myGuesses: state.guesses.filter((g) => g.playerId === playerId).map((g) => g.text) };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal" || !state.winnerId) return {};
    return { [state.winnerId]: 3 };
  },

  usedContentId(state) {
    return state.puzzle.id;
  },
};
