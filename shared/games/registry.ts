import type { GameEngine, GameId, GameMeta } from "../types";
import { closestEngine } from "./closest/logic";
import { whoamiEngine } from "./whoami/logic";
import { impostorEngine } from "./impostor/logic";
import { higherLowerEngine } from "./higherlower/logic";
import { spyEngine } from "./spy/logic";
import { voteEngine } from "./vote/logic";
import { phraseEngine } from "./phrase/logic";
import { lieEngine } from "./lie/logic";
import { reflexEngine } from "./reflex/logic";
import { neverEngine } from "./never/logic";
import { stopEngine } from "./stop/logic";
import { triviaEngine } from "./trivia/logic";
import { chainEngine } from "./chain/logic";
import { emojiEngine } from "./emoji/logic";
import { wouldEngine } from "./would/logic";

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
    howTo: "Cada uno tira un número en secreto. Gana el más cerca. Si empatan, se parten los puntos.",
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
    howTo: "Preguntá sí/no. El resto contesta. Cuando te late, tirá el nombre.",
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
    howTo: "Si ves la palabra, charlá sin decirla. Si no, fingí. Después se vota. Solo se ven totales.",
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
    howTo: "De a uno tiran un número. El server dice más o menos. Quien clava, suma.",
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
    howTo: "Si no sos espía, ves el lugar. Preguntá para pescarlo. El espía puede adivinar el lugar.",
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
    howTo: "Leé la pregunta. Votá en secreto. Se revelan totales, nunca quién votó a quién.",
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
    howTo: "Completá la frase. Después votá la más graciosa, menos la tuya. Si copian, JINX.",
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
    howTo: "El narrador tira 3 frases. El resto vota cuál es mentira. No se ve el mapa de votos.",
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
    howTo: "Leé y tocá. El primero que acierta suma. El que erra, resta.",
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
    howTo: "Leé el 'yo nunca'. Tocá yo sí / yo no. Solo se ven totales.",
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
    howTo: "Una letra, cinco categorías. Únicas valen 2, repetidas 1. Nadie ve lo tuyo hasta el alto.",
  },
  {
    id: "trivia",
    name: "Preguntados rápido",
    emoji: "🧠",
    tagline: "Cultura general con acento rioplatense.",
    description: "4 opciones. La correcta no viaja hasta que todos contestan.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Leé, tocá una de las 4. Cuando todos mandan (o el host cierra), se ve la buena.",
  },
  {
    id: "cadena",
    name: "Cadena de palabras",
    emoji: "🔗",
    tagline: "Asociá. No copies. No pienses demasiado.",
    description: "Cada uno tira una palabra que pegue con la anterior.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Ves la última palabra. Tirá otra que pegue. Al final se ve toda la cadena.",
  },
  {
    id: "emoji",
    name: "Adiviná el emoji",
    emoji: "😎",
    tagline: "Tres emojis. Un título. Un orgullo herido.",
    description: "Canción, peli o cosa argentina en emojis.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Mirá los emojis. Escribí qué es. El primero que clava, suma 3.",
  },
  {
    id: "preferis",
    name: "¿Qué preferís?",
    emoji: "🤷",
    tagline: "A o B. Sin término medio. Como en la vida.",
    description: "This or that. Solo totales, votos anónimos.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: true,
    howTo: "Elegí A o B. Se revelan totales, nunca quién votó qué.",
  },
];

export const GAME_CATALOG: GameMeta[] = IMPLEMENTED;

const ENGINES: Record<GameId, GameEngine> = {
  closest: closestEngine as GameEngine,
  whoami: whoamiEngine as GameEngine,
  impostor: impostorEngine as GameEngine,
  "mas-o-menos": higherLowerEngine as GameEngine,
  espia: spyEngine as GameEngine,
  votacion: voteEngine as GameEngine,
  "completa-frase": phraseEngine as GameEngine,
  mentira: lieEngine as GameEngine,
  reflejos: reflexEngine as GameEngine,
  "yo-nunca": neverEngine as GameEngine,
  tutti: stopEngine as GameEngine,
  trivia: triviaEngine as GameEngine,
  cadena: chainEngine as GameEngine,
  emoji: emojiEngine as GameEngine,
  preferis: wouldEngine as GameEngine,
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
