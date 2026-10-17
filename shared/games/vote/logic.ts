import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { VOTE_PROMPTS } from "./prompts";

export type VotePhase = "voting" | "reveal";

export interface VoteState {
  phase: VotePhase;
  promptId: string;
  prompt: string;
  votes: Record<string, string>;
}

export interface VoteTotal {
  playerId: string;
  count: number;
}

export interface VotePublicView {
  phase: VotePhase;
  prompt: string;
  votedIds: string[];
  totals?: VoteTotal[];
}

export interface VotePrivateView {
  myVote: string | null;
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

export const voteEngine: GameEngine<VoteState> = {
  id: "votacion",

  createState(ctx) {
    const prompt = pickPrompt(ctx);
    return {
      phase: "voting",
      promptId: prompt.id,
      prompt: prompt.prompt,
      votes: {},
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "vote") {
      const target = String((action.payload as { targetId?: unknown })?.targetId ?? "");
      if (!target || !ctx.playerIds.includes(target)) return state;
      return { ...state, votes: { ...state.votes, [playerId]: target } };
    }

    if (action.type === "reveal") {
      return { ...state, phase: "reveal" };
    }

    return state;
  },

  publicView(state): VotePublicView {
    const view: VotePublicView = {
      phase: state.phase,
      prompt: state.prompt,
      votedIds: Object.keys(state.votes),
    };
    if (state.phase === "reveal") {
      view.totals = voteTotals(state.votes);
    }
    return view;
  },

  privateView(state, playerId): VotePrivateView {
    return { myVote: state.votes[playerId] ?? null };
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
