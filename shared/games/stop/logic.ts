import type { GameEngine, ScoreMap } from "../../types";
import { normalize } from "../helpers";

export const STOP_CATEGORIES = ["nombre", "ciudad", "comida", "famoso", "cosa"];

export type StopPhase = "write" | "review" | "reveal";
export type StopReviewVote = "ok" | "no";

export interface StopReviewItem {
  playerId: string;
  category: string;
  text: string;
}

export interface StopState {
  phase: StopPhase;
  letter: string;
  categories: string[];
  answers: Record<string, Record<string, string>>;
  reviewQueue: StopReviewItem[];
  reviewIndex: number;
  reviewVotes: Record<string, StopReviewVote>;
  accepted: Record<string, Record<string, boolean>>;
}

export interface StopPublicView {
  phase: StopPhase;
  letter: string;
  categories: string[];
  submittedIds: string[];
  review?: StopReviewItem & { index: number; total: number; votedIds: string[] };
  answers?: Record<string, Record<string, string>>;
  points?: ScoreMap;
}

export interface StopPrivateView {
  myAnswers: Record<string, string>;
  myReviewVote: StopReviewVote | null;
}

const LETTERS = "ABCDEFGHJLMNOPRSTUV".split("");

function parseAnswers(payload: unknown, categories: string[]): Record<string, string> | null {
  if (payload == null || typeof payload !== "object") return null;
  const raw = (payload as { answers?: unknown }).answers;
  if (raw == null || typeof raw !== "object") return null;
  const cleaned: Record<string, string> = {};
  for (const cat of categories) {
    const value = (raw as Record<string, unknown>)[cat];
    cleaned[cat] = typeof value === "string" ? value.trim().slice(0, 32) : "";
  }
  return cleaned;
}

function buildQueue(answers: Record<string, Record<string, string>>, categories: string[]): StopReviewItem[] {
  const out: StopReviewItem[] = [];
  for (const [playerId, row] of Object.entries(answers)) {
    for (const category of categories) {
      const text = row[category] ?? "";
      if (text) out.push({ playerId, category, text });
    }
  }
  return out;
}

export function scoreStop(
  answers: Record<string, Record<string, string>>,
  categories: string[],
  accepted?: Record<string, Record<string, boolean>>,
): ScoreMap {
  const out: ScoreMap = {};
  for (const cat of categories) {
    const used: Record<string, string[]> = {};
    for (const [playerId, row] of Object.entries(answers)) {
      if (accepted && !accepted[playerId]?.[cat]) continue;
      const raw = normalize(row[cat] ?? "");
      if (!raw) continue;
      used[raw] = [...(used[raw] ?? []), playerId];
    }
    for (const ids of Object.values(used)) {
      const pts = ids.length === 1 ? 2 : 1;
      for (const id of ids) out[id] = (out[id] ?? 0) + pts;
    }
  }
  return out;
}

function finishReview(state: StopState, accepted: Record<string, Record<string, boolean>>): StopState {
  return { ...state, accepted, reviewVotes: {}, phase: "reveal" };
}

export const stopEngine: GameEngine<StopState> = {
  id: "tutti",

  createState(ctx) {
    const letter = ctx.seed?.letter ?? LETTERS[Math.floor(ctx.rng() * LETTERS.length)]!;
    return {
      phase: "write",
      letter,
      categories: [...STOP_CATEGORIES],
      answers: {},
      reviewQueue: [],
      reviewIndex: 0,
      reviewVotes: {},
      accepted: {},
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "write" && state.phase === "write") {
      const cleaned = parseAnswers(action.payload, state.categories);
      if (!cleaned) return state;
      const answers = { ...state.answers, [playerId]: cleaned };
      const complete = state.categories.every((c) => cleaned[c]);
      const everyone = ctx.playerIds.every((id) => answers[id]);
      if (!complete && !everyone) return { ...state, answers };
      const reviewQueue = buildQueue(answers, state.categories);
      if (reviewQueue.length === 0) {
        return { ...state, answers, reviewQueue, phase: "reveal" };
      }
      return { ...state, answers, reviewQueue, reviewIndex: 0, reviewVotes: {}, phase: "review" };
    }

    if (action.type === "review" && state.phase === "review") {
      const value =
        action.payload && typeof action.payload === "object"
          ? (action.payload as { value?: unknown }).value
          : undefined;
      if (value !== "ok" && value !== "no") return state;
      const vote: StopReviewVote = value;
      const reviewVotes: Record<string, StopReviewVote> = { ...state.reviewVotes, [playerId]: vote };
      if (!ctx.playerIds.every((id) => reviewVotes[id])) {
        return { ...state, reviewVotes };
      }
      const item = state.reviewQueue[state.reviewIndex];
      const accepted = { ...state.accepted };
      if (item) {
        const oks = Object.values(reviewVotes).filter((v) => v === "ok").length;
        const yes = oks * 2 >= ctx.playerIds.length;
        accepted[item.playerId] = { ...(accepted[item.playerId] ?? {}), [item.category]: yes };
      }
      const next = state.reviewIndex + 1;
      if (next >= state.reviewQueue.length) return finishReview(state, accepted);
      return { ...state, accepted, reviewIndex: next, reviewVotes: {} };
    }

    if ((action.type === "timeout" || action.type === "reveal") && state.phase === "write") {
      const reviewQueue = buildQueue(state.answers, state.categories);
      if (reviewQueue.length === 0) return { ...state, reviewQueue, phase: "reveal" };
      return { ...state, reviewQueue, reviewIndex: 0, reviewVotes: {}, phase: "review" };
    }
    if ((action.type === "timeout" || action.type === "reveal") && state.phase === "review") {
      return finishReview(state, state.accepted);
    }
    return state;
  },

  publicView(state): StopPublicView {
    const view: StopPublicView = {
      phase: state.phase,
      letter: state.letter,
      categories: state.categories,
      submittedIds: Object.keys(state.answers),
    };
    if (state.phase === "review") {
      const item = state.reviewQueue[state.reviewIndex];
      if (item) {
        view.review = {
          ...item,
          index: state.reviewIndex,
          total: state.reviewQueue.length,
          votedIds: Object.keys(state.reviewVotes),
        };
      }
    }
    if (state.phase === "reveal") {
      view.answers = state.answers;
      view.points = scoreStop(state.answers, state.categories, state.accepted);
    }
    return view;
  },

  privateView(state, playerId): StopPrivateView {
    return {
      myAnswers: state.answers[playerId] ?? {},
      myReviewVote: state.reviewVotes[playerId] ?? null,
    };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    return state.phase === "reveal" ? scoreStop(state.answers, state.categories, state.accepted) : {};
  },
};
