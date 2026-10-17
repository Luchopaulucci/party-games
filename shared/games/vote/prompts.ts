export interface VotePrompt {
  id: string;
  prompt: string;
}

export const VOTE_PROMPTS: VotePrompt[] = [
  { id: "fernet", prompt: "¿Quién de este grupo tomaría fernet en vaso de plástico a las 11 de la mañana?" },
  { id: "asado", prompt: "¿Quién de este grupo se pelearía con el asador por el punto de la carne?" },
  { id: "whatsapp", prompt: "¿Quién de este grupo deja en visto y después dice 'no vi el celular'?" },
  { id: "uber", prompt: "¿Quién de este grupo pide el Uber y se olvida de compartir la ubicación?" },
  { id: "karaoke", prompt: "¿Quién de este grupo se mandaría un tema entero en el karaoke sin que se lo pidan?" },
  { id: "mate", prompt: "¿Quién de este grupo ceba el mate más lavado de la historia?" },
  { id: "cuñado", prompt: "¿Quién de este grupo tiene más cara de cuñado opinólogo?" },
  { id: "deuda", prompt: "¿Quién de este grupo 'después te paso' y nunca más aparece?" },
  { id: "foto", prompt: "¿Quién de este grupo tarda 40 minutos en elegir la foto del grupo?" },
  { id: "llave", prompt: "¿Quién de este grupo perdería las llaves en la previa y las encontraría en la heladera?" },
  { id: "excusa", prompt: "¿Quién de este grupo tiene la excusa más creativa para llegar tarde?" },
  { id: "playlist", prompt: "¿Quién de este grupo arruinaría la playlist con un tema de la secundaria?" },
  { id: "heladera", prompt: "¿Quién de este grupo guardaría las llaves en la heladera y lo defendería?" },
  { id: "audio", prompt: "¿Quién de este grupo manda audios de 4 minutos para decir 'ok'?" },
  { id: "cumple", prompt: "¿Quién de este grupo organiza el cumple y se olvida de pedir el salón?" },
  { id: "nafta", prompt: "¿Quién de este grupo nunca pone nafta cuando pide el auto?" },
  { id: "serie", prompt: "¿Quién de este grupo spoilea sin querer y dice 'uy, perdón'?" },
  { id: "asiento", prompt: "¿Quién de este grupo se sienta adelante y maneja el auxilio?" },
  { id: "guita", prompt: "¿Quién de este grupo divide la cuenta hasta el peso y el 10 centavos?" },
  { id: "ex", prompt: "¿Quién de este grupo sigue al ex en todas las redes 'por las fotos de los perros'?" },
  { id: "fiesta", prompt: "¿Quién de este grupo dice 'me voy' y se queda dos horas más?" },
];
