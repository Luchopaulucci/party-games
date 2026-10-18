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
- CORS en **dev** (`npm run dev`): cualquier origen. En **prod** (`npm start`) nunca es `*`: siempre entra el propio origen (`http://localhost:$PORT` / `127.0.0.1:$PORT`), Capacitor y `RENDER_EXTERNAL_URL`. Si `ALLOWED_ORIGINS` está vacío, también localhost / 127.0.0.1 / LAN privada en cualquier puerto (así `npm start` en `:3100` no da 400). `ALLOWED_ORIGINS` solo **suma** dominios extra. Un origen rechazado se loguea en el server.

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

Hay un `Dockerfile` y un Blueprint de Render (`render.yaml`). El proceso único escucha `$PORT` y atiende HTTP + Socket.IO. Health: `GET /healthz` (también `/health`).

```bash
docker build -t la-previa .
docker run -p 3000:3000 la-previa
```

## Publicar en Render

Un solo web service (plan **free**) sirve la **web + Socket.IO**. No hay un segundo servicio de sockets: el `npm start` de producción ya es Next y realtime en el mismo proceso. En el free eso es más robusto (un solo cold start; la web es same-origin). La APK apunta a esa misma URL.

Render free **duerme** el servicio si nadie entra. La web/APK muestran “Despertando el servidor…” y reintentan ~60 s.

### Qué hace Luciano

1. Creá una cuenta en [render.com](https://render.com) (no hace falta tarjeta para el free).
2. **New → Blueprint**.
3. Conectá el repo **Luchopaulucci/party-games**. Rama: **`develop`** (o la que quieras; no uses `master` para esto).
4. Render lee `render.yaml` y arma el servicio `la-previa` (Node 22, `npm ci && npm run build`, `npm start`, health `/healthz`).
5. **ALLOWED_ORIGINS** es opcional y solo **suma**. El propio origen, Capacitor (`capacitor://localhost`, `https://localhost`, `http://localhost`) y `RENDER_EXTERNAL_URL` ya entran. Si la web vive en otro dominio (o querés un custom domain), agregalo acá separados por coma, sin `*`. Si lo dejás vacío, en prod también se acepta localhost / 127.0.0.1 / LAN privada en cualquier puerto — sirve para `npm start` local sin armar env.
6. **No** setees `ALLOW_TEST_SEEDS`. `PORT` lo pone Render. `HOST_GRACE_MS` ya viene en 12000.
7. Deploy. Cuando esté Live, copiá la URL (tipo `https://la-previa.onrender.com`).
8. En GitHub → el repo → **Settings → Secrets and variables → Actions → Variables**:
   - `SOCKET_URL` = esa URL de Render (sin slash final).
   - `NEXT_PUBLIC_WEB_ORIGIN` = la misma URL (para el QR/link de la APK).
9. Regenerá la APK: **Actions → Android APK → Run workflow** (branch `develop`). Bajá `la-previa-debug.apk`. El workflow inyecta `SOCKET_URL` como `NEXT_PUBLIC_SOCKET_URL` en el export. Si `SOCKET_URL` no está, la APK sigue: modo en red avisa y el local anda.

La web en Render no necesita `NEXT_PUBLIC_SOCKET_URL`: usa el mismo origen. WebSockets vienen habilitados en Render.

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

En Actions: variable de repo `SOCKET_URL` (la URL de Render). Si no está, la APK avisa que el modo en red no está disponible. `NEXT_PUBLIC_WEB_ORIGIN` sigue siendo el origen público para el QR.

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
