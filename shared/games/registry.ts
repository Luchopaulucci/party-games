import type { GameEngine, GameId, GameMeta } from "../types";
import { closestEngine } from "./closest/logic";
import { whoamiEngine } from "./whoami/logic";
import { impostorEngine } from "./impostor/logic";
import { STUB_GAMES } from "./stubs";

const IMPLEMENTED: GameMeta[] = [
  {
    id: "closest",
    name: "¿Quién está más cerca?",
    emoji: "🎯",
    tagline: "Un número. Palos tapados. Gana el que no se fue al pasto.",
    description:
      "Sale una pregunta con respuesta numérica. Cada uno manda un palo en secreto. El más cercano al dato real se lleva los puntos. Inspirado en la idea de cuanto-es.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "whoami",
    name: "¿Quién soy?",
    emoji: "🎭",
    tagline: "Todos saben quién sos. Menos vos. Situación bastante argentina.",
    description:
      "A uno le pegan un personaje en la frente (digital). Pregunta sí o no y tira un nombre. Si pega, suma. Si no, a llorar a la iglesia.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "impostor",
    name: "El impostor",
    emoji: "🐺",
    tagline: "Uno de ustedes es un chamuyero profesional.",
    description:
      "Todos reciben la misma palabra, menos el impostor. Se discute, se vota. Si no lo pescan, gana el verso.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
];

export const GAME_CATALOG: GameMeta[] = [...IMPLEMENTED, ...STUB_GAMES];

const ENGINES: Record<string, GameEngine> = {
  closest: closestEngine as GameEngine,
  whoami: whoamiEngine as GameEngine,
  impostor: impostorEngine as GameEngine,
};

export function getGameMeta(id: GameId): GameMeta | undefined {
  return GAME_CATALOG.find((g) => g.id === id);
}

export function getEngine(id: GameId): GameEngine | undefined {
  return ENGINES[id];
}

export function implementedGames(): GameMeta[] {
  return GAME_CATALOG.filter((g) => g.implemented);
}
