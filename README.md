# La Previa

Juegos de celu para la juntada. Mobile-first, español rioplatense (voseo), tono de previa.

Dos modos:

1. **En línea** — el anfitrión arma una sala (código corto + QR). Cada uno entra con su nombre desde el teléfono. El server es dueño del estado: asiento, puntaje y secretos. Si recargás o se te corta, volvés al mismo asiento. Si el host se va más de N segundos, hostea otro; el original reclama al recargar.
2. **Pasate el celu** — un solo teléfono, 100% client-side, anda offline (PWA / service worker). Pensado para 375px.

## Juegos MVP (6)

- **¿Quién está más cerca?** — pregunta numérica, palos tapados, gana el más cercano. Reusa el mazo, las categorías clásicas/fiesta/picante, los colores de jugador y el reveal con count-up de [¿Cuánto es?](https://github.com/Luchopaulucci/cuanto-es).
- **¿Quién soy?** — todos ven el personaje menos el target. Preguntas sí/no y un palo al nombre.
- **El impostor** — la misma palabra para todos menos el/los impostor(es). Se discute y se vota.
- **¿Más o menos?** — número secreto. Por turno un palo; el server dice *más* / *menos*. El que clava suma 3. Si tirás afuera del rango que ya se sabe, te pasaste y perdés el turno.
- **Espía** — tipo Spyfall: lugar + oficio para los civiles. El espía no recibe el lugar. Se pregunta, se vota, el espía puede adivinar el sitio. El celu equivocado nunca ve el rol de espía ni el lugar.
- **Votación** — “¿Quién de este grupo…?”. Votos secretos. Al revelar **solo totales**, nunca el mapa de quién votó a quién.

Quedan para un PR aparte (stubs): Subasta de números, Completá la frase, Mentira creíble, Dibujá y adiviná, Reflejos. Ver `docs/plugins.md`.

## Estilo

Tokens, tipografías (Fraunces + Source Sans 3), paleta de jugadores, handoff a pantalla completa del color del jugador, chips de categoría y el tono de previa salen de [¿Cuánto es?](https://github.com/Luchopaulucci/cuanto-es). Los 6 juegos de este MVP los reusan.

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
