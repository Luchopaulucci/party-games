import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { CLOSEST_QUESTIONS } from "../closest/questions";
import { filterPremises, premisesToQuestions } from "../closest/catalog";

export type AuctionPhase = "bidding" | "reveal";

export interface AuctionRank {
  playerId: string;
  bid: number;
  over: boolean;
  distance: number;
  points: number;
}

export interface AuctionState {
  phase: AuctionPhase;
  questionId: string;
  prompt: string;
  unit?: string;
  target: number;
  mode: "no-pasarse" | "cerca";
  bids: Record<string, number>;
  ranking: AuctionRank[] | null;
}

export interface AuctionPublicView {
  phase: AuctionPhase;
  prompt: string;
  unit?: string;
  mode: AuctionState["mode"];
  submittedIds: string[];
  target?: number;
  ranking?: AuctionRank[];
}

export interface AuctionPrivateView {
  bid: number | null;
}

export function scoreAuction(
  bids: Record<string, number>,
  target: number,
  mode: AuctionState["mode"],
): AuctionRank[] {
  const rows: AuctionRank[] = Object.entries(bids).map(([playerId, bid]) => ({
    playerId,
    bid,
    over: bid > target,
    distance: Math.abs(bid - target),
    points: 0,
  }));
  if (rows.length === 0) return rows;

  if (mode === "cerca") {
    rows.sort((a, b) => a.distance - b.distance || a.playerId.localeCompare(b.playerId));
    const best = rows[0]!.distance;
    for (const row of rows) {
      if (row.distance === best) row.points = rows.filter((r) => r.distance === best).length === 1 ? 3 : 2;
    }
    return rows;
  }

  const under = rows.filter((r) => !r.over);
  const pool = under.length ? under : rows;
  pool.sort((a, b) => (under.length ? b.bid - a.bid : a.bid - b.bid) || a.playerId.localeCompare(b.playerId));
  const winnerBid = pool[0]!.bid;
  for (const row of rows) {
    if (row.bid === winnerBid && (under.length ? !row.over : true)) {
      row.points = 3;
      if (row.bid === target) row.points += 2;
    }
  }
  return rows.sort((a, b) => b.points - a.points || a.distance - b.distance);
}

function pickTarget(ctx: GameContext) {
  if (ctx.seed?.trueAnswer !== undefined) {
    return {
      id: ctx.seed.questionId ?? "seeded",
      prompt: ctx.seed.prompt ?? "¿Cuánto vale?",
      answer: ctx.seed.trueAnswer,
      unit: ctx.seed.unit,
    };
  }
  const pack = premisesToQuestions(filterPremises({ categories: ctx.categories, picante: ctx.picante }));
  const pool = pack.length ? pack : CLOSEST_QUESTIONS;
  return pickRandom(pool, ctx.rng, ctx.usedContentIds ?? [], (q) => q.id);
}

export const auctionEngine: GameEngine<AuctionState> = {
  id: "subasta",

  createState(ctx) {
    const q = pickTarget(ctx);
    const mode = ctx.options?.mode === "cerca" ? "cerca" : "no-pasarse";
    return {
      phase: "bidding",
      questionId: q.id,
      prompt: q.prompt,
      unit: q.unit,
      target: q.answer,
      mode,
      bids: {},
      ranking: null,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "bid") {
      const value = Number((action.payload as { value?: unknown })?.value);
      if (!Number.isFinite(value) || state.bids[playerId] !== undefined) return state;
      const bids = { ...state.bids, [playerId]: value };
      const everyone = ctx.playerIds.every((id) => bids[id] !== undefined);
      if (!everyone) return { ...state, bids };
      return { ...state, bids, phase: "reveal", ranking: scoreAuction(bids, state.target, state.mode) };
    }
    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "reveal", ranking: scoreAuction(state.bids, state.target, state.mode) };
    }
    return state;
  },

  publicView(state): AuctionPublicView {
    const view: AuctionPublicView = {
      phase: state.phase,
      prompt: state.prompt,
      unit: state.unit,
      mode: state.mode,
      submittedIds: Object.keys(state.bids),
    };
    if (state.phase === "reveal") {
      view.target = state.target;
      view.ranking = state.ranking ?? undefined;
    }
    return view;
  },

  privateView(state, playerId): AuctionPrivateView {
    return { bid: state.bids[playerId] ?? null };
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
