import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { filterByPack } from "../packs";
import { DARE_CARDS, type DareCard } from "./cards";

export type DarePhase = "pick" | "card" | "reveal";
export type DareChoice = "verdad" | "reto";
export type DareVote = "cumplio" | "chanto";

export interface DareState {
  phase: DarePhase;
  chooserId: string;
  choice: DareChoice | null;
  card: DareCard | null;
  votes: Record<string, DareVote>;
}

export interface DarePublicView {
  phase: DarePhase;
  chooserId: string;
  choice: DareChoice | null;
  card: DareCard | null;
  votedIds: string[];
  totals?: { cumplio: number; chanto: number };
}

export interface DarePrivateView {
  isChooser: boolean;
  myVote: DareVote | null;
}

function pickCard(kind: DareChoice, ctx: Parameters<GameEngine<DareState>["createState"]>[0]): DareCard {
  if (ctx.seed?.prompt) {
    return { id: ctx.seed.questionId ?? "seeded", pack: "clasico", kind, text: ctx.seed.prompt };
  }
  const pool = filterByPack(DARE_CARDS, ctx).filter((c) => c.kind === kind);
  return pickRandom(pool.length ? pool : DARE_CARDS.filter((c) => c.kind === kind), ctx.rng, ctx.usedContentIds ?? [], (c) => c.id);
}

export const dareEngine: GameEngine<DareState> = {
  id: "verdad-reto",

  createState(ctx) {
    const chooserId =
      ctx.seed?.targetId && ctx.playerIds.includes(ctx.seed.targetId)
        ? ctx.seed.targetId
        : ctx.playerIds[Math.floor(ctx.rng() * ctx.playerIds.length)]!;
    return { phase: "pick", chooserId, choice: null, card: null, votes: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "pick" && playerId === state.chooserId && state.phase === "pick") {
      const choice = (action.payload as { choice?: unknown })?.choice;
      if (choice !== "verdad" && choice !== "reto") return state;
      return { ...state, phase: "card", choice, card: pickCard(choice, ctx) };
    }
    if (action.type === "vote" && state.phase === "card" && playerId !== state.chooserId) {
      const value = (action.payload as { value?: unknown })?.value;
      if (value !== "cumplio" && value !== "chanto") return state;
      return { ...state, votes: { ...state.votes, [playerId]: value } };
    }
    if ((action.type === "reveal" || action.type === "timeout") && state.phase === "card") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): DarePublicView {
    const view: DarePublicView = {
      phase: state.phase,
      chooserId: state.chooserId,
      choice: state.choice,
      card: state.card,
      votedIds: Object.keys(state.votes),
    };
    if (state.phase === "reveal") {
      const values = Object.values(state.votes);
      view.totals = {
        cumplio: values.filter((v) => v === "cumplio").length,
        chanto: values.filter((v) => v === "chanto").length,
      };
    }
    return view;
  },

  privateView(state, playerId): DarePrivateView {
    return { isChooser: playerId === state.chooserId, myVote: state.votes[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const values = Object.values(state.votes);
    const cumplio = values.filter((v) => v === "cumplio").length;
    const chanto = values.filter((v) => v === "chanto").length;
    const out: ScoreMap = {};
    if (cumplio > chanto) out[state.chooserId] = 2;
    else if (chanto > cumplio) out[state.chooserId] = 0;
    else out[state.chooserId] = 1;
    return out;
  },

  usedContentId(state) {
    return state.card?.id;
  },
};
