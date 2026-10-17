import type { GameMeta } from "../types";

/**
 * Juegos para un PR aparte. El registro ya tiene el hueco.
 */
export const STUB_GAMES: GameMeta[] = [
  {
    id: "subasta",
    name: "Subasta de números",
    emoji: "🔨",
    tagline: "Ofertá como si fuera Mercado Libre a las 3 AM.",
    description:
      "Hay un número objetivo. Cada quien puja con un número propio. Gana el más cercano que no se haya pasado… o sí, ya veremos.",
    minPlayers: 3,
    maxPlayers: 10,
    implemented: false,
  },
  {
    id: "completa-frase",
    name: "Completá la frase",
    emoji: "✍️",
    tagline: "Arranca inocente y termina en terapia.",
    description:
      "Una frase con un hueco. Cada uno manda un cierre. Se vota el más gracioso, no el más sano.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: false,
  },
  {
    id: "mentira",
    name: "Mentira creíble",
    emoji: "🤥",
    tagline: "Dos verdades y una mentira, pero con más maldad.",
    description:
      "Contás tres datos. El resto adivina cuál es el verso. Si te creen la mentira, sumás.",
    minPlayers: 3,
    maxPlayers: 10,
    implemented: false,
  },
  {
    id: "dibuja",
    name: "Dibujá y adiviná",
    emoji: "✏️",
    tagline: "El Pictionary de la previa. El arte es opcional.",
    description:
      "Uno dibuja en el celu, el resto adivina. El trazo horrible es parte del chiste.",
    minPlayers: 3,
    maxPlayers: 12,
    implemented: false,
  },
  {
    id: "reflejos",
    name: "Reflejos",
    emoji: "⚡",
    tagline: "El más lento paga el fernet.",
    description:
      "Aparece una consigna relámpago. El primero que toca bien, suma. El que se apura mal, resta.",
    minPlayers: 2,
    maxPlayers: 12,
    implemented: false,
  },
];
