import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom } from "../../rng";
import { NEVER_PROMPTS } from "./prompts";

export type NeverPhase = "tap" | "reveal";

export interface NeverState {
  phase: NeverPhase;
  promptId: string;
  prompt: string;
  choices: Record<string, "si" | "no">;
}

export interface NeverPublicView {
  phase: NeverPhase;
  prompt: string;
  tappedIds: string[];
  yesCount?: number;
  noCount?: number;
}

export interface NeverPrivateView {
  myChoice: "si" | "no" | null;
}

export const neverEngine: GameEngine<NeverState> = {
  id: "yo-nunca",

  createState(ctx) {
    const item = ctx.seed?.prompt
      ? { id: ctx.seed.questionId ?? "seeded", prompt: ctx.seed.prompt }
      : pickRandom(NEVER_PROMPTS, ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    return { phase: "tap", promptId: item.id, prompt: item.prompt, choices: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;
    if (action.type === "choose") {
      const raw = String((action.payload as { value?: unknown })?.value ?? "");
      if (raw !== "si" && raw !== "no") return state;
      const value: "si" | "no" = raw;
      const choices = { ...state.choices, [playerId]: value };
      const everyone = ctx.playerIds.every((id) => choices[id] !== undefined);
      return { ...state, choices, phase: everyone ? "reveal" : "tap" };
    }
    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): NeverPublicView {
    const view: NeverPublicView = {
      phase: state.phase,
      prompt: state.prompt,
      tappedIds: Object.keys(state.choices),
    };
    if (state.phase === "reveal") {
      const values = Object.values(state.choices);
      view.yesCount = values.filter((v) => v === "si").length;
      view.noCount = values.filter((v) => v === "no").length;
    }
    return view;
  },

  privateView(state, playerId): NeverPrivateView {
    return { myChoice: state.choices[playerId] ?? null };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const out: ScoreMap = {};
    for (const [id, choice] of Object.entries(state.choices)) {
      if (choice === "si") out[id] = 1;
    }
    return out;
  },

  usedContentId(state) {
    return state.promptId;
  },
};
