# La Previa

Juegos de celu para la juntada. Mobile-first, español rioplatense (voseo), tono de previa.

Dos modos:

1. **En línea** — el anfitrión arma una sala (código corto + QR). Cada uno entra con su nombre desde el teléfono. El server es dueño del estado: asiento, puntaje y secretos. Si recargás o se te corta, volvés al mismo asiento. Si el host se va más de N segundos, hostea otro; el original reclama al recargar. Los mensajes de socket se validan (zod) y un payload podrido no tira el proceso. Las salas vacías o inactivas se borran después de un TTL.
2. **Pasate el celu** — un solo teléfono, 100% client-side, anda offline (PWA / service worker). Pensado para 375px.

## Flujo

Home con la lista de 15 juegos, en 4 categorías. Adentro de cada uno elegís local o en red (Yo nunca solo local; Tutti frutti y ¿Qué preferís? solo en red). Local: lobby de ese juego. En red: primero se crea la sala (código, link y QR) y después los ajustes. Unirse por código/link sigue directo. Salir arriba confirma; si se va el anfitrión, se cae la sala.

## Juegos (15)

Extras de sala (timer, rondas, impostores/espías, **noche de juegos**) van en el lobby. En cada juego hay **¿Cómo se juega?**. Al terminar, podio con stats. Reacciones en vivo y sonido/vibración opcionales.

| Juego | Qué se sumó y de dónde |
| --- | --- |
| **¿Quién está más cerca?** | Packs clásico/fiesta/picante, count-up 900ms y colores de [¿Cuánto es?](https://github.com/Luchopaulucci/cuanto-es). Timer opcional. |
| **¿Quién soy?** | Estilo Heads Up / Guess Who. `maxGuesses` por opciones. Timeout cierra. |
| **El impostor** | Impostor count automático o 1/2 (Among Us / Spyfall). Al revelar **solo totales**, no el mapa de votos. |
| **¿Más o menos?** | Rango que se achica. Timeout revela. |
| **Espía** | [Spyfall](https://hobbyworldint.com/portfolio-item/spyfall/): 8 min típicos, el espía puede adivinar el lugar, N rondas. Acá: timer, spy count 1/2, oficio por civil. |
| **¿Quién es más probable?** | “Most likely to”. Solo totales. |
| **Completá la frase** | [Quiplash](https://jackbox.wiki/wiki/Quiplash): todos escriben, se vota, JINX si copian, puntos = votos. Sin mapa votante→respuesta. |
| **Mentira creíble** | Two truths and a lie + scoring tipo [Fibbage](https://jackboxgames.fandom.com/wiki/Fibbage_(series)): el narrador suma si te creen. Totales por frase. |
| **Reflejos** | Primer toque correcto suma, el error resta. La opción buena no viaja hasta el cierre. |
| **Yo nunca** | Never Have I Ever. **Solo totales** de “yo sí”, nunca quién levantó la mano. |
| **Tutti frutti** | Stop / Scattergories. Letra + 5 categorías. Respuestas tapadas hasta el alto. Únicas = 2, repetidas = 1. |
| **Preguntados rápido** | Trivia 4 opciones. El índice correcto no viaja hasta el cierre. |
| **Cadena de palabras** | Asociación libre. La cadena completa recién al revelar. |
| **Adiviná el emoji** | Canción/peli/cosa en emojis. Respuesta tapada. |
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
| `npm run build:mobile` | Export estático (`out/`) para la APK. No toca el build web. |
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

## APK de Android

La app va **empaquetada** adentro de la APK (export estático de Next + Capacitor). No es un wrapper de una URL. El modo local de los 15 juegos anda sin internet. El modo en red necesita un server Socket.IO.

### Bajar e instalar el debug

1. GitHub → **Actions** → workflow **Android APK**.
2. Entrá al run de `develop` (o dispará **Run workflow**).
3. Bajá el artifact `la-previa-debug.apk`.
4. En el celu: permití instalar apps de origen desconocido y abrí el APK.

### Build local

Hace falta Node 20+ y Java 21 (Capacitor 7).

```bash
npm ci
npm run build:mobile
npx cap sync android
cd android && ./gradlew assembleDebug
```

La APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

### Server y QR (opcional, al buildar la APK)

| Variable | Para qué |
| --- | --- |
| `NEXT_PUBLIC_SOCKET_URL` | URL del server Socket.IO. En la **web** vacía = mismo origen. En la **APK** vacía = el modo en red avisa y el local sigue. |
| `NEXT_PUBLIC_WEB_ORIGIN` | Origen público de la web para el QR/link (ej. `https://tu-dominio.com`). Si falta, el código de sala se muestra igual. |

En Actions se pueden setear como variables de repo (`NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_WEB_ORIGIN`).

### Firma de release

El job de release firmado solo corre si existen los secrets (si no, el workflow queda verde igual):

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Nunca commitees un `.jks` / `.keystore`.

## Privacidad

Cada cliente recibe `{ public, private }` proyectado para **su** asiento. El estado crudo del engine no viaja. Los tokens de sesión viven en `localStorage` del jugador y en el server; nunca se mandan al resto. Las salas no se mezclan.

## Arquitectura de plugins

Un juego = engine + proyección pública/privada + componente + mazo. El server no conoce reglas. Detalle en `docs/plugins.md`.
