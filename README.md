# La Previa

Juegos de celu para la juntada. Mobile-first, español rioplatense (voseo), tono de previa.

Dos modos:

1. **En línea** — el anfitrión arma una sala (código corto + QR). Cada uno entra con su nombre desde el teléfono. El server es dueño del estado: asiento, puntaje y secretos. Si recargás o se te corta, volvés al mismo asiento. Si el host se va más de N segundos, hostea otro; el original reclama al recargar. Los mensajes de socket se validan (zod) y un payload podrido no tira el proceso. Las salas vacías o inactivas se borran después de un TTL.
2. **Pasate el celu** — un solo teléfono, 100% client-side, anda offline (PWA / service worker). Pensado para 375px.

## Juegos (23)

Extras de sala (timer, rondas, impostores/espías, modo subasta, **noche de juegos**) van en el lobby. En cada juego hay **¿Cómo se juega?**. Al terminar, podio con stats. Reacciones en vivo y sonido/vibración opcionales.

### Los 11 de la lista

| Juego | Qué se sumó y de dónde |
| --- | --- |
| **¿Quién está más cerca?** | Packs clásico/fiesta/picante, count-up 900ms y colores de [¿Cuánto es?](https://github.com/Luchopaulucci/cuanto-es). Timer opcional. |
| **¿Quién soy?** | Estilo Heads Up / Guess Who. `maxGuesses` por opciones. Timeout cierra. |
| **El impostor** | Impostor count automático o 1/2 (Among Us / Spyfall). Al revelar **solo totales**, no el mapa de votos. |
| **¿Más o menos?** | Rango que se achica. Timeout revela. |
| **Espía** | [Spyfall](https://hobbyworldint.com/portfolio-item/spyfall/): 8 min típicos, el espía puede adivinar el lugar, N rondas. Acá: timer, spy count 1/2, oficio por civil. |
| **Votación** | “Most likely to”. Solo totales. |
| **Subasta de números** | [The Price is Right](https://en.wikipedia.org/wiki/List_of_The_Price_Is_Right_pricing_games) / Guesstimate: modo *sin pasarse* o *más cerca*. Pujas tapadas. |
| **Completá la frase** | [Quiplash](https://jackbox.wiki/wiki/Quiplash): todos escriben, se vota, JINX si copian, puntos = votos. Sin mapa votante→respuesta. |
| **Mentira creíble** | Two truths and a lie + scoring tipo [Fibbage](https://jackboxgames.fandom.com/wiki/Fibbage_(series)): el narrador suma si te creen. Totales por frase. |
| **Dibujá y adiviná** | Pictionary / [Drawful](https://jackbox.wiki/wiki/Drawful) simplificado (sin mentiras falsas): trazo en el celu, palabra solo al artista. |
| **Reflejos** | Primer toque correcto suma, el error resta. La opción buena no viaja hasta el cierre. |

### Nuevos

| Juego | Idea |
| --- | --- |
| **La onda** | [Wavelength](https://en.wikipedia.org/wiki/Wavelength_(game)): psíquico ve 0–100, tira una pista, el resto apunta. Target privado. |
| **Palabra prohibida** | [Taboo](https://therulebook.com/party-games/): palabra + prohibidas solo para quien habla. Botón “dijo una prohibida”. |
| **Yo nunca** | Never Have I Ever. **Solo totales** de “yo sí”, nunca quién levantó la mano. |
| **Tutti frutti** | Stop / Scattergories. Letra + 5 categorías. Respuestas tapadas hasta el alto. Únicas = 2, repetidas = 1. |
| **Bombita** | Papa caliente. El `explodeAt` **nunca** se manda al cliente. |
| **Mímica** | Charadas / Heads Up. La consigna solo la ve quien actúa. |
| **Verdad o reto** | Apps de previas AR: carta + la mesa vota si cumplió. Totales nomás. |
| **Preguntados rápido** | Trivia 4 opciones. El índice correcto no viaja hasta el cierre. |
| **Cadena de palabras** | Asociación libre. La cadena completa recién al revelar. |
| **Adiviná el emoji** | Canción/peli/cosa en emojis. Respuesta tapada. |
| **Teléfono descompuesto** | Cada uno reescribe lo anterior. Solo el escritor ve el texto previo. |
| **¿Qué preferís?** | This or that. Votos anónimos, solo totales. |

## Estilo

Tokens, tipografías (Fraunces + Source Sans 3), paleta de jugadores, handoff a pantalla completa, chips de categoría y el tono de previa salen de [¿Cuánto es?](https://github.com/Luchopaulucci/cuanto-es).

## Stack

- TypeScript
- Next.js (App Router) para la UI
- Server Node + Socket.IO (`server/`) en el mismo proceso en producción
- Lógica de juegos en `shared/` (sirve online y pass-and-play)

No hay secretos en el repo. Copiá `.env.example`. Luciano decide si esto vive en Railway, Render, Fly u otro PaaS con un `PORT` y un contenedor.

## Correr en local

```bash
cp .env.example .env.local
npm install
npm run dev
```

- Front: http://localhost:3000
- Socket: http://localhost:3001 (`NEXT_PUBLIC_SOCKET_URL` en `.env.development`)

Scripts:

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Next + Socket.IO en paralelo |
| `npm test` | Unitarios de lógica / salas |
| `npm run test:multi` | 6 clientes socket, reconexión, host, aislamiento, fugas |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Next + compile del server |
| `npm start` | Un solo proceso (UI + sockets) en `$PORT` |

## Deploy

Hay un `Dockerfile`. El proceso único escucha `$PORT` (default 3000) y atiende HTTP + Socket.IO.

```bash
docker build -t la-previa .
docker run -p 3000:3000 la-previa
```

En Railway / Render / Fly:

1. Repo público, branch `master` (o el que elijas).
2. Build: el Dockerfile, o `npm ci && npm run build`.
3. Start: `npm start`.
4. Healthcheck: `GET /health`.
5. Variables: `PORT` (lo pone la plataforma), `HOST_GRACE_MS` (opcional, default 12000). **No** setees `ALLOW_TEST_SEEDS` en prod.
6. Dejá `NEXT_PUBLIC_SOCKET_URL` vacío para que el browser use el mismo origen.

WebSockets tienen que estar habilitados en el proxy (en estos PaaS suele venir de fábrica).

## Privacidad

Cada cliente recibe `{ public, private }` proyectado para **su** asiento. El estado crudo del engine no viaja. Los tokens de sesión viven en `localStorage` del jugador y en el server; nunca se mandan al resto. Las salas no se mezclan.

## Arquitectura de plugins

Un juego = engine + proyección pública/privada + componente + mazo. El server no conoce reglas. Detalle en `docs/plugins.md`.
