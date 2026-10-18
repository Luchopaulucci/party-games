import type { GameAction, GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { CLOSEST_QUESTIONS, type ClosestQuestion } from "./questions";
import { filterPremises, premisesToQuestions } from "./catalog";

export type ClosestPhase = "answering" | "reveal";

export interface ClosestState {
  phase: ClosestPhase;
  questionId: string;
  prompt: string;
  unit?: string;
  blurb?: string;
  trueAnswer: number;
  min: number;
  sliderMin: number;
  sliderMax: number;
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
  sliderMin: number;
  sliderMax: number;
  trueAnswer?: number;
  min?: number;
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

export function sliderBounds(answer: number, min?: number, max?: number): { min: number; max: number } {
  if (min != null && max != null && max > min) return { min, max };
  if (answer >= 1800 && answer <= 2100) return { min: min ?? 1800, max: max ?? 2030 };
  const lo = min ?? 0;
  const hi = max ?? Math.max(lo + 20, Math.round(Math.abs(answer) * 3) || 100);
  return { min: lo, max: hi };
}

function parseGuess(payload: unknown): number | null {
  const raw = payload && typeof payload === "object" ? (payload as { value?: unknown }).value : payload;
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(",", ".")) : Number.NaN;
  if (!Number.isFinite(value)) return null;
  return value;
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
  const fromPack = premisesToQuestions(filterPremises({ categories: ctx.categories, picante: ctx.picante }));
  const extras = CLOSEST_QUESTIONS.filter((q) => {
    const cat = q.category ?? "argentina";
    if (ctx.categories?.length && !ctx.categories.includes(cat)) return false;
    if (!ctx.picante && q.picante) return false;
    return true;
  });
  const pool = fromPack.length > 0 ? [...fromPack, ...extras.filter((e) => !fromPack.some((p) => p.id === e.id))] : extras;
  return pickRandom(pool.length ? pool : CLOSEST_QUESTIONS, ctx.rng, ctx.usedContentIds ?? [], (q) => q.id);
}

export const closestEngine: GameEngine<ClosestState> = {
  id: "closest",

  createState(ctx) {
    const question = pickQuestion(ctx);
    const bounds = sliderBounds(question.answer, question.min, question.max);
    return {
      phase: "answering",
      questionId: question.id,
      prompt: question.prompt,
      unit: question.unit,
      blurb: question.blurb,
      trueAnswer: question.answer,
      min: bounds.min,
      sliderMin: bounds.min,
      sliderMax: bounds.max,
      guesses: {},
      ranking: null,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "guess") {
      const value = parseGuess(action.payload);
      if (value === null) return state;
      if (state.guesses[playerId] !== undefined) return state;
      const guesses = { ...state.guesses, [playerId]: value };
      const everyoneIn = ctx.playerIds.every((id) => guesses[id] !== undefined);
      if (!everyoneIn) {
        return { ...state, guesses };
      }
      const ranking = scoreClosestRound(guesses, state.trueAnswer);
      return { ...state, guesses, phase: "reveal", ranking };
    }

    if (action.type === "reveal" || action.type === "timeout") {
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
      sliderMin: state.sliderMin,
      sliderMax: state.sliderMax,
    };
    if (state.phase === "reveal") {
      view.trueAnswer = state.trueAnswer;
      view.min = state.min;
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
