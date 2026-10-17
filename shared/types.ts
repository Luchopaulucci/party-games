export type GameId =
  | "closest"
  | "whoami"
  | "impostor"
  | "mas-o-menos"
  | "subasta"
  | "espia"
  | "completa-frase"
  | "mentira"
  | "dibuja"
  | "reflejos"
  | "votacion";

export type RoomStatus = "lobby" | "playing" | "finished";

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  isHost: boolean;
}

export interface GameMeta {
  id: GameId;
  name: string;
  tagline: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  implemented: boolean;
  emoji: string;
}

export interface GameContext {
  playerIds: string[];
  rng: () => number;
  usedContentIds?: string[];
  seed?: TestSeed;
}

/** Only honored when ALLOW_TEST_SEEDS=1. Never enable that in production. */
export interface TestSeed {
  questionId?: string;
  trueAnswer?: number;
  prompt?: string;
  unit?: string;
  character?: string;
  hint?: string;
  targetId?: string;
  word?: string;
  category?: string;
  impostorIds?: string[];
  location?: string;
  spyIds?: string[];
  min?: number;
  max?: number;
}

export interface GameAction {
  type: string;
  payload?: unknown;
}

export interface ScoreMap {
  [playerId: string]: number;
}

export interface GameEngine<S = unknown> {
  id: GameId;
  createState(ctx: GameContext): S;
  reduce(state: S, action: GameAction, playerId: string, ctx: GameContext): S;
  publicView(state: S): unknown;
  privateView(state: S, playerId: string): unknown;
  isFinished(state: S): boolean;
  scores(state: S): ScoreMap;
  usedContentId?(state: S): string | undefined;
}

export interface RoomNotice {
  kind: "host-migrated" | "host-reclaimed" | "info";
  text: string;
}

export interface ClientRoomState {
  code: string;
  you: PlayerPublic;
  players: PlayerPublic[];
  status: RoomStatus;
  gameId: GameId | null;
  public: unknown;
  private: unknown;
  notice: RoomNotice | null;
  canHost: boolean;
}

export const HOST_GRACE_DEFAULT_MS = 12_000;
export const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const MAX_PLAYERS = 12;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 18;
