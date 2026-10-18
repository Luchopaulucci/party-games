import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { WHOAMI_CHARACTERS } from "./characters";

export type WhoAmIPhase = "questioning" | "done";
export type YesNo = "si" | "no" | "nose";

export interface WhoAmIQuestion {
  id: string;
  by: string;
  text: string;
  answer: YesNo | null;
  answeredBy: string | null;
}

export interface WhoAmIGuess {
  text: string;
  correct: boolean;
}

export interface WhoAmIState {
  phase: WhoAmIPhase;
  targetId: string;
  characterId: string;
  character: string;
  hint: string;
  questions: WhoAmIQuestion[];
  guesses: WhoAmIGuess[];
  maxGuesses: number;
  winnerId: string | null;
}

export interface WhoAmIPublicView {
  phase: WhoAmIPhase;
  targetId: string;
  hintForOthers?: never;
  questions: WhoAmIQuestion[];
  guesses: WhoAmIGuess[];
  maxGuesses: number;
  winnerId: string | null;
  character?: string;
  hint?: string;
}

export interface WhoAmIPrivateView {
  isTarget: boolean;
  character: string | null;
  hint: string | null;
}

let qseq = 0;

function nextQuestionId(): string {
  qseq += 1;
  return `q${qseq}`;
}

function pickCharacter(ctx: GameContext) {
  if (ctx.seed?.character) {
    return {
      id: "seeded",
      name: ctx.seed.character,
      hint: ctx.seed.hint ?? "pista de prueba",
    };
  }
  return pickRandom(WHOAMI_CHARACTERS, ctx.rng, ctx.usedContentIds ?? [], (c) => c.id);
}

function pickTarget(ctx: GameContext): string {
  if (ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)) {
    return ctx.seed.targetId;
  }
  return ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function guessMatches(guess: string, character: string): boolean {
  const g = normalize(guess);
  const c = normalize(character);
  if (!g || g.length < 3) return false;
  if (c === g) return true;
  const last = c.split(" ").pop() ?? c;
  if (last.length >= 4 && (g === last || g.endsWith(last) || last.endsWith(g))) return true;
  return c.includes(g) && g.length >= 5;
}

export const whoamiEngine: GameEngine<WhoAmIState> = {
  id: "whoami",

  createState(ctx) {
    const character = pickCharacter(ctx);
    return {
      phase: "questioning",
      targetId: pickTarget(ctx),
      characterId: character.id,
      character: character.name,
      hint: character.hint,
      questions: [],
      guesses: [],
      maxGuesses: 3,
      winnerId: null,
    };
  },

  reduce(state, action, playerId) {
    if (state.phase === "done") return state;

    if (action.type === "ask") {
      if (playerId !== state.targetId) return state;
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 3 || text.length > 140) return state;
      const open = state.questions.some((q) => q.answer === null);
      if (open) return state;
      return {
        ...state,
        questions: [
          ...state.questions,
          { id: nextQuestionId(), by: playerId, text, answer: null, answeredBy: null },
        ],
      };
    }

    if (action.type === "answer") {
      if (playerId === state.targetId) return state;
      const payload = action.payload as { questionId?: string; value?: YesNo } | undefined;
      if (!payload?.questionId || !payload.value) return state;
      if (!["si", "no", "nose"].includes(payload.value)) return state;
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === payload.questionId && q.answer === null
            ? { ...q, answer: payload.value!, answeredBy: playerId }
            : q,
        ),
      };
    }

    if (action.type === "guess") {
      if (playerId !== state.targetId) return state;
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2) return state;
      const correct = guessMatches(text, state.character);
      const guesses = [...state.guesses, { text, correct }];
      if (correct) {
        return { ...state, guesses, phase: "done", winnerId: state.targetId };
      }
      if (guesses.length >= state.maxGuesses) {
        return { ...state, guesses, phase: "done", winnerId: null };
      }
      return { ...state, guesses };
    }

    if (action.type === "give-up") {
      if (playerId !== state.targetId) return state;
      return { ...state, phase: "done", winnerId: null };
    }

    return state;
  },

  publicView(state): WhoAmIPublicView {
    const view: WhoAmIPublicView = {
      phase: state.phase,
      targetId: state.targetId,
      questions: state.questions,
      guesses: state.guesses.map((g) => ({ text: g.text, correct: g.correct })),
      maxGuesses: state.maxGuesses,
      winnerId: state.winnerId,
    };
    if (state.phase === "done") {
      view.character = state.character;
      view.hint = state.hint;
    }
    return view;
  },

  privateView(state, playerId): WhoAmIPrivateView {
    const isTarget = playerId === state.targetId;
    if (isTarget && state.phase !== "done") {
      return { isTarget: true, character: null, hint: null };
    }
    return { isTarget, character: state.character, hint: state.hint };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(state): ScoreMap {
    if (state.phase !== "done") return {};
    const out: ScoreMap = {};
    if (state.winnerId) {
      out[state.winnerId] = 3;
    }
    return out;
  },

  usedContentId(state) {
    return state.characterId;
  },
};
