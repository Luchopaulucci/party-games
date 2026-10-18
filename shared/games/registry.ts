import type { GameEngine, GameId, GameMeta } from "../types";
import { closestEngine } from "./closest/logic";
import { whoamiEngine } from "./whoami/logic";
import { impostorEngine } from "./impostor/logic";
import { higherLowerEngine } from "./higherlower/logic";
import { spyEngine } from "./spy/logic";
import { voteEngine } from "./vote/logic";
import { auctionEngine } from "./auction/logic";
import { phraseEngine } from "./phrase/logic";
import { lieEngine } from "./lie/logic";
import { drawEngine } from "./draw/logic";
import { reflexEngine } from "./reflex/logic";
import { waveEngine } from "./wave/logic";
import { tabooEngine } from "./taboo/logic";
import { neverEngine } from "./never/logic";
import { stopEngine } from "./stop/logic";
import { bombEngine } from "./bomb/logic";
import { mimicEngine } from "./charades/logic";

const IMPLEMENTED: GameMeta[] = [
  {
    id: "closest",
    name: "¿Quién está más cerca?",
    emoji: "🎯",
    tagline: "Un número. Palos tapados. Gana el que no se fue al pasto.",
    description: "Pregunta numérica, palos secretos, count-up al revelar. Packs de ¿Cuánto es?.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "whoami",
    name: "¿Quién soy?",
    emoji: "🎭",
    tagline: "Todos saben quién sos. Menos vos.",
    description: "Personaje en la frente digital. Preguntas sí/no. Heads Up / Guess Who.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "impostor",
    name: "El impostor",
    emoji: "🐺",
    tagline: "Uno de ustedes es un chamuyero profesional.",
    description: "Misma palabra menos el impostor. Impostor count configurable.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "mas-o-menos",
    name: "¿Más o menos?",
    emoji: "📊",
    tagline: "Más alto, más bajo, más chamuyo.",
    description: "Número secreto. Por turno un palo; te dicen más o menos.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "espia",
    name: "Espía",
    emoji: "🕵️",
    tagline: "Uno mira, otro miente, todos desconfían.",
    description: "Spyfall: lugar + oficio. Cantidad de espías configurable.",
    minPlayers: 4,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "votacion",
    name: "Votación",
    emoji: "🗳️",
    tagline: "¿Quién de este grupo…? Sin filtro, con consecuencias.",
    description: "Votos secretos. Solo totales.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "subasta",
    name: "Subasta de números",
    emoji: "🔨",
    tagline: "Ofertá como si fuera Mercado Libre a las 3 AM.",
    description: "The Price is Right: más cerca sin pasarse, o modo más cercano.",
    minPlayers: 3,
    maxPlayers: 10,
    implemented: true,
  },
  {
    id: "completa-frase",
    name: "Completá la frase",
    emoji: "✍️",
    tagline: "Arranca inocente y termina en terapia.",
    description: "Quiplash: todos escriben, se vota el más gracioso. JINX si copian.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "mentira",
    name: "Mentira creíble",
    emoji: "🤥",
    tagline: "Dos verdades y una mentira, pero con más maldad.",
    description: "Un narrador, tres datos, el resto vota la mentira. Totales nomás.",
    minPlayers: 3,
    maxPlayers: 10,
    implemented: true,
  },
  {
    id: "dibuja",
    name: "Dibujá y adiviná",
    emoji: "✏️",
    tagline: "El Pictionary de la previa. El arte es opcional.",
    description: "Uno dibuja, el resto adivina. La palabra solo la ve el artista.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "reflejos",
    name: "Reflejos",
    emoji: "⚡",
    tagline: "El más lento paga el fernet.",
    description: "Consigna relámpago. El primero que toca bien suma. El que erra, resta.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "onda",
    name: "La onda",
    emoji: "📡",
    tagline: "Una pista. Un espectro. Un número escondido.",
    description: "Wavelength: el psíquico ve 0–100 y tira una pista. El resto apunta.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "taboo",
    name: "Palabra prohibida",
    emoji: "🚫",
    tagline: "Describí sin decir lo obvio. Imposible para tu cuñado.",
    description: "Taboo: palabra + prohibidas solo para quien habla.",
    minPlayers: 3,
    maxPlayers: 10,
    implemented: true,
  },
  {
    id: "yo-nunca",
    name: "Yo nunca",
    emoji: "🖐️",
    tagline: "Levantá la mano… en secreto.",
    description: "Never Have I Ever. Solo se ven totales, nunca quién dijo yo sí.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "tutti",
    name: "Tutti frutti",
    emoji: "✏️",
    tagline: "Una letra. Cinco categorías. Pánico colectivo.",
    description: "Stop / Scattergories. Únicas valen más. Respuestas tapadas hasta el alto.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "bombita",
    name: "Bombita",
    emoji: "💣",
    tagline: "Pasala. El timer es secreto.",
    description: "Papa caliente. Nadie ve cuándo explota. Al que le queda, -1.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
  },
  {
    id: "mimica",
    name: "Mímica",
    emoji: "🙈",
    tagline: "Actuá. Si hablás, te silban.",
    description: "Charadas / Heads Up. La palabra solo la ve quien actúa.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: true,
  },
];

export const GAME_CATALOG: GameMeta[] = IMPLEMENTED;

const ENGINES: Record<string, GameEngine> = {
  closest: closestEngine as GameEngine,
  whoami: whoamiEngine as GameEngine,
  impostor: impostorEngine as GameEngine,
  "mas-o-menos": higherLowerEngine as GameEngine,
  espia: spyEngine as GameEngine,
  votacion: voteEngine as GameEngine,
  subasta: auctionEngine as GameEngine,
  "completa-frase": phraseEngine as GameEngine,
  mentira: lieEngine as GameEngine,
  dibuja: drawEngine as GameEngine,
  reflejos: reflexEngine as GameEngine,
  onda: waveEngine as GameEngine,
  taboo: tabooEngine as GameEngine,
  "yo-nunca": neverEngine as GameEngine,
  tutti: stopEngine as GameEngine,
  bombita: bombEngine as GameEngine,
  mimica: mimicEngine as GameEngine,
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
