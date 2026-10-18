import type { ContentPack } from "../packs";

export interface PhonePrompt {
  id: string;
  pack: ContentPack;
  text: string;
}

export const PHONE_PROMPTS: PhonePrompt[] = [
  { id: "p1", pack: "clasico", text: "El tío llega al asado con un vino que 'está buenísimo' y es un tetra." },
  { id: "p2", pack: "clasico", text: "Perdí el bondi porque me puse a discutir si el mate va con o sin azúcar." },
  { id: "p3", pack: "clasico", text: "La abuela tiene WhatsApp y ahora manda stickers de buenos días a las 6:12." },
  { id: "p4", pack: "fiesta", text: "Dijo 'me quedo un ratito' y amaneció en un living que no era el de la casa." },
  { id: "p5", pack: "fiesta", text: "El DJ de la previa puso cumbia, cumbia y, para variar, más cumbia." },
  { id: "p6", pack: "fiesta", text: "Pedimos Uber para 4. Entraron 6. El conductor no dijo nada. Héroe." },
  { id: "p7", pack: "picante", text: "Se miraron dos segundos de más y ahora el grupo tiene una teoría." },
  { id: "p8", pack: "picante", text: "El '¿dormís acá?' se dijo en voz baja, pero lo escuchó hasta el que estaba en el balcón." },
  { id: "p9", pack: "clasico", text: "El perro de la casa se comió una milanesa y nadie se anima a contarlo." },
  { id: "p10", pack: "fiesta", text: "Había un solo cargador y se armó un sistema de turnos más serio que un hospital." },
  { id: "p11", pack: "clasico", text: "El GPS dijo 'llegaste' y estábamos en un baldío con un parrillero abandonado." },
  { id: "p12", pack: "fiesta", text: "Alguien gritó 'última' y eran las 2. Había tres últimas más." },
];
