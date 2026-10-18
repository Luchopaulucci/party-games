import type { GameEngine, ScoreMap } from "../../types";
import { totalsFromVotes } from "../helpers";

export type LiePhase = "write" | "vote" | "reveal";

export interface LieState {
  phase: LiePhase;
  storytellerId: string;
  statements: string[];
  lieIndex: number | null;
  votes: Record<string, string>;
}

export interface LiePublicView {
  phase: LiePhase;
  storytellerId: string;
  statements?: string[];
  submitted: boolean;
  votedIds: string[];
  lieIndex?: number;
  totals?: { id: string; count: number }[];
}

export interface LiePrivateView {
  isStoryteller: boolean;
  lieIndex: number | null;
  myVote: string | null;
}

function parseWrite(payload: unknown): { statements: string[]; lieIndex: number } | null {
  if (payload == null || typeof payload !== "object") return null;
  const raw = payload as { statements?: unknown; lieIndex?: unknown };
  if (!Array.isArray(raw.statements)) return null;
  const statements = raw.statements.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
  const lieIndex = typeof raw.lieIndex === "number" ? raw.lieIndex : Number(raw.lieIndex);
  if (statements.length !== 3 || ![0, 1, 2].includes(lieIndex)) return null;
  return { statements, lieIndex };
}

function parseVoteIndex(payload: unknown): string | null {
  if (payload == null || typeof payload !== "object") return null;
  const raw = (payload as { index?: unknown }).index;
  const index = String(raw ?? "");
  return ["0", "1", "2"].includes(index) ? index : null;
}

export const lieEngine: GameEngine<LieState> = {
  id: "mentira",

  createState(ctx) {
    const storytellerId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
    return { phase: "write", storytellerId, statements: [], lieIndex: null, votes: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "write" && state.phase === "write") {
      if (playerId !== state.storytellerId) return state;
      const parsed = parseWrite(action.payload);
      if (!parsed) return state;
      if (ctx.seed?.lieIndex !== undefined && ctx.seed.answers) {
        return { ...state, statements: ctx.seed.answers, lieIndex: ctx.seed.lieIndex, phase: "vote" };
      }
      return { ...state, statements: parsed.statements, lieIndex: parsed.lieIndex, phase: "vote" };
    }

    if (action.type === "vote" && state.phase === "vote") {
      if (playerId === state.storytellerId) return state;
      const index = parseVoteIndex(action.payload);
      if (!index) return state;
      const votes = { ...state.votes, [playerId]: index };
      const needed = ctx.playerIds.filter((id) => id !== state.storytellerId);
      const allIn = needed.every((id) => votes[id]);
      return { ...state, votes, phase: allIn ? "reveal" : "vote" };
    }

    if ((action.type === "reveal" || action.type === "timeout") && state.phase === "vote") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): LiePublicView {
    const view: LiePublicView = {
      phase: state.phase,
      storytellerId: state.storytellerId,
      submitted: state.statements.length === 3,
      votedIds: Object.keys(state.votes),
    };
    if (state.phase !== "write") view.statements = state.statements;
    if (state.phase === "reveal") {
      view.lieIndex = state.lieIndex ?? undefined;
      view.totals = totalsFromVotes(state.votes);
    }
    return view;
  },

  privateView(state, playerId): LiePrivateView {
    const isStoryteller = playerId === state.storytellerId;
    return {
      isStoryteller,
      lieIndex: isStoryteller || state.phase === "reveal" ? state.lieIndex : null,
      myVote: state.votes[playerId] ?? null,
    };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal" || state.lieIndex === null) return {};
    const out: ScoreMap = {};
    const lie = String(state.lieIndex);
    let fooled = 0;
    for (const [voter, pick] of Object.entries(state.votes)) {
      if (pick === lie) out[voter] = 2;
      else fooled += 1;
    }
    if (fooled) out[state.storytellerId] = fooled;
    return out;
  },
};
