import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { normalize } from "../helpers";
import { filterByPack } from "../packs";
import { CHAIN_SEEDS } from "./words";

export type ChainPhase = "turn" | "reveal";

export interface ChainState {
  phase: ChainPhase;
  seedId: string;
  words: { playerId: string; text: string }[];
  currentId: string;
  maxTurns: number;
}

export interface ChainPublicView {
  phase: ChainPhase;
  currentId: string;
  lastWord: string;
  count: number;
  chain?: { playerId: string; text: string }[];
}

export interface ChainPrivateView {
  isTurn: boolean;
}

export const chainEngine: GameEngine<ChainState> = {
  id: "cadena",

  createState(ctx) {
    const seed = ctx.seed?.word
      ? { id: "seeded", word: ctx.seed.word }
      : pickRandom(filterByPack(CHAIN_SEEDS, ctx), ctx.rng, ctx.usedContentIds ?? [], (w) => w.id);
    const currentId = ctx.playerIds[0]!;
    return {
      phase: "turn",
      seedId: seed.id,
      words: [{ playerId: "mesa", text: seed.word }],
      currentId,
      maxTurns: ctx.playerIds.length * 2,
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "word" && playerId === state.currentId) {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2 || text.length > 32) return state;
      const last = state.words[state.words.length - 1]!.text;
      if (normalize(text) === normalize(last)) return state;
      const words = [...state.words, { playerId, text }];
      if (words.length - 1 >= state.maxTurns) return { ...state, words, phase: "reveal" };
      const idx = ctx.playerIds.indexOf(playerId);
      const currentId = ctx.playerIds[(idx + 1) % ctx.playerIds.length]!;
      return { ...state, words, currentId };
    }
    if (action.type === "timeout" || action.type === "reveal") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): ChainPublicView {
    const last = state.words[state.words.length - 1]!;
    const view: ChainPublicView = {
      phase: state.phase,
      currentId: state.currentId,
      lastWord: last.text,
      count: state.words.length - 1,
    };
    if (state.phase === "reveal") view.chain = state.words;
    return view;
  },

  privateView(state, playerId): ChainPrivateView {
    return { isTurn: state.phase === "turn" && playerId === state.currentId };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const out: ScoreMap = {};
    for (const row of state.words) {
      if (row.playerId === "mesa") continue;
      out[row.playerId] = (out[row.playerId] ?? 0) + 1;
    }
    return out;
  },

  usedContentId(state) {
    return state.seedId;
  },
};
