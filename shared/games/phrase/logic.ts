import type { GameEngine, ScoreMap } from "../../types";
import { pickRandom, shuffle } from "../../rng";
import { normalize, sameText, totalsFromVotes } from "../helpers";
import { PHRASE_PROMPTS } from "./prompts";

export type PhrasePhase = "write" | "vote" | "reveal";

export interface PhraseAnswer {
  id: string;
  playerId: string;
  text: string;
}

export interface PhraseState {
  phase: PhrasePhase;
  promptId: string;
  prompt: string;
  answers: PhraseAnswer[];
  votes: Record<string, string>;
}

export interface PhrasePublicView {
  phase: PhrasePhase;
  prompt: string;
  submittedIds: string[];
  answers?: { id: string; text: string; playerId?: string }[];
  totals?: { id: string; count: number }[];
}

export interface PhrasePrivateView {
  myAnswer: string | null;
  myVote: string | null;
}

export const phraseEngine: GameEngine<PhraseState> = {
  id: "completa-frase",

  createState(ctx) {
    const prompt = ctx.seed?.prompt
      ? { id: ctx.seed.questionId ?? "seeded", prompt: ctx.seed.prompt }
      : pickRandom(PHRASE_PROMPTS, ctx.rng, ctx.usedContentIds ?? [], (p) => p.id);
    return { phase: "write", promptId: prompt.id, prompt: prompt.prompt, answers: [], votes: {} };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "write" && state.phase === "write") {
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2 || text.length > 140) return state;
      if (state.answers.some((a) => a.playerId === playerId)) return state;
      const answers = [...state.answers, { id: `a-${playerId}`, playerId, text }];
      const everyone = ctx.playerIds.every((id) => answers.some((a) => a.playerId === id));
      return { ...state, answers, phase: everyone ? "vote" : "write" };
    }

    if (action.type === "vote" && state.phase === "vote") {
      const answerId = String((action.payload as { answerId?: unknown })?.answerId ?? "");
      const target = state.answers.find((a) => a.id === answerId);
      if (!target || target.playerId === playerId) return state;
      return { ...state, votes: { ...state.votes, [playerId]: answerId } };
    }

    if (action.type === "reveal" || action.type === "timeout") {
      return { ...state, phase: "reveal" };
    }
    return state;
  },

  publicView(state): PhrasePublicView {
    const view: PhrasePublicView = {
      phase: state.phase,
      prompt: state.prompt,
      submittedIds: state.phase === "write" ? state.answers.map((a) => a.playerId) : Object.keys(state.votes),
    };
    if (state.phase === "vote") {
      view.answers = shuffle(
        state.answers.map((a) => ({ id: a.id, text: a.text })),
        () => 0.5,
      ).sort((a, b) => a.id.localeCompare(b.id));
    }
    if (state.phase === "reveal") {
      view.answers = state.answers.map((a) => ({ id: a.id, text: a.text, playerId: a.playerId }));
      view.totals = totalsFromVotes(state.votes);
    }
    return view;
  },

  privateView(state, playerId): PhrasePrivateView {
    return {
      myAnswer: state.answers.find((a) => a.playerId === playerId)?.text ?? null,
      myVote: state.votes[playerId] ?? null,
    };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state): ScoreMap {
    if (state.phase !== "reveal") return {};
    const out: ScoreMap = {};
    const texts = state.answers.map((a) => normalize(a.text));
    for (const a of state.answers) {
      const jinx = texts.filter((t) => t === normalize(a.text)).length > 1;
      if (jinx) continue;
      const votes = Object.values(state.votes).filter((id) => id === a.id).length;
      if (votes) out[a.playerId] = votes;
    }
    return out;
  },

  usedContentId(state) {
    return state.promptId;
  },
};

export function phraseJinx(a: string, b: string): boolean {
  return sameText(a, b);
}
