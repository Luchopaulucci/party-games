import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { filterByPack } from "../packs";
import { TRIVIA_QUESTIONS, type TriviaQuestion } from "./questions";

export type TriviaPhase = "answer" | "reveal";

export interface TriviaState {
  phase: TriviaPhase;
  question: TriviaQuestion;
  answers: Record<string, number>;
}

export interface TriviaPublicView {
  phase: TriviaPhase;
  prompt: string;
  options: string[];
  submittedIds: string[];
  correct?: number;
}

export interface TriviaPrivateView {
  myAnswer: number | null;
}

function pickQuestion(ctx: Parameters<GameEngine<TriviaState>["createState"]>[0]): TriviaQuestion {
  if (ctx.seed?.prompt && ctx.seed.options && ctx.seed.correct !== undefined) {
    const opts = ctx.seed.options;
    return {
      id: ctx.seed.questionId ?? "seeded",
      pack: "clasico",
      prompt: ctx.seed.prompt,
      options: [opts[0] ?? "a", opts[1] ?? "b", opts[2] ?? "c", opts[3] ?? "d"],
      correct: ctx.seed.correct,
    };
  }
  const pool = filterByPack(TRIVIA_QUESTIONS, ctx);
  return pickRandom(pool, ctx.rng, ctx.usedContentIds ?? [], (q) => q.id);
}

export const triviaEngine: GameEngine<TriviaState> = {
  id: "trivia",

  createState(ctx) {
    return { phase: "answer", question: pickQuestion(ctx), answers: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "answer") {
      const index = Number((action.payload as { index?: unknown })?.index);
      if (!Number.isInteger(index) || index < 0 || index > 3) return state;
      if (state.answers[playerId] !== undefined) return state;
      const answers = { ...state.answers, [playerId]: index };
      const everyone = ctx.playerIds.every((id) => answers[id] !== undefined);
      return { ...state, answers, phase: everyone ? "reveal" : "answer" };
    }
    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): TriviaPublicView {
    const view: TriviaPublicView = {
      phase: state.phase,
      prompt: state.question.prompt,
      options: state.question.options,
      submittedIds: Object.keys(state.answers),
    };
    if (state.phase === "reveal") view.correct = state.question.correct;
    return view;
  },

  privateView(state, playerId): TriviaPrivateView {
    return { myAnswer: state.answers[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const out: ScoreMap = {};
    for (const [id, index] of Object.entries(state.answers)) {
      if (index === state.question.correct) out[id] = 2;
    }
    return out;
  },

  usedContentId(state) {
    return state.question.id;
  },
};
