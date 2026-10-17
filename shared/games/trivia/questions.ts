import type { ContentPack } from "../packs";

export interface TriviaQuestion {
  id: string;
  pack: ContentPack;
  prompt: string;
  options: [string, string, string, string];
  correct: number;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { id: "t1", pack: "clasico", prompt: "¿En qué provincia está Tilcara?", options: ["Jujuy", "Salta", "Tucumán", "Catamarca"], correct: 0 },
  { id: "t2", pack: "clasico", prompt: "¿Quién cantó 'La llave del corazón'?", options: ["Soda Stereo", "Charly García", "Fito Páez", "Andrés Calamaro"], correct: 2 },
  { id: "t3", pack: "clasico", prompt: "¿De qué color es la franja del medio de la bandera argentina?", options: ["Celeste", "Blanca", "Dorada", "Gris"], correct: 1 },
  { id: "t4", pack: "clasico", prompt: "¿En qué año fue el Mundial que ganó Maradona?", options: ["1978", "1986", "1990", "1994"], correct: 1 },
  { id: "t5", pack: "clasico", prompt: "¿Qué se le pone primero al fernet, según la pelea eterna?", options: ["Hielo", "Fernet", "Coca", "Una oración"], correct: 0 },
  { id: "t6", pack: "clasico", prompt: "¿Cuál es la capital de Entre Ríos?", options: ["Paraná", "Concordia", "Gualeguaychú", "Victoria"], correct: 0 },
  { id: "t7", pack: "fiesta", prompt: "En una previa argentina, ¿qué significa 'estoy en camino'?", options: ["Salió", "Se está bañando", "Ni empezó a vestirse", "Ya tocó timbre"], correct: 2 },
  { id: "t8", pack: "fiesta", prompt: "¿Qué se pide cuando 'no hay más hielo'?", options: ["Silencio", "Un kiosco heroico", "Agua de la canilla", "Rendir el after"], correct: 1 },
  { id: "t9", pack: "fiesta", prompt: "¿Cuál es el destino clásico del cargador prestado?", options: ["Vuelve", "Se queda", "Viaja a otra casa", "Se vuelve relicario"], correct: 2 },
  { id: "t10", pack: "fiesta", prompt: "¿Qué canción no puede faltar en un cumple de 30?", options: ["Un tango puro", "Un cumbia + un tema de la secundaria", "Un himno nacional", "Un jingle de banco"], correct: 1 },
  { id: "t11", pack: "fiesta", prompt: "¿Cómo se llama el que nunca pone plata y siempre 'después te paso'?", options: ["El inversor", "El mito", "El de la app", "El primo"], correct: 1 },
  { id: "t12", pack: "picante", prompt: "¿Qué significa '¿dormís acá?' a las 5 AM?", options: ["Hay colchón extra", "Hay intenciones", "Hay colectivo", "Hay fernet"], correct: 1 },
  { id: "t13", pack: "picante", prompt: "En una previa, 'pasame tu IG' casi nunca es para…", options: ["Stalkear stories", "Mandar memes", "Hacer networking serio", "Ver si hay ex en común"], correct: 2 },
  { id: "t14", pack: "clasico", prompt: "¿Quién escribió Martín Fierro?", options: ["Sarmiento", "Hernández", "Borges", "Cortázar"], correct: 1 },
  { id: "t15", pack: "clasico", prompt: "¿Cuál es el río que separa Argentina de Uruguay?", options: ["Paraná", "Uruguay", "de la Plata", "Negro"], correct: 1 },
  { id: "t16", pack: "fiesta", prompt: "Si alguien dice 'un vinito', en realidad son…", options: ["Una copa", "Tres copas y una charla", "Un tetra", "Un brindis institucional"], correct: 1 },
  { id: "t17", pack: "clasico", prompt: "¿En qué ciudad está el Obelisco?", options: ["Rosario", "Córdoba", "CABA", "La Plata"], correct: 2 },
  { id: "t18", pack: "fiesta", prompt: "El 'yo mañana laburo' se dice…", options: ["A las 19", "A las 22", "A las 4 AM, con un fernet en la mano", "Nunca"], correct: 2 },
];
