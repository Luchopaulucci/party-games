# Registro de juegos (plugins)

Cada juego es un paquete con la misma forma. El server no sabe reglas:
llama al engine, proyecta vistas y le manda a cada cliente **solo** lo suyo.

```
shared/games/<id>/
  logic.ts        # createState, reduce, publicView, privateView, scores
  <content>.ts    # mazo / premisas
components/games/<Id>View.tsx
```

## Contrato `GameEngine`

| Método | Para qué |
| --- | --- |
| `createState(ctx)` | Arranca la ronda. `ctx.rng` es inyectado (testeable). |
| `reduce(state, action, playerId, ctx)` | Pura. No toca sockets ni puntajes de sala. |
| `publicView(state)` | Lo que pueden ver todos. Cero secretos. |
| `privateView(state, playerId)` | Lo de **ese** jugador. Nunca el secreto ajeno. |
| `isFinished` / `scores` | Cierre de ronda. La sala acumula puntos una sola vez. |
| `usedContentId` | Para no repetir la misma pregunta/palabra al toque. |

`GameContext.seed` existe **solo** si `ALLOW_TEST_SEEDS=1`. En producción se ignora.

## Privacidad

El socket manda `{ public, private }` por asiento. El estado crudo del engine
nunca viaja. Tokens de sesión tampoco. Tests en `tests/multi` recorren el JSON
crudo y fallan si un impostor recibe la palabra o el target de ¿Quién soy?
recibe el personaje.

## MVP implementados

- `closest` — ¿Quién está más cerca?
- `whoami` — ¿Quién soy?
- `impostor` — El impostor

## Stubs (no implementados)

| id | Nombre | Idea |
| --- | --- | --- |
| `mas-o-menos` | ¿Más o menos? | Más alto / más bajo sobre un número secreto. |
| `subasta` | Subasta de números | Pujas cercanas a un objetivo. |
| `espia` | Espía | Lugar + roles, un extraño. |
| `completa-frase` | Completá la frase | Cierres creativos + voto. |
| `mentira` | Mentira creíble | Tres datos, una mentira. |
| `dibuja` | Dibujá y adiviná | Pictionary en el celu. |
| `reflejos` | Reflejos | Toque rápido a una consigna. |
| `votacion` | Votación | ¿Quién de este grupo…? |

Para sumar uno: engine + mazo + vista + `implemented: true` en el catálogo.
La sala y el pass-and-play no se tocan.
