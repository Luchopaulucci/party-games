import type { GameEngine, ScoreMap } from "../../types";

export type ReflexPhase = "live" | "done";

export interface ReflexStop {
  playerId: string;
  elapsed: number;
  distance: number;
}

export interface ReflexState {
  phase: ReflexPhase;
  target: number;
  started: Record<string, boolean>;
  stops: Record<string, number>;
}

export interface ReflexPublicView {
  phase: ReflexPhase;
  target: number;
  startedIds: string[];
  stoppedIds: string[];
  results?: ReflexStop[];
  winnerId?: string;
}

export interface ReflexPrivateView {
  started: boolean;
  myElapsed: number | null;
}

export function randomReflexTarget(rng: () => number): number {
  return Math.round((2 + rng() * 4) * 100) / 100;
}

function parseElapsed(payload: unknown): number | null {
  if (payload == null || typeof payload !== "object") return null;
  const raw = (payload as { elapsed?: unknown }).elapsed;
  const value = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(",", ".")) : Number.NaN;
  if (!Number.isFinite(value) || value < 0 || value > 60) return null;
  return Math.round(value * 100) / 100;
}

export const reflexEngine: GameEngine<ReflexState> = {
  id: "reflejos",

  createState(ctx) {
    const target =
      typeof ctx.seed?.target === "number" && Number.isFinite(ctx.seed.target)
        ? Math.round(ctx.seed.target * 100) / 100
        : randomReflexTarget(ctx.rng);
    return { phase: "live", target, started: {}, stops: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "done") return state;
    if (action.type === "start") {
      if (state.started[playerId] || state.stops[playerId] !== undefined) return state;
      return { ...state, started: { ...state.started, [playerId]: true } };
    }
    if (action.type === "stop") {
      if (!state.started[playerId] || state.stops[playerId] !== undefined) return state;
      const elapsed = parseElapsed(action.payload);
      if (elapsed == null) return state;
      const stops = { ...state.stops, [playerId]: elapsed };
      const everyone = ctx.playerIds.every((id) => stops[id] !== undefined);
      return { ...state, stops, phase: everyone ? "done" : "live" };
    }
    if (action.type === "timeout" || action.type === "reveal") {
      return { ...state, phase: "done" };
    }
    return state;
  },

  publicView(state): ReflexPublicView {
    const view: ReflexPublicView = {
      phase: state.phase,
      target: state.target,
      startedIds: Object.keys(state.started),
      stoppedIds: Object.keys(state.stops),
    };
    if (state.phase === "done") {
      const results = Object.entries(state.stops)
        .map(([playerId, elapsed]) => ({
          playerId,
          elapsed,
          distance: Math.round(Math.abs(elapsed - state.target) * 100) / 100,
        }))
        .sort((a, b) => a.distance - b.distance || a.playerId.localeCompare(b.playerId));
      view.results = results;
      view.winnerId = results[0]?.playerId;
    }
    return view;
  },

  privateView(state, playerId): ReflexPrivateView {
    return { started: Boolean(state.started[playerId]), myElapsed: state.stops[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "done";
  },

  scores(state): ScoreMap {
    if (state.phase !== "done") return {};
    const ranked = Object.entries(state.stops)
      .map(([id, elapsed]) => ({ id, distance: Math.abs(elapsed - state.target) }))
      .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
    if (!ranked[0]) return {};
    return { [ranked[0].id]: 3 };
  },
};
