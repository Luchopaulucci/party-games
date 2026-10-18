import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { filterByPack } from "../packs";
import { WOULD_PROMPTS, type WouldPrompt } from "./prompts";

export type WouldPhase = "vote" | "reveal";

export interface WouldState {
  phase: WouldPhase;
  prompt: WouldPrompt;
  votes: Record<string, "left" | "right">;
}

export interface WouldPublicView {
  phase: WouldPhase;
  left: string;
  right: string;
  votedIds: string[];
  totals?: { left: number; right: number };
}

export interface WouldPrivateView {
  myVote: "left" | "right" | null;
}

export const wouldEngine: GameEngine<WouldState> = {
  id: "preferis",

  createState(ctx) {
    const prompt =
      ctx.seed?.prompt && ctx.seed.answer
        ? { id: "seeded", pack: "clasico" as const, left: ctx.seed.prompt, right: ctx.seed.answer }
        : pickRandom(filterByPack(WOULD_PROMPTS, ctx), ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    return { phase: "vote", prompt, votes: {} };
  },

  reduce(state, action, playerId) {
    if (state.phase === "reveal") return state;
    if (action.type === "vote") {
      const side = (action.payload as { side?: unknown })?.side;
      if (side !== "left" && side !== "right") return state;
      return { ...state, votes: { ...state.votes, [playerId]: side } };
    }
    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): WouldPublicView {
    const view: WouldPublicView = {
      phase: state.phase,
      left: state.prompt.left,
      right: state.prompt.right,
      votedIds: Object.keys(state.votes),
    };
    if (state.phase === "reveal") {
      const values = Object.values(state.votes);
      view.totals = {
        left: values.filter((v) => v === "left").length,
        right: values.filter((v) => v === "right").length,
      };
    }
    return view;
  },

  privateView(state, playerId): WouldPrivateView {
    return { myVote: state.votes[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const values = Object.values(state.votes);
    const left = values.filter((v) => v === "left").length;
    const right = values.filter((v) => v === "right").length;
    const winner = left === right ? null : left > right ? "left" : "right";
    if (!winner) return Object.fromEntries(Object.keys(state.votes).map((id) => [id, 1]));
    const out: ScoreMap = {};
    for (const [id, side] of Object.entries(state.votes)) {
      if (side === winner) out[id] = 2;
    }
    return out;
  },

  usedContentId(state) {
    return state.prompt.id;
  },
};
