import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { sameText } from "../helpers";
import { TABOO_CARDS } from "./cards";

export type TabooPhase = "play" | "done";

export interface TabooState {
  phase: TabooPhase;
  speakerId: string;
  cardId: string;
  word: string;
  forbidden: string[];
  guesses: { playerId: string; text: string; correct: boolean }[];
  buzzed: boolean;
  winnerId: string | null;
}

export interface TabooPublicView {
  phase: TabooPhase;
  speakerId: string;
  forbiddenCount: number;
  guessCount: number;
  buzzed: boolean;
  winnerId: string | null;
  word?: string;
  forbidden?: string[];
}

export interface TabooPrivateView {
  isSpeaker: boolean;
  word: string | null;
  forbidden: string[] | null;
}

export const tabooEngine: GameEngine<TabooState> = {
  id: "taboo",

  createState(ctx) {
    const card = ctx.seed?.word
      ? {
          id: "seeded",
          word: ctx.seed.word,
          forbidden: ctx.seed.forbidden ?? ["pista", "obvia", "esa", "palabra"],
        }
      : pickRandom(TABOO_CARDS, ctx.rng, ctx.usedContentIds ?? [], (c) => c.id);
    const speakerId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
    return {
      phase: "play",
      speakerId,
      cardId: card.id,
      word: card.word,
      forbidden: card.forbidden,
      guesses: [],
      buzzed: false,
      winnerId: null,
    };
  },

  reduce(state, action, playerId) {
    if (state.phase === "done") return state;
    if (action.type === "guess" && playerId !== state.speakerId) {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2) return state;
      const correct = sameText(text, state.word);
      const guesses = [...state.guesses, { playerId, text, correct }];
      if (correct) return { ...state, guesses, phase: "done", winnerId: playerId };
      return { ...state, guesses };
    }
    if (action.type === "buzz" && playerId !== state.speakerId) {
      return { ...state, buzzed: true, phase: "done", winnerId: playerId };
    }
    if (action.type === "timeout" || action.type === "give-up") {
      return { ...state, phase: "done" };
    }
    return state;
  },

  publicView(state): TabooPublicView {
    const view: TabooPublicView = {
      phase: state.phase,
      speakerId: state.speakerId,
      forbiddenCount: state.forbidden.length,
      guessCount: state.guesses.length,
      buzzed: state.buzzed,
      winnerId: state.winnerId,
    };
    if (state.phase === "done") {
      view.word = state.word;
      view.forbidden = state.forbidden;
    }
    return view;
  },

  privateView(state, playerId): TabooPrivateView {
    const isSpeaker = playerId === state.speakerId;
    return {
      isSpeaker,
      word: isSpeaker || state.phase === "done" ? state.word : null,
      forbidden: isSpeaker || state.phase === "done" ? state.forbidden : null,
    };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(state): ScoreMap {
    if (state.phase !== "done") return {};
    if (state.buzzed && state.winnerId) return { [state.winnerId]: 1 };
    if (state.winnerId) return { [state.winnerId]: 3, [state.speakerId]: 2 };
    return {};
  },

  usedContentId(state) {
    return state.cardId;
  },
};
