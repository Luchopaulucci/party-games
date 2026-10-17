import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { filterByPack } from "../packs";
import { PHONE_PROMPTS } from "./prompts";

export type PhonePhase = "write" | "reveal";

export interface PhoneState {
  phase: PhonePhase;
  promptId: string;
  original: string;
  currentId: string;
  entries: { playerId: string; text: string }[];
}

export interface PhonePublicView {
  phase: PhonePhase;
  currentId: string | null;
  doneCount: number;
  chain?: { playerId: string; text: string }[];
  original?: string;
}

export interface PhonePrivateView {
  isWriter: boolean;
  previous: string | null;
}

function previousFor(state: PhoneState): string {
  const last = state.entries[state.entries.length - 1];
  return last?.text ?? state.original;
}

export const phoneEngine: GameEngine<PhoneState> = {
  id: "telefono",

  createState(ctx) {
    const prompt = ctx.seed?.prompt
      ? { id: ctx.seed.questionId ?? "seeded", text: ctx.seed.prompt }
      : pickRandom(filterByPack(PHONE_PROMPTS, ctx), ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    return {
      phase: "write",
      promptId: prompt.id,
      original: prompt.text,
      currentId: ctx.playerIds[0]!,
      entries: [],
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "write" && playerId === state.currentId) {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 3 || text.length > 180) return state;
      const entries = [...state.entries, { playerId, text }];
      const idx = ctx.playerIds.indexOf(playerId);
      const nextId = ctx.playerIds[idx + 1];
      if (!nextId) return { ...state, entries, phase: "reveal", currentId: playerId };
      return { ...state, entries, currentId: nextId };
    }
    if (action.type === "timeout" || action.type === "reveal") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): PhonePublicView {
    const view: PhonePublicView = {
      phase: state.phase,
      currentId: state.phase === "write" ? state.currentId : null,
      doneCount: state.entries.length,
    };
    if (state.phase === "reveal") {
      view.chain = state.entries;
      view.original = state.original;
    }
    return view;
  },

  privateView(state, playerId): PhonePrivateView {
    if (state.phase !== "write") return { isWriter: false, previous: null };
    const isWriter = playerId === state.currentId;
    return { isWriter, previous: isWriter ? previousFor(state) : null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const out: ScoreMap = {};
    for (const row of state.entries) out[row.playerId] = 1;
    return out;
  },

  usedContentId(state) {
    return state.promptId;
  },
};
