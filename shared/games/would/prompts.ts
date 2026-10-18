import type { ContentPack } from "../packs";

export interface WouldPrompt {
  id: string;
  pack: ContentPack;
  left: string;
  right: string;
}

export const WOULD_PROMPTS: WouldPrompt[] = [
  { id: "w1", pack: "clasico", left: "Vivir sin mate", right: "Vivir sin medialunas" },
  { id: "w2", pack: "clasico", left: "Llegar siempre tarde", right: "Salir siempre una hora antes" },
  { id: "w3", pack: "clasico", left: "Asado quemado", right: "Ensalada como plato principal" },
  { id: "w4", pack: "clasico", left: "Bondi lleno", right: "Subte cortado" },
  { id: "w5", pack: "clasico", left: "Ser DT de tu club", right: "Ser presidente de tu país por una semana" },
  { id: "w6", pack: "fiesta", left: "After hasta las 8 AM", right: "Dormir a las 12 como un adulto funcional" },
  { id: "w7", pack: "fiesta", left: "Fernet 70/30", right: "Fernet 50/50 y una discusión" },
  { id: "w8", pack: "fiesta", left: "Ser el DJ", right: "Ser el que pide 'una más tranquila'" },
  { id: "w9", pack: "fiesta", left: "Perder el celular en la previa", right: "Perder las llaves" },
  { id: "w10", pack: "fiesta", left: "Cantar karaoke borracho", right: "Mandar un audio de 7 minutos" },
  { id: "w11", pack: "picante", left: "Un chamuyo exitoso", right: "Un silencio incómodo de 20 segundos" },
  { id: "w12", pack: "picante", left: "Que te vean el historial", right: "Que lean tus notas del celu" },
  { id: "w13", pack: "picante", left: "Quedarte a dormir", right: "Pedir el Uber a las 5:40" },
  { id: "w14", pack: "clasico", left: "Verano eterno", right: "Invierno con chocolate" },
  { id: "w15", pack: "fiesta", left: "Una playlist perfecta", right: "Una picada infinita" },
  { id: "w16", pack: "clasico", left: "River campeón", right: "Boca campeón" },
];
