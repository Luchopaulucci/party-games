import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { sameText } from "../helpers";
import { CHARADE_WORDS } from "./words";

export type MimicPhase = "play" | "done";

export interface MimicState {
  phase: MimicPhase;
  actorId: string;
  wordId: string;
  word: string;
  guesses: { playerId: string; text: string; correct: boolean }[];
  winnerId: string | null;
}

export interface MimicPublicView {
  phase: MimicPhase;
  actorId: string;
  guessCount: number;
  winnerId: string | null;
  word?: string;
}

export interface MimicPrivateView {
  isActor: boolean;
  word: string | null;
}

export const mimicEngine: GameEngine<MimicState> = {
  id: "mimica",

  createState(ctx) {
    const word = ctx.seed?.word
      ? { id: "seeded", word: ctx.seed.word }
      : pickRandom(CHARADE_WORDS, ctx.rng, ctx.usedContentIds ?? [], (w) => w.id);
    const actorId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
    return { phase: "play", actorId, wordId: word.id, word: word.word, guesses: [], winnerId: null };
  },

  reduce(state, action, playerId) {
    if (state.phase === "done") return state;
    if (action.type === "guess" && playerId !== state.actorId) {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2) return state;
      const correct = sameText(text, state.word);
      const guesses = [...state.guesses, { playerId, text, correct }];
      if (correct) return { ...state, guesses, phase: "done", winnerId: playerId };
      return { ...state, guesses };
    }
    if (action.type === "timeout" || action.type === "skip") {
      return { ...state, phase: "done" };
    }
    return state;
  },

  publicView(state): MimicPublicView {
    const view: MimicPublicView = {
      phase: state.phase,
      actorId: state.actorId,
      guessCount: state.guesses.length,
      winnerId: state.winnerId,
    };
    if (state.phase === "done") view.word = state.word;
    return view;
  },

  privateView(state, playerId): MimicPrivateView {
    const isActor = playerId === state.actorId;
    return { isActor, word: isActor || state.phase === "done" ? state.word : null };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(state): ScoreMap {
    if (state.phase !== "done" || !state.winnerId) return {};
    return { [state.winnerId]: 3, [state.actorId]: 2 };
  },

  usedContentId(state) {
    return state.wordId;
  },
};
