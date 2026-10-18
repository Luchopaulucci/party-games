import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { pickRandomReader } from "../../play/reader";
import { filterByPack } from "../packs";
import { WOULD_PROMPTS, type WouldPrompt } from "./prompts";

export type WouldPhase = "vote" | "reveal";

export interface WouldState {
  phase: WouldPhase;
  prompt: WouldPrompt;
  votes: Record<string, "left" | "right">;
  readerId: string;
}

export interface WouldPublicView {
  phase: WouldPhase;
  left: string;
  right: string;
  votedIds: string[];
  readerId: string;
  totals?: { left: number; right: number };
}

export interface WouldPrivateView {
  myVote: "left" | "right" | null;
  isReader: boolean;
}

export const wouldEngine: GameEngine<WouldState> = {
  id: "preferis",

  createState(ctx) {
    const prompt =
      ctx.seed?.prompt && ctx.seed.answer
        ? { id: "seeded", pack: "clasico" as const, left: ctx.seed.prompt, right: ctx.seed.answer }
        : pickRandom(filterByPack(WOULD_PROMPTS, ctx), ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    const reader = pickRandomReader(
      ctx.playerIds.map((id) => ({ id })),
      ctx.rng,
    );
    return { phase: "vote", prompt, votes: {}, readerId: reader?.id ?? ctx.playerIds[0]! };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "vote") {
      const side =
        action.payload && typeof action.payload === "object"
          ? (action.payload as { side?: unknown }).side
          : undefined;
      if (side !== "left" && side !== "right") return state;
      const pick: "left" | "right" = side;
      const votes: Record<string, "left" | "right"> = { ...state.votes, [playerId]: pick };
      const allIn = ctx.playerIds.every((id) => votes[id]);
      return { ...state, votes, phase: allIn ? "reveal" : "vote" };
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
      readerId: state.readerId,
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
    return { myVote: state.votes[playerId] ?? null, isReader: state.readerId === playerId };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(): ScoreMap {
    return {};
  },

  usedContentId(state) {
    return state.prompt.id;
  },
};
