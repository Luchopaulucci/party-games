import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { pickRandomReader } from "../../play/reader";
import { VOTE_PROMPTS } from "./prompts";

export type VotePhase = "voting" | "reveal";

export interface VoteState {
  phase: VotePhase;
  promptId: string;
  prompt: string;
  votes: Record<string, string>;
  readerId: string;
}

export interface VoteTotal {
  playerId: string;
  count: number;
}

export interface VotePublicView {
  phase: VotePhase;
  prompt: string;
  votedIds: string[];
  readerId: string;
  totals?: VoteTotal[];
}

export interface VotePrivateView {
  myVote: string | null;
  isReader: boolean;
}

function pickPrompt(ctx: GameContext) {
  if (ctx.seed?.prompt) {
    return { id: ctx.seed.questionId ?? "seeded", prompt: ctx.seed.prompt };
  }
  return pickRandom(VOTE_PROMPTS, ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
}

export function voteTotals(votes: Record<string, string>): VoteTotal[] {
  const counts: Record<string, number> = {};
  for (const target of Object.values(votes)) {
    counts[target] = (counts[target] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([playerId, votesCount]) => ({ playerId, count: votesCount }))
    .sort((a, b) => b.count - a.count || a.playerId.localeCompare(b.playerId));
}

function parseTarget(payload: unknown, playerIds: string[]): string | null {
  if (payload == null || typeof payload !== "object") return null;
  const target = (payload as { targetId?: unknown }).targetId;
  return typeof target === "string" && playerIds.includes(target) ? target : null;
}

export const voteEngine: GameEngine<VoteState> = {
  id: "votacion",

  createState(ctx) {
    const prompt = pickPrompt(ctx);
    const reader = pickRandomReader(
      ctx.playerIds.map((id) => ({ id })),
      ctx.rng,
    );
    return {
      phase: "voting",
      promptId: prompt.id,
      prompt: prompt.prompt,
      votes: {},
      readerId: reader?.id ?? ctx.playerIds[0]!,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "vote") {
      const target = parseTarget(action.payload, ctx.playerIds);
      if (!target) return state;
      const votes = { ...state.votes, [playerId]: target };
      const allIn = ctx.playerIds.every((id) => votes[id]);
      return { ...state, votes, phase: allIn ? "reveal" : "voting" };
    }

    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "reveal" };
    }

    return state;
  },

  publicView(state): VotePublicView {
    const view: VotePublicView = {
      phase: state.phase,
      prompt: state.prompt,
      votedIds: Object.keys(state.votes),
      readerId: state.readerId,
    };
    if (state.phase === "reveal") {
      view.totals = voteTotals(state.votes);
    }
    return view;
  },

  privateView(state, playerId): VotePrivateView {
    return { myVote: state.votes[playerId] ?? null, isReader: state.readerId === playerId };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const totals = voteTotals(state.votes);
    if (totals.length === 0) return {};
    const best = totals[0]!.count;
    const out: ScoreMap = {};
    for (const row of totals) {
      if (row.count === best) out[row.playerId] = 1;
    }
    return out;
  },

  usedContentId(state) {
    return state.promptId;
  },
};
