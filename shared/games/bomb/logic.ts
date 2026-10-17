import type { GameEngine, ScoreMap } from "../../types";

export type BombPhase = "live" | "boom";

export interface BombState {
  phase: BombPhase;
  holderId: string;
  explodeAt: number;
  passes: number;
}

export interface BombPublicView {
  phase: BombPhase;
  holderId: string;
  passes: number;
}

export interface BombPrivateView {
  holding: boolean;
}

export const bombEngine: GameEngine<BombState> = {
  id: "bombita",

  createState(ctx) {
    const now = ctx.now?.() ?? Date.now();
    const fuse = 7000 + Math.floor(ctx.rng() * 16000);
    const holderId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[0]!;
    return { phase: "live", holderId, explodeAt: ctx.seed?.min ? now + ctx.seed.min : now + fuse, passes: 0 };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "boom") return state;
    const now = ctx.now?.() ?? Date.now();
    if (now >= state.explodeAt || action.type === "timeout") {
      return { ...state, phase: "boom" };
    }
    if (action.type === "pass" && playerId === state.holderId) {
      const idx = ctx.playerIds.indexOf(state.holderId);
      const next = ctx.playerIds[(idx + 1) % ctx.playerIds.length]!;
      return { ...state, holderId: next, passes: state.passes + 1 };
    }
    if (action.type === "tick") {
      if (now >= state.explodeAt) return { ...state, phase: "boom" };
    }
    return state;
  },

  publicView(state): BombPublicView {
    return { phase: state.phase, holderId: state.holderId, passes: state.passes };
  },

  privateView(_state, playerId): BombPrivateView {
    return { holding: _state.holderId === playerId && _state.phase === "live" };
  },

  isFinished(state) {
    return state.phase === "boom";
  },

  scores(state): ScoreMap {
    if (state.phase !== "boom") return {};
    return { [state.holderId]: -1 };
  },
};
