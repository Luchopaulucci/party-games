import type { GameContext, GameEngine, ScoreMap } from "../../types";
import { pickRandom, shuffle } from "../../rng";
import { optionNumber } from "../helpers";
import { SPY_LOCATIONS } from "./locations";
import { tallyVotes } from "../impostor/logic";

export type SpyPhase = "discuss" | "vote" | "reveal";

export interface SpyState {
  phase: SpyPhase;
  locationId: string;
  location: string;
  spyIds: string[];
  jobs: Record<string, string>;
  votes: Record<string, string>;
  locationGuess: { by: string; text: string; correct: boolean } | null;
  scores: ScoreMap;
}

export interface SpyPublicView {
  phase: SpyPhase;
  votedIds: string[];
  spyCount: number;
  location?: string;
  spyIds?: string[];
  locationGuess?: SpyState["locationGuess"];
  totals?: { playerId: string; votes: number }[];
  scores?: ScoreMap;
}

export interface SpyPrivateView {
  role: "civil" | "espia";
  location: string | null;
  job: string | null;
}

function pickLocation(ctx: GameContext) {
  if (ctx.seed?.location) {
    return {
      id: "seeded",
      name: ctx.seed.location,
      roles: ["el de la pinza", "el de guardia", "el extra", "el de backup", "el de la radio", "el que sirve café"],
    };
  }
  return pickRandom(SPY_LOCATIONS, ctx.rng, ctx.usedContentIds ?? [], (l) => l.id);
}

function pickSpies(ctx: GameContext): string[] {
  if (ctx.seed?.spyIds?.length) {
    return ctx.seed.spyIds.filter((id) => ctx.playerIds.includes(id));
  }
  const requested = optionNumber(ctx.options?.spyCount, 0, 0, 2);
  const count = Math.min(requested || 1, Math.max(1, ctx.playerIds.length - 1));
  return shuffle(ctx.playerIds, ctx.rng).slice(0, count);
}

function assignJobs(ctx: GameContext, roles: string[], spyIds: string[]): Record<string, string> {
  const jobs: Record<string, string> = {};
  const pool = shuffle(roles, ctx.rng);
  let i = 0;
  for (const id of ctx.playerIds) {
    if (spyIds.includes(id)) continue;
    jobs[id] = pool[i % pool.length]!;
    i += 1;
  }
  return jobs;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function scoreSpyRound(state: Pick<SpyState, "spyIds" | "votes" | "locationGuess">): ScoreMap {
  const scores: ScoreMap = {};
  const { accused } = tallyVotes(state.votes);
  const caught = accused !== null && state.spyIds.includes(accused);

  if (caught) {
    for (const [voter, target] of Object.entries(state.votes)) {
      if (state.spyIds.includes(target) && !state.spyIds.includes(voter)) {
        scores[voter] = (scores[voter] ?? 0) + 1;
      }
    }
    for (const id of Object.keys(state.votes)) {
      if (!state.spyIds.includes(id)) scores[id] = (scores[id] ?? 0) + 2;
    }
  } else {
    for (const id of state.spyIds) scores[id] = (scores[id] ?? 0) + 4;
  }

  if (state.locationGuess?.correct) {
    scores[state.locationGuess.by] = (scores[state.locationGuess.by] ?? 0) + 3;
  }
  return scores;
}

export const spyEngine: GameEngine<SpyState> = {
  id: "espia",

  createState(ctx) {
    const location = pickLocation(ctx);
    const spyIds = pickSpies(ctx);
    return {
      phase: "discuss",
      locationId: location.id,
      location: location.name,
      spyIds,
      jobs: assignJobs(ctx, location.roles, spyIds),
      votes: {},
      locationGuess: null,
      scores: {},
    };
  },

  reduce(state, action, playerId) {
    if (state.phase === "reveal") return state;

    if (action.type === "guess-location" && state.phase === "discuss") {
      if (!state.spyIds.includes(playerId) || state.locationGuess) return state;
      const text = String((action.payload as { text?: unknown })?.text ?? "").trim();
      if (text.length < 3) return state;
      const correct = normalize(text).length >= 4 && normalize(state.location).includes(normalize(text));
      const locationGuess = { by: playerId, text, correct };
      if (correct) {
        const next = { ...state, locationGuess, phase: "reveal" as const };
        return { ...next, scores: scoreSpyRound(next) };
      }
      return { ...state, locationGuess };
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
      return { ...next, scores: scoreSpyRound(next) };
    }
    if (action.type === "timeout" && state.phase === "discuss") {
      return { ...state, phase: "vote" };
    }

    return state;
  },

  publicView(state): SpyPublicView {
    const view: SpyPublicView = {
      phase: state.phase,
      votedIds: Object.keys(state.votes),
      spyCount: state.spyIds.length,
    };
    if (state.phase === "reveal") {
      view.location = state.location;
      view.spyIds = state.spyIds;
      view.locationGuess = state.locationGuess;
      view.scores = state.scores;
      const { counts } = tallyVotes(state.votes);
      view.totals = Object.entries(counts).map(([playerId, votes]) => ({ playerId, votes }));
    }
    return view;
  },

  privateView(state, playerId): SpyPrivateView {
    const isSpy = state.spyIds.includes(playerId);
    if (isSpy && state.phase !== "reveal") {
      return { role: "espia", location: null, job: null };
    }
    return {
      role: isSpy ? "espia" : "civil",
      location: state.location,
      job: isSpy ? null : (state.jobs[playerId] ?? null),
    };
  },

  isFinished(state) {
    return state.phase === "reveal";
  },

  scores(state) {
    return state.phase === "reveal" ? state.scores : {};
  },

  usedContentId(state) {
    return state.locationId;
  },
};
