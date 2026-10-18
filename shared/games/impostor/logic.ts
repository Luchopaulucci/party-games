import type { GameAction, GameContext, GameEngine, ScoreMap } from "../../types";
import { isClockPreset } from "../../play/clock";
import { pickRandom, shuffle } from "../../rng";
import { optionNumber } from "../helpers";
import { IMPOSTOR_WORDS } from "./words";

export type ImpostorPhase = "role" | "discuss" | "vote" | "reveal";

export interface ImpostorState {
  phase: ImpostorPhase;
  wordId: string;
  word: string;
  category: string;
  impostorIds: string[];
  readyIds: string[];
  discussSec: number;
  votes: Record<string, string>;
  accusedId: string | null;
  wordGuess: { by: string; text: string; correct: boolean } | null;
  scores: ScoreMap;
}

export interface ImpostorPublicView {
  phase: ImpostorPhase;
  category: string;
  impostorCount: number;
  readyIds: string[];
  votedIds: string[];
  discussSec: number;
  word?: string;
  impostorIds?: string[];
  accusedId?: string;
  totals?: { playerId: string; count: number }[];
  wordGuess?: ImpostorState["wordGuess"];
  scores?: ScoreMap;
}

export interface ImpostorPrivateView {
  role: "crew" | "impostor";
  isImpostor: boolean;
  word: string | null;
  category: string;
  ready: boolean;
}

/** Always a minority: impostors < the rest. 2 players is the only 1–1 exception. */
export function maxImpostorCount(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

export function clampImpostorCount(requested: number | undefined, playerCount: number): number {
  const max = maxImpostorCount(playerCount);
  const fallback = playerCount >= 8 ? Math.min(2, max) : 1;
  const n = requested && requested > 0 ? requested : fallback;
  return Math.min(Math.max(1, Math.floor(n)), max);
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
  const count = clampImpostorCount(optionNumber(ctx.options?.impostorCount, 0, 0, 8), ctx.playerIds.length);
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

export function scoreImpostorRound(state: Pick<ImpostorState, "impostorIds" | "votes" | "wordGuess" | "accusedId">): ScoreMap {
  const scores: ScoreMap = {};
  const fromVotes = tallyVotes(state.votes);
  const accused = state.accusedId ?? fromVotes.accused;
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

function textFrom(payload: unknown): string {
  if (payload == null || typeof payload !== "object") return "";
  const text = (payload as { text?: unknown }).text;
  return typeof text === "string" ? text.trim() : "";
}

function targetFrom(payload: unknown): string {
  if (payload == null || typeof payload !== "object") return "";
  const raw = (payload as { targetId?: unknown }).targetId;
  return typeof raw === "string" ? raw : "";
}

function finish(state: ImpostorState, extra: Partial<ImpostorState> = {}): ImpostorState {
  const next = { ...state, ...extra, phase: "reveal" as const };
  return { ...next, scores: scoreImpostorRound(next) };
}

export const impostorEngine: GameEngine<ImpostorState> = {
  id: "impostor",

  createState(ctx) {
    const word = pickWord(ctx);
    const timer = ctx.options?.timerSec;
    return {
      phase: "role",
      wordId: word.id,
      word: word.word,
      category: word.category,
      impostorIds: pickImpostors(ctx),
      readyIds: [],
      discussSec: isClockPreset(timer) ? timer : 0,
      votes: {},
      accusedId: null,
      wordGuess: null,
      scores: {},
    };
  },

  reduce(state, action, playerId, ctx) {
    if (state.phase === "reveal") return state;

    if (action.type === "set-clock" && state.phase === "role") {
      const seconds = Number((action.payload as { seconds?: unknown } | undefined)?.seconds);
      if (!isClockPreset(seconds)) return state;
      return { ...state, discussSec: seconds };
    }

    if (action.type === "ready" && state.phase === "role") {
      if (state.readyIds.includes(playerId)) return state;
      const readyIds = [...state.readyIds, playerId];
      if (ctx.playerIds.every((id) => readyIds.includes(id))) {
        return { ...state, readyIds, phase: "discuss" };
      }
      return { ...state, readyIds };
    }

    if (action.type === "guess-word" && (state.phase === "role" || state.phase === "discuss")) {
      if (!state.impostorIds.includes(playerId)) return state;
      if (state.wordGuess) return state;
      const text = textFrom(action.payload);
      if (text.length < 2) return state;
      const correct =
        text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") ===
        state.word.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      const wordGuess = { by: playerId, text, correct };
      if (correct) return finish(state, { wordGuess });
      return { ...state, wordGuess };
    }

    if (action.type === "open-vote" && state.phase === "discuss") {
      return { ...state, phase: "vote" };
    }

    if (action.type === "accuse" && (state.phase === "discuss" || state.phase === "vote")) {
      const target = targetFrom(action.payload);
      if (!target || target === playerId || !ctx.playerIds.includes(target)) return state;
      return finish(state, { accusedId: target, votes: { ...state.votes, [playerId]: target } });
    }

    if (action.type === "vote" && state.phase === "vote") {
      const target = targetFrom(action.payload);
      if (!target || target === playerId || !ctx.playerIds.includes(target)) return state;
      const votes = { ...state.votes, [playerId]: target };
      if (ctx.playerIds.every((id) => votes[id])) return finish(state, { votes });
      return { ...state, votes };
    }

    if ((action.type === "reveal" || action.type === "timeout") && state.phase === "vote") {
      return finish(state);
    }
    if (action.type === "timeout" && state.phase === "discuss") {
      return { ...state, phase: "vote" };
    }
    if (action.type === "reveal" && state.phase === "discuss") {
      return finish(state);
    }

    return state;
  },

  publicView(state): ImpostorPublicView {
    const view: ImpostorPublicView = {
      phase: state.phase,
      category: state.category,
      impostorCount: state.impostorIds.length,
      readyIds: state.readyIds,
      votedIds: Object.keys(state.votes),
      discussSec: state.discussSec,
    };
    if (state.phase === "reveal") {
      view.word = state.word;
      view.impostorIds = state.impostorIds;
      view.accusedId = state.accusedId ?? undefined;
      view.wordGuess = state.wordGuess;
      view.scores = state.scores;
      const { counts } = tallyVotes(state.votes);
      view.totals = Object.entries(counts).map(([playerId, count]) => ({ playerId, count }));
    }
    return view;
  },

  privateView(state, playerId): ImpostorPrivateView {
    const isImpostor = state.impostorIds.includes(playerId);
    return {
      role: isImpostor ? "impostor" : "crew",
      isImpostor,
      word: isImpostor && state.phase !== "reveal" ? null : state.word,
      category: state.category,
      ready: state.readyIds.includes(playerId),
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

export function isImpostorAction(action: GameAction): boolean {
  return ["ready", "set-clock", "guess-word", "open-vote", "vote", "accuse", "reveal"].includes(action.type);
}
