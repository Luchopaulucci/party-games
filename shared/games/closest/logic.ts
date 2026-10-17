import type { GameAction, GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { CLOSEST_QUESTIONS, type ClosestQuestion } from "./questions";

export type ClosestPhase = "answering" | "reveal";

export interface ClosestState {
  phase: ClosestPhase;
  questionId: string;
  prompt: string;
  unit?: string;
  blurb?: string;
  trueAnswer: number;
  guesses: Record<string, number>;
  ranking: ClosestRank[] | null;
}

export interface ClosestRank {
  playerId: string;
  guess: number;
  distance: number;
  points: number;
}

export interface ClosestPublicView {
  phase: ClosestPhase;
  prompt: string;
  unit?: string;
  blurb?: string;
  submittedIds: string[];
  trueAnswer?: number;
  ranking?: ClosestRank[];
}

export interface ClosestPrivateView {
  guess: number | null;
}

export function scoreClosestRound(
  guesses: Record<string, number>,
  trueAnswer: number,
): ClosestRank[] {
  const entries = Object.entries(guesses).map(([playerId, guess]) => ({
    playerId,
    guess,
    distance: Math.abs(guess - trueAnswer),
    points: 0,
  }));
  entries.sort((a, b) => a.distance - b.distance || a.playerId.localeCompare(b.playerId));

  if (entries.length === 0) return entries;

  const best = entries[0]!.distance;
  const winners = entries.filter((e) => e.distance === best);
  const winnerPoints = winners.length === 1 ? 3 : 2;
  for (const row of winners) {
    row.points = winnerPoints;
    if (row.distance === 0) row.points += 2;
  }

  const secondDistance = entries.find((e) => e.distance > best)?.distance;
  if (secondDistance !== undefined && winners.length === 1) {
    for (const row of entries) {
      if (row.distance === secondDistance) row.points += 1;
    }
  }

  return entries;
}

function pickQuestion(ctx: GameContext): ClosestQuestion {
  if (ctx.seed?.prompt && ctx.seed.trueAnswer !== undefined) {
    return {
      id: ctx.seed.questionId ?? "seeded",
      prompt: ctx.seed.prompt,
      answer: ctx.seed.trueAnswer,
      unit: ctx.seed.unit,
    };
  }
  if (ctx.seed?.questionId) {
    const found = CLOSEST_QUESTIONS.find((q) => q.id === ctx.seed?.questionId);
    if (found) return found;
  }
  return pickRandom(CLOSEST_QUESTIONS, ctx.rng, ctx.usedContentIds ?? [], (q) => q.id);
}

export const closestEngine: GameEngine<ClosestState> = {
  id: "closest",

  createState(ctx) {
    const question = pickQuestion(ctx);
    return {
      phase: "answering",
      questionId: question.id,
      prompt: question.prompt,
      unit: question.unit,
      blurb: question.blurb,
      trueAnswer: question.answer,
      guesses: {},
      ranking: null,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "guess") {
      const value = Number((action.payload as { value?: unknown })?.value);
      if (!Number.isFinite(value)) return state;
      if (state.guesses[playerId] !== undefined) return state;
      const guesses = { ...state.guesses, [playerId]: value };
      const everyoneIn = ctx.playerIds.every((id) => guesses[id] !== undefined);
      if (!everyoneIn) {
        return { ...state, guesses };
      }
      const ranking = scoreClosestRound(guesses, state.trueAnswer);
      return { ...state, guesses, phase: "reveal", ranking };
    }

    if (action.type === "reveal") {
      const ranking = scoreClosestRound(state.guesses, state.trueAnswer);
      return { ...state, phase: "reveal", ranking };
    }

    return state;
  },

  publicView(state): ClosestPublicView {
    const view: ClosestPublicView = {
      phase: state.phase,
      prompt: state.prompt,
      unit: state.unit,
      blurb: state.phase === "reveal" ? state.blurb : undefined,
      submittedIds: Object.keys(state.guesses),
    };
    if (state.phase === "reveal") {
      view.trueAnswer = state.trueAnswer;
      view.ranking = state.ranking ?? undefined;
    }
    return view;
  },

  privateView(state, playerId): ClosestPrivateView {
    return { guess: state.guesses[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    const out: ScoreMap = {};
    for (const row of state.ranking ?? []) {
      if (row.points) out[row.playerId] = row.points;
    }
    return out;
  },

  usedContentId(state) {
    return state.questionId;
  },
};

export function isClosestAction(action: GameAction): boolean {
  return action.type === "guess" || action.type === "reveal";
}
