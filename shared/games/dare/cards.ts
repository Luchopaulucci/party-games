import type { ContentPack } from "../packs";

export interface DareCard {
  id: string;
  pack: ContentPack;
  kind: "verdad" | "reto";
  text: string;
}

export const DARE_CARDS: DareCard[] = [
  { id: "v1", pack: "clasico", kind: "verdad", text: "¿Cuál fue la última vez que mentiste para zafar de una juntada?" },
  { id: "v2", pack: "clasico", kind: "verdad", text: "¿A quién de esta mesa le pedirías que te ceba el mate por el resto de tu vida?" },
  { id: "v3", pack: "clasico", kind: "verdad", text: "¿Qué app tenés que daría más vergüenza si se comparte la pantalla?" },
  { id: "v4", pack: "clasico", kind: "verdad", text: "¿Cuál es tu pretexto clásico para llegar tarde?" },
  { id: "v5", pack: "clasico", kind: "verdad", text: "¿A quién de acá le copiarías el estilo y a quién jamás?" },
  { id: "v6", pack: "fiesta", kind: "verdad", text: "¿Cuál fue tu momento más cringe en un after?" },
  { id: "v7", pack: "fiesta", kind: "verdad", text: "¿A quién de este grupo le mandarías un audio de 4 minutos a las 3 AM?" },
  { id: "v8", pack: "fiesta", kind: "verdad", text: "¿Qué canción cantás cuando nadie te escucha y te da vergüenza admitirlo?" },
  { id: "v9", pack: "fiesta", kind: "verdad", text: "¿Cuál es la pelea de WhatsApp más pelotuda que tuviste?" },
  { id: "v10", pack: "fiesta", kind: "verdad", text: "¿Quién de acá es el que siempre 'está llegando' desde hace 40 minutos?" },
  { id: "v11", pack: "picante", kind: "verdad", text: "¿Con quién de esta mesa tuviste un pensamiento no apto para el asado familiar?" },
  { id: "v12", pack: "picante", kind: "verdad", text: "¿Cuál fue tu chamuyo más sucio que funcionó (o no)?" },
  { id: "v13", pack: "picante", kind: "verdad", text: "¿A quién de acá le dirías 'quedate' si se apaga la luz?" },
  { id: "v14", pack: "clasico", kind: "verdad", text: "¿Cuál es tu opinión impopular sobre el fernet?" },
  { id: "v15", pack: "clasico", kind: "verdad", text: "¿Qué cosa de tu infancia todavía no superaste?" },
  { id: "r1", pack: "clasico", kind: "reto", text: "Imitá a la persona de tu derecha pidiendo un delivery." },
  { id: "r2", pack: "clasico", kind: "reto", text: "Mandá un audio al grupo de la familia diciendo 'ya salgo' y no des más contexto." },
  { id: "r3", pack: "clasico", kind: "reto", text: "Contá un chiste tan malo que duela. Si nadie se ríe, tomá agua como penitencia." },
  { id: "r4", pack: "clasico", kind: "reto", text: "Cebá un mate imaginario y servíselo a quien más te cae bien." },
  { id: "r5", pack: "fiesta", kind: "reto", text: "Hacé 10 segundos de baile de casamiento, sin música." },
  { id: "r6", pack: "fiesta", kind: "reto", text: "Inventá un brindis dramático para el que tiene menos puntaje." },
  { id: "r7", pack: "fiesta", kind: "reto", text: "Cantá el estribillo de un tema de la secundaria como si fuera ópera." },
  { id: "r8", pack: "fiesta", kind: "reto", text: "Hablá 20 segundos en modo locutor de radio pasillo." },
  { id: "r9", pack: "picante", kind: "reto", text: "Susurrale a alguien de la mesa una frase de telenovela. Que el resto adivine a quién." },
  { id: "r10", pack: "picante", kind: "reto", text: "Elegí a alguien y describílo como si estuvieras en una app de citas. Sin nombres." },
  { id: "r11", pack: "picante", kind: "reto", text: "Hacé cara de 'te extraño' a la persona que menos te lo espera." },
  { id: "r12", pack: "clasico", kind: "reto", text: "Contá la previa como si fueras documental de NatGeo." },
  { id: "r13", pack: "fiesta", kind: "reto", text: "Pedile perdón a la mesa por un crimen inventado, llorando de mentira." },
  { id: "r14", pack: "clasico", kind: "reto", text: "Poné cara de técnico de fútbol y explicá por qué perdimos 1 a 0." },
  { id: "r15", pack: "fiesta", kind: "verdad", text: "¿Cuál es tu peor foto de DNI y por qué la defendés?" },
];
