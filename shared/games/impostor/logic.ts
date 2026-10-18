import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom, shuffle } from "../../rng";
import { optionNumber } from "../helpers";
import { IMPOSTOR_WORDS } from "./words";

export type ImpostorPhase = "discuss" | "vote" | "reveal";

export interface ImpostorState {
  phase: ImpostorPhase;
  wordId: string;
  word: string;
  category: string;
  impostorIds: string[];
  votes: Record<string, string>;
  wordGuess: { by: string; text: string; correct: boolean } | null;
  scores: ScoreMap;
}

export interface ImpostorPublicView {
  phase: ImpostorPhase;
  category: string;
  votedIds: string[];
  impostorCount: number;
  word?: string;
  impostorIds?: string[];
  totals?: { playerId: string; count: number }[];
  wordGuess?: ImpostorState["wordGuess"];
  scores?: ScoreMap;
}

export interface ImpostorPrivateView {
  role: "crew" | "impostor";
  word: string | null;
  category: string;
}

function impostorCountFor(size: number): number {
  if (size >= 8) return 2;
  return 1;
}

function pickWord(ctx: GameContext) {
  if (ctx.seed?.word) {
    return {
      id: "seeded",
      word: ctx.seed.word,
      category: ctx.seed.category ?? "prueba",
    };
  }
  return pickRandom(IMPOSTOR_WORDS, ctx.rng, ctx.usedContentIds ?? [], (w) => w.id);
}

function pickImpostors(ctx: GameContext): string[] {
  if (ctx.seed?.impostorIds?.length) {
    return ctx.seed.impostorIds.filter((id) => ctx.playerIds.includes(id));
  }
  const requested = optionNumber(ctx.options?.impostorCount, 0, 0, 2);
  const count = Math.min(
    requested || impostorCountFor(ctx.playerIds.length),
    Math.max(1, ctx.playerIds.length - 1),
  );
  return shuffle(ctx.playerIds, ctx.rng).slice(0, count);
}

export function tallyVotes(votes: Record<string, string>): { accused: string | null; counts: Record<string, number> } {
  const counts: Record<string, number> = {};
  for (const accused of Object.values(votes)) {
    counts[accused] = (counts[accused] ?? 0) + 1;
  }
  let best = 0;
  const leaders: string[] = [];
  for (const [id, n] of Object.entries(counts)) {
    if (n > best) {
      best = n;
      leaders.length = 0;
      leaders.push(id);
    } else if (n === best) {
      leaders.push(id);
    }
  }
  return { accused: leaders.length === 1 ? leaders[0]! : null, counts };
}

export function scoreImpostorRound(state: Pick<ImpostorState, "impostorIds" | "votes" | "wordGuess">): ScoreMap {
  const scores: ScoreMap = {};
  const { accused } = tallyVotes(state.votes);
  const caught = accused !== null && state.impostorIds.includes(accused);

  if (caught) {
    for (const [voter, target] of Object.entries(state.votes)) {
      if (state.impostorIds.includes(target) && !state.impostorIds.includes(voter)) {
        scores[voter] = (scores[voter] ?? 0) + 1;
      }
    }
    for (const id of Object.keys(state.votes).concat(state.impostorIds)) {
      if (!state.impostorIds.includes(id)) {
        scores[id] = (scores[id] ?? 0) + 2;
      }
    }
  } else {
    for (const id of state.impostorIds) {
      scores[id] = (scores[id] ?? 0) + 4;
    }
  }

  if (state.wordGuess?.correct) {
    scores[state.wordGuess.by] = (scores[state.wordGuess.by] ?? 0) + 3;
  }

  return scores;
}

export const impostorEngine: GameEngine<ImpostorState> = {
  id: "impostor",

  createState(ctx) {
    const word = pickWord(ctx);
    return {
      phase: "discuss",
      wordId: word.id,
      word: word.word,
      category: word.category,
      impostorIds: pickImpostors(ctx),
      votes: {},
      wordGuess: null,
      scores: {},
    };
  },

  reduce(state, action, playerId) {
    if (state.phase === "reveal") return state;

    if (action.type === "guess-word" && state.phase === "discuss") {
      if (!state.impostorIds.includes(playerId)) return state;
      if (state.wordGuess) return state;
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 2) return state;
      const correct =
        text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") ===
        state.word.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      const wordGuess = { by: playerId, text, correct };
      if (correct) {
        const next = { ...state, wordGuess, phase: "reveal" as const };
        return { ...next, scores: scoreImpostorRound(next) };
      }
      return { ...state, wordGuess };
    }

    if (action.type === "open-vote" && state.phase === "discuss") {
      return { ...state, phase: "vote" };
    }

    if (action.type === "vote" && state.phase === "vote") {
      const target = String((action.payload as { targetId?: unknown })?.targetId ?? "");
      if (!target || target === playerId) return state;
      return { ...state, votes: { ...state.votes, [playerId]: target } };
    }

    if ((action.type === "reveal" || action.type === "timeout") && state.phase === "vote") {
      const next = { ...state, phase: "reveal" as const };
      return { ...next, scores: scoreImpostorRound(next) };
    }
    if (action.type === "timeout" && state.phase === "discuss") {
      return { ...state, phase: "vote" };
    }

    return state;
  },

  publicView(state): ImpostorPublicView {
    const view: ImpostorPublicView = {
      phase: state.phase,
      category: state.category,
      votedIds: Object.keys(state.votes),
      impostorCount: state.impostorIds.length,
    };
    if (state.phase === "reveal") {
      view.word = state.word;
      view.impostorIds = state.impostorIds;
      view.wordGuess = state.wordGuess;
      view.scores = state.scores;
      const { counts } = tallyVotes(state.votes);
      view.totals = Object.entries(counts).map(([playerId, count]) => ({ playerId, count }));
    }
    return view;
  },

  privateView(state, playerId): ImpostorPrivateView {
    const isImpostor = state.impostorIds.includes(playerId);
    if (isImpostor && state.phase !== "reveal") {
      return { role: "impostor", word: null, category: state.category };
    }
    return {
      role: isImpostor ? "impostor" : "crew",
      word: state.word,
      category: state.category,
    };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state) {
    return state.phase === "reveal" ? state.scores : {};
  },

  usedContentId(state) {
    return state.wordId;
  },
};
