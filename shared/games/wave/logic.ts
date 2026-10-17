import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { WAVE_POLES } from "./poles";

export type WavePhase = "clue" | "guess" | "reveal";

export interface WaveState {
  phase: WavePhase;
  polesId: string;
  left: string;
  right: string;
  target: number;
  psychicId: string;
  clue: string | null;
  guesses: Record<string, number>;
}

export interface WavePublicView {
  phase: WavePhase;
  left: string;
  right: string;
  psychicId: string;
  clue: string | null;
  submittedIds: string[];
  target?: number;
  guesses?: Record<string, number>;
}

export interface WavePrivateView {
  isPsychic: boolean;
  target: number | null;
  myGuess: number | null;
}

function closeness(guess: number, target: number): number {
  const d = Math.abs(guess - target);
  if (d <= 5) return 4;
  if (d <= 10) return 3;
  if (d <= 18) return 2;
  if (d <= 28) return 1;
  return 0;
}

export const waveEngine: GameEngine<WaveState> = {
  id: "onda",

  createState(ctx) {
    const poles =
      ctx.seed?.poles
        ? { id: "seeded", left: ctx.seed.poles[0], right: ctx.seed.poles[1] }
        : pickRandom(WAVE_POLES, ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    const psychicId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
    const target =
      ctx.seed?.target !== undefined ? ctx.seed.target : Math.floor(ctx.rng() * 101);
    return {
      phase: "clue",
      polesId: poles.id,
      left: poles.left,
      right: poles.right,
      target,
      psychicId,
      clue: null,
      guesses: {},
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "clue" && state.phase === "clue" && playerId === state.psychicId) {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 1 || text.length > 80) return state;
      return { ...state, clue: text, phase: "guess" };
    }
    if (action.type === "guess" && state.phase === "guess" && playerId !== state.psychicId) {
      const value = Number((action.payload as { value?: unknown })?.value);
      if (!Number.isFinite(value)) return state;
      const guesses = { ...state.guesses, [playerId]: Math.min(100, Math.max(0, value)) };
      const others = ctx.playerIds.filter((id) => id !== state.psychicId);
      const everyone = others.every((id) => guesses[id] !== undefined);
      return { ...state, guesses, phase: everyone ? "reveal" : "guess" };
    }
    if (action.type === "timeout" || action.type === "reveal") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): WavePublicView {
    const view: WavePublicView = {
      phase: state.phase,
      left: state.left,
      right: state.right,
      psychicId: state.psychicId,
      clue: state.clue,
      submittedIds: Object.keys(state.guesses),
    };
    if (state.phase === "reveal") {
      view.target = state.target;
      view.guesses = state.guesses;
    }
    return view;
  },

  privateView(state, playerId): WavePrivateView {
    const isPsychic = playerId === state.psychicId;
    return {
      isPsychic,
      target: isPsychic || state.phase === "reveal" ? state.target : null,
      myGuess: state.guesses[playerId] ?? null,
    };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const out: ScoreMap = {};
    let best = 0;
    for (const [id, guess] of Object.entries(state.guesses)) {
      const pts = closeness(guess, state.target);
      if (pts) out[id] = pts;
      best = Math.max(best, pts);
    }
    if (best >= 2) out[state.psychicId] = (out[state.psychicId] ?? 0) + 2;
    return out;
  },

  usedContentId(state) {
    return state.polesId;
  },
};
