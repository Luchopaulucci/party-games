import type { GameEngine, ScoreMap } from "../../types";
import { normalize } from "../helpers";

export const STOP_CATEGORIES = ["nombre", "ciudad", "comida", "famoso", "cosa"];

export type StopPhase = "write" | "reveal";

export interface StopState {
  phase: StopPhase;
  letter: string;
  categories: string[];
  answers: Record<string, Record<string, string>>;
}

export interface StopPublicView {
  phase: StopPhase;
  letter: string;
  categories: string[];
  submittedIds: string[];
  answers?: Record<string, Record<string, string>>;
  points?: ScoreMap;
}

export interface StopPrivateView {
  myAnswers: Record<string, string>;
}

const LETTERS = "ABCDEFGHJLMNOPRSTUV".split("");

export function scoreStop(answers: Record<string, Record<string, string>>, categories: string[]): ScoreMap {
  const out: ScoreMap = {};
  for (const cat of categories) {
    const used: Record<string, string[]> = {};
    for (const [playerId, row] of Object.entries(answers)) {
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

export const stopEngine: GameEngine<StopState> = {
  id: "tutti",

  createState(ctx) {
    const letter = ctx.seed?.letter ?? LETTERS[Math.floor(ctx.rng() * LETTERS.length)]!;
    return { phase: "write", letter, categories: [...STOP_CATEGORIES], answers: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "write") {
      const raw = (action.payload as { answers?: Record<string, unknown> })?.answers ?? {};
      const cleaned: Record<string, string> = {};
      for (const cat of state.categories) {
        cleaned[cat] = String(raw[cat] ?? "").trim().slice(0, 32);
      }
      const answers = { ...state.answers, [playerId]: cleaned };
      const everyone = ctx.playerIds.every((id) => answers[id]);
      return { ...state, answers, phase: everyone ? "reveal" : "write" };
    }
    if (action.type === "timeout" || action.type === "reveal") {
      return { ...state, phase: "reveal" };
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
    if (state.phase === "reveal") {
      view.answers = state.answers;
      view.points = scoreStop(state.answers, state.categories);
    }
    return view;
  },

  privateView(state, playerId): StopPrivateView {
    return { myAnswers: state.answers[playerId] ?? {} };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    return state.phase === "reveal" ? scoreStop(state.answers, state.categories) : {};
  },
};
